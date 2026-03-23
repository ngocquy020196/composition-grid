import ReactDOM from 'react-dom/client';
import {
    ATTR, PENDING,
    getState, isVisibleInDOM, calcObjectFitBounds,
    renderGridElement, createImageOverlay,
    onRenderAll, onNavigate, onInteraction, initShared,
} from './shared';
import { MSG } from '../constants/messages';
import './video'; // Video grid support (self-contained)

// ─── Constants ───────────────────────────────────────────────────────────────
// Common avatar/thumbnail indicators in class names, alt text, or src
const SKIP_PATTERNS = /avatar|icon|thumb|logo|badge|emoji|profile[-_]?(?:pic|img|photo)|favicon/i;

// ─── State ───────────────────────────────────────────────────────────────────
interface InjectedEntry {
    img: HTMLImageElement;
    container: HTMLElement;
    root: ReactDOM.Root;
    overlayDiv: HTMLDivElement;
    resizeObserver?: ResizeObserver;
}

const injectedMap = new Map<HTMLImageElement, InjectedEntry>();

// ─── Rendering ───────────────────────────────────────────────────────────────
function renderOverlay(entry: InjectedEntry) {
    const { settings } = getState();
    if (!settings.enabled) {
        entry.overlayDiv.style.display = 'none';
        entry.resizeObserver?.disconnect();
        return;
    }
    entry.overlayDiv.style.display = '';
    entry.resizeObserver?.observe(entry.img);
    renderGridElement(entry.root, settings);
}

function renderAllOverlays() {
    injectedMap.forEach((entry) => renderOverlay(entry));
}

// Register with shared event system
onRenderAll(renderAllOverlays);
onNavigate(rescanImages);
onInteraction(rescanImages);

function rescanImages() {
    document.querySelectorAll<HTMLImageElement>(
        `img:not([${ATTR}]):not([${PENDING}])`
    ).forEach(tryInjectOrDefer);
}

// ─── Cleanup Helper ──────────────────────────────────────────────────────────
function cleanupImage(img: HTMLImageElement) {
    const entry = injectedMap.get(img);
    if (!entry) return;
    try {
        entry.resizeObserver?.disconnect();
        entry.root.unmount();
        entry.overlayDiv.remove();
        img.removeAttribute(ATTR);
    } catch {
        // Node may already be removed from DOM
    }
    injectedMap.delete(img);
}

// ─── Injection ───────────────────────────────────────────────────────────────
function shouldInject(img: HTMLImageElement): boolean {
    if (img.getAttribute(ATTR) === 'true') return false;
    const { settings } = getState();
    const minSize = settings.minImageSize;

    // Cheap size check first — filters out most images before expensive calls
    if (img.width < minSize || img.height < minSize) return false;

    // Skip hidden images (display:none, visibility:hidden, opacity:0)
    if (!isVisibleInDOM(img)) return false;

    // Size checks — skip small natural dimensions
    // Some sites use spacer.gif with background-image for the real photo.
    // Only filter by natural dimensions if there's no background-image.
    const style = window.getComputedStyle(img);
    const hasBgImage = style.backgroundImage !== 'none';
    if (!hasBgImage) {
        if (img.naturalWidth > 0 && img.naturalWidth < minSize) return false;
        if (img.naturalHeight > 0 && img.naturalHeight < minSize) return false;
    }

    // Skip tiny data URIs (inline icons)
    const src = img.src || '';
    if (src.startsWith('data:') && src.length < 500) return false;

    // Skip decorative / presentation images
    if (img.getAttribute('role') === 'presentation') return false;

    // Skip circular images (likely avatars)
    const radius = parseFloat(style.borderRadius);
    if (radius >= Math.min(img.width, img.height) / 2) return false;

    // Skip images whose class, alt, or src match avatar/thumbnail patterns
    const textToCheck = `${img.className} ${img.alt} ${src}`;
    if (SKIP_PATTERNS.test(textToCheck)) return false;

    return true;
}

// Position the overlay to exactly match the image's visible area
function syncOverlayPosition(img: HTMLImageElement, overlayDiv: HTMLDivElement) {
    const bounds = calcObjectFitBounds(img, img.naturalWidth, img.naturalHeight);
    if (bounds.width <= 0 || bounds.height <= 0) return;
    overlayDiv.style.left = `${bounds.left}px`;
    overlayDiv.style.top = `${bounds.top}px`;
    overlayDiv.style.width = `${bounds.width}px`;
    overlayDiv.style.height = `${bounds.height}px`;
}

function injectGrid(img: HTMLImageElement) {
    const { tabActive } = getState();
    if (!tabActive) return;
    if (!shouldInject(img)) return;

    const overlayDiv = createImageOverlay(img);
    if (!overlayDiv) return;

    img.setAttribute(ATTR, 'true');

    // Position overlay to match image bounds (not parent bounds)
    syncOverlayPosition(img, overlayDiv);

    // Keep overlay aligned when image resizes — debounced to avoid jank during animations
    let rafId = 0;
    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => syncOverlayPosition(img, overlayDiv));
    });
    resizeObserver.observe(img);

    const root = ReactDOM.createRoot(overlayDiv);
    const entry: InjectedEntry = { img, container: img.parentElement!, root, overlayDiv, resizeObserver };

    injectedMap.set(img, entry);
    renderOverlay(entry);
}

// ─── IntersectionObserver ────────────────────────────────────────────────────
function tryInjectOrDefer(img: HTMLImageElement) {
    if (img.getAttribute(ATTR) === 'true') return;
    if (img.getAttribute(PENDING) === 'true') return;
    if (shouldInject(img)) {
        injectGrid(img);
        return;
    }

    // Image may not be loaded yet (width/height = 0 on lazy-loaded sites).
    // Wait for its load event and retry once.
    if (!img.complete) {
        img.setAttribute(PENDING, 'true');
        img.addEventListener('load', () => {
            img.removeAttribute(PENDING);
            if (shouldInject(img)) injectGrid(img);
        }, { once: true });
        return;
    }

    // Image is loaded but has zero/small dimensions (e.g. React lightbox animation).
    // Watch for resize and retry once it reaches visible size.
    const { settings } = getState();
    const minSize = settings.minImageSize;
    if (img.width < minSize || img.height < minSize) {
        img.setAttribute(PENDING, 'true');
        const ro = new ResizeObserver(() => {
            if (img.width >= minSize && img.height >= minSize) {
                ro.disconnect();
                img.removeAttribute(PENDING);
                if (shouldInject(img)) injectGrid(img);
            }
        });
        ro.observe(img);
        // Auto-cleanup after 10s to avoid memory leaks
        setTimeout(() => { ro.disconnect(); img.removeAttribute(PENDING); }, 10000);
    }
}

const intersectionObserver = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                tryInjectOrDefer(img);
                // Only stop observing if injection succeeded or a retry is pending
                if (img.getAttribute(ATTR) === 'true' || img.getAttribute(PENDING) === 'true') {
                    intersectionObserver.unobserve(img);
                }
            }
        }
    },
    { rootMargin: '200px' }
);

function observeImage(img: HTMLImageElement) {
    if (img.getAttribute(ATTR) === 'true') return;
    intersectionObserver.observe(img);
}

// ─── MutationObserver ────────────────────────────────────────────────────────
const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        // Handle lazy-load attribute changes (src, srcset, data-src, class)
        if (mutation.type === 'attributes') {
            const target = mutation.target;
            if (!(target instanceof HTMLImageElement)) continue;
            if (target.getAttribute(ATTR) === 'true') continue;
            if (target.getAttribute(PENDING) === 'true') continue;
            tryInjectOrDefer(target);
            continue;
        }

        // Handle added nodes
        for (const node of mutation.addedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const el = node as Element;

            if (el.tagName === 'IMG') {
                observeImage(el as HTMLImageElement);
            }

            // Search children for images
            const imgs = el.querySelectorAll<HTMLImageElement>('img');
            imgs.forEach(observeImage);
        }

        // Handle removed nodes — cleanup
        for (const node of mutation.removedNodes) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const el = node as Element;

            // Clean up injected images within the removed element
            el.querySelectorAll<HTMLImageElement>(`img[${ATTR}]`)
                .forEach(cleanupImage);

            // Check if the removed element itself is an injected image
            if (el.tagName === 'IMG' && el.getAttribute(ATTR) === 'true') {
                cleanupImage(el as HTMLImageElement);
            }
        }
    }
});

// ─── Context Menu Message Handler (image-specific) ───────────────────────────
chrome.runtime.onMessage.addListener((message: { type: string; srcUrl?: string }) => {
    if (message.type !== MSG.TOGGLE_GRID || !message.srcUrl) return;

    // Find the image by its src URL
    const images = document.querySelectorAll<HTMLImageElement>('img');
    let targetImg: HTMLImageElement | null = null;

    for (const img of images) {
        if (img.src === message.srcUrl || img.currentSrc === message.srcUrl) {
            targetImg = img;
            break;
        }
    }

    // Fallback: if srcUrl matched a spacer/presentation image.
    // look for the real sibling image in the same parent
    if (targetImg && targetImg.getAttribute('role') === 'presentation') {
        const parent = targetImg.parentElement;
        if (parent) {
            const sibling = Array.from(parent.querySelectorAll<HTMLImageElement>('img'))
                .find(img => img !== targetImg && img.getAttribute('role') !== 'presentation');
            if (sibling) targetImg = sibling;
        }
    }

    if (!targetImg) return;

    {
        const img = targetImg;
        const entry = injectedMap.get(img);
        const { settings } = getState();

        if (entry) {
            const isHidden = !settings.enabled;
            if (isHidden) {
                // Grid was injected but hidden → enable and show
                chrome.storage.sync.set({ enabled: true });
            } else {
                // Grid is visible → remove it
                cleanupImage(img);
            }
        } else {
            // Not injected yet → enable and inject
            if (!settings.enabled) {
                chrome.storage.sync.set({ enabled: true });
            }
            injectGrid(img);
        }
    }
});

// ─── Initialization ──────────────────────────────────────────────────────────
async function init() {
    const allowed = await initShared();
    if (!allowed) return;

    // Process existing images via IntersectionObserver
    const existingImages = document.querySelectorAll<HTMLImageElement>('img');
    existingImages.forEach(observeImage);

    // Watch for new images and lazy-load attribute changes
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'srcset', 'data-src', 'data-lazy-src', 'data-original', 'class'],
    });

}

// Start
init();

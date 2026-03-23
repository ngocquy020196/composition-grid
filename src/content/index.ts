import React from 'react';
import ReactDOM from 'react-dom/client';
import GridOverlay from '../components/GridOverlay';
import { Settings, DEFAULT_SETTINGS } from '../types';
import { getSettings, onSettingsChanged } from '../utils/storage';

// ─── State ───────────────────────────────────────────────────────────────────
let currentSettings: Settings = { ...DEFAULT_SETTINGS };

interface InjectedEntry {
    img: HTMLImageElement;
    container: HTMLElement;
    root: ReactDOM.Root;
    overlayDiv: HTMLDivElement;
    resizeObserver?: ResizeObserver;
}

const injectedMap = new Map<HTMLImageElement, InjectedEntry>();

// ─── Constants ───────────────────────────────────────────────────────────────
const ATTR = 'data-grid-injected';

// Common avatar/thumbnail indicators in class names, alt text, or src
const SKIP_PATTERNS = /avatar|icon|thumb|logo|badge|emoji|profile[-_]?(?:pic|img|photo)|favicon/i;

// ─── Rendering ───────────────────────────────────────────────────────────────
function renderOverlay(entry: InjectedEntry, settings: Settings) {
    if (!settings.enabled) {
        entry.overlayDiv.style.display = 'none';
        return;
    }
    entry.overlayDiv.style.display = '';
    entry.root.render(
        React.createElement(GridOverlay, {
            gridTypes: settings.gridTypes,
            lineColor: settings.lineColor,
            dotColor: settings.dotColor,
            showDots: settings.showDots,
            dotSize: settings.dotSize,
            lineSize: settings.lineSize,
            lineStyle: settings.lineStyle,
            spiralOrientation: settings.spiralOrientation,
        })
    );
}

function renderAllOverlays() {
    injectedMap.forEach((entry) => renderOverlay(entry, currentSettings));
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
function isElementVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;
    return true;
}

function isVisibleInDOM(el: HTMLElement): boolean {
    let current: HTMLElement | null = el;
    while (current) {
        if (!isElementVisible(current)) return false;
        current = current.parentElement;
    }
    return true;
}

function shouldInject(img: HTMLImageElement): boolean {
    if (img.getAttribute(ATTR) === 'true') return false;
    const minSize = currentSettings.minImageSize;

    // Skip hidden images (display:none, visibility:hidden, opacity:0)
    if (!isVisibleInDOM(img)) return false;

    // Size checks — skip small images
    // Some sites use spacer.gif with background-image for the real photo.
    // Only filter by natural dimensions if there's no background-image.
    const style = window.getComputedStyle(img);
    const hasBgImage = style.backgroundImage !== 'none';
    if (!hasBgImage) {
        if (img.naturalWidth > 0 && img.naturalWidth < minSize) return false;
        if (img.naturalHeight > 0 && img.naturalHeight < minSize) return false;
    }
    if (img.width < minSize || img.height < minSize) return false;

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

// Calculate the actual visible image bounds, accounting for object-fit
function getVisibleImageBounds(img: HTMLImageElement) {
    const elW = img.offsetWidth;
    const elH = img.offsetHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // If natural dimensions are unknown, fall back to element bounds
    if (!natW || !natH || !elW || !elH) {
        return { left: img.offsetLeft, top: img.offsetTop, width: elW, height: elH };
    }

    const objectFit = window.getComputedStyle(img).objectFit || 'fill';
    let renderW = elW;
    let renderH = elH;

    if (objectFit === 'contain' || objectFit === 'scale-down') {
        const natRatio = natW / natH;
        const elRatio = elW / elH;
        if (natRatio > elRatio) {
            // Width-constrained
            renderW = elW;
            renderH = elW / natRatio;
        } else {
            // Height-constrained
            renderH = elH;
            renderW = elH * natRatio;
        }
    } else if (objectFit === 'cover') {
        const natRatio = natW / natH;
        const elRatio = elW / elH;
        if (natRatio > elRatio) {
            renderH = elH;
            renderW = elH * natRatio;
        } else {
            renderW = elW;
            renderH = elW / natRatio;
        }
    }
    // For 'fill' or 'none', renderW/renderH stays as elW/elH

    const left = img.offsetLeft + (elW - renderW) / 2;
    const top = img.offsetTop + (elH - renderH) / 2;

    return { left, top, width: renderW, height: renderH };
}

// Position the overlay to exactly match the image's visible area
function syncOverlayPosition(img: HTMLImageElement, overlayDiv: HTMLDivElement) {
    const bounds = getVisibleImageBounds(img);
    if (bounds.width <= 0 || bounds.height <= 0) return;
    overlayDiv.style.left = `${bounds.left}px`;
    overlayDiv.style.top = `${bounds.top}px`;
    overlayDiv.style.width = `${bounds.width}px`;
    overlayDiv.style.height = `${bounds.height}px`;
}

function injectGrid(img: HTMLImageElement) {
    if (!shouldInject(img)) return;

    img.setAttribute(ATTR, 'true');

    // Instead of wrapping the image (which breaks Instagram/social media layouts),
    // we make the image's parent position:relative and inject the overlay as a sibling.
    const parent = img.parentElement;
    if (!parent) return;

    // Skip if this parent already has a grid overlay (e.g. lightbox with multiple img tags)
    if (parent.querySelector('.cg-grid-overlay-root')) return;

    // Ensure the parent is a positioning context
    const parentPosition = window.getComputedStyle(parent).position;
    if (parentPosition === 'static') {
        parent.style.position = 'relative';
    }

    // Create a stacking context so the overlay's z-index doesn't escape above modals
    parent.style.isolation = 'isolate';

    // Create overlay root as a sibling of the image
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'cg-grid-overlay-root';
    parent.appendChild(overlayDiv);

    // Position overlay to match image bounds (not parent bounds)
    syncOverlayPosition(img, overlayDiv);

    // Keep overlay aligned when image resizes (e.g. modal/lightbox window resize)
    const resizeObserver = new ResizeObserver(() => syncOverlayPosition(img, overlayDiv));
    resizeObserver.observe(img);

    const root = ReactDOM.createRoot(overlayDiv);
    const entry: InjectedEntry = { img, container: parent, root, overlayDiv, resizeObserver };

    injectedMap.set(img, entry);
    renderOverlay(entry, currentSettings);
}

// ─── IntersectionObserver ────────────────────────────────────────────────────
const PENDING = 'data-grid-pending';

function tryInjectOrDefer(img: HTMLImageElement) {
    if (img.getAttribute(ATTR) === 'true') return;
    if (shouldInject(img)) {
        injectGrid(img);
        return;
    }

    // Image may not be loaded yet (width/height = 0 on lazy-loaded sites).
    // Wait for its load event and retry once.
    // Use a pending flag to avoid attaching multiple listeners.
    if (!img.complete && img.getAttribute(PENDING) !== 'true') {
        img.setAttribute(PENDING, 'true');
        img.addEventListener('load', () => {
            img.removeAttribute(PENDING);
            if (shouldInject(img)) injectGrid(img);
        }, { once: true });
    }
}

const intersectionObserver = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                tryInjectOrDefer(img);
                intersectionObserver.unobserve(img);
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
        // Handle src attribute changes (lazy-loading sites swap src from placeholder to real URL)
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            const img = mutation.target as HTMLImageElement;
            if (img.tagName === 'IMG' && img.getAttribute(ATTR) !== 'true') {
                tryInjectOrDefer(img);
            }
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

// ─── Context Menu Message Handler ────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: { type: string; srcUrl?: string }) => {
    // Keyboard shortcut: toggle all grids on the page
    if (message.type === 'TOGGLE_GRID_ALL') {
        currentSettings.enabled = !currentSettings.enabled;
        chrome.storage.sync.set({ enabled: currentSettings.enabled });
        renderAllOverlays();
        return;
    }

    // Keyboard shortcut: toggle dots
    if (message.type === 'TOGGLE_DOTS') {
        currentSettings.showDots = !currentSettings.showDots;
        chrome.storage.sync.set({ showDots: currentSettings.showDots });
        renderAllOverlays();
        return;
    }

    // Keyboard shortcut: toggle line style (solid ↔ dashed)
    if (message.type === 'TOGGLE_LINE_STYLE') {
        currentSettings.lineStyle = currentSettings.lineStyle === 'solid' ? 'dashed' : 'solid';
        chrome.storage.sync.set({ lineStyle: currentSettings.lineStyle });
        renderAllOverlays();
        return;
    }

    // Keyboard shortcut: toggle color (colorA ↔ colorB)
    if (message.type === 'TOGGLE_COLOR') {
        const { toggleColorA, toggleColorB } = currentSettings;
        const newColor = currentSettings.lineColor === toggleColorA ? toggleColorB : toggleColorA;
        currentSettings.lineColor = newColor;
        currentSettings.dotColor = newColor;
        chrome.storage.sync.set({ lineColor: newColor, dotColor: newColor });
        renderAllOverlays();
        return;
    }

    if (message.type !== 'TOGGLE_GRID' || !message.srcUrl) return;

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

        if (entry) {
            // Already injected — check if it's visible or hidden
            const isHidden = !currentSettings.enabled;

            if (isHidden) {
                // Grid was injected but hidden (enabled=false) → enable and show
                currentSettings.enabled = true;
                chrome.storage.sync.set({ enabled: true });
                renderAllOverlays();
            } else {
                // Grid is visible → remove it
                cleanupImage(img);
            }
        } else {
            // Not injected yet → enable and inject
            if (!currentSettings.enabled) {
                currentSettings.enabled = true;
                chrome.storage.sync.set({ enabled: true });
                renderAllOverlays();
            }
            injectGrid(img);
        }
    }
});

// ─── Initialization ──────────────────────────────────────────────────────────
async function init() {
    // Load settings
    currentSettings = await getSettings();

    // Check site mode — decide if grid should run on this site
    const currentHost = window.location.hostname;

    if (currentSettings.siteMode === 'block') {
        const blocked = currentSettings.blockList.some((site: string) => currentHost.includes(site));
        if (blocked) return;
    }
    if (currentSettings.siteMode === 'allow') {
        const allowed = currentSettings.allowList.some((site: string) => currentHost.includes(site));
        if (!allowed) return;
    }

    // Listen for settings changes
    onSettingsChanged((newSettings) => {
        currentSettings = newSettings;
        renderAllOverlays();
    });

    // Process existing images via IntersectionObserver
    const existingImages = document.querySelectorAll<HTMLImageElement>('img');
    existingImages.forEach(observeImage);

    // Watch for new images and src attribute changes (lazy loading)
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src'],
    });
}

// Start
init();


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
    if (img.naturalWidth > 0 && img.naturalWidth < minSize) return false;
    if (img.naturalHeight > 0 && img.naturalHeight < minSize) return false;
    if (img.width < minSize || img.height < minSize) return false;

    // Skip tiny data URIs (inline icons)
    const src = img.src || '';
    if (src.startsWith('data:') && src.length < 500) return false;

    // Skip decorative / presentation images
    if (img.getAttribute('role') === 'presentation') return false;

    // Skip circular images (likely avatars)
    const style = window.getComputedStyle(img);
    const radius = parseFloat(style.borderRadius);
    if (radius >= Math.min(img.width, img.height) / 2) return false;

    // Skip images whose class, alt, or src match avatar/thumbnail patterns
    const textToCheck = `${img.className} ${img.alt} ${src}`;
    if (SKIP_PATTERNS.test(textToCheck)) return false;

    return true;
}

function injectGrid(img: HTMLImageElement) {
    if (!shouldInject(img)) return;

    img.setAttribute(ATTR, 'true');

    // Instead of wrapping the image (which breaks Instagram/social media layouts),
    // we make the image's parent position:relative and inject the overlay as a sibling.
    const parent = img.parentElement;
    if (!parent) return;

    // Ensure the parent is a positioning context
    const parentPosition = window.getComputedStyle(parent).position;
    if (parentPosition === 'static') {
        parent.style.position = 'relative';
    }

    // Create overlay root as a sibling of the image
    const overlayDiv = document.createElement('div');
    overlayDiv.className = 'cg-grid-overlay-root';
    parent.appendChild(overlayDiv);

    const root = ReactDOM.createRoot(overlayDiv);
    const entry: InjectedEntry = { img, container: parent, root, overlayDiv };

    injectedMap.set(img, entry);
    renderOverlay(entry, currentSettings);
}

// ─── IntersectionObserver ────────────────────────────────────────────────────
const intersectionObserver = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                if (shouldInject(img)) {
                    injectGrid(img);
                }
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
function checkInjectedVisibility() {
    injectedMap.forEach((_entry, img) => {
        if (!isVisibleInDOM(img)) {
            cleanupImage(img);
        }
    });
}

const mutationObserver = new MutationObserver((mutations) => {
    let needsVisibilityCheck = false;

    for (const mutation of mutations) {
        // Handle attribute changes (style/class) — may hide images
        if (mutation.type === 'attributes') {
            needsVisibilityCheck = true;
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

    if (needsVisibilityCheck) {
        checkInjectedVisibility();
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

    if (message.type !== 'TOGGLE_GRID' || !message.srcUrl) return;

    // Find the image by its src URL
    const images = document.querySelectorAll<HTMLImageElement>('img');
    for (const img of images) {
        if (img.src !== message.srcUrl && img.currentSrc !== message.srcUrl) continue;

        const entry = injectedMap.get(img);

        if (entry) {
            // Already injected — check if it's visible or hidden
            const isHidden = entry.overlayDiv.style.display === 'none';

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
        break;
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

    // Watch for new images and attribute changes (style/class)
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden'],
    });
}

// Start
init();


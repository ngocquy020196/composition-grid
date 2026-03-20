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
const MIN_SIZE = 80;
const ATTR = 'data-grid-injected';

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
function shouldInject(img: HTMLImageElement): boolean {
    if (img.getAttribute(ATTR) === 'true') return false;
    if (img.naturalWidth > 0 && img.naturalWidth < MIN_SIZE) return false;
    if (img.naturalHeight > 0 && img.naturalHeight < MIN_SIZE) return false;
    if (img.width < MIN_SIZE || img.height < MIN_SIZE) return false;
    // Skip tiny icons and avatars
    const src = img.src || '';
    if (src.startsWith('data:') && src.length < 500) return false;
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
const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
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

    // Listen for settings changes
    onSettingsChanged((newSettings) => {
        currentSettings = newSettings;
        renderAllOverlays();
    });

    // Process existing images via IntersectionObserver
    const existingImages = document.querySelectorAll<HTMLImageElement>('img');
    existingImages.forEach(observeImage);

    // Watch for new images
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Start
init();


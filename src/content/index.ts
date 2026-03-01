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
            gridType: settings.gridType,
            lineColor: settings.lineColor,
            dotColor: settings.dotColor,
            showDots: settings.showDots,
            dotSize: settings.dotSize,
            lineSize: settings.lineSize,
        })
    );
}

function renderAllOverlays() {
    injectedMap.forEach((entry) => renderOverlay(entry, currentSettings));
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

function cleanupEntry(entry: InjectedEntry) {
    try {
        entry.root.unmount();
        entry.overlayDiv.remove();
        entry.img.removeAttribute(ATTR);
        injectedMap.delete(entry.img);
    } catch {
        // Node may already be removed from DOM
    }
}

// ─── Image Discovery ─────────────────────────────────────────────────────────
function processImages(root: Element | Document = document) {
    const images = root.querySelectorAll<HTMLImageElement>('img');
    images.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) {
            injectGrid(img);
        } else {
            img.addEventListener(
                'load',
                () => injectGrid(img),
                { once: true, passive: true }
            );
        }
    });
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

            // Check if this element contains injected images
            const imgs = el.querySelectorAll<HTMLImageElement>(`img[${ATTR}]`);
            imgs.forEach((img) => {
                const entry = injectedMap.get(img);
                if (entry) {
                    try {
                        entry.root.unmount();
                    } catch { /* ignored */ }
                    injectedMap.delete(img);
                }
            });

            // Check if the removed element itself is an injected image
            if (el.tagName === 'IMG' && el.getAttribute(ATTR) === 'true') {
                const entry = injectedMap.get(el as HTMLImageElement);
                if (entry) {
                    try {
                        entry.root.unmount();
                    } catch { /* ignored */ }
                    injectedMap.delete(el as HTMLImageElement);
                }
            }
        }
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

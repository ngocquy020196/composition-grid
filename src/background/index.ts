// Background service worker for Composition Grid extension
// Handles right-click context menu on images with i18n support

import { t } from '../i18n';
import { Language } from '../types';

const MENU_ID = 'toggle-grid';

function updateMenuTitle(lang: Language) {
    chrome.contextMenus.update(MENU_ID, {
        title: t('toggleGrid', lang),
    });
}

chrome.runtime.onInstalled.addListener(() => {
    // Create context menu with default English title
    chrome.contextMenus.create({
        id: MENU_ID,
        title: t('toggleGrid', 'en'),
        contexts: ['image'],
    });

    // Read saved language and update title
    chrome.storage.sync.get({ language: 'en' }, (result) => {
        updateMenuTitle(result.language as Language);
    });
});

// Listen for language setting changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.language) {
        updateMenuTitle(changes.language.newValue as Language);
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID && tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_GRID',
            srcUrl: info.srcUrl,
        });
    }
});

// Keyboard shortcut handler (Alt+G)
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-grid') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_GRID_ALL' });
            }
        });
    }
});

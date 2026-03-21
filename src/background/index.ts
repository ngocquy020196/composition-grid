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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== MENU_ID || !tab?.id || !tab.url) return;

    // Check site mode
    const result = await chrome.storage.sync.get({ siteMode: 'all', blockList: [], allowList: [], language: 'en' });
    const url = new URL(tab.url);
    const host = url.hostname;
    const isBlocked =
        (result.siteMode === 'block' && (result.blockList as string[]).some((s) => host.includes(s))) ||
        (result.siteMode === 'allow' && !(result.allowList as string[]).some((s) => host.includes(s)));

    if (isBlocked) {
        const msg = t('siteBlockedAlert', result.language as Language);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (alertMsg: string) => alert(alertMsg),
            args: [msg],
        });
        return;
    }

    chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_GRID',
        srcUrl: info.srcUrl,
    });
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
    const messageMap: Record<string, string> = {
        'toggle-grid': 'TOGGLE_GRID_ALL',
        'toggle-dots': 'TOGGLE_DOTS',
        'toggle-line-style': 'TOGGLE_LINE_STYLE',
    };

    const type = messageMap[command];
    if (!type) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type });
        }
    });
});

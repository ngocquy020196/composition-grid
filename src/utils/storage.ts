import { Settings, DEFAULT_SETTINGS } from '../types';

export async function getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
        chrome.storage.sync.get(
            DEFAULT_SETTINGS as unknown as Record<string, unknown>,
            (result) => {
                resolve(result as unknown as Settings);
            }
        );
    });
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.sync.set(settings as Record<string, unknown>, resolve);
    });
}

export function onSettingsChanged(
    callback: (newSettings: Settings) => void
): () => void {
    const listener = (
        _changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
    ) => {
        if (areaName !== 'sync') return;
        getSettings().then(callback);
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, DEFAULT_SETTINGS } from '../types';
import { getSettings, saveSettings, onSettingsChanged } from '../utils/storage';

const DEBOUNCE_MS = 300;

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);
    const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        getSettings().then((s) => {
            setSettings(s);
            setLoaded(true);
        });

        const unsubscribe = onSettingsChanged((newSettings) => {
            setSettings(newSettings);
        });

        return () => {
            unsubscribe();
            // Flush all pending debounced saves on unmount
            debounceTimers.current.forEach((timer) => clearTimeout(timer));
        };
    }, []);

    const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
        // Update local state immediately for responsive UI
        setSettings((prev) => ({ ...prev, [key]: value }));

        // Debounce the storage write to avoid Chrome rate limits
        const existing = debounceTimers.current.get(key);
        if (existing) clearTimeout(existing);

        debounceTimers.current.set(
            key,
            setTimeout(() => {
                saveSettings({ [key]: value });
                debounceTimers.current.delete(key);
            }, DEBOUNCE_MS)
        );
    }, []);
    const reset = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        saveSettings(DEFAULT_SETTINGS);
    }, []);

    return { settings, loaded, update, reset };
}

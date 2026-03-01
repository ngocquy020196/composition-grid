import React, { useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS, GridType, Language } from '../types';
import { getSettings, saveSettings } from '../utils/storage';
import { t } from '../i18n';

const App: React.FC = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getSettings().then((s) => {
            setSettings(s);
            setLoaded(true);
        });
    }, []);

    const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        const next = { ...settings, [key]: value };
        setSettings(next);
        saveSettings({ [key]: value });
    };

    const lang = settings.language;

    if (!loaded) return null;

    return (
        <div className="popup-container">
            {/* Header */}
            <header className="popup-header">
                <div className="header-icon">
                    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="34" height="34" rx="8" stroke="url(#grad)" strokeWidth="2" />
                        <line x1="12.33" y1="1" x2="12.33" y2="35" stroke="url(#grad)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="23.67" y1="1" x2="23.67" y2="35" stroke="url(#grad)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="1" y1="12.33" x2="35" y2="12.33" stroke="url(#grad)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="1" y1="23.67" x2="35" y2="23.67" stroke="url(#grad)" strokeWidth="1.2" opacity="0.6" />
                        <circle cx="12.33" cy="12.33" r="2" fill="#fbbf24" />
                        <circle cx="23.67" cy="12.33" r="2" fill="#fbbf24" />
                        <circle cx="12.33" cy="23.67" r="2" fill="#fbbf24" />
                        <circle cx="23.67" cy="23.67" r="2" fill="#fbbf24" />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="36" y2="36">
                                <stop offset="0%" stopColor="#a78bfa" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="header-text">
                    <h1>{t('appName', lang)}</h1>
                    <p>{t('appTagline', lang)}</p>
                </div>
            </header>

            {/* Master toggle */}
            <div className="setting-row toggle-row">
                <span className="setting-label">{t('enableGrid', lang)}</span>
                <button
                    className={`toggle-btn ${settings.enabled ? 'active' : ''}`}
                    onClick={() => update('enabled', !settings.enabled)}
                    aria-label="Toggle grid"
                >
                    <span className="toggle-knob" />
                    <span className="toggle-text">
                        {settings.enabled ? t('enabled', lang) : t('disabled', lang)}
                    </span>
                </button>
            </div>

            {/* Master toggle */}
            {settings.enabled && (
                <div className="setting-row toggle-row">
                    <span className="setting-label">{t('showDots', lang)}</span>
                    <button
                        className={`toggle-btn ${settings.showDots ? 'active' : ''}`}
                        onClick={() => update('showDots', !settings.showDots)}
                        aria-label="Toggle dots"
                    >
                        <span className="toggle-knob" />
                        <span className="toggle-text">
                            {settings.showDots ? t('enabled', lang) : t('disabled', lang)}
                        </span>
                    </button>
                </div>
            )}
            <div className="divider" />

            {/* Grid type */}
            <div className="setting-row">
                <span className="setting-label">{t('gridType', lang)}</span>
                <div className="segmented-control">
                    <button
                        className={settings.gridType === 'thirds' ? 'seg-active' : ''}
                        onClick={() => update('gridType', 'thirds' as GridType)}
                    >
                        {t('thirds', lang)}
                    </button>
                    <button
                        className={settings.gridType === 'golden' ? 'seg-active' : ''}
                        onClick={() => update('gridType', 'golden' as GridType)}
                    >
                        {t('golden', lang)}
                    </button>
                </div>
            </div>

            {/* Line color */}
            <div className="setting-row">
                <span className="setting-label">{t('lineColor', lang)}</span>
                <div className="color-picker-wrapper">
                    <div
                        className="color-swatch"
                        style={{ backgroundColor: settings.lineColor }}
                    />
                    <input
                        type="color"
                        value={settings.lineColor}
                        onChange={(e) => update('lineColor', e.target.value)}
                    />
                </div>
            </div>

            {/* Dot color */}
            <div className="setting-row">
                <span className="setting-label">{t('dotColor', lang)}</span>
                <div className="color-picker-wrapper">
                    <div
                        className="color-swatch"
                        style={{ backgroundColor: settings.dotColor }}
                    />
                    <input
                        type="color"
                        value={settings.dotColor}
                        onChange={(e) => update('dotColor', e.target.value)}
                    />
                </div>
            </div>

            {/* Dot size */}
            {settings.showDots && (
                <div className="setting-row">
                    <span className="setting-label">{t('dotSize', lang)}</span>
                    <div className="slider-wrapper">
                        <input
                            type="range"
                            min={2}
                            max={20}
                            step={1}
                            value={settings.dotSize}
                            onChange={(e) => update('dotSize', Number(e.target.value))}
                        />
                        <span className="slider-value">{settings.dotSize}px</span>
                    </div>
                </div>
            )}

            {/* Line size */}
            <div className="setting-row">
                <span className="setting-label">{t('lineSize', lang)}</span>
                <div className="slider-wrapper">
                    <input
                        type="range"
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={settings.lineSize}
                        onChange={(e) => update('lineSize', Number(e.target.value))}
                    />
                    <span className="slider-value">{settings.lineSize}px</span>
                </div>
            </div>

            <div className="divider" />

            {/* Language */}
            <div className="setting-row">
                <span className="setting-label">{t('language', lang)}</span>
                <div className="segmented-control">
                    <button
                        className={settings.language === 'en' ? 'seg-active' : ''}
                        onClick={() => update('language', 'en' as Language)}
                    >
                        EN
                    </button>
                    <button
                        className={settings.language === 'vi' ? 'seg-active' : ''}
                        onClick={() => update('language', 'vi' as Language)}
                    >
                        VI
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="popup-footer">
                <span>{t('version', lang)} 1.0.0</span>
                <br />
                <span>
                    Powered by <a href={t('authorWebsite', lang)} target="_blank" rel="noopener noreferrer">{t('authorName', lang)}</a>
                </span>
            </footer>
        </div>
    );
};

export default App;

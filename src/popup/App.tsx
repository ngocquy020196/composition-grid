import React, { useEffect } from 'react';
import { GridType, LineStyle, SpiralOrientation, Theme } from '../types';
import { useSettings } from '../hooks/useSettings';
import { t } from '../i18n';

const App: React.FC = () => {
    const { settings, loaded, update, reset } = useSettings();
    const lang = settings.language;

    // Apply theme to document root
    useEffect(() => {
        document.documentElement.dataset.theme = settings.theme;
    }, [settings.theme]);

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

            {/* Image Overlay toggle */}
            <div className="setting-row toggle-row">
                <div className="setting-label-group">
                    <span className="setting-label">{t('enableGrid', lang)}</span>
                    <span className="shortcut-hint">
                        <kbd>Alt</kbd><span className="shortcut-plus">+</span><kbd>I</kbd>
                    </span>
                </div>
                <button
                    className={`toggle-btn ${settings.enabled ? 'active' : ''}`}
                    onClick={() => update('enabled', !settings.enabled)}
                    aria-label="Toggle image overlay"
                >
                    <span className="toggle-knob" />
                    <span className="toggle-text">
                        {settings.enabled ? t('enabled', lang) : t('disabled', lang)}
                    </span>
                </button>
            </div>

            {/* Video Overlay toggle */}
            <div className="setting-row toggle-row">
                <div className="setting-label-group">
                    <span className="setting-label">{t('videoEnabled', lang)}</span>
                    <span className="shortcut-hint">
                        <kbd>Alt</kbd><span className="shortcut-plus">+</span><kbd>V</kbd>
                    </span>
                </div>
                <button
                    className={`toggle-btn ${settings.videoEnabled ? 'active' : ''}`}
                    onClick={() => update('videoEnabled', !settings.videoEnabled)}
                    aria-label="Toggle video overlay"
                >
                    <span className="toggle-knob" />
                    <span className="toggle-text">
                        {settings.videoEnabled ? t('enabled', lang) : t('disabled', lang)}
                    </span>
                </button>
            </div>

            {/* Show dots toggle */}
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
            <div className="divider" />

            {/* Grid type (multi-select) */}
            <div className="setting-row setting-row-grid">
                <span className="setting-label">{t('gridType', lang)}</span>
                <div className="grid-type-selector">
                    {(['thirds', 'golden', 'fibonacci', 'triangle'] as GridType[]).map((type) => (
                        <button
                            key={type}
                            className={settings.gridTypes.includes(type) ? 'seg-active' : ''}
                            onClick={() => {
                                const current = settings.gridTypes;
                                const newTypes = current.includes(type)
                                    ? current.filter((t) => t !== type)
                                    : [...current, type];
                                // Ensure at least one type is selected
                                if (newTypes.length > 0) {
                                    update('gridTypes', newTypes);
                                }
                            }}
                        >
                            {t(type, lang)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Spiral orientation (only when fibonacci is selected) */}
            {settings.gridTypes.includes('fibonacci') && (
                <div className="setting-row">
                    <span className="setting-label">{t('spiralOrientation', lang)}</span>
                    <div className="segmented-control">
                        {([0, 1, 2, 3] as SpiralOrientation[]).map((orient) => (
                            <button
                                key={orient}
                                className={settings.spiralOrientation === orient ? 'seg-active' : ''}
                                onClick={() => update('spiralOrientation', orient)}
                                title={['↱ Top-Left', '↲ Top-Right', '↳ Bottom-Right', '↰ Bottom-Left'][orient]}
                            >
                                {['↱', '↲', '↳', '↰'][orient]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Dot color & size (only when dots are enabled) */}
            {settings.showDots && (
                <>
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
                </>
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

            {/* Line style */}
            <div className="setting-row">
                <div className="setting-label-group">
                    <span className="setting-label">{t('lineStyle', lang)}</span>
                    <span className="shortcut-hint">
                        <kbd>Alt</kbd><span className="shortcut-plus">+</span><kbd>L</kbd>
                    </span>
                </div>
                <div className="segmented-control">
                    {(['solid', 'dashed'] as LineStyle[]).map((style) => (
                        <button
                            key={style}
                            className={settings.lineStyle === style ? 'seg-active' : ''}
                            onClick={() => update('lineStyle', style)}
                        >
                            {t(style, lang)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Colors (Alt+C) */}
            <div className="setting-row setting-row-quickcolor">
                <div className="setting-row-top">
                    <div className="setting-label-group">
                        <span className="setting-label">{t('quickColor', lang)}</span>
                        <span className="shortcut-hint">
                            <kbd>Alt</kbd><span className="shortcut-plus">+</span><kbd>C</kbd>
                        </span>
                    </div>
                    <div className="toggle-colors-picker">
                        <div className="color-picker-wrapper">
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: settings.toggleColorA }}
                            />
                            <input
                                type="color"
                                value={settings.toggleColorA}
                                onChange={(e) => update('toggleColorA', e.target.value)}
                            />
                        </div>
                        <span className="toggle-colors-swap">⇄</span>
                        <div className="color-picker-wrapper">
                            <div
                                className="color-swatch"
                                style={{ backgroundColor: settings.toggleColorB }}
                            />
                            <input
                                type="color"
                                value={settings.toggleColorB}
                                onChange={(e) => update('toggleColorB', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <p className="setting-hint">{t('quickColorHint', lang)}</p>
            </div>

            {/* Min image size */}
            <div className="setting-row">
                <span className="setting-label">{t('minImageSize', lang)}</span>
                <div className="slider-wrapper">
                    <input
                        type="range"
                        min={50}
                        max={500}
                        step={50}
                        value={settings.minImageSize}
                        onChange={(e) => update('minImageSize', Number(e.target.value))}
                    />
                    <span className="slider-value">{settings.minImageSize}px</span>
                </div>
            </div>

            {/* Action buttons — Site Rules left, Reset right */}
            <div className="setting-row">
                <button
                    className="reset-btn active-btn"
                    onClick={async () => {
                        const optUrl = chrome.runtime.getURL('options.html');
                        const allTabs = await chrome.tabs.query({});
                        const existing = allTabs.find((t) => t.url?.startsWith(optUrl));
                        if (existing?.id) {
                            chrome.tabs.update(existing.id, { url: optUrl + '#sites', active: true });
                        } else {
                            chrome.tabs.create({ url: optUrl + '#sites' });
                        }
                    }}
                >
                    {t('tabSiteRules', lang)}
                </button>
                <button className="reset-btn" onClick={reset}>
                    {t('resetSettings', lang)}
                </button>
            </div>

            <div className="divider" />

            {/* Theme */}
            <div className="setting-row">
                <span className="setting-label">{t('theme', lang)}</span>
                <div className="segmented-control">
                    {(['dark', 'light'] as Theme[]).map((themeOption) => (
                        <button
                            key={themeOption}
                            className={settings.theme === themeOption ? 'seg-active' : ''}
                            onClick={() => update('theme', themeOption)}
                        >
                            {t(themeOption, lang)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Language */}
            <div className="setting-row">
                <span className="setting-label">{t('language', lang)}</span>
                <div className="segmented-control">
                    <button
                        className={settings.language === 'en' ? 'seg-active' : ''}
                        onClick={() => update('language', 'en')}
                    >
                        EN
                    </button>
                    <button
                        className={settings.language === 'vi' ? 'seg-active' : ''}
                        onClick={() => update('language', 'vi')}
                    >
                        VI
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="popup-footer">
                <span>{t('version', lang)} {chrome.runtime.getManifest().version}</span>
                <br />
                <span>
                    Powered by <a href={t('authorWebsite', lang)} target="_blank" rel="noopener noreferrer">{t('authorName', lang)}</a>
                </span>
            </footer>
        </div>
    );
};

export default App;

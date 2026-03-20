import { Language } from '../types';

const translations = {
    appName: {
        en: 'Composition Grid',
        vi: 'Lưới Bố Cục',
    },
    appTagline: {
        en: 'Composition Guides for Every Shot',
        vi: 'Hướng Dẫn Bố Cục Cho Mọi Bức Ảnh',
    },
    enableGrid: {
        en: 'Enable Grid',
        vi: 'Bật Lưới',
    },
    shortcutHint: {
        en: 'to toggle quickly',
        vi: 'bật/tắt nhanh',
    },
    gridType: {
        en: 'Grid Type',
        vi: 'Loại Lưới',
    },
    showDots: {
        en: 'Show Dots',
        vi: 'Hiển Thị Chấm',
    },
    thirds: {
        en: 'Rule of Thirds',
        vi: 'Quy Tắc 1/3',
    },
    golden: {
        en: 'Golden Ratio',
        vi: 'Tỷ Lệ Vàng',
    },
    fibonacci: {
        en: 'Fibonacci Spiral',
        vi: 'Xoắn Ốc Fibonacci',
    },
    triangle: {
        en: 'Triangle',
        vi: 'Tam Giác',
    },
    spiralOrientation: {
        en: 'Spiral Direction',
        vi: 'Hướng Xoắn Ốc',
    },
    toggleGrid: {
        en: 'Toggle Composition Grid',
        vi: 'Bật/Tắt Lưới Bố Cục',
    },
    lineColor: {
        en: 'Line Color',
        vi: 'Màu Đường Kẻ',
    },
    dotColor: {
        en: 'Dot Color',
        vi: 'Màu Chấm',
    },
    dotSize: {
        en: 'Dot Size',
        vi: 'Kích Thước Chấm',
    },
    lineSize: {
        en: 'Line Width',
        vi: 'Độ Dày Đường Kẻ',
    },
    language: {
        en: 'Language',
        vi: 'Ngôn Ngữ',
    },
    enabled: {
        en: 'On',
        vi: 'Bật',
    },
    disabled: {
        en: 'Off',
        vi: 'Tắt',
    },
    version: {
        en: 'Version',
        vi: 'Phiên Bản',
    },
    author: {
        en: 'Author',
        vi: 'Tác Giả',
    },
    authorName: {
        en: 'Quy Nguyen',
        vi: 'Quy Nguyen',
    },
    authorWebsite: {
        en: 'https://ngocquy.dev',
        vi: 'https://ngocquy.dev',
    },
    authorEmail: {
        en: 'contact@ngocquy.dev',
        vi: 'contact@ngocquy.dev',
    },
} as const satisfies Record<string, Record<Language, string>>;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
    return translations[key][lang];
}


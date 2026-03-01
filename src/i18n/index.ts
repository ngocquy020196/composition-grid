import { Language } from '../types';

const translations: Record<string, Record<Language, string>> = {
    appName: {
        en: 'Composition Grid',
        vi: 'Lưới Bố Cục',
    },
    appTagline: {
        en: 'Rule of Thirds & Golden Ratio',
        vi: 'Quy Tắc 1/3 & Tỷ Lệ Vàng',
    },
    enableGrid: {
        en: 'Enable Grid',
        vi: 'Bật Lưới',
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
};

export function t(key: string, lang: Language): string {
    return translations[key]?.[lang] ?? key;
}

export type GridType = 'thirds' | 'golden';
export type Language = 'en' | 'vi';

export interface Settings {
    enabled: boolean;
    gridType: GridType;
    lineColor: string;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
    lineSize: number;
    language: Language;
}

export const DEFAULT_SETTINGS: Settings = {
    enabled: true,
    gridType: 'thirds',
    lineColor: '#000000',
    dotColor: '#ffffff',
    showDots: true,
    dotSize: 5,
    lineSize: 1,
    language: 'en',
};

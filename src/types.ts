export type GridType = 'thirds' | 'golden' | 'fibonacci' | 'triangle';
export type Language = 'en' | 'vi';
export type SpiralOrientation = 0 | 1 | 2 | 3;

export interface Settings {
    enabled: boolean;
    gridTypes: GridType[];
    lineColor: string;
    dotColor: string;
    showDots: boolean;
    dotSize: number;
    lineSize: number;
    language: Language;
    spiralOrientation: SpiralOrientation;
}

export const DEFAULT_SETTINGS: Settings = {
    enabled: true,
    gridTypes: ['thirds', 'triangle'],
    lineColor: '#ffffff',
    dotColor: '#ffffff',
    showDots: true,
    dotSize: 8,
    lineSize: 1,
    language: 'en',
    spiralOrientation: 0,
};

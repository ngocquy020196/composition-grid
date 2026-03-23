// ─── Message Types ───────────────────────────────────────────────────────────
// Centralized message type constants used across background and content scripts.

export const MSG = {
    TAB_ACTIVATED: 'TAB_ACTIVATED',
    TAB_DEACTIVATED: 'TAB_DEACTIVATED',
    TOGGLE_GRID: 'TOGGLE_GRID',
    TOGGLE_GRID_ALL: 'TOGGLE_GRID_ALL',
    TOGGLE_VIDEO: 'TOGGLE_VIDEO',
    TOGGLE_LINE_STYLE: 'TOGGLE_LINE_STYLE',
    TOGGLE_COLOR: 'TOGGLE_COLOR',
} as const;

export type MessageType = typeof MSG[keyof typeof MSG];

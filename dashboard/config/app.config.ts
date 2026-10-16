export const APP = {
    id: 'mcpanels',
    apiBase: '/api/client/extensions/mcpanels/servers',
    maxPanelsPerProfile: 60,
} as const;

export const GRID = {
    maxColumns: 4,
    gap: 12,
    rowHeight: 88,
    maxRows: 12,
    breakpoints: { fourColumns: 980, twoColumns: 560 },
} as const;

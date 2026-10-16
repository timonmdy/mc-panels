export interface TemplatePanel {
    id?: string;
    type: string;
    w?: number;
    h?: number;
    settings?: Record<string, unknown>;
}

export interface TemplateRow {
    id: string;
    slots: string[];
}

export interface TemplateSpec {
    id: string;
    name: string;
    description: string;
    panels: TemplatePanel[];
    rows?: TemplateRow[];
}

export const DEFAULT_TEMPLATE_ID = 'overview';

export const BUILT_IN_TEMPLATES: TemplateSpec[] = [
    {
        id: 'overview',
        name: 'Overview',
        description: 'A complete server overview with health, metrics, players, and server details.',
        panels: [
            { id: 'pkcmghjsu6h', type: 'cpu-stat', w: 1, h: 2, settings: { showAverage: true, showPeak: true, showTrend: true, showSparkline: true, warnAt: null, critAt: null } },
            { id: 'py1i00dgzh5', type: 'ram-stat', w: 1, h: 2, settings: { showAverage: true, showPeak: true, showTrend: true, showSparkline: true, warnAt: null, critAt: null, unit: 'percent' } },
            { id: 'pq9h5801tk7', type: 'network-up-stat', w: 1, h: 2, settings: { showAverage: true, showPeak: true, showTrend: true, showSparkline: true, warnAt: null, critAt: null } },
            { id: 'p70epbwwwuk', type: 'network-down-stat', w: 1, h: 2, settings: { showAverage: true, showPeak: true, showTrend: true, showSparkline: true, warnAt: null, critAt: null } },
            { id: 'pe7ehse0jhh', type: 'cpu-chart', w: 1, h: 3, settings: { variant: 'area', showGrid: true, fixedMax: null } },
            { id: 'p2qrk1v2m2f', type: 'ram-chart', w: 1, h: 3, settings: { variant: 'area', showGrid: true, fixedMax: null, unit: 'percent' } },
            { id: 'pd35cfb3qib', type: 'disk', w: 1, h: 3, settings: { warnAt: 80, critAt: 95 } },
            { id: 'pp9do3biv11', type: 'status-bar', w: 4, h: 1, settings: { showCpu: true, showMemory: true, showTps: false, showStability: true, showUptime: false, showPlayers: true } },
            { id: 'pblfwx71e1m', type: 'uptime', w: 1, h: 2, settings: { showSince: true } },
            { id: 'pgba808dp0z', type: 'registered-players-list', w: 2, h: 5, settings: { pageSize: '10', showAvatars: true, showLastSeen: true, showIpHistory: true } },
            { id: 'pa2an58cy9h', type: 'console-issues', w: 2, h: 6, settings: { defaultLevel: 'all', maxRows: 30, ignorePatterns: [] } },
            { id: 'pkszmg4sh5q', type: 'connection-failures', w: 2, h: 3, settings: { view: 'both', maxRows: 8 } },
            { id: 'phxs5ufiqii', type: 'uptime-chart', w: 1, h: 2, settings: { bars: '60' } },
            { id: 'p58c5emtb21', type: 'online-players-stat', w: 1, h: 3, settings: { showAverage: true, showPeak: true, showTrend: true, showSparkline: true, warnAt: null, critAt: null } },
            { id: 'pnr43mjnpsg', type: 'system-info', w: 2, h: 3, settings: { showKernel: true, showThreads: true, showImage: true } },
            { id: 'paf0mvo7qzv', type: 'server-info', w: 1, h: 3, settings: { showIp: true, showRegion: true, showMotd: false } },
            { id: 'pdp0imzbs0d', type: 'worlds-properties', w: 1, h: 3, settings: { showAdvanced: true } },
        ],
        rows: [
            { id: 'rowmv9t6wgg', slots: ['pp9do3biv11', 'pkcmghjsu6h', 'py1i00dgzh5', 'pq9h5801tk7', 'p70epbwwwuk'] },
            { id: 'rowmv9umy01', slots: ['pe7ehse0jhh', 'p2qrk1v2m2f', 'pd35cfb3qib', 'p58c5emtb21'] },
            { id: 'rowmv9uq6jk', slots: ['pgba808dp0z', 'phxs5ufiqii', 'pblfwx71e1m', 'pkszmg4sh5q'] },
            { id: 'rowmv9ur9sx', slots: ['pa2an58cy9h', 'pnr43mjnpsg', 'paf0mvo7qzv', 'pdp0imzbs0d'] },
        ],
    },
    {
        id: 'performance',
        name: 'Performance',
        description: 'Resources, TPS and network over time.',
        panels: [
            { type: 'status-bar', settings: { showTps: true, showPlayers: false, showUptime: true } },
            { type: 'cpu-stat' },
            { type: 'ram-stat' },
            { type: 'tps-stat' },
            { type: 'uptime' },
            { type: 'cpu-chart' },
            { type: 'ram-chart' },
            { type: 'tps-chart' },
            { type: 'network-up-chart', w: 1 },
            { type: 'network-down-chart', w: 1 },
            { type: 'disk' },
            { type: 'uptime-chart' },
            { type: 'system-info' },
        ],
    },
    {
        id: 'players',
        name: 'Players',
        description: 'Who is online, who registered and who failed to join.',
        panels: [
            { type: 'online-players-stat' },
            { type: 'registered-players-stat' },
            { type: 'online-players-chart' },
            { type: 'online-players-list' },
            { type: 'registered-players-list', h: 5 },
            { type: 'registered-players-chart', w: 1, h: 3 },
            { type: 'connection-failures' },
        ],
    },
    {
        id: 'moderation',
        name: 'Moderation',
        description: 'Bans, rejected connections and log problems.',
        panels: [
            { type: 'registered-players-list', h: 5 },
            { type: 'connection-failures', h: 5 },
            { type: 'console-issues', w: 1, h: 5 },
            { type: 'note' },
        ],
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Just the essentials.',
        panels: [{ type: 'status-bar' }, { type: 'cpu-stat' }, { type: 'ram-stat' }, { type: 'online-players-stat' }, { type: 'tps-stat' }],
    },
    {
        id: 'blank',
        name: 'Blank',
        description: 'Start from scratch.',
        panels: [],
    },
];

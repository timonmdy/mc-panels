export type MetricKey = 'cpu' | 'memory' | 'memoryPercent' | 'netUp' | 'netDown' | 'playersOnline' | 'playersRegistered' | 'tps';

export type ServerState = 'running' | 'starting' | 'stopping' | 'offline' | 'unknown';

export interface TimeSpan {
    key: string;
    label: string;
    seconds: number;
}

export interface PublicConfig {
    timeSpans: TimeSpan[];
    defaultTimeSpan: string;
    maxPoints: number;
    avatarApiUrl: string;
    debugLogging: boolean;
    animationsEnabled: boolean;
    polling: { liveSeconds: number; seriesSeconds: number; listSeconds: number };
    features: { tps: boolean; bridge: boolean; geo: boolean };
}

export interface Permissions {
    viewDashboard: boolean;
    editLayouts: boolean;
    editProfiles: boolean;
    viewData: boolean;
    manageData: boolean;
    managePermissions: boolean;
    seeIps: boolean;
    accessRequestStatus: 'pending' | 'approved' | 'denied' | null;
}

export interface PanelInstance {
    id: string;
    type: string;
    w: number;
    h: number;
    settings: Record<string, unknown>;
}

export interface Layout {
    panels: PanelInstance[];
    rows?: LayoutRow[];
    spaceSizes?: Record<string, { w: number; h: number }>;
}

export interface LayoutRow {
    id: string;
    slots: string[];
}

export interface ProfileDto {
    id: number;
    kind: 'profile' | 'template';
    name: string;
    layout: Layout;
    position: number;
}

export interface Bootstrap {
    config: PublicConfig;
    permissions: Permissions;
    profiles: ProfileDto[];
    templates: ProfileDto[];
}

export interface DataExplorerColumn {
    key: string;
    label: string;
}

export interface DataExplorerResponse {
    tables: Array<{ key: string; label: string }>;
    table: string;
    columns: DataExplorerColumn[];
    editableColumns: string[];
    canManage: boolean;
    data: Array<Record<string, unknown>>;
    total: number;
    page: number;
    perPage: number;
}

export type ServerGrant = 'view' | 'layouts.edit' | 'profiles.manage' | 'data.view' | 'data.manage' | 'ips.view';

export interface ServerPermissionUser {
    id: number;
    email: string;
    permissions: ServerGrant[];
    updatedAt: string;
}

export interface ServerPermissionRequest {
    id: number;
    userId: number;
    email: string;
    permissions: ServerGrant[];
    status: 'pending';
    createdAt: string;
}

export interface ServerPermissionsResponse {
    guestPermissions: ServerGrant[];
    users: ServerPermissionUser[];
    requests: ServerPermissionRequest[];
}

export interface LiveSnapshot {
    ts: number;
    stale: boolean;
    state: ServerState;
    cpu: number | null;
    cpuLimit: number | null;
    memory: number | null;
    memoryLimit: number | null;
    memoryPercent: number | null;
    disk: number | null;
    diskLimit: number | null;
    netUp: number | null;
    netDown: number | null;
    uptimeMs: number | null;
    playersOnline: number | null;
    playersMax: number | null;
    playersRegistered: number | null;
    playersBanned: number;
    tps: number | null;
    mspt: number | null;
    stability: { crashes: number; windowDays: number };
}

export type Point = [number, number];

export interface MetricSummary {
    avg: number | null;
    min: number | null;
    max: number | null;
    previousAvg: number | null;
}

export interface SeriesResponse {
    from: number;
    to: number;
    step: number;
    series: Partial<Record<MetricKey, Point[]>>;
    summary: Partial<Record<MetricKey, MetricSummary>>;
}

export interface AvailabilityResponse {
    buckets: Array<{ ts: number; up: number | null }>;
    uptimePercent: number | null;
    outages: number;
}

export interface PlayerIp {
    ip: string;
    firstSeen: number;
    lastSeen: number;
    hits: number;
}

export interface PlayerDto {
    id: number;
    name: string;
    uuid: string | null;
    online: boolean;
    banned: boolean;
    banReason: string | null;
    ipBanned: boolean;
    firstSeen: number | null;
    lastSeen: number | null;
    lastIp: string | null;
    ips: PlayerIp[];
}

export interface PlayersResponse {
    data: PlayerDto[];
    total: number;
    page: number;
    perPage: number;
}

export type FailureReason =
    | 'aborted'
    | 'timeout'
    | 'not_whitelisted'
    | 'banned'
    | 'version_mismatch'
    | 'server_full'
    | 'auth_failed'
    | 'duplicate_login'
    | 'protocol_error'
    | 'other';

export interface FailuresResponse {
    total: number;
    byReason: Array<{ reason: FailureReason; count: number }>;
    recent: Array<{ id: number; ts: number; reason: FailureReason; name: string | null; ip: string | null }>;
}

export interface IssueEntry {
    level: 'error' | 'warn';
    message: string;
    count: number;
    lastSeen: string;
}

export interface IssuesResponse {
    counts: { all: number; error: number; warn: number };
    entries: IssueEntry[];
}

export interface InfoResponse {
    server: {
        software: string | null;
        version: string | null;
        ip: string | null;
        host: string | null;
        port: number | null;
        motd: string | null;
        region: { country?: string | null; region?: string | null; city?: string | null } | null;
    };
    system: {
        javaVersion: string | null;
        image: string | null;
        os: string | null;
        osType: string | null;
        arch: string | null;
        kernel: string | null;
        cpuThreads: number | null;
    };
    world: {
        worlds: Array<{ name: string; dimensions: number }>;
        levelName: string | null;
        difficulty: string | null;
        gamemode: string | null;
        hardcore: boolean | null;
        pvp: boolean | null;
        viewDistance: number | null;
        simulationDistance: number | null;
        maxPlayers: number | null;
        onlineMode: boolean | null;
        whitelist: boolean | null;
        spawnProtection: number | null;
        loadedChunks: number | null;
        entities: number | null;
    };
}

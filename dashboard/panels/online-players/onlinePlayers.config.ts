import type { SettingField } from '../registry/panel.types';

export const ONLINE_PLAYERS_FIELDS: SettingField[] = [
    { kind: 'toggle', key: 'showAvatars', label: 'Show avatars' },
    { kind: 'toggle', key: 'showJoinTime', label: 'Show join time' },
    { kind: 'toggle', key: 'showIp', label: 'Show IP address', help: 'Only visible if you are allowed to see IPs.' },
    { kind: 'number', key: 'maxRows', label: 'Maximum players listed', min: 1, max: 50 },
];

export const ONLINE_PLAYERS_DEFAULTS = { showAvatars: true, showJoinTime: true, showIp: false, maxRows: 10 };

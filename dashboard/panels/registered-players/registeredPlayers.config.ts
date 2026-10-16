import type { SettingField } from '../registry/panel.types';

export const REGISTERED_FIELDS: SettingField[] = [
    {
        kind: 'select',
        key: 'pageSize',
        label: 'Rows per page',
        options: [
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '20', label: '20' },
        ],
    },
    { kind: 'toggle', key: 'showAvatars', label: 'Show avatars' },
    { kind: 'toggle', key: 'showLastSeen', label: 'Show last seen' },
    { kind: 'toggle', key: 'showIpHistory', label: 'Allow IP history', help: 'Only visible if you are allowed to see IPs.' },
];

export const REGISTERED_DEFAULTS = { pageSize: '10', showAvatars: true, showLastSeen: true, showIpHistory: true };

import { definePanel } from '../registry/panel.types';
import { ConnectionFailuresPanel } from './ConnectionFailuresPanel';

export const connectionFailuresPanel = definePanel({
    type: 'connection-failures',
    title: 'Failed connections',
    description: 'Rejected join attempts grouped by reason, for example banned or not whitelisted.',
    icon: 'failures',
    category: 'Moderation',
    multiple: false,
    defaultSize: { w: 1, h: 4 },
    minSize: { w: 1, h: 2 },
    defaultSettings: { view: 'both', maxRows: 8 },
    fields: [
        {
            kind: 'select',
            key: 'view',
            label: 'Show',
            options: [
                { value: 'both', label: 'Summary and recent attempts' },
                { value: 'summary', label: 'Summary only' },
                { value: 'recent', label: 'Recent attempts only' },
            ],
        },
        { kind: 'number', key: 'maxRows', label: 'Recent attempts listed', min: 1, max: 30 },
    ],
    component: ConnectionFailuresPanel,
});

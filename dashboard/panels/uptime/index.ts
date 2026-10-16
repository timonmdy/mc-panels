import { definePanel } from '../registry/panel.types';
import { UptimePanel } from './UptimePanel';

export const uptimePanel = definePanel({
    type: 'uptime',
    title: 'Uptime',
    description: 'How long the server has been running since its last start.',
    icon: 'uptime',
    category: 'Server',
    multiple: false,
    defaultSize: { w: 1, h: 2 },
    defaultSettings: { showSince: true },
    fields: [{ kind: 'toggle', key: 'showSince', label: 'Show start time' }],
    component: UptimePanel,
});

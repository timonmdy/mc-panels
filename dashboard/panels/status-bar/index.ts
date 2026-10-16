import { definePanel } from '../registry/panel.types';
import { StatusBarPanel } from './StatusBarPanel';

export const statusBarPanel = definePanel({
    type: 'status-bar',
    title: 'Status bar',
    description: 'Health summary with averages for CPU, memory, stability and players.',
    icon: 'status',
    category: 'Server',
    multiple: false,
    bare: true,
    defaultSize: { w: 4, h: 1 },
    maxSize: { w: 4, h: 2 },
    defaultSettings: { showCpu: true, showMemory: true, showTps: false, showStability: true, showUptime: false, showPlayers: true },
    fields: [
        { kind: 'toggle', key: 'showCpu', label: 'CPU average' },
        { kind: 'toggle', key: 'showMemory', label: 'Memory average' },
        { kind: 'toggle', key: 'showTps', label: 'TPS' },
        { kind: 'toggle', key: 'showStability', label: 'Stability (crashes in 7 days)' },
        { kind: 'toggle', key: 'showUptime', label: 'Uptime' },
        { kind: 'toggle', key: 'showPlayers', label: 'Players' },
    ],
    component: StatusBarPanel,
});

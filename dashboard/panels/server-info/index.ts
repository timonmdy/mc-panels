import { definePanel } from '../registry/panel.types';
import { ServerInfoPanel } from './ServerInfoPanel';

export const serverInfoPanel = definePanel({
    type: 'server-info',
    title: 'Server info',
    description: 'Software, Minecraft version, address and region.',
    icon: 'server',
    category: 'Server',
    multiple: false,
    defaultSize: { w: 1, h: 3 },
    defaultSettings: { showIp: true, showRegion: true, showMotd: false },
    fields: [
        { kind: 'toggle', key: 'showIp', label: 'Show IP', help: 'Turn off when streaming or sharing screenshots.' },
        { kind: 'toggle', key: 'showRegion', label: 'Show region' },
        { kind: 'toggle', key: 'showMotd', label: 'Show MOTD' },
    ],
    component: ServerInfoPanel,
});

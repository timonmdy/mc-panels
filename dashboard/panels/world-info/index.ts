import { definePanel } from '../registry/panel.types';
import { WorldInfoPanel } from './WorldInfoPanel';

export const worldInfoPanel = definePanel({
    type: 'worlds-properties',
    title: 'Worlds & Properties',
    description: 'Worlds, difficulty, game rules and loaded chunks or entities when a bridge is configured.',
    icon: 'world',
    category: 'Server',
    multiple: false,
    defaultSize: { w: 1, h: 4 },
    defaultSettings: { showAdvanced: true },
    fields: [{ kind: 'toggle', key: 'showAdvanced', label: 'Show distances, whitelist and online mode' }],
    component: WorldInfoPanel,
});

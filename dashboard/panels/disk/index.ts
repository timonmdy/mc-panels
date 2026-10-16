import { definePanel } from '../registry/panel.types';
import { DiskPanel } from './DiskPanel';

export const diskPanel = definePanel({
    type: 'disk',
    title: 'Disk usage',
    description: 'Used disk space compared to the server limit.',
    icon: 'disk',
    category: 'Performance',
    multiple: false,
    defaultSize: { w: 1, h: 3 },
    minSize: { w: 1, h: 2 },
    defaultSettings: { warnAt: 80, critAt: 95 },
    fields: [
        { kind: 'number', key: 'warnAt', label: 'Warning at (%)', min: 1, max: 100 },
        { kind: 'number', key: 'critAt', label: 'Critical at (%)', min: 1, max: 100 },
    ],
    component: DiskPanel,
});

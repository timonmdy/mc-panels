import { definePanel } from '../registry/panel.types';
import { UptimeChartPanel } from './UptimeChartPanel';

export const uptimeChartPanel = definePanel({
    type: 'uptime-chart',
    title: 'Availability',
    description: 'Uptime percentage and outages over the selected time span.',
    icon: 'uptimeChart',
    category: 'Server',
    multiple: false,
    defaultSize: { w: 1, h: 2 },
    minSize: { w: 1, h: 2 },
    defaultSettings: { bars: '60' },
    fields: [
        {
            kind: 'select',
            key: 'bars',
            label: 'Bars',
            options: [
                { value: '30', label: '30' },
                { value: '60', label: '60' },
                { value: '90', label: '90' },
            ],
        },
    ],
    component: UptimeChartPanel,
});

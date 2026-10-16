import type { SettingField } from '../../registry/panel.types';

export const CHART_FIELDS: SettingField[] = [
    {
        kind: 'select',
        key: 'variant',
        label: 'Style',
        options: [
            { value: 'area', label: 'Filled area' },
            { value: 'line', label: 'Line' },
        ],
    },
    { kind: 'toggle', key: 'showGrid', label: 'Show grid lines' },
    { kind: 'number', key: 'fixedMax', label: 'Fixed maximum', placeholder: 'Automatic', help: 'In the unit of the chart (e.g. percent, players).' },
];

export const CHART_DEFAULTS = {
    variant: 'area',
    showGrid: true,
    fixedMax: null as number | null,
};

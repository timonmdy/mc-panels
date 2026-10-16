import type { SettingField } from '../../registry/panel.types';

export const STAT_FIELDS: SettingField[] = [
    { kind: 'toggle', key: 'showAverage', label: 'Show average' },
    { kind: 'toggle', key: 'showPeak', label: 'Show peak' },
    { kind: 'toggle', key: 'showTrend', label: 'Show change to previous period' },
    { kind: 'toggle', key: 'showSparkline', label: 'Show sparkline' },
    { kind: 'number', key: 'warnAt', label: 'Warning threshold', placeholder: 'Default', help: 'Leave empty to use the default.' },
    { kind: 'number', key: 'critAt', label: 'Critical threshold', placeholder: 'Default' },
];

export const STAT_DEFAULTS = {
    showAverage: true,
    showPeak: true,
    showTrend: true,
    showSparkline: true,
    warnAt: null as number | null,
    critAt: null as number | null,
};

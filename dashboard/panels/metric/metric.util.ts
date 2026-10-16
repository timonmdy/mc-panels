import { palette } from '../../framework/theme';
import { isNumber } from '../../utils/number.util';
import type { MetricDefinition, Thresholds } from './metric.types';

export const toneFor = (value: number | null, thresholds: Thresholds | undefined, overrides: { warnAt?: unknown; critAt?: unknown }): string => {
    if (!isNumber(value) || !thresholds) return palette.text;

    const warn = isNumber(overrides.warnAt) ? overrides.warnAt : thresholds.warn;
    const crit = isNumber(overrides.critAt) ? overrides.critAt : thresholds.crit;
    const breached = (limit: number) => (thresholds.direction === 'above' ? value >= limit : value <= limit);

    if (breached(crit)) return palette.bad;

    return breached(warn) ? palette.warn : palette.text;
};

export interface Delta {
    label: string;
    tone: string;
    direction: 'up' | 'down' | 'flat';
}

export const deltaOf = (current: number | null, previous: number | null, mode: 'points' | 'relative', trend: MetricDefinition['trend']): Delta | null => {
    if (!isNumber(current) || !isNumber(previous)) return null;

    const diff = current - previous;
    if (mode === 'relative' && previous === 0) return null;

    const amount = mode === 'points' ? Math.abs(diff).toFixed(1) : Math.abs((diff / previous) * 100).toFixed(0);
    const direction = Math.abs(diff) < 0.05 ? 'flat' : diff > 0 ? 'up' : 'down';
    const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';
    const good = trend === 'higher-is-better' ? direction === 'up' : trend === 'lower-is-better' ? direction === 'down' : null;
    const tone = direction === 'flat' || good === null ? palette.muted : good ? palette.good : palette.bad;

    return { label: `${sign}${amount}${mode === 'points' ? ' pp' : '%'}`, tone, direction };
};

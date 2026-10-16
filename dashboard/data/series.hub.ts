import type { MetricKey } from '../api/api.types';
import { refresh } from './resource.store';

const demand = new Map<string, Map<MetricKey, number>>();
const pending = new Map<string, number>();

export const seriesKey = (uuid: string, span: string) => `series:${uuid}:${span}`;

export const wantedMetrics = (key: string): MetricKey[] => Array.from(demand.get(key)?.keys() ?? []).sort();

export const registerMetric = (key: string, metric: MetricKey): (() => void) => {
    const counts = demand.get(key) ?? new Map<MetricKey, number>();
    const isNew = !counts.has(metric);
    counts.set(metric, (counts.get(metric) ?? 0) + 1);
    demand.set(key, counts);

    if (isNew) {
        window.clearTimeout(pending.get(key));
        pending.set(key, window.setTimeout(() => refresh(key), 40));
    }

    return () => {
        const left = (counts.get(metric) ?? 1) - 1;
        left <= 0 ? counts.delete(metric) : counts.set(metric, left);
    };
};

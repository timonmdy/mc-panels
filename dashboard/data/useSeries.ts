import { useEffect } from 'react';
import type { MetricKey, MetricSummary, Point } from '../api/api.types';
import { fetchSeries } from '../api/endpoints.api';
import { useDashboard } from './useDashboard';
import { registerMetric, seriesKey, wantedMetrics } from './series.hub';
import { useResource } from './useResource';

export interface MetricSeries {
    points: Point[];
    summary: MetricSummary | null;
    from: number;
    to: number;
    loading: boolean;
    error?: string;
}

export const useSeries = (metric: MetricKey): MetricSeries => {
    const { uuid, span, config } = useDashboard();
    const key = seriesKey(uuid, span.key);

    useEffect(() => registerMetric(key, metric), [key, metric]);

    const resource = useResource(key, () => fetchSeries(uuid, span.key, wantedMetrics(key)), config.polling.seriesSeconds);
    const data = resource.data;
    const now = Math.floor(Date.now() / 1000);

    return {
        points: data?.series[metric] ?? [],
        summary: data?.summary[metric] ?? null,
        from: data?.from ?? now - span.seconds,
        to: data?.to ?? now,
        loading: resource.loading || (data !== undefined && !(metric in data.series)),
        error: resource.error,
    };
};

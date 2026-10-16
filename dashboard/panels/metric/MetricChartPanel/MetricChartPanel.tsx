import React from 'react';
import { AreaChart } from '../../../framework/charts';
import { EmptyState } from '../../../framework/ui';
import { useDashboard } from '../../../data/useDashboard';
import { useSeries } from '../../../data/useSeries';
import { isNumber } from '../../../utils/number.util';
import { niceMax } from '../../../framework/charts/chart.util';
import { PanelError, PanelLoading } from '../../shared/PanelError/PanelError';
import type { PanelProps } from '../../registry/panel.types';
import type { MetricDefinition } from '../metric.types';

interface Props extends PanelProps {
    definition: MetricDefinition;
}

export const MetricChartPanel = ({ definition, settings }: Props) => {
    const { config } = useDashboard();
    const key = definition.keyFor(settings);
    const series = useSeries(key);

    const unavailable = definition.unavailable?.(config.features);
    if (unavailable) return <EmptyState icon='warning' title='Not available' hint={unavailable} />;
    if (series.error && !series.points.length) return <PanelError message={series.error} />;
    if (series.loading && !series.points.length) return <PanelLoading />;
    if (!series.points.length) return <EmptyState icon={definition.icon} title='No data yet' hint='Metrics appear a minute or two after the server starts.' />;

    const peak = Math.max(0, ...series.points.map((p) => p[1]));
    const floor = definition.axisFloor?.(key);
    const yMax = isNumber(settings.fixedMax) && settings.fixedMax > 0 ? settings.fixedMax : definition.axisCap?.(key) ?? (floor ? niceMax(Math.max(floor, peak * 1.1)) : undefined);

    return (
        <AreaChart
            series={[{ id: key, label: definition.label, color: definition.color, points: series.points }]}
            from={series.from}
            to={series.to}
            format={(value) => definition.format(value, key)}
            yMax={yMax}
            grid={Boolean(settings.showGrid)}
            variant={settings.variant === 'line' ? 'line' : 'area'}
        />
    );
};

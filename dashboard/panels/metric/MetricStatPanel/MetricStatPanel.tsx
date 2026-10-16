import React from 'react';
import { Sparkline } from '../../../framework/charts';
import { palette } from '../../../framework/theme';
import { useLive } from '../../../data/data.hooks';
import { useSeries } from '../../../data/useSeries';
import { isNumber } from '../../../utils/number.util';
import { PanelError } from '../../shared/PanelError/PanelError';
import type { PanelProps } from '../../registry/panel.types';
import type { MetricDefinition } from '../metric.types';
import { deltaOf, toneFor } from '../metric.util';
import { DeltaChip, Meta, Root, SparkWrap, Top, Value } from './MetricStatPanel.styles';

interface Props extends PanelProps {
    definition: MetricDefinition;
}

export const MetricStatPanel = ({ definition, settings }: Props) => {
    const key = definition.keyFor(settings);
    const live = useLive();
    const series = useSeries(key);

    if (live.error && !live.data) return <PanelError message={live.error} />;

    const value = live.data ? definition.liveValue(live.data, key) : null;
    const summary = series.summary;
    const thresholds = key === 'cpu' && live.data?.cpuLimit
        ? { warn: live.data.cpuLimit * 0.75, crit: live.data.cpuLimit * 0.9, direction: 'above' as const }
        : definition.thresholds?.(key);
    const tone = toneFor(value, thresholds, settings);
    const delta = settings.showTrend ? deltaOf(summary?.avg ?? null, summary?.previousAvg ?? null, definition.deltaMode(key), definition.trend) : null;
    const subtitle = live.data && definition.subtitle ? definition.subtitle(live.data) : null;
    const cap = definition.axisCap?.(key);

    return (
        <Root>
            <Top>
                <Value $tone={tone}>
                    {definition.format(value, key)}
                    {subtitle && <small>{subtitle}</small>}
                </Value>
                {delta && <DeltaChip $tone={delta.tone}>{delta.label}</DeltaChip>}
            </Top>
            <Meta>
                {settings.showAverage && (
                    <span>
                        Avg <strong>{definition.format(summary?.avg ?? null, key)}</strong>
                    </span>
                )}
                {settings.showPeak && (
                    <span>
                        Peak <strong>{definition.format(summary?.max ?? null, key)}</strong>
                    </span>
                )}
            </Meta>
            {settings.showSparkline && isNumber(value) && (
                <SparkWrap>
                    <Sparkline points={series.points} color={tone === palette.text ? definition.color : tone} max={cap} />
                </SparkWrap>
            )}
        </Root>
    );
};

import React from 'react';
import styled from 'styled-components';
import { StripChart } from '../../framework/charts';
import { color, palette } from '../../framework/theme';
import { EmptyState } from '../../framework/ui';
import { useAvailability } from '../../data/data.hooks';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import type { PanelProps } from '../registry/panel.types';

const Root = styled.div`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 10px;
    height: 100%;

    header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
    }
    strong {
        font-size: 24px;
    }
    small {
        color: ${color.muted};
    }
`;

export const UptimeChartPanel = ({ settings }: PanelProps) => {
    const availability = useAvailability(Number(settings.bars) || 60);
    if (availability.error && !availability.data) return <PanelError message={availability.error} />;
    if (!availability.data) return <PanelLoading />;

    const { buckets, uptimePercent, outages } = availability.data;
    if (uptimePercent === null) return <EmptyState icon='uptimeChart' title='No data yet' hint='Availability is recorded once per collection interval.' />;

    const tone = uptimePercent >= 99.5 ? palette.good : uptimePercent >= 95 ? palette.warn : palette.bad;

    return (
        <Root>
            <header>
                <strong style={{ color: tone }}>{uptimePercent.toFixed(1)}%</strong>
                <small>{outages} {outages === 1 ? 'outage' : 'outages'}</small>
            </header>
            <StripChart buckets={buckets} />
        </Root>
    );
};

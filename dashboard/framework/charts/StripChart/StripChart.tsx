import React from 'react';
import styled from 'styled-components';
import { palette } from '../../theme';
import { formatDayClock } from '../../../utils/time.util';

const Root = styled.div`
    display: flex;
    gap: 2px;
    height: 100%;
    min-height: 28px;
`;

const Bar = styled.span<{ $tone: string }>`
    flex: 1;
    min-width: 2px;
    border-radius: 2px;
    background: ${(p) => p.$tone};
`;

export interface StripBucket {
    ts: number;
    up: number | null;
}

const toneOf = (up: number | null): string => {
    if (up === null) return palette.border;
    if (up >= 0.99) return palette.good;

    return up > 0 ? palette.warn : palette.bad;
};

export const StripChart = ({ buckets }: { buckets: StripBucket[] }) => (
    <Root role='img' aria-label='Availability over time'>
        {buckets.map((bucket) => (
            <Bar key={bucket.ts} $tone={toneOf(bucket.up)} title={`${formatDayClock(bucket.ts)}: ${bucket.up === null ? 'no data' : `${Math.round(bucket.up * 100)}% up`}`} />
        ))}
    </Root>
);

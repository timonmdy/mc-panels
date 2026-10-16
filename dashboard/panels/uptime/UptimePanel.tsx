import React from 'react';
import styled from 'styled-components';
import { palette, color } from '../../framework/theme';
import { Badge } from '../../framework/ui';
import { useLive } from '../../data/data.hooks';
import { formatDayClock } from '../../utils/time.util';
import { formatDuration } from '../../utils/format.util';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import type { PanelProps } from '../registry/panel.types';

const Root = styled.div`
    display: grid;
    gap: 6px;

    strong {
        font-size: 30px;
        line-height: 1.1;
    }
    small {
        color: ${color.muted};
        font-size: 12px;
    }
`;

export const UptimePanel = ({ settings }: PanelProps) => {
    const live = useLive();
    if (live.error && !live.data) return <PanelError message={live.error} />;
    if (!live.data) return <PanelLoading />;

    const { state, uptimeMs } = live.data;
    const running = state === 'running';
    const since = running && uptimeMs ? Math.floor(Date.now() / 1000 - uptimeMs / 1000) : null;

    return (
        <Root>
            <strong style={{ color: running ? palette.text : palette.muted }}>{running ? formatDuration(uptimeMs) : 'Offline'}</strong>
            <span>
                <Badge $tone={running ? 'good' : 'bad'}>{state}</Badge>
            </span>
            {settings.showSince && since && <small>Running since {formatDayClock(since)}</small>}
        </Root>
    );
};

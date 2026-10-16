import React from 'react';
import { palette } from '../../framework/theme';
import { useLive } from '../../data/data.hooks';
import { useSeries } from '../../data/useSeries';
import { NO_VALUE, formatDuration, formatNumber, formatPercent } from '../../utils/format.util';
import { computeHealth } from '../../utils/health.util';
import type { PanelProps } from '../registry/panel.types';
import { Dot, Health, Items, Root } from './StatusBarPanel.styles';

const TONES = { good: palette.good, warn: palette.warn, bad: palette.bad };

export const StatusBarPanel = ({ settings }: PanelProps) => {
    const live = useLive();
    const cpu = useSeries('cpu');
    const memory = useSeries('memoryPercent');
    const health = computeHealth(live.data);
    const d = live.data;

    const items: Array<[boolean, string, string]> = [
        [settings.showCpu, 'CPU', `${formatPercent(cpu.summary?.avg ?? null)} avg`],
        [settings.showMemory, 'Memory', `${formatPercent(memory.summary?.avg ?? null)} avg`],
        [settings.showTps, 'TPS', formatNumber(d?.tps ?? null, 1)],
        [settings.showStability, 'Stability', d ? `${d.stability.crashes} in ${d.stability.windowDays}d` : NO_VALUE],
        [settings.showUptime, 'Uptime', d?.state === 'running' ? formatDuration(d.uptimeMs) : NO_VALUE],
        [settings.showPlayers, 'Players', d ? `${formatNumber(d.playersOnline)}${d.playersMax ? ` / ${d.playersMax}` : ''}` : NO_VALUE],
    ];

    return (
        <Root>
            <Health>
                <Dot $tone={TONES[health.tone]} />
                <div>
                    <strong style={{ color: TONES[health.tone] }}>{health.title}</strong>
                    <small>{health.detail}</small>
                </div>
            </Health>
            <Items>
                {items.filter(([enabled]) => enabled).map(([, label, value]) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </Items>
        </Root>
    );
};

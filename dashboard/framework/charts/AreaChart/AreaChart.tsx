import React, { useMemo, useRef, useState } from 'react';
import { useElementSize } from '../../../hooks/useElementSize';
import { makeId } from '../../../utils/id.util';
import { formatAxisTime, formatDayClock } from '../../../utils/time.util';
import type { ChartSeries } from '../chart.types';
import { buildArea, buildLine, evenTicks, nearestPoint, niceMax } from '../chart.util';
import { Root, Tooltip } from './AreaChart.styles';

interface Props {
    series: ChartSeries[];
    from: number;
    to: number;
    format: (value: number) => string;
    yMax?: number;
    grid?: boolean;
    variant?: 'area' | 'line';
}

const PAD = { left: 46, right: 8, top: 8, bottom: 20 };
const X_TICKS = 5;

export const AreaChart = ({ series, from, to, format, yMax, grid = true, variant = 'area' }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useElementSize(ref);
    const [hover, setHover] = useState<number | null>(null);
    const gradientId = useMemo(() => makeId('g'), []);

    const innerW = Math.max(0, width - PAD.left - PAD.right);
    const innerH = Math.max(0, height - PAD.top - PAD.bottom);
    const dataMax = Math.max(0, ...series.reduce<number[]>((all, s) => all.concat(s.points.map((p) => p[1])), []));
    const top = yMax ?? niceMax(dataMax * 1.1);
    const span = Math.max(1, to - from);

    const x = (ts: number) => PAD.left + ((ts - from) / span) * innerW;
    const y = (value: number) => PAD.top + innerH - (Math.min(value, top) / top) * innerH;
    const baseline = PAD.top + innerH;

    const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left - PAD.left) / innerW;
        setHover(ratio < 0 || ratio > 1 ? null : from + ratio * span);
    };

    const hovered = hover === null ? [] : series.map((s) => ({ s, point: nearestPoint(s.points, hover) }));
    const anchor = hovered.find((h) => h.point)?.point;
    const spanSeconds = to - from;

    return (
        <Root ref={ref}>
            {width > 0 && height > 0 && (
                <svg viewBox={`0 0 ${width} ${height}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
                    <defs>
                        {series.map((s) => (
                            <linearGradient key={s.id} id={`${gradientId}-${s.id}`} x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='0%' stopColor={s.color} stopOpacity={0.35} />
                                <stop offset='100%' stopColor={s.color} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>

                    {evenTicks(top).map((tick) => (
                        <g key={tick}>
                            {grid && <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke='#232a3f' strokeDasharray='3 4' />}
                            <text x={PAD.left - 8} y={y(tick) + 3} textAnchor='end'>
                                {format(tick)}
                            </text>
                        </g>
                    ))}

                    {Array.from({ length: X_TICKS }, (_, i) => from + (span / (X_TICKS - 1)) * i).map((ts, i) => (
                        <text key={i} x={x(ts)} y={height - 4} textAnchor={i === 0 ? 'start' : i === X_TICKS - 1 ? 'end' : 'middle'}>
                            {formatAxisTime(ts, spanSeconds)}
                        </text>
                    ))}

                    {series.map((s) => {
                        const coords = s.points.map((p): [number, number] => [x(p[0]), y(p[1])]);

                        return (
                            <g key={s.id}>
                                {variant === 'area' && <path d={buildArea(coords, baseline)} fill={`url(#${gradientId}-${s.id})`} />}
                                <path d={buildLine(coords)} fill='none' stroke={s.color} strokeWidth={1.75} strokeLinejoin='round' />
                            </g>
                        );
                    })}

                    {anchor && <line x1={x(anchor[0])} x2={x(anchor[0])} y1={PAD.top} y2={baseline} stroke='#5c647f' />}
                    {hovered.map(({ s, point }) => point && <circle key={s.id} cx={x(point[0])} cy={y(point[1])} r={3.5} fill={s.color} />)}
                </svg>
            )}

            {anchor && (
                <Tooltip style={{ left: Math.min(Math.max(0, x(anchor[0]) + 12), Math.max(0, width - 150)) }}>
                    <time>{formatDayClock(anchor[0])}</time>
                    {hovered.map(({ s, point }) => point && (
                        <div key={s.id}>
                            <i style={{ background: s.color }} />
                            {s.label}: <strong>{format(point[1])}</strong>
                        </div>
                    ))}
                </Tooltip>
            )}
        </Root>
    );
};

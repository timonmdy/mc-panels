import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { Point } from '../../../api/api.types';
import { makeId } from '../../../utils/id.util';
import { buildArea, buildLine } from '../chart.util';

const Svg = styled.svg`
    display: block;
    width: 100%;
    height: 100%;
`;

interface Props {
    points: Point[];
    color: string;
    max?: number;
}

const W = 100;
const H = 30;

export const Sparkline = ({ points, color, max }: Props) => {
    const id = useMemo(() => makeId('s'), []);
    if (points.length < 2) return null;

    const first = points[0][0];
    const span = Math.max(1, points[points.length - 1][0] - first);
    const top = max ?? Math.max(1e-9, ...points.map((p) => p[1]));
    const coords = points.map((p): [number, number] => [((p[0] - first) / span) * W, H - 1 - (Math.min(p[1], top) / top) * (H - 3)]);

    return (
        <Svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' aria-hidden='true'>
            <defs>
                <linearGradient id={id} x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor={color} stopOpacity={0.3} />
                    <stop offset='100%' stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <path d={buildArea(coords, H)} fill={`url(#${id})`} />
            <path d={buildLine(coords)} fill='none' stroke={color} strokeWidth={1.5} vectorEffect='non-scaling-stroke' />
        </Svg>
    );
};

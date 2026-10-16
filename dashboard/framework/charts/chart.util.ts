import type { Point } from '../../api/api.types';

const STEPS = [1, 2, 2.5, 5, 10];

export const niceMax = (max: number): number => {
    if (!(max > 0)) return 1;

    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const step = STEPS.find((s) => s * magnitude >= max) ?? 10;

    return step * magnitude;
};

export const evenTicks = (max: number, count = 3): number[] => Array.from({ length: count + 1 }, (_, i) => (max / count) * i);

export const nearestPoint = (points: Point[], ts: number): Point | null => {
    if (!points.length) return null;

    let best = points[0];
    for (const point of points) {
        if (Math.abs(point[0] - ts) < Math.abs(best[0] - ts)) best = point;
    }

    return best;
};

export const buildLine = (coords: Array<[number, number]>): string =>
    coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export const buildArea = (coords: Array<[number, number]>, baseline: number): string =>
    coords.length ? `${buildLine(coords)} L${coords[coords.length - 1][0].toFixed(1)},${baseline} L${coords[0][0].toFixed(1)},${baseline} Z` : '';

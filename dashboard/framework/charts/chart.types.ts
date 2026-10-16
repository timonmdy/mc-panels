import type { Point } from '../../api/api.types';

export interface ChartSeries {
    id: string;
    label: string;
    color: string;
    points: Point[];
}

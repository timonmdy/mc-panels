import { GRID } from '../../config/app.config';

export const columnsFor = (width: number): number => {
    if (width >= GRID.breakpoints.fourColumns) return 4;

    return width >= GRID.breakpoints.twoColumns ? 2 : 1;
};

export const moveItem = (ids: string[], movingId: string, targetId: string, before: boolean): string[] => {
    if (movingId === targetId) return ids;

    const rest = ids.filter((id) => id !== movingId);
    const index = rest.indexOf(targetId);
    if (index < 0) return ids;

    rest.splice(before ? index : index + 1, 0, movingId);

    return rest;
};

export const sameOrder = (a: string[], b: string[]): boolean => a.length === b.length && a.every((id, i) => id === b[i]);

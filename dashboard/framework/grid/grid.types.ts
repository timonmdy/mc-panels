import type { HTMLAttributes } from 'react';

export interface SizeLimits {
    minW: number;
    maxW: number;
    minH: number;
    maxH: number;
}

export interface ReorderBinding {
    isDragging: boolean;
    itemProps: HTMLAttributes<HTMLElement>;
    handleProps: HTMLAttributes<HTMLElement>;
}

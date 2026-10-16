import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { GRID } from '../../../config/app.config';
import { clamp } from '../../../utils/number.util';
import type { SizeLimits } from '../grid.types';

interface Options {
    w: number;
    h: number;
    columns: number;
    gridWidth: number;
    limits: SizeLimits;
    onCommit: (w: number, h: number) => void;
}

export interface Preview {
    w: number;
    h: number;
}

export const useResizeHandle = ({ w, h, columns, gridWidth, limits, onCommit }: Options) => {
    const [preview, setPreview] = useState<Preview | null>(null);
    const session = useRef<{ x: number; y: number; w: number; h: number; latest: Preview } | null>(null);
    const latest = useRef({ columns, gridWidth, limits, onCommit });
    latest.current = { columns, gridWidth, limits, onCommit };

    useEffect(() => {
        const onMove = (event: PointerEvent) => {
            const start = session.current;
            if (!start) return;

            const { columns: cols, gridWidth: width, limits: l } = latest.current;
            const cellW = (width - GRID.gap * (cols - 1)) / cols + GRID.gap;
            const cellH = GRID.rowHeight + GRID.gap;
            const next = {
                w: clamp(start.w + Math.round((event.clientX - start.x) / cellW), l.minW, Math.min(l.maxW, cols)),
                h: clamp(start.h + Math.round((event.clientY - start.y) / cellH), l.minH, l.maxH),
            };
            start.latest = next;
            setPreview((prev) => (prev && prev.w === next.w && prev.h === next.h ? prev : next));
        };

        const onUp = () => {
            const start = session.current;
            session.current = null;
            if (!start) return;

            setPreview(null);
            if (start.latest.w !== start.w || start.latest.h !== start.h) latest.current.onCommit(start.latest.w, start.latest.h);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, []);

    const start = (event: ReactPointerEvent<HTMLElement>) => {
        event.preventDefault();
        session.current = { x: event.clientX, y: event.clientY, w, h, latest: { w, h } };
        setPreview({ w, h });
    };

    return { preview, start };
};

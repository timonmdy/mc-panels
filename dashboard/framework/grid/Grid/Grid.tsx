import React, { ReactNode, useLayoutEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { GRID } from '../../../config/app.config';
import { useElementSize } from '../../../hooks/useElementSize';
import { columnsFor } from '../grid.util';
import { GridContext } from './GridContext';

const Root = styled.div<{ $columns: number }>`
    display: grid;
    container-type: inline-size;
    grid-template-columns: repeat(${(p) => p.$columns}, minmax(0, 1fr));
    grid-auto-rows: ${GRID.rowHeight}px;
    grid-auto-flow: row;
    gap: ${GRID.gap}px;
    width: 100%;
`;

interface Props {
    children: ReactNode;
    animationsEnabled?: boolean;
}

export const Grid = ({ children, animationsEnabled = false }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const previousRects = useRef(new Map<string, DOMRect>());
    const activeAnimations = useRef(new Map<HTMLElement, Animation>());
    const { width } = useElementSize(ref);
    const columns = columnsFor(width || GRID.breakpoints.fourColumns);
    const value = useMemo(() => ({ columns, width }), [columns, width]);

    useLayoutEffect(() => {
        const root = ref.current;
        if (!root) return;

        activeAnimations.current.forEach((animation) => animation.cancel());
        activeAnimations.current.clear();

        const items = Array.from(root.children).filter(
            (element): element is HTMLElement => element instanceof HTMLElement && element.hasAttribute('data-grid-item')
        );
        const nextRects = new Map<string, DOMRect>();

        items.forEach((item) => {
            const id = item.dataset.gridItem;
            if (!id) return;

            const rect = item.getBoundingClientRect();
            nextRects.set(id, rect);
            const previous = previousRects.current.get(id);
            if (!animationsEnabled || !previous) return;

            const x = previous.left - rect.left;
            const y = previous.top - rect.top;
            if (Math.abs(x) < 1 && Math.abs(y) < 1) return;

            const animation = item.animate(
                [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0, 0)' }],
                { duration: 240, easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)' }
            );
            activeAnimations.current.set(item, animation);
            animation.onfinish = () => {
                if (activeAnimations.current.get(item) === animation) activeAnimations.current.delete(item);
            };
        });

        previousRects.current = nextRects;
    }, [animationsEnabled, children, columns]);

    return (
        <GridContext.Provider value={value}>
            <Root ref={ref} $columns={columns}>
                {children}
            </Root>
        </GridContext.Provider>
    );
};

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { color } from '../../theme';
import { useGrid } from '../Grid/GridContext';
import { useResizeHandle } from '../hooks/useResizeHandle';
import type { ReorderBinding, SizeLimits } from '../grid.types';

const Cell = styled.div<{ $w: number; $h: number; $dragging: boolean; $resizing: boolean; $hideOnSmall: boolean }>`
    position: relative;
    grid-column: span ${(p) => p.$w};
    grid-row: span ${(p) => p.$h};
    min-width: 0;
    min-height: 0;
    opacity: ${(p) => (p.$dragging ? 0.45 : 1)};
    outline: ${(p) => (p.$resizing ? `2px dashed ${color.accent}` : 'none')};
    outline-offset: 2px;
    border-radius: 12px;
    transition: opacity 160ms ease, transform 160ms ease, outline-color 120ms ease;

    @container (max-width: 700px) {
        ${(p) => p.$hideOnSmall && 'display: none;'}
    }
`;

const Grip = styled.span`
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 16px;
    height: 16px;
    cursor: nwse-resize;
    touch-action: none;
    opacity: 0;
    transition: opacity 0.15s;
    background: linear-gradient(135deg, transparent 50%, ${color.faint} 50%, ${color.faint} 58%, transparent 58%, transparent 72%, ${color.faint} 72%, ${color.faint} 80%, transparent 80%);

    ${Cell}:hover &,
    &:focus-visible {
        opacity: 1;
    }
`;

interface Props {
    id: string;
    w: number;
    h: number;
    limits: SizeLimits;
    editable: boolean;
    hideOnSmall?: boolean;
    reorder: ReorderBinding;
    onResize: (w: number, h: number) => void;
    children: (handleProps: ReorderBinding['handleProps'] | undefined) => ReactNode;
}

export const GridItem = ({ id, w, h, limits, editable, hideOnSmall = false, reorder, onResize, children }: Props) => {
    const { columns, width } = useGrid();
    const { preview, start } = useResizeHandle({ w, h, columns, gridWidth: width, limits, onCommit: onResize });

    const shownW = Math.min((preview ?? { w }).w, columns);
    const shownH = (preview ?? { h }).h;

    return (
        <Cell data-grid-item={id} $w={shownW} $h={shownH} $dragging={reorder.isDragging} $resizing={preview !== null} $hideOnSmall={hideOnSmall} {...(editable ? reorder.itemProps : {})}>
            {children(editable ? reorder.handleProps : undefined)}
            {editable && <Grip role='separator' aria-label='Resize grid item' onPointerDown={start} />}
        </Cell>
    );
};

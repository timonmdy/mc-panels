import { DragEvent, useRef, useState } from 'react';
import { moveItem, sameOrder } from '../grid.util';
import type { ReorderBinding } from '../grid.types';

export const useReorder = (ids: string[], onCommit: (ids: string[]) => void) => {
    const [draft, setDraft] = useState<string[] | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const dragging = useRef<string | null>(null);
    const order = draft ?? ids;

    const commit = (commitDraft = true) => {
        if (commitDraft && draft && !sameOrder(draft, ids)) onCommit(draft);
        dragging.current = null;
        setActiveId(null);
        setDraft(null);
    };

    const bind = (id: string): ReorderBinding => ({
        isDragging: activeId === id,
        itemProps: {
            onDragOver: (event: DragEvent<HTMLElement>) => {
                const moving = dragging.current;
                if (!moving) return;

                event.preventDefault();
                if (moving === id) return;

                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = (event.clientX - rect.left) / rect.width + (event.clientY - rect.top) / rect.height;
                setDraft(moveItem(order, moving, id, ratio < 1));
            },
            onDrop: (event: DragEvent<HTMLElement>) => {
                event.preventDefault();
                commit();
            },
        },
        handleProps: {
            draggable: true,
            onDragStart: (event: DragEvent<HTMLElement>) => {
                dragging.current = id;
                setActiveId(id);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', id);

                const cell = event.currentTarget.closest('[data-grid-item]');
                if (cell) event.dataTransfer.setDragImage(cell, 24, 18);
            },
            onDragEnd: (event: DragEvent<HTMLElement>) => commit(event.dataTransfer.dropEffect !== 'move'),
        },
    });

    return { order, bind };
};

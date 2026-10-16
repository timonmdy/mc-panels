import type { Layout, PanelInstance } from '../../api/api.types';
import { createInstance } from '../../panels/registry';

const spaceId = (): string => `space:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const rowsOf = (layout: Layout) => {
    const panelIds = new Set(layout.panels.map((panel) => panel.id));
    const assigned = new Set<string>();
    const rows = (layout.rows ?? []).map((row, index) => {
        const slots = row.slots.filter((slot) => {
            if (panelIds.has(slot)) {
                if (assigned.has(slot)) return false;
                assigned.add(slot);

                return true;
            }

            return slot.startsWith('space:');
        });

        return { id: row.id || `row-${index + 1}`, slots };
    });
    const orphaned = layout.panels.filter((panel) => !assigned.has(panel.id)).map((panel) => panel.id);
    if (rows.length === 0) rows.push({ id: 'row-1', slots: orphaned });
    else if (orphaned.length) rows[rows.length - 1].slots.push(...orphaned);

    return rows;
};

const withRows = (layout: Layout, rows: ReturnType<typeof rowsOf>): Layout => {
    const spaces = new Set(rows.flatMap((row) => row.slots.filter((slot) => slot.startsWith('space:'))));
    const spaceSizes = Object.fromEntries(
        Object.entries(layout.spaceSizes ?? {}).filter(([id]) => spaces.has(id))
    );

    return { ...layout, rows, ...(Object.keys(spaceSizes).length ? { spaceSizes } : { spaceSizes: undefined }) };
};

export const addPanel = (layout: Layout, type: string): Layout => {
    const panel = createInstance(type);
    const rows = rowsOf(layout);
    const lastRow = rows[rows.length - 1];
    const freeSlot = lastRow.slots.findIndex((slot) => slot.startsWith('space:'));
    if (freeSlot < 0) lastRow.slots.push(panel.id);
    else lastRow.slots[freeSlot] = panel.id;

    return withRows({ ...layout, panels: [...layout.panels, panel] }, rows);
};

export const addRow = (layout: Layout): Layout =>
    withRows(layout, [...rowsOf(layout), { id: `row:${Date.now().toString(36)}`, slots: [spaceId()] }]);

export const addSpace = (layout: Layout, rowId: string): Layout =>
    withRows(layout, rowsOf(layout).map((row) => row.id === rowId ? { ...row, slots: [...row.slots, spaceId()] } : row));

export const removeSpace = (layout: Layout, rowId: string, id: string): Layout =>
    withRows(layout, rowsOf(layout).map((row) => row.id === rowId ? { ...row, slots: row.slots.filter((slot) => slot !== id) } : row));

export const resizeSpace = (layout: Layout, id: string, w: number, h: number): Layout => ({
    ...layout,
    spaceSizes: { ...layout.spaceSizes, [id]: { w: Math.max(1, Math.min(4, w)), h: Math.max(1, Math.min(12, h)) } },
});

export const reorderRow = (layout: Layout, rowId: string, slots: string[]): Layout =>
    withRows(layout, rowsOf(layout).map((row) => row.id === rowId ? { ...row, slots } : row));

export const moveSlotToRow = (
    layout: Layout,
    slotId: string,
    targetRowId: string,
    targetSlotId?: string,
    before = true,
): Layout => {
    const rows = rowsOf(layout);
    const sourceRow = rows.find((row) => row.slots.includes(slotId));
    const targetRow = rows.find((row) => row.id === targetRowId);
    if (!sourceRow || !targetRow || sourceRow.id === targetRowId) return layout;

    const isPanel = layout.panels.some((panel) => panel.id === slotId);
    const sourceIndex = sourceRow.slots.indexOf(slotId);
    if (isPanel) sourceRow.slots[sourceIndex] = spaceId();
    else sourceRow.slots.splice(sourceIndex, 1);
    const targetIndex = targetSlotId ? targetRow.slots.indexOf(targetSlotId) : -1;

    if (targetIndex >= 0 && targetSlotId?.startsWith('space:')) {
        targetRow.slots[targetIndex] = slotId;
    } else if (targetIndex >= 0) {
        targetRow.slots.splice(targetIndex + (before ? 0 : 1), 0, slotId);
    } else {
        const freeSlot = targetRow.slots.findIndex((slot) => slot.startsWith('space:'));
        if (freeSlot >= 0) targetRow.slots[freeSlot] = slotId;
        else targetRow.slots.push(slotId);
    }

    return withRows(layout, rows);
};

export const movePanelToRow = (
    layout: Layout,
    panelId: string,
    targetRowId: string,
    targetSlotId?: string,
    before = true,
): Layout => moveSlotToRow(layout, panelId, targetRowId, targetSlotId, before);

export const removeRow = (layout: Layout, rowId: string): Layout => {
    const rows = rowsOf(layout);
    if (rows.length < 2) return layout;
    const index = rows.findIndex((row) => row.id === rowId);
    if (index < 0) return layout;

    const [removed] = rows.splice(index, 1);
    const target = rows[Math.max(0, index - 1)];
    target.slots.push(...removed.slots);

    return withRows(layout, rows);
};

export const removePanel = (layout: Layout, id: string): Layout => {
    const rows = rowsOf(layout).map((row) => ({
        ...row,
        slots: row.slots.map((slot) => slot === id ? spaceId() : slot),
    }));

    return withRows({ ...layout, panels: layout.panels.filter((panel) => panel.id !== id) }, rows);
};

export const patchPanel = (layout: Layout, id: string, patch: Partial<PanelInstance>): Layout => ({
    ...layout,
    panels: layout.panels.map((panel) => (panel.id === id ? { ...panel, ...patch } : panel)),
});

export const updateSettings = (layout: Layout, id: string, settings: Record<string, unknown>): Layout => ({
    ...layout,
    panels: layout.panels.map((panel) => (panel.id === id ? { ...panel, settings: { ...panel.settings, ...settings } } : panel)),
});

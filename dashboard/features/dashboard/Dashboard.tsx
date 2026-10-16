import React, { DragEvent, useState } from 'react';
import styled from 'styled-components';
import type { Layout, LayoutRow, PanelInstance } from '../../api/api.types';
import { Button, EmptyState, useConfirmation } from '../../framework/ui';
import { Grid, GridItem, useReorder } from '../../framework/grid';
import { color } from '../../framework/theme';
import { getPanelDefinition, limitsOf } from '../../panels/registry';
import { PanelSettingsDialog } from '../panel-settings/PanelSettingsDialog';
import { DashboardPanel } from './DashboardPanel';
import { addRow, addSpace, movePanelToRow, moveSlotToRow, patchPanel, removePanel, removeRow, removeSpace, reorderRow, resizeSpace, rowsOf, updateSettings } from './layout.util';

const RowTools = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0 6px;
    color: ${color.muted};
    font-size: 12px;
`;

const RowHeader = styled(RowTools)`
    margin: 0 0 8px;
`;

const RowList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const RowRoot = styled.div<{ $dropActive: boolean }>`
    min-width: 0;
    padding: 0 2px 2px;
    border-radius: 12px;
    outline: 2px dashed ${(p) => p.$dropActive ? color.accent : 'transparent'};
    outline-offset: 3px;
    transition: outline-color 120ms ease;
`;

const Space = styled.div<{ $editing: boolean }>`
    display: grid;
    width: 100%;
    height: 100%;
    min-width: 0;
    place-items: center;
    border: 1px dashed ${(p) => p.$editing ? color.border : 'transparent'};
    border-radius: 12px;
    color: ${color.muted};
    font-size: 11px;
    @container (max-width: 700px) {
        ${(p) => !p.$editing && 'display: none;'}
    }
`;

const SpaceHandle = styled.span`
    cursor: grab;
    user-select: none;
`;

interface RowProps {
    row: LayoutRow;
    rowNumber: number;
    rowCount: number;
    rows: LayoutRow[];
    layout: Layout;
    byId: Map<string, PanelInstance>;
    editable: boolean;
    onChange: (layout: Layout) => void;
    onSettings: (panelId: string) => void;
    onRemovePanel: (panelId: string) => void;
    onSettingsChange: (panelId: string, settings: Record<string, unknown>) => void;
    onMoveToRow: (panelId: string, rowId: string) => void;
    onAddSpace: (rowId: string) => void;
    onRemoveSpace: (rowId: string, spaceId: string) => void;
    onRemoveRow: (rowId: string) => void;
    onDropSlot: (event: DragEvent<HTMLDivElement>, rowId: string) => void;
    draggedSlotId: string | null;
    animationsEnabled: boolean;
}

const DashboardRow = ({
    row, rowNumber, rowCount, rows, layout, byId, editable, onChange, onSettings, onRemovePanel, onSettingsChange,
    onMoveToRow, onAddSpace, onRemoveSpace, onRemoveRow,
    onDropSlot,
    draggedSlotId,
    animationsEnabled,
}: RowProps) => {
    const confirm = useConfirmation();
    const { order, bind } = useReorder(row.slots, (slots) => onChange(reorderRow(layout, row.id, slots)));
    const [dropActive, setDropActive] = useState(false);
    const rowTargets = rows
        .filter((candidate) => candidate.id !== row.id)
        .map((candidate) => ({ id: candidate.id, label: `row ${rows.indexOf(candidate) + 1}` }));

    return (
        <RowRoot
            $dropActive={dropActive}
            onDragOver={(event) => {
                const sourceRow = rows.find((candidate) => candidate.slots.includes(draggedSlotId || ''));
                if (draggedSlotId && sourceRow && sourceRow.id !== row.id) {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    setDropActive(true);
                }
            }}
            onDragLeave={(event) => {
                if (event.target === event.currentTarget) setDropActive(false);
            }}
            onDrop={(event) => {
                setDropActive(false);
                onDropSlot(event, row.id);
            }}
        >
            {editable && (
                <RowHeader>
                    <strong>Row {rowNumber}</strong>
                    <span>
                        <Button size='sm' variant='ghost' icon='plus' onClick={() => onAddSpace(row.id)}>Add space</Button>
                        {rowCount > 1 && <Button size='sm' variant='ghost' icon='trash' onClick={async () => {
                            if (await confirm({ title: 'Delete row?', message: `Delete row ${rowNumber} and all of its empty spaces? Panels will be moved to another row.` })) onRemoveRow(row.id);
                        }}>Remove row</Button>}
                    </span>
                </RowHeader>
            )}
            <Grid animationsEnabled={animationsEnabled}>
                {order.map((slot) => {
                    const instance = byId.get(slot);
                    const reorder = bind(slot);
                    if (!instance) {
                        return (
                            <GridItem
                                key={slot}
                                id={slot}
                                w={layout.spaceSizes?.[slot]?.w ?? 1}
                                h={layout.spaceSizes?.[slot]?.h ?? 1}
                                limits={{ minW: 1, maxW: 4, minH: 1, maxH: 12 }}
                                editable={editable}
                                hideOnSmall={!editable}
                                reorder={reorder}
                                onResize={(w, h) => onChange(resizeSpace(layout, slot, w, h))}
                            >
                                {(handleProps) => (
                                    <Space data-space-slot={slot} $editing={editable}>
                                        {editable ? (
                                            <>
                                                <SpaceHandle {...handleProps} aria-label='Drag empty space'>Empty space</SpaceHandle>
                                                <Button size='sm' variant='ghost' icon='close' onClick={async () => {
                                                    if (await confirm({ title: 'Remove empty space?', message: 'Remove this empty space from the dashboard?' })) onRemoveSpace(row.id, slot);
                                                }}>Remove</Button>
                                            </>
                                        ) : null}
                                    </Space>
                                )}
                            </GridItem>
                        );
                    }

                    return (
                        <GridItem
                            key={slot}
                            id={slot}
                            w={instance.w}
                            h={instance.h}
                            limits={limitsOf(getPanelDefinition(instance.type))}
                            editable={editable}
                            reorder={reorder}
                            onResize={(w, h) => onChange(patchPanel(layout, slot, { w, h }))}
                        >
                            {(handleProps) => (
                                <DashboardPanel
                                    instance={instance}
                                    canWrite={editable}
                                    handleProps={handleProps}
                                    rowTargets={editable ? rowTargets : []}
                                    onSettings={() => onSettings(slot)}
                                    onRemove={() => onRemovePanel(slot)}
                                    onMoveToRow={(rowId) => onMoveToRow(slot, rowId)}
                                    onSettingsChange={(patch) => onSettingsChange(slot, patch)}
                                />
                            )}
                        </GridItem>
                    );
                })}
            </Grid>
        </RowRoot>
    );
};

interface Props {
    layout: Layout;
    canWrite: boolean;
    editing: boolean;
    animationsEnabled: boolean;
    onChange: (layout: Layout) => void;
    onAdd: () => void;
}

export const Dashboard = ({ layout, canWrite, editing, animationsEnabled, onChange, onAdd }: Props) => {
    const confirm = useConfirmation();
    const [settingsFor, setSettingsFor] = useState<string | null>(null);
    const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
    const rows = rowsOf(layout);
    const byId = new Map(layout.panels.map((panel) => [panel.id, panel]));
    const editingInstance = settingsFor ? byId.get(settingsFor) : undefined;
    const editingDefinition = editingInstance ? getPanelDefinition(editingInstance.type) : undefined;
    const editable = canWrite && editing;
    const onDropSlot = (event: DragEvent<HTMLDivElement>, targetRowId: string) => {
        if (!editable) return;
        const slotId = event.dataTransfer.getData('text/plain');
        if (!byId.has(slotId) && !slotId.startsWith('space:')) return;

        const sourceRow = rows.find((row) => row.slots.includes(slotId));
        if (!sourceRow || sourceRow.id === targetRowId) return;

        event.preventDefault();
        const targetElement = (event.target as HTMLElement).closest<HTMLElement>('[data-grid-item], [data-space-slot]');
        const targetSlotId = targetElement?.dataset.spaceSlot ?? targetElement?.dataset.gridItem;
        const targetIsPanel = Boolean(targetSlotId && byId.has(targetSlotId));
        let before = true;
        if (targetSlotId && targetIsPanel) {
            const rect = targetElement!.getBoundingClientRect();
            before = event.clientX < rect.left + rect.width / 2;
        }

        onChange(moveSlotToRow(layout, slotId, targetRowId, targetSlotId, before));
    };

    if (!layout.panels.length && !rows.some((row) => row.slots.length > 0)) {
        return (
            <EmptyState
                icon='layers'
                title='This profile has no panels yet'
                hint={canWrite ? 'Add panels to build your dashboard.' : 'Ask someone with access to set this profile up.'}
                action={canWrite ? <Button variant='primary' icon='plus' onClick={onAdd}>Add panel</Button> : undefined}
            />
        );
    }

    return (
        <div
            onDragStart={(event) => {
                const slotId = event.dataTransfer.getData('text/plain');
                setDraggedSlotId(byId.has(slotId) || slotId.startsWith('space:') ? slotId : null);
            }}
            onDragEnd={() => setDraggedSlotId(null)}
        >
            {editable && <RowTools><span>Drag panels between rows or use panel options. Reorder panels and spaces within each row.</span><Button size='sm' variant='secondary' icon='plus' onClick={() => onChange(addRow(layout))}>Add row</Button></RowTools>}
            <RowList>
                {rows.map((row, index) => (
                    <DashboardRow
                        key={row.id}
                        row={row}
                        rowNumber={index + 1}
                        rowCount={rows.length}
                        rows={rows}
                        layout={layout}
                        byId={byId}
                        editable={editable}
                        onChange={onChange}
                        onSettings={setSettingsFor}
                        onRemovePanel={async (id) => {
                            const panel = byId.get(id);
                            if (await confirm({ title: 'Remove panel?', message: `Remove "${panel ? getPanelDefinition(panel.type)?.title ?? panel.type : 'this panel'}" from the dashboard?` })) {
                                onChange(removePanel(layout, id));
                            }
                        }}
                        onSettingsChange={(id, settings) => onChange(updateSettings(layout, id, settings))}
                        onMoveToRow={(id, rowId) => onChange(movePanelToRow(layout, id, rowId))}
                        onAddSpace={(rowId) => onChange(addSpace(layout, rowId))}
                        onRemoveSpace={(rowId, spaceId) => onChange(removeSpace(layout, rowId, spaceId))}
                        onRemoveRow={(rowId) => onChange(removeRow(layout, rowId))}
                        onDropSlot={onDropSlot}
                        draggedSlotId={draggedSlotId}
                        animationsEnabled={animationsEnabled}
                    />
                ))}
            </RowList>

            {editingInstance && editingDefinition && (
                <PanelSettingsDialog
                    instance={editingInstance}
                    definition={editingDefinition}
                    onSave={(settings) => onChange(updateSettings(layout, editingInstance.id, settings))}
                    onClose={() => setSettingsFor(null)}
                />
            )}
        </div>
    );
};

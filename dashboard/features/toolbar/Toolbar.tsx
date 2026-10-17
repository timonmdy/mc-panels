import React, { ReactNode } from 'react';
import type { TimeSpan } from '../../api/api.types';
import { IconButton, Menu, MenuItem, MenuLabel, MenuSeparator, Segmented } from '../../framework/ui';
import { Group, Notice, Root } from './Toolbar.styles';

interface Props {
    switcher: ReactNode;
    spans: TimeSpan[];
    span: string;
    canWrite: boolean;
    canExploreData: boolean;
    canManagePermissions: boolean;
    editing: boolean;
    saving: boolean;
    error: string | null;
    onSpan: (key: string) => void;
    onRefresh: () => void;
    onAdd: () => void;
    onExploreData: () => void;
    onManagePermissions: () => void;
    onToggleEdit: () => void;
}

export const Toolbar = ({ switcher, spans, span, canWrite, canExploreData, canManagePermissions, editing, saving, error, onSpan, onRefresh, onAdd, onExploreData, onManagePermissions, onToggleEdit }: Props) => (
    <Root>
        <Group>
            {switcher}
            {error ? <Notice $tone='bad'>{error}</Notice> : saving ? <Notice>Saving...</Notice> : null}
        </Group>
        <Group>
            <Segmented value={span} onChange={onSpan} options={spans.map((s) => ({ value: s.key, label: s.label.replace(' hours', ' h').replace(' hour', ' h').replace(' days', ' d').replace(' day', ' d') }))} />
            <IconButton icon='refresh' label='Refresh now' onClick={onRefresh} />
            {(canWrite || canExploreData || canManagePermissions) && (
                <Menu
                    renderTrigger={({ ref, onClick, active }) => (
                        <IconButton ref={ref} icon='more' label='Dashboard actions' onClick={onClick} active={active} />
                    )}
                >
                    {canWrite && (
                        <>
                            <MenuLabel>Dashboard</MenuLabel>
                            <MenuItem label={editing ? 'Done editing' : 'Edit layout'} icon='edit' onSelect={onToggleEdit} />
                            <MenuItem label='Add panel' icon='plus' onSelect={onAdd} />
                        </>
                    )}
                    {canWrite && (canExploreData || canManagePermissions) && <MenuSeparator />}
                    {(canExploreData || canManagePermissions) && <MenuLabel>Administration</MenuLabel>}
                    {canExploreData && <MenuItem label='Stored data' icon='layers' onSelect={onExploreData} />}
                    {canManagePermissions && <MenuItem label='Permissions' icon='shield' onSelect={onManagePermissions} />}
                </Menu>
            )}
        </Group>
    </Root>
);

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
    canManageAccessKeys: boolean;
    editing: boolean;
    saving: boolean;
    error: string | null;
    onSpan: (key: string) => void;
    onRefresh: () => void;
    onAdd: () => void;
    onExploreData: () => void;
    onManageAccessKeys: () => void;
    onEnterAccessKey: () => void;
    onToggleEdit: () => void;
}

export const Toolbar = ({ switcher, spans, span, canWrite, canExploreData, canManageAccessKeys, editing, saving, error, onSpan, onRefresh, onAdd, onExploreData, onManageAccessKeys, onEnterAccessKey, onToggleEdit }: Props) => (
    <Root>
        <Group>
            {switcher}
            {error ? <Notice $tone='bad'>{error}</Notice> : saving ? <Notice>Saving...</Notice> : null}
        </Group>
        <Group>
            <Segmented value={span} onChange={onSpan} options={spans.map((s) => ({ value: s.key, label: s.label.replace(' hours', ' h').replace(' hour', ' h').replace(' days', ' d').replace(' day', ' d') }))} />
            <IconButton icon='refresh' label='Refresh now' onClick={onRefresh} />
            <Menu
                renderTrigger={({ ref, onClick, active }) => (
                    <IconButton ref={ref} icon='more' label='Dashboard actions' onClick={onClick} active={active} />
                )}
            >
                {(canWrite || canExploreData || canManageAccessKeys) && (
                    <>
                        {canWrite && (
                            <>
                                <MenuLabel>Dashboard</MenuLabel>
                                <MenuItem label={editing ? 'Done editing' : 'Edit layout'} icon='edit' onSelect={onToggleEdit} />
                                <MenuItem label='Add panel' icon='plus' onSelect={onAdd} />
                            </>
                        )}
                        {canWrite && (canExploreData || canManageAccessKeys) && <MenuSeparator />}
                        {(canExploreData || canManageAccessKeys) && <MenuLabel>Administration</MenuLabel>}
                        {canExploreData && <MenuItem label='Stored data' icon='layers' onSelect={onExploreData} />}
                        {canManageAccessKeys && <MenuItem label='Access keys' icon='shield' onSelect={onManageAccessKeys} />}
                        <MenuSeparator />
                    </>
                )}
                <MenuItem label='Enter access key' icon='shield' onSelect={onEnterAccessKey} />
            </Menu>
        </Group>
    </Root>
);

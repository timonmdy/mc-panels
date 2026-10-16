import React, { HTMLAttributes, ReactNode } from 'react';
import { Icon, IconButton, IconName, Menu, MenuItem, MenuSeparator } from '../ui';
import { Body, Handle, Header, Root, Title } from './PanelFrame.styles';

interface Props {
    title: string;
    icon: IconName;
    handleProps?: HTMLAttributes<HTMLElement>;
    onSettings?: () => void;
    onRemove?: () => void;
    rowTargets?: Array<{ id: string; label: string }>;
    onMoveToRow?: (rowId: string) => void;
    children: ReactNode;
}

export const PanelFrame = ({ title, icon, handleProps, onSettings, onRemove, rowTargets = [], onMoveToRow, children }: Props) => (
    <Root>
        <Header>
            <Title>
                <Icon name={icon} fixedWidth />
                <span>{title}</span>
            </Title>
            {handleProps && (
                <Handle aria-label='Drag to move' title='Drag to move' {...handleProps}>
                    <Icon name='grip' />
                </Handle>
            )}
            {(onSettings || onRemove || (rowTargets.length > 0 && onMoveToRow)) && (
                <Menu renderTrigger={({ ref, onClick, active }) => <IconButton ref={ref} icon='more' label='Panel options' active={active} onClick={onClick} />}>
                    {onSettings && <MenuItem icon='settings' label='Panel settings' onSelect={onSettings} />}
                    {(onSettings || rowTargets.length > 0) && onRemove && <MenuSeparator />}
                    {onMoveToRow && rowTargets.map((row) => (
                        <MenuItem key={row.id} icon='layers' label={`Move to ${row.label}`} onSelect={() => onMoveToRow(row.id)} />
                    ))}
                    {onMoveToRow && rowTargets.length > 0 && onRemove && <MenuSeparator />}
                    {onRemove && <MenuItem icon='trash' label='Remove panel' danger onSelect={onRemove} />}
                </Menu>
            )}
        </Header>
        <Body>{children}</Body>
    </Root>
);

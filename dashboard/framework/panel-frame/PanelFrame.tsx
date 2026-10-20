import React, { HTMLAttributes, ReactNode, useState } from 'react';
import { Icon, IconButton, IconName, Menu, MenuItem, MenuSeparator, Modal } from '../ui';
import { Body, Handle, Header, Root, Title } from './PanelFrame.styles';

interface Props {
    title: string;
    icon: IconName;
    info?: ReactNode;
    handleProps?: HTMLAttributes<HTMLElement>;
    onSettings?: () => void;
    onRemove?: () => void;
    rowTargets?: Array<{ id: string; label: string }>;
    onMoveToRow?: (rowId: string) => void;
    children: ReactNode;
}

export const PanelFrame = ({ title, icon, info, handleProps, onSettings, onRemove, rowTargets = [], onMoveToRow, children }: Props) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
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
                {(info || onSettings || onRemove || (rowTargets.length > 0 && onMoveToRow)) && (
                    <Menu renderTrigger={({ ref, onClick, active }) => <IconButton ref={ref} icon='more' label='Panel options' active={active} onClick={onClick} />}>
                        {info && <MenuItem icon='info' label='Panel information' onSelect={() => setIsInfoOpen(true)} />}
                        {info && onSettings && <MenuSeparator />}
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
            {info && isInfoOpen && <Modal title={`${title} information`} onClose={() => setIsInfoOpen(false)}>{info}</Modal>}
        </Root>
    );
};

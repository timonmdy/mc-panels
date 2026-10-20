import React, { HTMLAttributes, useState } from 'react';
import type { PanelInstance } from '../../api/api.types';
import { PanelFrame } from '../../framework/panel-frame';
import { EmptyState, Icon, IconButton, Menu, MenuItem, MenuSeparator, Modal } from '../../framework/ui';
import { getPanelDefinition } from '../../panels/registry';
import { BareWrap, Floating } from './DashboardPanel.styles';

interface Props {
    instance: PanelInstance;
    canWrite: boolean;
    handleProps?: HTMLAttributes<HTMLElement>;
    rowTargets: Array<{ id: string; label: string }>;
    onSettings: () => void;
    onRemove: () => void;
    onMoveToRow: (rowId: string) => void;
    onSettingsChange: (patch: Record<string, unknown>) => void;
}

export const DashboardPanel = ({ instance, canWrite, handleProps, rowTargets, onSettings, onRemove, onMoveToRow, onSettingsChange }: Props) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const definition = getPanelDefinition(instance.type);

    if (!definition) {
        return (
            <PanelFrame
                title='Unknown panel'
                icon='warning'
                onRemove={canWrite ? onRemove : undefined}
                rowTargets={canWrite ? rowTargets : []}
                onMoveToRow={canWrite ? onMoveToRow : undefined}
            >
                <EmptyState icon='warning' title={`"${instance.type}" is not available`} hint='This panel type was removed or belongs to a newer version. You can remove it.' />
            </PanelFrame>
        );
    }

    const settings = { ...definition.defaultSettings, ...instance.settings };
    const Body = definition.component;
    const body = <Body id={instance.id} settings={settings} size={{ w: instance.w, h: instance.h }} updateSettings={onSettingsChange} />;
    const hasSettings = definition.fields.length > 0;

    if (definition.bare) {
        return (
            <BareWrap>
                {body}
                {(canWrite || definition.info) && (
                    <Floating>
                        {canWrite && handleProps && <span {...handleProps} style={{ display: 'grid', placeItems: 'center', width: 24, cursor: 'grab' }}><Icon name='grip' /></span>}
                        <Menu renderTrigger={({ ref, onClick, active }) => <IconButton ref={ref} icon='more' label='Panel options' active={active} onClick={onClick} />}>
                            {definition.info && <MenuItem icon='info' label='Panel information' onSelect={() => setIsInfoOpen(true)} />}
                            {definition.info && canWrite && hasSettings && <MenuSeparator />}
                            {canWrite && hasSettings && <MenuItem icon='settings' label='Panel settings' onSelect={onSettings} />}
                            {canWrite && rowTargets.map((row) => <MenuItem key={row.id} icon='layers' label={`Move to ${row.label}`} onSelect={() => onMoveToRow(row.id)} />)}
                            {canWrite && rowTargets.length > 0 && <MenuSeparator />}
                            {canWrite && <MenuItem icon='trash' label='Remove panel' danger onSelect={onRemove} />}
                        </Menu>
                    </Floating>
                )}
                {definition.info && isInfoOpen && (
                    <Modal title={`${definition.title} information`} onClose={() => setIsInfoOpen(false)}>
                        {definition.info}
                    </Modal>
                )}
            </BareWrap>
        );
    }

    return (
        <PanelFrame
            title={definition.titleOf ? definition.titleOf(settings) : definition.title}
            icon={definition.icon}
            info={definition.info}
            handleProps={handleProps}
            onSettings={canWrite && hasSettings ? onSettings : undefined}
            onRemove={canWrite ? onRemove : undefined}
            rowTargets={canWrite ? rowTargets : []}
            onMoveToRow={canWrite ? onMoveToRow : undefined}
        >
            {body}
        </PanelFrame>
    );
};

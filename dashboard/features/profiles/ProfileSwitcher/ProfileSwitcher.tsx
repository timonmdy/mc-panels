import React, { useState } from 'react';
import type { Layout, ProfileDto } from '../../../api/api.types';
import { Button, Icon, Menu, MenuItem, MenuLabel, MenuSeparator, useConfirmation } from '../../../framework/ui';
import { NameDialog } from '../NameDialog/NameDialog';
import { NewProfileDialog } from '../NewProfileDialog/NewProfileDialog';

interface Props {
    profiles: ProfileDto[];
    templates: ProfileDto[];
    active: ProfileDto | null;
    canWrite: boolean;
    onSelect: (id: number) => void;
    onCreate: (name: string, layout: Layout) => void;
    onRename: (id: number, name: string) => void;
    onDuplicate: (profile: ProfileDto) => void;
    onDelete: (id: number) => void;
    onSaveTemplate: (name: string, layout: Layout) => void;
    onDeleteTemplate: (template: ProfileDto) => void;
}

type Dialog = 'new' | 'rename' | 'template' | null;

export const ProfileSwitcher = ({ profiles, templates, active, canWrite, onSelect, onCreate, onRename, onDuplicate, onDelete, onSaveTemplate, onDeleteTemplate }: Props) => {
    const confirm = useConfirmation();
    const [dialog, setDialog] = useState<Dialog>(null);
    const close = () => setDialog(null);

    return (
        <>
            <Menu align='start' renderTrigger={({ ref, onClick }) => (
                <Button ref={ref} variant='secondary' onClick={onClick}>
                    <Icon name='layers' />
                    {active?.name ?? 'Profile'}
                    <Icon name='chevronDown' />
                </Button>
            )}>
                <MenuLabel>Profiles</MenuLabel>
                {profiles.map((profile) => (
                    <MenuItem key={profile.id} label={profile.name} active={profile.id === active?.id} onSelect={() => onSelect(profile.id)} />
                ))}
                {canWrite && active && (
                    <>
                        <MenuSeparator />
                        <MenuItem icon='plus' label='New profile' onSelect={() => setDialog('new')} />
                        <MenuItem icon='edit' label='Rename' onSelect={() => setDialog('rename')} />
                        <MenuItem icon='copy' label='Duplicate' onSelect={() => onDuplicate(active)} />
                        <MenuItem icon='template' label='Save as template' onSelect={() => setDialog('template')} />
                        <MenuItem icon='trash' label='Delete profile' danger disabled={profiles.length < 2} onSelect={async () => {
                            if (await confirm({ title: 'Delete profile?', message: `Delete the "${active.name}" profile? This cannot be undone.` })) onDelete(active.id);
                        }} />
                    </>
                )}
            </Menu>

            {dialog === 'new' && <NewProfileDialog customTemplates={templates} onCreate={onCreate} onDeleteTemplate={onDeleteTemplate} onClose={close} />}
            {dialog === 'rename' && active && <NameDialog title='Rename profile' label='Profile name' submitLabel='Save name' initialValue={active.name} onSubmit={(name) => onRename(active.id, name)} onClose={close} />}
            {dialog === 'template' && active && <NameDialog title='Save as template' label='Template name' submitLabel='Save template' initialValue={active.name} onSubmit={(name) => onSaveTemplate(name, active.layout)} onClose={close} />}
        </>
    );
};

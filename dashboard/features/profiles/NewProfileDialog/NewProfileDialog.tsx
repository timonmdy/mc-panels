import React, { useState } from 'react';
import type { Layout, ProfileDto } from '../../../api/api.types';
import { Button, Field, Input, Modal, useConfirmation } from '../../../framework/ui';
import { BUILT_IN_TEMPLATES, DEFAULT_TEMPLATE_ID } from '../../templates/templates.config';
import { cloneLayout, layoutFromSpec } from '../../templates/templates.util';
import { Card, Grid, Heading } from './NewProfileDialog.styles';

interface Props {
    customTemplates: ProfileDto[];
    onCreate: (name: string, layout: Layout) => void;
    onDeleteTemplate: (template: ProfileDto) => void;
    onClose: () => void;
}

export const NewProfileDialog = ({ customTemplates, onCreate, onDeleteTemplate, onClose }: Props) => {
    const confirm = useConfirmation();
    const [profileName, setProfileName] = useState('');
    const [selected, setSelected] = useState(`builtin:${DEFAULT_TEMPLATE_ID}`);

    const build = (): Layout => {
        if (selected.startsWith('custom:')) {
            const template = customTemplates.find((t) => `custom:${t.id}` === selected);

            return template ? cloneLayout(template.layout) : { panels: [] };
        }
        const spec = BUILT_IN_TEMPLATES.find((t) => `builtin:${t.id}` === selected) ?? BUILT_IN_TEMPLATES[0];

        return layoutFromSpec(spec);
    };

    const submit = () => {
        if (!profileName.trim()) return;
        onCreate(profileName.trim(), build());
        onClose();
    };

    return (
        <Modal
            title='New profile'
            onClose={onClose}
            width={640}
            footer={
                <>
                    <Button variant='ghost' onClick={onClose}>Cancel</Button>
                    <Button variant='primary' disabled={!profileName.trim()} onClick={submit}>Create profile</Button>
                </>
            }
        >
            <Field label='Profile name'>
                <Input autoFocus value={profileName} maxLength={64} placeholder='e.g. Event night' onChange={(e) => setProfileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
            </Field>

            <Heading>Start from a template</Heading>
            <Grid>
                {BUILT_IN_TEMPLATES.map((template) => (
                    <Card key={template.id} type='button' $selected={selected === `builtin:${template.id}`} onClick={() => setSelected(`builtin:${template.id}`)}>
                        <strong>{template.name}</strong>
                        <small>{template.description}</small>
                    </Card>
                ))}
            </Grid>

            {customTemplates.length > 0 && (
                <>
                    <Heading>Your templates</Heading>
                    <Grid>
                        {customTemplates.map((template) => (
                            <Card key={template.id} type='button' $selected={selected === `custom:${template.id}`} onClick={() => setSelected(`custom:${template.id}`)}>
                                <strong>{template.name}</strong>
                                <small>{template.layout.panels.length} panels</small>
                                <Button size='sm' variant='ghost' icon='trash' onClick={async (e) => {
                                    e.stopPropagation();
                                    if (await confirm({ title: 'Delete template?', message: `Delete the "${template.name}" template? This cannot be undone.` })) onDeleteTemplate(template);
                                }}>Delete</Button>
                            </Card>
                        ))}
                    </Grid>
                </>
            )}
        </Modal>
    );
};

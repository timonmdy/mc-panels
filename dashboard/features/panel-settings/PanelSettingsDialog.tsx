import React, { useState } from 'react';
import type { PanelInstance } from '../../api/api.types';
import { Button, Modal } from '../../framework/ui';
import type { AnyPanelDefinition } from '../../panels/registry';
import { SettingsForm } from './SettingsForm';

interface Props {
    instance: PanelInstance;
    definition: AnyPanelDefinition;
    onSave: (settings: Record<string, unknown>) => void;
    onClose: () => void;
}

export const PanelSettingsDialog = ({ instance, definition, onSave, onClose }: Props) => {
    const [draft, setDraft] = useState<Record<string, unknown>>({ ...definition.defaultSettings, ...instance.settings });

    return (
        <Modal
            title={`${definition.titleOf ? definition.titleOf(draft) : definition.title} settings`}
            onClose={onClose}
            width={definition.fields.some((field) => field.kind === 'regex-list') ? 680 : 460}
            footer={
                <>
                    <Button variant='ghost' onClick={onClose}>Cancel</Button>
                    <Button variant='primary' onClick={() => { onSave(draft); onClose(); }}>Save settings</Button>
                </>
            }
        >
            <SettingsForm fields={definition.fields} values={draft} onChange={(key, value) => setDraft((prev) => ({ ...prev, [key]: value }))} />
        </Modal>
    );
};

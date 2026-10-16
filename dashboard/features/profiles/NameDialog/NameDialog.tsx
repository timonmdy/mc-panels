import React, { useState } from 'react';
import { Button, Field, Input, Modal } from '../../../framework/ui';

interface Props {
    title: string;
    label: string;
    submitLabel: string;
    initialValue?: string;
    onSubmit: (name: string) => void;
    onClose: () => void;
}

export const NameDialog = ({ title, label, submitLabel, initialValue = '', onSubmit, onClose }: Props) => {
    const [profileName, setProfileName] = useState(initialValue);
    const valid = profileName.trim().length > 0;
    const submit = () => {
        if (!valid) return;
        onSubmit(profileName.trim());
        onClose();
    };

    return (
        <Modal
            title={title}
            onClose={onClose}
            width={420}
            footer={
                <>
                    <Button variant='ghost' onClick={onClose}>Cancel</Button>
                    <Button variant='primary' disabled={!valid} onClick={submit}>{submitLabel}</Button>
                </>
            }
        >
            <Field label={label}>
                <Input autoFocus value={profileName} maxLength={64} onChange={(e) => setProfileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
            </Field>
        </Modal>
    );
};

import React, { useState } from 'react';
import { getAccessKey, setAccessKey } from '../../api/client';
import { Button, Input, Modal } from '../../framework/ui';

interface Props {
    uuid: string;
    onConnect: () => void;
    onClose: () => void;
}

export const AccessKeyEntryDialog = ({ uuid, onConnect, onClose }: Props) => {
    const [key, setKey] = useState(() => getAccessKey(uuid));
    const hasSavedKey = Boolean(getAccessKey(uuid));

    const connect = () => {
        setAccessKey(uuid, key);
        onConnect();
        onClose();
    };

    const forget = () => {
        setAccessKey(uuid, '');
        setKey('');
        onConnect();
        onClose();
    };

    return (
        <Modal
            title='Connect with an access key'
            onClose={onClose}
            footer={(
                <>
                    {hasSavedKey && <Button variant='ghost' onClick={forget}>Forget saved key</Button>}
                    <Button variant='primary' disabled={!key.trim()} onClick={connect}>Save key and connect</Button>
                </>
            )}
        >
            <p>Paste the MC Panels key shared with you. It will be saved in this browser for this server.</p>
            <form onSubmit={(event) => { event.preventDefault(); if (key.trim()) connect(); }}>
                <Input
                    autoFocus
                    type='password'
                    autoComplete='off'
                    placeholder='Server access key'
                    value={key}
                    onChange={(event) => setKey(event.target.value)}
                    aria-label='MC Panels server access key'
                />
            </form>
        </Modal>
    );
};

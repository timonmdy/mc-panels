import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { AccessKeyRecord, CreatedAccessKey } from '../../api/api.types';
import { createAccessKey, deleteAccessKey, fetchAccessKeys } from '../../api/access-keys.api';
import { errorMessage } from '../../api/client';
import { color } from '../../framework/theme';
import { Button, Input, Modal, Spinner } from '../../framework/ui';
import { useConfirmation } from '../../framework/ui';

const GrantList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
    margin: 12px 0;

    label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${color.muted};
        font-size: 12px;
    }
`;

const KeyCard = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    padding: 12px;
    border: 1px solid ${color.border};
    border-radius: 8px;
    background: ${color.raised};

    small {
        display: block;
        margin-top: 4px;
        color: ${color.muted};
        overflow-wrap: anywhere;
    }
`;

const Section = styled.section`
    margin-top: 20px;

    h3 {
        margin: 0 0 8px;
        font-size: 14px;
    }
`;

interface Props {
    uuid: string;
    onClose: () => void;
}

const GRANTS = [
    ['view', 'View dashboard'],
    ['edit', 'Edit layouts and profiles'],
    ['data.view', 'View stored data'],
    ['data.manage', 'Edit and delete stored data'],
    ['ips.view', 'View player IP addresses'],
    ['*', 'All MC Panels permissions (*)'],
];

export const AccessKeysDialog = ({ uuid, onClose }: Props) => {
    const confirm = useConfirmation();
    const [records, setRecords] = useState<AccessKeyRecord[]>([]);
    const [keyName, setKeyName] = useState('');
    const [permissions, setPermissions] = useState<string[]>(['view']);
    const [created, setCreated] = useState<CreatedAccessKey | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        setLoading(true);
        fetchAccessKeys(uuid)
            .then((response) => setRecords(response.keys))
            .catch((failure) => setError(errorMessage(failure)))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
    }, [uuid]);

    const toggleGrant = (grant: string) => {
        setPermissions((current) => {
            return current.includes(grant)
                ? current.filter((item) => item !== grant)
                : [...current, grant];
        });
    };

    const create = async () => {
        setError(null);
        setSaving(true);
        try {
            const result = await createAccessKey(uuid, keyName, permissions);
            setCreated(result);
            setKeyName('');
            setPermissions(['view']);
            refresh();
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    const remove = async (record: AccessKeyRecord) => {
        if (!await confirm({
            title: 'Revoke access key?',
            message: `Users storing "${record.name}" will lose MC Panels access immediately.`,
            confirmLabel: 'Revoke key',
        })) return;

        setError(null);
        setSaving(true);
        try {
            await deleteAccessKey(uuid, record.id);
            setRecords((current) => current.filter((item) => item.id !== record.id));
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title='MC Panels access keys' onClose={onClose} width={720}>
            <p style={{ color: color.muted, fontSize: 12, marginTop: 0 }}>
                Keys are stored in this server&apos;s <code>mcpanels.credentials</code> file as hashes. The secret is shown only once after creation.
            </p>
            {error && <p role='alert' style={{ color: color.bad }}>{error}</p>}
            {created && (
                <div style={{ padding: 12, border: `1px solid ${color.warn}`, borderRadius: 8 }}>
                    <strong>Copy this key now. It cannot be displayed again.</strong>
                    <Input readOnly value={created.key} onFocus={(event) => event.currentTarget.select()} aria-label='New access key' />
                    <small style={{ color: color.muted }}>The person using this key can paste it into the Panels access-key prompt. It will be stored in their browser for this server.</small>
                    <div style={{ marginTop: 8 }}><Button size='sm' variant='ghost' onClick={() => setCreated(null)}>I saved the key</Button></div>
                </div>
            )}

            <Section>
                <h3>Create a key</h3>
                <Input value={keyName} onChange={(event) => setKeyName(event.target.value)} maxLength={64} placeholder='Key name, e.g. Dashboard viewer' />
                <GrantList>
                    {GRANTS.map(([key, label]) => (
                        <label key={key}>
                            <input
                                type='checkbox'
                                checked={permissions.includes(key)}
                                onChange={() => toggleGrant(key)}
                            />
                            {label}
                        </label>
                    ))}
                </GrantList>
                <Button variant='primary' icon='plus' loading={saving} disabled={!keyName.trim() || permissions.length === 0} onClick={create}>Create access key</Button>
                <p style={{ color: color.muted, fontSize: 11 }}>
                    Edit combines layout and profile editing. Data management includes data viewing. Edit, data, and IP grants also allow dashboard viewing. IP addresses require ips.view. A * key grants everything, including key management.
                </p>
            </Section>

            <Section>
                <h3>Active keys</h3>
                {loading ? <Spinner /> : records.length ? records.map((record) => (
                    <KeyCard key={record.id}>
                        <div>
                            <strong>{record.name}</strong>
                            <small>{record.permissions.join(', ')} · Created {record.createdAt}</small>
                        </div>
                        <Button size='sm' variant='danger' icon='trash' loading={saving} onClick={() => remove(record)}>Revoke</Button>
                    </KeyCard>
                )) : <p style={{ color: color.muted }}>No access keys have been created for this server.</p>}
            </Section>
        </Modal>
    );
};

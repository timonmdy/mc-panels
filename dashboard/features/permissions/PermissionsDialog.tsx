import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { ServerGrant, ServerPermissionRequest, ServerPermissionUser, ServerPermissionsResponse } from '../../api/api.types';
import { errorMessage } from '../../api/client';
import {
    approveAccessRequest,
    denyAccessRequest,
    fetchAccessRequests,
    fetchServerPermissions,
    requestServerAccess,
    revokeUserPermissions,
    saveGuestPermissions,
    saveUserPermissions,
} from '../../api/permissions.api';
import { color } from '../../framework/theme';
import { Button, Input, Modal, Spinner, useConfirmation } from '../../framework/ui';
import { confirmPermissionGrant } from './permission.util';
import { PermissionSelector } from './PermissionSelector';

const Section = styled.section`
    margin-top: 20px;

    h3 {
        margin: 0 0 6px;
        font-size: 14px;
    }
`;

const DefaultsDisclosure = styled.details`
    margin-top: 12px;
    border: 1px solid ${color.border};
    border-radius: 8px;
    background: ${color.raised};

    summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        list-style: none;

        &::-webkit-details-marker {
            display: none;
        }

        &::after {
            content: '›';
            color: ${color.muted};
            font-size: 20px;
            transform: rotate(90deg);
            transition: transform 120ms ease;
        }

        small {
            color: ${color.muted};
        }
    }

    &[open] summary {
        border-bottom: 1px solid ${color.border};

        &::after {
            transform: rotate(-90deg);
        }
    }

    > div {
        padding: 4px 12px 12px;
    }
`;

const Description = styled.p`
    margin: 0 0 10px;
    color: ${color.muted};
    font-size: 12px;
`;

const Record = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
    padding: 11px;
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

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
`;

interface Props {
    uuid: string;
    onClose: () => void;
}

export const PermissionsDialog = ({ uuid, onClose }: Props) => {
    const confirm = useConfirmation();
    const [data, setData] = useState<ServerPermissionsResponse | null>(null);
    const [guestPermissions, setGuestPermissions] = useState<ServerGrant[]>([]);
    const [email, setEmail] = useState('');
    const [userPermissions, setUserPermissions] = useState<ServerGrant[]>(['view']);
    const [editingUser, setEditingUser] = useState<ServerPermissionUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshingRequests, setRefreshingRequests] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await fetchServerPermissions(uuid);
            setData(result);
            setGuestPermissions(result.guestPermissions);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setLoading(false);
        }
    };

    const refreshRequests = async () => {
        setError(null);
        setRefreshingRequests(true);
        try {
            const result = await fetchAccessRequests(uuid);
            setData((current) => current ? { ...current, requests: result.requests } : current);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setRefreshingRequests(false);
        }
    };

    useEffect(() => {
        void refresh();
    }, [uuid]);

    const saveGuests = async () => {
        const newlyGranted = guestPermissions.filter((permission) => !data?.guestPermissions.includes(permission));
        if (!await confirmPermissionGrant(confirm, newlyGranted, 'all signed-in server users')) return;

        setError(null);
        setSaving(true);
        try {
            const result = await saveGuestPermissions(uuid, guestPermissions);
            setGuestPermissions(result.permissions);
            setData((current) => current ? { ...current, guestPermissions: result.permissions } : current);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    const saveUser = async () => {
        if (!email.trim() || userPermissions.length === 0) return;
        const previousPermissions = editingUser?.permissions ?? [];
        const newlyGranted = userPermissions.filter((permission) => !previousPermissions.includes(permission));
        if (!await confirmPermissionGrant(confirm, newlyGranted, email.trim())) return;

        setError(null);
        setSaving(true);
        try {
            const result = await saveUserPermissions(uuid, email, userPermissions);
            setData((current) => current ? {
                ...current,
                users: [...current.users.filter((user) => user.id !== result.id), result].sort((a, b) => a.email.localeCompare(b.email)),
            } : current);
            setEmail('');
            setEditingUser(null);
            setUserPermissions(['view']);
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    const editUser = (user: ServerPermissionUser) => {
        setEditingUser(user);
        setEmail(user.email);
        setUserPermissions(user.permissions);
    };

    const revokeUser = async (user: ServerPermissionUser) => {
        if (!await confirm({
            title: 'Remove individual permissions?',
            message: `${user.email} will lose these individual grants. Any guest permissions configured for everyone will still apply.`,
            confirmLabel: 'Remove grants',
            destructive: false,
        })) return;

        setError(null);
        setSaving(true);
        try {
            await revokeUserPermissions(uuid, user.id);
            setData((current) => current ? { ...current, users: current.users.filter((entry) => entry.id !== user.id) } : current);
            if (editingUser?.id === user.id) {
                setEditingUser(null);
                setEmail('');
                setUserPermissions(['view']);
            }
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    const reviewRequest = async (request: ServerPermissionRequest, approve: boolean) => {
        if (approve && !await confirmPermissionGrant(confirm, ['view'], request.email)) return;
        if (!approve && !await confirm({
            title: 'Deny access request?',
            message: `Deny ${request.email}'s request to view this server's MC Panels dashboard?`,
            confirmLabel: 'Deny request',
            destructive: false,
        })) return;

        setError(null);
        setSaving(true);
        try {
            if (approve) await approveAccessRequest(uuid, request.id);
            else await denyAccessRequest(uuid, request.id);
            await refresh();
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title='Server permissions' onClose={onClose} width={760}>
            <Description>
                Configure who can use MC Panels for this server. Users must have an existing Pterodactyl account and access to this server.
            </Description>
            {error && data && <p role='alert' style={{ color: color.bad }}>{error}</p>}
            {loading ? <Spinner /> : !data ? (
                <div role='alert'>
                    <p style={{ color: color.bad }}>{error ?? 'Unable to load server permissions.'}</p>
                    <Button variant='secondary' loading={loading} onClick={refresh}>Retry</Button>
                </div>
            ) : (
                <>
                    <Section>
                        <DefaultsDisclosure>
                            <summary>
                                <strong>Server-wide defaults</strong>
                                <small>{guestPermissions.length} {guestPermissions.length === 1 ? 'permission' : 'permissions'} enabled</small>
                            </summary>
                            <div>
                                <Description>Defaults for every signed-in Pterodactyl user who can already access this server. Individual user grants below add to these defaults.</Description>
                                <PermissionSelector value={guestPermissions} onChange={setGuestPermissions} />
                                <Button variant='primary' loading={saving} onClick={saveGuests}>Save defaults</Button>
                            </div>
                        </DefaultsDisclosure>
                    </Section>

                    <Section>
                        <h3>{editingUser ? `Edit ${editingUser.email}` : 'Grant a user access'}</h3>
                        <Description>Enter the email address of an existing Pterodactyl account. These grants are added to guest permissions.</Description>
                        <Input
                            type='email'
                            autoComplete='email'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={Boolean(editingUser)}
                            maxLength={191}
                            placeholder='user@example.com'
                            aria-label='Pterodactyl user email'
                        />
                        <PermissionSelector value={userPermissions} onChange={setUserPermissions} />
                        <Actions>
                            <Button variant='primary' icon={editingUser ? 'check' : 'plus'} loading={saving} disabled={!email.trim() || userPermissions.length === 0} onClick={saveUser}>
                                {editingUser ? 'Save user permissions' : 'Grant access'}
                            </Button>
                            {editingUser && <Button variant='ghost' onClick={() => { setEditingUser(null); setEmail(''); setUserPermissions(['view']); }}>Cancel edit</Button>}
                        </Actions>
                    </Section>

                    <Section>
                        <h3>Individual user grants</h3>
                        {data.users.length === 0 ? <Description>No individual user grants yet.</Description> : data.users.map((user) => (
                            <Record key={user.id}>
                                <div>
                                    <strong>{user.email}</strong>
                                    <small>{user.permissions.join(', ') || 'No additional permissions'} · Updated {new Date(user.updatedAt).toLocaleString()}</small>
                                </div>
                                <Actions>
                                    <Button size='sm' variant='secondary' loading={saving} onClick={() => editUser(user)}>Edit</Button>
                                    <Button size='sm' variant='danger' loading={saving} onClick={() => revokeUser(user)}>Remove</Button>
                                </Actions>
                            </Record>
                        ))}
                    </Section>

                    <Section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <h3>Access requests{data.requests.length ? ` (${data.requests.length})` : ''}</h3>
                            <Button size='sm' variant='ghost' loading={refreshingRequests} onClick={refreshRequests}>Refresh</Button>
                        </div>
                        {data.requests.length === 0 ? <Description>No pending requests.</Description> : data.requests.map((request) => (
                            <Record key={request.id}>
                                <div>
                                    <strong>{request.email}</strong>
                                    <small>Requested dashboard access · {new Date(request.createdAt).toLocaleString()}</small>
                                </div>
                                <Actions>
                                    <Button size='sm' variant='primary' loading={saving} onClick={() => reviewRequest(request, true)}>Approve view access</Button>
                                    <Button size='sm' variant='danger' loading={saving} onClick={() => reviewRequest(request, false)}>Deny</Button>
                                </Actions>
                            </Record>
                        ))}
                    </Section>
                </>
            )}
        </Modal>
    );
};

export const RequestAccessPanel = ({ uuid, status, onRequested }: {
    uuid: string;
    status: 'pending' | 'approved' | 'denied' | null;
    onRequested: () => void;
}) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestAccess = async () => {
        setError(null);
        setSaving(true);
        try {
            await requestServerAccess(uuid);
            onRequested();
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
            <h2>MC Panels access required</h2>
            <p style={{ color: color.muted }}>You have access to this Pterodactyl server, but not to its MC Panels dashboard. Ask the server owner to grant access.</p>
            {status === 'pending' && (
                <p role='status'>Your request is waiting for the server owner or a root administrator.</p>
            )}
            {status !== 'pending' && (
                <Actions>
                    <Button variant='primary' loading={saving} onClick={requestAccess}>
                        {status === 'denied' ? 'Request access again' : 'Request dashboard access'}
                    </Button>
                </Actions>
            )}
            {error && <p role='alert' style={{ color: color.bad }}>{error}</p>}
        </div>
    );
};

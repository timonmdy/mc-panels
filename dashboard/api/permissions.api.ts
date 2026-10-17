import type { ServerGrant, ServerPermissionsResponse, ServerPermissionUser } from './api.types';
import { apiGet, apiSend } from './client';

export const fetchServerPermissions = (uuid: string): Promise<ServerPermissionsResponse> =>
    apiGet(uuid, '/permissions');

export const fetchAccessRequests = (uuid: string): Promise<{ requests: ServerPermissionsResponse['requests'] }> =>
    apiGet(uuid, '/permissions/requests');

export const saveGuestPermissions = (uuid: string, permissions: ServerGrant[]): Promise<{ permissions: ServerGrant[] }> =>
    apiSend('put', uuid, '/permissions/guests', { permissions });

export const saveUserPermissions = (uuid: string, email: string, permissions: ServerGrant[]): Promise<ServerPermissionUser> =>
    apiSend('post', uuid, '/permissions/users', { email, permissions });

export const revokeUserPermissions = (uuid: string, userId: number): Promise<{ success: boolean }> =>
    apiSend('delete', uuid, `/permissions/users/${userId}`);

export const requestServerAccess = (uuid: string): Promise<{ status: 'pending' }> =>
    apiSend('post', uuid, '/permissions/requests');

export const approveAccessRequest = (uuid: string, requestId: number): Promise<{ status: string }> =>
    apiSend('post', uuid, `/permissions/requests/${requestId}/approve`);

export const denyAccessRequest = (uuid: string, requestId: number): Promise<{ status: string }> =>
    apiSend('post', uuid, `/permissions/requests/${requestId}/deny`);

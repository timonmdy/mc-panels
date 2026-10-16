import type { AccessKeysResponse, CreatedAccessKey } from './api.types';
import { apiGet, apiSend } from './client';

export const fetchAccessKeys = (uuid: string): Promise<AccessKeysResponse> =>
    apiGet(uuid, '/access-keys');

export const createAccessKey = (uuid: string, name: string, permissions: string[]): Promise<CreatedAccessKey> =>
    apiSend('post', uuid, '/access-keys', { name, permissions });

export const deleteAccessKey = (uuid: string, id: string): Promise<{ success: boolean }> =>
    apiSend('delete', uuid, `/access-keys/${id}`);

import type { DataExplorerResponse } from './api.types';
import { apiGet, apiSend } from './client';

export const fetchExplorerData = (
    uuid: string,
    table: string,
    page: number,
    search: string
): Promise<DataExplorerResponse> => apiGet(uuid, '/data-explorer', { table, page, perPage: 30, search });

export const updateExplorerRow = (
    uuid: string,
    table: string,
    id: number,
    changes: Record<string, unknown>
): Promise<{ success: boolean }> => apiSend('patch', uuid, `/data-explorer/${table}/${id}`, { confirmed: true, changes });

export const deleteExplorerRow = (uuid: string, table: string, id: number): Promise<{ success: boolean }> =>
    apiSend('delete', uuid, `/data-explorer/${table}/${id}`, { confirmed: true });

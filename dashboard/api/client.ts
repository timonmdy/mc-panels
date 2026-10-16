import axios from 'axios';
import http, { httpErrorToHuman } from '@/api/http';
import { APP } from '../config/app.config';

type Params = Record<string, string | number | undefined>;

let debugLogging = false;

const backgroundHttp = axios.create({
    withCredentials: true,
    timeout: 20000,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

const accessKeyStorageKey = (serverUuid: string): string => `mcpanels:access-key:${serverUuid}`;

export const getAccessKey = (serverUuid: string): string => {
    if (typeof window === 'undefined') return '';

    return window.localStorage.getItem(accessKeyStorageKey(serverUuid)) ?? '';
};

export const setAccessKey = (serverUuid: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const key = value.trim();
    if (key) window.localStorage.setItem(accessKeyStorageKey(serverUuid), key);
    else window.localStorage.removeItem(accessKeyStorageKey(serverUuid));
};

const accessHeaders = (serverUuid: string): Record<string, string> => {
    const key = getAccessKey(serverUuid);

    return key ? { 'X-MCPanels-Key': key } : {};
};

export const setDebugLogging = (enabled: boolean): void => {
    debugLogging = enabled;
    if (debugLogging) {
        console.info('[MC Panels] Browser debug logging is enabled. Filter the console for "MC Panels".');
    }
};

const url = (serverUuid: string, path: string) => `${APP.apiBase}/${serverUuid}${path}`;

const request = async <T>(method: string, path: string, operation: () => Promise<{ data: T; status?: number }>): Promise<T> => {
    const startedAt = Date.now();
    const requestId = `${startedAt.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    if (debugLogging) console.debug('[MC Panels] API request started', { requestId, method, path, startedAt: new Date(startedAt).toISOString() });

    try {
        const response = await operation();
        if (debugLogging) {
            console.debug('[MC Panels] API request completed', {
                requestId,
                method,
                path,
                status: response.status,
                durationMs: Date.now() - startedAt,
            });
        }

        return response.data;
    } catch (error) {
        if (debugLogging) {
            const errorResponse = typeof error === 'object' && error !== null && 'response' in error
                ? error.response
                : undefined;
            const status = typeof errorResponse === 'object' && errorResponse !== null && 'status' in errorResponse
                && typeof errorResponse.status === 'number'
                ? errorResponse.status
                : undefined;
            console.error('[MC Panels] API request failed', {
                requestId,
                method,
                path,
                status,
                durationMs: Date.now() - startedAt,
                error: error instanceof Error ? error.message : String(error),
            });
        }
        throw error;
    }
};

export const apiGet = <T>(serverUuid: string, path: string, params?: Params): Promise<T> =>
    request('GET', path, () => backgroundHttp.get<T>(url(serverUuid, path), { params, headers: accessHeaders(serverUuid) }));

export const apiSend = <T>(method: 'post' | 'patch' | 'delete', serverUuid: string, path: string, body?: unknown): Promise<T> =>
    request(method.toUpperCase(), path, () => http.request<T>({ method, url: url(serverUuid, path), data: body, headers: accessHeaders(serverUuid) }));

export const errorMessage = (error: unknown): string => httpErrorToHuman(error);

export interface ApiErrorDetails {
    status?: number;
    code?: string;
    detail?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const apiErrorDetails = (error: unknown): ApiErrorDetails => {
    if (!isRecord(error) || !isRecord(error.response)) return {};

    const response = error.response;
    const data = isRecord(response.data) ? response.data : undefined;
    const firstError = data && Array.isArray(data.errors) && isRecord(data.errors[0]) ? data.errors[0] : undefined;
    const bodyStatus = firstError?.status;
    const status = typeof response.status === 'number'
        ? response.status
        : typeof bodyStatus === 'string' && /^\d{3}$/.test(bodyStatus)
            ? Number(bodyStatus)
            : undefined;

    return {
        status,
        ...(typeof firstError?.code === 'string' ? { code: firstError.code } : {}),
        ...(typeof firstError?.detail === 'string' ? { detail: firstError.detail } : {}),
    };
};

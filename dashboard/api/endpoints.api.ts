import { apiGet, setDebugLogging } from './client';
import type {
    AvailabilityResponse,
    Bootstrap,
    FailuresResponse,
    InfoResponse,
    IssuesResponse,
    LiveSnapshot,
    MetricKey,
    PlayersResponse,
    SeriesResponse,
} from './api.types';

export interface PlayersQuery {
    kind: 'online' | 'registered';
    q?: string;
    filter?: 'all' | 'online' | 'banned';
    page?: number;
    perPage?: number;
}

export const fetchBootstrap = async (uuid: string): Promise<Bootstrap> => {
    const bootstrap = await apiGet<Bootstrap>(uuid, '/bootstrap');
    setDebugLogging(bootstrap.config.debugLogging);

    return bootstrap;
};

export const fetchLive = (uuid: string) => apiGet<LiveSnapshot>(uuid, '/live');

export const fetchInfo = (uuid: string) => apiGet<InfoResponse>(uuid, '/info');

export const fetchSeries = (uuid: string, span: string, metrics: MetricKey[]) =>
    apiGet<SeriesResponse>(uuid, '/series', { span, metrics: metrics.join(',') });

export const fetchAvailability = (uuid: string, span: string, bars: number) =>
    apiGet<AvailabilityResponse>(uuid, '/availability', { span, bars });

export const fetchPlayers = (uuid: string, query: PlayersQuery) => apiGet<PlayersResponse>(uuid, '/players', { ...query });

export const fetchFailures = (uuid: string, span: string) => apiGet<FailuresResponse>(uuid, '/failures', { span });

export const fetchIssues = (uuid: string, level: 'all' | 'error' | 'warn', limit: number, ignorePatterns: string[] = []) =>
    apiGet<IssuesResponse>(uuid, '/issues', { level, limit, ignorePatterns: ignorePatterns.join('\n') });

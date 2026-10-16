import { fetchAvailability, fetchFailures, fetchInfo, fetchIssues, fetchLive, fetchPlayers, PlayersQuery } from '../api/endpoints.api';
import { useDashboard } from './useDashboard';
import { useResource } from './useResource';

export const useLive = () => {
    const { uuid, config } = useDashboard();

    return useResource(`live:${uuid}`, () => fetchLive(uuid), config.polling.liveSeconds);
};

export const useInfo = () => {
    const { uuid, config } = useDashboard();

    return useResource(`info:${uuid}`, () => fetchInfo(uuid), config.polling.listSeconds * 4);
};

export const usePlayers = (query: PlayersQuery) => {
    const { uuid, config } = useDashboard();
    const key = `players:${uuid}:${query.kind}:${query.filter ?? 'all'}:${query.q ?? ''}:${query.page ?? 1}:${query.perPage ?? 10}`;

    return useResource(key, () => fetchPlayers(uuid, query), config.polling.listSeconds);
};

export const useFailures = () => {
    const { uuid, span, config } = useDashboard();

    return useResource(`failures:${uuid}:${span.key}`, () => fetchFailures(uuid, span.key), config.polling.listSeconds);
};

export const useIssues = (level: 'all' | 'error' | 'warn', limit: number, ignorePatterns: string[] = []) => {
    const { uuid, config } = useDashboard();
    const patternsKey = ignorePatterns.join('\n');

    return useResource(
        `issues:${uuid}:${level}:${limit}:${patternsKey}`,
        () => fetchIssues(uuid, level, limit, ignorePatterns),
        config.polling.listSeconds,
    );
};

export const useAvailability = (bars: number) => {
    const { uuid, span, config } = useDashboard();

    return useResource(`availability:${uuid}:${span.key}:${bars}`, () => fetchAvailability(uuid, span.key, bars), config.polling.seriesSeconds);
};

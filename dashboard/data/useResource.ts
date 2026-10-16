import { useCallback, useEffect, useState } from 'react';
import { getState, refresh, ResourceState, subscribe } from './resource.store';

export interface Resource<T> extends ResourceState<T> {
    reload(): void;
}

export const useResource = <T>(key: string | null, fetcher: () => Promise<T>, intervalSeconds = 0): Resource<T> => {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!key) return;

        return subscribe(key, fetcher, intervalSeconds * 1000, () => setTick((n) => n + 1));
    }, [key, intervalSeconds]);

    const reload = useCallback(() => key && refresh(key), [key]);
    const state = key ? getState<T>(key) : { loading: false, updatedAt: 0 };

    return { ...state, reload };
};

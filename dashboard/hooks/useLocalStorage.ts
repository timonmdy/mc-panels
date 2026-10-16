import { useCallback, useEffect, useState } from 'react';

const read = <T>(key: string, fallback: T): T => {
    try {
        const raw = window.localStorage.getItem(key);

        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
};

export const useLocalStorage = <T>(key: string, fallback: T): [T, (value: T) => void] => {
    const [value, setValue] = useState<T>(() => read(key, fallback));

    useEffect(() => setValue(read(key, fallback)), [key]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === key) setValue(read(key, fallback));
        };
        window.addEventListener('storage', onStorage);

        return () => window.removeEventListener('storage', onStorage);
    }, [key]);

    const update = useCallback(
        (next: T) => {
            setValue(next);
            try {
                window.localStorage.setItem(key, JSON.stringify(next));
            } catch {
                /* storage unavailable: keep in-memory value */
            }
        },
        [key]
    );

    return [value, update];
};

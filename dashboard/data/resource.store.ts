export interface ResourceState<T> {
    data?: T;
    error?: string;
    loading: boolean;
    updatedAt: number;
}

type Listener = () => void;

interface Entry<T> {
    state: ResourceState<T>;
    listeners: Set<Listener>;
    fetcher: () => Promise<T>;
    intervalMs: number;
    timer?: number;
    inFlight: boolean;
    refreshQueued: boolean;
}

const entries = new Map<string, Entry<any>>();
const IDLE: ResourceState<never> = { loading: false, updatedAt: 0 };

const emit = (entry: Entry<any>) => entry.listeners.forEach((listener) => listener());

const run = async <T>(entry: Entry<T>): Promise<void> => {
    if (entry.inFlight) return;

    entry.inFlight = true;
    entry.state = { ...entry.state, loading: entry.state.data === undefined };
    emit(entry);

    try {
        const data = await entry.fetcher();
        entry.state = { data, loading: false, updatedAt: Date.now() };
    } catch (error) {
        entry.state = { ...entry.state, error: error instanceof Error ? error.message : String(error), loading: false, updatedAt: Date.now() };
    } finally {
        entry.inFlight = false;
        emit(entry);
        if (entry.refreshQueued && entry.listeners.size > 0) {
            entry.refreshQueued = false;
            run(entry);
        } else {
            entry.refreshQueued = false;
        }
    }
};

const schedule = (entry: Entry<any>) => {
    window.clearInterval(entry.timer);
    if (entry.intervalMs > 0) {
        entry.timer = window.setInterval(() => !document.hidden && run(entry), entry.intervalMs);
    }
};

export const subscribe = <T>(key: string, fetcher: () => Promise<T>, intervalMs: number, listener: Listener): (() => void) => {
    let entry = entries.get(key) as Entry<T> | undefined;
    if (!entry) {
        entry = { state: { loading: true, updatedAt: 0 }, listeners: new Set(), fetcher, intervalMs, inFlight: false, refreshQueued: false };
        entries.set(key, entry);
    }

    entry.fetcher = fetcher;
    entry.intervalMs = intervalMs;
    entry.listeners.add(listener);

    if (entry.listeners.size === 1) {
        schedule(entry);
        run(entry);
    }

    return () => {
        const current = entries.get(key);
        if (!current) return;

        current.listeners.delete(listener);
        if (current.listeners.size === 0) {
            window.clearInterval(current.timer);
            entries.delete(key);
        }
    };
};

export const getState = <T>(key: string): ResourceState<T> => (entries.get(key)?.state as ResourceState<T>) ?? IDLE;

export const refresh = (key: string): void => {
    const entry = entries.get(key);
    if (!entry) return;
    if (entry.inFlight) {
        entry.refreshQueued = true;

        return;
    }
    run(entry);
};

export const refreshAll = (prefix = ''): void => entries.forEach((entry, key) => key.startsWith(prefix) && run(entry));

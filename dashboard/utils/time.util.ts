const pad = (n: number) => String(n).padStart(2, '0');

export const formatClock = (ts: number): string => {
    const d = new Date(ts * 1000);

    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDayClock = (ts: number): string => {
    const d = new Date(ts * 1000);

    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}. ${formatClock(ts)}`;
};

export const formatAxisTime = (ts: number, spanSeconds: number): string => (spanSeconds > 36 * 3600 ? formatDayClock(ts) : formatClock(ts));

export const timeAgo = (ts: number | null | undefined, now = Date.now() / 1000): string => {
    if (!ts) return '\u2014';

    const diff = Math.max(0, now - ts);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
};

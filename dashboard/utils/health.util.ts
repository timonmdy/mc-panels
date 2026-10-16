import type { LiveSnapshot } from '../api/api.types';
import { isNumber } from './number.util';

export interface Health {
    tone: 'good' | 'warn' | 'bad';
    title: string;
    detail: string;
}

const HOT = 90;

export const computeHealth = (live: LiveSnapshot | undefined): Health => {
    if (!live) return { tone: 'warn', title: 'Checking status', detail: 'Waiting for the first measurement.' };
    if (live.state === 'unknown') return { tone: 'bad', title: 'Node unreachable', detail: 'The panel could not reach the node for this server.' };
    if (live.state !== 'running') return { tone: 'bad', title: `Server is ${live.state}`, detail: 'Start the server to resume live metrics.' };
    if (live.stability.crashes > 0) return { tone: 'warn', title: 'Recent crashes', detail: `${live.stability.crashes} crash(es) in the last ${live.stability.windowDays} days.` };

    const cpuHot = isNumber(live.cpu) && isNumber(live.cpuLimit) && live.cpuLimit > 0 && live.cpu >= live.cpuLimit * 0.75;
    const hot = cpuHot || (isNumber(live.memoryPercent) && live.memoryPercent >= HOT);
    if (hot) return { tone: 'warn', title: 'High resource usage', detail: 'CPU or memory is close to its limit.' };

    return { tone: 'good', title: 'All systems healthy', detail: 'Resource usage and uptime are within normal range.' };
};

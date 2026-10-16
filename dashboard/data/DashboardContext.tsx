import { createContext } from 'react';
import type { PublicConfig, Permissions, TimeSpan } from '../api/api.types';

export interface DashboardContextValue {
    uuid: string;
    config: PublicConfig;
    permissions: Permissions;
    span: TimeSpan;
    serverIp: string | null;
    serverPort: number | null;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

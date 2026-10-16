declare module '@/api/http' {
    import { AxiosInstance } from 'axios';
    const http: AxiosInstance;
    export default http;
    export function httpErrorToHuman(error: any): string;
}

declare module '@/state/server' {
    export interface Allocation {
        id: number;
        ip: string;
        alias: string | null;
        port: number;
        notes: string | null;
        isDefault: boolean;
    }
    export interface ServerData {
        id: string;
        uuid: string;
        name: string;
        allocations: Allocation[];
        isSuspended: boolean;
    }
    export const ServerContext: {
        useStoreState<T>(selector: (state: { server: { data?: ServerData } }) => T): T;
    };
}

declare module '@/components/elements/ServerContentBlock' {
    import { ReactNode } from 'react';
    const ServerContentBlock: (props: { title: string; children?: ReactNode; className?: string }) => JSX.Element;
    export default ServerContentBlock;
}

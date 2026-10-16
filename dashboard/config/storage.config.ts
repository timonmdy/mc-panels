export const STORAGE_KEYS = {
    timeSpan: 'mcpanels:timeSpan',
    profile: (serverUuid: string) => `mcpanels:profile:${serverUuid}`,
} as const;

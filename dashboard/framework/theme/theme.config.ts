export const palette = {
    bg: '#0b0e17',
    surface: '#121623',
    raised: '#181d2d',
    border: '#232a3f',
    borderStrong: '#313a57',
    text: '#e8ebf6',
    muted: '#8d95b0',
    faint: '#5c647f',
    accent: '#5b8cff',
    good: '#2fd08c',
    warn: '#f5a524',
    bad: '#f4506b',
    violet: '#9b7bff',
    cyan: '#38c9e8',
    pink: '#f06cc0',
} as const;

export type ColorToken = keyof typeof palette;

export const color = (Object.keys(palette) as ColorToken[]).reduce(
    (tokens, key) => ({ ...tokens, [key]: `var(--mcp-${key})` }),
    {} as Record<ColorToken, string>
);

export const cssVariables = (Object.keys(palette) as ColorToken[]).map((key) => `--mcp-${key}: ${palette[key]};`).join('\n');

export const radius = { sm: '8px', md: '12px' } as const;

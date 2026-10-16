export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const average = (values: number[]): number | null => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

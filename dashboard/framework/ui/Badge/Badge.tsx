import styled from 'styled-components';
import { color } from '../../theme';

export type BadgeTone = 'neutral' | 'good' | 'warn' | 'bad' | 'accent';

const tones: Record<BadgeTone, string> = {
    neutral: color.muted,
    good: color.good,
    warn: color.warn,
    bad: color.bad,
    accent: color.accent,
};

export const Badge = styled.span<{ $tone?: BadgeTone }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid ${(p) => tones[p.$tone ?? 'neutral']};
    color: ${(p) => tones[p.$tone ?? 'neutral']};
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
`;

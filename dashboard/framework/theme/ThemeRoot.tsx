import styled from 'styled-components';
import { cssVariables } from './theme.config';

export const ThemeRoot = styled.div<{ $animationsEnabled?: boolean }>`
    ${cssVariables}
    color: var(--mcp-text);
    font-size: 14px;
    line-height: 1.4;
    font-variant-numeric: tabular-nums;

    &,
    & *,
    & *::before,
    & *::after {
        box-sizing: border-box;
    }

    ${(p) => p.$animationsEnabled === false && `
        & *,
        & *::before,
        & *::after {
            animation: none !important;
            scroll-behavior: auto !important;
            transition: none !important;
        }
    `}
`;

export const ThemeScope = styled(ThemeRoot)`
    display: contents;
`;

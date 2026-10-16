import styled from 'styled-components';
import { color, radius } from '../../theme';

export const Root = styled.button<{ $active: boolean }>`
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: ${radius.sm};
    background: ${(p) => (p.$active ? color.raised : 'transparent')};
    color: ${(p) => (p.$active ? color.text : color.muted)};
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover:not(:disabled) {
        background: ${color.raised};
        color: ${color.text};
    }
    &:focus-visible {
        outline: 2px solid ${color.accent};
    }
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

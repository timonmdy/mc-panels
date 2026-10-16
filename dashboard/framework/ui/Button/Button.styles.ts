import styled, { css } from 'styled-components';
import { color, radius } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const variants = {
    primary: css`
        background: ${color.accent};
        color: #fff;
        &:hover:not(:disabled) {
            filter: brightness(1.1);
        }
    `,
    secondary: css`
        background: ${color.raised};
        border-color: ${color.borderStrong};
        color: ${color.text};
        &:hover:not(:disabled) {
            border-color: ${color.accent};
        }
    `,
    ghost: css`
        background: transparent;
        color: ${color.muted};
        &:hover:not(:disabled) {
            background: ${color.raised};
            color: ${color.text};
        }
    `,
    danger: css`
        background: ${color.bad};
        color: #fff;
        &:hover:not(:disabled) {
            filter: brightness(1.1);
        }
    `,
};

export const Root = styled.button<{ $variant: ButtonVariant; $size: ButtonSize }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid transparent;
    border-radius: ${radius.sm};
    padding: ${(p) => (p.$size === 'sm' ? '5px 10px' : '8px 14px')};
    font-size: ${(p) => (p.$size === 'sm' ? '12px' : '13px')};
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, filter 0.15s;
    ${(p) => variants[p.$variant]};

    &:focus-visible {
        outline: 2px solid ${color.accent};
        outline-offset: 2px;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

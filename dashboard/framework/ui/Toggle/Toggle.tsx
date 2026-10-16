import React from 'react';
import styled from 'styled-components';
import { color } from '../../theme';

const Track = styled.button<{ $on: boolean }>`
    position: relative;
    width: 38px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: ${(p) => (p.$on ? color.accent : color.borderStrong)};
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;

    &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: ${(p) => (p.$on ? '19px' : '3px')};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        transition: left 0.15s;
    }
    &:focus-visible {
        outline: 2px solid ${color.accent};
        outline-offset: 2px;
    }
`;

interface Props {
    value: boolean;
    onChange: (value: boolean) => void;
    label: string;
}

export const Toggle = ({ value, onChange, label }: Props) => (
    <Track type='button' role='switch' aria-checked={value} aria-label={label} $on={value} onClick={() => onChange(!value)} />
);

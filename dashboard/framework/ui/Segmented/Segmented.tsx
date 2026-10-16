import React from 'react';
import styled from 'styled-components';
import { color, radius } from '../../theme';

const Root = styled.div`
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 3px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: ${radius.sm};
`;

const Option = styled.button<{ $active: boolean }>`
    padding: 4px 10px;
    border: 0;
    border-radius: 6px;
    background: ${(p) => (p.$active ? color.raised : 'transparent')};
    color: ${(p) => (p.$active ? color.text : color.muted)};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: ${color.text};
    }
    &:focus-visible {
        outline: 2px solid ${color.accent};
    }
`;

interface Props<T extends string> {
    value: T;
    options: Array<{ value: T; label: string }>;
    onChange: (value: T) => void;
}

export const Segmented = <T extends string>({ value, options, onChange }: Props<T>) => (
    <Root role='radiogroup'>
        {options.map((option) => (
            <Option key={option.value} type='button' role='radio' aria-checked={option.value === value} $active={option.value === value} onClick={() => onChange(option.value)}>
                {option.label}
            </Option>
        ))}
    </Root>
);

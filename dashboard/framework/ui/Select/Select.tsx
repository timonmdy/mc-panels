import React from 'react';
import styled from 'styled-components';
import { controlStyles } from '../Input/Input.styles';

const Root = styled.select`
    ${controlStyles}
    cursor: pointer;
`;

export interface SelectOption {
    value: string;
    label: string;
}

interface Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[];
    onChange: (value: string) => void;
}

export const Select = ({ options, onChange, ...rest }: Props) => (
    <Root onChange={(event) => onChange(event.target.value)} {...rest}>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </Root>
);

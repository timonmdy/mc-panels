import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { color } from '../../theme';

const Root = styled.label`
    display: grid;
    gap: 6px;

    > span {
        font-size: 12px;
        font-weight: 600;
        color: ${color.text};
    }
    > small {
        color: ${color.muted};
        font-size: 12px;
    }
`;

interface Props {
    label: string;
    help?: string;
    children: ReactNode;
}

export const Field = ({ label, help, children }: Props) => (
    <Root>
        <span>{label}</span>
        {children}
        {help && <small>{help}</small>}
    </Root>
);

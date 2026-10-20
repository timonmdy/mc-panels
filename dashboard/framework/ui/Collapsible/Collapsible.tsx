import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { color } from '../../theme';
import { Icon } from '../Icon/Icon';

const Root = styled.details`
    border-top: 1px solid ${color.border};

    summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        color: ${color.text};
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        list-style: none;
    }
    summary::-webkit-details-marker {
        display: none;
    }
    summary:focus-visible {
        outline: 2px solid ${color.accent};
        outline-offset: 2px;
    }
    summary svg {
        color: ${color.muted};
        transition: transform 0.15s;
    }
    &[open] summary svg {
        transform: rotate(180deg);
    }
`;

const Content = styled.div`
    display: grid;
    gap: 16px;
    padding: 0 0 12px;
`;

interface Props {
    title: string;
    children: ReactNode;
}

export const Collapsible = ({ title, children }: Props) => (
    <Root>
        <summary>
            {title}
            <Icon name='chevronDown' />
        </summary>
        <Content>{children}</Content>
    </Root>
);

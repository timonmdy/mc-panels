import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { color } from '../../theme';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons.config';

const Root = styled.div`
    display: grid;
    place-items: center;
    align-content: center;
    gap: 6px;
    height: 100%;
    min-height: 80px;
    padding: 12px;
    text-align: center;
    color: ${color.muted};

    strong {
        color: ${color.text};
        font-size: 14px;
    }
    p {
        margin: 0;
        max-width: 320px;
        font-size: 12px;
    }
    svg {
        font-size: 22px;
        color: ${color.faint};
    }
`;

interface Props {
    icon?: IconName;
    title: string;
    hint?: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, hint, action }: Props) => (
    <Root>
        {icon && <Icon name={icon} />}
        <strong>{title}</strong>
        {hint && <p>{hint}</p>}
        {action}
    </Root>
);

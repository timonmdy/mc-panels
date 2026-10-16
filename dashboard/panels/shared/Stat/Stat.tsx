import React from 'react';
import styled from 'styled-components';
import { color } from '../../../framework/theme';

export const Rows = styled.dl`
    display: grid;
    gap: 2px;
    margin: 0;
`;

const Row = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px solid ${color.border};
    font-size: 13px;

    &:last-child {
        border-bottom: 0;
    }
    dt {
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${color.muted};
        white-space: nowrap;
    }
    dd {
        margin: 0;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: right;
        font-weight: 600;
    }
`;

interface Props {
    label: string;
    children: React.ReactNode;
}

export const InfoRow = ({ label, children }: Props) => (
    <Row>
        <dt>{label}</dt>
        <dd>{children}</dd>
    </Row>
);

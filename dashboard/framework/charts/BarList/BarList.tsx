import React from 'react';
import styled from 'styled-components';
import { color } from '../../theme';

const List = styled.ul`
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Row = styled.li`
    display: grid;
    gap: 4px;
    font-size: 12px;

    > div:first-child {
        display: flex;
        justify-content: space-between;
        color: ${color.muted};
    }
    strong {
        color: ${color.text};
    }
`;

const Track = styled.div`
    height: 6px;
    border-radius: 999px;
    background: ${color.border};
    overflow: hidden;
`;

const Fill = styled.div<{ $width: number; $tone: string }>`
    width: ${(p) => p.$width}%;
    height: 100%;
    border-radius: 999px;
    background: ${(p) => p.$tone};
`;

export interface BarItem {
    id: string;
    label: string;
    value: number;
    color: string;
}

export const BarList = ({ items }: { items: BarItem[] }) => {
    const max = Math.max(1, ...items.map((item) => item.value));

    return (
        <List>
            {items.map((item) => (
                <Row key={item.id}>
                    <div>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                    </div>
                    <Track>
                        <Fill $width={(item.value / max) * 100} $tone={item.color} />
                    </Track>
                </Row>
            ))}
        </List>
    );
};

import React from 'react';
import styled from 'styled-components';
import { color as tokens } from '../../theme';

const Root = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    min-height: 0;

    svg {
        width: 100%;
        height: 100%;
        max-height: 100%;
    }
    figcaption {
        position: absolute;
        display: grid;
        gap: 2px;
        text-align: center;
    }
    strong {
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
    }
    span {
        color: ${tokens.muted};
        font-size: 12px;
    }
`;

interface Props {
    value: number;
    color: string;
    label: string;
    caption?: string;
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const Gauge = ({ value, color, label, caption }: Props) => {
    const ratio = Math.max(0, Math.min(1, value));

    return (
        <Root>
            <svg viewBox='0 0 100 100' aria-hidden='true'>
                <circle cx='50' cy='50' r={RADIUS} fill='none' stroke='#232a3f' strokeWidth='8' />
                <circle
                    cx='50'
                    cy='50'
                    r={RADIUS}
                    fill='none'
                    stroke={color}
                    strokeWidth='8'
                    strokeLinecap='round'
                    strokeDasharray={`${CIRCUMFERENCE * ratio} ${CIRCUMFERENCE}`}
                    transform='rotate(-90 50 50)'
                />
            </svg>
            <figcaption>
                <strong>{label}</strong>
                {caption && <span>{caption}</span>}
            </figcaption>
        </Root>
    );
};

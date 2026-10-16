import styled from 'styled-components';
import { color, radius } from '../../framework/theme';

export const Category = styled.h3`
    margin: 20px 0 8px;
    color: ${color.muted};
    font-size: 12px;
    font-weight: 600;

    &:first-of-type {
        margin-top: 12px;
    }
`;

export const Cards = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
`;

export const Card = styled.button`
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 4px 10px;
    padding: 12px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: ${radius.sm};
    color: ${color.text};
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
        border-color: ${color.accent};
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    svg {
        margin-top: 2px;
        color: ${color.accent};
    }
    strong {
        font-size: 13px;
    }
    small {
        grid-column: 2;
        color: ${color.muted};
        font-size: 12px;
    }
`;

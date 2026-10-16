import styled from 'styled-components';
import { color, radius } from '../../../framework/theme';

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
    margin-top: 16px;
`;

export const Card = styled.button<{ $selected: boolean }>`
    position: relative;
    display: grid;
    gap: 4px;
    padding: 12px;
    background: ${color.bg};
    border: 1px solid ${(p) => (p.$selected ? color.accent : color.border)};
    border-radius: ${radius.sm};
    color: ${color.text};
    text-align: left;
    cursor: pointer;

    &:hover {
        border-color: ${color.accent};
    }
    strong {
        font-size: 13px;
    }
    small {
        color: ${color.muted};
        font-size: 12px;
    }
`;

export const Heading = styled.h3`
    margin: 18px 0 0;
    color: ${color.muted};
    font-size: 12px;
    font-weight: 600;
`;

import styled from 'styled-components';
import { color, radius } from '../../framework/theme';

export const Root = styled.section`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    background: ${color.surface};
    border: 1px solid ${color.border};
    border-radius: ${radius.md};
`;

export const Health = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    strong {
        display: block;
        font-size: 14px;
    }
    small {
        color: ${color.muted};
        font-size: 12px;
    }
`;

export const Dot = styled.span<{ $tone: string }>`
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
    background: ${(p) => p.$tone};
    box-shadow: 0 0 0 4px ${(p) => p.$tone}33;
`;

export const Items = styled.dl`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 28px;
    margin: 0;

    div {
        display: grid;
        gap: 2px;
    }
    dt {
        color: ${color.muted};
        font-size: 11px;
    }
    dd {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
    }
`;

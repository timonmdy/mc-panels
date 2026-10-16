import styled from 'styled-components';
import { color, radius } from '../theme';

export const Root = styled.section`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: ${color.surface};
    border: 1px solid ${color.border};
    border-radius: ${radius.md};
    overflow: hidden;
`;

export const Header = styled.header`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 8px 0 14px;
    min-height: 38px;
    flex-shrink: 0;
`;

export const Title = styled.h3`
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: ${color.text};

    svg {
        color: ${color.accent};
        font-size: 12px;
    }
    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const Handle = styled.span`
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 28px;
    color: ${color.faint};
    cursor: grab;
    font-size: 12px;

    &:hover {
        color: ${color.text};
    }
    &:active {
        cursor: grabbing;
    }
`;

export const Body = styled.div`
    flex: 1;
    min-height: 0;
    padding: 6px 14px 14px;
    overflow: auto;
`;

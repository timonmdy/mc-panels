import styled from 'styled-components';
import { color } from '../../framework/theme';

export const Toolbar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    > :first-child {
        flex: 1;
        min-width: 120px;
    }
`;

export const Details = styled.div`
    display: grid;
    gap: 4px;
    margin: 0 0 8px 38px;
    padding: 8px 10px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: 8px;
    font-size: 12px;

    h4 {
        margin: 0;
        color: ${color.muted};
        font-size: 11px;
        font-weight: 600;
    }
    div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: ${color.muted};
    }
    strong {
        color: ${color.text};
        font-weight: 600;
    }
`;

export const Pager = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    color: ${color.muted};
    font-size: 12px;
`;

export const RowButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
`;

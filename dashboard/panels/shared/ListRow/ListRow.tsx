import styled from 'styled-components';
import { color } from '../../../framework/theme';

export const List = styled.ul`
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
`;

export const ListRow = styled.li`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid ${color.border};
    font-size: 13px;

    &:last-child {
        border-bottom: 0;
    }
    .grow {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .muted {
        color: ${color.muted};
        font-size: 12px;
        white-space: nowrap;
    }
`;

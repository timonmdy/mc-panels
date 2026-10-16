import styled from 'styled-components';
import { color } from '../../framework/theme';

export const Message = styled.span`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
`;

export const Count = styled.span`
    min-width: 28px;
    color: ${color.muted};
    font-size: 11px;
    text-align: right;
`;

export const Head = styled.div`
    margin-bottom: 8px;
`;

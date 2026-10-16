import styled from 'styled-components';
import { color } from '../../framework/theme';

export const Root = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
`;

export const Group = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
`;

export const Notice = styled.span<{ $tone?: 'bad' }>`
    color: ${(p) => (p.$tone === 'bad' ? color.bad : color.muted)};
    font-size: 12px;
`;

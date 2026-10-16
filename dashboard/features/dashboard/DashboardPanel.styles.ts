import styled from 'styled-components';
import { color } from '../../framework/theme';

export const BareWrap = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

export const Floating = styled.div`
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    gap: 2px;
    padding: 2px;
    background: ${color.surface};
    border: 1px solid ${color.border};
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.15s;

    ${BareWrap}:hover &,
    &:focus-within {
        opacity: 1;
    }
`;

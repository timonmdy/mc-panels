import styled from 'styled-components';
import { color, radius } from '../../theme';

export const Root = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 80px;

    svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
    }
    text {
        fill: ${color.faint};
        font-size: 10px;
    }
`;

export const Tooltip = styled.div`
    position: absolute;
    top: 4px;
    z-index: 2;
    min-width: 120px;
    padding: 8px 10px;
    background: ${color.raised};
    border: 1px solid ${color.borderStrong};
    border-radius: ${radius.sm};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    font-size: 11px;
    pointer-events: none;

    time {
        display: block;
        margin-bottom: 4px;
        color: ${color.muted};
    }
    div {
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }
    i {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
`;

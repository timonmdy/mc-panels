import styled from 'styled-components';
import { color, radius } from '../../theme';

export const Popover = styled.div<{ $top: number; $left: number; $align: 'start' | 'end' }>`
    position: fixed;
    z-index: 9000;
    top: ${(p) => p.$top}px;
    left: ${(p) => p.$left}px;
    transform: ${(p) => (p.$align === 'end' ? 'translateX(-100%)' : 'none')};
    min-width: 200px;
    max-width: 320px;
    max-height: 70vh;
    overflow: auto;
    padding: 6px;
    background: ${color.raised};
    border: 1px solid ${color.borderStrong};
    border-radius: ${radius.md};
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    color: ${color.text};
`;

export const Item = styled.button<{ $danger: boolean; $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 6px;
    background: ${(p) => (p.$active ? color.surface : 'transparent')};
    color: ${(p) => (p.$danger ? color.bad : color.text)};
    font-size: 13px;
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: ${color.surface};
    }
    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

export const Separator = styled.div`
    height: 1px;
    margin: 6px 4px;
    background: ${color.border};
`;

export const Label = styled.div`
    padding: 6px 10px 4px;
    color: ${color.faint};
    font-size: 11px;
`;

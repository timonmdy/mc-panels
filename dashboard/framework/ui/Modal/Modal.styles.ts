import styled from 'styled-components';
import { color, radius } from '../../theme';

export const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 8000;
    display: grid;
    place-items: center;
    padding: 5vh 24px;
    background: rgba(5, 7, 12, 0.7);
`;

export const Dialog = styled.div<{ $width: number }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: ${(p) => p.$width}px;
    max-height: calc(100vh - 10vh);
    max-height: calc(100dvh - 10vh);
    background: ${color.surface};
    border: 1px solid ${color.borderStrong};
    border-radius: ${radius.md};
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
    color: ${color.text};
`;

export const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid ${color.border};

    h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }
`;

export const Body = styled.div`
    padding: 20px;
    overflow: auto;
    min-height: 0;
`;

export const Footer = styled.footer`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 20px;
    border-top: 1px solid ${color.border};
`;

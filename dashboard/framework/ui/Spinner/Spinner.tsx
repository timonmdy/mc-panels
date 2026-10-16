import React from 'react';
import styled, { keyframes } from 'styled-components';
import { color } from '../../theme';

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

const Ring = styled.span<{ $size: number }>`
    display: inline-block;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    border: 2px solid ${color.border};
    border-top-color: ${color.accent};
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation-duration: 2.4s;
    }
`;

export const Spinner = ({ size = 18 }: { size?: number }) => <Ring $size={size} role='status' aria-label='Loading' />;

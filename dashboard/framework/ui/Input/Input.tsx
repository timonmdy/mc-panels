import React from 'react';
import styled from 'styled-components';
import { controlStyles } from './Input.styles';

export const Input = styled.input`
    ${controlStyles}
`;

export const TextArea = styled.textarea`
    ${controlStyles}
    min-height: 96px;
    resize: vertical;
`;

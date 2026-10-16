import React from 'react';
import styled from 'styled-components';
import { EmptyState } from '../../framework/ui';
import type { PanelProps } from '../registry/panel.types';

const Text = styled.p<{ $mono: boolean }>`
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ${(p) => (p.$mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit')};
    font-size: 13px;
`;

export const NotePanel = ({ settings }: PanelProps) =>
    String(settings.text ?? '').trim() ? (
        <Text $mono={Boolean(settings.monospace)}>{String(settings.text)}</Text>
    ) : (
        <EmptyState icon='note' title='Empty note' hint='Open panel settings to write something.' />
    );

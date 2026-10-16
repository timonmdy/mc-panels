import React from 'react';
import styled from 'styled-components';
import { color } from '../../../framework/theme';
import { useDashboard } from '../../../data/useDashboard';
import { fillTemplate, safeHttpUrl } from '../../../utils/template.util';

const Frame = styled.span<{ $size: number }>`
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    width: ${(p) => p.$size}px;
    height: ${(p) => p.$size}px;
    border-radius: 6px;
    background: ${color.raised};
    color: ${color.muted};
    font-size: ${(p) => Math.round(p.$size * 0.45)}px;
    font-weight: 700;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
    }
`;

interface Props {
    name: string;
    uuid: string | null;
    size?: number;
}

export const PlayerAvatar = ({ name, uuid, size = 28 }: Props) => {
    const { config } = useDashboard();
    const url = uuid ? safeHttpUrl(fillTemplate(config.avatarApiUrl, { uuid, name })) : null;

    return <Frame $size={size}>{url ? <img src={url} alt='' loading='lazy' /> : name.slice(0, 1).toUpperCase()}</Frame>;
};

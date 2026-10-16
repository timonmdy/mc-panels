import React, { useState } from 'react';
import styled from 'styled-components';
import { color, radius } from '../../framework/theme';
import { EmptyState, Icon } from '../../framework/ui';
import { useDashboard } from '../../data/useDashboard';
import { fillTemplate, safeHttpUrl } from '../../utils/template.util';
import type { PanelProps } from '../registry/panel.types';

const Anchor = styled.a`
    display: flex;
    align-items: center;
    gap: 12px;
    height: 100%;
    padding: 10px 12px;
    background: ${color.bg};
    border: 1px solid ${color.border};
    border-radius: ${radius.sm};
    color: ${color.text};
    text-decoration: none;

    &:hover {
        border-color: ${color.accent};
    }
    span {
        display: grid;
        gap: 2px;
        min-width: 0;
        flex: 1;
    }
    strong {
        font-size: 14px;
    }
    small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${color.muted};
    }
`;

const Favicon = styled.img`
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    object-fit: contain;
`;

export const ExternalLinkPanel = ({ settings }: PanelProps) => {
    const { uuid, serverIp, serverPort } = useDashboard();
    const url = safeHttpUrl(fillTemplate(String(settings.url ?? ''), { uuid, ip: serverIp, port: serverPort }));
    const faviconUrl = url
        ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(new URL(url).origin)}&sz=64`
        : '';
    const [failedFaviconUrl, setFailedFaviconUrl] = useState('');

    if (!url) return <EmptyState icon='link' title='No link yet' hint='Open panel settings and enter an http(s) URL. Placeholders: {uuid} {ip} {port}.' />;

    return (
        <Anchor href={url} target='_blank' rel='noopener noreferrer'>
            {failedFaviconUrl === faviconUrl ? (
                <Icon name='link' />
            ) : (
                <Favicon key={faviconUrl} src={faviconUrl} alt='' aria-hidden='true' onError={() => setFailedFaviconUrl(faviconUrl)} />
            )}
            <span>
                <strong>{String(settings.linkTitle || settings.label || new URL(url).hostname)}</strong>
                <small>{String(settings.description || url)}</small>
            </span>
        </Anchor>
    );
};

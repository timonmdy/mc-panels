import React, { MouseEvent, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import styled from 'styled-components';
import { color } from '../../framework/theme';
import { EmptyState, Icon, useConfirmation } from '../../framework/ui';
import { useDashboard } from '../../data/useDashboard';
import { fillTemplate, safeHttpUrl } from '../../utils/template.util';
import type { PanelProps } from '../registry/panel.types';

const Anchor = styled.a<{ $compact: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    height: 100%;
    min-height: 0;
    padding: 2px;
    color: ${color.text};
    text-decoration: none;

    &:hover {
        color: ${color.accent};
    }
    span {
        display: grid;
        gap: 4px;
        min-width: 0;
        flex: 1;
    }
    strong {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    small {
        display: ${(p) => (p.$compact ? 'none' : 'block')};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${color.muted};
    }
    > svg:first-child {
        flex: 0 0 auto;
        color: ${color.muted};
        font-size: 16px;
    }
    > svg:last-child {
        flex: 0 0 auto;
        color: ${color.faint};
        font-size: 11px;
    }
`;

const Favicon = styled.img<{ $compact: boolean }>`
    width: ${(p) => (p.$compact ? '16px' : '20px')};
    height: ${(p) => (p.$compact ? '16px' : '20px')};
    flex: 0 0 ${(p) => (p.$compact ? '16px' : '20px')};
    object-fit: contain;
`;

export const ExternalLinkPanel = ({ settings, size }: PanelProps) => {
    const { uuid, serverIp, serverPort } = useDashboard();
    const url = safeHttpUrl(fillTemplate(String(settings.url ?? ''), { uuid, ip: serverIp, port: serverPort }));
    const faviconUrl = url
        ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(new URL(url).origin)}&sz=64`
        : '';
    const [failedFaviconUrl, setFailedFaviconUrl] = useState('');
    const confirm = useConfirmation();
    const confirmationMessage = String(settings.confirmationMessage ?? '').trim();
    const compact = size.h <= 1;

    const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
        if (!confirmationMessage || !url) return;
        event.preventDefault();

        const openedWindow = window.open('about:blank', '_blank');
        if (openedWindow) openedWindow.opener = null;

        const accepted = await confirm({
            title: 'Open external link?',
            message: confirmationMessage,
            confirmLabel: 'Open link',
            destructive: false,
        });

        if (accepted) {
            if (openedWindow) {
                openedWindow.location.href = url;
            } else {
                window.location.assign(url);
            }
        } else if (openedWindow) {
            openedWindow.close();
        }
    };

    if (!url) return <EmptyState icon='link' title='No link yet' hint='Open panel settings and enter an http(s) URL. Placeholders: {uuid} {ip} {port}.' />;

    return (
        <Anchor href={url} target='_blank' rel='noopener noreferrer' $compact={compact} onClick={handleClick}>
            {failedFaviconUrl === faviconUrl ? (
                <FaExternalLinkAlt aria-hidden='true' />
            ) : (
                <Favicon key={faviconUrl} $compact={compact} src={faviconUrl} alt='' aria-hidden='true' onError={() => setFailedFaviconUrl(faviconUrl)} />
            )}
            <span>
                <strong>{String(settings.linkTitle || settings.label || new URL(url).hostname)}</strong>
                <small>{String(settings.description || url)}</small>
            </span>
            <Icon name='link' />
        </Anchor>
    );
};

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { color } from '../../framework/theme';
import { Button, EmptyState, Icon, Modal } from '../../framework/ui';
import { useDashboard } from '../../data/useDashboard';
import { fillTemplate, safeHttpUrl } from '../../utils/template.util';
import type { PanelProps } from '../registry/panel.types';

const linkStyles = css<{ $compact: boolean }>`
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

const Anchor = styled.a<{ $compact: boolean }>`
    ${linkStyles}
`;

const ConfirmButton = styled.button<{ $compact: boolean }>`
    ${linkStyles}
    width: 100%;
    border: 0;
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
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
    const confirmationMessage = String(settings.confirmationMessage ?? '').trim();
    const compact = size.h <= 1;
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const openLink = () => {
        if (!url) return;
        const openedWindow = window.open(url, '_blank');
        if (openedWindow) openedWindow.opener = null;
        setIsConfirmationOpen(false);
    };

    if (!url) return <EmptyState icon='link' title='No link yet' hint='Open panel settings and enter an http(s) URL. Placeholders: {uuid} {ip} {port}.' />;

    return (
        <>
            {confirmationMessage ? (
                <ConfirmButton type='button' $compact={compact} onClick={() => setIsConfirmationOpen(true)}>
                    {failedFaviconUrl === faviconUrl ? (
                        <Icon name='world' />
                    ) : (
                        <Favicon key={faviconUrl} $compact={compact} src={faviconUrl} alt='' aria-hidden='true' onError={() => setFailedFaviconUrl(faviconUrl)} />
                    )}
                    <span>
                        <strong>{String(settings.linkTitle || settings.label || new URL(url).hostname)}</strong>
                        <small>{String(settings.description || url)}</small>
                    </span>
                    <Icon name='link' />
                </ConfirmButton>
            ) : (
                <Anchor href={url} target='_blank' rel='noopener noreferrer' $compact={compact}>
                    {failedFaviconUrl === faviconUrl ? (
                        <Icon name='world' />
                    ) : (
                        <Favicon key={faviconUrl} $compact={compact} src={faviconUrl} alt='' aria-hidden='true' onError={() => setFailedFaviconUrl(faviconUrl)} />
                    )}
                    <span>
                        <strong>{String(settings.linkTitle || settings.label || new URL(url).hostname)}</strong>
                        <small>{String(settings.description || url)}</small>
                    </span>
                    <Icon name='link' />
                </Anchor>
            )}
            {confirmationMessage && isConfirmationOpen && (
                <Modal
                    title='Open external link?'
                    onClose={() => setIsConfirmationOpen(false)}
                    footer={
                        <>
                            <Button variant='ghost' onClick={() => setIsConfirmationOpen(false)}>Cancel</Button>
                            <Button variant='primary' onClick={openLink}>Open link</Button>
                        </>
                    }
                >
                    <p>{confirmationMessage}</p>
                </Modal>
            )}
        </>
    );
};

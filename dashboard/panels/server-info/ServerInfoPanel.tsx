import React from 'react';
import { useInfo } from '../../data/data.hooks';
import { NO_VALUE, titleCase } from '../../utils/format.util';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import { InfoRow, Rows } from '../shared/Stat/Stat';
import type { PanelProps } from '../registry/panel.types';

export const ServerInfoPanel = ({ settings }: PanelProps) => {
    const info = useInfo();
    if (info.error && !info.data) return <PanelError message={info.error} />;
    if (!info.data) return <PanelLoading />;

    const s = info.data.server;
    const region = s.region ? [s.region.city, s.region.region, s.region.country].filter(Boolean).join(', ') : '';

    return (
        <Rows>
            <InfoRow label='Software'>{titleCase(s.software)}</InfoRow>
            <InfoRow label='Version'>{s.version ?? NO_VALUE}</InfoRow>
            {settings.showIp && <InfoRow label='IP'>{s.host ?? s.ip ?? NO_VALUE}</InfoRow>}
            <InfoRow label='Port'>{s.port ?? NO_VALUE}</InfoRow>
            {settings.showRegion && <InfoRow label='Region'>{region || NO_VALUE}</InfoRow>}
            {settings.showMotd && <InfoRow label='MOTD'>{s.motd ?? NO_VALUE}</InfoRow>}
        </Rows>
    );
};

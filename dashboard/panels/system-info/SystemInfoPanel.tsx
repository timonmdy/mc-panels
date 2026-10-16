import React from 'react';
import { useInfo } from '../../data/data.hooks';
import { titleCase } from '../../utils/format.util';
import { NO_VALUE } from '../../utils/format.util';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import { InfoRow, Rows } from '../shared/Stat/Stat';
import type { PanelProps } from '../registry/panel.types';

export const SystemInfoPanel = ({ settings }: PanelProps) => {
    const info = useInfo();
    if (info.error && !info.data) return <PanelError message={info.error} />;
    if (!info.data) return <PanelLoading />;

    const s = info.data.system;
    const os = [s.os ?? titleCase(s.osType), s.arch].filter(Boolean).join(' \u00b7 ');

    return (
        <Rows>
            <InfoRow label='Java version'>{s.javaVersion ?? NO_VALUE}</InfoRow>
            <InfoRow label='Operating system'>{os || NO_VALUE}</InfoRow>
            {settings.showKernel && <InfoRow label='Kernel'>{s.kernel ?? NO_VALUE}</InfoRow>}
            {settings.showThreads && <InfoRow label='Node CPU threads'>{s.cpuThreads ?? NO_VALUE}</InfoRow>}
            {settings.showImage && <InfoRow label='Docker image'>{s.image ?? NO_VALUE}</InfoRow>}
        </Rows>
    );
};

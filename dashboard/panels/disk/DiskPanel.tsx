import React from 'react';
import { Gauge } from '../../framework/charts';
import { palette } from '../../framework/theme';
import { EmptyState } from '../../framework/ui';
import { useLive } from '../../data/data.hooks';
import { formatBytes } from '../../utils/format.util';
import { isNumber } from '../../utils/number.util';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import type { PanelProps } from '../registry/panel.types';

export const DiskPanel = ({ settings }: PanelProps) => {
    const live = useLive();
    if (live.error && !live.data) return <PanelError message={live.error} />;
    if (!live.data) return <PanelLoading />;

    const { disk, diskLimit } = live.data;
    if (!isNumber(disk)) return <EmptyState icon='disk' title='No disk data' hint='Disk usage is reported by the node.' />;
    if (!diskLimit) return <EmptyState icon='disk' title={formatBytes(disk)} hint='No disk limit is set for this server.' />;

    const ratio = disk / diskLimit;
    const tone = ratio * 100 >= Number(settings.critAt) ? palette.bad : ratio * 100 >= Number(settings.warnAt) ? palette.warn : palette.good;

    return <Gauge value={ratio} color={tone} label={`${(ratio * 100).toFixed(1)}%`} caption={`${formatBytes(disk)} / ${formatBytes(diskLimit)}`} />;
};

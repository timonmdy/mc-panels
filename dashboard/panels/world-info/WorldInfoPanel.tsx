import React from 'react';
import { Badge } from '../../framework/ui';
import { useInfo } from '../../data/data.hooks';
import { NO_VALUE, formatNumber, titleCase } from '../../utils/format.util';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import { InfoRow, Rows } from '../shared/Stat/Stat';
import type { PanelProps } from '../registry/panel.types';

const flag = (value: boolean | null, yes = 'Yes', no = 'No') =>
    value === null ? NO_VALUE : <Badge $tone={value ? 'good' : 'neutral'}>{value ? yes : no}</Badge>;

export const WorldInfoPanel = ({ settings }: PanelProps) => {
    const info = useInfo();
    if (info.error && !info.data) return <PanelError message={info.error} />;
    if (!info.data) return <PanelLoading />;

    const w = info.data.world;
    const names = w.worlds.map((world) => world.name).join(', ');

    return (
        <Rows>
            <InfoRow label='Worlds'>{w.worlds.length ? `${w.worlds.length} (${names})` : NO_VALUE}</InfoRow>
            <InfoRow label='Loaded chunks'>{formatNumber(w.loadedChunks)}</InfoRow>
            <InfoRow label='Loaded entities'>{formatNumber(w.entities)}</InfoRow>
            <InfoRow label='Difficulty'>{titleCase(w.difficulty)}</InfoRow>
            <InfoRow label='Game mode'>{titleCase(w.gamemode)}</InfoRow>
            <InfoRow label='Hardcore'>{flag(w.hardcore)}</InfoRow>
            <InfoRow label='PvP'>{flag(w.pvp, 'Enabled', 'Disabled')}</InfoRow>
            {settings.showAdvanced && (
                <>
                    <InfoRow label='View distance'>{w.viewDistance ?? NO_VALUE}</InfoRow>
                    <InfoRow label='Simulation distance'>{w.simulationDistance ?? NO_VALUE}</InfoRow>
                    <InfoRow label='Spawn protection'>{w.spawnProtection ?? NO_VALUE}</InfoRow>
                    <InfoRow label='Whitelist'>{flag(w.whitelist, 'On', 'Off')}</InfoRow>
                    <InfoRow label='Online mode'>{flag(w.onlineMode, 'On', 'Off')}</InfoRow>
                </>
            )}
        </Rows>
    );
};

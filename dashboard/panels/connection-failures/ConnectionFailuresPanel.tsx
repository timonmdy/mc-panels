import React from 'react';
import styled from 'styled-components';
import { BarList } from '../../framework/charts';
import { color } from '../../framework/theme';
import { Badge, EmptyState } from '../../framework/ui';
import { useFailures } from '../../data/data.hooks';
import { timeAgo } from '../../utils/time.util';
import { FAILURE_REASONS } from '../failureReasons.config';
import { List, ListRow } from '../shared/ListRow/ListRow';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import type { PanelProps } from '../registry/panel.types';

const Total = styled.div`
    margin-bottom: 10px;
    color: ${color.muted};
    font-size: 12px;

    strong {
        margin-right: 6px;
        color: ${color.text};
        font-size: 24px;
    }
`;

export const ConnectionFailuresPanel = ({ settings }: PanelProps) => {
    const failures = useFailures();
    if (failures.error && !failures.data) return <PanelError message={failures.error} />;
    if (!failures.data) return <PanelLoading />;

    const { total, byReason, recent } = failures.data;
    if (!total) return <EmptyState icon='failures' title='No failed connections' hint='Not whitelisted, banned or aborted attempts show up here.' />;

    const showSummary = settings.view !== 'recent';
    const showRecent = settings.view !== 'summary';

    return (
        <>
            <Total>
                <strong>{total}</strong>failed connections
            </Total>
            {showSummary && <BarList items={byReason.map((r) => ({ id: r.reason, label: FAILURE_REASONS[r.reason].label, value: r.count, color: FAILURE_REASONS[r.reason].color }))} />}
            {showRecent && (
                <List style={{ marginTop: showSummary ? 14 : 0 }}>
                    {recent.slice(0, Number(settings.maxRows) || 8).map((item) => (
                        <ListRow key={item.id}>
                            <Badge>{FAILURE_REASONS[item.reason].label}</Badge>
                            <span className='grow'>{item.name ?? 'unknown'}</span>
                            {item.ip && <span className='muted'>{item.ip}</span>}
                            <span className='muted'>{timeAgo(item.ts)}</span>
                        </ListRow>
                    ))}
                </List>
            )}
        </>
    );
};

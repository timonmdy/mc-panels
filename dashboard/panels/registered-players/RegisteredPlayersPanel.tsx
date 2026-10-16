import React, { useState } from 'react';
import { Badge, Button, EmptyState, Input, Segmented } from '../../framework/ui';
import { usePlayers } from '../../data/data.hooks';
import { useDashboard } from '../../data/useDashboard';
import { useDebounced } from '../../hooks/useDebounced';
import { formatDayClock, timeAgo } from '../../utils/time.util';
import { List, ListRow } from '../shared/ListRow/ListRow';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import { PlayerAvatar } from '../shared/PlayerAvatar/PlayerAvatar';
import type { PanelProps } from '../registry/panel.types';
import { Details, Pager, RowButton, Toolbar } from './RegisteredPlayersPanel.styles';

type Filter = 'all' | 'online' | 'banned';

export const RegisteredPlayersPanel = ({ settings }: PanelProps) => {
    const { permissions } = useDashboard();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState<number | null>(null);
    const q = useDebounced(search.trim());
    const perPage = Number(settings.pageSize) || 10;

    const players = usePlayers({ kind: 'registered', q: q || undefined, filter, page, perPage });
    const pages = players.data ? Math.max(1, Math.ceil(players.data.total / perPage)) : 1;

    return (
        <>
            <Toolbar>
                <Input placeholder='Search players' value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                <Segmented<Filter>
                    value={filter}
                    onChange={(next) => { setFilter(next); setPage(1); }}
                    options={[{ value: 'all', label: 'All' }, { value: 'online', label: 'Online' }, { value: 'banned', label: 'Banned' }]}
                />
            </Toolbar>

            {players.error && !players.data ? <PanelError message={players.error} /> : !players.data ? <PanelLoading /> : !players.data.data.length ? (
                <EmptyState icon='registered' title='No players found' hint='Players are registered when they join or appear in the server files.' />
            ) : (
                <List>
                    {players.data.data.map((player) => (
                        <React.Fragment key={player.id}>
                            <ListRow>
                                <RowButton type='button' onClick={() => setOpen(open === player.id ? null : player.id)} aria-expanded={open === player.id}>
                                    {settings.showAvatars && <PlayerAvatar name={player.name} uuid={player.uuid} />}
                                    <span className='grow'>{player.name}</span>
                                </RowButton>
                                {player.online && <Badge $tone='good'>Online</Badge>}
                                {player.banned && <Badge $tone='bad'>Banned</Badge>}
                                {player.ipBanned && <Badge $tone='warn'>IP ban</Badge>}
                                {settings.showLastSeen && !player.online && <span className='muted'>{timeAgo(player.lastSeen)}</span>}
                            </ListRow>
                            {open === player.id && (
                                <Details>
                                    <div><span>UUID</span><strong>{player.uuid ?? 'unknown'}</strong></div>
                                    <div><span>First seen</span><strong>{player.firstSeen ? formatDayClock(player.firstSeen) : '\u2014'}</strong></div>
                                    {player.banned && <div><span>Ban reason</span><strong>{player.banReason ?? 'No reason given'}</strong></div>}
                                    {settings.showIpHistory && permissions.seeIps && (
                                        <>
                                            <h4>IP history</h4>
                                            {player.ips.length ? player.ips.map((entry) => (
                                                <div key={entry.ip}><strong>{entry.ip}</strong><span>{entry.hits}x, last {timeAgo(entry.lastSeen)}</span></div>
                                            )) : <span>No IP recorded</span>}
                                        </>
                                    )}
                                </Details>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            )}

            {players.data && players.data.total > perPage && (
                <Pager>
                    <span>{players.data.total} players</span>
                    <span>
                        <Button size='sm' variant='ghost' disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                        {page} / {pages}
                        <Button size='sm' variant='ghost' disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
                    </span>
                </Pager>
            )}
        </>
    );
};

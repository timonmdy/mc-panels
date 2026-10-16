import React from 'react';
import { EmptyState, Input } from '../../framework/ui';
import { usePlayers } from '../../data/data.hooks';
import { useDashboard } from '../../data/useDashboard';
import { useDebounced } from '../../hooks/useDebounced';
import { timeAgo } from '../../utils/time.util';
import { List, ListRow } from '../shared/ListRow/ListRow';
import { PanelError, PanelLoading } from '../shared/PanelError/PanelError';
import { PlayerAvatar } from '../shared/PlayerAvatar/PlayerAvatar';
import type { PanelProps } from '../registry/panel.types';
import { Toolbar } from '../registered-players/RegisteredPlayersPanel.styles';

export const OnlinePlayersPanel = ({ settings }: PanelProps) => {
    const { permissions } = useDashboard();
    const [search, setSearch] = React.useState('');
    const q = useDebounced(search.trim());
    const players = usePlayers({ kind: 'online', q: q || undefined, perPage: Number(settings.maxRows) || 10 });

    if (players.error && !players.data) return <PanelError message={players.error} />;
    if (!players.data) return <PanelLoading />;

    return (
        <>
            <Toolbar>
                <Input aria-label='Search online players' placeholder='Search players' value={search} onChange={(e) => setSearch(e.target.value)} />
            </Toolbar>
            {!players.data.data.length ? (
                <EmptyState
                    icon='players'
                    title={q ? 'No matching players' : 'Nobody is online'}
                    hint={q ? 'Try another player name.' : 'Players appear here shortly after they join.'}
                />
            ) : (
                <List>
                    {players.data.data.map((player) => (
                        <ListRow key={player.id}>
                            {settings.showAvatars && <PlayerAvatar name={player.name} uuid={player.uuid} />}
                            <span className='grow'>{player.name}</span>
                            {settings.showIp && permissions.seeIps && player.lastIp && <span className='muted'>{player.lastIp}</span>}
                            {settings.showJoinTime && <span className='muted'>{timeAgo(player.lastSeen)}</span>}
                        </ListRow>
                    ))}
                    {players.data.total > players.data.data.length && <ListRow className='muted'>+{players.data.total - players.data.data.length} more</ListRow>}
                </List>
            )}
        </>
    );
};

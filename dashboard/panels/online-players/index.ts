import { definePanel } from '../registry/panel.types';
import { ONLINE_PLAYERS_DEFAULTS, ONLINE_PLAYERS_FIELDS } from './onlinePlayers.config';
import { OnlinePlayersPanel } from './OnlinePlayersPanel';

export const onlinePlayersPanel = definePanel({
    type: 'online-players-list',
    title: 'Online players',
    description: 'Who is on the server right now.',
    icon: 'players',
    category: 'Players',
    multiple: false,
    defaultSize: { w: 1, h: 4 },
    minSize: { w: 1, h: 2 },
    defaultSettings: ONLINE_PLAYERS_DEFAULTS,
    fields: ONLINE_PLAYERS_FIELDS,
    component: OnlinePlayersPanel,
});

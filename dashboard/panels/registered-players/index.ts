import React from 'react';
import { definePanel } from '../registry/panel.types';
import { REGISTERED_DEFAULTS, REGISTERED_FIELDS } from './registeredPlayers.config';
import { RegisteredPlayersInfo } from './RegisteredPlayersInfo';
import { RegisteredPlayersPanel } from './RegisteredPlayersPanel';

export const registeredPlayersPanel = definePanel({
    type: 'registered-players-list',
    title: 'Registered players',
    description: 'Everyone who has joined, with ban status and IP history.',
    icon: 'registered',
    category: 'Players',
    multiple: false,
    defaultSize: { w: 2, h: 5 },
    minSize: { w: 1, h: 3 },
    defaultSettings: REGISTERED_DEFAULTS,
    fields: REGISTERED_FIELDS,
    component: RegisteredPlayersPanel,
    info: React.createElement(RegisteredPlayersInfo),
});

import { connectionFailuresPanel } from '../connection-failures';
import { consoleIssuesPanel } from '../console-issues';
import { diskPanel } from '../disk';
import { externalLinkPanel } from '../external-link';
import { metricPanels } from '../metric';
import { notePanel } from '../note';
import { onlinePlayersPanel } from '../online-players';
import { registeredPlayersPanel } from '../registered-players';
import { serverInfoPanel } from '../server-info';
import { statusBarPanel } from '../status-bar';
import { systemInfoPanel } from '../system-info';
import { uptimePanel } from '../uptime';
import { uptimeChartPanel } from '../uptime-chart';
import { worldInfoPanel } from '../world-info';
import type { AnyPanelDefinition } from './panel.types';

export const allPanels: AnyPanelDefinition[] = [
    statusBarPanel,
    ...metricPanels,
    onlinePlayersPanel,
    registeredPlayersPanel,
    connectionFailuresPanel,
    diskPanel,
    uptimePanel,
    uptimeChartPanel,
    systemInfoPanel,
    serverInfoPanel,
    worldInfoPanel,
    consoleIssuesPanel,
    notePanel,
    externalLinkPanel,
];

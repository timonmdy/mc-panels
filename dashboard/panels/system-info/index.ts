import { definePanel } from '../registry/panel.types';
import { SystemInfoPanel } from './SystemInfoPanel';

export const systemInfoPanel = definePanel({
    type: 'system-info',
    title: 'System info',
    description: 'Java version and operating system the server runs on.',
    icon: 'system',
    category: 'Server',
    multiple: false,
    defaultSize: { w: 1, h: 3 },
    defaultSettings: { showKernel: false, showThreads: false, showImage: false },
    fields: [
        { kind: 'toggle', key: 'showKernel', label: 'Show kernel' },
        { kind: 'toggle', key: 'showThreads', label: 'Show node CPU threads' },
        { kind: 'toggle', key: 'showImage', label: 'Show Docker image' },
    ],
    component: SystemInfoPanel,
});

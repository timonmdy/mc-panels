import { definePanel } from '../registry/panel.types';
import { ExternalLinkPanel } from './ExternalLinkPanel';

export const externalLinkPanel = definePanel({
    type: 'external-link',
    title: 'External link',
    description: 'Shortcut to a map, wiki or any other web page.',
    icon: 'link',
    category: 'Utility',
    multiple: true,
    defaultSize: { w: 1, h: 1 },
    defaultSettings: { panelTitle: '', linkTitle: '', label: '', url: '', description: '' },
    fields: [
        { kind: 'text', key: 'panelTitle', label: 'Panel title', placeholder: 'External link', maxLength: 60 },
        { kind: 'text', key: 'linkTitle', label: 'Link title', placeholder: 'Uses saved label or website name', maxLength: 60 },
        { kind: 'text', key: 'url', label: 'URL', placeholder: 'https://map.example.com/?server={uuid}', help: 'Placeholders: {uuid} {ip} {port}', maxLength: 500 },
        { kind: 'text', key: 'description', label: 'Description', maxLength: 120 },
    ],
    titleOf: (settings) => String(settings.panelTitle || 'External link'),
    component: ExternalLinkPanel,
});

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
    defaultSettings: { panelTitle: '', linkTitle: '', label: '', url: '', description: '', confirmationMessage: '' },
    fields: [
        { kind: 'text', key: 'panelTitle', label: 'Panel title', placeholder: 'External link', maxLength: 60 },
        { kind: 'text', key: 'linkTitle', label: 'Link title', placeholder: 'Uses saved label or website name', maxLength: 60 },
        { kind: 'text', key: 'url', label: 'URL', placeholder: 'https://map.example.com/?server={uuid}', help: 'Placeholders: {uuid} {ip} {port}', maxLength: 500 },
        { kind: 'text', key: 'description', label: 'Description', maxLength: 120 },
    ],
    advancedFields: [
        { kind: 'text', key: 'confirmationMessage', label: 'Confirmation message', placeholder: 'This link opens an external website.', help: 'Visitors must confirm before the link opens.', multiline: true, maxLength: 300 },
    ],
    titleOf: (settings) => String(settings.panelTitle || 'External link'),
    component: ExternalLinkPanel,
});

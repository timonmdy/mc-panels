import { definePanel } from '../registry/panel.types';
import { NotePanel } from './NotePanel';

export const notePanel = definePanel({
    type: 'note',
    title: 'Note',
    description: 'Free text for addresses, coordinates or reminders.',
    icon: 'note',
    category: 'Utility',
    multiple: true,
    defaultSize: { w: 1, h: 2 },
    defaultSettings: { title: 'Notes', text: '', monospace: false },
    fields: [
        { kind: 'text', key: 'title', label: 'Title', maxLength: 60 },
        { kind: 'text', key: 'text', label: 'Text', multiline: true, maxLength: 5000 },
        { kind: 'toggle', key: 'monospace', label: 'Monospace font' },
    ],
    titleOf: (settings) => String(settings.title || 'Note'),
    component: NotePanel,
});

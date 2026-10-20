import { definePanel } from '../registry/panel.types';
import { ConsoleIssuesPanel } from './ConsoleIssuesPanel';
import { CONSOLE_ISSUE_IGNORE_LIBRARY } from './ignore-patterns';

export const consoleIssuesPanel = definePanel({
    type: 'console-issues',
    title: 'Console issues',
    description: 'Errors and warnings from the latest server log, grouped by message.',
    icon: 'console',
    category: 'Server',
    multiple: true,
    defaultSize: { w: 2, h: 4 },
    minSize: { w: 1, h: 3 },
    defaultSettings: { defaultLevel: 'all', maxRows: 30, ignorePatterns: [] as string[] },
    fields: [
        {
            kind: 'select',
            key: 'defaultLevel',
            label: 'Initial filter',
            options: [
                { value: 'all', label: 'All' },
                { value: 'error', label: 'Errors' },
                { value: 'warn', label: 'Warnings' },
            ],
        },
        { kind: 'number', key: 'maxRows', label: 'Maximum groups listed', min: 5, max: 200 },
        {
            kind: 'regex-list',
            key: 'ignorePatterns',
            label: 'Ignored message patterns',
            help: 'Patterns only affect this panel. Use PHP PCRE syntax, including delimiters, and match against the message text.',
            library: CONSOLE_ISSUE_IGNORE_LIBRARY,
        },
    ],
    info: "Console errors and warnings are read from the server's current logs/latest.log file; they are not stored in the MC Panels database. Only issues from the current day's log are shown. The selected dashboard time span does not affect this panel.",
    component: ConsoleIssuesPanel,
});

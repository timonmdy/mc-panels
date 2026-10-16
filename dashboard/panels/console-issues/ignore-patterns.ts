import type { RegexLibraryEntry } from '../registry/panel.types';

export const CONSOLE_ISSUE_IGNORE_LIBRARY: RegexLibraryEntry[] = [
    {
        value: String.raw`/No data fixer registered for/`,
        label: 'Missing data fixer registration',
        description: 'Hides mod compatibility warnings about unregistered data fixers.',
    },
    {
        value: String.raw`/Registry '[^']+' was empty after loading/i`,
        label: 'Empty registry warnings',
        description: 'Hides empty-registry warnings regardless of the mod or registry identifier.',
    },
    {
        value: String.raw`/Unknown registry key in ResourceKey\[minecraft:root \/ minecraft:item\]:/`,
        label: 'Unknown Minecraft item registry key',
        description: 'Hides warnings about unknown item registry keys.',
    },
    {
        value: String.raw`/Reference map '[^']+\.refmap\.json' for [^ ]+\.mixins\.json could not be read/i`,
        label: 'Unreadable mixin reference maps',
        description: 'Hides refmap warnings regardless of the mod or mixin configuration name.',
    },
    {
        value: String.raw`/Can't keep up! Is the server overloaded\?/i`,
        label: 'Server behind: “Can’t keep up”',
        description: 'Hides tick-lag warnings. Use only if you do not want these performance warnings shown.',
    },
    {
        value: String.raw`/^[\w-]{1,16} moved too quickly!/i`,
        label: 'Player movement: moved too quickly',
        description: 'Hides vanilla movement warnings that can be noisy with lag or unusual movement.',
    },
    {
        value: String.raw`/^[\w-]{1,16} moved wrongly!/i`,
        label: 'Player movement: moved wrongly',
        description: 'Hides vanilla player movement correction warnings.',
    },
    {
        value: String.raw`/Unknown recipe/i`,
        label: 'Unknown recipe',
        description: 'Hides log messages about recipe identifiers the server does not recognize.',
    },
    {
        value: String.raw`/Skipping .* with id .* at \(/i`,
        label: 'Skipped entity',
        description: 'Hides entity-skip messages, which can repeat for problematic entities.',
    },
];

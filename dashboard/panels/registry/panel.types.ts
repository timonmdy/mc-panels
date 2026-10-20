import type { ComponentType, ReactNode } from 'react';
import type { IconName } from '../../framework/ui';

export type PanelSettings = Record<string, any>;

export type PanelCategory = 'Performance' | 'Players' | 'Server' | 'Moderation' | 'Utility';

export interface PanelSize {
    w: number;
    h: number;
}

export interface PanelProps<S extends PanelSettings = PanelSettings> {
    id: string;
    settings: S;
    size: PanelSize;
    updateSettings: (patch: Partial<S>) => void;
}

export type SettingOption = { value: string; label: string };
export type RegexLibraryEntry = SettingOption & { description: string };

export type SettingField =
    | { kind: 'toggle'; key: string; label: string; help?: string }
    | { kind: 'select'; key: string; label: string; options: SettingOption[]; help?: string }
    | { kind: 'number'; key: string; label: string; min?: number; max?: number; step?: number; placeholder?: string; help?: string }
    | { kind: 'regex-list'; key: string; label: string; help?: string; library: RegexLibraryEntry[] }
    | { kind: 'text'; key: string; label: string; placeholder?: string; help?: string; multiline?: boolean; maxLength?: number };

export interface PanelDefinition<S extends PanelSettings = PanelSettings> {
    type: string;
    title: string;
    description: string;
    icon: IconName;
    category: PanelCategory;
    multiple: boolean;
    defaultSize: PanelSize;
    minSize?: PanelSize;
    maxSize?: PanelSize;
    defaultSettings: S;
    fields: SettingField[];
    advancedFields?: SettingField[];
    component: ComponentType<PanelProps<S>>;
    titleOf?: (settings: S) => string;
    bare?: boolean;
    info?: ReactNode;
}

export type AnyPanelDefinition = PanelDefinition<PanelSettings>;

export const definePanel = <S extends PanelSettings>(definition: PanelDefinition<S>): AnyPanelDefinition => definition as unknown as AnyPanelDefinition;

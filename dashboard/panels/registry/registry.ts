import { GRID } from '../../config/app.config';
import type { PanelInstance } from '../../api/api.types';
import { makeId } from '../../utils/id.util';
import { clamp } from '../../utils/number.util';
import type { SizeLimits } from '../../framework/grid';
import { allPanels } from './panels.list';
import type { AnyPanelDefinition } from './panel.types';

const byType = new Map<string, AnyPanelDefinition>(allPanels.map((definition) => [definition.type, definition]));

export const listPanelDefinitions = (): AnyPanelDefinition[] => allPanels;

export const getPanelDefinition = (type: string): AnyPanelDefinition | undefined => byType.get(type);

export const createInstance = (type: string, overrides: Partial<Pick<PanelInstance, 'w' | 'h' | 'settings'>> = {}): PanelInstance => {
    const definition = byType.get(type);
    if (!definition) throw new Error(`Unknown panel type: ${type}`);

    return {
        id: makeId(),
        type,
        w: clamp(overrides.w ?? definition.defaultSize.w, 1, GRID.maxColumns),
        h: clamp(overrides.h ?? definition.defaultSize.h, 1, GRID.maxRows),
        settings: { ...definition.defaultSettings, ...(overrides.settings ?? {}) },
    };
};

export const limitsOf = (definition: AnyPanelDefinition | undefined): SizeLimits => ({
    minW: definition?.minSize?.w ?? 1,
    maxW: definition?.maxSize?.w ?? GRID.maxColumns,
    minH: definition?.minSize?.h ?? 1,
    maxH: definition?.maxSize?.h ?? GRID.maxRows,
});

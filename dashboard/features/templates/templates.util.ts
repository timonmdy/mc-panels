import type { Layout } from '../../api/api.types';
import { makeId } from '../../utils/id.util';
import { createInstance, getPanelDefinition } from '../../panels/registry';
import type { TemplateSpec } from './templates.config';

export const layoutFromSpec = (spec: TemplateSpec): Layout => {
    const validPanels = spec.panels.filter((panel) => getPanelDefinition(panel.type));
    const panels = validPanels.map((panel) => createInstance(panel.type, panel));
    if (!spec.rows) return { panels };

    const idMap = new Map(validPanels.flatMap((panel, index) => panel.id ? [[panel.id, panels[index].id] as const] : []));
    const rows = spec.rows.map((row) => ({
        id: makeId(),
        slots: row.slots.flatMap((id) => {
            const mappedId = idMap.get(id);

            return mappedId ? [mappedId] : [];
        }),
    })).filter((row) => row.slots.length > 0);

    return { panels, rows };
};

export const cloneLayout = (layout: Layout): Layout => {
    const validPanels = layout.panels.filter((panel) => getPanelDefinition(panel.type));
    const panels = validPanels.map((panel) => ({ ...panel, id: makeId(), settings: { ...panel.settings } }));
    const idMap = new Map(validPanels.map((panel, index) => [panel.id, panels[index].id] as const));

    return {
        panels,
        ...(layout.rows ? {
            rows: layout.rows.map((row) => ({
                ...row,
                id: makeId(),
                slots: row.slots.flatMap((id) => {
                    const mappedId = idMap.get(id);

                    return mappedId ? [mappedId] : [id];
                }),
            })),
        } : {}),
        ...(layout.spaceSizes ? { spaceSizes: { ...layout.spaceSizes } } : {}),
    };
};

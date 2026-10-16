import { createElement } from 'react';
import { definePanel, PanelProps } from '../../registry/panel.types';
import type { MetricDefinition } from '../metric.types';
import { MetricStatPanel } from './MetricStatPanel';
import { STAT_DEFAULTS, STAT_FIELDS } from './metricStat.config';

export const createMetricStatPanel = (definition: MetricDefinition) =>
    definePanel({
        type: `${definition.id}-stat`,
        title: `${definition.label}`,
        description: `Current ${definition.label.toLowerCase()} with average, peak and change over the selected time span.`,
        icon: definition.icon,
        category: definition.id.includes('players') ? 'Players' : 'Performance',
        multiple: false,
        defaultSize: { w: 1, h: 2 },
        maxSize: { w: 2, h: 3 },
        defaultSettings: { ...STAT_DEFAULTS, ...(definition.defaults ?? {}) },
        fields: [...(definition.fields ?? []), ...STAT_FIELDS],
        component: (props: PanelProps) => createElement(MetricStatPanel, { ...props, definition }),
    });

import { createElement } from 'react';
import { definePanel, PanelProps } from '../../registry/panel.types';
import type { MetricDefinition } from '../metric.types';
import { MetricChartPanel } from './MetricChartPanel';
import { CHART_DEFAULTS, CHART_FIELDS } from './metricChart.config';

export const createMetricChartPanel = (definition: MetricDefinition) =>
    definePanel({
        type: `${definition.id}-chart`,
        title: `${definition.label} history`,
        description: `${definition.label} over the selected time span.`,
        icon: definition.icon,
        category: definition.id.includes('players') ? 'Players' : 'Performance',
        multiple: false,
        defaultSize: { w: 2, h: 3 },
        minSize: { w: 1, h: 2 },
        defaultSettings: { ...CHART_DEFAULTS, ...(definition.defaults ?? {}) },
        fields: [...(definition.fields ?? []), ...CHART_FIELDS],
        component: (props: PanelProps) => createElement(MetricChartPanel, { ...props, definition }),
    });

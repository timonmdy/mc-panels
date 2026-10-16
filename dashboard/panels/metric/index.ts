import type { AnyPanelDefinition } from '../registry/panel.types';
import { createMetricChartPanel } from './MetricChartPanel/createMetricChartPanel';
import { createMetricStatPanel } from './MetricStatPanel/createMetricStatPanel';
import { METRICS } from './metrics.config';

export const metricPanels: AnyPanelDefinition[] = METRICS.reduce<AnyPanelDefinition[]>(
    (panels, metric) => panels.concat([createMetricStatPanel(metric), createMetricChartPanel(metric)]),
    []
);

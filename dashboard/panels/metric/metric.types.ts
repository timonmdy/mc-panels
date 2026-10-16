import type { LiveSnapshot, MetricKey, PublicConfig } from '../../api/api.types';
import type { IconName } from '../../framework/ui';
import type { PanelSettings, SettingField } from '../registry/panel.types';

export interface Thresholds {
    warn: number;
    crit: number;
    direction: 'above' | 'below';
}

export interface MetricDefinition {
    id: string;
    label: string;
    icon: IconName;
    color: string;
    trend: 'higher-is-better' | 'lower-is-better' | 'neutral';
    keyFor: (settings: PanelSettings) => MetricKey;
    liveValue: (live: LiveSnapshot, key: MetricKey) => number | null;
    format: (value: number | null | undefined, key: MetricKey) => string;
    deltaMode: (key: MetricKey) => 'points' | 'relative';
    thresholds?: (key: MetricKey) => Thresholds | undefined;
    axisCap?: (key: MetricKey) => number | undefined;
    axisFloor?: (key: MetricKey) => number | undefined;
    subtitle?: (live: LiveSnapshot) => string | null;
    unavailable?: (features: PublicConfig['features']) => string | null;
    fields?: SettingField[];
    defaults?: PanelSettings;
}

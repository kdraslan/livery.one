import type { ModelType } from '@/types';

import { FEATURE_DEFINITIONS, type FeatureName } from '@/constants/features';

export interface ModelInfo {
  name: string;
  type: ModelType;
  description: string;
  features: FeatureName[];
  r2: number; // Percentage, not a fraction.
  mae: number; // Grams.
  best?: boolean;
}

export const MODEL_INFO: ModelInfo[] = [
  {
    name: 'Linear Regression',
    type: 'linear',
    description: 'Baseline model. Always available with just the two required fields.',
    features: [FEATURE_DEFINITIONS.VOLUME, FEATURE_DEFINITIONS.GENDER],
    r2: 77.0,
    mae: 32.2,
  },
  {
    name: 'Ridge (Body)',
    type: 'ridge',
    description: 'Highest accuracy. Uses body measurements instead of vascular data.',
    features: [
      FEATURE_DEFINITIONS.VOLUME,
      FEATURE_DEFINITIONS.GENDER,
      FEATURE_DEFINITIONS.HEIGHT,
      FEATURE_DEFINITIONS.WEIGHT,
    ],
    r2: 85.9,
    mae: 30.3,
    best: true,
  },
  {
    name: 'Ridge (All Features)',
    type: 'ridge',
    description: 'Combines body measurements with full VCI data for a strong all-round estimate.',
    features: [
      FEATURE_DEFINITIONS.VOLUME,
      FEATURE_DEFINITIONS.GENDER,
      FEATURE_DEFINITIONS.HEIGHT,
      FEATURE_DEFINITIONS.WEIGHT,
      FEATURE_DEFINITIONS.AGE,
      FEATURE_DEFINITIONS.VCI_SUPRA,
      FEATURE_DEFINITIONS.VCI_VENO,
    ],
    r2: 84.9,
    mae: 30.7,
  },
  {
    name: 'Neural Network',
    type: 'mlp',
    description: 'Deep learning model for vascular-based prediction. Needs VCI Suprarenal.',
    features: [
      FEATURE_DEFINITIONS.VOLUME,
      FEATURE_DEFINITIONS.GENDER,
      FEATURE_DEFINITIONS.VCI_SUPRA,
    ],
    r2: 79.9,
    mae: 32.1,
  },
  {
    name: 'Ridge (Full VCI)',
    type: 'ridge',
    description: 'Vascular model using both VCI areas plus age, when body data is unavailable.',
    features: [
      FEATURE_DEFINITIONS.VOLUME,
      FEATURE_DEFINITIONS.GENDER,
      FEATURE_DEFINITIONS.AGE,
      FEATURE_DEFINITIONS.VCI_SUPRA,
      FEATURE_DEFINITIONS.VCI_VENO,
    ],
    r2: 79.6,
    mae: 32.9,
  },
  {
    name: 'Ridge (VCI)',
    type: 'ridge',
    description: 'Minimal vascular model when only VCI Suprarenal is available.',
    features: [
      FEATURE_DEFINITIONS.VOLUME,
      FEATURE_DEFINITIONS.GENDER,
      FEATURE_DEFINITIONS.VCI_SUPRA,
    ],
    r2: 73.9,
    mae: 34.6,
  },
];

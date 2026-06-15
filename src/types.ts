export type ModelType = 'linear' | 'mlp' | 'ridge';
export type EnhancedModelType = Extract<ModelType, 'mlp' | 'ridge'>;

export interface PredictionResult {
  weight: number;
  model: ModelType;
  modelLabel: string;
  r2?: number;
  mae?: number;
  usedFeatures?: string[];
  enteredFeatures?: string[];
}

/**
 * Linear regression model for liver weight prediction.
 * Uses only Preoperation Volume and Gender.
 *
 * Formula re-derived from updated dataset (102 patients, complete data):
 * Weight = 169.817 + 0.6444 * Volume - 0.6907 * Gender
 *
 * Performance: R² = 0.77, MAE = 32.24g
 */

const INTERCEPT = 169.8165;
const COEF_VOLUME = 0.644422;
const COEF_GENDER = -0.690664;

export interface LinearPredictionInput {
  volume: number;
  gender: number; // 0 = Female, 1 = Male
}

export interface LinearPredictionResult {
  weight: number;
  model: 'linear';
  modelLabel: string;
  r2: number;
  mae: number;
}

export function useLinearModel() {
  function predict(input: LinearPredictionInput): LinearPredictionResult {
    const weight = INTERCEPT + COEF_VOLUME * input.volume + COEF_GENDER * input.gender;

    return {
      weight: Math.round(weight * 100) / 100,
      model: 'linear',
      modelLabel: 'Linear Regression',
      r2: 0.77,
      mae: 32.24,
    };
  }

  return { predict };
}

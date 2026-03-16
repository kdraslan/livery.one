/**
 * Linear regression model for liver weight prediction.
 * Uses only Preoperation Volume and Gender.
 *
 * Formula derived from the notebook baseline:
 * Weight = 163.014 + 0.6578 * Volume - 4.584 * Gender
 *
 * Performance: R² = 0.75, MAE = 32.15g
 */

const INTERCEPT = 163.0137;
const COEF_VOLUME = 0.6578;
const COEF_GENDER = -4.5842;

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
      r2: 0.75,
      mae: 32.15,
    };
  }

  return { predict };
}

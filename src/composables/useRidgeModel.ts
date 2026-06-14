import { ref } from 'vue';

export interface RidgePredictionInput {
  volume: number;
  gender: number;
  // Body measurements
  height?: number;
  weight?: number;
  // VCI measurements
  vciArea?: number;
  age?: number;
  vciVenoatrial?: number;
}

export interface RidgePredictionResult {
  weight: number;
  model: 'ridge';
  modelLabel: string;
  r2: number;
  mae: number;
}

interface RidgeModelParams {
  input_features: string[];
  feature_names: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  ridge_intercept: number;
  ridge_coefs: number[];
  metrics: { r2: number; mae_grams: number; rmse_grams?: number; r2_cv_mean?: number };
}

interface RidgeParamsFile {
  partial: RidgeModelParams;
  full: RidgeModelParams;
  body_simple: RidgeModelParams;
  body_full: RidgeModelParams;
  all: RidgeModelParams;
}

const PARAMS_URL = '/models/poly2_ridge_params.json';

let params: RidgeParamsFile | null = null;

const EPS = 1e-6;

/**
 * Generate polynomial features of degree 2 (quadratic terms + interactions).
 * Matches sklearn's PolynomialFeatures(degree=2, include_bias=False) order:
 *   [x0, x1, ..., xn, x0², x0*x1, ..., x0*xn, x1², x1*x2, ..., xn²]
 *
 * Used by all Ridge model variants during prediction.
 */
function poly2Features(x: number[]): number[] {
  const out = [...x]; // Original features
  for (let i = 0; i < x.length; i++) {
    for (let j = i; j < x.length; j++) { // j starts at i to avoid duplicates
      out.push(x[i] * x[j]);
    }
  }
  return out;
}

function bmi(height: number, weight: number): number {
  const h = height / 100;
  return weight / (h * h);
}

/**
 * Build raw features matching the training order for a given variant.
 *
 * Steps:
 *   1. Compute all base features (volume, gender, age, height, weight, VCI areas)
 *   2. Derive secondary features (BMI, VCI Total, VCI Diff, Vol×interactions)
 *   3. Look up each feature in featureMap by name from p.input_features
 *   4. Return ordered array matching the variant's expected feature order
 *
 * This ensures client-side features are built in the exact order and with the
 * exact formulas used during Python model training.
 */
function buildFeatures(p: RidgeModelParams, input: RidgePredictionInput): number[] {
  const vol = input.volume;
  const gen = input.gender;
  const age = input.age ?? 0;
  const h = input.height ?? 0;
  const w = input.weight ?? 0;
  const b = h > 0 && w > 0 ? bmi(h, w) : 0;
  const vciSupra = input.vciArea ?? 0;
  const vciVeno = input.vciVenoatrial ?? 0;
  const vciTotal = vciSupra + vciVeno;
  const vciDiff = vciVeno - vciSupra;
  const volPerVci = vol / (vciTotal + EPS);
  const volAge = vol * age;
  const volGender = vol * gen;
  const volBmi = vol * b;
  const volWeight = vol * w;

  // Map feature names to computed values
  const featureMap: Record<string, number> = {
    'Preoperation Volume (CC)': vol,
    'Gender': gen,
    'Age': age,
    'Height (cm)': h,
    'Weight (kg)': w,
    'BMI': b,
    'VCI Area Suprarenal (cm²)': vciSupra,
    'VCI Area Venoatrial (cm²)': vciVeno,
    'VCI Total (cm²)': vciTotal,
    'VCI Diff (cm²)': vciDiff,
    'Vol / VCI Total': volPerVci,
    'Vol x Age': volAge,
    'Vol x Gender': volGender,
    'Vol x BMI': volBmi,
    'Vol x Weight': volWeight,
  };

  // Return features in the order specified by the model variant
  return p.inputFeatures.map((name) => featureMap[name] ?? 0);
}

export function useRidgeModel() {
  const isLoading = ref(false);
  const isReady = ref(params !== null);
  const error = ref<string | null>(null);

  async function load(): Promise<void> {
    if (params) {
      isReady.value = true;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(PARAMS_URL);
      params = (await response.json()) as RidgeParamsFile;
      isReady.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load Ridge model params';
      console.error('Ridge model loading error:', e);
    } finally {
      isLoading.value = false;
    }
  }

  function predict(input: RidgePredictionInput): RidgePredictionResult | null {
    if (!params) return null;

    const hasBody = input.height != null && input.height > 0 && input.weight != null && input.weight > 0;
    const hasVci = input.vciArea != null && input.vciArea > 0;
    const hasFullVci = hasVci && input.age != null && input.age >= 0 && input.vciVenoatrial != null && input.vciVenoatrial > 0;

    // Select best variant based on available inputs.
    // body_full (R²=0.833) is intentionally skipped — body_simple (R²=0.859) outperforms it.
    // The final else branch (no VCI, no body) should not be reached in normal use because
    // the form only calls predict() when at least one of these is filled.
    let variant: keyof RidgeParamsFile;
    let label: string;

    if (hasBody && hasFullVci) {
      variant = 'all';
      label = 'Ridge (All Features)';
    } else if (hasBody) {
      label = 'Ridge (Body)';
      variant = 'body_simple';
    } else if (hasFullVci) {
      variant = 'full';
      label = 'Ridge (Full VCI)';
    } else if (hasVci) {
      variant = 'partial';
      label = 'Ridge (VCI)';
    } else {
      variant = 'partial';
      label = 'Ridge';
    }

    const p = params[variant];
    const rawFeatures = buildFeatures(p, input);
    const features = poly2Features(rawFeatures);

    const scaled = features.map((val, i) => (val - p.scaler_mean[i]) / p.scaler_scale[i]);

    let weight = p.ridge_intercept;
    for (let i = 0; i < scaled.length; i++) {
      weight += p.ridge_coefs[i] * scaled[i];
    }

    return {
      weight: Math.round(weight * 100) / 100,
      model: 'ridge',
      modelLabel: label,
      r2: p.metrics.r2,
      mae: p.metrics.mae_grams,
    };
  }

  return { load, predict, isLoading, isReady, error };
}

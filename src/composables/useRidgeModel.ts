import { ref } from 'vue';

export interface RidgePredictionInput {
  volume: number;
  gender: number;
  vciArea: number;
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
  scaler_mean: number[];
  scaler_scale: number[];
  ridge_intercept: number;
  ridge_coefs: number[];
  metrics: { r2: number; mae_grams: number };
}

interface RidgeParamsFile {
  partial: RidgeModelParams;
  full: RidgeModelParams;
}

const PARAMS_URL = '/models/poly2_ridge_params.json';

let params: RidgeParamsFile | null = null;

const EPS = 1e-6;

function poly2Features(x: number[]): number[] {
  const out = [...x];
  for (let i = 0; i < x.length; i++) {
    for (let j = i; j < x.length; j++) {
      out.push(x[i] * x[j]);
    }
  }
  return out;
}

function buildPartialFeatures(volume: number, gender: number, vciArea: number): number[] {
  return poly2Features([volume, gender, vciArea]);
}

function buildFullFeatures(
  volume: number,
  gender: number,
  age: number,
  vciSupra: number,
  vciVeno: number,
): number[] {
  const vciTotal = vciSupra + vciVeno;
  const vciDiff = vciVeno - vciSupra;
  const volPerVci = volume / (vciTotal + EPS);
  const volAge = volume * age;
  const volGender = volume * gender;
  const raw = [
    volume,
    gender,
    age,
    vciSupra,
    vciVeno,
    vciTotal,
    vciDiff,
    volPerVci,
    volAge,
    volGender,
  ];
  return poly2Features(raw);
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

    const age = input.age;
    const vciVeno = input.vciVenoatrial;
    const useFull =
      age != null &&
      !isNaN(age) &&
      age >= 0 &&
      vciVeno != null &&
      !isNaN(vciVeno) &&
      vciVeno > 0;

    const p = useFull ? params.full : params.partial;
    const features = useFull
      ? buildFullFeatures(
          input.volume,
          input.gender,
          age!,
          input.vciArea,
          vciVeno!,
        )
      : buildPartialFeatures(input.volume, input.gender, input.vciArea);

    const scaled = features.map(
      (val, i) => (val - p.scaler_mean[i]) / p.scaler_scale[i],
    );

    let weight = p.ridge_intercept;
    for (let i = 0; i < scaled.length; i++) {
      weight += p.ridge_coefs[i] * scaled[i];
    }

    return {
      weight: Math.round(weight * 100) / 100,
      model: 'ridge',
      modelLabel: 'Poly2 + Ridge Regression',
      r2: p.metrics.r2,
      mae: p.metrics.mae_grams,
    };
  }

  return { load, predict, isLoading, isReady, error };
}

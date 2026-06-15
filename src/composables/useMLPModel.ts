import * as tf from '@tensorflow/tfjs';
import { ref } from 'vue';

export interface MLPPredictionInput {
  volume: number;
  gender: number; // 0 = Female, 1 = Male.
  vciArea: number;
}

export interface MLPPredictionResult {
  weight: number;
  model: 'mlp';
  modelLabel: string;
  r2: number;
  mae: number;
}

interface ScalerParams {
  input_mean: number[];
  input_std: number[];
  output_mean: number;
  output_std: number;
  feature_names: string[];
  metrics: {
    r2: number;
    mae_grams: number;
  };
}

const MODEL_URL = '/models/model.json';
const SCALER_URL = '/models/scaler_params.json';

let model: tf.GraphModel | null = null;
let scalerParams: ScalerParams | null = null;

export function useMLPModel() {
  const isLoading = ref(false);
  const isReady = ref(model !== null && scalerParams !== null);
  const error = ref<string | null>(null);

  async function load(): Promise<void> {
    if (model && scalerParams) {
      isReady.value = true;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const [loadedModel, scalerResponse] = await Promise.all([
        tf.loadGraphModel(MODEL_URL),
        fetch(SCALER_URL).then((r) => r.json()),
      ]);

      model = loadedModel;
      scalerParams = scalerResponse as ScalerParams;
      isReady.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load ML model';
      console.error('MLP model loading error:', e);
    } finally {
      isLoading.value = false;
    }
  }

  function predict(input: MLPPredictionInput): MLPPredictionResult | null {
    if (!model || !scalerParams) return null;

    const rawInput = [input.volume, input.gender, input.vciArea];
    const normalized = rawInput.map(
      (val, i) => (val - scalerParams!.input_mean[i]) / scalerParams!.input_std[i],
    );

    const inputTensor = tf.tensor2d([normalized]);
    const outputTensor = model.predict(inputTensor) as tf.Tensor;
    const scaledOutput = outputTensor.dataSync()[0];

    inputTensor.dispose();
    outputTensor.dispose();

    const weight = scaledOutput * scalerParams.output_std + scalerParams.output_mean;

    return {
      weight: Math.round(weight * 100) / 100,
      model: 'mlp',
      modelLabel: 'Neural Network (MLP)',
      r2: scalerParams.metrics.r2,
      mae: scalerParams.metrics.mae_grams,
    };
  }

  return { load, predict, isLoading, isReady, error };
}

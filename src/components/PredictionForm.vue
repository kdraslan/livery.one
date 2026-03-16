<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLinearModel } from '@/composables/useLinearModel';
import { useMLPModel } from '@/composables/useMLPModel';
import { trackPrediction } from '@/firebase/tracking';

const emit = defineEmits<{
  predict: [result: { weight: number; model: 'linear' | 'mlp'; modelLabel: string }];
  loading: [isLoading: boolean];
  reset: [];
}>();

const volume = ref<string>('');
const gender = ref<string>('');
const vciArea = ref<string>('');

const linearModel = useLinearModel();
const mlpModel = useMLPModel();

const isEnhancedMode = computed(() => {
  const val = parseFloat(vciArea.value);
  return !isNaN(val) && val > 0;
});

const canSubmit = computed(() => {
  const vol = parseFloat(volume.value);
  return !isNaN(vol) && vol > 0 && gender.value !== '';
});

onMounted(async () => {
  emit('loading', true);
  await mlpModel.load();
  emit('loading', false);
});

function handleSubmit() {
  if (!canSubmit.value) return;

  const vol = parseFloat(volume.value);
  const gen = parseInt(gender.value);

  if (isEnhancedMode.value && mlpModel.isReady.value) {
    const result = mlpModel.predict({
      volume: vol,
      gender: gen,
      vciArea: parseFloat(vciArea.value),
    });
    if (result) {
      trackPrediction('mlp');
      emit('predict', result);
      return;
    }
  }

  const result = linearModel.predict({ volume: vol, gender: gen });
  trackPrediction('linear');
  emit('predict', result);
}

function handleReset() {
  volume.value = '';
  gender.value = '';
  vciArea.value = '';
  emit('reset');
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>Patient Measurements</h2>
      <div class="mode-badge" :class="{ enhanced: isEnhancedMode }">
        <span class="mode-dot" />
        {{ isEnhancedMode ? 'Enhanced ML Model' : 'Standard Model' }}
      </div>
    </div>

    <div class="fields">
      <div class="field">
        <label for="volume">
          Preoperation Volume
          <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            id="volume"
            v-model="volume"
            type="number"
            placeholder="e.g. 950"
            min="0"
            step="any"
            required
          />
          <span class="unit">CC</span>
        </div>
        <span class="hint">Liver volume estimated from CT scan</span>
      </div>

      <div class="field">
        <label for="gender">
          Gender
          <span class="required">*</span>
        </label>
        <div class="select-wrapper">
          <select id="gender" v-model="gender" required>
            <option value="" disabled>Select gender</option>
            <option value="0">Female</option>
            <option value="1">Male</option>
          </select>
        </div>
        <span class="hint">Biological sex of the patient</span>
      </div>

      <div class="field">
        <label for="vci">
          VCI Area Suprarenal
          <span class="optional">(optional)</span>
        </label>
        <div class="input-wrapper">
          <input
            id="vci"
            v-model="vciArea"
            type="number"
            placeholder="e.g. 3.52"
            min="0"
            step="any"
          />
          <span class="unit">cm&sup2;</span>
        </div>
        <span class="hint">
          Cross-sectional area of the inferior vena cava.
          <template v-if="!isEnhancedMode">
            Fill this to activate the enhanced neural network model.
          </template>
        </span>
      </div>
    </div>

    <div class="actions">
      <button type="submit" class="btn-primary" :disabled="!canSubmit">
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path
            d="M10 1a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 0110 1z"
          />
        </svg>
        Predict Weight
      </button>
      <button type="button" class="btn-secondary" @click="handleReset">Clear</button>
    </div>
  </form>
</template>

<style scoped>
.form-card {
  background: var(--color-surface);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.form-header h2 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
}

.mode-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: all 0.4s var(--ease);
}

.mode-badge.enhanced {
  background: rgba(1, 175, 171, 0.12);
  color: var(--color-primary-light);
  border-color: rgba(1, 175, 171, 0.3);
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
  transition: background 0.4s var(--ease);
}

.mode-badge.enhanced .mode-dot {
  background: var(--color-primary);
  box-shadow: 0 0 8px rgba(1, 175, 171, 0.5);
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}

.required {
  color: var(--color-danger);
  margin-left: 2px;
}

.optional {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: 0.8rem;
}

.input-wrapper,
.select-wrapper {
  position: relative;
}

input,
select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all 0.2s var(--ease);
  outline: none;
}

input:focus,
select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(1, 175, 171, 0.15);
}

input::placeholder {
  color: var(--color-text-muted);
}

.unit {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

input {
  padding-right: 48px;
}

select {
  appearance: none;
  cursor: pointer;
  padding-right: 40px;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid var(--color-text-muted);
  pointer-events: none;
}

select option {
  background: #1a2a40;
  color: var(--color-text);
}

.hint {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 4px;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s var(--ease);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(1, 175, 171, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 14px 20px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}
</style>

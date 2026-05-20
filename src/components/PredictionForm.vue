<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLinearModel } from '@/composables/useLinearModel';
import { useMLPModel } from '@/composables/useMLPModel';
import { useRidgeModel } from '@/composables/useRidgeModel';
import { trackPrediction } from '@/firebase/tracking';

const emit = defineEmits<{
  predict: [
    result: { weight: number; model: 'linear' | 'mlp' | 'ridge'; modelLabel: string },
  ];
  loading: [isLoading: boolean];
  reset: [];
}>();

const volume = ref<string>('');
const gender = ref<string>('');
const age = ref<string>('');
const height = ref<string>('');
const weight = ref<string>('');
const vciAreaSuprarenal = ref<string>('');
const vciAreaVenoatrial = ref<string>('');
const enhancedModel = ref<'mlp' | 'ridge'>('ridge');

const linearModel = useLinearModel();
const mlpModel = useMLPModel();
const ridgeModel = useRidgeModel();

// Body mode: height + weight provided (best non-VCI upgrade: R² 0.86)
const isBodyMode = computed(() => {
  const h = parseFloat(height.value);
  const w = parseFloat(weight.value);
  return !isNaN(h) && h > 0 && !isNaN(w) && w > 0;
});

// VCI mode: VCI suprarenal provided
const isVciMode = computed(() => {
  const val = parseFloat(vciAreaSuprarenal.value);
  return !isNaN(val) && val > 0;
});

// Enhanced mode: either body or VCI fields provided
const isEnhancedMode = computed(() => isBodyMode.value || isVciMode.value);

// Full VCI mode: age + both VCI fields provided
const isFullVciMode = computed(() => {
  const ageVal = parseFloat(age.value);
  const vciVenoVal = parseFloat(vciAreaVenoatrial.value);
  return isVciMode.value && !isNaN(ageVal) && ageVal > 0 && !isNaN(vciVenoVal) && vciVenoVal > 0;
});

// Best R² label to show in hints
const bestActiveR2 = computed(() => {
  if (isBodyMode.value && isVciMode.value) return '85%';
  if (isBodyMode.value) return '86%';
  if (isFullVciMode.value) return '80%';
  if (isVciMode.value) return '74%';
  return null;
});

const canSubmit = computed(() => {
  const vol = parseFloat(volume.value);
  return !isNaN(vol) && vol > 0 && gender.value !== '';
});

onMounted(async () => {
  emit('loading', true);
  await Promise.all([mlpModel.load(), ridgeModel.load()]);
  emit('loading', false);
});

function handleSubmit() {
  if (!canSubmit.value) return;

  const vol = parseFloat(volume.value);
  const gen = parseInt(gender.value);
  const ageVal = parseFloat(age.value);
  const h = parseFloat(height.value);
  const w = parseFloat(weight.value);
  const vciSupra = parseFloat(vciAreaSuprarenal.value);
  const vciVeno = parseFloat(vciAreaVenoatrial.value);

  if (isEnhancedMode.value) {
    // MLP is only available in VCI mode (needs VCI Suprarenal)
    if (enhancedModel.value === 'mlp' && isVciMode.value && mlpModel.isReady.value) {
      const result = mlpModel.predict({
        volume: vol,
        gender: gen,
        vciArea: vciSupra,
      });
      if (result) {
        trackPrediction('mlp');
        emit('predict', result);
        return;
      }
    }

    if (ridgeModel.isReady.value) {
      const result = ridgeModel.predict({
        volume: vol,
        gender: gen,
        height: isNaN(h) ? undefined : h,
        weight: isNaN(w) ? undefined : w,
        vciArea: isNaN(vciSupra) ? undefined : vciSupra,
        age: isNaN(ageVal) ? undefined : ageVal,
        vciVenoatrial: isNaN(vciVeno) ? undefined : vciVeno,
      });
      if (result) {
        trackPrediction('ridge');
        emit('predict', result);
        return;
      }
    }
  }

  const result = linearModel.predict({ volume: vol, gender: gen });
  trackPrediction('linear');
  emit('predict', result);
}

function handleReset() {
  volume.value = '';
  gender.value = '';
  age.value = '';
  height.value = '';
  weight.value = '';
  vciAreaSuprarenal.value = '';
  vciAreaVenoatrial.value = '';
  emit('reset');
}

function selectModel(model: 'mlp' | 'ridge') {
  enhancedModel.value = model;
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>Patient Measurements</h2>
      <div v-if="!isEnhancedMode" class="mode-badge">
        <span class="mode-dot" />
        Standard Model
      </div>
    </div>

    <Transition name="switch-fade">
      <div v-if="isVciMode" class="model-switch-row">
        <span class="switch-label">Model</span>
        <div class="model-switch">
          <button
            type="button"
            class="switch-option"
            :class="{ active: enhancedModel === 'ridge' }"
            @click="selectModel('ridge')"
          >
            Ridge
          </button>
          <button
            type="button"
            class="switch-option"
            :class="{ active: enhancedModel === 'mlp' }"
            @click="selectModel('mlp')"
          >
            Neural Net
          </button>
          <div
            class="switch-slider"
            :class="{ right: enhancedModel === 'mlp' }"
          />
        </div>
      </div>
    </Transition>

    <div class="fields">
      <!-- Required fields -->
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

      <!-- Body measurements section -->
      <div class="section-divider">
        <span>Body Measurements</span>
        <span v-if="isBodyMode" class="section-badge body">R² {{ bestActiveR2 }}</span>
        <span v-else class="section-hint">Fill both for a major accuracy boost</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="height">
            Height
            <span class="optional">(optional)</span>
          </label>
          <div class="input-wrapper">
            <input
              id="height"
              v-model="height"
              type="number"
              placeholder="e.g. 172"
              min="0"
              step="any"
            />
            <span class="unit">cm</span>
          </div>
        </div>

        <div class="field">
          <label for="weight">
            Weight
            <span class="optional">(optional)</span>
          </label>
          <div class="input-wrapper">
            <input
              id="weight"
              v-model="weight"
              type="number"
              placeholder="e.g. 75"
              min="0"
              step="any"
            />
            <span class="unit">kg</span>
          </div>
        </div>
      </div>

      <!-- VCI / advanced section -->
      <div class="section-divider">
        <span>Advanced (VCI)</span>
        <span v-if="isFullVciMode" class="section-badge vci">R² 80%</span>
        <span v-else-if="isVciMode" class="section-badge vci">R² 74%</span>
        <span v-else class="section-hint">Optional — add for VCI-based models</span>
      </div>

      <div class="field">
        <label for="age">
          Age
          <span class="optional">(optional)</span>
        </label>
        <div class="input-wrapper">
          <input
            id="age"
            v-model="age"
            type="number"
            placeholder="e.g. 49"
            min="0"
            step="1"
          />
          <span class="unit">years</span>
        </div>
        <span class="hint">Fill with VCI Venoatrial for highest VCI model accuracy.</span>
      </div>

      <div class="field">
        <label for="vci-supra">
          VCI Area Suprarenal
          <span class="optional">(optional)</span>
        </label>
        <div class="input-wrapper">
          <input
            id="vci-supra"
            v-model="vciAreaSuprarenal"
            type="number"
            placeholder="e.g. 3.52"
            min="0"
            step="any"
          />
          <span class="unit">cm&sup2;</span>
        </div>
        <span class="hint">
          Cross-sectional area of the inferior vena cava at suprarenal level.
          <template v-if="!isVciMode">Activates Neural Net and VCI-based Ridge models.</template>
        </span>
      </div>

      <div class="field">
        <label for="vci-veno">
          VCI Area Venoatrial
          <span class="optional">(optional)</span>
        </label>
        <div class="input-wrapper">
          <input
            id="vci-veno"
            v-model="vciAreaVenoatrial"
            type="number"
            placeholder="e.g. 4.09"
            min="0"
            step="any"
          />
          <span class="unit">cm&sup2;</span>
        </div>
        <span class="hint">
          Cross-sectional area of the inferior vena cava at venoatrial level.
          Add with Age for the full VCI model (R² 80%).
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
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

/* Section dividers */
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}

.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.section-badge {
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.section-badge.body {
  background: rgba(52, 199, 89, 0.15);
  color: #6ee7a0;
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.section-badge.vci {
  background: rgba(1, 175, 171, 0.15);
  color: var(--color-primary-light);
  border: 1px solid rgba(1, 175, 171, 0.25);
}

.section-hint {
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--color-text-muted);
  text-transform: none;
  letter-spacing: normal;
}

/* Two-column row for height/weight */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Model toggle switch */
.model-switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(1, 175, 171, 0.06);
  border: 1px solid rgba(1, 175, 171, 0.15);
  border-radius: var(--radius-md);
}

.switch-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-primary-light);
  white-space: nowrap;
}

.model-switch {
  position: relative;
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 3px;
  flex: 1;
  max-width: 280px;
}

.switch-option {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 7px 16px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s var(--ease);
  text-align: center;
  white-space: nowrap;
}

.switch-option.active {
  color: #fff;
}

.switch-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: 6px;
  transition: transform 0.3s var(--ease);
  box-shadow: 0 2px 8px rgba(1, 175, 171, 0.3);
}

.switch-slider.right {
  transform: translateX(100%);
}

/* Transition for switch row appearing */
.switch-fade-enter-active {
  transition: all 0.4s var(--ease);
}

.switch-fade-leave-active {
  transition: all 0.25s var(--ease);
}

.switch-fade-enter-from {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

.switch-fade-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
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

@media (max-width: 480px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .section-hint {
    display: none;
  }
}
</style>

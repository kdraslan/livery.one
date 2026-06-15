<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

import type { EnhancedModelType, PredictionResult } from '@/types';

import CustomGenderSelect from '@/components/CustomGenderSelect.vue';
import CustomNumberInput from '@/components/CustomNumberInput.vue';
import Drawer from '@/components/Drawer.vue';
import ModelInfo from '@/components/ModelInfo.vue';
import Tooltip from '@/components/Tooltip.vue';
import { useLinearModel } from '@/composables/useLinearModel';
import { useMLPModel } from '@/composables/useMLPModel';
import { useRidgeModel } from '@/composables/useRidgeModel';
import { FEATURE_DEFINITIONS, MODEL_FEATURES } from '@/constants/features';
import { trackPrediction } from '@/firebase/tracking';
import { isPositive } from '@/utils/number';

const props = defineProps<{
  modelValue?: EnhancedModelType;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: EnhancedModelType];
  predict: [result: PredictionResult];
  reset: [];
  'vci-mode': [isVci: boolean];
}>();

const volume = ref<string>('');
const gender = ref<string>('');
const age = ref<string>('');
const height = ref<string>('');
const weight = ref<string>('');
const vciAreaSuprarenal = ref<string>('');
const vciAreaVenoatrial = ref<string>('');
const isAdvancedExpanded = ref(false);
const confirmedVciSupra = ref<string>('');
const showModelInfo = ref(false);

const linearModel = useLinearModel();
const mlpModel = useMLPModel();
const ridgeModel = useRidgeModel();

const isBodyMode = computed(() => isPositive(height.value) && isPositive(weight.value));

const isVciMode = computed(() => isPositive(confirmedVciSupra.value)); // Confirmed value, updated on blur.

const isEnhancedMode = computed(() => isBodyMode.value || isVciMode.value);

const isFullVciMode = computed(
  () => isVciMode.value && isPositive(age.value) && isPositive(vciAreaVenoatrial.value),
);

const bestActiveR2 = computed(() => (isVciMode.value ? '71.9%' : '75.3%')); // Only shown in body mode.

const predictButtonTooltip = computed(() => {
  let model = 'Linear';
  let features = 'Volume, Gender';

  if (isEnhancedMode.value) {
    if (props.modelValue === 'mlp' && isVciMode.value) {
      model = 'Neural Network';
      features = 'Volume, Gender, VCI Suprarenal';
    } else {
      model = 'Ridge';
      const parts = ['Volume', 'Gender'];
      if (isBodyMode.value) parts.push('Height, Weight');
      if (isVciMode.value) parts.push('VCI Suprarenal');
      if (isFullVciMode.value) parts.push('Age, VCI Venoatrial');
      features = parts.join(', ');
    }
  }

  return `${model}: ${features}`;
});

const canSubmit = computed(() => isPositive(volume.value) && gender.value !== '');

watch(isVciMode, (vci) => {
  emit('vci-mode', vci);
});

onMounted(() => {
  Promise.all([mlpModel.load(), ridgeModel.load()]);
});

function getEnteredFeatures(): string[] {
  const features: string[] = [FEATURE_DEFINITIONS.VOLUME, FEATURE_DEFINITIONS.GENDER];
  if (isPositive(height.value)) features.push(FEATURE_DEFINITIONS.HEIGHT);
  if (isPositive(weight.value)) features.push(FEATURE_DEFINITIONS.WEIGHT);
  if (isPositive(age.value)) features.push(FEATURE_DEFINITIONS.AGE);
  if (isPositive(vciAreaSuprarenal.value)) features.push(FEATURE_DEFINITIONS.VCI_SUPRA);
  if (isPositive(vciAreaVenoatrial.value)) features.push(FEATURE_DEFINITIONS.VCI_VENO);
  return features;
}

function ridgeVariantFeatures(hasBody: boolean, hasVci: boolean, hasFullVci: boolean): string[] {
  if (hasBody && hasFullVci) return [...MODEL_FEATURES.ridge.all];
  if (hasBody) return [...MODEL_FEATURES.ridge.body_simple];
  if (hasFullVci) return [...MODEL_FEATURES.ridge.full];
  if (hasVci) return [...MODEL_FEATURES.ridge.partial];
  return [...MODEL_FEATURES.ridge.partial];
}

function handleSubmit() {
  if (!canSubmit.value) return;

  const vol = parseFloat(volume.value);
  const gen = parseInt(gender.value);
  const ageVal = parseFloat(age.value);
  const h = parseFloat(height.value);
  const w = parseFloat(weight.value);
  const vciSupra = parseFloat(vciAreaSuprarenal.value);
  const vciVeno = parseFloat(vciAreaVenoatrial.value);
  const enteredFeatures = getEnteredFeatures();

  if (isEnhancedMode.value) {
    if (props.modelValue === 'mlp' && isVciMode.value && mlpModel.isReady.value) {
      const result = mlpModel.predict({ volume: vol, gender: gen, vciArea: vciSupra });
      if (result) {
        trackPrediction('mlp');
        emit('predict', { ...result, usedFeatures: [...MODEL_FEATURES.mlp], enteredFeatures });
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
        const hasBody = isPositive(height.value) && isPositive(weight.value);
        const hasVci = isPositive(vciAreaSuprarenal.value);
        const hasFullVci = hasVci && isPositive(age.value) && isPositive(vciAreaVenoatrial.value);
        trackPrediction('ridge');
        emit('predict', {
          ...result,
          usedFeatures: ridgeVariantFeatures(hasBody, hasVci, hasFullVci),
          enteredFeatures,
        });
        return;
      }
    }
  }

  const result = linearModel.predict({ volume: vol, gender: gen });
  trackPrediction('linear');
  emit('predict', { ...result, usedFeatures: [...MODEL_FEATURES.linear], enteredFeatures });
}

function handleVciBlur() {
  const normalized = vciAreaSuprarenal.value.replace(',', '.'); // Accept comma decimals.
  confirmedVciSupra.value = isPositive(normalized) ? normalized : '';
}

function handleReset() {
  volume.value = '';
  gender.value = '';
  age.value = '';
  height.value = '';
  weight.value = '';
  vciAreaSuprarenal.value = '';
  vciAreaVenoatrial.value = '';
  confirmedVciSupra.value = '';
  emit('reset');
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>Patient Measurements</h2>
      <div class="header-right">
        <div v-if="!isEnhancedMode" class="mode-badge">
          <span class="mode-dot" />
          Standard Model
        </div>
        <Tooltip
          class="help"
          text="Learn about the prediction models and their features"
          position="left"
        >
          <button
            type="button"
            class="help-button"
            aria-label="Model information"
            @click="showModelInfo = true"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
              />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>

    <div class="fields">
      <!-- Required fields -->
      <div class="field">
        <label for="volume">
          Preoperation Volume
          <span class="required">*</span>
        </label>
        <CustomNumberInput id="volume" v-model="volume" placeholder="e.g. 950" :min="0" unit="CC" />
        <span class="hint">Liver volume estimated from CT scan</span>
      </div>

      <div class="field">
        <label>
          Gender
          <span class="required">*</span>
        </label>
        <CustomGenderSelect v-model="gender" />
        <span class="hint">Biological sex of the patient</span>
      </div>

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
          <CustomNumberInput
            id="height"
            v-model="height"
            placeholder="e.g. 172"
            :min="0"
            unit="cm"
          />
        </div>

        <div class="field">
          <label for="weight">
            Weight
            <span class="optional">(optional)</span>
          </label>
          <CustomNumberInput
            id="weight"
            v-model="weight"
            placeholder="e.g. 75"
            :min="0"
            unit="kg"
          />
        </div>
      </div>

      <button
        type="button"
        class="section-divider"
        @click="isAdvancedExpanded = !isAdvancedExpanded"
      >
        <span>Advanced</span>
        <div class="section-controls">
          <span v-if="isFullVciMode" class="section-badge vci">CV R² 69.8%</span>
          <span v-else-if="isVciMode" class="section-badge vci">CV R² 67.0%</span>
          <span v-else class="section-hint">Optional, add for VCI-based models</span>
          <svg
            class="chevron"
            :class="{ expanded: isAdvancedExpanded }"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="18"
            height="18"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>

      <Transition name="collapse">
        <div v-if="isAdvancedExpanded" class="advanced-fields">
          <div class="field">
            <label for="age">
              Age
              <span class="optional">(optional)</span>
            </label>
            <CustomNumberInput
              id="age"
              v-model="age"
              placeholder="e.g. 49"
              :min="0"
              :step="1"
              unit="years"
            />
            <span class="hint">Fill with VCI Venoatrial for highest VCI model accuracy.</span>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="vci-supra">
                VCI Area Suprarenal
                <span class="optional">(optional)</span>
              </label>
              <CustomNumberInput
                id="vci-supra"
                v-model="vciAreaSuprarenal"
                placeholder="e.g. 3.52"
                :min="0"
                :step="0.01"
                unit="cm²"
                @blur="handleVciBlur"
              />
              <span class="hint">
                Cross-sectional area of the inferior vena cava at suprarenal level.
                <template v-if="!isVciMode"
                  >Activates Neural Net and VCI-based Ridge models.</template
                >
              </span>
            </div>

            <div class="field">
              <label for="vci-veno">
                VCI Area Venoatrial
                <span class="optional">(optional)</span>
              </label>
              <CustomNumberInput
                id="vci-veno"
                v-model="vciAreaVenoatrial"
                placeholder="e.g. 4.09"
                :min="0"
                :step="0.01"
                unit="cm²"
              />
              <span class="hint">
                Cross-sectional area of the inferior vena cava at venoatrial level. Add with Age for
                the full VCI model (CV R² 69.8%).
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="actions">
      <Tooltip :text="predictButtonTooltip" class="predict-button">
        <button type="submit" class="btn-primary" :disabled="!canSubmit">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path
              d="M10 1a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 0110 1z"
            />
          </svg>
          Predict Weight
        </button>
      </Tooltip>
      <button type="button" class="btn-secondary" @click="handleReset">Clear</button>
    </div>
  </form>

  <Drawer v-model="showModelInfo" fit>
    <ModelInfo />
  </Drawer>
</template>

<style scoped>
.form-card {
  -webkit-backdrop-filter: blur(var(--blur));
  backdrop-filter: blur(var(--blur));
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 20px;
  position: relative; /* Anchors the help button when it pins top-right on narrow screens. */
}

.header-right {
  align-items: center;
  display: flex;
  gap: 6px;
}

.help-button {
  align-items: center;
  background: var(--color-surface);
  border: none;
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
  width: 28px;
}

.help-button:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-light);
  transform: scale(1.1);
}

.form-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-header h2 {
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 600;
}

.mode-badge {
  align-items: center;
  background: var(--color-surface);
  border-radius: 100px;
  color: var(--color-text-secondary);
  display: flex;
  font-size: 0.75rem;
  font-weight: 500;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
}

.mode-dot {
  background: var(--color-text-muted);
  border-radius: 50%;
  height: 6px;
  width: 6px;
}

.section-divider {
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  font-size: 0.75rem;
  font-weight: 600;
  gap: 10px;
  justify-content: space-between;
  letter-spacing: 0.06em;
  margin-top: 4px;
  padding: 0;
  text-transform: uppercase;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
  width: 100%;
}

.section-divider:hover {
  color: var(--color-text-secondary);
}

.section-divider:hover .chevron {
  scale: 1.2;
}

.section-controls {
  align-items: center;
  display: flex;
  gap: 8px;
}

.section-divider::before {
  background: rgb(255, 255, 255, 0.05);
  content: '';
  flex: 1;
  height: 1px;
  order: -1;
}

.chevron {
  color: var(--color-primary);
  flex-shrink: 0;
  transform: rotate(0deg);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    scale 0.3s ease;
}

.chevron.expanded {
  transform: rotate(180deg);
}

.section-badge {
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  white-space: nowrap;
}

.section-badge.body {
  background: var(--color-success-soft);
  color: var(--color-success-light);
}

.section-badge.vci {
  background: var(--color-primary-soft);
  color: var(--color-primary-light);
}

.section-hint {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

.field-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.advanced-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field label {
  color: var(--color-text);
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.required {
  color: var(--color-danger);
  margin-left: 2px;
}

.optional {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 400;
}

.hint {
  color: var(--color-text-muted);
  display: block;
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 8px;
}

.predict-button {
  display: flex;
  width: 100%;
}

.btn-primary {
  align-items: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  cursor: pointer;
  display: flex;
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  gap: 6px;
  justify-content: center;
  padding: 12px 16px;
  transition: all 0.3s var(--ease);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgb(1, 175, 171, 0.35);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.btn-secondary {
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 12px 16px;
  transition: all 0.2s var(--ease);
}

.btn-secondary:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.collapse-enter-active,
.collapse-leave-active {
  max-height: 500px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  margin-bottom: 0;
  margin-top: 0;
  max-height: 0;
  opacity: 0;
}

@media (width <= 560px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .section-hint {
    display: none;
  }
}

@media (width <= 480px) {
  .form-header {
    padding-right: 34px; /* Reserve room for the pinned help button so the badge clears it. */
  }

  .help {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}
</style>

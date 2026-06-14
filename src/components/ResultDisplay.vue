<script setup lang="ts">
import { computed } from 'vue';
import Tooltip from '@/components/Tooltip.vue';

interface PredictionResult {
  weight: number;
  model: 'linear' | 'mlp' | 'ridge';
  modelLabel: string;
  r2?: number;
  mae?: number;
}

const props = defineProps<{
  result: PredictionResult | null;
  isLoading: boolean;
}>();

interface ExtendedResult extends PredictionResult {
  usedFeatures?: string[];
  enteredFeatures?: string[];
}

const formattedWeight = computed(() => {
  if (!props.result) return '';
  return props.result.weight.toFixed(1);
});

const r2Percent = computed(() => {
  if (!props.result?.r2) return '';
  return (props.result.r2 * 100).toFixed(1);
});

const explanationTooltip = computed(() => {
  if (!props.result) return '';

  const model = props.result.model;

  if (model === 'linear') {
    return 'Linear Regression only uses Volume and Gender. Add Height, Weight, or VCI measurements for improved accuracy (up to 85.9% for body measurements alone, or 79.6% for VCI).';
  }
  if (model === 'mlp') {
    return 'Neural Network uses Volume, Gender, and VCI Suprarenal. Add VCI Venoatrial and Age for higher accuracy (79.6% with Full VCI).';
  }
  if (model === 'ridge') {
    return 'Ridge uses a subset of available features based on your inputs. Add more measurements for potentially better accuracy.';
  }

  return '';
});

const unusedFeatures = computed(() => {
  const result = props.result as ExtendedResult;
  if (!result?.usedFeatures || !result?.enteredFeatures) return [];

  return result.enteredFeatures.filter(feature => !result.usedFeatures?.includes(feature));
});

const hasUnusedFeatures = computed(() => unusedFeatures.value.length > 0);
</script>

<template>
  <Transition name="result">
    <div v-if="result" class="result-card" :class="result.model">
      <div class="result-header">
        <div class="header-content">
          <h3>Estimated Liver Weight</h3>
          <div class="model-tag" :class="result.model">
            {{ result.modelLabel }}
          </div>
        </div>
      </div>

      <div class="result-value">
        <span class="weight">{{ formattedWeight }}</span>
        <span class="unit">
          grams

          <Tooltip :text="explanationTooltip">
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </Tooltip>
        </span>
      </div>

      <div class="metrics">
        <Tooltip position="top" text="Cross-validation accuracy: how well the model generalizes to new data">
          <div class="metric" v-if="result.r2">
            <span class="metric-label">Model Accuracy (R²)</span>
            <span class="metric-value">{{ r2Percent }}%</span>
          </div>
        </Tooltip>
        <Tooltip position="top" text="Mean Absolute Error: typical prediction deviation in grams">
          <div class="metric" v-if="result.mae">
            <span class="metric-label">Avg. Error (MAE)</span>
            <span class="metric-value">&plusmn;{{ result.mae.toFixed(1) }}g</span>
          </div>
        </Tooltip>
        <Tooltip position="top" text="95% confidence interval: 67% of predictions fall within this range">
          <div class="metric">
            <span class="metric-label">Confidence Range</span>
            <span class="metric-value" v-if="result.mae">
              {{ (result.weight - result.mae * 2).toFixed(0) }}&ndash;{{
                (result.weight + result.mae * 2).toFixed(0)
              }}g
            </span>
          </div>
        </Tooltip>
      </div>

      <div v-if="(result as ExtendedResult)?.enteredFeatures?.length" class="features-section">
        <div class="features-header">
          <span class="features-label">Features inputted:</span>
          <Tooltip text="These are all the measurements you provided. Features highlighted in yellow are not used by this model, but providing them could improve accuracy with other models.">
            
            <svg v-if="hasUnusedFeatures" class="warning-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            
            <svg v-else class="help-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </Tooltip>
        </div>
        <div class="features-list">
          <template v-for="feature in (result as ExtendedResult).enteredFeatures" :key="feature">
            <template v-if="unusedFeatures.includes(feature)">
              <Tooltip :text="`${feature} is not used by this model. Consider switching models or adding more measurements to use this data.`">
                <span class="feature-tag unused">{{ feature }}</span>
              </Tooltip>
            </template>

            <template v-else>
              <span class="feature-tag">{{ feature }}</span>
            </template>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.result-card {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: none;
  border-radius: 0;
  padding: 24px 20px;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.result-card.mlp::before {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.result-card.ridge::before {
  background: linear-gradient(90deg, #34c759, #6ee7a0);
}

.result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.result-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.model-tag {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.model-tag.linear {
  background: rgba(88, 86, 214, 0.15);
  color: #a5a4e3;
}

.model-tag.mlp {
  background: rgba(1, 175, 171, 0.15);
  color: var(--color-primary-light);
}

.model-tag.ridge {
  background: rgba(52, 199, 89, 0.15);
  color: #6ee7a0;
}

.result-value {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}

.info-icon {
  color: var(--color-primary-light);
  flex-shrink: 0;
  cursor: help;
  opacity: 0.8;
  transition: opacity 0.2s;
  margin-top: 8px;
}

.info-icon:hover {
  opacity: 1;
}

.weight {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.result-value .unit {
  display: flex;
  color: var(--color-text-muted);
  align-items: center;
  gap: 4px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: help;
}

.metric-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.result-enter-active {
  transition: all 0.5s var(--ease-bounce);
}

.result-leave-active {
  transition: all 0.3s var(--ease);
}

.result-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

.result-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}

.features-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.features-header {
  display: flex;
  align-items: center;
  line-height: 0;
  gap: 4px;
}

.warning-icon-wrapper {
  display: flex;
  align-items: center;
}

.warning-icon {
  color: #ffc107;
  flex-shrink: 0;
  cursor: help;
  opacity: 0.8;
}

.warning-icon:hover {
  opacity: 1;
}

.help-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.help-icon:hover {
  opacity: 1;
}

.features-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(1, 175, 171, 0.1);
  color: var(--color-primary-light);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.feature-tag.unused {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  cursor: help;
}

@media (max-width: 480px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  .weight {
    font-size: 2.4rem;
  }
}
</style>

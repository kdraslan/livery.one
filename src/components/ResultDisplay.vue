<script setup lang="ts">
import { computed } from 'vue';

import type { PredictionResult } from '@/types';

import Tooltip from '@/components/Tooltip.vue';

const props = defineProps<{
  result: PredictionResult | null;
}>();

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
  const { usedFeatures, enteredFeatures } = props.result ?? {};
  if (!usedFeatures || !enteredFeatures) return [];

  return enteredFeatures.filter((feature) => !usedFeatures.includes(feature));
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
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </Tooltip>
        </span>
      </div>

      <div class="metrics">
        <Tooltip
          position="top"
          text="Cross-validation accuracy: how well the model generalizes to new data"
        >
          <div v-if="result.r2" class="metric">
            <span class="metric-label">Model Accuracy (R²)</span>
            <span class="metric-value">{{ r2Percent }}%</span>
          </div>
        </Tooltip>
        <Tooltip position="top" text="Mean Absolute Error: typical prediction deviation in grams">
          <div v-if="result.mae" class="metric">
            <span class="metric-label">Avg. Error (MAE)</span>
            <span class="metric-value">&plusmn;{{ result.mae.toFixed(1) }}g</span>
          </div>
        </Tooltip>
        <Tooltip
          position="top"
          text="95% confidence interval: 67% of predictions fall within this range"
        >
          <div class="metric">
            <span class="metric-label">Confidence Range</span>
            <span v-if="result.mae" class="metric-value">
              {{ (result.weight - result.mae * 2).toFixed(0) }}&ndash;{{
                (result.weight + result.mae * 2).toFixed(0)
              }}g
            </span>
          </div>
        </Tooltip>
      </div>

      <div v-if="result?.enteredFeatures?.length" class="features-section">
        <div class="features-header">
          <span class="features-label">Features inputted:</span>
          <Tooltip
            text="These are all the measurements you provided. Features highlighted in yellow are not used by this model, but providing them could improve accuracy with other models."
          >
            <svg
              v-if="hasUnusedFeatures"
              class="warning-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <svg
              v-else
              class="help-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </Tooltip>
        </div>
        <div class="features-list">
          <template v-for="feature in result.enteredFeatures" :key="feature">
            <template v-if="unusedFeatures.includes(feature)">
              <Tooltip
                :text="`${feature} is not used by this model. Consider switching models or adding more measurements to use this data.`"
              >
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
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  padding: 24px 20px;
  position: relative;
}

.result-card::before {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  content: '';
  height: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.result-card.mlp::before {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.result-card.ridge::before {
  background: linear-gradient(90deg, var(--color-success), var(--color-success-light));
}

.result-header {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-content {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 12px;
}

.result-header h3 {
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.model-tag {
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  text-transform: uppercase;
}

.model-tag.linear {
  background: rgb(88, 86, 214, 0.15);
  color: var(--color-accent-light);
}

.model-tag.mlp {
  background: var(--color-primary-soft);
  color: var(--color-primary-light);
}

.model-tag.ridge {
  background: var(--color-success-soft);
  color: var(--color-success-light);
}

.result-value {
  align-items: baseline;
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.info-icon {
  color: var(--color-primary-light);
  cursor: help;
  flex-shrink: 0;
  margin-top: 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.info-icon:hover {
  opacity: 1;
}

.weight {
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  -webkit-text-fill-color: transparent;
}

.result-value .unit {
  align-items: center;
  color: var(--color-text-muted);
  display: flex;
  gap: 4px;
}

.metrics {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}

.metric {
  background: rgb(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  cursor: help;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
}

.metric-label {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.metric-value {
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
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
  border-top: 1px solid rgb(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
}

.features-header {
  align-items: center;
  display: flex;
  gap: 4px;
  line-height: 0;
}

.warning-icon {
  color: #ffc107;
  cursor: help;
  flex-shrink: 0;
  opacity: 0.8;
}

.warning-icon:hover {
  opacity: 1;
}

.help-icon {
  color: var(--color-text-muted);
  cursor: help;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.help-icon:hover {
  opacity: 1;
}

.features-label {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-tag {
  background: var(--color-primary-faint);
  border-radius: 4px;
  color: var(--color-primary-light);
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
}

.feature-tag.unused {
  background: rgb(255, 193, 7, 0.15);
  color: #ffc107;
  cursor: help;
}

@media (width <= 480px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  .weight {
    font-size: 2.4rem;
  }
}
</style>

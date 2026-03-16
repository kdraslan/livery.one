<script setup lang="ts">
import { computed } from 'vue';

interface PredictionResult {
  weight: number;
  model: 'linear' | 'mlp';
  modelLabel: string;
  r2?: number;
  mae?: number;
}

const props = defineProps<{
  result: PredictionResult | null;
  isLoading: boolean;
}>();

const formattedWeight = computed(() => {
  if (!props.result) return '';
  return props.result.weight.toFixed(1);
});

const r2Percent = computed(() => {
  if (!props.result?.r2) return '';
  return (props.result.r2 * 100).toFixed(1);
});
</script>

<template>
  <Transition name="result">
    <div v-if="result" class="result-card" :class="result.model">
      <div class="result-header">
        <h3>Estimated Liver Weight</h3>
        <div class="model-tag" :class="result.model">
          {{ result.modelLabel }}
        </div>
      </div>

      <div class="result-value">
        <span class="weight">{{ formattedWeight }}</span>
        <span class="unit">grams</span>
      </div>

      <div class="metrics">
        <div class="metric" v-if="result.r2">
          <span class="metric-label">Model Accuracy (R&sup2;)</span>
          <span class="metric-value">{{ r2Percent }}%</span>
        </div>
        <div class="metric" v-if="result.mae">
          <span class="metric-label">Avg. Error (MAE)</span>
          <span class="metric-value">&plusmn;{{ result.mae.toFixed(1) }}g</span>
        </div>
        <div class="metric">
          <span class="metric-label">Confidence Range</span>
          <span class="metric-value" v-if="result.mae">
            {{ (result.weight - result.mae * 2).toFixed(0) }}&ndash;{{
              (result.weight + result.mae * 2).toFixed(0)
            }}g
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.result-card {
  background: var(--color-surface);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.result-card.mlp::before {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.result-header h3 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
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

.result-value {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 24px;
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
  font-size: 1.1rem;
  color: var(--color-text-muted);
  font-weight: 400;
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
  border: 1px solid rgba(255, 255, 255, 0.05);
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

@media (max-width: 480px) {
  .metrics {
    grid-template-columns: 1fr;
  }

  .weight {
    font-size: 2.4rem;
  }
}
</style>

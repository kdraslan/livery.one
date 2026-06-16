<script setup lang="ts">
import { MODEL_INFO } from '@/constants/models';
</script>

<template>
  <div class="model-info">
    <div class="info-header">
      <h3>Prediction Models</h3>
      <p class="info-subtitle">
        The best available model is chosen automatically from the fields you fill in. More
        measurements unlock more accurate models.
      </p>
    </div>

    <div class="model-list">
      <div v-for="model in MODEL_INFO" :key="model.name" class="model-card" :class="model.type">
        <div class="model-card-header">
          <span class="model-name">{{ model.name }}</span>
          <span v-if="model.best" class="best-badge">Most accurate</span>
        </div>
        <p class="model-description">
          {{ model.description }}
        </p>
        <div class="model-features">
          <span v-for="feature in model.features" :key="feature" class="feature-chip">
            {{ feature }}
          </span>
        </div>
        <div class="model-metrics">
          <span class="metric-pill">R² {{ model.r2.toFixed(1) }}%</span>
          <span class="metric-pill">MAE &plusmn;{{ model.mae.toFixed(1) }}g</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 20px;
}

.info-header h3 {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.info-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-card {
  background: var(--color-surface-subtle);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  padding-left: 18px;
  position: relative;
}

.model-card::before {
  background: var(--color-text-muted);
  border-radius: 2px;
  bottom: 12px;
  content: '';
  left: -12px;
  position: absolute;
  top: 12px;
  width: 4px;
}

.model-card.linear::before {
  background: var(--color-accent-light);
}

.model-card.mlp::before {
  background: var(--color-primary-light);
}

.model-card.ridge::before {
  background: var(--color-success-light);
}

.model-card-header {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.model-name {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
}

.best-badge {
  background: var(--color-success-soft);
  border-radius: 100px;
  color: var(--color-success-light);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  text-transform: uppercase;
  white-space: nowrap;
}

.model-description {
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  line-height: 1.4;
}

.model-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-chip {
  background: var(--color-primary-faint);
  border-radius: 4px;
  color: var(--color-primary-light);
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 9px;
}

.model-metrics {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.metric-pill {
  background: var(--color-surface-subtle);
  border-radius: 100px;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
}
</style>

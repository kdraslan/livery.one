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
        <p class="model-description">{{ model.description }}</p>
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
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.info-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.model-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  padding-left: 18px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
}

.model-card::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: -12px;
  width: 4px;
  border-radius: 2px;
  background: var(--color-text-muted);
}

.model-card.linear::before {
  background: #a5a4e3;
}

.model-card.mlp::before {
  background: var(--color-primary-light);
}

.model-card.ridge::before {
  background: #6ee7a0;
}

.model-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.model-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.best-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6ee7a0;
  background: rgba(52, 199, 89, 0.15);
  padding: 2px 8px;
  border-radius: 100px;
  white-space: nowrap;
}

.model-description {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.model-features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.feature-chip {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-primary-light);
  background: rgba(1, 175, 171, 0.1);
  padding: 3px 9px;
  border-radius: 4px;
}

.model-metrics {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.metric-pill {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 10px;
  border-radius: 100px;
}
</style>

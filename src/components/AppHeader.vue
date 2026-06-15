<script setup lang="ts">
import type { EnhancedModelType } from '@/types';

import Tooltip from '@/components/Tooltip.vue';

defineProps<{
  modelValue?: EnhancedModelType;
  isVciMode?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: EnhancedModelType];
}>();
</script>

<template>
  <header class="bar">
    <div class="bar-inner">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            <text
              x="16"
              y="22"
              font-family="system-ui, sans-serif"
              font-size="18"
              font-weight="700"
              fill="white"
              text-anchor="middle"
            >
              L
            </text>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop stop-color="#02d4cf" />
                <stop offset="1" stop-color="#007a8a" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="logo-text">
          <h1>Livery<span class="dot">.</span>one</h1>
          <p class="tagline">Liver Weight Prediction</p>
        </div>
      </div>
      <div v-if="modelValue && isVciMode" class="model-section">
        <span class="model-label">Model:</span>
        <div class="model-switch">
          <Tooltip text="Ridge: Regularized linear model with VCI and body measurement support">
            <button
              type="button"
              class="switch-option"
              :class="{ active: modelValue === 'ridge' }"
              @click="emit('update:modelValue', 'ridge')"
            >
              Ridge
            </button>
          </Tooltip>
          <Tooltip text="Neural Net: Deep learning model optimized for VCI-based predictions">
            <button
              type="button"
              class="switch-option"
              :class="{ active: modelValue === 'mlp' }"
              @click="emit('update:modelValue', 'mlp')"
            >
              Neural Net
            </button>
          </Tooltip>
          <div class="switch-slider" :class="{ right: modelValue === 'mlp' }" />
        </div>
      </div>
    </div>
  </header>

  <div class="description-wrap">
    <p class="description">
      Estimate liver weight from preoperative CT measurements using validated prediction models.
      Enter the required parameters below to get an instant estimation.
    </p>
  </div>
</template>

<style scoped lang="scss">
$modelSwitchPadding: 3px;
$sliderPadding: 5px;
$leftWidth: 58px;
$rightWidth: 86px;
$mobileBreakpoint: 480px;

.bar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--color-bg); /* Opaque so content scrolling under it never ghosts through. */
}

.bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  display: flex;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.logo-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--color-text);
}

.dot {
  color: var(--color-primary);
}

.tagline {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.description-wrap {
  width: 100%;
  background: var(--color-bg); /* Matches the bar; scrolls up under it in sync with scroll. */
}

.description {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 12px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  opacity: 0.85;
}

.model-section {
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: $mobileBreakpoint) {
    margin: auto;
    border-top: 1px solid rgb(255, 255, 255, 0.1);
    padding-top: 8px;
    width: 100%;
    justify-content: center;
  }
}

.model-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);

  @media (max-width: $mobileBreakpoint) {
    display: none;
  }
}

.model-switch {
  position: relative;
  display: flex;
  background: rgb(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: $modelSwitchPadding;
}

.switch-option {
  position: relative;
  z-index: 1;
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.75rem;
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
  top: $sliderPadding;
  height: calc(100% - $sliderPadding * 2);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: 16px;
  transition: all 0.3s var(--ease);
  box-shadow: 0 2px 8px rgb(1, 175, 171, 0.3);
  width: $leftWidth;

  &:not(.right) {
    left: $sliderPadding;
  }

  &.right {
    width: $rightWidth;
    left: calc($leftWidth + $modelSwitchPadding - 50%);
    transform: translateX(100%);
  }
}
</style>

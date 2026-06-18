<script setup lang="ts">
import type { EnhancedModelType } from '@/types';

import Tooltip from '@/components/Tooltip.vue';
import { useTheme } from '@/composables/useTheme';

defineProps<{
  modelValue?: EnhancedModelType;
  isVciMode?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: EnhancedModelType];
}>();

const { theme, toggle } = useTheme();
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
                <stop class="grad-from" stop-color="#02d4cf" />
                <stop class="grad-to" offset="1" stop-color="#007a8a" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="logo-text">
          <h1>
            <span class="word">Livery</span>
            <span class="dot">.</span>
            <span class="suffix">
              <span v-for="(letter, i) in 'one'" :key="i" class="char">
                <span>{{ letter }}</span>
              </span>
            </span>
          </h1>
          <p class="tagline">Liver Weight Prediction</p>
        </div>
      </div>
      <Tooltip
        :text="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        position="bottom"
      >
        <button
          type="button"
          class="theme-toggle"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <svg
            v-if="theme === 'dark'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            width="18"
            height="18"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="18"
            height="18"
          >
            <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
          </svg>
        </button>
      </Tooltip>
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

.bar {
  background: var(--color-chrome); // Opaque so content scrolling under it never ghosts through.
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
}

.bar-inner {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 auto;
  max-width: 720px;
  padding: 12px 20px;
  width: 100%;
}

.logo {
  align-items: center;
  cursor: default; // No text/pointer cursor on hover.
  display: flex;
  gap: 10px;
  margin-right: auto; // Pushes the toggle and model switch to the right.
}

.theme-toggle {
  align-items: center;
  background: var(--color-surface);
  border: none;
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  padding: 0;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  width: 32px;

  @media (hover: hover) {
    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }
}

.logo-icon {
  display: flex;
  flex-shrink: 0;

  svg {
    height: 32px;
    width: 32px;
  }
}

[data-theme='light'] {
  .grad-from {
    stop-color: #018f8b; // Darker logo badge on light mode.
  }

  .grad-to {
    stop-color: #00565f;
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 5px;

  h1 {
    color: var(--color-text);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }
}

[data-theme='light'] .suffix {
  color: #9ca7b4; // Light gray "one" on light mode.
}

.dot {
  animation: dot-pop 0.4s var(--ease-bounce) both; // Scales up from zero on first appearance.
  color: var(--color-primary);
  display: inline-block;
}

.char {
  animation: char-in 0.35s ease both; // Slides in from the right, one by one (staggered below).
  display: inline-block;

  &:nth-child(1) {
    animation-delay: 0.4s; // Starts after the dot settles.
  }

  &:nth-child(2) {
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 0.6s;
  }

  & > span {
    display: inline-block;
  }
}

@media (hover: hover) {
  .logo:hover .char > span {
    animation-name: stretch; // Letters fan out in sequence (e, n, o) then return together; dot stays put.
    animation-timing-function: ease;
  }

  .logo:hover .char:nth-child(1) > span {
    --shift: 1; // o moves least and starts last.
    animation-delay: 0.24s;
    animation-duration: 0.52s;
  }

  .logo:hover .char:nth-child(2) > span {
    --shift: 2;
    animation-delay: 0.12s;
    animation-duration: 0.64s;
  }

  .logo:hover .char:nth-child(3) > span {
    --shift: 3; // e moves most and leads, so they fan out without overlapping.
    animation-delay: 0s;
    animation-duration: 0.76s;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot,
  .char,
  .char > span {
    animation: none;
  }
}

.tagline {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.description-wrap {
  background: var(--color-chrome); // Matches the bar; scrolls up under it in sync with scroll.
  width: 100%;
}

.description {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 auto;
  max-width: 720px;
  opacity: 0.85;
  padding: 0 20px 12px;
}

.model-section {
  align-items: center;
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    border-top: 1px solid var(--color-border);
    justify-content: center;
    margin: auto;
    padding-top: 8px;
    width: 100%;
  }
}

.model-label {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;

  @media (max-width: 480px) {
    display: none;
  }
}

.model-switch {
  background: var(--color-surface-hover);
  border-radius: 20px;
  display: flex;
  padding: $modelSwitchPadding;
  position: relative;
}

.switch-option {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 14px;
  position: relative;
  text-align: center;
  transition: color 0.3s var(--ease);
  white-space: nowrap;
  z-index: 1;

  &.active {
    color: #fff;
  }
}

.switch-slider {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgb(1, 175, 171, 0.3);
  height: calc(100% - $sliderPadding * 2);
  position: absolute;
  top: $sliderPadding;
  transition: all 0.3s var(--ease);
  width: $leftWidth;

  &:not(.right) {
    left: $sliderPadding;
  }

  &.right {
    left: calc($leftWidth + $modelSwitchPadding - 50%);
    transform: translateX(100%);
    width: $rightWidth;
  }
}

@keyframes dot-pop {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes char-in {
  from {
    opacity: 0;
    transform: translateX(10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes stretch {
  0% {
    transform: translateX(0);
  }

  65% {
    animation-timing-function: cubic-bezier(0.7, 0, 0.2, 1); // Snappier return than the spread.
    transform: translateX(calc(var(--shift) * 0.2em));
  }

  100% {
    transform: translateX(0);
  }
}
</style>

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
$mobileBreakpoint: 480px;

.bar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--color-chrome); /* Opaque so content scrolling under it never ghosts through. */
}

.bar-inner {
  display: flex;
  align-items: center;
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
  margin-right: auto; // Pushes the toggle and model switch to the right.
  cursor: default; // No text/pointer cursor on hover.
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

@media (hover: hover) {
  .theme-toggle:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }
}

.logo-icon {
  display: flex;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

[data-theme='light'] .grad-from {
  stop-color: #018f8b; // Darker logo badge on light mode.
}

[data-theme='light'] .grad-to {
  stop-color: #00565f;
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

[data-theme='light'] .suffix {
  color: #9ca7b4; // Light gray "one" on light mode.
}

.dot {
  display: inline-block;
  color: var(--color-primary);
  animation: dot-pop 0.4s var(--ease-bounce) both; // Scales up from zero on first appearance.
}

.char {
  display: inline-block;
  animation: char-in 0.35s ease both; // Slides in from the right, one by one (staggered below).

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
  // Sequential ripple: e/n/o push out (3/2/1 ticks), then settle back o/n/e. Dot is untouched.
  .logo:hover .char:nth-child(1) > span {
    animation: stretch-o 0.8s ease;
  }

  .logo:hover .char:nth-child(2) > span {
    animation: stretch-n 0.8s ease;
  }

  .logo:hover .char:nth-child(3) > span {
    animation: stretch-e 0.8s ease;
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
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.description-wrap {
  width: 100%;
  background: var(--color-chrome); /* Matches the bar; scrolls up under it in sync with scroll. */
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
    border-top: 1px solid var(--color-border);
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
  background: var(--color-surface-hover);
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

@keyframes stretch-e {
  0% {
    transform: translateX(0);
  }

  20%,
  75% {
    transform: translateX(9px);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes stretch-n {
  0%,
  15% {
    transform: translateX(0);
  }

  35%,
  65% {
    transform: translateX(6px);
  }

  85%,
  100% {
    transform: translateX(0);
  }
}

@keyframes stretch-o {
  0%,
  30% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(3px);
  }

  65%,
  100% {
    transform: translateX(0);
  }
}
</style>

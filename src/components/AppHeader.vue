<script setup lang="ts">
</script>

<template>
  <header class="header">
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
    <p class="description">
      Estimate liver weight from preoperative CT measurements using validated prediction models.
      Enter the required parameters below to get an instant estimation.
    </p>
  </header>
</template>

<style scoped>
.header {
  padding: 40px 0 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.logo-icon svg {
  width: 40px;
  height: 40px;
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-text);
}

.dot {
  color: var(--color-primary);
}

.tagline {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.description {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 560px;
}
</style>

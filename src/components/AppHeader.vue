<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isCompact = ref(false)

function handleScroll() {
  isCompact.value = window.scrollY > 0
}

function handleFormInteraction() {
  isCompact.value = true
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('focusin', handleFormInteraction, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('focusin', handleFormInteraction)
})
</script>

<template>
  <header :class="['header', { compact: isCompact }]">
    <div class="header-content">
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
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  left: 0;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(10, 22, 40, 0.85) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}



.header-content {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 20px;
  transition: padding 0.3s ease;
}

.header.compact .header-content {
  padding: 8px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  transition: margin-bottom 0.3s ease;
}

.header.compact .logo {
  margin-bottom: 0;
}

.logo-icon {
  display: flex;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 32px;
  height: 32px;
}

.logo-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--color-text);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dot {
  color: var(--color-primary);
}

.tagline {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-top: 6px;
  opacity: 0.85;
  transition: all 0.3s ease;
  max-height: 100px;
  overflow: hidden;
}

.header.compact .description {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  pointer-events: none;
}

</style>

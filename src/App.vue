<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import PredictionForm from '@/components/PredictionForm.vue';
import ResultDisplay from '@/components/ResultDisplay.vue';
import AppFooter from '@/components/AppFooter.vue';
import { ref } from 'vue';

interface PredictionResult {
  weight: number;
  model: 'linear' | 'mlp' | 'ridge';
  modelLabel: string;
  r2?: number;
  mae?: number;
}

const result = ref<PredictionResult | null>(null);
const isLoading = ref(false);

function handlePrediction(prediction: PredictionResult) {
  result.value = prediction;
}

function handleLoading(loading: boolean) {
  isLoading.value = loading;
}

function handleReset() {
  result.value = null;
}
</script>

<template>
  <div class="app">
    <div class="app-bg" />
    <div class="app-content">
      <AppHeader />
      <hr class="divider" />
      <main class="main">
        <PredictionForm
          @predict="handlePrediction"
          @loading="handleLoading"
          @reset="handleReset"
        />
        <ResultDisplay :result="result" :is-loading="isLoading" />
      </main>
      <hr class="divider" />
      <AppFooter />
    </div>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(1, 175, 171, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(88, 86, 214, 0.1) 0%, transparent 50%),
    linear-gradient(160deg, #0a1628 0%, #0f2035 50%, #0a1628 100%);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.divider {
  position: relative;
  left: 50%;
  width: 100vw;
  transform: translateX(-50%);
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  margin: 8px 0;
}
</style>

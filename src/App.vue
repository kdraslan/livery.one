<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import PredictionForm from '@/components/PredictionForm.vue';
import ResultDisplay from '@/components/ResultDisplay.vue';
import AppFooter from '@/components/AppFooter.vue';
import Drawer from '@/components/Drawer.vue';

interface PredictionResult {
  weight: number;
  model: 'linear' | 'mlp' | 'ridge';
  modelLabel: string;
  r2?: number;
  mae?: number;
}

const result = ref<PredictionResult | null>(null);
const isLoading = ref(false);
const showResults = ref(false);

function handlePrediction(prediction: PredictionResult) {
  result.value = prediction;
  showResults.value = true;
}

function handleLoading(loading: boolean) {
  isLoading.value = loading;
}

function handleReset() {
  result.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="app">
    <div class="app-bg" />
    <AppHeader />
    <main class="main">
      <PredictionForm
        @predict="handlePrediction"
        @loading="handleLoading"
        @reset="handleReset"
      />
    </main>
    <AppFooter />
    <Drawer v-model="showResults" fit>
      <ResultDisplay :result="result" :is-loading="isLoading" @close="showResults = false" />
    </Drawer>
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

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}
</style>

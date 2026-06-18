<script setup lang="ts">
import { ref } from 'vue';

import type { EnhancedModelType, PredictionResult } from '@/types';

import AppFooter from '@/components/AppFooter.vue';
import AppHeader from '@/components/AppHeader.vue';
import Drawer from '@/components/Drawer.vue';
import PredictionForm from '@/components/PredictionForm.vue';
import ResultDisplay from '@/components/ResultDisplay.vue';

const result = ref<PredictionResult | null>(null);
const showResults = ref(false);
const enhancedModel = ref<EnhancedModelType>('ridge');
const isVciMode = ref(false);

function handlePrediction(prediction: PredictionResult) {
  result.value = prediction;
  showResults.value = true;
}

function handleReset() {
  result.value = null;
  showResults.value = false;
}

function handleVciModeChange(vci: boolean) {
  isVciMode.value = vci;
}
</script>

<template>
  <div class="app">
    <div class="app-bg" />
    <AppHeader v-model="enhancedModel" :is-vci-mode="isVciMode" />
    <main class="main">
      <PredictionForm
        v-model="enhancedModel"
        @predict="handlePrediction"
        @reset="handleReset"
        @vci-mode="handleVciModeChange"
      />
    </main>
    <AppFooter />
    <Drawer v-model="showResults" fit>
      <ResultDisplay :result="result" />
    </Drawer>
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.app-bg {
  background:
    radial-gradient(ellipse at 20% 50%, rgb(1, 175, 171, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgb(88, 86, 214, 0.1) 0%, transparent 50%),
    linear-gradient(160deg, #0a1628 0%, #0f2035 50%, #0a1628 100%);
  inset: 0;
  position: fixed;
  transform: translateZ(0); // Own layer; avoids iOS fixed-bg scroll repaint.
  z-index: -1;

  [data-theme='light'] & {
    background:
      radial-gradient(ellipse at 20% 50%, rgb(1, 175, 171, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgb(88, 86, 214, 0.08) 0%, transparent 50%),
      linear-gradient(160deg, #eef2f8 0%, #e3eaf3 50%, #eef2f8 100%);
  }
}

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  margin: 0 auto;
  max-width: 720px;
  padding: 20px;
  position: relative;
  width: 100%;
  z-index: 1;
}
</style>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  min?: number;
  step?: number;
  unit?: string;
}

withDefaults(defineProps<Props>(), {
  step: 1,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
}>();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="input-group" :class="{ filled: modelValue }">
    <input
      :value="modelValue"
      type="number"
      :placeholder="placeholder"
      :min="min"
      :step="step"
      class="input"
      @input="handleInput"
      @blur="emit('blur')"
    />
    <span v-if="unit" class="unit">{{ unit }}</span>
  </div>
</template>

<style scoped>
.input-group {
  align-items: center;
  background: var(--color-surface-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

.input-group.filled {
  background: var(--color-primary-soft);
}

.input-group::before {
  background: var(--color-primary);
  border-radius: 2px;
  bottom: 6px;
  content: '';
  left: 0;
  position: absolute;
  top: 6px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
  width: 3px;
}

.input-group:focus-within::before {
  transform: scaleX(1);
}

.input {
  -moz-appearance: textfield; /* Hide native number spinners. */
  -webkit-appearance: textfield;
  appearance: textfield;
  background: transparent;
  border: none;
  color: var(--color-text);
  flex: 1;
  font-size: 14px;
  padding: 10px 12px;
  padding-left: 15px;
  padding-right: 48px;
  transition: all 0.2s;
}

.input-group.filled .input {
  color: var(--color-primary-light);
}

.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.input:focus {
  outline: none;
}

.unit {
  color: var(--color-text-secondary);
  font-size: 12px;
  pointer-events: none;
  position: absolute;
  right: 12px;
}
</style>

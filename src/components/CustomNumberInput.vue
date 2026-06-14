<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  min?: number
  step?: number
  unit?: string
}

withDefaults(defineProps<Props>(), {
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
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
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.input-group.filled {
  background: rgba(1, 175, 171, 0.15);
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
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 12px;
  padding-left: 15px;
  padding-right: 48px;
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.2s;

  /* Hide ALL native spinner buttons */
  appearance: none;
  -moz-appearance: textfield;
  -webkit-appearance: textfield;
}

.input-group.filled .input {
  color: var(--color-primary-light);
}

/* Chrome, Safari, Edge, Opera */
.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

/* Firefox */
.input[type=number] {
  -moz-appearance: textfield;
}

.input:focus {
  outline: none;
}

.unit {
  position: absolute;
  right: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}
</style>

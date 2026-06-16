<script setup lang="ts">
interface Props {
  modelValue?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const options = [
  { value: '0', label: 'Female' },
  { value: '1', label: 'Male' },
];

function select(value: string) {
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="gender-select">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="['option', { active: modelValue === option.value }]"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.gender-select {
  display: flex;
  gap: 8px;
}

.option {
  background: var(--color-surface-subtle);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.option:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
}

.option.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-light);
}
</style>

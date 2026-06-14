<script setup lang="ts">
import { ref, nextTick } from 'vue'

defineProps<{
  text: string
}>()

const tooltipRef = ref<HTMLDivElement | null>(null)

function onMouseEnter(e: MouseEvent) {
  const trigger = e.currentTarget as HTMLElement
  const tooltip = tooltipRef.value
  if (!tooltip) return

  nextTick(() => {
    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
    let top = triggerRect.top - tooltipRect.height - 8

    if (left < 0) left = 8
    if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 8

    tooltip.style.left = left + 'px'
    tooltip.style.top = top + 'px'
  })
}
</script>

<template>
  <div class="tooltip-trigger" @mouseenter="onMouseEnter">
    <slot />
    <Teleport to="body">
      <div ref="tooltipRef" class="tooltip">
        {{ text }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tooltip-trigger {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
  opacity: 0;
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

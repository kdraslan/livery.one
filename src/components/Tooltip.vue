<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

defineProps<{
  text: string
}>()

const tooltipRef = ref<HTMLDivElement | null>(null)
const isVisible = ref(false)
let triggerElement: HTMLElement | null = null

function onMouseEnter(e: MouseEvent) {
  triggerElement = e.currentTarget as HTMLElement
  isVisible.value = true
}

function onMouseLeave() {
  isVisible.value = false
}

watch(isVisible, async (visible) => {
  if (!visible || !triggerElement) return

  await nextTick()
  const tooltip = tooltipRef.value
  if (!tooltip) return

  const triggerRect = triggerElement.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()

  let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
  let top = triggerRect.top - tooltipRect.height - 8

  if (left < 0) left = 8
  if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 8

  tooltip.style.left = left + 'px'
  tooltip.style.top = top + 'px'
})
</script>

<template>
  <div class="tooltip-trigger" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <slot />
    <Teleport to="body">
      <div v-if="isVisible" ref="tooltipRef" class="tooltip">
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

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';

type Placement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'right';

const props = withDefaults(
  defineProps<{
    text: string;
    position?: Placement;
  }>(),
  { position: 'bottom' },
);

const GAP = 8;
const EDGE = 4;

const tooltipRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(false);
const placement = ref<Placement>('bottom');
const coords = ref({ top: 0, left: 0 });
const tipOffset = ref(0);

function onMouseEnter() {
  isVisible.value = true;
}

function onMouseLeave() {
  isVisible.value = false;
}

function place(p: Placement, triggerRect: DOMRect, tooltipWidth: number, tooltipHeight: number) {
  const cx = triggerRect.left + (triggerRect.width - tooltipWidth) / 2;
  const cy = triggerRect.top + (triggerRect.height - tooltipHeight) / 2;
  const above = triggerRect.top - tooltipHeight - GAP;
  const below = triggerRect.bottom + GAP;

  const map: Record<Placement, { left: number; top: number }> = {
    top: { left: cx, top: above },
    topLeft: { left: triggerRect.left, top: above },
    topRight: { left: triggerRect.right - tooltipWidth, top: above },
    bottom: { left: cx, top: below },
    bottomLeft: { left: triggerRect.left, top: below },
    bottomRight: { left: triggerRect.right - tooltipWidth, top: below },
    left: { left: triggerRect.left - tooltipWidth - GAP, top: cy },
    right: { left: triggerRect.right + GAP, top: cy },
  };
  return map[p];
}

function visibleArea(left: number, top: number, width: number, height: number) {
  const x = Math.max(0, Math.min(left + width, window.innerWidth) - Math.max(left, 0));
  const y = Math.max(0, Math.min(top + height, window.innerHeight) - Math.max(top, 0));
  return x * y;
}

function calculateTipOffset(
  placement: Placement,
  triggerRect: DOMRect,
  tooltipLeft: number,
  tooltipTop: number,
  tooltipWidth: number,
  tooltipHeight: number,
) {
  const isHorizontal = !placement.startsWith('left') && !placement.startsWith('right');
  if (isHorizontal) {
    const center = triggerRect.left + triggerRect.width / 2 - tooltipLeft;
    return Math.max(EDGE, Math.min(center, tooltipWidth - EDGE));
  }
  const center = triggerRect.top + triggerRect.height / 2 - tooltipTop;
  return Math.max(EDGE, Math.min(center, tooltipHeight - EDGE));
}

function recompute() {
  if (!tooltipRef.value || !triggerRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipWidth = tooltipRef.value.offsetWidth;
  const tooltipHeight = tooltipRef.value.offsetHeight;
  const fullArea = tooltipWidth * tooltipHeight;

  const preferredRect = place(props.position, triggerRect, tooltipWidth, tooltipHeight);
  const preferredArea = visibleArea(
    preferredRect.left,
    preferredRect.top,
    tooltipWidth,
    tooltipHeight,
  );

  if (preferredArea >= fullArea - 1) {
    // Honor the requested position when it fits fully.
    placement.value = props.position;
    coords.value = { left: preferredRect.left, top: preferredRect.top };
    tipOffset.value = calculateTipOffset(
      props.position,
      triggerRect,
      preferredRect.left,
      preferredRect.top,
      tooltipWidth,
      tooltipHeight,
    );
    return;
  }

  const placements: Placement[] = [
    'bottom',
    'top',
    'bottomLeft',
    'bottomRight',
    'topLeft',
    'topRight',
    'right',
    'left',
  ];
  let best: { p: Placement; left: number; top: number; area: number } | null = null;

  for (const p of placements) {
    // Fall back to the most visible placement.
    const { left, top } = place(p, triggerRect, tooltipWidth, tooltipHeight);
    const area = visibleArea(left, top, tooltipWidth, tooltipHeight);
    if (area >= fullArea - 1) {
      best = { p, left, top, area };
      break;
    }
    if (!best || area > best.area) best = { p, left, top, area };
  }

  if (!best) return;

  placement.value = best.p;
  coords.value = { left: best.left, top: best.top };
  tipOffset.value = calculateTipOffset(
    best.p,
    triggerRect,
    best.left,
    best.top,
    tooltipWidth,
    tooltipHeight,
  );
}

watch(isVisible, async (visible) => {
  if (!visible) return;

  await nextTick();
  recompute();
});
</script>

<template>
  <div
    ref="triggerRef"
    class="tooltip-trigger"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <slot />
    <Teleport to="body">
      <div
        v-if="isVisible"
        ref="tooltipRef"
        class="tooltip"
        :data-placement="placement"
        :style="{
          top: coords.top + 'px',
          left: coords.left + 'px',
          '--tip-offset': tipOffset + 'px',
        }"
      >
        {{ text }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tooltip-trigger {
  display: inline-block;
  position: relative;
}

.tooltip {
  animation: fadeIn 0.2s ease forwards;
  background: rgb(0, 0, 0, 0.9);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  line-height: 1.4;
  max-width: 200px;
  padding: 8px 12px;
  pointer-events: none;
  position: fixed;
  white-space: normal;
  z-index: 10000;
}

.tooltip::before {
  background: rgb(0, 0, 0, 0.9);
  content: '';
  height: 6px;
  position: absolute;
  transform: rotate(45deg);
  width: 6px;
}

.tooltip[data-placement='top']::before,
.tooltip[data-placement='topLeft']::before,
.tooltip[data-placement='topRight']::before {
  bottom: -3px;
}

.tooltip[data-placement='bottom']::before,
.tooltip[data-placement='bottomLeft']::before,
.tooltip[data-placement='bottomRight']::before {
  top: -3px;
}

.tooltip[data-placement='left']::before {
  right: -3px;
}

.tooltip[data-placement='right']::before {
  left: -3px;
}

.tooltip[data-placement='top']::before,
.tooltip[data-placement='topLeft']::before,
.tooltip[data-placement='topRight']::before,
.tooltip[data-placement='bottom']::before,
.tooltip[data-placement='bottomLeft']::before,
.tooltip[data-placement='bottomRight']::before {
  left: var(--tip-offset);
  margin-left: -3px;
}

.tooltip[data-placement='left']::before,
.tooltip[data-placement='right']::before {
  margin-top: -3px;
  top: var(--tip-offset);
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

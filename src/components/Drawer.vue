<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const DRAWER_SLIDE_MS = 300
const DRAWER_DISMISS_RATIO = 0.3

defineProps<{
  fit?: boolean
}>()

const open = defineModel<boolean>({ default: false })
const emit = defineEmits<{ afterClose: [] }>()

const root = ref<HTMLElement | null>(null)
const rendered = ref(open.value)
const offset = ref(0)
const animating = ref(false)
const sheet = ref<HTMLElement | null>(null)

let startY = 0
let height = 0
let dragging = false
let timer: ReturnType<typeof setTimeout> | undefined

const sheetStyle = computed(() => ({
  transform: `translateY(${offset.value}px)`,
  transition: animating.value ? `transform ${DRAWER_SLIDE_MS}ms ease` : 'none',
}))

const backdropStyle = computed(() => {
  const span = height || window.innerHeight
  return {
    opacity: Math.max(0, 1 - offset.value / span),
    transition: animating.value ? `opacity ${DRAWER_SLIDE_MS}ms ease` : 'none',
  }
})

watch(open, (value) => (value ? reveal() : conceal()))

function reveal() {
  clearTimeout(timer)
  const fresh = !rendered.value
  rendered.value = true

  if (!fresh) {
    animating.value = true
    offset.value = 0
    return
  }

  animating.value = false
  offset.value = window.innerHeight

  nextTick(() => {
    height = sheet.value?.offsetHeight ?? offset.value
    requestAnimationFrame(() => {
      animating.value = true
      offset.value = 0
    })
  })
}

function conceal() {
  animating.value = true
  offset.value = height || window.innerHeight
  clearTimeout(timer)
  timer = setTimeout(() => {
    rendered.value = false
    emit('afterClose')
  }, DRAWER_SLIDE_MS)
}

function startDrag(event: PointerEvent) {
  dragging = true
  animating.value = false
  startY = event.clientY
  height = sheet.value?.offsetHeight ?? height
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onDrag(event: PointerEvent) {
  if (dragging) offset.value = Math.max(0, event.clientY - startY)
}

function endDrag() {
  if (!dragging) return
  dragging = false
  animating.value = true
  if (offset.value > height * DRAWER_DISMISS_RATIO)
    open.value = false
  else offset.value = 0
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && rendered.value) open.value = false
}

watch(rendered, (is) =>
  is ? document.addEventListener('keydown', onKey) : document.removeEventListener('keydown', onKey),
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  clearTimeout(timer)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="rendered"
      ref="root"
      class="drawer-root"
    >
      <div
        class="backdrop"
        :style="backdropStyle"
        @click="open = false"
      />

      <div
        ref="sheet"
        class="sheet"
        :class="{ fit }"
        :style="sheetStyle"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="handle"
          @pointerdown="startDrag"
          @pointermove="onDrag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
        >
          <span class="grabber" />
        </div>

        <div class="body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}

.backdrop {
  background: rgba(0, 0, 0, 0.4);
  inset: 0;
  position: fixed;
  z-index: 1000;
  pointer-events: auto;
}

.sheet {
  background: var(--color-surface);
  border-radius: 16px 16px 0 0;
  bottom: 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  height: 70vh;
  left: 12px;
  overflow: hidden;
  position: fixed;
  right: 12px;
  z-index: 1001;
  pointer-events: auto;
}

.fit {
  height: auto;
  max-height: 70vh;
}

.handle {
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  cursor: grab;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 12px 0;
  touch-action: none;
}

.grabber {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  height: 4px;
  width: 40px;
}

.body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

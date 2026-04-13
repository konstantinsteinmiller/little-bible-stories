<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  progress?: number // 0..1
  label?: string    // overrides default "X% gelesen"
  isDisabled?: boolean
  seekable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  label: '',
  isDisabled: false,
  seekable: true
})

const emit = defineEmits<{ (e: 'seek', value: number): void }>()

const pressed = ref(false)
const trackRef = ref<HTMLElement | null>(null)

const clamped = computed(() => Math.min(1, Math.max(0, props.progress)))
const percent = computed(() => Math.round(clamped.value * 100))
const displayLabel = computed(() => props.label || `${percent.value}% gelesen`)

const seekFromEvent = (e: PointerEvent) => {
  if (!props.seekable || !trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  emit('seek', ratio)
}

const onDown = (e: PointerEvent) => {
  pressed.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  seekFromEvent(e)
}
const onMove = (e: PointerEvent) => {
  if (pressed.value) seekFromEvent(e)
}
const onUp = () => (pressed.value = false)
</script>

<template lang="pug">
  div(
    :class="{ 'opacity-50 grayscale pointer-events-none': isDisabled }"
    class="a-player w-full select-none"
  )
    div(
      ref="trackRef"
      :class="{ 'is-pressed': pressed, 'is-seekable': seekable }"
      class="a-player-track relative w-full touch-none"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    )
      div(
        class="a-player-fill absolute left-0 top-0 h-full"
        :style="{ width: (clamped * 100) + '%' }"
      )
      span(
        class="a-player-knob absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        :style="{ left: (clamped * 100) + '%' }"
      )

    p(class="a-player-label mt-2 text-xs md:text-sm font-medium tracking-wide")
      | {{ displayLabel }}
</template>

<style scoped lang="sass">
.a-player-track
  height: 14px
  border-radius: 999px
  background-color: #e9dcff
  box-shadow: inset 0 2px 4px rgba(61, 22, 118, 0.15), inset 0 -1px 0 rgba(255, 255, 255, 0.6)
  transition: transform 150ms ease-out

  &.is-seekable
    cursor: pointer

  &:hover .a-player-knob
    transform: translate(-50%, -50%) scale(1.1)

  &.is-pressed
    transform: scaleY(1.08)

  &.is-pressed .a-player-knob
    transform: translate(-50%, -50%) scale(0.88)

.a-player-fill
  border-radius: 999px
  background: linear-gradient(90deg, #6929c4 0%, #8a3ffc 100%)
  box-shadow: 0 0 0 1px rgba(61, 22, 118, 0.25), 0 2px 6px -1px rgba(138, 63, 252, 0.45)
  transition: width 200ms ease-out

.a-player-knob
  width: 20px
  height: 20px
  border-radius: 999px
  background: radial-gradient(120% 120% at 30% 25%, #ffffff 0%, #efe6ff 60%, #cdb2ff 100%)
  border: 2px solid #6929c4
  box-shadow: 0 3px 8px -2px rgba(61, 22, 118, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)
  transition: transform 150ms ease-out

.a-player-label
  color: #8b6fbf
</style>

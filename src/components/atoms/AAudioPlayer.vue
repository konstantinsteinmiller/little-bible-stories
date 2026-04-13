<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  isPlaying?: boolean
  currentTime?: number
  duration?: number
  skipSeconds?: number
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  skipSeconds: 15
})

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'rewind', seconds: number): void
  (e: 'forward', seconds: number): void
  (e: 'seek', value: number): void
}>()

const SMALL_SKIP = 5

const trackRef = ref<HTMLDivElement | null>(null)
const dragging = ref(false)

const progress = computed(() => {
  if (!props.duration) return 0
  return Math.min(100, Math.max(0, (props.currentTime / props.duration) * 100))
})

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function seekFromEvent(event: PointerEvent) {
  const el = trackRef.value
  if (!el || !props.duration) return
  const rect = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  emit('seek', ratio * props.duration)
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  seekFromEvent(event)
  event.preventDefault()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  seekFromEvent(event)
}

function onPointerUp(event: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  try {
    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  } catch { /* already released */
  }
}
</script>

<template lang="pug">
  div(class="a-audio-player relative w-full rounded-3xl px-5 py-6 md:px-7 md:py-8 select-none")
    //- Progress bar — fat hit area (20px) with a 6px visual track inside
    div(class="a-audio-progress-wrap")
      div(
        ref="trackRef"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        class="a-audio-hit relative w-full h-5 flex items-center cursor-pointer touch-none select-none"
      )
        div(class="a-audio-track relative w-full h-[6px] rounded-full pointer-events-none")
          div(
            class="a-audio-fill absolute inset-y-0 left-0 rounded-full"
            :style="{ width: `${progress}%` }"
          )
          div(
            class="a-audio-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
            :style="{ left: `${progress}%` }"
            :class="{ 'is-dragging': dragging }"
          )

      div(class="mt-3 flex items-center justify-between text-[11px] md:text-xs font-extrabold tabular-nums a-audio-time")
        span {{ formatTime(currentTime) }}
        span {{ formatTime(duration) }}

    //- Controls
    div(class="mt-5 md:mt-6 flex items-center justify-center gap-4 md:gap-5")
      button(
        type="button"
        @click="emit('rewind', SMALL_SKIP)"
        :aria-label="`Rewind ${SMALL_SKIP}s`"
        class="a-audio-side-btn a-audio-side-btn--sm group relative inline-flex items-center justify-center w-9 h-9 rounded-full cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]")
          path(d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z")
        span(class="a-audio-skip-num absolute bottom-[2px] text-[7px] font-black") {{ SMALL_SKIP }}
      button(
        type="button"
        @click="emit('rewind', skipSeconds)"
        :aria-label="`Rewind ${skipSeconds}s`"
        class="a-audio-side-btn group relative inline-flex items-center justify-center w-12 h-12 rounded-full cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6")
          path(d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z")
        span(class="a-audio-skip-num absolute bottom-1 text-[8px] font-black") {{ skipSeconds }}


      button(
        type="button"
        @click="emit('toggle')"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        class="a-audio-play group relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full cursor-pointer transition-transform duration-150 ease-out hover:scale-[104%] active:scale-[96%]"
      )
        svg(v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10")
          rect(x="6" y="5" width="4" height="14" rx="1.2")
          rect(x="14" y="5" width="4" height="14" rx="1.2")
        svg(v-else viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 translate-x-[2px]")
          path(d="M8 5v14l11-7z")

      button(
        type="button"
        @click="emit('forward', skipSeconds)"
        :aria-label="`Forward ${skipSeconds}s`"
        class="a-audio-side-btn group relative inline-flex items-center justify-center w-12 h-12 rounded-full cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6")
          path(d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z")
        span(class="a-audio-skip-num absolute bottom-1 text-[8px] font-black") {{ skipSeconds }}

      //5 sec button
      button(
        type="button"
        @click="emit('forward', SMALL_SKIP)"
        :aria-label="`Forward ${SMALL_SKIP}s`"
        class="a-audio-side-btn a-audio-side-btn--sm group relative inline-flex items-center justify-center w-9 h-9 rounded-full cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="currentColor" class="w-[18px] h-[18px]")
          path(d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z")
        span(class="a-audio-skip-num absolute bottom-[2px] text-[7px] font-black") {{ SMALL_SKIP }}
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none
  padding: 0

.a-audio-player
  background: linear-gradient(160deg, #9560f4 0%, #7e3af2 60%, #6929c4 100%)
  border: 1px solid rgba(255, 255, 255, 0.22)
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px -20px rgba(61, 22, 118, 0.55)
  color: #ffffff

.a-audio-track
  background-color: rgba(255, 255, 255, 0.25)

.a-audio-fill
  background: linear-gradient(90deg, #ffd147 0%, #ffffff 100%)
  box-shadow: 0 0 10px rgba(255, 209, 71, 0.7)

.a-audio-handle
  background-color: #ffffff
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18), 0 0 16px 2px rgba(255, 209, 71, 0.8)
  transition: transform 120ms ease-out

  &.is-dragging
    transform: translate(-50%, -50%) scale(1.25)

.a-audio-time
  color: rgba(255, 255, 255, 0.85)

.a-audio-side-btn
  color: rgba(255, 255, 255, 0.92)
  background-color: rgba(255, 255, 255, 0.12)
  border: 1px solid rgba(255, 255, 255, 0.2)
  transition: transform 150ms ease-out, background-color 150ms ease-out

  &:hover
    background-color: rgba(255, 255, 255, 0.22)
    transform: translateY(-1px)

  &:active
    transform: scale(0.96)

.a-audio-side-btn--sm
  background-color: rgba(255, 255, 255, 0.08)

.a-audio-skip-num
  color: rgba(255, 255, 255, 0.85)

.a-audio-play
  background-color: #ffffff
  color: #6929c4
  border: 3px solid #ffd147
  box-shadow: 0 0 0 1px rgba(255, 209, 71, 0.3), 0 0 28px -2px rgba(255, 209, 71, 0.6), 0 12px 32px -8px rgba(61, 22, 118, 0.55)
</style>

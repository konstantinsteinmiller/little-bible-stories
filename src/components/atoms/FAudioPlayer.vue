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
  (e: 'rewind'): void
  (e: 'forward'): void
  (e: 'seek', value: number): void
}>()

const trackRef = ref<HTMLDivElement | null>(null)

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

function onTrackClick(event: MouseEvent) {
  const el = trackRef.value
  if (!el || !props.duration) return
  const rect = el.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  emit('seek', ratio * props.duration)
}
</script>

<template lang="pug">
  div(class="f-audio-player relative w-full max-w-md mx-auto rounded-3xl px-6 py-7 md:px-8 md:py-9 select-none")
    //- Progress bar
    div(class="f-audio-progress-wrap")
      div(
        ref="trackRef"
        @click="onTrackClick"
        class="f-audio-track relative w-full h-[3px] rounded-full bg-white/15 cursor-pointer"
      )
        //- filled portion
        div(
          class="f-audio-fill absolute inset-y-0 left-0 rounded-full"
          :style="{ width: `${progress}%` }"
        )
        //- glowing handle
        div(
          class="f-audio-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white"
          :style="{ left: `${progress}%` }"
        )

      //- Time labels
      div(class="mt-3 flex items-center justify-between text-[11px] md:text-xs font-medium tracking-wider text-white/55 tabular-nums")
        span {{ formatTime(currentTime) }}
        span {{ formatTime(duration) }}

    //- Controls row
    div(class="mt-7 md:mt-8 flex items-center justify-center gap-10 md:gap-12")
      //- Rewind
      button(
        type="button"
        @click="emit('rewind')"
        aria-label="Rewind"
        class="f-audio-side-btn group inline-flex items-center justify-center text-white/80 hover:text-white transition-colors duration-150 cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 md:w-8 md:h-8")
          polygon(points="11 19 2 12 11 5 11 19" fill="currentColor" stroke="none")
          polygon(points="22 19 13 12 22 5 22 19" fill="currentColor" stroke="none")

      //- Play / Pause
      button(
        type="button"
        @click="emit('toggle')"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        class="f-audio-play group relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-transparent text-white cursor-pointer transition-all duration-150 ease-out hover:scale-[104%] active:scale-[96%]"
      )
        //- Pause icon
        svg(
          v-if="isPlaying"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-9 h-9 md:w-10 md:h-10"
        )
          rect(x="6" y="5" width="4" height="14" rx="1")
          rect(x="14" y="5" width="4" height="14" rx="1")
        //- Play icon
        svg(
          v-else
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-9 h-9 md:w-10 md:h-10 translate-x-[2px]"
        )
          path(d="M8 5v14l11-7z")

      //- Forward
      button(
        type="button"
        @click="emit('forward')"
        aria-label="Fast forward"
        class="f-audio-side-btn group inline-flex items-center justify-center text-white/80 hover:text-white transition-colors duration-150 cursor-pointer"
      )
        svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 md:w-8 md:h-8")
          polygon(points="13 19 22 12 13 5 13 19" fill="currentColor" stroke="none")
          polygon(points="2 19 11 12 2 5 2 19" fill="currentColor" stroke="none")
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none
  padding: 0

.f-audio-player
  background: linear-gradient(160deg, #1a0f33 0%, #0c0720 100%)
  box-shadow: 0 0 0 1px rgba(196, 168, 255, 0.08), 0 24px 60px -20px rgba(0, 0, 0, 0.7)

.f-audio-fill
  background: linear-gradient(90deg, #ff5fa2 0%, #8c5aff 50%, #50aaff 100%)
  box-shadow: 0 0 8px rgba(140, 90, 255, 0.5)

.f-audio-handle
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08), 0 0 14px 2px rgba(196, 168, 255, 0.7), 0 0 28px 4px rgba(140, 90, 255, 0.45)
  transition: box-shadow 150ms ease-out

  &:hover
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.12), 0 0 18px 3px rgba(196, 168, 255, 0.85), 0 0 36px 6px rgba(140, 90, 255, 0.55)

.f-audio-play
  border: 3px solid #ffffff
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 24px -2px rgba(196, 168, 255, 0.35), 0 12px 32px -8px rgba(0, 0, 0, 0.6)

  &:hover
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 36px -2px rgba(196, 168, 255, 0.55), 0 16px 40px -8px rgba(0, 0, 0, 0.7)
</style>

<template lang="pug">
  div(class="w-full flex flex-col gap-4 p-4")
    //- Progress Bar
    div(class="w-full flex flex-col gap-2")
      div(class="relative w-full h-1 bg-white/20 rounded-full cursor-pointer")
        div(
          class="absolute top-0 left-0 h-full bg-white rounded-full"
          :style="{ width: progressPercentage + '%' }"
        )
        div(
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
          :style="{ left: progressPercentage + '%' }"
        )
      div(class="flex justify-between w-full text-xs text-white/50")
        span {{ formattedCurrentTime }}
        span {{ formattedDuration }}

    //- Controls
    div(class="flex items-center justify-center gap-8")
      button(class="text-white/70 hover:text-white transition-colors" @click="emit('skip-back')")
        svg(class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24")
          path(d="M11 19V5l-8 7 8 7zm10 0V5l-8 7 8 7z")

      button(
        class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#130b2e] hover:scale-105 transition-transform"
        @click="togglePlay"
      )
        svg(v-if="isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24")
          path(d="M6 19h4V5H6v14zm8-14v14h4V5h-4z")
        svg(v-else class="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24")
          path(d="M8 5v14l11-7z")

      button(class="text-white/70 hover:text-white transition-colors" @click="emit('skip-forward')")
        svg(class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24")
          path(d="M4 5v14l8-7-8-7zm10 0v14l8-7-8-7z")
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isPlaying: boolean
  currentTime: number // in seconds
  duration: number // in seconds
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:isPlaying', value: boolean): void
  (e: 'skip-forward'): void
  (e: 'skip-back'): void
}>()

const progressPercentage = computed(() => {
  if (props.duration === 0) return 0
  return (props.currentTime / props.duration) * 100
})

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(props.currentTime))
const formattedDuration = computed(() => formatTime(props.duration))

const togglePlay = () => {
  emit('update:isPlaying', !props.isPlaying)
}
</script>
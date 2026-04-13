<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  greeting?: string
  title?: string
  actionLabel?: string
  showAction?: boolean
}

withDefaults(defineProps<Props>(), {
  greeting: 'Hello',
  title: 'Startseite',
  actionLabel: 'Unlock',
  showAction: true
})

defineEmits(['action'])

const pressed = ref(false)
const onDown = () => (pressed.value = true)
const onUp = () => (pressed.value = false)
</script>

<template lang="pug">
  header(class="a-header relative w-full px-5 md:px-7 pt-[max(env(safe-area-inset-top),1.25rem)] pb-6 md:pb-7")
    div(class="relative flex items-center justify-between gap-3")
      div(class="min-w-0 flex-1")
        p(class="a-header-greeting text-xs md:text-sm font-medium tracking-wide")
          slot(name="greeting") {{ greeting }}
        h1(class="a-header-title mt-1 text-2xl md:text-3xl font-extrabold leading-tight truncate")
          slot(name="title") {{ title }}

      button(
        v-if="showAction"
        type="button"
        :class="{ 'is-pressed': pressed }"
        class="a-header-action shrink-0 inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2 md:py-2.5 cursor-pointer select-none touch-manipulation transition-[transform,box-shadow,background-color] duration-150 ease-out hover:scale-[104%]"
        @click="$emit('action')"
        @pointerdown="onDown"
        @pointerup="onUp"
        @pointerleave="onUp"
        @pointercancel="onUp"
      )
        svg(
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-4 h-4 md:w-[18px] md:h-[18px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
        )
          rect(x="4" y="11" width="16" height="10" rx="2.2")
          path(d="M8 11V8a4 4 0 0 1 8 0")
        span(class="text-xs md:text-sm font-extrabold tracking-wide uppercase")
          slot(name="action") {{ actionLabel }}
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent

.a-header
  background: linear-gradient(180deg, #4a1b91 0%, #3a1272 100%)
  border-bottom-left-radius: 32px
  border-bottom-right-radius: 32px
  box-shadow: 0 12px 28px -10px rgba(61, 22, 118, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)
  color: #ffffff

.a-header-greeting
  color: rgba(255, 255, 255, 0.72)
  letter-spacing: 0.02em

.a-header-title
  color: #ffffff
  letter-spacing: -0.01em
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.25)

.a-header-action
  color: #3d1676
  background: linear-gradient(180deg, #ffe14a 0%, #f5c000 100%)
  border: 1px solid #b38600
  box-shadow: 0 5px 0 -1px #8a6600, 0 10px 20px -6px rgba(179, 134, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -2px 0 rgba(139, 99, 0, 0.25)

  &:hover
    background: linear-gradient(180deg, #ffe96a 0%, #ffcf1a 100%)

  &:active, &.is-pressed
    transform: translateY(4px) scale(0.97)
    box-shadow: 0 1px 0 -1px #8a6600, 0 3px 8px -4px rgba(179, 134, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(139, 99, 0, 0.25)
</style>

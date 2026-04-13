<script setup lang="ts">
import { ref } from 'vue'

type IconName = 'home' | 'grid' | 'pencil' | 'profile'

interface NavItem {
  id: string | number
  label: string
  icon: IconName
}

interface Props {
  items: NavItem[]
  modelValue: string | number
}

defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'select'])

const pressedId = ref<string | number | null>(null)

function onDown(item: NavItem) {
  pressedId.value = item.id
}

function onUp() {
  pressedId.value = null
}

function selectItem(item: NavItem) {
  emit('update:modelValue', item.id)
  emit('select', item)
}
</script>

<template lang="pug">
  nav(class="b-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] px-2")
    div(class="mx-auto max-w-md flex items-stretch justify-around gap-1")
      button(
        v-for="item in items"
        :key="item.id"
        type="button"
        :aria-label="item.label"
        :aria-current="modelValue === item.id ? 'page' : undefined"
        :class="[\
          'b-nav-btn group relative flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer select-none touch-manipulation py-2 px-1',\
          modelValue === item.id ? 'is-active' : 'is-inactive',\
          pressedId === item.id ? 'is-pressed' : ''\
        ]"
        @click="selectItem(item)"
        @pointerdown="onDown(item)"
        @pointerup="onUp"
        @pointerleave="onUp"
        @pointercancel="onUp"
      )
        //- active dot indicator above the icon
        span(
          v-if="modelValue === item.id"
          class="b-nav-dot pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
        )

        //- icon wrapper
        span(class="b-nav-icon relative inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7")
          template(v-if="item.icon === 'home'")
            svg(
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              path(d="M3 11 12 3l9 8")
              path(d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10")

          template(v-else-if="item.icon === 'grid'")
            svg(
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              rect(x="3" y="3" width="7" height="7" rx="1.5")
              rect(x="14" y="3" width="7" height="7" rx="1.5")
              rect(x="3" y="14" width="7" height="7" rx="1.5")
              rect(x="14" y="14" width="7" height="7" rx="1.5")

          template(v-else-if="item.icon === 'pencil'")
            svg(
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              path(d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z")
              path(d="m14.5 5.5 3 3")

          template(v-else-if="item.icon === 'profile'")
            svg(
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              circle(cx="12" cy="8" r="4")
              path(d="M4 21a8 8 0 0 1 16 0")

        //- label
        span(
          :class="[\
            'b-nav-label text-[10px] md:text-[11px] font-semibold tracking-wide transition-colors duration-200',\
            modelValue === item.id ? 'is-active-label' : ''\
          ]"
        ) {{ item.label }}
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none

.b-bottom-nav
  border-top: 1px solid #eee7fa
  box-shadow: 0 -4px 20px -8px rgba(61, 22, 118, 0.15), 0 -1px 0 rgba(61, 22, 118, 0.04)

.b-nav-btn
  color: #8e939a
  transition: color 220ms ease-out, transform 180ms ease-out

  &.is-inactive:hover
    color: #5a5f66

  &.is-inactive:hover .b-nav-icon
    transform: translateY(-2px)

  &.is-active
    color: #6929c4

  &.is-active .b-nav-icon
    animation: b-nav-pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1)

  &.is-pressed .b-nav-icon
    transform: scale(0.88)

.b-nav-icon
  transition: transform 200ms ease-out
  will-change: transform
  filter: drop-shadow(0 0 0 rgba(138, 63, 252, 0))

.is-active .b-nav-icon
  filter: drop-shadow(0 2px 6px rgba(138, 63, 252, 0.35))

.b-nav-label
  color: #8e939a

.is-active-label
  color: #6929c4

.b-nav-dot
  background: linear-gradient(90deg, #8a3ffc 0%, #6929c4 100%)
  box-shadow: 0 0 10px rgba(138, 63, 252, 0.55)
  animation: b-nav-dot-in 300ms ease-out

@keyframes b-nav-pop
  0%
    transform: scale(0.85) translateY(2px)
  55%
    transform: scale(1.18) translateY(-3px)
  100%
    transform: scale(1) translateY(0)

@keyframes b-nav-dot-in
  0%
    transform: translate(-50%, -6px) scaleX(0.2)
    opacity: 0
  100%
    transform: translate(-50%, 0) scaleX(1)
    opacity: 1
</style>

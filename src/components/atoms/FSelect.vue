<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
  subLabel?: string
  icon?: string
  avatar?: string
}

interface Props {
  modelValue: string | number
  options: Option[]
  label?: string
  multiple?: boolean
  accent?: 'purple' | 'gold'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  multiple: false,
  accent: 'purple'
})

const emit = defineEmits(['update:modelValue', 'change'])

const accentClass = computed(() => (props.accent === 'gold' ? 'accent-gold' : 'accent-purple'))

function isSelected(option: Option) {
  return props.modelValue === option.value
}

function selectOption(option: Option) {
  emit('update:modelValue', option.value)
  emit('change', option)
}
</script>

<template lang="pug">
  div(:class="['f-select w-full', accentClass]")
    //- Optional label
    div(
      v-if="label"
      class="f-select-label mb-2 ml-1 text-xs md:text-sm font-bold uppercase tracking-wider text-white/60"
    ) {{ label }}

    //- Tile list
    div(class="flex flex-col gap-2 md:gap-3")
      button(
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectOption(option)"
        :class="[\
          'f-select-tile group relative flex items-center w-full gap-3 md:gap-4 cursor-pointer select-none touch-manipulation rounded-2xl px-3 py-3 md:px-4 md:py-3 text-left transition-all duration-150 ease-out hover:scale-[101%] active:scale-[99%]',\
          isSelected(option) ? 'is-active' : 'is-inactive'\
        ]"
      )
        //- Left: avatar / icon
        div(class="f-select-avatar relative shrink-0 inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-[#2a1a4a] border border-white/10")
          img(
            v-if="option.avatar"
            :src="option.avatar"
            :alt="option.label"
            class="absolute inset-0 w-full h-full object-cover"
          )
          span(
            v-else-if="option.icon"
            class="text-lg md:text-xl leading-none"
          ) {{ option.icon }}
          span(
            v-else
            class="text-sm font-bold text-white/70 uppercase"
          ) {{ option.label.charAt(0) }}

        //- Center: text block
        div(class="flex-1 min-w-0 flex flex-col")
          span(class="f-select-title text-sm md:text-base font-bold text-white truncate") {{ option.label }}
          span(
            v-if="option.subLabel"
            class="f-select-sub mt-0.5 text-[11px] md:text-xs font-medium text-white/50 truncate"
          ) {{ option.subLabel }}

        //- Right: radio / checkbox indicator
        div(
          :class="[\
            'f-select-indicator shrink-0 relative inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 border-2 transition-all duration-150',\
            multiple ? 'rounded-md' : 'rounded-full',\
            isSelected(option) ? 'is-checked' : 'border-white/25'\
          ]"
        )
          //- inner dot for radio
          span(
            v-if="!multiple && isSelected(option)"
            class="block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white"
          )
          //- check mark for checkbox
          svg(
            v-else-if="multiple && isSelected(option)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4 text-white"
          )
            polyline(points="20 6 9 17 4 12")
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none

.f-select-tile
  background-color: #1a0f33
  border: 2px solid transparent
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.55)

  &.is-inactive
    border-color: rgba(196, 168, 255, 0.10)

    &:hover
      border-color: rgba(196, 168, 255, 0.22)
      background-color: #211042

// ---------- Purple accent ----------
.accent-purple
  .f-select-tile.is-active
    border-color: #8c5aff
    background-color: #221442
    box-shadow: 0 0 0 1px rgba(140, 90, 255, 0.35), 0 0 22px -2px rgba(140, 90, 255, 0.55), 0 0 44px -10px rgba(140, 90, 255, 0.45)

  .f-select-indicator.is-checked
    border-color: #8c5aff
    background-color: #8c5aff
    box-shadow: 0 0 12px rgba(140, 90, 255, 0.7)

// ---------- Gold accent ----------
.accent-gold
  .f-select-tile.is-active
    border-color: #f7c948
    background-color: #2a1a3a
    box-shadow: 0 0 0 1px rgba(247, 201, 72, 0.4), 0 0 22px -2px rgba(247, 201, 72, 0.55), 0 0 44px -10px rgba(247, 201, 72, 0.4)

  .f-select-indicator.is-checked
    border-color: #f7c948
    background-color: #f7c948
    box-shadow: 0 0 12px rgba(247, 201, 72, 0.7)
</style>

<script setup lang="ts">
interface Option {
  value: string | number
  label: string
  subLabel?: string
  icon?: string
  avatar?: string
}

interface Props {
  modelValue: string | number | (string | number)[]
  options: Option[]
  label?: string
  multiple?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  multiple: false,
  isDisabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[]): void
  (e: 'change', option: Option): void
}>()

function isSelected(option: Option): boolean {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value)
  }
  return props.modelValue === option.value
}

function selectOption(option: Option) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.indexOf(option.value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(option.value)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', option.value)
  }
  emit('change', option)
}
</script>

<template lang="pug">
  div(
    :class="{ 'opacity-50 grayscale pointer-events-none': isDisabled }"
    class="a-select w-full select-none"
  )
    div(
      v-if="label"
      class="a-select-label mb-2 ml-1 text-[10px] md:text-xs font-extrabold uppercase tracking-[0.14em]"
    ) {{ label }}

    div(class="flex flex-col gap-2 md:gap-2.5")
      button(
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectOption(option)"
        :class="[\
          'a-select-tile group relative flex items-center w-full gap-3 md:gap-4 cursor-pointer touch-manipulation text-left px-3 py-2.5 md:px-4 md:py-3 transition-all duration-150 ease-out',\
          isSelected(option) ? 'is-active' : 'is-inactive'\
        ]"
      )
        div(class="a-select-avatar relative shrink-0 inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden")
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
            class="text-sm font-black uppercase"
          ) {{ option.label.charAt(0) }}

        div(class="flex-1 min-w-0 flex flex-col")
          span(class="a-select-title text-sm md:text-base font-extrabold truncate") {{ option.label }}
          span(
            v-if="option.subLabel"
            class="a-select-sub mt-0.5 text-[11px] md:text-xs font-semibold truncate"
          ) {{ option.subLabel }}

        div(
          :class="[\
            'a-select-indicator shrink-0 relative inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 border-2 transition-all duration-150',\
            multiple ? 'rounded-md' : 'rounded-full',\
            isSelected(option) ? 'is-checked' : ''\
          ]"
        )
          span(
            v-if="!multiple && isSelected(option)"
            class="block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white"
          )
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

.a-select-label
  color: var(--color-text-secondary)

.a-select-tile
  background-color: var(--color-bg-card)
  border: 1.5px solid var(--color-border-subtle)
  color: var(--color-text-primary)
  border-radius: 20px
  box-shadow: 0 1px 2px rgba(61, 22, 118, 0.04), 0 8px 22px -12px rgba(126, 58, 242, 0.22)

  &:hover:not(.is-active)
    transform: translateY(-2px)
    border-color: rgba(126, 58, 242, 0.35)
    box-shadow: 0 2px 4px rgba(61, 22, 118, 0.06), 0 16px 32px -14px rgba(126, 58, 242, 0.32)

  &:active
    transform: translateY(1px) scale(0.99)

  &.is-active
    border-color: #7e3af2
    background-color: var(--color-bg-active-pill)
    box-shadow: 0 0 0 1px rgba(126, 58, 242, 0.3), 0 10px 26px -10px rgba(126, 58, 242, 0.45)

.a-select-avatar
  background-color: var(--color-bg-active-pill)
  border: 1px solid rgba(126, 58, 242, 0.2)
  color: var(--color-text-link)

.a-select-title
  color: var(--color-text-primary)

.a-select-sub
  color: var(--color-text-secondary)

.a-select-indicator
  border-color: #c9bde5

  &.is-checked
    border-color: #7e3af2
    background: linear-gradient(180deg, #9560f4 0%, #7e3af2 100%)
    box-shadow: 0 0 0 1px rgba(126, 58, 242, 0.3), 0 4px 12px -2px rgba(126, 58, 242, 0.55)
</style>

<script setup lang="ts">
export interface TabOption {
  label: string
  value: string | number
  icon?: string
}

interface Props {
  modelValue: string | number
  options: TabOption[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const selectTab = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>

<template lang="pug">
  div(class="f-tabs relative flex items-center gap-5 md:gap-7 border-b border-white/10")
    button(
      v-for="tab in options"
      :key="tab.value"
      type="button"
      @click="selectTab(tab.value)"
      :class="[\
        'f-tab relative cursor-pointer select-none touch-manipulation pb-3 pt-2 transition-colors duration-150 ease-out',\
        modelValue === tab.value ? 'is-active text-white' : 'is-inactive text-white/45 hover:text-white/75'\
      ]"
    )
      span(class="inline-flex items-center gap-2")
        img(
          v-if="tab.icon"
          :src="tab.icon"
          :alt="tab.label"
          class="w-5 h-5 object-contain"
        )
        span(class="text-sm md:text-base font-semibold tracking-wide") {{ tab.label }}
      //- underline indicator for active tab
      span(
        v-if="modelValue === tab.value"
        class="f-tab-underline absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-white"
      )
</template>

<style lang="sass" scoped>
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none

.f-tab-underline
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5)
</style>

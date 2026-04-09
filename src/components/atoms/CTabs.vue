<template lang="pug">
  div(class="flex bg-[#1a103c] rounded-full p-1")
    button(
      v-for="tab in tabs"
      :key="tab.value"
      class="flex-1 py-2 text-sm font-medium rounded-full transition-colors"
      :class="modelValue === tab.value ? 'bg-[#31225c] text-white' : 'text-white/50 hover:text-white/80'"
      @click="selectTab(tab.value)"
    ) {{ tab.label }}
</template>

<script setup lang="ts">
export interface TabOption {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  tabs: TabOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const selectTab = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>
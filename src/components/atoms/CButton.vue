<template lang="pug">
  button(
    class="flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[buttonSize, buttonVariant, block ? 'w-full' : '']"
    :disabled="disabled"
    @click="onClick"
  )
    slot(name="prefix")
    span(class="mx-2")
      slot
    slot(name="suffix")
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'premium' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const onClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

const buttonSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'py-2 px-4 text-sm rounded-[16px]'
    case 'lg':
      return 'py-4 px-8 text-lg rounded-[24px]'
    case 'md':
    default:
      return 'py-3 px-6 text-base rounded-[20px]'
  }
})

const buttonVariant = computed(() => {
  switch (props.variant) {
    case 'premium':
      return 'bg-[#FFD700] text-[#130b2e] hover:bg-[#FFC000]'
    case 'outline':
      return 'bg-transparent border border-white/20 text-white hover:bg-white/10'
    case 'ghost':
      return 'bg-transparent text-white hover:bg-white/10'
    case 'primary':
    default:
      return 'bg-white text-[#130b2e] hover:bg-gray-100'
  }
})
</script>
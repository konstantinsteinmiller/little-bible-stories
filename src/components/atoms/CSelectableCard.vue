<template lang="pug">
  button(
    class="flex flex-col items-center justify-center p-4 rounded-[20px] transition-all bg-[#24184a] border-2"
    :class="selected ? 'border-white' : 'border-transparent hover:border-white/20'"
    @click="toggle"
  )
    div(
      v-if="icon"
      class="text-3xl mb-2"
    ) {{ icon }}
    span(class="text-white text-sm font-medium text-center") {{ label }}

    //- Checkmark indicator for selected state
    div(
      v-if="selected"
      class="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center"
    )
      svg(class="w-3 h-3 text-[#130b2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor")
        path(stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7")
</template>

<script setup lang="ts">
interface Props {
  label: string
  icon?: string
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
}>()

const toggle = () => {
  emit('update:selected', !props.selected)
}
</script>
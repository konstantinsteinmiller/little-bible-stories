<script setup lang="ts">
interface Props {
  label?: string
  type?: 'primary' | 'secondary' | 'icon'
  isDisabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  attention?: boolean
}

withDefaults(defineProps<Props>(), {
  label: 'NO LABEL DEFINED!',
  type: 'primary',
  attention: false
})

defineEmits(['click'])
</script>

<template lang="pug">
  div(
    :class="{\
      'scale-60' : size === 'sm',\
      'scale-80' : size === 'md',\
      'scale-110' : size === 'lg',\
      'scale-120' : size === 'xl',\
      'attention-bounce': attention,\
      'opacity-50 grayscale pointer-events-none': isDisabled,\
      'inline-block': type === 'icon',\
      'w-full': type !== 'icon'\
    }"
  )
    //- PRIMARY: white pill, black bold text, drop shadow
    button(
      v-if="type === 'primary'"
      type="button"
      @click="$emit('click')"
      class="f-btn-primary group relative w-full inline-flex items-center justify-center cursor-pointer select-none touch-manipulation bg-white text-black rounded-full px-6 md:px-8 py-3 md:py-4 min-w-[120px] md:min-w-[160px] transition-all duration-150 ease-out hover:scale-[103%] active:scale-[97%]"
    )
      span(class="relative block text-sm md:text-base font-black tracking-wide uppercase")
        slot {{ label }}

    //- SECONDARY: transparent pill, 1px light purple border, white text
    button(
      v-else-if="type === 'secondary'"
      type="button"
      @click="$emit('click')"
      class="f-btn-secondary group relative w-full inline-flex items-center justify-center cursor-pointer select-none touch-manipulation bg-transparent text-white rounded-full px-6 md:px-8 py-3 md:py-4 min-w-[120px] md:min-w-[160px] border border-[#c4a8ff]/70 transition-all duration-150 ease-out hover:bg-white/5 hover:border-[#c4a8ff] hover:scale-[103%] active:scale-[97%]"
    )
      span(class="relative block text-sm md:text-base font-semibold tracking-wide uppercase")
        slot {{ label }}

    //- ICON: circular dark purple, glow, white glyph
    button(
      v-else
      type="button"
      @click="$emit('click')"
      :aria-label="label"
      class="f-btn-icon group relative inline-flex items-center justify-center cursor-pointer select-none touch-manipulation rounded-full w-12 h-12 md:w-14 md:h-14 bg-[#2a1a4a] text-white border border-[#c4a8ff]/30 transition-all duration-150 ease-out hover:scale-[105%] hover:bg-[#33205a] active:scale-[95%]"
    )
      span(class="relative flex items-center justify-center w-full h-full text-white")
        slot
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent


.f-btn-primary
  box-shadow: 0 6px 18px -4px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.08)

  &:hover
    box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.08)

.f-btn-secondary
  backdrop-filter: blur(4px)
  box-shadow: 0 0 0 0 rgba(196, 168, 255, 0)

  &:hover
    box-shadow: 0 0 18px -2px rgba(196, 168, 255, 0.25)

.f-btn-icon
  box-shadow: 0 0 18px -2px rgba(140, 90, 255, 0.55), 0 0 32px -8px rgba(140, 90, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)

  &:hover
    box-shadow: 0 0 24px -2px rgba(140, 90, 255, 0.7), 0 0 44px -6px rgba(140, 90, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)
</style>

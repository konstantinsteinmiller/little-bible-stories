<script setup lang="ts">
interface Props {
  title?: string
  subtext?: string
  image?: string
  imageAlt?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtext: '',
  image: '',
  imageAlt: ''
})

defineEmits(['click'])
</script>

<template lang="pug">
  div(
    @click="$emit('click')"
    class="f-card group relative inline-block w-full max-w-[260px] cursor-pointer select-none overflow-hidden bg-[#1a0f33] transition-all duration-200 ease-out hover:scale-[102%] active:scale-[98%]"
  )
    //- Character / illustration area
    div(class="f-card-image relative w-full aspect-[4/5] overflow-hidden")
      slot(name="image")
        img(
          v-if="image"
          :src="image"
          :alt="imageAlt || title"
          class="absolute inset-0 w-full h-full object-cover"
        )
      //- soft top vignette to blend with the dark info strip
      span(class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent")

    //- Dark semi-transparent info strip
    div(class="f-card-info relative px-4 py-3 md:px-5 md:py-4 bg-black/55 backdrop-blur-md")
      slot(name="info")
        h3(class="f-card-title text-white font-extrabold text-base md:text-lg leading-tight tracking-wide truncate")
          | {{ title }}
        p(
          v-if="subtext"
          class="f-card-subtext mt-1 text-[11px] md:text-xs font-medium uppercase tracking-wider text-white/60"
        )
          | {{ subtext }}
</template>

<style scoped lang="sass">
.f-card
  border-radius: 24px
  box-shadow: 0 0 0 1px rgba(196, 168, 255, 0.08), 0 0 24px -4px rgba(140, 90, 255, 0.25), 0 12px 32px -8px rgba(0, 0, 0, 0.6)
  -webkit-tap-highlight-color: transparent
  transition: box-shadow 200ms ease-out, transform 200ms ease-out

  &:hover
    box-shadow: 0 0 0 1px rgba(196, 168, 255, 0.18), 0 0 36px -4px rgba(140, 90, 255, 0.45), 0 16px 40px -8px rgba(0, 0, 0, 0.7)

.f-card-image
  border-top-left-radius: 24px
  border-top-right-radius: 24px

.f-card-info
  border-bottom-left-radius: 24px
  border-bottom-right-radius: 24px
</style>

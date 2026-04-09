<template lang="pug">
  div.card(class="bg-[#24184a] rounded-[24px] overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-[1.02]")
    div(
      v-if="imageUrl"
      class="w-full relative aspect-square bg-[#1a103c]"
    )
      img(
        class="w-full h-full object-cover"
        :src="imageUrl"
        :alt="title"
      )
      div(
        v-if="$slots.badge"
        class="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white"
      )
        slot(name="badge")

    div(class="p-4 flex flex-col gap-1")
      h3(class="text-white font-semibold text-sm line-clamp-2") {{ title }}
      p(
        v-if="subtitle"
        class="text-white/60 text-xs"
      ) {{ subtitle }}
      slot
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  imageUrl?: string
}

defineProps<Props>()
</script>
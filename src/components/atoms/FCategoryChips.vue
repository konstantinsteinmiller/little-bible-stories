<script setup lang="ts">
interface CategoryItem {
  id: string | number
  label: string
  icon?: string
}

interface Props {
  items: CategoryItem[]
  modelValue?: string | number | null
  variant?: 'chips' | 'tabs'
}

withDefaults(defineProps<Props>(), {
  modelValue: null,
  variant: 'chips'
})

const emit = defineEmits(['update:modelValue', 'select'])

function onSelect(item: CategoryItem) {
  emit('update:modelValue', item.id)
  emit('select', item)
}
</script>

<template lang="pug">
  //- CHIPS variant
  div(
    v-if="variant === 'chips'"
    class="f-chips flex flex-wrap gap-2 md:gap-3"
  )
    button(
      v-for="item in items"
      :key="item.id"
      type="button"
      @click="onSelect(item)"
      :class="[\
        'f-chip group relative inline-flex items-center gap-2 cursor-pointer select-none touch-manipulation rounded-xl px-3 py-2 md:px-4 md:py-2 transition-all duration-150 ease-out hover:scale-[103%] active:scale-[97%]',\
        modelValue === item.id ? 'is-active' : 'is-inactive'\
      ]"
    )
      span(
        v-if="item.icon"
        class="f-chip-icon text-base md:text-lg leading-none"
      ) {{ item.icon }}
      span(class="f-chip-label text-xs md:text-sm font-semibold text-white whitespace-nowrap") {{ item.label }}

  //- TABS variant
  div(
    v-else
    class="f-tabs relative flex items-center gap-5 md:gap-7 border-b border-white/10"
  )
    button(
      v-for="item in items"
      :key="item.id"
      type="button"
      @click="onSelect(item)"
      :class="[\
        'f-tab relative cursor-pointer select-none touch-manipulation pb-3 pt-2 transition-colors duration-150 ease-out',\
        modelValue === item.id ? 'is-active text-white' : 'is-inactive text-white/45 hover:text-white/75'\
      ]"
    )
      span(class="text-sm md:text-base font-semibold tracking-wide") {{ item.label }}
      //- underline indicator for active tab
      span(
        v-if="modelValue === item.id"
        class="f-tab-underline absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-white"
      )
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent

// ---------- Chips ----------
.f-chip
  background-color: #1a0f33
  border: 1px solid rgba(196, 168, 255, 0.18)
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.4)

  &.is-inactive:hover
    border-color: rgba(196, 168, 255, 0.35)
    background-color: #221442

  &.is-active
    border: 1px solid transparent
    background-image: linear-gradient(#1a0f33, #1a0f33), linear-gradient(135deg, #ff5fa2 0%, #8c5aff 50%, #50aaff 100%)
    background-origin: border-box
    background-clip: padding-box, border-box
    box-shadow: 0 0 18px -2px rgba(140, 90, 255, 0.55), 0 0 32px -8px rgba(255, 95, 162, 0.35)

// ---------- Tabs ----------
.f-tab
  background: transparent
  border: none

.f-tab-underline
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5)
</style>

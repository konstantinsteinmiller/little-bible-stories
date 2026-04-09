<script setup lang="ts">
type IconName = 'home' | 'browse' | 'library' | 'profile'

interface NavItem {
  id: string | number
  label: string
  icon: IconName
}

interface Props {
  items: NavItem[]
  modelValue: string | number
  accent?: 'purple' | 'gold'
}

withDefaults(defineProps<Props>(), {
  accent: 'purple'
})

const emit = defineEmits(['update:modelValue', 'select'])

function selectItem(item: NavItem) {
  emit('update:modelValue', item.id)
  emit('select', item)
}
</script>

<template lang="pug">
  nav(
    :class="[\
      'f-bottom-nav fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]',\
      accent === 'gold' ? 'accent-gold' : 'accent-purple'\
    ]"
  )
    div(class="f-bottom-nav-inner relative mx-auto max-w-md flex items-center justify-around gap-1 rounded-3xl px-2 py-2")
      button(
        v-for="item in items"
        :key="item.id"
        type="button"
        @click="selectItem(item)"
        :aria-label="item.label"
        :aria-current="modelValue === item.id ? 'page' : undefined"
        :class="[\
          'f-nav-btn group relative flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer select-none touch-manipulation rounded-2xl py-2 px-1 transition-all duration-200 ease-out',\
          modelValue === item.id ? 'is-active' : 'is-inactive'\
        ]"
      )
        //- glow halo (active only)
        span(
          v-if="modelValue === item.id"
          class="f-nav-glow pointer-events-none absolute inset-x-3 -bottom-1 h-8 rounded-full blur-xl"
        )

        //- icon: solid (active) vs outline (inactive)
        span(class="relative z-10 inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7")
          //- HOME
          template(v-if="item.icon === 'home'")
            svg(
              v-if="modelValue === item.id"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-full h-full"
            )
              path(d="M11.3 2.7a1 1 0 0 1 1.4 0l8.6 8.6a1 1 0 0 1-1.4 1.4l-.9-.9V20a2 2 0 0 1-2 2h-3v-6h-4v6H7a2 2 0 0 1-2-2v-8.2l-.9.9a1 1 0 0 1-1.4-1.4l8.6-8.6Z")
            svg(
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              path(d="M3 11 12 3l9 8")
              path(d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10")

          //- BROWSE (compass)
          template(v-else-if="item.icon === 'browse'")
            svg(
              v-if="modelValue === item.id"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-full h-full"
            )
              path(d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.2 6.5-2.4 5.3a1 1 0 0 1-.5.5l-5.3 2.4a.5.5 0 0 1-.66-.66l2.4-5.3a1 1 0 0 1 .5-.5l5.3-2.4a.5.5 0 0 1 .66.66Z")
            svg(
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              circle(cx="12" cy="12" r="10")
              polygon(points="16.2 7.8 13.8 13.8 7.8 16.2 10.2 10.2 16.2 7.8")

          //- LIBRARY (stacked books)
          template(v-else-if="item.icon === 'library'")
            svg(
              v-if="modelValue === item.id"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-full h-full"
            )
              rect(x="3" y="4" width="3.5" height="16" rx="1")
              rect(x="8" y="4" width="3.5" height="16" rx="1")
              path(d="M14.6 6.2 17 5.4a1 1 0 0 1 1.27.64l4.1 12.3a1 1 0 0 1-.63 1.27l-2.4.8a1 1 0 0 1-1.27-.63l-4.1-12.3a1 1 0 0 1 .63-1.28Z")
            svg(
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              rect(x="3" y="4" width="4" height="16" rx="1")
              rect(x="9" y="4" width="4" height="16" rx="1")
              path(d="m15.5 6.5 2.4-.8a1 1 0 0 1 1.27.63l4.1 12.3")
              path(d="m23.27 18.6-2.4.8a1 1 0 0 1-1.27-.63L15.5 6.5")

          //- PROFILE
          template(v-else-if="item.icon === 'profile'")
            svg(
              v-if="modelValue === item.id"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-full h-full"
            )
              circle(cx="12" cy="8" r="4")
              path(d="M4 21a8 8 0 0 1 16 0Z")
            svg(
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-full h-full"
            )
              circle(cx="12" cy="8" r="4")
              path(d="M4 21a8 8 0 0 1 16 0")

        //- label
        span(
          :class="[\
            'relative z-10 text-[10px] md:text-[11px] font-semibold tracking-wide transition-colors duration-200',\
            modelValue === item.id ? 'f-nav-label-active' : 'text-white/55'\
          ]"
        ) {{ item.label }}
</template>

<style scoped lang="sass">
button
  -webkit-tap-highlight-color: transparent
  background: transparent
  border: none

.f-bottom-nav
  // gradient mask so the bar floats over content
  background: linear-gradient(to top, rgba(12, 7, 32, 0.95), rgba(12, 7, 32, 0))

.f-bottom-nav-inner
  background-color: rgba(26, 15, 51, 0.85)
  backdrop-filter: blur(16px) saturate(140%)
  -webkit-backdrop-filter: blur(16px) saturate(140%)
  border: 1px solid rgba(196, 168, 255, 0.12)
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4), 0 -2px 24px -4px rgba(0, 0, 0, 0.6), 0 12px 32px -10px rgba(0, 0, 0, 0.7)

.f-nav-btn
  color: rgba(255, 255, 255, 0.55)

  &.is-inactive:hover
    color: rgba(255, 255, 255, 0.85)

// ---------- Purple accent ----------
.accent-purple
  .f-nav-btn.is-active
    color: #c4a8ff

  .f-nav-label-active
    color: #c4a8ff
    text-shadow: 0 0 12px rgba(140, 90, 255, 0.6)

  .f-nav-glow
    background: radial-gradient(closest-side, rgba(140, 90, 255, 0.7), rgba(140, 90, 255, 0))

// ---------- Gold accent ----------
.accent-gold
  .f-nav-btn.is-active
    color: #f7c948

  .f-nav-label-active
    color: #f7c948
    text-shadow: 0 0 12px rgba(247, 201, 72, 0.55)

  .f-nav-glow
    background: radial-gradient(closest-side, rgba(247, 201, 72, 0.65), rgba(247, 201, 72, 0))
</style>

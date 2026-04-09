<script setup lang="ts">
import { ref } from 'vue'

// C- components
import CButton from '@/components/atoms/CButton.vue'
import CCard from '@/components/atoms/CCard.vue'
import CTabs from '@/components/atoms/CTabs.vue'
import CSelectableCard from '@/components/atoms/CSelectableCard.vue'
import CPlayer from '@/components/atoms/CPlayer.vue'

// F- components
import FButton from '@/components/atoms/FButton.vue'
import FCard from '@/components/atoms/FCard.vue'
import FCategoryChips from '@/components/atoms/FCategoryChips.vue'
import FAudioPlayer from '@/components/atoms/FAudioPlayer.vue'
import FSelect from '@/components/atoms/FSelect.vue'
import FBottomNav from '@/components/atoms/FBottomNav.vue'
import FSwitch from '@/components/atoms/FSwitch.vue'
import FTabs from '@/components/atoms/FTabs.vue'
import FIconButton from '@/components/atoms/FIconButton.vue'

// Demo state
const cTab = ref('one')
const cSelected = ref(false)
const cPlaying = ref(false)
const cTime = ref(42)
const cDuration = ref(180)

const fChip = ref('creativity')
const fTab = ref('all')
const fPlaying = ref(false)
const fTime = ref(72)
const fDuration = ref(222)
const fSelectValue = ref('aria')
const fNav = ref('home')
const fSwitch = ref(true)
const fTabValue = ref('a')

const cTabs = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'three', label: 'Three' }
]

const fChips = [
  { id: 'creativity', label: 'Creativity', icon: '🎨' },
  { id: 'vocab', label: 'Vocabulary', icon: '📚' },
  { id: 'logic', label: 'Logic', icon: '🧩' }
]

const fTabsList = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'top', label: 'Top' }
]

const fSelectOptions = [
  { value: 'aria', label: 'Aria', subLabel: 'Warm · English', icon: '🎙️' },
  { value: 'kai', label: 'Kai', subLabel: 'Calm · English', icon: '🌊' },
  { value: 'nova', label: 'Nova', subLabel: 'Bright · English', icon: '✨' }
]

const fNavItems = [
  { id: 'home', label: 'Home', icon: 'home' as const },
  { id: 'browse', label: 'Browse', icon: 'browse' as const },
  { id: 'library', label: 'Library', icon: 'library' as const },
  { id: 'profile', label: 'Profile', icon: 'profile' as const }
]

const fTabOptions = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' }
]

const cComponentNames = ['CButton', 'CCard', 'CTabs', 'CSelectableCard', 'CPlayer']
const fComponentNames = [
  'FButton', 'FCard', 'FCategoryChips', 'FAudioPlayer', 'FSelect',
  'FBottomNav', 'FSwitch', 'FTabs', 'FIconButton'
]
</script>

<template lang="pug">
  div(class="ds-page min-h-screen w-full bg-[#0c0720] text-white px-4 py-8 md:px-8 md:py-12 pb-32")
    //- Header
    header(class="max-w-6xl mx-auto mb-8")
      h1(class="text-2xl md:text-4xl font-black tracking-tight") Design System
      p(class="mt-1 text-sm md:text-base text-white/55") Atomic component catalogue

    //- ===========================================================
    //- ROW 1 — C- components index
    //- ===========================================================
    section(class="max-w-6xl mx-auto mb-4")
      h2(class="text-lg md:text-xl font-bold text-white/80 mb-2") C- Components
      div(class="flex flex-wrap gap-2")
        span(
          v-for="name in cComponentNames"
          :key="name"
          class="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs md:text-sm font-mono text-white/85"
        ) {{ name }}

    section(class="max-w-6xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-4")
      //- CButton
      div(class="ds-card")
        div(class="ds-card-title") CButton
        div(class="flex flex-wrap items-center gap-3")
          CButton(variant="primary") Primary
          CButton(variant="premium") Premium
          CButton(variant="outline") Outline
          CButton(variant="ghost") Ghost

      //- CCard
      div(class="ds-card")
        div(class="ds-card-title") CCard
        CCard(title="Sample Card" subtitle="A short subtitle")

      //- CTabs
      div(class="ds-card")
        div(class="ds-card-title") CTabs
        CTabs(v-model="cTab" :tabs="cTabs")

      //- CSelectableCard
      div(class="ds-card")
        div(class="ds-card-title") CSelectableCard
        CSelectableCard(
          label="Toggle me"
          icon="✨"
          :selected="cSelected"
          @update:selected="cSelected = $event"
        )

      //- CPlayer
      div(class="ds-card md:col-span-2")
        div(class="ds-card-title") CPlayer
        CPlayer(
          :is-playing="cPlaying"
          :current-time="cTime"
          :duration="cDuration"
          @update:is-playing="cPlaying = $event"
          @skip-back="cTime = Math.max(0, cTime - 15)"
          @skip-forward="cTime = Math.min(cDuration, cTime + 15)"
        )

    //- ===========================================================
    //- ROW 2 — F- components index
    //- ===========================================================
    section(class="max-w-6xl mx-auto mb-4")
      h2(class="text-lg md:text-xl font-bold text-white/80 mb-2") F- Components
      div(class="flex flex-wrap gap-2")
        span(
          v-for="name in fComponentNames"
          :key="name"
          class="inline-flex items-center rounded-full border border-[#c4a8ff]/25 bg-[#1a0f33] px-3 py-1 text-xs md:text-sm font-mono text-white/85"
        ) {{ name }}

    section(class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4")
      //- FButton
      div(class="ds-card")
        div(class="ds-card-title") FButton
        div(class="flex flex-wrap items-center gap-3")
          FButton(type="primary") Primary
          FButton(type="secondary") Secondary
          FButton(type="icon")
            span(class="text-lg") ★

      //- FCard
      div(class="ds-card")
        div(class="ds-card-title") FCard
        div(class="flex justify-center")
          FCard(title="Whispering Pines" subtext="3 min")
            template(#image)
              div(class="absolute inset-0 bg-gradient-to-br from-[#3a1a6a] via-[#1a0f33] to-[#0c0720]")

      //- FCategoryChips — chips
      div(class="ds-card")
        div(class="ds-card-title") FCategoryChips · chips
        FCategoryChips(v-model="fChip" :items="fChips")

      //- FCategoryChips — tabs
      div(class="ds-card")
        div(class="ds-card-title") FCategoryChips · tabs
        FCategoryChips(v-model="fTab" variant="tabs" :items="fTabsList")

      //- FAudioPlayer
      div(class="ds-card md:col-span-2")
        div(class="ds-card-title") FAudioPlayer
        FAudioPlayer(
          :is-playing="fPlaying"
          :current-time="fTime"
          :duration="fDuration"
          @toggle="fPlaying = !fPlaying"
          @rewind="fTime = Math.max(0, fTime - 15)"
          @forward="fTime = Math.min(fDuration, fTime + 15)"
          @seek="fTime = $event"
        )

      //- FSelect
      div(class="ds-card md:col-span-2")
        div(class="ds-card-title") FSelect
        FSelect(
          v-model="fSelectValue"
          label="Voice"
          accent="purple"
          :options="fSelectOptions"
        )

      //- FSwitch
      div(class="ds-card")
        div(class="ds-card-title") FSwitch
        FSwitch(:model-value="fSwitch" @update:model-value="fSwitch = $event")

      //- FTabs
      div(class="ds-card")
        div(class="ds-card-title") FTabs
        FTabs(v-model="fTabValue" :options="fTabOptions")

      //- FIconButton
      div(class="ds-card")
        div(class="ds-card-title") FIconButton
        div(class="flex items-center gap-3")
          FIconButton(icon="close")
          FIconButton(icon="left")
          FIconButton(icon="right")

      //- FBottomNav (preview note)
      div(class="ds-card")
        div(class="ds-card-title") FBottomNav
        p(class="text-xs text-white/55") Rendered fixed at the bottom of the page ↓

    //- Live FBottomNav preview at the bottom of the page
    FBottomNav(v-model="fNav" :items="fNavItems" accent="purple")
</template>

<style scoped lang="sass">
.ds-page
  background: radial-gradient(1200px 600px at 50% -10%, rgba(140, 90, 255, 0.15), transparent 60%), #0c0720

.ds-card
  position: relative
  border-radius: 20px
  padding: 16px 18px
  background-color: rgba(26, 15, 51, 0.65)
  border: 1px solid rgba(196, 168, 255, 0.10)
  backdrop-filter: blur(8px)
  box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.6)

.ds-card-title
  font-size: 11px
  font-weight: 700
  letter-spacing: 0.08em
  text-transform: uppercase
  color: rgba(255, 255, 255, 0.55)
  margin-bottom: 12px
</style>

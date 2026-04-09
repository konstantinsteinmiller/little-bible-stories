<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import useUser from '@/use/useUser'
import { mobileCheck } from '@/utils/function'

const { userSoundVolume, userMusicVolume, setSettingValue } = useUser()

const isMuted = computed(() => userMusicVolume.value === 0 && userSoundVolume.value === 0)

// Store previous volumes to restore them when unmuting
const prevMusicVol = ref(userMusicVolume.value || 0.15)
const prevSoundVol = ref(userSoundVolume.value || 0.7)

/**
 * Apply a mute state to the local volume settings without touching the
 * CrazyGames SDK. Used both by the click handler and by the SDK→app
 * listener so external mute toggles (e.g. CrazyGames iframe chrome) flow
 * back into the in-game audio.
 */
const applyMute = (muted: boolean) => {
  if (muted && !isMuted.value) {
    prevMusicVol.value = userMusicVolume.value
    prevSoundVol.value = userSoundVolume.value
    setSettingValue('music', 0)
    setSettingValue('sound', 0)
  } else if (!muted && isMuted.value) {
    setSettingValue('music', prevMusicVol.value || 0.25)
    setSettingValue('sound', prevSoundVol.value || 0.7)
  }
}

const toggleMute = () => {
  const next = !isMuted.value
  applyMute(next)
}

onMounted(() => {
})
onUnmounted(() => {
})
</script>

<template lang="pug">
  div.flex.flex-col.items-end.gap-1
    button.p-2.rounded-full.backdrop-blur-sm.transition-all.cursor-pointer(
      v-if="!mobileCheck()"
      class="bg-black/20 hover:bg-black/40 active:scale-95 pointer-events-auto"
      @click="toggleMute"
    )
      span.text-2xl {{ isMuted ? '🔇': '🔊' }}
</template>

<style scoped lang="sass">

</style>
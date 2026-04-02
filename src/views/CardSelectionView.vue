<template lang="pug">
  div(
    class="fixed inset-0 flex flex-col items-center overflow-hidden bg-repeat select-none bg-[url('/images/board/papyrus-tile_128x128.webp')]"
    style="padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);"
  )

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useResizeObserver } from '@vueuse/core'
import type { GameCard } from '@/types/game'
import FButton from '@/components/atoms/FButton'
import FIconButton from '@/components/atoms/FIconButton'
import { isDbInitialized, isCampaignTest } from '@/use/useMatch'
import useModels, { modelImgPath } from '@/use/useModels'
import useUser, { isMobileLandscape } from '@/use/useUser'

const { setSettingValue, userHand, userCollection } = useUser()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const {} = useModels()

onMounted(() => {
})

onUnmounted(() => {
})


</script>

<style lang="sass" scoped></style>
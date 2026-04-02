<template lang="pug">
  div.h-screen.w-screen.bg-slate-900.text-white.overflow-hidden.flex.flex-col.items-center.justify-between.p-1.touch-none(
    class="inset-0 bg-[url('/images/board/papyrus-tile_128x128.webp')] bg-repeat select-none landscape:p-0.5 md:p-4"
    data-darkmode-ignore="true"
    :style="shakeStyle"
  )
    GameOverModal(
      :is-open="isGameOver"
      :scores="scores"
      :is-board-full="isBoardFull"
      :complete-node="completeNode"
      :save-campaign="saveCampaign"
      @reset="onContinue"
    )
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useMatch } from '@/use/useMatch'
import { useNPC } from '@/use/useNPC'
import { useInteraction } from '@/use/useInteraction'
import GameOverModal from '@/components/organisms/GameOverModal'
import useUser from '@/use/useUser'
import useCampaign from '@/use/useCampaign'
import { useScreenshake } from '@/use/useScreenshake'

const {
  turn,
  resetGame
} = useMatch()
const { userDifficulty, userSkipRulesModal } = useUser()
// const {
//   selectedCardId,
//   errorSlot,
//   handleDragStart,
//   handleDrop,
//   handleTapSelect,
//   handleSlotTap
// } = useInteraction(playerHand, placeCard)
const { activeNode, completeNode, saveCampaign, hasWonAnyGame } = useCampaign()
const { shakeStyle } = useScreenshake()

const {} = useMatch()
const showDialogue = ref(false)
const isInitialDialogueDone = ref(true)
const showRules = ref(true)

onMounted(() => {
  resetGame(activeNode)
})

const isGameOver = ref<boolean>(false)
const showTradeModal = ref<boolean>(false)

// watch(isBoardFull, () => {
//   if (isBoardFull.value) {
//     setTimeout(() => {
//       if (isBoardFull.value) {
//         isGameOver.value = true
//       }
//     }, 550)
//   } else {
//     showRules.value = !userSkipRulesModal.value
//     isGameOver.value = false
//     showTradeModal.value = false
//   }
// }, { immediate: true })

const onContinue = () => {
  showRules.value = !userSkipRulesModal.value
  isGameOver.value = false
  resetGame(activeNode)
}
</script>

<style lang="sass" scoped></style>
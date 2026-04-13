<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SCard from '@/components/atoms/SCard.vue'
import SBottomNav from '@/components/atoms/SBottomNav.vue'
import useModels from '@/use/useModels'

const { t } = useI18n()
const router = useRouter()
const { BOOK_SERIES, getBooksOfSeries, getSeriesOfBook, lastReadBook } = useModels()

const navItems = [
  { id: 'home', label: '', icon: 'home' as const },
  { id: 'awards', label: '', icon: 'awards' as const },
  { id: 'profile', label: '', icon: 'profile' as const }
]
const activeNav = computed({
  get: () => 'home',
  set: (id: string) => onNav(id)
})

function onNav(id: string) {
  if (id === 'home') router.push({ name: 'app-main' })
  if (id === 'awards') router.push({ name: 'app-awards' })
  if (id === 'profile') router.push({ name: 'app-profile' })
}

function openSeries(seriesId: string) {
  router.push({ name: 'app-series', params: { seriesId } })
}

function openBook(bookId: string) {
  router.push({ name: 'app-book', params: { bookId } })
}

const lastReadSeries = computed(() => {
  if (!lastReadBook.value) return null
  return getSeriesOfBook(lastReadBook.value.id) ?? null
})
</script>

<template lang="pug">
  div(class="app-page min-h-screen w-full")
    //- Header (respects safe area top)
    header(class="px-5 pb-2 pt-[max(env(safe-area-inset-top),1.25rem)]")
      div(class="max-w-2xl mx-auto")
        p(class="text-xs md:text-sm font-bold uppercase tracking-wider text-white/75") {{ t('welcome') }}
        h1(class="text-2xl md:text-3xl font-black text-white") {{ t('appTitle') }}

    //- Last read
    section(
      v-if="lastReadBook"
      class="px-5 mt-4"
    )
      div(class="max-w-2xl mx-auto")
        h2(class="mb-2 text-[11px] md:text-xs font-black uppercase tracking-wider text-white/85") {{ t('lastRead') }}
        button(
          type="button"
          @click="openBook(lastReadBook.id)"
          class="last-read-card w-full text-left flex items-center gap-3 rounded-2xl bg-white/95 px-3 py-3 shadow-md hover:scale-[101%] active:scale-[99%] transition-transform"
        )
          div(
            class="last-read-cover relative shrink-0 w-16 h-20 rounded-xl overflow-hidden"
            :style="{ background: lastReadBook.cover || 'linear-gradient(135deg,#E67E22,#F1C40F)' }"
          )
            img(
              v-if="lastReadBook.previewImage || lastReadBook.coverImage"
              :src="lastReadBook.previewImage || lastReadBook.coverImage"
              :alt="t(lastReadBook.title)"
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            )
          div(class="flex-1 min-w-0")
            p(class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#E67E22] truncate") {{ lastReadSeries?.name || t('continueReading') }}
            p(class="text-base md:text-lg font-black text-[#2C3E50] truncate") {{ t(lastReadBook.title) }}
            p(class="text-xs text-[#7F8C8D] truncate") {{ lastReadBook.author }}
          div(class="shrink-0 w-9 h-9 rounded-full bg-[#E67E22] text-white flex items-center justify-center")
            svg(viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 translate-x-[1px]")
              path(d="M8 5v14l11-7z")

    //- Series sections
    section(class="px-5 mt-6")
      div(class="max-w-2xl mx-auto flex flex-col gap-7")
        div(
          v-for="series in BOOK_SERIES"
          :key="series.id"
        )
          //- Series header (clickable to open series detail)
          button(
            type="button"
            @click="openSeries(series.id)"
            class="w-full flex items-center justify-between mb-2 group"
          )
            div(class="text-left")
              p(class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/70") {{ t('bookSeries') }}
              h2(class="text-xl md:text-2xl font-black text-white group-hover:text-[#F1C40F] transition-colors") {{ series.name }}
            span(class="text-white/80 text-sm font-bold flex items-center gap-1")
              | {{ t('seeAll') }}
              svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4")
                path(d="m9 6 6 6-6 6")

          //- Horizontal scroll of books
          div(class="-mx-5 px-5 overflow-x-auto pb-1 scrollbar-hide")
            div(class="flex gap-3")
              SCard(
                v-for="book in getBooksOfSeries(series.id)"
                :key="book.id"
                :title="t(book.title)"
                :subtext="book.author"
                class="w-[160px] md:w-[180px] shrink-0"
                @click="openBook(book.id)"
              )
                template(#image)
                  div(
                    class="absolute inset-0"
                    :style="{ background: book.cover || 'linear-gradient(135deg,#3498DB,#9B59B6)' }"
                  )
                  img(
                    v-if="book.previewImage || book.coverImage"
                    :src="book.previewImage || book.coverImage"
                    :alt="t(book.title)"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  )

    //- spacer for fixed bottom nav
    div(class="h-32")

    SBottomNav(:model-value="activeNav" :items="navItems" accent="orange" @update:model-value="onNav")
</template>

<style scoped lang="sass">
.app-page
  background: radial-gradient(1200px 600px at 50% -10%, rgba(241, 196, 15, 0.35), transparent 60%), linear-gradient(180deg, #3498DB 0%, #1F6FA8 100%)

.scrollbar-hide
  &::-webkit-scrollbar
    display: none
  scrollbar-width: none
</style>

<i18n>
en:
  appTitle: "Little Bible Stories"
  welcome: "Welcome back"
  lastRead: "Continue listening"
  continueReading: "Continue reading"
  bookSeries: "Book series"
  seeAll: "See all"
de:
  appTitle: "Kanaan Geschichten"
  welcome: "Willkommen zurück"
  lastRead: "Weiterhören"
  continueReading: "Weiterlesen"
  bookSeries: "Buchreihe"
  seeAll: "Alle ansehen"
</i18n>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AButton from '@/components/atoms/AButton.vue'
import AChip from '@/components/atoms/AChip.vue'
import ABreadcrumbs from '@/components/atoms/ABreadcrumbs.vue'
import ABottomNav from '@/components/atoms/ABottomNav.vue'
import APager from '@/components/atoms/APager.vue'
import AAudioPlayer from '@/components/atoms/AAudioPlayer.vue'
import AIconography from '@/components/atoms/AIconography.vue'
import useModels from '@/use/useModels'
import { prependBaseUrl } from '@/utils/function.ts'
import { snapshotAt } from '@/utils/karaoke'

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const {
  getBook, getSeriesOfBook, isInWatchList, toggleWatchList, setLastRead,
  getPlaybackState, setPlaybackState
} = useModels()

const bookId = computed(() => String(route.params.bookId))
const book = computed(() => getBook(bookId.value))
const series = computed(() => (book.value ? getSeriesOfBook(book.value.id) : undefined))
const inWatchList = computed(() => (book.value ? isInWatchList(book.value.id) : false))

type ViewMode = 'detail' | 'listen' | 'read'
const mode = ref<ViewMode>('detail')

const audioEl = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
let rafId = 0

const audioSrc = computed(() => {
  if (!book.value) return ''
  const lang = locale.value as 'en' | 'de'
  return prependBaseUrl(book.value.audio[lang] || book.value.audio.en)
})

function ensureAudio() {
  if (!audioEl.value) return
  audioEl.value.addEventListener('timeupdate', onTimeUpdate)
  audioEl.value.addEventListener('loadedmetadata', onLoadedMeta)
  audioEl.value.addEventListener('ended', onEnded)
}

function onTimeUpdate() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}

// `audio.currentTime` is already a sub-ms-accurate getter — just read it
// each frame. The previous version added `performance.now()`-based delta
// on top, which over-predicted and then snapped back on each timeupdate
// event, causing the karaoke highlight to jitter forward and back.
function tickRaf() {
  if (!isPlaying.value || !audioEl.value) {
    rafId = 0
    return
  }
  currentTime.value = audioEl.value.currentTime
  rafId = requestAnimationFrame(tickRaf)
}

function startRaf() {
  if (rafId) return
  rafId = requestAnimationFrame(tickRaf)
}

function stopRaf() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function onLoadedMeta() {
  if (!audioEl.value) return
  duration.value = audioEl.value.duration || 0
  // Restore saved playback position once metadata is available.
  if (pendingResumeTime > 0) {
    const t0 = Math.min(Math.max(0, pendingResumeTime), Math.max(0, duration.value - 0.5))
    audioEl.value.currentTime = t0
    currentTime.value = t0
    pendingResumeTime = 0
  }
}

let pendingResumeTime = 0

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
  stopRaf()
}

function togglePlay() {
  if (!audioEl.value) {
    isPlaying.value = !isPlaying.value
    return
  }
  if (isPlaying.value) {
    audioEl.value.pause()
    isPlaying.value = false
    stopRaf()
  } else {
    audioEl.value.play().then(() => {
      isPlaying.value = true
      startRaf()
    }).catch(() => {
      isPlaying.value = !isPlaying.value
    })
  }
}

function rewind(seconds = 15) {
  if (!audioEl.value) return
  audioEl.value.currentTime = Math.max(0, audioEl.value.currentTime - seconds)
}

function forward(seconds = 15) {
  if (!audioEl.value) return
  audioEl.value.currentTime = Math.min(duration.value || 0, audioEl.value.currentTime + seconds)
}

function seek(seconds: number) {
  if (!audioEl.value) return
  audioEl.value.currentTime = seconds
  currentTime.value = seconds
}

function savePlayback() {
  if (!book.value) return
  setPlaybackState(book.value.id, {
    time: currentTime.value || 0,
    page: selectedPage.value,
    audioSrc: audioSrc.value
  })
}

onMounted(() => {
  if (book.value) {
    setLastRead(book.value.id)
    const saved = getPlaybackState(book.value.id)
    if (saved) {
      if (typeof saved.time === 'number' && saved.time > 0) pendingResumeTime = saved.time
      if (typeof saved.page === 'number' && saved.page > 0) selectedPage.value = saved.page
    }
  }
  ensureAudio()
  loadAlignment(audioSrc.value)
})
onUnmounted(() => {
  savePlayback()
  stopRaf()
  if (audioEl.value) {
    audioEl.value.pause()
    audioEl.value.removeEventListener('timeupdate', onTimeUpdate)
    audioEl.value.removeEventListener('loadedmetadata', onLoadedMeta)
    audioEl.value.removeEventListener('ended', onEnded)
  }
})
watch(audioSrc, (src) => {
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  loadAlignment(src)
})

// ----- Subtitle / karaoke text flow -----
// Two modes:
//  (1) alignment JSON present next to the audio file → exact word timings.
//  (2) no alignment → fallback: uniform-within-sentence timing scoped to the
//      first non-empty page's text so sentences don't fly by at 10x rate.

interface AlignedWord {
  text: string;
  start: number;
  end: number
}

interface AlignedSentence {
  text: string;
  start: number;
  end: number;
  words: AlignedWord[]
}

interface Alignment {
  duration: number
  sentences: AlignedSentence[]
}

const alignment = ref<Alignment | null>(null)

async function loadAlignment(src: string) {
  alignment.value = null
  if (!src) return
  const url = src.replace(/\.(ogg|mp3|m4a|wav)(\?.*)?$/i, '.align.json$2')
  if (url === src) return
  try {
    const res = await fetch(url)
    if (!res.ok) return
    const json = await res.json()
    if (json && Array.isArray(json.sentences) && json.sentences.length) {
      alignment.value = { duration: json.duration || 0, sentences: json.sentences }
    }
  } catch {
    /* no alignment available — fallback path handles it */
  }
}

// Fallback text source: first page with non-empty text. Scoping to one page
// keeps the per-word duration realistic against the actual audio length.
interface FallbackSentence {
  words: string[];
  startWord: number
}

const fallbackSentences = computed<FallbackSentence[]>(() => {
  const pages = book.value?.content
  if (!pages || !pages.length) return []
  const list: FallbackSentence[] = []
  let globalWord = 0
  for (const p of pages) {
    const raw = t(p.text) || ''
    if (!raw.trim()) continue
    const sentenceStrings = raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []
    for (const s of sentenceStrings) {
      const trimmed = s.trim()
      if (!trimmed) continue
      const words = trimmed.split(/\s+/)
      list.push({ words, startWord: globalWord })
      globalWord += words.length
    }
    if (list.length) break // only first page with content
  }
  return list
})

// Current sentence / word using alignment if available, else fallback.
// The alignment branch delegates to the pure helpers in @/utils/karaoke so
// the behavior is covered by tests/karaoke.test.ts.
const karaoke = computed(() => {
  const t0 = currentTime.value
  if (alignment.value) {
    return snapshotAt(alignment.value, t0)
  }
  // Fallback: uniform timing scoped to the first non-empty page's text so
  // sentences don't fly by at an unrealistic rate.
  const fb = fallbackSentences.value
  if (!fb.length || !duration.value) {
    return { sentenceIndex: 0, activeWord: 0, currentWords: [], nextWords: [], showNext: false }
  }
  const totalWords = fb.reduce((n, s) => n + s.words.length, 0) || 1
  const ratio = Math.min(1, t0 / duration.value)
  const globalWord = Math.floor(ratio * totalWords)
  let sentenceIndex = fb.length - 1
  for (let i = 0; i < fb.length; i++) {
    const s = fb[i]
    if (s && globalWord < s.startWord + s.words.length) {
      sentenceIndex = i
      break
    }
  }
  const sent = fb[sentenceIndex]
  const perWord = duration.value / totalWords
  const sentStart = sent ? sent.startWord * perWord : 0
  const local = Math.max(0, t0 - sentStart)
  const activeWord = sent
    ? Math.max(0, Math.min(sent.words.length - 1, Math.floor(local / perWord)))
    : 0
  const next = fb[sentenceIndex + 1]
  const denom = Math.max(1, (sent?.words.length || 1) - 1)
  const showNext = !!(sent && next) && activeWord / denom >= 0.6
  return {
    sentenceIndex,
    activeWord,
    currentWords: sent?.words || [],
    nextWords: next?.words || [],
    showNext
  }
})

const currentSentenceIndex = computed(() => karaoke.value.sentenceIndex)
const activeWordInSentence = computed(() => karaoke.value.activeWord)
const currentSentence = computed(() =>
  karaoke.value.currentWords.length ? { words: karaoke.value.currentWords } : null
)
const nextSentence = computed(() =>
  karaoke.value.nextWords.length ? { words: karaoke.value.nextWords } : null
)
const showNextSentence = computed(() => karaoke.value.showNext)

// ----- Smooth karaoke overlay -----
// Per-word start/end for the current sentence, used to interpolate the
// position of a box overlay that glides linearly from one word to the next
// at exactly the pace of the audio. No per-word background toggle, no
// discrete jumps — the box moves every frame.
const currentWordTimings = computed<Array<{ start: number; end: number }>>(() => {
  const si = currentSentenceIndex.value
  if (alignment.value) {
    const s = alignment.value.sentences[si]
    return s ? s.words.map(w => ({ start: w.start, end: w.end })) : []
  }
  const fb = fallbackSentences.value
  if (!fb.length || !duration.value) return []
  const totalWords = fb.reduce((n, s) => n + s.words.length, 0) || 1
  const perWord = duration.value / totalWords
  const sent = fb[si]
  if (!sent) return []
  return sent.words.map((_, i) => ({
    start: (sent.startWord + i) * perWord,
    end: (sent.startWord + i + 1) * perWord
  }))
})

const subtitlesRef = ref<HTMLDivElement | null>(null)
const wordSpans = ref<(HTMLElement | null)[]>([])

function setWordRef(i: number, el: any) {
  wordSpans.value[i] = (el as HTMLElement) || null
}

// Bump on resize / sentence change to invalidate the cached layout reads.
const layoutTick = ref(0)
watch(currentSentenceIndex, () => {
  wordSpans.value = []
  layoutTick.value++
})
watch(() => currentSentence.value?.words.length, () => {
  layoutTick.value++
})

interface BoxStyle {
  left: number
  top: number
  width: number
  height: number
  visible: boolean
}

const karaokeBox = computed<BoxStyle>(() => {
  // Reactivity anchor so resize / sentence flips invalidate the memoized
  // getBoundingClientRect reads below.
  void layoutTick.value
  const t0 = currentTime.value
  const times = currentWordTimings.value
  const spans = wordSpans.value
  const container = subtitlesRef.value
  if (!times.length || !spans.length || !container) {
    return { left: 0, top: 0, width: 0, height: 0, visible: false }
  }
  // Find the word whose [start, nextStart) contains t0 so we can lerp
  // smoothly from word i's position to word i+1's position over the real
  // pronunciation time.
  const first = times[0]
  if (!first) return { left: 0, top: 0, width: 0, height: 0, visible: false }
  let i = 0
  for (; i < times.length - 1; i++) {
    const nextT = times[i + 1]
    if (nextT && t0 < nextT.start) break
  }
  const curT = times[i]
  const cur = spans[i]
  if (!cur || !curT) return { left: 0, top: 0, width: 0, height: 0, visible: false }
  const cr = container.getBoundingClientRect()
  const a = cur.getBoundingClientRect()
  const base = {
    left: a.left - cr.left,
    top: a.top - cr.top,
    width: a.width,
    height: a.height
  }
  const nxt = spans[i + 1]
  const nxtT = times[i + 1]
  if (!nxt || !nxtT || i >= times.length - 1) {
    return { ...base, visible: t0 >= first.start - 0.05 }
  }
  const span = Math.max(0.05, nxtT.start - curT.start)
  const frac = Math.min(1, Math.max(0, (t0 - curT.start) / span))
  const eased = frac < 0.5 ? 2 * frac * frac : 1 - Math.pow(-2 * frac + 2, 2) / 2
  const b = nxt.getBoundingClientRect()
  const tgt = {
    left: b.left - cr.left,
    top: b.top - cr.top,
    width: b.width,
    height: b.height
  }
  return {
    left: base.left + (tgt.left - base.left) * eased,
    top: base.top + (tgt.top - base.top) * eased,
    width: base.width + (tgt.width - base.width) * eased,
    height: base.height,
    visible: t0 >= first.start - 0.05
  }
})

const karaokeBoxStyle = computed(() => {
  const b = karaokeBox.value
  return {
    transform: `translate3d(${b.left}px, ${b.top}px, 0)`,
    width: `${b.width}px`,
    height: `${b.height}px`,
    opacity: b.visible ? '1' : '0'
  }
})

function onWindowResize() {
  layoutTick.value++
}

onMounted(() => window.addEventListener('resize', onWindowResize))
onUnmounted(() => window.removeEventListener('resize', onWindowResize))
// Remeasure once DOM has flushed new word spans.
watch(currentSentence, () => {
  nextTick(() => {
    layoutTick.value++
  })
})

const navItems = computed(() => [
  { id: 'home', label: t('app.nav.home'), icon: 'home' as const },
  { id: 'series', label: t('app.nav.series'), icon: 'series' as const },
  { id: 'brush', label: t('app.nav.color'), icon: 'brush' as const },
  { id: 'profile', label: t('app.nav.profile'), icon: 'profile' as const }
])
const activeNav = computed<string | number>(() => {
  const name = String(route.name || '')
  if (name === 'app-main') return 'home'
  if (name === 'app-all-books' || name === 'app-book' || name === 'app-book-series') return 'series'
  if (name === 'app-awards') return 'brush'
  if (name === 'app-profile') return 'profile'
  return 'home'
})

function onNav(id: string | number) {
  if (id === 'home') router.push({ name: 'app-main' })
  if (id === 'series') router.push({ name: 'app-all-books' })
  if (id === 'profile') router.push({ name: 'app-profile' })
  if (id === 'brush') router.push({ name: 'app-awards' })
}

function goBack() {
  if (mode.value !== 'detail') {
    if (audioEl.value && isPlaying.value) {
      audioEl.value.pause()
      isPlaying.value = false
      stopRaf()
    }
    savePlayback()
    mode.value = 'detail'
    return
  }
  savePlayback()
  if (window.history.length > 1) router.back()
  else router.push({ name: 'app-all-books' })
}

function onToggleWatchList() {
  if (book.value) toggleWatchList(book.value.id)
}

function onListen() {
  mode.value = 'listen'
  setTimeout(() => {
    if (audioEl.value && !isPlaying.value) {
      audioEl.value.play().then(() => {
        isPlaying.value = true
        startRaf()
      }).catch(() => {
      })
    }
  }, 50)
}

function onRead() {
  mode.value = 'read'
}

function onDownload() {
  if (!book.value) return
  const lang = locale.value as 'en' | 'de'
  const src = prependBaseUrl(book.value.audio[lang] || book.value.audio.en)
  const a = document.createElement('a')
  a.href = src
  a.download = `${book.value.title}.mp3`
  a.click()
}

const selectedPage = ref(1)
const totalPages = computed(() => book.value?.content?.length || 0)
const currentPage = computed(() => {
  const pages = book.value?.content
  if (!pages || !pages.length) return { title: '', text: '' }
  const p = pages[Math.min(pages.length, Math.max(1, selectedPage.value)) - 1]
  if (!p) return { title: '', text: '' }
  return { title: t(p.title) || '', text: t(p.text) || '' }
})
watch(bookId, () => {
  selectedPage.value = 1
})
watch(selectedPage, () => savePlayback())
// Save every few seconds while listening so a hard close still resumes.
watch(currentTime, (v, prev) => {
  if (mode.value !== 'listen' || !isPlaying.value) return
  if (Math.floor(v / 3) !== Math.floor(prev / 3)) savePlayback()
})
console.log('book.coverImage: ', book.value, book?.value?.coverImage)
</script>

<template lang="pug">
  div(class="app-page min-h-screen w-full relative pb-32 pt-[max(env(safe-area-inset-top), 0rem)]")
    template(v-if="book")
      //- ===== Section 1: Hero image + back arrow =====
      div(class="hero relative w-full")
        div(class="hero-img relative w-full aspect-[16/9]")
          div(
            class="absolute inset-0"
            :style="{ background: book.cover || 'linear-gradient(135deg,#9560f4,#7e3af2)' }"
          )
          img(
            v-if="book.coverImage || book.previewImage"
            :src="book.coverImage || book.previewImage"
            :alt="t(book.title)"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          )
          span(class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25")

        button(
          type="button"
          @click="goBack"
          :aria-label="t('app.bookDetail.back') || 'Back'"
          class="back-btn absolute top-4 left-4 inline-flex items-center justify-center w-11 h-11 rounded-full"
        )
          svg(viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5")
            path(d="m15 18-6-6 6-6")

      //- ===== Detail mode =====
      template(v-if="mode === 'detail'")
        section(class="section-wrap mt-5")
          ABreadcrumbs(:label="series ? (series.name + ' · Band ' + (series.books?.indexOf(book.id) + 1 || 1)) : t('app.bookDetail.story')")
          h1(class="book-title mt-1 text-2xl md:text-3xl font-black leading-tight") {{ t(book.title) }}
          p(
            v-if="book.subtitle"
            class="book-subtitle mt-1 italic text-sm md:text-base"
          ) {{ t(book.subtitle) }}

          div(class="meta-row mt-3 flex items-center gap-2")
            template(v-for="(badge, i) in book.badges" :key="badge + i")
              AChip(:label="t(badge)")
            div(class="flex-1")
            button(
              type="button"
              @click="onToggleWatchList"
              :aria-label="inWatchList ? t('app.bookDetail.saved') : t('app.bookDetail.save')"
              class="heart-btn inline-flex items-center justify-center w-11 h-11 rounded-full"
              :class="{ 'is-active': inWatchList }"
            )
              AIconography(name="heart" :size="28")

        //- ===== Primary CTA =====
        section(class="section-wrap mt-4")
          AButton(type="primary" icon="volume" @click="onListen") {{ t('app.bookDetail.listen') }}

        //- ===== Secondary actions =====
        section(class=" section-wrap mt-3")
          div(class="grid grid-cols-2 gap-3")
            AButton.self-read(type="secondary" icon="book" size="sm" @click="onRead") {{ t('app.bookDetail.readMyself') }}
            AButton.download(type="secondary" icon="download" size="sm" @click="onDownload") {{ t('app.bookDetail.download') }}

        //- ===== Description =====
        section(class="section-wrap mt-7 pb-6")
          p(class="book-desc text-sm md:text-base") {{ book.description }}

      //- ===== Listen mode =====
      template(v-else-if="mode === 'listen'")
        section(class="section-wrap mt-5")
          ABreadcrumbs(:label="t('app.bookDetail.nowListening')")
          h2(class="book-title mt-1 text-lg md:text-xl font-black") {{ t(book.title) }}

        section(class="section-wrap mt-4")
          AAudioPlayer(
            :is-playing="isPlaying"
            :current-time="currentTime"
            :duration="duration"
            @toggle="togglePlay"
            @rewind="rewind"
            @forward="forward"
            @seek="seek"
          )

        section(class="section-wrap mt-5")
          ABreadcrumbs(:label="t('app.bookDetail.followAlong')")
          div(
            ref="subtitlesRef"
            class="subtitles relative mt-2 p-5"
          )
            div(
              class="karaoke-box"
              :style="karaokeBoxStyle"
              aria-hidden="true"
            )
            p(v-if="currentSentence" class="subtitle-current relative")
              span(
                v-for="(w, i) in currentSentence.words"
                :key="i"
                :ref="el => setWordRef(i, el)"
                class="sub-word"
              ) {{ w + ' ' }}
            p(v-else class="subtitle-current subtitle-placeholder") {{ t('app.bookDetail.noText') }}
            p(v-if="showNextSentence" class="subtitle-next relative mt-3")
              span(v-for="(w, i) in nextSentence.words" :key="i") {{ w + ' ' }}

      //- ===== Read mode =====
      template(v-else-if="mode === 'read'")
        section(class="section-wrap mt-5")
          ABreadcrumbs(:label="t('app.bookDetail.pages')")
          div(class="page-card p-5 mt-2")
            h3(class="page-title") {{ currentPage.title }}
            p(class="page-text mt-2") {{ currentPage.text }}
            div(class="mt-5 pt-4 border-top")
              APager(v-model="selectedPage" :total="totalPages" :skip="5")

      audio(
        ref="audioEl"
        :src="audioSrc"
        preload="metadata"
        class="hidden"
      )

    div(v-else class="section-wrap mt-10 text-center") {{ t('app.bookDetail.notFound') }}

    ABottomNav(:items="navItems" :model-value="activeNav" @update:model-value="onNav")
</template>

<style scoped lang="sass">
.app-page
  background-color: var(--color-bg-main)
  color: var(--color-text-primary)

.section-wrap
  max-width: 42rem
  margin-left: auto
  margin-right: auto
  padding-left: 20px
  padding-right: 20px


.hero
  background-color: var(--color-bg-main)

.hero-img
  border-bottom-left-radius: 32px
  border-bottom-right-radius: 32px
  box-shadow: 0 14px 40px -18px rgba(61, 22, 118, 0.4)

.back-btn
  background-color: rgba(255, 255, 255, 0.2)
  backdrop-filter: blur(8px)
  color: #ffffff
  border: 1.5px solid rgba(255, 255, 255, 0.75)
  box-shadow: 0 6px 14px -6px rgba(0, 0, 0, 0.35)
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  transition: transform 150ms ease-out, background-color 150ms ease-out

  &:hover
    background-color: rgba(255, 255, 255, 0.32)
    transform: translateY(-1px)

  &:active
    transform: scale(0.98)

.book-title
  color: var(--color-text-primary)


.book-subtitle
  color: var(--color-text-secondary)

.book-desc
  color: var(--color-text-primary)
  line-height: 1.5

.heart-btn
  background-color: var(--color-bg-active-pill)
  color: #d64578
  border: 1px solid rgba(126, 58, 242, 0.2)
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  transition: transform 150ms ease-out

  &:hover
    transform: translateY(-1px) scale(1.03)

  &:active
    transform: scale(0.98)

  &.is-active
    background: linear-gradient(180deg, #ffd6ea 0%, #ffb3d4 100%)
    border-color: #ff7ab3
    box-shadow: 0 0 0 1px rgba(255, 122, 179, 0.3), 0 10px 22px -8px rgba(255, 122, 179, 0.55)

.subtitles
  background-color: var(--color-bg-card)
  border: 1px solid var(--color-border-subtle)
  border-radius: 24px
  box-shadow: 0 1px 2px rgba(126, 58, 242, 0.04), 0 10px 28px -14px rgba(126, 58, 242, 0.25)
  min-height: 8rem
  overflow-wrap: break-word
  word-break: normal
  hyphens: auto

  p
    overflow-wrap: break-word
    word-break: normal
    hyphens: auto

  span
    display: inline

.subtitle-current
  font-size: 17px
  font-weight: 800
  line-height: 1.55
  color: var(--color-text-secondary)

@media (max-width: 400px)
  .subtitles
    padding: 16px !important
    border-radius: 20px
  .subtitle-current
    font-size: 15px
  .subtitle-next
    font-size: 13px !important

.subtitle-placeholder
  color: var(--color-text-secondary)
  font-weight: 600
  font-style: italic

.subtitle-next
  font-size: 14px
  font-weight: 600
  line-height: 1.5
  color: rgba(138, 116, 170, 0.7)

.subtitle-current .sub-word
  position: relative
  z-index: 1
  // A tiny pad keeps the box sitting cleanly under each word without the
  // layout shifting as words become active.
  padding: 2px 2px
  margin: 0 -1px
  color: var(--color-text-primary)

.karaoke-box
  position: absolute
  left: 0
  top: 0
  pointer-events: none
  z-index: 0
  border-radius: 8px
  background: linear-gradient(180deg, rgba(255, 209, 71, 0.55) 0%, rgba(255, 184, 77, 0.55) 100%)
  box-shadow: 0 0 0 1px rgba(255, 209, 71, 0.35), 0 6px 18px -8px rgba(255, 170, 0, 0.35)
  // No CSS transition — position is driven by the per-frame RAF loop, so
  // the box already moves at 60fps. Adding a transition would double-smooth
  // and introduce lag behind the audio.
  will-change: transform, width, height, opacity

.page-card
  background-color: var(--color-bg-card)
  border: 1px solid var(--color-border-subtle)
  border-radius: 20px
  box-shadow: 0 1px 2px rgba(126, 58, 242, 0.04), 0 8px 22px -14px rgba(126, 58, 242, 0.2)

.page-title
  font-size: 15px
  font-weight: 800
  color: var(--color-text-primary)

.page-text
  font-size: 14px
  color: var(--color-text-primary)
  line-height: 1.55
  white-space: pre-line
  min-height: 6rem

.border-top
  border-top: 1px solid var(--color-border-subtle)

:deep(.self-read) button, :deep(.download) button
  padding: 8px 11px

  .button-label
    font-size: 14px
</style>

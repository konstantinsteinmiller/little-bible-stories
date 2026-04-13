import { computed, ref } from 'vue'
import { prependBaseUrl, repeatPages } from '@/utils/function'

// ---------------------------------------------------------------------------
// Legacy helper kept for existing call sites (tests, useAssets, useMatch...)
// ---------------------------------------------------------------------------
export const modelImgPath = (id: string) => {
  return prependBaseUrl(`images/models/${id}_256x256.webp`)
}

// ---------------------------------------------------------------------------
// Story / book data model
// ---------------------------------------------------------------------------
export interface BookAudio {
  en: string
  de: string
}

export interface PlaybackState {
  time?: number
  page?: number
  audioSrc?: string
  updatedAt?: number
}

export interface Page {
  page: number
  title: string
  text: string
}

export interface Book {
  id: string
  title: string
  author: string
  releaseDate: string // ISO 8601
  badges: string[]
  shortDescription: string
  description: string
  content: Page[]
  audio: BookAudio
  // optional cover gradient (CSS) - placeholder visual
  cover?: string
  coverImage?: string
  previewImage?: string
}

export interface BookSeries {
  id: string
  name: string
  description: string
  bookIds: string[]
  cover?: string
  coverImage?: string
}

// ----- Books ---------------------------------------------------------------
export const BOOKS: Book[] = [
  {
    id: 'fa-1-apple',
    title: 'fa-1.title',
    author: 'Anton Bernt',
    releaseDate: '2026-02-12',
    badges: ['fa-1.badges.1', 'fa-1.badges.2'],
    shortDescription: 'Adam learns the cost of a single bite.',
    description: 'A retelling of the very first choice — and the very first lesson — set in a luminous garden where every fruit has a name and every name carries a story.',
    content: [...repeatPages(16, (item, i) => ({
      page: i + 1,
      title: `fa-1.page.${i + 1}.title`,
      text: `fa-1.page.${i + 1}.text`
    } as Page))],
    audio: {
      en: 'https://cdn.example.com/kanaan/audio/en/apple-mission.mp3',
      de: 'audiobooks/fruit-agents/volume-1/de-fruit-agents-volume-1-page-1.ogg'
    },
    cover: 'linear-gradient(135deg, #E74C3C 0%, #F1C40F 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_800x500.jpeg'),
    previewImage: prependBaseUrl('images/fruit-agents/preview-fruit-agents_300x550.jpeg')
  },
  {
    id: 'fa-2-fig',
    title: 'fa-2.title',
    author: 'Anton Bernt',
    releaseDate: '2024-04-09',
    shortDescription: 'Two hidden friends and a garden full of secrets.',
    description: 'When the cool of the day arrives, two friends discover that the loudest sound in the world is the sound of hiding. A gentle story about courage, honesty, and being found.',
    content: [...repeatPages(16, i => ({
      page: i + 1,
      title: `fa-2.page.${i + 1}.title`,
      text: `fa-2.page.${i + 1}.text`
    } as Page))],
    audio: {
      en: 'https://cdn.example.com/kanaan/audio/en/fig-leaf-code.mp3',
      de: 'https://cdn.example.com/kanaan/audio/de/fig-leaf-code.mp3'
    },
    cover: 'linear-gradient(135deg, #27AE60 0%, #A2D149 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_800x500.jpeg'),
    previewImage: prependBaseUrl('images/fruit-agents/preview-fruit-agents_300x550.jpeg')
  },
  {
    id: 'fa-3-grape',
    title: 'fa-3.title',
    author: 'Anton Bernt',
    releaseDate: '2024-05-21',
    shortDescription: 'Noah, a vineyard, and the promise of a rainbow.',
    description: 'After the flood receded and the dove came home, Noah planted a vineyard. This is the story of what grew there — and the colors that arched across the sky to keep their promise.',
    content: [...repeatPages(16, i => ({
      page: i + 1,
      title: `fa-3.page.${i + 1}.title`,
      text: `fa-3.page.${i + 1}.text`
    } as Page))],
    audio: {
      en: 'https://cdn.example.com/kanaan/audio/en/grape-escape.mp3',
      de: 'https://cdn.example.com/kanaan/audio/de/grape-escape.mp3'
    },
    cover: 'linear-gradient(135deg, #9B59B6 0%, #3498DB 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_800x500.jpeg'),
    previewImage: prependBaseUrl('images/fruit-agents/preview-fruit-agents_300x550.jpeg')
  },
  {
    id: 'fa-4-pomegranate',
    title: 'fa-4.title',
    author: 'Anton Bernt',
    releaseDate: '2024-07-04',
    shortDescription: 'Twelve scouts and a fruit too heavy to carry alone.',
    description: 'In a land flowing with milk and honey, twelve scouts find a single bunch so heavy that it takes two of them to lift it. A story about big news, brave hearts, and the friends who help us hold them.',
    content: [...repeatPages(16, i => ({
      page: i + 1,
      title: `fa-4.page.${i + 1}.title`,
      text: `fa-4.page.${i + 1}.text`
    } as Page))],
    audio: {
      en: 'https://cdn.example.com/kanaan/audio/en/pomegranate-pact.mp3',
      de: 'https://cdn.example.com/kanaan/audio/de/pomegranate-pact.mp3'
    },
    cover: 'linear-gradient(135deg, #E67E22 0%, #E74C3C 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_800x500.jpeg'),
    previewImage: prependBaseUrl('images/fruit-agents/preview-fruit-agents_300x550.jpeg')
  },
  {
    id: 'fa-5-olive',
    title: 'fa-5.title',
    author: 'Anton Bernt',
    releaseDate: '2024-09-18',
    shortDescription: 'A small leaf, a long flight, a brand new world.',
    description: 'On her third flight from the ark, the dove returns with a single olive leaf in her beak. This is her story — a tiny adventure with a sky-sized ending.',
    content: [...repeatPages(16, i => ({
      page: i + 1,
      title: `fa-5.page.${i + 1}.title`,
      text: `fa-5.page.${i + 1}.text`
    } as Page))],
    audio: {
      en: 'https://cdn.example.com/kanaan/audio/en/olive-branch.mp3',
      de:
        'https://cdn.example.com/kanaan/audio/de/olive-branch.mp3'
    },
    cover: 'linear-gradient(135deg, #1ABC9C 0%, #2ECC71 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_800x500.jpeg'),
    previewImage: prependBaseUrl('images/fruit-agents/preview-fruit-agents_300x550.jpeg')
  }
]

// ----- Series --------------------------------------------------------------
export const BOOK_SERIES: BookSeries[] = [
  {
    id: 'fruit-agents',
    name: 'Fruit Agents',
    description: 'Five sweet stories about the fruits of the Bible — and the friends who carried them.',
    bookIds: ['fa-1-apple', 'fa-2-fig', 'fa-3-grape', 'fa-4-pomegranate', 'fa-5-olive'],
    cover: 'linear-gradient(135deg, #F1C40F 0%, #E67E22 100%)',
    coverImage: prependBaseUrl('images/fruit-agents/cover-fruit-agents_1024x1024.jpeg')
  }
]

// ---------------------------------------------------------------------------
// Persistent reactive state — watch list & last-read book
// ---------------------------------------------------------------------------
const LS_WATCH_LIST = 'kanaan.watchList'
const LS_LAST_READ = 'kanaan.lastReadId'
const LS_PLAYBACK = 'kanaan.playback'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const watchListIds = ref<string[]>(readJSON<string[]>(LS_WATCH_LIST, []))
const lastReadId = ref<string | null>(readJSON<string | null>(LS_LAST_READ, null))
const playbackStates = ref<Record<string, PlaybackState>>(readJSON<Record<string, PlaybackState>>(LS_PLAYBACK, {}))

function persistWatchList() {
  try {
    localStorage.setItem(LS_WATCH_LIST, JSON.stringify(watchListIds.value))
  } catch {
  }
}

function persistLastRead() {
  try {
    localStorage.setItem(LS_LAST_READ, JSON.stringify(lastReadId.value))
  } catch {
  }
}

function persistPlayback() {
  try {
    localStorage.setItem(LS_PLAYBACK, JSON.stringify(playbackStates.value))
  } catch {
  }
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
const useModels = () => {
  const getBook = (id: string): Book | undefined => BOOKS.find(b => b.id === id)
  const getSeries = (id: string): BookSeries | undefined => BOOK_SERIES.find(s => s.id === id)
  const getBooksOfSeries = (id: string): Book[] => {
    const series = getSeries(id)
    if (!series) return []
    return series.bookIds.map(bid => getBook(bid)).filter(Boolean) as Book[]
  }
  const getSeriesOfBook = (bookId: string): BookSeries | undefined => {
    return BOOK_SERIES.find(s => s.bookIds.includes(bookId))
  }

  // Watch list ----------------------------------------------------------
  const isInWatchList = (bookId: string) => watchListIds.value.includes(bookId)
  const addToWatchList = (bookId: string) => {
    if (!isInWatchList(bookId)) {
      watchListIds.value = [...watchListIds.value, bookId]
      persistWatchList()
    }
  }
  const removeFromWatchList = (bookId: string) => {
    watchListIds.value = watchListIds.value.filter(id => id !== bookId)
    persistWatchList()
  }
  const toggleWatchList = (bookId: string) => {
    isInWatchList(bookId) ? removeFromWatchList(bookId) : addToWatchList(bookId)
  }
  const watchListBooks = computed<Book[]>(() =>
    watchListIds.value.map(id => getBook(id)).filter(Boolean) as Book[]
  )

  // Last read -----------------------------------------------------------
  const setLastRead = (bookId: string) => {
    lastReadId.value = bookId
    persistLastRead()
  }
  const lastReadBook = computed<Book | null>(() =>
    lastReadId.value ? getBook(lastReadId.value) ?? null : null
  )

  // Playback state ------------------------------------------------------
  const getPlaybackState = (bookId: string): PlaybackState | undefined =>
    playbackStates.value[bookId]
  const setPlaybackState = (bookId: string, state: PlaybackState) => {
    playbackStates.value = {
      ...playbackStates.value,
      [bookId]: { ...playbackStates.value[bookId], ...state, updatedAt: Date.now() }
    }
    persistPlayback()
  }
  const clearPlaybackState = (bookId: string) => {
    const next = { ...playbackStates.value }
    delete next[bookId]
    playbackStates.value = next
    persistPlayback()
  }

  // Stubs kept for `useUser.resetGameProgress` compatibility ------------
  const getStartCollection = () => []
  const saveCollection = (_collection: any) => {
  }

  return {
    modelImgPath,
    BOOKS,
    BOOK_SERIES,
    getBook,
    getSeries,
    getBooksOfSeries,
    getSeriesOfBook,
    // watch list
    watchListIds,
    watchListBooks,
    isInWatchList,
    addToWatchList,
    removeFromWatchList,
    toggleWatchList,
    // last read
    lastReadId,
    lastReadBook,
    setLastRead,
    // playback state
    getPlaybackState,
    setPlaybackState,
    clearPlaybackState,
    // legacy stubs
    getStartCollection,
    saveCollection
  }
}

export default useModels

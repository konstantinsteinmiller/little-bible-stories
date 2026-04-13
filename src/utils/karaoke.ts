/**
 * Pure helpers for the read-along / karaoke highlight in AppBookDetailView.
 *
 * Kept framework-free so the behavior can be unit-tested without mounting a
 * Vue component. The view imports these and wraps them in `computed`s.
 */

export interface AlignedWord {
  text: string
  start: number
  end: number
}

export interface AlignedSentence {
  text: string
  start: number
  end: number
  words: AlignedWord[]
}

export interface Alignment {
  duration: number
  sentences: AlignedSentence[]
}

/**
 * Index of the sentence that should be "current" at the given audio time.
 *
 * Semantics: the first sentence whose `end` is strictly greater than `time`.
 * A gap between two sentences (silence) resolves to the NEXT sentence —
 * the user sees the upcoming line during the pause, which matches how the
 * audio actually plays.
 *
 * Clamps to the last sentence once the audio is past everything.
 * Returns 0 on an empty alignment so the view can still render a valid
 * sentence lookup without a guard.
 */
export function getSentenceIndexAt(alignment: Alignment, time: number): number {
  const arr = alignment.sentences
  if (!arr.length) return 0
  for (let i = 0; i < arr.length; i++) {
    const s = arr[i]
    if (s && time < s.end) return i
  }
  return arr.length - 1
}

/**
 * Index of the active word inside the current sentence at the given time.
 *
 * Uses the same "first whose end > time" rule as the sentence scan. If the
 * time is past every word in the sentence (we're in the silence before the
 * next sentence), this returns the last word's index so the highlight
 * stays on the final word instead of snapping back to 0.
 */
export function getActiveWordIndex(
  alignment: Alignment,
  sentenceIndex: number,
  time: number
): number {
  const s = alignment.sentences[sentenceIndex]
  if (!s) return 0
  const words = s.words
  if (!words.length) return 0
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    if (w && time < w.end) return i
  }
  return words.length - 1
}

/**
 * Whether the next sentence should be previewed below the current one.
 * Triggered when the reader is ≥60% of the way through the current
 * sentence (by word index), matching the "preview when almost done"
 * behavior the UI designer asked for.
 */
export function shouldShowNextSentence(
  alignment: Alignment,
  sentenceIndex: number,
  activeWordInSentence: number
): boolean {
  const current = alignment.sentences[sentenceIndex]
  const next = alignment.sentences[sentenceIndex + 1]
  if (!current || !next) return false
  const denom = Math.max(1, current.words.length - 1)
  return activeWordInSentence / denom >= 0.6
}

/**
 * Snapshot helper — returns everything the view needs for a given time in
 * one call, so there is only one source of truth when `currentTime`
 * advances. Useful in tests and in the view to avoid recomputing the
 * sentence index multiple times per tick.
 */
export interface KaraokeSnapshot {
  sentenceIndex: number
  activeWord: number
  currentWords: string[]
  nextWords: string[]
  showNext: boolean
}

export function snapshotAt(alignment: Alignment, time: number): KaraokeSnapshot {
  const sentenceIndex = getSentenceIndexAt(alignment, time)
  const activeWord = getActiveWordIndex(alignment, sentenceIndex, time)
  const current = alignment.sentences[sentenceIndex]
  const next = alignment.sentences[sentenceIndex + 1]
  return {
    sentenceIndex,
    activeWord,
    currentWords: current ? current.words.map(w => w.text) : [],
    nextWords: next ? next.words.map(w => w.text) : [],
    showNext: shouldShowNextSentence(alignment, sentenceIndex, activeWord)
  }
}

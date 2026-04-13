import { describe, expect, it } from 'vitest'
import {
  type Alignment,
  getActiveWordIndex,
  getSentenceIndexAt,
  shouldShowNextSentence,
  snapshotAt
} from '@/utils/karaoke'

// Three-sentence fixture with realistic timing:
//   s0: "Die Sonne knallte heiß."        0.0 – 3.0
//   s1: "Leo wischte sich den Schweiß." 3.5 – 6.5
//   s2: "Sam nickte langsam."            7.0 – 9.0
//   (0.3–0.5s pauses between sentences intentionally simulate silence)
const fixture: Alignment = {
  duration: 10,
  sentences: [
    {
      text: 'Die Sonne knallte heiß.',
      start: 0,
      end: 3,
      words: [
        { text: 'Die', start: 0.0, end: 0.5 },
        { text: 'Sonne', start: 0.5, end: 1.2 },
        { text: 'knallte', start: 1.2, end: 2.2 },
        { text: 'heiß', start: 2.2, end: 3.0 }
      ]
    },
    {
      text: 'Leo wischte sich den Schweiß.',
      start: 3.5,
      end: 6.5,
      words: [
        { text: 'Leo', start: 3.5, end: 4.0 },
        { text: 'wischte', start: 4.0, end: 4.7 },
        { text: 'sich', start: 4.7, end: 5.0 },
        { text: 'den', start: 5.0, end: 5.4 },
        { text: 'Schweiß', start: 5.4, end: 6.5 }
      ]
    },
    {
      text: 'Sam nickte langsam.',
      start: 7.0,
      end: 9.0,
      words: [
        { text: 'Sam', start: 7.0, end: 7.5 },
        { text: 'nickte', start: 7.5, end: 8.2 },
        { text: 'langsam', start: 8.2, end: 9.0 }
      ]
    }
  ]
}

describe('getSentenceIndexAt', () => {
  it('returns the first sentence at time zero', () => {
    expect(getSentenceIndexAt(fixture, 0)).toBe(0)
  })

  it('stays on sentence 0 until its end', () => {
    expect(getSentenceIndexAt(fixture, 2.9)).toBe(0)
  })

  it('advances to sentence 1 the instant the audio passes sentence 0', () => {
    // t=3.0 equals sentence 0's end — the predicate is `time < s.end`, so we
    // fall through to sentence 1 (which is the expected behavior during the
    // pause between sentences).
    expect(getSentenceIndexAt(fixture, 3.0)).toBe(1)
  })

  it('shows sentence 1 during the silence gap between sentences', () => {
    // Between s0.end=3.0 and s1.start=3.5, the user is in silence but the
    // next line should already be visible so they can follow along.
    expect(getSentenceIndexAt(fixture, 3.2)).toBe(1)
  })

  it('stays on sentence 1 through its words', () => {
    expect(getSentenceIndexAt(fixture, 3.5)).toBe(1)
    expect(getSentenceIndexAt(fixture, 5.0)).toBe(1)
    expect(getSentenceIndexAt(fixture, 6.4)).toBe(1)
  })

  it('advances to sentence 2 once sentence 1 ends', () => {
    expect(getSentenceIndexAt(fixture, 6.5)).toBe(2)
    expect(getSentenceIndexAt(fixture, 7.5)).toBe(2)
  })

  it('clamps to the last sentence past the end', () => {
    expect(getSentenceIndexAt(fixture, 99)).toBe(2)
  })

  it('handles empty alignment without crashing', () => {
    expect(getSentenceIndexAt({ duration: 0, sentences: [] }, 5)).toBe(0)
  })
})

describe('getActiveWordIndex', () => {
  it('picks the first word at the very start', () => {
    expect(getActiveWordIndex(fixture, 0, 0)).toBe(0)
  })

  it('advances across words in sentence 0', () => {
    expect(getActiveWordIndex(fixture, 0, 0.4)).toBe(0) // "Die"
    expect(getActiveWordIndex(fixture, 0, 0.6)).toBe(1) // "Sonne"
    expect(getActiveWordIndex(fixture, 0, 1.5)).toBe(2) // "knallte"
    expect(getActiveWordIndex(fixture, 0, 2.5)).toBe(3) // "heiß"
  })

  it('returns the last word past the sentence end (during silence)', () => {
    expect(getActiveWordIndex(fixture, 0, 3.3)).toBe(3)
  })

  it('tracks words in sentence 1 independently', () => {
    expect(getActiveWordIndex(fixture, 1, 3.9)).toBe(0) // "Leo"
    expect(getActiveWordIndex(fixture, 1, 4.6)).toBe(1) // "wischte"
    expect(getActiveWordIndex(fixture, 1, 6.4)).toBe(4) // "Schweiß"
  })

  it('returns 0 for an out-of-range sentence index', () => {
    expect(getActiveWordIndex(fixture, 99, 5)).toBe(0)
  })
})

describe('shouldShowNextSentence', () => {
  it('is false at the start of a sentence', () => {
    expect(shouldShowNextSentence(fixture, 0, 0)).toBe(false)
  })

  it('is true when the active word is ≥60% through the sentence', () => {
    // s0 has 4 words (indices 0..3). 60% of (4-1)=3 → ≥1.8, so word 2.
    expect(shouldShowNextSentence(fixture, 0, 1)).toBe(false)
    expect(shouldShowNextSentence(fixture, 0, 2)).toBe(true)
    expect(shouldShowNextSentence(fixture, 0, 3)).toBe(true)
  })

  it('is false on the last sentence (no "next" exists)', () => {
    expect(shouldShowNextSentence(fixture, 2, 2)).toBe(false)
  })
})

describe('snapshotAt — integration of sentence + word + showNext', () => {
  it('returns sentence 0 and first word at t=0', () => {
    const snap = snapshotAt(fixture, 0)
    expect(snap.sentenceIndex).toBe(0)
    expect(snap.activeWord).toBe(0)
    expect(snap.currentWords).toEqual(['Die', 'Sonne', 'knallte', 'heiß'])
    expect(snap.nextWords).toEqual(['Leo', 'wischte', 'sich', 'den', 'Schweiß'])
    expect(snap.showNext).toBe(false)
  })

  it('switches to sentence 1 content once the audio passes sentence 0', () => {
    const snap = snapshotAt(fixture, 3.2) // in the silence gap
    expect(snap.sentenceIndex).toBe(1)
    expect(snap.currentWords).toEqual(['Leo', 'wischte', 'sich', 'den', 'Schweiß'])
    expect(snap.nextWords).toEqual(['Sam', 'nickte', 'langsam'])
  })

  it('previews sentence 2 when sentence 1 is almost done', () => {
    const snap = snapshotAt(fixture, 5.3) // word "den" — index 3 of 5
    expect(snap.sentenceIndex).toBe(1)
    expect(snap.activeWord).toBe(3)
    expect(snap.showNext).toBe(true)
  })

  it('walks the whole fixture and never regresses the sentence index', () => {
    let last = -1
    for (let t = 0; t <= 10; t += 0.1) {
      const idx = snapshotAt(fixture, t).sentenceIndex
      expect(idx).toBeGreaterThanOrEqual(last)
      last = idx
    }
    expect(last).toBe(2)
  })
})

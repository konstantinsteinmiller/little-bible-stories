#!/usr/bin/env node
/**
 * Word-level alignment of a known text against an audio file — Node edition.
 *
 * Pure Node / npm. No Python, no system ffmpeg install needed.
 *
 * Backend:
 *   - @huggingface/transformers   — Whisper via ONNX Runtime (pure JS)
 *   - ffmpeg-static               — bundled ffmpeg binary for audio decoding
 *
 * Install:
 *   pnpm add -D @huggingface/transformers ffmpeg-static
 *
 * Usage (via package.json script):
 *   pnpm align:audio -- \
 *     --audio public/audiobooks/.../de-...-page-1.ogg \
 *     --text  scripts/align-input/fa-1-de-page-1.txt \
 *     --lang  de \
 *     --out   public/audiobooks/.../de-...-page-1.align.json \
 *     --model Xenova/whisper-small
 *
 * The authored text from --text is used to CORRECT whisper's transcription
 * token-by-token so highlighting matches your manuscript exactly. Whisper
 * keeps the timing, your text file supplies the spelling.
 *
 * Model choices (trade speed for accuracy):
 *   Xenova/whisper-tiny
 *   Xenova/whisper-base
 *   Xenova/whisper-small   (default — good balance for kids' audiobooks)
 *   Xenova/whisper-medium
 *   Xenova/whisper-large-v3
 *
 * First run downloads the ONNX weights (~250 MB for `small`) into the
 * transformers.js cache directory.
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const SAMPLE_RATE = 16000
const WORD_RE = /[^\s]+/gu
// Sentence terminators, optionally followed by a closing quote mark so
// `„…!"` stays glued instead of flinging the `"` onto the next sentence.
const CLOSE_QUOTES = '"\'\u201C\u201D\u2018\u2019\u00BB'
const SENT_RE = new RegExp(
  `[^.!?]+[.!?]+[${CLOSE_QUOTES}]*|[^.!?]+[${CLOSE_QUOTES}]+|[^.!?]+$`,
  'g'
)

function parseArgs() {
  const out = { model: 'Xenova/whisper-small' }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) out[a.slice(2)] = argv[++i]
  }
  for (const k of ['audio', 'text', 'lang', 'out']) {
    if (!out[k]) {
      console.error(`Missing --${k}`)
      console.error('Usage: --audio <file> --text <txt> --lang de --out <json> [--model Xenova/whisper-small]')
      process.exit(1)
    }
  }
  return out
}

function splitSentences(raw) {
  const out = []
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parts = trimmed.match(SENT_RE) || [trimmed]
    for (const p of parts) {
      const q = p.trim()
      if (q) out.push(q)
    }
  }
  return out
}

function splitWords(sentence) {
  return sentence.match(WORD_RE) || []
}

/**
 * Decode an audio file to a 16 kHz mono Float32Array via ffmpeg-static.
 * ffmpeg is spawned as a subprocess and pipes raw 32-bit float PCM on stdout.
 */
async function resolveFfmpeg() {
  // 1. Explicit env override wins.
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH
  }
  // 2. @ffmpeg-installer/ffmpeg (binary shipped as npm package per platform).
  try {
    const mod = await import('@ffmpeg-installer/ffmpeg')
    const p = mod.default?.path || mod.path
    if (p && fs.existsSync(p)) return p
  } catch { /* not installed */
  }
  // 3. ffmpeg-static (downloads from GitHub releases at install time).
  try {
    const mod = await import('ffmpeg-static')
    const p = mod.default || mod
    if (p && fs.existsSync(p)) return p
  } catch { /* not installed */
  }
  // 4. System ffmpeg on PATH.
  return 'ffmpeg'
}

async function decodeAudio(audioPath) {
  const ffmpegPath = await resolveFfmpeg()

  return await new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-i', audioPath,
      '-f', 'f32le',
      '-ac', '1',
      '-ar', String(SAMPLE_RATE),
      'pipe:1'
    ]
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    const chunks = []
    let stderr = ''
    proc.stdout.on('data', (c) => chunks.push(c))
    proc.stderr.on('data', (c) => {
      stderr += c.toString()
    })
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with ${code}: ${stderr}`))
        return
      }
      const buf = Buffer.concat(chunks)
      // Reinterpret the Node Buffer as a Float32Array (4 bytes per sample).
      const f32 = new Float32Array(
        buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      )
      resolve(f32)
    })
  })
}

async function loadTransformers() {
  try {
    return await import('@huggingface/transformers')
  } catch {
    try {
      return await import('@xenova/transformers')
    } catch (e) {
      console.error(
        'ERROR: transformers.js is not installed.\n' +
        '  pnpm add -D @huggingface/transformers'
      )
      process.exit(2)
    }
  }
}

/**
 * Run whisper ASR with word-level timestamps. Returns a flat list of
 * { text, start, end } objects across the whole audio.
 */
async function whisperWords(samples, lang, modelId) {
  const { pipeline } = await loadTransformers()
  console.error(`loading whisper model '${modelId}' (first run downloads weights)…`)
  const asr = await pipeline('automatic-speech-recognition', modelId)

  const result = await asr(samples, {
    language: lang,
    task: 'transcribe',
    return_timestamps: 'word',
    chunk_length_s: 30,
    stride_length_s: 5
  })

  const chunks = Array.isArray(result) ? result.flatMap(r => r.chunks || []) : (result.chunks || [])
  const words = []
  for (const c of chunks) {
    const text = (c.text || '').trim()
    if (!text) continue
    const [s, e] = c.timestamp || [null, null]
    if (s == null || e == null) continue
    words.push({ text, start: Number(s), end: Number(e) })
  }
  return words
}

function normalizeToken(s) {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

/**
 * Drop whisper words whose timing isn't strictly forward. Whisper with
 * `chunk_length_s` + `stride_length_s` produces overlapping chunks; the same
 * word can appear twice across the seam with earlier-then-later timestamps.
 * Blind positional pairing with the authored list then drifts badly — this
 * filter kills the overlap before alignment.
 */
function dedupeWhisper(words) {
  const out = []
  let lastStart = -Infinity
  for (const w of words) {
    if (!w || !(w.end > w.start)) continue
    if (w.start < lastStart - 0.05) continue // clearly regressing — stride overlap
    if (out.length) {
      const prev = out[out.length - 1]
      // same text within 0.3s → duplicate across stride seam
      if (normalizeToken(prev.text) === normalizeToken(w.text) && w.start - prev.start < 0.3) continue
    }
    out.push(w)
    lastStart = w.start
  }
  return out
}

/**
 * LCS alignment: match authored words to whisper words by normalized text,
 * then interpolate timing for unmatched authored words between their nearest
 * matched neighbors. Handles whisper hallucinations, dropped words, and
 * subword splits without the pileup bug of positional pairing.
 */
function alignToAuthored(whisperW, authored) {
  const W = whisperW.length
  const A = authored.length
  if (!W || !A) return []

  const wn = whisperW.map(w => normalizeToken(w.text))
  const an = authored.map(normalizeToken)

  // Only long/informative tokens are eligible LCS anchors. Short German
  // function words (die, der, den, an, so, sie, im, es, ...) repeat too
  // often in both transcripts — matching them lets LCS place an anchor
  // far from its true position and causes the interpolator to cram dozens
  // of authored words into a microscopic time slice.
  const MIN_ANCHOR_LEN = 4
  const eligibleA = an.map(t => t.length >= MIN_ANCHOR_LEN)
  const eligibleW = wn.map(t => t.length >= MIN_ANCHOR_LEN)

  // LCS DP — rolling two rows to keep memory bounded for long transcripts.
  const prev = new Int32Array(W + 1)
  const curr = new Int32Array(W + 1)
  // Full backtrack needs the matrix; A*W for realistic audiobook pages
  // (~800×1000) is ≈3 MB of Int16 — acceptable.
  const matrix = new Int16Array((A + 1) * (W + 1))
  const idx = (a, w) => a * (W + 1) + w
  for (let a = 1; a <= A; a++) {
    for (let w = 1; w <= W; w++) {
      const match =
        an[a - 1] && eligibleA[a - 1] && eligibleW[w - 1] && an[a - 1] === wn[w - 1]
      if (match) {
        curr[w] = prev[w - 1] + 1
      } else {
        curr[w] = curr[w - 1] >= prev[w] ? curr[w - 1] : prev[w]
      }
      matrix[idx(a, w)] = curr[w]
    }
    for (let w = 0; w <= W; w++) prev[w] = curr[w]
  }

  // Backtrack to pair authored[a] ↔ whisper[w].
  const paired = new Int32Array(A).fill(-1)
  {
    let a = A, w = W
    while (a > 0 && w > 0) {
      const match =
        an[a - 1] && eligibleA[a - 1] && eligibleW[w - 1] && an[a - 1] === wn[w - 1]
      if (match) {
        paired[a - 1] = w - 1
        a--
        w--
      } else if (matrix[idx(a - 1, w)] >= matrix[idx(a, w - 1)]) {
        a--
      } else {
        w--
      }
    }
  }

  // Enforce forward monotonic matches: a later authored word must not match
  // an earlier whisper word than its predecessor. Discard any that violate.
  let lastW = -1
  for (let a = 0; a < A; a++) {
    if (paired[a] < 0) continue
    if (paired[a] <= lastW) {
      paired[a] = -1
      continue
    }
    lastW = paired[a]
  }

  // Drop anchors that imply an impossible local pace. Children's audiobook
  // narration sits around 0.25–0.4 s/word; anything outside [0.18, 1.2]
  // means LCS matched two tokens that aren't the same occurrence.
  // Virtual head/tail anchors at (−1, time 0) and (A, totalDur) let the
  // check also catch anchors that cram the beginning or end of the file.
  const MIN_SEC_PER_WORD = 0.18
  const MAX_SEC_PER_WORD = 1.2
  const totalAudioDur = whisperW[whisperW.length - 1].end
  const VIRTUAL_HEAD = -1
  const VIRTUAL_TAIL = A
  const virtualTime = (aPos) => {
    if (aPos === VIRTUAL_HEAD) return { start: 0, end: 0 }
    if (aPos === VIRTUAL_TAIL) return { start: totalAudioDur, end: totalAudioDur }
    return whisperW[paired[aPos]]
  }
  for (; ;) {
    const real = []
    for (let a = 0; a < A; a++) {
      if (paired[a] >= 0) real.push(a)
    }
    if (!real.length) break
    const anchors = [VIRTUAL_HEAD, ...real, VIRTUAL_TAIL]

    // Deviation of each adjacent pair — positive when pace is outside
    // [MIN, MAX]. Weighted by gap so long broken stretches outrank short
    // ones.
    const pairDev = new Array(anchors.length - 1).fill(0)
    for (let k = 1; k < anchors.length; k++) {
      const aPrev = anchors[k - 1]
      const aCur = anchors[k]
      const gap = aCur - aPrev - 1
      if (gap <= 0) continue
      const wPrev = virtualTime(aPrev)
      const wCur = virtualTime(aCur)
      const dt = Math.max(0, wCur.start - wPrev.end)
      const pace = dt / gap
      let dev = 0
      if (pace < MIN_SEC_PER_WORD) dev = (MIN_SEC_PER_WORD - pace) * gap
      else if (pace > MAX_SEC_PER_WORD) dev = (pace - MAX_SEC_PER_WORD) * gap
      pairDev[k - 1] = dev
    }

    // Pick the real anchor whose combined adjacent-pair deviation is
    // worst. Virtual head/tail can't be dropped.
    let worstRealIdx = -1
    let worstVal = 0
    for (let k = 1; k < anchors.length - 1; k++) {
      const dev = pairDev[k - 1] + pairDev[k]
      if (dev > worstVal) {
        worstVal = dev
        worstRealIdx = k
      }
    }
    if (worstRealIdx < 0 || worstVal <= 0) break
    paired[anchors[worstRealIdx]] = -1
  }

  const out = new Array(A)
  for (let a = 0; a < A; a++) {
    if (paired[a] >= 0) {
      const w = whisperW[paired[a]]
      out[a] = { text: authored[a], start: round3(w.start), end: round3(w.end) }
    }
  }

  // Interpolate unmatched runs linearly between neighboring anchors.
  let a = 0
  const totalDur = whisperW[whisperW.length - 1].end
  while (a < A) {
    if (out[a]) {
      a++
      continue
    }
    let b = a
    while (b < A && !out[b]) b++
    const prevEnd = a > 0 && out[a - 1] ? out[a - 1].end : 0
    const nextStart = b < A && out[b] ? out[b].start : totalDur
    const span = Math.max(0.1, nextStart - prevEnd)
    const per = span / (b - a)
    for (let k = a; k < b; k++) {
      const s = prevEnd + (k - a) * per
      out[k] = {
        text: authored[k],
        start: round3(s),
        end: round3(s + per)
      }
    }
    a = b
  }

  return out
}

function groupIntoSentences(words, sentences) {
  const out = []
  let idx = 0
  for (const sent of sentences) {
    const count = splitWords(sent).length
    if (count === 0) continue
    const slice = words.slice(idx, idx + count)
    idx += count
    if (!slice.length) continue
    out.push({
      text: sent,
      start: slice[0].start,
      end: slice[slice.length - 1].end,
      words: slice
    })
  }
  return out
}

function round3(n) {
  return Math.round(n * 1000) / 1000
}

async function main() {
  const args = parseArgs()

  const raw = fs.readFileSync(args.text, 'utf8')
  const sentences = splitSentences(raw)
  if (!sentences.length) {
    console.error(`No sentences found in ${args.text}`)
    process.exit(1)
  }
  const authoredWords = sentences.flatMap(splitWords)
  if (!authoredWords.length) {
    console.error('Authored text has no words')
    process.exit(1)
  }

  console.error(`decoding audio: ${args.audio}`)
  const samples = await decodeAudio(args.audio)
  const duration = samples.length / SAMPLE_RATE
  console.error(`decoded ${samples.length} samples (${duration.toFixed(1)}s)`)

  const whisperRaw = await whisperWords(samples, args.lang, args.model)
  if (!whisperRaw.length) {
    console.error('Whisper returned no words — check the audio file and language.')
    process.exit(1)
  }
  const whisperW = dedupeWhisper(whisperRaw)
  console.error(
    `whisper produced ${whisperRaw.length} words (${whisperW.length} after dedupe);` +
    ` authored has ${authoredWords.length}`
  )

  const aligned = alignToAuthored(whisperW, authoredWords)
  const sentenceBlocks = groupIntoSentences(aligned, sentences)

  const payload = {
    audio: args.audio.replace(/\\/g, '/'),
    lang: args.lang,
    duration: round3(duration),
    sentences: sentenceBlocks
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true })
  fs.writeFileSync(args.out, JSON.stringify(payload, null, 2), 'utf8')
  console.error(
    `wrote ${args.out}  (${sentenceBlocks.length} sentences, ${aligned.length} words)`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

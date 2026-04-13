#!/usr/bin/env node
/**
 * Extracts the authored text of a book — one page, a range, or the whole
 * book — from src/i18n/books.ts and writes it to a plain .txt file with one
 * sentence per line, ready to feed into scripts/align-audio.mjs.
 *
 * Usage (single page — backwards compatible):
 *   node scripts/extract-page-text.mjs --key fa-1 --lang de --page 1 \
 *        --out scripts/align-input/fa-1-de-page-1.txt
 *
 * Usage (whole book or arbitrary page list):
 *   node scripts/extract-page-text.mjs --key fa-1 --lang de --pages all \
 *        --out scripts/align-input/fa-1-de.txt
 *   node scripts/extract-page-text.mjs --key fa-1 --lang de --pages 1-4 --out …
 *   node scripts/extract-page-text.mjs --key fa-1 --lang de --pages 1,3,5 --out …
 */

import fs from 'node:fs'
import path from 'node:path'

function parseArgs() {
  const out = {}
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) out[a.slice(2)] = argv[++i]
  }
  return out
}

async function loadBooksI18n() {
  // dynamic import through tsx-compatible loader; fall back to regex parse if
  // no ts loader is available (we keep this script dependency-free).
  const src = fs.readFileSync(
    path.resolve('src/i18n/books.ts'), 'utf8'
  )
  // Strip `export default` and evaluate as an expression. Safe because the
  // file is a pure object literal under our control.
  const expr = src.replace(/^\s*export\s+default\s*/, '')
  // eslint-disable-next-line no-new-func
  return new Function(`return (${expr});`)()
}

function splitSentences(text) {
  // books.ts uses multi-line string literals with heavy indentation for
  // readability. Collapse every run of whitespace (including newlines) into
  // a single space so sentence-boundary detection sees a clean paragraph and
  // never splits a sentence mid-word.
  const flat = text.replace(/\s+/g, ' ').trim()
  // Keep closing quote marks glued to the terminator that precedes them.
  // German dialogue like `„Mir ist heiß!" stöhnte er.` must stay as one
  // sentence — otherwise the stray `"` hops onto the next line and both the
  // word count and the karaoke alignment drift.
  const CLOSE_QUOTES = '"\'\u201C\u201D\u2018\u2019\u00BB'
  const re = new RegExp(
    `[^.!?]+[.!?]+[${CLOSE_QUOTES}]*|[^.!?]+[${CLOSE_QUOTES}]+|[^.!?]+$`,
    'g'
  )
  return (flat.match(re) || []).map(s => s.trim()).filter(Boolean)
}

function resolvePageList(pageNode, spec) {
  // `spec` can be a single page (e.g. "1"), a comma list ("1,3,5"),
  // a hyphen range ("1-4"), or "all". Returns a sorted list of numeric
  // page IDs that actually exist on `pageNode`.
  const present = Object.keys(pageNode || {})
    .map(k => Number(k))
    .filter(n => Number.isFinite(n))
    .sort((a, b) => a - b)
  if (!spec || spec === 'all') return present
  const wanted = new Set()
  for (const part of String(spec).split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const lo = Number(range[1])
      const hi = Number(range[2])
      for (let i = Math.min(lo, hi); i <= Math.max(lo, hi); i++) wanted.add(i)
    } else if (/^\d+$/.test(trimmed)) {
      wanted.add(Number(trimmed))
    }
  }
  return present.filter(p => wanted.has(p))
}

async function main() {
  const { key, lang, page, pages, out } = parseArgs()
  if (!key || !lang || !out || (!page && !pages)) {
    console.error(
      'Usage: --key fa-1 --lang de [--page 1 | --pages all|1-4|1,3,5] --out <file.txt>'
    )
    process.exit(1)
  }

  const i18n = await loadBooksI18n()
  const pageNode = i18n?.[lang]?.[key]?.page
  if (!pageNode) {
    console.error(`No pages for ${lang}.${key}`)
    process.exit(1)
  }

  const pageList = resolvePageList(pageNode, pages || page)
  if (!pageList.length) {
    console.error(`No pages matched for ${lang}.${key} (spec: ${pages || page})`)
    process.exit(1)
  }

  const allSentences = []
  for (const p of pageList) {
    const node = pageNode[p]
    if (!node || !node.text) {
      console.error(`WARN: no text for ${lang}.${key}.page.${p}`)
      continue
    }
    for (const s of splitSentences(node.text)) allSentences.push(s)
  }

  if (!allSentences.length) {
    console.error(`No sentences extracted for ${lang}.${key}`)
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, allSentences.join('\n') + '\n', 'utf8')
  console.log(
    `wrote ${out} (${allSentences.length} sentences across ${pageList.length} page(s): ${pageList.join(', ')})`
  )
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

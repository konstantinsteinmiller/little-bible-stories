# Audio alignment workflow (free, local)

Generates a **word-level timing JSON** from an audiobook `.ogg` and its
authored text so the read-along highlight follows the actual speech.

## Tool

- **[faster-whisper](https://github.com/SYSTRAN/faster-whisper)** — a
  CTranslate2 build of OpenAI Whisper. Runs fully local on CPU or GPU,
  no account, no cloud. Returns word-level timestamps natively. It reads
  `.ogg` / `.mp3` / `.wav` / `.m4a` through its bundled PyAV — you do
  **not** need ffmpeg/ffprobe on PATH.

Authored text is then stitched over whisper's transcription so the
highlight labels match your manuscript exactly (whisper keeps the timing,
your text file supplies the spelling).

## One-time setup

```bash
pip install faster-whisper
```

First run downloads the model weights (~460 MB for `small`). Verify:

```bash
python -c "from faster_whisper import WhisperModel; print('ok')"
```

## Generate alignment for a page

Example: page 1 of `fa-1` in German.

```bash
# 1. Dump the authored text to a plain file (one sentence per line)
node scripts/extract-page-text.mjs \
  --key fa-1 --lang de --page 1 \
  --out scripts/align-input/fa-1-de-page-1.txt

# 2. Run alignment (whisper transcribes + we stitch authored text over its timings)
python scripts/align-audio.py \
  --audio public/audiobooks/fruit-agents/volume-1/de-fruit-agents-volume-1-page-1.ogg \
  --text  scripts/align-input/fa-1-de-page-1.txt \
  --lang  de \
  --out   public/audiobooks/fruit-agents/volume-1/de-fruit-agents-volume-1-page-1.align.json \
  --model small
```

Language codes are ISO-639-1: `de`, `en`, `fr`, `es`, …

`--model` trades speed for accuracy: `tiny` / `base` / `small` / `medium` /
`large-v3`. `small` is usually the right balance for children's audiobooks.

The JSON is written **next to the audio file** with a `.align.json` suffix.
`AppBookDetailView.vue` looks for that file automatically at runtime.

## Output format

```json
{
  "audio": "public/audiobooks/.../de-...-page-1.ogg",
  "lang": "de",
  "duration": 61.42,
  "sentences": [
    {
      "text": "Die Sonne brannte heiß.",
      "start": 0.12, "end": 2.03,
      "words": [
        { "text": "Die",    "start": 0.12, "end": 0.38 },
        { "text": "Sonne",  "start": 0.38, "end": 0.92 },
        { "text": "brannte","start": 0.92, "end": 1.48 },
        { "text": "heiß",   "start": 1.48, "end": 2.03 }
      ]
    }
  ]
}
```

Sentence boundaries are derived from the per-word whisper timings by
regrouping aligned words back into the authored sentences. Because the
authored word count drives the grouping, sentence boundaries always match
your manuscript exactly even if whisper merged or split a phrase.

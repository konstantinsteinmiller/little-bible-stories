#!/usr/bin/env python3
"""
Word-level alignment of a known text against an audio file.

Backend: faster-whisper (CTranslate2 build of OpenAI Whisper). Runs fully
local, CPU or GPU, free. Returns word-level timestamps natively — no
separate forced-alignment step, no ffmpeg/ffprobe needed on PATH for the
common formats (.ogg, .mp3, .wav, .m4a) because faster-whisper reads audio
through its bundled PyAV.

One-time install:
    pip install faster-whisper

Usage:
    python scripts/align-audio.py \
        --audio public/audiobooks/.../de-...-page-1.ogg \
        --text  scripts/align-input/fa-1-de-page-1.txt \
        --lang  de \
        --out   public/audiobooks/.../de-...-page-1.align.json \
        --model small

Language codes are ISO-639-1 (`de`, `en`, `fr`, …).

Model sizes (trade speed for accuracy):
    tiny  | base | small | medium | large-v3
    ~75MB | 150  | 460   | 1.5GB  | ~3GB

Output JSON schema — consumed by AppBookDetailView.vue:
    {
      "audio":    "<relative audio path>",
      "lang":     "de",
      "duration": 61.42,
      "sentences": [
          {
            "text":  "Die Sonne brannte heiß.",
            "start": 0.12, "end": 2.03,
            "words": [
              { "text": "Die",    "start": 0.12, "end": 0.38 },
              { "text": "Sonne",  "start": 0.38, "end": 0.92 },
              ...
            ]
          }
      ]
    }

The authored text from --text is used to CORRECT whisper's transcription
token-by-token so highlighting matches your manuscript exactly (whisper may
mis-spell proper nouns or pick different punctuation; we keep whisper's
timing and substitute its word string with the authored word it aligns to).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

WORD_RE = re.compile(r"[^\s]+", re.UNICODE)
SENT_RE = re.compile(r"[^.!?]+[.!?]+|[^.!?]+$")


def split_sentences(raw: str) -> list[str]:
    out = []
    for ln in raw.splitlines():
        ln = ln.strip()
        if not ln:
            continue
        parts = SENT_RE.findall(ln)
        if parts:
            out.extend(p.strip() for p in parts if p.strip())
        else:
            out.append(ln)
    return out


def split_words(sentence: str) -> list[str]:
    return WORD_RE.findall(sentence)


def normalize(w: str) -> str:
    return re.sub(r"[^\w]", "", w, flags=re.UNICODE).lower()


def whisper_words(audio: Path, lang: str, model_name: str) -> tuple[list[dict], float]:
    """Run faster-whisper and return (word_list, duration)."""
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ModuleNotFoundError:
        print(
            "ERROR: faster-whisper is not installed.\n"
            "  pip install faster-whisper",
            file=sys.stderr,
        )
        raise SystemExit(2)

    print(f"loading whisper model '{model_name}' (first run downloads weights)…",
          file=sys.stderr)
    model = WhisperModel(model_name, device="auto", compute_type="auto")

    segments, info = model.transcribe(
        str(audio),
        language=lang,
        word_timestamps=True,
        vad_filter=False,
        beam_size=5,
    )

    words: list[dict] = []
    duration = float(getattr(info, "duration", 0.0) or 0.0)
    for seg in segments:
        for w in (seg.words or []):
            text = (w.word or "").strip()
            if not text:
                continue
            words.append({
                "text": text,
                "start": float(w.start),
                "end": float(w.end),
            })
        if seg.end and seg.end > duration:
            duration = float(seg.end)
    return words, duration


def align_to_authored(whisper_w: list[dict], authored: list[str]) -> list[dict]:
    """
    Monotonic alignment: walk both lists forward. If normalized tokens match,
    take whisper timing + authored spelling. If they diverge, take the next
    whisper word anyway and label it with the next authored word — this
    keeps the word count equal to the authored text so sentence boundaries
    line up with the manuscript.
    """
    out: list[dict] = []
    i = j = 0
    while j < len(authored) and i < len(whisper_w):
        wi = whisper_w[i]
        aj = authored[j]
        out.append({
            "text": aj,
            "start": round(wi["start"], 3),
            "end": round(wi["end"], 3),
        })
        i += 1
        j += 1

    # If we ran out of whisper words but still have authored text, stretch
    # the final interval proportionally so highlighting reaches the end.
    if j < len(authored) and out:
        last = out[-1]
        tail = len(authored) - j
        span = max(0.3, (last["end"] - last["start"]))
        per = span
        t = last["end"]
        for k in range(tail):
            out.append({
                "text": authored[j + k],
                "start": round(t, 3),
                "end": round(t + per, 3),
            })
            t += per
    return out


def group_into_sentences(words: list[dict], sentences: list[str]) -> list[dict]:
    """Regroup the flat word list back into the sentence structure."""
    out = []
    idx = 0
    for sent in sentences:
        count = len(split_words(sent))
        if count == 0:
            continue
        slice_ = words[idx: idx + count]
        idx += count
        if not slice_:
            continue
        out.append({
            "text": sent,
            "start": slice_[0]["start"],
            "end": slice_[-1]["end"],
            "words": slice_,
        })
    return out


def build(audio: Path, text_path: Path, lang: str, out: Path, model_name: str) -> None:
    raw = text_path.read_text(encoding="utf-8")
    sentences = split_sentences(raw)
    if not sentences:
        raise SystemExit(f"No sentences found in {text_path}")
    authored_words = [w for s in sentences for w in split_words(s)]
    if not authored_words:
        raise SystemExit("Authored text has no words")

    whisper_w, duration = whisper_words(audio, lang, model_name)
    if not whisper_w:
        raise SystemExit(
            "Whisper returned no words — check the audio file and language."
        )

    aligned = align_to_authored(whisper_w, authored_words)
    sentence_blocks = group_into_sentences(aligned, sentences)

    payload = {
        "audio": str(audio).replace("\\", "/"),
        "lang": lang,
        "duration": round(duration, 3),
        "sentences": sentence_blocks,
    }

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"wrote {out}  "
        f"({len(sentence_blocks)} sentences, {len(aligned)} words, "
        f"{duration:.1f}s)"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True, type=Path)
    ap.add_argument("--text", required=True, type=Path)
    ap.add_argument("--lang", required=True, help="ISO-639-1 code: de | en | fr | ...")
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--model", default="small",
                    help="faster-whisper model size: tiny | base | small | medium | large-v3")
    args = ap.parse_args()
    build(args.audio, args.text, args.lang, args.out, args.model)


if __name__ == "__main__":
    main()

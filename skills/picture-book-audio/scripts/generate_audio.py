#!/usr/bin/env python3
"""
generate_audio.py — Versatile audio CLI for Picture-Book Studio.

Subcommands
-----------
  tts   Generate speech audio from text (edge-tts → gTTS fallback).
  sfx   Generate a procedural sound-effect WAV.
  tone  Alias for sfx.
  info  Inspect a .wav/.mp3 and print a ready-to-paste AudioClipCue snippet.

Examples
--------
  # Narration
  python generate_audio.py tts "Once upon a time" --name act1-narration
  python generate_audio.py tts "Hello world" --voice en-US-GuyNeural --rate +10% --pitch +2st -o ./public/audio/output.mp3

  # Sound effects
  python generate_audio.py sfx page_turn --name page1
  python generate_audio.py sfx magic_sparkle --duration 1.5 --name sparkle
  python generate_audio.py sfx wind --duration 3.0
  python generate_audio.py sfx chord --freq 261.63 --duration 2.0
  python generate_audio.py sfx sweep --freq 200 --freq-end 1200 --duration 1.0

  # Inspect
  python generate_audio.py info ./public/audio/narration.mp3 --start-time 2.5
"""

from __future__ import annotations

import argparse
import math
import os
import random
import struct
import sys
import wave
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants & Dynamic Audio Directory Resolution
# ---------------------------------------------------------------------------
BUNDLED_ENGINE_AUDIO_DIR = (
    Path(__file__).resolve().parents[3] / "engine" / "public" / "audio"
)


def resolve_default_audio_dir(output_dir: str | Path | None = None) -> Path:
    if output_dir:
        return Path(output_dir).resolve()
    cwd = Path.cwd().resolve()
    if (cwd / "public").is_dir() or (cwd / "src" / "engine" / "schema.ts").is_file():
        return cwd / "public" / "audio"
    if BUNDLED_ENGINE_AUDIO_DIR.parent.is_dir():
        return cwd / "public" / "audio"
    return Path("./public/audio").resolve()


DEFAULT_AUDIO_DIR = resolve_default_audio_dir()
SAMPLE_RATE = 44100
CHANNELS = 1
SAMPWIDTH = 2  # 16-bit

VOICES = {
    "ana":   "en-US-AnaNeural",
    "aria":  "en-US-AriaNeural",
    "guy":   "en-US-GuyNeural",
    "sonia": "en-GB-SoniaNeural",
}
DEFAULT_VOICE = "en-US-AnaNeural"

# ---------------------------------------------------------------------------
# SFX Presets — pure Python (wave + math), no external deps
# ---------------------------------------------------------------------------

def _write_wav(path: Path, samples: list[float], sr: int = SAMPLE_RATE) -> Path:
    """Write mono 16-bit WAV from normalised float samples in [-1, 1]."""
    path.parent.mkdir(parents=True, exist_ok=True)
    peak = max(abs(s) for s in samples) if samples else 1.0
    scale = 32767 / max(peak, 1e-6)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPWIDTH)
        wf.setframerate(sr)
        raw = b"".join(struct.pack("<h", max(-32768, min(32767, int(s * scale)))) for s in samples)
        wf.writeframes(raw)
    return path


def _envelope(t: float, dur: float, attack: float = 0.01, release: float = 0.05) -> float:
    """Simple linear attack/release envelope."""
    if t < attack:
        return t / attack
    if t > dur - release:
        return max(0.0, (dur - t) / release)
    return 1.0


def _sine(freq: float, t: float) -> float:
    return math.sin(2.0 * math.pi * freq * t)


def _noise() -> float:
    return random.uniform(-1.0, 1.0)


# ---- Presets ----

def _sfx_page_turn(dur: float, **_kw) -> list[float]:
    """Quick papery whoosh."""
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = _envelope(t, dur, 0.005, dur * 0.4)
        # Band-limited noise with descending centre
        centre = 3000 - 2000 * (t / dur)
        raw = _noise()
        # Simple 1-pole lowpass approximation
        lp = raw * max(0.0, 1.0 - abs(t * SAMPLE_RATE * 2 * math.pi / centre) * 0.00001)
        out.append(lp * env * 0.7)
    return out


def _sfx_wind(dur: float, **_kw) -> list[float]:
    """Gentle breeze (filtered noise with slow LFO modulation)."""
    n = int(SAMPLE_RATE * dur)
    out = []
    prev = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = _envelope(t, dur, dur * 0.25, dur * 0.25)
        mod = 0.5 + 0.5 * math.sin(2 * math.pi * 0.3 * t)
        raw = _noise()
        alpha = 0.05 + 0.1 * mod
        prev = prev * (1 - alpha) + raw * alpha
        out.append(prev * env * 4.0)
    return out


def _sfx_footsteps(dur: float, **_kw) -> list[float]:
    """Rhythmic soft taps."""
    n = int(SAMPLE_RATE * dur)
    step_interval = 0.45
    out = [0.0] * n
    t_total = 0.0
    while t_total < dur:
        start = int(t_total * SAMPLE_RATE)
        tap_dur = 0.06
        tap_samples = int(tap_dur * SAMPLE_RATE)
        for j in range(min(tap_samples, n - start)):
            t = j / SAMPLE_RATE
            env = math.exp(-t * 60)
            out[start + j] += _noise() * env * 0.6
        t_total += step_interval + random.uniform(-0.03, 0.03)
    return out


def _sfx_magic_sparkle(dur: float, **_kw) -> list[float]:
    """Rising shimmer arpeggio with harmonics."""
    n = int(SAMPLE_RATE * dur)
    out = [0.0] * n
    freqs = [1200, 1600, 2000, 2400, 2800, 3200]
    spacing = dur / (len(freqs) + 1)
    for idx, f in enumerate(freqs):
        onset = spacing * (idx + 0.5)
        note_dur = min(0.3, dur - onset)
        if note_dur <= 0:
            break
        for j in range(int(note_dur * SAMPLE_RATE)):
            t = j / SAMPLE_RATE
            si = int((onset + t) * SAMPLE_RATE)
            if si >= n:
                break
            env = math.exp(-t * 8)
            val = _sine(f, t) * 0.3 + _sine(f * 2, t) * 0.15
            out[si] += val * env * 0.5
    return out


def _sfx_boing(dur: float, freq: float = 300, **_kw) -> list[float]:
    """Cartoony spring boing."""
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 5)
        f = freq * (1.0 + 3.0 * math.exp(-t * 12))
        out.append(_sine(f, t) * env * 0.7)
    return out


def _sfx_drum_roll(dur: float, **_kw) -> list[float]:
    """Accelerating drum roll."""
    n = int(SAMPLE_RATE * dur)
    out = [0.0] * n
    hits = int(dur * 16)
    for h in range(hits):
        frac = h / max(1, hits - 1)
        interval = 0.12 * (1.0 - 0.7 * frac)
        onset = sum(0.12 * (1.0 - 0.7 * (k / max(1, hits - 1))) for k in range(h))
        if onset >= dur:
            break
        hit_dur = 0.04
        for j in range(int(hit_dur * SAMPLE_RATE)):
            si = int(onset * SAMPLE_RATE) + j
            if si >= n:
                break
            t = j / SAMPLE_RATE
            env = math.exp(-t * 80)
            out[si] += _noise() * env * 0.5
    return out


def _sfx_chord(dur: float, freq: float = 261.63, **_kw) -> list[float]:
    """Major triad chord."""
    n = int(SAMPLE_RATE * dur)
    out = []
    f_root = freq
    f_third = freq * 5 / 4
    f_fifth = freq * 3 / 2
    for i in range(n):
        t = i / SAMPLE_RATE
        env = _envelope(t, dur, 0.02, dur * 0.3)
        val = (_sine(f_root, t) + _sine(f_third, t) * 0.8 + _sine(f_fifth, t) * 0.7) / 2.5
        out.append(val * env * 0.6)
    return out


def _sfx_sweep(dur: float, freq: float = 200, freq_end: float = 1200, **_kw) -> list[float]:
    """Frequency sweep from freq to freq_end."""
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        frac = t / dur
        f = freq * (1 - frac) + freq_end * frac
        env = _envelope(t, dur, 0.01, 0.05)
        out.append(_sine(f, t) * env * 0.6)
    return out


def _sfx_tone(dur: float, freq: float = 440, **_kw) -> list[float]:
    """Pure sine tone at given frequency."""
    n = int(SAMPLE_RATE * dur)
    out = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = _envelope(t, dur, 0.01, 0.05)
        out.append(_sine(freq, t) * env * 0.6)
    return out


SFX_PRESETS: dict[str, callable] = {
    "page_turn":     _sfx_page_turn,
    "wind":          _sfx_wind,
    "footsteps":     _sfx_footsteps,
    "magic_sparkle": _sfx_magic_sparkle,
    "boing":         _sfx_boing,
    "drum_roll":     _sfx_drum_roll,
    "chord":         _sfx_chord,
    "sweep":         _sfx_sweep,
    "tone":          _sfx_tone,
}

# ---------------------------------------------------------------------------
# TTS Command
# ---------------------------------------------------------------------------

def cmd_tts(args):
    """Generate speech audio from text."""
    text: str = args.text
    voice: str = VOICES.get(args.voice, args.voice) if args.voice else DEFAULT_VOICE
    name: str = args.name or "tts-output"
    audio_dir = resolve_default_audio_dir(getattr(args, "output_dir", None))
    out_path: Path = Path(args.output) if args.output else audio_dir / f"{name}.mp3"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rate_str = args.rate or "+0%"
    pitch_str = args.pitch or "+0Hz"

    # Try edge-tts first
    try:
        import asyncio
        import edge_tts  # type: ignore

        async def _gen():
            communicate = edge_tts.Communicate(text, voice, rate=rate_str, pitch=pitch_str)
            await communicate.save(str(out_path))

        asyncio.run(_gen())
        print(f"[edge-tts] Saved: {out_path}")
        _print_clip_snippet(str(out_path), name, args.start_time)
        return
    except ImportError:
        print("[edge-tts] Not installed, falling back to gTTS...", file=sys.stderr)
    except Exception as e:
        print(f"[edge-tts] Error: {e}. Falling back to gTTS...", file=sys.stderr)

    # Fallback: gTTS
    try:
        from gtts import gTTS  # type: ignore

        tts = gTTS(text=text, lang="en")
        tts.save(str(out_path))
        print(f"[gTTS] Saved: {out_path}")
        _print_clip_snippet(str(out_path), name, args.start_time)
        return
    except ImportError:
        print("ERROR: Neither edge-tts nor gTTS is installed.", file=sys.stderr)
        print("Install with: pip install edge-tts   OR   pip install gTTS", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[gTTS] Error: {e}", file=sys.stderr)
        sys.exit(1)


# ---------------------------------------------------------------------------
# SFX Command
# ---------------------------------------------------------------------------

def cmd_sfx(args):
    """Generate a procedural sound-effect WAV."""
    preset_name: str = args.preset
    dur: float = args.duration or 0.5
    freq: float = args.freq or 440.0
    freq_end: float = args.freq_end or (freq * 4)
    name: str = args.name or preset_name
    audio_dir = resolve_default_audio_dir(getattr(args, "output_dir", None))
    out_path: Path = Path(args.output) if args.output else audio_dir / f"{name}.wav"

    gen_fn = SFX_PRESETS.get(preset_name)
    if gen_fn is None:
        print(f"ERROR: Unknown SFX preset '{preset_name}'.", file=sys.stderr)
        print(f"Available presets: {', '.join(sorted(SFX_PRESETS.keys()))}", file=sys.stderr)
        sys.exit(1)

    samples = gen_fn(dur=dur, freq=freq, freq_end=freq_end)
    _write_wav(out_path, samples)
    print(f"[sfx] Saved: {out_path}  ({dur:.2f}s, {SAMPLE_RATE} Hz, 16-bit mono)")
    _print_clip_snippet(str(out_path), name, args.start_time)


# ---------------------------------------------------------------------------
# Info Command
# ---------------------------------------------------------------------------

def cmd_info(args):
    """Inspect an audio file and print an AudioClipCue snippet."""
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"ERROR: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    duration_sec: float | None = None
    ext = file_path.suffix.lower()

    if ext == ".wav":
        try:
            with wave.open(str(file_path), "rb") as wf:
                frames = wf.getnframes()
                rate = wf.getframerate()
                duration_sec = frames / rate if rate > 0 else 0.0
                print(f"Format   : WAV")
                print(f"Channels : {wf.getnchannels()}")
                print(f"SampWidth: {wf.getsampwidth()} bytes ({wf.getsampwidth()*8}-bit)")
                print(f"FrameRate: {rate} Hz")
                print(f"Frames   : {frames}")
                print(f"Duration : {duration_sec:.3f}s")
        except Exception as e:
            print(f"ERROR reading WAV: {e}", file=sys.stderr)
            sys.exit(1)

    elif ext in (".mp3", ".m4a", ".ogg"):
        # Try mutagen for duration
        try:
            from mutagen import File as MutagenFile  # type: ignore
            audio = MutagenFile(str(file_path))
            if audio and audio.info:
                duration_sec = audio.info.length
                print(f"Format   : {ext.upper().lstrip('.')}")
                print(f"Duration : {duration_sec:.3f}s")
                if hasattr(audio.info, "sample_rate"):
                    print(f"SampleRate: {audio.info.sample_rate} Hz")
                if hasattr(audio.info, "channels"):
                    print(f"Channels : {audio.info.channels}")
                if hasattr(audio.info, "bitrate"):
                    print(f"Bitrate  : {audio.info.bitrate} bps")
        except ImportError:
            # Estimate MP3 duration from file size (~128kbps)
            size_bytes = file_path.stat().st_size
            duration_sec = size_bytes / (128 * 1024 / 8)
            print(f"Format   : {ext.upper().lstrip('.')} (estimated — install `mutagen` for exact info)")
            print(f"FileSize : {size_bytes} bytes")
            print(f"Duration : ~{duration_sec:.1f}s (estimated at 128kbps)")
        except Exception as e:
            print(f"Warning: Could not read metadata: {e}", file=sys.stderr)
    else:
        print(f"Warning: Unsupported extension '{ext}'. Trying as WAV...", file=sys.stderr)
        try:
            with wave.open(str(file_path), "rb") as wf:
                duration_sec = wf.getnframes() / wf.getframerate()
        except Exception:
            pass

    print()
    src_path = _compute_public_src_path(file_path)

    name = args.name or file_path.stem
    start_time = args.start_time or 0.0
    _print_clip_snippet_full(src_path, name, start_time, duration_sec)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _compute_public_src_path(file_path: Path) -> str:
    """Compute URL path relative to `public/` if inside one, else `/audio/<name>`."""
    resolved = file_path.resolve()
    parts = resolved.parts
    if "public" in parts:
        idx = len(parts) - 1 - parts[::-1].index("public")
        rel = Path(*parts[idx + 1:])
        return "/" + str(rel).replace("\\", "/")
    return "/audio/" + file_path.name


def _print_clip_snippet(file_str: str, name: str, start_time: float | None):
    """Print a ready-to-paste AudioClipCue after generating."""
    file_path = Path(file_str)
    duration_sec = None
    if file_path.suffix.lower() == ".wav" and file_path.exists():
        try:
            with wave.open(str(file_path), "rb") as wf:
                duration_sec = wf.getnframes() / wf.getframerate()
        except Exception:
            pass

    src_path = _compute_public_src_path(file_path)

    st = start_time if start_time else 0.0
    _print_clip_snippet_full(src_path, name, st, duration_sec)


def _print_clip_snippet_full(src: str, name: str, start_time: float, duration: float | None):
    """Print the TypeScript AudioClipCue snippet."""
    dur_line = f"  duration: {duration:.2f}," if duration else "  // duration: <auto from file>"
    print(f"""
// Ready-to-paste AudioClipCue:
{{
  id: '{name}',
  src: '{src}',
  startTime: {start_time},
{dur_line}
  offsetSec: 0,
  volume: 1.0,
  label: '{name}'
}}""")


# ---------------------------------------------------------------------------
# Argument Parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="generate_audio",
        description="Picture-Book Studio audio generator: TTS narration, procedural SFX, and file inspection.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--output-dir",
        help="Default output directory for generated audio files (default: ./public/audio in workspace or <plugin-root>/engine/public/audio)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # ---- tts ----
    p_tts = sub.add_parser("tts", help="Generate speech from text (edge-tts / gTTS)")
    p_tts.add_argument("text", help="Text to speak")
    p_tts.add_argument("--name", "-n", help="Clip name (used for filename and AudioClipCue id)")
    p_tts.add_argument("--voice", "-v", help=f"Voice name or shortcut ({', '.join(VOICES.keys())})")
    p_tts.add_argument("--rate", help="Speech rate adjustment, e.g. '+10%%' or '-20%%'")
    p_tts.add_argument("--pitch", help="Pitch adjustment, e.g. '+2st' or '-3Hz'")
    p_tts.add_argument("--output", "-o", help="Output file path (default: ./public/audio/<name>.mp3)")
    p_tts.add_argument("--output-dir", help="Output directory when --output is not specified (default: ./public/audio)")
    p_tts.add_argument("--start-time", type=float, default=0.0, help="startTime for the AudioClipCue snippet (default: 0)")

    # ---- sfx ----
    p_sfx = sub.add_parser("sfx", help="Generate a procedural sound-effect WAV")
    p_sfx.add_argument("preset", choices=sorted(SFX_PRESETS.keys()),
                        help="SFX preset name")
    p_sfx.add_argument("--name", "-n", help="Clip name (default: preset name)")
    p_sfx.add_argument("--duration", "-d", type=float, default=0.5, help="Duration in seconds (default: 0.5)")
    p_sfx.add_argument("--freq", "-f", type=float, default=440.0, help="Base frequency in Hz (default: 440)")
    p_sfx.add_argument("--freq-end", type=float, help="End frequency for sweep (default: freq × 4)")
    p_sfx.add_argument("--output", "-o", help="Output file path (default: ./public/audio/<name>.wav)")
    p_sfx.add_argument("--output-dir", help="Output directory when --output is not specified (default: ./public/audio)")
    p_sfx.add_argument("--start-time", type=float, default=0.0, help="startTime for the AudioClipCue snippet (default: 0)")

    # ---- tone (alias) ----
    p_tone = sub.add_parser("tone", help="Alias for sfx (generate a procedural WAV)")
    p_tone.add_argument("preset", choices=sorted(SFX_PRESETS.keys()),
                         help="SFX preset name")
    p_tone.add_argument("--name", "-n", help="Clip name (default: preset name)")
    p_tone.add_argument("--duration", "-d", type=float, default=0.5, help="Duration in seconds (default: 0.5)")
    p_tone.add_argument("--freq", "-f", type=float, default=440.0, help="Base frequency in Hz (default: 440)")
    p_tone.add_argument("--freq-end", type=float, help="End frequency for sweep (default: freq × 4)")
    p_tone.add_argument("--output", "-o", help="Output file path (default: ./public/audio/<name>.wav)")
    p_tone.add_argument("--output-dir", help="Output directory when --output is not specified (default: ./public/audio)")
    p_tone.add_argument("--start-time", type=float, default=0.0, help="startTime for the AudioClipCue snippet (default: 0)")

    # ---- info ----
    p_info = sub.add_parser("info", help="Inspect an audio file and print AudioClipCue snippet")
    p_info.add_argument("file", help="Path to the audio file (.wav, .mp3, .ogg, .m4a)")
    p_info.add_argument("--name", "-n", help="Override clip name in the snippet")
    p_info.add_argument("--start-time", type=float, default=0.0, help="startTime for the AudioClipCue snippet (default: 0)")

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "tts":
        cmd_tts(args)
    elif args.command in ("sfx", "tone"):
        cmd_sfx(args)
    elif args.command == "info":
        cmd_info(args)


if __name__ == "__main__":
    main()

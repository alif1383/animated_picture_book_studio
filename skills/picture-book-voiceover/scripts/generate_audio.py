#!/usr/bin/env python3
"""
generate_audio.py — Zero-dependency Python audio & Google AI Studio Gemini TTS helper
for Animated Picture Book Studio.

Subcommands:
  tts          --text "..." --out public/audio/narration_01.wav [--voice Sulafat] [--character narrator] [--style "..."] [--model gemini-3.8-flash-tts] [--api-key KEY]
  dialogue     --speakers "Narrator:Sulafat,Boy:Puck" --text "Narrator: Hello\nBoy: Hi!" --out public/audio/dialogue_01.wav [--styles "Narrator:Warm|Boy:Excited"]
  voice-design --prompt "A tiny squeaky clockwork owl..." --sample-text "Hoo-hoo!" [--out public/audio/owl.wav]
  voices       List all 30 Google AI Studio voices and 20 character presets
  set-key      <AIza...> (or --api-key <AIza...>)
  check-key    Check whether a Google AI Studio API key is configured
  sfx          --preset chime|whoosh|footstep|splash|page_turn|thunder|harp|pop --out public/audio/sfx.wav [--duration 1.0]
  tone         --freq 440 --duration 1.0 --out public/audio/tone.wav [--envelope bell|pad|pluck]
  info         --in public/audio/narration_01.wav
"""

import argparse
import base64
import json
import math
import os
import random
import re
import shutil
import struct
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path

SAMPLE_RATE = 44100
GEMINI_TTS_SAMPLE_RATE = 24000
DEFAULT_GEMINI_TTS_MODEL = "gemini-3.8-flash-tts"
DEFAULT_GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

GEMINI_PREBUILT_VOICES = [
    {"name": "Zephyr", "tone": "Bright"},
    {"name": "Puck", "tone": "Upbeat"},
    {"name": "Charon", "tone": "Informative"},
    {"name": "Kore", "tone": "Firm"},
    {"name": "Fenrir", "tone": "Excitable"},
    {"name": "Leda", "tone": "Youthful"},
    {"name": "Orus", "tone": "Firm"},
    {"name": "Aoede", "tone": "Breezy"},
    {"name": "Callirrhoe", "tone": "Easy-going"},
    {"name": "Autonoe", "tone": "Bright"},
    {"name": "Enceladus", "tone": "Breathy"},
    {"name": "Iapetus", "tone": "Clear"},
    {"name": "Umbriel", "tone": "Easy-going"},
    {"name": "Algieba", "tone": "Smooth"},
    {"name": "Despina", "tone": "Smooth"},
    {"name": "Erinome", "tone": "Clear"},
    {"name": "Algenib", "tone": "Gravelly"},
    {"name": "Rasalgethi", "tone": "Informative"},
    {"name": "Laomedeia", "tone": "Upbeat"},
    {"name": "Achernar", "tone": "Soft"},
    {"name": "Alnilam", "tone": "Firm"},
    {"name": "Schedar", "tone": "Even"},
    {"name": "Gacrux", "tone": "Mature"},
    {"name": "Pulcherrima", "tone": "Forward"},
    {"name": "Achird", "tone": "Friendly"},
    {"name": "Zubenelgenubi", "tone": "Casual"},
    {"name": "Vindemiatrix", "tone": "Gentle"},
    {"name": "Sadachbia", "tone": "Lively"},
    {"name": "Sadaltager", "tone": "Knowledgeable"},
    {"name": "Sulafat", "tone": "Warm"},
]

CHARACTER_VOICE_PRESETS = {
    "narrator": {
        "voice": "Sulafat",
        "style": "Warm, expressive children's picture-book narrator with gentle pacing and magical wonder",
    },
    "boy": {
        "voice": "Puck",
        "style": "Youthful, curious, energetic young boy voice in an animated storybook",
    },
    "girl": {
        "voice": "Leda",
        "style": "Bright, youthful, enthusiastic young girl voice full of wonder",
    },
    "man": {
        "voice": "Orus",
        "style": "Warm, steady, friendly adult man voice",
    },
    "woman": {
        "voice": "Aoede",
        "style": "Warm, articulate, expressive adult woman voice",
    },
    "elder_man": {
        "voice": "Charon",
        "style": "Kind, weathered, grandfatherly elder voice with unhurried warmth",
    },
    "elder_woman": {
        "voice": "Vindemiatrix",
        "style": "Gentle, calm, grandmotherly elder woman voice with soothing cadence",
    },
    "wise_elder": {
        "voice": "Gacrux",
        "style": "Deep, wise, resonant sage voice speaking with calm authority and warmth",
    },
    "king": {
        "voice": "Sadaltager",
        "style": "Noble, regal, authoritative yet warm royal king voice",
    },
    "queen": {
        "voice": "Despina",
        "style": "Regal, poised, warm and majestic royal queen voice",
    },
    "prince": {
        "voice": "Zephyr",
        "style": "Bright, earnest, spirited young prince voice",
    },
    "princess": {
        "voice": "Zephyr",
        "style": "Bright, clear, warm and spirited princess voice",
    },
    "knight": {
        "voice": "Fenrir",
        "style": "Brave, bold, heroic knight voice with energetic conviction",
    },
    "wizard": {
        "voice": "Iapetus",
        "style": "Mysterious, theatrical, wise old wizard voice with magical resonance",
    },
    "witch": {
        "voice": "Pulcherrima",
        "style": "Dramatic, intriguing, mischievous storybook witch voice",
    },
    "fairy": {
        "voice": "Laomedeia",
        "style": "Light, sparkling, whimsical fairy voice with musical cadence",
    },
    "angel": {
        "voice": "Achernar",
        "style": "Soft, serene, ethereal angelic voice with gentle reverb-like calm",
    },
    "genie": {
        "voice": "Sadachbia",
        "style": "Lively, booming, exuberant magical genie voice with playful charm",
    },
    "villain": {
        "voice": "Enceladus",
        "style": "Low, dramatic, scheming storybook villain voice, theatrical but family-friendly",
    },
    "shadow_figure": {
        "voice": "Umbriel",
        "style": "Hushed, enigmatic, shadowy whispery voice with quiet suspense",
    },
}


def get_config_file_path():
    config_dir = os.environ.get("PICTURE_BOOK_CONFIG_DIR", "").strip() or os.path.join(
        Path.home(), ".gemini", "config", "animated_picture_book_studio"
    )
    return os.path.join(config_dir, "config.json")


def parse_dot_env_file(file_path):
    result = {}
    if not os.path.exists(file_path):
        return result
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                trimmed = line.strip()
                if not trimmed or trimmed.startswith("#"):
                    continue
                m = re.match(r"^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", trimmed)
                if not m:
                    continue
                key = m.group(1)
                val = m.group(2).strip()
                if (val.startswith('"') and val.endswith('"')) or (
                    val.startswith("'") and val.endswith("'")
                ):
                    val = val[1:-1]
                result[key] = val
    except Exception:
        pass
    return result


def resolve_gemini_api_key(explicit_key=None, cwd=None):
    if explicit_key and explicit_key.strip():
        return {"apiKey": explicit_key.strip(), "source": "cli-flag"}
    if os.environ.get("GEMINI_API_KEY", "").strip():
        return {"apiKey": os.environ["GEMINI_API_KEY"].strip(), "source": "env:GEMINI_API_KEY"}
    if os.environ.get("GOOGLE_API_KEY", "").strip():
        return {"apiKey": os.environ["GOOGLE_API_KEY"].strip(), "source": "env:GOOGLE_API_KEY"}

    work_dir = cwd or os.getcwd()
    for env_path in [os.path.join(work_dir, ".env"), os.path.join(work_dir, "engine", ".env")]:
        parsed = parse_dot_env_file(env_path)
        if parsed.get("GEMINI_API_KEY", "").strip():
            return {"apiKey": parsed["GEMINI_API_KEY"].strip(), "source": f"dotenv:{env_path}"}
        if parsed.get("GOOGLE_API_KEY", "").strip():
            return {"apiKey": parsed["GOOGLE_API_KEY"].strip(), "source": f"dotenv:{env_path}"}

    config_path = get_config_file_path()
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            key = (data.get("geminiApiKey") or data.get("apiKey") or "").strip()
            if key:
                return {"apiKey": key, "source": f"config:{config_path}"}
        except Exception:
            pass
    return {"apiKey": "", "source": "none"}


def save_gemini_api_key(api_key):
    cleaned = (api_key or "").strip()
    if not cleaned:
        raise ValueError("Cannot save an empty API key.")
    config_path = get_config_file_path()
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    existing = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = {}
    existing["geminiApiKey"] = cleaned
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)
    try:
        os.chmod(config_path, 0o600)
    except Exception:
        pass
    return config_path


def mask_api_key(key):
    if not key or len(key) < 8:
        return "****"
    return f"{key[:4]}...{key[-4:]}"


def resolve_voice_and_style(voice=None, character=None, style=None):
    char_key = (character or "").strip().lower()
    preset = CHARACTER_VOICE_PRESETS.get(char_key)
    resolved_voice = (voice or "").strip()
    if not resolved_voice:
        resolved_voice = preset["voice"] if preset else "Sulafat"
    else:
        for v in GEMINI_PREBUILT_VOICES:
            if v["name"].lower() == resolved_voice.lower():
                resolved_voice = v["name"]
                break
    resolved_style = (style or "").strip() or (preset["style"] if preset else "")
    return resolved_voice, resolved_style


def decode_gemini_audio_to_wav_bytes(base64_data, sample_rate=GEMINI_TTS_SAMPLE_RATE):
    raw = base64.b64decode(base64_data)
    if len(raw) >= 44 and raw[:4] == b"RIFF" and raw[8:12] == b"WAVE":
        return raw
    data_size = len(raw)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,
        b"WAVE",
        b"fmt ",
        16,
        1,
        1,
        sample_rate,
        sample_rate * 2,
        2,
        16,
        b"data",
        data_size,
    )
    return header + raw


def read_wav_duration_bytes(buf):
    if len(buf) < 44 or buf[:4] != b"RIFF":
        return 0.0
    byte_rate = struct.unpack_from("<I", buf, 28)[0]
    offset = 12
    data_bytes = max(0, len(buf) - 44)
    while offset + 8 <= len(buf):
        chunk_id = buf[offset : offset + 4]
        chunk_size = struct.unpack_from("<I", buf, offset + 4)[0]
        if chunk_id == b"data":
            data_bytes = chunk_size
            break
        offset += 8 + chunk_size
    return round(data_bytes / byte_rate, 3) if byte_rate > 0 else 0.0


def synthesize_gemini_speech_http(
    api_key,
    mode="single",
    text="",
    voice="Sulafat",
    character="",
    style="",
    speakers=None,
    turns=None,
    model=DEFAULT_GEMINI_TTS_MODEL,
):
    api_base = (
        os.environ.get("GEMINI_API_BASE_URL", "").strip() or DEFAULT_GEMINI_API_BASE
    ).rstrip("/")
    is_38 = "3.8" in (model or "")
    if mode == "multi":
        parts = []
        for turn in turns or []:
            part = {"text": turn["text"]}
            meta = {"speaker": turn["speaker"]}
            if turn.get("style"):
                meta["style"] = turn["style"]
            part["speech_metadata"] = meta
            parts.append(part)
        speaker_configs = [
            {
                "speaker": s["speaker"],
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": s["voice"]}},
            }
            for s in (speakers or [])
        ]
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "multiSpeakerVoiceConfig": {"speakerVoiceConfigs": speaker_configs}
                },
            },
        }
    else:
        resolved_voice, resolved_style = resolve_voice_and_style(voice, character, style)
        part = {"text": text}
        if is_38 and resolved_style:
            part["speech_metadata"] = {"style": resolved_style}
        elif not is_38 and resolved_style:
            part["text"] = f"{resolved_style}: {text}"
        payload = {
            "contents": [{"parts": [part]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": resolved_voice}}
                },
            },
        }

    url = f"{api_base}/models/{urllib.parse.quote(model)}:generateContent?key={urllib.parse.quote(api_key)}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    inline = None
    for p in parts:
        if p.get("inlineData", {}).get("data"):
            inline = p["inlineData"]
            break
    if not inline:
        raise RuntimeError("Gemini TTS response did not include inlineData.data audio.")
    wav_bytes = decode_gemini_audio_to_wav_bytes(inline["data"])
    return wav_bytes, read_wav_duration_bytes(wav_bytes)


def write_wav(path, samples, sample_rate=SAMPLE_RATE):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            frames.extend(struct.pack("<h", int(clamped * 32767)))
        wf.writeframes(bytes(frames))
    return round(len(samples) / sample_rate, 3)


def inspect_wav(path):
    with wave.open(str(path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        channels = wf.getnchannels()
        duration = round(frames / float(rate), 3) if rate else 0.0
    return {"path": str(path), "durationSec": duration, "sampleRate": rate, "channels": channels}


def synthesize_speech_fallback(text, out_path):
    words = [w for w in text.strip().split() if w]
    duration = max(1.4, len(words) * 0.36 + 0.35)
    total = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total):
        t = i / SAMPLE_RATE
        syl = max(0.0, math.sin(t * math.pi * 3.8)) ** 1.4
        f0 = 185 + 25 * math.sin(t * 2.3) + 12 * math.cos(t * 5.1)
        sig = (
            0.55 * math.sin(2 * math.pi * f0 * t)
            + 0.25 * math.sin(2 * math.pi * (f0 * 2) * t)
            + 0.12 * math.sin(2 * math.pi * (f0 * 3) * t)
        )
        fade_in = min(1.0, t / 0.04)
        fade_out = min(1.0, (duration - t) / 0.08)
        samples.append(sig * syl * fade_in * fade_out * 0.3)
    return write_wav(out_path, samples)


def run_tts(
    text,
    out_path,
    voice=None,
    character=None,
    style=None,
    model=DEFAULT_GEMINI_TTS_MODEL,
    api_key=None,
):
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    key_info = resolve_gemini_api_key(api_key)
    if key_info["apiKey"]:
        try:
            wav_bytes, dur = synthesize_gemini_speech_http(
                api_key=key_info["apiKey"],
                mode="single",
                text=text,
                voice=voice,
                character=character,
                style=style,
                model=model,
            )
            with open(out_path, "wb") as f:
                f.write(wav_bytes)
            print(f"[generate_audio.py] Created TTS ({ model }): {out_path} ({dur}s)")
            return
        except Exception as err:
            print(
                f"[generate_audio.py] Gemini TTS failed ({err}); falling back to local TTS.",
                file=sys.stderr,
            )

    if shutil.which("edge-tts") and shutil.which("ffmpeg"):
        mp3_tmp = str(out_path) + ".tmp.mp3"
        edge_voice = voice or "en-US-AriaNeural"
        res = subprocess.run(["edge-tts", "--voice", edge_voice, "--text", text, "--write-media", mp3_tmp])
        if res.returncode == 0 and os.path.exists(mp3_tmp):
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3_tmp, str(out_path)])
            os.remove(mp3_tmp)
            info = inspect_wav(out_path)
            print(f"[generate_audio.py] Created TTS (edge-tts): {out_path} ({info['durationSec']}s)")
            return

    for cmd in [
        ["espeak-ng", "-w", str(out_path), text],
        ["espeak", "-w", str(out_path), text],
        ["say", "-o", str(out_path), "--data-format=LEI16@44100", text],
    ]:
        if shutil.which(cmd[0]):
            res = subprocess.run(cmd)
            if res.returncode == 0 and os.path.exists(out_path):
                info = inspect_wav(out_path)
                print(f"[generate_audio.py] Created TTS ({cmd[0]}): {out_path} ({info['durationSec']}s)")
                return

    dur = synthesize_speech_fallback(text, out_path)
    print(f"[generate_audio.py] Created procedural speech placeholder: {out_path} ({dur}s)")


def run_sfx(preset, out_path, duration=None):
    dur = float(duration) if duration else (1.8 if preset == "thunder" else 1.2 if preset == "harp" else 0.75)
    total = int(dur * SAMPLE_RATE)
    rng = random.Random(42)
    samples = []
    for i in range(total):
        t = i / SAMPLE_RATE
        p = t / dur
        s = 0.0
        if preset == "chime":
            notes = [523.25, 659.25, 783.99, 1046.5]
            for idx, f in enumerate(notes):
                nt = t - idx * 0.09
                if nt >= 0:
                    s += math.sin(2 * math.pi * f * nt) * math.exp(-nt * 3.5) * 0.28
        elif preset == "whoosh":
            noise = rng.uniform(-1, 1)
            env = math.sin(math.pi * p) ** 1.6
            f = 180 + 520 * math.sin(math.pi * p)
            s = (noise * 0.35 + math.sin(2 * math.pi * f * t) * 0.25) * env
        elif preset == "footstep":
            noise = rng.uniform(-1, 1)
            s = (math.sin(2 * math.pi * 95 * t) * 0.6 + noise * 0.4) * math.exp(-t * 22) * 0.6
        elif preset == "splash":
            noise = rng.uniform(-1, 1)
            s = (noise * 0.55 + math.sin(2 * math.pi * (280 + 180 * math.sin(t * 28)) * t) * 0.25) * math.exp(-t * 4.5) * 0.6
        elif preset == "page_turn":
            noise = rng.uniform(-1, 1)
            s = noise * (math.sin(math.pi * p) ** 1.8) * 0.32
        elif preset == "thunder":
            noise = rng.uniform(-1, 1)
            s = (noise * 0.45 + math.sin(2 * math.pi * 58 * t) * 0.4) * math.exp(-t * 1.6) * 0.65
        elif preset == "harp":
            chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]
            for idx, f in enumerate(chord):
                nt = t - idx * 0.11
                if nt >= 0:
                    s += (math.sin(2 * math.pi * f * nt) + 0.3 * math.sin(4 * math.pi * f * nt)) * math.exp(-nt * 2.6) * 0.2
        else:
            f = 320 + 680 * math.exp(-t * 24)
            s = math.sin(2 * math.pi * f * t) * math.exp(-t * 18) * 0.55
        samples.append(s)
    actual_dur = write_wav(out_path, samples)
    print(f"[generate_audio.py] Created SFX ({preset}): {out_path} ({actual_dur}s)")


def run_tone(freq, dur, out_path, envelope="bell"):
    total = int(dur * SAMPLE_RATE)
    samples = []
    for i in range(total):
        t = i / SAMPLE_RATE
        p = t / dur
        if envelope == "pad":
            env = math.sin(math.pi * p) ** 1.2
        elif envelope == "pluck":
            env = math.exp(-t * 6.5)
        else:
            env = math.exp(-t * 2.8) * min(1.0, t / 0.015)
        sig = (
            0.65 * math.sin(2 * math.pi * freq * t)
            + 0.22 * math.sin(2 * math.pi * freq * 2 * t)
            + 0.08 * math.sin(2 * math.pi * freq * 3 * t)
        )
        samples.append(sig * env * 0.45)
    actual_dur = write_wav(out_path, samples)
    print(f"[generate_audio.py] Created tone ({freq}Hz, {envelope}): {out_path} ({actual_dur}s)")


def main():
    parser = argparse.ArgumentParser(description="Picture Book Audio & Gemini TTS Generator")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_tts = sub.add_parser("tts")
    p_tts.add_argument("--text", required=True)
    p_tts.add_argument("--out", required=True)
    p_tts.add_argument("--voice", default=None)
    p_tts.add_argument("--character", default=None)
    p_tts.add_argument("--style", default=None)
    p_tts.add_argument("--model", default=DEFAULT_GEMINI_TTS_MODEL)
    p_tts.add_argument("--api-key", dest="api_key", default=None)

    p_set = sub.add_parser("set-key")
    p_set.add_argument("positional_key", nargs="?", default=None)
    p_set.add_argument("--api-key", "--key", dest="api_key", default=None)

    p_check = sub.add_parser("check-key")
    p_check.add_argument("--api-key", dest="api_key", default=None)

    sub.add_parser("voices")

    p_sfx = sub.add_parser("sfx")
    p_sfx.add_argument("--preset", default="chime")
    p_sfx.add_argument("--out", required=True)
    p_sfx.add_argument("--duration", type=float, default=None)

    p_tone = sub.add_parser("tone")
    p_tone.add_argument("--freq", type=float, default=440.0)
    p_tone.add_argument("--duration", type=float, default=1.0)
    p_tone.add_argument("--envelope", default="bell")
    p_tone.add_argument("--out", required=True)

    p_info = sub.add_parser("info")
    p_info.add_argument("--in", dest="inp", required=True)

    args = parser.parse_args()
    if args.cmd == "tts":
        run_tts(
            args.text,
            args.out,
            args.voice,
            args.character,
            args.style,
            args.model,
            args.api_key,
        )
    elif args.cmd == "set-key":
        key = args.api_key or args.positional_key
        saved = save_gemini_api_key(key)
        print(
            f"[generate_audio.py] Saved Google AI Studio API key ({mask_api_key(key)}) to {saved}"
        )
    elif args.cmd == "check-key":
        res = resolve_gemini_api_key(args.api_key)
        if res["apiKey"]:
            print(
                f"[generate_audio.py] Google AI Studio API key is configured ({mask_api_key(res['apiKey'])}, source: {res['source']}).\nConfigured: YES"
            )
        else:
            print(
                f"[generate_audio.py] No Google AI Studio API key found.\nConfigured: NO\nGet a key at https://aistudio.google.com/apikey"
            )
    elif args.cmd == "voices":
        for k, v in CHARACTER_VOICE_PRESETS.items():
            print(f"{k.ljust(15)} -> {v['voice'].ljust(14)} | {v['style']}")
    elif args.cmd == "sfx":
        run_sfx(args.preset, args.out, args.duration)
    elif args.cmd == "tone":
        run_tone(args.freq, args.duration, args.out, args.envelope)
    elif args.cmd == "info":
        print(json.dumps(inspect_wav(args.inp), indent=2))


if __name__ == "__main__":
    main()

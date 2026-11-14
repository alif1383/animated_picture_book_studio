---
name: picture-book-audio
description: >-
  Add, edit, sync, or generate audio — narration, voiceovers, music, or sound
  effects — for specific parts of a Picture-Book Studio video. Covers built-in
  procedural WebAudio cues, user-provided audio clips, and AI-generated
  narration / custom SFX via the bundled generate_audio.py script.
---

# Picture-Book Audio Skill

This skill teaches an Antigravity agent how to work with **all three audio
modes** in the Picture-Book Crayon Video Engine (`<workspace>`, scaffolded from `<plugin-root>/engine/`).

> [!IMPORTANT]
> The active engine workspace is `<workspace>`. Audio assets go in
> `<workspace>/public/audio/`. Never modify engine source files
> unless the task explicitly requires adding a new procedural synthesiser
> kind — follow `picture-book-agent-coder` standards for that.

---

## Mode A — Built-in Procedural WebAudio Cues (`audioCues`)

The engine's `PictureBookSoundEngine` synthesises sound effects entirely
in-browser using the WebAudio API. No external audio files required.

### How It Works

Each scene has an optional `audioCues: AudioNoteCue[]` array:

```ts
// src/engine/schema.ts
interface AudioNoteCue {
  time: number;      // Scene timestamp in seconds when the cue fires
  freq: number;      // Frequency in Hz
  duration: number;  // How long the sound plays (seconds)
  kind?: AudioCueKind; // Synthesiser preset (default: 'lullaby')
}
```

Cues fire at **stepped 6 FPS boundaries** via
`soundEngine.triggerCuesForFrame(cues, prevTime, curTime)` during live
preview, and are rendered offline via
`soundEngine.renderOfflineAudio(cues, start, dur)` into the `.mp4` audio
track during video export.

### AudioCueKind Reference

| Kind               | Character / Feel                                   |
|--------------------|----------------------------------------------------|
| `lullaby`          | Warm triangle-wave music-box note (default)        |
| `crayon_scribble`  | Papery foley — bandpass-filtered grain noise        |
| `chime`            | Bright sine music-box bell with 3× overtone        |
| `birthday_song`    | Glockenspiel + sub-octave (Happy Birthday melody)  |
| `party_horn`       | Sawtooth kazoo with upward pitch slide              |
| `confetti_pop`     | Pitch-drop thump + sparkle chimes + paper burst     |
| `cheer_applause`   | Rhythmic hand-claps + major-triad "Hooray!" chord   |
| `candle_blow`      | Breathy filtered-noise whoosh                       |
| `giggle`           | Two-note bouncy pitch hop ("hee-hee!")              |

### Note / Frequency Quick-Reference

| Note | Hz       |
|------|----------|
| C4   | 261.63   |
| D4   | 293.66   |
| E4   | 329.63   |
| F4   | 349.23   |
| G4   | 392.00   |
| A4   | 440.00   |
| B4   | 493.88   |
| C5   | 523.25   |
| D5   | 587.33   |
| E5   | 659.25   |

### Example — Adding Cues to a Scene

```ts
// In your scene definition file:
audioCues: [
  // Act 1: gentle lullaby melody
  { time: 0.5,  freq: 329.63, duration: 0.4, kind: 'lullaby' },  // E4
  { time: 1.2,  freq: 392.00, duration: 0.4, kind: 'lullaby' },  // G4
  { time: 2.0,  freq: 523.25, duration: 0.6, kind: 'chime'   },  // C5 chime

  // Act 2: character walks (crayon scribble foley)
  { time: 5.0,  freq: 600,    duration: 0.3, kind: 'crayon_scribble' },
  { time: 5.8,  freq: 650,    duration: 0.25, kind: 'crayon_scribble' },

  // Birthday party act
  { time: 12.0, freq: 440,    duration: 0.8, kind: 'party_horn'    },
  { time: 13.0, freq: 500,    duration: 0.15, kind: 'confetti_pop' },
  { time: 14.0, freq: 261.63, duration: 1.0, kind: 'cheer_applause'},
  { time: 15.5, freq: 800,    duration: 0.6, kind: 'giggle'        },
]
```

### Syncing Cues to Acts and Keyframes

1. Look at the scene's `acts[]` array for `startTime` and `endTime`.
2. Place `AudioNoteCue.time` values to coincide with keyframe actions
   (e.g., a character entering → `crayon_scribble`, a cake appearing →
   `confetti_pop`).
3. Leave 0.1–0.3 s gaps between cues so they don't overlap harshly.

### Adding a New Procedural Synthesiser Kind

1. Add the new kind string to the `AudioCueKind` union in
   `<workspace>/src/engine/schema.ts`.
2. Add a private `synthesize<Name>()` method in
   `<workspace>/src/audio/soundEngine.ts` following the existing
   patterns (create oscillators/buffers → gain envelope → `connectOutput`).
3. Add an `else if` branch in `scheduleCueOnContext()`.
4. Run `agy-node scripts/studio-cli.mjs test` and `agy-node scripts/studio-cli.mjs build` in `<workspace>`.

---

## Mode B — User-Provided Audio Files (`audioClips`)

For narration, voiceovers, background music, or pre-recorded sound
effects, use the `audioClips: AudioClipCue[]` array on a scene.

### AudioClipCue Interface

```ts
// src/engine/schema.ts
interface AudioClipCue {
  id?: string;           // Unique identifier (e.g. 'act1-voiceover')
  src: string;           // URL path — e.g. '/audio/narration.mp3'
  startTime: number;     // Scene time (sec) when the clip starts playing
  duration?: number;     // Max play duration (sec); defaults to full clip length
  offsetSec?: number;    // Offset into the source file (sec); default 0
  volume?: number;       // 0.0–2.0 (default 1.0)
  label?: string;        // Human description (e.g. 'Opening narration')
}
```

### Step-by-Step Workflow

1. **Place the audio file** in `<workspace>/public/audio/`:
   ```
   <workspace>/public/audio/act1-voiceover.mp3
   <workspace>/public/audio/background-music.wav
   ```
   Vite serves `public/` at the root, so `/audio/act1-voiceover.mp3` works.

2. **Add clips to the scene definition**:
   ```ts
   audioClips: [
     {
       id: 'act1-voiceover',
       src: '/audio/act1-voiceover.mp3',
       startTime: 0.5,
       duration: 5.5,
       offsetSec: 0,
       volume: 1.0,
       label: 'Opening narration'
     },
     {
       id: 'bg-music',
       src: '/audio/background-music.wav',
       startTime: 0,
       volume: 0.3,
       label: 'Soft background music'
     }
   ]
   ```

3. **Preview** — Open the dev server (`http://localhost:5173/?scene=<id>`)
   and play the scene. `PictureBookSoundEngine` automatically plays
   `audioClips` in real-time sync with the scene clock.

4. **Export** — When exporting to `.mp4`, `renderOfflineAudio` fetches
   and decodes every overlapping `AudioClipCue`, schedules it on the
   `OfflineAudioContext` at the correct offset (with `gain = clip.volume`),
   and mixes it with procedural `audioCues`. **Your narration and SFX
   end up baked into the final video!**

### Supported Formats

| Format | Extension | Notes                              |
|--------|-----------|------------------------------------|
| MP3    | `.mp3`    | Universally decoded by browsers    |
| WAV    | `.wav`    | Lossless, larger files             |
| OGG    | `.ogg`    | Good compression, broad support    |
| M4A    | `.m4a`    | AAC in MP4 container               |

### Tips

- Keep clip durations tight — trim silence from the start/end.
- Use `offsetSec` to skip an intro in a longer audio file.
- Use `volume: 0.3` for background music so narration stays clear.
- Use the `info` subcommand of `generate_audio.mjs` to inspect duration
  and get a ready-to-paste `AudioClipCue` snippet.

---

## Mode C — Generating Audio with `generate_audio.mjs`

A bundled zero-dependency Node CLI at
`<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs`
(also scaffolded to `<workspace>/scripts/generate_audio.mjs`)
can **generate** narration and custom WAV sound effects on demand via `agy-node` without requiring Python or any external packages.

### Subcommand: `tts` — Text-to-Speech Narration

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "<text>" --name <clip-name> [options]
```

| Flag         | Default              | Description                         |
|--------------|----------------------|-------------------------------------|
| `--name`     | `tts-output`         | Clip name (becomes filename + id)   |
| `--voice`    | `en-US-AnaNeural`    | Voice name or shortcut              |
| `--rate`     | `+0%`                | Speed adjustment (`+10%`, `-20%`)   |
| `--pitch`    | `+0Hz`               | Pitch shift (`+2st`, `-3Hz`)        |
| `--output`   | `public/audio/<name>.wav` | Custom output path             |
| `--start-time` | `0`                | startTime in the AudioClipCue snippet |

**Voice shortcuts**: `ana` → `en-US-AnaNeural`, `aria` → `en-US-AriaNeural`,
`guy` → `en-US-GuyNeural`, `sonia` → `en-GB-SoniaNeural`.

**Example — Generate narration for each act:**

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "Once upon a time, in a tiny crayon village..." \
  --name act1-narration --voice ana --rate -10%

agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "And so the little moon drifted off to sleep." \
  --name act5-narration --voice sonia --start-time 22.0
```

Output is saved to `./public/audio/act1-narration.wav` (or `.mp3` if `edge-tts` is available) in `<workspace>` and
the script prints a ready-to-paste `AudioClipCue` TypeScript snippet.

### Subcommand: `sfx` / `tone` — Procedural WAV Sound Effects

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx <preset> --name <clip-name> [options]
```

| Flag         | Default | Description                              |
|--------------|---------|------------------------------------------|
| `--name`     | preset  | Clip name (filename + id)                |
| `--duration` | `0.5`   | Duration in seconds                      |
| `--freq`     | `440`   | Base frequency in Hz                     |
| `--freq-end` | freq×4  | End frequency (for `sweep` preset)       |
| `--output`   | auto    | Custom output path                       |
| `--start-time` | `0`   | startTime for the snippet                |

**Available SFX presets:**

| Preset          | Description                                        |
|-----------------|----------------------------------------------------|
| `page_turn`     | Quick papery whoosh                                |
| `wind`          | Gentle breeze (LFO-modulated filtered noise)       |
| `footsteps`     | Rhythmic soft taps                                 |
| `magic_sparkle` | Rising shimmer arpeggio                            |
| `boing`         | Cartoony spring boing                              |
| `drum_roll`     | Accelerating drum roll                             |
| `chord`         | Major triad chord at given frequency               |
| `sweep`         | Frequency sweep from `--freq` to `--freq-end`      |
| `tone`          | Pure sine wave at given frequency                  |

**Examples:**

```bash
# Page-turn whoosh
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx page_turn --duration 0.3 --name page-flip

# Wind ambient (3 seconds)
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx wind --duration 3.0 --name bg-wind --start-time 0

# Magic sparkle
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx magic_sparkle --duration 1.5 --name act3-sparkle

# C-major chord
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx chord --freq 261.63 --duration 2.0 --name c-chord

# Frequency sweep 200→1200 Hz
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx sweep --freq 200 --freq-end 1200 --duration 1.0 --name whoosh
```

All files save to `./public/audio/<name>.wav` in `<workspace>` by default.

### Subcommand: `info` — Inspect Audio Files

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" info <path> [--start-time <sec>] [--name <id>]
```

Prints format details (channels, sample rate, duration) and a
ready-to-paste `AudioClipCue` TypeScript snippet:

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" info ./public/audio/narration.wav --start-time 2.5
```

---

## Complete Workflow Example

**Task**: "Add narration for each act of the Sun & Moon story"

```bash
# 1. Generate narration clips
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "The sun rose over the crayon village" \
  --name sunrise-narration --voice ana --rate -5%

agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "As evening fell, the moon appeared" \
  --name sunset-narration --voice sonia --start-time 6.0

agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" tts "Goodnight little moon, goodnight" \
  --name goodnight-narration --voice ana --rate -15% --start-time 22.0

# 2. Generate a custom SFX
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx magic_sparkle --duration 1.2 --name star-appear --start-time 10.5
```

Then add the clips to the scene definition:

```ts
// In shortSample1.ts (or wherever the scene is defined):
audioClips: [
  {
    id: 'sunrise-narration',
    src: '/audio/sunrise-narration.mp3',
    startTime: 0.5,
    volume: 1.0,
    label: 'Act 1 narration'
  },
  {
    id: 'sunset-narration',
    src: '/audio/sunset-narration.mp3',
    startTime: 6.0,
    volume: 1.0,
    label: 'Act 2 narration'
  },
  {
    id: 'star-appear',
    src: '/audio/star-appear.wav',
    startTime: 10.5,
    duration: 1.2,
    volume: 0.8,
    label: 'Stars appearing sparkle'
  },
  {
    id: 'goodnight-narration',
    src: '/audio/goodnight-narration.mp3',
    startTime: 22.0,
    volume: 1.0,
    label: 'Final goodnight narration'
  }
],

// Procedural cues still work alongside:
audioCues: [
  { time: 0.5, freq: 329.63, duration: 0.4, kind: 'lullaby' },
  // ...
]
```

Both `audioCues` (procedural) and `audioClips` (file-based) are mixed
together in the final `.mp4` export automatically.

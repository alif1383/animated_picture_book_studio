---
name: picture-book-audio
description: >-
  Add, edit, sync, or generate sound effects (SFX), dynamic background music
  (BGM), and external audio clips for a Picture-Book Studio video. Covers
  modular procedural WebAudio cues (`audioCues`), pre-rendered WAV tracks
  (`scripts/sfx/*.mjs`), external `audioClips`, and isolated parallel SFX
  subagents. (For voiceover/narration/character speech, use
  `picture-book-voiceover`.)
---

# Studio Audio Skill (SFX, Dynamic BGM & `audioClips` — Both Animation Styles)

This skill covers **sound effects, dynamic background music, and `audioClips` integration** across **both** Studio animation styles — **Picture-Book Crayon Style (`artStyle: 'crayon'`, `6 FPS`)** and **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`, `12 FPS`)** (`<workspace>`, scaffolded from `<plugin-root>/engine/`).

> [!IMPORTANT]
> - **For voiceovers, story narration, or character speech**, load **`skills/picture-book-voiceover/SKILL.md`** instead.
> - **Style-Aware Cue Selection**: In **Classic Hand-Drawn Animation (`classic_cel`)** scenes, do **NOT** use `crayon_scribble` cues (which are papery wax-crayon foley for `crayon` scenes). Instead favor orchestral/storybook cues (`lullaby`, `chime`, `garden_wind_chime`, `medieval_lute`, `fire_crackle`, etc.) and rich multi-section WAV BGM/foley clips.
> - **Parallel Side-by-Side Execution**: Isolated SFX/BGM subagents should run **concurrently alongside** code, custom asset, and voiceover subagents. Each SFX subagent creates only its standalone file (`src/audio/sfx/<sfxName>.ts` or `scripts/sfx/<clipName>.mjs`) and returns metadata/catalog text so the orchestrator wires shared registries (`schema.ts`, `index.ts`, `AUDIO_CATALOG.md`) cleanly with zero file collisions.

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

Cues fire at **stepped scene FPS boundaries** (`6 FPS` for `'crayon'`, `12 FPS` for `'classic_cel'`) via
`soundEngine.triggerCuesForFrame(cues, prevTime, curTime)` during live
preview, and are rendered offline via
`soundEngine.renderOfflineAudio(cues, start, dur)` into the `.mp4` audio
track during video export.

### AudioCueKind Reference (`src/audio/sfx/<name>.ts`)

For the complete catalog of all **16 procedural WebAudio synthesizers** (`src/audio/sfx/*.ts`) and **5 pre-rendered `.wav` tracks** (`public/audio/*.wav` + `scripts/sfx/*.mjs`) with descriptions and fitting story themes, always consult [`references/audio-catalog.md`](references/audio-catalog.md) and `<workspace>/docs/AUDIO_CATALOG.md`.

| Kind               | Module File (`src/audio/sfx/`) | Character / Feel                                   |
|--------------------|--------------------------------|----------------------------------------------------|
| `lullaby`          | `lullaby.ts`                   | Warm triangle-wave music-box note (default)        |
| `crayon_scribble`  | `crayonScribble.ts`            | Papery foley — bandpass-filtered grain noise        |
| `chime`            | `chime.ts`                     | Bright sine music-box bell with 3× overtone        |
| `birthday_song`    | `birthdaySong.ts`              | Glockenspiel + sub-octave (Happy Birthday melody)  |
| `party_horn`       | `partyHorn.ts`                 | Sawtooth kazoo with upward pitch slide              |
| `confetti_pop`     | `confettiPop.ts`               | Pitch-drop thump + sparkle chimes + paper burst     |
| `cheer_applause`   | `cheerApplause.ts`             | Rhythmic hand-claps + major-triad "Hooray!" chord   |
| `candle_blow`      | `candleBlow.ts`                | Breathy filtered-noise whoosh                       |
| `giggle`           | `giggle.ts`                    | Two-note bouncy pitch hop ("hee-hee!")              |
| `ocean_wave`       | `oceanWave.ts`                 | Rolling lowpass ocean surf swell + frothy crest     |
| `water_splash`     | `waterSplash.ts`               | Splash spray burst + 4 bubbly water-droplet blips   |
| `floatie_squeak`   | `floatieSqueak.ts`             | Two-chirp inflatable vinyl/rubber-ducky squeak      |
| `fire_crackle`     | `fireCrackle.ts`               | Warm lowpass campfire ember bed + 4 wood-snap pops  |
| `dragon_fire`      | `dragonFire.ts`                | Sweeping bandpass flame whoosh + dragon throat roar |
| `spear_clink`      | `spearClink.ts`                | Metallic spear-on-tooth clink + upward cork pop     |
| `medieval_lute`    | `medievalLute.ts`              | Plucked medieval lute/harp string + sub-octave      |

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

### Adding a New Sound Effect (Isolated Per-SFX Subagent & One-File-Per-SFX Modularity)

Whenever a scene needs a new procedural WebAudio cue or a new pre-rendered `.wav` clip not yet in [`references/audio-catalog.md`](references/audio-catalog.md) / `<workspace>/docs/AUDIO_CATALOG.md`, **spin up an isolated subagent** for each new sound effect and keep **every sound effect in its own standalone modular file**:

1. **For a New Procedural WebAudio SFX (`<workspace>/src/audio/sfx/<sfxName>.ts`)**:
   - Add the new kind string to the `AudioCueKind` union in `<workspace>/src/engine/schema.ts`.
   - Create `<workspace>/src/audio/sfx/<sfxName>.ts` exporting a `ProceduralSfxModule` object (`kind`, `title`, `category`, `description`, `themes`, `defaultFreqHz`, `defaultDurationSec`, `synthesize`).
   - Register the module in `<workspace>/src/audio/sfx/index.ts` (`PROCEDURAL_SFX_MODULES` and `PROCEDURAL_SFX_REGISTRY`).
2. **For a New Pre-Rendered `.wav` Clip (`<workspace>/scripts/sfx/<clipName>.mjs` -> `<workspace>/public/audio/<clip-name>.wav`)**:
   - Create `<workspace>/scripts/sfx/<clipName>.mjs` exporting its metadata (`id`, `filename`, `src`, `title`, `category`, `durationSec`, `defaultVolume`, `targetPeak`, `description`, `themes`) and `generate()` function.
   - Register it in `<workspace>/scripts/sfx/index.mjs` (`WAV_SFX_MODULES`) and `<workspace>/src/audio/sfx/index.ts` (`AUDIO_CLIP_CATALOG`), then run `agy-node scripts/generate_medieval_audio.mjs` to write `<workspace>/public/audio/<clip-name>.wav`.
3. **Register in the Audio Catalog**:
   - Document the new sound effect's description, parameters, and fitting story themes in both `<workspace>/docs/AUDIO_CATALOG.md` and `skills/picture-book-audio/references/audio-catalog.md`.
4. **Verify**:
   - Run `agy-node scripts/studio-cli.mjs test` and `agy-node scripts/studio-cli.mjs build` in `<workspace>`.

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

### Tips & Mandatory Audio Choreography Rules

- **Dynamic Background Music Across Story Sections (Match Tempo & Energy to the Action)**:
  - Background music does **not** have to stay static or monotonous across the entire video — actively shift the music's tempo, rhythm, intensity, and instrumentation to match different parts of the story:
    - **Action / Chase / Battle / Urgent scenes**: Faster tempo, driving percussion/rhythm, energetic articulation.
    - **Calm / Cozy / Dialogue / Bedtime scenes**: Slower tempo, gentle sparse instrumentation, softer volume (`volume: 0.20–0.35`) so voiceovers stay crisp and intelligible.
    - **Mystery / Suspense / Comedy / Celebration**: Shift tonal color and motifs (e.g., Dorian/minor sneaky plucks, bouncy comedic rhythms, bright celebratory fanfares).
  - Implement dynamic BGM either as a **multi-section score** in a dedicated generator (`scripts/sfx/<name>.mjs` -> `public/audio/<name>.wav`, modeled after `scripts/sfx/medievalFantasyBgm.mjs`'s 5-section arc) OR as **sequential per-act BGM `AudioClipCue` entries** with explicit `duration` capped cleanly at each act boundary (and/or varying procedural `audioCues` tempo/density per act) so two BGM tracks never clash.
- **Voice Clip Scene-Boundary Hygiene & Non-Overlapping Speakers**:
  - Always check actual WAV duration (`generate_audio.mjs info`) and let each voice finish completely before scene/act changes unless an intentional cut-off is scripted (`act.endTime >= clip.startTime + wavDuration + 0.4..0.8s`).
  - Whenever a character/scene changes, the previous character's voice must end at or before that transition — cap `AudioClipCue.duration` (`duration <= transitionTime - startTime`) so voice audio never bleeds into the next scene.
  - Never overlap multiple characters' voice clips (`clipNext.startTime < clipPrevEnd`) unless specifically scripting simultaneous speech or interruptions; keep a `~0.25–0.6s` gap between speakers.
- **Trimming & Gain**:
  - Keep clip durations tight — trim silence from the start/end.
  - Use `offsetSec` to skip an intro in a longer audio file.
  - Use `volume: 0.20–0.35` for background music under voiceover so narration and character voices stay clear (`volume: 0.90–1.0`).
  - Use the `info` subcommand of `generate_audio.mjs` to inspect duration and get a ready-to-paste `AudioClipCue` snippet.

---

## Mode C — Generating Procedural WAV SFX & Inspecting Clips (`generate_audio.mjs`)

> [!TIP]
> **For Voiceovers, Story Narration & Character Dialogue**: Load **`skills/picture-book-voiceover/SKILL.md`** — it is the single source of truth for Google AI Studio Generate Speech (`check-key`, `set-key`, `voices`, `tts`, `dialogue`, `voice-design`) and voice lip-sync/cutoff rules.

The bundled zero-dependency Node CLI at `<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs` (also at `<workspace>/scripts/generate_audio.mjs`) generates quick ad-hoc procedural WAV sound effects and inspects any audio file's exact duration:

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

**Available SFX presets:** `page_turn` (papery whoosh), `wind` (gentle breeze), `footsteps` (soft taps), `magic_sparkle` (rising shimmer), `boing` (spring boing), `drum_roll` (accelerating drum roll), `chord` (major triad), `sweep` (frequency sweep), `tone` (sine tone).

```bash
# Examples (save to ./public/audio/<name>.wav in <workspace> by default):
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx page_turn --duration 0.3 --name page-flip
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx magic_sparkle --duration 1.2 --name star-appear --start-time 10.5
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" sfx sweep --freq 200 --freq-end 1200 --duration 1.0 --name whoosh
```

### Subcommand: `info` — Inspect Audio Files

```bash
agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs" info ./public/audio/<clip>.wav --start-time 2.5
```

Prints channels, sample rate, exact duration, and a ready-to-paste `AudioClipCue` snippet.

---

## Complete Workflow Example (Dynamic BGM + SFX + Voice Clips)

```ts
// Inside a SceneDefinition (mixing multi-section or per-act BGM, SFX clips, voiceover WAVs, and procedural cues):
audioClips: [
  {
    id: 'bgm-calm-opening',
    src: '/audio/meadow-calm-bgm.wav',
    startTime: 0,
    duration: 14.0,     // Capped cleanly at the action-scene transition
    volume: 0.25,       // Ducked under voiceover
    label: 'Act I-II gentle BGM',
  },
  {
    id: 'bgm-action-chase',
    src: '/audio/action-chase-bgm.wav',
    startTime: 14.0,
    duration: 12.0,     // Faster, rhythmic BGM for the action act
    volume: 0.35,
    label: 'Act III fast action BGM',
  },
  {
    id: 'star-appear',
    src: '/audio/star-appear.wav',
    startTime: 10.5,
    duration: 1.2,
    volume: 0.8,
    label: 'Stars appearing sparkle',
  },
],
audioCues: [
  { time: 0.5, freq: 620, duration: 0.25, kind: 'crayon_scribble' },
  { time: 14.2, freq: 520, duration: 0.45, kind: 'confetti_pop' },
],
```

Both `audioCues` (procedural) and `audioClips` (file-based) are mixed together in the final `.mp4` export automatically.


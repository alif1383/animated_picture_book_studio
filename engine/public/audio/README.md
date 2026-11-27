# Audio Clips Directory (`public/audio/`)

Place `.wav`, `.mp3`, `.ogg`, or `.m4a` files in this folder to reference them in a scene's `audioClips` array via `/audio/<filename>`.

For the complete catalog of all **20 procedural WebAudio synthesizers** (`src/audio/sfx/*.ts`) and **11 pre-rendered `.wav` tracks** (`public/audio/*.wav` + `scripts/sfx/*.mjs`), see [`docs/AUDIO_CATALOG.md`](../../docs/AUDIO_CATALOG.md).

---

## Bundled `.wav` Tracks in `public/audio/`

Each `.wav` file below is deterministically synthesized by its own modular script in `scripts/sfx/<clipName>.mjs` (orchestrated by `scripts/generate_medieval_audio.mjs`):

| File (`public/audio/`) | Generator Script (`scripts/sfx/`) | Duration | Default Vol | Description & Fitting Themes |
| :--- | :--- | :---: | :---: | :--- |
| `medieval-fantasy-bgm.wav` | `scripts/sfx/medievalFantasyBgm.mjs` | `64.0s` | `0.55` | 5-section medieval fantasy score (Karplus-Strong lute/harp, wooden recorder, brass horn fanfare, tabor drum). Themes: `medieval`, `fantasy`, `castle`, `knight`, `dragon`, `quest`, `village`. |
| `campfire-crackle.wav` | `scripts/sfx/campfireCrackle.mjs` | `9.0s` | `0.72` | Cozy woodland campfire ember rumble, roasting meat spit sizzle, and 68 stochastic wood-snap crackles. Themes: `camping`, `forest`, `nighttime`, `medieval`, `hearth`, `cooking`, `cozy`. |
| `dragon-fire-breath.wav` | `scripts/sfx/dragonFireBreath.mjs` | `2.8s` | `0.78` | Deep chest-vibrato dragon throat growl (`72–108 Hz`) + sweeping bandpass flame whoosh + crackling tail. Themes: `dragon`, `medieval`, `fantasy`, `fire`, `magic`, `action`. |
| `spear-tooth-pop.wav` | `scripts/sfx/spearToothPop.mjs` | `1.6s` | `0.90` | Spear-on-tooth metallic/wood clink impacts + upward lever creak + comical cork POP! + ascending D-major relief chime arpeggio. Themes: `medieval`, `knight`, `dragon`, `tooth_fix`, `comedy_pop`, `relief`. |
| `horse-trot.wav` | `scripts/sfx/horseTrot.mjs` | `4.0s` | `0.62` | Rhythmic coconut-shell and dirt-path clip-clop cavalry hooves + subtle metallic bridle jingle. Themes: `medieval`, `horse`, `knight`, `travel`, `march`, `countryside`. |
| `moonlit-cat-lullaby-bgm.wav` | `scripts/sfx/moonlitCatLullabyBgm.mjs` | `30.0s` | `0.28` | 5-section F-major / D-minor 3/4 storybook lullaby score (celesta, concert harp, cello pad, wind chimes). Themes: `bedtime`, `lullaby`, `cat`, `garden`, `moonlit`, `night`. |
| `bandana-dog-bgm.wav` | `scripts/sfx/bandanaDogBgm.mjs` | `38.0s` | `0.26` | Dynamic 3-section backyard ukulele → park fetch chase → cozy golden afternoon harp soundtrack. Themes: `dog`, `pet`, `backyard`, `park`, `sunny`, `playful`. |
| `bandana-dog-playful-bark.wav` | `scripts/sfx/bandanaDogPlayfulBark.mjs` | `1.4s` | `0.85` | Twin dual-formant excited puppy yips, tennis-ball boing-bounces, and ascending marimba sparkle. Themes: `dog`, `pet`, `playful`, `fetch`, `comedy`. |
| `knight-hiccups-bgm.wav` | `scripts/sfx/knightHiccupsBgm.mjs` | `54.0s` | `0.52` | Dynamic 4-section silent-storytelling medieval comedy score (royal march, village mystery, bassoon comedy, festive jig). Themes: `medieval`, `comedy`, `knight`, `dragon`, `castle`. |
| `knight-hiccups-thorn-pop.wav` | `scripts/sfx/knightHiccupsThornPop.mjs` | `1.5s` | `0.92` | Taut woody-vine tug & friction creak + resonant tooth POP! + D-major relief harp glissando. Themes: `medieval`, `knight`, `dragon`, `comedy_pop`, `relief`. |
| `christmas-hearth-bgm.wav` | `scripts/sfx/christmasHearthBgm.mjs` | `48.0s` | `0.25` | Dynamic 4-section Dickensian Christmas score: G-minor snowy celesta/pizzicato (`0–16.5s`) → 120 BPM staccato bassoon comedy bounce (`16.5–28.8s`) → warm shimmering concert harp, celesta & string swell (`28.8–36.2s`) → joyful G-major Christmas waltz with sleigh-bell shimmer & Gmaj9 finale (`36.2–48.0s`). Themes: `christmas`, `winter`, `cozy_village`, `hearth`, `celebration`, `classic`. |

## Gemini TTS Voiceover Tracks (`Barnaby's Christmas Hearth`)

Synthesized via `scripts/generate_audio.mjs` for `CLASSIC_CHRISTMAS_HEARTH_SCENE` (`/classic/christmas-hearth`):

| File (`public/audio/`) | Role & Voice | Description |
| :--- | :--- | :--- |
| `xmas-hearth-narrator-01.wav` | Narrator (`Algieba`) | Opening snowy Christmas Eve storybook narration |
| `xmas-hearth-pippin-01.wav` | Pippin (`Puck`) | Pippin greeting Barnaby with warm apple pie |
| `xmas-hearth-barnaby-01.wav` | Barnaby (`Algenib`) | Grumpy Victorian badger dismissal of Christmas |
| `xmas-hearth-pippin-02.wav` | Pippin (`Puck`) | Gentle holiday encouragement about warming the hearth |
| `xmas-hearth-barnaby-02.wav` | Barnaby (`Algenib`) | Barnaby's hearty laugh and warm Christmas welcome |
| `xmas-hearth-narrator-02.wav` | Narrator (`Algieba`) | Heartwarming snowy village closing narration |

---

## Example `audioClips` Usage in a Scene

```ts
audioClips: [
  {
    src: '/audio/medieval-fantasy-bgm.wav',
    startTime: 0.0,
    duration: 64.0,
    volume: 0.55,
    label: 'Medieval Fantasy Lute, Recorder & Horn Score',
  },
  {
    src: '/audio/campfire-crackle.wav',
    startTime: 13.0,
    duration: 9.0,
    volume: 0.72,
    label: 'Campfire Crackle & Roasting Meat Spit Sizzle',
  },
]
```

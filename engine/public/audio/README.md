# Audio Clips Directory (`public/audio/`)

Place `.wav`, `.mp3`, `.ogg`, or `.m4a` files in this folder to reference them in a scene's `audioClips` array via `/audio/<filename>`.

For the complete catalog of all **16 procedural WebAudio synthesizers** (`src/audio/sfx/*.ts`) and **5 pre-rendered `.wav` tracks** (`public/audio/*.wav` + `scripts/sfx/*.mjs`), see [`docs/AUDIO_CATALOG.md`](../../docs/AUDIO_CATALOG.md).

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

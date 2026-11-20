# Picture-Book Studio — Master Audio & Sound Effects Catalog (`AUDIO_CATALOG.md`)

This catalog is the **single source of truth** for all procedural WebAudio synthesizers (`src/audio/sfx/<sfxName>.ts`) and pre-rendered `.wav` tracks (`public/audio/*.wav` + `scripts/sfx/<clipName>.mjs`) in the Picture-Book Crayon Video Engine.

> **Mandatory Scene Audio Planning Rule**:
> Whenever planning, designing, or creating a new scene, the planning/director/coder agent **MUST**:
> 1. Inspect this catalog (`docs/AUDIO_CATALOG.md` / `skills/picture-book-audio/references/audio-catalog.md`) to select existing background music (`audioClips`) and procedural sound effects (`audioCues`) that fit the scene's theme.
> 2. Identify any new theme-appropriate background music or sound effects needed for the story and pass that audio plan to the coder agent.
> 3. Use **isolated subagent(s)** with the `picture-book-audio` skill (`skills/picture-book-audio/SKILL.md`) to create each new sound effect in its **own standalone modular file** (`src/audio/sfx/<sfxName>.ts` and/or `scripts/sfx/<clipName>.mjs` generating `public/audio/<clipName>.wav`) and register its description and fitting themes in this catalog.
> 4. **Vary Background Music Across Story Sections**: Match BGM tempo, rhythm, and instrumentation to each part's narrative energy (e.g., faster, more driving music for action/chase/battle parts vs. slower, softer ducked music `volume: 0.20–0.35` under cozy/bedtime/dialogue beats), via a multi-section score (like `medieval-fantasy-bgm`) or cleanly capped per-act BGM `audioClips`.

---

## 1. Theme-to-Audio Quick Lookup Table

| Story Theme / Mood | Recommended Background Music / Loops (`audioClips`) | Recommended Procedural Cues (`audioCues: AudioNoteCue[]`) | Recommended `.wav` Foley / SFX (`audioClips`) |
| :--- | :--- | :--- | :--- |
| **Bedtime / Starlight / Lullaby** (`starry-village-night`) | Gentle `lullaby` + `chime` arpeggio sequence | `'lullaby'`, `'chime'`, `'crayon_scribble'`, `'candle_blow'` | Optional narration via `scripts/generate_audio.mjs` |
| **Birthday / Party / Celebration** (`strawberry-birthday`) | `'birthday_song'` melody sequence (`G4–G5`) | `'birthday_song'`, `'party_horn'`, `'confetti_pop'`, `'candle_blow'`, `'cheer_applause'`, `'giggle'` | `sparkle`, `pop`, `fanfare` via `scripts/generate_audio.mjs` |
| **Beach / Ocean / Summer Splash** (`sunny-beach-day`) | Periodic `'ocean_wave'` surf swells (`every ~3.5s`) | `'ocean_wave'`, `'water_splash'`, `'floatie_squeak'`, `'giggle'`, `'chime'`, `'cheer_applause'` | `whoosh`, `splash` |
| **Medieval / Fantasy / Knights & Dragons** (`knight-dragon-quest`) | `/audio/medieval-fantasy-bgm.wav` (`64.0s` 5-section lute, recorder & horn score) | `'medieval_lute'`, `'fire_crackle'`, `'dragon_fire'`, `'spear_clink'`, `'party_horn'`, `'chime'`, `'cheer_applause'` | `/audio/horse-trot.wav`, `/audio/campfire-crackle.wav`, `/audio/dragon-fire-breath.wav`, `/audio/spear-tooth-pop.wav` |
| **Cozy Village / Woodland / Camping** | `/audio/campfire-crackle.wav` (`9.0s` ambient loop) or `'medieval_lute'` / `'lullaby'` | `'fire_crackle'`, `'crayon_scribble'`, `'chime'`, `'giggle'`, `'lullaby'` | `/audio/campfire-crackle.wav`, `/audio/horse-trot.wav` |

---

## 2. Procedural WebAudio Synthesizers (`src/audio/sfx/*.ts` — 16 `AudioCueKind` Modules)

Every procedural sound effect is implemented in its own standalone file in `src/audio/sfx/<sfxName>.ts`, exports a `ProceduralSfxModule` object with structured metadata (`kind`, `title`, `category`, `description`, `themes`, `defaultFreqHz`, `defaultDurationSec`, `synthesize`), and is registered in `src/audio/sfx/index.ts` (`PROCEDURAL_SFX_REGISTRY`).

| `AudioCueKind` | Module File | Category | Default Freq (`Hz`) | Default Dur (`s`) | Sound Description & Synthesis Technique | Fitting Story Themes |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `'lullaby'` | `src/audio/sfx/lullaby.ts` | `musical_cue` | `523.25` (C5) | `0.45` | Warm triangle-wave music-box pluck with a soft `2x` sine octave overtone and gentle exponential decay. | `bedtime`, `nighttime`, `lullaby`, `storybook_closing`, `dreamy`, `gentle` |
| `'chime'` | `src/audio/sfx/chime.ts` | `musical_cue` | `880.0` (A5) | `0.55` | Crystalline sine bell tone with a bright `3x` twelfth harmonic overtone for twinkling stars and magic moments. | `magic`, `starlight`, `wonder`, `storybook_opening`, `discovery`, `bedtime` |
| `'crayon_scribble'` | `src/audio/sfx/crayonScribble.ts` | `foley` | `920.0` | `0.25` | Textured bandpass-filtered noise (`Q = 2.4`) amplitude-modulated at `18 Hz` to emulate wax crayon coloring on cold-press watercolor paper or page turns. | `storybook_opening`, `drawing`, `coloring`, `page_turn`, `footsteps`, `paper_craft` |
| `'birthday_song'` | `src/audio/sfx/birthdaySong.ts` | `musical_cue` | `392.0` (G4) | `0.42` | Bright toy glockenspiel triangle note (`3x` overtone) layered with a warm sub-octave (`0.5x`) sine accompaniment. | `birthday`, `celebration`, `party`, `singing`, `friendship`, `festival` |
| `'party_horn'` | `src/audio/sfx/partyHorn.ts` | `party` | `440.0` | `0.38` | Playful paper party blower / kazoo horn ("toot-toot!") using a pitch-sliding sawtooth wave through a resonant bandpass filter (`Q = 3.2`). | `birthday`, `party`, `celebration`, `fanfare`, `comedy`, `finale` |
| `'confetti_pop'` | `src/audio/sfx/confettiPop.ts` | `party` | `520.0` | `0.45` | Crisp paper confetti popper ("POP!") combining a rapid pitch-drop triangle thump (`freq -> 68 Hz`), a `1350 Hz` paper burst, and twin sparkle chimes (`C6` + `E6`). | `birthday`, `party`, `celebration`, `surprise`, `magic_pop` |
| `'candle_blow'` | `src/audio/sfx/candleBlow.ts` | `foley` | `420.0` | `0.55` | Soft breathy wind whoosh with a downward bandpass frequency sweep (`1.4x -> 0.45x`) and sine-windowed breath envelope. | `birthday`, `wish`, `wind`, `breeze`, `sigh_of_relief` |
| `'cheer_applause'` | `src/audio/sfx/cheerApplause.ts` | `party` | `523.25` (C5) | `0.75` | Five rhythmic paper hand-claps (`850–1290 Hz`) layered with a warm celebratory major triad chord (`1.0x`, `1.25x`, `1.5x` — "Hooray!"). | `celebration`, `victory`, `party`, `birthday`, `happy_ending`, `friendship` |
| `'giggle'` | `src/audio/sfx/giggle.ts` | `character` | `540.0` | `0.28` | Cute two-note bouncy upward pitch hop (`1.0x -> 1.26x`, `1.12x -> 1.42x`, "hee-hee!") on a triangle oscillator. | `comedy`, `happy`, `friendship`, `playful`, `children`, `relief` |
| `'ocean_wave'` | `src/audio/sfx/oceanWave.ts` | `nature` | `240.0` | `1.40` | Rolling lowpass ocean surf body swelling up to a frothy bandpass (`950 -> 480 Hz`) shoreline crest and receding onto the sand. | `beach`, `ocean`, `summer`, `island`, `nature`, `relaxing` |
| `'water_splash'` | `src/audio/sfx/waterSplash.ts` | `nature` | `460.0` | `0.36` | Crisp bandpass splash spray burst followed by four bubbly upward-popping sine water-droplet blips (`0.78x .. 1.48x`). | `beach`, `swimming`, `pool`, `ocean`, `water_play`, `summer` |
| `'floatie_squeak'` | `src/audio/sfx/floatieSqueak.ts` | `foley` | `780.0` | `0.26` | Cute inflatable vinyl / rubber-ducky two-chirp pitch bend ("squeak-squeak!") routed through a resonant bandpass filter (`Q = 2.8`). | `beach`, `summer`, `toy`, `comedy`, `water_play`, `children` |
| `'fire_crackle'` | `src/audio/sfx/fireCrackle.ts` | `nature` | `320.0` | `0.85` | Warm lowpass ember bed (`180 -> 140 Hz`) layered with four crisp bandpass wood-snap crackles (`1400–2300 Hz`) and roasting sizzle pops. | `camping`, `forest`, `nighttime`, `medieval`, `hearth`, `cozy`, `cooking` |
| `'dragon_fire'` | `src/audio/sfx/dragonFire.ts` | `fantasy` | `180.0` | `0.95` | Sweeping resonant bandpass flame billow (`1.6x -> 3.4x -> 0.95x`) combined with a deep downward sawtooth dragon throat rumble. | `dragon`, `medieval`, `fantasy`, `adventure`, `fire`, `magic` |
| `'spear_clink'` | `src/audio/sfx/spearClink.ts` | `fantasy` | `660.0` | `0.38` | Crisp twin metallic spear-tip clink harmonics (`1.5x` sine + `2.1x` triangle) followed by an upward sine cork-pop (`260 -> 780 Hz`). | `medieval`, `knight`, `dragon`, `quest`, `tooth_fix`, `action_pop` |
| `'medieval_lute'` | `src/audio/sfx/medievalLute.ts` | `musical_cue` | `293.66` (D4) | `0.48` | Plucked medieval lute / harp triangle string layered with a warm resonant sub-octave (`0.5x`) sine string. | `medieval`, `fantasy`, `castle`, `knight`, `village`, `bard`, `quest` |

---

## 3. Pre-Rendered `.wav` Audio Clips (`public/audio/*.wav` & `scripts/sfx/*.mjs`)

Every pre-rendered `.wav` clip in `public/audio/` is generated by its own standalone pure-JS module in `scripts/sfx/<clipName>.mjs` (registered in `scripts/sfx/index.mjs` and `AUDIO_CLIP_CATALOG` in `src/audio/sfx/index.ts`) and can be regenerated deterministically at any time via `agy-node scripts/generate_medieval_audio.mjs`.

| Clip ID & `src` Path | Generator Module | Category | Duration (`s`) | Default Vol | Sound Description & Synthesis Architecture | Fitting Story Themes |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **`medieval-fantasy-bgm`**<br>`/audio/medieval-fantasy-bgm.wav` | `scripts/sfx/medievalFantasyBgm.mjs` | `bgm` | `64.0s` | `0.55` | Full 5-section medieval storybook score: (1) Morning Castle Fanfare & D-Mixolydian Lute March (`0–12s`), (2) Starry Nocturnal Harp & Campfire Lullaby (`12–23s`), (3) Mysterious D-Dorian Walking Lute (`23–36s`), (4) Energetic Dragon Encounter Rhythm (`36–50s`), (5) Joyful Festival Dance & Resolving Cadence (`50–64s`). | `medieval`, `fantasy`, `castle`, `knight`, `dragon`, `quest`, `adventure`, `village` |
| **`campfire-crackle`**<br>`/audio/campfire-crackle.wav` | `scripts/sfx/campfireCrackle.mjs` | `ambient` | `9.0s` | `0.72` | Cozy woodland campfire & roasting meat spit ambiance: two-pole lowpass ember draft rumble (`~150 Hz`) + high-mid roasting meat sizzle + 68 stochastic wood-snap crackles and secondary micro-pops. | `camping`, `forest`, `nighttime`, `medieval`, `hearth`, `cooking`, `cozy` |
| **`dragon-fire-breath`**<br>`/audio/dragon-fire-breath.wav` | `scripts/sfx/dragonFireBreath.mjs` | `sfx` | `2.8s` | `0.78` | Deep resonant dragon throat growl (`72 -> 108 -> 64 Hz` with `14 Hz` chest vibrato) + state-variable sweeping bandpass roaring flame whoosh (`220–1000 Hz`) + 28 sizzling ember crackles in the tail. | `dragon`, `medieval`, `fantasy`, `fire`, `monster`, `magic`, `action` |
| **`spear-tooth-pop`**<br>`/audio/spear-tooth-pop.wav` | `scripts/sfx/spearToothPop.mjs` | `sfx` | `1.6s` | `0.90` | 4-stage comedic hero action SFX: (1) twin metallic/wooden spear-on-tooth clink impacts (`0.03s`, `0.16s`), (2) upward tension levering creak (`0.30–0.64s`), (3) resonant cavity cork POP! (`240 -> 960 Hz` at `0.65s`), (4) ascending D-major relief chime arpeggio (`D5–F#6`, `0.85–1.60s`). | `medieval`, `knight`, `dragon`, `tooth_fix`, `comedy_pop`, `relief`, `quest` |
| **`horse-trot`**<br>`/audio/horse-trot.wav` | `scripts/sfx/horseTrot.mjs` | `foley` | `4.0s` | `0.62` | Rhythmic cavalry trot (`0.46s` gait cycle): hollow coconut-shell cavity resonances (`820/580 Hz` clip-clop) + cobblestone/dirt-path grit crunch + low ground thud + subtle metallic bridle jingle (`3450/4620 Hz`). | `medieval`, `horse`, `knight`, `travel`, `march`, `countryside`, `village` |

---

## 4. Google AI Studio Generate Speech (Gemini TTS) & Voice Catalog (`docs/VOICE_CATALOG.md`, `scripts/generate_audio.mjs` & `skills/picture-book-voiceover/SKILL.md`)

Whenever a scene needs **spoken narration**, **character voices**, **multi-speaker dialogue**, or **custom voice design**, load `skills/picture-book-voiceover/SKILL.md`, consult **[`docs/VOICE_CATALOG.md`](./VOICE_CATALOG.md)** (`skills/picture-book-voiceover/references/voice-catalog.md`), and use `scripts/generate_audio.mjs`:

- **API Key Check & Persistent Setup**:
  - `agy-node scripts/generate_audio.mjs check-key` — checks `--api-key`, `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `.env`, and `~/.gemini/config/animated_picture_book_studio/config.json`.
  - `agy-node scripts/generate_audio.mjs set-key "<AIza...>"` — saves the user's Google AI Studio API key (`https://aistudio.google.com/apikey`) persistently across Antigravity sessions.
- **Voice & Character Casting Catalog (`docs/VOICE_CATALOG.md` & `src/audio/voices.ts`)**:
  - Exports typed `VOICE_CATALOG` (all 30 prebuilt Google AI Studio voices) and `CHARACTER_VOICE_PRESET_CATALOG` (all 40 character/narrator presets) classified by `gender` (`'female' | 'male'`), `ageGroup` (`'child_youth' | 'young_adult' | 'adult' | 'mature_elder'`), `pitch` (`'high' .. 'low'`), `roughness` (`'crystalline' | 'smooth' | 'warm_clear' | 'breathy' | 'husky_textured' | 'gravelly'`), `energy`, `accentAffinity`, `description`, `recommendedRoles`, and `themes`.
  - Query via CLI: `agy-node scripts/generate_audio.mjs voices --theme <theme> --gender <female|male> --age <ageGroup> --roughness <roughness> --accent <accent> --character <preset>`.
- **Single-Speaker Narration & Character Presets (`tts`)**:
  - Supports `--model gemini-3.8-flash-tts` (default), `gemini-3.8-flash-lite-tts`, and `gemini-2.5-flash-preview-tts`.
  - Supports all **40 Picture-Book Character & Narrator Presets (`--character <kind>`)**: 19 visual `CharacterKind` rigs (`little_girl`, `shopkeeper`, `moon`, `sun`, `cat`, `singing_radish`, `birthday_strawberry`, `watermelon_slice`, `blue_party_cat`, `hello_bug`, `party_banana`, `crying_onion`, `cherry_twins`, `acorn_twins`, `olive_sprout`, `knight`, `soldier`, `dragon`, `villager`), 3 narrator moods (`narrator`, `storyteller`, `bedtime`), and 18 story archetypes (`boy`, `girl`, `man`, `woman`, `elder_man`, `elder_woman`, `wise_elder`, `king`, `queen`, `prince`, `princess`, `wizard`, `witch`, `fairy`, `angel`, `genie`, `villain`, `shadow_figure`).
  - Supports all **30 Prebuilt Google AI Studio Voices (`--voice <name>`)**: `Zephyr`, `Puck`, `Charon`, `Kore`, `Fenrir`, `Leda`, `Orus`, `Aoede`, `Callirrhoe`, `Autonoe`, `Enceladus`, `Iapetus`, `Umbriel`, `Algieba`, `Despina`, `Erinome`, `Algenib`, `Rasalgethi`, `Laomedeia`, `Achernar`, `Alnilam`, `Schedar`, `Gacrux`, `Pulcherrima`, `Achird`, `Zubenelgenubi`, `Vindemiatrix`, `Sadachbia`, `Sadaltager`, `Sulafat`.
  - Supports `speech_metadata.style` acting directions via `--style "..."` and inline vocal tags `<laugh>`, `<sigh>`, `<gasp>`, `<yawn>`, `<short pause>`.
- **Multi-Speaker Scene Dialogue (`dialogue`)**:
  - `agy-node scripts/generate_audio.mjs dialogue --speakers "Narrator:Sulafat,Princess:Zephyr" --styles "Narrator:Warm|Princess:Bright" --text "..." --out public/audio/dialogue.wav`
- **Custom Prompted Voice Design (`voice-design`)**:
  - `agy-node scripts/generate_audio.mjs voice-design --prompt "A tiny squeaky clockwork owl..." --sample-text "Hoo-hoo!" --out public/audio/owl.wav` (calls `POST /v1beta/voices` and returns a reusable `voice_...` ID).
- **Quick Ad-Hoc WAV SFX Presets (`sfx` / `tone`)**:
  - Built-in `--preset` options (`chime`, `sparkle`, `pop`, `page_turn`, `footstep`, `splash`, `giggle`, `whoosh`, `thunder`, `harp`, `fanfare`, `wind`, `boing`, `drum_roll`, `chord`, `sweep`) and `tone` generator into `public/audio/`.

---

## 5. How to Add a New Sound Effect (Isolated Per-SFX Subagent Workflow)

Whenever a scene requires a new procedural sound effect or custom `.wav` clip not yet in this catalog, the coder agent **MUST** load `skills/picture-book-audio/SKILL.md` and spin up an **isolated subagent** for each new sound effect following this modular checklist:

1. **For a New Procedural WebAudio SFX (`src/audio/sfx/<sfxName>.ts`)**:
   - Add the new kind literal to `AudioCueKind` in `src/engine/schema.ts`.
   - Create a dedicated file `src/audio/sfx/<sfxName>.ts` exporting a `ProceduralSfxModule` (`kind`, `title`, `category`, `description`, `themes`, `defaultFreqHz`, `defaultDurationSec`, `synthesize`).
   - Register the module in `src/audio/sfx/index.ts` (`PROCEDURAL_SFX_MODULES` and `PROCEDURAL_SFX_REGISTRY`).
2. **For a New Pre-Rendered `.wav` Clip (`scripts/sfx/<clipName>.mjs` -> `public/audio/<clip-name>.wav`)**:
   - Create a dedicated generator module `scripts/sfx/<clipName>.mjs` exporting its metadata (`id`, `filename`, `src`, `title`, `category`, `durationSec`, `defaultVolume`, `targetPeak`, `description`, `themes`) and `generate()` function.
   - Register the generator in `scripts/sfx/index.mjs` (`WAV_SFX_MODULES`) and `src/audio/sfx/index.ts` (`AUDIO_CLIP_CATALOG`), then run `agy-node scripts/generate_medieval_audio.mjs` to write `public/audio/<clip-name>.wav`.
3. **Document in the Master Catalog**:
   - Add the new sound effect's description, parameters, and fitting story themes to both `docs/AUDIO_CATALOG.md` and `skills/picture-book-audio/references/audio-catalog.md`, plus `public/audio/README.md` if a `.wav` file was added.

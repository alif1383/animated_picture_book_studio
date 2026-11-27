---
name: picture-book-script
description: "Create a complete, engaging picture-book story script — including act-by-act visual beats, continuity/scale staging, character voice casting & acting direction sheets, and dynamic BGM/SFX cue sheets — whenever the user's prompt is brief, high-level, or lacks script detail. Load before coding or generating audio whenever the user hasn't already provided a detailed script."
---

# Story & Scriptwriting Skill (Picture-Book Crayon & Classic Hand-Drawn Cel)

Load this skill **first** (after confirming the API key and **Animation Style**) whenever the user gives a high-level, brief, or open-ended prompt (e.g., *"Make a 30-second video about a cat exploring a moonlit garden"*, *"Tell a funny knight and dragon adventure"*, *"Create a cozy bedtime story"*).

If the user has **already** provided a detailed act-by-act script with verbatim dialogue, settings, character voices, and pacing, skip this skill (or use only the missing parts to fill gaps).

The goal of this skill is to produce a crisp **Production Script Blueprint** locked to the chosen **Animation Style (`crayon` | `classic_cel`)** that tells a memorable story **and** pins down every character's voice, visual setting, prop list, and target filenames so downstream **code, asset, SFX/BGM, and voiceover subagents can immediately execute side-by-side in parallel**.

---

## 1. Story Craft — What Makes a Great Animated Short

### Classic Story Arc (3 to 5 Acts)
Target `24s–70s` total duration (unless the user specifies otherwise), always accounting for the chosen style's opening and closing framing:
- **Picture-Book Crayon Style (`artStyle: 'crayon'`, `6 FPS`)**: Hardcover `bookFrame` opening (`0 .. ~3.5s`, cover opens to `0%` sketch and colors in) and closing (`last ~3.5s`–`4.5s`, drains to sketch and closes on `"The End ★"`).
- **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`, `12 FPS` on twos)**: Theatrical `theatricalFrame` opening (`0 .. ~3.0s`, circular iris-in or warm fade with gold-serif title card) and closing (`last ~3.0s`, iris-out centered on hero into gold-serif `"The End"` card).

| Story Beat | Typical Share | Purpose |
| :--- | :--- | :--- |
| **Opening (`bookFrame` `~3.5s` or `theatricalFrame` `~3.0s`)** | `~3.0–3.5s` | Establishing visual during cover color-in (`crayon`) or iris-in + title card (`classic_cel`) — no crucial dialogue yet. |
| **Act I — Setup & Hook** | `~20%` | Introduce the hero, setting, and a clear desire, curiosity, or playful question right away. |
| **Act II — Journey / Spark** | `~25%` | Move to a new location or encounter a delightful obstacle, discovery, or quirky friend. |
| **Act III — Rising Action / Twist** | `~25%` | Escalate energy (action, comedy, mystery, or surprise reveal); shift music tempo/mood to match! |
| **Act IV — Heart / Payoff** | `~18%` | Resolve the problem with warmth, cleverness, or humor — give every character a clear reaction. |
| **Act V / Closing (`bookFrame` `~3.5s` or `theatricalFrame` `~3.0s`)** | `~12%` | Gentle farewell pose, waving goodbye, or cozy rest during book-close (`"The End ★"`) or iris-out (`"The End"`). |

### Picture-Book Writing Principles
- **Visual-First Storytelling**: Every act needs a clear physical action (walking, climbing, riding, discovering, splashing, sharing) — never just two characters standing frozen while a narrator reads an essay.
- **Crisp, Read-Aloud Dialogue**: Keep spoken lines short, rhythmic, and musical (`1–2` punchy sentences per turn, roughly `2–5s` each). Give every character distinct speech habits (excited exclamations, gentle wisdom, gruff-but-kind grumbles, playful rhymes).
- **Memorable Visual Motif**: Anchor the story around 1–2 charming recurring details (a glowing lantern, a warm pizza slice, a crooked dragon tooth with a bramble, a lucky party hat).

---

## 2. Continuity, Staging & Scale Rules (Bake Into the Script)

Before finalizing the acts, verify every beat obeys these staging rules:

1. **Chronological Day/Night Progression**: Lock the time of day on every act so it moves naturally forward (`Dawn/Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`). Never jump erratically backwards (e.g., `Night → Midday → Morning`) unless explicitly framed as a flashback or dream.
2. **Distinct Locations → Distinct Backgrounds**: Whenever the story moves to a new location between acts, specify a visibly different setting (sky/ground/floor palette + buildings/landmarks) so the audience immediately reads the location change.
3. **Brisk Scene Transitions After Exits**: Note exactly how characters leave a scene; once all characters exit, cut quickly (`~0.3–1.0s`) to the next act — never script lingering empty-stage dead air.
4. **Object & Companion Permanence**: Track every important prop, vehicle, or animal companion (e.g., horse, bicycle, basket, cake) across the scene. Never let items abruptly vanish mid-scene — if a character dismounts a horse, script whether the horse stays tethered nearby or trots off-screen naturally.
5. **Believable Proportional Scale**: Note relative sizes whenever characters share a scene with furniture, vehicles, animals, or buildings (tables at waist/chest height, never taller than characters; full-sized cars wider than a character's height; doorways taller than characters; pets/handheld items scaled naturally).

---

## 3. Character Voice Casting & Sound Direction Sheet

Before writing spoken lines, inspect `<workspace>/docs/VOICE_CATALOG.md` (or `skills/picture-book-voiceover/references/voice-catalog.md`) to cast a **distinct, fitting voice** for the narrator (if any) and every speaking character.

For **every** speaking role, define:
- **Voice Selection**: Exact `--character <preset>` (40 presets) or `--voice <VoiceName>` (30 Gemini prebuilt voices) chosen by `gender`, `ageGroup`, `roughness` (`crystalline`, `smooth`, `warm_clear`, `breathy`, `husky_textured`, `gravelly`), `pitch`, `energy`, and `accentAffinity`. Ensure characters talking in the same scene have clearly contrasting voices (different pitch/texture/energy) so listeners tell them apart effortlessly.
- **How They Should Sound (`--style` Acting Direction)**: Specific vocal direction — tone, pace, warmth/grit, accent/dialect if fitting, emotional arc (e.g., *"Bright, wide-eyed 7-year-old bursting with curiosity, quick bouncy cadence"*, *"Deep gravelly rumbling dragon who sounds fierce at first then melts into a sheepish chuckle"*).
- **Vocal Mannerisms & Inline Tags**: Planned Gemini 3.8 expressive tags (`<laugh>`, `<sigh>`, `<gasp>`, `<yawn>`, `<short pause>`) placed naturally inside the verbatim transcript (never put stage directions in the transcript itself — keep delivery instructions in `--style`).

### Script-Level Dialogue & Lip-Sync Rules
- **Sequential Turns by Default**: Write dialogue as clean sequential turns (`0.25–0.6s` gap between speakers). Never have characters talk over each other unless purposefully marked **`[INTENTIONAL OVERLAP]`** (e.g., simultaneous cheering or comedic interruption).
- **Finish Every Line Before Scene Cuts**: Budget enough act time for every line to finish cleanly (`+0.4–0.8s` beat before cutting). Only cut someone off at a scene change if explicitly marked **`[INTENTIONAL CUT-OFF]`**.
- **On-Screen Speaker Mouth Animation**: Clearly tag which on-screen character speaks each line (vs. off-screen `Narrator`) so downstream animators sync stepped **`6 FPS`** mouth movement (`crayon`) or **4-stage `12 FPS` cel lip-sync mouths** (`classic_cel`) and optional `speechText` bubbles to that character's exact clip window.
- **Concise Speech/Thought Bubbles (`~20–30` chars soft guideline)**: Whenever scripting `speechText` bubbles (especially for stories using text bubbles instead of voiceover narration), aim to keep each bubble around `20–30` characters (soft guideline, not a hard rule) so bubbles stay compact and legible; split longer beats into sequential short bubbles rather than stuffing a long sentence into one bubble.

---

## 4. Dynamic Music (BGM) & Sound Effects Cue Sheet

Inspect `<workspace>/docs/AUDIO_CATALOG.md` (or `skills/picture-book-audio/references/audio-catalog.md`) and plan the full soundscape alongside the script:

- **Dynamic BGM Arc**: Do not keep one flat music loop across contrasting acts. Specify how BGM tempo, energy, and instrumentation evolve per act:
  - *Opening / Discovery*: Light, curious, inviting melody.
  - *Action / Chase / Battle / Comedy Chaos*: Quicker tempo, driving rhythm/percussion, lively staccato articulation.
  - *Cozy / Dialogue / Bedtime / Emotional Beat*: Slower tempo, warm sparse instrumentation, ducked gently under voices (`volume: 0.20–0.35`).
  - *Finale / Victory*: Bright, joyful, resolving cadence.
- **Foley & SFX Beats**: Reuse matching catalog `audioCues` / `audioClips` first, and list any brand-new theme SFX/BGM to be built as isolated modular files (`src/audio/sfx/<name>.ts` or `scripts/sfx/<name>.mjs`). *(Note: omit `crayon_scribble` in `classic_cel` scenes.)*

---

## 5. Output Format — Parallel-Ready Production Script Blueprint

Produce the script using this concise blueprint so the orchestrator can immediately spin up **asset, scene-code, SFX/BGM, and voiceover subagents in parallel** with zero file collisions:

```markdown
# Production Script Blueprint: <Story Title>

- **Animation Style**: `crayon` *(6 FPS, `bookFrame`, `skills/picture-book-animation` + `skills/photo-to-crayon-asset`)* | `classic_cel` *(12 FPS on twos, `theatricalFrame`, `skills/classic-animation` + `skills/classic-cel-asset`)*
- **Scene ID & File**: `<scene-id>` → `src/scenes/<sceneName>.ts`
- **Target Duration & FPS**: `~<N>s` at `6 FPS` (`crayon`) or `12 FPS` (`classic_cel`)
- **Framing**:
  - If `crayon`: `bookFrame` (`openDurationSec: 3.5`, `closeDurationSec: 3.5`, `coverTitle`, `coverSubtitle`, `endingTitle: "The End ★"`) + `vibrantMode: true | false`
  - If `classic_cel`: `theatricalFrame` (`mode: 'iris' | 'fade'`, `openDurationSec: 3.0`, `closeDurationSec: 3.0`, `title`, `subtitle`, `endingTitle: "The End"`, `irisFocus: { x, y }`), `bookFrame: false`
- **Time-of-Day Arc**: e.g. `Morning → Afternoon → Sunset → Starry Night`

## Cast, Assets & Voice Direction
| Role / Node ID | Asset (`CharacterKind` / New File) | Voice (`--character` / `--voice`) | How They Should Sound (`--style`) | Notes (Scale / Props / Mouth) |
| :--- | :--- | :--- | :--- | :--- |
| `narrator` | *(off-screen)* | `Sulafat` (`narrator`) | Warm fireside storybook narrator, unhurried | — |
| `hero-id` | `crayon`: `src/assets/characters/<new>.ts` · `classic_cel`: `src/assets/classicCel/characters/<new>.ts` | `Leda` | Bright, curious child voice, playful wonder | `scale: 1.0`, animated speaking mouth (`6 FPS` or 4-stage `12 FPS`) |

## New Props / Buildings (If Any)
| Node ID | Existing Kind or New File | Proportional Size Target (vs. `~100px` Character) | Continuity Behavior |
| :--- | :--- | :--- | :--- |
| `prop-id` | `src/assets/props/<new>.ts` (or `src/assets/classicCel/props/<new>.ts`) | e.g. Table `~52px` tall (waist-high) | Stays in scene until location cut |

## Dynamic BGM & SFX Plan
- **BGM**: Existing track or new `scripts/sfx/<bgmName>.mjs` → `/audio/<bgm-name>.wav` with section-by-section tempo/mood changes (Act I: ..., Act II: ..., Act III: fast action ..., Act IV: ...).
- **SFX**: Existing `audioCues` (`chime`, `lullaby`, `garden_wind_chime`, etc.; use `crayon_scribble` ONLY in `crayon` style) + any new isolated SFX files (`src/audio/sfx/<sfx>.ts` / `scripts/sfx/<sfx>.mjs`).

## Act-by-Act Script
### Act I (`<act-id>`, `~0–12s`) — <Location> · <Time of Day>
- **Background**:
  - `crayon`: Tier 1 crayon `background_patch` (`crayonSkyBlue`, `crayonGrassGreen`) + Tier 2 props/buildings.
  - `classic_cel`: Multiplane painted gouache `background_patch` (`gradient`/`fill` from `TOKENS.classicCel.colors`) + painted set props/buildings.
- **Visual Action & Exits**: Character blocking, prop handling, and brisk exit transition (`~0.5s` after all characters leave).
- **Spoken Lines** *(sequential; exact timestamps finalized after WAV generation)*:
  1. **Narrator** → `/audio/<scene>_act1_narrator.wav` (`--voice Sulafat`, `--style "..."`): `"..."`
  2. **Hero** *(on-screen mouth moves)* → `/audio/<scene>_act1_hero.wav` (`--voice Leda`, `--style "..."`): `"<gasp> ..."`
- **Music & SFX**: BGM mood/tempo + SFX cues on exact visual beats.
```

> [!TIP]
> Once this blueprint is written, every worker subagent knows its exact file paths, asset IDs, voice styles, and story beats—allowing **character rigs, props/buildings, scene TypeScript, modular SFX/BGM, and Gemini TTS voiceovers to run simultaneously in parallel**!

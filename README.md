# Animated Picture Book Studio

> Create charming crayon-style animated storybook videos from a single prompt, with custom photo characters, expressive voiceovers, music, live preview, and MP4 export.

---

## Installation

### Option 1: One-Command Install (Antigravity CLI)
```bash
agy plugin install github.com/alif1383/animated_picture_book_studio
```
Plugins installed via the CLI automatically sync to the **Antigravity App**.

### Option 2: Manual Install (Antigravity App / IDE)
Clone or download this repository into your global plugins folder:
```bash
git clone https://github.com/alif1383/animated_picture_book_studio.git ~/.gemini/config/plugins/animated-picture-book-studio
```
*(On Windows PowerShell, clone into `$HOME\.gemini\config\plugins\animated-picture-book-studio`.)*

---

## Before You Begin: Optional Voiceover & Narration Setup (API Key)

You can create complete animated picture-book videos using **text/speech bubbles, music, and sound effects with no API key at all**.

If you also want **expressive voiceovers, multi-character dialogue, or fully custom narrations**, the plugin uses Google AI Studio's Generate Speech (Gemini TTS) API, which requires a **Google AI Studio API key**:

- **Free to start ($0, no credit card required):** A free Google AI Studio key unlocks all **30 studio voices**, **40 character/narrator presets**, acting direction prompts, accents, expressive vocal tags (`<laugh>`, `<sigh>`, `<gasp>`), and multi-speaker dialogue within free daily quotas.
- **Very low cost if you upgrade to Paid Tier:** Enabling billing unlocks higher daily quotas and **fully custom prompted voice design** (`voice-design`). Pricing is roughly **$0.54–$0.81 per full hour** of generated audio — meaning a typical 30–60 second picture-book video costs **around 1–2 cents**.

### How to Get & Save Your API Key (~15 seconds)
1. Open **[Google AI Studio API Keys](https://aistudio.google.com/apikey)** *(or open the [Speech Playground](https://aistudio.google.com/generate-speech) and click **Get API key** in the sidebar)*.
2. Sign in with your Google account and click **Create API key**.
3. Copy the key (starts with `AIzaSy...`) and either:
   - **Paste it in chat** when the agent asks for it (it saves the key for you automatically), **or**
   - **Save it once via CLI**:
     ```bash
     agy-node ~/.gemini/config/plugins/animated-picture-book-studio/skills/picture-book-voiceover/scripts/generate_audio.mjs set-key "<YOUR_API_KEY>"
     ```
   *(The key is saved locally in `~/.gemini/config/animated_picture_book_studio/config.json` and persists across all future Antigravity sessions. You can also pass it via the `GEMINI_API_KEY` environment variable.)*

---

## Overview

The **Animated Picture Book Studio** is a **100% standalone, zero-dependency** Antigravity plugin that bundles the complete Picture-Book Crayon Video Engine inside `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated-picture-book-studio/engine/`), including pre-bundled pure-JS compilers and libraries (`vendor/typescript`, `vendor/mp4-muxer`, `vendor/vitest-shim`, `vendor/isomorphic-git`) and zero-dependency CLI tools (`scripts/studio-cli.mjs`, `scripts/vcs.mjs`, `scripts/generate_audio.mjs`, `scripts/analyze_reference_photo.mjs`).

It works out-of-the-box on **any machine with only Antigravity installed** (`agy-node`)—no external `node`, `npm`, `pnpm`, `git`, or `python` installation is required. You can scaffold the bundled engine into any active `<workspace>` (or run it in-place) using `agy-node "<plugin-root>/scripts/ensure_engine.mjs"`. It provides skills, agents, rules, and the full engine so you can ask Antigravity to:

- **Create animated videos** — Design scenes with characters, props, buildings, camera movements, and hand-drawn annotations in a warm crayon/oil-pastel aesthetic, complete with an automatic **Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`)** where a hardcover picture book opens to a 0% color charcoal sketch, progressively colors in from 0% to 100% as the camera zooms into the story, and un-colors back to a sketch at the end before closing the cover with `"The End ★"` and credits.
- **Model assets after photos** — Turn user-provided photos into hand-crafted 2D cutout SVG characters, props, or buildings that match the storybook style.
- **Add and generate audio** — Sync built-in procedural sound effects, attach user-provided audio files, or generate narration and custom WAV sound effects at precise timestamps.
- **Preview live** — Spin up the bundled studio dev server (`agy-node scripts/studio-cli.mjs dev`) and inspect your video interactively in the browser with playback controls, layer toggles, and SFX audition.
- **Export MP4 directly via CLI** — Run `agy-node scripts/studio-cli.mjs export --scene <id> --resolution 1080p` to export the `.mp4` in headless mode without needing to open a visible browser tab or click buttons, then launch the dev server so you can inspect the live site as well.

---

## Plugin Contents

```
<plugin-root>/
├── plugin.json                              # Plugin manifest
├── README.md                                # This file
├── assets/
│   └── logo.svg                             # Plugin logo
├── engine/                                  # Complete bundled Picture-Book Studio engine
│   ├── src/                                 # Engine, scenes, characters, props, buildings, audio, UI
│   ├── vendor/                              # Pre-bundled pure-JS runtime dependencies (zero npm needed)
│   │   ├── typescript/                      # TypeScript compiler (tsc) + standard lib*.d.ts
│   │   ├── mp4-muxer/                       # Pure-JS H.264/AAC MP4 muxer
│   │   ├── vitest-shim/                     # Zero-dependency test runner shim
│   │   └── isomorphic-git/                  # Pure-JS .git repository & commit engine
│   ├── scripts/
│   │   ├── studio-cli.mjs                   # Zero-dep CLI: typecheck, test, build, dev (:5173)
│   │   ├── ts-loader-hooks.mjs              # Node module.register TypeScript & vendor loader
│   │   ├── vcs.mjs                          # Auto-detects native git vs bundled isomorphic-git
│   │   ├── generate_audio.mjs               # Zero-Python WAV SFX & TTS audio generator
│   │   └── analyze_reference_photo.mjs      # Zero-Python PNG color cluster & TOKENS mapper
│   ├── docs/                                # ARCHITECTURE.md & STYLE_GUIDE.md
│   ├── tests/                               # Unit & integration test suites
│   ├── public/                              # Static assets & public/audio/
│   ├── exports/                             # Gitignored target directory for exported .mp4 videos (auto-created on export)
│   ├── index.html                           # Studio entry HTML
│   ├── package.json                         # Scripts routed to scripts/studio-cli.mjs
│   └── tsconfig.json                        # Strict TypeScript config mapped to vendor/
├── scripts/
│   ├── bootstrap-node.cmd                   # Windows agy-node shim bootstrapper
│   ├── bootstrap-node.sh                    # macOS/Linux agy-node shim bootstrapper
│   ├── ensure_engine.mjs                    # Scaffolds/syncs bundled engine via agy-node
│   └── vcs.mjs                              # Standalone VCS helper (git or isomorphic-git)
├── rules/
│   └── AGENTS.md                            # Always-on routing rules & non-negotiable guardrails
├── agents/
│   └── picture-book-director.md             # Main turnkey orchestrator & export agent (spins up parallel subagents)
└── skills/
    ├── picture-book-script/
    │   └── SKILL.md                         # Story craft, continuity/scale staging & character voice sheets
    ├── picture-book-animation/
    │   ├── SKILL.md                         # Scene design, terrain, continuity, scale & animation guide
    │   └── references/
    │       └── catalog-and-schema.md        # Full asset catalog & TypeScript schema
    ├── photo-to-crayon-asset/
    │   ├── SKILL.md                         # Photo-to-SVG asset workflow & rigging guide
    │   └── scripts/
    │       └── analyze_reference_photo.mjs  # Zero-dep Node photo analysis utility
    ├── picture-book-voiceover/
    │   ├── SKILL.md                         # Google AI Studio Generate Speech (Gemini TTS) voiceover guide
    │   ├── references/
    │   │   └── voice-catalog.md             # All 30 Gemini voices & 40 character/narrator presets
    │   └── scripts/
    │       └── generate_audio.mjs           # Zero-dep Node Gemini TTS, dialogue, voice-design & WAV SFX CLI
    ├── picture-book-audio/
    │   ├── SKILL.md                         # SFX, dynamic BGM & audioClips sync guide
    │   ├── references/
    │   │   └── audio-catalog.md             # Master Audio & Sound Effects Catalog
    │   └── scripts/
    │       └── generate_audio.mjs           # Zero-dep Node WAV SFX & clip inspection CLI
    └── picture-book-studio-export/
        └── SKILL.md                         # Dev server, headless MP4 export & asset promotion runbook
```

---

## Skills

### ✍️ `picture-book-script`
Story and scriptwriting skill invoked automatically whenever the user's prompt is brief or lacks detail:
- Crafts classic 3–5 act picture-book arcs sized around `bookFrame` opening/closing beats
- Bakes in chronological day/night continuity, location-driven background changes, brisk exit cuts, in-scene object/companion permanence, and proportional scale
- Defines a complete **Character Voice Casting & Sound Direction Sheet** (`docs/VOICE_CATALOG.md`, `--style` acting prompts, inline vocal tags) and **Dynamic BGM & SFX Cue Sheet** (`docs/AUDIO_CATALOG.md`)
- Outputs a **Parallel-Ready Production Script Blueprint** with exact file paths and IDs so code, asset, SFX/BGM, and voiceover subagents can immediately execute side-by-side

### 🎨 `picture-book-animation`
Complete guide to designing, choreographing, and editing animations in the Picture-Book Crayon Video Engine. Covers:
- Core visual philosophy (wax crayon, oil pastel, cold-press paper aesthetic) and 3-layer render pipeline
- Mandatory Two-Tier Terrain Coloring, Story Continuity, Location Backgrounds, Brisk Empty-Stage Cuts, and Proportional Scale
- **Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`)**: Default `3.5s` opening cover & `0% -> 100%` color-in zoom (`0.68 -> 1.0`), full-bleed middle story, and final `3.5s` `100% -> 0%` color-out zoom-out & closing credits card
- `SceneDefinition` schema, all **19 built-in characters, 4 buildings, 22 props**, and 21+ crayon fill patterns
- Scene registration, URL routing (`?scene=`, `?short_sample=`, `?book_frame=1|0`), and 6 FPS stop-motion rules

### 📷 `photo-to-crayon-asset`
Step-by-step workflow for turning user photos (or generated reference images) into hand-crafted 2D cutout SVG assets:
- Visual inspection and automated palette mapping via `analyze_reference_photo.mjs`
- SVG cutout decomposition, multi-state rigging (`+X` forward walking profile, `CHARACTER_SPEECH_ANCHORS`, stepped `6 FPS` animated speaking mouths), and proportional local SVG sizing
- File-isolated authoring for parallel subagents + registration checklist

### 🎙️ `picture-book-voiceover`
Dedicated skill for generating expressive studio-grade voiceovers, character voices, multi-speaker dialogue, and custom voice designs using **Google AI Studio's Generate Speech (Gemini TTS)** API (`gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`, `gemini-2.5-flash-preview-tts`, and `POST /v1beta/voices`):
- **API Key Check & Persistent Setup**: `check-key` / `set-key` with no default OS synthesizer fallback (guides user to free `$0` Google AI Studio API key at `https://aistudio.google.com/apikey`)
- **Single-Speaker Narration & 40 Character/Narrator Presets (`tts`)**, **Multi-Speaker Dialogue (`dialogue`)**, and **Custom Voice Design (`voice-design`)**
- **Voiceover Timing & Lip-Sync Rules**: Complete lines before scene cuts (unless intentionally cut off), end voices on character/scene changes (zero bleed), animate speaker mouths at `6 FPS`, and prevent unintended overlapping voices

### 🔊 `picture-book-audio`
Comprehensive guide to sound effects, dynamic background music, and `audioClips` integration (`docs/AUDIO_CATALOG.md`):
- **Mode A — Modular Procedural SFX** (`audioCues`, `src/audio/sfx/<name>.ts`): 16 built-in one-file-per-SFX synthesizer modules
- **Mode B — External & Bundled WAV Files** (`audioClips`, `public/audio/*.wav`): Attach `.mp3`/`.wav` clips with dynamic BGM tempo/mood shifts across story sections (faster/energetic for action, calmer/softer ducked under dialogue)
- **Mode C — Isolated Per-SFX Generation** (`scripts/sfx/<name>.mjs` & `generate_audio.mjs`): Build new SFX/BGM concurrently alongside code & voiceover subagents

### 🎬 `picture-book-studio-export`
Turnkey runbook for previewing, exporting, and promoting assets:
- Build verification (`agy-node scripts/studio-cli.mjs test` & `build`)
- Direct headless CLI video export (`agy-node scripts/studio-cli.mjs export --scene <id> --resolution 1080p`)
- Studio dev server management (`agy-node scripts/studio-cli.mjs dev` on `http://localhost:5173`) and asset promotion (`--promote-from`)

---

## Agent Architecture

### `picture-book-director` (Single Main Orchestrator)
The single main producer, engineering coordinator, and export agent. Rather than duplicating multiple overlapping coder agents, `picture-book-director` loads domain skills on demand and **spins up isolated subagents side-by-side in parallel** — running character rigs, props/buildings, scene TypeScript, per-SFX/dynamic BGM modules, and Gemini TTS voiceovers concurrently with strict file-level isolation, followed by one clean integration, test, build, and MP4 export pass.

---

## Rules

`rules/AGENTS.md` is always active when the plugin is enabled. It acts as a lean, non-redundant router and guardrail sheet enforcing:

1. **100% standalone engine & VCS**: Auto-resolved via `ensure_engine.mjs` (Option A isolated scratch workspace by default) and `scripts/vcs.mjs`
2. **Skill routing**: Routes every domain (scripting, animation, assets, voiceover, audio, export) to its Single-Source-of-Truth `SKILL.md`
3. **Side-by-side parallel subagents & engineering discipline**: Concurrent isolated code + asset + SFX + voiceover subagents, `>= 3` research subagents for `> 100` LOC, centralized `TOKENS`, strict TypeScript, living docs, and atomic commits
4. **Always-on production guardrails**: Script-first on brief prompts, Two-Tier Terrain & `bookFrame`, continuity/exit pacing/scale, voiceover cutoff/mouth-sync/non-overlap, dynamic BGM, headless export, and asset promotion prompt

---

## Engine Reference

| Item | Location |
|------|----------|
| Bundled engine (100% standalone) | `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated-picture-book-studio/engine/`) |
| Engine resolver / scaffolder | `agy-node "<plugin-root>/scripts/ensure_engine.mjs"` |
| Active engine workspace | `<workspace>` (where `ensure_engine.mjs` scaffolds `<plugin-root>/engine/`) |
| Bundled pure-JS dependencies | `<workspace>/vendor/` (`typescript`, `mp4-muxer`, `vitest-shim`, `isomorphic-git`) |
| Source code | `<workspace>/src/` |
| Scenes | `<workspace>/src/scenes/` |
| Characters | `<workspace>/src/assets/characters/` |
| Props | `<workspace>/src/assets/props/` |
| Buildings | `<workspace>/src/assets/buildings/` |
| Audio engine | `<workspace>/src/audio/soundEngine.ts` |
| Book-frame engine | `<workspace>/src/engine/bookFrame.ts` |
| Schema | `<workspace>/src/engine/schema.ts` |
| Design tokens | `<workspace>/src/theme/tokens.ts` |
| Architecture docs | `<workspace>/docs/ARCHITECTURE.md` |
| Style guide | `<workspace>/docs/STYLE_GUIDE.md` |
| Audio files | `<workspace>/public/audio/` |
| Exported videos | `<workspace>/exports/` |
| Dev server | `agy-node scripts/studio-cli.mjs dev` (`http://localhost:5173`) |
| Typecheck | `agy-node scripts/studio-cli.mjs typecheck` |
| Tests | `agy-node scripts/studio-cli.mjs test` |
| Build | `agy-node scripts/studio-cli.mjs build` |
| Git / VCS | `agy-node scripts/vcs.mjs check` / `init` / `status` / `commit` / `log` |

---

## License

Released under the [MIT License](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for license notices covering bundled third-party libraries (`TypeScript` and `mp4-muxer`).

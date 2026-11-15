# Animated Picture Book Studio

> Create, edit, preview, and export hand-crafted 2D crayon and oil-pastel animated picture-book videos with custom photo-modeled assets, procedural or generated voiceover/audio sync, live dev server preview, and automated MP4 video download.

---

## Overview

The **Animated Picture Book Studio** is a **100% standalone, zero-dependency** Antigravity plugin that bundles the complete Picture-Book Crayon Video Engine inside `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/`), including pre-bundled pure-JS compilers and libraries (`vendor/typescript`, `vendor/mp4-muxer`, `vendor/vitest-shim`, `vendor/isomorphic-git`) and zero-dependency CLI tools (`scripts/studio-cli.mjs`, `scripts/vcs.mjs`, `scripts/generate_audio.mjs`, `scripts/analyze_reference_photo.mjs`).

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
│   ├── exports/.gitkeep                     # Target directory for exported .mp4 videos
│   ├── index.html                           # Studio entry HTML
│   ├── package.json                         # Scripts routed to scripts/studio-cli.mjs
│   └── tsconfig.json                        # Strict TypeScript config mapped to vendor/
├── scripts/
│   ├── ensure_engine.mjs                    # Scaffolds/syncs bundled engine via agy-node
│   ├── ensure_engine.py                     # Optional Python wrapper
│   └── vcs.mjs                              # Standalone VCS helper (git or isomorphic-git)
├── rules/
│   └── AGENTS.md                            # Always-on routing rules
├── agents/
│   ├── picture-book-coder.md                # Engineering agent (picture-book-agent-coder + skills)
│   ├── picture-book-agent-coder.md          # Specialist art-direction + coding agent
│   └── picture-book-director.md             # Turnkey producer/orchestrator agent
└── skills/
    ├── picture-book-animation/
    │   ├── SKILL.md                         # Scene design & animation guide
    │   └── references/
    │       └── catalog-and-schema.md        # Full asset catalog & TypeScript schema
    ├── photo-to-crayon-asset/
    │   ├── SKILL.md                         # Photo-to-SVG asset workflow
    │   └── scripts/
    │       ├── analyze_reference_photo.mjs  # Zero-dep Node photo analysis utility
    │       └── analyze_reference_photo.py   # Optional Python photo analysis utility
    ├── picture-book-audio/
    │   ├── SKILL.md                         # Audio sync & generation guide
    │   └── scripts/
    │       ├── generate_audio.mjs           # Zero-dep Node TTS/SFX generator
    │       └── generate_audio.py            # Optional Python TTS/SFX generator
    └── picture-book-studio-export/
        └── SKILL.md                         # Dev server & MP4 export runbook
```

---

## Skills

### 🎨 `picture-book-animation`
Complete guide to designing, choreographing, and editing animations in the Picture-Book Crayon Video Engine. Covers:
- Core visual philosophy (wax crayon, oil pastel, cold-press paper aesthetic)
- The 3-layer render pipeline (Base Scene → SVG Crayon Filter → Paper Composite)
- **Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`)**: Default `3.5s` opening cover & `0% -> 100%` color-in zoom (`0.68 -> 1.0`), full-bleed middle story, and final `3.5s` `100% -> 0%` color-out zoom-out & closing credits card (`BookFrameConfig`, `#chk-book-frame`, `?book_frame=1|0`)
- `SceneDefinition` schema (acts, nodes, timelines, camera, `bookFrame`, audio cues)
- All 15 built-in characters, 2 buildings, 13 props, and 21 crayon fill patterns
- Scene registration and URL routing (`?scene=`, `?short_sample=`, `?book_frame=1|0`)
- Stop-motion animation rules (6-8 FPS, 2D cutout rigging, hand-drawn annotations)

### 📷 `photo-to-crayon-asset`
Step-by-step workflow for turning user photos (or AI-generated reference images) into hand-crafted 2D cutout SVG assets:
- Visual inspection and automated palette mapping via `analyze_reference_photo.mjs`
- SVG cutout decomposition using engine primitives (`crayonPath`, `crayonCircle`, etc.)
- Multi-state rigging for stop-motion animation
- Registration checklist (schema types, render wiring, asset catalog, build verification)

### 🔊 `picture-book-audio`
Comprehensive guide to all three audio modes:
- **Mode A — Procedural SFX** (`audioCues`): 9 built-in synthesizer kinds with frequency/timing control
- **Mode B — External Files** (`audioClips`): Attach `.mp3`/`.wav` files at precise timestamps with volume/offset control
- **Mode C — Generated Audio**: Narration and procedural WAV SFX via the bundled `generate_audio.mjs` utility

### 🎬 `picture-book-studio-export`
Turnkey runbook for previewing and exporting videos:
- Build verification (`agy-node scripts/studio-cli.mjs test` & `agy-node scripts/studio-cli.mjs build`)
- Direct headless CLI video export (`agy-node scripts/studio-cli.mjs export --scene <id> --resolution 1080p`) saving directly to `<workspace>/exports/<filename>.mp4`
- Studio dev server management (`agy-node scripts/studio-cli.mjs dev` on `http://localhost:5173`)
- Delivering the finished `.mp4` file and the live preview URL (or informing the user if the dev server could not be started)

---

## Agents

### `picture-book-coder`
Software engineering agent enforcing `picture-book-agent-coder` standards (living docs, atomic Git/`isomorphic-git` commits via `scripts/vcs.mjs`, hierarchical planning, 5-subagent research, DRY architecture, centralized tokens, strict TypeScript) with automatic routing to the plugin's domain skills.

### `picture-book-agent-coder`
Specialist agent combining art direction rules (Part 1) with engineering discipline (Part 2), plus skill routing for animation, assets, audio (including `audioClips`), and automated browser export.

### `picture-book-director`
Turnkey producer/orchestrator for users who want to make or edit animated videos end-to-end without worrying about technical details. Handles the full pipeline: story concept → scene design → asset creation → audio → preview → MP4 export.

---

## Rules

The `rules/AGENTS.md` file is always active when the plugin is enabled. It enforces:

1. **100% standalone engine resolution**: Bundled engine at `<plugin-root>/engine/`, automatically scaffolded into the active `<workspace>` via `agy-node "<plugin-root>/scripts/ensure_engine.mjs"`
2. **Git vs. `isomorphic-git` detection**: Check and commit via `agy-node scripts/vcs.mjs`
3. **Animation routing**: Load `picture-book-animation` skill for any scene/animation work
4. **Code authoring routing**: Follow `picture-book-agent-coder` standards for all TypeScript code
5. **Photo asset routing**: Load `photo-to-crayon-asset` skill for custom assets from photos
6. **Audio routing**: Load `picture-book-audio` skill for any audio work
7. **Export routing**: Load `picture-book-studio-export` skill for preview and MP4 export

---

## Engine Reference

| Item | Location |
|------|----------|
| Bundled engine (100% standalone) | `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/`) |
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

# Animated Picture Book Studio

> Create, edit, preview, and export hand-crafted 2D crayon and oil-pastel animated picture-book videos with custom photo-modeled assets, procedural or generated voiceover/audio sync, live dev server preview, and automated MP4 video download.

---

## Overview

The **Animated Picture Book Studio** is a **100% self-contained** Antigravity plugin that bundles the complete Picture-Book Crayon Video Engine inside `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/` or `D:\picture_book_plugin\engine\`), turning it into a turnkey creative studio without requiring a separate clone on new machines. On this machine, `D:\picture_book` is also pre-installed with `node_modules` for instant execution, or you can scaffold a fresh project into any workspace using `scripts/ensure_engine.py`. It provides skills, agents, rules, and the full engine so you can ask Antigravity to:

- **Create animated videos** — Design scenes with characters, props, buildings, camera movements, and hand-drawn annotations in a warm crayon/oil-pastel aesthetic.
- **Model assets after photos** — Turn user-provided photos into hand-crafted 2D cutout SVG characters, props, or buildings that match the storybook style.
- **Add and generate audio** — Sync built-in procedural sound effects, attach user-provided audio files, or generate TTS narration and custom WAV sound effects at precise timestamps.
- **Preview live** — Spin up the Vite dev server and inspect your video interactively in the browser with playback controls, layer toggles, and SFX audition.
- **Export MP4 automatically** — The agent opens the browser, triggers the video export, saves the `.mp4` file to disk, and gives you a clickable link to the finished video.

---

## Plugin Contents

```
D:\picture_book_plugin\
├── plugin.json                              # Plugin manifest
├── README.md                                # This file
├── assets/
│   └── logo.svg                             # Plugin logo
├── engine/                                  # Complete bundled Picture-Book Studio engine
│   ├── src/                                 # Engine, scenes, characters, props, buildings, audio, UI
│   ├── docs/                                # ARCHITECTURE.md & STYLE_GUIDE.md
│   ├── tests/                               # Vitest test suite
│   ├── public/                              # Static assets & public/audio/
│   ├── exports/.gitkeep                     # Target directory for exported .mp4 videos
│   ├── index.html                           # Studio entry HTML
│   ├── package.json                         # Dependencies & scripts
│   ├── pnpm-lock.yaml                       # Lockfile
│   ├── tsconfig.json                        # Strict TypeScript config
│   └── vite.config.ts                       # Vite config + /__studio/save-export middleware
├── scripts/
│   └── ensure_engine.py                     # Resolves or scaffolds the bundled engine + pnpm install
├── rules/
│   └── AGENTS.md                            # Always-on routing rules
├── agents/
│   ├── picture-book-coder.md                # Engineering agent (coder-agent + skills)
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
    │       └── analyze_reference_photo.py   # Python photo analysis utility
    ├── picture-book-audio/
    │   ├── SKILL.md                         # Audio sync & generation guide
    │   └── scripts/
    │       └── generate_audio.py            # Python TTS/SFX generator
    └── picture-book-studio-export/
        └── SKILL.md                         # Dev server & MP4 export runbook
```

---

## Skills

### 🎨 `picture-book-animation`
Complete guide to designing, choreographing, and editing animations in the Picture-Book Crayon Video Engine. Covers:
- Core visual philosophy (wax crayon, oil pastel, cold-press paper aesthetic)
- The 3-layer render pipeline (Base Scene → SVG Crayon Filter → Paper Composite)
- `SceneDefinition` schema (acts, nodes, timelines, camera, audio cues)
- All 15 built-in characters, 2 buildings, 13 props, and 21 crayon fill patterns
- Scene registration and URL routing (`?scene=`, `?short_sample=`)
- Stop-motion animation rules (6-8 FPS, 2D cutout rigging, hand-drawn annotations)

### 📷 `photo-to-crayon-asset`
Step-by-step workflow for turning user photos (or AI-generated reference images) into hand-crafted 2D cutout SVG assets:
- Visual inspection and automated palette mapping via `analyze_reference_photo.py`
- SVG cutout decomposition using engine primitives (`crayonPath`, `crayonCircle`, etc.)
- Multi-state rigging for stop-motion animation
- Registration checklist (schema types, render wiring, asset catalog, build verification)

### 🔊 `picture-book-audio`
Comprehensive guide to all three audio modes:
- **Mode A — Procedural SFX** (`audioCues`): 9 built-in synthesizer kinds with frequency/timing control
- **Mode B — External Files** (`audioClips`): Attach `.mp3`/`.wav` files at precise timestamps with volume/offset control
- **Mode C — Generated Audio**: TTS narration via `edge-tts`/`gTTS` and procedural WAV SFX via the bundled `generate_audio.py` Python utility

### 🎬 `picture-book-studio-export`
Turnkey runbook for previewing and exporting videos:
- Build verification (`pnpm test` & `pnpm run build`)
- Vite dev server management (`http://localhost:5173`)
- Automated browser video export via `?auto_export=1` or `#btn-download-video`
- Server-side save to `D:\picture_book\exports\` via `/__studio/save-export`
- Delivering the finished `.mp4` file to the user

---

## Agents

### `picture-book-coder`
Software engineering agent enforcing `coder-agent` standards (living docs, atomic Git, hierarchical planning, 5-subagent research, DRY architecture, centralized tokens, strict TypeScript) with automatic routing to the plugin's domain skills.

### `picture-book-agent-coder`
Specialist agent combining art direction rules (Part 1) with engineering discipline (Part 2), plus skill routing for animation, assets, audio (including `audioClips`), and automated browser export.

### `picture-book-director`
Turnkey producer/orchestrator for users who want to make or edit animated videos end-to-end without worrying about technical details. Handles the full pipeline: story concept → scene design → asset creation → audio → preview → MP4 export.

---

## Rules

The `rules/AGENTS.md` file is always active when the plugin is enabled. It enforces:

1. **Self-contained engine resolution**: Bundled engine at `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/` or `D:\picture_book_plugin\engine\`), pre-installed engine at `D:\picture_book`, or workspace scaffolding via `scripts/ensure_engine.py`
2. **Animation routing**: Load `picture-book-animation` skill for any scene/animation work
3. **Code authoring routing**: Follow `coder-agent` standards for all TypeScript code
4. **Photo asset routing**: Load `photo-to-crayon-asset` skill for custom assets from photos
5. **Audio routing**: Load `picture-book-audio` skill for any audio work
6. **Export routing**: Load `picture-book-studio-export` skill for preview and MP4 export

---

## Example Prompts

### Create a New Animated Video & Export MP4
> "Create a new 30-second animated picture-book video about a cat exploring a moonlit garden, with lullaby music and chime sound effects, then export it as an MP4."

### Model a Character After a Photo & Add Audio
> "Here's a photo of my dog — model a crayon-style character after it, then add a narration voiceover starting at 2 seconds and a giggle sound effect at 8 seconds."

### Edit an Existing Scene & Preview
> "Open the meadow party scene in the live preview server, add a new act where the birthday cake appears with confetti, then spin up the browser to inspect it."

### Generate Narration for a Scene
> "Generate a warm storytelling voiceover narration for each act of the moonlight story scene and sync it to the video."

### Full End-to-End Production
> "Make a 45-second animated birthday card video for my niece. Use the birthday strawberry character, add party horn and confetti sound effects, generate a 'Happy Birthday!' narration, and export the final MP4."

---

## Engine Reference

| Item | Location |
|------|----------|
| Bundled engine (self-contained) | `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/` or `D:\picture_book_plugin\engine\`) |
| Engine resolver / scaffolder | `<plugin-root>/scripts/ensure_engine.py` |
| Pre-installed engine root | `D:\picture_book` (or active scaffolded workspace) |
| Source code | `<engine-root>\src\` |
| Scenes | `<engine-root>\src\scenes\` |
| Characters | `<engine-root>\src\assets\characters\` |
| Props | `<engine-root>\src\assets\props\` |
| Buildings | `<engine-root>\src\assets\buildings\` |
| Audio engine | `<engine-root>\src\audio\soundEngine.ts` |
| Schema | `<engine-root>\src\engine\schema.ts` |
| Design tokens | `<engine-root>\src\theme\tokens.ts` |
| Architecture docs | `<engine-root>\docs\ARCHITECTURE.md` |
| Style guide | `<engine-root>\docs\STYLE_GUIDE.md` |
| Audio files | `<engine-root>\public\audio\` |
| Exported videos | `<engine-root>\exports\` |
| Dev server | `http://localhost:5173` |
| Tests | `pnpm test` |
| Build | `pnpm run build` |

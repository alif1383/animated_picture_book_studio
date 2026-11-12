# Animated Picture Book Studio — Plugin Rules

These rules are always active when the Animated Picture Book Studio plugin is enabled. They route the agent to the correct skill or subagent for every Picture-Book Studio task.

---

## Engine Workspace Path & Self-Contained Bundled Engine

The **entire Picture-Book Studio engine source code** (`src/`, `docs/`, `tests/`, `public/`, `exports/`, `index.html`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`) is **bundled directly inside this plugin** at `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/` or `D:\picture_book_plugin\engine\`). Users do **not** need `D:\picture_book` separately cloned on a new machine.

When resolving which engine directory to run `pnpm` commands, file edits, and Git operations in, follow this priority order (or run `python <plugin-root>/scripts/ensure_engine.py`):

1. **Current workspace has the engine**: If the active workspace already contains `src/engine/schema.ts`, use the current workspace root.
2. **Pre-installed local engine (`D:\picture_book`)**: On this machine, `D:\picture_book` is already pre-installed with `node_modules`. If the current workspace is not an engine clone and `D:\picture_book\src\engine\schema.ts` exists with `node_modules`, run directly in `D:\picture_book`.
3. **Scaffold a fresh project anywhere from the bundled `engine/`**: On a new machine where `D:\picture_book` does not exist—or whenever the user asks to scaffold a fresh copy into their workspace—copy `<plugin-root>/engine/` into the target workspace (`python <plugin-root>/scripts/ensure_engine.py --scaffold --workspace <target>` or `robocopy <plugin-root>\engine <target> /E`) and run `pnpm install`.

---

## Animation & Scene Design Routing

Whenever deciding how to design, choreograph, or edit animations, scenes, acts, camera movements, timelines, keyframes, visual aesthetics, or the render pipeline, **ALWAYS** load and follow the `picture-book-animation` skill before proceeding:

```
skills/picture-book-animation/SKILL.md
```

This skill contains the complete art direction rules, scene authoring contract, 3-layer render pipeline, stop-motion animation methodology, all available `CharacterKind`/`PropKind`/`BuildingKind` catalogs, `SceneDefinition` schema reference, and scene registration instructions.

---

## Code Authoring Routing (`coder-agent` Standards)

Whenever writing or modifying TypeScript code—including scenes, engine modules, SVG asset functions, audio synthesizers, UI components, or tests—**ALWAYS** follow the `coder-agent` engineering standards. This means:

- **Centralized design tokens**: Import all colors, dimensions, frame rates, filter IDs, and style constants from `src/theme/tokens.ts`. Never hardcode magic numbers or hex values.
- **Modular DRY architecture**: Reuse existing engine primitives (`svgUtils.ts`, `filters.ts`, `fillMask.ts`, `timeline.ts`, `clock.ts`) before writing new code. Actively eliminate duplication.
- **Living documentation**: Update `docs/ARCHITECTURE.md` whenever files, modules, or public APIs are added, modified, or removed.
- **Minimalism & reuse checks**: Before implementing anything new, audit the codebase for existing utilities that can be extended or composed.
- **Strict TypeScript + Vitest verification**: All code must compile under `strict: true`. Run `pnpm test` and `pnpm run build` in `D:\picture_book` after every change to verify correctness.
- **Atomic Git commits**: Commit after each completed phase or sub-task with clean, imperative messages.

When the task involves substantial code changes, **delegate to or invoke the `picture-book-coder` or `picture-book-agent-coder` subagent** so these engineering standards are enforced end-to-end.

---

## Photo-Modeled Assets Routing

Whenever the user provides photos or images (or asks the agent to generate reference images) to model characters, props, or buildings after, **ALWAYS** load and follow the `photo-to-crayon-asset` skill before proceeding:

```
skills/photo-to-crayon-asset/SKILL.md
```

This skill contains the complete workflow for visual inspection, palette mapping to `TOKENS` colors, SVG cutout decomposition using engine primitives, multi-state rigging, and the registration checklist (schema union types, render wiring, asset catalog, build verification).

---

## Audio Sync & Generation Routing

Whenever the user wants to add audio to specific parts of a video—whether using:

- **Built-in procedural SFX/music** (`audioCues: AudioNoteCue[]`) — lullaby, chime, crayon_scribble, party_horn, confetti_pop, cheer_applause, candle_blow, giggle, birthday_song
- **User-provided audio files** (`.mp3`, `.wav`, `.ogg`, `.m4a`) attached via `audioClips: AudioClipCue[]`
- **Newly generated TTS voiceover, narration, or custom sound effects** via `scripts/generate_audio.py`

**ALWAYS** load and follow the `picture-book-audio` skill before proceeding:

```
skills/picture-book-audio/SKILL.md
```

This skill covers all three audio modes, the `AudioNoteCue` and `AudioClipCue` interfaces, how to place audio files in `D:\picture_book\public\audio\`, and how to generate narration or procedural WAV sound effects using the bundled Python utility.

---

## Turnkey Dev Server & Automated Browser Video Export Routing

Whenever the user wants to preview their video or have the agent generate, export, and download the `.mp4` video file for them, **ALWAYS** load and follow the `picture-book-studio-export` skill before proceeding:

```
skills/picture-book-studio-export/SKILL.md
```

Follow this complete workflow:

1. **Build & test first**: Run `pnpm test` and/or `pnpm run build` in `D:\picture_book` to ensure the scene compiles.
2. **Start the Vite dev server**: Run `pnpm run dev` in `D:\picture_book` with `IsDaemon: true` — the server starts on `http://localhost:5173`. **Keep it running** so the user can inspect their video interactively.
3. **Automated browser export**: Invoke the `browser` subagent (or Chrome DevTools MCP) to navigate to `http://localhost:5173/?scene=<sceneId>&auto_export=1&resolution=1080p` (or click `#btn-download-video`). Wait until `document.body.dataset.exportState === 'done'`.
4. **Deliver the video**: The studio saves the exported `.mp4` to `D:\picture_book\exports\<filename>.mp4`. Give the user:
   - A clickable file link: `[filename.mp4](file:///D:/picture_book/exports/filename.mp4)`
   - The live preview URL: `http://localhost:5173/?scene=<sceneId>&autoplay=1`

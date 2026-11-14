# Animated Picture Book Studio — Plugin Rules

These rules are always active when the Animated Picture Book Studio plugin is enabled. They route the agent to the correct skill or subagent for every Picture-Book Studio task.

---

## 100% Standalone Bundled Engine & Zero-Dependency Runtime (`agy-node`)

The **entire Picture-Book Studio engine source code** (`src/`, `docs/`, `tests/`, `public/`, `exports/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`) **plus pre-bundled pure-JS compilers and dependencies** (`vendor/typescript`, `vendor/mp4-muxer`, `vendor/vitest-shim`, `vendor/isomorphic-git`) and zero-dependency CLI scripts (`scripts/studio-cli.mjs`, `scripts/vcs.mjs`, `scripts/generate_audio.mjs`, `scripts/analyze_reference_photo.mjs`) are **bundled directly inside this plugin** at `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/`).

- **Zero External Host Dependencies**: Users only need **Antigravity** installed. They do **not** need `node`, `npm`, `pnpm`, `git`, or `python` installed on their machine. Always execute scripts using Antigravity's built-in **`agy-node`** binary (which is always on `PATH` in Antigravity).

When resolving which engine directory (`<workspace>`) to run commands, file edits, and Git/VCS operations in, run:

```bash
agy-node "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"
```

1. **Current workspace has the engine**: If the active `<workspace>` already contains `src/engine/schema.ts`, `ensure_engine.mjs` ensures `vendor/` and `scripts/` are synced and ready immediately (no `pnpm install` needed).
2. **Scaffold into `<workspace>` from the bundled `engine/`**: If `<workspace>/src/engine/schema.ts` does not exist yet (or `--scaffold` is passed), `ensure_engine.mjs` copies `<plugin-root>/engine/` (including `vendor/` and `scripts/`) into `<workspace>`.
3. **In-place mode (`--in-place`)**: Pass `--in-place` to `ensure_engine.mjs` to work directly inside `<plugin-root>/engine`.

---

## Git vs. Bundled `isomorphic-git` Check (`scripts/vcs.mjs`)

Because a user's machine may not have native `git` installed, the engine bundles a pure-JS **`isomorphic-git`** implementation (`vendor/isomorphic-git/`) and a unified VCS CLI (`scripts/vcs.mjs`) that writes standard `.git` repositories.

- **Always check which VCS backend is active first**:
  ```bash
  agy-node scripts/vcs.mjs check
  ```
  This detects whether native `git` is available and functional or if the bundled `isomorphic-git` engine should be used.
- **Use `agy-node scripts/vcs.mjs` for all repository operations** so commits work identically with or without native `git` installed:
  - Initialize repo (if needed): `agy-node scripts/vcs.mjs init`
  - Check working tree status: `agy-node scripts/vcs.mjs status`
  - Stage all & commit atomically: `agy-node scripts/vcs.mjs commit -m "feat(scenes): ..."`
  - Inspect commit history: `agy-node scripts/vcs.mjs log -n 5`

---

## Animation & Scene Design Routing

Whenever deciding how to design, choreograph, or edit animations, scenes, acts, camera movements, timelines, keyframes, visual aesthetics, or the render pipeline, **ALWAYS** load and follow the `picture-book-animation` skill before proceeding:

```
skills/picture-book-animation/SKILL.md
```

This skill contains the complete art direction rules, scene authoring contract, 3-layer render pipeline, stop-motion animation methodology, all available `CharacterKind`/`PropKind`/`BuildingKind` catalogs, `SceneDefinition` schema reference, and scene registration instructions.

---

## Code Authoring Routing (`picture-book-agent-coder` Standards)

Whenever writing or modifying TypeScript code—including scenes, engine modules, SVG asset functions, audio synthesizers, UI components, or tests—**ALWAYS** follow the `picture-book-agent-coder` engineering standards. This means:

- **Centralized design tokens**: Import all colors, dimensions, frame rates, filter IDs, and style constants from `src/theme/tokens.ts`. Never hardcode magic numbers or hex values.
- **Modular DRY architecture**: Reuse existing engine primitives (`svgUtils.ts`, `filters.ts`, `fillMask.ts`, `timeline.ts`, `clock.ts`) before writing new code. Actively eliminate duplication.
- **Living documentation**: Update `docs/ARCHITECTURE.md` whenever files, modules, or public APIs are added, modified, or removed.
- **Minimalism & reuse checks**: Before implementing anything new, audit the codebase for existing utilities that can be extended or composed.
- **Strict TypeScript + Test verification (Zero-Dependency CLI)**: All code must compile under `strict: true`. After every change, run in `<workspace>`:
  - `agy-node scripts/studio-cli.mjs typecheck` (runs bundled `tsc --noEmit`)
  - `agy-node scripts/studio-cli.mjs test` (runs all test suites via bundled `vitest-shim`)
  - `agy-node scripts/studio-cli.mjs build` (typechecks and builds `dist/`)
- **Atomic Git commits (via `scripts/vcs.mjs`)**: Check `agy-node scripts/vcs.mjs check`, then commit after each completed phase or sub-task via `agy-node scripts/vcs.mjs commit -m "<message>"`.

When the task involves substantial code changes, **delegate to or invoke the `picture-book-coder` or `picture-book-agent-coder` subagent** so these engineering standards are enforced end-to-end.

---

## Photo-Modeled Assets Routing

Whenever the user provides photos or images (or asks the agent to generate reference images) to model characters, props, or buildings after, **ALWAYS** load and follow the `photo-to-crayon-asset` skill before proceeding:

```
skills/photo-to-crayon-asset/SKILL.md
```

This skill contains the complete workflow for visual inspection, palette mapping to `TOKENS` colors (`agy-node "<plugin-root>/skills/photo-to-crayon-asset/scripts/analyze_reference_photo.mjs" "<photo_path>"`), SVG cutout decomposition using engine primitives, multi-state rigging, and the registration checklist (schema union types, render wiring, asset catalog, build verification).

---

## Audio Sync & Generation Routing

Whenever the user wants to add audio to specific parts of a video—whether using:

- **Built-in procedural SFX/music** (`audioCues: AudioNoteCue[]`) — lullaby, chime, crayon_scribble, party_horn, confetti_pop, cheer_applause, candle_blow, giggle, birthday_song
- **User-provided audio files** (`.mp3`, `.wav`, `.ogg`, `.m4a`) attached via `audioClips: AudioClipCue[]`
- **Newly generated TTS voiceover, narration, or custom sound effects** via `agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs"`

**ALWAYS** load and follow the `picture-book-audio` skill before proceeding:

```
skills/picture-book-audio/SKILL.md
```

This skill covers all three audio modes, the `AudioNoteCue` and `AudioClipCue` interfaces, how to place audio files in `<workspace>/public/audio/`, and how to generate narration or procedural WAV sound effects using the bundled zero-dependency utility.

---

## Turnkey Dev Server & Automated CLI Video Export Routing

Whenever the user wants to preview their video or have the agent generate, export, and download the `.mp4` video file for them, **ALWAYS** load and follow the `picture-book-studio-export` skill before proceeding:

```
skills/picture-book-studio-export/SKILL.md
```

Follow this complete workflow:

1. **Build & test first**: Run `agy-node scripts/studio-cli.mjs test` and `agy-node scripts/studio-cli.mjs build` in `<workspace>` to ensure the scene compiles cleanly.
2. **Export the `.mp4` directly via the CLI (No Browser UI / Button Clicking Required)**:
   ```bash
   agy-node scripts/studio-cli.mjs export --scene <sceneId> --resolution 1080p
   ```
   This renders the video in headless mode (auto-detecting the OS Edge/Chrome/Chromium binary without needing Chrome installed) and saves the `.mp4` directly to `<workspace>/exports/<filename>.mp4`. (If no headless browser binary is found on the OS, fall back to the built-in `browser` subagent at `http://localhost:5173/?scene=<sceneId>&auto_export=1&resolution=1080p`.)
3. **Launch (or attempt to launch) the Studio dev server**: Run `agy-node scripts/studio-cli.mjs dev` in `<workspace>` with `IsDaemon: true` (`http://localhost:5173`) and keep it running so the user can inspect their video interactively.
4. **Deliver the video & report status**:
   - **If the dev server started**: Tell the user the video has been exported, give them the clickable file link `[filename.mp4](file:///<workspace>/exports/filename.mp4)`, **and** give them the live preview site URL `http://localhost:5173/?scene=<sceneId>&autoplay=1` so they can go check it out.
   - **If the dev server could not be started**: Tell the user the video has been exported with the clickable file link `[filename.mp4](file:///<workspace>/exports/filename.mp4)`, and let them know the live preview server could not be set up.

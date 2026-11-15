# Animated Picture Book Studio — Plugin Rules

These rules are always active when the Animated Picture Book Studio plugin is enabled. They route the agent to the correct skill or subagent for every Picture-Book Studio task.

---

## 100% Standalone Bundled Engine & Zero-Dependency Runtime (`agy-node` & `bootstrap-node`)

The **entire Picture-Book Studio engine source code** (`src/`, `docs/`, `tests/`, `public/`, `exports/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`) **plus pre-bundled pure-JS compilers and dependencies** (`vendor/typescript`, `vendor/mp4-muxer`, `vendor/vitest-shim`, `vendor/isomorphic-git`) and zero-dependency CLI scripts (`scripts/bootstrap-node.cmd`, `scripts/bootstrap-node.sh`, `scripts/studio-cli.mjs`, `scripts/vcs.mjs`, `scripts/generate_audio.mjs`, `scripts/analyze_reference_photo.mjs`) are **bundled directly inside this plugin** at `<plugin-root>/engine/` (`~/.gemini/config/plugins/animated_picture_book_studio/engine/`).

- **Zero External Host Dependencies (`bootstrap-node` -> `agy-node`)**: Users only need **Antigravity** installed. They do **not** need `node`, `npm`, `pnpm`, `git`, or `python` installed on their machine.
  - Antigravity itself is an Electron app whose main binary (`Antigravity.exe` on Windows, `Antigravity.app/Contents/MacOS/Antigravity` on macOS, `antigravity` on Linux — always discoverable two levels above `$ANTIGRAVITY_AGENTAPI_EXE`) contains a full Node.js runtime when invoked with `ELECTRON_RUN_AS_NODE=1`.
  - On a fresh Antigravity install where `agy-node` is not yet on `PATH`, run the bundled bootstrapper once (or pass the script directly to it) to automatically create the `agy-node` shim inside `$ANTIGRAVITY_APP_DATA_DIR/bin` (which Antigravity always puts on `PATH`):
    - **Windows (PowerShell)**:
      ```powershell
      & "<plugin-root>/scripts/bootstrap-node.cmd" "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"
      ```
    - **macOS / Linux (sh/bash)**:
      ```bash
      sh "<plugin-root>/scripts/bootstrap-node.sh" "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"
      ```
  - Once bootstrapped (or if `agy-node` is already on `PATH`), all subsequent commands can run via `agy-node` (or via `scripts/bootstrap-node.cmd` / `scripts/bootstrap-node.sh`):

```bash
agy-node "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"
```

1. **Current workspace already has the engine**: If the active `<workspace>` already contains `src/engine/schema.ts`, `ensure_engine.mjs` ensures `vendor/` and `scripts/` are synced and ready immediately (no `pnpm install` needed) and returns `<workspace>`.
2. **No workspace open or workspace is not a Picture-Book project (Default — Per-Conversation `scratch/` Workspace)**: Whenever a conversation starts without a workspace/project open (or `<workspace>/src/engine/schema.ts` does not exist and `--scaffold` was not passed), `ensure_engine.mjs` automatically copies the full `<plugin-root>/engine/` into the conversation's isolated scratch folder (`<appDataDir>/brain/<conversation-id>/scratch/picture-book-studio`) and prints `Engine ready at: <resolved_path>`. Always use that returned `<resolved_path>` as `<workspace>` for all custom characters, scenes, audio files, Git/VCS commits, dev server, and `.mp4` exports so each conversation is 100% isolated and never modifies `<plugin-root>/engine/` or an unrelated folder!
3. **Explicit Project Initialization (`--workspace "<dir>" --scaffold`)**: If the user explicitly asks to initialize a specific project directory on disk, pass `--workspace "<dir>" --scaffold` to copy `<plugin-root>/engine/` into `<dir>`.
4. **In-place plugin mode (`--in-place`)**: Only pass `--in-place` when explicitly editing the plugin's bundled template itself.

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

## Animation & Scene Design Routing (Including Default `bookFrame` Opening & Ending Sequence)

Whenever deciding how to design, choreograph, or edit animations, scenes, acts, camera movements, timelines, keyframes, visual aesthetics, or the render pipeline, **ALWAYS** load and follow the `picture-book-animation` skill before proceeding:

```
skills/picture-book-animation/SKILL.md
```

This skill contains the complete art direction rules, scene authoring contract, 3-layer render pipeline, stop-motion animation methodology, **Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`) choreography**, all available `CharacterKind`/`PropKind`/`BuildingKind` catalogs, `SceneDefinition` schema reference, and scene registration instructions.

### Default Storybook Book-Frame (`bookFrame`) Behavior & Choreography Rules
Every scene in the Picture-Book Studio is automatically framed inside a physical hardcover storybook (`bookFrame` enabled by default):
1. **Opening Cover & Color-In Zoom (`0 .. openDurationSec`, default `3.5s`)**:
   - Starts zoomed out (`bookScale: 0.68`) on a closed hardcover picture book showing the scene's title (`coverTitle`, defaulting to `scene.title`), subtitle (`coverSubtitle`), and optional credit (`creditText`).
   - The book cover opens in stepped `6 FPS` stop-motion to reveal the scene inside the book pages starting at **0% crayon color** (hand-drawn charcoal outline sketch on warm paper).
   - As the camera zooms into the book spread (`bookScale: 0.68 -> 1.0`), the crayon colors progressively fill in from **0% to 100%** (`colorFillMultiplier: 0 -> 1`).
2. **Main Story (`openDurationSec .. durationSec - closeDurationSec`)**:
   - Full-bleed 16:9 storybook animation (`bookScale: 1.0`, `colorFillMultiplier: 1.0`, 100% identical to standard scene rendering).
3. **Ending Color-Out, Zoom-Out & Closing Credits (`durationSec - closeDurationSec .. durationSec`, default last `3.5s`)**:
   - Zooms back out into the open book spread (`1.0 -> 0.68`) as crayon pigment drains from **100% down to 0%**, returning to a charcoal sketch before the book cover closes to display the scene name, `endingTitle` (`"The End ★"`), and `endingCredit` / credits card.
4. **Agent Choreography & Configuration**:
   - Keep Act I's main character dialogue/key action starting after `openDurationSec` (or let the first `~3.5s` serve as the book-opening & color-in establishing shot, optionally paired with a `crayon_scribble` or `chime` audio cue).
   - Let the final `~3.5s` (`closeDurationSec`) serve as a gentle farewell pose as the scene zooms out, un-colors to sketch, and closes the book (optionally paired with a `lullaby` cue).
   - **Character-Attached Speech & Thought Bubbles (`speechText` & `speechStyle`)**: Whenever a character speaks or thinks, set `speechText` and `speechStyle: 'speech' | 'thought'` directly on the character's `CharacterNode` or `NodeKeyframe` (and `speechText: ''` to clear it) rather than guessing manual `(x, y)` coordinates on a standalone annotation node. The engine automatically anchors the bubble tail/thought puffs directly above that character's head via `CHARACTER_SPEECH_ANCHORS`.
   - **Mandatory Scene Audio Planning & Catalog Check (`docs/AUDIO_CATALOG.md`)**: Whenever planning or creating a new scene, the planning/director/coder agent **MUST** check `<workspace>/docs/AUDIO_CATALOG.md` (and `skills/picture-book-audio/references/audio-catalog.md`) to see what existing background music and sound effects fit the theme and what new theme-appropriate BGM/SFX must be created for the story, and pass this required audio plan to the coder agent.
   - Customize cover titles, credits, cover material, or durations via `scene.bookFrame: BookFrameConfig` (or set `bookFrame: false` to disable), toggle live in the Studio UI via `#chk-book-frame`, or pass `?book_frame=1|0` in the URL.

---

## Code Authoring Routing (`picture-book-agent-coder` Standards)

Whenever writing or modifying TypeScript code—including scenes, engine modules, SVG asset functions, audio synthesizers, UI components, or tests—**ALWAYS** follow the `picture-book-agent-coder` engineering standards. This means:

- **Liberal Subagent Rule (`>= 3` Research Subagents for Any Change `> 100` Lines of Code)**: Any code change requiring **more than 100 lines of code** MUST spin up **at least 3 researcher subagents in parallel** before editing code (always including a minimalism & reuse researcher to audit existing utilities). Whenever the main/director agent delegates to a coder subagent, it must explicitly remind the coder subagent of this `>= 3` parallel researcher subagent rule and the isolated per-SFX subagent rule.
- **Centralized design tokens**: Import all colors, dimensions, frame rates, filter IDs, and style constants from `src/theme/tokens.ts`. Never hardcode magic numbers or hex values.
- **Modular DRY architecture & One-File-Per-SFX Modularity**: Reuse existing engine primitives (`svgUtils.ts`, `filters.ts`, `fillMask.ts`, `timeline.ts`, `clock.ts`) before writing new code. Keep **every sound effect in its own separate modular file** (`src/audio/sfx/<name>.ts` for procedural WebAudio cues and/or `scripts/sfx/<name>.mjs` generating `public/audio/<name>.wav` for WAV clips) created via isolated subagent(s).
- **Predefined character speech/thought bubble anchors (`CHARACTER_SPEECH_ANCHORS`)**: Every character model in `src/assets/characters/` MUST register a predefined head-top anchor `{ x, y }` in `CHARACTER_SPEECH_ANCHORS` (`src/assets/characters/index.ts`), modeled after existing characters (`little_girl: { x: 0, y: -102 }`, `shopkeeper: { x: 0, y: -105 }`, `cat: { x: 10, y: -44 }`), so setting `speechText` and `speechStyle: 'speech' | 'thought'` on any `CharacterNode` or `NodeKeyframe` automatically attaches the speech or thought bubble right above that character's head.
- **Mandatory `+X` character facing & 3/4 walking profile convention**: Every character rig MUST face **RIGHT (`+X`)** when `flipX: false` and **LEFT (`-X`)** when `flipX: true`. For `state === 'walking'`, always implement a dedicated 3/4 or side-profile walking rig facing right (`+X`) where both legs pivot from the hip center (`x ≈ 0`), both shoes/paws point right (`+X`), and the torso/head/eyes face right (`+X`) — never reuse a flat front-facing rig with sideways-scissoring legs for walking. Set `flipX: false` when walking right (`dx > 0`) and `flipX: true` when walking left (`dx < 0`).
- **Living documentation & Audio Catalog (`docs/ARCHITECTURE.md` & `docs/AUDIO_CATALOG.md`)**: Update `docs/ARCHITECTURE.md` whenever files, modules, or public APIs are added, modified, or removed. Whenever new sound effects or background music are created, register their descriptions and fitting story themes in both `<workspace>/docs/AUDIO_CATALOG.md` and `skills/picture-book-audio/references/audio-catalog.md`.
- **Minimalism & reuse checks**: Before implementing anything new, audit the codebase for existing utilities that can be extended or composed.
- **Strict TypeScript + Test verification (Zero-Dependency CLI)**: All code must compile under `strict: true`. After every change, run in `<workspace>`:
  - `agy-node scripts/studio-cli.mjs typecheck` (runs bundled `tsc --noEmit`)
  - `agy-node scripts/studio-cli.mjs test` (runs all test suites via bundled `vitest-shim`)
  - `agy-node scripts/studio-cli.mjs build` (typechecks and builds `dist/`)
- **Atomic Git commits (via `scripts/vcs.mjs`)**: Check `agy-node scripts/vcs.mjs check`, then commit after each completed phase or sub-task via `agy-node scripts/vcs.mjs commit -m "<message>"`.

When the task involves substantial code changes, **delegate to or invoke the `picture-book-coder` or `picture-book-agent-coder` subagent** (explicitly reminding it to use `>= 3` parallel researcher subagents for changes `> 100` LOC and isolated subagents per new SFX) so these engineering standards are enforced end-to-end.

---

## Photo-Modeled Assets Routing

Whenever the user provides photos or images (or asks the agent to generate reference images) to model characters, props, or buildings after, **ALWAYS** load and follow the `photo-to-crayon-asset` skill before proceeding:

```
skills/photo-to-crayon-asset/SKILL.md
```

This skill contains the complete workflow for visual inspection, palette mapping to `TOKENS` colors (`agy-node "<plugin-root>/skills/photo-to-crayon-asset/scripts/analyze_reference_photo.mjs" "<photo_path>"`), SVG cutout decomposition using engine primitives, multi-state rigging, **mandatory predefined head-top speech/thought bubble anchor registration in `CHARACTER_SPEECH_ANCHORS` (`src/assets/characters/index.ts`)**, and the registration checklist (schema union types, render wiring, asset catalog, build verification).

---

## Audio Sync, Catalog Planning & Isolated Per-SFX Subagent Routing

Whenever planning a scene's audio or adding audio to specific parts of a video—whether using:

- **Built-in procedural SFX/music** (`audioCues: AudioNoteCue[]`, modularly defined one-file-per-SFX in `src/audio/sfx/<name>.ts`) — lullaby, chime, crayon_scribble, party_horn, confetti_pop, cheer_applause, candle_blow, giggle, birthday_song, ocean_wave, water_splash, floatie_squeak, fire_crackle, dragon_fire, spear_clink, medieval_lute
- **User-provided or pre-bundled WAV/MP3 audio files** (`.mp3`, `.wav`, `.ogg`, `.m4a`) attached via `audioClips: AudioClipCue[]`
- **Newly generated TTS voiceover, narration, or custom WAV sound effects** via `agy-node "<plugin-root>/skills/picture-book-audio/scripts/generate_audio.mjs"` or modular per-SFX generator scripts in `scripts/sfx/<name>.mjs`

**ALWAYS** load and follow the `picture-book-audio` skill before proceeding:

```
skills/picture-book-audio/SKILL.md
```

Enforce these mandatory audio rules on every scene and audio task:
1. **Check the Audio Catalog First (`docs/AUDIO_CATALOG.md`)**: When planning or creating any scene, read `<workspace>/docs/AUDIO_CATALOG.md` (and `skills/picture-book-audio/references/audio-catalog.md`) to see what existing background music and sound effects fit the story theme and determine what new theme-appropriate BGM/SFX must be created. Pass this audio plan to the coder agent.
2. **Isolated Subagent(s) & One-File-Per-Sound-Effect Modularity**: To create new sound effects, the coder agent MUST load `skills/picture-book-audio/SKILL.md` and spin up **isolated subagent(s)** so that **every sound effect lives in its own separate modular file** (`src/audio/sfx/<name>.ts` for procedural WebAudio synthesizers and/or `scripts/sfx/<name>.mjs` generating `public/audio/<name>.wav` for WAV clips).
3. **Register New Audio in the Catalog**: Every new sound effect or background track MUST be documented with its description, parameters/duration, and fitting story themes in both `<workspace>/docs/AUDIO_CATALOG.md` and `skills/picture-book-audio/references/audio-catalog.md`.

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
5. **Prompt the User to Promote New Assets to the Main Plugin Folder (`--promote-from`)**:
   - Whenever new assets (characters, buildings, props, scenes, audio files in `public/audio/`, modular SFX in `src/audio/sfx/` or `scripts/sfx/`, or reference images/catalogs) have been created in `<workspace>` (such as a per-conversation `scratch/` folder or project workspace), **always ask the user at the end of your reply** whether they would like to save/move those new assets into the main plugin folder (`<plugin-root>/engine/`) so they can be reused across future conversations and instances.
   - If the user confirms, run:
     ```bash
     agy-node "<plugin-root>/scripts/ensure_engine.mjs" --promote-from "<workspace>"
     ```
     which syncs all newly created/updated assets (`src/`, `public/`, `docs/`, `tests/`, `scripts/`) and `docs/AUDIO_CATALOG.md` back into `<plugin-root>/engine/` and `<plugin-root>/skills/picture-book-audio/references/audio-catalog.md`.

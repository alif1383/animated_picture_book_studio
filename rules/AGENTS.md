# Animated Picture Book Studio — Plugin Rules

These rules are always active when the Animated Picture Book Studio plugin is enabled. Detailed workflows and schemas live in each domain skill (Single Source of Truth) — **always load the matching skill before acting** rather than guessing APIs.

---

## 1. Standalone Bundled Engine & VCS (`agy-node`, `ensure_engine.mjs`, `vcs.mjs`)

The entire Picture-Book Studio engine plus pure-JS dependencies (`vendor/typescript`, `vendor/mp4-muxer`, `vendor/vitest-shim`, `vendor/isomorphic-git`) and zero-dependency Node CLIs live inside `<plugin-root>/engine/`. Users only need **Antigravity** installed (no external `node`, `pnpm`, `python`, or `git`).

- **Bootstrap / Resolve `<workspace>`**:
  ```bash
  agy-node "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"
  ```
  - If `agy-node` is not yet on `PATH` (fresh Antigravity install), run the bundled bootstrapper once — it creates the `agy-node` shim in `$ANTIGRAVITY_APP_DATA_DIR/bin` and forwards arguments directly:
    - **Windows (PowerShell)**: `& "<plugin-root>/scripts/bootstrap-node.cmd" "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"`
    - **macOS / Linux**: `sh "<plugin-root>/scripts/bootstrap-node.sh" "<plugin-root>/scripts/ensure_engine.mjs" --workspace "<workspace>"`
  - If `<workspace>/src/engine/schema.ts` exists, uses `<workspace>` directly.
  - Otherwise (default — **Option A**), copies `<plugin-root>/engine/` into the conversation's isolated scratch folder (`<appDataDir>/brain/<conversation-id>/scratch/picture-book-studio`) and prints `Engine ready at: <resolved_path>`. Always use that `<resolved_path>` as `<workspace>`.
  - Pass `--scaffold` only when the user explicitly asks to initialize a directory on disk; pass `--in-place` only when editing the plugin template itself.
- **VCS (`scripts/vcs.mjs`)**: Auto-selects native `git` or bundled `isomorphic-git`:
  `agy-node scripts/vcs.mjs check` → `init` (if needed) → `status` → `commit -m "<message>"` → `log -n 5`.

---

## 2. Skill Routing (Load Before Acting)

| Task / Trigger | Mandatory Skill |
| :--- | :--- |
| User prompt is brief, high-level, or lacks detailed story/dialogue/voice specs | `skills/picture-book-script/SKILL.md` |
| Designing or editing scenes, acts, timelines, camera, `bookFrame`, terrain, or aesthetics | `skills/picture-book-animation/SKILL.md` |
| Creating or modifying custom / photo-modeled characters, props, or buildings | `skills/photo-to-crayon-asset/SKILL.md` |
| Voiceover, narration, character speech, multi-speaker dialogue, or Gemini TTS API key setup | `skills/picture-book-voiceover/SKILL.md` |
| Sound effects (`audioCues` / WAV), dynamic BGM, or external `audioClips` | `skills/picture-book-audio/SKILL.md` |
| Build verification, headless `.mp4` CLI export, live `:5173` preview, or asset promotion | `skills/picture-book-studio-export/SKILL.md` |

---

## 3. Orchestration, Side-by-Side Parallel Subagents & Engineering Standards

Use the single main orchestrator **`picture-book-director`** (or act as orchestrator directly) to spin up **isolated parallel subagents** for every independent piece of work:

- **Parallel Research (`>= 3` Subagents for Changes `> 100` LOC)**: Any code change exceeding `100` lines MUST first spin up at least 3 parallel read-only researcher subagents (`TypeName: "research"`, always including a **Minimalism & Reuse Researcher**), passing exact paths to `docs/ARCHITECTURE.md`, `docs/STYLE_GUIDE.md`, `docs/AUDIO_CATALOG.md`, and `docs/VOICE_CATALOG.md`.
- **Side-by-Side Parallel Execution (Code + Assets + Audio + Voiceover Simultaneously)**: Once the story/file blueprint is ready, launch independent write-enabled worker subagents **at the same time in parallel** (via `define_subagent` with `EnableWriteTools: true`, or `TypeName: "self"` — never use read-only `research` for file writers and do not recursively invoke `picture-book-director` for leaf worker tasks) so sound generation never blocks code and vice versa:
  - Isolated **Character / Prop / Building Subagent(s)** (`src/assets/characters/<name>.ts`, `src/assets/props/<name>.ts`, `src/assets/buildings/<name>.ts`)
  - Isolated **Scene / Module Code Subagent(s)** (`src/scenes/<sceneName>.ts`, etc.)
  - Isolated **Per-SFX & Dynamic BGM Subagent(s)** (`src/audio/sfx/<name>.ts` and/or `scripts/sfx/<name>.mjs` → `public/audio/<name>.wav`, strictly one standalone file per SFX/BGM)
  - Isolated **Voiceover Subagent** (`public/audio/<line>.wav` via `generate_audio.mjs`, returning exact measured WAV durations)
- **Strict File-Ownership Isolation**: Parallel subagents must **never** concurrently edit shared barrel, schema, registry, or catalog files (`src/engine/schema.ts`, `src/assets/*/index.ts`, `src/audio/sfx/index.ts`, `src/ui/app.ts`, `docs/*.md`). The orchestrator wires all barrels, reconciles returned `local SVG bounds × node.scale` against scene proportions, plugs measured WAV durations into the scene timeline, and updates docs in one clean integration pass.
- **Hierarchical Planning & Code Quality**:
  - For large engine/feature refactors, decompose work hierarchically (macro phases → micro sub-plans saved in `docs/plans/` and indexed in `docs/PLANS.md`); for video creation, use the `picture-book-script` Blueprint.
  - Import all colors, strokes, frame rates, filter IDs, and dimensions from `src/theme/tokens.ts` — never hardcode magic values.
  - Reuse shared engine primitives (`svgUtils.ts`, `filters.ts`, `fillMask.ts`, `timeline.ts`, `clock.ts`, `soundEngine.ts`).
  - Keep `docs/ARCHITECTURE.md`, `docs/AUDIO_CATALOG.md` (mirrored to `skills/picture-book-audio/references/audio-catalog.md`), and `docs/VOICE_CATALOG.md` (mirrored to `skills/picture-book-voiceover/references/voice-catalog.md`) up to date.
  - Compile under `strict: true`, run `agy-node scripts/studio-cli.mjs typecheck`, `test`, and `build` after every change, visually verify rendered scenes in the browser (`agy-node scripts/studio-cli.mjs dev`) to catch layout/scale/aesthetic bugs, and commit atomically via `agy-node scripts/vcs.mjs commit -m "..."`.

---

## 4. Non-Negotiable Production Guardrails

Details, tables, and code patterns for each guardrail live in the linked skill:

1. **Script First When Undetailed** (`picture-book-script`): If the user hasn't supplied a detailed script, generate the full story arc, continuity/scale staging, character voice casting & `--style` direction sheet, and dynamic BGM/SFX cue sheet before building.
2. **Two-Tier Terrain & `bookFrame`** (`picture-book-animation`): Every visible environment zone (`Sky` + `Ground / Ocean / Beach / Floor`) needs a Tier 1 textured `background_patch` base + Tier 2 detail props (`0–25px` natural crayon seams, slight outer overbleed clipped inside `bookFrame`). Account for the default `3.5s` opening cover/color-in and `3.5s` closing credits.
3. **Story Continuity, Transitions & Proportional Scale** (`picture-book-animation`, `photo-to-crayon-asset`):
   - Visibly change backgrounds (Tier 1 patches + Tier 2 props/buildings) whenever location changes between acts.
   - Cut briskly (`~0.3–1.0s`) to the next scene once all characters exit.
   - Respect chronological **day/night cycle** order (`Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`, never jumping erratically backwards like `Night → Midday → Morning` unless framed as a flashback/dream).
   - Enforce **in-scene object & companion permanence** — never pop items/mounts out of existence mid-scene (e.g., if a character dismounts a horse, keep the horse visible/tethered or animate it walking off-screen).
   - Keep **character-to-scene proportions believable** (tables waist/chest height, never taller than characters; full-sized cars wider than a character's height; doorways taller than characters).
4. **Character Rigging & Speech Bubbles** (`photo-to-crayon-asset`, `picture-book-animation`): Enforce canonical `+X` forward facing (`flipX: false` = right) with dedicated 3/4 walking profiles, register `CHARACTER_SPEECH_ANCHORS` for character-attached `speechText`/`speechStyle` bubbles (aim for `~20–30` characters per bubble as a soft guideline so bubbles stay compact and readable; split longer lines across sequential keyframes), and implement stepped `6 FPS` **animated mouth movement** for any voiced character.
5. **Voiceover & Gemini TTS Rules** (`picture-book-voiceover`):
   - Run `check-key` first. **Do NOT fall back to the OS synthesizer by default** — if unconfigured, explain that a free `$0` Google AI Studio API key (`https://aistudio.google.com/apikey`, no credit card required) unlocks all 30 voices & 40 presets for free, note `--os-fallback` is not recommended, and save their key persistently with `set-key`.
   - Consult `docs/VOICE_CATALOG.md` to cast voices by gender, age, roughness, pitch, accent, and theme.
   - Let every voice **complete before scene changes** unless purposefully scripting a cut-off; always **end voices at or before any character/scene change** (cap `AudioClipCue.duration`, clear `speechText: ''`, zero bleed); **animate the speaking character's mouth area** while talking; and **never overlap multiple characters' voices** unless specifically intended.
6. **Audio Catalog & Dynamic BGM** (`picture-book-audio`): Consult `docs/AUDIO_CATALOG.md` first; author each new SFX/BGM in its own standalone file via isolated subagents; **vary BGM tempo, rhythm, and mood across story sections** (faster/energetic for action beats, calmer/softer ducked `0.20–0.35` under dialogue).
7. **Export, Preview & Asset Promotion** (`picture-book-studio-export`): Run `test` + `build` → `agy-node scripts/studio-cli.mjs export --scene <sceneId> --resolution 1080p` → start `agy-node scripts/studio-cli.mjs dev` (`IsDaemon: true`) → deliver clickable `.mp4` link + preview URL (or note if dev server couldn't start) → whenever new assets were created in `<workspace>`, ask the user whether to promote them into `<plugin-root>/engine/` via `agy-node "<plugin-root>/scripts/ensure_engine.mjs" --promote-from "<workspace>"`.

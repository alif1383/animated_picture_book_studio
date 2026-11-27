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

## 2. MANDATORY PRE-PRODUCTION RULE (API Key Check → Animation Style Clarification)

Before writing any script, generating assets, or authoring a new video scene, **ALWAYS** execute these two pre-production checks in strict order:

1. **Step 1 — Check Google AI Studio API Key FIRST**: Unless the user explicitly opted out of voiceovers (e.g., *"no voiceover, use text bubbles only"*), run `check-key` via `skills/picture-book-voiceover/SKILL.md` first (and guide the user through setting a free `$0` key if unconfigured).
2. **Step 2 — Ask the User to Clarify Animation Style (If Not Already Specified)**: **Immediately AFTER checking the API key**, if the user's prompt did **NOT** explicitly specify which animation style they want, **ASK the user to clarify** before writing the script or generating any assets:
   1. **Picture-Book Crayon Style** (`artStyle: 'crayon'`, previewed at `/`) — Warm `6 FPS` wax-crayon & oil-pastel storybook stop-motion on cold-press watercolor paper with an animated hardcover `bookFrame` opening/closing.
   2. **Classic Hand-Drawn Animation Style** (`artStyle: 'classic_cel'`, previewed at `/classic/<sceneId>`) — Authentic 1970s–1980s theatrical cel animation inspired by *Robin Hood* (1973) & *Mickey's Christmas Carol* (1983): raw electrostatic Xerox graphite toner outlines + flat matte analog cel paint characters over dappled watercolor/gouache illustration-board backgrounds, rostrum cel-over-background depth, tangible 35mm Eastmancolor film grain, organic `12 FPS` ("on twos") motion in a `24 FPS` film container, and theatrical iris/fade title & `"The End"` cards.

*(If the user's prompt already clearly names one style — e.g., "crayon storybook" or "classic hand-drawn / 1970s Disney cel" — proceed directly without re-asking.)*

---

## 3. Skill Routing (Load Before Acting)

| Task / Trigger | Mandatory Skill |
| :--- | :--- |
| User prompt is brief, high-level, or lacks detailed story/dialogue/voice specs | `skills/picture-book-script/SKILL.md` |
| **Picture-Book Crayon Style** scene design (`artStyle: 'crayon'`, `6 FPS`, `bookFrame`, crayon terrain) | `skills/picture-book-animation/SKILL.md` |
| **Picture-Book Crayon Style** custom / photo-modeled characters, props, or buildings (`src/assets/{characters,props,buildings}/`) | `skills/photo-to-crayon-asset/SKILL.md` |
| **Classic Hand-Drawn Animation Style** scene design (`artStyle: 'classic_cel'`, `12 FPS`, gouache multiplane backgrounds, `theatricalFrame`, 35mm grain) | `skills/classic-animation/SKILL.md` |
| **Classic Hand-Drawn Animation Style** custom / photo-modeled characters, props, or buildings (`src/assets/classicCel/{characters,props,buildings}/`) | `skills/classic-cel-asset/SKILL.md` |
| Voiceover, narration, character speech, multi-speaker dialogue, or Gemini TTS API key setup | `skills/picture-book-voiceover/SKILL.md` |
| Sound effects (`audioCues` / WAV), dynamic BGM, or external `audioClips` | `skills/picture-book-audio/SKILL.md` |
| Build verification, headless `.mp4` CLI export (`--style`), live `:5173` preview, or asset promotion | `skills/picture-book-studio-export/SKILL.md` |

---

## 4. Orchestration, Side-by-Side Parallel Subagents & Engineering Standards

Use the single main orchestrator **`picture-book-director`** (or act as orchestrator directly) to spin up **isolated parallel subagents** for every independent piece of work:

- **Parallel Research (`>= 3` Subagents for Changes `> 100` LOC)**: Any code change exceeding `100` lines MUST first spin up at least 3 parallel read-only researcher subagents (`TypeName: "research"`, always including a **Minimalism & Reuse Researcher**), passing exact paths to `docs/ARCHITECTURE.md`, `docs/STYLE_GUIDE.md`, `docs/AUDIO_CATALOG.md`, and `docs/VOICE_CATALOG.md`.
- **Side-by-Side Parallel Execution (Code + Assets + Audio + Voiceover Simultaneously)**: Once the animation style and story/file blueprint are locked, launch independent write-enabled worker subagents **at the same time in parallel** (via `define_subagent` with `EnableWriteTools: true`, or `TypeName: "self"` — never use read-only `research` for file writers and do not recursively invoke `picture-book-director` for leaf worker tasks) routed to the selected style's skills:
  - Isolated **Character / Prop / Building Subagent(s)**:
    - *Picture-Book Crayon (`crayon`)* → `skills/photo-to-crayon-asset/SKILL.md` → `src/assets/{characters,props,buildings}/<name>.ts`
    - *Classic Hand-Drawn Cel (`classic_cel`)* → `skills/classic-cel-asset/SKILL.md` → `src/assets/classicCel/{characters,props,buildings}/<name>.ts`
  - Isolated **Scene / Module Code Subagent(s)**:
    - *Picture-Book Crayon (`crayon`)* → `skills/picture-book-animation/SKILL.md` → `src/scenes/<sceneName>.ts`
    - *Classic Hand-Drawn Cel (`classic_cel`)* → `skills/classic-animation/SKILL.md` → `src/scenes/<sceneName>.ts`
  - Isolated **Per-SFX & Dynamic BGM Subagent(s)** (`src/audio/sfx/<name>.ts` and/or `scripts/sfx/<name>.mjs` → `public/audio/<name>.wav`, strictly one standalone file per SFX/BGM)
  - Isolated **Voiceover Subagent** (`public/audio/<line>.wav` via `generate_audio.mjs`, returning exact measured WAV durations)
- **Strict File-Ownership Isolation**: Parallel subagents must **never** concurrently edit shared barrel, schema, registry, or catalog files (`src/engine/schema.ts`, `src/assets/*/index.ts`, `src/assets/classicCel/*/index.ts`, `src/audio/sfx/index.ts`, `src/ui/app.ts`, `docs/*.md`). The orchestrator wires all barrels, reconciles returned `local SVG bounds × node.scale` against scene proportions, plugs measured WAV durations into the scene timeline, and updates docs in one clean integration pass.
- **Hierarchical Planning & Code Quality**:
  - For large engine/feature refactors, decompose work hierarchically (macro phases → micro sub-plans saved in `docs/plans/` and indexed in `docs/PLANS.md`); for video creation, use the `picture-book-script` Blueprint.
  - Import all colors, strokes, frame rates, filter IDs, and dimensions from `src/theme/tokens.ts` (`TOKENS` for `crayon`, `TOKENS.classicCel` for `classic_cel`) — never hardcode magic values or pure `#000000`/`#FFFFFF`.
  - Reuse shared engine primitives (`svgUtils.ts`, `filters.ts`, `fillMask.ts`, `bookFrame.ts`, `theatricalFrame.ts`, `timeline.ts`, `clock.ts`, `soundEngine.ts`).
  - Keep `docs/ARCHITECTURE.md`, `docs/STYLE_GUIDE.md`, `docs/AUDIO_CATALOG.md` (mirrored to `skills/picture-book-audio/references/audio-catalog.md`), and `docs/VOICE_CATALOG.md` (mirrored to `skills/picture-book-voiceover/references/voice-catalog.md`) up to date.
  - Compile under `strict: true`, run `agy-node scripts/studio-cli.mjs typecheck`, `test`, and `build` after every change, visually verify rendered scenes in the browser (`agy-node scripts/studio-cli.mjs dev`) to catch layout/scale/aesthetic bugs, and commit atomically via `agy-node scripts/vcs.mjs commit -m "..."`.

---

## 5. Non-Negotiable Production Guardrails

Details, tables, and code patterns for each guardrail live in the linked skill:

1. **API Key First, Then Clarify Style, Then Script** (`picture-book-voiceover`, `picture-book-script`): Always check the Gemini TTS API key first (unless voiceovers are opted out), ask the user to choose **Picture-Book Crayon** vs. **Classic Hand-Drawn Animation** if unspecified, and generate the full Production Script Blueprint before building when the prompt lacks script detail.
2. **Style-Pure Backgrounds, Physical Craft & Framing** (`picture-book-animation` vs. `classic-animation`):
   - *Picture-Book Crayon (`crayon`, `6 FPS`, `/`)*: Two-Tier Terrain Coloring (Tier 1 textured crayon `background_patch` + Tier 2 props, `0–25px` natural seams, slight outer overbleed clipped inside `bookFrame`), `3.5s` opening cover/color-in & `3.5s` closing credits.
   - *Classic Hand-Drawn Cel (`classic_cel`, `12 FPS` on twos, `/classic/<sceneId>`)*: Authentic 1970s–80s physical cel aesthetic — raw electrostatic Xerox graphite toner lines (`#xerox-ink`, `xeroxSketchStroke`) + **flat matte analog cel paint** on characters over **dappled, loose watercolor/gouache illustration-board backgrounds** (`#gouache-wash`, `gouacheDabWash`, `#bg-board-texture`), subtle rostrum cel depth (`#cel-drop-shadow`), tangible 35mm Eastmancolor film grain (`#cel-grade`, `#film-grain`), `theatricalFrame` (`3.0s` iris/fade title & `"The End"` card), and **STRICTLY ZERO** modern digital gradients on characters, neon glow halos, clean Illustrator vectors, slick glossy shading, `#crayon-stroke`, wax patterns, `bookFrame`, or `crayon_scribble`.
3. **Story Continuity, Transitions & Proportional Scale** (`picture-book-animation`, `classic-animation`, `photo-to-crayon-asset`, `classic-cel-asset`):
   - Visibly change backgrounds whenever location changes between acts.
   - Cut briskly (`~0.3–1.0s`) to the next scene once all characters exit.
   - Respect chronological **day/night cycle** order (`Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`, never jumping erratically backwards unless framed as a flashback/dream).
   - Enforce **in-scene object & companion permanence** — never pop items/mounts out of existence mid-scene.
   - Keep **character-to-scene proportions believable** (tables waist/chest height, never taller than characters; full-sized cars wider than a character's height; doorways taller than characters) and stage **cozy interior rooms at generous medium-shot scale (`~1.7–2.0×`)** so furniture, windows, fireplaces, and characters fill the room warmly like 1970s–80s Disney interiors rather than looking tiny against vast empty walls.
4. **Character Rigging, Lip-Sync (`speaking: true`) & Speech Bubbles** (`photo-to-crayon-asset`, `classic-cel-asset`): Enforce canonical `+X` forward facing (`flipX: false` = right) with dedicated 3/4 walking profiles, register `CHARACTER_SPEECH_ANCHORS`, and implement animated speaking mouths (`6 FPS` stepped in `crayon`; 4-stage `12 FPS` cel lip-sync in `classic_cel`) for every voiced character. **In voiced `classic_cel` theatrical scenes, omit comic speech bubbles by default and use `speaking: true` on `CharacterNode` / `NodeKeyframe` to drive 12 FPS mouth lip-sync cleanly** (reserving `speechText` bubbles only when the user explicitly wants silent/text-bubble storytelling; when using bubbles, aim for `~20–30` chars soft guideline per bubble).
5. **Voiceover & Gemini TTS Rules** (`picture-book-voiceover`):
   - Run `check-key` first. **Do NOT fall back to the OS synthesizer by default** — if unconfigured, explain that a free `$0` Google AI Studio API key (`https://aistudio.google.com/apikey`, no credit card required) unlocks all 30 voices & 40 presets for free, note `--os-fallback` is not recommended, and save their key persistently with `set-key`.
   - Consult `docs/VOICE_CATALOG.md` to cast voices by gender, age, roughness, pitch, accent, and theme.
   - Let every voice **complete before scene changes** unless purposefully scripting a cut-off; always **end voices at or before any character/scene change** (cap `AudioClipCue.duration`, clear `speechText: ''`, zero bleed); **animate the speaking character's mouth area** while talking; and **never overlap multiple characters' voices** unless specifically intended.
6. **Audio Catalog & Dynamic BGM** (`picture-book-audio`): Consult `docs/AUDIO_CATALOG.md` first; author each new SFX/BGM in its own standalone file via isolated subagents; **vary BGM tempo, rhythm, and mood across story sections** (faster/energetic for action beats, calmer/softer ducked `0.20–0.35` under dialogue).
7. **Export, Preview & Asset Promotion** (`picture-book-studio-export`): Run `test` + `build` → `agy-node scripts/studio-cli.mjs export --scene <sceneId> --resolution 1080p` (plus `--style classic_cel` when overriding) → start `agy-node scripts/studio-cli.mjs dev` (`IsDaemon: true`) → deliver clickable `.mp4` link + matching live preview URL (`http://localhost:5173/?scene=<sceneId>&autoplay=1` for `crayon`, or `http://localhost:5173/classic/<sceneId>?autoplay=1` for `classic_cel`) → whenever new assets were created in `<workspace>`, ask the user whether to promote them into `<plugin-root>/engine/` via `agy-node "<plugin-root>/scripts/ensure_engine.mjs" --promote-from "<workspace>"`.

# Plan: Classic 1970s–1980s Hand-Drawn Cel Animation Style (`artStyle: 'classic_cel'`)

- **Branch**: `hand_drawn_animation`
- **Visual Target**: 1970s–1980s theatrical Disney Xerox-era hand-drawn cel animation inspired by *Mickey's Christmas Carol* (1983), *Robin Hood* (1973), and *The Aristocats* (1970) — lush painted watercolor/gouache multiplane backgrounds, crisp Xerox charcoal ink outlines, solid matte 2-tone cel shading with moonlight/warm rim highlights, `12 FPS` ("on twos") motion inside a `24 FPS` film container, 35mm celluloid film grain + optical vignette, and classic theatrical iris/fade opening title & `"The End"` closing cards.
- **Backward Compatibility Goal**: 100% zero-regression preservation of the existing Picture-Book Crayon pipeline (`artStyle: 'crayon'`, `6 FPS`, `bookFrame`, `src/assets/`).

---

## Macro Phases & Micro Sub-Plans

### Stage 1 — Core Dual-Style Engine Pipeline & Unit Tests
- **Modules**:
  - `src/theme/tokens.ts`: Add `TOKENS.classicCel` (palette, Xerox strokes, `12 FPS` / `24 FPS` timing, classic cel filter IDs, serif/dialogue fonts; zero pure `#000000`/`#FFFFFF`).
  - `src/engine/schema.ts`: Add `AnimationStyleId = 'crayon' | 'classic_cel'`, `artStyle` & `theatricalFrame` on `SceneDefinition`, `fill` / `gradient` / `softEdge` on `BackgroundPatchNode`, and `artStyle` on `AnnotationNode`.
  - `src/engine/theatricalFrame.ts`: Implement `evaluateTheatricalFrameState` & `renderTheatricalFrameOverlay` (circular iris or fade opening + gold-serif title card, full-bleed `'story'` pass-through, closing iris-out centered on `irisFocus` + `"The End"` card).
  - `src/engine/svgUtils.ts`: Add `celStrokeAttrs`, `celPath`, `celShadedShape`, `gouachePath`, and `celContactShadow`.
  - `src/engine/filters.ts`: Extend `renderEngineDefs` for `classic_cel` (`#xerox-ink`, `#gouache-wash`, `#cel-drop-shadow`, `#cel-soft-glow`, `#cel-grade`, `#film-grain`, `#film-vignette`) and add `renderFilmCompositeLayer`.
  - `src/engine/renderer.ts`: Wire dual-style pipeline branching (`#cel-backdrop` vs `#paper-base`, `theatricalFrame` vs `bookFrame`, `#layer-3-film-composite` vs `#layer-3-paper-composite`, `data-art-style`, gradient `<defs>`).
  - `src/engine/videoExporter.ts`: Export `12 FPS` scenes cleanly into a `24 FPS` theatrical H.264/AAC MP4 container (`24 % fps === 0`), while preserving `30 FPS` container export for `6 FPS` crayon scenes.
  - `src/assets/annotations/pencilAnnotation.ts`: Style-aware classic cel speech/thought bubbles (`#FBF7EE`, Xerox charcoal outlines, dialogue typography).
- **Verification**: `tests/classicCelPipeline.test.ts` + full `typecheck` & `test` pass.

### Stage 2 — Style-Isolated Classic Cel Asset Library (`src/assets/classicCel/`)
- **Characters** (`src/assets/classicCel/characters/`):
  - `moonlitCat.ts` (`renderClassicMoonlitCat`): 2-tone cel-shaded Mochi, moonlight rim, `celContactShadow`, 12 FPS stride facing `+X`, and 4-stage cel lip-sync mouth (`Math.floor(frameIndex / 2) % 4`).
  - `moon.ts` (`renderClassicMoon`): Luminous cream-to-amber gouache crescent moon (`#cel-soft-glow`), craters, classic eyes, companion stars, 2-tone velvet nightcap.
  - `index.ts`: `CLASSIC_CEL_CHARACTER_RENDERERS`.
- **Buildings & Hero Props** (`src/assets/classicCel/{buildings,props}/`):
  - `buildings/ochreCottage.ts` (`renderClassicOchreCottage`) & `buildings/index.ts` (`CLASSIC_CEL_BUILDING_RENDERERS`).
  - `props/windChimeArbor.ts` (`renderClassicWindChimeArbor`) & `props/gardenFountain.ts` (`renderClassicGardenFountain`).
- **Garden Environment Props** (`src/assets/classicCel/props/`):
  - `tree.ts`, `streetLantern.ts`, `ambientGardenProps.ts` (`fluffy_cloud`, `star_cluster`, `meadow_flowers`, `grass_patch`, `music_notes`), and `props/index.ts` (`CLASSIC_CEL_PROP_RENDERERS`).

### Stage 3 — Showcase Scene, Barrel Dispatch, Studio UI, CLI & Tests
- **Scene**: `src/scenes/classicMoonlitCat.ts` (`CLASSIC_MOONLIT_CAT_SCENE`, `id: 'classic-moonlit-cat'`, `artStyle: 'classic_cel'`, `12 FPS`, `30s`, `theatricalFrame` iris, multiplane Zone A → Zone B gouache backgrounds, reusing all 6 existing lullaby & Gemini TTS WAV clips with zero `crayon_scribble` cues).
- **Barrels**: Dispatch `artStyle === 'classic_cel'` to `CLASSIC_CEL_*_RENDERERS` in `src/assets/{characters,props,buildings}/index.ts` with clean fallback.
- **Studio UI & CLI**: Register `CLASSIC_MOONLIT_CAT_SCENE` in `src/ui/app.ts`, parse `?style=crayon|classic_cel`, cycle FPS `6 → 8 → 12 → 24 → 6`, swap header icon (`🎞️` / `🖍️`), and forward `--style` / `--book-frame` in `scripts/studio-cli.mjs`.
- **Tests**: `tests/classicMoonlitCat.test.ts` + updated `tests/studioAudioAndUi.test.ts`.

### Stage 4 — Split Skills, Pre-Production Rules, Director Agent, README & Living Docs
- **Symmetric Style Skill Split**:
  - Picture-Book Crayon: `skills/picture-book-animation/SKILL.md` + `skills/photo-to-crayon-asset/SKILL.md` (explicitly scoped to `crayon`).
  - Classic Hand-Drawn Cel: NEW `skills/classic-animation/SKILL.md` + NEW `skills/classic-cel-asset/SKILL.md`.
- **Style-Aware Shared Skills**: `picture-book-script`, `picture-book-voiceover`, `picture-book-audio`, `picture-book-studio-export`.
- **Pre-Production Rule & Orchestration**: Update `rules/AGENTS.md` and `agents/picture-book-director.md` so Step 1 checks the Google AI Studio API key and Step 2 immediately asks the user to choose Picture-Book Crayon vs. Classic Hand-Drawn Animation if not specified in the prompt, then routes parallel subagents to the chosen style's skills and isolated asset folders.
- **Manifest, README & Living Docs**: Update `plugin.json`, `README.md`, `engine/docs/ARCHITECTURE.md`, `engine/docs/STYLE_GUIDE.md`, `engine/docs/PLANS.md`, and this plan document.

### Stage 5 — Initial Verification, Visual Inspection & MP4 Export Check *(Pass 1 Complete)*
- Ran `typecheck`, `test` (21/21 files, 143/143 tests), and `build`, plus headless 1080p MP4 export (`24 FPS` container) and 5-keyframe visual inspection.

### Stage 6 — Authentic 1970s–80s Xerox / Flat-Cel / Dappled-Gouache / 35mm-Film Overhaul & `/classic/...` Routing *(Pass 2)*
Guided directly by *Robin Hood* (1973) reference analysis to eliminate modern clean digital 2D vector feel and isolate Classic Cel behind its own website route:
- **Wave 1 — Core Physical Pipeline (`@cel-pipeline`), SPA Routing (`@scene-integrator`) & Style Rules/Docs (`@skills-and-docs`)**:
  - Upgrade `#xerox-ink` (dual-pass organic graphite wobble + fine toner paper-grit cycling with clock), enable `useXeroxFilter: true` by default in `celPath()`, add `xeroxSketchStroke()` and `gouacheDabWash()`.
  - Tune `TOKENS.classicCel.colors` to authentic earthy muted 1970s Eastmancolor pigments; upgrade `#gouache-wash` (brush-mottle + gentle rostrum softness) and add `#bg-board-texture` illustration-board paper tooth.
  - Separate Layer 1A (painted illustration-board background) from Layer 1B (transparent acetate foreground cels with `#cel-drop-shadow`); upgrade `#cel-grade` (Eastmancolor 35mm response, lifted warm shadows) and `renderFilmCompositeLayer` (perceptible per-frame 35mm celluloid grain); remove synthetic oval scrim from `theatricalFrame.ts`.
  - Add `/` (original Picture-Book Crayon Studio) vs. `/classic` / `/classic/mochi` / `/classic/<sceneId>` (Classic 1970s–80s Hand-Drawn Cel Studio) SPA routing + style-studio switcher bar across `studio-cli.mjs`, `app.ts`, `index.html`, and `studioAudioAndUi.test.ts`.
  - Update all Classic Cel skills (`classic-animation`, `classic-cel-asset`), `picture-book-studio-export`, `AGENTS.md`, `picture-book-director.md`, `README.md`, `STYLE_GUIDE.md`, and `ARCHITECTURE.md` to enforce raw Xerox flat-cel + dappled gouache + 35mm film craft and `/classic/...` routes.
- **Wave 2 — Asset & Scene Overhaul**:
  - Update Classic Cel characters (`moonlitCat.ts`, `moon.ts`), hero props/cottage (`ochreCottage.ts`, `windChimeArbor.ts`, `gardenFountain.ts`), garden props (`tree.ts`, `streetLantern.ts`, `ambientGardenProps.ts`), and `classicMoonlitCat.ts` to use flat matte analog cel paint + `xeroxSketchStroke` + `gouacheDabWash` + illustration-board backgrounds.
  - Re-verify `typecheck`, `test`, `build`, `/classic/mochi` visual keyframes, and headless 1080p MP4 export.

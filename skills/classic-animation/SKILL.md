---
name: classic-animation
description: "How to create, edit, and style authentic 1970s–1980s Classic Hand-Drawn Cel animations — raw electrostatic Xerox graphite toner lines, flat matte analog cel paint characters, dappled watercolor/gouache illustration-board backgrounds, rostrum camera cel-over-background depth, 35mm Eastmancolor film grain, theatrical iris/fade cards, and 12 FPS on-twos motion (artStyle: 'classic_cel', routed at /classic/...). Activate whenever the user chooses Classic Hand-Drawn Animation style (inspired by Disney's Robin Hood 1973 & Mickey's Christmas Carol 1983)."
---

# Classic Hand-Drawn Animation & Scene Authoring Skill (`artStyle: 'classic_cel'`)

This skill is the authoritative guide for designing, choreographing, and editing **authentic 1970s–1980s Classic Hand-Drawn Cel Animations** in the Studio engine (`<workspace>`, scaffolded from `<plugin-root>/engine/`), previewed at **`/classic/...`** (e.g., `http://localhost:5173/classic/mochi`).

Visual benchmark: theatrical Xerox-era hand-drawn shorts and features from the 1970s–1980s — inspired by ***Robin Hood* (1973)**, ***Mickey's Christmas Carol* (1983)**, and ***The Aristocats* (1970)**.

> [!IMPORTANT]
> - **Scope**: Use this skill ONLY for **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`)**. For **Picture-Book Crayon Style (`artStyle: 'crayon'`, served at `/`)**, load **`skills/picture-book-animation/SKILL.md`** instead.
> - **Custom Characters, Props & Buildings**: Load **`skills/classic-cel-asset/SKILL.md`** for creating authentic Xerox/flat-cel characters and gouache-board props/buildings in `src/assets/classicCel/{characters,props,buildings}/`.
> - **Brief Prompts**: If the user's prompt is brief or lacks story/dialogue detail, load **`skills/picture-book-script/SKILL.md`** first (setting `Animation Style: classic_cel`) to create the Production Script Blueprint.

---

## 1. Why 1970s–1980s Classic Animation Looks Vintage (Physical Craft Rules)

True 1970s–80s theatrical cel animation looks unmistakably analog and alive — **NEVER like modern clean 2D digital vector/Flash art**. Every scene MUST obey all four physical production pillars:

### Pillar 1 — Raw Electrostatic Xerox Graphite Toner Lines (`#xerox-ink` & `xeroxSketchStroke`)
- In the 1960s–80s Xerox process, animators' raw graphite pencil drawings were transferred directly onto clear acetate cels.
- Foreground outlines MUST use `#xerox-ink` (dual-pass organic graphite wobble + fine toner paper-grit, applied by default in `celPath()`) in warm dark charcoal (`TOKENS.classicCel.colors.xeroxInk`, never pure `#000000`) plus `xeroxSketchStroke()` for sketchy, broken, variable-pressure internal pencil lines (fur tufts, cheek/whisker ticks, cloth creases, collar folds).
- Let the Xerox seed cycle subtly with the stepped 12 FPS clock for genuine living hand-drawn line boil.

### Pillar 2 — Flat Opaque Analog Cel Paint on Characters vs. Dappled Watercolor/Gouache Illustration-Board Backgrounds
- **Characters (Layer 1B — Transparent Acetate Cel)**: Painted on the back of clear acetate using **flat, opaque, matte physical cel paint** mixed in paint jars — earthy, slightly muted 1970s Eastmancolor pigments (olive greens, russet browns, dusty pinks/lilacs, slate blues, warm parchment creams). Keep characters graphic and readable with **flat matte fills** (optional crisp hard-edged 2-tone shadow plane ONLY where strong directional drama demands it — NEVER airbrushed gradients, NEVER glossy specular shading, NEVER glowing neon outlines!).
- **Backgrounds (Layer 1A — Painted Watercolor/Gouache Illustration Board)**: Painted separately on heavy illustration board with **dappled, loose, impressionistic watercolor/gouache brushwork washes** (`#gouache-wash`, `gouacheDabWash`, `#bg-board-texture`) topped with **sparse, loose hand-inked foliage/grass/wood ticks** (`xeroxSketchStroke`). This stark physical separation — crisp graphic Xerox cels floating over soft, blotchy, hand-painted watercolor worlds — is the single biggest signature of *Robin Hood* (1973) and *Mickey's Christmas Carol* (1983)!

### Pillar 3 — Real Rostrum Camera, Hot Lights & 35mm Eastmancolor Celluloid Film
- **Physical Cel-Over-Background Depth**: `renderer.ts` separates Layer 1A (painted illustration-board background + `#bg-board-texture` + slight `#gouache-wash` optical softness) from Layer 1B (transparent acetate foreground cels with tiny physical rostrum hover shadow `#cel-drop-shadow`).
- **Tangible 35mm Celluloid Finish**: `#cel-grade` applies warm earthy Eastmancolor film response (muted analog saturation, warm lifted charcoal shadows, creamy paper-stock highlights, subtle 35mm optical softness) and Layer 3 (`renderFilmCompositeLayer` → `#layer-3-film-composite`) composites **perceptible, animated 35mm celluloid film grain** (`#film-grain`) + gentle warm film-gate vignette (`#film-vignette`).
- **Subtle Physical Optical Halation Only**: Practical lamps, cottage windows, moon, and fireflies use restrained warm 35mm optical halation (`#cel-soft-glow`) — NEVER harsh modern Photoshop/neon bloom rings!

### Pillar 4 — Organic Frame-by-Frame Human Drawing (`12 FPS` on Twos / `24 FPS` Film Container)
- Runs at **`12 FPS`** (`TOKENS.classicCel.timing.fps`) exported in a **`24 FPS`** theatrical MP4 container (`TOKENS.classicCel.timing.containerFps`), holding every hand-drawn cel cleanly on twos (`2` film frames per drawing).
- Emphasize expressive pose variation, bold squash-and-stretch, overlapping secondary motion (ears, tail, whiskers, garments), and living Xerox line boil — NEVER sterile puppet-rig floatiness.

### STRICTLY FORBIDDEN in `classic_cel` Scenes
- **NO** modern digital gradients (`linearGradient` / `radialGradient`) on foreground characters!
- **NO** slick glossy/airbrushed shading or modern vector/Illustrator razor-sharp sterile strokes!
- **NO** glowing neon halos, cyberpunk/Photoshop bloom rings, or hyper-saturated modern RGB colors!
- **NO** wax crayon / oil-pastel hatch patterns (`TOKENS.patterns.crayon*`), heavy `#crayon-stroke` displacement, raw `#paper-base` (`#F4EFE6`), `#layer-3-paper-composite`, `bookFrame` (unless explicitly requested), or `crayon_scribble` SFX cues!
- **NO** pure `#000000` ink or pure `#FFFFFF` highlights!
- **NO** synthetic geometric dark ellipse scrims behind opening titles!

---

## 2. Centralized Classic Cel Design Tokens (`TOKENS.classicCel`)

**All visual values** must be imported from `src/theme/tokens.ts`:

```typescript
import { TOKENS } from '../theme/tokens';
```

- **`TOKENS.classicCel.colors.*`**: Earthy, slightly muted 1970s Eastmancolor physical paint pigments (zero pure `#000000` or `#FFFFFF`):
  - *Theatre, Xerox Toner & Titles*: `backdropDark`, `xeroxInk` (warm graphite toner), `xeroxInkSoft`, `celCream` (creamy parchment), `celBubbleFill`, `goldTitle` (warm antique gold), `goldTitleShadow`, `contactShadow`
  - *Painted Night Sky, Glade & Woodland Gouache*: `nightSkyZenith`, `nightSkyMid`, `nightSkyHorizon`, `nightMistTeal`, `nightDeepGlade`, `nightGladeMid`, `nightGladeHorizon`, `foliageShadow`, `foliageMid`, `foliageLit`, `foliageRim`, `grassNightDeep`, `grassNightMid`, `grassNightLit`, `gladeGlow`
  - *Earth, Stone, Water, Timber & Cottage*: `pathEarthDark`, `pathEarthMid`, `pathMoonlit`, `stoneBase`, `stoneLight`, `stoneShadow`, `waterDeep`, `waterMid`, `waterHighlight`, `woodDark`, `woodMid`, `woodLit`, `cottagePlaster`, `cottagePlasterShadow`, `cottageRoof`, `cottageRoofShadow`, `cottageShutter`, `cottageShutterShadow`, `ironDark`, `ironHighlight`
  - *Restrained Warm Practical Lights*: `warmAmberCore`, `warmAmberGlow`, `warmAmberWash`, `warmAmberDeep`
  - *Flat Analog Character Cel Pigments*: `mochiFurBase`, `mochiFurShadow`, `mochiFurRim`, `mochiStripe`, `mochiCream`, `mochiCreamShadow`, `mochiEarPink`, `mochiNose`, `mochiTongue`, `mochiMouthInner`, `mochiCollar`, `mochiCollarShadow`, `mochiGold`, `mochiGoldHighlight`, `mochiEyeIris`, `moonCream`, `moonAmber`, `moonShadow`, `moonCrater`, `nightcapBlue`, `nightcapShadow`, `nightcapStripe`, `starGlow`, `flowerCream`, `flowerBlue`, `flowerRose`
- **`TOKENS.classicCel.strokes.*`**: `xeroxHeavy`, `xeroxMedium`, `xeroxFine`, `sketchLine`
- **`TOKENS.classicCel.timing.*`**: `fps: 12` ("on twos"), `frameDurationMs: 83.33`, `containerFps: 24`
- **`TOKENS.classicCel.filters.ids.*`**: `xeroxInk` (`#xerox-ink`), `gouacheWash` (`#gouache-wash`), `bgBoardTexture` (`#bg-board-texture`), `celDropShadow` (`#cel-drop-shadow`), `celSoftGlow` (`#cel-soft-glow`), `celGrade` (`#cel-grade`), `filmGrain` (`#film-grain`), `filmVignette` (`#film-vignette`)
- **`TOKENS.classicCel.typography.*`**: `fontFamilySerif`, `fontFamilyDialogue`

> [!CAUTION]
> **Never hardcode hex colors, stroke widths, or magic numbers** in scene files. When authoring a new daytime/forest/castle classic cel short, add authentic earthy 1970s Eastmancolor pigments (olive greens, russet browns, dusty pinks, slate blues, creamy parchment) to `TOKENS.classicCel.colors`.

---

## 3. The Classic Cel Dual-Plane + 35mm Film Render Pipeline (`artStyle: 'classic_cel'`)

When `scene.artStyle === 'classic_cel'` (or visited via `/classic/...` or `?style=classic_cel`), `evaluateAndRenderScene` (`src/engine/renderer.ts`) automatically switches the full render stack:

1. **Layer 1A — Painted Watercolor/Gouache Illustration-Board Background**:
   - Theatre backdrop `#cel-backdrop` (`TOKENS.classicCel.colors.backdropDark`) + multiplane `background_patch` layers rendered via `gouachePath()` (`#gouache-wash` brush-mottle displacement + gentle rostrum optical softness) and illustration-board paper tooth (`#bg-board-texture`), plus painted background architecture/foliage props with sparse loose hand-inked accents (`xeroxSketchStroke`).
2. **Layer 1B — Transparent Acetate Foreground Cels (`#cel-drop-shadow`)**:
   - Foreground classic cel characters (`src/assets/classicCel/characters/`) and hero interactive props inked with raw electrostatic `#xerox-ink` toner lines and flat matte analog cel paint, hovering with subtle physical rostrum cel separation (`#cel-drop-shadow`) over the softer painted background.
   - Entire Layer 1 is graded through `#cel-grade` (1970s Eastmancolor response, lifted warm shadows, micro-soft 35mm lens focus) and wrapped in `renderTheatricalFrameOverlay()`.
3. **Layer 2 — Classic Cel, Gouache & Optical `<defs>` (`renderEngineDefs({ artStyle: 'classic_cel' })`)**:
   - Emits `#xerox-ink`, `#gouache-wash`, `#bg-board-texture`, `#cel-drop-shadow`, `#cel-soft-glow`, `#cel-grade`, `#film-grain`, and `#film-vignette`.
4. **Layer 3 — 35mm Celluloid Film Composite (`#layer-3-film-composite` via `renderFilmCompositeLayer`)**:
   - Animated per-frame 35mm celluloid film grain (`#film-grain`) + gentle warm film-gate optical vignette (`#film-vignette`) — completely replacing cold-press crayon paper.

### Multiplane Painted Gouache Illustration-Board Architecture

Build **loose, dappled, impressionistic painted backdrops** with outer overbleed (`x: -80..1360`, `y: -60..780`) so camera pans/zooms never expose dark margins:

| Multiplane Depth Plane | Typical `zIndex` | Technique (`BackgroundPatchNode` / Props) |
| :--- | :--- | :--- |
| **Far Sky & Horizon Wash** | `1–2` | Soft muted vertical watercolor wash (`gradient` from `TOKENS.classicCel.colors` + `softEdge: true`) + faint atmospheric mist dab. |
| **Distant Impressionistic Trees / Hills** | `3–4` | Soft blotchy silhouetted ridges (`fill` / `gradient`, `softEdge: true`) receding into cool aerial mist. |
| **Midground Dappled Foliage / Hedgerow** | `5–6` | Layered scalloped watercolor/gouache foliage washes (`gouacheDabWash` inside props or layered `background_patch` shapes) with sparse loose sepia ink accents. |
| **Painted Meadow / Forest Floor** | `7–8` | Warm/earthy dappled ground wash extending past `y = 760`. |
| **Earthen Path & Soft Practical Pools** | `9–10` | Curved dirt/stone lane + restrained warm golden ground wash under lanterns or soft moonlight clearing pool. |
| **Painted Set Architecture & Foliage** | `11–20` | Painted illustration-board props & buildings (`src/assets/classicCel/{buildings,props}/`) with loose hand-inked wood/grass/leaf ticks. |
| **Foreground Xerox Cel Characters** | `21–34` | Flat matte cel-painted character rigs (`src/assets/classicCel/characters/`) with raw `#xerox-ink` outlines, `xeroxSketchStroke` fur/cloth ticks, and `celContactShadow`. |
| **Dialogue Bubbles & Annotations** | `35–40` | Clean parchment-cream cel bubbles (`#FBF7EE`) with Xerox charcoal borders (`speechText` / `speechStyle`). |

---

## 4. Theatrical Framing (`theatricalFrame`, `src/engine/theatricalFrame.ts`)

Every `classic_cel` scene defaults to `theatricalFrame` enabled (`bookFrame: false`):
1. **Opening (`0 .. openDurationSec`, default `3.0s`, `phase: 'opening'`)**:
   - Circular iris opens (`mode: 'iris'`) or warm theatre fade lifts (`mode: 'fade'`) directly over the painted establishing shot while `#theatrical-opening-title` displays classic parchment-gold serif lettering with an inked drop-shadow (NO modern geometric dark oval scrim!).
2. **Main Story (`openDurationSec .. durationSec - closeDurationSec`, `phase: 'story'`)**:
   - 100% full-bleed theatrical frame (`innerSceneMarkup` untouched).
3. **Closing (`durationSec - closeDurationSec .. durationSec`, default last `3.0s`, `phase: 'closing'`)**:
   - Circular iris closes gently onto `irisFocus` (e.g., resting hero `{ x: 690, y: 585 }`) or fades to dark velvet, revealing the classic serif **`"The End"`** card (`#theatrical-ending-card`).

```typescript
theatricalFrame: {
  enabled: true,
  mode: 'iris',                           // 'iris' (default) or 'fade'
  title: "Mochi's Moonlit Garden",
  subtitle: 'A Moonlit Lullaby Short',
  creditText: 'Classic Hand-Drawn Cel Animation',
  endingTitle: 'The End',
  endingCredit: "Mochi's Moonlit Garden · Sweet Dreams",
  openDurationSec: 3.0,                   // Keep first dialogue starting >= 3.1s
  closeDurationSec: 3.0,                  // Hold cozy final pose during iris-out
  irisFocus: { x: 690, y: 585 },          // Focus point for closing iris-out
  showTitleCard: true,
}
```

---

## 5. Continuity, Pacing, Scale, Facing & Lip-Sync Rules

All narrative staging guardrails apply strictly to `classic_cel` scenes:
1. **Location-Driven Background Changes**: When the story cuts to a new location (e.g., Cottage Garden Lane → Secret Moonlit Glade), visibly change ALL multiplane `background_patch` layers and painted set props/buildings.
2. **Brisk Cuts When Characters Exit**: Cut within `~0.3–1.0s` once all active characters leave a shot — never linger on an empty stage.
3. **Chronological Day/Night Continuity**: Progress logically forward (`Dawn → Midday → Sunset → Dusk → Night → next Morning`) across sky washes, sun/moon/stars, and warm practical lights.
4. **Object & Companion Permanence**: Never pop props, vehicles, or animal companions out of existence mid-scene.
5. **Proportional Scale**: Keep standing characters `~95–105px` tall at `scale: 1.0` (`~15–30%` of the `720px` canvas height in wide/medium shots), tables waist/chest height (`42–65px`), doorways `>= 110px`, cottages `~210–340px`, full cars `190–280px+` wide.
6. **Canonical `+X` Forward Facing**: Every character rig faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`. `evaluateSingleNode` enforces `flipX = next.x < prev.x` during horizontal `'walking'` segments.
7. **12 FPS Cel Lip-Sync & Voiceover Hygiene**:
   - Let every spoken line finish before scene transitions (`act.endTime >= clip.startTime + wavDuration + 0.4..0.8s`) unless intentionally cutting off.
   - Cap `AudioClipCue.duration <= transitionTime - startTime` and clear `speechText: ''` at character/scene changes (zero bleed).
   - Never overlap multiple speakers unless intentionally scripted (`~0.25–0.6s` gap).
   - Animate the speaking character's 4-stage hand-drawn cel mouth (`Math.floor(frameIndex / 2) % 4` at 12 FPS) across their exact spoken window (`isSpeaking` is enabled automatically when `speechText` is non-empty and `speechStyle !== 'thought'`, or when `state === 'singing'`).
   - Keep `speechText` bubbles concise (`~20–30` chars soft guideline).

---

## 6. Creating, Registering & Previewing a Classic Cel Scene

### Step 1: Author `<workspace>/src/scenes/<sceneName>.ts`
Study `<workspace>/src/scenes/classicMoonlitCat.ts` as the canonical reference implementation (`artStyle: 'classic_cel'`, `fps: TOKENS.classicCel.timing.fps`, `bookFrame: false`, `theatricalFrame`, multiplane painted gouache backgrounds, zero `crayon_scribble` cues).

### Step 2: Register in `SCENE_REGISTRY` (`<workspace>/src/ui/app.ts`)
Import your scene, add it to `SCENE_REGISTRY` under its `id` (e.g., `'my-classic-scene'`), and add a film-reel icon (`'🎞️'`) to `SCENE_SWITCHER_ICONS`. It is automatically reachable at **`/classic/<sceneId>`** (and shows in the Classic Cel Studio switcher at `/classic`).

### Step 3: Verify, Preview at `/classic/...` & Export

```bash
cd <workspace>
agy-node scripts/studio-cli.mjs typecheck
agy-node scripts/studio-cli.mjs test
agy-node scripts/studio-cli.mjs build
agy-node scripts/studio-cli.mjs export --scene my-classic-scene --style classic_cel --resolution 1080p
agy-node scripts/studio-cli.mjs dev
# Preview Classic Cel Studio: http://localhost:5173/classic/my-classic-scene?autoplay=1
# (Built-in Mochi showcase:   http://localhost:5173/classic/mochi?autoplay=1)
# (Picture-Book Crayon root:  http://localhost:5173/)
```

> [!NOTE]
> `videoExporter.ts` automatically detects `fps === 12` (`24 % fps === 0`) and writes a theatrical **`24 FPS` H.264/AAC MP4 container** holding each drawn cel cleanly on twos (`2` film frames per `12 FPS` drawing).

---

## 7. Reference Files

- **Canonical Classic Cel Example Scene**: `<workspace>/src/scenes/classicMoonlitCat.ts`
- **Classic Cel Asset Pipeline**: `skills/classic-cel-asset/SKILL.md`
- **Classic Cel Design Tokens**: `<workspace>/src/theme/tokens.ts` (`TOKENS.classicCel`)
- **Theatrical Framing Engine**: `<workspace>/src/engine/theatricalFrame.ts`
- **Xerox & Gouache Primitives**: `<workspace>/src/engine/svgUtils.ts` (`celPath`, `celShadedShape`, `xeroxSketchStroke`, `gouachePath`, `gouacheDabWash`, `celContactShadow`)
- **Classic Cel Filters, Board Tooth & 35mm Film Grain**: `<workspace>/src/engine/filters.ts` (`renderEngineDefs`, `renderFilmCompositeLayer`)
- **Architecture & Dual-Style Guide**: `<workspace>/docs/ARCHITECTURE.md` & `<workspace>/docs/STYLE_GUIDE.md`

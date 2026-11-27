---
name: classic-animation
description: "How to create, edit, and style 1970s–1980s Classic Hand-Drawn Cel animations, scenes, multiplane painted watercolor/gouache backgrounds, theatrical iris/fade framing, 12 FPS on-twos timing, camera choreography, and audio cues in the Studio engine (artStyle: 'classic_cel'). Activate whenever the user chooses or requests Classic Hand-Drawn Animation style (inspired by Disney's Mickey's Christmas Carol 1983 & Robin Hood 1973)."
---

# Classic Hand-Drawn Animation & Scene Authoring Skill (`artStyle: 'classic_cel'`)

This skill is the authoritative guide for designing, choreographing, and editing **1970s–1980s Classic Hand-Drawn Cel Animations** in the Studio engine (`<workspace>`, scaffolded from `<plugin-root>/engine/`).

Visual benchmark: theatrical hand-drawn cel shorts and features from the 1970s–1980s Xerox era — inspired by ***Mickey's Christmas Carol* (1983)**, ***Robin Hood* (1973)**, and ***The Aristocats* (1970)** — pairing **lush painted watercolor/gouache multiplane backgrounds** with **crisp Xerox charcoal ink-and-paint foreground cels**, **2-tone cel shading**, **12 FPS ("on twos")** animation inside a **24 FPS** film container, **classic theatrical iris/fade title cards**, and subtle **35mm celluloid film grain**.

> [!IMPORTANT]
> - **Scope**: Use this skill ONLY for **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`)**. For **Picture-Book Crayon Style (`artStyle: 'crayon'`)**, load **`skills/picture-book-animation/SKILL.md`** instead.
> - **Custom Characters, Props & Buildings**: Load **`skills/classic-cel-asset/SKILL.md`** for creating classic cel assets in `src/assets/classicCel/{characters,props,buildings}/`.
> - **Brief Prompts**: If the user's prompt is brief or lacks story/dialogue detail, load **`skills/picture-book-script/SKILL.md`** first (setting `Animation Style: classic_cel`) to create the Production Script Blueprint.

---

## 1. Core Visual Philosophy (1970s–1980s Xerox Cel + Painted Gouache)

Classic theatrical animation achieves depth through a deliberate visual contrast between **painted atmospheric backgrounds** and **crisp ink-and-paint foreground cels**:

### Mandatory Aesthetics
- **Painted Gouache/Watercolor Multiplane Backgrounds**: Full-bleed painted skies, distant misty ridges, woodland hedgerows, earthen lanes, and stonework built with layered `background_patch` nodes using painterly SVG `gradient` (`linear` / `radial`) and `fill` tokens from `TOKENS.classicCel.colors`, softened by `#gouache-wash` (`softEdge: true`, `outlined: false`).
- **Xerox Ink-and-Paint Foreground Cels**: Characters and hero interactive props are inked in warm dark charcoal (`TOKENS.classicCel.colors.xeroxInk = '#1D1815'` or `xeroxInkSoft = '#3A312A'` — **never** pure `#000000`) with solid opaque matte cel paint fills, **crisp 2-tone cel shadow planes**, **moonlit/warm rim highlights** (`celShadedShape`), and soft ground contact shadows (`celContactShadow`).
- **Practical Lighting & Optical Halation**: Lanterns, cottage windows, moonlight, stars, music notes, and fireflies emit warm golden/cream optical glows (`#cel-soft-glow`) and cast soft warm pools across nearby ground and foliage.
- **12 FPS ("On Twos") Timing**: Classic Disney animation runs at **`12 FPS`** (`TOKENS.classicCel.timing.fps`) — 12 drawings per second held for 2 frames each inside a **`24 FPS`** theatrical film container (`TOKENS.classicCel.timing.containerFps`) — giving fluid secondary motion (tails, ears, cloaks, water ripples, swaying vines) while retaining unmistakable hand-drawn cadence.
- **Theatrical Framing (`theatricalFrame`)**: Opens with a circular iris-in or warm theatre fade-in (`3.0s`) and gold-serif theatrical title card, runs full-bleed across the story, and closes with an iris-out centered on the hero (`irisFocus`) into a classic gold-serif `"The End"` card.

### Forbidden Effects — NEVER Use These in `classic_cel` Scenes
- **NO** wax crayon / oil-pastel hatch patterns (`TOKENS.patterns.crayon*`) or `#pat-marker-indigo-night`
- **NO** heavy `#crayon-stroke` displacement wobble or aggressive 6 FPS line boil
- **NO** raw cold-press watercolor paper background (`#paper-base`, `#F4EFE6`) or cold-press paper multiply overlay (`#layer-3-paper-composite`)
- **NO** hardcover `bookFrame` opening/closing (unless the user explicitly requests `bookFrame: true`)
- **NO** `crayon_scribble` foley cues in `audioCues`
- **NO** pure `#000000` ink or pure `#FFFFFF` highlights (always use `TOKENS.classicCel.colors.xeroxInk` and `celCream` / `warmAmberCore`)
- **NO** flat sterile digital vector look (every foreground cel needs 2-tone shadow/rim modeling; every background needs layered multiplane atmospheric gradients and foliage/architecture depth)
- **NO** neon cyberpunk glow or smooth sterile 60fps CSS `ease-in-out` tweening

---

## 2. Centralized Classic Cel Design Tokens (`TOKENS.classicCel`)

**All visual values** must be imported from `src/theme/tokens.ts`:

```typescript
import { TOKENS } from '../theme/tokens';
```

- **`TOKENS.classicCel.colors.*`**:
  - *Theatre & Ink*: `backdropDark` (`#121014`), `xeroxInk` (`#1D1815`), `xeroxInkSoft` (`#3A312A`), `celCream` (`#FAF6EC`), `celBubbleFill` (`#FBF7EE`), `goldTitle` (`#F2CC6B`), `goldTitleShadow` (`#4A3418`), `contactShadow` (`#121824`)
  - *Night Sky & Atmospheric Mist*: `nightSkyZenith` (`#111A36`), `nightSkyMid` (`#1C2E54`), `nightSkyHorizon` (`#2D4B68`), `nightMistTeal` (`#43697D`), `nightDeepGlade` (`#0E1C2E`), `nightGladeMid` (`#183047`), `nightGladeHorizon` (`#284A5E`)
  - *Woodland & Garden Gouache*: `foliageShadow` (`#162A2C`), `foliageMid` (`#24453E`), `foliageLit` (`#3D6A54`), `foliageRim` (`#6A9477`), `grassNightDeep` (`#1E3A32`), `grassNightMid` (`#2C5141`), `grassNightLit` (`#4A7557`), `gladeGlow` (`#3F6E61`)
  - *Earth, Stone & Water*: `pathEarthDark`, `pathEarthMid`, `pathMoonlit`, `stoneBase`, `stoneLight`, `stoneShadow`, `waterDeep`, `waterMid`, `waterHighlight`
  - *Practical Warm Lighting*: `warmAmberCore` (`#FFF1B8`), `warmAmberGlow` (`#F7C95C`), `warmAmberWash` (`#E69B3A`), `warmAmberDeep` (`#B86A24`)
  - *Timber, Cottage & Iron*: `woodDark`, `woodMid`, `woodLit`, `cottagePlaster`, `cottagePlasterShadow`, `cottageRoof`, `cottageRoofShadow`, `cottageShutter`, `cottageShutterShadow`, `ironDark`, `ironHighlight`
  - *Character Cel Paint Ramps & Celestial*: `mochiFurBase/Shadow/Rim/Stripe`, `moonCream/Amber/Shadow/Crater`, `nightcapBlue/Shadow/Stripe`, `starGlow`, `flowerCream/Blue/Rose` (add new character/daylight paint ramps directly into `TOKENS.classicCel.colors` when creating new classic cel stories!)
- **`TOKENS.classicCel.strokes.*`**: `xeroxHeavy` (`2.4`), `xeroxMedium` (`1.85`), `xeroxFine` (`1.2`), `sketchLine` (`0.95`)
- **`TOKENS.classicCel.timing.*`**: `fps: 12`, `frameDurationMs: 83.33`, `containerFps: 24`
- **`TOKENS.classicCel.filters.ids.*`**: `xeroxInk` (`#xerox-ink`), `gouacheWash` (`#gouache-wash`), `celDropShadow` (`#cel-drop-shadow`), `celSoftGlow` (`#cel-soft-glow`), `celGrade` (`#cel-grade`), `filmGrain` (`#film-grain`), `filmVignette` (`#film-vignette`)
- **`TOKENS.classicCel.typography.*`**: `fontFamilySerif` (gold theatrical titles), `fontFamilyDialogue` (clean cel dialogue bubbles)

> [!CAUTION]
> **Never hardcode hex colors, stroke widths, or magic numbers** in scene files. Extend `TOKENS.classicCel.colors` if a new scene needs a daytime or custom palette (keeping warm, slightly muted 1970s Eastmancolor pigments — never `#000000` or `#FFFFFF`).

---

## 3. The Classic Cel 3-Layer Render Pipeline (`artStyle: 'classic_cel'`)

When `scene.artStyle === 'classic_cel'` (or overridden via `?style=classic_cel`), `evaluateAndRenderScene` (`src/engine/renderer.ts`) automatically switches the full render stack:

1. **Layer 1 — Multiplane Painted Scene + Eastmancolor Print Grade (`#layer-1-base-scene`, `filter="url(#cel-grade)"`)**:
   - Theatre backdrop rect `#cel-backdrop` (`TOKENS.classicCel.colors.backdropDark`, `#121014`).
   - Multiplane `background_patch` layers rendered via `gouachePath()` with painterly `gradient` / `fill` definitions (`#gouache-wash`), followed by zIndex-sorted buildings, props, classic cel character rigs (`src/assets/classicCel/`), and clean cream cel speech/thought bubbles (`#FBF7EE`, Xerox charcoal border).
   - Progressive crayon fill masks (`enableProgressiveFill`) and `bookFrame` default to `false`; `theatricalFrame` defaults to `true` and wraps Layer 1 via `renderTheatricalFrameOverlay()`.
2. **Layer 2 — Classic Cel & Gouache `<defs>` (`renderEngineDefs({ artStyle: 'classic_cel' })`)**:
   - Emits `#xerox-ink` (subtle `0.55px` graphite displacement stepped cleanly), `#gouache-wash` (soft `1.2px` painterly watercolor edge), `#cel-drop-shadow` (subtle multiplane acetate separation), `#cel-soft-glow` (warm optical halation for lamps/moon/fireflies/stars), `#cel-grade` (warm Eastmancolor theatrical print color grade), `#film-grain`, and `#film-vignette`.
3. **Layer 3 — 35mm Celluloid Film Composite (`#layer-3-film-composite` via `renderFilmCompositeLayer`)**:
   - Subtle optical cinema gate vignette (`url(#film-vignette)`) + fine monochromatic 35mm film grain (`url(#film-grain)`, `mix-blend-mode: overlay`, `opacity: 0.075`). Replaces the cold-press paper overlay completely.

### Multiplane Painted Gouache Background Architecture

Instead of crayon hatch patches with raw paper seams, build **seamless, multi-depth painted gouache backdrops** with outer overbleed (`x: -80..1360`, `y: -60..780`) so camera pans/zooms never reveal dark backdrop edges:

| Multiplane Depth Plane | Typical `zIndex` | Technique (`BackgroundPatchNode`) |
| :--- | :--- | :--- |
| **Far Sky & Horizon Mist** | `1–2` | Vertical `linear` `gradient` (`nightSkyZenith → nightSkyMid → nightSkyHorizon`) + optional `radial` horizon mist/moonlight glow (`softEdge: false` or `true`). |
| **Distant Hills / Woodland Silhouettes** | `3–4` | Soft curved ridge paths with cool atmospheric `fill` or `gradient` (`foliageShadow` / `nightMistTeal`, `softEdge: true`) for aerial perspective. |
| **Midground Hedgerow / Canopy / Walls** | `5–6` | Layered scalloped painted foliage washes (`foliageMid` → `foliageShadow` gradient) framing the stage and separating locations cleanly. |
| **Painted Ground / Lawn / Forest Floor** | `7–8` | Full lower-zone `linear` `gradient` (`grassNightDeep → grassNightMid → grassNightLit`) extending cleanly past `y = 760`. |
| **Earthen Path & Practical Light Pools** | `9–10` | Curved garden lane (`pathEarthDark → pathEarthMid → pathMoonlit`) plus soft `radial` warm lantern light pools (`warmAmberGlow` fading to `opacity: 0`) or moonlight clearings (`gladeGlow`). |
| **Set Dressing & Hero Architecture** | `11–20` | Classic cel props & buildings (`star_cluster`, `fluffy_cloud`, `tree`, `ochre_cottage`, `street_lantern`, `wind_chime_arbor`, `garden_fountain`, `grass_patch`, `meadow_flowers`). |
| **Foreground Cel Characters & FX** | `21–34` | Classic cel character rigs (`src/assets/classicCel/characters/*`) with `celContactShadow`, 2-tone cel shading, plus glowing floating accents (`music_notes`, fireflies). |
| **Dialogue Bubbles & Annotations** | `35–40` | Character-attached `speechText` / `speechStyle` bubbles (rendered automatically in clean cream `#FBF7EE` with Xerox charcoal outlines) or crisp serif captions. |

---

## 4. Theatrical Framing (`theatricalFrame`, `src/engine/theatricalFrame.ts`)

Every `classic_cel` scene defaults to `theatricalFrame` enabled (`bookFrame: false`):
1. **Opening (`0 .. openDurationSec`, default `3.0s`, `phase: 'opening'`)**:
   - Circular iris opens (`irisProgress: 0 → 1`) or warm cinema fade lifts (`blackVeilOpacity: 1 → 0`) over the establishing painted background while the gold-serif title card (`#theatrical-opening-title`: `creditText`, `title`, ornamental hairline divider, `subtitle`) fades in, holds, and fades out before the first dialogue beat.
2. **Main Story (`openDurationSec .. durationSec - closeDurationSec`, `phase: 'story'`)**:
   - 100% full-bleed theatrical frame (`innerSceneMarkup` untouched, zero overlay overhead).
3. **Closing (`durationSec - closeDurationSec .. durationSec`, default last `3.0s`, `phase: 'closing'`)**:
   - Circular iris closes gently onto `irisFocus` (e.g., resting hero `{ x: 690, y: 585 }`) or fades smoothly to `#121014`, revealing the gold-serif **`"The End"`** card (`#theatrical-ending-card`) and `endingCredit`.

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
1. **Location-Driven Background Changes**: When the story cuts to a new location (e.g., Cottage Garden Lane → Secret Moonlit Glade), visibly change ALL multiplane `background_patch` layers (sky gradient, woodland silhouettes, ground wash, light pools) and Tier 2 props/buildings.
2. **Brisk Cuts When Characters Exit**: Cut within `~0.3–1.0s` once all active characters leave a shot — never linger on an empty stage.
3. **Chronological Day/Night Continuity**: Progress logically forward (`Dawn → Midday → Sunset → Dusk → Night → next Morning`) across sky gradients, sun/moon/stars, and warm practical lights.
4. **Object & Companion Permanence**: Never pop props, vehicles, or animal companions out of existence mid-scene.
5. **Proportional Scale**: Keep standing characters `~95–105px` tall at `scale: 1.0` (`~15–30%` of the `720px` canvas height in wide/medium shots), tables waist/chest height (`42–65px`), doorways `>= 110px`, cottages `~210–340px`, full cars `190–280px+` wide.
6. **Canonical `+X` Forward Facing**: Every character rig faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`. `evaluateSingleNode` enforces `flipX = next.x < prev.x` during horizontal `'walking'` segments.
7. **12 FPS Cel Lip-Sync & Voiceover Hygiene**:
   - Let every spoken line finish before scene transitions (`act.endTime >= clip.startTime + wavDuration + 0.4..0.8s`) unless intentionally cutting off.
   - Cap `AudioClipCue.duration <= transitionTime - startTime` and clear `speechText: ''` at character/scene changes (zero bleed).
   - Never overlap multiple speakers unless intentionally scripted (`~0.25–0.6s` gap).
   - Animate the speaking character's 4-stage cel mouth (`Math.floor(frameIndex / 2) % 4` at 12 FPS) across their exact spoken window (`isSpeaking` is automatically enabled when `speechText` is non-empty and `speechStyle !== 'thought'`, or when `state === 'singing'`).
   - Keep `speechText` bubbles concise (`~20–30` chars soft guideline).

---

## 6. Creating & Registering a Classic Cel Scene

### Step 1: Author `<workspace>/src/scenes/<sceneName>.ts`

Study `<workspace>/src/scenes/classicMoonlitCat.ts` as the canonical reference implementation. Minimal structure:

```typescript
import { TOKENS } from '../theme/tokens';
import type {
  AudioClipCue,
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

const C = TOKENS.classicCel.colors;

const MY_CEL_NODES: SceneNode[] = [
  // Multiplane painted gouache sky (note: `material` stays a valid CrayonMaterialId fallback)
  {
    id: 'sky-night-gouache',
    type: 'background_patch',
    zIndex: 1,
    x: 0, y: 0,
    material: 'markerIndigoNight',
    softEdge: false,
    bounds: { x: -80, y: -60, width: 1440, height: 500 },
    d: 'M -80 -60 L 1360 -60 L 1360 440 L -80 440 Z',
    gradient: {
      type: 'linear',
      x1: '0%', y1: '0%', x2: '0%', y2: '100%',
      stops: [
        { offset: '0%', color: C.nightSkyZenith },
        { offset: '55%', color: C.nightSkyMid },
        { offset: '100%', color: C.nightSkyHorizon },
      ],
    },
  },
  // Painted moonlit lawn
  {
    id: 'lawn-gouache',
    type: 'background_patch',
    zIndex: 7,
    x: 0, y: 0,
    material: 'crayonGrassGreen',
    softEdge: true,
    bounds: { x: -80, y: 400, width: 1440, height: 380 },
    d: 'M -80 430 Q 320 405, 640 425 T 1360 418 L 1360 780 L -80 780 Z',
    gradient: {
      type: 'linear',
      x1: '0%', y1: '0%', x2: '0%', y2: '100%',
      stops: [
        { offset: '0%', color: C.grassNightDeep },
        { offset: '48%', color: C.grassNightMid },
        { offset: '100%', color: C.grassNightLit },
      ],
    },
  },
  // Classic cel character (automatically dispatched to src/assets/classicCel/characters/*)
  {
    id: 'hero-cat',
    type: 'character',
    kind: 'moonlit_cat',
    state: 'idle',
    zIndex: 24,
    x: 360, y: 600,
    scale: 1.0,
  },
];

export const MY_CLASSIC_SCENE: SceneDefinition = {
  id: 'my-classic-scene',
  title: 'My Classic Short',
  subtitle: 'A 1970s–80s Hand-Drawn Cel Short',
  artStyle: 'classic_cel',
  fps: TOKENS.classicCel.timing.fps, // 12 FPS on twos (exported in 24 FPS MP4 container)
  durationSec: 30,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  bookFrame: false,
  theatricalFrame: {
    enabled: true,
    mode: 'iris',
    title: 'My Classic Short',
    subtitle: 'A 1970s–80s Hand-Drawn Cel Short',
    creditText: 'Classic Hand-Drawn Cel Animation',
    endingTitle: 'The End',
    endingCredit: 'My Classic Short · Fin',
    openDurationSec: 3.0,
    closeDurationSec: 3.0,
    irisFocus: { x: 640, y: 540 },
  },
  acts: [/* ... */],
  nodes: MY_CEL_NODES,
  timeline: [/* ... */],
  camera: [{ time: 0, x: 0, y: 0, zoom: 1.0 }],
  audioCues: [/* chime, lullaby, garden_wind_chime — NO crayon_scribble! */],
  audioClips: [/* BGM & Gemini TTS WAVs */],
};
```

### Step 2: Register in `SCENE_REGISTRY` (`<workspace>/src/ui/app.ts`)

Import `MY_CLASSIC_SCENE`, add it to `SCENE_REGISTRY` under its `id` (`'my-classic-scene'`), and add a film-reel icon (`'🎞️'`) to `SCENE_SWITCHER_ICONS`.

### Step 3: Verify, Preview & Export

```bash
cd <workspace>
agy-node scripts/studio-cli.mjs typecheck
agy-node scripts/studio-cli.mjs test
agy-node scripts/studio-cli.mjs build
agy-node scripts/studio-cli.mjs export --scene my-classic-scene --style classic_cel --resolution 1080p
agy-node scripts/studio-cli.mjs dev
# Preview: http://localhost:5173/?scene=my-classic-scene&style=classic_cel&autoplay=1
```

> [!NOTE]
> `videoExporter.ts` automatically detects `fps === 12` (divisible into 24) and writes a theatrical **`24 FPS` H.264/AAC MP4 container** holding each drawn cel cleanly on twos (`2 container frames per 12 FPS drawing`).

---

## 7. Reference Files

- **Canonical Classic Cel Example Scene**: `<workspace>/src/scenes/classicMoonlitCat.ts`
- **Classic Cel Asset Pipeline**: `skills/classic-cel-asset/SKILL.md`
- **Classic Cel Design Tokens**: `<workspace>/src/theme/tokens.ts` (`TOKENS.classicCel`)
- **Theatrical Framing Engine**: `<workspace>/src/engine/theatricalFrame.ts`
- **Cel SVG Primitives**: `<workspace>/src/engine/svgUtils.ts` (`celPath`, `celShadedShape`, `celStrokeAttrs`, `gouachePath`, `celContactShadow`)
- **Classic Cel Filters & Film Grain**: `<workspace>/src/engine/filters.ts` (`renderEngineDefs`, `renderFilmCompositeLayer`)
- **Architecture & Dual-Style Guide**: `<workspace>/docs/ARCHITECTURE.md` & `<workspace>/docs/STYLE_GUIDE.md`

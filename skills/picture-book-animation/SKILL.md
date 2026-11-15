---
name: picture-book-animation
description: "How to create, edit, and style animations, scenes, acts, timelines, camera choreography, audio cues, and visual styling in the Picture-Book Crayon Video Engine. Activate whenever deciding how to make or edit animations, scenes, acts, timelines, camera choreography, or visual styling."
---

# Picture-Book Animation & Scene Authoring Skill

This skill is the authoritative guide for creating and editing animated storybook scenes in the **Picture-Book Crayon Video Engine** (`<workspace>`, scaffolded from `<plugin-root>/engine/`).

> [!IMPORTANT]
> For the complete catalog of all 15 characters, 2 buildings, 13 props, 21 crayon fill patterns, full TypeScript interfaces, TOKENS color palette, and SCENE_REGISTRY routing — see [references/catalog-and-schema.md](references/catalog-and-schema.md).

---

## 1. Core Visual Philosophy

Every scene must look like a **physical children's picture book** illustrated with **wax crayons, oil pastels, and felt-tip markers** on heavy cold-press watercolor paper.

### Mandatory aesthetics
- **Paper base**: Warm uncoated paper `#F4EFE6` (`TOKENS.colors.paperWarm`) — never pure `#FFFFFF`.
- **Outlines**: Charcoal/sepia pencil `#2B231D` (`TOKENS.colors.charcoalOutline`) — never pure `#000000`.
- **Fills**: Must use textured SVG `<pattern>` fills (dry-crayon hatch patterns from `TOKENS.patterns.*`) — never flat solid fills without texture.
- **Negative space**: Preserve generous areas of raw warm paper. Background sky and ground use partial-bleed vignette patches whose color fills in via stepped stop-motion brush/band masks.

### Forbidden effects — NEVER use these
- Flat digital gradients (`linear-gradient`, `radial-gradient`)
- Glowing neon effects, CSS glow/bloom
- CSS `box-shadow` or `drop-shadow` on shapes
- Pure `#FFFFFF` backgrounds or pure `#000000` outlines
- Smooth 60fps `ease-in-out` motion curves

### Vibrant Crayon Mode (`vibrantMode: true`)
Boosts pigment saturation (1.42×) and contrast via `#vibrant-grade` filter while reducing paper multiply overlay opacity (0.35) so pastel blues, meadow greens, reds, and yellows shine with vivid crayon intensity. Set `vibrantMode: true` on the `SceneDefinition` to enable by default, or override via URL `?vibrant=1`.

---

## 2. Centralized Design Tokens

**All visual values** must come from the centralized theme module:

```
src/theme/tokens.ts  →  import { TOKENS } from '../theme/tokens';
```

- `TOKENS.colors.*` — 40+ official palette colors (paper, outlines, fills, vibrant meadow palette)
- `TOKENS.strokes.*` — Outline weights (`outlineHeavy: 3.5`, `outlineMedium: 2.6`, `outlineThin: 1.8`)
- `TOKENS.timing.*` — Frame rate (`fps: 6`), line-boil seeds (`1..6`), default fill steps (`10`)
- `TOKENS.patterns.*` — 21 crayon fill pattern IDs + paper fleck mask
- `TOKENS.filters.ids.*` — SVG filter IDs (`crayonStroke`, `crayonOutline`, `vibrantGrade`, etc.)
- `TOKENS.canvas.*` — Standard dimensions (`1280×720`, viewBox `0 0 1280 720`)
- `TOKENS.typography.*` — Font families and sizes

> [!CAUTION]
> **Never hardcode hex colors, stroke widths, or magic numbers** in scene files. Always import from `TOKENS` so global adjustments propagate everywhere.

---

## 3. The 3-Layer Render Pipeline

Every frame rendered by the engine passes through three mandatory visual layers:

### Layer 1 — Base Scene Graph
Background vignette patches (with progressive stop-motion fill masks), architecture, props, character cutout rigs, and hand-drawn annotations arranged in 2D SVG space on warm raw paper (`#F4EFE6`). Optionally graded by `#vibrant-grade` when Vibrant Mode is active.

### Layer 2 — SVG Crayon & Line-Boil Filter (`#crayon-stroke`)
`<feTurbulence type="fractalNoise">` + `<feDisplacementMap>` roughens edges into waxy, uneven borders. The filter `seed` updates at the quantized **6 FPS** clock rate to create a gentle hand-drawn "boiling" effect. Configured via `TOKENS.filters.crayonTurbulence`.

### Layer 3 — Physical Paper Composite Layer
Full-frame cold-press watercolor paper texture overlay (`mix-blend-mode: multiply`) plus a dry-brush grain mask (`pat-paper-flecks`) that punches tiny raw-paper flecks out of solid crayon fills.

### Progressive Stop-Motion Fill Masks
Background patches and certain props can reveal their crayon color progressively over time via stepped fill masks:

| `fillStyle` | Effect |
|---|---|
| `'top-down-bands'` | Horizontal bands sweep downward (with optional `wrapRightNegativeSpace` for sky wrapping around Moon) |
| `'diagonal-strokes'` | Diagonal hatching strokes sweep across |
| `'radial-scribble'` | Radial scribble spirals outward from center |

Set `fillProgress` (0..1) and `fillSteps` (default 10) on nodes, and animate `fillProgress` via timeline keyframes.

### Mandatory Two-Tier Terrain Coloring, Natural Crayon Seams & Outer Overbleed
Every visible environment region on the `1280×720` stage (`Sky` in the upper zone + `Ground / Ocean / Beach / Floor` in the lower zone) **MUST** be colored using a **Two-Tier Terrain Architecture** so no terrain zone is left as uncolored white paper:

1. **Props Alone Are NEVER a Background (Two-Tier Rule)**:
   - **Tier 1 — Full-Zone Crayon Base (`background_patch`)**: First cover the entire terrain zone with a textured `background_patch` (`getPatternFill(material)`).
   - **Tier 2 — Surface Texture & Detail Props (`prop` / `building` at higher `zIndex`)**: Layer detail props (`grass_patch`, `ocean_waves`, `meadow_flowers`, `beach_umbrella`, etc.) *on top* of that colored base patch.

| Environment Zone | Tier 1: Mandatory Base `background_patch` | Tier 2: Detail Props & Accents on Top (`zIndex` above base) | Forbidden Mistake |
| :--- | :--- | :--- | :--- |
| **Sky (Day / Sunset / Night)** | Full sky `background_patch` (`crayonSkyBlue`, `crayonSunsetOrange`, or `markerIndigoNight`) covering from the top edge down to the horizon. | `fluffy_cloud`, `sun`, `moon`, `star_cluster`, `chimney_puffs`. | Leaving the sky completely missing a `background_patch`. |
| **Grass / Meadow / Forest Floor** | Full ground `background_patch` (`crayonGrassGreen`, `crayonMeadowLight`, or `crayonForestGreen`) covering from the horizon to the bottom edge. | `grass_patch` tufts, `meadow_flowers`, `tree`, `spooky_tree`, `campfire`, plus optional dirt road `background_patch` (`crayonOchre`). | Dropping 2–3 floating `grass_patch` props onto blank white paper with no green ground `background_patch` underneath. |
| **Ocean / Sea / Lake / River** | Full water-body `background_patch` (`crayonCatBlue`, `crayonSkyBlue`, or `crayonRoyalBlue`) covering the entire water area from the horizon down to the bottom edge. | `ocean_waves` crests, `water_splash`, `swim_floatie`, shallows patch (`crayonSkyBlue`), or moon shimmer (`crayonWarmMoon`). | Drawing `ocean_waves` line art over uncolored white paper with no blue water fill underneath. |
| **Beach / Sand / Desert / Dirt Yard** | Full sandy shore `background_patch` (`crayonOchre` or `crayonWarmMoon`) covering the entire beach/sand zone down to the bottom edge. | `beach_umbrella`, `beach_ball`, `swim_floatie`, `birthday_cake`, shoreline `ocean_waves` foam. | Leaving the beach area as uncolored paper and assuming the warm paper color counts as sand. |
| **Village Street / Castle Yard / Floor** | Full ground/courtyard base `background_patch` (`crayonGrassGreen`, `crayonOchre`, or `crayonSoftTerracotta`) + optional road strip. | `ochre_cottage`, `corner_store`, `royal_castle`, `street_lantern`, `apple_crate`, `bicycle`, `grass_patch`. | Leaving the entire village ground between buildings as raw uncolored paper. |

2. **Natural Crayon Seams (`0–25px` max) & Full Vertical Coverage**:
   - Vertically from top to bottom, the upper sky zone and the lower ground/water/sand zone must cover the stage so the bottom half of the screen is never left uncolored.
   - Between major zones (e.g., between sky and grass, sky and ocean water, or beach sand and water), a small organic hand-drawn crayon seam (`0–25px`) or gentle overlap is completely natural and preserves the authentic hand-drawn crayon look—just never leave large vertical bands (`> 25px`) or entire half-screens uncolored.

3. **Outer Canvas Overbleed (Automatically Clipped Inside `bookFrame`)**:
   - Extend the outer edges of full-screen sky and ground/water/beach `background_patch` paths and `bounds` slightly beyond `0..1280 × 0..720` (e.g., `x: -60..1340`, `y: -40..760`) so camera pans, zooms, and `#crayon-stroke` edge turbulence never expose blank white margins along the screen edges during the story.
   - Because `bookFrame` (`src/engine/bookFrame.ts`) wraps the entire scene inside `<svg id="book-page-container" width="1280" height="720" overflow="hidden">` and `<g id="book-page-clip-group" clip-path="url(#book-open-page-clip)">`, any outer overbleed is strictly clipped to the curved notebook pages during the intro and outro book sequences and will **never** bleed outside the notebook.

### Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`, `src/engine/bookFrame.ts`)
Every scene in the Picture-Book Studio is framed inside an animated hand-drawn physical storybook (`bookFrame` enabled by default):
1. **Opening Cover & Zoom-In (`0 .. openDurationSec`, default `3.5s`, `phase: 'opening'`)**:
   - Starts zoomed out (`bookScale: 0.68`) on a closed hardcover picture book (`#book-front-cover`) showing the scene's title (`coverTitle`, defaulting to `scene.title`), subtitle (`coverSubtitle`), and optional credit (`creditText`).
   - The book cover opens in stepped `6 FPS` stop-motion (`coverOpenProgress: 0 -> 1`) to reveal the scene inside the open book spread (`#book-frame-spread`) starting at **0% crayon color** (`colorFillMultiplier: 0` — hand-drawn charcoal outline sketch on warm paper).
   - As the camera zooms into the book spread (`bookScale: 0.68 -> 1.0`), the crayon colors progressively fill in from **0% to 100%** (`colorFillMultiplier: 0 -> 1`).
2. **Main Story (`openDurationSec .. durationSec - closeDurationSec`, `phase: 'story'`)**:
   - Full-bleed 16:9 storybook animation (`bookScale: 1.0`, `colorFillMultiplier: 1.0`, 100% identical to standard scene rendering).
3. **Ending Color-Out, Zoom-Out & Closing Credits (`durationSec - closeDurationSec .. durationSec`, default last `3.5s`, `phase: 'closing'`)**:
   - The view zooms back out into the open book spread (`1.0 -> 0.68`) as the crayon pigment drains from **100% down to 0%** (`colorFillMultiplier: 1 -> 0`), returning to a pencil/charcoal sketch before the book cover closes (`coverCloseProgress: 0 -> 1`, `#book-ending-cover`) to display the scene name, `endingTitle` (`"The End ★"`), and `endingCredit` / credits card.

#### `BookFrameConfig` Interface & `SceneDefinition` Configuration
```typescript
export interface BookFrameConfig {
  enabled?: boolean;            // default: true
  coverTitle?: string;          // defaults to scene.title
  coverSubtitle?: string;       // defaults to scene.subtitle
  creditText?: string;          // optional author/illustrator credit on front/back cover
  endingTitle?: string;         // defaults to 'The End ★'
  endingCredit?: string;        // defaults to scene.title + optional credit line
  coverMaterial?: CrayonMaterialId;  // default: 'crayonTerracotta'
  accentMaterial?: CrayonMaterialId; // optional accent crayon fill
  openDurationSec?: number;     // default: 3.5
  closeDurationSec?: number;    // default: 3.5
}
```

#### Choreography Best Practices for `bookFrame`
- **Opening (`0 .. openDurationSec`, default `~3.5s`)**: Keep Act I's main character dialogue or key action starting after `openDurationSec` (or let the first `~3.5s` serve as the book-opening & color-in establishing shot, optionally paired with a `crayon_scribble` or `chime` audio cue).
- **Ending (`durationSec - closeDurationSec .. durationSec`, default final `~3.5s`)**: Let the final `~3.5s` serve as a gentle farewell pose as the scene zooms out, un-colors to sketch, and closes the book (optionally paired with a `lullaby` cue).
- **Customization & Toggles**: Customize cover titles, credits, cover material, or open/close durations via `scene.bookFrame` (or pass `bookFrame: false` to disable), toggle the book frame live in the Studio UI (`#chk-book-frame`), or pass `?book_frame=1|0` in the URL.

---

## 4. Creating a New Scene

### Step 1: Create the scene file

Create a new TypeScript file in `<workspace>/src/scenes/<sceneName>.ts`:

```typescript
import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

// 1. Define acts (story chapters with time ranges)
const MY_SCENE_ACTS: StoryAct[] = [
  {
    id: 'intro',
    title: 'Act I · Title Here',
    startTime: 0,
    endTime: 8,
    caption: 'Description of what happens in this act.',
  },
  // ... more acts
];

// 2. Define scene nodes (characters, props, buildings, backgrounds)
const MY_SCENE_NODES: SceneNode[] = [
  // Background vignette patch
  {
    id: 'sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0, y: 0,
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 0, y: 0, width: 1280, height: 500 },
    d: 'M 0 0 L 1280 0 L 1280 500 L 0 500 Z',
  },
  // Character
  {
    id: 'my-character',
    type: 'character',
    kind: 'little_girl',      // see catalog for all 15 CharacterKind values
    state: 'idle',
    zIndex: 20,
    x: 640, y: 500,
    scale: 1.0,
  },
  // Prop
  {
    id: 'my-tree',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 200, y: 450,
  },
  // Hand-lettered annotation
  {
    id: 'title-text',
    type: 'annotation',
    zIndex: 40,
    x: 640, y: 100,
    text: 'Once Upon a Time ★',
    color: TOKENS.colors.charcoalOutline,
    fontSize: 28,
  },
];

// 3. Define timeline (keyframed animation tracks)
const MY_SCENE_TIMELINE: TimelineTrack[] = [
  {
    nodeId: 'my-character',
    keyframes: [
      { time: 0, state: 'idle', x: 640, y: 500 },
      { time: 3, state: 'walking', x: 400, y: 500 },
      { time: 6, state: 'waving', x: 400, y: 500, hold: true },
    ],
  },
];

// 4. Define camera (optional pans/zooms)
const MY_SCENE_CAMERA: CameraKeyframe[] = [
  { time: 0, x: 0, y: 0, zoom: 1.0 },
  { time: 5, x: 100, y: 50, zoom: 1.2 },
];

// 5. Define audio cues (procedural WebAudio synthesis)
const MY_SCENE_AUDIO: AudioNoteCue[] = [
  { time: 0.5, freq: 620, duration: 0.25, kind: 'crayon_scribble' },
  { time: 3.0, freq: 440, duration: 0.5, kind: 'chime' },
];

// 6. Export the SceneDefinition
export const MY_SCENE: SceneDefinition = {
  id: 'my_scene',
  title: 'My New Scene',
  subtitle: 'A delightful crayon storybook animation',
  durationSec: 20,
  width: TOKENS.canvas.width,     // 1280
  height: TOKENS.canvas.height,   // 720
  fps: TOKENS.timing.fps,         // 6
  vibrantMode: false,
  bookFrame: {
    enabled: true,
    coverTitle: 'My New Scene',
    coverSubtitle: 'A delightful crayon storybook animation',
    creditText: 'Illustrated in Crayon & Pastel',
    endingTitle: 'The End ★',
    endingCredit: 'My New Scene · Thank You for Watching',
    coverMaterial: 'crayonTerracotta',
    openDurationSec: 3.5,
    closeDurationSec: 3.5,
  },
  acts: MY_SCENE_ACTS,
  nodes: MY_SCENE_NODES,
  timeline: MY_SCENE_TIMELINE,
  camera: MY_SCENE_CAMERA,
  audioCues: MY_SCENE_AUDIO,
};
```

### Step 2: Register in SCENE_REGISTRY

Edit `<workspace>/src/ui/app.ts`:

```typescript
import { MY_SCENE } from '../scenes/myScene';

// Add to SCENE_REGISTRY (extend ShortSampleId type if adding new keys)
export const SCENE_REGISTRY: Record<ShortSampleId, SceneDefinition> = {
  '1': SHORT_SAMPLE_1_SCENE,
  '2': MOONLIGHT_STORY_SCENE,
  '3': MEADOW_PARTY_SCENE,
  '4': MY_SCENE,                // new scene at ?short_sample=4
};
```

Or add a named alias to `FOOTAGE_ALIASES` if you want `?footage=<alias>` to loop specific acts.

### Step 3: Build & verify

```bash
cd <workspace>
agy-node scripts/studio-cli.mjs typecheck   # strict TypeScript compilation (tsc --noEmit)
agy-node scripts/studio-cli.mjs test        # unit & integration tests
agy-node scripts/studio-cli.mjs build       # production build into dist/
agy-node scripts/studio-cli.mjs dev         # start dev server → http://localhost:5173?short_sample=4
```

---

## 5. Editing Existing Scenes

### 5.1 Adding or modifying acts (`StoryAct`)

Each act defines a named chapter with a time range. Acts are referenced by `?footage=<act-id>` for single-act looping.

```typescript
{
  id: 'new-act',
  title: 'Act V · The Epilogue',
  startTime: 24,
  endTime: 30,
  caption: 'The sun sets and everyone waves goodbye.',
}
```

- Ensure acts cover the full `durationSec` without gaps.
- Update `durationSec` on the `SceneDefinition` if extending the scene.

### 5.2 Retiming or inserting keyframes (`TimelineTrack` & `NodeKeyframe`)

Keyframe `time` values are in seconds. The engine quantizes them to the 6 FPS stepped clock automatically.

```typescript
{
  nodeId: 'my-character',
  keyframes: [
    { time: 0, state: 'idle', x: 640, y: 500 },
    // INSERT: character walks left between t=2s and t=5s
    { time: 2, state: 'walking', x: 640, y: 500 },
    { time: 5, state: 'walking', x: 300, y: 500 },
    { time: 5.5, state: 'waving', x: 300, y: 500, hold: true },
  ],
}
```

**Key rules:**
- Keyframes are sorted by `time` ascending.
- Between keyframes, numeric values (`x`, `y`, `scale`, `rotate`, `opacity`, `fillProgress`) are interpolated linearly then quantized to 6 FPS steps.
- `hold: true` on a keyframe means "hold this value until the next keyframe" (no interpolation — stepped hold).
- `state` is applied as a step function at or after the keyframe time.
- `visible`, `flipX`, `windowLit`, `wearingNightcap`, `holdingSheep`, `lit` are stepped (no interpolation).

> [!IMPORTANT]
> **Mandatory `+X` Forward Walking & Facing Convention**:
> - Every character rig faces **RIGHT (`+X`)** when `flipX: false` and **LEFT (`-X`)** when `flipX: true`.
> - **Walking Right (`next.x > prev.x`)**: Set `state: 'walking'` and `flipX: false` so the character's 3/4 walking profile, chest, eyes, and shoes face right (`+X`).
> - **Walking Left (`next.x < prev.x`)**: Set `state: 'walking'` and `flipX: true` so the character faces left (`-X`). (The engine's `evaluateSingleNode` in `src/engine/timeline.ts` also automatically enforces `flipX = next.x < prev.x` during horizontal `'walking'` segments so a character can never walk backwards!)
> - **Dialogue Facing**: When two characters talk to each other, set `flipX: false` on the character on the left (facing right) and `flipX: true` on the character on the right if they have a directional profile.

### 5.3 Changing character states

Set `state` in keyframes to trigger pose changes:

```typescript
// Available states:
// idle | walking | climbing | sitting | singing | waving |
// looking_up | awake | sleepy | curious | grumpy | blinking | sleeping
{ time: 3.0, state: 'singing' },
{ time: 8.0, state: 'blinking', hold: true },
{ time: 8.5, state: 'waving', hold: true },
```

### 5.4 Adding camera cuts, pans & zooms (`CameraKeyframe`)

```typescript
camera: [
  { time: 0, x: 0, y: 0, zoom: 1.0 },           // full scene view
  { time: 5, x: 0, y: 0, zoom: 1.0 },            // hold (cut point)
  { time: 6, x: 100, y: 150, zoom: 1.4 },         // zoom into center-right
  { time: 10, x: 100, y: 150, zoom: 1.4, hold: true }, // hold zoom
  { time: 11, x: 0, y: 0, zoom: 1.0 },            // zoom out to full scene
],
```

- `x`, `y`: Camera pan offset in canvas coordinates.
- `zoom`: Zoom factor (1.0 = no zoom, >1 = zoom in).
- `hold: true`: Step-hold — no interpolation until next keyframe (creates a "cut").
- All values are stepped to 6 FPS during evaluation.

### 5.5 Adding character-attached speech/thought bubbles (`speechText` & `speechStyle`) & pencil annotations (`AnnotationNode`)

> [!IMPORTANT]
> **Always use `speechText` and `speechStyle` directly on the speaking character (`CharacterNode` or `NodeKeyframe`)** for character dialogue and thoughts! Every character has a predefined head-top anchor (`CHARACTER_SPEECH_ANCHORS` in `src/assets/characters/index.ts`), so the engine automatically renders the bubble with its tail tip or thought puffs pointing directly above that character's head, tracks the character as they walk, never flips text backwards when `flipX: true`, and renders above all buildings/props.

```typescript
// Recommended: Character-attached speech & thought bubbles on a character timeline track:
{
  nodeId: 'little-girl',
  keyframes: [
    // Walking while speaking — bubble automatically follows the Little Girl's head!
    {
      time: 3.5,
      x: 265, y: 642,
      state: 'walking',
      speechText: "Let's get pizza, Kitty! ★",
      speechStyle: 'speech',
    },
    // Clear the bubble by setting speechText: ''
    { time: 7.0, x: 815, y: 642, state: 'idle', speechText: '', hold: true },
    // Ordering at the store
    {
      time: 9.5,
      x: 815, y: 642,
      state: 'waving',
      speechText: 'One cheesy slice, please!',
      speechStyle: 'speech',
      hold: true,
    },
    { time: 11.8, x: 815, y: 642, state: 'looking_up', speechText: '', hold: true },
    // Thinking "Yum!!" with a scalloped cloud thought bubble while holding pizza
    {
      time: 14.2,
      x: 815, y: 642,
      state: 'waving',
      holdingPizza: true,
      speechText: 'Yum!! So cheesy! ★',
      speechStyle: 'thought',
      hold: true,
    },
    { time: 19.5, x: 815, y: 642, state: 'idle', holdingPizza: false, speechText: '', hold: true },
  ],
},

// Plain hand-lettered text annotation (for scene titles/captions not attached to a character):
{
  id: 'sound-effect-text',
  type: 'annotation',
  zIndex: 35,
  x: 400, y: 200,
  text: 'Goodnight, Little Village ★',
  color: TOKENS.colors.charcoalOutline,
  fontSize: 24,
  visible: false,  // animate visibility via timeline
},
// Or a dashed motion path:
{
  id: 'motion-trail',
  type: 'annotation',
  zIndex: 30,
  x: 0, y: 0,
  dashedPath: 'M 200 400 C 300 380, 400 360, 500 400',
  color: TOKENS.colors.faintPencil,
},
```

### 5.6 Syncing audio (`audioCues` & `audioClips`) & Mandatory `docs/AUDIO_CATALOG.md` Check

> [!IMPORTANT]
> **Mandatory Scene Audio Planning & Modular Per-SFX Rule**:
> 1. When planning or creating a new scene, **ALWAYS** inspect `<workspace>/docs/AUDIO_CATALOG.md` (and `skills/picture-book-audio/references/audio-catalog.md`) first to see what existing background music (`audioClips`) and procedural/WAV sound effects fit the story theme, and identify what new theme-appropriate BGM/SFX must be created.
> 2. When new sound effects are needed, load `skills/picture-book-audio/SKILL.md` and spin up **isolated subagent(s)** so that **every sound effect lives in its own standalone modular file** (`src/audio/sfx/<sfxName>.ts` for procedural WebAudio synthesizers and/or `scripts/sfx/<clipName>.mjs` generating `public/audio/<clip-name>.wav`).
> 3. Register every new sound effect's description and fitting story themes in `<workspace>/docs/AUDIO_CATALOG.md` and `skills/picture-book-audio/references/audio-catalog.md`.

Scenes support both procedural WebAudio synthesis (`audioCues`) and external/generated audio file clips (`audioClips`, e.g., TTS narration or WAV/MP3 soundtracks placed in `<workspace>/public/audio/`):

```typescript
audioCues: [
  // Available AudioCueKind values (modularly defined in src/audio/sfx/*.ts):
  // lullaby | crayon_scribble | chime | party_horn | confetti_pop |
  // cheer_applause | candle_blow | giggle | birthday_song |
  // ocean_wave | water_splash | floatie_squeak |
  // fire_crackle | dragon_fire | spear_clink | medieval_lute

  { time: 0.5, freq: 620, duration: 0.25, kind: 'crayon_scribble' },
  { time: 3.0, freq: 440, duration: 0.4, kind: 'chime' },
  { time: 6.2, freq: 392, duration: 0.32, kind: 'birthday_song' },
  { time: 18.0, freq: 523, duration: 0.55, kind: 'confetti_pop' },
],
audioClips: [
  {
    id: 'act-1-narration',
    src: '/audio/act1_narration.mp3',
    startTime: 0.5,
    volume: 1.0,
    label: 'Act I Narration',
  },
],
```

- `audioCues`: `time` (seconds, quantized to 6 FPS), `freq` (Hz), `duration` (seconds), `kind` (`AudioCueKind`).
- `audioClips`: `src` (`'/audio/<filename>'`), `startTime` (seconds), optional `duration`, `offsetSec`, `volume` (`0.0–2.0`), `label`. Automatically mixed into WebCodecs MP4 exports via `renderOfflineAudio()`.

---

## 6. zIndex Layering Guidelines

Use consistent `zIndex` ranges to maintain the correct visual stack:

| zIndex range | Layer |
|---|---|
| 1–3 | Background patches (sky, ground base) |
| 4–5 | Ground detail patches, horizon contours |
| 6–9 | Sun/moon, clouds, flowers, background props |
| 10–15 | Back-row characters, background buildings |
| 16–19 | Mid-row characters |
| 20–29 | Center-stage characters, main buildings, front-row characters, birthday cake |
| 30–34 | Floating props (music notes, confetti, chimney puffs) |
| 35–40 | Annotations, banners, text overlays |

---

## 7. Development Principles

> [!WARNING]
> When writing or modifying engine code, you **MUST** follow `picture-book-agent-coder` development principles or delegate to `picture-book-agent-coder` / `picture-book-coder`.

### Mandatory practices:
1. **Living Documentation** — Update `docs/ARCHITECTURE.md` whenever files/APIs change.
2. **Atomic Git Commits (`scripts/vcs.mjs`)** — Check `agy-node scripts/vcs.mjs check` (uses native `git` if installed or bundled `isomorphic-git` if not), initialize with `agy-node scripts/vcs.mjs init` if needed, and commit after each completed phase/sub-task via `agy-node scripts/vcs.mjs commit -m "<message>"`.
3. **Hierarchical Planning** — Break large tasks into macro phases → micro sub-plans → incremental execution.
4. **Code Reuse (DRY)** — Consult existing codebase before writing new utilities. Extend shared primitives from `svgUtils.ts`, `filters.ts`, `clock.ts`.
5. **Centralized Tokens** — Never scatter magic numbers. Always import from `TOKENS`.
6. **Strict TypeScript** — All code must compile under `strict: true`. Run `agy-node scripts/studio-cli.mjs typecheck` and `agy-node scripts/studio-cli.mjs build` to verify.
7. **Testing** — Run `agy-node scripts/studio-cli.mjs test` for unit/integration tests. Visually verify in browser.

### Dev server
```bash
cd <workspace>
agy-node scripts/studio-cli.mjs dev    # → http://localhost:5173
```

URL parameters for testing: `?short_sample=1|2|3|birthday`, `?scene=<sceneId>`, `?footage=<actId>`, `?autoplay=1`, `?vibrant=1|0`, `?book_frame=1|0`, `?t=<seconds>`.

---

## 8. Reference

- **Full asset catalog & TypeScript schema**: [references/catalog-and-schema.md](references/catalog-and-schema.md)
- **Architecture docs**: `<workspace>/docs/ARCHITECTURE.md`
- **Style guide & palette**: `<workspace>/docs/STYLE_GUIDE.md`
- **Schema types**: `<workspace>/src/engine/schema.ts`
- **Design tokens**: `<workspace>/src/theme/tokens.ts`
- **Example scene (vibrant birthday party)**: `<workspace>/src/scenes/meadowParty.ts`
- **Example scene (night story)**: `<workspace>/src/scenes/moonlightStory.ts`
- **Example scene (morning/sunset)**: `<workspace>/src/scenes/shortSample1.ts`

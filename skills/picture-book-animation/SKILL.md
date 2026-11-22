---
name: picture-book-animation
description: "How to create, edit, and style animations, scenes, acts, timelines, camera choreography, audio cues, and visual styling in the Picture-Book Crayon Video Engine. Activate whenever deciding how to make or edit animations, scenes, acts, timelines, camera choreography, or visual styling."
---

# Picture-Book Animation & Scene Authoring Skill

This skill is the authoritative guide for creating and editing animated storybook scenes in the **Picture-Book Crayon Video Engine** (`<workspace>`, scaffolded from `<plugin-root>/engine/`).

> [!IMPORTANT]
> - If the user's prompt is brief or lacks story/dialogue detail, load **`skills/picture-book-script/SKILL.md`** first to create the Production Script Blueprint.
> - For the complete catalog of all **19 characters, 4 buildings, 22 props, 21+ crayon fill patterns**, full TypeScript interfaces, `TOKENS` color palette, and `SCENE_REGISTRY` routing — see [references/catalog-and-schema.md](references/catalog-and-schema.md).

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

### Story Continuity, Scene Transitions, Pacing & Proportional Scale
Every multi-act or multi-location storybook animation **MUST** follow these continuity, staging, and proportion rules:

1. **Location-Driven Background Changes**:
   - Whenever consecutive scenes/acts take place in **different locations** (e.g., castle courtyard → dark forest, cottage interior → village street, road → dragon's lair, beach → meadow), **visibly change the background** to signal the location change.
   - Update both **Tier 1 `background_patch` layers** (sky/ground/floor/wall palette & horizon silhouette) and **Tier 2 set dressing** (`building` / `prop` landmarks) rather than reusing the same static backdrop across different places.
2. **Brisk Scene Transitions When All Characters Leave**:
   - As soon as all active characters exit a scene (walk/ride/fly off-canvas past `x < -120` / `x > 1400`, or enter a doorway and turn `visible: false`), transition to the next scene/act **quickly** (within `~0.3–1.0s`).
   - Avoid leaving `2–5+` seconds of empty-stage dead air after the cast has already left unless there is an intentional environmental beat or punchline.
3. **Chronological Day/Night Cycle Continuity**:
   - Maintain a continuous, physically logical forward time-of-day progression across the story:
     `Dawn / Morning` → `Midday / Afternoon` → `Golden Hour / Sunset / Dusk` → `Twilight / Night` → *(next day)* `Dawn / Morning`.
   - **Never** jump backwards or erratically out of sequence (for example, never jump `Night → Midday → Morning`, or `Sunset → Morning` with no intervening night/sleep beat) unless explicitly framed as a deliberate flashback or dream sequence.
   - Keep sky `background_patch` materials (`crayonSkyBlue` → `crayonSunsetOrange` → `markerIndigoNight`), celestial characters (`sun`, `moon`, `star_cluster`), and warm lights (`windowLit`, `street_lantern`, `campfire`) strictly synchronized with the current time of day.
4. **In-Scene Object, Prop & Companion Permanence (No Vanishing Items)**:
   - Items, props, furniture, vehicles, and animal companions present in a scene must **never** abruptly disappear into thin air (`visible: false` in a single frame) while remaining in the same scene.
   - **Example (Dismounting a Horse)**: When a character gets off a horse (`mounted: true` → `mounted: false`), the horse must **not** vanish! Either keep a standalone horse visible in the scene (tethered/standing nearby) or animate the horse walking/trotting naturally off-screen before hiding it.
   - Apply the same rule to all props: placed items remain visible where put until carried off, consumed naturally, or the scene cuts to a new location.
5. **Believable Character-to-Scene Scale & Proportions**:
   - Always check every asset's rendered size (`local SVG dimensions × node.scale`) against characters standing on the same depth plane (`y`), keeping relative sizes consistent across acts:

| Element Type | Proportional Target (vs. Standard `~95–105px` Standing Character at `scale: 1.0`) | Common Mistake to Avoid |
| :--- | :--- | :--- |
| **Tables / Desks / Counters** | Waist-to-chest height (`~40–65%` of character height, ~`42–65px` tall). | Making a table taller than a standing character. |
| **Chairs / Benches / Logs** | Knee-to-hip height (`~25–45%` of character height, ~`26–45px` tall). | Giant chairs towering over characters or microscopic stools. |
| **Full-Sized Cars / Carriages / Buses** | Clearly **wider/longer than a standing character's height** (`~1.8×–2.8×` character height wide, ~`190–280px+`), roof near or slightly below adult head height. | Drawing a full-sized car narrower than a standing person's length/height. |
| **Bicycles** | Hip-to-chest height (`~55–75%` of rider height), proportionate to stride. | Toy-sized bikes under adults or huge bikes taller than riders. |
| **Buildings & Doorways** | Doors taller and wider than characters walking through them; cottages/shops `~2.0×–3.5×` character height (`210–340px`); castles/trees larger still. | Characters taller than a cottage doorway or roof. |
| **Pets, Mounts & Handheld Items** | Small pets (`cat` ~`44px`) `~30–45%` of human height; horses sized to carry riders comfortably; cups/food/books sized to fit hands. | Giant handheld items dwarfing the character's torso or tiny ponies smaller than a rider's boot. |
| **Stage / Canvas Framing (`1280×720`)** | Typical standing characters render at `~15–30%` of the `720px` frame height (`~105–215px` rendered height) in wide/medium shots; scale larger only for intentional close-ups. | Oversized characters clipping the top of the frame or microscopic characters lost on an empty stage. |

6. **Speaking Mouth Animation & Voiceover Scene-Cut Alignment**:
   - Whenever a scene includes spoken voiceovers, animate the speaking character's **mouth area** at stepped `6 FPS` during their exact spoken time window (and close it when silent), let every voice finish completely before switching acts unless intentionally cutting someone off, stop voices cleanly at or before any character/scene change, and never overlap multiple speakers unless purposefully scripted (see `skills/picture-book-voiceover/SKILL.md`).

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
>
> **Keep Text Bubbles Concise (`~20–30` characters soft guideline):** Aim to keep each individual speech or thought bubble around `20–30` characters (soft guideline, not a hard cutoff) so bubbles stay compact, legible, and don't stretch too wide or clip near canvas edges. For longer dialogue or thoughts, split them cleanly across consecutive timed keyframes.

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
- **Dynamic BGM Pacing Across Acts**: Adapt background music tempo, rhythm, and mood across story sections (e.g., faster, more energetic rhythm during action/battle parts vs. calmer, softer ducked music `volume: 0.20–0.35` during dialogue or bedtime parts), either via a multi-section BGM score or cleanly capped per-act BGM `audioClips`.
- **Voiceover Scene-Boundary, Mouth-Sync & Non-Overlap Discipline**: Let every spoken line complete before scene/act changes unless an intentional cut-off is scripted; always end a character's voice at or before any character/scene change (cap `AudioClipCue.duration` and clear `speechText: ''` so voice audio never bleeds across cuts); animate the speaking character's mouth area at `6 FPS` while they talk; and never overlap multiple characters' voices unless specifically intended.

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

## 7. Engineering & Parallel Execution Standards

- **Side-by-Side Parallel Production**: When building a new scene that also needs custom assets, SFX/BGM, or voiceovers, author `src/scenes/<sceneName>.ts` **in parallel alongside** isolated write-enabled asset, SFX, and voiceover subagents (via `define_subagent(..., EnableWriteTools: true)` or `self`) using the agreed IDs/paths from the script blueprint. Keep shared registries (`src/ui/app.ts`, `src/engine/schema.ts`, `docs/ARCHITECTURE.md`) for the single post-parallel integration pass — reconciling returned `local SVG bounds × node.scale` for every new character/prop/building and plugging measured WAV durations into the scene timeline once the workers return.
- **Hierarchical Planning**: For large engine/feature refactors, decompose work into macro phases → pre-phase micro sub-plans saved in `docs/plans/` and indexed in `docs/PLANS.md` (for video creation, use the `picture-book-script` Blueprint).
- **Mandatory Engineering Practices & Visual Verification**: Import all visual/timing constants from `TOKENS` (`src/theme/tokens.ts`); reuse shared primitives (`svgUtils.ts`, `filters.ts`, `clock.ts`); compile under `strict: true` (`typecheck`, `test`, `build`); visually verify scenes in the browser (`studio-cli.mjs dev` at key `?scene=<sceneId>&t=<sec>` timestamps) to confirm crayon/paper aesthetics, proportions, speech bubbles, and walking/mouth rigs; update `docs/ARCHITECTURE.md`; and commit atomically via `agy-node scripts/vcs.mjs commit -m "..."`.

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

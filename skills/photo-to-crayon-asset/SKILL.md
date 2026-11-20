---
name: photo-to-crayon-asset
description: "Workflow for turning user-supplied photos or reference images into hand-crafted 2D cutout SVG TypeScript assets for the Picture-Book Crayon Video Engine. Activate whenever the user provides photos/images or wants custom characters, props, or buildings modeled after reference images."
---

# Photo-to-Crayon Asset Pipeline

This skill provides a step-by-step workflow for turning a user-supplied **photo** (or an AI-generated reference image via `image-generator`) into a **hand-crafted 2D cutout SVG TypeScript asset** that renders inside the Picture-Book Crayon Video Engine at `<workspace>/src/assets/`.

> [!IMPORTANT]
> The engine has **no automated photo import pipeline**. All assets are hand-coded TypeScript functions that return SVG strings. The photo serves as a **visual reference only** — the agent must interpret and re-create the subject in the engine's wax crayon / oil pastel / felt-tip marker aesthetic.

---

## Step 1: Visual Inspection & Palette Mapping

### 1a. Visually inspect the photo

Use `read_file` to view the user's photo and note:
- Overall subject shape and silhouette
- Key body parts / structural segments to decompose into SVG shapes
- Facial features, expressions, accessories
- Dominant colors and where they appear

### 1b. Run the automated analysis script

Run the zero-dependency helper script via `agy-node` to extract objective color data and map it to official TOKENS palette colors:

```bash
agy-node "<plugin-root>/skills/photo-to-crayon-asset/scripts/analyze_reference_photo.mjs" "<path_to_photo>"
```

The script outputs a structured report with:
- **Dimensions & aspect ratio** (width, height, ratio)
- **Dominant color clusters** extracted from 4 image regions (top third, middle third, bottom third, overall)
- **Automatic mapping** of each cluster to the nearest official `TOKENS` hex color and recommended crayon fill pattern (`crayon-hatch-*`, `crayon-polka-*`, `crayon-stripe-*`)
- **RGB distance** to the mapped TOKENS color (lower = closer match)

### 1c. Build the color plan

From the script output and your visual inspection, decide:
1. Which `TOKENS.colors.*` value to use for each body region
2. Which `TOKENS.patterns.*` crayon fill pattern to apply
3. Where to place charcoal outlines (`TOKENS.colors.charcoalOutline` = `#2B231D`)
4. Where to add rosy/ochre accents (cheeks, blush, warm highlights)
5. Paper-white eye fill with expressive pupils

---

## Step 2: SVG Cutout Decomposition

Break the subject from the photo into **layered storybook cutout shapes** using the engine's SVG utility functions from `<workspace>/src/engine/svgUtils.ts`:

### Available SVG shape builders

| Function | Import | Usage |
|---|---|---|
| `crayonPath(d, fill, options?)` | `svgUtils.ts` | Arbitrary SVG path with textured fill and charcoal outline; supports `mask` for progressive fill |
| `svgEl('polygon', { points, fill, ... })` | `svgUtils.ts` | Polygon from point list |
| `svgEl('circle', { cx, cy, r, fill, ... })` | `svgUtils.ts` | Circle |
| `svgEl('ellipse', { cx, cy, rx, ry, fill, ... })` | `svgUtils.ts` | Ellipse |
| `svgEl('rect', { x, y, width, height, rx?, fill, ... })` | `svgUtils.ts` | Rectangle with optional rounded corners |

### Mandatory styling on all shapes

```typescript
import { TOKENS, svgUrl } from '../theme/tokens';
import { svgEl, crayonPath, crayonStrokeAttrs, svgTransform } from '../../engine/svgUtils';

// All filled shapes MUST have:
// 1. Crayon filter on the container group:
//    filter="url(#crayon-stroke)"
// 2. Charcoal outline:
//    stroke={TOKENS.colors.charcoalOutline}  (#2B231D)
//    stroke-width={TOKENS.strokes.outlineMedium}  (2.6)
// 3. Textured pattern fill (from TOKENS.patterns) or direct TOKENS.colors.*
// 4. Paper-white eyes: fill={TOKENS.colors.paperWarm} with small black pupils
// 5. Rosy/ochre accents for cheeks and warm highlights
```

### Decomposition approach

1. **Body base** — One or two main `crayonPath` shapes defining the overall silhouette
2. **Internal details** — Overlapping shapes for clothing, patterns, markings (using different TOKENS colors)
3. **Face** — Paper-white eye ovals with offset black pupils (for expression), small curved mouth, rosy cheek circles
4. **Accessories** — Party hats, crowns, held objects as separate `svgEl` shapes
5. **Limbs / appendages** — Simple stub arms/legs or leaf fronds as small `crayonPath` shapes (follow the `+X` Forward Rule in Step 3)

> [!TIP]
> Study existing character files like `src/assets/characters/singingRadish.ts` or `birthdayStrawberry.ts` for the exact pattern to follow.

---

## Step 3: Multi-State Rigging

Implement **state-driven pose variations** so the photo-modeled asset animates with stop-motion charm. The render function receives `state: CharacterState` and `frameIndex: number` (the line-boil seed, 1–6).

### Required function signature

```typescript
import type { CharacterRenderOptions } from './types';

export function renderMyAsset(options: CharacterRenderOptions): string {
  const { state = 'idle', frameIndex = 1 } = options;
  // Use frameIndex for line-boil jitter (deterministicJitter)
  // Switch on state for pose variations
  // ...
  return svgContent;
}
```

### State implementation guidelines

| State | Visual behavior |
|---|---|
| `idle` | Default standing pose, subtle vertical bob via `deterministicJitter(0, frameIndex, 1.5)` |
| `walking` | Alternating slight arm/leg tilt per frame, horizontal sway |
| `waving` | One arm raised and oscillating ±8° via `steppedOscillate` |
| `singing` | Open mouth shape, slight head tilt, music-note accessories |
| `sitting` | Lowered base, legs folded or hidden |
| `blinking` | Eyes closed (thin horizontal line) on specific `frameIndex` values |
| `sleeping` | Eyes as curved sleeping arcs, optional `zzz` annotation |
| `looking_up` | Pupils shifted upward, slight head tilt back |
| `curious` | Wide eyes, head tilt ±5° |
| `grumpy` | Downturned mouth, angled brows |
| `sleepy` | Half-closed eyelids, drooped posture |
| `awake` | Wide eyes, alert posture |
| `climbing` | Arms reaching up, body tilted |

Not every character needs every state. Implement at minimum: `idle`, `waving`, `blinking`, and 2–3 more that suit the character.

### Line-boil integration

Use `deterministicJitter(index, frameIndex, amplitude)` from `svgUtils.ts` to add per-frame hand-drawn wobble to key vertices. This creates the "boiling line" stop-motion effect at 6 FPS.

```typescript
import { deterministicJitter } from '../../engine/svgUtils';

const wobbleX = deterministicJitter(0, frameIndex, 1.2);
const wobbleY = deterministicJitter(1, frameIndex, 0.8);
```

### Mandatory Facing & Walking Direction Convention (`+X` Forward Rule)

Every character model in `src/assets/characters/` **MUST** obey the canonical **`+X` Forward Rule** so characters never look like they are walking backwards or sideways:
1. **Canonical Forward Direction (`flipX: false` = Facing Right `+X`)**:
   - When `flipX: false` (default), a character's forward walking/facing direction is **RIGHT (`+X`)**.
   - When `flipX: true`, the engine mirrors the character horizontally (`scale(-1, 1)`) so they face and walk **LEFT (`-X`)**.
2. **Dedicated 3/4 or Side-Profile Walk Cycle (`state === 'walking'`)**:
   - **NEVER** reuse a flat symmetric front-facing pose with sideways-scissoring legs for `state === 'walking'`.
   - In `state === 'walking'`, render a dedicated **3/4 or side-profile walking rig facing RIGHT (`+X`)** (see `src/assets/characters/littleGirl.ts` and `src/assets/characters/cat.ts` for reference):
     - Both legs (`left-leg` and `right-leg`) pivot from the hip center (`pivotX ≈ 0`) and stride forward/backward along the X axis (`rotate: -walkSwing` and `rotate: walkSwing`).
     - **Both shoes/feet/paws MUST point forward toward `+X` (right)** (heel on the left `x < 0`, rounded toe cap extending right `x > 0`). Never draw a shoe pointing left (`-X`) when `flipX: false`!
     - Shift the chest motif (e.g., sweater star), eyes, nose tick, mouth, and hair volume into a 3/4 right-facing profile (`data-facing="right"`, `data-walk-profile="true"`), with the back arm swinging behind the torso and the front arm swinging in front.

### Predefined Speech & Thought Bubble Anchor (`CHARACTER_SPEECH_ANCHORS` — Mandatory for Every Character)

Every character model in `src/assets/characters/` **MUST** define a predefined local head-top anchor `(x, y)` (relative to the character's ground-feet origin `(0, 0)`) in `CHARACTER_SPEECH_ANCHORS` inside `src/assets/characters/index.ts`, modeled after our built-in characters (`little_girl: { x: 0, y: -102 }`, `shopkeeper: { x: 0, y: -105 }`, `cat: { x: 10, y: -44 }`, etc.).
- This allows any scene to set `speechText` and `speechStyle: 'speech' | 'thought'` (plus optional `speechTail: 'bottom-center' | 'bottom-left' | 'bottom-right'`) directly on the character's `CharacterNode` or `NodeKeyframe` (`speechText: ''` to clear), and the engine automatically anchors the speech tail tip or lowest thought puff directly above that character's head without manual coordinate guessing!

### Animated Speaking Mouth Rigging (Mandatory for Voiced Characters)

Whenever designing or modifying a character that will have spoken voiceovers:
- **Never leave the mouth area static/frozen while the character speaks.**
- Build stepped `6 FPS` mouth variations driven by `frameIndex` (e.g., cycling closed smile / half-open oval / open D-mouth across `frameIndex % 2` or `frameIndex % 3`) whenever the character is speaking/singing, and return to a calm closed mouth when silent.
- Support mouth animation in whatever poses the character talks in (standing, walking, sitting, riding) — not only in `'singing'` — so scene timelines can synchronize visible mouth movement tightly to the character's voiceover `[startTime, startTime + duration]` window.

### Proportional Local SVG Sizing & Object Permanence

Design every custom character, prop, vehicle, mount, and building around the engine's standard character height baseline (**`~95–105px` tall at `scale: 1.0`**, origin `(0, 0)` at ground contact) so sizes make immediate visual sense together:
- **Furniture**: Standard tables/desks/counters should be `~42–65px` tall (waist-to-chest height of a `~100px` character — **never taller than a standing character**); chairs/benches/logs `~26–45px` tall.
- **Vehicles**: Full-sized cars/vans/carriages should be **`~190–280px+` wide** (clearly wider than a standing character's full height/length) and `~85–110px` tall so a character plausibly fits inside.
- **Buildings & Doorways**: Doorways must exceed character height (`>= 110px` tall); cottages/shops typically span `~210–340px` tall.
- **Pets, Mounts & Detachable Companions**: Size pets (`~40–50px`) and handheld items proportionally to human characters. When building a mountable creature or vehicle (e.g., a horse, bicycle, car) that a character dismounts/exits mid-scene, ensure a standalone prop or separate node exists so the horse/vehicle remains visible or can walk/roll off-screen naturally instead of disappearing!

---

## Step 4: Registration Checklist

After creating the asset file, follow these steps to wire it into the engine:

### 4.1 Create the asset file

Place in the appropriate directory:
- **Characters**: `<workspace>/src/assets/characters/<assetName>.ts`
- **Props**: `<workspace>/src/assets/props/<assetName>.ts`
- **Buildings**: `<workspace>/src/assets/buildings/<assetName>.ts`

### 4.2 Add kind literal to schema

Edit `<workspace>/src/engine/schema.ts` to add the new kind to the appropriate union type:

```typescript
// For a new character:
export type CharacterKind =
  | 'little_girl'
  | 'shopkeeper'
  // ... existing kinds ...
  | 'my_new_character';   // ← add here

// For a new prop:
export type PropKind =
  | 'tree'
  // ... existing kinds ...
  | 'my_new_prop';         // ← add here

// For a new building:
export type BuildingKind = 'ochre_cottage' | 'corner_store' | 'my_new_building';
```

### 4.3 Wire the render function into the barrel index

Edit the corresponding `index.ts` barrel file:

**Characters** — `<workspace>/src/assets/characters/index.ts`:

```typescript
// 1. Add import at top
import { renderMyAsset } from './myAsset';

// 2. Add export
export { renderMyAsset } from './myAsset';

// 3. Add predefined head-top speech/thought bubble anchor in CHARACTER_SPEECH_ANCHORS (MANDATORY!)
export const CHARACTER_SPEECH_ANCHORS: Record<
  CharacterKind,
  { x: number; y: number }
> = {
  little_girl: { x: 0, y: -102 },
  shopkeeper: { x: 0, y: -105 },
  cat: { x: 10, y: -44 },
  // ... existing characters ...
  my_new_character: { x: 0, y: -96 }, // ← exact local (x, y) right above this character's head!
};

// 4. Add floatie fit in CHARACTER_FLOATIE_FITS

// 5. Add case to renderCharacter() switch (which also automatically attaches speechText/speechStyle via CHARACTER_SPEECH_ANCHORS)
case 'my_new_character':
  inner = renderMyAsset(options);
  break;
```

**Props** — `<workspace>/src/assets/props/index.ts` (same pattern with `renderProp()`)

**Buildings** — `<workspace>/src/assets/buildings/index.ts` (same pattern with `renderBuilding()`)

### 4.4 (Optional) Add to Asset Catalog UI

To make the new asset appear in the Studio's interactive Asset Catalog grid, add an entry to `ASSET_CATALOG_ITEMS` in `<workspace>/src/ui/app.ts`:

```typescript
{
  id: 'cat-my-asset',
  title: 'My New Asset Name',
  category: 'Character',         // or 'Prop' or 'Building'
  caption: 'Brief visual description of the asset.',
  viewBox: '-60 -120 120 140',   // adjust to fit the asset's SVG bounds
  jumpToTimeSec: 0,              // time in a scene where this asset appears
  states: ['idle', 'waving', 'singing'],  // for characters
  defaultState: 'idle',
  renderInner: (frameIndex, state = 'idle') =>
    renderCharacter({ kind: 'my_new_character', state, frameIndex }),
},
```

### 4.5 Build & test

```bash
cd <workspace>
agy-node scripts/studio-cli.mjs typecheck   # strict TypeScript compilation succeeds
agy-node scripts/studio-cli.mjs test        # all unit tests pass
agy-node scripts/studio-cli.mjs build       # production build succeeds
agy-node scripts/vcs.mjs commit -m "feat(assets): add <assetName> cutout asset"
```

> [!TIP]
> **Parallel Subagent Isolation**: When creating multiple custom characters, props, or buildings alongside scene code and audio, each isolated subagent writes **only** its own asset file (`src/assets/<category>/<assetName>.ts`) and returns its export name, kind literal, `CHARACTER_SPEECH_ANCHORS` `(x, y)`, floatie fit, and local SVG bounds so the orchestrator wires `schema.ts`, `index.ts`, `app.ts`, and `docs/ARCHITECTURE.md` in one clean integration pass.

---

## Reference Files

| File | Purpose |
|---|---|
| `src/engine/schema.ts` | TypeScript interfaces & kind unions |
| `src/theme/tokens.ts` | All colors, patterns, filter IDs, timing |
| `src/engine/svgUtils.ts` | SVG string builders, jitter math |
| `src/engine/filters.ts` | SVG `<defs>` generator, pattern fills |
| `src/assets/characters/types.ts` | `CharacterRenderOptions` interface |
| `src/assets/characters/index.ts` | Character barrel + `renderCharacter()` switch |
| `src/assets/characters/singingRadish.ts` | Good example of a cutout character rig |
| `src/assets/characters/birthdayStrawberry.ts` | Good example with crown/accessories |
| `docs/STYLE_GUIDE.md` | Palette & aesthetic rules |
| `docs/ARCHITECTURE.md` | Full codebase module map |

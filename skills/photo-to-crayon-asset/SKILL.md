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
5. **Limbs / appendages** — Simple stub arms/legs or leaf fronds as small `crayonPath` shapes

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

// 3. Add case to renderCharacter() switch
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

> [!WARNING]
> These steps **must** follow `picture-book-agent-coder` development principles. If you are not `picture-book-agent-coder` or `picture-book-coder`, delegate the code changes to one of them.

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

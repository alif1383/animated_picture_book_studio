---
name: classic-cel-asset
description: "Workflow for creating 1970s–1980s Classic Hand-Drawn Cel characters, props, and buildings (from reference photos or story descriptions) in src/assets/classicCel/. Covers Disney-style silhouette decomposition, 2-tone celShadedShape shading + moonlight/warm rim highlights, Xerox charcoal outlines, celContactShadow, expressive eyes/eyelids/brows, 12 FPS smooth walk/follow-through rigging facing +X, 4-stage cel lip-sync mouths, and CLASSIC_CEL_*_RENDERERS registration."
---

# Classic Cel Asset Pipeline (`src/assets/classicCel/`)

This skill is the authoritative guide for authoring **1970s–1980s Classic Hand-Drawn Cel** characters, props, and buildings — either from a **user-supplied photo** / reference image or from a story blueprint — inside `<workspace>/src/assets/classicCel/`.

Visual target: classic Disney Xerox-era ink-and-paint cels and painted watercolor/gouache props & architecture inspired by ***Mickey's Christmas Carol* (1983)**, ***Robin Hood* (1973)**, and ***The Aristocats* (1970)**.

> [!IMPORTANT]
> - **Scope**: Use this skill ONLY for **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`)**. For **Picture-Book Crayon Style (`artStyle: 'crayon'`)**, load **`skills/photo-to-crayon-asset/SKILL.md`** instead.
> - **Zero-Collision Style Isolation**: Classic cel assets ALWAYS live inside `<workspace>/src/assets/classicCel/{characters,props,buildings}/` and register in `CLASSIC_CEL_*_RENDERERS` — they NEVER overwrite or break the Picture-Book Crayon assets in `src/assets/{characters,props,buildings}/`.

---

## Step 1: Photo / Reference Study & Classic Cel Color Ramp Design

### 1a. Visual Study (Silhouette, Appeal & Anatomy)
If the user supplied a photo or reference image, inspect it with `read_file` (and optionally run `analyze_reference_photo.mjs` for dominant hues), then translate the subject into classic **1970s–80s Disney animation appeal**:
- **Clear, readable silhouette** (expressive cheek tufts, articulated ears, curved spine/neck, distinct gesture poses).
- **Anatomical decomposition** into clean ink-and-paint parts (torso, head, muzzle, ears, limbs, tail, garments/accessories) that can overlap and bend fluidly at **12 FPS**.
- **Expressive classic Disney face**: warm cream sclera (`TOKENS.classicCel.colors.celCream`), rich colored irises (e.g., golden-amber `mochiEyeIris`), large dark pupils with crisp specular catchlights, expressive upper eyelids, and floating Xerox eyebrows.

### 1b. Build a 3-Value Cel Paint Ramp (Base + Shadow + Rim)
Unlike wax crayon fills, classic cel characters use **solid opaque matte paint** modeled with **3 distinct cel paint tones** stored in `TOKENS.classicCel.colors`:
1. **Base Cel Fill**: Warm, slightly muted 1970s Eastmancolor midtone (e.g., `mochiFurBase: '#5A78A8'`).
2. **Cel Shadow Tone**: Deeper, cooler-shifted shadow plane (`~25–35%` darker, e.g., `mochiFurShadow: '#354970'`) — applied as crisp clipped bands on undersides, tucked limbs, and away from the key light.
3. **Rim / Specular Highlight**: Cool moonlight rim (`mochiFurRim: '#A5C1E3'`) or warm lantern rim (`warmAmberGlow`) along the top-back silhouette edge facing the light source.
4. **Xerox Charcoal Ink**: `TOKENS.classicCel.colors.xeroxInk` (`#1D1815`) for primary contours (`xeroxMedium: 1.85` / `xeroxHeavy: 2.4`), `xeroxInkSoft` (`#3A312A`) for interior folds, whiskers, fur ticks, and architectural sketch lines (`xeroxFine: 1.2` / `sketchLine: 0.95`).

> [!CAUTION]
> **Forbidden in `classic_cel` assets**:
> - NEVER use `#crayon-stroke`, `TOKENS.patterns.*` wax-crayon hatches, `crayonPath`, or `crayonStrokeAttrs`.
> - NEVER use pure `#000000` or pure `#FFFFFF`.
> - NEVER leave characters flat unshaded shapes — every hero volume needs 2-tone cel shading (`celShadedShape`) and a grounded `celContactShadow`.

---

## Step 2: Classic Cel SVG Primitives (`src/engine/svgUtils.ts`)

Always import colors, strokes, and filters from `TOKENS.classicCel` (`src/theme/tokens.ts`) and build shapes using the dedicated cel helpers in `src/engine/svgUtils.ts`:

| Helper | Import | Purpose |
| :--- | :--- | :--- |
| `celShadedShape(opts)` | `svgUtils.ts` | **Primary character/hero cel builder**: emits `<clipPath>`, solid matte `baseFill`, clipped `shadowPaths` (`shadowFill`) and `highlightPaths` (`highlightFill`), topped by a clean Xerox charcoal ink outline so interior paint seams stay razor-sharp. |
| `celPath(d, fill, opts?)` | `svgUtils.ts` | Solid opaque cel-painted `<path>` with crisp Xerox charcoal ink outline (`stroke`, `strokeWidth`, `useXeroxFilter`). |
| `celStrokeAttrs(opts?)` | `svgUtils.ts` | Standard Xerox charcoal outline attributes (`xeroxInk`, `xeroxMedium`, round caps/joins). |
| `celContactShadow(cx, cy, rx, ry, opacity?)` | `svgUtils.ts` | Soft painted ground contact shadow (`data-part="cel-contact-shadow"`, fill `TOKENS.classicCel.colors.contactShadow`). |
| `gouachePath(d, fill, opts?)` | `svgUtils.ts` | Painterly watercolor/gouache background prop/architecture wash with optional `#gouache-wash` soft edge and sepia sketch stroke. |
| `svgEl`, `svgTransform`, `round2` | `svgUtils.ts` | Pure SVG element builder, transform formatter, and coordinate rounding. |
| `steppedOscillate`, `isSteppedBlinkFrame` | `clock.ts` | Smooth periodic motion and natural blinking tuned for 12 FPS. |

### Example: 2-Tone Cel-Shaded Volume (`celShadedShape`)

```typescript
import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';

const C = TOKENS.classicCel.colors;
const S = TOKENS.classicCel.strokes;

const torso = celShadedShape({
  clipId: 'cc-hero-torso-clip', // MUST be deterministic & unique per asset (prefix `cc-<asset>-...`)
  d: 'M -24 -12 C -26 -34, -8 -48, 12 -44 C 24 -40, 26 -18, 18 -4 C 6 2, -16 2, -24 -12 Z',
  baseFill: C.mochiFurBase,
  shadowFill: C.mochiFurShadow,
  shadowPaths: ['M -26 -16 C -14 -8, 6 -8, 22 -16 L 26 8 L -30 8 Z'],
  highlightFill: C.mochiFurRim,
  highlightOpacity: 0.78,
  highlightPaths: ['M -22 -26 C -14 -42, 4 -48, 18 -42 C 6 -41, -10 -34, -18 -20 Z'],
  stroke: C.xeroxInk,
  strokeWidth: S.xeroxMedium,
});
```

> [!IMPORTANT]
> **Unique Deterministic SVG IDs**: Every `<clipPath>`, `<linearGradient>`, and `<radialGradient>` emitted inside a classic cel asset MUST use a unique deterministic prefix (e.g., `cc-mochi-...`, `cc-arbor-...`, `cc-cottage-...`, optionally suffixed with `variant` or `frameIndex` if needed) so multiple nodes in one SVG never collide.

### Differentiating Characters vs. Background Props & Buildings
- **Foreground Characters (`src/assets/classicCel/characters/`)**: Crisp Xerox ink outlines (`xeroxMedium: 1.85` outer, `xeroxFine: 1.2` inner details), opaque 2-tone cel shading via `celShadedShape`, `celContactShadow` at `(0, 0)`, expressive eyes with specular catchlights, smooth 12 FPS secondary motion.
- **Background Buildings & Set Props (`src/assets/classicCel/buildings/`, `src/assets/classicCel/props/`)**: Painted watercolor/gouache aesthetic — layered tonal washes and SVG gradients (`gouachePath` / `#gouache-wash`), loose sketchy dark-sepia architectural ink lines (`xeroxInkSoft`, `sketchLine: 0.95`), warm glowing windows/lamps/fireflies with `#cel-soft-glow` optical halation, and **no heavy cartoon borders** on soft natural elements like clouds (`fluffy_cloud`) or distant foliage washes.

---

## Step 3: 12 FPS Rigging, `+X` Forward Rule & 4-Stage Cel Lip-Sync

### 1. Coordinate Origins, Bounds & Data Attributes
- **Ground-contact origin `(0, 0)`** at feet/base for standing characters, props, and buildings (center `(0, 0)` for floating celestial bodies like `moon` or `sun`).
- **Proportional Baseline**: Standard standing characters `~95–105px` tall at `scale: 1.0`, pets `~44–84px`, tables `42–65px`, doorways `>= 110px`, cottages `~210–340px`, cars `190–280px+` wide.
- **Preserve Existing Bounds When Upgrading a Built-In Kind**: If creating a classic cel counterpart for an existing `CharacterKind` / `PropKind` / `BuildingKind`, preserve its exact origin, bounding footprint, `CHARACTER_SPEECH_ANCHORS`, and required `data-*` attributes, AND include `data-art-style="classic_cel"` on the root `<g>`.

### 2. Smooth 12 FPS ("On Twos") Motion & Secondary Follow-Through
At `12 FPS`, avoid harsh random vertex jitter (`deterministicJitter` wobble). Instead drive expressive animation with smooth periodic phase curves (`steppedOscillate`, `Math.sin(frameIndex * ...)`):
- **Walk Cycle**: Articulated 4-beat or 8-beat stride with subtle vertical bob, opposing front/back arm or 4-leg swing, plus **delayed secondary follow-through** (ears dipping slightly behind the head bob, tail trailing in an S-curve wave, whiskers/ribbon/cloak lagging 1–2 frames).
- **Natural Blinking**: Use `isSteppedBlinkFrame(frameIndex, 42)` (or higher interval tuned for 12 FPS) plus half-lid expressions for `'sleepy'` / `'curious'` / `'grumpy'`.
- **Canonical `+X` Forward Rule**:
  - `flipX: false` ALWAYS faces **RIGHT (`+X`)**; `flipX: true` mirrors to face **LEFT (`-X`)**.
  - In `state === 'walking'`, ALWAYS render a dedicated 3/4 or side-profile walking rig facing `+X` with `data-facing="right"` and `data-walk-profile="true"`, with all feet/paws/shoes pointing toward `+X`.

### 3. 4-Stage Expressive Cel Lip-Sync Mouths (Mandatory for Voiced Characters)
Whenever `options.isSpeaking` is `true` OR `state === 'singing'`, render an animated cel mouth cycling through **4 expressive hand-drawn mouth shapes** tuned for 12 FPS (`const mouthPhase = Math.floor(frameIndex / 2) % 4`) with `data-speaking-mouth="true"` and `data-mouth-phase={String(mouthPhase)}`:
- **Phase `0`**: Closed warm smile / gentle lip press
- **Phase `1`**: Soft small `'o'` vowel oval (dark inner mouth `mochiMouthInner`)
- **Phase `2`**: Open animated jaw (`'ah'`) showing dark inner mouth + warm pink tongue (`mochiTongue`)
- **Phase `3`**: Half-open expressive grin / `'eh'` shape

When silent (`!options.isSpeaking && state !== 'singing'`), return cleanly to the pose's calm closed/resting mouth.

---

## Step 4: Directory Layout & Registration Checklist

### 4.1 Isolated Classic Cel Folder Structure
Place every classic cel asset inside its dedicated subfolder under `src/assets/classicCel/`:
- **Characters**: `<workspace>/src/assets/classicCel/characters/<assetName>.ts` → export `renderClassic<Name>(options: CharacterRenderOptions): string`
- **Props**: `<workspace>/src/assets/classicCel/props/<assetName>.ts` → export `renderClassic<Name>(options: PropRenderOptions): string`
- **Buildings**: `<workspace>/src/assets/classicCel/buildings/<assetName>.ts` → export `renderClassic<Name>(options: BuildingRenderOptions): string`

### 4.2 Register in the Classic Cel Dispatch Map
Wire the new renderer into the matching `classicCel/*/index.ts` dispatch table:
- `<workspace>/src/assets/classicCel/characters/index.ts` → `CLASSIC_CEL_CHARACTER_RENDERERS`
- `<workspace>/src/assets/classicCel/props/index.ts` → `CLASSIC_CEL_PROP_RENDERERS`
- `<workspace>/src/assets/classicCel/buildings/index.ts` → `CLASSIC_CEL_BUILDING_RENDERERS`

```typescript
// Example: src/assets/classicCel/characters/index.ts
import type { CharacterKind } from '../../../engine/schema';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderClassicMyHero } from './myHero';

export { renderClassicMyHero } from './myHero';

export const CLASSIC_CEL_CHARACTER_RENDERERS: Partial<
  Record<CharacterKind, (options: CharacterRenderOptions) => string>
> = {
  // ...existing classic cel characters...
  my_hero: renderClassicMyHero,
};
```

### 4.3 If Introducing a Brand-New Kind Literal (Not Already in `schema.ts`)
1. Add the new kind literal to `CharacterKind`, `PropKind`, or `BuildingKind` in `<workspace>/src/engine/schema.ts`.
2. For a new `CharacterKind`, also register its local head-top speech bubble anchor in `CHARACTER_SPEECH_ANCHORS` (and floatie fit in `CHARACTER_FLOATIE_FITS`) inside `<workspace>/src/assets/characters/index.ts`, plus a clean fallback case in `renderCharacter()` (or `renderProp()` / `renderBuilding()`).
3. Because `src/assets/{characters,props,buildings}/index.ts` checks `options.artStyle === 'classic_cel'` and dispatches to `CLASSIC_CEL_*_RENDERERS[kind]` first, any scene with `artStyle: 'classic_cel'` automatically renders your classic cel asset!

### 4.4 Parallel Subagent Isolation & Verification
When building multiple classic cel assets in parallel:
- Each worker edits **ONLY** its own isolated file(s) in `src/assets/classicCel/<category>/<name>.ts` and returns its export name, kind literal, local SVG bounds `(xMin..xMax, yMin..yMax)`, `CHARACTER_SPEECH_ANCHORS` `(x, y)`, and `data-*` parts.
- The orchestrator wires `src/assets/classicCel/*/index.ts`, `src/engine/schema.ts`, `src/assets/*/index.ts`, and `docs/ARCHITECTURE.md` in one clean integration pass.
- Verify with:
```bash
cd <workspace>
agy-node scripts/studio-cli.mjs typecheck
agy-node scripts/studio-cli.mjs test
agy-node scripts/studio-cli.mjs build
```

---

## Reference Files

| File | Purpose |
| :--- | :--- |
| `src/theme/tokens.ts` | `TOKENS.classicCel` colors, Xerox strokes, 12 FPS timing, filter IDs |
| `src/engine/svgUtils.ts` | `celShadedShape`, `celPath`, `celStrokeAttrs`, `celContactShadow`, `gouachePath` |
| `src/assets/classicCel/characters/moonlitCat.ts` | Reference classic cel character (2-tone fur, rim light, 12 FPS stride, 4-stage lip-sync) |
| `src/assets/classicCel/characters/moon.ts` | Reference painted gouache celestial character with `#cel-soft-glow` |
| `src/assets/classicCel/buildings/ochreCottage.ts` | Reference painted timber-and-plaster cottage with practical amber window spill |
| `src/assets/classicCel/props/windChimeArbor.ts` | Reference hero prop with gouache wood/ivy & cel metallic chimes |
| `src/assets/classicCel/props/gardenFountain.ts` | Reference stonework, animated water ripples & glowing fireflies |
| `docs/STYLE_GUIDE.md` | Classic Cel vs. Picture-Book Crayon side-by-side visual rules |
| `docs/ARCHITECTURE.md` | Full dual-style codebase map |

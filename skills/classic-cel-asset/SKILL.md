---
name: classic-cel-asset
description: "Workflow for creating authentic 1970s–1980s Classic Hand-Drawn Cel characters (raw Xerox graphite toner outlines + flat matte analog cel paint) and painted watercolor/gouache illustration-board props & buildings in src/assets/classicCel/. Covers Robin Hood (1973) & Mickey's Christmas Carol (1983) visual craft, xeroxSketchStroke fur/cloth ticks, gouacheDabWash brushwork, celContactShadow, 12 FPS organic squash-and-stretch rigging facing +X, 4-stage cel lip-sync mouths, and CLASSIC_CEL_*_RENDERERS registration."
---

# Classic Cel Asset Pipeline (`src/assets/classicCel/`)

This skill is the authoritative guide for authoring **authentic 1970s–1980s Classic Hand-Drawn Cel** characters, props, and buildings — either from a **user-supplied photo** / reference image or from a story blueprint — inside `<workspace>/src/assets/classicCel/`.

Visual target: theatrical Xerox-era Disney animation inspired by ***Robin Hood* (1973)**, ***Mickey's Christmas Carol* (1983)**, and ***The Aristocats* (1970)** — **raw electrostatic Xerox graphite toner outlines + flat opaque matte analog cel paint** on foreground characters, contrasted sharply against **dappled, loose, impressionistic watercolor/gouache illustration-board painting** on background props and buildings.

> [!IMPORTANT]
> - **Scope**: Use this skill ONLY for **Classic Hand-Drawn Animation Style (`artStyle: 'classic_cel'`)**. For **Picture-Book Crayon Style (`artStyle: 'crayon'`)**, load **`skills/photo-to-crayon-asset/SKILL.md`** instead.
> - **Zero-Collision Style Isolation**: Classic cel assets ALWAYS live inside `<workspace>/src/assets/classicCel/{characters,props,buildings}/` and register in `CLASSIC_CEL_*_RENDERERS` — they NEVER overwrite or break Picture-Book Crayon assets in `src/assets/{characters,props,buildings}/`.

---

## Step 1: Study the Physical Craft — Foreground Cels vs. Illustration-Board Backgrounds

### 1a. Foreground Characters (`src/assets/classicCel/characters/`) — Raw Xerox Ink & Flat Matte Cel Paint
Look closely at 1973 *Robin Hood*: characters look unmistakably vintage because they are **graphic, flat-painted cels with raw photocopied pencil lines**, NOT sleek airbrushed digital illustrations:
- **Flat Opaque Analog Cel Paint**: Fill every body region (fur, muzzle, tunic, cloak, collar, eyes) with **flat solid matte analog paint** from `TOKENS.classicCel.colors` — slightly muted, earthy 1970s Eastmancolor pigments (russet brown, olive green, dusty lilac/pink, slate blue, warm parchment cream).
  - Keep most surfaces **pure flat cel paint** (optionally adding a single crisp hard-edged shadow band via `celShadedShape` ONLY for strong dramatic night/cast shadow — NEVER airbrushed/soft gradients, NEVER glossy highlights, NEVER glowing rim halos!).
- **Raw Electrostatic Xerox Graphite Toner Lines**: Use `celPath()` (which applies `#xerox-ink` by default) in warm dark charcoal (`TOKENS.classicCel.colors.xeroxInk`), AND add **broken, sketchy internal pencil construction strokes** via `xeroxSketchStroke()` — fur tuft ticks at cheeks/neck/elbows, collar creases, fabric folds, brow wisps, and whisker flicks that preserve the animator's raw pencil energy.
- **Expressive Classic Disney Faces**: Warm parchment cream sclera (`TOKENS.classicCel.colors.celCream`), warm colored irises, dark pupils with tiny crisp specular catchlights, expressive hand-drawn eyelashes/eyelids, and floating sketchy Xerox eyebrows.
- **Grounded Contact Shadow**: Place a soft painted `celContactShadow()` at ground contact `(0, 0)`.

### 1b. Background Props & Buildings (`src/assets/classicCel/{props,buildings}/`) — Wet-on-Wet Watercolor Washes + Loose Hand-Drawn Pencil Scribbles
Background architecture, trees, bushes, grass, stone fountains, and clouds are painted on **illustration board** using **blotchy wet-on-wet watercolor washes** topped with **crisp, loose hand-drawn pencil/ink scribbles** — NEVER smooth uniform computer fills, NEVER wax crayon, and NEVER heavy closed cartoon borders:
- **Blotchy Wet-on-Wet Watercolor Washes (`watercolorWashBlotches` + `#watercolor-wash-soft`)**: Paint foliage canopies, bushes, clouds, mossy stonework, and ground shadows as overlapping irregular soft-feathered watercolor puddles that melt organically together with tonal mottling (`#bg-board-texture`) — NEVER flat solid vector polygons!
- **Crisp Loose Hand-Drawn Pencil/Ink Scribbles on Top (`#pencil-bg-sketch`, zero blur)**:
  - **Trees & Bushes (`pencilFoliageScribbles`)**: Layer loose, squiggly, broken hand-drawn graphite/ink leaf-cluster loops (`w`/`m`/`c` curly foliage scribbles), ragged branch twigs, and scattered dark pencil stipple dots right over the soft blurry watercolor foliage puddles (just like *Robin Hood*'s Sherwood Forest!).
  - **Grass & Ground (`pencilGrassStrokes`)**: Draw clusters of slanted diagonal graphite pencil hatch ticks, crooked short grass blades, horizontal ground-shadow dashes, and scattered tiny pebble dots across the mottled watercolor meadow — drawn like **graphite pencil over watercolor**, NOT wax crayon and NOT clean computer vectors!
  - **Architecture & Timber (`xeroxSketchStroke`)**: Add sparse loose sepia/charcoal ink ticks for wood grain, stone seams, and roof shingles over soft watercolor washes.
- **Restrained Warm Luminosity**: Practical lights (lanterns, glowing windows, moon, fireflies) use gentle 35mm optical halation (`#cel-soft-glow` at subtle opacity) — NEVER loud neon glow rings. Remember: classic cel look is **NOT** about heavy noisy film grain (35mm grain stays ultra-subtle `~0.025`, warm and luminous).

> [!CAUTION]
> **STRICTLY FORBIDDEN in `classic_cel` assets**:
> - **NO** smooth uniform computer fills for sky, hills, bushes, foliage, or grass!
> - **NO** digital gradients (`linearGradient` / `radialGradient`) on foreground character skin/fur/clothing!
> - **NO** glowing neon halos, Photoshop outer-glow rings, or slick airbrushed specular shading!
> - **NO** razor-sharp clean Adobe Illustrator vectors (always keep `#xerox-ink` toner texture + `xeroxSketchStroke` / `pencilFoliageScribbles` / `pencilGrassStrokes` hand-drawn pencil character)!
> - **NO** `#crayon-stroke`, `TOKENS.patterns.*` wax-crayon hatches, `crayonPath`, or `crayonStrokeAttrs`!
> - **NO** pure `#000000` or pure `#FFFFFF`!

---

## Step 2: Classic Cel, Watercolor & Pencil SVG Primitives (`src/engine/svgUtils.ts`)

Always import colors, strokes, and filters from `TOKENS.classicCel` (`src/theme/tokens.ts`) and build shapes using the dedicated helpers in `src/engine/svgUtils.ts`:

| Helper | Import | Purpose |
| :--- | :--- | :--- |
| `celPath(d, fill, opts?)` | `svgUtils.ts` | **Primary flat analog cel shape**: solid matte opaque paint fill + raw electrostatic `#xerox-ink` charcoal outline (`useXeroxFilter: true` by default). |
| `xeroxSketchStroke(d, opts?)` | `svgUtils.ts` | **Raw animator pencil line**: broken, feathery, variable-pressure internal graphite strokes for fur tufts, cheek/neck bristles, cloth creases, bark scratches, and timber ink ticks. |
| `celShadedShape(opts)` | `svgUtils.ts` | Optional hard-edged 2-tone cel shadow shape (flat base + crisp clipped shadow plane + Xerox outline on top — use sparingly for dramatic night shadows; never airbrushed gradients). |
| `celStrokeAttrs(opts?)` | `svgUtils.ts` | Standard Xerox charcoal outline attributes (`xeroxInk`, `xeroxMedium`, round caps/joins). |
| `celContactShadow(cx, cy, rx, ry, opacity?)` | `svgUtils.ts` | Soft painted ground contact shadow (`data-part="cel-contact-shadow"`, fill `TOKENS.classicCel.colors.contactShadow`). |
| `watercolorWashBlotches(blotches, opts?)` | `svgUtils.ts` | **Wet-on-wet watercolor puddles (`#watercolor-wash-soft`)**: overlapping irregular soft-feathered paint blotches for mottled skies, foliage canopies, bushes, shadows, and dappled ground washes. |
| `pencilFoliageScribbles(clusters, opts?)` | `svgUtils.ts` | **Crisp hand-drawn pencil foliage (`#pencil-bg-sketch`)**: loose squiggly `w`/`m`/`c` leaf-cluster loops, ragged branch twigs, and scattered dark pencil stipple dots layered crisp over blurry watercolor foliage! |
| `pencilGrassStrokes(tufts, opts?)` | `svgUtils.ts` | **Crisp hand-drawn pencil grass (`#pencil-bg-sketch`)**: slanted diagonal graphite hatch ticks, crooked short grass blades, horizontal ground-shadow dashes, and scattered tiny pebble dots over watercolor ground! |
| `gouachePath(d, fill, opts?)` | `svgUtils.ts` | Painterly watercolor/gouache background shape softened by `#gouache-wash`. |
| `gouacheDabWash(...)` | `svgUtils.ts` | Dappled translucent watercolor/gouache brushwork dab clusters for stone, clouds, and washes. |
| `svgEl`, `svgTransform`, `round2` | `svgUtils.ts` | Pure SVG element builder, transform formatter, and coordinate rounding. |
| `steppedOscillate`, `isSteppedBlinkFrame` | `clock.ts` | Organic periodic cycles and natural blinking tuned for 12 FPS. |

### Example: Authentic Xerox Flat-Cel Volume (`celPath` + `xeroxSketchStroke`)

```typescript
import { TOKENS } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  xeroxSketchStroke,
  svgEl,
} from '../../../engine/svgUtils';

const C = TOKENS.classicCel.colors;
const S = TOKENS.classicCel.strokes;

// Flat matte analog cel torso + raw Xerox graphite outline + sketchy fur/collar ticks
const torso = svgEl('g', { 'data-part': 'torso' }, [
  celPath(
    'M -24 -12 C -26 -34, -8 -48, 12 -44 C 24 -40, 26 -18, 18 -4 C 6 2, -16 2, -24 -12 Z',
    C.mochiFurBase,
    { stroke: C.xeroxInk, strokeWidth: S.xeroxMedium } // #xerox-ink enabled by default
  ),
  // Loose hand-drawn Xerox fur tufts & shoulder crease (animator's raw graphite line!)
  xeroxSketchStroke('M -22 -22 L -27 -19 M -21 -16 L -26 -14 M 6 -36 Q 11 -30, 14 -22', {
    stroke: C.xeroxInk,
    strokeWidth: S.sketchLine,
  }),
]);
```

> [!IMPORTANT]
> **Unique Deterministic SVG IDs**: Any `<clipPath>`, `<linearGradient>`, or `<radialGradient>` emitted inside a classic cel asset (e.g., for painted background props/buildings) MUST use a unique deterministic prefix (`cc-mochi-...`, `cc-arbor-...`, `cc-cottage-...`) so multiple nodes in one SVG never collide.

---

## Step 3: Organic 12 FPS Rigging, `+X` Forward Rule & 4-Stage Cel Lip-Sync

### 1. Coordinate Origins, Bounds & Data Attributes
- **Ground-contact origin `(0, 0)`** at feet/base for standing characters, props, and buildings (center `(0, 0)` for floating celestial bodies like `moon` or `sun`).
- **Proportional Baseline**: Standard standing characters `~95–105px` tall at `scale: 1.0`, pets `~44–84px`, tables `42–65px`, doorways `>= 110px`, cottages `~210–340px`, cars `190–280px+` wide.
- **Preserve Existing Bounds When Upgrading a Built-In Kind**: Preserve the exact origin, bounding footprint, `CHARACTER_SPEECH_ANCHORS`, and required `data-*` attributes, AND include `data-art-style="classic_cel"` on the root `<g>`.

### 2. Organic Frame-by-Frame 12 FPS ("On Twos") Motion — NO Sterile Puppet-Rigging
At `12 FPS`, avoid rigid lifeless sliding or robotic puppet pivots:
- **Bold Squash-and-Stretch & Weight**: Give walking/leaping/reaching poses subtle volume squash on contact frames and stretch on passing/reach frames, slight spine arc changes, and distinct hand-drawn limb silhouettes.
- **Overlapping Secondary Action**: Delay ears, tails, whiskers, ribbons, and cloth hems by 1–2 frames behind the body bob via offset `steppedOscillate` / phase math.
- **Living Xerox Line Boil**: Keep `#xerox-ink` enabled on foreground character groups so the graphite toner texture subtly breathes across stepped frames.
- **Natural Blinking**: Use `isSteppedBlinkFrame(frameIndex, 42)` plus expressive half-lid/brow variations for `'sleepy'` / `'curious'` / `'grumpy'`.
- **Canonical `+X` Forward Rule**:
  - `flipX: false` ALWAYS faces **RIGHT (`+X`)**; `flipX: true` mirrors to face **LEFT (`-X`)**.
  - In `state === 'walking'`, ALWAYS render a dedicated 3/4 or side-profile walking rig facing `+X` with `data-facing="right"` and `data-walk-profile="true"`, with all feet/paws/shoes pointing toward `+X`.

### 3. 4-Stage Expressive Cel Lip-Sync Mouths (Mandatory for Voiced Characters)
Whenever `options.isSpeaking` is `true` OR `state === 'singing'`, render an animated cel mouth cycling through **4 expressive hand-drawn mouth shapes** tuned for 12 FPS (`const mouthPhase = Math.floor(frameIndex / 2) % 4`) with `data-speaking-mouth="true"` and `data-mouth-phase={String(mouthPhase)}`:
- **Phase `0`**: Closed warm smile / gentle lip press
- **Phase `1`**: Soft small `'o'` vowel oval (flat dark inner mouth `mochiMouthInner`)
- **Phase `2`**: Open animated jaw (`'ah'`) showing dark inner mouth + flat matte pink tongue (`mochiTongue`)
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

### 4.3 If Introducing a Brand-New Kind Literal (Not Already in `schema.ts`)
1. Add the new kind literal to `CharacterKind`, `PropKind`, or `BuildingKind` in `<workspace>/src/engine/schema.ts`.
2. For a new `CharacterKind`, also register its local head-top speech bubble anchor in `CHARACTER_SPEECH_ANCHORS` (and floatie fit in `CHARACTER_FLOATIE_FITS`) inside `<workspace>/src/assets/characters/index.ts`, plus a clean fallback case in `renderCharacter()` (or `renderProp()` / `renderBuilding()`).
3. `src/assets/{characters,props,buildings}/index.ts` automatically dispatches `options.artStyle === 'classic_cel'` to `CLASSIC_CEL_*_RENDERERS[kind]` first.

### 4.4 Parallel Subagent Isolation & Verification
- Each worker edits **ONLY** its own isolated file(s) in `src/assets/classicCel/<category>/<name>.ts` and returns its export name, kind literal, local SVG bounds `(xMin..xMax, yMin..yMax)`, `CHARACTER_SPEECH_ANCHORS` `(x, y)`, and `data-*` parts.
- The orchestrator wires `src/assets/classicCel/*/index.ts`, `src/engine/schema.ts`, `src/assets/*/index.ts`, and `docs/ARCHITECTURE.md` in one clean integration pass, then verifies with:
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
| `src/theme/tokens.ts` | `TOKENS.classicCel` earthy 1970s Eastmancolor pigments, Xerox strokes, 12 FPS timing, filter IDs |
| `src/engine/svgUtils.ts` | `celPath`, `xeroxSketchStroke`, `celShadedShape`, `celContactShadow`, `watercolorWashBlotches`, `pencilFoliageScribbles`, `pencilGrassStrokes`, `gouachePath`, `gouacheDabWash` |
| `src/assets/classicCel/characters/moonlitCat.ts` | Reference flat-cel Xerox character (raw toner lines, fur ticks, 12 FPS stride, 4-stage lip-sync) |
| `src/assets/classicCel/characters/moon.ts` | Reference painted gouache celestial character |
| `src/assets/classicCel/buildings/ochreCottage.ts` | Reference painted watercolor/gouache storybook cottage with loose sepia ink |
| `src/assets/classicCel/props/windChimeArbor.ts` | Reference painted wood/ivy arbor & chimes |
| `src/assets/classicCel/props/gardenFountain.ts` | Reference painted stone fountain, water ripples & warm fireflies |
| `docs/STYLE_GUIDE.md` | Classic Cel vs. Picture-Book Crayon side-by-side visual rules |
| `docs/ARCHITECTURE.md` | Full dual-style codebase map & `/` vs `/classic/...` routing |

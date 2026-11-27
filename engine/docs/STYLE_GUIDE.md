# Animated Picture Book Studio — Dual-Style Guide & Design Tokens

The Studio engine supports **two distinct, style-isolated visual pipelines**. Never mix techniques across styles (e.g., never apply `#crayon-stroke` or cold-press paper textures inside a `classic_cel` scene, and never use flat digital gradients inside a `crayon` scene).

## Side-by-Side Style Contract

| Dimension | Picture-Book Crayon (`artStyle: 'crayon'`, `/`) | Classic Hand-Drawn Cel (`artStyle: 'classic_cel'`, `/classic/...`) |
| :--- | :--- | :--- |
| **Visual Inspiration** | Children's wax-crayon, oil-pastel & felt-tip storybook on cold-press watercolor paper | 1970s–1980s Disney Xerox cel animation (*Robin Hood* 1973, *Mickey's Christmas Carol* 1983, *The Aristocats*) |
| **Frame Rate & Export** | `6 FPS` stepped stop-motion (`30 FPS` MP4 container) | `12 FPS` ("on twos") organic hand-drawn motion (`24 FPS` theatrical MP4 container) |
| **Backgrounds (Layer 1A)** | Tier 1 textured crayon/marker `<pattern>` `background_patch` with `0–25px` organic seams & progressive fill masks | **Wet-on-wet blotchy watercolor puddles** (`watercolorWashBlotches` + `#watercolor-wash-soft`) with organic tonal mottling (`#bg-board-texture`) — NEVER smooth computer fills — topped with **crisp loose hand-drawn pencil/ink foliage loops (`pencilFoliageScribbles`) & slanted pencil grass/shadow dashes (`pencilGrassStrokes`)** (`#pencil-bg-sketch`) |
| **Characters (Layer 1B)** | Cutout crayon `<pattern>` fills + heavy charcoal pencil outlines (`#crayon-stroke`, `outlineMedium: 2.6`) | **Flat matte analog cel paint** (mixed in physical paint jars — earthy Eastmancolor pigments, NO digital gradients!) + **raw electrostatic Xerox graphite toner outlines** (`#xerox-ink`, `xeroxSketchStroke` fur/cloth ticks) + rostrum hover shadow (`#cel-drop-shadow`) + `celContactShadow` |
| **Lighting & Halation** | **Forbidden** (no CSS glow, no gradients, no drop shadows) | Restrained physical 35mm optical halation (`#cel-soft-glow`) on practical lamps/moon/fireflies only — **NO modern neon glow halos or Photoshop bloom rings** |
| **Opening & Closing** | Hardcover `bookFrame` (`3.5s` cover flip & `0→100%` color-in; closing sketch & `"The End ★"`) | `theatricalFrame` (`3.0s` circular iris/fade + vintage parchment-gold serif title directly over scene; closing iris-out + `"The End"`) |
| **Layer 3 Finish** | Cold-press paper multiply + dry-brush flecks (`#layer-3-paper-composite`) | **Ultra-subtle (`~0.025`), warm, luminous 35mm film grain** (`#film-grain` — NOT heavy dusty TV static!) + gentle film-gate vignette (`#layer-3-film-composite`) + clean warm Eastmancolor `#cel-grade` |
| **Asset Folders & Skills** | `src/assets/{characters,props,buildings}/` (`picture-book-animation` + `photo-to-crayon-asset`) | `src/assets/classicCel/{characters,props,buildings}/` (`classic-animation` + `classic-cel-asset`) |
| **Strictly Forbidden** | Pure `#000000` / `#FFFFFF`, flat digital gradients, glowing effects, sterile 60fps CSS `ease-in-out` | Pure `#000000` / `#FFFFFF`, **smooth uniform computer background fills**, **heavy noisy TV-static grain**, **modern digital gradients on characters**, **neon glow halos**, **clean sterile Illustrator vectors**, **slick glossy/airbrushed shading**, wax-crayon patterns/`#crayon-stroke`/`crayon_scribble` |

---

## PART I — Picture-Book Crayon Style (`artStyle: 'crayon'`)

### 1. Core Crayon Aesthetic Rules
- **Medium**: Wax crayons, oil pastels, and felt-tip markers on heavy cold-press watercolor paper.
- **Forbidden**: Flat digital gradients, glowing neon effects, CSS `box-shadow`, pure `#FFFFFF` backgrounds, pure `#000000` outlines, or smooth 60fps `ease-in-out` motion.
- **Negative Space & Stop-Motion Coloring**: Preserve generous areas of raw warm paper (`#F4EFE6`). Background sky and grass use partial-bleed vignette patches whose color fills in via stepped stop-motion brush/band masks.
- **Storybook Cover Opening & Ending/Credits Book-Frame (`bookFrame`)**: Scenes open on a closed hardcover storybook (`#book-front-cover`) that flips open at `6 FPS` to reveal an uncolored charcoal-and-pencil sketch (`0%` crayon fill) on warm paper (`#F4EFE6`). As the camera zooms into the open book spread (`0.68 -> 1.0`), the crayon pigment progressively colors in from `0% -> 100%`. In the final `3.5s`, the scene zooms back out (`1.0 -> 0.68`) as crayon pigment drains from `100% -> 0%` back to a pencil sketch before the back/ending cover (`#book-ending-cover`) closes with `"The End ★"`, the scene title, and credits. All cover boards, page edges, spine stitching, and gold star emblems strictly use `TOKENS` colors and dry-crayon pattern fills.
- **Vibrant Crayon Mode (`vibrant?: boolean`)**: Boosts pigment saturation (`1.42x`) and contrast via `#vibrant-grade` while reducing paper multiply overlay opacity (`0.35`) so pastel blues, meadow greens, reds, and yellows shine with vivid crayon intensity.

## 2. Centralized Palette (`src/theme/tokens.ts`)
- **Paper Base**:
  - `paperWarm`: `#F4EFE6`
  - `paperShadow`: `#EDE6D6`
  - `paperDeep`: `#E2D9C5`
- **Outlines & Pencil**:
  - `charcoalOutline`: `#2B231D`
  - `faintPencil`: `#4A4238`
- **Marker Wash Fills**:
  - `indigoNight`: `#2E3B6E`
  - `indigoNightDark`: `#222C56`
  - `indigoNightLight`: `#3D4D87`
- **Dry Crayon & Oil Pastel Fills**:
  - `terracottaRoof`: `#C84B31`
  - `terracottaDark`: `#A63822`
  - `ochreWall`: `#E3B464`
  - `ochreLight`: `#EED08A`
  - `warmMoon`: `#F0C243`
  - `moonCheek`: `#E58B3A`
  - `sunsetOrange`: `#E87A3E`
  - `sunsetGold`: `#F29F4B`
  - `nightcapBlue`: `#6A9EC0`
  - `nightcapWhite`: `#F2EDE2`
  - `grassGreen`: `#6B9E58`
  - `treeGreen`: `#588A47`
  - `curtainPink`: `#E5989B`
  - `windowGlow`: `#F4CA44`
  - `dressPink`: `#E8A5B8`
  - `hairBrown`: `#6D4C3D`
  - `storeTeal`: `#5B8E8D`
  - `storeAwningRed`: `#D15B47`
  - `woodBrown`: `#8A5A3B`
  - `starWhite`: `#F6F2E9`
- **Vibrant Daylight & Cutout Meadow Palette**:
  - `skyPastelBlue`: `#9CCEF4`
  - `skyPastelLight`: `#B6DDF9`
  - `meadowGreen`: `#93C969`
  - `meadowHorizonRose`: `#C86D78`
  - `radishRed`: `#EE4B2B`
  - `emeraldFrond`: `#149658`
  - `bananaYellow`: `#FFCE34`
  - `royalCrayonBlue`: `#2541B2`
  - `catLightBlue`: `#79C2F2`
  - `watermelonPink`: `#F25268`
  - `cherryRose`: `#F26B8A`
  - `cloudWhite`: `#FAF8F4`
  - `cutoutHaloWhite`: `#FAF8F2`
  - `cobaltStarBlue`: `#1D63DC`

## 3. Timing & Motion Tokens
- `fps`: `6` (Quantized stop-motion frame rate; `166.67ms` per stepped tick)
- `lineBoilSeedCount`: `6` (Cycles seeds `1..6` at `6 FPS`)
- `defaultCanvasWidth`: `1280`
- `defaultCanvasHeight`: `720` (`16:9` widescreen picture-book aspect ratio; exports at `1920×1080` 1080p or `1280×720` 720p)

## 4. Classic 1970s–1980s Hand-Drawn Cel Animation Style (`artStyle: 'classic_cel'`)

### 4.1 Core Physical Craft Rules (Why 1970s–80s Animation Looks Authentic, Not Modern Digital 2D)
- **Medium & Heritage**: Theatrical 1970s–1980s Disney Xerox-era hand-drawn cel animation (*Robin Hood* 1973, *Mickey's Christmas Carol* 1983, *The Aristocats* 1970).
- **Mandatory Physical Techniques**:
  1. **Raw Electrostatic Xerox Graphite Toner Lines (`#xerox-ink`, `xeroxSketchStroke`)**: Sketchy, slightly broken, variable-pressure charcoal pencil toner outlines preserving the animator's raw pencil energy (fur tufts, cheek/whisker strokes, cloth creases, collar ticks) with subtle living Xerox line boil — NOT razor-sharp clean Illustrator vectors!
  2. **Flat Opaque Analog Cel Paint on Characters**: Paint characters with **flat matte physical cel paint** mixed in earthy, slightly muted 1970s Eastmancolor pigments (olive greens, russet browns, dusty pinks/lilacs, slate blues, creamy parchment — optional hard-edged cast shadow band ONLY where strong dramatic lighting requires it).
  3. **Wet-on-Wet Blotchy Watercolor Washes + Expressive Loose Hand-Drawn Pencil/Ink Scribbles on Top**:
     - **NEVER** use smooth uniform computer fills for sky, hills, bushes, or grass! Paint overlapping soft-feathered blotchy watercolor puddles (`watercolorWashBlotches` + `#watercolor-wash-soft`) with organic tonal mottling (`#bg-board-texture`) so washes melt together like wet watercolor on illustration board.
     - Layer **crisp, loose, squiggly hand-drawn pencil/ink foliage clusters (`w`/`m`/`c` curly leaf scribbles) & scattered dark ink stipple dots** (`pencilFoliageScribbles` + `#pencil-bg-sketch`) right over soft blurry watercolor bushes/trees, and **slanted diagonal hand-drawn pencil grass strokes, crooked short grass blades, horizontal ground-shadow dashes, and scattered pebble dots** (`pencilGrassStrokes` + `#pencil-bg-sketch`) across the ground — drawn like **pencil over watercolor**, NOT wax crayon and NOT smooth computer vectors!
  4. **Warm Luminous 35mm Finish (Ultra-Subtle Grain `~0.025` — NOT Heavy Noisy Static!)**:
     - Separate painted watercolor illustration-board backgrounds (Layer 1A) from transparent acetate foreground cels (Layer 1B, tiny physical rostrum hover shadow `#cel-drop-shadow`).
     - Keep `#film-grain` **ultra-subtle (`~0.025` opacity)** so the frame stays warm, crisp, and luminous — never dusty TV static or murky gray haze — paired with clean Eastmancolor `#cel-grade` and gentle film-gate vignette (`#film-vignette`).
  5. **Organic 12 FPS ("On Twos") Human Drawing & Vintage Theatrical Cards**: Expressive squash-and-stretch, overlapping follow-through, and vintage serif opening/closing `theatricalFrame` titles without synthetic geometric oval scrims.
- **STRICTLY FORBIDDEN in `classic_cel`**:
  - **NEVER** use smooth uniform computer fills or clean flat vector polygons for sky, hills, bushes, foliage, or grass!
  - **NEVER** add heavy noisy TV-static film grain or murky gray haze! (Keep 35mm film grain ultra-subtle `~0.025`, warm and luminous.)
  - **NEVER** put modern digital gradients (`linearGradient` / `radialGradient`) on foreground character bodies, fur, skin, or clothing!
  - **NEVER** use neon glow halos, harsh Photoshop bloom rings, or slick glossy/airbrushed shading!
  - **NEVER** draw sterile, razor-sharp modern vector/Illustrator contours devoid of Xerox pencil character!
  - **NEVER** use `#crayon-stroke`, wax-crayon `<pattern>` fills (`TOKENS.patterns.crayon*`), raw `#paper-base` (`#F4EFE6`), `#layer-3-paper-composite`, `bookFrame` (unless explicitly requested), or `crayon_scribble` SFX cues!
  - **NEVER** use pure `#000000` or pure `#FFFFFF`, or bright modern hyper-saturated neon RGB!

### 4.2 Centralized Classic Cel Tokens (`TOKENS.classicCel` in `src/theme/tokens.ts`)
- **Theatre, Xerox Toner & Titles**: `backdropDark`, `xeroxInk` (warm graphite toner), `xeroxInkSoft`, `celCream` (creamy parchment), `celBubbleFill`, `goldTitle` (antique gold), `goldTitleShadow`, `contactShadow`
- **Painted Night Sky, Glade & Woodland Gouache**: `nightSkyZenith`, `nightSkyMid`, `nightSkyHorizon`, `nightMistTeal`, `nightDeepGlade`, `nightGladeMid`, `nightGladeHorizon`, `foliageShadow`, `foliageMid`, `foliageLit`, `foliageRim`, `grassNightDeep`, `grassNightMid`, `grassNightLit`, `gladeGlow`
- **Earth, Stone, Water & Restrained Practical Light**: `pathEarthDark`, `pathEarthMid`, `pathMoonlit`, `stoneBase`, `stoneLight`, `stoneShadow`, `waterDeep`, `waterMid`, `waterHighlight`, `warmAmberCore`, `warmAmberGlow`, `warmAmberWash`, `warmAmberDeep`
- **Xerox Strokes**: `xeroxHeavy`, `xeroxMedium`, `xeroxFine`, `sketchLine`
- **Timing & Filters**: `fps: 12` ("on twos"), `containerFps: 24`, filter IDs `#xerox-ink`, `#gouache-wash`, `#watercolor-wash-soft`, `#pencil-bg-sketch`, `#bg-board-texture`, `#cel-drop-shadow`, `#cel-soft-glow`, `#cel-grade`, `#film-grain`, `#film-vignette`

---

## 5. Story Continuity, Visual Pacing, Speaking Mouths & Proportional Scale (Both Styles)
- **Location-Driven Backgrounds**: Change Tier 1 `background_patch` layers (crayon patches in `crayon`; multiplane gouache gradients in `classic_cel`) and Tier 2 buildings/props whenever a scene/act moves to a new location so the location transition is clear.
- **Brisk Cuts When All Characters Leave**: Once all active characters exit a scene/shot, transition to the next scene quickly (`~0.3–1.0s`) rather than holding on an empty stage.
- **Chronological Day/Night Continuity**: Respect forward time-of-day progression (`Dawn/Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`) across sky patches, celestial bodies (`sun`/`moon`/`star_cluster`), and warm lights (`windowLit`, `street_lantern`, `campfire`); never jump incoherently backwards (e.g., `Night → Midday → Morning`) unless staged as an explicit flashback or dream.
- **In-Scene Object & Companion Permanence**: Never pop items, vehicles, or animal companions out of existence (`visible: false`) mid-scene (e.g., if a character dismounts a horse, keep the horse visible/tethered nearby or animate it walking off-screen naturally).
- **Speaking Mouth Animation**: Whenever a character has spoken voiceover, animate their mouth area across stepped `6 FPS` ticks (`crayon`) or 4-stage `12 FPS` cel lip-sync shapes (`Math.floor(frameIndex / 2) % 4` in `classic_cel`) for the exact spoken window and close it when silent.
- **Proportional Scale Baseline**: Relative to standard `~95–105px` standing characters (`scale: 1.0`), size furniture, vehicles, animals, and buildings believably on the same depth plane: tables at waist/chest height (`~42–65px`, never taller than a standing character), chairs/logs at knee/hip height (`~26–45px`), full-sized cars wider/longer than a character's height (`~190–280px+` wide), doorways taller than characters (`>= 110px`), and cottages/castles towering naturally above characters.


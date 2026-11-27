# Animated Picture Book Studio — Dual-Style Guide & Design Tokens

The Studio engine supports **two distinct, style-isolated visual pipelines**. Never mix techniques across styles (e.g., never apply `#crayon-stroke` or cold-press paper textures inside a `classic_cel` scene, and never use flat digital gradients inside a `crayon` scene).

## Side-by-Side Style Contract

| Dimension | Picture-Book Crayon (`artStyle: 'crayon'`) | Classic Hand-Drawn Cel (`artStyle: 'classic_cel'`) |
| :--- | :--- | :--- |
| **Visual Inspiration** | Children's wax-crayon, oil-pastel & felt-tip storybook on cold-press watercolor paper | 1970s–1980s Disney Xerox cel animation (*Mickey's Christmas Carol* 1983, *Robin Hood* 1973, *The Aristocats*) |
| **Frame Rate & Export** | `6 FPS` stepped stop-motion (`30 FPS` MP4 container) | `12 FPS` ("on twos") fluid hand-drawn motion (`24 FPS` theatrical MP4 container) |
| **Backgrounds** | Tier 1 textured crayon/marker `<pattern>` `background_patch` with `0–25px` organic seams & progressive fill masks | Multiplane painted watercolor/gouache `background_patch` using SVG `linear`/`radial` `gradient` & `fill` (`#gouache-wash`) |
| **Characters & Shading** | Cutout crayon `<pattern>` fills + heavy charcoal pencil outlines (`#crayon-stroke`, `outlineMedium: 2.6`) | Opaque matte cel fills + crisp 2-tone clipped shadow & rim highlight (`celShadedShape`) + Xerox charcoal ink (`xeroxInk`, `1.85`) + `celContactShadow` |
| **Lighting & Glows** | **Forbidden** (no CSS glow, no gradients, no drop shadows) | **Mandatory** warm optical halation (`#cel-soft-glow`) on practical lamps, moon, stars & fireflies + soft ground light pools |
| **Opening & Closing** | Hardcover `bookFrame` (`3.5s` cover flip & `0→100%` color-in; closing sketch & `"The End ★"`) | `theatricalFrame` (`3.0s` circular iris/fade + gold-serif title card; closing iris-out + `"The End"`) |
| **Layer 3 Finish** | Cold-press paper multiply + dry-brush flecks (`#layer-3-paper-composite`) | 35mm celluloid film grain (`overlay`, `0.075`) + optical vignette (`#layer-3-film-composite`) |
| **Asset Folders & Skills** | `src/assets/{characters,props,buildings}/` (`picture-book-animation` + `photo-to-crayon-asset`) | `src/assets/classicCel/{characters,props,buildings}/` (`classic-animation` + `classic-cel-asset`) |
| **Forbidden In Both** | Pure `#000000` / `#FFFFFF`, neon cyberpunk effects, sterile 60fps CSS `ease-in-out`, hardcoded magic hex colors | Pure `#000000` / `#FFFFFF`, wax-crayon patterns/`#crayon-stroke`/`crayon_scribble`, flat unshaded digital vector shapes |

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

### 4.1 Core Classic Cel Aesthetic Rules
- **Medium & Heritage**: Theatrical 1970s–1980s Disney Xerox-era hand-drawn animation (*Mickey's Christmas Carol* 1983, *Robin Hood* 1973, *The Aristocats* 1970) — **lush painted watercolor/gouache multiplane backgrounds** contrasted with **crisp Xerox charcoal ink-and-paint foreground cels**.
- **Mandatory Techniques**:
  - **Multiplane Painted Gouache Backgrounds**: Full-bleed layered `background_patch` planes using `gradient` (`linear` / `radial`) and `fill` tokens from `TOKENS.classicCel.colors` rendered via `gouachePath()` (`#gouache-wash`), with outer overbleed (`x: -80..1360`, `y: -60..780`).
  - **2-Tone Cel Shading + Rim Highlights**: Every foreground character and hero interactive prop uses `celShadedShape()` — opaque matte cel base paint, crisp clipped shadow band(s), moonlight or warm-lantern rim highlight(s), and a clean Xerox charcoal outline (`TOKENS.classicCel.colors.xeroxInk = '#1D1815'`) drawn on top.
  - **Ground Contact Shadows**: Ground every standing character/prop with `celContactShadow()` (`TOKENS.classicCel.colors.contactShadow = '#121824'`).
  - **Practical Optical Lighting**: Emit warm golden/cream optical halation (`#cel-soft-glow`) from lanterns, cottage windows, moon, stars, and fireflies, paired with radial warm ground pools.
  - **Theatrical Framing (`theatricalFrame`)**: Circular iris-in or warm fade (`3.0s`) with gold-serif title card, full-bleed middle story, and closing iris-out centered on `irisFocus` into a gold-serif `"The End"` card (`3.0s`).
  - **35mm Film Composite**: Layer 3 applies `#film-vignette` + fine 35mm `#film-grain` (`renderFilmCompositeLayer`) over Eastmancolor-graded `#cel-grade` Layer 1.
- **Forbidden in `classic_cel`**:
  - **NEVER** use `#crayon-stroke`, wax-crayon `<pattern>` fills (`TOKENS.patterns.crayon*`), raw `#paper-base` (`#F4EFE6`), `#layer-3-paper-composite`, `bookFrame` (unless explicitly requested), or `crayon_scribble` SFX cues.
  - **NEVER** use pure `#000000` or pure `#FFFFFF` (always use `xeroxInk` `#1D1815` and `celCream` `#FAF6EC` / `warmAmberCore` `#FFF1B8`).
  - **NEVER** draw flat unshaded digital vector silhouettes without 2-tone cel shadow planes or contact shadows.

### 4.2 Centralized Classic Cel Tokens (`TOKENS.classicCel` in `src/theme/tokens.ts`)
- **Theatre, Ink & Titles**: `backdropDark` (`#121014`), `xeroxInk` (`#1D1815`), `xeroxInkSoft` (`#3A312A`), `celCream` (`#FAF6EC`), `celBubbleFill` (`#FBF7EE`), `goldTitle` (`#F2CC6B`), `goldTitleShadow` (`#4A3418`), `contactShadow` (`#121824`)
- **Painted Night Sky & Glade**: `nightSkyZenith` (`#111A36`), `nightSkyMid` (`#1C2E54`), `nightSkyHorizon` (`#2D4B68`), `nightMistTeal` (`#43697D`), `nightDeepGlade` (`#0E1C2E`), `nightGladeMid` (`#183047`), `nightGladeHorizon` (`#284A5E`)
- **Woodland & Garden Gouache**: `foliageShadow` (`#162A2C`), `foliageMid` (`#24453E`), `foliageLit` (`#3D6A54`), `foliageRim` (`#6A9477`), `grassNightDeep` (`#1E3A32`), `grassNightMid` (`#2C5141`), `grassNightLit` (`#4A7557`), `gladeGlow` (`#3F6E61`)
- **Earth, Stone, Water & Practical Light**: `pathEarthDark`, `pathEarthMid`, `pathMoonlit`, `stoneBase`, `stoneLight`, `stoneShadow`, `waterDeep`, `waterMid`, `waterHighlight`, `warmAmberCore`, `warmAmberGlow`, `warmAmberWash`, `warmAmberDeep`
- **Xerox Strokes**: `xeroxHeavy: 2.4`, `xeroxMedium: 1.85`, `xeroxFine: 1.2`, `sketchLine: 0.95`
- **Timing & Filters**: `fps: 12` ("on twos"), `containerFps: 24`, filter IDs `#xerox-ink`, `#gouache-wash`, `#cel-drop-shadow`, `#cel-soft-glow`, `#cel-grade`, `#film-grain`, `#film-vignette`

---

## 5. Story Continuity, Visual Pacing, Speaking Mouths & Proportional Scale (Both Styles)
- **Location-Driven Backgrounds**: Change Tier 1 `background_patch` layers (crayon patches in `crayon`; multiplane gouache gradients in `classic_cel`) and Tier 2 buildings/props whenever a scene/act moves to a new location so the location transition is clear.
- **Brisk Cuts When All Characters Leave**: Once all active characters exit a scene/shot, transition to the next scene quickly (`~0.3–1.0s`) rather than holding on an empty stage.
- **Chronological Day/Night Continuity**: Respect forward time-of-day progression (`Dawn/Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`) across sky patches, celestial bodies (`sun`/`moon`/`star_cluster`), and warm lights (`windowLit`, `street_lantern`, `campfire`); never jump incoherently backwards (e.g., `Night → Midday → Morning`) unless staged as an explicit flashback or dream.
- **In-Scene Object & Companion Permanence**: Never pop items, vehicles, or animal companions out of existence (`visible: false`) mid-scene (e.g., if a character dismounts a horse, keep the horse visible/tethered nearby or animate it walking off-screen naturally).
- **Speaking Mouth Animation**: Whenever a character has spoken voiceover, animate their mouth area across stepped `6 FPS` ticks (`crayon`) or 4-stage `12 FPS` cel lip-sync shapes (`Math.floor(frameIndex / 2) % 4` in `classic_cel`) for the exact spoken window and close it when silent.
- **Proportional Scale Baseline**: Relative to standard `~95–105px` standing characters (`scale: 1.0`), size furniture, vehicles, animals, and buildings believably on the same depth plane: tables at waist/chest height (`~42–65px`, never taller than a standing character), chairs/logs at knee/hip height (`~26–45px`), full-sized cars wider/longer than a character's height (`~190–280px+` wide), doorways taller than characters (`>= 110px`), and cottages/castles towering naturally above characters.


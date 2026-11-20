# Picture-Book Crayon Video Engine — Style Guide & Tokens

## 1. Core Aesthetic Rules
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

## 4. Story Continuity, Visual Pacing, Speaking Mouths & Proportional Scale
- **Location-Driven Backgrounds**: Change Tier 1 `background_patch` layers and Tier 2 buildings/props whenever a scene/act moves to a new location so the location transition is clear.
- **Brisk Cuts When All Characters Leave**: Once all active characters exit a scene/shot, transition to the next scene quickly (`~0.3–1.0s`) rather than holding on an empty stage.
- **Chronological Day/Night Continuity**: Respect forward time-of-day progression (`Dawn/Morning → Midday/Afternoon → Sunset/Dusk → Night → next Morning`) across sky patches, celestial bodies (`sun`/`moon`/`star_cluster`), and warm lights (`windowLit`, `street_lantern`, `campfire`); never jump incoherently backwards (e.g., `Night → Midday → Morning`) unless staged as an explicit flashback or dream.
- **In-Scene Object & Companion Permanence**: Never pop items, vehicles, or animal companions out of existence (`visible: false`) mid-scene (e.g., if a character dismounts a horse, keep the horse visible/tethered nearby or animate it walking off-screen naturally).
- **Speaking Mouth Animation**: Whenever a character has spoken voiceover, animate their mouth area across stepped `6 FPS` `frameIndex` ticks for the exact spoken window and close it when silent.
- **Proportional Scale Baseline**: Relative to standard `~95–105px` standing characters (`scale: 1.0`), size furniture, vehicles, animals, and buildings believably on the same depth plane: tables at waist/chest height (`~42–65px`, never taller than a standing character), chairs/logs at knee/hip height (`~26–45px`), full-sized cars wider/longer than a character's height (`~190–280px+` wide), doorways taller than characters (`>= 110px`), and cottages/castles towering naturally above characters.


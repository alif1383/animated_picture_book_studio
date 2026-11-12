# Picture-Book Crayon Video Engine — Style Guide & Tokens

## 1. Core Aesthetic Rules
- **Medium**: Wax crayons, oil pastels, and felt-tip markers on heavy cold-press watercolor paper.
- **Forbidden**: Flat digital gradients, glowing neon effects, CSS `box-shadow`, pure `#FFFFFF` backgrounds, pure `#000000` outlines, or smooth 60fps `ease-in-out` motion.
- **Negative Space & Stop-Motion Coloring**: Preserve generous areas of raw warm paper (`#F4EFE6`). Background sky and grass use partial-bleed vignette patches whose color fills in via stepped stop-motion brush/band masks.
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

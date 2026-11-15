# Picture-Book Engine — Asset Catalog & TypeScript Schema Reference

> [!NOTE]
> This is the exhaustive reference companion to the [picture-book-animation](../SKILL.md) skill.
> All types are defined in `<workspace>/src/engine/schema.ts`; all tokens in `<workspace>/src/theme/tokens.ts`.

---

## 1. CharacterKind (19 built-in characters)

| Kind literal | Render function | File | Description |
|---|---|---|---|
| `little_girl` | `renderLittleGirl` | `src/assets/characters/littleGirl.ts` | 2D cutout rig: wavy brown hair with pastel pink hairclip, purple star sweater, cream wide-leg trousers & white sneakers, optional sheep plushie (`holdingSheep`) or hot pizza slice (`holdingPizza`) |
| `shopkeeper` | `renderShopkeeper` | `src/assets/characters/shopkeeper.ts` | Friendly baker in cream apron & cap |
| `moon` | `renderMoon` | `src/assets/characters/moon.ts` | Storybook Crescent Moon with dangling & twinkling companion stars (`data-part="moon-stars"`), orange cheeks, diagonal hatching, optional nightcap (`wearingNightcap`) |
| `sun` | `renderSun` | `src/assets/characters/sun.ts` | Bright yellow morning sun, turns warm orange at sunset, yawns sleepily |
| `cat` | `renderCat` | `src/assets/characters/cat.ts` | White/cream kitten with dark brown/grey tabby patches, pink inner ears & golden collar bell — curious, walking, waving, sleeping, or idle |
| `knight` | `renderKnight` | `src/assets/characters/knight.ts` | Sir Leo the Brave Crayon Knight on Horseback (`+X` facing): sky-blue armor, red cape, star shield, lance & trotting cream steed |
| `soldier` | `renderSoldier` | `src/assets/characters/soldier.ts` | Royal Mounted Soldier on Horseback (`+X` facing): royal-blue tunic, kettle helmet, round wooden star shield & pennant spear |
| `dragon` | `renderDragon` | `src/assets/characters/dragon.ts` | Barnaby the Cute Forest Dragon (`+X` facing): emerald-green body, ochre belly, scalloped wings, crooked tooth with bramble, fire puff & dizzy stars |
| `villager` | `renderVillager` | `src/assets/characters/villager.ts` | Castle Herald & Medieval Villager (`+X` facing): feathered beret cap, terracotta/sage tunic & herald scroll |
| `singing_radish` | `renderSingingRadish` | `src/assets/characters/singingRadish.ts` | Red-orange radish with emerald leaf ponytails, blue hair ties & crayon microphone |
| `birthday_strawberry` | `renderBirthdayStrawberry` | `src/assets/characters/birthdayStrawberry.ts` | Plump red strawberry with yellow seeds, leafy green calyx collar & golden birthday crown |
| `watermelon_slice` | `renderWatermelonSlice` | `src/assets/characters/watermelonSlice.ts` | Red-pink watermelon slice with black seeds, emerald rind & red pom-pom party hat |
| `blue_party_cat` | `renderBluePartyCat` | `src/assets/characters/bluePartyCat.ts` | Seated sky-blue crayon cat with royal-blue whiskers & striped party hat |
| `hello_bug` | `renderHelloBug` | `src/assets/characters/helloBug.ts` | Dark-indigo berry bug with antennae, red head bar & hand-lettered "Hi" |
| `party_banana` | `renderPartyBanana` | `src/assets/characters/partyBanana.ts` | Curved bright yellow banana wearing an orange cone party hat |
| `crying_onion` | `renderCryingOnion` | `src/assets/characters/cryingOnion.ts` | Teardrop bulb in blue patterned cone hat with worried brows & cyan teardrops |
| `cherry_twins` | `renderCherryTwins` | `src/assets/characters/cherryTwins.ts` | Two rosy-pink cherries joined by green V-stems wearing orange cone party hats |
| `acorn_twins` | `renderAcornTwins` | `src/assets/characters/acornTwins.ts` | Golden-ochre acorn buddies holding hands with brown caps & green leaf sprouts |
| `olive_sprout` | `renderOliveSprout` | `src/assets/characters/oliveSprout.ts` | Small dark-green oval with white tummy face & red-tipped topknot |

### CharacterState (13 states)

```
idle | walking | climbing | sitting | singing | waving | looking_up | awake | sleepy | curious | grumpy | blinking | sleeping
```

Not every character implements every state; unsupported states fall back to `idle`.

### CharacterNode-specific fields

| Field | Type | Description |
|---|---|---|
| `kind` | `CharacterKind` | Which character rig to render |
| `state` | `CharacterState` | Current pose/animation state |
| `wearingNightcap?` | `boolean` | Moon only — blue-and-white striped sleeping nightcap |
| `holdingSheep?` | `boolean` | Little girl only — fluffy white sheep plushie |
| `holdingPizza?` | `boolean` | Little girl only — warm cheesy pepperoni pizza slice |
| `speechText?` | `string` | Optional speech or thought bubble text anchored directly above this character's head (`CHARACTER_SPEECH_ANCHORS`) |
| `speechStyle?` | `'speech' \| 'thought'` | Style of the character-attached bubble (default: `'speech'`) |
| `speechTail?` | `'bottom-center' \| 'bottom-left' \| 'bottom-right'` | Optional tail direction override for the character-attached bubble (default: `'bottom-center'`) |

---

## 2. BuildingKind (4 built-in buildings)

| Kind literal | Render function | File | Description |
|---|---|---|---|
| `ochre_cottage` | `renderOchreCottage` | `src/assets/buildings/ochreCottage.ts` | Cute & cozy storybook cottage: scalloped terracotta roof, welcome wreath door with heart window, overflowing window flower boxes, teal shutters, climbing garden vines & optional right ladder |
| `corner_store` | `renderCornerStore` | `src/assets/buildings/cornerStore.ts` | Pastel teal storefront, red-and-cream striped crayon awning, default sign "LUNE STORE" |
| `royal_castle` | `renderRoyalCastle` | `src/assets/buildings/royalCastle.ts` | Royal Crayon Stone Castle: warm stone keep, twin crenellated towers with conical roofs, golden star flags, portcullis gate & festive bunting |
| `scorched_cottage` | `renderScorchedCottage` | `src/assets/buildings/scorchedCottage.ts` | Scorched Village Cottage: damaged roof tiles, charcoal soot smudges, tilted shutter & rising smoke wisps |

### BuildingNode-specific fields

| Field | Type | Description |
|---|---|---|
| `kind` | `BuildingKind` | Which building to render |
| `windowLit?` | `boolean` | Whether windows emit warm crayon glow (`#pat-crayon-window-glow`) |
| `showLadder?` | `boolean` | Whether the cottage climbing ladder is visible |
| `signText?` | `string` | Custom sign text for `corner_store` (default: `"LUNE STORE"`) |
| `bounds?` | `FillMaskBounds` | Optional bounding box when progressive fill mask is applied |

---

## 3. PropKind (21 built-in props)

| Kind literal | Render function | File | Description |
|---|---|---|---|
| `tree` | `renderTree` | `src/assets/props/tree.ts` | Puffy green crayon foliage crown with warm paper-tooth streaks |
| `grass_patch` | `renderGrassPatch` | `src/assets/props/grassPatch.ts` | Tufts of crayon grass blades |
| `music_notes` | `renderMusicNotes` | `src/assets/props/musicNotes.ts` | Hand-drawn eighth notes hopping upward at 6 FPS |
| `star_cluster` | `renderStarCluster` | `src/assets/props/starCluster.ts` | Twinkling star cluster in indigo night sky |
| `pencil_numbers` | `renderPencilNumbers` | `src/assets/props/pencilNumbers.ts` | Faint charcoal pencil numbers counting stars (`1 2 3 4 5`) |
| `apple_crate` | `renderAppleCrate` | `src/assets/props/appleCrate.ts` | Wooden slatted crate overflowing with red & terracotta crayon apples |
| `street_lantern` | `renderStreetLantern` | `src/assets/props/streetLantern.ts` | Wrought-iron street lantern with dashed warm yellow halo |
| `chimney_puffs` | `renderChimneyPuffs` | `src/assets/props/chimneyPuffs.ts` | Stepped smoke puffs rising from chimney |
| `bicycle` | `renderBicycle` | `src/assets/props/bicycle.ts` | Storybook bicycle with wicker basket |
| `fluffy_cloud` | `renderFluffyCloud` | `src/assets/props/fluffyCloud.ts` | White puffy cloud cutout |
| `meadow_flowers` | `renderMeadowFlowers` | `src/assets/props/meadowFlowers.ts` | Daisies & V-grass tufts across the meadow hill |
| `birthday_cake` | `renderBirthdayCake` | `src/assets/props/birthdayCake.ts` | Two-tier strawberry birthday cake with 3 flickering candles that can be blown out |
| `party_confetti` | `renderPartyConfetti` | `src/assets/props/partyConfetti.ts` | Colorful crayon ribbons, stars & paper diamonds at 6 FPS |
| `pizza_slice` | `renderPizzaSlice` | `src/assets/props/pizzaSlice.ts` | Warm cheesy pepperoni pizza slice with steam (`variant: 1`) or open pizza counter box (`variant: 2`) |
| `campfire` | `renderCampfire` | `src/assets/props/campfire.ts` | Striped medieval knight's tent & crackling log campfire with flickering crayon flames |
| `spooky_tree` | `renderSpookyTree` | `src/assets/props/spookyTree.ts` | Gnarled Whispering Woods tree with peeking golden firefly eyes |
| `dragon_fire` | `renderDragonFire` | `src/assets/props/dragonFire.ts` | Swirling red/orange/yellow crayon flame plume & golden star clash sparks |

### PropNode-specific fields

| Field | Type | Description |
|---|---|---|
| `kind` | `PropKind` | Which prop to render |
| `variant?` | `number` | Variant index or seed for trees, grass patches, stars, notes |
| `count?` | `number` | Number of items to emit (star count, note count, puff count, etc.) |
| `lit?` | `boolean` | Lantern glow or active prop toggle (e.g., birthday cake candles) |
| `bounds?` | `FillMaskBounds` | Optional bounding box for progressive fill mask |

---

## 4. Crayon Fill Patterns (21 patterns)

All patterns are defined in `src/engine/filters.ts` and referenced via `TOKENS.patterns.*` keys.

### Marker Wash (1)

| Token key | SVG pattern ID | Base color |
|---|---|---|
| `markerIndigoNight` | `pat-marker-indigo-night` | `#2E3B6E` (indigo night sky) |

### Dry Crayon & Oil Pastel (20)

| Token key | SVG pattern ID | Base color | Accent color | Angle |
|---|---|---|---|---|
| `crayonTerracotta` | `pat-crayon-terracotta` | `#C84B31` | `#A63822` | -28° |
| `crayonOchre` | `pat-crayon-ochre` | `#E3B464` | `#EED08A` | -22° |
| `crayonWarmMoon` | `pat-crayon-warm-moon` | `#F0C243` | `#E58B3A` | 28° |
| `crayonSunsetOrange` | `pat-crayon-sunset-orange` | `#E87A3E` | `#F29F4B` | varies |
| `crayonGrassGreen` | `pat-crayon-grass-green` | `#6B9E58` | varies | varies |
| `crayonTreeGreen` | `pat-crayon-tree-green` | `#588A47` | varies | varies |
| `crayonStoreTeal` | `pat-crayon-store-teal` | `#5B8E8D` | varies | varies |
| `crayonAwningRed` | `pat-crayon-awning-red` | `#D15B47` | varies | varies |
| `crayonDressPink` | `pat-crayon-dress-pink` | `#E8A5B8` | varies | varies |
| `crayonNightcapBlue` | `pat-crayon-nightcap-blue` | `#6A9EC0` | varies | varies |
| `crayonWoodBrown` | `pat-crayon-wood-brown` | `#8A5A3B` | varies | varies |
| `crayonWindowGlow` | `pat-crayon-window-glow` | `#F4CA44` | varies | varies |
| `crayonSkyBlue` | `pat-crayon-sky-blue` | `#9CCEF4` | `#B6DDF9` | varies |
| `crayonMeadowGreen` | `pat-crayon-meadow-green` | `#93C969` | varies | varies |
| `crayonRadishRed` | `pat-crayon-radish-red` | `#EE4B2B` | varies | varies |
| `crayonEmeraldFrond` | `pat-crayon-emerald-frond` | `#149658` | varies | varies |
| `crayonBananaYellow` | `pat-crayon-banana-yellow` | `#FFCE34` | varies | varies |
| `crayonRoyalBlue` | `pat-crayon-royal-blue` | `#2541B2` | varies | varies |
| `crayonCatBlue` | `pat-crayon-cat-blue` | `#79C2F2` | varies | varies |
| `crayonWatermelonPink` | `pat-crayon-watermelon-pink` | `#F25268` | varies | varies |
| `crayonCherryRose` | `pat-crayon-cherry-rose` | `#F26B8A` | varies | varies |

### Paper Fleck Mask (1)

| Token key | SVG pattern ID | Purpose |
|---|---|---|
| `paperFlecks` | `pat-paper-flecks` | Dry-brush grain mask that punches tiny paper-colored flecks out of solid crayon fills |

---

## 5. Full TypeScript Interfaces

### SceneDefinition

```typescript
interface SceneDefinition {
  id: string;
  title: string;
  subtitle?: string;
  durationSec: number;
  width?: number;              // default: 1280
  height?: number;             // default: 720
  fps?: number;                // default: 6
  vibrantMode?: boolean;       // enables Vibrant Crayon Mode
  bookFrame?: BookFrameConfig | boolean; // Storybook Cover Opening & Ending/Credits Book-Frame (default: true)
  acts: StoryAct[];
  nodes: SceneNode[];
  timeline: TimelineTrack[];
  camera?: CameraKeyframe[];
  audioCues?: AudioNoteCue[];
  audioClips?: AudioClipCue[]; // External/generated audio clips (e.g., TTS narration, WAV/MP3)
}
```

### BookFrameConfig, BookFramePhase & EvaluatedBookFrameState (`src/engine/bookFrame.ts`)

```typescript
type BookFramePhase = 'opening' | 'story' | 'closing';

interface BookFrameConfig {
  enabled?: boolean;                // default: true
  coverTitle?: string;              // defaults to scene.title
  coverSubtitle?: string;           // defaults to scene.subtitle
  creditText?: string;              // optional author/illustrator credit shown on front/back cover
  endingTitle?: string;             // defaults to 'The End ★'
  endingCredit?: string;            // defaults to scene.title + optional credit line
  coverMaterial?: CrayonMaterialId; // default: 'crayonTerracotta'
  accentMaterial?: CrayonMaterialId;// optional accent crayon fill
  openDurationSec?: number;         // default: 3.5 (opening cover flip + 0%->100% color-in zoom)
  closeDurationSec?: number;        // default: 3.5 (100%->0% color-out zoom-out + ending cover close)
}

interface EvaluatedBookFrameState {
  enabled: boolean;
  phase: BookFramePhase;
  coverOpenProgress: number;        // 0 = closed front cover, 1 = cover fully open to reveal pages
  coverCloseProgress: number;       // 0 = pages open, 1 = back/ending cover fully closed
  bookScale: number;                // 0.68 when viewing open book spread -> 1.0 when zoomed into story
  colorFillMultiplier: number;      // 0.0 -> 1.0 during opening zoom-in, 1.0 in story, 1.0 -> 0.0 during closing zoom-out
  coverTitle: string;
  coverSubtitle: string;
  creditText: string;
  endingTitle: string;
  endingCredit: string;
  coverMaterial: CrayonMaterialId;
}
```

### StoryAct

```typescript
interface StoryAct {
  id: string;
  title: string;
  startTime: number;           // seconds
  endTime: number;             // seconds
  caption: string;
}
```

### SceneNode (union)

```typescript
type SceneNode =
  | BackgroundPatchNode
  | BuildingNode
  | CharacterNode
  | PropNode
  | AnnotationNode;
```

### BaseSceneNode (shared by all nodes)

```typescript
interface BaseSceneNode extends ProgressiveFillOptions {
  id: string;
  zIndex: number;
  x: number;
  y: number;
  scale?: number;              // default: 1
  rotate?: number;             // degrees
  flipX?: boolean;
  opacity?: number;            // 0..1
  visible?: boolean;           // default: true
}
```

### ProgressiveFillOptions

```typescript
interface ProgressiveFillOptions {
  fillStyle?: FillMaskStyle;     // 'top-down-bands' | 'diagonal-strokes' | 'radial-scribble'
  fillProgress?: number;        // 0..1, default: 1 (fully colored)
  fillSteps?: number;           // default: 10
  wrapRightNegativeSpace?: boolean;  // sky wrapping for moon
}
```

### BackgroundPatchNode

```typescript
interface BackgroundPatchNode extends BaseSceneNode {
  type: 'background_patch';
  d: string;                   // SVG path data for organic vignette patch
  bounds: FillMaskBounds;      // { x, y, width, height } for fill mask
  material: CrayonMaterialId;  // key into TOKENS.patterns
  outlined?: boolean;          // charcoal outline toggle
}
```

### CharacterNode

```typescript
interface CharacterNode extends BaseSceneNode {
  type: 'character';
  kind: CharacterKind;
  state: CharacterState;
  wearingNightcap?: boolean;   // Moon only
  holdingSheep?: boolean;      // Little girl only
  holdingPizza?: boolean;      // Little girl only
  speechText?: string;         // Character-attached bubble text (pass "" in keyframe to clear)
  speechStyle?: 'speech' | 'thought';
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
}
```

### BuildingNode

```typescript
interface BuildingNode extends BaseSceneNode {
  type: 'building';
  kind: BuildingKind;
  windowLit?: boolean;
  showLadder?: boolean;
  signText?: string;           // corner_store only (default: 'LUNE STORE')
  bounds?: FillMaskBounds;
}
```

### PropNode

```typescript
interface PropNode extends BaseSceneNode {
  type: 'prop';
  kind: PropKind;
  variant?: number;
  count?: number;
  lit?: boolean;
  bounds?: FillMaskBounds;
}
```

### AnnotationNode

```typescript
type BubbleStyle = 'none' | 'speech' | 'thought';
type BubbleTailDirection = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'left' | 'right';

interface AnnotationNode extends BaseSceneNode {
  type: 'annotation';
  text?: string;               // hand-lettered text (supports multi-line with '\n')
  dashedPath?: string;         // hand-drawn dashed motion path SVG `d`
  color?: ColorToken | string;
  fontSize?: number;
  bubbleStyle?: BubbleStyle;   // 'none' | 'speech' | 'thought'
  tailDirection?: BubbleTailDirection; // 'bottom-center' | 'bottom-left' | 'bottom-right' | 'left' | 'right'
  bubbleFill?: ColorToken | string;    // default: TOKENS.colors.paperWarm
  anchorAtTailTip?: boolean;   // when true, (0, 0) is the tip of the tail/puff above a character's head
}
```

### NodeKeyframe

```typescript
interface NodeKeyframe {
  time: number;                // seconds (quantized to stepped clock)
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
  visible?: boolean;
  state?: CharacterState;
  fillProgress?: number;       // 0..1
  windowLit?: boolean;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  holdingPizza?: boolean;
  speechText?: string;         // character-attached speech/thought bubble text (pass "" to clear)
  speechStyle?: 'speech' | 'thought';
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
  lit?: boolean;
  count?: number;
  text?: string;               // dynamically updates annotation text
  bubbleStyle?: BubbleStyle;
  tailDirection?: BubbleTailDirection;
  hold?: boolean;              // step-hold: holds value until next keyframe
}
```

### TimelineTrack

```typescript
interface TimelineTrack {
  nodeId: string;              // references SceneNode.id
  keyframes: NodeKeyframe[];   // sorted by time ascending
}
```

### CameraKeyframe

```typescript
interface CameraKeyframe {
  time: number;                // seconds
  x: number;                   // pan offset X in canvas coords (default: 0)
  y: number;                   // pan offset Y in canvas coords (default: 0)
  zoom: number;                // zoom factor (default: 1)
  hold?: boolean;              // step-hold
}
```

### AudioNoteCue

```typescript
interface AudioNoteCue {
  time: number;                // seconds
  freq: number;                // frequency in Hz
  duration: number;            // seconds
  kind?: AudioCueKind;
}
```

### AudioClipCue

```typescript
interface AudioClipCue {
  id?: string;
  src: string;                 // URL or path (e.g. '/audio/narration.mp3')
  startTime: number;           // scene time in seconds when clip starts
  duration?: number;           // optional max duration to play
  offsetSec?: number;          // optional offset into source file (default: 0)
  volume?: number;             // gain multiplier 0.0–2.0 (default: 1.0)
  label?: string;              // optional human-readable label
}
```

### AudioCueKind

```typescript
type AudioCueKind =
  | 'lullaby'
  | 'crayon_scribble'
  | 'chime'
  | 'party_horn'
  | 'confetti_pop'
  | 'cheer_applause'
  | 'candle_blow'
  | 'giggle'
  | 'birthday_song';
```

---

## 6. CharacterRenderOptions (internal)

```typescript
interface CharacterRenderOptions {
  kind: CharacterKind;
  state: CharacterState;
  frameIndex?: number;         // stepped 6 FPS frame index (line-boil seed)
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  fillMask?: string;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
}
```

---

## 7. SVG Utility Functions (`src/engine/svgUtils.ts`)

| Function | Signature | Purpose |
|---|---|---|
| `svgEl` | `(tag, attrs?, children?) → string` | Pure SVG element string builder |
| `svgAttrs` | `(attrs) → string` | Formats attribute dictionary to SVG string |
| `crayonStrokeAttrs` | `(options?) → SvgAttrMap` | Returns standard charcoal pencil outline attributes from TOKENS |
| `crayonPath` | `(d, fill, options?) → string` | Renders a `<path>` with textured fill and charcoal outline; supports `mask` for progressive fill |
| `svgTransform` | `(opts) → string` | Builds SVG transform string (translate, rotate, scale, flipX) |
| `round2` | `(v) → number` | Rounds to 2 decimal places |
| `clamp01` | `(v) → number` | Clamps value to [0, 1] |
| `quantizeStep` | `(v, steps) → number` | Quantizes continuous [0..1] into discrete stop-motion steps |
| `deterministicJitter` | `(index, seed, amplitude?) → number` | Deterministic pseudo-random jitter for hand-drawn wobble |

---

## 8. TOKENS Color Palette Quick Reference

### Paper & Outline
| Token | Hex | Usage |
|---|---|---|
| `paperWarm` | `#F4EFE6` | Primary background — warm off-white watercolor paper |
| `paperShadow` | `#EDE6D6` | Paper shadow areas |
| `paperDeep` | `#E2D9C5` | Darker paper recesses |
| `charcoalOutline` | `#2B231D` | All outlines — charcoal/sepia pencil |
| `faintPencil` | `#4A4238` | Faint pencil annotations |

### Night & Indigo
| Token | Hex | Usage |
|---|---|---|
| `indigoNight` | `#2E3B6E` | Night sky marker wash fill |
| `indigoNightDark` | `#222C56` | Darker indigo accents |
| `indigoNightLight` | `#3D4D87` | Lighter indigo highlights |

### Architecture & Warm Tones
| Token | Hex | Usage |
|---|---|---|
| `terracottaRoof` | `#C84B31` | Cottage roof |
| `terracottaDark` | `#A63822` | Darker terracotta accents |
| `ochreWall` | `#E3B464` | Cottage wall, building bases |
| `ochreLight` | `#EED08A` | Lighter ochre highlights |
| `warmMoon` | `#F0C243` | Moon body & warm glows |
| `moonCheek` | `#E58B3A` | Moon/sun cheek accents |
| `sunsetOrange` | `#E87A3E` | Sunset sky |
| `sunsetGold` | `#F29F4B` | Sunset gold accents |

### Characters & Objects
| Token | Hex | Usage |
|---|---|---|
| `nightcapBlue` | `#6A9EC0` | Moon's nightcap |
| `nightcapWhite` | `#F2EDE2` | Nightcap white stripes |
| `grassGreen` | `#6B9E58` | Grass patches |
| `treeGreen` | `#588A47` | Tree foliage |
| `curtainPink` | `#E5989B` | Window curtains |
| `windowGlow` | `#F4CA44` | Warm window glow |
| `dressPink` | `#E8A5B8` | Little girl's dress |
| `hairBrown` | `#6D4C3D` | Little girl's hair |
| `storeTeal` | `#5B8E8D` | Corner store body |
| `storeAwningRed` | `#D15B47` | Corner store awning |
| `woodBrown` | `#8A5A3B` | Crate, door, ladder |
| `starWhite` | `#F6F2E9` | Star fill |

### Vibrant Daylight & Meadow Palette
| Token | Hex | Usage |
|---|---|---|
| `skyPastelBlue` | `#9CCEF4` | Vibrant sky base |
| `skyPastelLight` | `#B6DDF9` | Sky highlight |
| `meadowGreen` | `#93C969` | Meadow hill grass |
| `meadowHorizonRose` | `#C86D78` | Rose-toned meadow horizon contour |
| `radishRed` | `#EE4B2B` | Singing Radish body |
| `emeraldFrond` | `#149658` | Green leaf fronds |
| `bananaYellow` | `#FFCE34` | Party Banana body |
| `royalCrayonBlue` | `#2541B2` | Royal blue accents |
| `catLightBlue` | `#79C2F2` | Blue Party Cat body |
| `watermelonPink` | `#F25268` | Watermelon Slice flesh |
| `cherryRose` | `#F26B8A` | Cherry Twins body |
| `cloudWhite` | `#FAF8F4` | Fluffy Cloud fill |
| `cutoutHaloWhite` | `#FAF8F2` | Cutout sticker halo |
| `cobaltStarBlue` | `#1D63DC` | Cobalt star accents |

---

## 9. SCENE_REGISTRY & URL Routing

```typescript
// src/ui/app.ts
export const SCENE_REGISTRY: Record<ShortSampleId, SceneDefinition> = {
  '1': SHORT_SAMPLE_1_SCENE,    // 30s, 5 acts, Sun→Moon story
  '2': MOONLIGHT_STORY_SCENE,   // 28s, 5 acts, LUNE STORE + Ochre Cottage
  '3': MEADOW_PARTY_SCENE,      // 24s, 4 acts, vibrantMode:true, Birthday Party
};
```

### URL query parameters

| Parameter | Values | Effect |
|---|---|---|
| `?short_sample=` | `1`, `2`, `3`, `birthday` | Select scene (`birthday` → scene 3) |
| `?scene=` | `<sceneId>` | Select scene by its `id` field |
| `?footage=` | Act ID or alias (e.g., `morning`, `arrival`, `song`, `cake`, `act-1`) | Loop a single act |
| `?vibrant=` | `1` or `0` | Override Vibrant Crayon Mode |
| `?book_frame=` | `1` or `0` | Override Storybook Cover Opening & Ending/Credits Book-Frame (`#chk-book-frame`, default `1`) |
| `?t=` | `<seconds>` | Seek to a specific time |
| `?autoplay=` | `1` or `0` | Auto-start playback |
| `?auto_export=` | `1` | Automatically export 16:9 `.mp4` on mount and save to `<workspace>/exports/` |
| `?resolution=` | `1080p` or `720p` | Export resolution for `?auto_export=1` (default: `1080p`) |

---

## 10. AssetCatalogItem Interface

```typescript
interface AssetCatalogItem {
  id: string;
  title: string;
  category: 'Building' | 'Character' | 'Prop';
  caption: string;
  viewBox: string;
  jumpToTimeSec: number;
  states?: CharacterState[];
  defaultState?: CharacterState;
  renderInner: (frameIndex: number, state?: CharacterState) => string;
}
```

To add a new asset to the interactive Studio catalog, push an entry to `ASSET_CATALOG_ITEMS` in `src/ui/app.ts`.

# Animated Picture Book Studio — Engine Architecture (Dual-Style Pipeline)

## 1. Overview
The **Animated Picture Book Studio Engine** is a declarative 2D SVG/HTML5 animation and video export engine built in strict TypeScript supporting **two distinct, fully isolated visual styles** (`artStyle: AnimationStyleId = 'crayon' | 'classic_cel'`):
1. **Picture-Book Crayon Style (`artStyle: 'crayon'`, default)**: Emulates physical wax crayons, oil pastels, and felt-tip marker washes on heavy cold-press watercolor paper, quantized to a stepped stop-motion frame rate (`6 FPS`), with an optional **Vibrant Crayon Mode** (`#vibrant-grade`) and an automatic **Storybook Cover Opening & Ending/Credits Book-Frame** (`bookFrame`, enabled by default).
2. **Classic 1970s–1980s Hand-Drawn Cel Animation Style (`artStyle: 'classic_cel'`, Studio route `/classic/...`)**: Emulates authentic theatrical Disney Xerox-era hand-drawn shorts (*Robin Hood* 1973, *Mickey's Christmas Carol* 1983, *The Aristocats* 1970) — pairing **dappled, loose watercolor/gouache illustration-board backgrounds** (Layer 1A: `#gouache-wash`, `gouacheDabWash`, `#bg-board-texture`) with **raw electrostatic Xerox graphite toner outlines** (`#xerox-ink`, `xeroxSketchStroke`) and **flat matte analog cel paint foreground characters** (Layer 1B: subtle rostrum cel separation `#cel-drop-shadow`, `celContactShadow`), quantized to **`12 FPS` ("on twos")** inside a **`24 FPS`** theatrical MP4 film container, graded with warm earthy Eastmancolor `#cel-grade`, finished with **tangible animated 35mm celluloid film grain & warm film-gate vignette** (`renderFilmCompositeLayer`), and framed by classic **Theatrical Iris/Fade Opening & `"The End"` Closing Cards** (`theatricalFrame`, enabled by default; `bookFrame` disabled by default).

## 2. Directory Structure & Modules
- `src/theme/tokens.ts` — Single source of truth (`TOKENS`) for both visual styles:
  - **Crayon tokens (`TOKENS.*`)**: Paper tones, charcoal outlines, sunset/nightfall washes, vibrant meadow cutout tones, stroke widths, SVG filter parameters (`#crayon-stroke`, `#crayon-outline`, `#vibrant-grade`), 22 dry-crayon + marker pattern IDs, quantized frame rates (`6 FPS`), and 16:9 widescreen canvas dimensions (`1280×720`, `aspectRatio: '16 / 9'`).
  - **Classic Cel tokens (`TOKENS.classicCel.*`)**: Earthy, slightly muted 1970s Eastmancolor physical paint pigments (warm theatrical backdrop, Xerox graphite toner `#221D1A` / soft sepia ink, parchment cel cream, antique gold titles, dappled gouache night sky/woodland/earth/stone/water/cottage/lantern palettes, flat analog Mochi & Moon cel pigments, zero pure `#000000`/`#FFFFFF`), Xerox stroke weights, `12 FPS` / `24 FPS` container timing, classic cel filter IDs (`#xerox-ink`, `#gouache-wash`, `#bg-board-texture`, `#cel-drop-shadow`, `#cel-soft-glow`, `#cel-grade`, `#film-grain`, `#film-vignette`), and serif/dialogue typography — plus `svgUrl()` helper.
- `src/engine/` — Core rendering, timing, scene evaluation, and 16:9 video export primitives:
  - `src/engine/svgUtils.ts` — Pure SVG string builders (`svgAttrs`, `svgEl`, `svgTransform`, `round2`, `clamp01`, `quantizeStep`, `deterministicJitter`), Crayon primitives (`crayonStrokeAttrs`, `crayonPath`), and Classic Cel / Gouache primitives (`celStrokeAttrs`, `celPath` with `useXeroxFilter: true` by default, `xeroxSketchStroke` for broken/feathery pencil fur/cloth/grass ticks, `celShadedShape`, `gouachePath`, `gouacheDabWash` for dappled watercolor/gouache foliage & sky brushwork, `celContactShadow`).
  - `src/engine/filters.ts` — Dual-style SVG `<defs>` generator (`renderEngineDefs`, `getPatternFill`) and Layer 3 composites:
    - In `'crayon'` mode: `#crayon-stroke`, `#crayon-outline`, `#paper-texture`, `#vibrant-grade`, 22 dry-crayon `<pattern>` fills + `#pat-marker-indigo-night`, and `renderPaperCompositeLayer(width, height, enablePaperTexture, vibrant)` (`#layer-3-paper-composite`).
    - In `'classic_cel'` mode: dual-pass electrostatic `#xerox-ink` (organic wobble + fine toner paper-grit cycling with the stepped clock), painterly `#gouache-wash` (brush-mottle displacement + gentle rostrum optical softness), `#bg-board-texture` (heavy watercolor illustration-board tooth for Layer 1A backgrounds), `#cel-drop-shadow` (physical acetate cel hover shadow), restrained `#cel-soft-glow` (physical 35mm optical halation), warm earthy Eastmancolor `#cel-grade`, animated `#film-grain`, `#film-vignette`, flat opaque fallback cel patterns, and `renderFilmCompositeLayer(width, height, enableFilmGrain)` (`#layer-3-film-composite`).
  - `src/engine/fillMask.ts` — Stop-motion progressive fill mask generator (`quantizeFillProgress`, `renderFillMaskDef`) supporting `'top-down-bands'`, `'diagonal-strokes'`, and `'radial-scribble'`.
  - `src/engine/clock.ts` — Quantized stepped clock (`evaluateSteppedClock`, `steppedOscillate`, `isSteppedBlinkFrame`, `steppedLoopProgress`) converting continuous playback time into discrete `6 FPS` (`crayon`) or `12 FPS` (`classic_cel`) frame indices and line-boil seeds.
  - `src/engine/bookFrame.ts` — Picture-Book Crayon Storybook Cover Opening & Ending/Credits Book-Frame (`BookFrameConfig`, `evaluateBookFrameState`, `renderBookFrameOverlay`). Enabled by default in `'crayon'`, disabled by default in `'classic_cel'`.
  - `src/engine/theatricalFrame.ts` — Classic Hand-Drawn Cel Theatrical Framing (`TheatricalFrameConfig`, `TheatricalFramePhase`, `TheatricalTransitionMode: 'iris' | 'fade'`, `EvaluatedTheatricalFrameState`, `evaluateTheatricalFrameState`, `renderTheatricalFrameOverlay`). Frames `'classic_cel'` scenes with a circular iris-in or warm fade-in + gold-serif opening title card (`#theatrical-opening-title`, default `3.0s`), full-bleed `'story'` pass-through, and closing iris-out centered on `irisFocus` + gold-serif `"The End"` card (`#theatrical-ending-card`, default `3.0s`).
  - `src/engine/schema.ts` — TypeScript interfaces for declarative scenes: `AnimationStyleId = 'crayon' | 'classic_cel'`, `SceneDefinition` (with `artStyle?: AnimationStyleId`, `vibrantMode?: boolean`, `bookFrame?: BookFrameConfig | boolean`, `theatricalFrame?: TheatricalFrameConfig | boolean`, `audioClips?: AudioClipCue[]`), `BackgroundPatchNode` (supporting `fill?: string`, `gradient?: BackgroundPatchGradient`, `softEdge?: boolean` for painted `classic_cel` gouache washes), `BuildingNode`, `CharacterNode` (21 character kinds), `PropNode` (31 prop kinds), `AnnotationNode` (with `artStyle?: AnimationStyleId`), `CameraKeyframe`, `NodeKeyframe`, `TimelineTrack`, and `AudioCueKind` (19 kinds).
  - `src/engine/timeline.ts` — Stepped keyframe evaluator (`evaluateSceneAtTime`, `interpolateKeyframes`, `evaluateCameraTrack`, `evaluateActiveAct`) snapping `timeSec` via `evaluateSteppedClock` at the active scene FPS (`6` or `12`).
  - `src/engine/renderer.ts` — Dual-style declarative SVG scene graph renderer (`evaluateAndRenderScene`, `renderSceneToSvg`, `RenderSceneOptions` with `artStyle?`, `enableTheatricalFrame?`, `enableBookFrame?`, `fps?`). Emits `data-art-style`, `data-book-phase`, and `data-theatrical-phase` on root `<svg>`, switches `#paper-base` ↔ `#cel-backdrop`, generates `<linearGradient>`/`<radialGradient>` `<defs>` for `classic_cel` `background_patch` nodes, dispatches `artStyle` to all building/character/prop/annotation renderers, and composites `#layer-3-paper-composite` (`crayon`) vs. `#layer-3-film-composite` (`classic_cel`).
  - `src/engine/videoExporter.ts` — Full-screen 16:9 widescreen seekable `.mp4` video & WebAudio exporter (`exportSceneTo16x9Video`, `patchMp4Duration`, `VIDEO_RESOLUTION_PRESETS` for `1080p` `1920×1080` and `720p` `1280×720`). Uses `mp4-muxer` (`fastStart: 'in-memory'`) + WebCodecs (`VideoEncoder` H.264 + `AudioEncoder` AAC). Automatically picks container FPS via `fps === 6 ? 30 : 24 % fps === 0 ? 24 : 30`: **`30 FPS`** container for `6 FPS` crayon scenes and theatrical **`24 FPS`** film container for **`12 FPS` classic cel scenes** (holding each drawn cel cleanly on twos), mixing both `audioCues` and `audioClips` via `renderOfflineAudio()`.
- `src/assets/` — Modular, token-driven SVG asset primitives split into dedicated category folders (one file per asset):
  - `src/assets/buildings/` (and barrel `src/assets/buildings.ts`) — `renderBuilding()` plus individual building modules:
    - `src/assets/buildings/ochreCottage.ts` (`renderOchreCottage` — Cute & Cozy Cottage with scalloped terracotta roof, welcome wreath door, overflowing flower boxes, shutters, climbing garden vines & optional ladder)
    - `src/assets/buildings/cornerStore.ts` (`renderCornerStore`, "LUNE STORE")
    - `src/assets/buildings/royalCastle.ts` (`renderRoyalCastle` — Royal Crayon Stone Castle with twin crenellated towers, conical roofs, golden star flags, portcullis gate & festive bunting)
    - `src/assets/buildings/scorchedCottage.ts` (`renderScorchedCottage` — Scorched Village Cottage with soot marks, crooked roof tiles, tilted shutter & rising smoke wisps)
    - `src/assets/buildings/types.ts` & `src/assets/buildings/index.ts`
  - `src/assets/characters/` (and barrel `src/assets/characters.ts`) — `renderCharacter()` plus 19 standalone 2D cutout character rig modules and shared helpers:
    - `src/assets/characters/littleGirl.ts` (`renderLittleGirl` — wavy brown hair with pink hairclip, purple star sweater, cream wide-leg trousers, white sneakers, dedicated 3/4 `+X` walking profile, plus `holdingSheep` and `holdingPizza` support)
    - `src/assets/characters/moon.ts` (`renderMoon` — Storybook Crescent Moon with dangling & twinkling companion stars, expressive faces, and full-brim nightcap)
    - `src/assets/characters/sun.ts` (`renderSun`)
    - `src/assets/characters/shopkeeper.ts` (`renderShopkeeper`)
    - `src/assets/characters/cat.ts` (`renderCat` — soft white-and-tabby patched kitten across `idle`, `curious`/`walking`, `waving`, and `sleeping` states)
    - `src/assets/characters/knight.ts` (`renderKnight` — Sir Leo the Brave Crayon Knight both on horseback `mounted: true` and on foot `mounted: false`, including mounting `climbing`, camp-log `sitting`, and low crouched upward spear-reach `reaching` facing `+X`)
    - `src/assets/characters/soldier.ts` (`renderSoldier` — Royal Soldier both on horseback `mounted: true` and on foot `mounted: false`, including mounting `climbing` and camp-log `sitting` facing `+X`)
    - `src/assets/characters/dragon.ts` (`renderDragon` — Barnaby the Cute Storybook Forest Dragon facing `+X`, with emerald-green body, ochre belly, scalloped wings, crooked tooth with bramble, elevated fire puff & dizzy stars)
    - `src/assets/characters/villager.ts` (`renderVillager` — Castle Herald & Medieval Villager facing `+X`, with feathered beret cap, terracotta/sage tunic & herald scroll)
    - `src/assets/characters/singingRadish.ts` (`renderSingingRadish`)
    - `src/assets/characters/birthdayStrawberry.ts` (`renderBirthdayStrawberry`)
    - `src/assets/characters/watermelonSlice.ts` (`renderWatermelonSlice`)
    - `src/assets/characters/bluePartyCat.ts` (`renderBluePartyCat`)
    - `src/assets/characters/helloBug.ts` (`renderHelloBug`)
    - `src/assets/characters/partyBanana.ts` (`renderPartyBanana`)
    - `src/assets/characters/cryingOnion.ts` (`renderCryingOnion`, classic worried teardrops in `'idle'` and happy cheering smile in `'waving' | 'singing'`)
    - `src/assets/characters/cherryTwins.ts` (`renderCherryTwins`)
    - `src/assets/characters/acornTwins.ts` (`renderAcornTwins`)
    - `src/assets/characters/oliveSprout.ts` (`renderOliveSprout`)
    - `src/assets/characters/moonlitCat.ts` (`renderMoonlitCat` — Mochi the slate-blue & lavender tabby cat with crescent-moon collar charm, `+X` 3/4 walking profile & stepped 6 FPS speaking mouth)
    - `src/assets/characters/bandanaDog.ts` (`renderBandanaDog` — Biscuit the photo-modeled shaggy golden doodle puppy with crimson red bandana, white chest patch, floppy ears, `+X` 3/4 walking profile & stepped 6 FPS speaking mouth)
    - `src/assets/characters/shared.ts` (`renderCutoutStickerHalo`, `renderSheepPlushie`), `src/assets/characters/types.ts` (including `isSpeaking?: boolean`), & `src/assets/characters/index.ts` (including `CHARACTER_SPEECH_ANCHORS` and 2.5D `wearingFloatie` waist swim-ring + frothy ocean-water skirt rigging across all characters)
  - `src/assets/props/` (and barrel `src/assets/objects.ts`) — `renderProp()` plus 30 standalone prop modules and shared star/floatie geometry helpers:
    - `src/assets/props/grassPatch.ts` (`renderGrassPatch`)
    - `src/assets/props/tree.ts` (`renderTree`)
    - `src/assets/props/musicNotes.ts` (`renderMusicNotes`)
    - `src/assets/props/starCluster.ts` (`renderStarCluster`)
    - `src/assets/props/pencilNumbers.ts` (`renderPencilNumbers`)
    - `src/assets/props/appleCrate.ts` (`renderAppleCrate`)
    - `src/assets/props/streetLantern.ts` (`renderStreetLantern`)
    - `src/assets/props/chimneyPuffs.ts` (`renderChimneyPuffs`)
    - `src/assets/props/bicycle.ts` (`renderBicycle`)
    - `src/assets/props/fluffyCloud.ts` (`renderFluffyCloud`)
    - `src/assets/props/meadowFlowers.ts` (`renderMeadowFlowers`)
    - `src/assets/props/birthdayCake.ts` (`renderBirthdayCake`)
    - `src/assets/props/partyConfetti.ts` (`renderPartyConfetti`)
    - `src/assets/props/beachUmbrella.ts` (`renderBeachUmbrella`)
    - `src/assets/props/oceanWaves.ts` (`renderOceanWaves`)
    - `src/assets/props/waterSplash.ts` (`renderWaterSplash`)
    - `src/assets/props/swimFloatie.ts` (`renderSwimFloatie`, `renderSwimFloatieRing`)
    - `src/assets/props/beachBall.ts` (`renderBeachBall`)
    - `src/assets/props/pizzaSlice.ts` (`renderPizzaSlice`, `renderHandheldPizzaSlice`)
    - `src/assets/props/campfire.ts` (`renderCampfire` — Multi-tent medieval woodland camp with tethered horses, sitting logs, crackling campfire & roasting meat spit with steam curls)
    - `src/assets/props/spookyTree.ts` (`renderSpookyTree` — Gnarled Whispering Woods tree with peeking golden firefly eyes)
    - `src/assets/props/dragonFire.ts` (`renderDragonFire` — Elevated swirling red/orange/yellow crayon flame stream & golden star clash sparks)
    - `src/assets/props/windChimeArbor.ts` (`renderWindChimeArbor` — Arched wooden moonflower trellis with swaying brass/silver wind chimes)
    - `src/assets/props/gardenFountain.ts` (`renderGardenFountain` — Mossy stone birdbath fountain with moonlit ripples & dancing fireflies)
    - `src/assets/props/dogTennisBall.ts` (`renderDogTennisBall` — Fuzzy yellow-green wax-crayon tennis ball with 6 FPS spin)
    - `src/assets/props/dogHouse.ts` (`renderDogHouse` — Cozy ochre backyard doghouse with terracotta shingle roof & bone nameplate)
    - `src/assets/props/dogBowl.ts` (`renderDogBowl` — Sky-blue pet dish with bone emblem & kibble mound)
    - `src/assets/props/brambleThorn.ts` (`renderBrambleThorn` — Oversized woody bramble thorn with curved barbs & sparkle-pop stars)
    - `src/assets/props/dragonCave.ts` (`renderDragonCave` — Layered crayon hillside cave arch with hiccup soot & thorny bramble bush)
    - `src/assets/props/feastTable.ts` (`renderFeastTable` — Waist-high medieval banquet table draped in red/gold cloth with pies, cake & candles)
    - `src/assets/props/celebrationBanner.ts` (`renderCelebrationBanner` — Wooden-pole pennant bunting arch with `"★ HUZZAH! ★"` ribbon)
    - `src/assets/props/shared.ts` (`renderStarShape`), `src/assets/props/types.ts`, & `src/assets/props/index.ts`
  - `src/assets/classicCel/` — Style-isolated Classic 1970s–1980s Hand-Drawn Cel asset library (dispatched cleanly by `renderCharacter`, `renderProp`, and `renderBuilding` whenever `options.artStyle === 'classic_cel'`):
    - `src/assets/classicCel/characters/` — `moonlitCat.ts` (`renderClassicMoonlitCat` — 2-tone cel-shaded Mochi with moonlight rim light, `celContactShadow`, 12 FPS stride, and 4-stage cel lip-sync mouth), `moon.ts` (`renderClassicMoon` — luminous gouache crescent moon with `#cel-soft-glow` & velvet nightcap), and `index.ts` (`CLASSIC_CEL_CHARACTER_RENDERERS`).
    - `src/assets/classicCel/buildings/` — `ochreCottage.ts` (`renderClassicOchreCottage` — painted timber-and-plaster storybook cottage with practical golden window spill & sketchy sepia ink), and `index.ts` (`CLASSIC_CEL_BUILDING_RENDERERS`).
    - `src/assets/classicCel/props/` — `windChimeArbor.ts` (`renderClassicWindChimeArbor`), `gardenFountain.ts` (`renderClassicGardenFountain` with animated ripples & glowing fireflies), `tree.ts` (`renderClassicTree`), `streetLantern.ts` (`renderClassicStreetLantern` Victorian wrought-iron lamp), `ambientGardenProps.ts` (`renderClassicFluffyCloud`, `renderClassicStarCluster`, `renderClassicMeadowFlowers`, `renderClassicGrassPatch`, `renderClassicMusicNotes`), and `index.ts` (`CLASSIC_CEL_PROP_RENDERERS`).
  - `src/assets/annotations/` — `src/assets/annotations/pencilAnnotation.ts` (`renderAnnotation`) and `src/assets/annotations/index.ts` for hand-lettered pencil annotations, dashed motion paths, rounded speech bubbles (`bubbleStyle: 'speech'`), and scalloped cloud thought bubbles (`bubbleStyle: 'thought'`), adapting cleanly between crayon pencil outlines (`artStyle: 'crayon'`) and clean cream cel bubbles (`#FBF7EE`) with Xerox charcoal borders (`artStyle: 'classic_cel'`).
  - `src/assets/index.ts` — Top-level barrel re-exporting all buildings, characters, props, and annotations.
- `src/scenes/` — Declarative story scenes:
  - `src/scenes/shortSample1.ts` — `SHORT_SAMPLE_1_SCENE` (`30s`, `6 FPS`, `1280×720` 16:9, routed via `?short_sample=1`), a 5-act picture-book child story from morning sun to sleepy orange sunset, walking into the house, sun-to-moon handoff, and rooftop lullaby.
  - `src/scenes/moonlightStory.ts` — `MOONLIGHT_STORY_SCENE` (`28s`, `6 FPS`, `1280×720` 16:9, routed via `?short_sample=2`), a 5-act picture-book story featuring `"LUNE STORE"`, the Ochre Cottage, and the Sleepy Moon.
  - `src/scenes/meadowParty.ts` — `MEADOW_PARTY_SCENE` (`24s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?short_sample=3` or `?short_sample=birthday`), a 4-act **Strawberry's Birthday Party** story (`arrival`, `song`, `cake`, `celebration`) where Singing Radish and all the cutout friends throw a birthday party for Birthday Strawberry, sing `"Happy Birthday to You"`, present a 2-tier Strawberry Birthday Cake whose candles Strawberry blows out at `t = 16.0s`, and celebrate with confetti, streamers, party horns, and cheers.
  - `src/scenes/cornerStoreDay.ts` — `CORNER_STORE_DAY_SCENE` (`32s`, `6 FPS`, `1280×720` 16:9, routed via `?scene=corner-store-day` or `?short_sample=4`), a 5-act **The Corner Store Pizza Run** storybook scene with `bookFrame` intro/outro, the Cute Cozy Cottage on the far left and `"LUNE STORE"` on the far right, the Little Girl and her tabby-patched Cat walking to the store, speech-bubble dialogue with the Shopkeeper, a `"Yum!! So cheesy! ★"` thought bubble while eating hot pizza, and walking back home under the Crescent Moon and twinkling stars.
  - `src/scenes/moonlitGarden.ts` — `MOONLIT_GARDEN_SCENE`, tranquil moonlit garden story (`?scene=moonlit-garden`).
  - `src/scenes/strawberryBeachBirthday.ts` — `STRAWBERRY_BEACH_BIRTHDAY_SCENE` (`46s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?scene=strawberry-beach-birthday`, `?scene=beach-birthday`, or `?short_sample=5`), a 5-act **Strawberry's Beach Birthday Splash** story (`beach-party`, `scared-of-water`, `floatie-water-play`, `sunset-shore`, `moonlight-goodbye`) featuring a sunny beach birthday & candle blow, shoreline wave scare & friends bringing floaties, 13s of ocean floatie splashing & beach-ball tossing, sunset-to-twilight exiting the water & stacking floaties on the sand, and moonrise with twinkling stars & waving goodbye at night.
  - `src/scenes/knightDragonQuest.ts` — `KNIGHT_DRAGON_QUEST_SCENE` (`66s`, `6 FPS`, `1280×720` 16:9, routed via `?scene=knight-dragon-quest`, `?scene=dragon-quest`, or `?short_sample=6`), a 5-act **Sir Leo & the Dragon of Whispering Woods** fantasy adventure (`act-1-castle-call`, `act-2-campfire-night`, `act-3-destroyed-village`, `act-4-dragon-battle`, `act-5-victory-parade`) featuring on-foot and horseback rigs (`mounted?: boolean`), mounting/dismounting transitions, a multi-tent woodland campfire with roasting meat spit and spooky ghost stories, surrounding Barnaby the Dragon on foot while Sir Leo ducks under the overhead fire stream to pop the thorny bramble from the Dragon's tooth with his spear, and a Castle Street Victory Parade with full medieval score & sound effects.
  - `src/scenes/starterMoonlitCat.ts` — `STARTER_MOONLIT_CAT_SCENE` (`30s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?scene=starter-moonlit-cat`), **Mochi's Moonlit Garden** — a 4-act narrated bedtime adventure following `moonlit_cat` from a wind-chime arbor to a secret firefly moon fountain with custom lullaby waltz BGM, wind-chime SFX, and Gemini TTS narration + meows.
  - `src/scenes/classicMoonlitCat.ts` — `CLASSIC_MOONLIT_CAT_SCENE` (`30s`, `artStyle: 'classic_cel'`, `12 FPS` on twos / `24 FPS` MP4 container, `1280×720` 16:9, `bookFrame: false`, `theatricalFrame` iris opening & `"The End"` card, routed via `?scene=classic-moonlit-cat`), **Mochi's Moonlit Garden (Classic Cel)** — a faithful 1970s–1980s Disney hand-drawn cel & painted gouache recreation of all 4 acts and Zone A → Zone B with lush multiplane sky/woodland/lawn/lane gradients, classic cel character/prop/building rigs (`src/assets/classicCel/`), and all 6 existing lullaby & Gemini TTS WAV clips.
  - `src/scenes/starterBandanaDog.ts` — `STARTER_BANDANA_DOG_SCENE` (`38s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?scene=starter-bandana-dog`), **Biscuit's Sunny Day** — a 3-act photo-modeled dog storybook featuring `bandana_dog` exploring a sunny backyard, playing fetch in the park, and heading home at golden afternoon with expressive Gemini TTS voiceover, playful bark/bounce SFX, and 3-section dynamic BGM.
  - `src/scenes/starterKnightDragonHiccups.ts` — `STARTER_KNIGHT_DRAGON_HICCUPS_SCENE` (`54s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?scene=starter-knight-dragon-hiccups`), **The Dragon's Fiery Hiccups** — a 4-act text-bubble-only medieval comedy (zero voiceover narration) where the knight & soldiers discover the dragon's toothache hiccups, pull out the giant bramble thorn, and return to the castle for a sunset feast with dynamic 4-act comedy BGM and `dragon_hiccup` / `knight-hiccups-thorn-pop` SFX.
- `src/audio/` — Modular Procedural WebAudio synthesizer + external audio clip player + typed Voice Catalog (documented in `docs/AUDIO_CATALOG.md` and `docs/VOICE_CATALOG.md`):
  - `src/audio/voices.ts` — Typed Google AI Studio Gemini TTS Voice Catalog (`VOICE_CATALOG: readonly VoiceCatalogEntry[]` for all 30 prebuilt voices and `CHARACTER_VOICE_PRESET_CATALOG: readonly CharacterVoicePresetCatalogEntry[]` for all 40 character/narrator presets) classified by `gender`, `ageGroup`, `pitch`, `tone`, `roughness`, `energy`, `accentAffinity`, `description`, `bestFor`, `recommendedRoles`, and `themes`.
  - `src/audio/sfx/` — One-file-per-sound-effect modular WebAudio synthesizers:
    - `src/audio/sfx/types.ts` — `ProceduralSfxModule`, `ProceduralSfxCategory`, `ProceduralSfxHelpers`, `FilteredNoiseOptions`, `AudioClipCatalogEntry`, `VoiceCatalogEntry`, `CharacterVoicePresetCatalogEntry`, and voice classification types (`VoiceGender`, `VoiceAgeGroup`, `VoicePitch`, `VoiceRoughness`, `VoiceEnergy`).
    - `src/audio/sfx/shared.ts` — Shared synthesizer building blocks (`synthesizeMusicBoxNote`, `scheduleFilteredNoise`, `schedulePitchBlip`, `scheduleCrayonScribble`, `createProceduralSfxHelpers`).
    - 19 standalone procedural SFX modules: `lullaby.ts`, `chime.ts`, `crayonScribble.ts`, `birthdaySong.ts`, `partyHorn.ts`, `confettiPop.ts`, `candleBlow.ts`, `cheerApplause.ts`, `giggle.ts`, `oceanWave.ts`, `waterSplash.ts`, `floatieSqueak.ts`, `fireCrackle.ts`, `dragonFire.ts`, `spearClink.ts`, `medievalLute.ts`, `gardenWindChime.ts`, `playfulBark.ts`, `dragonHiccup.ts`.
    - `src/audio/sfx/index.ts` — Exports `PROCEDURAL_SFX_MODULES`, `PROCEDURAL_SFX_REGISTRY: Record<AudioCueKind, ProceduralSfxModule>`, `AUDIO_CLIP_CATALOG: readonly AudioClipCatalogEntry[]`, `VOICE_CATALOG`, and `CHARACTER_VOICE_PRESET_CATALOG`.
  - `src/audio/soundEngine.ts` — `PictureBookSoundEngine` delegating each `AudioCueKind` to `PROCEDURAL_SFX_REGISTRY[kind].synthesize(...)` synced to the stepped 6 FPS clock, plus:
    - `renderOfflineAudio(cues, startSec, durSec, sampleRate, audioClips?)` — offline stereo `AudioBuffer` rendering for WebCodecs MP4 exports; mixes in `AudioClipCue[]` external audio files (reusing `fetchAndDecodeClip` + shared window math on `OfflineAudioContext`)
    - `triggerClipsForFrame(clips, prevTime, curTime, getLiveTimeSec?)` & `syncClipsAtTime(clips, timeSec, getLiveTimeSec?)` — live browser playback for BGM, voiceovers, and WAV SFX synced to the stepped 6 FPS clock with mid-clip lead-in on play/resume/seek/loop wrap, export-parity clip volume, and stale-decode epoch guards
    - `fetchAndDecodeClip(src)` / `preloadClips(clips)` — deduplicated fetch + decode + `AudioBuffer` cache for each unique `AudioClipCue.src`
    - `resumeContext()` / `isContextSuspended()` — browser WebAudio autoplay unlock helpers so suspended contexts resume and sync active clips cleanly on user gesture
    - `stopAllClips()` — stops all currently playing clip sources and invalidates pending async clip loads (called on pause/seek/loop wrap/scene change)
    - `liveOutputGain` master speaker gain for instant mute/unmute of playing clips without muting `createRecordingStream()` / `stopRecordingStream()` (`MediaRecorder` fallback)
- `src/ui/` — Interactive Storybook Video Player Studio, Scene Switcher, URL Router, 16:9 Video Downloader & Asset Catalog:
  - `src/ui/app.ts` — `mountStorybookStudio()`, `SCENE_REGISTRY` (keyed by both legacy short ID `'1'..'6'` and `scene.id` / aliases including `'moonlit-garden'`, `'strawberry-beach-birthday'`, `'beach-birthday'`, `'knight-dragon-quest'`, `'dragon-quest'`), `getUniqueRegisteredScenes()`, `getSwitcherScenes()`, `parseStudioUrlParams()`, `ASSET_CATALOG_ITEMS` (39 items), and `renderAssetPreviewSvg()` providing:
    - **Dedicated Style Website Routes (`/` vs. `/classic/...`)** served via SPA fallback in `scripts/studio-cli.mjs` (and `vite.config.ts`) and parsed by `parseStudioUrlParams(search, fallbackScene, pathname)`:
      - **`/`** — Preserves the original Picture-Book Crayon Studio (`getSwitcherScenes('crayon')`: `starter-moonlit-cat`, `starter-bandana-dog`, `starter-knight-dragon-hiccups`) with a prominent Style Studio switcher link (`🖍️ Picture Book (/)` ↔ `🎞️ Classic Cel (/classic/mochi)`).
      - **`/classic`, `/classic/mochi`, `/classic/<sceneId>`** — Opens the Classic 1970s–80s Hand-Drawn Cel Studio (`artStyle: 'classic_cel'`, dark vintage rostrum framing, `getSwitcherScenes('classic_cel')` listing `classic-moonlit-cat` and any custom classic cel scenes, `bookFrame` disabled by default, 1-click navigation back to `/`).
    - Live `audioClips` preloading, frame-synced triggering, mid-clip seek/resume syncing, and automatic user-gesture WebAudio unlock so BGM and voiceovers play identically to exported MP4s
    - URL query parameter routing (`?scene=<id|key>`, `?style=crayon|classic_cel`, legacy `?short_sample=1..6|birthday|beach-birthday|dragon-quest`, `?footage=<act-id|alias>`, `?vibrant=1|0`, `?book_frame=1|0`, `?t=<seconds>`, `?autoplay=1|0`, `?auto_export=1`, `?resolution=1080p|720p`)
    - Adaptive FPS cycling (`6 → 8 → 12 → 24 → 6`), auto-selecting `scene.fps` (`12 FPS` for `classic_cel`, `6 FPS` for `crayon`), header badge swap (`🎞️` vs `🖍️`), and `data-art-style` stage binding
    - 16:9 Fullscreen stage toggle (`#btn-fullscreen`)
    - 1080p/720p 16:9 Video Downloader (`#btn-download-video`) with save-export to `exports/` dir
    - `document.body.dataset.exportState` = `'exporting'|'done'|'error'` for CDP automation polling
    - `document.body.dataset.exportFilename` and `document.body.dataset.exportSavedPath` on completion
    - Vibrant Mode toggle, Book Cover & Credits toggle (`#chk-book-frame`), 3-Layer Stack toggles, live Stop-Motion Coloring Scrubber, Live Node Telemetry, and interactive Asset Catalog grid
  - `src/main.ts` — Browser entrypoint parsing `window.location.search` via `parseStudioUrlParams` and mounting the studio into `#app`.
- `public/audio/` — Static audio assets served at `/audio/<filename>` by the dev server and included in production build. Place narration WAV/MP3s, background music, and SFX files here. See `public/audio/README.md`.
- `exports/` — Output directory where the dev-server `/__studio/save-export` middleware saves exported MP4 files for agent access. Created automatically by the middleware.
- `vendor/` — Pre-bundled pure-JS compilers and libraries enabling 100% standalone operation on any machine with only Antigravity (`agy-node`) installed (no external `node`, `npm`, `pnpm`, `python`, or `git` required):
  - `vendor/typescript/` — Full TypeScript compiler (`lib/tsc.js`, `lib/typescript.js`) and standard `lib*.d.ts` definitions for strict `tsc --noEmit` typechecking and on-the-fly `.ts` transpilation.
  - `vendor/mp4-muxer/` — Pure-JS H.264/AAC MP4 muxer (`mp4-muxer.mjs` & `mp4-muxer.d.ts`).
  - `vendor/vitest-shim/` — Zero-dependency test runner & assertion engine (`index.mjs` & `index.d.ts`) implementing `describe`, `it`, `test`, `expect`, lifecycle hooks, and `vi.fn()`/`vi.spyOn()`.
  - `vendor/isomorphic-git/` — Pure-JS Git object & `.git/index` v2 engine (`index.mjs` & `index.d.ts`) supporting `init`, `status`, `addAll`, `commit`, and `log` fully compatible with native `git`.
  - `vendor/node-shim.d.ts` — Minimal ambient declarations for `node:*` built-in modules used by standalone runtime tests.
- `scripts/` — Zero-dependency CLI tools executable directly via `agy-node`:
  - `scripts/studio-cli.mjs` — Unified CLI supporting `typecheck` (bundled `tsc --noEmit`), `test` (runs `tests/**/*.test.ts` via `ts-loader-hooks.mjs` + `vitest-shim`), `build` (typechecks and compiles `dist/`), `dev` (HTTP server on `:5173` with on-the-fly `.ts` transpilation and `POST /__studio/save-export` MP4 saving), and `export` (`--scene <id> [--resolution 1080p|720p] [--footage <actId>]` headless CLI MP4 export).
  - `scripts/ts-loader-hooks.mjs` — Node `module.register` customization hooks resolving extensionless `.ts` imports, `'mp4-muxer'`, `'vitest'`, and `'isomorphic-git'`, and transpiling TypeScript via `vendor/typescript`.
  - `scripts/vcs.mjs` — Unified VCS CLI (`check`, `init`, `status`, `add`, `commit`, `log`) that automatically uses native `git` when installed or falls back to bundled `vendor/isomorphic-git`.
  - `scripts/generate_audio.mjs` — Zero-Python audio & Google AI Studio Generate Speech (Gemini TTS) CLI (`tts`, `dialogue`, `voice-design`, `voices`, `set-key`, `check-key`, `sfx`, `tone`, `info`) generating expressive single-speaker and multi-speaker character voiceover WAVs (`gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`, `gemini-2.5-flash-preview-tts`), custom prompted voices (`POST /v1beta/voices`), voice catalog filtering (`--gender`, `--age`, `--roughness`, `--energy`, `--accent`, `--theme`), and procedural WAV sound effects.
  - `scripts/generate_medieval_audio.mjs` & `scripts/sfx/` — Modular pure-JS 44.1kHz 16-bit PCM WAV synthesizer entry point and one-file-per-clip generators (`scripts/sfx/shared.mjs`, `medievalFantasyBgm.mjs`, `campfireCrackle.mjs`, `dragonFireBreath.mjs`, `spearToothPop.mjs`, `horseTrot.mjs`, `index.mjs`).
  - `scripts/analyze_reference_photo.mjs` — Zero-Python image analyzer extracting dominant RGB color clusters and mapping them to `TOKENS.colors` and `TOKENS.patterns`.
- `docs/AUDIO_CATALOG.md` — Master Audio & Sound Effects Catalog documenting all 16 procedural WebAudio synthesizers (`src/audio/sfx/*.ts`) and 5 pre-rendered `.wav` tracks (`public/audio/*.wav` + `scripts/sfx/*.mjs`).
- `docs/VOICE_CATALOG.md` — Master Voice & Character Casting Catalog documenting all 30 Google AI Studio prebuilt voices (`VOICE_CATALOG`) and 40 character/narrator presets (`CHARACTER_VOICE_PRESET_CATALOG`) with vocal classifications (`gender`, `ageGroup`, `pitch`, `tone`, `roughness`, `energy`, `accentAffinity`, `themes`) and scene theme lookup tables (`skills/picture-book-voiceover/references/voice-catalog.md`).

## 3. Standalone CLI, Dev Server, Build & Headless Export (`agy-node`)
- **Typecheck**: `agy-node scripts/studio-cli.mjs typecheck` (or `pnpm run typecheck`) → runs bundled `tsc --noEmit`
- **Tests**: `agy-node scripts/studio-cli.mjs test` (or `pnpm test`) → runs all test suites in `tests/`
- **Build**: `agy-node scripts/studio-cli.mjs build` (or `pnpm run build`) → typechecks and outputs production bundle to `dist/`
- **Direct CLI Video Export**: `agy-node scripts/studio-cli.mjs export --scene <sceneId> --resolution 1080p` → exports `.mp4` directly from the CLI in headless mode (auto-detecting OS Edge/Chrome/Chromium) and saves to `<workspace>/exports/<filename>.mp4`
- **Dev server**: `agy-node scripts/studio-cli.mjs dev` (or `pnpm run dev`) → starts Studio HTTP server on port **5173** (`http://localhost:5173`)
- **Git / VCS**: `agy-node scripts/vcs.mjs check` / `init` / `status` / `commit -m "..."` / `log`

## 4. Dev Server Middleware: `POST /__studio/save-export` & `POST /__studio/generate-speech`
Built into `scripts/studio-cli.mjs dev` (and `vite.config.ts`).

**Purpose (`POST /__studio/save-export`)**: Saves a video export blob to `<workspace>/exports/<filename>` so agent automation can retrieve the file from disk after a browser-triggered export.

**Purpose (`POST /__studio/generate-speech`)**: Invokes `scripts/generate_audio.mjs` (`tts` or `dialogue`) to synthesize single-speaker or multi-speaker voiceovers into `<workspace>/public/audio/<filename>.wav` and returns `{ ok: true, url: "/audio/<filename>.wav", savedPath, durationSec, source }`.

**Usage**:
```
POST http://localhost:5173/__studio/save-export?filename=<filename>.mp4
Content-Type: application/octet-stream
(raw MP4 blob body)

Response: { "ok": true, "savedPath": "<workspace>/exports/<filename>.mp4" }
```

Headers: `x-export-filename: <filename>` takes priority over `?filename=` query param.

## 5. Automated Video Export via URL Parameters
Open the studio with `?auto_export=1` to trigger export immediately on mount:
```
http://localhost:5173/?scene=short-sample-1&auto_export=1&resolution=1080p
```
Poll `document.body.dataset.exportState` for `'done'|'error'`:
- `'exporting'` — in progress
- `'done'` — completed; `document.body.dataset.exportSavedPath` contains the server-side path
- `'error'` — failed; check `document.body.dataset.exportFilename` and UI status text

## 6. Dual-Style 3-Layer Render Pipeline
Both styles render through a clean 3-layer SVG stack selected automatically by `artStyle`:

### A. Picture-Book Crayon Style (`artStyle: 'crayon'`, `6 FPS`)
1. **Layer 1 — Base Scene Layer**: Background vignette patches (with progressive stop-motion fill masks), architecture, props, character cutout rigs, and hand-drawn annotations arranged in 2D SVG space on warm raw paper (`#paper-base`, `#F4EFE6`), optionally graded by `#vibrant-grade` when Vibrant Mode is active, and wrapped by `renderBookFrameOverlay` during the opening and closing book-frame phases.
2. **Layer 2 — SVG Crayon & Line-Boil Filter (`#crayon-stroke`)**: `<feTurbulence type="fractalNoise">` + `<feDisplacementMap>` roughens edges into waxy borders and updates its `seed` at the quantized `6 FPS` clock rate.
3. **Layer 3 — Physical Paper Composite Layer (`#layer-3-paper-composite`)**: Full-frame cold-press watercolor paper texture overlay (`mix-blend-mode: multiply`) plus a dry-brush grain mask that punches tiny raw-paper flecks out of solid crayon fills.

### B. Classic Hand-Drawn Cel Style (`artStyle: 'classic_cel'`, `12 FPS` on twos, `/classic/...`)
1. **Layer 1A — Painted Watercolor/Gouache Illustration-Board Background**: Theatre dark backdrop (`#cel-backdrop`), dappled multiplane `background_patch` layers (`gouachePath` / `#gouache-wash` brush-mottle displacement + gentle rostrum optical softness + `#bg-board-texture` illustration-board paper tooth), and painted set architecture/foliage (`src/assets/classicCel/{buildings,props}/`) with `gouacheDabWash` brushwork and sparse loose hand-inked ticks (`xeroxSketchStroke`).
2. **Layer 1B — Transparent Acetate Foreground Cels (`#cel-drop-shadow`) + Eastmancolor Grade (`#cel-grade`)**: Flat matte analog cel-painted characters (`src/assets/classicCel/characters/`) with raw electrostatic `#xerox-ink` graphite toner outlines, sketchy `xeroxSketchStroke` fur/cloth ticks, `celContactShadow`, and parchment-cream cel bubbles (`#FBF7EE`), hovering over Layer 1A with tiny physical rostrum shadow (`#cel-drop-shadow`), graded through warm earthy Eastmancolor `#cel-grade` (lifted charcoal shadows, creamy highlights, micro-soft 35mm lens focus), and wrapped by `renderTheatricalFrameOverlay` (vintage serif opening title without synthetic dark oval scrims, and closing iris-out `"The End"` card).
3. **Layer 2 — Classic Cel, Gouache & Optical Filter `<defs>`**: Dual-pass `#xerox-ink`, painterly `#gouache-wash`, `#bg-board-texture`, `#cel-drop-shadow`, restrained 35mm `#cel-soft-glow`, `#cel-grade`, animated `#film-grain`, and `#film-vignette`.
4. **Layer 3 — 35mm Celluloid Film Composite (`#layer-3-film-composite` via `renderFilmCompositeLayer`)**: Perceptible per-frame animated 35mm celluloid film grain (`url(#film-grain)`, `mix-blend-mode: overlay`) + gentle warm film-gate optical vignette (`url(#film-vignette)`).

## 7. Framing Engines: `bookFrame.ts` (Crayon) vs. `theatricalFrame.ts` (Classic Cel)
### A. Classic Theatrical Framing (`src/engine/theatricalFrame.ts` — Default for `classic_cel`)
1. **Opening (`0 .. openDurationSec`, default `3.0s`, `phase: 'opening'`)**: Circular iris-in (`mode: 'iris'`) or warm theatre fade (`mode: 'fade'`) lifts over the painted establishing shot while `#theatrical-opening-title` displays the credit line, gold-serif title, ornamental divider, and italic subtitle.
2. **Main Story (`phase: 'story'`)**: 100% full-bleed theatrical frame (`innerSceneMarkup` untouched).
3. **Closing (`durationSec - closeDurationSec .. durationSec`, default `3.0s`, `phase: 'closing'`)**: Iris closes onto `irisFocus` (or fades to `#121014`) revealing the gold-serif `"The End"` card (`#theatrical-ending-card`) and closing credit.

### B. Storybook Cover Opening & Ending/Credits Book-Frame (`src/engine/bookFrame.ts` — Default for `crayon`)
Every scene in the Picture-Book Studio is framed inside an animated hand-drawn hardcover storybook (`bookFrame` enabled by default):
1. **Opening Cover & Zoom-In (`0 .. openDurationSec`, default `3.5s`, `phase: 'opening'`)**:
   - **First 48% (`u <= 0.48`)**: Starts zoomed out (`bookScale: 0.68`) on a closed hardcover picture book (`#book-front-cover`) resting on a warm storybook desk (`TOKENS.colors.paperAged`), displaying the scene's title (`coverTitle`, defaulting to `scene.title`), subtitle (`coverSubtitle`, defaulting to `scene.subtitle`), and optional author/illustrator credit (`creditText`) wrapped inside a clipped inset title card (`#book-cover-title-card` + `<svg id="book-cover-box-container" overflow="hidden">`). The front cover and turning flyleaf pages (`#book-turning-pages`) flip open in 3D perspective `rotateY(0deg -> 180deg)` at stepped `6 FPS` stop-motion (`coverOpenProgress: 0 -> 1`) to reveal the open book spread (`#book-frame-spread`) with the scene inside at **0% crayon color** (`colorFillMultiplier: 0` — a pure charcoal outline sketch on warm paper).
   - **Remaining 52% (`0.48 < u < 1.0`)**: With the book fully open (`coverOpenProgress: 1`), the view zooms from the open book spread into the full-bleed scene (`bookScale: 0.68 -> 1.0` in quantized steps) while the crayon colors progressively fill in from **0% to 100%** (`colorFillMultiplier: 0 -> 1`).
   - **Zero-Spill Book Page Container**: Throughout `'opening'` and `'closing'`, `innerSceneMarkup` is wrapped inside `<svg id="book-page-container" x="0" y="0" width="1280" height="720" viewBox="0 0 1280 720" overflow="hidden">` inside `<g id="book-page-clip-group" clip-path="url(#book-open-page-clip)">` so grass patches and strokes can never spill outside the book borders.
2. **Main Story (`openDurationSec .. durationSec - closeDurationSec`, `phase: 'story'`)**:
   - Full-bleed 16:9 storybook animation (`bookScale: 1.0`, `colorFillMultiplier: 1.0`, 100% identical to standard full-canvas rendering with zero book-frame overlay overhead).
3. **Ending Color-Out, Zoom-Out, Closing Credits & 1s Closed-Book Hold (`durationSec - closeDurationSec .. durationSec`, default last `4.5s`, `phase: 'closing'`)**:
   - **Stage 1 (`v < 0.42`, ~1.9s)**: The view zooms back out from full-bleed into the open book spread (`bookScale: 1.0 -> 0.68`) while crayon pigment drains in quantized steps from **100% down to 0%** (`colorFillMultiplier: 1 -> 0`), returning the illustration to a hand-drawn charcoal sketch on warm paper.
   - **Stage 2 (`0.42 <= v < 0.76`, ~1.5s)**: At `bookScale: 0.68` and `colorFillMultiplier: 0`, the book cover closes in stepped 3D perspective stop-motion (`coverCloseProgress: 0 -> 1`, `#book-ending-cover`).
   - **Stage 3 (`v >= 0.76`, final ~1.1s hold)**: `coverCloseProgress` remains `1.0` so the video holds on the fully closed hardcover book displaying the scene name, `endingTitle` (`"The End ★"`), and `endingCredit` / `creditText`.
4. **Configuration & Controls**:
   - Scenes can customize or disable the book frame via `scene.bookFrame?: BookFrameConfig | boolean`.
   - Live Studio UI toggle: `#chk-book-frame` ("Book Cover & Credits", checked by default).
   - URL parameter override: `?book_frame=1|0`.

## 8. Predefined Character-Attached Speech & Thought Bubbles (`CHARACTER_SPEECH_ANCHORS`) & `+X` Walking Profile Convention
- Every character model in `src/assets/characters/index.ts` has a predefined head-top anchor in `CHARACTER_SPEECH_ANCHORS: Record<CharacterKind, { x: number; y: number }>` (e.g., `little_girl: { x: 0, y: -102 }`, `shopkeeper: { x: 0, y: -105 }`, `cat: { x: 10, y: -44 }`).
- Scene authors attach speech or thought bubbles directly to any character (`CharacterNode` or `NodeKeyframe`) via `speechText?: string` (pass `""` to clear), `speechStyle?: 'speech' | 'thought'`, and optional `speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right'`.
- `evaluateAndRenderScene` (`src/engine/renderer.ts`) automatically renders active character speech/thought bubbles in a top-level overlay layer inside `#camera-rig` (`id="speech-<node.id>"`, `data-character-speech="<node.id>"`) with `anchorAtTailTip: true` so the tail tip or lowest thought puff lands directly above the character's head, is never occluded by buildings or props, and never mirrors text backwards when `flipX: true`.
- **Canonical `+X` Walking Profile & Direction Safeguard**: Every character rig faces **RIGHT (`+X`)** when `flipX: false` and **LEFT (`-X`)** when `flipX: true`. In `state === 'walking'`, characters use a dedicated 3/4 or side-profile walking rig facing right (`+X`, `data-facing="right"`, `data-walk-profile="true"`) with both shoes/feet/paws pointing right (`+X`). Furthermore, `evaluateSingleNode()` in `src/engine/timeline.ts` automatically enforces `flipX = next.x < prev.x` during horizontal `'walking'` segments so characters always face their direction of travel.

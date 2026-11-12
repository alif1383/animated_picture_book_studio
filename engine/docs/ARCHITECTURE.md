# Picture-Book Crayon Video Engine — Architecture

## 1. Overview
The **Picture-Book Crayon Video Engine** is a declarative 2D stop-motion storybook rendering and animation engine built with TypeScript and SVG/HTML5. Every scene is rendered through a mandatory **3-Layer Visual Pipeline** that emulates physical wax crayons, oil pastels, and felt-tip marker washes on heavy cold-press watercolor paper, quantized to a stepped stop-motion frame rate (`6–8 FPS`), with an optional **Vibrant Crayon Mode** (`#vibrant-grade`).

## 2. Directory Structure & Modules
- `src/theme/tokens.ts` — Single source of truth (`TOKENS`) for all colors, paper tones, charcoal outlines, sunset/nightfall washes, vibrant meadow cutout tones, stroke widths, SVG filter parameters (`#crayon-stroke`, `#crayon-outline`, `#vibrant-grade`), pattern IDs, quantized frame rates (`6 FPS`), and standard 16:9 widescreen canvas dimensions (`1280×720`, `aspectRatio: '16 / 9'`), plus `svgUrl()` helper.
- `src/engine/` — Core rendering, timing, scene evaluation, and 16:9 video export primitives:
  - `src/engine/svgUtils.ts` — Pure SVG string builders (`svgAttrs`, `svgEl`, `crayonStrokeAttrs`, `crayonPath`, `svgTransform`) and quantization/jitter math (`clamp01`, `quantizeStep`, `deterministicJitter`).
  - `src/engine/filters.ts` — SVG `<defs>` generator (`renderEngineDefs`, `getPatternFill`) for `#crayon-stroke` and `#crayon-outline` stepped displacement filters, `#vibrant-grade` saturation/contrast filter, 21 dry-crayon `<pattern>` fills (with vibrant pigment opacity support), `#pat-marker-indigo-night` felt-tip wash, and Layer 3 `renderPaperCompositeLayer(width, height, enablePaperTexture, vibrant)`.
  - `src/engine/fillMask.ts` — Stop-motion progressive fill mask generator (`quantizeFillProgress`, `renderFillMaskDef`) supporting `'top-down-bands'` (with `wrapRightNegativeSpace` for partial-bleed sky around the Moon), `'diagonal-strokes'`, and `'radial-scribble'`.
  - `src/engine/clock.ts` — Quantized stepped clock (`evaluateSteppedClock`, `steppedOscillate`, `isSteppedBlinkFrame`, `steppedLoopProgress`) converting continuous playback time into discrete `6 FPS` stop-motion frame indices and line-boil seeds (`1..6`).
  - `src/engine/schema.ts` — TypeScript interfaces for declarative scenes: `SceneDefinition` (with `vibrantMode?: boolean`, `audioClips?: AudioClipCue[]`), `AudioClipCue` (external/generated audio files with `src`, `startTime`, `duration`, `offsetSec`, `volume`, `label`), `StoryAct`, `BackgroundPatchNode`, `BuildingNode` (`'ochre_cottage' | 'corner_store'`), `CharacterNode` (15 character kinds), `PropNode`, `AnnotationNode`, `CameraKeyframe`, `NodeKeyframe`, `TimelineTrack`, and `AudioCueKind`.
  - `src/engine/timeline.ts` — Stepped keyframe evaluator (`evaluateSceneAtTime`, `interpolateKeyframes`, `evaluateCameraTrack`, `evaluateActiveAct`) that snaps `timeSec` via `evaluateSteppedClock` first so transforms, character states, progressive stop-motion fill masks, and camera pans/zooms update strictly on stepped ticks.
  - `src/engine/renderer.ts` — Declarative SVG scene graph renderer (`evaluateAndRenderScene`, `renderSceneToSvg`) implementing the Mandatory 3-Layer Stack, Vibrant Crayon Mode (`vibrant?: boolean`), zIndex sorting, camera rig transform, and automatic `<mask>` generation for progressive stop-motion coloring.
  - `src/engine/videoExporter.ts` — Full-screen 16:9 widescreen seekable `.mp4` video & WebAudio exporter (`exportSceneTo16x9Video`, `patchMp4Duration`, `rasterizeSvgToCanvas`, `prepareSvgFor16x9Canvas`, `selectSupportedVideoMimeType`, `buildVideoFilename`, `VIDEO_RESOLUTION_PRESETS` for `1080p` `1920×1080` and `720p` `1280×720` 16:9). Uses `mp4-muxer` (`fastStart: 'in-memory'`) + WebCodecs (`VideoEncoder` H.264 + `AudioEncoder` AAC) to write a non-fragmented ISO BMFF `.mp4` with complete `stbl` seek tables (`stts`, `stss`, `stsc`, `stsz`, `stco`) and exact `mvhd`/`tkhd`/`mdhd` duration headers so Windows Media Player displays total length and scrubs smoothly, plus `patchMp4Duration` for the `MediaRecorder` fallback. Passes `scene.audioClips` into `renderOfflineAudio()` so external/TTS audio files are mixed into exported MP4s.
- `src/assets/` — Modular, token-driven SVG asset primitives split into dedicated category folders (one file per asset):
  - `src/assets/buildings/` (and barrel `src/assets/buildings.ts`) — `renderBuilding()` plus individual building modules:
    - `src/assets/buildings/ochreCottage.ts` (`renderOchreCottage`)
    - `src/assets/buildings/cornerStore.ts` (`renderCornerStore`, "LUNE STORE")
    - `src/assets/buildings/types.ts` & `src/assets/buildings/index.ts`
  - `src/assets/characters/` (and barrel `src/assets/characters.ts`) — `renderCharacter()` plus 15 standalone 2D cutout character rig modules and shared helpers:
    - `src/assets/characters/littleGirl.ts` (`renderLittleGirl`)
    - `src/assets/characters/moon.ts` (`renderMoon`)
    - `src/assets/characters/sun.ts` (`renderSun`)
    - `src/assets/characters/shopkeeper.ts` (`renderShopkeeper`)
    - `src/assets/characters/cat.ts` (`renderCat`)
    - `src/assets/characters/singingRadish.ts` (`renderSingingRadish`)
    - `src/assets/characters/birthdayStrawberry.ts` (`renderBirthdayStrawberry`)
    - `src/assets/characters/watermelonSlice.ts` (`renderWatermelonSlice`)
    - `src/assets/characters/bluePartyCat.ts` (`renderBluePartyCat`)
    - `src/assets/characters/helloBug.ts` (`renderHelloBug`)
    - `src/assets/characters/partyBanana.ts` (`renderPartyBanana`)
    - `src/assets/characters/cryingOnion.ts` (`renderCryingOnion`)
    - `src/assets/characters/cherryTwins.ts` (`renderCherryTwins`)
    - `src/assets/characters/acornTwins.ts` (`renderAcornTwins`)
    - `src/assets/characters/oliveSprout.ts` (`renderOliveSprout`)
    - `src/assets/characters/shared.ts` (`renderCutoutStickerHalo`, `renderSheepPlushie`), `src/assets/characters/types.ts`, & `src/assets/characters/index.ts`
  - `src/assets/props/` (and barrel `src/assets/objects.ts`) — `renderProp()` plus 13 standalone prop modules and shared star geometry helper:
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
    - `src/assets/props/shared.ts` (`renderStarShape`), `src/assets/props/types.ts`, & `src/assets/props/index.ts`
  - `src/assets/annotations/` — `src/assets/annotations/pencilAnnotation.ts` (`renderAnnotation`) and `src/assets/annotations/index.ts` for hand-lettered pencil annotations & dashed motion paths.
  - `src/assets/index.ts` — Top-level barrel re-exporting all buildings, characters, props, and annotations.
- `src/scenes/` — Declarative story scenes:
  - `src/scenes/shortSample1.ts` — `SHORT_SAMPLE_1_SCENE` (`30s`, `6 FPS`, `1280×720` 16:9, routed via `?short_sample=1`), a 5-act picture-book child story from morning sun to sleepy orange sunset, walking into the house, sun-to-moon handoff, and rooftop lullaby.
  - `src/scenes/moonlightStory.ts` — `MOONLIGHT_STORY_SCENE` (`28s`, `6 FPS`, `1280×720` 16:9, routed via `?short_sample=2`), a 5-act picture-book story featuring `"LUNE STORE"`, the Ochre Cottage, and the Sleepy Moon.
  - `src/scenes/meadowParty.ts` — `MEADOW_PARTY_SCENE` (`24s`, `6 FPS`, `1280×720` 16:9, `vibrantMode: true`, routed via `?short_sample=3` or `?short_sample=birthday`), a 4-act **Strawberry's Birthday Party** story (`arrival`, `song`, `cake`, `celebration`) where Singing Radish and all the cutout friends throw a birthday party for Birthday Strawberry, sing `"Happy Birthday to You"`, present a 2-tier Strawberry Birthday Cake whose candles Strawberry blows out at `t = 16.0s`, and celebrate with confetti, streamers, party horns, and cheers.
- `src/audio/` — Procedural WebAudio synthesizer + external audio clip player:
  - `src/audio/soundEngine.ts` — `PictureBookSoundEngine` generating music-box lullaby notes (`lullaby`), star chimes (`chime`), filtered dry-crayon paper-scribble foley (`crayon_scribble`), and birthday party sound effects (`birthday_song`, `party_horn`, `confetti_pop`, `candle_blow`, `cheer_applause`, `giggle`) synced to the stepped 6 FPS clock, plus:
    - `renderOfflineAudio(cues, startSec, durSec, sampleRate, audioClips?)` — offline stereo `AudioBuffer` rendering for WebCodecs MP4 exports; mixes in `AudioClipCue[]` external audio files (fetches, decodes via `decodeAudioData`, schedules on `OfflineAudioContext`)
    - `triggerClipsForFrame(clips, prevTime, curTime)` — live playback trigger for external audio clips synced to stepped 6 FPS clock
    - `fetchAndDecodeClip(src)` / `preloadClips(clips)` — fetch + cache `AudioBuffer` for each `AudioClipCue.src`
    - `stopAllClips()` — stops all currently playing clip sources (call on seek/scene change)
    - `createRecordingStream()` / `stopRecordingStream()` for `MediaRecorder` fallback
- `src/ui/` — Interactive Storybook Video Player Studio, URL Router, 16:9 Video Downloader & Asset Catalog:
  - `src/ui/app.ts` — `mountStorybookStudio()`, `SCENE_REGISTRY` (keyed by both short ID and scene.id), `parseStudioUrlParams()`, `ASSET_CATALOG_ITEMS` (25 items), and `renderAssetPreviewSvg()` providing URL query parameter routing:
    - `?short_sample=1|2|3|birthday` — select built-in scene (legacy)
    - `?scene=<id|key>` — select any scene from SCENE_REGISTRY by key or scene.id (new)
    - `?footage=<act-id|alias>` — loop a single act
    - `?vibrant=1|0` — Vibrant Crayon Mode
    - `?t=<seconds>` — seek to time
    - `?autoplay=1|0` — autoplay
    - `?auto_export=1` — automatically trigger video export on mount (new)
    - `?resolution=1080p|720p` — video export resolution for auto_export (new)
    - 16:9 Fullscreen stage toggle (`#btn-fullscreen`)
    - 1080p/720p 16:9 Video Downloader (`#btn-download-video`) with save-export to `exports/` dir
    - `document.body.dataset.exportState` = `'exporting'|'done'|'error'` for CDP automation polling
    - `document.body.dataset.exportFilename` and `document.body.dataset.exportSavedPath` on completion
    - Vibrant Mode toggle, Birthday SFX Audition bar, 3-Layer Stack toggles, live Stop-Motion Coloring Scrubber, and interactive Asset Catalog grid
  - `src/main.ts` — Browser entrypoint parsing `window.location.search` via `parseStudioUrlParams` and mounting the studio into `#app`.
- `public/audio/` — Static audio assets served at `/audio/<filename>` by Vite dev server and included in production build. Place narration MP3s, background music, and SFX files here. See `public/audio/README.md`.
- `exports/` — Output directory where the Vite dev-server `/__studio/save-export` middleware saves exported MP4 files for agent access. Created automatically by the middleware.

## 3. Dev Server & Build
- **Dev server**: `pnpm run dev` → Vite default port **5173** (`http://localhost:5173`)
- **Build**: `pnpm run build` → `dist/` (tsc + vite build)
- **Tests**: `pnpm run test` (vitest, node env)
- **Typecheck**: `pnpm run typecheck`

## 4. Dev Server Middleware: `POST /__studio/save-export`
Defined in `vite.config.ts` via the `studioSaveExportPlugin`. Available only during `pnpm run dev`.

**Purpose**: Saves a video export blob to `<workspace>/exports/<filename>` so agent automation can retrieve the file from disk after a browser-triggered export.

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

## 6. Mandatory 3-Layer Render Pipeline
1. **Layer 1 — Base Scene Layer**: Background vignette patches (with progressive stop-motion fill masks), architecture, props, character cutout rigs, and hand-drawn annotations arranged in 2D SVG space on warm raw paper (`#F4EFE6`), optionally graded by `#vibrant-grade` when Vibrant Mode is active.
2. **Layer 2 — SVG Crayon & Line-Boil Filter (`#crayon-stroke`)**: `<feTurbulence type="fractalNoise">` + `<feDisplacementMap>` roughens edges into waxy borders and updates its `seed` at the quantized `6 FPS` clock rate.
3. **Layer 3 — Physical Paper Composite Layer**: Full-frame cold-press watercolor paper texture overlay (`mix-blend-mode: multiply`) plus a dry-brush grain mask that punches tiny raw-paper flecks out of solid crayon fills.

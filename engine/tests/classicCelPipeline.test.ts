import { describe, expect, it } from 'vitest';
import { TOKENS, svgUrl } from '../src/theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  gouacheDabWash,
  gouachePath,
  pencilFoliageScribbles,
  pencilGrassStrokes,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../src/engine/svgUtils';
import {
  evaluateTheatricalFrameState,
  renderTheatricalFrameOverlay,
} from '../src/engine/theatricalFrame';
import {
  renderEngineDefs,
  renderFilmCompositeLayer,
} from '../src/engine/filters';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { renderAnnotation } from '../src/assets/annotations/pencilAnnotation';
import type { SceneDefinition } from '../src/engine/schema';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';

function buildClassicCelTestScene(
  overrides: Partial<SceneDefinition> = {}
): SceneDefinition {
  return {
    id: 'test-classic-cel-scene',
    title: 'Moonlit Cel Test',
    subtitle: 'A Painted Gouache Short',
    durationSec: 16,
    artStyle: 'classic_cel',
    acts: [
      {
        id: 'act-1',
        title: 'Opening',
        startTime: 0,
        endTime: 16,
        caption: 'Classic cel pipeline verification scene.',
      },
    ],
    nodes: [
      {
        id: 'sky-wash',
        type: 'background_patch',
        zIndex: 1,
        x: 0,
        y: 0,
        d: 'M 0 0 L 1280 0 L 1280 500 L 0 500 Z',
        bounds: { x: 0, y: 0, width: 1280, height: 500 },
        material: 'markerIndigoNight',
        gradient: {
          type: 'linear',
          x1: '0%',
          y1: '0%',
          x2: '0%',
          y2: '100%',
          stops: [
            { offset: '0%', color: TOKENS.classicCel.colors.nightSkyZenith },
            { offset: '60%', color: TOKENS.classicCel.colors.nightSkyMid },
            { offset: '100%', color: TOKENS.classicCel.colors.nightSkyHorizon },
          ],
        },
      },
      {
        id: 'moon-glow-wash',
        type: 'background_patch',
        zIndex: 2,
        x: 0,
        y: 0,
        d: 'M 760 40 L 1160 40 L 1160 360 L 760 360 Z',
        bounds: { x: 760, y: 40, width: 400, height: 320 },
        material: 'crayonWarmMoon',
        gradient: {
          id: 'custom-moon-radial',
          type: 'radial',
          cx: '50%',
          cy: '50%',
          r: '55%',
          stops: [
            {
              offset: '0%',
              color: TOKENS.classicCel.colors.moonCream,
              opacity: 0.55,
            },
            {
              offset: '100%',
              color: TOKENS.classicCel.colors.nightSkyMid,
              opacity: 0,
            },
          ],
        },
      },
      {
        id: 'meadow-fill',
        type: 'background_patch',
        zIndex: 3,
        x: 0,
        y: 0,
        d: 'M 0 480 L 1280 480 L 1280 720 L 0 720 Z',
        bounds: { x: 0, y: 480, width: 1280, height: 240 },
        material: 'crayonGrassGreen',
        fill: TOKENS.classicCel.colors.grassNightMid,
        softEdge: false,
      },
      {
        id: 'hero-cat',
        type: 'character',
        kind: 'moonlit_cat',
        state: 'idle',
        zIndex: 10,
        x: 420,
        y: 590,
        speechText: 'What a lovely moon!',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
      },
      {
        id: 'cel-thought',
        type: 'annotation',
        zIndex: 20,
        x: 860,
        y: 260,
        text: 'Soft cel thoughts',
        bubbleStyle: 'thought',
        tailDirection: 'bottom-left',
      },
    ],
    timeline: [],
    ...overrides,
  };
}

describe('Classic 1970s–80s Hand-Drawn Cel Animation Pipeline', () => {
  describe('TOKENS.classicCel design tokens', () => {
    it('never uses pure #FFFFFF or #000000 in classicCel color tokens', () => {
      const entries = Object.entries(TOKENS.classicCel.colors);
      expect(entries.length).toBeGreaterThan(20);
      for (const [key, hex] of entries) {
        const upper = hex.toUpperCase();
        expect(upper, `classicCel.colors.${key} must not be pure white`).not.toBe(
          '#FFFFFF'
        );
        expect(upper, `classicCel.colors.${key} must not be pure black`).not.toBe(
          '#000000'
        );
        expect(upper).toMatch(/^#[0-9A-F]{6}$/);
      }
    });

    it('defines 12 FPS on-twos timing, 24 FPS container rate, Xerox strokes, and cel filter IDs', () => {
      expect(TOKENS.classicCel.timing.fps).toBe(12);
      expect(TOKENS.classicCel.timing.containerFps).toBe(24);
      expect(TOKENS.classicCel.timing.frameDurationMs).toBeCloseTo(1000 / 12, 4);

      expect(TOKENS.classicCel.strokes.xeroxHeavy).toBeGreaterThan(
        TOKENS.classicCel.strokes.xeroxMedium
      );
      expect(TOKENS.classicCel.strokes.xeroxMedium).toBeGreaterThan(
        TOKENS.classicCel.strokes.xeroxFine
      );
      expect(TOKENS.classicCel.strokes.xeroxFine).toBeGreaterThan(
        TOKENS.classicCel.strokes.sketchLine
      );

      expect(TOKENS.classicCel.filters.ids).toEqual({
        xeroxInk: 'xerox-ink',
        gouacheWash: 'gouache-wash',
        celDropShadow: 'cel-drop-shadow',
        celSoftGlow: 'cel-soft-glow',
        celGrade: 'cel-grade',
        filmGrain: 'film-grain',
        filmVignette: 'film-vignette',
      });
    });
  });

  describe('Classic cel SVG helpers (svgUtils.ts)', () => {
    it('builds crisp Xerox ink stroke attributes via celStrokeAttrs', () => {
      const defaults = celStrokeAttrs();
      expect(defaults.stroke).toBe(TOKENS.classicCel.colors.xeroxInk);
      expect(defaults['stroke-width']).toBe(TOKENS.classicCel.strokes.xeroxMedium);
      expect(defaults['stroke-linecap']).toBe('round');
      expect(defaults['stroke-linejoin']).toBe('round');
      expect(defaults.filter).toBeUndefined();

      const withXerox = celStrokeAttrs({
        stroke: TOKENS.classicCel.colors.xeroxInkSoft,
        strokeWidth: TOKENS.classicCel.strokes.xeroxFine,
        dasharray: '4 3',
        useXeroxFilter: true,
        opacity: 0.9,
      });
      expect(withXerox.stroke).toBe(TOKENS.classicCel.colors.xeroxInkSoft);
      expect(withXerox['stroke-width']).toBe(TOKENS.classicCel.strokes.xeroxFine);
      expect(withXerox['stroke-dasharray']).toBe('4 3');
      expect(withXerox.filter).toBe('url(#xerox-ink)');
      expect(withXerox.opacity).toBe(0.9);
    });

    it('renders opaque cel-painted paths with Xerox outlines via celPath', () => {
      const markup = celPath('M 0 0 L 24 12 Z', TOKENS.classicCel.colors.mochiFurBase, {
        id: 'cel-ear',
        clipPath: 'url(#ear-clip)',
        useXeroxFilter: true,
      });
      expect(markup).toContain('id="cel-ear"');
      expect(markup).toContain(`fill="${TOKENS.classicCel.colors.mochiFurBase}"`);
      expect(markup).toContain(`stroke="${TOKENS.classicCel.colors.xeroxInk}"`);
      expect(markup).toContain('clip-path="url(#ear-clip)"');
      expect(markup).toContain('filter="url(#xerox-ink)"');
    });

    it('renders 2-tone clipped cel shading + rim highlight + top Xerox outline via celShadedShape', () => {
      const shaded = celShadedShape({
        id: 'mochi-torso',
        clipId: 'cc-test-torso-clip',
        d: 'M -20 0 C -20 -30, 20 -30, 20 0 Z',
        baseFill: TOKENS.classicCel.colors.mochiFurBase,
        shadowPaths: ['M -20 -10 L 20 -10 L 20 0 L -20 0 Z'],
        shadowFill: TOKENS.classicCel.colors.mochiFurShadow,
        shadowOpacity: 0.92,
        highlightPaths: ['M -18 -24 Q 0 -30, 18 -22 L 16 -18 Q 0 -24, -16 -18 Z'],
        highlightFill: TOKENS.classicCel.colors.mochiFurRim,
        highlightOpacity: 0.75,
        strokeWidth: TOKENS.classicCel.strokes.xeroxHeavy,
      });

      expect(shaded).toContain('id="mochi-torso"');
      expect(shaded).toContain('<clipPath id="cc-test-torso-clip">');
      expect(shaded).toContain(
        `fill="${TOKENS.classicCel.colors.mochiFurBase}" stroke="none"`
      );
      expect(shaded).toContain('clip-path="url(#cc-test-torso-clip)"');
      expect(shaded).toContain(
        `fill="${TOKENS.classicCel.colors.mochiFurShadow}" opacity="0.92"`
      );
      expect(shaded).toContain(
        `fill="${TOKENS.classicCel.colors.mochiFurRim}" opacity="0.75"`
      );
      expect(shaded).toContain(
        `fill="none" stroke="${TOKENS.classicCel.colors.xeroxInk}" stroke-width="${TOKENS.classicCel.strokes.xeroxHeavy}"`
      );

      // Outline must appear AFTER the clipped interior group so paint seams stay crisp
      const clipGroupIdx = shaded.indexOf('clip-path="url(#cc-test-torso-clip)"');
      const outlineIdx = shaded.indexOf('fill="none"');
      expect(outlineIdx).toBeGreaterThan(clipGroupIdx);

      // Fallback to celPath when no shadow or highlight interior is specified
      const flat = celShadedShape({
        clipId: 'cc-flat-clip',
        d: 'M 0 0 L 10 0 L 10 10 Z',
        baseFill: TOKENS.classicCel.colors.mochiCollar,
      });
      expect(flat).not.toContain('<clipPath');
      expect(flat).toContain(`fill="${TOKENS.classicCel.colors.mochiCollar}"`);
      expect(flat).toContain(`stroke="${TOKENS.classicCel.colors.xeroxInk}"`);

      // Supports unstroked shaded shapes
      const unstroked = celShadedShape({
        clipId: 'cc-unstroked-clip',
        d: 'M 0 0 L 10 0 L 10 10 Z',
        baseFill: TOKENS.classicCel.colors.foliageMid,
        shadowPaths: ['M 0 5 L 10 5 L 10 10 Z'],
        shadowFill: TOKENS.classicCel.colors.foliageShadow,
        stroke: 'none',
      });
      expect(unstroked).toContain('<clipPath id="cc-unstroked-clip">');
      expect(unstroked).not.toContain('fill="none"');
    });

    it('renders painterly gouache washes via gouachePath and soft ground shadows via celContactShadow', () => {
      const softWash = gouachePath(
        'M 0 0 L 100 0 L 100 50 Z',
        TOKENS.classicCel.colors.foliageLit,
        { id: 'wash-hill', opacity: 0.85 }
      );
      expect(softWash).toContain('id="wash-hill"');
      expect(softWash).toContain('filter="url(#gouache-wash)"');
      expect(softWash).toContain('stroke="none"');
      expect(softWash).toContain('opacity="0.85"');

      const crispWash = gouachePath(
        'M 0 0 L 100 0 L 100 50 Z',
        TOKENS.classicCel.colors.stoneBase,
        {
          softEdge: false,
          stroke: TOKENS.classicCel.colors.xeroxInkSoft,
          strokeWidth: 1.2,
        }
      );
      expect(crispWash).not.toContain('url(#gouache-wash)');
      expect(crispWash).toContain(
        `stroke="${TOKENS.classicCel.colors.xeroxInkSoft}"`
      );
      expect(crispWash).toContain('stroke-width="1.2"');

      const shadow = celContactShadow(12.345, -1.234, 28.5, 6.25, 0.36);
      expect(shadow).toContain('<ellipse');
      expect(shadow).toContain('cx="12.35"');
      expect(shadow).toContain('cy="-1.23"');
      expect(shadow).toContain('rx="28.5"');
      expect(shadow).toContain('ry="6.25"');
      expect(shadow).toContain(`fill="${TOKENS.classicCel.colors.contactShadow}"`);
      expect(shadow).toContain('opacity="0.36"');
      expect(shadow).toContain('data-part="cel-contact-shadow"');
    });

    it('defaults celPath to #xerox-ink for stroked paths and supports xeroxSketchStroke & gouacheDabWash', () => {
      const defaultCel = celPath('M 0 0 L 20 10 Z', TOKENS.classicCel.colors.mochiFurBase);
      expect(defaultCel).toContain('filter="url(#xerox-ink)"');
      expect(defaultCel).toContain(`stroke="${TOKENS.classicCel.colors.xeroxInk}"`);

      const unstrokedCel = celPath('M 0 0 L 20 10 Z', TOKENS.classicCel.colors.mochiFurBase, {
        stroke: 'none',
      });
      expect(unstrokedCel).not.toContain('url(#xerox-ink)');

      const sketch = xeroxSketchStroke('M 2 4 Q 8 2, 14 5', {
        id: 'cheek-tuft',
        broken: true,
        feather: true,
      });
      expect(sketch).toContain('id="cheek-tuft"');
      expect(sketch).toContain('data-part="xerox-sketch"');
      expect(sketch).toContain('stroke-dasharray="7 3 3 2.5"');
      expect(sketch).toContain('filter="url(#xerox-ink)"');

      const dabs = gouacheDabWash(
        [
          { cx: 100, cy: 80, rx: 40, ry: 26, rotate: -8 },
          { cx: 145, cy: 92, rx: 34, ry: 22, fill: TOKENS.classicCel.colors.sageFoliage },
        ],
        {
          id: 'canopy-wash',
          fill: TOKENS.classicCel.colors.oliveCanopy,
          wetEdgeColor: TOKENS.classicCel.colors.foliageShadow,
          highlightFill: TOKENS.classicCel.colors.foliageRim,
          seed: 3,
        }
      );
      expect(dabs).toContain('id="canopy-wash"');
      expect(dabs).toContain('filter="url(#gouache-wash)"');
      expect(dabs).toContain(`fill="${TOKENS.classicCel.colors.oliveCanopy}"`);
      expect(dabs).toContain(`fill="${TOKENS.classicCel.colors.sageFoliage}"`);
      expect(dabs).toContain(`stroke="${TOKENS.classicCel.colors.foliageShadow}"`);
      expect(dabs).toContain(`fill="${TOKENS.classicCel.colors.foliageRim}"`);
    });

    it('renders wet-on-wet watercolorWashBlotches, pencilFoliageScribbles, and pencilGrassStrokes', () => {
      const blotches = watercolorWashBlotches(
        [
          { cx: 120, cy: 90, rx: 56, ry: 34, fill: TOKENS.classicCel.colors.sageFoliage },
          { cx: 170, cy: 105, rx: 48, ry: 30, fill: TOKENS.classicCel.colors.oliveCanopy, opacity: 0.64 },
        ],
        { id: 'wc-bush', seed: 4 }
      );
      expect(blotches).toContain('id="wc-bush"');
      expect(blotches).toContain('filter="url(#watercolor-wash-soft)"');
      expect(blotches).toContain(`fill="${TOKENS.classicCel.colors.sageFoliage}"`);
      expect(blotches).toContain(`fill="${TOKENS.classicCel.colors.oliveCanopy}"`);

      const foliage = pencilFoliageScribbles(
        [{ cx: 140, cy: 95, rx: 48, ry: 28, density: 1.2 }],
        { id: 'pencil-bush', seed: 5 }
      );
      expect(foliage).toContain('id="pencil-bush"');
      expect(foliage).toContain('filter="url(#pencil-bg-sketch)"');
      expect(foliage).toContain(`stroke="${TOKENS.classicCel.colors.pencilOliveCharcoal}"`);
      expect(foliage).toContain('<circle');

      const grass = pencilGrassStrokes(
        [{ x: 200, y: 540, width: 32, height: 11, blades: 5 }],
        { id: 'pencil-grass', seed: 7 }
      );
      expect(grass).toContain('id="pencil-grass"');
      expect(grass).toContain('filter="url(#pencil-bg-sketch)"');
      expect(grass).toContain(`stroke="${TOKENS.classicCel.colors.xeroxInk}"`);
      expect(grass).toContain('<path');
    });
  });

  describe('Theatrical framing (evaluateTheatricalFrameState & renderTheatricalFrameOverlay)', () => {
    it('evaluates opening iris + gold-serif title card, story pass-through, and closing iris-out + The End card', () => {
      // Opening start (t = 0): iris closed, dark veil up
      const openStart = evaluateTheatricalFrameState({
        timeSec: 0,
        durationSec: 20,
        fps: 12,
        sceneTitle: "Mochi's Moonlit Garden",
        sceneSubtitle: 'A Moonlit Short',
      });
      expect(openStart.enabled).toBe(true);
      expect(openStart.phase).toBe('opening');
      expect(openStart.mode).toBe('iris');
      expect(openStart.irisProgress).toBe(0);
      expect(openStart.blackVeilOpacity).toBeGreaterThan(0.8);
      expect(openStart.title).toBe("Mochi's Moonlit Garden");
      expect(openStart.subtitle).toBe('A Moonlit Short');

      // Mid opening (t = 1.2s of 3.0s): iris opening, title card held at full opacity
      const openMid = evaluateTheatricalFrameState({
        timeSec: 1.2,
        durationSec: 20,
        fps: 12,
        sceneTitle: "Mochi's Moonlit Garden",
      });
      expect(openMid.phase).toBe('opening');
      expect(openMid.irisProgress).toBeGreaterThan(0.5);
      expect(openMid.titleCardOpacity).toBe(1);
      expect(openMid.endingCardOpacity).toBe(0);

      // Story phase (t = 10s): fully open, zero overlays
      const story = evaluateTheatricalFrameState({
        timeSec: 10,
        durationSec: 20,
        fps: 12,
        sceneTitle: "Mochi's Moonlit Garden",
      });
      expect(story.enabled).toBe(true);
      expect(story.phase).toBe('story');
      expect(story.irisProgress).toBe(1);
      expect(story.blackVeilOpacity).toBe(0);
      expect(story.titleCardOpacity).toBe(0);
      expect(story.endingCardOpacity).toBe(0);

      // Closing phase (t = 19.5s of 20s): iris closed, "The End" card visible
      const closingEnd = evaluateTheatricalFrameState({
        timeSec: 19.5,
        durationSec: 20,
        fps: 12,
        sceneTitle: "Mochi's Moonlit Garden",
        config: {
          irisFocus: { x: 700, y: 580 },
          endingTitle: 'The End',
          endingCredit: 'Sweet Dreams',
        },
      });
      expect(closingEnd.phase).toBe('closing');
      expect(closingEnd.irisProgress).toBe(0);
      expect(closingEnd.blackVeilOpacity).toBe(1);
      expect(closingEnd.endingCardOpacity).toBe(1);
      expect(closingEnd.irisFocus).toEqual({ x: 700, y: 580 });
      expect(closingEnd.endingTitle).toBe('The End');
      expect(closingEnd.endingCredit).toBe('Sweet Dreams');
    });

    it('supports fade mode, showTitleCard=false, 12 FPS quantization, and disabled bypass', () => {
      const fadeStart = evaluateTheatricalFrameState({
        timeSec: 0,
        durationSec: 20,
        fps: 12,
        config: { mode: 'fade', showTitleCard: false },
        sceneTitle: 'Fade Short',
      });
      expect(fadeStart.mode).toBe('fade');
      expect(fadeStart.irisProgress).toBe(1);
      expect(fadeStart.blackVeilOpacity).toBe(1);
      expect(fadeStart.titleCardOpacity).toBe(0);

      // Within a single 12 FPS frame (0 .. 0.0833s), state must stay quantized
      const q1 = evaluateTheatricalFrameState({
        timeSec: 0.01,
        durationSec: 20,
        fps: 12,
        sceneTitle: 'Quantized',
      });
      const q2 = evaluateTheatricalFrameState({
        timeSec: 0.06,
        durationSec: 20,
        fps: 12,
        sceneTitle: 'Quantized',
      });
      expect(q1).toEqual(q2);

      // Disabled via config=false or short duration (<= 4s)
      const disabled = evaluateTheatricalFrameState({
        timeSec: 0,
        durationSec: 20,
        config: false,
        sceneTitle: 'Off',
      });
      expect(disabled.enabled).toBe(false);
      expect(disabled.phase).toBe('story');

      const tooShort = evaluateTheatricalFrameState({
        timeSec: 0,
        durationSec: 3.5,
        sceneTitle: 'Too Short',
      });
      expect(tooShort.enabled).toBe(false);
    });

    it('renders opening title card, passes story markup through untouched, and renders closing iris + The End card', () => {
      const rawScene = '<g id="inner-cel-scene"></g>';

      // Story pass-through must be byte-for-byte identical
      const storyState = evaluateTheatricalFrameState({
        timeSec: 8,
        durationSec: 20,
        fps: 12,
        sceneTitle: 'Test & Tales',
      });
      expect(
        renderTheatricalFrameOverlay({
          innerSceneMarkup: rawScene,
          width: 1280,
          height: 720,
          theatricalState: storyState,
        })
      ).toBe(rawScene);

      // Opening iris + gold-serif title card with XML escaping
      const openState = evaluateTheatricalFrameState({
        timeSec: 0.9,
        durationSec: 20,
        fps: 12,
        sceneTitle: 'Cats & Moons',
        sceneSubtitle: 'A <Classic> Short',
      });
      const openSvg = renderTheatricalFrameOverlay({
        innerSceneMarkup: rawScene,
        width: 1280,
        height: 720,
        theatricalState: openState,
      });
      expect(openSvg).toContain('id="theatrical-frame-wrapper"');
      expect(openSvg).toContain('data-theatrical-phase="opening"');
      expect(openSvg).toContain('id="theatrical-iris-matte"');
      expect(openSvg).toContain('fill-rule="evenodd"');
      expect(openSvg).toContain('id="theatrical-opening-title"');
      expect(openSvg).toContain('Cats &amp; Moons');
      expect(openSvg).toContain('A &lt;Classic&gt; Short');
      expect(openSvg).toContain(`fill="${TOKENS.classicCel.colors.goldTitle}"`);
      expect(openSvg).not.toContain('<ellipse');
      expect(openSvg).toContain(rawScene);

      // Closing iris-out + "The End" card focused on custom irisFocus
      const closeState = evaluateTheatricalFrameState({
        timeSec: 19.2,
        durationSec: 20,
        fps: 12,
        sceneTitle: 'Cats & Moons',
        config: {
          irisFocus: { x: 690, y: 585 },
          endingTitle: 'The End',
          endingCredit: 'Classic Cel Studio',
        },
      });
      const closeSvg = renderTheatricalFrameOverlay({
        innerSceneMarkup: rawScene,
        width: 1280,
        height: 720,
        theatricalState: closeState,
      });
      expect(closeSvg).toContain('data-theatrical-phase="closing"');
      expect(closeSvg).toContain('id="theatrical-iris-matte"');
      expect(closeSvg).toContain('id="theatrical-fade-veil"');
      expect(closeSvg).toContain('id="theatrical-ending-card"');
      expect(closeSvg).toContain('The End');
      expect(closeSvg).toContain('Classic Cel Studio');
    });
  });

  describe('Classic cel filter defs & Layer 3 film composite (filters.ts)', () => {
    it('emits all 7 classic cel filters & vignette defs when artStyle is classic_cel', () => {
      const defs = renderEngineDefs({
        seed: 4,
        artStyle: 'classic_cel',
        extraDefs: ['<linearGradient id="extra-sky-grad" />'],
      });

      const celIds = TOKENS.classicCel.filters.ids;
      expect(defs).toContain(`id="${celIds.xeroxInk}"`);
      expect(defs).toContain(`id="${celIds.gouacheWash}"`);
      expect(defs).toContain(`id="${celIds.celDropShadow}"`);
      expect(defs).toContain(`id="${celIds.celSoftGlow}"`);
      expect(defs).toContain(`id="${celIds.celGrade}"`);
      expect(defs).toContain(`id="${celIds.filmGrain}"`);
      expect(defs).toContain(`id="${celIds.filmVignette}"`);
      expect(defs).toContain(`id="${TOKENS.classicCel.filters.boardTexture.id}"`);
      expect(defs).toContain(`id="${TOKENS.classicCel.filters.watercolorSoft.id}"`);
      expect(defs).toContain(`id="${TOKENS.classicCel.filters.pencilBgSketch.id}"`);
      expect(TOKENS.classicCel.filters.filmGrain.overlayOpacity).toBeLessThanOrEqual(0.05);
      expect(defs).toContain('<radialGradient id="film-vignette"');
      expect(defs).toContain('id="extra-sky-grad"');

      // Disabling displacement filter zeroes Xerox & gouache scales cleanly
      const defsNoDisplace = renderEngineDefs({
        seed: 4,
        artStyle: 'classic_cel',
        enableCrayonFilter: false,
      });
      expect(defsNoDisplace).toContain('scale="0"');
    });

    it('renders Layer 3 35mm film grain + vignette composite via renderFilmCompositeLayer', () => {
      const enabled = renderFilmCompositeLayer(1280, 720, true);
      expect(enabled).toContain('id="layer-3-film-composite"');
      expect(enabled).toContain('data-enabled="true"');
      expect(enabled).toContain(`fill="${svgUrl(TOKENS.classicCel.filters.ids.filmVignette)}"`);
      expect(enabled).toContain(`filter="${svgUrl(TOKENS.classicCel.filters.ids.filmGrain)}"`);
      expect(enabled).toContain('mix-blend-mode: overlay;');

      const grainDisabled = renderFilmCompositeLayer(1280, 720, false);
      expect(grainDisabled).toContain('id="layer-3-film-composite"');
      expect(grainDisabled).toContain('data-enabled="false"');
      expect(grainDisabled).toContain(`fill="${svgUrl(TOKENS.classicCel.filters.ids.filmVignette)}"`);
      expect(grainDisabled).not.toContain(
        `filter="${svgUrl(TOKENS.classicCel.filters.ids.filmGrain)}"`
      );
    });
  });

  describe('evaluateAndRenderScene integration for classic_cel and crayon backward compatibility', () => {
    it('renders classic_cel scenes at 12 FPS with theatricalFrame, #cel-backdrop, film composite, gradients, and cel speech bubbles', () => {
      const scene = buildClassicCelTestScene();

      // Opening phase (t = 1.0s)
      const opening = evaluateAndRenderScene(scene, 1.0);
      expect(opening.frame.clock.fps).toBe(12);
      expect(opening.bookFrame.enabled).toBe(false);
      expect(opening.theatricalFrame?.enabled).toBe(true);
      expect(opening.theatricalFrame?.phase).toBe('opening');
      expect(opening.svg).toContain('data-art-style="classic_cel"');
      expect(opening.svg).toContain('data-book-phase="disabled"');
      expect(opening.svg).toContain('data-theatrical-phase="opening"');
      expect(opening.svg).toContain('id="theatrical-opening-title"');

      // Story phase (t = 8.0s)
      const story = evaluateAndRenderScene(scene, 8.0);
      expect(story.frame.clock.fps).toBe(12);
      expect(story.theatricalFrame?.phase).toBe('story');
      expect(story.svg).toContain('data-art-style="classic_cel"');
      expect(story.svg).toContain('data-theatrical-phase="story"');
      expect(story.svg).toContain('id="cel-backdrop"');
      expect(story.svg).not.toContain('id="paper-base"');
      expect(story.svg).toContain('id="layer-1-base-scene" filter="url(#cel-grade)"');
      expect(story.svg).toContain('id="layer-1a-painted-background"');
      expect(story.svg).toContain('filter="url(#bg-board-texture)"');
      expect(story.svg).toContain('id="layer-1b-acetate-cels"');
      expect(story.svg).toContain('id="layer-3-film-composite"');
      expect(story.svg).not.toContain('id="layer-3-paper-composite"');

      // Linear & radial background_patch gradients + direct gouache fill
      expect(story.svg).toContain('<linearGradient id="bg-grad-sky-wash"');
      expect(story.svg).toContain('fill="url(#bg-grad-sky-wash)"');
      expect(story.svg).toContain('<radialGradient id="custom-moon-radial"');
      expect(story.svg).toContain('fill="url(#custom-moon-radial)"');
      expect(story.svg).toContain(
        `fill="${TOKENS.classicCel.colors.grassNightMid}"`
      );
      expect(story.svg).toContain('filter="url(#gouache-wash)"');

      // Character-attached classic cel speech bubble + standalone thought bubble
      expect(story.svg).toContain('data-character-speech="hero-cat"');
      expect(story.svg).toContain('What a lovely moon!');
      expect(story.svg).toContain('filter="url(#cel-drop-shadow)"');
      expect(story.svg).toContain(`fill="${TOKENS.classicCel.colors.celBubbleFill}"`);
      expect(story.svg).toContain(`stroke="${TOKENS.classicCel.colors.xeroxInk}"`);
      expect(story.svg).toContain('Soft cel thoughts');

      // Direct renderAnnotation check for classic_cel vs crayon speech bubble styling
      const celSpeech = renderAnnotation({
        text: 'Hello cel!',
        bubbleStyle: 'speech',
        artStyle: 'classic_cel',
      });
      expect(celSpeech).toContain('filter="url(#cel-drop-shadow)"');
      expect(celSpeech).toContain(`fill="${TOKENS.classicCel.colors.celBubbleFill}"`);
      expect(celSpeech).not.toContain('url(#crayon-stroke)');
      expect(celSpeech).not.toContain('url(#crayon-outline)');

      // Closing phase (t = 15.5s)
      const closing = evaluateAndRenderScene(scene, 15.5);
      expect(closing.theatricalFrame?.phase).toBe('closing');
      expect(closing.svg).toContain('data-theatrical-phase="closing"');
      expect(closing.svg).toContain('id="theatrical-ending-card"');
      expect(closing.svg).toContain('The End');
    });

    it('preserves 100% backward compatibility for crayon scenes (6 FPS, paper base, paper composite, bookFrame)', () => {
      const opening = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 0);
      expect(opening.frame.clock.fps).toBe(6);
      expect(opening.bookFrame.enabled).toBe(true);
      expect(opening.bookFrame.phase).toBe('opening');
      expect(opening.theatricalFrame?.enabled).toBe(false);
      expect(opening.svg).toContain('data-art-style="crayon"');
      expect(opening.svg).toContain('data-book-phase="opening"');
      expect(opening.svg).toContain('data-theatrical-phase="disabled"');
      expect(opening.svg).toContain('id="book-frame-spread"');
      expect(opening.svg).not.toContain('id="theatrical-frame-wrapper"');

      const story = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 15.0);
      expect(story.frame.clock.fps).toBe(6);
      expect(story.bookFrame.phase).toBe('story');
      expect(story.svg).toContain('data-art-style="crayon"');
      expect(story.svg).toContain('id="paper-base"');
      expect(story.svg).not.toContain('id="cel-backdrop"');
      expect(story.svg).toContain('id="layer-3-paper-composite"');
      expect(story.svg).not.toContain('id="layer-3-film-composite"');
      expect(story.svg).toContain('id="crayon-stroke"');
      expect(story.svg).toContain('mix-blend-mode: multiply;');

      const crayonSpeech = renderAnnotation({
        text: 'Hello crayon!',
        bubbleStyle: 'speech',
      });
      expect(crayonSpeech).toContain('url(#crayon-stroke)');
      expect(crayonSpeech).toContain(`fill="${TOKENS.colors.paperWarm}"`);
      expect(crayonSpeech).not.toContain('url(#cel-drop-shadow)');
    });
  });
});

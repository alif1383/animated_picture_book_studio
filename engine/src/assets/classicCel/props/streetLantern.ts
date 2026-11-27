import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { WatercolorBlotch } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1980s *Mickey's Christmas Carol*-style hand-inked Victorian
 * wrought-iron garden lamp (`'street_lantern'`): flat analog iron paint with sketchy
 * Xerox toner ink (`celPath` + `xeroxSketchStroke`), warm parchment-gold painted glass
 * panes, hand-drawn flickering candle flame, and soft wet-on-wet painterly warm ochre
 * `watercolorWashBlotches` light washes around the glass and ground pool + delicate
 * sketchy light-ray ticks when `lit: true` (NO sterile digital circles or neon glow!).
 *
 * Origin: `(0, 0)` at lamp base.
 * Footprint: `~x: -16..52, y: -132..0`.
 */
export function renderClassicStreetLantern(options: PropRenderOptions): string {
  const { lit = true, frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Gentle 12 FPS hand-drawn candle flicker & subtle painterly wash breath
  const flameTilt = steppedOscillate(frameIndex, 10, 6.0, variant * 3);
  const flamePulse = steppedOscillate(frameIndex, 14, 0.1, variant * 5);
  const washShift = steppedOscillate(frameIndex, 18, 1.2, variant * 2);
  const wobble = round2(deterministicJitter(frameIndex % 12, variant, 0.4));

  // Soft wet-on-wet painterly warm ochre watercolor wash pooling on the ground path when lit
  const groundWashBlotches: WatercolorBlotch[] = [
    { cx: 17, cy: 1.5, rx: round2(30 + washShift * 0.5), ry: 7.2, fill: c.warmAmberWash, opacity: 0.28, rotate: -3 },
    { cx: 19, cy: 1, rx: round2(19 + washShift * 0.35), ry: 5.0, fill: c.warmAmberGlow, opacity: 0.3, rotate: 4 },
    { cx: 12, cy: 2.2, rx: 14, ry: 4.0, fill: c.ochreEarth, opacity: 0.24, rotate: -5 },
  ];
  const groundAmberPool = lit
    ? svgEl('g', { 'data-part': 'lantern-ground-pool' }, [
        watercolorWashBlotches(groundWashBlotches, {
          opacity: round2(0.84 + flamePulse * 0.35),
          seed: variant * 13 + 2,
        }),
      ])
    : '';

  // Soft wet-on-wet warm ochre watercolor light wash around the lantern glass (no sterile digital circles!)
  const haloBlotches: WatercolorBlotch[] = [
    { cx: 18, cy: -99, rx: round2(28 + washShift), ry: round2(26 + washShift * 0.8), fill: c.warmAmberWash, opacity: 0.24, rotate: -10 },
    { cx: round2(19 + wobble), cy: -100, rx: round2(21 + washShift * 0.6), ry: round2(20 + washShift * 0.5), fill: c.warmAmberGlow, opacity: 0.28, rotate: 14 },
    { cx: 17.5, cy: -98.5, rx: round2(14 + washShift * 0.35), ry: round2(15 + washShift * 0.3), fill: c.warmAmberCore, opacity: 0.3, rotate: -6 },
  ];

  // Tiny sketchy hand-inked parchment-gold light-ray ticks radiating from the glass
  const rayFlicker = round2(0.45 + (flamePulse + 0.1) * 1.4);
  const warmPainterlyHalo = lit
    ? svgEl('g', { 'data-part': 'lantern-halo' }, [
        watercolorWashBlotches(haloBlotches, {
          opacity: round2(0.86 + flamePulse * 0.35),
          seed: variant * 19 + 4,
        }),
        svgEl('g', { 'data-part': 'lantern-ray-ticks', opacity: rayFlicker }, [
          xeroxSketchStroke(
            `M 4 -103 L ${round2(-1 - washShift * 0.4)} -105 M 5 -93 L ${round2(0 - washShift * 0.3)} -91 M 32 -103 L ${round2(37 + washShift * 0.4)} -105 M 31 -93 L ${round2(36 + washShift * 0.3)} -91`,
            {
              stroke: c.parchmentCream,
              strokeWidth: 0.95,
              broken: true,
              dasharray: '4 2',
              opacity: 0.72,
            }
          ),
          xeroxSketchStroke(
            'M 30 -111 L 34 -115 M 7 -111 L 3 -115 M 29 -84 L 33 -80',
            {
              stroke: c.antiqueGold,
              strokeWidth: 0.85,
              opacity: 0.62,
            }
          ),
        ]),
      ])
    : '';

  // Stepped Victorian cast-iron pedestal base (flat matte analog iron paint + Xerox ink)
  const plinthBase = svgEl('g', { 'data-part': 'lantern-base' }, [
    celShadedShape({
      d: 'M -12 0 L 12 0 L 11 -4.5 L 8 -5.5 L 7 -11 L 4.5 -14 L -4.5 -14 L -7 -11 L -8 -5.5 L -11 -4.5 Z',
      baseFill: c.ironDark,
      highlightPaths: ['M 2.5 -14 L 12 -14 L 12 0 L 3.5 0 C 4 -5, 4 -10, 2.5 -14 Z'],
      highlightFill: c.ironHighlight,
      highlightOpacity: 0.42,
      clipId: `cc-lantern-base-clip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    xeroxSketchStroke('M -9 -5.5 L 8.5 -5.5 M -5.5 -11 L 5.5 -11', {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
      broken: true,
      opacity: 0.75,
    }),
  ]);

  // Slender tapered iron post + molded decorative collar rings
  const ironPost = svgEl('g', { 'data-part': 'lantern-post' }, [
    celPath(
      'M -3.4 -14 L -2.3 -116 L 2.3 -116 L 3.4 -14 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M 1.1 -17 L 0.8 -113', {
      stroke: c.ironHighlight,
      strokeWidth: 0.9,
      broken: true,
      dasharray: '14 6 9 5',
      opacity: 0.58,
    }),
    xeroxSketchStroke('M -1.8 -28 L -1.5 -88', {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
      broken: true,
      opacity: 0.62,
    }),
    celPath('M -5.2 -26 L 5.2 -26 L 4.5 -23 L -4.5 -23 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -4.4 -94 L 4.4 -94 L 3.8 -91.5 L -3.8 -91.5 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -4 -116 L 0 -124 L 4 -116 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
  ]);

  // Decorative Victorian wrought-iron scroll bracket supporting the lantern at x = 18
  const scrollBracket = svgEl('g', { 'data-part': 'lantern-bracket' }, [
    xeroxSketchStroke('M 0 -115 C 0 -128, 12 -131, 18 -126 L 18 -122', {
      stroke: c.ironDark,
      strokeWidth: 2.9,
      feather: true,
      opacity: 0.96,
    }),
    xeroxSketchStroke('M 1.8 -117 C 2.8 -126.5, 11.5 -129, 17 -125.5', {
      stroke: c.ironHighlight,
      strokeWidth: 0.8,
      broken: true,
      opacity: 0.54,
    }),
    xeroxSketchStroke('M 2 -100 C 11 -101, 14 -112, 8 -115 C 4 -117, 3 -111, 7 -110', {
      stroke: c.xeroxInk,
      strokeWidth: 1.75,
      feather: true,
      opacity: 0.92,
    }),
    xeroxSketchStroke('M 2 -108 C 8 -113, 14 -120, 17 -124', {
      stroke: c.xeroxInk,
      strokeWidth: 1.25,
      broken: true,
      opacity: 0.84,
    }),
  ]);

  // Hand-drawn flickering candle & warm flame inside glass
  const candleFlame = lit
    ? svgEl('g', { 'data-part': 'lantern-candle' }, [
        celPath('M 16.4 -92 L 19.6 -92 L 19.4 -86.5 L 16.6 -86.5 Z', c.parchmentCream, {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.75,
        }),
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: 18,
              y: -92.5,
              rotate: flameTilt,
              scaleX: round2(1 - flamePulse * 0.35),
              scaleY: round2(1 + flamePulse),
            }),
          },
          [
            celPath(
              'M 0 0 C -2.8 -1.6, -2.5 -5.8, 0 -8.8 C 2.5 -5.8, 2.8 -1.6, 0 0 Z',
              c.warmAmberWash,
              { stroke: c.xeroxInkSoft, strokeWidth: 0.7 }
            ),
            svgEl('path', {
              d: 'M 0 -0.8 C -1.4 -1.8, -1.3 -4.5, 0 -6.4 C 1.3 -4.5, 1.4 -1.8, 0 -0.8 Z',
              fill: c.warmAmberCore,
            }),
          ]
        ),
      ])
    : '';

  // Hanging Victorian mullioned glass lantern box with pitched finial cap (flat analog cel paint)
  const lanternHousing = svgEl('g', { 'data-part': 'lantern-housing' }, [
    celShadedShape({
      d: 'M 9 -112 L 27 -112 L 24 -86 L 12 -86 Z',
      baseFill: lit ? c.warmAmberGlow : c.slateBlue,
      shadowPaths: lit
        ? ['M 9 -112 L 13.5 -112 L 14.5 -86 L 12 -86 Z', 'M 22.5 -112 L 27 -112 L 24 -86 L 21.5 -86 Z']
        : ['M 9 -112 L 16 -112 L 16.5 -86 L 12 -86 Z'],
      shadowFill: lit ? c.warmAmberWash : c.stoneShadow,
      shadowOpacity: lit ? 0.55 : 0.65,
      highlightPaths: lit
        ? ['M 14.2 -108 L 21.8 -108 L 20.8 -89 L 15.2 -89 Z']
        : ['M 20 -110 L 25 -110 L 23 -92 L 19.5 -92 Z'],
      highlightFill: lit ? c.warmAmberCore : c.stoneLight,
      highlightOpacity: lit ? 0.68 : 0.35,
      clipId: `cc-lantern-glass-clip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    candleFlame,
    xeroxSketchStroke(
      'M 18 -112 L 18 -86 M 13.5 -112 L 14.5 -86 M 22.5 -112 L 21.5 -86',
      {
        stroke: c.xeroxInk,
        strokeWidth: 1.2,
        opacity: 0.92,
      }
    ),
    celShadedShape({
      d: 'M 6.5 -112 L 10 -116 L 18 -122.5 L 26 -116 L 29.5 -112 Z',
      baseFill: c.ironDark,
      highlightPaths: ['M 18 -123 L 30 -112 L 18 -112 Z'],
      highlightFill: c.ironHighlight,
      highlightOpacity: 0.38,
      clipId: `cc-lantern-cap-clip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 16.2 -122.5 L 18 -129.5 L 19.8 -122.5 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 10.5 -86 L 25.5 -86 L 22 -82.5 L 18 -79.5 L 14 -82.5 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'street_lantern',
      'data-art-style': 'classic_cel',
      'data-lit': lit ? 'true' : 'false',
    },
    [
      celContactShadow(0, 1, 13.5, 3.6, 0.3),
      groundAmberPool,
      warmPainterlyHalo,
      plinthBase,
      ironPost,
      scrollBracket,
      lanternHousing,
    ]
  );
}

import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  deterministicJitter,
  pencilFoliageScribbles,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type {
  PencilFoliageCluster,
  WatercolorBlotch,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1973 *Robin Hood* close-up style woodland tree (`'tree'`):
 * - Canopy painted with soft, cloudy wet-on-wet `watercolorWashBlotches` shifting
 *   organically from pale moonlit sage-cream/olive top highlights through mid sage-green
 *   washes to deep blue-green shadow puddles underneath (ZERO hard black outline!).
 * - Directly on top of the soft watercolor washes, dense expressive `pencilFoliageScribbles`
 *   (irregular curly `w`/`m`/`c` leaf-cluster loops, twigs, and scattered dark olive-charcoal
 *   pencil stipple dots across shadowed undersides and foliage contours).
 * - Gnarled trunk painted with soft wet-on-wet watercolor bark washes + crisp loose
 *   `xeroxSketchStroke` bark lines & root toes.
 *
 * Origin: `(0, 0)` at trunk base.
 * Footprint: `~x: -66..66, y: -140..0`.
 */
export function renderClassicTree(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Gentle 12 FPS woodland breeze sway seeded by variant
  const crownSway = steppedOscillate(frameIndex, 36, 1.25, variant * 7);
  const upperSway = steppedOscillate(frameIndex, 36, 0.65, variant * 7 + 4);
  const trunkFlex = round2(crownSway * 0.2);

  // Variant-driven organic asymmetry so neighboring treeline trees feel hand-painted
  const mirrorSign = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // Grounded wet-on-wet watercolor shadow wash beneath roots
  const groundBlotches: WatercolorBlotch[] = [
    { cx: -14, cy: 1.5, rx: 18, ry: 4.5, fill: c.foliageShadow, opacity: 0.44, rotate: -3 },
    { cx: 6, cy: 2, rx: 22, ry: 5, fill: c.nightDeepGlade, opacity: 0.42, rotate: 2 },
    { cx: 18, cy: 0.5, rx: 14, ry: 3.8, fill: c.foliageShadow, opacity: 0.34, rotate: 4 },
  ];
  const groundWash = watercolorWashBlotches(groundBlotches, {
    seed: variant * 7 + 1,
    opacity: 0.85,
  });

  // Gnarled trunk silhouette with soft clipped watercolor bark washes + crisp Xerox ink
  const trunkD =
    'M -19 0 C -13 -5, -11 -16, -9.5 -34 C -8.5 -50, -10.5 -64, -17 -79 L -9 -84 C -6 -72, -3 -72, 0.5 -84 L 12.5 -78 C 8 -63, 7.5 -47, 9 -29 C 10.5 -15, 13.5 -5, 20 0 C 12 -1, 6 -3, 1.5 -1 C -3.5 1, -9 -2, -19 0 Z';
  const trunkClipId = `cc-tree-trunk-clip-${uid}`;

  const trunkBarkBlotches: WatercolorBlotch[] = [
    { cx: -8, cy: -42, rx: 12, ry: 38, fill: c.woodDark, opacity: 0.72, rotate: -4 },
    { cx: 4, cy: -36, rx: 11, ry: 34, fill: c.woodMid, opacity: 0.65, rotate: 3 },
    { cx: 9, cy: -48, rx: 7, ry: 26, fill: c.woodLit, opacity: 0.54, rotate: 5 },
    { cx: -4, cy: -8, rx: 16, ry: 9, fill: c.woodDark, opacity: 0.62, rotate: -2 },
  ];

  // Reaching dark branches peeking faintly inside the cloudy canopy
  const innerLimbsBlotches: WatercolorBlotch[] = [
    { cx: -18, cy: -82, rx: 14, ry: 5, fill: c.woodDark, opacity: 0.58, rotate: 34 },
    { cx: 16, cy: -84, rx: 14, ry: 5, fill: c.woodDark, opacity: 0.56, rotate: -32 },
    { cx: 1, cy: -92, rx: 5, ry: 14, fill: c.woodDark, opacity: 0.48, rotate: -6 },
  ];

  // Crisp loose hand-drawn Xerox ink bark lines, knot & root toes
  const trunkInk = svgEl('g', { 'data-part': 'trunk-ink-detail' }, [
    xeroxSketchStroke(
      'M -18 -1 C -12 -7, -10.5 -19, -9.5 -35 C -8.5 -51, -10.5 -65, -16 -77',
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '14 3 9 2.5 16 4',
        feather: true,
        opacity: 0.84,
      }
    ),
    xeroxSketchStroke(
      'M 19 -1 C 13 -7, 10.5 -18, 9 -34 C 8 -49, 8.5 -63, 12.5 -77',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '11 4 8 3 12 4',
        opacity: 0.74,
      }
    ),
    xeroxSketchStroke(
      'M -5.5 -6 C -4.5 -22, -5.5 -39, -4.5 -58 M 2.5 -9 C 1.8 -27, 2.8 -46, 4.5 -66',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '8 3 5 3',
        opacity: 0.7,
      }
    ),
    xeroxSketchStroke(
      'M -3 -35 C -0.5 -39, 2.5 -36.5, 0.8 -31.5 C -1 -28.5, -3.5 -31, -3 -35 M -12 -3 Q -7 -7, -4.5 -13 M 12 -3 Q 7.5 -8, 5.5 -15',
      {
        stroke: c.xeroxInk,
        strokeWidth: 0.9,
        opacity: 0.68,
      }
    ),
    xeroxSketchStroke(
      'M -11 -73 Q -21 -83, -30 -91 M 8 -73 Q 18 -84, 27 -92',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.95,
        broken: true,
        opacity: 0.66,
      }
    ),
  ]);

  // ── Canopy Wet-on-Wet Watercolor Blotches (11 overlapping soft puddles, ZERO hard outline!) ──
  const lowerCanopyBlotches: WatercolorBlotch[] = [
    // Deep blue-green / forest shadow puddles anchoring lower canopy
    { cx: round2(-36 + j(1, 3)), cy: -72, rx: 24, ry: 17, fill: c.foliageShadow, opacity: 0.72, rotate: -14 },
    { cx: round2(2 + j(2, 3)), cy: -66, rx: 30, ry: 18, fill: c.nightDeepGlade, opacity: 0.64, rotate: 4 },
    { cx: round2(36 + j(3, 3)), cy: -74, rx: 24, ry: 17, fill: c.foliageShadow, opacity: 0.7, rotate: 12 },
    // Mid sage-green & olive body washes bleeding together
    { cx: round2(-40 + j(4, 3)), cy: -90, rx: 22, ry: 16, fill: c.foliageMid, opacity: 0.66, rotate: -18 },
    { cx: round2(-16 + j(5, 3)), cy: -104, rx: 26, ry: 20, fill: c.oliveCanopy, opacity: 0.68, rotate: 8 },
    { cx: round2(18 + j(6, 3)), cy: -102, rx: 26, ry: 19, fill: c.foliageMid, opacity: 0.66, rotate: -10 },
    { cx: round2(38 + j(7, 3)), cy: -88, rx: 21, ry: 16, fill: c.oliveCanopy, opacity: 0.64, rotate: 15 },
    { cx: round2(0 + j(8, 3)), cy: -84, rx: 24, ry: 17, fill: c.foliageLit, opacity: 0.56, rotate: -6 },
  ];

  const upperHighlightBlotches: WatercolorBlotch[] = [
    // Pale moonlit sage-cream / olive crown highlights on top
    { cx: round2(-12 + j(9, 2)), cy: -120, rx: 22, ry: 15, fill: c.sageFoliage, opacity: 0.64, rotate: -12 },
    { cx: round2(14 + j(10, 2)), cy: -122, rx: 22, ry: 14, fill: c.foliageRim, opacity: 0.58, rotate: 10 },
    { cx: round2(28 + j(11, 2)), cy: -104, rx: 17, ry: 12, fill: c.sageFoliage, opacity: 0.52, rotate: 16 },
    { cx: round2(6 + j(12, 2)), cy: -126, rx: 15, ry: 9, fill: c.parchmentCream, opacity: 0.24, rotate: -4 },
  ];

  // ── Expressive Robin Hood Crisp Hand-Drawn Pencil Foliage Scribbles & Stipple Dots ──
  const lowerScribbleClusters: PencilFoliageCluster[] = [
    // Dense shadowed under-canopy curly w/m/c leaf loops + twigs + stipple dots
    { cx: round2(-36 + j(13, 3)), cy: -74, rx: 22, ry: 15, density: 1.45, stroke: c.xeroxInk, opacity: 0.88, seed: variant * 11 + 1 },
    { cx: round2(0 + j(14, 3)), cy: -70, rx: 26, ry: 15, density: 1.5, stroke: c.pencilOliveCharcoal, opacity: 0.9, seed: variant * 11 + 3 },
    { cx: round2(36 + j(15, 3)), cy: -76, rx: 22, ry: 15, density: 1.4, stroke: c.xeroxInk, opacity: 0.86, seed: variant * 11 + 5 },
    // Mid-bough ragged foliage pockets
    { cx: round2(-20 + j(16, 3)), cy: -98, rx: 22, ry: 16, density: 1.25, stroke: c.pencilOliveCharcoal, opacity: 0.82, seed: variant * 11 + 7 },
    { cx: round2(22 + j(17, 3)), cy: -96, rx: 22, ry: 16, density: 1.25, stroke: c.pencilOliveCharcoal, opacity: 0.82, seed: variant * 11 + 9 },
  ];

  const upperScribbleClusters: PencilFoliageCluster[] = [
    // Lighter sketchy crown rim leaf scribbles & floating ink stipples
    { cx: round2(-8 + j(18, 2)), cy: -118, rx: 20, ry: 13, density: 1.05, stroke: c.pencilOliveCharcoal, opacity: 0.72, seed: variant * 13 + 2 },
    { cx: round2(18 + j(19, 2)), cy: -116, rx: 19, ry: 12, density: 1.0, stroke: c.xeroxInkSoft, opacity: 0.68, seed: variant * 13 + 4 },
  ];

  const canopyLayer = svgEl(
    'g',
    {
      'data-part': 'foliage-canopy',
      transform: svgTransform({
        rotate: crownSway,
        pivotX: 0,
        pivotY: -66,
        scaleX: mirrorSign,
        scaleY: 1,
      }),
    },
    [
      // Soft wet-on-wet watercolor base canopy + faint inner limbs
      watercolorWashBlotches(lowerCanopyBlotches, {
        seed: variant * 17 + 2,
        opacity: 0.95,
      }),
      watercolorWashBlotches(innerLimbsBlotches, {
        seed: variant * 19 + 5,
        opacity: 0.75,
      }),
      // Upper moonlit watercolor crown wash + light top pencil scribbles (secondary breeze phase)
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: upperSway,
            pivotX: 0,
            pivotY: -102,
          }),
        },
        [
          watercolorWashBlotches(upperHighlightBlotches, {
            seed: variant * 23 + 3,
            opacity: 0.9,
          }),
          pencilFoliageScribbles(upperScribbleClusters, {
            stroke: c.pencilOliveCharcoal,
            strokeWidth: 1.15,
            opacity: 0.78,
            seed: variant * 29 + 1,
            includeTwigs: true,
            includeDots: true,
          }),
        ]
      ),
      // Crisp, dense Robin Hood hand-drawn pencil leaf loops & stipples directly over soft watercolor!
      pencilFoliageScribbles(lowerScribbleClusters, {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.25,
        opacity: 0.86,
        seed: variant * 31 + 4,
        includeTwigs: true,
        includeDots: true,
      }),
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'tree',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: trunkClipId }, svgEl('path', { d: trunkD })),
      ]),
      groundWash,
      svgEl(
        'g',
        {
          'data-part': 'tree-trunk',
          transform: svgTransform({
            rotate: trunkFlex,
            pivotX: 0,
            pivotY: 0,
          }),
        },
        [
          // Flat base trunk tone + soft clipped wet-on-wet watercolor bark mottling
          svgEl('path', { d: trunkD, fill: c.woodMid, stroke: 'none' }),
          svgEl(
            'g',
            { 'clip-path': svgUrl(trunkClipId) },
            watercolorWashBlotches(trunkBarkBlotches, {
              seed: variant * 13 + 7,
              opacity: 0.92,
            })
          ),
          trunkInk,
        ]
      ),
      canopyLayer,
    ]
  );
}

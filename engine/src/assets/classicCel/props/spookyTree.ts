import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
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
 * Renders the 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973 Sherwood Forest)
 * Gnarled Spooky Tree (`'spooky_tree'`).
 *
 * - Background Layer 1A twisted watercolor/gouache gnarled bark (`woodDark`, `woodMid`,
 *   `woodLit`, `xeroxSketchStroke`), dark trunk hollow with expressive blinking warm-amber
 *   owl/firefly eyes (`data-part="spooky-hollow-eyes"`, `warmAmberCore`), and gnarled misty
 *   olive-charcoal watercolor canopy (`watercolorWashBlotches` + `pencilFoliageScribbles`,
 *   `data-part="spooky-canopy"`, subtle 12 FPS sway).
 * - Origin `(0, 0)` at root base (`y = +4`).
 * - Exact local SVG bounds: `x: -92..+92, y: -198..+4` (`184 × 202`).
 */
export function renderClassicSpookyTree(
  options: PropRenderOptions = { kind: 'spooky_tree' }
): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const trunkClipId = `cc-spooky-trunk-clip-${uid}`;

  // Subtle 12 FPS woodland breeze sway & periodic blinking hollow eyes
  const canopySway = steppedOscillate(frameIndex, 32, 1.4, variant * 5);
  const upperSway = steppedOscillate(frameIndex, 32, 0.75, variant * 5 + 4);
  const trunkFlex = round2(canopySway * 0.2);
  const blink = isSteppedBlinkFrame(frameIndex, 36, 2, variant * 5);

  const mirrorSign = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // Grounded mossy watercolor shadow wash at root base
  const groundWash = watercolorWashBlotches(
    [
      { cx: -18, cy: 1.5, rx: 24, ry: 3.5, fill: c.nightDeepGlade, opacity: 0.46, rotate: -2 },
      { cx: 8, cy: 2, rx: 26, ry: 3.5, fill: c.foliageShadow, opacity: 0.44, rotate: 2 },
      { cx: 24, cy: 1, rx: 16, ry: 2.8, fill: c.nightDeepGlade, opacity: 0.34, rotate: 3 },
    ],
    { seed: variant * 7 + 2, opacity: 0.88 }
  );

  // 1. Gnarled Roots, Twisted Trunk & Reaching Crooked Branches
  const trunkD = [
    'M -34 4',
    'C -20 -10, -16 -38, -18 -72',
    'C -36 -92, -56 -110, -68 -126',
    'L -52 -130',
    'C -38 -114, -22 -100, -12 -88',
    'L -6 -136 L 8 -136 L 12 -92',
    'C 26 -106, 44 -118, 62 -128',
    'L 70 -118',
    'C 50 -106, 30 -92, 16 -74',
    'C 18 -38, 22 -10, 36 4',
    'L 16 4 C 10 -4, 4 -8, 0 -2 C -4 -8, -10 -4, -16 4 Z',
  ].join(' ');

  const trunkBarkBlotches: WatercolorBlotch[] = [
    { cx: -12, cy: -42, rx: 14, ry: 44, fill: c.woodDark, opacity: 0.78, rotate: -4 },
    { cx: 4, cy: -48, rx: 13, ry: 42, fill: c.woodMid, opacity: 0.68, rotate: 3 },
    { cx: 12, cy: -58, rx: 9, ry: 32, fill: c.woodLit, opacity: 0.42, rotate: 5 },
    { cx: -38, cy: -102, rx: 24, ry: 11, fill: c.woodDark, opacity: 0.72, rotate: 38 },
    { cx: 38, cy: -104, rx: 24, ry: 11, fill: c.woodDark, opacity: 0.68, rotate: -34 },
    { cx: -14, cy: -6, rx: 22, ry: 10, fill: c.foliageShadow, opacity: 0.48, rotate: -3 },
    { cx: 16, cy: -6, rx: 20, ry: 9, fill: c.foliageShadow, opacity: 0.44, rotate: 4 },
  ];

  const trunkInk = svgEl('g', { 'data-part': 'spooky-trunk-ink' }, [
    xeroxSketchStroke(
      'M -33 3 C -20 -10, -16 -38, -18 -72 C -36 -92, -56 -110, -67 -125',
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
        broken: true,
        dasharray: '15 3 10 2.5',
        feather: true,
        opacity: 0.88,
      }
    ),
    xeroxSketchStroke(
      'M 35 3 C 22 -10, 18 -38, 16 -74 C 30 -92, 50 -106, 69 -118',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '13 3.5 9 3',
        opacity: 0.8,
      }
    ),
    // Twisted gnarled bark grooves, root toes & crooked branch forks
    xeroxSketchStroke(
      [
        'M -10 -12 C -7 -32, -12 -52, -8 -74 C -6 -88, -10 -104, -16 -118',
        'M 8 -14 C 11 -36, 6 -56, 10 -78 C 14 -92, 22 -104, 34 -114',
        'M -22 -2 Q -14 -10, -9 -22 M 22 -2 Q 14 -10, 9 -20',
        'M -42 -108 Q -54 -112, -62 -104 M 40 -106 Q 54 -104, 62 -98',
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '9 3 5 2.5',
        opacity: 0.76,
      }
    ),
  ]);

  // 2. Dark Trunk Hollow with Expressive Blinking Warm-Amber Owl/Firefly Eyes (`data-part="spooky-hollow-eyes"`)
  const hollowD =
    'M -10 -52 C -10 -65, 10 -65, 10 -52 C 10 -39, -10 -39, -10 -52 Z';

  const hollowEyes = svgEl('g', { 'data-part': 'spooky-hollow-eyes' }, [
    // Outer gnarled bark lip around hollow
    svgEl('path', {
      d: 'M -12.5 -52 C -12.5 -68, 12.5 -68, 12.5 -52 C 12.5 -36, -12.5 -36, -12.5 -52 Z',
      fill: c.woodDark,
      stroke: 'none',
    }),
    // Deep recessed hollow interior
    svgEl('path', {
      d: hollowD,
      fill: c.backdropDark,
      stroke: 'none',
    }),
    xeroxSketchStroke(hollowD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      opacity: 0.9,
    }),
    xeroxSketchStroke(
      'M -12 -46 C -13.5 -54, -11.5 -62, -6 -66 M 12 -46 C 13.5 -54, 11.5 -62, 6 -66',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.74,
      }
    ),
    // Expressive blinking warm-amber eyes (100% flat cel/amber paint, ZERO neon halo)
    blink
      ? xeroxSketchStroke(
          'M -6.8 -51.5 Q -4.2 -49.5, -1.6 -51.5 M 1.6 -51.5 Q 4.2 -49.5, 6.8 -51.5',
          {
            stroke: c.warmAmberWash,
            strokeWidth: s.xeroxFine,
            opacity: 0.85,
          }
        )
      : svgEl('g', {}, [
          // Soft warm amber outer iris rims
          svgEl('ellipse', {
            cx: -4.2,
            cy: -52,
            rx: 2.8,
            ry: 2.3,
            transform: 'rotate(8, -4.2, -52)',
            fill: c.warmAmberGlow,
          }),
          svgEl('ellipse', {
            cx: 4.2,
            cy: -52,
            rx: 2.8,
            ry: 2.3,
            transform: 'rotate(-8, 4.2, -52)',
            fill: c.warmAmberGlow,
          }),
          // Bright warm-amber eye cores
          svgEl('ellipse', {
            cx: -4.2,
            cy: -52,
            rx: 2.0,
            ry: 1.7,
            fill: c.warmAmberCore,
          }),
          svgEl('ellipse', {
            cx: 4.2,
            cy: -52,
            rx: 2.0,
            ry: 1.7,
            fill: c.warmAmberCore,
          }),
          // Alert dark pupils & tiny parchment catchlights
          svgEl('circle', { cx: -3.9, cy: -52, r: 0.85, fill: c.xeroxInk }),
          svgEl('circle', { cx: 4.5, cy: -52, r: 0.85, fill: c.xeroxInk }),
          svgEl('circle', { cx: -4.7, cy: -52.6, r: 0.45, fill: c.parchmentCream }),
          svgEl('circle', { cx: 3.7, cy: -52.6, r: 0.45, fill: c.parchmentCream }),
        ]),
  ]);

  // 3. Gnarled Misty Olive-Charcoal Watercolor Canopy (`data-part="spooky-canopy"`)
  // Kept comfortably inside x: -92..+92, y: -198..-96 including soft watercolor feathering!
  const lowerCanopyBlotches: WatercolorBlotch[] = [
    // Deep misty Sherwood shadow puddles underneath boughs
    { cx: round2(-48 + j(1, 3)), cy: -124, rx: 28, ry: 18, fill: c.nightDeepGlade, opacity: 0.76, rotate: -16 },
    { cx: round2(0 + j(2, 3)), cy: -118, rx: 36, ry: 18, fill: c.foliageShadow, opacity: 0.74, rotate: 3 },
    { cx: round2(48 + j(3, 3)), cy: -124, rx: 28, ry: 18, fill: c.nightDeepGlade, opacity: 0.74, rotate: 14 },
    // Gnarled olive-charcoal & deep glade mid-canopy washes
    { cx: round2(-52 + j(4, 3)), cy: -144, rx: 26, ry: 19, fill: c.foliageShadow, opacity: 0.72, rotate: -18 },
    { cx: round2(-20 + j(5, 3)), cy: -158, rx: 30, ry: 22, fill: c.oliveCanopy, opacity: 0.68, rotate: 8 },
    { cx: round2(22 + j(6, 3)), cy: -156, rx: 30, ry: 22, fill: c.foliageMid, opacity: 0.68, rotate: -10 },
    { cx: round2(52 + j(7, 3)), cy: -142, rx: 26, ry: 19, fill: c.foliageShadow, opacity: 0.7, rotate: 16 },
    { cx: round2(0 + j(8, 3)), cy: -142, rx: 30, ry: 20, fill: c.nightGladeMid, opacity: 0.56, rotate: -4 },
  ];

  const innerCrookedLimbs: WatercolorBlotch[] = [
    { cx: -28, cy: -132, rx: 18, ry: 5, fill: c.woodDark, opacity: 0.54, rotate: 32 },
    { cx: 28, cy: -134, rx: 18, ry: 5, fill: c.woodDark, opacity: 0.52, rotate: -30 },
    { cx: 0, cy: -146, rx: 6, ry: 16, fill: c.woodDark, opacity: 0.44, rotate: -6 },
  ];

  const upperCanopyBlotches: WatercolorBlotch[] = [
    // Misty sage-teal & olive crown highlights
    { cx: round2(-14 + j(9, 2)), cy: -176, rx: 24, ry: 14, fill: c.sageFoliage, opacity: 0.54, rotate: -10 },
    { cx: round2(16 + j(10, 2)), cy: -176, rx: 24, ry: 14, fill: c.nightMistTeal, opacity: 0.44, rotate: 10 },
    { cx: round2(2 + j(11, 2)), cy: -180, rx: 18, ry: 10, fill: c.foliageRim, opacity: 0.42, rotate: -4 },
  ];

  const lowerScribbles: PencilFoliageCluster[] = [
    { cx: round2(-48 + j(12, 3)), cy: -126, rx: 26, ry: 16, density: 1.5, stroke: c.xeroxInk, opacity: 0.9, seed: variant * 11 + 1 },
    { cx: round2(0 + j(13, 3)), cy: -122, rx: 32, ry: 16, density: 1.5, stroke: c.pencilOliveCharcoal, opacity: 0.9, seed: variant * 11 + 3 },
    { cx: round2(48 + j(14, 3)), cy: -126, rx: 26, ry: 16, density: 1.45, stroke: c.xeroxInk, opacity: 0.88, seed: variant * 11 + 5 },
    { cx: round2(-26 + j(15, 3)), cy: -152, rx: 26, ry: 18, density: 1.35, stroke: c.pencilOliveCharcoal, opacity: 0.84, seed: variant * 11 + 7 },
    { cx: round2(26 + j(16, 3)), cy: -150, rx: 26, ry: 18, density: 1.35, stroke: c.pencilOliveCharcoal, opacity: 0.84, seed: variant * 11 + 9 },
  ];

  const upperScribbles: PencilFoliageCluster[] = [
    { cx: round2(-12 + j(17, 2)), cy: -174, rx: 22, ry: 12, density: 1.15, stroke: c.pencilOliveCharcoal, opacity: 0.78, seed: variant * 13 + 2 },
    { cx: round2(16 + j(18, 2)), cy: -172, rx: 22, ry: 12, density: 1.1, stroke: c.xeroxInkSoft, opacity: 0.74, seed: variant * 13 + 4 },
  ];

  const canopy = svgEl(
    'g',
    {
      'data-part': 'spooky-canopy',
      transform: svgTransform({
        rotate: canopySway,
        pivotX: 0,
        pivotY: -110,
        scaleX: mirrorSign,
        scaleY: 1,
      }),
    },
    [
      watercolorWashBlotches(lowerCanopyBlotches, {
        seed: variant * 17 + 3,
        opacity: 0.96,
      }),
      watercolorWashBlotches(innerCrookedLimbs, {
        seed: variant * 19 + 5,
        opacity: 0.74,
      }),
      // Upper crown watercolor + pencil scribbles on secondary breeze phase
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: upperSway,
            pivotX: 0,
            pivotY: -154,
          }),
        },
        [
          watercolorWashBlotches(upperCanopyBlotches, {
            seed: variant * 23 + 3,
            opacity: 0.88,
          }),
          pencilFoliageScribbles(upperScribbles, {
            stroke: c.pencilOliveCharcoal,
            strokeWidth: 1.2,
            opacity: 0.8,
            seed: variant * 29 + 1,
            includeTwigs: true,
            includeDots: true,
          }),
        ]
      ),
      // Crisp, dense Sherwood hand-drawn pencil leaf loops & twigs over soft watercolor
      pencilFoliageScribbles(lowerScribbles, {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.3,
        opacity: 0.88,
        seed: variant * 31 + 4,
        includeTwigs: true,
        includeDots: true,
      }),
      // Gnarled crooked spooky twig tips poking subtly out of the foliage pockets
      xeroxSketchStroke(
        'M -56 -138 Q -68 -148, -76 -144 M 54 -136 Q 68 -146, 76 -140 M -6 -166 L -12 -184 M 8 -168 L 15 -184',
        {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.72,
        }
      ),
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'spooky_tree',
      'data-art-style': 'classic_cel',
      'data-variant': String(variant),
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: trunkClipId }, svgEl('path', { d: trunkD })),
      ]),
      groundWash,
      svgEl(
        'g',
        {
          'data-part': 'spooky-trunk',
          transform: svgTransform({
            rotate: trunkFlex,
            pivotX: 0,
            pivotY: 0,
          }),
        },
        [
          svgEl('path', { d: trunkD, fill: c.woodDark, stroke: 'none' }),
          svgEl(
            'g',
            { 'clip-path': svgUrl(trunkClipId) },
            watercolorWashBlotches(trunkBarkBlotches, {
              seed: variant * 13 + 7,
              opacity: 0.92,
            })
          ),
          trunkInk,
          hollowEyes,
        ]
      ),
      canopy,
    ]
  );
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';
import { renderStarShape } from './shared';

interface SparkleSpec {
  cx: number;
  cy: number;
  r: number;
  baseRot: number;
  colorKey: 'bananaYellow' | 'warmMoon';
  seedIndex: number;
}

const SPARKLE_SPECS: readonly SparkleSpec[] = [
  { cx: 28, cy: -21, r: 5.2, baseRot: 12, colorKey: 'bananaYellow', seedIndex: 1 },
  { cx: -28, cy: -18, r: 4.8, baseRot: -18, colorKey: 'warmMoon', seedIndex: 5 },
  { cx: 30, cy: 4, r: 4.5, baseRot: 24, colorKey: 'bananaYellow', seedIndex: 9 },
  { cx: 2, cy: 22, r: 4.6, baseRot: -8, colorKey: 'warmMoon', seedIndex: 13 },
  { cx: 4, cy: -22, r: 3.8, baseRot: 30, colorKey: 'bananaYellow', seedIndex: 17 },
];

/**
 * Renders an oversized hand-drawn storybook wooden bramble thorn (`'bramble_thorn'`)
 * pulled from a dragon's aching tooth.
 *
 * - Origin `(0, 0)` sits at the visual center for smooth rotation & parabolic flight.
 * - Local SVG bounds: `x: -38..+38, y: -30..+30` (`76 × 60`).
 * - When `options.lit` is `true` (default), renders 5 stepped `6 FPS` sparkle-pop
 *   star bursts and radial pop dashes jittered via `deterministicJitter`.
 */
export function renderBrambleThorn(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, fillMask } = options;

  const {
    woodBrown,
    hairBrown,
    ochreWall,
    charcoalOutline,
    faintPencil,
    radishRed,
    bananaYellow,
    warmMoon,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  // 1. Two small curved side barbs jutting from the upper and lower spine
  const sideBarbs = svgEl('g', { 'data-part': 'side-barbs' }, [
    // Upper-left hooked barb
    crayonPath(
      'M -7 -2 C -9 -11, -13 -16, -18 -17 C -12 -12, -10 -7, -1 -5 Z',
      woodBrown,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Lower-right hooked barb
    crayonPath(
      'M 2 9 C 8 14, 14 15, 19 14 C 13 11, 10 8, 9 4 Z',
      woodBrown,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
  ]);

  // 2. Main tapered curved woody spike with torn blunt base at bottom-left & sharp tip at upper-right
  const thornBody = svgEl('g', { 'data-part': 'thorn-body' }, [
    // Primary textured crayon wood spike
    crayonPath(
      'M -24 5 C -8 -4, 11 -11, 27 -15 C 12 3, -4 14, -20 18 C -26 16, -28 10, -24 5 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Subtle dark woody underside shading stroke
    svgEl('path', {
      d: 'M -19 15 C -4 11, 10 2, 22 -10',
      fill: 'none',
      stroke: hairBrown,
      'stroke-width': 2.4,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.58,
    }),
    // Lighter torn-wood cross-section pith at the snapped blunt base
    svgEl('ellipse', {
      cx: -23.2,
      cy: 11.4,
      rx: 2.6,
      ry: 4.4,
      transform: 'rotate(-24, -23.2, 11.4)',
      fill: ochreWall,
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  // 3. Hand-drawn wood grain hatch lines and small bark knot
  const woodGrain = svgEl('g', { 'data-part': 'wood-grain' }, [
    svgEl('path', {
      d: 'M -16 8 Q -2 2, 14 -7',
      fill: 'none',
      stroke: charcoalOutline,
      'stroke-width': annotationPencil,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.65,
    }),
    svgEl('path', {
      d: 'M -14 13 Q 0 8, 12 0',
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': annotationPencil,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.72,
    }),
    svgEl('path', {
      d: 'M -10 2 Q 2 -4, 15 -10',
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': annotationPencil,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.6,
    }),
    // Small curved wood knot near the thicker half
    svgEl('path', {
      d: 'M -13 9 C -11 7, -8 8, -9 10',
      fill: 'none',
      stroke: charcoalOutline,
      'stroke-width': 1.2,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.65,
    }),
    // Cross-hatch bark ticks
    svgEl('path', {
      d: 'M -18 11 L -15.5 14 M -4 6 L -2 9',
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': 1.2,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.6,
    }),
  ]);

  // 4. Tiny tender red sore-tip accent at the sharp point
  const soreTip = svgEl('g', { 'data-part': 'sore-tip' }, [
    crayonPath(
      'M 19 -12 C 22 -13, 25 -14, 27 -15 C 25 -12, 23 -10, 21 -8 C 20 -9.5, 19.5 -10.8, 19 -12 Z',
      radishRed,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    svgEl('circle', {
      cx: 23.5,
      cy: -12.5,
      r: 1.1,
      fill: bananaYellow,
      opacity: 0.75,
    }),
  ]);

  // 5. Small curled bramble leaf sprouting near the blunt base
  const brambleLeaf = svgEl('g', { 'data-part': 'bramble-leaf' }, [
    // Short stem joining the blunt base
    svgEl('path', {
      d: 'M -22.5 14.5 Q -25.5 16, -27 16.5',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Curled green bramble leaf blade
    crayonPath(
      'M -25 14 C -31 11, -36 15, -35 21 C -33 25, -26 26, -21 22 C -23 19, -24 17, -25 14 Z',
      getPatternFill('crayonTreeGreen'),
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Leaf midrib & tiny side veins
    svgEl('path', {
      d: 'M -25 15 Q -30 18, -33 21 M -28 17 L -30 14.5 M -29 18.5 L -27 21.5',
      fill: 'none',
      stroke: charcoalOutline,
      'stroke-width': 1.25,
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: 0.75,
    }),
  ]);

  // 6. Lively stepped 6 FPS sparkle-pop star bursts when lit (default true)
  const sparklePops = lit
    ? svgEl('g', { 'data-part': 'sparkle-pops' }, [
        ...SPARKLE_SPECS.map((spec) => {
          const jx = deterministicJitter(spec.seedIndex, frameIndex, 1.4);
          const jy = deterministicJitter(spec.seedIndex + 1, frameIndex, 1.3);
          const jr = deterministicJitter(spec.seedIndex + 2, frameIndex, 0.5);
          const jRot = deterministicJitter(spec.seedIndex + 3, frameIndex, 20);
          const starFill =
            spec.colorKey === 'bananaYellow' ? bananaYellow : warmMoon;

          return crayonPath(
            renderStarShape(
              round2(spec.cx + jx),
              round2(spec.cy + jy),
              round2(spec.r + jr),
              round2(spec.baseRot + jRot)
            ),
            starFill,
            { strokeWidth: outlineThin, paperUnderlay: true }
          );
        }),
        // Crisp radial pop-burst dashes around the thorn
        svgEl('path', {
          d: [
            `M ${round2(20 + deterministicJitter(21, frameIndex, 1))} ${round2(-23 + deterministicJitter(22, frameIndex, 1))} L ${round2(22.5 + deterministicJitter(21, frameIndex, 1))} ${round2(-26.5 + deterministicJitter(22, frameIndex, 1))}`,
            `M ${round2(-31.5 + deterministicJitter(23, frameIndex, 1))} ${round2(-4 + deterministicJitter(24, frameIndex, 1))} L ${round2(-35.5 + deterministicJitter(23, frameIndex, 1))} ${round2(-6 + deterministicJitter(24, frameIndex, 1))}`,
            `M ${round2(20.5 + deterministicJitter(25, frameIndex, 1))} ${round2(17.5 + deterministicJitter(26, frameIndex, 1))} L ${round2(24.5 + deterministicJitter(25, frameIndex, 1))} ${round2(20.5 + deterministicJitter(26, frameIndex, 1))}`,
          ].join(' '),
          fill: 'none',
          stroke: charcoalOutline,
          'stroke-width': outlineThin,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'bramble_thorn',
      'data-lit': lit ? 'true' : 'false',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [sideBarbs, thornBody, woodGrain, soreTip, brambleLeaf, sparklePops]
  );
}
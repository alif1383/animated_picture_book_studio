import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  celShadedShape,
  deterministicJitter,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';
import { renderStarShape } from '../../props/shared';

interface SparkleSpec {
  cx: number;
  cy: number;
  r: number;
  baseRot: number;
  shape: 'fourPoint' | 'fivePoint';
  fillKey: 'parchmentCream' | 'antiqueGold' | 'sunGoldCore';
  seedIndex: number;
}

const SPARKLE_SPECS: readonly SparkleSpec[] = [
  { cx: 28, cy: -21, r: 5.2, baseRot: 10, shape: 'fourPoint', fillKey: 'sunGoldCore', seedIndex: 1 },
  { cx: -28, cy: -18, r: 4.8, baseRot: -14, shape: 'fivePoint', fillKey: 'parchmentCream', seedIndex: 5 },
  { cx: 30, cy: 4, r: 4.6, baseRot: 22, shape: 'fourPoint', fillKey: 'antiqueGold', seedIndex: 9 },
  { cx: 2, cy: 22, r: 4.5, baseRot: -8, shape: 'fourPoint', fillKey: 'parchmentCream', seedIndex: 13 },
  { cx: 4, cy: -22, r: 3.8, baseRot: 28, shape: 'fivePoint', fillKey: 'sunGoldCore', seedIndex: 17 },
];

/**
 * Generates a classic 1970s hand-inked 4-point cel sparkle star centered at `(cx, cy)`.
 */
function renderClassicFourPointSparkle(
  cx: number,
  cy: number,
  r: number,
  rotDeg = 0
): string {
  const inner = r * 0.28;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = ((i * 45 + rotDeg - 90) * Math.PI) / 180;
    const px = round2(cx + Math.cos(angle) * rad);
    const py = round2(cy + Math.sin(angle) * rad);
    pts.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

/**
 * Renders the 1970s–80s Classic Hand-Drawn Cel hero woody bramble thorn (`'bramble_thorn'`)
 * pulled from the dragon's aching tooth.
 *
 * - Hero Layer 1B flat matte analog cel paint (`woodMid`, `woodDark`, `woodLit`,
 *   `soldierCrimson` sore tip, `dragonEmerald` leaf) + raw electrostatic `#xerox-ink`
 *   charcoal outlines (`celPath`/`celShadedShape`) + feathery internal `xeroxSketchStroke`
 *   wood-grain ticks. ZERO gradients, ZERO glow.
 * - Origin `(0, 0)` sits at visual center for smooth mid-air spin & parabolic flight.
 * - Exact local SVG bounds: `x: -38..+38, y: -30..+30` (`76 × 60`).
 * - Honors `lit` (default `true`): renders stepped 12 FPS hand-inked parchment/gold
 *   sparkle stars & radial pop dashes (`data-part="sparkle-pops"`).
 */
export function renderClassicBrambleThorn(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // 1. Two small curved matte-cel woody side barbs (`data-part="side-barbs"`)
  const sideBarbs = svgEl('g', { 'data-part': 'side-barbs' }, [
    celShadedShape({
      d: 'M -7 -2 C -9 -11, -13 -16, -18 -17 C -12 -12, -10 -7, -1 -5 Z',
      baseFill: c.woodMid,
      shadowFill: c.woodDark,
      shadowPaths: ['M -7 -2 C -8 -8, -11 -13, -18 -17 L -10 -9 L -1 -5 Z'],
      clipId: `cc-thorn-barb-u-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celShadedShape({
      d: 'M 2 9 C 8 14, 14 15, 19 14 C 13 11, 10 8, 9 4 Z',
      baseFill: c.woodMid,
      shadowFill: c.woodDark,
      shadowPaths: ['M 2 9 C 8 14, 14 15, 19 14 L 11 11 L 4 7 Z'],
      clipId: `cc-thorn-barb-l-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
  ]);

  // 2. Main tapered curved woody spike (`data-part="thorn-body"`)
  const thornBody = svgEl('g', { 'data-part': 'thorn-body' }, [
    celShadedShape({
      d: 'M -24 5 C -8 -4, 11 -11, 27 -15 C 12 3, -4 14, -20 18 C -26 16, -28 10, -24 5 Z',
      baseFill: c.woodMid,
      shadowFill: c.woodDark,
      shadowPaths: [
        'M -22 14 C -6 10, 9 1, 27 -15 C 15 4, -2 15, -20 19 C -26 18, -28 15, -22 14 Z',
      ],
      highlightFill: c.woodLit,
      highlightPaths: [
        'M -23 6 C -8 -3, 10 -10, 24 -14 C 11 -7, -6 1, -21 9 Z',
      ],
      highlightOpacity: 0.9,
      clipId: `cc-thorn-body-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),
    // Lighter snapped-wood pith cross-section at blunt base
    celPath(
      'M -25.4 7.5 C -23.4 6.6, -20.8 8.3, -20.2 11.2 C -19.6 14.1, -21.0 16.2, -23.0 15.6 C -25.2 15.0, -26.8 12.6, -26.5 9.8 C -26.4 8.6, -26.0 7.8, -25.4 7.5 Z',
      c.ochreEarth,
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }
    ),
    // Tiny inner matte cream wood-pith core dot
    svgEl('ellipse', {
      cx: -23.3,
      cy: 11.5,
      rx: 1.2,
      ry: 2.1,
      transform: 'rotate(-22, -23.3, 11.5)',
      fill: c.celCream,
      stroke: 'none',
    }),
  ]);

  // 3. Feathery Xerox graphite wood-grain hatch ticks & bark knot (`data-part="wood-grain"`)
  const woodGrain = svgEl('g', { 'data-part': 'wood-grain' }, [
    xeroxSketchStroke('M -16 8 Q -2 2, 14 -7', {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      broken: true,
      dasharray: '8 2.5 5 2',
      opacity: 0.78,
    }),
    xeroxSketchStroke('M -14 13 Q 0 8, 12 0', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      broken: true,
      dasharray: '7 3 4 2.5',
      opacity: 0.72,
    }),
    xeroxSketchStroke('M -10 2 Q 2 -4, 15 -10', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.85,
      opacity: 0.65,
    }),
    // Curved bark knot & fine cross-hatch bark ticks
    xeroxSketchStroke(
      'M -13 9 C -11 7, -8 8, -9 10 M -18 11 L -15.5 14 M -4 6 L -2 9',
      {
        stroke: c.xeroxInk,
        strokeWidth: 0.9,
        opacity: 0.74,
      }
    ),
  ]);

  // 4. Matte cel crimson sore tip at the sharp point (`data-part="sore-tip"`)
  const soreTip = svgEl('g', { 'data-part': 'sore-tip' }, [
    celShadedShape({
      d: 'M 19 -12 C 22 -13, 25 -14, 27 -15 C 25 -12, 23 -10, 21 -8 C 20 -9.5, 19.5 -10.8, 19 -12 Z',
      baseFill: c.soldierCrimson,
      shadowFill: c.soldierCrimsonShadow,
      shadowPaths: ['M 20 -9.5 L 27 -15 L 21 -7.5 Z'],
      clipId: `cc-thorn-tip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('circle', {
      cx: 23.4,
      cy: -12.4,
      r: 1.05,
      fill: c.parchmentCream,
      stroke: 'none',
    }),
  ]);

  // 5. Curled emerald bramble leaf near blunt base (`data-part="bramble-leaf"`)
  const brambleLeaf = svgEl('g', { 'data-part': 'bramble-leaf' }, [
    xeroxSketchStroke('M -22.5 14.5 Q -25.5 16, -27 16.5', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      opacity: 0.9,
    }),
    celShadedShape({
      d: 'M -25 14 C -31 11, -36 15, -35 21 C -33 25, -26 26, -21 22 C -23 19, -24 17, -25 14 Z',
      baseFill: c.dragonEmerald,
      shadowFill: c.dragonEmeraldShadow,
      shadowPaths: ['M -35 20 C -32 25, -25 26, -21 22 C -25 21, -30 20, -35 20 Z'],
      highlightFill: c.dragonEmeraldLit,
      highlightPaths: ['M -25 14 C -30 12, -34 15, -34 18 C -30 16, -27 16, -25 14 Z'],
      highlightOpacity: 0.9,
      clipId: `cc-thorn-leaf-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke(
      'M -25 15 Q -30 18, -33 21 M -28 17 L -30 14.5 M -29 18.5 L -27 21.5',
      {
        stroke: c.xeroxInk,
        strokeWidth: 0.95,
        opacity: 0.82,
      }
    ),
  ]);

  // 6. Stepped 12 FPS hand-inked parchment/gold sparkle stars & radial pop dashes (`data-part="sparkle-pops"`)
  const sparklePops = lit
    ? svgEl('g', { 'data-part': 'sparkle-pops' }, [
        ...SPARKLE_SPECS.map((spec, idx) => {
          const pulse = steppedOscillate(frameIndex, 8, 0.75, idx * 2);
          const jx = deterministicJitter(spec.seedIndex, frameIndex, 1.1);
          const jy = deterministicJitter(spec.seedIndex + 1, frameIndex, 1.0);
          const jRot = deterministicJitter(spec.seedIndex + 3, frameIndex, 16);
          const cx = round2(spec.cx + jx);
          const cy = round2(spec.cy + jy);
          const r = round2(Math.max(2.4, spec.r + pulse));
          const rot = round2(spec.baseRot + jRot);
          const fill = c[spec.fillKey];

          const d =
            spec.shape === 'fourPoint'
              ? renderClassicFourPointSparkle(cx, cy, r, rot)
              : renderStarShape(cx, cy, r, rot);

          return celPath(d, fill, {
            stroke: c.xeroxInk,
            strokeWidth: s.xeroxFine,
          });
        }),
        // Crisp 12 FPS hand-inked radial pop-burst dashes around the thorn
        xeroxSketchStroke(
          [
            `M ${round2(20 + deterministicJitter(21, frameIndex, 0.9))} ${round2(-23 + deterministicJitter(22, frameIndex, 0.9))} L ${round2(22.8 + deterministicJitter(21, frameIndex, 0.9))} ${round2(-26.5 + deterministicJitter(22, frameIndex, 0.9))}`,
            `M ${round2(-31 + deterministicJitter(23, frameIndex, 0.9))} ${round2(-4 + deterministicJitter(24, frameIndex, 0.9))} L ${round2(-35 + deterministicJitter(23, frameIndex, 0.9))} ${round2(-6 + deterministicJitter(24, frameIndex, 0.9))}`,
            `M ${round2(20.5 + deterministicJitter(25, frameIndex, 0.9))} ${round2(17.5 + deterministicJitter(26, frameIndex, 0.9))} L ${round2(24.5 + deterministicJitter(25, frameIndex, 0.9))} ${round2(20.5 + deterministicJitter(26, frameIndex, 0.9))}`,
            `M ${round2(-15 + deterministicJitter(27, frameIndex, 0.8))} ${round2(-22 + deterministicJitter(28, frameIndex, 0.8))} L ${round2(-17 + deterministicJitter(27, frameIndex, 0.8))} ${round2(-25.5 + deterministicJitter(28, frameIndex, 0.8))}`,
          ].join(' '),
          {
            stroke: c.xeroxInk,
            strokeWidth: s.xeroxFine,
            opacity: 0.88,
          }
        ),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'bramble_thorn',
      'data-art-style': 'classic_cel',
      'data-lit': lit ? 'true' : 'false',
    },
    [sideBarbs, thornBody, woodGrain, soreTip, brambleLeaf, sparklePops]
  );
}

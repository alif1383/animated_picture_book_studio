import { TOKENS } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973)
 * slatted oak crate brimming with earthy crimson & russet orchard apples (`'apple_crate'`).
 *
 * Origin: `(0, 0)` bottom-center.
 * Bounds: `x: -24..+24, y: -39.5..0`.
 */
export function renderClassicAppleCrate(options: PropRenderOptions): string {
  const { variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const apples: ReadonlyArray<{
    cx: number;
    cy: number;
    r: number;
    fill: string;
    shadow: string;
    leafDir?: -1 | 1;
  }> = [
    // Back crest row (center top stays <= -39.5 including stem)
    {
      cx: -13.5,
      cy: -28.2,
      r: 7.4,
      fill: c.soldierCrimson,
      shadow: c.soldierCrimsonShadow,
      leafDir: -1,
    },
    {
      cx: 13.5,
      cy: -28.2,
      r: 7.4,
      fill: c.cottageRoof,
      shadow: c.cottageRoofShadow,
      leafDir: 1,
    },
    {
      cx: 0,
      cy: -31.2,
      r: 7.6,
      fill: c.soldierCrimson,
      shadow: c.soldierCrimsonShadow,
    },
    // Front tuck row peeking over crate lip
    {
      cx: -7.5,
      cy: -24.5,
      r: 6.4,
      fill: c.cottageRoof,
      shadow: c.cottageRoofShadow,
    },
    {
      cx: 7.5,
      cy: -24.5,
      r: 6.4,
      fill: c.soldierCrimson,
      shadow: c.soldierCrimsonShadow,
    },
  ];

  const appleEls = apples.flatMap((a, idx) => {
    const circleD = `M ${round2(a.cx - a.r)} ${a.cy} A ${a.r} ${a.r} 0 1 0 ${round2(a.cx + a.r)} ${a.cy} A ${a.r} ${a.r} 0 1 0 ${round2(a.cx - a.r)} ${a.cy} Z`;
    const els: string[] = [
      celShadedShape({
        d: circleD,
        baseFill: a.fill,
        shadowPaths: [
          `M ${round2(a.cx + 0.8)} ${round2(a.cy - a.r)} L ${round2(a.cx + a.r + 1)} ${round2(a.cy - a.r)} L ${round2(a.cx + a.r + 1)} ${round2(a.cy + a.r + 1)} L ${round2(a.cx - a.r)} ${round2(a.cy + a.r + 1)} Q ${round2(a.cx + 1.5)} ${round2(a.cy + 1.2)}, ${round2(a.cx + 0.8)} ${round2(a.cy - a.r)} Z`,
        ],
        shadowFill: a.shadow,
        shadowOpacity: 0.72,
        clipId: `cc-apple-crate-ap-${uid}-${idx}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Matte cel specular highlight tick
      svgEl('path', {
        d: `M ${round2(a.cx - a.r * 0.44)} ${round2(a.cy - a.r * 0.28)} Q ${round2(a.cx - a.r * 0.24)} ${round2(a.cy - a.r * 0.54)}, ${round2(a.cx - a.r * 0.04)} ${round2(a.cy - a.r * 0.36)}`,
        fill: 'none',
        stroke: c.celCream,
        'stroke-width': 1.15,
        'stroke-linecap': 'round',
      }),
      // Tiny apple stem (center top reaches -39.4)
      xeroxSketchStroke(
        `M ${a.cx} ${round2(a.cy - a.r + 0.8)} Q ${round2(a.cx + 0.5)} ${round2(a.cy - a.r - 0.5)}, ${round2(a.cx + 0.9)} ${round2(Math.max(-39.4, a.cy - a.r - 1.2))}`,
        { stroke: c.woodDark, strokeWidth: 1.0 }
      ),
    ];

    if (a.leafDir) {
      els.push(
        celPath(
          `M ${round2(a.cx + 0.4)} ${round2(a.cy - a.r - 0.4)} Q ${round2(a.cx + a.leafDir * 4.5)} ${round2(a.cy - a.r - 3.2)}, ${round2(a.cx + a.leafDir * 5.6)} ${round2(a.cy - a.r + 0.2)} Q ${round2(a.cx + a.leafDir * 2.4)} ${round2(a.cy - a.r + 1.2)}, ${round2(a.cx + 0.4)} ${round2(a.cy - a.r - 0.4)} Z`,
          c.dragonEmeraldLit,
          { stroke: c.xeroxInk, strokeWidth: 0.85 }
        )
      );
    }
    return els;
  });

  return svgEl(
    'g',
    {
      'data-prop': 'apple_crate',
      'data-art-style': 'classic_cel',
    },
    [
      // Ground contact shadow strictly inside y <= 0
      celContactShadow(0, -1.2, 22, 1.2, 0.28),

      // Dark oak back rim behind fruit
      celPath('M -23 -25.5 L 23 -25.5 L 22.5 -22 L -22.5 -22 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
      }),

      // Brimming mound of orchard apples
      svgEl('g', { 'data-part': 'crate-apples' }, appleEls),

      // Slatted oak crate front (`x: -24..+24, y: -24..0`)
      svgEl('g', { 'data-part': 'crate-body' }, [
        // Dark interior slat shadow backing
        celPath('M -23.5 -23.5 L 23.5 -23.5 L 21.8 -0.2 L -21.8 -0.2 Z', c.woodDark, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Top oak horizontal slat (sunlit woodLit)
        celPath('M -24 -24 L 24 -24 L 23.4 -16.8 L -23.4 -16.8 Z', c.woodLit, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Middle oak horizontal slat (woodMid)
        celPath('M -23.2 -15.4 L 23.2 -15.4 L 22.6 -8.4 L -22.6 -8.4 Z', c.woodMid, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Bottom oak horizontal slat (woodMid + lower shadow band)
        celShadedShape({
          d: 'M -22.5 -7.0 L 22.5 -7.0 L 22.0 0 L -22.0 0 Z',
          baseFill: c.woodMid,
          shadowPaths: ['M -22.5 -2.6 L 22.5 -2.6 L 22.0 0 L -22.0 0 Z'],
          shadowFill: c.woodDark,
          clipId: `cc-apple-crate-bot-${uid}`,
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Left & right vertical corner battens
        celPath('M -24 -24 L -18.5 -24 L -17.2 0 L -22 0 Z', c.woodMid, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 18.5 -24 L 24 -24 L 22 0 L 17.2 0 Z', c.woodDark, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Sketchy horizontal oak wood-grain ticks
        xeroxSketchStroke(
          'M -14 -20.6 L 12 -20.2 M -12 -11.8 L 14 -12.1 M -13 -3.8 L 10 -4.0',
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.78,
            broken: true,
            opacity: 0.65,
          }
        ),
        // Forged-iron corner nailheads
        ...[-21, 21].flatMap((nx) =>
          [-20.5, -12, -3.6].map((ny) =>
            svgEl('circle', {
              cx: round2(nx * (ny > -8 ? 0.96 : 1)),
              cy: ny,
              r: 0.95,
              fill: c.ironDark,
            })
          )
        ),
      ]),
    ]
  );
}

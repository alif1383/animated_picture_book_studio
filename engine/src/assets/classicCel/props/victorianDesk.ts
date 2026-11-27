import { TOKENS, svgUrl } from '../../../theme/tokens';
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
 * Renders an authentic 1983 *Mickey's Christmas Carol*-inspired slanted Victorian
 * wooden ledger & clockmaker's desk (`'victorian_desk'`):
 * - Turned wooden legs with sketchy wood-grain scratches (`xeroxSketchStroke`) and
 *   walnut watercolor mottling (`watercolorWashBlotches`).
 * - Slanted writing lid with an open cream parchment ledger book, crimson feather
 *   quill in a dark inkwell, tiny brass clockmaker's gears, and a small candle in
 *   a brass saucer (`lit: true` adds a 12 FPS hand-drawn flame + soft ochre watercolor wash).
 *
 * Origin: `(0, 0)` at floor center.
 * Footprint: `~x: -62..62, y: -76..4` (proportional waist-to-chest height `~64px`).
 */
export function renderClassicVictorianDesk(options: PropRenderOptions): string {
  const { lit = true, frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Gentle 12 FPS hand-drawn candle flicker
  const flameTilt = steppedOscillate(frameIndex, 10, 6.2, variant * 3);
  const flamePulse = steppedOscillate(frameIndex, 14, 0.1, variant * 5);
  const washShift = steppedOscillate(frameIndex, 18, 1.0, variant * 2);
  const wobble = round2(deterministicJitter(frameIndex % 12, variant, 0.35));

  const bodyClipId = `cc-desk-body-clip-${uid}`;
  const lidClipId = `cc-desk-lid-clip-${uid}`;

  // Desk structural silhouettes
  const apronD = 'M -52 -46 L 52 -46 L 50 -31 L -50 -31 Z';
  const slantedLidD = 'M -59 -46 L -53 -61 L 53 -61 L 59 -46 Z';

  // Soft floor contact watercolor wash beneath desk legs
  const floorWashBlotches: WatercolorBlotch[] = [
    { cx: -32, cy: 1.5, rx: 24, ry: 4.5, fill: c.contactShadow, opacity: 0.34, rotate: -2 },
    { cx: 4, cy: 2, rx: 32, ry: 4.8, fill: c.woodDark, opacity: 0.28, rotate: 1 },
    { cx: 34, cy: 1.5, rx: 22, ry: 4.2, fill: c.contactShadow, opacity: 0.34, rotate: 2 },
  ];

  // Walnut watercolor mottling clipped inside drawer apron
  const apronWashBlotches: WatercolorBlotch[] = [
    { cx: -28, cy: -38, rx: 26, ry: 9, fill: c.woodDark, opacity: 0.56, rotate: -4 },
    { cx: 8, cy: -40, rx: 28, ry: 8, fill: c.woodLit, opacity: 0.34, rotate: 3 },
    { cx: 36, cy: -36, rx: 20, ry: 9, fill: c.russetEarth, opacity: 0.36, rotate: -3 },
  ];

  // Worn oak/walnut watercolor mottling clipped inside slanted writing lid
  const lidWashBlotches: WatercolorBlotch[] = [
    { cx: -34, cy: -54, rx: 26, ry: 9, fill: c.woodDark, opacity: 0.48, rotate: -6 },
    { cx: 0, cy: -55, rx: 30, ry: 8, fill: c.woodLit, opacity: 0.44, rotate: 2 },
    { cx: 34, cy: -53, rx: 24, ry: 9, fill: c.russetEarth, opacity: 0.4, rotate: 5 },
    ...(lit
      ? [
          {
            cx: 38,
            cy: -55,
            rx: round2(22 + washShift * 0.5),
            ry: 9,
            fill: c.warmAmberGlow,
            opacity: 0.34,
            rotate: -4,
          },
        ]
      : []),
  ];

  // Helper for a Victorian turned wooden baluster leg
  const renderTurnedLeg = (lx: number, isBack: boolean): string => {
    const fill = isBack ? c.woodDark : c.woodMid;
    const topY = isBack ? -34 : -32;
    const legD = `M ${round2(lx - 4.2)} ${topY} L ${round2(lx + 4.2)} ${topY} L ${round2(lx + 3.4)} -25 C ${round2(lx + 5.2)} -22, ${round2(lx + 5.0)} -17, ${round2(lx + 2.8)} -15 L ${round2(lx + 3.6)} -4 L ${round2(lx + 4.8)} 0 L ${round2(lx - 4.8)} 0 L ${round2(lx - 3.6)} -4 L ${round2(lx - 2.8)} -15 C ${round2(lx - 5.0)} -17, ${round2(lx - 5.2)} -22, ${round2(lx - 3.4)} -25 Z`;
    return svgEl('g', { 'data-part': isBack ? 'desk-leg-back' : 'desk-leg-front' }, [
      celPath(legD, fill, {
        stroke: c.xeroxInk,
        strokeWidth: isBack ? s.sketchLine : s.xeroxFine,
      }),
      !isBack
        ? xeroxSketchStroke(
            `M ${round2(lx - 2.6)} -24 L ${round2(lx + 2.6)} -24 M ${round2(lx - 2.2)} -15 L ${round2(lx + 2.2)} -15 M ${round2(lx - 1)} -29 L ${round2(lx - 1.2)} -5`,
            {
              stroke: c.xeroxInkSoft,
              strokeWidth: 0.8,
              broken: true,
              opacity: 0.72,
            }
          )
        : '',
    ]);
  };

  // Back legs + wooden H-stretcher footrail + front turned legs
  const legsAssembly = svgEl('g', { 'data-part': 'desk-legs' }, [
    renderTurnedLeg(-39, true),
    renderTurnedLeg(39, true),
    // Lower H-stretcher crossbars
    celPath('M -44 -14 L 44 -14 L 44 -9.5 L -44 -9.5 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke('M -36 -11.8 L 32 -11.5', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.8,
      broken: true,
      opacity: 0.65,
    }),
    renderTurnedLeg(-46, false),
    renderTurnedLeg(46, false),
  ]);

  // Drawer apron with two recessed Victorian drawers & antique brass ring pulls
  const drawerApron = svgEl('g', { 'data-part': 'desk-apron' }, [
    svgEl('path', { d: apronD, fill: c.woodMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(bodyClipId) },
      watercolorWashBlotches(apronWashBlotches, {
        seed: variant * 11 + 2,
        opacity: 0.9,
      })
    ),
    celPath(apronD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }),
    // Left & right recessed drawer outlines
    xeroxSketchStroke(
      'M -44 -43 L -4 -43 L -4 -34 L -44 -34 Z M 4 -43 L 44 -43 L 44 -34 L 4 -34 Z',
      {
        stroke: c.xeroxInk,
        strokeWidth: 1.0,
        broken: true,
        dasharray: '14 2.5 10 2',
        opacity: 0.8,
      }
    ),
    // Sketchy wood-grain scratches across apron
    xeroxSketchStroke('M -40 -39 L -10 -38.5 M 10 -36.5 L 38 -37', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.75,
      broken: true,
      opacity: 0.56,
    }),
    // Brass drawer pulls & keyhole plates
    celPath('M -27 -40 L -21 -40 L -21 -37 L -27 -37 Z', c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: 0.75,
    }),
    svgEl('circle', {
      cx: -24,
      cy: -37.2,
      r: 2.1,
      fill: 'none',
      stroke: c.mochiGoldHighlight,
      'stroke-width': 1.0,
    }),
    celPath('M 21 -40 L 27 -40 L 27 -37 L 21 -37 Z', c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: 0.75,
    }),
    svgEl('circle', {
      cx: 24,
      cy: -37.2,
      r: 2.1,
      fill: 'none',
      stroke: c.mochiGoldHighlight,
      'stroke-width': 1.0,
    }),
  ]);

  // Raised Victorian back gallery rail & slanted writing lid
  const deskTop = svgEl('g', { 'data-part': 'desk-top' }, [
    // Low wooden top gallery ledge along back edge
    celPath('M -53 -61 L -52 -65 L 52 -65 L 53 -61 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Slanted writing surface
    svgEl('path', { d: slantedLidD, fill: c.woodMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(lidClipId) },
      watercolorWashBlotches(lidWashBlotches, {
        seed: variant * 13 + 5,
        opacity: 0.92,
      })
    ),
    celPath(slantedLidD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }),
    // Front lip molding catching the eye
    celPath('M -60 -46 L 60 -46 L 59 -43 L -59 -43 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Sketchy horizontal plank grain along slanted lid
    xeroxSketchStroke(
      'M -48 -56 L -28 -56 M 18 -57 L 44 -56.5 M -50 -50 L -32 -49.5 M 14 -49 L 46 -49.5',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.58,
      }
    ),
  ]);

  // 1. Open cream parchment ledger book (left-center)
  const openLedger = svgEl('g', { 'data-part': 'desk-ledger' }, [
    // Leather cover backing peeking under pages
    celPath('M -44 -50 L -40 -61 L -4 -61 L 0 -50 Z', c.russetEarth, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Left & right gently bowed cream parchment pages
    celPath(
      'M -42 -51 L -38.5 -60.5 Q -29 -62.5, -22 -60 L -22 -50.5 Q -31 -52, -42 -51 Z',
      c.parchmentCream,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M -22 -50.5 L -22 -60 Q -13 -62.5, -5.5 -60.5 L -2 -51 Q -12 -52, -22 -50.5 Z',
      c.boardToothLight,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Ruled ledger entries & cursive ink ticks
    xeroxSketchStroke(
      'M -36 -58 L -25 -58 M -37 -55.5 L -25.5 -55.5 M -38 -53 L -26 -53 M -19 -58 L -8 -58 M -19 -55.5 L -7 -55.5 M -18.5 -53 L -10 -53',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.72,
        broken: true,
        dasharray: '4 1.5 3 2',
        opacity: 0.68,
      }
    ),
    // Crimson ribbon bookmark draping over front lip
    celPath('M -22.5 -51 L -20.5 -51 L -19 -43 L -21 -44.8 L -23 -43 Z', c.mochiCollar, {
      stroke: c.xeroxInk,
      strokeWidth: 0.7,
    }),
  ]);

  // 2. Dark glass inkwell & jaunty crimson feather quill (center-right)
  const inkwellAndQuill = svgEl('g', { 'data-part': 'desk-quill' }, [
    // Faceted dark glass ink bottle
    celShadedShape({
      d: 'M 4 -54 L 6 -58 L 11 -58 L 13 -54 L 12.5 -50.5 L 4.5 -50.5 Z',
      baseFill: c.ironDark,
      highlightPaths: ['M 8.5 -58 L 12.5 -54 L 12 -50.5 L 9.5 -50.5 Z'],
      highlightFill: c.slateBlue,
      highlightOpacity: 0.6,
      clipId: `cc-desk-inkwell-clip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Curved crimson feather quill rising to ~(22, -75)
    celPath(
      'M 10 -61 C 12 -67, 17 -73, 23 -75 C 21 -69, 17 -64, 12.5 -60 Z',
      c.mochiCollar,
      { stroke: c.xeroxInk, strokeWidth: 0.85 }
    ),
    xeroxSketchStroke(
      'M 8.5 -57 Q 13 -66, 22 -74 M 14 -67 L 17 -69 M 16 -64 L 19.5 -66',
      {
        stroke: c.parchmentCream,
        strokeWidth: 0.85,
        opacity: 0.85,
      }
    ),
  ]);

  // 3. Tiny brass clockmaker's gears resting on the lid
  const clockGears = svgEl('g', { 'data-part': 'desk-clock-gears' }, [
    // Larger brass cogwheel
    celPath(
      'M 21 -53 L 22.2 -55.4 L 24 -54.8 L 25.4 -56.4 L 26.8 -54.8 L 28.6 -55.4 L 28.8 -53 L 30.8 -51.8 L 29.2 -50.4 L 29.6 -48.5 L 27.2 -48.6 L 25.8 -46.8 L 24.4 -48.4 L 22.2 -48.2 L 22.4 -50.2 L 20.4 -51.4 Z',
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: 0.75 }
    ),
    svgEl('circle', {
      cx: 25.6,
      cy: -51.6,
      r: 1.5,
      fill: c.woodDark,
      stroke: c.xeroxInk,
      'stroke-width': 0.65,
    }),
    // Smaller interlocking brass gear
    celPath(
      'M 15.5 -49.5 L 17.5 -51.6 L 19.6 -50.2 L 20.2 -48.0 L 18.0 -47.0 L 15.8 -47.8 Z',
      c.mochiGoldHighlight,
      { stroke: c.xeroxInk, strokeWidth: 0.7 }
    ),
    svgEl('circle', { cx: 17.8, cy: -49.2, r: 0.9, fill: c.woodDark }),
    // Coiled dark-iron watch spring wisp
    xeroxSketchStroke('M 29 -48.5 C 32 -47.5, 34 -49.5, 31.8 -50.8', {
      stroke: c.xeroxInk,
      strokeWidth: 0.75,
      opacity: 0.78,
    }),
  ]);

  // 4. Small flickering candle in a Victorian brass saucer (far right)
  const candleWashBlotches: WatercolorBlotch[] = [
    { cx: round2(42 + wobble), cy: -68, rx: round2(18 + washShift), ry: round2(15 + washShift * 0.7), fill: c.warmAmberWash, opacity: 0.24, rotate: -8 },
    { cx: 42, cy: -69, rx: round2(12 + washShift * 0.5), ry: round2(11 + washShift * 0.4), fill: c.warmAmberGlow, opacity: 0.28, rotate: 10 },
    { cx: 42, cy: -68, rx: 7.5, ry: 7.5, fill: c.warmAmberCore, opacity: 0.3, rotate: -4 },
  ];

  const candleSaucer = svgEl('g', { 'data-part': 'desk-candle' }, [
    lit
      ? watercolorWashBlotches(candleWashBlotches, {
          seed: variant * 17 + 9,
          opacity: round2(0.84 + flamePulse * 0.35),
        })
      : '',
    // Brass chamberstick finger-loop handle
    svgEl('path', {
      d: 'M 48 -54 C 53 -54.5, 53.5 -58.5, 49 -58.5',
      fill: 'none',
      stroke: c.xeroxInk,
      'stroke-width': 2.0,
      'stroke-linecap': 'round',
    }),
    svgEl('path', {
      d: 'M 48 -54 C 52.5 -54.5, 53 -58, 49 -58',
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 1.0,
      'stroke-linecap': 'round',
    }),
    // Brass saucer dish
    celPath(
      'M 34 -54.5 Q 42 -51.5, 50 -54.5 Q 48 -57, 42 -57 Q 36 -57, 34 -54.5 Z',
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Beeswax candle stub with melted drip
    celPath(
      'M 39.2 -55 L 39.6 -64.8 L 44.4 -64.8 L 44.8 -55 Q 42 -54, 39.2 -55 Z',
      c.parchmentCream,
      { stroke: c.xeroxInk, strokeWidth: 0.85 }
    ),
    celPath('M 42.6 -64.5 Q 44.2 -61.5, 43.4 -59.2 Q 42.3 -60.5, 42.6 -64.5 Z', c.boardToothWarm, {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.55,
    }),
    // Wick + flickering 12 FPS hand-drawn flame when lit
    xeroxSketchStroke('M 42 -64.8 L 42 -66.5', {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    lit
      ? svgEl('g', { 'data-part': 'desk-candle-flame' }, [
          svgEl(
            'g',
            {
              transform: svgTransform({
                x: 42,
                y: -66.2,
                rotate: flameTilt,
                scaleX: round2(1 - flamePulse * 0.35),
                scaleY: round2(1 + flamePulse),
              }),
            },
            [
              celPath(
                'M 0 0 C -2.4 -1.4, -2.2 -5.2, 0 -8.2 C 2.2 -5.2, 2.4 -1.4, 0 0 Z',
                c.warmAmberWash,
                { stroke: c.xeroxInkSoft, strokeWidth: 0.7 }
              ),
              svgEl('path', {
                d: 'M 0 -0.8 C -1.2 -1.8, -1.1 -4.2, 0 -6.0 C 1.1 -4.2, 1.2 -1.8, 0 -0.8 Z',
                fill: c.warmAmberCore,
              }),
            ]
          ),
          // Tiny sketchy light-ray ticks
          xeroxSketchStroke(
            'M 36 -70 L 33 -72 M 48 -70 L 51 -72 M 42 -76 L 42 -78.5',
            {
              stroke: c.parchmentCream,
              strokeWidth: 0.8,
              opacity: round2(0.5 + (flamePulse + 0.1) * 1.4),
            }
          ),
        ])
      : '',
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'victorian_desk',
      'data-art-style': 'classic_cel',
      'data-lit': lit ? 'true' : 'false',
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: bodyClipId }, svgEl('path', { d: apronD })),
        svgEl('clipPath', { id: lidClipId }, svgEl('path', { d: slantedLidD })),
      ]),
      watercolorWashBlotches(floorWashBlotches, {
        seed: variant * 7 + 1,
        opacity: 0.85,
      }),
      celContactShadow(0, 1.5, 48, 4.5, 0.26),
      legsAssembly,
      drawerApron,
      deskTop,
      openLedger,
      inkwellAndQuill,
      clockGears,
      candleSaucer,
    ]
  );
}

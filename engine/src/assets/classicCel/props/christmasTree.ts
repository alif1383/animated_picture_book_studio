import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  pencilFoliageScribbles,
  round2,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';
import { renderStarShape } from '../../props/shared';

/**
 * Renders the Classic 1970s–1980s Disney snowy Victorian village Christmas evergreen
 * (`'christmas_tree'`) for *"Barnaby's Christmas Hearth"*.
 *
 * Crafted in authentic *Mickey's Christmas Carol* (1983) / *Robin Hood* (1973) style:
 * - Layered wet-on-wet watercolor pine boughs (`watercolorWashBlotches` shifting from
 *   deep forest/olive/sage washes to snow-dusted parchment tips — zero hard vector cone!)
 * - Crisp expressive `pencilFoliageScribbles` pine needle clusters & bough pen ticks
 * - Flat matte analog cel red/gold/Victorian-blue glass baubles, draped cream ribbon
 *   garlands, and brown-paper & crimson wrapped gifts nestled around the wooden stand
 * - Warm antique-gold star topper at `(0, -198)` with crisp hand-inked 12 FPS twinkle
 *   star-crosses when `lit: true` (zero digital gradients or neon glow rings!)
 *
 * Local origin `(0, 0)` at base center; bounds `~x: -98..98, y: -215..8`.
 */
export function renderClassicChristmasTree(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-xmas-tree-${name}${safeSuffix}`;

  const renderGift = (
    x: number,
    y: number,
    w: number,
    h: number,
    boxFill: string,
    shadowFill: string,
    ribbonFill: string,
    clipKey: string
  ): string => {
    const xL = round2(x - w / 2);
    const xR = round2(x + w / 2);
    const yT = round2(y - h);
    const boxD = `M ${xL} ${yT} L ${xR} ${yT} L ${xR} ${y} L ${xL} ${y} Z`;
    const midX = round2(x + w * 0.14);
    return svgEl('g', {}, [
      celShadedShape({
        d: boxD,
        baseFill: boxFill,
        shadowPaths: [
          `M ${midX} ${yT} L ${round2(xR + 2)} ${yT} L ${round2(xR + 2)} ${round2(y + 2)} L ${midX} ${round2(y + 2)} Z`,
        ],
        shadowFill,
        shadowOpacity: 0.45,
        clipId: pid(clipKey),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Vertical & horizontal ribbon bands
      svgEl('rect', {
        x: round2(x - 2.4),
        y: yT,
        width: 4.8,
        height: h,
        fill: ribbonFill,
      }),
      svgEl('rect', {
        x: xL,
        y: round2(yT + h * 0.42),
        width: w,
        height: 4.0,
        fill: ribbonFill,
      }),
      xeroxSketchStroke(
        `M ${round2(x - 2.4)} ${yT} L ${round2(x - 2.4)} ${y} M ${round2(x + 2.4)} ${yT} L ${round2(x + 2.4)} ${y}`,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.8, opacity: 0.78 }
      ),
      // Hand-drawn ribbon bow loops on top
      celPath(
        `M ${x} ${yT} C ${round2(x - 7)} ${round2(yT - 7)}, ${round2(x - 10)} ${round2(yT - 1)}, ${x} ${yT} C ${round2(x + 10)} ${round2(yT - 1)}, ${round2(x + 7)} ${round2(yT - 7)}, ${x} ${yT} Z`,
        ribbonFill,
        { stroke: c.xeroxInk, strokeWidth: 0.9 }
      ),
    ]);
  };

  // 1. Ground Shadow, Snowy Base Drift, Trunk & Wrapped Victorian Gifts (`data-part="tree-base"`)
  const treeBase = svgEl('g', { 'data-part': 'tree-base' }, [
    celContactShadow(0, 3.2, 82, 6.2, 0.34),
    // Soft snowy watercolor drift pooling around the tree stand
    watercolorWashBlotches(
      [
        { cx: -38, cy: 1, rx: 44, ry: 7.5, fill: c.boardToothLight, opacity: 0.52 },
        { cx: 36, cy: 1.5, rx: 44, ry: 7.5, fill: c.parchmentCream, opacity: 0.48 },
        { cx: 12, cy: 3.5, rx: 52, ry: 5.5, fill: c.slateBlue, opacity: 0.24 },
      ],
      { seed: 13 + variant }
    ),
    // Sturdy evergreen trunk & rustic wooden barrel stand
    celPath('M -12 -36 L 12 -36 L 14 -6 L -14 -6 Z', c.woodMid, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M 2 -36 L 12 -36 L 14 -6 L 2 -6 Z',
      fill: c.woodDark,
      opacity: 0.62,
    }),
    xeroxSketchStroke('M -6 -32 L -7 -12 M 4 -30 L 5 -10', {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      broken: true,
      opacity: 0.72,
    }),
    celPath('M -22 -12 L 22 -12 L 19 2 L -19 2 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Wrapped brown-paper, crimson, and dusty-blue Victorian gifts (`data-part="tree-gifts"`)
    svgEl('g', { 'data-part': 'tree-gifts' }, [
      renderGift(-46, 3, 28, 22, c.ochreEarth, c.pathEarthDark, c.mochiCollar, 'gift-1'),
      renderGift(-18, 5, 22, 16, c.nightcapBlue, c.nightcapShadow, c.parchmentCream, 'gift-2'),
      renderGift(36, 4, 30, 24, c.mochiCollar, c.mochiCollarShadow, c.antiqueGold, 'gift-3'),
      renderGift(62, 5, 20, 15, c.boardToothWarm, c.cottagePlasterShadow, c.oliveCanopy, 'gift-4'),
    ]),
  ]);

  // 2. Layered Wet-on-Wet Watercolor Pine Boughs, Snow-Dusted Tips & Pencil Needles (`data-part="pine-boughs"`)
  const pineBoughs = svgEl('g', { 'data-part': 'pine-boughs' }, [
    // Deep forest-shadow watercolor under-boughs establishing the grand silhouette (x: -88..88, y: -192..-22)
    watercolorWashBlotches(
      [
        // Tier 1 (wide lower boughs)
        { cx: -54, cy: -42, rx: 38, ry: 20, rotate: -10, fill: c.foliageShadow, opacity: 0.9 },
        { cx: 0, cy: -38, rx: 52, ry: 22, fill: c.foliageShadow, opacity: 0.92 },
        { cx: 54, cy: -42, rx: 38, ry: 20, rotate: 10, fill: c.foliageShadow, opacity: 0.9 },
        // Tier 2 (mid-lower boughs)
        { cx: -40, cy: -84, rx: 34, ry: 20, rotate: -12, fill: c.foliageShadow, opacity: 0.9 },
        { cx: 0, cy: -82, rx: 42, ry: 22, fill: c.foliageMid, opacity: 0.88 },
        { cx: 40, cy: -84, rx: 34, ry: 20, rotate: 12, fill: c.foliageShadow, opacity: 0.9 },
        // Tier 3 (mid-upper boughs)
        { cx: -26, cy: -124, rx: 28, ry: 18, rotate: -14, fill: c.foliageMid, opacity: 0.88 },
        { cx: 24, cy: -124, rx: 28, ry: 18, rotate: 14, fill: c.foliageShadow, opacity: 0.9 },
        { cx: 0, cy: -126, rx: 32, ry: 19, fill: c.foliageMid, opacity: 0.88 },
        // Tier 4 (upper spire)
        { cx: -12, cy: -160, rx: 20, ry: 16, rotate: -10, fill: c.foliageMid, opacity: 0.88 },
        { cx: 12, cy: -160, rx: 20, ry: 16, rotate: 10, fill: c.foliageShadow, opacity: 0.88 },
        { cx: 0, cy: -178, rx: 14, ry: 15, fill: c.oliveCanopy, opacity: 0.88 },
      ],
      { seed: 23 + variant }
    ),
    // Mid-tone olive & sage watercolor bough washes + moonlit upper foliage variation
    watercolorWashBlotches(
      [
        { cx: -48, cy: -50, rx: 28, ry: 14, rotate: -8, fill: c.oliveCanopy, opacity: 0.78 },
        { cx: -10, cy: -48, rx: 36, ry: 15, fill: c.foliageMid, opacity: 0.76 },
        { cx: 44, cy: -48, rx: 28, ry: 14, rotate: 8, fill: c.oliveCanopy, opacity: 0.72 },
        { cx: -32, cy: -92, rx: 26, ry: 14, rotate: -10, fill: c.sageFoliage, opacity: 0.72 },
        { cx: 12, cy: -90, rx: 30, ry: 14, fill: c.oliveCanopy, opacity: 0.74 },
        { cx: -20, cy: -132, rx: 22, ry: 12, rotate: -10, fill: c.sageFoliage, opacity: 0.74 },
        { cx: 14, cy: -130, rx: 20, ry: 12, rotate: 10, fill: c.foliageLit, opacity: 0.7 },
        { cx: -6, cy: -166, rx: 15, ry: 12, fill: c.foliageRim, opacity: 0.62 },
      ],
      { seed: 31 + variant }
    ),
    // Soft snow-dusted parchment watercolor tips perched along drooping pine boughs
    watercolorWashBlotches(
      [
        { cx: -66, cy: -48, rx: 18, ry: 6.5, rotate: -14, fill: c.parchmentCream, opacity: 0.68 },
        { cx: 64, cy: -48, rx: 18, ry: 6.5, rotate: 14, fill: c.boardToothLight, opacity: 0.62 },
        { cx: -50, cy: -90, rx: 16, ry: 6.0, rotate: -16, fill: c.parchmentCream, opacity: 0.7 },
        { cx: 48, cy: -90, rx: 16, ry: 6.0, rotate: 16, fill: c.boardToothLight, opacity: 0.62 },
        { cx: -34, cy: -130, rx: 14, ry: 5.5, rotate: -16, fill: c.parchmentCream, opacity: 0.72 },
        { cx: 32, cy: -130, rx: 13, ry: 5.5, rotate: 16, fill: c.boardToothLight, opacity: 0.64 },
        { cx: -16, cy: -164, rx: 10, ry: 4.8, rotate: -18, fill: c.parchmentCream, opacity: 0.7 },
        { cx: 15, cy: -164, rx: 10, ry: 4.8, rotate: 18, fill: c.boardToothLight, opacity: 0.64 },
        { cx: -12, cy: -54, rx: 16, ry: 5.0, fill: c.boardToothLight, opacity: 0.45 },
        { cx: 10, cy: -96, rx: 15, ry: 4.8, fill: c.boardToothLight, opacity: 0.44 },
      ],
      { seed: 41 + variant }
    ),
    // Expressive Robin-Hood hand-drawn pencil pine needle clusters, twigs & stipples right on top
    pencilFoliageScribbles(
      [
        { cx: -54, cy: -40, rx: 30, ry: 15, density: 1.1 },
        { cx: 0, cy: -38, rx: 40, ry: 16, density: 1.1 },
        { cx: 54, cy: -40, rx: 30, ry: 15, density: 1.1 },
        { cx: -38, cy: -82, rx: 28, ry: 15, density: 1.1 },
        { cx: 8, cy: -82, rx: 34, ry: 15, density: 1.1 },
        { cx: 40, cy: -82, rx: 24, ry: 14, density: 1.0 },
        { cx: -22, cy: -122, rx: 22, ry: 14, density: 1.05 },
        { cx: 22, cy: -122, rx: 22, ry: 14, density: 1.05 },
        { cx: 0, cy: -160, rx: 18, ry: 18, density: 1.05 },
      ],
      {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.1,
        opacity: 0.84,
        seed: 53 + variant,
      }
    ),
    // Loose sketchy pine bough underside arcs giving hand-inked storybook structure
    xeroxSketchStroke(
      [
        'M -84 -36 Q -56 -22, -26 -30 Q 0 -18, 28 -28 Q 58 -22, 84 -36',
        'M -68 -78 Q -42 -66, -18 -72 Q 6 -62, 34 -72 Q 54 -66, 68 -78',
        'M -50 -118 Q -28 -108, -8 -114 Q 14 -106, 48 -118',
        'M -30 -154 Q -12 -146, 0 -150 Q 14 -146, 28 -154',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 1.3,
        broken: true,
        feather: true,
        opacity: 0.78,
      }
    ),
  ]);

  // 3. Draped Cream Ribbon Garlands & Flat Matte Analog Cel Glass Baubles (`data-part="tree-ornaments"`)
  const baubles: ReadonlyArray<{ x: number; y: number; r: number; fill: string }> = [
    { x: -58, y: -38, r: 5.4, fill: c.mochiCollar },
    { x: -24, y: -48, r: 5.2, fill: c.antiqueGold },
    { x: 14, y: -36, r: 5.5, fill: c.mochiCollar },
    { x: 52, y: -42, r: 5.2, fill: c.nightcapBlue },
    { x: -42, y: -82, r: 5.0, fill: c.antiqueGold },
    { x: -6, y: -74, r: 5.3, fill: c.mochiCollar },
    { x: 34, y: -84, r: 5.0, fill: c.dustyRose },
    { x: -26, y: -120, r: 4.8, fill: c.nightcapBlue },
    { x: 18, y: -118, r: 4.9, fill: c.antiqueGold },
    { x: -8, y: -152, r: 4.5, fill: c.mochiCollar },
    { x: 12, y: -156, r: 4.3, fill: c.antiqueGold },
  ];

  const ornaments = svgEl('g', { 'data-part': 'tree-ornaments' }, [
    // Draped parchment-cream & antique-gold ribbon garlands
    xeroxSketchStroke(
      [
        'M -72 -48 Q -36 -28, 0 -46 Q 36 -28, 72 -48',
        'M -56 -90 Q -24 -72, 6 -88 Q 32 -74, 54 -90',
        'M -38 -128 Q -12 -114, 12 -126 Q 26 -118, 36 -128',
        'M -20 -160 Q 0 -150, 20 -160',
      ].join(' '),
      { stroke: c.parchmentCream, strokeWidth: 2.8, opacity: 0.9 }
    ),
    xeroxSketchStroke(
      [
        'M -72 -48 Q -36 -28, 0 -46 Q 36 -28, 72 -48',
        'M -56 -90 Q -24 -72, 6 -88 Q 32 -74, 54 -90',
        'M -38 -128 Q -12 -114, 12 -126 Q 26 -118, 36 -128',
      ].join(' '),
      { stroke: c.antiqueGold, strokeWidth: 1.2, dasharray: '4 4', opacity: 0.85 }
    ),
    // Flat matte analog cel glass baubles with crisp Xerox outlines & tiny cream crescent gleam
    ...baubles.map((b) =>
      svgEl('g', {}, [
        svgEl('rect', {
          x: round2(b.x - 1.5),
          y: round2(b.y - b.r - 2.2),
          width: 3.0,
          height: 2.5,
          fill: c.antiqueGold,
          stroke: c.xeroxInk,
          'stroke-width': 0.7,
        }),
        svgEl('circle', {
          cx: b.x,
          cy: b.y,
          r: b.r,
          fill: b.fill,
          stroke: c.xeroxInk,
          'stroke-width': s.xeroxFine,
        }),
        svgEl('path', {
          d: `M ${round2(b.x - b.r * 0.45)} ${round2(b.y - b.r * 0.15)} Q ${round2(b.x - b.r * 0.35)} ${round2(b.y - b.r * 0.52)}, ${round2(b.x + b.r * 0.05)} ${round2(b.y - b.r * 0.5)}`,
          fill: 'none',
          stroke: c.parchmentCream,
          'stroke-width': 1.3,
          'stroke-linecap': 'round',
          opacity: 0.88,
        }),
      ])
    ),
  ]);

  // 4. Antique-Gold Star Topper & Crisp 12 FPS Twinkle Star-Crosses (`data-part="tree-star"`)
  const twinkleSpecs: ReadonlyArray<{ x: number; y: number; size: number; phase: number }> = [
    { x: -19, y: -202, size: 4.8, phase: 0 },
    { x: 20, y: -199, size: 4.5, phase: 4 },
    { x: 0, y: -214, size: 3.8, phase: 8 },
    { x: -34, y: -102, size: 3.6, phase: 2 },
    { x: 38, y: -64, size: 3.8, phase: 6 },
    { x: -46, y: -56, size: 3.5, phase: 10 },
    { x: 24, y: -136, size: 3.6, phase: 14 },
  ];

  const twinkleCrosses = lit
    ? twinkleSpecs.map((tw, i) => {
        const pulse = steppedOscillate(frameIndex, 16, 1, tw.phase + variant);
        const r = round2(tw.size * (0.62 + (pulse + 1) * 0.28));
        const op = round2(0.5 + (pulse + 1) * 0.24);
        const color = i % 2 === 0 ? c.parchmentCream : c.warmAmberCore;
        return svgEl('g', { opacity: op }, [
          xeroxSketchStroke(
            `M ${tw.x} ${round2(tw.y - r)} L ${tw.x} ${round2(tw.y + r)} M ${round2(tw.x - r)} ${tw.y} L ${round2(tw.x + r)} ${tw.y}`,
            { stroke: color, strokeWidth: 1.3, opacity: 0.95 }
          ),
          svgEl('circle', { cx: tw.x, cy: tw.y, r: 1.0, fill: c.starGlow }),
        ]);
      })
    : [];

  const starTopper = svgEl('g', { 'data-part': 'tree-star' }, [
    // Subtle soft warm ochre watercolor wash behind star topper when lit (zero neon blur!)
    lit
      ? watercolorWashBlotches(
          [
            {
              cx: 0,
              cy: -198,
              rx: round2(17 + steppedOscillate(frameIndex, 20, 2.0, variant)),
              ry: 16,
              fill: c.warmAmberGlow,
              opacity: 0.3,
            },
          ],
          { seed: 67 }
        )
      : '',
    celShadedShape({
      d: renderStarShape(0, -198, 13.5, 0),
      baseFill: c.antiqueGold,
      shadowPaths: ['M 0 -213 L 16 -213 L 16 -182 L -2 -182 Z'],
      shadowFill: c.warmAmberDeep,
      shadowOpacity: 0.45,
      highlightPaths: ['M -15 -213 L 1 -213 L -2 -196 L -15 -194 Z'],
      highlightFill: c.mochiGoldHighlight,
      highlightOpacity: 0.8,
      clipId: pid('star-topper-clip'),
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('path', {
      d: renderStarShape(0, -198, 5.8, 0),
      fill: lit ? c.warmAmberCore : c.parchmentCream,
      opacity: 0.9,
    }),
    ...twinkleCrosses,
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'christmas_tree',
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [treeBase, pineBoughs, ornaments, starTopper]
  );
}

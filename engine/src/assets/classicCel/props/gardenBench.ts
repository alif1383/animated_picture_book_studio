import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  deterministicJitter,
  gouachePath,
  pencilGrassStrokes,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

interface BenchFireflySpec {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  periodX: number;
  periodY: number;
  phase: number;
  glowR: number;
  coreR: number;
}

// 3 tiny warm amber fireflies drifting lazily around the backrest at 12 FPS
const BENCH_FIREFLY_SPECS: readonly BenchFireflySpec[] = [
  {
    baseX: -60,
    baseY: -62,
    ampX: 5.5,
    ampY: 3.5,
    periodX: 28,
    periodY: 18,
    phase: 0,
    glowR: 5.6,
    coreR: 2.2,
  },
  {
    baseX: 20,
    baseY: -65,
    ampX: 6.5,
    ampY: 3.0,
    periodX: 32,
    periodY: 20,
    phase: 7,
    glowR: 5.8,
    coreR: 2.3,
  },
  {
    baseX: 67,
    baseY: -50,
    ampX: 4.8,
    ampY: 4.0,
    periodX: 26,
    periodY: 16,
    phase: 13,
    glowR: 5.2,
    coreR: 2.1,
  },
];

/**
 * Renders one carved mossy stone end pedestal for the Classic Cel garden bench.
 * `side` is `-1` for left (`x: -73..-43`) and `+1` for right (`x: 43..73`).
 */
function renderStonePedestal(
  side: -1 | 1,
  clipId: string,
  seed: number
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // Coordinates defined in left-side orientation, mirrored cleanly for right side
  const mx = (x: number): number => round2(x * side);

  // Carved baroque stone leg: flared plinth foot (y = 2.5), scrolled waist, corbel capital (y = -28)
  const pedestalD = [
    `M ${mx(73)} 2.2`,
    `C ${mx(74)} -2.5, ${mx(71)} -5.5, ${mx(67)} -6.5`,
    `C ${mx(70)} -11.5, ${mx(71.5)} -17.5, ${mx(68.5)} -22`,
    `C ${mx(71)} -23.5, ${mx(72.5)} -25.5, ${mx(72)} -28`,
    `L ${mx(45)} -28`,
    `C ${mx(44.5)} -25.2, ${mx(46)} -23.2, ${mx(48.5)} -21.8`,
    `C ${mx(46.5)} -16.5, ${mx(46.5)} -10.5, ${mx(48.5)} -6.2`,
    `C ${mx(45)} -5.0, ${mx(43.2)} -2.2, ${mx(43.8)} 2.2`,
    `C ${mx(51)} 3.6, ${mx(66)} 3.6, ${mx(73)} 2.2 Z`,
  ].join(' ');

  const isLeft = side === -1;

  // Wet-on-wet watercolor stone weathering & damp moss blotches clipped inside the pedestal
  const stoneWashes = watercolorWashBlotches(
    [
      // Moonlit upper-left stone highlight / cool-right shadow bias
      {
        cx: mx(isLeft ? 65 : 53),
        cy: -14,
        rx: 11,
        ry: 14,
        fill: c.stoneLight,
        opacity: isLeft ? 0.66 : 0.52,
      },
      {
        cx: mx(58),
        cy: -12,
        rx: 10,
        ry: 10,
        fill: c.boardToothWarm,
        opacity: 0.34,
      },
      // Cast shadow right under the wooden seat overhang
      {
        cx: mx(58),
        cy: -26,
        rx: 16,
        ry: 5.5,
        fill: c.stoneShadow,
        opacity: 0.78,
      },
      // Inner/shaded stone flank
      {
        cx: mx(isLeft ? 50 : 65),
        cy: -11,
        rx: 11,
        ry: 14,
        fill: c.stoneShadow,
        opacity: isLeft ? 0.68 : 0.78,
      },
      // Damp olive & sage watercolor moss creeping up from base & tucked in carved scroll
      {
        cx: mx(66),
        cy: 0.5,
        rx: 10,
        ry: 5.2,
        fill: c.oliveCanopy,
        opacity: 0.62,
      },
      {
        cx: mx(53),
        cy: 1.0,
        rx: 8.5,
        ry: 4.5,
        fill: c.sageFoliage,
        opacity: 0.54,
      },
      {
        cx: mx(67),
        cy: -16,
        rx: 6.5,
        ry: 4.8,
        fill: c.oliveCanopy,
        opacity: 0.44,
      },
      {
        cx: mx(51),
        cy: -21,
        rx: 6.0,
        ry: 3.8,
        fill: c.sageFoliage,
        opacity: 0.38,
      },
    ],
    { seed }
  );

  // Carved stone relief lines, volute scroll curl, plinth molding & subtle hairline cracks
  const carvingTicks = [
    // Corbel molding under seat
    `M ${mx(70)} -23.5 Q ${mx(58.5)} -22.2, ${mx(47.5)} -23.5`,
    // Carved plinth foot step
    `M ${mx(71)} -4.5 Q ${mx(58.5)} -3.5, ${mx(46)} -4.5`,
    // Vertical fluted stone grooves down the waist
    `M ${mx(62)} -20.5 C ${mx(63.2)} -15, ${mx(63.2)} -10.5, ${mx(61.5)} -7`,
    `M ${mx(55)} -20.5 C ${mx(54.2)} -15, ${mx(54.2)} -10.5, ${mx(55.5)} -7`,
    // Outer carved stone scroll volute detail
    `M ${mx(68.2)} -18.5 C ${mx(65.5)} -18.8, ${mx(64.8)} -15.2, ${mx(67.2)} -14.5`,
    // Small weathered stone cracks
    `M ${mx(51)} -13 L ${mx(53.5)} -11.5 L ${mx(52.8)} -9.8`,
    `M ${mx(64.5)} -3.2 L ${mx(63.5)} 0.8`,
  ].join(' ');

  return svgEl(
    'g',
    { 'data-part': isLeft ? 'stone-pedestal-left' : 'stone-pedestal-right' },
    [
      gouachePath(pedestalD, c.stoneBase, { softEdge: false }),
      svgEl('g', { 'clip-path': svgUrl(clipId) }, [stoneWashes]),
      xeroxSketchStroke(pedestalD, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxHeavy,
        opacity: 0.92,
        feather: true,
      }),
      xeroxSketchStroke(carvingTicks, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.8,
      }),
      // Soft wet-on-wet moss cushion hugging the damp outer stone foot
      watercolorWashBlotches(
        [
          {
            cx: mx(69),
            cy: 1.5,
            rx: 8.5,
            ry: 3.6,
            fill: c.oliveCanopy,
            opacity: 0.72,
          },
          {
            cx: mx(65),
            cy: 0.2,
            rx: 5.5,
            ry: 2.6,
            fill: c.sageFoliage,
            opacity: 0.58,
          },
        ],
        { seed: seed + 11 }
      ),
    ]
  );
}

/**
 * Renders one scrolled wrought-iron side armrest & floral side filigree curl.
 * `side` is `-1` for left (`x: -86..-67`) and `+1` for right (`x: 67..86`).
 */
function renderIronArmrest(side: -1 | 1): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const mx = (x: number): number => round2(x * side);

  // Sweeping S-curved wrought-iron armrest rail with outward volute scroll at x = ±85.5
  const armRailD = [
    `M ${mx(71.5)} -56`,
    `C ${mx(74.5)} -56, ${mx(76.5)} -52, ${mx(78.5)} -48.5`,
    `C ${mx(81.5)} -47.8, ${mx(85.8)} -47.2, ${mx(85.5)} -43.5`,
    `C ${mx(85.2)} -40.2, ${mx(81.5)} -39.5, ${mx(80.2)} -41.8`,
    `C ${mx(79.4)} -43.2, ${mx(81.2)} -44.5, ${mx(82.4)} -43.4`,
  ].join(' ');

  // Front curved wrought-iron armrest post descending from armrest down to seat front corner
  const frontPostD = `M ${mx(79.2)} -46.8 C ${mx(77.8)} -41.5, ${mx(75.5)} -36, ${mx(72.5)} -31.5`;

  // Rear wrought-iron side support bracket descending from backrest to seat rear corner
  const rearPostD = `M ${mx(71.8)} -56.2 C ${mx(72.5)} -49, ${mx(72.8)} -41.5, ${mx(71.8)} -34.5`;

  // Decorative side floral curl / filigree scrolls tucked inside the armrest frame
  const floralScrollD = [
    // Main C-scroll coil under the armrest
    `M ${mx(72.5)} -47.5 C ${mx(76.5)} -48.5, ${mx(78.2)} -43.5, ${mx(75.2)} -41.2 C ${mx(73.4)} -39.8, ${mx(71.8)} -42.2, ${mx(73.6)} -43.4`,
    // Lower counter-scroll & tiny forged iron leaf-bud curl above the seat
    `M ${mx(72.2)} -39.5 C ${mx(76.2)} -39.2, ${mx(76.8)} -34.8, ${mx(73.5)} -34.0`,
    `M ${mx(76.2)} -45.5 Q ${mx(79.5)} -44.5, ${mx(78.8)} -41.8`,
  ].join(' ');

  // Subtle moonlight highlight along the upper iron crest
  const highlightD = `M ${mx(72.5)} -56.4 C ${mx(75.5)} -55.8, ${mx(77.5)} -51.5, ${mx(79.5)} -48.8 C ${mx(82.2)} -48.2, ${mx(84.8)} -47.5, ${mx(85.3)} -44.8`;

  return svgEl(
    'g',
    { 'data-part': side === -1 ? 'iron-armrest-left' : 'iron-armrest-right' },
    [
      // Xerox charcoal outer silhouette backing for crisp cel definition
      xeroxSketchStroke(`${rearPostD} ${frontPostD} ${armRailD}`, {
        stroke: c.xeroxInk,
        strokeWidth: 4.4,
        opacity: 0.94,
      }),
      // Forged iron core fill stroke
      xeroxSketchStroke(`${rearPostD} ${frontPostD} ${armRailD}`, {
        stroke: c.ironDark,
        strokeWidth: 2.5,
        opacity: 0.96,
      }),
      // Delicate side floral filigree scrolls
      xeroxSketchStroke(floralScrollD, {
        stroke: c.xeroxInk,
        strokeWidth: 2.3,
        opacity: 0.9,
      }),
      xeroxSketchStroke(floralScrollD, {
        stroke: c.ironDark,
        strokeWidth: 1.35,
        opacity: 0.95,
      }),
      // Small forged iron floral bud rivet at scroll center
      svgEl('circle', {
        cx: mx(74.8),
        cy: -42.6,
        r: 1.55,
        fill: c.ironHighlight,
        stroke: c.xeroxInk,
        'stroke-width': 0.85,
      }),
      // Hand-drawn iron metallic gleam on upper curved edge
      xeroxSketchStroke(highlightD, {
        stroke: c.ironHighlight,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }),
    ]
  );
}

/**
 * Renders a small forged iron carriage-bolt / nail head on the wooden slats.
 */
function renderNailHead(cx: number, cy: number): string {
  const c = TOKENS.classicCel.colors;
  return svgEl('g', {}, [
    svgEl('circle', {
      cx: round2(cx),
      cy: round2(cy),
      r: 1.45,
      fill: c.ironDark,
      stroke: c.xeroxInk,
      'stroke-width': 0.75,
    }),
    svgEl('circle', {
      cx: round2(cx - 0.35),
      cy: round2(cy - 0.35),
      r: 0.45,
      fill: c.ironHighlight,
      opacity: 0.85,
    }),
  ]);
}

/**
 * Renders the Classic 1970s–1980s Disney hand-inked & painted stone-and-timber garden bench
 * (`'garden_bench'`) with carved mossy stone end pedestals (`watercolorWashBlotches` +
 * `xeroxSketchStroke` carvings & `pencilGrassStrokes`), curved warm timber seat planks
 * and gracefully arched slatted backrest (`#xerox-ink` outlines, wood-grain ticks & iron
 * nail heads), scrolled wrought-iron armrests & floral curls, restrained moonlit edge rim,
 * and 3 drifting warm amber fireflies at 12 FPS when `lit: true` (default).
 *
 * Local origin `(0, 0)` sits at ground contact center between the carved stone legs.
 * Local SVG bounds: `x: -88..88, y: -74..6` (contact shadow ellipse extends slightly to `y: 13`).
 * Exact seat surface height: `y = -34` (`data-anchor="bench-seat"` at `x: 0, y: -34`),
 * wide enough (`x: -74..74`) for a `~84px` tall cat (`moonlit_cat`) to sit or curl up sleeping.
 */
export function renderClassicGardenBench(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-bench-${name}${safeSuffix}`;

  const leftStoneClipId = pid('stone-left-clip');
  const rightStoneClipId = pid('stone-right-clip');

  // Matching clip paths for the left & right stone pedestals
  const makePedestalClipD = (side: -1 | 1): string => {
    const mx = (x: number): number => round2(x * side);
    return [
      `M ${mx(73)} 2.2`,
      `C ${mx(74)} -2.5, ${mx(71)} -5.5, ${mx(67)} -6.5`,
      `C ${mx(70)} -11.5, ${mx(71.5)} -17.5, ${mx(68.5)} -22`,
      `C ${mx(71)} -23.5, ${mx(72.5)} -25.5, ${mx(72)} -28`,
      `L ${mx(45)} -28`,
      `C ${mx(44.5)} -25.2, ${mx(46)} -23.2, ${mx(48.5)} -21.8`,
      `C ${mx(46.5)} -16.5, ${mx(46.5)} -10.5, ${mx(48.5)} -6.2`,
      `C ${mx(45)} -5.0, ${mx(43.2)} -2.2, ${mx(43.8)} 2.2`,
      `C ${mx(51)} 3.6, ${mx(66)} 3.6, ${mx(73)} 2.2 Z`,
    ].join(' ');
  };

  const clipDefs = svgEl('defs', {}, [
    svgEl(
      'clipPath',
      { id: leftStoneClipId },
      svgEl('path', { d: makePedestalClipD(-1) })
    ),
    svgEl(
      'clipPath',
      { id: rightStoneClipId },
      svgEl('path', { d: makePedestalClipD(1) })
    ),
  ]);

  // 1. Soft painted ground contact shadow + damp mossy ground wash smudges
  const groundShadow = svgEl('g', { 'data-part': 'ground-shadow' }, [
    celContactShadow(0, 2, 84, 11, 0.36),
    watercolorWashBlotches(
      [
        { cx: -60, cy: 2.0, rx: 19, ry: 3.6, fill: c.grassNightDeep, opacity: 0.48 },
        { cx: -50, cy: 2.5, rx: 11, ry: 2.8, fill: c.oliveCanopy, opacity: 0.36 },
        { cx: 60, cy: 2.0, rx: 19, ry: 3.6, fill: c.grassNightDeep, opacity: 0.48 },
        { cx: 50, cy: 2.5, rx: 11, ry: 2.8, fill: c.oliveCanopy, opacity: 0.36 },
      ],
      { seed: 41 + variant }
    ),
  ]);

  // 2. Forged wrought-iron rear frame stanchions & decorative under-seat arched tie-brace
  const ironBackFrame = svgEl('g', { 'data-part': 'iron-back-frame' }, [
    // Subtle curved iron under-brace uniting the two stone pedestals below the seat
    xeroxSketchStroke(
      'M -47 -17.5 Q 0 -24.5, 47 -17.5 M -10 -21.2 C -6 -16.5, 6 -16.5, 10 -21.2',
      {
        stroke: c.xeroxInk,
        strokeWidth: 3.4,
        opacity: 0.88,
      }
    ),
    xeroxSketchStroke('M -47 -17.5 Q 0 -24.5, 47 -17.5', {
      stroke: c.ironDark,
      strokeWidth: 1.8,
      opacity: 0.94,
    }),
    // Decorative small iron ring centered beneath the seat
    svgEl('circle', {
      cx: 0,
      cy: -18.6,
      r: 3.2,
      fill: 'none',
      stroke: c.ironDark,
      'stroke-width': 1.8,
      filter: svgUrl(TOKENS.classicCel.filters.ids.xeroxInk),
    }),
    // Three wrought-iron upright spine straps supporting the arched backrest slats
    celPath(
      'M -59.5 -66.2 L -55.2 -66.2 L -54.5 -34 L -59.2 -34 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath(
      'M -2.2 -70.0 L 2.2 -70.0 L 2.2 -34 L -2.2 -34 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath(
      'M 55.2 -66.2 L 59.5 -66.2 L 59.2 -34 L 54.5 -34 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    // Subtle wrought-iron finial curls crowning the outer spine brackets
    xeroxSketchStroke(
      'M -57.5 -66.8 C -58 -70.2, -53.5 -70.6, -53 -68.2 M 57.5 -66.8 C 58 -70.2, 53.5 -70.6, 53 -68.2',
      {
        stroke: c.ironDark,
        strokeWidth: 1.7,
        opacity: 0.92,
      }
    ),
  ]);

  // 3. Gracefully arched slatted timber backrest (peaks safely at y = -71.5)
  const topSlatD =
    'M -74.5 -64.5 C -44 -72.8, 44 -72.8, 74.5 -64.5 L 73.8 -56.2 C 43 -63.8, -43 -63.8, -73.8 -56.2 Z';
  const topSlatLitD =
    'M -73.5 -64.2 C -43.5 -72.0, 43.5 -72.0, 73.5 -64.2 L 73.2 -61.4 C 43 -69.0, -43 -69.0, -73.2 -61.4 Z';
  const topSlatShadeD =
    'M -73.6 -58.5 C -43 -65.8, 43 -65.8, 73.6 -58.5 L 73.8 -56.4 C 43 -63.6, -43 -63.6, -73.8 -56.4 Z';

  const midSlatD =
    'M -73.5 -53.0 C -43 -59.8, 43 -59.8, 73.5 -53.0 L 73.0 -45.5 C 42.5 -51.8, -42.5 -51.8, -73.0 -45.5 Z';
  const midSlatLitD =
    'M -72.8 -52.8 C -42.5 -59.2, 42.5 -59.2, 72.8 -52.8 L 72.6 -50.6 C 42.5 -57.0, -42.5 -57.0, -72.6 -50.6 Z';
  const midSlatShadeD =
    'M -72.8 -47.4 C -42.5 -53.6, 42.5 -53.6, 72.8 -47.4 L 73.0 -45.6 C 42.5 -51.6, -42.5 -51.6, -73.0 -45.6 Z';

  const lowSlatD =
    'M -72.5 -42.4 C -42 -47.4, 42 -47.4, 72.5 -42.4 L 72.0 -36.6 C 41.5 -41.0, -41.5 -41.0, -72.0 -36.6 Z';
  const lowSlatShadeD =
    'M -72.0 -38.8 C -41.5 -43.2, 41.5 -43.2, 72.0 -38.8 L 72.0 -36.7 C 41.5 -40.9, -41.5 -40.9, -72.0 -36.7 Z';

  const backrestGrainD = [
    // Top slat flowing wood-grain scratches
    'M -68 -61.2 C -42 -67.8, -14 -68.8, 12 -67.4',
    'M -24 -64.5 C 6 -67.2, 38 -65.8, 66 -60.5',
    'M -52 -59.6 Q -34 -63.4, -18 -64.0',
    // Middle slat wood grain
    'M -67 -49.8 C -36 -55.4, -4 -55.8, 28 -54.0',
    'M -14 -51.6 C 18 -53.5, 45 -52.2, 68 -48.6',
    // Lower slat wood grain
    'M -65 -39.8 C -32 -43.8, 12 -44.2, 48 -41.5',
    'M 18 -40.4 Q 45 -41.2, 66 -39.0',
  ].join(' ');

  const backrestNails = [
    // Top slat bolts
    [-57.2, -62.5],
    [0, -66.8],
    [57.2, -62.5],
    // Middle slat bolts
    [-57.0, -51.2],
    [0, -54.2],
    [57.0, -51.2],
    // Lower slat bolts
    [-56.8, -41.0],
    [0, -43.0],
    [56.8, -41.0],
  ].map(([nx, ny]) => renderNailHead(nx, ny));

  const timberBackrest = svgEl('g', { 'data-part': 'timber-backrest' }, [
    // Top arched plank (flat base + warm bevel + shadow band + crisp #xerox-ink outline on top)
    svgEl('path', { d: topSlatD, fill: c.woodMid }),
    svgEl('path', { d: topSlatLitD, fill: c.woodLit, opacity: 0.76 }),
    svgEl('path', { d: topSlatShadeD, fill: c.woodDark, opacity: 0.7 }),
    celPath(topSlatD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }),
    // Middle arched plank
    svgEl('path', { d: midSlatD, fill: c.woodMid }),
    svgEl('path', { d: midSlatLitD, fill: c.woodLit, opacity: 0.64 }),
    svgEl('path', { d: midSlatShadeD, fill: c.woodDark, opacity: 0.72 }),
    celPath(midSlatD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }),
    // Lower lumbar plank (deeper shadow)
    svgEl('path', { d: lowSlatD, fill: c.woodMid }),
    svgEl('path', { d: lowSlatShadeD, fill: c.woodDark, opacity: 0.8 }),
    celPath(lowSlatD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }),
    // Loose hand-drawn wood-grain scribbles
    xeroxSketchStroke(backrestGrainD, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      broken: true,
      opacity: 0.56,
    }),
    ...backrestNails,
  ]);

  // 4. Carved mossy stone end pedestals (left & right)
  const stonePedestals = svgEl('g', { 'data-part': 'stone-pedestals' }, [
    renderStonePedestal(-1, leftStoneClipId, 53 + variant),
    renderStonePedestal(1, rightStoneClipId, 67 + variant),
  ]);

  // 5. Warm curved timber seat planks — exact seating surface at y = -34, wide x: -74..74
  const backSeatPlankD =
    'M -75.5 -37.2 Q 0 -38.4, 75.5 -37.2 L 76.2 -34.2 Q 0 -35.0, -76.2 -34.2 Z';
  const mainSeatPlankD =
    'M -76.5 -34.4 Q 0 -35.2, 76.5 -34.4 L 77.2 -30.6 Q 0 -31.2, -77.2 -30.6 Z';
  const mainSeatLitD =
    'M -75.2 -34.0 Q 0 -34.8, 75.2 -34.0 L 75.0 -32.2 Q 0 -32.9, -75.0 -32.2 Z';
  const frontBullnoseD =
    'M -77.2 -30.8 Q 0 -31.4, 77.2 -30.8 C 77.6 -28.4, 77.2 -26.5, 76.0 -25.8 Q 0 -26.2, -76.0 -25.8 C -77.2 -26.5, -77.6 -28.4, -77.2 -30.8 Z';
  const frontLipShadeD =
    'M -76.2 -27.8 Q 0 -28.2, 76.2 -27.8 L 75.8 -25.8 Q 0 -26.2, -75.8 -25.8 Z';

  const seatGrainD = [
    // Longitudinal timber grain lines across the seating planks
    'M -70 -35.6 Q -24 -36.5, 22 -36.0',
    'M -68 -32.8 Q -18 -33.6, 36 -33.0',
    'M -12 -32.0 Q 32 -32.4, 70 -32.2',
    // Subtle wood knot & curved front-lip grain
    'M -34 -28.4 Q 4 -29.2, 54 -28.5',
    'M -68 -28.8 Q -46 -29.4, -26 -28.8',
    'M 18 -33.5 C 21 -34.1, 25 -34.1, 27 -33.4',
  ].join(' ');

  const seatNails = [
    [-60, -32.6],
    [-55, -32.6],
    [55, -32.6],
    [60, -32.6],
    [-57.5, -28.4],
    [57.5, -28.4],
  ].map(([nx, ny]) => renderNailHead(nx, ny));

  const timberSeat = svgEl('g', { 'data-part': 'timber-seat' }, [
    // Shadowed rear timber plank
    celPath(backSeatPlankD, c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Primary wide warm seating plank centered at y = -34
    svgEl('path', { d: mainSeatPlankD, fill: c.woodMid }),
    svgEl('path', { d: mainSeatLitD, fill: c.woodLit, opacity: 0.85 }),
    celPath(mainSeatPlankD, 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Rounded bullnose front seat lip & underside shadow
    svgEl('path', { d: frontBullnoseD, fill: c.woodMid }),
    svgEl('path', { d: frontLipShadeD, fill: c.woodDark, opacity: 0.82 }),
    celPath(frontBullnoseD, 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Hand-drawn wood-grain lines & carriage-bolt nail heads
    xeroxSketchStroke(seatGrainD, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      broken: true,
      opacity: 0.58,
    }),
    ...seatNails,
    // Exact seat-surface anchor at (0, -34) for cat hopping, sitting, or curling up
    svgEl('g', {
      'data-anchor': 'bench-seat',
      transform: svgTransform({ x: 0, y: -34 }),
    }),
  ]);

  // 6. Scrolled wrought-iron side armrests & side floral curls
  const ironArmrests = svgEl('g', { 'data-part': 'iron-armrests' }, [
    renderIronArmrest(-1),
    renderIronArmrest(1),
  ]);

  // 7. Hand-drawn Robin-Hood pencil grass tufts & garden pebbles hugging the stone feet
  const groundTufts = svgEl('g', { 'data-part': 'ground-tufts' }, [
    pencilGrassStrokes(
      [
        { x: -74, y: 2.6, width: 16, height: 9.5, blades: 5, lean: -0.28 },
        { x: -44, y: 3.0, width: 14, height: 7.5, blades: 4, lean: 0.3 },
        { x: 44, y: 3.0, width: 14, height: 7.5, blades: 4, lean: -0.28 },
        { x: 74, y: 2.6, width: 16, height: 9.5, blades: 5, lean: 0.28 },
      ],
      {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.18,
        opacity: 0.86,
        seed: 73 + variant,
      }
    ),
    celPath(
      'M -35 4.2 C -35.5 1.8, -29.5 1.4, -28.5 3.8 C -28 5.4, -34.5 5.6, -35 4.2 Z',
      c.stoneBase,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M 30 4.4 C 30.2 2.2, 35.8 1.8, 36.6 4.0 C 37 5.5, 30.8 5.6, 30 4.4 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
  ]);

  // 8. Restrained moonlit rim highlights + 3 gentle warm amber fireflies (`lit === true`)
  const moonlitRim = lit
    ? svgEl('g', { 'data-part': 'moonlit-rim' }, [
        // Top arched backrest crest moonlit rim
        xeroxSketchStroke('M -68 -66.5 C -40 -73.2, 40 -73.2, 68 -66.5', {
          stroke: c.parchmentCream,
          strokeWidth: 1.5,
          broken: true,
          opacity: 0.34,
        }),
        // Faint moonlight catch along middle backrest crest & top seat surface
        xeroxSketchStroke('M -56 -55.4 C -28 -59.6, 28 -59.6, 56 -55.4', {
          stroke: c.celCream,
          strokeWidth: 1.05,
          broken: true,
          opacity: 0.2,
        }),
        xeroxSketchStroke('M -66 -34.3 Q 0 -35.0, 66 -34.3', {
          stroke: c.parchmentCream,
          strokeWidth: 1.1,
          broken: true,
          opacity: 0.22,
        }),
        // Subtle moonlit glint on both wrought-iron armrest crests
        xeroxSketchStroke(
          'M -84.2 -46.8 Q -79.5 -49.2, -74.5 -54.8 M 84.2 -46.8 Q 79.5 -49.2, 74.5 -54.8',
          {
            stroke: c.celCream,
            strokeWidth: 0.95,
            broken: true,
            opacity: 0.25,
          }
        ),
      ])
    : '';

  const fireflyEls: string[] = [];
  if (lit) {
    const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

    for (let i = 0; i < BENCH_FIREFLY_SPECS.length; i++) {
      const spec = BENCH_FIREFLY_SPECS[i]!;
      const jx = deterministicJitter(i * 11 + 5, variant, 1.4);
      const jy = deterministicJitter(i * 17 + 9, variant, 1.1);

      const posAt = (f: number): [number, number] => [
        round2(
          spec.baseX +
            jx +
            steppedOscillate(f, spec.periodX, spec.ampX, spec.phase + variant)
        ),
        round2(
          spec.baseY +
            jy +
            steppedOscillate(
              f,
              spec.periodY,
              spec.ampY,
              spec.phase + variant + 4
            )
        ),
      ];

      const [curX, curY] = posAt(frameIndex);
      const [prev1X, prev1Y] = posAt(frameIndex - 1);
      const [prev2X, prev2Y] = posAt(frameIndex - 2);

      const pulse = steppedOscillate(frameIndex, 16, 1.0, i * 5 + variant);
      const glowR = round2(spec.glowR + pulse * 0.75);
      const wingFlutter = steppedOscillate(frameIndex, 4, 1, i * 2);
      const wingY = round2(-1.4 - wingFlutter * 0.8);

      fireflyEls.push(
        svgEl('g', { 'data-part': `firefly-${i + 1}` }, [
          // Delicate 2-frame curved motion trail
          xeroxSketchStroke(
            `M ${prev2X} ${prev2Y} Q ${prev1X} ${prev1Y}, ${curX} ${curY}`,
            {
              stroke: c.warmAmberGlow,
              strokeWidth: 0.95,
              dasharray: '2.2 3.2',
              opacity: 0.5,
            }
          ),
          // Restrained 35mm optical halation glow (warm amber, non-neon)
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: glowR,
            fill: c.warmAmberGlow,
            filter: softGlowFilter,
            opacity: round2(0.36 + (pulse + 1) * 0.08),
          }),
          // Tiny hand-inked fluttering cel wings
          svgEl('ellipse', {
            cx: round2(curX - 1.9),
            cy: round2(curY + wingY),
            rx: 1.8,
            ry: 1.0,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.6,
            opacity: 0.86,
          }),
          svgEl('ellipse', {
            cx: round2(curX + 1.9),
            cy: round2(curY + wingY),
            rx: 1.8,
            ry: 1.0,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.6,
            opacity: 0.86,
          }),
          // Warm amber firefly core
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: spec.coreR,
            fill: i % 2 === 0 ? c.warmAmberCore : c.warmAmberGlow,
            stroke: c.xeroxInk,
            'stroke-width': 0.75,
          }),
          svgEl('circle', {
            cx: round2(curX - 0.45),
            cy: round2(curY - 0.45),
            r: 0.7,
            fill: c.parchmentCream,
          }),
        ])
      );
    }
  }

  const benchFireflies = lit
    ? svgEl('g', { 'data-part': 'bench-fireflies' }, fireflyEls)
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'garden_bench',
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [
      clipDefs,
      groundShadow,
      ironBackFrame,
      timberBackrest,
      stonePedestals,
      timberSeat,
      ironArmrests,
      groundTufts,
      moonlitRim,
      benchFireflies,
    ]
  );
}

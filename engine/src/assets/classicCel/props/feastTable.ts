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
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

function renderClassicGoldGoblet(cx: number, uid: string): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  return svgEl('g', { 'data-part': 'royal-goblet' }, [
    // Pedestal foot seated on tabletop
    celPath(
      `M ${cx - 6} -45.2 L ${cx + 6} -45.2 L ${cx + 3} -48 L ${cx - 3} -48 Z`,
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Knopped medieval chalice stem
    celPath(
      `M ${cx - 1.7} -48 L ${cx + 1.7} -48 L ${cx + 1.4} -54.8 L ${cx - 1.4} -54.8 Z`,
      c.moonShadow,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      `M ${cx - 2.6} -51.4 Q ${cx} -52.8, ${cx + 2.6} -51.4 Q ${cx} -50, ${cx - 2.6} -51.4 Z`,
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: 0.75 }
    ),
    // Two-tone flat matte cel goblet cup
    celShadedShape({
      d: `M ${cx - 6.5} -63 L ${cx + 6.5} -63 C ${cx + 6.5} -56, ${cx + 3.8} -54, ${cx} -54 C ${cx - 3.8} -54, ${cx - 6.5} -56, ${cx - 6.5} -63 Z`,
      baseFill: c.antiqueGold,
      shadowPaths: [
        `M ${cx + 1.2} -63 L ${cx + 6.8} -63 L ${cx + 6.8} -53.5 L ${cx + 0.5} -53.5 Z`,
      ],
      shadowFill: c.moonShadow,
      highlightPaths: [
        `M ${cx - 5.2} -62.2 L ${cx - 2.4} -62.2 L ${cx - 2.8} -55.2 L ${cx - 5.2} -55.8 Z`,
      ],
      highlightFill: c.mochiGoldHighlight,
      highlightOpacity: 0.78,
      clipId: `cc-feast-goblet-${uid}-${cx < 0 ? 'l' : 'r'}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Rim ellipse & ruby cabochon gem
    svgEl('ellipse', {
      cx,
      cy: -63,
      rx: 6.2,
      ry: 1.5,
      fill: c.mochiGoldHighlight,
      stroke: c.xeroxInk,
      'stroke-width': s.sketchLine,
    }),
    svgEl('circle', {
      cx,
      cy: -58.2,
      r: 1.55,
      fill: c.soldierCrimson,
      stroke: c.xeroxInk,
      'stroke-width': 0.75,
    }),
  ]);
}

function renderClassicTableCandle(
  cx: number,
  idx: number,
  frameIndex: number,
  isLit: boolean,
  handleSide: -1 | 1,
  variant: number
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const parts: string[] = [];

  // Finger-loop handle on outer edge of brass saucer
  parts.push(
    svgEl('circle', {
      cx: round2(cx + handleSide * 8),
      cy: -47.2,
      r: 2.2,
      fill: 'none',
      stroke: c.xeroxInk,
      'stroke-width': 1.5,
    }),
    svgEl('circle', {
      cx: round2(cx + handleSide * 8),
      cy: -47.2,
      r: 2.2,
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 0.8,
    })
  );

  // Brass chamberstick saucer
  parts.push(
    celPath(
      `M ${cx - 8} -45.5 C ${cx - 4} -44, ${cx + 4} -44, ${cx + 8} -45.5 L ${cx + 6.5} -48 L ${cx - 6.5} -48 Z`,
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke(`M ${cx - 5} -46.2 Q ${cx} -45.2, ${cx + 5} -46.2`, {
      stroke: c.moonShadow,
      strokeWidth: 0.75,
      opacity: 0.72,
    })
  );

  // Beeswax pillar candle + melted wax drip
  parts.push(
    celPath(
      `M ${cx - 3.2} -47.5 L ${cx - 3} -61.8 C ${cx - 1} -62.5, ${cx + 1} -62.5, ${cx + 3} -61.8 L ${cx + 3.2} -47.5 Z`,
      c.celCream,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      `M ${cx + 0.8} -61.8 L ${cx + 3} -61.8 L ${cx + 3.2} -47.5 L ${cx + 0.8} -47.5 Z`,
      c.boardToothWarm,
      { stroke: 'none', useXeroxFilter: false }
    ),
    celPath(
      `M ${cx - 2.3} -61.5 Q ${cx - 1.2} -57.2, ${cx - 0.3} -60.2 Q ${cx + 1.1} -58.4, ${cx + 2.1} -61.5 Z`,
      c.boardToothWarm,
      { stroke: c.xeroxInkSoft, strokeWidth: 0.65 }
    ),
    xeroxSketchStroke(`M ${cx} -62.2 L ${cx} -64.8`, {
      stroke: c.xeroxInk,
      strokeWidth: 0.9,
    })
  );

  if (isLit) {
    // 12 FPS hand-drawn matte cel candle flicker (tip strictly >= -75.6, inside -76..0)
    const tilt = steppedOscillate(frameIndex, 8, 5.8, idx * 3 + variant * 2);
    const stretch = steppedOscillate(frameIndex, 10, 0.08, idx * 4 + 1);
    const jitterX = round2(deterministicJitter(14 + idx * 7, frameIndex % 12, 0.45));

    parts.push(
      svgEl('g', { 'data-part': 'candle-flame' }, [
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: round2(cx + jitterX),
              y: -64.8,
              rotate: tilt,
              scaleX: round2(1 - stretch * 0.4),
              scaleY: round2(1 + stretch),
            }),
          },
          [
            // Flat matte cel outer flame teardrop
            celPath(
              'M 0 0 C -3.4 -1.8, -3.1 -6.2, 0 -9.6 C 3.1 -6.2, 3.4 -1.8, 0 0 Z',
              c.flameOrange,
              { stroke: c.xeroxInkSoft, strokeWidth: 0.85 }
            ),
            // Bright matte cel inner core
            svgEl('path', {
              d: 'M 0 -1.0 C -1.7 -2.2, -1.6 -5.0, 0 -7.0 C 1.6 -5.0, 1.7 -2.2, 0 -1.0 Z',
              fill: c.flameCore,
              stroke: 'none',
            }),
          ]
        ),
        // Crisp tiny hand-drawn sparkle ticks around flame
        xeroxSketchStroke(
          `M ${cx - 5.2} -69.5 L ${cx - 7.0} -70.8 M ${cx + 5.2} -69.5 L ${cx + 7.0} -70.8 M ${cx} -74.5 L ${cx} -75.8`,
          {
            stroke: c.warmAmberGlow,
            strokeWidth: 0.85,
            opacity: round2(0.65 + (stretch + 0.08) * 1.6),
          }
        ),
      ])
    );
  }

  return svgEl('g', { 'data-part': 'table-candle' }, parts);
}

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973)
 * medieval Tudor royal banquet feast table (`'feast_table'`).
 *
 * - Flat matte analog cel wood trestle (`woodDark`/`woodMid`) + rich draped
 *   Tudor crimson & parchment tablecloth (`soldierCrimson`, `celCream`,
 *   `antiqueGold` trim, feathery `xeroxSketchStroke` fabric folds).
 * - Tabletop strictly at `y = -48` (waist-high vs. `~100px` characters),
 *   topped with golden pie + rising steam, royal gold goblets, frosted
 *   celebration cake, apple platter, and 2 flickering beeswax candles.
 *
 * Origin: `(0, 0)` bottom-center.
 * Bounds: `x: -120..+120, y: -76..0`.
 */
export function renderClassicFeastTable(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const isLit = lit !== false;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const parts: string[] = [];

  // 0. Ground contact shadow strictly inside y <= 0
  parts.push(celContactShadow(0, -1.8, 106, 1.8, 0.28));

  // 1. Sturdy medieval wooden trestle legs, stretcher, and flared feet (`y = 0`)
  parts.push(
    svgEl('g', { 'data-part': 'trestle-legs' }, [
      // Shadowed underside apron beam
      celPath('M -114 -45 L 114 -45 L 112 -36 L -112 -36 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Horizontal oak stretcher connecting left and right trestles
      celShadedShape({
        d: 'M -88 -19 L 88 -19 L 88 -12 L -88 -12 Z',
        baseFill: c.woodMid,
        shadowPaths: ['M -88 -15 L 88 -15 L 88 -12 L -88 -12 Z'],
        shadowFill: c.woodDark,
        clipId: `cc-feast-stretcher-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      xeroxSketchStroke('M -74 -16.2 Q 0 -17, 74 -16.2 M -52 -13.8 L 46 -14', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.68,
      }),
      // Left trestle upright post
      celShadedShape({
        d: 'M -92 -44 L -78 -44 L -76 -5 L -94 -5 Z',
        baseFill: c.woodMid,
        shadowPaths: ['M -84 -44 L -76 -44 L -76 -5 L -83 -5 Z'],
        shadowFill: c.woodDark,
        clipId: `cc-feast-post-l-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      xeroxSketchStroke('M -88 -38 L -89 -10 M -83 -34 L -82 -12', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.64,
      }),
      // Left flared trestle foot seated squarely at y = 0
      celPath('M -104 0 L -66 0 L -70 -7 L -100 -7 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      celPath('M -98 -6.5 L -72 -6.5 L -70.5 -4.2 L -99.5 -4.2 Z', c.woodMid, {
        stroke: 'none',
        useXeroxFilter: false,
      }),
      // Right trestle upright post
      celShadedShape({
        d: 'M 78 -44 L 92 -44 L 94 -5 L 76 -5 Z',
        baseFill: c.woodMid,
        shadowPaths: ['M 85 -44 L 94 -44 L 94 -5 L 86 -5 Z'],
        shadowFill: c.woodDark,
        clipId: `cc-feast-post-r-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      xeroxSketchStroke('M 83 -38 L 82 -10 M 89 -34 L 90 -12', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.64,
      }),
      // Right flared trestle foot seated squarely at y = 0
      celPath('M 66 0 L 104 0 L 100 -7 L 70 -7 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      celPath('M 72 -6.5 L 98 -6.5 L 99.5 -4.2 L 70.5 -4.2 Z', c.woodMid, {
        stroke: 'none',
        useXeroxFilter: false,
      }),
      // Wooden mortise-and-tenon pegs on stretcher joints
      svgEl('circle', {
        cx: -85,
        cy: -15.5,
        r: 2.1,
        fill: c.woodDark,
        stroke: c.xeroxInk,
        'stroke-width': 0.9,
      }),
      svgEl('circle', {
        cx: 85,
        cy: -15.5,
        r: 2.1,
        fill: c.woodDark,
        stroke: c.xeroxInk,
        'stroke-width': 0.9,
      }),
    ])
  );

  // 2. Draped Tudor crimson & parchment tablecloth (`x: -120..+120`, tabletop strictly at `y = -48`)
  const clothBodyD =
    'M -117 -48 L 117 -48 Q 120 -48, 120 -43 L 120 -21 Q 114 -18, 108 -22 ' +
    'Q 94.5 -17, 81 -24 Q 67.5 -17, 54 -24 Q 40.5 -17, 27 -24 Q 13.5 -17, 0 -24 ' +
    'Q -13.5 -17, -27 -24 Q -40.5 -17, -54 -24 Q -67.5 -17, -81 -24 Q -94.5 -17, -108 -22 ' +
    'Q -114 -18, -120 -21 L -120 -43 Q -120 -48, -117 -48 Z';

  const goldTrimPath =
    'M -118 -25 ' +
    'Q -113 -22, -108 -25.5 ' +
    'Q -94.5 -20.5, -81 -27.5 ' +
    'Q -67.5 -20.5, -54 -27.5 ' +
    'Q -40.5 -20.5, -27 -27.5 ' +
    'Q -13.5 -20.5, 0 -27.5 ' +
    'Q 13.5 -20.5, 27 -27.5 ' +
    'Q 40.5 -20.5, 54 -27.5 ' +
    'Q 67.5 -20.5, 81 -27.5 ' +
    'Q 94.5 -20.5, 108 -25.5 ' +
    'Q 113 -22, 118 -25';

  parts.push(
    svgEl('g', { 'data-part': 'tablecloth' }, [
      // Main crimson Tudor drape with crisp cel-shaded shadow pleats
      celShadedShape({
        d: clothBodyD,
        baseFill: c.soldierCrimson,
        shadowPaths: [
          'M -120 -42 L 120 -42 L 120 -38 L -120 -38 Z',
          'M -112 -41 L -103 -41 L -104 -20 L -112 -20 Z',
          'M -59 -41 L -49 -41 L -50 -21 L -58 -21 Z',
          'M -5 -41 L 5 -41 L 4 -21 L -4 -21 Z',
          'M 49 -41 L 59 -41 L 58 -21 L 50 -21 Z',
          'M 103 -41 L 112 -41 L 112 -20 L 104 -20 Z',
        ],
        shadowFill: c.soldierCrimsonShadow,
        shadowOpacity: 0.72,
        clipId: `cc-feast-cloth-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      // Parchment cream Tudor banquet runner draped across tabletop & hanging center apron
      celPath(
        'M -114 -48 L 114 -48 L 112 -43 L -112 -43 Z',
        c.celCream,
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
      ),
      celPath(
        'M -30 -43 L 30 -43 L 28 -24 Q 14 -18.5, 0 -24.5 Q -14 -18.5, -28 -24 Z',
        c.celCream,
        { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
      ),
      celPath(
        'M -28 -43 L 28 -43 L 27.5 -39 L -27.5 -39 Z',
        c.boardToothWarm,
        { stroke: 'none', useXeroxFilter: false }
      ),
      // Antique gold scalloped trim & front piping
      svgEl('path', {
        d: goldTrimPath,
        fill: 'none',
        stroke: c.antiqueGold,
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
      svgEl('path', {
        d: 'M -119 -42.5 Q 0 -41.2, 119 -42.5',
        fill: 'none',
        stroke: c.antiqueGold,
        'stroke-width': 2.1,
        'stroke-linecap': 'round',
      }),
      // Feathery Xerox graphite fabric fold lines
      xeroxSketchStroke(
        'M -108 -40 L -108 -25 M -81 -40 L -81 -26 M -54 -40 L -54 -27 M -26 -39 L -25 -26 M 0 -39.5 L 0 -26.5 M 26 -39 L 25 -26 M 54 -40 L 54 -27 M 81 -40 L 81 -26 M 108 -40 L 108 -25',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.9,
          broken: true,
          opacity: 0.72,
        }
      ),
      // Tiny antique gold tassel beads at scallop dips
      ...[-94.5, -67.5, -40.5, -13.5, 13.5, 40.5, 67.5, 94.5].map((tx) =>
        svgEl('circle', {
          cx: tx,
          cy: -19.5,
          r: 1.85,
          fill: c.antiqueGold,
          stroke: c.xeroxInk,
          'stroke-width': 0.8,
        })
      ),
    ])
  );

  // 3. Left Golden Baked Pie (`x = -73`) + 12 FPS hand-drawn steam wisps
  const pieSteamParts: string[] = [];
  if (isLit) {
    [-78, -68].forEach((sx, idx) => {
      const sway = steppedOscillate(frameIndex, 10, 2.2, idx * 4 + variant);
      const lift = steppedOscillate(frameIndex, 12, 1.2, idx * 3 + 2);
      const topY = round2(-73.5 + lift);
      pieSteamParts.push(
        svgEl(
          'g',
          { 'data-part': 'pie-steam' },
          xeroxSketchStroke(
            `M ${sx} -62 Q ${round2(sx - 3.2 + sway)} -65.5, ${round2(sx + 1 - sway * 0.6)} -69 Q ${round2(sx + 3.5 + sway * 0.7)} -71.5, ${round2(sx - 0.8 + sway * 0.4)} ${topY}`,
            {
              stroke: c.parchmentCream,
              strokeWidth: 1.4,
              broken: true,
              dasharray: '4 2.5 3 2',
              opacity: 0.82,
            }
          )
        )
      );
    });
  }

  parts.push(
    svgEl('g', { 'data-part': 'golden-pie' }, [
      // Weathered stoneware pie dish
      celPath(
        'M -90 -46 C -84 -43.6, -62 -43.6, -56 -46 L -54 -51 C -62 -49, -84 -49, -92 -51 Z',
        c.slateBlue,
        { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
      ),
      // Golden ochre baked pie dome
      celShadedShape({
        d: 'M -91 -50 C -90 -61.5, -56 -61.5, -55 -50 C -62 -48, -84 -48, -91 -50 Z',
        baseFill: c.ochreEarth,
        shadowPaths: ['M -68 -61 L -54 -61 L -54 -48 L -64 -48 Z'],
        shadowFill: c.russetEarth,
        shadowOpacity: 0.45,
        highlightPaths: ['M -86 -53 C -84 -59, -70 -60, -65 -55 C -72 -56, -80 -55, -86 -53 Z'],
        highlightFill: c.warmAmberGlow,
        highlightOpacity: 0.62,
        clipId: `cc-feast-pie-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      // Crimped crust scalloped edge
      svgEl('path', {
        d: 'M -90 -50.5 Q -85 -53, -80 -50.5 Q -75 -53, -70 -50.5 Q -65 -53, -60 -50.5 Q -57 -52.5, -55.5 -50.5',
        fill: 'none',
        stroke: c.warmAmberGlow,
        'stroke-width': 1.6,
        'stroke-linecap': 'round',
      }),
      // Pie crust vent slashes
      xeroxSketchStroke(
        'M -79 -56.5 L -76 -53.5 M -73 -57.5 L -73 -53.8 M -67 -56.5 L -70 -53.5',
        {
          stroke: c.woodDark,
          strokeWidth: 1.25,
          opacity: 0.88,
        }
      ),
      ...pieSteamParts,
    ])
  );

  // 4. Two Royal Antique-Gold Goblets (`x = -41` and `x = +41`)
  parts.push(renderClassicGoldGoblet(-41, uid));
  parts.push(renderClassicGoldGoblet(41, uid));

  // 5. Centerpiece Royal Frosted Cake Platter (`x = 0`, crown top at `y = -74.2`)
  parts.push(
    svgEl('g', { 'data-part': 'centerpiece-platter' }, [
      // Pewter-cream royal serving platter
      celPath(
        'M -29 -45 C -19 -42.2, 19 -42.2, 29 -45 C 24 -48.4, -24 -48.4, -29 -45 Z',
        c.stoneLight,
        { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
      ),
      // Laurel garnish leaves
      celPath('M -25 -46 Q -22 -52, -16 -48 Q -20 -45, -25 -46 Z', c.dragonEmeraldLit, {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
      }),
      celPath('M 25 -46 Q 22 -52, 16 -48 Q 20 -45, 25 -46 Z', c.dragonEmeraldLit, {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
      }),
      // Bottom honey-ochre sponge tier
      celShadedShape({
        d: 'M -21 -46 L -20 -58 C -8 -60, 8 -60, 20 -58 L 21 -46 C 8 -44.5, -8 -44.5, -21 -46 Z',
        baseFill: c.villagerOchre,
        shadowPaths: ['M 7 -60 L 22 -60 L 22 -45 L 9 -45 Z'],
        shadowFill: c.ochreEarth,
        clipId: `cc-feast-cake-bot-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Scalloped cream frosting drape on bottom tier
      celPath(
        'M -21 -55.5 Q -15 -51.2, -10 -55 Q -5 -51.2, 0 -55 Q 5 -51.2, 10 -55 Q 15 -51.2, 21 -55.5 L 20 -58.5 C 8 -60, -8 -60, -20 -58.5 Z',
        c.celCream,
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
      ),
      // Top frosted tier
      celShadedShape({
        d: 'M -14 -58.5 L -13 -67 C -5 -68.5, 5 -68.5, 13 -67 L 14 -58.5 C 5 -57.5, -5 -57.5, -14 -58.5 Z',
        baseFill: c.celCream,
        shadowPaths: ['M 5 -68.5 L 14 -68.5 L 14 -57.5 L 6 -57.5 Z'],
        shadowFill: c.boardToothWarm,
        clipId: `cc-feast-cake-top-${uid}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Dusty-rose berry glaze crown drape
      celPath(
        'M -14 -64.5 Q -9 -61, -5 -64.5 Q 0 -60.5, 5 -64.5 Q 9 -61, 14 -64.5 L 13 -67.2 C 5 -68.8, -5 -68.8, -13 -67.2 Z',
        c.dustyRose,
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
      ),
      // Crimson currant berries along tier ledge
      ...[-11, 0, 11].map((bx) =>
        svgEl('circle', {
          cx: bx,
          cy: -58.5,
          r: 2.0,
          fill: c.soldierCrimson,
          stroke: c.xeroxInk,
          'stroke-width': 0.85,
        })
      ),
      // Miniature antique gold royal crown topper (`y = -67.5..-74.2`)
      celPath(
        'M -6 -67.5 L -7 -73.5 L -2.5 -70.5 L 0 -74.2 L 2.5 -70.5 L 7 -73.5 L 6 -67.5 Z',
        c.antiqueGold,
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
      ),
      xeroxSketchStroke('M -4.2 -69 L 4.2 -69', {
        stroke: c.mochiGoldHighlight,
        strokeWidth: 0.9,
        opacity: 0.85,
      }),
    ])
  );

  // 6. Right Platter of Orchard Apples (`x = +73.5`, spans `x = +54..+93`)
  const apples: ReadonlyArray<{
    cx: number;
    cy: number;
    r: number;
    fill: string;
    leafDir?: -1 | 1;
  }> = [
    { cx: 67.5, cy: -57.5, r: 5.9, fill: c.dragonEmeraldLit, leafDir: -1 },
    { cx: 79.5, cy: -57.5, r: 5.9, fill: c.soldierCrimson, leafDir: 1 },
    { cx: 62, cy: -51, r: 6.1, fill: c.soldierCrimson },
    { cx: 73.5, cy: -52, r: 6.2, fill: c.cottageRoof },
    { cx: 85, cy: -51, r: 6.1, fill: c.dragonEmeraldLit },
  ];

  parts.push(
    svgEl('g', { 'data-part': 'apple-platter' }, [
      // Oval pewter serving dish
      celPath(
        'M 54 -45 C 62 -42.2, 85 -42.2, 93 -45 C 88 -48, 59 -48, 54 -45 Z',
        c.stoneLight,
        { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
      ),
      ...apples.flatMap(({ cx, cy, r, fill, leafDir }) => {
        const items: string[] = [
          celPath(
            `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`,
            fill,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          // Matte cel shine arc
          svgEl('path', {
            d: `M ${round2(cx - 2.6)} ${round2(cy - 2.1)} Q ${round2(cx - 1.4)} ${round2(cy - 3.5)}, ${round2(cx - 0.2)} ${round2(cy - 2.5)}`,
            fill: 'none',
            stroke: c.celCream,
            'stroke-width': 1.1,
            'stroke-linecap': 'round',
          }),
          // Short twig stem
          xeroxSketchStroke(
            `M ${cx} ${round2(cy - r + 0.5)} Q ${round2(cx + 0.7)} ${round2(cy - r - 1.8)}, ${round2(cx + 1.4)} ${round2(cy - r - 2.4)}`,
            { stroke: c.woodDark, strokeWidth: 1.05 }
          ),
        ];
        if (leafDir) {
          items.push(
            celPath(
              `M ${round2(cx + 0.5)} ${round2(cy - r - 1.5)} Q ${round2(cx + leafDir * 4.4)} ${round2(cy - r - 3.8)}, ${round2(cx + leafDir * 5.0)} ${round2(cy - r - 0.6)} Q ${round2(cx + leafDir * 2.4)} ${round2(cy - r + 0.4)}, ${round2(cx + 0.5)} ${round2(cy - r - 1.5)} Z`,
              c.dragonEmeraldLit,
              { stroke: c.xeroxInk, strokeWidth: 0.85 }
            )
          );
        }
        return items;
      }),
    ])
  );

  // 7. Two Beeswax Candles in Brass Chambersticks (`x = -104` and `x = +104`)
  parts.push(renderClassicTableCandle(-104, 0, frameIndex, isLit, -1, variant));
  parts.push(renderClassicTableCandle(104, 1, frameIndex, isLit, 1, variant));

  return svgEl(
    'g',
    {
      'data-prop': 'feast_table',
      'data-art-style': 'classic_cel',
      'data-lit': String(isLit),
    },
    parts
  );
}

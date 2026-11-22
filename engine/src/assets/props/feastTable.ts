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

function renderGoldGoblet(cx: number, fillMask?: string): string {
  const { outlineThin, annotationPencil } = TOKENS.strokes;
  return svgEl(
    'g',
    { 'data-part': 'royal-goblet' },
    [
      // Pedestal foot resting on tabletop
      crayonPath(
        `M ${cx - 6} -45 L ${cx + 6} -45 L ${cx + 3} -48 L ${cx - 3} -48 Z`,
        TOKENS.colors.warmMoon,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      // Slender stem
      crayonPath(
        `M ${cx - 1.8} -48 L ${cx + 1.8} -48 L ${cx + 1.4} -55 L ${cx - 1.4} -55 Z`,
        TOKENS.colors.warmMoon,
        { strokeWidth: annotationPencil, mask: fillMask, paperUnderlay: true }
      ),
      // Goblet cup
      crayonPath(
        `M ${cx - 6.5} -63 L ${cx + 6.5} -63 C ${cx + 6.5} -56, ${cx + 3.8} -54, ${cx} -54 C ${cx - 3.8} -54, ${cx - 6.5} -56, ${cx - 6.5} -63 Z`,
        TOKENS.colors.warmMoon,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      // Rim highlight & ruby gem accent
      svgEl('ellipse', {
        cx,
        cy: -63,
        rx: 6.2,
        ry: 1.6,
        fill: TOKENS.colors.bananaYellow,
        ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
      }),
      svgEl('circle', {
        cx,
        cy: -58,
        r: 1.6,
        fill: TOKENS.colors.radishRed,
        ...crayonStrokeAttrs({ strokeWidth: 0.9 }),
      }),
    ]
  );
}

function renderTableCandle(
  cx: number,
  idx: number,
  frameIndex: number,
  isLit: boolean,
  handleSide: -1 | 1,
  fillMask?: string
): string {
  const { outlineThin, annotationPencil } = TOKENS.strokes;
  const parts: string[] = [];

  // Ring handle on outer side of brass saucer
  parts.push(
    svgEl('circle', {
      cx: cx + handleSide * 8.2,
      cy: -47.2,
      r: 2.3,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: TOKENS.colors.charcoalOutline,
        strokeWidth: annotationPencil,
      }),
    })
  );

  // Gold candlestick saucer
  parts.push(
    crayonPath(
      `M ${cx - 8} -45.5 C ${cx - 4} -44, ${cx + 4} -44, ${cx + 8} -45.5 L ${cx + 6.5} -48 L ${cx - 6.5} -48 Z`,
      TOKENS.colors.warmMoon,
      { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
    )
  );

  // Cream wax candle pillar
  parts.push(
    crayonPath(
      `M ${cx - 3.2} -47.5 L ${cx - 3} -62 C ${cx - 1} -62.8, ${cx + 1} -62.8, ${cx + 3} -62 L ${cx + 3.2} -47.5 Z`,
      TOKENS.colors.cloudWhite,
      { strokeWidth: annotationPencil, mask: fillMask, paperUnderlay: true }
    ),
    // Tiny melted wax drip
    svgEl('path', {
      d: `M ${cx - 2.4} -61.5 Q ${cx - 1.2} -57, ${cx - 0.3} -60.5 Q ${cx + 1.2} -58.5, ${cx + 2.2} -61.5`,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: TOKENS.colors.paperDeep,
        strokeWidth: 1.2,
      }),
    }),
    // Candle wick
    svgEl('line', {
      x1: cx,
      y1: -62.4,
      x2: cx,
      y2: -65,
      ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
    })
  );

  if (isLit) {
    const sway = round2(deterministicJitter(10 + idx * 5, frameIndex, 1.5));
    const tipLift = round2(deterministicJitter(21 + idx * 5, frameIndex, 1.0));
    const tipY = round2(-74 + tipLift);

    parts.push(
      svgEl(
        'g',
        { 'data-part': 'candle-flame' },
        [
          // Soft translucent crayon warmth aura (flat fill, no SVG gradient)
          svgEl('circle', {
            cx: round2(cx + sway * 0.4),
            cy: -69.5,
            r: 6.2,
            fill: TOKENS.colors.bananaYellow,
            opacity: 0.26,
            stroke: 'none',
          }),
          // Flickering outer teardrop flame
          crayonPath(
            `M ${cx} -65 C ${cx - 4.6} -68, ${round2(cx - 3 + sway)} -72.5, ${round2(cx + sway)} ${tipY} C ${round2(cx + 3 + sway)} -72.5, ${cx + 4.6} -68, ${cx} -65 Z`,
            TOKENS.colors.bananaYellow,
            {
              stroke: TOKENS.colors.sunsetOrange,
              strokeWidth: 1.3,
            }
          ),
          // Warm inner flame core
          svgEl('circle', {
            cx: round2(cx + sway * 0.35),
            cy: -68.4,
            r: 1.7,
            fill: TOKENS.colors.sunsetOrange,
          }),
        ]
      )
    );
  }

  return svgEl('g', { 'data-part': 'table-candle' }, parts);
}

/**
 * Renders a medieval royal banquet feast table (`'feast_table'`) scaled to waist-to-chest
 * height (`y = 0` ground contact to `y = -48` tabletop, dishes & lit candles up to `y = -76`,
 * spanning `x: -120..+120`).
 */
export function renderFeastTable(options: PropRenderOptions): string {
  const { frameIndex = 1, lit = true, fillMask } = options;
  const { outlineMedium, outlineThin, annotationPencil } = TOKENS.strokes;
  const isLit = lit !== false;
  const parts: string[] = [];

  // 1. Sturdy wooden trestle base, horizontal stretcher beam, and feet resting on y = 0
  parts.push(
    svgEl(
      'g',
      { 'data-part': 'trestle-legs' },
      [
        // Horizontal wooden stretcher connecting left and right trestles
        crayonPath(
          'M -88 -19 L 88 -19 L 88 -12 L -88 -12 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Woodgrain pencil line along stretcher
        svgEl('path', {
          d: 'M -72 -15.5 Q 0 -16.5, 72 -15.5',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.hairBrown,
            strokeWidth: annotationPencil,
          }),
        }),
        // Left trestle upright post
        crayonPath(
          'M -92 -44 L -78 -44 L -76 -5 L -94 -5 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Left flared trestle foot resting squarely at y = 0
        crayonPath(
          'M -104 0 L -66 0 L -70 -7 L -100 -7 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Right trestle upright post
        crayonPath(
          'M 78 -44 L 92 -44 L 94 -5 L 76 -5 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Right flared trestle foot resting squarely at y = 0
        crayonPath(
          'M 66 0 L 104 0 L 100 -7 L 70 -7 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Wooden tenon peg accents on stretcher joints
        svgEl('circle', {
          cx: -85,
          cy: -15.5,
          r: 2.2,
          fill: TOKENS.colors.hairBrown,
          ...crayonStrokeAttrs({ strokeWidth: 1.1 }),
        }),
        svgEl('circle', {
          cx: 85,
          cy: -15.5,
          r: 2.2,
          fill: TOKENS.colors.hairBrown,
          ...crayonStrokeAttrs({ strokeWidth: 1.1 }),
        }),
        // Wooden table underside beam peeking behind cloth edge
        crayonPath(
          'M -114 -45 L 114 -45 L 112 -36 L -112 -36 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
      ]
    )
  );

  // 2. Draped red crayon tablecloth (`x: -120..+120`, tabletop at `y = -48`) with scalloped hem & golden trim
  const scallopHemPath =
    'M -108 -22 ' +
    'Q -94.5 -17, -81 -24 ' +
    'Q -67.5 -17, -54 -24 ' +
    'Q -40.5 -17, -27 -24 ' +
    'Q -13.5 -17, 0 -24 ' +
    'Q 13.5 -17, 27 -24 ' +
    'Q 40.5 -17, 54 -24 ' +
    'Q 67.5 -17, 81 -24 ' +
    'Q 94.5 -17, 108 -22';

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
    svgEl(
      'g',
      { 'data-part': 'tablecloth' },
      [
        // Main draped red tablecloth body (top plane at y = -48, sides to x = ±120, scalloped front hem)
        crayonPath(
          'M -117 -48 L 117 -48 Q 120 -48, 120 -43 L 120 -21 Q 114 -18, 108 -22 ' +
            'Q 94.5 -17, 81 -24 Q 67.5 -17, 54 -24 Q 40.5 -17, 27 -24 Q 13.5 -17, 0 -24 ' +
            'Q -13.5 -17, -27 -24 Q -40.5 -17, -54 -24 Q -67.5 -17, -81 -24 Q -94.5 -17, -108 -22 ' +
            'Q -114 -18, -120 -21 L -120 -43 Q -120 -48, -117 -48 Z',
          getPatternFill('crayonAwningRed'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Golden scalloped trim stripe above hem
        svgEl('path', {
          d: goldTrimPath,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.warmMoon,
            strokeWidth: 2.8,
          }),
        }),
        // Delicate charcoal stitched accent along scalloped hem
        svgEl('path', {
          d: scallopHemPath,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.terracottaDark,
            strokeWidth: 1.2,
          }),
        }),
        // Front tabletop edge golden piping (`y = -42.5`) separating top surface from front drape
        svgEl('path', {
          d: 'M -119 -42.5 Q 0 -41, 119 -42.5',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.warmMoon,
            strokeWidth: 2.2,
          }),
        }),
        // Soft hand-drawn fabric drape crease lines
        svgEl('path', {
          d: 'M -108 -41 L -108 -25 M -54 -40.5 L -54 -27 M 0 -40.5 L 0 -27 M 54 -40.5 L 54 -27 M 108 -41 L 108 -25',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.terracottaDark,
            strokeWidth: annotationPencil,
            opacity: 0.72,
          }),
        }),
        // Tiny golden tassel beads at scallop peaks
        ...[-94.5, -67.5, -40.5, -13.5, 13.5, 40.5, 67.5, 94.5].map((tx) =>
          svgEl('circle', {
            cx: tx,
            cy: -19.5,
            r: 1.9,
            fill: TOKENS.colors.warmMoon,
            ...crayonStrokeAttrs({ strokeWidth: 0.9 }),
          })
        ),
      ]
    )
  );

  // 3. Left Golden Crust Pie (`x = -73`, seated on tabletop)
  const pieSteamParts: string[] = [];
  if (isLit) {
    [-78, -68].forEach((sx, idx) => {
      const wobA = round2(deterministicJitter(40 + idx * 7, frameIndex, 1.5));
      const wobB = round2(deterministicJitter(43 + idx * 7, frameIndex, 1.4));
      const lift = round2(deterministicJitter(46 + idx * 7, frameIndex, 1.1));
      const topY = round2(-73.5 + lift);
      pieSteamParts.push(
        svgEl('path', {
          'data-part': 'pie-steam',
          d: `M ${sx} -62 Q ${round2(sx - 3.5 + wobA)} -65.5, ${round2(sx + 1 + wobB)} -69 Q ${round2(sx + 4 + wobA * 0.7)} -71.5, ${round2(sx - 1 + wobB)} ${topY}`,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.paperDeep,
            strokeWidth: 1.6,
            dasharray: '2.5 2.5',
          }),
        })
      );
    });
  }

  parts.push(
    svgEl(
      'g',
      { 'data-part': 'golden-pie' },
      [
        // Stoneware pie pan
        crayonPath(
          'M -90 -46 C -84 -43.5, -62 -43.5, -56 -46 L -54 -51 C -62 -49, -84 -49, -92 -51 Z',
          TOKENS.colors.nightcapBlue,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Golden baked pie crust dome
        crayonPath(
          'M -91 -50 C -90 -61.5, -56 -61.5, -55 -50 C -62 -48, -84 -48, -91 -50 Z',
          getPatternFill('crayonOchre'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Crimped golden crust highlight rim
        svgEl('path', {
          d: 'M -90 -50.5 Q -85 -53, -80 -50.5 Q -75 -53, -70 -50.5 Q -65 -53, -60 -50.5 Q -57 -52.5, -55.5 -50.5',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.ochreLight,
            strokeWidth: 1.8,
          }),
        }),
        // Pie top vent slashes
        svgEl('path', {
          d: 'M -79 -56.5 L -76 -53.5 M -73 -57.5 L -73 -53.8 M -67 -56.5 L -70 -53.5',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: TOKENS.colors.woodBrown,
            strokeWidth: 1.4,
          }),
        }),
        ...pieSteamParts,
      ]
    )
  );

  // 4. Two Royal Gold Goblets (`x = -41` and `x = +41`)
  parts.push(renderGoldGoblet(-41, fillMask));
  parts.push(renderGoldGoblet(41, fillMask));

  // 5. Cheerful Centerpiece Royal Celebration Cake Platter (`x = 0`, reaches `y = -74.2`)
  parts.push(
    svgEl(
      'g',
      { 'data-part': 'centerpiece-platter' },
      [
        // Royal serving platter
        crayonPath(
          'M -29 -45 C -19 -42, 19 -42, 29 -45 C 24 -48.5, -24 -48.5, -29 -45 Z',
          TOKENS.colors.paperWarm,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Emerald garnish leaves on platter edges
        crayonPath(
          'M -25 -46 Q -22 -52, -16 -48 Q -20 -45, -25 -46 Z',
          TOKENS.colors.emeraldFrond,
          { strokeWidth: 1.1 }
        ),
        crayonPath(
          'M 25 -46 Q 22 -52, 16 -48 Q 20 -45, 25 -46 Z',
          TOKENS.colors.emeraldFrond,
          { strokeWidth: 1.1 }
        ),
        // Bottom sponge tier
        crayonPath(
          'M -21 -46 L -20 -58 C -8 -60, 8 -60, 20 -58 L 21 -46 C 8 -44.5, -8 -44.5, -21 -46 Z',
          getPatternFill('crayonOchre'),
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Scalloped cream frosting drape on bottom tier
        crayonPath(
          'M -21 -55.5 Q -15 -51, -10 -55 Q -5 -51, 0 -55 Q 5 -51, 10 -55 Q 15 -51, 21 -55.5 L 20 -58.5 C 8 -60, -8 -60, -20 -58.5 Z',
          TOKENS.colors.cloudWhite,
          { strokeWidth: 1.2 }
        ),
        // Top tier
        crayonPath(
          'M -14 -58.5 L -13 -67 C -5 -68.5, 5 -68.5, 13 -67 L 14 -58.5 C 5 -57.5, -5 -57.5, -14 -58.5 Z',
          TOKENS.colors.cloudWhite,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Rosy berry icing top drape
        crayonPath(
          'M -14 -64.5 Q -9 -61, -5 -64.5 Q 0 -60.5, 5 -64.5 Q 9 -61, 14 -64.5 L 13 -67.2 C 5 -68.8, -5 -68.8, -13 -67.2 Z',
          TOKENS.colors.cherryRose,
          { strokeWidth: 1.2 }
        ),
        // Cheerful red feast berries along tier ledge
        ...[-11, 0, 11].map((bx) =>
          svgEl('circle', {
            cx: bx,
            cy: -58.5,
            r: 2.1,
            fill: TOKENS.colors.radishRed,
            ...crayonStrokeAttrs({ strokeWidth: 1.0 }),
          })
        ),
        // Miniature golden royal crown topper (`y = -67.5..-74.2`)
        crayonPath(
          'M -6 -67.5 L -7 -73.5 L -2.5 -70.5 L 0 -74.2 L 2.5 -70.5 L 7 -73.5 L 6 -67.5 Z',
          TOKENS.colors.warmMoon,
          { strokeWidth: 1.3 }
        ),
      ]
    )
  );

  // 6. Right Platter of Red & Green Apples (`x = +73.5`, spans `x = +54..+93`)
  const apples: Array<{ cx: number; cy: number; r: number; color: string; leafDir?: -1 | 1 }> = [
    // Back row
    { cx: 67.5, cy: -57.5, r: 6, color: TOKENS.colors.meadowGreen, leafDir: -1 },
    { cx: 79.5, cy: -57.5, r: 6, color: TOKENS.colors.radishRed, leafDir: 1 },
    // Front row
    { cx: 62, cy: -51, r: 6.2, color: TOKENS.colors.radishRed },
    { cx: 73.5, cy: -52, r: 6.3, color: TOKENS.colors.meadowGreen },
    { cx: 85, cy: -51, r: 6.2, color: TOKENS.colors.radishRed },
  ];

  parts.push(
    svgEl(
      'g',
      { 'data-part': 'apple-platter' },
      [
        // Oval serving platter
        crayonPath(
          'M 54 -45 C 62 -42, 85 -42, 93 -45 C 88 -48, 59 -48, 54 -45 Z',
          TOKENS.colors.paperWarm,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        ...apples.flatMap(({ cx, cy, r, color, leafDir }) => {
          const item: string[] = [
            svgEl('circle', {
              cx,
              cy,
              r,
              fill: color,
              ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
            }),
            // Crisp shine arc
            svgEl('path', {
              d: `M ${cx - 2.6} ${cy - 2.2} Q ${cx - 1.4} ${cy - 3.6}, ${cx - 0.2} ${cy - 2.6}`,
              fill: 'none',
              ...crayonStrokeAttrs({
                stroke: TOKENS.colors.paperWarm,
                strokeWidth: 1.2,
              }),
            }),
            // Short stem
            svgEl('path', {
              d: `M ${cx} ${cy - r + 0.5} Q ${cx + 0.8} ${cy - r - 2}, ${cx + 1.5} ${cy - r - 2.5}`,
              fill: 'none',
              ...crayonStrokeAttrs({
                stroke: TOKENS.colors.woodBrown,
                strokeWidth: 1.2,
              }),
            }),
          ];
          if (leafDir) {
            item.push(
              crayonPath(
                `M ${cx + 0.5} ${cy - r - 1.5} Q ${cx + leafDir * 4.5} ${cy - r - 4}, ${cx + leafDir * 5.2} ${cy - r - 0.6} Q ${cx + leafDir * 2.5} ${cy - r + 0.4}, ${cx + 0.5} ${cy - r - 1.5} Z`,
                TOKENS.colors.emeraldFrond,
                { strokeWidth: 1.0 }
              )
            );
          }
          return item;
        }),
      ]
    )
  );

  // 7. Two Cute Tabletop Wax Candles (`x = -104` and `x = +104`)
  parts.push(renderTableCandle(-104, 0, frameIndex, isLit, -1, fillMask));
  parts.push(renderTableCandle(104, 1, frameIndex, isLit, 1, fillMask));

  return svgEl(
    'g',
    {
      'data-prop': 'feast_table',
      'data-lit': String(isLit),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    parts
  );
}

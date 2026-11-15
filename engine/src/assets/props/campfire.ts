import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders the Expanded Woodland Knight Camp, Tethered Horses & Roasting Meat Spit (`'campfire'`).
 * - Pitched striped royal pavilion tent (`data-part="knight-tent"`) + secondary blue/gold soldier tent (`data-part="soldier-tent"`).
 * - Tethered resting horses & camp gear beside the tents (`data-part="tethered-horses"`, `data-part="camp-gear"`).
 * - Warm wooden sitting logs flanking the fire ring (`data-part="sitting-logs"`).
 * - Crackling log campfire ring (`data-part="campfire-logs"`), flickering wax-crayon flames (`data-part="campfire-flames"`),
 *   and a wooden roasting meat spit cooking a plump sizzling meat haunch with rising steam curls (`data-part="roasting-spit"`).
 */
export function renderCampfire(
  options: PropRenderOptions = { kind: 'campfire' }
): string {
  const { frameIndex = 0, lit = true, fillMask } = options;

  const {
    paperWarm,
    ochreLight,
    pantsCream,
    nightcapWhite,
    starWhite,
    cloudWhite,
    woodBrown,
    hairBrown,
    warmMoon,
    bananaYellow,
    sunsetOrange,
    radishRed,
    paperDeep,
    indigoNightDark,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const flameFlickerX = round2(steppedOscillate(frameIndex, 6, 4.5));
  const flameFlickerY = round2(steppedOscillate(frameIndex, 8, 5.5, 2));
  const sizzleBob = round2(steppedOscillate(frameIndex, 6, 1.2, 1));
  const steamSway = round2(steppedOscillate(frameIndex, 8, 4.0, 2));
  const steamRise = round2(steppedOscillate(frameIndex, 6, 2.5, 3));

  // 1A. Tethered Resting Horses by the Wooden Hitching Post (`data-part="tethered-horses"`)
  const tetheredHorses = svgEl('g', { 'data-part': 'tethered-horses' }, [
    // Wooden hitching post on far left (-238 .. -195)
    crayonPath('M -236 2 L -236 -44 L -230 -44 L -230 2 Z', woodBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M -182 2 L -182 -44 L -176 -44 L -176 2 Z', woodBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M -240 -38 L -172 -38 L -172 -32 L -240 -32 Z', hairBrown, {
      strokeWidth: outlineMedium,
    }),
    // Soldier's tan steed resting in back (-228, -4)
    crayonPath(
      'M -242 -16 C -248 -6, -240 2, -224 2 L -218 -14 Z',
      ochreLight,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -244 -26 C -246 -42, -194 -44, -190 -26 C -186 -12, -240 -10, -244 -26 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    crayonPath(
      'M -198 -32 C -192 -52, -184 -64, -176 -66 C -170 -66, -162 -56, -164 -48 C -166 -42, -176 -42, -182 -36 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium }
    ),
    // Sir Leo's cream steed resting in front (-205, 0)
    crayonPath(
      'M -218 -14 C -226 -4, -218 4, -200 4 L -194 -12 Z',
      paperWarm,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -220 -24 C -222 -40, -168 -42, -164 -24 C -160 -10, -216 -8, -220 -24 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    crayonPath(
      'M -174 -30 C -168 -50, -160 -62, -150 -64 C -144 -64, -136 -54, -138 -46 C -140 -40, -150 -40, -158 -34 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    svgEl('path', {
      d: 'M -150 -54 Q -146 -51, -142 -54',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Tether rope to hitching rail
    svgEl('path', {
      d: 'M -144 -48 Q -162 -36, -178 -35',
      fill: 'none',
      stroke: radishRed,
      'stroke-width': 2,
    }),
  ]);

  // 1B. Main Royal Striped Pavilion Tent in Background-Left (`data-part="knight-tent"`)
  const tent = svgEl('g', { 'data-part': 'knight-tent' }, [
    crayonPath(
      'M -165 -2 L -95 -122 L -25 -2 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    crayonPath(
      'M -142 -2 L -95 -122 L -118 -2 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -72 -2 L -95 -122 L -48 -2 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -134 -56 Q -120 -48, -108 -56 Q -95 -48, -82 -56 Q -70 -48, -56 -56',
      'none',
      { stroke: warmMoon, strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -112 -2 L -95 -64 L -78 -2 Z',
      indigoNightDark,
      { strokeWidth: outlineMedium }
    ),
    crayonPath('M -95 -122 L -95 -142 L -66 -132 L -95 -124 Z', warmMoon, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 1C. Secondary Blue & Gold Soldier Tent in Background-Right (`data-part="soldier-tent"`)
  const soldierTent = svgEl('g', { 'data-part': 'soldier-tent' }, [
    crayonPath(
      'M 35 -4 L 95 -102 L 155 -4 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    crayonPath(
      'M 55 -4 L 95 -102 L 73 -4 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M 117 -4 L 95 -102 L 135 -4 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M 82 -4 L 95 -54 L 108 -4 Z',
      indigoNightDark,
      { strokeWidth: outlineMedium }
    ),
    crayonPath('M 95 -102 L 95 -118 L 118 -110 L 95 -104 Z', radishRed, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 1D. Camp Gear: Bedroll, Leaning Shields & Lances (`data-part="camp-gear"`)
  const campGear = svgEl('g', { 'data-part': 'camp-gear' }, [
    crayonPath(
      'M -116 0 C -116 -10, -78 -10, -78 0 C -78 4, -116 4, -116 0 Z',
      getPatternFill('crayonSweaterPurple'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -114 -2 C -114 -8, -102 -8, -102 -2 C -102 2, -114 2, -114 -2 Z',
      nightcapWhite,
      { strokeWidth: outlineThin }
    ),
    svgEl('line', {
      x1: -30,
      y1: 0,
      x2: -20,
      y2: -94,
      stroke: woodBrown,
      'stroke-width': 3.2,
      'stroke-linecap': 'round',
    }),
    crayonPath(
      'M -23 -92 L -18 -106 L -16 -90 Z',
      getPatternFill('crayonSkyBlue'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M -34 -32 L -16 -32 L -16 -16 C -16 -6, -25 -2, -25 -2 C -25 -2, -34 -6, -34 -16 Z',
      getPatternFill('crayonRoyalBlue'),
      { strokeWidth: outlineMedium }
    ),
    svgEl('line', {
      x1: 146,
      y1: -2,
      x2: 158,
      y2: -86,
      stroke: woodBrown,
      'stroke-width': 2.8,
      'stroke-linecap': 'round',
    }),
    svgEl('circle', {
      cx: 148,
      cy: -18,
      r: 11,
      fill: getPatternFill('crayonWoodBrown'),
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
  ]);

  // 2. Warm Wooden Sitting Logs Flanking the Campfire (`data-part="sitting-logs"`)
  const sittingLogs = svgEl('g', { 'data-part': 'sitting-logs' }, [
    crayonPath(
      'M -104 2 L -40 -4 L -38 12 L -102 18 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    svgEl('ellipse', {
      cx: -103,
      cy: 10,
      rx: 5,
      ry: 8,
      fill: ochreLight,
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    crayonPath(
      'M 40 -4 L 104 2 L 102 18 L 38 12 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    svgEl('ellipse', {
      cx: 103,
      cy: 10,
      rx: 5,
      ry: 8,
      fill: ochreLight,
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
  ]);

  // 3. Campfire Ring Stones & Crossed Logs (`data-part="campfire-logs"`)
  const logs = svgEl('g', { 'data-part': 'campfire-logs' }, [
    crayonPath('M -28 4 C -30 -6, -14 -6, -14 4 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M 14 4 C 14 -6, 30 -6, 28 4 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M -26 2 L 22 -14 L 26 -6 L -22 8 Z', woodBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M 26 2 L -22 -14 L -26 -6 L 22 8 Z', hairBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M -12 6 C -14 -4, 14 -4, 12 6 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
  ]);

  // 4. Flickering Crayon Flames & Warm Halo (`data-part="campfire-flames"`)
  const flames = lit
    ? svgEl('g', { 'data-part': 'campfire-flames' }, [
        svgEl('circle', {
          cx: 0,
          cy: -24,
          r: 48,
          fill: warmMoon,
          opacity: 0.22,
        }),
        svgEl('circle', {
          cx: 0,
          cy: -24,
          r: 52,
          fill: 'none',
          stroke: warmMoon,
          'stroke-width': 2,
          'stroke-dasharray': '6 5',
          opacity: 0.65,
        }),
        crayonPath(
          `M -18 -6 C -26 -24, ${-10 + flameFlickerX} -42, ${flameFlickerX} ${-50 + flameFlickerY * 0.6} C ${12 + flameFlickerX} -40, 26 -24, 18 -6 Z`,
          radishRed,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          `M -12 -6 C -16 -18, ${-6 - flameFlickerX * 0.6} -34, ${-flameFlickerX * 0.5} ${-40 + flameFlickerY * 0.5} C ${8 - flameFlickerX * 0.5} -32, 16 -18, 12 -6 Z`,
          sunsetOrange,
          { strokeWidth: outlineThin }
        ),
        crayonPath(
          `M -6 -6 C -8 -14, -3 -24, ${flameFlickerX * 0.4} -28 C 4 -22, 8 -14, 6 -6 Z`,
          bananaYellow,
          { strokeWidth: outlineThin }
        ),
      ])
    : '';

  // 5. Roasting Meat Spit Over the Campfire (`data-part="roasting-spit"`)
  const roastingSpit = svgEl('g', { 'data-part': 'roasting-spit' }, [
    // Left wooden forked Y-stake driven into ground at x = -36
    crayonPath(
      'M -38 6 L -38 -40 L -44 -52 L -40 -54 L -36 -43 L -32 -54 L -28 -52 L -34 -40 L -34 6 Z',
      woodBrown,
      { strokeWidth: outlineMedium }
    ),
    // Right wooden forked Y-stake driven into ground at x = +36
    crayonPath(
      'M 34 6 L 34 -40 L 28 -52 L 32 -54 L 36 -43 L 40 -54 L 44 -52 L 38 -40 L 38 6 Z',
      woodBrown,
      { strokeWidth: outlineMedium }
    ),
    // Horizontal spit crossbar rod across the Y-stakes (y = -46)
    svgEl('line', {
      x1: -48,
      y1: -46,
      x2: 46,
      y2: -46,
      stroke: charcoalOutline,
      'stroke-width': 3.2,
      'stroke-linecap': 'round',
    }),
    // Spit crank handle on left end
    crayonPath('M -48 -46 L -48 -38 L -42 -38', 'none', {
      stroke: charcoalOutline,
      strokeWidth: outlineMedium,
    }),

    // Plump Sizzling Crayon Roasted Meat Haunch on the Bone (`data-part="roasting-meat"`)
    svgEl(
      'g',
      {
        'data-part': 'roasting-meat',
        transform: svgTransform({ y: sizzleBob }),
      },
      [
        // Left & right cream bone ends sticking out of the meat haunch
        crayonPath(
          'M -24 -48 L -13 -48 L -13 -44 L -24 -44 Z',
          pantsCream,
          { strokeWidth: outlineThin }
        ),
        svgEl('circle', {
          cx: -25,
          cy: -49,
          r: 3.2,
          fill: nightcapWhite,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        svgEl('circle', {
          cx: -25,
          cy: -43,
          r: 3.2,
          fill: nightcapWhite,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        crayonPath(
          'M 13 -48 L 22 -48 L 22 -44 L 13 -44 Z',
          nightcapWhite,
          { strokeWidth: outlineThin }
        ),
        // Plump terracotta/russet roasted drumstick haunch body
        crayonPath(
          'M -15 -46 C -15 -62, 6 -64, 16 -54 C 22 -48, 20 -38, 12 -34 C 2 -30, -15 -32, -15 -46 Z',
          getPatternFill('crayonTerracotta'),
          { strokeWidth: outlineHeavy, paperUnderlay: true }
        ),
        // Golden-ochre basted top glaze highlight
        crayonPath(
          'M -11 -50 C -8 -58, 6 -59, 13 -51 C 8 -47, -4 -46, -11 -50 Z',
          getPatternFill('crayonOchre'),
          { strokeWidth: outlineThin }
        ),
        // Savory sear/grill stripes
        svgEl('path', {
          d: 'M -6 -55 Q -2 -46, -4 -37 M 2 -56 Q 6 -46, 4 -37 M 9 -53 Q 12 -46, 10 -39',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.8 }),
        }),
      ]
    ),

    // Animated Rising Aroma / Steam Curls (`data-part="meat-steam"`)
    lit
      ? svgEl('g', { 'data-part': 'meat-steam' }, [
          svgEl('path', {
            d: `M -10 ${round2(-64 + steamRise)} Q ${round2(-15 + steamSway)} -75, -8 -84 Q ${round2(-2 - steamSway)} -92, -10 ${round2(-98 + steamRise)}`,
            fill: 'none',
            stroke: starWhite,
            'stroke-width': 2.4,
            'stroke-linecap': 'round',
            opacity: 0.85,
          }),
          svgEl('path', {
            d: `M 0 ${round2(-66 - steamRise * 0.6)} Q ${round2(6 - steamSway)} -78, 0 -88 Q ${round2(-6 + steamSway)} -96, 2 ${round2(-103 - steamRise * 0.6)}`,
            fill: 'none',
            stroke: cloudWhite,
            'stroke-width': 2.6,
            'stroke-linecap': 'round',
            opacity: 0.9,
          }),
          svgEl('path', {
            d: `M 10 ${round2(-64 + steamRise)} Q ${round2(15 + steamSway)} -75, 9 -84 Q ${round2(3 - steamSway)} -92, 11 ${round2(-98 + steamRise)}`,
            fill: 'none',
            stroke: starWhite,
            'stroke-width': 2.4,
            'stroke-linecap': 'round',
            opacity: 0.85,
          }),
        ])
      : '',
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'campfire',
      'data-lit': String(lit),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      tetheredHorses,
      tent,
      soldierTent,
      campGear,
      sittingLogs,
      logs,
      flames,
      roastingSpit,
    ]
  );
}

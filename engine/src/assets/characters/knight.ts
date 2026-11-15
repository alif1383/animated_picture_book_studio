import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderStarShape } from '../props/shared';

/**
 * Renders Sir Leo the Brave Crayon Knight on Horseback (`'knight'`).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - Noble cream/warm-brown crayon steed (`paperWarm` / `crayonWoodBrown`) with chestnut mane & tail,
 *   red/gold saddle blanket (`crayonAwningRed`, `crayonWarmMoon`), bridle, and 4 articulated legs
 *   that trot at 6 FPS during `'walking'`, rear up during `'waving'`, or fold to rest during `'sitting'` / `'sleeping'`.
 * - Sir Leo seated in the saddle facing RIGHT (`+X`): sky-blue/silver crayon armor (`crayonSkyBlue`),
 *   fluttering red cape (`crayonAwningRed`), plumed helmet with open visor showing a warm friendly face,
 *   a golden star emblem on his shield (`crayonWarmMoon`), and a crayon lance held forward/upward.
 */
export function renderKnight(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;

  const {
    paperWarm,
    skinPeach,
    curtainPink,
    hairBrown,
    woodBrown,
    warmMoon,
    bananaYellow,
    radishRed,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'singing';
  const isResting = state === 'sitting' || state === 'sleeping' || state === 'sleepy';
  const isSleeping = state === 'sleeping';

  const trotSwing = isWalking ? steppedOscillate(frameIndex, 6, 18) : 0;
  const trotBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 6, 3.5))
    : isResting
    ? 14
    : steppedOscillate(frameIndex, 12, 1.5);
  const capeFlutter = steppedOscillate(frameIndex, 8, 5);
  const lanceWave = isWaving ? steppedOscillate(frameIndex, 6, 12) - 14 : 0;
  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 20, 1, 2);

  // 1. Horse Legs (facing RIGHT +X, hooves pointing right)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        // Folded resting legs tucked beneath horse belly
        crayonPath(
          'M -34 -18 C -44 -6, -36 2, -20 0 L -14 -14 Z',
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          'M 10 -18 C 4 -6, 14 2, 30 0 L 26 -14 Z',
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
      ])
    : svgEl('g', { 'data-part': 'horse-legs' }, [
        // Back-left leg (far side)
        svgEl(
          'g',
          { transform: svgTransform({ x: -30, y: -32, rotate: -trotSwing * 0.85 }) },
          [
            crayonPath('M -5 0 L -7 26 L 3 26 L 4 0 Z', woodBrown, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -7 26 L 7 26 L 8 32 L -7 32 Z', charcoalOutline, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        // Front-left leg (far side)
        svgEl(
          'g',
          { transform: svgTransform({ x: 20, y: -32, rotate: trotSwing * 0.85 }) },
          [
            crayonPath('M -5 0 L -4 26 L 5 26 L 4 0 Z', woodBrown, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -4 26 L 9 26 L 10 32 L -4 32 Z', charcoalOutline, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        // Back-right leg (near side)
        svgEl(
          'g',
          { transform: svgTransform({ x: -20, y: -32, rotate: trotSwing }) },
          [
            crayonPath('M -6 0 L -6 26 L 4 26 L 5 0 Z', paperWarm, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -6 26 L 8 26 L 9 32 L -6 32 Z', hairBrown, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        // Front-right leg (near side)
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: 28,
              y: -32,
              rotate: isWaving ? -24 : -trotSwing,
            }),
          },
          [
            crayonPath('M -5 0 L -4 26 L 6 26 L 5 0 Z', paperWarm, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -4 26 L 10 26 L 11 32 L -4 32 Z', hairBrown, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
      ]);

  // 2. Flowing Chestnut Horse Tail (on left -X side)
  const horseTail = svgEl(
    'g',
    {
      'data-part': 'horse-tail',
      transform: svgTransform({ x: -46, y: -52, rotate: capeFlutter }),
    },
    [
      crayonPath(
        'M 0 0 C -18 -4, -30 10, -24 28 C -14 24, -6 14, 2 6 Z',
        hairBrown,
        { strokeWidth: outlineMedium }
      ),
    ]
  );

  // 3. Noble Cream Steed Body, Neck & Head (facing RIGHT +X)
  const horseBodyAndHead = svgEl('g', { 'data-part': 'horse-body' }, [
    // Barrel torso
    crayonPath(
      'M -46 -46 C -48 -64, 32 -66, 38 -46 C 42 -28, -42 -26, -46 -46 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Dappled warm patch on rump
    svgEl('circle', { cx: -28, cy: -48, r: 7, fill: woodBrown, opacity: 0.35 }),
    svgEl('circle', { cx: -16, cy: -42, r: 4.5, fill: woodBrown, opacity: 0.35 }),
    // Royal red & gold saddle blanket
    crayonPath(
      'M -24 -60 L 14 -60 L 18 -38 L -28 -38 Z',
      getPatternFill('crayonAwningRed'),
      { strokeWidth: outlineMedium }
    ),
    svgEl('path', {
      d: 'M -25 -42 L 15 -42',
      fill: 'none',
      stroke: warmMoon,
      'stroke-width': 2.5,
      'stroke-dasharray': '4 3',
    }),
    // Horse neck & head facing RIGHT (+X)
    crayonPath(
      'M 22 -52 C 28 -76, 36 -92, 46 -94 C 52 -94, 68 -80, 66 -70 C 64 -62, 50 -64, 42 -58 C 38 -48, 32 -40, 22 -52 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    // Chestnut mane along back of neck
    crayonPath(
      'M 18 -56 C 22 -72, 28 -86, 38 -94 C 32 -82, 28 -68, 24 -54 Z',
      hairBrown,
      { strokeWidth: outlineMedium }
    ),
    // Horse ears pointing up-right
    crayonPath('M 38 -92 L 42 -104 L 48 -92 Z', paperWarm, {
      strokeWidth: outlineMedium,
    }),
    // Horse eye (awake or sleeping)
    blink
      ? svgEl('path', {
          d: 'M 46 -82 Q 50 -79, 54 -82',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 50, cy: -82, r: 2.6, fill: charcoalOutline }),
    // Red & gold bridle reins
    svgEl('path', {
      d: 'M 42 -88 L 58 -74 M 56 -74 C 38 -68, 18 -68, 4 -74',
      fill: 'none',
      stroke: radishRed,
      'stroke-width': 2.2,
    }),
  ]);

  // 4. Knight's Fluttering Red Cape (`data-part="knight-cape"`)
  const knightCape = svgEl(
    'g',
    {
      'data-part': 'knight-cape',
      transform: svgTransform({ x: -10, y: -86, rotate: capeFlutter * 0.8 }),
    },
    [
      crayonPath(
        'M 0 0 C -22 4, -36 18, -32 34 C -18 32, -6 22, 4 10 Z',
        getPatternFill('crayonAwningRed'),
        { strokeWidth: outlineMedium }
      ),
    ]
  );

  // 5. Knight's Lance / Pennant Flag Held Forward (`data-part="knight-lance"`)
  const knightLance = svgEl(
    'g',
    {
      'data-part': 'knight-lance',
      transform: svgTransform({
        x: 10,
        y: -76,
        rotate: isWalking ? 18 : lanceWave,
      }),
    },
    [
      // Wooden lance shaft pointing up-right (+X)
      svgEl('line', {
        x1: -6,
        y1: 14,
        x2: 44,
        y2: -54,
        stroke: woodBrown,
        'stroke-width': 3.6,
        'stroke-linecap': 'round',
      }),
      // Silver-blue lance tip
      crayonPath('M 38 -46 L 50 -62 L 44 -42 Z', getPatternFill('crayonSkyBlue'), {
        strokeWidth: outlineThin,
      }),
      // Fluttering golden-yellow & red pennant flag
      crayonPath(
        'M 36 -44 L 16 -52 L 24 -38 L 12 -32 L 32 -36 Z',
        bananaYellow,
        { strokeWidth: outlineThin }
      ),
    ]
  );

  // 6. Sir Leo's Armored Torso, Leg in Stirrup & Star Shield
  const knightTorsoAndShield = svgEl('g', { 'data-part': 'knight-armor' }, [
    // Armored leg in stirrup pointing right (+X)
    crayonPath(
      'M -6 -58 L 4 -38 L 14 -36 L 6 -58 Z',
      getPatternFill('crayonSkyBlue'),
      { strokeWidth: outlineMedium }
    ),
    // Sky-blue/silver breastplate torso
    crayonPath(
      'M -14 -88 L 12 -88 L 14 -56 L -14 -56 Z',
      getPatternFill('crayonSkyBlue'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Royal shield with golden star emblem (`data-part="knight-shield"`)
    svgEl('g', { 'data-part': 'knight-shield' }, [
      crayonPath(
        'M -8 -82 L 16 -82 L 16 -64 C 16 -52, 4 -46, 4 -46 C 4 -46, -8 -52, -8 -64 Z',
        getPatternFill('crayonRoyalBlue'),
        { strokeWidth: outlineMedium }
      ),
      crayonPath(renderStarShape(4, -66, 7.5, 0), warmMoon, {
        strokeWidth: outlineThin,
      }),
    ]),
  ]);

  // 7. Sir Leo's Plumed Helmet & Friendly Face Facing RIGHT (+X) (`data-part="knight-helmet"`)
  const knightHead = svgEl('g', { 'data-part': 'knight-helmet' }, [
    // Red feather plume on top of helmet
    crayonPath(
      'M -4 -116 C -16 -128, -28 -124, -24 -110 C -16 -112, -8 -112, 0 -110 Z',
      radishRed,
      { strokeWidth: outlineMedium }
    ),
    // Round silver-blue helmet dome
    crayonPath(
      'M -14 -102 C -14 -118, 14 -118, 14 -102 L 14 -88 L -14 -88 Z',
      getPatternFill('crayonSkyBlue'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    // Open visor window showing warm friendly face facing RIGHT (+X)
    crayonPath(
      'M -4 -104 L 14 -104 C 16 -96, 14 -90, -4 -90 Z',
      skinPeach,
      { strokeWidth: outlineMedium }
    ),
    // Rosy cheek & friendly eye facing right
    svgEl('circle', { cx: 4, cy: -94, r: 3.2, fill: curtainPink, opacity: 0.75 }),
    blink
      ? svgEl('path', {
          d: 'M 4 -99 Q 7 -96, 10 -99',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 8, cy: -98, r: 2.1, fill: charcoalOutline }),
    // Brave smile
    svgEl('path', {
      d: 'M 3 -93 Q 7 -90, 11 -93',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  const sleepZzz = isSleeping
    ? svgEl(
        'text',
        {
          x: 18,
          y: -120,
          'font-family': TOKENS.typography.fontFamilyHand,
          'font-size': 15,
          fill: charcoalOutline,
        },
        'z Z'
      )
    : '';

  return svgEl(
    'g',
    {
      'data-character': 'knight',
      'data-state': state,
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
      transform: svgTransform({ y: trotBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      horseTail,
      horseLegs,
      horseBodyAndHead,
      knightCape,
      knightLance,
      knightTorsoAndShield,
      knightHead,
      sleepZzz,
    ]
  );
}

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
 * Renders a Royal Mounted Soldier on Horseback (`'soldier'`).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - Cute dappled/tan crayon horse (`crayonOchre` / `crayonWoodBrown`) with 6 FPS trotting legs
 *   during `'walking'` and folded resting pose during `'sitting'` / `'sleeping'`.
 * - Loyal soldier in royal-blue & ochre tunic (`crayonNightcapBlue` / `crayonOchre`),
 *   round kettle helmet (`data-part="soldier-helmet"`), round shield (`data-part="soldier-shield"`),
 *   and upright spear with fluttering pennant (`data-part="soldier-spear"`).
 */
export function renderSoldier(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;

  const {
    ochreLight,
    skinPeach,
    curtainPink,
    hairBrown,
    woodBrown,
    warmMoon,
    terracottaRoof,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'singing';
  const isResting = state === 'sitting' || state === 'sleeping' || state === 'sleepy';
  const isSleeping = state === 'sleeping';

  const trotSwing = isWalking ? steppedOscillate(frameIndex, 6, 16, 2) : 0;
  const trotBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 6, 3.0, 1))
    : isResting
    ? 12
    : steppedOscillate(frameIndex, 12, 1.2, 2);
  const spearTilt = isWaving ? steppedOscillate(frameIndex, 6, 10) - 10 : 0;
  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 22, 1, 5);

  // 1. Horse Legs (facing RIGHT +X)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        crayonPath(
          'M -30 -16 C -38 -5, -30 2, -16 0 L -12 -12 Z',
          ochreLight,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          'M 8 -16 C 4 -5, 12 2, 26 0 L 22 -12 Z',
          ochreLight,
          { strokeWidth: outlineMedium }
        ),
      ])
    : svgEl('g', { 'data-part': 'horse-legs' }, [
        svgEl(
          'g',
          { transform: svgTransform({ x: -26, y: -28, rotate: -trotSwing * 0.8 }) },
          [
            crayonPath('M -4 0 L -5 24 L 3 24 L 4 0 Z', woodBrown, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -5 24 L 6 24 L 7 29 L -5 29 Z', charcoalOutline, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        svgEl(
          'g',
          { transform: svgTransform({ x: 18, y: -28, rotate: trotSwing * 0.8 }) },
          [
            crayonPath('M -4 0 L -3 24 L 4 24 L 4 0 Z', woodBrown, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -3 24 L 8 24 L 9 29 L -3 29 Z', charcoalOutline, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        svgEl(
          'g',
          { transform: svgTransform({ x: -16, y: -28, rotate: trotSwing }) },
          [
            crayonPath('M -5 0 L -5 24 L 4 24 L 4 0 Z', ochreLight, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -5 24 L 7 24 L 8 29 L -5 29 Z', hairBrown, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
        svgEl(
          'g',
          { transform: svgTransform({ x: 25, y: -28, rotate: -trotSwing }) },
          [
            crayonPath('M -4 0 L -4 24 L 5 24 L 4 0 Z', ochreLight, {
              strokeWidth: outlineMedium,
            }),
            crayonPath('M -4 24 L 8 24 L 9 29 L -4 29 Z', hairBrown, {
              strokeWidth: outlineThin,
            }),
          ]
        ),
      ]);

  // 2. Horse Tail & Tan Body Facing RIGHT (+X)
  const horseBody = svgEl('g', { 'data-part': 'horse-body' }, [
    crayonPath(
      'M -40 -48 C -56 -50, -64 -38, -58 -24 C -48 -28, -42 -36, -38 -42 Z',
      hairBrown,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -40 -42 C -42 -58, 28 -60, 34 -42 C 38 -26, -36 -24, -40 -42 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Blue saddle cloth
    crayonPath(
      'M -20 -54 L 12 -54 L 15 -34 L -23 -34 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineMedium }
    ),
    // Horse neck & head facing RIGHT (+X)
    crayonPath(
      'M 18 -48 C 24 -70, 32 -84, 42 -86 C 48 -86, 60 -74, 58 -64 C 56 -58, 44 -58, 36 -52 C 32 -44, 26 -38, 18 -48 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    crayonPath('M 34 -84 L 38 -95 L 44 -84 Z', ochreLight, {
      strokeWidth: outlineMedium,
    }),
    blink
      ? svgEl('path', {
          d: 'M 42 -75 Q 45 -72, 48 -75',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 45, cy: -75, r: 2.3, fill: charcoalOutline }),
  ]);

  // 3. Upright Spear with Pennant (`data-part="soldier-spear"`)
  const soldierSpear = svgEl(
    'g',
    {
      'data-part': 'soldier-spear',
      transform: svgTransform({ x: 12, y: -68, rotate: spearTilt }),
    },
    [
      svgEl('line', {
        x1: 0,
        y1: 16,
        x2: 14,
        y2: -46,
        stroke: woodBrown,
        'stroke-width': 3.0,
        'stroke-linecap': 'round',
      }),
      crayonPath('M 10 -44 L 16 -56 L 18 -42 Z', ochreLight, {
        strokeWidth: outlineThin,
      }),
      crayonPath('M 14 -42 L 32 -37 L 12 -32 Z', terracottaRoof, {
        strokeWidth: outlineThin,
      }),
    ]
  );

  // 4. Soldier Tunic & Round Wooden Shield (`data-part="soldier-shield"`)
  const soldierTorso = svgEl('g', { 'data-part': 'soldier-torso' }, [
    crayonPath(
      'M -12 -82 L 10 -82 L 12 -52 L -12 -52 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    svgEl('g', { 'data-part': 'soldier-shield' }, [
      svgEl('circle', {
        cx: 2,
        cy: -64,
        r: 13,
        fill: getPatternFill('crayonWoodBrown'),
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      crayonPath(renderStarShape(2, -64, 5.5, 0), warmMoon, {
        strokeWidth: outlineThin,
      }),
    ]),
  ]);

  // 5. Soldier Head & Kettle Helmet Facing RIGHT (+X) (`data-part="soldier-helmet"`)
  const soldierHead = svgEl('g', { 'data-part': 'soldier-helmet' }, [
    svgEl('circle', {
      cx: 0,
      cy: -92,
      r: 10.5,
      fill: skinPeach,
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    svgEl('circle', { cx: 4, cy: -90, r: 2.8, fill: curtainPink, opacity: 0.72 }),
    blink
      ? svgEl('path', {
          d: 'M 3 -94 Q 6 -91, 9 -94',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 6, cy: -93, r: 1.9, fill: charcoalOutline }),
    svgEl('path', {
      d: 'M 2 -88 Q 5 -86, 8 -88',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Kettle helmet dome & brim
    crayonPath(
      'M -13 -96 C -12 -110, 12 -110, 13 -96 L 16 -94 L -16 -94 Z',
      getPatternFill('crayonSkyBlue'),
      { strokeWidth: outlineMedium }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-character': 'soldier',
      'data-state': state,
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
      transform: svgTransform({ y: trotBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [horseLegs, horseBody, soldierSpear, soldierTorso, soldierHead]
  );
}

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
 * Renders a Royal Soldier (`'soldier'`) both **On Horseback (`mounted !== false`)**
 * and **On Foot (`mounted === false`)**:
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - **Horseback (`mounted: true`, default)** & **Mounting/Dismounting (`state === 'climbing'`)**:
 *   Cute dappled/tan crayon horse (`crayonOchre` / `crayonWoodBrown`) with 6 FPS trotting legs
 *   during `'walking'` and connected resting legs during `'sitting'` / `'sleeping'`.
 *   During `'climbing'`, the soldier hops into/out of the stirrup beside his waiting horse (`data-part="mounting-pose"`).
 * - **On Foot (`mounted: false`)**:
 *   - `'idle'` / `'waving'` / `'singing'`: Standing on two ochre legs & brown boots (`data-part="soldier-legs"`),
 *     royal-blue tunic (`data-part="soldier-torso"`), round wooden star shield (`data-part="soldier-shield"`),
 *     kettle helmet (`data-part="soldier-helmet"`), and spear with terracotta pennant (`data-part="soldier-spear"`).
 *   - `'walking'`: 3/4 right-facing (`+X`) walk cycle (`data-walk-profile="true"`) with both legs pivoting from hip center.
 *   - `'sitting'` / `'sleeping'` / `'sleepy'`: Seated on a wooden camp log (`data-part="camp-log"`) warming hands / telling spooky stories!
 *   - `'reaching'`: Low crouched brace pose with shield and forward-angled spear.
 */
export function renderSoldier(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask, mounted = true } = options;

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
  const isResting =
    state === 'sitting' || state === 'sleeping' || state === 'sleepy';
  const isSleeping = state === 'sleeping';
  const isClimbing = state === 'climbing';
  const isReaching = state === 'reaching';

  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 22, 1, 5);

  // ─── ON-FOOT RIG (`mounted === false` and not mid-mount `'climbing'`) ───
  if (!mounted && !isClimbing) {
    const walkSwing = isWalking ? steppedOscillate(frameIndex, 6, 18, 2) : 0;
    const footBob = isWalking
      ? Math.abs(steppedOscillate(frameIndex, 6, 2.5, 1))
      : isResting || isReaching
      ? 0
      : steppedOscillate(frameIndex, 12, 1.0, 2);
    const spearTilt = isWaving ? steppedOscillate(frameIndex, 6, 12) - 16 : 0;

    // 1. Seated on Campfire Log (`sitting` / `sleeping` / `sleepy`)
    if (isResting) {
      return svgEl(
        'g',
        {
          'data-character': 'soldier',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
          filter: svgUrl(TOKENS.filters.ids.crayonStroke),
        },
        [
          // Wooden camp log seat underneath soldier (`data-part="camp-log"`)
          svgEl('g', { 'data-part': 'camp-log' }, [
            crayonPath(
              'M -22 -15 L 16 -15 C 22 -15, 22 -2, 16 -2 L -22 -2 C -26 -2, -26 -15, -22 -15 Z',
              getPatternFill('crayonWoodBrown'),
              { strokeWidth: outlineHeavy, paperUnderlay: true }
            ),
            svgEl('ellipse', {
              cx: 16,
              cy: -8.5,
              rx: 4,
              ry: 6.5,
              fill: ochreLight,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
          ]),
          // Seated bent ochre legs & brown boots on ground (`data-part="soldier-legs"`)
          svgEl('g', { 'data-part': 'soldier-legs' }, [
            crayonPath(
              'M -5 -20 L 12 -20 L 16 -5 L 7 -5 L 5 -13 L -5 -13 Z',
              ochreLight,
              { strokeWidth: outlineMedium }
            ),
            crayonPath('M 7 -5 L 20 -5 L 22 0 L 7 0 Z', woodBrown, {
              strokeWidth: outlineThin,
            }),
          ]),
          // Upright spear resting beside log (`data-part="soldier-spear"`)
          svgEl('g', { 'data-part': 'soldier-spear' }, [
            svgEl('line', {
              x1: -14,
              y1: 0,
              x2: -20,
              y2: -72,
              stroke: woodBrown,
              'stroke-width': 2.8,
              'stroke-linecap': 'round',
            }),
            crayonPath('M -23 -70 L -20 -82 L -16 -70 Z', ochreLight, {
              strokeWidth: outlineThin,
            }),
            crayonPath('M -19 -68 L -4 -63 L -18 -58 Z', terracottaRoof, {
              strokeWidth: outlineThin,
            }),
          ]),
          // Seated royal-blue tunic, warming hand & wooden shield (`data-part="soldier-torso"`)
          svgEl('g', { 'data-part': 'soldier-torso' }, [
            crayonPath(
              'M -11 -48 L 10 -48 L 12 -18 L -11 -18 Z',
              getPatternFill('crayonNightcapBlue'),
              { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
            ),
            // Arm gesturing / warming hands toward campfire (+X)
            crayonPath(
              'M 4 -38 L 20 -33 L 18 -27 L 4 -31 Z',
              getPatternFill('crayonNightcapBlue'),
              { strokeWidth: outlineMedium }
            ),
            svgEl('circle', {
              cx: 21,
              cy: -30,
              r: 3.2,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            svgEl('g', { 'data-part': 'soldier-shield' }, [
              svgEl('circle', {
                cx: -5,
                cy: -26,
                r: 11.5,
                fill: getPatternFill('crayonWoodBrown'),
                ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
              }),
              crayonPath(renderStarShape(-5, -26, 5, 0), warmMoon, {
                strokeWidth: outlineThin,
              }),
            ]),
          ]),
          // Seated Head & Kettle Helmet (`data-part="soldier-helmet"`)
          svgEl('g', { 'data-part': 'soldier-helmet' }, [
            svgEl('circle', {
              cx: 0,
              cy: -58,
              r: 10.5,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
            svgEl('circle', {
              cx: 4,
              cy: -56,
              r: 2.8,
              fill: curtainPink,
              opacity: 0.72,
            }),
            blink
              ? svgEl('path', {
                  d: 'M 3 -60 Q 6 -57, 9 -60',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                })
              : svgEl('circle', { cx: 6, cy: -59, r: 1.9, fill: charcoalOutline }),
            svgEl('path', {
              d: 'M 2 -54 Q 5 -52, 8 -54',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            crayonPath(
              'M -13 -62 C -12 -76, 12 -76, 13 -62 L 16 -60 L -16 -60 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineMedium }
            ),
          ]),
          isSleeping
            ? svgEl(
                'text',
                {
                  x: 14,
                  y: -78,
                  'font-family': TOKENS.typography.fontFamilyHand,
                  'font-size': 14,
                  fill: charcoalOutline,
                },
                'z Z'
              )
            : '',
        ]
      );
    }

    // 2. Standing / Walking / Surrounding Dragon on Foot (`idle`, `walking`, `waving`, `reaching`)
    const onFootLegs = svgEl('g', { 'data-part': 'soldier-legs' }, [
      svgEl(
        'g',
        { transform: svgTransform({ x: -3, y: -22, rotate: -walkSwing }) },
        [
          crayonPath('M -3.5 0 L -3.5 17 L 3.5 17 L 3.5 0 Z', ochreLight, {
            strokeWidth: outlineMedium,
          }),
          crayonPath('M -3.5 17 L 8 17 L 9 22 L -3.5 22 Z', woodBrown, {
            strokeWidth: outlineThin,
          }),
        ]
      ),
      svgEl(
        'g',
        { transform: svgTransform({ x: 3, y: -22, rotate: walkSwing }) },
        [
          crayonPath('M -3.5 0 L -3.5 17 L 4 17 L 4 0 Z', ochreLight, {
            strokeWidth: outlineMedium,
          }),
          crayonPath('M -3.5 17 L 9 17 L 10 22 L -3.5 22 Z', woodBrown, {
            strokeWidth: outlineThin,
          }),
        ]
      ),
    ]);

    const onFootSpear = svgEl(
      'g',
      {
        'data-part': 'soldier-spear',
        transform: svgTransform({
          x: 11,
          y: -38,
          rotate: isWalking ? 18 : isReaching ? 32 : spearTilt,
        }),
      },
      [
        svgEl('line', {
          x1: -2,
          y1: 22,
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

    const onFootTorso = svgEl('g', { 'data-part': 'soldier-torso' }, [
      crayonPath(
        'M -12 -52 L 10 -52 L 12 -22 L -12 -22 Z',
        getPatternFill('crayonNightcapBlue'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      svgEl('g', { 'data-part': 'soldier-shield' }, [
        svgEl('circle', {
          cx: 3,
          cy: -36,
          r: 12.5,
          fill: getPatternFill('crayonWoodBrown'),
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }),
        crayonPath(renderStarShape(3, -36, 5.5, 0), warmMoon, {
          strokeWidth: outlineThin,
        }),
      ]),
    ]);

    const onFootHead = svgEl('g', { 'data-part': 'soldier-helmet' }, [
      svgEl('circle', {
        cx: 0,
        cy: -62,
        r: 10.5,
        fill: skinPeach,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: 4,
        cy: -60,
        r: 2.8,
        fill: curtainPink,
        opacity: 0.72,
      }),
      blink
        ? svgEl('path', {
            d: 'M 3 -64 Q 6 -61, 9 -64',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          })
        : svgEl('circle', { cx: 6, cy: -63, r: 1.9, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M 2 -58 Q 5 -56, 8 -58',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      crayonPath(
        'M -13 -66 C -12 -80, 12 -80, 13 -66 L 16 -64 L -16 -64 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineMedium }
      ),
    ]);

    return svgEl(
      'g',
      {
        'data-character': 'soldier',
        'data-state': state,
        'data-mounted': 'false',
        'data-facing': 'right',
        'data-walk-profile': isWalking ? 'true' : undefined,
        transform: svgTransform({ y: footBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [onFootLegs, onFootSpear, onFootTorso, onFootHead]
    );
  }

  // ─── HORSEBACK & MOUNTING/DISMOUNTING RIG (`mounted === true` or `state === 'climbing'`) ───
  const trotSwing = isWalking ? steppedOscillate(frameIndex, 6, 16, 2) : 0;
  const trotBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 6, 3.0, 1))
    : isResting
    ? 12
    : steppedOscillate(frameIndex, 12, 1.2, 2);
  const spearTilt = isWaving ? steppedOscillate(frameIndex, 6, 10) - 10 : 0;
  const riderMountOffsetY = isClimbing ? 15 : 0;

  // 1. Horse Legs (connected cleanly to horse barrel even when resting!)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        crayonPath(
          'M -32 -30 C -40 -15, -32 -2, -16 -2 L -12 -24 Z',
          ochreLight,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          'M 8 -30 C 4 -15, 12 -2, 26 -2 L 22 -24 Z',
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
    crayonPath(
      'M -20 -54 L 12 -54 L 15 -34 L -23 -34 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineMedium }
    ),
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
      transform: svgTransform({
        x: 12,
        y: -68 + riderMountOffsetY,
        rotate: spearTilt,
      }),
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
  const soldierTorso = svgEl(
    'g',
    {
      'data-part': isClimbing ? 'mounting-pose' : 'soldier-torso',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
      isClimbing
        ? crayonPath('M -10 -50 L -14 -20 L -6 -20 L -4 -50 Z', ochreLight, {
            strokeWidth: outlineMedium,
          })
        : '',
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
    ]
  );

  // 5. Soldier Head & Kettle Helmet Facing RIGHT (+X) (`data-part="soldier-helmet"`)
  const soldierHead = svgEl(
    'g',
    {
      'data-part': 'soldier-helmet',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
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
      crayonPath(
        'M -13 -96 C -12 -110, 12 -110, 13 -96 L 16 -94 L -16 -94 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineMedium }
      ),
    ]
  );

  return svgEl(
    'g',
    {
      'data-character': 'soldier',
      'data-state': state,
      'data-mounted': isClimbing ? 'climbing' : 'true',
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
      transform: svgTransform({ y: trotBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [horseLegs, horseBody, soldierSpear, soldierTorso, soldierHead]
  );
}

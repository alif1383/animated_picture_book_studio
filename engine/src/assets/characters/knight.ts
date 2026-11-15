import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderStarShape } from '../props/shared';

/**
 * Renders Sir Leo the Brave Crayon Knight (`'knight'`) both **On Horseback (`mounted !== false`)**
 * and **On Foot (`mounted === false`)**:
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - **Horseback (`mounted: true`, default)** & **Mounting/Dismounting (`state === 'climbing'`)**:
 *   Noble cream/warm-brown crayon steed (`paperWarm` / `crayonWoodBrown`) with chestnut mane & tail,
 *   red/gold saddle blanket (`crayonAwningRed`, `crayonWarmMoon`), bridle, and 4 articulated legs.
 *   During `'climbing'`, Sir Leo hops into/out of the stirrup alongside his waiting steed (`data-part="mounting-pose"`).
 * - **On Foot (`mounted: false`)**:
 *   - `'idle'` / `'waving'` / `'singing'`: Standing on two sky-blue armored greaves & brown boots (`data-part="knight-legs"`).
 *   - `'walking'`: 3/4 right-facing (`+X`) walk cycle (`data-walk-profile="true"`) with both legs pivoting from hip center.
 *   - `'sitting'` / `'sleeping'` / `'sleepy'`: Seated on a wooden camp log (`data-part="camp-log"`) warming hands / telling stories.
 *   - `'reaching'`: Low crouching/ducking spear-reach pose (`data-part="crouch-spear-reach"`) that ducks underneath the Dragon's
 *     overhead fire stream while thrusting his long silver spear upward at ~38° into the Dragon's open mouth to pop out the thorn!
 */
export function renderKnight(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask, mounted = true } = options;

  const {
    paperWarm,
    ochreLight,
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
  const isResting =
    state === 'sitting' || state === 'sleeping' || state === 'sleepy';
  const isSleeping = state === 'sleeping';
  const isClimbing = state === 'climbing';
  const isReaching = state === 'reaching';

  const capeFlutter = steppedOscillate(frameIndex, 8, 5);
  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 20, 1, 2);

  // ─── ON-FOOT RIG (`mounted === false` and not mid-mount `'climbing'`) ───
  if (!mounted && !isClimbing) {
    const walkSwing = isWalking ? steppedOscillate(frameIndex, 6, 20) : 0;
    const footBob = isWalking
      ? Math.abs(steppedOscillate(frameIndex, 6, 2.8))
      : isResting || isReaching
      ? 0
      : steppedOscillate(frameIndex, 12, 1.2);
    const lanceWave = isWaving ? steppedOscillate(frameIndex, 6, 14) - 20 : 0;

    // 1. Low Crouching / Ducking Upward Spear-Reach Pose (`state === 'reaching'`)
    if (isReaching) {
      const spearJiggle = round2(steppedOscillate(frameIndex, 6, 2.0));
      return svgEl(
        'g',
        {
          'data-character': 'knight',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
          'data-part': 'crouch-spear-reach',
          filter: svgUrl(TOKENS.filters.ids.crayonStroke),
        },
        [
          // Fluttering red cape tucked low behind crouched back (`data-part="knight-cape"`)
          svgEl(
            'g',
            {
              'data-part': 'knight-cape',
              transform: svgTransform({ x: -10, y: -42, rotate: capeFlutter }),
            },
            [
              crayonPath(
                'M 0 0 C -18 4, -30 16, -26 30 C -14 28, -4 20, 4 8 Z',
                getPatternFill('crayonAwningRed'),
                { strokeWidth: outlineMedium }
              ),
            ]
          ),
          // Kneeling / lunging armored legs on ground (`data-part="knight-legs"`)
          svgEl('g', { 'data-part': 'knight-legs' }, [
            // Back kneeling leg
            crayonPath(
              'M -18 -16 L -6 -2 L 4 -2 L -6 -18 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineMedium }
            ),
            crayonPath('M -20 -6 L -8 -6 L -8 0 L -22 0 Z', woodBrown, {
              strokeWidth: outlineThin,
            }),
            // Front lunging leg with boot planted at (+12..+26, 0)
            crayonPath(
              'M 2 -18 L 18 -18 L 22 -4 L 10 -4 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineMedium }
            ),
            crayonPath('M 10 -5 L 25 -5 L 27 0 L 10 0 Z', woodBrown, {
              strokeWidth: outlineThin,
            }),
          ]),
          // Crouched breastplate & royal shield (`data-part="knight-armor"`)
          svgEl('g', { 'data-part': 'knight-armor' }, [
            crayonPath(
              'M -12 -46 L 14 -46 L 16 -16 L -12 -16 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
            ),
            svgEl('g', { 'data-part': 'knight-shield' }, [
              crayonPath(
                'M -8 -42 L 12 -42 L 12 -28 C 12 -18, 2 -14, 2 -14 C 2 -14, -8 -18, -8 -28 Z',
                getPatternFill('crayonRoyalBlue'),
                { strokeWidth: outlineMedium }
              ),
              crayonPath(renderStarShape(2, -29, 6.5, 0), warmMoon, {
                strokeWidth: outlineThin,
              }),
            ]),
          ]),
          // Upward-Angled Long Silver Spear reaching into Dragon's open mouth (`data-part="knight-lance"`)
          svgEl(
            'g',
            {
              'data-part': 'knight-lance',
              transform: svgTransform({ x: 8, y: round2(-32 + spearJiggle) }),
            },
            [
              svgEl('line', {
                x1: -12,
                y1: 10,
                x2: 88,
                y2: -72,
                stroke: woodBrown,
                'stroke-width': 3.8,
                'stroke-linecap': 'round',
              }),
              // Gleaming silver-blue spearhead + golden star spark at tip (96, -78)
              crayonPath(
                'M 82 -66 L 98 -80 L 90 -60 Z',
                getPatternFill('crayonSkyBlue'),
                { strokeWidth: outlineThin }
              ),
              crayonPath(renderStarShape(98, -80, 7.5, frameIndex * 20), bananaYellow, {
                strokeWidth: outlineThin,
              }),
            ]
          ),
          // Low tucked plumed helmet (`y: -46 .. -70`) safely below overhead fire (`data-part="knight-helmet"`)
          svgEl('g', { 'data-part': 'knight-helmet' }, [
            crayonPath(
              'M -2 -70 C -14 -80, -26 -76, -22 -64 C -14 -66, -6 -66, 2 -64 Z',
              radishRed,
              { strokeWidth: outlineMedium }
            ),
            crayonPath(
              'M -12 -58 C -12 -72, 14 -72, 14 -58 L 14 -46 L -12 -46 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineHeavy, paperUnderlay: true }
            ),
            crayonPath(
              'M -2 -60 L 14 -60 C 16 -53, 14 -48, -2 -48 Z',
              skinPeach,
              { strokeWidth: outlineMedium }
            ),
            svgEl('circle', { cx: 8, cy: -55, r: 2.0, fill: charcoalOutline }),
            svgEl('path', {
              d: 'M 3 -50 Q 7 -47, 11 -50',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
          ]),
        ]
      );
    }

    // 2. Seated on Campfire Log (`sitting` / `sleeping` / `sleepy`)
    if (isResting) {
      return svgEl(
        'g',
        {
          'data-character': 'knight',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
          filter: svgUrl(TOKENS.filters.ids.crayonStroke),
        },
        [
          // Warm wooden camp log seat underneath Sir Leo (`data-part="camp-log"`)
          svgEl('g', { 'data-part': 'camp-log' }, [
            crayonPath(
              'M -24 -16 L 18 -16 C 24 -16, 24 -2, 18 -2 L -24 -2 C -28 -2, -28 -16, -24 -16 Z',
              getPatternFill('crayonWoodBrown'),
              { strokeWidth: outlineHeavy, paperUnderlay: true }
            ),
            svgEl('ellipse', {
              cx: 18,
              cy: -9,
              rx: 4.5,
              ry: 7,
              fill: ochreLight,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
          ]),
          // Resting cape draped behind log (`data-part="knight-cape"`)
          svgEl('g', { 'data-part': 'knight-cape' }, [
            crayonPath(
              'M -8 -48 C -22 -38, -28 -18, -22 -4 C -14 -6, -8 -18, -4 -36 Z',
              getPatternFill('crayonAwningRed'),
              { strokeWidth: outlineMedium }
            ),
          ]),
          // Seated bent armored legs & boots planted on ground (`data-part="knight-legs"`)
          svgEl('g', { 'data-part': 'knight-legs' }, [
            crayonPath(
              'M -6 -22 L 14 -22 L 18 -5 L 8 -5 L 6 -14 L -6 -14 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineMedium }
            ),
            crayonPath('M 8 -5 L 22 -5 L 24 0 L 8 0 Z', woodBrown, {
              strokeWidth: outlineThin,
            }),
          ]),
          // Upright lance resting beside log (`data-part="knight-lance"`)
          svgEl('g', { 'data-part': 'knight-lance' }, [
            svgEl('line', {
              x1: -16,
              y1: 0,
              x2: -22,
              y2: -78,
              stroke: woodBrown,
              'stroke-width': 3.2,
              'stroke-linecap': 'round',
            }),
            crayonPath(
              'M -25 -76 L -22 -90 L -18 -76 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineThin }
            ),
          ]),
          // Seated torso & shield (`data-part="knight-armor"`)
          svgEl('g', { 'data-part': 'knight-armor' }, [
            crayonPath(
              'M -12 -52 L 12 -52 L 13 -20 L -12 -20 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
            ),
            // Outstretched arm warming hands by the campfire
            crayonPath(
              'M 4 -42 L 22 -36 L 20 -30 L 4 -34 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineMedium }
            ),
            svgEl('circle', {
              cx: 23,
              cy: -33,
              r: 3.5,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            svgEl('g', { 'data-part': 'knight-shield' }, [
              crayonPath(
                'M -14 -42 L 4 -42 L 4 -26 C 4 -16, -5 -12, -5 -12 C -5 -12, -14 -16, -14 -26 Z',
                getPatternFill('crayonRoyalBlue'),
                { strokeWidth: outlineMedium }
              ),
              crayonPath(renderStarShape(-5, -28, 6, 0), warmMoon, {
                strokeWidth: outlineThin,
              }),
            ]),
          ]),
          // Seated Plumed Helmet & Face (`data-part="knight-helmet"`)
          svgEl('g', { 'data-part': 'knight-helmet' }, [
            crayonPath(
              'M -4 -78 C -16 -90, -28 -86, -24 -72 C -16 -74, -8 -74, 0 -72 Z',
              radishRed,
              { strokeWidth: outlineMedium }
            ),
            crayonPath(
              'M -13 -66 C -13 -80, 13 -80, 13 -66 L 13 -52 L -13 -52 Z',
              getPatternFill('crayonSkyBlue'),
              { strokeWidth: outlineHeavy, paperUnderlay: true }
            ),
            crayonPath(
              'M -3 -68 L 13 -68 C 15 -60, 13 -54, -3 -54 Z',
              skinPeach,
              { strokeWidth: outlineMedium }
            ),
            svgEl('circle', {
              cx: 4,
              cy: -58,
              r: 3.0,
              fill: curtainPink,
              opacity: 0.75,
            }),
            blink
              ? svgEl('path', {
                  d: 'M 4 -63 Q 7 -60, 10 -63',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                })
              : svgEl('circle', { cx: 8, cy: -62, r: 2.0, fill: charcoalOutline }),
            svgEl('path', {
              d: 'M 3 -57 Q 7 -54, 11 -57',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
          ]),
          isSleeping
            ? svgEl(
                'text',
                {
                  x: 16,
                  y: -84,
                  'font-family': TOKENS.typography.fontFamilyHand,
                  'font-size': 15,
                  fill: charcoalOutline,
                },
                'z Z'
              )
            : '',
        ]
      );
    }

    // 3. Standing / Walking / Cheering on Foot (`idle`, `walking`, `waving`, `singing`)
    const onFootLegs = svgEl('g', { 'data-part': 'knight-legs' }, [
      // Back leg pivoting from hip center (-2, -24)
      svgEl(
        'g',
        { transform: svgTransform({ x: -3, y: -24, rotate: -walkSwing }) },
        [
          crayonPath(
            'M -4 0 L -4 18 L 4 18 L 4 0 Z',
            getPatternFill('crayonSkyBlue'),
            { strokeWidth: outlineMedium }
          ),
          crayonPath('M -4 18 L 9 18 L 10 24 L -4 24 Z', woodBrown, {
            strokeWidth: outlineThin,
          }),
        ]
      ),
      // Front leg pivoting from hip center (+3, -24)
      svgEl(
        'g',
        { transform: svgTransform({ x: 3, y: -24, rotate: walkSwing }) },
        [
          crayonPath(
            'M -4 0 L -4 18 L 5 18 L 5 0 Z',
            getPatternFill('crayonSkyBlue'),
            { strokeWidth: outlineMedium }
          ),
          crayonPath('M -4 18 L 10 18 L 11 24 L -4 24 Z', woodBrown, {
            strokeWidth: outlineThin,
          }),
        ]
      ),
    ]);

    const onFootCape = svgEl(
      'g',
      {
        'data-part': 'knight-cape',
        transform: svgTransform({ x: -8, y: -58, rotate: capeFlutter * 0.8 }),
      },
      [
        crayonPath(
          'M 0 0 C -18 6, -28 22, -22 40 C -12 38, -4 26, 4 10 Z',
          getPatternFill('crayonAwningRed'),
          { strokeWidth: outlineMedium }
        ),
      ]
    );

    const onFootLance = svgEl(
      'g',
      {
        'data-part': 'knight-lance',
        transform: svgTransform({
          x: 10,
          y: -44,
          rotate: isWalking ? 22 : lanceWave,
        }),
      },
      [
        svgEl('line', {
          x1: -4,
          y1: 24,
          x2: 20,
          y2: -54,
          stroke: woodBrown,
          'stroke-width': 3.5,
          'stroke-linecap': 'round',
        }),
        crayonPath(
          'M 15 -48 L 24 -66 L 25 -46 Z',
          getPatternFill('crayonSkyBlue'),
          { strokeWidth: outlineThin }
        ),
        crayonPath(
          'M 16 -46 L -2 -52 L 5 -40 L -4 -34 L 14 -38 Z',
          bananaYellow,
          { strokeWidth: outlineThin }
        ),
      ]
    );

    const onFootArmor = svgEl('g', { 'data-part': 'knight-armor' }, [
      crayonPath(
        'M -13 -60 L 13 -60 L 14 -24 L -13 -24 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      crayonPath('M -13 -30 L 14 -30 L 14 -25 L -13 -25 Z', warmMoon, {
        strokeWidth: outlineThin,
      }),
      svgEl('g', { 'data-part': 'knight-shield' }, [
        crayonPath(
          'M -6 -54 L 16 -54 L 16 -38 C 16 -26, 5 -20, 5 -20 C 5 -20, -6 -26, -6 -38 Z',
          getPatternFill('crayonRoyalBlue'),
          { strokeWidth: outlineMedium }
        ),
        crayonPath(renderStarShape(5, -39, 7, 0), warmMoon, {
          strokeWidth: outlineThin,
        }),
      ]),
    ]);

    const onFootHead = svgEl('g', { 'data-part': 'knight-helmet' }, [
      crayonPath(
        'M -4 -88 C -16 -100, -28 -96, -24 -82 C -16 -84, -8 -84, 0 -82 Z',
        radishRed,
        { strokeWidth: outlineMedium }
      ),
      crayonPath(
        'M -14 -74 C -14 -90, 14 -90, 14 -74 L 14 -60 L -14 -60 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineHeavy, paperUnderlay: true }
      ),
      crayonPath(
        'M -4 -76 L 14 -76 C 16 -68, 14 -62, -4 -62 Z',
        skinPeach,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', {
        cx: 4,
        cy: -66,
        r: 3.1,
        fill: curtainPink,
        opacity: 0.75,
      }),
      blink
        ? svgEl('path', {
            d: 'M 4 -71 Q 7 -68, 10 -71',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          })
        : svgEl('circle', { cx: 8, cy: -70, r: 2.0, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M 3 -65 Q 7 -62, 11 -65',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);

    return svgEl(
      'g',
      {
        'data-character': 'knight',
        'data-state': state,
        'data-mounted': 'false',
        'data-facing': 'right',
        'data-walk-profile': isWalking ? 'true' : undefined,
        transform: svgTransform({ y: footBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [onFootCape, onFootLegs, onFootLance, onFootArmor, onFootHead]
    );
  }

  // ─── HORSEBACK & MOUNTING/DISMOUNTING RIG (`mounted === true` or `state === 'climbing'`) ───
  const trotSwing = isWalking ? steppedOscillate(frameIndex, 6, 18) : 0;
  const trotBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 6, 3.5))
    : isResting
    ? 14
    : steppedOscillate(frameIndex, 12, 1.5);
  const lanceWave = isWaving ? steppedOscillate(frameIndex, 6, 12) - 14 : 0;
  const riderMountOffsetY = isClimbing ? 16 : 0;

  // 1. Horse Legs (connected cleanly to horse barrel even when resting!)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        crayonPath(
          'M -36 -34 C -46 -18, -38 -2, -18 -2 L -12 -28 Z',
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          'M 8 -34 C 2 -18, 12 -2, 30 -2 L 26 -28 Z',
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
    crayonPath(
      'M -46 -46 C -48 -64, 32 -66, 38 -46 C 42 -28, -42 -26, -46 -46 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    svgEl('circle', { cx: -28, cy: -48, r: 7, fill: woodBrown, opacity: 0.35 }),
    svgEl('circle', { cx: -16, cy: -42, r: 4.5, fill: woodBrown, opacity: 0.35 }),
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
    crayonPath(
      'M 22 -52 C 28 -76, 36 -92, 46 -94 C 52 -94, 68 -80, 66 -70 C 64 -62, 50 -64, 42 -58 C 38 -48, 32 -40, 22 -52 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    crayonPath(
      'M 18 -56 C 22 -72, 28 -86, 38 -94 C 32 -82, 28 -68, 24 -54 Z',
      hairBrown,
      { strokeWidth: outlineMedium }
    ),
    crayonPath('M 38 -92 L 42 -104 L 48 -92 Z', paperWarm, {
      strokeWidth: outlineMedium,
    }),
    blink
      ? svgEl('path', {
          d: 'M 46 -82 Q 50 -79, 54 -82',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 50, cy: -82, r: 2.6, fill: charcoalOutline }),
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
      transform: svgTransform({
        x: -10,
        y: -86 + riderMountOffsetY,
        rotate: capeFlutter * 0.8,
      }),
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
        y: -76 + riderMountOffsetY,
        rotate: isWalking ? 18 : lanceWave,
      }),
    },
    [
      svgEl('line', {
        x1: -6,
        y1: 14,
        x2: 44,
        y2: -54,
        stroke: woodBrown,
        'stroke-width': 3.6,
        'stroke-linecap': 'round',
      }),
      crayonPath('M 38 -46 L 50 -62 L 44 -42 Z', getPatternFill('crayonSkyBlue'), {
        strokeWidth: outlineThin,
      }),
      crayonPath(
        'M 36 -44 L 16 -52 L 24 -38 L 12 -32 L 32 -36 Z',
        bananaYellow,
        { strokeWidth: outlineThin }
      ),
    ]
  );

  // 6. Sir Leo's Armored Torso, Leg in Stirrup & Star Shield
  const knightTorsoAndShield = svgEl(
    'g',
    {
      'data-part': isClimbing ? 'mounting-pose' : 'knight-armor',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
      // Armored leg in stirrup pointing right (+X)
      crayonPath(
        'M -6 -58 L 4 -38 L 14 -36 L 6 -58 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineMedium }
      ),
      // Second trailing leg pushing off ground when mounting/dismounting (`climbing`)
      isClimbing
        ? crayonPath(
            'M -12 -54 L -16 -22 L -6 -22 L -4 -54 Z',
            getPatternFill('crayonSkyBlue'),
            { strokeWidth: outlineMedium }
          )
        : '',
      crayonPath(
        'M -14 -88 L 12 -88 L 14 -56 L -14 -56 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
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
    ]
  );

  // 7. Sir Leo's Plumed Helmet & Friendly Face Facing RIGHT (+X) (`data-part="knight-helmet"`)
  const knightHead = svgEl(
    'g',
    {
      'data-part': 'knight-helmet',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
      crayonPath(
        'M -4 -116 C -16 -128, -28 -124, -24 -110 C -16 -112, -8 -112, 0 -110 Z',
        radishRed,
        { strokeWidth: outlineMedium }
      ),
      crayonPath(
        'M -14 -102 C -14 -118, 14 -118, 14 -102 L 14 -88 L -14 -88 Z',
        getPatternFill('crayonSkyBlue'),
        { strokeWidth: outlineHeavy, paperUnderlay: true }
      ),
      crayonPath(
        'M -4 -104 L 14 -104 C 16 -96, 14 -90, -4 -90 Z',
        skinPeach,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: 4, cy: -94, r: 3.2, fill: curtainPink, opacity: 0.75 }),
      blink
        ? svgEl('path', {
            d: 'M 4 -99 Q 7 -96, 10 -99',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          })
        : svgEl('circle', { cx: 8, cy: -98, r: 2.1, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M 3 -93 Q 7 -90, 11 -93',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]
  );

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
      'data-mounted': isClimbing ? 'climbing' : 'true',
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

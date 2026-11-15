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
import { renderSheepPlushie } from './shared';
import { renderHandheldPizzaSlice } from '../props/pizzaSlice';
import { renderStarShape } from '../props/shared';

/**
 * Renders the Little Girl character rig (`'little_girl'`), modeled after the
 * hand-drawn wax-crayon reference turnaround sheet:
 * - Fluffy, wavy shoulder-length warm brown hair with a pastel pink hair clip
 * - Cozy purple/plum knit crayon sweater with a golden 5-point star on the chest
 * - Cream wide-leg trousers and white sneakers with brown soles
 * - Supports `holdingSheep` (`data-part="sheep-plushie"`) and `holdingPizza` (`data-part="pizza-slice"`)
 * - Full state rigging: `climbing`, `sitting`, `singing`, `sleeping`/`sleepy`, `curious`/`looking_up`, `waving`, `walking`, `idle`
 */
export function renderLittleGirl(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    holdingSheep,
    holdingPizza = false,
    fillMask,
  } = options;

  const showSheep = holdingSheep ?? !holdingPizza;

  const {
    hairBrown,
    woodBrown,
    ochreWall,
    ochreLight,
    paperWarm,
    skinPeach,
    moonCheek,
    cherryRose,
    dressPink,
    sweaterPurpleDark,
    pantsCream,
    warmMoon,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // 1. Rear-View Ladder Climbing Rig (Matches back-view turnaround in Reference Sheet)
  if (state === 'climbing') {
    const step = steppedOscillate(frameIndex, 4, 6);
    const bodyBob = Math.abs(steppedOscillate(frameIndex, 4, 2));

    return svgEl(
      'g',
      {
        'data-character': 'little_girl',
        'data-state': 'climbing',
        transform: svgTransform({ y: -bodyBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Left & right sweater sleeves reaching up to hold ladder rails
        crayonPath(
          `M -13 -45 C -20 ${-55 - step * 0.5}, -19 ${-67 - step}, -13 ${-73 - step}`,
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineMedium }
        ),
        svgEl('circle', {
          cx: -13,
          cy: round2(-74 - step),
          r: 3.2,
          fill: skinPeach,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        crayonPath(
          `M 13 -45 C 20 ${-55 + step * 0.5}, 19 ${-67 + step}, 13 ${-73 + step}`,
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineMedium }
        ),
        svgEl('circle', {
          cx: 13,
          cy: round2(-74 + step),
          r: 3.2,
          fill: skinPeach,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        // Left & right cream wide-leg trousers & white sneakers stepping on ladder rungs
        svgEl('g', { transform: svgTransform({ y: step }) }, [
          crayonPath('M -13 -22 L -2 -22 L -1 -5 L -14 -5 Z', pantsCream, {
            strokeWidth: outlineMedium,
            paperUnderlay: true,
          }),
          crayonPath(
            'M -14 -5 C -14 2, -1 2, -1 -5 Z',
            paperWarm,
            { strokeWidth: outlineMedium }
          ),
          svgEl('path', {
            d: 'M -14 -1 L -1 -1',
            fill: 'none',
            stroke: woodBrown,
            'stroke-width': 2.2,
          }),
        ]),
        svgEl('g', { transform: svgTransform({ y: -step }) }, [
          crayonPath('M 2 -24 L 13 -24 L 14 -7 L 1 -7 Z', pantsCream, {
            strokeWidth: outlineMedium,
            paperUnderlay: true,
          }),
          crayonPath(
            'M 1 -7 C 1 0, 14 0, 14 -7 Z',
            paperWarm,
            { strokeWidth: outlineMedium }
          ),
          svgEl('path', {
            d: 'M 1 -3 L 14 -3',
            fill: 'none',
            stroke: woodBrown,
            'stroke-width': 2.2,
          }),
        ]),
        // Purple knit sweater from behind with ribbed hem
        crayonPath(
          'M -14 -49 L 14 -49 L 17 -21 Q 0 -19, -17 -21 Z',
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
        ),
        svgEl('path', {
          d: 'M -15 -23 L 15 -23',
          fill: 'none',
          stroke: sweaterPurpleDark,
          'stroke-width': 2.2,
        }),
        // Fluffy sheep plushie tucked on her back
        showSheep ? renderSheepPlushie(2, -32, -6) : '',
        holdingPizza ? renderHandheldPizzaSlice(14, -30, 12) : '',
        // Fluffy wavy shoulder-length brown hair from behind (Ref Sheet row 1, col 3)
        crayonPath(
          'M -22 -52 C -27 -60, -25 -74, -18 -82 C -10 -90, 10 -90, 18 -82 C 25 -74, 27 -60, 22 -52 C 16 -46, -16 -46, -22 -52 Z',
          hairBrown,
          { strokeWidth: outlineHeavy }
        ),
        // Wavy crayon hair texture streaks
        svgEl('path', {
          d: 'M -12 -82 Q -16 -68, -11 -52 M 0 -84 Q -3 -68, 2 -50 M 11 -82 Q 15 -68, 10 -52',
          fill: 'none',
          stroke: ochreWall,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          opacity: 0.55,
        }),
      ]
    );
  }

  // 2. Seated / Singing Rig (Rooftop Lullaby & Cozy Seated Pose)
  if (state === 'sitting' || state === 'singing') {
    const isSinging = state === 'singing';
    const headTilt = isSinging
      ? steppedOscillate(frameIndex, 6, 5) - 8
      : -4;
    const blink = isSteppedBlinkFrame(frameIndex, 18, 1);
    const mouthOpen = isSinging && frameIndex % 2 === 0;
    const starPath = renderStarShape(0, -29, 6.2, 0);

    return svgEl(
      'g',
      {
        'data-character': 'little_girl',
        'data-state': state,
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Seated cream wide-leg trousers & white sneakers resting on slope
        crayonPath('M -6 -16 L 14 -6 L 19 -14 L 2 -22 Z', pantsCream, {
          strokeWidth: outlineMedium,
          paperUnderlay: true,
        }),
        crayonPath('M 12 -6 C 14 2, 23 0, 21 -8 Z', paperWarm, {
          strokeWidth: outlineMedium,
        }),
        // Seated purple knit sweater with golden star
        crayonPath(
          'M -13 -43 L 11 -43 L 15 -15 L -15 -15 Z',
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
        ),
        crayonPath(starPath, warmMoon, {
          strokeWidth: outlineThin,
        }),
        // Held sheep plushie or pizza in lap
        showSheep ? renderSheepPlushie(10, -20, -8) : '',
        holdingPizza ? renderHandheldPizzaSlice(14, -28, -10) : '',
        // Swept purple sleeve hugging lap / resting chin
        crayonPath(
          'M -5 -38 Q 4 -28, 12 -24',
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineMedium }
        ),
        svgEl('circle', {
          cx: 13,
          cy: -24,
          r: 3.2,
          fill: skinPeach,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        // Pivoting head with wavy brown hair & pink hairclip
        svgEl(
          'g',
          {
            'data-part': 'head',
            transform: svgTransform({
              rotate: headTilt,
              pivotX: 0,
              pivotY: -46,
            }),
          },
          [
            // Back wavy hair volume
            crayonPath(
              'M -21 -48 C -26 -58, -24 -76, -12 -82 C 4 -86, 20 -78, 21 -60 C 22 -50, 14 -45, 8 -46 Z',
              hairBrown,
              { strokeWidth: outlineHeavy }
            ),
            // Warm peachy round face
            svgEl('circle', {
              cx: 1,
              cy: -59,
              r: 14.5,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
            // Rosy cheeks
            svgEl('circle', {
              cx: -7,
              cy: -55,
              r: 3.2,
              fill: moonCheek,
              opacity: 0.62,
            }),
            svgEl('circle', {
              cx: 8,
              cy: -55,
              r: 3.2,
              fill: moonCheek,
              opacity: 0.62,
            }),
            // Wavy bangs & side curls framing face
            crayonPath(
              'M -15 -56 C -16 -72, -2 -77, 14 -68 C 17 -62, 16 -52, 14 -48 C 12 -58, 4 -65, -3 -65 C -9 -65, -12 -59, -15 -56 Z',
              hairBrown,
              { strokeWidth: outlineMedium }
            ),
            // Cute pastel pink hair clip on upper right bangs
            svgEl(
              'g',
              { 'data-part': 'hair-clip' },
              crayonPath(
                'M 6 -72 C 8 -75, 15 -69, 13 -65 C 11 -63, 4 -69, 6 -72 Z',
                dressPink,
                { strokeWidth: outlineThin }
              )
            ),
            // Expressive eyes (happy arches when singing or bright oval eyes)
            isSinging && !blink
              ? svgEl('path', {
                  d: 'M -6 -60 Q -3 -64, 0 -60 M 5 -60 Q 8 -64, 11 -60',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
                })
              : blink
              ? svgEl('path', {
                  d: 'M -6 -60 Q -3 -58, 0 -60 M 5 -60 Q 8 -58, 11 -60',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                })
              : svgEl('g', {}, [
                  svgEl('ellipse', {
                    cx: -3.5,
                    cy: -60,
                    rx: 1.9,
                    ry: 2.5,
                    fill: charcoalOutline,
                  }),
                  svgEl('circle', {
                    cx: -4.1,
                    cy: -61,
                    r: 0.7,
                    fill: paperWarm,
                  }),
                  svgEl('ellipse', {
                    cx: 7.5,
                    cy: -60,
                    rx: 1.9,
                    ry: 2.5,
                    fill: charcoalOutline,
                  }),
                  svgEl('circle', {
                    cx: 6.9,
                    cy: -61,
                    r: 0.7,
                    fill: paperWarm,
                  }),
                ]),
            // Singing open D-mouth or cheerful smile
            mouthOpen
              ? crayonPath(
                  'M -1 -53 L 6 -53 C 6 -48, -1 -48, -1 -53 Z',
                  cherryRose,
                  { strokeWidth: outlineThin }
                )
              : svgEl('path', {
                  d: 'M -1 -53 Q 3 -50, 6 -53',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                }),
            // Excitement rays when singing (Ref Sheet row 2, col 2)
            isSinging
              ? svgEl('path', {
                  d: 'M 18 -76 L 23 -81 M 21 -70 L 27 -72',
                  fill: 'none',
                  stroke: warmMoon,
                  'stroke-width': 2.2,
                  'stroke-linecap': 'round',
                })
              : '',
          ]
        ),
      ]
    );
  }

  // 3. Dedicated 3/4-Profile Walking Rig Facing Right (+X when flipX: false, -X when flipX: true)
  // Modeled after the side/3/4 walking figure in the reference turnaround sheet (top row, 2nd figure).
  if (state === 'walking') {
    const walkSwing = steppedOscillate(frameIndex, 4, 18);
    const bodyBob = Math.abs(steppedOscillate(frameIndex, 4, 2.5));
    const headBob = steppedOscillate(frameIndex, 8, 2);
    const blink = isSteppedBlinkFrame(frameIndex, 18, 1);
    const walkStarPath = renderStarShape(4.5, -31, 6.4, 0);
    const frontArmAngle = holdingPizza
      ? -45 + steppedOscillate(frameIndex, 6, 6)
      : -walkSwing * 0.85;

    return svgEl(
      'g',
      {
        'data-character': 'little_girl',
        'data-state': 'walking',
        'data-facing': 'right',
        'data-walk-profile': 'true',
        transform: svgTransform({ y: -bodyBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Back arm swinging behind torso
        svgEl(
          'g',
          {
            'data-part': 'back-arm',
            transform: svgTransform({
              rotate: walkSwing * 0.75,
              pivotX: 3,
              pivotY: -42,
            }),
          },
          [
            crayonPath(
              'M 0 -43 L 9 -26 L 3 -23 L -4 -39 Z',
              getPatternFill('crayonSweaterPurple'),
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            svgEl('circle', {
              cx: 6,
              cy: -24,
              r: 3.2,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            showSheep ? renderSheepPlushie(10, -21, -8) : '',
          ]
        ),
        // Back leg striding forward/back with sneaker toe pointing RIGHT (+X)
        svgEl(
          'g',
          {
            'data-part': 'left-leg',
            transform: svgTransform({
              rotate: -walkSwing,
              pivotX: -1,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M -7 -22 L 5 -22 L 6 -4 L -6 -4 Z',
              pantsCream,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M -6 -4 L 6 -4 C 11.5 -4, 12.5 0, 9.5 0 L -6 0 Z',
              paperWarm,
              { strokeWidth: outlineMedium }
            ),
            svgEl('path', {
              d: 'M -6 0 L 10.5 0',
              fill: 'none',
              stroke: woodBrown,
              'stroke-width': 2.2,
            }),
          ]
        ),
        // Front leg striding in opposition with sneaker toe pointing RIGHT (+X)
        svgEl(
          'g',
          {
            'data-part': 'right-leg',
            transform: svgTransform({
              rotate: walkSwing,
              pivotX: 1,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M -5 -22 L 7 -22 L 8 -4 L -5 -4 Z',
              pantsCream,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            svgEl('path', {
              d: 'M 1 -20 L 1 -5',
              fill: 'none',
              stroke: ochreLight,
              'stroke-width': 1.4,
            }),
            crayonPath(
              'M -5 -4 L 7 -4 C 12.5 -4, 13.5 0, 10.5 0 L -5 0 Z',
              paperWarm,
              { strokeWidth: outlineMedium }
            ),
            svgEl('path', {
              d: 'M -5 0 L 11.5 0',
              fill: 'none',
              stroke: woodBrown,
              'stroke-width': 2.2,
            }),
          ]
        ),
        // 3/4 Right-Facing Purple Knit Sweater Torso
        crayonPath(
          'M -11 -46 L 12 -46 L 14 -20 Q 1 -18, -12 -20 Z',
          getPatternFill('crayonSweaterPurple'),
          { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
        ),
        svgEl('path', {
          d: 'M -11 -22 L 13 -22 M -4 -45 Q 3 -41, 9 -45',
          fill: 'none',
          stroke: sweaterPurpleDark,
          'stroke-width': 2.0,
          'stroke-linecap': 'round',
        }),
        // Golden 5-point star shifted forward (+X) on 3/4 chest
        svgEl(
          'g',
          { 'data-part': 'sweater-star' },
          crayonPath(walkStarPath, warmMoon, {
            strokeWidth: outlineThin,
          })
        ),
        // Front arm swinging forward/back (or holding hot pizza slice!)
        svgEl(
          'g',
          {
            'data-part': 'front-arm',
            transform: svgTransform({
              rotate: frontArmAngle,
              pivotX: -2,
              pivotY: -41,
            }),
          },
          [
            crayonPath(
              'M -5 -43 L 4 -25 L -2 -22 L -9 -38 Z',
              getPatternFill('crayonSweaterPurple'),
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            svgEl('circle', {
              cx: 2,
              cy: -23,
              r: 3.4,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            holdingPizza ? renderHandheldPizzaSlice(14, -25, 14) : '',
          ]
        ),
        // 3/4 Right-Facing Head with wavy brown hair trailing back-left & face looking right (+X)
        svgEl(
          'g',
          {
            'data-part': 'head',
            transform: svgTransform({
              rotate: headBob,
              pivotX: 1,
              pivotY: -48,
            }),
          },
          [
            // Fluffy wavy brown hair volume fuller on back-left
            crayonPath(
              'M -23 -48 C -29 -58, -26 -76, -14 -83 C -2 -90, 11 -88, 17 -79 C 21 -72, 18 -56, 12 -49 C 4 -44, -15 -44, -23 -48 Z',
              hairBrown,
              { strokeWidth: outlineHeavy }
            ),
            svgEl('path', {
              d: 'M -18 -72 Q -22 -60, -16 -50 M -11 -75 Q -15 -62, -9 -50',
              fill: 'none',
              stroke: ochreWall,
              'stroke-width': 1.6,
              'stroke-linecap': 'round',
              opacity: 0.55,
            }),
            // Warm peachy 3/4 face shifted right (+X)
            svgEl('circle', {
              cx: 3,
              cy: -60,
              r: 14.5,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
            // Single visible ear on the back-left side of head
            svgEl('circle', {
              cx: -10.5,
              cy: -58,
              r: 3.5,
              fill: skinPeach,
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            // Side-swept wavy brown bangs framing 3/4 forehead
            crayonPath(
              'M -14 -58 C -16 -74, -2 -82, 7 -78 C 14 -80, 19 -72, 17 -61 C 13 -68, 5 -71, -2 -67 C -7 -69, -10 -63, -14 -58 Z',
              hairBrown,
              { strokeWidth: outlineMedium }
            ),
            // Pastel pink hair clip on side-swept bangs
            svgEl(
              'g',
              { 'data-part': 'hair-clip' },
              [
                crayonPath(
                  'M -5 -73 C -3 -76, 4 -70, 2 -66 C 0 -64, -7 -70, -5 -73 Z',
                  dressPink,
                  { strokeWidth: outlineThin }
                ),
                svgEl('line', {
                  x1: -3,
                  y1: -71.5,
                  x2: 0.5,
                  y2: -68,
                  stroke: cherryRose,
                  'stroke-width': 1.2,
                  'stroke-linecap': 'round',
                }),
              ]
            ),
            // Rosy cheeks shifted into 3/4 right view
            svgEl('circle', {
              cx: -2,
              cy: -55.5,
              r: 3.2,
              fill: moonCheek,
              opacity: 0.58,
            }),
            svgEl('circle', {
              cx: 12.5,
              cy: -55.5,
              r: 2.5,
              fill: moonCheek,
              opacity: 0.52,
            }),
            // Eyebrows shifted right
            svgEl('path', {
              d: 'M -1 -66 Q 1.5 -68, 4 -66 M 8 -66 Q 10.5 -68, 13 -66',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            // Eyes shifted right (+X) looking forward along the path
            blink
              ? svgEl('path', {
                  d: 'M -1 -60 Q 1.5 -57.5, 4 -60 M 8 -60 Q 10.5 -57.5, 13 -60',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                })
              : svgEl('g', {}, [
                  svgEl('ellipse', {
                    cx: 1.5,
                    cy: -60,
                    rx: 2.0,
                    ry: 2.6,
                    fill: charcoalOutline,
                  }),
                  svgEl('circle', {
                    cx: 2.1,
                    cy: -61.1,
                    r: 0.75,
                    fill: paperWarm,
                  }),
                  svgEl('ellipse', {
                    cx: 10.5,
                    cy: -60,
                    rx: 1.9,
                    ry: 2.5,
                    fill: charcoalOutline,
                  }),
                  svgEl('circle', {
                    cx: 11.1,
                    cy: -61.1,
                    r: 0.75,
                    fill: paperWarm,
                  }),
                ]),
            // Cute 3/4 nose tick pointing right
            svgEl('path', {
              d: 'M 6.2 -58 Q 8.2 -57.2, 6.5 -56.4',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
            }),
            // Cheerful open D-smile shifted right
            crayonPath(
              'M 2 -54 L 9.5 -54 C 9.5 -49, 2 -49, 2 -54 Z',
              cherryRose,
              { strokeWidth: outlineThin }
            ),
          ]
        ),
      ]
    );
  }

  // 4. Standing / Waving / Looking Up / Curious / Sleeping Rig
  const isWalking = false;
  const isWaving = state === 'waving';
  const isLookingUp = state === 'looking_up' || state === 'curious';
  const isSleeping = state === 'sleeping' || state === 'sleepy';

  const walkSwing = isWalking ? steppedOscillate(frameIndex, 4, 15) : 0;
  const bodyBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 4, 2.5))
    : steppedOscillate(frameIndex, 12, 1.2);
  const waveAngle = isWaving
    ? -115 + steppedOscillate(frameIndex, 4, 20)
    : holdingPizza
    ? -48 + steppedOscillate(frameIndex, 6, 8)
    : 16;
  const headTilt = isLookingUp
    ? -10
    : isWaving
    ? steppedOscillate(frameIndex, 6, 5)
    : steppedOscillate(frameIndex, 12, 2.5);
  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 18, 1);

  const chestStarPath = renderStarShape(0, -31, 6.8, 0);

  return svgEl(
    'g',
    {
      'data-character': 'little_girl',
      'data-state': state,
      transform: svgTransform({ y: -bodyBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Left wide-leg cream trouser & white sneaker
      svgEl(
        'g',
        {
          'data-part': 'left-leg',
          transform: svgTransform({
            rotate: walkSwing,
            pivotX: -6,
            pivotY: -21,
          }),
        },
        [
          crayonPath(
            'M -13 -22 L -1 -22 L -1 -4 L -14 -4 Z',
            pantsCream,
            { strokeWidth: outlineMedium, paperUnderlay: true }
          ),
          svgEl('path', {
            d: 'M -7 -20 L -7 -5',
            fill: 'none',
            stroke: ochreLight,
            'stroke-width': 1.4,
          }),
          // White/cream sneaker with brown sole (neutral forward-right toe cap so left foot never points backwards)
          crayonPath(
            'M -13 -4 L -1 -4 C 1 -4, 1 0, -1 0 L -13 0 C -15 0, -15 -4, -13 -4 Z',
            paperWarm,
            { strokeWidth: outlineMedium }
          ),
          svgEl('path', {
            d: 'M -14 0 L 0 0',
            fill: 'none',
            stroke: woodBrown,
            'stroke-width': 2.2,
          }),
        ]
      ),
      // Right wide-leg cream trouser & white sneaker
      svgEl(
        'g',
        {
          'data-part': 'right-leg',
          transform: svgTransform({
            rotate: -walkSwing,
            pivotX: 6,
            pivotY: -21,
          }),
        },
        [
          crayonPath(
            'M 1 -22 L 13 -22 L 14 -4 L 1 -4 Z',
            pantsCream,
            { strokeWidth: outlineMedium, paperUnderlay: true }
          ),
          svgEl('path', {
            d: 'M 7 -20 L 7 -5',
            fill: 'none',
            stroke: ochreLight,
            'stroke-width': 1.4,
          }),
          crayonPath(
            'M 1 -4 L 13 -4 C 15.5 -4, 15.5 0, 13 0 L 1 0 Z',
            paperWarm,
            { strokeWidth: outlineMedium }
          ),
          svgEl('path', {
            d: 'M 1 0 L 15 0',
            fill: 'none',
            stroke: woodBrown,
            'stroke-width': 2.2,
          }),
        ]
      ),
      // Left arm in purple knit sleeve (plus optional sheep plushie)
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: isWaving ? 25 : -walkSwing * 0.5,
            pivotX: -13,
            pivotY: -42,
          }),
        },
        [
          crayonPath(
            'M -12 -44 L -21 -26 L -15 -23 L -9 -39 Z',
            getPatternFill('crayonSweaterPurple'),
            { strokeWidth: outlineMedium, paperUnderlay: true }
          ),
          svgEl('circle', {
            cx: -19,
            cy: -23,
            r: 3.4,
            fill: skinPeach,
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          showSheep ? renderSheepPlushie(-16, -20, 8) : '',
        ]
      ),
      // Cozy purple knit sweater torso with ribbed waistband & collar
      crayonPath(
        'M -14 -46 L 14 -46 L 16 -20 Q 0 -18, -16 -20 Z',
        getPatternFill('crayonSweaterPurple'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      // Ribbed sweater hem & neckline details
      svgEl('path', {
        d: 'M -15 -22 L 15 -22 M -7 -45 Q 0 -41, 7 -45',
        fill: 'none',
        stroke: sweaterPurpleDark,
        'stroke-width': 2.0,
        'stroke-linecap': 'round',
      }),
      // Golden yellow 5-point star on center of purple sweater!
      svgEl(
        'g',
        { 'data-part': 'sweater-star' },
        crayonPath(chestStarPath, warmMoon, {
          strokeWidth: outlineThin,
        })
      ),
      // Right arm in purple knit sleeve (waves or holds hot pizza slice!)
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: waveAngle,
            pivotX: 13,
            pivotY: -42,
          }),
        },
        [
          crayonPath(
            'M 12 -44 L 21 -26 L 15 -23 L 9 -39 Z',
            getPatternFill('crayonSweaterPurple'),
            { strokeWidth: outlineMedium, paperUnderlay: true }
          ),
          svgEl('circle', {
            cx: 19,
            cy: -23,
            r: 3.4,
            fill: skinPeach,
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          holdingPizza ? renderHandheldPizzaSlice(22, -26, 18) : '',
        ]
      ),
      // Head with fluffy wavy brown hair, pastel pink hairclip & expressive face
      svgEl(
        'g',
        {
          'data-part': 'head',
          transform: svgTransform({
            rotate: headTilt,
            pivotX: 0,
            pivotY: -48,
          }),
        },
        [
          // Back wavy shoulder-length hair silhouette (Ref Sheet)
          crayonPath(
            'M -22 -49 C -28 -58, -26 -75, -16 -83 C -6 -90, 8 -90, 17 -83 C 26 -75, 28 -58, 22 -49 C 16 -44, -16 -44, -22 -49 Z',
            hairBrown,
            { strokeWidth: outlineHeavy }
          ),
          // Warm crayon hair wave highlights
          svgEl('path', {
            d: 'M -19 -68 Q -22 -58, -17 -50 M 19 -68 Q 22 -58, 17 -50',
            fill: 'none',
            stroke: ochreWall,
            'stroke-width': 1.6,
            'stroke-linecap': 'round',
            opacity: 0.55,
          }),
          // Small cute ears on sides of face
          svgEl('circle', {
            cx: -15,
            cy: -58,
            r: 3.4,
            fill: skinPeach,
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          svgEl('circle', {
            cx: 15,
            cy: -58,
            r: 3.4,
            fill: skinPeach,
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          // Warm peachy-cream round face
          svgEl('circle', {
            cx: 0,
            cy: -60,
            r: 15,
            fill: skinPeach,
            ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
          }),
          // Wavy brown bangs & top curl framing forehead
          crayonPath(
            'M -16 -59 C -18 -75, -4 -82, 3 -78 C 10 -81, 18 -74, 16 -59 C 13 -67, 6 -71, -1 -68 C -6 -72, -12 -67, -16 -59 Z',
            hairBrown,
            { strokeWidth: outlineMedium }
          ),
          // Loose center-left bang wisp (Ref Sheet detail)
          svgEl('path', {
            d: 'M -2 -71 Q -4 -65, -1 -63',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          // Pastel pink hair clip on upper-right bangs (Ref Sheet signature accessory!)
          svgEl(
            'g',
            { 'data-part': 'hair-clip' },
            [
              crayonPath(
                'M 7 -74 C 9 -77, 16 -70, 14 -66 C 11 -64, 5 -71, 7 -74 Z',
                dressPink,
                { strokeWidth: outlineThin }
              ),
              svgEl('line', {
                x1: 9,
                y1: -72,
                x2: 12.5,
                y2: -68.5,
                stroke: cherryRose,
                'stroke-width': 1.2,
                'stroke-linecap': 'round',
              }),
            ]
          ),
          // Soft rosy cheeks
          svgEl('circle', {
            cx: -8.5,
            cy: -56,
            r: 3.3,
            fill: moonCheek,
            opacity: 0.58,
          }),
          svgEl('circle', {
            cx: 8.5,
            cy: -56,
            r: 3.3,
            fill: moonCheek,
            opacity: 0.58,
          }),
          // Eyebrows
          svgEl('path', {
            d: 'M -8 -66 Q -5.5 -68, -3 -66 M 3 -66 Q 5.5 -68, 8 -66',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          // Eyes (blinking/sleeping vs happy waving vs bright oval eyes with catchlights)
          blink
            ? svgEl('path', {
                d: 'M -8 -60 Q -5.5 -57.5, -3 -60 M 3 -60 Q 5.5 -57.5, 8 -60',
                fill: 'none',
                ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
              })
            : svgEl('g', {}, [
                svgEl('ellipse', {
                  cx: -5.5,
                  cy: -60,
                  rx: 2.0,
                  ry: 2.6,
                  fill: charcoalOutline,
                }),
                svgEl('circle', {
                  cx: -6.1,
                  cy: -61.1,
                  r: 0.75,
                  fill: paperWarm,
                }),
                svgEl('ellipse', {
                  cx: 5.5,
                  cy: -60,
                  rx: 2.0,
                  ry: 2.6,
                  fill: charcoalOutline,
                }),
                svgEl('circle', {
                  cx: 4.9,
                  cy: -61.1,
                  r: 0.75,
                  fill: paperWarm,
                }),
              ]),
          // Tiny nose tick
          svgEl('path', {
            d: 'M -0.8 -57.2 Q 0 -58, 0.8 -57.2',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
          }),
          // Mouth per state: 'o' mouth when curious/looking_up, soft curve when sleeping, cheerful open D-smile otherwise
          isLookingUp
            ? svgEl('ellipse', {
                cx: 0,
                cy: -52.5,
                rx: 2.0,
                ry: 2.5,
                fill: charcoalOutline,
              })
            : isSleeping
            ? svgEl('path', {
                d: 'M -2.5 -53 Q 0 -51.5, 2.5 -53',
                fill: 'none',
                ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
              })
            : crayonPath(
                'M -4.2 -54.2 L 4.2 -54.2 C 4.2 -49, -4.2 -49, -4.2 -54.2 Z',
                cherryRose,
                { strokeWidth: outlineThin }
              ),
          // Curiosity rays (Ref Sheet row 2, col 1) or sleeping 'z Z' (Ref Sheet row 2, col 4)
          isLookingUp
            ? svgEl('path', {
                d: 'M -18 -77 L -23 -82 M -13 -81 L -15 -87 M -21 -71 L -27 -73',
                fill: 'none',
                stroke: warmMoon,
                'stroke-width': 2.0,
                'stroke-linecap': 'round',
              })
            : isSleeping
            ? svgEl(
                'text',
                {
                  x: 16,
                  y: -74,
                  'font-family': TOKENS.typography.fontFamilyHand,
                  'font-size': 12,
                  'font-weight': 'bold',
                  fill: charcoalOutline,
                },
                'z Z'
              )
            : '',
        ]
      ),
    ]
  );
}

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
import { renderSheepPlushie } from './shared';

/**
 * Renders the Little Girl character rig (`'little_girl'`) across climbing, sitting/singing,
 * walking, waving, looking_up, and idle states.
 */
export function renderLittleGirl(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    holdingSheep = true,
    fillMask,
  } = options;

  const {
    hairBrown,
    ochreWall,
    paperWarm,
    moonCheek,
    nightcapBlue,
    nightcapWhite,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // 1. Rear-View Ladder Climbing Rig (Reference Image 4!)
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
        // Left & right arms reaching up to hold ladder rails
        crayonPath(
          `M -12 -46 C -19 ${-56 - step * 0.5}, -18 ${-68 - step}, -13 ${-74 - step}`,
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          `M 12 -46 C 19 ${-56 + step * 0.5}, 18 ${-68 + step}, 13 ${-74 + step}`,
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        // Left & right legs stepping on ladder rungs with blue shoes
        svgEl('g', { transform: svgTransform({ y: step }) }, [
          crayonPath('M -9 -20 L -9 -4 L -4 -4 L -4 -20 Z', paperWarm, {
            strokeWidth: outlineThin,
          }),
          crayonPath(
            'M -11 -5 C -11 2, -2 2, -2 -5 Z',
            nightcapBlue,
            { strokeWidth: outlineMedium }
          ),
        ]),
        svgEl('g', { transform: svgTransform({ y: -step }) }, [
          crayonPath('M 4 -24 L 4 -10 L 9 -10 L 9 -24 Z', paperWarm, {
            strokeWidth: outlineThin,
          }),
          crayonPath(
            'M 2 -11 C 2 -4, 11 -4, 11 -11 Z',
            nightcapBlue,
            { strokeWidth: outlineMedium }
          ),
        ]),
        // Pink flared A-line crayon dress
        crayonPath(
          'M -11 -50 L 11 -50 L 19 -18 Q 0 -15, -19 -18 Z',
          getPatternFill('crayonDressPink'),
          { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
        ),
        // Fluffy sheep plushie tucked on her back (Ref Image 4!)
        holdingSheep ? renderSheepPlushie(2, -32, -6) : '',
        // Large round brown bob hair from behind + golden highlight + top hair loop
        crayonPath(
          'M -22 -64 C -24 -86, 24 -86, 22 -64 C 21 -52, -21 -52, -22 -64 Z',
          hairBrown,
          { strokeWidth: outlineHeavy }
        ),
        svgEl('circle', {
          cx: -12,
          cy: -70,
          r: 4.5,
          fill: ochreWall,
          opacity: 0.85,
        }),
        // Signature little loop on top of head
        svgEl('path', {
          d: 'M -2 -82 C -7 -90, 7 -90, 2 -82',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }),
      ]
    );
  }

  // 2. Rooftop Seated / Singing Profile Rig (Reference Image 2!)
  if (state === 'sitting' || state === 'singing') {
    const isSinging = state === 'singing';
    const headTilt = isSinging
      ? steppedOscillate(frameIndex, 6, 5) - 10
      : -6;
    const blink = isSteppedBlinkFrame(frameIndex, 18, 1);
    const mouthOpen = isSinging && frameIndex % 2 === 0;

    return svgEl(
      'g',
      {
        'data-character': 'little_girl',
        'data-state': state,
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Dangling legs on roof slope with blue-and-white striped stockings
        crayonPath('M 2 -12 L 12 8 L 17 6 L 7 -14 Z', nightcapWhite, {
          strokeWidth: outlineThin,
        }),
        svgEl('path', {
          d: 'M 5 -6 L 10 -8 M 8 0 L 13 -2 M 11 5 L 16 3',
          fill: 'none',
          stroke: nightcapBlue,
          'stroke-width': 2.2,
        }),
        crayonPath('M 11 7 C 13 13, 21 11, 19 5 Z', nightcapBlue, {
          strokeWidth: outlineMedium,
        }),
        // Seated pink crayon dress
        crayonPath(
          'M -9 -42 L 7 -42 L 14 -12 L -14 -12 Z',
          getPatternFill('crayonDressPink'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Fluffy sheep plushie in her lap
        holdingSheep ? renderSheepPlushie(9, -20, -8) : '',
        // Arm hugging sheep
        crayonPath(
          'M -2 -38 Q 6 -28, 12 -24',
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        // Pivoting head tilted up toward the Moon
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
            // Face profile
            svgEl('circle', {
              cx: 0,
              cy: -56,
              r: 13,
              fill: paperWarm,
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
            // Rosy cheek
            svgEl('circle', {
              cx: 5,
              cy: -53,
              r: 3.2,
              fill: moonCheek,
              opacity: 0.65,
            }),
            // Brown bob hair cap + top loop
            crayonPath(
              'M -13 -50 C -16 -68, 4 -74, 11 -62 C 4 -63, -2 -58, -5 -46 Z',
              hairBrown,
              { strokeWidth: outlineMedium }
            ),
            svgEl('path', {
              d: 'M -2 -69 C -7 -77, 6 -77, 1 -69',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            // Eye (blinking or looking up at Moon)
            blink
              ? svgEl('path', {
                  d: 'M 4 -58 Q 7 -56, 9 -58',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                })
              : svgEl('circle', {
                  cx: 6.5,
                  cy: -58,
                  r: 1.8,
                  fill: charcoalOutline,
                }),
            // Singing mouth ('O' oval) or gentle smile
            mouthOpen
              ? svgEl('ellipse', {
                  cx: 10,
                  cy: -52,
                  rx: 2.4,
                  ry: 3.1,
                  fill: charcoalOutline,
                })
              : svgEl('path', {
                  d: 'M 7 -52 Q 10 -50, 12 -53',
                  fill: 'none',
                  ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
                }),
          ]
        ),
      ]
    );
  }

  // 3. Standing / Walking / Waving / Looking Up Rig
  const isWalking = state === 'walking';
  const isWaving = state === 'waving';
  const isLookingUp = state === 'looking_up';

  const walkSwing = isWalking ? steppedOscillate(frameIndex, 4, 16) : 0;
  const bodyBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 4, 2.5))
    : steppedOscillate(frameIndex, 12, 1.2);
  const waveAngle = isWaving
    ? -125 + steppedOscillate(frameIndex, 4, 22)
    : 20;
  const headTilt = isLookingUp
    ? -14
    : steppedOscillate(frameIndex, 12, 3);
  const blink = isSteppedBlinkFrame(frameIndex, 18, 1);

  return svgEl(
    'g',
    {
      'data-character': 'little_girl',
      'data-state': state,
      transform: svgTransform({ y: -bodyBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Left & right legs
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: walkSwing,
            pivotX: -5,
            pivotY: -18,
          }),
        },
        [
          crayonPath('M -7 -18 L -7 -4 L -3 -4 L -3 -18 Z', paperWarm, {
            strokeWidth: outlineThin,
          }),
          crayonPath('M -9 -4 C -9 2, -1 2, -1 -4 Z', nightcapBlue, {
            strokeWidth: outlineMedium,
          }),
        ]
      ),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: -walkSwing,
            pivotX: 5,
            pivotY: -18,
          }),
        },
        [
          crayonPath('M 3 -18 L 3 -4 L 7 -4 L 7 -18 Z', paperWarm, {
            strokeWidth: outlineThin,
          }),
          crayonPath('M 1 -4 C 1 2, 9 2, 9 -4 Z', nightcapBlue, {
            strokeWidth: outlineMedium,
          }),
        ]
      ),
      // Pink crayon dress
      crayonPath(
        'M -10 -46 L 10 -46 L 16 -16 L -16 -16 Z',
        getPatternFill('crayonDressPink'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Left arm (holding sheep if enabled)
      crayonPath('M -10 -42 L -16 -24', paperWarm, {
        strokeWidth: outlineMedium,
      }),
      holdingSheep ? renderSheepPlushie(-14, -22, 8) : '',
      // Right arm (waves in 'waving' state)
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: waveAngle,
            pivotX: 10,
            pivotY: -42,
          }),
        },
        [
          crayonPath('M 10 -42 L 18 -26', paperWarm, {
            strokeWidth: outlineMedium,
          }),
        ]
      ),
      // Head
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: headTilt,
            pivotX: 0,
            pivotY: -48,
          }),
        },
        [
          svgEl('circle', {
            cx: 0,
            cy: -60,
            r: 14,
            fill: paperWarm,
            ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
          }),
          // Bob hair framing face
          crayonPath(
            'M -14 -56 C -16 -76, 16 -76, 14 -56 C 12 -64, -12 -64, -14 -56 Z',
            hairBrown,
            { strokeWidth: outlineMedium }
          ),
          svgEl('path', {
            d: 'M -1 -74 C -7 -82, 7 -82, 1 -74',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          // Eyes & cheeks
          svgEl('circle', {
            cx: -7,
            cy: -56,
            r: 2.8,
            fill: moonCheek,
            opacity: 0.6,
          }),
          svgEl('circle', {
            cx: 7,
            cy: -56,
            r: 2.8,
            fill: moonCheek,
            opacity: 0.6,
          }),
          blink
            ? svgEl('path', {
                d: 'M -7 -60 Q -5 -58, -3 -60 M 3 -60 Q 5 -58, 7 -60',
                fill: 'none',
                ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
              })
            : svgEl('g', {}, [
                svgEl('circle', {
                  cx: -5,
                  cy: -60,
                  r: 1.7,
                  fill: charcoalOutline,
                }),
                svgEl('circle', {
                  cx: 5,
                  cy: -60,
                  r: 1.7,
                  fill: charcoalOutline,
                }),
              ]),
          svgEl('path', {
            d: 'M -3 -53 Q 0 -50, 3 -53',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
        ]
      ),
    ]
  );
}

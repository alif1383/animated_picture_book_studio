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

/**
 * Renders the friendly Village Shopkeeper / Baker (`'shopkeeper'`) outside the Little Corner Store.
 */
export function renderShopkeeper(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    paperWarm,
    hairBrown,
    moonCheek,
    indigoNightDark,
    nightcapWhite,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const bob = steppedOscillate(frameIndex, 12, 1.5);
  const isWaving = state === 'waving';
  const waveRot = isWaving ? -125 + steppedOscillate(frameIndex, 4, 20) : 18;
  const headTilt = state === 'looking_up' ? -14 : steppedOscillate(frameIndex, 12, 2);
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, 2);

  return svgEl(
    'g',
    {
      'data-character': 'shopkeeper',
      'data-state': state,
      transform: svgTransform({ y: -bob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Legs/trousers
      crayonPath('M -9 -24 L -9 0 L -3 0 L -3 -24 Z', indigoNightDark, {
        strokeWidth: outlineThin,
      }),
      crayonPath('M 3 -24 L 3 0 L 9 0 L 9 -24 Z', indigoNightDark, {
        strokeWidth: outlineThin,
      }),
      // Teal coat torso
      crayonPath(
        'M -14 -58 L 14 -58 L 16 -22 L -16 -22 Z',
        getPatternFill('crayonStoreTeal'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Cream baker's apron over torso
      crayonPath(
        'M -10 -50 L 10 -50 L 13 -16 L -13 -16 Z',
        nightcapWhite,
        { strokeWidth: outlineThin }
      ),
      // Left arm
      crayonPath('M -14 -54 L -20 -32', getPatternFill('crayonStoreTeal'), {
        strokeWidth: outlineMedium,
      }),
      // Right waving arm
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: waveRot,
            pivotX: 14,
            pivotY: -54,
          }),
        },
        [
          crayonPath('M 14 -54 L 24 -34', paperWarm, {
            strokeWidth: outlineMedium,
          }),
        ]
      ),
      // Head with baker cap & mustache
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: headTilt,
            pivotX: 0,
            pivotY: -60,
          }),
        },
        [
          svgEl('circle', {
            cx: 0,
            cy: -72,
            r: 13,
            fill: paperWarm,
            ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
          }),
          // Puffy baker cap
          crayonPath(
            'M -14 -80 C -20 -96, 0 -102, 14 -92 C 20 -88, 16 -78, 13 -78 Z',
            nightcapWhite,
            { strokeWidth: outlineMedium }
          ),
          // Rosy cheeks & mustache
          svgEl('circle', { cx: -6, cy: -70, r: 2.5, fill: moonCheek, opacity: 0.6 }),
          svgEl('circle', { cx: 6, cy: -70, r: 2.5, fill: moonCheek, opacity: 0.6 }),
          svgEl('path', {
            d: 'M -7 -66 Q -3 -69, 0 -66 Q 3 -69, 7 -66',
            fill: 'none',
            stroke: hairBrown,
            'stroke-width': 2.4,
            'stroke-linecap': 'round',
          }),
          blink
            ? svgEl('path', {
                d: 'M -6 -74 L -2 -74 M 2 -74 L 6 -74',
                fill: 'none',
                ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
              })
            : svgEl('g', {}, [
                svgEl('circle', { cx: -4, cy: -74, r: 1.6, fill: charcoalOutline }),
                svgEl('circle', { cx: 4, cy: -74, r: 1.6, fill: charcoalOutline }),
              ]),
        ]
      ),
    ]
  );
}

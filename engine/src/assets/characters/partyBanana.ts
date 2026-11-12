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
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders the Smiling Banana in Party Hat (`'party_banana'`) — Front-right curved yellow crayon banana
 * with orange cone party hat on its left tip, smiling face, and waving stick arms.
 */
export function renderPartyBanana(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    sunsetGold,
    sunsetOrange,
    terracottaRoof,
    terracottaDark,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;
  const rock = steppedOscillate(frameIndex, 10, 3);
  const wave = steppedOscillate(frameIndex, 4, 16);
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, 2);

  const bananaD =
    'M -56 -52 C -48 -10, -10 2, 32 -4 C 58 -8, 72 -22, 76 -42 C 70 -44, 54 -24, 24 -22 C -8 -20, -36 -30, -48 -54 Z';
  const hatD = 'M -60 -50 L -54 -84 L -40 -54 Z';

  return svgEl(
    'g',
    {
      'data-character': 'party_banana',
      'data-state': state,
      transform: svgTransform({ rotate: rock }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${bananaD} ${hatD} M -46 -22 L -64 -16 M -16 -22 L -16 -42 M -34 -6 L -37 6 M -22 -4 L -24 6`,
        12
      ),
      svgEl('path', {
        d: 'M -46 -22 L -64 -16 M -34 -6 L -37 6 M -22 -4 L -24 6',
        fill: 'none',
        ...crayonStrokeAttrs({ stroke: sunsetGold, strokeWidth: outlineHeavy }),
      }),
      svgEl(
        'g',
        { transform: svgTransform({ rotate: wave, pivotX: -16, pivotY: -22 }) },
        [
          svgEl('path', {
            d: 'M -16 -22 L -16 -42',
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: sunsetGold,
              strokeWidth: outlineHeavy,
            }),
          }),
        ]
      ),
      crayonPath(bananaD, getPatternFill('crayonBananaYellow'), {
        stroke: sunsetGold,
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }),
      svgEl('path', {
        d: 'M -42 -36 C -14 -14, 38 -12, 68 -34',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineThin,
          opacity: 0.65,
        }),
      }),
      crayonPath(hatD, getPatternFill('crayonSunsetOrange'), {
        stroke: sunsetOrange,
        strokeWidth: outlineMedium,
      }),
      svgEl('path', {
        d: 'M -58 -62 L -44 -58 M -56 -72 L -48 -68 M -58 -85 L -50 -86',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: terracottaRoof,
          strokeWidth: outlineThin,
        }),
      }),
      blink
        ? svgEl('path', {
            d: 'M -39 -29 L -35 -29 M -29 -30 L -25 -30',
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: terracottaDark,
              strokeWidth: outlineThin,
            }),
          })
        : svgEl('g', {}, [
            svgEl('circle', { cx: -37, cy: -29, r: 2.1, fill: terracottaDark }),
            svgEl('circle', { cx: -27, cy: -30, r: 2.1, fill: terracottaDark }),
          ]),
      svgEl('path', {
        d: 'M -38 -22 Q -31 -15, -24 -22',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: terracottaRoof,
          strokeWidth: outlineMedium,
        }),
      }),
    ]
  );
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders the Little Green Olive Sprout (`'olive_sprout'`) — Bottom-right small dark-green oval character
 * with white tummy face, waving arms/legs, and green topknot with red tip.
 */
export function renderOliveSprout(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    paperWarm,
    treeGreen,
    indigoNightDark,
    radishRed,
    terracottaDark,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;
  const tilt = steppedOscillate(frameIndex, 8, 4);
  const wave = steppedOscillate(frameIndex, 4, 18);

  const outerBodyD =
    'M 0 -54 C 16 -54, 22 -38, 20 -24 C 18 -12, 10 -8, 0 -8 C -10 -8, -18 -12, -20 -24 C -22 -38, -16 -54, 0 -54 Z';
  const innerFaceD =
    'M 0 -46 C 10 -46, 14 -35, 13 -24 C 12 -15, 6 -12, 0 -12 C -6 -12, -12 -15, -13 -24 C -14 -35, -10 -46, 0 -46 Z';
  const topknotD = 'M -5 -52 L 2 -80 C 4 -86, 12 -84, 10 -78 L 5 -52 Z';

  return svgEl(
    'g',
    {
      'data-character': 'olive_sprout',
      'data-state': state,
      transform: svgTransform({ rotate: tilt }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${outerBodyD} ${topknotD} M -19 -32 L -30 -24 M 19 -32 L 30 -38 M -6 -9 L -12 4 M 6 -9 L 12 4`,
        11
      ),
      svgEl('path', {
        d: 'M -19 -32 L -30 -24 M -6 -9 L -12 4 M 6 -9 L 12 4',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: indigoNightDark,
          strokeWidth: outlineHeavy,
        }),
      }),
      svgEl(
        'g',
        { transform: svgTransform({ rotate: wave, pivotX: 19, pivotY: -32 }) },
        [
          svgEl('path', {
            d: 'M 19 -32 L 30 -38',
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: indigoNightDark,
              strokeWidth: outlineHeavy,
            }),
          }),
        ]
      ),
      crayonPath(topknotD, getPatternFill('crayonEmeraldFrond'), {
        stroke: indigoNightDark,
        strokeWidth: outlineMedium,
      }),
      crayonPath('M 0 -62 L 4 -76 L 8 -62 Z', radishRed, {
        stroke: terracottaDark,
        strokeWidth: outlineThin,
      }),
      crayonPath(outerBodyD, getPatternFill('crayonTreeGreen'), {
        stroke: indigoNightDark,
        strokeWidth: outlineHeavy,
        mask: fillMask,
      }),
      crayonPath(innerFaceD, paperWarm, {
        stroke: treeGreen,
        strokeWidth: outlineThin,
      }),
      svgEl('circle', { cx: -4.5, cy: -34, r: 2, fill: indigoNightDark }),
      svgEl('circle', { cx: 4.5, cy: -34, r: 2, fill: indigoNightDark }),
      svgEl('path', {
        d: 'M -5 -26 Q 0 -18, 5 -26',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: indigoNightDark,
          strokeWidth: outlineMedium,
        }),
      }),
    ]
  );
}

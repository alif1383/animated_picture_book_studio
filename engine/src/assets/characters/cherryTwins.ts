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
 * Renders the Cherry Twins in Orange Party Hats (`'cherry_twins'`) — Pair of rosy-pink cherries
 * connected by green V-stems, each wearing an orange cone party hat and smiling.
 */
export function renderCherryTwins(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    emeraldFrond,
    treeGreen,
    watermelonPink,
    sunsetOrange,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const sway = steppedOscillate(frameIndex, 10, 3.5);

  const leftCherryD =
    'M -28 -42 C -16 -42, -8 -34, -8 -22 C -8 -10, -16 -2, -28 -2 C -40 -2, -48 -10, -48 -22 C -48 -34, -40 -42, -28 -42 Z';
  const rightCherryD =
    'M 32 -50 C 43 -50, 50 -43, 50 -32 C 50 -21, 43 -14, 32 -14 C 21 -14, 14 -21, 14 -32 C 14 -43, 21 -50, 32 -50 Z';
  const stemsD = 'M -26 -42 L -6 -88 L 12 -64 L 24 -86 L 32 -50';

  return svgEl(
    'g',
    {
      'data-character': 'cherry_twins',
      'data-state': state,
      transform: svgTransform({ rotate: sway }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${leftCherryD} ${rightCherryD} ${stemsD} M -42 -36 L -38 -60 L -22 -41 M 20 -46 L 26 -68 L 40 -48`,
        11
      ),
      crayonPath(
        'M -24 -68 L -6 -88 L -14 -58 Z M 12 -64 L 24 -86 L 28 -62 Z',
        getPatternFill('crayonEmeraldFrond'),
        { stroke: treeGreen, strokeWidth: outlineThin }
      ),
      svgEl('path', {
        d: stemsD,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: emeraldFrond,
          strokeWidth: outlineMedium,
        }),
      }),
      crayonPath(leftCherryD, getPatternFill('crayonCherryRose'), {
        stroke: watermelonPink,
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }),
      crayonPath(rightCherryD, getPatternFill('crayonCherryRose'), {
        stroke: watermelonPink,
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }),
      crayonPath(
        'M -42 -36 L -38 -60 L -22 -41 Z',
        getPatternFill('crayonSunsetOrange'),
        { stroke: sunsetOrange, strokeWidth: outlineThin }
      ),
      crayonPath(
        'M 20 -46 L 26 -68 L 40 -48 Z',
        getPatternFill('crayonSunsetOrange'),
        { stroke: sunsetOrange, strokeWidth: outlineThin }
      ),
      svgEl('circle', { cx: -34, cy: -25, r: 1.8, fill: watermelonPink }),
      svgEl('circle', { cx: -22, cy: -26, r: 1.8, fill: watermelonPink }),
      svgEl('path', {
        d: 'M -35 -18 Q -28 -10, -20 -19',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: watermelonPink,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('circle', { cx: 27, cy: -35, r: 1.7, fill: watermelonPink }),
      svgEl('circle', { cx: 37, cy: -35, r: 1.7, fill: watermelonPink }),
      svgEl('path', {
        d: 'M 25 -29 Q 32 -21, 39 -29',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: watermelonPink,
          strokeWidth: outlineThin,
        }),
      }),
    ]
  );
}

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
 * Renders the Acorn Twins (`'acorn_twins'`) — Pair of golden-ochre acorn buddies holding hands
 * with brown caps and green leaf sprouts.
 */
export function renderAcornTwins(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    paperWarm,
    ochreWall,
    sunsetGold,
    hairBrown,
    charcoalOutline,
    emeraldFrond,
    curtainPink,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;
  const bounce = Math.abs(steppedOscillate(frameIndex, 6, 2.5));

  const leftBodyD =
    'M -34 -34 L -10 -34 C -8 -16, -14 -8, -22 -8 C -30 -8, -36 -16, -34 -34 Z';
  const leftCapD = 'M -36 -34 C -36 -48, -8 -48, -8 -34 Z';
  const rightBodyD =
    'M 10 -36 L 34 -38 C 36 -20, 30 -10, 22 -10 C 14 -10, 8 -18, 10 -36 Z';
  const rightCapD = 'M 8 -36 C 8 -50, 36 -50, 36 -38 Z';

  return svgEl(
    'g',
    {
      'data-character': 'acorn_twins',
      'data-state': state,
      transform: svgTransform({ y: -bounce }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${leftBodyD} ${leftCapD} ${rightBodyD} ${rightCapD} M -22 -46 C -22 -64, -12 -78, 0 -82 M 22 -48 C 18 -64, 8 -74, -4 -76 M -27 -8 L -30 2 M -17 -8 L -14 2 M 18 -10 L 16 1 M 27 -10 L 31 0 M -10 -22 Q 0 -16, 10 -24`,
        11
      ),
      svgEl('path', {
        d: 'M -24 -64 L -32 -82',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: curtainPink,
          strokeWidth: outlineMedium,
        }),
      }),
      svgEl('path', {
        d: 'M -22 -46 C -22 -64, -12 -78, 0 -82 M 22 -48 C 18 -64, 8 -74, -4 -76 M -22 -60 Q -32 -62, -26 -54 M -12 -72 Q -2 -82, 4 -72',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: emeraldFrond,
          strokeWidth: outlineHeavy,
        }),
      }),
      svgEl('path', {
        d: 'M -34 -24 L -42 -18 M 34 -26 L 42 -20 M -10 -22 Q 0 -16, 10 -24 M -27 -8 L -30 2 L -35 2 M -17 -8 L -14 2 L -10 2 M 18 -10 L 16 1 L 12 2 M 27 -10 L 31 0 L 35 0',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetGold,
          strokeWidth: outlineMedium,
        }),
      }),
      crayonPath(leftBodyD, paperWarm, {
        stroke: ochreWall,
        strokeWidth: outlineHeavy,
        mask: fillMask,
      }),
      crayonPath(leftCapD, hairBrown, {
        stroke: charcoalOutline,
        strokeWidth: outlineMedium,
      }),
      crayonPath(rightBodyD, paperWarm, {
        stroke: ochreWall,
        strokeWidth: outlineHeavy,
        mask: fillMask,
      }),
      crayonPath(rightCapD, getPatternFill('crayonWoodBrown'), {
        stroke: hairBrown,
        strokeWidth: outlineMedium,
      }),
      svgEl('circle', { cx: -26, cy: -24, r: 1.8, fill: charcoalOutline }),
      svgEl('circle', { cx: -18, cy: -24, r: 1.8, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M -26 -18 Q -22 -14, -18 -18',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('circle', { cx: 18, cy: -26, r: 1.8, fill: charcoalOutline }),
      svgEl('circle', { cx: 26, cy: -27, r: 1.8, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M 18 -20 Q 22 -16, 27 -21',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
        }),
      }),
    ]
  );
}

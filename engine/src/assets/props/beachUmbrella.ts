import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import { renderCutoutStickerHalo } from '../characters/shared';
import type { PropRenderOptions } from './types';

/**
 * Striped red/yellow/blue crayon beach umbrella on an angled wooden pole
 * with scalloped fringe and white paper-cutout sticker halo (`'beach_umbrella'`).
 */
export function renderBeachUmbrella(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const {
    charcoalOutline,
    cloudWhite,
    ochreLight,
    bananaYellow,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  // Subtle 6 FPS sea-breeze canopy sway
  const breezeTilt = steppedOscillate(frameIndex, 12, 1.6, variant * 2);

  // Angled wooden pole anchored at sand (0, 0) rising to (-14, -158)
  const poleD = 'M -3 2 L -17 -158 L -9 -158 L 5 2 Z';
  const sandMoundD = 'M -28 4 Q 0 -6, 28 4 Q 0 10, -28 4 Z';

  // Scalloped 5-panel beach umbrella dome centered around (-13, -152), tilted slightly
  const p1 =
    'M -13 -166 C -58 -162, -98 -134, -108 -102 Q -88 -112, -68 -100 C -54 -132, -32 -156, -13 -166 Z';
  const p2 =
    'M -13 -166 C -32 -156, -54 -132, -68 -100 Q -46 -112, -26 -99 C -21 -132, -17 -154, -13 -166 Z';
  const p3 =
    'M -13 -166 C -17 -154, -21 -132, -26 -99 Q -6 -111, 14 -99 C 8 -132, -2 -154, -13 -166 Z';
  const p4 =
    'M -13 -166 C -2 -154, 8 -132, 14 -99 Q 35 -111, 54 -100 C 40 -132, 16 -156, -13 -166 Z';
  const p5 =
    'M -13 -166 C 16 -156, 40 -132, 54 -100 Q 74 -111, 90 -101 C 78 -134, 36 -160, -13 -166 Z';
  const finialD = 'M -17 -165 L -13 -180 L -9 -165 Z';

  const haloSilhouette = `${sandMoundD} ${poleD} ${p1} ${p2} ${p3} ${p4} ${p5} ${finialD}`;

  return svgEl(
    'g',
    {
      'data-prop': 'beach_umbrella',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(haloSilhouette, 12),
      // Warm sand mound around pole base
      crayonPath(sandMoundD, ochreLight, {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
      }),
      // Wooden pole
      crayonPath(poleD, getPatternFill('crayonWoodBrown'), {
        stroke: charcoalOutline,
        strokeWidth: outlineMedium,
        mask: fillMask,
      }),
      // Canopy group swaying gently in the sea breeze
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: breezeTilt,
            pivotX: -13,
            pivotY: -158,
          }),
        },
        [
          crayonPath(p1, getPatternFill('crayonRadishRed'), {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
          }),
          crayonPath(p2, cloudWhite, {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
          }),
          crayonPath(p3, getPatternFill('crayonBananaYellow'), {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
          }),
          crayonPath(p4, cloudWhite, {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
          }),
          crayonPath(p5, getPatternFill('crayonCatBlue'), {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
          }),
          crayonPath(finialD, bananaYellow, {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
          }),
        ]
      ),
    ]
  );
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedLoopProgress, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders the Crying Onion in Blue Party Hat (`'crying_onion'`) — Back-right teardrop bulb
 * with blue patterned cone party hat, sad downturned mouth, and two cyan teardrops.
 */
export function renderCryingOnion(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    paperWarm,
    ochreLight,
    sunsetOrange,
    catLightBlue,
    cobaltStarBlue,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;
  const sobBob = Math.abs(steppedOscillate(frameIndex, 4, 2));
  const tearHop = round2(steppedLoopProgress(frameIndex, 8, 0) * 6);

  const bodyD =
    'M 0 -78 C 18 -62, 27 -44, 26 -26 C 25 -12, 14 -8, 0 -8 C -14 -8, -25 -12, -26 -26 C -27 -44, -18 -62, 0 -78 Z';
  const hatD = 'M -18 -62 L 0 -100 L 18 -62 Q 0 -58, -18 -62 Z';

  return svgEl(
    'g',
    {
      'data-character': 'crying_onion',
      'data-state': state,
      transform: svgTransform({ y: -sobBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${bodyD} ${hatD} M -24 -44 L -33 -52 M 24 -44 L 33 -54 M -10 -8 L -15 4 M 10 -8 L 15 4`,
        12
      ),
      svgEl('circle', { cx: 0, cy: -105, r: 9, fill: cutoutHaloWhite }),
      svgEl('path', {
        d: 'M -24 -44 L -33 -52 M 24 -44 L 33 -54 M -10 -8 L -15 4 M 10 -8 L 15 4',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineHeavy,
        }),
      }),
      crayonPath(bodyD, paperWarm, {
        stroke: sunsetOrange,
        strokeWidth: outlineMedium,
        mask: fillMask,
      }),
      svgEl('ellipse', {
        cx: 0,
        cy: -34,
        rx: 19,
        ry: 22,
        fill: ochreLight,
        opacity: 0.5,
      }),
      crayonPath(hatD, getPatternFill('crayonCatBlue'), {
        stroke: cobaltStarBlue,
        strokeWidth: outlineMedium,
      }),
      svgEl('path', {
        d: 'M -12 -64 L 6 -82 M -8 -80 L 12 -64 M -14 -72 L 14 -72',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: cobaltStarBlue,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('circle', {
        cx: 0,
        cy: -105,
        r: 5,
        fill: catLightBlue,
        ...crayonStrokeAttrs({
          stroke: cobaltStarBlue,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('ellipse', {
        cx: -9,
        cy: -46,
        rx: 3.2,
        ry: 4.5,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('ellipse', {
        cx: 8,
        cy: -46,
        rx: 3.2,
        ry: 4.5,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineThin,
        }),
      }),
      svgEl('circle', { cx: -9, cy: -45, r: 1.4, fill: sunsetOrange }),
      svgEl('circle', { cx: 8, cy: -45, r: 1.4, fill: sunsetOrange }),
      svgEl('path', {
        d: 'M -12 -51 L -13 -54 M -9 -52 L -9 -55 M -6 -51 L -5 -54 M 5 -51 L 4 -54 M 8 -52 L 8 -55 M 11 -51 L 12 -54',
        fill: 'none',
        ...crayonStrokeAttrs({ stroke: sunsetOrange, strokeWidth: 1.3 }),
      }),
      svgEl('path', {
        d: 'M -12 -22 C -8 -35, 8 -35, 12 -22',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineMedium,
        }),
      }),
      crayonPath(
        `M 14 ${-43 + tearHop} C 17 ${-39 + tearHop}, 17 ${-35 + tearHop}, 14 ${-35 + tearHop} C 11 ${-35 + tearHop}, 11 ${-39 + tearHop}, 14 ${-43 + tearHop} Z`,
        catLightBlue,
        { stroke: cobaltStarBlue, strokeWidth: 1.2 }
      ),
      crayonPath(
        `M 16 ${-31 + tearHop} C 19 ${-27 + tearHop}, 19 ${-23 + tearHop}, 16 ${-23 + tearHop} C 13 ${-23 + tearHop}, 13 ${-27 + tearHop}, 16 ${-31 + tearHop} Z`,
        catLightBlue,
        { stroke: cobaltStarBlue, strokeWidth: 1.2 }
      ),
    ]
  );
}

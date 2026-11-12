import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders the Watermelon Slice Party Character (`'watermelon_slice'`) — Upper-left dancer:
 * Red-pink triangle slice, black seeds, white + emerald green bottom rind, and red pom-pom party hat.
 */
export function renderWatermelonSlice(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    charcoalOutline,
    dressPink,
    watermelonPink,
    emeraldFrond,
    radishRed,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const danceTilt = steppedOscillate(frameIndex, 6, 5) - 6;
  const armWave = steppedOscillate(frameIndex, 4, 16);
  const hopY = Math.abs(steppedOscillate(frameIndex, 4, 2.5));

  return svgEl(
    'g',
    {
      'data-character': 'watermelon_slice',
      'data-state': state,
      transform: svgTransform({
        y: -hopY,
        rotate: danceTilt,
        pivotX: 0,
        pivotY: -20,
      }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        'M -8 -142 L 36 -38 Q 2 -14, -34 -26 Z M -6 -24 L -12 0 M 6 -24 L 10 -2 M -24 -54 L -38 -66 M 22 -64 L 34 -82',
        12
      ),
      svgEl('path', {
        d: `M -6 -24 L -12 0 M 6 -24 L 10 -2 M -24 -54 L -38 ${-66 + armWave * 0.4} M 22 -64 L 34 ${-82 - armWave * 0.5}`,
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': 3.6,
        'stroke-linecap': 'round',
      }),
      crayonPath(
        'M -34 -26 Q 2 -14, 36 -38 L 32 -47 Q 1 -24, -30 -35 Z',
        getPatternFill('crayonEmeraldFrond'),
        { stroke: emeraldFrond, strokeWidth: outlineThin }
      ),
      crayonPath(
        'M -30 -35 Q 1 -24, 32 -47 L 29 -53 Q 0 -31, -28 -41 Z',
        cutoutHaloWhite,
        { stroke: cutoutHaloWhite, strokeWidth: 1.2 }
      ),
      crayonPath(
        'M -8 -110 L 30 -51 Q 0 -30, -29 -39 Z',
        getPatternFill('crayonWatermelonPink'),
        { stroke: watermelonPink, strokeWidth: outlineMedium, mask: fillMask }
      ),
      svgEl('circle', { cx: -9, cy: -70, r: 2.3, fill: charcoalOutline }),
      svgEl('circle', { cx: 4, cy: -74, r: 2.3, fill: charcoalOutline }),
      svgEl('path', {
        d: 'M -6 -64 Q -1 -56, 5 -66',
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
      }),
      svgEl('g', { fill: charcoalOutline }, [
        svgEl('ellipse', { cx: -18, cy: -52, rx: 1.5, ry: 2.6, transform: 'rotate(18, -18, -52)' }),
        svgEl('ellipse', { cx: -11, cy: -44, rx: 1.5, ry: 2.6, transform: 'rotate(8, -11, -44)' }),
        svgEl('ellipse', { cx: 2, cy: -47, rx: 1.5, ry: 2.6 }),
        svgEl('ellipse', { cx: 13, cy: -55, rx: 1.5, ry: 2.6, transform: 'rotate(-15, 13, -55)' }),
        svgEl('ellipse', { cx: 18, cy: -62, rx: 1.5, ry: 2.6, transform: 'rotate(-20, 18, -62)' }),
        svgEl('ellipse', { cx: -4, cy: -86, rx: 1.4, ry: 2.3 }),
      ]),
      crayonPath('M -17 -104 L -11 -136 L 1 -106 Z', dressPink, {
        stroke: radishRed,
        strokeWidth: 2.8,
      }),
      crayonPath(
        'M -19 -139 C -22 -145, -14 -150, -11 -145 C -7 -151, 1 -145, -3 -139 C 2 -134, -5 -128, -10 -132 C -16 -128, -23 -134, -19 -139 Z',
        radishRed,
        { stroke: radishRed, strokeWidth: 1.5 }
      ),
    ]
  );
}

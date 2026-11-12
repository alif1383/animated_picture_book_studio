import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';

/**
 * Renders a red crayon village bicycle (`'bicycle'`) with a wicker front basket.
 */
export function renderBicycle(): string {
  const { storeAwningRed } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-prop': 'bicycle',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Front & rear wheels
      svgEl('circle', {
        cx: -24,
        cy: -16,
        r: 15,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: 24,
        cy: -16,
        r: 15,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      // Red crayon bicycle frame
      svgEl('path', {
        d: 'M -24 -16 L -4 -16 L 12 -34 L -12 -34 Z M 24 -16 L 12 -34 L 8 -44 L 18 -46 M -12 -34 L -16 -42 L -6 -42',
        fill: 'none',
        stroke: storeAwningRed,
        'stroke-width': outlineHeavy,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
      // Front wicker basket
      crayonPath(
        'M 14 -42 L 28 -42 L 26 -28 L 16 -28 Z',
        getPatternFill('crayonOchre'),
        { strokeWidth: outlineThin }
      ),
    ]
  );
}

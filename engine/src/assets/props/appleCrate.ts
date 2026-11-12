import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a slatted wooden crate piled with red apples (`'apple_crate'`) outside the store.
 */
export function renderAppleCrate(options: PropRenderOptions): string {
  const { fillMask } = options;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-prop': 'apple_crate',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Apples piled in top of crate
      svgEl('circle', {
        cx: -14,
        cy: -28,
        r: 8,
        fill: getPatternFill('crayonAwningRed'),
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 0,
        cy: -31,
        r: 8.5,
        fill: getPatternFill('crayonTerracotta'),
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 14,
        cy: -28,
        r: 8,
        fill: getPatternFill('crayonAwningRed'),
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Slatted wooden crate body
      crayonPath(
        'M -24 -24 L 24 -24 L 22 0 L -22 0 Z',
        getPatternFill('crayonWoodBrown'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      svgEl('path', {
        d: 'M -23 -12 L 23 -12',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]
  );
}

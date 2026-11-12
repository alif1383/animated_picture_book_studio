import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a wrought-iron village street lantern (`'street_lantern'`) with optional warm crayon halo.
 */
export function renderStreetLantern(options: PropRenderOptions): string {
  const { lit = true } = options;
  const { paperWarm, warmMoon } = TOKENS.colors;
  const { outlineHeavy, outlineMedium } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-prop': 'street_lantern',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Warm crayon halo when lit
      lit
        ? svgEl('g', { 'data-part': 'lantern-halo' }, [
            svgEl('circle', {
              cx: 18,
              cy: -98,
              r: 24,
              fill: warmMoon,
              opacity: 0.35,
            }),
            svgEl('circle', {
              cx: 18,
              cy: -98,
              r: 30,
              fill: 'none',
              stroke: warmMoon,
              'stroke-width': 2,
              'stroke-dasharray': '4 6',
            }),
          ])
        : '',
      // Wrought-iron post & curved bracket arm
      svgEl('path', {
        d: 'M -8 0 L 8 0 M 0 0 L 0 -118 Q 0 -130, 18 -126 L 18 -114',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Hanging glass lantern housing
      crayonPath(
        'M 8 -114 L 28 -114 L 24 -86 L 12 -86 Z',
        lit ? getPatternFill('crayonWindowGlow') : paperWarm,
        { strokeWidth: outlineMedium }
      ),
    ]
  );
}

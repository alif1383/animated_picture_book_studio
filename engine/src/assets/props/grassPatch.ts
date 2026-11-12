import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { crayonPath, svgEl } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a green dry-crayon grass patch (`'grass_patch'`) with diagonal white paper-tooth streaks.
 */
export function renderGrassPatch(options: PropRenderOptions): string {
  const { fillMask } = options;
  const { paperWarm, grassGreen, treeGreen } = TOKENS.colors;
  const { outlineMedium } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-prop': 'grass_patch',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      crayonPath(
        'M -180 0 Q -120 -26, -40 -22 T 110 -24 Q 160 -20, 190 0 L 190 56 L -180 56 Z',
        getPatternFill('crayonGrassGreen'),
        {
          stroke: treeGreen,
          strokeWidth: outlineMedium,
          mask: fillMask,
        }
      ),
      // Diagonal raw paper-tooth streaks & dark green crayon strokes across the grass
      svgEl('path', {
        d: [
          'M -150 -8 L -110 48',
          'M -105 -14 L -62 48',
          'M -55 -16 L -14 48',
          'M -5 -16 L 36 48',
          'M 45 -16 L 86 48',
          'M 95 -14 L 136 48',
          'M 140 -10 L 176 46',
        ].join(' '),
        fill: 'none',
        stroke: paperWarm,
        'stroke-width': 2.6,
        'stroke-dasharray': '8 5 4 6',
        'stroke-linecap': 'round',
        opacity: 0.72,
      }),
      svgEl('path', {
        d: 'M -165 4 L 175 8 M -155 24 L 180 28 M -140 42 L 170 44',
        fill: 'none',
        stroke: grassGreen,
        'stroke-width': 3.2,
        'stroke-dasharray': '14 6 9 5',
        'stroke-linecap': 'round',
        opacity: 0.85,
      }),
    ]
  );
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders an organic puffy green crayon tree (`'tree'`) with a wooden trunk.
 */
export function renderTree(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const { paperWarm } = TOKENS.colors;
  const { outlineMedium } = TOKENS.strokes;
  const sway = steppedOscillate(frameIndex, 18, 1.8, variant);

  return svgEl(
    'g',
    {
      'data-prop': 'tree',
      transform: svgTransform({ rotate: sway }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Brown wooden trunk
      crayonPath(
        'M -12 0 L -9 -78 L 9 -78 L 12 0 Z',
        getPatternFill('crayonWoodBrown'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Organic puffy green crayon foliage crown (Ref Image 3)
      crayonPath(
        'M -48 -72 C -64 -98, -38 -136, 0 -132 C 38 -136, 64 -98, 48 -72 C 58 -52, 28 -44, 0 -48 C -28 -44, -58 -52, -48 -72 Z',
        getPatternFill('crayonTreeGreen'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Paper-tooth highlight curls inside foliage
      svgEl('path', {
        d: 'M -28 -96 Q -8 -112, 18 -98 M -22 -74 Q 4 -86, 26 -72',
        fill: 'none',
        stroke: paperWarm,
        'stroke-width': 2.2,
        'stroke-dasharray': '5 6 3 5',
        'stroke-linecap': 'round',
        opacity: 0.65,
      }),
    ]
  );
}

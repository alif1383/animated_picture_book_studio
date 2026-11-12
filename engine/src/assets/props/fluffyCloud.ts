import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedOscillate } from '../../engine/clock';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a puffy white paper-cutout sky cloud (`'fluffy_cloud'`).
 */
export function renderFluffyCloud(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const drift = steppedOscillate(frameIndex, 18, 4, variant * 3);

  return svgEl(
    'g',
    {
      'data-prop': 'fluffy_cloud',
      transform: svgTransform({ x: drift }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      crayonPath(
        'M -56 12 C -72 12, -76 -12, -54 -18 C -48 -38, -18 -44, 0 -30 C 18 -42, 48 -34, 52 -14 C 72 -12, 72 12, 50 12 Z',
        TOKENS.colors.cloudWhite,
        {
          stroke: TOKENS.colors.nightcapBlue,
          strokeWidth: 1.8,
          opacity: 0.96,
          mask: fillMask,
        }
      ),
    ]
  );
}

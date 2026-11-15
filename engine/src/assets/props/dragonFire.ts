import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';
import { renderStarShape } from './shared';

/**
 * Renders the Crayon Fire Breath & Clash Sparks (`'dragon_fire'`).
 * - Swirling red/orange/yellow wax-crayon flame cloud (`data-part="flame-plume"`)
 *   and golden star clash bursts (`data-part="clash-sparks"`) for the dragon battle.
 */
export function renderDragonFire(
  options: PropRenderOptions = { kind: 'dragon_fire' }
): string {
  const { frameIndex = 0, lit = true } = options;

  const {
    radishRed,
    sunsetOrange,
    bananaYellow,
    warmMoon,
    starWhite,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  if (!lit) {
    return svgEl('g', { 'data-prop': 'dragon_fire', 'data-lit': 'false' });
  }

  const pulse = round2(1 + steppedOscillate(frameIndex, 6, 0.12));
  const jitterY = round2(steppedOscillate(frameIndex, 6, 5));

  // 1. Swirling Wax-Crayon Flame Cloud (`data-part="flame-plume"`)
  const flamePlume = svgEl(
    'g',
    {
      'data-part': 'flame-plume',
      transform: svgTransform({ y: jitterY, scale: pulse }),
    },
    [
      // Outer red-orange dragon flame billow
      crayonPath(
        'M 54 -10 C 20 -42, -32 -52, -74 -28 C -56 -12, -88 8, -58 26 C -22 42, 24 28, 54 6 Z',
        radishRed,
        { strokeWidth: outlineHeavy, paperUnderlay: true }
      ),
      // Middle sunset-orange swirl
      crayonPath(
        'M 44 -6 C 16 -28, -22 -34, -52 -16 C -38 -4, -58 10, -38 20 C -14 28, 20 18, 44 4 Z',
        sunsetOrange,
        { strokeWidth: outlineMedium }
      ),
      // Inner golden-yellow hot core
      crayonPath(
        'M 34 -4 C 12 -16, -12 -20, -32 -8 C -20 2, -12 12, 34 2 Z',
        bananaYellow,
        { strokeWidth: outlineThin }
      ),
    ]
  );

  // 2. Action Star Clash Sparks (`data-part="clash-sparks"`)
  const clashSparks = svgEl('g', { 'data-part': 'clash-sparks' }, [
    crayonPath(
      renderStarShape(-76, round2(-26 + jitterY), 12, frameIndex * 18),
      bananaYellow,
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    crayonPath(
      renderStarShape(-52, round2(28 - jitterY), 10, -frameIndex * 15),
      warmMoon,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
    crayonPath(
      renderStarShape(-18, round2(-38 - jitterY * 0.6), 9, 12),
      starWhite,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dragon_fire',
      'data-lit': 'true',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [flamePlume, clashSparks]
  );
}

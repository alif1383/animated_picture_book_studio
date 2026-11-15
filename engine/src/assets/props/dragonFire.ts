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
 * Renders the Elevated Crayon Fire Breath & Tooth-Pop Sparks (`'dragon_fire'`).
 * - Swirling red/orange/yellow wax-crayon flame stream (`data-part="flame-plume"`)
 *   that arches upward-left (`y: -6 .. -64`) so Sir Leo on foot can duck safely
 *   underneath it and angle his spear upward into the Dragon's mouth!
 * - Golden star clash/tooth-pop bursts (`data-part="clash-sparks"`).
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
  const jitterY = round2(steppedOscillate(frameIndex, 6, 4.5));

  // 1. Elevated Swirling Wax-Crayon Flame Stream (`data-part="flame-plume"`)
  // Jets from right nozzle (56, -4) and billows UPWARD-LEFT to (-112, -62..-10),
  // leaving a tall clear ducking & spear-reach corridor underneath!
  const flamePlume = svgEl(
    'g',
    {
      'data-part': 'flame-plume',
      transform: svgTransform({ y: jitterY, scale: pulse }),
    },
    [
      // Outer red-orange overhead dragon flame billow
      crayonPath(
        'M 56 -6 C 28 -36, -28 -64, -96 -58 C -78 -38, -114 -22, -86 -10 C -46 -4, 14 -2, 56 2 Z',
        radishRed,
        { strokeWidth: outlineHeavy, paperUnderlay: true }
      ),
      // Middle sunset-orange swirl
      crayonPath(
        'M 48 -5 C 22 -28, -24 -48, -76 -44 C -60 -30, -88 -18, -64 -11 C -32 -6, 14 -3, 48 0 Z',
        sunsetOrange,
        { strokeWidth: outlineMedium }
      ),
      // Inner golden-yellow hot core
      crayonPath(
        'M 40 -4 C 16 -20, -18 -34, -52 -30 C -38 -18, -14 -8, 40 -1 Z',
        bananaYellow,
        { strokeWidth: outlineThin }
      ),
    ]
  );

  // 2. Action Star Clash & Tooth-Pop Sparks (`data-part="clash-sparks"`)
  const clashSparks = svgEl('g', { 'data-part': 'clash-sparks' }, [
    crayonPath(
      renderStarShape(-92, round2(-46 + jitterY), 12, frameIndex * 18),
      bananaYellow,
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    crayonPath(
      renderStarShape(-56, round2(-14 - jitterY), 10, -frameIndex * 15),
      warmMoon,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
    crayonPath(
      renderStarShape(38, round2(-24 - jitterY * 0.6), 9, 12),
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

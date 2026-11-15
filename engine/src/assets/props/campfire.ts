import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders the Cozy Woodland Campfire & Knight's Tent (`'campfire'`).
 * - Pitched striped crayon tent (`crayonOchre` / `crayonTerracotta`, `data-part="knight-tent"`).
 * - Crackling log campfire in front (`data-part="campfire-logs"`), and when `lit !== false`,
 *   flickering red/orange/yellow wax-crayon flames and warm glow (`data-part="campfire-flames"`).
 */
export function renderCampfire(options: PropRenderOptions = { kind: 'campfire' }): string {
  const { frameIndex = 0, lit = true, fillMask } = options;

  const {
    woodBrown,
    hairBrown,
    warmMoon,
    bananaYellow,
    sunsetOrange,
    radishRed,
    paperDeep,
    indigoNightDark,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const flameFlickerX = round2(steppedOscillate(frameIndex, 6, 4.5));
  const flameFlickerY = round2(steppedOscillate(frameIndex, 8, 5.5, 2));

  // 1. Striped Medieval Knight's Tent in Background-Left (`data-part="knight-tent"`)
  const tent = svgEl('g', { 'data-part': 'knight-tent' }, [
    // Main pitched tent canopy
    crayonPath(
      'M -150 0 L -85 -112 L -20 0 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Terracotta decorative stripe panels
    crayonPath(
      'M -126 0 L -85 -112 L -104 0 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M -66 0 L -85 -112 L -44 0 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineMedium }
    ),
    // Dark cozy tent entrance flap
    crayonPath(
      'M -100 0 L -85 -58 L -70 0 Z',
      indigoNightDark,
      { strokeWidth: outlineMedium }
    ),
    // Little golden pennant at tent peak
    crayonPath('M -85 -112 L -85 -130 L -60 -121 L -85 -114 Z', warmMoon, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 2. Campfire Ring Stones & Crossed Logs (`data-part="campfire-logs"`)
  const logs = svgEl('g', { 'data-part': 'campfire-logs' }, [
    // Ring of river stones
    crayonPath('M -28 4 C -30 -6, -14 -6, -14 4 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M 14 4 C 14 -6, 30 -6, 28 4 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
    // Crossed wooden logs
    crayonPath('M -26 2 L 22 -14 L 26 -6 L -22 8 Z', woodBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M 26 2 L -22 -14 L -26 -6 L 22 8 Z', hairBrown, {
      strokeWidth: outlineMedium,
    }),
    crayonPath('M -12 6 C -14 -4, 14 -4, 12 6 Z', paperDeep, {
      strokeWidth: outlineMedium,
    }),
  ]);

  // 3. Flickering Crayon Flames & Warm Halo (`data-part="campfire-flames"`)
  const flames = lit
    ? svgEl('g', { 'data-part': 'campfire-flames' }, [
        // Warm dashed golden glow halo
        svgEl('circle', {
          cx: 0,
          cy: -24,
          r: 44,
          fill: warmMoon,
          opacity: 0.22,
        }),
        svgEl('circle', {
          cx: 0,
          cy: -24,
          r: 48,
          fill: 'none',
          stroke: warmMoon,
          'stroke-width': 2,
          'stroke-dasharray': '6 5',
          opacity: 0.65,
        }),
        // Outer red-orange flame tongue
        crayonPath(
          `M -18 -6 C -26 -28, ${-10 + flameFlickerX} -54, ${flameFlickerX} ${-64 + flameFlickerY} C ${12 + flameFlickerX} -50, 26 -28, 18 -6 Z`,
          radishRed,
          { strokeWidth: outlineMedium }
        ),
        // Middle sunset-orange flame tongue
        crayonPath(
          `M -12 -6 C -16 -22, ${-6 - flameFlickerX * 0.6} -42, ${-flameFlickerX * 0.5} ${-48 + flameFlickerY * 0.7} C ${8 - flameFlickerX * 0.5} -38, 16 -22, 12 -6 Z`,
          sunsetOrange,
          { strokeWidth: outlineThin }
        ),
        // Inner bright yellow flame core
        crayonPath(
          `M -6 -6 C -8 -16, -3 -28, ${flameFlickerX * 0.4} -32 C 4 -26, 8 -16, 6 -6 Z`,
          bananaYellow,
          { strokeWidth: outlineThin }
        ),
        // Floating warm sparks
        svgEl('circle', {
          cx: round2(-8 + flameFlickerX),
          cy: round2(-72 + flameFlickerY),
          r: 2.5,
          fill: bananaYellow,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        svgEl('circle', {
          cx: round2(10 - flameFlickerX),
          cy: round2(-78 - flameFlickerY * 0.5),
          r: 2,
          fill: sunsetOrange,
        }),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'campfire',
      'data-lit': String(lit),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [tent, logs, flames]
  );
}

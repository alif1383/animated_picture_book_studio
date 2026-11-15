import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';
import { renderStarShape } from '../props/shared';

/**
 * Renders the Royal Crayon Stone Castle (`'royal_castle'`).
 * - Warm stone keep (`paperDeep` / `crayonOchre`) and twin crenellated towers (`data-part="castle-towers"`)
 *   with conical blue/terracotta roofs (`crayonRoyalBlue` / `crayonTerracotta`).
 * - Fluttering golden star flags (`data-part="castle-flags"`), arched wooden portcullis gate (`data-part="castle-gate"`),
 *   warm glowing windows (`windowLit`), and festive bunting banners across the towers (`data-part="castle-banners"`).
 */
export function renderRoyalCastle(options: BuildingRenderOptions): string {
  const { windowLit = true, fillMask } = options;

  const {
    paperWarm,
    paperDeep,
    woodBrown,
    warmMoon,
    bananaYellow,
    radishRed,
    skyPastelBlue,
    indigoNightDark,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const windowFill = windowLit
    ? getPatternFill('crayonWindowGlow')
    : indigoNightDark;

  // 1. Twin Flanking Crenellated Towers & Conical Roofs (`data-part="castle-towers"`)
  const towers = svgEl('g', { 'data-part': 'castle-towers' }, [
    // Left tower shaft
    crayonPath('M -170 -210 L -102 -210 L -98 0 L -174 0 Z', paperDeep, {
      strokeWidth: outlineHeavy,
      mask: fillMask,
      paperUnderlay: true,
    }),
    // Right tower shaft
    crayonPath('M 102 -210 L 170 -210 L 174 0 L 98 0 Z', paperDeep, {
      strokeWidth: outlineHeavy,
      mask: fillMask,
      paperUnderlay: true,
    }),
    // Left conical turret roof
    crayonPath(
      'M -182 -210 L -136 -295 L -90 -210 Z',
      getPatternFill('crayonRoyalBlue'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Right conical turret roof
    crayonPath(
      'M 90 -210 L 136 -295 L 182 -210 Z',
      getPatternFill('crayonRoyalBlue'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Tower arched windows
    crayonPath(
      'M -148 -145 C -148 -162, -124 -162, -124 -145 L -124 -118 L -148 -118 Z',
      windowFill,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M 124 -145 C 124 -162, 148 -162, 148 -145 L 148 -118 L 124 -118 Z',
      windowFill,
      { strokeWidth: outlineMedium }
    ),
  ]);

  // 2. Central Stone Keep & Battlements (`data-part="castle-keep"`)
  const keep = svgEl('g', { 'data-part': 'castle-keep' }, [
    // Main central keep wall with crenellations along the top
    crayonPath(
      [
        'M -104 -180',
        'L -104 -202 L -82 -202 L -82 -184',
        'L -58 -184 L -58 -202 L -34 -202 L -34 -184',
        'L -12 -184 L -12 -202 L 12 -202 L 12 -184',
        'L 34 -184 L 34 -202 L 58 -202 L 58 -184',
        'L 82 -184 L 82 -202 L 104 -202 L 104 -180',
        'L 104 0 L -104 0 Z',
      ].join(' '),
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Upper central keep roof peak
    crayonPath(
      'M -68 -202 L 0 -268 L 68 -202 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Decorative stone masonry blocks
    svgEl('path', {
      d: 'M -92 -140 L -52 -140 M 52 -140 L 92 -140 M -158 -85 L -116 -85 M 116 -85 L 158 -85',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.55 }),
    }),
    // Keep arched windows
    crayonPath(
      'M -72 -136 C -72 -156, -42 -156, -42 -136 L -42 -102 L -72 -102 Z',
      windowFill,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M 42 -136 C 42 -156, 72 -156, 72 -136 L 72 -102 L 42 -102 Z',
      windowFill,
      { strokeWidth: outlineMedium }
    ),
    // Golden royal crest above gate
    crayonPath(renderStarShape(0, -142, 16, 0), warmMoon, {
      strokeWidth: outlineMedium,
    }),
  ]);

  // 3. Arched Wooden Portcullis Gate (`data-part="castle-gate"`)
  const gate = svgEl('g', { 'data-part': 'castle-gate' }, [
    // Stone arch surround
    crayonPath(
      'M -46 0 L -46 -64 C -46 -104, 46 -104, 46 -64 L 46 0 Z',
      paperWarm,
      { strokeWidth: outlineHeavy }
    ),
    // Wooden double doors
    crayonPath(
      'M -36 0 L -36 -58 C -36 -90, 36 -90, 36 -58 L 36 0 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy }
    ),
    // Portcullis iron lattice bars
    svgEl('path', {
      d: 'M 0 -82 L 0 0 M -18 -76 L -18 0 M 18 -76 L 18 0 M -34 -50 L 34 -50 M -36 -26 L 36 -26',
      fill: 'none',
      stroke: charcoalOutline,
      'stroke-width': 2.2,
    }),
  ]);

  // 4. Fluttering Golden Star Flags on the 3 Peaks (`data-part="castle-flags"`)
  const flags = svgEl('g', { 'data-part': 'castle-flags' }, [
    // Left turret flag
    svgEl('line', {
      x1: -136,
      y1: -295,
      x2: -136,
      y2: -328,
      stroke: woodBrown,
      'stroke-width': 3,
    }),
    crayonPath('M -136 -326 L -96 -316 L -136 -306 Z', radishRed, {
      strokeWidth: outlineThin,
    }),
    // Center keep flag
    svgEl('line', {
      x1: 0,
      y1: -268,
      x2: 0,
      y2: -306,
      stroke: woodBrown,
      'stroke-width': 3.2,
    }),
    crayonPath('M 0 -304 L 46 -292 L 0 -280 Z', bananaYellow, {
      strokeWidth: outlineThin,
    }),
    // Right turret flag
    svgEl('line', {
      x1: 136,
      y1: -295,
      x2: 136,
      y2: -328,
      stroke: woodBrown,
      'stroke-width': 3,
    }),
    crayonPath('M 136 -326 L 176 -316 L 136 -306 Z', radishRed, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 5. Festive Bunting Banners Strung Between Towers (`data-part="castle-banners"`)
  const banners = svgEl('g', { 'data-part': 'castle-banners' }, [
    svgEl('path', {
      d: 'M -136 -175 Q 0 -145, 136 -175',
      fill: 'none',
      stroke: charcoalOutline,
      'stroke-width': 1.8,
    }),
    crayonPath('M -96 -166 L -84 -150 L -72 -164 Z', radishRed, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M -52 -160 L -40 -144 L -28 -158 Z', bananaYellow, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M -12 -157 L 0 -141 L 12 -157 Z', skyPastelBlue, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M 28 -158 L 40 -144 L 52 -160 Z', bananaYellow, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M 72 -164 L 84 -150 L 96 -166 Z', radishRed, {
      strokeWidth: outlineThin,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-building': 'royal_castle',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [towers, keep, gate, flags, banners]
  );
}

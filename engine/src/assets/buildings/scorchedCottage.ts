import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';

/**
 * Renders the Scorched / Damaged Village Cottage (`'scorched_cottage'`) after the Dragon's visit.
 * - Crooked terracotta roof tiles (`crayonTerracotta`), charcoal soot smudges on the walls and gable (`data-part="soot-marks"`),
 *   a tilted shutter (`data-part="tilted-shutter"`), singed flower box, and curling crayon smoke wisps (`data-part="roof-smoke"`).
 */
export function renderScorchedCottage(options: BuildingRenderOptions): string {
  const { windowLit = false, fillMask } = options;

  const {
    paperDeep,
    woodBrown,
    terracottaDark,
    indigoNightDark,
    charcoalOutline,
    faintPencil,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const windowFill = windowLit
    ? getPatternFill('crayonWindowGlow')
    : indigoNightDark;

  // 1. Cottage Body Wall
  const wall = crayonPath(
    'M -125 -140 L 125 -140 L 130 0 L -130 0 Z',
    getPatternFill('crayonOchre'),
    { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
  );

  // 2. Crooked Scorched Terracotta Roof & Cracked Chimney
  const roof = svgEl('g', { 'data-part': 'scorched-roof' }, [
    // Tilted chimney with a chipped corner
    crayonPath(
      'M 48 -205 L 82 -212 L 86 -150 L 52 -150 Z',
      terracottaDark,
      { strokeWidth: outlineHeavy }
    ),
    // Steep gabled roof with a singed bite-mark notch on the right slope
    crayonPath(
      'M -148 -136 L -4 -226 L 68 -182 L 84 -162 L 104 -168 L 148 -134 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Crooked displaced roof tiles
    svgEl('path', {
      d: 'M -95 -162 Q -70 -148, -45 -164 M -20 -185 Q 10 -170, 35 -184 M -115 -144 Q -80 -130, -48 -144',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
  ]);

  // 3. Charcoal Soot Smudges (`data-part="soot-marks"`)
  const sootMarks = svgEl('g', { 'data-part': 'soot-marks' }, [
    svgEl('ellipse', {
      cx: 65,
      cy: -162,
      rx: 28,
      ry: 14,
      fill: charcoalOutline,
      opacity: 0.38,
    }),
    svgEl('ellipse', {
      cx: -55,
      cy: -98,
      rx: 22,
      ry: 12,
      fill: charcoalOutline,
      opacity: 0.32,
    }),
    svgEl('ellipse', {
      cx: 72,
      cy: -54,
      rx: 18,
      ry: 10,
      fill: charcoalOutline,
      opacity: 0.28,
    }),
    // Scorched diagonal hatching lines
    svgEl('path', {
      d: 'M 48 -172 L 78 -152 M 56 -175 L 84 -156 M -72 -106 L -42 -90',
      stroke: charcoalOutline,
      'stroke-width': 2,
      opacity: 0.6,
    }),
  ]);

  // 4. Arched Wooden Door & Tilted Window Shutter (`data-part="tilted-shutter"`)
  const doorAndWindows = svgEl('g', { 'data-part': 'cottage-front' }, [
    // Arched wooden front door
    crayonPath(
      'M -24 0 L -24 -64 C -24 -86, 24 -86, 24 -64 L 24 0 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy }
    ),
    // Left window
    crayonPath('M -88 -88 L -48 -88 L -48 -46 L -88 -46 Z', windowFill, {
      strokeWidth: outlineMedium,
    }),
    // Right window with a crooked hanging shutter (`data-part="tilted-shutter"`)
    crayonPath('M 48 -88 L 88 -88 L 88 -46 L 48 -46 Z', windowFill, {
      strokeWidth: outlineMedium,
    }),
    svgEl(
      'g',
      {
        'data-part': 'tilted-shutter',
        transform: svgTransform({ x: 90, y: -86, rotate: 22 }),
      },
      [
        crayonPath(
          'M 0 0 L 18 0 L 18 42 L 0 42 Z',
          getPatternFill('crayonStoreTeal'),
          { strokeWidth: outlineMedium }
        ),
      ]
    ),
    // Singed wooden flower box under left window
    crayonPath('M -92 -46 L -44 -46 L -48 -34 L -88 -34 Z', woodBrown, {
      strokeWidth: outlineMedium,
    }),
  ]);

  // 5. Curling Crayon Smoke Wisps Rising from the Scorched Roof (`data-part="roof-smoke"`)
  const roofSmoke = svgEl('g', { 'data-part': 'roof-smoke' }, [
    crayonPath(
      'M 68 -188 C 58 -208, 82 -224, 70 -244 C 84 -232, 92 -212, 78 -188 Z',
      paperDeep,
      { strokeWidth: outlineThin }
    ),
    svgEl('path', {
      d: 'M -36 -212 C -46 -232, -26 -248, -38 -266 M 18 -204 C 10 -224, 28 -238, 18 -256',
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': 2.2,
      'stroke-dasharray': '5 4',
      'stroke-linecap': 'round',
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-building': 'scorched_cottage',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [wall, roof, sootMarks, doorAndWindows, roofSmoke]
  );
}

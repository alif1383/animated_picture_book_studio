import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';

/**
 * Renders the cozy Village Cat (`'cat'`) character rig.
 */
export function renderCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const { charcoalOutline } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const tailSway = steppedOscillate(frameIndex, 8, 12);

  if (state === 'sleeping') {
    return svgEl(
      'g',
      {
        'data-character': 'cat',
        'data-state': 'sleeping',
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        crayonPath(
          'M -16 0 C -18 -14, 18 -14, 16 0 Z',
          getPatternFill('crayonTerracotta'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        svgEl('path', {
          d: 'M -8 -5 Q -5 -3, -2 -5 M 2 -5 Q 5 -3, 8 -5',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
      ]
    );
  }

  return svgEl(
    'g',
    {
      'data-character': 'cat',
      'data-state': state,
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Swaying tail
      svgEl(
        'path',
        {
          d: `M -10 -4 Q ${-22 + tailSway * 0.5} -18, ${-16 + tailSway} -28`,
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }
      ),
      // Seated body
      crayonPath(
        'M -11 0 C -13 -18, 11 -18, 11 0 Z',
        getPatternFill('crayonTerracotta'),
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Head with pointed ears
      crayonPath(
        'M -9 -18 L -11 -29 L -4 -24 L 4 -24 L 11 -29 L 9 -18 C 9 -10, -9 -10, -9 -18 Z',
        getPatternFill('crayonTerracotta'),
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -3.5, cy: -18, r: 1.4, fill: charcoalOutline }),
      svgEl('circle', { cx: 3.5, cy: -18, r: 1.4, fill: charcoalOutline }),
    ]
  );
}

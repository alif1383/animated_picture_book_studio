import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../engine/clock';
import {
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders stepped musical notes (`'music_notes'`, ♪ ♫) rising in discrete stop-motion hops.
 */
export function renderMusicNotes(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const { charcoalOutline } = TOKENS.colors;
  const { outlineMedium } = TOKENS.strokes;

  const activeCount = Math.max(0, count ?? 3);
  const notesMarkup: string[] = [];

  for (let i = 0; i < activeCount; i++) {
    const hop = steppedLoopProgress(frameIndex, 12, i * 3);
    const nx = round2(i * 18 + hop * 14 + deterministicJitter(i, variant, 4));
    const ny = round2(-i * 34 - hop * 22);
    const tilt = steppedOscillate(frameIndex, 6, 7, i * 2);

    if (i % 2 === 0) {
      // Single eighth note (♪)
      notesMarkup.push(
        svgEl(
          'g',
          {
            transform: svgTransform({ x: nx, y: ny, rotate: tilt }),
          },
          [
            svgEl('ellipse', {
              cx: 0,
              cy: 0,
              rx: 5.5,
              ry: 4.2,
              fill: charcoalOutline,
              transform: 'rotate(-20)',
            }),
            svgEl('path', {
              d: 'M 4.5 -1 L 4.5 -22 Q 12 -18, 13 -10',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
          ]
        )
      );
    } else {
      // Beamed double eighth note (♫) as in Ref Image 2!
      notesMarkup.push(
        svgEl(
          'g',
          {
            transform: svgTransform({ x: nx, y: ny, rotate: tilt }),
          },
          [
            svgEl('ellipse', {
              cx: -6,
              cy: 2,
              rx: 5.2,
              ry: 4,
              fill: charcoalOutline,
              transform: 'rotate(-18 -6 2)',
            }),
            svgEl('ellipse', {
              cx: 9,
              cy: -1,
              rx: 5.2,
              ry: 4,
              fill: charcoalOutline,
              transform: 'rotate(-18 9 -1)',
            }),
            svgEl('path', {
              d: 'M -1.5 1 L -1.5 -20 L 13.5 -23 L 13.5 -2 M -1.5 -15 L 13.5 -18',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
          ]
        )
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'music_notes',
      filter: svgUrl(TOKENS.filters.ids.crayonOutline),
    },
    notesMarkup
  );
}

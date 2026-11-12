import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedLoopProgress } from '../../engine/clock';
import { crayonPath, round2, svgEl } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders stepped stop-motion chimney smoke puffs (`'chimney_puffs'`).
 */
export function renderChimneyPuffs(options: PropRenderOptions): string {
  const { frameIndex = 0, count } = options;
  const { faintPencil, paperWarm } = TOKENS.colors;
  const { annotationPencil } = TOKENS.strokes;

  const puffCount = Math.max(0, count ?? 3);
  const puffs: string[] = [];
  for (let i = 0; i < puffCount; i++) {
    const hop = steppedLoopProgress(frameIndex, 10, i * 3);
    const px = round2(-i * 12 - hop * 10);
    const py = round2(-i * 22 - hop * 16);
    const r = round2(7 + i * 3.5);
    puffs.push(
      crayonPath(
        `M ${px - r} ${py} C ${px - r} ${py - r}, ${px + r} ${py - r}, ${px + r} ${py} C ${px + r} ${py + r * 0.8}, ${px - r} ${py + r * 0.8}, ${px - r} ${py} Z`,
        paperWarm,
        {
          stroke: faintPencil,
          strokeWidth: annotationPencil,
          opacity: round2(0.82 - i * 0.18),
        }
      )
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'chimney_puffs',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    puffs
  );
}

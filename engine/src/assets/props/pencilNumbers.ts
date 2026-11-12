import { TOKENS, svgUrl } from '../../theme/tokens';
import { svgEl } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders faint hand-drawn charcoal pencil numbers `"1  2  3  4  5"` (`'pencil_numbers'`)
 * counting stars in the sky (Ref Images 1 & 2).
 */
export function renderPencilNumbers(options: PropRenderOptions): string {
  const { count } = options;
  const { charcoalOutline } = TOKENS.colors;

  const maxNum = Math.max(0, Math.min(5, count ?? 5));
  const nums: string[] = [];
  const offsets = [
    { num: '1', dx: 0, dy: 0, rot: -4 },
    { num: '2', dx: 38, dy: 8, rot: 3 },
    { num: '3', dx: 76, dy: 4, rot: -2 },
    { num: '4', dx: 116, dy: 11, rot: 5 },
    { num: '5', dx: 154, dy: 6, rot: -3 },
  ];

  for (let i = 0; i < maxNum; i++) {
    const item = offsets[i];
    nums.push(
      svgEl(
        'text',
        {
          x: item.dx,
          y: item.dy,
          transform: `rotate(${item.rot}, ${item.dx}, ${item.dy})`,
          'font-family': TOKENS.typography.fontFamilyHand,
          'font-size': 28,
          'font-weight': 'bold',
          fill: charcoalOutline,
          opacity: 0.68,
        },
        item.num
      )
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'pencil_numbers',
      filter: svgUrl(TOKENS.filters.ids.crayonOutline),
    },
    nums
  );
}

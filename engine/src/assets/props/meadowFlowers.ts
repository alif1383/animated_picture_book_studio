import { TOKENS, svgUrl } from '../../theme/tokens';
import { crayonPath, svgEl } from '../../engine/svgUtils';

/**
 * Renders scattered white 5-petal daisies with yellow centers + V-shaped green grass tufts (`'meadow_flowers'`).
 */
export function renderMeadowFlowers(): string {
  const tufts = [
    [-580, 55], [-515, 115], [-465, 165], [-420, 40], [-360, 15],
    [-310, 85], [-260, 130], [-220, 50], [-180, 165], [-140, 120],
    [-90, 175], [-20, 150], [45, 160], [120, 170], [210, 165],
    [275, 115], [340, 155], [395, 95], [435, 150], [-390, 155],
    [-320, 170], [85, 120], [320, 60], [485, 110], [535, 160], [585, 75],
  ];
  const daisies = [
    [-540, 95], [-455, 76], [-115, 78], [-82, 118], [52, 68],
    [68, 108], [155, 86], [198, 62], [230, 96], [335, 112],
    [380, 74], [412, 122], [495, 88], [560, 132],
  ];
  const parts: string[] = [];

  for (const [tx, ty] of tufts) {
    parts.push(
      svgEl('path', {
        d: `M ${tx - 5} ${ty - 10} L ${tx} ${ty} L ${tx + 5} ${ty - 10} M ${tx - 1} ${ty - 12} L ${tx} ${ty}`,
        fill: 'none',
        stroke: TOKENS.colors.treeGreen,
        'stroke-width': 2.0,
        'stroke-linecap': 'round',
      })
    );
  }

  for (const [dx, dy] of daisies) {
    parts.push(
      svgEl('g', { transform: `translate(${dx}, ${dy})` }, [
        crayonPath(
          'M 0 -7 C 4 -9, 7 -5, 5 -1 C 9 1, 7 6, 3 5 C 2 9, -2 9, -3 5 C -7 6, -9 1, -5 -1 C -7 -5, -4 -9, 0 -7 Z',
          TOKENS.colors.cloudWhite,
          { stroke: TOKENS.colors.paperShadow, strokeWidth: 1.1 }
        ),
        svgEl('circle', {
          cx: 0,
          cy: 0,
          r: 2.5,
          fill: TOKENS.colors.bananaYellow,
        }),
      ])
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'meadow_flowers',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    parts
  );
}

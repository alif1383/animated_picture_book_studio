import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { crayonPath, svgEl } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders the 2-Tier Strawberry Birthday Cake (`'birthday_cake'`) with 3 flickering
 * candles (`lit: true`) or rising smoke curls (`lit: false`).
 */
export function renderBirthdayCake(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true } = options;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const isLit = lit !== false;
  const parts: string[] = [];

  // White paper cutout sticker halo around the cake & candles
  parts.push(
    svgEl('path', {
      d: 'M -64 4 Q -68 -24, -46 -32 Q -38 -56, -24 -84 L 24 -84 Q 38 -56, 46 -32 Q 68 -24, 64 4 Z',
      fill: TOKENS.colors.cutoutHaloWhite,
      stroke: TOKENS.colors.cutoutHaloWhite,
      'stroke-width': 12,
      'stroke-linejoin': 'round',
    })
  );

  // Cake platter / plate
  parts.push(
    crayonPath(
      'M -64 0 C -40 8, 40 8, 64 0 C 56 -6, -56 -6, -64 0 Z',
      TOKENS.colors.skyPastelBlue,
      { strokeWidth: outlineMedium }
    )
  );

  // Bottom tier (warm vanilla sponge + strawberry pink frosting)
  parts.push(
    crayonPath(
      'M -48 -2 L -46 -30 C -20 -34, 20 -34, 46 -30 L 48 -2 C 20 3, -20 3, -48 -2 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium }
    )
  );
  parts.push(
    crayonPath(
      'M -48 -26 C -36 -16, -24 -32, -12 -20 C 0 -32, 12 -16, 24 -28 C 36 -16, 44 -28, 48 -24 L 46 -31 C 20 -35, -20 -35, -46 -31 Z',
      TOKENS.colors.cherryRose,
      { strokeWidth: outlineThin }
    )
  );

  // Top tier
  parts.push(
    crayonPath(
      'M -34 -30 L -32 -54 C -14 -58, 14 -58, 32 -54 L 34 -30 C 14 -27, -14 -27, -34 -30 Z',
      TOKENS.colors.cloudWhite,
      { strokeWidth: outlineMedium }
    )
  );
  parts.push(
    crayonPath(
      'M -34 -50 C -22 -40, -11 -54, 0 -42 C 11 -54, 22 -40, 34 -50 L 32 -55 C 14 -59, -14 -59, -32 -55 Z',
      TOKENS.colors.radishRed,
      { strokeWidth: outlineThin }
    )
  );

  // Decorative mini strawberries on the cake
  for (const sx of [-22, 0, 22]) {
    parts.push(
      crayonPath(
        `M ${sx} -59 C ${sx - 5} -59, ${sx - 6} -52, ${sx} -49 C ${sx + 6} -52, ${sx + 5} -59, ${sx} -59 Z`,
        TOKENS.colors.radishRed,
        { strokeWidth: 1.2 }
      )
    );
  }

  // Three birthday candles
  const candleXs = [-16, 0, 16];
  candleXs.forEach((cx, idx) => {
    const stripeColor =
      idx % 2 === 0 ? TOKENS.colors.catLightBlue : TOKENS.colors.cherryRose;
    parts.push(
      crayonPath(
        `M ${cx - 3.5} -55 L ${cx - 3} -76 L ${cx + 3} -76 L ${cx + 3.5} -55 Z`,
        TOKENS.colors.cloudWhite,
        { strokeWidth: 1.4 }
      ),
      svgEl('path', {
        d: `M ${cx - 3} -61 L ${cx + 3} -65 M ${cx - 3} -68 L ${cx + 3} -72`,
        stroke: stripeColor,
        'stroke-width': 2,
        'stroke-linecap': 'round',
      }),
      svgEl('line', {
        x1: cx,
        y1: -76,
        x2: cx,
        y2: -80,
        stroke: TOKENS.colors.charcoalOutline,
        'stroke-width': 1.5,
      })
    );

    if (isLit) {
      const sway = (((frameIndex + idx) % 3) - 1) * 1.8;
      parts.push(
        svgEl(
          'g',
          { 'data-part': 'candle-flame' },
          [
            crayonPath(
              `M ${cx} -80 C ${cx - 6} -85, ${cx - 4 + sway} -94, ${cx + sway} -97 C ${cx + 4 + sway} -94, ${cx + 6} -85, ${cx} -80 Z`,
              TOKENS.colors.bananaYellow,
              {
                stroke: TOKENS.colors.sunsetOrange,
                strokeWidth: 1.4,
              }
            ),
            svgEl('circle', {
              cx: cx + sway * 0.4,
              cy: -85,
              r: 2.2,
              fill: TOKENS.colors.sunsetOrange,
            }),
          ]
        )
      );
    } else {
      // Gently rising smoke curl after candles are blown out!
      const drift = ((frameIndex + idx) % 4) * 2.2;
      parts.push(
        svgEl('path', {
          'data-part': 'candle-smoke',
          d: `M ${cx} -81 Q ${cx - 5 - drift * 0.4} ${-89 - drift}, ${cx + 3} ${-96 - drift} Q ${cx + 8 + drift * 0.4} ${-103 - drift}, ${cx - 2} ${-110 - drift}`,
          fill: 'none',
          stroke: TOKENS.colors.paperShadow,
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-dasharray': '3 3',
        })
      );
    }
  });

  return svgEl(
    'g',
    {
      'data-prop': 'birthday_cake',
      'data-lit': String(isLit),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    parts
  );
}

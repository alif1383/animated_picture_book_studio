import { TOKENS, svgUrl } from '../../theme/tokens';
import { deterministicJitter, svgEl } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';
import { renderStarShape } from './shared';

/**
 * Renders stepped stop-motion falling birthday confetti & ribbon streamers (`'party_confetti'`).
 */
export function renderPartyConfetti(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const { charcoalOutline } = TOKENS.colors;

  const pieceCount = Math.max(6, Math.min(48, Math.round(count ?? 22)));
  const palette = [
    TOKENS.colors.radishRed,
    TOKENS.colors.bananaYellow,
    TOKENS.colors.catLightBlue,
    TOKENS.colors.cherryRose,
    TOKENS.colors.emeraldFrond,
    TOKENS.colors.sunsetOrange,
  ];
  const pieces: string[] = [];

  for (let i = 0; i < pieceCount; i++) {
    const px = Math.round(
      (((i * 131 + variant * 43) % 1180) - 590) +
        deterministicJitter(i, variant, 12)
    );
    const fallOffset = ((frameIndex * 14 + i * 23) % 260) - 110;
    const py = Math.round(((i * 73 + variant * 19) % 220) + fallOffset);
    const rot = ((frameIndex * 25 + i * 47) % 360) - 180;
    const color = palette[i % palette.length];

    if (i % 3 === 0) {
      // Crayon ribbon streamer
      pieces.push(
        svgEl('path', {
          d: `M ${px} ${py} Q ${px + 8} ${py + 8}, ${px - 4} ${py + 16} Q ${px - 12} ${py + 24}, ${px + 4} ${py + 30}`,
          fill: 'none',
          stroke: color,
          'stroke-width': 4,
          'stroke-linecap': 'round',
        })
      );
    } else if (i % 3 === 1) {
      // Star confetti
      pieces.push(
        svgEl('path', {
          d: renderStarShape(px, py, 8, rot),
          fill: color,
          stroke: charcoalOutline,
          'stroke-width': 1.1,
          'stroke-linejoin': 'round',
        })
      );
    } else {
      // Tilted paper diamond confetti
      pieces.push(
        svgEl('rect', {
          x: px - 5,
          y: py - 4,
          width: 10,
          height: 8,
          rx: 1.5,
          fill: color,
          stroke: charcoalOutline,
          'stroke-width': 1.1,
          transform: `rotate(${rot} ${px} ${py})`,
        })
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'party_confetti',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    pieces
  );
}

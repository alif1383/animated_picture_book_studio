import { TOKENS, svgUrl } from '../../theme/tokens';
import {
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';
import { renderStarShape } from './shared';

/**
 * Renders hand-drawn 5-point white crayon stars + tiny white dots (`'star_cluster'`)
 * scattered across the indigo night sky.
 */
export function renderStarCluster(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const { charcoalOutline, paperWarm, starWhite } = TOKENS.colors;

  const starCount = Math.max(0, count ?? 24);
  const starElements: string[] = [];

  for (let i = 0; i < starCount; i++) {
    // Deterministic spread across a 1200x360 16:9 sky region
    const sx = round2(
      ((i * 137 + variant * 53) % 1200) +
        deterministicJitter(i, variant, 14)
    );
    const sy = round2(
      ((i * 89 + variant * 29) % 310) +
        deterministicJitter(i + 19, variant, 10)
    );
    const twinkle = (frameIndex + i) % 6 === 0 ? 1.18 : 1.0;

    if (i % 3 === 2) {
      // Small white pastel dot star
      starElements.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r: round2(3.2 * twinkle),
          fill: starWhite,
        })
      );
    } else {
      // Hand-drawn 5-point white crayon star with tiny face/dot detail on hero stars
      const r = (i % 5 === 0 ? 11.5 : 8.5) * twinkle;
      const rot = deterministicJitter(i, variant, 25);
      starElements.push(
        svgEl('g', {}, [
          svgEl('path', {
            d: renderStarShape(sx, sy, r, rot),
            fill: starWhite,
            stroke: paperWarm,
            'stroke-width': 1.2,
            'stroke-linejoin': 'round',
          }),
          i % 7 === 0
            ? svgEl('circle', {
                cx: sx - 1.5,
                cy: sy - 0.5,
                r: 0.9,
                fill: charcoalOutline,
              })
            : '',
        ])
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'star_cluster',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    starElements
  );
}

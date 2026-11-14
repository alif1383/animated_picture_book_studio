import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Stepped 6 FPS animated scalloped crayon wave crests and frothy white shoreline sea-foam (`'ocean_waves'`).
 * - `variant = 0`: Shoreline diagonal sea-foam ribbon curving along the sandy beach edge.
 * - `variant >= 1` (default): Open-water horizontal scalloped crayon wave crests & foam curls.
 */
export function renderOceanWaves(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const {
    cloudWhite,
    skyPastelLight,
    catLightBlue,
    cobaltStarBlue,
    nightcapWhite,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  if (variant === 0) {
    // Shoreline frothy sea-foam edge washing gently in & out at 6 FPS
    const tideSlide = steppedOscillate(frameIndex, 12, 9, 0);
    const tideLift = steppedOscillate(frameIndex, 12, 3, 3);
    const foamRibbonD =
      'M -40 -175 C -12 -125, 18 -75, 42 -22 C 66 32, 92 88, 124 155 C 102 162, 78 102, 52 46 C 24 -12, -8 -72, -36 -132 Q -48 -158, -40 -175 Z';

    return svgEl(
      'g',
      {
        'data-prop': 'ocean_waves',
        'data-wave-mode': 'shoreline',
        transform: svgTransform({ x: tideSlide, y: tideLift }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Wet sand / shallow turquoise glaze
        crayonPath(foamRibbonD, skyPastelLight, {
          stroke: catLightBlue,
          strokeWidth: outlineMedium,
          opacity: 0.85,
        }),
        // Scalloped frothy white surf line
        svgEl('path', {
          d: 'M -34 -168 Q -12 -144, -18 -118 Q 6 -92, 2 -64 Q 26 -38, 22 -8 Q 48 18, 44 48 Q 72 76, 68 106 Q 98 130, 114 154',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: cloudWhite,
            strokeWidth: 7.5,
          }),
        }),
        svgEl('path', {
          d: 'M -24 -158 Q -2 -134, -8 -108 Q 16 -82, 12 -54 Q 36 -28, 32 2 Q 58 28, 54 58 Q 82 86, 78 116',
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: cobaltStarBlue,
            strokeWidth: outlineThin,
          }),
        }),
        // Little sea-foam bubbles
        svgEl('circle', { cx: -6, cy: -96, r: 4, fill: cloudWhite }),
        svgEl('circle', { cx: 28, cy: -18, r: 4.5, fill: nightcapWhite }),
        svgEl('circle', { cx: 64, cy: 66, r: 4, fill: cloudWhite }),
        svgEl('circle', { cx: 92, cy: 124, r: 3.5, fill: cloudWhite }),
      ]
    );
  }

  // Open-water horizontal scalloped crayon wave crests
  const rowCount = Math.max(1, Math.min(6, Math.round(count ?? 3)));
  const rows: string[] = [];

  for (let i = 0; i < rowCount; i++) {
    const swayX = steppedOscillate(frameIndex, 10, 8, i * 3 + variant * 2);
    const bobY = steppedOscillate(frameIndex, 8, 2.8, i * 2 + variant);
    const baseX = round2((i % 2 === 0 ? -36 : 32) + deterministicJitter(i, variant, 18));
    const baseY = round2(i * 42);

    const crestD =
      'M -110 0 Q -82 -14, -54 0 Q -26 -15, 2 0 Q 30 -14, 58 0 Q 86 -13, 114 0';
    const foamD =
      'M -96 -5 Q -82 -14, -68 -5 M -40 -6 Q -26 -15, -12 -6 M 16 -5 Q 30 -14, 44 -5';

    rows.push(
      svgEl(
        'g',
        {
          transform: svgTransform({
            x: round2(baseX + swayX),
            y: round2(baseY + bobY),
          }),
        },
        [
          svgEl('path', {
            d: crestD,
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: cobaltStarBlue,
              strokeWidth: outlineMedium + 0.4,
            }),
          }),
          svgEl('path', {
            d: foamD,
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: cloudWhite,
              strokeWidth: outlineHeavyStroke(),
            }),
          }),
          svgEl('circle', {
            cx: -54,
            cy: -8,
            r: 2.8,
            fill: skyPastelLight,
          }),
          svgEl('circle', {
            cx: 58,
            cy: -8,
            r: 2.6,
            fill: cloudWhite,
          }),
        ]
      )
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'ocean_waves',
      'data-wave-mode': 'crests',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    rows
  );
}

function outlineHeavyStroke(): number {
  return TOKENS.strokes.outlineHeavy;
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import { renderCutoutStickerHalo } from '../characters/shared';
import type { PropRenderOptions } from './types';

/**
 * Stepped 6 FPS animated crayon splash droplets, crown arcs, and water rings (`'water_splash'`).
 */
export function renderWaterSplash(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const {
    cloudWhite,
    skyPastelLight,
    catLightBlue,
    cobaltStarBlue,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const dropletCount = Math.max(3, Math.min(10, Math.round(count ?? 6)));
  const pulse = steppedLoopProgress(frameIndex, 6, variant * 2);
  const crownLift = round2(4 + pulse * 10);
  const ringRx = round2(30 + pulse * 16);
  const ringRy = round2(8 + pulse * 4);

  // Splash crown silhouette at water surface
  const crownD = `M -34 0 C -30 ${round2(-18 - crownLift)}, -18 ${round2(-26 - crownLift)}, -12 -8 C -6 ${round2(-32 - crownLift)}, 6 ${round2(-32 - crownLift)}, 12 -8 C 18 ${round2(-26 - crownLift)}, 30 ${round2(-18 - crownLift)}, 34 0 Q 0 8, -34 0 Z`;

  const droplets: string[] = [];
  for (let i = 0; i < dropletCount; i++) {
    const hop = steppedLoopProgress(frameIndex, 6, i * 2 + variant);
    const spreadAngle = -Math.PI * (0.16 + (0.68 * i) / Math.max(1, dropletCount - 1));
    const dist = 24 + hop * 34 + Math.abs(deterministicJitter(i, variant, 6));
    const dx = round2(Math.cos(spreadAngle) * dist * 1.25);
    const dy = round2(Math.sin(spreadAngle) * dist - 8 + hop * hop * 14);
    const r = round2(3.6 + ((i + variant) % 3) * 1.1);
    const dropD = `M ${dx} ${round2(dy - r * 1.6)} C ${round2(dx + r)} ${round2(dy - r * 0.4)}, ${round2(dx + r)} ${round2(dy + r)}, ${dx} ${round2(dy + r)} C ${round2(dx - r)} ${round2(dy + r)}, ${round2(dx - r)} ${round2(dy - r * 0.4)}, ${dx} ${round2(dy - r * 1.6)} Z`;

    droplets.push(
      renderCutoutStickerHalo(dropD, 5),
      crayonPath(dropD, i % 2 === 0 ? skyPastelLight : cloudWhite, {
        stroke: cobaltStarBlue,
        strokeWidth: outlineThin,
      })
    );
  }

  const rippleSway = steppedOscillate(frameIndex, 6, 3, variant);

  return svgEl(
    'g',
    {
      'data-prop': 'water_splash',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Expanding oval water ring on surface
      svgEl('ellipse', {
        cx: rippleSway,
        cy: 4,
        rx: ringRx,
        ry: ringRy,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: cloudWhite,
          strokeWidth: outlineMedium + 0.8,
        }),
      }),
      svgEl('ellipse', {
        cx: rippleSway,
        cy: 4,
        rx: round2(ringRx + 8),
        ry: round2(ringRy + 2.5),
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: catLightBlue,
          strokeWidth: outlineThin,
        }),
      }),
      // Frothy splash crown
      renderCutoutStickerHalo(crownD, 7),
      crayonPath(crownD, cloudWhite, {
        stroke: cobaltStarBlue,
        strokeWidth: outlineMedium,
      }),
      ...droplets,
    ]
  );
}

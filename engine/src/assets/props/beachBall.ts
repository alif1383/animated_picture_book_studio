import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import { renderCutoutStickerHalo } from '../characters/shared';
import type { PropRenderOptions } from './types';

/**
 * Multi-panel colorful wax-crayon inflatable beach ball (`'beach_ball'`)
 * with stepped 6 FPS spin and white cutout sticker halo.
 */
export function renderBeachBall(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const { charcoalOutline, cloudWhite } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const r = 24;
  // Quantized 6 FPS playful spin
  const spinDeg = round2(((frameIndex * 22 + variant * 35) % 360));
  const circleD = `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;

  // 6 curved meridian beach-ball panels radiating from top/bottom pole
  const panelMaterials = [
    getPatternFill('crayonRadishRed'),
    cloudWhite,
    getPatternFill('crayonBananaYellow'),
    getPatternFill('crayonCatBlue'),
    cloudWhite,
    getPatternFill('crayonWatermelonPink'),
  ];

  const panels: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (i * Math.PI) / 3;
    const a2 = ((i + 1) * Math.PI) / 3;
    const x1 = round2(r * Math.cos(a1));
    const y1 = round2(r * Math.sin(a1));
    const x2 = round2(r * Math.cos(a2));
    const y2 = round2(r * Math.sin(a2));
    const midA = (a1 + a2) * 0.5;
    const cx1 = round2(r * 0.42 * Math.cos(midA - 0.35));
    const cy1 = round2(r * 0.42 * Math.sin(midA - 0.35));
    const cx2 = round2(r * 0.42 * Math.cos(midA + 0.35));
    const cy2 = round2(r * 0.42 * Math.sin(midA + 0.35));
    const d = `M 0 0 Q ${cx1} ${cy1}, ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Q ${cx2} ${cy2}, 0 0 Z`;
    panels.push(
      crayonPath(d, panelMaterials[i], {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        mask: fillMask,
      })
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'beach_ball',
      transform: svgTransform({ rotate: spinDeg }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(circleD, 9),
      ...panels,
      // Outer charcoal circumference outline
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
        }),
      }),
      // Classic white circular pole cap button
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: 5.5,
        fill: cloudWhite,
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
        }),
      }),
      // Waxy highlight arc
      svgEl('path', {
        d: 'M -14 -11 A 17 17 0 0 1 -3 -17',
        fill: 'none',
        stroke: cloudWhite,
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
        opacity: 0.85,
      }),
    ]
  );
}

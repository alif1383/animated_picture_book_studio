import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
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
 * Renders a fuzzy wax-crayon yellow-green tennis ball (`'dog_tennis_ball'`)
 * centered at `(0, -11)` with radius `11px` (resting on `y = 0`), curved white
 * seam arcs, subtle meadow-green fuzz tufts, and stepped 6 FPS rotation/boil.
 */
export function renderDogTennisBall(options?: PropRenderOptions): string {
  const frameIndex = options?.frameIndex ?? 0;
  const variant = options?.variant ?? 1;
  const fillMask = options?.fillMask;

  const {
    charcoalOutline,
    cloudWhite,
    paperWarm,
    meadowGreen,
    bananaYellow,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const cx = 0;
  const cy = -11;
  const r = 11;

  // Quantized 6 FPS spin around the ball center (0, -11) + gentle line-boil wobble
  const spinDeg = round2((frameIndex * 30 + variant * 42) % 360);
  const boilX = round2(deterministicJitter(1, frameIndex, 0.45));
  const boilY = round2(deterministicJitter(2, frameIndex, 0.35));

  const circleD = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

  // Subtle yellow-green fuzzy halo tufts around the rim
  const fuzzAngles = [18, 72, 132, 198, 255, 315];
  const fuzzTufts = fuzzAngles.map((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const jitterR = r + 1.1 + deterministicJitter(idx + 10, frameIndex, 0.35);
    const x1 = round2(cx + Math.cos(rad) * (r - 0.5));
    const y1 = round2(cy + Math.sin(rad) * (r - 0.5));
    const x2 = round2(cx + Math.cos(rad) * jitterR);
    const y2 = round2(cy + Math.sin(rad) * jitterR);
    return svgEl('path', {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      fill: 'none',
      stroke: idx % 2 === 0 ? meadowGreen : bananaYellow,
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      opacity: 0.9,
    });
  });

  // Spinning interior detail group (pivots cleanly around (0, -11) so ground contact stays at y = 0)
  const spinningDetails = svgEl(
    'g',
    {
      'data-part': 'tennis-ball-spin',
      transform: svgTransform({ rotate: spinDeg, pivotX: cx, pivotY: cy }),
    },
    [
      // Sunny yellow-green crayon tint wash across lower-right half of the ball
      svgEl('path', {
        d: `M ${cx - 8} ${cy - 7} A ${r} ${r} 0 1 0 ${cx + 9} ${cy + 6} Q ${cx - 1} ${cy + 2}, ${cx - 8} ${cy - 7} Z`,
        fill: meadowGreen,
        opacity: 0.34,
        mask: fillMask,
        stroke: 'none',
      }),
      // Subtle fuzz strokes
      ...fuzzTufts,
      // Signature curved tennis-ball seam arcs (charcoal under-edge + crisp cloud-white seam)
      svgEl('path', {
        d: `M ${cx - 7.2} ${cy - 8.1} Q ${cx - 1.4} ${cy}, ${cx - 7.2} ${cy + 8.1}`,
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d: `M ${cx - 7.2} ${cy - 8.1} Q ${cx - 1.4} ${cy}, ${cx - 7.2} ${cy + 8.1}`,
        fill: 'none',
        stroke: cloudWhite,
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d: `M ${cx + 7.2} ${cy - 8.1} Q ${cx + 1.4} ${cy}, ${cx + 7.2} ${cy + 8.1}`,
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d: `M ${cx + 7.2} ${cy - 8.1} Q ${cx + 1.4} ${cy}, ${cx + 7.2} ${cy + 8.1}`,
        fill: 'none',
        stroke: cloudWhite,
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
      }),
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'dog_tennis_ball',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Primary sunny banana-yellow crayon body with progressive fillMask support
      crayonPath(circleD, getPatternFill('crayonBananaYellow'), {
        stroke: 'none',
        mask: fillMask,
        paperUnderlay: true,
      }),
      // Rotating seams, meadow-green tint & fuzz tufts
      spinningDetails,
      // Crisp outer charcoal crayon outline
      svgEl('circle', {
        cx: round2(cx + boilX * 0.25),
        cy: round2(cy + boilY * 0.25),
        r,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
        }),
      }),
      // Consistent upper-left waxy crayon highlight arc
      svgEl('path', {
        d: `M ${round2(cx - 6.4 + boilX * 0.2)} ${round2(cy - 5.2 + boilY * 0.2)} A 7.8 7.8 0 0 1 ${round2(cx - 1.2 + boilX * 0.2)} ${round2(cy - 7.8 + boilY * 0.2)}`,
        fill: 'none',
        stroke: paperWarm,
        'stroke-width': outlineThin,
        'stroke-linecap': 'round',
        opacity: 0.8,
      }),
    ]
  );
}
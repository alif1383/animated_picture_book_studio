import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel vintage muted olive-chartreuse
 * felt tennis ball (`'dog_tennis_ball'`), centered at `(0, -11)` with radius `11px`
 * (`x: -11..11`, `y: -22..0`, resting cleanly at `y = 0`), featuring flat matte cel
 * shading, curved cream seam arcs rotating smoothly on twos (`Math.floor(frameIndex / 2)`),
 * and sketchy Xerox graphite felt fuzz ticks.
 */
export function renderClassicDogTennisBall(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const cx = 0;
  const cy = -11;
  const r = 11;

  // Classic Disney animation "on twos" (12 drawings/sec inside 24 FPS container)
  const twosStep = Math.floor(frameIndex / 2);
  const spinDeg = round2((twosStep * 28 + variant * 42) % 360);
  const boilX = round2(deterministicJitter(1, twosStep + variant * 3, 0.22));
  const boilY = round2(deterministicJitter(2, twosStep + variant * 3, 0.18));

  const circleD = `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
  const ballClipId = `cc-tennis-ball-clip-${uid}`;
  const spinClipId = `cc-tennis-ball-spin-clip-${uid}`;

  // Sketchy interior felt fuzz ticks along the rim & face that rotate with the ball
  const fuzzAngles = [18, 72, 132, 198, 255, 315];
  const fuzzPathSegs = fuzzAngles.map((deg, idx) => {
    const rad = (deg * Math.PI) / 180;
    const innerR = r - 2.3 + deterministicJitter(idx + 10, twosStep + variant, 0.3);
    const outerR = r - 0.35;
    const x1 = round2(cx + Math.cos(rad) * innerR);
    const y1 = round2(cy + Math.sin(rad) * innerR);
    const x2 = round2(cx + Math.cos(rad + 0.08) * outerR);
    const y2 = round2(cy + Math.sin(rad + 0.08) * outerR);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  });

  // Rotating interior seams & felt fuzz strokes pivoting cleanly around (0, -11)
  const spinningDetails = svgEl(
    'g',
    {
      'clip-path': svgUrl(spinClipId),
    },
    svgEl(
      'g',
      {
        'data-part': 'tennis-ball-spin',
        transform: svgTransform({ rotate: spinDeg, pivotX: cx, pivotY: cy }),
      },
      [
        // Subtle Xerox felt fuzz ticks around the rotating felt surface
        xeroxSketchStroke(
          [
            ...fuzzPathSegs,
            `M ${cx - 2.2} ${cy - 4.4} L ${cx - 0.6} ${cy - 3.6}`,
            `M ${cx + 0.8} ${cy + 3.8} L ${cx + 2.4} ${cy + 4.5}`,
          ].join(' '),
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.78,
            opacity: 0.65,
          }
        ),
        // Signature curved tennis-ball seam arcs (Xerox charcoal under-edge + matte celCream seam)
        svgEl('path', {
          d: `M ${cx - 7.2} ${cy - 8.1} Q ${cx - 1.4} ${cy}, ${cx - 7.2} ${cy + 8.1}`,
          fill: 'none',
          stroke: c.xeroxInk,
          'stroke-width': 2.8,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: `M ${cx - 7.2} ${cy - 8.1} Q ${cx - 1.4} ${cy}, ${cx - 7.2} ${cy + 8.1}`,
          fill: 'none',
          stroke: c.celCream,
          'stroke-width': 1.55,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: `M ${cx + 7.2} ${cy - 8.1} Q ${cx + 1.4} ${cy}, ${cx + 7.2} ${cy + 8.1}`,
          fill: 'none',
          stroke: c.xeroxInk,
          'stroke-width': 2.8,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: `M ${cx + 7.2} ${cy - 8.1} Q ${cx + 1.4} ${cy}, ${cx + 7.2} ${cy + 8.1}`,
          fill: 'none',
          stroke: c.celCream,
          'stroke-width': 1.55,
          'stroke-linecap': 'round',
        }),
      ]
    )
  );

  // Outer Xerox graphite outline & subtle stationary matte upper-left felt highlight arc
  const outerOutline = celPath(circleD, 'none', {
    stroke: c.xeroxInk,
    strokeWidth: s.xeroxMedium,
  });

  const upperHighlight = xeroxSketchStroke(
    `M ${round2(cx - 6.4 + boilX * 0.2)} ${round2(cy - 5.2 + boilY * 0.2)} A 7.8 7.8 0 0 1 ${round2(cx - 1.2 + boilX * 0.2)} ${round2(cy - 7.8 + boilY * 0.2)}`,
    {
      stroke: c.celCream,
      strokeWidth: 1.25,
      opacity: 0.72,
    }
  );

  return svgEl(
    'g',
    {
      'data-prop': 'dog_tennis_ball',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: spinClipId }, svgEl('path', { d: circleD })),
      ]),
      celContactShadow(0, 0, 9.5, 2.4, 0.28),
      // Flat matte olive-chartreuse felt body with crisp crescent shadow plane
      celShadedShape({
        d: circleD,
        baseFill: c.tennisBallBase,
        shadowPaths: [
          `M ${cx - 8.2} ${cy + 7.4} Q ${cx + 3.2} ${cy + 5.6}, ${cx + 6.4} ${cy - 8.8} L ${cx + 13} ${cy - 4} L ${cx + 12} ${cy + 13} L ${cx - 11} ${cy + 13} Z`,
        ],
        shadowFill: c.tennisBallShadow,
        shadowOpacity: 0.92,
        highlightPaths: [
          `M ${cx - 10.5} ${cy - 1.5} Q ${cx - 6.8} ${cy - 9.2}, ${cx + 1.4} ${cy - 10.5} Q ${cx - 4.6} ${cy - 6.2}, ${cx - 7.8} ${cy + 0.4} Z`,
        ],
        highlightFill: c.celCream,
        highlightOpacity: 0.24,
        clipId: ballClipId,
        stroke: 'none',
        strokeWidth: 0,
        useXeroxFilter: false,
      }),
      // Rotating cream seam arcs & sketchy felt fuzz ticks
      spinningDetails,
      // Crisp outer Xerox charcoal rim & upper-left matte felt accent
      outerOutline,
      upperHighlight,
    ]
  );
}

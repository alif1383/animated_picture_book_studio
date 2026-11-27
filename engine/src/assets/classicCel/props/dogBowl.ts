import { TOKENS } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel vintage slate-cerulean
 * enamel dog dish (`'dog_bowl'`) sized identically to the crayon original
 * (`x: -22..22`, `y: -20..0`, ground at `y = 0`), filled with a warm mound
 * of earthy kibble and decorated with a cream bone emblem at `(0, -6.6)`.
 */
export function renderClassicDogBowl(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Subtle stepped-on-twos (12 FPS) hand-drawn Xerox micro-boil
  const twosStep = Math.floor(frameIndex / 2);
  const boilX = round2(deterministicJitter(5, twosStep + variant * 5, 0.25));
  const boilY = round2(deterministicJitter(6, twosStep + variant * 5, 0.2));

  // Helper to produce an oval path so kibble nuggets carry Xerox ink via celPath
  const ovalD = (cx: number, cy: number, rx: number, ry: number): string =>
    `M ${round2(cx - rx)} ${round2(cy)} A ${round2(rx)} ${round2(ry)} 0 1 0 ${round2(cx + rx)} ${round2(cy)} A ${round2(rx)} ${round2(ry)} 0 1 0 ${round2(cx - rx)} ${round2(cy)} Z`;

  // 1. Earthy Mound of Kibble peeking above the enamel rim (y: -20..-13)
  const kibbleNuggets: Array<{
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
  }> = [
    { cx: -9.5, cy: -15.2, rx: 3.1, ry: 2.2, fill: c.woodDark },
    { cx: -4.2, cy: -17.3, rx: 3.2, ry: 2.4, fill: c.russetEarth },
    { cx: 1.5, cy: -17.6, rx: 3.3, ry: 2.3, fill: c.woodMid },
    { cx: 7.4, cy: -16.4, rx: 3.0, ry: 2.2, fill: c.woodDark },
    { cx: 10.6, cy: -14.8, rx: 2.7, ry: 2.0, fill: c.woodMid },
    { cx: -6.2, cy: -14.5, rx: 2.9, ry: 2.0, fill: c.woodMid },
    { cx: -0.6, cy: -15.2, rx: 3.2, ry: 2.1, fill: c.russetEarth },
    { cx: 4.8, cy: -14.4, rx: 2.9, ry: 2.0, fill: c.woodMid },
  ];

  const kibble = svgEl('g', { 'data-part': 'kibble' }, [
    // Back kibble heap silhouette in deep woodDark
    celPath('M -15 -14 Q -8 -20, 0 -19.8 Q 8 -20, 15 -14 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Individual flat-painted cel kibble pellets
    ...kibbleNuggets.map((nugget, idx) =>
      celPath(
        ovalD(
          nugget.cx + deterministicJitter(idx + 20, twosStep + variant, 0.14),
          nugget.cy + deterministicJitter(idx + 30, twosStep + variant, 0.1),
          nugget.rx,
          nugget.ry
        ),
        nugget.fill,
        {
          stroke: c.xeroxInk,
          strokeWidth: 1.05,
        }
      )
    ),
    // Subtle Xerox texture ticks across the kibble mound
    xeroxSketchStroke(
      'M -5.4 -17.5 L -3.1 -17.2 M 0.4 -17.9 L 2.8 -17.4 M -1.6 -15.4 L 0.8 -15.0',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.7,
        opacity: 0.72,
      }
    ),
  ]);

  // 2. Matte Vintage Slate-Cerulean Enamel Bowl Body & Rolled Rim (x: -22..22, y: -15.8..0)
  const bowlWallD =
    'M -18 -14 L 18 -14 L 22 -1.2 Q 22 0, 20.4 0 L -20.4 0 Q -22 0, -22 -1.2 Z';
  const rolledRimD =
    'M -19 -14.2 Q 0 -11.4, 19 -14.2 Q 19 -15.8, 17.2 -15.6 Q 0 -13.1, -17.2 -15.6 Q -19 -15.8, -19 -14.2 Z';

  const bowlBody = svgEl('g', { 'data-part': 'bowl-body' }, [
    // Main flared trapezoidal enamel wall with flat 2-tone cel shading
    celShadedShape({
      d: bowlWallD,
      baseFill: c.dogBowlBlue,
      shadowPaths: [
        // Crisp right-side cylindrical cel shadow band
        'M 7 -14.5 L 22 -14.5 L 23 1 L 10 1 Q 10 -6, 7 -14.5 Z',
        // Ground-hugging base shadow band along lower rim
        'M -22.5 -3.4 Q 0 -1.9, 22.5 -3.4 L 22.5 1 L -22.5 1 Z',
      ],
      shadowFill: c.dogBowlShadow,
      shadowOpacity: 0.88,
      highlightPaths: [
        // Flat matte enamel sheen stripe along the left-facing slope
        `M ${round2(-15.8 + boilX * 0.15)} -12.6 L ${round2(-13.2 + boilX * 0.15)} -12.6 L ${round2(-15.2 + boilX * 0.15)} -3.4 L ${round2(-17.8 + boilX * 0.15)} -3.4 Z`,
      ],
      highlightFill: c.celCream,
      highlightOpacity: 0.34,
      clipId: `cc-dog-bowl-body-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Rolled front enamel lip overlapping the base of the kibble mound
    celShadedShape({
      d: rolledRimD,
      baseFill: c.dogBowlBlue,
      shadowPaths: ['M 5 -16 L 20 -16 L 20 -11 L 5 -11 Z'],
      shadowFill: c.dogBowlShadow,
      shadowOpacity: 0.8,
      highlightPaths: [
        'M -17 -15.3 Q -6 -13.6, 2 -13.9 L 2 -13.1 Q -6 -12.8, -17 -14.6 Z',
      ],
      highlightFill: c.celCream,
      highlightOpacity: 0.4,
      clipId: `cc-dog-bowl-rim-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),

    // Sketchy Xerox graphite shading ticks along the shaded flank & under the rolled lip
    xeroxSketchStroke(
      [
        'M -14 -12.3 Q -6 -11.4, 2 -11.4',
        'M 12.2 -10.5 L 15.8 -10.8 M 13.4 -7.2 L 17.6 -7.6 M 14.2 -4.0 L 18.8 -4.4',
        'M -16 -2.2 L -8 -1.8',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.78,
        broken: true,
        opacity: 0.7,
      }
    ),
  ]);

  // 3. Cream Bone Emblem centered on the front face at (0, -6.6)
  const ex = round2(boilX * 0.25);
  const ey = round2(-6.6 + boilY * 0.25);
  const emblemD = [
    `M ${ex - 4.4} ${ey - 1.5}`,
    `C ${ex - 5.4} ${ey - 3.3}, ${ex - 7.9} ${ey - 2.9}, ${ex - 7.6} ${ey - 0.8}`,
    `C ${ex - 8.1} ${ey}, ${ex - 8.1} ${ey + 0.3}, ${ex - 7.6} ${ey + 0.9}`,
    `C ${ex - 7.9} ${ey + 2.9}, ${ex - 5.4} ${ey + 3.3}, ${ex - 4.4} ${ey + 1.5}`,
    `L ${ex + 4.4} ${ey + 1.5}`,
    `C ${ex + 5.4} ${ey + 3.3}, ${ex + 7.9} ${ey + 2.9}, ${ex + 7.6} ${ey + 0.9}`,
    `C ${ex + 8.1} ${ey + 0.3}, ${ex + 8.1} ${ey}, ${ex + 7.6} ${ey - 0.8}`,
    `C ${ex + 7.9} ${ey - 2.9}, ${ex + 5.4} ${ey - 3.3}, ${ex + 4.4} ${ey - 1.5}`,
    'Z',
  ].join(' ');

  const boneEmblem = svgEl('g', { 'data-part': 'bone-emblem' }, [
    // Subtle flat enamel drop shadow under the emblem
    svgEl('path', {
      d: `M ${ex - 5.2} ${ey + 2.5} L ${ex + 5.2} ${ey + 2.5}`,
      fill: 'none',
      stroke: c.dogBowlShadow,
      'stroke-width': 1.4,
      'stroke-linecap': 'round',
      opacity: 0.75,
    }),
    celShadedShape({
      d: emblemD,
      baseFill: c.celCream,
      shadowPaths: [
        `M ${ex - 9} ${ey + 0.8} L ${ex + 9} ${ey + 0.8} L ${ex + 9} ${ey + 4} L ${ex - 9} ${ey + 4} Z`,
      ],
      shadowFill: c.boardToothWarm,
      shadowOpacity: 0.85,
      clipId: `cc-dog-bowl-bone-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: 1.15,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dog_bowl',
      'data-art-style': 'classic_cel',
    },
    [
      celContactShadow(0, 0, 21.5, 3.0, 0.28),
      kibble,
      bowlBody,
      boneEmblem,
    ]
  );
}

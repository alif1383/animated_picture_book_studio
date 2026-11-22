import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a sturdy trapezoidal wax-crayon blue pet dish (`'dog_bowl'`)
 * (`x: -22..22`, `y: -20..0`, ground at `y = 0`), topped with a warm mound
 * of golden-brown kibble and decorated with a tiny cream bone emblem on front.
 */
export function renderDogBowl(options?: PropRenderOptions): string {
  const frameIndex = options?.frameIndex ?? 0;
  const fillMask = options?.fillMask;

  const {
    charcoalOutline,
    paperWarm,
    cloudWhite,
    woodBrown,
    ochreWall,
    ochreLight,
    nightcapBlue,
    royalCrayonBlue,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  // Gentle 6 FPS line-boil wobble
  const boilX = round2(deterministicJitter(5, frameIndex, 0.35));
  const boilY = round2(deterministicJitter(6, frameIndex, 0.25));

  // 1. Warm Mound of Golden-Brown Kibble peeking above the rim (y: -20..-13)
  const kibbleNuggets: Array<{
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
  }> = [
    { cx: -9.5, cy: -15.2, rx: 3.1, ry: 2.2, fill: woodBrown },
    { cx: -4.2, cy: -17.3, rx: 3.2, ry: 2.4, fill: ochreWall },
    { cx: 1.5, cy: -17.6, rx: 3.3, ry: 2.3, fill: woodBrown },
    { cx: 7.4, cy: -16.4, rx: 3.0, ry: 2.2, fill: ochreWall },
    { cx: 10.6, cy: -14.8, rx: 2.7, ry: 2.0, fill: woodBrown },
    { cx: -6.2, cy: -14.5, rx: 2.9, ry: 2.0, fill: ochreLight },
    { cx: -0.6, cy: -15.2, rx: 3.2, ry: 2.1, fill: ochreWall },
    { cx: 4.8, cy: -14.4, rx: 2.9, ry: 2.0, fill: ochreLight },
  ];

  const kibble = svgEl('g', { 'data-part': 'kibble' }, [
    // Back kibble heap silhouette
    crayonPath(
      'M -15 -14 Q -8 -20, 0 -19.8 Q 8 -20, 15 -14 Z',
      woodBrown,
      {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Individual chunky crayon kibble pellets
    ...kibbleNuggets.map((nugget, idx) =>
      svgEl('ellipse', {
        cx: round2(nugget.cx + deterministicJitter(idx + 20, frameIndex, 0.2)),
        cy: round2(nugget.cy + deterministicJitter(idx + 30, frameIndex, 0.15)),
        rx: nugget.rx,
        ry: nugget.ry,
        fill: nugget.fill,
        ...crayonStrokeAttrs({
          stroke: charcoalOutline,
          strokeWidth: 1.25,
        }),
      })
    ),
  ]);

  // 2. Sturdy Trapezoidal Sky-Blue Pet Dish Body (x: -22..22, y: -15..0)
  const bowlBody = svgEl('g', { 'data-part': 'bowl-body' }, [
    // Main flared trapezoidal bowl wall
    crayonPath(
      'M -18 -14 L 18 -14 L 22 -1.2 Q 22 0, 20.4 0 L -20.4 0 Q -22 0, -22 -1.2 Z',
      getPatternFill('crayonCatBlue'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Subtle deeper royal-blue shading band along the bottom rim for weight
    svgEl('path', {
      d: 'M -20.5 -3.4 Q 0 -2, 20.5 -3.4 L 21 -1 Q 21 0, 19.6 0 L -19.6 0 Q -21 0, -21 -1 Z',
      fill: royalCrayonBlue,
      opacity: 0.25,
      mask: fillMask,
      stroke: 'none',
    }),
    // Rolled front lip rim overlapping the base of the kibble mound
    crayonPath(
      'M -19 -14.2 Q 0 -11.4, 19 -14.2 Q 19 -15.8, 17.2 -15.6 Q 0 -13.1, -17.2 -15.6 Q -19 -15.8, -19 -14.2 Z',
      nightcapBlue,
      {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        mask: fillMask,
      }
    ),
    // Waxy crayon highlight streak on the left slope of the dish
    svgEl('path', {
      d: `M ${round2(-15.5 + boilX * 0.2)} -11.2 L ${round2(-17.4 + boilX * 0.2)} -3.8`,
      fill: 'none',
      stroke: cloudWhite,
      'stroke-width': 2.1,
      'stroke-linecap': 'round',
      opacity: 0.78,
    }),
  ]);

  // 3. Cute Tiny Cream Bone Emblem on the Front Center of the Dish
  const ex = round2(boilX * 0.3);
  const ey = round2(-6.6 + boilY * 0.3);
  const boneEmblem = svgEl('g', { 'data-part': 'bone-emblem' }, [
    crayonPath(
      [
        `M ${ex - 4.4} ${ey - 1.5}`,
        `C ${ex - 5.4} ${ey - 3.3}, ${ex - 7.9} ${ey - 2.9}, ${ex - 7.6} ${ey - 0.8}`,
        `C ${ex - 8.1} ${ey}, ${ex - 8.1} ${ey + 0.3}, ${ex - 7.6} ${ey + 0.9}`,
        `C ${ex - 7.9} ${ey + 2.9}, ${ex - 5.4} ${ey + 3.3}, ${ex - 4.4} ${ey + 1.5}`,
        `L ${ex + 4.4} ${ey + 1.5}`,
        `C ${ex + 5.4} ${ey + 3.3}, ${ex + 7.9} ${ey + 2.9}, ${ex + 7.6} ${ey + 0.9}`,
        `C ${ex + 8.1} ${ey + 0.3}, ${ex + 8.1} ${ey}, ${ex + 7.6} ${ey - 0.8}`,
        `C ${ex + 7.9} ${ey - 2.9}, ${ex + 5.4} ${ey - 3.3}, ${ex + 4.4} ${ey - 1.5}`,
        'Z',
      ].join(' '),
      paperWarm,
      {
        stroke: charcoalOutline,
        strokeWidth: 1.3,
      }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dog_bowl',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [kibble, bowlBody, boneEmblem]
  );
}
import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import { renderStarShape } from './shared';
import type { PropRenderOptions } from './types';

/**
 * Evaluates a point `(x, y)` along the drooping festival rope catenary
 * strung between the left pole (`-224, -190`) and right pole (`+224, -190`),
 * dipping to `y = -158` at center (`t = 0.5`).
 */
function ropePoint(t: number): { x: number; y: number } {
  const mt = 1 - t;
  const x = mt * mt * -224 + t * t * 224;
  const y = mt * mt * -190 + 2 * mt * t * -126 + t * t * -190;
  return { x: round2(x), y: round2(y) };
}

/**
 * Renders one sturdy medieval wooden festival pole at `poleX` (`-230` or `+230`)
 * grounded at `y = 0` with a flared base, festive ribbon bands, wood-grain marks,
 * and a royal gold finial orb centered at `y = -200`.
 */
function renderFestivalPole(
  poleX: number,
  sideIndex: number,
  fillMask?: string
): string {
  const {
    charcoalOutline,
    faintPencil,
    warmMoon,
    ochreLight,
    storeAwningRed,
    woodBrown,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const woodFill = getPatternFill('crayonWoodBrown');

  // Ground stone/plinth ring (extends +-10px around pole center -> outer edge +-240)
  const plinthD = `M ${poleX - 10} 2 Q ${poleX} -5, ${poleX + 10} 2 Q ${poleX} 5, ${poleX - 10} 2 Z`;
  // Sturdy flared wooden post collar at base
  const baseCollarD = `M ${poleX - 9} 1 L ${poleX - 7} -14 L ${poleX + 7} -14 L ${poleX + 9} 1 Z`;
  // Main wooden pole shaft rising from ground collar to y = -192
  const shaftD = `M ${poleX - 6} -13 L ${poleX - 5} -192 L ${poleX + 5} -192 L ${poleX + 6} -13 Z`;

  // Hand-drawn vertical wood grain lines
  const grain1 = `M ${poleX - 2} -24 Q ${poleX - 3} -96, ${poleX - 2} -176`;
  const grain2 = `M ${poleX + 2} -34 Q ${poleX + 3} -110, ${poleX + 1.5} -182`;

  // Festive medieval cloth wrap bands along the wooden pole
  const bandLowerD = `M ${poleX - 6} -88 L ${poleX + 6} -94 L ${poleX + 6} -84 L ${poleX - 6} -78 Z`;
  const bandUpperD = `M ${poleX - 5.5} -166 L ${poleX + 5.5} -172 L ${poleX + 5.5} -162 L ${poleX - 5.5} -156 Z`;

  // Gold collar ring, royal finial spire pip, and royal finial gold orb centered at y = -200
  const neckRingD = `M ${poleX - 7} -191 Q ${poleX} -195, ${poleX + 7} -191 L ${poleX + 6.5} -187 Q ${poleX} -190, ${poleX - 6.5} -187 Z`;
  const finialTipD = `M ${poleX - 2.5} -208 L ${poleX} -214 L ${poleX + 2.5} -208 Z`;
  const finialBallD = `M ${poleX - 9} -200 A 9 9 0 1 0 ${poleX + 9} -200 A 9 9 0 1 0 ${poleX - 9} -200 Z`;

  // Rope knot tie & short dangling tassel on the inner side of the pole
  const innerDir = poleX < 0 ? 1 : -1;
  const knotX = poleX + innerDir * 6;
  const tasselD = `M ${knotX} -189 Q ${knotX + innerDir * 5} -181, ${knotX + innerDir * 3} -173`;
  const knotBallD = `M ${knotX - 3.2} -189 A 3.2 3.2 0 1 0 ${knotX + 3.2} -189 A 3.2 3.2 0 1 0 ${knotX - 3.2} -189 Z`;

  return svgEl('g', { 'data-part': sideIndex === 0 ? 'left-pole' : 'right-pole' }, [
    // Ground base plinth
    crayonPath(plinthD, ochreLight, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Pole shaft
    crayonPath(shaftD, woodFill, {
      stroke: charcoalOutline,
      strokeWidth: outlineMedium,
      mask: fillMask,
    }),
    // Wood grain pencil strokes
    svgEl('path', {
      d: grain1,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: outlineThin,
        opacity: 0.48,
      }),
    }),
    svgEl('path', {
      d: grain2,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: outlineThin,
        opacity: 0.42,
      }),
    }),
    // Flared base collar
    crayonPath(baseCollarD, woodFill, {
      stroke: charcoalOutline,
      strokeWidth: outlineMedium,
      mask: fillMask,
    }),
    // Festive diagonal cloth bands
    crayonPath(bandLowerD, storeAwningRed, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    crayonPath(bandUpperD, warmMoon, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Rope knot tassel on inner side of collar
    svgEl('path', {
      d: tasselD,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: woodBrown,
        strokeWidth: 2.8,
      }),
    }),
    crayonPath(knotBallD, warmMoon, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Gold neck collar ring
    crayonPath(neckRingD, warmMoon, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Royal finial spire nub
    crayonPath(finialTipD, warmMoon, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Royal finial gold ball centered at y = -200 (uses crayonPath so fillMask preserves pencil outline)
    crayonPath(finialBallD, warmMoon, {
      stroke: charcoalOutline,
      strokeWidth: outlineMedium,
      mask: fillMask,
    }),
    // Warm highlight crescent inside finial ball
    svgEl('path', {
      d: `M ${poleX - 4} -203 Q ${poleX - 2} -206, ${poleX + 2} -205`,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: ochreLight,
        strokeWidth: outlineThin,
        opacity: 0.85,
      }),
    }),
  ]);
}

/**
 * Renders a medieval courtyard festival celebration banner arch (`'celebration_banner'`)
 * with two sturdy wooden poles (`x = -230`, `x = +230`), royal gold finials (`y = -200`),
 * a drooping catenary bunting rope dipping to `y = -158` at center, alternating wax-crayon
 * pennant flags swaying subtly at 6 FPS, and a central `"HUZZAH!"` parchment ribbon crest
 * (`y: -186..-152`) flanked by golden stars so standing characters (`~100-142px`) celebrate
 * cleanly underneath without occlusion.
 */
export function renderCelebrationBanner(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const {
    charcoalOutline,
    paperWarm,
    paperShadow,
    paperDeep,
    ochreWall,
    bananaYellow,
    woodBrown,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  // Alternating wax-crayon pennant palette
  const pennantFills = [
    getPatternFill('crayonAwningRed'),
    getPatternFill('crayonWarmMoon'),
    getPatternFill('crayonRoyalBlue'),
    getPatternFill('crayonMeadowGreen'),
  ];

  // 10 pennant slots: 5 on left wing and 5 on right wing flanking the center crest,
  // with tapered drop lengths so every pennant tip stays above y = -146 (clear of 142px characters)
  const pennantSlots: ReadonlyArray<{ t0: number; t1: number; drop: number }> = [
    { t0: 0.03, t1: 0.082, drop: 24 },
    { t0: 0.086, t1: 0.138, drop: 22 },
    { t0: 0.142, t1: 0.194, drop: 20 },
    { t0: 0.198, t1: 0.25, drop: 18 },
    { t0: 0.254, t1: 0.306, drop: 17 },
    { t0: 0.694, t1: 0.746, drop: 17 },
    { t0: 0.75, t1: 0.802, drop: 18 },
    { t0: 0.806, t1: 0.858, drop: 20 },
    { t0: 0.862, t1: 0.914, drop: 22 },
    { t0: 0.918, t1: 0.97, drop: 24 },
  ];

  const colorPhase = Math.max(0, Math.floor(variant) - 1);

  const pennants = pennantSlots.map((slot, i) => {
    const p1 = ropePoint(slot.t0);
    const p2 = ropePoint(slot.t1);
    const midX = (p1.x + p2.x) * 0.5;
    const midY = (p1.y + p2.y) * 0.5;

    // Subtle 6 FPS breeze flutter driven by deterministicJitter
    const sway = deterministicJitter(i, frameIndex, 1.4);
    const tipX = round2(midX + sway * 1.6);
    const tipY = round2(midY + slot.drop + deterministicJitter(i + 17, frameIndex, 0.5));

    // Softly curved fabric edges for hand-drawn storybook charm
    const leftCtrlX = round2((p1.x + tipX) * 0.5 + sway * 0.45);
    const leftCtrlY = round2((p1.y + tipY) * 0.5);
    const rightCtrlX = round2((p2.x + tipX) * 0.5 + sway * 0.45);
    const rightCtrlY = round2((p2.y + tipY) * 0.5);

    const flagD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Q ${rightCtrlX} ${rightCtrlY}, ${tipX} ${tipY} Q ${leftCtrlX} ${leftCtrlY}, ${p1.x} ${p1.y} Z`;
    const fill = pennantFills[(i + colorPhase) % pennantFills.length];

    return crayonPath(flagD, fill, {
      stroke: charcoalOutline,
      strokeWidth: outlineThin,
      mask: fillMask,
    });
  });

  // Drooping catenary hemp rope dipping from (-224, -190) through center (0, -158) to (+224, -190)
  const ropeSagJitter = round2(deterministicJitter(41, frameIndex, 0.7));
  const ropeCtrlY = round2(-126 + ropeSagJitter);
  const ropeD = `M -224 -190 Q 0 ${ropeCtrlY}, 224 -190`;

  // Subtle 6 FPS bob for the central parchment ribbon crest (stays strictly inside y: -186..-152)
  const crestBob = round2(deterministicJitter(31, frameIndex, 0.6));
  const starTilt = round2(deterministicJitter(37, frameIndex, 4));

  // Swallowtail parchment ribbon ends tucked behind the main scroll body
  const leftTailD = `M -99 ${round2(-178 + crestBob)} L -74 ${round2(-179 + crestBob)} L -74 ${round2(-156 + crestBob)} L -99 ${round2(-158 + crestBob)} L -91 ${round2(-168 + crestBob)} Z`;
  const rightTailD = `M 99 ${round2(-178 + crestBob)} L 74 ${round2(-179 + crestBob)} L 74 ${round2(-156 + crestBob)} L 99 ${round2(-158 + crestBob)} L 91 ${round2(-168 + crestBob)} Z`;

  // Fold shadows where ribbon tails tuck under the main parchment scroll
  const leftFoldD = `M -80 ${round2(-155 + crestBob)} L -72 ${round2(-158 + crestBob)} L -72 ${round2(-152 + crestBob)} Z`;
  const rightFoldD = `M 80 ${round2(-155 + crestBob)} L 72 ${round2(-158 + crestBob)} L 72 ${round2(-152 + crestBob)} Z`;

  // Main arched parchment scroll body spanning y: -186..-152 at center
  const topEdgeY = round2(-182 + crestBob);
  const topCtrlY = round2(-190 + crestBob);
  const botEdgeY = round2(-155 + crestBob);
  const botCtrlY = round2(-149 + crestBob);
  const scrollBodyD = `M -80 ${topEdgeY} Q 0 ${topCtrlY}, 80 ${topEdgeY} L 80 ${botEdgeY} Q 0 ${botCtrlY}, -80 ${botEdgeY} Z`;

  // Decorative inner parchment stitched border
  const innerBorderD = `M -74 ${round2(topEdgeY + 4)} Q 0 ${round2(topCtrlY + 5)}, 74 ${round2(topEdgeY + 4)} M -74 ${round2(botEdgeY - 4)} Q 0 ${round2(botCtrlY - 4)}, 74 ${round2(botEdgeY - 4)}`;

  // Flanking golden stars inside the parchment crest
  const starY = round2(-169 + crestBob);
  const leftStarD = renderStarShape(-62, starY, 7.2, -10 + starTilt);
  const rightStarD = renderStarShape(62, starY, 7.2, 10 - starTilt);

  return svgEl(
    'g',
    {
      'data-prop': 'celebration_banner',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Left and right wooden festival poles with royal gold finials
      renderFestivalPole(-230, 0, fillMask),
      renderFestivalPole(230, 1, fillMask),

      // Alternating wax-crayon pennant flags along the catenary rope
      svgEl('g', { 'data-part': 'pennants' }, pennants),

      // Main drooping catenary rope (warm twine underlay + charcoal outline)
      svgEl('g', { 'data-part': 'bunting-rope' }, [
        svgEl('path', {
          d: ropeD,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: woodBrown,
            strokeWidth: 4.2,
          }),
        }),
        svgEl('path', {
          d: ropeD,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
          }),
        }),
      ]),

      // Cheerful central parchment ribbon crest ("HUZZAH!") flanked by golden stars
      svgEl('g', { 'data-part': 'ribbon-crest' }, [
        crayonPath(leftTailD, paperShadow, {
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
          mask: fillMask,
        }),
        crayonPath(rightTailD, paperShadow, {
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
          mask: fillMask,
        }),
        crayonPath(leftFoldD, paperDeep, {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
        }),
        crayonPath(rightFoldD, paperDeep, {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
        }),
        crayonPath(scrollBodyD, paperWarm, {
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
          mask: fillMask,
        }),
        svgEl('path', {
          d: innerBorderD,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: ochreWall,
            strokeWidth: outlineThin,
            dasharray: TOKENS.strokes.dasharrayDashed,
            opacity: 0.72,
          }),
        }),
        crayonPath(leftStarD, bananaYellow, {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
        }),
        crayonPath(rightStarD, bananaYellow, {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
        }),
        svgEl(
          'text',
          {
            x: 0,
            y: round2(-162 + crestBob),
            'text-anchor': 'middle',
            'font-family': TOKENS.typography.fontFamilyHand,
            'font-size': TOKENS.typography.sizeAnnotation,
            'font-weight': 'bold',
            'letter-spacing': '1.2',
            fill: charcoalOutline,
          },
          'HUZZAH!'
        ),
      ]),
    ]
  );
}

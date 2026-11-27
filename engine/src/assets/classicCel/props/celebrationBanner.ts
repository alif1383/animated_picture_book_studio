import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import { renderStarShape } from '../../props/shared';
import type { PropRenderOptions } from '../../props/types';

/**
 * Evaluates a point `(x, y)` along the festival bunting catenary rope
 * strung between left pole (`-224, -190`) and right pole (`+224, -190`),
 * dipping to `y = -158` at center (`t = 0.5`).
 */
function ropePoint(t: number): { x: number; y: number } {
  const mt = 1 - t;
  const x = mt * mt * -224 + t * t * 224;
  const y = mt * mt * -190 + 2 * mt * t * -126 + t * t * -190;
  return { x: round2(x), y: round2(y) };
}

/**
 * Renders one hand-inked medieval timber festival pole at `poleX` (`-230` or `+230`)
 * grounded at `y = 0` with a weathered stone plinth, timber shaft, wrapped heraldic
 * bands, braided hemp tie, and antique-gold spear finial reaching `y = -214`.
 */
function renderClassicFestivalPole(
  poleX: number,
  sideIndex: number,
  uid: string
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const sideTag = sideIndex === 0 ? 'l' : 'r';

  const plinthD = `M ${poleX - 10} 2 Q ${poleX} -4.5, ${poleX + 10} 2 Q ${poleX} 4.8, ${poleX - 10} 2 Z`;
  const baseCollarD = `M ${poleX - 8.5} 1 L ${poleX - 6.8} -14 L ${poleX + 6.8} -14 L ${poleX + 8.5} 1 Z`;
  const shaftD = `M ${poleX - 5.8} -13 L ${poleX - 4.8} -191 L ${poleX + 4.8} -191 L ${poleX + 5.8} -13 Z`;

  const bandLowerD = `M ${poleX - 5.8} -88 L ${poleX + 5.8} -94 L ${poleX + 5.8} -84 L ${poleX - 5.8} -78 Z`;
  const bandUpperD = `M ${poleX - 5.2} -166 L ${poleX + 5.2} -172 L ${poleX + 5.2} -162 L ${poleX - 5.2} -156 Z`;

  // Antique gold collar ring & medieval spearhead finial peaking at y = -214
  const neckRingD = `M ${poleX - 7} -191 Q ${poleX} -194.5, ${poleX + 7} -191 L ${poleX + 6.2} -187 Q ${poleX} -189.8, ${poleX - 6.2} -187 Z`;
  const finialOrbD = `M ${poleX - 6.5} -196.5 A 6.5 6.5 0 1 0 ${poleX + 6.5} -196.5 A 6.5 6.5 0 1 0 ${poleX - 6.5} -196.5 Z`;
  const spearFinialD = `M ${poleX - 5.2} -199 L ${poleX} -214 L ${poleX + 5.2} -199 L ${poleX} -195 Z`;

  const innerDir = poleX < 0 ? 1 : -1;
  const knotX = poleX + innerDir * 5.8;
  const tasselD = `M ${knotX} -189 Q ${knotX + innerDir * 4.5} -181, ${knotX + innerDir * 2.8} -173`;
  const knotBallD = `M ${knotX - 3} -189 A 3 3 0 1 0 ${knotX + 3} -189 A 3 3 0 1 0 ${knotX - 3} -189 Z`;

  return svgEl('g', { 'data-part': sideIndex === 0 ? 'left-pole' : 'right-pole' }, [
    celContactShadow(poleX, 2.2, 10, 2.2, 0.24),
    // Weathered stone base plinth
    celPath(plinthD, c.stoneBase, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Main medieval timber pole shaft with crisp cel shadow edge
    celShadedShape({
      d: shaftD,
      baseFill: c.woodMid,
      shadowPaths: [
        `M ${poleX + 1.2} -191 L ${poleX + 6} -191 L ${poleX + 6} -13 L ${poleX + 1.4} -13 Z`,
      ],
      shadowFill: c.woodDark,
      clipId: `cc-banner-shaft-${uid}-${sideTag}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Feathery vertical timber grain scratches
    xeroxSketchStroke(
      `M ${poleX - 2.2} -24 Q ${poleX - 2.8} -98, ${poleX - 2} -176 M ${poleX + 1.6} -38 Q ${poleX + 2.2} -112, ${poleX + 1.4} -182`,
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.85,
        broken: true,
        opacity: 0.64,
      }
    ),
    // Flared wooden base collar
    celPath(baseCollarD, c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Heraldic wrapped cloth bands
    celPath(bandLowerD, c.soldierCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath(bandUpperD, c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Rope knot tie & short dangling tassel
    svgEl('path', {
      d: tasselD,
      fill: 'none',
      stroke: c.ochreEarth,
      'stroke-width': 2.6,
      'stroke-linecap': 'round',
    }),
    xeroxSketchStroke(tasselD, {
      stroke: c.xeroxInk,
      strokeWidth: 0.9,
      opacity: 0.8,
    }),
    celPath(knotBallD, c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Gold neck collar ring & spear finial
    celPath(neckRingD, c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath(finialOrbD, c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celShadedShape({
      d: spearFinialD,
      baseFill: c.antiqueGold,
      shadowPaths: [`M ${poleX} -214 L ${poleX + 5.5} -199 L ${poleX} -195 Z`],
      shadowFill: c.moonShadow,
      highlightPaths: [`M ${poleX - 3.6} -199.5 L ${poleX - 0.4} -212 L ${poleX - 0.4} -196.5 Z`],
      highlightFill: c.mochiGoldHighlight,
      highlightOpacity: 0.72,
      clipId: `cc-banner-spear-${uid}-${sideTag}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
  ]);
}

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973)
 * medieval courtyard festival celebration banner arch (`'celebration_banner'`).
 *
 * - Two hand-inked timber poles (`x = -230`, `x = +230`) topped with antique-gold
 *   spear finials (`y = -214`).
 * - Alternating Eastmancolor scalloped pennants fluttering at 12 FPS strictly above
 *   `y = -146` so characters celebrate cleanly underneath.
 * - Central arched parchment ribbon crest (`"HUZZAH!"` in classic serif `xeroxInk`)
 *   flanked by antique-gold heraldic stars.
 *
 * Origin: `(0, 0)` bottom-center.
 * Bounds: `x: -240..+240, y: -214..+5`.
 */
export function renderClassicCelebrationBanner(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Alternating muted Eastmancolor pennant pigments (shifted by variant)
  const pennantPalette: ReadonlyArray<{ fill: string; shadow: string }> = [
    { fill: c.royalBlueTunic, shadow: c.royalBlueShadow },
    { fill: c.soldierCrimson, shadow: c.soldierCrimsonShadow },
    { fill: c.antiqueGold, shadow: c.moonShadow },
    { fill: c.dragonEmeraldLit, shadow: c.dragonEmeraldShadow },
    { fill: c.dustyRose, shadow: c.mochiNose },
  ];

  // 10 pennant slots: 5 left + 5 right flanking center crest;
  // tapered drops guarantee every pennant tip remains strictly above y = -146
  const pennantSlots: ReadonlyArray<{ t0: number; t1: number; drop: number }> = [
    { t0: 0.03, t1: 0.082, drop: 23 },
    { t0: 0.086, t1: 0.138, drop: 21 },
    { t0: 0.142, t1: 0.194, drop: 19 },
    { t0: 0.198, t1: 0.25, drop: 17 },
    { t0: 0.254, t1: 0.306, drop: 15.5 },
    { t0: 0.694, t1: 0.746, drop: 15.5 },
    { t0: 0.75, t1: 0.802, drop: 17 },
    { t0: 0.806, t1: 0.858, drop: 19 },
    { t0: 0.862, t1: 0.914, drop: 21 },
    { t0: 0.918, t1: 0.97, drop: 23 },
  ];

  const colorPhase = Math.max(0, Math.floor(variant) - 1);

  const pennants = pennantSlots.map((slot, i) => {
    const p1 = ropePoint(slot.t0);
    const p2 = ropePoint(slot.t1);
    const midX = (p1.x + p2.x) * 0.5;
    const midY = (p1.y + p2.y) * 0.5;

    // 12 FPS organic cloth breeze flutter
    const sway = steppedOscillate(frameIndex, 10, 2.2, i * 2 + variant);
    const lift = steppedOscillate(frameIndex, 12, 0.7, i * 3 + 1);
    const tipX = round2(midX + sway);
    const tipY = round2(Math.min(-147, midY + slot.drop + lift));

    // Gently scalloped medieval pennant edges
    const leftCtrlX = round2((p1.x + tipX) * 0.5 + sway * 0.35 - 1.2);
    const leftCtrlY = round2((p1.y + tipY) * 0.5 + 1.2);
    const rightCtrlX = round2((p2.x + tipX) * 0.5 + sway * 0.35 + 1.2);
    const rightCtrlY = round2((p2.y + tipY) * 0.5 + 1.2);

    const flagD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Q ${rightCtrlX} ${rightCtrlY}, ${tipX} ${tipY} Q ${leftCtrlX} ${leftCtrlY}, ${p1.x} ${p1.y} Z`;
    const swatch = pennantPalette[(i + colorPhase) % pennantPalette.length];

    // Subtle 2-tone cel shadow along trailing edge + sketch crease line
    const shadeD = `M ${round2(midX + 1.5)} ${round2(midY)} L ${p2.x} ${p2.y} Q ${rightCtrlX} ${rightCtrlY}, ${tipX} ${tipY} Z`;
    const creaseD = `M ${round2(midX)} ${round2(midY + 2)} Q ${round2(midX + sway * 0.4)} ${round2(midY + slot.drop * 0.52)}, ${round2(tipX - sway * 0.15)} ${round2(tipY - 3)}`;

    return svgEl('g', {}, [
      celShadedShape({
        d: flagD,
        baseFill: swatch.fill,
        shadowPaths: [shadeD],
        shadowFill: swatch.shadow,
        shadowOpacity: 0.55,
        clipId: `cc-banner-flag-${uid}-${i}`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      xeroxSketchStroke(creaseD, {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.7,
        broken: true,
        opacity: 0.5,
      }),
    ]);
  });

  // Drooping catenary hemp bunting rope
  const ropeSag = steppedOscillate(frameIndex, 14, 0.8, variant * 2);
  const ropeCtrlY = round2(-126 + ropeSag);
  const ropeD = `M -224 -190 Q 0 ${ropeCtrlY}, 224 -190`;

  // Subtle 12 FPS bob for central parchment ribbon crest (strictly y: -186..-151)
  const crestBob = steppedOscillate(frameIndex, 16, 0.7, variant * 3 + 2);
  const starTilt = steppedOscillate(frameIndex, 18, 4.0, 1);

  const leftTailD = `M -99 ${round2(-178 + crestBob)} L -74 ${round2(-179 + crestBob)} L -74 ${round2(-156 + crestBob)} L -99 ${round2(-158 + crestBob)} L -91 ${round2(-168 + crestBob)} Z`;
  const rightTailD = `M 99 ${round2(-178 + crestBob)} L 74 ${round2(-179 + crestBob)} L 74 ${round2(-156 + crestBob)} L 99 ${round2(-158 + crestBob)} L 91 ${round2(-168 + crestBob)} Z`;

  const leftFoldD = `M -80 ${round2(-155 + crestBob)} L -72 ${round2(-158 + crestBob)} L -72 ${round2(-152 + crestBob)} Z`;
  const rightFoldD = `M 80 ${round2(-155 + crestBob)} L 72 ${round2(-158 + crestBob)} L 72 ${round2(-152 + crestBob)} Z`;

  const topEdgeY = round2(-182 + crestBob);
  const topCtrlY = round2(-190 + crestBob);
  const botEdgeY = round2(-155 + crestBob);
  const botCtrlY = round2(-149 + crestBob);
  const scrollBodyD = `M -80 ${topEdgeY} Q 0 ${topCtrlY}, 80 ${topEdgeY} L 80 ${botEdgeY} Q 0 ${botCtrlY}, -80 ${botEdgeY} Z`;

  const innerBorderD = `M -74 ${round2(topEdgeY + 4)} Q 0 ${round2(topCtrlY + 5)}, 74 ${round2(topEdgeY + 4)} M -74 ${round2(botEdgeY - 4)} Q 0 ${round2(botCtrlY - 4)}, 74 ${round2(botEdgeY - 4)}`;

  const starY = round2(-169 + crestBob);
  const leftStarD = renderStarShape(-62, starY, 7.0, -10 + starTilt);
  const rightStarD = renderStarShape(62, starY, 7.0, 10 - starTilt);

  return svgEl(
    'g',
    {
      'data-prop': 'celebration_banner',
      'data-art-style': 'classic_cel',
    },
    [
      renderClassicFestivalPole(-230, 0, uid),
      renderClassicFestivalPole(230, 1, uid),

      svgEl('g', { 'data-part': 'pennants' }, pennants),

      // Catenary hemp rope
      svgEl('g', { 'data-part': 'bunting-rope' }, [
        svgEl('path', {
          d: ropeD,
          fill: 'none',
          stroke: c.xeroxInk,
          'stroke-width': 4.4,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: ropeD,
          fill: 'none',
          stroke: c.ochreEarth,
          'stroke-width': 2.4,
          'stroke-linecap': 'round',
        }),
        xeroxSketchStroke(ropeD, {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.9,
          broken: true,
          dasharray: '4 4',
          opacity: 0.65,
        }),
      ]),

      // Central parchment ribbon crest ("HUZZAH!")
      svgEl('g', { 'data-part': 'ribbon-crest' }, [
        celPath(leftTailD, c.boardToothWarm, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxMedium,
        }),
        celPath(rightTailD, c.boardToothWarm, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxMedium,
        }),
        celPath(leftFoldD, c.cottagePlasterShadow, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        celPath(rightFoldD, c.cottagePlasterShadow, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        celPath(scrollBodyD, c.celBubbleFill, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxMedium,
        }),
        xeroxSketchStroke(innerBorderD, {
          stroke: c.antiqueGold,
          strokeWidth: 1.25,
          broken: true,
          dasharray: '6 3',
          opacity: 0.85,
        }),
        celPath(leftStarD, c.antiqueGold, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        celPath(rightStarD, c.antiqueGold, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        svgEl(
          'text',
          {
            x: 0,
            y: round2(-162.5 + crestBob),
            'text-anchor': 'middle',
            'font-family': TOKENS.classicCel.typography.fontFamilySerif,
            'font-size': 18,
            'font-weight': 'bold',
            'letter-spacing': '1.6',
            fill: c.xeroxInk,
          },
          'HUZZAH!'
        ),
      ]),
    ]
  );
}

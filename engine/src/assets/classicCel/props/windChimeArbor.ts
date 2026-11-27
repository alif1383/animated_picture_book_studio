import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  gouachePath,
  pencilFoliageScribbles,
  pencilGrassStrokes,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';
import { renderStarShape } from '../../props/shared';

/**
 * Renders a loose, painterly 1970s watercolor moonflower with sketchy sepia petal penwork
 * (zero digital neon glow halos).
 */
function renderClassicMoonflower(
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  lit: boolean
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'moonflower',
      transform: svgTransform({ x: cx, y: cy, rotate: rot, scale }),
    },
    [
      // Soft wet-on-wet cream-ochre watercolor wash behind lit bloom (subtle, non-neon)
      lit
        ? watercolorWashBlotches(
            [{ cx: 0, cy: 0, rx: 14.5, ry: 13.5, fill: c.warmAmberGlow, opacity: 0.24 }],
            { seed: Math.abs(Math.round(cx + cy)) + 3 }
          )
        : '',
      celPath(
        'M 0 -12.2 C 5 -14.2, 9.2 -8.2, 6.0 -3.0 C 12.0 -3.0, 14.2 4.0, 8.0 7.0 C 11.0 12.0, 4.0 15.0, 0 10.0 C -4.0 15.0, -11.0 12.0, -8.0 7.0 C -14.2 4.0, -12.0 -3.0, -6.0 -3.0 C -9.2 -8.2, -5 -14.2, 0 -12.2 Z',
        c.flowerCream,
        { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
      ),
      svgEl('circle', {
        cx: 0.5,
        cy: 0.7,
        r: 6.8,
        fill: c.mochiCreamShadow,
        opacity: 0.42,
      }),
      celPath(
        'M 0 -8.2 C 2.8 -5.8, 5.8 -3.8, 7.6 -1.4 C 4.8 1.0, 4.8 4.2, 5.2 7.2 C 1.8 5.8, -1.8 5.8, -5.2 7.2 C -4.8 4.2, -4.8 1.0, -7.6 -1.4 C -5.8 -3.8, -2.8 -5.8, 0 -8.2 Z',
        c.parchmentCream,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.8 }
      ),
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: 4.0,
        fill: lit ? c.warmAmberGlow : c.antiqueGold,
        stroke: c.xeroxInkSoft,
        'stroke-width': 0.95,
      }),
      svgEl('circle', {
        cx: -0.7,
        cy: -0.7,
        r: 1.7,
        fill: c.warmAmberCore,
      }),
    ]
  );
}

/**
 * Renders authentic 1970s hand-drawn chime ringing effects (`lit === true`):
 * thin broken dry-brush Xerox chime vibration lines + tiny flat hand-inked
 * 4-point parchment/gold sparkle star-crosses + a subtle wet-on-wet warm ochre dab
 * (zero digital neon blur rings!).
 */
function renderClassicChimeShimmer(frameIndex: number, variant: number): string {
  const c = TOKENS.classicCel.colors;

  const pulseA = steppedOscillate(frameIndex, 18, 1, variant);
  const pulseB = steppedOscillate(frameIndex, 18, 1, variant + 6);
  const pulseC = steppedOscillate(frameIndex, 24, 1, variant + 12);

  // Subtle wet-on-wet warm ochre wash dab right behind the ringing star catcher
  const subtleCatcherWash = watercolorWashBlotches(
    [
      {
        cx: 0,
        cy: -78,
        rx: round2(18 + pulseA * 2.2),
        ry: round2(16.5 + pulseB * 2.0),
        fill: c.warmAmberGlow,
        opacity: 0.24,
      },
    ],
    { seed: 19 }
  );

  // Thin hand-inked dry-brush acoustic vibration arcs flanking the tubes & star catcher
  const vibrationLines = [
    xeroxSketchStroke('M -26 -136 Q -36 -118, -28 -99', {
      stroke: c.parchmentCream,
      strokeWidth: 1.5,
      broken: true,
      opacity: round2(0.58 + pulseA * 0.28),
    }),
    xeroxSketchStroke('M -33 -142 Q -46 -118, -36 -93', {
      stroke: c.warmAmberGlow,
      strokeWidth: 1.15,
      dasharray: '5 5 3 4',
      opacity: round2(0.45 + pulseB * 0.26),
    }),
    xeroxSketchStroke('M 26 -136 Q 36 -118, 28 -99', {
      stroke: c.parchmentCream,
      strokeWidth: 1.5,
      broken: true,
      opacity: round2(0.58 + pulseB * 0.28),
    }),
    xeroxSketchStroke('M 33 -142 Q 46 -118, 36 -93', {
      stroke: c.warmAmberGlow,
      strokeWidth: 1.15,
      dasharray: '5 5 3 4',
      opacity: round2(0.45 + pulseC * 0.26),
    }),
    xeroxSketchStroke('M -17 -87 Q -23 -78, -16 -68 M 17 -87 Q 23 -78, 16 -68', {
      stroke: c.warmAmberCore,
      strokeWidth: 1.35,
      broken: true,
      opacity: round2(0.6 + pulseA * 0.24),
    }),
  ];

  const sparkleSpecs: ReadonlyArray<{
    bx: number;
    by: number;
    size: number;
    phase: number;
  }> = [
    { bx: -31, by: -148, size: 4.8, phase: 0 },
    { bx: 32, by: -144, size: 4.4, phase: 3 },
    { bx: -25, by: -89, size: 5.2, phase: 6 },
    { bx: 27, by: -84, size: 4.6, phase: 9 },
    { bx: -16, by: -64, size: 4.0, phase: 12 },
    { bx: 18, by: -67, size: 4.2, phase: 15 },
    { bx: 0, by: -162, size: 3.8, phase: 18 },
  ];

  const sparkles = sparkleSpecs.map((sp, i) => {
    const dx = steppedOscillate(frameIndex, 24, 2.0, variant + sp.phase);
    const dy = steppedOscillate(frameIndex, 18, 2.4, variant + sp.phase + 4);
    const twinkle = steppedOscillate(frameIndex, 12, 1, variant + sp.phase);
    const sx = round2(sp.bx + dx);
    const sy = round2(sp.by + dy);
    const r = round2(sp.size * (0.7 + (twinkle + 1) * 0.28));
    const color = i % 2 === 0 ? c.parchmentCream : c.warmAmberCore;
    const op = round2(0.58 + (twinkle + 1) * 0.2);

    return svgEl('g', { opacity: op }, [
      xeroxSketchStroke(
        `M ${sx} ${round2(sy - r)} L ${sx} ${round2(sy + r)} M ${round2(sx - r)} ${sy} L ${round2(sx + r)} ${sy}`,
        { stroke: color, strokeWidth: 1.4, opacity: 0.95 }
      ),
      svgEl('circle', { cx: sx, cy: sy, r: 1.15, fill: c.starGlow }),
    ]);
  });

  return svgEl('g', { 'data-part': 'chime-shimmer' }, [
    subtleCatcherWash,
    ...vibrationLines,
    ...sparkles,
  ]);
}

/**
 * Renders the flat analog cel-painted brass & silver wind-chime cluster
 * anchored at `(0, -178)` with raw Xerox toner outlines (`#xerox-ink`),
 * smooth 12 FPS sway, and dangling star catcher (`data-anchor="chime-catcher"`)
 * at `(0, -78)`.
 */
function renderClassicWindChimeCluster(
  frameIndex: number,
  lit: boolean,
  variant: number,
  pid: (name: string) => string
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const clusterSway = steppedOscillate(
    frameIndex,
    lit ? 18 : 38,
    lit ? 5.2 : 2.1,
    variant
  );

  const tubeSpecs: ReadonlyArray<{
    x: number;
    topY: number;
    bottomY: number;
    width: number;
    isGold: boolean;
    phase: number;
  }> = [
    { x: -17, topY: -142, bottomY: -104, width: 6.6, isGold: true, phase: 0 },
    { x: -6, topY: -144, bottomY: -93, width: 7.0, isGold: false, phase: 4 },
    { x: 6, topY: -143, bottomY: -97, width: 7.0, isGold: true, phase: 8 },
    { x: 17, topY: -141, bottomY: -109, width: 6.6, isGold: false, phase: 12 },
  ];

  const tubesSvg = tubeSpecs.map((tube, idx) => {
    const tubeSway = round2(
      steppedOscillate(
        frameIndex,
        lit ? 14 : 30,
        lit ? 5.4 : 2.0,
        variant + tube.phase
      ) +
        steppedOscillate(
          frameIndex,
          lit ? 9 : 20,
          lit ? 1.1 : 0.35,
          variant + idx * 5
        )
    );
    const halfW = round2(tube.width / 2);
    const xL = round2(tube.x - halfW);
    const xR = round2(tube.x + halfW);
    const midX = round2(tube.x + 0.7);

    const bodyD = `M ${xL} ${tube.topY + 2} Q ${tube.x} ${tube.topY - 1}, ${xR} ${tube.topY + 2} L ${xR} ${tube.bottomY - 2} Q ${tube.x} ${tube.bottomY + 1}, ${xL} ${tube.bottomY - 2} Z`;
    const shadowBandD = `M ${midX} ${tube.topY - 2} L ${round2(xR + 1)} ${tube.topY - 2} L ${round2(xR + 1)} ${tube.bottomY + 2} L ${midX} ${tube.bottomY + 2} Z`;
    const gleamBandD = `M ${round2(xL + 0.9)} ${tube.topY + 4} L ${round2(xL + 2.1)} ${tube.topY + 4} L ${round2(xL + 2.1)} ${tube.bottomY - 5} L ${round2(xL + 0.9)} ${tube.bottomY - 5} Z`;

    return svgEl(
      'g',
      {
        'data-part': `chime-tube-${idx + 1}`,
        transform: svgTransform({
          rotate: tubeSway,
          pivotX: tube.x,
          pivotY: -155,
        }),
      },
      [
        xeroxSketchStroke(`M ${tube.x} -155 L ${tube.x} ${tube.topY}`, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        }),
        celShadedShape({
          d: bodyD,
          baseFill: tube.isGold ? c.antiqueGold : c.stoneLight,
          shadowPaths: [shadowBandD],
          shadowFill: tube.isGold ? c.warmAmberDeep : c.stoneShadow,
          shadowOpacity: 0.78,
          highlightPaths: [gleamBandD],
          highlightFill: tube.isGold ? c.mochiGoldHighlight : c.parchmentCream,
          highlightOpacity: 0.88,
          clipId: pid(`tube-${idx + 1}-clip`),
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
      ]
    );
  });

  const catcherSway = round2(
    steppedOscillate(
      frameIndex,
      lit ? 16 : 34,
      lit ? 8.4 : 3.2,
      variant + 5
    ) +
      steppedOscillate(frameIndex, lit ? 10 : 22, lit ? 1.4 : 0.4, variant + 9)
  );
  const starSpin = round2(
    steppedOscillate(frameIndex, lit ? 18 : 42, lit ? 14 : 5.5, variant + 7)
  );

  return svgEl(
    'g',
    {
      'data-part': 'wind-chime-cluster',
      transform: svgTransform({
        rotate: clusterSway,
        pivotX: 0,
        pivotY: -178,
      }),
    },
    [
      xeroxSketchStroke('M 0 -184 L 0 -176', {
        stroke: c.ironDark,
        strokeWidth: 2.0,
        opacity: 0.95,
      }),
      svgEl('circle', {
        cx: 0,
        cy: -178,
        r: 2.8,
        fill: c.antiqueGold,
        stroke: c.xeroxInk,
        'stroke-width': s.xeroxFine,
        filter: svgUrl(TOKENS.classicCel.filters.ids.xeroxInk),
      }),
      celShadedShape({
        d: 'M -14 -171 C -9 -178, 8 -178, 14 -169 C 10 -161, -6 -160, -14 -167 C -8 -166, 3 -166, 7 -170 C 2 -173, -8 -173, -14 -171 Z',
        baseFill: c.moonCream,
        shadowPaths: ['M -14 -166 L 15 -166 L 15 -158 L -14 -158 Z'],
        shadowFill: c.moonShadow,
        shadowOpacity: 0.72,
        clipId: pid('crescent-clip'),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath(renderStarShape(4, -166.5, 4.6, 12), c.warmAmberCore, {
        stroke: c.xeroxInk,
        strokeWidth: 1.0,
      }),
      xeroxSketchStroke('M -10 -163 L -15 -155 M 10 -163 L 15 -155', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      celShadedShape({
        d: 'M -23 -157.5 Q 0 -159.5, 23 -157.5 L 22 -153 Q 0 -154.5, -22 -153 Z',
        baseFill: c.woodMid,
        shadowPaths: ['M -23 -155.2 L 23 -155.2 L 23 -152 L -23 -152 Z'],
        shadowFill: c.woodDark,
        shadowOpacity: 0.78,
        clipId: pid('crossbar-clip'),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      ...tubesSvg,
      svgEl(
        'g',
        {
          'data-part': 'wind-catcher',
          transform: svgTransform({
            rotate: catcherSway,
            pivotX: 0,
            pivotY: -155,
          }),
        },
        [
          xeroxSketchStroke('M 0 -153 L 0 -87', {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
          }),
          svgEl('ellipse', {
            cx: 0,
            cy: -119,
            rx: 5.4,
            ry: 3.0,
            fill: c.woodMid,
            stroke: c.xeroxInk,
            'stroke-width': s.xeroxFine,
            filter: svgUrl(TOKENS.classicCel.filters.ids.xeroxInk),
          }),
          // Flat analog cel 5-point golden star catcher at (0, -78) — paw-tap height for Mochi!
          svgEl(
            'g',
            {
              'data-anchor': 'chime-catcher',
              transform: svgTransform({ x: 0, y: -78, rotate: starSpin }),
            },
            [
              celShadedShape({
                d: renderStarShape(0, 0, 11.4, 0),
                baseFill: c.antiqueGold,
                shadowPaths: ['M 0 -12 L 13 -12 L 13 13 L -2 13 Z'],
                shadowFill: c.warmAmberDeep,
                shadowOpacity: 0.48,
                highlightPaths: ['M -12 -12 L 1 -12 L -2 2 L -12 4 Z'],
                highlightFill: c.mochiGoldHighlight,
                highlightOpacity: 0.78,
                clipId: pid('star-catcher-clip'),
                stroke: c.xeroxInk,
                strokeWidth: s.xeroxFine,
              }),
              svgEl('path', {
                d: renderStarShape(0, 0, 4.8, 0),
                fill: c.warmAmberCore,
                opacity: 0.88,
              }),
            ]
          ),
        ]
      ),
    ]
  );
}

/**
 * Renders the Classic 1970s–1980s Disney rustic hand-inked garden wind-chime arbor
 * (`'wind_chime_arbor'`) with soft blotchy wet-on-wet watercolor ivy (`watercolorWashBlotches`),
 * crisp expressive *Robin Hood* pencil foliage scribbles (`pencilFoliageScribbles`),
 * hand-drawn `pencilGrassStrokes` tufts at both post bases, painterly mottled walnut timber,
 * cream moonflowers, and flat analog cel-painted brass/silver chimes (`#xerox-ink`) swaying
 * smoothly at 12 FPS.
 *
 * Local origin `(0, 0)` sits at ground center between the two trellis posts.
 * Open walk-through: `x: -68..68`, arch apex `y: -186`.
 * Bounds: `~x: -108..108, y: -234..6`.
 * Star wind-catcher anchor (`data-anchor="chime-catcher"`): `~(0, -78)`.
 */
export function renderClassicWindChimeArbor(
  options: PropRenderOptions
): string {
  const { frameIndex = 0, lit = false, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-arbor-${name}${safeSuffix}`;

  const outerArchClipId = pid('outer-arch-clip');
  const innerArchClipId = pid('inner-arch-clip');

  const outerArchD =
    'M -94 1 L -94 -130 C -94 -192, -46 -214, 0 -214 C 46 -214, 94 -192, 94 -130 L 94 1 L 86 1 L 86 -130 C 86 -184, 42 -206, 0 -206 C -42 -206, -86 -184, -86 -130 L -86 1 Z';
  const innerArchD =
    'M -76 1 L -76 -130 C -76 -180, -38 -194, 0 -194 C 38 -194, 76 -180, 76 -130 L 76 1 L 68 1 L 68 -130 C 68 -174, 34 -186, 0 -186 C -34 -186, -68 -174, -68 -130 L -68 1 Z';

  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: outerArchClipId }, svgEl('path', { d: outerArchD })),
    svgEl('clipPath', { id: innerArchClipId }, svgEl('path', { d: innerArchD })),
  ]);

  const flowerSway = (idx: number): number =>
    steppedOscillate(frameIndex, 44, 1.9, idx * 6 + variant);

  const latticeYs = [-24, -48, -72, -96, -120];
  const leftLatticeLines = latticeYs
    .map(
      (ly) =>
        `M -87 ${ly} L -75 ${ly} M -87 ${ly + 11} L -75 ${ly - 11} M -87 ${ly - 11} L -75 ${ly + 11}`
    )
    .join(' ');
  const rightLatticeLines = latticeYs
    .map(
      (ly) =>
        `M 75 ${ly} L 87 ${ly} M 75 ${ly + 11} L 87 ${ly - 11} M 75 ${ly - 11} L 87 ${ly + 11}`
    )
    .join(' ');

  const moonflowers: ReadonlyArray<{
    x: number;
    y: number;
    scale: number;
    rot: number;
  }> = [
    { x: -85, y: -86, scale: 0.86, rot: -18 },
    { x: -72, y: -162, scale: 0.98, rot: -12 },
    { x: -32, y: -206, scale: 1.04, rot: -6 },
    { x: 24, y: -210, scale: 1.0, rot: 10 },
    { x: 74, y: -158, scale: 0.96, rot: 16 },
    { x: 85, y: -78, scale: 0.84, rot: 20 },
  ];

  return svgEl(
    'g',
    {
      'data-prop': 'wind_chime_arbor',
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [
      clipDefs,

      // 1. Ground contact shadows, wet-on-wet mossy ground smudges & Robin-Hood pencil grass tufts
      svgEl('g', { 'data-part': 'ground-tufts' }, [
        celContactShadow(-81, 1.8, 24, 4.2, 0.36),
        celContactShadow(81, 1.8, 24, 4.2, 0.36),
        watercolorWashBlotches(
          [
            { cx: -84, cy: 1.5, rx: 18, ry: 5.5, fill: c.grassNightDeep, opacity: 0.56 },
            { cx: -74, cy: 2.0, rx: 12, ry: 4.0, fill: c.oliveCanopy, opacity: 0.42 },
            { cx: 84, cy: 1.5, rx: 18, ry: 5.5, fill: c.grassNightDeep, opacity: 0.56 },
            { cx: 74, cy: 2.0, rx: 12, ry: 4.0, fill: c.oliveCanopy, opacity: 0.42 },
          ],
          { seed: 7 + variant }
        ),
        pencilGrassStrokes(
          [
            { x: -91, y: 2.5, width: 22, height: 10, blades: 5, lean: -0.35 },
            { x: -71, y: 3.0, width: 16, height: 8, blades: 4, lean: 0.35 },
            { x: 71, y: 3.0, width: 16, height: 8, blades: 4, lean: -0.3 },
            { x: 91, y: 2.5, width: 22, height: 10, blades: 5, lean: 0.38 },
          ],
          {
            stroke: c.pencilOliveCharcoal,
            strokeWidth: 1.2,
            opacity: 0.86,
            seed: 13 + variant,
          }
        ),
      ]),

      // 2. Rustic hand-inked garden timber pillars, diamond lattice & mottled watercolor archway
      svgEl('g', { 'data-part': 'wooden-archway' }, [
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 3.5,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
        }),
        xeroxSketchStroke(leftLatticeLines, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.72,
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 3.5,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
        }),
        xeroxSketchStroke(rightLatticeLines, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.72,
        }),

        // Radial wooden crossbars spanning between inner & outer curved arch ribs
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 4.6,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          stroke: c.woodLit,
          'stroke-width': 1.7,
          'stroke-linecap': 'round',
          opacity: 0.72,
        }),

        // Outer rustic timber arch rib with clipped wet-on-wet wood-tone mottling
        gouachePath(outerArchD, c.woodMid, { softEdge: false }),
        svgEl('g', { 'clip-path': svgUrl(outerArchClipId) }, [
          watercolorWashBlotches(
            [
              { cx: -90, cy: -52, rx: 10, ry: 44, fill: c.woodLit, opacity: 0.58 },
              { cx: -76, cy: -162, rx: 22, ry: 32, fill: c.russetEarth, opacity: 0.5 },
              { cx: -18, cy: -210, rx: 36, ry: 12, fill: c.woodLit, opacity: 0.55 },
              { cx: 52, cy: -196, rx: 32, ry: 18, fill: c.woodDark, opacity: 0.65 },
              { cx: 90, cy: -72, rx: 12, ry: 68, fill: c.woodDark, opacity: 0.68 },
              { cx: -90, cy: -10, rx: 12, ry: 16, fill: c.woodDark, opacity: 0.55 },
            ],
            { seed: 29 }
          ),
        ]),
        xeroxSketchStroke(outerArchD, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxMedium,
          opacity: 0.92,
          feather: true,
        }),

        // Inner rustic timber arch rib framing open walk-through (x: -68..68, apex y: -186)
        gouachePath(innerArchD, c.woodMid, { softEdge: false }),
        svgEl('g', { 'clip-path': svgUrl(innerArchClipId) }, [
          watercolorWashBlotches(
            [
              { cx: -72, cy: -62, rx: 9, ry: 52, fill: c.woodLit, opacity: 0.52 },
              { cx: -40, cy: -176, rx: 28, ry: 18, fill: c.russetEarth, opacity: 0.45 },
              { cx: 40, cy: -176, rx: 30, ry: 18, fill: c.woodDark, opacity: 0.64 },
              { cx: 72, cy: -64, rx: 10, ry: 62, fill: c.woodDark, opacity: 0.7 },
            ],
            { seed: 37 }
          ),
        ]),
        xeroxSketchStroke(innerArchD, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxMedium,
          opacity: 0.92,
          feather: true,
        }),

        // Center-top walnut chime mount bracket under inner arch apex
        celPath(
          'M -12 -186 Q 0 -189, 12 -186 L 9 -182 Q 0 -184, -9 -182 Z',
          c.woodDark,
          { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
        ),

        // Carved timber footing shoes anchoring both posts cleanly at y = 0
        celPath('M -96 -5 L -66 -5 L -65 2 Q -81 3.5, -97 2 Z', c.woodDark, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 66 -5 L 96 -5 L 97 2 Q 81 3.5, 65 2 Z', c.woodDark, {
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),

        // Loose sketchy Xerox wood-grain scratches & bark knots along posts and arch
        xeroxSketchStroke(
          [
            'M -91 -12 L -91 -122',
            'M -88 -34 L -88 -88',
            'M -72 -14 L -72 -124',
            'M 72 -16 L 72 -120',
            'M 90 -14 L 90 -118',
            'M 88 -42 L 88 -96',
            'M -48 -198 Q 0 -211, 48 -198',
            'M -34 -188 Q 0 -192, 34 -188',
          ].join(' '),
          {
            stroke: c.xeroxInk,
            strokeWidth: s.sketchLine,
            broken: true,
            feather: true,
            opacity: 0.62,
          }
        ),
      ]),

      // 3. Soft Wet-on-Wet Watercolor Ivy Washes + Crisp Robin-Hood Pencil Foliage Scribbles
      svgEl('g', { 'data-part': 'garden-vines' }, [
        // Overlapping cloudy wet-on-wet watercolor ivy puddles (sage / olive / deep-teal shifts)
        watercolorWashBlotches(
          [
            // Left pillar & shoulder washes
            { cx: -86, cy: -34, rx: 15, ry: 12, rotate: -14, fill: c.foliageShadow, opacity: 0.78 },
            { cx: -84, cy: -84, rx: 17, ry: 17, rotate: 10, fill: c.foliageMid, opacity: 0.8 },
            { cx: -87, cy: -88, rx: 12, ry: 11, fill: c.sageFoliage, opacity: 0.56 },
            { cx: -85, cy: -158, rx: 19, ry: 23, rotate: -12, fill: c.foliageShadow, opacity: 0.82 },
            { cx: -82, cy: -164, rx: 14, ry: 16, fill: c.oliveCanopy, opacity: 0.7 },
            // Arch crown lush dappled watercolor canopy (stays inside y: -234..6)
            { cx: -52, cy: -202, rx: 23, ry: 15, rotate: -18, fill: c.foliageShadow, opacity: 0.82 },
            { cx: -48, cy: -206, rx: 17, ry: 11, fill: c.oliveCanopy, opacity: 0.72 },
            { cx: -16, cy: -214, rx: 26, ry: 15, rotate: -4, fill: c.foliageMid, opacity: 0.82 },
            { cx: -12, cy: -218, rx: 18, ry: 10, fill: c.sageFoliage, opacity: 0.66 },
            { cx: 20, cy: -214, rx: 26, ry: 15, rotate: 6, fill: c.foliageShadow, opacity: 0.82 },
            { cx: 18, cy: -217, rx: 17, ry: 10, fill: c.foliageRim, opacity: 0.54 },
            { cx: 54, cy: -201, rx: 23, ry: 15, rotate: 16, fill: c.foliageShadow, opacity: 0.82 },
            { cx: 50, cy: -204, rx: 16, ry: 11, fill: c.oliveCanopy, opacity: 0.68 },
            // Right shoulder & pillar washes
            { cx: 85, cy: -156, rx: 19, ry: 23, rotate: 12, fill: c.foliageShadow, opacity: 0.82 },
            { cx: 83, cy: -160, rx: 14, ry: 16, fill: c.foliageMid, opacity: 0.7 },
            { cx: 85, cy: -82, rx: 17, ry: 17, rotate: -8, fill: c.foliageShadow, opacity: 0.8 },
            { cx: 83, cy: -85, rx: 12, ry: 12, fill: c.oliveCanopy, opacity: 0.68 },
            { cx: 86, cy: -32, rx: 14, ry: 11, rotate: 14, fill: c.foliageShadow, opacity: 0.76 },
          ],
          { seed: 71 + variant }
        ),
        // Crisp expressive Robin-Hood pencil leaf-cluster scribbles, twigs & stipple dots right on top
        pencilFoliageScribbles(
          [
            { cx: -86, cy: -34, rx: 13, ry: 10, density: 0.9 },
            { cx: -84, cy: -84, rx: 14, ry: 14, density: 1.0 },
            { cx: -84, cy: -158, rx: 16, ry: 19, density: 1.1 },
            { cx: -48, cy: -203, rx: 20, ry: 13, density: 1.1 },
            { cx: 0, cy: -214, rx: 28, ry: 13, density: 1.15 },
            { cx: 50, cy: -202, rx: 20, ry: 13, density: 1.1 },
            { cx: 84, cy: -156, rx: 16, ry: 19, density: 1.1 },
            { cx: 84, cy: -82, rx: 14, ry: 14, density: 1.0 },
            { cx: 86, cy: -32, rx: 12, ry: 10, density: 0.85 },
          ],
          {
            stroke: c.pencilOliveCharcoal,
            strokeWidth: 1.1,
            opacity: 0.84,
            seed: 79 + variant,
          }
        ),
        // Twining hand-inked vine stems & delicate hanging corner tendrils
        xeroxSketchStroke(
          [
            'M -86 -8 C -96 -34, -68 -58, -88 -88 C -96 -116, -70 -142, -82 -172 C -70 -202, -32 -218, 0 -214 C 34 -218, 72 -200, 82 -170 C 70 -140, 96 -114, 86 -84 C 68 -56, 96 -32, 84 -8',
            'M -68 -148 Q -58 -142, -55 -130',
            'M 68 -146 Q 58 -140, 56 -128',
          ].join(' '),
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: 1.75,
            broken: true,
            opacity: 0.82,
          }
        ),
      ]),

      // 4. Flat analog cel-painted brass/silver wind chimes (pivot 0, -178; star catcher 0, -78)
      renderClassicWindChimeCluster(frameIndex, lit, variant, pid),

      // 5. Crisp hand-inked vibration arcs & sparkle crosses when lit (zero neon rings!)
      lit ? renderClassicChimeShimmer(frameIndex, variant) : '',

      // 6. Painterly cream moonflowers blooming along the vines
      svgEl(
        'g',
        { 'data-part': 'moonflower-blooms' },
        moonflowers.map((f, idx) =>
          renderClassicMoonflower(
            f.x,
            f.y,
            f.scale,
            round2(f.rot + flowerSway(idx)),
            lit
          )
        )
      ),
    ]
  );
}

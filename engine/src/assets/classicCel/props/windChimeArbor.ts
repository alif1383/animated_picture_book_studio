import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  gouachePath,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';
import { renderStarShape } from '../../props/shared';

/**
 * Renders a classic 2-tone cel/gouache heart-shaped ivy leaf with moonlit rim edge.
 */
function renderClassicHeartLeaf(
  cx: number,
  cy: number,
  rot: number,
  scale: number,
  rimLit: boolean
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  return svgEl(
    'g',
    {
      transform: svgTransform({ x: cx, y: cy, rotate: rot, scale }),
    },
    [
      celPath(
        'M 0 0 C -8 -3, -12 -11, -6 -16 C -2 -19, 0 -15, 0 -13 C 0 -15, 2 -19, 6 -16 C 12 -11, 8 -3, 0 0 Z',
        rimLit ? c.foliageLit : c.foliageMid,
        { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
      ),
      // Shaded right half of leaf
      svgEl('path', {
        d: 'M 0 0 C 0 -5, 0 -10, 0 -13 C 0 -15, 2 -19, 6 -16 C 12 -11, 8 -3, 0 0 Z',
        fill: c.foliageShadow,
        opacity: 0.48,
      }),
      // Crisp moonlight rim highlight along left leaf edge
      rimLit
        ? svgEl('path', {
            d: 'M -2.5 -2.5 C -7.5 -5.5, -9.5 -10.5, -5.5 -14.5',
            fill: 'none',
            stroke: c.foliageRim,
            'stroke-width': 1.4,
            'stroke-linecap': 'round',
            opacity: 0.9,
          })
        : '',
      // Delicate central stem vein
      svgEl('path', {
        d: 'M 0 -2 Q 0 -7.5, 0 -12.5',
        fill: 'none',
        stroke: c.foliageRim,
        'stroke-width': 0.85,
        'stroke-linecap': 'round',
        opacity: 0.55,
      }),
    ]
  );
}

/**
 * Renders a luminous painted cream moonflower with warm golden center and soft aura.
 */
function renderClassicMoonflower(
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  lit: boolean,
  auraGradUrl: string
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  return svgEl(
    'g',
    {
      'data-part': 'moonflower',
      transform: svgTransform({ x: cx, y: cy, rotate: rot, scale }),
    },
    [
      // Soft optical moonlight halo behind bloom
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: lit ? 19 : 14,
        fill: auraGradUrl,
        filter: lit ? softGlowFilter : undefined,
        opacity: lit ? 0.9 : 0.45,
      }),
      // Outer 5 scalloped cream gouache petals
      celPath(
        'M 0 -12.5 C 5 -14.5, 9.5 -8.5, 6.2 -3.2 C 12.2 -3.2, 14.5 4.2, 8.2 7.2 C 11.2 12.2, 4.2 15.2, 0 10.2 C -4.2 15.2, -11.2 12.2, -8.2 7.2 C -14.5 4.2, -12.2 -3.2, -6.2 -3.2 C -9.5 -8.5, -5 -14.5, 0 -12.5 Z',
        c.flowerCream,
        { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
      ),
      // Soft shaded petal cup depth
      svgEl('circle', {
        cx: 0.6,
        cy: 0.8,
        r: 7.4,
        fill: c.mochiCreamShadow,
        opacity: 0.45,
      }),
      // Inner luminous cel-cream star petals
      celPath(
        'M 0 -8.5 C 3 -6, 6 -4, 8 -1.5 C 5 1, 5 4.5, 5.5 7.5 C 2 6, -2 6, -5.5 7.5 C -5 4.5, -5 1, -8 -1.5 C -6 -4, -3 -6, 0 -8.5 Z',
        c.celCream,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.85 }
      ),
      // Warm glowing golden pollen heart
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: 4.2,
        fill: c.warmAmberGlow,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: 1.0 }),
      }),
      svgEl('circle', {
        cx: -0.7,
        cy: -0.7,
        r: 2.1,
        fill: c.warmAmberCore,
      }),
    ]
  );
}

/**
 * Renders soft optical fairy-dust golden shimmer rings & 4-point classic animation
 * star sparkles around the ringing chimes (`lit === true`) at smooth 12 FPS.
 */
function renderClassicChimeShimmer(
  frameIndex: number,
  variant: number,
  shimmerGradUrl: string
): string {
  const c = TOKENS.classicCel.colors;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  // Smooth 12 FPS pulsing acoustic shimmer waves
  const pulseA = steppedOscillate(frameIndex, 18, 1, variant);
  const pulseB = steppedOscillate(frameIndex, 18, 1, variant + 6);
  const pulseC = steppedOscillate(frameIndex, 24, 1, variant + 12);

  const ring1R = round2(18 + (pulseA + 1) * 4.5);
  const ring2R = round2(26 + (pulseB + 1) * 5.5);

  const acousticArcs = [
    // Luminous golden halation aura centered on the star catcher at (0, -78)
    svgEl('circle', {
      cx: 0,
      cy: -78,
      r: round2(30 + pulseA * 3),
      fill: shimmerGradUrl,
      opacity: round2(0.75 + pulseA * 0.15),
    }),
    // Concentric fairy-dust shimmer rings around star catcher
    svgEl('circle', {
      cx: 0,
      cy: -78,
      r: ring1R,
      fill: 'none',
      stroke: c.warmAmberCore,
      'stroke-width': 1.5,
      'stroke-dasharray': '7 5',
      opacity: round2(0.72 - pulseA * 0.22),
    }),
    svgEl('circle', {
      cx: 0,
      cy: -78,
      r: ring2R,
      fill: 'none',
      stroke: c.warmAmberGlow,
      'stroke-width': 1.2,
      'stroke-dasharray': '4 7',
      opacity: round2(0.55 - pulseB * 0.2),
    }),
    // Left & right ringing golden resonance arcs flanking the metallic chime tubes
    svgEl('path', {
      d: 'M -27 -136 Q -38 -118, -29 -98',
      fill: 'none',
      stroke: c.warmAmberCore,
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      opacity: round2(0.68 + pulseA * 0.24),
    }),
    svgEl('path', {
      d: 'M -35 -143 Q -49 -118, -38 -91',
      fill: 'none',
      stroke: c.warmAmberGlow,
      'stroke-width': 1.3,
      'stroke-dasharray': '5 5',
      'stroke-linecap': 'round',
      opacity: round2(0.52 + pulseB * 0.24),
    }),
    svgEl('path', {
      d: 'M 27 -136 Q 38 -118, 29 -98',
      fill: 'none',
      stroke: c.warmAmberCore,
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      opacity: round2(0.68 + pulseB * 0.24),
    }),
    svgEl('path', {
      d: 'M 35 -143 Q 49 -118, 38 -91',
      fill: 'none',
      stroke: c.warmAmberGlow,
      'stroke-width': 1.3,
      'stroke-dasharray': '5 5',
      'stroke-linecap': 'round',
      opacity: round2(0.52 + pulseC * 0.24),
    }),
  ];

  // Classic Disney 4-point diamond fairy-dust sparkles drifting gently at 12 FPS
  const sparkleSpecs: ReadonlyArray<{
    bx: number;
    by: number;
    size: number;
    phase: number;
  }> = [
    { bx: -32, by: -148, size: 5.2, phase: 0 },
    { bx: 33, by: -144, size: 4.8, phase: 3 },
    { bx: -26, by: -89, size: 5.6, phase: 6 },
    { bx: 28, by: -84, size: 5.0, phase: 9 },
    { bx: -17, by: -64, size: 4.4, phase: 12 },
    { bx: 19, by: -67, size: 4.6, phase: 15 },
    { bx: 0, by: -162, size: 4.2, phase: 18 },
  ];

  const sparkles = sparkleSpecs.map((sp, i) => {
    const dx = steppedOscillate(frameIndex, 24, 2.2, variant + sp.phase);
    const dy = steppedOscillate(frameIndex, 18, 2.6, variant + sp.phase + 4);
    const twinkle = steppedOscillate(frameIndex, 12, 1, variant + sp.phase);
    const sx = round2(sp.bx + dx);
    const sy = round2(sp.by + dy);
    const r = round2(sp.size * (0.72 + (twinkle + 1) * 0.28));
    const inner = round2(r * 0.26);
    const fill = i % 2 === 0 ? c.starGlow : c.warmAmberCore;

    return svgEl('path', {
      d: `M ${sx} ${round2(sy - r)} Q ${round2(sx + inner)} ${round2(sy - inner)}, ${round2(sx + r)} ${sy} Q ${round2(sx + inner)} ${round2(sy + inner)}, ${sx} ${round2(sy + r)} Q ${round2(sx - inner)} ${round2(sy + inner)}, ${round2(sx - r)} ${sy} Q ${round2(sx - inner)} ${round2(sy - inner)}, ${sx} ${round2(sy - r)} Z`,
      fill,
      opacity: round2(0.55 + (twinkle + 1) * 0.22),
    });
  });

  return svgEl(
    'g',
    { 'data-part': 'chime-shimmer', filter: softGlowFilter },
    [...acousticArcs, ...sparkles]
  );
}

/**
 * Renders the gleaming 2-tone cel metallic gold & silver wind-chime cluster
 * anchored at `(0, -178)` with smooth 12 FPS sway and dangling star catcher
 * (`data-anchor="chime-catcher"`) at `(0, -78)`.
 */
function renderClassicWindChimeCluster(
  frameIndex: number,
  lit: boolean,
  variant: number,
  pid: (name: string) => string
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  // Smooth 12 FPS ("on twos") gentle sway; livelier melodic swing when lit
  const clusterSway = steppedOscillate(
    frameIndex,
    lit ? 18 : 38,
    lit ? 5.2 : 2.1,
    variant
  );

  // 4 staggered gleaming metallic cel tubes (alternating gold & moonlit silver)
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
    const midX = round2(tube.x + 0.6);

    const bodyD = `M ${xL} ${tube.topY + 2} Q ${tube.x} ${tube.topY - 1}, ${xR} ${tube.topY + 2} L ${xR} ${tube.bottomY - 2} Q ${tube.x} ${tube.bottomY + 1}, ${xL} ${tube.bottomY - 2} Z`;
    const shadowBandD = `M ${midX} ${tube.topY - 2} L ${round2(xR + 1)} ${tube.topY - 2} L ${round2(xR + 1)} ${tube.bottomY + 2} L ${midX} ${tube.bottomY + 2} Z`;
    const gleamBandD = `M ${round2(xL + 0.9)} ${tube.topY + 3} L ${round2(xL + 2.3)} ${tube.topY + 3} L ${round2(xL + 2.3)} ${tube.bottomY - 4} L ${round2(xL + 0.9)} ${tube.bottomY - 4} Z`;

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
        // Crisp taut suspension filament
        svgEl('path', {
          d: `M ${tube.x} -155 L ${tube.x} ${tube.topY}`,
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
          }),
        }),
        // 2-tone cel metallic tube with shadow plane & crisp specular gleam
        celShadedShape({
          d: bodyD,
          baseFill: tube.isGold ? c.mochiGold : c.stoneLight,
          shadowPaths: [shadowBandD],
          shadowFill: tube.isGold ? c.warmAmberDeep : c.stoneShadow,
          shadowOpacity: 0.85,
          highlightPaths: [gleamBandD],
          highlightFill: tube.isGold ? c.mochiGoldHighlight : c.celCream,
          highlightOpacity: 0.94,
          clipId: pid(`tube-${idx + 1}-clip`),
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxFine,
        }),
        // Crisp metallic top rim highlight ellipse
        svgEl('ellipse', {
          cx: tube.x,
          cy: round2(tube.topY + 1.5),
          rx: round2(halfW - 0.6),
          ry: 1.1,
          fill: tube.isGold ? c.warmAmberCore : c.celCream,
          opacity: 0.85,
        }),
      ]
    );
  });

  // Trailing follow-through sway on center cord & dangling star catcher (pivot y = -155)
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
      // Top wrought-iron hook & gleaming brass eye-ring at (0, -178)
      svgEl('path', {
        d: 'M 0 -184 L 0 -176',
        fill: 'none',
        ...celStrokeAttrs({ stroke: c.ironDark, strokeWidth: 2.0 }),
      }),
      svgEl('circle', {
        cx: 0,
        cy: -178,
        r: 2.8,
        fill: c.mochiGold,
        ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: s.xeroxFine }),
      }),
      // Gleaming 2-tone cel crescent moon & tucked star crown hanger
      celShadedShape({
        d: 'M -14 -171 C -9 -178, 8 -178, 14 -169 C 10 -161, -6 -160, -14 -167 C -8 -166, 3 -166, 7 -170 C 2 -173, -8 -173, -14 -171 Z',
        baseFill: c.moonCream,
        shadowPaths: ['M -14 -166 L 15 -166 L 15 -158 L -14 -158 Z'],
        shadowFill: c.moonShadow,
        shadowOpacity: 0.72,
        highlightPaths: ['M -10 -177 L 6 -177 L 4 -173 L -10 -173 Z'],
        highlightFill: c.starGlow,
        highlightOpacity: 0.9,
        clipId: pid('crescent-clip'),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath(renderStarShape(4, -166.5, 4.6, 12), c.warmAmberCore, {
        stroke: c.xeroxInk,
        strokeWidth: 1.0,
      }),
      // Suspension cords down to walnut crossbar
      svgEl('path', {
        d: 'M -10 -163 L -15 -155 M 10 -163 L 15 -155',
        fill: 'none',
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      // Walnut & brass suspension crossbar at y = -155
      celShadedShape({
        d: 'M -23 -157.5 Q 0 -159.5, 23 -157.5 L 22 -153 Q 0 -154.5, -22 -153 Z',
        baseFill: c.woodMid,
        shadowPaths: ['M -23 -155.2 L 23 -155.2 L 23 -152 L -23 -152 Z'],
        shadowFill: c.woodDark,
        shadowOpacity: 0.75,
        highlightPaths: ['M -22 -159.5 L 22 -159.5 L 22 -157 L -22 -157 Z'],
        highlightFill: c.woodLit,
        highlightOpacity: 0.7,
        clipId: pid('crossbar-clip'),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // 4 gleaming metallic chime tubes
      ...tubesSvg,
      // Center clapper & dangling star wind-catcher (resting center at 0, -78)
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
          svgEl('path', {
            d: 'M 0 -153 L 0 -87',
            fill: 'none',
            ...celStrokeAttrs({
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
            }),
          }),
          // Carved walnut clapper striker disc nestled among the tubes
          svgEl('ellipse', {
            cx: 0,
            cy: -119,
            rx: 5.5,
            ry: 3.1,
            fill: c.woodMid,
            ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: s.xeroxFine }),
          }),
          svgEl('ellipse', {
            cx: -1,
            cy: -120,
            rx: 3,
            ry: 1.1,
            fill: c.woodLit,
            opacity: 0.7,
          }),
          // Gleaming 2-tone cel 5-point star wind-catcher at (0, -78) — paw-tap height for Mochi!
          svgEl(
            'g',
            {
              'data-anchor': 'chime-catcher',
              transform: svgTransform({ x: 0, y: -78, rotate: starSpin }),
            },
            [
              lit
                ? svgEl('circle', {
                    cx: 0,
                    cy: 0,
                    r: 13.5,
                    fill: c.warmAmberGlow,
                    filter: softGlowFilter,
                    opacity: 0.42,
                  })
                : '',
              celShadedShape({
                d: renderStarShape(0, 0, 11.4, 0),
                baseFill: c.mochiGold,
                shadowPaths: ['M 0 -12 L 13 -12 L 13 13 L -2 13 Z'],
                shadowFill: c.warmAmberDeep,
                shadowOpacity: 0.52,
                highlightPaths: ['M -12 -12 L 1 -12 L -2 2 L -12 4 Z'],
                highlightFill: c.mochiGoldHighlight,
                highlightOpacity: 0.85,
                clipId: pid('star-catcher-clip'),
                stroke: c.xeroxInk,
                strokeWidth: s.xeroxFine,
              }),
              // Inner gleaming facet star
              svgEl('path', {
                d: renderStarShape(0, 0, 5.2, 0),
                fill: c.warmAmberCore,
                opacity: 0.9,
              }),
              svgEl('circle', {
                cx: -1.8,
                cy: -2.0,
                r: 1.4,
                fill: c.celCream,
              }),
            ]
          ),
        ]
      ),
    ]
  );
}

/**
 * Renders the Classic 1970s–1980s Disney painted walnut-wood garden wind-chime arbor
 * (`'wind_chime_arbor'`) draped with layered dark-emerald moonlit ivy, luminous cream
 * moonflowers, gleaming 2-tone cel metallic gold/silver chime tubes swaying smoothly
 * at 12 FPS, and soft fairy-dust golden shimmer rings (`#cel-soft-glow`) when `lit: true`.
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

  const woodGradId = pid('wood-grad');
  const shimmerGradId = pid('shimmer-grad');
  const flowerAuraId = pid('flower-aura');
  const outerArchClipId = pid('outer-arch-clip');
  const innerArchClipId = pid('inner-arch-clip');

  const defs = svgEl('defs', {}, [
    // Painted walnut timber gouache wash
    svgEl(
      'linearGradient',
      { id: woodGradId, x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.woodLit }),
        svgEl('stop', { offset: '45%', 'stop-color': c.woodMid }),
        svgEl('stop', { offset: '100%', 'stop-color': c.woodDark }),
      ]
    ),
    // Soft radial golden fairy-dust shimmer aura
    svgEl(
      'radialGradient',
      { id: shimmerGradId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberCore,
          'stop-opacity': 0.52,
        }),
        svgEl('stop', {
          offset: '52%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.22,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0,
        }),
      ]
    ),
    // Soft luminous moonflower aura
    svgEl(
      'radialGradient',
      { id: flowerAuraId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.starGlow,
          'stop-opacity': 0.5,
        }),
        svgEl('stop', {
          offset: '60%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.16,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0,
        }),
      ]
    ),
  ]);

  // Gentle 12 FPS breeze rustle for blooming moonflowers
  const flowerSway = (idx: number): number =>
    steppedOscillate(frameIndex, 44, 1.9, idx * 6 + variant);

  // Diamond trellis lattice rungs along left & right vertical posts
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

  // Heart-shaped ivy leaves distributed around trellis pillars & crown
  const heartLeaves: ReadonlyArray<{
    x: number;
    y: number;
    rot: number;
    scale: number;
    rimLit?: boolean;
  }> = [
    { x: -91, y: -32, rot: -54, scale: 0.78, rimLit: true },
    { x: -72, y: -56, rot: 46, scale: 0.72 },
    { x: -93, y: -112, rot: -62, scale: 0.85, rimLit: true },
    { x: -64, y: -142, rot: 125, scale: 0.74 },
    { x: -83, y: -180, rot: -38, scale: 0.92, rimLit: true },
    { x: -52, y: -207, rot: -20, scale: 0.88, rimLit: true },
    { x: -6, y: -215, rot: -6, scale: 0.86, rimLit: true },
    { x: 48, y: -206, rot: 22, scale: 0.88 },
    { x: 82, y: -178, rot: 40, scale: 0.92, rimLit: true },
    { x: 64, y: -140, rot: -128, scale: 0.74 },
    { x: 92, y: -108, rot: 60, scale: 0.84 },
    { x: 72, y: -52, rot: -48, scale: 0.72 },
    { x: 91, y: -28, rot: 52, scale: 0.78 },
  ];

  // 6 luminous moonflowers framing pillars and arch crown
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

  const outerArchD =
    'M -94 1 L -94 -130 C -94 -192, -46 -214, 0 -214 C 46 -214, 94 -192, 94 -130 L 94 1 L 86 1 L 86 -130 C 86 -184, 42 -206, 0 -206 C -42 -206, -86 -184, -86 -130 L -86 1 Z';
  const innerArchD =
    'M -76 1 L -76 -130 C -76 -180, -38 -194, 0 -194 C 38 -194, 76 -180, 76 -130 L 76 1 L 68 1 L 68 -130 C 68 -174, 34 -186, 0 -186 C -34 -186, -68 -174, -68 -130 L -68 1 Z';

  return svgEl(
    'g',
    {
      'data-prop': 'wind_chime_arbor',
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [
      defs,

      // 1. Ground contact shadows & painted moonlit grass tufts anchoring posts at y = 0..5
      svgEl('g', { 'data-part': 'ground-tufts' }, [
        celContactShadow(-81, 1.8, 24, 4.4, 0.36),
        celContactShadow(81, 1.8, 24, 4.4, 0.36),
        svgEl('path', {
          d: 'M -95 3 Q -98 -4, -100 -9 M -89 4 Q -91 -5, -87 -11 M -74 4 Q -72 -4, -67 -8 M 68 4 Q 72 -4, 75 -9 M 84 4 Q 87 -5, 91 -11 M 95 3 Q 98 -3, 100 -8',
          fill: 'none',
          stroke: c.grassNightDeep,
          'stroke-width': 2.6,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: 'M -94 3 Q -97 -4, -99 -8 M -88 3 Q -89 -4, -86 -10 M 70 3 Q 73 -3, 75 -8 M 86 3 Q 88 -4, 91 -9',
          fill: 'none',
          stroke: c.foliageRim,
          'stroke-width': 1.2,
          'stroke-linecap': 'round',
          opacity: 0.72,
        }),
      ]),

      // 2. Painted walnut-wood trellis pillars, diamond lattice & arched crown
      svgEl('g', { 'data-part': 'wooden-archway' }, [
        // Left & right diamond lattice bars (dark shadow stroke + mid walnut fill + sepia ink)
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 3.6,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 2.0,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 3.6,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 2.0,
          'stroke-linecap': 'round',
        }),

        // Radial wooden crossbars spanning between inner & outer curved arch ribs
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 4.8,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          stroke: c.woodLit,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          opacity: 0.72,
        }),

        // Outer walnut arch rib with 2-tone gouache shadow & moonlight rim highlight
        celShadedShape({
          d: outerArchD,
          baseFill: svgUrl(woodGradId),
          shadowPaths: [
            'M 10 -216 L 98 -216 L 98 4 L 84 4 L 84 -140 Q 60 -196, 10 -206 Z',
          ],
          shadowFill: c.woodDark,
          shadowOpacity: 0.52,
          highlightPaths: [
            'M -95 -130 C -95 -193, -46 -215, 0 -215 L 0 -211 C -44 -211, -90 -190, -90 -130 L -90 1 L -95 1 Z',
          ],
          highlightFill: c.woodLit,
          highlightOpacity: 0.65,
          clipId: outerArchClipId,
          stroke: c.xeroxInkSoft,
          strokeWidth: s.xeroxMedium,
        }),

        // Inner walnut arch rib framing the open walk-through (x: -68..68, apex y: -186)
        celShadedShape({
          d: innerArchD,
          baseFill: svgUrl(woodGradId),
          shadowPaths: [
            'M -70 -130 C -70 -175, -34 -188, 0 -188 C 34 -188, 70 -175, 70 -130 L 70 1 L 67 1 L 67 -130 C 67 -172, 33 -184, 0 -184 C -33 -184, -67 -172, -67 -130 L -67 1 Z',
          ],
          shadowFill: c.woodDark,
          shadowOpacity: 0.65,
          highlightPaths: [
            'M -76 -130 C -76 -180, -38 -194, 0 -194 L 0 -191 C -36 -191, -73 -178, -73 -130 L -73 1 L -76 1 Z',
          ],
          highlightFill: c.woodLit,
          highlightOpacity: 0.55,
          clipId: innerArchClipId,
          stroke: c.xeroxInkSoft,
          strokeWidth: s.xeroxMedium,
        }),

        // Center-top walnut chime mount bracket under inner arch apex
        celPath(
          'M -12 -186 Q 0 -189, 12 -186 L 9 -182 Q 0 -184, -9 -182 Z',
          c.woodDark,
          { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
        ),

        // Carved timber footing shoes anchoring both posts cleanly at y = 0
        celPath(
          'M -96 -5 L -66 -5 L -65 2 Q -81 3.5, -97 2 Z',
          c.woodDark,
          { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        celPath(
          'M 66 -5 L 96 -5 L 97 2 Q 81 3.5, 65 2 Z',
          c.woodDark,
          { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),

        // Sketchy hand-inked wood-grain accents along posts and arch
        svgEl('path', {
          d: 'M -90 -18 L -90 -116 M -72 -14 L -72 -122 M 72 -14 L 72 -122 M 90 -18 L 90 -116 M -46 -197 Q 0 -211, 46 -197',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.woodLit,
            strokeWidth: s.sketchLine,
            dasharray: '9 5 4 6',
            opacity: 0.52,
          }),
        }),
      ]),

      // 3. Layered painted dark-emerald ivy foliage clusters & moonlit heart leaves
      svgEl('g', { 'data-part': 'garden-vines' }, [
        // Deep gouache shadow foliage backing masses on shoulders & crown
        gouachePath(
          'M -98 -144 C -104 -164, -92 -185, -74 -186 C -67 -175, -63 -158, -74 -146 C -84 -138, -94 -136, -98 -144 Z',
          c.foliageShadow,
          { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        gouachePath(
          'M -95 -148 C -99 -163, -88 -180, -75 -181 C -71 -173, -68 -159, -76 -149 C -84 -143, -92 -142, -95 -148 Z',
          c.foliageMid,
          { softEdge: false }
        ),
        // Arch crown foliage mass (up to ~y: -229, well inside y: -234..6)
        gouachePath(
          'M -66 -198 C -58 -218, -35 -227, -14 -219 C 0 -230, 28 -229, 44 -216 C 60 -218, 74 -205, 67 -190 C 52 -184, 34 -186, 18 -192 C 2 -186, -24 -186, -44 -190 C -58 -188, -70 -190, -66 -198 Z',
          c.foliageShadow,
          { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        gouachePath(
          'M -60 -201 C -52 -216, -32 -223, -14 -216 C 0 -226, 25 -225, 40 -214 C 53 -215, 64 -204, 59 -193 C 46 -188, 30 -190, 16 -195 C 1 -190, -24 -190, -42 -193 C -53 -192, -62 -195, -60 -201 Z',
          c.foliageMid,
          { softEdge: false }
        ),
        // Cool moonlit gouache crown rim highlights
        gouachePath(
          'M -52 -208 C -42 -218, -24 -221, -10 -215 C 4 -223, 24 -222, 36 -213 C 22 -215, 6 -214, -8 -209 C -24 -212, -40 -212, -52 -208 Z',
          c.foliageLit,
          { softEdge: false, opacity: 0.85 }
        ),
        // Right shoulder foliage cluster
        gouachePath(
          'M 74 -184 C 92 -182, 104 -161, 98 -142 C 93 -134, 80 -138, 72 -146 C 63 -158, 66 -175, 74 -184 Z',
          c.foliageShadow,
          { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        gouachePath(
          'M 75 -179 C 89 -177, 98 -160, 93 -146 C 89 -140, 80 -142, 74 -149 C 68 -159, 69 -173, 75 -179 Z',
          c.foliageMid,
          { softEdge: false }
        ),
        // Mid-pillar leafy ivy clusters
        gouachePath(
          'M -97 -74 C -102 -89, -89 -103, -74 -97 C -66 -86, -70 -68, -82 -66 C -91 -65, -95 -68, -97 -74 Z',
          c.foliageShadow,
          { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        gouachePath(
          'M -93 -76 C -96 -87, -86 -97, -76 -92 C -71 -84, -74 -72, -83 -70 C -89 -69, -92 -72, -93 -76 Z',
          c.foliageLit,
          { softEdge: false, opacity: 0.8 }
        ),
        gouachePath(
          'M 74 -93 C 89 -99, 101 -85, 96 -70 C 93 -62, 82 -62, 74 -68 C 68 -74, 68 -87, 74 -93 Z',
          c.foliageShadow,
          { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
        ),
        gouachePath(
          'M 76 -89 C 87 -93, 95 -83, 91 -72 C 89 -67, 81 -67, 76 -72 C 72 -76, 72 -85, 76 -89 Z',
          c.foliageMid,
          { softEdge: false }
        ),

        // Twining woody ivy vine stems & inner corner tendrils
        svgEl('path', {
          d: 'M -86 -8 C -96 -34, -68 -58, -88 -88 C -96 -116, -70 -142, -82 -172 C -70 -202, -32 -218, 0 -214 C 34 -218, 72 -200, 82 -170 C 70 -140, 96 -114, 86 -84 C 68 -56, 96 -32, 84 -8',
          fill: 'none',
          ...celStrokeAttrs({ stroke: c.foliageShadow, strokeWidth: 3.4 }),
        }),
        svgEl('path', {
          d: 'M -86 -8 C -96 -34, -68 -58, -88 -88 C -96 -116, -70 -142, -82 -172 C -70 -202, -32 -218, 0 -214 C 34 -218, 72 -200, 82 -170 C 70 -140, 96 -114, 86 -84 C 68 -56, 96 -32, 84 -8',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.foliageLit,
            strokeWidth: 1.5,
            opacity: 0.78,
          }),
        }),
        svgEl('path', {
          d: 'M -68 -148 Q -58 -142, -55 -130 M 68 -146 Q 58 -140, 56 -128',
          fill: 'none',
          ...celStrokeAttrs({ stroke: c.foliageMid, strokeWidth: 2.0 }),
        }),

        // Individual 2-tone heart-shaped ivy leaves with moonlight rims
        ...heartLeaves.map((leaf) =>
          renderClassicHeartLeaf(
            leaf.x,
            leaf.y,
            leaf.rot,
            leaf.scale,
            Boolean(leaf.rimLit)
          )
        ),
      ]),

      // 4. Gleaming 2-tone metallic wind chime cluster (pivot 0, -178; star catcher 0, -78)
      renderClassicWindChimeCluster(frameIndex, lit, variant, pid),

      // 5. Soft fairy-dust golden shimmer rings & sparkles (#cel-soft-glow) when lit
      lit
        ? renderClassicChimeShimmer(frameIndex, variant, svgUrl(shimmerGradId))
        : '',

      // 6. Luminous cream moonflowers blooming along the vines
      svgEl(
        'g',
        { 'data-part': 'moonflower-blooms' },
        moonflowers.map((f, idx) =>
          renderClassicMoonflower(
            f.x,
            f.y,
            f.scale,
            round2(f.rot + flowerSway(idx)),
            lit,
            svgUrl(flowerAuraId)
          )
        )
      ),
    ]
  );
}

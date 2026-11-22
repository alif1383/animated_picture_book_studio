import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import { renderStarShape } from './shared';

export interface WindChimeArborOptions {
  frameIndex?: number;
  lit?: boolean;
  variant?: number;
  fillMask?: string;
}

/**
 * Renders a hand-drawn heart-shaped garden leaf oriented from its stem at `(0, 0)`.
 */
function renderHeartLeaf(
  cx: number,
  cy: number,
  rot: number,
  scale: number,
  fill: string,
  fillMask?: string
): string {
  const { charcoalOutline, paperWarm } = TOKENS.colors;
  const { outlineThin, annotationPencil } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      transform: svgTransform({ x: cx, y: cy, rotate: rot, scale }),
    },
    [
      crayonPath(
        'M 0 0 C -8 -3, -12 -11, -6 -16 C -2 -19, 0 -15, 0 -13 C 0 -15, 2 -19, 6 -16 C 12 -11, 8 -3, 0 0 Z',
        fill,
        {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
          paperUnderlay: true,
        }
      ),
      svgEl('path', {
        d: 'M 0 -2 Q 0 -8, 0 -13',
        fill: 'none',
        stroke: paperWarm,
        'stroke-width': annotationPencil,
        'stroke-linecap': TOKENS.strokes.linecap,
        opacity: 0.55,
      }),
    ]
  );
}

/**
 * Renders a luminous two-layered crayon moonflower with warm glowing center.
 */
function renderMoonflower(
  cx: number,
  cy: number,
  scale: number,
  rot: number,
  lit: boolean,
  fillMask?: string
): string {
  const { paperWarm, starWhite, warmMoon, bananaYellow, charcoalOutline, faintPencil } =
    TOKENS.colors;
  const { outlineThin, annotationPencil } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'moonflower',
      transform: svgTransform({ x: cx, y: cy, rotate: rot, scale }),
    },
    [
      // Soft flat crayon moonlight aura (no gradients)
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: lit ? 16 : 13.5,
        fill: warmMoon,
        opacity: lit ? 0.28 : 0.14,
      }),
      lit
        ? svgEl('circle', {
            cx: 0,
            cy: 0,
            r: 18,
            fill: 'none',
            stroke: warmMoon,
            'stroke-width': annotationPencil,
            'stroke-dasharray': '3 5',
            opacity: 0.65,
          })
        : '',
      // Outer 5 scalloped crayon petals (warm paper cream)
      crayonPath(
        'M 0 -12 C 5 -14, 9 -8, 6 -3 C 12 -3, 14 4, 8 7 C 11 12, 4 15, 0 10 C -4 15, -11 12, -8 7 C -14 4, -12 -3, -6 -3 C -9 -8, -5 -14, 0 -12 Z',
        paperWarm,
        {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
          paperUnderlay: true,
        }
      ),
      // Inner luminous star petals (star white)
      crayonPath(
        'M 0 -8.5 C 3 -6, 6 -4, 8 -1.5 C 5 1, 5 4.5, 5.5 7.5 C 2 6, -2 6, -5.5 7.5 C -5 4.5, -5 1, -8 -1.5 C -6 -4, -3 -6, 0 -8.5 Z',
        starWhite,
        {
          stroke: faintPencil,
          strokeWidth: 1.1,
          mask: fillMask,
        }
      ),
      // Glowing golden moonflower center
      svgEl('circle', {
        cx: 0,
        cy: 0,
        r: 4.4,
        fill: warmMoon,
        stroke: charcoalOutline,
        'stroke-width': 1.2,
      }),
      svgEl('circle', {
        cx: -0.6,
        cy: -0.6,
        r: 2.3,
        fill: bananaYellow,
      }),
      svgEl('circle', {
        cx: 1.3,
        cy: 1.1,
        r: 0.75,
        fill: charcoalOutline,
        opacity: 0.75,
      }),
    ]
  );
}

/**
 * Renders stepped 6 FPS golden sparkle ticks and concentric hand-drawn pencil shimmer arcs
 * around the wind chimes when actively ringing (`lit === true`).
 */
function renderChimeShimmer(frameIndex: number, variant: number): string {
  const { warmMoon, bananaYellow, starWhite } = TOKENS.colors;
  const { outlineThin, annotationPencil } = TOKENS.strokes;
  const pulsePhase = ((frameIndex % 3) + 3) % 3;

  const arcParts: string[] = [
    // Left inner & outer shimmer arcs
    svgEl('path', {
      d: 'M -26 -134 Q -36 -118, -28 -100',
      fill: 'none',
      stroke: warmMoon,
      'stroke-width': outlineThin,
      'stroke-dasharray': '5 4',
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: pulsePhase === 0 ? 0.92 : 0.55,
    }),
    svgEl('path', {
      d: 'M -33 -140 Q -46 -118, -36 -94',
      fill: 'none',
      stroke: bananaYellow,
      'stroke-width': annotationPencil,
      'stroke-dasharray': '3 6',
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: pulsePhase === 1 ? 0.85 : 0.42,
    }),
    // Right inner & outer shimmer arcs
    svgEl('path', {
      d: 'M 26 -134 Q 36 -118, 28 -100',
      fill: 'none',
      stroke: warmMoon,
      'stroke-width': outlineThin,
      'stroke-dasharray': '5 4',
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: pulsePhase === 1 ? 0.92 : 0.55,
    }),
    svgEl('path', {
      d: 'M 33 -140 Q 46 -118, 36 -94',
      fill: 'none',
      stroke: bananaYellow,
      'stroke-width': annotationPencil,
      'stroke-dasharray': '3 6',
      'stroke-linecap': TOKENS.strokes.linecap,
      opacity: pulsePhase === 2 ? 0.85 : 0.42,
    }),
    // Soft glow ring behind the dangling star catcher at (0, -78)
    svgEl('circle', {
      cx: 0,
      cy: -78,
      r: pulsePhase === 0 ? 17 : 15,
      fill: warmMoon,
      opacity: 0.24,
    }),
    svgEl('circle', {
      cx: 0,
      cy: -78,
      r: pulsePhase === 2 ? 23 : 20,
      fill: 'none',
      stroke: bananaYellow,
      'stroke-width': annotationPencil,
      'stroke-dasharray': '4 5',
      opacity: 0.72,
    }),
  ];

  // Hand-drawn 4-point golden sparkle ticks around the chimes & star catcher
  const sparkleBases: ReadonlyArray<readonly [number, number, number]> = [
    [-31, -148, 5.2],
    [32, -144, 4.8],
    [-25, -88, 5.5],
    [27, -84, 5.0],
    [-16, -64, 4.2],
    [18, -68, 4.6],
  ];

  const sparkleParts = sparkleBases.map(([bx, by, baseSize], i) => {
    const jx = round2(bx + deterministicJitter(frameIndex + i * 7, variant, 2.2));
    const jy = round2(by + deterministicJitter(frameIndex + i * 11, variant + 3, 2.2));
    const active = (frameIndex + i) % 2 === 0;
    const r = round2(active ? baseSize * 1.15 : baseSize * 0.72);
    const color = i % 3 === 0 ? starWhite : i % 2 === 0 ? bananaYellow : warmMoon;

    return svgEl('g', { opacity: active ? 0.95 : 0.6 }, [
      svgEl('path', {
        d: `M ${jx} ${round2(jy - r)} L ${jx} ${round2(jy + r)} M ${round2(jx - r)} ${jy} L ${round2(jx + r)} ${jy}`,
        fill: 'none',
        stroke: color,
        'stroke-width': active ? 2.0 : 1.5,
        'stroke-linecap': TOKENS.strokes.linecap,
      }),
      svgEl('circle', {
        cx: jx,
        cy: jy,
        r: active ? 1.6 : 1.1,
        fill: starWhite,
      }),
    ]);
  });

  return svgEl('g', { 'data-part': 'chime-shimmer' }, [...arcParts, ...sparkleParts]);
}

/**
 * Renders the hanging brass & silver wind chime cluster anchored at `(0, -178)`,
 * with tubes spanning down to `y = -93` and the star wind-catcher centered at `(0, -78)`.
 */
function renderWindChimeCluster(
  frameIndex: number,
  lit: boolean,
  variant: number,
  fillMask?: string
): string {
  const {
    charcoalOutline,
    warmMoon,
    ochreLight,
    nightcapWhite,
    bananaYellow,
    starWhite,
    woodBrown,
  } = TOKENS.colors;
  const { outlineThin, annotationPencil } = TOKENS.strokes;

  // Whole chime gently sways at 6 FPS; livelier swing when ringing (`lit`)
  const clusterSway = steppedOscillate(
    frameIndex,
    lit ? 10 : 20,
    lit ? 5.2 : 2.2,
    variant
  );

  // 4 staggered brass & silver cylindrical chime tubes
  const tubeSpecs: ReadonlyArray<{
    x: number;
    topY: number;
    bottomY: number;
    width: number;
    fill: string;
    phase: number;
  }> = [
    { x: -17, topY: -142, bottomY: -104, width: 6.4, fill: ochreLight, phase: 0 },
    { x: -6, topY: -144, bottomY: -93, width: 6.8, fill: warmMoon, phase: 2 },
    { x: 6, topY: -143, bottomY: -97, width: 6.8, fill: nightcapWhite, phase: 4 },
    { x: 17, topY: -141, bottomY: -109, width: 6.4, fill: ochreLight, phase: 6 },
  ];

  const tubesSvg = tubeSpecs.map((tube, idx) => {
    const tubeSway = round2(
      steppedOscillate(
        frameIndex,
        lit ? 8 : 16,
        lit ? 5.6 : 2.1,
        variant + tube.phase
      ) + deterministicJitter(frameIndex + idx * 5, variant, lit ? 1.4 : 0.45)
    );
    const halfW = round2(tube.width / 2);
    const xL = round2(tube.x - halfW);
    const xR = round2(tube.x + halfW);

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
        // Suspension cord from crossbar to tube top
        svgEl('path', {
          d: `M ${tube.x} -155 L ${tube.x} ${tube.topY}`,
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
        }),
        // Cylindrical chime tube body
        crayonPath(
          `M ${xL} ${tube.topY + 2} Q ${tube.x} ${tube.topY - 1}, ${xR} ${tube.topY + 2} L ${xR} ${tube.bottomY - 2} Q ${tube.x} ${tube.bottomY + 1}, ${xL} ${tube.bottomY - 2} Z`,
          tube.fill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        // Hand-drawn metallic sheen streak (flat crayon dashed highlight, zero gradients)
        svgEl('path', {
          d: `M ${round2(tube.x - 1.1)} ${tube.topY + 5} L ${round2(tube.x - 1.1)} ${tube.bottomY - 6}`,
          fill: 'none',
          stroke: starWhite,
          'stroke-width': 1.5,
          'stroke-dasharray': '7 4 3 4',
          'stroke-linecap': TOKENS.strokes.linecap,
          opacity: 0.82,
        }),
      ]
    );
  });

  // Trailing sway on the center cord & dangling star wind-catcher (pivot at crossbar y=-155)
  const catcherSway = round2(
    steppedOscillate(
      frameIndex,
      lit ? 9 : 18,
      lit ? 8.5 : 3.4,
      variant + 3
    ) + deterministicJitter(frameIndex + 23, variant, lit ? 1.2 : 0.4)
  );
  const starSpin = round2(
    steppedOscillate(frameIndex, lit ? 10 : 22, lit ? 14 : 6, variant + 5)
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
      // Top hook & suspension loop at (0, -178)
      svgEl('path', {
        d: 'M 0 -184 L 0 -176',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 0,
        cy: -178,
        r: 2.8,
        fill: warmMoon,
        stroke: charcoalOutline,
        'stroke-width': 1.5,
      }),
      // Crescent moon & tiny tucked star top hanger
      crayonPath(
        'M -14 -171 C -9 -178, 8 -178, 14 -169 C 10 -161, -6 -160, -14 -167 C -8 -166, 3 -166, 7 -170 C 2 -173, -8 -173, -14 -171 Z',
        warmMoon,
        {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
          paperUnderlay: true,
        }
      ),
      crayonPath(renderStarShape(4, -166.5, 4.6, 12), bananaYellow, {
        stroke: charcoalOutline,
        strokeWidth: 1.2,
        mask: fillMask,
      }),
      // Short hanger cords to horizontal suspension bar
      svgEl('path', {
        d: 'M -10 -163 L -15 -155 M 10 -163 L 15 -155',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
      }),
      // Wooden & brass wind-chime crossbar at y = -155
      crayonPath(
        'M -23 -157.5 Q 0 -159.5, 23 -157.5 L 22 -153 Q 0 -154.5, -22 -153 Z',
        woodBrown,
        {
          stroke: charcoalOutline,
          strokeWidth: outlineThin,
          mask: fillMask,
          paperUnderlay: true,
        }
      ),
      // Staggered chime tubes
      ...tubesSvg,
      // Center clapper bead & dangling star wind-catcher (resting center at 0, -78)
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
            d: 'M 0 -153 L 0 -86',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
          }),
          // Small striker / clapper disc nestled among the tubes
          svgEl('ellipse', {
            cx: 0,
            cy: -119,
            rx: 5.5,
            ry: 3.2,
            fill: woodBrown,
            stroke: charcoalOutline,
            'stroke-width': 1.5,
          }),
          // Dangling 5-point star wind-catcher at (0, -78)
          svgEl(
            'g',
            {
              'data-anchor': 'chime-catcher',
              transform: svgTransform({ x: 0, y: -78, rotate: starSpin }),
            },
            [
              crayonPath(renderStarShape(0, 0, 11, 0), warmMoon, {
                stroke: charcoalOutline,
                strokeWidth: outlineThin,
                mask: fillMask,
                paperUnderlay: true,
              }),
              svgEl('path', {
                d: renderStarShape(0, 0, 5.4, 0),
                fill: bananaYellow,
                stroke: 'none',
              }),
              svgEl('circle', {
                cx: -1.6,
                cy: -1.8,
                r: 1.5,
                fill: starWhite,
                opacity: 0.9,
              }),
            ]
          ),
        ]
      ),
    ]
  );
}

/**
 * Renders a hand-drawn crayon wooden garden wind-chime arbor (`'wind_chime_arbor'`)
 * draped with dark-emerald vines, heart-shaped leaves, luminous moonflowers, and
 * animated brass & silver garden wind chimes hanging at paw-tapping height.
 *
 * Local origin `(0, 0)` sits at ground center between the two trellis posts.
 * Local bounds: `x: -100..100` (`width: 200`), `y: -225..6` (`height: 231`).
 * Open archway interior: `x: -68..68`, arch apex `y: -186`.
 * Wind-chime pivot: `(0, -178)`; tubes: `y: -144..-93`; star catcher center: `(0, -78)`.
 */
export function renderWindChimeArbor(
  options: WindChimeArborOptions = {}
): string {
  const { frameIndex = 0, lit = false, variant = 1, fillMask } = options;
  const {
    charcoalOutline,
    paperWarm,
    emeraldFrond,
    treeGreen,
    grassGreen,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin, annotationPencil } = TOKENS.strokes;

  const woodFill = getPatternFill('crayonWoodBrown');
  const foliageFill = getPatternFill('crayonTreeGreen');
  const emeraldFill = getPatternFill('crayonEmeraldFrond');

  // Subtle stepped breeze rustle for top flowers
  const flowerSway = (idx: number): number =>
    steppedOscillate(frameIndex, 24, 2.0, idx * 4 + variant);

  // Lattice rungs along left & right vertical trellis pillars
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

  // Heart-shaped garden leaves distributed around pillars and arch crown
  const heartLeaves: ReadonlyArray<{
    x: number;
    y: number;
    rot: number;
    scale: number;
    useEmerald?: boolean;
  }> = [
    { x: -91, y: -32, rot: -54, scale: 0.78, useEmerald: true },
    { x: -72, y: -56, rot: 46, scale: 0.72 },
    { x: -92, y: -112, rot: -62, scale: 0.85, useEmerald: true },
    { x: -64, y: -142, rot: 125, scale: 0.74, useEmerald: true },
    { x: -82, y: -180, rot: -38, scale: 0.92 },
    { x: -52, y: -206, rot: -20, scale: 0.88, useEmerald: true },
    { x: -6, y: -214, rot: -6, scale: 0.86 },
    { x: 48, y: -206, rot: 22, scale: 0.88, useEmerald: true },
    { x: 82, y: -178, rot: 40, scale: 0.92 },
    { x: 64, y: -140, rot: -128, scale: 0.74, useEmerald: true },
    { x: 92, y: -108, rot: 60, scale: 0.84, useEmerald: true },
    { x: 72, y: -52, rot: -48, scale: 0.72 },
    { x: 91, y: -28, rot: 52, scale: 0.78 },
  ];

  // 6 luminous moonflowers framing the trellis & crown
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
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // 1. Subtle ground grass tufts anchoring the left & right posts at y = 0..5
      svgEl('g', { 'data-part': 'ground-tufts' }, [
        svgEl('path', {
          d: 'M -94 3 Q -97 -4, -99 -9 M -88 4 Q -90 -5, -86 -11 M -74 4 Q -72 -4, -67 -8 M 68 4 Q 72 -4, 75 -9 M 84 4 Q 87 -5, 91 -11 M 94 3 Q 97 -3, 99 -8',
          fill: 'none',
          stroke: grassGreen,
          'stroke-width': 2.2,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
        svgEl('path', {
          d: 'M -90 5 Q -85 2, -70 4 M 70 4 Q 84 2, 91 5',
          fill: 'none',
          stroke: treeGreen,
          'stroke-width': 2.0,
          'stroke-linecap': TOKENS.strokes.linecap,
          opacity: 0.8,
        }),
      ]),

      // 2. Wooden garden trellis pillars, diamond lattice & curved archway crown
      svgEl('g', { 'data-part': 'wooden-archway' }, [
        // Inner diamond trellis lattice bars (left & right pillars)
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          stroke: TOKENS.colors.woodBrown,
          'stroke-width': 3.2,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
        svgEl('path', {
          d: leftLatticeLines,
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          stroke: TOKENS.colors.woodBrown,
          'stroke-width': 3.2,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
        svgEl('path', {
          d: rightLatticeLines,
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
        }),

        // Radial wooden crossbars spanning between inner & outer curved arch ribs
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          stroke: TOKENS.colors.woodBrown,
          'stroke-width': 4.4,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
        svgEl('path', {
          d: 'M -70 -142 L -91 -150 M -54 -168 L -71 -186 M -28 -182 L -36 -206 M 0 -186 L 0 -213 M 28 -182 L 36 -206 M 54 -168 L 71 -186 M 70 -142 L 91 -150',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: annotationPencil }),
        }),

        // Outer wooden arch rib (continuous from left base over apex to right base)
        crayonPath(
          'M -94 1 L -94 -130 C -94 -192, -46 -214, 0 -214 C 46 -214, 94 -192, 94 -130 L 94 1 L 86 1 L 86 -130 C 86 -184, 42 -206, 0 -206 C -42 -206, -86 -184, -86 -130 L -86 1 Z',
          woodFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),

        // Inner wooden arch rib framing the wide open archway (x: -68..68, apex y: -186)
        crayonPath(
          'M -76 1 L -76 -130 C -76 -180, -38 -194, 0 -194 C 38 -194, 76 -180, 76 -130 L 76 1 L 68 1 L 68 -130 C 68 -174, 34 -186, 0 -186 C -34 -186, -68 -174, -68 -130 L -68 1 Z',
          woodFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineMedium,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),

        // Center-top wooden chime mount peg under the inner arch apex
        crayonPath(
          'M -12 -186 Q 0 -189, 12 -186 L 9 -182 Q 0 -184, -9 -182 Z',
          woodFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),

        // Ground footing shoes anchoring both trellis bases cleanly at y = 0
        crayonPath(
          'M -96 -5 L -66 -5 L -65 2 Q -81 3.5, -97 2 Z',
          woodFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        crayonPath(
          'M 66 -5 L 96 -5 L 97 2 Q 81 3.5, 65 2 Z',
          woodFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),

        // Paper-tooth wood grain highlights along posts and arch
        svgEl('path', {
          d: 'M -90 -18 L -90 -116 M -72 -14 L -72 -122 M 72 -14 L 72 -122 M 90 -18 L 90 -116 M -46 -196 Q 0 -211, 46 -196',
          fill: 'none',
          stroke: paperWarm,
          'stroke-width': 1.6,
          'stroke-dasharray': '7 6 3 5',
          'stroke-linecap': TOKENS.strokes.linecap,
          opacity: 0.48,
        }),
      ]),

      // 3. Lush draped garden vines, foliage clusters & heart-shaped leaves
      svgEl('g', { 'data-part': 'garden-vines' }, [
        // Soft organic foliage tufts hugging shoulders and crown
        crayonPath(
          'M -96 -144 C -101 -162, -90 -182, -74 -184 C -68 -174, -64 -158, -74 -146 C -84 -138, -93 -136, -96 -144 Z',
          foliageFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        crayonPath(
          'M -64 -198 C -56 -216, -34 -223, -14 -216 C 0 -226, 28 -226, 42 -214 C 58 -216, 72 -204, 66 -190 C 52 -184, 34 -186, 18 -192 C 2 -186, -24 -186, -44 -190 C -58 -188, -68 -190, -64 -198 Z',
          foliageFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        crayonPath(
          'M 74 -182 C 90 -180, 101 -160, 96 -142 C 92 -134, 80 -138, 72 -146 C 64 -158, 66 -174, 74 -182 Z',
          foliageFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        // Mid-pillar leafy clusters
        crayonPath(
          'M -96 -74 C -100 -88, -88 -102, -74 -96 C -66 -86, -70 -68, -82 -66 C -90 -65, -94 -68, -96 -74 Z',
          foliageFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),
        crayonPath(
          'M 74 -92 C 88 -98, 99 -84, 95 -70 C 92 -62, 82 -62, 74 -68 C 68 -74, 68 -86, 74 -92 Z',
          foliageFill,
          {
            stroke: charcoalOutline,
            strokeWidth: outlineThin,
            mask: fillMask,
            paperUnderlay: true,
          }
        ),

        // Twining dark-emerald vine stems & gentle inner corner tendrils
        svgEl('path', {
          d: 'M -86 -8 C -96 -34, -68 -58, -88 -88 C -96 -116, -70 -142, -82 -172 C -70 -202, -32 -218, 0 -214 C 34 -218, 72 -200, 82 -170 C 70 -140, 96 -114, 86 -84 C 68 -56, 96 -32, 84 -8',
          fill: 'none',
          stroke: emeraldFrond,
          'stroke-width': 3.2,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),
        svgEl('path', {
          d: 'M -68 -148 Q -58 -142, -55 -130 M 68 -146 Q 58 -140, 56 -128',
          fill: 'none',
          stroke: treeGreen,
          'stroke-width': 2.2,
          'stroke-linecap': TOKENS.strokes.linecap,
        }),

        // Paper-tooth foliage highlight curls
        svgEl('path', {
          d: 'M -46 -208 Q -18 -219, 12 -212 M 26 -208 Q 48 -212, 58 -198',
          fill: 'none',
          stroke: paperWarm,
          'stroke-width': 1.8,
          'stroke-dasharray': '4 5',
          'stroke-linecap': TOKENS.strokes.linecap,
          opacity: 0.55,
        }),

        // Individual heart-shaped garden leaves
        ...heartLeaves.map((leaf) =>
          renderHeartLeaf(
            leaf.x,
            leaf.y,
            leaf.rot,
            leaf.scale,
            leaf.useEmerald ? emeraldFill : foliageFill,
            fillMask
          )
        ),
      ]),

      // 4. Hanging brass & silver wind chimes (pivot 0, -178; star catcher at 0, -78)
      renderWindChimeCluster(frameIndex, lit, variant, fillMask),

      // 5. Golden ringing sparkle ticks & concentric pencil shimmer arcs when `lit` is true
      lit ? renderChimeShimmer(frameIndex, variant) : '',

      // 6. Luminous moonflowers blooming along the vines
      svgEl(
        'g',
        { 'data-part': 'moonflower-blooms' },
        moonflowers.map((f, idx) =>
          renderMoonflower(
            f.x,
            f.y,
            f.scale,
            round2(f.rot + flowerSway(idx)),
            lit,
            fillMask
          )
        )
      ),
    ]
  );
}
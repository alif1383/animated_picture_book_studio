import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  gouachePath,
  pencilGrassStrokes,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { WatercolorBlotch } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

interface EnclosedFireflySpec {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  periodX: number;
  periodY: number;
  phase: number;
  coreR: number;
}

interface ReleasedFireflySpec {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  period: number;
  phase: number;
  coreR: number;
}

// 2 warm amber fireflies bobbing gently inside the corked jar (`lit: false`)
const ENCLOSED_FIREFLIES: readonly EnclosedFireflySpec[] = [
  {
    baseX: -4.2,
    baseY: -22.5,
    ampX: 3.2,
    ampY: 3.4,
    periodX: 20,
    periodY: 14,
    phase: 0,
    coreR: 2.15,
  },
  {
    baseX: 4.4,
    baseY: -15.2,
    ampX: 3.0,
    ampY: 3.0,
    periodX: 18,
    periodY: 16,
    phase: 7,
    coreR: 2.0,
  },
];

// 4 lively golden fireflies swirling upward out of the uncorked jar in staggered 12 FPS figure-eight arcs (`lit: true`)
const RELEASED_FIREFLIES: readonly ReleasedFireflySpec[] = [
  {
    baseX: 1.0,
    baseY: -57.0,
    ampX: 9.8,
    ampY: 5.2,
    period: 24,
    phase: 0,
    coreR: 2.35,
  },
  {
    baseX: -10.0,
    baseY: -74.5,
    ampX: 10.5,
    ampY: 6.0,
    period: 28,
    phase: 7,
    coreR: 2.55,
  },
  {
    baseX: 10.5,
    baseY: -89.5,
    ampX: 10.0,
    ampY: 5.8,
    period: 26,
    phase: 13,
    coreR: 2.45,
  },
  {
    baseX: -1.5,
    baseY: -104.5,
    ampX: 12.0,
    ampY: 5.2,
    period: 30,
    phase: 19,
    coreR: 2.6,
  },
];

/**
 * Renders an authentic 1970s–1980s Classic Hand-Drawn Cel vintage apothecary/mason
 * firefly lantern jar (`'firefly_lantern_jar'`) resting on a small mossy stepping
 * stone: translucent analog cel glass inked with `#xerox-ink` (`celPath`) and loose
 * `xeroxSketchStroke` glass glint ticks & rustic twine wrap, dark wrought-iron wire
 * collar & arched bail handle, tapered wooden cork stopper, and an interactive `lit`
 * toggle (default `false`).
 *
 * - `lit: false`: cork sits snug in the mouth; 2 warm amber fireflies bob softly inside.
 * - `lit: true`: cork pops playfully ajar on its twine tether beside the neck, warm
 *   gentle amber watercolor light spills onto the stone (subtle 35mm halation, never neon),
 *   and 4 lively golden fireflies swirl upward in staggered 12 FPS figure-eight arcs
 *   with delicate 2-frame motion trails.
 *
 * Local origin: `(0, 0)` at ground/flagstone contact center.
 * Local SVG bounds: `x: -28..28, y: -60..4` (ground contact shadow ellipse to `y: 7`;
 * when `lit: true`, released fireflies swirl up to `y: -115`).
 */
export function renderClassicFireflyLanternJar(options: PropRenderOptions): string {
  const { lit = false, frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');
  const pid = (name: string): string => `cc-fjar-${name}-${uid}`;

  const stoneClipId = pid('stone-clip');
  const bodyClipId = pid('body-clip');
  const corkClipId = pid('cork-clip');

  // Subtle 12 FPS light breath & cork sway
  const glowBreath = steppedOscillate(frameIndex, 16, 0.08, variant * 3);
  const washShift = steppedOscillate(frameIndex, 20, 1.1, variant * 2);
  const corkWobble = steppedOscillate(frameIndex, 18, 2.4, variant * 5);

  // Key geometry paths
  const stoneD =
    'M -22 -1 C -23 -5.4, -13 -8.2, 0 -8.2 C 13 -8.2, 23 -5.4, 22 -1 C 21 3.1, 11 3.9, 0 3.9 C -11 3.9, -21 3.1, -22 -1 Z';
  const jarBodyD =
    'M -8.6 -42.5 C -9.0 -40.8, -8.4 -39.0, -9.2 -37.0 C -14.8 -34.0, -16.8 -27.2, -16.4 -18.5 C -16.0 -10.5, -13.5 -5.2, -9.4 -4.0 C -4.4 -2.8, 4.4 -2.8, 9.4 -4.0 C 13.5 -5.2, 16.0 -10.5, 16.4 -18.5 C 16.8 -27.2, 14.8 -34.0, 9.2 -37.0 C 8.4 -39.0, 9.0 -40.8, 8.6 -42.5 Z';
  const jarLipD =
    'M -9.8 -44.2 C -10.4 -43.2, -10.1 -41.8, -8.8 -41.6 C -4.2 -41.0, 4.2 -41.0, 8.8 -41.6 C 10.1 -41.8, 10.4 -43.2, 9.8 -44.2 C 6.4 -45.2, -6.4 -45.2, -9.8 -44.2 Z';

  const defs = svgEl('defs', {}, [
    svgEl('clipPath', { id: stoneClipId }, svgEl('path', { d: stoneD })),
    svgEl('clipPath', { id: bodyClipId }, svgEl('path', { d: jarBodyD })),
  ]);

  // 1. Small Mossy Stepping Stone & Ground Contact Shadow (`data-part="stepping-stone"`)
  const steppingStone = svgEl('g', { 'data-part': 'stepping-stone' }, [
    celContactShadow(0, 1, 22, 6, 0.34),
    gouachePath(stoneD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(stoneClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -10, cy: -4.2, rx: 12.5, ry: 4.0, fill: c.stoneLight, opacity: 0.62 },
          { cx: 11, cy: -0.6, rx: 14, ry: 4.5, fill: c.stoneShadow, opacity: 0.72 },
          { cx: 0, cy: 2.6, rx: 22, ry: 3.0, fill: c.stoneShadow, opacity: 0.64 },
          { cx: -16.5, cy: -2.2, rx: 6.5, ry: 3.2, fill: c.oliveCanopy, opacity: 0.56 },
          { cx: 16.0, cy: -2.6, rx: 6.0, ry: 3.0, fill: c.sageFoliage, opacity: 0.44 },
        ],
        { seed: 41 + variant }
      ),
    ]),
    xeroxSketchStroke(stoneD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      opacity: 0.9,
      feather: true,
    }),
    xeroxSketchStroke(
      'M -18 -0.6 Q 0 1.4, 18 -0.6 M -12 -5.5 L -8.5 -3.6 M 9 -5.8 L 12.5 -3.8',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.74,
      }
    ),
  ]);

  // 2. Tiny Moss Dabs & Crisp Hand-Drawn Pencil Grass Wisps (`data-part="stone-grass-wisps"`)
  const grassWisps = svgEl('g', { 'data-part': 'stone-grass-wisps' }, [
    watercolorWashBlotches(
      [
        { cx: -19.5, cy: -1.6, rx: 5.5, ry: 2.6, fill: c.foliageMid, opacity: 0.66 },
        { cx: 19.5, cy: -1.4, rx: 5.2, ry: 2.4, fill: c.oliveCanopy, opacity: 0.62 },
      ],
      { seed: 53 + variant }
    ),
    pencilGrassStrokes(
      [
        {
          x: -20,
          y: 0.4,
          width: 7.5,
          height: 6.8,
          blades: 3,
          lean: -0.24,
          groundDash: false,
          pebbles: false,
        },
        {
          x: 20,
          y: 0.4,
          width: 7.5,
          height: 6.2,
          blades: 3,
          lean: 0.26,
          groundDash: false,
          pebbles: false,
        },
        {
          x: -12.5,
          y: 2.0,
          width: 4.5,
          height: 4.4,
          blades: 2,
          lean: -0.18,
          groundDash: false,
          pebbles: false,
        },
      ],
      {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.05,
        opacity: 0.84,
        seed: 61 + variant,
      }
    ),
  ]);

  // 3. Restrained Warm Amber Light Spill on the Stepping Stone when `lit: true`
  const stoneSpillBlotches: WatercolorBlotch[] = [
    {
      cx: 0,
      cy: -2.2,
      rx: round2(21 + washShift * 0.45),
      ry: 5.2,
      fill: c.warmAmberWash,
      opacity: 0.28,
      rotate: -2,
    },
    {
      cx: 0.8,
      cy: -3.0,
      rx: round2(13.5 + washShift * 0.3),
      ry: 3.6,
      fill: c.warmAmberGlow,
      opacity: 0.26,
      rotate: 3,
    },
    {
      cx: -4.5,
      cy: -1.4,
      rx: 10.5,
      ry: 2.8,
      fill: c.ochreEarth,
      opacity: 0.2,
      rotate: -4,
    },
  ];
  const groundAmberSpill = lit
    ? svgEl('g', { 'data-part': 'lantern-ground-spill' }, [
        watercolorWashBlotches(stoneSpillBlotches, {
          opacity: round2(0.84 + glowBreath),
          seed: 71 + variant,
        }),
        // Subtle 35mm optical halation on the stone directly beneath the glowing jar
        svgEl('ellipse', {
          cx: 0,
          cy: -2.8,
          rx: round2(14.5 + washShift * 0.3),
          ry: 3.8,
          fill: c.warmAmberWash,
          filter: softGlowFilter,
          opacity: round2(0.2 + glowBreath * 0.35),
        }),
      ])
    : '';

  // 4. Curved Wrought-Iron Bail Handle Arch & Tiny Wooden Grip Bead (`data-part="jar-wire-handle"`)
  const bailHandle = svgEl('g', { 'data-part': 'jar-wire-handle' }, [
    xeroxSketchStroke(
      'M -10.5 -40.5 C -16.2 -46.5, -13.4 -58.2, 0 -58.4 C 13.4 -58.2, 16.2 -46.5, 10.5 -40.5',
      {
        stroke: c.ironDark,
        strokeWidth: 2.25,
        feather: true,
        opacity: 0.96,
      }
    ),
    xeroxSketchStroke(
      'M -12.6 -46.8 C -12.2 -53.8, -6.5 -57.4, -1.8 -57.6 M 4.8 -56.6 C 10.2 -54.8, 12.8 -49.5, 11.8 -44.2',
      {
        stroke: c.ironHighlight,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.62,
      }
    ),
    // Small hand-turned dark wood grip bead at apex of the wire bail
    celPath(
      'M -3.4 -58.4 C -3.4 -59.7, 3.4 -59.7, 3.4 -58.4 C 3.4 -57.0, -3.4 -57.0, -3.4 -58.4 Z',
      c.woodDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    xeroxSketchStroke('M -1.8 -58.9 L 1.6 -58.9', {
      stroke: c.woodLit,
      strokeWidth: 0.7,
      opacity: 0.72,
    }),
  ]);

  // 5. Enclosed Fireflies inside the Jar when `lit === false`
  const enclosedFireflyEls: string[] = [];
  if (!lit) {
    for (let i = 0; i < ENCLOSED_FIREFLIES.length; i++) {
      const spec = ENCLOSED_FIREFLIES[i]!;
      const fx = round2(
        spec.baseX +
          steppedOscillate(frameIndex, spec.periodX, spec.ampX, spec.phase + variant)
      );
      const fy = round2(
        spec.baseY +
          steppedOscillate(frameIndex, spec.periodY, spec.ampY, spec.phase + variant + 3)
      );
      const pulse = steppedOscillate(frameIndex, 14, 0.7, i * 5 + variant);
      const wingLift = steppedOscillate(frameIndex, 4, 0.85, i * 2);

      enclosedFireflyEls.push(
        svgEl('g', { 'data-part': `jar-firefly-${i + 1}` }, [
          // Subtle warm 35mm soft-glow dot inside the glass
          svgEl('circle', {
            cx: fx,
            cy: fy,
            r: round2(4.2 + pulse * 0.6),
            fill: c.warmAmberGlow,
            filter: softGlowFilter,
            opacity: round2(0.32 + pulse * 0.06),
          }),
          // Tiny hand-inked cel fluttering wings
          svgEl('ellipse', {
            cx: round2(fx - 1.9),
            cy: round2(fy - 1.2 - wingLift * 0.6),
            rx: 1.75,
            ry: 0.95,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.6,
            opacity: 0.84,
          }),
          svgEl('ellipse', {
            cx: round2(fx + 1.9),
            cy: round2(fy - 1.2 - wingLift * 0.6),
            rx: 1.75,
            ry: 0.95,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.6,
            opacity: 0.84,
          }),
          // Warm amber firefly core
          svgEl('circle', {
            cx: fx,
            cy: fy,
            r: spec.coreR,
            fill: c.warmAmberCore,
            stroke: c.xeroxInk,
            'stroke-width': 0.75,
          }),
          svgEl('circle', {
            cx: round2(fx - 0.45),
            cy: round2(fy - 0.45),
            r: 0.65,
            fill: c.parchmentCream,
          }),
        ])
      );
    }
  }

  // 6. Hand-Blown Vintage Apothecary / Mason Lantern Jar (`data-part="lantern-jar"`)
  const innerGlassBlotches: WatercolorBlotch[] = lit
    ? [
        { cx: 0, cy: -22, rx: 14.5, ry: 16.5, fill: c.warmAmberWash, opacity: 0.36 },
        { cx: -1.5, cy: -24, rx: 10.5, ry: 12.0, fill: c.warmAmberGlow, opacity: 0.32 },
        { cx: 0.5, cy: -27, rx: 7.5, ry: 8.5, fill: c.warmAmberCore, opacity: 0.26 },
        { cx: 11.5, cy: -18, rx: 6.0, ry: 14.0, fill: c.slateBlue, opacity: 0.14 },
      ]
    : [
        { cx: -0.5, cy: -19, rx: 10.0, ry: 9.5, fill: c.warmAmberWash, opacity: 0.16 },
        { cx: 11.0, cy: -18, rx: 7.2, ry: 15.0, fill: c.slateBlue, opacity: 0.26 },
        { cx: -11.5, cy: -22, rx: 5.5, ry: 13.0, fill: c.waterHighlight, opacity: 0.18 },
      ];

  const submergedCorkHint = !lit
    ? svgEl('path', {
        d: 'M -6.2 -42.2 L -5.5 -37.8 C -3.2 -37.0, 3.2 -37.0, 5.5 -37.8 L 6.2 -42.2 Z',
        fill: c.woodMid,
        opacity: 0.54,
      })
    : '';

  const openMouthGlow = lit
    ? svgEl('g', { 'data-part': 'jar-mouth-glow' }, [
        watercolorWashBlotches(
          [
            {
              cx: 0,
              cy: -44.5,
              rx: round2(11.5 + washShift * 0.35),
              ry: 6.5,
              fill: c.warmAmberWash,
              opacity: 0.26,
            },
            {
              cx: 0,
              cy: -45.5,
              rx: 7.5,
              ry: 4.5,
              fill: c.warmAmberGlow,
              opacity: 0.24,
            },
          ],
          { opacity: round2(0.86 + glowBreath), seed: 79 + variant }
        ),
        svgEl('circle', {
          cx: 0,
          cy: -44.0,
          r: round2(6.2 + washShift * 0.25),
          fill: c.warmAmberGlow,
          filter: softGlowFilter,
          opacity: round2(0.24 + glowBreath * 0.4),
        }),
      ])
    : '';

  const lanternJar = svgEl('g', { 'data-part': 'lantern-jar' }, [
    // Subtle translucent vintage cel glass base
    svgEl('path', {
      d: jarBodyD,
      fill: lit ? c.celCream : c.parchmentCream,
      opacity: lit ? 0.28 : 0.22,
    }),
    // Clipped inner glass shading & warm amber inner watercolor wash
    svgEl('g', { 'clip-path': svgUrl(bodyClipId) }, [
      watercolorWashBlotches(innerGlassBlotches, {
        opacity: lit ? round2(0.88 + glowBreath) : 0.82,
        seed: 83 + variant,
      }),
      lit
        ? svgEl('circle', {
            cx: 0,
            cy: -22,
            r: round2(8.5 + washShift * 0.3),
            fill: c.warmAmberGlow,
            filter: softGlowFilter,
            opacity: round2(0.22 + glowBreath * 0.35),
          })
        : '',
      // Thick hand-blown glass base rim cushion
      svgEl('ellipse', {
        cx: 0,
        cy: -5.2,
        rx: 12.2,
        ry: 2.6,
        fill: c.celCream,
        opacity: lit ? 0.34 : 0.24,
      }),
      submergedCorkHint,
    ]),
    // Enclosed fireflies sit behind front glass glints & Xerox outline when corked
    !lit
      ? svgEl('g', { 'data-part': 'jar-fireflies' }, enclosedFireflyEls)
      : '',
    // Loose hand-drawn glass glint ticks & inner refraction reflections
    xeroxSketchStroke(
      'M -11.6 -30.5 C -13.5 -24.5, -13.6 -16.8, -11.2 -10.5 M -8.6 -35.0 Q -10.4 -33.5, -11.0 -32.0',
      {
        stroke: c.parchmentCream,
        strokeWidth: 1.35,
        broken: true,
        dasharray: '10 3.5 4 2.5',
        opacity: lit ? 0.8 : 0.7,
      }
    ),
    xeroxSketchStroke(
      'M 12.2 -27.5 C 13.4 -22.2, 13.2 -16.0, 11.6 -11.2 M -9.8 -6.4 Q 0 -3.8, 9.8 -6.4',
      {
        stroke: c.celCream,
        strokeWidth: 0.95,
        broken: true,
        opacity: lit ? 0.62 : 0.52,
      }
    ),
    // Outer jar silhouette inked with raw Xerox graphite toner
    celPath(jarBodyD, 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Open jar mouth depth oval & rolled glass lip
    svgEl('ellipse', {
      cx: 0,
      cy: -43.5,
      rx: 7.4,
      ry: 1.65,
      fill: lit ? c.warmAmberWash : c.nightSkyZenith,
      opacity: lit ? 0.48 : 0.3,
    }),
    svgEl('path', {
      d: jarLipD,
      fill: c.celCream,
      opacity: lit ? 0.42 : 0.34,
    }),
    celPath(jarLipD, 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Wrought-iron wire collar cinched around the jar neck + side bail eyelets
    xeroxSketchStroke('M -9.5 -40.4 Q 0 -39.0, 9.5 -40.4', {
      stroke: c.ironDark,
      strokeWidth: 2.1,
      opacity: 0.95,
    }),
    xeroxSketchStroke('M -6.5 -40.6 Q 0 -39.7, 6.0 -40.5', {
      stroke: c.ironHighlight,
      strokeWidth: 0.75,
      broken: true,
      opacity: 0.58,
    }),
    celPath(
      'M -12.0 -40.4 C -12.0 -41.7, -9.2 -41.7, -9.2 -40.4 C -9.2 -39.1, -12.0 -39.1, -12.0 -40.4 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M 9.2 -40.4 C 9.2 -41.7, 12.0 -41.7, 12.0 -40.4 C 12.0 -39.1, 9.2 -39.1, 9.2 -40.4 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Rustic hand-drawn hemp twine wrap & small dangling bow tail around the lower neck
    svgEl('g', { 'data-part': 'jar-twine-wrap' }, [
      xeroxSketchStroke(
        'M -9.2 -38.6 Q 0 -37.2, 9.2 -38.6 M -9.5 -36.8 Q 0 -35.6, 9.5 -36.8 M -6.8 -38.1 L 5.6 -36.5',
        {
          stroke: c.ochreEarth,
          strokeWidth: 1.45,
          opacity: 0.9,
        }
      ),
      xeroxSketchStroke(
        'M -9.0 -37.8 Q 0 -36.5, 9.0 -37.8 M -9.4 -36.1 Q 0 -35.0, 9.4 -36.1',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.75,
          broken: true,
          opacity: 0.75,
        }
      ),
      // Tiny knot & loose twine tails draping left of the neck
      celPath(
        'M -10.4 -37.4 C -10.8 -38.4, -8.8 -38.6, -8.4 -37.4 C -8.2 -36.4, -10.0 -36.2, -10.4 -37.4 Z',
        c.woodLit,
        { stroke: c.xeroxInk, strokeWidth: 0.8 }
      ),
      xeroxSketchStroke(
        'M -9.8 -36.6 C -11.4 -34.8, -12.2 -33.2, -11.6 -31.0 M -9.0 -36.5 C -10.0 -34.6, -9.8 -33.0, -8.8 -31.8',
        {
          stroke: c.ochreEarth,
          strokeWidth: 1.1,
          opacity: 0.88,
        }
      ),
    ]),
    openMouthGlow,
  ]);

  // 7. Vintage Tapered Cork Stopper (`data-part="jar-cork"`)
  // Snug in the mouth when `lit === false`; tipped playfully ajar on a twine tether beside the neck when `lit === true`
  const corkShape = celShadedShape({
    d: 'M -6.4 0.8 L -7.4 -6.6 C -4.8 -8.2, 4.8 -8.2, 7.4 -6.6 L 6.4 0.8 C 3.8 1.9, -3.8 1.9, -6.4 0.8 Z',
    baseFill: c.woodMid,
    shadowPaths: ['M 1.2 -8.5 L 8.2 -8.5 L 8.2 2.5 L 0.6 2.5 Z'],
    shadowFill: c.woodDark,
    shadowOpacity: 0.68,
    highlightPaths: [
      'M -7.4 -6.6 C -4.8 -8.2, 4.8 -8.2, 7.4 -6.6 C 4.8 -5.2, -4.8 -5.2, -7.4 -6.6 Z',
    ],
    highlightFill: c.woodLit,
    highlightOpacity: 0.72,
    clipId: corkClipId,
    stroke: c.xeroxInk,
    strokeWidth: s.xeroxFine,
  });
  const corkDetails = xeroxSketchStroke(
    'M -4.2 -4.2 L -3.6 -1.6 M -0.6 -3.8 L -0.4 -2.2 M 2.8 -4.6 L 3.2 -2.0 M -5.6 -6.2 Q 0 -4.8, 5.6 -6.2',
    {
      stroke: c.woodDark,
      strokeWidth: 0.78,
      broken: true,
      opacity: 0.76,
    }
  );

  const jarCork = lit
    ? svgEl('g', { 'data-part': 'jar-cork', 'data-cork-state': 'ajar' }, [
        // Twine tether linking the popped cork playfully to the right side of the jar neck
        xeroxSketchStroke(
          `M 9.0 -37.8 C 12.8 -39.0, 14.2 -41.5, ${round2(13.8 + corkWobble * 0.15)} -43.2`,
          {
            stroke: c.ochreEarth,
            strokeWidth: 1.15,
            opacity: 0.88,
          }
        ),
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: 15.2,
              y: -42.8,
              rotate: round2(52 + corkWobble),
            }),
          },
          [corkShape, corkDetails]
        ),
      ])
    : svgEl(
        'g',
        {
          'data-part': 'jar-cork',
          'data-cork-state': 'closed',
          transform: svgTransform({ x: 0, y: -43.0 }),
        },
        [corkShape, corkDetails]
      );

  // 8. 4 Lively Golden Fireflies Swirling Upward out of the Jar in 12 FPS Figure-Eight Arcs (`lit: true`)
  const releasedFireflyEls: string[] = [];
  if (lit) {
    for (let i = 0; i < RELEASED_FIREFLIES.length; i++) {
      const spec = RELEASED_FIREFLIES[i]!;
      const jx = deterministicJitter(i * 11 + 5, variant, 1.0);
      const jy = deterministicJitter(i * 17 + 9, variant, 0.9);

      // Horizontal figure-eight Lissajous arc stepped at 12 FPS
      const posAt = (f: number): [number, number] => [
        round2(
          spec.baseX +
            jx +
            steppedOscillate(f, spec.period, spec.ampX, spec.phase + variant)
        ),
        round2(
          spec.baseY +
            jy +
            steppedOscillate(f, spec.period / 2, spec.ampY, spec.phase + variant)
        ),
      ];

      const [curX, curY] = posAt(frameIndex);
      const [prev1X, prev1Y] = posAt(frameIndex - 1);
      const [prev2X, prev2Y] = posAt(frameIndex - 2);

      const pulse = steppedOscillate(frameIndex, 14, 0.8, i * 4 + variant);
      const wingFlutter = steppedOscillate(frameIndex, 4, 1.0, i * 2);
      const wingY = round2(-1.4 - wingFlutter * 0.85);

      releasedFireflyEls.push(
        svgEl('g', { 'data-part': `jar-firefly-${i + 1}` }, [
          // Delicate 2-frame curved motion trail
          xeroxSketchStroke(
            `M ${prev2X} ${prev2Y} Q ${prev1X} ${prev1Y}, ${curX} ${curY}`,
            {
              stroke: c.warmAmberGlow,
              strokeWidth: 1.05,
              dasharray: '2.2 2.8',
              opacity: 0.62,
            }
          ),
          svgEl('circle', {
            cx: prev1X,
            cy: prev1Y,
            r: 0.95,
            fill: c.warmAmberGlow,
            opacity: 0.46,
          }),
          // Restrained warm 35mm optical halation dot (never neon)
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: round2(4.6 + pulse * 0.65),
            fill: c.warmAmberGlow,
            filter: softGlowFilter,
            opacity: round2(0.32 + pulse * 0.06),
          }),
          // Crisp tiny hand-inked cel fluttering wings
          svgEl('ellipse', {
            cx: round2(curX - 2.1),
            cy: round2(curY + wingY),
            rx: 2.0,
            ry: 1.05,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.65,
            opacity: 0.88,
          }),
          svgEl('ellipse', {
            cx: round2(curX + 2.1),
            cy: round2(curY + wingY),
            rx: 2.0,
            ry: 1.05,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.65,
            opacity: 0.88,
          }),
          // Flat matte warm amber firefly core with fine Xerox outline
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: spec.coreR,
            fill: i % 2 === 0 ? c.warmAmberCore : c.warmAmberGlow,
            stroke: c.xeroxInk,
            'stroke-width': 0.8,
          }),
          svgEl('circle', {
            cx: round2(curX - 0.55),
            cy: round2(curY - 0.55),
            r: 0.75,
            fill: c.parchmentCream,
          }),
        ])
      );
    }
  }

  const releasedFireflies = lit
    ? svgEl('g', { 'data-part': 'jar-fireflies' }, releasedFireflyEls)
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'firefly_lantern_jar',
      'data-lit': lit ? 'true' : 'false',
      'data-art-style': 'classic_cel',
    },
    [
      defs,
      steppingStone,
      grassWisps,
      groundAmberSpill,
      bailHandle,
      lanternJar,
      jarCork,
      releasedFireflies,
    ]
  );
}

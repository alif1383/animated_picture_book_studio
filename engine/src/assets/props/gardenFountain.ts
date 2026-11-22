import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedLoopProgress, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';

export interface GardenFountainOptions {
  frameIndex?: number;
  lit?: boolean;
  variant?: number;
  fillMask?: string;
}

interface FireflySpec {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  periodX: number;
  periodY: number;
  phase: number;
  haloR: number;
  coreR: number;
}

const FIREFLY_SPECS: readonly FireflySpec[] = [
  {
    baseX: -38,
    baseY: -116,
    ampX: 6,
    ampY: 4.5,
    periodX: 12,
    periodY: 6,
    phase: 0,
    haloR: 8.2,
    coreR: 3.4,
  },
  {
    baseX: 6,
    baseY: -120,
    ampX: 7,
    ampY: 4,
    periodX: 12,
    periodY: 8,
    phase: 2,
    haloR: 8.5,
    coreR: 3.6,
  },
  {
    baseX: 46,
    baseY: -112,
    ampX: 6,
    ampY: 4.5,
    periodX: 10,
    periodY: 6,
    phase: 4,
    haloR: 7.8,
    coreR: 3.2,
  },
  {
    baseX: -67,
    baseY: -94,
    ampX: 5,
    ampY: 4,
    periodX: 8,
    periodY: 6,
    phase: 1,
    haloR: 8.4,
    coreR: 3.3,
  },
  {
    baseX: 67,
    baseY: -89,
    ampX: 5,
    ampY: 4.5,
    periodX: 8,
    periodY: 6,
    phase: 3,
    haloR: 8.4,
    coreR: 3.3,
  },
];

/**
 * Renders a carved storybook stone garden fountain / birdbath (`'garden_fountain'`)
 * with mossy stone patina, moonlit indigo water reflecting a tiny golden crescent moon,
 * stepped 6 FPS arcing water droplets & concentric ripples, and dancing garden fireflies.
 *
 * Origin: `(0, 0)` at ground contact center of the stone pedestal base.
 * Local SVG bounds: `{ x: -85, y: -135, width: 170, height: 143 }` (`x: -85..85`, `y: -135..8`).
 */
export function renderGardenFountain(
  options: GardenFountainOptions = {}
): string {
  const { frameIndex = 0, lit = true, variant = 1, fillMask } = options;

  const {
    paperWarm,
    paperShadow,
    paperDeep,
    charcoalOutline,
    faintPencil,
    indigoNightLight,
    warmMoon,
    windowGlow,
    bananaYellow,
    starWhite,
    catLightBlue,
    skyPastelLight,
    treeGreen,
    grassGreen,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  // 1. Soft Paper-Deep Ground Contact Smudge & Carved Stone Plinth (`data-part="stone-base"`)
  const stoneBase = svgEl('g', { 'data-part': 'stone-base' }, [
    // Warm crayon ground smudge (no CSS shadow)
    svgEl('ellipse', {
      cx: 0,
      cy: 2.5,
      rx: 57,
      ry: 5.5,
      fill: paperDeep,
      opacity: 0.55,
    }),
    // Lower wide stone plinth step
    crayonPath(
      'M -48 2 C -49 -6, -42 -11, -34 -11 L 34 -11 C 42 -11, 49 -6, 48 2 C 44 6.5, -44 6.5, -48 2 Z',
      paperDeep,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Subtle weathered ochre patina over lower plinth
    crayonPath(
      'M -44 0 C -44 -5, -38 -9, -32 -9 L 32 -9 C 38 -9, 44 -5, 44 0 C 38 4, -38 4, -44 0 Z',
      getPatternFill('crayonOchre'),
      { stroke: 'none', opacity: 0.24, mask: fillMask }
    ),
    // Upper stepped plinth ledge
    crayonPath(
      'M -36 -9 C -37 -16, -31 -20, -24 -20 L 24 -20 C 31 -20, 37 -16, 36 -9 C 31 -6, -31 -6, -36 -9 Z',
      paperShadow,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Hand-drawn stone seam detail
    svgEl('path', {
      d: 'M -24 -10 L -22 -2 M 18 -10 L 21 -2 M -34 -14 Q 0 -11, 34 -14',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.75,
      }),
    }),
  ]);

  // 2. Fluted Carved Stone Pedestal Column (`data-part="stone-pedestal"`)
  const stonePedestal = svgEl('g', { 'data-part': 'stone-pedestal' }, [
    // Sculpted hourglass baluster column
    crayonPath(
      'M -23 -18 C -21 -28, -14 -36, -15 -44 C -16 -52, -23 -56, -26 -62 L 26 -62 C 23 -56, 16 -52, 15 -44 C 14 -36, 21 -28, 23 -18 C 14 -14, -14 -14, -23 -18 Z',
      paperShadow,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Soft ochre stone texture wash
    crayonPath(
      'M -20 -19 C -18 -29, -12 -37, -13 -44 C -14 -51, -20 -55, -22 -60 L 22 -60 C 20 -55, 14 -51, 13 -44 C 12 -37, 18 -29, 20 -19 Z',
      getPatternFill('crayonOchre'),
      { stroke: 'none', opacity: 0.22, mask: fillMask }
    ),
    // Right-side shadow facet on pedestal
    crayonPath(
      'M 4 -16 C 9 -26, 6 -36, 7 -44 C 8 -51, 13 -55, 17 -61 L 25 -61 C 22 -55, 16 -51, 15 -44 C 14 -36, 20 -28, 22 -18 C 17 -15, 10 -15, 4 -16 Z',
      paperDeep,
      { stroke: 'none', opacity: 0.72, mask: fillMask }
    ),
    // Carved vertical stone flutes & antique stone speckles
    svgEl('path', {
      d: 'M -8 -20 C -6 -32, -6 -48, -9 -58 M 0 -19 C 1 -32, 1 -48, 0 -58 M 9 -20 C 7 -32, 7 -48, 10 -58',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.72,
      }),
    }),
    // Sculpted collar molding supporting the wide basin
    crayonPath(
      'M -30 -59 C -32 -65, -24 -68, 0 -68 C 24 -68, 32 -65, 30 -59 C 22 -55, -22 -55, -30 -59 Z',
      paperWarm,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
  ]);

  // 3. Wide Sculpted Stone Basin & Rim (`data-part="stone-basin"`)
  const stoneBasin = svgEl('g', { 'data-part': 'stone-basin' }, [
    // Carved saucer under-bowl
    crayonPath(
      'M -72 -78 C -68 -64, -44 -57, 0 -56 C 44 -57, 68 -64, 72 -78 C 46 -71, -46 -71, -72 -78 Z',
      paperShadow,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Lower bowl shading & mossy ochre stone glaze
    crayonPath(
      'M -66 -74 C -58 -63, -36 -58, 0 -57 C 36 -58, 58 -63, 66 -74 C 36 -66, -36 -66, -66 -74 Z',
      paperDeep,
      { stroke: 'none', opacity: 0.65, mask: fillMask }
    ),
    crayonPath(
      'M -64 -75 C -54 -64, -32 -59, 0 -58 C 32 -59, 54 -64, 64 -75 C 34 -68, -34 -68, -64 -75 Z',
      getPatternFill('crayonOchre'),
      { stroke: 'none', opacity: 0.24, mask: fillMask }
    ),
    // Scalloped stone ribs carved around the bowl exterior
    svgEl('path', {
      d: 'M -52 -72 Q -46 -64, -38 -62 M -30 -70 Q -26 -62, -20 -59 M -10 -69 Q -9 -61, -7 -58 M 10 -69 Q 9 -61, 7 -58 M 30 -70 Q 26 -62, 20 -59 M 52 -72 Q 46 -64, 38 -62',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.72,
      }),
    }),
    // Outer wide carved stone lip / rim
    crayonPath(
      'M -74 -79 C -74 -89, -42 -93, 0 -93 C 42 -93, 74 -89, 74 -79 C 74 -69, 42 -65, 0 -65 C -42 -65, -74 -69, -74 -79 Z',
      paperWarm,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Subtle ochre patina around rim
    crayonPath(
      'M -71 -79 C -71 -87, -40 -91, 0 -91 C 40 -91, 71 -87, 71 -79 C 71 -71, 40 -67, 0 -67 C -40 -67, -71 -71, -71 -79 Z',
      getPatternFill('crayonOchre'),
      { stroke: 'none', opacity: 0.16, mask: fillMask }
    ),
    // Inner stone lip recess behind the water
    crayonPath(
      'M -64 -80 C -64 -87, -36 -90, 0 -90 C 36 -90, 64 -87, 64 -80 C 64 -73, 36 -70, 0 -70 C -36 -70, -64 -73, -64 -80 Z',
      paperDeep,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
  ]);

  // 4. Shimmering Moonlit Water Surface, Crescent Reflection & Stepped Ripples (`data-part="moonlit-water"`)
  const rippleStepA = steppedLoopProgress(frameIndex, 6, variant);
  const rippleStepB = steppedLoopProgress(frameIndex, 6, variant + 3);
  const shimmerShift = steppedOscillate(frameIndex, 6, 2.2, variant);
  const moonBobY = steppedOscillate(frameIndex, 6, 0.9, variant + 1);
  const moonShiftX = steppedOscillate(frameIndex, 8, 1.3, variant);

  const innerRippleRx = round2(13 + rippleStepA * 14);
  const innerRippleRy = round2(2.3 + rippleStepA * 2.2);
  const outerRippleRx = round2(24 + rippleStepB * 22);
  const outerRippleRy = round2(4.0 + rippleStepB * 3.1);

  const moonCx = round2(-29 + moonShiftX);
  const moonCy = round2(-78.5 + moonBobY);

  const moonlitWater = svgEl('g', { 'data-part': 'moonlit-water' }, [
    // Deep indigo moonlit water surface inside basin
    crayonPath(
      'M -61 -79 C -61 -85.5, -34 -88.5, 0 -88.5 C 34 -88.5, 61 -85.5, 61 -79 C 61 -73, 34 -70.5, 0 -70.5 C -34 -70.5, -61 -73, -61 -79 Z',
      getPatternFill('markerIndigoNight'),
      { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
    ),
    // Soft moonlit blue water wave shimmer strokes
    svgEl('path', {
      d: `M ${round2(-48 + shimmerShift * 0.6)} -81 Q ${round2(-30 + shimmerShift)} -83.5, ${round2(-14 + shimmerShift * 0.5)} -81 M ${round2(16 - shimmerShift * 0.5)} -82 Q ${round2(34 - shimmerShift)} -84, ${round2(48 - shimmerShift * 0.6)} -81 M ${round2(12 + shimmerShift * 0.5)} -75 Q ${round2(28 + shimmerShift)} -73.5, ${round2(44 + shimmerShift * 0.4)} -75.5`,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: catLightBlue,
        strokeWidth: outlineThin,
        opacity: 0.72,
      }),
    }),
    // Expanding stepped 6 FPS concentric ripples around central spout
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: innerRippleRx,
      ry: innerRippleRy,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: skyPastelLight,
        strokeWidth: 1.7,
        opacity: round2(0.88 - rippleStepA * 0.42),
      }),
    }),
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: outerRippleRx,
      ry: outerRippleRy,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: catLightBlue,
        strokeWidth: 1.5,
        dasharray: '7 5',
        opacity: round2(0.76 - rippleStepB * 0.44),
      }),
    }),
    // Reflected tiny hand-drawn golden crescent moon on the left water surface
    svgEl('g', { 'data-part': 'moon-reflection' }, [
      svgEl('path', {
        d: `M ${round2(moonCx + 3.5)} ${round2(moonCy - 4.4)} C ${round2(moonCx - 3.6)} ${round2(moonCy - 4.2)}, ${round2(moonCx - 5.2)} ${round2(moonCy + 2.8)}, ${round2(moonCx + 3.8)} ${round2(moonCy + 3.6)} C ${round2(moonCx - 0.6)} ${round2(moonCy + 1.8)}, ${round2(moonCx - 0.8)} ${round2(moonCy - 2.2)}, ${round2(moonCx + 3.5)} ${round2(moonCy - 4.4)} Z`,
        fill: warmMoon,
        stroke: warmMoon,
        'stroke-width': 0.9,
        'stroke-linejoin': 'round',
        opacity: 0.94,
      }),
      // Shimmering golden ripple echoes beneath the crescent
      svgEl('path', {
        d: `M ${round2(moonCx - 4.5)} ${round2(moonCy + 5.2)} Q ${moonCx} ${round2(moonCy + 6)}, ${round2(moonCx + 4.8)} ${round2(moonCy + 5.2)}`,
        fill: 'none',
        stroke: warmMoon,
        'stroke-width': 1.4,
        'stroke-linecap': 'round',
        opacity: 0.72,
      }),
      // Tiny reflected starlight glints on the right water surface
      svgEl('circle', {
        cx: round2(36 - shimmerShift * 0.4),
        cy: -78,
        r: (frameIndex + variant) % 3 === 0 ? 1.8 : 1.3,
        fill: starWhite,
        opacity: 0.88,
      }),
      svgEl('circle', {
        cx: round2(45 + shimmerShift * 0.3),
        cy: -81.5,
        r: (frameIndex + variant + 1) % 3 === 0 ? 1.6 : 1.1,
        fill: starWhite,
        opacity: 0.8,
      }),
    ]),
  ]);

  // 5. Central Carved Lily-Bud Finial & Arcing 6 FPS Water Droplets (`data-part="lily-finial"`)
  const arcPeakLift = steppedOscillate(frameIndex, 6, 1.8, variant);
  const waterStreams: string[] = [];

  // Two gentle parabolic fountain jets (left & right from finial bud at (0, -105) to (+-32, -79))
  for (const dir of [-1, 1] as const) {
    const startX = dir * 2;
    const startY = -105;
    const ctrlX = dir * 18;
    const ctrlY = round2(-124 - arcPeakLift);
    const endX = dir * 32;
    const endY = -79;

    // Delicate dashed crayon water stream arc
    waterStreams.push(
      svgEl('path', {
        d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`,
        fill: 'none',
        stroke: catLightBlue,
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
        'stroke-dasharray': '5 4',
        'stroke-dashoffset': round2(-((frameIndex % 6) * 3)),
        opacity: 0.84,
      }),
      svgEl('path', {
        d: `M ${startX} ${round2(startY - 1)} Q ${round2(ctrlX * 0.95)} ${round2(ctrlY + 1.5)}, ${round2(endX * 0.96)} ${round2(endY - 1)}`,
        fill: 'none',
        stroke: starWhite,
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
        'stroke-dasharray': '3 6',
        'stroke-dashoffset': round2(-((frameIndex % 6) * 3 + 2)),
        opacity: 0.85,
      })
    );

    // 3 stepped sparkling water droplets travelling along each parabolic arc
    for (let d = 0; d < 3; d++) {
      const t = steppedLoopProgress(
        frameIndex,
        6,
        d * 2 + (dir === 1 ? 1 : 0) + variant
      );
      const u = 1 - t;
      const jitterX = deterministicJitter(
        d * 7 + (dir > 0 ? 11 : 3),
        frameIndex + variant,
        1.1
      );
      const jitterY = deterministicJitter(
        d * 5 + (dir > 0 ? 17 : 9),
        frameIndex + variant,
        1.1
      );
      const px = round2(
        u * u * startX + 2 * u * t * ctrlX + t * t * endX + jitterX
      );
      const py = round2(
        u * u * startY + 2 * u * t * ctrlY + t * t * endY + jitterY
      );
      const r = round2(2.1 + (d === 1 ? 0.7 : 0));

      waterStreams.push(
        svgEl('circle', {
          cx: px,
          cy: py,
          r,
          fill: d % 2 === 0 ? starWhite : catLightBlue,
          stroke: indigoNightLight,
          'stroke-width': 0.9,
          opacity: 0.94,
        })
      );
    }

    // Tiny surface splash bead where jet lands in basin
    const splashHop = steppedLoopProgress(frameIndex, 6, dir === 1 ? 2 : 5);
    const splashY = round2(-80 - Math.sin(splashHop * Math.PI) * 5.5);
    waterStreams.push(
      svgEl('circle', {
        cx: round2(endX + dir * (2 + splashHop * 3.5)),
        cy: splashY,
        r: 1.7,
        fill: starWhite,
        opacity: 0.88,
      })
    );
  }

  // Tiny center crown sparkle bead popping above the lily bud
  const crownBeadY = round2(
    -111.5 - Math.abs(steppedOscillate(frameIndex, 6, 3.2, variant))
  );
  waterStreams.push(
    svgEl('circle', {
      cx: round2(deterministicJitter(23, frameIndex + variant, 1.2)),
      cy: crownBeadY,
      r: 2.2,
      fill: starWhite,
      stroke: catLightBlue,
      'stroke-width': 1,
      opacity: 0.92,
    })
  );

  const lilyFinial = svgEl('g', { 'data-part': 'lily-finial' }, [
    // Submerged lotus-leaf stone collar in center of basin
    crayonPath(
      'M -14 -79 C -14 -84, -8 -86, 0 -86 C 8 -86, 14 -84, 14 -79 C 10 -76, -10 -76, -14 -79 Z',
      paperDeep,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Fluted mini-stem rising to the lily bud
    crayonPath(
      'M -6 -81 L -4.5 -94 L 4.5 -94 L 6 -81 Z',
      paperShadow,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Carved stone lily-bud petals (outer left, outer right, center crown bud)
    crayonPath(
      'M -3 -93 C -11 -95, -12 -102, -5 -105 C -3 -101, -2 -96, -3 -93 Z',
      paperShadow,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      'M 3 -93 C 11 -95, 12 -102, 5 -105 C 3 -101, 2 -96, 3 -93 Z',
      paperDeep,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      'M -5.5 -93 C -7 -100, -3 -106, 0 -108 C 3 -106, 7 -100, 5.5 -93 C 2.5 -91.5, -2.5 -91.5, -5.5 -93 Z',
      paperWarm,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    // Subtle ochre wash on finial bud
    crayonPath(
      'M -4 -94 C -5 -99, -2 -104, 0 -106 C 2 -104, 5 -99, 4 -94 Z',
      getPatternFill('crayonOchre'),
      { stroke: 'none', opacity: 0.2, mask: fillMask }
    ),
    // Animated arcing water jets & sparkling droplets
    svgEl('g', { 'data-part': 'water-droplets' }, waterStreams),
  ]);

  // 6. Mossy Garden Tufts & Cozy Rim Moss (`data-part="moss-tufts"`)
  const mossTufts = svgEl('g', { 'data-part': 'moss-tufts' }, [
    // Left mossy cushion hugging pedestal base
    crayonPath(
      'M -58 4 C -60 -3, -53 -9, -46 -6 C -44 -13, -34 -13, -31 -6 C -26 -8, -21 -2, -23 4 C -34 6.5, -48 6.5, -58 4 Z',
      getPatternFill('crayonTreeGreen'),
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    crayonPath(
      'M -52 2 C -52 -3, -44 -7, -38 -4 C -35 -8, -28 -6, -27 2 C -34 4, -44 4, -52 2 Z',
      grassGreen,
      { stroke: 'none', opacity: 0.72, mask: fillMask }
    ),
    // Right mossy cushion hugging pedestal base
    crayonPath(
      'M 24 4 C 22 -3, 28 -9, 34 -6 C 38 -14, 48 -12, 50 -5 C 56 -7, 61 -1, 58 4 C 48 6.5, 34 6.5, 24 4 Z',
      getPatternFill('crayonTreeGreen'),
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    crayonPath(
      'M 30 2 C 31 -3, 37 -7, 42 -4 C 46 -7, 52 -5, 53 2 C 46 4, 36 4, 30 2 Z',
      grassGreen,
      { stroke: 'none', opacity: 0.72, mask: fillMask }
    ),
    // Small smooth garden pebbles nestled beside the moss
    crayonPath(
      'M -19 5 C -20 1, -13 0, -11 4 C -10 7, -18 7.5, -19 5 Z',
      paperDeep,
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M 14 5 C 14 1.5, 21 1, 22 4.5 C 22 7, 15 7.5, 14 5 Z',
      paperShadow,
      { strokeWidth: outlineThin }
    ),
    // Tiny antique moss patch draped over the left stone rim
    crayonPath(
      'M -68 -77 C -70 -82, -63 -85, -58 -82 C -54 -84, -49 -80, -52 -76 C -57 -74, -64 -74, -68 -77 Z',
      treeGreen,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      'M -64 -78 C -63 -81, -58 -82, -55 -79 C -57 -77, -61 -77, -64 -78 Z',
      grassGreen,
      { stroke: 'none', opacity: 0.8 }
    ),
    // Tiny sprouting grass blades flanking base
    svgEl('path', {
      d: 'M -55 -4 Q -59 -10, -56 -14 M -49 -6 Q -50 -13, -46 -15 M 47 -6 Q 49 -13, 53 -15 M 55 -3 Q 60 -9, 58 -13',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: annotationPencil,
      }),
    }),
  ]);

  // 7. Dancing Garden Fireflies (6 FPS stepped orbit when `lit !== false`) (`data-part="garden-fireflies"`)
  const fireflyEls: string[] = [];
  if (lit) {
    for (let i = 0; i < FIREFLY_SPECS.length; i++) {
      const spec = FIREFLY_SPECS[i]!;
      const jx = deterministicJitter(i * 13 + 3, variant, 1.8);
      const jy = deterministicJitter(i * 17 + 7, variant, 1.5);

      const curX = round2(
        spec.baseX +
          jx +
          steppedOscillate(
            frameIndex,
            spec.periodX,
            spec.ampX,
            spec.phase + variant
          )
      );
      const curY = round2(
        spec.baseY +
          jy +
          steppedOscillate(
            frameIndex,
            spec.periodY,
            spec.ampY,
            spec.phase + variant + 1
          )
      );

      // Previous two stepped positions for a delicate dashed flight trail
      const prev1X = round2(
        spec.baseX +
          jx +
          steppedOscillate(
            frameIndex - 1,
            spec.periodX,
            spec.ampX,
            spec.phase + variant
          )
      );
      const prev1Y = round2(
        spec.baseY +
          jy +
          steppedOscillate(
            frameIndex - 1,
            spec.periodY,
            spec.ampY,
            spec.phase + variant + 1
          )
      );
      const prev2X = round2(
        spec.baseX +
          jx +
          steppedOscillate(
            frameIndex - 2,
            spec.periodX,
            spec.ampX,
            spec.phase + variant
          )
      );
      const prev2Y = round2(
        spec.baseY +
          jy +
          steppedOscillate(
            frameIndex - 2,
            spec.periodY,
            spec.ampY,
            spec.phase + variant + 1
          )
      );

      const glowPulse = steppedOscillate(frameIndex, 6, 0.9, i * 2 + variant);
      const haloR = round2(spec.haloR + glowPulse);
      const haloOpacity = round2(0.28 + (glowPulse / 0.9) * 0.08);
      const wingUp = (frameIndex + i) % 2 === 0;
      const wingTiltY = wingUp ? -2.8 : -0.9;

      fireflyEls.push(
        svgEl('g', { 'data-part': `firefly-${i + 1}` }, [
          // Tiny soft dashed flight trail
          svgEl('path', {
            d: `M ${prev2X} ${prev2Y} Q ${prev1X} ${prev1Y}, ${curX} ${curY}`,
            fill: 'none',
            stroke: windowGlow,
            'stroke-width': 1.3,
            'stroke-linecap': 'round',
            'stroke-dasharray': '2 3.5',
            opacity: 0.62,
          }),
          // Flat warm crayon halo
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: haloR,
            fill: windowGlow,
            opacity: haloOpacity,
          }),
          // Subtle inner glow ring
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: round2(spec.coreR + 1.4),
            fill: bananaYellow,
            opacity: 0.45,
          }),
          // Delicate fluttering starWhite wings
          svgEl('ellipse', {
            cx: round2(curX - 2.6),
            cy: round2(curY + wingTiltY),
            rx: 2.6,
            ry: 1.5,
            fill: starWhite,
            stroke: charcoalOutline,
            'stroke-width': 0.9,
            opacity: 0.9,
          }),
          svgEl('ellipse', {
            cx: round2(curX + 2.6),
            cy: round2(curY + wingTiltY),
            rx: 2.6,
            ry: 1.5,
            fill: starWhite,
            stroke: charcoalOutline,
            'stroke-width': 0.9,
            opacity: 0.9,
          }),
          // Glowing firefly body mote
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: spec.coreR,
            fill: i % 2 === 0 ? bananaYellow : windowGlow,
            stroke: charcoalOutline,
            'stroke-width': 1.0,
          }),
          // Tiny starlight highlight pinpoint
          svgEl('circle', {
            cx: round2(curX - 0.8),
            cy: round2(curY - 0.8),
            r: 0.9,
            fill: starWhite,
          }),
        ])
      );
    }
  }

  const gardenFireflies = lit
    ? svgEl('g', { 'data-part': 'garden-fireflies' }, fireflyEls)
    : '';

  return svgEl(
    'g',
    {
      'data-prop': 'garden_fountain',
      'data-lit': String(lit),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      stoneBase,
      stonePedestal,
      stoneBasin,
      moonlitWater,
      lilyFinial,
      mossTufts,
      gardenFireflies,
    ]
  );
}
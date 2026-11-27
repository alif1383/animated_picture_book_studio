import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  deterministicJitter,
  gouachePath,
  round2,
  svgEl,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

interface ClassicFireflySpec {
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

// 5 fireflies orbiting gracefully around the moonlit fountain at 12 FPS
const CLASSIC_FIREFLY_SPECS: readonly ClassicFireflySpec[] = [
  {
    baseX: -40,
    baseY: -119,
    ampX: 7.5,
    ampY: 5.0,
    periodX: 28,
    periodY: 16,
    phase: 0,
    haloR: 11.5,
    coreR: 3.1,
  },
  {
    baseX: 6,
    baseY: -124,
    ampX: 8.5,
    ampY: 4.5,
    periodX: 32,
    periodY: 20,
    phase: 6,
    haloR: 12.2,
    coreR: 3.3,
  },
  {
    baseX: 48,
    baseY: -115,
    ampX: 7.0,
    ampY: 5.0,
    periodX: 26,
    periodY: 18,
    phase: 11,
    haloR: 11.0,
    coreR: 3.0,
  },
  {
    baseX: -69,
    baseY: -96,
    ampX: 6.0,
    ampY: 4.5,
    periodX: 24,
    periodY: 16,
    phase: 4,
    haloR: 11.4,
    coreR: 3.1,
  },
  {
    baseX: 69,
    baseY: -91,
    ampX: 6.0,
    ampY: 5.0,
    periodX: 24,
    periodY: 18,
    phase: 15,
    haloR: 11.4,
    coreR: 3.1,
  },
];

/**
 * Renders the Classic 1970s–1980s Disney weathered moonlit carved stone garden fountain
 * (`'garden_fountain'`) with cool slate/buff gouache washes, sketchy sepia carved stone
 * seams & moss, glistening deep-blue water pool with animated concentric 12 FPS ripples
 * & shimmering golden crescent reflection, delicate cel water arcs & splash droplets,
 * and 5 glowing golden fireflies orbiting with warm optical halos (`#cel-soft-glow`)
 * when `lit: true`.
 *
 * Local origin `(0, 0)` at ground contact center of the stone pedestal base.
 * Local bounds: `~x: -92..92, y: -144..8`.
 */
export function renderClassicGardenFountain(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-fountain-${name}${safeSuffix}`;

  const stoneGradId = pid('stone-grad');
  const bowlGradId = pid('bowl-grad');
  const waterGradId = pid('water-grad');
  const moonGlowId = pid('moon-glow');
  const fireflyHaloId = pid('firefly-halo');
  const plinthClipId = pid('plinth-clip');
  const pedestalClipId = pid('pedestal-clip');
  const basinClipId = pid('basin-clip');
  const rimClipId = pid('rim-clip');

  const defs = svgEl('defs', {}, [
    // Moonlit cool slate/buff carved stone wash
    svgEl(
      'linearGradient',
      { id: stoneGradId, x1: '0%', y1: '10%', x2: '100%', y2: '90%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.stoneLight }),
        svgEl('stop', { offset: '42%', 'stop-color': c.stoneBase }),
        svgEl('stop', { offset: '100%', 'stop-color': c.stoneShadow }),
      ]
    ),
    // Sculpted basin under-bowl shadow wash
    svgEl(
      'linearGradient',
      { id: bowlGradId, x1: '20%', y1: '0%', x2: '75%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.stoneBase }),
        svgEl('stop', { offset: '58%', 'stop-color': c.stoneShadow }),
        svgEl('stop', { offset: '100%', 'stop-color': c.nightSkyMid }),
      ]
    ),
    // Glistening deep-blue moonlit water pool radial wash
    svgEl(
      'radialGradient',
      { id: waterGradId, cx: '38%', cy: '44%', r: '62%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.waterMid }),
        svgEl('stop', { offset: '55%', 'stop-color': c.waterDeep }),
        svgEl('stop', { offset: '100%', 'stop-color': c.nightSkyZenith }),
      ]
    ),
    // Soft golden crescent reflection shimmer on water
    svgEl(
      'radialGradient',
      { id: moonGlowId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.45,
        }),
        svgEl('stop', {
          offset: '60%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0.14,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberDeep,
          'stop-opacity': 0,
        }),
      ]
    ),
    // Warm golden optical halation halo for orbiting fireflies
    svgEl(
      'radialGradient',
      { id: fireflyHaloId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberCore,
          'stop-opacity': 0.85,
        }),
        svgEl('stop', {
          offset: '42%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.44,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0,
        }),
      ]
    ),
  ]);

  // 1. Soft Painted Ground Shadow & Stepped Carved Stone Plinth (`data-part="stone-base"`)
  const stoneBase = svgEl('g', { 'data-part': 'stone-base' }, [
    celContactShadow(0, 2.8, 63, 6.2, 0.4),
    // Lower wide stone plinth step with 2-tone cel shading
    celShadedShape({
      d: 'M -49 2 C -50 -6, -43 -11, -34 -11 L 34 -11 C 43 -11, 50 -6, 49 2 C 44 6.5, -44 6.5, -49 2 Z',
      baseFill: svgUrl(stoneGradId),
      shadowPaths: [
        'M 8 -11 L 52 -11 L 52 8 L 2 8 Z',
        'M -50 -1 L 50 -1 L 50 8 L -50 8 Z',
      ],
      shadowFill: c.stoneShadow,
      shadowOpacity: 0.52,
      highlightPaths: ['M -48 -11 L -6 -11 L -12 -6 L -48 -4 Z'],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.55,
      clipId: plinthClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Warm buff weathered limestone gouache wash on plinth
    gouachePath(
      'M -42 -1 C -42 -5, -36 -9, -30 -9 L 18 -9 C 24 -9, 28 -5, 28 -1 C 20 3, -34 3, -42 -1 Z',
      c.cottagePlaster,
      { softEdge: false, opacity: 0.16 }
    ),
    // Upper stepped stone plinth ledge
    celPath(
      'M -36 -9 C -37 -16, -31 -20, -24 -20 L 24 -20 C 31 -20, 37 -16, 36 -9 C 31 -6, -31 -6, -36 -9 Z',
      svgUrl(stoneGradId),
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
    // Moonlit upper-left bevel & sketchy carved masonry seams
    svgEl('path', {
      d: 'M -33 -17 Q -12 -19, 12 -18',
      fill: 'none',
      stroke: c.celCream,
      'stroke-width': 1.4,
      'stroke-linecap': 'round',
      opacity: 0.45,
    }),
    svgEl('path', {
      d: 'M -24 -10 L -22 -2 M 18 -10 L 21 -2 M -34 -14 Q 0 -11, 34 -14 M -6 -19 L -5 -13',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.68,
      }),
    }),
  ]);

  // 2. Fluted Carved Stone Pedestal Column (`data-part="stone-pedestal"`)
  const stonePedestal = svgEl('g', { 'data-part': 'stone-pedestal' }, [
    celShadedShape({
      d: 'M -23 -18 C -21 -28, -14 -36, -15 -44 C -16 -52, -23 -56, -26 -62 L 26 -62 C 23 -56, 16 -52, 15 -44 C 14 -36, 21 -28, 23 -18 C 14 -14, -14 -14, -23 -18 Z',
      baseFill: svgUrl(stoneGradId),
      shadowPaths: [
        'M 3 -14 C 9 -26, 6 -36, 7 -44 C 8 -51, 13 -55, 17 -62 L 28 -62 L 28 -14 Z',
        'M -28 -62 L 28 -62 L 28 -53 Q 0 -50, -28 -53 Z',
      ],
      shadowFill: c.stoneShadow,
      shadowOpacity: 0.65,
      highlightPaths: [
        'M -24 -18 C -21 -28, -15 -36, -16 -44 C -17 -51, -22 -55, -25 -61 L -17 -61 C -14 -55, -10 -50, -10 -44 C -9 -36, -15 -28, -17 -18 Z',
      ],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.62,
      clipId: pedestalClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Subtle aged moss & buff stone gouache wash in pedestal waist
    gouachePath(
      'M -14 -45 Q -6 -41, 4 -44 Q 10 -38, 12 -30 Q -2 -34, -15 -32 Z',
      c.foliageMid,
      { softEdge: false, opacity: 0.22 }
    ),
    // Sketchy carved vertical flutes & antique stone cracks
    svgEl('path', {
      d: 'M -8 -20 C -6 -32, -6 -48, -9 -58 M 0 -19 C 1 -32, 1 -48, 0 -58 M 9 -20 C 7 -32, 7 -48, 10 -58 M -17 -26 L -12 -25',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.65,
      }),
    }),
    // Sculpted stone collar molding supporting the wide basin
    celPath(
      'M -30 -59 C -32 -65, -24 -68, 0 -68 C 24 -68, 32 -65, 30 -59 C 22 -55, -22 -55, -30 -59 Z',
      svgUrl(stoneGradId),
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
  ]);

  // 3. Wide Sculpted Stone Basin & Moonlit Carved Rim (`data-part="stone-basin"`)
  const stoneBasin = svgEl('g', { 'data-part': 'stone-basin' }, [
    // Carved saucer under-bowl
    celShadedShape({
      d: 'M -73 -78 C -69 -64, -44 -57, 0 -56 C 44 -57, 69 -64, 73 -78 C 46 -71, -46 -71, -73 -78 Z',
      baseFill: svgUrl(bowlGradId),
      shadowPaths: [
        'M -66 -73 C -56 -63, -34 -58, 0 -57 C 34 -58, 56 -63, 66 -73 L 75 -68 L 75 -54 L -75 -54 Z',
        'M 10 -78 L 75 -78 L 75 -55 L 4 -55 Z',
      ],
      shadowFill: c.nightSkyMid,
      shadowOpacity: 0.36,
      highlightPaths: [
        'M -72 -78 C -66 -68, -48 -63, -24 -61 L -36 -72 Z',
      ],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.38,
      clipId: basinClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Carved gadrooned stone ribs radiating around under-bowl
    svgEl('path', {
      d: 'M -52 -72 Q -46 -64, -38 -62 M -30 -70 Q -26 -62, -20 -59 M -10 -69 Q -9 -61, -7 -58 M 10 -69 Q 9 -61, 7 -58 M 30 -70 Q 26 -62, 20 -59 M 52 -72 Q 46 -64, 38 -62',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.68,
      }),
    }),
    // Outer wide carved stone basin lip / rim
    celShadedShape({
      d: 'M -75 -79 C -75 -89, -42 -93, 0 -93 C 42 -93, 75 -89, 75 -79 C 75 -69, 42 -65, 0 -65 C -42 -65, -75 -69, -75 -79 Z',
      baseFill: svgUrl(stoneGradId),
      shadowPaths: [
        'M 8 -94 L 78 -94 L 78 -64 L 0 -64 Z',
      ],
      shadowFill: c.stoneShadow,
      shadowOpacity: 0.35,
      highlightPaths: [
        'M -74 -79 C -74 -88, -42 -92, 0 -92 L 0 -89 C -40 -89, -70 -86, -70 -79 C -70 -73, -44 -69, -12 -68 L -18 -65 C -50 -66, -74 -70, -74 -79 Z',
      ],
      highlightFill: c.celCream,
      highlightOpacity: 0.42,
      clipId: rimClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Recessed inner carved stone rim wall
    celPath(
      'M -65 -80 C -65 -87, -36 -90, 0 -90 C 36 -90, 65 -87, 65 -80 C 65 -73, 36 -70, 0 -70 C -36 -70, -65 -73, -65 -80 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
  ]);

  // 4. Glistening Deep-Blue Moonlit Water Pool, Animated 12 FPS Ripples & Crescent Reflection
  const rippleA = steppedLoopProgress(frameIndex, 16, variant);
  const rippleB = steppedLoopProgress(frameIndex, 16, variant + 6);
  const rippleC = steppedLoopProgress(frameIndex, 16, variant + 11);
  const shimmerShift = steppedOscillate(frameIndex, 24, 2.4, variant);
  const moonBobY = steppedOscillate(frameIndex, 20, 0.85, variant + 3);
  const moonShiftX = steppedOscillate(frameIndex, 28, 1.3, variant);

  const innerRx = round2(11 + rippleA * 18);
  const innerRy = round2(2.0 + rippleA * 2.8);
  const midRx = round2(19 + rippleB * 24);
  const midRy = round2(3.2 + rippleB * 3.5);
  const outerRx = round2(28 + rippleC * 24);
  const outerRy = round2(4.4 + rippleC * 3.4);

  const moonCx = round2(-29 + moonShiftX);
  const moonCy = round2(-78.5 + moonBobY);

  const moonlitWater = svgEl('g', { 'data-part': 'moonlit-water' }, [
    // Deep sapphire moonlit water pool
    celPath(
      'M -62 -79 C -62 -85.5, -34 -88.5, 0 -88.5 C 34 -88.5, 62 -85.5, 62 -79 C 62 -73, 34 -70.5, 0 -70.5 C -34 -70.5, -62 -73, -62 -79 Z',
      svgUrl(waterGradId),
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    // Painterly moonlit water shimmer streaks
    svgEl('path', {
      d: `M ${round2(-48 + shimmerShift * 0.5)} -81.5 Q ${round2(-30 + shimmerShift)} -83.5, ${round2(-14 + shimmerShift * 0.4)} -81.2 M ${round2(16 - shimmerShift * 0.5)} -82.2 Q ${round2(34 - shimmerShift)} -84, ${round2(48 - shimmerShift * 0.5)} -81.2 M ${round2(10 + shimmerShift * 0.5)} -74.8 Q ${round2(28 + shimmerShift)} -73.2, ${round2(44 + shimmerShift * 0.4)} -75.2`,
      fill: 'none',
      stroke: c.waterHighlight,
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      opacity: 0.62,
    }),
    // Expanding smooth 12 FPS concentric water ripples around central spout
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: innerRx,
      ry: innerRy,
      fill: 'none',
      stroke: c.celCream,
      'stroke-width': 1.5,
      opacity: round2(0.84 * (1 - rippleA * 0.72)),
    }),
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: midRx,
      ry: midRy,
      fill: 'none',
      stroke: c.waterHighlight,
      'stroke-width': 1.35,
      'stroke-dasharray': '10 5',
      opacity: round2(0.76 * (1 - rippleB * 0.78)),
    }),
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: outerRx,
      ry: outerRy,
      fill: 'none',
      stroke: c.waterHighlight,
      'stroke-width': 1.1,
      'stroke-dasharray': '6 7',
      opacity: round2(0.56 * (1 - rippleC * 0.85)),
    }),
    // Delicate secondary splash rings where left & right water jets land
    svgEl('ellipse', {
      cx: -32,
      cy: -79,
      rx: round2(4 + rippleB * 7),
      ry: round2(1.1 + rippleB * 1.6),
      fill: 'none',
      stroke: c.celCream,
      'stroke-width': 1.1,
      opacity: round2(0.68 * (1 - rippleB * 0.8)),
    }),
    svgEl('ellipse', {
      cx: 32,
      cy: -79,
      rx: round2(4 + rippleA * 7),
      ry: round2(1.1 + rippleA * 1.6),
      fill: 'none',
      stroke: c.celCream,
      'stroke-width': 1.1,
      opacity: round2(0.68 * (1 - rippleA * 0.8)),
    }),

    // Shimmering golden crescent moon reflection & star glints (`data-part="moon-reflection"`)
    svgEl('g', { 'data-part': 'moon-reflection' }, [
      svgEl('ellipse', {
        cx: moonCx,
        cy: round2(moonCy + 1),
        rx: 12,
        ry: 6.5,
        fill: svgUrl(moonGlowId),
      }),
      // Reflected golden crescent
      svgEl('path', {
        d: `M ${round2(moonCx + 3.6)} ${round2(moonCy - 4.4)} C ${round2(moonCx - 3.6)} ${round2(moonCy - 4.2)}, ${round2(moonCx - 5.2)} ${round2(moonCy + 2.8)}, ${round2(moonCx + 3.8)} ${round2(moonCy + 3.6)} C ${round2(moonCx - 0.6)} ${round2(moonCy + 1.8)}, ${round2(moonCx - 0.8)} ${round2(moonCy - 2.2)}, ${round2(moonCx + 3.6)} ${round2(moonCy - 4.4)} Z`,
        fill: c.moonCream,
        stroke: c.warmAmberGlow,
        'stroke-width': 0.8,
        'stroke-linejoin': 'round',
        opacity: 0.94,
      }),
      // Broken shimmering golden ripple reflections beneath crescent
      svgEl('path', {
        d: `M ${round2(moonCx - 5.2)} ${round2(moonCy + 5.0)} Q ${moonCx} ${round2(moonCy + 5.8)}, ${round2(moonCx + 5.4)} ${round2(moonCy + 5.0)} M ${round2(moonCx - 3.0)} ${round2(moonCy + 7.0)} Q ${moonCx} ${round2(moonCy + 7.5)}, ${round2(moonCx + 3.2)} ${round2(moonCy + 7.0)}`,
        fill: 'none',
        stroke: c.warmAmberGlow,
        'stroke-width': 1.35,
        'stroke-linecap': 'round',
        opacity: 0.78,
      }),
      // Twinkling reflected starlight glints on right water surface
      svgEl('circle', {
        cx: round2(36 - shimmerShift * 0.35),
        cy: -77.8,
        r: round2(1.3 + Math.abs(steppedOscillate(frameIndex, 16, 0.5, variant))),
        fill: c.starGlow,
        opacity: 0.9,
      }),
      svgEl('circle', {
        cx: round2(46 + shimmerShift * 0.3),
        cy: -81.5,
        r: round2(1.0 + Math.abs(steppedOscillate(frameIndex, 20, 0.45, variant + 5))),
        fill: c.celCream,
        opacity: 0.82,
      }),
    ]),
  ]);

  // 5. Carved Lily-Bud Finial & Delicate 12 FPS Cel Water Arcs (`data-part="lily-finial"`)
  const arcPeakLift = steppedOscillate(frameIndex, 14, 1.8, variant);
  const waterStreams: string[] = [];

  for (const dir of [-1, 1] as const) {
    const startX = dir * 2;
    const startY = -105;
    const ctrlX = dir * 18;
    const ctrlY = round2(-124 - arcPeakLift);
    const endX = dir * 32;
    const endY = -79;

    // Translucent cel water ribbon + gleaming flowing highlight
    waterStreams.push(
      svgEl('path', {
        d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`,
        fill: 'none',
        stroke: c.waterHighlight,
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
        opacity: 0.68,
      }),
      svgEl('path', {
        d: `M ${startX} ${round2(startY - 0.8)} Q ${round2(ctrlX * 0.96)} ${round2(ctrlY + 1.0)}, ${round2(endX * 0.97)} ${round2(endY - 0.8)}`,
        fill: 'none',
        stroke: c.celCream,
        'stroke-width': 1.35,
        'stroke-linecap': 'round',
        'stroke-dasharray': '7 6',
        'stroke-dashoffset': round2(-((frameIndex % 12) * 2.2)),
        opacity: 0.92,
      })
    );

    // 4 smooth 12 FPS cel-shaded pearl water droplets travelling along each parabolic arc
    for (let d = 0; d < 4; d++) {
      const t = steppedLoopProgress(
        frameIndex,
        12,
        d * 3 + (dir === 1 ? 2 : 0) + variant
      );
      const u = 1 - t;
      const px = round2(u * u * startX + 2 * u * t * ctrlX + t * t * endX);
      const py = round2(u * u * startY + 2 * u * t * ctrlY + t * t * endY);
      const r = round2(1.8 + Math.sin(t * Math.PI) * 0.9);

      waterStreams.push(
        svgEl('circle', {
          cx: px,
          cy: py,
          r,
          fill: d % 2 === 0 ? c.celCream : c.waterHighlight,
          stroke: c.waterDeep,
          'stroke-width': 0.75,
          opacity: round2(0.88 + Math.sin(t * Math.PI) * 0.12),
        })
      );
    }

    // Lively parabolic splash droplets leaping from landing point
    const splashT1 = steppedLoopProgress(frameIndex, 10, dir === 1 ? 3 : 8);
    const splashT2 = steppedLoopProgress(frameIndex, 10, dir === 1 ? 8 : 3);
    waterStreams.push(
      svgEl('circle', {
        cx: round2(endX + dir * (2 + splashT1 * 5.2)),
        cy: round2(-79.5 - Math.sin(splashT1 * Math.PI) * 6.5),
        r: round2(1.6 * (1 - splashT1 * 0.3)),
        fill: c.celCream,
        opacity: round2(0.92 * (1 - splashT1 * 0.4)),
      }),
      svgEl('circle', {
        cx: round2(endX - dir * (1.5 + splashT2 * 3.8)),
        cy: round2(-79.5 - Math.sin(splashT2 * Math.PI) * 4.8),
        r: round2(1.3 * (1 - splashT2 * 0.3)),
        fill: c.waterHighlight,
        opacity: round2(0.85 * (1 - splashT2 * 0.4)),
      })
    );
  }

  // Central sparkling water plume cresting above the lily-bud spout
  const crownLift = Math.abs(steppedOscillate(frameIndex, 12, 3.6, variant));
  waterStreams.push(
    svgEl('ellipse', {
      cx: 0,
      cy: round2(-111 - crownLift),
      rx: 1.8,
      ry: 2.5,
      fill: c.celCream,
      stroke: c.waterHighlight,
      'stroke-width': 0.8,
      opacity: 0.94,
    }),
    svgEl('circle', {
      cx: round2(steppedOscillate(frameIndex, 16, 1.8, variant + 2)),
      cy: round2(-115 - crownLift * 0.6),
      r: 1.2,
      fill: c.celCream,
      opacity: 0.8,
    })
  );

  const lilyFinial = svgEl('g', { 'data-part': 'lily-finial' }, [
    // Submerged carved stone lotus collar in center of basin
    celPath(
      'M -14 -79 C -14 -84, -8 -86, 0 -86 C 8 -86, 14 -84, 14 -79 C 10 -76, -10 -76, -14 -79 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    // Fluted mini-stem rising to the lily bud
    celPath(
      'M -6 -81 L -4.5 -94 L 4.5 -94 L 6 -81 Z',
      svgUrl(stoneGradId),
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    // Carved stone lily-bud petals (left moonlit, right shaded, center crown)
    celPath(
      'M -3 -93 C -11 -95, -12 -102, -5 -105 C -3 -101, -2 -96, -3 -93 Z',
      c.stoneLight,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M 3 -93 C 11 -95, 12 -102, 5 -105 C 3 -101, 2 -96, 3 -93 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M -5.5 -93 C -7 -100, -3 -106, 0 -108 C 3 -106, 7 -100, 5.5 -93 C 2.5 -91.5, -2.5 -91.5, -5.5 -93 Z',
      svgUrl(stoneGradId),
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    // Animated 12 FPS cel water jets & sparkling droplets
    svgEl('g', { 'data-part': 'water-droplets' }, waterStreams),
  ]);

  // 6. Layered Gouache Moss Cushions, Rim Moss & Moonlit Pebbles (`data-part="moss-tufts"`)
  const mossTufts = svgEl('g', { 'data-part': 'moss-tufts' }, [
    // Left mossy cushion hugging pedestal base
    gouachePath(
      'M -59 4 C -61 -3, -54 -9, -46 -6 C -44 -13, -34 -13, -31 -6 C -26 -8, -21 -2, -23 4 C -34 6.5, -48 6.5, -59 4 Z',
      c.foliageShadow,
      { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    gouachePath(
      'M -54 2 C -54 -3, -45 -8, -38 -4 C -35 -9, -28 -6, -27 2 C -34 4, -45 4, -54 2 Z',
      c.foliageLit,
      { softEdge: false, opacity: 0.85 }
    ),
    // Right mossy cushion hugging pedestal base
    gouachePath(
      'M 24 4 C 22 -3, 28 -9, 34 -6 C 38 -14, 48 -12, 50 -5 C 56 -7, 62 -1, 59 4 C 48 6.5, 34 6.5, 24 4 Z',
      c.foliageShadow,
      { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    gouachePath(
      'M 30 2 C 31 -3, 37 -7, 42 -4 C 46 -7, 52 -5, 53 2 C 46 4, 36 4, 30 2 Z',
      c.foliageMid,
      { softEdge: false }
    ),
    // Smooth moonlit garden pebbles nestled beside moss
    celPath(
      'M -19 5 C -20 1, -13 0, -11 4 C -10 7, -18 7.5, -19 5 Z',
      c.stoneBase,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M 14 5 C 14 1.5, 21 1, 22 4.5 C 22 7, 15 7.5, 14 5 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    // Weathered antique moss draped over the left basin lip
    gouachePath(
      'M -68 -77 C -70 -82, -63 -85, -58 -82 C -54 -84, -49 -80, -52 -76 C -57 -74, -64 -74, -68 -77 Z',
      c.foliageShadow,
      { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    gouachePath(
      'M -64 -78 C -63 -81, -58 -82, -55 -79 C -57 -77, -61 -77, -64 -78 Z',
      c.foliageRim,
      { softEdge: false, opacity: 0.78 }
    ),
    // Crisp moonlit grass blades sprouting beside the base
    svgEl('path', {
      d: 'M -55 -4 Q -59 -10, -56 -14 M -49 -6 Q -50 -13, -46 -15 M 47 -6 Q 49 -13, 53 -15 M 55 -3 Q 60 -9, 58 -13',
      fill: 'none',
      ...celStrokeAttrs({ stroke: c.foliageRim, strokeWidth: 1.25, opacity: 0.8 }),
    }),
  ]);

  // 7. 5 Glowing Golden Fireflies Orbiting at 12 FPS with Warm Optical Halos (`#cel-soft-glow`)
  const fireflyEls: string[] = [];
  if (lit) {
    for (let i = 0; i < CLASSIC_FIREFLY_SPECS.length; i++) {
      const spec = CLASSIC_FIREFLY_SPECS[i]!;
      const jx = deterministicJitter(i * 13 + 3, variant, 1.8);
      const jy = deterministicJitter(i * 17 + 7, variant, 1.4);

      const posAt = (f: number): [number, number] => [
        round2(
          spec.baseX +
            jx +
            steppedOscillate(f, spec.periodX, spec.ampX, spec.phase + variant)
        ),
        round2(
          spec.baseY +
            jy +
            steppedOscillate(
              f,
              spec.periodY,
              spec.ampY,
              spec.phase + variant + 3
            )
        ),
      ];

      const [curX, curY] = posAt(frameIndex);
      const [prev1X, prev1Y] = posAt(frameIndex - 1);
      const [prev2X, prev2Y] = posAt(frameIndex - 2);

      const glowPulse = steppedOscillate(frameIndex, 16, 1.4, i * 4 + variant);
      const haloR = round2(spec.haloR + glowPulse);
      const wingFlutter = steppedOscillate(frameIndex, 4, 1, i * 2);
      const wingY = round2(-1.8 - wingFlutter * 1.1);

      fireflyEls.push(
        svgEl('g', { 'data-part': `firefly-${i + 1}` }, [
          // Soft luminous curved flight trail
          svgEl('path', {
            d: `M ${prev2X} ${prev2Y} Q ${prev1X} ${prev1Y}, ${curX} ${curY}`,
            fill: 'none',
            stroke: c.warmAmberGlow,
            'stroke-width': 1.25,
            'stroke-linecap': 'round',
            'stroke-dasharray': '2.5 3.5',
            opacity: 0.58,
          }),
          // Warm optical halation halo (#cel-soft-glow)
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: haloR,
            fill: svgUrl(fireflyHaloId),
            filter: softGlowFilter,
            opacity: round2(0.84 + (glowPulse / 1.4) * 0.14),
          }),
          // Translucent cel fluttering wings
          svgEl('ellipse', {
            cx: round2(curX - 2.6),
            cy: round2(curY + wingY),
            rx: 2.5,
            ry: 1.35,
            fill: c.celCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.7,
            opacity: 0.86,
          }),
          svgEl('ellipse', {
            cx: round2(curX + 2.6),
            cy: round2(curY + wingY),
            rx: 2.5,
            ry: 1.35,
            fill: c.celCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.7,
            opacity: 0.86,
          }),
          // Glowing golden firefly lantern body
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: spec.coreR,
            fill: i % 2 === 0 ? c.warmAmberCore : c.warmAmberGlow,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.85,
          }),
          // Bright specular core pinpoint
          svgEl('circle', {
            cx: round2(curX - 0.7),
            cy: round2(curY - 0.7),
            r: 1.0,
            fill: c.celCream,
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
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [
      defs,
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

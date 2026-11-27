import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  gouacheDabWash,
  gouachePath,
  round2,
  svgEl,
  xeroxSketchStroke,
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
  washR: number;
  coreR: number;
}

// 5 charming fireflies orbiting smoothly around the moonlit stone fountain at 12 FPS
const CLASSIC_FIREFLY_SPECS: readonly ClassicFireflySpec[] = [
  {
    baseX: -40,
    baseY: -119,
    ampX: 7.5,
    ampY: 5.0,
    periodX: 28,
    periodY: 16,
    phase: 0,
    washR: 7.5,
    coreR: 2.8,
  },
  {
    baseX: 6,
    baseY: -124,
    ampX: 8.5,
    ampY: 4.5,
    periodX: 32,
    periodY: 20,
    phase: 6,
    washR: 8.0,
    coreR: 3.0,
  },
  {
    baseX: 48,
    baseY: -115,
    ampX: 7.0,
    ampY: 5.0,
    periodX: 26,
    periodY: 18,
    phase: 11,
    washR: 7.2,
    coreR: 2.7,
  },
  {
    baseX: -69,
    baseY: -96,
    ampX: 6.0,
    ampY: 4.5,
    periodX: 24,
    periodY: 16,
    phase: 4,
    washR: 7.4,
    coreR: 2.8,
  },
  {
    baseX: 69,
    baseY: -91,
    ampX: 6.0,
    ampY: 5.0,
    periodX: 24,
    periodY: 18,
    phase: 15,
    washR: 7.4,
    coreR: 2.8,
  },
];

/**
 * Renders the Classic 1970s–1980s Disney weathered painted stone garden fountain
 * (`'garden_fountain'`) with mottled gouache stonework (`gouacheDabWash`), sketchy
 * hand-inked stone cracks & carved moldings (`xeroxSketchStroke`), flat painterly
 * indigo water pool with thin hand-inked parchment ripples & painted ochre crescent
 * reflection, crisp hand-inked cel water arcs & droplets (zero digital blur!), and
 * 5 painted cream-gold firefly specks with tiny soft warm watercolor wash halos &
 * 2-frame hand-inked flight trails when `lit: true` (zero neon bokeh orbs!).
 *
 * Local origin `(0, 0)` at ground contact center of the stone pedestal base.
 * Local bounds: `~x: -92..92, y: -144..8`.
 */
export function renderClassicGardenFountain(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-fountain-${name}${safeSuffix}`;

  const plinthClipId = pid('plinth-clip');
  const pedestalClipId = pid('pedestal-clip');
  const basinClipId = pid('basin-clip');
  const rimClipId = pid('rim-clip');
  const waterClipId = pid('water-clip');

  const plinthD =
    'M -49 2 C -50 -6, -43 -11, -34 -11 L 34 -11 C 43 -11, 50 -6, 49 2 C 44 6.5, -44 6.5, -49 2 Z';
  const pedestalD =
    'M -23 -18 C -21 -28, -14 -36, -15 -44 C -16 -52, -23 -56, -26 -62 L 26 -62 C 23 -56, 16 -52, 15 -44 C 14 -36, 21 -28, 23 -18 C 14 -14, -14 -14, -23 -18 Z';
  const underBowlD =
    'M -73 -78 C -69 -64, -44 -57, 0 -56 C 44 -57, 69 -64, 73 -78 C 46 -71, -46 -71, -73 -78 Z';
  const rimD =
    'M -75 -79 C -75 -89, -42 -93, 0 -93 C 42 -93, 75 -89, 75 -79 C 75 -69, 42 -65, 0 -65 C -42 -65, -75 -69, -75 -79 Z';
  const waterD =
    'M -62 -79 C -62 -85.5, -34 -88.5, 0 -88.5 C 34 -88.5, 62 -85.5, 62 -79 C 62 -73, 34 -70.5, 0 -70.5 C -34 -70.5, -62 -73, -62 -79 Z';

  // Local clip paths keep weathered stone & water gouache washes strictly within carved planes
  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: plinthClipId }, svgEl('path', { d: plinthD })),
    svgEl('clipPath', { id: pedestalClipId }, svgEl('path', { d: pedestalD })),
    svgEl('clipPath', { id: basinClipId }, svgEl('path', { d: underBowlD })),
    svgEl('clipPath', { id: rimClipId }, svgEl('path', { d: rimD })),
    svgEl('clipPath', { id: waterClipId }, svgEl('path', { d: waterD })),
  ]);

  // 1. Ground Contact Shadow & Weathered Painted Stone Plinth (`data-part="stone-base"`)
  const stoneBase = svgEl('g', { 'data-part': 'stone-base' }, [
    celContactShadow(0, 2.8, 63, 6.0, 0.38),
    // Lower stone plinth flat gouache base + clipped stone mottling
    gouachePath(plinthD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(plinthClipId) }, [
      gouacheDabWash(
        [
          { cx: -28, cy: -5, rx: 22, ry: 7, fill: c.stoneLight, opacity: 0.62 },
          { cx: -4, cy: -4, rx: 18, ry: 6, fill: c.boardToothWarm, opacity: 0.32 },
          { cx: 26, cy: -2, rx: 24, ry: 9, fill: c.stoneShadow, opacity: 0.72 },
          { cx: 0, cy: 4, rx: 46, ry: 4.5, fill: c.stoneShadow, opacity: 0.62 },
        ],
        { fill: c.stoneBase, wetEdgeOpacity: 0.16, softEdge: true, seed: 83 }
      ),
    ]),
    xeroxSketchStroke(plinthD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    // Upper stepped stone plinth ledge
    celShadedShape({
      d: 'M -36 -9 C -37 -16, -31 -20, -24 -20 L 24 -20 C 31 -20, 37 -16, 36 -9 C 31 -6, -31 -6, -36 -9 Z',
      baseFill: c.stoneBase,
      shadowPaths: ['M 6 -20 L 38 -20 L 38 -5 L 0 -5 Z'],
      shadowFill: c.stoneShadow,
      shadowOpacity: 0.65,
      highlightPaths: ['M -36 -20 L -4 -20 L -8 -14 L -36 -14 Z'],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.58,
      clipId: pid('upper-plinth-clip'),
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Sketchy sepia-ink carved masonry seams & stone weathering cracks
    xeroxSketchStroke(
      'M -24 -10 L -22 -2 M 18 -10 L 21 -2 M -34 -14 Q 0 -11, 34 -14 M -7 -19 L -6 -13 M -39 -5 L -33 -3',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }
    ),
  ]);

  // 2. Weathered Carved Stone Pedestal Column (`data-part="stone-pedestal"`)
  const stonePedestal = svgEl('g', { 'data-part': 'stone-pedestal' }, [
    gouachePath(pedestalD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(pedestalClipId) }, [
      gouacheDabWash(
        [
          { cx: -14, cy: -38, rx: 10, ry: 22, fill: c.stoneLight, opacity: 0.65 },
          { cx: -2, cy: -32, rx: 12, ry: 16, fill: c.boardToothWarm, opacity: 0.28 },
          { cx: 14, cy: -38, rx: 13, ry: 24, fill: c.stoneShadow, opacity: 0.78 },
          { cx: 0, cy: -58, rx: 24, ry: 7, fill: c.stoneShadow, opacity: 0.72 },
          // Subtle aged moss patina dab in carved waist
          { cx: -5, cy: -42, rx: 9, ry: 6, fill: c.oliveCanopy, opacity: 0.32 },
        ],
        { fill: c.stoneBase, wetEdgeOpacity: 0.18, softEdge: true, seed: 89 }
      ),
    ]),
    xeroxSketchStroke(pedestalD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    // Sketchy vertical flutes & weathered stone cracks
    xeroxSketchStroke(
      'M -8 -20 C -6 -32, -6 -48, -9 -58 M 0 -19 C 1 -32, 1 -48, 0 -58 M 9 -20 C 7 -32, 7 -48, 10 -58 M -17 -26 L -12 -25 M 11 -35 L 15 -34',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.75,
      }
    ),
    // Sculpted stone collar molding supporting the wide basin
    celPath(
      'M -30 -59 C -32 -65, -24 -68, 0 -68 C 24 -68, 32 -65, 30 -59 C 22 -55, -22 -55, -30 -59 Z',
      c.stoneBase,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
  ]);

  // 3. Wide Carved Stone Basin & Weathered Rim (`data-part="stone-basin"`)
  const stoneBasin = svgEl('g', { 'data-part': 'stone-basin' }, [
    // Carved saucer under-bowl
    gouachePath(underBowlD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(basinClipId) }, [
      gouacheDabWash(
        [
          { cx: -38, cy: -70, rx: 28, ry: 11, fill: c.stoneLight, opacity: 0.45 },
          { cx: 12, cy: -64, rx: 46, ry: 14, fill: c.stoneShadow, opacity: 0.76 },
          { cx: 36, cy: -68, rx: 32, ry: 12, fill: c.nightSkyMid, opacity: 0.35 },
          { cx: -20, cy: -62, rx: 14, ry: 6, fill: c.oliveCanopy, opacity: 0.28 },
        ],
        { fill: c.stoneShadow, wetEdgeOpacity: 0.16, softEdge: true, seed: 97 }
      ),
    ]),
    xeroxSketchStroke(underBowlD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    // Hand-inked carved gadrooning ribs radiating around bowl exterior
    xeroxSketchStroke(
      'M -52 -72 Q -46 -64, -38 -62 M -30 -70 Q -26 -62, -20 -59 M -10 -69 Q -9 -61, -7 -58 M 10 -69 Q 9 -61, 7 -58 M 30 -70 Q 26 -62, 20 -59 M 52 -72 Q 46 -64, 38 -62',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.76,
      }
    ),
    // Outer wide carved stone basin lip / rim
    gouachePath(rimD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(rimClipId) }, [
      gouacheDabWash(
        [
          { cx: -36, cy: -80, rx: 38, ry: 13, fill: c.stoneLight, opacity: 0.65 },
          { cx: -12, cy: -84, rx: 28, ry: 10, fill: c.boardToothWarm, opacity: 0.34 },
          { cx: 38, cy: -78, rx: 38, ry: 14, fill: c.stoneShadow, opacity: 0.62 },
        ],
        { fill: c.stoneBase, wetEdgeOpacity: 0.14, softEdge: true, seed: 101 }
      ),
    ]),
    xeroxSketchStroke(rimD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    // Recessed inner carved stone rim wall
    celPath(
      'M -65 -80 C -65 -87, -36 -90, 0 -90 C 36 -90, 65 -87, 65 -80 C 65 -73, 36 -70, 0 -70 C -36 -70, -65 -73, -65 -80 Z',
      c.stoneShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
  ]);

  // 4. Flat Painterly Indigo Water Pool, Thin Hand-Inked Parchment Ripples & Ochre Crescent
  const rippleA = steppedLoopProgress(frameIndex, 16, variant);
  const rippleB = steppedLoopProgress(frameIndex, 16, variant + 6);
  const rippleC = steppedLoopProgress(frameIndex, 16, variant + 11);
  const shimmerShift = steppedOscillate(frameIndex, 24, 2.2, variant);
  const moonBobY = steppedOscillate(frameIndex, 20, 0.8, variant + 3);
  const moonShiftX = steppedOscillate(frameIndex, 28, 1.2, variant);

  const innerRx = round2(11 + rippleA * 18);
  const innerRy = round2(2.0 + rippleA * 2.8);
  const midRx = round2(19 + rippleB * 24);
  const midRy = round2(3.2 + rippleB * 3.5);
  const outerRx = round2(28 + rippleC * 24);
  const outerRy = round2(4.4 + rippleC * 3.4);

  const moonCx = round2(-29 + moonShiftX);
  const moonCy = round2(-78.5 + moonBobY);
  const xeroxFilter = svgUrl(TOKENS.classicCel.filters.ids.xeroxInk);

  const moonlitWater = svgEl('g', { 'data-part': 'moonlit-water' }, [
    // Flat painterly indigo water pool with soft mid-indigo gouache dab inside
    celPath(waterD, c.waterDeep, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('g', { 'clip-path': svgUrl(waterClipId) }, [
      gouacheDabWash(
        [
          { cx: -12, cy: -80, rx: 36, ry: 7.5, fill: c.waterMid, opacity: 0.62 },
          { cx: 24, cy: -78, rx: 26, ry: 6.0, fill: c.slateBlue, opacity: 0.34 },
        ],
        { fill: c.waterMid, wetEdgeOpacity: 0.12, softEdge: true, seed: 107 }
      ),
    ]),
    // Thin hand-inked parchment/cream water shimmer lines
    xeroxSketchStroke(
      `M ${round2(-48 + shimmerShift * 0.5)} -81.5 Q ${round2(-30 + shimmerShift)} -83.2, ${round2(-15 + shimmerShift * 0.4)} -81.2 M ${round2(16 - shimmerShift * 0.5)} -82.0 Q ${round2(34 - shimmerShift)} -83.6, ${round2(48 - shimmerShift * 0.5)} -81.2 M ${round2(10 + shimmerShift * 0.5)} -74.8 Q ${round2(28 + shimmerShift)} -73.4, ${round2(44 + shimmerShift * 0.4)} -75.2`,
      {
        stroke: c.waterHighlight,
        strokeWidth: 1.25,
        broken: true,
        opacity: 0.68,
      }
    ),
    // Expanding thin hand-inked white/parchment concentric water ripple rings (12 FPS)
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: innerRx,
      ry: innerRy,
      fill: 'none',
      stroke: c.parchmentCream,
      'stroke-width': 1.25,
      filter: xeroxFilter,
      opacity: round2(0.84 * (1 - rippleA * 0.72)),
    }),
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: midRx,
      ry: midRy,
      fill: 'none',
      stroke: c.parchmentCream,
      'stroke-width': 1.1,
      'stroke-dasharray': '9 5',
      filter: xeroxFilter,
      opacity: round2(0.72 * (1 - rippleB * 0.78)),
    }),
    svgEl('ellipse', {
      cx: 0,
      cy: -79,
      rx: outerRx,
      ry: outerRy,
      fill: 'none',
      stroke: c.waterHighlight,
      'stroke-width': 0.95,
      'stroke-dasharray': '5 7',
      filter: xeroxFilter,
      opacity: round2(0.55 * (1 - rippleC * 0.85)),
    }),
    // Delicate splash ripple rings at jet landing spots
    svgEl('ellipse', {
      cx: -32,
      cy: -79,
      rx: round2(4 + rippleB * 6.5),
      ry: round2(1.0 + rippleB * 1.5),
      fill: 'none',
      stroke: c.parchmentCream,
      'stroke-width': 1.0,
      opacity: round2(0.68 * (1 - rippleB * 0.8)),
    }),
    svgEl('ellipse', {
      cx: 32,
      cy: -79,
      rx: round2(4 + rippleA * 6.5),
      ry: round2(1.0 + rippleA * 1.5),
      fill: 'none',
      stroke: c.parchmentCream,
      'stroke-width': 1.0,
      opacity: round2(0.68 * (1 - rippleA * 0.8)),
    }),

    // Painted ochre/parchment crescent reflection (`data-part="moon-reflection"`, NO digital blur!)
    svgEl('g', { 'data-part': 'moon-reflection' }, [
      svgEl('path', {
        d: `M ${round2(moonCx + 3.6)} ${round2(moonCy - 4.4)} C ${round2(moonCx - 3.6)} ${round2(moonCy - 4.2)}, ${round2(moonCx - 5.2)} ${round2(moonCy + 2.8)}, ${round2(moonCx + 3.8)} ${round2(moonCy + 3.6)} C ${round2(moonCx - 0.6)} ${round2(moonCy + 1.8)}, ${round2(moonCx - 0.8)} ${round2(moonCy - 2.2)}, ${round2(moonCx + 3.6)} ${round2(moonCy - 4.4)} Z`,
        fill: c.moonAmber,
        stroke: c.moonCream,
        'stroke-width': 0.75,
        'stroke-linejoin': 'round',
        opacity: 0.92,
      }),
      // Broken hand-painted ochre reflection strokes below crescent
      xeroxSketchStroke(
        `M ${round2(moonCx - 5.2)} ${round2(moonCy + 5.0)} Q ${moonCx} ${round2(moonCy + 5.7)}, ${round2(moonCx + 5.4)} ${round2(moonCy + 5.0)} M ${round2(moonCx - 3.0)} ${round2(moonCy + 6.9)} Q ${moonCx} ${round2(moonCy + 7.4)}, ${round2(moonCx + 3.2)} ${round2(moonCy + 6.9)}`,
        {
          stroke: c.moonCream,
          strokeWidth: 1.2,
          broken: true,
          opacity: 0.78,
        }
      ),
      // Tiny painted parchment starlight pinprick glints on water
      svgEl('circle', {
        cx: round2(36 - shimmerShift * 0.35),
        cy: -77.8,
        r: round2(1.2 + Math.abs(steppedOscillate(frameIndex, 16, 0.4, variant))),
        fill: c.parchmentCream,
        opacity: 0.88,
      }),
      svgEl('circle', {
        cx: round2(46 + shimmerShift * 0.3),
        cy: -81.5,
        r: round2(0.95 + Math.abs(steppedOscillate(frameIndex, 20, 0.35, variant + 5))),
        fill: c.parchmentCream,
        opacity: 0.78,
      }),
    ]),
  ]);

  // 5. Carved Stone Lily-Bud Finial & Crisp Hand-Inked Cel Water Arcs (`data-part="lily-finial"`)
  const arcPeakLift = steppedOscillate(frameIndex, 14, 1.8, variant);
  const waterStreams: string[] = [];

  for (const dir of [-1, 1] as const) {
    const startX = dir * 2;
    const startY = -105;
    const ctrlX = dir * 18;
    const ctrlY = round2(-124 - arcPeakLift);
    const endX = dir * 32;
    const endY = -79;

    // Crisp hand-inked flat cel water arc (zero digital blur!)
    waterStreams.push(
      svgEl('path', {
        d: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY}, ${endX} ${endY}`,
        fill: 'none',
        stroke: c.waterHighlight,
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        filter: xeroxFilter,
        opacity: 0.84,
      }),
      svgEl('path', {
        d: `M ${startX} ${round2(startY - 0.8)} Q ${round2(ctrlX * 0.96)} ${round2(ctrlY + 1.0)}, ${round2(endX * 0.97)} ${round2(endY - 0.8)}`,
        fill: 'none',
        stroke: c.parchmentCream,
        'stroke-width': 1.25,
        'stroke-linecap': 'round',
        'stroke-dasharray': '6 5',
        'stroke-dashoffset': round2(-((frameIndex % 12) * 2.2)),
        filter: xeroxFilter,
        opacity: 0.94,
      })
    );

    // 4 crisp hand-inked cel water pearls travelling along each parabolic arc at 12 FPS
    for (let d = 0; d < 4; d++) {
      const t = steppedLoopProgress(
        frameIndex,
        12,
        d * 3 + (dir === 1 ? 2 : 0) + variant
      );
      const u = 1 - t;
      const px = round2(u * u * startX + 2 * u * t * ctrlX + t * t * endX);
      const py = round2(u * u * startY + 2 * u * t * ctrlY + t * t * endY);
      const r = round2(1.75 + Math.sin(t * Math.PI) * 0.85);

      waterStreams.push(
        svgEl('circle', {
          cx: px,
          cy: py,
          r,
          fill: d % 2 === 0 ? c.parchmentCream : c.waterHighlight,
          stroke: c.xeroxInkSoft,
          'stroke-width': 0.8,
          opacity: 0.95,
        })
      );
    }

    // Crisp cel splash droplets leaping where each water jet lands
    const splashT1 = steppedLoopProgress(frameIndex, 10, dir === 1 ? 3 : 8);
    const splashT2 = steppedLoopProgress(frameIndex, 10, dir === 1 ? 8 : 3);
    waterStreams.push(
      svgEl('circle', {
        cx: round2(endX + dir * (2 + splashT1 * 5.0)),
        cy: round2(-79.5 - Math.sin(splashT1 * Math.PI) * 6.2),
        r: round2(1.5 * (1 - splashT1 * 0.3)),
        fill: c.parchmentCream,
        stroke: c.xeroxInkSoft,
        'stroke-width': 0.65,
        opacity: round2(0.92 * (1 - splashT1 * 0.35)),
      }),
      svgEl('circle', {
        cx: round2(endX - dir * (1.5 + splashT2 * 3.6)),
        cy: round2(-79.5 - Math.sin(splashT2 * Math.PI) * 4.6),
        r: round2(1.25 * (1 - splashT2 * 0.3)),
        fill: c.waterHighlight,
        opacity: round2(0.86 * (1 - splashT2 * 0.35)),
      })
    );
  }

  // Crisp central cel water crown bead popping above the stone lily bud
  const crownLift = Math.abs(steppedOscillate(frameIndex, 12, 3.5, variant));
  waterStreams.push(
    svgEl('ellipse', {
      cx: 0,
      cy: round2(-111 - crownLift),
      rx: 1.7,
      ry: 2.3,
      fill: c.parchmentCream,
      stroke: c.xeroxInkSoft,
      'stroke-width': 0.75,
    }),
    svgEl('circle', {
      cx: round2(steppedOscillate(frameIndex, 16, 1.6, variant + 2)),
      cy: round2(-115 - crownLift * 0.6),
      r: 1.15,
      fill: c.parchmentCream,
    })
  );

  const lilyFinial = svgEl('g', { 'data-part': 'lily-finial' }, [
    celPath(
      'M -14 -79 C -14 -84, -8 -86, 0 -86 C 8 -86, 14 -84, 14 -79 C 10 -76, -10 -76, -14 -79 Z',
      c.stoneShadow,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath('M -6 -81 L -4.5 -94 L 4.5 -94 L 6 -81 Z', c.stoneBase, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
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
      c.stoneBase,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    svgEl('g', { 'data-part': 'water-droplets' }, waterStreams),
  ]);

  // 6. Dappled Watercolor Moss Pads, Rim Moss & Sketchy Grass Flicks (`data-part="moss-tufts"`)
  const mossTufts = svgEl('g', { 'data-part': 'moss-tufts' }, [
    // Impressionistic painted olive/sage moss cushions hugging base (NO hard pillow outlines!)
    gouacheDabWash(
      [
        { cx: -45, cy: 0, rx: 16, ry: 7.5, fill: c.foliageShadow, opacity: 0.88 },
        { cx: -32, cy: -1, rx: 12, ry: 6.5, fill: c.foliageMid, opacity: 0.85 },
        { cx: -40, cy: -3, rx: 11, ry: 5.0, fill: c.oliveCanopy, opacity: 0.82 },
        { cx: 36, cy: 0, rx: 13, ry: 6.5, fill: c.foliageMid, opacity: 0.85 },
        { cx: 48, cy: 0, rx: 15, ry: 7.5, fill: c.foliageShadow, opacity: 0.88 },
        { cx: 42, cy: -3, rx: 10, ry: 5.0, fill: c.sageFoliage, opacity: 0.78 },
        // Antique moss dab draped over the left stone rim
        { cx: -60, cy: -78, rx: 9.5, ry: 4.5, fill: c.oliveCanopy, opacity: 0.84 },
        { cx: -57, cy: -79, rx: 5.5, ry: 2.8, fill: c.foliageRim, opacity: 0.65 },
      ],
      {
        fill: c.foliageMid,
        wetEdgeColor: c.foliageShadow,
        wetEdgeOpacity: 0.28,
        highlightFill: c.foliageRim,
        highlightOpacity: 0.28,
        softEdge: true,
        seed: 113,
      }
    ),
    // Smooth weathered garden pebbles nestled beside moss
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
    // Sparse crooked hand-inked grass & moss tuft flicks (Robin Hood style!)
    xeroxSketchStroke(
      'M -56 -2 Q -60 -9, -57 -13 M -49 -5 Q -50 -12, -46 -14 M -38 -5 Q -37 -10, -34 -11 M 36 -4 Q 38 -10, 41 -12 M 47 -5 Q 50 -12, 54 -14 M 56 -2 Q 61 -8, 59 -12 M -66 -77 Q -61 -82, -55 -78',
      { stroke: c.xeroxInkSoft, strokeWidth: 1.15, opacity: 0.84 }
    ),
  ]);

  // 7. 5 Charming Painted Cream-Gold Firefly Specks with Tiny Soft Warm Wash Halos & 2-Frame Trails
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

      const pulse = steppedOscillate(frameIndex, 16, 1.0, i * 4 + variant);
      const washR = round2(spec.washR + pulse);
      const wingFlutter = steppedOscillate(frameIndex, 4, 1, i * 2);
      const wingY = round2(-1.6 - wingFlutter * 1.0);

      fireflyEls.push(
        svgEl('g', { 'data-part': `firefly-${i + 1}` }, [
          // Delicate 2-frame hand-inked curved motion trail
          xeroxSketchStroke(
            `M ${prev2X} ${prev2Y} Q ${prev1X} ${prev1Y}, ${curX} ${curY}`,
            {
              stroke: c.warmAmberGlow,
              strokeWidth: 1.1,
              dasharray: '2.5 3.5',
              opacity: 0.62,
            }
          ),
          // Tiny soft painted warm watercolor wash dab (NO neon bokeh orb!)
          gouacheDabWash(
            [
              {
                cx: curX,
                cy: curY,
                rx: washR,
                ry: round2(washR * 0.88),
                opacity: round2(0.26 + (pulse + 1) * 0.05),
              },
            ],
            {
              fill: c.warmAmberGlow,
              wetEdgeOpacity: 0,
              softEdge: true,
              seed: 121 + i * 7,
            }
          ),
          // Crisp tiny hand-inked cel fluttering wings
          svgEl('ellipse', {
            cx: round2(curX - 2.3),
            cy: round2(curY + wingY),
            rx: 2.2,
            ry: 1.2,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.7,
            opacity: 0.9,
          }),
          svgEl('ellipse', {
            cx: round2(curX + 2.3),
            cy: round2(curY + wingY),
            rx: 2.2,
            ry: 1.2,
            fill: c.parchmentCream,
            stroke: c.xeroxInkSoft,
            'stroke-width': 0.7,
            opacity: 0.9,
          }),
          // Flat painted cream-gold firefly speck with fine Xerox outline
          svgEl('circle', {
            cx: curX,
            cy: curY,
            r: spec.coreR,
            fill: i % 2 === 0 ? c.warmAmberCore : c.warmAmberGlow,
            stroke: c.xeroxInk,
            'stroke-width': 0.85,
          }),
          svgEl('circle', {
            cx: round2(curX - 0.6),
            cy: round2(curY - 0.6),
            r: 0.85,
            fill: c.parchmentCream,
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
      clipDefs,
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

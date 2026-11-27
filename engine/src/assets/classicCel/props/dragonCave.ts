import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  gouachePath,
  pencilFoliageScribbles,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type {
  PencilFoliageCluster,
  WatercolorBlotch,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders the 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973 illustration-board)
 * Rocky Hillside Dragon Cave (`'dragon_cave'`).
 *
 * - Background Layer 1A painterly watercolor/gouache hillside rock dome with soft
 *   wet-on-wet rock & ochre strata mottling, crisp loose Xerox graphite fracture
 *   lines, mossy crag ledges (`watercolorWashBlotches` + `pencilFoliageScribbles`),
 *   deep vaulted cave entrance (`caveRockDark` / `backdropDark`), hiccup soot wash,
 *   flanking mossy boulders, and tangled thorny bramble bush at the right base.
 * - Origin `(0, 0)` sits at bottom-center ground contact.
 * - Exact local SVG bounds: `x: -175..+175, y: -255..+6` (`350 × 261`).
 */
export function renderClassicDragonCave(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const domeClipId = `cc-cave-dome-clip-${uid}`;
  const boulderL1ClipId = `cc-cave-boulder-l1-${uid}`;
  const boulderL2ClipId = `cc-cave-boulder-l2-${uid}`;
  const boulderR1ClipId = `cc-cave-boulder-r1-${uid}`;

  // Gentle 12 FPS woodland breeze on the thorny bramble foliage only (rock stays solid!)
  const brambleSway = steppedOscillate(frameIndex, 36, 0.9, variant * 5);

  // Main rocky hillside dome silhouette (x: -172..+170, y: -253..+3)
  const domeD = [
    'M -172 3',
    'C -170 -36, -164 -78, -148 -118',
    'L -132 -152',
    'C -118 -178, -96 -202, -72 -222',
    'L -48 -242',
    'C -28 -253, 10 -253, 34 -244',
    'L 74 -226',
    'C 104 -202, 128 -168, 146 -126',
    'C 160 -84, 168 -40, 170 3',
    'L 78 3 L -78 3 Z',
  ].join(' ');

  // 1. Wet-on-wet rocky hillside dome (`data-part="cave-rock-dome"`)
  const domeWashBlotches: WatercolorBlotch[] = [
    // Deep shadowed left & lower crag faces
    { cx: -132, cy: -68, rx: 48, ry: 56, fill: c.caveRockDark, opacity: 0.56, rotate: -14 },
    { cx: -102, cy: -158, rx: 46, ry: 40, fill: c.caveRockDark, opacity: 0.48, rotate: -22 },
    { cx: 128, cy: -74, rx: 46, ry: 54, fill: c.caveRockDark, opacity: 0.52, rotate: 12 },
    { cx: 92, cy: -166, rx: 44, ry: 38, fill: c.stoneShadow, opacity: 0.46, rotate: 18 },
    // Mid weathered slate-brown hillside body washes
    { cx: -48, cy: -194, rx: 58, ry: 42, fill: c.caveRockMid, opacity: 0.62, rotate: -8 },
    { cx: 42, cy: -196, rx: 56, ry: 40, fill: c.caveRockMid, opacity: 0.58, rotate: 10 },
    { cx: -116, cy: -112, rx: 40, ry: 36, fill: c.russetEarth, opacity: 0.34, rotate: -12 },
    { cx: 112, cy: -118, rx: 42, ry: 36, fill: c.russetEarth, opacity: 0.32, rotate: 14 },
    // Sunlit warm limestone upper crown highlights
    { cx: -16, cy: -226, rx: 54, ry: 28, fill: c.caveRockLit, opacity: 0.64, rotate: -4 },
    { cx: 30, cy: -220, rx: 48, ry: 26, fill: c.caveRockLit, opacity: 0.54, rotate: 8 },
    { cx: -64, cy: -206, rx: 34, ry: 22, fill: c.ochreEarth, opacity: 0.44, rotate: -14 },
    { cx: 64, cy: -198, rx: 36, ry: 24, fill: c.ochreEarth, opacity: 0.42, rotate: 12 },
  ];

  const groundWashBlotches: WatercolorBlotch[] = [
    { cx: -128, cy: 2, rx: 42, ry: 3.5, fill: c.caveRockDark, opacity: 0.36, rotate: -1 },
    { cx: 0, cy: 2.5, rx: 64, ry: 3.2, fill: c.pathEarthDark, opacity: 0.28, rotate: 0 },
    { cx: 124, cy: 2, rx: 44, ry: 3.5, fill: c.foliageShadow, opacity: 0.38, rotate: 1 },
  ];

  const rockDome = svgEl('g', { 'data-part': 'cave-rock-dome' }, [
    watercolorWashBlotches(groundWashBlotches, {
      seed: variant * 7 + 1,
      opacity: 0.88,
    }),
    // Solid base pigment beneath clipped wet-on-wet washes so background stays opaque
    svgEl('path', { d: domeD, fill: c.caveRockMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(domeClipId) },
      watercolorWashBlotches(domeWashBlotches, {
        seed: variant * 11 + 3,
        opacity: 0.94,
        wetEdge: true,
      })
    ),
    // Broken hand-drawn Xerox graphite hillside silhouette contours
    xeroxSketchStroke(
      'M -171 2 C -169 -36, -163 -78, -148 -118 L -132 -152 C -118 -178, -96 -202, -72 -222 L -48 -242 C -28 -253, 10 -253, 34 -244',
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
        broken: true,
        dasharray: '18 3.5 11 3 15 3',
        feather: true,
        opacity: 0.84,
      }
    ),
    xeroxSketchStroke(
      'M 34 -244 L 74 -226 C 104 -202, 128 -168, 146 -126 C 160 -84, 168 -40, 170 2',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '14 4 10 3 16 4',
        opacity: 0.78,
      }
    ),
  ]);

  // 2. Layered Sunlit Ochre & Sandstone Crag Strata (`data-part="cave-ochre-strata"`)
  const ochreStrata = svgEl(
    'g',
    { 'data-part': 'cave-ochre-strata', 'clip-path': svgUrl(domeClipId) },
    [
      gouachePath(
        'M -104 -174 L -74 -214 L -46 -238 C -22 -249, 12 -249, 36 -238 L 72 -218 L 98 -186 L 64 -178 L 28 -198 L -18 -202 L -64 -188 Z',
        c.ochreEarth,
        { opacity: 0.44 }
      ),
      gouachePath(
        'M -72 -212 L -44 -235 C -20 -245, 8 -244, 30 -234 L 54 -218 L 16 -214 L -26 -216 Z',
        c.caveRockLit,
        { opacity: 0.42 }
      ),
      // Left stepped hillside shoulder slab
      gouachePath(
        'M -154 -78 L -138 -126 L -104 -146 L -88 -114 L -116 -92 L -144 -70 Z',
        c.ochreEarth,
        { opacity: 0.46 }
      ),
      // Right stepped hillside shoulder slab
      gouachePath(
        'M 90 -132 L 126 -144 L 148 -98 L 132 -66 L 100 -78 L 86 -108 Z',
        c.ochreEarth,
        { opacity: 0.44 }
      ),
      // Delicate strata ledge graphite ticks
      xeroxSketchStroke(
        'M -98 -176 L -64 -188 L -18 -202 L 28 -198 L 66 -178 M -144 -76 L -116 -92 L -88 -114 M 88 -110 L 104 -78 L 132 -68',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          dasharray: '10 3.5 6 3',
          opacity: 0.68,
        }
      ),
    ]
  );

  // 3. Woodland Moss & Sage Grass Tufts Perched on High Ledges (`data-part="cave-moss-tufts"`)
  const mossBlotches: WatercolorBlotch[] = [
    { cx: -92, cy: -188, rx: 22, ry: 9, fill: c.foliageShadow, opacity: 0.66, rotate: -10 },
    { cx: -70, cy: -191, rx: 20, ry: 9, fill: c.oliveCanopy, opacity: 0.68, rotate: 6 },
    { cx: -82, cy: -195, rx: 14, ry: 6, fill: c.sageFoliage, opacity: 0.54, rotate: -4 },
    { cx: 66, cy: -216, rx: 18, ry: 8, fill: c.foliageShadow, opacity: 0.62, rotate: 10 },
    { cx: 86, cy: -210, rx: 18, ry: 8, fill: c.oliveCanopy, opacity: 0.66, rotate: 16 },
    { cx: 74, cy: -220, rx: 12, ry: 5, fill: c.meadowSunMid, opacity: 0.52, rotate: 6 },
  ];

  const mossClusters: PencilFoliageCluster[] = [
    { cx: -82, cy: -190, rx: 26, ry: 9, density: 1.25, stroke: c.pencilOliveCharcoal, opacity: 0.84, seed: variant * 13 + 1 },
    { cx: 76, cy: -214, rx: 24, ry: 9, density: 1.2, stroke: c.pencilOliveCharcoal, opacity: 0.82, seed: variant * 13 + 5 },
  ];

  const mossTufts = svgEl('g', { 'data-part': 'cave-moss-tufts' }, [
    watercolorWashBlotches(mossBlotches, {
      seed: variant * 17 + 2,
      opacity: 0.92,
    }),
    pencilFoliageScribbles(mossClusters, {
      stroke: c.pencilOliveCharcoal,
      strokeWidth: 1.15,
      opacity: 0.84,
      seed: variant * 19 + 4,
      includeTwigs: true,
      includeDots: true,
    }),
  ]);

  // 4. Crisp Hand-Drawn Geological Rock Fracture Ticks (`data-part="cave-rock-fractures"`)
  const rockFractures = svgEl('g', { 'data-part': 'cave-rock-fractures' }, [
    xeroxSketchStroke(
      [
        'M -126 -144 L -108 -126 L -114 -102',
        'M -92 -166 L -74 -154 L -82 -136',
        'M -42 -232 L -32 -210 L -14 -204',
        'M 26 -234 L 18 -212 L 34 -198',
        'M 78 -174 L 94 -156 L 86 -136',
        'M 122 -128 L 110 -106 L 120 -88',
        'M -146 -62 L -126 -54 L -116 -66',
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '11 2.5 7 2',
        feather: true,
        opacity: 0.78,
      }
    ),
    xeroxSketchStroke(
      [
        'M -134 -96 L -120 -90',
        'M -56 -208 L -38 -200',
        'M 48 -204 L 64 -196',
        'M 116 -76 L 132 -70',
        'M -142 -118 L -133 -113',
        'M -139 -110 L -131 -106',
        'M 104 -146 L 114 -140',
        'M 107 -138 L 117 -133',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.72,
      }
    ),
  ]);

  // 5. Dragon Hiccup Soot Wash Above the Cave Arch (`data-part="cave-soot-marks"`)
  const sootBlotches: WatercolorBlotch[] = [
    { cx: -22, cy: -176, rx: 11, ry: 15, fill: c.sootChar, opacity: 0.36, rotate: -14 },
    { cx: 1, cy: -182, rx: 13, ry: 18, fill: c.sootChar, opacity: 0.42, rotate: 6 },
    { cx: 24, cy: -173, rx: 11, ry: 13, fill: c.sootAsh, opacity: 0.34, rotate: 18 },
    { cx: -6, cy: -170, rx: 22, ry: 9, fill: c.sootAsh, opacity: 0.32, rotate: -4 },
  ];

  const sootMarks = svgEl('g', { 'data-part': 'cave-soot-marks' }, [
    watercolorWashBlotches(sootBlotches, {
      seed: variant * 23 + 7,
      opacity: 0.88,
    }),
    xeroxSketchStroke(
      [
        'M -22 -164 Q -26 -178, -18 -190',
        'M 0 -166 Q -4 -182, 5 -198',
        'M 16 -163 Q 24 -174, 30 -184',
      ].join(' '),
      {
        stroke: c.sootChar,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '6 3 4 2.5',
        opacity: 0.62,
      }
    ),
  ]);

  // 6. Deep Vaulted Cave Entrance (`data-part="cave-entrance"`, x: -78..+78, y: -158..+2)
  const caveEntrance = svgEl('g', { 'data-part': 'cave-entrance' }, [
    // Carved stone brow arch rim framing the mouth
    gouachePath(
      [
        'M -84 2',
        'C -86 -58, -76 -118, -46 -148',
        'C -22 -168, 22 -168, 46 -148',
        'C 76 -118, 86 -58, 84 2',
        'L 76 2',
        'C 76 -54, 68 -110, 40 -140',
        'C 18 -158, -18 -158, -40 -140',
        'C -68 -110, -76 -54, -76 2 Z',
      ].join(' '),
      c.caveRockLit,
      { softEdge: false, opacity: 0.92 }
    ),
    // Outer cavern shadow ring (`caveRockDark`)
    svgEl('path', {
      d: 'M -78 2 C -78 -56, -70 -112, -42 -144 C -18 -163, 18 -163, 42 -144 C 70 -112, 78 -56, 78 2 Z',
      fill: c.caveRockDark,
      stroke: 'none',
    }),
    // Deep inner vaulted hollow (`backdropDark`) — pure analog depth, zero gradients
    svgEl('path', {
      d: 'M -64 2 C -64 -48, -56 -98, -33 -127 C -14 -144, 14 -144, 33 -127 C 56 -98, 64 -48, 64 2 Z',
      fill: c.backdropDark,
      stroke: 'none',
    }),
    // Subtle dark soot/stone wash inside the upper arch vault
    gouachePath(
      'M -56 -24 C -54 -72, -38 -114, 0 -126 C 38 -114, 54 -72, 56 -24 C 34 -42, -34 -42, -56 -24 Z',
      c.sootChar,
      { opacity: 0.34 }
    ),
    // Crisp Xerox graphite arch contour, inner rim & stone voussoir notches
    xeroxSketchStroke(
      'M -78 2 C -78 -56, -70 -112, -42 -144 C -18 -163, 18 -163, 42 -144 C 70 -112, 78 -56, 78 2',
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxHeavy,
        feather: true,
        opacity: 0.9,
      }
    ),
    xeroxSketchStroke(
      'M -84 0 C -85 -58, -75 -118, -46 -148 C -22 -167, 22 -167, 46 -148 C 75 -118, 85 -58, 84 0',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '14 3.5 9 3',
        opacity: 0.78,
      }
    ),
    xeroxSketchStroke(
      [
        'M -82 -44 L -75 -42',
        'M -74 -96 L -66 -92',
        'M -48 -144 L -41 -137',
        'M -14 -162 L -12 -154',
        'M 14 -162 L 12 -154',
        'M 48 -144 L 41 -137',
        'M 74 -96 L 66 -92',
        'M 82 -44 L 75 -42',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.74,
      }
    ),
    // Grounding threshold stones at cave entrance (`y: -4..+5`)
    svgEl('path', {
      d: 'M -52 3 C -52 -4, -30 -5, -28 3 Z',
      fill: c.stoneLight,
      stroke: 'none',
    }),
    xeroxSketchStroke('M -52 3 C -52 -4, -30 -5, -28 3', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      opacity: 0.8,
    }),
    svgEl('path', {
      d: 'M 22 4 C 22 -3, 44 -4, 46 4 Z',
      fill: c.stoneLight,
      stroke: 'none',
    }),
    xeroxSketchStroke('M 22 4 C 22 -3, 44 -4, 46 4', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      opacity: 0.8,
    }),
    svgEl('path', {
      d: 'M -12 4 C -12 -2, 8 -2, 10 4 Z',
      fill: c.stoneBase,
      stroke: 'none',
    }),
    xeroxSketchStroke('M -12 4 C -12 -2, 8 -2, 10 4', {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      opacity: 0.76,
    }),
  ]);

  // 7. Flanking Mossy Rocky Boulders (`data-part="cave-boulders"`)
  const boulderL1D =
    'M -173 3 C -173 -24, -162 -52, -140 -62 C -122 -66, -108 -46, -106 -16 L -108 4 Z';
  const boulderL2D =
    'M -124 4 C -124 -16, -110 -32, -94 -30 C -80 -28, -74 -12, -76 4 Z';
  const boulderR1D =
    'M 76 4 C 76 -20, 86 -44, 104 -46 C 120 -46, 128 -26, 126 4 Z';
  const boulderR2D =
    'M 64 5 C 64 -10, 74 -18, 84 -16 C 92 -14, 94 -4, 92 5 Z';

  const boulders = svgEl('g', { 'data-part': 'cave-boulders' }, [
    // Large craggy mossy boulder at far-left base (`x: -173..-106`)
    svgEl('path', { d: boulderL1D, fill: c.caveRockMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(boulderL1ClipId) },
      watercolorWashBlotches(
        [
          { cx: -158, cy: -16, rx: 22, ry: 24, fill: c.caveRockDark, opacity: 0.58, rotate: -10 },
          { cx: -126, cy: -38, rx: 20, ry: 18, fill: c.caveRockLit, opacity: 0.54, rotate: 12 },
          { cx: -144, cy: -52, rx: 18, ry: 11, fill: c.oliveCanopy, opacity: 0.52, rotate: -14 },
        ],
        { seed: variant * 29 + 1, opacity: 0.92 }
      )
    ),
    xeroxSketchStroke(boulderL1D, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
      broken: true,
      dasharray: '15 3 10 2.5',
      feather: true,
      opacity: 0.86,
    }),
    xeroxSketchStroke('M -154 -38 L -136 -28 L -142 -12 M -126 -46 L -118 -26', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      opacity: 0.76,
    }),

    // Warm-stone secondary boulder beside left cave mouth (`x: -124..-76`)
    svgEl('path', { d: boulderL2D, fill: c.stoneBase, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(boulderL2ClipId) },
      watercolorWashBlotches(
        [
          { cx: -112, cy: -8, rx: 14, ry: 12, fill: c.stoneShadow, opacity: 0.5, rotate: -6 },
          { cx: -94, cy: -22, rx: 14, ry: 10, fill: c.stoneLight, opacity: 0.56, rotate: 8 },
        ],
        { seed: variant * 29 + 4, opacity: 0.9 }
      )
    ),
    xeroxSketchStroke(boulderL2D, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      broken: true,
      dasharray: '12 3 8 2.5',
      opacity: 0.82,
    }),
    xeroxSketchStroke('M -108 -16 L -96 -12 L -92 -4', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      opacity: 0.72,
    }),

    // Right flank mossy boulder tucked behind the thorny bramble (`x: 76..126`)
    svgEl('path', { d: boulderR1D, fill: c.caveRockMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(boulderR1ClipId) },
      watercolorWashBlotches(
        [
          { cx: 112, cy: -12, rx: 16, ry: 18, fill: c.caveRockDark, opacity: 0.54, rotate: 8 },
          { cx: 94, cy: -34, rx: 14, ry: 11, fill: c.oliveCanopy, opacity: 0.5, rotate: -8 },
          { cx: 92, cy: -24, rx: 14, ry: 12, fill: c.caveRockLit, opacity: 0.44, rotate: 4 },
        ],
        { seed: variant * 29 + 7, opacity: 0.9 }
      )
    ),
    xeroxSketchStroke(boulderR1D, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
      broken: true,
      dasharray: '12 3 9 2.5',
      opacity: 0.82,
    }),
    xeroxSketchStroke('M 94 -32 L 104 -18 L 96 -8', {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      opacity: 0.74,
    }),

    // Small warm-stone accent rock right at cave mouth corner (`x: 64..92`)
    svgEl('path', { d: boulderR2D, fill: c.stoneLight, stroke: 'none' }),
    xeroxSketchStroke(boulderR2D, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      opacity: 0.8,
    }),
  ]);

  // 8. Tangled Thorny Bramble Bush at Right Base (`data-part="cave-bramble-bush"`, x: 92..173, y: -62..+5)
  const brambleBlotches: WatercolorBlotch[] = [
    { cx: 114, cy: -14, rx: 18, ry: 15, fill: c.foliageShadow, opacity: 0.72, rotate: -12 },
    { cx: 148, cy: -14, rx: 19, ry: 15, fill: c.nightDeepGlade, opacity: 0.62, rotate: 10 },
    { cx: 128, cy: -34, rx: 20, ry: 17, fill: c.oliveCanopy, opacity: 0.7, rotate: -6 },
    { cx: 146, cy: -32, rx: 18, ry: 15, fill: c.foliageMid, opacity: 0.66, rotate: 14 },
    { cx: 134, cy: -44, rx: 14, ry: 10, fill: c.sageFoliage, opacity: 0.56, rotate: 4 },
  ];

  const brambleClusters: PencilFoliageCluster[] = [
    { cx: 116, cy: -16, rx: 17, ry: 14, density: 1.35, stroke: c.xeroxInk, opacity: 0.86, seed: variant * 31 + 1 },
    { cx: 146, cy: -18, rx: 17, ry: 14, density: 1.35, stroke: c.pencilOliveCharcoal, opacity: 0.88, seed: variant * 31 + 3 },
    { cx: 134, cy: -38, rx: 20, ry: 14, density: 1.25, stroke: c.pencilOliveCharcoal, opacity: 0.84, seed: variant * 31 + 5 },
  ];

  const brambleBush = svgEl('g', { 'data-part': 'cave-bramble-bush' }, [
    svgEl(
      'g',
      {
        transform: svgTransform({
          rotate: brambleSway,
          pivotX: 132,
          pivotY: 2,
        }),
      },
      [
        watercolorWashBlotches(brambleBlotches, {
          seed: variant * 37 + 2,
          opacity: 0.94,
        }),
        pencilFoliageScribbles(brambleClusters, {
          stroke: c.pencilOliveCharcoal,
          strokeWidth: 1.15,
          opacity: 0.86,
          seed: variant * 41 + 3,
          includeTwigs: true,
          includeDots: true,
        }),
        // Tangled woody bramble vines weaving across the bush
        xeroxSketchStroke(
          [
            'M 96 -6 C 112 -22, 128 -10, 144 -26 C 154 -36, 164 -28, 170 -36',
            'M 106 -32 C 122 -46, 138 -34, 156 -48 C 162 -52, 168 -50, 172 -54',
            'M 108 2 C 124 -12, 140 -4, 162 -14',
          ].join(' '),
          {
            stroke: c.woodDark,
            strokeWidth: s.xeroxMedium,
            opacity: 0.9,
          }
        ),
        xeroxSketchStroke(
          'M 98 -8 C 114 -24, 128 -12, 144 -28 M 110 -34 C 124 -46, 138 -36, 154 -48',
          {
            stroke: c.woodLit,
            strokeWidth: s.sketchLine,
            broken: true,
            opacity: 0.62,
          }
        ),
        // Sharp hand-inked woody thorns poking out along the bramble vines
        celPath('M 104 -18 L 96 -26 L 109 -23 Z', c.woodMid, {
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 118 -38 L 114 -50 L 125 -42 Z', c.woodMid, {
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 134 -46 L 138 -59 L 142 -46 Z', c.woodMid, {
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 152 -46 L 163 -56 L 158 -40 Z', c.woodMid, {
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 162 -28 L 173 -32 L 164 -20 Z', c.woodDark, {
          strokeWidth: s.xeroxFine,
        }),
        celPath('M 128 -18 L 126 -28 L 135 -20 Z', c.woodMid, {
          strokeWidth: s.sketchLine,
        }),
        celPath('M 148 -14 L 158 -18 L 152 -8 Z', c.woodDark, {
          strokeWidth: s.sketchLine,
        }),
      ]
    ),
    // Tiny fallen woody thorn twig on the path near the cave entrance
    xeroxSketchStroke('M 86 3 L 98 1 M 91 2 L 94 -3', {
      stroke: c.woodDark,
      strokeWidth: s.xeroxFine,
      opacity: 0.85,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dragon_cave',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: domeClipId }, svgEl('path', { d: domeD })),
        svgEl('clipPath', { id: boulderL1ClipId }, svgEl('path', { d: boulderL1D })),
        svgEl('clipPath', { id: boulderL2ClipId }, svgEl('path', { d: boulderL2D })),
        svgEl('clipPath', { id: boulderR1ClipId }, svgEl('path', { d: boulderR1D })),
      ]),
      rockDome,
      ochreStrata,
      mossTufts,
      rockFractures,
      sootMarks,
      caveEntrance,
      boulders,
      brambleBush,
    ]
  );
}

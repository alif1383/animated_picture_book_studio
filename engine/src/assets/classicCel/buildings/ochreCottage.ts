import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  gouacheDabWash,
  gouachePath,
  pencilFoliageScribbles,
  pencilGrassStrokes,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { BuildingRenderOptions } from '../../buildings/types';

/**
 * Renders the Classic 1970s–1980s Disney hand-painted watercolor/gouache & sketchy
 * sepia-ink Ochre Cottage (`'ochre_cottage'`) for `classic_cel` scenes.
 *
 * Crafted as authentic Layer 1A illustration-board background art (*Robin Hood* 1973 /
 * *Mickey's Christmas Carol* 1983):
 * - Soft wet-on-wet blotchy watercolor washes (`watercolorWashBlotches`) across the
 *   plaster stucco, weathered terracotta shingles, stone chimney, drifting smoke, and
 *   warm ochre window-light spill (never smooth flat computer color!)
 * - Crisp, loose hand-drawn pencil/ink foliage scribbles (`pencilFoliageScribbles`) on
 *   the climbing cottage ivy & flower-box greenery and `pencilGrassStrokes` at the base
 * - Broken sepia-ink architectural penwork (`xeroxSketchStroke`) for timber beams,
 *   shingle edges, stonework, shutters, and mullions
 *
 * Local origin `(0, 0)` at ground contact; bounds `~x: -176..168, y: -268..0`.
 */
export function renderClassicOchreCottage(
  options: BuildingRenderOptions
): string {
  const { windowLit = true, showLadder = true, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  const pid = (name: string): string => `cc-cottage-${name}${safeSuffix}`;

  const mainWallClipId = pid('main-wall-clip');
  const gableWallClipId = pid('gable-wall-clip');
  const mainRoofClipId = pid('main-roof-clip');
  const gableRoofClipId = pid('gable-roof-clip');
  const chimneyClipId = pid('chimney-clip');
  const doorClipId = pid('door-clip');

  const mainWallD = 'M -55 -132 L 152 -132 L 154 0 L -55 0 Z';
  const gableWallD = 'M -168 -118 L -106 -188 L -45 -118 L -45 0 L -168 0 Z';
  const mainRoofD =
    'M -108 -208 L 136 -208 L 168 -126 Q 150 -116, 132 -126 Q 114 -116, 96 -126 Q 78 -116, 60 -126 Q 42 -116, 24 -126 Q 6 -116, -12 -126 Q -30 -116, -45 -126 L -106 -188 Z';
  const gableRoofD =
    'M -176 -114 L -106 -194 L -38 -114 L -46 -108 L -106 -178 L -168 -108 Z';
  const chimneyBodyD = 'M -108 -190 L -108 -250 L -72 -250 L -72 -185 Z';

  // Local clip paths keep wet-on-wet watercolor washes neatly inside architectural planes
  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: mainWallClipId }, svgEl('path', { d: mainWallD })),
    svgEl('clipPath', { id: gableWallClipId }, svgEl('path', { d: gableWallD })),
    svgEl('clipPath', { id: mainRoofClipId }, svgEl('path', { d: mainRoofD })),
    svgEl('clipPath', { id: gableRoofClipId }, svgEl('path', { d: gableRoofD })),
    svgEl('clipPath', { id: chimneyClipId }, svgEl('path', { d: chimneyBodyD })),
  ]);

  // Soft painted grounding shadow beneath foundation
  const groundShadow = celContactShadow(-8, 1.5, 166, 7.2, 0.34);

  // 1. Weathered Painted Stone Chimney & Cloudy Wet-on-Wet Smoke Puffs
  const chimney = svgEl('g', { 'data-part': 'chimney' }, [
    // Soft wet-on-wet drifting watercolor chimney smoke puffs (kept within y: -268..0)
    watercolorWashBlotches(
      [
        { cx: -86, cy: -263, rx: 10, ry: 4.8, rotate: -8, fill: c.boardToothLight, opacity: windowLit ? 0.38 : 0.16 },
        { cx: -70, cy: -261, rx: 14, ry: 5.8, rotate: 6, fill: c.parchmentCream, opacity: windowLit ? 0.32 : 0.13 },
        { cx: -51, cy: -262, rx: 15, ry: 5.4, rotate: -5, fill: c.stoneLight, opacity: windowLit ? 0.24 : 0.09 },
        { cx: -34, cy: -260, rx: 11, ry: 4.5, rotate: 8, fill: c.boardToothLight, opacity: windowLit ? 0.15 : 0.06 },
      ],
      { seed: 11 }
    ),
    // Base painted stone chimney mass + clipped wet-on-wet stone weathering washes
    gouachePath(chimneyBodyD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(chimneyClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -102, cy: -236, rx: 12, ry: 18, fill: c.stoneLight, opacity: 0.6 },
          { cx: -92, cy: -206, rx: 15, ry: 20, fill: c.boardToothWarm, opacity: 0.32 },
          { cx: -78, cy: -228, rx: 13, ry: 28, fill: c.stoneShadow, opacity: 0.74 },
          { cx: -77, cy: -196, rx: 13, ry: 18, fill: c.nightSkyMid, opacity: 0.38 },
        ],
        { seed: 17 }
      ),
    ]),
    xeroxSketchStroke(chimneyBodyD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.88,
      feather: true,
    }),
    // Corbeled stone chimney cap
    gouachePath('M -115 -250 L -65 -250 L -65 -259 L -115 -259 Z', c.stoneBase, {
      softEdge: false,
    }),
    svgEl('path', {
      d: 'M -114 -258.5 L -78 -258.5 L -78 -255 L -114 -255 Z',
      fill: c.stoneLight,
      opacity: 0.55,
    }),
    svgEl('path', {
      d: 'M -86 -259 L -65 -259 L -65 -250 L -86 -250 Z',
      fill: c.stoneShadow,
      opacity: 0.65,
    }),
    xeroxSketchStroke('M -115 -250 L -65 -250 L -65 -259 L -115 -259 Z', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
      opacity: 0.85,
    }),
    // Terracotta chimney pot crown
    celPath('M -98 -259 L -82 -259 L -84 -268 L -96 -268 Z', c.cottageRoof, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('path', {
      d: 'M -89 -268 L -84 -268 L -82 -259 L -89 -259 Z',
      fill: c.cottageRoofShadow,
      opacity: 0.65,
    }),
    // Broken sepia-ink masonry mortar courses & weathered ticks
    xeroxSketchStroke(
      [
        'M -107 -238 L -74 -238',
        'M -106 -225 L -73 -225',
        'M -107 -212 L -75 -212',
        'M -105 -199 L -76 -199',
        'M -94 -249 L -94 -238',
        'M -83 -238 L -83 -225',
        'M -96 -225 L -96 -212',
        'M -84 -212 L -84 -199',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.72,
      }
    ),
  ]);

  // 2. Wet-on-Wet Mottled Watercolor Stucco Walls, Half-Timbering, Stone Baseboard & Ivy
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main right/center stucco wall base + clipped wet-on-wet watercolor mottling
    gouachePath(mainWallD, c.cottagePlaster, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mainWallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -20, cy: -88, rx: 52, ry: 40, fill: c.boardToothWarm, opacity: 0.52 },
          { cx: 52, cy: -74, rx: 68, ry: 46, fill: c.ochreEarth, opacity: 0.36 },
          { cx: 122, cy: -62, rx: 54, ry: 58, fill: c.cottagePlasterShadow, opacity: 0.72 },
          { cx: 18, cy: -18, rx: 84, ry: 28, fill: c.cottagePlasterShadow, opacity: 0.6 },
          { cx: 112, cy: -22, rx: 56, ry: 28, fill: c.pathEarthDark, opacity: 0.42 },
          { cx: 48, cy: -120, rx: 122, ry: 20, fill: c.nightSkyMid, opacity: 0.46 },
          { cx: -36, cy: -64, rx: 18, ry: 72, fill: c.nightSkyZenith, opacity: 0.36 },
        ],
        { seed: 23 }
      ),
      // Soft wet-on-wet warm ochre watercolor window-light spill across the stucco
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: 47, cy: -66, rx: 86, ry: 52, fill: c.warmAmberWash, opacity: 0.26 },
              { cx: 47, cy: -64, rx: 66, ry: 42, fill: c.warmAmberGlow, opacity: 0.3 },
            ],
            { seed: 29 }
          )
        : '',
    ]),
    xeroxSketchStroke(mainWallD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.88,
      feather: true,
    }),

    // Protruding gabled left wing stucco + clipped wet-on-wet watercolor mottling
    gouachePath(gableWallD, c.cottagePlaster, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(gableWallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -144, cy: -84, rx: 38, ry: 56, fill: c.boardToothLight, opacity: 0.46 },
          { cx: -108, cy: -138, rx: 42, ry: 36, fill: c.boardToothWarm, opacity: 0.48 },
          { cx: -72, cy: -64, rx: 38, ry: 72, fill: c.cottagePlasterShadow, opacity: 0.68 },
          { cx: -112, cy: -18, rx: 62, ry: 26, fill: c.pathEarthDark, opacity: 0.38 },
          { cx: -106, cy: -168, rx: 58, ry: 24, fill: c.nightSkyMid, opacity: 0.42 },
        ],
        { seed: 31 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: -106, cy: -142, rx: 28, ry: 24, fill: c.warmAmberGlow, opacity: 0.28 },
              { cx: -106, cy: -56, rx: 28, ry: 22, fill: c.warmAmberWash, opacity: 0.22 },
            ],
            { seed: 37 }
          )
        : '',
    ]),
    xeroxSketchStroke(gableWallD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.9,
      feather: true,
    }),

    // Storybook half-timber framing with sketchy sepia-ink wood grain (`data-part="timber-framing"`)
    svgEl('g', { 'data-part': 'timber-framing' }, [
      celPath('M -168 -118 L -45 -118 L -45 -111 L -168 -111 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -146 -118 L -126 -144 L -121 -141 L -140 -118 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      celPath('M -66 -118 L -86 -144 L -91 -141 L -72 -118 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      celPath('M -168 -118 L -161 -118 L -161 -10 L -168 -10 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -52 -118 L -45 -118 L -45 -10 L -52 -10 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M 146 -132 L 153 -132 L 154 -10 L 147 -10 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      xeroxSketchStroke(
        [
          'M -164 -108 L -164 -20',
          'M -48 -108 L -48 -20',
          'M -158 -114.5 L -54 -114.5',
          'M 150 -122 L 150 -20',
          'M -142 -114 L -142 -112',
          'M -70 -114 L -70 -112',
        ].join(' '),
        {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.58,
        }
      ),
    ]),

    // Weathered painted stone baseboard foundation & dressed corner quoins
    gouachePath('M -168 0 L 154 0 L 154 -11 L -168 -11 Z', c.stoneBase, {
      softEdge: false,
    }),
    svgEl('path', {
      d: 'M -167 -5 L 153 -5 L 153 0 L -167 0 Z',
      fill: c.stoneShadow,
      opacity: 0.68,
    }),
    xeroxSketchStroke(
      'M -168 -11 L 154 -11 M -168 0 L 154 0 M -144 -11 L -144 0 M -72 -11 L -72 0 M -26 -11 L -26 0 M 18 -11 L 18 0 M 64 -11 L 64 0 M 112 -11 L 112 0',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.75,
      }
    ),
    celPath('M -168 -96 L -155 -96 L -155 -84 L -168 -84 Z', c.stoneLight, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -168 -64 L -157 -64 L -157 -52 L -168 -52 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 141 -98 L 153 -98 L 153 -86 L 141 -86 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),

    // Wet-on-wet watercolor climbing ivy + Robin-Hood pencil foliage scribbles (`data-part="cottage-vines"`)
    svgEl('g', { 'data-part': 'cottage-vines' }, [
      watercolorWashBlotches(
        [
          { cx: -48, cy: -22, rx: 12, ry: 10, fill: c.foliageShadow, opacity: 0.78 },
          { cx: -44, cy: -44, rx: 13, ry: 12, fill: c.foliageMid, opacity: 0.76 },
          { cx: -49, cy: -66, rx: 12, ry: 12, fill: c.oliveCanopy, opacity: 0.75 },
          { cx: -44, cy: -88, rx: 13, ry: 12, fill: c.sageFoliage, opacity: 0.72 },
          { cx: -46, cy: -108, rx: 10, ry: 9, fill: c.foliageLit, opacity: 0.72 },
        ],
        { seed: 41 }
      ),
      pencilFoliageScribbles(
        [
          { cx: -47, cy: -34, rx: 10, ry: 16, density: 1.0 },
          { cx: -46, cy: -74, rx: 11, ry: 18, density: 1.05 },
          { cx: -46, cy: -104, rx: 9, ry: 11, density: 0.9 },
        ],
        {
          stroke: c.pencilOliveCharcoal,
          strokeWidth: 1.05,
          opacity: 0.82,
          seed: 43,
        }
      ),
      xeroxSketchStroke('M -45 -10 Q -53 -42, -43 -72 Q -50 -98, -44 -118', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }),
      // Tiny painted storybook blossom dabs
      svgEl('circle', { cx: -43, cy: -62, r: 2.9, fill: c.dustyRose }),
      svgEl('circle', { cx: -48, cy: -84, r: 2.7, fill: c.flowerCream }),
      svgEl('circle', { cx: -47, cy: -34, r: 2.5, fill: c.flowerBlue }),
    ]),
  ]);

  // 3. Left Wing Round Attic Window, Arched Oak Door with Heart Pane & Cobblestone Stoop
  const leftWingDetails = svgEl('g', { 'data-part': 'left-wing-details' }, [
    svgEl('circle', {
      cx: -106,
      cy: -142,
      r: 19.5,
      fill: c.woodDark,
      stroke: c.xeroxInkSoft,
      'stroke-width': s.xeroxFine,
      filter: svgUrl(TOKENS.classicCel.filters.ids.xeroxInk),
    }),
    svgEl('circle', {
      cx: -106,
      cy: -142,
      r: 16.2,
      fill: windowLit ? c.warmAmberGlow : c.nightSkyMid,
    }),
    windowLit
      ? svgEl('circle', {
          cx: -106,
          cy: -141,
          r: 10.5,
          fill: c.warmAmberCore,
          opacity: 0.72,
        })
      : xeroxSketchStroke('M -115 -149 L -101 -136 M -110 -152 L -97 -140', {
          stroke: c.waterHighlight,
          strokeWidth: 1.2,
          opacity: 0.45,
        }),
    xeroxSketchStroke('M -122 -142 L -90 -142 M -106 -158 L -106 -126', {
      stroke: c.woodDark,
      strokeWidth: 2.1,
      opacity: 0.96,
    }),
    xeroxSketchStroke('M -122 -142 L -90 -142 M -106 -158 L -106 -126', {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
      opacity: 0.85,
    }),

    celPath(
      'M -135 0 L -135 -69 Q -106 -94, -77 -69 L -77 0 Z',
      c.woodDark,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
    celShadedShape({
      d: 'M -132 0 L -132 -68 Q -106 -90, -80 -68 L -80 0 Z',
      baseFill: c.woodMid,
      shadowPaths: [
        'M -132 -68 Q -106 -90, -80 -68 L -80 -62 Q -106 -83, -132 -62 Z',
        'M -92 -76 L -80 -68 L -80 0 L -92 0 Z',
      ],
      shadowFill: c.woodDark,
      shadowOpacity: 0.68,
      highlightPaths: ['M -130 -66 L -124 -70 L -124 0 L -130 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.48,
      clipId: doorClipId,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke(
      'M -118 -77 L -118 0 M -106 -80 L -106 0 M -94 -77 L -94 0 M -125 -52 L -125 -34 M -99 -42 L -99 -18',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.72,
      }
    ),
    celPath('M -132 -62 L -112 -62 L -110 -59 L -132 -59 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    celPath('M -132 -24 L -112 -24 L -110 -21 L -132 -21 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    svgEl('circle', { cx: -126, cy: -60.5, r: 1, fill: c.ironHighlight }),
    svgEl('circle', { cx: -126, cy: -22.5, r: 1, fill: c.ironHighlight }),

    celPath(
      'M -106 -58 C -109 -63, -116 -62, -115 -56 L -106 -47 L -97 -56 C -96 -62, -103 -63, -106 -58 Z',
      windowLit ? c.warmAmberCore : c.nightcapShadow,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    gouacheDabWash(
      [
        { cx: -116, cy: -57, rx: 4.5, ry: 4.5 },
        { cx: -112, cy: -46, rx: 4.5, ry: 4.2 },
        { cx: -100, cy: -46, rx: 4.5, ry: 4.2 },
        { cx: -96, cy: -57, rx: 4.5, ry: 4.5 },
        { cx: -106, cy: -66, rx: 5.0, ry: 3.8 },
      ],
      {
        fill: c.foliageMid,
        wetEdgeColor: c.foliageShadow,
        wetEdgeOpacity: 0.3,
        highlightFill: c.sageFoliage,
        highlightOpacity: 0.35,
        softEdge: false,
        seed: 43,
      }
    ),
    xeroxSketchStroke(
      'M -117 -58 Q -114 -45, -106 -44 Q -97 -45, -95 -58 Q -98 -67, -106 -67 Q -114 -67, -117 -58',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
    celPath(
      'M -106 -67 L -111 -70 L -109 -64 Z M -106 -67 L -101 -70 L -103 -64 Z',
      c.mochiCollar,
      { stroke: c.xeroxInk, strokeWidth: 0.8 }
    ),
    svgEl('circle', {
      cx: -87,
      cy: -36,
      r: 3.2,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': s.sketchLine,
    }),
    svgEl('circle', { cx: -88, cy: -37, r: 1, fill: c.parchmentCream }),

    celPath('M -142 0 L -70 0 L -74 -6 L -138 -6 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -136 -6 L -76 -6 L -79 -11 L -133 -11 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    xeroxSketchStroke('M -130 -9.5 L -82 -9.5', {
      stroke: windowLit ? c.warmAmberGlow : c.stoneLight,
      strokeWidth: 1.4,
      broken: true,
      opacity: windowLit ? 0.65 : 0.45,
    }),
  ]);

  // 4. Painted Amber Mullioned Bedroom Window, Louvered Teal Shutters & Flower Box
  const bedroomWindow = svgEl('g', { 'data-part': 'bedroom-window' }, [
    celPath('M -30 -104 L -13 -104 L -13 -28 L -30 -28 Z', c.cottageShutter, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M -30 -104 L -23 -104 L -23 -28 L -30 -28 Z',
      fill: c.cottageShutterShadow,
      opacity: 0.52,
    }),
    xeroxSketchStroke(
      [
        'M -28 -95 L -15 -95',
        'M -28 -86 L -15 -86',
        'M -28 -77 L -15 -77',
        'M -28 -68 L -15 -68',
        'M -28 -59 L -15 -59',
        'M -28 -50 L -15 -50',
        'M -28 -41 L -15 -41',
      ].join(' '),
      { stroke: c.cottageShutterShadow, strokeWidth: 1.35, broken: true, opacity: 0.85 }
    ),

    celPath('M 107 -104 L 124 -104 L 124 -28 L 107 -28 Z', c.cottageShutter, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M 117 -104 L 124 -104 L 124 -28 L 117 -28 Z',
      fill: c.cottageShutterShadow,
      opacity: 0.62,
    }),
    xeroxSketchStroke(
      [
        'M 109 -95 L 122 -95',
        'M 109 -86 L 122 -86',
        'M 109 -77 L 122 -77',
        'M 109 -68 L 122 -68',
        'M 109 -59 L 122 -59',
        'M 109 -50 L 122 -50',
        'M 109 -41 L 122 -41',
      ].join(' '),
      { stroke: c.cottageShutterShadow, strokeWidth: 1.35, broken: true, opacity: 0.85 }
    ),

    windowLit
      ? xeroxSketchStroke('M -14.5 -102 L -14.5 -30 M 108.5 -102 L 108.5 -30', {
          stroke: c.warmAmberGlow,
          strokeWidth: 1.5,
          broken: true,
          opacity: 0.62,
        })
      : '',

    // Painted amber watercolor interior window pane
    svgEl('path', {
      d: 'M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z',
      fill: windowLit ? c.warmAmberGlow : c.nightSkyZenith,
    }),
    windowLit
      ? watercolorWashBlotches(
          [
            { cx: 47, cy: -74, rx: 40, ry: 24, fill: c.warmAmberCore, opacity: 0.78 },
            { cx: 22, cy: -60, rx: 26, ry: 20, fill: c.warmAmberWash, opacity: 0.38 },
            { cx: 76, cy: -62, rx: 28, ry: 20, fill: c.warmAmberWash, opacity: 0.38 },
          ],
          { seed: 47 }
        )
      : '',

    celPath(
      'M -10 -46 Q 47 -50, 104 -46 L 104 -26 L -10 -26 Z',
      windowLit ? c.nightcapBlue : c.nightSkyMid,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    xeroxSketchStroke('M -8 -31 L 102 -45 M -6 -44 L 54 -28', {
      stroke: windowLit ? c.nightcapStripe : c.nightcapShadow,
      strokeWidth: 2.1,
      broken: true,
      opacity: windowLit ? 0.55 : 0.35,
    }),

    celPath(
      'M -12 -106 L 26 -106 Q 17 -74, 6 -46 L -12 -46 Z',
      windowLit ? c.dustyRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M -5 -104 Q 0 -76, -6 -48 M 9 -104 Q 11 -78, 1 -48', {
      stroke: c.cottageRoof,
      strokeWidth: 1.05,
      broken: true,
      opacity: 0.62,
    }),
    celPath(
      'M 106 -106 L 68 -106 Q 77 -74, 88 -46 L 106 -46 Z',
      windowLit ? c.dustyRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M 99 -104 Q 94 -76, 100 -48 M 85 -104 Q 83 -78, 93 -48', {
      stroke: c.cottageRoof,
      strokeWidth: 1.05,
      broken: true,
      opacity: 0.62,
    }),

    !windowLit
      ? xeroxSketchStroke('M 14 -98 L 42 -70 M 26 -98 L 46 -78 M 56 -64 L 82 -38', {
          stroke: c.waterHighlight,
          strokeWidth: 1.4,
          broken: true,
          opacity: 0.38,
        })
      : '',

    xeroxSketchStroke(
      'M 27 -106 L 27 -26 M 67 -106 L 67 -26 M -12 -68 L 106 -68',
      { stroke: c.woodDark, strokeWidth: 2.4, opacity: 0.95 }
    ),
    xeroxSketchStroke(
      'M 27 -106 L 27 -26 M 67 -106 L 67 -26 M -12 -68 L 106 -68',
      { stroke: c.xeroxInk, strokeWidth: 0.85, opacity: 0.82 }
    ),
    celPath('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', 'none', {
      stroke: c.woodDark,
      strokeWidth: 4.0,
    }),
    xeroxSketchStroke('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
      opacity: 0.92,
    }),

    // Wooden Window Flower Box with Wet-on-Wet Foliage & Pencil Scribbles (`data-part="flower-boxes"`)
    svgEl('g', { 'data-part': 'flower-boxes' }, [
      svgEl('path', {
        d: 'M -14 -13 L 108 -13 L 104 -8 L -10 -8 Z',
        fill: c.nightSkyZenith,
        opacity: 0.3,
      }),
      celPath('M -18 -26 L 112 -26 L 107 -13 L -13 -13 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxMedium,
      }),
      svgEl('path', {
        d: 'M -15 -19 L 109 -19 L 107 -13 L -13 -13 Z',
        fill: c.woodDark,
        opacity: 0.62,
      }),
      // Wet-on-wet watercolor flower-box foliage + crisp pencil leaf scribbles
      watercolorWashBlotches(
        [
          { cx: 0, cy: -29, rx: 16, ry: 8.5, fill: c.foliageShadow, opacity: 0.82 },
          { cx: 26, cy: -31, rx: 19, ry: 9.0, fill: c.foliageMid, opacity: 0.8 },
          { cx: 54, cy: -30, rx: 20, ry: 8.5, fill: c.oliveCanopy, opacity: 0.78 },
          { cx: 82, cy: -31, rx: 18, ry: 9.0, fill: c.sageFoliage, opacity: 0.74 },
          { cx: 100, cy: -29, rx: 14, ry: 8.0, fill: c.foliageShadow, opacity: 0.82 },
        ],
        { seed: 53 }
      ),
      pencilFoliageScribbles(
        [
          { cx: 12, cy: -30, rx: 20, ry: 7.5, density: 0.95 },
          { cx: 54, cy: -30, rx: 24, ry: 7.5, density: 1.0 },
          { cx: 90, cy: -30, rx: 18, ry: 7.5, density: 0.95 },
        ],
        {
          stroke: c.pencilOliveCharcoal,
          strokeWidth: 1.0,
          opacity: 0.8,
          includeTwigs: false,
          seed: 55,
        }
      ),
      // Loose painted flower dabs warmed by window spill
      svgEl('circle', { cx: -2, cy: -29, r: 3.8, fill: c.dustyRose }),
      svgEl('circle', {
        cx: 18,
        cy: -31,
        r: 4.1,
        fill: windowLit ? c.warmAmberCore : c.flowerCream,
      }),
      svgEl('circle', { cx: 38, cy: -29, r: 3.8, fill: c.flowerBlue }),
      svgEl('circle', { cx: 58, cy: -31, r: 4.0, fill: c.flowerRose }),
      svgEl('circle', {
        cx: 78,
        cy: -29,
        r: 3.8,
        fill: windowLit ? c.warmAmberGlow : c.flowerCream,
      }),
      svgEl('circle', { cx: 96, cy: -30, r: 3.8, fill: c.flowerBlue }),
    ]),
  ]);

  // 5. Right-Side Rustic Hand-Inked Wooden Climbing Ladder (`data-part="ladder"`)
  const ladder = showLadder
    ? svgEl('g', { 'data-part': 'ladder' }, [
        svgEl('path', {
          d: 'M 129 0 L 129 -132 M 149 0 L 149 -132',
          fill: 'none',
          stroke: c.nightSkyZenith,
          'stroke-width': 3.0,
          'stroke-linecap': 'round',
          opacity: 0.25,
        }),
        svgEl('path', {
          d: 'M 126 0 L 126 -134 M 146 0 L 146 -134',
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 4.0,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: [
            'M 126 -18 L 146 -18',
            'M 126 -38 L 146 -38',
            'M 126 -58 L 146 -58',
            'M 126 -78 L 146 -78',
            'M 126 -98 L 146 -98',
            'M 126 -118 L 146 -118',
          ].join(' '),
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 2.8,
          'stroke-linecap': 'round',
        }),
        xeroxSketchStroke(
          [
            'M 126 0 L 126 -134',
            'M 146 0 L 146 -134',
            'M 126 -18 L 146 -18',
            'M 126 -38 L 146 -38',
            'M 126 -58 L 146 -58',
            'M 126 -78 L 146 -78',
            'M 126 -98 L 146 -98',
            'M 126 -118 L 146 -118',
          ].join(' '),
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.85 }
        ),
      ])
    : '';

  // 6. Wet-on-Wet Weathered Terracotta Shingled Roof with Sketchy Sepia Shingle Penwork
  const roof = svgEl('g', { 'data-part': 'roof' }, [
    gouachePath(mainRoofD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mainRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -60, cy: -196, rx: 52, ry: 20, fill: c.russetEarth, opacity: 0.68 },
          { cx: 18, cy: -194, rx: 62, ry: 22, fill: c.ochreEarth, opacity: 0.34 },
          { cx: 98, cy: -192, rx: 54, ry: 24, fill: c.cottageRoofShadow, opacity: 0.58 },
          { cx: -12, cy: -162, rx: 62, ry: 24, fill: c.russetEarth, opacity: 0.5 },
          { cx: 68, cy: -160, rx: 62, ry: 26, fill: c.cottageRoofShadow, opacity: 0.6 },
          { cx: 132, cy: -146, rx: 48, ry: 30, fill: c.cottageRoofShadow, opacity: 0.76 },
          { cx: 40, cy: -128, rx: 124, ry: 18, fill: c.cottageRoofShadow, opacity: 0.64 },
          { cx: 14, cy: -206, rx: 118, ry: 9, fill: c.stoneLight, opacity: 0.25 },
          { cx: -46, cy: -168, rx: 16, ry: 7, fill: c.oliveCanopy, opacity: 0.3 },
          { cx: 88, cy: -142, rx: 18, ry: 7, fill: c.oliveCanopy, opacity: 0.26 },
        ],
        { seed: 59 }
      ),
    ]),
    xeroxSketchStroke(
      [
        'M -84 -192 Q -62 -184, -40 -192 T 4 -192 T 48 -192 T 92 -192 T 134 -192',
        'M -68 -174 Q -46 -166, -24 -174 T 20 -174 T 64 -174 T 108 -174 T 146 -174',
        'M -52 -156 Q -30 -148, -8 -156 T 36 -156 T 80 -156 T 124 -156 T 156 -156',
        'M -38 -138 Q -16 -130, 6 -138 T 50 -138 T 94 -138 T 138 -138 T 164 -138',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.76,
      }
    ),
    xeroxSketchStroke(
      [
        'M -54 -191 L -50 -175 M -12 -191 L -8 -175 M 32 -191 L 36 -175 M 76 -191 L 80 -175 M 114 -191 L 118 -175',
        'M -34 -173 L -30 -157 M 10 -173 L 14 -157 M 54 -173 L 58 -157 M 98 -173 L 102 -157',
        'M -18 -155 L -14 -139 M 26 -155 L 30 -139 M 70 -155 L 74 -139 M 114 -155 L 118 -139',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.85,
        opacity: 0.62,
      }
    ),
    xeroxSketchStroke(mainRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.9,
      feather: true,
    }),

    gouachePath(gableRoofD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(gableRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -140, cy: -152, rx: 36, ry: 24, rotate: -48, fill: c.russetEarth, opacity: 0.6 },
          { cx: -72, cy: -152, rx: 36, ry: 24, rotate: 48, fill: c.cottageRoofShadow, opacity: 0.72 },
        ],
        { seed: 67 }
      ),
    ]),
    xeroxSketchStroke(gableRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    xeroxSketchStroke('M -167 -109 L -106 -179 L -45 -109', {
      stroke: c.parchmentCream,
      strokeWidth: 2.0,
      dasharray: '5 3.5',
      opacity: 0.82,
    }),
    celPath('M -108 -193 L -104 -193 L -106 -202 Z', c.woodLit, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
  ]);

  // 7. Subtle Robin-Hood hand-drawn pencil grass tufts rooting the stone foundation at y = 0
  const baseGrass = pencilGrassStrokes(
    [
      { x: -156, y: 0, width: 22, height: 8, blades: 5, lean: -0.35 },
      { x: -58, y: 0, width: 20, height: 7.5, blades: 4, lean: 0.3 },
      { x: 140, y: 0, width: 24, height: 8.5, blades: 5, lean: 0.4 },
    ],
    {
      stroke: c.pencilOliveCharcoal,
      strokeWidth: 1.1,
      opacity: 0.82,
      seed: 73,
    }
  );

  return svgEl(
    'g',
    {
      'data-building': 'ochre_cottage',
      'data-art-style': 'classic_cel',
    },
    [
      clipDefs,
      groundShadow,
      chimney,
      walls,
      leftWingDetails,
      bedroomWindow,
      ladder,
      roof,
      baseGrass,
    ]
  );
}

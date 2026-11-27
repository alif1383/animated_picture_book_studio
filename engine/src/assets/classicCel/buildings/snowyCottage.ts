import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  gouachePath,
  pencilFoliageScribbles,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { BuildingRenderOptions } from '../../buildings/types';

/**
 * Renders the Classic 1970s–1980s Disney snow-blanketed Victorian Dickensian
 * timber-and-plaster shop/cottage (`'snowy_cottage'`) for *"Barnaby's Christmas Hearth"*.
 *
 * Crafted as authentic Layer 1A *Mickey's Christmas Carol* (1983) illustration-board art:
 * - Half-timbered parchment/ochre watercolor plaster walls (`watercolorWashBlotches` +
 *   `xeroxSketchStroke` dark timber framing)
 * - Pitched slate/terracotta roof heavy with puffy hand-painted watercolor snowdrifts
 *   and crisp hanging icicle pencil ticks
 * - Arched oak shop door with festive watercolor + pencil holly wreath & brass knocker
 * - Multi-pane Victorian bay window glowing warm painted amber when `windowLit: true`
 *   with soft warm ochre watercolor spill onto the snowy stoop (zero digital neon glows!)
 * - Weathered brick chimney with gently drifting painted watercolor smoke puffs
 *
 * Local origin `(0, 0)` at ground center; bounds `~x: -165..165, y: -252..4`.
 */
export function renderClassicSnowyCottage(
  options: BuildingRenderOptions
): string {
  const { windowLit = true, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  const pid = (name: string): string => `cc-snow-cottage-${name}${safeSuffix}`;

  const chimneyClipId = pid('chimney-clip');
  const mainWallClipId = pid('main-wall-clip');
  const gableWallClipId = pid('gable-wall-clip');
  const mainRoofClipId = pid('main-roof-clip');
  const mainSnowClipId = pid('main-snow-clip');
  const gableSnowClipId = pid('gable-snow-clip');
  const doorClipId = pid('door-clip');

  const chimneyBodyD = 'M -102 -178 L -102 -236 L -68 -236 L -68 -174 Z';
  const mainWallD = 'M -42 -128 L 146 -128 L 148 0 L -42 0 Z';
  const gableWallD = 'M -150 -116 L -90 -184 L -32 -116 L -32 0 L -150 0 Z';
  const mainRoofD =
    'M -92 -204 L 132 -204 L 160 -122 L -34 -122 L -90 -184 Z';
  const mainSnowD =
    'M -94 -204 C -40 -212, 48 -212, 134 -204 L 161 -124 C 146 -115, 128 -126, 112 -119 C 94 -113, 76 -126, 56 -119 C 36 -114, 18 -125, -2 -119 C -18 -114, -28 -122, -36 -124 L -90 -184 Z';
  const gableSnowD =
    'M -162 -114 L -90 -194 L -22 -114 C -28 -106, -38 -112, -46 -118 L -90 -174 L -136 -118 C -144 -110, -154 -106, -162 -114 Z';

  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: chimneyClipId }, svgEl('path', { d: chimneyBodyD })),
    svgEl('clipPath', { id: mainWallClipId }, svgEl('path', { d: mainWallD })),
    svgEl('clipPath', { id: gableWallClipId }, svgEl('path', { d: gableWallD })),
    svgEl('clipPath', { id: mainRoofClipId }, svgEl('path', { d: mainRoofD })),
    svgEl('clipPath', { id: mainSnowClipId }, svgEl('path', { d: mainSnowD })),
    svgEl('clipPath', { id: gableSnowClipId }, svgEl('path', { d: gableSnowD })),
  ]);

  // Soft painted grounding shadow beneath foundation
  const groundShadow = celContactShadow(0, 1.5, 158, 6.4, 0.34);

  // 1. Weathered Brick Chimney, Snow Cap & Gently Drifting Watercolor Smoke (`data-part="chimney"`)
  const chimney = svgEl('g', { 'data-part': 'chimney' }, [
    // Gently drifting painted smoke puffs (kept strictly within y: -252..4)
    watercolorWashBlotches(
      [
        { cx: -84, cy: -245, rx: 11, ry: 5.0, rotate: -6, fill: c.boardToothLight, opacity: windowLit ? 0.38 : 0.16 },
        { cx: -67, cy: -244, rx: 15, ry: 5.8, rotate: 5, fill: c.parchmentCream, opacity: windowLit ? 0.32 : 0.12 },
        { cx: -46, cy: -246, rx: 16, ry: 5.4, rotate: -4, fill: c.stoneLight, opacity: windowLit ? 0.24 : 0.08 },
        { cx: -26, cy: -244, rx: 12, ry: 4.6, rotate: 6, fill: c.boardToothLight, opacity: windowLit ? 0.14 : 0.05 },
      ],
      { seed: 13 }
    ),
    gouachePath(chimneyBodyD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(chimneyClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -94, cy: -214, rx: 12, ry: 22, fill: c.russetEarth, opacity: 0.58 },
          { cx: -75, cy: -210, rx: 13, ry: 26, fill: c.cottageRoofShadow, opacity: 0.72 },
          { cx: -86, cy: -186, rx: 14, ry: 14, fill: c.nightSkyMid, opacity: 0.34 },
        ],
        { seed: 17 }
      ),
    ]),
    xeroxSketchStroke(
      `${chimneyBodyD} M -101 -222 L -69 -222 M -101 -208 L -69 -208 M -101 -194 L -69 -194 M -88 -236 L -88 -222 M -78 -222 L -78 -208 M -90 -208 L -90 -194`,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
    ),
    // Corbeled brick cap with puffy snow cushion perched on top
    celPath('M -108 -236 L -62 -236 L -62 -243 L -108 -243 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath(
      'M -109 -242 C -104 -250, -66 -250, -61 -242 C -68 -239, -102 -239, -109 -242 Z',
      c.parchmentCream,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
  ]);

  // 2. Half-Timbered Victorian Plaster Walls (`data-part="walls"`)
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main right/center plaster shop wall
    gouachePath(mainWallD, c.cottagePlaster, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mainWallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -10, cy: -84, rx: 46, ry: 40, fill: c.boardToothWarm, opacity: 0.52 },
          { cx: 64, cy: -74, rx: 64, ry: 44, fill: c.boardToothLight, opacity: 0.36 },
          { cx: 122, cy: -58, rx: 44, ry: 56, fill: c.cottagePlasterShadow, opacity: 0.7 },
          { cx: 48, cy: -116, rx: 110, ry: 18, fill: c.nightSkyMid, opacity: 0.44 },
          { cx: -28, cy: -62, rx: 18, ry: 68, fill: c.nightSkyZenith, opacity: 0.36 },
        ],
        { seed: 23 }
      ),
      // Soft warm ochre watercolor light wash brushed around the lit Victorian bay window
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: 48, cy: -62, rx: 86, ry: 50, fill: c.warmAmberWash, opacity: 0.28 },
              { cx: 48, cy: -60, rx: 66, ry: 40, fill: c.warmAmberGlow, opacity: 0.32 },
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

    // Protruding left gable timber-and-plaster wing
    gouachePath(gableWallD, c.cottagePlaster, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(gableWallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -128, cy: -78, rx: 36, ry: 56, fill: c.boardToothLight, opacity: 0.48 },
          { cx: -90, cy: -136, rx: 38, ry: 34, fill: c.boardToothWarm, opacity: 0.46 },
          { cx: -56, cy: -62, rx: 34, ry: 68, fill: c.cottagePlasterShadow, opacity: 0.66 },
          { cx: -90, cy: -164, rx: 52, ry: 22, fill: c.nightSkyMid, opacity: 0.4 },
        ],
        { seed: 31 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: -90, cy: -146, rx: 26, ry: 22, fill: c.warmAmberGlow, opacity: 0.28 },
              { cx: -92, cy: -52, rx: 28, ry: 24, fill: c.warmAmberWash, opacity: 0.2 },
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

    // Dickensian dark walnut half-timber framing (`data-part="timber-framing"`)
    svgEl('g', { 'data-part': 'timber-framing' }, [
      // Left gable tie beam, corner posts & Tudor diagonal braces
      celPath('M -150 -116 L -32 -116 L -32 -109 L -150 -109 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -150 -116 L -143 -116 L -143 -8 L -150 -8 Z', c.woodMid, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -39 -116 L -32 -116 L -32 -8 L -39 -8 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -132 -116 L -112 -144 L -107 -141 L -126 -116 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
      }),
      celPath('M -50 -116 L -70 -144 L -75 -141 L -56 -116 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
      }),
      // Main wall corner post & upper timber lintel beam
      celPath('M 139 -128 L 146 -128 L 147 -8 L 140 -8 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -34 -128 L 146 -128 L 146 -121 L -34 -121 Z', c.woodDark, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      xeroxSketchStroke(
        'M -146 -104 L -146 -18 M -35 -104 L -35 -18 M 143 -118 L 143 -18 M -140 -112.5 L -42 -112.5',
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine, broken: true, opacity: 0.62 }
      ),
    ]),

    // Weathered stone foundation plinth
    gouachePath('M -150 0 L 148 0 L 148 -11 L -150 -11 Z', c.stoneBase, {
      softEdge: false,
    }),
    xeroxSketchStroke(
      'M -150 -11 L 148 -11 M -120 -11 L -120 0 M -52 -11 L -52 0 M 14 -11 L 14 0 M 82 -11 L 82 0',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
  ]);

  // 3. Round Attic Window, Arched Oak Shop Door with Holly Wreath & Brass Knocker (`data-part="shop-door"`)
  const shopDoor = svgEl('g', { 'data-part': 'shop-door' }, [
    // Gable round attic window at (-90, -146)
    svgEl('circle', {
      cx: -90,
      cy: -146,
      r: 17.5,
      fill: c.woodDark,
      stroke: c.xeroxInk,
      'stroke-width': s.xeroxFine,
    }),
    svgEl('circle', {
      cx: -90,
      cy: -146,
      r: 14.5,
      fill: windowLit ? c.warmAmberGlow : c.nightSkyMid,
    }),
    windowLit
      ? svgEl('circle', {
          cx: -90,
          cy: -145,
          r: 9.0,
          fill: c.warmAmberCore,
          opacity: 0.74,
        })
      : '',
    xeroxSketchStroke('M -104 -146 L -76 -146 M -90 -160 L -90 -132', {
      stroke: c.woodDark,
      strokeWidth: 2.0,
      opacity: 0.95,
    }),

    // Recessed arched oak shop doorway frame (`x: -118..-66, y: -88..0`)
    celPath('M -121 0 L -121 -67 Q -92 -92, -63 -67 L -63 0 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celShadedShape({
      d: 'M -117 0 L -117 -65 Q -92 -87, -67 -65 L -67 0 Z',
      baseFill: c.woodMid,
      shadowPaths: [
        'M -117 -65 Q -92 -87, -67 -65 L -67 -59 Q -92 -80, -117 -59 Z',
        'M -79 -74 L -67 -65 L -67 0 L -79 0 Z',
      ],
      shadowFill: c.woodDark,
      shadowOpacity: 0.65,
      highlightPaths: ['M -115 -63 L -109 -67 L -109 0 L -115 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.48,
      clipId: doorClipId,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke(
      'M -104 -74 L -104 0 M -92 -77 L -92 0 M -80 -74 L -80 0',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
    // Iron strap hinges
    celPath('M -117 -56 L -99 -56 L -97 -53 L -117 -53 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    celPath('M -117 -22 L -99 -22 L -97 -19 L -117 -19 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),

    // Festive watercolor + pencil holly wreath on oak shop door
    watercolorWashBlotches(
      [
        { cx: -102, cy: -48, rx: 6.5, ry: 6.0, fill: c.foliageShadow, opacity: 0.86 },
        { cx: -92, cy: -57, rx: 7.0, ry: 5.5, fill: c.foliageMid, opacity: 0.86 },
        { cx: -82, cy: -48, rx: 6.5, ry: 6.0, fill: c.oliveCanopy, opacity: 0.86 },
        { cx: -92, cy: -39, rx: 7.0, ry: 5.5, fill: c.foliageShadow, opacity: 0.86 },
      ],
      { seed: 43 }
    ),
    pencilFoliageScribbles(
      [{ cx: -92, cy: -48, rx: 12, ry: 11, density: 0.9 }],
      {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 0.95,
        opacity: 0.82,
        includeTwigs: false,
        seed: 45,
      }
    ),
    // Crimson wreath ribbon bow & holly berries
    celPath(
      'M -92 -59 L -98 -63 L -95 -56 Z M -92 -59 L -86 -63 L -89 -56 Z',
      c.mochiCollar,
      { stroke: c.xeroxInk, strokeWidth: 0.8 }
    ),
    svgEl('circle', { cx: -101, cy: -48, r: 1.9, fill: c.mochiCollar }),
    svgEl('circle', { cx: -83, cy: -47, r: 1.9, fill: c.mochiCollar }),
    svgEl('circle', { cx: -92, cy: -38, r: 1.9, fill: c.flowerRose }),

    // Gleaming antique brass door knocker & ring
    svgEl('circle', {
      cx: -92,
      cy: -48,
      r: 4.2,
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 2.0,
    }),
    svgEl('circle', {
      cx: -74,
      cy: -34,
      r: 3.1,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 0.9,
    }),

    // Snow-dusted cobblestone shop steps
    celPath('M -128 1 L -56 1 L -60 -5 L -124 -5 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -122 -5 L -62 -5 L -66 -10 L -118 -10 Z', c.parchmentCream, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
  ]);

  // 4. Multi-Pane Victorian Bay Window with Snow-Capped Hood & Warm Light Spill (`data-part="bay-window"`)
  const bayWindow = svgEl('g', { 'data-part': 'bay-window' }, [
    // Bay window timber apron & sill box
    celPath('M -24 -22 L 122 -22 L 118 -10 L -20 -10 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Glowing painted amber watercolor window interior (4x3 Victorian panes)
    svgEl('path', {
      d: 'M -20 -102 L 118 -102 L 118 -22 L -20 -22 Z',
      fill: windowLit ? c.warmAmberGlow : c.nightSkyZenith,
    }),
    windowLit
      ? watercolorWashBlotches(
          [
            { cx: 49, cy: -66, rx: 52, ry: 28, fill: c.warmAmberCore, opacity: 0.8 },
            { cx: 14, cy: -56, rx: 28, ry: 22, fill: c.warmAmberWash, opacity: 0.42 },
            { cx: 88, cy: -58, rx: 28, ry: 22, fill: c.warmAmberWash, opacity: 0.42 },
          ],
          { seed: 51 }
        )
      : watercolorWashBlotches(
          [
            { cx: 24, cy: -74, rx: 36, ry: 24, fill: c.slateBlue, opacity: 0.36 },
            { cx: 82, cy: -54, rx: 34, ry: 22, fill: c.nightSkyMid, opacity: 0.45 },
          ],
          { seed: 51 }
        ),
    // Cozy Dickensian interior curtains & clock silhouette inside lit bay window
    celPath(
      'M -20 -102 L 12 -102 Q 4 -72, -6 -44 L -20 -44 Z',
      windowLit ? c.dustyRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    celPath(
      'M 118 -102 L 86 -102 Q 94 -72, 104 -44 L 118 -44 Z',
      windowLit ? c.dustyRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    windowLit
      ? svgEl('g', { opacity: 0.42 }, [
          // Distant silhouette of a hanging shop clock & evergreen sprig inside the warm shop
          svgEl('circle', { cx: 48, cy: -72, r: 9, fill: c.woodDark }),
          svgEl('path', {
            d: 'M 48 -63 L 48 -46 M 44 -52 L 52 -52',
            stroke: c.woodDark,
            'stroke-width': 2.2,
          }),
        ])
      : '',
    // Tiny frosty snow triangles tucked in the bottom corners of panes
    ...[-18, 16, 51, 86].map((px) =>
      svgEl('path', {
        d: `M ${px} -22 Q ${px + 9} -28, ${px + 18} -22 Z`,
        fill: c.parchmentCream,
        opacity: 0.78,
      })
    ),
    // Hand-inked 4x3 Victorian timber muntin bars & sturdy outer frame
    xeroxSketchStroke(
      [
        'M 14 -102 L 14 -22 M 49 -102 L 49 -22 M 84 -102 L 84 -22',
        'M -20 -76 L 118 -76 M -20 -48 L 118 -48',
      ].join(' '),
      { stroke: c.woodDark, strokeWidth: 2.3, opacity: 0.96 }
    ),
    xeroxSketchStroke(
      'M 14 -102 L 14 -22 M 49 -102 L 49 -22 M 84 -102 L 84 -22 M -20 -76 L 118 -76 M -20 -48 L 118 -48',
      { stroke: c.xeroxInk, strokeWidth: 0.85, opacity: 0.85 }
    ),
    celPath('M -20 -102 L 118 -102 L 118 -22 L -20 -22 Z', 'none', {
      stroke: c.woodDark,
      strokeWidth: 4.0,
    }),
    xeroxSketchStroke('M -20 -102 L 118 -102 L 118 -22 L -20 -22 Z', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
      opacity: 0.92,
    }),
    // Snow-capped leaded bay window pent-roof hood
    celPath('M -26 -102 L 124 -102 L 116 -114 L -18 -114 Z', c.cottageRoofShadow, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath(
      'M -27 -104 C -10 -118, 108 -118, 125 -104 C 102 -98, -4 -98, -27 -104 Z',
      c.parchmentCream,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    // Hanging icicle pencil ticks beneath bay window snow hood
    xeroxSketchStroke(
      'M -14 -100 L -14 -93 M 8 -99 L 8 -91 M 36 -99 L 36 -94 M 66 -99 L 66 -90 M 96 -99 L 96 -93 M 114 -100 L 114 -94',
      { stroke: c.slateBlue, strokeWidth: 1.25, opacity: 0.82 }
    ),
  ]);

  // 5. Steep Pitched Roof Heavy with Puffy Watercolor Snowdrifts & Icicle Pencil Ticks (`data-part="roof"`)
  const roof = svgEl('g', { 'data-part': 'roof' }, [
    // Exposed roof under-slope peeking beneath heavy snowdrifts
    gouachePath(mainRoofD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mainRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: 18, cy: -164, rx: 92, ry: 34, fill: c.cottageRoofShadow, opacity: 0.65 },
          { cx: 92, cy: -152, rx: 58, ry: 34, fill: c.slateBlue, opacity: 0.34 },
        ],
        { seed: 59 }
      ),
    ]),
    xeroxSketchStroke(mainRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.86,
    }),

    // Thick hand-painted puffy watercolor snowdrift blanketing the main roof
    gouachePath(mainSnowD, c.parchmentCream, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mainSnowClipId) }, [
      watercolorWashBlotches(
        [
          { cx: 18, cy: -196, rx: 108, ry: 16, fill: c.boardToothLight, opacity: 0.72 },
          { cx: -12, cy: -156, rx: 64, ry: 24, fill: c.slateBlue, opacity: 0.24 },
          { cx: 88, cy: -146, rx: 68, ry: 26, fill: c.slateBlue, opacity: 0.32 },
          { cx: 48, cy: -122, rx: 106, ry: 12, fill: c.nightMistTeal, opacity: 0.3 },
        ],
        { seed: 67 }
      ),
    ]),
    xeroxSketchStroke(mainSnowD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.88,
      feather: true,
    }),

    // Steep left gable roof blanketed in puffy watercolor snow
    gouachePath(gableSnowD, c.parchmentCream, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(gableSnowClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -126, cy: -154, rx: 32, ry: 24, rotate: -46, fill: c.boardToothLight, opacity: 0.68 },
          { cx: -54, cy: -154, rx: 34, ry: 24, rotate: 46, fill: c.slateBlue, opacity: 0.34 },
        ],
        { seed: 71 }
      ),
    ]),
    xeroxSketchStroke(gableSnowD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.9,
      feather: true,
    }),

    // Crisp hand-inked icicle pencil ticks hanging along the snowy roof eaves
    xeroxSketchStroke(
      [
        'M -154 -110 L -154 -100 M -142 -112 L -142 -105 M -36 -112 L -36 -102',
        'M -10 -118 L -10 -108 M 18 -120 L 18 -111 M 52 -118 L 52 -107 M 86 -118 L 86 -109 M 120 -118 L 120 -106 M 148 -118 L 148 -109',
      ].join(' '),
      {
        stroke: c.slateBlue,
        strokeWidth: 1.35,
        opacity: 0.85,
      }
    ),
  ]);

  // 6. Puffy Watercolor Snowbanks Hugging the Foundation + Warm Window Spill onto Snow (`data-part="snow-drifts"`)
  const snowDrifts = svgEl('g', { 'data-part': 'snow-drifts' }, [
    watercolorWashBlotches(
      [
        { cx: -136, cy: -2, rx: 28, ry: 8.5, fill: c.parchmentCream, opacity: 0.88 },
        { cx: -40, cy: -1, rx: 26, ry: 7.5, fill: c.boardToothLight, opacity: 0.85 },
        { cx: 48, cy: -2, rx: 68, ry: 8.5, fill: c.parchmentCream, opacity: 0.88 },
        { cx: 132, cy: -2, rx: 32, ry: 9.0, fill: c.boardToothLight, opacity: 0.88 },
        { cx: 88, cy: 1, rx: 52, ry: 5.5, fill: c.slateBlue, opacity: 0.24 },
      ],
      { seed: 79 }
    ),
    // Soft warm ochre watercolor spill falling onto the snowy stoop beneath the bay window when lit
    windowLit
      ? watercolorWashBlotches(
          [
            { cx: 48, cy: -2, rx: 64, ry: 8.5, fill: c.warmAmberGlow, opacity: 0.32 },
            { cx: -92, cy: -1, rx: 32, ry: 6.0, fill: c.warmAmberWash, opacity: 0.2 },
          ],
          { seed: 83 }
        )
      : '',
    xeroxSketchStroke(
      'M -160 1 Q -138 -9, -118 -2 M -56 1 Q -38 -8, -18 -1 M -16 -1 Q 48 -9, 114 -1 Q 138 -9, 160 1',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-building': 'snowy_cottage',
      'data-art-style': 'classic_cel',
    },
    [clipDefs, groundShadow, chimney, walls, shopDoor, bayWindow, roof, snowDrifts]
  );
}

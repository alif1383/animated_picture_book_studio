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
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { BuildingRenderOptions } from '../../buildings/types';

/**
 * Renders the Classic 1970s–1980s Disney hand-painted watercolor/gouache & loose
 * sepia-ink Scorched Village Cottage (`'scorched_cottage'`) for `classic_cel` scenes.
 *
 * Crafted as authentic Layer 1A illustration-board medieval village background art
 * (*Robin Hood* 1973 / *The Sword in the Stone* 1963):
 * - Half-timbered medieval plaster cottage (`cottagePlaster`, `cottagePlasterShadow`,
 *   `woodDark`, `woodMid`) with wet-on-wet watercolor stucco mottling
 * - Crooked scorched terracotta/thatch roof (`cottageRoof`, `cottageRoofShadow`) with
 *   a dragon-singed notch and leaning chipped chimney
 * - Wet-on-wet watercolor soot smudges (`sootChar`, `sootAsh` via `watercolorWashBlotches`)
 * - Comically askew wooden shutter (`cottageShutter`) dangling from one hinge, tall oak
 *   door (`y: -86..0`), singed flower box, and wispy rising ash curls (`roof-smoke`)
 *
 * Local origin `(0, 0)` at bottom-center ground contact; bounds `x: -148..+148, y: -266..0`.
 */
export function renderClassicScorchedCottage(
  options: BuildingRenderOptions
): string {
  const { windowLit = false, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  const pid = (name: string): string => `cc-scorched-cottage-${name}${safeSuffix}`;

  const wallClipId = pid('wall-clip');
  const roofClipId = pid('roof-clip');
  const chimneyClipId = pid('chimney-clip');
  const doorClipId = pid('door-clip');

  // Architectural silhouettes (strictly within x: -148..+148, y: -266..0)
  const wallD = 'M -126 -138 L 126 -138 L 130 0 L -130 0 Z';
  const chimneyD = 'M 48 -206 L 82 -214 L 86 -150 L 52 -150 Z';
  const roofD =
    'M -148 -134 L -100 -166 L -4 -226 L 68 -182 L 84 -162 L 106 -169 L 148 -132 L 138 -127 Q 96 -134, 54 -128 Q 0 -136, -54 -128 Q -102 -135, -142 -128 Z';
  const doorD = 'M -24 0 L -24 -64 C -24 -86, 24 -86, 24 -64 L 24 0 Z';

  // Local clip paths keep wet-on-wet watercolor washes neatly inside architectural planes
  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: wallClipId }, svgEl('path', { d: wallD })),
    svgEl('clipPath', { id: roofClipId }, svgEl('path', { d: roofD })),
    svgEl('clipPath', { id: chimneyClipId }, svgEl('path', { d: chimneyD })),
  ]);

  // Soft painted grounding shadow beneath the cottage stone foundation
  const groundShadow = celContactShadow(0, 0, 134, 5.8, 0.32);

  // Helper for casement windows honoring `windowLit` (default: false)
  const renderWindow = (
    leftX: number,
    topY: number,
    rightX: number,
    bottomY: number,
    seed: number
  ): string => {
    const cx = (leftX + rightX) / 2;
    const cy = (topY + bottomY) / 2;
    const w = rightX - leftX;
    const h = bottomY - topY;
    const paneD = `M ${leftX} ${topY} L ${rightX} ${topY} L ${rightX} ${bottomY} L ${leftX} ${bottomY} Z`;

    return svgEl('g', {}, [
      // Glass base
      svgEl('path', {
        d: paneD,
        fill: windowLit ? c.warmAmberGlow : c.nightSkyMid,
      }),
      // Warm candlelit glow OR unlit dusty/sooty dark interior glint
      windowLit
        ? watercolorWashBlotches(
            [
              {
                cx,
                cy: cy - 2,
                rx: w * 0.4,
                ry: h * 0.34,
                fill: c.warmAmberCore,
                opacity: 0.78,
              },
              {
                cx,
                cy: bottomY - 6,
                rx: w * 0.42,
                ry: 7,
                fill: c.warmAmberWash,
                opacity: 0.38,
              },
            ],
            { seed }
          )
        : svgEl('g', {}, [
            svgEl('path', {
              d: `M ${leftX} ${topY} L ${rightX} ${topY} L ${rightX} ${topY + 12} L ${leftX} ${topY + 12} Z`,
              fill: c.nightSkyZenith,
              opacity: 0.55,
            }),
            xeroxSketchStroke(
              `M ${leftX + 5} ${topY + 6} L ${cx + 4} ${cy + 5} M ${leftX + 12} ${topY + 5} L ${rightX - 5} ${cy + 2}`,
              {
                stroke: c.waterHighlight,
                strokeWidth: 1.15,
                broken: true,
                opacity: 0.34,
              }
            ),
          ]),
      // Timber cross mullions & dark timber window frame
      xeroxSketchStroke(
        `M ${cx} ${topY} L ${cx} ${bottomY} M ${leftX} ${cy} L ${rightX} ${cy}`,
        { stroke: c.woodDark, strokeWidth: 2.1, opacity: 0.94 }
      ),
      xeroxSketchStroke(
        `M ${cx} ${topY} L ${cx} ${bottomY} M ${leftX} ${cy} L ${rightX} ${cy}`,
        { stroke: c.xeroxInk, strokeWidth: 0.8, opacity: 0.8 }
      ),
      celPath(paneD, 'none', {
        stroke: c.woodDark,
        strokeWidth: 3.4,
      }),
      xeroxSketchStroke(paneD, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        opacity: 0.9,
      }),
    ]);
  };

  // 1. Half-Timbered Plaster Cottage Body, Tall Oak Door, Windows & Tilted Shutter (`data-part="cottage-front"`)
  const cottageFront = svgEl('g', { 'data-part': 'cottage-front' }, [
    // Plaster stucco wall base + clipped wet-on-wet watercolor weathering washes
    gouachePath(wallD, c.cottagePlaster, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(wallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -78, cy: -84, rx: 48, ry: 44, fill: c.boardToothWarm, opacity: 0.54 },
          { cx: 14, cy: -76, rx: 56, ry: 46, fill: c.ochreEarth, opacity: 0.3 },
          { cx: 92, cy: -68, rx: 46, ry: 62, fill: c.cottagePlasterShadow, opacity: 0.72 },
          { cx: -28, cy: -18, rx: 76, ry: 26, fill: c.cottagePlasterShadow, opacity: 0.56 },
          { cx: 82, cy: -22, rx: 48, ry: 26, fill: c.pathEarthDark, opacity: 0.42 },
          { cx: 0, cy: -128, rx: 126, ry: 18, fill: c.nightSkyMid, opacity: 0.44 },
        ],
        { seed: 201 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: -68, cy: -66, rx: 32, ry: 28, fill: c.warmAmberWash, opacity: 0.28 },
              { cx: 68, cy: -66, rx: 32, ry: 28, fill: c.warmAmberWash, opacity: 0.28 },
            ],
            { seed: 203 }
          )
        : '',
    ]),
    xeroxSketchStroke(wallD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
      opacity: 0.9,
      feather: true,
    }),

    // Medieval half-timber dark oak framing beams & knee braces
    celPath('M -126 -138 L 126 -138 L 126 -130 L -126 -130 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -126 -130 L -118 -130 L -120 -10 L -128 -10 Z', c.woodMid, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 118 -130 L 126 -130 L 128 -10 L 120 -10 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -38 -130 L -31 -130 L -31 -10 L -38 -10 Z', c.woodMid, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 31 -130 L 38 -130 L 38 -10 L 31 -10 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    // Diagonal timber braces
    celPath('M -118 -130 L -96 -104 L -102 -101 L -120 -122 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 118 -130 L 96 -104 L 102 -101 L 120 -122 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke(
      [
        'M -122 -124 L -124 -22 M 122 -124 L 124 -22',
        'M -34.5 -122 L -34.5 -20 M 34.5 -122 L 34.5 -20',
        'M -114 -134 L 112 -134',
        'M -92 -118 L -84 -112 M 44 -112 L 58 -108',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.62 }
    ),

    // Weathered fieldstone foundation baseboard (`y: -11..0`)
    gouachePath('M -130 0 L 130 0 L 130 -11 L -130 -11 Z', c.stoneBase, {
      softEdge: false,
    }),
    svgEl('path', {
      d: 'M -129 -5 L 129 -5 L 129 0 L -129 0 Z',
      fill: c.stoneShadow,
      opacity: 0.68,
    }),
    xeroxSketchStroke(
      'M -130 -11 L 130 -11 M -104 -11 L -104 0 M -62 -11 L -62 0 M 54 -11 L 54 0 M 96 -11 L 96 0',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.74 }
    ),

    // Tall arched wooden front door (`y: -86..0`)
    celPath(
      'M -27 0 L -27 -65 C -27 -90, 27 -90, 27 -65 L 27 0 Z',
      c.woodDark,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
    celShadedShape({
      d: doorD,
      baseFill: c.woodMid,
      shadowPaths: [
        'M -24 -64 C -24 -86, 24 -86, 24 -64 L 24 -57 C 24 -78, -24 -78, -24 -57 Z',
        'M 10 -76 L 24 -64 L 24 0 L 10 0 Z',
      ],
      shadowFill: c.woodDark,
      shadowOpacity: 0.7,
      highlightPaths: ['M -22 -62 L -16 -68 L -16 0 L -22 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.44,
      clipId: doorClipId,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke(
      'M -12 -74 L -12 0 M 0 -78 L 0 0 M 12 -74 L 12 0 M -18 -46 L -18 -26',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
    celPath('M -24 -58 L -8 -58 L -6 -55 L -24 -55 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    celPath('M -24 -22 L -8 -22 L -6 -19 L -24 -19 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    svgEl('circle', {
      cx: 15,
      cy: -36,
      r: 2.8,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 0.8,
    }),
    // Stone doorstep at y = 0
    celPath('M -32 0 L 32 0 L 29 -5 L -29 -5 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),

    // Left casement window + intact teal shutters & singed flower box
    celPath('M -104 -87 L -90 -87 L -90 -46 L -104 -46 Z', c.cottageShutter, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    xeroxSketchStroke(
      'M -102 -80 L -92 -80 M -102 -72 L -92 -72 M -102 -64 L -92 -64 M -102 -56 L -92 -56',
      { stroke: c.cottageShutterShadow, strokeWidth: 1.2, broken: true, opacity: 0.85 }
    ),
    renderWindow(-88, -88, -48, -46, 211),

    // Singed wooden flower box under left window with wilted drooping stems
    celPath('M -93 -46 L -43 -46 L -47 -34 L -89 -34 Z', c.woodMid, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('path', {
      d: 'M -91 -40 L -45 -40 L -47 -34 L -89 -34 Z',
      fill: c.woodDark,
      opacity: 0.65,
    }),
    gouacheDabWash(
      [
        { cx: -82, cy: -48, rx: 7, ry: 4.5, fill: c.oliveCanopy },
        { cx: -68, cy: -49, rx: 8, ry: 4.8, fill: c.sootAsh },
        { cx: -54, cy: -47, rx: 7, ry: 4.2, fill: c.foliageShadow },
      ],
      {
        fill: c.oliveCanopy,
        wetEdgeColor: c.sootChar,
        wetEdgeOpacity: 0.35,
        softEdge: false,
        seed: 215,
      }
    ),
    pencilFoliageScribbles(
      [{ cx: -68, cy: -49, rx: 18, ry: 5.5, density: 0.85 }],
      {
        stroke: c.sootChar,
        strokeWidth: 0.95,
        opacity: 0.78,
        includeTwigs: false,
        seed: 217,
      }
    ),
    // Drooping singed flower stems
    xeroxSketchStroke('M -78 -48 Q -82 -56, -86 -51 M -58 -48 Q -53 -54, -49 -48', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 1.0,
      opacity: 0.8,
    }),
    svgEl('circle', { cx: -86, cy: -51, r: 2.3, fill: c.dustyRose, opacity: 0.78 }),

    // Right casement window + comically askew hanging wooden shutter (`data-part="tilted-shutter"`)
    renderWindow(48, -88, 88, -46, 221),
    // Broken lower hinge stub left on wall next to right window
    celPath('M 88 -54 L 93 -54 L 93 -51 L 88 -51 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.7,
    }),
    // Askew shutter dangling by its top hinge
    svgEl(
      'g',
      {
        'data-part': 'tilted-shutter',
        transform: svgTransform({ x: 90, y: -86, rotate: 24 }),
      },
      [
        // Wall drop shadow behind crooked shutter
        svgEl('path', {
          d: 'M 3 3 L 21 3 L 21 45 L 3 45 Z',
          fill: c.nightSkyZenith,
          opacity: 0.24,
        }),
        celPath('M 0 0 L 18 0 L 18 42 L 0 42 Z', c.cottageShutter, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.xeroxMedium,
        }),
        svgEl('path', {
          d: 'M 11 0 L 18 0 L 18 42 L 11 42 Z',
          fill: c.cottageShutterShadow,
          opacity: 0.58,
        }),
        xeroxSketchStroke(
          [
            'M 3 7 L 15 7',
            'M 3 14 L 15 14',
            'M 3 21 L 15 21',
            'M 3 28 L 15 28',
            'M 3 35 L 15 35',
          ].join(' '),
          { stroke: c.cottageShutterShadow, strokeWidth: 1.35, broken: true, opacity: 0.88 }
        ),
        // Lone surviving top iron hinge strap
        celPath('M -2 3 L 6 3 L 6 6 L -2 6 Z', c.ironDark, {
          stroke: c.xeroxInk,
          strokeWidth: 0.7,
        }),
      ]
    ),
  ]);

  // 2. Crooked Scorched Terracotta/Thatch Roof & Leaning Chipped Chimney (`data-part="scorched-roof"`)
  const roof = svgEl('g', { 'data-part': 'scorched-roof' }, [
    // Tilted brick/stone chimney with chipped corner behind right roof slope
    gouachePath(chimneyD, c.cottageRoofShadow, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(chimneyClipId) }, [
      watercolorWashBlotches(
        [
          { cx: 56, cy: -186, rx: 14, ry: 24, fill: c.cottageRoof, opacity: 0.62 },
          { cx: 76, cy: -176, rx: 14, ry: 26, fill: c.sootChar, opacity: 0.64 },
          { cx: 66, cy: -206, rx: 18, ry: 12, fill: c.sootChar, opacity: 0.72 },
        ],
        { seed: 229 }
      ),
    ]),
    // Corbeled crooked chimney rim
    celPath('M 44 -207 L 85 -215 L 86 -208 L 45 -200 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    xeroxSketchStroke(
      'M 52 -192 L 82 -198 M 51 -178 L 83 -184 M 52 -164 L 84 -170 M 64 -202 L 66 -194 M 72 -184 L 74 -172',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.76 }
    ),
    xeroxSketchStroke(chimneyD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.9,
      feather: true,
    }),

    // Steep gabled terracotta/thatch roof with dragon-singed bite notch on the right slope
    gouachePath(roofD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(roofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -62, cy: -172, rx: 56, ry: 28, rotate: -26, fill: c.russetEarth, opacity: 0.66 },
          { cx: -14, cy: -196, rx: 44, ry: 24, fill: c.ochreEarth, opacity: 0.36 },
          { cx: 28, cy: -172, rx: 46, ry: 26, rotate: 24, fill: c.cottageRoofShadow, opacity: 0.66 },
          { cx: 88, cy: -158, rx: 46, ry: 26, rotate: 18, fill: c.sootChar, opacity: 0.72 },
          { cx: 66, cy: -176, rx: 32, ry: 20, fill: c.sootAsh, opacity: 0.56 },
          { cx: 0, cy: -134, rx: 136, ry: 14, fill: c.cottageRoofShadow, opacity: 0.68 },
          { cx: -94, cy: -148, rx: 20, ry: 9, fill: c.oliveCanopy, opacity: 0.28 },
        ],
        { seed: 233 }
      ),
    ]),
    // Crooked displaced shingle courses & ruffled thatch strokes
    xeroxSketchStroke(
      [
        'M -54 -194 Q -26 -184, 4 -195 Q 24 -188, 44 -194',
        'M -88 -174 Q -58 -160, -28 -176 Q 4 -164, 34 -178 Q 52 -168, 68 -176',
        'M -118 -154 Q -86 -140, -52 -156 Q -18 -144, 18 -156 Q 50 -144, 82 -154 Q 108 -144, 132 -150',
        'M -134 -138 Q -98 -126, -64 -140 Q -26 -128, 12 -140 Q 48 -130, 88 -138 Q 114 -130, 140 -136',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
    ),
    // Loose slipped tiles & charred singe cracks around the dragon bite-mark notch
    celPath('M 68 -164 L 84 -158 L 80 -150 L 65 -155 Z', c.sootChar, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -76 -160 L -60 -164 L -57 -155 L -73 -151 Z', c.russetEarth, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke(roofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),
    // Crooked wooden roof-ridge finial
    celPath('M -7 -225 L -2 -225 L -4 -235 Z', c.woodDark, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
  ]);

  // 3. Wet-on-Wet Watercolor Dragon-Singe Soot Smudges (`data-part="soot-marks"`)
  const sootMarks = svgEl('g', { 'data-part': 'soot-marks' }, [
    watercolorWashBlotches(
      [
        // Heavy singe bloom on the notched right roof slope
        { cx: 76, cy: -164, rx: 32, ry: 16, rotate: 16, fill: c.sootChar, opacity: 0.56 },
        { cx: 92, cy: -152, rx: 24, ry: 13, rotate: -10, fill: c.sootAsh, opacity: 0.48 },
        // Soot streak licking down the stucco wall above left window & flower box
        { cx: -62, cy: -106, rx: 24, ry: 14, rotate: -12, fill: c.sootChar, opacity: 0.38 },
        { cx: -50, cy: -98, rx: 18, ry: 11, rotate: 8, fill: c.sootAsh, opacity: 0.34 },
        // Soot smudge near the right window & askew shutter
        { cx: 74, cy: -98, rx: 22, ry: 12, rotate: 14, fill: c.sootChar, opacity: 0.4 },
        { cx: 80, cy: -52, rx: 18, ry: 10, rotate: -8, fill: c.sootAsh, opacity: 0.34 },
        // Subtle ash dust near the top of the front door arch
        { cx: 6, cy: -92, rx: 16, ry: 8, fill: c.sootAsh, opacity: 0.28 },
      ],
      { seed: 241 }
    ),
    // Sketchy diagonal charcoal-pencil scorch hatch ticks
    xeroxSketchStroke(
      [
        'M 54 -176 L 82 -156 M 62 -179 L 92 -158 M 74 -168 L 102 -150',
        'M -76 -112 L -48 -98 M -68 -115 L -44 -102',
        'M 64 -104 L 86 -92 M 70 -58 L 90 -48',
      ].join(' '),
      { stroke: c.sootChar, strokeWidth: 1.35, broken: true, opacity: 0.66 }
    ),
  ]);

  // 4. Wispy Rising Ash Curls & Watercolor Smoke Puffs (`data-part="roof-smoke"`, y >= -266)
  const roofSmoke = svgEl('g', { 'data-part': 'roof-smoke' }, [
    // Soft wet-on-wet drifting watercolor ash puffs rising from chimney & singed notch
    watercolorWashBlotches(
      [
        { cx: 74, cy: -190, rx: 14, ry: 8, rotate: -12, fill: c.sootAsh, opacity: 0.44 },
        { cx: 80, cy: -214, rx: 18, ry: 10, rotate: 10, fill: c.smokeSkyHaze, opacity: 0.42 },
        { cx: 68, cy: -236, rx: 20, ry: 10, rotate: -8, fill: c.sootAsh, opacity: 0.34 },
        { cx: 78, cy: -254, rx: 16, ry: 8, rotate: 12, fill: c.boardToothWarm, opacity: 0.26 },
        { cx: -28, cy: -234, rx: 14, ry: 7.5, rotate: -10, fill: c.smokeSkyHaze, opacity: 0.3 },
        { cx: -36, cy: -252, rx: 12, ry: 6.5, rotate: 8, fill: c.sootAsh, opacity: 0.22 },
      ],
      { seed: 251 }
    ),
    // Delicate curling hand-drawn pencil ash ribbons rising up to y = -266
    xeroxSketchStroke(
      [
        'M 72 -184 C 60 -204, 88 -220, 74 -244 C 66 -252, 74 -260, 82 -264',
        'M 80 -180 C 92 -198, 74 -216, 86 -236',
        'M -34 -210 C -44 -230, -24 -246, -38 -266',
        'M 18 -204 C 8 -224, 28 -240, 16 -258',
      ].join(' '),
      {
        stroke: c.sootAsh,
        strokeWidth: 1.75,
        dasharray: '6 3.5 3 2.5',
        opacity: 0.72,
      }
    ),
    // Floating charcoal ash specks
    svgEl('circle', { cx: 62, cy: -222, r: 1.6, fill: c.sootChar, opacity: 0.52 }),
    svgEl('circle', { cx: 92, cy: -232, r: 1.4, fill: c.sootAsh, opacity: 0.48 }),
    svgEl('circle', { cx: -26, cy: -242, r: 1.3, fill: c.sootAsh, opacity: 0.44 }),
    svgEl('circle', { cx: 24, cy: -238, r: 1.2, fill: c.sootChar, opacity: 0.42 }),
  ]);

  // 5. Singed hand-drawn pencil grass tufts rooting the cottage base at y = 0
  const baseGrass = pencilGrassStrokes(
    [
      { x: -116, y: 0, width: 22, height: 7.5, blades: 5, lean: -0.35 },
      { x: -42, y: 0, width: 16, height: 6.5, blades: 4, lean: -0.2 },
      { x: 114, y: 0, width: 22, height: 7.5, blades: 5, lean: 0.4 },
    ],
    {
      stroke: c.pencilOliveCharcoal,
      strokeWidth: 1.1,
      opacity: 0.8,
      seed: 257,
    }
  );

  return svgEl(
    'g',
    {
      'data-building': 'scorched_cottage',
      'data-art-style': 'classic_cel',
    },
    [
      clipDefs,
      groundShadow,
      cottageFront,
      roof,
      sootMarks,
      roofSmoke,
      baseGrass,
    ]
  );
}

import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  gouachePath,
  pencilFoliageScribbles,
  pencilGrassStrokes,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { BuildingRenderOptions } from '../../buildings/types';

/**
 * Renders the Classic 1970s–1980s Disney hand-painted watercolor/gouache & loose
 * sepia-ink Royal Castle (`'royal_castle'`) for `classic_cel` scenes.
 *
 * Crafted as authentic Layer 1A illustration-board medieval architecture
 * (*Robin Hood* 1973 / *The Sword in the Stone* 1963):
 * - Weathered medieval limestone walls (`stoneLight`, `stoneBase`, `stoneShadow`)
 *   with dappled wet-on-wet watercolor moss & rain-streak washes (`watercolorWashBlotches`)
 * - Muted slate-blue conical flanking turret roofs (`royalBlueTunic`, `royalBlueShadow`)
 *   and a steep russet terracotta central keep roof (`cottageRoof`, `cottageRoofShadow`)
 * - Tall vaulted stone portcullis archway (`y: -108..0`) generously sized for our
 *   `~105px` hero knight to march through
 * - Fluttering heraldic pennants (`soldierCrimson`, `antiqueGold`, `royalBlueTunic`),
 *   festive bunting & tower tapestries, and broken sepia/graphite masonry ticks
 *
 * Local origin `(0, 0)` at bottom-center ground contact; bounds `x: -182..+182, y: -328..0`.
 */
export function renderClassicRoyalCastle(
  options: BuildingRenderOptions
): string {
  const { windowLit = true, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  const pid = (name: string): string => `cc-royal-castle-${name}${safeSuffix}`;

  const leftTowerClipId = pid('left-tower-clip');
  const rightTowerClipId = pid('right-tower-clip');
  const leftRoofClipId = pid('left-roof-clip');
  const rightRoofClipId = pid('right-roof-clip');
  const keepWallClipId = pid('keep-wall-clip');
  const keepRoofClipId = pid('keep-roof-clip');
  const gateDoorClipId = pid('gate-door-clip');

  // Architectural silhouettes (strictly within x: -182..+182, y: -328..0)
  const leftTowerD = 'M -170 -210 L -102 -210 L -98 0 L -174 0 Z';
  const rightTowerD = 'M 102 -210 L 170 -210 L 174 0 L 98 0 Z';
  const leftRoofD = 'M -182 -210 L -136 -295 L -90 -210 Q -136 -203, -182 -210 Z';
  const rightRoofD = 'M 90 -210 L 136 -295 L 182 -210 Q 136 -203, 90 -210 Z';
  const keepWallD = [
    'M -104 -180',
    'L -104 -202 L -82 -202 L -82 -184',
    'L -58 -184 L -58 -202 L -34 -202 L -34 -184',
    'L -12 -184 L -12 -202 L 12 -202 L 12 -184',
    'L 34 -184 L 34 -202 L 58 -202 L 58 -184',
    'L 82 -184 L 82 -202 L 104 -202 L 104 -180',
    'L 104 0 L -104 0 Z',
  ].join(' ');
  const keepRoofD = 'M -70 -202 L 0 -268 L 70 -202 Z';

  // Local clip paths keep wet-on-wet watercolor washes neatly inside stone & slate planes
  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: leftTowerClipId }, svgEl('path', { d: leftTowerD })),
    svgEl('clipPath', { id: rightTowerClipId }, svgEl('path', { d: rightTowerD })),
    svgEl('clipPath', { id: leftRoofClipId }, svgEl('path', { d: leftRoofD })),
    svgEl('clipPath', { id: rightRoofClipId }, svgEl('path', { d: rightRoofD })),
    svgEl('clipPath', { id: keepWallClipId }, svgEl('path', { d: keepWallD })),
    svgEl('clipPath', { id: keepRoofClipId }, svgEl('path', { d: keepRoofD })),
  ]);

  // Subtle painted ground contact shadow beneath the castle masonry base
  const groundShadow = celContactShadow(0, 0, 176, 6.2, 0.3);

  // Helper for painted arched medieval castle windows honoring `windowLit`
  const renderArchedWindow = (
    cx: number,
    topY: number,
    bottomY: number,
    halfW: number,
    archH: number,
    seed: number
  ): string => {
    const leftX = cx - halfW;
    const rightX = cx + halfW;
    const springY = topY + archH;
    const midY = (springY + bottomY) / 2;

    const frameD = `M ${leftX - 3} ${bottomY + 2} L ${leftX - 3} ${springY} C ${leftX - 3} ${topY - 4}, ${rightX + 3} ${topY - 4}, ${rightX + 3} ${springY} L ${rightX + 3} ${bottomY + 2} Z`;
    const glassD = `M ${leftX} ${bottomY} L ${leftX} ${springY} C ${leftX} ${topY}, ${rightX} ${topY}, ${rightX} ${springY} L ${rightX} ${bottomY} Z`;

    return svgEl('g', {}, [
      // Recessed stone arch surround
      celPath(frameD, c.stoneShadow, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      // Window glass base
      svgEl('path', {
        d: glassD,
        fill: windowLit ? c.warmAmberGlow : c.nightSkyMid,
      }),
      // Candlelit inner core wash OR cool moonlit glass glint
      windowLit
        ? watercolorWashBlotches(
            [
              {
                cx,
                cy: (topY + bottomY) * 0.52,
                rx: halfW * 0.85,
                ry: (bottomY - topY) * 0.36,
                fill: c.warmAmberCore,
                opacity: 0.78,
              },
              {
                cx,
                cy: bottomY - 5,
                rx: halfW * 0.9,
                ry: 6,
                fill: c.warmAmberWash,
                opacity: 0.42,
              },
            ],
            { seed }
          )
        : xeroxSketchStroke(
            `M ${leftX + 3} ${springY + 2} L ${cx + 2} ${midY + 4} M ${leftX + 6} ${springY - 2} L ${rightX - 3} ${midY + 1}`,
            {
              stroke: c.waterHighlight,
              strokeWidth: 1.15,
              broken: true,
              opacity: 0.42,
            }
          ),
      // Leaded Gothic mullions & arch outline
      xeroxSketchStroke(
        `M ${cx} ${topY + 3} L ${cx} ${bottomY} M ${leftX} ${midY} L ${rightX} ${midY}`,
        {
          stroke: c.ironDark,
          strokeWidth: 1.4,
          opacity: 0.88,
        }
      ),
      xeroxSketchStroke(glassD, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        opacity: 0.92,
      }),
      // Dressed stone window sill
      celPath(
        `M ${leftX - 5} ${bottomY} L ${rightX + 5} ${bottomY} L ${rightX + 4} ${bottomY + 4} L ${leftX - 4} ${bottomY + 4} Z`,
        c.stoneLight,
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
      ),
    ]);
  };

  // 1. Twin Flanking Stone Towers & Muted Slate-Blue Conical Roofs (`data-part="castle-towers"`)
  const towers = svgEl('g', { 'data-part': 'castle-towers' }, [
    // Left tower shaft + clipped wet-on-wet limestone & moss washes
    gouachePath(leftTowerD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(leftTowerClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -158, cy: -150, rx: 24, ry: 56, fill: c.stoneLight, opacity: 0.68 },
          { cx: -152, cy: -58, rx: 28, ry: 48, fill: c.boardToothWarm, opacity: 0.44 },
          { cx: -116, cy: -114, rx: 24, ry: 88, fill: c.stoneShadow, opacity: 0.72 },
          { cx: -136, cy: -202, rx: 42, ry: 16, fill: c.nightSkyMid, opacity: 0.48 },
          { cx: -160, cy: -14, rx: 26, ry: 18, fill: c.oliveCanopy, opacity: 0.34 },
          { cx: -112, cy: -24, rx: 22, ry: 22, fill: c.sageFoliage, opacity: 0.28 },
          { cx: -136, cy: -84, rx: 24, ry: 22, fill: c.ochreEarth, opacity: 0.2 },
        ],
        { seed: 101 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [{ cx: -136, cy: -132, rx: 22, ry: 22, fill: c.warmAmberWash, opacity: 0.24 }],
            { seed: 103 }
          )
        : '',
    ]),
    xeroxSketchStroke(leftTowerD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.9,
      feather: true,
    }),

    // Right tower shaft + clipped wet-on-wet limestone & moss washes
    gouachePath(rightTowerD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(rightTowerClipId) }, [
      watercolorWashBlotches(
        [
          { cx: 118, cy: -148, rx: 24, ry: 58, fill: c.stoneLight, opacity: 0.56 },
          { cx: 124, cy: -60, rx: 24, ry: 48, fill: c.boardToothWarm, opacity: 0.36 },
          { cx: 156, cy: -108, rx: 26, ry: 92, fill: c.stoneShadow, opacity: 0.78 },
          { cx: 136, cy: -202, rx: 42, ry: 16, fill: c.nightSkyMid, opacity: 0.52 },
          { cx: 158, cy: -16, rx: 24, ry: 18, fill: c.oliveCanopy, opacity: 0.36 },
          { cx: 116, cy: -22, rx: 20, ry: 18, fill: c.sageFoliage, opacity: 0.26 },
          { cx: 142, cy: -88, rx: 22, ry: 20, fill: c.pathEarthDark, opacity: 0.22 },
        ],
        { seed: 107 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [{ cx: 136, cy: -132, rx: 22, ry: 22, fill: c.warmAmberWash, opacity: 0.24 }],
            { seed: 109 }
          )
        : '',
    ]),
    xeroxSketchStroke(rightTowerD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.9,
      feather: true,
    }),

    // Corbeled turret stone collars beneath conical eaves
    celPath('M -174 -211 L -98 -211 L -101 -202 L -171 -202 Z', c.stoneLight, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 98 -211 L 174 -211 L 171 -202 L 101 -202 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    xeroxSketchStroke(
      [
        'M -162 -210 L -162 -202 M -148 -210 L -148 -202 M -134 -210 L -134 -202 M -120 -210 L -120 -202 M -108 -210 L -108 -202',
        'M 108 -210 L 108 -202 M 120 -210 L 120 -202 M 134 -210 L 134 -202 M 148 -210 L 148 -202 M 162 -210 L 162 -202',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, opacity: 0.72 }
    ),

    // Battered stone tower base plinths
    gouachePath('M -175 0 L -97 0 L -99 -13 L -173 -13 Z', c.stoneShadow, {
      softEdge: false,
    }),
    gouachePath('M 97 0 L 175 0 L 173 -13 L 99 -13 Z', c.stoneShadow, {
      softEdge: false,
    }),
    xeroxSketchStroke(
      'M -173 -13 L -99 -13 M 99 -13 L 173 -13 M -154 -13 L -154 0 M -124 -13 L -124 0 M 124 -13 L 124 0 M 154 -13 L 154 0',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.74 }
    ),

    // Loose hand-drawn medieval ashlar masonry courses & weathered cracks on both towers
    xeroxSketchStroke(
      [
        'M -166 -184 L -112 -184 M -152 -184 L -152 -172 M -126 -172 L -126 -160',
        'M -168 -96 L -106 -96 M -166 -54 L -114 -54 M -142 -54 L -142 -42 M -158 -36 L -124 -36',
        'M 110 -184 L 166 -184 M 126 -184 L 126 -172 M 150 -172 L 150 -160',
        'M 106 -96 L 168 -96 M 114 -54 L 166 -54 M 142 -54 L 142 -42 M 122 -36 L 158 -36',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.68 }
    ),

    // Narrow medieval lower arrow-slit embrasures on towers
    celPath('M -138 -52 L -134 -52 L -134 -32 L -138 -32 Z', c.nightSkyZenith, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 134 -52 L 138 -52 L 138 -32 L 134 -32 Z', c.nightSkyZenith, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),

    // Left conical slate-blue turret roof + wet-on-wet watercolor slate shading
    gouachePath(leftRoofD, c.royalBlueTunic, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(leftRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -156, cy: -242, rx: 24, ry: 34, rotate: 22, fill: c.slateBlue, opacity: 0.66 },
          { cx: -146, cy: -268, rx: 14, ry: 22, fill: c.waterHighlight, opacity: 0.24 },
          { cx: -116, cy: -240, rx: 24, ry: 38, rotate: -20, fill: c.royalBlueShadow, opacity: 0.78 },
          { cx: -134, cy: -214, rx: 46, ry: 12, fill: c.nightSkyZenith, opacity: 0.42 },
        ],
        { seed: 113 }
      ),
    ]),
    xeroxSketchStroke(
      [
        'M -154 -264 Q -136 -258, -118 -264',
        'M -166 -244 Q -136 -236, -106 -244',
        'M -176 -224 Q -136 -215, -96 -224',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.68 }
    ),
    xeroxSketchStroke(leftRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),

    // Right conical slate-blue turret roof + wet-on-wet watercolor slate shading
    gouachePath(rightRoofD, c.royalBlueTunic, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(rightRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: 116, cy: -242, rx: 24, ry: 34, rotate: 20, fill: c.slateBlue, opacity: 0.62 },
          { cx: 126, cy: -268, rx: 14, ry: 22, fill: c.waterHighlight, opacity: 0.22 },
          { cx: 156, cy: -240, rx: 24, ry: 38, rotate: -22, fill: c.royalBlueShadow, opacity: 0.8 },
          { cx: 136, cy: -214, rx: 46, ry: 12, fill: c.nightSkyZenith, opacity: 0.44 },
        ],
        { seed: 117 }
      ),
    ]),
    xeroxSketchStroke(
      [
        'M 118 -264 Q 136 -258, 154 -264',
        'M 106 -244 Q 136 -236, 166 -244',
        'M 96 -224 Q 136 -215, 176 -224',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.68 }
    ),
    xeroxSketchStroke(rightRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),

    // Tower arched windows
    renderArchedWindow(-136, -158, -118, 12, 13, 121),
    renderArchedWindow(136, -158, -118, 12, 13, 123),
  ]);

  // 2. Central Stone Keep, Battlements & Russet Keep Roof (`data-part="castle-keep"`)
  const keep = svgEl('g', { 'data-part': 'castle-keep' }, [
    // Steep russet-terracotta upper central keep roof peak
    gouachePath(keepRoofD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(keepRoofClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -28, cy: -228, rx: 30, ry: 24, rotate: -28, fill: c.russetEarth, opacity: 0.66 },
          { cx: -12, cy: -246, rx: 20, ry: 16, fill: c.ochreEarth, opacity: 0.34 },
          { cx: 30, cy: -226, rx: 32, ry: 26, rotate: 28, fill: c.cottageRoofShadow, opacity: 0.78 },
          { cx: 0, cy: -206, rx: 64, ry: 10, fill: c.cottageRoofShadow, opacity: 0.62 },
          { cx: -24, cy: -214, rx: 14, ry: 6, fill: c.oliveCanopy, opacity: 0.26 },
        ],
        { seed: 127 }
      ),
    ]),
    xeroxSketchStroke(
      [
        'M -24 -244 Q 0 -238, 24 -244',
        'M -42 -228 Q 0 -221, 42 -228',
        'M -58 -212 Q 0 -206, 58 -212',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.7 }
    ),
    xeroxSketchStroke(keepRoofD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),

    // Main central keep limestone wall + wet-on-wet weathered watercolor washes
    gouachePath(keepWallD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(keepWallClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -62, cy: -132, rx: 46, ry: 52, fill: c.stoneLight, opacity: 0.62 },
          { cx: -26, cy: -62, rx: 56, ry: 48, fill: c.boardToothWarm, opacity: 0.44 },
          { cx: 14, cy: -148, rx: 48, ry: 34, fill: c.ochreEarth, opacity: 0.24 },
          { cx: 74, cy: -102, rx: 44, ry: 82, fill: c.stoneShadow, opacity: 0.72 },
          { cx: -92, cy: -94, rx: 16, ry: 90, fill: c.stoneShadow, opacity: 0.46 },
          { cx: 0, cy: -182, rx: 98, ry: 14, fill: c.nightSkyMid, opacity: 0.32 },
          { cx: -76, cy: -16, rx: 32, ry: 18, fill: c.oliveCanopy, opacity: 0.34 },
          { cx: 78, cy: -18, rx: 32, ry: 20, fill: c.sageFoliage, opacity: 0.32 },
        ],
        { seed: 131 }
      ),
      windowLit
        ? watercolorWashBlotches(
            [
              { cx: -62, cy: -132, rx: 24, ry: 24, fill: c.warmAmberWash, opacity: 0.24 },
              { cx: 62, cy: -132, rx: 24, ry: 24, fill: c.warmAmberWash, opacity: 0.24 },
            ],
            { seed: 133 }
          )
        : '',
    ]),

    // Merlon top capstones along battlements
    svgEl(
      'g',
      {},
      [
        [-104, -82],
        [-58, -34],
        [-12, 12],
        [34, 58],
        [82, 104],
      ].map(([x1, x2]) =>
        svgEl('path', {
          d: `M ${x1} -202 L ${x2} -202 L ${x2} -197 L ${x1} -197 Z`,
          fill: c.stoneLight,
          opacity: 0.72,
        })
      )
    ),
    // Battlement wall stringcourse moulding & broken sepia ashlar stone ticks
    xeroxSketchStroke(
      [
        'M -102 -176 L 102 -176',
        'M -96 -148 L -80 -148 M 78 -148 L 96 -148',
        'M -94 -94 L -58 -94 M 58 -94 L 94 -94',
        'M -92 -56 L -56 -56 M 56 -56 L 92 -56',
        'M -84 -94 L -84 -80 M -68 -56 L -68 -42 M 72 -94 L 72 -80 M 84 -56 L 84 -42',
        'M -46 -176 L -46 -164 M 46 -176 L 46 -164 M 0 -176 L 0 -164',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.7 }
    ),
    xeroxSketchStroke(keepWallD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),

    // Dressed stone foundation plinth flanking the gate
    gouachePath('M -104 0 L -48 0 L -48 -11 L -104 -11 Z', c.stoneShadow, {
      softEdge: false,
    }),
    gouachePath('M 48 0 L 104 0 L 104 -11 L 48 -11 Z', c.stoneShadow, {
      softEdge: false,
    }),
    xeroxSketchStroke('M -104 -11 L -48 -11 M 48 -11 L 104 -11', {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
      broken: true,
      opacity: 0.76,
    }),

    // Subtle Robin-Hood watercolor & pencil ivy creeping up inner castle-keep corners
    watercolorWashBlotches(
      [
        { cx: -96, cy: -18, rx: 11, ry: 12, fill: c.foliageShadow, opacity: 0.72 },
        { cx: -98, cy: -38, rx: 10, ry: 12, fill: c.oliveCanopy, opacity: 0.68 },
        { cx: 96, cy: -20, rx: 11, ry: 12, fill: c.foliageShadow, opacity: 0.72 },
        { cx: 98, cy: -42, rx: 9, ry: 11, fill: c.foliageMid, opacity: 0.66 },
      ],
      { seed: 137 }
    ),
    pencilFoliageScribbles(
      [
        { cx: -97, cy: -28, rx: 9, ry: 18, density: 0.9 },
        { cx: 97, cy: -30, rx: 9, ry: 18, density: 0.9 },
      ],
      {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.0,
        opacity: 0.78,
        includeTwigs: false,
        seed: 139,
      }
    ),

    // Flanking keep arched windows
    renderArchedWindow(-62, -156, -110, 14, 15, 141),
    renderArchedWindow(62, -156, -110, 14, 15, 143),

    // Heraldic royal shield & golden star crest centered cleanly above the tall gate arch (y: -148..-118)
    celPath(
      'M -14 -146 L 14 -146 L 14 -132 Q 14 -120, 0 -116 Q -14 -120, -14 -132 Z',
      c.royalBlueTunic,
      { stroke: c.antiqueGold, strokeWidth: 2.2 }
    ),
    xeroxSketchStroke(
      'M -14 -146 L 14 -146 L 14 -132 Q 14 -120, 0 -116 Q -14 -120, -14 -132 Z',
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine, opacity: 0.85 }
    ),
    celPath(
      'M 0 -141 L 2.8 -134.5 L 9.5 -134 L 4.2 -129.6 L 5.8 -123 L 0 -126.8 L -5.8 -123 L -4.2 -129.6 L -9.5 -134 L -2.8 -134.5 Z',
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: 0.85 }
    ),
    svgEl('circle', { cx: 0, cy: -132, r: 2.2, fill: c.warmAmberCore }),
  ]);

  // 3. Tall Vaulted Stone Portcullis Archway (`data-part="castle-gate"`, y: -108..0)
  const gateOuterD = 'M -50 0 L -50 -66 C -50 -108, 50 -108, 50 -66 L 50 0 Z';
  const gateInnerD = 'M -39 0 L -39 -62 C -39 -97, 39 -97, 39 -62 L 39 0 Z';

  const gate = svgEl('g', { 'data-part': 'castle-gate' }, [
    // Dressed limestone voussoir arch surround (`y: -108..0`)
    gouachePath(gateOuterD, c.stoneLight, { softEdge: false }),
    svgEl('path', {
      d: 'M 4 -105 C 32 -102, 50 -86, 50 -66 L 50 0 L 39 0 L 39 -62 C 39 -85, 22 -96, 4 -97 Z',
      fill: c.stoneShadow,
      opacity: 0.45,
    }),
    // Keystone at the crown of the arch (y: -108..-96)
    celPath('M -8 -108 L 8 -108 L 6 -96 L -6 -96 Z', c.boardToothLight, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    // Radial stone voussoir mortar lines & outer arch ink stroke
    xeroxSketchStroke(
      [
        'M -50 -66 L -39 -62 M 50 -66 L 39 -62',
        'M -46 -84 L -35 -77 M 46 -84 L 35 -77',
        'M -31 -98 L -23 -89 M 31 -98 L 23 -89',
        'M -50 -42 L -39 -42 M -50 -20 L -39 -20 M 39 -42 L 50 -42 M 39 -20 L 50 -20',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, opacity: 0.78 }
    ),
    xeroxSketchStroke(gateOuterD, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.92,
      feather: true,
    }),

    // Heavy oak double castle doors inside the tall vaulted arch
    celShadedShape({
      d: gateInnerD,
      baseFill: c.woodMid,
      shadowPaths: [
        'M -39 -62 C -39 -97, 39 -97, 39 -62 L 39 -52 C 39 -84, -39 -84, -39 -52 Z',
        'M 18 -90 L 39 -62 L 39 0 L 18 0 Z',
      ],
      shadowFill: c.woodDark,
      shadowOpacity: 0.72,
      highlightPaths: ['M -37 -60 L -29 -68 L -29 0 L -37 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.42,
      clipId: gateDoorClipId,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Vertical oak plank seams & central double-door split
    xeroxSketchStroke(
      'M 0 -92 L 0 0 M -26 -82 L -26 0 M -13 -89 L -13 0 M 13 -89 L 13 0 M 26 -82 L 26 0',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.7 }
    ),
    // Wrought-iron hinge straps & bronze door ring knockers
    celPath('M -39 -56 L -18 -56 L -16 -53 L -39 -53 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    celPath('M 18 -56 L 39 -56 L 39 -53 L 16 -53 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.8,
    }),
    svgEl('circle', {
      cx: -8,
      cy: -36,
      r: 3.4,
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 1.8,
    }),
    svgEl('circle', {
      cx: 8,
      cy: -36,
      r: 3.4,
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 1.8,
    }),

    // Wrought-iron raised portcullis lattice bars spanning the vaulted entrance
    svgEl('path', {
      d: [
        'M -24 -86 L -24 -8 M -12 -93 L -12 -8 M 0 -95 L 0 -8 M 12 -93 L 12 -8 M 24 -86 L 24 -8',
        'M -36 -66 L 36 -66 M -38 -42 L 38 -42 M -38 -18 L 38 -18',
      ].join(' '),
      fill: 'none',
      stroke: c.ironDark,
      'stroke-width': 2.5,
      'stroke-linecap': 'round',
      filter: svgUrl(TOKENS.classicCel.filters.ids.xeroxInk),
    }),
    xeroxSketchStroke(
      'M -23 -82 L -23 -16 M 1 -88 L 1 -16 M 25 -82 L 25 -16 M -34 -67 L 34 -67',
      { stroke: c.ironHighlight, strokeWidth: 0.85, broken: true, opacity: 0.55 }
    ),
    // Iron portcullis bottom teeth tips
    celPath(
      'M -26 -8 L -24 -2 L -22 -8 Z M -14 -8 L -12 -2 L -10 -8 Z M -2 -8 L 0 -2 L 2 -8 Z M 10 -8 L 12 -2 L 14 -8 Z M 22 -8 L 24 -2 L 26 -8 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: 0.7 }
    ),
    // Cobblestone gate threshold apron at y = 0
    celPath('M -54 0 L 54 0 L 50 -5 L -50 -5 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
  ]);

  // 4. Fluttering Heraldic Pennants on the 3 Peaks (`data-part="castle-flags"`, y >= -328)
  const flags = svgEl('g', { 'data-part': 'castle-flags' }, [
    // Left turret flagpole & waving crimson swallowtail pennant
    svgEl('path', {
      d: 'M -136 -294 L -136 -326',
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 2.8,
      'stroke-linecap': 'round',
    }),
    celPath(
      'M -135 -325 Q -118 -328, -94 -319 L -105 -314 L -95 -309 Q -118 -314, -135 -307 Z',
      c.soldierCrimson,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M -124 -321 Q -112 -322, -104 -316 L -124 -312 Z',
      fill: c.soldierCrimsonShadow,
      opacity: 0.45,
    }),
    xeroxSketchStroke('M -133 -316 Q -118 -319, -106 -314', {
      stroke: c.antiqueGold,
      strokeWidth: 1.4,
      opacity: 0.88,
    }),
    svgEl('circle', {
      cx: -136,
      cy: -326.5,
      r: 2.3,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 0.8,
    }),

    // Center keep flagpole & waving royal gold/blue pennant
    svgEl('path', {
      d: 'M 0 -267 L 0 -306',
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 3.0,
      'stroke-linecap': 'round',
    }),
    celPath(
      'M 1 -305 Q 22 -310, 48 -296 L 36 -292 L 46 -285 Q 22 -292, 1 -282 Z',
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M 1 -305 L 16 -294 L 1 -282 Z',
      fill: c.royalBlueTunic,
      opacity: 0.9,
    }),
    xeroxSketchStroke('M 14 -296 Q 26 -298, 36 -292', {
      stroke: c.warmAmberDeep,
      strokeWidth: 1.1,
      opacity: 0.65,
    }),
    svgEl('circle', {
      cx: 0,
      cy: -306.5,
      r: 2.5,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 0.8,
    }),

    // Right turret flagpole & waving crimson swallowtail pennant (tip at x = 178 <= 182)
    svgEl('path', {
      d: 'M 136 -294 L 136 -326',
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 2.8,
      'stroke-linecap': 'round',
    }),
    celPath(
      'M 137 -325 Q 154 -328, 178 -319 L 167 -314 L 177 -309 Q 154 -314, 137 -307 Z',
      c.soldierCrimson,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M 148 -321 Q 160 -322, 168 -316 L 148 -312 Z',
      fill: c.soldierCrimsonShadow,
      opacity: 0.45,
    }),
    xeroxSketchStroke('M 139 -316 Q 154 -319, 166 -314', {
      stroke: c.antiqueGold,
      strokeWidth: 1.4,
      opacity: 0.88,
    }),
    svgEl('circle', {
      cx: 136,
      cy: -326.5,
      r: 2.3,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 0.8,
    }),
  ]);

  // 5. Festive Bunting Banners & Vertical Tower Tapestries (`data-part="castle-banners"`)
  const banners = svgEl('g', { 'data-part': 'castle-banners' }, [
    // Gently draped bunting line strung between the flanking towers (clears crest & windows)
    xeroxSketchStroke('M -136 -184 Q 0 -158, 136 -184', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 1.5,
      opacity: 0.88,
    }),
    celPath('M -96 -175 L -84 -159 L -72 -172 Z', c.soldierCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -52 -169 L -40 -153 L -28 -167 Z', c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -12 -165 L 0 -150 L 12 -165 Z', c.royalBlueTunic, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 28 -167 L 40 -153 L 52 -169 Z', c.antiqueGold, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 72 -172 L 84 -159 L 96 -175 Z', c.soldierCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),

    // Hanging heraldic vertical banners on the left & right flanking towers
    svgEl('path', {
      d: 'M -149 -108 L -123 -108 M 123 -108 L 149 -108',
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 2.4,
      'stroke-linecap': 'round',
    }),
    celPath(
      'M -146 -108 L -126 -108 L -126 -68 L -136 -75 L -146 -68 Z',
      c.royalBlueTunic,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M -136 -104 L -136 -79 M -142 -92 L -130 -92', {
      stroke: c.antiqueGold,
      strokeWidth: 1.5,
      opacity: 0.9,
    }),
    celPath(
      'M 126 -108 L 146 -108 L 146 -68 L 136 -75 L 126 -68 Z',
      c.royalBlueTunic,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M 136 -104 L 136 -79 M 130 -92 L 142 -92', {
      stroke: c.antiqueGold,
      strokeWidth: 1.5,
      opacity: 0.9,
    }),
  ]);

  // 6. Loose Robin-Hood hand-drawn pencil grass tufts rooting the stone foundation at y = 0
  const baseGrass = pencilGrassStrokes(
    [
      { x: -162, y: 0, width: 22, height: 8, blades: 5, lean: -0.35 },
      { x: -74, y: 0, width: 20, height: 7.5, blades: 4, lean: -0.25 },
      { x: 76, y: 0, width: 20, height: 7.5, blades: 4, lean: 0.3 },
      { x: 160, y: 0, width: 22, height: 8, blades: 5, lean: 0.38 },
    ],
    {
      stroke: c.pencilOliveCharcoal,
      strokeWidth: 1.1,
      opacity: 0.82,
      seed: 151,
    }
  );

  return svgEl(
    'g',
    {
      'data-building': 'royal_castle',
      'data-art-style': 'classic_cel',
    },
    [
      clipDefs,
      groundShadow,
      towers,
      keep,
      gate,
      flags,
      banners,
      baseGrass,
    ]
  );
}

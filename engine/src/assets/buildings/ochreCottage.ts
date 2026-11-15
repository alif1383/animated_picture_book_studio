import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';

/**
 * Renders the Cute & Cozy Ochre Cottage architectural cutout (`'ochre_cottage'`)
 * with scalloped terracotta shingle roof, brick chimney with heart accent,
 * round blue attic window, arched wooden door with heart window & leafy welcome wreath,
 * bedroom window with teal shutters, pink curtains & overflowing flower boxes,
 * climbing garden vines, and optional right-side climbing ladder.
 */
export function renderOchreCottage(options: BuildingRenderOptions): string {
  const {
    windowLit = true,
    showLadder = true,
    fillMask,
  } = options;

  const {
    terracottaDark,
    warmMoon,
    bananaYellow,
    paperWarm,
    paperDeep,
    ochreLight,
    nightcapWhite,
    nightcapBlue,
    indigoNightDark,
    cherryRose,
    watermelonPink,
    skyPastelBlue,
    emeraldFrond,
    grassGreen,
  } = TOKENS.colors;

  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // 1. Cozy Brick Chimney with Heart Accent (top-left behind roof)
  const chimney = svgEl('g', { 'data-part': 'chimney' }, [
    crayonPath(
      'M -108 -190 L -108 -250 L -72 -250 L -72 -185 Z',
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    crayonPath(
      'M -115 -250 L -65 -250 L -65 -259 L -115 -259 Z',
      terracottaDark,
      { strokeWidth: outlineMedium }
    ),
    // Chimney pot crown
    crayonPath(
      'M -98 -259 L -82 -259 L -84 -268 L -96 -268 Z',
      ochreLight,
      { strokeWidth: outlineThin }
    ),
    svgEl('path', {
      d: 'M -106 -234 L -74 -234 M -106 -218 L -74 -218 M -90 -250 L -90 -234 M -85 -234 L -85 -218',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  // 2. Main Ochre Wall, Gabled Left Wing, Decorative Corner Stones & Climbing Vines
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main right/center wall body
    crayonPath(
      'M -55 -132 L 152 -132 L 154 0 L -55 0 Z',
      getPatternFill('crayonOchre'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Protruding gabled left wing
    crayonPath(
      'M -168 -118 L -106 -188 L -45 -118 L -45 0 L -168 0 Z',
      getPatternFill('crayonOchre'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Cozy stone baseboard & corner quoins
    crayonPath(
      'M -168 0 L 154 0 L 154 -10 L -168 -10 Z',
      paperDeep,
      { strokeWidth: outlineThin }
    ),
    crayonPath('M -168 -96 L -154 -96 L -154 -84 L -168 -84 Z', ochreLight, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M -168 -64 L -156 -64 L -156 -52 L -168 -52 Z', ochreLight, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M 140 -98 L 152 -98 L 152 -86 L 140 -86 Z', ochreLight, {
      strokeWidth: outlineThin,
    }),
    // Climbing leafy green garden vines & tiny flowers (`data-part="cottage-vines"`)
    svgEl('g', { 'data-part': 'cottage-vines' }, [
      svgEl('path', {
        d: 'M -45 -10 Q -52 -42, -43 -72 Q -50 -98, -44 -118',
        fill: 'none',
        stroke: emeraldFrond,
        'stroke-width': 2.4,
        'stroke-linecap': 'round',
      }),
      svgEl('ellipse', { cx: -50, cy: -32, rx: 5, ry: 2.8, fill: grassGreen }),
      svgEl('ellipse', { cx: -40, cy: -52, rx: 5, ry: 2.8, fill: emeraldFrond }),
      svgEl('ellipse', { cx: -50, cy: -78, rx: 5, ry: 2.8, fill: grassGreen }),
      svgEl('circle', { cx: -43, cy: -64, r: 3.2, fill: cherryRose }),
      svgEl('circle', { cx: -48, cy: -92, r: 3.0, fill: bananaYellow }),
    ]),
  ]);

  // 3. Terracotta Roof with Scalloped Tile Edge, Cream Bargeboard Trim & Shingle Courses
  const roof = svgEl('g', { 'data-part': 'roof' }, [
    crayonPath(
      'M -108 -208 L 136 -208 L 168 -126 Q 150 -116, 132 -126 Q 114 -116, 96 -126 Q 78 -116, 60 -126 Q 42 -116, 24 -126 Q 6 -116, -12 -126 Q -30 -116, -45 -126 L -106 -188 Z',
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Left gable roof overhang trim with cute scalloped cream bargeboard
    crayonPath(
      'M -176 -114 L -106 -194 L -38 -114 L -46 -108 L -106 -178 L -168 -108 Z',
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    svgEl('path', {
      d: 'M -166 -110 L -106 -180 L -46 -110',
      fill: 'none',
      stroke: paperWarm,
      'stroke-width': 2.5,
      'stroke-dasharray': '5 4',
      'stroke-linecap': 'round',
    }),
    // Hand-drawn wavy roof shingle courses
    svgEl('path', {
      d: [
        'M -75 -182 Q -55 -173, -35 -182 T 5 -182 T 45 -182 T 85 -182 T 128 -182',
        'M -58 -160 Q -38 -151, -18 -160 T 22 -160 T 62 -160 T 102 -160 T 145 -160',
        'M -42 -140 Q -22 -131, -2 -140 T 38 -140 T 78 -140 T 118 -140 T 156 -140',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.75 }),
    }),
  ]);

  // 4. Left Wing Round Attic Window, Arched Wooden Door with Heart Cutout & Welcome Wreath
  const leftWingDetails = svgEl('g', { 'data-part': 'left-wing-details' }, [
    // Round blue attic window with warm glow & flower sill
    svgEl('circle', {
      cx: -106,
      cy: -142,
      r: 17,
      fill: windowLit
        ? getPatternFill('crayonWindowGlow')
        : getPatternFill('crayonNightcapBlue'),
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    svgEl('path', {
      d: 'M -123 -142 L -89 -142 M -106 -159 L -106 -125',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Arched wooden front door
    crayonPath(
      'M -132 0 L -132 -68 Q -106 -90, -80 -68 L -80 0 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    svgEl('path', {
      d: 'M -114 -78 L -114 0 M -97 -78 L -97 0',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.72 }),
    }),
    // Cute heart-shaped cottage door window + leafy welcome wreath with pink bow
    crayonPath(
      'M -106 -58 C -109 -63, -116 -62, -115 -56 L -106 -47 L -97 -56 C -96 -62, -103 -63, -106 -58 Z',
      windowLit ? warmMoon : nightcapBlue,
      { strokeWidth: outlineThin }
    ),
    svgEl('circle', {
      cx: -106,
      cy: -55,
      r: 12,
      fill: 'none',
      stroke: emeraldFrond,
      'stroke-width': 3.4,
      'stroke-dasharray': '5 2',
    }),
    svgEl('circle', { cx: -106, cy: -67, r: 2.8, fill: cherryRose }),
    // Brass doorknob
    svgEl('circle', {
      cx: -87,
      cy: -36,
      r: 3.4,
      fill: warmMoon,
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Two-tier cobblestone doorstep
    crayonPath('M -142 0 L -70 0 L -74 -6 L -138 -6 Z', paperDeep, {
      strokeWidth: outlineThin,
    }),
    crayonPath('M -136 -6 L -76 -6 L -79 -11 L -133 -11 Z', ochreLight, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 5. Large Bedroom Window with Teal Shutters, Pink Curtains & Overflowing Flower Box
  const bedroomWindow = svgEl('g', { 'data-part': 'bedroom-window' }, [
    // Cozy pastel teal cottage shutters on left & right of window
    crayonPath(
      'M -30 -104 L -13 -104 L -13 -28 L -30 -28 Z',
      getPatternFill('crayonStoreTeal'),
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    crayonPath(
      'M 107 -104 L 124 -104 L 124 -28 L 107 -28 Z',
      getPatternFill('crayonStoreTeal'),
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    // Interior glow backdrop
    crayonPath(
      'M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z',
      windowLit ? getPatternFill('crayonWindowGlow') : indigoNightDark,
      { stroke: 'none' }
    ),
    // Blue-and-white striped windowsill/bedding band at bottom of window
    crayonPath(
      'M -10 -46 Q 47 -50, 104 -46 L 104 -26 L -10 -26 Z',
      nightcapWhite,
      { strokeWidth: outlineThin }
    ),
    svgEl('path', {
      d: 'M -8 -30 L 102 -45 M -6 -45 L 48 -28',
      fill: 'none',
      stroke: nightcapBlue,
      'stroke-width': 4,
      'stroke-linecap': 'round',
      opacity: 0.85,
    }),
    crayonPath(
      'M -10 -46 Q 47 -50, 104 -46 L 104 -26 L -10 -26 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineThin }
    ),
    // Left & right pink curtains tied back with bows
    crayonPath(
      'M -12 -106 L 26 -106 Q 18 -74, 6 -46 L -12 -46 Z',
      getPatternFill('crayonDressPink'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M 106 -106 L 68 -106 Q 76 -74, 88 -46 L 106 -46 Z',
      getPatternFill('crayonDressPink'),
      { strokeWidth: outlineThin }
    ),
    // Window muntin crossbars
    svgEl('path', {
      d: 'M 47 -106 L 47 -26 M -12 -68 L 106 -68',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.65 }),
    }),
    // Outer charcoal window frame & sill
    crayonPath('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', 'none', {
      strokeWidth: outlineHeavy,
    }),
    // Wooden Window Flower Box overflowing with colorful crayon blossoms (`data-part="flower-boxes"`)
    svgEl('g', { 'data-part': 'flower-boxes' }, [
      crayonPath(
        'M -18 -26 L 112 -26 L 107 -13 L -13 -13 Z',
        getPatternFill('crayonWoodBrown'),
        { strokeWidth: outlineMedium, paperUnderlay: true }
      ),
      // Leafy green foliage tufts along flower box
      crayonPath(
        'M -14 -26 Q -2 -36, 10 -26 Q 24 -37, 38 -26 Q 52 -37, 66 -26 Q 80 -37, 94 -26 Q 104 -35, 110 -26 Z',
        emeraldFrond,
        { strokeWidth: outlineThin }
      ),
      // Colorful flower blossoms
      svgEl('circle', {
        cx: -2,
        cy: -28,
        r: 4.5,
        fill: cherryRose,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 18,
        cy: -30,
        r: 4.8,
        fill: bananaYellow,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 38,
        cy: -28,
        r: 4.5,
        fill: skyPastelBlue,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 58,
        cy: -30,
        r: 4.8,
        fill: watermelonPink,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 78,
        cy: -28,
        r: 4.5,
        fill: bananaYellow,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 96,
        cy: -29,
        r: 4.5,
        fill: cherryRose,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]),
  ]);

  // 6. Right-Side Wooden Climbing Ladder (Ref Images 2 & 4!)
  const ladder = showLadder
    ? svgEl('g', { 'data-part': 'ladder' }, [
        // Two vertical rails mounted on the ochre wall right of the bedroom window
        svgEl('path', {
          d: 'M 126 0 L 126 -134 M 146 0 L 146 -134',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }),
        // 6 horizontal rungs
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
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-building': 'ochre_cottage',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [chimney, walls, leftWingDetails, bedroomWindow, ladder, roof]
  );
}

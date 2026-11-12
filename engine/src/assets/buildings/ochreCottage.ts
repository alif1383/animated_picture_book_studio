import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
} from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';

/**
 * Renders the Ochre Cottage architectural cutout (`'ochre_cottage'`)
 * with terracotta roof, round blue attic window, bedroom window with pink curtains,
 * and optional right-side climbing ladder.
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
    paperDeep,
    nightcapWhite,
    nightcapBlue,
    indigoNightDark,
  } = TOKENS.colors;

  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // 1. Brick Chimney (top-left behind roof, as in Ref Images 2 & 3)
  const chimney = svgEl('g', { 'data-part': 'chimney' }, [
    crayonPath(
      'M -108 -190 L -108 -248 L -74 -248 L -74 -185 Z',
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    crayonPath(
      'M -114 -248 L -68 -248 L -68 -256 L -114 -256 Z',
      terracottaDark,
      { strokeWidth: outlineMedium }
    ),
    svgEl('path', {
      d: 'M -106 -232 L -76 -232 M -106 -216 L -76 -216 M -91 -248 L -91 -232 M -86 -232 L -86 -216',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  // 2. Main Ochre Wall & Gabled Left Wing (Ref Images 2, 3, 4)
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
    // Protruding gabled left wing (Ref Image 3)
    crayonPath(
      'M -168 -118 L -106 -188 L -45 -118 L -45 0 L -168 0 Z',
      getPatternFill('crayonOchre'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
  ]);

  // 3. Terracotta Roof with Scalloped Tile Edge & Shingle Courses (Ref Images 2, 3, 4)
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
    // Left gable roof overhang trim
    crayonPath(
      'M -176 -114 L -106 -194 L -38 -114 L -46 -108 L -106 -178 L -168 -108 Z',
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
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

  // 4. Left Wing Round Attic Window & Wooden Front Door (Ref Image 3)
  const leftWingDetails = svgEl('g', { 'data-part': 'left-wing-details' }, [
    // Round blue attic window
    svgEl('circle', {
      cx: -106,
      cy: -140,
      r: 17,
      fill: getPatternFill('crayonNightcapBlue'),
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    svgEl('path', {
      d: 'M -123 -140 L -89 -140 M -106 -157 L -106 -123',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Arched wooden front door
    crayonPath(
      'M -132 0 L -132 -68 Q -106 -88, -80 -68 L -80 0 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineMedium }
    ),
    svgEl('path', {
      d: 'M -114 -78 L -114 0 M -97 -78 L -97 0',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.72 }),
    }),
    svgEl('circle', {
      cx: -87,
      cy: -36,
      r: 3.4,
      fill: warmMoon,
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    crayonPath('M -138 0 L -74 0 L -77 -6 L -135 -6 Z', paperDeep, {
      strokeWidth: outlineThin,
    }),
  ]);

  // 5. Large Bedroom Window with Pink Curtains & Blue-and-White Striped Sill/Bedding (Ref Images 2 & 4!)
  const bedroomWindow = svgEl('g', { 'data-part': 'bedroom-window' }, [
    // Interior glow backdrop
    crayonPath(
      'M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z',
      windowLit ? getPatternFill('crayonWindowGlow') : indigoNightDark,
      { stroke: 'none' }
    ),
    // Blue-and-white striped windowsill/bedding band at bottom of window (Ref Image 4)
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
    svgEl('path', {
      d: 'M -10 -28 L 104 -44 M -10 -44 L 58 -26',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
    // Left & right pink curtains (Ref Images 2 & 4)
    crayonPath(
      'M -12 -106 L 24 -106 Q 16 -74, 4 -46 L -12 -46 Z',
      getPatternFill('crayonDressPink'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M 106 -106 L 70 -106 Q 78 -74, 90 -46 L 106 -46 Z',
      getPatternFill('crayonDressPink'),
      { strokeWidth: outlineThin }
    ),
    // Outer charcoal window frame & sill
    crayonPath('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', 'none', {
      strokeWidth: outlineHeavy,
    }),
    svgEl('path', {
      d: 'M -18 -25 L 112 -25',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
  ]);

  // 6. Right-Side Wooden Climbing Ladder (Ref Images 2 & 4!)
  const ladder = showLadder
    ? svgEl('g', { 'data-part': 'ladder' }, [
        // Two vertical rails mounted on the ochre wall right of the bedroom window
        svgEl('path', {
          d: 'M 118 0 L 118 -134 M 140 0 L 140 -134',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }),
        // 6 horizontal rungs
        svgEl('path', {
          d: [
            'M 118 -18 L 140 -18',
            'M 118 -38 L 140 -38',
            'M 118 -58 L 140 -58',
            'M 118 -78 L 140 -78',
            'M 118 -98 L 140 -98',
            'M 118 -118 L 140 -118',
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

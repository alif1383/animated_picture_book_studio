import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';

/**
 * Renders the Little Corner Store / Bakery architectural cutout (`'corner_store'`, "LUNE STORE")
 * with pastel teal wall, red-and-cream striped scalloped awning, display window, and hanging moon sign.
 */
export function renderCornerStore(options: BuildingRenderOptions): string {
  const {
    windowLit = true,
    signText = 'LUNE STORE',
    fillMask,
  } = options;

  const {
    charcoalOutline,
    paperWarm,
    warmMoon,
    indigoNight,
    indigoNightDark,
    indigoNightLight,
  } = TOKENS.colors;

  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // 1. Main Pastel Teal Storefront Wall & Wooden Roof Cornice
  const wallAndCornice = svgEl('g', { 'data-part': 'store-wall' }, [
    crayonPath(
      'M -128 -186 L 128 -186 L 130 0 L -130 0 Z',
      getPatternFill('crayonStoreTeal'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    crayonPath(
      'M -138 -202 L 138 -202 L 132 -186 L -132 -186 Z',
      getPatternFill('crayonWoodBrown'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Signboard banner above awning
    crayonPath('M -94 -178 L 94 -178 L 94 -148 L -94 -148 Z', paperWarm, {
      strokeWidth: outlineMedium,
    }),
    svgEl(
      'text',
      {
        x: 0,
        y: -157,
        'font-family': TOKENS.typography.fontFamilyHand,
        'font-size': 16,
        'font-weight': 'bold',
        'text-anchor': 'middle',
        fill: charcoalOutline,
      },
      signText
    ),
  ]);

  // 2. Red-and-Cream Striped Scalloped Crayon Awning
  const stripes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const tx0 = round2(-128 + i * 32);
    const tx1 = round2(tx0 + 32);
    const bx0 = round2(-136 + i * 34);
    const bx1 = round2(bx0 + 34);
    const bMid = round2((bx0 + bx1) / 2);
    const fill =
      i % 2 === 0 ? getPatternFill('crayonAwningRed') : paperWarm;
    stripes.push(
      crayonPath(
        `M ${tx0} -142 L ${tx1} -142 L ${bx1} -108 Q ${bMid} -96, ${bx0} -108 Z`,
        fill,
        {
          strokeWidth: outlineMedium,
          mask: fillMask,
          paperUnderlay: true,
        }
      )
    );
  }
  const awning = svgEl('g', { 'data-part': 'store-awning' }, stripes);

  // 3. Warm Lit Bakery & General Store Display Window (Left/Center)
  const displayWindow = svgEl('g', { 'data-part': 'display-window' }, [
    crayonPath(
      'M -110 -94 L 26 -94 L 26 -26 L -110 -26 Z',
      windowLit ? getPatternFill('crayonWindowGlow') : indigoNightDark,
      { strokeWidth: outlineHeavy }
    ),
    // Display shelf & loaves/jars inside window
    svgEl('path', {
      d: 'M -108 -48 L 24 -48',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    crayonPath(
      'M -96 -48 Q -82 -68, -68 -48 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M -64 -48 Q -50 -66, -36 -48 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M -24 -48 L -24 -68 L -8 -68 L -8 -48 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineThin }
    ),
    crayonPath(
      'M -2 -48 L -2 -64 L 12 -64 L 12 -48 Z',
      getPatternFill('crayonNightcapBlue'),
      { strokeWidth: outlineThin }
    ),
    // Window sill
    crayonPath(
      'M -114 -26 L 30 -26 L 30 -18 L -114 -18 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineMedium }
    ),
  ]);

  // 4. Wooden Shop Door (Right Side)
  const door = svgEl('g', { 'data-part': 'store-door' }, [
    crayonPath(
      'M 44 0 L 44 -96 L 110 -96 L 110 0 Z',
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy }
    ),
    crayonPath(
      'M 54 -86 L 100 -86 L 100 -50 L 54 -50 Z',
      windowLit ? getPatternFill('crayonWindowGlow') : indigoNightLight,
      { strokeWidth: outlineMedium }
    ),
    crayonPath('M 64 -66 L 90 -66 L 90 -56 L 64 -56 Z', paperWarm, {
      strokeWidth: outlineThin,
    }),
    svgEl('circle', {
      cx: 52,
      cy: -38,
      r: 3.4,
      fill: warmMoon,
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  // 5. Hanging Wrought-Iron Bracket & Crescent-Moon Signboard
  const hangingSign = svgEl('g', { 'data-part': 'hanging-sign' }, [
    svgEl('path', {
      d: 'M 128 -162 L 164 -162 M 128 -150 L 144 -162 M 140 -162 L 140 -152 M 158 -162 L 158 -152',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
    }),
    crayonPath('M 134 -152 L 164 -152 L 164 -124 L 134 -124 Z', indigoNight, {
      strokeWidth: outlineMedium,
    }),
    crayonPath(
      'M 153 -146 C 143 -146, 143 -130, 153 -130 C 148 -133, 148 -143, 153 -146 Z',
      warmMoon,
      { strokeWidth: outlineThin }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-building': 'corner_store',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [wallAndCornice, displayWindow, door, awning, hangingSign]
  );
}

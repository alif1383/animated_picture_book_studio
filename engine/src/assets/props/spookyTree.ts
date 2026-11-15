import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders the Dangerous Forest Gnarled Spooky Tree (`'spooky_tree'`).
 * - Twisted dark-woodland trunk & gnarled roots (`crayonWoodBrown`),
 *   heavy dark-green crayon foliage (`crayonTreeGreen` / `crayonEmeraldFrond`),
 *   and peeking golden firefly eyes inside the trunk hollow (`data-part="spooky-hollow-eyes"`).
 */
export function renderSpookyTree(
  options: PropRenderOptions = { kind: 'spooky_tree' }
): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;

  const {
    indigoNightDark,
    bananaYellow,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const sway = steppedOscillate(frameIndex, 14, 2.2, variant * 2);
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, variant * 3);

  // 1. Gnarled Roots & Twisted Trunk with Reaching Branches
  const trunk = crayonPath(
    [
      'M -34 4',
      'C -20 -10, -16 -38, -18 -72',
      'C -36 -92, -56 -110, -68 -126',
      'L -52 -130',
      'C -38 -114, -22 -100, -12 -88',
      'L -6 -136 L 8 -136 L 12 -92',
      'C 26 -106, 44 -118, 62 -128',
      'L 70 -118',
      'C 50 -106, 30 -92, 16 -74',
      'C 18 -38, 22 -10, 36 4',
      'L 16 4 C 10 -4, 4 -8, 0 -2 C -4 -8, -10 -4, -16 4 Z',
    ].join(' '),
    getPatternFill('crayonWoodBrown'),
    { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
  );

  // Bark texture lines
  const barkLines = svgEl('path', {
    d: 'M -8 -20 C -6 -45, -10 -65, -6 -85 M 8 -18 C 10 -42, 6 -62, 10 -80',
    fill: 'none',
    ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.65 }),
  });

  // 2. Dark Hollow with Peeking Golden Firefly Eyes (`data-part="spooky-hollow-eyes"`)
  const hollowEyes = svgEl('g', { 'data-part': 'spooky-hollow-eyes' }, [
    crayonPath(
      'M -10 -52 C -10 -66, 10 -66, 10 -52 C 10 -38, -10 -38, -10 -52 Z',
      indigoNightDark,
      { strokeWidth: outlineMedium }
    ),
    blink
      ? ''
      : svgEl('g', {}, [
          svgEl('circle', { cx: -4, cy: -52, r: 2.4, fill: bananaYellow }),
          svgEl('circle', { cx: 4, cy: -52, r: 2.4, fill: bananaYellow }),
        ]),
  ]);

  // 3. Heavy Twisted Woodland Foliage Canopy
  const canopy = svgEl(
    'g',
    {
      'data-part': 'spooky-canopy',
      transform: svgTransform({ rotate: sway }),
    },
    [
      crayonPath(
        'M -74 -116 C -92 -142, -68 -178, -32 -174 C -18 -198, 22 -198, 36 -174 C 72 -178, 92 -140, 72 -114 C 52 -100, -52 -100, -74 -116 Z',
        getPatternFill('crayonTreeGreen'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      crayonPath(
        'M -48 -132 C -58 -152, -32 -174, 0 -168 C 32 -174, 58 -150, 46 -130 C 26 -118, -26 -118, -48 -132 Z',
        getPatternFill('crayonEmeraldFrond'),
        { strokeWidth: outlineMedium }
      ),
      svgEl('path', {
        d: 'M -46 -128 Q -24 -142, -6 -128 M 10 -134 Q 32 -148, 48 -132',
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': outlineThin,
        opacity: 0.55,
      }),
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'spooky_tree',
      'data-variant': String(variant),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [trunk, barkLines, hollowEyes, canopy]
  );
}

import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';

/**
 * Renders the Castle Herald & Medieval Villager (`'villager'`).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - Warm terracotta/sage medieval tunic (`crayonTerracotta` / `crayonGrassGreen`),
 *   feathered herald cap (`data-part="villager-cap"`), and rolled parchment scroll (`data-part="villager-scroll"`).
 * - Dedicated 3/4 right-facing (`+X`) walking rig (`data-walk-profile="true"`) for `state === 'walking'`.
 */
export function renderVillager(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;

  const {
    skinPeach,
    curtainPink,
    hairBrown,
    woodBrown,
    paperWarm,
    warmMoon,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'singing';
  const isWorried = state === 'grumpy' || state === 'looking_up';

  const walkSwing = isWalking ? steppedOscillate(frameIndex, 6, 18) : 0;
  const bodyBob = isWalking
    ? Math.abs(steppedOscillate(frameIndex, 6, 2.5))
    : steppedOscillate(frameIndex, 12, 1.2);
  const armWave = isWaving
    ? steppedOscillate(frameIndex, 6, 22) - 35
    : isWorried
    ? -25
    : 12;
  const blink =
    state === 'sleeping' ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 20, 1, 3);

  // Legs facing RIGHT (+X) with both boots pointing toward +X
  const legs = svgEl('g', { 'data-part': 'villager-legs' }, [
    svgEl(
      'g',
      { transform: svgTransform({ x: -3, y: -24, rotate: -walkSwing }) },
      [
        crayonPath('M -4 0 L -4 18 L 3 18 L 3 0 Z', paperWarm, {
          strokeWidth: outlineMedium,
        }),
        crayonPath(
          'M -5 18 L 7 18 C 11 18, 12 24, 6 24 L -5 24 Z',
          woodBrown,
          { strokeWidth: outlineMedium }
        ),
      ]
    ),
    svgEl(
      'g',
      { transform: svgTransform({ x: 3, y: -24, rotate: walkSwing }) },
      [
        crayonPath('M -4 0 L -4 18 L 3 18 L 3 0 Z', paperWarm, {
          strokeWidth: outlineMedium,
        }),
        crayonPath(
          'M -5 18 L 7 18 C 11 18, 12 24, 6 24 L -5 24 Z',
          woodBrown,
          { strokeWidth: outlineMedium }
        ),
      ]
    ),
  ]);

  // Back arm
  const backArm = svgEl(
    'g',
    {
      'data-part': 'back-arm',
      transform: svgTransform({
        x: -2,
        y: -52,
        rotate: isWalking ? walkSwing * 0.7 : -14,
      }),
    },
    [
      crayonPath(
        'M -3 0 L -8 18 L -1 20 L 4 2 Z',
        getPatternFill('crayonGrassGreen'),
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -5, cy: 20, r: 3.5, fill: skinPeach }),
    ]
  );

  // Medieval Tunic & Belt
  const torso = svgEl('g', { 'data-part': 'villager-tunic' }, [
    crayonPath(
      'M -12 -58 L 12 -58 L 16 -22 L -15 -22 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Belt & golden buckle
    crayonPath('M -14 -36 L 14 -36 L 14 -31 L -14 -31 Z', woodBrown, {
      strokeWidth: outlineThin,
    }),
    svgEl('rect', {
      x: 2,
      y: -37,
      width: 6,
      height: 7,
      fill: warmMoon,
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);

  // Front arm holding herald scroll (`data-part="villager-scroll"`)
  const frontArm = svgEl(
    'g',
    {
      'data-part': 'front-arm',
      transform: svgTransform({
        x: 4,
        y: -52,
        rotate: isWalking ? -walkSwing * 0.8 : armWave,
      }),
    },
    [
      crayonPath(
        'M -3 0 L 8 16 L 14 12 L 3 -2 Z',
        getPatternFill('crayonGrassGreen'),
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: 12, cy: 14, r: 3.5, fill: skinPeach }),
      // Rolled herald scroll
      svgEl('g', { 'data-part': 'villager-scroll' }, [
        crayonPath(
          'M 10 6 L 22 0 L 25 6 L 13 12 Z',
          paperWarm,
          { strokeWidth: outlineThin }
        ),
      ]),
    ]
  );

  // Head & Soft Medieval Cap Facing RIGHT (+X) (`data-part="villager-cap"`)
  const head = svgEl('g', { 'data-part': 'villager-head' }, [
    svgEl('circle', {
      cx: 0,
      cy: -72,
      r: 13,
      fill: skinPeach,
      ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
    }),
    // Warm brown hair at back-left
    crayonPath(
      'M -12 -76 C -15 -68, -12 -60, -6 -62 C -8 -68, -8 -74, -4 -78 Z',
      hairBrown,
      { strokeWidth: outlineThin }
    ),
    // Rosy cheek & eye shifted right (+X)
    svgEl('circle', { cx: 4, cy: -69, r: 3.5, fill: curtainPink, opacity: 0.75 }),
    blink
      ? svgEl('path', {
          d: 'M 3 -74 Q 6 -71, 9 -74',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        })
      : svgEl('circle', { cx: 6, cy: -74, r: 2.1, fill: charcoalOutline }),
    // Mouth (open O when worried/calling out, happy smile otherwise)
    isWorried
      ? svgEl('ellipse', {
          cx: 7,
          cy: -65,
          rx: 3.2,
          ry: 2.5,
          fill: charcoalOutline,
        })
      : svgEl('path', {
          d: 'M 2 -66 Q 6 -62, 10 -66',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
    // Soft medieval beret cap with golden feather (`data-part="villager-cap"`)
    svgEl('g', { 'data-part': 'villager-cap' }, [
      crayonPath(
        'M -15 -80 C -16 -92, 14 -94, 16 -80 Z',
        getPatternFill('crayonGrassGreen'),
        { strokeWidth: outlineMedium }
      ),
      crayonPath(
        'M -6 -88 C -14 -98, -22 -96, -16 -86 Z',
        warmMoon,
        { strokeWidth: outlineThin }
      ),
    ]),
  ]);

  return svgEl(
    'g',
    {
      'data-character': 'villager',
      'data-state': state,
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
      transform: svgTransform({ y: bodyBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [legs, backArm, torso, frontArm, head]
  );
}

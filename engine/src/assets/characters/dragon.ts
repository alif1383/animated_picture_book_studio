import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderStarShape } from '../props/shared';

/**
 * Renders Barnaby the Cute Storybook Forest Dragon (`'dragon'`).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` and LEFT (`-X`) when `flipX: true`.
 * - Moss-green / emerald crayon body (`crayonMeadowGreen` / `crayonGrassGreen`), warm ochre
 *   ridged belly (`crayonOchre`), scalloped bat-like wings (`crayonTerracotta`), curved horns,
 *   spiky tail, rosy cheeks, and expressive states:
 *   - `'awake'` / `'grumpy'`: Roaring mouth open with crooked tooth (`data-part="dragon-tooth"`)
 *   - `'waving'`: Rearing up and puffing a swirl of crayon fire (`data-part="dragon-breath"`)
 *   - `'walking'`: Stomping forward (`+X` when `flipX: false`)
 *   - `'sitting'` / `'sleepy'`: Tamed/tumbled down with dizzy crayon stars (`data-part="dizzy-stars"`)
 */
export function renderDragon(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;

  const {
    ochreLight,
    warmMoon,
    bananaYellow,
    sunsetOrange,
    radishRed,
    curtainPink,
    nightcapWhite,
    woodBrown,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const isRoaring = state === 'awake' || state === 'grumpy' || state === 'waving';
  const isTamed = state === 'sitting' || state === 'sleepy' || state === 'sleeping';
  const isWalking = state === 'walking';

  const wingFlap = steppedOscillate(frameIndex, 6, isRoaring ? 16 : 7);
  const bodyBob = isTamed
    ? 12
    : round2(steppedOscillate(frameIndex, 8, isWalking ? 4.5 : 2.5));
  const stepSwing = isWalking ? steppedOscillate(frameIndex, 6, 14) : 0;
  const blink =
    state === 'sleeping' ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 24, 1, 3);

  // 1. Spiky Dragon Tail (on left -X side)
  const tail = svgEl('g', { 'data-part': 'dragon-tail' }, [
    crayonPath(
      'M -42 -26 C -76 -22, -98 -44, -92 -66 C -78 -52, -62 -40, -36 -42 Z',
      getPatternFill('crayonMeadowGreen'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    // Spade tip on tail
    crayonPath(
      'M -92 -66 L -104 -74 L -94 -82 L -84 -70 Z',
      getPatternFill('crayonTerracotta'),
      { strokeWidth: outlineMedium }
    ),
  ]);

  // 2. Scalloped Bat-Like Dragon Wings (`data-part="dragon-wings"`)
  const wings = svgEl(
    'g',
    {
      'data-part': 'dragon-wings',
      transform: svgTransform({ x: -16, y: -86, rotate: wingFlap }),
    },
    [
      crayonPath(
        'M 0 0 C -18 -38, -54 -48, -64 -18 C -46 -16, -34 -8, -28 4 C -18 -4, -8 -2, 0 6 Z',
        getPatternFill('crayonTerracotta'),
        { strokeWidth: outlineHeavy, paperUnderlay: true }
      ),
      svgEl('path', {
        d: 'M -4 -4 L -38 -24 M -4 -4 L -26 -8',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]
  );

  // 3. Plump Dragon Body & Ridged Ochre Belly (facing RIGHT +X)
  const body = svgEl('g', { 'data-part': 'dragon-body' }, [
    // Dorsal ridge spikes down the back
    crayonPath(
      'M -34 -86 L -44 -96 L -30 -94 L -36 -74 L -48 -80 L -32 -70 Z',
      warmMoon,
      { strokeWidth: outlineThin }
    ),
    // Main round emerald-green dragon belly & torso
    crayonPath(
      'M -44 -36 C -48 -84, -18 -108, 16 -96 C 42 -86, 46 -44, 34 -18 C 18 -6, -36 -8, -44 -36 Z',
      getPatternFill('crayonMeadowGreen'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Warm ochre striped belly patch on the right (+X) front
    crayonPath(
      'M 0 -84 C 26 -78, 36 -46, 26 -20 C 12 -14, -4 -22, -6 -48 C -8 -68, -4 -78, 0 -84 Z',
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium }
    ),
    svgEl('path', {
      d: 'M -3 -66 L 24 -64 M -5 -50 L 28 -48 M -3 -34 L 24 -34',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.75 }),
    }),
  ]);

  // 4. Dragon Legs & Claws Facing RIGHT (+X)
  const legs = svgEl('g', { 'data-part': 'dragon-legs' }, [
    svgEl(
      'g',
      { transform: svgTransform({ x: -16, y: -20, rotate: -stepSwing }) },
      [
        crayonPath(
          'M -10 0 L -12 18 L 12 18 L 8 0 Z',
          getPatternFill('crayonGrassGreen'),
          { strokeWidth: outlineHeavy }
        ),
        crayonPath('M 8 18 L 16 18 L 12 12 Z', nightcapWhite, {
          strokeWidth: outlineThin,
        }),
      ]
    ),
    svgEl(
      'g',
      { transform: svgTransform({ x: 16, y: -20, rotate: stepSwing }) },
      [
        crayonPath(
          'M -10 0 L -10 18 L 14 18 L 10 0 Z',
          getPatternFill('crayonMeadowGreen'),
          { strokeWidth: outlineHeavy }
        ),
        crayonPath('M 10 18 L 18 18 L 14 12 Z', nightcapWhite, {
          strokeWidth: outlineThin,
        }),
      ]
    ),
  ]);

  // 5. Expressive Dragon Head Facing RIGHT (+X)
  const head = svgEl('g', { 'data-part': 'dragon-head' }, [
    // Curved golden horns
    crayonPath(
      'M -12 -118 C -24 -134, -18 -144, -6 -134 L 0 -118 Z',
      ochreLight,
      { strokeWidth: outlineMedium }
    ),
    crayonPath(
      'M 2 -120 C -6 -136, 2 -144, 10 -134 L 12 -118 Z',
      ochreLight,
      { strokeWidth: outlineMedium }
    ),
    // Dragon snout & head facing RIGHT (+X)
    crayonPath(
      'M -20 -106 C -20 -128, 16 -130, 32 -118 C 52 -116, 62 -104, 56 -90 C 48 -82, 18 -82, -16 -88 Z',
      getPatternFill('crayonMeadowGreen'),
      { strokeWidth: outlineHeavy, paperUnderlay: true }
    ),
    // Nostril puff rings on snout tip
    svgEl('circle', { cx: 48, cy: -104, r: 2.5, fill: charcoalOutline }),
    // Rosy cheek
    svgEl('circle', { cx: 14, cy: -98, r: 5.5, fill: curtainPink, opacity: 0.78 }),
    // Eye
    blink || isTamed
      ? svgEl('path', {
          d: 'M 8 -112 Q 14 -106, 20 -112',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        })
      : svgEl('g', {}, [
          svgEl('circle', {
            cx: 14,
            cy: -112,
            r: 6.5,
            fill: nightcapWhite,
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          }),
          svgEl('circle', { cx: 16, cy: -112, r: 3.2, fill: charcoalOutline }),
        ]),
    // Mouth: Roaring open with crooked tooth vs. happy relieved smile when tamed
    isRoaring
      ? svgEl('g', { 'data-part': 'dragon-tooth' }, [
          crayonPath(
            'M 22 -94 L 54 -94 L 48 -82 L 22 -84 Z',
            radishRed,
            { strokeWidth: outlineMedium }
          ),
          // Cute crooked white tooth with thorny bramble stuck on it
          crayonPath('M 34 -94 L 38 -84 L 42 -94 Z', nightcapWhite, {
            strokeWidth: outlineThin,
          }),
          svgEl('path', {
            d: 'M 36 -88 L 44 -85 M 38 -91 L 43 -83',
            stroke: woodBrown,
            'stroke-width': 1.8,
          }),
        ])
      : svgEl('path', {
          d: 'M 22 -92 Q 36 -84, 48 -92',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
        }),
  ]);

  // 6. Elevated Crayon Fire Puff when waving/roaring (`data-part="dragon-breath"`)
  // Angled upward-forward (ly: -92 .. -126) so the sore tooth (lx=38..40, ly=-84..-87) has clear space below
  const fireBreath =
    state === 'waving'
      ? svgEl('g', { 'data-part': 'dragon-breath' }, [
          crayonPath(
            'M 54 -96 C 68 -116, 94 -128, 108 -116 C 102 -100, 78 -94, 54 -92 Z',
            sunsetOrange,
            { strokeWidth: outlineMedium }
          ),
          crayonPath(
            'M 60 -96 C 72 -110, 90 -118, 98 -112 C 92 -102, 76 -96, 60 -93 Z',
            bananaYellow,
            { strokeWidth: outlineThin }
          ),
        ])
      : '';

  // 7. Dizzy Crayon Stars Circling Head When Tamed (`data-part="dizzy-stars"`)
  const dizzyStars = isTamed
    ? svgEl('g', { 'data-part': 'dizzy-stars' }, [
        svgEl('ellipse', {
          cx: 12,
          cy: -136,
          rx: 26,
          ry: 7,
          fill: 'none',
          stroke: warmMoon,
          'stroke-width': 1.8,
          'stroke-dasharray': '4 4',
        }),
        crayonPath(renderStarShape(-12, -136, 7, frameIndex * 15), bananaYellow, {
          strokeWidth: outlineThin,
        }),
        crayonPath(renderStarShape(14, -142, 8, -frameIndex * 15), warmMoon, {
          strokeWidth: outlineThin,
        }),
        crayonPath(renderStarShape(36, -135, 6.5, frameIndex * 12), bananaYellow, {
          strokeWidth: outlineThin,
        }),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-character': 'dragon',
      'data-state': state,
      'data-facing': 'right',
      transform: svgTransform({ y: bodyBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [tail, wings, legs, body, head, fireBreath, dizzyStars]
  );
}

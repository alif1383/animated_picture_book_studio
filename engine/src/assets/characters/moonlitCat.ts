import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';

type EyeMode = 'open' | 'blink' | 'curious' | 'sparkle' | 'happy';

interface HeadRenderConfig {
  cx: number;
  cy: number;
  headTilt: number;
  eyeMode: EyeMode;
  speaking?: boolean;
  curiousMouth?: boolean;
  compactWhiskers?: boolean;
  earPerk?: number;
  frameIndex: number;
  fillMask?: string;
}

/**
 * Renders Mochi's signature golden crescent-moon collar charm (`data-part="moon-charm"`).
 */
function renderCrescentMoonCharm(
  cx: number,
  cy: number,
  scale = 1,
  glint = false
): string {
  const { warmMoon, starWhite } = TOKENS.colors;
  const { outlineThin } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'moon-charm',
      transform: svgTransform({ x: cx, y: cy, scale }),
    },
    [
      // Tiny clasp ring linking collar to crescent charm
      svgEl('circle', {
        cx: 0,
        cy: -5.4,
        r: 1.5,
        fill: warmMoon,
        ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
      }),
      // Golden crescent moon charm
      crayonPath(
        'M 2.6 -4.6 C -4.0 -4.8, -5.2 4.8, 2.6 4.8 C -0.9 3.1, -0.9 -3.0, 2.6 -4.6 Z',
        warmMoon,
        { strokeWidth: outlineThin }
      ),
      // Soft star-white catchlight glint on moon edge
      svgEl('circle', {
        cx: -1.6,
        cy: -1.3,
        r: glint ? 1.15 : 0.75,
        fill: starWhite,
        opacity: glint ? 0.96 : 0.75,
      }),
    ]
  );
}

/**
 * Renders Mochi's expressive 3/4 right-facing head (canonical +X forward) with plush
 * slate-blue fur, lavender tabby forehead & cheek stripes, blush pink inner ears,
 * warm paper eyes with charcoal pupils & star-white catchlights, rosy cheeks,
 * whiskers, and either a classic `:3` smile or stepped 6 FPS animated speaking mouth.
 */
function renderMochiHead(cfg: HeadRenderConfig): string {
  const {
    cx,
    cy,
    headTilt,
    eyeMode,
    speaking = false,
    curiousMouth = false,
    compactWhiskers = false,
    earPerk = 0,
    frameIndex,
    fillMask,
  } = cfg;

  const {
    paperWarm,
    starWhite,
    dressPink,
    cherryRose,
    terracottaDark,
    sweaterPurpleDark,
    warmMoon,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const furFill = getPatternFill('crayonNightcapBlue');
  const tabbyFill = getPatternFill('crayonSweaterPurple');

  const earTipY = round2(-24 - earPerk);
  const whiskerJitter = speaking
    ? steppedOscillate(frameIndex, 3, 1.4)
    : deterministicJitter(frameIndex, 17, 0.4);
  const wScale = compactWhiskers ? 0.78 : 1;

  // Eyes shifted slightly +X for natural 3/4 right-facing storybook angle
  let eyesMarkup: string;
  if (eyeMode === 'blink') {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: 'M -8.6 -2.2 Q -4.6 -5.4, -0.6 -2.2 M 5.8 -2.2 Q 9.5 -5.4, 13.2 -2.2',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  } else if (eyeMode === 'happy') {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: 'M -8.6 -1.6 Q -4.6 -6.2, -0.6 -1.6 M 5.8 -1.6 Q 9.5 -6.2, 13.2 -1.6',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  } else {
    const isCurious = eyeMode === 'curious';
    const isSparkle = eyeMode === 'sparkle';
    const rxL = isCurious ? 4.6 : 4.3;
    const ryL = isCurious ? 5.3 : isSparkle ? 5.1 : 4.8;
    const rxR = isCurious ? 4.3 : 4.0;
    const ryR = isCurious ? 5.3 : isSparkle ? 5.1 : 4.8;

    // Pupils shift up-and-right (+X, -Y) when curious/looking_up
    const pupilDx = isCurious ? 1.2 : 0.7;
    const pupilDy = isCurious ? -1.4 : 0.0;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Left (back-side) eye sclera (warm paper)
      svgEl('ellipse', {
        cx: -4.6,
        cy: -2.6,
        rx: rxL,
        ry: ryL,
        fill: paperWarm,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Left charcoal pupil + star-white catchlights
      svgEl('ellipse', {
        cx: round2(-4.6 + pupilDx),
        cy: round2(-2.6 + pupilDy),
        rx: 2.5,
        ry: 3.2,
        fill: charcoalOutline,
      }),
      svgEl('circle', {
        cx: round2(-5.4 + pupilDx),
        cy: round2(-4.0 + pupilDy),
        r: isSparkle ? 1.25 : 1.05,
        fill: starWhite,
      }),
      svgEl('circle', {
        cx: round2(-3.4 + pupilDx),
        cy: round2(-1.2 + pupilDy),
        r: 0.55,
        fill: isSparkle ? warmMoon : starWhite,
      }),
      // Right (front-side) eye sclera (warm paper)
      svgEl('ellipse', {
        cx: 9.4,
        cy: -2.6,
        rx: rxR,
        ry: ryR,
        fill: paperWarm,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Right charcoal pupil + star-white catchlights
      svgEl('ellipse', {
        cx: round2(9.4 + pupilDx),
        cy: round2(-2.6 + pupilDy),
        rx: 2.35,
        ry: 3.2,
        fill: charcoalOutline,
      }),
      svgEl('circle', {
        cx: round2(8.7 + pupilDx),
        cy: round2(-4.0 + pupilDy),
        r: isSparkle ? 1.25 : 1.05,
        fill: starWhite,
      }),
      svgEl('circle', {
        cx: round2(10.5 + pupilDx),
        cy: round2(-1.2 + pupilDy),
        r: 0.55,
        fill: isSparkle ? warmMoon : starWhite,
      }),
      // Perked eyebrow ticks when curious / looking_up
      isCurious
        ? svgEl('path', {
            d: 'M -7.4 -9.2 Q -4.6 -10.8, -1.8 -9.4 M 6.8 -9.4 Q 9.4 -11.0, 12.0 -9.2',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
          })
        : '',
    ]);
  }

  // Mouth: stepped 6 FPS animated speaking mouth (3 phases) or expressive kitty smile
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((frameIndex % 3) + 3) % 3;
    let phaseShape: string;
    if (mouthPhase === 0) {
      // Phase 0: small open rounded 'o' meow mouth
      phaseShape = svgEl('ellipse', {
        cx: 3.8,
        cy: 7.7,
        rx: 2.8,
        ry: 3.1,
        fill: terracottaDark,
        ...crayonStrokeAttrs({ strokeWidth: 1.7 }),
      });
    } else if (mouthPhase === 1) {
      // Phase 1: wide cheerful open D-mouth with blush-pink tongue
      phaseShape = [
        crayonPath(
          'M -1.4 5.7 Q 3.8 6.5, 9.0 5.7 C 9.2 12.2, -1.6 12.2, -1.4 5.7 Z',
          terracottaDark,
          { strokeWidth: outlineThin }
        ),
        crayonPath(
          'M 0.8 9.8 Q 3.8 7.5, 6.8 9.8 C 5.8 11.4, 1.8 11.4, 0.8 9.8 Z',
          dressPink,
          { strokeWidth: 1.2 }
        ),
      ].join('');
    } else {
      // Phase 2: medium smiling half-open mouth
      phaseShape = crayonPath(
        'M -0.6 6.0 Q 3.8 7.6, 8.2 6.0 C 7.6 10.1, 0.0 10.1, -0.6 6.0 Z',
        cherryRose,
        { strokeWidth: 1.7 }
      );
    }

    mouthMarkup = svgEl(
      'g',
      {
        'data-speaking-mouth': 'true',
        'data-mouth-phase': String(mouthPhase),
      },
      [
        svgEl('path', {
          d: 'M 3.8 4.2 L 3.8 5.6',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
        }),
        phaseShape,
      ]
    );
  } else if (curiousMouth) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 3.8 4.2 L 3.8 5.7',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
      }),
      svgEl('ellipse', {
        cx: 3.8,
        cy: 7.4,
        rx: 2.0,
        ry: 2.1,
        fill: dressPink,
        ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
      }),
    ]);
  } else {
    // Classic warm picture-book ':3' kitty smile
    mouthMarkup = svgEl('path', {
      'data-part': 'mouth',
      d: 'M 3.8 4.2 L 3.8 6.3 M -1.0 6.8 Q 1.4 9.6, 3.8 6.4 Q 6.2 9.6, 8.6 6.8',
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: 1.7 }),
    });
  }

  return svgEl(
    'g',
    {
      'data-part': 'head',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: headTilt,
        pivotX: 0,
        pivotY: 14,
      }),
    },
    [
      // Back-left pointed ear + blush pink inner triangle
      crayonPath(`M -17 -7 L -19.5 ${earTipY} L -5 -14 Z`, furFill, {
        strokeWidth: outlineMedium,
        paperUnderlay: true,
      }),
      svgEl('polygon', {
        points: `-15.5,-8.8 -17.5,${round2(earTipY + 3.6)} -7.8,-13.4`,
        fill: dressPink,
      }),
      // Front-right pointed ear + blush pink inner triangle
      crayonPath(`M 5 -14 L 16.5 ${earTipY} L 18 -6 Z`, furFill, {
        strokeWidth: outlineMedium,
        paperUnderlay: true,
      }),
      svgEl('polygon', {
        points: `7.4,-13.2 14.5,${round2(earTipY + 3.8)} 15.6,-8.2`,
        fill: dressPink,
      }),
      // Plush rounded head shape
      crayonPath(
        'M -19 -3 C -21 -14, -10 -17, 1 -16 C 12 -16, 20 -12, 20 -2 C 21 8, 14 15, 2 15 C -11 15, -20 9, -19 -3 Z',
        furFill,
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      // Lavender-plum moon tabby forehead & cheek markings (`data-part="tabby-markings"`)
      svgEl('g', { 'data-part': 'tabby-markings' }, [
        crayonPath(
          'M -6 -15.4 C -1 -16.4, 5 -16.2, 8.5 -14.8 C 6.5 -11.4, 3.5 -9.5, 1.5 -9.4 C -1.5 -9.4, -4.5 -11.5, -6 -15.4 Z',
          tabbyFill,
          { strokeWidth: 1.3 }
        ),
        svgEl('path', {
          d: 'M -3 -15.2 Q -2.2 -12.4, -1.6 -10.4 M 1.4 -15.6 Q 1.6 -12.2, 1.6 -9.8 M 5.4 -15.0 Q 4.8 -12.2, 4.2 -10.4',
          fill: 'none',
          stroke: sweaterPurpleDark,
          'stroke-width': 1.7,
          'stroke-linecap': 'round',
        }),
        // Soft tabby cheek stripes on both sides
        svgEl('path', {
          d: 'M -18.2 -1.5 L -13.6 -0.8 M -18.4 2.2 L -13.8 2.4 M 19.2 -1.2 L 15.0 -0.6 M 19.0 2.4 L 14.8 2.6',
          fill: 'none',
          stroke: sweaterPurpleDark,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
        }),
      ]),
      // Soft creamy muzzle & chin patch (`paperWarm`) for contrast and plushness
      crayonPath(
        'M -4.8 5.2 C -5.8 1.2, 1.2 0.2, 3.8 1.8 C 6.6 0.2, 13.6 1.2, 12.8 5.4 C 12.4 11.4, 7.6 13.8, 3.4 13.8 C -1.8 13.8, -5.6 10.6, -4.8 5.2 Z',
        paperWarm,
        { strokeWidth: 1.4, opacity: 0.96 }
      ),
      // Rosy cheeks
      svgEl('ellipse', {
        cx: -11.4,
        cy: 3.4,
        rx: 3.5,
        ry: 2.2,
        fill: dressPink,
        opacity: 0.72,
      }),
      svgEl('ellipse', {
        cx: 14.6,
        cy: 3.4,
        rx: 3.1,
        ry: 2.1,
        fill: dressPink,
        opacity: 0.72,
      }),
      // Expressive eyes
      eyesMarkup,
      // Cute rounded pink nose
      crayonPath(
        'M 1.7 1.6 Q 3.8 0.8, 5.9 1.6 Q 5.1 3.8, 3.8 4.2 Q 2.5 3.8, 1.7 1.6 Z',
        cherryRose,
        { strokeWidth: 1.3 }
      ),
      // Animated speaking mouth or `:3` smile
      mouthMarkup,
      // Whiskers on both cheeks with subtle stepped wiggle
      svgEl('path', {
        d: [
          `M -15.2 1.2 Q ${round2(-20.5 * wScale)} ${round2(-0.2 + whiskerJitter * 0.4)}, ${round2(-25.8 * wScale)} ${round2(-0.8 + whiskerJitter)}`,
          `M -15.6 4.0 Q ${round2(-21.2 * wScale)} ${round2(4.0 + whiskerJitter * 0.3)}, ${round2(-26.8 * wScale)} ${round2(4.4 + whiskerJitter * 0.6)}`,
          `M -14.6 6.6 Q ${round2(-19.8 * wScale)} ${round2(8.0 - whiskerJitter * 0.3)}, ${round2(-24.8 * wScale)} ${round2(9.2 - whiskerJitter * 0.6)}`,
          `M 16.4 1.2 Q ${round2(22.2 * wScale)} ${round2(-0.2 - whiskerJitter * 0.4)}, ${round2(28.0 * wScale)} ${round2(-0.8 - whiskerJitter)}`,
          `M 16.8 4.0 Q ${round2(22.8 * wScale)} ${round2(4.0 - whiskerJitter * 0.3)}, ${round2(28.8 * wScale)} ${round2(4.4 - whiskerJitter * 0.6)}`,
          `M 15.8 6.6 Q ${round2(21.4 * wScale)} ${round2(8.0 + whiskerJitter * 0.3)}, ${round2(26.8 * wScale)} ${round2(9.2 + whiskerJitter * 0.6)}`,
        ].join(' '),
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
      }),
    ]
  );
}

/**
 * Renders the custom hero storybook cat rig `'moonlit_cat'` ("Mochi"):
 * - Plush slate-indigo crayon fur (`crayonNightcapBlue`) with lavender-plum tabby
 *   moon markings (`crayonSweaterPurple` / `sweaterPurpleDark`) and creamy chest/muzzle/paws (`paperWarm`)
 * - Blush pink inner ears, rosy cheeks, warm paper eyes with charcoal pupils & star-white catchlights,
 *   and a golden crescent-moon collar charm on a terracotta-pink ribbon collar
 * - Canonical `+X` forward facing (`flipX: false` = facing right) across all poses
 * - Ground contact at `(0, 0)`, total local height ~`82px` (`y: -82..2`), width ~`80px` (`x: -44..36`)
 * - Full state rigging:
 *   - `'walking'`: 3/4 side-profile walking rig facing `+X` (`data-facing="right"`, `data-walk-profile="true"`)
 *   - `'idle'` / `'sitting'`: seated 3/4 right cat with auto-blink & subtle breathing jitter
 *   - `'curious'` / `'looking_up'`: playful head tilt, wide upward-gazing eyes, perked ears, excited tail curl
 *   - `'waving'` / `'reaching'`: raised batting right front paw tapping wind chimes/fireflies
 *   - `'singing'`: stepped 6 FPS 3-phase animated speaking mouth (`data-speaking-mouth="true"`) + head/whisker bob
 *   - `'sleeping'` / `'sleepy'`: cozy curled-up sleeping ball on the grass with floating `'z Z'`
 *   - `'blinking'`: gentle closed-eye happy smile
 */
export function renderMoonlitCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    paperWarm,
    starWhite,
    dressPink,
    cherryRose,
    sweaterPurpleDark,
    warmMoon,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const furFill = getPatternFill('crayonNightcapBlue');
  const tabbyFill = getPatternFill('crayonSweaterPurple');
  const collarFill = getPatternFill('crayonTerracotta');

  // 1. Curled-up Sleeping Ball (`'sleeping'` / `'sleepy'`)
  if (state === 'sleeping' || state === 'sleepy') {
    const breath = round2(
      steppedOscillate(frameIndex, 12, 1.3) + deterministicJitter(frameIndex, 5, 0.35)
    );
    const zFloat = round2(steppedOscillate(frameIndex, 8, 2.8));
    const zDriftX = round2(steppedOscillate(frameIndex, 12, 1.8));
    const charmGlint = frameIndex % 6 === 0;

    return svgEl(
      'g',
      {
        'data-character': 'moonlit_cat',
        'data-state': state,
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Cozy curled-up slate-blue body with gentle breathing lift
        svgEl(
          'g',
          {
            'data-part': 'sleeping-body',
            transform: svgTransform({ y: round2(-breath * 0.5) }),
          },
          [
            crayonPath(
              'M -31 -3 C -34 -26, -10 -34, 12 -26 C 24 -21, 25 -5, 18 1 C 6 3, -24 3, -31 -3 Z',
              furFill,
              { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
            ),
            // Lavender-plum tabby back stripes (`data-part="tabby-markings"`)
            svgEl('g', { 'data-part': 'tabby-markings' }, [
              crayonPath(
                'M -20 -26 C -14 -29, -8 -28, -9 -20 C -13 -18, -19 -20, -20 -26 Z',
                tabbyFill,
                { strokeWidth: 1.4 }
              ),
              crayonPath(
                'M -6 -29 C 0 -29, 5 -26, 3 -19 C -1 -18, -5 -21, -6 -29 Z',
                tabbyFill,
                { strokeWidth: 1.4 }
              ),
              svgEl('path', {
                d: 'M -24 -16 Q -18 -14, -14 -17 M -14 -23 Q -9 -21, -6 -23',
                fill: 'none',
                stroke: sweaterPurpleDark,
                'stroke-width': 1.8,
                'stroke-linecap': 'round',
              }),
            ]),
            // Soft cream tummy tuft peeking beneath chin
            crayonPath(
              'M -10 -12 C -2 -14, 6 -12, 8 -4 C 4 1, -8 1, -10 -12 Z',
              paperWarm,
              { strokeWidth: 1.4 }
            ),
          ]
        ),
        // Snug curled tail wrapped from back (-X) around front paws toward nose
        crayonPath(
          'M -29 -5 C -36 -1, -33 4, -18 4 C -4 4, 8 3, 14 -1 C 16 -3, 13 -7, 8 -5 C 2 -2, -12 -1, -24 -4 Z',
          furFill,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        // Lavender tabby tip on tucked tail
        crayonPath(
          'M 5 -4 C 9 -6.5, 15 -5, 14 -1 C 11 1.5, 7 1, 5 -4 Z',
          tabbyFill,
          { strokeWidth: 1.3 }
        ),
        // Ribbon collar peek & golden crescent-moon charm nestled by chin
        crayonPath('M -3 -11 Q 3 -8, 9 -11', collarFill, {
          strokeWidth: 3.0,
        }),
        renderCrescentMoonCharm(2.5, -7.5, 0.85, charmGlint),
        // Sleeping head resting peacefully on front right side
        svgEl(
          'g',
          {
            'data-part': 'head',
            transform: svgTransform({ y: round2(-breath * 0.35) }),
          },
          [
            // Back-left & front-right resting ears with blush pink interiors
            crayonPath('M 3 -25 L 6 -36 L 13 -28 Z', furFill, {
              strokeWidth: outlineMedium,
              paperUnderlay: true,
            }),
            svgEl('polygon', {
              points: '5.5,-26.5 7.2,-33.2 11.2,-28',
              fill: dressPink,
            }),
            crayonPath('M 16 -27 L 23 -35 L 24 -22 Z', furFill, {
              strokeWidth: outlineMedium,
              paperUnderlay: true,
            }),
            svgEl('polygon', {
              points: '17.8,-26.2 21.8,-32.2 22.4,-23.5',
              fill: dressPink,
            }),
            // Round resting head
            crayonPath(
              'M 0 -16 C 0 -27, 13 -31, 22 -24 C 28 -18, 27 -5, 16 -4 C 6 -3, 0 -8, 0 -16 Z',
              furFill,
              { strokeWidth: outlineHeavy, paperUnderlay: true }
            ),
            // Tabby forehead mark on sleeping head
            crayonPath(
              'M 11 -27 C 15 -28, 19 -26, 17 -22 C 14 -21, 11 -24, 11 -27 Z',
              tabbyFill,
              { strokeWidth: 1.3 }
            ),
            // Creamy muzzle puff
            crayonPath(
              'M 8 -11 C 9 -15, 20 -15, 21 -10 C 21 -6, 11 -5, 8 -11 Z',
              paperWarm,
              { strokeWidth: 1.3 }
            ),
            // Rosy cheeks
            svgEl('ellipse', {
              cx: 6.5,
              cy: -11.5,
              rx: 2.8,
              ry: 1.8,
              fill: dressPink,
              opacity: 0.72,
            }),
            svgEl('ellipse', {
              cx: 22.2,
              cy: -11.5,
              rx: 2.5,
              ry: 1.7,
              fill: dressPink,
              opacity: 0.72,
            }),
            // Peaceful closed curved sleeping eyes
            svgEl('path', {
              d: 'M 7.5 -16.5 Q 10.5 -13.5, 13.5 -16.5 M 16.5 -16.5 Q 19.5 -13.5, 22.5 -16.5',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
            }),
            // Tiny pink nose & soft sleepy smile
            svgEl('circle', { cx: 15.2, cy: -12.4, r: 1.5, fill: cherryRose }),
            svgEl('path', {
              d: 'M 12.6 -9.8 Q 15.2 -8.2, 17.8 -9.8',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
            }),
            // Whiskers
            svgEl('path', {
              d: 'M 3 -12.5 L -4 -12 M 3.5 -10 L -3 -8.5 M 24 -12.5 L 31 -12 M 23.5 -10 L 30 -8.5',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: 1.3 }),
            }),
          ]
        ),
        // Floating hand-lettered 'z Z' drifting softly at 6 FPS (high contrast on night & paper)
        svgEl(
          'text',
          {
            'data-part': 'sleep-zzz',
            x: round2(13 + zDriftX),
            y: round2(-37 + zFloat),
            'font-family': TOKENS.typography.fontFamilyHand,
            'font-size': 13,
            'font-weight': 'bold',
            fill: starWhite,
            stroke: charcoalOutline,
            'stroke-width': 2.2,
            'paint-order': 'stroke',
          },
          'z Z'
        ),
      ]
    );
  }

  // 2. Dedicated 3/4 Side-Profile Walking Rig Facing RIGHT (+X when flipX: false)
  if (state === 'walking') {
    const strideAngle = steppedOscillate(frameIndex, 4, 20);
    const strideBob = Math.abs(steppedOscillate(frameIndex, 4, 2.2));
    const tailSway = steppedOscillate(frameIndex, 6, 6);
    const headBob = steppedOscillate(frameIndex, 4, 2.5);
    const blink = isSteppedBlinkFrame(frameIndex, 18, 1);
    const charmGlint = frameIndex % 4 === 0;

    return svgEl(
      'g',
      {
        'data-character': 'moonlit_cat',
        'data-state': 'walking',
        'data-facing': 'right',
        'data-walk-profile': 'true',
        transform: svgTransform({ y: round2(-strideBob) }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Upright curly swaying tail on the left (-X) with lavender tabby rings
        crayonPath(
          `M -22 -34 C -34 -40, ${round2(-42 + tailSway * 0.4)} -56, ${round2(-36 + tailSway * 0.55)} -68 C ${round2(-32 + tailSway * 0.55)} -73, ${round2(-24 + tailSway * 0.4)} -68, ${round2(-27 + tailSway * 0.35)} -60 C ${round2(-30 + tailSway * 0.25)} -52, -26 -42, -18 -36 Z`,
          furFill,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        crayonPath(
          `M ${round2(-37 + tailSway * 0.5)} -64 C ${round2(-34 + tailSway * 0.52)} -71, ${round2(-26 + tailSway * 0.42)} -70, ${round2(-27 + tailSway * 0.38)} -63 Z`,
          tabbyFill,
          { strokeWidth: 1.3 }
        ),
        // Back-far leg striding in opposition
        svgEl(
          'g',
          {
            'data-part': 'back-far-leg',
            transform: svgTransform({
              rotate: -strideAngle,
              pivotX: -14,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M -19 -22 L -11 -22 L -10 -4 L -18 -4 Z',
              furFill,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M -19 -6 L -10 -6 C -7 -6, -7 0, -10 0 L -18 0 C -20 0, -20 -4, -19 -6 Z',
              paperWarm,
              { strokeWidth: outlineThin }
            ),
          ]
        ),
        // Front-far leg striding forward toward +X
        svgEl(
          'g',
          {
            'data-part': 'front-far-leg',
            transform: svgTransform({
              rotate: strideAngle,
              pivotX: 11,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M 7 -22 L 15 -22 L 16 -4 L 8 -4 Z',
              furFill,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M 7 -6 L 16 -6 C 19 -6, 19 0, 16 0 L 8 0 C 6 0, 6 -4, 7 -6 Z',
              paperWarm,
              { strokeWidth: outlineThin }
            ),
          ]
        ),
        // Horizontal 3/4 feline body facing right (+X)
        crayonPath(
          'M -24 -28 C -26 -43, -10 -46, 8 -44 C 16 -43, 19 -34, 17 -24 C 14 -18, -18 -17, -24 -28 Z',
          furFill,
          { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
        ),
        // Creamy chest/belly highlight along front-right underside
        crayonPath(
          'M -6 -21 C 2 -20, 14 -24, 16 -36 C 12 -39, 6 -36, 4 -29 C 2 -24, -2 -23, -6 -21 Z',
          paperWarm,
          { strokeWidth: 1.4 }
        ),
        // Lavender tabby saddle stripes on walking back
        svgEl('g', { 'data-part': 'tabby-markings' }, [
          crayonPath(
            'M -16 -42 C -11 -45, -5 -44, -6 -36 C -10 -34, -15 -36, -16 -42 Z',
            tabbyFill,
            { strokeWidth: 1.3 }
          ),
          crayonPath(
            'M -3 -44 C 2 -44, 6 -42, 4 -35 C 0 -34, -3 -37, -3 -44 Z',
            tabbyFill,
            { strokeWidth: 1.3 }
          ),
        ]),
        // Back-near leg striding forward
        svgEl(
          'g',
          {
            'data-part': 'back-near-leg',
            transform: svgTransform({
              rotate: strideAngle,
              pivotX: -19,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M -24 -23 L -15 -23 L -14 -4 L -23 -4 Z',
              furFill,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M -24 -6 L -14 -6 C -11 -6, -11 0, -14 0 L -23 0 C -25 0, -25 -4, -24 -6 Z',
              paperWarm,
              { strokeWidth: outlineThin }
            ),
          ]
        ),
        // Front-near leg striding in opposition
        svgEl(
          'g',
          {
            'data-part': 'front-near-leg',
            transform: svgTransform({
              rotate: -strideAngle,
              pivotX: 6,
              pivotY: -22,
            }),
          },
          [
            crayonPath(
              'M 2 -23 L 10 -23 L 11 -4 L 3 -4 Z',
              furFill,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M 2 -6 L 11 -6 C 14 -6, 14 0, 11 0 L 3 0 C 1 0, 1 -4, 2 -6 Z',
              paperWarm,
              { strokeWidth: outlineThin }
            ),
          ]
        ),
        // Terracotta-pink ribbon collar & glinting crescent moon charm
        crayonPath(
          'M 1 -43 Q 11 -39, 18 -42 L 17 -37 Q 10 -34, 0 -38 Z',
          collarFill,
          { strokeWidth: outlineThin }
        ),
        renderCrescentMoonCharm(13, -33.5, 0.95, charmGlint),
        // 3/4 Right-facing head looking forward (+X)
        renderMochiHead({
          cx: 12.5,
          cy: -56.5,
          headTilt: headBob,
          eyeMode: blink ? 'blink' : 'open',
          compactWhiskers: true,
          frameIndex,
          fillMask,
        }),
      ]
    );
  }

  // 3. Seated / Idle / Curious / Looking Up / Waving / Reaching / Singing / Blinking Rig
  const isCurious = state === 'curious' || state === 'looking_up';
  const isWaving = state === 'waving' || state === 'reaching';
  const isSinging = state === 'singing';
  const isBlinking = state === 'blinking';

  const autoBlink = !isCurious && isSteppedBlinkFrame(frameIndex, 18, 1);
  const breatheBob = round2(
    isSinging
      ? Math.abs(steppedOscillate(frameIndex, 6, 1.8))
      : steppedOscillate(frameIndex, 12, 0.9) + deterministicJitter(frameIndex, 3, 0.45)
  );
  const tailSway = isCurious
    ? steppedOscillate(frameIndex, 4, 5.5)
    : steppedOscillate(frameIndex, 10, 3.8);
  const headTilt = isCurious
    ? round2(-10 + steppedOscillate(frameIndex, 10, 2.0))
    : isSinging
    ? steppedOscillate(frameIndex, 6, 3.8)
    : isWaving
    ? round2(4 + steppedOscillate(frameIndex, 6, 3.0))
    : round2(steppedOscillate(frameIndex, 14, 2.0) + deterministicJitter(frameIndex, 9, 0.4));

  const eyeMode: EyeMode = isBlinking || autoBlink
    ? 'blink'
    : isCurious
    ? 'curious'
    : isWaving
    ? 'sparkle'
    : 'open';

  const pawWaveAngle = isWaving
    ? round2(-12 + steppedOscillate(frameIndex, 4, 15))
    : 0;
  const charmGlint = isWaving || isSinging || frameIndex % 5 === 0;

  // Tail silhouette: perked & curling upward when curious/waving, cozily curled when seated
  const tailPath =
    isCurious || isWaving
      ? `M -18 -9 C -32 -12, ${round2(-40 + tailSway * 0.45)} -26, ${round2(-35 + tailSway * 0.6)} -40 C ${round2(-32 + tailSway * 0.6)} -45, ${round2(-24 + tailSway * 0.4)} -42, ${round2(-27 + tailSway * 0.35)} -34 C ${round2(-30 + tailSway * 0.25)} -24, -24 -17, -15 -14 Z`
      : `M -17 -6 C -33 -6, ${round2(-41 + tailSway * 0.4)} -16, ${round2(-37 + tailSway * 0.55)} -27 C ${round2(-35 + tailSway * 0.55)} -33, ${round2(-26 + tailSway * 0.4)} -30, ${round2(-28 + tailSway * 0.35)} -22 C ${round2(-30 + tailSway * 0.2)} -15, -24 -12, -14 -11 Z`;

  const tailTipPath =
    isCurious || isWaving
      ? `M ${round2(-36 + tailSway * 0.55)} -37 C ${round2(-34 + tailSway * 0.58)} -44, ${round2(-26 + tailSway * 0.42)} -43, ${round2(-27 + tailSway * 0.38)} -36 Z`
      : `M ${round2(-38 + tailSway * 0.5)} -24 C ${round2(-36 + tailSway * 0.52)} -32, ${round2(-27 + tailSway * 0.4)} -31, ${round2(-28 + tailSway * 0.35)} -24 Z`;

  return svgEl(
    'g',
    {
      'data-character': 'moonlit_cat',
      'data-state': state,
      transform: svgTransform({ y: round2(-breatheBob) }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Curled plush tail on the left (-X) with lavender tabby tip
      crayonPath(tailPath, furFill, {
        strokeWidth: outlineMedium,
        paperUnderlay: true,
      }),
      crayonPath(tailTipPath, tabbyFill, {
        strokeWidth: 1.3,
      }),
      // Seated plush 3/4 right-facing body (ground contact at y = 0)
      crayonPath(
        'M -19 -2 C -23 -20, -16 -38, -8 -44 L 10 -44 C 17 -36, 19 -14, 15 -1 C 10 2, -14 2, -19 -2 Z',
        furFill,
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      // Lavender tabby flank markings (`data-part="tabby-markings"`)
      svgEl('g', { 'data-part': 'tabby-markings' }, [
        crayonPath(
          'M -19 -19 C -13 -22, -8 -18, -11 -12 C -15 -11, -20 -13, -19 -19 Z',
          tabbyFill,
          { strokeWidth: 1.3 }
        ),
        svgEl('path', {
          d: 'M -18 -27 Q -13 -28, -10 -25 M -19 -9 Q -14 -10, -11 -7',
          fill: 'none',
          stroke: sweaterPurpleDark,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
        }),
      ]),
      // Creamy plush chest tuft (`paperWarm`)
      crayonPath(
        'M -5 -41 C 1 -43, 9 -42, 12 -36 C 14 -26, 11 -14, 4 -12 C -3 -12, -8 -22, -5 -41 Z',
        paperWarm,
        { strokeWidth: 1.5 }
      ),
      // Left front leg & cream mitten paw grounded at y = 0
      crayonPath(
        'M -6 -22 L -6 -4 C -6 1, 2 1, 2 -4 L 2 -22',
        furFill,
        { strokeWidth: outlineMedium, paperUnderlay: true }
      ),
      crayonPath(
        'M -7 -6 C -7 1, 4 1, 3 -6 Z',
        paperWarm,
        { strokeWidth: outlineThin }
      ),
      svgEl('path', {
        d: 'M -3.2 -2.5 L -3.2 0 M 0.2 -2.5 L 0.2 0',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
      }),
      // Right front paw: raised high & batting when waving/reaching, or neatly seated on y = 0
      isWaving
        ? svgEl(
            'g',
            {
              'data-part': 'waving-paw',
              transform: svgTransform({
                rotate: pawWaveAngle,
                pivotX: 11,
                pivotY: -34,
              }),
            },
            [
              // Raised reaching foreleg toward (+X, -Y)
              crayonPath(
                'M 9 -36 C 17 -41, 23 -49, 27 -58 L 32 -53 C 28 -43, 21 -34, 12 -29 Z',
                furFill,
                { strokeWidth: outlineMedium, paperUnderlay: true }
              ),
              // Plush cream batting paw mitten with tiny pink paw pad
              svgEl('ellipse', {
                cx: 29.5,
                cy: -56.5,
                rx: 5.0,
                ry: 4.5,
                fill: paperWarm,
                ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
              }),
              svgEl('circle', {
                cx: 29.5,
                cy: -56.2,
                r: 1.8,
                fill: dressPink,
              }),
              // Playful golden motion/chime-tap glints near raised paw
              svgEl('path', {
                d: 'M 34 -64 L 36 -68 M 36 -58 L 39 -60 M 26 -64 L 25 -68',
                fill: 'none',
                stroke: warmMoon,
                'stroke-width': 2.0,
                'stroke-linecap': 'round',
              }),
            ]
          )
        : svgEl('g', { 'data-part': 'front-right-paw' }, [
            crayonPath(
              'M 5 -22 L 5 -4 C 5 1, 13 1, 13 -4 L 13 -22',
              furFill,
              { strokeWidth: outlineMedium, paperUnderlay: true }
            ),
            crayonPath(
              'M 4 -6 C 4 1, 16 1, 15 -6 Z',
              paperWarm,
              { strokeWidth: outlineThin }
            ),
            svgEl('path', {
              d: 'M 8.2 -2.5 L 8.2 0 M 11.6 -2.5 L 11.6 0',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
            }),
          ]),
      // Terracotta-pink ribbon collar around neck
      crayonPath(
        'M -10 -44 Q 3 -39, 14 -44 L 13 -39 Q 3 -34, -11 -39 Z',
        collarFill,
        { strokeWidth: outlineThin }
      ),
      // Golden crescent-moon collar charm hanging at chest
      renderCrescentMoonCharm(6.5, -34.5, 1.0, charmGlint),
      // Expressive 3/4 right-facing head
      renderMochiHead({
        cx: 3,
        cy: -57,
        headTilt,
        eyeMode,
        speaking: isSinging,
        curiousMouth: isCurious,
        earPerk: isCurious ? 1.5 : 0,
        frameIndex,
        fillMask,
      }),
    ]
  );
}

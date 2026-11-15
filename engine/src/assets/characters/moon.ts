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
 * Renders the expressive Storybook Crescent Moon with Twinkling Stars (`'moon'`).
 * - Sculpted C-shaped wax-crayon Crescent Moon (`crayonWarmMoon` with `mask: fillMask`)
 * - Warm rosy cheek spots (`moonCheek`) and diagonal charcoal hatching
 * - Expressive face states: `moon-face-sleeping`, `moon-face-grumpy`, `moon-face-awake`
 * - Optional blue-and-white striped sleeping nightcap (`data-part="moon-nightcap"`)
 * - Companion twinkling & dangling 5-point crayon stars (`data-part="moon-stars"`)
 */
export function renderMoon(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    wearingNightcap = false,
    fillMask,
  } = options;

  const {
    warmMoon,
    bananaYellow,
    starWhite,
    moonCheek,
    nightcapWhite,
    charcoalOutline,
    faintPencil,
    indigoNightDark,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  const gentleRock = steppedOscillate(frameIndex, 18, 2.5);
  const starBob = round2(steppedOscillate(frameIndex, 6, 3.5));
  const autoBlink =
    state !== 'sleeping' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 24, 1, 4));

  // 1. Lush C-Shaped Storybook Crescent Moon Body (full left belly cradling face, tapered horns on right)
  const crescentBody = crayonPath(
    [
      'M 36 -88',
      'C -36 -108, -98 -58, -98 0',
      'C -98 58, -36 108, 38 88',
      'C 6 70, -14 38, -14 0',
      'C -14 -38, 6 -70, 36 -88',
      'Z',
    ].join(' '),
    getPatternFill('crayonWarmMoon'),
    {
      strokeWidth: outlineHeavy,
      mask: fillMask,
      paperUnderlay: true,
    }
  );

  // 2. Rosy Orange Crayon Cheek & Crescent Spots
  const spots = svgEl('g', { 'data-part': 'moon-spots' }, [
    svgEl('circle', { cx: -32, cy: -56, r: 11, fill: moonCheek, opacity: 0.72 }),
    svgEl('circle', { cx: -76, cy: -18, r: 10, fill: moonCheek, opacity: 0.74 }),
    svgEl('circle', { cx: -74, cy: 18, r: 12, fill: moonCheek, opacity: 0.78 }),
    svgEl('circle', { cx: -28, cy: 14, r: 10, fill: moonCheek, opacity: 0.74 }),
    svgEl('circle', { cx: -36, cy: 58, r: 12, fill: moonCheek, opacity: 0.75 }),
  ]);

  // 3. Signature Diagonal Charcoal Pencil Hatching Lines Across Crescent Belly
  const diagonalHatching = svgEl('path', {
    d: [
      'M -56 -72 L -6 -44',
      'M -82 -44 L -18 -10',
      'M -90 -8 L -20 30',
      'M -82 32 L -10 68',
      'M -52 68 L 12 84',
    ].join(' '),
    fill: 'none',
    stroke: charcoalOutline,
    'stroke-width': annotationPencil,
    'stroke-dasharray': '12 4 16 5 8 4',
    'stroke-linecap': 'round',
    opacity: 0.58,
  });

  // 4. Eyes & Facial Expression Positioned on the Crescent Moon Body
  let faceMarkup = '';
  if (state === 'sleeping' || state === 'sleepy' || autoBlink) {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('path', {
        d: 'M -74 -6 Q -62 6, -50 -6 M -42 -6 Q -30 6, -18 -6',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('path', {
        d: 'M -54 18 Q -46 25, -36 18',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  } else if (state === 'grumpy') {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-grumpy' }, [
      // Left eye
      crayonPath(
        'M -76 -12 L -50 -12 C -48 8, -78 8, -76 -12 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -64, cy: -3, r: 6.5, fill: indigoNightDark }),
      svgEl('circle', { cx: -66, cy: -5, r: 2.0, fill: nightcapWhite }),
      svgEl('path', {
        d: 'M -78 -13 L -48 -13',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Right eye
      crayonPath(
        'M -44 -12 L -18 -12 C -16 8, -46 8, -44 -12 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -32, cy: -3, r: 6.5, fill: indigoNightDark }),
      svgEl('circle', { cx: -34, cy: -5, r: 2.0, fill: nightcapWhite }),
      svgEl('path', {
        d: 'M -46 -13 L -16 -13',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Unimpressed mouth tick
      svgEl('path', {
        d: 'M -54 20 L -38 23',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  } else {
    const pupilShiftX = state === 'curious' ? -2.5 : 0;
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-awake' }, [
      // Left round eye
      svgEl('circle', {
        cx: -63,
        cy: -6,
        r: 12.5,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: -63 + pupilShiftX,
        cy: -5,
        r: 6,
        fill: indigoNightDark,
      }),
      svgEl('circle', {
        cx: -65 + pupilShiftX,
        cy: -8,
        r: 2.2,
        fill: nightcapWhite,
      }),
      // Right round eye
      svgEl('circle', {
        cx: -31,
        cy: -6,
        r: 12.5,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: -31 + pupilShiftX,
        cy: -5,
        r: 6,
        fill: indigoNightDark,
      }),
      svgEl('circle', {
        cx: -33 + pupilShiftX,
        cy: -8,
        r: 2.2,
        fill: nightcapWhite,
      }),
      // Friendly crescent smile
      svgEl('path', {
        d: 'M -54 18 Q -46 25, -38 18',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  }

  // 5. Companion Twinkling & Dangling Stars Around the Crescent Moon (`data-part="moon-stars"`)
  const companionStars = svgEl('g', { 'data-part': 'moon-stars' }, [
    // Faint pencil thread & golden star dangling from the upper crescent tip into the crescent hollow!
    svgEl('line', {
      x1: 32,
      y1: -84,
      x2: 28,
      y2: round2(-26 + starBob),
      stroke: faintPencil,
      'stroke-width': 1.5,
      'stroke-dasharray': '3 3',
    }),
    crayonPath(
      renderStarShape(28, round2(-16 + starBob), 13, gentleRock * 3),
      bananaYellow,
      { strokeWidth: outlineMedium, paperUnderlay: true }
    ),
    // Twinkling star inside lower crescent hollow
    crayonPath(
      renderStarShape(46, round2(34 - starBob * 0.7), 9.5, -12),
      starWhite,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
    // Companion star upper-right of crescent horn
    crayonPath(
      renderStarShape(68, round2(-68 - starBob * 0.6), 11, 15),
      warmMoon,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
    // Companion star upper-left of crescent back
    crayonPath(
      renderStarShape(-98, round2(-72 + starBob * 0.5), 10, -18),
      bananaYellow,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
    // Little star below bottom crescent horn
    crayonPath(
      renderStarShape(-88, round2(68 - starBob * 0.5), 8.5, 10),
      starWhite,
      { strokeWidth: outlineThin, paperUnderlay: true }
    ),
  ]);

  // 6. Blue-and-White Crayon Nightcap Perched on the Upper Crescent Curve
  const nightcap = wearingNightcap
    ? svgEl('g', { 'data-part': 'moon-nightcap' }, [
        crayonPath(
          'M -88 -26 C -70 -94, -22 -128, 18 -134 C 24 -112, 32 -98, 38 -86 Z',
          getPatternFill('crayonNightcapBlue'),
          { strokeWidth: outlineHeavy }
        ),
        svgEl('path', {
          d: 'M -72 -56 C -42 -68, -6 -76, 30 -78 M -50 -88 C -24 -98, 4 -104, 24 -104',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.72 }),
        }),
        crayonPath(
          'M -94 -18 C -64 -72, -16 -102, 40 -90 L 34 -72 C -8 -78, -54 -50, -82 -4 Z',
          nightcapWhite,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          'M 18 -130 C 12 -140, 26 -146, 32 -136 C 40 -132, 34 -120, 24 -122 C 14 -120, 12 -126, 18 -130 Z',
          nightcapWhite,
          { strokeWidth: outlineMedium }
        ),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-character': 'moon',
      'data-state': state,
      transform: svgTransform({ rotate: gentleRock }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [crescentBody, spots, diagonalHatching, faceMarkup, companionStars, nightcap]
  );
}

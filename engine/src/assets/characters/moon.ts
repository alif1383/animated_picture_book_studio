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
 * Renders the expressive Crayon Moon Character Rig (`'moon'`, Reference Images 1, 2, 3).
 */
export function renderMoon(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    wearingNightcap = false,
    fillMask,
  } = options;

  const {
    moonCheek,
    nightcapWhite,
    charcoalOutline,
    indigoNightDark,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  const gentleRock = steppedOscillate(frameIndex, 18, 2.5);
  const autoBlink =
    state !== 'sleeping' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 24, 1, 4));

  // 1. Main Warm Yellow Crayon Moon Disk (r ≈ 96)
  const disk = crayonPath(
    'M 0 -96 C 54 -96, 96 -54, 96 0 C 96 54, 54 96, 0 96 C -54 96, -96 54, -96 0 C -96 -54, -54 -96, 0 -96 Z',
    getPatternFill('crayonWarmMoon'),
    {
      strokeWidth: outlineHeavy,
      mask: fillMask,
      paperUnderlay: true,
    }
  );

  // 2. Rosy Orange Crayon Spots / Cheeks (Ref Images 1, 2, 3)
  const spots = svgEl('g', { 'data-part': 'moon-spots' }, [
    svgEl('circle', { cx: -14, cy: -58, r: 14, fill: moonCheek, opacity: 0.78 }),
    svgEl('circle', { cx: 34, cy: -44, r: 16, fill: moonCheek, opacity: 0.75 }),
    svgEl('circle', { cx: -56, cy: -22, r: 11, fill: moonCheek, opacity: 0.72 }),
    svgEl('circle', { cx: -48, cy: 22, r: 12, fill: moonCheek, opacity: 0.75 }),
    svgEl('circle', { cx: -36, cy: 36, r: 11, fill: moonCheek, opacity: 0.72 }),
    svgEl('circle', { cx: 48, cy: 18, r: 12, fill: moonCheek, opacity: 0.75 }),
    svgEl('circle', { cx: 60, cy: 30, r: 10, fill: moonCheek, opacity: 0.7 }),
    svgEl('circle', { cx: -14, cy: 66, r: 13, fill: moonCheek, opacity: 0.76 }),
  ]);

  // 3. Signature Diagonal Charcoal Pencil Hatching Lines Across Moon Face (Ref Images 1, 2, 3!)
  const diagonalHatching = svgEl('path', {
    d: [
      'M -42 -84 L 84 -12',
      'M -66 -62 L 90 24',
      'M -84 -24 L 74 62',
      'M -86 12 L 54 84',
      'M -68 50 L 18 92',
    ].join(' '),
    fill: 'none',
    stroke: charcoalOutline,
    'stroke-width': annotationPencil,
    'stroke-dasharray': '14 4 22 5 9 4',
    'stroke-linecap': 'round',
    opacity: 0.62,
  });

  // 4. Eyes & Facial Expression (Ref Image 1 sleeping, Ref Image 2 grumpy/unimpressed, Ref Image 3 curious/awake)
  let faceMarkup = '';
  if (state === 'sleeping' || autoBlink) {
    // Closed curved/angled sleeping eyes (Ref Image 1!)
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('path', {
        d: 'M -46 8 L -24 22 L -16 4 M 6 -24 L 22 -8 L 12 10',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('path', {
        d: 'M -6 22 L 8 30 L 18 18',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  } else if (state === 'grumpy') {
    // Half-lowered flat upper eyelids glaring down-left at the singing girl (Ref Image 2!)
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-grumpy' }, [
      // Left eye
      crayonPath(
        'M -44 -14 L -12 -14 C -10 8, -46 8, -44 -14 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -31, cy: -4, r: 7.5, fill: indigoNightDark }),
      svgEl('circle', { cx: -33, cy: -6, r: 2.2, fill: nightcapWhite }),
      svgEl('path', {
        d: 'M -47 -15 L -10 -15',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Right eye
      crayonPath(
        'M 12 -14 L 44 -14 C 46 8, 10 8, 12 -14 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: 25, cy: -4, r: 7.5, fill: indigoNightDark }),
      svgEl('circle', { cx: 23, cy: -6, r: 2.2, fill: nightcapWhite }),
      svgEl('path', {
        d: 'M 10 -15 L 47 -15',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Small unimpressed mouth tick
      svgEl('path', {
        d: 'M -6 22 L 10 25',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  } else {
    // Wide-eyed awake / curious Moon (Ref Image 3!)
    const pupilShiftX = state === 'curious' ? -3 : 0;
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-awake' }, [
      // Left round eye
      svgEl('circle', {
        cx: -28,
        cy: -6,
        r: 15,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: -28 + pupilShiftX,
        cy: -5,
        r: 7,
        fill: indigoNightDark,
      }),
      svgEl('circle', {
        cx: -30 + pupilShiftX,
        cy: -8,
        r: 2.4,
        fill: nightcapWhite,
      }),
      // Right round eye
      svgEl('circle', {
        cx: 28,
        cy: -6,
        r: 15,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', {
        cx: 28 + pupilShiftX,
        cy: -5,
        r: 7,
        fill: indigoNightDark,
      }),
      svgEl('circle', {
        cx: 26 + pupilShiftX,
        cy: -8,
        r: 2.4,
        fill: nightcapWhite,
      }),
      // Little dotted/line mouth (Ref Image 3)
      svgEl('path', {
        d: 'M -4 20 L -1 20 M 3 20 L 6 20',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  }

  // 5. Blue-and-White Crayon Nightcap (Reference Image 1!)
  const nightcap = wearingNightcap
    ? svgEl('g', { 'data-part': 'moon-nightcap' }, [
        // Conical blue crayon cap body curving up from upper-left to top-right
        crayonPath(
          'M -88 -26 C -76 -110, -28 -152, 26 -160 C 16 -120, 12 -96, 12 -82 Z',
          getPatternFill('crayonNightcapBlue'),
          { strokeWidth: outlineHeavy }
        ),
        // Curved stripe creases inside blue nightcap
        svgEl('path', {
          d: 'M -68 -56 Q -32 -78, 8 -92 M -52 -92 Q -22 -108, 12 -116 M -34 -124 Q -10 -134, 18 -138',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin, opacity: 0.72 }),
        }),
        // Thick white crayon brim/cuff hugging the upper-left curve of the Moon (Ref Image 1!)
        crayonPath(
          'M -94 -18 C -64 -68, -22 -94, 20 -92 L 16 -72 C -20 -72, -56 -48, -82 -4 Z',
          nightcapWhite,
          { strokeWidth: outlineMedium }
        ),
        // Fluffy white pom-pom at the tip of the nightcap
        crayonPath(
          'M 20 -164 C 14 -174, 28 -182, 36 -174 C 46 -178, 52 -164, 42 -156 C 46 -146, 30 -144, 24 -152 C 14 -150, 12 -160, 20 -164 Z',
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
    [disk, spots, diagonalHatching, faceMarkup, nightcap]
  );
}

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

/**
 * Renders the expressive Crayon Sun Character Rig (`'sun'`, `'awake' | 'sleepy' | 'sleeping'`)
 * with 12 hand-drawn waxy crayon rays and orange sunset state transitions.
 */
export function renderSun(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    moonCheek,
    terracottaRoof,
    sunsetGold,
    nightcapWhite,
    indigoNightDark,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  const isSunsetOrSleeping =
    state === 'sleepy' || state === 'sleeping' || state === 'grumpy';
  const gentleRock = steppedOscillate(frameIndex, 16, 3);
  const autoBlink =
    state !== 'sleeping' &&
    state !== 'sleepy' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 22, 1, 3));

  const diskPattern = isSunsetOrSleeping
    ? getPatternFill('crayonSunsetOrange')
    : getPatternFill('crayonWarmMoon');

  // 1. 12 Hand-Drawn Waxy Triangular/Wavy Crayon Rays Around Perimeter
  const rays: string[] = [];
  for (let i = 0; i < 12; i++) {
    const baseDeg = i * 30;
    const pulse = steppedOscillate(frameIndex, 6, 4.5, i * 2);
    const rIn = 84;
    const rOut = isSunsetOrSleeping
      ? (i % 2 === 0 ? 110 : 101) + pulse * 0.5
      : (i % 2 === 0 ? 126 : 113) + pulse;

    const radMid = ((baseDeg - 90) * Math.PI) / 180;
    const radLeft = ((baseDeg - 10 - 90) * Math.PI) / 180;
    const radRight = ((baseDeg + 10 - 90) * Math.PI) / 180;

    const x1 = round2(Math.cos(radLeft) * rIn);
    const y1 = round2(Math.sin(radLeft) * rIn);
    const x2 = round2(Math.cos(radRight) * rIn);
    const y2 = round2(Math.sin(radRight) * rIn);
    const tipX = round2(Math.cos(radMid) * rOut);
    const tipY = round2(
      Math.sin(radMid) * rOut + (isSunsetOrSleeping ? 4 : 0)
    );

    const rayFill =
      isSunsetOrSleeping || i % 2 === 1
        ? getPatternFill('crayonSunsetOrange')
        : getPatternFill('crayonWarmMoon');

    rays.push(
      crayonPath(`M ${x1} ${y1} L ${tipX} ${tipY} L ${x2} ${y2} Z`, rayFill, {
        strokeWidth: outlineMedium,
        mask: fillMask,
      })
    );
  }

  // 2. Main Sun Disk (r ≈ 78) + Crayon Cheeks + Diagonal Hatching
  const disk = crayonPath(
    'M 0 -78 C 44 -78, 78 -44, 78 0 C 78 44, 44 78, 0 78 C -44 78, -78 44, -78 0 C -78 -44, -44 -78, 0 -78 Z',
    diskPattern,
    {
      strokeWidth: outlineHeavy,
      mask: fillMask,
      paperUnderlay: true,
    }
  );

  const cheeks = svgEl('g', { 'data-part': 'sun-cheeks' }, [
    svgEl('circle', {
      cx: -36,
      cy: 12,
      r: 12,
      fill: isSunsetOrSleeping ? terracottaRoof : moonCheek,
      opacity: 0.65,
    }),
    svgEl('circle', {
      cx: 36,
      cy: 12,
      r: 12,
      fill: isSunsetOrSleeping ? terracottaRoof : moonCheek,
      opacity: 0.65,
    }),
  ]);

  const hatching = svgEl('path', {
    d: 'M -46 -58 L 58 4 M -62 -22 L 56 44 M -52 24 L 28 66',
    fill: 'none',
    stroke: charcoalOutline,
    'stroke-width': annotationPencil,
    'stroke-dasharray': '12 5 18 5',
    'stroke-linecap': 'round',
    opacity: 0.48,
  });

  // 3. Facial Expression ('awake' | 'sleepy' | 'sleeping')
  let faceMarkup = '';
  if (state === 'sleeping' || autoBlink) {
    faceMarkup = svgEl('g', { 'data-part': 'sun-face-sleeping' }, [
      svgEl('path', {
        d: 'M -36 -4 Q -24 8, -12 -4 M 12 -4 Q 24 8, 36 -4',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('path', {
        d: 'M -12 18 Q 0 26, 12 18',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  } else if (state === 'sleepy' || state === 'grumpy') {
    // Sleepy orange sunset Sun: heavy drooping eyelids + cute yawning 'O' mouth
    faceMarkup = svgEl('g', { 'data-part': 'sun-face-sleepy' }, [
      // Left droopy eye
      crayonPath(
        'M -36 -6 L -12 -6 C -10 10, -38 10, -36 -6 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: -24, cy: 0, r: 5.5, fill: indigoNightDark }),
      svgEl('path', {
        d: 'M -38 -6 Q -24 -2, -10 -6',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Right droopy eye
      crayonPath(
        'M 12 -6 L 36 -6 C 38 10, 10 10, 12 -6 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      svgEl('circle', { cx: 24, cy: 0, r: 5.5, fill: indigoNightDark }),
      svgEl('path', {
        d: 'M 10 -6 Q 24 -2, 38 -6',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
      }),
      // Sleepy yawning 'O' mouth
      svgEl('ellipse', {
        cx: 0,
        cy: 21,
        rx: 7.5,
        ry: 9.5,
        fill: charcoalOutline,
      }),
      svgEl('ellipse', {
        cx: 0,
        cy: 25,
        rx: 4.5,
        ry: 3.2,
        fill: sunsetGold,
      }),
    ]);
  } else {
    // Cheerful wide-awake Morning Sun
    faceMarkup = svgEl('g', { 'data-part': 'sun-face-awake' }, [
      svgEl('circle', {
        cx: -24,
        cy: -8,
        r: 12.5,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', { cx: -24, cy: -7, r: 6, fill: indigoNightDark }),
      svgEl('circle', { cx: -26, cy: -10, r: 2.2, fill: nightcapWhite }),
      svgEl('circle', {
        cx: 24,
        cy: -8,
        r: 12.5,
        fill: nightcapWhite,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      svgEl('circle', { cx: 24, cy: -7, r: 6, fill: indigoNightDark }),
      svgEl('circle', { cx: 22, cy: -10, r: 2.2, fill: nightcapWhite }),
      svgEl('path', {
        d: 'M -18 14 Q 0 31, 18 14',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
    ]);
  }

  return svgEl(
    'g',
    {
      'data-character': 'sun',
      'data-state': state,
      transform: svgTransform({ rotate: gentleRock }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [svgEl('g', { 'data-part': 'sun-rays' }, rays), disk, cheeks, hatching, faceMarkup]
  );
}

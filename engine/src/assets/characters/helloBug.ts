import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';

/**
 * Renders the Friendly "Hi" Berry Bug (`'hello_bug'`) — Bottom-left dark-indigo berry bug with
 * two top antennae, red horizontal head bar, waving arms, and hand-lettered `"Hi"`.
 */
export function renderHelloBug(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    paperWarm,
    radishRed,
    royalCrayonBlue,
    indigoNightDark,
  } = TOKENS.colors;

  const bodyBob = Math.abs(steppedOscillate(frameIndex, 6, 2));
  const waveAngle = steppedOscillate(frameIndex, 4, 14);
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, 7);

  return svgEl(
    'g',
    {
      'data-character': 'hello_bug',
      'data-state': state,
      transform: svgTransform({ y: -bodyBob }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      svgEl(
        'g',
        {
          'data-part': 'cutout-sticker-halo',
          stroke: cutoutHaloWhite,
          'stroke-width': 14,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          fill: cutoutHaloWhite,
        },
        [
          svgEl('circle', { cx: 0, cy: -46, r: 27 }),
          svgEl('ellipse', { cx: 2, cy: -91, rx: 20, ry: 17 }),
          svgEl('path', {
            d: 'M -46 -112 L 48 -106 M -6 -108 L -6 -123 M 10 -107 L 11 -122 M -14 -24 L -30 -2 M 14 -24 L 28 0 M -25 -56 L -40 -64 M 25 -48 L 42 -54 M 32 -84 L 50 -64',
            fill: 'none',
            'stroke-width': 16,
          }),
        ]
      ),
      svgEl('path', {
        d: `M -14 -24 L -30 -2 M 14 -24 L 28 0 M -25 -56 L -40 ${-64 + waveAngle * 0.3} M 25 -48 L 42 ${-54 - waveAngle * 0.4}`,
        fill: 'none',
        stroke: indigoNightDark,
        'stroke-width': 4.6,
        'stroke-linecap': 'round',
      }),
      crayonPath(
        'M 0 -73 C 16 -73, 27 -61, 27 -46 C 27 -30, 16 -19, 0 -19 C -16 -19, -27 -30, -27 -46 C -27 -61, -16 -73, 0 -73 Z',
        getPatternFill('crayonRoyalBlue'),
        { stroke: indigoNightDark, strokeWidth: 3.5, mask: fillMask }
      ),
      svgEl('path', {
        d: 'M -18 -58 Q 0 -66, 18 -56 M -20 -46 Q 2 -52, 20 -44 M -16 -34 Q 0 -40, 16 -32',
        fill: 'none',
        stroke: royalCrayonBlue,
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
      }),
      svgEl('ellipse', {
        cx: 2,
        cy: -91,
        rx: 19,
        ry: 16,
        fill: paperWarm,
        stroke: indigoNightDark,
        'stroke-width': 4,
      }),
      blink
        ? svgEl('path', {
            d: 'M -7 -94 L -1 -94 M 5 -94 L 11 -94',
            fill: 'none',
            stroke: indigoNightDark,
            'stroke-width': 2.4,
          })
        : svgEl('g', { fill: indigoNightDark }, [
            svgEl('circle', { cx: -4, cy: -94, r: 2.4 }),
            svgEl('circle', { cx: 8, cy: -94, r: 2.4 }),
          ]),
      svgEl('path', {
        d: 'M -5 -86 Q 2 -79, 9 -86',
        fill: 'none',
        stroke: indigoNightDark,
        'stroke-width': 2.8,
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d: 'M -6 -107 L -6 -122 M 10 -106 L 11 -121',
        fill: 'none',
        stroke: indigoNightDark,
        'stroke-width': 4.6,
        'stroke-linecap': 'round',
      }),
      svgEl('path', {
        d: 'M -46 -112 L 48 -106',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 5,
        'stroke-linecap': 'round',
      }),
      // Hand-lettered "Hi"
      svgEl('path', {
        'data-part': 'hello-bug-hi',
        d: 'M 32 -83 L 31 -64 M 41 -83 L 40 -64 M 31 -73 L 40 -73 M 48 -76 L 48 -64',
        fill: 'none',
        stroke: indigoNightDark,
        'stroke-width': 3.4,
        'stroke-linecap': 'round',
      }),
      svgEl('circle', { cx: 48, cy: -82, r: 2.2, fill: indigoNightDark }),
    ]
  );
}

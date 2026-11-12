import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders the Blue Party Cat (`'blue_party_cat'`) — Front-left seated sky-blue cat with royal-blue outline,
 * whiskers, curled tail, and red-and-white striped party hat with pink pom-pom.
 */
export function renderBluePartyCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    dressPink,
    catLightBlue,
    cobaltStarBlue,
    radishRed,
  } = TOKENS.colors;

  const tailSway = steppedOscillate(frameIndex, 8, 8);
  const headTilt = steppedOscillate(frameIndex, 10, 3);
  const blink = isSteppedBlinkFrame(frameIndex, 22, 1, 5);

  return svgEl(
    'g',
    {
      'data-character': 'blue_party_cat',
      'data-state': state,
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        'M -24 -108 L -3 -140 L 20 -108 C 26 -90, 22 -68, 16 -56 C 22 -36, 20 -18, 18 -12 C 36 -14, 52 -26, 52 -42 C 52 -50, 40 -48, 38 -36 C 32 -20, 18 -4, 2 1 C -16 2, -30 -4, -26 -18 C -22 -44, -28 -84, -24 -108 Z',
        12
      ),
      crayonPath(
        `M 15 -12 C 34 -14, 52 -26, ${52 + tailSway * 0.4} ${-42 + tailSway * 0.3} C 52 -50, 41 -50, 39 -40 C 37 -28, 27 -20, 16 -18 Z`,
        getPatternFill('crayonCatBlue'),
        { stroke: cobaltStarBlue, strokeWidth: 3 }
      ),
      crayonPath(
        'M -12 -62 C -23 -44, -21 -14, -13 -4 C -3 2, 15 0, 17 -12 C 19 -30, 12 -50, 6 -62 Z',
        getPatternFill('crayonCatBlue'),
        { stroke: cobaltStarBlue, strokeWidth: 3.2, mask: fillMask }
      ),
      crayonPath(
        'M -16 -20 C -29 -18, -29 -3, -14 -4 Z',
        catLightBlue,
        { stroke: cobaltStarBlue, strokeWidth: 3 }
      ),
      crayonPath(
        'M -12 -28 C -14 -12, -13 0, -7 0 C -2 0, -2 -12, -4 -26',
        catLightBlue,
        { stroke: cobaltStarBlue, strokeWidth: 2.8 }
      ),
      crayonPath(
        'M -3 -26 C -4 -10, -3 1, 3 1 C 8 1, 8 -12, 5 -26',
        catLightBlue,
        { stroke: cobaltStarBlue, strokeWidth: 2.8 }
      ),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: headTilt,
            pivotX: -3,
            pivotY: -64,
          }),
        },
        [
          crayonPath('M -21 -88 L -24 -107 L -9 -95 Z', catLightBlue, {
            stroke: cobaltStarBlue,
            strokeWidth: 3,
          }),
          crayonPath('M 5 -95 L 19 -107 L 17 -88 Z', catLightBlue, {
            stroke: cobaltStarBlue,
            strokeWidth: 3,
          }),
          svgEl('ellipse', {
            cx: -3,
            cy: -79,
            rx: 21,
            ry: 17,
            fill: catLightBlue,
            stroke: cobaltStarBlue,
            'stroke-width': 3.2,
          }),
          svgEl('circle', { cx: -15, cy: -76, r: 3.4, fill: dressPink, opacity: 0.85 }),
          svgEl('circle', { cx: 9, cy: -76, r: 3.4, fill: dressPink, opacity: 0.85 }),
          blink
            ? svgEl('path', {
                d: 'M -13 -83 L -7 -83 M 1 -83 L 7 -83',
                fill: 'none',
                stroke: cobaltStarBlue,
                'stroke-width': 2.4,
              })
            : svgEl('g', { fill: cobaltStarBlue }, [
                svgEl('ellipse', { cx: -10, cy: -84, rx: 1.8, ry: 3.2 }),
                svgEl('ellipse', { cx: 4, cy: -84, rx: 1.8, ry: 3.2 }),
              ]),
          svgEl('circle', { cx: -3, cy: -79, r: 1.8, fill: cobaltStarBlue }),
          svgEl('path', {
            d: 'M -3 -78 L -3 -71 M -13 -74 Q -3 -64, 7 -74',
            fill: 'none',
            stroke: cobaltStarBlue,
            'stroke-width': 2.4,
            'stroke-linecap': 'round',
          }),
          svgEl('path', {
            d: 'M -18 -81 L -30 -84 M -19 -77 L -31 -77 M -18 -73 L -29 -69 M 12 -81 L 24 -84 M 13 -77 L 25 -77 M 12 -73 L 23 -69',
            fill: 'none',
            stroke: cobaltStarBlue,
            'stroke-width': 2.2,
            'stroke-linecap': 'round',
          }),
          crayonPath('M -13 -95 L -3 -133 L 7 -95 Z', radishRed, {
            stroke: radishRed,
            strokeWidth: 2.4,
          }),
          svgEl('path', {
            d: 'M -10 -104 L 4 -108 M -7 -116 L 1 -119',
            fill: 'none',
            stroke: cutoutHaloWhite,
            'stroke-width': 3,
            'stroke-linecap': 'round',
          }),
          svgEl('circle', {
            cx: -3,
            cy: -137,
            r: 5,
            fill: dressPink,
            stroke: radishRed,
            'stroke-width': 1.6,
          }),
        ]
      ),
    ]
  );
}

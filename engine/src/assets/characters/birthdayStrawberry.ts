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
import { renderCutoutStickerHalo } from './shared';

/**
 * Renders Birthday Strawberry (`'birthday_strawberry'`) — Plump rounded-berry strawberry
 * guest of honor with yellow-ochre seed speckles, leafy emerald calyx collar, golden
 * birthday crown with pom-pom, big lashed eyes, rosy cheeks, waving red stick limbs,
 * and scissors-cut white sticker halo.
 */
export function renderBirthdayStrawberry(
  options: CharacterRenderOptions
): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    radishRed,
    watermelonPink,
    cherryRose,
    dressPink,
    bananaYellow,
    sunsetGold,
    sunsetOrange,
    treeGreen,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const hopY = Math.abs(steppedOscillate(frameIndex, 6, 3.2));
  const bodyTilt = steppedOscillate(frameIndex, 8, 3);
  const armWave =
    state === 'waving' || state === 'singing'
      ? steppedOscillate(frameIndex, 4, 18)
      : steppedOscillate(frameIndex, 8, 8);
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, 3);
  const mouthOpen =
    state === 'singing' || (state !== 'idle' && frameIndex % 3 === 0);

  const berryD =
    'M 0 -106 C 34 -108, 52 -84, 46 -54 C 40 -28, 20 -14, 0 -14 C -20 -14, -40 -28, -46 -54 C -52 -84, -34 -108, 0 -106 Z';
  const calyxD =
    'M -34 -96 L -18 -86 L -10 -98 L 0 -84 L 10 -98 L 18 -86 L 34 -96 C 22 -106, -22 -106, -34 -96 Z';
  const crownD =
    'M -20 -102 L -24 -134 L -9 -118 L 0 -140 L 9 -118 L 24 -134 L 20 -102 Z';

  return svgEl(
    'g',
    {
      'data-character': 'birthday_strawberry',
      'data-state': state,
      transform: svgTransform({
        y: -hopY,
        rotate: bodyTilt,
        pivotX: 0,
        pivotY: -20,
      }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderCutoutStickerHalo(
        `${berryD} ${calyxD} ${crownD} M -14 -16 L -22 2 M 14 -16 L 22 2 M -42 -62 L -64 -82 M 42 -62 L 64 -82`,
        14
      ),
      svgEl('circle', { cx: 0, cy: -145, r: 9, fill: cutoutHaloWhite }),
      svgEl('path', {
        d: 'M -14 -16 L -22 2 M 14 -16 L 22 2',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 5,
        'stroke-linecap': 'round',
      }),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: -armWave,
            pivotX: -42,
            pivotY: -62,
          }),
        },
        [
          svgEl('path', {
            d: 'M -42 -62 L -64 -82',
            fill: 'none',
            stroke: radishRed,
            'stroke-width': 5.2,
            'stroke-linecap': 'round',
          }),
        ]
      ),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: armWave,
            pivotX: 42,
            pivotY: -62,
          }),
        },
        [
          svgEl('path', {
            d: 'M 42 -62 L 64 -82',
            fill: 'none',
            stroke: radishRed,
            'stroke-width': 5.2,
            'stroke-linecap': 'round',
          }),
        ]
      ),
      crayonPath(berryD, getPatternFill('crayonWatermelonPink'), {
        stroke: radishRed,
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }),
      svgEl('path', {
        d: 'M -32 -88 C -36 -62, -24 -34, -10 -22 M 28 -88 C 34 -62, 22 -34, 8 -22',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 2.8,
        'stroke-linecap': 'round',
        opacity: 0.75,
      }),
      svgEl('g', { 'data-part': 'strawberry-seeds', fill: bananaYellow }, [
        svgEl('ellipse', {
          cx: -28,
          cy: -76,
          rx: 1.8,
          ry: 2.8,
          transform: 'rotate(-12 -28 -76)',
        }),
        svgEl('ellipse', {
          cx: 28,
          cy: -76,
          rx: 1.8,
          ry: 2.8,
          transform: 'rotate(12 28 -76)',
        }),
        svgEl('ellipse', {
          cx: -32,
          cy: -50,
          rx: 1.8,
          ry: 2.8,
          transform: 'rotate(10 -32 -50)',
        }),
        svgEl('ellipse', {
          cx: 32,
          cy: -50,
          rx: 1.8,
          ry: 2.8,
          transform: 'rotate(-10 32 -50)',
        }),
        svgEl('ellipse', { cx: -18, cy: -30, rx: 1.8, ry: 2.8 }),
        svgEl('ellipse', { cx: 0, cy: -26, rx: 1.8, ry: 2.8 }),
        svgEl('ellipse', { cx: 18, cy: -30, rx: 1.8, ry: 2.8 }),
      ]),
      crayonPath(calyxD, getPatternFill('crayonEmeraldFrond'), {
        stroke: treeGreen,
        strokeWidth: outlineMedium,
      }),
      crayonPath(crownD, getPatternFill('crayonWarmMoon'), {
        stroke: sunsetOrange,
        strokeWidth: outlineMedium,
      }),
      svgEl('circle', { cx: -12, cy: -110, r: 2.5, fill: watermelonPink }),
      svgEl('circle', { cx: 0, cy: -112, r: 2.8, fill: radishRed }),
      svgEl('circle', { cx: 12, cy: -110, r: 2.5, fill: watermelonPink }),
      svgEl('circle', {
        cx: 0,
        cy: -145,
        r: 5.5,
        fill: radishRed,
        stroke: sunsetGold,
        'stroke-width': 1.8,
      }),
      svgEl('ellipse', {
        cx: -22,
        cy: -56,
        rx: 6.5,
        ry: 4.5,
        fill: cherryRose,
        opacity: 0.85,
      }),
      svgEl('ellipse', {
        cx: 22,
        cy: -56,
        rx: 6.5,
        ry: 4.5,
        fill: cherryRose,
        opacity: 0.85,
      }),
      blink
        ? svgEl('path', {
            d: 'M -20 -68 Q -13 -62, -6 -68 M 6 -68 Q 13 -62, 20 -68',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
          })
        : svgEl('g', { 'data-part': 'strawberry-eyes' }, [
            svgEl('ellipse', {
              cx: -13,
              cy: -68,
              rx: 6.2,
              ry: 9.5,
              fill: charcoalOutline,
            }),
            svgEl('circle', { cx: -15, cy: -72, r: 2.4, fill: cutoutHaloWhite }),
            svgEl('path', {
              d: 'M -18 -76 L -22 -82 M -13 -78 L -14 -85 M -8 -76 L -5 -82',
              fill: 'none',
              stroke: charcoalOutline,
              'stroke-width': 2.2,
              'stroke-linecap': 'round',
            }),
            svgEl('ellipse', {
              cx: 13,
              cy: -68,
              rx: 6.2,
              ry: 9.5,
              fill: charcoalOutline,
            }),
            svgEl('circle', { cx: 11, cy: -72, r: 2.4, fill: cutoutHaloWhite }),
            svgEl('path', {
              d: 'M 8 -76 L 5 -82 M 13 -78 L 14 -85 M 18 -76 L 22 -82',
              fill: 'none',
              stroke: charcoalOutline,
              'stroke-width': 2.2,
              'stroke-linecap': 'round',
            }),
          ]),
      mouthOpen
        ? svgEl('g', { 'data-part': 'strawberry-mouth-open' }, [
            crayonPath(
              'M -12 -50 Q 0 -46, 12 -50 C 12 -32, -12 -32, -12 -50 Z',
              charcoalOutline,
              { strokeWidth: outlineMedium }
            ),
            crayonPath(
              'M -7 -41 C -2 -46, 4 -46, 7 -41 C 4 -35, -4 -35, -7 -41 Z',
              dressPink,
              { stroke: charcoalOutline, strokeWidth: outlineThin }
            ),
          ])
        : svgEl('path', {
            d: 'M -11 -48 Q 0 -38, 11 -48',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
          }),
    ]
  );
}

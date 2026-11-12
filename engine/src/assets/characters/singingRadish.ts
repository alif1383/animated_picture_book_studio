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
 * Renders the Singing Radish / Turnip Star (`'singing_radish'`) — Center front star of Ref Image 5:
 * Inverted red-orange crayon cone body with dense scribbles, two sweeping emerald-green
 * leafy fountain ponytails with dark-blue hair ties, lashed eyes, joyful open mouth with
 * pink tongue, and a dark-blue crayon microphone in its left hand.
 */
export function renderSingingRadish(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    cutoutHaloWhite,
    radishRed,
    emeraldFrond,
    treeGreen,
    royalCrayonBlue,
    indigoNightDark,
    charcoalOutline,
    dressPink,
    cherryRose,
    catLightBlue,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  const bodyBob = Math.abs(steppedOscillate(frameIndex, 6, 3));
  const bodyTilt =
    state === 'singing'
      ? steppedOscillate(frameIndex, 8, 3.5)
      : steppedOscillate(frameIndex, 12, 1.5);
  const ponyBounce = steppedOscillate(frameIndex, 6, 4.5);
  const leftArmWave =
    state === 'singing' || state === 'waving'
      ? steppedOscillate(frameIndex, 4, 14)
      : 0;
  const micArmBob = state === 'singing' ? steppedOscillate(frameIndex, 6, 7) : 0;
  const blink = isSteppedBlinkFrame(frameIndex, 20, 1, 2);
  const mouthOpen = state !== 'idle' || frameIndex % 3 !== 0;

  const bodyD =
    'M -64 -180 Q -4 -185, 58 -192 C 54 -122, 28 -58, 2 -24 C -24 -56, -52 -120, -64 -180 Z';

  return svgEl(
    'g',
    {
      'data-character': 'singing_radish',
      'data-state': state,
      transform: svgTransform({
        y: -bodyBob,
        rotate: bodyTilt,
        pivotX: 0,
        pivotY: -30,
      }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // 1. White Paper-Cutout Sticker Halo
      renderCutoutStickerHalo(
        `${bodyD} M -12 -36 L -34 -2 M 8 -36 L 26 -2 M -44 -102 L -74 -120 M 36 -104 L 68 -118 M 66 -138 L 62 -86`,
        16
      ),
      svgEl('path', {
        d: 'M -12 -190 C -30 -248, -90 -246, -112 -156 M 12 -191 C 36 -254, 120 -250, 142 -100',
        fill: 'none',
        stroke: cutoutHaloWhite,
        'stroke-width': 24,
        'stroke-linecap': 'round',
      }),

      // 2. Emerald-Green Fountain Ponytails + Dark-Blue Hair Ties
      svgEl(
        'g',
        {
          'data-part': 'radish-ponytails',
          transform: svgTransform({ y: ponyBounce * 0.4 }),
        },
        [
          svgEl('path', {
            d: 'M -12 -190 C -28 -246, -88 -244, -114 -162 M -10 -188 C -26 -236, -82 -232, -108 -150 M -15 -188 C -34 -226, -76 -220, -100 -144',
            fill: 'none',
            stroke: emeraldFrond,
            'stroke-width': 5.5,
            'stroke-linecap': 'round',
          }),
          svgEl('path', {
            d: 'M -12 -190 C -30 -240, -84 -238, -110 -156',
            fill: 'none',
            stroke: treeGreen,
            'stroke-width': 2.6,
            'stroke-linecap': 'round',
          }),
          svgEl('path', {
            d: 'M 10 -191 C 34 -256, 122 -252, 146 -106 M 14 -189 C 38 -244, 114 -238, 138 -96 M 16 -187 C 40 -230, 106 -224, 130 -98',
            fill: 'none',
            stroke: emeraldFrond,
            'stroke-width': 6,
            'stroke-linecap': 'round',
          }),
          svgEl('path', {
            d: 'M 12 -190 C 36 -248, 118 -242, 142 -100',
            fill: 'none',
            stroke: treeGreen,
            'stroke-width': 2.8,
            'stroke-linecap': 'round',
          }),
          svgEl('ellipse', {
            cx: -11,
            cy: -187,
            rx: 9.5,
            ry: 5.5,
            fill: royalCrayonBlue,
            stroke: indigoNightDark,
            'stroke-width': 1.5,
            transform: 'rotate(-8, -11, -187)',
          }),
          svgEl('ellipse', {
            cx: 11,
            cy: -189,
            rx: 9.5,
            ry: 5.5,
            fill: royalCrayonBlue,
            stroke: indigoNightDark,
            'stroke-width': 1.5,
            transform: 'rotate(-6, 11, -189)',
          }),
        ]
      ),

      // 3. Red Stick Legs & Right Waving Arm
      svgEl('path', {
        d: 'M -12 -36 L -34 -2 M 8 -36 L 26 -2',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 5.5,
        'stroke-linecap': 'round',
      }),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: leftArmWave,
            pivotX: -44,
            pivotY: -102,
          }),
        },
        [
          svgEl('path', {
            d: 'M -44 -102 L -74 -120',
            fill: 'none',
            stroke: radishRed,
            'stroke-width': 6,
            'stroke-linecap': 'round',
          }),
        ]
      ),

      // 4. Inverted Red-Orange Crayon Cone Body + Dense Scribbles
      crayonPath('M -42 -182 L -33 -196 L -24 -183 Z', cutoutHaloWhite, {
        stroke: radishRed,
        strokeWidth: outlineMedium,
      }),
      crayonPath(bodyD, getPatternFill('crayonRadishRed'), {
        stroke: radishRed,
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }),
      svgEl('path', {
        d: 'M -50 -174 L -16 -64 M -34 -176 L -2 -44 M -14 -178 L 8 -48 M 8 -182 L 20 -68 M 30 -184 L 34 -92 M 46 -186 L 44 -124',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
        opacity: 0.88,
      }),

      // 5. Expressive Lashed Eyes, Rosy Cheeks & Singing Mouth
      svgEl('ellipse', {
        cx: -35,
        cy: -114,
        rx: 8.5,
        ry: 6,
        fill: cherryRose,
        opacity: 0.85,
      }),
      svgEl('ellipse', {
        cx: 27,
        cy: -120,
        rx: 8.5,
        ry: 6,
        fill: cherryRose,
        opacity: 0.85,
      }),
      blink
        ? svgEl('path', {
            d: 'M -37 -136 Q -28 -128, -19 -136 M 9 -142 Q 18 -134, 27 -142',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
          })
        : svgEl('g', { 'data-part': 'radish-eyes' }, [
            svgEl('ellipse', {
              cx: -28,
              cy: -136,
              rx: 9,
              ry: 14.5,
              fill: charcoalOutline,
              transform: 'rotate(-6, -28, -136)',
            }),
            svgEl('circle', { cx: -30, cy: -142, r: 3.4, fill: cutoutHaloWhite }),
            svgEl('circle', { cx: -25, cy: -131, r: 1.8, fill: cutoutHaloWhite }),
            svgEl('path', {
              d: 'M -36 -146 L -42 -154 M -31 -150 L -34 -160 M -25 -151 L -24 -161 M -20 -148 L -15 -156',
              fill: 'none',
              stroke: charcoalOutline,
              'stroke-width': 2.6,
              'stroke-linecap': 'round',
            }),
            svgEl('ellipse', {
              cx: 18,
              cy: -142,
              rx: 9,
              ry: 14.5,
              fill: charcoalOutline,
              transform: 'rotate(-6, 18, -142)',
            }),
            svgEl('circle', { cx: 16, cy: -148, r: 3.4, fill: cutoutHaloWhite }),
            svgEl('circle', { cx: 21, cy: -137, r: 1.8, fill: cutoutHaloWhite }),
            svgEl('path', {
              d: 'M 10 -151 L 5 -160 M 15 -155 L 13 -165 M 21 -156 L 23 -166 M 26 -152 L 31 -160',
              fill: 'none',
              stroke: charcoalOutline,
              'stroke-width': 2.6,
              'stroke-linecap': 'round',
            }),
          ]),
      mouthOpen
        ? svgEl('g', { 'data-part': 'radish-mouth-open' }, [
            crayonPath(
              'M -20 -103 Q -2 -98, 16 -112 C 18 -80, -14 -70, -20 -103 Z',
              charcoalOutline,
              { strokeWidth: outlineHeavy }
            ),
            crayonPath(
              'M -10 -89 C -3 -97, 8 -97, 12 -88 C 6 -78, -6 -79, -10 -89 Z',
              dressPink,
              { stroke: charcoalOutline, strokeWidth: outlineThin }
            ),
          ])
        : svgEl('path', {
            d: 'M -16 -100 Q -2 -86, 14 -104',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineHeavy }),
          }),

      // 6. Left Arm Holding Dark-Blue Crayon Microphone
      svgEl(
        'g',
        {
          'data-part': 'radish-mic-arm',
          transform: svgTransform({
            rotate: micArmBob,
            pivotX: 36,
            pivotY: -104,
          }),
        },
        [
          svgEl('path', {
            d: 'M 36 -104 L 62 -115',
            fill: 'none',
            stroke: radishRed,
            'stroke-width': 6,
            'stroke-linecap': 'round',
          }),
          svgEl(
            'g',
            {
              'data-part': 'radish-microphone',
              transform: 'translate(65, -120) rotate(18)',
            },
            [
              crayonPath(
                'M -6 0 L 6 0 L 5 30 C 4 35, -4 35, -5 30 Z',
                indigoNightDark,
                { stroke: indigoNightDark, strokeWidth: outlineThin }
              ),
              svgEl('circle', {
                cx: 0,
                cy: -12,
                r: 13,
                fill: indigoNightDark,
                stroke: indigoNightDark,
                'stroke-width': 2,
              }),
              svgEl('path', {
                d: 'M -10 -12 Q 0 -6, 10 -12 M -6 -22 L -4 -2 M 0 -24 L 0 -1 M 6 -22 L 4 -2',
                fill: 'none',
                stroke: catLightBlue,
                'stroke-width': 1.8,
                'stroke-linecap': 'round',
              }),
            ]
          ),
        ]
      ),
    ]
  );
}

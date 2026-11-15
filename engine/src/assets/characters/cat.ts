import { TOKENS, svgUrl } from '../../theme/tokens';
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
 * Renders the cozy Village Cat (`'cat'`) character rig, modeled after the
 * white-and-brown/grey tabby-patched kitten from the reference sheet:
 * - Soft cream/white body (`paperWarm` with `paperUnderlay: true`)
 * - Dark brown/charcoal tabby patches (`tabbyGreyBrown` / `hairBrown`, `data-part="tabby-patches"`)
 *   on the forehead/ears, back, and tail tip
 * - Pastel pink inner ears, cute whiskers, tiny pink nose, and golden collar bell
 * - States:
 *   - `'sleeping'` / `'sleepy'`: curled up in a cozy ball with tabby back spots and `'z Z'`
 *   - `'walking'` / `'curious'`: playful stretching/stepping pose on all fours with raised tail
 *   - `'idle'` / `'sitting'` / `'waving'` / `'singing'`: seated upright with happy `:3` kitty smile
 */
export function renderCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, fillMask } = options;
  const {
    paperWarm,
    paperShadow,
    tabbyGreyBrown,
    hairBrown,
    dressPink,
    cherryRose,
    warmMoon,
    charcoalOutline,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const tailSway = steppedOscillate(frameIndex, 8, 10);

  // 1. Curled-up Sleeping Kitten (Ref Sheet bottom row, col 3)
  if (state === 'sleeping' || state === 'sleepy') {
    const zFloat = round2(steppedOscillate(frameIndex, 8, 2));
    return svgEl(
      'g',
      {
        'data-character': 'cat',
        'data-state': state,
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Curled cream-white body
        crayonPath(
          'M -19 -2 C -21 -18, 8 -20, 16 -8 C 20 -2, 16 2, -16 2 C -19 2, -19 0, -19 -2 Z',
          paperWarm,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Dark tabby spots on back and rump (`data-part="tabby-patches"`)
        svgEl('g', { 'data-part': 'tabby-patches' }, [
          crayonPath(
            'M -11 -14 C -7 -16, -1 -15, 0 -11 C -2 -9, -9 -9, -11 -14 Z',
            tabbyGreyBrown,
            { strokeWidth: outlineThin }
          ),
          crayonPath(
            'M -18 -7 C -15 -10, -12 -7, -14 -3 C -17 -3, -19 -5, -18 -7 Z',
            hairBrown,
            { strokeWidth: outlineThin }
          ),
        ]),
        // Curled tail tucked around front
        crayonPath(
          'M -17 0 C -10 4, 2 4, 8 1',
          paperShadow,
          { strokeWidth: outlineThin }
        ),
        // Sleeping head resting on paws on the right side
        crayonPath(
          'M 2 -8 C 2 -18, 13 -19, 18 -19 L 21 -25 L 22 -16 C 24 -12, 22 -2, 12 -2 C 5 -2, 2 -4, 2 -8 Z',
          paperWarm,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        // Left ear & pink inner ear triangles
        crayonPath('M 6 -16 L 9 -25 L 14 -18 Z', paperWarm, {
          strokeWidth: outlineMedium,
        }),
        svgEl('polygon', {
          points: '8,-17 9.5,-22.5 12.5,-18',
          fill: dressPink,
        }),
        svgEl('polygon', {
          points: '17.5,-17 20,-22.5 21,-16.5',
          fill: dressPink,
        }),
        // Tabby forehead patch on sleeping head
        crayonPath(
          'M 13 -18 C 16 -19, 19 -17, 18 -14 C 15 -14, 13 -16, 13 -18 Z',
          tabbyGreyBrown,
          { strokeWidth: outlineThin }
        ),
        // Closed sleeping eyes & tiny pink nose
        svgEl('path', {
          d: 'M 8 -9 Q 10 -7, 12 -9 M 15 -9 Q 17 -7, 19 -9',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        svgEl('circle', { cx: 13.5, cy: -6.5, r: 1.2, fill: cherryRose }),
        // Whiskers
        svgEl('path', {
          d: 'M 4 -7 L 0 -6 M 4 -5 L 1 -3 M 21 -7 L 25 -6',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
        }),
        // Floating 'z Z' pencil letters
        svgEl(
          'text',
          {
            x: 14,
            y: round2(-26 + zFloat),
            'font-family': TOKENS.typography.fontFamilyHand,
            'font-size': 11,
            'font-weight': 'bold',
            fill: charcoalOutline,
          },
          'z Z'
        ),
      ]
    );
  }

  // 2. Playful Walking / Curious Stretching Kitten (Ref Sheet bottom row, col 4)
  if (state === 'walking' || state === 'curious') {
    const step = steppedOscillate(frameIndex, 4, 3.5);
    const bodyBob = Math.abs(steppedOscillate(frameIndex, 4, 1.5));

    return svgEl(
      'g',
      {
        'data-character': 'cat',
        'data-state': state,
        transform: svgTransform({ y: -bodyBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Raised curved tail at back with dark tabby tip
        crayonPath(
          `M -15 -14 C -22 -24, ${-18 + tailSway * 0.4} -34, ${-10 + tailSway * 0.5} -32 C ${-7 + tailSway * 0.5} -31, -11 -22, -12 -12 Z`,
          paperWarm,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        // Stepping back & front paws
        crayonPath(
          `M -15 -6 L -16 ${round2(0 + step * 0.4)} L -11 ${round2(0 + step * 0.4)} L -10 -6 Z`,
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        crayonPath(
          `M 8 -5 L 14 ${round2(0 - step * 0.4)} L 19 ${round2(0 - step * 0.4)} L 13 -6 Z`,
          paperWarm,
          { strokeWidth: outlineMedium }
        ),
        // Arched white body
        crayonPath(
          'M -16 -6 C -18 -19, -4 -20, 12 -14 L 14 -4 L -14 -4 Z',
          paperWarm,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Dark tabby patch on back & ear (`data-part="tabby-patches"`)
        svgEl('g', { 'data-part': 'tabby-patches' }, [
          crayonPath(
            'M -12 -17 C -6 -19, 1 -17, 0 -12 C -4 -10, -11 -11, -12 -17 Z',
            tabbyGreyBrown,
            { strokeWidth: outlineThin }
          ),
        ]),
        // Golden collar bell
        svgEl('circle', {
          cx: 10,
          cy: -7,
          r: 2.2,
          fill: warmMoon,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        // Kitten head with pointed ears & pink inner ears
        crayonPath(
          'M 5 -14 L 5 -25 L 11 -20 L 17 -20 L 23 -25 L 22 -13 C 22 -6, 6 -6, 5 -14 Z',
          paperWarm,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        svgEl('polygon', {
          points: '6.5,-17 7,-22.5 10,-19',
          fill: dressPink,
        }),
        svgEl('polygon', {
          points: '18,-19 21,-22.5 20.5,-16.5',
          fill: dressPink,
        }),
        // Tabby patch over right ear/forehead
        crayonPath(
          'M 15 -20 L 21 -24 L 21 -14 C 17 -14, 15 -17, 15 -20 Z',
          tabbyGreyBrown,
          { strokeWidth: outlineThin }
        ),
        // Bright curious eyes, pink nose, `:3` smile & whiskers
        svgEl('circle', { cx: 10.5, cy: -13.5, r: 1.5, fill: charcoalOutline }),
        svgEl('circle', { cx: 17.5, cy: -13.5, r: 1.5, fill: charcoalOutline }),
        svgEl('circle', { cx: 14, cy: -11, r: 1.2, fill: cherryRose }),
        svgEl('path', {
          d: 'M 11.5 -9.5 Q 14 -8, 16.5 -9.5 M 3 -12 L 7 -12 M 21 -12 L 25 -12',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
        }),
      ]
    );
  }

  // 3. Seated Happy Kitten (Ref Sheet bottom row, col 1 & col 2 — default 'idle' / 'sitting' / 'waving')
  const blink = isSteppedBlinkFrame(frameIndex, 16, 1);
  const happyEyes = state === 'waving' || state === 'singing' || blink;

  return svgEl(
    'g',
    {
      'data-character': 'cat',
      'data-state': state,
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Swaying tail with dark tabby tip
      crayonPath(
        `M -9 -3 Q ${-21 + tailSway * 0.4} -5, ${-20 + tailSway * 0.6} -13 C ${-19 + tailSway * 0.6} -16, -12 -10, -8 -5 Z`,
        paperWarm,
        { strokeWidth: outlineMedium, paperUnderlay: true }
      ),
      // Seated white/cream body with neat front paws
      crayonPath(
        'M -11 0 C -13 -18, 11 -18, 11 0 Z',
        paperWarm,
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      svgEl('path', {
        d: 'M -3 -9 L -3 0 M 3 -9 L 3 0',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Golden collar bell under chin
      svgEl('circle', {
        cx: 0,
        cy: -13,
        r: 2.3,
        fill: warmMoon,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Round kitten head with pointed ears
      crayonPath(
        'M -11 -19 L -13 -31 L -5 -25 L 5 -25 L 13 -31 L 11 -19 C 12 -11, -12 -11, -11 -19 Z',
        paperWarm,
        { strokeWidth: outlineMedium, paperUnderlay: true }
      ),
      // Pastel pink inner ears
      svgEl('polygon', {
        points: '-10,-21 -11.2,-28 -6,-24',
        fill: dressPink,
      }),
      svgEl('polygon', {
        points: '6,-24 11.2,-28 10,-21',
        fill: dressPink,
      }),
      // Dark brown/grey tabby patches on head, back & tail (`data-part="tabby-patches"`)
      svgEl('g', { 'data-part': 'tabby-patches' }, [
        crayonPath(
          'M -10 -24 L -5 -25 C -4 -21, -7 -19, -11 -20 Z',
          tabbyGreyBrown,
          { strokeWidth: outlineThin }
        ),
        crayonPath(
          'M 5 -25 L 10 -24 L 11 -19 C 7 -19, 4 -21, 5 -25 Z',
          tabbyGreyBrown,
          { strokeWidth: outlineThin }
        ),
        crayonPath(
          'M -11 -12 C -7 -14, -5 -9, -10 -6 Z',
          hairBrown,
          { strokeWidth: outlineThin }
        ),
        svgEl('circle', {
          cx: round2(-18 + tailSway * 0.5),
          cy: -11,
          r: 3.2,
          fill: tabbyGreyBrown,
        }),
      ]),
      // Eyes: happy closed arches `^ ^` or bright round eyes
      happyEyes
        ? svgEl('path', {
            d: 'M -6.5 -19 Q -4.2 -22, -2 -19 M 2 -19 Q 4.2 -22, 6.5 -19',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
          })
        : svgEl('g', {}, [
            svgEl('circle', {
              cx: -4.2,
              cy: -19,
              r: 1.6,
              fill: charcoalOutline,
            }),
            svgEl('circle', {
              cx: 4.2,
              cy: -19,
              r: 1.6,
              fill: charcoalOutline,
            }),
          ]),
      // Tiny pink nose & happy `:3` kitty smile
      svgEl('circle', { cx: 0, cy: -16.8, r: 1.2, fill: cherryRose }),
      svgEl('path', {
        d: 'M -3 -15 Q -1.5 -13.5, 0 -15 Q 1.5 -13.5, 3 -15',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.3 }),
      }),
      // Whiskers on both cheeks
      svgEl('path', {
        d: 'M -9 -18 L -15 -19 M -9 -16 L -15 -15 M 9 -18 L 15 -19 M 9 -16 L 15 -15',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
      }),
      // Cute floating pink crayon heart when waving/singing (Ref Sheet bottom row, col 2)
      state === 'waving' || state === 'singing'
        ? crayonPath(
            'M -18 -28 C -20 -32, -25 -31, -24 -26 L -18 -21 L -12 -26 C -11 -31, -16 -32, -18 -28 Z',
            cherryRose,
            { strokeWidth: outlineThin }
          )
        : '',
    ]
  );
}

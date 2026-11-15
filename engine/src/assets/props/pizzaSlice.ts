import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders a compact handheld pepperoni pizza slice (`data-part="pizza-slice"`)
 * that characters (such as Little Girl when `holdingPizza: true`) can carry or eat.
 */
export function renderHandheldPizzaSlice(
  x: number,
  y: number,
  rotate = 0
): string {
  const {
    sunsetGold,
    warmMoon,
    terracottaRoof,
    radishRed,
    emeraldFrond,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'pizza-slice',
      transform: svgTransform({ x, y, rotate }),
    },
    [
      // Golden crust rim at wide top of slice
      crayonPath(
        'M -12 -14 Q 0 -19, 12 -14 C 14 -10, -14 -10, -12 -14 Z',
        sunsetGold,
        { strokeWidth: outlineMedium }
      ),
      // Triangular melted cheese wedge pointing down-right
      crayonPath(
        'M -11 -11 Q 0 -14, 11 -11 L 1 11 Z',
        warmMoon,
        { strokeWidth: outlineMedium }
      ),
      // Red tomato sauce peek under crust
      svgEl('path', {
        d: 'M -8 -10 Q 0 -12, 8 -10',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
      }),
      // Pepperoni circles
      svgEl('circle', {
        cx: -3.5,
        cy: -5,
        r: 2.6,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 4,
        cy: -4,
        r: 2.4,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 0.5,
        cy: 2,
        r: 2.2,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Tiny green basil leaf
      svgEl('ellipse', {
        cx: -1,
        cy: -1,
        rx: 2.1,
        ry: 1.1,
        fill: emeraldFrond,
      }),
    ]
  );
}

/**
 * Renders the reusable Pizza Slice / Pizza Counter Box prop (`'pizza_slice'`).
 * - `variant = 1` (default): Large warm cheesy pepperoni pizza slice with melty cheese drips & steam wisps.
 * - `variant = 2`: Open takeaway pizza box on a wooden stand with hot slices inside.
 */
export function renderPizzaSlice(options: PropRenderOptions): string {
  const {
    frameIndex = 0,
    variant = 1,
    lit = true,
    fillMask,
  } = options;

  const {
    sunsetGold,
    terracottaRoof,
    radishRed,
    emeraldFrond,
    paperWarm,
    faintPencil,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin, annotationPencil } =
    TOKENS.strokes;

  const steamShift = round2(steppedOscillate(frameIndex, 6, 3));

  const steamWisps = lit
    ? svgEl('g', { 'data-part': 'pizza-steam', opacity: 0.78 }, [
        svgEl('path', {
          d: `M ${-10 + steamShift} -38 Q ${-14 - steamShift} -50, ${-8 + steamShift} -62`,
          fill: 'none',
          stroke: faintPencil,
          'stroke-width': annotationPencil,
          'stroke-dasharray': '4 3',
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: `M ${8 - steamShift} -42 Q ${12 + steamShift} -54, ${6 - steamShift} -66`,
          fill: 'none',
          stroke: faintPencil,
          'stroke-width': annotationPencil,
          'stroke-dasharray': '4 3',
          'stroke-linecap': 'round',
        }),
      ])
    : '';

  if (variant === 2) {
    return svgEl(
      'g',
      {
        'data-prop': 'pizza_slice',
        'data-variant': '2',
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Wooden counter crate/stand base
        crayonPath(
          'M -34 0 L -34 -32 L 34 -32 L 34 0 Z',
          getPatternFill('crayonWoodBrown'),
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Open cream pizza box lid & tray
        crayonPath(
          'M -38 -32 L 38 -32 L 32 -42 L -32 -42 Z',
          paperWarm,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        crayonPath(
          'M -32 -42 L -26 -68 L 26 -68 L 32 -42 Z',
          paperWarm,
          { strokeWidth: outlineMedium, paperUnderlay: true }
        ),
        // Warm pizza pie inside the box
        svgEl('ellipse', {
          cx: 0,
          cy: -36,
          rx: 24,
          ry: 7,
          fill: sunsetGold,
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        svgEl('ellipse', {
          cx: 0,
          cy: -36,
          rx: 19,
          ry: 5,
          fill: getPatternFill('crayonWarmMoon'),
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        svgEl('circle', { cx: -8, cy: -36, r: 2.5, fill: terracottaRoof }),
        svgEl('circle', { cx: 2, cy: -37, r: 2.5, fill: terracottaRoof }),
        svgEl('circle', { cx: 10, cy: -35, r: 2.5, fill: terracottaRoof }),
        steamWisps,
      ]
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'pizza_slice',
      'data-variant': '1',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Warm paper plate underneath
      svgEl('ellipse', {
        cx: 0,
        cy: -6,
        rx: 28,
        ry: 9,
        fill: paperWarm,
        ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
      }),
      // Puffy golden-ochre crust along the curved top edge
      crayonPath(
        'M -22 -26 Q 0 -36, 22 -26 C 25 -19, -25 -19, -22 -26 Z',
        sunsetGold,
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      // Melted golden-yellow cheese triangle with stretchy cheese drip
      crayonPath(
        'M -20 -20 Q 0 -27, 20 -20 L 2 -2 C 0 1, -2 1, -3 -2 Z',
        getPatternFill('crayonBananaYellow'),
        { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
      ),
      // Red tomato sauce rim peek
      svgEl('path', {
        d: 'M -16 -20 Q 0 -25, 16 -20',
        fill: 'none',
        stroke: radishRed,
        'stroke-width': 3.2,
        'stroke-linecap': 'round',
      }),
      // Savory pepperoni slices
      svgEl('circle', {
        cx: -7,
        cy: -15,
        r: 4.2,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 7,
        cy: -14,
        r: 4.0,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      svgEl('circle', {
        cx: 0,
        cy: -8,
        r: 3.6,
        fill: terracottaRoof,
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
      // Fresh green basil leaf
      crayonPath(
        'M -3 -12 C -1 -15, 4 -15, 3 -11 C 1 -9, -3 -10, -3 -12 Z',
        emeraldFrond,
        { strokeWidth: outlineThin }
      ),
      steamWisps,
    ]
  );
}

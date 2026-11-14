import { TOKENS, svgUrl } from '../../theme/tokens';
import type { CrayonMaterialId } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import { renderCutoutStickerHalo } from '../characters/shared';
import { renderStarShape } from './shared';
import type { PropRenderOptions } from './types';

export interface SwimFloatieRingOptions {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  tubeR?: number;
  skirtBottomY?: number;
  /** 0 = rubber ducky, 1 = candy red/white stripes, 2 = sky blue/gold stars, 3 = watermelon pink/gold, 4 = emerald/sunny dots */
  variant?: number;
  frameIndex?: number;
  layer?: 'full' | 'back' | 'front';
  /** Whether to draw the opaque ocean water-ripple skirt below the floatie (default: true when layer === 'front') */
  showWaterSkirt?: boolean;
  fillMask?: string;
}

interface FloatiePaletteSpec {
  material: CrayonMaterialId;
  accentColor: string;
  secondaryAccent: string;
}

function getFloatieSpec(variant: number): FloatiePaletteSpec {
  const {
    cloudWhite,
    bananaYellow,
    sunsetOrange,
    ochreLight,
  } = TOKENS.colors;
  const v = ((Math.round(variant) % 5) + 5) % 5;
  switch (v) {
    case 0:
      return {
        material: 'crayonBananaYellow',
        accentColor: sunsetOrange,
        secondaryAccent: cloudWhite,
      };
    case 1:
      return {
        material: 'crayonRadishRed',
        accentColor: cloudWhite,
        secondaryAccent: bananaYellow,
      };
    case 2:
      return {
        material: 'crayonCatBlue',
        accentColor: bananaYellow,
        secondaryAccent: cloudWhite,
      };
    case 3:
      return {
        material: 'crayonWatermelonPink',
        accentColor: ochreLight,
        secondaryAccent: cloudWhite,
      };
    default:
      return {
        material: 'crayonEmeraldFrond',
        accentColor: bananaYellow,
        secondaryAccent: cloudWhite,
      };
  }
}

function renderRubberDuckyHead(
  cx: number,
  cy: number,
  ox: number,
  oy: number,
  tubeR: number,
  frameIndex: number
): string {
  const {
    cutoutHaloWhite,
    charcoalOutline,
    sunsetOrange,
    cherryRose,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  // Position cute rubber ducky head on front-right rim, facing slightly inward/viewer
  const dx = round2(cx + ox * 0.68);
  const dy = round2(cy + oy * 0.12 - tubeR * 1.15);
  const s = round2(Math.max(0.68, Math.min(1.15, tubeR / 8)));
  const nod = steppedOscillate(frameIndex, 6, 4, 1);

  const headD =
    'M -10 10 C -14 4, -15 -8, -8 -14 C -1 -19, 10 -17, 13 -9 C 15 -2, 12 7, 8 11 C 3 14, -5 14, -10 10 Z';
  const beakD =
    'M -12 -5 C -21 -7, -23 -1, -19 2 C -15 5, -10 3, -9 -1 Z';

  return svgEl(
    'g',
    {
      'data-part': 'floatie-ducky-head',
      transform: svgTransform({ x: dx, y: dy, scale: s, rotate: nod }),
    },
    [
      renderCutoutStickerHalo(`${headD} ${beakD}`, 8),
      crayonPath(beakD, getPatternFill('crayonSunsetOrange'), {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
      }),
      crayonPath(headD, getPatternFill('crayonBananaYellow'), {
        stroke: charcoalOutline,
        strokeWidth: outlineMedium,
      }),
      // Cute tuft on top of ducky head
      svgEl('path', {
        d: 'M -2 -16 Q 1 -22, 5 -18 Q 7 -21, 9 -15',
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetOrange,
          strokeWidth: outlineThin,
        }),
      }),
      // Eye + catchlight + rosy cheek
      svgEl('circle', { cx: -4, cy: -5, r: 2.3, fill: charcoalOutline }),
      svgEl('circle', { cx: -4.7, cy: -5.8, r: 0.8, fill: cutoutHaloWhite }),
      svgEl('ellipse', {
        cx: 1.5,
        cy: -0.5,
        rx: 3.2,
        ry: 2.1,
        fill: cherryRose,
        opacity: 0.75,
      }),
    ]
  );
}

function renderFrontDecorations(
  cx: number,
  cy: number,
  ox: number,
  oy: number,
  ix: number,
  iy: number,
  tubeR: number,
  variant: number,
  frameIndex: number
): string[] {
  const { charcoalOutline, cloudWhite, cobaltStarBlue, sunsetGold } =
    TOKENS.colors;
  const { outlineThin } = TOKENS.strokes;
  const spec = getFloatieSpec(variant);
  const v = ((Math.round(variant) % 5) + 5) % 5;

  const midRx = (ox + ix) * 0.5;
  const midRy = (oy + iy) * 0.5;
  const bandHalfW = Math.max(2.5, (ox - ix) * 0.42);
  const items: string[] = [];

  if (v === 0) {
    // Rubber ducky wing scallops along front yellow ring + ducky head
    items.push(
      svgEl('path', {
        d: `M ${round2(cx - midRx * 0.52)} ${round2(cy + midRy * 0.78)} Q ${round2(cx - midRx * 0.25)} ${round2(cy + midRy * 1.08)}, ${round2(cx - midRx * 0.04)} ${round2(cy + midRy * 0.86)}`,
        fill: 'none',
        ...crayonStrokeAttrs({
          stroke: sunsetGold,
          strokeWidth: outlineThin + 0.6,
        }),
      }),
      renderRubberDuckyHead(cx, cy, ox, oy, tubeR, frameIndex)
    );
  } else if (v === 1 || v === 3) {
    // Cheerful curved candy-stripe bands across the front torus
    const angles = [0.42, 1.08, 1.96, 2.68];
    for (const theta of angles) {
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const x1 = round2(cx + (ix + 1.2) * cosT);
      const y1 = round2(cy + (iy + 0.8) * sinT);
      const x2 = round2(cx + (ox - 1.2) * cosT);
      const y2 = round2(cy + (oy - 0.8) * sinT);
      items.push(
        svgEl('path', {
          d: `M ${x1} ${y1} L ${x2} ${y2}`,
          fill: 'none',
          ...crayonStrokeAttrs({
            stroke: spec.accentColor,
            strokeWidth: round2(Math.max(3.2, bandHalfW * 0.85)),
          }),
        })
      );
    }
  } else if (v === 2) {
    // Sky-blue ring with 3 golden stars across the front
    const starAngles = [0.65, Math.PI * 0.5, Math.PI - 0.65];
    for (let i = 0; i < starAngles.length; i++) {
      const a = starAngles[i];
      const sx = round2(cx + midRx * Math.cos(a));
      const sy = round2(cy + midRy * Math.sin(a));
      const sr = round2(Math.max(3.6, tubeR * 0.52));
      items.push(
        crayonPath(renderStarShape(sx, sy, sr, i * 18), spec.accentColor, {
          stroke: cobaltStarBlue,
          strokeWidth: 1.2,
        })
      );
    }
  } else {
    // Emerald ring with sunny polka dots
    const dotAngles = [0.48, 1.05, 1.57, 2.09, 2.66];
    for (let i = 0; i < dotAngles.length; i++) {
      const a = dotAngles[i];
      const dx = round2(cx + midRx * Math.cos(a));
      const dy = round2(cy + midRy * Math.sin(a));
      items.push(
        svgEl('circle', {
          cx: dx,
          cy: dy,
          r: round2(Math.max(2.2, tubeR * 0.34)),
          fill: i % 2 === 0 ? spec.accentColor : spec.secondaryAccent,
        })
      );
    }
  }

  // Waxy white highlight streak along front-left curve + tiny air valve on left rim
  items.push(
    svgEl('path', {
      d: `M ${round2(cx - midRx * 0.68)} ${round2(cy + midRy * 0.58)} Q ${round2(cx - midRx * 0.25)} ${round2(cy + midRy * 0.92)}, ${round2(cx + midRx * 0.18)} ${round2(cy + midRy * 0.92)}`,
      fill: 'none',
      stroke: cloudWhite,
      'stroke-width': round2(Math.max(1.6, tubeR * 0.24)),
      'stroke-linecap': 'round',
      opacity: 0.72,
    }),
    svgEl('circle', {
      cx: round2(cx - ox * 0.82),
      cy: round2(cy + oy * 0.36),
      r: 2.1,
      fill: cloudWhite,
      ...crayonStrokeAttrs({ stroke: charcoalOutline, strokeWidth: 1.2 }),
    })
  );

  return items;
}

/**
 * Shared 2.5D swim-floatie ring builder used by BOTH:
 * - Character cutout rigs when `wearingFloatie: true` (`layer: 'back'` + `layer: 'front'`)
 * - Standalone `swim_floatie` beach prop (`layer: 'full'`)
 */
export function renderSwimFloatieRing(options: SwimFloatieRingOptions): string {
  const {
    cx = 0,
    cy = 0,
    rx = 42,
    ry = 11,
    tubeR = 8,
    skirtBottomY = 12,
    variant = 1,
    frameIndex = 0,
    layer = 'full',
    showWaterSkirt = layer === 'front',
    fillMask,
  } = options;

  const {
    charcoalOutline,
    catLightBlue,
    skyPastelBlue,
    cobaltStarBlue,
    cloudWhite,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const spec = getFloatieSpec(variant);

  const ox = round2(rx + tubeR);
  const oy = round2(ry + tubeR);
  const ix = round2(Math.max(7, rx - tubeR));
  const iy = round2(Math.max(2.5, ry - tubeR * 0.62));
  const capR = round2((ox - ix) * 0.5);
  const capRy = round2(capR * 0.65);

  if (layer === 'back') {
    const backD = `M ${round2(cx - ox)} ${cy} A ${ox} ${oy} 0 0 1 ${round2(cx + ox)} ${cy} L ${round2(cx + ix)} ${cy} A ${ix} ${iy} 0 0 0 ${round2(cx - ix)} ${cy} Z`;
    return svgEl(
      'g',
      {
        'data-part': 'floatie-back',
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        renderCutoutStickerHalo(backD, 9),
        crayonPath(backD, getPatternFill(spec.material), {
          stroke: charcoalOutline,
          strokeWidth: outlineMedium,
          mask: fillMask,
        }),
      ]
    );
  }

  if (layer === 'front') {
    const frontD = `M ${round2(cx - ox)} ${cy} A ${capR} ${capRy} 0 0 1 ${round2(cx - ix)} ${cy} A ${ix} ${iy} 0 0 0 ${round2(cx + ix)} ${cy} A ${capR} ${capRy} 0 0 1 ${round2(cx + ox)} ${cy} A ${ox} ${oy} 0 0 1 ${round2(cx - ox)} ${cy} Z`;
    const rippleShift = steppedOscillate(frameIndex, 6, 3.5, variant * 2);
    const wLeft = round2(cx - ox - 7);
    const wRight = round2(cx + ox + 7);
    const wMidL = round2(cx - ox * 0.36 + rippleShift * 0.5);
    const wMidR = round2(cx + ox * 0.36 + rippleShift * 0.5);
    const ySkirtTop = round2(cy + iy * 0.45);
    const ySkirtBot = round2(Math.max(skirtBottomY + 4, cy + oy + 10));
    const skirtD = `M ${wLeft} ${ySkirtTop} L ${wRight} ${ySkirtTop} C ${round2(wRight + 3)} ${round2((ySkirtTop + ySkirtBot) * 0.5)}, ${wRight} ${ySkirtBot}, ${wMidR} ${round2(ySkirtBot + 3)} Q ${cx} ${round2(ySkirtBot + 6)}, ${wMidL} ${round2(ySkirtBot + 3)} C ${wLeft} ${ySkirtBot}, ${round2(wLeft - 3)} ${round2((ySkirtTop + ySkirtBot) * 0.5)}, ${wLeft} ${ySkirtTop} Z`;

    const yRipple1 = round2(cy + oy + 2.5);
    const yRipple2 = round2(cy + oy + 7.5);

    const children: string[] = [];
    if (showWaterSkirt) {
      children.push(
        svgEl('g', { 'data-part': 'floatie-water-skirt' }, [
          // Solid opaque water mask hiding submerged character legs & white sticker halos
          svgEl('path', {
            d: skirtD,
            fill: skyPastelBlue,
            stroke: 'none',
          }),
          svgEl('path', {
            d: skirtD,
            fill: getPatternFill('crayonCatBlue'),
            stroke: 'none',
          }),
          // Frothy white & cobalt scalloped ocean ripples hugging the floatie
          svgEl('path', {
            d: `M ${round2(wLeft + 2 + rippleShift)} ${yRipple1} Q ${round2(cx - ox * 0.45)} ${round2(yRipple1 + 4.5)}, ${round2(cx + rippleShift * 0.4)} ${round2(yRipple1 + 1.5)} Q ${round2(cx + ox * 0.45)} ${round2(yRipple1 + 5)}, ${round2(wRight - 2 + rippleShift)} ${yRipple1}`,
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: cloudWhite,
              strokeWidth: outlineMedium + 0.8,
            }),
          }),
          svgEl('path', {
            d: `M ${round2(wLeft + 8 - rippleShift * 0.6)} ${yRipple2} Q ${round2(cx - ox * 0.3)} ${round2(yRipple2 + 3.5)}, ${round2(cx + 4)} ${round2(yRipple2 + 1)} Q ${round2(cx + ox * 0.35)} ${round2(yRipple2 + 3.5)}, ${round2(wRight - 8 - rippleShift * 0.6)} ${yRipple2}`,
            fill: 'none',
            ...crayonStrokeAttrs({
              stroke: cobaltStarBlue,
              strokeWidth: outlineThin,
            }),
          }),
          svgEl('circle', {
            cx: round2(wLeft + 6 + rippleShift * 0.5),
            cy: round2(yRipple1 - 1.5),
            r: 2.2,
            fill: catLightBlue,
          }),
        ])
      );
    }

    children.push(
      renderCutoutStickerHalo(frontD, 8),
      crayonPath(frontD, getPatternFill(spec.material), {
        stroke: charcoalOutline,
        strokeWidth: outlineMedium,
        mask: fillMask,
      }),
      ...renderFrontDecorations(
        cx,
        cy,
        ox,
        oy,
        ix,
        iy,
        tubeR,
        variant,
        frameIndex
      )
    );

    return svgEl(
      'g',
      {
        'data-part': 'floatie-front',
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      children
    );
  }

  // layer === 'full' — standalone swim_floatie prop
  const outerD = `M ${round2(cx - ox)} ${cy} A ${ox} ${oy} 0 1 0 ${round2(cx + ox)} ${cy} A ${ox} ${oy} 0 1 0 ${round2(cx - ox)} ${cy} Z`;
  const donutD = `${outerD} M ${round2(cx - ix)} ${cy} A ${ix} ${iy} 0 1 1 ${round2(cx + ix)} ${cy} A ${ix} ${iy} 0 1 1 ${round2(cx - ix)} ${cy} Z`;

  return svgEl('g', { 'data-part': 'floatie-full' }, [
    renderCutoutStickerHalo(outerD, 10),
    crayonPath(donutD, getPatternFill(spec.material), {
      stroke: charcoalOutline,
      strokeWidth: outlineMedium,
      mask: fillMask,
    }),
    // Inner rim shadow/depth line
    svgEl('path', {
      d: `M ${round2(cx - ix)} ${cy} A ${ix} ${iy} 0 0 1 ${round2(cx + ix)} ${cy}`,
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
      }),
    }),
    ...renderFrontDecorations(
      cx,
      cy,
      ox,
      oy,
      ix,
      iy,
      tubeR,
      variant,
      frameIndex
    ),
  ]);
}

/**
 * Standalone inflatable swim-ring floatie prop (`'swim_floatie'`),
 * used when friends carry floaties onto the beach or stack them on the sand!
 */
export function renderSwimFloatie(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, fillMask } = options;
  const rock = steppedOscillate(frameIndex, 8, 2.5, variant * 2);

  return svgEl(
    'g',
    {
      'data-prop': 'swim_floatie',
      'data-variant': String(variant),
      transform: svgTransform({ y: -14, rotate: rock }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      renderSwimFloatieRing({
        cx: 0,
        cy: 0,
        rx: 34,
        ry: 11,
        tubeR: 9,
        variant,
        frameIndex,
        layer: 'full',
        fillMask,
      }),
    ]
  );
}

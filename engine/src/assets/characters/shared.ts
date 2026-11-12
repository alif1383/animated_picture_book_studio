import { TOKENS } from '../../theme/tokens';
import { crayonPath, svgEl, svgTransform } from '../../engine/svgUtils';

/**
 * Shared scissors-cut white paper sticker halo underlay (`#FAF8F2`) for the
 * Meadow Party paper-cutout characters (Reference Image 5).
 */
export function renderCutoutStickerHalo(d: string, strokeWidth = 13): string {
  const { cutoutHaloWhite } = TOKENS.colors;
  return svgEl('path', {
    'data-part': 'cutout-sticker-halo',
    d,
    fill: cutoutHaloWhite,
    stroke: cutoutHaloWhite,
    'stroke-width': strokeWidth,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
}

/**
 * Renders the little girl's fluffy white sheep plushie (seen in Ref Images 2 & 4).
 */
export function renderSheepPlushie(x: number, y: number, rotate = 0): string {
  const { nightcapWhite, indigoNight, charcoalOutline } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'sheep-plushie',
      transform: svgTransform({ x, y, rotate }),
    },
    [
      // Scalloped fluffy wool cloud body
      crayonPath(
        'M -15 0 C -18 -8, -9 -15, 0 -12 C 9 -15, 18 -8, 15 0 C 18 8, 9 14, 0 11 C -9 14, -18 8, -15 0 Z',
        nightcapWhite,
        { strokeWidth: outlineMedium }
      ),
      // Dark indigo plushie head/ear on upper right (matching Ref Image 4!)
      crayonPath(
        'M 6 -10 C 10 -16, 20 -14, 19 -5 C 18 1, 10 2, 6 -4 Z',
        indigoNight,
        { strokeWidth: outlineThin }
      ),
      // Tiny white button dot on plushie ear/head
      svgEl('circle', {
        cx: 13,
        cy: -8,
        r: 1.6,
        fill: nightcapWhite,
      }),
      // Sleepy little stitched face on wool
      svgEl('path', {
        d: 'M -5 -2 Q -3 0, -1 -2 M 2 -2 Q 4 0, 6 -2 M 0 2 L 1 3',
        fill: 'none',
        stroke: charcoalOutline,
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
      }),
    ]
  );
}

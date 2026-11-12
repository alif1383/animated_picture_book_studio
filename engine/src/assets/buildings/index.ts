import { svgEl, svgTransform } from '../../engine/svgUtils';
import type { BuildingRenderOptions } from './types';
import { renderOchreCottage } from './ochreCottage';
import { renderCornerStore } from './cornerStore';

export type { BuildingRenderOptions } from './types';
export { renderOchreCottage } from './ochreCottage';
export { renderCornerStore } from './cornerStore';

/**
 * Renders a reusable architectural building cutout (`'ochre_cottage'` or `'corner_store'`)
 * with textured crayon fills, charcoal pencil outlines, and optional progressive stop-motion fill mask.
 */
export function renderBuilding(options: BuildingRenderOptions): string {
  const { id, x, y, scale, rotate, flipX, opacity, kind } = options;
  const transform = svgTransform({ x, y, scale, rotate, flipX });
  const inner =
    kind === 'ochre_cottage'
      ? renderOchreCottage(options)
      : renderCornerStore(options);

  if (!id && !transform && opacity === undefined) {
    return inner;
  }

  return svgEl('g', { id, transform: transform || undefined, opacity }, inner);
}

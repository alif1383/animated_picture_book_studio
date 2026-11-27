import { svgEl, svgTransform } from '../../engine/svgUtils';
import { CLASSIC_CEL_BUILDING_RENDERERS } from '../classicCel/buildings';
import type { BuildingRenderOptions } from './types';
import { renderOchreCottage } from './ochreCottage';
import { renderCornerStore } from './cornerStore';
import { renderRoyalCastle } from './royalCastle';
import { renderScorchedCottage } from './scorchedCottage';

export type { BuildingRenderOptions } from './types';
export { renderOchreCottage } from './ochreCottage';
export { renderCornerStore } from './cornerStore';
export { renderRoyalCastle } from './royalCastle';
export { renderScorchedCottage } from './scorchedCottage';

/**
 * Renders a reusable architectural building cutout (`'ochre_cottage' | 'corner_store' | 'royal_castle' | 'scorched_cottage'`)
 * with textured crayon fills, charcoal pencil outlines, and optional progressive stop-motion fill mask.
 */
export function renderBuilding(options: BuildingRenderOptions): string {
  const { id, x, y, scale, rotate, flipX, opacity, kind, artStyle } = options;
  const transform = svgTransform({ x, y, scale, rotate, flipX });
  let inner = '';
  const classicRenderer =
    artStyle === 'classic_cel'
      ? CLASSIC_CEL_BUILDING_RENDERERS[kind]
      : undefined;
  if (classicRenderer) {
    inner = classicRenderer(options);
  } else {
    switch (kind) {
      case 'ochre_cottage':
        inner = renderOchreCottage(options);
        break;
      case 'corner_store':
        inner = renderCornerStore(options);
        break;
      case 'royal_castle':
        inner = renderRoyalCastle(options);
        break;
      case 'scorched_cottage':
        inner = renderScorchedCottage(options);
        break;
    }
  }

  if (!id && !transform && opacity === undefined) {
    return inner;
  }

  return svgEl('g', { id, transform: transform || undefined, opacity }, inner);
}

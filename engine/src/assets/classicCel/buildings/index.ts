import type { BuildingKind } from '../../../engine/schema';
import type { BuildingRenderOptions } from '../../buildings/types';
import { renderClassicOchreCottage } from './ochreCottage';
import { renderClassicSnowyCottage } from './snowyCottage';
import { renderClassicRoyalCastle } from './royalCastle';
import { renderClassicScorchedCottage } from './scorchedCottage';

export { renderClassicOchreCottage } from './ochreCottage';
export { renderClassicSnowyCottage } from './snowyCottage';
export { renderClassicRoyalCastle } from './royalCastle';
export { renderClassicScorchedCottage } from './scorchedCottage';

/**
 * Classic 1970s–1980s Hand-Drawn Cel building renderer registry.
 * Dispatched by `renderBuilding` when `artStyle === 'classic_cel'`.
 */
export const CLASSIC_CEL_BUILDING_RENDERERS: Partial<
  Record<BuildingKind, (options: BuildingRenderOptions) => string>
> = {
  ochre_cottage: renderClassicOchreCottage,
  snowy_cottage: renderClassicSnowyCottage,
  royal_castle: renderClassicRoyalCastle,
  scorched_cottage: renderClassicScorchedCottage,
};

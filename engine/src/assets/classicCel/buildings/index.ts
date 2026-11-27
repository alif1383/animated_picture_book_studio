import type { BuildingKind } from '../../../engine/schema';
import type { BuildingRenderOptions } from '../../buildings/types';
import { renderClassicOchreCottage } from './ochreCottage';

export { renderClassicOchreCottage } from './ochreCottage';

/**
 * Classic 1970s–1980s Hand-Drawn Cel building renderer registry.
 * Dispatched by `renderBuilding` when `artStyle === 'classic_cel'`.
 */
export const CLASSIC_CEL_BUILDING_RENDERERS: Partial<
  Record<BuildingKind, (options: BuildingRenderOptions) => string>
> = {
  ochre_cottage: renderClassicOchreCottage,
};

import type { PropKind } from '../../../engine/schema';
import type { PropRenderOptions } from '../../props/types';
import { renderClassicTree } from './tree';
import { renderClassicStreetLantern } from './streetLantern';
import {
  renderClassicFluffyCloud,
  renderClassicGrassPatch,
  renderClassicMeadowFlowers,
  renderClassicMusicNotes,
  renderClassicStarCluster,
} from './ambientGardenProps';
import { renderClassicWindChimeArbor } from './windChimeArbor';
import { renderClassicGardenFountain } from './gardenFountain';

export { renderClassicTree } from './tree';
export { renderClassicStreetLantern } from './streetLantern';
export {
  renderClassicFluffyCloud,
  renderClassicStarCluster,
  renderClassicMeadowFlowers,
  renderClassicGrassPatch,
  renderClassicMusicNotes,
} from './ambientGardenProps';
export { renderClassicWindChimeArbor } from './windChimeArbor';
export { renderClassicGardenFountain } from './gardenFountain';

/**
 * Registry of Classic 1970s–80s Hand-Drawn Cel prop renderers keyed by `PropKind`.
 * Used by `src/assets/props/index.ts` when `artStyle === 'classic_cel'`.
 */
export const CLASSIC_CEL_PROP_RENDERERS: Partial<
  Record<PropKind, (options: PropRenderOptions) => string>
> = {
  tree: renderClassicTree,
  street_lantern: renderClassicStreetLantern,
  fluffy_cloud: renderClassicFluffyCloud,
  star_cluster: renderClassicStarCluster,
  meadow_flowers: renderClassicMeadowFlowers,
  grass_patch: renderClassicGrassPatch,
  music_notes: renderClassicMusicNotes,
  wind_chime_arbor: renderClassicWindChimeArbor,
  garden_fountain: renderClassicGardenFountain,
};

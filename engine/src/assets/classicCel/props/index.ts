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
import { renderClassicHearthFireplace } from './hearthFireplace';
import { renderClassicChristmasTree } from './christmasTree';
import { renderClassicVictorianDesk } from './victorianDesk';
import { renderClassicSnowyWindow } from './snowyWindow';
import { renderClassicFallingSnow } from './fallingSnow';

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
export { renderClassicHearthFireplace } from './hearthFireplace';
export { renderClassicChristmasTree } from './christmasTree';
export { renderClassicVictorianDesk } from './victorianDesk';
export { renderClassicSnowyWindow } from './snowyWindow';
export { renderClassicFallingSnow } from './fallingSnow';

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
  hearth_fireplace: renderClassicHearthFireplace,
  christmas_tree: renderClassicChristmasTree,
  victorian_desk: renderClassicVictorianDesk,
  snowy_window: renderClassicSnowyWindow,
  falling_snow: renderClassicFallingSnow,
};

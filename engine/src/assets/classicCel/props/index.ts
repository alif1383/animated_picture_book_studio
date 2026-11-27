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
import { renderClassicGardenBench } from './gardenBench';
import { renderClassicFireflyLanternJar } from './fireflyLanternJar';
import { renderClassicDogHouse } from './dogHouse';
import { renderClassicDogBowl } from './dogBowl';
import { renderClassicDogTennisBall } from './dogTennisBall';
import { renderClassicDragonCave } from './dragonCave';
import { renderClassicBrambleThorn } from './brambleThorn';
import { renderClassicDragonFire } from './dragonFire';
import { renderClassicSpookyTree } from './spookyTree';
import { renderClassicFeastTable } from './feastTable';
import { renderClassicCelebrationBanner } from './celebrationBanner';
import { renderClassicCampfire } from './campfire';
import { renderClassicChimneyPuffs } from './chimneyPuffs';
import { renderClassicAppleCrate } from './appleCrate';
import { renderClassicPartyConfetti } from './partyConfetti';

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
export { renderClassicGardenBench } from './gardenBench';
export { renderClassicFireflyLanternJar } from './fireflyLanternJar';
export { renderClassicDogHouse } from './dogHouse';
export { renderClassicDogBowl } from './dogBowl';
export { renderClassicDogTennisBall } from './dogTennisBall';
export { renderClassicDragonCave } from './dragonCave';
export { renderClassicBrambleThorn } from './brambleThorn';
export { renderClassicDragonFire } from './dragonFire';
export { renderClassicSpookyTree } from './spookyTree';
export { renderClassicFeastTable } from './feastTable';
export { renderClassicCelebrationBanner } from './celebrationBanner';
export { renderClassicCampfire } from './campfire';
export { renderClassicChimneyPuffs } from './chimneyPuffs';
export { renderClassicAppleCrate } from './appleCrate';
export { renderClassicPartyConfetti } from './partyConfetti';

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
  garden_bench: renderClassicGardenBench,
  firefly_lantern_jar: renderClassicFireflyLanternJar,
  dog_house: renderClassicDogHouse,
  dog_bowl: renderClassicDogBowl,
  dog_tennis_ball: renderClassicDogTennisBall,
  dragon_cave: renderClassicDragonCave,
  bramble_thorn: renderClassicBrambleThorn,
  dragon_fire: renderClassicDragonFire,
  spooky_tree: renderClassicSpookyTree,
  feast_table: renderClassicFeastTable,
  celebration_banner: renderClassicCelebrationBanner,
  campfire: renderClassicCampfire,
  chimney_puffs: renderClassicChimneyPuffs,
  apple_crate: renderClassicAppleCrate,
  party_confetti: renderClassicPartyConfetti,
};

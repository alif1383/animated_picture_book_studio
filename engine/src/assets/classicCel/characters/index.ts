import type { CharacterKind } from '../../../engine/schema';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderClassicMoonlitCat } from './moonlitCat';
import { renderClassicMoon } from './moon';
import { renderClassicOldBadger } from './oldBadger';
import { renderClassicRedSquirrel } from './redSquirrel';
import { renderClassicSnowRobin } from './snowRobin';
import { renderClassicBandanaDog } from './bandanaDog';
import { renderClassicSun } from './sun';
import { renderClassicKnight } from './knight';
import { renderClassicSoldier } from './soldier';
import { renderClassicDragon } from './dragon';
import { renderClassicVillager } from './villager';

export { renderClassicMoonlitCat } from './moonlitCat';
export { renderClassicMoon } from './moon';
export { renderClassicOldBadger } from './oldBadger';
export { renderClassicRedSquirrel } from './redSquirrel';
export { renderClassicSnowRobin } from './snowRobin';
export { renderClassicBandanaDog } from './bandanaDog';
export { renderClassicSun } from './sun';
export { renderClassicKnight } from './knight';
export { renderClassicSoldier } from './soldier';
export { renderClassicDragon } from './dragon';
export { renderClassicVillager } from './villager';

/**
 * Classic 1970s–1980s Hand-Drawn Cel character renderers dispatched when
 * `artStyle === 'classic_cel'`.
 */
export const CLASSIC_CEL_CHARACTER_RENDERERS: Partial<
  Record<CharacterKind, (options: CharacterRenderOptions) => string>
> = {
  moonlit_cat: renderClassicMoonlitCat,
  moon: renderClassicMoon,
  old_badger: renderClassicOldBadger,
  red_squirrel: renderClassicRedSquirrel,
  snow_robin: renderClassicSnowRobin,
  bandana_dog: renderClassicBandanaDog,
  sun: renderClassicSun,
  knight: renderClassicKnight,
  soldier: renderClassicSoldier,
  dragon: renderClassicDragon,
  villager: renderClassicVillager,
};

import type { CharacterKind } from '../../../engine/schema';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderClassicMoonlitCat } from './moonlitCat';
import { renderClassicMoon } from './moon';
import { renderClassicOldBadger } from './oldBadger';
import { renderClassicRedSquirrel } from './redSquirrel';
import { renderClassicSnowRobin } from './snowRobin';

export { renderClassicMoonlitCat } from './moonlitCat';
export { renderClassicMoon } from './moon';
export { renderClassicOldBadger } from './oldBadger';
export { renderClassicRedSquirrel } from './redSquirrel';
export { renderClassicSnowRobin } from './snowRobin';

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
};

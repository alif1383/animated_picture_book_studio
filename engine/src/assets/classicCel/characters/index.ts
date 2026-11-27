import type { CharacterKind } from '../../../engine/schema';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderClassicMoonlitCat } from './moonlitCat';
import { renderClassicMoon } from './moon';

export { renderClassicMoonlitCat } from './moonlitCat';
export { renderClassicMoon } from './moon';

/**
 * Classic 1970s–1980s Hand-Drawn Cel character renderers dispatched when
 * `artStyle === 'classic_cel'`.
 */
export const CLASSIC_CEL_CHARACTER_RENDERERS: Partial<
  Record<CharacterKind, (options: CharacterRenderOptions) => string>
> = {
  moonlit_cat: renderClassicMoonlitCat,
  moon: renderClassicMoon,
};

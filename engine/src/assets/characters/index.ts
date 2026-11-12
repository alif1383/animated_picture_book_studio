import { svgEl, svgTransform } from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';
import { renderLittleGirl } from './littleGirl';
import { renderMoon } from './moon';
import { renderSun } from './sun';
import { renderShopkeeper } from './shopkeeper';
import { renderCat } from './cat';
import { renderSingingRadish } from './singingRadish';
import { renderWatermelonSlice } from './watermelonSlice';
import { renderBluePartyCat } from './bluePartyCat';
import { renderHelloBug } from './helloBug';
import { renderPartyBanana } from './partyBanana';
import { renderCryingOnion } from './cryingOnion';
import { renderCherryTwins } from './cherryTwins';
import { renderAcornTwins } from './acornTwins';
import { renderOliveSprout } from './oliveSprout';
import { renderBirthdayStrawberry } from './birthdayStrawberry';

export type { CharacterRenderOptions } from './types';
export { renderCutoutStickerHalo, renderSheepPlushie } from './shared';
export { renderLittleGirl } from './littleGirl';
export { renderMoon } from './moon';
export { renderSun } from './sun';
export { renderShopkeeper } from './shopkeeper';
export { renderCat } from './cat';
export { renderSingingRadish } from './singingRadish';
export { renderWatermelonSlice } from './watermelonSlice';
export { renderBluePartyCat } from './bluePartyCat';
export { renderHelloBug } from './helloBug';
export { renderPartyBanana } from './partyBanana';
export { renderCryingOnion } from './cryingOnion';
export { renderCherryTwins } from './cherryTwins';
export { renderAcornTwins } from './acornTwins';
export { renderOliveSprout } from './oliveSprout';
export { renderBirthdayStrawberry } from './birthdayStrawberry';

/**
 * Renders any 2D cutout character rig quantized to the stepped stop-motion frame index.
 */
export function renderCharacter(options: CharacterRenderOptions): string {
  const { id, x, y, scale, rotate, flipX, opacity, kind } = options;
  const transform = svgTransform({ x, y, scale, rotate, flipX });

  let inner = '';
  switch (kind) {
    case 'little_girl':
      inner = renderLittleGirl(options);
      break;
    case 'moon':
      inner = renderMoon(options);
      break;
    case 'sun':
      inner = renderSun(options);
      break;
    case 'shopkeeper':
      inner = renderShopkeeper(options);
      break;
    case 'cat':
      inner = renderCat(options);
      break;
    case 'singing_radish':
      inner = renderSingingRadish(options);
      break;
    case 'watermelon_slice':
      inner = renderWatermelonSlice(options);
      break;
    case 'blue_party_cat':
      inner = renderBluePartyCat(options);
      break;
    case 'hello_bug':
      inner = renderHelloBug(options);
      break;
    case 'party_banana':
      inner = renderPartyBanana(options);
      break;
    case 'crying_onion':
      inner = renderCryingOnion(options);
      break;
    case 'cherry_twins':
      inner = renderCherryTwins(options);
      break;
    case 'acorn_twins':
      inner = renderAcornTwins(options);
      break;
    case 'olive_sprout':
      inner = renderOliveSprout(options);
      break;
    case 'birthday_strawberry':
      inner = renderBirthdayStrawberry(options);
      break;
  }

  if (!id && !transform && opacity === undefined) {
    return inner;
  }

  return svgEl('g', { id, transform: transform || undefined, opacity }, inner);
}

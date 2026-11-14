import { svgEl, svgTransform } from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';
import { renderGrassPatch } from './grassPatch';
import { renderTree } from './tree';
import { renderMusicNotes } from './musicNotes';
import { renderStarCluster } from './starCluster';
import { renderPencilNumbers } from './pencilNumbers';
import { renderAppleCrate } from './appleCrate';
import { renderStreetLantern } from './streetLantern';
import { renderChimneyPuffs } from './chimneyPuffs';
import { renderBicycle } from './bicycle';
import { renderFluffyCloud } from './fluffyCloud';
import { renderMeadowFlowers } from './meadowFlowers';
import { renderBirthdayCake } from './birthdayCake';
import { renderPartyConfetti } from './partyConfetti';
import { renderBeachUmbrella } from './beachUmbrella';
import { renderOceanWaves } from './oceanWaves';
import { renderWaterSplash } from './waterSplash';
import { renderSwimFloatie } from './swimFloatie';
import { renderBeachBall } from './beachBall';

export type { PropRenderOptions } from './types';
export { renderStarShape } from './shared';
export { renderGrassPatch } from './grassPatch';
export { renderTree } from './tree';
export { renderMusicNotes } from './musicNotes';
export { renderStarCluster } from './starCluster';
export { renderPencilNumbers } from './pencilNumbers';
export { renderAppleCrate } from './appleCrate';
export { renderStreetLantern } from './streetLantern';
export { renderChimneyPuffs } from './chimneyPuffs';
export { renderBicycle } from './bicycle';
export { renderFluffyCloud } from './fluffyCloud';
export { renderMeadowFlowers } from './meadowFlowers';
export { renderBirthdayCake } from './birthdayCake';
export { renderPartyConfetti } from './partyConfetti';
export { renderBeachUmbrella } from './beachUmbrella';
export { renderOceanWaves } from './oceanWaves';
export { renderWaterSplash } from './waterSplash';
export { renderSwimFloatie, renderSwimFloatieRing } from './swimFloatie';
export type { SwimFloatieRingOptions } from './swimFloatie';
export { renderBeachBall } from './beachBall';

/**
 * Renders any reusable prop (`'grass_patch' | 'tree' | 'music_notes' | 'star_cluster' |
 * 'pencil_numbers' | 'apple_crate' | 'street_lantern' | 'chimney_puffs' | 'bicycle' |
 * 'fluffy_cloud' | 'meadow_flowers' | 'birthday_cake' | 'party_confetti'`).
 */
export function renderProp(options: PropRenderOptions): string {
  const { id, x, y, scale, rotate, flipX, opacity, kind } = options;

  let inner = '';
  switch (kind) {
    case 'grass_patch':
      inner = renderGrassPatch(options);
      break;
    case 'tree':
      inner = renderTree(options);
      break;
    case 'music_notes':
      inner = renderMusicNotes(options);
      break;
    case 'star_cluster':
      inner = renderStarCluster(options);
      break;
    case 'pencil_numbers':
      inner = renderPencilNumbers(options);
      break;
    case 'apple_crate':
      inner = renderAppleCrate(options);
      break;
    case 'street_lantern':
      inner = renderStreetLantern(options);
      break;
    case 'chimney_puffs':
      inner = renderChimneyPuffs(options);
      break;
    case 'bicycle':
      inner = renderBicycle();
      break;
    case 'fluffy_cloud':
      inner = renderFluffyCloud(options);
      break;
    case 'meadow_flowers':
      inner = renderMeadowFlowers();
      break;
    case 'birthday_cake':
      inner = renderBirthdayCake(options);
      break;
    case 'party_confetti':
      inner = renderPartyConfetti(options);
      break;
    case 'beach_umbrella':
      inner = renderBeachUmbrella(options);
      break;
    case 'ocean_waves':
      inner = renderOceanWaves(options);
      break;
    case 'water_splash':
      inner = renderWaterSplash(options);
      break;
    case 'swim_floatie':
      inner = renderSwimFloatie(options);
      break;
    case 'beach_ball':
      inner = renderBeachBall(options);
      break;
  }

  const transform = svgTransform({ x, y, scale, rotate, flipX });
  if (!id && !transform && opacity === undefined) {
    return inner;
  }
  return svgEl('g', { id, transform: transform || undefined, opacity }, inner);
}

import { MEDIEVAL_FANTASY_BGM_CLIP } from './medievalFantasyBgm.mjs';
import { CAMPFIRE_CRACKLE_CLIP } from './campfireCrackle.mjs';
import { DRAGON_FIRE_BREATH_CLIP } from './dragonFireBreath.mjs';
import { SPEAR_TOOTH_POP_CLIP } from './spearToothPop.mjs';
import { HORSE_TROT_CLIP } from './horseTrot.mjs';

export * from './shared.mjs';
export * from './medievalFantasyBgm.mjs';
export * from './campfireCrackle.mjs';
export * from './dragonFireBreath.mjs';
export * from './spearToothPop.mjs';
export * from './horseTrot.mjs';

export const WAV_SFX_MODULES = [
  MEDIEVAL_FANTASY_BGM_CLIP,
  CAMPFIRE_CRACKLE_CLIP,
  DRAGON_FIRE_BREATH_CLIP,
  SPEAR_TOOTH_POP_CLIP,
  HORSE_TROT_CLIP,
];

export const WAV_SFX_REGISTRY = Object.fromEntries(
  WAV_SFX_MODULES.map((m) => [m.id, m])
);

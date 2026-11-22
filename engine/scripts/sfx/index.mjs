import { MEDIEVAL_FANTASY_BGM_CLIP } from './medievalFantasyBgm.mjs';
import { CAMPFIRE_CRACKLE_CLIP } from './campfireCrackle.mjs';
import { DRAGON_FIRE_BREATH_CLIP } from './dragonFireBreath.mjs';
import { SPEAR_TOOTH_POP_CLIP } from './spearToothPop.mjs';
import { HORSE_TROT_CLIP } from './horseTrot.mjs';
import { MOONLIT_CAT_LULLABY_BGM_CLIP } from './moonlitCatLullabyBgm.mjs';
import { BANDANA_DOG_BGM_CLIP } from './bandanaDogBgm.mjs';
import { BANDANA_DOG_PLAYFUL_BARK_CLIP } from './bandanaDogPlayfulBark.mjs';
import { KNIGHT_HICCUPS_BGM } from './knightHiccupsBgm.mjs';
import { KNIGHT_HICCUPS_THORN_POP } from './knightHiccupsThornPop.mjs';

export * from './shared.mjs';
export * from './medievalFantasyBgm.mjs';
export * from './campfireCrackle.mjs';
export * from './dragonFireBreath.mjs';
export * from './spearToothPop.mjs';
export * from './horseTrot.mjs';
export * from './moonlitCatLullabyBgm.mjs';
export * from './bandanaDogBgm.mjs';
export * from './bandanaDogPlayfulBark.mjs';
export * from './knightHiccupsBgm.mjs';
export * from './knightHiccupsThornPop.mjs';

export const WAV_SFX_MODULES = [
  MEDIEVAL_FANTASY_BGM_CLIP,
  CAMPFIRE_CRACKLE_CLIP,
  DRAGON_FIRE_BREATH_CLIP,
  SPEAR_TOOTH_POP_CLIP,
  HORSE_TROT_CLIP,
  MOONLIT_CAT_LULLABY_BGM_CLIP,
  BANDANA_DOG_BGM_CLIP,
  BANDANA_DOG_PLAYFUL_BARK_CLIP,
  KNIGHT_HICCUPS_BGM,
  KNIGHT_HICCUPS_THORN_POP,
];

export const WAV_SFX_REGISTRY = Object.fromEntries(
  WAV_SFX_MODULES.map((m) => [m.id, m])
);

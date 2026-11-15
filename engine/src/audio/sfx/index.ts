import type { AudioCueKind } from '../../engine/schema';
import type { AudioClipCatalogEntry, ProceduralSfxModule } from './types';
import { LULLABY_SFX } from './lullaby';
import { CHIME_SFX } from './chime';
import { CRAYON_SCRIBBLE_SFX } from './crayonScribble';
import { BIRTHDAY_SONG_SFX } from './birthdaySong';
import { PARTY_HORN_SFX } from './partyHorn';
import { CONFETTI_POP_SFX } from './confettiPop';
import { CANDLE_BLOW_SFX } from './candleBlow';
import { CHEER_APPLAUSE_SFX } from './cheerApplause';
import { GIGGLE_SFX } from './giggle';
import { OCEAN_WAVE_SFX } from './oceanWave';
import { WATER_SPLASH_SFX } from './waterSplash';
import { FLOATIE_SQUEAK_SFX } from './floatieSqueak';
import { FIRE_CRACKLE_SFX } from './fireCrackle';
import { DRAGON_FIRE_SFX } from './dragonFire';
import { SPEAR_CLINK_SFX } from './spearClink';
import { MEDIEVAL_LUTE_SFX } from './medievalLute';

export * from './types';
export * from './shared';

export const PROCEDURAL_SFX_MODULES: readonly ProceduralSfxModule[] = [
  LULLABY_SFX,
  CHIME_SFX,
  CRAYON_SCRIBBLE_SFX,
  BIRTHDAY_SONG_SFX,
  PARTY_HORN_SFX,
  CONFETTI_POP_SFX,
  CANDLE_BLOW_SFX,
  CHEER_APPLAUSE_SFX,
  GIGGLE_SFX,
  OCEAN_WAVE_SFX,
  WATER_SPLASH_SFX,
  FLOATIE_SQUEAK_SFX,
  FIRE_CRACKLE_SFX,
  DRAGON_FIRE_SFX,
  SPEAR_CLINK_SFX,
  MEDIEVAL_LUTE_SFX,
] as const;

export const PROCEDURAL_SFX_REGISTRY: Record<AudioCueKind, ProceduralSfxModule> = {
  lullaby: LULLABY_SFX,
  chime: CHIME_SFX,
  crayon_scribble: CRAYON_SCRIBBLE_SFX,
  birthday_song: BIRTHDAY_SONG_SFX,
  party_horn: PARTY_HORN_SFX,
  confetti_pop: CONFETTI_POP_SFX,
  candle_blow: CANDLE_BLOW_SFX,
  cheer_applause: CHEER_APPLAUSE_SFX,
  giggle: GIGGLE_SFX,
  ocean_wave: OCEAN_WAVE_SFX,
  water_splash: WATER_SPLASH_SFX,
  floatie_squeak: FLOATIE_SQUEAK_SFX,
  fire_crackle: FIRE_CRACKLE_SFX,
  dragon_fire: DRAGON_FIRE_SFX,
  spear_clink: SPEAR_CLINK_SFX,
  medieval_lute: MEDIEVAL_LUTE_SFX,
};

export const AUDIO_CLIP_CATALOG: readonly AudioClipCatalogEntry[] = [
  {
    id: 'medieval-fantasy-bgm',
    filename: 'medieval-fantasy-bgm.wav',
    src: '/audio/medieval-fantasy-bgm.wav',
    title: 'Medieval Fantasy Lute, Recorder & Horn Score',
    category: 'bgm',
    durationSec: 64.0,
    defaultVolume: 0.55,
    description:
      '5-section medieval fantasy background score featuring Karplus-Strong plucked lute/harp, wooden recorder melody, castle brass fanfare, and soft tabor drum.',
    themes: ['medieval', 'fantasy', 'castle', 'knight', 'dragon', 'quest', 'adventure', 'village'],
    generatorModule: 'scripts/sfx/medievalFantasyBgm.mjs',
  },
  {
    id: 'campfire-crackle',
    filename: 'campfire-crackle.wav',
    src: '/audio/campfire-crackle.wav',
    title: 'Woodland Campfire Crackle & Roasting Spit Sizzle',
    category: 'ambient',
    durationSec: 9.0,
    defaultVolume: 0.72,
    description:
      'Cozy two-pole lowpass ember draft rumble layered with roasting meat spit high-mid sizzle and 68 stochastic wood-snap crackles and ember pops.',
    themes: ['camping', 'forest', 'nighttime', 'medieval', 'hearth', 'cooking', 'cozy'],
    generatorModule: 'scripts/sfx/campfireCrackle.mjs',
  },
  {
    id: 'dragon-fire-breath',
    filename: 'dragon-fire-breath.wav',
    src: '/audio/dragon-fire-breath.wav',
    title: 'Dragon Throat Growl & Roaring Flame Breath',
    category: 'sfx',
    durationSec: 2.8,
    defaultVolume: 0.78,
    description:
      'Deep chest-vibrato dragon throat growl (72-108 Hz) combined with a state-variable sweeping bandpass flame whoosh and crackling fire tail.',
    themes: ['dragon', 'medieval', 'fantasy', 'fire', 'monster', 'magic', 'action'],
    generatorModule: 'scripts/sfx/dragonFireBreath.mjs',
  },
  {
    id: 'spear-tooth-pop',
    filename: 'spear-tooth-pop.wav',
    src: '/audio/spear-tooth-pop.wav',
    title: 'Spear Tooth-Clink, Lever Creak, Cork Pop & Relief Chimes',
    category: 'sfx',
    durationSec: 1.6,
    defaultVolume: 0.9,
    description:
      '4-stage narrative SFX: metallic/wooden spear clink impacts, upward tension lever creak, comical resonant cork POP, and ascending D-major relief chime arpeggio.',
    themes: ['medieval', 'knight', 'dragon', 'tooth_fix', 'comedy_pop', 'relief', 'quest'],
    generatorModule: 'scripts/sfx/spearToothPop.mjs',
  },
  {
    id: 'horse-trot',
    filename: 'horse-trot.wav',
    src: '/audio/horse-trot.wav',
    title: 'Cavalry Horse Hooves Clip-Clop & Bridle Jingle',
    category: 'foley',
    durationSec: 4.0,
    defaultVolume: 0.62,
    description:
      'Rhythmic coconut-shell and dirt-path clip-clop hoof strikes for lead steed and accompanying cavalry with subtle metallic bridle jingles.',
    themes: ['medieval', 'horse', 'knight', 'travel', 'march', 'countryside', 'village'],
    generatorModule: 'scripts/sfx/horseTrot.mjs',
  },
] as const;

import type { ProceduralSfxModule } from './types';

export const BIRTHDAY_SONG_SFX: ProceduralSfxModule = {
  kind: 'birthday_song',
  title: 'Toy Glockenspiel Birthday Melody Note',
  category: 'musical_cue',
  description:
    'Bright toy glockenspiel triangle note layered with a warm sub-octave sine accompaniment for festive sing-along melodies.',
  themes: ['birthday', 'celebration', 'party', 'singing', 'friendship', 'festival'],
  defaultFreqHz: 392,
  defaultDurationSec: 0.42,
  synthesize(ctx, freq, duration, startTime, helpers) {
    helpers.synthesizeMusicBoxNote(
      ctx,
      freq,
      duration,
      'triangle',
      3,
      0.25,
      startTime
    );
    helpers.synthesizeMusicBoxNote(
      ctx,
      freq * 0.5,
      duration * 0.85,
      'sine',
      2,
      0.11,
      startTime
    );
  },
};

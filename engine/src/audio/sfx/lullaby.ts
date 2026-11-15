import type { ProceduralSfxModule } from './types';

export const LULLABY_SFX: ProceduralSfxModule = {
  kind: 'lullaby',
  title: 'Music-Box Lullaby Note',
  category: 'musical_cue',
  description:
    'Warm triangle-wave music-box pluck with a soft 2x sine octave overtone and gentle exponential decay.',
  themes: ['bedtime', 'nighttime', 'lullaby', 'storybook_closing', 'dreamy', 'gentle'],
  defaultFreqHz: 523.25,
  defaultDurationSec: 0.45,
  synthesize(ctx, freq, duration, startTime, helpers) {
    helpers.synthesizeMusicBoxNote(
      ctx,
      freq,
      duration,
      'triangle',
      2,
      0.22,
      startTime
    );
  },
};

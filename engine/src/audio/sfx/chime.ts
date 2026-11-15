import type { ProceduralSfxModule } from './types';

export const CHIME_SFX: ProceduralSfxModule = {
  kind: 'chime',
  title: 'Sparkling Star Chime',
  category: 'musical_cue',
  description:
    'Crystalline sine bell tone with a bright 3x twelfth harmonic overtone for twinkling stars, magic moments, and storybook openings.',
  themes: ['magic', 'starlight', 'wonder', 'storybook_opening', 'discovery', 'bedtime'],
  defaultFreqHz: 880,
  defaultDurationSec: 0.55,
  synthesize(ctx, freq, duration, startTime, helpers) {
    helpers.synthesizeMusicBoxNote(
      ctx,
      freq,
      duration,
      'sine',
      3,
      0.18,
      startTime
    );
  },
};

import type { ProceduralSfxModule } from './types';

export const MEDIEVAL_LUTE_SFX: ProceduralSfxModule = {
  kind: 'medieval_lute',
  title: 'Plucked Medieval Lute / Harp String',
  category: 'musical_cue',
  description:
    'Warm plucked triangle-wave lute string paired with a resonant sub-octave sine harmonic for medieval bard melodies and courtly fanfares.',
  themes: ['medieval', 'fantasy', 'castle', 'knight', 'village', 'bard', 'quest'],
  defaultFreqHz: 293.66,
  defaultDurationSec: 0.48,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.15, duration);
    helpers.synthesizeMusicBoxNote(ctx, freq, dur, 'triangle', 2, 0.22, now);
    helpers.synthesizeMusicBoxNote(
      ctx,
      freq * 0.5,
      dur * 0.9,
      'sine',
      3,
      0.1,
      now
    );
  },
};

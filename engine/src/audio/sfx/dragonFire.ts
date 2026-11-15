import type { ProceduralSfxModule } from './types';

export const DRAGON_FIRE_SFX: ProceduralSfxModule = {
  kind: 'dragon_fire',
  title: 'Dragon Flame Breath Whoosh & Throat Rumble',
  category: 'fantasy',
  description:
    'Sweeping resonant bandpass flame billow combined with a deep downward sawtooth dragon throat rumble.',
  themes: ['dragon', 'medieval', 'fantasy', 'adventure', 'fire', 'magic'],
  defaultFreqHz: 180,
  defaultDurationSec: 0.95,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.25, duration);
    const base = Math.max(95, Math.min(360, freq));
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur,
      startTime: now,
      filterType: 'bandpass',
      startFreq: base * 1.6,
      peakFreq: { freq: base * 3.4, atRatio: 0.35 },
      endFreq: base * 0.95,
      q: 1.15,
      peakGain: 0.25,
      attackSec: dur * 0.18,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
    helpers.schedulePitchBlip(
      ctx,
      'sawtooth',
      base * 0.72,
      base * 0.48,
      dur * 0.85,
      0.12,
      now
    );
  },
};

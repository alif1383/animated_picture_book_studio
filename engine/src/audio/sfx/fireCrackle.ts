import type { ProceduralSfxModule } from './types';

export const FIRE_CRACKLE_SFX: ProceduralSfxModule = {
  kind: 'fire_crackle',
  title: 'Campfire Crackling Embers & Spit Sizzle',
  category: 'nature',
  description:
    'Warm lowpass ember rumble layered with four crisp bandpass wood-snap crackles and roasting sizzle pops.',
  themes: ['camping', 'forest', 'nighttime', 'medieval', 'hearth', 'cozy', 'cooking'],
  defaultFreqHz: 320,
  defaultDurationSec: 0.85,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.2, duration);
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur,
      startTime: now,
      filterType: 'lowpass',
      startFreq: Math.max(180, freq * 0.65),
      endFreq: Math.max(140, freq * 0.45),
      q: 0.9,
      peakGain: 0.14,
      attackSec: dur * 0.2,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
    const snapCount = 4;
    for (let i = 0; i < snapCount; i++) {
      const snapTime = now + (i + 0.35) * (dur / (snapCount + 0.5));
      helpers.scheduleFilteredNoise(ctx, {
        duration: 0.045,
        startTime: snapTime,
        filterType: 'bandpass',
        startFreq: 1400 + (i % 3) * 450,
        q: 2.6,
        peakGain: 0.18,
        attackSec: 0.005,
      });
    }
  },
};

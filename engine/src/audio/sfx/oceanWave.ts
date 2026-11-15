import type { ProceduralSfxModule } from './types';

export const OCEAN_WAVE_SFX: ProceduralSfxModule = {
  kind: 'ocean_wave',
  title: 'Rolling Ocean Surf Swell',
  category: 'nature',
  description:
    'Warm lowpass surf body swelling up to a frothy bandpass shoreline crest and receding gently onto the sand.',
  themes: ['beach', 'ocean', 'summer', 'island', 'nature', 'relaxing'],
  defaultFreqHz: 240,
  defaultDurationSec: 1.4,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const dur = Math.max(0.25, duration);
    const base = Math.max(120, Math.min(600, freq));
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur,
      startTime,
      filterType: 'lowpass',
      startFreq: base * 0.55,
      peakFreq: { freq: base * 2.1, atRatio: 0.45 },
      endFreq: base * 0.48,
      q: 1.0,
      peakGain: 0.19,
      attackSec: dur * 0.42,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur * 0.65,
      startTime: startTime + dur * 0.2,
      filterType: 'bandpass',
      startFreq: 950,
      endFreq: 480,
      q: 1.3,
      peakGain: 0.06,
      attackSec: dur * 0.22,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
  },
};

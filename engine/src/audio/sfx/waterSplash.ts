import type { ProceduralSfxModule } from './types';

export const WATER_SPLASH_SFX: ProceduralSfxModule = {
  kind: 'water_splash',
  title: 'Bubbly Water Splash & Droplets',
  category: 'nature',
  description:
    'Crisp bandpass splash spray burst followed by four bubbly upward-popping sine water-droplet blips.',
  themes: ['beach', 'swimming', 'pool', 'ocean', 'water_play', 'summer'],
  defaultFreqHz: 460,
  defaultDurationSec: 0.36,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.16, duration);
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur * 0.78,
      startTime: now,
      filterType: 'bandpass',
      startFreq: Math.max(780, freq * 1.9),
      endFreq: Math.max(240, freq * 0.58),
      q: 1.35,
      peakGain: 0.22,
      attackSec: 0.015,
      envelope: (i, count) => Math.pow(1 - i / count, 0.7),
    });

    const bubbleRatios = [0.78, 1.0, 1.24, 1.48];
    const blipDur = Math.max(0.045, Math.min(0.095, dur * 0.24));
    for (let i = 0; i < bubbleRatios.length; i++) {
      const bStart = now + 0.02 + i * Math.min(0.065, dur * 0.15);
      const bFreq = Math.max(260, freq * bubbleRatios[i]);
      helpers.schedulePitchBlip(
        ctx,
        'sine',
        bFreq * 0.75,
        bFreq * 1.62,
        blipDur,
        0.13,
        bStart
      );
    }
  },
};

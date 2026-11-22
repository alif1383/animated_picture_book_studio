import type { ProceduralSfxModule } from './types';

export const DRAGON_HICCUP_SFX: ProceduralSfxModule = {
  kind: 'dragon_hiccup',
  title: 'Dragon Fiery Hiccup',
  category: 'fantasy',
  description:
    'Comic glottal upward hiccup chirp layered with a soft low dragon tummy-bounce thump and a crisp fiery spark-and-smoke bandpass puff.',
  themes: ['dragon', 'medieval', 'comedy', 'fantasy', 'fairy-tale'],
  defaultFreqHz: 190,
  defaultDurationSec: 0.42,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.2, duration);
    const base = Math.max(100, Math.min(360, freq));

    // 1. Glottal "HIC!" upward chirp (0.00s..0.075s)
    helpers.schedulePitchBlip(
      ctx,
      'triangle',
      base * 0.85,
      base * 2.95,
      0.075,
      0.22,
      now
    );
    helpers.schedulePitchBlip(
      ctx,
      'sine',
      base * 0.85,
      base * 2.95,
      0.075,
      0.12,
      now
    );

    // 2. Comedic belly-bounce thump (0.04s..0.14s)
    helpers.schedulePitchBlip(
      ctx,
      'sine',
      base * 0.65,
      base * 0.38,
      0.1,
      0.19,
      now + 0.04
    );

    // 3. Tiny fiery smoke & spark puff (0.07s..dur)
    const puffDur = Math.max(0.12, dur - 0.07);
    helpers.scheduleFilteredNoise(ctx, {
      duration: puffDur,
      startTime: now + 0.07,
      filterType: 'bandpass',
      startFreq: base * 2.0,
      peakFreq: { freq: base * 4.8, atRatio: 0.28 },
      endFreq: base * 1.4,
      q: 1.5,
      peakGain: 0.22,
      attackSec: 0.02,
      envelope: (i, count, sr) =>
        Math.sin((i / count) * Math.PI) *
        (0.8 + 0.2 * Math.sin((i / sr) * Math.PI * 56)),
    });
  },
};

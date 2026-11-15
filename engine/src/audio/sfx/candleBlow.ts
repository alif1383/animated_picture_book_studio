import type { ProceduralSfxModule } from './types';

export const CANDLE_BLOW_SFX: ProceduralSfxModule = {
  kind: 'candle_blow',
  title: 'Gentle Candle Blow / Wind Puff',
  category: 'foley',
  description:
    'Soft breathy wind whoosh with a downward bandpass frequency sweep and sine-windowed breath envelope for blowing out candles or gentle breezes.',
  themes: ['birthday', 'wish', 'wind', 'breeze', 'sigh_of_relief'],
  defaultFreqHz: 420,
  defaultDurationSec: 0.55,
  synthesize(ctx, centerFreq, duration, startTime, helpers) {
    helpers.scheduleFilteredNoise(ctx, {
      duration,
      startTime,
      filterType: 'bandpass',
      startFreq: Math.max(320, centerFreq * 1.4),
      endFreq: Math.max(160, centerFreq * 0.45),
      q: 1.8,
      peakGain: 0.22,
      attackSec: duration * 0.22,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
  },
};

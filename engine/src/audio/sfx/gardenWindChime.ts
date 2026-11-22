import type { ProceduralSfxModule } from './types';

export const GARDEN_WIND_CHIME_SFX: ProceduralSfxModule = {
  kind: 'garden_wind_chime' as const,
  title: 'Moonlit Garden Wind-Chime Cascade',
  category: 'nature',
  description:
    'Shimmering four-bell pentatonic garden wind-chime cascade (1.0x, 1.122x, 1.335x, 1.498x) with delicate 2.76x metallic bell overtones and a whisper-soft night breeze rustle.',
  themes: ['bedtime', 'lullaby', 'garden', 'magic', 'night', 'nature'],
  defaultFreqHz: 1046.5,
  defaultDurationSec: 1.1,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const baseFreq = Math.max(392, Math.min(2637, freq || 1046.5));
    const dur = Math.max(0.45, duration);

    // Whisper-soft night breeze rustle passing through the garden leaves
    helpers.scheduleFilteredNoise(ctx, {
      duration: dur * 0.85,
      startTime,
      filterType: 'bandpass',
      startFreq: 680,
      peakFreq: { freq: 1450, atRatio: 0.35 },
      endFreq: 520,
      q: 2.2,
      peakGain: 0.045,
      attackSec: Math.min(0.18, dur * 0.25),
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });

    // Four staggered crystalline pentatonic bell tones with 2.76x metallic bell overtone
    const bellTones = [
      { ratio: 1.0, offset: 0.0, gain: 0.14 },
      { ratio: 1.122, offset: 0.07, gain: 0.125 },
      { ratio: 1.335, offset: 0.15, gain: 0.115 },
      { ratio: 1.498, offset: 0.24, gain: 0.105 },
    ] as const;

    for (const bell of bellTones) {
      const noteStart = startTime + bell.offset;
      const noteDur = Math.max(0.32, dur - bell.offset);
      helpers.synthesizeMusicBoxNote(
        ctx,
        baseFreq * bell.ratio,
        noteDur,
        'sine',
        2.76,
        bell.gain,
        noteStart
      );
    }
  },
};
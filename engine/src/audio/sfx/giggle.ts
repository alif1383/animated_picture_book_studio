import type { ProceduralSfxModule } from './types';

export const GIGGLE_SFX: ProceduralSfxModule = {
  kind: 'giggle',
  title: 'Cute Two-Note Character Giggle',
  category: 'character',
  description:
    'Playful two-note upward pitch hop ("hee-hee!") on a triangle oscillator for cheerful cutout character reactions and jokes.',
  themes: ['comedy', 'happy', 'friendship', 'playful', 'children', 'relief'],
  defaultFreqHz: 540,
  defaultDurationSec: 0.28,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const half = duration * 0.48;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.26, now + half * 0.8);
    osc.frequency.setValueAtTime(freq * 1.12, now + half);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 1.42,
      now + duration * 0.95
    );

    const gain = ctx.createGain();
    const scaledPeak = 0.19 * helpers.masterVolume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    helpers.connectOutput(ctx, gain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  },
};

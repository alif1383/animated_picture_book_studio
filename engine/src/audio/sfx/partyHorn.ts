import type { ProceduralSfxModule } from './types';

export const PARTY_HORN_SFX: ProceduralSfxModule = {
  kind: 'party_horn',
  title: 'Paper Party Blower / Kazoo Horn',
  category: 'party',
  description:
    'Playful paper party horn ("toot-toot!") using a pitch-sliding sawtooth oscillator routed through a resonant bandpass filter.',
  themes: ['birthday', 'party', 'celebration', 'fanfare', 'comedy', 'finale'],
  defaultFreqHz: 440,
  defaultDurationSec: 0.38,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.78, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.18, now + duration * 0.35);
    osc.frequency.setValueAtTime(freq * 1.12, now + duration * 0.7);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.1, now);
    filter.Q.setValueAtTime(3.2, now);

    const gain = ctx.createGain();
    const scaledPeak = 0.2 * helpers.masterVolume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    helpers.connectOutput(ctx, gain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  },
};

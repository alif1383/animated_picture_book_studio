import type { ProceduralSfxModule } from './types';

export const FLOATIE_SQUEAK_SFX: ProceduralSfxModule = {
  kind: 'floatie_squeak',
  title: 'Inflatable Floatie / Rubber-Ducky Squeak',
  category: 'foley',
  description:
    'Playful two-chirp vinyl pitch bend ("squeak-squeak!") routed through a resonant bandpass filter for pool floaties and squeaky toys.',
  themes: ['beach', 'summer', 'toy', 'comedy', 'water_play', 'children'],
  defaultFreqHz: 780,
  defaultDurationSec: 0.26,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.14, duration);
    const nyquistSafe = Math.max(400, ctx.sampleRate * 0.45);
    const base = Math.min(nyquistSafe * 0.55, Math.max(580, freq));
    const chirpDur = dur * 0.42;
    const chirp2Start = now + dur * 0.52;

    const scheduleChirp = (tStart: number, pitchScale: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const f0 = base * pitchScale;
      osc.frequency.setValueAtTime(f0, tStart);
      osc.frequency.exponentialRampToValueAtTime(
        Math.min(nyquistSafe, f0 * 1.48),
        tStart + chirpDur * 0.55
      );
      osc.frequency.exponentialRampToValueAtTime(
        Math.min(nyquistSafe, f0 * 1.12),
        tStart + chirpDur
      );

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(
        Math.min(nyquistSafe, f0 * 1.45),
        tStart
      );
      filter.Q.setValueAtTime(2.8, tStart);

      const gain = ctx.createGain();
      const scaledPeak = Math.max(0.0002, 0.2 * helpers.masterVolume);
      gain.gain.setValueAtTime(0.0001, tStart);
      gain.gain.linearRampToValueAtTime(
        scaledPeak,
        tStart + Math.min(0.015, chirpDur * 0.3)
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, tStart + chirpDur);

      osc.connect(filter);
      filter.connect(gain);
      helpers.connectOutput(ctx, gain);

      osc.start(tStart);
      osc.stop(tStart + chirpDur + 0.015);
    };

    scheduleChirp(now, 1.0);
    scheduleChirp(chirp2Start, 1.12);
  },
};

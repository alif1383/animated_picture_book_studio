import type { ProceduralSfxModule } from './types';

export const PLAYFUL_BARK_SFX: ProceduralSfxModule = {
  kind: 'playful_bark',
  title: 'Playful Puppy Bark',
  category: 'character',
  description:
    'Cheerful double cartoon puppy bark ("Arf! Arf!") layering pitch-swept sawtooth and triangle vocal cords (0.85x -> 1.48x -> 0.72x) through a warm nasal formant bandpass filter (~950 Hz, Q = 2.6) with a snappy breathy noise puff (1400 -> 700 Hz) per yip.',
  themes: [
    'dog',
    'pet',
    'playful',
    'backyard',
    'park',
    'comedy',
    'happy',
    'children',
  ],
  defaultFreqHz: 360.0,
  defaultDurationSec: 0.42,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.24, duration);
    const nyquistSafe = Math.max(400, ctx.sampleRate * 0.45);
    const clampFreq = (f: number) => Math.max(40, Math.min(nyquistSafe, f));
    const base = Math.max(180, Math.min(nyquistSafe * 0.35, freq));

    const yip2Offset = dur * (0.19 / 0.42);
    const yip1Dur = dur * (0.17 / 0.42);
    const yip2Dur = dur * (0.185 / 0.42);

    const scheduleYip = (
      tStart: number,
      yipDur: number,
      pitchScale: number,
      formantScale: number,
      gainScale: number
    ) => {
      const f0 = base * pitchScale;
      const formantCenter = 950 * formantScale * Math.pow(base / 360, 0.35);

      const sawOsc = ctx.createOscillator();
      sawOsc.type = 'sawtooth';
      sawOsc.frequency.setValueAtTime(clampFreq(f0 * 0.85), tStart);
      sawOsc.frequency.exponentialRampToValueAtTime(
        clampFreq(f0 * 1.48),
        tStart + yipDur * 0.3
      );
      sawOsc.frequency.exponentialRampToValueAtTime(
        clampFreq(f0 * 0.72),
        tStart + yipDur
      );

      const triOsc = ctx.createOscillator();
      triOsc.type = 'triangle';
      triOsc.frequency.setValueAtTime(clampFreq(f0 * 0.85), tStart);
      triOsc.frequency.exponentialRampToValueAtTime(
        clampFreq(f0 * 1.48),
        tStart + yipDur * 0.3
      );
      triOsc.frequency.exponentialRampToValueAtTime(
        clampFreq(f0 * 0.72),
        tStart + yipDur
      );

      const sawMix = ctx.createGain();
      sawMix.gain.setValueAtTime(0.72, tStart);

      const triMix = ctx.createGain();
      triMix.gain.setValueAtTime(0.42, tStart);

      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(clampFreq(formantCenter * 0.92), tStart);
      formant.frequency.exponentialRampToValueAtTime(
        clampFreq(formantCenter * 1.12),
        tStart + yipDur * 0.32
      );
      formant.frequency.exponentialRampToValueAtTime(
        clampFreq(formantCenter * 0.82),
        tStart + yipDur
      );
      formant.Q.setValueAtTime(2.6, tStart);

      const vocalGain = ctx.createGain();
      const scaledPeak = Math.max(
        0.0002,
        0.26 * gainScale * helpers.masterVolume
      );
      const attack = Math.min(0.014, yipDur * 0.22);
      vocalGain.gain.setValueAtTime(0.0001, tStart);
      vocalGain.gain.linearRampToValueAtTime(scaledPeak, tStart + attack);
      vocalGain.gain.linearRampToValueAtTime(
        scaledPeak * 0.92,
        tStart + yipDur * 0.32
      );
      vocalGain.gain.exponentialRampToValueAtTime(0.0001, tStart + yipDur);

      sawOsc.connect(sawMix);
      triOsc.connect(triMix);
      sawMix.connect(formant);
      triMix.connect(formant);
      formant.connect(vocalGain);
      helpers.connectOutput(ctx, vocalGain);

      sawOsc.start(tStart);
      sawOsc.stop(tStart + yipDur + 0.015);
      triOsc.start(tStart);
      triOsc.stop(tStart + yipDur + 0.015);

      const puffDur = Math.max(0.04, Math.min(0.07, yipDur * 0.45));
      helpers.scheduleFilteredNoise(ctx, {
        duration: puffDur,
        startTime: tStart,
        filterType: 'bandpass',
        startFreq: clampFreq(1400 * formantScale),
        endFreq: clampFreq(700 * formantScale),
        q: 1.8,
        peakGain: 0.13 * gainScale,
        attackSec: 0.008,
        envelope: (i, count) => Math.sin((i / count) * Math.PI),
      });
    };

    // Two brisk cheerful yips ("Arf! Arf!"), second slightly higher & brighter (~1.14x)
    scheduleYip(now, yip1Dur, 1.0, 1.0, 1.0);
    scheduleYip(now + yip2Offset, yip2Dur, 1.14, 1.12, 1.05);
  },
};

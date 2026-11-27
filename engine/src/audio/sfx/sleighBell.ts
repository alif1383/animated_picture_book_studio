import type { ProceduralSfxModule } from './types';

export const sleighBellSfx: ProceduralSfxModule = {
  kind: 'sleigh_bell' as const,
  title: 'Victorian Sleigh Bell & Shop-Door Jingle',
  category: 'musical_cue',
  description:
    'Crisp festive Victorian brass sleigh-bell and shop-door jingle chime cluster layering shimmering metallic inharmonic bell partials (1.0x, 1.58x, 2.31x, 2.94x, 3.73x), two gentle staggered shake bursts, a warm brass door-bell chime undertone, and a soft high-frequency metallic pellet shimmer with zero harsh clipping.',
  themes: [
    'christmas',
    'winter',
    'holiday',
    'shop_door',
    'sleigh',
    'festive',
    'cozy_village',
    'classic',
  ],
  defaultFreqHz: 1568.0,
  defaultDurationSec: 0.72,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.32, duration);
    const nyquistSafe = Math.max(800, ctx.sampleRate * 0.45);
    const clampFreq = (f: number) => Math.max(120, Math.min(nyquistSafe, f));
    const baseFreq = Math.max(784, Math.min(2600, freq || 1568.0));

    // Subtle warm Victorian shop-door brass chime undertone
    helpers.synthesizeMusicBoxNote(
      ctx,
      clampFreq(baseFreq * 0.5),
      Math.min(dur * 0.95, 0.85),
      'sine',
      2.756,
      0.068,
      now
    );

    // Metallic brass pellet rattle shimmer across two gentle festive shake swells
    const shimmerDur = Math.min(dur * 0.85, 0.62);
    helpers.scheduleFilteredNoise(ctx, {
      duration: shimmerDur,
      startTime: now,
      filterType: 'bandpass',
      startFreq: clampFreq(5200),
      peakFreq: { freq: clampFreq(6900), atRatio: 0.35 },
      endFreq: clampFreq(4400),
      q: 3.4,
      peakGain: 0.038,
      attackSec: 0.012,
      envelope: (i, count) => {
        const u = i / Math.max(1, count);
        const burst1 = Math.sin(Math.min(1, u / 0.48) * Math.PI);
        const burst2 =
          u > 0.34 ? Math.sin(Math.min(1, (u - 0.34) / 0.66) * Math.PI) * 0.78 : 0;
        return Math.max(0, burst1 * 0.85 + burst2 * 0.75) * (1 - u * 0.35);
      },
    });

    // Helper to schedule a single crisp brass sleigh-bell pellet strike
    // using metallic inharmonic partials with soft non-clipping headroom
    const inharmonicPartials = [
      { ratio: 1.0, weight: 0.46, decayMul: 1.0 },
      { ratio: 1.58, weight: 0.28, decayMul: 0.84 },
      { ratio: 2.31, weight: 0.19, decayMul: 0.68 },
      { ratio: 2.94, weight: 0.13, decayMul: 0.54 },
      { ratio: 3.73, weight: 0.08, decayMul: 0.42 },
    ] as const;

    const scheduleBellStrike = (
      tStart: number,
      bellFreq: number,
      ringDur: number,
      peakGain: number
    ) => {
      const safeRing = Math.max(0.12, ringDur);
      for (const partial of inharmonicPartials) {
        const partialFreq = bellFreq * partial.ratio;
        if (partialFreq >= nyquistSafe) continue;

        const partialDur = Math.max(0.06, safeRing * partial.decayMul);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(partialFreq, tStart);

        const gain = ctx.createGain();
        const scaledPeak = Math.max(
          0.00015,
          peakGain * partial.weight * helpers.masterVolume
        );
        gain.gain.setValueAtTime(0.0001, tStart);
        gain.gain.linearRampToValueAtTime(scaledPeak, tStart + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, tStart + partialDur);

        osc.connect(gain);
        helpers.connectOutput(ctx, gain);
        osc.start(tStart);
        osc.stop(tStart + partialDur + 0.015);
      }
    };

    // Burst 1: crisp initial festive jingle cluster (four subtly detuned brass bells)
    const burst1 = [
      { offset: 0.0, pitchMul: 1.0, gain: 0.075 },
      { offset: 0.022, pitchMul: 1.189, gain: 0.068 },
      { offset: 0.048, pitchMul: 1.335, gain: 0.062 },
      { offset: 0.078, pitchMul: 1.498, gain: 0.056 },
    ] as const;

    for (const strike of burst1) {
      const t = now + strike.offset;
      const ring = Math.max(0.18, dur - strike.offset);
      scheduleBellStrike(t, baseFreq * strike.pitchMul, ring * 0.85, strike.gain);
    }

    // Burst 2: gentle answering swing / settle shimmer
    const secondShakeStart = Math.min(0.145, dur * 0.25);
    const burst2 = [
      { offset: 0.0, pitchMul: 1.122, gain: 0.058 },
      { offset: 0.026, pitchMul: 1.26, gain: 0.054 },
      { offset: 0.055, pitchMul: 1.498, gain: 0.048 },
      { offset: 0.09, pitchMul: 1.682, gain: 0.04 },
    ] as const;

    for (const strike of burst2) {
      const t = now + secondShakeStart + strike.offset;
      if (t >= now + dur - 0.08) continue;
      const ring = Math.max(0.16, now + dur - t);
      scheduleBellStrike(t, baseFreq * strike.pitchMul, ring * 0.92, strike.gain);
    }
  },
};

export const SLEIGH_BELL_SFX: ProceduralSfxModule = sleighBellSfx;

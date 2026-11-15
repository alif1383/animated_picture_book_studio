import { SAMPLE_RATE, rand, whiteNoise } from './shared.mjs';

export function generateDragonFireBreath(dur = 2.8) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  let bpState1 = 0;
  let bpState2 = 0;
  let lowRoarLp = 0;
  let throatPhase1 = 0;
  let throatPhase2 = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;

    let env = 1.0;
    if (t < 0.25) env = Math.pow(t / 0.25, 0.75);
    else if (t > 1.8) env = Math.pow(Math.max(0, (dur - t) / (dur - 1.8)), 1.4);

    const growlFreq =
      72 +
      38 * Math.sin(Math.PI * Math.min(1, t / 1.9)) +
      6 * Math.sin(2 * Math.PI * 14 * t);
    throatPhase1 += (2 * Math.PI * growlFreq) / SAMPLE_RATE;
    throatPhase2 += (2 * Math.PI * growlFreq * 1.5) / SAMPLE_RATE;

    const throatGrowl =
      (Math.sin(throatPhase1) * 0.55 +
        Math.sin(2 * throatPhase1) * 0.28 +
        Math.sin(throatPhase2) * 0.22) *
      (t < 2.1 ? 0.32 : 0.32 * Math.max(0, (2.5 - t) / 0.4));

    const raw = whiteNoise();
    const sweepCurve = Math.sin(Math.PI * Math.min(1, t / 2.2));
    const turbulence =
      1 +
      0.22 * Math.sin(2 * Math.PI * 8.5 * t) +
      0.14 * Math.sin(2 * Math.PI * 19 * t);
    const centerFreq = (220 + 780 * sweepCurve) * turbulence;

    const f = Math.min(0.45, 2 * Math.sin((Math.PI * centerFreq) / SAMPLE_RATE));
    const q = 0.28;
    const hp = raw - bpState2 - q * bpState1;
    bpState1 += f * hp;
    bpState2 += f * bpState1;

    lowRoarLp += 0.045 * (raw - lowRoarLp);

    const flameWhoosh = bpState1 * 0.65 + lowRoarLp * 0.55;
    out[i] = (throatGrowl + flameWhoosh) * env;
  }

  for (let c = 0; c < 28; c++) {
    const onset = 0.8 + rand() * 1.85;
    const startIdx = Math.floor(onset * SAMPLE_RATE);
    const snapSamples = Math.floor(0.008 * SAMPLE_RATE);
    const freq = 1600 + rand() * 2400;
    for (let j = 0; j < snapSamples && startIdx + j < n; j++) {
      const st = j / SAMPLE_RATE;
      out[startIdx + j] +=
        (Math.sin(2 * Math.PI * freq * st) * 0.4 + whiteNoise() * 0.6) *
        Math.exp(-st * 320) *
        0.28;
    }
  }

  return out;
}

export const DRAGON_FIRE_BREATH_CLIP = {
  id: 'dragon-fire-breath',
  filename: 'dragon-fire-breath.wav',
  src: '/audio/dragon-fire-breath.wav',
  title: 'Dragon Throat Growl & Roaring Flame Breath',
  category: 'sfx',
  durationSec: 2.8,
  defaultVolume: 0.78,
  targetPeak: 0.9,
  description:
    'Deep chest-vibrato dragon throat growl (72-108 Hz) combined with a state-variable sweeping bandpass flame whoosh and crackling fire tail.',
  themes: ['dragon', 'medieval', 'fantasy', 'fire', 'monster', 'magic', 'action'],
  generate: () => generateDragonFireBreath(2.8),
};

import { SAMPLE_RATE, rand, whiteNoise } from './shared.mjs';

export function generateCampfireCrackle(dur = 9.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  let lpEmber1 = 0;
  let lpEmber2 = 0;
  let lpSizzle = 0;
  let prevRaw = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const raw = whiteNoise();

    lpEmber1 += 0.022 * (raw - lpEmber1);
    lpEmber2 += 0.022 * (lpEmber1 - lpEmber2);
    const draftMod =
      0.65 +
      0.2 * Math.sin(2 * Math.PI * 0.45 * t) +
      0.15 * Math.sin(2 * Math.PI * 1.15 * t + 0.8);

    const hp = raw - prevRaw;
    prevRaw = raw;
    lpSizzle += 0.18 * (hp - lpSizzle);
    const sizzleMod = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.8 * t);

    out[i] = lpEmber2 * draftMod * 0.48 + lpSizzle * sizzleMod * 0.045;
  }

  const numCrackles = 68;
  for (let c = 0; c < numCrackles; c++) {
    const onset = 0.15 + rand() * (dur - 0.35);
    const isBigSnap = rand() < 0.32;
    const snapDur = isBigSnap
      ? 0.012 + rand() * 0.01
      : 0.004 + rand() * 0.006;
    const freq1 = isBigSnap ? 1400 + rand() * 1400 : 2400 + rand() * 2800;
    const freq2 = freq1 * (1.45 + rand() * 0.35);
    const snapAmp = isBigSnap ? 0.55 + rand() * 0.35 : 0.22 + rand() * 0.28;

    const startIdx = Math.floor(onset * SAMPLE_RATE);
    const snapSamples = Math.floor(snapDur * SAMPLE_RATE);
    for (let j = 0; j < snapSamples && startIdx + j < n; j++) {
      const st = j / SAMPLE_RATE;
      const env = Math.exp(-st / (snapDur * 0.28));
      const burst =
        (Math.sin(2 * Math.PI * freq1 * st) * 0.5 +
          Math.sin(2 * Math.PI * freq2 * st) * 0.35 +
          whiteNoise() * 0.65) *
        env;
      out[startIdx + j] += burst * snapAmp;
    }

    if (isBigSnap && rand() < 0.75) {
      const followOnset = onset + 0.008 + rand() * 0.02;
      const followStart = Math.floor(followOnset * SAMPLE_RATE);
      const followSamples = Math.floor(0.006 * SAMPLE_RATE);
      for (let j = 0; j < followSamples && followStart + j < n; j++) {
        const st = j / SAMPLE_RATE;
        out[followStart + j] +=
          whiteNoise() * Math.exp(-st * 450) * (snapAmp * 0.6);
      }
    }
  }

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.35) env = t / 0.35;
    else if (t > dur - 0.5) env = Math.max(0, (dur - t) / 0.5);
    out[i] *= env;
  }

  return out;
}

export const CAMPFIRE_CRACKLE_CLIP = {
  id: 'campfire-crackle',
  filename: 'campfire-crackle.wav',
  src: '/audio/campfire-crackle.wav',
  title: 'Woodland Campfire Crackle & Roasting Spit Sizzle',
  category: 'ambient',
  durationSec: 9.0,
  defaultVolume: 0.72,
  targetPeak: 0.82,
  description:
    'Cozy two-pole lowpass ember draft rumble layered with roasting meat spit high-mid sizzle and 68 stochastic wood-snap crackles and ember pops.',
  themes: [
    'camping',
    'forest',
    'nighttime',
    'medieval',
    'hearth',
    'cooking',
    'cozy',
  ],
  generate: () => generateCampfireCrackle(9.0),
};

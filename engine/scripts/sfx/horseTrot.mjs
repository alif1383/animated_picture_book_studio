import { SAMPLE_RATE, whiteNoise } from './shared.mjs';

export function generateHorseTrot(dur = 4.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function addHoofStrike(onsetSec, isClip, amp = 0.65) {
    const startIdx = Math.floor(onsetSec * SAMPLE_RATE);
    const strikeLen = Math.floor(0.085 * SAMPLE_RATE);
    const f1 = isClip ? 820 : 580;
    const f2 = isClip ? 1290 : 940;
    const f3 = isClip ? 1950 : 1480;

    let lpCrunch = 0;
    for (let j = 0; j < strikeLen && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const attack = t < 0.002 ? t / 0.002 : 1.0;

      const shell =
        (Math.sin(2 * Math.PI * f1 * t) * 0.58 +
          Math.sin(2 * Math.PI * f2 * t) * 0.3 +
          Math.sin(2 * Math.PI * f3 * t) * 0.12) *
        Math.exp(-t * 58);

      const raw = whiteNoise();
      lpCrunch = 0.45 * lpCrunch + 0.55 * raw;
      const dirtCrunch = (raw - lpCrunch * 0.5) * Math.exp(-t * 95) * 0.42;

      const thud =
        Math.sin(2 * Math.PI * (135 * Math.exp(-t * 40)) * t) *
        Math.exp(-t * 50) *
        0.28;

      out[startIdx + j] += (shell + dirtCrunch + thud) * attack * amp;
    }
  }

  let cycleTime = 0.08;
  while (cycleTime < dur - 0.22) {
    addHoofStrike(cycleTime, true, 0.72);
    addHoofStrike(cycleTime + 0.15, false, 0.68);
    addHoofStrike(cycleTime + 0.05, false, 0.36);
    addHoofStrike(cycleTime + 0.21, true, 0.34);

    const jingleStart = Math.floor((cycleTime + 0.02) * SAMPLE_RATE);
    const jingleLen = Math.floor(0.045 * SAMPLE_RATE);
    for (let j = 0; j < jingleLen && jingleStart + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const jingle =
        (Math.sin(2 * Math.PI * 3450 * t) * 0.5 +
          Math.sin(2 * Math.PI * 4620 * t) * 0.5) *
        Math.exp(-t * 65) *
        0.07;
      out[jingleStart + j] += jingle;
    }

    cycleTime += 0.46;
  }

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.08) env = t / 0.08;
    else if (t > dur - 0.25) env = Math.max(0, (dur - t) / 0.25);
    out[i] *= env;
  }

  return out;
}

export const HORSE_TROT_CLIP = {
  id: 'horse-trot',
  filename: 'horse-trot.wav',
  src: '/audio/horse-trot.wav',
  title: 'Cavalry Horse Hooves Clip-Clop & Bridle Jingle',
  category: 'foley',
  durationSec: 4.0,
  defaultVolume: 0.62,
  targetPeak: 0.85,
  description:
    'Rhythmic coconut-shell and dirt-path clip-clop hoof strikes for lead steed and accompanying cavalry with subtle metallic bridle jingles.',
  themes: [
    'medieval',
    'horse',
    'knight',
    'travel',
    'march',
    'countryside',
    'village',
  ],
  generate: () => generateHorseTrot(4.0),
};

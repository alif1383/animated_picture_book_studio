import { NOTE_FREQS, SAMPLE_RATE, whiteNoise } from './shared.mjs';

export function generateSpearToothPop(dur = 1.6) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  const impacts = [
    { onset: 0.03, fWood: 540, fMetal: 1480, fRing: 2640, amp: 0.65 },
    { onset: 0.16, fWood: 620, fMetal: 1680, fRing: 2920, amp: 0.55 },
  ];
  for (const imp of impacts) {
    const startIdx = Math.floor(imp.onset * SAMPLE_RATE);
    const len = Math.floor(0.14 * SAMPLE_RATE);
    for (let j = 0; j < len && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const wood = Math.sin(2 * Math.PI * imp.fWood * t) * Math.exp(-t * 48);
      const metal =
        (Math.sin(2 * Math.PI * imp.fMetal * t) * 0.6 +
          Math.sin(2 * Math.PI * imp.fRing * t) * 0.4) *
        Math.exp(-t * 28);
      const click = whiteNoise() * Math.exp(-t * 180) * 0.45;
      out[startIdx + j] += (wood * 0.55 + metal * 0.45 + click) * imp.amp;
    }
  }

  const slideStart = Math.floor(0.3 * SAMPLE_RATE);
  const slideEnd = Math.floor(0.64 * SAMPLE_RATE);
  let slidePhase = 0;
  for (let idx = slideStart; idx < slideEnd && idx < n; idx++) {
    const t = (idx - slideStart) / SAMPLE_RATE;
    const progress = t / 0.34;
    const freq = 185 + 280 * Math.pow(progress, 1.5);
    slidePhase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const creakMod = 0.65 + 0.35 * Math.sin(2 * Math.PI * 38 * t);
    const env = Math.sin(Math.PI * progress);
    out[idx] +=
      (Math.sin(slidePhase) * 0.6 + Math.sin(2 * slidePhase) * 0.3) *
      creakMod *
      env *
      0.38;
  }

  const popStart = Math.floor(0.65 * SAMPLE_RATE);
  const popLen = Math.floor(0.16 * SAMPLE_RATE);
  let popPhase = 0;
  for (let j = 0; j < popLen && popStart + j < n; j++) {
    const t = j / SAMPLE_RATE;
    const fPop =
      t < 0.055
        ? 240 + 740 * Math.pow(t / 0.055, 1.8)
        : 980 * Math.exp(-(t - 0.055) * 14);
    popPhase += (2 * Math.PI * fPop) / SAMPLE_RATE;
    const env = t < 0.004 ? t / 0.004 : Math.exp(-t * 24);
    const lipSnap = t < 0.015 ? whiteNoise() * Math.exp(-t * 220) * 0.35 : 0;
    out[popStart + j] +=
      (Math.sin(popPhase) * 0.85 + Math.sin(2 * popPhase) * 0.25 + lipSnap) *
      env *
      0.92;
  }

  const chimes = [
    { t: 0.85, freq: NOTE_FREQS.D5, dur: 0.55 },
    { t: 0.95, freq: NOTE_FREQS.Fs5, dur: 0.52 },
    { t: 1.05, freq: NOTE_FREQS.A5, dur: 0.48 },
    { t: 1.15, freq: NOTE_FREQS.D6, dur: 0.44 },
    { t: 1.25, freq: NOTE_FREQS.Fs6, dur: 0.34 },
  ];
  for (const ch of chimes) {
    const startIdx = Math.floor(ch.t * SAMPLE_RATE);
    const len = Math.floor(ch.dur * SAMPLE_RATE);
    for (let j = 0; j < len && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const env = (t < 0.005 ? t / 0.005 : 1.0) * Math.exp(-t * 6.5);
      const bell =
        Math.sin(2 * Math.PI * ch.freq * t) * 0.65 +
        Math.sin(2 * Math.PI * ch.freq * 2 * t) * 0.22 +
        Math.sin(2 * Math.PI * ch.freq * 3 * t) * 0.1;
      out[startIdx + j] += bell * env * 0.36;
    }
  }

  return out;
}

export const SPEAR_TOOTH_POP_CLIP = {
  id: 'spear-tooth-pop',
  filename: 'spear-tooth-pop.wav',
  src: '/audio/spear-tooth-pop.wav',
  title: 'Spear Tooth-Clink, Lever Creak, Cork Pop & Relief Chimes',
  category: 'sfx',
  durationSec: 1.6,
  defaultVolume: 0.9,
  targetPeak: 0.9,
  description:
    '4-stage narrative SFX: metallic/wooden spear clink impacts, upward tension lever creak, comical resonant cork POP, and ascending D-major relief chime arpeggio.',
  themes: [
    'medieval',
    'knight',
    'dragon',
    'tooth_fix',
    'comedy_pop',
    'relief',
    'quest',
  ],
  generate: () => generateSpearToothPop(1.6),
};

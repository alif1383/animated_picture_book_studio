import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  NOTE_FREQS,
  SAMPLE_RATE,
  addLutePluck,
  resetSeed,
  whiteNoise,
  writeWav,
} from './shared.mjs';

export function generateKnightHiccupsThornPop(dur = 1.5) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // =========================================================================
  // STAGE 1 (0.00 - 0.44s): Taut woody-vine tug & rising comic stretch creak
  // =========================================================================
  const tugEnd = Math.floor(0.44 * SAMPLE_RATE);
  let stretchPhase = 0;
  let fibLp = 0;
  for (let idx = 0; idx < tugEnd && idx < n; idx++) {
    const t = idx / SAMPLE_RATE;
    const progress = t / 0.44;
    // Rising taut rubbery/woody tension tone
    const stretchFreq = 148 + 250 * Math.pow(progress, 1.55);
    stretchPhase += (2 * Math.PI * stretchFreq) / SAMPLE_RATE;

    // Accelerating stick-slip amplitude modulation for comical vine creak
    const creakRate = 24 + 34 * progress;
    const creakMod = 0.55 + 0.45 * Math.sin(2 * Math.PI * creakRate * t);

    const env =
      (t < 0.025 ? t / 0.025 : 1.0) *
      (t > 0.4 ? Math.max(0, (0.44 - t) / 0.04) : 1.0) *
      (0.35 + 0.65 * progress);

    // Fibrous woody vine friction noise
    fibLp = 0.72 * fibLp + 0.28 * whiteNoise();
    const fiber = fibLp * (0.12 + 0.14 * creakMod);

    const creakTone =
      Math.sin(stretchPhase) * 0.58 +
      Math.sin(2 * stretchPhase) * 0.28 +
      Math.sin(3 * stretchPhase) * 0.12;

    out[idx] += (creakTone * creakMod * 0.36 + fiber * 0.28) * env;
  }

  // Pitched wood friction ticks accelerating slightly across 0.02 - 0.43s
  const tickTimes = [
    0.02, 0.068, 0.112, 0.152, 0.189, 0.223, 0.255, 0.284, 0.311, 0.336, 0.359,
    0.381, 0.402, 0.422,
  ];
  tickTimes.forEach((onset, i) => {
    const p = i / (tickTimes.length - 1);
    const fWood = 430 + p * 540;
    const fRes = fWood * 1.62;
    const amp = 0.26 + p * 0.24;
    const startIdx = Math.floor(onset * SAMPLE_RATE);
    const len = Math.floor(0.026 * SAMPLE_RATE);
    for (let j = 0; j < len && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const body =
        (Math.sin(2 * Math.PI * fWood * t) * 0.65 +
          Math.sin(2 * Math.PI * fRes * t) * 0.35) *
        Math.exp(-t * 135);
      const click = whiteNoise() * Math.exp(-t * 280) * 0.35;
      out[startIdx + j] += (body + click) * amp;
    }
  });

  // =========================================================================
  // STAGE 2 (0.45 - 0.62s): Super-satisfying resonant hollow cork/tooth POP!
  // =========================================================================
  const popStart = Math.floor(0.45 * SAMPLE_RATE);
  const popDur = 0.17;
  const popLen = Math.floor(popDur * SAMPLE_RATE);
  let popPhase = 0;
  for (let j = 0; j < popLen && popStart + j < n; j++) {
    const t = j / SAMPLE_RATE;
    // Rapid upward sine pitch-snap 190 -> 920 Hz over 0.048s, then resonant decay
    const fPop =
      t < 0.048
        ? 190 + 730 * Math.pow(t / 0.048, 1.65)
        : 920 * Math.exp(-(t - 0.048) * 11.5);
    popPhase += (2 * Math.PI * fPop) / SAMPLE_RATE;

    const popEnv =
      (t < 0.003 ? t / 0.003 : Math.exp(-t * 20.5)) *
      (t > popDur - 0.02 ? Math.max(0, (popDur - t) / 0.02) : 1.0);

    // Crisp woody transient burst right at pop onset
    const woodSnap =
      t < 0.022
        ? (Math.sin(2 * Math.PI * 690 * t) * 0.45 +
            Math.sin(2 * Math.PI * 1420 * t) * 0.3 +
            whiteNoise() * 0.45) *
          Math.exp(-t * 170)
        : 0;

    const hollowPop =
      Math.sin(popPhase) * 0.86 +
      Math.sin(2 * popPhase) * 0.24 * Math.exp(-t * 28) +
      Math.sin(0.5 * popPhase) * 0.12 * Math.exp(-t * 36);

    out[popStart + j] += (hollowPop * popEnv + woodSnap * 0.55) * 0.96;
  }

  // =========================================================================
  // STAGE 3 (0.64 - 1.48s): Sparkling storybook D-major relief harp/chime glissando
  // =========================================================================
  const glissNotes = [
    { t: 0.64, freq: NOTE_FREQS.D5, dur: 0.78, amp: 0.34 },
    { t: 0.74, freq: NOTE_FREQS.Fs5, dur: 0.72, amp: 0.35 },
    { t: 0.84, freq: NOTE_FREQS.A5, dur: 0.64, amp: 0.36 },
    { t: 0.94, freq: NOTE_FREQS.D6, dur: 0.54, amp: 0.39 },
  ];

  for (const ch of glissNotes) {
    // Soft plucked harp layer
    addLutePluck(out, ch.t, ch.freq, ch.dur, ch.amp * 0.42, 0.55);

    // Sparkling chime harmonic shimmer
    const startIdx = Math.floor(ch.t * SAMPLE_RATE);
    const len = Math.floor(ch.dur * SAMPLE_RATE);
    for (let j = 0; j < len && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const att = t < 0.005 ? t / 0.005 : 1.0;
      const rel = t > ch.dur - 0.04 ? Math.max(0, (ch.dur - t) / 0.04) : 1.0;
      const env = att * rel * Math.exp(-t * 5.8);
      const w = 2 * Math.PI * ch.freq * t;
      const bell =
        Math.sin(w) * 0.64 +
        Math.sin(2 * w) * 0.22 * Math.exp(-t * 3.5) +
        Math.sin(3 * w) * 0.11 * Math.exp(-t * 7.5) +
        Math.sin(4 * w) * 0.04 * Math.exp(-t * 11.0);
      out[startIdx + j] += bell * env * ch.amp;
    }
  }

  // Gentle top sparkle overtone whisper on Fs6 fading cleanly by 1.48s
  const topStart = Math.floor(1.04 * SAMPLE_RATE);
  const topLen = Math.floor(0.44 * SAMPLE_RATE);
  for (let j = 0; j < topLen && topStart + j < n; j++) {
    const t = j / SAMPLE_RATE;
    const att = t < 0.008 ? t / 0.008 : 1.0;
    const env = att * Math.exp(-t * 7.5);
    out[topStart + j] +=
      (Math.sin(2 * Math.PI * NOTE_FREQS.Fs6 * t) * 0.72 +
        Math.sin(2 * Math.PI * NOTE_FREQS.A5 * t) * 0.28) *
      env *
      0.16;
  }

  // Clean tail fade-out across 1.44 - 1.49s so the clip ends at zero with zero clicks
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    if (t >= 1.44 && t < 1.49) {
      out[i] *= (1.49 - t) / 0.05;
    } else if (t >= 1.49) {
      out[i] = 0;
    }
  }

  return out;
}

export const KNIGHT_HICCUPS_THORN_POP = {
  id: 'knight-hiccups-thorn-pop',
  filename: 'knight-hiccups-thorn-pop.wav',
  src: '/audio/knight-hiccups-thorn-pop.wav',
  title: 'Vine-Thorn Tug, Comic Cork POP & D-Major Relief Glissando',
  category: 'sfx',
  durationSec: 1.5,
  defaultVolume: 0.92,
  targetPeak: 0.9,
  description:
    '3-stage comic thorn extraction SFX: (1) taut woody-vine tug & accelerating pitched wood-friction stretch creak (0.00–0.44s), (2) resonant hollow cork/tooth upward pitch-snap POP (190 -> 920 Hz + woody burst, 0.45–0.62s), (3) sparkling storybook D-major relief harp/chime glissando (D5 → Fs5 → A5 → D6, 0.64–1.48s).',
  themes: [
    'medieval',
    'knight',
    'dragon',
    'comedy_pop',
    'thorn_pull',
    'relief',
    'storybook',
  ],
  generate: () => generateKnightHiccupsThornPop(1.5),
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  resetSeed(0x6c1cc002);
  const outPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../public/audio',
    KNIGHT_HICCUPS_THORN_POP.filename
  );
  const samples = KNIGHT_HICCUPS_THORN_POP.generate();
  writeWav(outPath, samples, KNIGHT_HICCUPS_THORN_POP.targetPeak);
  console.log(
    `Generated ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`
  );
}

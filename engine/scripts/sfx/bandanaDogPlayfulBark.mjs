import { NOTE_FREQS, SAMPLE_RATE, whiteNoise } from './shared.mjs';

function createBandpass(centerFreq, q) {
  let y1 = 0;
  let y2 = 0;
  let x1 = 0;
  let x2 = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let a1 = 0;
  let a2 = 0;

  function setParams(freq, quality) {
    const f = Math.max(40, Math.min(SAMPLE_RATE * 0.45, freq));
    const w0 = (2 * Math.PI * f) / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * Math.max(0.5, quality));
    const cosW0 = Math.cos(w0);
    const a0 = 1 + alpha;
    b0 = alpha / a0;
    b1 = 0;
    b2 = -alpha / a0;
    a1 = (-2 * cosW0) / a0;
    a2 = (1 - alpha) / a0;
  }

  setParams(centerFreq, q);

  return {
    update: setParams,
    process(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
      return y;
    },
  };
}

function addPuppyYip(
  out,
  {
    startSec,
    durSec,
    fStart,
    fPeak,
    fEnd,
    peakPos = 0.36,
    formant1 = 850,
    formant2 = 1750,
    amp = 0.85,
  }
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const bp1 = createBandpass(formant1, 3.4);
  const bp2 = createBandpass(formant2, 4.4);
  const breathBp = createBandpass(1450, 1.8);

  let phase = 0;
  const maxIdx = Math.min(out.length, startIdx + len);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const u = t / durSec;

    let freq;
    if (u < peakPos) {
      const p = u / peakPos;
      freq = fStart + (fPeak - fStart) * Math.sin((p * Math.PI) / 2);
    } else {
      const p = (u - peakPos) / (1 - peakPos);
      freq = fPeak + (fEnd - fPeak) * Math.pow(p, 1.25);
    }

    // Gentle organic puppy-throat flutter
    freq *= 1 + 0.012 * Math.sin(2 * Math.PI * 26 * t);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    // Warm harmonic glottal pulse train
    let glottal = 0;
    for (let h = 1; h <= 8; h++) {
      glottal += Math.sin(h * phase) / Math.pow(h, 1.12);
    }
    glottal *= 0.42;

    // Mouth opens toward peak pitch then closes softly
    const mouthOpen = Math.sin(Math.PI * Math.min(1, u * 1.05));
    if ((idx - startIdx) % 32 === 0) {
      bp1.update(formant1 * (0.92 + 0.14 * mouthOpen), 3.4);
      bp2.update(formant2 * (0.94 + 0.12 * mouthOpen), 4.4);
    }

    const f1Out = bp1.process(glottal) * 2.4;
    const f2Out = bp2.process(glottal) * 1.55;
    const chestBody = Math.sin(phase) * 0.24;

    // Soft breathy bark attack ("h-arf!")
    const breathEnv =
      t < 0.008 ? t / 0.008 : Math.exp(-(t - 0.008) * 44);
    const breath = breathBp.process(whiteNoise()) * breathEnv * 0.58;

    // Snappy yip amplitude contour
    let env;
    if (t < 0.014) {
      env = t / 0.014;
    } else if (u < 0.55) {
      env = 1.0 - 0.12 * ((u - 0.07) / 0.48);
    } else {
      const tail = (u - 0.55) / 0.45;
      env = Math.max(0, 0.88 * Math.pow(1 - tail, 1.7));
    }

    out[idx] += (f1Out + f2Out + chestBody + breath) * env * amp;
  }
}

function addRubberBallBounce(
  out,
  { startSec, durSec, fStart, fEnd, amp = 0.72 }
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  let boingPhase = 0;
  let thumpPhase = 0;
  let tapLp = 0;
  const maxIdx = Math.min(out.length, startIdx + len);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const u = t / durSec;

    // Elastic upward rubber pitch sweep with gentle damped spring wobble
    const sweep = fStart + (fEnd - fStart) * (1 - Math.exp(-t * 14));
    const wobble = 18 * Math.sin(2 * Math.PI * 24 * t) * Math.exp(-t * 14);
    const fBoing = sweep + wobble;
    boingPhase += (2 * Math.PI * fBoing) / SAMPLE_RATE;

    // Hollow tennis-ball impact thump
    const fThump = 128 * Math.exp(-t * 22) + 72;
    thumpPhase += (2 * Math.PI * fThump) / SAMPLE_RATE;

    const thump = Math.sin(thumpPhase) * Math.exp(-t * 36) * 0.52;
    const boing =
      (Math.sin(boingPhase) * 0.78 +
        Math.sin(2 * boingPhase) * 0.22 +
        Math.sin(3 * boingPhase) * 0.07) *
      Math.exp(-t * 13.5);

    // Fuzzy felt contact tap
    tapLp = 0.78 * tapLp + 0.22 * whiteNoise();
    const tap = tapLp * Math.exp(-t * 140) * 0.32;

    const attack = t < 0.003 ? t / 0.003 : 1.0;
    const rel = u > 0.82 ? Math.max(0, (1 - u) / 0.18) : 1.0;

    out[idx] += (boing + thump + tap) * attack * rel * amp;
  }
}

function addMarimbaSparkle(out, startSec, freq, durSec, amp = 0.34) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  let malletLp = 0;
  const maxIdx = Math.min(out.length, startIdx + len);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const w = 2 * Math.PI * freq * t;

    const attack = t < 0.0035 ? t / 0.0035 : 1.0;
    const tailFade =
      t > durSec - 0.03 ? Math.max(0, (durSec - t) / 0.03) : 1.0;

    // Warm marimba fundamental + woody 4th harmonic + glockenspiel shimmer
    const fund = Math.sin(w) * Math.exp(-t * 7.2) * 0.68;
    const glock2 = Math.sin(2 * w) * Math.exp(-t * 9.5) * 0.22;
    const glock3 = Math.sin(3 * w) * Math.exp(-t * 13.0) * 0.1;
    const barKnock = Math.sin(4 * w) * Math.exp(-t * 36.0) * 0.18;

    malletLp = 0.72 * malletLp + 0.28 * whiteNoise();
    const mallet = malletLp * Math.exp(-t * 180) * 0.14;

    out[idx] += (fund + glock2 + glock3 + barKnock + mallet) * attack * tailFade * amp;
  }
}

export function generateBandanaDogPlayfulBark(dur = 1.4) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // 0.04s - 0.24s: Cute bright puppy yip #1 ("Arf!")
  addPuppyYip(out, {
    startSec: 0.04,
    durSec: 0.2,
    fStart: 290,
    fPeak: 510,
    fEnd: 260,
    peakPos: 0.36,
    formant1: 850,
    formant2: 1750,
    amp: 0.84,
  });

  // 0.28s - 0.48s: Excited puppy yip #2 ("Woof-Arf!"), slightly brighter
  addPuppyYip(out, {
    startSec: 0.28,
    durSec: 0.2,
    fStart: 330,
    fPeak: 590,
    fEnd: 290,
    peakPos: 0.34,
    formant1: 900,
    formant2: 1840,
    amp: 0.92,
  });

  // 0.55s - 1.05s: Bouncy rubber tennis-ball double boing-bounce
  addRubberBallBounce(out, {
    startSec: 0.56,
    durSec: 0.26,
    fStart: 190,
    fEnd: 420,
    amp: 0.78,
  });
  addRubberBallBounce(out, {
    startSec: 0.84,
    durSec: 0.21,
    fStart: 225,
    fEnd: 460,
    amp: 0.5,
  });

  // 0.95s - 1.35s: Playful ascending C-major marimba/glockenspiel sparkle
  const sparkleNotes = [
    { t: 0.95, freq: NOTE_FREQS.C5, dur: 0.36, amp: 0.3 },
    { t: 1.04, freq: NOTE_FREQS.E5, dur: 0.32, amp: 0.32 },
    { t: 1.13, freq: NOTE_FREQS.G5, dur: 0.26, amp: 0.34 },
    { t: 1.22, freq: NOTE_FREQS.C6, dur: 0.17, amp: 0.38 },
  ];
  for (const note of sparkleNotes) {
    addMarimbaSparkle(out, note.t, note.freq, note.dur, note.amp);
  }

  // Smooth master edge fades to guarantee click-free playback
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.008) env = t / 0.008;
    else if (t > dur - 0.045) env = Math.max(0, (dur - t) / 0.045);
    out[i] *= env;
  }

  return out;
}

export const BANDANA_DOG_PLAYFUL_BARK_CLIP = {
  id: 'bandana-dog-playful-bark',
  filename: 'bandana-dog-playful-bark.wav',
  src: '/audio/bandana-dog-playful-bark.wav',
  title: 'Playful Puppy Bark & Ball Bounce',
  category: 'sfx',
  durationSec: 1.4,
  defaultVolume: 0.85,
  targetPeak: 0.88,
  description:
    'Joyful 3-stage picture-book puppy SFX: twin dual-formant excited puppy yips ("Arf! Woof-Arf!"), double elastic rubber tennis-ball boing-bounces, and an ascending C-major marimba/glockenspiel sparkle.',
  themes: [
    'dog',
    'pet',
    'playful',
    'fetch',
    'backyard',
    'park',
    'comedy',
    'happy',
  ],
  generate: () => generateBandanaDogPlayfulBark(1.4),
};

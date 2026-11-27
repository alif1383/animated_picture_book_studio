import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  NOTE_FREQS,
  SAMPLE_RATE,
  resetSeed,
  whiteNoise,
  writeWav,
} from './shared.mjs';

const NOTES = {
  ...NOTE_FREQS,
  C2: 65.41,
  Eb2: 77.78,
  Eb3: 155.56,
  Eb4: 311.13,
  Eb5: 622.25,
  Bb5: 932.33,
  B5: 987.77,
  F6: 1396.91,
  G6: 1567.98,
};

function raisedCosineRamp(t, dur) {
  if (dur <= 0) return 1.0;
  const u = Math.max(0, Math.min(1, t / dur));
  return 0.5 - 0.5 * Math.cos(Math.PI * u);
}

/**
 * Victorian celesta tone with crystalline tine glint and zero-click envelopes.
 */
function addCelestaNote(out, startSec, freq, durSec, amp = 0.14) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.005;
  const releaseSec = Math.min(0.06, durSec * 0.25);
  const decayRate = 2.5 / Math.max(0.32, durSec);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = Math.exp(-t * decayRate);
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const w = 2 * Math.PI * freq * t;
    const body =
      Math.sin(w) * 0.72 +
      Math.sin(2 * w) * 0.2 * Math.exp(-t * 4.0) +
      Math.sin(3 * w) * 0.06 * Math.exp(-t * 7.8);
    const tineGlint = Math.sin(4.015 * w) * 0.085 * Math.exp(-t * 30.0);

    out[idx] += (body + tineGlint) * env * amp;
  }
}

/**
 * Soft pizzicato string pluck for winter waltz accompaniment and comedic bounce.
 */
function addPizzString(out, startSec, freq, durSec = 0.26, amp = 0.15) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.003 ? t / 0.003 : 1.0;
    const rel =
      t > durSec - 0.025 ? raisedCosineRamp(durSec - t, 0.025) : 1.0;

    const instFreq = freq * (1 + 0.014 * Math.exp(-t * 62));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const decay = Math.exp(-t * 10.5);
    const tone =
      Math.sin(phase) * 0.68 +
      Math.sin(2 * phase) * 0.24 * Math.exp(-t * 15) +
      Math.sin(3 * phase) * 0.08 * Math.exp(-t * 26);
    const fingerSnap = whiteNoise() * Math.exp(-t * 180) * 0.09;

    out[idx] += (tone * decay + fingerSnap) * attack * rel * amp;
  }
}

/**
 * Playful Dickensian staccato bassoon double-reed voice for grumpy Barnaby comedy.
 */
function addStaccatoBassoon(out, startSec, freq, durSec = 0.2, amp = 0.18) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  let noiseLp = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = 0.012;
    const release = Math.min(0.045, durSec * 0.35);
    let env = 1.0;
    if (t < attack) env *= raisedCosineRamp(t, attack);
    if (t > durSec - release) env *= raisedCosineRamp(durSec - t, release);

    const pitchScoop = 1 - 0.028 * Math.exp(-t * 52);
    phase += (2 * Math.PI * freq * pitchScoop) / SAMPLE_RATE;

    const reed =
      Math.sin(phase) * 0.44 +
      Math.sin(2 * phase) * 0.31 +
      Math.sin(3 * phase) * 0.17 +
      Math.sin(4 * phase) * 0.08 +
      Math.sin(5 * phase) * 0.035;

    noiseLp = 0.78 * noiseLp + 0.22 * whiteNoise();
    const tongueChiff = noiseLp * Math.exp(-t * 85) * 0.07;
    const damp = Math.exp(-t * 2.5);

    out[idx] += (reed + tongueChiff) * env * damp * amp;
  }
}

/**
 * Warm concert harp pluck with progressive harmonic bloom.
 */
function addHarpPluck(out, startSec, freq, durSec, amp = 0.12) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.006;
  const releaseSec = Math.min(0.07, durSec * 0.26);
  const baseDecay = 2.15 / Math.max(0.4, durSec);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const w = 2 * Math.PI * freq * t;
    const h1 = Math.sin(w) * 0.67 * Math.exp(-t * baseDecay);
    const h2 = Math.sin(2 * w) * 0.22 * Math.exp(-t * (baseDecay * 1.85));
    const h3 = Math.sin(3 * w) * 0.085 * Math.exp(-t * (baseDecay * 3.1));
    const h4 = Math.sin(4 * w) * 0.03 * Math.exp(-t * (baseDecay * 4.8));

    out[idx] += (h1 + h2 + h3 + h4) * env * amp;
  }
}

/**
 * Warm bowed orchestral string ensemble voice (cello / viola / violin) with gentle vibrato.
 */
function addWarmStringVoice(
  out,
  startSec,
  freq,
  durSec,
  amp = 0.095,
  attackSec = 0.28,
  releaseSec = 0.36
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const atk = Math.min(attackSec, durSec * 0.42);
  const rel = Math.min(releaseSec, durSec * 0.42);
  let phaseA = 0;
  let phaseB = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < atk) env *= raisedCosineRamp(t, atk);
    if (t > durSec - rel) env *= raisedCosineRamp(durSec - t, rel);

    const vibFade = Math.min(1, t / 0.4);
    const vib = 0.0036 * vibFade * Math.sin(2 * Math.PI * 4.6 * t);
    phaseA += (2 * Math.PI * freq * (1 + vib)) / SAMPLE_RATE;
    // Slight chorusing detune for lush string-section warmth
    phaseB += (2 * Math.PI * freq * (1.0016 + vib * 0.85)) / SAMPLE_RATE;

    const voiceA =
      Math.sin(phaseA) * 0.58 +
      Math.sin(2 * phaseA) * 0.26 +
      Math.sin(3 * phaseA) * 0.11 +
      Math.sin(4 * phaseA) * 0.04;
    const voiceB =
      Math.sin(phaseB) * 0.52 +
      Math.sin(2 * phaseB) * 0.22 +
      Math.sin(3 * phaseB) * 0.09;

    out[idx] += (voiceA * 0.62 + voiceB * 0.38) * env * amp;
  }
}

/**
 * Gentle Victorian brass sleigh-bell shimmer shake for festive waltz & finale sparkle.
 */
function addSleighBellShimmer(out, startSec, amp = 0.042, durSec = 0.34) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const partials = [
    [2349, 0.34, 14.0],
    [3136, 0.28, 16.5],
    [3951, 0.22, 19.0],
    [4978, 0.16, 22.0],
    [6272, 0.11, 26.0],
  ];
  let hpPrev = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const atk = t < 0.005 ? raisedCosineRamp(t, 0.005) : 1.0;
    const rel =
      t > durSec - 0.05 ? raisedCosineRamp(durSec - t, 0.05) : 1.0;

    let bells = 0;
    for (let p = 0; p < partials.length; p++) {
      const [f, w, decay] = partials[p];
      bells += Math.sin(2 * Math.PI * f * t + p * 0.9) * w * Math.exp(-t * decay);
    }

    // Subtle double-tap rattle envelope
    const shakeMod = 0.72 + 0.28 * Math.sin(2 * Math.PI * 19.0 * t);
    const raw = whiteNoise();
    const hp = raw - hpPrev;
    hpPrev = raw;
    const metallicAir = hp * Math.exp(-t * 28.0) * 0.14;

    out[idx] += (bells * shakeMod + metallicAir) * atk * rel * amp;
  }
}

/**
 * Delicate frosty winter breeze shimmer under Section 1's snowy dusk opening.
 */
function addWinterFrostAir(out, startSec, endSec, amp = 0.012) {
  const startIdx = Math.max(0, Math.floor(startSec * SAMPLE_RATE));
  const endIdx = Math.min(out.length, Math.floor(endSec * SAMPLE_RATE));
  const totalDur = Math.max(0.2, endSec - startSec);
  let lp1 = 0;
  let lp2 = 0;

  for (let idx = startIdx; idx < endIdx; idx++) {
    const localT = idx / SAMPLE_RATE - startSec;
    let env = 1.0;
    if (localT < 1.0) env *= raisedCosineRamp(localT, 1.0);
    if (localT > totalDur - 1.2) {
      env *= raisedCosineRamp(totalDur - localT, 1.2);
    }
    const gust = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.24 * localT);
    const n = whiteNoise();
    lp1 = 0.94 * lp1 + 0.06 * n;
    lp2 = 0.88 * lp2 + 0.12 * lp1;
    const band = lp1 - lp2;
    out[idx] += band * gust * env * amp;
  }
}

export function generateChristmasHearthBgm(dur = 38.0) {
  resetSeed(0x1225baab);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function addHarpArp(time, notes, stepSec, noteDur, amp = 0.11) {
    for (let i = 0; i < notes.length; i++) {
      addHarpPluck(out, time + i * stepSec, NOTES[notes[i]], noteDur, amp);
    }
  }

  // =========================================================================
  // SECTION 1 (0.0s - 11.0s): Snowy Dusk & Cold Shop
  // Gentle G-minor Victorian winter celesta & soft pizzicato strings waltz
  // 100 BPM in 3/4 (beat = 0.60s, bar = 1.80s, 6 bars = 0.15s .. 10.95s)
  // =========================================================================
  addWinterFrostAir(out, 0.0, 10.8, 0.022);

  const sec1Bars = [
    { t: 0.15, bass: 'G2', pad: 'G3', pizz: [['D4', 'Bb3'], ['D4', 'Bb3']] },
    { t: 1.95, bass: 'C3', pad: 'G3', pizz: [['Eb4', 'C4'], ['Eb4', 'C4']] },
    { t: 3.75, bass: 'D2', pad: 'A3', pizz: [['D4', 'Fs3'], ['C4', 'A3']] },
    { t: 5.55, bass: 'G2', pad: 'Bb3', pizz: [['D4', 'Bb3'], ['G4', 'D4']] },
    { t: 7.35, bass: 'Eb2', pad: 'Bb3', pizz: [['Eb4', 'Bb3'], ['G4', 'Eb4']] },
    { t: 9.15, bass: 'D2', pad: 'A3', pizz: [['C4', 'Fs3'], ['D4', 'A3']] },
  ];

  for (const bar of sec1Bars) {
    // Chilly soft sustained string drone beneath the pizzicato waltz
    addWarmStringVoice(out, bar.t, NOTES[bar.bass], 1.78, 0.062, 0.35, 0.4);
    addWarmStringVoice(out, bar.t + 0.08, NOTES[bar.pad], 1.65, 0.042, 0.4, 0.42);

    // Beat 1 low pizzicato cello bass
    addPizzString(out, bar.t, NOTES[bar.bass], 0.32, 0.155);
    // Beats 2 & 3 soft pizzicato upper-string waltz dyads
    for (let b = 0; b < 2; b++) {
      const bt = bar.t + (b + 1) * 0.6;
      const [n1, n2] = bar.pizz[b];
      addPizzString(out, bt, NOTES[n1], 0.24, 0.105);
      addPizzString(out, bt + 0.012, NOTES[n2], 0.24, 0.086);
    }
  }

  // Wistful G-minor Victorian winter celesta melody
  const sec1Melody = [
    // Bar 1 (Gm)
    [0.15, 'D5', 0.95, 0.135],
    [1.05, 'Bb4', 0.42, 0.12],
    [1.35, 'G4', 0.65, 0.125],
    // Bar 2 (Cm)
    [1.95, 'Eb5', 0.92, 0.138],
    [2.85, 'D5', 0.42, 0.125],
    [3.15, 'C5', 0.68, 0.128],
    // Bar 3 (D7)
    [3.75, 'D5', 0.62, 0.132],
    [4.35, 'C5', 0.58, 0.125],
    [4.95, 'A4', 0.45, 0.118],
    [5.25, 'Fs4', 0.45, 0.115],
    // Bar 4 (Gm)
    [5.55, 'G4', 0.62, 0.128],
    [6.15, 'A4', 0.58, 0.125],
    [6.75, 'Bb4', 0.65, 0.132],
    [7.05, 'D5', 0.42, 0.125],
    // Bar 5 (EbMaj7)
    [7.35, 'G5', 0.88, 0.138],
    [8.25, 'F5', 0.4, 0.122],
    [8.55, 'Eb5', 0.65, 0.128],
    // Bar 6 (D7 wistful cadence breath before Barnaby)
    [9.15, 'D5', 0.72, 0.132],
    [9.75, 'C5', 0.55, 0.12],
    [10.35, 'A4', 0.62, 0.11],
  ];
  for (const [t, note, d, a] of sec1Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Delicate snowflakes glistening in high celesta register
  addCelestaNote(out, 0.75, NOTES.G6, 0.85, 0.042);
  addCelestaNote(out, 2.55, NOTES.D6, 0.85, 0.04);
  addCelestaNote(out, 6.45, NOTES.Bb5, 0.85, 0.044);
  addCelestaNote(out, 8.85, NOTES.G6, 0.9, 0.038);

  // =========================================================================
  // SECTION 2A (11.0s - 19.0s): Grumpy Barnaby Comedy Bounce
  // Playful staccato bassoon & pizzicato strings at 120 BPM (beat = 0.50s)
  // =========================================================================
  const bassoonLine = [
    // Bar 1 (11.0 - 13.0s): Grumpy muttering walk in G minor
    [11.0, 'G2', 0.22, 0.185],
    [11.5, 'Bb2', 0.2, 0.17],
    [12.0, 'C3', 0.2, 0.175],
    [12.25, 'Cs3', 0.18, 0.165],
    [12.5, 'D3', 0.24, 0.19],
    [12.75, 'A2', 0.18, 0.165],
    // Bar 2 (13.0 - 15.0s): Slipper-shuffle hop (Cm -> Gm)
    [13.0, 'C3', 0.22, 0.185],
    [13.5, 'Eb3', 0.2, 0.175],
    [14.0, 'D3', 0.22, 0.18],
    [14.25, 'C3', 0.18, 0.165],
    [14.5, 'Bb2', 0.22, 0.18],
    [14.75, 'G2', 0.18, 0.17],
    // Bar 3 (15.0 - 17.0s): Curious peek at the frosted window (Eb -> D7)
    [15.0, 'Eb2', 0.22, 0.185],
    [15.5, 'G2', 0.2, 0.175],
    [15.75, 'Bb2', 0.18, 0.17],
    [16.0, 'D3', 0.22, 0.185],
    [16.5, 'C3', 0.2, 0.175],
    [16.75, 'A2', 0.18, 0.17],
    // Bar 4 (17.0 - 19.0s): Grumpiness softens -> warm D7 turnaround
    [17.0, 'G2', 0.22, 0.185],
    [17.5, 'Bb2', 0.2, 0.17],
    [18.0, 'A2', 0.22, 0.175],
    [18.25, 'C3', 0.2, 0.17],
    [18.5, 'D3', 0.34, 0.18],
  ];
  for (const [t, note, d, a] of bassoonLine) {
    addStaccatoBassoon(out, t, NOTES[note], d, a);
    // Double downbeats subtly with crisp bass pizzicato for extra bounce
    if (Math.abs((t * 2) % 1) < 0.02) {
      addPizzString(out, t, NOTES[note], 0.19, 0.095);
    }
  }

  // Cheeky offbeat pizzicato string chords & playful upper celesta stabs
  const comedyOffbeats = [
    [11.25, ['G3', 'Bb3', 'D4']],
    [11.75, ['G3', 'Bb3', 'D4']],
    [12.25, ['A3', 'D4']],
    [12.75, ['Fs3', 'C4', 'D4']],
    [13.25, ['G3', 'C4', 'Eb4']],
    [13.75, ['G3', 'C4', 'Eb4']],
    [14.25, ['G3', 'Bb3', 'D4']],
    [14.75, ['G3', 'Bb3', 'D4']],
    [15.25, ['G3', 'Bb3', 'Eb4']],
    [15.75, ['G3', 'Bb3', 'Eb4']],
    [16.25, ['Fs3', 'A3', 'D4']],
    [16.75, ['Fs3', 'C4', 'D4']],
    [17.25, ['G3', 'Bb3', 'D4']],
    [17.75, ['G3', 'Bb3', 'D4']],
    [18.25, ['A3', 'C4', 'E4']],
    [18.75, ['Fs3', 'A3', 'D4']],
  ];
  for (const [t, chord] of comedyOffbeats) {
    for (let i = 0; i < chord.length; i++) {
      addPizzString(out, t + i * 0.008, NOTES[chord[i]], 0.18, 0.075);
    }
  }

  // Playful comedic upper celesta & pizzicato grace-note banter
  const comedyTop = [
    [11.5, 'D5', 0.24, 0.105],
    [11.75, 'Bb4', 0.22, 0.095],
    [12.5, 'Fs4', 0.22, 0.095],
    [12.68, 'G4', 0.22, 0.105],
    [13.5, 'Eb5', 0.26, 0.11],
    [13.75, 'D5', 0.22, 0.1],
    [14.5, 'Bb4', 0.24, 0.1],
    [15.5, 'G5', 0.26, 0.11],
    [15.75, 'F5', 0.22, 0.1],
    [16.0, 'Fs5', 0.28, 0.11],
    [16.5, 'D5', 0.25, 0.105],
    [17.5, 'D5', 0.24, 0.105],
    [18.0, 'E5', 0.28, 0.11],
    [18.5, 'Fs5', 0.42, 0.12],
  ];
  for (const [t, note, d, a] of comedyTop) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // =========================================================================
  // SECTION 2B (19.0s - 23.0s): Heart Melts & Fireplace Ignites!
  // Warm shimmering concert harp & celesta swell modulating to radiant G Major
  // =========================================================================
  // Swelling warm orchestral strings lifting from soft glow into golden blaze
  addWarmStringVoice(out, 19.0, NOTES.D2, 4.15, 0.082, 0.7, 0.35);
  addWarmStringVoice(out, 19.1, NOTES.A2, 4.05, 0.062, 0.75, 0.35);
  addWarmStringVoice(out, 19.25, NOTES.Fs3, 3.9, 0.054, 0.8, 0.35);
  addWarmStringVoice(out, 20.4, NOTES.C4, 2.7, 0.05, 0.6, 0.35);
  addWarmStringVoice(out, 21.35, NOTES.A4, 1.85, 0.054, 0.5, 0.35);
  addWarmStringVoice(out, 21.8, NOTES.D5, 1.4, 0.058, 0.45, 0.3);

  // Sweeping ascending harp glissandi as the hearth embers catch flame
  addHarpArp(
    19.0,
    ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'E5', 'Fs5', 'A5'],
    0.11,
    1.55,
    0.095
  );
  addHarpArp(
    20.25,
    ['C3', 'G3', 'B3', 'D4', 'E4', 'G4', 'B4', 'D5', 'G5'],
    0.11,
    1.5,
    0.105
  );
  addHarpArp(
    21.55,
    ['D3', 'A3', 'C4', 'D4', 'Fs4', 'A4', 'C5', 'D5', 'Fs5', 'A5', 'D6'],
    0.105,
    1.55,
    0.115
  );

  // Shimmering celesta flame-sparkle bloom rising into the Christmas waltz
  const swellCelesta = [
    [19.2, 'A4', 0.9, 0.115],
    [19.65, 'D5', 0.9, 0.125],
    [20.1, 'Fs5', 0.95, 0.13],
    [20.6, 'G5', 0.95, 0.135],
    [21.1, 'E5', 0.85, 0.13],
    [21.6, 'Fs5', 0.85, 0.14],
    [22.0, 'A5', 0.85, 0.148],
    [22.35, 'B5', 0.72, 0.152],
    [22.65, 'C6', 0.65, 0.155],
  ];
  for (const [t, note, d, a] of swellCelesta) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Herald sleigh-bell shimmer just as the hearth bursts into golden light
  addSleighBellShimmer(out, 22.45, 0.036, 0.45);

  // =========================================================================
  // SECTION 3 (23.0s - 38.0s): Warm Hearth & Starlit Christmas Square
  // Joyful G-major Christmas Waltz (120 BPM, 3/4, beat = 0.50s, bar = 1.50s)
  // 8 lush bars (23.0s - 35.0s) + Classic Heartwarming Finale Chord (35.0 - 38.0s)
  // =========================================================================
  const sec3Bars = [
    {
      t: 23.0,
      bass: 'G2',
      mid: 'B3',
      high: 'D4',
      arp: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'],
      sleigh: true,
    },
    {
      t: 24.5,
      bass: 'Fs2',
      mid: 'A3',
      high: 'D4',
      arp: ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'],
      sleigh: true,
    },
    {
      t: 26.0,
      bass: 'E2',
      mid: 'G3',
      high: 'B3',
      arp: ['E3', 'B3', 'E4', 'G4', 'B4', 'E5'],
      sleigh: true,
    },
    {
      t: 27.5,
      bass: 'C3',
      mid: 'G3',
      high: 'C4',
      arp: ['C3', 'G3', 'C4', 'E4', 'G4', 'D5'],
      sleigh: true,
    },
    {
      t: 29.0,
      bass: 'G2',
      mid: 'B3',
      high: 'G4',
      arp: ['G3', 'D4', 'G4', 'B4', 'D5', 'G5'],
      sleigh: true,
    },
    {
      t: 30.5,
      bass: 'C3',
      mid: 'E4',
      high: 'G4',
      arp: ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'],
      sleigh: true,
    },
    {
      t: 32.0,
      bass: 'A2',
      mid: 'C4',
      high: 'E4',
      arp: ['A3', 'C4', 'E4', 'G4', 'A4', 'C5'],
      sleigh: true,
    },
    {
      t: 33.5,
      bass: 'D2',
      mid: 'A3',
      high: 'Fs4',
      arp: ['D3', 'A3', 'C4', 'D4', 'Fs4', 'A4'],
      sleigh: true,
    },
  ];

  for (const bar of sec3Bars) {
    // Lush warm string choir harmonies
    addWarmStringVoice(out, bar.t, NOTES[bar.bass], 1.58, 0.125, 0.2, 0.3);
    addWarmStringVoice(out, bar.t + 0.04, NOTES[bar.mid], 1.54, 0.082, 0.24, 0.3);
    addWarmStringVoice(out, bar.t + 0.08, NOTES[bar.high], 1.48, 0.068, 0.26, 0.3);

    // Flowing Christmas harp waltz arpeggios (6 eighth-note ripples per 3/4 bar)
    for (let i = 0; i < bar.arp.length; i++) {
      addHarpPluck(
        out,
        bar.t + i * 0.25,
        NOTES[bar.arp[i]],
        1.15,
        i === 0 ? 0.122 : 0.092
      );
    }

    // Light warm pizzicato waltz pulse reinforcing beat 1
    addPizzString(out, bar.t, NOTES[bar.bass], 0.28, 0.102);

    // Gentle festive sleigh-bell shimmer on beat 1 and delicate offbeat lilt
    if (bar.sleigh) {
      addSleighBellShimmer(out, bar.t, 0.05, 0.32);
      addSleighBellShimmer(out, bar.t + 1.0, 0.032, 0.24);
    }
  }

  // Joyful G-major Christmas celesta melody with warm counter-harmony
  const sec3Melody = [
    // Bar 1 (G): Radiant soaring theme
    [23.0, 'D5', 0.55, 0.155],
    [23.5, 'G5', 0.55, 0.165],
    [24.0, 'B5', 0.62, 0.168],
    // Bar 2 (D/Fs)
    [24.5, 'A5', 0.78, 0.162],
    [25.25, 'G5', 0.32, 0.145],
    [25.5, 'Fs5', 0.58, 0.152],
    // Bar 3 (Em7)
    [26.0, 'G5', 0.55, 0.158],
    [26.5, 'E5', 0.52, 0.15],
    [27.0, 'B4', 0.58, 0.142],
    // Bar 4 (C -> D7)
    [27.5, 'C5', 0.52, 0.152],
    [28.0, 'E5', 0.52, 0.158],
    [28.5, 'G5', 0.38, 0.155],
    [28.75, 'Fs5', 0.35, 0.148],
    // Bar 5 (G): Brighter soaring repeat
    [29.0, 'G5', 0.55, 0.165],
    [29.5, 'B5', 0.55, 0.172],
    [30.0, 'D6', 0.62, 0.165],
    // Bar 6 (C): Joyous starlit square crest
    [30.5, 'C6', 0.78, 0.168],
    [31.25, 'B5', 0.32, 0.152],
    [31.5, 'G5', 0.58, 0.158],
    // Bar 7 (Am7): Tender heartwarming descent
    [32.0, 'A5', 0.55, 0.162],
    [32.5, 'G5', 0.55, 0.155],
    [33.0, 'E5', 0.58, 0.148],
    // Bar 8 (D7): Theatrical broadening cadence into finale
    [33.5, 'Fs5', 0.68, 0.16],
    [34.1, 'A5', 0.58, 0.165],
    [34.58, 'D6', 0.55, 0.16],
  ];
  for (const [t, note, d, a] of sec3Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // Sweeping harp pickup gliss into the theatrical finale chord (34.45 - 35.0s)
  addHarpArp(
    34.45,
    ['D4', 'Fs4', 'A4', 'C5', 'D5', 'Fs5', 'A5'],
    0.075,
    1.1,
    0.095
  );

  // =========================================================================
  // FINALE CHORD (35.0s - 38.0s): Classic Heartwarming Gmaj9 Theatrical Finale
  // =========================================================================
  const finaleStrings = [
    ['G2', 0.125, 0.0],
    ['D3', 0.092, 0.03],
    ['G3', 0.082, 0.06],
    ['B3', 0.074, 0.09],
    ['D4', 0.068, 0.12],
    ['Fs4', 0.052, 0.16],
    ['A4', 0.048, 0.2],
    ['G5', 0.056, 0.24],
  ];
  for (const [note, amp, delay] of finaleStrings) {
    addWarmStringVoice(
      out,
      35.0 + delay,
      NOTES[note],
      2.65 - delay * 0.5,
      amp,
      0.24,
      0.85
    );
  }

  // Classic storybook harp & celesta golden flourish crowning the finale
  addHarpArp(
    35.0,
    ['G3', 'B3', 'D4', 'Fs4', 'A4', 'B4', 'D5', 'G5'],
    0.095,
    2.45,
    0.115
  );

  const finaleCelesta = [
    [35.0, 'G5', 2.4, 0.155],
    [35.14, 'B5', 2.25, 0.14],
    [35.3, 'D6', 2.1, 0.132],
    [35.48, 'Fs6', 1.85, 0.095],
    [35.66, 'G6', 1.75, 0.11],
  ];
  for (const [t, note, d, a] of finaleCelesta) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // Final sparkling Victorian sleigh-bell shimmer & soft echo
  addSleighBellShimmer(out, 35.02, 0.052, 0.5);
  addSleighBellShimmer(out, 35.75, 0.024, 0.45);

  // Gentle warm tape-style soft limiter + smooth fade-in (0.0-0.25s) & clean finale fade-out
  const fadeOutStart = Math.max(0, dur - 1.65);
  const silenceAt = Math.max(fadeOutStart + 0.1, dur - 0.2);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let masterEnv = 1.0;
    if (t < 0.25) {
      masterEnv = raisedCosineRamp(t, 0.25);
    } else if (t >= silenceAt) {
      masterEnv = 0.0;
    } else if (t > fadeOutStart) {
      masterEnv = raisedCosineRamp(silenceAt - t, silenceAt - fadeOutStart);
    }
    const shaped = Math.tanh(out[i] * 1.15) / 1.15;
    out[i] = shaped * masterEnv;
  }

  return out;
}

export const CHRISTMAS_HEARTH_BGM_CLIP = {
  id: 'christmas-hearth-bgm',
  filename: 'christmas-hearth-bgm.wav',
  src: '/audio/christmas-hearth-bgm.wav',
  title: "Barnaby's Christmas Hearth — Dynamic Victorian Holiday Score",
  category: 'bgm',
  durationSec: 38.0,
  defaultVolume: 0.25,
  targetPeak: 0.72,
  description:
    'Dynamic 3-section 38.0s Dickensian Christmas score: (1) Snowy Dusk & Cold Shop (0-11s) gentle G-minor Victorian winter celesta & soft pizzicato strings waltz with frosty air shimmer; (2) Grumpy Barnaby to Heart Melts (11-23s) playful 120 BPM staccato bassoon & pizzicato comedy bounce (11-19s) blooming into a warm shimmering concert harp, celesta & orchestral string swell (19-23s) as the hearth ignites; (3) Warm Hearth & Starlit Christmas Square (23-38s) joyful G-major Christmas waltz with celesta melody, warm string harmonies, gentle sleigh-bell shimmer, and a heartwarming Gmaj9 theatrical finale chord.',
  themes: [
    'christmas',
    'winter',
    'cozy_village',
    'hearth',
    'celebration',
    'classic',
  ],
  generate: () => generateChristmasHearthBgm(38.0),
};

export const {
  id,
  filename,
  src,
  title,
  category,
  durationSec,
  defaultVolume,
  targetPeak,
  description,
  themes,
  generate,
} = CHRISTMAS_HEARTH_BGM_CLIP;

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const outPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../public/audio',
    CHRISTMAS_HEARTH_BGM_CLIP.filename
  );
  const samples = CHRISTMAS_HEARTH_BGM_CLIP.generate();
  writeWav(outPath, samples, CHRISTMAS_HEARTH_BGM_CLIP.targetPeak);
  console.log(
    `Generated ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`
  );
}

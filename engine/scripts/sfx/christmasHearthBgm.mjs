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

    const shakeMod = 0.72 + 0.28 * Math.sin(2 * Math.PI * 19.0 * t);
    const raw = whiteNoise();
    const hp = raw - hpPrev;
    hpPrev = raw;
    const metallicAir = hp * Math.exp(-t * 28.0) * 0.14;

    out[idx] += (bells * shakeMod + metallicAir) * atk * rel * amp;
  }
}

/**
 * Delicate frosty winter breeze shimmer under the outdoor snowy dusk opening.
 */
function addWinterFrostAir(out, startSec, endSec, amp = 0.02) {
  const startIdx = Math.max(0, Math.floor(startSec * SAMPLE_RATE));
  const endIdx = Math.min(out.length, Math.floor(endSec * SAMPLE_RATE));
  const totalDur = Math.max(0.2, endSec - startSec);
  let lp1 = 0;
  let lp2 = 0;

  for (let idx = startIdx; idx < endIdx; idx++) {
    const localT = idx / SAMPLE_RATE - startSec;
    let env = 1.0;
    if (localT < 1.0) env *= raisedCosineRamp(localT, 1.0);
    if (localT > totalDur - 1.1) {
      env *= raisedCosineRamp(totalDur - localT, 1.1);
    }
    const gust = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.24 * localT);
    const n = whiteNoise();
    lp1 = 0.94 * lp1 + 0.06 * n;
    lp2 = 0.88 * lp2 + 0.12 * lp1;
    const band = lp1 - lp2;
    out[idx] += band * gust * env * amp;
  }
}

export function generateChristmasHearthBgm(dur = 48.0) {
  resetSeed(0x1225baab);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function addHarpArp(time, notes, stepSec, noteDur, amp = 0.11) {
    for (let i = 0; i < notes.length; i++) {
      addHarpPluck(out, time + i * stepSec, NOTES[notes[i]], noteDur, amp);
    }
  }

  // =========================================================================
  // SECTION 1 (0.0s - 16.5s): Snowy Victorian Dusk & Chilly Shop Entry
  // Gentle G-minor Victorian winter celesta & soft pizzicato strings waltz
  // 100 BPM in 3/4 (beat = 0.60s, bar = 1.80s, 9 bars = 0.15s .. 16.35s)
  // Bars 1-6 (0.15-10.95s): Snowy dusk lane; Bars 7-9 (10.95-16.35s): Chilly shop entry
  // =========================================================================
  addWinterFrostAir(out, 0.0, 11.2, 0.022);

  const sec1Bars = [
    // Outdoor snowy Victorian dusk (Zone A: 0.0 - 11.2s)
    { t: 0.15, bass: 'G2', pad: 'G3', pizz: [['D4', 'Bb3'], ['D4', 'Bb3']] },
    { t: 1.95, bass: 'C3', pad: 'G3', pizz: [['Eb4', 'C4'], ['Eb4', 'C4']] },
    { t: 3.75, bass: 'D2', pad: 'A3', pizz: [['D4', 'Fs3'], ['C4', 'A3']] },
    { t: 5.55, bass: 'G2', pad: 'Bb3', pizz: [['D4', 'Bb3'], ['G4', 'D4']] },
    { t: 7.35, bass: 'Eb2', pad: 'Bb3', pizz: [['Eb4', 'Bb3'], ['G4', 'Eb4']] },
    { t: 9.15, bass: 'D2', pad: 'A3', pizz: [['C4', 'Fs3'], ['D4', 'A3']] },
    // Chilly shop entry & Pippin's cheerful greeting (11.2 - 16.5s)
    { t: 10.95, bass: 'G2', pad: 'Bb3', pizz: [['D4', 'Bb3'], ['G4', 'D4']] },
    { t: 12.75, bass: 'Bb2', pad: 'F3', pizz: [['D4', 'F4'], ['C4', 'Eb4']] },
    { t: 14.55, bass: 'D2', pad: 'A3', pizz: [['C4', 'Fs3'], ['D4', 'A3']] },
  ];

  for (const bar of sec1Bars) {
    addWarmStringVoice(out, bar.t, NOTES[bar.bass], 1.78, 0.06, 0.35, 0.4);
    addWarmStringVoice(out, bar.t + 0.08, NOTES[bar.pad], 1.65, 0.04, 0.4, 0.42);

    // Beat 1 low pizzicato cello bass
    addPizzString(out, bar.t, NOTES[bar.bass], 0.32, 0.15);
    // Beats 2 & 3 soft pizzicato upper-string waltz dyads
    for (let b = 0; b < 2; b++) {
      const bt = bar.t + (b + 1) * 0.6;
      const [n1, n2] = bar.pizz[b];
      addPizzString(out, bt, NOTES[n1], 0.24, 0.1);
      addPizzString(out, bt + 0.012, NOTES[n2], 0.24, 0.082);
    }
  }

  // Wistful G-minor Victorian winter celesta melody brightening as Pippin enters
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
    // Bar 6 (D7 cadence right at shop door cut ~11.2s)
    [9.15, 'D5', 0.72, 0.132],
    [9.75, 'C5', 0.55, 0.12],
    [10.35, 'A4', 0.6, 0.115],
    // Bar 7 (Gm -> lively Pippin entry into counting shop)
    [10.95, 'Bb4', 0.58, 0.132],
    [11.55, 'D5', 0.55, 0.138],
    [12.15, 'G5', 0.62, 0.14],
    // Bar 8 (Bb -> Cm bright squirrel cheerfulness)
    [12.75, 'F5', 0.58, 0.138],
    [13.35, 'D5', 0.52, 0.132],
    [13.95, 'Eb5', 0.58, 0.132],
    // Bar 9 (D7 expectant pause before Barnaby's tirade at 16.5s)
    [14.55, 'D5', 0.62, 0.132],
    [15.15, 'C5', 0.55, 0.122],
    [15.75, 'A4', 0.58, 0.115],
  ];
  for (const [t, note, d, a] of sec1Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Frosty snowflake glints outdoors & subtle door-chime sparkle at shop entry
  addCelestaNote(out, 0.75, NOTES.G6, 0.85, 0.042);
  addCelestaNote(out, 2.55, NOTES.D6, 0.85, 0.04);
  addCelestaNote(out, 6.45, NOTES.Bb5, 0.85, 0.044);
  addCelestaNote(out, 8.85, NOTES.G6, 0.9, 0.038);
  addSleighBellShimmer(out, 11.25, 0.028, 0.34);

  // =========================================================================
  // SECTION 2 (16.5s - 28.8s): Barnaby's Grumpy Tirade & Pippin's Persuasion
  // Playful 120 BPM staccato bassoon & pizzicato strings comedy bounce
  // 6 crisp bars (beat = 0.50s, bar = 2.0s: 16.5s .. 28.5s) + dominant breath -> 28.8s
  // =========================================================================
  const bassoonLine = [
    // Bar 1 (16.5 - 18.5s): Barnaby's grumpy tirade begins ("Bah! Cold toes!")
    [16.5, 'G2', 0.22, 0.185],
    [17.0, 'Bb2', 0.2, 0.172],
    [17.5, 'C3', 0.2, 0.175],
    [17.75, 'Cs3', 0.18, 0.168],
    [18.0, 'D3', 0.24, 0.19],
    [18.25, 'A2', 0.18, 0.168],
    // Bar 2 (18.5 - 20.5s): Cantankerous finger-wagging bounce (Cm -> Gm)
    [18.5, 'C3', 0.22, 0.185],
    [19.0, 'Eb3', 0.2, 0.175],
    [19.5, 'D3', 0.22, 0.182],
    [19.75, 'C3', 0.18, 0.168],
    [20.0, 'Bb2', 0.22, 0.18],
    [20.25, 'G2', 0.18, 0.172],
    // Bar 3 (20.5 - 22.5s): Grumpy huff & spectacles-push (Eb -> D7)
    [20.5, 'Eb2', 0.22, 0.185],
    [21.0, 'G2', 0.2, 0.175],
    [21.25, 'Bb2', 0.18, 0.172],
    [21.5, 'D3', 0.22, 0.185],
    [22.0, 'C3', 0.2, 0.175],
    [22.25, 'A2', 0.18, 0.172],
    // Bar 4 (22.5 - 24.5s): Barnaby finishes grumbling -> Pippin steps forward
    [22.5, 'G2', 0.22, 0.182],
    [23.0, 'D3', 0.2, 0.172],
    [23.5, 'Bb2', 0.2, 0.165],
    [24.0, 'G2', 0.24, 0.165],
    // Bar 5 (24.5 - 26.5s): Pippin's warm gentle persuasion + Bramble robin hops
    [24.5, 'Eb2', 0.24, 0.158],
    [25.0, 'G2', 0.22, 0.152],
    [25.5, 'C3', 0.24, 0.155],
    [26.0, 'Bb2', 0.22, 0.15],
    // Bar 6 (26.5 - 28.5s): Heart begins to soften -> hopeful D7 lift into hearth ignition
    [26.5, 'A2', 0.24, 0.152],
    [27.0, 'C3', 0.22, 0.152],
    [27.5, 'D3', 0.26, 0.16],
    [28.0, 'Fs3', 0.24, 0.155],
    [28.35, 'D3', 0.36, 0.155],
  ];
  for (const [t, note, d, a] of bassoonLine) {
    addStaccatoBassoon(out, t, NOTES[note], d, a);
    if (Math.abs(((t - 16.5) * 2) % 1) < 0.02) {
      addPizzString(out, t, NOTES[note], 0.19, 0.095);
    }
  }

  // Cheeky offbeat pizzicato chords through Barnaby's comedy & Pippin's reply
  const comedyOffbeats = [
    [16.75, ['G3', 'Bb3', 'D4']],
    [17.25, ['G3', 'Bb3', 'D4']],
    [17.75, ['A3', 'D4']],
    [18.25, ['Fs3', 'C4', 'D4']],
    [18.75, ['G3', 'C4', 'Eb4']],
    [19.25, ['G3', 'C4', 'Eb4']],
    [19.75, ['G3', 'Bb3', 'D4']],
    [20.25, ['G3', 'Bb3', 'D4']],
    [20.75, ['G3', 'Bb3', 'Eb4']],
    [21.25, ['G3', 'Bb3', 'Eb4']],
    [21.75, ['Fs3', 'A3', 'D4']],
    [22.25, ['Fs3', 'C4', 'D4']],
    [22.75, ['G3', 'Bb3', 'D4']],
    [23.25, ['G3', 'Bb3', 'D4']],
    [23.75, ['G3', 'Bb3', 'D4']],
    [24.25, ['G3', 'Bb3', 'D4']],
    [24.75, ['G3', 'Bb3', 'Eb4']],
    [25.25, ['G3', 'Bb3', 'Eb4']],
    [25.75, ['G3', 'C4', 'Eb4']],
    [26.25, ['G3', 'Bb3', 'D4']],
    [26.75, ['A3', 'C4', 'E4']],
    [27.25, ['A3', 'C4', 'E4']],
    [27.75, ['Fs3', 'A3', 'D4']],
    [28.25, ['Fs3', 'C4', 'D4']],
  ];
  for (const [t, chord] of comedyOffbeats) {
    for (let i = 0; i < chord.length; i++) {
      addPizzString(out, t + i * 0.008, NOTES[chord[i]], 0.18, 0.075);
    }
  }

  // Playful upper celesta comic stabs turning tender during Pippin's persuasion (23.7-28.5s)
  const comedyTop = [
    [17.0, 'D5', 0.24, 0.105],
    [17.25, 'Bb4', 0.22, 0.095],
    [18.0, 'Fs4', 0.22, 0.095],
    [18.18, 'G4', 0.22, 0.105],
    [19.0, 'Eb5', 0.26, 0.11],
    [19.25, 'D5', 0.22, 0.1],
    [20.0, 'Bb4', 0.24, 0.1],
    [21.0, 'G5', 0.26, 0.11],
    [21.25, 'F5', 0.22, 0.1],
    [21.5, 'Fs5', 0.28, 0.11],
    [22.0, 'D5', 0.25, 0.105],
    // Pippin & Bramble warm gentle persuasion motifs
    [23.75, 'Bb4', 0.42, 0.11],
    [24.25, 'D5', 0.45, 0.115],
    [24.75, 'Eb5', 0.48, 0.118],
    [25.25, 'G5', 0.48, 0.122],
    [25.75, 'F5', 0.42, 0.115],
    [26.25, 'D5', 0.45, 0.115],
    [26.75, 'E5', 0.48, 0.118],
    [27.25, 'Fs5', 0.52, 0.125],
    [27.75, 'A5', 0.55, 0.13],
    [28.25, 'D6', 0.5, 0.125],
  ];
  for (const [t, note, d, a] of comedyTop) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Gentle harp shimmer preview right as Barnaby turns toward the hearth (27.6-28.7s)
  addHarpArp(27.6, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'C5', 'D5'], 0.14, 1.15, 0.085);

  // =========================================================================
  // SECTION 3 (28.8s - 36.2s): Fireplace Ignites & Barnaby's Heart Melts!
  // Warm shimmering concert harp, celesta & swelling orchestral strings (7.4s)
  // =========================================================================
  // Swelling warm string choir blossoming from hearth spark (28.8s) to golden radiance (36.2s)
  // Phrase 1 (28.8 - 30.7s): Gmaj9 warm hearth blaze
  addWarmStringVoice(out, 28.8, NOTES.G2, 2.15, 0.092, 0.45, 0.4);
  addWarmStringVoice(out, 28.9, NOTES.D3, 2.05, 0.068, 0.5, 0.4);
  addWarmStringVoice(out, 29.0, NOTES.B3, 1.95, 0.056, 0.55, 0.4);
  addWarmStringVoice(out, 29.15, NOTES.Fs4, 1.8, 0.048, 0.55, 0.4);

  // Phrase 2 (30.7 - 32.5s): Cmaj7 cozy heart-melting warmth
  addWarmStringVoice(out, 30.7, NOTES.C3, 2.0, 0.095, 0.4, 0.4);
  addWarmStringVoice(out, 30.8, NOTES.G3, 1.9, 0.068, 0.45, 0.4);
  addWarmStringVoice(out, 30.9, NOTES.E4, 1.8, 0.056, 0.45, 0.4);
  addWarmStringVoice(out, 31.05, NOTES.B4, 1.65, 0.048, 0.45, 0.4);

  // Phrase 3 (32.5 - 34.3s): Am7 -> G/B joyful gratitude
  addWarmStringVoice(out, 32.5, NOTES.A2, 2.0, 0.096, 0.38, 0.4);
  addWarmStringVoice(out, 32.6, NOTES.E3, 1.9, 0.068, 0.42, 0.4);
  addWarmStringVoice(out, 32.7, NOTES.C4, 1.8, 0.058, 0.42, 0.4);
  addWarmStringVoice(out, 32.85, NOTES.G4, 1.65, 0.052, 0.42, 0.4);

  // Phrase 4 (34.3 - 36.2s): Soaring D9sus4 -> D7 orchestral crescendo into Christmas Square!
  addWarmStringVoice(out, 34.3, NOTES.D2, 2.05, 0.112, 0.42, 0.32);
  addWarmStringVoice(out, 34.4, NOTES.A2, 1.95, 0.082, 0.45, 0.32);
  addWarmStringVoice(out, 34.5, NOTES.Fs3, 1.85, 0.068, 0.45, 0.32);
  addWarmStringVoice(out, 34.65, NOTES.C4, 1.7, 0.06, 0.42, 0.32);
  addWarmStringVoice(out, 34.85, NOTES.A4, 1.5, 0.062, 0.4, 0.3);
  addWarmStringVoice(out, 35.15, NOTES.D5, 1.2, 0.064, 0.38, 0.28);

  // Sweeping ascending concert harp glissandi mirroring the leaping hearth firelight
  addHarpArp(
    28.8,
    ['G3', 'B3', 'D4', 'Fs4', 'A4', 'B4', 'D5', 'G5', 'A5'],
    0.115,
    1.65,
    0.105
  );
  addHarpArp(
    30.7,
    ['C3', 'G3', 'B3', 'D4', 'E4', 'G4', 'B4', 'D5', 'G5'],
    0.115,
    1.6,
    0.108
  );
  addHarpArp(
    32.5,
    ['A3', 'C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'A5'],
    0.11,
    1.55,
    0.112
  );
  addHarpArp(
    34.3,
    ['D3', 'A3', 'C4', 'D4', 'Fs4', 'A4', 'C5', 'D5', 'Fs5', 'A5', 'D6'],
    0.11,
    1.65,
    0.122
  );

  // Shimmering celesta hearth-sparkle melody blooming with Barnaby's newfound joy
  const swellCelesta = [
    [28.85, 'B4', 0.95, 0.125],
    [29.35, 'D5', 0.95, 0.132],
    [29.85, 'G5', 0.95, 0.138],
    [30.35, 'Fs5', 0.85, 0.132],
    [30.75, 'E5', 0.95, 0.138],
    [31.35, 'G5', 0.9, 0.14],
    [31.95, 'B5', 0.9, 0.142],
    [32.55, 'A5', 0.9, 0.14],
    [33.15, 'G5', 0.85, 0.138],
    [33.75, 'E5', 0.82, 0.135],
    [34.35, 'Fs5', 0.82, 0.142],
    [34.85, 'A5', 0.8, 0.148],
    [35.3, 'B5', 0.72, 0.152],
    [35.75, 'C6', 0.65, 0.156],
  ];
  for (const [t, note, d, a] of swellCelesta) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Delicate sleigh-bell sparkle at hearth ignition & heralding the Christmas square cut
  addSleighBellShimmer(out, 28.88, 0.032, 0.42);
  addSleighBellShimmer(out, 35.65, 0.038, 0.45);

  // =========================================================================
  // SECTION 4 (36.2s - 48.0s): Starlit Snowy Christmas Square & "The End" Iris
  // Joyful G-major Christmas Waltz (120 BPM, 3/4, beat = 0.50s, bar = 1.50s)
  // 6 lush celebratory bars (36.2s - 45.2s) + Classic Gmaj9 Finale Chord (45.2 - 48.0s)
  // =========================================================================
  const sec4Bars = [
    {
      t: 36.2,
      bass: 'G2',
      mid: 'B3',
      high: 'D4',
      arp: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'],
    },
    {
      t: 37.7,
      bass: 'Fs2',
      mid: 'A3',
      high: 'D4',
      arp: ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'],
    },
    {
      t: 39.2,
      bass: 'E2',
      mid: 'G3',
      high: 'B3',
      arp: ['E3', 'B3', 'E4', 'G4', 'B4', 'E5'],
    },
    {
      t: 40.7,
      bass: 'C3',
      mid: 'E4',
      high: 'G4',
      arp: ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'],
    },
    {
      t: 42.2,
      bass: 'A2',
      mid: 'C4',
      high: 'E4',
      arp: ['A3', 'C4', 'E4', 'G4', 'A4', 'C5'],
    },
    {
      t: 43.7,
      bass: 'D2',
      mid: 'A3',
      high: 'Fs4',
      arp: ['D3', 'A3', 'C4', 'D4', 'Fs4', 'A4'],
    },
  ];

  for (const bar of sec4Bars) {
    // Lush warm string choir harmonies
    addWarmStringVoice(out, bar.t, NOTES[bar.bass], 1.58, 0.122, 0.2, 0.3);
    addWarmStringVoice(out, bar.t + 0.04, NOTES[bar.mid], 1.54, 0.08, 0.24, 0.3);
    addWarmStringVoice(out, bar.t + 0.08, NOTES[bar.high], 1.48, 0.066, 0.26, 0.3);

    // Flowing Christmas harp waltz arpeggios
    for (let i = 0; i < bar.arp.length; i++) {
      addHarpPluck(
        out,
        bar.t + i * 0.25,
        NOTES[bar.arp[i]],
        1.15,
        i === 0 ? 0.12 : 0.09
      );
    }

    // Warm pizzicato waltz pulse on beat 1
    addPizzString(out, bar.t, NOTES[bar.bass], 0.28, 0.1);

    // Festive Victorian sleigh-bell shimmer on beat 1 and offbeat lilt
    addSleighBellShimmer(out, bar.t, 0.05, 0.32);
    addSleighBellShimmer(out, bar.t + 1.0, 0.032, 0.24);
  }

  // Joyful G-major Christmas celesta melody
  const sec4Melody = [
    // Bar 1 (G): Starlit square grand reveal
    [36.2, 'D5', 0.55, 0.158],
    [36.7, 'G5', 0.55, 0.168],
    [37.2, 'B5', 0.62, 0.172],
    // Bar 2 (D/Fs)
    [37.7, 'A5', 0.78, 0.165],
    [38.45, 'G5', 0.32, 0.148],
    [38.7, 'Fs5', 0.58, 0.155],
    // Bar 3 (Em7)
    [39.2, 'G5', 0.55, 0.16],
    [39.7, 'E5', 0.52, 0.152],
    [40.2, 'B4', 0.58, 0.145],
    // Bar 4 (C): Joyous square-wide crest
    [40.7, 'C5', 0.52, 0.155],
    [41.2, 'E5', 0.52, 0.162],
    [41.7, 'G5', 0.35, 0.162],
    [41.95, 'C6', 0.42, 0.168],
    // Bar 5 (Am7): Heartfelt tender descent
    [42.2, 'B5', 0.55, 0.162],
    [42.7, 'A5', 0.55, 0.158],
    [43.2, 'G5', 0.58, 0.152],
    // Bar 6 (D7): Broad theatrical cadence right into "The End" iris at 45.0-45.2s
    [43.7, 'Fs5', 0.68, 0.16],
    [44.28, 'A5', 0.58, 0.165],
    [44.78, 'D6', 0.55, 0.162],
  ];
  for (const [t, note, d, a] of sec4Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // Sweeping harp pickup gliss into the theatrical finale chord (44.6 - 45.2s)
  addHarpArp(
    44.6,
    ['D4', 'Fs4', 'A4', 'C5', 'D5', 'Fs5', 'A5'],
    0.08,
    1.1,
    0.098
  );

  // =========================================================================
  // FINALE CHORD (45.2s - 48.0s): Classic Heartwarming Gmaj9 Theatrical Finale
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
      45.2 + delay,
      NOTES[note],
      2.55 - delay * 0.5,
      amp,
      0.22,
      0.85
    );
  }

  // Classic storybook harp & celesta golden flourish crowning "The End" iris
  addHarpArp(
    45.2,
    ['G3', 'B3', 'D4', 'Fs4', 'A4', 'B4', 'D5', 'G5'],
    0.092,
    2.4,
    0.115
  );

  const finaleCelesta = [
    [45.2, 'G5', 2.35, 0.155],
    [45.34, 'B5', 2.2, 0.14],
    [45.5, 'D6', 2.05, 0.132],
    [45.68, 'Fs6', 1.82, 0.095],
    [45.86, 'G6', 1.72, 0.11],
  ];
  for (const [t, note, d, a] of finaleCelesta) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // Final sparkling Victorian sleigh-bell shimmer & soft echo
  addSleighBellShimmer(out, 45.22, 0.052, 0.5);
  addSleighBellShimmer(out, 45.95, 0.024, 0.45);

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
  durationSec: 48.0,
  defaultVolume: 0.25,
  targetPeak: 0.72,
  description:
    'Dynamic 4-section 48.0s Dickensian Christmas score locked to story beats: (1) Snowy Victorian Dusk & Chilly Shop Entry (0-16.5s) gentle G-minor winter celesta & soft pizzicato strings waltz with frosty air shimmer; (2) Barnaby\'s Grumpy Tirade & Pippin\'s Persuasion (16.5-28.8s) playful 120 BPM staccato bassoon & pizzicato comedy bounce softening into hopeful harp/celesta hints; (3) Fireplace Ignites & Heart Melts (28.8-36.2s) warm shimmering concert harp glissandi, celesta blooms & swelling orchestral strings; (4) Starlit Snowy Christmas Square & "The End" Iris (36.2-48.0s) joyful G-major Christmas waltz with sleigh-bell shimmer and resolving Gmaj9 theatrical finale chord.',
  themes: [
    'christmas',
    'winter',
    'cozy_village',
    'hearth',
    'celebration',
    'classic',
  ],
  generate: () => generateChristmasHearthBgm(48.0),
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

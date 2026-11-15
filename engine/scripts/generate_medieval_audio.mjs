#!/usr/bin/env node
/**
 * generate_medieval_audio.mjs
 * Pure-JS 44.1kHz 16-bit PCM WAV synthesizer for the "Sir Leo & The Friendly Dragon"
 * medieval fantasy picture-book scene.
 *
 * Generates:
 *  1. public/audio/medieval-fantasy-bgm.wav (~64.0s)
 *  2. public/audio/campfire-crackle.wav     (~9.0s)
 *  3. public/audio/dragon-fire-breath.wav   (~2.8s)
 *  4. public/audio/spear-tooth-pop.wav      (~1.6s)
 *  5. public/audio/horse-trot.wav           (~4.0s)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;

// Deterministic PRNG so audio generation is 100% reproducible and free of weird spikes
let rngState = 0x5EED1234;
function rand() {
  rngState = (rngState * 1664525 + 1013904223) >>> 0;
  return rngState / 0x100000000;
}
function whiteNoise() {
  return rand() * 2 - 1;
}

function writeWav(filePath, samples, targetPeak = 0.88) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  const scale = (32767 * targetPeak) / Math.max(peak, 1e-6);
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0, 4, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 4, 'ascii');
  buf.write('fmt ', 12, 4, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM = 1
  buf.writeUInt16LE(1, 22); // Mono = 1
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 4, 'ascii');
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-32768, Math.min(32767, Math.round(samples[i] * scale)));
    buf.writeInt16LE(clamped, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
  return filePath;
}

// MIDI note or note name helper
const NOTE_FREQS = {
  D2: 73.42, E2: 82.41, F2: 87.31, Fs2: 92.50, G2: 98.00, A2: 110.00, Bb2: 116.54, B2: 123.47, C3: 130.81,
  Cs3: 138.59, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, Fs6: 1479.98, G6: 1567.98, A6: 1760.00,
};

/**
 * Plucked Lute / Harp synthesizer using smoothed Karplus-Strong + warm wooden body harmonics.
 */
function addLutePluck(out, startSec, freq, durSec, amp = 0.25, brightness = 0.65) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const period = Math.max(8, Math.round(SAMPLE_RATE / freq));
  const ring = new Float64Array(period);

  // Initialize pluck excitation with warm smoothed noise + fundamental wave
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const phase = (2 * Math.PI * i) / period;
    const n = whiteNoise();
    prev = 0.55 * prev + 0.45 * n;
    ring[i] = prev * brightness + Math.sin(phase) * 0.65 + Math.sin(2 * phase) * 0.25;
  }

  const feedback = Math.pow(0.001, 1 / (durSec * freq * 1.35));
  let ptr = 0;
  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const localIdx = idx - startIdx;
    const t = localIdx / SAMPLE_RATE;

    // Karplus-Strong update
    const nextPtr = (ptr + 1) % period;
    const ksVal = ring[ptr];
    ring[ptr] = feedback * (0.52 * ring[ptr] + 0.48 * ring[nextPtr]);
    ptr = nextPtr;

    // Warm resonant lute body fundamental + octave
    const bodyEnv = Math.exp(-t * (3.2 / Math.max(0.4, durSec)));
    const body =
      (Math.sin(2 * Math.PI * freq * t) * 0.55 +
        Math.sin(4 * Math.PI * freq * t) * 0.2 +
        Math.sin(6 * Math.PI * freq * t) * 0.08) *
      bodyEnv;

    const attackEnv = t < 0.004 ? t / 0.004 : 1.0;
    const relEnv = t > durSec - 0.04 ? Math.max(0, (durSec - t) / 0.04) : 1.0;
    out[idx] += (ksVal * 0.55 + body * 0.45) * attackEnv * relEnv * amp;
  }
}

/**
 * Gentle Wooden Recorder / Flute note with soft breath transient & natural vibrato.
 */
function addRecorderNote(out, startSec, freq, durSec, amp = 0.20) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  let breathLp = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = 0.045;
    const release = Math.min(0.08, durSec * 0.25);
    let env = 1.0;
    if (t < attack) env = t / attack;
    else if (t > durSec - release) env = Math.max(0, (durSec - t) / release);

    // Subtle vibrato enters smoothly after 0.12s
    const vibDepth = t > 0.1 ? Math.min(1, (t - 0.1) / 0.15) * 0.006 : 0;
    const instFreq = freq * (1 + vibDepth * Math.sin(2 * Math.PI * 5.2 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    // Wooden recorder harmonic profile: strong fundamental, gentle 2nd & 3rd harmonics
    const tone =
      Math.sin(phase) * 0.72 +
      Math.sin(2 * phase) * 0.18 +
      Math.sin(3 * phase) * 0.07;

    // Soft breathy chiff at note onset
    breathLp = 0.85 * breathLp + 0.15 * whiteNoise();
    const chiffEnv = Math.exp(-t * 28);
    const breath = breathLp * (0.04 + 0.08 * chiffEnv);

    out[idx] += (tone + breath) * env * amp;
  }
}

/**
 * Warm Medieval Brass / Horn note for noble castle fanfare & finale.
 */
function addHornNote(out, startSec, freq, durSec, amp = 0.16) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = 0.06;
    const release = Math.min(0.12, durSec * 0.3);
    let env = 1.0;
    if (t < attack) env = t / attack;
    else if (t > durSec - release) env = Math.max(0, (durSec - t) / release);

    const w = 2 * Math.PI * freq * t;
    const horn =
      Math.sin(w) * 0.50 +
      Math.sin(2 * w) * 0.30 +
      Math.sin(3 * w) * 0.14 +
      Math.sin(4 * w) * 0.06;
    out[idx] += horn * env * amp;
  }
}

/**
 * Soft Medieval Tabor Drum & Tambourine hit.
 */
function addTaborBeat(out, startSec, amp = 0.18, withTambourine = false) {
  const durSec = 0.18;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  let prevNoise = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    // Drum head pitch drop 118 Hz -> 68 Hz
    const f = 68 + 50 * Math.exp(-t * 32);
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const body = Math.sin(phase) * Math.exp(-t * 18);

    // Soft parchment tap
    const raw = whiteNoise();
    const hp = raw - prevNoise;
    prevNoise = raw;
    const snare = hp * Math.exp(-t * 45) * 0.22;

    let jingle = 0;
    if (withTambourine) {
      jingle =
        (Math.sin(2 * Math.PI * 3800 * t) * 0.3 +
          Math.sin(2 * Math.PI * 5100 * t) * 0.3 +
          hp * 0.4) *
        Math.exp(-t * 28) *
        0.25;
    }

    out[idx] += (body * 0.78 + snare + jingle) * amp;
  }
}

/**
 * 1. Generate `medieval-fantasy-bgm.wav` (~64.0 seconds)
 */
function generateMedievalFantasyBgm(dur = 64.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // Helper to strum a 3- or 4-note lute chord
  function strumChord(time, notes, noteDur, amp = 0.16, spread = 0.035) {
    notes.forEach((note, i) => {
      addLutePluck(out, time + i * spread, NOTE_FREQS[note], noteDur, amp, 0.6);
    });
  }

  // =========================================================================
  // SECTION 1 (0.0s - 12.0s): Bright Morning Castle Fanfare & Lute March
  // D Mixolydian (D, E, F#, G, A, B, C, D)
  // =========================================================================
  const beat1 = 0.5; // 120 BPM
  // Opening Castle Horn & Harp Fanfare (0.2s - 3.5s)
  strumChord(0.2, ['D3', 'A3', 'D4', 'Fs4'], 1.6, 0.16, 0.04);
  addHornNote(out, 0.25, NOTE_FREQS.D4, 0.45, 0.13);
  addHornNote(out, 0.75, NOTE_FREQS.A4, 0.45, 0.14);
  addHornNote(out, 1.25, NOTE_FREQS.D5, 0.90, 0.15);
  strumChord(1.25, ['D3', 'A3', 'Fs4', 'A4', 'D5'], 1.8, 0.15, 0.035);

  addRecorderNote(out, 2.25, NOTE_FREQS.C5, 0.35, 0.15);
  addRecorderNote(out, 2.65, NOTE_FREQS.B4, 0.35, 0.15);
  addRecorderNote(out, 3.05, NOTE_FREQS.A4, 0.55, 0.16);
  strumChord(2.25, ['G3', 'D4', 'G4', 'B4'], 1.4, 0.14, 0.03);

  // Plucked Lute March (3.6s - 12.0s)
  const sec1Chords = [
    { t: 3.6, bass: 'D3', arp: ['A3', 'D4', 'Fs4', 'A4'] },
    { t: 5.6, bass: 'C3', arp: ['G3', 'C4', 'E4', 'G4'] },
    { t: 7.6, bass: 'G2', arp: ['D3', 'G3', 'B3', 'D4'] },
    { t: 9.6, bass: 'D3', arp: ['A3', 'D4', 'Fs4', 'A4'] },
  ];
  for (const ch of sec1Chords) {
    addLutePluck(out, ch.t, NOTE_FREQS[ch.bass], 1.8, 0.22, 0.5);
    addLutePluck(out, ch.t + 1.0, NOTE_FREQS[ch.bass], 1.2, 0.18, 0.5);
    for (let step = 0; step < 8; step++) {
      const note = ch.arp[step % ch.arp.length];
      addLutePluck(out, ch.t + step * 0.25, NOTE_FREQS[note], 0.65, 0.15, 0.65);
      if (step % 2 === 0) {
        addTaborBeat(out, ch.t + step * 0.25, step === 0 ? 0.16 : 0.10, step === 4);
      }
    }
  }
  // Cheerful Recorder Melody over Section 1 (3.6s - 11.8s)
  const sec1Melody = [
    [3.6, 'Fs5', 0.45], [4.1, 'E5', 0.45], [4.6, 'D5', 0.45], [5.1, 'A4', 0.45],
    [5.6, 'G5', 0.45],  [6.1, 'E5', 0.45], [6.6, 'C5', 0.90],
    [7.6, 'B4', 0.45],  [8.1, 'C5', 0.45], [8.6, 'D5', 0.45], [9.1, 'B4', 0.45],
    [9.6, 'A4', 0.70],  [10.35, 'Fs4', 0.60], [11.0, 'D5', 0.85],
  ];
  for (const [t, note, d] of sec1Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.16);
  }

  // =========================================================================
  // SECTION 2 (12.0s - 23.0s): Starry Nocturnal Harp & Campfire Lullaby
  // Warm G Major / E Aeolian gentle arpeggios
  // =========================================================================
  const sec2Patterns = [
    { t: 12.0, notes: ['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'D4', 'B3'] },
    { t: 14.8, notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4', 'B3', 'G3'] },
    { t: 17.6, notes: ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'] },
    { t: 20.4, notes: ['D3', 'A3', 'D4', 'Fs4', 'A4', 'Fs4', 'D4', 'A3'] },
  ];
  for (const pat of sec2Patterns) {
    for (let i = 0; i < pat.notes.length; i++) {
      const note = pat.notes[i];
      addLutePluck(out, pat.t + i * 0.34, NOTE_FREQS[note], 1.4, i === 0 ? 0.20 : 0.14, 0.45);
    }
  }
  const sec2Flute = [
    [12.3, 'B4', 1.1], [13.5, 'D5', 1.1],
    [15.0, 'E5', 1.2], [16.3, 'B4', 1.1],
    [17.8, 'C5', 1.1], [19.0, 'B4', 0.6], [19.7, 'G4', 0.6],
    [20.5, 'A4', 1.8],
  ];
  for (const [t, note, d] of sec2Flute) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.14);
  }

  // =========================================================================
  // SECTION 3 (23.0s - 36.0s): Mysterious Dorian Walking Lute (Village & Woods)
  // D Dorian (D, E, F, G, A, B, C)
  // =========================================================================
  const sec3Chords = [
    { t: 23.0, bass: 'D3', arp: ['A3', 'D4', 'F4', 'A4', 'F4', 'D4'] },
    { t: 25.6, bass: 'C3', arp: ['G3', 'C4', 'E4', 'G4', 'E4', 'C4'] },
    { t: 28.2, bass: 'G2', arp: ['D3', 'G3', 'B3', 'D4', 'B3', 'G3'] },
    { t: 30.8, bass: 'Bb2', arp: ['F3', 'Bb3', 'D4', 'F4', 'D4', 'Bb3'] },
    { t: 33.4, bass: 'A2', arp: ['E3', 'A3', 'Cs4', 'E4', 'Cs4', 'A3'] },
  ];
  for (const ch of sec3Chords) {
    addLutePluck(out, ch.t, NOTE_FREQS[ch.bass], 1.5, 0.22, 0.5);
    addLutePluck(out, ch.t + 1.3, NOTE_FREQS[ch.bass], 1.3, 0.19, 0.5);
    addTaborBeat(out, ch.t, 0.11, false);
    addTaborBeat(out, ch.t + 1.3, 0.08, false);
    for (let i = 0; i < ch.arp.length; i++) {
      addLutePluck(out, ch.t + i * 0.42, NOTE_FREQS[ch.arp[i]], 0.9, 0.14, 0.55);
    }
  }
  const sec3Melody = [
    [23.2, 'D4', 0.7], [24.0, 'F4', 0.6], [24.7, 'A4', 0.8],
    [25.8, 'G4', 0.7], [26.6, 'E4', 0.6], [27.3, 'C4', 0.8],
    [28.4, 'D4', 0.7], [29.2, 'G4', 0.6], [29.9, 'B4', 0.8],
    [31.0, 'A4', 0.7], [31.8, 'F4', 0.6], [32.5, 'D4', 0.8],
    [33.6, 'E4', 1.0], [34.7, 'A4', 1.1],
  ];
  for (const [t, note, d] of sec3Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.15);
  }

  // =========================================================================
  // SECTION 4 (36.0s - 50.0s): Playful, Energetic Medieval Adventure Rhythm
  // Dragon Encounter & Sir Leo's Heroic Tooth-Fixing Feat!
  // =========================================================================
  const sec4Chords = [
    { t: 36.0, bass: 'D2', notes: ['D3', 'A3', 'D4', 'F4'] },
    { t: 38.0, bass: 'C3', notes: ['C3', 'G3', 'C4', 'E4'] },
    { t: 40.0, bass: 'Bb2', notes: ['Bb2', 'F3', 'Bb3', 'D4'] },
    { t: 42.0, bass: 'A2', notes: ['A2', 'E3', 'A3', 'Cs4'] },
    { t: 44.0, bass: 'D3', notes: ['D3', 'A3', 'D4', 'Fs4'] },
    { t: 46.0, bass: 'G2', notes: ['G3', 'D4', 'G4', 'B4'] },
    { t: 48.0, bass: 'A2', notes: ['A3', 'E4', 'A4', 'Cs5'] },
  ];
  for (const ch of sec4Chords) {
    for (let beat = 0; beat < 4; beat++) {
      const bt = ch.t + beat * 0.5;
      addTaborBeat(out, bt, beat % 2 === 0 ? 0.17 : 0.11, beat === 2);
      addLutePluck(out, bt, NOTE_FREQS[ch.bass], 0.45, 0.20, 0.65);
      const topNote = ch.notes[(beat + 1) % ch.notes.length];
      addLutePluck(out, bt + 0.25, NOTE_FREQS[topNote], 0.4, 0.16, 0.7);
    }
  }
  const sec4Melody = [
    [36.0, 'D5', 0.4], [36.5, 'F5', 0.4], [37.0, 'A5', 0.4], [37.5, 'D5', 0.4],
    [38.0, 'C5', 0.4], [38.5, 'E5', 0.4], [39.0, 'G5', 0.8],
    [40.0, 'F5', 0.4], [40.5, 'D5', 0.4], [41.0, 'Bb4', 0.8],
    [42.0, 'A4', 0.4], [42.5, 'Cs5', 0.4], [43.0, 'E5', 0.8],
    // Heroic leap & relief climb (44s - 50s)
    [44.0, 'D5', 0.4], [44.5, 'Fs5', 0.4], [45.0, 'A5', 0.8],
    [46.0, 'B5', 0.4], [46.5, 'G5', 0.4], [47.0, 'D5', 0.8],
    [48.0, 'E5', 0.45], [48.5, 'Fs5', 0.45], [49.0, 'G5', 0.45], [49.5, 'A5', 0.45],
  ];
  for (const [t, note, d] of sec4Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.16);
  }

  // =========================================================================
  // SECTION 5 (50.0s - 64.0s): Joyful Medieval Festival Dance & Finale
  // D Major / Mixolydian Celebration + Gentle Fade-Out
  // =========================================================================
  const sec5Chords = [
    { t: 50.0, bass: 'D3', arp: ['A3', 'D4', 'Fs4', 'A4'] },
    { t: 52.0, bass: 'G2', arp: ['D3', 'G3', 'B3', 'D4'] },
    { t: 54.0, bass: 'A2', arp: ['E3', 'A3', 'Cs4', 'E4'] },
    { t: 56.0, bass: 'D3', arp: ['A3', 'D4', 'Fs4', 'A4'] },
    { t: 58.0, bass: 'G2', arp: ['D3', 'G3', 'B3', 'D4'] },
  ];
  for (const ch of sec5Chords) {
    strumChord(ch.t, ch.arp, 1.2, 0.16, 0.025);
    for (let step = 0; step < 8; step++) {
      const st = ch.t + step * 0.25;
      const note = ch.arp[step % ch.arp.length];
      addLutePluck(out, st, NOTE_FREQS[note], 0.55, 0.15, 0.7);
      if (step % 2 === 0) {
        addTaborBeat(out, st, step === 0 ? 0.17 : 0.12, true);
      }
    }
  }
  const sec5Melody = [
    [50.0, 'Fs5', 0.4], [50.5, 'G5', 0.4], [51.0, 'A5', 0.4], [51.5, 'Fs5', 0.4],
    [52.0, 'G5', 0.4],  [52.5, 'B5', 0.4], [53.0, 'A5', 0.4], [53.5, 'G5', 0.4],
    [54.0, 'Fs5', 0.4], [54.5, 'E5', 0.4], [55.0, 'D5', 0.4], [55.5, 'E5', 0.4],
    [56.0, 'Fs5', 0.7], [56.8, 'A5', 0.7], [57.6, 'D6', 0.4],
    [58.0, 'B5', 0.45], [58.5, 'A5', 0.45], [59.0, 'G5', 0.45], [59.5, 'Fs5', 0.45],
  ];
  for (const [t, note, d] of sec5Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.17);
    addHornNote(out, t, NOTE_FREQS[note] * 0.5, d, 0.08);
  }

  // Final Resolving Storybook Cadence (60.0s - 64.0s)
  const finalArp = ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'Fs5', 'A5'];
  for (let i = 0; i < finalArp.length; i++) {
    addLutePluck(out, 60.0 + i * 0.14, NOTE_FREQS[finalArp[i]], 3.4 - i * 0.12, 0.17, 0.55);
  }
  addRecorderNote(out, 60.2, NOTE_FREQS.D5, 2.8, 0.15);
  addHornNote(out, 60.2, NOTE_FREQS.D4, 2.8, 0.11);

  // Smooth master envelope (0.3s fade-in, 2.2s gentle fade-out at the end)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let masterEnv = 1.0;
    if (t < 0.3) masterEnv = t / 0.3;
    else if (t > dur - 2.2) masterEnv = Math.max(0, (dur - t) / 2.2);
    out[i] *= masterEnv;
  }

  return out;
}

/**
 * 2. Generate `campfire-crackle.wav` (~9.0 seconds)
 * Warm low-pass ember rumble + roasting sizzle + stochastic wood-snap crackles & pops.
 */
function generateCampfireCrackle(dur = 9.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // Layer 1 & 2: Warm low ember rumble + soft roasting sizzle
  let lpEmber1 = 0;
  let lpEmber2 = 0;
  let lpSizzle = 0;
  let prevRaw = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const raw = whiteNoise();

    // Two-pole lowpass around ~150 Hz for cozy fire draft
    lpEmber1 += 0.022 * (raw - lpEmber1);
    lpEmber2 += 0.022 * (lpEmber1 - lpEmber2);
    const draftMod =
      0.65 +
      0.20 * Math.sin(2 * Math.PI * 0.45 * t) +
      0.15 * Math.sin(2 * Math.PI * 1.15 * t + 0.8);

    // Gentle high-mid sizzle (roasting spit & glowing coals)
    const hp = raw - prevRaw;
    prevRaw = raw;
    lpSizzle += 0.18 * (hp - lpSizzle);
    const sizzleMod = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.8 * t);

    out[i] = lpEmber2 * draftMod * 0.48 + lpSizzle * sizzleMod * 0.045;
  }

  // Layer 3: Discrete stochastic wood-snap crackles & ember pops
  const numCrackles = 68;
  for (let c = 0; c < numCrackles; c++) {
    const onset = 0.15 + rand() * (dur - 0.35);
    const isBigSnap = rand() < 0.32;
    const snapDur = isBigSnap ? 0.012 + rand() * 0.010 : 0.004 + rand() * 0.006;
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

    // Secondary micro-pop 8-28ms after a big wood snap
    if (isBigSnap && rand() < 0.75) {
      const followOnset = onset + 0.008 + rand() * 0.020;
      const followStart = Math.floor(followOnset * SAMPLE_RATE);
      const followSamples = Math.floor(0.006 * SAMPLE_RATE);
      for (let j = 0; j < followSamples && followStart + j < n; j++) {
        const st = j / SAMPLE_RATE;
        out[followStart + j] +=
          whiteNoise() * Math.exp(-st * 450) * (snapAmp * 0.6);
      }
    }
  }

  // Smooth fade-in and fade-out
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.35) env = t / 0.35;
    else if (t > dur - 0.5) env = Math.max(0, (dur - t) / 0.5);
    out[i] *= env;
  }

  return out;
}

/**
 * 3. Generate `dragon-fire-breath.wav` (~2.8 seconds)
 * Deep resonant throat rumble + sweeping bandpass roaring flame whoosh + crackling fire tail.
 */
function generateDragonFireBreath(dur = 2.8) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  let bpState1 = 0;
  let bpState2 = 0;
  let lowRoarLp = 0;
  let throatPhase1 = 0;
  let throatPhase2 = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;

    // Envelope: rapid powerful surge (0..0.28s), sustained roaring blast (0.28..1.85s), fiery tail (1.85..2.8s)
    let env = 1.0;
    if (t < 0.25) env = Math.pow(t / 0.25, 0.75);
    else if (t > 1.80) env = Math.pow(Math.max(0, (dur - t) / (dur - 1.80)), 1.4);

    // Throat growl fundamental (72 Hz -> 108 Hz -> 64 Hz) with vocal chest vibrato
    const growlFreq =
      72 +
      38 * Math.sin(Math.PI * Math.min(1, t / 1.9)) +
      6 * Math.sin(2 * Math.PI * 14 * t);
    throatPhase1 += (2 * Math.PI * growlFreq) / SAMPLE_RATE;
    throatPhase2 += (2 * Math.PI * growlFreq * 1.5) / SAMPLE_RATE;

    // Rich brassy/throated dragon vocalization
    const throatGrowl =
      (Math.sin(throatPhase1) * 0.55 +
        Math.sin(2 * throatPhase1) * 0.28 +
        Math.sin(throatPhase2) * 0.22) *
      (t < 2.1 ? 0.32 : 0.32 * Math.max(0, (2.5 - t) / 0.4));

    // Sweeping resonant flame whoosh (state-variable bandpass + turbulent low-pass roar)
    const raw = whiteNoise();
    const sweepCurve = Math.sin(Math.PI * Math.min(1, t / 2.2));
    const turbulence = 1 + 0.22 * Math.sin(2 * Math.PI * 8.5 * t) + 0.14 * Math.sin(2 * Math.PI * 19 * t);
    const centerFreq = (220 + 780 * sweepCurve) * turbulence;

    const f = Math.min(0.45, (2 * Math.sin((Math.PI * centerFreq) / SAMPLE_RATE)));
    const q = 0.28;
    const hp = raw - bpState2 - q * bpState1;
    bpState1 += f * hp;
    bpState2 += f * bpState1;

    lowRoarLp += 0.045 * (raw - lowRoarLp);

    const flameWhoosh = bpState1 * 0.65 + lowRoarLp * 0.55;
    out[i] = (throatGrowl + flameWhoosh) * env;
  }

  // Add sizzling fire crackles in the tail (1.1s .. 2.7s)
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

/**
 * 4. Generate `spear-tooth-pop.wav` (~1.6 seconds)
 * 0.0-0.30s: Crisp metallic/wooden spear clink-tock impact
 * 0.30-0.65s: Upward tension levering creak/slide
 * 0.65-0.85s: Comical resonant cork POP!
 * 0.85-1.60s: Bright ascending magical relief chime arpeggio
 */
function generateSpearToothPop(dur = 1.6) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // 1) Crisp metallic/wooden clink-tock impacts at t = 0.03s and t = 0.16s
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

  // 2) Upward tension levering slide & wooden creak (0.30s - 0.64s)
  const slideStart = Math.floor(0.30 * SAMPLE_RATE);
  const slideEnd = Math.floor(0.64 * SAMPLE_RATE);
  let slidePhase = 0;
  for (let idx = slideStart; idx < slideEnd && idx < n; idx++) {
    const t = (idx - slideStart) / SAMPLE_RATE;
    const progress = t / 0.34;
    const freq = 185 + 280 * Math.pow(progress, 1.5);
    slidePhase += (2 * Math.PI * freq) / SAMPLE_RATE;
    // Ratchet creak modulation
    const creakMod = 0.65 + 0.35 * Math.sin(2 * Math.PI * 38 * t);
    const env = Math.sin(Math.PI * progress);
    out[idx] +=
      (Math.sin(slidePhase) * 0.6 + Math.sin(2 * slidePhase) * 0.3) *
      creakMod *
      env *
      0.38;
  }

  // 3) Comical Resonant Cork POP! (0.65s - 0.84s)
  const popStart = Math.floor(0.65 * SAMPLE_RATE);
  const popLen = Math.floor(0.16 * SAMPLE_RATE);
  let popPhase = 0;
  for (let j = 0; j < popLen && popStart + j < n; j++) {
    const t = j / SAMPLE_RATE;
    // Classic cork pop pitch contour: brief dip then fast upward resonant cavity sweep (240 Hz -> 960 Hz)
    const fPop =
      t < 0.055
        ? 240 + 740 * Math.pow(t / 0.055, 1.8)
        : 980 * Math.exp(-(t - 0.055) * 14);
    popPhase += (2 * Math.PI * fPop) / SAMPLE_RATE;
    const env = t < 0.004 ? t / 0.004 : Math.exp(-t * 24);
    const lipSnap = t < 0.015 ? whiteNoise() * Math.exp(-t * 220) * 0.35 : 0;
    out[popStart + j] += (Math.sin(popPhase) * 0.85 + Math.sin(2 * popPhase) * 0.25 + lipSnap) * env * 0.92;
  }

  // 4) Bright ascending magical relief chime arpeggio (0.85s - 1.60s)
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
        Math.sin(2 * Math.PI * ch.freq * 3 * t) * 0.10;
      out[startIdx + j] += bell * env * 0.36;
    }
  }

  return out;
}

/**
 * 5. Generate `horse-trot.wav` (~4.0 seconds)
 * Crisp rhythmic coconut-shell / cobblestone & dirt-path clip-clop horse hooves.
 */
function generateHorseTrot(dur = 4.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function addHoofStrike(onsetSec, isClip, amp = 0.65) {
    const startIdx = Math.floor(onsetSec * SAMPLE_RATE);
    const strikeLen = Math.floor(0.085 * SAMPLE_RATE);
    // Coconut-shell cavity resonances: "clip" is slightly higher pitched than "clop"
    const f1 = isClip ? 820 : 580;
    const f2 = isClip ? 1290 : 940;
    const f3 = isClip ? 1950 : 1480;

    let lpCrunch = 0;
    for (let j = 0; j < strikeLen && startIdx + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const attack = t < 0.002 ? t / 0.002 : 1.0;

      // Hollow wooden/coconut-shell clop resonance
      const shell =
        (Math.sin(2 * Math.PI * f1 * t) * 0.58 +
          Math.sin(2 * Math.PI * f2 * t) * 0.30 +
          Math.sin(2 * Math.PI * f3 * t) * 0.12) *
        Math.exp(-t * 58);

      // Cobblestone / dirt-path grit transient
      const raw = whiteNoise();
      lpCrunch = 0.45 * lpCrunch + 0.55 * raw;
      const dirtCrunch = (raw - lpCrunch * 0.5) * Math.exp(-t * 95) * 0.42;

      // Subtle low ground thud
      const thud = Math.sin(2 * Math.PI * (135 * Math.exp(-t * 40)) * t) * Math.exp(-t * 50) * 0.28;

      out[startIdx + j] += (shell + dirtCrunch + thud) * attack * amp;
    }
  }

  // Trot cycle every 0.46s: primary steed (Sir Leo) + accompanying soldiers' horses slightly offset
  let cycleTime = 0.08;
  let cycleIdx = 0;
  while (cycleTime < dur - 0.22) {
    // Lead horse: CLIP ... CLOP
    addHoofStrike(cycleTime, true, 0.72);
    addHoofStrike(cycleTime + 0.15, false, 0.68);

    // Accompanying cavalry horse trotting in ensemble
    addHoofStrike(cycleTime + 0.05, false, 0.36);
    addHoofStrike(cycleTime + 0.21, true, 0.34);

    // Subtle harness/bridle metallic clink on every beat
    const jingleStart = Math.floor((cycleTime + 0.02) * SAMPLE_RATE);
    const jingleLen = Math.floor(0.045 * SAMPLE_RATE);
    for (let j = 0; j < jingleLen && jingleStart + j < n; j++) {
      const t = j / SAMPLE_RATE;
      const jingle =
        (Math.sin(2 * Math.PI * 3450 * t) * 0.5 + Math.sin(2 * Math.PI * 4620 * t) * 0.5) *
        Math.exp(-t * 65) *
        0.07;
      out[jingleStart + j] += jingle;
    }

    cycleTime += 0.46;
    cycleIdx++;
  }

  // Gentle fade-in and fade-out
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.08) env = t / 0.08;
    else if (t > dur - 0.25) env = Math.max(0, (dur - t) / 0.25);
    out[i] *= env;
  }

  return out;
}

function main() {
  const workspaceAudioDir = path.resolve(__dirname, '..', 'public', 'audio');
  const targets = [
    workspaceAudioDir,
    'C:\\Users\\sinad\\.gemini\\config\\plugins\\animated_picture_book_studio\\engine\\public\\audio',
    'D:\\picture_book_plugin\\engine\\public\\audio',
  ];

  const tracks = [
    {
      filename: 'medieval-fantasy-bgm.wav',
      dur: 64.0,
      synth: () => generateMedievalFantasyBgm(64.0),
      peak: 0.85,
    },
    {
      filename: 'campfire-crackle.wav',
      dur: 9.0,
      synth: () => generateCampfireCrackle(9.0),
      peak: 0.82,
    },
    {
      filename: 'dragon-fire-breath.wav',
      dur: 2.8,
      synth: () => generateDragonFireBreath(2.8),
      peak: 0.90,
    },
    {
      filename: 'spear-tooth-pop.wav',
      dur: 1.6,
      synth: () => generateSpearToothPop(1.6),
      peak: 0.90,
    },
    {
      filename: 'horse-trot.wav',
      dur: 4.0,
      synth: () => generateHorseTrot(4.0),
      peak: 0.85,
    },
  ];

  for (const track of tracks) {
    const samples = track.synth();
    const primaryPath = path.join(workspaceAudioDir, track.filename);
    writeWav(primaryPath, samples, track.peak);
    const stat = fs.statSync(primaryPath);
    console.log(`[generated] ${primaryPath} (${track.dur.toFixed(2)}s, ${stat.size} bytes)`);

    for (const dir of targets.slice(1)) {
      try {
        if (fs.existsSync(path.dirname(dir))) {
          fs.mkdirSync(dir, { recursive: true });
          const dest = path.join(dir, track.filename);
          fs.copyFileSync(primaryPath, dest);
          console.log(`   [copied] -> ${dest}`);
        }
      } catch (err) {
        console.warn(`   [warn] Could not copy to ${dir}: ${err.message}`);
      }
    }
  }
}

main();

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

const NOTES = {
  ...NOTE_FREQS,
  Cs6: 1108.73,
};

function raisedCosine(t, dur) {
  if (dur <= 0) return 1.0;
  const u = Math.max(0, Math.min(1, t / dur));
  return 0.5 - 0.5 * Math.cos(Math.PI * u);
}

/**
 * Warm acoustic double-bass pizzicato with woody resonance and soft finger transient.
 */
function addPizzBass(out, startSec, freq, durSec, amp = 0.22) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.006 ? raisedCosine(t, 0.006) : 1.0;
    const rel = t > durSec - 0.045 ? raisedCosine(durSec - t, 0.045) : 1.0;
    const decay = Math.exp(-t * (2.8 / Math.max(0.28, durSec)));

    const instFreq = freq * (1 + 0.012 * Math.exp(-t * 48));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const tone =
      Math.sin(phase) * 0.72 +
      Math.sin(2 * phase) * 0.22 * Math.exp(-t * 5.2) +
      Math.sin(3 * phase) * 0.06 * Math.exp(-t * 11.0);
    const fingerThump = whiteNoise() * Math.exp(-t * 140) * 0.045;

    out[idx] += (tone * decay + fingerThump) * attack * rel * amp;
  }
}

/**
 * Brisk chamber pizzicato string (violin/viola/cello) for playful folk-orchestral bounce.
 */
function addPizzString(out, startSec, freq, durSec = 0.24, amp = 0.14) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.003 ? t / 0.003 : 1.0;
    const rel = t > durSec - 0.028 ? raisedCosine(durSec - t, 0.028) : 1.0;

    const instFreq = freq * (1 + 0.015 * Math.exp(-t * 65));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const decay = Math.exp(-t * 9.8);
    const tone =
      Math.sin(phase) * 0.66 +
      Math.sin(2 * phase) * 0.25 * Math.exp(-t * 14.0) +
      Math.sin(3 * phase) * 0.09 * Math.exp(-t * 24.0);
    const pluck = whiteNoise() * Math.exp(-t * 170) * 0.07;

    out[idx] += (tone * decay + pluck) * attack * rel * amp;
  }
}

/**
 * Warm 1970s pastoral wooden flute / folk recorder voice with soft airy chiff & vibrato.
 */
function addWoodenFlute(out, startSec, freq, durSec, amp = 0.14) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  let breathLp = 0;
  const attack = Math.min(0.042, durSec * 0.25);
  const release = Math.min(0.075, durSec * 0.32);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attack) env = raisedCosine(t, attack);
    else if (t > durSec - release) env = raisedCosine(durSec - t, release);

    const scoop = 1 - 0.016 * Math.exp(-t * 42);
    const vibDepth = t > 0.09 ? Math.min(1, (t - 0.09) / 0.16) * 0.0055 : 0;
    const instFreq =
      freq * scoop * (1 + vibDepth * Math.sin(2 * Math.PI * 5.2 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const tone =
      Math.sin(phase) * 0.78 +
      Math.sin(2 * phase) * 0.17 +
      Math.sin(3 * phase) * 0.045;

    breathLp = 0.86 * breathLp + 0.14 * whiteNoise();
    const chiff = breathLp * (0.03 + 0.075 * Math.exp(-t * 32));

    out[idx] += (tone + chiff) * env * amp;
  }
}

/**
 * Jaunty 1970s Robin Hood style folk whistle for lively sunlit fetch-chase melodies.
 */
function addJauntyWhistle(out, startSec, freq, durSec, amp = 0.13) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  let breathLp = 0;
  const attack = Math.min(0.018, durSec * 0.22);
  const release = Math.min(0.05, durSec * 0.32);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attack) env = raisedCosine(t, attack);
    else if (t > durSec - release) env = raisedCosine(durSec - t, release);

    const scoop = 1 - 0.028 * Math.exp(-t * 58);
    const vib = 1 + 0.0065 * Math.sin(2 * Math.PI * 5.9 * t);
    phase += (2 * Math.PI * freq * scoop * vib) / SAMPLE_RATE;

    const tone = Math.sin(phase) * 0.87 + Math.sin(2 * phase) * 0.1;
    breathLp = 0.8 * breathLp + 0.2 * whiteNoise();
    const air = breathLp * (0.04 + 0.065 * Math.exp(-t * 40));

    out[idx] += (tone + air) * env * amp;
  }
}

/**
 * Mellow woody clarinet (odd-harmonic rich) for nostalgic golden afternoon phrasing.
 */
function addWarmClarinet(out, startSec, freq, durSec, amp = 0.13) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  let breathLp = 0;
  const attack = Math.min(0.055, durSec * 0.24);
  const release = Math.min(0.11, durSec * 0.34);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attack) env = raisedCosine(t, attack);
    else if (t > durSec - release) env = raisedCosine(durSec - t, release);

    const vibDepth = t > 0.14 ? Math.min(1, (t - 0.14) / 0.2) * 0.0045 : 0;
    const instFreq = freq * (1 + vibDepth * Math.sin(2 * Math.PI * 4.9 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    // Characteristic hollow warm clarinet spectrum (strong 1st & 3rd, gentle 5th)
    const tone =
      Math.sin(phase) * 0.66 +
      Math.sin(2 * phase) * 0.07 +
      Math.sin(3 * phase) * 0.21 +
      Math.sin(5 * phase) * 0.05;

    breathLp = 0.88 * breathLp + 0.12 * whiteNoise();
    const reedAir = breathLp * 0.022;

    out[idx] += (tone + reedAir) * env * amp;
  }
}

/**
 * Shimmering concert harp pluck for golden afternoon arpeggios and celebratory glints.
 */
function addConcertHarp(out, startSec, freq, durSec = 2.0, amp = 0.12) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  const decayRate = 2.15 / Math.max(0.55, durSec);
  const relSec = Math.min(0.12, durSec * 0.2);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.0045 ? raisedCosine(t, 0.0045) : 1.0;
    const rel = t > durSec - relSec ? raisedCosine(durSec - t, relSec) : 1.0;
    const env = Math.exp(-t * decayRate);

    const w = 2 * Math.PI * freq * t;
    const tone =
      Math.sin(w) * 0.68 +
      Math.sin(2 * w) * 0.22 * Math.exp(-t * 3.4) +
      Math.sin(3 * w) * 0.075 * Math.exp(-t * 7.0) +
      Math.sin(4 * w) * 0.025 * Math.exp(-t * 14.0);

    out[idx] += tone * env * attack * rel * amp;
  }
}

/**
 * Soft muted studio string sustain pad for the warm theatrical iris-out glow.
 */
function addWarmStringPad(out, startSec, freq, durSec, amp = 0.065) {
  if (!Number.isFinite(freq)) return;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  const attack = Math.min(0.45, durSec * 0.3);
  const release = Math.min(0.65, durSec * 0.35);
  let p1 = 0;
  let p2 = 0.7;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attack) env = raisedCosine(t, attack);
    else if (t > durSec - release) env = raisedCosine(durSec - t, release);

    const vib = 1 + 0.003 * Math.sin(2 * Math.PI * 4.6 * t);
    p1 += (2 * Math.PI * freq * 0.9985 * vib) / SAMPLE_RATE;
    p2 += (2 * Math.PI * freq * 1.0015 * vib) / SAMPLE_RATE;

    const voice =
      (Math.sin(p1) + Math.sin(p2)) * 0.36 +
      (Math.sin(2 * p1) + Math.sin(2 * p2)) * 0.11 +
      (Math.sin(3 * p1) + Math.sin(3 * p2)) * 0.035;

    out[idx] += voice * env * amp;
  }
}

/**
 * Soft folk snare-brush swish for gentle pulse and bouncy chase shuffle.
 */
function addSnareBrush(out, startSec, durSec = 0.085, amp = 0.065) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let lp = 0;
  let prev = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const raw = whiteNoise();
    // Bandpass noise shaping for silky brushed snare wire swish
    const hp = raw - 0.82 * prev;
    prev = raw;
    lp = 0.58 * lp + 0.42 * hp;

    const env =
      (t < 0.008 ? raisedCosine(t, 0.008) : 1.0) *
      Math.exp(-t * (26 / Math.max(0.06, durSec / 0.085)));
    out[idx] += lp * env * amp;
  }
}

/**
 * Classic 1970s animated-short hollow maple woodblock tap.
 */
function addWoodblock(out, startSec, high = true, amp = 0.13) {
  const durSec = 0.065;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  const f1 = high ? 980 : 740;
  const f2 = f1 * 2.18;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.0015 ? t / 0.0015 : 1.0;
    const tone =
      Math.sin(2 * Math.PI * f1 * t) * Math.exp(-t * 62) * 0.78 +
      Math.sin(2 * Math.PI * f2 * t) * Math.exp(-t * 115) * 0.22;
    const click = whiteNoise() * Math.exp(-t * 280) * 0.14;

    out[idx] += (tone + click) * attack * amp;
  }
}

/**
 * Warm acoustic-lute / nylon guitar chord strum built over shared Karplus-Strong pluck.
 */
function strumAcousticGuitar(
  out,
  time,
  notes,
  noteDur,
  amp = 0.09,
  spread = 0.022,
  up = false
) {
  const ordered = up ? [...notes].reverse() : notes;
  ordered.forEach((note, i) => {
    const freq = NOTES[note];
    if (!Number.isFinite(freq)) return;
    addLutePluck(
      out,
      time + i * spread,
      freq,
      noteDur,
      amp,
      up ? 0.56 : 0.48
    );
  });
}

export function generateClassicStarterDogBgm(dur = 44.0) {
  resetSeed(0x5eed1973);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // =========================================================================
  // SECTION 1 (0.0s - 20.4s): Sunny Backyard Morning (~102 BPM, G major)
  // Warm 1970s Robin Hood folk-orchestral charm: gentle acoustic guitar/lute
  // strums, soft pizzicato double-bass, brushed snare pulse, and airy wooden
  // flute phrases carefully uncrowded during Narrator (3.15-12.75s) and
  // Biscuit (13.35-17.80s) voiceovers!
  // =========================================================================
  const s1Beat = 60 / 102; // 0.588235s (34 beats = 20.000s + 0.40s pickup -> 20.40s)
  const s1Bars = [
    // Bar 0 (0.00 - 2.35s): Intro before Narrator
    {
      startBeat: 0,
      beats: 4,
      bass1: 'G2',
      bass3: 'D3',
      chord1: ['G3', 'B3', 'D4', 'G4'],
      chord2: ['G3', 'B3', 'D4', 'G4'],
      underVO: false,
    },
    // Bar 1 (2.35 - 4.71s): Narrator begins at 3.15s
    {
      startBeat: 4,
      beats: 4,
      bass1: 'D3',
      bass3: 'A2',
      chord1: ['D3', 'A3', 'D4', 'Fs4'],
      chord2: ['D3', 'A3', 'D4', 'Fs4'],
      underVO: true,
    },
    // Bar 2 (4.71 - 7.06s): Warm pastoral Narrator bed
    {
      startBeat: 8,
      beats: 4,
      bass1: 'E2',
      bass3: 'B2',
      chord1: ['E3', 'B3', 'D4', 'G4'],
      chord2: ['E3', 'B3', 'D4', 'G4'],
      underVO: true,
    },
    // Bar 3 (7.06 - 9.41s): Sunny C major lift
    {
      startBeat: 12,
      beats: 4,
      bass1: 'C3',
      bass3: 'G2',
      chord1: ['C3', 'G3', 'C4', 'E4'],
      chord2: ['C3', 'G3', 'C4', 'E4'],
      underVO: true,
    },
    // Bar 4 (9.41 - 11.76s): G -> Em folk sway
    {
      startBeat: 16,
      beats: 4,
      bass1: 'G2',
      bass3: 'E2',
      chord1: ['G3', 'B3', 'D4', 'G4'],
      chord2: ['E3', 'G3', 'B3', 'E4'],
      underVO: true,
    },
    // Bar 5 (11.76 - 14.12s): Am7 -> D7 (Narrator ends 12.75s, Biscuit starts 13.35s)
    {
      startBeat: 20,
      beats: 4,
      bass1: 'A2',
      bass3: 'D3',
      chord1: ['A3', 'C4', 'E4', 'G4'],
      chord2: ['D3', 'A3', 'C4', 'Fs4'],
      underVO: true,
    },
    // Bar 6 (14.12 - 16.47s): Biscuit speaks (13.35 - 17.80s) — breezy G -> C
    {
      startBeat: 24,
      beats: 4,
      bass1: 'G2',
      bass3: 'C3',
      chord1: ['G3', 'B3', 'D4', 'G4'],
      chord2: ['C3', 'G3', 'C4', 'E4'],
      underVO: true,
    },
    // Bar 7 (16.47 - 18.82s): D -> G (Biscuit wraps at 17.80s!)
    {
      startBeat: 28,
      beats: 4,
      bass1: 'D3',
      bass3: 'G2',
      chord1: ['D3', 'A3', 'D4', 'Fs4'],
      chord2: ['G3', 'B3', 'D4', 'G4'],
      underVO: false,
    },
    // Bar 8 (18.82 - 20.00s, 2 beats): Eager C -> D7 turnaround into park chase
    {
      startBeat: 32,
      beats: 2,
      bass1: 'C3',
      bass3: 'D3',
      chord1: ['C3', 'G3', 'C4', 'E4'],
      chord2: ['D3', 'A3', 'C4', 'Fs4'],
      underVO: false,
    },
  ];

  for (const bar of s1Bars) {
    const t0 = bar.startBeat * s1Beat;
    const gAmp = bar.underVO ? 0.068 : 0.088;
    const bAmp = bar.underVO ? 0.16 : 0.19;

    // Gentle pizzicato double-bass on beats 1 & 3 (or 1 & 2 for 2-beat turnaround)
    addPizzBass(out, t0, NOTES[bar.bass1], s1Beat * 1.55, bAmp);
    if (bar.beats >= 4) {
      addPizzBass(out, t0 + 2 * s1Beat, NOTES[bar.bass3], s1Beat * 1.55, bAmp * 0.92);
    } else if (bar.beats === 2) {
      addPizzBass(out, t0 + 1 * s1Beat, NOTES[bar.bass3], s1Beat * 0.9, bAmp);
    }

    // Warm sunlit folk guitar pattern: Down(1), soft Up(2&), Down(3), soft Up(4&)
    strumAcousticGuitar(out, t0, bar.chord1, s1Beat * 1.45, gAmp, 0.024, false);
    if (bar.beats >= 4) {
      strumAcousticGuitar(
        out,
        t0 + 1.5 * s1Beat,
        bar.chord1,
        s1Beat * 0.72,
        gAmp * 0.72,
        0.016,
        true
      );
      strumAcousticGuitar(
        out,
        t0 + 2.0 * s1Beat,
        bar.chord2,
        s1Beat * 1.4,
        gAmp * 0.95,
        0.022,
        false
      );
      strumAcousticGuitar(
        out,
        t0 + 3.5 * s1Beat,
        bar.chord2,
        s1Beat * 0.68,
        gAmp * 0.7,
        0.015,
        true
      );

      // Soft brushed snare on beats 2 & 4
      addSnareBrush(out, t0 + 1.0 * s1Beat, 0.08, bar.underVO ? 0.036 : 0.048);
      addSnareBrush(out, t0 + 3.0 * s1Beat, 0.08, bar.underVO ? 0.036 : 0.048);
    } else {
      // Bar 8 (2-beat build into Section 2)
      strumAcousticGuitar(
        out,
        t0 + 1.0 * s1Beat,
        bar.chord2,
        s1Beat * 0.95,
        gAmp * 1.05,
        0.018,
        false
      );
      addSnareBrush(out, t0 + 0.5 * s1Beat, 0.07, 0.05);
      addSnareBrush(out, t0 + 1.5 * s1Beat, 0.07, 0.06);
    }
  }

  // Gentle wooden flute / pastoral whistle melody for Section 1:
  // Full charming intro (0.15 - 2.95s), delicate breathing ornaments under VO,
  // then joyful rising return after Biscuit finishes (17.85 - 20.38s)!
  const s1Flute = [
    // Opening pastoral G-major hook (0.15s - 2.95s, before Narrator enters at 3.15s)
    [0.25, 'D5', 0.36, 0.135],
    [1.0, 'G5', 0.52, 0.145],
    [2.0, 'A5', 0.42, 0.14],
    [2.75, 'B5', 0.52, 0.145],
    [3.65, 'A5', 0.38, 0.125],
    [4.25, 'Fs5', 0.5, 0.115], // finishes gracefully around 3.00s

    // Sparse, ultra-gentle wooden flute sighs under Narrator (3.15 - 12.75s)
    [10.0, 'G5', 0.42, 0.068],
    [11.0, 'E5', 0.48, 0.065],
    [14.5, 'E5', 0.4, 0.065],
    [15.25, 'D5', 0.44, 0.062],
    // Warm little breath between Narrator (12.75s) & Biscuit (13.35s)
    [21.75, 'A5', 0.36, 0.088],
    [22.35, 'Fs5', 0.42, 0.085],

    // Delicate playful chirps under Biscuit (13.35 - 17.80s)
    [26.5, 'G5', 0.34, 0.068],
    [27.25, 'E5', 0.36, 0.065],

    // Post-Biscuit cheerful perk-up launching into Park Chase (17.85 - 20.00s)
    [30.35, 'G5', 0.34, 0.125],
    [31.0, 'A5', 0.34, 0.13],
    [31.65, 'B5', 0.38, 0.135],
    [32.3, 'C6', 0.34, 0.135],
    [33.0, 'A5', 0.32, 0.135],
    [33.5, 'B5', 0.28, 0.135],
  ];
  for (const [beat, note, noteDur, amp] of s1Flute) {
    addWoodenFlute(out, beat * s1Beat, NOTES[note], noteDur, amp);
  }

  // Eager 1970s whistle & woodblock pickup (20.00s -> 20.38s) right into Section 2!
  addWoodblock(out, 20.02, false, 0.1);
  addWoodblock(out, 20.21, true, 0.115);
  addJauntyWhistle(out, 20.02, NOTES.A5, 0.17, 0.115);
  addJauntyWhistle(out, 20.2, NOTES.Cs6, 0.18, 0.125);

  // =========================================================================
  // SECTION 2 (20.4s - 32.6s): Sunlit Park Meadow Fetch Chase (~138 BPM)
  // D major -> G major! Energetic bouncy chase rhythm: jaunty whistling &
  // wooden flute motif, brisk pizzicato strings, bouncing walking pizz bass,
  // playful snare-brush shuffles & hollow maple woodblock taps, with a
  // sparkling celebratory catch cadence right at 24.31s (Beat 9)!
  // =========================================================================
  const s2Start = 20.4;
  const s2Beat = 60 / 138; // 0.434783s (28 beats = 12.174s -> 32.574s)

  const s2Bars = [
    // Bar 0 (beats 0-3, 20.40 - 22.14s): D -> G chase kickoff!
    {
      startBeat: 0,
      beats: 4,
      walk: ['D3', 'A2', 'G2', 'B2'],
      pizz1: ['D4', 'Fs4', 'A4'],
      pizz2: ['G4', 'B4', 'D5'],
      guitar1: ['D3', 'A3', 'D4', 'Fs4'],
      guitar2: ['G3', 'B3', 'D4', 'G4'],
    },
    // Bar 1 (beats 4-7, 22.14 - 23.88s): A7 -> D sprint!
    {
      startBeat: 4,
      beats: 4,
      walk: ['A2', 'Cs3', 'D3', 'Fs3'],
      pizz1: ['E4', 'G4', 'A4'],
      pizz2: ['D4', 'Fs4', 'A4'],
      guitar1: ['A3', 'Cs4', 'E4', 'G4'],
      guitar2: ['D3', 'A3', 'D4', 'Fs4'],
    },
    // Bar 2 (beats 8-11, 23.88 - 25.62s): Beat 8 A7 leap -> Beat 9 (24.31s) BIG CATCH D MAJOR FANFARE!
    {
      startBeat: 8,
      beats: 4,
      walk: ['A2', 'D3', 'A2', 'D3'],
      pizz1: ['E4', 'A4', 'Cs5'],
      pizz2: ['D4', 'Fs4', 'A4', 'D5'],
      guitar1: ['A3', 'Cs4', 'E4', 'G4'],
      guitar2: ['D3', 'A3', 'D4', 'Fs4'],
      catchBar: true,
    },
    // Bar 3 (beats 12-15, 25.62 - 27.36s): Modulate to sunny G major victory romp!
    {
      startBeat: 12,
      beats: 4,
      walk: ['G2', 'B2', 'D3', 'B2'],
      pizz1: ['G4', 'B4', 'D5'],
      pizz2: ['G4', 'B4', 'D5'],
      guitar1: ['G3', 'B3', 'D4', 'G4'],
      guitar2: ['G3', 'B3', 'D4', 'G4'],
    },
    // Bar 4 (beats 16-19, 27.36 - 29.10s): C -> D7 joyful park trot
    {
      startBeat: 16,
      beats: 4,
      walk: ['C3', 'E3', 'D3', 'Fs3'],
      pizz1: ['E4', 'G4', 'C5'],
      pizz2: ['Fs4', 'A4', 'C5'],
      guitar1: ['C3', 'G3', 'C4', 'E4'],
      guitar2: ['D3', 'A3', 'C4', 'Fs4'],
    },
    // Bar 5 (beats 20-23, 29.10 - 30.83s): G -> Em -> C playful prance
    {
      startBeat: 20,
      beats: 4,
      walk: ['G2', 'E2', 'C3', 'G2'],
      pizz1: ['G4', 'B4', 'D5'],
      pizz2: ['E4', 'G4', 'C5'],
      guitar1: ['G3', 'B3', 'D4', 'G4'],
      guitar2: ['C3', 'G3', 'C4', 'E4'],
    },
    // Bar 6 (beats 24-27, 30.83 - 32.57s): Am7 -> D7 -> G happy finish easing into Section 3
    {
      startBeat: 24,
      beats: 4,
      walk: ['A2', 'D3', 'G2', 'G2'],
      pizz1: ['E4', 'G4', 'C5'],
      pizz2: ['D4', 'G4', 'B4'],
      guitar1: ['A3', 'C4', 'E4', 'G4'],
      guitar2: ['G3', 'B3', 'D4', 'G4'],
      windDown: true,
    },
  ];

  for (const bar of s2Bars) {
    for (let b = 0; b < bar.beats; b++) {
      const globalBeat = bar.startBeat + b;
      const bt = s2Start + globalBeat * s2Beat;
      const isSecondHalf = bar.catchBar ? b >= 1 : b >= 2;
      const activePizz = isSecondHalf ? bar.pizz2 : bar.pizz1;
      const activeGuitar = isSecondHalf ? bar.guitar2 : bar.guitar1;

      // Bouncy walking pizzicato double-bass on every beat (soften final beat 27)
      if (!(bar.windDown && b === 3)) {
        addPizzBass(
          out,
          bt,
          NOTES[bar.walk[b]],
          s2Beat * (bar.windDown && b === 2 ? 1.55 : 0.72),
          0.22
        );
      }

      // Crisp offbeat pizzicato strings & choppy acoustic folk strums
      if (!(bar.windDown && b >= 2)) {
        const offT = bt + 0.5 * s2Beat;
        for (const pn of activePizz) {
          addPizzString(out, offT, NOTES[pn], 0.2, 0.075);
        }
        strumAcousticGuitar(out, offT, activeGuitar, s2Beat * 0.48, 0.068, 0.011, true);
      }

      // Downbeat acoustic folk guitar punch on chord changes
      if (b === 0 || (b === 2 && !bar.catchBar) || (bar.catchBar && b === 1)) {
        strumAcousticGuitar(
          out,
          bt,
          activeGuitar,
          s2Beat * (bar.windDown && b === 2 ? 1.65 : 0.78),
          0.088,
          0.013,
          false
        );
      }

      // Playful snare-brush shuffle & hollow woodblock taps
      if (!bar.windDown || b < 2) {
        addSnareBrush(out, bt, 0.06, b % 2 === 1 ? 0.072 : 0.044);
        addSnareBrush(out, bt + 0.5 * s2Beat, 0.055, 0.052);
        if (b % 2 === 1) {
          addWoodblock(out, bt, b === 3, 0.115);
        } else if (b === 2) {
          addWoodblock(out, bt + 0.5 * s2Beat, true, 0.085);
        }
      }
    }
  }

  // Celebratory Big Catch flourish right at 24.31s (Beat 9)!
  const catchTime = s2Start + 9 * s2Beat; // 24.313s
  addWoodblock(out, catchTime, true, 0.145);
  addWoodblock(out, catchTime + 0.11, false, 0.11);
  const catchHarp = ['D4', 'Fs4', 'A4', 'D5', 'Fs5', 'A5'];
  catchHarp.forEach((note, i) => {
    addConcertHarp(out, catchTime + i * 0.045, NOTES[note], 1.1, 0.095);
  });

  // Lively jaunty whistling + wooden flute fetch chase melody (D major -> Catch! -> G major)
  const s2Melody = [
    // Bar 0 (D -> G, beats 0-3)
    [0.0, 'D5', 0.2], [0.5, 'Fs5', 0.2], [1.0, 'A5', 0.24], [1.5, 'B5', 0.2],
    [2.0, 'G5', 0.24], [2.5, 'B5', 0.2], [3.0, 'D6', 0.3],
    // Bar 1 (A7 -> D, beats 4-7)
    [4.0, 'Cs6', 0.22], [4.5, 'A5', 0.2], [5.0, 'G5', 0.22], [5.5, 'E5', 0.2],
    [6.0, 'Fs5', 0.24], [6.5, 'A5', 0.2], [7.0, 'D6', 0.26], [7.5, 'B5', 0.2],
    // Bar 2 (Beat 8 rising leap -> Beat 9 @ 24.31s BIG CATCH CELEBRATION!)
    [8.0, 'A5', 0.18], [8.5, 'Cs6', 0.2],
    [9.0, 'D6', 0.44], [10.0, 'A5', 0.22], [10.5, 'B5', 0.22], [11.0, 'D6', 0.34],
    // Bar 3 (G major joyful prance, beats 12-15)
    [12.0, 'B5', 0.24], [12.5, 'A5', 0.2], [13.0, 'G5', 0.24], [13.5, 'D5', 0.2],
    [14.0, 'G5', 0.24], [14.5, 'A5', 0.2], [15.0, 'B5', 0.3],
    // Bar 4 (C -> D7, beats 16-19)
    [16.0, 'C6', 0.24], [16.5, 'B5', 0.2], [17.0, 'A5', 0.24], [17.5, 'G5', 0.2],
    [18.0, 'Fs5', 0.24], [18.5, 'A5', 0.2], [19.0, 'D6', 0.32],
    // Bar 5 (G -> Em -> C, beats 20-23)
    [20.0, 'B5', 0.22], [20.5, 'D6', 0.22], [21.0, 'B5', 0.22], [21.5, 'G5', 0.2],
    [22.0, 'E5', 0.24], [22.5, 'G5', 0.2], [23.0, 'C6', 0.3],
    // Bar 6 (Am7 -> D7 -> G buoyant wind-down into Section 3)
    [24.0, 'A5', 0.22], [24.5, 'B5', 0.2], [25.0, 'A5', 0.24], [25.5, 'Fs5', 0.22],
    [26.0, 'G5', 0.62],
  ];

  for (const [b, note, d] of s2Melody) {
    const t = s2Start + b * s2Beat;
    const freq = NOTES[note];
    const isCatchPeak = b === 9.0;
    addJauntyWhistle(out, t, freq, d, isCatchPeak ? 0.145 : 0.115);
    addWoodenFlute(out, t, freq * 0.5, d * 0.94, isCatchPeak ? 0.11 : 0.085);
    addPizzString(out, t, freq * 0.5, Math.min(0.24, d), 0.07);
  }

  // =========================================================================
  // SECTION 3 (32.6s - 44.0s): Golden Afternoon Homecoming & Iris-Out
  // (~88 BPM -> graceful slowing ritardando, G major)
  // Warm nostalgic concert harp arpeggios, mellow clarinet & wooden flute
  // duet phrasing, soft pizzicato bass & warm string glow resolving onto a
  // golden Gmaj9 chord fading cleanly to exact silence at 43.75 - 44.0s!
  // =========================================================================
  const s3Beat = 60 / 88; // 0.6818s

  const s3Phrases = [
    // Phrase 1a (32.60s, 2 beats): Cmaj7 warm golden sunlight arrival
    {
      t: 32.6,
      beatDur: s3Beat,
      bass: 'C3',
      harp: ['C3', 'G3', 'B3', 'D4', 'E4', 'G4'],
      pad: ['C4', 'E4', 'B4'],
      clarinet: [[0.0, 'E5', 0.85], [1.2, 'D5', 0.55]],
      flute: [[0.5, 'G5', 0.7]],
    },
    // Phrase 1b (33.96s, 2 beats): G/B loving homecoming step
    {
      t: 33.96,
      beatDur: s3Beat,
      bass: 'B2',
      harp: ['B2', 'G3', 'D4', 'G4', 'B4', 'D5'],
      pad: ['B3', 'D4', 'G4'],
      clarinet: [[0.0, 'B4', 1.05]],
      flute: [[0.75, 'D5', 0.72]],
    },
    // Phrase 2a (35.33s, 2 beats): Am7 tender memory
    {
      t: 35.33,
      beatDur: s3Beat * 1.03,
      bass: 'A2',
      harp: ['A2', 'E3', 'G3', 'C4', 'E4', 'G4'],
      pad: ['A3', 'C4', 'G4'],
      clarinet: [[0.0, 'C5', 0.85], [1.15, 'B4', 0.58]],
      flute: [[0.45, 'E5', 0.75]],
    },
    // Phrase 2b (36.73s, 2 beats): D9sus4 -> D7 gentle sigh
    {
      t: 36.73,
      beatDur: s3Beat * 1.06,
      bass: 'D2',
      harp: ['D3', 'A3', 'C4', 'E4', 'G4', 'Fs4'],
      pad: ['D4', 'Fs4', 'A4'],
      clarinet: [[0.0, 'A4', 0.88], [1.2, 'Fs4', 0.68]],
      flute: [[0.5, 'D5', 0.82]],
    },
    // Phrase 3a (38.18s, ritardando ~79 BPM): Em7 nostalgic warmth
    {
      t: 38.18,
      beatDur: 0.75,
      bass: 'E2',
      harp: ['E3', 'B3', 'D4', 'G4', 'B4', 'G4'],
      pad: ['E3', 'B3', 'G4'],
      clarinet: [[0.0, 'B4', 0.92], [1.1, 'G4', 0.65]],
      flute: [[0.55, 'D5', 0.82]],
    },
    // Phrase 3b (39.68s, deeper ritardando ~71 BPM): Cadd9 -> D7 suspension before iris-out
    {
      t: 39.68,
      beatDur: 0.84,
      bass: 'D2',
      harp: ['C3', 'G3', 'D4', 'E4', 'A4', 'Fs4'],
      pad: ['C4', 'D4', 'Fs4'],
      clarinet: [[0.0, 'A4', 0.78], [0.95, 'Fs4', 0.62]],
      flute: [[0.35, 'E5', 0.68], [1.0, 'D5', 0.65]],
    },
  ];

  for (const ph of s3Phrases) {
    addPizzBass(out, ph.t, NOTES[ph.bass], ph.beatDur * 2.1, 0.17);

    // Warm rolling concert harp arpeggio
    const harpStep = (ph.beatDur * 2.0) / ph.harp.length;
    for (let i = 0; i < ph.harp.length; i++) {
      addConcertHarp(
        out,
        ph.t + i * harpStep,
        NOTES[ph.harp[i]],
        2.1,
        i === 0 ? 0.115 : 0.09
      );
    }

    // Subtle warm muted string bed
    for (const pn of ph.pad) {
      addWarmStringPad(out, ph.t, NOTES[pn], ph.beatDur * 2.15, 0.036);
    }

    // Mellow clarinet & gentle wooden flute phrasing
    for (const [offsetBeat, note, d] of ph.clarinet) {
      addWarmClarinet(out, ph.t + offsetBeat * ph.beatDur, NOTES[note], d, 0.115);
    }
    for (const [offsetBeat, note, d] of ph.flute) {
      addWoodenFlute(out, ph.t + offsetBeat * ph.beatDur, NOTES[note], d, 0.088);
    }
  }

  // Final Resolving Warm G Major (Gmaj9) Theatrical Iris-Out Chord (41.05s -> 43.75s)
  const finalT = 41.05;
  addPizzBass(out, finalT, NOTES.G2, 2.7, 0.18);
  addPizzBass(out, finalT + 0.04, NOTES.D3, 2.5, 0.1);

  const finalPad = ['G3', 'B3', 'D4', 'A4'];
  for (const pn of finalPad) {
    addWarmStringPad(out, finalT, NOTES[pn], 2.75, 0.052);
  }

  // Shimmering ascending concert harp finale arpeggio
  const finalHarp = ['G3', 'D4', 'G4', 'A4', 'B4', 'D5', 'Fs5', 'G5'];
  for (let i = 0; i < finalHarp.length; i++) {
    const ht = finalT + i * 0.165;
    const remain = Math.max(0.85, 43.75 - ht);
    addConcertHarp(out, ht, NOTES[finalHarp[i]], remain, i === 0 ? 0.12 : 0.1);
  }

  // Soft warm resolving clarinet & wooden flute final sigh
  addWarmClarinet(out, finalT + 0.08, NOTES.G4, 2.45, 0.105);
  addWarmClarinet(out, finalT + 0.32, NOTES.B4, 2.25, 0.085);
  addWoodenFlute(out, finalT + 0.58, NOTES.G5, 2.05, 0.095);

  // Subtle 1970s warm scoring-stage room ambience (2 early reflections + gentle tail)
  const tap1 = Math.floor(0.029 * SAMPLE_RATE);
  const tap2 = Math.floor(0.067 * SAMPLE_RATE);
  const tap3 = Math.floor(0.113 * SAMPLE_RATE);
  const wet = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    if (i >= tap1) r += out[i - tap1] * 0.13;
    if (i >= tap2) r += out[i - tap2] * 0.085;
    if (i >= tap3) r += out[i - tap3] * 0.045;
    wet[i] = out[i] + r;
  }

  // Master envelope: smooth fade-in (0.25s), gentle analog warmth, and clean cosine fade
  // to exact zero silence by 43.75s (43.75s - 44.00s pure silence)
  const fadeStart = 42.15;
  const fadeEnd = 43.75;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.25) {
      env = raisedCosine(t, 0.25);
    } else if (t >= fadeEnd) {
      env = 0.0;
    } else if (t > fadeStart) {
      const p = (t - fadeStart) / (fadeEnd - fadeStart);
      env = 0.5 * (1 + Math.cos(Math.PI * p));
    }
    // Gentle soft-knee tape warmth to prevent any transient spikes
    out[i] = Math.tanh(wet[i] * 1.08) / 1.08 * env;
  }

  return out;
}

export const CLASSIC_STARTER_DOG_BGM_CLIP = {
  id: 'classic-starter-dog-bgm',
  filename: 'classic-starter-dog-bgm.wav',
  src: '/audio/classic-starter-dog-bgm.wav',
  title: "Biscuit's Classic Storybook Adventure — 1970s Folk-Orchestral Score",
  category: 'bgm',
  durationSec: 44.0,
  defaultVolume: 0.25,
  targetPeak: 0.8,
  description:
    'Dynamic 3-section 44.0s 1970s Disney-storybook folk-orchestral score (Robin Hood 1973 warm charm): (1) Sunny Backyard Morning (0.0-20.4s, ~102 BPM, G major) warm acoustic guitar/lute strums, soft pizzicato bass & airy wooden flute uncrowded under Narrator (3.15-12.75s) and Biscuit (13.35-17.80s) voiceovers; (2) Sunlit Park Meadow Fetch Chase (20.4-32.6s, ~138 BPM, D major -> G major) bouncy walking bass, brisk pizzicato strings, snare-brush & hollow woodblock taps, jaunty whistling/flute motif & celebratory catch cadence at 24.31s; (3) Golden Afternoon Homecoming & Theatrical Iris-Out (32.6-44.0s, ~88 BPM -> ritardando, G major) shimmering concert harp arpeggios, mellow clarinet & flute duet resolving on a warm Gmaj9 chord fading cleanly to silence at 43.75-44.0s.',
  themes: [
    'dog',
    'pet',
    'classic',
    'storybook',
    'backyard',
    'park',
    'fetch',
    'sunny',
    'folk',
    'pastoral',
    'summer',
  ],
  generate: () => generateClassicStarterDogBgm(44.0),
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
} = CLASSIC_STARTER_DOG_BGM_CLIP;

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const outPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../public/audio',
    CLASSIC_STARTER_DOG_BGM_CLIP.filename
  );
  const samples = CLASSIC_STARTER_DOG_BGM_CLIP.generate();
  writeWav(outPath, samples, CLASSIC_STARTER_DOG_BGM_CLIP.targetPeak);
  console.log(
    `Generated ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`
  );
}

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  NOTE_FREQS,
  SAMPLE_RATE,
  addHornNote,
  addLutePluck,
  addRecorderNote,
  addTaborBeat,
  resetSeed,
  whiteNoise,
  writeWav,
} from './shared.mjs';

/**
 * Shimmering storybook harp pluck with bell-like warmth for opening & relief flourishes.
 */
function addHarpNote(out, startSec, freq, durSec, amp = 0.16) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.006 ? t / 0.006 : 1.0;
    const rel = t > durSec - 0.05 ? Math.max(0, (durSec - t) / 0.05) : 1.0;
    const decay = Math.exp(-t * (2.6 / Math.max(0.45, durSec)));
    const sparkle = Math.exp(-t * 9.5);
    const w = 2 * Math.PI * freq * t;
    const tone =
      Math.sin(w) * 0.66 +
      Math.sin(2 * w) * 0.22 * (0.4 + 0.6 * sparkle) +
      Math.sin(3 * w) * 0.09 * sparkle +
      Math.sin(4 * w) * 0.03 * sparkle;
    out[idx] += tone * attack * decay * rel * amp;
  }
}

/**
 * Quirky comedic staccato bassoon / double-reed woodwind voice for playful stealth & hiccup beats.
 */
function addStaccatoBassoon(out, startSec, freq, durSec = 0.17, amp = 0.2) {
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
    if (t < attack) env = t / attack;
    else if (t > durSec - release) env = Math.max(0, (durSec - t) / release);

    // Subtle playful pitch scoop at onset for cartoon double-reed bounce
    const pitchScoop = 1 - 0.035 * Math.exp(-t * 55);
    phase += (2 * Math.PI * freq * pitchScoop) / SAMPLE_RATE;

    const reed =
      Math.sin(phase) * 0.44 +
      Math.sin(2 * phase) * 0.32 +
      Math.sin(3 * phase) * 0.18 +
      Math.sin(4 * phase) * 0.09 +
      Math.sin(5 * phase) * 0.04;

    noiseLp = 0.78 * noiseLp + 0.22 * whiteNoise();
    const tongueClick = noiseLp * Math.exp(-t * 90) * 0.08;
    const damp = Math.exp(-t * 2.8);
    out[idx] += (reed + tongueClick) * env * damp * amp;
  }
}

/**
 * Crisp short-decay pizzicato string pluck for mystery & comedic tiptoe walks.
 */
function addPizzPluck(out, startSec, freq, durSec = 0.22, amp = 0.18) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.003 ? t / 0.003 : 1.0;
    const rel = t > durSec - 0.025 ? Math.max(0, (durSec - t) / 0.025) : 1.0;
    const f = freq * (1 + 0.018 * Math.exp(-t * 65));
    phase += (2 * Math.PI * f) / SAMPLE_RATE;

    const decay = Math.exp(-t * 11.5);
    const tone =
      Math.sin(phase) * 0.68 +
      Math.sin(2 * phase) * 0.24 * Math.exp(-t * 16) +
      Math.sin(3 * phase) * 0.1 * Math.exp(-t * 28);
    const snap = whiteNoise() * Math.exp(-t * 190) * 0.12;
    out[idx] += (tone * decay + snap) * attack * rel * amp;
  }
}

/**
 * Soft snare / tabor roll tap for accelerating comedic tension buildup.
 */
function addSnareRollTap(out, startSec, amp = 0.12) {
  const durSec = 0.085;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let prev = 0;
  let phase = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const raw = whiteNoise();
    const hp = raw - prev;
    prev = raw;

    phase += (2 * Math.PI * (145 + 45 * Math.exp(-t * 45))) / SAMPLE_RATE;
    const shell = Math.sin(phase) * Math.exp(-t * 32) * 0.45;
    const wires = hp * Math.exp(-t * 38) * 0.55;
    out[idx] += (shell + wires) * amp;
  }
}

export function generateKnightHiccupsBgm(dur = 54.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function strumChord(time, notes, noteDur, amp = 0.14, spread = 0.032, brightness = 0.6) {
    notes.forEach((note, i) => {
      addLutePluck(out, time + i * spread, NOTE_FREQS[note], noteDur, amp, brightness);
    });
  }

  function harpArp(time, notes, stepSec, noteDur, amp = 0.14) {
    notes.forEach((note, i) => {
      const f = NOTE_FREQS[note];
      addHarpNote(out, time + i * stepSec, f, noteDur, amp);
      addLutePluck(out, time + i * stepSec, f, Math.min(noteDur, 1.1), amp * 0.45, 0.5);
    });
  }

  // =========================================================================
  // SECTION 1 (0.0 - 15.0s): Book Opening & Castle Call to Arms
  // =========================================================================

  // 0.0 - 3.5s: Gentle welcoming storybook harp/lute arpeggio in D major
  harpArp(0.12, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'E5', 'Fs5'], 0.115, 1.45, 0.15);
  addRecorderNote(out, 0.55, NOTE_FREQS.Fs5, 0.55, 0.11);
  addRecorderNote(out, 1.12, NOTE_FREQS.E5, 0.42, 0.11);

  harpArp(1.15, ['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'B4', 'D5'], 0.115, 1.35, 0.14);
  addRecorderNote(out, 1.58, NOTE_FREQS.D5, 0.52, 0.12);

  harpArp(2.15, ['A2', 'E3', 'A3', 'D4', 'E4', 'A4', 'Cs5'], 0.11, 1.1, 0.14);
  addRecorderNote(out, 2.25, NOTE_FREQS.E5, 0.35, 0.12);
  addRecorderNote(out, 2.65, NOTE_FREQS.Cs5, 0.35, 0.12);

  strumChord(3.0, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 0.9, 0.14, 0.03, 0.58);
  addHarpNote(out, 3.05, NOTE_FREQS.D5, 0.85, 0.14);

  // 3.5 - 7.5s: Alert royal brass horn fanfare + quick messenger lute flurry
  addTaborBeat(out, 3.5, 0.19, false);
  addTaborBeat(out, 3.92, 0.22, true);
  addHornNote(out, 3.5, NOTE_FREQS.D4, 0.2, 0.16);
  addHornNote(out, 3.72, NOTE_FREQS.A4, 0.18, 0.17);
  addHornNote(out, 3.92, NOTE_FREQS.D5, 0.62, 0.18);
  addHornNote(out, 3.92, NOTE_FREQS.A4, 0.62, 0.11);
  strumChord(3.92, ['D3', 'A3', 'D4', 'Fs4', 'A4'], 0.9, 0.15, 0.022, 0.7);

  // Quick messenger lute flurry 1 (4.42 - 5.38s)
  const flurry1 = ['D4', 'E4', 'Fs4', 'G4', 'A4', 'B4', 'A4', 'G4', 'Fs4', 'E4'];
  flurry1.forEach((note, i) => {
    addLutePluck(out, 4.42 + i * 0.095, NOTE_FREQS[note], 0.32, 0.15, 0.72);
  });
  addTaborBeat(out, 4.6, 0.12, false);
  addTaborBeat(out, 5.0, 0.14, false);

  // Second answering royal fanfare call (5.38 - 6.35s)
  addTaborBeat(out, 5.4, 0.18, false);
  addTaborBeat(out, 5.82, 0.22, true);
  addHornNote(out, 5.38, NOTE_FREQS.A4, 0.18, 0.16);
  addHornNote(out, 5.58, NOTE_FREQS.D5, 0.2, 0.17);
  addHornNote(out, 5.82, NOTE_FREQS.Fs5, 0.56, 0.17);
  addHornNote(out, 5.82, NOTE_FREQS.A4, 0.56, 0.11);
  strumChord(5.82, ['G3', 'D4', 'G4', 'B4'], 0.85, 0.14, 0.022, 0.7);

  // Quick messenger lute flurry 2 + pickup roll into knight march (6.32 - 7.45s)
  const flurry2 = ['G4', 'A4', 'B4', 'A4', 'G4', 'Fs4', 'E4', 'Fs4', 'G4', 'A4'];
  flurry2.forEach((note, i) => {
    addLutePluck(out, 6.32 + i * 0.095, NOTE_FREQS[note], 0.3, 0.15, 0.72);
  });
  addRecorderNote(out, 6.35, NOTE_FREQS.G5, 0.28, 0.15);
  addRecorderNote(out, 6.68, NOTE_FREQS.Fs5, 0.26, 0.15);
  addRecorderNote(out, 6.98, NOTE_FREQS.E5, 0.36, 0.16);
  addTaborBeat(out, 6.95, 0.14, false);
  addTaborBeat(out, 7.14, 0.16, false);
  addTaborBeat(out, 7.32, 0.2, true);

  // 7.5 - 15.0s: Crisp upbeat heroic knight march (124 BPM -> beat = 0.48387s)
  const marchBeat = 60 / 124; // ~0.48387s
  const marchBars = [
    { start: 7.5, bass: 'D3', altBass: 'A2', arp: ['D4', 'Fs4', 'A4', 'Fs4'], beats: 4 },
    { start: 7.5 + 4 * marchBeat, bass: 'C3', altBass: 'G2', arp: ['C4', 'E4', 'G4', 'E4'], beats: 4 },
    { start: 7.5 + 8 * marchBeat, bass: 'G2', altBass: 'A2', arp: ['G3', 'B3', 'D4', 'E4'], beats: 4 },
    { start: 7.5 + 12 * marchBeat, bass: 'D3', altBass: 'A2', arp: ['D4', 'Fs4', 'A4', 'D5'], beats: 3 },
  ];

  for (let bIdx = 0; bIdx < marchBars.length; bIdx++) {
    const bar = marchBars[bIdx];
    for (let b = 0; b < bar.beats; b++) {
      const bt = bar.start + b * marchBeat;
      if (bt > 14.82) break;
      const bassNote = b % 2 === 0 ? bar.bass : bar.altBass;
      // Crisp march percussion
      addTaborBeat(out, bt, b === 0 ? 0.2 : 0.14, b === 2);
      if (b === 3 && bIdx < 3) {
        addSnareRollTap(out, bt + marchBeat * 0.5, 0.11);
      }
      // Heroic lute bass + offbeat strum
      addLutePluck(out, bt, NOTE_FREQS[bassNote], 0.42, 0.21, 0.62);
      addLutePluck(out, bt + marchBeat * 0.5, NOTE_FREQS[bar.arp[b % 4]], 0.36, 0.16, 0.72);
      addLutePluck(out, bt + marchBeat * 0.75, NOTE_FREQS[bar.arp[(b + 1) % 4]], 0.24, 0.12, 0.7);
    }
    // Horn punctuation on bar downbeats
    const hornRoot = bIdx === 1 ? 'C4' : bIdx === 2 ? 'G4' : 'D4';
    addHornNote(out, bar.start, NOTE_FREQS[hornRoot], marchBeat * 0.85, 0.13);
  }

  // Jaunty heroic recorder march melody (7.5 - 14.85s)
  const marchMelody = [
    [0, 'D5', 0.4], [0.5, 'Fs5', 0.4], [1, 'A5', 0.7], [2, 'Fs5', 0.4], [2.5, 'E5', 0.4], [3, 'D5', 0.7],
    [4, 'E5', 0.4], [4.5, 'G5', 0.4], [5, 'E5', 0.4], [5.5, 'C5', 0.4], [6, 'G4', 0.7], [7, 'C5', 0.6],
    [8, 'B4', 0.4], [8.5, 'D5', 0.4], [9, 'G5', 0.7], [10, 'Fs5', 0.4], [10.5, 'E5', 0.4], [11, 'Cs5', 0.7],
    [12, 'D5', 0.42], [12.5, 'E5', 0.42], [13, 'Fs5', 0.42], [13.5, 'A5', 0.42], [14, 'D5', 0.75],
  ];
  for (const [bOff, note, durBeats] of marchMelody) {
    const t = 7.5 + bOff * marchBeat;
    if (t < 14.75) {
      addRecorderNote(out, t, NOTE_FREQS[note], Math.min(durBeats * marchBeat, 14.9 - t), 0.165);
    }
  }

  // =========================================================================
  // SECTION 2 (15.0 - 25.0s): Scorched Village Mystery (D Dorian, 92 BPM)
  // =========================================================================
  const mystBeat = 60 / 92; // ~0.65217s

  // Phrase 1 (15.0 - 17.5s): Curious D-Dorian pizzicato walk with breathing pause ~17.5-18.2s
  const mystWalk1 = [
    [15.0, 'D3', 0.35], [15.0 + mystBeat * 0.5, 'A3', 0.25],
    [15.0 + mystBeat * 1.0, 'F3', 0.35], [15.0 + mystBeat * 1.5, 'A3', 0.25],
    [15.0 + mystBeat * 2.0, 'G3', 0.35], [15.0 + mystBeat * 2.5, 'B3', 0.25],
    [15.0 + mystBeat * 3.0, 'A3', 0.45],
  ];
  for (const [t, note, d] of mystWalk1) {
    addPizzPluck(out, t, NOTE_FREQS[note], d, 0.17);
    addLutePluck(out, t, NOTE_FREQS[note], d * 1.4, 0.1, 0.48);
  }
  addTaborBeat(out, 15.0, 0.09, false);
  addTaborBeat(out, 15.0 + mystBeat * 2.0, 0.08, false);

  // Inquisitive recorder question 1 (rises to Dorian B4!)
  addRecorderNote(out, 15.25, NOTE_FREQS.D5, 0.42, 0.13);
  addRecorderNote(out, 15.72, NOTE_FREQS.F5, 0.38, 0.13);
  addRecorderNote(out, 16.18, NOTE_FREQS.A4, 0.42, 0.13);
  addRecorderNote(out, 16.72, NOTE_FREQS.B4, 0.62, 0.14);

  // Short gentle breathing space (17.4 - 18.15s)

  // Phrase 2 (18.2 - 20.8s): C major -> G major curious footsteps
  const mystWalk2 = [
    [18.2, 'C3', 0.35], [18.2 + mystBeat * 0.5, 'G3', 0.25],
    [18.2 + mystBeat * 1.0, 'E3', 0.35], [18.2 + mystBeat * 1.5, 'G3', 0.25],
    [18.2 + mystBeat * 2.0, 'G2', 0.35], [18.2 + mystBeat * 2.5, 'D3', 0.25],
    [18.2 + mystBeat * 3.0, 'B3', 0.42], [18.2 + mystBeat * 3.5, 'D4', 0.32],
  ];
  for (const [t, note, d] of mystWalk2) {
    addPizzPluck(out, t, NOTE_FREQS[note], d, 0.17);
    addLutePluck(out, t, NOTE_FREQS[note], d * 1.35, 0.095, 0.48);
  }
  addTaborBeat(out, 18.2, 0.09, false);
  addTaborBeat(out, 18.2 + mystBeat * 2.0, 0.08, false);

  addRecorderNote(out, 18.42, NOTE_FREQS.G4, 0.4, 0.13);
  addRecorderNote(out, 18.92, NOTE_FREQS.C5, 0.45, 0.13);
  addRecorderNote(out, 19.5, NOTE_FREQS.B4, 0.38, 0.13);
  addRecorderNote(out, 19.98, NOTE_FREQS.A4, 0.55, 0.13);

  // Short gentle breathing space (20.7 - 21.4s)

  // Phrase 3 (21.45 - 24.75s): Curious clue discovery (Bb -> A -> D-Dorian)
  const mystWalk3 = [
    [21.45, 'Bb2', 0.38], [21.45 + mystBeat * 0.5, 'F3', 0.26],
    [21.45 + mystBeat * 1.0, 'D3', 0.36], [21.45 + mystBeat * 1.5, 'F3', 0.26],
    [21.45 + mystBeat * 2.0, 'A2', 0.38], [21.45 + mystBeat * 2.5, 'E3', 0.26],
    [21.45 + mystBeat * 3.0, 'Cs4', 0.35], [21.45 + mystBeat * 3.5, 'E4', 0.32],
    [21.45 + mystBeat * 4.0, 'A3', 0.45],
  ];
  for (const [t, note, d] of mystWalk3) {
    addPizzPluck(out, t, NOTE_FREQS[note], d, 0.17);
    addLutePluck(out, t, NOTE_FREQS[note], d * 1.35, 0.1, 0.5);
  }
  addTaborBeat(out, 21.45, 0.09, false);
  addTaborBeat(out, 21.45 + mystBeat * 2.0, 0.09, false);

  addRecorderNote(out, 21.65, NOTE_FREQS.F4, 0.45, 0.13);
  addRecorderNote(out, 22.18, NOTE_FREQS.G4, 0.38, 0.13);
  addRecorderNote(out, 22.65, NOTE_FREQS.A4, 0.45, 0.135);
  addRecorderNote(out, 23.22, NOTE_FREQS.E4, 0.42, 0.13);
  addRecorderNote(out, 23.75, NOTE_FREQS.A4, 0.65, 0.135);

  // =========================================================================
  // SECTION 3 (25.0 - 41.0s): Fiery Hiccups Comedy & Thorn-Pull Climax
  // =========================================================================

  // 25.0 - 35.0s: Playful quirky bouncy comedic staccato bassoon/pizzicato walk (112 BPM)
  // Deliberate clean musical pauses around t=26.6s, t=30.0s, and t=34.5s for dragon hiccup SFX!
  const comBeat = 60 / 112; // ~0.53571s
  const comEighth = comBeat * 0.5; // ~0.26786s

  function inHiccupRest(t) {
    return (
      (t >= 26.42 && t <= 27.02) ||
      (t >= 29.82 && t <= 30.42) ||
      (t >= 34.3 && t <= 34.96)
    );
  }

  const comedyBassPattern = [
    'D3', 'A2', 'F3', 'A2', 'G3', 'D3', 'Bb2', 'A2',
    'D3', 'F3', 'A2', 'Cs3', 'D3', 'G2', 'A2', 'E3',
    'D3', 'A2', 'G2', 'A2', 'Bb2', 'F3', 'A2', 'Cs3',
  ];
  const comedyOffbeatPizz = [
    'F4', 'D4', 'A4', 'F4', 'B4', 'G4', 'F4', 'E4',
    'A4', 'D4', 'E4', 'G4', 'F4', 'B4', 'E4', 'Cs4',
    'F4', 'D4', 'B4', 'G4', 'D4', 'F4', 'E4', 'A4',
  ];

  let stepIdx = 0;
  for (let t = 25.0; t < 34.3; t += comBeat) {
    if (!inHiccupRest(t)) {
      const bNote = comedyBassPattern[stepIdx % comedyBassPattern.length];
      addStaccatoBassoon(out, t, NOTE_FREQS[bNote], 0.17, 0.24);
      addPizzPluck(out, t, NOTE_FREQS[bNote] * 0.5, 0.16, 0.14);
      addTaborBeat(out, t, stepIdx % 2 === 0 ? 0.12 : 0.08, false);
    }
    const offT = t + comEighth;
    if (offT < 34.3 && !inHiccupRest(offT)) {
      const pNote = comedyOffbeatPizz[stepIdx % comedyOffbeatPizz.length];
      addPizzPluck(out, offT, NOTE_FREQS[pNote], 0.15, 0.16);
      addLutePluck(out, offT, NOTE_FREQS[pNote], 0.22, 0.1, 0.72);
    }
    stepIdx++;
  }

  // Cheeky comedic staccato bassoon & chirpy recorder melody phrases between the 3 hiccup rests!
  const comedyPhrases = [
    // Phrase A (25.0 - 26.35s) -> stops right before Hiccup Rest #1 (26.42 - 27.02s)
    { t: 25.0, note: 'D4', d: 0.16, inst: 'bassoon' },
    { t: 25.27, note: 'F4', d: 0.15, inst: 'bassoon' },
    { t: 25.54, note: 'A4', d: 0.16, inst: 'bassoon' },
    { t: 25.81, note: 'Bb4', d: 0.16, inst: 'recorder' },
    { t: 26.08, note: 'A4', d: 0.14, inst: 'recorder' },
    { t: 26.24, note: 'F4', d: 0.14, inst: 'bassoon' },

    // Phrase B (27.08 - 29.75s) -> comic recovery bounce after Hiccup #1, stops before Hiccup Rest #2
    { t: 27.08, note: 'E5', d: 0.14, inst: 'recorder' },
    { t: 27.26, note: 'D5', d: 0.16, inst: 'recorder' },
    { t: 27.58, note: 'G4', d: 0.16, inst: 'bassoon' },
    { t: 27.85, note: 'Bb4', d: 0.15, inst: 'bassoon' },
    { t: 28.12, note: 'D5', d: 0.17, inst: 'recorder' },
    { t: 28.39, note: 'C5', d: 0.15, inst: 'recorder' },
    { t: 28.66, note: 'A4', d: 0.16, inst: 'bassoon' },
    { t: 28.93, note: 'F4', d: 0.16, inst: 'bassoon' },
    { t: 29.2, note: 'G4', d: 0.15, inst: 'recorder' },
    { t: 29.47, note: 'A4', d: 0.15, inst: 'recorder' },
    { t: 29.66, note: 'Cs5', d: 0.12, inst: 'bassoon' },

    // Phrase C (30.48 - 34.22s) -> tiptoeing closer to inspect dragon's jaw, stops before Hiccup Rest #3
    { t: 30.48, note: 'F5', d: 0.13, inst: 'recorder' },
    { t: 30.66, note: 'E5', d: 0.14, inst: 'recorder' },
    { t: 30.95, note: 'D4', d: 0.15, inst: 'bassoon' },
    { t: 31.22, note: 'E4', d: 0.15, inst: 'bassoon' },
    { t: 31.49, note: 'F4', d: 0.15, inst: 'bassoon' },
    { t: 31.76, note: 'G4', d: 0.16, inst: 'bassoon' },
    { t: 32.03, note: 'A4', d: 0.17, inst: 'recorder' },
    { t: 32.3, note: 'Bb4', d: 0.15, inst: 'recorder' },
    { t: 32.57, note: 'A4', d: 0.15, inst: 'recorder' },
    { t: 32.84, note: 'G4', d: 0.15, inst: 'bassoon' },
    { t: 33.11, note: 'F4', d: 0.15, inst: 'bassoon' },
    { t: 33.38, note: 'E4', d: 0.15, inst: 'bassoon' },
    { t: 33.65, note: 'D4', d: 0.16, inst: 'bassoon' },
    { t: 33.92, note: 'A4', d: 0.16, inst: 'recorder' },
    { t: 34.12, note: 'D5', d: 0.14, inst: 'recorder' },
  ];
  for (const p of comedyPhrases) {
    if (p.inst === 'bassoon') {
      addStaccatoBassoon(out, p.t, NOTE_FREQS[p.note], p.d, 0.22);
    } else {
      addRecorderNote(out, p.t, NOTE_FREQS[p.note], p.d, 0.155);
    }
  }

  // 35.0 - 37.3s: Nimble accelerating tension ostinato + soft snare/tabor roll building up to thorn pull!
  const tensionNotes = [
    'A3', 'B3', 'Cs4', 'D4', 'E4', 'Fs4', 'G4', 'A4',
    'Fs4', 'G4', 'A4', 'B4', 'Cs5', 'D5', 'E5', 'Fs5', 'G5', 'A5',
  ];
  let curT = 35.0;
  for (let i = 0; i < tensionNotes.length && curT < 37.18; i++) {
    const progress = i / (tensionNotes.length - 1);
    const step = 0.175 - progress * 0.095;
    const ampScale = 0.72 + progress * 0.45;
    addPizzPluck(out, curT, NOTE_FREQS[tensionNotes[i]], Math.max(0.08, step * 0.95), 0.17 * ampScale);
    addStaccatoBassoon(out, curT, NOTE_FREQS[tensionNotes[i]] * 0.5, Math.max(0.08, step * 0.9), 0.14 * ampScale);
    curT += step;
  }

  // Accelerating crescendo soft snare / tabor roll (35.15 - 37.22s)
  let rollT = 35.15;
  while (rollT < 37.2) {
    const p = (rollT - 35.15) / 2.05;
    const rollStep = 0.12 - p * 0.068;
    addSnareRollTap(out, rollT, 0.06 + p * 0.16);
    if (p > 0.6) {
      addTaborBeat(out, rollT, 0.05 + (p - 0.6) * 0.16, false);
    }
    rollT += rollStep;
  }
  addHornNote(out, 35.5, NOTE_FREQS.A3, 1.72, 0.11);
  addHornNote(out, 36.2, NOTE_FREQS.E4, 1.02, 0.12);

  // 37.3 - 37.8s: Brief dramatic silence / breath (0.45s right at t=37.3s so thorn-pop SFX pops cleanly!)

  // 37.8 - 41.0s: Warm sparkling relief flourish in bright D major!
  harpArp(37.82, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'Fs5', 'A5', 'D6'], 0.075, 1.85, 0.17);
  addHornNote(out, 37.9, NOTE_FREQS.D4, 1.35, 0.13);
  addHornNote(out, 37.9, NOTE_FREQS.Fs4, 1.35, 0.1);
  addHornNote(out, 37.9, NOTE_FREQS.A4, 1.35, 0.11);

  const reliefMelody = [
    [38.05, 'Fs5', 0.38], [38.45, 'A5', 0.42], [38.9, 'D6', 0.58],
    [39.5, 'B5', 0.36], [39.88, 'A5', 0.38], [40.28, 'Fs5', 0.34], [40.62, 'E5', 0.34],
  ];
  for (const [t, note, d] of reliefMelody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.17);
  }
  harpArp(39.35, ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'], 0.095, 1.25, 0.14);
  strumChord(40.25, ['A2', 'E3', 'A3', 'Cs4', 'E4', 'A4'], 0.72, 0.15, 0.028, 0.65);
  addTaborBeat(out, 40.65, 0.14, false);
  addTaborBeat(out, 40.82, 0.18, true);

  // =========================================================================
  // SECTION 4 (41.0 - 54.0s): Royal Castle Celebration Banquet & Book Close
  // =========================================================================

  // 41.0 - 49.5s: Joyful fast medieval festival jig (136 BPM, 6/8 feel -> dotted-quarter = 0.44118s)
  const jigPulse = 60 / 136; // ~0.44118s
  const jigEighth = jigPulse / 3; // ~0.14706s
  const jigBar = jigPulse * 2; // ~0.88235s

  const jigProgression = [
    { bass: 'D3', chord: ['D4', 'Fs4', 'A4'], horn: ['D4', 'A4'] },
    { bass: 'G2', chord: ['G3', 'B3', 'D4'], horn: ['G4', 'D4'] },
    { bass: 'A2', chord: ['A3', 'Cs4', 'E4'], horn: ['A4', 'E4'] },
    { bass: 'D3', chord: ['D4', 'Fs4', 'A4'], horn: ['D4', 'Fs4'] },
    { bass: 'G2', chord: ['G3', 'B3', 'D4'], horn: ['G4', 'B4'] },
    { bass: 'D3', chord: ['D4', 'Fs4', 'A4'], horn: ['D4', 'A4'] },
    { bass: 'A2', chord: ['A3', 'Cs4', 'E4'], horn: ['A4', 'Cs4'] },
    { bass: 'D3', chord: ['D4', 'Fs4', 'A4'], horn: ['D4', 'Fs4'] },
    { bass: 'G2', chord: ['G3', 'B3', 'D4'], horn: ['G4', 'B4'] },
    { bass: 'A2', chord: ['A3', 'Cs4', 'E4'], horn: ['A4', 'E4'] },
  ];

  const jigMelodyBars = [
    ['Fs5', 'G5', 'A5', 'D6', 'A5', 'Fs5'],
    ['G5', 'A5', 'B5', 'G5', 'D5', 'B4'],
    ['A4', 'Cs5', 'E5', 'G5', 'Fs5', 'E5'],
    ['Fs5', 'A5', 'D6', 'A5', 'Fs5', 'D5'],
    ['B4', 'D5', 'G5', 'B5', 'A5', 'G5'],
    ['Fs5', 'G5', 'A5', 'D6', 'B5', 'A5'],
    ['G5', 'Fs5', 'E5', 'Cs5', 'E5', 'A5'],
    ['Fs5', 'E5', 'D5', 'Fs5', 'A5', 'D6'],
    ['B5', 'A5', 'G5', 'Fs5', 'G5', 'B5'],
    ['A5', 'G5', 'Fs5', 'E5'],
  ];

  for (let barIdx = 0; barIdx < jigProgression.length; barIdx++) {
    const barT = 41.0 + barIdx * jigBar;
    if (barT >= 49.45) break;
    const ch = jigProgression[barIdx];

    const hornDur = Math.min(jigPulse * 1.4, 49.5 - barT);
    addHornNote(out, barT, NOTE_FREQS[ch.horn[0]], hornDur, 0.11);
    addHornNote(out, barT, NOTE_FREQS[ch.horn[1]], hornDur, 0.085);

    for (let e = 0; e < 6; e++) {
      const et = barT + e * jigEighth;
      if (et >= 49.42) break;
      if (e === 0 || e === 3) {
        addTaborBeat(out, et, e === 0 ? 0.19 : 0.15, true);
        addLutePluck(out, et, NOTE_FREQS[ch.bass], 0.42, 0.21, 0.68);
      } else if (e === 2 || e === 5) {
        addTaborBeat(out, et, 0.09, true);
        addLutePluck(out, et, NOTE_FREQS[ch.chord[e % 3]], 0.26, 0.14, 0.72);
      } else {
        addLutePluck(out, et, NOTE_FREQS[ch.chord[e % 3]], 0.28, 0.15, 0.72);
      }
    }

    const mNotes = jigMelodyBars[barIdx] || [];
    for (let e = 0; e < mNotes.length; e++) {
      const et = barT + e * jigEighth;
      if (et >= 49.42) break;
      addRecorderNote(out, et, NOTE_FREQS[mNotes[e]], jigEighth * 0.92, 0.17);
    }
  }

  // 49.5 - 54.0s: Softens gracefully into a warm resolving D-major storybook lullaby/lute cadence
  strumChord(49.5, ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5'], 1.8, 0.15, 0.04, 0.56);
  addHornNote(out, 49.5, NOTE_FREQS.D4, 1.4, 0.11);
  addRecorderNote(out, 49.52, NOTE_FREQS.D5, 0.95, 0.14);

  harpArp(50.35, ['G2', 'D3', 'G3', 'B3', 'D4', 'G4'], 0.13, 1.5, 0.13);
  addRecorderNote(out, 50.55, NOTE_FREQS.B4, 0.52, 0.12);
  addRecorderNote(out, 51.1, NOTE_FREQS.A4, 0.52, 0.11);

  harpArp(51.15, ['A2', 'E3', 'A3', 'Cs4', 'E4'], 0.135, 1.35, 0.12);

  // Final warm D-major storybook close chord (51.85 - 53.8s)
  const closeArp = ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'Fs5', 'A5'];
  closeArp.forEach((note, i) => {
    const startT = 51.85 + i * 0.12;
    const noteDur = Math.max(0.5, 53.75 - startT);
    addHarpNote(out, startT, NOTE_FREQS[note], noteDur, 0.145);
    addLutePluck(out, startT, NOTE_FREQS[note], noteDur, 0.085, 0.48);
  });
  addRecorderNote(out, 52.05, NOTE_FREQS.D5, 1.65, 0.11);
  addHornNote(out, 52.05, NOTE_FREQS.D4, 1.65, 0.085);

  // Master envelope shaping:
  // - Smooth 0.25s opening fade-in
  // - Razor-clean 0.45s dramatic silence breath at 37.30 - 37.75s for thorn-pop SFX
  // - Graceful fade-out completing cleanly by 53.8s
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;

    if (t < 0.25) {
      env *= t / 0.25;
    }

    // Dramatic breath around 37.30 - 37.76s
    if (t >= 37.22 && t < 37.3) {
      env *= (37.3 - t) / 0.08;
    } else if (t >= 37.3 && t <= 37.76) {
      env = 0.0;
    } else if (t > 37.76 && t < 37.82) {
      env *= (t - 37.76) / 0.06;
    }

    // Clean fade-out by 53.8s
    if (t >= 52.1 && t < 53.8) {
      const p = (t - 52.1) / 1.7;
      env *= Math.cos(p * Math.PI * 0.5);
    } else if (t >= 53.8) {
      env = 0.0;
    }

    out[i] *= env;
  }

  return out;
}

export const KNIGHT_HICCUPS_BGM = {
  id: 'knight-hiccups-bgm',
  filename: 'knight-hiccups-bgm.wav',
  src: '/audio/knight-hiccups-bgm.wav',
  title: 'Knight & Dragon Hiccups — Dynamic 4-Act Medieval Comedy Score',
  category: 'bgm',
  durationSec: 54.0,
  defaultVolume: 0.52,
  targetPeak: 0.85,
  description:
    'Dynamic 4-section silent-storytelling medieval comedy score: (1) D-major harp opening, royal horn fanfare, messenger lute flurries & 124 BPM heroic march (0–15s); (2) 92 BPM curious D-Dorian pizzicato village mystery (15–25s); (3) 112 BPM quirky staccato bassoon/pizzicato comedy walk with timed hiccup rests at 26.6s/30.0s/34.5s, accelerating tension roll, 0.45s dramatic silence breath at 37.3s for thorn-pop SFX & sparkling relief flourish (25–41s); (4) 136 BPM celebratory tambourine festival jig softening into a warm D-major storybook lullaby cadence (41–54s).',
  themes: [
    'medieval',
    'comedy',
    'knight',
    'dragon',
    'castle',
    'village',
    'mystery',
    'celebration',
    'storybook',
  ],
  generate: () => generateKnightHiccupsBgm(54.0),
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  resetSeed(0x6c1cc001);
  const outPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../public/audio',
    KNIGHT_HICCUPS_BGM.filename
  );
  const samples = KNIGHT_HICCUPS_BGM.generate();
  writeWav(outPath, samples, KNIGHT_HICCUPS_BGM.targetPeak);
  console.log(
    `Generated ${outPath} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`
  );
}

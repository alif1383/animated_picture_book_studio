import {
  NOTE_FREQS,
  SAMPLE_RATE,
  addLutePluck,
  addRecorderNote,
  addTaborBeat,
  whiteNoise,
} from './shared.mjs';

function addWarmBass(out, startSec, freq, durSec, amp = 0.22) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.008 ? t / 0.008 : 1.0;
    const rel = t > durSec - 0.045 ? Math.max(0, (durSec - t) / 0.045) : 1.0;
    const decay = Math.exp(-t * (2.6 / Math.max(0.25, durSec)));
    const w = 2 * Math.PI * freq * t;
    const tone =
      Math.sin(w) * 0.72 +
      Math.sin(2 * w) * 0.22 * Math.exp(-t * 5.0) +
      Math.sin(3 * w) * 0.06 * Math.exp(-t * 10.0);
    out[idx] += tone * attack * rel * decay * amp;
  }
}

function addMarimbaNote(out, startSec, freq, durSec, amp = 0.16) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.003 ? t / 0.003 : 1.0;
    const rel = t > durSec - 0.03 ? Math.max(0, (durSec - t) / 0.03) : 1.0;
    const w = 2 * Math.PI * freq * t;
    const tone =
      Math.sin(w) * Math.exp(-t * 6.2) * 0.76 +
      Math.sin(4 * w) * Math.exp(-t * 32.0) * 0.22;
    out[idx] += tone * attack * rel * amp;
  }
}

function addGlockenspielNote(out, startSec, freq, durSec, amp = 0.12) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = t < 0.0025 ? t / 0.0025 : 1.0;
    const rel = t > durSec - 0.04 ? Math.max(0, (durSec - t) / 0.04) : 1.0;
    const w = 2 * Math.PI * freq * t;
    const bell =
      Math.sin(w) * Math.exp(-t * 5.2) * 0.68 +
      Math.sin(2 * w) * Math.exp(-t * 8.5) * 0.22 +
      Math.sin(3 * w) * Math.exp(-t * 12.5) * 0.09;
    out[idx] += bell * attack * rel * amp;
  }
}

function addShakerAccent(out, startSec, amp = 0.09, bright = false) {
  const durSec = 0.075;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let prev1 = 0;
  let prev2 = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const raw = whiteNoise();
    const hp = raw - 1.3 * prev1 + 0.4 * prev2;
    prev2 = prev1;
    prev1 = raw;

    const env = (t < 0.004 ? t / 0.004 : 1.0) * Math.exp(-t * 48);
    const shimmer = bright
      ? (Math.sin(2 * Math.PI * 4650 * t) * 0.25 +
          Math.sin(2 * Math.PI * 6120 * t) * 0.2) *
        Math.exp(-t * 34)
      : 0;

    out[idx] += (hp * 0.45 + shimmer) * env * amp;
  }
}

function addWhistleNote(out, startSec, freq, durSec, amp = 0.14) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || len <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + len);
  let phase = 0;
  let breathLp = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const attack = 0.018;
    const release = Math.min(0.055, durSec * 0.35);
    let env = 1.0;
    if (t < attack) env = t / attack;
    else if (t > durSec - release) env = Math.max(0, (durSec - t) / release);

    const scoop = 1 - 0.025 * Math.exp(-t * 55);
    const vib = 1 + 0.007 * Math.sin(2 * Math.PI * 6.0 * t);
    phase += (2 * Math.PI * freq * scoop * vib) / SAMPLE_RATE;

    const tone = Math.sin(phase) * 0.85 + Math.sin(2 * phase) * 0.12;
    breathLp = 0.82 * breathLp + 0.18 * whiteNoise();
    const air = breathLp * (0.045 + 0.07 * Math.exp(-t * 38));

    out[idx] += (tone + air) * env * amp;
  }
}

export function generateBandanaDogBgm(dur = 38.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function strumUkulele(time, notes, noteDur, amp = 0.11, spread = 0.02, up = false) {
    const ordered = up ? [...notes].reverse() : notes;
    ordered.forEach((note, i) => {
      addLutePluck(
        out,
        time + i * spread,
        NOTE_FREQS[note],
        noteDur,
        amp,
        up ? 0.72 : 0.64
      );
    });
  }

  // =========================================================================
  // SECTION 1 (0.0s - 15.8s): Morning Backyard — Warm & Welcoming (104 BPM)
  // Sunny C-Major ukulele strums (C - G - Am - F - C - F/G - C/G7), warm
  // bouncy bass, and gentle wooden marimba / toy glockenspiel melody leaving
  // open warm midrange space for the opening voiceovers.
  // =========================================================================
  const s1Beat = 60 / 104; // ~0.5769s (27 beats = 15.577s -> pickup into 15.8s)
  const s1Bars = [
    { startBeat: 0, beats: 4, bass1: 'C3', bass3: 'G2', chord: ['C4', 'E4', 'G4', 'C5'] },
    { startBeat: 4, beats: 4, bass1: 'G2', bass3: 'D3', chord: ['G3', 'B3', 'D4', 'G4'] },
    { startBeat: 8, beats: 4, bass1: 'A2', bass3: 'E2', chord: ['A3', 'C4', 'E4', 'A4'] },
    { startBeat: 12, beats: 4, bass1: 'F2', bass3: 'C3', chord: ['F3', 'A3', 'C4', 'F4'] },
    { startBeat: 16, beats: 4, bass1: 'C3', bass3: 'G2', chord: ['C4', 'E4', 'G4', 'C5'] },
    {
      startBeat: 20,
      beats: 4,
      bass1: 'F2',
      bass3: 'G2',
      chord: ['F3', 'A3', 'C4', 'F4'],
      halfChord: ['G3', 'B3', 'D4', 'G4'],
    },
    {
      startBeat: 24,
      beats: 3,
      bass1: 'C3',
      bass3: 'G2',
      chord: ['C4', 'E4', 'G4', 'C5'],
      halfChord: ['G3', 'B3', 'D4', 'F4'],
    },
  ];

  for (const bar of s1Bars) {
    const t0 = bar.startBeat * s1Beat;
    const c1 = bar.chord;
    const c2 = bar.halfChord ?? bar.chord;

    // Warm bouncy bass (beats 1 & 3)
    addWarmBass(out, t0, NOTE_FREQS[bar.bass1], s1Beat * 1.65, 0.2);
    if (bar.beats >= 3) {
      addWarmBass(
        out,
        t0 + 2 * s1Beat,
        NOTE_FREQS[bar.bass3],
        s1Beat * (bar.beats === 3 ? 0.95 : 1.65),
        0.18
      );
    }

    // Sunny folk ukulele groove: Down(1), Up(2&), Down(3), Up(4&)
    strumUkulele(t0, c1, s1Beat * 1.4, 0.095, 0.022, false);
    strumUkulele(t0 + 1.5 * s1Beat, c1, s1Beat * 0.75, 0.075, 0.016, true);
    if (bar.beats >= 3) {
      strumUkulele(
        t0 + 2.0 * s1Beat,
        c2,
        s1Beat * (bar.beats === 3 ? 0.9 : 1.35),
        0.09,
        0.02,
        false
      );
    }
    if (bar.beats >= 4) {
      strumUkulele(t0 + 3.5 * s1Beat, c2, s1Beat * 0.7, 0.075, 0.015, true);
    }

    // Light brushed backyard pulse
    addShakerAccent(out, t0 + 1.0 * s1Beat, 0.055, false);
    if (bar.beats >= 4) {
      addShakerAccent(out, t0 + 3.0 * s1Beat, 0.055, false);
    }
  }

  // Gentle wooden marimba & toy glockenspiel morning motif (2 warm phrases)
  const s1Melody = [
    // Phrase 1: Bars 0-3 (C - G - Am - F)
    [0.0, 'E5', 0.45, 'm'], [1.0, 'G5', 0.45, 'm'], [2.0, 'C6', 0.65, 'g'], [3.0, 'G5', 0.45, 'm'],
    [4.0, 'D5', 0.45, 'm'], [5.0, 'G5', 0.45, 'm'], [6.0, 'B5', 0.65, 'g'], [7.0, 'G5', 0.45, 'm'],
    [8.0, 'E5', 0.45, 'm'], [9.0, 'A5', 0.45, 'm'], [10.0, 'C6', 0.55, 'g'], [11.0, 'A5', 0.45, 'm'],
    [12.0, 'F5', 0.45, 'm'], [13.0, 'A5', 0.45, 'm'], [14.0, 'G5', 0.5, 'm'], [15.0, 'E5', 0.45, 'm'],
    // Phrase 2: Bars 4-6 (C - F/G - C/G7 excited lift into park chase at 15.8s!)
    [16.0, 'G5', 0.45, 'm'], [17.0, 'E5', 0.45, 'm'], [18.0, 'C5', 0.5, 'm'], [19.0, 'E5', 0.45, 'm'],
    [20.0, 'F5', 0.45, 'm'], [21.0, 'A5', 0.45, 'g'], [22.0, 'G5', 0.45, 'm'], [23.0, 'B5', 0.45, 'g'],
    [24.0, 'C6', 0.5, 'g'], [25.0, 'G5', 0.4, 'm'], [26.0, 'D5', 0.32, 'm'],
    [26.5, 'F5', 0.3, 'm'],
  ];
  for (const [b, note, d, inst] of s1Melody) {
    const t = b * s1Beat;
    if (inst === 'g') {
      addGlockenspielNote(out, t, NOTE_FREQS[note], d, 0.11);
      addMarimbaNote(out, t, NOTE_FREQS[note] * 0.5, d * 0.85, 0.08);
    } else {
      addMarimbaNote(out, t, NOTE_FREQS[note], d, 0.14);
    }
  }
  // Eager 2-note upbeat sparkle pickup launching straight into Section 2 (15.80s)
  addGlockenspielNote(out, 15.48, NOTE_FREQS.G5, 0.22, 0.11);
  addGlockenspielNote(out, 15.64, NOTE_FREQS.B5, 0.18, 0.12);

  // =========================================================================
  // SECTION 2 (15.8s - 27.0s): Sunny Park Fetch Chase — Fast & Energetic (138 BPM)
  // Noticeable energetic shift! Driving tabor drum + bright tambourine/shaker
  // accents on offbeats, bouncy walking bass, choppy ukulele offbeats, and a
  // joyful staccato whistling/recorder + marimba chase melody (G-C-D-G-F-C)!
  // =========================================================================
  const s2Start = 15.8;
  const s2Beat = 60 / 138; // ~0.43478s (25.5 beats = 11.087s -> 26.887s)
  const s2Bars = [
    { startBeat: 0, beats: 4, walk: ['G2', 'B2', 'D3', 'B2'], chord: ['G3', 'B3', 'D4', 'G4'] },
    { startBeat: 4, beats: 4, walk: ['C3', 'E3', 'G3', 'E3'], chord: ['C4', 'E4', 'G4', 'C5'] },
    { startBeat: 8, beats: 4, walk: ['D3', 'Fs3', 'A3', 'Fs3'], chord: ['D4', 'Fs4', 'A4', 'D5'] },
    { startBeat: 12, beats: 4, walk: ['G2', 'B2', 'D3', 'G3'], chord: ['G3', 'B3', 'D4', 'G4'] },
    { startBeat: 16, beats: 4, walk: ['F2', 'A2', 'C3', 'A2'], chord: ['F3', 'A3', 'C4', 'F4'] },
    {
      startBeat: 20,
      beats: 4,
      walk: ['G2', 'B2', 'C3', 'E3'],
      chord: ['G3', 'B3', 'D4', 'G4'],
      halfChord: ['C4', 'E4', 'G4', 'C5'],
    },
  ];

  for (const bar of s2Bars) {
    for (let b = 0; b < bar.beats; b++) {
      const bt = s2Start + (bar.startBeat + b) * s2Beat;
      const bassNote = bar.walk[b % bar.walk.length];
      const activeChord = b >= 2 && bar.halfChord ? bar.halfChord : bar.chord;

      // Playful bouncy walking bass on every beat
      addWarmBass(out, bt, NOTE_FREQS[bassNote], s2Beat * 0.78, 0.24);

      // Driving upbeat tabor drum + tambourine accents on beats 2 & 4
      const isBackbeat = b % 2 === 1;
      addTaborBeat(out, bt, isBackbeat ? 0.16 : 0.19, isBackbeat);

      // Bright tambourine/shaker accents & choppy ukulele strums on offbeats (+0.5 beat)
      if (bt + 0.5 * s2Beat < 26.85) {
        addShakerAccent(out, bt + 0.5 * s2Beat, 0.13, true);
        strumUkulele(
          bt + 0.5 * s2Beat,
          activeChord,
          s2Beat * 0.52,
          0.1,
          0.012,
          true
        );
      }

      // Downbeat ukulele punch on beat 1 (and chord change beat 3 if halfChord)
      if (b === 0 || (b === 2 && bar.halfChord)) {
        strumUkulele(bt, activeChord, s2Beat * 0.8, 0.11, 0.015, false);
      }
    }
  }

  // Triumphant park-catch cadence tag (26.235s - 26.92s) bridging cleanly to 27.0s
  const tagTime = s2Start + 24 * s2Beat; // ~26.235s
  addWarmBass(out, tagTime, NOTE_FREQS.C3, 0.65, 0.22);
  addTaborBeat(out, tagTime, 0.18, true);
  strumUkulele(tagTime, ['C4', 'E4', 'G4', 'C5'], 0.65, 0.11, 0.016, false);

  // Joyful staccato whistling/recorder + marimba chase melody (G - C - D - G - F - G/C)
  const s2Melody = [
    // Bar 0 (G)
    [0.0, 'G5', 0.26], [0.5, 'A5', 0.22], [1.0, 'B5', 0.28], [1.5, 'D6', 0.24],
    [2.0, 'B5', 0.26], [2.5, 'A5', 0.22], [3.0, 'G5', 0.34],
    // Bar 1 (C)
    [4.0, 'C6', 0.28], [4.5, 'B5', 0.22], [5.0, 'A5', 0.26], [5.5, 'G5', 0.24],
    [6.0, 'E5', 0.26], [6.5, 'G5', 0.24], [7.0, 'C6', 0.34],
    // Bar 2 (D)
    [8.0, 'A5', 0.26], [8.5, 'B5', 0.22], [9.0, 'A5', 0.26], [9.5, 'Fs5', 0.24],
    [10.0, 'D5', 0.26], [10.5, 'Fs5', 0.22], [11.0, 'A5', 0.34],
    // Bar 3 (G)
    [12.0, 'B5', 0.26], [12.5, 'D6', 0.24], [13.0, 'B5', 0.26], [13.5, 'G5', 0.22],
    [14.0, 'A5', 0.26], [14.5, 'B5', 0.24], [15.0, 'G5', 0.34],
    // Bar 4 (F)
    [16.0, 'A5', 0.26], [16.5, 'C6', 0.24], [17.0, 'A5', 0.26], [17.5, 'F5', 0.22],
    [18.0, 'G5', 0.26], [18.5, 'A5', 0.24], [19.0, 'F5', 0.32],
    // Bar 5 (G -> C joyful sprint finish)
    [20.0, 'G5', 0.24], [20.5, 'A5', 0.22], [21.0, 'B5', 0.26], [21.5, 'D6', 0.24],
    [22.0, 'C6', 0.26], [22.5, 'A5', 0.22], [23.0, 'G5', 0.26], [23.5, 'E5', 0.22],
    // Tag (beat 24 -> C6 triumphant park catch!)
    [24.0, 'G5', 0.22], [24.65, 'C6', 0.42],
  ];
  for (const [b, note, d] of s2Melody) {
    const t = s2Start + b * s2Beat;
    const freq = NOTE_FREQS[note];
    addWhistleNote(out, t, freq, d, 0.13);
    addRecorderNote(out, t, freq, d * 0.92, 0.085);
    addMarimbaNote(out, t, freq * 0.5, d * 0.9, 0.14);
  }

  // =========================================================================
  // SECTION 3 (27.0s - 38.0s): Golden Afternoon Home & Cozy Closing (92 BPM)
  // Gently slows down to a warm golden-hour lullaby cadence in C Major
  // (Fmaj7 - Em7 - Dm7 - G9sus4/G7 - Cmaj9) with delicate harp-like plucks
  // and a soft resolving final chord fading smoothly to zero by 37.8s.
  // =========================================================================
  const s3Start = 27.0;
  const s3Beat = 60 / 92; // ~0.65217s (swaying golden-hour 3/4 lullaby)
  const s3Chords = [
    {
      t: s3Start,
      bass: 'F2',
      harp: ['F3', 'A3', 'C4', 'E4', 'A4', 'E4'],
      melody: [[0.0, 'A5', 0.95], [1.5, 'G5', 0.85]],
    },
    {
      t: s3Start + 3 * s3Beat,
      bass: 'E2',
      harp: ['E3', 'G3', 'B3', 'D4', 'G4', 'D4'],
      melody: [[0.0, 'G5', 0.95], [1.5, 'E5', 0.85]],
    },
    {
      t: s3Start + 6 * s3Beat,
      bass: 'D2',
      harp: ['D3', 'F3', 'A3', 'C4', 'F4', 'C4'],
      melody: [[0.0, 'F5', 0.95], [1.5, 'D5', 0.85]],
    },
    {
      t: s3Start + 9 * s3Beat,
      bass: 'G2',
      harp: ['G3', 'C4', 'D4', 'F4', 'B4', 'G4'],
      melody: [[0.0, 'E5', 0.95], [1.5, 'D5', 0.9]],
    },
  ];

  for (const ch of s3Chords) {
    addWarmBass(out, ch.t, NOTE_FREQS[ch.bass], s3Beat * 2.85, 0.18);
    for (let i = 0; i < ch.harp.length; i++) {
      addLutePluck(
        out,
        ch.t + i * (s3Beat * 0.5),
        NOTE_FREQS[ch.harp[i]],
        1.6,
        i === 0 ? 0.13 : 0.1,
        0.42
      );
    }
    for (const [offsetBeat, note, d] of ch.melody) {
      const mt = ch.t + offsetBeat * s3Beat;
      addGlockenspielNote(out, mt, NOTE_FREQS[note], d, 0.095);
      addRecorderNote(out, mt, NOTE_FREQS[note] * 0.5, d * 0.95, 0.08);
    }
  }

  // Final resolving Cmaj9 golden-hour cadence (~34.826s -> 37.80s)
  const finalTime = s3Start + 12 * s3Beat; // ~34.826s
  addWarmBass(out, finalTime, NOTE_FREQS.C3, 2.85, 0.17);
  addWarmBass(out, finalTime, NOTE_FREQS.G2, 2.75, 0.11);

  const cmaj9Harp = ['C3', 'G3', 'D4', 'E4', 'G4', 'B4', 'D5', 'E5', 'G5'];
  for (let i = 0; i < cmaj9Harp.length; i++) {
    const pt = finalTime + i * 0.15;
    const remain = Math.max(0.55, 37.75 - pt);
    addLutePluck(out, pt, NOTE_FREQS[cmaj9Harp[i]], remain, 0.115, 0.44);
  }
  addRecorderNote(out, finalTime + 0.15, NOTE_FREQS.E5, 1.0, 0.085);
  addRecorderNote(out, finalTime + 1.15, NOTE_FREQS.C5, 1.75, 0.095);
  addGlockenspielNote(out, finalTime + 1.2, NOTE_FREQS.C6, 1.65, 0.1);

  // Smooth master envelope: gentle fade-in (0.25s) and smooth cosine fade to 0 by 37.8s
  const fadeStart = 35.8;
  const fadeEnd = 37.8;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let masterEnv = 1.0;
    if (t < 0.25) {
      masterEnv = t / 0.25;
    } else if (t >= fadeEnd) {
      masterEnv = 0.0;
    } else if (t > fadeStart) {
      const p = (t - fadeStart) / (fadeEnd - fadeStart);
      masterEnv = 0.5 * (1 + Math.cos(Math.PI * p));
    }
    out[i] *= masterEnv;
  }

  return out;
}

export const BANDANA_DOG_BGM_CLIP = {
  id: 'bandana-dog-bgm',
  filename: 'bandana-dog-bgm.wav',
  src: '/audio/bandana-dog-bgm.wav',
  title: 'Sunny Backyard & Park Fetch Score',
  category: 'bgm',
  durationSec: 38.0,
  defaultVolume: 0.26,
  targetPeak: 0.82,
  description:
    'Dynamic 3-section picture-book soundtrack: (1) Morning Backyard 104 BPM sunny C-major ukulele, bouncy bass & marimba/glockenspiel (0-15.8s), (2) Sunny Park Fetch Chase 138 BPM energetic walking bass, tabor/tambourine offbeats & whistling/recorder melody (15.8-27.0s), (3) Golden Afternoon Home 92 BPM cozy C-major harp lullaby resolving on Cmaj9 fading cleanly by 37.8s (27.0-38.0s).',
  themes: [
    'dog',
    'pet',
    'backyard',
    'park',
    'sunny',
    'playful',
    'fetch',
    'cozy_village',
    'summer',
  ],
  generate: () => generateBandanaDogBgm(38.0),
};

import {
  NOTE_FREQS,
  SAMPLE_RATE,
  addHornNote,
  addLutePluck,
  addRecorderNote,
  addTaborBeat,
} from './shared.mjs';

export function generateMedievalFantasyBgm(dur = 64.0) {
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  function strumChord(time, notes, noteDur, amp = 0.16, spread = 0.035) {
    notes.forEach((note, i) => {
      addLutePluck(out, time + i * spread, NOTE_FREQS[note], noteDur, amp, 0.6);
    });
  }

  // SECTION 1 (0.0s - 12.0s): Bright Morning Castle Fanfare & Lute March
  strumChord(0.2, ['D3', 'A3', 'D4', 'Fs4'], 1.6, 0.16, 0.04);
  addHornNote(out, 0.25, NOTE_FREQS.D4, 0.45, 0.13);
  addHornNote(out, 0.75, NOTE_FREQS.A4, 0.45, 0.14);
  addHornNote(out, 1.25, NOTE_FREQS.D5, 0.9, 0.15);
  strumChord(1.25, ['D3', 'A3', 'Fs4', 'A4', 'D5'], 1.8, 0.15, 0.035);

  addRecorderNote(out, 2.25, NOTE_FREQS.C5, 0.35, 0.15);
  addRecorderNote(out, 2.65, NOTE_FREQS.B4, 0.35, 0.15);
  addRecorderNote(out, 3.05, NOTE_FREQS.A4, 0.55, 0.16);
  strumChord(2.25, ['G3', 'D4', 'G4', 'B4'], 1.4, 0.14, 0.03);

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
        addTaborBeat(
          out,
          ch.t + step * 0.25,
          step === 0 ? 0.16 : 0.1,
          step === 4
        );
      }
    }
  }

  const sec1Melody = [
    [3.6, 'Fs5', 0.45], [4.1, 'E5', 0.45], [4.6, 'D5', 0.45], [5.1, 'A4', 0.45],
    [5.6, 'G5', 0.45],  [6.1, 'E5', 0.45], [6.6, 'C5', 0.9],
    [7.6, 'B4', 0.45],  [8.1, 'C5', 0.45], [8.6, 'D5', 0.45], [9.1, 'B4', 0.45],
    [9.6, 'A4', 0.7],   [10.35, 'Fs4', 0.6], [11.0, 'D5', 0.85],
  ];
  for (const [t, note, d] of sec1Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.16);
  }

  // SECTION 2 (12.0s - 23.0s): Starry Nocturnal Harp & Campfire Lullaby
  const sec2Patterns = [
    { t: 12.0, notes: ['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'D4', 'B3'] },
    { t: 14.8, notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4', 'B3', 'G3'] },
    { t: 17.6, notes: ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'] },
    { t: 20.4, notes: ['D3', 'A3', 'D4', 'Fs4', 'A4', 'Fs4', 'D4', 'A3'] },
  ];
  for (const pat of sec2Patterns) {
    for (let i = 0; i < pat.notes.length; i++) {
      const note = pat.notes[i];
      addLutePluck(
        out,
        pat.t + i * 0.34,
        NOTE_FREQS[note],
        1.4,
        i === 0 ? 0.2 : 0.14,
        0.45
      );
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

  // SECTION 3 (23.0s - 36.0s): Mysterious Dorian Walking Lute (Village & Woods)
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

  // SECTION 4 (36.0s - 50.0s): Playful, Energetic Medieval Adventure Rhythm
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
      addLutePluck(out, bt, NOTE_FREQS[ch.bass], 0.45, 0.2, 0.65);
      const topNote = ch.notes[(beat + 1) % ch.notes.length];
      addLutePluck(out, bt + 0.25, NOTE_FREQS[topNote], 0.4, 0.16, 0.7);
    }
  }
  const sec4Melody = [
    [36.0, 'D5', 0.4], [36.5, 'F5', 0.4], [37.0, 'A5', 0.4], [37.5, 'D5', 0.4],
    [38.0, 'C5', 0.4], [38.5, 'E5', 0.4], [39.0, 'G5', 0.8],
    [40.0, 'F5', 0.4], [40.5, 'D5', 0.4], [41.0, 'Bb4', 0.8],
    [42.0, 'A4', 0.4], [42.5, 'Cs5', 0.4], [43.0, 'E5', 0.8],
    [44.0, 'D5', 0.4], [44.5, 'Fs5', 0.4], [45.0, 'A5', 0.8],
    [46.0, 'B5', 0.4], [46.5, 'G5', 0.4], [47.0, 'D5', 0.8],
    [48.0, 'E5', 0.45], [48.5, 'Fs5', 0.45], [49.0, 'G5', 0.45], [49.5, 'A5', 0.45],
  ];
  for (const [t, note, d] of sec4Melody) {
    addRecorderNote(out, t, NOTE_FREQS[note], d, 0.16);
  }

  // SECTION 5 (50.0s - 64.0s): Joyful Medieval Festival Dance & Finale
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

  const finalArp = ['D3', 'A3', 'D4', 'Fs4', 'A4', 'D5', 'Fs5', 'A5'];
  for (let i = 0; i < finalArp.length; i++) {
    addLutePluck(
      out,
      60.0 + i * 0.14,
      NOTE_FREQS[finalArp[i]],
      3.4 - i * 0.12,
      0.17,
      0.55
    );
  }
  addRecorderNote(out, 60.2, NOTE_FREQS.D5, 2.8, 0.15);
  addHornNote(out, 60.2, NOTE_FREQS.D4, 2.8, 0.11);

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let masterEnv = 1.0;
    if (t < 0.3) masterEnv = t / 0.3;
    else if (t > dur - 2.2) masterEnv = Math.max(0, (dur - t) / 2.2);
    out[i] *= masterEnv;
  }

  return out;
}

export const MEDIEVAL_FANTASY_BGM_CLIP = {
  id: 'medieval-fantasy-bgm',
  filename: 'medieval-fantasy-bgm.wav',
  src: '/audio/medieval-fantasy-bgm.wav',
  title: 'Medieval Fantasy Lute, Recorder & Horn Score',
  category: 'bgm',
  durationSec: 64.0,
  defaultVolume: 0.55,
  targetPeak: 0.85,
  description:
    '5-section medieval fantasy background score featuring Karplus-Strong plucked lute/harp, wooden recorder melody, castle brass fanfare, and soft tabor drum.',
  themes: [
    'medieval',
    'fantasy',
    'castle',
    'knight',
    'dragon',
    'quest',
    'adventure',
    'village',
  ],
  generate: () => generateMedievalFantasyBgm(64.0),
};

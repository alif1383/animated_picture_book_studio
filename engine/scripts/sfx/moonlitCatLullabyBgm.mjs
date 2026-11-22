import { NOTE_FREQS, SAMPLE_RATE, resetSeed } from './shared.mjs';

const NOTES = {
  ...NOTE_FREQS,
  Bb5: 932.33,
  F6: 1396.91,
};

function raisedCosineRamp(t, dur) {
  if (dur <= 0) return 1.0;
  const u = Math.max(0, Math.min(1, t / dur));
  return 0.5 - 0.5 * Math.cos(Math.PI * u);
}

/**
 * Warm music-box celesta tone with delicate bell-like hammer glint and zero-click envelopes.
 */
function addCelestaNote(out, startSec, freq, durSec, amp = 0.15) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.006;
  const releaseSec = Math.min(0.06, durSec * 0.25);
  const decayRate = 2.6 / Math.max(0.35, durSec);

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
      Math.sin(2 * w) * 0.21 * Math.exp(-t * 3.8) +
      Math.sin(3 * w) * 0.07 * Math.exp(-t * 7.2);
    const tineGlint = Math.sin(4.02 * w) * 0.09 * Math.exp(-t * 28.0);

    out[idx] += (body + tineGlint) * env * amp;
  }
}

/**
 * Soft moonlit concert harp pluck with warm progressive harmonic damping.
 */
function addHarpPluck(out, startSec, freq, durSec, amp = 0.12) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.007;
  const releaseSec = Math.min(0.07, durSec * 0.28);
  const baseDecay = 2.3 / Math.max(0.4, durSec);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const w = 2 * Math.PI * freq * t;
    const h1 = Math.sin(w) * 0.68 * Math.exp(-t * baseDecay);
    const h2 = Math.sin(2 * w) * 0.22 * Math.exp(-t * (baseDecay * 1.9));
    const h3 = Math.sin(3 * w) * 0.08 * Math.exp(-t * (baseDecay * 3.2));
    const h4 = Math.sin(4 * w) * 0.03 * Math.exp(-t * (baseDecay * 5.0));

    out[idx] += (h1 + h2 + h3 + h4) * env * amp;
  }
}

/**
 * Subtle warm cello / lullaby string pad bass with gentle bow swell and vibrato.
 */
function addWarmCelloPad(out, startSec, freq, durSec, amp = 0.1) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = Math.min(0.26, durSec * 0.3);
  const releaseSec = Math.min(0.38, durSec * 0.35);
  let phase = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const vibFade = Math.min(1, t / 0.45);
    const instFreq =
      freq * (1 + 0.0032 * vibFade * Math.sin(2 * Math.PI * 4.3 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const tone =
      Math.sin(phase) * 0.64 +
      Math.sin(2 * phase) * 0.25 +
      Math.sin(3 * phase) * 0.08 +
      Math.sin(4 * phase) * 0.03;

    out[idx] += tone * env * amp;
  }
}

/**
 * Sparkling garden wind-chime bell with 2.756x metallic overtone and gentle beating pair.
 */
function addWindChimeBell(out, startSec, freq, durSec, amp = 0.075) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.004;
  const releaseSec = Math.min(0.08, durSec * 0.25);

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const w = 2 * Math.PI * freq * t;
    const fundamental =
      (Math.sin(w) * 0.68 + Math.sin(w * 1.0018) * 0.18) *
      Math.exp(-t * (2.2 / Math.max(0.45, durSec)));
    const bellMode =
      Math.sin(w * 2.756) * 0.24 * Math.exp(-t * (5.4 / Math.max(0.45, durSec)));
    const shimmer = Math.sin(w * 5.404) * 0.05 * Math.exp(-t * 16.0);

    out[idx] += (fundamental + bellMode + shimmer) * env * amp;
  }
}

/**
 * Whisper-quiet summer night cricket shimmer floating softly beneath the garden air.
 */
function addNightCricketShimmer(out, startSec, endSec, amp = 0.01) {
  const startIdx = Math.max(0, Math.floor(startSec * SAMPLE_RATE));
  const endIdx = Math.min(out.length, Math.floor(endSec * SAMPLE_RATE));
  const totalDur = Math.max(0.1, endSec - startSec);

  for (let idx = startIdx; idx < endIdx; idx++) {
    const t = idx / SAMPLE_RATE;
    const localT = t - startSec;
    let bedEnv = 1.0;
    if (localT < 1.2) bedEnv *= raisedCosineRamp(localT, 1.2);
    if (localT > totalDur - 1.5) {
      bedEnv *= raisedCosineRamp(totalDur - localT, 1.5);
    }

    // Gentle distant summer chirp pulses every 1.65s
    const cycle = localT % 1.65;
    let pulse = 0;
    if (cycle < 0.36) {
      pulse = Math.sin((cycle / 0.36) * Math.PI);
    } else if (cycle > 0.44 && cycle < 0.72) {
      pulse = Math.sin(((cycle - 0.44) / 0.28) * Math.PI) * 0.72;
    }

    const trill = 0.55 + 0.45 * Math.sin(2 * Math.PI * 24.0 * t);
    const carrier =
      Math.sin(2 * Math.PI * 4240 * t) * 0.65 +
      Math.sin(2 * Math.PI * 4410 * t) * 0.35;

    out[idx] += carrier * trill * pulse * bedEnv * amp;
  }
}

export function generateMoonlitCatLullabyBgm(dur = 30.0) {
  resetSeed(0x4d004c17);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // Subtle summer night cricket shimmer from cover twilight until bedtime hush
  addNightCricketShimmer(out, 0.8, Math.min(28.5, dur - 1.2), 0.009);

  // =========================================================================
  // SECTION 1 (0.0s - 3.5s): Cover Opening
  // Delicate sparse celesta/music-box intro rising softly like moonlight
  // =========================================================================
  addWarmCelloPad(out, 0.25, NOTES.F2, 3.35, 0.075);
  addWarmCelloPad(out, 0.45, NOTES.C3, 3.15, 0.05);

  const sec1Intro = [
    [0.25, 'F4', 1.3, 0.11],
    [0.72, 'A4', 1.3, 0.12],
    [1.18, 'C5', 1.35, 0.13],
    [1.68, 'E5', 1.35, 0.135],
    [2.16, 'F5', 1.25, 0.14],
    [2.72, 'D5', 0.85, 0.115],
    [3.12, 'C5', 0.75, 0.11],
  ];
  for (const [t, note, d, a] of sec1Intro) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  addHarpPluck(out, 0.35, NOTES.F3, 2.2, 0.085);
  addHarpPluck(out, 1.55, NOTES.C4, 1.9, 0.08);
  addHarpPluck(out, 2.65, NOTES.A4, 1.4, 0.075);
  addWindChimeBell(out, 1.75, NOTES.C6, 1.5, 0.045);
  addWindChimeBell(out, 2.9, NOTES.F6, 1.3, 0.038);

  // =========================================================================
  // SECTION 2 (3.5s - 11.2s): Act I - Garden Exploration
  // Gentle curious tiptoeing harp arpeggios + tender 3/4 lullaby melody
  // =========================================================================
  const sec2Bars = [
    { t: 3.5, bass: 'F2', pad: 'C3', arp: ['F3', 'C4', 'A4', 'C4', 'E4', 'A4'] },
    { t: 4.94, bass: 'D2', pad: 'A2', arp: ['D3', 'A3', 'F4', 'A4', 'E4', 'F4'] },
    { t: 6.38, bass: 'Bb2', pad: 'F3', arp: ['Bb2', 'F3', 'D4', 'F4', 'A4', 'D4'] },
    { t: 7.82, bass: 'C3', pad: 'G3', arp: ['C3', 'G3', 'Bb3', 'D4', 'E4', 'G4'] },
    { t: 9.26, bass: 'F2', pad: 'C3', arp: ['F3', 'C4', 'A4', 'C5', 'A4', 'F4'] },
  ];
  for (const bar of sec2Bars) {
    addWarmCelloPad(out, bar.t, NOTES[bar.bass], 1.55, 0.09);
    addWarmCelloPad(out, bar.t + 0.06, NOTES[bar.pad], 1.45, 0.052);
    for (let i = 0; i < bar.arp.length; i++) {
      addHarpPluck(
        out,
        bar.t + i * 0.24,
        NOTES[bar.arp[i]],
        1.15,
        i === 0 ? 0.125 : 0.095
      );
    }
  }
  const sec2Melody = [
    [3.5, 'A4', 1.05, 0.145],
    [4.46, 'C5', 0.65, 0.14],
    [4.94, 'D5', 0.85, 0.15],
    [5.66, 'C5', 0.45, 0.13],
    [5.9, 'A4', 0.65, 0.14],
    [6.38, 'Bb4', 0.65, 0.14],
    [6.86, 'D5', 0.65, 0.145],
    [7.34, 'F5', 0.72, 0.155],
    [7.82, 'E5', 0.82, 0.15],
    [8.54, 'D5', 0.42, 0.135],
    [8.78, 'C5', 0.68, 0.14],
    [9.26, 'A4', 0.85, 0.145],
    [9.98, 'G4', 0.45, 0.13],
    [10.22, 'F4', 0.62, 0.135],
    // Playful tiptoe pickup into Act II
    [10.7, 'A4', 0.42, 0.13],
    [10.95, 'C5', 0.42, 0.14],
  ];
  for (const [t, note, d, a] of sec2Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }

  // =========================================================================
  // SECTION 3 (11.2s - 18.2s): Act II - Wind-Chime Arbor
  // Livelier sparkling wind-chime bell harmonics + dancing music-box counter-melody
  // =========================================================================
  const sec3Bars = [
    { t: 11.2, bass: 'D2', arp: ['D3', 'A3', 'F4', 'A4', 'C5', 'A4'] },
    { t: 12.505, bass: 'Bb2', arp: ['Bb2', 'F3', 'D4', 'A4', 'D5', 'A4'] },
    { t: 13.81, bass: 'F2', arp: ['F3', 'C4', 'A4', 'C5', 'E5', 'C5'] },
    { t: 15.115, bass: 'C3', arp: ['C3', 'G3', 'E4', 'G4', 'D5', 'G4'] },
    { t: 16.42, bass: 'G2', arp: ['G2', 'D3', 'Bb3', 'F4', 'A4', 'G4'] },
  ];
  for (const bar of sec3Bars) {
    addWarmCelloPad(out, bar.t, NOTES[bar.bass], 1.38, 0.088);
    for (let i = 0; i < bar.arp.length; i++) {
      addHarpPluck(
        out,
        bar.t + i * 0.2175,
        NOTES[bar.arp[i]],
        0.95,
        i % 3 === 0 ? 0.125 : 0.092
      );
    }
  }
  const sec3Melody = [
    [11.2, 'F5', 0.48, 0.15],
    [11.635, 'E5', 0.35, 0.14],
    [11.852, 'D5', 0.45, 0.145],
    [12.07, 'C5', 0.55, 0.14],
    [12.505, 'D5', 0.48, 0.15],
    [12.94, 'F5', 0.48, 0.155],
    [13.375, 'A5', 0.55, 0.155],
    [13.81, 'G5', 0.42, 0.15],
    [14.027, 'F5', 0.42, 0.145],
    [14.245, 'E5', 0.42, 0.14],
    [14.462, 'D5', 0.42, 0.14],
    [14.68, 'C5', 0.55, 0.145],
    [15.115, 'G5', 0.52, 0.15],
    [15.55, 'E5', 0.45, 0.14],
    [15.985, 'C5', 0.45, 0.135],
    [16.202, 'D5', 0.45, 0.14],
    [16.42, 'D5', 0.48, 0.145],
    [16.855, 'F5', 0.48, 0.15],
    [17.29, 'G5', 0.52, 0.15],
    [17.725, 'E5', 0.65, 0.14],
  ];
  for (const [t, note, d, a] of sec3Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Dancing wind-chime bell cascades shimmering through the arbor
  const sec3Chimes = [
    [11.32, 'A5', 1.15, 0.068],
    [11.42, 'C6', 1.15, 0.064],
    [11.53, 'D6', 1.2, 0.06],
    [11.66, 'F6', 1.25, 0.052],

    [12.72, 'F6', 1.1, 0.055],
    [12.83, 'D6', 1.1, 0.06],
    [12.95, 'C6', 1.15, 0.062],

    [13.95, 'C6', 1.1, 0.065],
    [14.08, 'A5', 1.1, 0.062],
    [14.22, 'G5', 1.05, 0.058],

    [15.25, 'E6', 1.1, 0.055],
    [15.36, 'C6', 1.1, 0.062],
    [15.48, 'G5', 1.1, 0.058],
    [15.61, 'A5', 1.15, 0.06],

    // Shimmering cascade bridge into Act III Moon-Fountain Clearing
    [17.45, 'G5', 1.1, 0.056],
    [17.56, 'A5', 1.15, 0.06],
    [17.68, 'C6', 1.2, 0.062],
    [17.81, 'D6', 1.25, 0.058],
    [17.95, 'F6', 1.35, 0.05],
  ];
  for (const [t, note, d, a] of sec3Chimes) {
    addWindChimeBell(out, t, NOTES[note], d, a);
  }

  // =========================================================================
  // SECTION 4 (18.2s - 24.8s): Act III - Moon-Fountain Clearing
  // Lush floating harp ripples & warm sustained lullaby harmony
  // =========================================================================
  const sec4Bars = [
    {
      t: 18.2,
      bass: 'F2',
      pad: 'C3',
      pad2: 'A3',
      ripple: ['F3', 'C4', 'G4', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5'],
    },
    {
      t: 19.82,
      bass: 'D2',
      pad: 'A2',
      pad2: 'F3',
      ripple: ['D3', 'A3', 'E4', 'F4', 'A4', 'C5', 'E5', 'C5', 'A4'],
    },
    {
      t: 21.44,
      bass: 'Bb2',
      pad: 'F3',
      pad2: 'D4',
      ripple: ['Bb2', 'F3', 'C4', 'D4', 'F4', 'A4', 'C5', 'A4', 'F4'],
    },
    {
      t: 23.06,
      bass: 'G2',
      pad: 'C3',
      pad2: 'G3',
      ripple: ['G2', 'D3', 'A3', 'Bb3', 'D4', 'F4', 'G4', 'E4', 'C4'],
    },
  ];
  for (const bar of sec4Bars) {
    addWarmCelloPad(out, bar.t, NOTES[bar.bass], 1.78, 0.105);
    addWarmCelloPad(out, bar.t + 0.05, NOTES[bar.pad], 1.72, 0.068);
    addWarmCelloPad(out, bar.t + 0.12, NOTES[bar.pad2], 1.65, 0.045);
    for (let i = 0; i < bar.ripple.length; i++) {
      addHarpPluck(
        out,
        bar.t + i * 0.18,
        NOTES[bar.ripple[i]],
        1.45,
        i === 0 ? 0.115 : 0.088
      );
    }
  }
  const sec4Melody = [
    [18.2, 'A5', 1.25, 0.135],
    [19.28, 'G5', 0.85, 0.13],
    [19.82, 'F5', 1.25, 0.14],
    [20.9, 'E5', 0.85, 0.13],
    [21.44, 'D5', 1.0, 0.14],
    [22.25, 'F5', 0.55, 0.13],
    [22.52, 'A5', 0.85, 0.135],
    [23.06, 'G5', 1.05, 0.135],
    [23.87, 'E5', 1.05, 0.125],
  ];
  for (const [t, note, d, a] of sec4Melody) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  // Delicate moonlit water-droplet chime glints
  addWindChimeBell(out, 18.74, NOTES.E6, 1.4, 0.036);
  addWindChimeBell(out, 20.36, NOTES.C6, 1.4, 0.038);
  addWindChimeBell(out, 21.98, NOTES.D6, 1.4, 0.036);
  addWindChimeBell(out, 23.6, NOTES.C6, 1.45, 0.034);

  // =========================================================================
  // SECTION 5 (24.8s - 30.0s): Act IV - Bedtime Curl-Up & Book Close
  // Gentle ritardando, warm sleepy cradle notes resolving on sustained Fmaj7
  // =========================================================================
  addWarmCelloPad(out, 24.8, NOTES.F2, 2.7, 0.095);
  addWarmCelloPad(out, 24.88, NOTES.C3, 2.6, 0.058);
  addWarmCelloPad(out, 26.02, NOTES.Bb2, 1.55, 0.068);

  // Progressive ritardando cradle phrase (0.58s -> 0.64s -> 0.74s -> 0.84s)
  addHarpPluck(out, 24.8, NOTES.F3, 1.6, 0.105);
  addHarpPluck(out, 24.96, NOTES.C4, 1.5, 0.088);
  addHarpPluck(out, 25.12, NOTES.A4, 1.45, 0.082);
  addCelestaNote(out, 24.8, NOTES.A4, 1.1, 0.135);

  addHarpPluck(out, 25.38, NOTES.E4, 1.35, 0.075);
  addCelestaNote(out, 25.38, NOTES.G4, 1.05, 0.125);

  addHarpPluck(out, 26.02, NOTES.D4, 1.45, 0.082);
  addHarpPluck(out, 26.22, NOTES.A4, 1.4, 0.075);
  addCelestaNote(out, 26.02, NOTES.F4, 1.15, 0.125);

  addHarpPluck(out, 26.76, NOTES.C4, 1.35, 0.072);
  addHarpPluck(out, 26.96, NOTES.E4, 1.3, 0.068);
  addCelestaNote(out, 26.76, NOTES.G4, 1.15, 0.115);
  addWindChimeBell(out, 26.86, NOTES.C6, 1.55, 0.032);

  // Final sustained Fmaj7 music-box & harp cradle chord resolving before 29.7s
  addWarmCelloPad(out, 27.55, NOTES.F2, 2.1, 0.09);
  addWarmCelloPad(out, 27.62, NOTES.C3, 2.02, 0.055);
  addWarmCelloPad(out, 27.7, NOTES.A3, 1.92, 0.038);

  const finalHarp = [
    [27.6, 'F3', 2.05, 0.105],
    [27.72, 'C4', 1.93, 0.09],
    [27.85, 'E4', 1.8, 0.082],
    [27.99, 'A4', 1.66, 0.08],
    [28.14, 'C5', 1.51, 0.075],
  ];
  for (const [t, note, d, a] of finalHarp) {
    addHarpPluck(out, t, NOTES[note], d, a);
  }

  const finalCelesta = [
    [27.62, 'F4', 2.02, 0.115],
    [27.8, 'A4', 1.84, 0.11],
    [28.0, 'C5', 1.65, 0.108],
    [28.22, 'E5', 1.44, 0.1],
    [28.46, 'F5', 1.22, 0.105],
  ];
  for (const [t, note, d, a] of finalCelesta) {
    addCelestaNote(out, t, NOTES[note], d, a);
  }
  addWindChimeBell(out, 28.5, NOTES.C6, 1.18, 0.028);

  // Master smooth fade-in (0.0-0.25s) and bedtime fade-out to silence by 29.7s
  const fadeOutStart = Math.max(0, dur - 1.9);
  const silenceAt = Math.max(fadeOutStart + 0.1, dur - 0.3);
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
    out[i] *= masterEnv;
  }

  return out;
}

export const MOONLIT_CAT_LULLABY_BGM_CLIP = {
  id: 'moonlit-cat-lullaby-bgm',
  filename: 'moonlit-cat-lullaby-bgm.wav',
  src: '/audio/moonlit-cat-lullaby-bgm.wav',
  title: 'Moonlit Garden Lullaby Waltz',
  category: 'bgm',
  durationSec: 30.0,
  defaultVolume: 0.28,
  targetPeak: 0.82,
  description:
    '5-section 30.0s F-major / D-minor 3/4 storybook lullaby score featuring warm music-box celesta, soft concert harp arpeggios, gentle cello pad bass, sparkling wind-chime bells, and whisper-quiet night crickets: (1) Cover Opening (0.0-3.5s), (2) Act I Garden Exploration (3.5-11.2s), (3) Act II Wind-Chime Arbor (11.2-18.2s), (4) Act III Moon-Fountain Clearing (18.2-24.8s), (5) Act IV Bedtime Curl-Up ritardando & Fmaj7 resolution (24.8-30.0s).',
  themes: [
    'bedtime',
    'lullaby',
    'cat',
    'garden',
    'moonlit',
    'night',
    'magic',
    'dreamy',
  ],
  generate: () => generateMoonlitCatLullabyBgm(30.0),
};
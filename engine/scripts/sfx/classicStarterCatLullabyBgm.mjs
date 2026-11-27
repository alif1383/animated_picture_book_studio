import {
  NOTE_FREQS,
  SAMPLE_RATE,
  resetSeed,
  whiteNoise,
} from './shared.mjs';

const NOTES = {
  ...NOTE_FREQS,
  C2: 65.41,
  B6: 1975.53,
};

function raisedCosineRamp(t, dur) {
  if (dur <= 0) return 1.0;
  const u = Math.max(0, Math.min(1, t / dur));
  return 0.5 - 0.5 * Math.cos(Math.PI * u);
}

/**
 * Pastoral solo wooden flute:
 * Breathy chiff onset, warm fundamental/2nd/3rd harmonics, and expressive 5.0 Hz vibrato.
 */
function addPastoralFlute(out, startSec, freq, durSec, amp = 0.135) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = Math.min(0.085, durSec * 0.28);
  const releaseSec = Math.min(0.14, durSec * 0.32);

  let phase = 0;
  let lp1 = 0;
  let lp2 = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) {
      env *= raisedCosineRamp(t, attackSec);
    }
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    // Gentle phrase swell & subtle expressive 5.0 Hz vibrato blooming after onset
    const vibFade = t > 0.12 ? Math.min(1.0, (t - 0.12) / 0.22) : 0.0;
    const pitchScoop = 1.0 - 0.008 * Math.exp(-t * 34.0);
    const instFreq =
      freq *
      pitchScoop *
      (1.0 + 0.0046 * vibFade * Math.sin(2 * Math.PI * 5.0 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const h2Weight = 0.21 + 0.04 * Math.sin(2 * Math.PI * 2.2 * t);
    const tone =
      Math.sin(phase) * 0.72 +
      Math.sin(2 * phase) * h2Weight +
      Math.sin(3 * phase) * 0.065;

    // Two-stage lowpass filtered wooden chiff & soft breath air (zero harsh hiss)
    const raw = whiteNoise();
    lp1 = 0.82 * lp1 + 0.18 * raw;
    lp2 = 0.78 * lp2 + 0.22 * lp1;
    const chiffEnv = Math.exp(-t * 24.0);
    const breath = lp2 * (0.032 + 0.115 * chiffEnv);

    out[idx] += (tone + breath) * env * amp;
  }
}

/**
 * Tiptoeing pizzicato strings:
 * Woody resonant string pluck for Clover's curious garden stroll.
 */
function addPizzicatoPluck(out, startSec, freq, durSec = 0.28, amp = 0.125) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.004;
  const releaseSec = Math.min(0.03, durSec * 0.25);
  let phase = 0;
  let woodLp = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    // Brief pluck tension pitch bend settling immediately to true pitch
    const instFreq = freq * (1.0 + 0.014 * Math.exp(-t * 58.0));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const bodyDecay = Math.exp(-t * 9.8);
    const body =
      Math.sin(phase) * 0.67 * bodyDecay +
      Math.sin(2 * phase) * 0.23 * Math.exp(-t * 15.5) +
      Math.sin(3 * phase) * 0.08 * Math.exp(-t * 25.0) +
      Math.sin(4 * phase) * 0.025 * Math.exp(-t * 36.0);

    // Subtle warm woody finger-pluck transient
    woodLp = 0.76 * woodLp + 0.24 * whiteNoise();
    const fingerPluck = woodLp * Math.exp(-t * 135.0) * 0.095;

    out[idx] += (body + fingerPluck) * env * amp;
  }
}

/**
 * Single muted orchestral string ensemble voice (con sordino 1970s animated film strings).
 */
function addMutedStringVoice(
  out,
  startSec,
  freq,
  durSec,
  amp = 0.055,
  attackSec = 0.34,
  releaseSec = 0.44
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const atk = Math.min(attackSec, durSec * 0.42);
  const rel = Math.min(releaseSec, durSec * 0.44);

  let phaseA = 0;
  let phaseB = 0;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < atk) env *= raisedCosineRamp(t, atk);
    if (t > durSec - rel) env *= raisedCosineRamp(durSec - t, rel);

    const vibFade = Math.min(1.0, t / 0.45);
    const vibA = 1.0 + 0.0028 * vibFade * Math.sin(2 * Math.PI * 4.5 * t);
    const vibB =
      1.0 + 0.0026 * vibFade * Math.sin(2 * Math.PI * 4.8 * t + 1.4);

    phaseA += (2 * Math.PI * freq * 0.9987 * vibA) / SAMPLE_RATE;
    phaseB += (2 * Math.PI * freq * 1.0013 * vibB) / SAMPLE_RATE;

    const voiceA =
      Math.sin(phaseA) * 0.64 +
      Math.sin(2 * phaseA) * 0.23 +
      Math.sin(3 * phaseA) * 0.08 +
      Math.sin(4 * phaseA) * 0.025;
    const voiceB =
      Math.sin(phaseB) * 0.64 +
      Math.sin(2 * phaseB) * 0.23 +
      Math.sin(3 * phaseB) * 0.08 +
      Math.sin(4 * phaseB) * 0.025;

    out[idx] += 0.5 * (voiceA + voiceB) * env * amp;
  }
}

/**
 * Lush muted orchestral string pad chord (Gmaj9, Em9, Cmaj7, D6) with staggered warm bow swells.
 */
function addMutedStringPad(
  out,
  startSec,
  noteNames,
  durSec,
  amp = 0.068,
  attackSec = 0.36,
  releaseSec = 0.46
) {
  if (!noteNames || noteNames.length === 0) return;
  const perVoiceBase = amp / Math.sqrt(noteNames.length);
  for (let i = 0; i < noteNames.length; i++) {
    const note = noteNames[i];
    const freq = NOTES[note];
    if (!freq) continue;
    // Slight weighting: fuller warm bass/inner voices, gossamer upper extensions
    const weight = i === 0 ? 1.15 : i === 1 ? 0.96 : i >= 3 ? 0.72 : 0.84;
    const stagger = i * 0.032;
    const voiceDur = Math.max(0.25, durSec - stagger * 0.5);
    addMutedStringVoice(
      out,
      startSec + stagger,
      freq,
      voiceDur,
      perVoiceBase * weight,
      attackSec,
      releaseSec
    );
  }
}

/**
 * Silver glockenspiel / wind-chime harp sparkle:
 * Blends warm concert harp resonance with crystalline silver glockenspiel bell partials.
 * Use bellMix ~0.20 for flowing barcarolle harp ripples, ~0.60-0.75 for sparkling chime blooms.
 */
function addSilverBellHarp(
  out,
  startSec,
  freq,
  durSec,
  amp = 0.105,
  bellMix = 0.42
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  const attackSec = 0.005;
  const releaseSec = Math.min(0.075, durSec * 0.28);
  const harpDecay = 2.15 / Math.max(0.38, durSec);
  const bellDecay = 2.45 / Math.max(0.4, durSec);
  const harpWeight = 1.0 - bellMix * 0.45;

  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    let env = 1.0;
    if (t < attackSec) env *= raisedCosineRamp(t, attackSec);
    if (t > durSec - releaseSec) {
      env *= raisedCosineRamp(durSec - t, releaseSec);
    }

    const w = 2 * Math.PI * freq * t;

    const harp =
      Math.sin(w) * 0.68 * Math.exp(-t * harpDecay) +
      Math.sin(2 * w) * 0.22 * Math.exp(-t * harpDecay * 1.85) +
      Math.sin(3 * w) * 0.08 * Math.exp(-t * harpDecay * 3.1) +
      Math.sin(4 * w) * 0.025 * Math.exp(-t * harpDecay * 4.8);

    const bell =
      (Math.sin(w) * 0.62 + Math.sin(w * 1.0016) * 0.16) *
        Math.exp(-t * bellDecay) +
      Math.sin(w * 2.756) * 0.21 * Math.exp(-t * bellDecay * 2.5) +
      Math.sin(w * 4.015) * 0.075 * Math.exp(-t * 22.0);

    out[idx] += (harp * harpWeight + bell * bellMix) * env * amp;
  }
}

/**
 * Whisper-quiet warm night breeze rustle floating beneath the garden canopy.
 * Smooth multi-pole lowpass/bandpass filtered air with gentle organic swells and zero harsh static.
 */
function addNightBreezeRustle(out, startSec, endSec, amp = 0.0085) {
  const startIdx = Math.max(0, Math.floor(startSec * SAMPLE_RATE));
  const endIdx = Math.min(out.length, Math.floor(endSec * SAMPLE_RATE));
  const totalDur = Math.max(0.2, endSec - startSec);

  let lp1 = 0;
  let lp2 = 0;
  let lp3 = 0;
  let dcBlock = 0;

  for (let idx = startIdx; idx < endIdx; idx++) {
    const t = idx / SAMPLE_RATE;
    const localT = t - startSec;
    let bedEnv = 1.0;
    if (localT < 1.35) bedEnv *= raisedCosineRamp(localT, 1.35);
    if (localT > totalDur - 1.6) {
      bedEnv *= raisedCosineRamp(totalDur - localT, 1.6);
    }

    // Slow gentle garden-canopy breeze swells
    const swell =
      0.56 +
      0.28 * Math.sin(2 * Math.PI * 0.13 * localT - 0.5) +
      0.16 * Math.sin(2 * Math.PI * 0.23 * localT + 1.1);

    const n = whiteNoise();
    // Soft three-pole lowpass (~340-520 Hz warm air) with DC removal
    const alpha = 0.048 + 0.018 * swell;
    lp1 += alpha * (n - lp1);
    lp2 += alpha * (lp1 - lp2);
    lp3 += alpha * (lp2 - lp3);
    dcBlock += 0.0035 * (lp3 - dcBlock);
    const softAir = lp3 - dcBlock;

    out[idx] += softAir * swell * bedEnv * amp * 4.2;
  }
}

export function generateClassicStarterCatLullabyBgm(dur = 30.0) {
  resetSeed(0x6c4a7c01);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float64Array(n);

  // Whisper-quiet warm night garden breeze underneath the entire moonlit story
  addNightBreezeRustle(out, 0.35, Math.min(28.8, dur - 1.1), 0.0085);

  // =========================================================================
  // SECTION 1 (0.0s - 3.2s): Theatrical Iris Opening
  // Shimmering G-major harp bloom + warm pastoral wooden flute welcome phrase
  // =========================================================================
  addMutedStringPad(
    out,
    0.16,
    ['G2', 'D3', 'A3', 'B3', 'Fs4'],
    3.12,
    0.078,
    0.42,
    0.48
  );

  // Shimmering ascending Gmaj9 silver-harp bloom
  const openingHarp = [
    [0.16, 'G3', 2.2, 0.095, 0.22],
    [0.32, 'B3', 2.05, 0.09, 0.26],
    [0.48, 'D4', 1.95, 0.09, 0.3],
    [0.64, 'Fs4', 1.85, 0.088, 0.36],
    [0.8, 'A4', 1.75, 0.085, 0.42],
    [0.96, 'B4', 1.65, 0.082, 0.48],
    [1.14, 'D5', 1.55, 0.08, 0.56],
    [1.34, 'G5', 1.45, 0.075, 0.64],
  ];
  for (const [t, note, d, a, mix] of openingHarp) {
    addSilverBellHarp(out, t, NOTES[note], d, a, mix);
  }
  // Delicate moonlight glint chimes
  addSilverBellHarp(out, 1.56, NOTES.D6, 1.4, 0.042, 0.78);
  addSilverBellHarp(out, 2.58, NOTES.G6, 1.25, 0.032, 0.8);

  // Warm pastoral flute welcome phrase in swaying 6/8 barcarolle
  const openingFlute = [
    [1.02, 'D5', 0.46, 0.115],
    [1.46, 'G5', 0.68, 0.13],
    [2.1, 'Fs5', 0.34, 0.118],
    [2.42, 'E5', 0.34, 0.115],
    [2.74, 'D5', 0.44, 0.112],
  ];
  for (const [t, note, d, a] of openingFlute) {
    addPastoralFlute(out, t, NOTES[note], d, a);
  }

  // =========================================================================
  // SECTION 2 (3.2s - 11.8s): Act I - Lantern Terrace & Firefly Jar
  // Curious tiptoeing pizzicato strings + delicate flute motifs (gentle under dialogue)
  // Sparkling silver bell-harp bloom around 8.2s when fireflies swirl free!
  // 6/8 barcarolle: eighth = 0.238s, bar = 1.428s (6 bars: 3.20s -> 11.77s)
  // =========================================================================
  const act1Eighth = 0.238;
  const act1Bars = [
    {
      t: 3.2,
      pad: ['G2', 'D3', 'A3', 'B3'],
      pizz: ['G2', 'D3', 'B3', 'A3', 'D3', 'B3'],
      harp: ['G3', 'B3', 'D4', 'A4', 'D4', 'B3'],
    },
    {
      t: 3.2 + act1Eighth * 6,
      pad: ['E2', 'B2', 'Fs3', 'G3'],
      pizz: ['E2', 'B2', 'G3', 'Fs3', 'B2', 'G3'],
      harp: ['E3', 'G3', 'B3', 'Fs4', 'B3', 'G3'],
    },
    {
      t: 3.2 + act1Eighth * 12,
      pad: ['C3', 'G3', 'B3', 'E4'],
      pizz: ['C3', 'G3', 'E4', 'B3', 'G3', 'E3'],
      harp: ['C3', 'G3', 'B3', 'E4', 'B3', 'G3'],
    },
    {
      t: 3.2 + act1Eighth * 18, // 7.484s -> Firefly swirl bloom hits right at 8.20s!
      pad: ['D2', 'A2', 'B3', 'Fs4'],
      pizz: ['D2', 'A2', 'Fs3', 'B3', 'A2', 'D3'],
      harp: ['D3', 'A3', 'B3', 'Fs4', 'A4', 'Fs4'],
    },
    {
      t: 3.2 + act1Eighth * 24, // 8.912s
      pad: ['G2', 'D3', 'A3', 'B3'],
      pizz: ['G2', 'D3', 'B3', 'G3', 'D3', 'A3'],
      harp: ['G3', 'D4', 'A4', 'B4', 'A4', 'D4'],
    },
    {
      t: 3.2 + act1Eighth * 30, // 10.340s
      pad: ['E2', 'B2', 'D3', 'A3'],
      pizz: ['E2', 'B2', 'G3', 'D2', 'A2', 'Fs3'],
      harp: ['E3', 'B3', 'G4', 'D3', 'A3', 'Fs4'],
    },
  ];

  for (let b = 0; b < act1Bars.length; b++) {
    const bar = act1Bars[b];
    // Soft muted string pad cushion kept light so narration & Clover's voice stay clear
    addMutedStringPad(out, bar.t, bar.pad, act1Eighth * 6.3, 0.052, 0.28, 0.34);

    for (let i = 0; i < 6; i++) {
      const st = bar.t + i * act1Eighth;
      // Curious tiptoeing pizzicato on 6/8 barcarolle beats (accenting 1 and 4)
      const pizzAmp = i === 0 ? 0.118 : i === 3 ? 0.102 : 0.078;
      addPizzicatoPluck(out, st, NOTES[bar.pizz[i]], 0.26, pizzAmp);

      // Gentle barcarolle harp pulse on 1, 3, 4, 6
      if (i === 0 || i === 2 || i === 3 || i === 5) {
        addSilverBellHarp(
          out,
          st,
          NOTES[bar.harp[i]],
          0.95,
          i === 0 ? 0.078 : 0.056,
          0.24
        );
      }
    }
  }

  // Delicate pastoral flute motifs weaving around Clover's terrace curiosity
  const act1Flute = [
    // Phrase A (3.20s - 5.65s)
    [3.2, 'B4', 0.44, 0.11],
    [3.68, 'D5', 0.26, 0.105],
    [3.92, 'E5', 0.46, 0.112],
    [4.4, 'D5', 0.28, 0.1],
    [4.63, 'B4', 0.66, 0.112],
    [5.35, 'A4', 0.42, 0.098],
    // Phrase B (6.06s - 7.95s)
    [6.06, 'G4', 0.44, 0.105],
    [6.54, 'B4', 0.28, 0.105],
    [6.78, 'E5', 0.48, 0.115],
    [7.26, 'D5', 0.28, 0.105],
    [7.48, 'A4', 0.56, 0.108],
    // Firefly swirl joyful lift around 8.2s -> 10.1s
    [8.2, 'D5', 0.34, 0.115],
    [8.52, 'Fs5', 0.38, 0.122],
    [8.91, 'G5', 0.66, 0.128],
    [9.62, 'Fs5', 0.28, 0.112],
    [9.88, 'E5', 0.42, 0.11],
    // Curious tiptoe pickup into Act II arbor (10.58s - 11.72s)
    [10.58, 'B4', 0.38, 0.102],
    [11.06, 'D5', 0.36, 0.106],
    [11.46, 'E5', 0.32, 0.11],
  ];
  for (const [t, note, d, a] of act1Flute) {
    addPastoralFlute(out, t, NOTES[note], d, a);
  }

  // Sparkling silver bell-harp bloom right at 8.2s when fireflies swirl free!
  const fireflyBloom = [
    [8.18, 'D5', 1.15, 0.072, 0.68],
    [8.27, 'Fs5', 1.18, 0.074, 0.72],
    [8.36, 'A5', 1.22, 0.076, 0.74],
    [8.46, 'B5', 1.26, 0.072, 0.76],
    [8.57, 'D6', 1.32, 0.068, 0.78],
    [8.69, 'Fs6', 1.38, 0.056, 0.8],
    [8.82, 'G6', 1.45, 0.048, 0.82],
    // Gentle fluttering afterglow sparkles
    [9.22, 'E6', 1.05, 0.042, 0.76],
    [9.44, 'D6', 1.05, 0.044, 0.74],
    [9.68, 'B5', 1.05, 0.046, 0.72],
  ];
  for (const [t, note, d, a, mix] of fireflyBloom) {
    addSilverBellHarp(out, t, NOTES[note], d, a, mix);
  }

  // =========================================================================
  // SECTION 3 (11.8s - 18.4s): Act II - Singing Wind-Chime Arbor
  // Slightly livelier, brighter 6/8 sway + dancing flute melody + silver bell cascades
  // 6/8 barcarolle: eighth = 0.218s, bar = 1.308s (5 bars: 11.80s -> 18.34s)
  // =========================================================================
  const act2Eighth = 0.218;
  const act2Bars = [
    {
      t: 11.8,
      pad: ['E2', 'B2', 'Fs3', 'G3', 'D4'],
      pizz: ['E2', 'B2', 'G3', 'B2', 'Fs3', 'G3'],
      harp: ['E3', 'B3', 'G4', 'B4', 'Fs4', 'B3'],
    },
    {
      t: 11.8 + act2Eighth * 6, // 13.108s
      pad: ['C3', 'G3', 'B3', 'E4'],
      pizz: ['C3', 'G3', 'E4', 'G3', 'B3', 'E4'],
      harp: ['C3', 'G3', 'E4', 'G4', 'B4', 'E4'],
    },
    {
      t: 11.8 + act2Eighth * 12, // 14.416s
      pad: ['G2', 'D3', 'A3', 'B3', 'Fs4'],
      pizz: ['G2', 'D3', 'B3', 'D3', 'A3', 'B3'],
      harp: ['G3', 'D4', 'B4', 'D5', 'A4', 'B4'],
    },
    {
      t: 11.8 + act2Eighth * 18, // 15.724s
      pad: ['D2', 'A2', 'B3', 'Fs4'],
      pizz: ['D2', 'A2', 'Fs3', 'A2', 'B3', 'Fs3'],
      harp: ['D3', 'A3', 'Fs4', 'B4', 'A4', 'Fs4'],
    },
    {
      t: 11.8 + act2Eighth * 24, // 17.032s
      pad: ['C3', 'G3', 'D4', 'Fs4'],
      pizz: ['C3', 'G3', 'E4', 'D2', 'A2', 'Fs3'],
      harp: ['C3', 'G3', 'E4', 'D3', 'A3', 'Fs4'],
    },
  ];

  for (const bar of act2Bars) {
    addMutedStringPad(out, bar.t, bar.pad, act2Eighth * 6.3, 0.064, 0.24, 0.32);
    for (let i = 0; i < 6; i++) {
      const st = bar.t + i * act2Eighth;
      addPizzicatoPluck(
        out,
        st,
        NOTES[bar.pizz[i]],
        0.24,
        i === 0 ? 0.115 : i === 3 ? 0.098 : 0.072
      );
      addSilverBellHarp(
        out,
        st,
        NOTES[bar.harp[i]],
        0.88,
        i % 3 === 0 ? 0.088 : 0.064,
        0.34
      );
    }
  }

  // Dancing pastoral wooden flute melody singing through the wind-chime arbor
  const act2Flute = [
    // Bar 1 (Em9)
    [11.8, 'G5', 0.42, 0.132],
    [12.236, 'Fs5', 0.24, 0.122],
    [12.454, 'E5', 0.42, 0.128],
    [12.89, 'D5', 0.25, 0.12],
    // Bar 2 (Cmaj7)
    [13.108, 'E5', 0.42, 0.132],
    [13.544, 'G5', 0.25, 0.128],
    [13.762, 'A5', 0.44, 0.134],
    [14.198, 'G5', 0.25, 0.124],
    // Bar 3 (Gmaj9)
    [14.416, 'B5', 0.44, 0.128],
    [14.852, 'A5', 0.24, 0.122],
    [15.07, 'G5', 0.42, 0.13],
    [15.506, 'E5', 0.24, 0.12],
    // Bar 4 (D6)
    [15.724, 'Fs5', 0.44, 0.13],
    [16.16, 'E5', 0.24, 0.12],
    [16.378, 'D5', 0.44, 0.125],
    [16.814, 'B4', 0.26, 0.115],
    // Bar 5 (Cmaj7 -> D6 glowing cadence into Act III glade)
    [17.032, 'E5', 0.56, 0.126],
    [17.686, 'Fs5', 0.58, 0.124],
  ];
  for (const [t, note, d, a] of act2Flute) {
    addPastoralFlute(out, t, NOTES[note], d, a);
  }

  // Sparkling silver glockenspiel & wind-chime harp cascades across the arbor
  const act2Chimes = [
    // Cascade 1
    [11.92, 'B5', 1.05, 0.062, 0.74],
    [12.03, 'D6', 1.1, 0.06, 0.76],
    [12.15, 'Fs6', 1.15, 0.054, 0.78],
    [12.28, 'G6', 1.2, 0.046, 0.8],
    // Cascade 2
    [13.28, 'G6', 1.05, 0.048, 0.78],
    [13.39, 'E6', 1.08, 0.054, 0.76],
    [13.51, 'D6', 1.12, 0.058, 0.74],
    [13.64, 'B5', 1.12, 0.056, 0.72],
    // Cascade 3
    [14.58, 'D6', 1.08, 0.058, 0.76],
    [14.7, 'E6', 1.1, 0.056, 0.78],
    [14.83, 'G6', 1.18, 0.048, 0.8],
    // Cascade 4
    [15.88, 'Fs6', 1.08, 0.052, 0.78],
    [16.0, 'D6', 1.12, 0.058, 0.76],
    [16.13, 'B5', 1.12, 0.058, 0.74],
    [16.27, 'A5', 1.12, 0.056, 0.72],
    // Shimmering arbor-exit bridge into Act III Moonlit Bench Glade
    [17.56, 'A5', 1.15, 0.052, 0.72],
    [17.68, 'B5', 1.2, 0.055, 0.74],
    [17.81, 'D6', 1.25, 0.056, 0.76],
    [17.95, 'Fs6', 1.3, 0.05, 0.78],
    [18.1, 'G6', 1.35, 0.042, 0.8],
  ];
  for (const [t, note, d, a, mix] of act2Chimes) {
    addSilverBellHarp(out, t, NOTES[note], d, a, mix);
  }

  // =========================================================================
  // SECTION 4 (18.4s - 27.0s): Act III - Secret Moonlit Bench Glade
  // Warm, tender romantic muted string pad + flowing 6/8 harp barcarolle
  // under the Narrator and Moon's lullaby
  // 6/8 barcarolle: eighth = 0.286s, bar = 1.716s (5 bars: 18.40s -> 26.98s)
  // =========================================================================
  const act3Eighth = 0.286;
  const act3Bars = [
    {
      t: 18.4,
      pad: ['G2', 'D3', 'A3', 'B3', 'Fs4'],
      harp: ['G3', 'D4', 'A4', 'B4', 'Fs4', 'D4'],
      glint: 'D6',
    },
    {
      t: 18.4 + act3Eighth * 6, // 20.116s
      pad: ['E2', 'B2', 'Fs3', 'G3', 'D4'],
      harp: ['E3', 'B3', 'Fs4', 'G4', 'D4', 'B3'],
      glint: 'B5',
    },
    {
      t: 18.4 + act3Eighth * 12, // 21.832s
      pad: ['C3', 'G3', 'B3', 'E4', 'G4'],
      harp: ['C3', 'G3', 'D4', 'E4', 'B4', 'G4'],
      glint: 'E6',
    },
    {
      t: 18.4 + act3Eighth * 18, // 23.548s
      pad: ['D2', 'A2', 'B3', 'Fs4', 'A4'],
      harp: ['D3', 'A3', 'E4', 'Fs4', 'B4', 'A4'],
      glint: 'D6',
    },
    {
      t: 18.4 + act3Eighth * 24, // 25.264s
      pad: ['E2', 'B2', 'G3', 'D4', 'Fs4'],
      harp: ['E3', 'B3', 'G4', 'C3', 'G3', 'E4'],
      glint: 'G6',
    },
  ];

  for (const bar of act3Bars) {
    // Rich, warm romantic con-sordino string pad swells
    addMutedStringPad(
      out,
      bar.t,
      bar.pad,
      act3Eighth * 6.55,
      0.095,
      0.42,
      0.52
    );

    // Flowing 6/8 barcarolle harp rocking wave (1-2-3, 4-5-6)
    for (let i = 0; i < 6; i++) {
      addSilverBellHarp(
        out,
        bar.t + i * act3Eighth,
        NOTES[bar.harp[i]],
        1.5,
        i === 0 ? 0.096 : i === 3 ? 0.086 : 0.07,
        0.22
      );
    }

    // One whisper-soft moonbeam bell glint per bar on beat 4
    addSilverBellHarp(
      out,
      bar.t + act3Eighth * 3.0,
      NOTES[bar.glint],
      1.45,
      0.032,
      0.76
    );
  }

  // Tender, hushed pastoral flute counter-melody cradled gently under Moon's lullaby
  const act3Flute = [
    [18.4, 'B4', 1.05, 0.096],
    [19.54, 'D5', 0.62, 0.092],
    [20.12, 'Fs5', 1.08, 0.098],
    [21.26, 'E5', 0.62, 0.092],
    [21.83, 'D5', 0.85, 0.096],
    [22.69, 'E5', 0.42, 0.09],
    [23.12, 'G5', 0.56, 0.096],
    [23.55, 'Fs5', 1.06, 0.096],
    [24.69, 'D5', 0.62, 0.088],
    [25.26, 'B4', 0.92, 0.092],
    [26.26, 'A4', 0.74, 0.088],
  ];
  for (const [t, note, d, a] of act3Flute) {
    addPastoralFlute(out, t, NOTES[note], d, a);
  }

  // =========================================================================
  // SECTION 5 (27.0s - 30.0s): Act IV - Goodnight Under the Silver Moon
  // Gentle ritardando cadence resolving warmly on Gmaj9,
  // smooth raised-cosine fade-out 28.3s-29.7s to clean silence 29.7s-30.0s
  // =========================================================================
  // Ritardando pre-cadence sigh on D6 (27.00s - 27.72s)
  addMutedStringPad(
    out,
    27.0,
    ['D2', 'A2', 'B3', 'Fs4'],
    0.92,
    0.074,
    0.22,
    0.34
  );
  addSilverBellHarp(out, 27.0, NOTES.D3, 1.15, 0.082, 0.24);
  addSilverBellHarp(out, 27.24, NOTES.A3, 1.08, 0.072, 0.26);
  addSilverBellHarp(out, 27.5, NOTES.Fs4, 1.05, 0.068, 0.32);
  addPastoralFlute(out, 27.02, NOTES.A4, 0.68, 0.094);

  // Final luminous Gmaj9 resolution chord (27.68s -> fading out smoothly by 29.7s)
  addMutedStringPad(
    out,
    27.68,
    ['G2', 'D3', 'A3', 'B3', 'Fs4'],
    2.02,
    0.096,
    0.32,
    0.62
  );

  // Slow ritardando harp & silver bell-chime Gmaj9 cradle arpeggio
  const finalGmaj9Harp = [
    [27.68, 'G3', 2.0, 0.094, 0.22],
    [27.82, 'D4', 1.86, 0.084, 0.28],
    [27.97, 'A4', 1.72, 0.078, 0.36],
    [28.13, 'B4', 1.56, 0.074, 0.44],
    [28.3, 'Fs5', 1.38, 0.066, 0.56],
    [28.48, 'G5', 1.2, 0.062, 0.62],
  ];
  for (const [t, note, d, a, mix] of finalGmaj9Harp) {
    addSilverBellHarp(out, t, NOTES[note], d, a, mix);
  }

  // Final serene solo flute goodnight resolution (G4 -> B4 -> G5 whisper)
  addPastoralFlute(out, 27.7, NOTES.G4, 1.65, 0.092);
  addPastoralFlute(out, 28.08, NOTES.B4, 1.35, 0.072);

  // Final moonlight star-glint chimes
  addSilverBellHarp(out, 28.22, NOTES.D6, 1.42, 0.036, 0.78);
  addSilverBellHarp(out, 28.52, NOTES.G6, 1.15, 0.028, 0.82);

  // =========================================================================
  // Master envelope: smooth click-free fade-in (0.0-0.22s) and
  // raised-cosine bedtime fade-out (28.3s-29.7s) to clean silence (29.7s-30.0s)
  // =========================================================================
  const fadeOutStart = Math.max(0, dur - 1.7);
  const silenceAt = Math.max(fadeOutStart + 0.1, dur - 0.3);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let masterEnv = 1.0;
    if (t < 0.22) {
      masterEnv = raisedCosineRamp(t, 0.22);
    } else if (t >= silenceAt) {
      masterEnv = 0.0;
    } else if (t > fadeOutStart) {
      masterEnv = raisedCosineRamp(silenceAt - t, silenceAt - fadeOutStart);
    }
    out[i] *= masterEnv;
  }

  return out;
}

export const CLASSIC_STARTER_CAT_LULLABY_BGM_CLIP = {
  id: 'classic-starter-cat-lullaby-bgm',
  filename: 'classic-starter-cat-lullaby-bgm.wav',
  src: '/audio/classic-starter-cat-lullaby-bgm.wav',
  title: 'Classic Moonlit Garden Barcarolle — Pastoral Nocturnal Lullaby',
  category: 'bgm',
  durationSec: 30.0,
  defaultVolume: 0.26,
  targetPeak: 0.82,
  description:
    '5-section 30.0s 1970s animated-film G-major / E-minor 6/8 barcarolle nocturnal lullaby featuring pastoral solo wooden flute, curious tiptoeing pizzicato strings, lush muted orchestral string pads (Gmaj9, Em9, Cmaj7, D6), silver glockenspiel/wind-chime harp sparkles, and whisper-quiet night breeze: (1) Theatrical Iris Opening (0.0-3.2s), (2) Act I Lantern Terrace & Firefly Jar with 8.2s firefly swirl sparkle bloom (3.2-11.8s), (3) Act II Singing Wind-Chime Arbor lively 6/8 flute & bell-harp cascades (11.8-18.4s), (4) Act III Secret Moonlit Bench Glade romantic string pad & flowing barcarolle harp (18.4-27.0s), (5) Act IV Goodnight Under the Silver Moon ritardando Gmaj9 resolution fading cleanly 28.3-29.7s to silence (27.0-30.0s).',
  themes: [
    'bedtime',
    'lullaby',
    'cat',
    'garden',
    'classic',
    'moonlit',
    'night',
    'orchestral',
    'dreamy',
  ],
  generate: () => generateClassicStarterCatLullabyBgm(30.0),
};

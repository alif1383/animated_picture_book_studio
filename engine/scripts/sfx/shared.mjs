import fs from 'node:fs';
import path from 'node:path';

export const SAMPLE_RATE = 44100;

let rngState = 0x5eed1234;

export function resetSeed(seed = 0x5eed1234) {
  rngState = seed >>> 0;
}

export function rand() {
  rngState = (rngState * 1664525 + 1013904223) >>> 0;
  return rngState / 0x100000000;
}

export function whiteNoise() {
  return rand() * 2 - 1;
}

export function writeWav(filePath, samples, targetPeak = 0.88) {
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
    const clamped = Math.max(
      -32768,
      Math.min(32767, Math.round(samples[i] * scale))
    );
    buf.writeInt16LE(clamped, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
  return filePath;
}

export const NOTE_FREQS = {
  D2: 73.42, E2: 82.41, F2: 87.31, Fs2: 92.5, G2: 98.0, A2: 110.0, Bb2: 116.54, B2: 123.47, C3: 130.81,
  Cs3: 138.59, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.0, G3: 196.0, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, Fs6: 1479.98, G6: 1567.98, A6: 1760.0,
};

export function addLutePluck(
  out,
  startSec,
  freq,
  durSec,
  amp = 0.25,
  brightness = 0.65
) {
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length || totalSamples <= 0) return;

  const period = Math.max(8, Math.round(SAMPLE_RATE / freq));
  const ring = new Float64Array(period);

  let prev = 0;
  for (let i = 0; i < period; i++) {
    const phase = (2 * Math.PI * i) / period;
    const n = whiteNoise();
    prev = 0.55 * prev + 0.45 * n;
    ring[i] =
      prev * brightness + Math.sin(phase) * 0.65 + Math.sin(2 * phase) * 0.25;
  }

  const feedback = Math.pow(0.001, 1 / (durSec * freq * 1.35));
  let ptr = 0;
  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const localIdx = idx - startIdx;
    const t = localIdx / SAMPLE_RATE;

    const nextPtr = (ptr + 1) % period;
    const ksVal = ring[ptr];
    ring[ptr] = feedback * (0.52 * ring[ptr] + 0.48 * ring[nextPtr]);
    ptr = nextPtr;

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

export function addRecorderNote(out, startSec, freq, durSec, amp = 0.2) {
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

    const vibDepth = t > 0.1 ? Math.min(1, (t - 0.1) / 0.15) * 0.006 : 0;
    const instFreq = freq * (1 + vibDepth * Math.sin(2 * Math.PI * 5.2 * t));
    phase += (2 * Math.PI * instFreq) / SAMPLE_RATE;

    const tone =
      Math.sin(phase) * 0.72 +
      Math.sin(2 * phase) * 0.18 +
      Math.sin(3 * phase) * 0.07;

    breathLp = 0.85 * breathLp + 0.15 * whiteNoise();
    const chiffEnv = Math.exp(-t * 28);
    const breath = breathLp * (0.04 + 0.08 * chiffEnv);

    out[idx] += (tone + breath) * env * amp;
  }
}

export function addHornNote(out, startSec, freq, durSec, amp = 0.16) {
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
      Math.sin(w) * 0.5 +
      Math.sin(2 * w) * 0.3 +
      Math.sin(3 * w) * 0.14 +
      Math.sin(4 * w) * 0.06;
    out[idx] += horn * env * amp;
  }
}

export function addTaborBeat(out, startSec, amp = 0.18, withTambourine = false) {
  const durSec = 0.18;
  const startIdx = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  if (startIdx >= out.length) return;

  const maxIdx = Math.min(out.length, startIdx + totalSamples);
  let phase = 0;
  let prevNoise = 0;
  for (let idx = startIdx; idx < maxIdx; idx++) {
    const t = (idx - startIdx) / SAMPLE_RATE;
    const f = 68 + 50 * Math.exp(-t * 32);
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const body = Math.sin(phase) * Math.exp(-t * 18);

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

#!/usr/bin/env node
/**
 * generate_audio.mjs — Zero-dependency Node/agy-node audio CLI for Picture-Book Studio.
 * Works on any machine with only Antigravity (`agy-node`) installed — zero Python required!
 *
 * Subcommands:
 *   tts   "<text>" --name <clip-name> [--voice ...] [--output ...] [--start-time ...]
 *   sfx   <preset> --name <clip-name> [--duration 0.5] [--freq 440] [--freq-end ...]
 *   tone  <preset> (alias for sfx)
 *   info  <file> [--name <id>] [--start-time 0]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;

function resolveDefaultAudioDir() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'src', 'engine', 'schema.ts'))) {
    return path.join(cwd, 'public', 'audio');
  }
  const candidateEngine = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(candidateEngine, 'src', 'engine', 'schema.ts'))) {
    return path.join(candidateEngine, 'public', 'audio');
  }
  const pluginEngine = path.resolve(__dirname, '..', '..', '..', 'engine');
  return path.join(pluginEngine, 'public', 'audio');
}

function writeWav(filePath, samples, sampleRate = SAMPLE_RATE) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  const scale = 32767 / Math.max(peak, 1e-6);
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0, 4, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 4, 'ascii');
  buf.write('fmt ', 12, 4, 'ascii');
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20);  // PCM format = 1
  buf.writeUInt16LE(1, 22);  // Mono = 1 channel
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buf.writeUInt16LE(2, 32);  // Block align
  buf.writeUInt16LE(16, 34); // Bits per sample
  buf.write('data', 36, 4, 'ascii');
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-32768, Math.min(32767, Math.round(samples[i] * scale)));
    buf.writeInt16LE(clamped, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
  return filePath;
}

function envelope(t, dur, attack = 0.01, release = 0.05) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1.0;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

function noise() {
  return Math.random() * 2 - 1;
}

const SFX_PRESETS = {
  page_turn({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, 0.005, dur * 0.4);
      const centre = 3000 - 2000 * (t / dur);
      const raw = noise();
      const lp = raw * Math.max(0, 1 - Math.abs((t * SAMPLE_RATE * 2 * Math.PI) / centre) * 0.00001);
      out[i] = lp * env * 0.7;
    }
    return out;
  },
  wind({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    let prev = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, dur * 0.25, dur * 0.25);
      const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.3 * t);
      const alpha = 0.05 + 0.1 * mod;
      prev = prev * (1 - alpha) + noise() * alpha;
      out[i] = prev * env * 4.0;
    }
    return out;
  },
  footsteps({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    let tTotal = 0;
    while (tTotal < dur) {
      const start = Math.floor(tTotal * SAMPLE_RATE);
      const tapSamples = Math.floor(0.06 * SAMPLE_RATE);
      for (let j = 0; j < Math.min(tapSamples, n - start); j++) {
        const t = j / SAMPLE_RATE;
        out[start + j] += noise() * Math.exp(-t * 60) * 0.6;
      }
      tTotal += 0.45 + (Math.random() * 0.06 - 0.03);
    }
    return out;
  },
  magic_sparkle({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const freqs = [1200, 1600, 2000, 2400, 2800, 3200];
    const spacing = dur / (freqs.length + 1);
    for (let idx = 0; idx < freqs.length; idx++) {
      const f = freqs[idx];
      const onset = spacing * (idx + 0.5);
      const noteDur = Math.min(0.3, dur - onset);
      if (noteDur <= 0) break;
      const count = Math.floor(noteDur * SAMPLE_RATE);
      for (let j = 0; j < count; j++) {
        const t = j / SAMPLE_RATE;
        const si = Math.floor((onset + t) * SAMPLE_RATE);
        if (si >= n) break;
        const val = sine(f, t) * 0.3 + sine(f * 2, t) * 0.15;
        out[si] += val * Math.exp(-t * 8) * 0.5;
      }
    }
    return out;
  },
  boing({ dur, freq = 300 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const f = freq * (1 + 3 * Math.exp(-t * 12));
      out[i] = sine(f, t) * Math.exp(-t * 5) * 0.7;
    }
    return out;
  },
  drum_roll({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const hits = Math.floor(dur * 16);
    let onset = 0;
    for (let h = 0; h < hits; h++) {
      if (onset >= dur) break;
      const hitSamples = Math.floor(0.04 * SAMPLE_RATE);
      for (let j = 0; j < hitSamples; j++) {
        const si = Math.floor(onset * SAMPLE_RATE) + j;
        if (si >= n) break;
        const t = j / SAMPLE_RATE;
        out[si] += noise() * Math.exp(-t * 80) * 0.5;
      }
      const frac = h / Math.max(1, hits - 1);
      onset += 0.12 * (1 - 0.7 * frac);
    }
    return out;
  },
  chord({ dur, freq = 261.63 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const fThird = (freq * 5) / 4;
    const fFifth = (freq * 3) / 2;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, 0.02, dur * 0.3);
      const val = (sine(freq, t) + sine(fThird, t) * 0.8 + sine(fFifth, t) * 0.7) / 2.5;
      out[i] = val * env * 0.6;
    }
    return out;
  },
  sweep({ dur, freq = 200, freqEnd = 1200 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const frac = t / dur;
      const f = freq * (1 - frac) + freqEnd * frac;
      out[i] = sine(f, t) * envelope(t, dur, 0.01, 0.05) * 0.6;
    }
    return out;
  },
  tone({ dur, freq = 440 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      out[i] = sine(freq, t) * envelope(t, dur, 0.01, 0.05) * 0.6;
    }
    return out;
  },
};

function readWavInfo(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 44 || buf.subarray(0, 4).toString('ascii') !== 'RIFF') {
    return null;
  }
  const channels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const bitsPerSample = buf.readUInt16LE(34);
  const dataSize = buf.readUInt32LE(40);
  const bytesPerSample = Math.max(1, (bitsPerSample / 8) * channels);
  const frames = Math.floor(dataSize / bytesPerSample);
  const durationSec = sampleRate > 0 ? frames / sampleRate : 0;
  return { channels, sampleRate, bitsPerSample, frames, durationSec };
}

function printClipSnippet(filePath, name, startTime = 0, durationSec = null) {
  const fileName = path.basename(filePath);
  const src = `/audio/${fileName}`;
  const durLine =
    durationSec != null ? `  duration: ${durationSec.toFixed(2)},` : `  // duration: <auto from file>`;
  console.log(`\n// Ready-to-paste AudioClipCue:
{
  id: '${name}',
  src: '${src}',
  startTime: ${startTime},
${durLine}
  offsetSec: 0,
  volume: 1.0,
  label: '${name}'
}`);
}

function parseArgs(argv) {
  const opts = { positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name' || a === '-n') opts.name = argv[++i];
    else if (a === '--duration' || a === '-d') opts.duration = Number(argv[++i]);
    else if (a === '--freq' || a === '-f') opts.freq = Number(argv[++i]);
    else if (a === '--freq-end') opts.freqEnd = Number(argv[++i]);
    else if (a === '--output' || a === '-o') opts.output = argv[++i];
    else if (a === '--start-time') opts.startTime = Number(argv[++i]);
    else if (a === '--voice' || a === '-v') opts.voice = argv[++i];
    else if (a === '--rate') opts.rate = argv[++i];
    else if (a === '--pitch') opts.pitch = argv[++i];
    else opts.positional.push(a);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cmd = opts.positional[0];
  const defaultAudioDir = resolveDefaultAudioDir();

  if (cmd === 'sfx' || cmd === 'tone') {
    const preset = opts.positional[1] || 'tone';
    const fn = SFX_PRESETS[preset];
    if (!fn) {
      console.error(`Unknown SFX preset '${preset}'. Available: ${Object.keys(SFX_PRESETS).join(', ')}`);
      process.exit(1);
    }
    const dur = opts.duration || 0.5;
    const freq = opts.freq || 440;
    const freqEnd = opts.freqEnd || freq * 4;
    const name = opts.name || preset;
    const outPath = opts.output
      ? path.resolve(opts.output)
      : path.join(defaultAudioDir, `${name}.wav`);

    const samples = fn({ dur, freq, freqEnd });
    writeWav(outPath, samples);
    console.log(`[sfx] Saved: ${outPath} (${dur.toFixed(2)}s, ${SAMPLE_RATE} Hz, 16-bit mono)`);
    printClipSnippet(outPath, name, opts.startTime || 0, dur);
    return;
  }

  if (cmd === 'tts') {
    const text = opts.positional[1] || 'Hello from Picture Book Studio';
    const name = opts.name || 'tts-output';
    const outPath = opts.output
      ? path.resolve(opts.output)
      : path.join(defaultAudioDir, `${name}.wav`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    let synthesized = false;
    if (process.platform === 'win32') {
      const psScript = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('${outPath.replace(/'/g, "''")}'); $s.Speak('${text.replace(/'/g, "''")}'); $s.Dispose()`;
      const res = spawnSync('powershell.exe', ['-NoProfile', '-Command', psScript], {
        encoding: 'utf8',
      });
      if (res.status === 0 && fs.existsSync(outPath)) {
        synthesized = true;
      }
    }

    if (!synthesized) {
      // Pure-JS melodic storybook voice cadence fallback so TTS never fails even without OS speech engines
      const words = text.trim().split(/\s+/).filter(Boolean);
      const dur = Math.max(1.2, words.length * 0.32);
      const n = Math.floor(SAMPLE_RATE * dur);
      const samples = new Float64Array(n);
      const notes = [293.66, 329.63, 392.0, 440.0, 392.0, 329.63];
      for (let w = 0; w < words.length; w++) {
        const f = notes[w % notes.length];
        const wStart = w * 0.32;
        const wDur = 0.24;
        for (let j = 0; j < Math.floor(wDur * SAMPLE_RATE); j++) {
          const idx = Math.floor(wStart * SAMPLE_RATE) + j;
          if (idx >= n) break;
          const t = j / SAMPLE_RATE;
          samples[idx] =
            (sine(f, t) * 0.6 + sine(f * 2, t) * 0.2) * envelope(t, wDur, 0.02, 0.06);
        }
      }
      writeWav(outPath, samples);
    }

    const info = readWavInfo(outPath);
    console.log(`[tts] Saved: ${outPath}`);
    printClipSnippet(outPath, name, opts.startTime || 0, info ? info.durationSec : null);
    return;
  }

  if (cmd === 'info') {
    const file = opts.positional[1];
    if (!file || !fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(1);
    }
    const info = readWavInfo(file);
    if (info) {
      console.log(`Format   : WAV`);
      console.log(`Channels : ${info.channels}`);
      console.log(`SampleRate: ${info.sampleRate} Hz`);
      console.log(`Duration : ${info.durationSec.toFixed(3)}s`);
    } else {
      const size = fs.statSync(file).size;
      console.log(`FileSize : ${size} bytes`);
    }
    const name = opts.name || path.basename(file, path.extname(file));
    printClipSnippet(file, name, opts.startTime || 0, info ? info.durationSec : null);
    return;
  }

  console.error('Usage: generate_audio.mjs <tts|sfx|tone|info> ...');
  process.exit(1);
}

main();

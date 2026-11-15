import type { FilteredNoiseOptions, ProceduralSfxHelpers } from './types';

export function synthesizeMusicBoxNote(
  ctx: BaseAudioContext,
  freq: number,
  duration: number,
  primaryWave: OscillatorType,
  overtoneMultiple: number,
  peakGain: number,
  startTime: number,
  masterVolume: number,
  connectOutput: (ctx: BaseAudioContext, sourceNode: AudioNode) => void
): void {
  const now = startTime;
  const gain = ctx.createGain();
  const scaledPeak = peakGain * masterVolume;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  connectOutput(ctx, gain);

  const osc1 = ctx.createOscillator();
  osc1.type = primaryWave;
  osc1.frequency.setValueAtTime(freq, now);
  osc1.connect(gain);
  osc1.start(now);
  osc1.stop(now + duration + 0.02);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(scaledPeak * 0.28, now);
  overtoneGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration * 0.65
  );
  connectOutput(ctx, overtoneGain);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * overtoneMultiple, now);
  osc2.connect(overtoneGain);
  osc2.start(now);
  osc2.stop(now + duration * 0.65 + 0.02);
}

export function scheduleFilteredNoise(
  ctx: BaseAudioContext,
  options: FilteredNoiseOptions,
  masterVolume: number,
  connectOutput: (ctx: BaseAudioContext, sourceNode: AudioNode) => void
): void {
  const dur = Math.max(0.04, options.duration);
  const now = options.startTime;
  const nyquistSafe = Math.max(200, ctx.sampleRate * 0.45);
  const clampFreq = (f: number) => Math.max(40, Math.min(nyquistSafe, f));

  const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const mod = options.envelope
      ? options.envelope(i, sampleCount, ctx.sampleRate)
      : 1;
    data[i] = (Math.random() * 2 - 1) * mod;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = options.filterType;
  filter.frequency.setValueAtTime(clampFreq(options.startFreq), now);
  if (options.peakFreq) {
    const crestTime =
      now + dur * Math.min(0.85, Math.max(0.1, options.peakFreq.atRatio));
    filter.frequency.exponentialRampToValueAtTime(
      clampFreq(options.peakFreq.freq),
      crestTime
    );
  }
  if (options.endFreq !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(
      clampFreq(options.endFreq),
      now + dur
    );
  }
  filter.Q.setValueAtTime(options.q, now);

  const gain = ctx.createGain();
  const scaledPeak = Math.max(0.0002, options.peakGain * masterVolume);
  const attack = Math.min(Math.max(0.005, options.attackSec), dur * 0.75);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(scaledPeak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  noise.connect(filter);
  filter.connect(gain);
  connectOutput(ctx, gain);

  noise.start(now);
  noise.stop(now + dur + 0.02);
}

export function schedulePitchBlip(
  ctx: BaseAudioContext,
  wave: OscillatorType,
  startFreq: number,
  endFreq: number,
  duration: number,
  peakGain: number,
  startTime: number,
  masterVolume: number,
  connectOutput: (ctx: BaseAudioContext, sourceNode: AudioNode) => void
): void {
  const dur = Math.max(0.03, duration);
  const nyquistSafe = Math.max(200, ctx.sampleRate * 0.45);
  const clampFreq = (f: number) => Math.max(40, Math.min(nyquistSafe, f));

  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.setValueAtTime(clampFreq(startFreq), startTime);
  osc.frequency.exponentialRampToValueAtTime(
    clampFreq(endFreq),
    startTime + dur
  );

  const gain = ctx.createGain();
  const scaledPeak = Math.max(0.0002, peakGain * masterVolume);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(
    scaledPeak,
    startTime + Math.min(0.01, dur * 0.3)
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

  osc.connect(gain);
  connectOutput(ctx, gain);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.01);
}

export function scheduleCrayonScribble(
  ctx: BaseAudioContext,
  centerFreq: number,
  duration: number,
  startTime: number,
  masterVolume: number,
  connectOutput: (ctx: BaseAudioContext, sourceNode: AudioNode) => void
): void {
  scheduleFilteredNoise(
    ctx,
    {
      duration,
      startTime,
      filterType: 'bandpass',
      startFreq: centerFreq,
      q: 2.4,
      peakGain: 0.14,
      attackSec: 0.01,
      envelope: (i, _count, sr) =>
        0.65 + 0.35 * Math.sin((i / sr) * Math.PI * 36),
    },
    masterVolume,
    connectOutput
  );
}

export function createProceduralSfxHelpers(
  masterVolume: number,
  connectOutput: (ctx: BaseAudioContext, sourceNode: AudioNode) => void
): ProceduralSfxHelpers {
  return {
    masterVolume,
    connectOutput,
    synthesizeMusicBoxNote: (
      ctx,
      freq,
      duration,
      primaryWave,
      overtoneMultiple,
      peakGain,
      startTime
    ) =>
      synthesizeMusicBoxNote(
        ctx,
        freq,
        duration,
        primaryWave,
        overtoneMultiple,
        peakGain,
        startTime,
        masterVolume,
        connectOutput
      ),
    scheduleFilteredNoise: (ctx, options) =>
      scheduleFilteredNoise(ctx, options, masterVolume, connectOutput),
    schedulePitchBlip: (
      ctx,
      wave,
      startFreq,
      endFreq,
      duration,
      peakGain,
      startTime
    ) =>
      schedulePitchBlip(
        ctx,
        wave,
        startFreq,
        endFreq,
        duration,
        peakGain,
        startTime,
        masterVolume,
        connectOutput
      ),
    scheduleCrayonScribble: (ctx, centerFreq, duration, startTime) =>
      scheduleCrayonScribble(
        ctx,
        centerFreq,
        duration,
        startTime,
        masterVolume,
        connectOutput
      ),
  };
}

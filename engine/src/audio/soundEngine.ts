import type { AudioClipCue, AudioNoteCue } from '../engine/schema';

export interface SoundEngineOptions {
  /** Initial mute state (default: false) */
  muted?: boolean;
  /** Master gain level in [0..1] (default: 0.25) */
  masterVolume?: number;
}

/**
 * Procedural WebAudio synthesizer for gentle music-box lullaby notes,
 * star chimes, and paper-crayon scribble foley synced to the stepped 6 FPS clock.
 * Gracefully no-ops in Node/headless test environments or when muted.
 */
export class PictureBookSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean;
  private readonly masterVolume: number;
  private recordingDest: MediaStreamAudioDestinationNode | null = null;
  private keepAliveOsc: OscillatorNode | null = null;

  /** Cache of decoded AudioBuffers keyed by src URL to avoid repeat fetches */
  private readonly clipBufferCache = new Map<string, AudioBuffer>();
  /** Currently playing AudioBufferSourceNodes for live clip playback, keyed by clip src+startTime */
  private readonly activeClipNodes = new Map<string, AudioBufferSourceNode>();

  constructor(options: SoundEngineOptions = {}) {
    this.muted = options.muted ?? false;
    this.masterVolume = Math.max(0, Math.min(1, options.masterVolume ?? 0.25));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Creates a WebAudio MediaStream for MediaRecorder 16:9 video export.
   * Attaches an ultra-quiet keep-alive oscillator so the Opus encoder clock
   * stays continuous across silent intervals without A/V sync drift.
   */
  public createRecordingStream(): MediaStream | null {
    const ctx = this.ensureContext();
    if (!ctx || typeof ctx.createMediaStreamDestination !== 'function') {
      return null;
    }
    this.stopRecordingStream();
    try {
      this.recordingDest = ctx.createMediaStreamDestination();
      const silentGain = ctx.createGain();
      silentGain.gain.setValueAtTime(0.00001, ctx.currentTime);
      silentGain.connect(this.recordingDest);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.connect(silentGain);
      osc.start();
      this.keepAliveOsc = osc;

      return this.recordingDest.stream;
    } catch {
      this.recordingDest = null;
      return null;
    }
  }

  /**
   * Stops and disconnects the active video recording audio stream if present.
   */
  public stopRecordingStream(): void {
    if (this.keepAliveOsc) {
      try {
        this.keepAliveOsc.stop();
        this.keepAliveOsc.disconnect();
      } catch {
        // Ignore cleanup errors
      }
      this.keepAliveOsc = null;
    }
    if (this.recordingDest) {
      try {
        this.recordingDest.disconnect();
      } catch {
        // Ignore cleanup errors
      }
      this.recordingDest = null;
    }
  }

  private connectOutput(ctx: BaseAudioContext, sourceNode: AudioNode): void {
    if (ctx !== this.ctx) {
      sourceNode.connect(ctx.destination);
      return;
    }
    if (!this.muted) {
      sourceNode.connect(ctx.destination);
    }
    if (this.recordingDest) {
      try {
        sourceNode.connect(this.recordingDest);
      } catch {
        // Ignore if unsupported in mock environment
      }
    }
  }

  /**
   * Evaluates and triggers all cues falling within the stepped frame advance
   * window `(prevQuantizedTime, currentQuantizedTime]`.
   */
  public triggerCuesForFrame(
    cues: readonly AudioNoteCue[] | undefined,
    prevQuantizedTime: number,
    currentQuantizedTime: number
  ): AudioNoteCue[] {
    if (!cues || cues.length === 0) return [];
    if (currentQuantizedTime <= prevQuantizedTime) return [];

    const eps = 1e-4;
    const triggered = cues.filter((cue) => {
      if (prevQuantizedTime < 0) {
        return cue.time >= 0 && cue.time <= currentQuantizedTime + eps;
      }
      return (
        cue.time > prevQuantizedTime + eps &&
        cue.time <= currentQuantizedTime + eps
      );
    });

    if (!this.muted || this.recordingDest !== null) {
      for (const cue of triggered) {
        this.playCue(cue);
      }
    }

    return triggered;
  }

  /**
   * Triggers a single `AudioNoteCue` immediately if unmuted (or recording) and WebAudio is available.
   */
  public playCue(cue: AudioNoteCue): void {
    if (this.muted && this.recordingDest === null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.scheduleCueOnContext(ctx, cue, ctx.currentTime);
  }

  /**
   * Schedules a single `AudioNoteCue` onto any `BaseAudioContext` (`AudioContext` or `OfflineAudioContext`)
   * at `startTime` seconds.
   */
  public scheduleCueOnContext(
    ctx: BaseAudioContext,
    cue: AudioNoteCue,
    startTime: number
  ): void {
    const kind = cue.kind ?? 'lullaby';
    const duration = Math.max(0.06, cue.duration || 0.35);
    const freq = Math.max(80, cue.freq || 440);
    const t0 = Math.max(0, startTime);

    if (kind === 'crayon_scribble') {
      this.synthesizeCrayonScribble(ctx, freq, duration, t0);
    } else if (kind === 'chime') {
      this.synthesizeMusicBoxNote(ctx, freq, duration, 'sine', 3, 0.18, t0);
    } else if (kind === 'birthday_song') {
      this.synthesizeBirthdaySongNote(ctx, freq, duration, t0);
    } else if (kind === 'party_horn') {
      this.synthesizePartyHorn(ctx, freq, duration, t0);
    } else if (kind === 'confetti_pop') {
      this.synthesizeConfettiPop(ctx, freq, duration, t0);
    } else if (kind === 'cheer_applause') {
      this.synthesizeCheerApplause(ctx, freq, duration, t0);
    } else if (kind === 'candle_blow') {
      this.synthesizeCandleBlow(ctx, freq, duration, t0);
    } else if (kind === 'giggle') {
      this.synthesizeGiggle(ctx, freq, duration, t0);
    } else if (kind === 'ocean_wave') {
      this.synthesizeOceanWave(ctx, freq, duration, t0);
    } else if (kind === 'water_splash') {
      this.synthesizeWaterSplash(ctx, freq, duration, t0);
    } else if (kind === 'floatie_squeak') {
      this.synthesizeFloatieSqueak(ctx, freq, duration, t0);
    } else {
      this.synthesizeMusicBoxNote(ctx, freq, duration, 'triangle', 2, 0.22, t0);
    }
  }

  /**
   * Renders all scene audio cues falling within `[startTimeSec, startTimeSec + durationSec]`
   * offline into a stereo `AudioBuffer` for non-fragmented MP4 encoding with exact duration.
   * Also mixes in any `audioClips` (external audio files) that overlap the export range.
   */
  public async renderOfflineAudio(
    cues: readonly AudioNoteCue[] | undefined,
    startTimeSec: number,
    durationSec: number,
    sampleRate = 48000,
    audioClips?: readonly AudioClipCue[]
  ): Promise<AudioBuffer | null> {
    if (typeof globalThis === 'undefined') return null;
    const g = globalThis as unknown as {
      OfflineAudioContext?: typeof OfflineAudioContext;
      webkitOfflineAudioContext?: typeof OfflineAudioContext;
    };
    const OfflineCtx = g.OfflineAudioContext ?? g.webkitOfflineAudioContext;
    if (!OfflineCtx) return null;

    try {
      const frameCount = Math.max(1, Math.ceil(durationSec * sampleRate));
      const offlineCtx = new OfflineCtx(2, frameCount, sampleRate);
      const endTimeSec = startTimeSec + durationSec;

      if (cues && cues.length > 0) {
        for (const cue of cues) {
          if (cue.time >= startTimeSec - 1e-4 && cue.time <= endTimeSec + 1e-4) {
            const offsetSec = Math.max(0, cue.time - startTimeSec);
            this.scheduleCueOnContext(offlineCtx, cue, offsetSec);
          }
        }
      }

      // Mix in external audio clips that overlap [startTimeSec, endTimeSec]
      if (audioClips && audioClips.length > 0) {
        await Promise.allSettled(
          audioClips.map(async (clip) => {
            const clipEndTime = clip.startTime + (clip.duration ?? Infinity);
            // Check if clip overlaps the export range
            if (clip.startTime > endTimeSec + 1e-4) return;
            if (clipEndTime < startTimeSec - 1e-4) return;

            let buf = this.clipBufferCache.get(clip.src);
            if (!buf) {
              try {
                if (typeof fetch !== 'function') return;
                const resp = await fetch(clip.src);
                if (!resp.ok) return;
                const ab = await resp.arrayBuffer();
                // decode on a temporary live context if the offline ctx doesn't support it
                const tempCtx = this.ensureContext();
                if (!tempCtx) return;
                buf = await tempCtx.decodeAudioData(ab.slice(0));
                this.clipBufferCache.set(clip.src, buf);
              } catch {
                return;
              }
            }
            if (!buf) return;

            const gain = offlineCtx.createGain();
            const vol = Math.max(0, Math.min(2, clip.volume ?? 1.0));
            gain.gain.setValueAtTime(vol, 0);
            gain.connect(offlineCtx.destination);

            const source = offlineCtx.createBufferSource();
            source.buffer = buf;
            source.connect(gain);

            const srcOffset = Math.max(0, clip.offsetSec ?? 0);
            // When clip starts before export range, advance into the clip
            const clipLeadIn = Math.max(0, startTimeSec - clip.startTime);
            const scheduleAt = Math.max(0, clip.startTime - startTimeSec);
            const playOffset = srcOffset + clipLeadIn;
            const maxDur = clip.duration !== undefined
              ? Math.max(0, clip.duration - clipLeadIn)
              : undefined;

            source.start(scheduleAt, playOffset, maxDur);
          })
        );
      }

      return await offlineCtx.startRendering();
    } catch {
      return null;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    if (typeof globalThis === 'undefined') return null;
    const g = globalThis as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtx = g.AudioContext ?? g.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      this.ctx = new AudioCtx();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private synthesizeMusicBoxNote(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    primaryWave: OscillatorType,
    overtoneMultiple: number,
    peakGain: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const gain = ctx.createGain();
    const scaledPeak = peakGain * this.masterVolume;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    this.connectOutput(ctx, gain);

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
    this.connectOutput(ctx, overtoneGain);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * overtoneMultiple, now);
    osc2.connect(overtoneGain);
    osc2.start(now);
    osc2.stop(now + duration * 0.65 + 0.02);
  }

  /**
   * Shared filtered-noise foley helper used by crayon_scribble, candle_blow,
   * ocean_wave, and water_splash on both live AudioContext and OfflineAudioContext.
   */
  private scheduleFilteredNoise(
    ctx: BaseAudioContext,
    options: {
      duration: number;
      startTime: number;
      filterType: BiquadFilterType;
      startFreq: number;
      peakFreq?: { freq: number; atRatio: number };
      endFreq?: number;
      q: number;
      peakGain: number;
      attackSec: number;
      envelope?: (i: number, count: number, sampleRate: number) => number;
    }
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
      const crestTime = now + dur * Math.min(0.85, Math.max(0.1, options.peakFreq.atRatio));
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
    const scaledPeak = Math.max(0.0002, options.peakGain * this.masterVolume);
    const attack = Math.min(Math.max(0.005, options.attackSec), dur * 0.75);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    this.connectOutput(ctx, gain);

    noise.start(now);
    noise.stop(now + dur + 0.02);
  }

  /**
   * Shared short pitch-sweeping oscillator blip used by confetti_pop and water_splash droplets.
   */
  private schedulePitchBlip(
    ctx: BaseAudioContext,
    wave: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number,
    startTime: number
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
    const scaledPeak = Math.max(0.0002, peakGain * this.masterVolume);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(
      scaledPeak,
      startTime + Math.min(0.01, dur * 0.3)
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    this.connectOutput(ctx, gain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.01);
  }

  private synthesizeCrayonScribble(
    ctx: BaseAudioContext,
    centerFreq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    this.scheduleFilteredNoise(ctx, {
      duration,
      startTime,
      filterType: 'bandpass',
      startFreq: centerFreq,
      q: 2.4,
      peakGain: 0.14,
      attackSec: 0.01,
      envelope: (i, _count, sr) =>
        0.65 + 0.35 * Math.sin((i / sr) * Math.PI * 36),
    });
  }

  /**
   * Bright toy glockenspiel + warm sub-octave accompaniment for the
   * "Happy Birthday to You" melody sung by Singing Radish.
   */
  private synthesizeBirthdaySongNote(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    this.synthesizeMusicBoxNote(
      ctx,
      freq,
      duration,
      'triangle',
      3,
      0.25,
      startTime
    );
    this.synthesizeMusicBoxNote(
      ctx,
      freq * 0.5,
      duration * 0.85,
      'sine',
      2,
      0.11,
      startTime
    );
  }

  /**
   * Playful paper party blower / kazoo horn ("toot-toot!"):
   * sawtooth wave through a bandpass filter with an upward pitch slide.
   */
  private synthesizePartyHorn(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.78, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.18, now + duration * 0.35);
    osc.frequency.setValueAtTime(freq * 1.12, now + duration * 0.7);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.1, now);
    filter.Q.setValueAtTime(3.2, now);

    const gain = ctx.createGain();
    const scaledPeak = 0.2 * this.masterVolume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    this.connectOutput(ctx, gain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Crisp paper confetti popper ("POP!" + cascading sparkle chimes).
   */
  private synthesizeConfettiPop(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const popDur = Math.min(0.11, duration * 0.45);

    // Quick pitch-drop thump
    this.schedulePitchBlip(
      ctx,
      'triangle',
      Math.max(240, freq),
      68,
      popDur,
      0.28,
      now
    );

    // Paper burst + high sparkle chime
    this.synthesizeCrayonScribble(ctx, 1350, popDur, now);
    this.synthesizeMusicBoxNote(
      ctx,
      1046.5,
      duration * 0.7,
      'sine',
      2,
      0.14,
      now
    );
    this.synthesizeMusicBoxNote(
      ctx,
      1318.5,
      duration * 0.85,
      'sine',
      2,
      0.12,
      now
    );
  }

  /**
   * Gentle breathy wind whoosh for Strawberry blowing out her birthday candles.
   */
  private synthesizeCandleBlow(
    ctx: BaseAudioContext,
    centerFreq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    this.scheduleFilteredNoise(ctx, {
      duration,
      startTime,
      filterType: 'bandpass',
      startFreq: Math.max(320, centerFreq * 1.4),
      endFreq: Math.max(160, centerFreq * 0.45),
      q: 1.8,
      peakGain: 0.22,
      attackSec: duration * 0.22,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
  }

  /**
   * Joyful crowd cheer & rhythmic little hand-claps for the birthday celebration.
   */
  private synthesizeCheerApplause(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    // Rhythmic little paper hand-claps
    const clapCount = 5;
    for (let i = 0; i < clapCount; i++) {
      const clapFreq = 850 + (i % 3) * 220;
      const clapOffset = now + i * 0.045;
      this.synthesizeCrayonScribble(
        ctx,
        clapFreq,
        Math.min(0.09, duration * 0.25),
        clapOffset
      );
    }
    // Warm celebratory major triad chord ("Hooray!")
    const root = Math.max(261.63, freq);
    this.synthesizeMusicBoxNote(ctx, root, duration, 'triangle', 2, 0.16, now);
    this.synthesizeMusicBoxNote(
      ctx,
      root * 1.25,
      duration,
      'triangle',
      2,
      0.14,
      now
    );
    this.synthesizeMusicBoxNote(
      ctx,
      root * 1.5,
      duration,
      'sine',
      2,
      0.14,
      now
    );
  }

  /**
   * Cute two-note bouncy pitch hop ("hee-hee!") for cutout characters giggling.
   */
  private synthesizeGiggle(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const half = duration * 0.48;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.26, now + half * 0.8);
    osc.frequency.setValueAtTime(freq * 1.12, now + half);
    osc.frequency.exponentialRampToValueAtTime(
      freq * 1.42,
      now + duration * 0.95
    );

    const gain = ctx.createGain();
    const scaledPeak = 0.19 * this.masterVolume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    this.connectOutput(ctx, gain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Soft rolling ocean surf swell (`'ocean_wave'`):
   * warm lowpass surf body swelling up to a frothy crest and receding onto the sand.
   */
  private synthesizeOceanWave(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const dur = Math.max(0.25, duration);
    const base = Math.max(120, Math.min(600, freq));
    this.scheduleFilteredNoise(ctx, {
      duration: dur,
      startTime,
      filterType: 'lowpass',
      startFreq: base * 0.55,
      peakFreq: { freq: base * 2.1, atRatio: 0.45 },
      endFreq: base * 0.48,
      q: 1.0,
      peakGain: 0.19,
      attackSec: dur * 0.42,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
    // Gentle frothy shoreline hiss near the wave crest
    this.scheduleFilteredNoise(ctx, {
      duration: dur * 0.65,
      startTime: startTime + dur * 0.2,
      filterType: 'bandpass',
      startFreq: 950,
      endFreq: 480,
      q: 1.3,
      peakGain: 0.06,
      attackSec: dur * 0.22,
      envelope: (i, count) => Math.sin((i / count) * Math.PI),
    });
  }

  /**
   * Playful bubbly water splash (`'water_splash'`):
   * crisp filtered splash noise burst + rapid upward-popping sine water-droplet blips.
   */
  private synthesizeWaterSplash(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const dur = Math.max(0.16, duration);
    // Splash spray burst
    this.scheduleFilteredNoise(ctx, {
      duration: dur * 0.78,
      startTime: now,
      filterType: 'bandpass',
      startFreq: Math.max(780, freq * 1.9),
      endFreq: Math.max(240, freq * 0.58),
      q: 1.35,
      peakGain: 0.22,
      attackSec: 0.015,
      envelope: (i, count) => Math.pow(1 - i / count, 0.7),
    });

    // 4 bubbly upward-popping water-droplet blips
    const bubbleRatios = [0.78, 1.0, 1.24, 1.48];
    const blipDur = Math.max(0.045, Math.min(0.095, dur * 0.24));
    for (let i = 0; i < bubbleRatios.length; i++) {
      const bStart = now + 0.02 + i * Math.min(0.065, dur * 0.15);
      const bFreq = Math.max(260, freq * bubbleRatios[i]);
      this.schedulePitchBlip(
        ctx,
        'sine',
        bFreq * 0.75,
        bFreq * 1.62,
        blipDur,
        0.13,
        bStart
      );
    }
  }

  /**
   * Cute inflatable vinyl / rubber-ducky squeak (`'floatie_squeak'`):
   * playful two-chirp pitch bend ("squeak-squeak!") through a resonant bandpass filter.
   */
  private synthesizeFloatieSqueak(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number = ctx.currentTime
  ): void {
    const now = startTime;
    const dur = Math.max(0.14, duration);
    const nyquistSafe = Math.max(400, ctx.sampleRate * 0.45);
    const base = Math.min(nyquistSafe * 0.55, Math.max(580, freq));
    const chirpDur = dur * 0.42;
    const chirp2Start = now + dur * 0.52;

    const scheduleChirp = (tStart: number, pitchScale: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const f0 = base * pitchScale;
      osc.frequency.setValueAtTime(f0, tStart);
      osc.frequency.exponentialRampToValueAtTime(
        Math.min(nyquistSafe, f0 * 1.48),
        tStart + chirpDur * 0.55
      );
      osc.frequency.exponentialRampToValueAtTime(
        Math.min(nyquistSafe, f0 * 1.12),
        tStart + chirpDur
      );

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(
        Math.min(nyquistSafe, f0 * 1.45),
        tStart
      );
      filter.Q.setValueAtTime(2.8, tStart);

      const gain = ctx.createGain();
      const scaledPeak = Math.max(0.0002, 0.2 * this.masterVolume);
      gain.gain.setValueAtTime(0.0001, tStart);
      gain.gain.linearRampToValueAtTime(
        scaledPeak,
        tStart + Math.min(0.015, chirpDur * 0.3)
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, tStart + chirpDur);

      osc.connect(filter);
      filter.connect(gain);
      this.connectOutput(ctx, gain);

      osc.start(tStart);
      osc.stop(tStart + chirpDur + 0.015);
    };

    scheduleChirp(now, 1.0);
    scheduleChirp(chirp2Start, 1.12);
  }

  /**
   * Fetches and decodes an audio file from `src`, caching the decoded `AudioBuffer`.
   * Returns `null` in headless/Node environments or on fetch/decode errors.
   */
  public async fetchAndDecodeClip(src: string): Promise<AudioBuffer | null> {
    if (this.clipBufferCache.has(src)) {
      return this.clipBufferCache.get(src)!;
    }
    if (typeof globalThis === 'undefined' || typeof fetch !== 'function') return null;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return null;
      const resp = await fetch(src);
      if (!resp.ok) return null;
      const arrayBuffer = await resp.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.clipBufferCache.set(src, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Pre-fetches and decodes all audio clips in a scene's `audioClips` array.
   * Call once after scene load so clips are ready for immediate playback.
   */
  public async preloadClips(clips: readonly AudioClipCue[] | undefined): Promise<void> {
    if (!clips || clips.length === 0) return;
    await Promise.allSettled(clips.map((c) => this.fetchAndDecodeClip(c.src)));
  }

  /**
   * Triggers live playback of any `AudioClipCue` entries whose `startTime` falls within
   * the stepped frame advance window `(prevQuantizedTime, currentQuantizedTime]`.
   * Already-playing clips are not retriggered.
   */
  public triggerClipsForFrame(
    clips: readonly AudioClipCue[] | undefined,
    prevQuantizedTime: number,
    currentQuantizedTime: number
  ): void {
    if (!clips || clips.length === 0) return;
    if (currentQuantizedTime <= prevQuantizedTime) return;
    if (this.muted && this.recordingDest === null) return;

    const eps = 1e-4;
    for (const clip of clips) {
      const shouldTrigger =
        prevQuantizedTime < 0
          ? clip.startTime >= 0 && clip.startTime <= currentQuantizedTime + eps
          : clip.startTime > prevQuantizedTime + eps && clip.startTime <= currentQuantizedTime + eps;

      if (!shouldTrigger) continue;

      const clipKey = `${clip.src}@${clip.startTime}`;
      if (this.activeClipNodes.has(clipKey)) continue; // already playing

      const cached = this.clipBufferCache.get(clip.src);
      if (!cached) {
        // Kick off async decode then play; best-effort for live playback
        void this.fetchAndDecodeClip(clip.src).then((buf) => {
          if (buf) this.playClipBuffer(buf, clip, clipKey);
        });
        continue;
      }
      this.playClipBuffer(cached, clip, clipKey);
    }
  }

  private playClipBuffer(
    buffer: AudioBuffer,
    clip: AudioClipCue,
    clipKey: string
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const gain = ctx.createGain();
    const vol = Math.max(0, Math.min(2, clip.volume ?? 1.0)) * this.masterVolume;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    this.connectOutput(ctx, gain);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);

    const offset = Math.max(0, clip.offsetSec ?? 0);
    const maxDuration = clip.duration !== undefined
      ? Math.max(0, clip.duration)
      : undefined;

    source.start(ctx.currentTime, offset, maxDuration);
    this.activeClipNodes.set(clipKey, source);
    source.onended = () => {
      this.activeClipNodes.delete(clipKey);
    };
  }

  /**
   * Stops all currently-playing audio clip sources (e.g. on seek or scene change).
   */
  public stopAllClips(): void {
    for (const [, node] of this.activeClipNodes) {
      try { node.stop(); } catch { /* ignore */ }
    }
    this.activeClipNodes.clear();
  }

  public dispose(): void {
    this.stopRecordingStream();
    this.stopAllClips();
    this.clipBufferCache.clear();
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

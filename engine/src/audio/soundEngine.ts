import type { AudioClipCue, AudioNoteCue } from '../engine/schema';
import {
  AUDIO_CLIP_CATALOG,
  CHARACTER_VOICE_PRESET_CATALOG,
  PROCEDURAL_SFX_MODULES,
  PROCEDURAL_SFX_REGISTRY,
  VOICE_CATALOG,
  createProceduralSfxHelpers,
  type ProceduralSfxHelpers,
} from './sfx';

export {
  AUDIO_CLIP_CATALOG,
  CHARACTER_VOICE_PRESET_CATALOG,
  PROCEDURAL_SFX_MODULES,
  PROCEDURAL_SFX_REGISTRY,
  VOICE_CATALOG,
};
export type {
  AudioClipCatalogEntry,
  CharacterVoicePresetCatalogEntry,
  FilteredNoiseOptions,
  ProceduralSfxCategory,
  ProceduralSfxHelpers,
  ProceduralSfxModule,
  VoiceAgeGroup,
  VoiceCatalogEntry,
  VoiceEnergy,
  VoiceGender,
  VoicePitch,
  VoiceRoughness,
} from './sfx';

export interface SoundEngineOptions {
  /** Initial mute state (default: false) */
  muted?: boolean;
  /** Master gain level in [0..1] (default: 0.25) */
  masterVolume?: number;
}

/**
 * Procedural WebAudio synthesizer and external audio clip mixer synced to the stepped 6 FPS clock.
 * Delegates each procedural `AudioCueKind` to its standalone module in `src/audio/sfx/<sfxName>.ts`.
 * Gracefully no-ops in Node/headless test environments or when muted.
 */
export class PictureBookSoundEngine {
  private ctx: AudioContext | null = null;
  private liveOutputGain: GainNode | null = null;
  private muted: boolean;
  private readonly masterVolume: number;
  private readonly sfxHelpers: ProceduralSfxHelpers;
  private recordingDest: MediaStreamAudioDestinationNode | null = null;
  private keepAliveOsc: OscillatorNode | null = null;

  /** Cache of decoded AudioBuffers keyed by src URL to avoid repeat fetches */
  private readonly clipBufferCache = new Map<string, AudioBuffer>();
  /** In-flight fetch+decode promises keyed by src URL to deduplicate parallel loads */
  private readonly inFlightClipFetches = new Map<
    string,
    Promise<AudioBuffer | null>
  >();
  /** Currently playing AudioBufferSourceNodes for live clip playback, keyed by clip key */
  private readonly activeClipNodes = new Map<string, AudioBufferSourceNode>();
  /** Monotonic playback generation bumped on stopAllClips/dispose to cancel stale async decodes */
  private clipPlaybackEpoch = 0;

  constructor(options: SoundEngineOptions = {}) {
    this.muted = options.muted ?? false;
    this.masterVolume = Math.max(0, Math.min(1, options.masterVolume ?? 0.25));
    this.sfxHelpers = createProceduralSfxHelpers(
      this.masterVolume,
      (ctx, sourceNode) => this.connectOutput(ctx, sourceNode)
    );
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.syncLiveOutputGain();
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    this.syncLiveOutputGain();
    return this.muted;
  }

  public isContextSuspended(): boolean {
    return this.ctx?.state === 'suspended';
  }

  /**
   * Attempts to create/resume the WebAudio AudioContext (best called inside a user gesture).
   * Returns `true` when the context is available and not suspended.
   */
  public async resumeContext(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try {
        await ctx.resume();
      } catch {
        // Autoplay policy may keep context suspended until a user gesture
      }
    }
    return ctx.state !== 'suspended';
  }

  private syncLiveOutputGain(): void {
    if (!this.ctx || !this.liveOutputGain) return;
    try {
      this.liveOutputGain.gain.setValueAtTime(
        this.muted ? 0 : 1,
        this.ctx.currentTime
      );
    } catch {
      // Ignore in minimal mock contexts
    }
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
    if (this.liveOutputGain) {
      sourceNode.connect(this.liveOutputGain);
    } else if (!this.muted) {
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
   * at `startTime` seconds by delegating to its modular synthesizer in `PROCEDURAL_SFX_REGISTRY`.
   */
  public scheduleCueOnContext(
    ctx: BaseAudioContext,
    cue: AudioNoteCue,
    startTime: number
  ): void {
    const kind = cue.kind ?? 'lullaby';
    const sfxModule =
      PROCEDURAL_SFX_REGISTRY[kind] ?? PROCEDURAL_SFX_REGISTRY.lullaby;
    const duration = Math.max(
      0.06,
      cue.duration || sfxModule.defaultDurationSec
    );
    const freq = Math.max(80, cue.freq || sfxModule.defaultFreqHz);
    const t0 = Math.max(0, startTime);

    sfxModule.synthesize(ctx, freq, duration, t0, this.sfxHelpers);
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

            const buf = await this.fetchAndDecodeClip(clip.src);
            if (!buf) return;

            const window = this.computeClipWindow(
              clip,
              Math.max(startTimeSec, clip.startTime),
              buf.duration
            );
            if (!window) return;

            const gain = offlineCtx.createGain();
            const vol = Math.max(0, Math.min(2, clip.volume ?? 1.0));
            gain.gain.setValueAtTime(vol, 0);
            gain.connect(offlineCtx.destination);

            const source = offlineCtx.createBufferSource();
            source.buffer = buf;
            source.connect(gain);

            const scheduleAt = Math.max(0, clip.startTime - startTimeSec);
            source.start(scheduleAt, window.playOffset, window.maxDuration);
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
      if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
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
      if (typeof this.ctx.createGain === 'function') {
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
        masterGain.connect(this.ctx.destination);
        this.liveOutputGain = masterGain;
      }
      if (this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
        void this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private computeClipWindow(
    clip: AudioClipCue,
    atTimeSec: number,
    bufferDuration?: number
  ): { playOffset: number; maxDuration?: number } | null {
    const srcOffset = Math.max(0, clip.offsetSec ?? 0);
    const leadIn = Math.max(0, atTimeSec - clip.startTime);
    const playOffset = srcOffset + leadIn;
    if (
      bufferDuration !== undefined &&
      Number.isFinite(bufferDuration) &&
      playOffset >= bufferDuration - 0.005
    ) {
      return null;
    }
    const maxDuration =
      clip.duration !== undefined
        ? Math.max(0, clip.duration - leadIn)
        : undefined;
    if (maxDuration !== undefined && maxDuration <= 0.005) {
      return null;
    }
    return { playOffset, maxDuration };
  }

  private getClipKey(clip: AudioClipCue, index = 0): string {
    return clip.id
      ? `${clip.id}@${clip.startTime}`
      : `${clip.src}@${clip.startTime}@${index}`;
  }

  /**
   * Fetches and decodes an audio file from `src`, caching the decoded `AudioBuffer`
   * and deduplicating concurrent in-flight requests for the same URL.
   * Returns `null` in headless/Node environments or on fetch/decode errors.
   */
  public async fetchAndDecodeClip(src: string): Promise<AudioBuffer | null> {
    if (this.clipBufferCache.has(src)) {
      return this.clipBufferCache.get(src)!;
    }
    const existingPromise = this.inFlightClipFetches.get(src);
    if (existingPromise) {
      return existingPromise;
    }
    if (typeof globalThis === 'undefined' || typeof fetch !== 'function')
      return null;

    const loadPromise = (async (): Promise<AudioBuffer | null> => {
      try {
        const ctx = this.ensureContext();
        if (!ctx || typeof ctx.decodeAudioData !== 'function') return null;
        const resp = await fetch(src);
        if (!resp.ok) return null;
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        this.clipBufferCache.set(src, audioBuffer);
        return audioBuffer;
      } catch {
        return null;
      } finally {
        this.inFlightClipFetches.delete(src);
      }
    })();

    this.inFlightClipFetches.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * Pre-fetches and decodes all unique audio clips in a scene's `audioClips` array.
   * Call once after scene load so clips are ready for immediate playback.
   */
  public async preloadClips(
    clips: readonly AudioClipCue[] | undefined
  ): Promise<void> {
    if (!clips || clips.length === 0) return;
    const uniqueSrcs = Array.from(new Set(clips.map((c) => c.src)));
    await Promise.allSettled(
      uniqueSrcs.map((src) => this.fetchAndDecodeClip(src))
    );
  }

  /**
   * Triggers live playback of any `AudioClipCue` entries whose `startTime` falls within
   * the stepped frame advance window `(prevQuantizedTime, currentQuantizedTime]`.
   * Already-playing clips are not retriggered.
   */
  public triggerClipsForFrame(
    clips: readonly AudioClipCue[] | undefined,
    prevQuantizedTime: number,
    currentQuantizedTime: number,
    getLiveTimeSec?: () => number
  ): void {
    if (!clips || clips.length === 0) return;
    if (currentQuantizedTime <= prevQuantizedTime) return;
    if (this.muted && this.recordingDest === null) return;

    const eps = 1e-4;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const shouldTrigger =
        prevQuantizedTime < 0
          ? clip.startTime >= 0 && clip.startTime <= currentQuantizedTime + eps
          : clip.startTime > prevQuantizedTime + eps &&
            clip.startTime <= currentQuantizedTime + eps;

      if (!shouldTrigger) continue;

      this.startClipLive(
        clip,
        this.getClipKey(clip, i),
        currentQuantizedTime,
        getLiveTimeSec
      );
    }
  }

  /**
   * Starts all `AudioClipCue` entries active at `timeSec` (including mid-clip BGM or
   * voiceovers that began before `timeSec`), computing the exact `offsetSec + leadIn`
   * and remaining `duration`. Safe to call on play, resume, seek, loop wrap, or unmute.
   */
  public syncClipsAtTime(
    clips: readonly AudioClipCue[] | undefined,
    timeSec: number,
    getLiveTimeSec?: () => number
  ): void {
    if (!clips || clips.length === 0) return;
    if (this.muted && this.recordingDest === null) return;

    const eps = 1e-4;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      if (clip.startTime > timeSec + eps) continue;
      if (
        clip.duration !== undefined &&
        timeSec >= clip.startTime + clip.duration - 0.005
      ) {
        continue;
      }

      this.startClipLive(
        clip,
        this.getClipKey(clip, i),
        timeSec,
        getLiveTimeSec
      );
    }
  }

  private startClipLive(
    clip: AudioClipCue,
    clipKey: string,
    atTimeSec: number,
    getLiveTimeSec?: () => number
  ): void {
    if (this.activeClipNodes.has(clipKey)) return;

    const cached = this.clipBufferCache.get(clip.src);
    if (cached) {
      this.playClipBuffer(cached, clip, clipKey, atTimeSec);
      return;
    }

    const epoch = this.clipPlaybackEpoch;
    void this.fetchAndDecodeClip(clip.src).then((buf) => {
      if (!buf) return;
      if (epoch !== this.clipPlaybackEpoch) return;
      if (this.muted && this.recordingDest === null) return;
      if (this.activeClipNodes.has(clipKey)) return;
      const liveTime = getLiveTimeSec ? getLiveTimeSec() : atTimeSec;
      this.playClipBuffer(buf, clip, clipKey, Math.max(clip.startTime, liveTime));
    });
  }

  private playClipBuffer(
    buffer: AudioBuffer,
    clip: AudioClipCue,
    clipKey: string,
    atTimeSec: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    // Do not queue frozen sources on a browser-suspended AudioContext; wait for resume+sync.
    if (ctx.state === 'suspended' && this.recordingDest === null) return;

    const window = this.computeClipWindow(clip, atTimeSec, buffer.duration);
    if (!window) return;

    const gain = ctx.createGain();
    const vol = Math.max(0, Math.min(2, clip.volume ?? 1.0));
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    this.connectOutput(ctx, gain);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);

    source.start(ctx.currentTime, window.playOffset, window.maxDuration);
    this.activeClipNodes.set(clipKey, source);
    source.onended = () => {
      if (this.activeClipNodes.get(clipKey) === source) {
        this.activeClipNodes.delete(clipKey);
      }
    };
  }

  /**
   * Stops all currently-playing audio clip sources and invalidates any pending async clip loads
   * (e.g. on pause, seek, loop wrap, or scene change).
   */
  public stopAllClips(): void {
    this.clipPlaybackEpoch += 1;
    for (const [, node] of this.activeClipNodes) {
      try {
        node.onended = null;
        node.stop();
      } catch {
        /* ignore */
      }
    }
    this.activeClipNodes.clear();
  }

  public dispose(): void {
    this.stopRecordingStream();
    this.stopAllClips();
    this.clipBufferCache.clear();
    this.inFlightClipFetches.clear();
    if (this.liveOutputGain) {
      try {
        this.liveOutputGain.disconnect();
      } catch {
        /* ignore */
      }
      this.liveOutputGain = null;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

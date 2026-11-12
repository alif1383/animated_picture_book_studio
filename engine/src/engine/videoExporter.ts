import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { TOKENS } from '../theme/tokens';
import { evaluateSteppedClock } from './clock';
import { evaluateAndRenderScene, RenderSceneOptions } from './renderer';
import type { SceneDefinition } from './schema';
import type { PictureBookSoundEngine } from '../audio/soundEngine';

export type VideoExportResolution = '1080p' | '720p';

export interface ResolutionPreset {
  width: number;
  height: number;
  label: string;
  videoBitsPerSecond: number;
}

export const VIDEO_RESOLUTION_PRESETS: Record<
  VideoExportResolution,
  ResolutionPreset
> = {
  '1080p': {
    width: 1920,
    height: 1080,
    label: '1080p Full HD (1920×1080 16:9)',
    videoBitsPerSecond: 8_000_000,
  },
  '720p': {
    width: 1280,
    height: 720,
    label: '720p HD (1280×720 16:9)',
    videoBitsPerSecond: 5_000_000,
  },
};

export interface VideoExportProgress {
  phase:
    | 'preparing'
    | 'recording'
    | 'finalizing'
    | 'completed'
    | 'cancelled'
    | 'error';
  /** Normalized progress in [0..1] */
  progress: number;
  /** Integer percentage in [0..100] */
  percent: number;
  currentTimeSec: number;
  durationSec: number;
  frameIndex: number;
  totalFrames: number;
  resolution: VideoExportResolution;
  width: number;
  height: number;
  mimeType: string;
  message: string;
}

export interface VideoExportOptions {
  scene: SceneDefinition;
  renderOptions?: RenderSceneOptions;
  resolution?: VideoExportResolution;
  fps?: number;
  startTimeSec?: number;
  endTimeSec?: number;
  footageId?: string | null;
  soundEngine?: PictureBookSoundEngine;
  autoDownload?: boolean;
  onProgress?: (progress: VideoExportProgress) => void;
  signal?: AbortSignal;
}

export interface VideoExportResult {
  blob: Blob;
  url: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  durationSec: number;
  frameCount: number;
}

/**
 * Selects the best supported video container/codec for 16:9 video + audio export.
 * Prioritizes standard MP4 (H.264 + AAC) so downloads are universal seekable .mp4 files.
 */
export function selectSupportedVideoMimeType(): {
  mimeType: string;
  extension: 'webm' | 'mp4';
} {
  if (
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined'
  ) {
    return {
      mimeType: 'video/mp4;codecs=avc1.42001f,mp4a.40.2',
      extension: 'mp4',
    };
  }

  const candidates: Array<{ mimeType: string; extension: 'webm' | 'mp4' }> = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs=avc1,mp4a.40.2', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' },
    { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'webm' },
  ];

  if (
    typeof MediaRecorder !== 'undefined' &&
    typeof MediaRecorder.isTypeSupported === 'function'
  ) {
    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
        return candidate;
      }
    }
  }
  return { mimeType: 'video/mp4', extension: 'mp4' };
}

/**
 * Builds a clean, descriptive download filename for the exported 16:9 video.
 */
export function buildVideoFilename(
  sceneId: string,
  footageId: string | null | undefined,
  resolution: VideoExportResolution,
  extension: 'webm' | 'mp4' = 'mp4'
): string {
  const safeScene = sceneId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const safeFootage = footageId
    ? `-${footageId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
    : '';
  return `picture-book-${safeScene}${safeFootage}-${resolution}-16x9.${extension}`;
}

/**
 * Prepares a rendered SVG string for crisp 16:9 canvas rasterization at (width × height).
 * Replaces root percentage dimensions with explicit pixel dimensions and sets
 * preserveAspectRatio="xMidYMid meet".
 */
export function prepareSvgFor16x9Canvas(
  svgMarkup: string,
  width: number,
  height: number
): string {
  return svgMarkup
    .replace(/\bwidth="100%"/, `width="${width}"`)
    .replace(
      /\bheight="100%"/,
      `height="${height}" preserveAspectRatio="xMidYMid meet"`
    );
}

/**
 * Rasterizes an SVG string onto a 2D canvas context at (width × height) via a Blob URL.
 * Preserves all SVG filters (#crayon-stroke, #vibrant-grade, #paper-texture), patterns, and masks.
 */
export async function rasterizeSvgToCanvas(
  svgMarkup: string,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<void> {
  const sizedSvg = prepareSvgFor16x9Canvas(svgMarkup, width, height);
  const blob = new Blob([sizedSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = TOKENS.colors.paperWarm;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => {
        reject(
          new Error('Failed to decode SVG frame into Image for canvas export')
        );
      };
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Triggers an automatic browser file download for a Blob URL.
 */
export function triggerBlobDownload(url: string, filename: string): void {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Patches ISO BMFF (`moov` -> `mvhd`, `tkhd`, `mdhd`, `mehd`) duration fields in an MP4 byte buffer.
 * Used as a safety net for MediaRecorder fragmented MP4 streams where `duration` is written as `0`
 * at the start of live capture, ensuring media players can always read total duration.
 */
export function patchMp4Duration(
  mp4Bytes: Uint8Array,
  durationSec: number
): Uint8Array {
  if (mp4Bytes.byteLength < 16 || !(durationSec > 0)) {
    return mp4Bytes;
  }

  const out = new Uint8Array(mp4Bytes.byteLength);
  out.set(mp4Bytes);
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);

  const CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia', 'mvex']);
  let movieTimescale = 1000;

  const readFourCC = (offset: number): string =>
    String.fromCharCode(
      out[offset],
      out[offset + 1],
      out[offset + 2],
      out[offset + 3]
    );

  const writeUint64BE = (offset: number, value: number): void => {
    const hi = Math.floor(value / 0x100000000);
    const lo = value >>> 0;
    view.setUint32(offset, hi, false);
    view.setUint32(offset + 4, lo, false);
  };

  const walkBoxes = (start: number, end: number): void => {
    let offset = start;
    while (offset + 8 <= end) {
      let size = view.getUint32(offset, false);
      const type = readFourCC(offset + 4);
      let headerSize = 8;

      if (size === 1) {
        if (offset + 16 > end) break;
        const hi = view.getUint32(offset + 8, false);
        const lo = view.getUint32(offset + 12, false);
        size = hi * 0x100000000 + lo;
        headerSize = 16;
      } else if (size === 0) {
        size = end - offset;
      }

      if (size < headerSize || offset + size > end) {
        break;
      }

      const bodyStart = offset + headerSize;
      const boxEnd = offset + size;

      if (CONTAINER_BOXES.has(type)) {
        walkBoxes(bodyStart, boxEnd);
      } else if (type === 'mvhd' && bodyStart + 4 <= boxEnd) {
        const version = view.getUint8(bodyStart);
        if (version === 0 && bodyStart + 20 <= boxEnd) {
          const ts = view.getUint32(bodyStart + 12, false) || 1000;
          movieTimescale = ts;
          const scaled = Math.max(1, Math.round(durationSec * ts));
          view.setUint32(bodyStart + 16, scaled, false);
        } else if (version === 1 && bodyStart + 32 <= boxEnd) {
          const ts = view.getUint32(bodyStart + 20, false) || 1000;
          movieTimescale = ts;
          const scaled = Math.max(1, Math.round(durationSec * ts));
          writeUint64BE(bodyStart + 24, scaled);
        }
      } else if (type === 'tkhd' && bodyStart + 4 <= boxEnd) {
        const version = view.getUint8(bodyStart);
        const scaled = Math.max(1, Math.round(durationSec * movieTimescale));
        if (version === 0 && bodyStart + 24 <= boxEnd) {
          view.setUint32(bodyStart + 20, scaled, false);
        } else if (version === 1 && bodyStart + 36 <= boxEnd) {
          writeUint64BE(bodyStart + 28, scaled);
        }
      } else if (type === 'mdhd' && bodyStart + 4 <= boxEnd) {
        const version = view.getUint8(bodyStart);
        if (version === 0 && bodyStart + 20 <= boxEnd) {
          const ts = view.getUint32(bodyStart + 12, false) || movieTimescale;
          const scaled = Math.max(1, Math.round(durationSec * ts));
          view.setUint32(bodyStart + 16, scaled, false);
        } else if (version === 1 && bodyStart + 32 <= boxEnd) {
          const ts = view.getUint32(bodyStart + 20, false) || movieTimescale;
          const scaled = Math.max(1, Math.round(durationSec * ts));
          writeUint64BE(bodyStart + 24, scaled);
        }
      } else if (type === 'mehd' && bodyStart + 4 <= boxEnd) {
        const version = view.getUint8(bodyStart);
        const scaled = Math.max(1, Math.round(durationSec * movieTimescale));
        if (version === 0 && bodyStart + 8 <= boxEnd) {
          view.setUint32(bodyStart + 4, scaled, false);
        } else if (version === 1 && bodyStart + 12 <= boxEnd) {
          writeUint64BE(bodyStart + 4, scaled);
        }
      }

      offset = boxEnd;
    }
  };

  walkBoxes(0, out.byteLength);
  return out;
}

/**
 * Primary fast-start, non-fragmented MP4 exporter using WebCodecs (`VideoEncoder` + `AudioEncoder`)
 * and `mp4-muxer` (`fastStart: 'in-memory'`).
 * Produces a 100% standard ISO BMFF `.mp4` with complete seek tables (`stts`, `stss`, `stsc`, `stsz`, `stco`)
 * and exact duration metadata so Windows Media Player displays total length and seeks smoothly.
 */
async function exportWithWebCodecsMp4Muxer(
  options: VideoExportOptions,
  preset: ResolutionPreset,
  startTimeSec: number,
  endTimeSec: number,
  exportDurationSec: number,
  fps: number,
  totalFrames: number,
  filename: string,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<VideoExportResult> {
  const {
    scene,
    renderOptions = {},
    resolution = '1080p',
    soundEngine,
    autoDownload = true,
    onProgress,
    signal,
  } = options;

  const mimeType = 'video/mp4';
  const avcCodec = preset.width >= 1920 ? 'avc1.420028' : 'avc1.42001f';
  const containerFps = 30;
  const audioSampleRate = 48000;

  // Check if AudioEncoder + AudioData are supported and we have a soundEngine
  let canEncodeAudio =
    Boolean(soundEngine) &&
    typeof AudioEncoder !== 'undefined' &&
    typeof AudioData !== 'undefined';

  if (canEncodeAudio && typeof AudioEncoder.isConfigSupported === 'function') {
    try {
      const support = await AudioEncoder.isConfigSupported({
        codec: 'mp4a.40.2',
        sampleRate: audioSampleRate,
        numberOfChannels: 2,
        bitrate: 128_000,
      });
      canEncodeAudio = Boolean(support.supported);
    } catch {
      canEncodeAudio = false;
    }
  }

  const audioBuffer =
    canEncodeAudio && soundEngine
      ? await soundEngine.renderOfflineAudio(
          scene.audioCues,
          startTimeSec,
          exportDurationSec,
          audioSampleRate,
          scene.audioClips
        )
      : null;

  const hasAudioTrack = Boolean(audioBuffer);
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width: preset.width,
      height: preset.height,
      frameRate: containerFps,
    },
    audio: hasAudioTrack
      ? {
          codec: 'aac',
          numberOfChannels: 2,
          sampleRate: audioSampleRate,
        }
      : undefined,
    fastStart: 'in-memory',
    firstTimestampBehavior: 'strict',
  });

  let encoderError: Error | null = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (err) => {
      encoderError =
        err instanceof Error ? err : new Error(String(err ?? 'VideoEncoder error'));
    },
  });

  videoEncoder.configure({
    codec: avcCodec,
    width: preset.width,
    height: preset.height,
    bitrate: preset.videoBitsPerSecond,
    framerate: containerFps,
  });

  let audioEncoder: AudioEncoder | null = null;
  if (hasAudioTrack && audioBuffer) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => {
        muxer.addAudioChunk(chunk, meta);
      },
      error: (err) => {
        encoderError =
          err instanceof Error
            ? err
            : new Error(String(err ?? 'AudioEncoder error'));
      },
    });
    audioEncoder.configure({
      codec: 'mp4a.40.2',
      sampleRate: audioSampleRate,
      numberOfChannels: 2,
      bitrate: 128_000,
    });

    // Feed planar Float32 stereo chunks into AudioEncoder
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 =
      audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : ch0;
    const totalSamples = audioBuffer.length;
    const chunkFrames = 1024;

    for (let offset = 0; offset < totalSamples; offset += chunkFrames) {
      const framesInChunk = Math.min(chunkFrames, totalSamples - offset);
      const planar = new Float32Array(framesInChunk * 2);
      planar.set(ch0.subarray(offset, offset + framesInChunk), 0);
      planar.set(ch1.subarray(offset, offset + framesInChunk), framesInChunk);

      const timestampUs = Math.round((offset / audioSampleRate) * 1_000_000);
      const audioData = new AudioData({
        format: 'f32-planar',
        sampleRate: audioSampleRate,
        numberOfFrames: framesInChunk,
        numberOfChannels: 2,
        timestamp: timestampUs,
        data: planar,
      });
      audioEncoder.encode(audioData);
      audioData.close();
    }
  }

  // Encode video frames at 30 FPS container rate while rasterizing only when the stepped 6 FPS frame changes
  const totalContainerFrames = Math.max(
    1,
    Math.round(exportDurationSec * containerFps)
  );
  const frameDurationUs = Math.round(1_000_000 / containerFps);
  let lastQuantizedFrameIndex = -1;
  let renderedSteppedFrames = 0;

  try {
    for (let cFrame = 0; cFrame < totalContainerFrames; cFrame++) {
      if (signal?.aborted) {
        onProgress?.({
          phase: 'cancelled',
          progress: 0,
          percent: 0,
          currentTimeSec: startTimeSec,
          durationSec: exportDurationSec,
          frameIndex: renderedSteppedFrames,
          totalFrames,
          resolution,
          width: preset.width,
          height: preset.height,
          mimeType,
          message: '16:9 video export cancelled.',
        });
        throw new Error('Video export cancelled');
      }
      if (encoderError) {
        throw encoderError;
      }

      const elapsedSec = cFrame / containerFps;
      const sceneTimeSec = Math.min(endTimeSec, startTimeSec + elapsedSec);
      const clock = evaluateSteppedClock(sceneTimeSec, fps, scene.durationSec);

      if (clock.frameIndex !== lastQuantizedFrameIndex) {
        lastQuantizedFrameIndex = clock.frameIndex;
        renderedSteppedFrames += 1;

        const { svg } = evaluateAndRenderScene(
          scene,
          sceneTimeSec,
          renderOptions
        );
        await rasterizeSvgToCanvas(svg, ctx, preset.width, preset.height);

        const progress = Math.max(
          0,
          Math.min(1, (cFrame + 1) / totalContainerFrames)
        );
        const percent = Math.round(progress * 100);
        onProgress?.({
          phase: 'recording',
          progress,
          percent,
          currentTimeSec: sceneTimeSec,
          durationSec: exportDurationSec,
          frameIndex: renderedSteppedFrames,
          totalFrames,
          resolution,
          width: preset.width,
          height: preset.height,
          mimeType,
          message: `Encoding 16:9 MP4 (${preset.width}×${preset.height})... ${percent}%`,
        });
      }

      const timestampUs = Math.round((cFrame * 1_000_000) / containerFps);
      const videoFrame = new VideoFrame(canvas, {
        timestamp: timestampUs,
        duration: frameDurationUs,
      });
      // Emit a sync keyframe every 15 frames (0.5s) for instant scrubbing in Windows Media Player
      const isKeyFrame = cFrame % 15 === 0;
      videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
      videoFrame.close();
    }

    onProgress?.({
      phase: 'finalizing',
      progress: 1,
      percent: 100,
      currentTimeSec: endTimeSec,
      durationSec: exportDurationSec,
      frameIndex: totalFrames,
      totalFrames,
      resolution,
      width: preset.width,
      height: preset.height,
      mimeType,
      message: `Finalizing ${filename}...`,
    });

    await videoEncoder.flush();
    if (audioEncoder) {
      await audioEncoder.flush();
    }
    if (encoderError) {
      throw encoderError;
    }

    muxer.finalize();
  } finally {
    if (videoEncoder.state !== 'closed') {
      try {
        videoEncoder.close();
      } catch {
        // Ignore
      }
    }
    if (audioEncoder && audioEncoder.state !== 'closed') {
      try {
        audioEncoder.close();
      } catch {
        // Ignore
      }
    }
  }

  const blob = new Blob([target.buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  if (autoDownload) {
    triggerBlobDownload(url, filename);
  }

  onProgress?.({
    phase: 'completed',
    progress: 1,
    percent: 100,
    currentTimeSec: endTimeSec,
    durationSec: exportDurationSec,
    frameIndex: totalFrames,
    totalFrames,
    resolution,
    width: preset.width,
    height: preset.height,
    mimeType,
    message: `Downloaded ${filename} (${preset.width}×${preset.height} 16:9)`,
  });

  return {
    blob,
    url,
    filename,
    mimeType,
    width: preset.width,
    height: preset.height,
    durationSec: exportDurationSec,
    frameCount: renderedSteppedFrames,
  };
}

/**
 * Renders and exports a full 16:9 widescreen video (1080p 1920×1080 or 720p 1280×720)
 * of `scene` (or a specific footage act range) with synchronized procedural WebAudio SFX,
 * then triggers a browser file download.
 *
 * Uses WebCodecs + `mp4-muxer` (`fastStart: 'in-memory'`) when available to write a standard,
 * non-fragmented `.mp4` with complete seek tables (`stbl`) and duration headers (`mvhd`/`tkhd`/`mdhd`),
 * falling back to `MediaRecorder` + `patchMp4Duration` in environments without WebCodecs.
 */
export async function exportSceneTo16x9Video(
  options: VideoExportOptions
): Promise<VideoExportResult> {
  const {
    scene,
    renderOptions = {},
    resolution = '1080p',
    fps = scene.fps ?? TOKENS.timing.fps,
    footageId = null,
    soundEngine,
    autoDownload = true,
    onProgress,
    signal,
  } = options;

  const preset = VIDEO_RESOLUTION_PRESETS[resolution];
  const startTimeSec = Math.max(0, options.startTimeSec ?? 0);
  const endTimeSec = Math.min(
    scene.durationSec,
    options.endTimeSec ?? scene.durationSec
  );
  const exportDurationSec = Math.max(0.5, endTimeSec - startTimeSec);
  const totalFrames = Math.max(1, Math.ceil(exportDurationSec * fps));
  const { mimeType, extension } = selectSupportedVideoMimeType();
  const filename = buildVideoFilename(
    scene.id,
    footageId,
    resolution,
    extension
  );

  if (typeof document === 'undefined') {
    throw new Error('Video export requires a browser DOM environment.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = preset.width;
  canvas.height = preset.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for 16:9 export.');
  }

  onProgress?.({
    phase: 'preparing',
    progress: 0,
    percent: 0,
    currentTimeSec: startTimeSec,
    durationSec: exportDurationSec,
    frameIndex: 0,
    totalFrames,
    resolution,
    width: preset.width,
    height: preset.height,
    mimeType,
    message: `Preparing 16:9 Video (${preset.width}×${preset.height})...`,
  });

  // Use WebCodecs + mp4-muxer fast-start MP4 pipeline when supported
  if (
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined'
  ) {
    let webCodecsSupported = true;
    if (typeof VideoEncoder.isConfigSupported === 'function') {
      try {
        const avcCodec = preset.width >= 1920 ? 'avc1.420028' : 'avc1.42001f';
        const support = await VideoEncoder.isConfigSupported({
          codec: avcCodec,
          width: preset.width,
          height: preset.height,
          bitrate: preset.videoBitsPerSecond,
          framerate: 30,
        });
        webCodecsSupported = Boolean(support.supported);
      } catch {
        webCodecsSupported = false;
      }
    }

    if (webCodecsSupported) {
      return await exportWithWebCodecsMp4Muxer(
        options,
        preset,
        startTimeSec,
        endTimeSec,
        exportDurationSec,
        fps,
        totalFrames,
        filename,
        canvas,
        ctx
      );
    }
  }

  // Fallback: MediaRecorder + ISO BMFF duration header patching
  const firstRender = evaluateAndRenderScene(
    scene,
    startTimeSec,
    renderOptions
  );
  await rasterizeSvgToCanvas(
    firstRender.svg,
    ctx,
    preset.width,
    preset.height
  );

  if (signal?.aborted) {
    throw new Error('Video export cancelled');
  }

  const canvasStream = canvas.captureStream(30);
  const audioStream = soundEngine?.createRecordingStream() ?? null;
  const tracks: MediaStreamTrack[] = [
    ...canvasStream.getVideoTracks(),
    ...(audioStream ? audioStream.getAudioTracks() : []),
  ];
  const combinedStream = new MediaStream(tracks);

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: preset.videoBitsPerSecond,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return await new Promise<VideoExportResult>((resolve, reject) => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let renderedFrameCount = 1;
    let lastRenderedFrameIndex = firstRender.frame.clock.frameIndex;
    let prevQuantizedTime = firstRender.frame.clock.quantizedTimeSec;
    let isDrawingFrame = false;

    const cleanup = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      soundEngine?.stopRecordingStream();
      canvasStream.getTracks().forEach((t) => t.stop());
    };

    const handleAbort = () => {
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // Ignore
        }
      }
      cleanup();
      onProgress?.({
        phase: 'cancelled',
        progress: 0,
        percent: 0,
        currentTimeSec: startTimeSec,
        durationSec: exportDurationSec,
        frameIndex: renderedFrameCount,
        totalFrames,
        resolution,
        width: preset.width,
        height: preset.height,
        mimeType,
        message: '16:9 video export cancelled.',
      });
      reject(new Error('Video export cancelled'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    recorder.onerror = () => {
      cleanup();
      reject(new Error('MediaRecorder encountered an error during export.'));
    };

    recorder.onstop = () => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
      cleanup();
      if (signal?.aborted) return;

      void (async () => {
        const rawBlob = new Blob(chunks, { type: mimeType });
        let finalBlob = rawBlob;

        if (extension === 'mp4' && typeof rawBlob.arrayBuffer === 'function') {
          try {
            const rawBytes = new Uint8Array(await rawBlob.arrayBuffer());
            const patched = patchMp4Duration(rawBytes, exportDurationSec);
            finalBlob = new Blob([patched.buffer as ArrayBuffer], {
              type: mimeType,
            });
          } catch {
            finalBlob = rawBlob;
          }
        }

        const url = URL.createObjectURL(finalBlob);
        if (autoDownload) {
          triggerBlobDownload(url, filename);
        }

        onProgress?.({
          phase: 'completed',
          progress: 1,
          percent: 100,
          currentTimeSec: endTimeSec,
          durationSec: exportDurationSec,
          frameIndex: totalFrames,
          totalFrames,
          resolution,
          width: preset.width,
          height: preset.height,
          mimeType,
          message: `Downloaded ${filename} (${preset.width}×${preset.height} 16:9)`,
        });

        resolve({
          blob: finalBlob,
          url,
          filename,
          mimeType,
          width: preset.width,
          height: preset.height,
          durationSec: exportDurationSec,
          frameCount: renderedFrameCount,
        });
      })();
    };

    const recordStartPerf = performance.now();
    recorder.start(100);

    // Trigger any initial audio cues at startTimeSec
    soundEngine?.triggerCuesForFrame(
      scene.audioCues,
      startTimeSec - 0.01,
      firstRender.frame.clock.quantizedTimeSec
    );
    // Trigger clips whose startTime falls at the initial frame
    soundEngine?.triggerClipsForFrame(
      scene.audioClips,
      startTimeSec - 0.01,
      firstRender.frame.clock.quantizedTimeSec
    );

    intervalId = setInterval(() => {
      if (signal?.aborted) return;

      const elapsedSec = (performance.now() - recordStartPerf) / 1000;
      const sceneTimeSec = Math.min(endTimeSec, startTimeSec + elapsedSec);
      const progress = Math.max(
        0,
        Math.min(1, elapsedSec / exportDurationSec)
      );
      const percent = Math.round(progress * 100);

      const clock = evaluateSteppedClock(sceneTimeSec, fps, scene.durationSec);

      if (clock.frameIndex !== lastRenderedFrameIndex && !isDrawingFrame) {
        lastRenderedFrameIndex = clock.frameIndex;
        renderedFrameCount += 1;

        soundEngine?.triggerCuesForFrame(
          scene.audioCues,
          prevQuantizedTime,
          clock.quantizedTimeSec
        );
        soundEngine?.triggerClipsForFrame(
          scene.audioClips,
          prevQuantizedTime,
          clock.quantizedTimeSec
        );
        prevQuantizedTime = clock.quantizedTimeSec;

        isDrawingFrame = true;
        const { svg } = evaluateAndRenderScene(
          scene,
          sceneTimeSec,
          renderOptions
        );
        void rasterizeSvgToCanvas(
          svg,
          ctx,
          preset.width,
          preset.height
        ).finally(() => {
          isDrawingFrame = false;
        });
      }

      onProgress?.({
        phase: 'recording',
        progress,
        percent,
        currentTimeSec: sceneTimeSec,
        durationSec: exportDurationSec,
        frameIndex: renderedFrameCount,
        totalFrames,
        resolution,
        width: preset.width,
        height: preset.height,
        mimeType,
        message: `Recording 16:9 Video (${preset.width}×${preset.height})... ${percent}%`,
      });

      if (elapsedSec >= exportDurationSec && !isDrawingFrame) {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        onProgress?.({
          phase: 'finalizing',
          progress: 1,
          percent: 100,
          currentTimeSec: endTimeSec,
          durationSec: exportDurationSec,
          frameIndex: totalFrames,
          totalFrames,
          resolution,
          width: preset.width,
          height: preset.height,
          mimeType,
          message: `Finalizing ${filename}...`,
        });
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }
    }, 33);
  });
}

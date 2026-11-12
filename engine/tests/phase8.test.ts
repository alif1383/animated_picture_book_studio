import { describe, it, expect } from 'vitest';
import { TOKENS } from '../src/theme/tokens';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';
import { MOONLIGHT_STORY_SCENE } from '../src/scenes/moonlightStory';
import { MEADOW_PARTY_SCENE } from '../src/scenes/meadowParty';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateCameraTrack } from '../src/engine/timeline';
import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import {
  VIDEO_RESOLUTION_PRESETS,
  selectSupportedVideoMimeType,
  buildVideoFilename,
  prepareSvgFor16x9Canvas,
  patchMp4Duration,
} from '../src/engine/videoExporter';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import { renderOchreCottage } from '../src/assets/buildings/ochreCottage';
import { renderCornerStore } from '../src/assets/buildings/cornerStore';
import { renderBirthdayStrawberry } from '../src/assets/characters/birthdayStrawberry';
import { renderSingingRadish } from '../src/assets/characters/singingRadish';
import { renderBirthdayCake } from '../src/assets/props/birthdayCake';
import { renderPartyConfetti } from '../src/assets/props/partyConfetti';
import { renderAnnotation } from '../src/assets/annotations/pencilAnnotation';

describe('Phase 8: 16:9 Widescreen Scenes (1280x720) & Full-Screen 16:9 Video + Audio Exporter', () => {
  it('enforces 16:9 widescreen aspect ratio (1280x720) across TOKENS.canvas and all 3 scenes', () => {
    expect(TOKENS.canvas.width).toBe(1280);
    expect(TOKENS.canvas.height).toBe(720);
    expect(TOKENS.canvas.viewBox).toBe('0 0 1280 720');
    expect(TOKENS.canvas.aspectRatio).toBe('16 / 9');
    expect(TOKENS.canvas.width / TOKENS.canvas.height).toBeCloseTo(16 / 9, 5);

    const scenes = [
      SHORT_SAMPLE_1_SCENE,
      MOONLIGHT_STORY_SCENE,
      MEADOW_PARTY_SCENE,
    ];
    for (const scene of scenes) {
      expect(scene.width).toBe(1280);
      expect(scene.height).toBe(720);
      const { svg } = evaluateAndRenderScene(scene, 2.0);
      expect(svg).toContain('viewBox="0 0 1280 720"');
      expect(svg).toContain(
        '<rect id="paper-base" x="0" y="0" width="1280" height="720"'
      );
    }

    // Verify camera zoom centers around the 16:9 midpoint (640, 360)
    const cam = evaluateCameraTrack(
      [{ time: 0, x: 0, y: 0, zoom: 2.0 }],
      0.0
    );
    expect(cam.transform).toContain('translate(-640, -360)');
    expect(cam.transform).toContain('scale(2)');
  });

  it('prepares 1080p (1920x1080) and 720p (1280x720) 16:9 SVG frames and filenames for video export', () => {
    expect(
      VIDEO_RESOLUTION_PRESETS['1080p'].width /
        VIDEO_RESOLUTION_PRESETS['1080p'].height
    ).toBeCloseTo(16 / 9, 5);
    expect(
      VIDEO_RESOLUTION_PRESETS['720p'].width /
        VIDEO_RESOLUTION_PRESETS['720p'].height
    ).toBeCloseTo(16 / 9, 5);

    const mime = selectSupportedVideoMimeType();
    expect(mime.extension).toBe('mp4');
    expect(mime.mimeType).toContain('video/mp4');

    const fname1080 = buildVideoFilename(
      'meadow_party_3',
      'cake',
      '1080p'
    );
    expect(fname1080).toBe(
      'picture-book-meadow_party_3-cake-1080p-16x9.mp4'
    );

    const { svg } = evaluateAndRenderScene(MEADOW_PARTY_SCENE, 9.0);
    const sized1080 = prepareSvgFor16x9Canvas(svg, 1920, 1080);
    expect(sized1080).toContain('width="1920"');
    expect(sized1080).toContain(
      'height="1080" preserveAspectRatio="xMidYMid meet"'
    );
    expect(sized1080).toContain('viewBox="0 0 1280 720"');
  });

  it('routes procedural WebAudio cues into a recording MediaStream even when muted', () => {
    const connectedTargets: unknown[] = [];
    const fakeStream = { id: 'mock-16x9-audio-stream' };
    const fakeRecordingDest = {
      stream: fakeStream,
      disconnect: () => {},
    };

    const createMockNode = () => ({
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      frequency: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      Q: { setValueAtTime: () => {} },
      type: 'sine',
      buffer: null,
      connect: (target: unknown) => {
        connectedTargets.push(target);
      },
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    });

    const g = globalThis as unknown as { AudioContext?: unknown };
    const prevAudioCtx = g.AudioContext;

    g.AudioContext = class MockAudioContext {
      public state = 'running';
      public currentTime = 0;
      public sampleRate = 8000;
      public destination = { id: 'speaker-dest' };
      public createGain() {
        return createMockNode();
      }
      public createOscillator() {
        return createMockNode();
      }
      public createBiquadFilter() {
        return createMockNode();
      }
      public createBufferSource() {
        return createMockNode();
      }
      public createBuffer(_channels: number, length: number) {
        return {
          getChannelData: () => new Float32Array(length),
        };
      }
      public createMediaStreamDestination() {
        return fakeRecordingDest;
      }
      public close() {
        return Promise.resolve();
      }
    };

    try {
      // Muted studio speakers, but recording stream active -> audio still routes to fakeRecordingDest!
      const sound = new PictureBookSoundEngine({ muted: true });
      const stream = sound.createRecordingStream();
      expect(stream).toBe(fakeStream);

      sound.playCue({
        time: 6.2,
        freq: 392,
        duration: 0.3,
        kind: 'birthday_song',
      });
      sound.playCue({
        time: 18.0,
        freq: 523.25,
        duration: 0.4,
        kind: 'confetti_pop',
      });

      expect(connectedTargets).toContain(fakeRecordingDest);
      sound.stopRecordingStream();
      sound.dispose();
    } finally {
      g.AudioContext = prevAudioCtx;
    }
  });

  it('renders scene audio cues offline via OfflineAudioContext for WebCodecs MP4 export', async () => {
    const scheduledTimes: number[] = [];
    const g = globalThis as unknown as { OfflineAudioContext?: unknown };
    const prevOfflineCtx = g.OfflineAudioContext;

    const createMockNode = () => ({
      gain: {
        setValueAtTime: (_v: number, t: number) => scheduledTimes.push(t),
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      frequency: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      Q: { setValueAtTime: () => {} },
      type: 'sine',
      buffer: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    });

    g.OfflineAudioContext = class MockOfflineAudioContext {
      public currentTime = 0;
      public sampleRate: number;
      public length: number;
      public destination = { id: 'offline-dest' };
      constructor(_channels: number, length: number, sampleRate: number) {
        this.length = length;
        this.sampleRate = sampleRate;
      }
      public createGain() {
        return createMockNode();
      }
      public createOscillator() {
        return createMockNode();
      }
      public createBiquadFilter() {
        return createMockNode();
      }
      public createBufferSource() {
        return createMockNode();
      }
      public createBuffer(_channels: number, len: number) {
        return {
          getChannelData: () => new Float32Array(len),
        };
      }
      public async startRendering() {
        return {
          numberOfChannels: 2,
          length: this.length,
          sampleRate: this.sampleRate,
          getChannelData: () => new Float32Array(this.length),
        };
      }
    };

    try {
      const sound = new PictureBookSoundEngine({ muted: true });
      const buffer = await sound.renderOfflineAudio(
        MEADOW_PARTY_SCENE.audioCues,
        6.0,
        10.0,
        48000
      );
      expect(buffer).not.toBeNull();
      expect(buffer?.sampleRate).toBe(48000);
      expect(buffer?.length).toBe(480000);
      expect(scheduledTimes.length).toBeGreaterThan(0);
    } finally {
      g.OfflineAudioContext = prevOfflineCtx;
    }
  });

  it('produces seekable fast-start MP4 headers via mp4-muxer and patches 0-duration moov headers via patchMp4Duration', () => {
    // 1. Verify mp4-muxer writes non-fragmented fast-start moov with mvhd & stbl seek tables
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: {
        codec: 'avc',
        width: 1280,
        height: 720,
        frameRate: 30,
      },
      fastStart: 'in-memory',
    });
    // Add 2 keyframes spanning 1.0s with valid AVC decoderConfig metadata
    const fakeAvcC = new Uint8Array([
      1, 66, 0, 31, 255, 225, 0, 4, 103, 66, 0, 31, 1, 0, 4, 104, 206, 60, 128,
    ]);
    muxer.addVideoChunkRaw(
      new Uint8Array([0, 0, 0, 2, 101, 136]),
      'key',
      0,
      500_000,
      {
        decoderConfig: {
          codec: 'avc1.42001f',
          codedWidth: 1280,
          codedHeight: 720,
          description: fakeAvcC,
          colorSpace: {
            primaries: 'bt709',
            transfer: 'bt709',
            matrix: 'bt709',
            fullRange: false,
          },
        },
      }
    );
    muxer.addVideoChunkRaw(
      new Uint8Array([0, 0, 0, 2, 101, 136]),
      'key',
      500_000,
      500_000
    );
    muxer.finalize();

    const muxedBytes = new Uint8Array(target.buffer);
    const ascii = String.fromCharCode(...muxedBytes);
    expect(ascii).toContain('ftyp');
    expect(ascii).toContain('moov');
    expect(ascii).toContain('mvhd');
    expect(ascii).toContain('tkhd');
    expect(ascii).toContain('mdhd');
    expect(ascii).toContain('stbl');
    expect(ascii).toContain('stts');
    expect(ascii).toContain('stsc');
    expect(ascii).toContain('stsz');
    expect(ascii).toContain('stco');

    // 2. Verify patchMp4Duration overwrites 0-duration mvhd, tkhd, mdhd, and mehd boxes
    const patched = patchMp4Duration(muxedBytes, 24.0);
    const patchedView = new DataView(
      patched.buffer,
      patched.byteOffset,
      patched.byteLength
    );
    const mvhdIdx = ascii.indexOf('mvhd');
    expect(mvhdIdx).toBeGreaterThan(0);
    const mvhdBody = mvhdIdx + 4;
    const version = patchedView.getUint8(mvhdBody);
    const timescale =
      version === 0
        ? patchedView.getUint32(mvhdBody + 12, false)
        : patchedView.getUint32(mvhdBody + 20, false);
    const duration =
      version === 0
        ? patchedView.getUint32(mvhdBody + 16, false)
        : patchedView.getUint32(mvhdBody + 28, false);
    expect(timescale).toBeGreaterThan(0);
    expect(duration).toBe(Math.round(24.0 * timescale));
  });

  it('exposes every building, character, prop, and annotation as an independent per-asset module', () => {
    const cottageSvg = renderOchreCottage({ kind: 'ochre_cottage' });
    const storeSvg = renderCornerStore({ kind: 'corner_store' });
    const strawberrySvg = renderBirthdayStrawberry({
      kind: 'birthday_strawberry',
      state: 'singing',
      frameIndex: 2,
    });
    const radishSvg = renderSingingRadish({
      kind: 'singing_radish',
      state: 'singing',
      frameIndex: 2,
    });
    const cakeSvg = renderBirthdayCake({
      kind: 'birthday_cake',
      lit: true,
      frameIndex: 1,
    });
    const confettiSvg = renderPartyConfetti({
      kind: 'party_confetti',
      count: 12,
      frameIndex: 3,
    });
    const noteSvg = renderAnnotation({
      text: 'HAPPY BIRTHDAY!',
      dashedPath: 'M 0 0 L 40 -20',
    });

    expect(cottageSvg).toContain('data-building="ochre_cottage"');
    expect(storeSvg).toContain('data-building="corner_store"');
    expect(strawberrySvg).toContain('data-character="birthday_strawberry"');
    expect(radishSvg).toContain('data-character="singing_radish"');
    expect(cakeSvg).toContain('data-prop="birthday_cake"');
    expect(confettiSvg).toContain('data-prop="party_confetti"');
    expect(noteSvg).toContain('HAPPY BIRTHDAY!');
  });
});

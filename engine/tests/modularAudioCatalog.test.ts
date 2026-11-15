import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AudioCueKind } from '../src/engine/schema';
import {
  AUDIO_CLIP_CATALOG,
  PROCEDURAL_SFX_MODULES,
  PROCEDURAL_SFX_REGISTRY,
  PictureBookSoundEngine,
} from '../src/audio/soundEngine';

const ALL_AUDIO_CUE_KINDS: readonly AudioCueKind[] = [
  'lullaby',
  'crayon_scribble',
  'chime',
  'party_horn',
  'confetti_pop',
  'cheer_applause',
  'candle_blow',
  'giggle',
  'birthday_song',
  'ocean_wave',
  'water_splash',
  'floatie_squeak',
  'fire_crackle',
  'dragon_fire',
  'spear_clink',
  'medieval_lute',
] as const;

describe('Modular One-File-Per-SFX Architecture & Master Audio Catalog', () => {
  it('registers all 16 procedural AudioCueKind modules with complete metadata and themes', () => {
    expect(PROCEDURAL_SFX_MODULES.length).toBe(16);
    for (const kind of ALL_AUDIO_CUE_KINDS) {
      const mod = PROCEDURAL_SFX_REGISTRY[kind];
      expect(mod).toBeDefined();
      expect(mod.kind).toBe(kind);
      expect(mod.title.length).toBeGreaterThan(3);
      expect(mod.description.length).toBeGreaterThan(20);
      expect(mod.themes.length).toBeGreaterThanOrEqual(3);
      expect(mod.defaultFreqHz).toBeGreaterThan(50);
      expect(mod.defaultDurationSec).toBeGreaterThan(0.05);
      expect(typeof mod.synthesize).toBe('function');
    }
  });

  it('registers all 5 pre-rendered .wav clips in AUDIO_CLIP_CATALOG with existing files and modular generator scripts', () => {
    expect(AUDIO_CLIP_CATALOG.length).toBe(5);
    const rootDir = process.cwd();
    for (const clip of AUDIO_CLIP_CATALOG) {
      expect(clip.id.length).toBeGreaterThan(3);
      expect(clip.title.length).toBeGreaterThan(5);
      expect(clip.description.length).toBeGreaterThan(20);
      expect(clip.themes.length).toBeGreaterThanOrEqual(3);
      expect(clip.durationSec).toBeGreaterThan(1.0);

      const wavPath = path.join(rootDir, 'public', 'audio', clip.filename);
      expect(fs.existsSync(wavPath)).toBe(true);
      expect(fs.statSync(wavPath).size).toBeGreaterThan(44);

      const genPath = path.join(rootDir, clip.generatorModule);
      expect(fs.existsSync(genPath)).toBe(true);
    }
  });

  it('documents every procedural AudioCueKind and every .wav clip in docs/AUDIO_CATALOG.md', () => {
    const catalogDocPath = path.join(process.cwd(), 'docs', 'AUDIO_CATALOG.md');
    expect(fs.existsSync(catalogDocPath)).toBe(true);
    const content = fs.readFileSync(catalogDocPath, 'utf8');

    for (const kind of ALL_AUDIO_CUE_KINDS) {
      expect(content).toContain(`'${kind}'`);
    }
    for (const clip of AUDIO_CLIP_CATALOG) {
      expect(content).toContain(clip.filename);
      expect(content).toContain(clip.generatorModule);
    }
  });

  it('delegates scheduleCueOnContext cleanly to each modular synthesizer without errors', () => {
    const engine = new PictureBookSoundEngine({ muted: false, masterVolume: 0.25 });
    const mockParam = () => ({
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    });
    const mockCtx = {
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      createGain: () => ({
        gain: mockParam(),
        connect: () => {},
      }),
      createOscillator: () => ({
        type: 'sine',
        frequency: mockParam(),
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
      createBiquadFilter: () => ({
        type: 'lowpass',
        frequency: mockParam(),
        Q: mockParam(),
        connect: () => {},
      }),
      createBuffer: (_ch: number, len: number, sr: number) => ({
        length: len,
        sampleRate: sr,
        getChannelData: () => new Float32Array(len),
      }),
      createBufferSource: () => ({
        buffer: null,
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
    } as unknown as BaseAudioContext;

    for (const kind of ALL_AUDIO_CUE_KINDS) {
      expect(() =>
        engine.scheduleCueOnContext(
          mockCtx,
          { time: 1.0, freq: 440, duration: 0.35, kind },
          1.0
        )
      ).not.toThrow();
    }
  });
});

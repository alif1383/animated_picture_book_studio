/**
 * Phase 9 Tests: AudioClipCue schema + offline rendering + URL parameter parsing
 * (parseStudioUrlParams: ?scene=, ?auto_export=1, ?resolution=)
 */
import { describe, it, expect } from 'vitest';
import type { SceneDefinition, AudioClipCue } from '../src/engine/schema';
import { parseStudioUrlParams, SCENE_REGISTRY } from '../src/ui/app';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';
import { MOONLIGHT_STORY_SCENE } from '../src/scenes/moonlightStory';
import { MEADOW_PARTY_SCENE } from '../src/scenes/meadowParty';

// ---------------------------------------------------------------------------
// AudioClipCue schema
// ---------------------------------------------------------------------------
describe('AudioClipCue schema', () => {
  it('AudioClipCue fields compile and round-trip correctly', () => {
    const clip: AudioClipCue = {
      id: 'test-clip',
      src: '/audio/narration.mp3',
      startTime: 5.0,
      duration: 8.5,
      offsetSec: 1.0,
      volume: 0.9,
      label: 'Act 1 narration',
    };

    expect(clip.id).toBe('test-clip');
    expect(clip.src).toBe('/audio/narration.mp3');
    expect(clip.startTime).toBe(5.0);
    expect(clip.duration).toBe(8.5);
    expect(clip.offsetSec).toBe(1.0);
    expect(clip.volume).toBe(0.9);
    expect(clip.label).toBe('Act 1 narration');
  });

  it('AudioClipCue accepts minimal required fields only', () => {
    const clip: AudioClipCue = {
      src: '/audio/music.mp3',
      startTime: 0,
    };
    expect(clip.src).toBe('/audio/music.mp3');
    expect(clip.startTime).toBe(0);
    expect(clip.duration).toBeUndefined();
    expect(clip.volume).toBeUndefined();
  });

  it('SceneDefinition accepts audioClips', () => {
    const clips: AudioClipCue[] = [
      { src: '/audio/a.mp3', startTime: 0 },
      { src: '/audio/b.mp3', startTime: 10, volume: 1.5 },
    ];
    const scene: SceneDefinition = {
      ...SHORT_SAMPLE_1_SCENE,
      id: 'test-with-clips',
      audioClips: clips,
    };
    expect(scene.audioClips).toHaveLength(2);
    expect(scene.audioClips![0].src).toBe('/audio/a.mp3');
    expect(scene.audioClips![1].volume).toBe(1.5);
  });

  it('SceneDefinition without audioClips has undefined field (backward compatible)', () => {
    expect(SHORT_SAMPLE_1_SCENE.audioClips).toBeUndefined();
    expect(MOONLIGHT_STORY_SCENE.audioClips).toBeUndefined();
    expect(MEADOW_PARTY_SCENE.audioClips).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SCENE_REGISTRY — keyed by scene.id in addition to short IDs
// ---------------------------------------------------------------------------
describe('SCENE_REGISTRY extended keys', () => {
  it('contains all 3 short ID keys', () => {
    expect(SCENE_REGISTRY['1']).toBe(SHORT_SAMPLE_1_SCENE);
    expect(SCENE_REGISTRY['2']).toBe(MOONLIGHT_STORY_SCENE);
    expect(SCENE_REGISTRY['3']).toBe(MEADOW_PARTY_SCENE);
  });

  it('contains scene.id keys for all built-in scenes', () => {
    expect(SCENE_REGISTRY[SHORT_SAMPLE_1_SCENE.id]).toBe(SHORT_SAMPLE_1_SCENE);
    expect(SCENE_REGISTRY[MOONLIGHT_STORY_SCENE.id]).toBe(MOONLIGHT_STORY_SCENE);
    expect(SCENE_REGISTRY[MEADOW_PARTY_SCENE.id]).toBe(MEADOW_PARTY_SCENE);
  });
});

// ---------------------------------------------------------------------------
// parseStudioUrlParams — ?scene= parameter
// ---------------------------------------------------------------------------
describe('parseStudioUrlParams ?scene=', () => {
  it('?scene=<short-id-key> selects the correct scene', () => {
    const result = parseStudioUrlParams('?scene=1');
    expect(result.scene).toBe(SHORT_SAMPLE_1_SCENE);
  });

  it('?scene=<scene.id> selects the correct scene by scene.id', () => {
    const result = parseStudioUrlParams(`?scene=${SHORT_SAMPLE_1_SCENE.id}`);
    expect(result.scene).toBe(SHORT_SAMPLE_1_SCENE);
  });

  it('?scene=<moonlight-scene-id> selects moonlight scene', () => {
    const result = parseStudioUrlParams(`?scene=${MOONLIGHT_STORY_SCENE.id}`);
    expect(result.scene).toBe(MOONLIGHT_STORY_SCENE);
  });

  it('?scene=<meadow-party-scene-id> selects meadow party scene', () => {
    const result = parseStudioUrlParams(`?scene=${MEADOW_PARTY_SCENE.id}`);
    expect(result.scene).toBe(MEADOW_PARTY_SCENE);
    expect(result.vibrant).toBe(true); // vibrantMode: true for meadow party
  });

  it('?scene= takes priority over ?short_sample=', () => {
    const result = parseStudioUrlParams(
      `?short_sample=1&scene=${MOONLIGHT_STORY_SCENE.id}`
    );
    expect(result.scene).toBe(MOONLIGHT_STORY_SCENE);
  });

  it('unknown ?scene= falls back to ?short_sample= default', () => {
    const result = parseStudioUrlParams('?scene=nonexistent-scene-xyz');
    // Should fall back to default scene 1 (SHORT_SAMPLE_1_SCENE)
    expect(result.scene).toBe(SHORT_SAMPLE_1_SCENE);
  });

  it('?scene= with autoplay=1 sets autoplay flag', () => {
    const result = parseStudioUrlParams(
      `?scene=${SHORT_SAMPLE_1_SCENE.id}&autoplay=1`
    );
    expect(result.autoplay).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseStudioUrlParams — ?auto_export=1
// ---------------------------------------------------------------------------
describe('parseStudioUrlParams ?auto_export=', () => {
  it('no ?auto_export defaults to false', () => {
    const result = parseStudioUrlParams('?short_sample=1');
    expect(result.autoExport).toBe(false);
  });

  it('?auto_export=1 sets autoExport to true', () => {
    const result = parseStudioUrlParams('?auto_export=1');
    expect(result.autoExport).toBe(true);
  });

  it('?auto_export=true sets autoExport to true', () => {
    const result = parseStudioUrlParams('?auto_export=true');
    expect(result.autoExport).toBe(true);
  });

  it('?auto_export=0 sets autoExport to false', () => {
    const result = parseStudioUrlParams('?auto_export=0');
    expect(result.autoExport).toBe(false);
  });

  it('?resolution=1080p sets autoExportResolution to 1080p', () => {
    const result = parseStudioUrlParams('?auto_export=1&resolution=1080p');
    expect(result.autoExportResolution).toBe('1080p');
  });

  it('?resolution=720p sets autoExportResolution to 720p', () => {
    const result = parseStudioUrlParams('?auto_export=1&resolution=720p');
    expect(result.autoExportResolution).toBe('720p');
  });

  it('no ?resolution defaults to 1080p', () => {
    const result = parseStudioUrlParams('?auto_export=1');
    expect(result.autoExportResolution).toBe('1080p');
  });

  it('?auto_export=1 combined with ?scene= works', () => {
    const result = parseStudioUrlParams(
      `?scene=${MEADOW_PARTY_SCENE.id}&auto_export=1&resolution=720p`
    );
    expect(result.scene).toBe(MEADOW_PARTY_SCENE);
    expect(result.autoExport).toBe(true);
    expect(result.autoExportResolution).toBe('720p');
  });
});

// ---------------------------------------------------------------------------
// parseStudioUrlParams — ParsedStudioParams backward compatibility
// ---------------------------------------------------------------------------
describe('parseStudioUrlParams backward compatibility', () => {
  it('still supports ?short_sample=1', () => {
    const result = parseStudioUrlParams('?short_sample=1');
    expect(result.scene).toBe(SHORT_SAMPLE_1_SCENE);
    expect(result.shortSample).toBe('1');
  });

  it('still supports ?short_sample=birthday', () => {
    const result = parseStudioUrlParams('?short_sample=birthday');
    expect(result.scene).toBe(MEADOW_PARTY_SCENE);
    expect(result.shortSample).toBe('3');
  });

  it('still supports ?footage= aliases', () => {
    const result = parseStudioUrlParams('?short_sample=1&footage=morning');
    expect(result.footageId).toBe('morning');
    expect(result.loopBounds).not.toBeNull();
    expect(result.loopBounds!.start).toBe(0);
    expect(result.loopBounds!.end).toBe(6);
  });
});

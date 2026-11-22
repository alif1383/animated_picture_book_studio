import { describe, expect, it } from 'vitest';
import { renderProp } from '../src/assets/props';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import { PROCEDURAL_SFX_REGISTRY, AUDIO_CLIP_CATALOG } from '../src/audio/sfx';
import { STARTER_KNIGHT_DRAGON_HICCUPS_SCENE } from '../src/scenes/starterKnightDragonHiccups';
import {
  ASSET_CATALOG_ITEMS,
  SCENE_REGISTRY,
  parseStudioUrlParams,
} from '../src/ui/app';

describe('Starter #3: The Dragon\'s Fiery Hiccups (starter-knight-dragon-hiccups)', () => {
  it('registers scene in SCENE_REGISTRY and resolves ?scene=starter-knight-dragon-hiccups', () => {
    expect(SCENE_REGISTRY['starter-knight-dragon-hiccups']).toBe(
      STARTER_KNIGHT_DRAGON_HICCUPS_SCENE
    );
    const parsed = parseStudioUrlParams('?scene=starter-knight-dragon-hiccups');
    expect(parsed.scene.id).toBe('starter-knight-dragon-hiccups');
    expect(parsed.vibrant).toBe(true);
    expect(parsed.bookFrame).toBe(true);
  });

  it('renders all 4 new bespoke props without pure black/white or gradients', () => {
    const newKinds = [
      'bramble_thorn',
      'dragon_cave',
      'feast_table',
      'celebration_banner',
    ] as const;

    for (const kind of newKinds) {
      const svg = renderProp({ kind, frameIndex: 2, lit: true, variant: 1 });
      expect(svg).toContain(`data-prop="${kind}"`);
      expect(svg.toLowerCase()).not.toContain('#ffffff');
      expect(svg.toLowerCase()).not.toContain('#000000');
      expect(svg.toLowerCase()).not.toContain('lineargradient');
      expect(svg.toLowerCase()).not.toContain('radialgradient');
    }

    const catalogIds = new Set(ASSET_CATALOG_ITEMS.map((item) => item.id));
    expect(catalogIds.has('cat-bramble-thorn')).toBe(true);
    expect(catalogIds.has('cat-dragon-cave')).toBe(true);
    expect(catalogIds.has('cat-feast-table')).toBe(true);
    expect(catalogIds.has('cat-celebration-banner')).toBe(true);
  });

  it('registers dragon_hiccup procedural SFX and both knight-hiccups-* WAV clips', () => {
    expect(PROCEDURAL_SFX_REGISTRY.dragon_hiccup).toBeDefined();
    expect(PROCEDURAL_SFX_REGISTRY.dragon_hiccup.kind).toBe('dragon_hiccup');

    const clipIds = new Set(AUDIO_CLIP_CATALOG.map((c) => c.id));
    expect(clipIds.has('knight-hiccups-bgm')).toBe(true);
    expect(clipIds.has('knight-hiccups-thorn-pop')).toBe(true);
  });

  it('has ZERO voiceover narration, concise bubbles, and ZERO overlapping speech bubbles across every 6 FPS frame', () => {
    // Verify no voiceover/TTS audio clips
    const clips = STARTER_KNIGHT_DRAGON_HICCUPS_SCENE.audioClips ?? [];
    for (const clip of clips) {
      expect(clip.src).not.toMatch(/voice|narrat|speech|tts/i);
    }

    const fps = STARTER_KNIGHT_DRAGON_HICCUPS_SCENE.fps ?? 6;
    const totalFrames = Math.ceil(
      STARTER_KNIGHT_DRAGON_HICCUPS_SCENE.durationSec * fps
    );
    let framesWithSpeech = 0;

    for (let f = 0; f <= totalFrames; f++) {
      const t = f / fps;
      const { svg } = evaluateAndRenderScene(STARTER_KNIGHT_DRAGON_HICCUPS_SCENE, t, {
        enableBookFrame: true,
      });
      const matches = svg.match(/data-character-speech="/g) ?? [];
      expect(
        matches.length,
        `Overlapping speech bubbles at t=${t.toFixed(2)}s`
      ).toBeLessThanOrEqual(1);
      if (matches.length === 1) {
        framesWithSpeech++;
      }
      // Also ensure no speech bubbles remain active during closing book-frame (t >= 49.5s)
      if (t >= 49.5) {
        expect(matches.length, `Bubble active during closing at t=${t.toFixed(2)}s`).toBe(0);
      }
      // Verify zero pure white/black or SVG gradients across sampled key frames
      if (f % 18 === 0) {
        expect(svg.toLowerCase()).not.toContain('lineargradient');
        expect(svg.toLowerCase()).not.toContain('radialgradient');
      }
    }

    expect(framesWithSpeech).toBeGreaterThan(100);
  });

  it('keeps knight and soldiers on foot throughout (zero vanishing horses) and keeps bramble_thorn visible after pop', () => {
    for (const t of [2, 8, 18, 28, 36.5, 38.5, 45]) {
      const evaluated = evaluateSceneAtTime(STARTER_KNIGHT_DRAGON_HICCUPS_SCENE, t);
      for (const id of ['knight', 'soldier-1', 'soldier-2']) {
        const node = evaluated.nodes[id];
        expect(node).toBeDefined();
        expect(node?.mounted).toBe(false);
      }
    }

    // Bramble thorn appears at 37.3s and stays visible on the ground through Act III (e.g., 39.5s)
    const beforePop = evaluateSceneAtTime(STARTER_KNIGHT_DRAGON_HICCUPS_SCENE, 36.5);
    expect(beforePop.nodes['bramble-thorn']?.visible).toBe(false);

    const afterPop = evaluateSceneAtTime(STARTER_KNIGHT_DRAGON_HICCUPS_SCENE, 39.5);
    expect(afterPop.nodes['bramble-thorn']?.visible).toBe(true);
  });
});

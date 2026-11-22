import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CHARACTER_SPEECH_ANCHORS,
  getCharacterSpeechAnchor,
  renderCharacter,
} from '../src/assets/characters';
import { renderProp } from '../src/assets/props';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { STARTER_BANDANA_DOG_SCENE } from '../src/scenes/starterBandanaDog';
import { ASSET_CATALOG_ITEMS, SCENE_REGISTRY } from '../src/ui/app';
import type { CharacterState } from '../src/engine/schema';

describe("Biscuit's Sunny Day — Photo-to-Crayon Dog Rig, Props, Voiceover & Scene", () => {
  const DOG_STATES: readonly CharacterState[] = [
    'idle',
    'sitting',
    'walking',
    'waving',
    'singing',
    'curious',
    'blinking',
    'sleeping',
  ];

  it('renders bandana_dog across all 8 states with crayon aesthetic and zero forbidden effects', () => {
    for (const state of DOG_STATES) {
      const svg = renderCharacter({
        kind: 'bandana_dog',
        state,
        frameIndex: 2,
      });
      expect(svg.length).toBeGreaterThan(200);
      expect(svg).toContain('url(#crayon-stroke)');
      expect(svg).toContain('pat-crayon-radish-red');
      expect(svg).toContain('pat-crayon-ochre');
      expect(svg.toLowerCase()).not.toContain('#ffffff');
      expect(svg.toLowerCase()).not.toContain('#000000');
      expect(svg.toLowerCase()).not.toContain('lineargradient');
      expect(svg.toLowerCase()).not.toContain('radialgradient');
    }
  });

  it('implements canonical +X forward 3/4 walking profile and registered speech anchors', () => {
    const walkSvg = renderCharacter({
      kind: 'bandana_dog',
      state: 'walking',
      frameIndex: 1,
    });
    expect(walkSvg).toContain('data-facing="right"');
    expect(walkSvg).toContain('data-walk-profile="true"');

    expect(CHARACTER_SPEECH_ANCHORS.bandana_dog).toEqual({ x: 10, y: -90 });
    expect(getCharacterSpeechAnchor('bandana_dog', { state: 'sitting' })).toEqual({
      x: 10,
      y: -90,
    });
    expect(getCharacterSpeechAnchor('bandana_dog', { state: 'sleeping' })).toEqual({
      x: 18,
      y: -44,
    });
  });

  it('animates Biscuit speaking mouth across stepped 6 FPS frames when singing or isSpeaking', () => {
    const f0 = renderCharacter({ kind: 'bandana_dog', state: 'singing', frameIndex: 0 });
    const f1 = renderCharacter({ kind: 'bandana_dog', state: 'singing', frameIndex: 1 });
    const f2 = renderCharacter({ kind: 'bandana_dog', state: 'singing', frameIndex: 2 });
    expect(f0).not.toBe(f1);
    expect(f1).not.toBe(f2);
    expect(f0).not.toBe(f2);

    const sitSpeak0 = renderCharacter({
      kind: 'bandana_dog',
      state: 'sitting',
      frameIndex: 0,
      isSpeaking: true,
    });
    const sitQuiet0 = renderCharacter({
      kind: 'bandana_dog',
      state: 'sitting',
      frameIndex: 0,
      isSpeaking: false,
    });
    expect(sitSpeak0).not.toBe(sitQuiet0);
  });

  it('renders custom dog props cleanly without forbidden colors or gradients', () => {
    for (const kind of ['dog_tennis_ball', 'dog_house', 'dog_bowl'] as const) {
      const svg = renderProp({ kind, frameIndex: 3 });
      expect(svg.length).toBeGreaterThan(100);
      expect(svg.toLowerCase()).not.toContain('#ffffff');
      expect(svg.toLowerCase()).not.toContain('#000000');
      expect(svg.toLowerCase()).not.toContain('lineargradient');
      expect(svg.toLowerCase()).not.toContain('radialgradient');
    }
  });

  it('registers starter-bandana-dog in SCENE_REGISTRY and adds new assets to ASSET_CATALOG_ITEMS', () => {
    expect(SCENE_REGISTRY['starter-bandana-dog']).toBe(STARTER_BANDANA_DOG_SCENE);
    const ids = new Set(ASSET_CATALOG_ITEMS.map((item) => item.id));
    expect(ids.has('cat-bandana-dog')).toBe(true);
    expect(ids.has('cat-dog-tennis-ball')).toBe(true);
    expect(ids.has('cat-dog-house')).toBe(true);
    expect(ids.has('cat-dog-bowl')).toBe(true);
  });

  it('verifies all audioClips WAV files exist on disk, never overlap voices, and finish cleanly before cuts', () => {
    const rootDir = process.cwd();
    const clips = STARTER_BANDANA_DOG_SCENE.audioClips ?? [];
    expect(clips.length).toBe(6);

    for (const clip of clips) {
      const filename = clip.src.replace(/^\/audio\//, '');
      const fullPath = path.join(rootDir, 'public', 'audio', filename);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(44);
    }

    const voices = clips
      .filter((c) => (c.id ?? '').startsWith('voice-'))
      .sort((a, b) => a.startTime - b.startTime);
    expect(voices.length).toBe(4);
    for (let i = 1; i < voices.length; i++) {
      const prevEnd = voices[i - 1].startTime + (voices[i - 1].duration ?? 0);
      expect(voices[i].startTime).toBeGreaterThanOrEqual(prevEnd + 0.25);
    }

    // Final voice finishes before bookFrame closing starts (38.0 - 3.5 = 34.5s)
    const lastVoice = voices[voices.length - 1];
    expect(lastVoice.startTime + (lastVoice.duration ?? 0)).toBeLessThanOrEqual(34.5);
  });

  it('renders cleanly across key moments with zero duplicate or overlapping speech bubbles', () => {
    const sampleTimes = [0.5, 4.5, 10.5, 14.5, 17.0, 20.5, 25.0, 29.5, 35.5, 37.5];
    for (const t of sampleTimes) {
      const { svg } = evaluateAndRenderScene(STARTER_BANDANA_DOG_SCENE, t);
      expect(svg).toContain('<svg');
      const speechMatches = svg.match(/data-character-speech="/g) ?? [];
      expect(speechMatches.length).toBeLessThanOrEqual(1);
    }
  });
});

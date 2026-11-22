import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { STARTER_MOONLIT_CAT_SCENE } from '../src/scenes/starterMoonlitCat';
import { SCENE_REGISTRY, ASSET_CATALOG_ITEMS } from '../src/ui/app';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import {
  CHARACTER_SPEECH_ANCHORS,
  renderCharacter,
} from '../src/assets/characters';
import { renderProp } from '../src/assets/props';
import { PROCEDURAL_SFX_REGISTRY } from '../src/audio/sfx';

describe("Mochi's Moonlit Garden (starter-moonlit-cat)", () => {
  it('registers starter-moonlit-cat in SCENE_REGISTRY without overwriting moonlit-garden', () => {
    expect(SCENE_REGISTRY['starter-moonlit-cat']).toBe(STARTER_MOONLIT_CAT_SCENE);
    expect(SCENE_REGISTRY['moonlit-garden']).toBeDefined();
    expect(SCENE_REGISTRY['moonlit-garden'].id).toBe('moonlit-garden');
    expect(STARTER_MOONLIT_CAT_SCENE.durationSec).toBe(30);
    expect(STARTER_MOONLIT_CAT_SCENE.acts.length).toBe(4);
    expect(
      ASSET_CATALOG_ITEMS.some((item) => item.id === 'cat-moonlit-cat')
    ).toBe(true);
    expect(
      ASSET_CATALOG_ITEMS.some((item) => item.id === 'cat-wind-chime-arbor')
    ).toBe(true);
    expect(
      ASSET_CATALOG_ITEMS.some((item) => item.id === 'cat-garden-fountain')
    ).toBe(true);
  });

  it('renders moonlit_cat, wind_chime_arbor, and garden_fountain with zero forbidden colors or gradients', () => {
    expect(CHARACTER_SPEECH_ANCHORS.moonlit_cat).toBeDefined();

    const samples = [
      renderCharacter({ kind: 'moonlit_cat', state: 'idle', frameIndex: 1 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'walking', frameIndex: 2 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'waving', frameIndex: 3 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 0 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 1 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 2 }),
      renderCharacter({ kind: 'moonlit_cat', state: 'sleeping', frameIndex: 4 }),
      renderProp({ kind: 'wind_chime_arbor', frameIndex: 2, lit: true }),
      renderProp({ kind: 'garden_fountain', frameIndex: 3, lit: true }),
    ];

    for (const svg of samples) {
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
      expect(svg).not.toContain('linearGradient');
      expect(svg).not.toContain('radialGradient');
    }

    // Stepped 6 FPS speaking mouth changes across consecutive frames
    const mouth0 = renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 0 });
    const mouth1 = renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 1 });
    const mouth2 = renderCharacter({ kind: 'moonlit_cat', state: 'singing', frameIndex: 2 });
    expect(mouth0).toContain('data-speaking-mouth="true"');
    expect(mouth0).toContain('data-mouth-phase="0"');
    expect(mouth1).toContain('data-mouth-phase="1"');
    expect(mouth2).toContain('data-mouth-phase="2"');
  });

  it('verifies every audioClip file exists, voice clips never overlap, and voices finish before scene/act cuts', () => {
    const clips = STARTER_MOONLIT_CAT_SCENE.audioClips ?? [];
    expect(clips.length).toBe(6);

    for (const clip of clips) {
      const rel = clip.src.replace(/^\//, '');
      const abs = path.join(process.cwd(), 'public', rel);
      expect(fs.existsSync(abs)).toBe(true);
    }

    const voiceClips = clips
      .filter((c) => c.id !== 'bgm-lullaby')
      .sort((a, b) => a.startTime - b.startTime);
    expect(voiceClips.length).toBe(5);

    for (let i = 1; i < voiceClips.length; i++) {
      const prev = voiceClips[i - 1];
      const curr = voiceClips[i];
      const prevEnd = prev.startTime + (prev.duration ?? 0);
      expect(curr.startTime).toBeGreaterThanOrEqual(prevEnd + 0.2);
    }

    // Zone cut at t=18.2s and closing bookFrame at t=27.0s have zero voice bleed
    for (const v of voiceClips) {
      const vEnd = v.startTime + (v.duration ?? 0);
      expect(vEnd).toBeLessThanOrEqual(27.0);
      if (v.startTime < 18.2) {
        expect(vEnd).toBeLessThanOrEqual(18.2);
      }
    }
  });

  it('renders Zone A -> Zone B transition, speaking mouth sync, and garden_wind_chime SFX cleanly', () => {
    expect(PROCEDURAL_SFX_REGISTRY.garden_wind_chime).toBeDefined();

    // Act I cat speaking window (t=9.5s)
    const evalCat1 = evaluateSceneAtTime(STARTER_MOONLIT_CAT_SCENE, 9.5);
    const cat1 = evalCat1.nodes['mochi-cat'];
    expect(cat1?.state).toBe('singing');
    expect(cat1?.speechText).toBe('Oooh, shiny chimes!');

    // Act II arbor lit & chimes ringing (t=13.5s)
    const renderedAct2 = evaluateAndRenderScene(STARTER_MOONLIT_CAT_SCENE, 13.5, {
      enableBookFrame: true,
    });
    expect(renderedAct2.svg).toContain('data-prop="wind_chime_arbor"');
    expect(renderedAct2.svg).not.toContain('data-prop="garden_fountain"');

    // Act III Zone B fountain clearing (t=24.5s)
    const renderedAct3 = evaluateAndRenderScene(STARTER_MOONLIT_CAT_SCENE, 24.5, {
      enableBookFrame: true,
    });
    expect(renderedAct3.svg).toContain('data-prop="garden_fountain"');
    expect(renderedAct3.svg).not.toContain('data-prop="wind_chime_arbor"');
    expect(renderedAct3.svg).toContain('Goodnight, Moon! ★');

    // Act IV sleeping cat + nightcap moon (t=27.5s)
    const evalAct4 = evaluateSceneAtTime(STARTER_MOONLIT_CAT_SCENE, 27.5);
    const cat4 = evalAct4.nodes['mochi-cat'];
    const moon4 = evalAct4.nodes['smiling-moon'];
    expect(cat4?.state).toBe('sleeping');
    expect(cat4?.speechText).toBe('');
    expect(moon4?.wearingNightcap).toBe(true);
  });
});

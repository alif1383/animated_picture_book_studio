import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CLASSIC_MOONLIT_CAT_SCENE } from '../src/scenes/classicMoonlitCat';
import { STARTER_MOONLIT_CAT_SCENE } from '../src/scenes/starterMoonlitCat';
import {
  SCENE_REGISTRY,
  getSwitcherScenes,
  parseStudioUrlParams,
} from '../src/ui/app';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import { renderCharacter } from '../src/assets/characters';
import { renderProp } from '../src/assets/props';
import { renderBuilding } from '../src/assets/buildings';
import type { CharacterState, PropKind } from '../src/engine/schema';
import { PROCEDURAL_SFX_REGISTRY } from '../src/audio/sfx';

describe("Mochi's Moonlit Garden — Classic 1970s–80s Hand-Drawn Cel (classic-moonlit-cat)", () => {
  it('registers classic-moonlit-cat alongside starter-moonlit-cat with classic_cel config and 12 FPS', () => {
    expect(SCENE_REGISTRY['classic-moonlit-cat']).toBe(CLASSIC_MOONLIT_CAT_SCENE);
    expect(SCENE_REGISTRY['starter-moonlit-cat']).toBe(STARTER_MOONLIT_CAT_SCENE);
    expect(getSwitcherScenes().map((s) => s.id)).toContain('classic-moonlit-cat');

    expect(CLASSIC_MOONLIT_CAT_SCENE.id).toBe('classic-moonlit-cat');
    expect(CLASSIC_MOONLIT_CAT_SCENE.artStyle).toBe('classic_cel');
    expect(CLASSIC_MOONLIT_CAT_SCENE.fps).toBe(12);
    expect(CLASSIC_MOONLIT_CAT_SCENE.durationSec).toBe(30);
    expect(CLASSIC_MOONLIT_CAT_SCENE.bookFrame).toBe(false);
    expect(CLASSIC_MOONLIT_CAT_SCENE.acts).toHaveLength(4);

    // Zero crayon_scribble SFX cues in classic cel scene
    const cues = CLASSIC_MOONLIT_CAT_SCENE.audioCues ?? [];
    expect(cues.length).toBeGreaterThan(0);
    expect(cues.some((c) => c.kind === 'crayon_scribble')).toBe(false);
    expect(cues.some((c) => c.kind === 'garden_wind_chime')).toBe(true);
    expect(PROCEDURAL_SFX_REGISTRY.garden_wind_chime).toBeDefined();

    // URL parameter parsing defaults to classic_cel and bookFrame=false
    const parsed = parseStudioUrlParams('?scene=classic-moonlit-cat');
    expect(parsed.scene).toBe(CLASSIC_MOONLIT_CAT_SCENE);
    expect(parsed.artStyle).toBe('classic_cel');
    expect(parsed.bookFrame).toBe(false);
  });

  it('dispatches all classic cel characters, building, and props cleanly with zero crayon/forbidden tokens', () => {
    const classicPropKinds: PropKind[] = [
      'tree',
      'street_lantern',
      'fluffy_cloud',
      'star_cluster',
      'meadow_flowers',
      'grass_patch',
      'music_notes',
      'wind_chime_arbor',
      'garden_fountain',
    ];

    const outputs: string[] = [
      renderCharacter({
        kind: 'moonlit_cat',
        state: 'idle',
        artStyle: 'classic_cel',
        frameIndex: 2,
      }),
      renderCharacter({
        kind: 'moon',
        state: 'curious',
        artStyle: 'classic_cel',
        frameIndex: 4,
      }),
      renderCharacter({
        kind: 'moon',
        state: 'sleepy',
        wearingNightcap: true,
        artStyle: 'classic_cel',
        frameIndex: 6,
      }),
      renderBuilding({
        kind: 'ochre_cottage',
        artStyle: 'classic_cel',
        windowLit: true,
        showLadder: false,
      }),
      renderBuilding({
        kind: 'ochre_cottage',
        artStyle: 'classic_cel',
        windowLit: false,
        showLadder: true,
      }),
      ...classicPropKinds.map((kind) =>
        renderProp({
          kind,
          artStyle: 'classic_cel',
          frameIndex: 3,
          lit: true,
          count: 6,
          variant: 1,
        })
      ),
    ];

    for (const svg of outputs) {
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('crayon-outline');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toContain('pat-marker-');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    // Fallback: assets without a classic_cel variant still render cleanly via crayon fallback
    const fallbackChar = renderCharacter({
      kind: 'bandana_dog',
      state: 'idle',
      artStyle: 'classic_cel',
      frameIndex: 0,
    });
    expect(fallbackChar.length).toBeGreaterThan(50);

    const fallbackProp = renderProp({
      kind: 'dog_tennis_ball',
      artStyle: 'classic_cel',
      frameIndex: 0,
    });
    expect(fallbackProp.length).toBeGreaterThan(50);

    const fallbackBuilding = renderBuilding({
      kind: 'corner_store',
      artStyle: 'classic_cel',
    });
    expect(fallbackBuilding.length).toBeGreaterThan(50);
  });

  it('renders classic moonlit_cat across all states, +X walk profile, 4-phase speaking mouths, and classic speech bubble', () => {
    const states: CharacterState[] = [
      'idle',
      'walking',
      'curious',
      'looking_up',
      'waving',
      'reaching',
      'singing',
      'sleeping',
      'sleepy',
      'blinking',
      'sitting',
    ];

    for (const state of states) {
      const svg = renderCharacter({
        kind: 'moonlit_cat',
        state,
        artStyle: 'classic_cel',
        frameIndex: 3,
      });
      expect(svg).toContain('data-character="moonlit_cat"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain(`data-state="${state}"`);
      expect(svg).toContain('data-part="cel-contact-shadow"');
      expect(svg).toContain('data-part="moon-charm"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
    }

    // Canonical +X walking profile
    const walkSvg = renderCharacter({
      kind: 'moonlit_cat',
      state: 'walking',
      artStyle: 'classic_cel',
      frameIndex: 4,
    });
    expect(walkSvg).toContain('data-facing="right"');
    expect(walkSvg).toContain('data-walk-profile="true"');

    // Waving paw reach
    const waveSvg = renderCharacter({
      kind: 'moonlit_cat',
      state: 'waving',
      artStyle: 'classic_cel',
      frameIndex: 2,
    });
    expect(waveSvg).toContain('data-part="waving-paw"');

    // Sleeping Zzz
    const sleepSvg = renderCharacter({
      kind: 'moonlit_cat',
      state: 'sleeping',
      artStyle: 'classic_cel',
      frameIndex: 6,
    });
    expect(sleepSvg).toContain('data-part="sleep-zzz"');

    // 4-phase 12 FPS cel lip-sync mouths (phase = Math.floor(frameIndex / 2) % 4)
    const phases = [0, 2, 4, 6].map((frameIndex) =>
      renderCharacter({
        kind: 'moonlit_cat',
        state: 'singing',
        artStyle: 'classic_cel',
        frameIndex,
      })
    );
    expect(phases[0]).toContain('data-speaking-mouth="true"');
    expect(phases[0]).toContain('data-mouth-phase="0"');
    expect(phases[1]).toContain('data-mouth-phase="1"');
    expect(phases[2]).toContain('data-mouth-phase="2"');
    expect(phases[3]).toContain('data-mouth-phase="3"');

    // Character-attached speech bubble passes artStyle='classic_cel' to renderAnnotation
    const spokenSvg = renderCharacter({
      kind: 'moonlit_cat',
      state: 'idle',
      artStyle: 'classic_cel',
      isSpeaking: true,
      speechText: 'Oooh, shiny chimes!',
      frameIndex: 2,
    });
    expect(spokenSvg).toContain('data-speaking-mouth="true"');
    expect(spokenSvg).toContain('Oooh, shiny chimes!');
    expect(spokenSvg).not.toContain('crayon-stroke');
  });

  it('renders full classic scene with zero #crayon-stroke, theatrical iris opening/story/closing, and Zone A -> B cut', () => {
    const sampleTimes = [0.5, 1.5, 5.0, 9.5, 13.5, 18.0, 18.4, 21.0, 24.5, 28.5, 29.8];

    for (const t of sampleTimes) {
      const out = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, t);
      expect(out.svg).toContain('data-art-style="classic_cel"');
      expect(out.svg).toContain('id="cel-backdrop"');
      expect(out.svg).toContain('id="layer-1a-painted-background"');
      expect(out.svg).toContain('id="layer-1b-acetate-cels"');
      expect(out.svg).toContain('id="bg-board-texture"');
      expect(out.svg).toContain('id="watercolor-wash-soft"');
      expect(out.svg).toContain('id="pencil-bg-sketch"');
      expect(out.svg).toContain('url(#watercolor-wash-soft)');
      expect(out.svg).toContain('url(#pencil-bg-sketch)');
      expect(out.svg).toContain('id="layer-3-film-composite"');
      expect(out.svg).toContain('id="xerox-ink"');
      expect(out.svg).toContain('id="cel-grade"');
      expect(out.svg).toContain('id="film-grain"');
      const bodySvg = out.svg.split('</defs>')[1] ?? out.svg;
      expect(bodySvg).not.toContain('crayon-stroke');
      expect(bodySvg).not.toContain('crayon-outline');
      expect(bodySvg).not.toContain('pat-crayon-');
      expect(bodySvg).not.toContain('pat-marker-');
      expect(out.svg).not.toContain('url(#crayon-stroke)');
      expect(out.svg).not.toContain('url(#crayon-outline)');
      expect(out.svg).not.toContain('url(#pat-crayon-');
      expect(out.svg).not.toContain('url(#pat-marker-');
      expect(out.bookFrame.enabled).toBe(false);
    }

    // Theatrical opening phase (t = 1.2s)
    const opening = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, 1.2);
    expect(opening.theatricalFrame?.enabled).toBe(true);
    expect(opening.theatricalFrame?.phase).toBe('opening');
    expect(opening.svg).toContain('id="theatrical-opening-title"');
    expect(opening.svg).toContain("Mochi's Moonlit Garden");

    // Story phase Act I speaking window (t = 9.5s)
    const evalCat1 = evaluateSceneAtTime(CLASSIC_MOONLIT_CAT_SCENE, 9.5, 12);
    expect(evalCat1.nodes['mochi-cat']?.state).toBe('singing');
    expect(evalCat1.nodes['mochi-cat']?.speechText).toBe('Oooh, shiny chimes!');
    const act1 = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, 9.5);
    expect(act1.theatricalFrame?.phase).toBe('story');
    expect(act1.svg).toContain('Oooh, shiny chimes!');

    // Zone A Act II arbor lit & cottage present, fountain absent (t = 13.5s)
    const act2 = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, 13.5);
    expect(act2.svg).toContain('data-prop="wind_chime_arbor"');
    expect(act2.svg).toContain('data-building="ochre_cottage"');
    expect(act2.svg).not.toContain('data-prop="garden_fountain"');

    // Zone B Act III fountain clearing present, arbor & cottage hidden (t = 24.5s)
    const act3 = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, 24.5);
    expect(act3.theatricalFrame?.phase).toBe('story');
    expect(act3.svg).toContain('data-prop="garden_fountain"');
    expect(act3.svg).not.toContain('data-prop="wind_chime_arbor"');
    expect(act3.svg).not.toContain('data-building="ochre_cottage"');
    expect(act3.svg).toContain('Goodnight, Moon! ★');

    // Act IV closing theatrical iris + "The End" card + sleeping Mochi + nightcap Moon (t = 28.8s)
    const evalAct4 = evaluateSceneAtTime(CLASSIC_MOONLIT_CAT_SCENE, 28.8, 12);
    expect(evalAct4.nodes['mochi-cat']?.state).toBe('sleeping');
    expect(evalAct4.nodes['mochi-cat']?.speechText).toBe('');
    expect(evalAct4.nodes['smiling-moon']?.wearingNightcap).toBe(true);

    const closing = evaluateAndRenderScene(CLASSIC_MOONLIT_CAT_SCENE, 28.8);
    expect(closing.theatricalFrame?.phase).toBe('closing');
    expect(closing.svg).toContain('id="theatrical-iris-matte"');
    expect(closing.svg).toContain('id="theatrical-ending-card"');
    expect(closing.svg).toContain('The End');
  });

  it('verifies all 6 WAV audioClips exist on disk, voices never overlap, and zero voice bleed across cuts', () => {
    const clips = CLASSIC_MOONLIT_CAT_SCENE.audioClips ?? [];
    expect(clips).toHaveLength(6);

    for (const clip of clips) {
      const rel = clip.src.replace(/^\//, '');
      const abs = path.join(process.cwd(), 'public', rel);
      expect(fs.existsSync(abs)).toBe(true);
    }

    const voiceClips = clips
      .filter((c) => c.id !== 'bgm-lullaby')
      .sort((a, b) => a.startTime - b.startTime);
    expect(voiceClips).toHaveLength(5);

    for (let i = 1; i < voiceClips.length; i++) {
      const prev = voiceClips[i - 1];
      const curr = voiceClips[i];
      const prevEnd = prev.startTime + (prev.duration ?? 0);
      expect(curr.startTime).toBeGreaterThanOrEqual(prevEnd + 0.2);
    }

    // Zero voice bleed across Zone A->B cut (18.2s) and theatrical closing iris (27.0s)
    for (const v of voiceClips) {
      const vEnd = v.startTime + (v.duration ?? 0);
      expect(vEnd).toBeLessThanOrEqual(27.0);
      if (v.startTime < 18.2) {
        expect(vEnd).toBeLessThanOrEqual(18.2);
      }
    }
  });
});

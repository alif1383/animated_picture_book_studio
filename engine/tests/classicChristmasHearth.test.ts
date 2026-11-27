import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CLASSIC_CHRISTMAS_HEARTH_SCENE } from '../src/scenes/classicChristmasHearth';
import {
  SCENE_REGISTRY,
  getSwitcherScenes,
  parseStudioUrlParams,
} from '../src/ui/app';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import {
  CHARACTER_SPEECH_ANCHORS,
  renderCharacter,
} from '../src/assets/characters';
import { renderProp } from '../src/assets/props';
import { renderBuilding } from '../src/assets/buildings';
import type { CharacterState, PropKind } from '../src/engine/schema';
import { PROCEDURAL_SFX_REGISTRY } from '../src/audio/sfx';

describe("Barnaby's Christmas Hearth — Classic Cel Winter Short (classic-christmas-hearth)", () => {
  it('registers classic-christmas-hearth with classic_cel config, 12 FPS, /classic/christmas-hearth route, and sleigh_bell SFX', () => {
    expect(SCENE_REGISTRY['classic-christmas-hearth']).toBe(
      CLASSIC_CHRISTMAS_HEARTH_SCENE
    );
    expect(SCENE_REGISTRY['christmas-hearth']).toBe(
      CLASSIC_CHRISTMAS_HEARTH_SCENE
    );
    expect(getSwitcherScenes('classic_cel').map((s) => s.id)).toContain(
      'classic-christmas-hearth'
    );

    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.id).toBe('classic-christmas-hearth');
    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.artStyle).toBe('classic_cel');
    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.fps).toBe(12);
    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.durationSec).toBe(48);
    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.bookFrame).toBe(false);
    expect(CLASSIC_CHRISTMAS_HEARTH_SCENE.acts).toHaveLength(4);

    // Zero crayon_scribble SFX cues; sleigh_bell registered and used
    const cues = CLASSIC_CHRISTMAS_HEARTH_SCENE.audioCues ?? [];
    expect(cues.length).toBeGreaterThan(0);
    expect(cues.some((c) => c.kind === 'crayon_scribble')).toBe(false);
    expect(cues.some((c) => c.kind === 'sleigh_bell')).toBe(true);
    expect(PROCEDURAL_SFX_REGISTRY.sleigh_bell).toBeDefined();

    // Route parsing for /classic/christmas-hearth and /classic/classic-christmas-hearth
    const parsedAlias = parseStudioUrlParams(
      '',
      undefined,
      '/classic/christmas-hearth'
    );
    expect(parsedAlias.scene).toBe(CLASSIC_CHRISTMAS_HEARTH_SCENE);
    expect(parsedAlias.artStyle).toBe('classic_cel');
    expect(parsedAlias.bookFrame).toBe(false);
    expect(parsedAlias.canonicalPath).toBe('/classic/christmas-hearth');

    const parsedId = parseStudioUrlParams(
      '',
      undefined,
      '/classic/classic-christmas-hearth'
    );
    expect(parsedId.scene).toBe(CLASSIC_CHRISTMAS_HEARTH_SCENE);
    expect(parsedId.canonicalPath).toBe('/classic/classic-christmas-hearth');
  });

  it('renders all 3 original characters (old_badger, red_squirrel, snow_robin) with flat cel paint, Xerox ink, +X walk profiles, and 4-phase speaking mouths', () => {
    expect(CHARACTER_SPEECH_ANCHORS.old_badger).toBeDefined();
    expect(CHARACTER_SPEECH_ANCHORS.red_squirrel).toBeDefined();
    expect(CHARACTER_SPEECH_ANCHORS.snow_robin).toBeDefined();

    const badgerStates: CharacterState[] = [
      'idle',
      'grumpy',
      'walking',
      'curious',
      'waving',
      'singing',
    ];
    for (const state of badgerStates) {
      const svg = renderCharacter({
        kind: 'old_badger',
        state,
        artStyle: 'classic_cel',
        frameIndex: 2,
      });
      expect(svg).toContain('data-character="old_badger"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    const squirrelStates: CharacterState[] = [
      'idle',
      'walking',
      'waving',
      'curious',
      'singing',
    ];
    for (const state of squirrelStates) {
      const svg = renderCharacter({
        kind: 'red_squirrel',
        state,
        holdingSheep: state === 'walking',
        artStyle: 'classic_cel',
        frameIndex: 3,
      });
      expect(svg).toContain('data-character="red_squirrel"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    const robinStates: CharacterState[] = [
      'idle',
      'walking',
      'curious',
      'waving',
      'singing',
    ];
    for (const state of robinStates) {
      const svg = renderCharacter({
        kind: 'snow_robin',
        state,
        artStyle: 'classic_cel',
        frameIndex: 4,
      });
      expect(svg).toContain('data-character="snow_robin"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    // +X walk profiles
    for (const kind of ['old_badger', 'red_squirrel', 'snow_robin'] as const) {
      const walkSvg = renderCharacter({
        kind,
        state: 'walking',
        artStyle: 'classic_cel',
        frameIndex: 2,
      });
      expect(walkSvg).toContain('data-facing="right"');
      expect(walkSvg).toContain('data-walk-profile="true"');
    }

    // 4-phase 12 FPS cel lip-sync mouths (including grumpy+isSpeaking on Barnaby!)
    for (const [idx, frameIndex] of [0, 2, 4, 6].entries()) {
      const barnabySpoken = renderCharacter({
        kind: 'old_badger',
        state: 'grumpy',
        isSpeaking: true,
        artStyle: 'classic_cel',
        frameIndex,
      });
      expect(barnabySpoken).toContain('data-speaking-mouth="true"');
      expect(barnabySpoken).toContain(`data-mouth-phase="${idx}"`);

      const pippinSpoken = renderCharacter({
        kind: 'red_squirrel',
        state: 'singing',
        artStyle: 'classic_cel',
        frameIndex,
      });
      expect(pippinSpoken).toContain('data-speaking-mouth="true"');
      expect(pippinSpoken).toContain(`data-mouth-phase="${idx}"`);
    }
  });

  it('renders all 5 new Victorian props and snowy_cottage with zero gradients, neon halos, or forbidden colors', () => {
    const xmasProps: PropKind[] = [
      'hearth_fireplace',
      'christmas_tree',
      'victorian_desk',
      'snowy_window',
      'falling_snow',
    ];

    const outputs = [
      renderBuilding({
        kind: 'snowy_cottage',
        artStyle: 'classic_cel',
        windowLit: true,
      }),
      renderProp({
        kind: 'hearth_fireplace',
        artStyle: 'classic_cel',
        lit: false,
        frameIndex: 1,
      }),
      ...xmasProps.map((kind) =>
        renderProp({
          kind,
          artStyle: 'classic_cel',
          lit: true,
          count: 24,
          frameIndex: 4,
        })
      ),
    ];

    for (const svg of outputs) {
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('cel-soft-glow');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    // Hearth cold vs lit transitions cleanly
    const coldHearth = renderProp({
      kind: 'hearth_fireplace',
      artStyle: 'classic_cel',
      lit: false,
      frameIndex: 2,
    });
    const litHearth = renderProp({
      kind: 'hearth_fireplace',
      artStyle: 'classic_cel',
      lit: true,
      frameIndex: 2,
    });
    expect(coldHearth).toContain('data-lit="false"');
    expect(litHearth).toContain('data-lit="true"');
  });

  it('renders all 3 zones (A -> B -> C), scaled-up Zone B interior (>= 1.65), hearth ignition, speaking:true lip-sync with ZERO speech bubbles, and zero #crayon-stroke', () => {
    const sampleTimes = [1.2, 6.0, 11.1, 13.5, 18.5, 19.5, 25.5, 31.0, 31.5, 36.1, 40.5, 46.8];

    for (const t of sampleTimes) {
      const out = evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, t);
      expect(out.svg).toContain('data-art-style="classic_cel"');
      expect(out.svg).toContain('id="layer-1a-painted-background"');
      expect(out.svg).toContain('id="layer-1b-acetate-cels"');
      expect(out.svg).toContain('id="bg-board-texture"');
      expect(out.svg).toContain('id="watercolor-wash-soft"');
      expect(out.svg).toContain('id="pencil-bg-sketch"');
      expect(out.svg).toContain('id="xerox-ink"');
      expect(out.svg).toContain('id="film-grain"');
      expect(out.bookFrame.enabled).toBe(false);

      // ZERO comic speech bubbles anywhere in Barnaby's Christmas Hearth
      expect(out.svg).not.toContain('data-character-speech');

      const bodySvg = out.svg.split('</defs>')[1] ?? out.svg;
      expect(bodySvg).not.toContain('crayon-stroke');
      expect(bodySvg).not.toContain('pat-crayon-');
      expect(bodySvg).not.toContain('pat-marker-');
    }

    // Opening theatrical title card (t = 1.2s)
    const opening = evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, 1.2);
    expect(opening.theatricalFrame?.phase).toBe('opening');
    expect(opening.svg).toContain('id="theatrical-opening-title"');
    expect(opening.svg).toContain("Barnaby's Christmas Hearth");

    // Zone A (t = 6.0s): snowy cottages, snowfall, Pippin walking +X, Barnaby hidden, silent mouths
    const zoneA = evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, 6.0);
    expect(zoneA.svg).toContain('data-building="snowy_cottage"');
    expect(zoneA.svg).toContain('data-prop="falling_snow"');
    expect(zoneA.svg).toContain('data-character="red_squirrel"');
    expect(zoneA.svg).not.toContain('data-character="old_badger"');
    expect(zoneA.svg).not.toContain('data-prop="hearth_fireplace"');
    expect(zoneA.svg).not.toContain('data-prop="christmas_tree"');
    expect(zoneA.svg).not.toContain('data-speaking-mouth="true"');

    // Zone B intimate interior scales (>= 1.65) + Pippin speaking mouth active at t=13.5s & t=25.5s
    const evalZoneBPippin1 = evaluateSceneAtTime(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      13.5,
      12
    );
    expect(evalZoneBPippin1.nodes['zb-window']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['zb-fireplace']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['zb-desk']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['barnaby-badger']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['pippin-squirrel']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['bramble-robin']?.scale).toBeGreaterThanOrEqual(1.65);
    expect(evalZoneBPippin1.nodes['pippin-squirrel']?.speaking).toBe(true);
    expect(evalZoneBPippin1.nodes['barnaby-badger']?.speaking).toBe(false);

    const pippin1Svg = evaluateAndRenderScene(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      13.5
    ).svg;
    expect(pippin1Svg).toContain('data-speaking-mouth="true"');
    const pippin2Svg = evaluateAndRenderScene(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      25.5
    ).svg;
    expect(pippin2Svg).toContain('data-speaking-mouth="true"');

    // Silent gap between dialogue lines (t = 16.4s): no speaking mouth active
    const silentGapSvg = evaluateAndRenderScene(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      16.4
    ).svg;
    expect(silentGapSvg).not.toContain('data-speaking-mouth="true"');

    // Zone B cold hearth + Barnaby grumpy speaking via speaking:true (t = 18.5s)
    const evalZoneBCold = evaluateSceneAtTime(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      18.5,
      12
    );
    expect(evalZoneBCold.nodes['zb-fireplace']?.lit).toBe(false);
    expect(evalZoneBCold.nodes['barnaby-badger']?.state).toBe('grumpy');
    expect(evalZoneBCold.nodes['barnaby-badger']?.speaking).toBe(true);
    expect(evalZoneBCold.nodes['barnaby-badger']?.speechText ?? '').toBe('');

    const zoneBCold = evaluateAndRenderScene(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      18.5
    );
    expect(zoneBCold.svg).toContain('data-speaking-mouth="true"');
    expect(zoneBCold.svg).toContain('data-prop="hearth_fireplace"');
    expect(zoneBCold.svg).toContain('data-prop="snowy_window"');
    expect(zoneBCold.svg).toContain('data-prop="victorian_desk"');
    expect(zoneBCold.svg).not.toContain('data-building="snowy_cottage"');
    expect(zoneBCold.svg).not.toContain('data-prop="christmas_tree"');

    // Zone B lit hearth + Barnaby joyful speaking via speaking:true (t = 31.0s)
    const evalZoneBLit = evaluateSceneAtTime(
      CLASSIC_CHRISTMAS_HEARTH_SCENE,
      31.0,
      12
    );
    expect(evalZoneBLit.nodes['zb-fireplace']?.lit).toBe(true);
    expect(evalZoneBLit.nodes['barnaby-badger']?.state).toBe('waving');
    expect(evalZoneBLit.nodes['barnaby-badger']?.speaking).toBe(true);
    expect(
      evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, 31.0).svg
    ).toContain('data-speaking-mouth="true"');

    // Zone C starlit square + glowing Christmas tree + all 3 characters + silent mouths (t = 40.5s)
    const zoneC = evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, 40.5);
    expect(zoneC.svg).toContain('data-prop="christmas_tree"');
    expect(zoneC.svg).toContain('data-building="snowy_cottage"');
    expect(zoneC.svg).toContain('data-prop="falling_snow"');
    expect(zoneC.svg).toContain('data-character="old_badger"');
    expect(zoneC.svg).toContain('data-character="red_squirrel"');
    expect(zoneC.svg).toContain('data-character="snow_robin"');
    expect(zoneC.svg).not.toContain('data-prop="hearth_fireplace"');
    expect(zoneC.svg).not.toContain('data-prop="victorian_desk"');
    expect(zoneC.svg).not.toContain('data-speaking-mouth="true"');

    // Closing theatrical iris + "The End" card (t = 46.8s)
    const closing = evaluateAndRenderScene(CLASSIC_CHRISTMAS_HEARTH_SCENE, 46.8);
    expect(closing.theatricalFrame?.phase).toBe('closing');
    expect(closing.svg).toContain('id="theatrical-iris-matte"');
    expect(closing.svg).toContain('id="theatrical-ending-card"');
    expect(closing.svg).toContain('The End');
  });

  it('verifies all audioClips WAV files exist on disk, voices never overlap, and zero voice bleed across cuts', () => {
    const clips = CLASSIC_CHRISTMAS_HEARTH_SCENE.audioClips ?? [];
    expect(clips).toHaveLength(8); // 1 BGM + 1 ambient hearth crackle + 6 Gemini TTS voices

    for (const clip of clips) {
      const rel = clip.src.replace(/^\//, '');
      const abs = path.join(process.cwd(), 'public', rel);
      expect(fs.existsSync(abs)).toBe(true);
      expect(fs.statSync(abs).size).toBeGreaterThan(44);
    }

    const voiceClips = clips
      .filter((c) => c.id?.startsWith('xmas-'))
      .sort((a, b) => a.startTime - b.startTime);
    expect(voiceClips).toHaveLength(6);

    for (let i = 1; i < voiceClips.length; i++) {
      const prev = voiceClips[i - 1];
      const curr = voiceClips[i];
      const prevEnd = prev.startTime + (prev.duration ?? 0);
      expect(curr.startTime).toBeGreaterThanOrEqual(prevEnd + 0.3);
    }

    // Zero voice bleed across Zone A->B cut (11.2s), Zone B->C cut (36.2s), and closing iris (45.0s)
    for (const v of voiceClips) {
      const vEnd = v.startTime + (v.duration ?? 0);
      expect(vEnd).toBeLessThanOrEqual(45.0);
      if (v.startTime < 11.2) {
        expect(vEnd).toBeLessThanOrEqual(11.2);
      }
      if (v.startTime >= 11.2 && v.startTime < 36.2) {
        expect(vEnd).toBeLessThanOrEqual(36.2);
      }
    }
  });
});

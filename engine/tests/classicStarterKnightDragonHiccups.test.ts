import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKENS } from '../src/theme/tokens';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import { renderCharacter } from '../src/assets/characters';
import { renderBuilding } from '../src/assets/buildings';
import { renderProp } from '../src/assets/props';
import { CLASSIC_CEL_CHARACTER_RENDERERS } from '../src/assets/classicCel/characters';
import { CLASSIC_CEL_BUILDING_RENDERERS } from '../src/assets/classicCel/buildings';
import { CLASSIC_CEL_PROP_RENDERERS } from '../src/assets/classicCel/props';
import { CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE } from '../src/scenes/classicStarterKnightDragonHiccups';
import { STARTER_KNIGHT_DRAGON_HICCUPS_SCENE } from '../src/scenes/starterKnightDragonHiccups';
import {
  getSwitcherScenes,
  parseStudioUrlParams,
  SCENE_REGISTRY,
} from '../src/ui/app';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function stripDefs(svg: string): string {
  return svg.replace(/<defs>[\s\S]*?<\/defs>/, '');
}

describe('Classic Hand-Drawn Cel — Starter #3 ("The Dragon\'s Fiery Hiccups")', () => {
  it('registers classic-starter-knight-dragon-hiccups alongside intact crayon starter & routes /classic/starter-knight-dragon-hiccups', () => {
    expect(SCENE_REGISTRY['classic-starter-knight-dragon-hiccups']).toBe(
      CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE
    );
    expect(SCENE_REGISTRY['starter-knight-dragon-hiccups']).toBe(
      STARTER_KNIGHT_DRAGON_HICCUPS_SCENE
    );
    expect(
      getSwitcherScenes('classic_cel').map((s) => s.id)
    ).toContain('classic-starter-knight-dragon-hiccups');

    const viaAlias = parseStudioUrlParams(
      '',
      undefined,
      '/classic/starter-knight-dragon-hiccups'
    );
    expect(viaAlias.scene).toBe(CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE);
    expect(viaAlias.artStyle).toBe('classic_cel');
    expect(viaAlias.bookFrame).toBe(false);
    expect(viaAlias.isClassicRoute).toBe(true);
    expect(viaAlias.canonicalPath).toBe('/classic/starter-knight-dragon-hiccups');

    const viaFullId = parseStudioUrlParams(
      '',
      undefined,
      '/classic/classic-starter-knight-dragon-hiccups'
    );
    expect(viaFullId.scene).toBe(CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE);
    expect(viaFullId.artStyle).toBe('classic_cel');
    expect(viaFullId.bookFrame).toBe(false);
    expect(viaFullId.canonicalPath).toBe(
      '/classic/classic-starter-knight-dragon-hiccups'
    );

    const viaQuery = parseStudioUrlParams(
      '?scene=classic-starter-knight-dragon-hiccups'
    );
    expect(viaQuery.scene).toBe(CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE);
    expect(viaQuery.artStyle).toBe('classic_cel');
    expect(viaQuery.bookFrame).toBe(false);
  });

  it('locks classic_cel 12 FPS theatrical metadata, zero crayon_scribble cues, zero voiceover clips, and valid WAV files', () => {
    const scene = CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE;
    expect(scene.artStyle).toBe('classic_cel');
    expect(scene.fps).toBe(TOKENS.classicCel.timing.fps);
    expect(scene.fps).toBe(12);
    expect(scene.bookFrame).toBe(false);
    expect(scene.theatricalFrame).toBeTruthy();
    if (scene.theatricalFrame && typeof scene.theatricalFrame === 'object') {
      expect(scene.theatricalFrame.enabled).toBe(true);
      expect(scene.theatricalFrame.mode).toBe('iris');
    }
    expect(scene.acts).toHaveLength(4);

    // Zero crayon_scribble cues in classic_cel; dragon_hiccup & medieval SFX present
    const cueKinds = (scene.audioCues ?? []).map((c) => c.kind);
    expect(cueKinds).not.toContain('crayon_scribble');
    expect(cueKinds).toContain('dragon_hiccup');
    expect(cueKinds).toContain('spear_clink');
    expect(cueKinds).toContain('cheer_applause');

    // Strictly zero voiceover/TTS clips (silent text-bubble storytelling)
    const clips = scene.audioClips ?? [];
    expect(clips.length).toBeGreaterThanOrEqual(2);
    for (const clip of clips) {
      expect(clip.src).not.toMatch(/voice|narrat|speech|tts/i);
      const rel = clip.src.replace(/^\//, '');
      const absPath = path.join(PUBLIC_DIR, rel);
      expect(fs.existsSync(absPath), `missing audio file ${clip.src}`).toBe(true);
      expect(fs.statSync(absPath).size).toBeGreaterThan(44);
    }
  });

  it('dispatches authentic 1970s flat-cel Classic Cel renderers for all medieval characters (zero gradients/crayon/pure B&W, +X walk, 4-stage lip-sync)', () => {
    const charKinds = ['knight', 'soldier', 'dragon', 'villager', 'sun'] as const;
    for (const kind of charKinds) {
      expect(CLASSIC_CEL_CHARACTER_RENDERERS[kind]).toBeDefined();

      const idleSvg = renderCharacter({
        kind,
        artStyle: 'classic_cel',
        state: 'idle',
        mounted: false,
        frameIndex: 2,
      });
      expect(idleSvg).toContain('data-art-style="classic_cel"');
      expect(idleSvg).toContain('url(#xerox-ink)');
      expect(idleSvg).not.toMatch(/crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i);
      expect(idleSvg).not.toMatch(/<linearGradient|<radialGradient|cel-soft-glow/i);
      expect(idleSvg).not.toMatch(/#000000|#ffffff/i);

      if (kind !== 'sun') {
        expect(idleSvg).toContain('data-part="cel-contact-shadow"');
        expect(idleSvg).toContain('data-facing="right"');

        const walkSvg = renderCharacter({
          kind,
          artStyle: 'classic_cel',
          state: 'walking',
          mounted: false,
          frameIndex: 4,
        });
        expect(walkSvg).toContain('data-facing="right"');
        expect(walkSvg).toContain('data-walk-profile="true"');
      }

      // Verify 4-stage 12 FPS cel lip-sync mouth phases (0..3)
      const phases = new Set<string>();
      for (const frameIndex of [0, 2, 4, 6]) {
        const speakingSvg = renderCharacter({
          kind,
          artStyle: 'classic_cel',
          state: 'idle',
          mounted: false,
          isSpeaking: true,
          frameIndex,
        });
        expect(speakingSvg).toContain('data-speaking-mouth="true"');
        const match = speakingSvg.match(/data-mouth-phase="([0-3])"/);
        expect(match).not.toBeNull();
        if (match) phases.add(match[1]);
      }
      expect(phases.size).toBe(4);
    }

    // Verify Sir Rowan crouch-spear reach & mounted horse parity
    const knightReach = renderCharacter({
      kind: 'knight',
      artStyle: 'classic_cel',
      state: 'reaching',
      mounted: false,
      frameIndex: 6,
    });
    expect(knightReach).toContain('data-part="crouch-spear-reach"');

    const knightMounted = renderCharacter({
      kind: 'knight',
      artStyle: 'classic_cel',
      state: 'walking',
      mounted: true,
      frameIndex: 3,
    });
    expect(knightMounted).toContain('data-mounted="true"');
    expect(knightMounted).toContain('data-part="horse-body"');

    // Verify Dragon roaring tooth vs waving flame vs healed idle
    const dragonGrumpy = renderCharacter({
      kind: 'dragon',
      artStyle: 'classic_cel',
      state: 'grumpy',
      frameIndex: 2,
    });
    expect(dragonGrumpy).toContain('data-part="dragon-tooth"');
    expect(dragonGrumpy).not.toContain('data-part="dragon-breath"');

    const dragonHiccup = renderCharacter({
      kind: 'dragon',
      artStyle: 'classic_cel',
      state: 'waving',
      frameIndex: 2,
    });
    expect(dragonHiccup).toContain('data-part="dragon-tooth"');
    expect(dragonHiccup).toContain('data-part="dragon-breath"');

    const dragonHealed = renderCharacter({
      kind: 'dragon',
      artStyle: 'classic_cel',
      state: 'idle',
      frameIndex: 2,
    });
    expect(dragonHealed).not.toContain('data-part="dragon-tooth"');
    expect(dragonHealed).not.toContain('data-part="dragon-breath"');
  });

  it('dispatches Classic Cel medieval buildings & props with zero crayon patterns, gradients, neon halos, or pure B&W', () => {
    const buildingKinds = ['royal_castle', 'scorched_cottage'] as const;
    for (const kind of buildingKinds) {
      expect(CLASSIC_CEL_BUILDING_RENDERERS[kind]).toBeDefined();
      const svg = renderBuilding({ kind, artStyle: 'classic_cel', windowLit: true });
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain(`data-building="${kind}"`);
      expect(svg).not.toMatch(/crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i);
      expect(svg).not.toMatch(/<linearGradient|<radialGradient|cel-soft-glow/i);
      expect(svg).not.toMatch(/#000000|#ffffff/i);
    }

    const propKinds = [
      'dragon_cave',
      'bramble_thorn',
      'dragon_fire',
      'feast_table',
      'celebration_banner',
      'spooky_tree',
      'campfire',
      'chimney_puffs',
      'apple_crate',
      'party_confetti',
      'fluffy_cloud',
    ] as const;

    for (const kind of propKinds) {
      expect(CLASSIC_CEL_PROP_RENDERERS[kind]).toBeDefined();
      const svg = renderProp({
        kind,
        artStyle: 'classic_cel',
        lit: true,
        variant: kind === 'fluffy_cloud' ? 3 : 1,
        count: 8,
        frameIndex: 5,
      });
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain(`data-prop="${kind}"`);
      expect(svg).not.toMatch(/crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i);
      expect(svg).not.toMatch(/<linearGradient|<radialGradient|cel-soft-glow/i);
      expect(svg).not.toMatch(/#000000|#ffffff/i);
    }

    // Verify bramble_thorn & dragon_fire unlit toggles
    const unlitFire = renderProp({
      kind: 'dragon_fire',
      artStyle: 'classic_cel',
      lit: false,
    });
    expect(unlitFire).toContain('data-lit="false"');
    expect(unlitFire).not.toContain('data-part="flame-plume"');

    const unlitThorn = renderProp({
      kind: 'bramble_thorn',
      artStyle: 'classic_cel',
      lit: false,
    });
    expect(unlitThorn).toContain('data-lit="false"');
    expect(unlitThorn).not.toContain('data-part="sparkle-pops"');
  });

  it('renders full 12 FPS Classic Cel pipeline across all 4 acts, theatrical iris opening/closing, and clean zone isolation', () => {
    const scene = CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE;

    // Opening theatrical iris & title card (t = 1.2s)
    const opening = evaluateAndRenderScene(scene, 1.2);
    expect(opening.frame.clock.fps).toBe(12);
    expect(opening.bookFrame.enabled).toBe(false);
    expect(opening.theatricalFrame?.phase).toBe('opening');
    expect(opening.svg).toContain('id="theatrical-opening-title"');
    expect(opening.svg).toContain('id="cel-backdrop"');
    expect(opening.svg).toContain('id="layer-1a-painted-background"');
    expect(opening.svg).toContain('id="layer-1b-acetate-cels"');
    expect(opening.svg).toContain('id="layer-3-film-composite"');
    expect(stripDefs(opening.svg)).not.toMatch(
      /crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i
    );

    // Act I: Royal Castle Courtyard (t = 6.0s)
    const act1 = evaluateAndRenderScene(scene, 6.0);
    expect(act1.theatricalFrame?.phase).toBe('story');
    expect(act1.svg).toContain('data-building="royal_castle"');
    expect(act1.svg).not.toContain('data-building="scorched_cottage"');
    expect(act1.svg).not.toContain('data-prop="dragon_cave"');
    expect(act1.svg).toContain('data-character-speech="villager-1"');
    expect(stripDefs(act1.svg)).not.toMatch(
      /crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i
    );

    // Act II: Scorched Village (t = 18.0s)
    const act2 = evaluateAndRenderScene(scene, 18.0);
    expect(act2.svg).toContain('data-building="scorched_cottage"');
    expect(act2.svg).toContain('data-prop="chimney_puffs"');
    expect(act2.svg).not.toContain('data-building="royal_castle"');
    expect(act2.svg).not.toContain('data-prop="dragon_cave"');
    expect(act2.svg).toContain('data-character-speech="villager-2"');
    expect(stripDefs(act2.svg)).not.toMatch(
      /crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i
    );

    // Act III: Dragon's Rocky Clearing — thorn pops cleanly in Layer 1B (t = 37.5s)
    const act3Pop = evaluateAndRenderScene(scene, 37.5);
    expect(act3Pop.svg).toContain('data-prop="dragon_cave"');
    expect(act3Pop.svg).toContain('data-prop="bramble_thorn"');
    expect(act3Pop.svg).not.toContain('data-building="royal_castle"');
    expect(act3Pop.svg).not.toContain('data-building="scorched_cottage"');
    // Confirm bramble_thorn is rendered inside Layer 1B (after layer-1b-acetate-cels)
    const layer1bIdx = act3Pop.svg.indexOf('id="layer-1b-acetate-cels"');
    const thornIdx = act3Pop.svg.indexOf('data-prop="bramble_thorn"');
    expect(layer1bIdx).toBeGreaterThan(-1);
    expect(thornIdx).toBeGreaterThan(layer1bIdx);
    expect(stripDefs(act3Pop.svg)).not.toMatch(
      /crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i
    );

    // Act IV: Royal Castle Banquet at Golden Sunset (t = 46.0s)
    const act4 = evaluateAndRenderScene(scene, 46.0);
    expect(act4.svg).toContain('data-building="royal_castle"');
    expect(act4.svg).toContain('data-prop="feast_table"');
    expect(act4.svg).toContain('data-prop="celebration_banner"');
    expect(act4.svg).toContain('data-prop="party_confetti"');
    expect(act4.svg).not.toContain('data-prop="dragon_cave"');
    expect(act4.svg).not.toContain('data-part="dragon-tooth"');
    expect(act4.svg).not.toContain('data-part="dragon-breath"');
    expect(stripDefs(act4.svg)).not.toMatch(
      /crayon-stroke|crayon-outline|pat-crayon-|pat-marker-/i
    );

    // Closing theatrical iris & "The End" card (t = 53.2s)
    const closing = evaluateAndRenderScene(scene, 53.2);
    expect(closing.theatricalFrame?.phase).toBe('closing');
    expect(closing.svg).toContain('id="theatrical-iris-matte"');
    expect(closing.svg).toContain('id="theatrical-ending-card"');
    expect(closing.svg).toContain('The End');
    expect(closing.svg).not.toContain('data-character-speech="');
  });

  it('enforces zero overlapping speech bubbles, zero opening/closing bubbles, on-foot permanence, and bramble thorn permanence across all 12 FPS frames', () => {
    const scene = CLASSIC_STARTER_KNIGHT_DRAGON_HICCUPS_SCENE;
    const totalFrames = scene.durationSec * 12;
    let framesWithSpeech = 0;

    for (let f = 0; f <= totalFrames; f++) {
      const t = f / 12;
      const frame = evaluateSceneAtTime(scene, t);

      // Count active speech bubbles on this exact 12 FPS frame
      let activeSpeeches = 0;
      for (const node of scene.nodes) {
        if (node.type !== 'character') continue;
        const st = frame.nodes[node.id];
        if (!st || !st.visible) continue;
        const txt = (st.speechText ?? node.speechText ?? '').trim();
        if (txt.length > 0) {
          activeSpeeches += 1;
          expect(txt.length, `speech "${txt}" at t=${t.toFixed(2)}s`).toBeLessThanOrEqual(32);
        }
      }

      expect(activeSpeeches, `overlapping bubbles at t=${t.toFixed(2)}s`).toBeLessThanOrEqual(1);
      if (t < 3.0 || t >= 51.0) {
        expect(activeSpeeches, `bubble during theatrical frame at t=${t.toFixed(2)}s`).toBe(0);
      }
      if (activeSpeeches > 0) framesWithSpeech += 1;

      // Companion permanence: knight & both soldiers stay strictly on foot (mounted: false)
      for (const id of ['knight', 'soldier-1', 'soldier-2']) {
        expect(frame.nodes[id]?.mounted, `${id} mounted at t=${t.toFixed(2)}s`).toBe(false);
      }

      // Prop permanence: bramble-thorn hidden before pop, visible after pop until Act IV cut
      const thornVis = frame.nodes['bramble-thorn']?.visible;
      if (t < 37.25) {
        expect(thornVis, `thorn visible early at t=${t.toFixed(2)}s`).toBe(false);
      } else if (t >= 37.35 && t < 40.95) {
        expect(thornVis, `thorn disappeared early at t=${t.toFixed(2)}s`).toBe(true);
      } else if (t >= 41.0) {
        expect(thornVis, `thorn leaked into Act IV at t=${t.toFixed(2)}s`).toBe(false);
      }

      // Act IV dragon permanence: healed dragon never breathes fire ('waving')
      if (t >= 41.0) {
        expect(frame.nodes['dragon']?.state).not.toBe('waving');
      }
    }

    expect(framesWithSpeech).toBeGreaterThan(200);
  });
});

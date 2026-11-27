import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CLASSIC_STARTER_MOONLIT_CAT_SCENE } from '../src/scenes/classicStarterMoonlitCat';
import { CLASSIC_MOONLIT_CAT_SCENE } from '../src/scenes/classicMoonlitCat';
import { STARTER_MOONLIT_CAT_SCENE } from '../src/scenes/starterMoonlitCat';
import {
  SCENE_REGISTRY,
  getSwitcherScenes,
  parseStudioUrlParams,
} from '../src/ui/app';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { evaluateSceneAtTime } from '../src/engine/timeline';
import { renderProp } from '../src/assets/props';
import { PROCEDURAL_SFX_REGISTRY } from '../src/audio/sfx';

describe("Clover's Moonlit Chimes — Classic 1970s–80s Hand-Drawn Cel (classic-starter-moonlit-cat)", () => {
  it('registers classic-starter-moonlit-cat cleanly alongside existing scenes and routes /classic/starter-moonlit-cat', () => {
    expect(SCENE_REGISTRY['classic-starter-moonlit-cat']).toBe(
      CLASSIC_STARTER_MOONLIT_CAT_SCENE
    );
    expect(SCENE_REGISTRY['classic-moonlit-cat']).toBe(CLASSIC_MOONLIT_CAT_SCENE);
    expect(SCENE_REGISTRY['starter-moonlit-cat']).toBe(STARTER_MOONLIT_CAT_SCENE);

    expect(getSwitcherScenes('classic_cel').map((s) => s.id)).toContain(
      'classic-starter-moonlit-cat'
    );
    expect(getSwitcherScenes('crayon').map((s) => s.id)).not.toContain(
      'classic-starter-moonlit-cat'
    );

    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.id).toBe('classic-starter-moonlit-cat');
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.artStyle).toBe('classic_cel');
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.fps).toBe(12);
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.durationSec).toBe(30);
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.bookFrame).toBe(false);
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts).toHaveLength(4);
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.title).not.toBe(
      CLASSIC_MOONLIT_CAT_SCENE.title
    );

    // Contiguous 0..30s acts
    expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts[0].startTime).toBe(0);
    expect(
      CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts[
        CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts.length - 1
      ].endTime
    ).toBe(30);
    for (let i = 1; i < CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts.length; i++) {
      expect(CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts[i].startTime).toBe(
        CLASSIC_STARTER_MOONLIT_CAT_SCENE.acts[i - 1].endTime
      );
    }

    // Route parsing: /classic/starter-moonlit-cat & /classic/classic-starter-moonlit-cat & ?scene=
    const byRoute = parseStudioUrlParams('', undefined, '/classic/starter-moonlit-cat');
    expect(byRoute.scene).toBe(CLASSIC_STARTER_MOONLIT_CAT_SCENE);
    expect(byRoute.artStyle).toBe('classic_cel');
    expect(byRoute.bookFrame).toBe(false);
    expect(byRoute.isClassicRoute).toBe(true);
    expect(byRoute.canonicalPath).toBe('/classic/starter-moonlit-cat');

    const byFullRoute = parseStudioUrlParams(
      '',
      undefined,
      '/classic/classic-starter-moonlit-cat'
    );
    expect(byFullRoute.scene).toBe(CLASSIC_STARTER_MOONLIT_CAT_SCENE);
    expect(byFullRoute.canonicalPath).toBe('/classic/classic-starter-moonlit-cat');

    const byQuery = parseStudioUrlParams('?scene=classic-starter-moonlit-cat');
    expect(byQuery.scene).toBe(CLASSIC_STARTER_MOONLIT_CAT_SCENE);
    expect(byQuery.artStyle).toBe('classic_cel');
    expect(byQuery.bookFrame).toBe(false);

    // Existing crayon starter route stays intact
    const crayonStarter = parseStudioUrlParams('?scene=starter-moonlit-cat');
    expect(crayonStarter.scene).toBe(STARTER_MOONLIT_CAT_SCENE);
    expect(crayonStarter.artStyle).toBe('crayon');
  });

  it('renders new classic cel props (garden_bench & firefly_lantern_jar) with zero crayon or pure #000000/#FFFFFF tokens', () => {
    const benchLit = renderProp({
      kind: 'garden_bench',
      artStyle: 'classic_cel',
      lit: true,
      frameIndex: 4,
      id: 'test-bench',
    });
    const benchUnlit = renderProp({
      kind: 'garden_bench',
      artStyle: 'classic_cel',
      lit: false,
      frameIndex: 4,
    });
    const jarClosed = renderProp({
      kind: 'firefly_lantern_jar',
      artStyle: 'classic_cel',
      lit: false,
      frameIndex: 2,
      id: 'test-jar-closed',
    });
    const jarOpen = renderProp({
      kind: 'firefly_lantern_jar',
      artStyle: 'classic_cel',
      lit: true,
      frameIndex: 5,
      id: 'test-jar-open',
    });

    expect(benchLit).toContain('data-prop="garden_bench"');
    expect(benchLit).toContain('data-anchor="bench-seat"');
    expect(benchLit).toContain('data-part="bench-fireflies"');
    expect(benchUnlit).toContain('data-lit="false"');

    expect(jarClosed).toContain('data-prop="firefly_lantern_jar"');
    expect(jarClosed).toContain('data-cork-state="closed"');
    expect(jarOpen).toContain('data-cork-state="ajar"');
    expect(jarOpen).toContain('data-lit="true"');

    for (const svg of [benchLit, benchUnlit, jarClosed, jarOpen]) {
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('crayon-outline');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toContain('pat-marker-');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }
  });

  it('renders full 30s classic cel pipeline with theatrical iris, bubble-free 12 FPS lip-sync, and Zone A -> B cut', () => {
    const sampleTimes = [0.6, 1.5, 5.5, 8.2, 9.2, 13.8, 17.5, 18.6, 20.8, 24.0, 28.6, 29.7];

    for (const t of sampleTimes) {
      const out = evaluateAndRenderScene(CLASSIC_STARTER_MOONLIT_CAT_SCENE, t);
      expect(out.svg).toContain('data-art-style="classic_cel"');
      expect(out.svg).toContain('id="cel-backdrop"');
      expect(out.svg).toContain('id="layer-1a-painted-background"');
      expect(out.svg).toContain('id="layer-1b-acetate-cels"');
      expect(out.svg).toContain('id="bg-board-texture"');
      expect(out.svg).toContain('id="watercolor-wash-soft"');
      expect(out.svg).toContain('id="pencil-bg-sketch"');
      expect(out.svg).toContain('id="layer-3-film-composite"');
      expect(out.svg).toContain('id="xerox-ink"');
      expect(out.svg).toContain('id="cel-grade"');
      expect(out.svg).toContain('id="film-grain"');
      expect(out.bookFrame.enabled).toBe(false);

      const bodySvg = out.svg.split('</defs>')[1] ?? out.svg;
      expect(bodySvg).not.toContain('crayon-stroke');
      expect(bodySvg).not.toContain('crayon-outline');
      expect(bodySvg).not.toContain('pat-crayon-');
      expect(bodySvg).not.toContain('pat-marker-');
      expect(out.svg).not.toContain('url(#crayon-stroke)');
      expect(out.svg).not.toContain('url(#crayon-outline)');
      expect(out.svg).not.toContain('url(#pat-crayon-');
      expect(out.svg).not.toContain('url(#pat-marker-');
    }

    // Opening theatrical iris card (t = 1.2s)
    const opening = evaluateAndRenderScene(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 1.2);
    expect(opening.theatricalFrame?.enabled).toBe(true);
    expect(opening.theatricalFrame?.phase).toBe('opening');
    expect(opening.svg).toContain('id="theatrical-opening-title"');
    expect(opening.svg).toContain("Clover's Moonlit Chimes");

    // Act I: Clover speaks bubble-free with 12 FPS mouth lip-sync & jar is lit (t = 9.2s)
    const evalAct1 = evaluateSceneAtTime(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 9.2, 12);
    expect(evalAct1.nodes['clover-cat']?.speaking).toBe(true);
    expect(evalAct1.nodes['clover-cat']?.speechText).toBe('');
    expect(evalAct1.nodes['csmc-za-firefly-jar']?.lit).toBe(true);
    const act1 = evaluateAndRenderScene(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 9.2);
    expect(act1.theatricalFrame?.phase).toBe('story');
    expect(act1.svg).toContain('data-speaking-mouth="true"');
    expect(act1.svg).toContain('data-prop="firefly_lantern_jar"');
    expect(act1.svg).toContain('data-prop="wind_chime_arbor"');
    expect(act1.svg).not.toContain('data-prop="garden_bench"');

    // Act II: Wind-chime arbor rings & Zone B props still hidden (t = 14.0s)
    const evalAct2 = evaluateSceneAtTime(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 14.0, 12);
    expect(evalAct2.nodes['csmc-za-wind-chimes']?.lit).toBe(true);
    expect(evalAct2.nodes['clover-cat']?.speaking).toBe(false);
    expect(evalAct2.nodes['clover-cat']?.state).toBe('waving');

    // Act III: Zone B moonlit bench glade visible, Zone A hidden, Moon speaks bubble-free (t = 24.0s)
    const evalAct3 = evaluateSceneAtTime(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 24.0, 12);
    expect(evalAct3.nodes['silver-moon']?.speaking).toBe(true);
    expect(evalAct3.nodes['silver-moon']?.speechText).toBe('');
    expect(evalAct3.nodes['clover-cat']?.state).toBe('looking_up');
    expect(evalAct3.nodes['clover-cat']?.speaking).toBe(false);
    const act3 = evaluateAndRenderScene(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 24.0);
    expect(act3.svg).toContain('data-prop="garden_bench"');
    expect(act3.svg).toContain('data-prop="garden_fountain"');
    expect(act3.svg).toContain('data-speaking-mouth="true"');
    expect(act3.svg).not.toContain('data-prop="wind_chime_arbor"');
    expect(act3.svg).not.toContain('data-building="ochre_cottage"');

    // Act IV: Closing iris + "The End" + sleeping Clover on bench + nightcap Moon (t = 28.6s)
    const evalAct4 = evaluateSceneAtTime(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 28.6, 12);
    expect(evalAct4.nodes['clover-cat']?.state).toBe('sleeping');
    expect(evalAct4.nodes['clover-cat']?.speaking).toBe(false);
    expect(evalAct4.nodes['silver-moon']?.wearingNightcap).toBe(true);
    expect(evalAct4.nodes['silver-moon']?.speaking).toBe(false);

    const closing = evaluateAndRenderScene(CLASSIC_STARTER_MOONLIT_CAT_SCENE, 28.6);
    expect(closing.theatricalFrame?.phase).toBe('closing');
    expect(closing.svg).toContain('id="theatrical-iris-matte"');
    expect(closing.svg).toContain('id="theatrical-ending-card"');
    expect(closing.svg).toContain('The End');
  });

  it('verifies zero crayon_scribble cues, all 6 WAV clips exist on disk, zero overlap, and zero voice bleed', () => {
    const cues = CLASSIC_STARTER_MOONLIT_CAT_SCENE.audioCues ?? [];
    expect(cues.length).toBeGreaterThan(0);
    expect(cues.some((c) => c.kind === 'crayon_scribble')).toBe(false);
    expect(cues.some((c) => c.kind === 'garden_wind_chime')).toBe(true);
    expect(cues.some((c) => c.kind === 'chime')).toBe(true);
    expect(cues.some((c) => c.kind === 'lullaby')).toBe(true);
    for (const cue of cues) {
      if (cue.kind) {
        expect(PROCEDURAL_SFX_REGISTRY[cue.kind]).toBeDefined();
      }
    }

    const clips = CLASSIC_STARTER_MOONLIT_CAT_SCENE.audioClips ?? [];
    expect(clips).toHaveLength(6);

    for (const clip of clips) {
      expect(clip.src).toContain('classic-starter-cat-');
      const rel = clip.src.replace(/^\//, '');
      const abs = path.join(process.cwd(), 'public', rel);
      expect(fs.existsSync(abs)).toBe(true);
      expect(fs.statSync(abs).size).toBeGreaterThan(44);
    }

    const voiceClips = clips
      .filter((c) => c.id !== 'bgm-lullaby')
      .sort((a, b) => a.startTime - b.startTime);
    expect(voiceClips).toHaveLength(5);

    // Strictly sequential non-overlapping speakers (gap >= 0.25s)
    for (let i = 1; i < voiceClips.length; i++) {
      const prev = voiceClips[i - 1];
      const curr = voiceClips[i];
      const prevEnd = prev.startTime + (prev.duration ?? 0);
      expect(curr.startTime).toBeGreaterThanOrEqual(prevEnd + 0.25);
    }

    // Zero voice bleed across Zone A -> Zone B cut (18.4s) and closing iris (27.0s)
    for (const v of voiceClips) {
      const vEnd = v.startTime + (v.duration ?? 0);
      expect(vEnd).toBeLessThanOrEqual(27.0);
      if (v.startTime < 18.4) {
        expect(vEnd).toBeLessThanOrEqual(18.4);
      }
    }
  });
});

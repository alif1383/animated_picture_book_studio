import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CLASSIC_STARTER_BANDANA_DOG_SCENE } from '../src/scenes/classicStarterBandanaDog';
import { STARTER_BANDANA_DOG_SCENE } from '../src/scenes/starterBandanaDog';
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
import type { CharacterState, PropKind } from '../src/engine/schema';
import { PROCEDURAL_SFX_REGISTRY } from '../src/audio/sfx';

describe("Biscuit's Sunny Day — Classic Hand-Drawn Cel Short (classic-starter-bandana-dog)", () => {
  it('registers classic-starter-bandana-dog at /classic/starter-bandana-dog while preserving crayon starter-bandana-dog untouched', () => {
    expect(SCENE_REGISTRY['classic-starter-bandana-dog']).toBe(
      CLASSIC_STARTER_BANDANA_DOG_SCENE
    );
    expect(SCENE_REGISTRY['starter-bandana-dog']).toBe(
      STARTER_BANDANA_DOG_SCENE
    );
    expect(getSwitcherScenes('classic_cel').map((s) => s.id)).toContain(
      'classic-starter-bandana-dog'
    );
    expect(getSwitcherScenes('crayon').map((s) => s.id)).toContain(
      'starter-bandana-dog'
    );

    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.id).toBe(
      'classic-starter-bandana-dog'
    );
    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.artStyle).toBe('classic_cel');
    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.fps).toBe(12);
    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.durationSec).toBe(44);
    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.bookFrame).toBe(false);
    expect(CLASSIC_STARTER_BANDANA_DOG_SCENE.acts).toHaveLength(3);

    // Zero crayon_scribble cues; playful_bark registered and used
    const cues = CLASSIC_STARTER_BANDANA_DOG_SCENE.audioCues ?? [];
    expect(cues.length).toBeGreaterThan(0);
    expect(cues.some((c) => c.kind === 'crayon_scribble')).toBe(false);
    expect(cues.some((c) => c.kind === 'playful_bark')).toBe(true);
    expect(PROCEDURAL_SFX_REGISTRY.playful_bark).toBeDefined();

    // Route parsing: /classic/starter-bandana-dog -> Classic Cel scene
    const parsedAlias = parseStudioUrlParams(
      '',
      undefined,
      '/classic/starter-bandana-dog'
    );
    expect(parsedAlias.scene).toBe(CLASSIC_STARTER_BANDANA_DOG_SCENE);
    expect(parsedAlias.artStyle).toBe('classic_cel');
    expect(parsedAlias.bookFrame).toBe(false);
    expect(parsedAlias.canonicalPath).toBe('/classic/starter-bandana-dog');

    // Route parsing: /classic/classic-starter-bandana-dog
    const parsedId = parseStudioUrlParams(
      '',
      undefined,
      '/classic/classic-starter-bandana-dog'
    );
    expect(parsedId.scene).toBe(CLASSIC_STARTER_BANDANA_DOG_SCENE);
    expect(parsedId.artStyle).toBe('classic_cel');
    expect(parsedId.canonicalPath).toBe('/classic/classic-starter-bandana-dog');

    // Query routing: ?scene=classic-starter-bandana-dog -> Classic Cel, ?scene=starter-bandana-dog -> Crayon
    const parsedQueryClassic = parseStudioUrlParams(
      '?scene=classic-starter-bandana-dog',
      undefined,
      '/'
    );
    expect(parsedQueryClassic.scene).toBe(CLASSIC_STARTER_BANDANA_DOG_SCENE);
    expect(parsedQueryClassic.artStyle).toBe('classic_cel');
    expect(parsedQueryClassic.bookFrame).toBe(false);

    const parsedQueryCrayon = parseStudioUrlParams(
      '?scene=starter-bandana-dog',
      undefined,
      '/'
    );
    expect(parsedQueryCrayon.scene).toBe(STARTER_BANDANA_DOG_SCENE);
    expect(parsedQueryCrayon.artStyle).toBe('crayon');
    expect(parsedQueryCrayon.bookFrame).toBe(true);
  });

  it('renders Classic Cel bandana_dog and sun with flat analog cel paint, Xerox ink, +X walk profile, and 4-phase 12 FPS lip-sync', () => {
    expect(CHARACTER_SPEECH_ANCHORS.bandana_dog).toBeDefined();
    expect(CHARACTER_SPEECH_ANCHORS.sun).toBeDefined();

    const dogStates: CharacterState[] = [
      'sitting',
      'idle',
      'walking',
      'curious',
      'waving',
      'singing',
      'blinking',
      'grumpy',
      'looking_up',
      'sleeping',
    ];
    for (const state of dogStates) {
      const svg = renderCharacter({
        kind: 'bandana_dog',
        state,
        artStyle: 'classic_cel',
        frameIndex: 2,
      });
      expect(svg).toContain('data-character="bandana_dog"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain(`data-state="${state}"`);
      expect(svg).toContain('data-part="cel-contact-shadow"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toContain('cel-soft-glow');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    // Dedicated +X 3/4 walk profile
    const dogWalk = renderCharacter({
      kind: 'bandana_dog',
      state: 'walking',
      artStyle: 'classic_cel',
      frameIndex: 4,
    });
    expect(dogWalk).toContain('data-facing="right"');
    expect(dogWalk).toContain('data-walk-profile="true"');

    // 4-phase 12 FPS lip-sync when isSpeaking=true across non-singing poses (bubble-free) and singing
    for (const [idx, frameIndex] of [0, 2, 4, 6].entries()) {
      const sittingSpoken = renderCharacter({
        kind: 'bandana_dog',
        state: 'sitting',
        isSpeaking: true,
        artStyle: 'classic_cel',
        frameIndex,
      });
      expect(sittingSpoken).toContain('data-speaking-mouth="true"');
      expect(sittingSpoken).toContain(`data-mouth-phase="${idx}"`);

      const singingSpoken = renderCharacter({
        kind: 'bandana_dog',
        state: 'singing',
        artStyle: 'classic_cel',
        frameIndex,
      });
      expect(singingSpoken).toContain('data-speaking-mouth="true"');
      expect(singingSpoken).toContain(`data-mouth-phase="${idx}"`);
    }

    // Silent pose has no speaking mouth attribute
    const silentDog = renderCharacter({
      kind: 'bandana_dog',
      state: 'sitting',
      isSpeaking: false,
      artStyle: 'classic_cel',
      frameIndex: 2,
    });
    expect(silentDog).not.toContain('data-speaking-mouth="true"');

    // Classic Cel Sun across states
    const sunStates: CharacterState[] = [
      'awake',
      'sleepy',
      'grumpy',
      'sleeping',
      'blinking',
    ];
    for (const state of sunStates) {
      const svg = renderCharacter({
        kind: 'sun',
        state,
        artStyle: 'classic_cel',
        frameIndex: 4,
      });
      expect(svg).toContain('data-character="sun"');
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).toContain('url(#xerox-ink)');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toContain('cel-soft-glow');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }
  });

  it('renders Classic Cel dog props (dog_house, dog_bowl, dog_tennis_ball) and sunlit daylight foliage/clouds cleanly', () => {
    const propsToCheck: Array<{ kind: PropKind; lit?: boolean }> = [
      { kind: 'dog_house' },
      { kind: 'dog_bowl' },
      { kind: 'dog_tennis_ball' },
      { kind: 'tree', lit: true },
      { kind: 'fluffy_cloud', lit: true },
      { kind: 'grass_patch', lit: true },
      { kind: 'meadow_flowers', lit: true },
    ];

    for (const { kind, lit } of propsToCheck) {
      const svg = renderProp({
        kind,
        artStyle: 'classic_cel',
        lit,
        variant: 1,
        frameIndex: 4,
      });
      expect(svg).toContain('data-art-style="classic_cel"');
      expect(svg).not.toContain('<linearGradient');
      expect(svg).not.toContain('<radialGradient');
      expect(svg).not.toContain('crayon-stroke');
      expect(svg).not.toContain('pat-crayon-');
      expect(svg).not.toContain('cel-soft-glow');
      expect(svg).not.toMatch(/#ffffff\b/i);
      expect(svg).not.toMatch(/#000000\b/i);
    }

    // Daylight tree includes pencilFoliageScribbles & sunlit crown specks; night tree remains distinct
    const dayTree = renderProp({
      kind: 'tree',
      artStyle: 'classic_cel',
      lit: true,
      variant: 1,
      frameIndex: 2,
    });
    const nightTree = renderProp({
      kind: 'tree',
      artStyle: 'classic_cel',
      lit: false,
      variant: 1,
      frameIndex: 2,
    });
    expect(dayTree).toContain('data-part="pencil-foliage-scribbles"');
    expect(dayTree).toContain('data-part="sunlit-crown-specks"');
    expect(nightTree).not.toContain('data-part="sunlit-crown-specks"');

    // Daylight clouds include warm contour wisps and omit night indigo
    const dayCloud = renderProp({
      kind: 'fluffy_cloud',
      artStyle: 'classic_cel',
      lit: true,
      variant: 1,
      frameIndex: 2,
    });
    expect(dayCloud).toContain('data-part="cloud-contour-wisps"');
  });

  it('renders full 3-act chronological daytime arc with multiplane watercolor/pencil layers, bubble-free speaking:true lip-sync, theatrical iris, and zero crayon leakage', () => {
    const sampleTimes = [1.0, 6.0, 14.5, 19.0, 22.0, 26.5, 31.0, 36.5, 42.5];

    for (const t of sampleTimes) {
      const out = evaluateAndRenderScene(CLASSIC_STARTER_BANDANA_DOG_SCENE, t);
      expect(out.svg).toContain('data-art-style="classic_cel"');
      expect(out.svg).toContain('id="cel-backdrop"');
      expect(out.svg).toContain('id="layer-1a-painted-background"');
      expect(out.svg).toContain('id="layer-1b-acetate-cels"');
      expect(out.svg).toContain('id="bg-board-texture"');
      expect(out.svg).toContain('id="watercolor-wash-soft"');
      expect(out.svg).toContain('id="pencil-bg-sketch"');
      expect(out.svg).toContain('id="xerox-ink"');
      expect(out.svg).toContain('id="cel-grade"');
      expect(out.svg).toContain('id="film-grain"');
      expect(out.svg).toContain('id="layer-3-film-composite"');
      expect(out.bookFrame.enabled).toBe(false);

      // Zero speech bubbles anywhere in this theatrical classic cel short
      expect(out.svg).not.toContain('data-character-speech');

      // Zero crayon patterns or crayon-stroke filters in rendered body
      const bodyStart = out.svg.indexOf('</defs>');
      const renderedBody = bodyStart >= 0 ? out.svg.slice(bodyStart) : out.svg;
      expect(renderedBody).not.toContain('crayon-stroke');
      expect(renderedBody).not.toContain('crayon-outline');
      expect(renderedBody).not.toContain('pat-crayon-');
      expect(renderedBody).not.toContain('pat-marker-');
      expect(renderedBody).not.toMatch(/#ffffff\b/i);
      expect(renderedBody).not.toMatch(/#000000\b/i);
    }

    // Opening theatrical iris & title card
    const openFrame = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      1.0
    );
    expect(openFrame.theatricalFrame?.enabled).toBe(true);
    expect(openFrame.theatricalFrame?.phase).toBe('opening');
    expect(openFrame.svg).toContain('id="theatrical-opening-title"');
    expect(openFrame.svg).toContain("Biscuit's Sunny Day");

    // Act I backyard visible, Act II park hidden; Biscuit silent during narration, speaking during voice-02
    const act1Narration = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      6.0
    );
    expect(act1Narration.svg).toContain('data-prop="dog_house"');
    expect(act1Narration.svg).toContain('data-prop="dog_bowl"');
    expect(act1Narration.svg).not.toContain('data-character="red_squirrel"');
    expect(act1Narration.svg).not.toContain('data-speaking-mouth="true"');

    const act1BiscuitTalk = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      14.5
    );
    expect(act1BiscuitTalk.svg).toContain('data-speaking-mouth="true"');

    // Act II park meadow visible, backyard hidden; Biscuit speaks on catch at 26.5s
    const act2Park = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      26.5
    );
    expect(act2Park.svg).toContain('data-character="red_squirrel"');
    expect(act2Park.svg).toContain('data-prop="dog_tennis_ball"');
    expect(act2Park.svg).not.toContain('data-prop="dog_house"');
    expect(act2Park.svg).toContain('data-speaking-mouth="true"');

    // Act III golden afternoon returns to backyard with golden sky & cottage windowLit
    const act3Golden = evaluateSceneAtTime(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      36.5
    );
    expect(act3Golden.nodes['sky-afternoon-base']?.visible).toBe(true);
    expect(act3Golden.nodes['sky-day-base']?.visible).toBe(false);
    expect(act3Golden.nodes['backyard-cottage']?.windowLit).toBe(true);
    expect(act3Golden.nodes['tennis-ball']?.visible).toBe(true);

    const act3Render = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      36.5
    );
    expect(act3Render.svg).toContain('data-speaking-mouth="true"');

    // Closing theatrical iris & "The End" card; Biscuit silent & waving
    const closeFrame = evaluateAndRenderScene(
      CLASSIC_STARTER_BANDANA_DOG_SCENE,
      42.5
    );
    expect(closeFrame.theatricalFrame?.phase).toBe('closing');
    expect(closeFrame.svg).toContain('id="theatrical-iris-matte"');
    expect(closeFrame.svg).toContain('id="theatrical-ending-card"');
    expect(closeFrame.svg).toContain('The End');
    expect(closeFrame.svg).not.toContain('data-speaking-mouth="true"');
  });

  it('verifies all audioClips WAV files exist on disk, never overlap voices, and never bleed across act cuts or closing iris', () => {
    const clips = CLASSIC_STARTER_BANDANA_DOG_SCENE.audioClips ?? [];
    expect(clips.length).toBe(6);

    const rootDir = process.cwd();
    for (const clip of clips) {
      const relPath = clip.src.replace(/^\//, '');
      const absPath = path.join(rootDir, 'public', relPath);
      expect(fs.existsSync(absPath)).toBe(true);
      expect(fs.statSync(absPath).size).toBeGreaterThan(44);
    }

    const voiceClips = clips
      .filter((c) => c.src.includes('classic-starter-dog-voice-'))
      .sort((a, b) => a.startTime - b.startTime);
    expect(voiceClips).toHaveLength(4);

    // Non-overlapping voiceover windows with clean conversational gaps (>= 0.25s)
    for (let i = 1; i < voiceClips.length; i++) {
      const prev = voiceClips[i - 1];
      const curr = voiceClips[i];
      const prevEnd = prev.startTime + (prev.duration ?? 0);
      expect(curr.startTime).toBeGreaterThanOrEqual(prevEnd + 0.25);
    }

    // Zero bleed across Act I->II cut (20.4s), Act II->III cut (32.6s), and closing iris (41.0s)
    expect(voiceClips[0].startTime).toBeGreaterThanOrEqual(3.0);
    expect(voiceClips[1].startTime + (voiceClips[1].duration ?? 0)).toBeLessThanOrEqual(20.0);
    expect(voiceClips[2].startTime).toBeGreaterThanOrEqual(20.4);
    expect(voiceClips[2].startTime + (voiceClips[2].duration ?? 0)).toBeLessThanOrEqual(32.2);
    expect(voiceClips[3].startTime).toBeGreaterThanOrEqual(32.6);
    expect(voiceClips[3].startTime + (voiceClips[3].duration ?? 0)).toBeLessThanOrEqual(40.8);
  });
});

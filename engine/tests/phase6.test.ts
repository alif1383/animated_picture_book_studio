import { describe, it, expect } from 'vitest';
import { MEADOW_PARTY_SCENE } from '../src/scenes/meadowParty';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { renderCharacter } from '../src/assets/characters';
import { renderProp } from '../src/assets/objects';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import { parseStudioUrlParams } from '../src/ui/app';
import type { CharacterKind } from '../src/engine/schema';

describe('Phases 6 & 7: Vibrant Crayon Mode, 10 Paper-Cutout Models & Strawberry Birthday Party Scene', () => {
  it('renders all 10 paper-cutout party character models (including birthday_strawberry) with white sticker halos', () => {
    const cutoutKinds: CharacterKind[] = [
      'singing_radish',
      'birthday_strawberry',
      'watermelon_slice',
      'blue_party_cat',
      'hello_bug',
      'party_banana',
      'crying_onion',
      'cherry_twins',
      'acorn_twins',
      'olive_sprout',
    ];

    for (const kind of cutoutKinds) {
      const svg = renderCharacter({
        id: `test-${kind}`,
        kind,
        state: kind === 'singing_radish' ? 'singing' : 'waving',
        frameIndex: 4,
      });
      expect(svg).toContain(`data-character="${kind}"`);
      expect(svg).toContain('data-part="cutout-sticker-halo"');
    }

    // Verify specific details of Singing Radish, Birthday Strawberry, and Hello Bug
    const radishSvg = renderCharacter({
      kind: 'singing_radish',
      state: 'singing',
      frameIndex: 2,
    });
    expect(radishSvg).toContain('data-part="radish-ponytails"');
    expect(radishSvg).toContain('data-part="radish-microphone"');

    const strawberrySvg = renderCharacter({
      kind: 'birthday_strawberry',
      state: 'singing',
      frameIndex: 2,
    });
    expect(strawberrySvg).toContain('data-character="birthday_strawberry"');
    expect(strawberrySvg).toContain('data-part="cutout-sticker-halo"');

    const bugSvg = renderCharacter({
      kind: 'hello_bug',
      state: 'waving',
      frameIndex: 2,
    });
    expect(bugSvg).toContain('data-part="hello-bug-hi"');

    // Verify meadow and birthday party props
    const cloudSvg = renderProp({ kind: 'fluffy_cloud', frameIndex: 2 });
    expect(cloudSvg).toContain('data-prop="fluffy_cloud"');
    const flowersSvg = renderProp({ kind: 'meadow_flowers', frameIndex: 2 });
    expect(flowersSvg).toContain('data-prop="meadow_flowers"');

    const cakeLitSvg = renderProp({
      kind: 'birthday_cake',
      frameIndex: 2,
      lit: true,
    });
    expect(cakeLitSvg).toContain('data-prop="birthday_cake"');
    expect(cakeLitSvg).toContain('data-lit="true"');
    expect(cakeLitSvg).toContain('data-part="candle-flame"');

    const cakeBlownSvg = renderProp({
      kind: 'birthday_cake',
      frameIndex: 2,
      lit: false,
    });
    expect(cakeBlownSvg).toContain('data-lit="false"');
    expect(cakeBlownSvg).toContain('data-part="candle-smoke"');

    const confettiSvg = renderProp({
      kind: 'party_confetti',
      frameIndex: 3,
      count: 24,
    });
    expect(confettiSvg).toContain('data-prop="party_confetti"');
  });

  it('applies Vibrant Crayon Mode (#vibrant-grade & luminous paper composite) on any scene', () => {
    const classicOut = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 2.0, {
      vibrant: false,
    });
    expect(classicOut.svg).toContain('data-vibrant="false"');
    expect(classicOut.svg).not.toContain(
      'id="layer-1-base-scene" filter="url(#vibrant-grade)"'
    );

    const vibrantOut = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 2.0, {
      vibrant: true,
    });
    expect(vibrantOut.svg).toContain('data-vibrant="true"');
    expect(vibrantOut.svg).toContain('id="vibrant-grade"');
    expect(vibrantOut.svg).toContain(
      'id="layer-1-base-scene" filter="url(#vibrant-grade)"'
    );
  });

  it('evaluates Strawberry Birthday Party (?short_sample=3 / ?short_sample=birthday) across all 4 acts and triggers birthday SFX', () => {
    const route3 = parseStudioUrlParams('?short_sample=3');
    expect(route3.shortSample).toBe('3');
    expect(route3.scene.id).toBe('meadow_party_3');
    expect(route3.vibrant).toBe(true);

    const routeBirthday = parseStudioUrlParams(
      '?short_sample=birthday&footage=cake'
    );
    expect(routeBirthday.shortSample).toBe('3');
    expect(routeBirthday.footageId).toBe('cake');
    expect(routeBirthday.loopBounds).toEqual({ start: 13, end: 18 });

    // Act II (t = 9.0s): Singing "Happy Birthday" to Strawberry
    const songRender = evaluateAndRenderScene(MEADOW_PARTY_SCENE, 9.0);
    expect(songRender.frame.activeAct?.id).toBe('song');
    expect(songRender.svg).toContain('data-character="singing_radish"');
    expect(songRender.svg).toContain('data-character="birthday_strawberry"');
    expect(songRender.svg).toContain('data-prop="birthday_cake"');
    expect(songRender.svg).toContain('data-part="candle-flame"');

    // Act III (t = 16.5s): After Strawberry blows out the candles at t = 16.0s
    const blownOutRender = evaluateAndRenderScene(MEADOW_PARTY_SCENE, 16.5);
    expect(blownOutRender.frame.activeAct?.id).toBe('cake');
    expect(blownOutRender.frame.nodes['birthday-cake'].lit).toBe(false);
    expect(blownOutRender.svg).toContain('data-part="candle-smoke"');

    // Act IV (t = 20.0s): Confetti burst & "Happy Birthday, Strawberry! ★" banner
    const celebrationRender = evaluateAndRenderScene(MEADOW_PARTY_SCENE, 20.0);
    expect(celebrationRender.frame.activeAct?.id).toBe('celebration');
    expect(celebrationRender.frame.nodes['party-confetti'].visible).toBe(true);
    expect(celebrationRender.svg).toContain('data-prop="party_confetti"');
    expect(celebrationRender.svg).toContain('Happy Birthday, Strawberry!');

    // Verify birthday sound effect cues in MEADOW_PARTY_SCENE
    const soundEngine = new PictureBookSoundEngine({ muted: false });
    const songCues = soundEngine.triggerCuesForFrame(
      MEADOW_PARTY_SCENE.audioCues,
      6.0,
      9.0
    );
    expect(songCues.some((c) => c.kind === 'birthday_song')).toBe(true);

    const blowCues = soundEngine.triggerCuesForFrame(
      MEADOW_PARTY_SCENE.audioCues,
      15.5,
      16.2
    );
    expect(blowCues.some((c) => c.kind === 'candle_blow')).toBe(true);

    const celebrationCues = soundEngine.triggerCuesForFrame(
      MEADOW_PARTY_SCENE.audioCues,
      17.8,
      20.5
    );
    expect(celebrationCues.some((c) => c.kind === 'confetti_pop')).toBe(true);
    expect(celebrationCues.some((c) => c.kind === 'cheer_applause')).toBe(true);
    expect(celebrationCues.some((c) => c.kind === 'party_horn')).toBe(true);
    soundEngine.dispose();
  });
});

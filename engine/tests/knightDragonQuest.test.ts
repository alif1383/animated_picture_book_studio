import { describe, it, expect } from 'vitest';
import { renderBuilding } from '../src/assets/buildings';
import {
  CHARACTER_SPEECH_ANCHORS,
  getCharacterSpeechAnchor,
  renderCharacter,
} from '../src/assets/characters';
import { renderProp } from '../src/assets/objects';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { KNIGHT_DRAGON_QUEST_SCENE } from '../src/scenes/knightDragonQuest';
import { parseStudioUrlParams, SCENE_REGISTRY } from '../src/ui/app';

describe('Sir Leo & the Dragon of Whispering Woods — On-Foot & Mounted Rigs, Campfire Meat Spit, Non-Overlapping Dialogue & 5-Act Scene', () => {
  it('renders knight and soldier both on horseback (mounted: true) and on foot (mounted: false), including mounting, camp-log sitting, and crouched spear-reach', () => {
    expect(CHARACTER_SPEECH_ANCHORS.knight).toEqual({ x: 0, y: -128 });
    expect(CHARACTER_SPEECH_ANCHORS.soldier).toEqual({ x: 0, y: -118 });
    expect(CHARACTER_SPEECH_ANCHORS.dragon).toEqual({ x: 10, y: -142 });
    expect(CHARACTER_SPEECH_ANCHORS.villager).toEqual({ x: 0, y: -104 });

    // Dynamic speech anchor adjustments for on-foot & crouched poses
    expect(
      getCharacterSpeechAnchor('knight', { mounted: false, state: 'idle' })
    ).toEqual({ x: 0, y: -102 });
    expect(
      getCharacterSpeechAnchor('knight', { mounted: false, state: 'sitting' })
    ).toEqual({ x: 0, y: -90 });
    expect(
      getCharacterSpeechAnchor('knight', { mounted: false, state: 'reaching' })
    ).toEqual({ x: 6, y: -74 });
    expect(
      getCharacterSpeechAnchor('soldier', { mounted: false, state: 'sitting' })
    ).toEqual({ x: 0, y: -82 });

    // 1A. Sir Leo on Horseback (default mounted: true)
    const knightMounted = renderCharacter({
      kind: 'knight',
      state: 'walking',
      mounted: true,
      frameIndex: 2,
    });
    expect(knightMounted).toContain('data-character="knight"');
    expect(knightMounted).toContain('data-mounted="true"');
    expect(knightMounted).toContain('data-facing="right"');
    expect(knightMounted).toContain('data-walk-profile="true"');
    expect(knightMounted).toContain('data-part="horse-legs"');
    expect(knightMounted).toContain('data-part="knight-lance"');

    // 1B. Sir Leo Mounting / Dismounting Hop (`state: 'climbing'`)
    const knightMounting = renderCharacter({
      kind: 'knight',
      state: 'climbing',
      mounted: false,
      frameIndex: 1,
    });
    expect(knightMounting).toContain('data-mounted="climbing"');
    expect(knightMounting).toContain('data-part="mounting-pose"');

    // 1C. Sir Leo on Foot (`mounted: false`) — walking, sitting on camp log, and crouched spear-reach
    const knightFootWalk = renderCharacter({
      kind: 'knight',
      state: 'walking',
      mounted: false,
      frameIndex: 2,
    });
    expect(knightFootWalk).toContain('data-mounted="false"');
    expect(knightFootWalk).toContain('data-walk-profile="true"');
    expect(knightFootWalk).toContain('data-part="knight-legs"');
    expect(knightFootWalk).not.toContain('data-part="horse-legs"');

    const knightFootSit = renderCharacter({
      kind: 'knight',
      state: 'sitting',
      mounted: false,
      frameIndex: 2,
    });
    expect(knightFootSit).toContain('data-mounted="false"');
    expect(knightFootSit).toContain('data-part="camp-log"');
    expect(knightFootSit).toContain('data-part="knight-legs"');

    const knightSpearReach = renderCharacter({
      kind: 'knight',
      state: 'reaching',
      mounted: false,
      frameIndex: 3,
    });
    expect(knightSpearReach).toContain('data-mounted="false"');
    expect(knightSpearReach).toContain('data-part="crouch-spear-reach"');
    expect(knightSpearReach).toContain('data-part="knight-lance"');

    // 2. Royal Soldier on Horseback & on Foot
    const soldierMounted = renderCharacter({
      kind: 'soldier',
      state: 'walking',
      mounted: true,
      frameIndex: 1,
    });
    expect(soldierMounted).toContain('data-character="soldier"');
    expect(soldierMounted).toContain('data-mounted="true"');
    expect(soldierMounted).toContain('data-part="horse-legs"');

    const soldierFootSit = renderCharacter({
      kind: 'soldier',
      state: 'sitting',
      mounted: false,
      frameIndex: 1,
    });
    expect(soldierFootSit).toContain('data-mounted="false"');
    expect(soldierFootSit).toContain('data-part="camp-log"');
    expect(soldierFootSit).toContain('data-part="soldier-legs"');
    expect(soldierFootSit).not.toContain('data-part="horse-legs"');

    // 3. Barnaby the Forest Dragon
    const dragonRoar = renderCharacter({
      kind: 'dragon',
      state: 'waving',
      frameIndex: 3,
    });
    expect(dragonRoar).toContain('data-character="dragon"');
    expect(dragonRoar).toContain('data-part="dragon-tooth"');
    expect(dragonRoar).toContain('data-part="dragon-breath"');

    const dragonTamed = renderCharacter({
      kind: 'dragon',
      state: 'sitting',
      frameIndex: 4,
    });
    expect(dragonTamed).toContain('data-part="dizzy-stars"');

    // 4. Castle Herald & Medieval Villager
    const villagerWalk = renderCharacter({
      kind: 'villager',
      state: 'walking',
      frameIndex: 2,
    });
    expect(villagerWalk).toContain('data-character="villager"');
    expect(villagerWalk).toContain('data-walk-profile="true"');
  });

  it('renders both fantasy buildings and the upgraded campfire with multi-tent setup, tethered horses, sitting logs, and roasting meat spit', () => {
    const castleSvg = renderBuilding({
      kind: 'royal_castle',
      windowLit: true,
    });
    expect(castleSvg).toContain('data-building="royal_castle"');
    expect(castleSvg).toContain('data-part="castle-towers"');

    const scorchedSvg = renderBuilding({
      kind: 'scorched_cottage',
      windowLit: false,
    });
    expect(scorchedSvg).toContain('data-building="scorched_cottage"');
    expect(scorchedSvg).toContain('data-part="soot-marks"');

    const campfireLit = renderProp({
      kind: 'campfire',
      lit: true,
      frameIndex: 2,
    });
    expect(campfireLit).toContain('data-prop="campfire"');
    expect(campfireLit).toContain('data-part="tethered-horses"');
    expect(campfireLit).toContain('data-part="knight-tent"');
    expect(campfireLit).toContain('data-part="soldier-tent"');
    expect(campfireLit).toContain('data-part="sitting-logs"');
    expect(campfireLit).toContain('data-part="campfire-logs"');
    expect(campfireLit).toContain('data-part="campfire-flames"');
    expect(campfireLit).toContain('data-part="roasting-spit"');
    expect(campfireLit).toContain('data-part="roasting-meat"');
    expect(campfireLit).toContain('data-part="meat-steam"');

    const spookyTree = renderProp({
      kind: 'spooky_tree',
      variant: 1,
      frameIndex: 1,
    });
    expect(spookyTree).toContain('data-prop="spooky_tree"');
    expect(spookyTree).toContain('data-part="spooky-hollow-eyes"');

    const dragonFire = renderProp({
      kind: 'dragon_fire',
      lit: true,
      frameIndex: 2,
    });
    expect(dragonFire).toContain('data-prop="dragon_fire"');
    expect(dragonFire).toContain('data-part="flame-plume"');
    expect(dragonFire).toContain('data-part="clash-sparks"');
  });

  it('registers KNIGHT_DRAGON_QUEST_SCENE in SCENE_REGISTRY and routes ?scene=knight-dragon-quest and ?short_sample=6', () => {
    expect(SCENE_REGISTRY['6']).toBe(KNIGHT_DRAGON_QUEST_SCENE);
    expect(SCENE_REGISTRY['knight-dragon-quest']).toBe(KNIGHT_DRAGON_QUEST_SCENE);
    expect(SCENE_REGISTRY['dragon-quest']).toBe(KNIGHT_DRAGON_QUEST_SCENE);

    const parsedByScene = parseStudioUrlParams('?scene=knight-dragon-quest');
    expect(parsedByScene.scene.id).toBe('knight-dragon-quest');
    expect(parsedByScene.shortSample).toBe('6');
    expect(parsedByScene.bookFrame).toBe(true);

    const parsedBySample = parseStudioUrlParams('?short_sample=6');
    expect(parsedBySample.scene.id).toBe('knight-dragon-quest');
  });

  it('evaluates and renders all 5 acts of KNIGHT_DRAGON_QUEST_SCENE (0..66s) with zero overlapping speech bubbles at any frame', () => {
    expect(KNIGHT_DRAGON_QUEST_SCENE.durationSec).toBe(66);
    expect(KNIGHT_DRAGON_QUEST_SCENE.acts).toHaveLength(5);
    expect(KNIGHT_DRAGON_QUEST_SCENE.audioClips?.length).toBeGreaterThanOrEqual(8);

    // Verify ZERO overlapping speech/thought bubbles across every 6 FPS frame of the 66s scene
    for (let t = 0; t <= KNIGHT_DRAGON_QUEST_SCENE.durationSec; t += 1 / 6) {
      const rendered = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, t);
      const bubbleMatches = rendered.svg.match(/data-character-speech="/g) ?? [];
      expect(bubbleMatches.length).toBeLessThanOrEqual(1);
    }

    // t = 0.0s: Closed hardcover book cover
    const openCover = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 0);
    expect(openCover.bookFrame.phase).toBe('opening');
    expect(openCover.svg).toContain('id="book-front-cover"');

    // Act I (t = 5.0s on foot -> t = 9.1s mounting -> t = 11.0s riding on horseback)
    const act1OnFoot = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 5.0);
    expect(act1OnFoot.frame.activeAct?.id).toBe('act-1-castle-call');
    expect(act1OnFoot.frame.nodes['sir-leo'].mounted).toBe(false);
    expect(act1OnFoot.frame.nodes['soldier-1'].mounted).toBe(false);
    expect(act1OnFoot.svg).toContain(
      'Sir Leo! A dragon attacked the village! Please save them!'
    );

    const act1Mount = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 9.1);
    expect(act1Mount.frame.nodes['sir-leo'].state).toBe('climbing');
    expect(act1Mount.svg).toContain('data-part="mounting-pose"');

    const act1Ride = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 11.0);
    expect(act1Ride.frame.nodes['sir-leo'].mounted).toBe(true);
    expect(act1Ride.frame.nodes['sir-leo'].state).toBe('walking');
    expect(act1Ride.frame.nodes['sir-leo'].flipX).toBe(false);

    // Act II (t = 18.0s, 21.5s, 25.0s): Dismounted on camp logs around roasting meat spit telling sequential horror stories
    const act2Story1 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 18.0);
    expect(act2Story1.frame.activeAct?.id).toBe('act-2-campfire-night');
    expect(act2Story1.frame.nodes['campfire'].visible).toBe(true);
    expect(act2Story1.frame.nodes['sir-leo'].mounted).toBe(false);
    expect(act2Story1.frame.nodes['sir-leo'].state).toBe('sitting');
    expect(act2Story1.frame.nodes['soldier-1'].mounted).toBe(false);
    expect(act2Story1.frame.nodes['soldier-1'].state).toBe('sitting');
    expect(act2Story1.svg).toContain('data-part="roasting-spit"');
    expect(act2Story1.svg).toContain(
      'Legend says a glowing-eyed beast prowls these woods at midnight...'
    );

    const act2Story2 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 21.5);
    expect(act2Story2.svg).toContain('data-character-speech="soldier-2"');
    expect(act2Story2.svg).toContain(
      'Eek! Did that spooky tree just move?! Hold me!'
    );

    const act2Story3 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 25.0);
    expect(act2Story3.svg).toContain('data-character-speech="sir-leo"');
    expect(act2Story3.svg).toContain(
      "Haha, brave knights don't fear ghost stories! Eat your roasted meat and rest up!"
    );

    // Act III (t = 33.0s): Mounted at Scorched Village
    const act3Village = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 33.0);
    expect(act3Village.frame.activeAct?.id).toBe('act-3-destroyed-village');
    expect(act3Village.frame.nodes['scorched-cottage'].visible).toBe(true);
    expect(act3Village.frame.nodes['sir-leo'].mounted).toBe(true);
    expect(act3Village.svg).toContain(
      "Thank goodness you're here! A dragon burned our roofs!"
    );

    // Act IV (39.5..56.5s): Beat 1 Question -> Beat 2 Plea -> Beat 3 Dismount & Surround -> Beat 4 Duck Under Fire & Pop Thorn -> Beat 5 Relieved Dragon
    const act4Beat1 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 41.5);
    expect(act4Beat1.frame.activeAct?.id).toBe('act-4-dragon-battle');
    expect(act4Beat1.svg).toContain(
      'Halt! Dragon, why are you breathing fire and burning the village?!'
    );

    const act4Beat2 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 44.5);
    expect(act4Beat2.frame.nodes['dragon-fire'].visible).toBe(true);
    expect(act4Beat2.svg).toContain(
      "My tooth hurts SOOO bad! Stay back, don't get close — I can't stop hiccuping fire!!"
    );

    const act4Beat3 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 48.5);
    expect(act4Beat3.frame.nodes['sir-leo'].mounted).toBe(false);
    expect(act4Beat3.svg).toContain(
      "It's a giant thorny bramble in his tooth! Dismount, soldiers — surround him and keep him steady!"
    );

    const act4Beat4 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 51.0);
    expect(act4Beat4.frame.nodes['sir-leo'].mounted).toBe(false);
    expect(act4Beat4.frame.nodes['sir-leo'].state).toBe('reaching');
    // Soldiers surround the Dragon on both sides (soldier-1 & soldier-2 on left facing right, soldier-3 on right facing left!)
    expect(act4Beat4.frame.nodes['soldier-1'].mounted).toBe(false);
    expect(act4Beat4.frame.nodes['soldier-1'].x).toBeLessThan(
      act4Beat4.frame.nodes['dragon'].x
    );
    expect(act4Beat4.frame.nodes['soldier-3'].mounted).toBe(false);
    expect(act4Beat4.frame.nodes['soldier-3'].x).toBeGreaterThan(
      act4Beat4.frame.nodes['dragon'].x
    );
    expect(act4Beat4.frame.nodes['soldier-3'].flipX).toBe(true);
    expect(act4Beat4.svg).toContain('data-part="crouch-spear-reach"');
    expect(act4Beat4.svg).toContain(
      "Steady now, big guy... I'll duck under the fire and pop that thorn out!"
    );

    const act4Beat5 = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 54.0);
    expect(act4Beat5.frame.nodes['dragon'].state).toBe('sitting');
    expect(act4Beat5.frame.nodes['dragon-fire'].visible).toBe(false);
    expect(act4Beat5.svg).toContain(
      "Ahhh! My tooth doesn't hurt anymore! Thank you, Sir Leo — no more fire, I promise! ♥"
    );

    // Act V (t = 58.0s & t = 66.0s): Victory Parade on horseback & Closing Book Cover
    const act5Parade = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 58.0);
    expect(act5Parade.frame.activeAct?.id).toBe('act-5-victory-parade');
    expect(act5Parade.frame.nodes['sir-leo'].mounted).toBe(true);
    expect(act5Parade.frame.nodes['dragon'].flipX).toBe(false);
    expect(act5Parade.svg).toContain(
      'Three cheers for Sir Leo and the Brave Soldiers!! ★'
    );

    const closeCover = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 66.0);
    expect(closeCover.bookFrame.phase).toBe('closing');
    expect(closeCover.bookFrame.coverCloseProgress).toBe(1);
    expect(closeCover.svg).toContain('id="book-ending-cover"');
  });

  it('triggers the new medieval procedural audio cues (medieval_lute, fire_crackle, dragon_fire, spear_clink) without error', () => {
    const sound = new PictureBookSoundEngine({ muted: false });
    const triggered = sound.triggerCuesForFrame(
      KNIGHT_DRAGON_QUEST_SCENE.audioCues,
      43.0,
      52.5
    );
    const kinds = triggered.map((c) => c.kind);
    expect(kinds).toContain('dragon_fire');
    expect(kinds).toContain('spear_clink');
  });
});

import { describe, it, expect } from 'vitest';
import { renderBuilding } from '../src/assets/buildings';
import {
  CHARACTER_SPEECH_ANCHORS,
  renderCharacter,
} from '../src/assets/characters';
import { renderProp } from '../src/assets/objects';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { KNIGHT_DRAGON_QUEST_SCENE } from '../src/scenes/knightDragonQuest';
import { parseStudioUrlParams, SCENE_REGISTRY } from '../src/ui/app';

describe('Sir Leo & the Dragon of Whispering Woods — Assets, Speech Anchors & 5-Act Fantasy Scene', () => {
  it('renders all 4 new fantasy characters (knight, soldier, dragon, villager) facing +X (right) when flipX is false and registers speech anchors', () => {
    expect(CHARACTER_SPEECH_ANCHORS.knight).toEqual({ x: 0, y: -128 });
    expect(CHARACTER_SPEECH_ANCHORS.soldier).toEqual({ x: 0, y: -118 });
    expect(CHARACTER_SPEECH_ANCHORS.dragon).toEqual({ x: 10, y: -142 });
    expect(CHARACTER_SPEECH_ANCHORS.villager).toEqual({ x: 0, y: -104 });

    // 1. Sir Leo the Brave Knight on Horseback
    const knightWalk = renderCharacter({
      kind: 'knight',
      state: 'walking',
      frameIndex: 2,
    });
    expect(knightWalk).toContain('data-character="knight"');
    expect(knightWalk).toContain('data-facing="right"');
    expect(knightWalk).toContain('data-walk-profile="true"');
    expect(knightWalk).toContain('data-part="horse-legs"');
    expect(knightWalk).toContain('data-part="knight-lance"');
    expect(knightWalk).toContain('data-part="knight-shield"');
    expect(knightWalk).toContain('data-part="knight-helmet"');

    // 2. Royal Mounted Soldier on Horseback
    const soldierWalk = renderCharacter({
      kind: 'soldier',
      state: 'walking',
      frameIndex: 1,
    });
    expect(soldierWalk).toContain('data-character="soldier"');
    expect(soldierWalk).toContain('data-facing="right"');
    expect(soldierWalk).toContain('data-walk-profile="true"');
    expect(soldierWalk).toContain('data-part="soldier-spear"');
    expect(soldierWalk).toContain('data-part="soldier-shield"');

    // 3. Barnaby the Cute Forest Dragon (roaring with fire vs. tamed with dizzy stars)
    const dragonRoar = renderCharacter({
      kind: 'dragon',
      state: 'waving',
      frameIndex: 3,
    });
    expect(dragonRoar).toContain('data-character="dragon"');
    expect(dragonRoar).toContain('data-facing="right"');
    expect(dragonRoar).toContain('data-part="dragon-wings"');
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
    expect(villagerWalk).toContain('data-facing="right"');
    expect(villagerWalk).toContain('data-walk-profile="true"');
    expect(villagerWalk).toContain('data-part="villager-cap"');
    expect(villagerWalk).toContain('data-part="villager-scroll"');
  });

  it('renders both new fantasy buildings (royal_castle, scorched_cottage) and all 3 new props (campfire, spooky_tree, dragon_fire)', () => {
    const castleSvg = renderBuilding({
      kind: 'royal_castle',
      windowLit: true,
    });
    expect(castleSvg).toContain('data-building="royal_castle"');
    expect(castleSvg).toContain('data-part="castle-towers"');
    expect(castleSvg).toContain('data-part="castle-gate"');
    expect(castleSvg).toContain('data-part="castle-flags"');
    expect(castleSvg).toContain('data-part="castle-banners"');

    const scorchedSvg = renderBuilding({
      kind: 'scorched_cottage',
      windowLit: false,
    });
    expect(scorchedSvg).toContain('data-building="scorched_cottage"');
    expect(scorchedSvg).toContain('data-part="soot-marks"');
    expect(scorchedSvg).toContain('data-part="tilted-shutter"');
    expect(scorchedSvg).toContain('data-part="roof-smoke"');

    const campfireLit = renderProp({
      kind: 'campfire',
      lit: true,
      frameIndex: 2,
    });
    expect(campfireLit).toContain('data-prop="campfire"');
    expect(campfireLit).toContain('data-part="knight-tent"');
    expect(campfireLit).toContain('data-part="campfire-logs"');
    expect(campfireLit).toContain('data-part="campfire-flames"');

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

  it('evaluates and renders all 5 acts of KNIGHT_DRAGON_QUEST_SCENE (0..54s) with +X forward riding, campfire night, scorched village, dragon battle, and victory parade', () => {
    expect(KNIGHT_DRAGON_QUEST_SCENE.durationSec).toBe(54);
    expect(KNIGHT_DRAGON_QUEST_SCENE.acts).toHaveLength(5);

    // t = 0.0s: Closed hardcover book cover
    const openCover = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 0);
    expect(openCover.bookFrame.phase).toBe('opening');
    expect(openCover.svg).toContain('id="book-front-cover"');
    expect(openCover.svg).toContain('Sir Leo &amp; the Dragon of Whispering Woods');
    expect(openCover.svg).toContain('Made by Ali Farahbakhsh');

    // Act I (t = 5.0s & t = 10.0s): Royal Castle call to arms & riding out rightward (flipX: false)
    const act1Call = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 5.0);
    expect(act1Call.frame.activeAct?.id).toBe('act-1-castle-call');
    expect(act1Call.frame.nodes['royal-castle'].visible).toBe(true);
    expect(act1Call.svg).toContain('data-character-speech="castle-herald"');
    expect(act1Call.svg).toContain(
      'Sir Leo! A dragon attacked the village! Please save them!'
    );

    const act1Ride = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 10.0);
    expect(act1Ride.frame.nodes['sir-leo'].state).toBe('walking');
    expect(act1Ride.frame.nodes['sir-leo'].flipX).toBe(false);
    expect(act1Ride.frame.nodes['soldier-1'].state).toBe('walking');
    expect(act1Ride.frame.nodes['soldier-1'].flipX).toBe(false);
    expect(act1Ride.frame.nodes['soldier-2'].state).toBe('walking');
    expect(act1Ride.frame.nodes['soldier-2'].flipX).toBe(false);
    expect(act1Ride.frame.nodes['soldier-3'].state).toBe('walking');
    expect(act1Ride.frame.nodes['soldier-3'].flipX).toBe(false);

    // Act II (t = 16.5s): Starry Campfire Night with Crescent Moon at y >= 200 and thought bubble
    const act2Camp = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 16.5);
    expect(act2Camp.frame.activeAct?.id).toBe('act-2-campfire-night');
    expect(act2Camp.frame.nodes['campfire'].visible).toBe(true);
    expect(act2Camp.frame.nodes['campfire'].lit).toBe(true);
    expect(act2Camp.frame.nodes['moon'].visible).toBe(true);
    expect(act2Camp.frame.nodes['moon'].y).toBeGreaterThanOrEqual(200);
    expect(act2Camp.frame.nodes['sir-leo'].state).toBe('sitting');
    expect(act2Camp.svg).toContain('data-character-speech="sir-leo"');
    expect(act2Camp.svg).toContain('data-bubble="thought"');
    expect(act2Camp.svg).toContain(
      'Rest well, team... at dawn we reach the village! ★'
    );

    // Act III (t = 25.5s): Dawn at the Scorched Village with worried villagers
    const act3Village = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 25.5);
    expect(act3Village.frame.activeAct?.id).toBe('act-3-destroyed-village');
    expect(act3Village.frame.nodes['scorched-cottage'].visible).toBe(true);
    expect(act3Village.frame.nodes['sir-leo'].flipX).toBe(false);
    expect(act3Village.svg).toContain('data-building="scorched_cottage"');
    expect(act3Village.svg).toContain('data-character-speech="villager-1"');
    expect(act3Village.svg).toContain(
      "Thank goodness you're here! A dragon burned our roofs!"
    );

    // Act IV (t = 34.0s, t = 37.0s, t = 41.0s): Dragon battle in Dark Woods -> Charge -> Tamed Dragon
    const act4Roar = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 34.0);
    expect(act4Roar.frame.activeAct?.id).toBe('act-4-dragon-battle');
    expect(act4Roar.frame.nodes['spooky-tree-1'].visible).toBe(true);
    expect(act4Roar.frame.nodes['dragon'].visible).toBe(true);
    expect(act4Roar.frame.nodes['dragon'].flipX).toBe(true);
    expect(act4Roar.frame.nodes['dragon-fire'].visible).toBe(true);
    expect(act4Roar.svg).toContain('data-character-speech="dragon"');
    expect(act4Roar.svg).toContain(
      'ROOOAR!! My prickly tooth hurts! Stay back! ★'
    );

    const act4Charge = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 37.0);
    expect(act4Charge.frame.nodes['sir-leo'].state).toBe('walking');
    expect(act4Charge.frame.nodes['sir-leo'].flipX).toBe(false);
    expect(act4Charge.frame.nodes['soldier-1'].flipX).toBe(false);
    expect(act4Charge.svg).toContain(
      'Charge, brave soldiers! Bonk that prickly bramble out! ★'
    );

    const act4Tamed = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 41.0);
    expect(act4Tamed.frame.nodes['dragon'].state).toBe('sitting');
    expect(act4Tamed.frame.nodes['dragon-fire'].visible).toBe(false);
    expect(act4Tamed.svg).toContain('data-part="dizzy-stars"');
    expect(act4Tamed.svg).toContain(
      "Oof! You beat me AND fixed my tooth! I'll be good now! ♥"
    );

    // Act V (t = 45.0s & t = 54.0s): Victory Parade in Castle Streets & Closing Book Cover
    const act5Parade = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 45.0);
    expect(act5Parade.frame.activeAct?.id).toBe('act-5-victory-parade');
    expect(act5Parade.frame.nodes['royal-castle'].visible).toBe(true);
    expect(act5Parade.frame.nodes['party-confetti'].visible).toBe(true);
    expect(act5Parade.frame.nodes['sir-leo'].flipX).toBe(false);
    expect(act5Parade.frame.nodes['dragon'].flipX).toBe(false);
    expect(act5Parade.svg).toContain(
      'Three cheers for Sir Leo and the Brave Soldiers!! ★'
    );

    const closeCover = evaluateAndRenderScene(KNIGHT_DRAGON_QUEST_SCENE, 54.0);
    expect(closeCover.bookFrame.phase).toBe('closing');
    expect(closeCover.bookFrame.coverCloseProgress).toBe(1);
    expect(closeCover.svg).toContain('id="book-ending-cover"');
    expect(closeCover.svg).toContain('The End ★');
  });
});

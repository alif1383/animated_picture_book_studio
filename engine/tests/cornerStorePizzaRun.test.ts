import { describe, it, expect } from 'vitest';
import { renderBuilding } from '../src/assets/buildings';
import {
  CHARACTER_SPEECH_ANCHORS,
  renderCharacter,
} from '../src/assets/characters';
import { renderAnnotation, renderProp } from '../src/assets/objects';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { CORNER_STORE_DAY_SCENE } from '../src/scenes/cornerStoreDay';

describe('Photo-Modeled Asset Upgrades, Speech/Thought Bubbles, Pizza Prop & Corner Store Pizza Run Scene', () => {
  it('renders upgraded Little Girl with wavy brown hair, pink hairclip, purple star sweater, and holdingPizza/holdingSheep', () => {
    const girlIdle = renderCharacter({
      kind: 'little_girl',
      state: 'idle',
      frameIndex: 1,
      holdingSheep: true,
    });
    expect(girlIdle).toContain('data-character="little_girl"');
    expect(girlIdle).toContain('data-part="hair-clip"');
    expect(girlIdle).toContain('data-part="sweater-star"');
    expect(girlIdle).toContain('url(#pat-crayon-sweater-purple)');
    expect(girlIdle).toContain('data-part="sheep-plushie"');

    const girlWithPizza = renderCharacter({
      kind: 'little_girl',
      state: 'waving',
      frameIndex: 2,
      holdingPizza: true,
    });
    expect(girlWithPizza).toContain('data-part="pizza-slice"');
    expect(girlWithPizza).not.toContain('data-part="sheep-plushie"');

    const girlSleeping = renderCharacter({
      kind: 'little_girl',
      state: 'sleeping',
      frameIndex: 3,
      holdingSheep: false,
    });
    expect(girlSleeping).toContain('z Z');

    // Dedicated 3/4 right-facing walking rig (faces +X when flipX: false)
    const girlWalking = renderCharacter({
      kind: 'little_girl',
      state: 'walking',
      frameIndex: 1,
      holdingSheep: false,
    });
    expect(girlWalking).toContain('data-state="walking"');
    expect(girlWalking).toContain('data-facing="right"');
    expect(girlWalking).toContain('data-walk-profile="true"');
    expect(girlWalking).toContain('data-part="back-arm"');
    expect(girlWalking).toContain('data-part="front-arm"');
  });

  it('renders upgraded white-and-tabby patched Cat across idle, walking/curious, and sleeping states', () => {
    for (const state of ['idle', 'curious', 'walking', 'sleeping', 'waving'] as const) {
      const catSvg = renderCharacter({
        kind: 'cat',
        state,
        frameIndex: 2,
      });
      expect(catSvg).toContain('data-character="cat"');
      expect(catSvg).toContain(`data-state="${state}"`);
      expect(catSvg).toContain('data-part="tabby-patches"');
    }
  });

  it('renders Cute & Cozy Ochre Cottage with flower boxes, climbing vines, and welcome wreath', () => {
    const cottageSvg = renderBuilding({
      kind: 'ochre_cottage',
      windowLit: true,
      showLadder: true,
    });
    expect(cottageSvg).toContain('data-building="ochre_cottage"');
    expect(cottageSvg).toContain('data-part="flower-boxes"');
    expect(cottageSvg).toContain('data-part="cottage-vines"');
    expect(cottageSvg).toContain('data-part="bedroom-window"');
    expect(cottageSvg).toContain('data-part="ladder"');
  });

  it('renders Storybook Crescent Moon with dangling & twinkling companion stars', () => {
    const moonAwake = renderCharacter({
      kind: 'moon',
      state: 'awake',
      frameIndex: 2,
      wearingNightcap: false,
    });
    expect(moonAwake).toContain('data-character="moon"');
    expect(moonAwake).toContain('data-part="moon-face-awake"');
    expect(moonAwake).toContain('data-part="moon-stars"');

    const moonSleeping = renderCharacter({
      kind: 'moon',
      state: 'sleeping',
      frameIndex: 4,
      wearingNightcap: true,
    });
    expect(moonSleeping).toContain('data-part="moon-face-sleeping"');
    expect(moonSleeping).toContain('data-part="moon-nightcap"');
    expect(moonSleeping).toContain('40 -90');
    expect(moonSleeping).toContain('38 -86');
    expect(moonSleeping).toContain('data-part="moon-stars"');
  });

  it('renders speech bubbles and thought bubbles with directional tails/puffs and character head anchors', () => {
    for (const tailDirection of [
      'bottom-center',
      'bottom-left',
      'bottom-right',
      'left',
      'right',
    ] as const) {
      const speech = renderAnnotation({
        text: 'One cheesy slice, please!',
        bubbleStyle: 'speech',
        tailDirection,
        anchorAtTailTip: true,
      });
      expect(speech).toContain('data-bubble="speech"');
      expect(speech).toContain(`data-tail-direction="${tailDirection}"`);
      expect(speech).toContain('data-anchor-tail-tip="true"');
      expect(speech).toContain('One cheesy slice, please!');

      const thought = renderAnnotation({
        text: 'Yum!! So cheesy! ★',
        bubbleStyle: 'thought',
        tailDirection,
        anchorAtTailTip: true,
      });
      expect(thought).toContain('data-bubble="thought"');
      expect(thought).toContain(`data-tail-direction="${tailDirection}"`);
      expect(thought).toContain('data-anchor-tail-tip="true"');
      expect(thought).toContain('Yum!! So cheesy! ★');
    }

    // Direct renderCharacter speechText & speechStyle support
    const girlTalking = renderCharacter({
      kind: 'little_girl',
      state: 'waving',
      speechText: 'Hello there!',
      speechStyle: 'speech',
    });
    expect(girlTalking).toContain('data-part="character-speech"');
    expect(girlTalking).toContain('data-bubble="speech"');
    expect(girlTalking).toContain('Hello there!');
    expect(CHARACTER_SPEECH_ANCHORS.little_girl).toEqual({ x: 0, y: -102 });
    expect(CHARACTER_SPEECH_ANCHORS.shopkeeper).toEqual({ x: 0, y: -105 });
    expect(CHARACTER_SPEECH_ANCHORS.cat).toEqual({ x: 10, y: -44 });
  });

  it('renders pizza_slice prop in both slice (variant 1) and counter box (variant 2) modes', () => {
    const sliceSvg = renderProp({
      kind: 'pizza_slice',
      variant: 1,
      lit: true,
      frameIndex: 2,
    });
    expect(sliceSvg).toContain('data-prop="pizza_slice"');
    expect(sliceSvg).toContain('data-variant="1"');
    expect(sliceSvg).toContain('data-part="pizza-steam"');

    const boxSvg = renderProp({
      kind: 'pizza_slice',
      variant: 2,
      lit: true,
      frameIndex: 3,
    });
    expect(boxSvg).toContain('data-prop="pizza_slice"');
    expect(boxSvg).toContain('data-variant="2"');
  });

  it('evaluates and renders all 5 acts of CORNER_STORE_DAY_SCENE with bookFrame, distant house & store, dialogue, Yum! thought bubble, and moonlit walk home', () => {
    expect(CORNER_STORE_DAY_SCENE.durationSec).toBe(33);
    expect(CORNER_STORE_DAY_SCENE.acts).toHaveLength(5);

    // Verify House (left) and Corner Store (right) are placed far apart
    const cottageNode = CORNER_STORE_DAY_SCENE.nodes.find(
      (n) => n.id === 'ochre-cottage'
    );
    const storeNode = CORNER_STORE_DAY_SCENE.nodes.find(
      (n) => n.id === 'corner-store'
    );
    expect(cottageNode).toBeDefined();
    expect(storeNode).toBeDefined();
    expect(storeNode!.x - cottageNode!.x).toBeGreaterThan(750);

    // t = 0.0s: Book Frame closed front cover
    const openFrame = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 0);
    expect(openFrame.bookFrame.phase).toBe('opening');
    expect(openFrame.svg).toContain('id="book-front-cover"');
    expect(openFrame.svg).toContain('The Corner Store Pizza Run');
    expect(openFrame.svg).toContain('Made by Ali Farahbakhsh');
    expect(openFrame.svg).toContain('Coming Soon!');

    // Act I (t = 5.0s): Daytime Sun shining, Girl & Cat walking rightward from cottage toward store with character-attached speech bubble
    const act1 = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 5.0);
    expect(act1.frame.activeAct?.id).toBe('act-1-leaving-home');
    expect(act1.frame.nodes['sun'].visible).toBe(true);
    expect(act1.frame.nodes['sun'].state).toBe('awake');
    expect(act1.frame.nodes['moon'].visible).toBe(false);
    expect(act1.frame.nodes['little-girl'].state).toBe('walking');
    expect(act1.frame.nodes['little-girl'].flipX).toBe(false);
    expect(act1.frame.nodes['little-girl'].x).toBeGreaterThan(350);
    expect(act1.frame.nodes['little-girl'].x).toBeLessThan(750);
    expect(act1.frame.nodes['village-cat'].state).toBe('walking');
    expect(act1.frame.nodes['village-cat'].flipX).toBe(false);
    expect(act1.svg).toContain('data-character="sun"');
    expect(act1.svg).toContain('data-walk-profile="true"');
    expect(act1.svg).toContain('data-character-speech="little-girl"');
    expect(act1.svg).toContain('data-bubble="speech"');
    expect(act1.svg).toContain("Let's get pizza, Kitty! ★");

    // Act II (t = 8.0s & t = 10.2s): Character-attached dialogue with Shopkeeper at the Corner Store
    const act2Greet = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 8.0);
    expect(act2Greet.frame.activeAct?.id).toBe('act-2-dialogue-at-store');
    expect(act2Greet.svg).toContain('data-character-speech="shopkeeper"');
    expect(act2Greet.svg).toContain('Welcome! Fresh hot pizza?');
    // Shopkeeper is at (958, 642), anchor is (0, -105) -> bubble tail tip at (958, 537)
    expect(act2Greet.svg).toContain('translate(958, 537)');

    const act2Order = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 10.2);
    expect(act2Order.svg).toContain('data-character-speech="little-girl"');
    expect(act2Order.svg).toContain('One cheesy slice, please!');
    // Little Girl is at (815, 642), anchor is (0, -102) -> bubble tail tip at (815, 540)
    expect(act2Order.svg).toContain('translate(815, 540)');

    // Act III (t = 16.5s): Girl holding pizza & thinking "Yum!! So cheesy! ★" in a character-attached thought bubble (no Cat bubble overlapping)
    const act3 = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 16.5);
    expect(act3.frame.activeAct?.id).toBe('act-3-eating-pizza-yum');
    expect(act3.frame.nodes['little-girl'].holdingPizza).toBe(true);
    expect(act3.svg).toContain('data-part="pizza-slice"');
    expect(act3.svg).toContain('data-character-speech="little-girl"');
    expect(act3.svg).not.toContain('data-character-speech="village-cat"');
    expect(act3.svg).toContain('data-bubble="thought"');
    expect(act3.svg).toContain('Yum!! So cheesy! ★');

    // Act IV (t = 23.0s): Walking back home leftward (flipX: true) as the Sun sets and the Crescent Moon & twinkling stars rise
    const act4 = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 23.0);
    expect(act4.frame.activeAct?.id).toBe('act-4-walking-home-moonrise');
    expect(act4.frame.nodes['little-girl'].state).toBe('walking');
    expect(act4.frame.nodes['little-girl'].flipX).toBe(true);
    expect(act4.frame.nodes['village-cat'].state).toBe('walking');
    expect(act4.frame.nodes['village-cat'].flipX).toBe(true);
    expect(act4.frame.nodes['sun'].visible).toBe(true);
    expect(act4.frame.nodes['sun'].state).toBe('sleeping');
    expect(act4.frame.nodes['sunset-patch'].visible).toBe(true);
    expect(act4.frame.nodes['moon'].visible).toBe(true);
    expect(act4.svg).toContain('data-part="moon-stars"');

    // Act V (t = 27.8s, t = 32.2s closed hold, & t = 33.0s): Sun has set, Moon wears nightcap, home sweet home outside glowing cottage & closing book cover with 1s hold
    const act5Home = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 27.8);
    expect(act5Home.frame.activeAct?.id).toBe('act-5-home-sweet-home-closing');
    expect(act5Home.frame.nodes['sun'].visible).toBe(false);
    expect(act5Home.frame.nodes['moon'].visible).toBe(true);
    expect(act5Home.frame.nodes['moon'].wearingNightcap).toBe(true);
    expect(act5Home.frame.nodes['moon'].y).toBe(205);
    expect(act5Home.frame.nodes['moon'].y).toBeGreaterThanOrEqual(200);
    expect(act5Home.frame.nodes['little-girl'].x).toBe(265);
    expect(act5Home.frame.nodes['ochre-cottage'].windowLit).toBe(true);
    expect(act5Home.svg).toContain('Home sweet home! ★');

    const closeHoldFrame = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 32.2);
    expect(closeHoldFrame.bookFrame.phase).toBe('closing');
    expect(closeHoldFrame.bookFrame.coverCloseProgress).toBe(1);
    expect(closeHoldFrame.svg).toContain('id="book-ending-cover"');

    const closeFrame = evaluateAndRenderScene(CORNER_STORE_DAY_SCENE, 33.0);
    expect(closeFrame.bookFrame.phase).toBe('closing');
    expect(closeFrame.bookFrame.coverCloseProgress).toBe(1);
    expect(closeFrame.svg).toContain('id="book-ending-cover"');
    expect(closeFrame.svg).toContain('The End ★');
  });
});

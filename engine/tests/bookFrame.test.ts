import { describe, expect, it } from 'vitest';
import {
  evaluateBookFrameState,
  renderBookFrameOverlay,
  wrapAndFitCoverText,
} from '../src/engine/bookFrame';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';
import { CORNER_STORE_DAY_SCENE } from '../src/scenes/cornerStoreDay';
import { parseStudioUrlParams } from '../src/ui/app';
import type { SceneDefinition } from '../src/engine/schema';

describe('Storybook Cover Opening & Ending/Credits Book-Frame (bookFrame)', () => {
  describe('evaluateBookFrameState', () => {
    it('evaluates the opening phase: closed cover at t=0 -> open book 0% color -> progressive color-in & zoom-in', () => {
      // At t = 0: closed front cover, 0% color, zoomed out to open-book spread scale (0.68)
      const stateAt0 = evaluateBookFrameState({
        timeSec: 0,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
        sceneSubtitle: 'A Crayon Tale',
      });
      expect(stateAt0.enabled).toBe(true);
      expect(stateAt0.phase).toBe('opening');
      expect(stateAt0.coverOpenProgress).toBe(0);
      expect(stateAt0.coverCloseProgress).toBe(0);
      expect(stateAt0.bookScale).toBeCloseTo(0.68, 2);
      expect(stateAt0.colorFillMultiplier).toBe(0);
      expect(stateAt0.coverTitle).toBe('Little Moon Story');
      expect(stateAt0.coverSubtitle).toBe('A Crayon Tale');

      // Mid cover-opening (e.g., t = 0.7s within first 40% of 3.5s openDurationSec)
      const stateMidCover = evaluateBookFrameState({
        timeSec: 0.7,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(stateMidCover.phase).toBe('opening');
      expect(stateMidCover.coverOpenProgress).toBeGreaterThan(0);
      expect(stateMidCover.coverOpenProgress).toBeLessThan(1);
      expect(stateMidCover.colorFillMultiplier).toBe(0);
      expect(stateMidCover.bookScale).toBeCloseTo(0.68, 2);

      // Mid zoom-in & progressive color-in (e.g., t = 2.4s in remaining 60% of 3.5s openDurationSec)
      const stateMidZoom = evaluateBookFrameState({
        timeSec: 2.4,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(stateMidZoom.phase).toBe('opening');
      expect(stateMidZoom.coverOpenProgress).toBe(1);
      expect(stateMidZoom.colorFillMultiplier).toBeGreaterThan(0);
      expect(stateMidZoom.colorFillMultiplier).toBeLessThan(1);
      expect(stateMidZoom.bookScale).toBeGreaterThan(0.68);
      expect(stateMidZoom.bookScale).toBeLessThan(1);
    });

    it('evaluates the middle story phase at 100% full-bleed scale and 100% color', () => {
      const storyState = evaluateBookFrameState({
        timeSec: 12.0,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(storyState.enabled).toBe(true);
      expect(storyState.phase).toBe('story');
      expect(storyState.coverOpenProgress).toBe(1);
      expect(storyState.coverCloseProgress).toBe(0);
      expect(storyState.bookScale).toBe(1);
      expect(storyState.colorFillMultiplier).toBe(1);
    });

    it('evaluates the closing phase: color-out & zoom-out -> closing cover -> 1s hold on closed book with credits', () => {
      // Early closing (zooming out & draining color from 100% -> 0%, e.g., t = 26.5s on a 30s scene with 4.5s closeDurationSec)
      const earlyClose = evaluateBookFrameState({
        timeSec: 26.5,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(earlyClose.phase).toBe('closing');
      expect(earlyClose.coverCloseProgress).toBe(0);
      expect(earlyClose.colorFillMultiplier).toBeGreaterThan(0);
      expect(earlyClose.colorFillMultiplier).toBeLessThan(1);
      expect(earlyClose.bookScale).toBeGreaterThan(0.68);
      expect(earlyClose.bookScale).toBeLessThan(1);

      // Hold on fully closed book ~0.8s before end of video (t = 29.2s): coverCloseProgress is ALREADY 1.0!
      const holdClosedState = evaluateBookFrameState({
        timeSec: 29.2,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(holdClosedState.phase).toBe('closing');
      expect(holdClosedState.coverCloseProgress).toBe(1);
      expect(holdClosedState.colorFillMultiplier).toBe(0);
      expect(holdClosedState.bookScale).toBeCloseTo(0.68, 2);

      // Final end of video (t = 30s): cover fully closed (coverCloseProgress === 1), colorFillMultiplier === 0
      const endState = evaluateBookFrameState({
        timeSec: 30,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Little Moon Story',
      });
      expect(endState.phase).toBe('closing');
      expect(endState.coverCloseProgress).toBe(1);
      expect(endState.colorFillMultiplier).toBe(0);
      expect(endState.bookScale).toBeCloseTo(0.68, 2);
      expect(endState.endingTitle).toBe('The End ★');
      expect(endState.endingCredit).toContain('Little Moon Story');
    });

    it('strictly quantizes book-frame state to the 6 FPS stepped clock', () => {
      // Within a single 6 FPS frame tick (0 .. 0.1666s), state must remain identical
      const s1 = evaluateBookFrameState({
        timeSec: 0.02,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Quantized Test',
      });
      const s2 = evaluateBookFrameState({
        timeSec: 0.14,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Quantized Test',
      });
      expect(s1).toEqual(s2);
    });

    it('bypasses book frame when disabled via config=false or enabled=false', () => {
      const disabledState = evaluateBookFrameState({
        timeSec: 0,
        durationSec: 30,
        fps: 6,
        config: false,
        sceneTitle: 'Disabled Test',
      });
      expect(disabledState.enabled).toBe(false);
      expect(disabledState.phase).toBe('story');
      expect(disabledState.bookScale).toBe(1);
      expect(disabledState.colorFillMultiplier).toBe(1);
    });
  });

  describe('evaluateAndRenderScene integration with bookFrame', () => {
    it('renders #book-frame-spread and #book-front-cover with closed-book geometry and scene title at t=0', () => {
      const output = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 0);
      expect(output.bookFrame.enabled).toBe(true);
      expect(output.bookFrame.phase).toBe('opening');
      expect(output.svg).toContain('data-book-phase="opening"');
      expect(output.svg).toContain('id="book-frame-spread"');
      expect(output.svg).toContain('id="book-front-cover"');
      expect(output.svg).toContain('data-hinge-side="left"');
      expect(output.svg).toContain('id="book-inner-scene-hidden"');
      // Closed book matches Photo 1: left spine strip (x=330, w=48), main ochre board (x=378, w=558), right edge strip (x=936, w=14)
      expect(output.svg).toContain('x="330" y="0" width="48" height="720"');
      expect(output.svg).toContain('x="378" y="0" width="558" height="720"');
      expect(output.svg).toContain('x="936" y="0" width="14" height="720"');
      expect(output.svg).toContain('id="book-cover-title-card"');
      expect(output.svg).toContain('id="book-cover-text-group"');
      expect(output.svg).toContain(SHORT_SAMPLE_1_SCENE.title);
      // At t=0, colorFillMultiplier is 0 so progressive fill masks are at 0% color
      expect(output.bookFrame.colorFillMultiplier).toBe(0);
    });

    it('wraps long cover titles and subtitles into multiple <tspan> lines inside the inset title card without overflow', () => {
      const longTitle = 'A Day at the Little Corner Store in Crayon Village';
      const longSubtitle =
        'Drawing the Store → Shopkeeper Opens → Customers Arrive → Evening Glow & Sleepy Moon';
      const wrappedTitle = wrapAndFitCoverText({
        text: longTitle,
        maxWidthPx: 450,
        baseFontSize: 34,
        minFontSize: 24,
        maxLines: 3,
        charWidthRatio: 0.58,
      });
      expect(wrappedTitle.lines.length).toBeGreaterThanOrEqual(2);
      expect(wrappedTitle.lines.length).toBeLessThanOrEqual(3);
      for (const line of wrappedTitle.lines) {
        expect(line.length * wrappedTitle.fontSize * 0.58).toBeLessThanOrEqual(
          465
        );
      }

      const wrappedSubtitle = wrapAndFitCoverText({
        text: longSubtitle,
        maxWidthPx: 450,
        baseFontSize: 19,
        minFontSize: 14,
        maxLines: 3,
        charWidthRatio: 0.53,
      });
      expect(wrappedSubtitle.lines.length).toBeGreaterThanOrEqual(2);
      expect(wrappedSubtitle.lines.length).toBeLessThanOrEqual(3);

      const cornerStoreCover = evaluateAndRenderScene(
        CORNER_STORE_DAY_SCENE,
        0
      );
      expect(cornerStoreCover.svg).toContain('id="book-cover-title-card"');
      expect(cornerStoreCover.svg).toContain('id="book-cover-box-container"');
      expect(cornerStoreCover.svg).toContain(
        'clip-path="url(#book-cover-text-clip-front)"'
      );
      expect(cornerStoreCover.svg).toContain('<tspan');
      expect(cornerStoreCover.svg).toContain('The Corner Store Pizza Run');
    });

    it('animates genuine 3D rotateY(0deg -> 180deg) book opening with clipped left edge and turning flyleaf pages', () => {
      // Early opening (t = 0.5s, coverOpenProgress < 0.5, theta < 90deg):
      // Nothing exists to the left of spineX (leftOpenEdge === spineX), and flyleaf pages are turning
      const earlyOpen = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 0.5);
      expect(earlyOpen.bookFrame.coverOpenProgress).toBeGreaterThan(0);
      expect(earlyOpen.bookFrame.coverOpenProgress).toBeLessThan(0.5);
      expect(earlyOpen.svg).toContain('id="book-open-page-clip"');
      expect(earlyOpen.svg).toContain('id="book-turning-pages"');
      const earlySpineMatch = earlyOpen.svg.match(/data-spine-x="([^"]+)"/);
      const earlyLeftMatch = earlyOpen.svg.match(
        /data-left-open-edge="([^"]+)"/
      );
      expect(earlySpineMatch).not.toBeNull();
      expect(earlyLeftMatch).not.toBeNull();
      expect(Number(earlyLeftMatch![1])).toBe(Number(earlySpineMatch![1]));

      // Late opening (t = 1.2s, coverOpenProgress > 0.5, theta > 90deg):
      // Cover has crossed past vertical onto the left side, so leftOpenEdge < spineX
      // AND the unfolding left page (#book-opening-left-page) shows the left half of the story!
      const lateOpen = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 1.2);
      expect(lateOpen.bookFrame.coverOpenProgress).toBeGreaterThan(0.5);
      expect(lateOpen.bookFrame.coverOpenProgress).toBeLessThan(1);
      expect(lateOpen.svg).toContain('id="book-opening-left-page"');
      expect(lateOpen.svg).toContain('id="book-opening-right-page"');
      expect(lateOpen.svg).toContain(
        'clip-path="url(#book-left-half-scene-clip)"'
      );
      expect(lateOpen.svg).toContain(
        'clip-path="url(#book-right-half-scene-clip)"'
      );
      const lateSpineMatch = lateOpen.svg.match(/data-spine-x="([^"]+)"/);
      const lateLeftMatch = lateOpen.svg.match(
        /data-left-open-edge="([^"]+)"/
      );
      expect(Number(lateLeftMatch![1])).toBeLessThan(
        Number(lateSpineMatch![1])
      );
    });

    it('renders open book spread matching Photo 2 with #book-page-container, #book-page-clip-group, left/right page-edge strips and NO center spine line over the story', () => {
      // At t = 2.0s, cover is open (coverOpenProgress === 1) and we see the open book spread
      const openOut = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 2.0);
      expect(openOut.bookFrame.phase).toBe('opening');
      expect(openOut.bookFrame.coverOpenProgress).toBe(1);
      expect(openOut.svg).toContain('id="book-open-boards"');
      expect(openOut.svg).toContain('id="book-page-container"');
      expect(openOut.svg).toContain('id="book-page-clip-group"');
      expect(openOut.svg).toContain('clip-path="url(#book-open-page-clip)"');
      expect(openOut.svg).toContain('overflow="hidden"');
      expect(openOut.svg).not.toContain('id="book-inner-scene-hidden"');
      // Left cover & page-edge strips (x = -76, -62, -45, -30, -15)
      expect(openOut.svg).toContain('x="-76" y="0" width="14" height="720"');
      expect(openOut.svg).toContain('x="-62" y="0" width="17" height="720"');
      expect(openOut.svg).toContain('x="-45" y="0" width="15" height="720"');
      expect(openOut.svg).toContain('x="-30" y="0" width="15" height="720"');
      expect(openOut.svg).toContain('x="-15" y="0" width="15" height="720"');
      // Right page-edge & cover strips (x = 1280, 1295, 1310, 1325, 1342)
      expect(openOut.svg).toContain('x="1280" y="0" width="15" height="720"');
      expect(openOut.svg).toContain('x="1295" y="0" width="15" height="720"');
      expect(openOut.svg).toContain('x="1310" y="0" width="15" height="720"');
      expect(openOut.svg).toContain('x="1325" y="0" width="17" height="720"');
      expect(openOut.svg).toContain('x="1342" y="0" width="14" height="720"');
      // No center spine line splitting the story at x=640 inside #book-open-boards
      const openBoardsMatch = openOut.svg.match(
        /<g id="book-open-boards"[^>]*>([\s\S]*?)<\/g>/
      );
      expect(openBoardsMatch).not.toBeNull();
      expect(openBoardsMatch![1]).not.toContain('x1="640"');
      expect(openBoardsMatch![1]).not.toContain('<line');
    });

    it('renders middle story phase full-bleed with no book cover overlay', () => {
      const withBook = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 15.0, {
        enableBookFrame: true,
      });
      const withoutBook = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 15.0, {
        enableBookFrame: false,
      });
      expect(withBook.bookFrame.phase).toBe('story');
      expect(withBook.svg).toContain('data-book-phase="story"');
      expect(withBook.svg).not.toContain('id="book-frame-spread"');
      expect(withBook.svg).not.toContain('id="book-front-cover"');
      expect(withBook.svg).not.toContain('id="book-ending-cover"');

      // Strip the root data-book-phase attribute to verify inner scene markup is 100% identical
      const normalize = (s: string) =>
        s.replace(/data-book-phase="[^"]*"/, '');
      expect(normalize(withBook.svg)).toBe(normalize(withoutBook.svg));
    });

    it('renders #book-ending-cover with ending title, scene title, and credits at t=durationSec', () => {
      const customScene: SceneDefinition = {
        ...SHORT_SAMPLE_1_SCENE,
        bookFrame: {
          coverTitle: 'Custom Cover Title',
          endingTitle: 'The End ★',
          endingCredit: 'Created at Picture-Book Studio',
        },
      };
      const midCloseOut = evaluateAndRenderScene(
        customScene,
        customScene.durationSec - 1.8
      );
      expect(midCloseOut.bookFrame.phase).toBe('closing');
      expect(midCloseOut.bookFrame.coverCloseProgress).toBeGreaterThan(0);
      expect(midCloseOut.bookFrame.coverCloseProgress).toBeLessThan(1);
      expect(midCloseOut.svg).toContain('id="book-ending-cover"');
      expect(midCloseOut.svg).toContain('data-hinge-side="left"');

      // During the final ~1s hold (e.g., durationSec - 0.8s), the book is already 100% closed!
      const holdCloseOut = evaluateAndRenderScene(
        customScene,
        customScene.durationSec - 0.8
      );
      expect(holdCloseOut.bookFrame.phase).toBe('closing');
      expect(holdCloseOut.bookFrame.coverCloseProgress).toBe(1);
      expect(holdCloseOut.svg).toContain('id="book-ending-cover"');
      expect(holdCloseOut.svg).toContain('id="book-inner-scene-hidden"');

      const endOut = evaluateAndRenderScene(
        customScene,
        customScene.durationSec
      );
      expect(endOut.bookFrame.phase).toBe('closing');
      expect(endOut.bookFrame.coverCloseProgress).toBe(1);
      expect(endOut.svg).toContain('data-book-phase="closing"');
      expect(endOut.svg).toContain('id="book-frame-spread"');
      expect(endOut.svg).toContain('id="book-ending-cover"');
      expect(endOut.svg).toContain('data-hinge-side="left"');
      expect(endOut.svg).toContain('id="book-inner-scene-hidden"');
      expect(endOut.svg).toContain('The End ★');
      expect(endOut.svg).toContain('Custom Cover Title');
      expect(endOut.svg).toContain('Created at Picture-Book Studio');
    });

    it('bypasses book frame when enableBookFrame: false or scene.bookFrame = false', () => {
      const optDisabled = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 0, {
        enableBookFrame: false,
      });
      expect(optDisabled.bookFrame.enabled).toBe(false);
      expect(optDisabled.svg).toContain('data-book-phase="disabled"');
      expect(optDisabled.svg).not.toContain('id="book-frame-spread"');
      expect(optDisabled.svg).not.toContain('id="book-front-cover"');

      const sceneDisabled: SceneDefinition = {
        ...SHORT_SAMPLE_1_SCENE,
        bookFrame: false,
      };
      const sceneOut = evaluateAndRenderScene(
        sceneDisabled,
        sceneDisabled.durationSec
      );
      expect(sceneOut.bookFrame.enabled).toBe(false);
      expect(sceneOut.svg).not.toContain('id="book-ending-cover"');
    });

    it('renderBookFrameOverlay returns innerSceneMarkup unchanged during story phase', () => {
      const storyState = evaluateBookFrameState({
        timeSec: 10,
        durationSec: 30,
        fps: 6,
        sceneTitle: 'Test',
      });
      const raw = '<g id="inner-scene"></g>';
      expect(
        renderBookFrameOverlay({
          innerSceneMarkup: raw,
          width: 1280,
          height: 720,
          bookState: storyState,
          frameIndex: 60,
        })
      ).toBe(raw);
    });
  });

  describe('parseStudioUrlParams book_frame support', () => {
    it('defaults bookFrame to true and parses ?book_frame=0 and ?book_frame=1', () => {
      const defaultParsed = parseStudioUrlParams('?scene=1');
      expect(defaultParsed.bookFrame).toBe(true);

      const disabledParsed = parseStudioUrlParams('?scene=1&book_frame=0');
      expect(disabledParsed.bookFrame).toBe(false);

      const enabledParsed = parseStudioUrlParams('?scene=1&book_frame=1');
      expect(enabledParsed.bookFrame).toBe(true);
    });
  });
});

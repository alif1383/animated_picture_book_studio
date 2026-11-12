import { describe, it, expect } from 'vitest';
import {
  evaluateSteppedClock,
  steppedOscillate,
  isSteppedBlinkFrame,
  steppedLoopProgress,
} from '../src/engine/clock';
import {
  evaluateSceneAtTime,
  interpolateKeyframes,
  evaluateCameraTrack,
} from '../src/engine/timeline';
import type { SceneDefinition } from '../src/engine/schema';

describe('Phase 2: Quantized Stepped Clock, Scene Schema & Timeline Evaluator', () => {
  it('quantizes continuous playback time to 6 FPS stop-motion frames and cycles boil seeds 1..6', () => {
    const c0 = evaluateSteppedClock(0, 6);
    expect(c0.frameIndex).toBe(0);
    expect(c0.quantizedTimeSec).toBe(0);
    expect(c0.boilSeed).toBe(1);

    // 0.10s is still within frame 0 at 6 FPS (frame duration ~0.1667s)
    const cSub = evaluateSteppedClock(0.1, 6);
    expect(cSub.frameIndex).toBe(0);
    expect(cSub.quantizedTimeSec).toBe(0);

    // 0.50s is exactly frame 3 at 6 FPS
    const c3 = evaluateSteppedClock(0.5, 6);
    expect(c3.frameIndex).toBe(3);
    expect(c3.quantizedTimeSec).toBe(0.5);
    expect(c3.boilSeed).toBe(4);

    // Frame 6 wraps boilSeed back to 1
    const c6 = evaluateSteppedClock(1.0, 6);
    expect(c6.frameIndex).toBe(6);
    expect(c6.boilSeed).toBe(1);
  });

  it('computes deterministic stepped oscillation, eye blink frames, and loop progress', () => {
    expect(steppedOscillate(0, 8, 5)).toBe(0);
    expect(steppedOscillate(2, 8, 5)).toBe(5);
    expect(steppedOscillate(6, 8, 5)).toBe(-5);

    expect(isSteppedBlinkFrame(0, 10, 1)).toBe(false);
    expect(isSteppedBlinkFrame(9, 10, 1)).toBe(true);

    expect(steppedLoopProgress(3, 6)).toBe(0.5);
  });

  it('evaluates stepped hold vs quantized-linear keyframes and camera pan/zoom', () => {
    const kfs = [
      { time: 0, x: 100, hold: true },
      { time: 2, x: 200, hold: false },
      { time: 4, x: 400 },
    ];
    expect(interpolateKeyframes(kfs, 1.0, ['x']).x).toBe(100);
    expect(interpolateKeyframes(kfs, 3.0, ['x']).x).toBe(300);

    const cam = evaluateCameraTrack(
      [
        { time: 0, x: 0, y: 0, zoom: 1 },
        { time: 2, x: 100, y: -50, zoom: 1.5 },
      ],
      2.0,
      960,
      720
    );
    expect(cam.zoom).toBe(1.5);
    expect(cam.transform).toContain('scale(1.5)');
  });

  it('evaluates full SceneDefinition at stepped timestamps with quantized fillProgress and state triggers', () => {
    const mockScene: SceneDefinition = {
      id: 'test-scene',
      title: 'Test Scene',
      durationSec: 10,
      fps: 6,
      acts: [
        {
          id: 'act-1',
          title: 'Act 1',
          startTime: 0,
          endTime: 5,
          caption: 'Coloring the sky...',
        },
        {
          id: 'act-2',
          title: 'Act 2',
          startTime: 5,
          endTime: 10,
          caption: 'Singing to the moon...',
        },
      ],
      nodes: [
        {
          id: 'sky-patch',
          type: 'background_patch',
          zIndex: 1,
          x: 0,
          y: 0,
          d: 'M 0 0 L 960 0 L 960 400 L 0 400 Z',
          bounds: { x: 0, y: 0, width: 960, height: 400 },
          material: 'markerIndigoNight',
          fillStyle: 'top-down-bands',
          fillProgress: 0,
          fillSteps: 10,
        },
        {
          id: 'girl',
          type: 'character',
          kind: 'little_girl',
          zIndex: 10,
          x: 200,
          y: 500,
          state: 'climbing',
          holdingSheep: true,
        },
      ],
      timeline: [
        {
          nodeId: 'sky-patch',
          keyframes: [
            { time: 0, fillProgress: 0 },
            { time: 5, fillProgress: 1 },
          ],
        },
        {
          nodeId: 'girl',
          keyframes: [
            { time: 0, y: 500, state: 'climbing' },
            { time: 5, y: 380, state: 'singing' },
          ],
        },
      ],
    };

    // Sub-frame jitter (2.51s vs 2.55s) snaps to identical 6 FPS frame (frame 15 -> 2.5s)
    const frameA = evaluateSceneAtTime(mockScene, 2.51);
    const frameB = evaluateSceneAtTime(mockScene, 2.55);
    expect(frameA.clock.frameIndex).toBe(15);
    expect(frameB.clock.frameIndex).toBe(15);
    expect(frameA.nodes['girl'].y).toBe(frameB.nodes['girl'].y);
    expect(frameA.nodes['sky-patch'].fillActiveSteps).toBe(5);
    expect(frameA.caption).toBe('Coloring the sky...');

    const frameEnd = evaluateSceneAtTime(mockScene, 6.0);
    expect(frameEnd.nodes['girl'].state).toBe('singing');
    expect(frameEnd.nodes['sky-patch'].fillProgress).toBe(1);
    expect(frameEnd.caption).toBe('Singing to the moon...');
  });
});

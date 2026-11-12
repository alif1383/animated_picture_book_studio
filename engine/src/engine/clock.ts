import { TOKENS } from '../theme/tokens';
import { clamp01, round2 } from './svgUtils';

/**
 * Snapshot of the quantized stop-motion clock at a given playback timestamp.
 */
export interface SteppedClockState {
  /** Clamped continuous input time in seconds */
  rawTimeSec: number;
  /** Time quantized to the discrete stop-motion frame grid (multiples of 1/fps) */
  quantizedTimeSec: number;
  /** Zero-based discrete stop-motion frame index: Math.floor(rawTimeSec * fps) */
  frameIndex: number;
  /** Active stop-motion frame rate (defaults to TOKENS.timing.fps = 6) */
  fps: number;
  /** Current SVG turbulence seed cycled from TOKENS.timing.lineBoilSeeds (1..6) */
  boilSeed: number;
  /** Normalized [0..1) phase within the current 1-second cycle: (frameIndex % fps) / fps */
  stepPhase: number;
}

/**
 * Quantizes continuous playback time (seconds) into a discrete stop-motion frame state
 * and deterministic line-boil seed (default 6 FPS, seeds 1..6).
 */
export function evaluateSteppedClock(
  timeSec: number,
  fps: number = TOKENS.timing.fps,
  durationSec?: number
): SteppedClockState {
  const safeFps = fps > 0 ? fps : TOKENS.timing.fps;
  const maxTime =
    durationSec !== undefined && durationSec > 0 ? durationSec : Infinity;
  const rawTimeSec = Math.max(
    0,
    Math.min(Number.isFinite(timeSec) ? timeSec : 0, maxTime)
  );

  const frameIndex = Math.floor(rawTimeSec * safeFps + 1e-9);
  const quantizedTimeSec = round2(frameIndex / safeFps);

  const seeds = TOKENS.timing.lineBoilSeeds;
  const boilSeed = seeds[frameIndex % seeds.length] ?? 1;
  const stepPhase = round2((frameIndex % safeFps) / safeFps);

  return {
    rawTimeSec: round2(rawTimeSec),
    quantizedTimeSec,
    frameIndex,
    fps: safeFps,
    boilSeed,
    stepPhase,
  };
}

/**
 * Discrete stop-motion sine oscillation evaluated strictly at integer `frameIndex`.
 * Used by 2D cutout character rigs (head tilt ±5°, arm wave, climbing step, vertical bob)
 * so motion steps at 6 FPS rather than interpolating smoothly at 60 FPS.
 */
export function steppedOscillate(
  frameIndex: number,
  periodFrames: number,
  amplitude: number,
  phaseOffsetFrames = 0
): number {
  const safePeriod = Math.max(1, periodFrames);
  const angle = ((frameIndex + phaseOffsetFrames) / safePeriod) * Math.PI * 2;
  return round2(Math.sin(angle) * amplitude);
}

/**
 * Discrete periodic blink trigger for 2D cutout character eyes.
 * Returns true on the blink frame(s) within each `intervalFrames` cycle.
 */
export function isSteppedBlinkFrame(
  frameIndex: number,
  intervalFrames = 18,
  blinkDurationFrames = 1,
  offsetFrames = 0
): boolean {
  const safeInterval = Math.max(2, intervalFrames);
  const pos =
    (((frameIndex + offsetFrames) % safeInterval) + safeInterval) %
    safeInterval;
  return pos >= safeInterval - blinkDurationFrames;
}

/**
 * Quantized normalized progress [0..1] for discrete prop hops (music notes, chimney puffs,
 * twinkling stars) over a fixed frame window.
 */
export function steppedLoopProgress(
  frameIndex: number,
  loopFrames: number,
  offsetFrames = 0
): number {
  const safeLoop = Math.max(1, loopFrames);
  const pos = (((frameIndex + offsetFrames) % safeLoop) + safeLoop) % safeLoop;
  return clamp01(round2(pos / safeLoop));
}

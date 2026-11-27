import { TOKENS } from '../theme/tokens';
import { clamp01, round2, svgTransform } from './svgUtils';
import { quantizeFillProgress } from './fillMask';
import { evaluateSteppedClock, SteppedClockState } from './clock';
import type {
  BubbleStyle,
  BubbleTailDirection,
  CameraKeyframe,
  CharacterState,
  NodeKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
} from './schema';

export interface EvaluatedCamera {
  x: number;
  y: number;
  zoom: number;
  /** SVG transform centering zoom around canvas center (640, 360) and applying pan (x, y) */
  transform: string;
}

export interface EvaluatedNodeState {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flipX: boolean;
  opacity: number;
  visible: boolean;
  /** Quantized stop-motion fill progress in [0..1] via quantizeFillProgress */
  fillProgress: number;
  /** Active stop-motion coloring stroke count */
  fillActiveSteps: number;
  fillTotalSteps: number;
  state?: CharacterState;
  windowLit?: boolean;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  holdingPizza?: boolean;
  wearingFloatie?: boolean;
  floatieVariant?: number;
  mounted?: boolean;
  speaking?: boolean;
  speechText?: string;
  speechStyle?: 'speech' | 'thought';
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
  lit?: boolean;
  count?: number;
  text?: string;
  bubbleStyle?: BubbleStyle;
  tailDirection?: BubbleTailDirection;
  /** SVG transform attribute string built via svgTransform() */
  transform: string;
}

export interface EvaluatedSceneFrame {
  clock: SteppedClockState;
  activeAct: StoryAct | undefined;
  caption: string | undefined;
  camera: EvaluatedCamera;
  nodes: Record<string, EvaluatedNodeState>;
}

function lerpNumber(a: number, b: number, t: number): number {
  return round2(a + (b - a) * t);
}

/**
 * Evaluates a sorted keyframe list at pre-quantized stop-motion timestamp `qTime`.
 * - When `prev.hold === true`, holds `prev` values until `qTime >= next.time`.
 * - Otherwise, linearly interpolates numeric properties strictly at `qTime`,
 *   producing discrete stop-motion hops at the quantized frame rate (never smooth 60fps easing).
 */
export function interpolateKeyframes<
  T extends { time: number; hold?: boolean }
>(
  keyframes: readonly T[],
  qTime: number,
  numericKeys: ReadonlyArray<keyof T> = []
): Partial<T> {
  if (keyframes.length === 0) return {};
  if (qTime <= keyframes[0].time) return { ...keyframes[0] };
  const last = keyframes[keyframes.length - 1];
  if (qTime >= last.time) return { ...last };

  let prev = keyframes[0];
  let next = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (qTime >= keyframes[i].time && qTime < keyframes[i + 1].time) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  const result: Partial<T> = { ...prev };

  if (!prev.hold && next.time > prev.time) {
    const t = clamp01((qTime - prev.time) / (next.time - prev.time));
    for (const key of numericKeys) {
      const a = prev[key];
      const b = next[key];
      if (typeof a === 'number' && typeof b === 'number') {
        (result as Record<keyof T, unknown>)[key] = lerpNumber(a, b, t);
      }
    }
  }

  return result;
}

/**
 * Evaluates the active StoryAct at pre-quantized timestamp `qTime`.
 */
export function evaluateActiveAct(
  acts: readonly StoryAct[],
  qTime: number
): StoryAct | undefined {
  if (acts.length === 0) return undefined;
  return (
    acts.find((act) => qTime >= act.startTime && qTime < act.endTime) ??
    (qTime >= acts[acts.length - 1].startTime ? acts[acts.length - 1] : acts[0])
  );
}

/**
 * Evaluates the camera pan/zoom keyframe track at pre-quantized timestamp `qTime`.
 */
export function evaluateCameraTrack(
  cameraKeyframes: readonly CameraKeyframe[],
  qTime: number,
  canvasWidth: number = TOKENS.canvas.width,
  canvasHeight: number = TOKENS.canvas.height
): EvaluatedCamera {
  if (cameraKeyframes.length === 0) {
    return { x: 0, y: 0, zoom: 1, transform: '' };
  }

  const evalCam = interpolateKeyframes(cameraKeyframes, qTime, [
    'x',
    'y',
    'zoom',
  ]);
  const x = evalCam.x ?? 0;
  const y = evalCam.y ?? 0;
  const zoom = evalCam.zoom ?? 1;

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const tx = round2(cx - (cx + x) * zoom);
  const ty = round2(cy - (cy + y) * zoom);
  const transform = svgTransform({ x: tx, y: ty, scale: zoom });

  return { x, y, zoom, transform };
}

const NODE_NUMERIC_KEYS: ReadonlyArray<keyof NodeKeyframe> = [
  'x',
  'y',
  'rotate',
  'scale',
  'opacity',
  'fillProgress',
  'count',
];

function evaluateSingleNode(
  node: SceneNode,
  keyframes: readonly NodeKeyframe[],
  qTime: number
): EvaluatedNodeState {
  // Forward-merge discrete properties from all keyframes up to qTime, and interpolate numeric properties
  let mergedDiscrete: Partial<NodeKeyframe> = {};
  for (const kf of keyframes) {
    if (kf.time <= qTime + 1e-6) {
      mergedDiscrete = { ...mergedDiscrete, ...kf };
    } else {
      break;
    }
  }

  const interp = interpolateKeyframes(keyframes, qTime, NODE_NUMERIC_KEYS);
  const combined: Partial<NodeKeyframe> = { ...mergedDiscrete, ...interp };

  const x = combined.x ?? node.x;
  const y = combined.y ?? node.y;
  const rotate = combined.rotate ?? node.rotate ?? 0;
  const scale = combined.scale ?? node.scale ?? 1;
  let flipX = combined.flipX ?? node.flipX ?? false;
  const opacity = combined.opacity ?? node.opacity ?? 1;
  const visible = combined.visible ?? node.visible ?? true;

  const rawFill = combined.fillProgress ?? node.fillProgress ?? 1;
  const fillSteps = node.fillSteps ?? TOKENS.timing.defaultFillSteps;
  const qFill = quantizeFillProgress(rawFill, fillSteps);

  const state =
    combined.state ?? (node.type === 'character' ? node.state : undefined);

  // Automatic walking direction safeguard: when a character is in 'walking' state across a
  // horizontal motion segment (prev.x -> next.x), always face the direction of travel
  // (flipX = false when walking right +X, flipX = true when walking left -X).
  if (node.type === 'character' && state === 'walking' && keyframes.length >= 2) {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const prev = keyframes[i];
      const next = keyframes[i + 1];
      if (qTime >= prev.time - 1e-6 && qTime <= next.time + 1e-6 && !prev.hold) {
        if (
          typeof prev.x === 'number' &&
          typeof next.x === 'number' &&
          Math.abs(next.x - prev.x) > 1
        ) {
          flipX = next.x < prev.x;
          break;
        }
      }
    }
  }
  const windowLit =
    combined.windowLit ??
    (node.type === 'building' ? node.windowLit : undefined);
  const wearingNightcap =
    combined.wearingNightcap ??
    (node.type === 'character' ? node.wearingNightcap : undefined);
  const holdingSheep =
    combined.holdingSheep ??
    (node.type === 'character' ? node.holdingSheep : undefined);
  const holdingPizza =
    combined.holdingPizza ??
    (node.type === 'character' ? node.holdingPizza : undefined);
  const wearingFloatie =
    combined.wearingFloatie ??
    (node.type === 'character' ? node.wearingFloatie : undefined);
  const floatieVariant =
    combined.floatieVariant ??
    (node.type === 'character' ? node.floatieVariant : undefined);
  const mounted =
    combined.mounted ??
    (node.type === 'character' ? node.mounted : undefined);
  const speaking =
    combined.speaking !== undefined
      ? combined.speaking
      : node.type === 'character'
      ? node.speaking
      : undefined;
  const speechText =
    combined.speechText !== undefined
      ? combined.speechText
      : node.type === 'character'
      ? node.speechText
      : undefined;
  const speechStyle =
    combined.speechStyle ??
    (node.type === 'character' ? node.speechStyle : undefined);
  const speechTail =
    combined.speechTail ??
    (node.type === 'character' ? node.speechTail : undefined);
  const lit = combined.lit ?? (node.type === 'prop' ? node.lit : undefined);
  const rawCount =
    combined.count ?? (node.type === 'prop' ? node.count : undefined);
  const count = rawCount !== undefined ? Math.round(rawCount) : undefined;
  const text =
    combined.text ?? (node.type === 'annotation' ? node.text : undefined);
  const bubbleStyle =
    combined.bubbleStyle ??
    (node.type === 'annotation' ? node.bubbleStyle : undefined);
  const tailDirection =
    combined.tailDirection ??
    (node.type === 'annotation' ? node.tailDirection : undefined);

  return {
    id: node.id,
    x,
    y,
    rotate,
    scale,
    flipX,
    opacity,
    visible,
    fillProgress: qFill.quantizedProgress,
    fillActiveSteps: qFill.activeSteps,
    fillTotalSteps: qFill.totalSteps,
    state,
    windowLit,
    wearingNightcap,
    holdingSheep,
    holdingPizza,
    wearingFloatie,
    floatieVariant,
    mounted,
    speaking,
    speechText,
    speechStyle,
    speechTail,
    lit,
    count,
    text,
    bubbleStyle,
    tailDirection,
    transform: svgTransform({ x, y, rotate, scale, flipX }),
  };
}

/**
 * Evaluates the entire declarative SceneDefinition at playback timestamp `timeSec`.
 * Mandatory Step 1: Snaps `timeSec` via `evaluateSteppedClock` so every position,
 * rotation, camera pan/zoom, and progressive stop-motion fill mask is quantized to 6-8 FPS.
 */
export function evaluateSceneAtTime(
  scene: SceneDefinition,
  timeSec: number,
  fps: number = scene.fps ?? TOKENS.timing.fps
): EvaluatedSceneFrame {
  const clock = evaluateSteppedClock(timeSec, fps, scene.durationSec);
  const qTime = clock.quantizedTimeSec;

  const activeAct = evaluateActiveAct(scene.acts, qTime);
  const camera = evaluateCameraTrack(
    scene.camera ?? [],
    qTime,
    scene.width ?? TOKENS.canvas.width,
    scene.height ?? TOKENS.canvas.height
  );

  const trackMap = new Map<string, readonly NodeKeyframe[]>();
  for (const track of scene.timeline) {
    trackMap.set(track.nodeId, track.keyframes);
  }

  const nodes: Record<string, EvaluatedNodeState> = {};
  for (const node of scene.nodes) {
    const kfs = trackMap.get(node.id) ?? [];
    nodes[node.id] = evaluateSingleNode(node, kfs, qTime);
  }

  return {
    clock,
    activeAct,
    caption: activeAct?.caption,
    camera,
    nodes,
  };
}

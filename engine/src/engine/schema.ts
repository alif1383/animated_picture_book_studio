import type { CrayonMaterialId, ColorToken } from '../theme/tokens';
import type { FillMaskBounds, FillMaskStyle } from './fillMask';

export type CharacterKind =
  | 'little_girl'
  | 'shopkeeper'
  | 'moon'
  | 'cat'
  | 'sun'
  | 'singing_radish'
  | 'watermelon_slice'
  | 'blue_party_cat'
  | 'hello_bug'
  | 'party_banana'
  | 'crying_onion'
  | 'cherry_twins'
  | 'acorn_twins'
  | 'olive_sprout'
  | 'birthday_strawberry';

export type CharacterState =
  | 'idle'
  | 'walking'
  | 'climbing'
  | 'sitting'
  | 'singing'
  | 'waving'
  | 'looking_up'
  | 'awake'
  | 'sleepy'
  | 'curious'
  | 'grumpy'
  | 'blinking'
  | 'sleeping';

export type BuildingKind = 'ochre_cottage' | 'corner_store';

export type PropKind =
  | 'tree'
  | 'grass_patch'
  | 'music_notes'
  | 'star_cluster'
  | 'pencil_numbers'
  | 'apple_crate'
  | 'street_lantern'
  | 'chimney_puffs'
  | 'bicycle'
  | 'fluffy_cloud'
  | 'meadow_flowers'
  | 'birthday_cake'
  | 'party_confetti';

export interface ProgressiveFillOptions {
  /** Stop-motion mask reveal style ('top-down-bands' | 'diagonal-strokes' | 'radial-scribble') */
  fillStyle?: FillMaskStyle;
  /** Initial fill progress in [0..1] (default: 1) */
  fillProgress?: number;
  /** Number of discrete stop-motion coloring steps (default: TOKENS.timing.defaultFillSteps) */
  fillSteps?: number;
  /** Preserves center-left raw paper negative space while wrapping sky down around right-side Moon */
  wrapRightNegativeSpace?: boolean;
}

export interface BaseSceneNode extends ProgressiveFillOptions {
  id: string;
  zIndex: number;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
  visible?: boolean;
}

export interface BackgroundPatchNode extends BaseSceneNode {
  type: 'background_patch';
  /** SVG path `d` string defining the organic partial-bleed vignette patch */
  d: string;
  /** Bounding box used by `renderFillMaskDef` for progressive stop-motion coloring */
  bounds: FillMaskBounds;
  /** Centralized pattern fill key (e.g., 'markerIndigoNight', 'crayonGrassGreen') */
  material: CrayonMaterialId;
  /** Optional charcoal outline toggle (default: false for soft marker/pastel vignette patches) */
  outlined?: boolean;
}

export interface BuildingNode extends BaseSceneNode {
  type: 'building';
  kind: BuildingKind;
  /** Whether windows emit warm crayon glow (#pat-crayon-window-glow) */
  windowLit?: boolean;
  /** Whether the cottage climbing ladder is visible */
  showLadder?: boolean;
  /** Optional custom sign text for corner_store (default: 'LUNE STORE') */
  signText?: string;
  /** Optional bounding box when progressive fill mask is applied to the building */
  bounds?: FillMaskBounds;
}

export interface CharacterNode extends BaseSceneNode {
  type: 'character';
  kind: CharacterKind;
  state: CharacterState;
  /** Moon option: blue-and-white striped sleeping nightcap with pom-pom */
  wearingNightcap?: boolean;
  /** Little girl option: holding fluffy white sheep plushie */
  holdingSheep?: boolean;
}

export interface PropNode extends BaseSceneNode {
  type: 'prop';
  kind: PropKind;
  /** Variant index or seed for trees, grass patches, stars, or notes */
  variant?: number;
  /** Number of items to emit/render (e.g., star count, note count, puff count, number count) */
  count?: number;
  /** Lantern glow or active prop toggle */
  lit?: boolean;
  bounds?: FillMaskBounds;
}

export interface AnnotationNode extends BaseSceneNode {
  type: 'annotation';
  /** Hand-lettered text or pencil numbers (e.g., '1  2  3  4  5', 'Goodnight, Little Moon ★') */
  text?: string;
  /** Optional hand-drawn dashed motion path `d` in local or scene space */
  dashedPath?: string;
  color?: ColorToken | string;
  fontSize?: number;
}

export type SceneNode =
  | BackgroundPatchNode
  | BuildingNode
  | CharacterNode
  | PropNode
  | AnnotationNode;

export interface NodeKeyframe {
  /** Timestamp in seconds (quantized to stepped clock during evaluation) */
  time: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
  visible?: boolean;
  /** Character state trigger at or after this keyframe */
  state?: CharacterState;
  /** Progressive fill progress [0..1] interpolated and stepped between keyframes */
  fillProgress?: number;
  /** Dynamic building/prop toggles */
  windowLit?: boolean;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  lit?: boolean;
  count?: number;
  /** If true, holds value until the next keyframe instead of stepped linear interpolation */
  hold?: boolean;
}

export interface TimelineTrack {
  nodeId: string;
  keyframes: NodeKeyframe[];
}

export interface CameraKeyframe {
  time: number;
  /** Camera pan offset X in canvas coordinates (default: 0) */
  x: number;
  /** Camera pan offset Y in canvas coordinates (default: 0) */
  y: number;
  /** Camera zoom factor (default: 1) */
  zoom: number;
  hold?: boolean;
}

export interface StoryAct {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  caption: string;
}

export type AudioCueKind =
  | 'lullaby'
  | 'crayon_scribble'
  | 'chime'
  | 'party_horn'
  | 'confetti_pop'
  | 'cheer_applause'
  | 'candle_blow'
  | 'giggle'
  | 'birthday_song';

export interface AudioNoteCue {
  time: number;
  /** Frequency in Hz */
  freq: number;
  duration: number;
  kind?: AudioCueKind;
}

export interface AudioClipCue {
  id?: string;
  /** URL or path to the audio file (e.g. '/audio/narration.mp3' or a data/blob URL) */
  src: string;
  /** Scene time (seconds) when this clip starts playing */
  startTime: number;
  /** Optional maximum duration (seconds) to play; defaults to full clip length */
  duration?: number;
  /** Optional offset (seconds) into the source audio file to start from (default: 0) */
  offsetSec?: number;
  /** Gain multiplier 0.0–2.0 (default: 1.0) */
  volume?: number;
  /** Optional human-readable label (e.g. 'Act 1 narration') */
  label?: string;
}

export interface SceneDefinition {
  id: string;
  title: string;
  subtitle?: string;
  durationSec: number;
  width?: number;
  height?: number;
  fps?: number;
  /** Whether this scene defaults to Vibrant Crayon Mode */
  vibrantMode?: boolean;
  acts: StoryAct[];
  nodes: SceneNode[];
  timeline: TimelineTrack[];
  camera?: CameraKeyframe[];
  audioCues?: AudioNoteCue[];
  /** External or generated audio file clips (e.g. TTS narration, music) synced to scene time */
  audioClips?: AudioClipCue[];
}

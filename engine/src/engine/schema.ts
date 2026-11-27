import type { CrayonMaterialId, ColorToken } from '../theme/tokens';
import type { FillMaskBounds, FillMaskStyle } from './fillMask';
import type {
  BookFrameConfig,
  BookFramePhase,
  EvaluatedBookFrameState,
} from './bookFrame';
import type {
  TheatricalFrameConfig,
  TheatricalFramePhase,
  EvaluatedTheatricalFrameState,
} from './theatricalFrame';

export type { BookFrameConfig, BookFramePhase, EvaluatedBookFrameState };
export type {
  TheatricalFrameConfig,
  TheatricalFramePhase,
  EvaluatedTheatricalFrameState,
};

/**
 * Supported animation rendering styles in the Studio engine:
 * - `'crayon'`: Warm 6 FPS wax-crayon / oil-pastel children's picture-book stop-motion
 * - `'classic_cel'`: 1970s–1980s classic hand-drawn cel animation (painted watercolor/gouache
 *   backgrounds + Xerox charcoal ink outlines + 2-tone cel shading + 12 FPS on-twos motion)
 */
export type AnimationStyleId = 'crayon' | 'classic_cel';

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
  | 'birthday_strawberry'
  | 'knight'
  | 'soldier'
  | 'dragon'
  | 'villager'
  | 'moonlit_cat'
  | 'bandana_dog'
  | 'old_badger'
  | 'red_squirrel'
  | 'snow_robin';

export type CharacterState =
  | 'idle'
  | 'walking'
  | 'climbing'
  | 'sitting'
  | 'singing'
  | 'waving'
  | 'reaching'
  | 'looking_up'
  | 'awake'
  | 'sleepy'
  | 'curious'
  | 'grumpy'
  | 'blinking'
  | 'sleeping';

export type BuildingKind =
  | 'ochre_cottage'
  | 'corner_store'
  | 'royal_castle'
  | 'scorched_cottage'
  | 'snowy_cottage';

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
  | 'party_confetti'
  | 'beach_umbrella'
  | 'ocean_waves'
  | 'water_splash'
  | 'swim_floatie'
  | 'beach_ball'
  | 'pizza_slice'
  | 'campfire'
  | 'spooky_tree'
  | 'dragon_fire'
  | 'wind_chime_arbor'
  | 'garden_fountain'
  | 'dog_tennis_ball'
  | 'dog_house'
  | 'dog_bowl'
  | 'bramble_thorn'
  | 'dragon_cave'
  | 'feast_table'
  | 'celebration_banner'
  | 'hearth_fireplace'
  | 'christmas_tree'
  | 'victorian_desk'
  | 'snowy_window'
  | 'falling_snow';

export type BubbleStyle = 'none' | 'speech' | 'thought';

export type BubbleTailDirection =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right';

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

export interface BackgroundPatchGradientStop {
  offset: string;
  color: string;
  opacity?: number;
}

export interface BackgroundPatchGradient {
  id?: string;
  type: 'linear' | 'radial';
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;
  cx?: string;
  cy?: string;
  r?: string;
  stops: BackgroundPatchGradientStop[];
}

export interface BackgroundPatchNode extends BaseSceneNode {
  type: 'background_patch';
  /** SVG path `d` string defining the organic partial-bleed vignette patch */
  d: string;
  /** Bounding box used by `renderFillMaskDef` for progressive stop-motion coloring */
  bounds: FillMaskBounds;
  /** Centralized pattern fill key (e.g., 'markerIndigoNight', 'crayonGrassGreen') */
  material: CrayonMaterialId;
  /** Optional direct fill color override (used by classic_cel painted gouache washes) */
  fill?: string;
  /** Optional painterly linear/radial gradient for classic_cel watercolor/gouache backdrops */
  gradient?: BackgroundPatchGradient;
  /** Optional soft watercolor/gouache edge filter in classic_cel mode (default: true) */
  softEdge?: boolean;
  /** Optional charcoal/sepia outline toggle (default: false for soft marker/pastel/gouache patches) */
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
  /** Little girl option: holding a warm cheesy pizza slice */
  holdingPizza?: boolean;
  /** Ocean swim option: inflatable wax-crayon swim-ring floatie wrapped around waist with water skirt */
  wearingFloatie?: boolean;
  /** Floatie style variant (0 = rubber ducky, 1 = red/white stripes, 2 = blue/gold stars, 3 = pink/yellow stripes, 4 = emerald/gold) */
  floatieVariant?: number;
  /** Knight & Soldier option: whether riding on horseback (default: true) or on foot (false) */
  mounted?: boolean;
  /** Optional speech or thought bubble text anchored directly above this character's head */
  speechText?: string;
  /** Style of the character-attached bubble ('speech' | 'thought', default: 'speech') */
  speechStyle?: 'speech' | 'thought';
  /** Optional tail direction override for the character-attached bubble (default: 'bottom-center') */
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
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
  /** Optional speech or thought bubble framing around `text` (default: 'none') */
  bubbleStyle?: BubbleStyle;
  /** Direction where the speech tail or thought puffs point toward the speaker (default: 'bottom-left') */
  tailDirection?: BubbleTailDirection;
  /** Optional custom fill color for speech/thought bubble (defaults to TOKENS.colors.paperWarm) */
  bubbleFill?: ColorToken | string;
  /** When true, local (0, 0) is the tip of the bottom tail/puff directly above a character's head */
  anchorAtTailTip?: boolean;
  /** Optional rendering style override ('crayon' | 'classic_cel') */
  artStyle?: AnimationStyleId;
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
  /** Dynamic building/prop/character/annotation toggles */
  windowLit?: boolean;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  holdingPizza?: boolean;
  wearingFloatie?: boolean;
  floatieVariant?: number;
  mounted?: boolean;
  speechText?: string;
  speechStyle?: 'speech' | 'thought';
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
  lit?: boolean;
  count?: number;
  text?: string;
  bubbleStyle?: BubbleStyle;
  tailDirection?: BubbleTailDirection;
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
  | 'birthday_song'
  | 'ocean_wave'
  | 'water_splash'
  | 'floatie_squeak'
  | 'fire_crackle'
  | 'dragon_fire'
  | 'spear_clink'
  | 'medieval_lute'
  | 'garden_wind_chime'
  | 'playful_bark'
  | 'dragon_hiccup'
  | 'sleigh_bell';

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
  /** Animation rendering style ('crayon' default, or 'classic_cel' for 1970s–80s hand-drawn cel animation) */
  artStyle?: AnimationStyleId;
  /** Whether this scene defaults to Vibrant Crayon Mode */
  vibrantMode?: boolean;
  /**
   * Optional Storybook Cover Opening & Ending/Credits Book-Frame configuration.
   * Scenes can customize cover/ending titles, credits, cover color, and open/close
   * durations, or set `false` to disable the book frame (enabled by default in `'crayon'` style;
   * disabled by default in `'classic_cel'` style unless explicitly enabled).
   */
  bookFrame?: BookFrameConfig | boolean;
  /**
   * Optional Classic Theatrical Opening/Closing Framing (circular iris or fade with gold-serif
   * title & "The End" cards). Enabled by default for `'classic_cel'` scenes.
   */
  theatricalFrame?: TheatricalFrameConfig | boolean;
  acts: StoryAct[];
  nodes: SceneNode[];
  timeline: TimelineTrack[];
  camera?: CameraKeyframe[];
  audioCues?: AudioNoteCue[];
  /** External or generated audio file clips (e.g. TTS narration, music) synced to scene time */
  audioClips?: AudioClipCue[];
}

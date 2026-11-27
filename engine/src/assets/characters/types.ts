import type {
  AnimationStyleId,
  CharacterKind,
  CharacterState,
} from '../../engine/schema';

export interface CharacterRenderOptions {
  kind: CharacterKind;
  state: CharacterState;
  artStyle?: AnimationStyleId;
  frameIndex?: number;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  holdingPizza?: boolean;
  wearingFloatie?: boolean;
  floatieVariant?: number;
  mounted?: boolean;
  isSpeaking?: boolean;
  speechText?: string;
  speechStyle?: 'speech' | 'thought';
  speechTail?: 'bottom-center' | 'bottom-left' | 'bottom-right';
  fillMask?: string;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
}

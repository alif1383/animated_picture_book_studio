import type { CharacterKind, CharacterState } from '../../engine/schema';

export interface CharacterRenderOptions {
  kind: CharacterKind;
  state: CharacterState;
  frameIndex?: number;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  holdingPizza?: boolean;
  wearingFloatie?: boolean;
  floatieVariant?: number;
  mounted?: boolean;
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

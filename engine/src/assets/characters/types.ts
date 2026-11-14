import type { CharacterKind, CharacterState } from '../../engine/schema';

export interface CharacterRenderOptions {
  kind: CharacterKind;
  state: CharacterState;
  frameIndex?: number;
  wearingNightcap?: boolean;
  holdingSheep?: boolean;
  wearingFloatie?: boolean;
  floatieVariant?: number;
  fillMask?: string;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
}

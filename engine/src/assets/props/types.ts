import type { AnimationStyleId, PropKind } from '../../engine/schema';

export interface PropRenderOptions {
  kind: PropKind;
  artStyle?: AnimationStyleId;
  frameIndex?: number;
  variant?: number;
  count?: number;
  lit?: boolean;
  fillMask?: string;
  id?: string;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
}

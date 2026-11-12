import type { PropKind } from '../../engine/schema';

export interface PropRenderOptions {
  kind: PropKind;
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

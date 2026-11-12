import type { BuildingKind } from '../../engine/schema';

export interface BuildingRenderOptions {
  kind: BuildingKind;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  flipX?: boolean;
  opacity?: number;
  /** Whether windows emit warm crayon glow (#pat-crayon-window-glow, default: true) */
  windowLit?: boolean;
  /** Whether the cottage right-side climbing ladder is visible (default: true) */
  showLadder?: boolean;
  /** Custom sign text for 'corner_store' (default: 'LUNE STORE') */
  signText?: string;
  /** Optional SVG mask url(#...) for progressive stop-motion coloring */
  fillMask?: string;
  id?: string;
}

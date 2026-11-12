import { round2 } from '../../engine/svgUtils';

/**
 * Generates an SVG path `d` string for a 5-point hand-drawn star at `(cx, cy)`.
 */
export function renderStarShape(
  cx: number,
  cy: number,
  r: number,
  rot = 0
): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.48;
    const angle = ((i * 36 + rot - 90) * Math.PI) / 180;
    const px = round2(cx + Math.cos(angle) * rad);
    const py = round2(cy + Math.sin(angle) * rad);
    pts.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

import { TOKENS } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  round2,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { WatercolorBlotch } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973) wet-on-wet
 * watercolor chimney soot & ash smoke puffs (`'chimney_puffs'`) drifting up-left
 * smoothly on a 12 FPS 20-frame loop (`steppedLoopProgress(frameIndex, 20)`).
 *
 * Origin: `(0, 0)` chimney mouth.
 * Bounds: `x: -48..+7, y: -74..+6` (for default `count = 3`).
 */
export function renderClassicChimneyPuffs(options: PropRenderOptions): string {
  const { frameIndex = 0, count, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;

  const puffCount = Math.max(0, count ?? 3);
  const children: string[] = [];

  for (let i = 0; i < puffCount; i++) {
    // 12 FPS smooth looping progress over 20 frames, staggered per puff
    const hop = steppedLoopProgress(frameIndex, 20, i * 6 + variant * 2);
    const curlSway = steppedOscillate(frameIndex, 20, 1.4, i * 5);

    const px = round2(-i * 11.5 - hop * 10.5);
    const py = round2(-i * 21 - hop * 16.5);
    const rx = round2(5.4 + i * 2.8 + hop * 1.8);
    const ry = round2(4.4 + i * 2.4 + hop * 1.5);
    const fade = round2(Math.max(0.24, 0.84 - i * 0.16 - hop * 0.14));

    const blotches: WatercolorBlotch[] = [
      // Outer soft ash watercolor billow
      {
        cx: px,
        cy: py,
        rx,
        ry,
        fill: i === 0 ? c.sootAsh : c.smokeSkyHaze,
        opacity: round2(fade * 0.62),
        rotate: round2(-12 + i * 7),
        irregularity: 0.24,
      },
      // Offset sunlit haze highlight pocket
      {
        cx: round2(px + rx * 0.18),
        cy: round2(py - ry * 0.2),
        rx: round2(rx * 0.68),
        ry: round2(ry * 0.64),
        fill: c.dayCloudShadow,
        opacity: round2(fade * 0.56),
        rotate: round2(10 - i * 5),
        irregularity: 0.22,
      },
      // Lower soot belly accent near chimney mouth
      {
        cx: round2(px - rx * 0.16),
        cy: round2(py + ry * 0.18),
        rx: round2(rx * 0.56),
        ry: round2(ry * 0.48),
        fill: c.sootAsh,
        opacity: round2(fade * 0.42),
        rotate: -6,
        irregularity: 0.2,
      },
    ];

    // Faint hand-drawn graphite smoke curl wisps
    const curlD =
      `M ${round2(px - rx * 0.58)} ${round2(py + ry * 0.25)} ` +
      `C ${round2(px - rx * 0.72 + curlSway * 0.5)} ${round2(py - ry * 0.55)}, ` +
      `${round2(px + rx * 0.35 + curlSway)} ${round2(py - ry * 0.72)}, ` +
      `${round2(px + rx * 0.52)} ${round2(py - ry * 0.15)}`;

    const innerCurlD =
      `M ${round2(px - rx * 0.18)} ${round2(py + ry * 0.38)} ` +
      `Q ${round2(px + rx * 0.32 - curlSway * 0.4)} ${round2(py + ry * 0.46)}, ` +
      `${round2(px + rx * 0.44)} ${round2(py + ry * 0.05)}`;

    children.push(
      svgEl('g', { 'data-part': 'chimney-puff' }, [
        watercolorWashBlotches(blotches, {
          seed: variant * 13 + i * 7 + 1,
          opacity: 1,
          wetEdge: false,
        }),
        xeroxSketchStroke(curlD, {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.85,
          broken: true,
          dasharray: '5 3 3 2',
          opacity: round2(fade * 0.54),
        }),
        xeroxSketchStroke(innerCurlD, {
          stroke: c.sootAsh,
          strokeWidth: 0.72,
          broken: true,
          dasharray: '4 3',
          opacity: round2(fade * 0.44),
        }),
      ])
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'chimney_puffs',
      'data-art-style': 'classic_cel',
    },
    children
  );
}

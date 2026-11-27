import { TOKENS } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Builds a tiny organic hand-painted irregular snow mote path centered around `(0, 0)`
 * so falling snow looks hand-painted on cels rather than sterile geometric dots.
 */
function buildSnowMotePath(r: number, idx: number, seed: number): string {
  const rx = round2(r * (1 + deterministicJitter(idx * 5 + 1, seed, 0.2)));
  const ry = round2(r * (0.86 + deterministicJitter(idx * 5 + 2, seed, 0.18)));
  const topY = round2(-ry);
  const botY = round2(ry);
  const leftX = round2(-rx);
  const rightX = round2(rx);
  const cx1 = round2(rx * 0.72);
  const cy1 = round2(ry * 0.78);
  return `M 0 ${topY} Q ${cx1} ${topY}, ${rightX} 0 Q ${cx1} ${botY}, 0 ${botY} Q ${round2(-cx1)} ${cy1}, ${leftX} 0 Q ${round2(-cx1)} ${topY}, 0 ${topY} Z`;
}

/**
 * Renders gentle 12 FPS hand-painted drifting winter snowfall (`'falling_snow'`)
 * across the `1280×720` frame:
 * - Soft irregular hand-drawn parchment-cream snow motes of varied parallax sizes
 *   drifting diagonally downward and swaying smoothly across 12 FPS frames.
 * - A few delicate hand-inked winter wind-swirl wisps (`xeroxSketchStroke`) —
 *   ZERO digital blur or neon glow!
 *
 * Origin: `(0, 0)` at top-left of `1280×720` canvas.
 * Respects `count` (default `34`) and `variant`.
 */
export function renderClassicFallingSnow(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;

  const flakeCount = Math.max(0, count ?? 34);
  const flakes: string[] = [];

  for (let i = 0; i < flakeCount; i++) {
    // 3 parallax depth tiers: 0 = distant small, 1 = mid, 2 = near soft mote
    const tier = i % 3;
    const loopFrames = tier === 2 ? 72 : tier === 1 ? 96 : 120;
    const progress = steppedLoopProgress(
      frameIndex,
      loopFrames,
      (i * 17 + variant * 11) % loopFrames
    );

    // Base spread across 1280x720 with gentle diagonal drift + smooth sinusoidal flutter
    const startX = ((i * 173 + variant * 89) % 1280) + deterministicJitter(i, variant, 24);
    const startY = ((i * 107 + variant * 43) % 720) + deterministicJitter(i + 31, variant, 18);

    const driftX = progress * (tier === 2 ? 150 : tier === 1 ? 110 : 76);
    const fallY = progress * 760;
    const sway = steppedOscillate(
      frameIndex,
      28 + (i % 4) * 8,
      tier === 2 ? 16 : tier === 1 ? 11 : 6.5,
      i * 7 + variant * 5
    );

    const fx = round2((((startX + driftX + sway) % 1320) + 1320) % 1320 - 20);
    const fy = round2((((startY + fallY) % 760) + 760) % 760 - 20);
    const rot = round2(
      steppedOscillate(frameIndex, 40, 18, i * 5) + deterministicJitter(i, variant, 25)
    );

    if (tier === 0) {
      // Distant delicate snow speck
      const r = round2(1.4 + Math.abs(deterministicJitter(i + 7, variant, 0.75)));
      flakes.push(
        svgEl('circle', {
          cx: fx,
          cy: fy,
          r,
          fill: i % 2 === 0 ? c.nightcapStripe : c.mochiFurRim,
          opacity: 0.62,
        })
      );
    } else if (tier === 1) {
      // Mid-ground organic hand-painted parchment snow mote
      const r = round2(2.6 + Math.abs(deterministicJitter(i + 13, variant, 1.1)));
      flakes.push(
        svgEl(
          'g',
          {
            transform: svgTransform({ x: fx, y: fy, rotate: rot }),
            opacity: 0.82,
          },
          [
            svgEl('path', {
              d: buildSnowMotePath(r, i, variant),
              fill: c.parchmentCream,
            }),
            svgEl('circle', {
              cx: round2(r * 0.18),
              cy: round2(r * 0.2),
              r: round2(r * 0.45),
              fill: c.mochiFurRim,
              opacity: 0.32,
            }),
          ]
        )
      );
    } else {
      // Near foreground fluffy hand-drawn snow mote (occasional tiny hand-inked flake cross)
      const r = round2(3.8 + Math.abs(deterministicJitter(i + 19, variant, 1.3)));
      const showCrystalCross = i % 9 === 2;
      flakes.push(
        svgEl(
          'g',
          {
            transform: svgTransform({ x: fx, y: fy, rotate: rot }),
            opacity: 0.9,
          },
          [
            svgEl('path', {
              d: buildSnowMotePath(r, i + 50, variant),
              fill: c.parchmentCream,
            }),
            svgEl('path', {
              d: buildSnowMotePath(round2(r * 0.62), i + 80, variant),
              fill: c.celCream,
              opacity: 0.72,
            }),
            showCrystalCross
              ? svgEl('path', {
                  d: `M 0 ${round2(-r * 1.15)} L 0 ${round2(r * 1.15)} M ${round2(-r * 1.15)} 0 L ${round2(r * 1.15)} 0`,
                  fill: 'none',
                  stroke: c.parchmentCream,
                  'stroke-width': 0.85,
                  'stroke-linecap': 'round',
                  opacity: 0.72,
                })
              : '',
          ]
        )
      );
    }
  }

  // 3 delicate hand-inked winter wind-swirl wisps drifting slowly across the canvas
  const wispCount = flakeCount > 0 ? 3 : 0;
  const windWisps: string[] = [];
  for (let w = 0; w < wispCount; w++) {
    const wProg = steppedLoopProgress(frameIndex, 96 + w * 24, w * 31 + variant * 13);
    const wx = round2((((w * 430 + variant * 120 + wProg * 360) % 1380) + 1380) % 1380 - 60);
    const wy = round2(
      120 + w * 185 + steppedOscillate(frameIndex, 48, 14, w * 11 + variant * 5)
    );
    windWisps.push(
      svgEl(
        'g',
        { transform: svgTransform({ x: wx, y: wy }) },
        [
          xeroxSketchStroke(
            'M -38 6 Q -14 -8, 12 -2 Q 32 2, 42 -9 C 46 -14, 38 -20, 32 -14',
            {
              stroke: w % 2 === 0 ? c.nightcapStripe : c.parchmentCream,
              strokeWidth: 1.1,
              broken: true,
              dasharray: '18 6 10 5',
              opacity: 0.28,
            }
          ),
        ]
      )
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'falling_snow',
      'data-art-style': 'classic_cel',
    },
    [
      windWisps.length > 0
        ? svgEl('g', { 'data-part': 'snow-wind-wisps' }, windWisps)
        : '',
      svgEl('g', { 'data-part': 'snow-flakes' }, flakes),
    ]
  );
}

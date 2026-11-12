import { TOKENS, svgUrl } from '../theme/tokens';
import { clamp01, deterministicJitter, round2, svgEl } from './svgUtils';

export type FillMaskStyle = 'top-down-bands' | 'diagonal-strokes' | 'radial-scribble';

export interface FillMaskBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FillMaskConfig {
  id: string;
  bounds: FillMaskBounds;
  style: FillMaskStyle;
  /** Continuous or pre-stepped progress in [0, 1] */
  progress: number;
  /** Number of discrete stop-motion coloring strokes (default: TOKENS.timing.defaultFillSteps) */
  steps?: number;
  /** Deterministic seed for organic hand-drawn stroke jitter */
  seed?: number;
  /**
   * When true on 'top-down-bands', recreates Reference Image 2's partial-bleed sky effect:
   * top bands span the full width of the page, while middle/lower bands wrap down around
   * the right side (e.g. around the Moon), preserving raw watercolor paper in the center-left!
   */
  wrapRightNegativeSpace?: boolean;
}

export interface QuantizedFillState {
  activeSteps: number;
  totalSteps: number;
  quantizedProgress: number;
}

/**
 * Quantizes a continuous [0..1] progress value into discrete stop-motion coloring steps.
 */
export function quantizeFillProgress(
  progress: number,
  steps: number = TOKENS.timing.defaultFillSteps
): QuantizedFillState {
  const totalSteps = Math.max(1, Math.floor(steps));
  const clamped = clamp01(progress);
  const activeSteps =
    clamped >= 0.999 ? totalSteps : Math.floor(clamped * totalSteps);
  return {
    activeSteps,
    totalSteps,
    quantizedProgress: round2(activeSteps / totalSteps),
  };
}

/**
 * Generates an SVG `<mask>` element whose white reveal strokes advance in discrete
 * stop-motion hand-coloring increments, roughened by `#crayon-stroke`.
 */
export function renderFillMaskDef(config: FillMaskConfig): string {
  const {
    id,
    bounds,
    style,
    progress,
    steps = TOKENS.timing.defaultFillSteps,
    seed = 1,
    wrapRightNegativeSpace = false,
  } = config;

  const { activeSteps, totalSteps } = quantizeFillProgress(progress, steps);
  const pad = 24;
  const maskX = bounds.x - pad;
  const maskY = bounds.y - pad;
  const maskW = bounds.width + pad * 2;
  const maskH = bounds.height + pad * 2;

  const revealShapes: string[] = [];

  if (activeSteps > 0) {
    if (style === 'top-down-bands') {
      if (wrapRightNegativeSpace) {
        // Split totalSteps into:
        // - First 75% of steps: top full-width canopy bands + right-side Moon wrap bands (recreating Ref Photo 2!)
        // - Final 25% of steps: fill in the remaining left-side lower sky bands (recreating Ref Photo 1 full starry sky!)
        const wrapPhaseSteps = Math.max(1, Math.round(totalSteps * 0.75));
        const fillLeftSteps = Math.max(1, totalSteps - wrapPhaseSteps);
        const topCanopyCount = Math.max(1, Math.ceil(wrapPhaseSteps * 0.55));
        const bandH = bounds.height / wrapPhaseSteps;

        // 1. Emit top canopy + right-wrap bands for steps 0 .. min(activeSteps, wrapPhaseSteps) - 1
        const phase1Active = Math.min(activeSteps, wrapPhaseSteps);
        for (let i = 0; i < phase1Active; i++) {
          const yMid = bounds.y + (i + 0.5) * bandH;
          const jLeft = deterministicJitter(i, seed, 14);
          const jRight = deterministicJitter(i + 31, seed, 14);
          const jWave = deterministicJitter(i + 73, seed, 5);

          const isRightWrapOnly = i >= topCanopyCount;
          const xStart = isRightWrapOnly
            ? bounds.x + bounds.width * 0.62 + jLeft * 1.4
            : bounds.x - 10 + jLeft;
          const xEnd = bounds.x + bounds.width + 10 + jRight;
          const xMid = round2((xStart + xEnd) / 2);

          revealShapes.push(
            svgEl('path', {
              d: `M ${round2(xStart)} ${round2(yMid)} Q ${xMid} ${round2(
                yMid + jWave
              )}, ${round2(xEnd)} ${round2(yMid - jWave * 0.5)}`,
              stroke: '#FFFFFF',
              'stroke-width': round2(bandH + 8),
              'stroke-linecap': 'round',
              fill: 'none',
            })
          );
        }

        // 2. If activeSteps > wrapPhaseSteps, progressively fill the remaining lower-left sky pocket
        if (activeSteps > wrapPhaseSteps) {
          const leftActive = activeSteps - wrapPhaseSteps;
          const lowerBandCount = wrapPhaseSteps - topCanopyCount;
          const bandsPerLeftStep = Math.max(1, Math.ceil(lowerBandCount / fillLeftSteps));
          const maxLowerBand = Math.min(
            wrapPhaseSteps,
            topCanopyCount + leftActive * bandsPerLeftStep
          );

          for (let i = topCanopyCount; i < maxLowerBand; i++) {
            const yMid = bounds.y + (i + 0.5) * bandH;
            const jLeft = deterministicJitter(i + 50, seed, 12);
            const jWave = deterministicJitter(i + 91, seed, 4);
            const xStart = bounds.x - 10 + jLeft;
            const xEnd = bounds.x + bounds.width * 0.68;
            const xMid = round2((xStart + xEnd) / 2);

            revealShapes.push(
              svgEl('path', {
                d: `M ${round2(xStart)} ${round2(yMid)} Q ${xMid} ${round2(
                  yMid + jWave
                )}, ${round2(xEnd)} ${round2(yMid)}`,
                stroke: '#FFFFFF',
                'stroke-width': round2(bandH + 8),
                'stroke-linecap': 'round',
                fill: 'none',
              })
            );
          }
        }
      } else {
        const bandH = bounds.height / totalSteps;
        for (let i = 0; i < activeSteps; i++) {
          const yMid = bounds.y + (i + 0.5) * bandH;
          const jLeft = deterministicJitter(i, seed, 14);
          const jRight = deterministicJitter(i + 31, seed, 14);
          const jWave = deterministicJitter(i + 73, seed, 5);
          const xStart = bounds.x - 10 + jLeft;
          const xEnd = bounds.x + bounds.width + 10 + jRight;
          const xMid = round2((xStart + xEnd) / 2);

          revealShapes.push(
            svgEl('path', {
              d: `M ${round2(xStart)} ${round2(yMid)} Q ${xMid} ${round2(
                yMid + jWave
              )}, ${round2(xEnd)} ${round2(yMid - jWave * 0.5)}`,
              stroke: '#FFFFFF',
              'stroke-width': round2(bandH + 8),
              'stroke-linecap': 'round',
              fill: 'none',
            })
          );
        }
      }
    } else if (style === 'diagonal-strokes') {
      // Diagonal crayon strokes from top-left to bottom-right (e.g., terracotta roof & grass in Ref Image 3)
      const totalSpan = bounds.width + bounds.height;
      const stepSpan = totalSpan / totalSteps;
      const strokeW = stepSpan * 1.15;

      for (let i = 0; i < activeSteps; i++) {
        const dOffset =
          (i + 0.5) * stepSpan + deterministicJitter(i, seed, 4);
        const x1 = bounds.x + dOffset - bounds.height * 0.85;
        const y1 = bounds.y + bounds.height + 10;
        const x2 = bounds.x + dOffset + 10;
        const y2 = bounds.y - 10;

        revealShapes.push(
          svgEl('path', {
            d: `M ${round2(x1)} ${round2(y1)} L ${round2(x2)} ${round2(y2)}`,
            stroke: '#FFFFFF',
            'stroke-width': round2(strokeW),
            'stroke-linecap': 'round',
            fill: 'none',
          })
        );
      }
    } else if (style === 'radial-scribble') {
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;
      const maxR = Math.hypot(bounds.width, bounds.height) * 0.56;
      const ringStep = maxR / totalSteps;

      for (let i = 0; i < activeSteps; i++) {
        if (i === 0) {
          revealShapes.push(
            svgEl('circle', {
              cx: round2(cx),
              cy: round2(cy),
              r: round2(ringStep * 1.45),
              fill: '#FFFFFF',
            })
          );
        } else {
          const r = (i + 0.5) * ringStep;
          revealShapes.push(
            svgEl('circle', {
              cx: round2(cx + deterministicJitter(i, seed, 2.5)),
              cy: round2(cy + deterministicJitter(i + 17, seed, 2.5)),
              r: round2(r),
              stroke: '#FFFFFF',
              'stroke-width': round2(ringStep * 1.38),
              fill: 'none',
            })
          );
        }
      }
    }
  }

  return svgEl(
    'mask',
    {
      id,
      maskUnits: 'userSpaceOnUse',
      maskContentUnits: 'userSpaceOnUse',
      x: round2(maskX),
      y: round2(maskY),
      width: round2(maskW),
      height: round2(maskH),
    },
    [
      // Black base hides everything outside active strokes
      svgEl('rect', {
        x: round2(maskX),
        y: round2(maskY),
        width: round2(maskW),
        height: round2(maskH),
        fill: '#000000',
      }),
      // White reveal strokes roughened by #crayon-stroke so the stop-motion fill boundary looks hand-drawn
      revealShapes.length > 0
        ? svgEl(
            'g',
            { filter: svgUrl(TOKENS.filters.ids.crayonStroke) },
            revealShapes
          )
        : '',
    ]
  );
}

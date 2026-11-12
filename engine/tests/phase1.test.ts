import { describe, it, expect } from 'vitest';
import { TOKENS, svgUrl } from '../src/theme/tokens';
import {
  crayonPath,
  svgTransform,
  quantizeStep,
} from '../src/engine/svgUtils';
import {
  renderEngineDefs,
  renderPaperCompositeLayer,
  getPatternFill,
} from '../src/engine/filters';
import {
  quantizeFillProgress,
  renderFillMaskDef,
} from '../src/engine/fillMask';

describe('Phase 1: Theme Tokens, SVG Pipeline & Progressive Stop-Motion Fill Masks', () => {
  it('enforces warm paper base and charcoal outlines (never pure #FFFFFF or #000000)', () => {
    for (const [key, hex] of Object.entries(TOKENS.colors)) {
      const upper = hex.toUpperCase();
      expect(upper, `Color token ${key} must not be pure white`).not.toBe('#FFFFFF');
      expect(upper, `Color token ${key} must not be pure black`).not.toBe('#000000');
    }
    expect(TOKENS.colors.paperWarm).toBe('#F4EFE6');
    expect(TOKENS.colors.charcoalOutline).toBe('#2B231D');
    expect(TOKENS.timing.fps).toBe(6);
  });

  it('builds clean SVG elements, transforms, and charcoal crayon paths', () => {
    const pathMarkup = crayonPath('M 0 0 L 10 10', getPatternFill('crayonTerracotta'), {
      useCrayonFilter: true,
    });
    expect(pathMarkup).toContain('fill="url(#pat-crayon-terracotta)"');
    expect(pathMarkup).toContain(`stroke="${TOKENS.colors.charcoalOutline}"`);
    expect(pathMarkup).toContain('filter="url(#crayon-stroke)"');

    expect(svgTransform({ x: 10, y: 20, rotate: 5, pivotX: 4, pivotY: 8 })).toBe(
      'translate(10, 20) rotate(5, 4, 8)'
    );
    expect(svgTransform({ x: 0, y: 0, scale: 1 })).toBe('');
    expect(quantizeStep(0.37, 10)).toBe(0.3);
  });

  it('renders Layer 2 #crayon-stroke filter with quantized boil seed and textured patterns', () => {
    const defsSeed3 = renderEngineDefs({ seed: 3 });
    expect(defsSeed3).toContain('id="crayon-stroke"');
    expect(defsSeed3).toContain('seed="3"');
    expect(defsSeed3).toContain('id="pat-marker-indigo-night"');
    expect(defsSeed3).toContain('id="pat-crayon-terracotta"');
    expect(defsSeed3).toContain('id="pat-crayon-warm-moon"');

    const defsDisabled = renderEngineDefs({ seed: 2, enableCrayonFilter: false });
    expect(defsDisabled).toContain('scale="0"');
  });

  it('renders Layer 3 Cold-Press Paper Composite with multiply blend and dry-brush flecks', () => {
    const layer3 = renderPaperCompositeLayer(960, 720, true);
    expect(layer3).toContain('id="layer-3-paper-composite"');
    expect(layer3).toContain('mix-blend-mode: multiply');
    expect(layer3).toContain(svgUrl(TOKENS.patterns.paperFlecks));

    const layer3Disabled = renderPaperCompositeLayer(960, 720, false);
    expect(layer3Disabled).toContain('data-enabled="false"');
  });

  it('generates quantized stop-motion progressive fill masks for all 3 fill styles', () => {
    expect(quantizeFillProgress(0, 10).activeSteps).toBe(0);
    expect(quantizeFillProgress(0.55, 10).activeSteps).toBe(5);
    expect(quantizeFillProgress(1, 10).activeSteps).toBe(10);

    const skyMask = renderFillMaskDef({
      id: 'mask-sky',
      bounds: { x: 0, y: 0, width: 960, height: 500 },
      style: 'top-down-bands',
      progress: 0.65,
      steps: 10,
      wrapRightNegativeSpace: true,
    });
    expect(skyMask).toContain('id="mask-sky"');
    expect(skyMask).toContain('filter="url(#crayon-stroke)"');
    // 6 active band paths
    expect(skyMask.match(/<path /g)?.length).toBe(6);

    const roofMask = renderFillMaskDef({
      id: 'mask-roof',
      bounds: { x: 40, y: 400, width: 320, height: 140 },
      style: 'diagonal-strokes',
      progress: 0.4,
      steps: 10,
    });
    expect(roofMask.match(/<path /g)?.length).toBe(4);

    const moonMask = renderFillMaskDef({
      id: 'mask-moon',
      bounds: { x: 600, y: 80, width: 220, height: 220 },
      style: 'radial-scribble',
      progress: 0.3,
      steps: 10,
    });
    expect(moonMask.match(/<circle /g)?.length).toBe(3);
  });
});

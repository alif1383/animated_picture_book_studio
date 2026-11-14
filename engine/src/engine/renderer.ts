import { TOKENS, svgUrl } from '../theme/tokens';
import { crayonPath, svgEl } from './svgUtils';
import {
  getPatternFill,
  renderEngineDefs,
  renderPaperCompositeLayer,
} from './filters';
import { FillMaskBounds, FillMaskStyle, renderFillMaskDef } from './fillMask';
import {
  EvaluatedNodeState,
  EvaluatedSceneFrame,
  evaluateSceneAtTime,
} from './timeline';
import type { SceneDefinition, SceneNode } from './schema';
import { renderBuilding } from '../assets/buildings';
import { renderCharacter } from '../assets/characters';
import { renderAnnotation, renderProp } from '../assets/objects';

export interface RenderSceneOptions {
  /** Toggle Layer 2 (#crayon-stroke / #crayon-outline displacement) */
  enableCrayonFilter?: boolean;
  /** Toggle Layer 3 (cold-press watercolor paper grain & dry-brush fleck composite) */
  enablePaperTexture?: boolean;
  /** Toggle progressive stop-motion fill masks (when false, renders fills at 100%) */
  enableProgressiveFill?: boolean;
  /** Toggle Vibrant Crayon Mode (high-saturation pigments & luminous paper tooth) */
  vibrant?: boolean;
  /** Optional override for progressive fill progress across all nodes (for studio scrubber) */
  overrideFillProgress?: number;
}

export interface RenderedSceneOutput {
  svg: string;
  frame: EvaluatedSceneFrame;
}

function defaultBoundsForNode(node: SceneNode): FillMaskBounds {
  switch (node.type) {
    case 'background_patch':
      return node.bounds;
    case 'building':
      return (
        node.bounds ??
        (node.kind === 'ochre_cottage'
          ? { x: -180, y: -260, width: 360, height: 265 }
          : { x: -145, y: -210, width: 315, height: 215 })
      );
    case 'character':
      return node.kind === 'moon' || node.kind === 'sun'
        ? { x: -135, y: -180, width: 270, height: 315 }
        : { x: -30, y: -100, width: 65, height: 110 };
    case 'prop':
      return (
        node.bounds ?? { x: -190, y: -140, width: 390, height: 205 }
      );
    case 'annotation':
      return { x: -50, y: -50, width: 400, height: 100 };
  }
}

function defaultFillStyleForNode(node: SceneNode): FillMaskStyle {
  if (node.fillStyle) return node.fillStyle;
  if (node.type === 'background_patch') return 'top-down-bands';
  if (
    node.type === 'character' &&
    (node.kind === 'moon' || node.kind === 'sun')
  )
    return 'radial-scribble';
  return 'diagonal-strokes';
}

function renderSingleNode(
  node: SceneNode,
  state: EvaluatedNodeState,
  frameIndex: number,
  fillMaskUrl?: string
): string {
  switch (node.type) {
    case 'background_patch': {
      return crayonPath(node.d, getPatternFill(node.material), {
        stroke: node.outlined ? TOKENS.colors.charcoalOutline : 'none',
        strokeWidth: node.outlined ? TOKENS.strokes.outlineMedium : 0,
        useCrayonFilter: true,
        mask: fillMaskUrl,
      });
    }
    case 'building': {
      return renderBuilding({
        kind: node.kind,
        windowLit: state.windowLit ?? node.windowLit,
        showLadder: node.showLadder,
        signText: node.signText,
        fillMask: fillMaskUrl,
      });
    }
    case 'character': {
      return renderCharacter({
        kind: node.kind,
        state: state.state ?? node.state,
        frameIndex,
        wearingNightcap: state.wearingNightcap ?? node.wearingNightcap,
        holdingSheep: state.holdingSheep ?? node.holdingSheep,
        wearingFloatie: state.wearingFloatie ?? node.wearingFloatie,
        floatieVariant: state.floatieVariant ?? node.floatieVariant,
        fillMask: fillMaskUrl,
      });
    }
    case 'prop': {
      return renderProp({
        kind: node.kind,
        frameIndex,
        variant: node.variant,
        count: state.count ?? node.count,
        lit: state.lit ?? node.lit,
        fillMask: fillMaskUrl,
      });
    }
    case 'annotation': {
      return renderAnnotation({
        text: node.text,
        dashedPath: node.dashedPath,
        color: node.color,
        fontSize: node.fontSize,
      });
    }
  }
}

/**
 * Evaluates the declarative SceneDefinition at `timeSec` (quantized to the 6 FPS clock)
 * and renders the complete SVG string through the Mandatory 3-Layer Render Pipeline:
 * 1. Layer 1: Base Scene Layer (warm cold-press paper `#F4EFE6` + sorted 2D cutouts & patches)
 * 2. Layer 2: SVG Crayon & Line-Boil Filter (`#crayon-stroke` with stepped `boilSeed` + progressive fill masks)
 * 3. Layer 3: Physical Paper Composite Layer (`mix-blend-mode: multiply` cold-press grain + dry-brush flecks)
 */
export function evaluateAndRenderScene(
  scene: SceneDefinition,
  timeSec: number,
  options: RenderSceneOptions = {}
): RenderedSceneOutput {
  const enableCrayonFilter = options.enableCrayonFilter ?? true;
  const enablePaperTexture = options.enablePaperTexture ?? true;
  const enableProgressiveFill = options.enableProgressiveFill ?? true;
  const vibrant = options.vibrant ?? scene.vibrantMode ?? false;

  const frame = evaluateSceneAtTime(
    scene,
    timeSec,
    scene.fps ?? TOKENS.timing.fps
  );
  const width = scene.width ?? TOKENS.canvas.width;
  const height = scene.height ?? TOKENS.canvas.height;

  // Sort nodes back-to-front by zIndex
  const sortedNodes = [...scene.nodes].sort((a, b) => a.zIndex - b.zIndex);

  const extraMaskDefs: string[] = [];
  const renderedNodeGroups: string[] = [];

  for (let idx = 0; idx < sortedNodes.length; idx++) {
    const node = sortedNodes[idx];
    const nodeState = frame.nodes[node.id];
    if (!nodeState || !nodeState.visible || nodeState.opacity <= 0) {
      continue;
    }

    const effectiveFillProgress =
      options.overrideFillProgress !== undefined
        ? options.overrideFillProgress
        : nodeState.fillProgress;

    let fillMaskUrl: string | undefined;
    if (
      enableProgressiveFill &&
      (effectiveFillProgress < 1 || node.wrapRightNegativeSpace)
    ) {
      const maskId = `fill-mask-${node.id}`;
      extraMaskDefs.push(
        renderFillMaskDef({
          id: maskId,
          bounds: defaultBoundsForNode(node),
          style: defaultFillStyleForNode(node),
          progress: effectiveFillProgress,
          steps: node.fillSteps ?? TOKENS.timing.defaultFillSteps,
          seed: idx + 1,
          wrapRightNegativeSpace: node.wrapRightNegativeSpace,
        })
      );
      fillMaskUrl = svgUrl(maskId);
    }

    const innerMarkup = renderSingleNode(
      node,
      nodeState,
      frame.clock.frameIndex,
      fillMaskUrl
    );

    renderedNodeGroups.push(
      svgEl(
        'g',
        {
          id: `node-${node.id}`,
          'data-node-type': node.type,
          transform: nodeState.transform || undefined,
          opacity: nodeState.opacity < 1 ? nodeState.opacity : undefined,
        },
        innerMarkup
      )
    );
  }

  // Layer 2 Filter & Pattern Defs (with stepped line-boil seed)
  const defsMarkup = renderEngineDefs({
    seed: frame.clock.boilSeed,
    enableCrayonFilter,
    enablePaperTexture,
    vibrant,
    extraDefs: extraMaskDefs,
  });

  // Layer 1 Base Scene Layer (warm cold-press watercolor paper + camera-rigged cutouts)
  const layer1BaseScene = svgEl(
    'g',
    {
      id: 'layer-1-base-scene',
      filter: vibrant ? svgUrl(TOKENS.filters.ids.vibrantGrade) : undefined,
    },
    [
      svgEl('rect', {
        id: 'paper-base',
        x: 0,
        y: 0,
        width,
        height,
        fill: TOKENS.colors.paperWarm,
      }),
      svgEl(
        'g',
        {
          id: 'camera-rig',
          transform: frame.camera.transform || undefined,
        },
        renderedNodeGroups
      ),
    ]
  );

  // Layer 3 Physical Paper Composite Layer
  const layer3Paper = renderPaperCompositeLayer(
    width,
    height,
    enablePaperTexture,
    vibrant
  );

  const svg = svgEl(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: `0 0 ${width} ${height}`,
      width: '100%',
      height: '100%',
      'data-frame': frame.clock.frameIndex,
      'data-boil-seed': frame.clock.boilSeed,
      'data-quantized-time': frame.clock.quantizedTimeSec,
      'data-vibrant': vibrant ? 'true' : 'false',
    },
    [defsMarkup, layer1BaseScene, layer3Paper]
  );

  return { svg, frame };
}

/**
 * Convenience wrapper returning the rendered SVG string for `(scene, timeSec, options)`.
 */
export function renderSceneToSvg(
  scene: SceneDefinition,
  timeSec: number,
  options: RenderSceneOptions = {}
): string {
  return evaluateAndRenderScene(scene, timeSec, options).svg;
}

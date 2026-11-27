import { TOKENS, svgUrl } from '../theme/tokens';
import { crayonPath, gouachePath, round2, svgEl } from './svgUtils';
import {
  getPatternFill,
  renderEngineDefs,
  renderFilmCompositeLayer,
  renderPaperCompositeLayer,
} from './filters';
import { FillMaskBounds, FillMaskStyle, renderFillMaskDef } from './fillMask';
import {
  EvaluatedNodeState,
  EvaluatedSceneFrame,
  evaluateSceneAtTime,
} from './timeline';
import {
  EvaluatedBookFrameState,
  evaluateBookFrameState,
  renderBookFrameOverlay,
} from './bookFrame';
import {
  EvaluatedTheatricalFrameState,
  evaluateTheatricalFrameState,
  renderTheatricalFrameOverlay,
} from './theatricalFrame';
import type {
  AnimationStyleId,
  BackgroundPatchGradient,
  SceneDefinition,
  SceneNode,
} from './schema';
import { renderBuilding } from '../assets/buildings';
import {
  getCharacterSpeechAnchor,
  renderCharacter,
} from '../assets/characters';
import { renderAnnotation, renderProp } from '../assets/objects';

export interface RenderSceneOptions {
  /** Override animation rendering style ('crayon' | 'classic_cel') */
  artStyle?: AnimationStyleId;
  /** Optional FPS override for stepped clock evaluation */
  fps?: number;
  /** Toggle Layer 2 (#crayon-stroke / #crayon-outline or #xerox-ink displacement) */
  enableCrayonFilter?: boolean;
  /** Toggle Layer 3 (cold-press watercolor paper grain or 35mm film grain composite) */
  enablePaperTexture?: boolean;
  /** Toggle progressive stop-motion fill masks (when false, renders fills at 100%) */
  enableProgressiveFill?: boolean;
  /** Toggle Vibrant Crayon Mode (high-saturation pigments & luminous paper tooth) */
  vibrant?: boolean;
  /** Toggle Storybook Cover Opening & Ending/Credits Book-Frame (default: true in crayon, false in classic_cel) */
  enableBookFrame?: boolean;
  /** Toggle Classic Theatrical Opening/Closing Iris & Title Card (default: true in classic_cel, false in crayon) */
  enableTheatricalFrame?: boolean;
  /** Optional override for progressive fill progress across all nodes (for studio scrubber) */
  overrideFillProgress?: number;
}

export interface RenderedSceneOutput {
  svg: string;
  frame: EvaluatedSceneFrame;
  bookFrame: EvaluatedBookFrameState;
  theatricalFrame?: EvaluatedTheatricalFrameState;
}

function defaultBoundsForNode(node: SceneNode): FillMaskBounds {
  switch (node.type) {
    case 'background_patch':
      return node.bounds;
    case 'building':
      return (
        node.bounds ??
        (node.kind === 'royal_castle'
          ? { x: -195, y: -335, width: 390, height: 345 }
          : node.kind === 'ochre_cottage' || node.kind === 'scorched_cottage'
          ? { x: -180, y: -260, width: 360, height: 265 }
          : { x: -145, y: -210, width: 315, height: 215 })
      );
    case 'character':
      return node.kind === 'moon' || node.kind === 'sun'
        ? { x: -135, y: -180, width: 270, height: 315 }
        : node.kind === 'dragon' || node.kind === 'knight' || node.kind === 'soldier'
        ? { x: -115, y: -155, width: 230, height: 195 }
        : node.kind === 'moonlit_cat'
        ? { x: -50, y: -88, width: 92, height: 98 }
        : node.kind === 'bandana_dog'
        ? { x: -50, y: -88, width: 100, height: 92 }
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

function renderBackgroundGradientDef(
  id: string,
  grad: BackgroundPatchGradient
): string {
  const stops = grad.stops.map((s) =>
    svgEl('stop', {
      offset: s.offset,
      'stop-color': s.color,
      'stop-opacity': s.opacity,
    })
  );
  if (grad.type === 'radial') {
    return svgEl(
      'radialGradient',
      {
        id,
        cx: grad.cx ?? '50%',
        cy: grad.cy ?? '50%',
        r: grad.r ?? '60%',
      },
      stops
    );
  }
  return svgEl(
    'linearGradient',
    {
      id,
      x1: grad.x1 ?? '0%',
      y1: grad.y1 ?? '0%',
      x2: grad.x2 ?? '0%',
      y2: grad.y2 ?? '100%',
    },
    stops
  );
}

function renderSingleNode(
  node: SceneNode,
  state: EvaluatedNodeState,
  frameIndex: number,
  artStyle: AnimationStyleId,
  fillMaskUrl?: string,
  gradientFillUrl?: string
): string {
  switch (node.type) {
    case 'background_patch': {
      if (artStyle === 'classic_cel') {
        const fill =
          gradientFillUrl ?? node.fill ?? getPatternFill(node.material);
        return gouachePath(node.d, fill, {
          softEdge: node.softEdge ?? true,
          stroke: node.outlined ? TOKENS.classicCel.colors.xeroxInkSoft : 'none',
          strokeWidth: node.outlined ? TOKENS.classicCel.strokes.xeroxFine : 0,
        });
      }
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
        artStyle,
        windowLit: state.windowLit ?? node.windowLit,
        showLadder: node.showLadder,
        signText: node.signText,
        fillMask: fillMaskUrl,
      });
    }
    case 'character': {
      const activeSpeechText = (state.speechText ?? node.speechText ?? '').trim();
      const activeSpeechStyle = state.speechStyle ?? node.speechStyle ?? 'speech';
      return renderCharacter({
        kind: node.kind,
        state: state.state ?? node.state,
        artStyle,
        frameIndex,
        wearingNightcap: state.wearingNightcap ?? node.wearingNightcap,
        holdingSheep: state.holdingSheep ?? node.holdingSheep,
        holdingPizza: state.holdingPizza ?? node.holdingPizza,
        wearingFloatie: state.wearingFloatie ?? node.wearingFloatie,
        floatieVariant: state.floatieVariant ?? node.floatieVariant,
        mounted: state.mounted ?? node.mounted,
        isSpeaking: activeSpeechText.length > 0 && activeSpeechStyle !== 'thought',
        fillMask: fillMaskUrl,
      });
    }
    case 'prop': {
      return renderProp({
        kind: node.kind,
        artStyle,
        frameIndex,
        variant: node.variant,
        count: state.count ?? node.count,
        lit: state.lit ?? node.lit,
        fillMask: fillMaskUrl,
      });
    }
    case 'annotation': {
      return renderAnnotation({
        text: state.text ?? node.text,
        dashedPath: node.dashedPath,
        color: node.color,
        fontSize: node.fontSize,
        bubbleStyle: state.bubbleStyle ?? node.bubbleStyle,
        tailDirection: state.tailDirection ?? node.tailDirection,
        bubbleFill: node.bubbleFill,
        artStyle: node.artStyle ?? artStyle,
      });
    }
  }
}

/**
 * Evaluates the declarative SceneDefinition at `timeSec` and renders the complete SVG string
 * through either:
 * - `'crayon'` (default): 3-Layer Picture-Book Crayon pipeline (6 FPS, `#crayon-stroke`, cold-press paper, `bookFrame`)
 * - `'classic_cel'`: 1970s–80s Classic Hand-Drawn Cel pipeline (12 FPS on twos, painted gouache backgrounds,
 *   Xerox charcoal ink & 2-tone cel characters, `theatricalFrame` iris/fade, 35mm film grain composite)
 */
export function evaluateAndRenderScene(
  scene: SceneDefinition,
  timeSec: number,
  options: RenderSceneOptions = {}
): RenderedSceneOutput {
  const artStyle: AnimationStyleId = options.artStyle ?? scene.artStyle ?? 'crayon';
  const isClassicCel = artStyle === 'classic_cel';

  const enableCrayonFilter = options.enableCrayonFilter ?? true;
  const enablePaperTexture = options.enablePaperTexture ?? true;
  const enableProgressiveFill =
    options.enableProgressiveFill ?? (isClassicCel ? false : true);
  const vibrant = options.vibrant ?? scene.vibrantMode ?? false;

  const defaultBookFrameEnabled = isClassicCel
    ? scene.bookFrame === true ||
      (typeof scene.bookFrame === 'object' &&
        scene.bookFrame !== null &&
        scene.bookFrame.enabled === true)
    : scene.bookFrame === false
    ? false
    : typeof scene.bookFrame === 'object' && scene.bookFrame !== null
    ? scene.bookFrame.enabled ?? true
    : true;
  const enableBookFrame = options.enableBookFrame ?? defaultBookFrameEnabled;

  const defaultTheatricalEnabled = isClassicCel
    ? scene.theatricalFrame === false
      ? false
      : typeof scene.theatricalFrame === 'object' && scene.theatricalFrame !== null
      ? scene.theatricalFrame.enabled ?? true
      : true
    : scene.theatricalFrame === true ||
      (typeof scene.theatricalFrame === 'object' &&
        scene.theatricalFrame !== null &&
        scene.theatricalFrame.enabled === true);
  const enableTheatricalFrame =
    options.enableTheatricalFrame ?? defaultTheatricalEnabled;

  const defaultFps = isClassicCel
    ? TOKENS.classicCel.timing.fps
    : TOKENS.timing.fps;
  const fps = options.fps ?? scene.fps ?? defaultFps;

  const frame = evaluateSceneAtTime(scene, timeSec, fps);
  const bookState = evaluateBookFrameState({
    timeSec,
    durationSec: scene.durationSec,
    fps,
    config: enableBookFrame ? scene.bookFrame : false,
    sceneTitle: scene.title,
    sceneSubtitle: scene.subtitle,
  });
  const theatricalState = evaluateTheatricalFrameState({
    timeSec,
    durationSec: scene.durationSec,
    fps,
    config: enableTheatricalFrame ? scene.theatricalFrame : false,
    sceneTitle: scene.title,
    sceneSubtitle: scene.subtitle,
  });

  const width = scene.width ?? TOKENS.canvas.width;
  const height = scene.height ?? TOKENS.canvas.height;

  // Sort nodes back-to-front by zIndex
  const sortedNodes = [...scene.nodes].sort((a, b) => a.zIndex - b.zIndex);

  const extraMaskDefs: string[] = [];
  const renderedNodeGroups: string[] = [];
  const renderedSpeechBubbles: string[] = [];

  for (let idx = 0; idx < sortedNodes.length; idx++) {
    const node = sortedNodes[idx];
    const nodeState = frame.nodes[node.id];
    if (!nodeState || !nodeState.visible || nodeState.opacity <= 0) {
      continue;
    }

    const baseFillProgress =
      options.overrideFillProgress !== undefined
        ? options.overrideFillProgress
        : nodeState.fillProgress;
    const effectiveFillProgress =
      enableBookFrame && bookState.enabled && bookState.phase !== 'story'
        ? baseFillProgress * bookState.colorFillMultiplier
        : baseFillProgress;

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

    let gradientFillUrl: string | undefined;
    if (
      isClassicCel &&
      node.type === 'background_patch' &&
      node.gradient &&
      node.gradient.stops.length > 0
    ) {
      const gradId = node.gradient.id ?? `bg-grad-${node.id}`;
      extraMaskDefs.push(renderBackgroundGradientDef(gradId, node.gradient));
      gradientFillUrl = svgUrl(gradId);
    }

    const innerMarkup = renderSingleNode(
      node,
      nodeState,
      frame.clock.frameIndex,
      artStyle,
      fillMaskUrl,
      gradientFillUrl
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

    if (node.type === 'character') {
      const speechText = (nodeState.speechText ?? node.speechText ?? '').trim();
      if (speechText.length > 0) {
        const anchor = getCharacterSpeechAnchor(node.kind, {
          state: nodeState.state ?? node.state,
          mounted: nodeState.mounted ?? node.mounted,
        });
        const headX = round2(
          nodeState.x +
            (nodeState.flipX ? -anchor.x : anchor.x) * nodeState.scale
        );
        const headY = round2(nodeState.y + anchor.y * nodeState.scale);
        const speechStyle =
          nodeState.speechStyle ?? node.speechStyle ?? 'speech';
        const speechTail =
          nodeState.speechTail ?? node.speechTail ?? 'bottom-center';

        renderedSpeechBubbles.push(
          svgEl(
            'g',
            {
              id: `speech-${node.id}`,
              'data-character-speech': node.id,
              opacity: nodeState.opacity < 1 ? nodeState.opacity : undefined,
            },
            renderAnnotation({
              x: headX,
              y: headY,
              text: speechText,
              bubbleStyle: speechStyle,
              tailDirection: speechTail,
              anchorAtTailTip: true,
              artStyle,
            })
          )
        );
      }
    }
  }

  // Layer 2 Filter & Pattern Defs
  const defsMarkup = renderEngineDefs({
    seed: frame.clock.boilSeed,
    enableCrayonFilter,
    enablePaperTexture,
    vibrant,
    artStyle,
    extraDefs: extraMaskDefs,
  });

  const innerSceneMarkup = [
    svgEl('rect', {
      id: isClassicCel ? 'cel-backdrop' : 'paper-base',
      x: 0,
      y: 0,
      width,
      height,
      fill: isClassicCel
        ? TOKENS.classicCel.colors.backdropDark
        : TOKENS.colors.paperWarm,
    }),
    svgEl(
      'g',
      {
        id: 'camera-rig',
        transform: frame.camera.transform || undefined,
      },
      [...renderedNodeGroups, ...renderedSpeechBubbles]
    ),
  ].join('');

  const bookWrapped = renderBookFrameOverlay({
    innerSceneMarkup,
    width,
    height,
    bookState,
    frameIndex: frame.clock.frameIndex,
  });

  const layer1Content = renderTheatricalFrameOverlay({
    innerSceneMarkup: bookWrapped,
    width,
    height,
    theatricalState,
  });

  const layer1Filter = isClassicCel
    ? svgUrl(TOKENS.classicCel.filters.ids.celGrade)
    : vibrant
    ? svgUrl(TOKENS.filters.ids.vibrantGrade)
    : undefined;

  const layer1BaseScene = svgEl(
    'g',
    {
      id: 'layer-1-base-scene',
      filter: layer1Filter,
    },
    layer1Content
  );

  // Layer 3 Composite: Paper tooth for crayon, 35mm film grain & vignette for classic_cel
  const layer3Composite = isClassicCel
    ? renderFilmCompositeLayer(width, height, enablePaperTexture)
    : renderPaperCompositeLayer(width, height, enablePaperTexture, vibrant);

  const svg = svgEl(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: `0 0 ${width} ${height}`,
      width: '100%',
      height: '100%',
      'data-art-style': artStyle,
      'data-frame': frame.clock.frameIndex,
      'data-boil-seed': frame.clock.boilSeed,
      'data-quantized-time': frame.clock.quantizedTimeSec,
      'data-vibrant': vibrant ? 'true' : 'false',
      'data-book-phase': bookState.enabled ? bookState.phase : 'disabled',
      'data-theatrical-phase': theatricalState.enabled
        ? theatricalState.phase
        : 'disabled',
    },
    [defsMarkup, layer1BaseScene, layer3Composite]
  );

  return { svg, frame, bookFrame: bookState, theatricalFrame: theatricalState };
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

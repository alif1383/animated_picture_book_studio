import { TOKENS, svgUrl } from '../theme/tokens';

export type SvgAttrValue = string | number | boolean | undefined | null;
export type SvgAttrMap = Record<string, SvgAttrValue>;

/**
 * Formats a dictionary of SVG attributes into an HTML/SVG attribute string.
 * Omits undefined, null, or false attributes.
 */
export function svgAttrs(attrs: SvgAttrMap): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(attrs)) {
    if (val === undefined || val === null || val === false) continue;
    if (val === true) {
      parts.push(key);
    } else {
      parts.push(`${key}="${String(val).replace(/"/g, '&quot;')}"`);
    }
  }
  return parts.join(' ');
}

/**
 * Pure SVG element string builder that works identically in Node tests and browser DOM.
 */
export function svgEl(
  tag: string,
  attrs: SvgAttrMap = {},
  children?: string | Array<string | undefined | null | false>
): string {
  const attrStr = svgAttrs(attrs);
  const openTag = attrStr ? `<${tag} ${attrStr}` : `<${tag}`;
  if (children === undefined || children === null) {
    return `${openTag} />`;
  }
  const inner = Array.isArray(children)
    ? children.filter(Boolean).join('')
    : children;
  if (inner.length === 0) {
    return `${openTag} />`;
  }
  return `${openTag}>${inner}</${tag}>`;
}

export interface CrayonStrokeOptions {
  stroke?: string;
  strokeWidth?: number;
  dasharray?: string;
  useOutlineFilter?: boolean;
  useCrayonFilter?: boolean;
  opacity?: number;
}

/**
 * Returns standard charcoal pencil outline attributes from centralized TOKENS.
 */
export function crayonStrokeAttrs(options: CrayonStrokeOptions = {}): SvgAttrMap {
  const {
    stroke = TOKENS.colors.charcoalOutline,
    strokeWidth = TOKENS.strokes.outlineMedium,
    dasharray,
    useOutlineFilter = false,
    useCrayonFilter = false,
    opacity,
  } = options;

  let filter: string | undefined;
  if (useCrayonFilter) {
    filter = svgUrl(TOKENS.filters.ids.crayonStroke);
  } else if (useOutlineFilter) {
    filter = svgUrl(TOKENS.filters.ids.crayonOutline);
  }

  return {
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linecap': TOKENS.strokes.linecap,
    'stroke-linejoin': TOKENS.strokes.linejoin,
    'stroke-dasharray': dasharray,
    filter,
    opacity,
  };
}

/**
 * Convenience helper to render a `<path>` with textured fill and charcoal crayon outline.
 * When `mask` is provided and `stroke !== 'none'`, renders the masked fill underneath an
 * unmasked charcoal pencil outline so stop-motion coloring fills inside visible pencil lines.
 */
export function crayonPath(
  d: string,
  fill: string,
  options: CrayonStrokeOptions & {
    mask?: string;
    id?: string;
    paperUnderlay?: boolean;
  } = {}
): string {
  const { mask, id, paperUnderlay = false, ...strokeOpts } = options;
  if (mask && strokeOpts.stroke !== 'none' && fill !== 'none') {
    const underlay = paperUnderlay
      ? svgEl('path', {
          d,
          fill: TOKENS.colors.paperWarm,
          stroke: 'none',
        })
      : '';
    const maskedFill = svgEl('path', {
      d,
      fill,
      mask,
      stroke: 'none',
    });
    const outline = svgEl('path', {
      d,
      fill: 'none',
      ...crayonStrokeAttrs(strokeOpts),
    });
    return svgEl('g', { id }, [underlay, maskedFill, outline]);
  }

  return svgEl('path', {
    id,
    d,
    fill,
    mask,
    ...crayonStrokeAttrs(strokeOpts),
  });
}

export interface CelStrokeOptions {
  stroke?: string;
  strokeWidth?: number;
  dasharray?: string;
  useXeroxFilter?: boolean;
  opacity?: number;
}

/**
 * Returns crisp 1970s–80s Xerox charcoal pencil-ink outline attributes from `TOKENS.classicCel`.
 */
export function celStrokeAttrs(options: CelStrokeOptions = {}): SvgAttrMap {
  const {
    stroke = TOKENS.classicCel.colors.xeroxInk,
    strokeWidth = TOKENS.classicCel.strokes.xeroxMedium,
    dasharray,
    useXeroxFilter = false,
    opacity,
  } = options;

  return {
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linecap': TOKENS.strokes.linecap,
    'stroke-linejoin': TOKENS.strokes.linejoin,
    'stroke-dasharray': dasharray,
    filter: useXeroxFilter
      ? svgUrl(TOKENS.classicCel.filters.ids.xeroxInk)
      : undefined,
    opacity,
  };
}

/**
 * Renders a classic opaque matte cel-painted `<path>` with raw 1970s–80s
 * electrostatic Xerox graphite-toner outline (`useXeroxFilter: true` by default
 * whenever a visible stroke is drawn).
 */
export function celPath(
  d: string,
  fill: string,
  options: CelStrokeOptions & { id?: string; clipPath?: string } = {}
): string {
  const { id, clipPath, useXeroxFilter, ...strokeOpts } = options;
  const effectiveStroke = strokeOpts.stroke ?? TOKENS.classicCel.colors.xeroxInk;
  const effectiveStrokeWidth =
    strokeOpts.strokeWidth ?? TOKENS.classicCel.strokes.xeroxMedium;
  const applyXerox =
    useXeroxFilter !== undefined
      ? useXeroxFilter
      : effectiveStroke !== 'none' && effectiveStrokeWidth > 0;

  return svgEl('path', {
    id,
    d,
    fill,
    'clip-path': clipPath,
    ...celStrokeAttrs({ ...strokeOpts, useXeroxFilter: applyXerox }),
  });
}

export interface XeroxSketchStrokeOptions {
  id?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Optional custom dasharray for broken/feathery graphite pencil strokes */
  dasharray?: string;
  /** When true, uses a broken/feathery graphite dash pattern if `dasharray` is omitted */
  broken?: boolean;
  opacity?: number;
  /** Apply `#xerox-ink` toner grit filter (default: true) */
  useXeroxFilter?: boolean;
  /** Optional subtle double-pass pencil feathering for organic animator sketch pressure */
  feather?: boolean;
}

/**
 * Renders broken/feathery internal Xerox graphite pencil construction lines:
 * fur tufts, cheek/whisker ticks, cloth creases, wood-grain scratches, and grass ink flicks.
 */
export function xeroxSketchStroke(
  d: string,
  options: XeroxSketchStrokeOptions = {}
): string {
  const {
    id,
    stroke = TOKENS.classicCel.colors.xeroxInk,
    strokeWidth = TOKENS.classicCel.strokes.sketchLine,
    dasharray,
    broken = false,
    opacity = 0.84,
    useXeroxFilter = true,
    feather = false,
  } = options;

  const effectiveDash = dasharray ?? (broken ? '7 3 3 2.5' : undefined);
  const primary = svgEl('path', {
    id: feather ? undefined : id,
    d,
    fill: 'none',
    ...celStrokeAttrs({
      stroke,
      strokeWidth,
      dasharray: effectiveDash,
      useXeroxFilter,
      opacity: round2(opacity),
    }),
  });

  if (!feather) {
    return primary;
  }

  const whisper = svgEl('path', {
    d,
    fill: 'none',
    transform: 'translate(0.55, 0.35)',
    ...celStrokeAttrs({
      stroke: TOKENS.classicCel.colors.xeroxInkSoft,
      strokeWidth: round2(Math.max(0.55, strokeWidth * 0.65)),
      dasharray: effectiveDash ?? '9 4 4 3',
      useXeroxFilter,
      opacity: round2(opacity * 0.48),
    }),
  });

  return svgEl('g', { id, 'data-part': 'xerox-sketch' }, [whisper, primary]);
}

export interface CelShadedShapeOptions {
  d: string;
  baseFill: string;
  shadowPaths?: string[];
  shadowFill?: string;
  shadowOpacity?: number;
  highlightPaths?: string[];
  highlightFill?: string;
  highlightOpacity?: number;
  clipId: string;
  stroke?: string;
  strokeWidth?: number;
  useXeroxFilter?: boolean;
  id?: string;
}

/**
 * Renders an authentic 2-tone matte cel-shaded shape:
 * 1) solid opaque flat matte cel paint base,
 * 2) crisp clipped cel shadow band(s) and optional rim/specular highlight(s),
 * 3) raw Xerox graphite-toner outline drawn over top so internal paint seams stay crisp.
 */
export function celShadedShape(opts: CelShadedShapeOptions): string {
  const {
    d,
    baseFill,
    shadowPaths = [],
    shadowFill,
    shadowOpacity = 1,
    highlightPaths = [],
    highlightFill,
    highlightOpacity = 0.85,
    clipId,
    stroke = TOKENS.classicCel.colors.xeroxInk,
    strokeWidth = TOKENS.classicCel.strokes.xeroxMedium,
    useXeroxFilter = true,
    id,
  } = opts;

  const hasInterior =
    (shadowPaths.length > 0 && shadowFill) ||
    (highlightPaths.length > 0 && highlightFill);

  if (!hasInterior) {
    return celPath(d, baseFill, { id, stroke, strokeWidth, useXeroxFilter });
  }

  const clipDef = svgEl('clipPath', { id: clipId }, svgEl('path', { d }));
  const baseEl = svgEl('path', { d, fill: baseFill, stroke: 'none' });
  const interiorEls: string[] = [];

  if (shadowFill) {
    for (const sp of shadowPaths) {
      interiorEls.push(
        svgEl('path', {
          d: sp,
          fill: shadowFill,
          opacity: shadowOpacity < 1 ? shadowOpacity : undefined,
          stroke: 'none',
        })
      );
    }
  }
  if (highlightFill) {
    for (const hp of highlightPaths) {
      interiorEls.push(
        svgEl('path', {
          d: hp,
          fill: highlightFill,
          opacity: highlightOpacity < 1 ? highlightOpacity : undefined,
          stroke: 'none',
        })
      );
    }
  }

  const clippedInterior = svgEl(
    'g',
    { 'clip-path': svgUrl(clipId) },
    interiorEls
  );
  const outlineEl =
    stroke !== 'none' && strokeWidth > 0
      ? svgEl('path', {
          d,
          fill: 'none',
          ...celStrokeAttrs({ stroke, strokeWidth, useXeroxFilter }),
        })
      : '';

  return svgEl('g', { id }, [clipDef, baseEl, clippedInterior, outlineEl]);
}

/**
 * Renders a painterly watercolor/gouache background wash path for `classic_cel` scenes.
 */
export function gouachePath(
  d: string,
  fill: string,
  options: {
    id?: string;
    softEdge?: boolean;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
  } = {}
): string {
  const {
    id,
    softEdge = true,
    stroke = 'none',
    strokeWidth = 0,
    opacity,
  } = options;
  return svgEl('path', {
    id,
    d,
    fill,
    stroke,
    'stroke-width': strokeWidth > 0 ? strokeWidth : undefined,
    'stroke-linecap': strokeWidth > 0 ? TOKENS.strokes.linecap : undefined,
    'stroke-linejoin': strokeWidth > 0 ? TOKENS.strokes.linejoin : undefined,
    filter: softEdge
      ? svgUrl(TOKENS.classicCel.filters.ids.gouacheWash)
      : undefined,
    opacity,
  });
}

export interface GouacheDab {
  /** Center X of the brush blotch */
  cx: number;
  /** Center Y of the brush blotch */
  cy: number;
  /** Horizontal radius of the paint dab */
  rx: number;
  /** Vertical radius of the paint dab */
  ry: number;
  /** Optional rotation in degrees */
  rotate?: number;
  /** Optional pigment fill override for this individual dab */
  fill?: string;
  /** Optional translucency override for this individual dab */
  opacity?: number;
}

export interface GouacheDabWashOptions {
  id?: string;
  /** Default pigment fill for dabs without an explicit `fill` */
  fill: string;
  /** Optional darker capillary wet-edge pigment ring color (defaults to each dab's fill) */
  wetEdgeColor?: string;
  /** Wet-edge ring opacity (0 disables wet-edge rim; default: 0.24) */
  wetEdgeOpacity?: number;
  /** Overall wash group opacity (default: 0.88) */
  opacity?: number;
  /** Apply `#gouache-wash` brush-mottle & optical softness filter (default: true) */
  softEdge?: boolean;
  /** Deterministic seed for irregular organic brush blotch silhouettes (default: 1) */
  seed?: number;
  /** Optional secondary dappled sunlit/moonlit highlight pigment layered inside dabs */
  highlightFill?: string;
  /** Opacity of the dappled inner highlight patches (default: 0.24) */
  highlightOpacity?: number;
}

/**
 * Generates an organic closed 8-point hand-brushed watercolor/gouache blotch path
 * centered around `(0, 0)` with deterministic bristle irregularity.
 */
function buildOrganicGouacheBlotchPath(
  rx: number,
  ry: number,
  dabIndex: number,
  seed: number
): string {
  const count = 8;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const mod = 1 + deterministicJitter(dabIndex * 19 + i, seed, 0.22);
    pts.push({
      x: round2(Math.cos(angle) * rx * mod),
      y: round2(Math.sin(angle) * ry * mod),
    });
  }
  const startMidX = round2((pts[count - 1].x + pts[0].x) / 2);
  const startMidY = round2((pts[count - 1].y + pts[0].y) / 2);
  const segs: string[] = [`M ${startMidX} ${startMidY}`];
  for (let i = 0; i < count; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % count];
    const midX = round2((curr.x + next.x) / 2);
    const midY = round2((curr.y + next.y) / 2);
    segs.push(`Q ${curr.x} ${curr.y} ${midX} ${midY}`);
  }
  segs.push('Z');
  return segs.join(' ');
}

/**
 * Composes dappled, blotchy, translucent watercolor/gouache foliage, cloud, or sky
 * brushwork washes with capillary wet-edge mottling for authentic 1970s painted
 * illustration-board backgrounds.
 */
export function gouacheDabWash(
  dabs: readonly GouacheDab[],
  options: GouacheDabWashOptions
): string {
  const {
    id,
    fill,
    wetEdgeColor,
    wetEdgeOpacity = 0.24,
    opacity = 0.88,
    softEdge = true,
    seed = 1,
    highlightFill,
    highlightOpacity = 0.24,
  } = options;

  const children: string[] = [];

  for (let idx = 0; idx < dabs.length; idx++) {
    const dab = dabs[idx];
    const dabFill = dab.fill ?? fill;
    const dabOpacity = dab.opacity ?? 0.78;
    const d = buildOrganicGouacheBlotchPath(dab.rx, dab.ry, idx + 1, seed);
    const transform = svgTransform({
      x: dab.cx,
      y: dab.cy,
      rotate: dab.rotate,
    });
    const edgeWidth =
      wetEdgeOpacity > 0
        ? round2(Math.max(1.2, Math.min(dab.rx, dab.ry) * 0.14))
        : 0;

    children.push(
      svgEl('path', {
        d,
        transform: transform || undefined,
        fill: dabFill,
        'fill-opacity': round2(dabOpacity),
        stroke: edgeWidth > 0 ? wetEdgeColor ?? dabFill : 'none',
        'stroke-width': edgeWidth > 0 ? edgeWidth : undefined,
        'stroke-opacity': edgeWidth > 0 ? round2(wetEdgeOpacity) : undefined,
        'stroke-linejoin': edgeWidth > 0 ? 'round' : undefined,
      })
    );

    if (highlightFill && idx % 2 === 0) {
      const innerD = buildOrganicGouacheBlotchPath(
        dab.rx * 0.56,
        dab.ry * 0.52,
        idx + 37,
        seed + 5
      );
      const innerTransform = svgTransform({
        x: dab.cx - dab.rx * 0.14,
        y: dab.cy - dab.ry * 0.16,
        rotate: dab.rotate,
      });
      children.push(
        svgEl('path', {
          d: innerD,
          transform: innerTransform || undefined,
          fill: highlightFill,
          'fill-opacity': round2(highlightOpacity),
          stroke: 'none',
        })
      );
    }
  }

  return svgEl(
    'g',
    {
      id,
      'data-part': 'gouache-dab-wash',
      opacity: opacity < 1 ? round2(opacity) : undefined,
      filter: softEdge
        ? svgUrl(TOKENS.classicCel.filters.ids.gouacheWash)
        : undefined,
    },
    children
  );
}

export interface WatercolorBlotch {
  /** Center X of the wet-on-wet watercolor puddle */
  cx: number;
  /** Center Y of the wet-on-wet watercolor puddle */
  cy: number;
  /** Horizontal radius of the watercolor wash puddle */
  rx: number;
  /** Vertical radius of the watercolor wash puddle */
  ry: number;
  /** Watercolor pigment color */
  fill: string;
  /** Translucent wash opacity (default: 0.58) */
  opacity?: number;
  /** Optional rotation in degrees */
  rotate?: number;
  /** Irregular contour wobble amplitude (0..0.4, default: 0.28) */
  irregularity?: number;
}

export interface WatercolorWashBlotchesOptions {
  id?: string;
  /** Overall group opacity (default: 1) */
  opacity?: number;
  /** Deterministic seed for organic puddle contours (default: 1) */
  seed?: number;
  /** Apply `#watercolor-wash-soft` wet-on-wet bleed & feather filter (default: true) */
  softWash?: boolean;
  /** Optional subtle darker pigment ring at puddle edges (default: false) */
  wetEdge?: boolean;
}

/**
 * Generates an irregular 10-point organic wet-on-wet watercolor puddle silhouette.
 */
function buildWatercolorPuddlePath(
  rx: number,
  ry: number,
  index: number,
  seed: number,
  irregularity: number
): string {
  const count = 10;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const mod = 1 + deterministicJitter(index * 23 + i, seed, irregularity);
    const angleShift = deterministicJitter(index * 29 + i, seed + 3, 0.14);
    pts.push({
      x: round2(Math.cos(angle + angleShift) * rx * mod),
      y: round2(Math.sin(angle + angleShift) * ry * mod),
    });
  }
  const startMidX = round2((pts[count - 1].x + pts[0].x) / 2);
  const startMidY = round2((pts[count - 1].y + pts[0].y) / 2);
  const segs: string[] = [`M ${startMidX} ${startMidY}`];
  for (let i = 0; i < count; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % count];
    const midX = round2((curr.x + next.x) / 2);
    const midY = round2((curr.y + next.y) / 2);
    segs.push(`Q ${curr.x} ${curr.y} ${midX} ${midY}`);
  }
  segs.push('Z');
  return segs.join(' ');
}

/**
 * Renders overlapping irregular, soft-feathered wet-on-wet watercolor puddles
 * (`filter="url(#watercolor-wash-soft)"`) for mottled skies, foliage canopies,
 * woodland bushes, and dappled ground washes (1973 Robin Hood watercolor style).
 */
export function watercolorWashBlotches(
  blotches: readonly WatercolorBlotch[],
  options: WatercolorWashBlotchesOptions = {}
): string {
  const {
    id,
    opacity = 1,
    seed = 1,
    softWash = true,
    wetEdge = false,
  } = options;

  const children = blotches.map((b, idx) => {
    const d = buildWatercolorPuddlePath(
      b.rx,
      b.ry,
      idx + 1,
      seed,
      b.irregularity ?? 0.28
    );
    const transform = svgTransform({
      x: b.cx,
      y: b.cy,
      rotate: b.rotate,
    });
    const edgeW = wetEdge
      ? round2(Math.max(1.5, Math.min(b.rx, b.ry) * 0.12))
      : 0;
    return svgEl('path', {
      d,
      transform: transform || undefined,
      fill: b.fill,
      'fill-opacity': round2(b.opacity ?? 0.58),
      stroke: wetEdge ? b.fill : 'none',
      'stroke-width': edgeW > 0 ? edgeW : undefined,
      'stroke-opacity': wetEdge ? 0.22 : undefined,
      'stroke-linejoin': wetEdge ? 'round' : undefined,
    });
  });

  return svgEl(
    'g',
    {
      id,
      'data-part': 'watercolor-wash-blotches',
      opacity: opacity < 1 ? round2(opacity) : undefined,
      filter: softWash
        ? svgUrl(TOKENS.classicCel.filters.watercolorSoft.id)
        : undefined,
    },
    children
  );
}

export interface PencilFoliageCluster {
  /** Center X of the scribbled foliage pocket */
  cx: number;
  /** Center Y of the scribbled foliage pocket */
  cy: number;
  /** Horizontal spread radius of the scribble cluster */
  rx: number;
  /** Vertical spread radius of the scribble cluster */
  ry: number;
  /** Relative density multiplier for curly leaf loops & stipples (default: 1) */
  density?: number;
  /** Optional stroke color override for this cluster */
  stroke?: string;
  /** Optional opacity override for this cluster */
  opacity?: number;
  /** Optional per-cluster seed offset */
  seed?: number;
}

export interface PencilFoliageScribblesOptions {
  id?: string;
  /** Default warm dark graphite/olive-charcoal pencil color */
  stroke?: string;
  /** Base pencil stroke width (default: 1.15) */
  strokeWidth?: number;
  /** Overall group opacity (default: 0.78) */
  opacity?: number;
  /** Deterministic seed (default: 1) */
  seed?: number;
  /** Include ragged branch twigs & shaded hatch marks inside clusters (default: true) */
  includeTwigs?: boolean;
  /** Include scattered graphite stipple dots floating around foliage (default: true) */
  includeDots?: boolean;
  /** Apply `#pencil-bg-sketch` crisp dry-graphite tooth filter (default: true) */
  usePencilFilter?: boolean;
}

/**
 * Renders iconic 1973 Robin Hood loose, squiggly, broken hand-drawn graphite/ink
 * leaf-cluster loops (`w`/`m`/`c` curly foliage scribbles), ragged branch twigs,
 * and scattered dark pencil stipple dots crisp over soft blurry watercolor washes.
 */
export function pencilFoliageScribbles(
  clusters: readonly PencilFoliageCluster[],
  options: PencilFoliageScribblesOptions = {}
): string {
  const {
    id,
    stroke = TOKENS.classicCel.colors.pencilOliveCharcoal,
    strokeWidth = 1.15,
    opacity = 0.78,
    seed = 1,
    includeTwigs = true,
    includeDots = true,
    usePencilFilter = true,
  } = options;

  const elements: string[] = [];

  for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
    const c = clusters[cIdx];
    const cSeed = seed + (c.seed ?? cIdx * 13);
    const cStroke = c.stroke ?? stroke;
    const cOpacity = c.opacity ?? 1;
    const density = Math.max(0.3, c.density ?? 1);
    const areaScale = Math.sqrt(Math.max(100, c.rx * c.ry)) / 28;
    const loopCount = Math.max(3, Math.round(5 * density * areaScale));

    // 1. Loose curly w/m/c hand-drawn pencil leaf-cluster scribbles
    for (let i = 0; i < loopCount; i++) {
      const k = cIdx * 71 + i * 11;
      const angle = deterministicJitter(k, cSeed, Math.PI);
      const dist = (0.15 + Math.abs(deterministicJitter(k + 1, cSeed, 0.78)));
      const sx = c.cx + Math.cos(angle) * c.rx * dist;
      const sy = c.cy + Math.sin(angle) * c.ry * dist;
      const lobes = 2 + (Math.abs(Math.floor(deterministicJitter(k + 2, cSeed, 3))) % 3);
      const dir = deterministicJitter(k + 3, cSeed, 1) >= 0 ? 1 : -1;
      const lobeW = 4.2 + Math.abs(deterministicJitter(k + 4, cSeed, 4.4));
      const lobeH = 3.8 + Math.abs(deterministicJitter(k + 5, cSeed, 4.6));
      const tilt = deterministicJitter(k + 6, cSeed, 2.2);

      let curX = sx;
      let curY = sy;
      const segs: string[] = [`M ${round2(curX)} ${round2(curY)}`];
      for (let l = 0; l < lobes; l++) {
        const arcSign = l % 2 === 0 ? -1 : 0.75;
        const stepX = dir * (lobeW * (0.75 + Math.abs(deterministicJitter(k + 10 + l, cSeed, 0.45))));
        const stepY = tilt + deterministicJitter(k + 20 + l, cSeed, 2.8);
        const ctrlX = curX + stepX * 0.5 + deterministicJitter(k + 30 + l, cSeed, 2.4);
        const ctrlY = curY + arcSign * lobeH + deterministicJitter(k + 40 + l, cSeed, 1.8);
        curX += stepX;
        curY += stepY;
        segs.push(`Q ${round2(ctrlX)} ${round2(ctrlY)} ${round2(curX)} ${round2(curY)}`);
      }

      const sw = round2(strokeWidth * (0.78 + Math.abs(deterministicJitter(k + 7, cSeed, 0.48))));
      const op = round2(clamp01(cOpacity * (0.64 + Math.abs(deterministicJitter(k + 8, cSeed, 0.34)))));
      elements.push(
        svgEl('path', {
          d: segs.join(' '),
          fill: 'none',
          stroke: cStroke,
          'stroke-width': sw,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          opacity: op,
        })
      );
    }

    // 2. Ragged branch twigs & shaded crevice pencil ticks
    if (includeTwigs) {
      const twigCount = Math.max(2, Math.round(2.5 * density * areaScale));
      for (let t = 0; t < twigCount; t++) {
        const k = cIdx * 97 + t * 17 + 500;
        const tx = c.cx + deterministicJitter(k, cSeed, c.rx * 0.78);
        const ty = c.cy + c.ry * 0.12 + deterministicJitter(k + 1, cSeed, c.ry * 0.65);
        const dx = deterministicJitter(k + 2, cSeed, 11);
        const dy = -2.5 + deterministicJitter(k + 3, cSeed, 5.5);
        const mx = tx + dx * 0.5 + deterministicJitter(k + 4, cSeed, 2.2);
        const my = ty + dy * 0.5 + deterministicJitter(k + 5, cSeed, 2.0);
        const forkX = mx + deterministicJitter(k + 6, cSeed, 5.5);
        const forkY = my - 2.2 + deterministicJitter(k + 7, cSeed, 3.0);
        const d = `M ${round2(tx)} ${round2(ty)} Q ${round2(mx)} ${round2(my)} ${round2(tx + dx)} ${round2(ty + dy)} M ${round2(mx)} ${round2(my)} L ${round2(forkX)} ${round2(forkY)}`;
        elements.push(
          svgEl('path', {
            d,
            fill: 'none',
            stroke: cStroke,
            'stroke-width': round2(strokeWidth * 0.92),
            'stroke-linecap': 'round',
            opacity: round2(clamp01(cOpacity * 0.72)),
          })
        );
      }
    }

    // 3. Scattered dark pencil stipple dots around & inside the foliage
    if (includeDots) {
      const dotCount = Math.max(4, Math.round(7 * density * areaScale));
      for (let dIdx = 0; dIdx < dotCount; dIdx++) {
        const k = cIdx * 131 + dIdx * 7 + 900;
        const dx = c.cx + deterministicJitter(k, cSeed, c.rx * 1.08);
        const dy = c.cy + deterministicJitter(k + 1, cSeed, c.ry * 1.05);
        const r = round2(0.85 + Math.abs(deterministicJitter(k + 2, cSeed, 0.9)));
        const op = round2(clamp01(cOpacity * (0.55 + Math.abs(deterministicJitter(k + 3, cSeed, 0.38)))));
        elements.push(
          svgEl('circle', {
            cx: round2(dx),
            cy: round2(dy),
            r,
            fill: cStroke,
            opacity: op,
          })
        );
      }
    }
  }

  return svgEl(
    'g',
    {
      id,
      'data-part': 'pencil-foliage-scribbles',
      opacity: opacity < 1 ? round2(opacity) : undefined,
      filter: usePencilFilter
        ? svgUrl(TOKENS.classicCel.filters.pencilBgSketch.id)
        : undefined,
    },
    elements
  );
}

export interface PencilGrassTuft {
  /** Base X coordinate of the grass tuft on the ground */
  x: number;
  /** Base Y coordinate of the grass tuft on the ground */
  y: number;
  /** Horizontal span of the tuft cluster (default: 26) */
  width?: number;
  /** Typical height of slanted grass blades (default: 10) */
  height?: number;
  /** Number of slanted pencil hatch blades in this tuft (default: 5) */
  blades?: number;
  /** Lean ratio: negative leans left, positive leans right (default: 0.38) */
  lean?: number;
  /** Include horizontal ground-shadow pencil dashes beside the tuft (default: true) */
  groundDash?: boolean;
  /** Include scattered tiny graphite pebble dots near the tuft (default: true) */
  pebbles?: boolean;
  /** Optional stroke color override */
  stroke?: string;
  /** Optional opacity override */
  opacity?: number;
  /** Optional per-tuft seed offset */
  seed?: number;
}

export interface PencilGrassStrokesOptions {
  id?: string;
  /** Default graphite/charcoal pencil stroke color */
  stroke?: string;
  /** Base pencil stroke width (default: 1.25) */
  strokeWidth?: number;
  /** Overall group opacity (default: 0.84) */
  opacity?: number;
  /** Deterministic seed (default: 1) */
  seed?: number;
  /** Apply `#pencil-bg-sketch` crisp dry-graphite tooth filter (default: true) */
  usePencilFilter?: boolean;
}

/**
 * Renders authentic 1973 Robin Hood hand-drawn pencil grass: clusters of slanted
 * diagonal graphite pencil hatch ticks, crooked short grass blades, horizontal
 * ground-shadow dashes, and scattered tiny pebble dots.
 */
export function pencilGrassStrokes(
  tufts: readonly PencilGrassTuft[],
  options: PencilGrassStrokesOptions = {}
): string {
  const {
    id,
    stroke = TOKENS.classicCel.colors.xeroxInk,
    strokeWidth = 1.25,
    opacity = 0.84,
    seed = 1,
    usePencilFilter = true,
  } = options;

  const elements: string[] = [];

  for (let tIdx = 0; tIdx < tufts.length; tIdx++) {
    const tuft = tufts[tIdx];
    const tSeed = seed + (tuft.seed ?? tIdx * 17);
    const tStroke = tuft.stroke ?? stroke;
    const tOpacity = tuft.opacity ?? 1;
    const w = tuft.width ?? 26;
    const h = tuft.height ?? 10;
    const blades = Math.max(2, tuft.blades ?? 5);
    const lean = tuft.lean ?? 0.38;

    // 1. Slanted diagonal graphite pencil hatch ticks & crooked short grass blades
    for (let b = 0; b < blades; b++) {
      const k = tIdx * 53 + b * 11;
      const frac = blades === 1 ? 0.5 : b / (blades - 1);
      const bx = tuft.x - w / 2 + frac * w + deterministicJitter(k, tSeed, 2.2);
      const by = tuft.y + deterministicJitter(k + 1, tSeed, 1.4);
      // Natural arch profile: taller in center-ish blades, shorter at outer ticks
      const arch = 0.65 + 0.5 * Math.sin(frac * Math.PI);
      const bh = h * arch * (0.72 + Math.abs(deterministicJitter(k + 2, tSeed, 0.45)));
      const tipX = bx + bh * lean + deterministicJitter(k + 3, tSeed, 2.4);
      const tipY = by - bh;
      const ctrlX = (bx + tipX) * 0.5 + deterministicJitter(k + 4, tSeed, 1.6);
      const ctrlY = (by + tipY) * 0.5 + deterministicJitter(k + 5, tSeed, 1.2);

      const sw = round2(strokeWidth * (0.78 + Math.abs(deterministicJitter(k + 6, tSeed, 0.42))));
      const op = round2(clamp01(tOpacity * (0.72 + Math.abs(deterministicJitter(k + 7, tSeed, 0.28)))));
      elements.push(
        svgEl('path', {
          d: `M ${round2(bx)} ${round2(by)} Q ${round2(ctrlX)} ${round2(ctrlY)} ${round2(tipX)} ${round2(tipY)}`,
          fill: 'none',
          stroke: tStroke,
          'stroke-width': sw,
          'stroke-linecap': 'round',
          opacity: op,
        })
      );
    }

    // 2. Horizontal / gently angled ground-shadow pencil dashes beside the tuft
    if (tuft.groundDash !== false) {
      const dashCount = 1 + (Math.abs(Math.floor(deterministicJitter(tIdx * 19, tSeed, 2))) % 2);
      for (let dIdx = 0; dIdx < dashCount; dIdx++) {
        const k = tIdx * 79 + dIdx * 13 + 300;
        const side = dIdx % 2 === 0 ? 1 : -1;
        const startX = tuft.x + side * (w * 0.48 + Math.abs(deterministicJitter(k, tSeed, 7)));
        const startY = tuft.y + 0.8 + deterministicJitter(k + 1, tSeed, 1.8);
        const dashLen = 6 + Math.abs(deterministicJitter(k + 2, tSeed, 7.5));
        const endX = startX + side * dashLen;
        const endY = startY + deterministicJitter(k + 3, tSeed, 1.4);
        const mx = (startX + endX) * 0.5;
        const my = (startY + endY) * 0.5 + deterministicJitter(k + 4, tSeed, 0.9);
        elements.push(
          svgEl('path', {
            d: `M ${round2(startX)} ${round2(startY)} Q ${round2(mx)} ${round2(my)} ${round2(endX)} ${round2(endY)}`,
            fill: 'none',
            stroke: tStroke,
            'stroke-width': round2(strokeWidth * 1.08),
            'stroke-linecap': 'round',
            opacity: round2(clamp01(tOpacity * 0.76)),
          })
        );
      }
    }

    // 3. Scattered tiny graphite pebble dots near the tuft
    if (tuft.pebbles !== false) {
      const pebbleCount = 1 + (Math.abs(Math.floor(deterministicJitter(tIdx * 31, tSeed, 3))) % 3);
      for (let p = 0; p < pebbleCount; p++) {
        const k = tIdx * 101 + p * 9 + 600;
        const px = tuft.x + deterministicJitter(k, tSeed, w * 0.95);
        const py = tuft.y + deterministicJitter(k + 1, tSeed, 4.5);
        const r = round2(0.85 + Math.abs(deterministicJitter(k + 2, tSeed, 0.75)));
        elements.push(
          svgEl('circle', {
            cx: round2(px),
            cy: round2(py),
            r,
            fill: tStroke,
            opacity: round2(clamp01(tOpacity * 0.72)),
          })
        );
      }
    }
  }

  return svgEl(
    'g',
    {
      id,
      'data-part': 'pencil-grass-strokes',
      opacity: opacity < 1 ? round2(opacity) : undefined,
      filter: usePencilFilter
        ? svgUrl(TOKENS.classicCel.filters.pencilBgSketch.id)
        : undefined,
    },
    elements
  );
}

/**
 * Renders a soft painted ground contact shadow beneath a foreground cel character or prop.
 */
export function celContactShadow(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opacity = 0.32
): string {
  return svgEl('ellipse', {
    cx: round2(cx),
    cy: round2(cy),
    rx: round2(rx),
    ry: round2(ry),
    fill: TOKENS.classicCel.colors.contactShadow,
    opacity: round2(opacity),
    'data-part': 'cel-contact-shadow',
  });
}

export interface TransformOptions {
  x?: number;
  y?: number;
  rotate?: number;
  pivotX?: number;
  pivotY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  flipX?: boolean;
}

/**
 * Builds a clean SVG transform string, omitting identity operations.
 */
export function svgTransform(opts: TransformOptions): string {
  const parts: string[] = [];
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  if (x !== 0 || y !== 0) {
    parts.push(`translate(${round2(x)}, ${round2(y)})`);
  }
  if (opts.rotate && opts.rotate !== 0) {
    if (opts.pivotX !== undefined && opts.pivotY !== undefined) {
      parts.push(`rotate(${round2(opts.rotate)}, ${round2(opts.pivotX)}, ${round2(opts.pivotY)})`);
    } else {
      parts.push(`rotate(${round2(opts.rotate)})`);
    }
  }
  const sx = (opts.scaleX ?? opts.scale ?? 1) * (opts.flipX ? -1 : 1);
  const sy = opts.scaleY ?? opts.scale ?? 1;
  if (sx !== 1 || sy !== 1) {
    parts.push(sx === sy ? `scale(${round2(sx)})` : `scale(${round2(sx)}, ${round2(sy)})`);
  }
  return parts.join(' ');
}

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Quantizes a continuous [0..1] progress value into discrete stop-motion steps.
 */
export function quantizeStep(v: number, steps: number): number {
  const c = clamp01(v);
  if (steps <= 0) return c;
  if (c >= 0.999) return 1;
  return Math.floor(c * steps) / steps;
}

/**
 * Deterministic pseudo-random jitter in [-amplitude, +amplitude] for repeatable hand-drawn wobble.
 */
export function deterministicJitter(index: number, seed: number, amplitude = 1): number {
  const raw = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  const frac = raw - Math.floor(raw);
  return (frac * 2 - 1) * amplitude;
}

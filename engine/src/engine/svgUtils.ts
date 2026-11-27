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

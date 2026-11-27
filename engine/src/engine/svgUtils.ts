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
 * Renders a classic opaque cel-painted `<path>` with crisp Xerox charcoal ink outline.
 */
export function celPath(
  d: string,
  fill: string,
  options: CelStrokeOptions & { id?: string; clipPath?: string } = {}
): string {
  const { id, clipPath, ...strokeOpts } = options;
  return svgEl('path', {
    id,
    d,
    fill,
    'clip-path': clipPath,
    ...celStrokeAttrs(strokeOpts),
  });
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
  id?: string;
}

/**
 * Renders an authentic 2-tone cel-shaded shape:
 * 1) solid opaque matte cel paint base,
 * 2) crisp clipped cel shadow band(s) and optional rim/specular highlight(s),
 * 3) clean Xerox charcoal ink outline drawn over top so internal paint seams stay crisp.
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
    id,
  } = opts;

  const hasInterior =
    (shadowPaths.length > 0 && shadowFill) ||
    (highlightPaths.length > 0 && highlightFill);

  if (!hasInterior) {
    return celPath(d, baseFill, { id, stroke, strokeWidth });
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
          ...celStrokeAttrs({ stroke, strokeWidth }),
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

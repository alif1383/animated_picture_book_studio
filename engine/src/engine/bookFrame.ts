import { TOKENS, CrayonMaterialId } from '../theme/tokens';
import { evaluateSteppedClock } from './clock';
import { getPatternFill } from './filters';
import {
  clamp01,
  quantizeStep,
  round2,
  svgEl,
  svgTransform,
} from './svgUtils';

/**
 * Declarative configuration for the Storybook Cover Opening & Ending/Credits Book-Frame.
 */
export interface BookFrameConfig {
  /** Whether the opening/closing picture-book frame is enabled (default: true) */
  enabled?: boolean;
  /** Title displayed on the front book cover (defaults to `scene.title`) */
  coverTitle?: string;
  /** Subtitle displayed on the front book cover (defaults to `scene.subtitle`) */
  coverSubtitle?: string;
  /** Optional author/illustrator credit line shown on front and ending covers */
  creditText?: string;
  /** Main heading on the closing cover (defaults to `'The End ★'`) */
  endingTitle?: string;
  /** Credit/story line on the closing cover (defaults to `scene.title` + optional credit) */
  endingCredit?: string;
  /** Crayon pattern material for the hardcover book boards (default: `'crayonTerracotta'`) */
  coverMaterial?: CrayonMaterialId;
  /** Optional accent crayon pattern material for the book spine & trim */
  accentMaterial?: CrayonMaterialId;
  /** Alias for `accentMaterial` for schema compatibility */
  AccentMaterial?: CrayonMaterialId;
  /** Duration in seconds for the opening cover flip + zoom-in + color-in sequence (default: 3.5) */
  openDurationSec?: number;
  /** Duration in seconds for the ending color-out + zoom-out + cover close sequence (default: 3.5) */
  closeDurationSec?: number;
}

export type BookFramePhase = 'opening' | 'story' | 'closing';

export interface EvaluatedBookFrameState {
  enabled: boolean;
  phase: BookFramePhase;
  /** 0 = closed front cover, 1 = cover fully open to reveal pages */
  coverOpenProgress: number;
  /** 0 = pages open, 1 = back/ending cover fully closed */
  coverCloseProgress: number;
  /** 0.68 when viewing the open book spread on the table -> 1.0 when zoomed into full-bleed story */
  bookScale: number;
  /**
   * 0.0 at the start of the open-book page view, ramping in quantized steps 0.0 -> 1.0
   * as we zoom into the story; 1.0 during 'story'; ramping down 1.0 -> 0.0 as we zoom out
   * at the end before closing the book.
   */
  colorFillMultiplier: number;
  coverTitle: string;
  coverSubtitle: string;
  creditText: string;
  endingTitle: string;
  endingCredit: string;
  coverMaterial: CrayonMaterialId;
  accentMaterial: CrayonMaterialId;
}

export interface EvaluateBookFrameParams {
  timeSec: number;
  durationSec: number;
  fps?: number;
  config?: BookFrameConfig | boolean;
  sceneTitle: string;
  sceneSubtitle?: string;
}

export interface RenderBookFrameOverlayParams {
  innerSceneMarkup: string;
  width: number;
  height: number;
  bookState: EvaluatedBookFrameState;
  frameIndex: number;
}

const DEFAULT_OPEN_DURATION_SEC = 3.5;
const DEFAULT_CLOSE_DURATION_SEC = 4.5;
const OPEN_BOOK_SPREAD_SCALE = 0.68;
const COVER_FLIP_STEPS = 8;

function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface WrappedCoverTextResult {
  fontSize: number;
  lineHeight: number;
  lines: string[];
}

/**
 * Deterministically word-wraps a cover text string into at most `maxLines` lines
 * and scales `fontSize` down between `baseFontSize` and `minFontSize` so every line
 * fits comfortably within `maxWidthPx` inside the book cover title card.
 */
export function wrapAndFitCoverText(options: {
  text: string;
  maxWidthPx: number;
  baseFontSize: number;
  minFontSize: number;
  maxLines: number;
  charWidthRatio?: number;
}): WrappedCoverTextResult {
  const {
    text,
    maxWidthPx,
    baseFontSize,
    minFontSize,
    maxLines,
    charWidthRatio = 0.56,
  } = options;

  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {
      fontSize: baseFontSize,
      lineHeight: round2(baseFontSize * 1.25),
      lines: [],
    };
  }

  const words = normalized.split(' ');

  const buildLinesForMaxChars = (maxChars: number): string[] => {
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (!current) {
        current = word;
      } else if (current.length + 1 + word.length <= maxChars) {
        current = `${current} ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines;
  };

  for (let fontSize = baseFontSize; fontSize >= minFontSize; fontSize -= 2) {
    const maxChars = Math.max(
      12,
      Math.floor(maxWidthPx / (fontSize * charWidthRatio))
    );
    const lines = buildLinesForMaxChars(maxChars);
    const longestChars = Math.max(...lines.map((l) => l.length));
    const estimatedWidth = longestChars * fontSize * charWidthRatio;

    if (lines.length <= maxLines && estimatedWidth <= maxWidthPx * 1.04) {
      return {
        fontSize,
        lineHeight: round2(fontSize * 1.24),
        lines,
      };
    }
  }

  // Fallback at minFontSize: pack into at most maxLines lines
  const fallbackMaxChars = Math.max(
    14,
    Math.ceil(normalized.length / maxLines) + 4
  );
  const rawLines = buildLinesForMaxChars(fallbackMaxChars);
  const clampedLines =
    rawLines.length <= maxLines
      ? rawLines
      : [
          ...rawLines.slice(0, maxLines - 1),
          rawLines.slice(maxLines - 1).join(' '),
        ];

  return {
    fontSize: minFontSize,
    lineHeight: round2(minFontSize * 1.22),
    lines: clampedLines,
  };
}

/**
 * Renders a multi-line centered `<text>` element with `<tspan>` rows and optional
 * `textLength` clamping so long lines never overflow `maxWidthPx`.
 */
function renderWrappedCoverTextElement(options: {
  id: string;
  x: number;
  topCenterY: number;
  wrapped: WrappedCoverTextResult;
  maxWidthPx: number;
  fill: string;
  fontWeight?: string;
  charWidthRatio?: number;
  fullText: string;
}): string {
  const {
    id,
    x,
    topCenterY,
    wrapped,
    maxWidthPx,
    fill,
    fontWeight,
    charWidthRatio = 0.56,
    fullText,
  } = options;

  const { fontSize, lineHeight, lines } = wrapped;
  if (lines.length === 0) return '';

  const tspans = lines.map((line, idx) => {
    const estW = line.length * fontSize * charWidthRatio;
    const clampW = estW > maxWidthPx ? round2(maxWidthPx * 0.96) : undefined;
    return svgEl(
      'tspan',
      {
        x,
        dy: idx === 0 ? 0 : lineHeight,
        textLength: clampW,
        lengthAdjust: clampW ? 'spacingAndGlyphs' : undefined,
      },
      escapeSvgText(line)
    );
  });

  return svgEl(
    'text',
    {
      id,
      x,
      y: round2(topCenterY),
      'text-anchor': 'middle',
      'font-family': TOKENS.typography.fontFamilyHand,
      'font-size': fontSize,
      'font-weight': fontWeight,
      fill,
      'data-full-text': escapeSvgText(fullText),
      'data-line-count': lines.length,
    },
    tspans
  );
}

/**
 * Evaluates the quantized 6 FPS book-frame state (phase, cover flip progress,
 * zoom scale, and progressive crayon color fill multiplier) at `timeSec`.
 */
export function evaluateBookFrameState(
  params: EvaluateBookFrameParams
): EvaluatedBookFrameState {
  const {
    timeSec,
    durationSec,
    fps = TOKENS.timing.fps,
    config,
    sceneTitle,
    sceneSubtitle,
  } = params;

  const cfg: BookFrameConfig =
    typeof config === 'object' && config !== null ? config : {};

  const coverTitle = cfg.coverTitle ?? sceneTitle;
  const coverSubtitle = cfg.coverSubtitle ?? sceneSubtitle ?? '';
  const creditText = cfg.creditText ?? 'A Crayon Picture-Book Story';
  const endingTitle = cfg.endingTitle ?? 'The End ★';
  const endingCredit =
    cfg.endingCredit ??
    (cfg.creditText ? `${coverTitle} — ${cfg.creditText}` : coverTitle);
  const coverMaterial: CrayonMaterialId =
    cfg.coverMaterial ?? 'crayonTerracotta';
  const accentMaterial: CrayonMaterialId =
    cfg.accentMaterial ?? cfg.AccentMaterial ?? 'crayonWoodBrown';

  const isDisabled =
    config === false ||
    (typeof config === 'object' &&
      config !== null &&
      config.enabled === false) ||
    durationSec <= 4;

  if (isDisabled) {
    return {
      enabled: false,
      phase: 'story',
      coverOpenProgress: 1,
      coverCloseProgress: 0,
      bookScale: 1,
      colorFillMultiplier: 1,
      coverTitle,
      coverSubtitle,
      creditText,
      endingTitle,
      endingCredit,
      coverMaterial,
      accentMaterial,
    };
  }

  const clock = evaluateSteppedClock(timeSec, fps, durationSec);
  const qTime = clock.quantizedTimeSec;

  const maxHalfDur = Math.max(1, (durationSec - 0.5) / 2);
  const openDur = Math.min(
    maxHalfDur,
    Math.max(0.5, cfg.openDurationSec ?? DEFAULT_OPEN_DURATION_SEC)
  );
  const closeDur = Math.min(
    maxHalfDur,
    Math.max(0.5, cfg.closeDurationSec ?? DEFAULT_CLOSE_DURATION_SEC)
  );

  // 1. Opening phase: [0 .. openDur)
  if (qTime < openDur) {
    const u = clamp01(qTime / openDur);
    if (u <= 0.45) {
      const coverOpenProgress = round2(
        quantizeStep(clamp01(u / 0.45), COVER_FLIP_STEPS)
      );
      return {
        enabled: true,
        phase: 'opening',
        coverOpenProgress,
        coverCloseProgress: 0,
        bookScale: OPEN_BOOK_SPREAD_SCALE,
        colorFillMultiplier: 0,
        coverTitle,
        coverSubtitle,
        creditText,
        endingTitle,
        endingCredit,
        coverMaterial,
        accentMaterial,
      };
    }

    const zoomProgress = quantizeStep(
      clamp01((u - 0.45) / 0.55),
      TOKENS.timing.defaultFillSteps
    );
    const bookScale = round2(
      OPEN_BOOK_SPREAD_SCALE + (1 - OPEN_BOOK_SPREAD_SCALE) * zoomProgress
    );
    const colorFillMultiplier = round2(zoomProgress);

    return {
      enabled: true,
      phase: 'opening',
      coverOpenProgress: 1,
      coverCloseProgress: 0,
      bookScale,
      colorFillMultiplier,
      coverTitle,
      coverSubtitle,
      creditText,
      endingTitle,
      endingCredit,
      coverMaterial,
      accentMaterial,
    };
  }

  // 2. Closing phase: (durationSec - closeDur .. durationSec]
  const closeStart = durationSec - closeDur;
  if (qTime > closeStart) {
    const isAtEnd = clock.rawTimeSec >= durationSec - 1e-6;
    const v = isAtEnd ? 1 : clamp01((qTime - closeStart) / closeDur);

    if (v < 0.42) {
      const drainProgress = quantizeStep(
        clamp01(1 - v / 0.42),
        TOKENS.timing.defaultFillSteps
      );
      const bookScale = round2(
        OPEN_BOOK_SPREAD_SCALE + (1 - OPEN_BOOK_SPREAD_SCALE) * drainProgress
      );
      const colorFillMultiplier = round2(drainProgress);

      return {
        enabled: true,
        phase: 'closing',
        coverOpenProgress: 1,
        coverCloseProgress: 0,
        bookScale,
        colorFillMultiplier,
        coverTitle,
        coverSubtitle,
        creditText,
        endingTitle,
        endingCredit,
        coverMaterial,
        accentMaterial,
      };
    }

    // Cover closes during 0.42 <= v < 0.76, then holds at 1.0 (fully closed) for the final ~1.1s (v >= 0.76)
    const closeRaw = isAtEnd ? 1 : clamp01((v - 0.42) / 0.34);
    const coverCloseProgress = round2(
      quantizeStep(closeRaw, COVER_FLIP_STEPS)
    );

    return {
      enabled: true,
      phase: 'closing',
      coverOpenProgress: 1,
      coverCloseProgress,
      bookScale: OPEN_BOOK_SPREAD_SCALE,
      colorFillMultiplier: 0,
      coverTitle,
      coverSubtitle,
      creditText,
      endingTitle,
      endingCredit,
      coverMaterial,
      accentMaterial,
    };
  }

  // 3. Middle full-bleed Story phase
  return {
    enabled: true,
    phase: 'story',
    coverOpenProgress: 1,
    coverCloseProgress: 0,
    bookScale: 1,
    colorFillMultiplier: 1,
    coverTitle,
    coverSubtitle,
    creditText,
    endingTitle,
    endingCredit,
    coverMaterial,
    accentMaterial,
  };
}

/**
 * Renders the clean warm paper background behind the storybook.
 */
function renderDeskBackdrop(width: number, height: number): string {
  return svgEl('g', { id: 'book-desk-backdrop' }, [
    svgEl('rect', {
      x: 0,
      y: 0,
      width,
      height,
      fill: TOKENS.colors.paperWarm,
    }),
  ]);
}

/**
 * Computes the 3D `rotateY(0deg -> 180deg)` unfolding geometry for an `openP` in `[0..1]`.
 * - At `openP = 0` (closed): `spineX = 330`, `rightPageEdgeX = 950`, `coverFreeEdgeX = 950`, `leftOpenEdgeX = 330`.
 * - For `0 < openP <= 0.5` (`0° < theta <= 90°`): `leftOpenEdgeX = spineX` (nothing exists to the left of `spineX`!).
 * - For `0.5 < openP < 1.0` (`90° < theta < 180°`): the cover has crossed past vertical to the left of `spineX`,
 *   so `leftOpenEdgeX = coverFreeEdgeX`, expanding leftward toward `0`.
 * - At `openP = 1.0` (`180°`, fully open): `leftOpenEdgeX = 0`, `spineX = 640`, `rightPageEdgeX = 1280`.
 */
function computeBook3DGeometry(width: number, openP: number) {
  const p = clamp01(openP);
  const closedLeft = round2(width / 2 - 310); // 330 on 1280px canvas
  const closedW = 620;
  const halfW = round2(width / 2); // 640 on 1280px canvas

  const spineX = round2(closedLeft + (halfW - closedLeft) * p);
  const rightPageW = round2(closedW + (halfW - closedW) * p);
  const rightPageEdgeX = round2(spineX + rightPageW);

  const theta = p * Math.PI;
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const angleDeg = round2((theta * 180) / Math.PI);

  const coverW = rightPageW;
  const coverFreeEdgeX = round2(spineX + coverW * cosTheta);
  const perspLift = round2(46 * sinTheta);

  const leftOpenEdgeX =
    coverFreeEdgeX < spineX ? Math.max(0, coverFreeEdgeX) : spineX;

  return {
    openP: p,
    spineX,
    rightPageEdgeX,
    coverW,
    theta,
    cosTheta,
    sinTheta,
    angleDeg,
    coverFreeEdgeX,
    perspLift,
    leftOpenEdgeX,
  };
}

/**
 * Renders the open hardcover book boards and vertical page-edge strips on the left and right
 * sides of the story viewport.
 * - When `openP === 1`: renders at full-spread positions (`x = -76..0` and `x = 1280..1356`).
 * - When `0 < openP < 1`: anchors right page strips to `rightPageEdgeX` and only renders
 *   left page strips once the cover has swung past 90° (`coverFreeEdgeX < spineX`), anchored to `leftOpenEdgeX`!
 */
function renderOpenBookBoardsAndPages(
  width: number,
  height: number,
  openP: number,
  isHidden = false
): {
  underlayMarkup: string;
  spineOverlayMarkup: string;
  clipDefMarkup: string;
  leftOpenEdgeX: number;
  rightPageEdgeX: number;
  spineX: number;
} {
  const geom = computeBook3DGeometry(width, openP);
  const { leftOpenEdgeX, rightPageEdgeX, spineX } = geom;
  const visibleW = Math.max(0, round2(rightPageEdgeX - leftOpenEdgeX));

  const hiddenAttrs = isHidden ? { opacity: 0, 'pointer-events': 'none' } : {};

  const halfW = round2(width / 2);
  const clipDefMarkup =
    openP > 0
      ? [
          svgEl(
            'clipPath',
            {
              id: 'book-open-page-clip',
              'data-left-open-edge': leftOpenEdgeX,
              'data-spine-x': spineX,
              'data-right-page-edge': rightPageEdgeX,
            },
            [
              svgEl('rect', {
                x: leftOpenEdgeX,
                y: 0,
                width: visibleW,
                height,
              }),
            ]
          ),
          openP < 1
            ? svgEl('clipPath', { id: 'book-left-half-scene-clip' }, [
                svgEl('rect', {
                  x: 0,
                  y: 0,
                  width: halfW,
                  height,
                }),
              ])
            : '',
          openP < 1
            ? svgEl('clipPath', { id: 'book-right-half-scene-clip' }, [
                svgEl('rect', {
                  x: halfW,
                  y: 0,
                  width: halfW,
                  height,
                }),
              ])
            : '',
        ].join('')
      : '';

  const underlayMarkup = svgEl(
    'g',
    { id: 'book-open-spread-backing', ...hiddenAttrs },
    [
      svgEl('rect', {
        x: leftOpenEdgeX,
        y: 0,
        width: visibleW,
        height,
        fill: TOKENS.colors.paperWarm,
      }),
    ]
  );

  const strokeAttrs = {
    stroke: TOKENS.colors.charcoalOutline,
    'stroke-width': TOKENS.strokes.outlineHeavy,
    'stroke-linejoin': 'miter',
  };

  const boardChildren: string[] = [];

  // Left cover & page-edge strips ONLY appear after the front cover swings past 90° (openP > 0.5)
  if (openP >= 1) {
    boardChildren.push(
      svgEl('rect', {
        x: -76,
        y: 0,
        width: 14,
        height,
        fill: getPatternFill('crayonTerracotta'),
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: -62,
        y: 0,
        width: 17,
        height,
        fill: getPatternFill('crayonOchre'),
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: -45,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperShadow,
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: -30,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperWarm,
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: -15,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperShadow,
        ...strokeAttrs,
      })
    );
  } else if (openP > 0.5) {
    const leftBase = leftOpenEdgeX;
    boardChildren.push(
      svgEl('rect', {
        x: leftBase - 76,
        y: 0,
        width: 14,
        height,
        fill: getPatternFill('crayonTerracotta'),
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: leftBase - 62,
        y: 0,
        width: 17,
        height,
        fill: getPatternFill('crayonOchre'),
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: leftBase - 45,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperShadow,
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: leftBase - 30,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperWarm,
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: leftBase - 15,
        y: 0,
        width: 15,
        height,
        fill: TOKENS.colors.paperShadow,
        ...strokeAttrs,
      })
    );
  }

  // Right side page-edge & cover strips anchored at `rightPageEdgeX` (`width` when openP === 1)
  const rBase = openP >= 1 ? width : rightPageEdgeX;
  boardChildren.push(
    svgEl('rect', {
      x: rBase,
      y: 0,
      width: 15,
      height,
      fill: TOKENS.colors.paperShadow,
      ...strokeAttrs,
    }),
    svgEl('rect', {
      x: rBase + 15,
      y: 0,
      width: 15,
      height,
      fill: TOKENS.colors.paperWarm,
      ...strokeAttrs,
    }),
    svgEl('rect', {
      x: rBase + 30,
      y: 0,
      width: 15,
      height,
      fill: TOKENS.colors.paperShadow,
      ...strokeAttrs,
    }),
    svgEl('rect', {
      x: rBase + 45,
      y: 0,
      width: 17,
      height,
      fill: getPatternFill('crayonOchre'),
      ...strokeAttrs,
    }),
    svgEl('rect', {
      x: rBase + 62,
      y: 0,
      width: 14,
      height,
      fill: getPatternFill('crayonTerracotta'),
      ...strokeAttrs,
    })
  );

  // Crisp charcoal outline around the visible open story area
  if (openP >= 1) {
    boardChildren.push(
      svgEl('rect', {
        x: 0,
        y: 0,
        width,
        height,
        fill: 'none',
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: -76,
        y: 0,
        width: width + 152,
        height,
        fill: 'none',
        ...strokeAttrs,
      })
    );
  } else {
    boardChildren.push(
      svgEl('rect', {
        x: leftOpenEdgeX,
        y: 0,
        width: visibleW,
        height,
        fill: 'none',
        ...strokeAttrs,
      })
    );
  }

  const spineOverlayMarkup = svgEl(
    'g',
    { id: 'book-open-boards', ...hiddenAttrs },
    boardChildren
  );

  return {
    underlayMarkup,
    spineOverlayMarkup,
    clipDefMarkup,
    leftOpenEdgeX,
    rightPageEdgeX,
    spineX,
  };
}

/**
 * Renders 2 staggered 3D perspective turning flyleaf pages (`#book-turning-pages`)
 * hinged at `spineX` during `0 < openP < 1`, emulating CSS `.page.turn { transform: rotateY(180deg) }`.
 */
function renderTurningFlyleafPages(
  width: number,
  height: number,
  openP: number
): string {
  if (openP <= 0 || openP >= 1) return '';

  const geom = computeBook3DGeometry(width, openP);
  const { spineX, coverW } = geom;

  // Two flyleaf pages lagging slightly behind the cover turn
  const pageSpecs = [
    {
      id: 'book-flyleaf-1',
      p: clamp01((openP - 0.14) / 0.84),
      widthScale: 0.96,
      maxLift: 34,
      fill: TOKENS.colors.paperShadow,
    },
    {
      id: 'book-flyleaf-2',
      p: clamp01((openP - 0.05) / 0.88),
      widthScale: 0.98,
      maxLift: 40,
      fill: TOKENS.colors.paperWarm,
    },
  ];

  const pageEls: string[] = [];
  for (const spec of pageSpecs) {
    // Only render turning flyleaf pages while they lift on the right side of the spine (p < 0.5)
    // so they never obscure the unfolding left story page once the cover crosses 90° (openP > 0.5).
    if (spec.p <= 0.01 || spec.p >= 0.5) continue;
    const thetaP = spec.p * Math.PI;
    const cosP = Math.cos(thetaP);
    if (cosP <= 0.04) continue;
    const sinP = Math.sin(thetaP);
    const freeX = round2(spineX + coverW * spec.widthScale * cosP);
    const lift = round2(spec.maxLift * sinP);
    const midX = round2((spineX + freeX) / 2);
    const archY = round2(-lift * 1.15);
    const botY = round2(height - lift * 0.65);
    const botArchY = round2(height - lift * 0.85);

    const d = [
      `M ${spineX} 0`,
      `Q ${midX} ${archY}, ${freeX} ${-lift}`,
      `L ${freeX} ${botY}`,
      `Q ${midX} ${botArchY}, ${spineX} ${height}`,
      'Z',
    ].join(' ');

    pageEls.push(
      svgEl('path', {
        id: spec.id,
        d,
        fill: spec.fill,
        stroke: TOKENS.colors.charcoalOutline,
        'stroke-width': TOKENS.strokes.outlineMedium,
        'stroke-linejoin': 'round',
      })
    );
  }

  if (pageEls.length === 0) return '';
  return svgEl('g', { id: 'book-turning-pages' }, pageEls);
}

/**
 * Renders the animated 3D `rotateY(0deg -> 180deg)` front cover (`#book-front-cover`)
 * or closing cover (`#book-ending-cover`) with wrapped text inside an inset cream title card.
 */
function renderBookCoverOverlay(
  width: number,
  height: number,
  bookState: EvaluatedBookFrameState,
  _frameIndex: number,
  variant: 'front' | 'ending'
): string {
  const coverId =
    variant === 'front' ? 'book-front-cover' : 'book-ending-cover';
  const progress =
    variant === 'front'
      ? bookState.coverOpenProgress
      : bookState.coverCloseProgress;

  // Unified openP in [0..1]: 0 = cover closed, 1 = cover opened 180° to the left
  const openP =
    variant === 'front' ? clamp01(progress) : clamp01(1 - progress);
  const geom = computeBook3DGeometry(width, openP);
  const { spineX, cosTheta, angleDeg, coverFreeEdgeX, perspLift } = geom;

  const strokeAttrs = {
    stroke: TOKENS.colors.charcoalOutline,
    'stroke-width': TOKENS.strokes.outlineHeavy,
    'stroke-linejoin': 'miter',
  };

  // When openP > 0.5 (theta > 90°), the cover has flipped past vertical to the LEFT of `spineX`.
  // The unfolding left page [coverFreeEdgeX .. spineX] displays the left half of the story (#book-opening-left-page),
  // so we render only the crisp outer border frame (fill: 'none') and subtle spine crease without any opaque fill!
  if (openP > 0.5) {
    const outerBoardPath = `M ${spineX} 0 L ${coverFreeEdgeX} 0 L ${coverFreeEdgeX} ${height} L ${spineX} ${height}`;

    return svgEl(
      'g',
      {
        id: coverId,
        'data-cover-progress': round2(progress),
        'data-cover-angle-deg': angleDeg,
        'data-hinge-side': 'left',
      },
      [
        svgEl('path', {
          d: outerBoardPath,
          fill: 'none',
          ...strokeAttrs,
        }),
        svgEl('line', {
          x1: spineX,
          y1: 0,
          x2: spineX,
          y2: height,
          stroke: TOKENS.colors.charcoalOutline,
          'stroke-width': TOKENS.strokes.outlineMedium,
          'stroke-opacity': 0.4,
        }),
      ]
    );
  }

  // When openP <= 0.5 (theta <= 90°), we view the OUTSIDE of the front cover:
  // Closed geometry: bookLeft = 330, bookW = 620, spineW = 48 (x=330..378), mainBoard (x=378..936, w=558), rightEdge (x=936..950, w=14)
  const centerX = round2(width / 2);
  const centerY = round2(height / 2);
  const bookW = 620;
  const bookH = height;
  const bookLeft = round2(centerX - bookW / 2); // 330
  const bookRight = bookLeft + bookW; // 950
  const spineW = 48;
  const rightEdgeW = 14;
  const mainBoardX = bookLeft + spineW; // 378
  const mainBoardW = bookW - spineW - rightEdgeW; // 558
  const coverCenterX = round2(mainBoardX + mainBoardW / 2); // 657

  // Inset Cream Title Card inside the tan/ochre cover board
  const cardPadX = 32;
  const cardX = mainBoardX + cardPadX; // 410
  const cardY = 104;
  const cardW = mainBoardW - cardPadX * 2; // 494
  const cardH = bookH - 208; // 512
  const maxTextWidth = cardW - 44; // 450px safe horizontal width for text lines
  const clipId = `book-cover-text-clip-${variant}`;

  const textChildren: string[] = [];

  if (variant === 'front') {
    const wrappedTitle = wrapAndFitCoverText({
      text: bookState.coverTitle,
      maxWidthPx: maxTextWidth,
      baseFontSize: 34,
      minFontSize: 24,
      maxLines: 3,
      charWidthRatio: 0.58,
    });

    const wrappedSubtitle = bookState.coverSubtitle
      ? wrapAndFitCoverText({
          text: bookState.coverSubtitle,
          maxWidthPx: maxTextWidth,
          baseFontSize: 19,
          minFontSize: 14,
          maxLines: 3,
          charWidthRatio: 0.53,
        })
      : null;

    const wrappedCredit = bookState.creditText
      ? wrapAndFitCoverText({
          text: bookState.creditText,
          maxWidthPx: maxTextWidth,
          baseFontSize: 16,
          minFontSize: 13,
          maxLines: 2,
          charWidthRatio: 0.52,
        })
      : null;

    const titleBlockH = wrappedTitle.lines.length * wrappedTitle.lineHeight;
    const subtitleBlockH = wrappedSubtitle
      ? wrappedSubtitle.lines.length * wrappedSubtitle.lineHeight + 18
      : 0;
    const totalCenterBlockH = titleBlockH + subtitleBlockH;
    const titleStartY = round2(
      centerY - totalCenterBlockH / 2 + wrappedTitle.fontSize * 0.35 - 12
    );

    textChildren.push(
      renderWrappedCoverTextElement({
        id: 'book-front-cover-title',
        x: coverCenterX,
        topCenterY: titleStartY,
        wrapped: wrappedTitle,
        maxWidthPx: maxTextWidth,
        fill: TOKENS.colors.charcoalOutline,
        fontWeight: 'bold',
        charWidthRatio: 0.58,
        fullText: bookState.coverTitle,
      })
    );

    // Decorative crayon underline beneath the title block
    const underlineY = round2(
      titleStartY +
        (wrappedTitle.lines.length - 1) * wrappedTitle.lineHeight +
        14
    );
    textChildren.push(
      svgEl('path', {
        d: `M ${coverCenterX - 110} ${underlineY} Q ${coverCenterX} ${underlineY + 4}, ${coverCenterX + 110} ${underlineY}`,
        fill: 'none',
        stroke: TOKENS.colors.terracottaRoof,
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
      })
    );

    if (wrappedSubtitle && wrappedSubtitle.lines.length > 0) {
      const subtitleStartY = round2(underlineY + 28);
      textChildren.push(
        renderWrappedCoverTextElement({
          id: 'book-front-cover-subtitle',
          x: coverCenterX,
          topCenterY: subtitleStartY,
          wrapped: wrappedSubtitle,
          maxWidthPx: maxTextWidth,
          fill: TOKENS.colors.faintPencil,
          charWidthRatio: 0.53,
          fullText: bookState.coverSubtitle,
        })
      );
    }

    if (wrappedCredit && wrappedCredit.lines.length > 0) {
      const creditStartY = round2(
        cardY +
          cardH -
          28 -
          (wrappedCredit.lines.length - 1) * wrappedCredit.lineHeight
      );
      textChildren.push(
        renderWrappedCoverTextElement({
          id: 'book-front-cover-credit',
          x: coverCenterX,
          topCenterY: creditStartY,
          wrapped: wrappedCredit,
          maxWidthPx: maxTextWidth,
          fill: TOKENS.colors.faintPencil,
          charWidthRatio: 0.52,
          fullText: bookState.creditText,
        })
      );
    }
  } else {
    // Ending / Credits Cover Typography
    const wrappedHeading = wrapAndFitCoverText({
      text: bookState.endingTitle,
      maxWidthPx: maxTextWidth,
      baseFontSize: 40,
      minFontSize: 28,
      maxLines: 2,
      charWidthRatio: 0.58,
    });
    const wrappedSceneTitle = wrapAndFitCoverText({
      text: bookState.coverTitle,
      maxWidthPx: maxTextWidth,
      baseFontSize: 26,
      minFontSize: 18,
      maxLines: 2,
      charWidthRatio: 0.56,
    });
    const wrappedEndingCredit = wrapAndFitCoverText({
      text: bookState.endingCredit,
      maxWidthPx: maxTextWidth,
      baseFontSize: 18,
      minFontSize: 14,
      maxLines: 3,
      charWidthRatio: 0.53,
    });

    const headingY = centerY - 56;
    const sceneTitleY = round2(
      headingY + wrappedHeading.lines.length * wrappedHeading.lineHeight + 10
    );
    const creditY = round2(
      sceneTitleY +
        wrappedSceneTitle.lines.length * wrappedSceneTitle.lineHeight +
        14
    );

    textChildren.push(
      renderWrappedCoverTextElement({
        id: 'book-ending-cover-heading',
        x: coverCenterX,
        topCenterY: headingY,
        wrapped: wrappedHeading,
        maxWidthPx: maxTextWidth,
        fill: TOKENS.colors.charcoalOutline,
        fontWeight: 'bold',
        charWidthRatio: 0.58,
        fullText: bookState.endingTitle,
      }),
      renderWrappedCoverTextElement({
        id: 'book-ending-cover-scene-title',
        x: coverCenterX,
        topCenterY: sceneTitleY,
        wrapped: wrappedSceneTitle,
        maxWidthPx: maxTextWidth,
        fill: TOKENS.colors.terracottaDark,
        fontWeight: 'bold',
        charWidthRatio: 0.56,
        fullText: bookState.coverTitle,
      }),
      renderWrappedCoverTextElement({
        id: 'book-ending-cover-credit',
        x: coverCenterX,
        topCenterY: creditY,
        wrapped: wrappedEndingCredit,
        maxWidthPx: maxTextWidth,
        fill: TOKENS.colors.faintPencil,
        charWidthRatio: 0.53,
        fullText: bookState.endingCredit,
      })
    );

    if (
      bookState.creditText &&
      !bookState.endingCredit.includes(bookState.creditText)
    ) {
      const wrappedSubcredit = wrapAndFitCoverText({
        text: bookState.creditText,
        maxWidthPx: maxTextWidth,
        baseFontSize: 16,
        minFontSize: 13,
        maxLines: 2,
        charWidthRatio: 0.52,
      });
      textChildren.push(
        renderWrappedCoverTextElement({
          id: 'book-ending-cover-subcredit',
          x: coverCenterX,
          topCenterY: cardY + cardH - 30,
          wrapped: wrappedSubcredit,
          maxWidthPx: maxTextWidth,
          fill: TOKENS.colors.faintPencil,
          charWidthRatio: 0.52,
          fullText: bookState.creditText,
        })
      );
    }
  }

  // 3D perspective foreshortening + keystone skew when 0 < openP <= 0.5
  let transform = '';
  if (openP > 0) {
    const scaleX = round2(Math.max(0.05, cosTheta));
    const skewYDeg = round2(
      (-Math.atan2(perspLift, Math.max(40, bookW * scaleX)) * 180) / Math.PI
    );
    transform = `translate(${spineX}, 0) skewY(${skewYDeg}) scale(${scaleX}, 1) translate(${-bookLeft}, 0)`;
  }

  return svgEl(
    'g',
    {
      id: coverId,
      'data-cover-progress': round2(progress),
      'data-cover-angle-deg': angleDeg,
      'data-hinge-side': 'left',
      transform: transform || undefined,
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: clipId }, [
          svgEl('rect', {
            x: cardX + 8,
            y: cardY + 8,
            width: cardW - 16,
            height: cardH - 16,
            rx: 10,
          }),
        ]),
      ]),
      // Left Spine Strip (reddish-brown terracotta)
      svgEl('rect', {
        x: bookLeft,
        y: 0,
        width: spineW,
        height: bookH,
        fill: getPatternFill('crayonTerracotta'),
        ...strokeAttrs,
      }),
      // Main Front Cover Board (tan/ochre)
      svgEl('rect', {
        x: mainBoardX,
        y: 0,
        width: mainBoardW,
        height: bookH,
        fill: getPatternFill('crayonOchre'),
        ...strokeAttrs,
      }),
      // Right Back-Edge Strip (reddish-brown terracotta)
      svgEl('rect', {
        x: bookRight - rightEdgeW,
        y: 0,
        width: rightEdgeW,
        height: bookH,
        fill: getPatternFill('crayonTerracotta'),
        ...strokeAttrs,
      }),
      // Inset Cream Title Card inside the front cover board
      svgEl('rect', {
        id: 'book-cover-title-card',
        x: cardX,
        y: cardY,
        width: cardW,
        height: cardH,
        rx: 14,
        ry: 14,
        fill: TOKENS.colors.paperWarm,
        ...strokeAttrs,
      }),
      svgEl('rect', {
        x: cardX + 10,
        y: cardY + 10,
        width: cardW - 20,
        height: cardH - 20,
        rx: 9,
        ry: 9,
        fill: 'none',
        stroke: TOKENS.colors.terracottaRoof,
        'stroke-width': 1.8,
        'stroke-dasharray': '7 5',
      }),
      // Outer crisp charcoal border around closed book
      svgEl('rect', {
        x: bookLeft,
        y: 0,
        width: bookW,
        height: bookH,
        fill: 'none',
        ...strokeAttrs,
      }),
      // Clipped text group + nested SVG container so title/subtitle can never overflow the card
      svgEl(
        'g',
        {
          id: 'book-cover-text-group',
          'clip-path': `url(#${clipId})`,
        },
        [
          svgEl(
            'svg',
            {
              id: 'book-cover-box-container',
              x: cardX,
              y: cardY,
              width: cardW,
              height: cardH,
              viewBox: `${cardX} ${cardY} ${cardW} ${cardH}`,
              overflow: 'hidden',
            },
            textChildren
          ),
        ]
      ),
    ]
  );
}

/**
 * Wraps the inner scene markup inside the animated Picture-Book spread and front/ending
 * hardcover overlays during `'opening'` and `'closing'` phases.
 * When `!bookState.enabled || bookState.phase === 'story'`, returns `innerSceneMarkup` unchanged.
 */
export function renderBookFrameOverlay(
  params: RenderBookFrameOverlayParams
): string {
  const { innerSceneMarkup, width, height, bookState, frameIndex } = params;

  if (!bookState.enabled || bookState.phase === 'story') {
    return innerSceneMarkup;
  }

  const cx = width / 2;
  const cy = height / 2;
  const s = bookState.bookScale;
  const tx = round2(cx * (1 - s));
  const ty = round2(cy * (1 - s));

  const spreadTransform = svgTransform({
    x: tx,
    y: ty,
    scale: s,
  });

  const openP =
    bookState.phase === 'opening'
      ? clamp01(bookState.coverOpenProgress)
      : clamp01(1 - bookState.coverCloseProgress);

  const isFullyClosed = openP <= 0;

  const {
    underlayMarkup,
    spineOverlayMarkup,
    clipDefMarkup,
    leftOpenEdgeX,
    spineX,
  } = renderOpenBookBoardsAndPages(width, height, openP, isFullyClosed);

  const rawSceneContent = isFullyClosed
    ? svgEl(
        'g',
        { id: 'book-inner-scene-hidden', opacity: 0, 'pointer-events': 'none' },
        [innerSceneMarkup]
      )
    : innerSceneMarkup;

  const pageContainerMarkup = svgEl(
    'svg',
    {
      id: 'book-page-container',
      x: 0,
      y: 0,
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      overflow: 'hidden',
    },
    [rawSceneContent]
  );

  const halfW = round2(width / 2);
  let spreadPagesContent: string;
  if (!isFullyClosed && openP < 1) {
    const rightPageScene = svgEl(
      'g',
      {
        id: 'book-opening-right-page',
        transform: `translate(${round2(spineX - halfW)}, 0)`,
        'clip-path': 'url(#book-right-half-scene-clip)',
      },
      [pageContainerMarkup]
    );
    const leftPageW = Math.max(0, round2(spineX - leftOpenEdgeX));
    const leftScaleX = round2(Math.max(0.02, leftPageW / halfW));
    const leftPageScene =
      leftOpenEdgeX < spineX
        ? svgEl(
            'g',
            {
              id: 'book-opening-left-page',
              'data-left-page-scale-x': leftScaleX,
              transform: `translate(${leftOpenEdgeX}, 0) scale(${leftScaleX}, 1)`,
              'clip-path': 'url(#book-left-half-scene-clip)',
            },
            [pageContainerMarkup]
          )
        : '';
    spreadPagesContent = [underlayMarkup, leftPageScene, rightPageScene].join(
      ''
    );
  } else {
    spreadPagesContent = [underlayMarkup, pageContainerMarkup].join('');
  }

  const clippedSpreadScene = !isFullyClosed
    ? svgEl(
        'g',
        {
          id: 'book-page-clip-group',
          'clip-path': 'url(#book-open-page-clip)',
        },
        [spreadPagesContent]
      )
    : spreadPagesContent;

  const turningPagesMarkup = renderTurningFlyleafPages(width, height, openP);

  let coverMarkup = '';
  if (bookState.phase === 'opening' && bookState.coverOpenProgress < 1) {
    coverMarkup = renderBookCoverOverlay(
      width,
      height,
      bookState,
      frameIndex,
      'front'
    );
  } else if (
    bookState.phase === 'closing' &&
    bookState.coverCloseProgress > 0
  ) {
    coverMarkup = renderBookCoverOverlay(
      width,
      height,
      bookState,
      frameIndex,
      'ending'
    );
  }

  return svgEl(
    'g',
    {
      id: 'book-frame-wrapper',
      'data-book-phase': bookState.phase,
    },
    [
      clipDefMarkup ? svgEl('defs', {}, [clipDefMarkup]) : '',
      renderDeskBackdrop(width, height),
      svgEl(
        'g',
        {
          id: 'book-frame-spread',
          'data-book-phase': bookState.phase,
          'data-book-scale': bookState.bookScale,
          'data-color-multiplier': bookState.colorFillMultiplier,
          transform: spreadTransform || undefined,
        },
        [
          clippedSpreadScene,
          spineOverlayMarkup,
          turningPagesMarkup,
          coverMarkup,
        ]
      ),
    ]
  );
}

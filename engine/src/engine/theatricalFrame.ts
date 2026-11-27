import { TOKENS, svgUrl } from '../theme/tokens';
import { evaluateSteppedClock } from './clock';
import { clamp01, round2, svgEl } from './svgUtils';

export type TheatricalFramePhase = 'opening' | 'story' | 'closing';
export type TheatricalTransitionMode = 'iris' | 'fade';

export interface TheatricalFrameConfig {
  /** Whether the classic theatrical opening/closing frame is enabled (default: true for classic_cel scenes) */
  enabled?: boolean;
  /** Transition style: classic circular iris ('iris', default) or warm theatre fade ('fade') */
  mode?: TheatricalTransitionMode;
  /** Opening title card heading (defaults to scene.title) */
  title?: string;
  /** Optional subtitle below the opening title (defaults to scene.subtitle) */
  subtitle?: string;
  /** Optional studio/style credit line */
  creditText?: string;
  /** Closing card heading (defaults to 'The End') */
  endingTitle?: string;
  /** Closing card subtitle / credit */
  endingCredit?: string;
  /** Opening sequence duration in seconds (default: 3.0) */
  openDurationSec?: number;
  /** Closing sequence duration in seconds (default: 3.0) */
  closeDurationSec?: number;
  /** Optional focus coordinates (in 1280×720 space) for the closing iris-out (default: center) */
  irisFocus?: { x: number; y: number };
  /** Whether to show the opening title card overlay during opening phase (default: true) */
  showTitleCard?: boolean;
}

export interface EvaluatedTheatricalFrameState {
  enabled: boolean;
  phase: TheatricalFramePhase;
  mode: TheatricalTransitionMode;
  /** 0 = fully closed (dark screen), 1 = fully open */
  irisProgress: number;
  /** 0 = no fade veil, 1 = fully black veil */
  blackVeilOpacity: number;
  /** 0 = hidden, 1 = full title card opacity */
  titleCardOpacity: number;
  /** 0 = hidden, 1 = full ending card opacity */
  endingCardOpacity: number;
  title: string;
  subtitle: string;
  creditText: string;
  endingTitle: string;
  endingCredit: string;
  irisFocus: { x: number; y: number };
  openDurationSec: number;
  closeDurationSec: number;
}

const DEFAULT_OPEN_DURATION_SEC = 3.0;
const DEFAULT_CLOSE_DURATION_SEC = 3.0;

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Evaluates the classic theatrical opening (fade/iris-in + serif title card) and
 * closing (iris-out + "The End" card) state at `timeSec`.
 */
export function evaluateTheatricalFrameState(options: {
  timeSec: number;
  durationSec: number;
  fps?: number;
  config?: TheatricalFrameConfig | boolean;
  sceneTitle: string;
  sceneSubtitle?: string;
}): EvaluatedTheatricalFrameState {
  const { timeSec, durationSec, sceneTitle, sceneSubtitle } = options;
  const fps = options.fps ?? TOKENS.classicCel.timing.fps;
  const cfgObj: TheatricalFrameConfig =
    typeof options.config === 'object' && options.config !== null
      ? options.config
      : {};

  const enabled =
    options.config === false
      ? false
      : (cfgObj.enabled ?? true) && durationSec > 4;

  const mode: TheatricalTransitionMode = cfgObj.mode ?? 'iris';
  const openDurationSec = Math.min(
    cfgObj.openDurationSec ?? DEFAULT_OPEN_DURATION_SEC,
    Math.max(1.2, durationSec * 0.25)
  );
  const closeDurationSec = Math.min(
    cfgObj.closeDurationSec ?? DEFAULT_CLOSE_DURATION_SEC,
    Math.max(1.2, durationSec * 0.25)
  );

  const title = cfgObj.title ?? sceneTitle;
  const subtitle = cfgObj.subtitle ?? sceneSubtitle ?? '';
  const creditText = cfgObj.creditText ?? 'A Classic Hand-Drawn Short';
  const endingTitle = cfgObj.endingTitle ?? 'The End';
  const endingCredit = cfgObj.endingCredit ?? sceneTitle;
  const irisFocus = cfgObj.irisFocus ?? {
    x: TOKENS.canvas.width / 2,
    y: TOKENS.canvas.height / 2,
  };
  const showTitleCard = cfgObj.showTitleCard ?? true;

  if (!enabled) {
    return {
      enabled: false,
      phase: 'story',
      mode,
      irisProgress: 1,
      blackVeilOpacity: 0,
      titleCardOpacity: 0,
      endingCardOpacity: 0,
      title,
      subtitle,
      creditText,
      endingTitle,
      endingCredit,
      irisFocus,
      openDurationSec,
      closeDurationSec,
    };
  }

  const clock = evaluateSteppedClock(timeSec, fps, durationSec);
  const qTime = clock.quantizedTimeSec;
  const closeStartSec = Math.max(openDurationSec, durationSec - closeDurationSec);

  if (qTime < openDurationSec) {
    const p = clamp01(qTime / Math.max(0.001, openDurationSec));
    // Iris opens across first 55% of opening; black veil lifts across first 38%
    const irisProgress = mode === 'iris' ? smoothstep(p / 0.58) : 1;
    const blackVeilOpacity =
      mode === 'fade'
        ? round2(1 - smoothstep(p / 0.48))
        : round2((1 - smoothstep(p / 0.28)) * 0.92);

    // Title card fades in quickly, holds over establishing shot, fades out before story beat
    let titleCardOpacity = 0;
    if (showTitleCard) {
      if (p < 0.18) {
        titleCardOpacity = smoothstep(p / 0.18);
      } else if (p < 0.72) {
        titleCardOpacity = 1;
      } else {
        titleCardOpacity = 1 - smoothstep((p - 0.72) / 0.28);
      }
    }

    return {
      enabled: true,
      phase: 'opening',
      mode,
      irisProgress: round2(irisProgress),
      blackVeilOpacity,
      titleCardOpacity: round2(titleCardOpacity),
      endingCardOpacity: 0,
      title,
      subtitle,
      creditText,
      endingTitle,
      endingCredit,
      irisFocus,
      openDurationSec,
      closeDurationSec,
    };
  }

  if (qTime >= closeStartSec) {
    const p = clamp01((qTime - closeStartSec) / Math.max(0.001, closeDurationSec));
    // Iris closes across first 62% of closing; ending card holds cleanly through the end
    const irisProgress = mode === 'iris' ? round2(1 - smoothstep(p / 0.62)) : 1;
    const blackVeilOpacity =
      mode === 'fade'
        ? round2(smoothstep(p / 0.6))
        : round2(smoothstep((p - 0.45) / 0.3));
    const endingCardOpacity = round2(smoothstep((p - 0.48) / 0.24));

    return {
      enabled: true,
      phase: 'closing',
      mode,
      irisProgress,
      blackVeilOpacity,
      titleCardOpacity: 0,
      endingCardOpacity,
      title,
      subtitle,
      creditText,
      endingTitle,
      endingCredit,
      irisFocus,
      openDurationSec,
      closeDurationSec,
    };
  }

  return {
    enabled: true,
    phase: 'story',
    mode,
    irisProgress: 1,
    blackVeilOpacity: 0,
    titleCardOpacity: 0,
    endingCardOpacity: 0,
    title,
    subtitle,
    creditText,
    endingTitle,
    endingCredit,
    irisFocus,
    openDurationSec,
    closeDurationSec,
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wraps the rendered classic-cel scene in an authentic 1970s–80s theatrical
 * iris/fade opening title card & closing "The End" card.
 * During `phase === 'story'`, returns `innerSceneMarkup` untouched.
 */
export function renderTheatricalFrameOverlay(options: {
  innerSceneMarkup: string;
  width: number;
  height: number;
  theatricalState: EvaluatedTheatricalFrameState;
}): string {
  const { innerSceneMarkup, width, height, theatricalState } = options;

  if (!theatricalState.enabled || theatricalState.phase === 'story') {
    return innerSceneMarkup;
  }

  const celColors = TOKENS.classicCel.colors;
  const serifFont = TOKENS.classicCel.typography.fontFamilySerif;
  const cx =
    theatricalState.phase === 'closing'
      ? theatricalState.irisFocus.x
      : width / 2;
  const cy =
    theatricalState.phase === 'closing'
      ? theatricalState.irisFocus.y
      : height / 2;
  const maxRadius = Math.hypot(
    Math.max(cx, width - cx),
    Math.max(cy, height - cy)
  ) + 32;
  const currentRadius = round2(maxRadius * theatricalState.irisProgress);

  const overlays: string[] = [];

  // 1. Classic circular iris matte (using evenodd path so no extra <mask> ID collisions occur)
  if (theatricalState.mode === 'iris' && theatricalState.irisProgress < 0.995) {
    const r = Math.max(0.5, currentRadius);
    const irisMattePath = [
      `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`,
      `M ${round2(cx - r)} ${round2(cy)}`,
      `a ${r} ${r} 0 1 0 ${round2(r * 2)} 0`,
      `a ${r} ${r} 0 1 0 ${round2(-r * 2)} 0 Z`,
    ].join(' ');

    overlays.push(
      svgEl('path', {
        id: 'theatrical-iris-matte',
        d: irisMattePath,
        fill: celColors.backdropDark,
        'fill-rule': 'evenodd',
      })
    );

    if (r > 6 && r < maxRadius * 0.96) {
      overlays.push(
        svgEl('circle', {
          cx: round2(cx),
          cy: round2(cy),
          r,
          fill: 'none',
          stroke: celColors.backdropDark,
          'stroke-width': 18,
          opacity: 0.45,
          filter: svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow),
        })
      );
    }
  }

  // 2. Smooth cinema black fade veil
  if (theatricalState.blackVeilOpacity > 0.005) {
    overlays.push(
      svgEl('rect', {
        id: 'theatrical-fade-veil',
        x: 0,
        y: 0,
        width,
        height,
        fill: celColors.backdropDark,
        opacity: theatricalState.blackVeilOpacity,
      })
    );
  }

  // 3. Opening gold-serif theatrical title card
  if (theatricalState.titleCardOpacity > 0.01) {
    const midX = round2(width / 2);
    const midY = round2(height * 0.34);
    overlays.push(
      svgEl(
        'g',
        {
          id: 'theatrical-opening-title',
          opacity: theatricalState.titleCardOpacity,
        },
        [
          // Subtle dark velvet scrim behind title for crisp legibility over painted night sky
          svgEl('ellipse', {
            cx: midX,
            cy: round2(midY + 14),
            rx: 430,
            ry: 112,
            fill: celColors.backdropDark,
            opacity: 0.44,
          }),
          // Credit line above title
          svgEl(
            'text',
            {
              x: midX,
              y: round2(midY - 46),
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 17,
              'font-style': 'italic',
              'letter-spacing': '2.4',
              fill: celColors.celCream,
              opacity: 0.88,
            },
            escapeXml(theatricalState.creditText)
          ),
          // Drop-shadow title
          svgEl(
            'text',
            {
              x: round2(midX + 2.5),
              y: round2(midY + 8.5),
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 56,
              'font-weight': 'bold',
              'letter-spacing': '1.2',
              fill: celColors.goldTitleShadow,
              opacity: 0.85,
            },
            escapeXml(theatricalState.title)
          ),
          // Main gold-serif title
          svgEl(
            'text',
            {
              x: midX,
              y: round2(midY + 6),
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 56,
              'font-weight': 'bold',
              'letter-spacing': '1.2',
              fill: celColors.goldTitle,
              stroke: celColors.goldTitleShadow,
              'stroke-width': 1.2,
            },
            escapeXml(theatricalState.title)
          ),
          // Classic ornamental hairline divider
          svgEl('line', {
            x1: round2(midX - 180),
            y1: round2(midY + 28),
            x2: round2(midX + 180),
            y2: round2(midY + 28),
            stroke: celColors.goldTitle,
            'stroke-width': 1.4,
            opacity: 0.78,
          }),
          svgEl('polygon', {
            points: `${midX},${round2(midY + 22)} ${round2(midX + 6)},${round2(midY + 28)} ${midX},${round2(midY + 34)} ${round2(midX - 6)},${round2(midY + 28)}`,
            fill: celColors.goldTitle,
            opacity: 0.9,
          }),
          // Optional subtitle
          theatricalState.subtitle
            ? svgEl(
                'text',
                {
                  x: midX,
                  y: round2(midY + 60),
                  'text-anchor': 'middle',
                  'font-family': serifFont,
                  'font-size': 21,
                  'font-style': 'italic',
                  fill: celColors.celCream,
                  opacity: 0.92,
                },
                escapeXml(theatricalState.subtitle)
              )
            : '',
        ]
      )
    );
  }

  // 4. Closing gold-serif "The End" card
  if (theatricalState.endingCardOpacity > 0.01) {
    const midX = round2(width / 2);
    const midY = round2(height * 0.48);
    overlays.push(
      svgEl(
        'g',
        {
          id: 'theatrical-ending-card',
          opacity: theatricalState.endingCardOpacity,
        },
        [
          svgEl(
            'text',
            {
              x: round2(midX + 2.5),
              y: round2(midY + 2.5),
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 66,
              'font-style': 'italic',
              'font-weight': 'bold',
              'letter-spacing': '2',
              fill: celColors.goldTitleShadow,
            },
            escapeXml(theatricalState.endingTitle)
          ),
          svgEl(
            'text',
            {
              x: midX,
              y: midY,
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 66,
              'font-style': 'italic',
              'font-weight': 'bold',
              'letter-spacing': '2',
              fill: celColors.goldTitle,
            },
            escapeXml(theatricalState.endingTitle)
          ),
          svgEl('line', {
            x1: round2(midX - 130),
            y1: round2(midY + 24),
            x2: round2(midX + 130),
            y2: round2(midY + 24),
            stroke: celColors.goldTitle,
            'stroke-width': 1.2,
            opacity: 0.7,
          }),
          svgEl(
            'text',
            {
              x: midX,
              y: round2(midY + 58),
              'text-anchor': 'middle',
              'font-family': serifFont,
              'font-size': 20,
              'letter-spacing': '1.4',
              fill: celColors.celCream,
              opacity: 0.85,
            },
            escapeXml(theatricalState.endingCredit)
          ),
        ]
      )
    );
  }

  return svgEl(
    'g',
    {
      id: 'theatrical-frame-wrapper',
      'data-theatrical-phase': theatricalState.phase,
    },
    [innerSceneMarkup, ...overlays]
  );
}

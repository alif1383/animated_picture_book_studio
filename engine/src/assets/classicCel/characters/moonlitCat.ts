import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';

type ClassicEyeMode = 'open' | 'blink' | 'curious' | 'sparkle' | 'happy';

interface ClassicHeadConfig {
  pfx: string;
  cx: number;
  cy: number;
  headTilt: number;
  eyeMode: ClassicEyeMode;
  speaking?: boolean;
  curiousMouth?: boolean;
  compactWhiskers?: boolean;
  earPerk?: number;
  earLag?: number;
  frameIndex: number;
}

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-mochi';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-mochi-${clean}` : 'cc-mochi';
}

/**
 * Renders Mochi's gleaming 2-tone cel crescent-moon collar charm (`data-part="moon-charm"`).
 */
function renderClassicMoonCharm(
  pfx: string,
  cx: number,
  cy: number,
  scale = 1,
  glint = false,
  swingDeg = 0
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const crescentD =
    'M 2.8 -4.7 C -4.2 -4.9, -5.4 4.9, 2.8 4.9 C -0.8 3.2, -0.8 -3.1, 2.8 -4.7 Z';

  return svgEl(
    'g',
    {
      'data-part': 'moon-charm',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: swingDeg,
        pivotX: 0,
        pivotY: -5.4,
        scale,
      }),
    },
    [
      // Clasp ring linking crimson ribbon collar to crescent charm
      svgEl('circle', {
        cx: 0,
        cy: -5.4,
        r: 1.45,
        fill: c.mochiGold,
        ...celStrokeAttrs({ strokeWidth: 1.05 }),
      }),
      // 2-tone gleaming golden crescent charm with crisp shadow & specular rim
      celShadedShape({
        clipId: `${pfx}-charm`,
        d: crescentD,
        baseFill: c.mochiGold,
        shadowPaths: ['M -5.5 0.6 C -2.8 2.2, 0.4 3.0, 3.6 3.0 L 3.6 6.2 L -6.0 6.2 Z'],
        shadowFill: c.moonShadow,
        highlightPaths: [
          'M -3.8 -3.4 C -1.4 -4.5, 1.0 -4.8, 3.2 -4.6 C 0.8 -3.3, -1.3 -1.9, -2.0 0.2 C -3.4 -0.4, -4.2 -1.9, -3.8 -3.4 Z',
        ],
        highlightFill: c.mochiGoldHighlight,
        highlightOpacity: 0.92,
        strokeWidth: s.xeroxFine,
      }),
      // Crisp 4-point Disney star glint on golden crescent edge
      glint
        ? svgEl('path', {
            d: 'M -1.8 -3.4 L -1.3 -1.7 L 0.4 -1.3 L -1.3 -0.9 L -1.8 0.8 L -2.3 -0.9 L -4.0 -1.3 L -2.3 -1.7 Z',
            fill: c.starGlow,
            opacity: 0.96,
          })
        : svgEl('circle', {
            cx: -1.7,
            cy: -1.5,
            r: 0.8,
            fill: c.mochiGoldHighlight,
            opacity: 0.88,
          }),
    ]
  );
}

/**
 * Renders Mochi's classic 1970s–80s Disney feline head (canonical +X forward):
 * - Sculpted slender kitten silhouette with flared cheek fur tufts & 2-tone cel shading + moonlit rim
 * - Expressive Aristocats-style ears with dusty-rose inner shading, Xerox fur tuft ticks & secondary lag
 * - Classic navy tabby 'M' forehead crest & tapered cheek stripes (`data-part="tabby-markings"`)
 * - Expressive classic Disney eyes: warm cream sclera, golden-amber irises, large pupils with dual catchlights,
 *   tapered upper eyelids & brows (`data-part="eyes"`)
 * - 4-phase 12 FPS cel lip-sync mouths (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`)
 */
function renderClassicMochiHead(cfg: ClassicHeadConfig): string {
  const {
    pfx,
    cx,
    cy,
    headTilt,
    eyeMode,
    speaking = false,
    curiousMouth = false,
    compactWhiskers = false,
    earPerk = 0,
    earLag = 0,
    frameIndex,
  } = cfg;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const earTipY = round2(-25 - earPerk);
  const earTipDx = round2(earLag * 0.65);
  const whiskerSway = speaking
    ? steppedOscillate(frameIndex, 6, 1.35, -1)
    : steppedOscillate(frameIndex, 18, 0.55, -2);
  const wScale = compactWhiskers ? 0.78 : 1;

  // Classic Disney expressive eyes (`data-part="eyes"`)
  let eyesMarkup: string;
  if (eyeMode === 'blink' || eyeMode === 'happy') {
    const isHappy = eyeMode === 'happy';
    const arcY = isHappy ? -6.0 : -4.8;
    const baseY = isHappy ? -1.4 : -2.0;
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Closed expressive upper-lash arcs with delicate outer kitten flicks
      svgEl('path', {
        d: `M -9.2 ${baseY} Q -4.8 ${arcY}, -0.4 ${baseY} M -9.2 ${baseY} L -10.8 ${round2(baseY - 1.1)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
      }),
      svgEl('path', {
        d: `M 5.4 ${baseY} Q 9.4 ${arcY}, 13.4 ${baseY} M 13.4 ${baseY} L 15.0 ${round2(baseY - 1.1)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
      }),
      // Delicate eyelid crease fold lines
      svgEl('path', {
        d: `M -7.6 ${round2(arcY - 1.3)} Q -4.8 ${round2(arcY - 2.3)}, -2.0 ${round2(arcY - 1.3)} M 6.8 ${round2(arcY - 1.3)} Q 9.4 ${round2(arcY - 2.3)}, 12.0 ${round2(arcY - 1.3)}`,
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          opacity: 0.78,
        }),
      }),
    ]);
  } else {
    const isCurious = eyeMode === 'curious';
    const isSparkle = eyeMode === 'sparkle';
    const rxL = isCurious ? 4.7 : 4.4;
    const ryL = isCurious ? 5.6 : isSparkle ? 5.3 : 5.0;
    const rxR = isCurious ? 4.3 : 4.0;
    const ryR = isCurious ? 5.6 : isSparkle ? 5.3 : 5.0;

    // Expressive gaze shift (+X forward, slight -Y lift when curious/sparkling)
    const pupilDx = isCurious ? 1.15 : isSparkle ? 1.0 : 0.65;
    const pupilDy = isCurious ? -1.25 : isSparkle ? -0.55 : 0.1;

    const eyeClipL = `${pfx}-eye-l`;
    const eyeClipR = `${pfx}-eye-r`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Clip definitions for clean iris & upper-lid shadow containment
      svgEl(
        'clipPath',
        { id: eyeClipL },
        svgEl('ellipse', { cx: -4.7, cy: -2.6, rx: rxL, ry: ryL })
      ),
      svgEl(
        'clipPath',
        { id: eyeClipR },
        svgEl('ellipse', { cx: 9.3, cy: -2.6, rx: rxR, ry: ryR })
      ),

      // --- Left (back-side) Disney eye ---
      svgEl('ellipse', {
        cx: -4.7,
        cy: -2.6,
        rx: rxL,
        ry: ryL,
        fill: c.celCream,
        stroke: 'none',
      }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipL) }, [
        // Subtle upper sclera shadow beneath lid
        svgEl('path', {
          d: `M -10 -8.5 L 1 -8.5 L 1 -5.6 Q -4.7 -4.6, -10 -5.6 Z`,
          fill: c.mochiCreamShadow,
          opacity: 0.52,
        }),
        // Golden-amber iris
        svgEl('ellipse', {
          cx: round2(-4.7 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 3.1,
          ry: 3.8,
          fill: c.mochiEyeIris,
          ...celStrokeAttrs({ stroke: c.goldTitleShadow, strokeWidth: 0.7 }),
        }),
        // Bright lower-iris gold glow crescent
        svgEl('ellipse', {
          cx: round2(-4.4 + pupilDx),
          cy: round2(-0.8 + pupilDy),
          rx: 1.9,
          ry: 1.3,
          fill: c.mochiGoldHighlight,
          opacity: 0.72,
        }),
        // Expressive charcoal pupil
        svgEl('ellipse', {
          cx: round2(-4.7 + pupilDx),
          cy: round2(-2.5 + pupilDy),
          rx: 1.95,
          ry: 2.65,
          fill: c.xeroxInk,
        }),
        // Crisp primary & secondary catchlights
        svgEl('circle', {
          cx: round2(-5.7 + pupilDx),
          cy: round2(-4.1 + pupilDy),
          r: isSparkle ? 1.3 : 1.05,
          fill: c.celCream,
        }),
        svgEl('circle', {
          cx: round2(-3.5 + pupilDx),
          cy: round2(-1.1 + pupilDy),
          r: 0.55,
          fill: isSparkle ? c.starGlow : c.celCream,
        }),
      ]),
      // Left eye clean outline + expressive thick Disney upper lash line
      svgEl('ellipse', {
        cx: -4.7,
        cy: -2.6,
        rx: rxL,
        ry: ryL,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine }),
      }),
      svgEl('path', {
        d: `M ${round2(-4.7 - rxL - 1.1)} -4.2 Q -4.7 ${round2(-2.6 - ryL - 1.4)}, ${round2(-4.7 + rxL)} -4.6`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
      }),

      // --- Right (front-side) Disney eye ---
      svgEl('ellipse', {
        cx: 9.3,
        cy: -2.6,
        rx: rxR,
        ry: ryR,
        fill: c.celCream,
        stroke: 'none',
      }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipR) }, [
        // Subtle upper sclera shadow beneath lid
        svgEl('path', {
          d: `M 4 -8.5 L 15 -8.5 L 15 -5.6 Q 9.3 -4.6, 4 -5.6 Z`,
          fill: c.mochiCreamShadow,
          opacity: 0.52,
        }),
        // Golden-amber iris
        svgEl('ellipse', {
          cx: round2(9.3 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 2.9,
          ry: 3.8,
          fill: c.mochiEyeIris,
          ...celStrokeAttrs({ stroke: c.goldTitleShadow, strokeWidth: 0.7 }),
        }),
        // Bright lower-iris gold glow crescent
        svgEl('ellipse', {
          cx: round2(9.6 + pupilDx),
          cy: round2(-0.8 + pupilDy),
          rx: 1.75,
          ry: 1.3,
          fill: c.mochiGoldHighlight,
          opacity: 0.72,
        }),
        // Expressive charcoal pupil
        svgEl('ellipse', {
          cx: round2(9.3 + pupilDx),
          cy: round2(-2.5 + pupilDy),
          rx: 1.85,
          ry: 2.65,
          fill: c.xeroxInk,
        }),
        // Crisp primary & secondary catchlights
        svgEl('circle', {
          cx: round2(8.4 + pupilDx),
          cy: round2(-4.1 + pupilDy),
          r: isSparkle ? 1.3 : 1.05,
          fill: c.celCream,
        }),
        svgEl('circle', {
          cx: round2(10.4 + pupilDx),
          cy: round2(-1.1 + pupilDy),
          r: 0.55,
          fill: isSparkle ? c.starGlow : c.celCream,
        }),
      ]),
      // Right eye clean outline + expressive thick Disney upper lash line with outer flick
      svgEl('ellipse', {
        cx: 9.3,
        cy: -2.6,
        rx: rxR,
        ry: ryR,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine }),
      }),
      svgEl('path', {
        d: `M ${round2(9.3 - rxR)} -4.6 Q 9.3 ${round2(-2.6 - ryR - 1.4)}, ${round2(9.3 + rxR + 1.1)} -4.2`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
      }),

      // Expressive classic Disney eyebrows (raised high when curious/sparkling, gentle arch otherwise)
      svgEl('path', {
        d: isCurious
          ? 'M -8.0 -10.2 Q -4.8 -12.3, -1.6 -10.4 M 6.4 -10.4 Q 9.3 -12.5, 12.2 -10.0'
          : isSparkle || speaking
          ? 'M -7.6 -9.4 Q -4.8 -11.0, -2.0 -9.6 M 6.6 -9.6 Q 9.3 -11.2, 12.0 -9.4'
          : 'M -7.4 -8.9 Q -4.8 -9.9, -2.2 -9.1 M 6.8 -9.1 Q 9.3 -10.1, 11.8 -8.9',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.35 }),
      }),
    ]);
  }

  // Mouth: 4-phase 12 FPS expressive cel lip-sync when singing/speaking, or classic kitty smile
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed expressive Disney kitty smile
      phaseShape = [
        svgEl('path', {
          d: 'M -0.8 6.4 Q 1.6 9.1, 3.8 6.0 Q 6.0 9.1, 8.4 6.4',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.55 }),
        }),
        svgEl('path', {
          d: 'M 2.3 9.7 Q 3.8 10.6, 5.3 9.7',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
          }),
        }),
      ].join('');
    } else if (mouthPhase === 1) {
      // Phase 1: Soft rounded 'o' meow / vowel mouth
      phaseShape = [
        svgEl('ellipse', {
          cx: 3.8,
          cy: 8.1,
          rx: 2.55,
          ry: 2.95,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.45 }),
        }),
        svgEl('path', {
          d: 'M 2.1 9.4 Q 3.8 8.0, 5.5 9.4 C 4.9 10.6, 2.7 10.6, 2.1 9.4 Z',
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Open animated singing jaw with pink tongue & dark inner mouth
      phaseShape = [
        celPath(
          'M -1.4 5.7 Q 1.4 7.1, 3.8 5.6 Q 6.2 7.1, 9.0 5.7 C 8.8 12.4, -1.2 12.4, -1.4 5.7 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.45 }
        ),
        celPath(
          'M 0.6 9.8 Q 3.8 7.5, 7.0 9.8 C 5.8 11.7, 1.8 11.7, 0.6 9.8 Z',
          c.mochiTongue,
          { strokeWidth: 1.0 }
        ),
      ].join('');
    } else {
      // Phase 3: Half-open cheerful grin
      phaseShape = [
        celPath(
          'M -0.8 6.0 Q 1.5 7.4, 3.8 5.9 Q 6.1 7.4, 8.4 6.0 C 7.7 10.1, -0.1 10.1, -0.8 6.0 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.45 }
        ),
        svgEl('path', {
          d: 'M 1.2 8.7 Q 3.8 7.4, 6.4 8.7 C 5.3 9.7, 2.3 9.7, 1.2 8.7 Z',
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    }

    mouthMarkup = svgEl(
      'g',
      {
        'data-speaking-mouth': 'true',
        'data-mouth-phase': String(mouthPhase),
      },
      [
        svgEl('path', {
          d: 'M 3.8 4.0 L 3.8 5.6',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.35 }),
        }),
        phaseShape,
      ]
    );
  } else if (curiousMouth) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 3.8 4.0 L 3.8 5.6',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.35 }),
      }),
      svgEl('ellipse', {
        cx: 3.8,
        cy: 7.4,
        rx: 1.85,
        ry: 2.0,
        fill: c.mochiMouthInner,
        ...celStrokeAttrs({ strokeWidth: 1.35 }),
      }),
      svgEl('ellipse', {
        cx: 3.8,
        cy: 8.3,
        rx: 1.15,
        ry: 0.75,
        fill: c.mochiTongue,
      }),
    ]);
  } else {
    // Classic warm Disney feline ':3' smile with soft chin dimple
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 3.8 4.0 L 3.8 6.1 M -0.9 6.6 Q 1.5 9.3, 3.8 6.2 Q 6.1 9.3, 8.5 6.6',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5 }),
      }),
      svgEl('path', {
        d: 'M 2.5 9.9 Q 3.8 10.6, 5.1 9.9',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          opacity: 0.75,
        }),
      }),
    ]);
  }

  // Sculpted Disney kitten head with tapered cheek fur tufts on left & right
  const headOutlineD = [
    'M -17.5 -4.5',
    'C -19.2 -13.5, -9.8 -17.4, 1.0 -16.8',
    'C 11.4 -16.4, 18.8 -12.2, 19.2 -4.0',
    'L 21.8 -1.8 L 19.3 0.2 L 22.0 3.0 L 18.2 4.8',
    'C 16.0 11.4, 10.6 15.2, 2.2 15.2',
    'C -6.6 15.2, -14.2 12.2, -17.4 6.2',
    'L -21.2 4.4 L -18.5 1.8 L -21.0 -0.8 Z',
  ].join(' ');

  // Back-left & front-right expressive curved ears with secondary lag
  const earLeftD = `M -16.6 -7.2 C -19.0 -14.5, ${round2(-20.4 + earTipDx)} ${round2(earTipY + 4)}, ${round2(-18.8 + earTipDx)} ${earTipY} C ${round2(-14.2 + earTipDx * 0.6)} ${round2(earTipY + 2)}, -9.2 -11.4, -4.8 -14.6 Z`;
  const earRightD = `M 5.4 -14.4 C 9.2 -19.0, ${round2(13.6 + earTipDx * 0.7)} ${round2(earTipY + 1.5)}, ${round2(16.6 + earTipDx)} ${earTipY} C ${round2(18.6 + earTipDx * 0.6)} ${round2(earTipY + 5.5)}, 18.8 -12.2, 17.6 -6.2 Z`;

  return svgEl(
    'g',
    {
      'data-part': 'head',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: headTilt,
        pivotX: 0,
        pivotY: 14,
      }),
    },
    [
      // Back-left Aristocats ear with 2-tone cel shading, dusty-pink interior & Xerox tuft ticks
      celShadedShape({
        clipId: `${pfx}-ear-l`,
        d: earLeftD,
        baseFill: c.mochiFurBase,
        shadowPaths: [
          `M -22 -26 L -12 -26 L -14 -6 L -22 -6 Z`,
        ],
        shadowFill: c.mochiFurShadow,
        highlightPaths: [
          `M ${round2(-17.8 + earTipDx)} ${round2(earTipY + 1.2)} C ${round2(-13.8 + earTipDx * 0.6)} ${round2(earTipY + 3)}, -8.8 -12.0, -5.2 -14.8 L -7.6 -16.0 C -11.2 -13.6, ${round2(-14.6 + earTipDx * 0.6)} ${round2(earTipY + 0.5)}, ${round2(-17.8 + earTipDx)} ${round2(earTipY + 1.2)} Z`,
        ],
        highlightFill: c.mochiFurRim,
        highlightOpacity: 0.72,
        strokeWidth: s.xeroxMedium,
      }),
      svgEl('path', {
        d: `M -14.6 -9.0 C -16.2 -14.0, ${round2(-17.0 + earTipDx * 0.85)} ${round2(earTipY + 5.5)}, ${round2(-16.0 + earTipDx * 0.85)} ${round2(earTipY + 4.0)} C ${round2(-13.0 + earTipDx * 0.5)} ${round2(earTipY + 5.8)}, -9.6 -11.2, -7.2 -13.2 Z`,
        fill: c.mochiEarPink,
      }),
      // Subtle deeper ear-base shading & delicate Xerox fur tuft strokes
      svgEl('path', {
        d: `M -14.0 -9.4 Q -11.2 -11.8, -8.2 -13.0 M -12.6 -10.8 L -11.0 -13.2 M -14.4 -10.2 L -13.2 -12.4`,
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          opacity: 0.8,
        }),
      }),

      // Front-right Aristocats ear with 2-tone cel shading, moonlit rim & Xerox tuft ticks
      celShadedShape({
        clipId: `${pfx}-ear-r`,
        d: earRightD,
        baseFill: c.mochiFurBase,
        shadowPaths: [
          `M 4 -26 L 10.5 -26 L 11.2 -8 L 4 -8 Z`,
        ],
        shadowFill: c.mochiFurShadow,
        highlightPaths: [
          `M ${round2(16.6 + earTipDx)} ${earTipY} C ${round2(18.2 + earTipDx * 0.6)} ${round2(earTipY + 5.5)}, 18.6 -12.4, 17.5 -6.6 L 15.6 -7.4 C 16.4 -12.4, ${round2(16.4 + earTipDx * 0.6)} ${round2(earTipY + 6)}, ${round2(15.2 + earTipDx)} ${round2(earTipY + 2.2)} Z`,
        ],
        highlightFill: c.mochiFurRim,
        highlightOpacity: 0.82,
        strokeWidth: s.xeroxMedium,
      }),
      svgEl('path', {
        d: `M 7.8 -13.1 C 10.6 -16.8, ${round2(13.2 + earTipDx * 0.7)} ${round2(earTipY + 5.0)}, ${round2(14.8 + earTipDx * 0.85)} ${round2(earTipY + 4.2)} C ${round2(15.9 + earTipDx * 0.6)} ${round2(earTipY + 8.0)}, 16.0 -11.0, 15.2 -8.2 Z`,
        fill: c.mochiEarPink,
      }),
      svgEl('path', {
        d: `M 8.8 -12.4 Q 11.8 -11.2, 14.6 -8.8 M 10.4 -11.4 L 11.6 -13.6 M 12.6 -10.2 L 13.8 -12.2`,
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          opacity: 0.8,
        }),
      }),

      // Main sculpted head with 2-tone cel shadow plane & cool silver-blue moonlight rim
      celShadedShape({
        clipId: `${pfx}-head`,
        d: headOutlineD,
        baseFill: c.mochiFurBase,
        shadowPaths: [
          // Deep cool underside & left-cheek cel shadow plane
          'M -23 -10 C -17 -2, -13 7, -4 11 C 4 14, 13 13, 21 8 L 22 18 L -24 18 Z',
        ],
        shadowFill: c.mochiFurShadow,
        highlightPaths: [
          // Crisp silver-blue moonlit rim along crown & upper-right brow
          'M -10 -15.6 C -1 -17.4, 10 -16.8, 17.6 -10.8 C 19.0 -9.2, 19.6 -6.2, 19.4 -3.6 C 17.6 -8.2, 12.2 -13.4, 2.0 -14.2 C -3.8 -14.6, -7.8 -14.4, -10 -15.6 Z',
        ],
        highlightFill: c.mochiFurRim,
        highlightOpacity: 0.82,
        strokeWidth: s.xeroxHeavy,
      }),

      // Classic cel navy tabby forehead 'M' crest & cheek stripes (`data-part="tabby-markings"`)
      svgEl('g', { 'data-part': 'tabby-markings' }, [
        // Center forehead tapered tabby blaze
        svgEl('path', {
          d: 'M -0.4 -16.5 C 0.8 -16.6, 2.4 -16.6, 3.2 -16.4 C 2.7 -13.2, 2.2 -10.6, 1.4 -9.6 C 0.6 -10.6, 0.1 -13.2, -0.4 -16.5 Z',
          fill: c.mochiStripe,
        }),
        // Left & right flanking 'M' brow strokes
        svgEl('path', {
          d: 'M -5.4 -15.8 C -4.2 -16.1, -3.0 -16.2, -2.2 -16.2 C -2.0 -13.6, -1.6 -11.4, -2.2 -10.4 C -3.4 -11.4, -4.6 -13.4, -5.4 -15.8 Z',
          fill: c.mochiStripe,
        }),
        svgEl('path', {
          d: 'M 4.6 -16.2 C 5.6 -16.0, 6.8 -15.7, 7.8 -15.2 C 6.8 -13.0, 5.8 -11.2, 4.6 -10.3 C 4.2 -11.4, 4.4 -13.6, 4.6 -16.2 Z',
          fill: c.mochiStripe,
        }),
        // Tapered cheek tuft tabby stripes (left & right)
        svgEl('path', {
          d: 'M -18.8 -0.8 L -13.2 -0.2 L -14.2 1.2 L -19.2 1.0 Z M -18.6 3.0 L -13.4 2.6 L -14.2 4.1 L -19.0 4.6 Z',
          fill: c.mochiStripe,
          opacity: 0.9,
        }),
        svgEl('path', {
          d: 'M 19.6 -0.8 L 14.4 -0.2 L 15.2 1.2 L 20.0 1.0 Z M 19.4 2.8 L 14.6 2.5 L 15.4 4.0 L 19.6 4.4 Z',
          fill: c.mochiStripe,
          opacity: 0.9,
        }),
      ]),

      // Soft sculpted cream muzzle & chin with 2-tone cel underside shadow
      celShadedShape({
        clipId: `${pfx}-muzzle`,
        d: 'M -4.8 5.2 C -5.6 1.2, 1.0 0.2, 3.8 1.6 C 6.6 0.2, 13.2 1.2, 12.6 5.4 C 12.2 11.4, 7.6 13.8, 3.4 13.8 C -1.6 13.8, -5.4 10.6, -4.8 5.2 Z',
        baseFill: c.mochiCream,
        shadowPaths: [
          'M -6 8.2 C -2 11.2, 4 12.2, 13.2 9.4 L 13.6 15.0 L -6.0 15.0 Z',
        ],
        shadowFill: c.mochiCreamShadow,
        strokeWidth: s.xeroxFine,
      }),

      // Subtle warm Disney cheek blush ovals
      svgEl('ellipse', {
        cx: -11.4,
        cy: 3.4,
        rx: 3.3,
        ry: 1.9,
        fill: c.mochiEarPink,
        opacity: 0.42,
      }),
      svgEl('ellipse', {
        cx: 14.5,
        cy: 3.4,
        rx: 2.9,
        ry: 1.8,
        fill: c.mochiEarPink,
        opacity: 0.42,
      }),

      // Expressive classic Disney eyes
      eyesMarkup,

      // Sculpted feline nose with warm cream specular highlight
      celPath(
        'M 1.6 1.5 Q 3.8 0.6, 6.0 1.5 Q 5.2 3.7, 3.8 4.2 Q 2.4 3.7, 1.6 1.5 Z',
        c.mochiNose,
        { strokeWidth: s.xeroxFine }
      ),
      svgEl('ellipse', {
        cx: 3.2,
        cy: 1.9,
        rx: 0.95,
        ry: 0.5,
        fill: c.celCream,
        opacity: 0.72,
      }),

      // Expressive 4-phase speaking mouth or classic kitty smile
      mouthMarkup,

      // Fine tapered Xerox whiskers with 12 FPS secondary follow-through
      svgEl('path', {
        d: [
          `M -14.8 1.4 Q ${round2(-20.4 * wScale)} ${round2(0.0 + whiskerSway * 0.4)}, ${round2(-25.8 * wScale)} ${round2(-0.6 + whiskerSway)}`,
          `M -15.2 4.0 Q ${round2(-21.0 * wScale)} ${round2(4.0 + whiskerSway * 0.3)}, ${round2(-26.8 * wScale)} ${round2(4.5 + whiskerSway * 0.65)}`,
          `M -14.2 6.6 Q ${round2(-19.6 * wScale)} ${round2(7.8 - whiskerSway * 0.3)}, ${round2(-24.6 * wScale)} ${round2(9.1 - whiskerSway * 0.6)}`,
          `M 16.0 1.4 Q ${round2(21.8 * wScale)} ${round2(0.0 - whiskerSway * 0.4)}, ${round2(27.6 * wScale)} ${round2(-0.6 - whiskerSway)}`,
          `M 16.4 4.0 Q ${round2(22.4 * wScale)} ${round2(4.0 - whiskerSway * 0.3)}, ${round2(28.4 * wScale)} ${round2(4.5 - whiskerSway * 0.65)}`,
          `M 15.4 6.6 Q ${round2(21.0 * wScale)} ${round2(7.8 + whiskerSway * 0.3)}, ${round2(26.4 * wScale)} ${round2(9.1 + whiskerSway * 0.6)}`,
        ].join(' '),
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        }),
      }),
    ]
  );
}

/**
 * Renders Mochi (`'moonlit_cat'`) in Classic 1970s–1980s Hand-Drawn Cel Animation Style:
 * - Inspired by *The Aristocats*, *Robin Hood* (1973), and *Mickey's Christmas Carol* (1983)
 * - Crisp warm-charcoal Xerox ink outlines, solid opaque matte cel fills, 2-tone cel shadow planes,
 *   cool silver-blue moonlit rim highlights, and grounded contact shadows (`celContactShadow`)
 * - Smooth 12 FPS ("on twos") motion with overlapping-action secondary follow-through (ears, tail, whiskers)
 * - 4-phase expressive cel lip-sync mouths when `state === 'singing' || options.isSpeaking`
 * - Exact origin `(0, 0)` at ground contact, bounds `~x: -44..38, y: -84..4`, canonical `+X` forward facing
 */
export function renderClassicMoonlitCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const xeroxFilter = svgUrl(TOKENS.classicCel.filters.ids.xeroxInk);

  // 1. Curled-up Sleeping Kitten (`'sleeping'` / `'sleepy'`)
  if (state === 'sleeping' || state === 'sleepy') {
    const breath = round2(steppedOscillate(frameIndex, 24, 1.35));
    const earLag = round2(steppedOscillate(frameIndex, 24, 0.8, -3));
    const zFloat = round2(steppedOscillate(frameIndex, 20, 2.8));
    const zDriftX = round2(steppedOscillate(frameIndex, 28, 2.0));
    const charmGlint = Math.floor(frameIndex / 2) % 6 === 0;

    const sleepBodyD =
      'M -31 -2.5 C -33.5 -25.5, -10.5 -34.0, 11.8 -26.2 C 23.5 -21.2, 24.8 -5.5, 17.8 0.8 C 6.0 2.6, -24.0 2.6, -31 -2.5 Z';
    const sleepTailD =
      'M -29.2 -5.0 C -36.5 -1.2, -33.5 3.6, -18.0 3.6 C -4.0 3.6, 8.2 2.8, 14.2 -1.2 C 16.0 -3.2, 13.0 -6.8, 8.0 -4.8 C 2.0 -2.0, -12.0 -1.2, -24.0 -4.0 Z';
    const sleepHeadD =
      'M 0.2 -16.0 C 0.4 -26.8, 12.8 -30.6, 22.0 -24.0 C 27.6 -18.2, 26.8 -5.2, 16.2 -4.0 C 6.4 -3.0, 0.0 -8.2, 0.2 -16.0 Z';

    return svgEl(
      'g',
      {
        'data-character': 'moonlit_cat',
        'data-art-style': 'classic_cel',
        'data-state': state,
      },
      [
        // Grounded soft contact shadow
        celContactShadow(-3, 0.6, 30.5, 3.4, 0.34),
        // Xerox-inked cel animation layer
        svgEl('g', { filter: xeroxFilter }, [
          // Curled sleek sleeping body with 2-tone shadow & moonlit spine rim
          svgEl(
            'g',
            {
              'data-part': 'sleeping-body',
              transform: svgTransform({ y: round2(-breath * 0.5) }),
            },
            [
              celShadedShape({
                clipId: `${pfx}-sleep-body`,
                d: sleepBodyD,
                baseFill: c.mochiFurBase,
                shadowPaths: [
                  'M -33 -11 C -21 -4, 4 -4, 24 -9 L 25 4 L -34 4 Z',
                ],
                shadowFill: c.mochiFurShadow,
                highlightPaths: [
                  'M -26 -22 C -14 -32, 4 -32, 16 -24 C 6 -28, -11 -28, -22 -18 Z',
                ],
                highlightFill: c.mochiFurRim,
                highlightOpacity: 0.78,
                strokeWidth: s.xeroxHeavy,
              }),
              // Navy tabby dorsal stripes (`data-part="tabby-markings"`)
              svgEl('g', { 'data-part': 'tabby-markings' }, [
                svgEl('path', {
                  d: 'M -20.5 -25.8 C -15.5 -29.0, -10.0 -29.2, -10.5 -21.2 C -13.6 -19.4, -18.5 -21.0, -20.5 -25.8 Z',
                  fill: c.mochiStripe,
                }),
                svgEl('path', {
                  d: 'M -6.8 -29.4 C -1.4 -29.8, 3.2 -27.2, 1.8 -20.4 C -1.8 -19.2, -5.6 -22.2, -6.8 -29.4 Z',
                  fill: c.mochiStripe,
                }),
                svgEl('path', {
                  d: 'M -24.5 -16.5 Q -19.0 -14.8, -15.0 -17.4',
                  fill: 'none',
                  ...celStrokeAttrs({
                    stroke: c.mochiStripe,
                    strokeWidth: 2.0,
                  }),
                }),
              ]),
              // Soft cream tummy tuft peeking beneath chin
              celShadedShape({
                clipId: `${pfx}-sleep-tummy`,
                d: 'M -10 -12 C -2 -14, 6 -12, 8 -4 C 4 1, -8 1, -10 -12 Z',
                baseFill: c.mochiCream,
                shadowPaths: ['M -11 -5 L 9 -5 L 9 2 L -11 2 Z'],
                shadowFill: c.mochiCreamShadow,
                strokeWidth: s.xeroxFine,
              }),
            ]
          ),
          // Curled tail tucked snugly around front paws
          celShadedShape({
            clipId: `${pfx}-sleep-tail`,
            d: sleepTailD,
            baseFill: c.mochiFurBase,
            shadowPaths: ['M -36 -0.6 L 16 -0.6 L 16 5 L -36 5 Z'],
            shadowFill: c.mochiFurShadow,
            highlightPaths: [
              'M -28 -4.4 C -15 -1.8, -1 -2.2, 10 -4.8 L 8.6 -6.0 C -1 -3.4, -15 -3.0, -28 -5.4 Z',
            ],
            highlightFill: c.mochiFurRim,
            highlightOpacity: 0.72,
            strokeWidth: s.xeroxMedium,
          }),
          // Tabby ring + cream tail tip on tucked tail
          svgEl('path', {
            d: 'M 2.5 -4.2 L 6.0 -4.8 L 7.4 0.8 L 3.8 1.4 Z',
            fill: c.mochiStripe,
          }),
          celPath(
            'M 8.2 -4.8 C 11.4 -6.0, 15.2 -4.2, 14.2 -1.2 C 12.2 0.8, 9.6 0.8, 8.2 -4.8 Z',
            c.mochiCream,
            { strokeWidth: s.xeroxFine }
          ),
          // Crimson ribbon collar peek & gleaming crescent charm
          celPath('M -3 -11.2 Q 3 -8.2, 9.4 -11.2 L 8.8 -8.2 Q 3 -5.4, -3.4 -8.2 Z', c.mochiCollar, {
            strokeWidth: s.xeroxFine,
          }),
          renderClassicMoonCharm(pfx, 2.5, -7.5, 0.85, charmGlint, 0),
          // Peaceful resting kitten head (`data-part="head"`)
          svgEl(
            'g',
            {
              'data-part': 'head',
              transform: svgTransform({ y: round2(-breath * 0.35) }),
            },
            [
              // Resting back-left & front-right ears with dusty-rose interiors
              celShadedShape({
                clipId: `${pfx}-sleep-ear-l`,
                d: `M 3.2 -25.0 L ${round2(6.0 + earLag * 0.4)} -36.0 L 13.0 -28.0 Z`,
                baseFill: c.mochiFurBase,
                shadowPaths: ['M 2 -36 L 7 -36 L 7 -24 L 2 -24 Z'],
                shadowFill: c.mochiFurShadow,
                strokeWidth: s.xeroxMedium,
              }),
              svgEl('polygon', {
                points: `5.5,-26.5 ${round2(7.0 + earLag * 0.35)},-33.0 11.2,-28.0`,
                fill: c.mochiEarPink,
              }),
              celShadedShape({
                clipId: `${pfx}-sleep-ear-r`,
                d: `M 16.0 -27.0 L ${round2(23.0 + earLag * 0.4)} -35.0 L 24.0 -22.0 Z`,
                baseFill: c.mochiFurBase,
                shadowPaths: ['M 15 -35 L 19.5 -35 L 19.5 -21 L 15 -21 Z'],
                shadowFill: c.mochiFurShadow,
                highlightPaths: ['M 21.8 -34.2 L 24.4 -22.2 L 22.8 -22.4 L 20.8 -32.8 Z'],
                highlightFill: c.mochiFurRim,
                highlightOpacity: 0.72,
                strokeWidth: s.xeroxMedium,
              }),
              svgEl('polygon', {
                points: `17.8,-26.2 ${round2(21.6 + earLag * 0.35)},-32.0 22.3,-23.4`,
                fill: c.mochiEarPink,
              }),
              // Resting head with 2-tone cel shadow & moonlit crown rim
              celShadedShape({
                clipId: `${pfx}-sleep-head`,
                d: sleepHeadD,
                baseFill: c.mochiFurBase,
                shadowPaths: [
                  'M -1 -14 C 3 -8, 12 -6, 25 -9 L 27 -2 L -1 -2 Z',
                ],
                shadowFill: c.mochiFurShadow,
                highlightPaths: [
                  'M 4 -24.5 C 11 -28.8, 19 -27.4, 24 -21.2 C 19 -25.2, 11 -26.4, 4 -23.0 Z',
                ],
                highlightFill: c.mochiFurRim,
                highlightOpacity: 0.8,
                strokeWidth: s.xeroxHeavy,
              }),
              // Navy tabby forehead stripes on sleeping head
              svgEl('path', {
                d: 'M 11.4 -26.8 L 13.4 -26.6 L 12.6 -22.6 Z M 15.0 -27.0 L 17.2 -26.2 L 15.6 -22.4 Z',
                fill: c.mochiStripe,
              }),
              // Soft cream muzzle puff
              celShadedShape({
                clipId: `${pfx}-sleep-muzzle`,
                d: 'M 8.2 -11.0 C 9.2 -15.0, 20.0 -15.0, 21.0 -10.0 C 21.0 -6.0, 11.0 -5.0, 8.2 -11.0 Z',
                baseFill: c.mochiCream,
                shadowPaths: ['M 8 -8.2 L 22 -8.2 L 22 -4 L 8 -4 Z'],
                shadowFill: c.mochiCreamShadow,
                strokeWidth: s.xeroxFine,
              }),
              // Gentle blush ovals
              svgEl('ellipse', {
                cx: 6.8,
                cy: -11.4,
                rx: 2.6,
                ry: 1.6,
                fill: c.mochiEarPink,
                opacity: 0.45,
              }),
              svgEl('ellipse', {
                cx: 22.0,
                cy: -11.4,
                rx: 2.4,
                ry: 1.5,
                fill: c.mochiEarPink,
                opacity: 0.45,
              }),
              // Peaceful closed sleeping eyes (`data-part="eyes"`) with Disney lashes
              svgEl('g', { 'data-part': 'eyes' }, [
                svgEl('path', {
                  d: 'M 7.5 -16.4 Q 10.5 -13.4, 13.5 -16.4 M 7.5 -16.4 L 6.3 -15.6 M 16.5 -16.4 Q 19.5 -13.4, 22.5 -16.4 M 22.5 -16.4 L 23.7 -15.6',
                  fill: 'none',
                  ...celStrokeAttrs({ strokeWidth: s.xeroxFine }),
                }),
              ]),
              // Tiny pink nose & contented sleeping smile
              svgEl('ellipse', {
                cx: 15.2,
                cy: -12.4,
                rx: 1.6,
                ry: 1.25,
                fill: c.mochiNose,
                ...celStrokeAttrs({ strokeWidth: 0.85 }),
              }),
              svgEl('path', {
                d: 'M 12.6 -9.8 Q 15.2 -8.2, 17.8 -9.8',
                fill: 'none',
                ...celStrokeAttrs({ strokeWidth: 1.25 }),
              }),
              // Relaxed whiskers
              svgEl('path', {
                d: 'M 3.2 -12.4 L -3.8 -12.0 M 3.6 -10.0 L -2.8 -8.5 M 23.8 -12.4 L 30.8 -12.0 M 23.4 -10.0 L 29.8 -8.5',
                fill: 'none',
                ...celStrokeAttrs({
                  stroke: c.xeroxInkSoft,
                  strokeWidth: s.sketchLine,
                }),
              }),
            ]
          ),
          // Floating classic storybook serif 'z Z' drifting softly at 12 FPS
          svgEl(
            'text',
            {
              'data-part': 'sleep-zzz',
              x: round2(13 + zDriftX),
              y: round2(-37 + zFloat),
              'font-family': TOKENS.classicCel.typography.fontFamilySerif,
              'font-size': 13,
              'font-style': 'italic',
              'font-weight': 'bold',
              fill: c.starGlow,
              stroke: c.xeroxInk,
              'stroke-width': 2.0,
              'paint-order': 'stroke',
            },
            'z Z'
          ),
        ]),
      ]
    );
  }

  // 2. Classic Disney 3/4 Side-Profile Walking Rig Facing RIGHT (+X when flipX: false)
  if (state === 'walking') {
    // Smooth 12 FPS 8-frame feline walk cycle ("animated on twos")
    const strideAngle = steppedOscillate(frameIndex, 8, 19);
    const backStrideAngle = steppedOscillate(frameIndex, 8, 18, -1);
    const strideBob = round2(Math.abs(steppedOscillate(frameIndex, 8, 2.1)));
    const tailBaseSway = steppedOscillate(frameIndex, 12, 4.8);
    const tailTipSway = steppedOscillate(frameIndex, 12, 7.2, -2); // Overlapping follow-through!
    const headBob = steppedOscillate(frameIndex, 8, 2.4, -1);
    const earLag = steppedOscillate(frameIndex, 8, 1.4, -2);
    const charmSwing = steppedOscillate(frameIndex, 8, 8, -2);
    const blink = isSteppedBlinkFrame(frameIndex, 36, 2);
    const charmGlint = Math.floor(frameIndex / 2) % 4 === 0;
    const shadowRx = round2(28.5 - strideBob * 0.7);

    const walkTailD = [
      'M -21.5 -33.5',
      `C -33.5 -39.5, ${round2(-41.5 + tailBaseSway * 0.45)} -55.5, ${round2(-35.8 + tailTipSway * 0.6)} -67.8`,
      `C ${round2(-32.2 + tailTipSway * 0.6)} -73.0, ${round2(-24.2 + tailTipSway * 0.45)} -68.4, ${round2(-27.2 + tailTipSway * 0.35)} -60.2`,
      `C ${round2(-30.0 + tailBaseSway * 0.25)} -51.8, -25.8 -42.0, -17.8 -36.0 Z`,
    ].join(' ');

    const walkBodyD =
      'M -23.5 -28.0 C -25.5 -42.8, -10.5 -46.2, 7.8 -44.2 C 15.8 -43.0, 19.2 -34.2, 16.8 -24.2 C 13.8 -18.2, -17.8 -17.4, -23.5 -28.0 Z';

    return svgEl(
      'g',
      {
        'data-character': 'moonlit_cat',
        'data-art-style': 'classic_cel',
        'data-state': 'walking',
        'data-facing': 'right',
        'data-walk-profile': 'true',
      },
      [
        // Grounded contact shadow subtly breathing with walk stride
        celContactShadow(-2.5, 0.5, shadowRx, 3.4, 0.32),
        // Animated Xerox cel rig
        svgEl(
          'g',
          {
            transform: svgTransform({ y: round2(-strideBob) }),
            filter: xeroxFilter,
          },
          [
            // Graceful S-curved swaying tail with overlapping-action tip & moonlit rim
            celShadedShape({
              clipId: `${pfx}-walk-tail`,
              d: walkTailD,
              baseFill: c.mochiFurBase,
              shadowPaths: [
                `M -24 -32 C -34 -39, ${round2(-44 + tailBaseSway * 0.45)} -56, ${round2(-38 + tailTipSway * 0.6)} -72 L ${round2(-46 + tailTipSway * 0.6)} -72 L -46 -32 Z`,
              ],
              shadowFill: c.mochiFurShadow,
              highlightPaths: [
                `M ${round2(-26 + tailTipSway * 0.42)} -69 C ${round2(-25 + tailTipSway * 0.38)} -60, ${round2(-29 + tailBaseSway * 0.25)} -51, -17 -35 L -15 -37 C -24 -44, ${round2(-28 + tailBaseSway * 0.25)} -53, ${round2(-24 + tailTipSway * 0.42)} -68 Z`,
              ],
              highlightFill: c.mochiFurRim,
              highlightOpacity: 0.78,
              strokeWidth: s.xeroxMedium,
            }),
            // Navy tabby rings & creamy tail tip
            svgEl('path', {
              d: `M ${round2(-35.5 + tailBaseSway * 0.42)} -53.5 L ${round2(-28.6 + tailBaseSway * 0.32)} -55.0 L ${round2(-28.2 + tailBaseSway * 0.32)} -51.4 L ${round2(-34.8 + tailBaseSway * 0.42)} -49.8 Z`,
              fill: c.mochiStripe,
            }),
            celPath(
              `M ${round2(-36.4 + tailTipSway * 0.56)} -64.2 C ${round2(-33.4 + tailTipSway * 0.58)} -71.5, ${round2(-25.8 + tailTipSway * 0.44)} -70.4, ${round2(-27.2 + tailTipSway * 0.38)} -62.8 Z`,
              c.mochiCream,
              { strokeWidth: s.xeroxFine }
            ),

            // Back-far leg (shaded darker for classic cel depth separation)
            svgEl(
              'g',
              {
                'data-part': 'back-far-leg',
                transform: svgTransform({
                  rotate: -backStrideAngle,
                  pivotX: -14,
                  pivotY: -22,
                }),
              },
              [
                celPath(
                  'M -18.5 -22 C -19.2 -15, -18.4 -9, -17.6 -4 L -10.8 -4 C -10.4 -10, -10.6 -16, -11.4 -22 Z',
                  c.mochiFurShadow,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M -18.4 -5.8 L -10.4 -5.8 C -7.4 -5.8, -7.2 0, -10.4 0 L -17.6 0 C -19.6 0, -19.6 -3.8, -18.4 -5.8 Z',
                  c.mochiCreamShadow,
                  { strokeWidth: s.xeroxFine }
                ),
              ]
            ),

            // Front-far leg striding forward toward +X (shaded darker for depth)
            svgEl(
              'g',
              {
                'data-part': 'front-far-leg',
                transform: svgTransform({
                  rotate: strideAngle,
                  pivotX: 11,
                  pivotY: -22,
                }),
              },
              [
                celPath(
                  'M 7.4 -22 C 7.2 -15, 7.8 -9, 8.2 -4 L 15.0 -4 C 15.4 -10, 15.0 -16, 14.4 -22 Z',
                  c.mochiFurShadow,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M 7.4 -5.8 L 15.4 -5.8 C 18.4 -5.8, 18.6 0, 15.4 0 L 8.2 0 C 6.2 0, 6.2 -3.8, 7.4 -5.8 Z',
                  c.mochiCreamShadow,
                  { strokeWidth: s.xeroxFine }
                ),
              ]
            ),

            // Sleek horizontal 3/4 feline torso with 2-tone cel belly shadow & moonlit spine rim
            celShadedShape({
              clipId: `${pfx}-walk-body`,
              d: walkBodyD,
              baseFill: c.mochiFurBase,
              shadowPaths: [
                'M -25 -29 C -14 -24, 2 -23, 17 -28 L 19 -16 L -26 -16 Z',
              ],
              shadowFill: c.mochiFurShadow,
              highlightPaths: [
                'M -21 -38 C -12 -45, 2 -46, 14 -41 C 5 -43, -9 -43, -19 -35 Z',
              ],
              highlightFill: c.mochiFurRim,
              highlightOpacity: 0.82,
              strokeWidth: s.xeroxHeavy,
            }),

            // Cream chest & front-belly ruff
            celShadedShape({
              clipId: `${pfx}-walk-chest`,
              d: 'M -5.5 -21.0 C 2.2 -20.0, 14.2 -24.0, 16.0 -36.0 C 12.2 -38.8, 6.2 -36.0, 4.2 -29.0 C 2.0 -24.2, -1.8 -22.8, -5.5 -21.0 Z',
              baseFill: c.mochiCream,
              shadowPaths: ['M -6 -25 C 2 -24, 10 -25, 16 -29 L 17 -19 L -7 -19 Z'],
              shadowFill: c.mochiCreamShadow,
              strokeWidth: s.xeroxFine,
            }),

            // Navy tabby saddle markings on walking back (`data-part="tabby-markings"`)
            svgEl('g', { 'data-part': 'tabby-markings' }, [
              svgEl('path', {
                d: 'M -16.2 -42.0 C -11.4 -44.8, -6.2 -44.2, -6.8 -36.4 C -10.4 -34.8, -14.8 -36.6, -16.2 -42.0 Z',
                fill: c.mochiStripe,
              }),
              svgEl('path', {
                d: 'M -3.4 -44.0 C 1.4 -44.2, 5.4 -42.0, 3.8 -35.2 C 0.2 -34.4, -3.0 -37.2, -3.4 -44.0 Z',
                fill: c.mochiStripe,
              }),
            ]),

            // Back-near leg striding forward with 2-tone cel shading & cream paw with toe ticks
            svgEl(
              'g',
              {
                'data-part': 'back-near-leg',
                transform: svgTransform({
                  rotate: backStrideAngle,
                  pivotX: -19,
                  pivotY: -22,
                }),
              },
              [
                celShadedShape({
                  clipId: `${pfx}-walk-leg-bn`,
                  d: 'M -23.6 -23.0 C -24.4 -15.5, -23.2 -9.5, -22.4 -4.0 L -14.4 -4.0 C -14.2 -10.0, -14.8 -16.5, -15.2 -23.0 Z',
                  baseFill: c.mochiFurBase,
                  shadowPaths: ['M -25 -24 L -19.5 -24 L -19 -3 L -25 -3 Z'],
                  shadowFill: c.mochiFurShadow,
                  strokeWidth: s.xeroxMedium,
                }),
                celShadedShape({
                  clipId: `${pfx}-walk-paw-bn`,
                  d: 'M -23.4 -5.8 L -14.0 -5.8 C -10.8 -5.8, -10.8 0, -14.0 0 L -22.4 0 C -24.4 0, -24.4 -3.8, -23.4 -5.8 Z',
                  baseFill: c.mochiCream,
                  shadowPaths: ['M -25 -2.2 L -10 -2.2 L -10 1 L -25 1 Z'],
                  shadowFill: c.mochiCreamShadow,
                  strokeWidth: s.xeroxFine,
                }),
                svgEl('path', {
                  d: 'M -15.8 -2.2 L -15.8 0 M -13.2 -2.2 L -13.2 0',
                  fill: 'none',
                  ...celStrokeAttrs({ strokeWidth: s.sketchLine }),
                }),
              ]
            ),

            // Front-near leg striding in opposition with 2-tone cel shading & dainty cream paw
            svgEl(
              'g',
              {
                'data-part': 'front-near-leg',
                transform: svgTransform({
                  rotate: -strideAngle,
                  pivotX: 6,
                  pivotY: -22,
                }),
              },
              [
                celShadedShape({
                  clipId: `${pfx}-walk-leg-fn`,
                  d: 'M 2.4 -23.0 C 2.0 -15.5, 2.8 -9.5, 3.2 -4.0 L 10.8 -4.0 C 11.2 -10.0, 10.6 -16.5, 10.0 -23.0 Z',
                  baseFill: c.mochiFurBase,
                  shadowPaths: ['M 1 -24 L 6.2 -24 L 6.6 -3 L 1 -3 Z'],
                  shadowFill: c.mochiFurShadow,
                  highlightPaths: ['M 8.6 -23 L 11.2 -23 L 11.4 -4 L 9.4 -4 Z'],
                  highlightFill: c.mochiFurRim,
                  highlightOpacity: 0.65,
                  strokeWidth: s.xeroxMedium,
                }),
                celShadedShape({
                  clipId: `${pfx}-walk-paw-fn`,
                  d: 'M 2.4 -5.8 L 11.2 -5.8 C 14.4 -5.8, 14.4 0, 11.2 0 L 3.2 0 C 1.2 0, 1.2 -3.8, 2.4 -5.8 Z',
                  baseFill: c.mochiCream,
                  shadowPaths: ['M 1 -2.2 L 15 -2.2 L 15 1 L 1 1 Z'],
                  shadowFill: c.mochiCreamShadow,
                  strokeWidth: s.xeroxFine,
                }),
                svgEl('path', {
                  d: 'M 9.6 -2.2 L 9.6 0 M 12.2 -2.2 L 12.2 0',
                  fill: 'none',
                  ...celStrokeAttrs({ strokeWidth: s.sketchLine }),
                }),
              ]
            ),

            // Crimson 2-tone cel ribbon collar & swinging golden crescent charm
            celShadedShape({
              clipId: `${pfx}-walk-collar`,
              d: 'M 1.0 -43.0 Q 11.0 -39.0, 18.0 -42.0 L 17.0 -36.8 Q 10.0 -33.8, 0.0 -37.8 Z',
              baseFill: c.mochiCollar,
              shadowPaths: ['M -1 -39.5 Q 9 -36.5, 18 -39.5 L 18 -33 L -1 -33 Z'],
              shadowFill: c.mochiCollarShadow,
              strokeWidth: s.xeroxFine,
            }),
            renderClassicMoonCharm(pfx, 13.0, -33.5, 0.95, charmGlint, charmSwing),

            // Expressive 3/4 right-facing head with secondary ear lag
            renderClassicMochiHead({
              pfx: `${pfx}-walk`,
              cx: 12.5,
              cy: -56.5,
              headTilt: headBob,
              eyeMode: blink ? 'blink' : 'open',
              speaking: isSpeaking,
              compactWhiskers: true,
              earLag,
              frameIndex,
            }),
          ]
        ),
      ]
    );
  }

  // 3. Seated / Idle / Curious / Looking Up / Waving / Reaching / Singing / Blinking Rig
  const isCurious = state === 'curious' || state === 'looking_up';
  const isWaving = state === 'waving' || state === 'reaching';
  const isSinging = state === 'singing';
  const isBlinking = state === 'blinking';
  const speakingActive = isSinging || isSpeaking;

  // Smooth 12 FPS ("on twos") timing with overlapping-action follow-through
  const autoBlink = !isCurious && isSteppedBlinkFrame(frameIndex, 36, 2);
  const breatheBob = round2(
    speakingActive
      ? Math.abs(steppedOscillate(frameIndex, 10, 1.5))
      : steppedOscillate(frameIndex, 24, 0.85)
  );
  const tailBaseSway = isCurious
    ? steppedOscillate(frameIndex, 8, 4.2)
    : steppedOscillate(frameIndex, 18, 3.0);
  const tailTipSway = isCurious
    ? steppedOscillate(frameIndex, 8, 6.4, -2)
    : steppedOscillate(frameIndex, 18, 4.8, -3);
  const headTilt = isCurious
    ? round2(-9.5 + steppedOscillate(frameIndex, 18, 1.8))
    : speakingActive
    ? steppedOscillate(frameIndex, 12, 3.4)
    : isWaving
    ? round2(4.0 + steppedOscillate(frameIndex, 10, 2.6))
    : round2(steppedOscillate(frameIndex, 28, 1.8));
  const earLag = round2(
    isCurious
      ? steppedOscillate(frameIndex, 18, 1.0, -2)
      : steppedOscillate(frameIndex, 16, 1.2, -2)
  );

  const eyeMode: ClassicEyeMode =
    isBlinking || autoBlink
      ? 'blink'
      : isCurious
      ? 'curious'
      : isWaving
      ? 'sparkle'
      : 'open';

  const pawWaveAngle = isWaving
    ? round2(-11 + steppedOscillate(frameIndex, 8, 14))
    : 0;
  const charmSwing = isWaving
    ? steppedOscillate(frameIndex, 8, 6, -2)
    : speakingActive
    ? steppedOscillate(frameIndex, 12, 4.5, -2)
    : steppedOscillate(frameIndex, 24, 2, -2);
  const charmGlint = isWaving || speakingActive || Math.floor(frameIndex / 2) % 5 === 0;

  // Expressive feline tail silhouette with overlapping tip motion
  const tailPath =
    isCurious || isWaving
      ? `M -17.5 -9.0 C -31.5 -12.0, ${round2(-39.5 + tailBaseSway * 0.45)} -26.0, ${round2(-34.8 + tailTipSway * 0.6)} -40.2 C ${round2(-31.8 + tailTipSway * 0.6)} -45.2, ${round2(-23.8 + tailTipSway * 0.42)} -42.0, ${round2(-26.8 + tailTipSway * 0.35)} -34.0 C ${round2(-29.8 + tailBaseSway * 0.25)} -24.0, -23.8 -17.0, -14.8 -14.0 Z`
      : `M -17.0 -6.0 C -32.8 -6.0, ${round2(-40.5 + tailBaseSway * 0.4)} -16.0, ${round2(-36.8 + tailTipSway * 0.55)} -27.2 C ${round2(-34.8 + tailTipSway * 0.55)} -33.0, ${round2(-25.8 + tailTipSway * 0.4)} -30.0, ${round2(-27.8 + tailTipSway * 0.35)} -22.0 C ${round2(-29.8 + tailBaseSway * 0.2)} -15.0, -23.8 -12.0, -14.0 -11.0 Z`;

  const tailTipPath =
    isCurious || isWaving
      ? `M ${round2(-35.6 + tailTipSway * 0.56)} -37.0 C ${round2(-33.6 + tailTipSway * 0.58)} -44.2, ${round2(-25.6 + tailTipSway * 0.42)} -43.2, ${round2(-26.8 + tailTipSway * 0.38)} -35.8 Z`
      : `M ${round2(-37.6 + tailTipSway * 0.52)} -24.2 C ${round2(-35.6 + tailTipSway * 0.54)} -32.0, ${round2(-26.8 + tailTipSway * 0.4)} -31.0, ${round2(-27.8 + tailTipSway * 0.35)} -23.8 Z`;

  const tailStripePath =
    isCurious || isWaving
      ? `M ${round2(-35.4 + tailBaseSway * 0.4)} -27.2 L ${round2(-28.4 + tailBaseSway * 0.28)} -28.6 L ${round2(-27.6 + tailBaseSway * 0.28)} -25.0 L ${round2(-34.2 + tailBaseSway * 0.4)} -23.6 Z`
      : `M ${round2(-36.2 + tailBaseSway * 0.35)} -17.4 L ${round2(-29.2 + tailBaseSway * 0.24)} -18.8 L ${round2(-28.4 + tailBaseSway * 0.24)} -15.4 L ${round2(-34.6 + tailBaseSway * 0.35)} -14.0 Z`;

  // Sleek seated Aristocats feline body (tapered neck & graceful curved back)
  const seatedBodyD =
    'M -19.0 -1.8 C -23.4 -18.5, -17.0 -35.8, -8.5 -43.8 L 10.2 -43.8 C 16.8 -36.2, 19.2 -15.0, 15.2 -1.2 C 10.2 1.6, -14.0 1.6, -19.0 -1.8 Z';

  return svgEl(
    'g',
    {
      'data-character': 'moonlit_cat',
      'data-art-style': 'classic_cel',
      'data-state': state,
    },
    [
      // Grounded soft contact shadow
      celContactShadow(-1.5, 0.5, 25.5, 3.4, 0.34),
      // Xerox-inked cel animation layer
      svgEl(
        'g',
        {
          transform: svgTransform({ y: round2(-breatheBob) }),
          filter: xeroxFilter,
        },
        [
          // Expressive curled tail on -X with 2-tone cel shading, moonlit rim & overlapping tip
          celShadedShape({
            clipId: `${pfx}-tail`,
            d: tailPath,
            baseFill: c.mochiFurBase,
            shadowPaths: [
              `M -44 -48 L -32 -48 C -34 -32, -32 -18, -14 -12 L -14 -4 L -44 -4 Z`,
            ],
            shadowFill: c.mochiFurShadow,
            highlightPaths: [
              isCurious || isWaving
                ? `M ${round2(-26 + tailTipSway * 0.4)} -43 C ${round2(-26 + tailTipSway * 0.35)} -34, ${round2(-28 + tailBaseSway * 0.25)} -23, -15 -14 L -14 -16 C -24 -22, ${round2(-26 + tailBaseSway * 0.25)} -33, ${round2(-24 + tailTipSway * 0.4)} -43 Z`
                : `M ${round2(-27 + tailTipSway * 0.4)} -31 C ${round2(-27 + tailTipSway * 0.35)} -23, ${round2(-28 + tailBaseSway * 0.2)} -16, -14 -11 L -13 -13 C -23 -15, ${round2(-25 + tailBaseSway * 0.2)} -22, ${round2(-25 + tailTipSway * 0.4)} -31 Z`,
            ],
            highlightFill: c.mochiFurRim,
            highlightOpacity: 0.78,
            strokeWidth: s.xeroxMedium,
          }),
          // Navy tabby tail band & cream tail tip
          svgEl('path', { d: tailStripePath, fill: c.mochiStripe }),
          celPath(tailTipPath, c.mochiCream, { strokeWidth: s.xeroxFine }),

          // Seated 3/4 feline body with 2-tone cel shadow plane & silver-blue moonlit rim
          celShadedShape({
            clipId: `${pfx}-body`,
            d: seatedBodyD,
            baseFill: c.mochiFurBase,
            shadowPaths: [
              // Deep cel shadow curving along left haunch & underside
              'M -24 -44 L -11 -44 C -13 -28, -9 -10, 16 -4 L 18 3 L -24 3 Z',
            ],
            shadowFill: c.mochiFurShadow,
            highlightPaths: [
              // Cool silver-blue moonlight rim catching right shoulder & upper back curve
              'M 8 -43 C 14.5 -36, 17.5 -18, 14.8 -2.5 L 12.2 -3.5 C 14.5 -18, 12.2 -34, 6 -42 Z',
            ],
            highlightFill: c.mochiFurRim,
            highlightOpacity: 0.78,
            strokeWidth: s.xeroxHeavy,
          }),

          // Navy tabby flank markings (`data-part="tabby-markings"`)
          svgEl('g', { 'data-part': 'tabby-markings' }, [
            svgEl('path', {
              d: 'M -19.2 -19.4 C -13.6 -22.2, -8.8 -18.2, -11.4 -12.6 C -15.2 -11.6, -19.6 -13.6, -19.2 -19.4 Z',
              fill: c.mochiStripe,
            }),
            svgEl('path', {
              d: 'M -18.2 -27.2 Q -13.2 -28.2, -10.2 -25.2 M -19.0 -9.2 Q -14.2 -10.2, -11.2 -7.4',
              fill: 'none',
              ...celStrokeAttrs({
                stroke: c.mochiStripe,
                strokeWidth: 2.0,
              }),
            }),
          ]),

          // Plush cream chest ruff with scalloped fur tuft & cel underside shadow
          celShadedShape({
            clipId: `${pfx}-chest`,
            d: 'M -5.2 -41.0 C 1.2 -43.0, 9.2 -42.0, 12.2 -35.8 C 14.0 -26.5, 11.2 -15.2, 5.4 -12.2 L 3.8 -14.2 L 1.8 -11.8 C -3.8 -13.0, -7.8 -22.6, -5.2 -41.0 Z',
            baseFill: c.mochiCream,
            shadowPaths: [
              'M -8 -42 L -2.5 -42 C -3.5 -28, 0 -17, 13 -15 L 13 -10 L -9 -10 Z',
            ],
            shadowFill: c.mochiCreamShadow,
            strokeWidth: s.xeroxFine,
          }),

          // Left front leg & dainty cream mitten paw grounded at y = 0
          celShadedShape({
            clipId: `${pfx}-leg-l`,
            d: 'M -6.2 -22.5 C -6.8 -15.5, -6.4 -9.5, -6.0 -4.0 C -6.0 0.8, 2.0 0.8, 2.0 -4.0 C 2.2 -9.5, 2.2 -15.5, 1.8 -22.5 Z',
            baseFill: c.mochiFurBase,
            shadowPaths: ['M -7.5 -23 L -2.6 -23 L -2.2 1 L -7.5 1 Z'],
            shadowFill: c.mochiFurShadow,
            strokeWidth: s.xeroxMedium,
          }),
          celShadedShape({
            clipId: `${pfx}-paw-l`,
            d: 'M -7.0 -5.8 C -7.0 0.8, 4.0 0.8, 3.0 -5.8 Z',
            baseFill: c.mochiCream,
            shadowPaths: ['M -8 -2.2 L 4 -2.2 L 4 1.5 L -8 1.5 Z'],
            shadowFill: c.mochiCreamShadow,
            strokeWidth: s.xeroxFine,
          }),
          svgEl('path', {
            d: 'M -3.2 -2.4 L -3.2 0 M 0.2 -2.4 L 0.2 0',
            fill: 'none',
            ...celStrokeAttrs({ strokeWidth: s.sketchLine }),
          }),

          // Right front paw: raised & batting toward ~(29.5, -56.5) when waving/reaching, or grounded at y = 0
          isWaving
            ? svgEl(
                'g',
                {
                  'data-part': 'waving-paw',
                  transform: svgTransform({
                    rotate: pawWaveAngle,
                    pivotX: 11,
                    pivotY: -34,
                  }),
                },
                [
                  // Graceful raised foreleg reaching toward (+X, -Y)
                  celShadedShape({
                    clipId: `${pfx}-wave-leg`,
                    d: 'M 9.0 -36.0 C 17.0 -41.0, 23.0 -49.0, 27.0 -58.0 L 32.0 -53.0 C 28.0 -43.0, 21.0 -34.0, 12.0 -29.0 Z',
                    baseFill: c.mochiFurBase,
                    shadowPaths: [
                      'M 10 -31 C 19 -36, 26 -45, 31 -55 L 34 -52 L 13 -27 Z',
                    ],
                    shadowFill: c.mochiFurShadow,
                    highlightPaths: [
                      'M 9 -36 C 17 -41, 23 -49, 27 -58 L 28.8 -56.6 C 24.6 -47.8, 18.6 -40.0, 10.6 -34.8 Z',
                    ],
                    highlightFill: c.mochiFurRim,
                    highlightOpacity: 0.78,
                    strokeWidth: s.xeroxMedium,
                  }),
                  // Dainty cream batting paw mitten with pink paw pad & toe ticks
                  celShadedShape({
                    clipId: `${pfx}-wave-paw`,
                    d: 'M 24.5 -56.5 C 24.5 -60.2, 27.2 -61.2, 30.0 -61.0 C 33.4 -60.8, 34.8 -58.2, 34.5 -55.8 C 34.1 -53.0, 31.4 -51.8, 28.6 -52.2 C 25.8 -52.6, 24.5 -54.2, 24.5 -56.5 Z',
                    baseFill: c.mochiCream,
                    shadowPaths: ['M 24 -54.6 L 35 -54.6 L 35 -51 L 24 -51 Z'],
                    shadowFill: c.mochiCreamShadow,
                    strokeWidth: s.xeroxFine,
                  }),
                  svgEl('circle', {
                    cx: 29.5,
                    cy: -56.2,
                    r: 1.75,
                    fill: c.mochiEarPink,
                  }),
                  svgEl('circle', { cx: 27.6, cy: -58.5, r: 0.75, fill: c.mochiEarPink }),
                  svgEl('circle', { cx: 29.7, cy: -59.0, r: 0.75, fill: c.mochiEarPink }),
                  svgEl('circle', { cx: 31.7, cy: -58.2, r: 0.75, fill: c.mochiEarPink }),
                  // Sparkling golden-cream chime-tap motion glints near raised paw
                  svgEl('path', {
                    d: 'M 33.8 -63.8 L 36.2 -67.8 M 36.0 -58.0 L 39.2 -60.0 M 26.2 -63.8 L 25.0 -67.6',
                    fill: 'none',
                    ...celStrokeAttrs({
                      stroke: c.starGlow,
                      strokeWidth: 1.65,
                    }),
                  }),
                ]
              )
            : svgEl('g', { 'data-part': 'front-right-paw' }, [
                celShadedShape({
                  clipId: `${pfx}-leg-r`,
                  d: 'M 4.8 -22.5 C 4.6 -15.5, 4.8 -9.5, 5.0 -4.0 C 5.0 0.8, 13.0 0.8, 13.0 -4.0 C 13.2 -9.5, 13.4 -15.5, 12.8 -22.5 Z',
                  baseFill: c.mochiFurBase,
                  shadowPaths: ['M 4 -23 L 8.2 -23 L 8.4 1 L 4 1 Z'],
                  shadowFill: c.mochiFurShadow,
                  highlightPaths: ['M 10.6 -22.5 L 13.4 -22.5 L 13.4 -4 L 11.4 -4 Z'],
                  highlightFill: c.mochiFurRim,
                  highlightOpacity: 0.65,
                  strokeWidth: s.xeroxMedium,
                }),
                celShadedShape({
                  clipId: `${pfx}-paw-r`,
                  d: 'M 4.0 -5.8 C 4.0 0.8, 16.0 0.8, 15.0 -5.8 Z',
                  baseFill: c.mochiCream,
                  shadowPaths: ['M 3.5 -2.2 L 16 -2.2 L 16 1.5 L 3.5 1.5 Z'],
                  shadowFill: c.mochiCreamShadow,
                  strokeWidth: s.xeroxFine,
                }),
                svgEl('path', {
                  d: 'M 8.2 -2.4 L 8.2 0 M 11.6 -2.4 L 11.6 0',
                  fill: 'none',
                  ...celStrokeAttrs({ strokeWidth: s.sketchLine }),
                }),
              ]),

          // Crimson 2-tone cel ribbon collar with perky side ribbon knot
          celShadedShape({
            clipId: `${pfx}-collar`,
            d: 'M -10.2 -44.0 Q 2.8 -39.0, 14.0 -44.0 L 13.2 -38.8 Q 2.8 -33.8, -11.0 -38.8 Z',
            baseFill: c.mochiCollar,
            shadowPaths: ['M -12 -40.5 Q 2 -36.2, 15 -40.5 L 15 -33 L -12 -33 Z'],
            shadowFill: c.mochiCollarShadow,
            strokeWidth: s.xeroxFine,
          }),
          // Tiny classic Disney ribbon bow tuck on left neck edge
          celPath(
            'M -10.6 -41.4 C -15.2 -44.4, -16.8 -39.8, -11.2 -39.4 C -15.4 -37.2, -14.2 -33.8, -9.8 -38.0 Z',
            c.mochiCollar,
            { strokeWidth: s.xeroxFine }
          ),

          // Gleaming 2-tone golden crescent-moon charm hanging at chest
          renderClassicMoonCharm(pfx, 6.5, -34.5, 1.0, charmGlint, charmSwing),

          // Expressive 3/4 right-facing classic Disney kitten head
          renderClassicMochiHead({
            pfx: `${pfx}-sit`,
            cx: 3,
            cy: -57,
            headTilt,
            eyeMode,
            speaking: speakingActive,
            curiousMouth: isCurious,
            earPerk: isCurious ? 1.8 : 0,
            earLag,
            frameIndex,
          }),
        ]
      ),
    ]
  );
}

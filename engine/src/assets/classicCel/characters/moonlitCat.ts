import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
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
 * Renders Mochi's flat matte antique-gold crescent-moon collar charm (`data-part="moon-charm"`)
 * with raw Xerox graphite outline and crisp painted highlight fleck (zero digital gradients).
 */
function renderClassicMoonCharm(
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
        r: 1.4,
        fill: c.mochiGold,
        ...celStrokeAttrs({ strokeWidth: 1.05, useXeroxFilter: true }),
      }),
      // Flat matte antique-gold crescent charm with raw Xerox outline
      celPath(crescentD, c.mochiGold, { strokeWidth: s.xeroxFine }),
      // Crisp flat cel specular crescent accent (hand-painted cel paint, no gradient)
      svgEl('path', {
        d: 'M -2.5 -2.6 C -1.4 -3.6, 0.3 -4.0, 1.8 -3.9 C 0.1 -2.8, -1.0 -1.4, -1.6 0.4 C -2.6 -0.2, -3.1 -1.5, -2.5 -2.6 Z',
        fill: c.mochiGoldHighlight,
        stroke: 'none',
      }),
      // Hand-inked crisp parchment sparkle tick on glint beat
      glint
        ? xeroxSketchStroke(
            'M -2.2 -3.6 L -2.2 0.2 M -4.0 -1.7 L -0.4 -1.7',
            {
              stroke: c.starGlow,
              strokeWidth: 0.95,
              opacity: 0.92,
            }
          )
        : '',
    ]
  );
}

/**
 * Renders Mochi's 1970s–80s Disney hand-drawn feline head (*The Aristocats* / *Robin Hood* aesthetic):
 * - 100% FLAT OPAQUE PHYSICAL CEL PAINT (zero digital gradients or glossy rim-light bands)
 * - Graceful tapering 3/4 feline muzzle projecting toward `+X` with shaggy tufted cheeks & chin ruff
 * - Expressive sloped ears with dusty-rose inner paint & raw Xerox graphite ear-tuft hair strokes
 * - Warm expressive almond Disney eyes with upper eyelids, sketchy lashes, floating brows & dark pupils
 * - Organic 12 FPS frame-by-frame pencil wobble on fur tufts, ears & whiskers
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

  // Organic 12 FPS hand-drawn pencil wobble ("on twos" drawing boil)
  const drawStep = Math.floor(frameIndex / 2);
  const earWobbleL = round2(deterministicJitter(drawStep, 11, 0.65));
  const earWobbleR = round2(deterministicJitter(drawStep, 17, 0.65));
  const tuftWobble = round2(deterministicJitter(drawStep, 23, 0.55));
  const whiskerJitter = round2(deterministicJitter(drawStep, 31, 0.6));

  const earTipY = round2(-25.2 - earPerk);
  const earTipDx = round2(earLag * 0.65);
  const whiskerSway = speaking
    ? round2(steppedOscillate(frameIndex, 6, 1.35, -1) + whiskerJitter)
    : round2(steppedOscillate(frameIndex, 18, 0.55, -2) + whiskerJitter * 0.6);
  const wScale = compactWhiskers ? 0.78 : 1;

  // Expressive 1970s Disney almond eyes (`data-part="eyes"`) — flat cel paint + raw Xerox lashes/brows
  let eyesMarkup: string;
  if (eyeMode === 'blink' || eyeMode === 'happy') {
    const isHappy = eyeMode === 'happy';
    const arcY = isHappy ? -6.2 : -4.6;
    const baseY = isHappy ? -1.4 : -2.1;
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Closed curved upper-lid lash arcs with feathery outer kitten flicks
      svgEl('path', {
        d: `M -8.6 ${baseY} Q -4.2 ${arcY}, 0.2 ${baseY}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: `M 5.6 ${baseY} Q 9.5 ${arcY}, 13.4 ${baseY}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      // Feathery outer lash ticks & delicate eyelid crease lines
      xeroxSketchStroke(
        `M -8.6 ${baseY} L -10.8 ${round2(baseY - 1.4)} M -7.6 ${round2(baseY - 1.2)} L -9.6 ${round2(baseY - 2.6)} M 13.4 ${baseY} L 15.6 ${round2(baseY - 1.4)} M 12.4 ${round2(baseY - 1.2)} L 14.2 ${round2(baseY - 2.6)}`,
        { strokeWidth: s.xeroxFine, opacity: 0.9 }
      ),
      xeroxSketchStroke(
        `M -7.0 ${round2(arcY - 1.4)} Q -4.2 ${round2(arcY - 2.6)}, -1.4 ${round2(arcY - 1.4)} M 7.0 ${round2(arcY - 1.4)} Q 9.5 ${round2(arcY - 2.6)}, 12.0 ${round2(arcY - 1.4)}`,
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),
    ]);
  } else {
    const isCurious = eyeMode === 'curious';
    const isSparkle = eyeMode === 'sparkle';

    // Almond Disney eye apertures angled subtly for warm feline appeal
    const eyeLeftD = isCurious
      ? 'M -9.2 -2.0 C -9.2 -7.6, -4.4 -9.0, -0.6 -6.2 C 0.8 -4.4, 0.4 1.6, -3.6 2.6 C -7.6 3.0, -9.2 0.8, -9.2 -2.0 Z'
      : 'M -9.0 -1.8 C -8.8 -6.8, -4.4 -8.2, -0.6 -5.8 C 0.6 -4.0, 0.2 1.4, -3.6 2.2 C -7.4 2.6, -9.0 0.6, -9.0 -1.8 Z';
    const eyeRightD = isCurious
      ? 'M 5.4 -5.8 C 8.8 -8.8, 13.4 -7.4, 13.6 -1.8 C 13.6 0.8, 12.0 3.0, 8.4 2.6 C 5.0 1.8, 4.4 -3.6, 5.4 -5.8 Z'
      : 'M 5.4 -5.4 C 8.8 -8.0, 13.2 -6.6, 13.4 -1.6 C 13.4 0.6, 11.8 2.6, 8.4 2.2 C 5.2 1.4, 4.6 -3.4, 5.4 -5.4 Z';

    const pupilDx = isCurious ? 1.05 : isSparkle ? 0.9 : 0.6;
    const pupilDy = isCurious ? -1.15 : isSparkle ? -0.45 : 0.15;
    const eyeClipL = `${pfx}-eye-l`;
    const eyeClipR = `${pfx}-eye-r`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('clipPath', { id: eyeClipL }, svgEl('path', { d: eyeLeftD })),
      svgEl('clipPath', { id: eyeClipR }, svgEl('path', { d: eyeRightD })),

      // --- Left (back-side) flat cel almond eye ---
      svgEl('path', { d: eyeLeftD, fill: c.celCream, stroke: 'none' }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipL) }, [
        // Subtle flat warm-amber iris ring (matte analog cel paint)
        svgEl('ellipse', {
          cx: round2(-4.4 + pupilDx),
          cy: round2(-2.1 + pupilDy),
          rx: 2.75,
          ry: 3.45,
          fill: c.mochiEyeIris,
        }),
        // Classic large Disney charcoal pupil
        svgEl('ellipse', {
          cx: round2(-4.4 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 1.95,
          ry: 2.65,
          fill: c.xeroxInk,
        }),
        // Tiny crisp parchment catchlight fleck
        svgEl('circle', {
          cx: round2(-5.4 + pupilDx),
          cy: round2(-3.9 + pupilDy),
          r: isSparkle ? 1.15 : 0.95,
          fill: c.celCream,
        }),
        // Subtle flat upper-lid hood when relaxed
        !isCurious
          ? svgEl('path', {
              d: 'M -10 -9.5 L 2 -9.5 L 2 -5.8 Q -4.4 -4.5, -10 -5.8 Z',
              fill: c.mochiFurBase,
              ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
            })
          : '',
      ]),
      // Raw Xerox eye outline + bold Disney upper lash curve + feathery lashes
      svgEl('path', {
        d: eyeLeftD,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: isCurious
          ? 'M -10.2 -3.6 C -9.2 -8.2, -4.4 -9.6, -0.4 -6.4'
          : 'M -10.0 -3.4 C -8.8 -7.4, -4.4 -8.6, -0.4 -5.8',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        'M -9.2 -4.8 L -11.4 -6.2 M -8.0 -6.4 L -9.8 -8.2',
        { strokeWidth: s.xeroxFine, opacity: 0.92 }
      ),

      // --- Right (front-side) flat cel almond eye ---
      svgEl('path', { d: eyeRightD, fill: c.celCream, stroke: 'none' }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipR) }, [
        svgEl('ellipse', {
          cx: round2(9.4 + pupilDx),
          cy: round2(-2.1 + pupilDy),
          rx: 2.55,
          ry: 3.45,
          fill: c.mochiEyeIris,
        }),
        svgEl('ellipse', {
          cx: round2(9.4 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 1.85,
          ry: 2.65,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(8.5 + pupilDx),
          cy: round2(-3.9 + pupilDy),
          r: isSparkle ? 1.15 : 0.95,
          fill: c.celCream,
        }),
        !isCurious
          ? svgEl('path', {
              d: 'M 4 -9.5 L 15 -9.5 L 15 -5.8 Q 9.4 -4.5, 4 -5.8 Z',
              fill: c.mochiFurBase,
              ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
            })
          : '',
      ]),
      svgEl('path', {
        d: eyeRightD,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: isCurious
          ? 'M 5.2 -6.2 C 8.8 -9.4, 13.4 -7.8, 14.4 -3.2'
          : 'M 5.2 -5.6 C 8.8 -8.4, 13.2 -7.0, 14.2 -3.0',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        'M 13.6 -4.6 L 15.8 -6.0 M 12.6 -6.2 L 14.4 -8.0',
        { strokeWidth: s.xeroxFine, opacity: 0.92 }
      ),

      // Expressive hand-sketched floating Disney graphite eyebrows
      xeroxSketchStroke(
        isCurious
          ? 'M -8.4 -10.4 Q -4.6 -12.8, -1.2 -10.6 M 6.4 -10.6 Q 9.4 -12.8, 12.6 -10.0'
          : isSparkle || speaking
          ? 'M -8.0 -9.6 Q -4.6 -11.4, -1.4 -9.8 M 6.6 -9.8 Q 9.4 -11.4, 12.4 -9.4'
          : 'M -7.8 -9.2 Q -4.6 -10.4, -1.6 -9.4 M 6.8 -9.4 Q 9.4 -10.4, 12.2 -9.0',
        { strokeWidth: 1.35, feather: true, opacity: 0.92 }
      ),
    ]);
  }

  // Mouth: 4-phase 12 FPS cel lip-sync when singing/speaking, or classic Disney feline muzzle smile
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed cheerful hand-inked kitty smile
      phaseShape = [
        svgEl('path', {
          d: 'M -0.4 6.3 Q 2.2 8.9, 4.4 5.9 Q 6.8 8.9, 9.2 6.3',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.55, useXeroxFilter: true }),
        }),
        xeroxSketchStroke('M 2.8 9.6 Q 4.4 10.6, 6.0 9.6', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
      ].join('');
    } else if (mouthPhase === 1) {
      // Phase 1: Soft rounded 'o' meow / vowel mouth
      phaseShape = [
        svgEl('ellipse', {
          cx: 4.5,
          cy: 8.0,
          rx: 2.55,
          ry: 2.95,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.45, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: 'M 2.8 9.4 Q 4.5 8.0, 6.2 9.4 C 5.6 10.6, 3.4 10.6, 2.8 9.4 Z',
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Open animated singing jaw with pink tongue & dark inner mouth
      phaseShape = [
        celPath(
          'M -1.0 5.6 Q 1.8 7.0, 4.4 5.5 Q 7.0 7.0, 9.8 5.6 C 9.4 12.2, -0.6 12.2, -1.0 5.6 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.45 }
        ),
        celPath(
          'M 1.2 9.8 Q 4.5 7.6, 7.8 9.8 C 6.6 11.6, 2.4 11.6, 1.2 9.8 Z',
          c.mochiTongue,
          { strokeWidth: 1.0 }
        ),
      ].join('');
    } else {
      // Phase 3: Half-open cheerful Disney grin
      phaseShape = [
        celPath(
          'M -0.4 5.9 Q 2.0 7.3, 4.4 5.8 Q 6.8 7.3, 9.2 5.9 C 8.4 10.0, 0.4 10.0, -0.4 5.9 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.45 }
        ),
        svgEl('path', {
          d: 'M 1.8 8.6 Q 4.4 7.4, 7.0 8.6 C 6.0 9.6, 2.8 9.6, 1.8 8.6 Z',
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
          d: 'M 4.4 3.9 L 4.4 5.5',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
        }),
        phaseShape,
      ]
    );
  } else if (curiousMouth) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 4.4 3.9 L 4.4 5.5',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: 4.5,
        cy: 7.3,
        rx: 1.85,
        ry: 2.0,
        fill: c.mochiMouthInner,
        ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: 4.5,
        cy: 8.2,
        rx: 1.15,
        ry: 0.72,
        fill: c.mochiTongue,
      }),
    ]);
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 4.4 3.9 L 4.4 6.0 M -0.4 6.4 Q 2.0 9.1, 4.4 6.1 Q 6.8 9.1, 9.2 6.4',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 3.0 9.7 Q 4.4 10.6, 5.8 9.7', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }),
    ]);
  }

  // Authentic 1970s *Aristocats* / *Robin Hood* tapering 3/4 feline head silhouette
  // (sloped forehead, projecting muzzle ridge on +X, shaggy 3-point cheek fur tufts, soft chin ruff)
  const headOutlineD = [
    'M -16.8 -5.4',
    'C -17.6 -13.4, -8.8 -17.4, 1.4 -16.8',
    'C 10.6 -16.2, 16.4 -12.6, 17.6 -6.2',
    'C 19.8 -4.4, 21.6 -1.6, 20.6 1.6',
    `L ${round2(22.4 + tuftWobble * 0.4)} 3.6 L 18.8 5.4`,
    `L ${round2(20.0 + tuftWobble * 0.35)} 8.0 L 15.8 9.4`,
    'C 13.2 13.2, 8.6 14.8, 2.2 14.8',
    'C -4.8 14.8, -11.4 12.8, -15.4 8.2',
    `L ${round2(-20.4 - tuftWobble * 0.45)} 6.8 L -17.8 3.6`,
    `L ${round2(-22.2 - tuftWobble * 0.5)} 1.4 L -18.2 -1.0`,
    `L ${round2(-20.4 - tuftWobble * 0.35)} -3.4 Z`,
  ].join(' ');

  // Expressive sloped feline ears with organic 12 FPS wobble & lag
  const earLeftD = [
    'M -16.2 -7.4',
    `C -18.8 -14.2, ${round2(-21.2 + earTipDx + earWobbleL)} ${round2(earTipY + 4.4)}, ${round2(-19.2 + earTipDx + earWobbleL)} ${round2(earTipY + 0.6)}`,
    `C ${round2(-14.6 + earTipDx * 0.6)} ${round2(earTipY + 2.4)}, -9.6 -11.6, -4.4 -14.8 Z`,
  ].join(' ');
  const earRightD = [
    'M 5.6 -14.6',
    `C 9.6 -19.2, ${round2(14.2 + earTipDx * 0.7 + earWobbleR)} ${round2(earTipY + 1.4)}, ${round2(17.4 + earTipDx + earWobbleR)} ${earTipY}`,
    `C ${round2(19.0 + earTipDx * 0.6)} ${round2(earTipY + 5.8)}, 18.4 -12.4, 16.8 -6.4 Z`,
  ].join(' ');

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
      // Back-left sloped ear (flat matte cel paint + dusty-rose interior + raw Xerox ear hair)
      celPath(earLeftD, c.mochiFurBase, { strokeWidth: s.xeroxMedium }),
      svgEl('path', {
        d: `M -14.2 -9.0 C -16.0 -14.0, ${round2(-17.4 + earTipDx * 0.85 + earWobbleL * 0.6)} ${round2(earTipY + 5.8)}, ${round2(-16.2 + earTipDx * 0.85 + earWobbleL * 0.6)} ${round2(earTipY + 4.2)} C ${round2(-13.0 + earTipDx * 0.5)} ${round2(earTipY + 6.0)}, -9.6 -11.4, -6.8 -13.4 Z`,
        fill: c.mochiEarPink,
      }),
      xeroxSketchStroke(
        'M -14.4 -9.4 Q -11.4 -12.0, -7.8 -13.4 M -13.2 -10.8 L -11.2 -14.2 M -15.0 -10.4 L -13.4 -13.2 M -11.0 -12.0 L -9.6 -14.4',
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine, feather: true, opacity: 0.86 }
      ),

      // Front-right sloped ear (flat matte cel paint + dusty-rose interior + raw Xerox ear hair)
      celPath(earRightD, c.mochiFurBase, { strokeWidth: s.xeroxMedium }),
      svgEl('path', {
        d: `M 7.8 -13.2 C 10.8 -17.0, ${round2(13.8 + earTipDx * 0.7 + earWobbleR * 0.6)} ${round2(earTipY + 5.0)}, ${round2(15.2 + earTipDx * 0.85 + earWobbleR * 0.6)} ${round2(earTipY + 4.4)} C ${round2(16.2 + earTipDx * 0.6)} ${round2(earTipY + 8.2)}, 15.8 -11.2, 14.8 -8.2 Z`,
        fill: c.mochiEarPink,
      }),
      xeroxSketchStroke(
        'M 8.4 -12.6 Q 11.8 -11.2, 14.6 -8.6 M 9.8 -11.6 L 11.4 -14.6 M 12.0 -10.4 L 13.6 -13.2 M 13.6 -9.4 L 15.0 -11.6',
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine, feather: true, opacity: 0.86 }
      ),

      // Flat opaque matte cel head silhouette with raw Xerox graphite outline
      celPath(headOutlineD, c.mochiFurBase, { strokeWidth: s.xeroxHeavy }),

      // Organic hand-painted navy tabby forehead 'M' crest & cheek stripes (`data-part="tabby-markings"`)
      svgEl('g', { 'data-part': 'tabby-markings' }, [
        svgEl('path', {
          d: 'M -0.2 -16.4 C 1.0 -16.6, 2.6 -16.6, 3.4 -16.3 C 2.9 -13.0, 2.3 -10.4, 1.5 -9.4 C 0.7 -10.4, 0.2 -13.0, -0.2 -16.4 Z',
          fill: c.mochiStripe,
        }),
        svgEl('path', {
          d: 'M -5.2 -15.7 C -4.0 -16.0, -2.8 -16.2, -2.0 -16.1 C -1.8 -13.4, -1.4 -11.2, -2.0 -10.2 C -3.2 -11.2, -4.4 -13.2, -5.2 -15.7 Z',
          fill: c.mochiStripe,
        }),
        svgEl('path', {
          d: 'M 4.8 -16.1 C 5.8 -15.9, 7.0 -15.5, 8.0 -15.0 C 7.0 -12.8, 6.0 -11.0, 4.8 -10.1 C 4.4 -11.2, 4.6 -13.4, 4.8 -16.1 Z',
          fill: c.mochiStripe,
        }),
        // Tapered cheek tuft stripes + raw pencil hatch accents
        svgEl('path', {
          d: 'M -18.8 -0.4 L -12.8 0.2 L -13.8 1.6 L -19.6 1.4 Z M -18.4 3.4 L -13.0 3.0 L -13.8 4.4 L -18.6 5.0 Z',
          fill: c.mochiStripe,
          opacity: 0.92,
        }),
        svgEl('path', {
          d: 'M 19.6 0.4 L 14.8 0.6 L 15.6 1.8 L 19.8 1.8 Z M 18.8 3.6 L 14.6 3.2 L 15.2 4.6 L 18.4 5.2 Z',
          fill: c.mochiStripe,
          opacity: 0.92,
        }),
      ]),

      // Soft flat matte cream muzzle & tufted chin ruff projecting toward +X
      celPath(
        'M -4.2 5.2 C -4.8 1.0, 1.4 0.2, 4.4 1.4 C 7.4 0.2, 14.8 0.8, 15.0 4.6 C 15.2 8.2, 12.6 11.4, 9.0 13.0 L 6.6 13.8 L 5.0 12.8 L 3.4 14.0 C -1.4 13.8, -4.8 10.6, -4.2 5.2 Z',
        c.mochiCream,
        { strokeWidth: s.xeroxFine }
      ),

      // Raw Xerox graphite internal fur-tuft & cheek construction lines (like Robin Hood's pencil work!)
      xeroxSketchStroke(
        'M -17.6 2.2 L -14.4 2.4 M -16.8 5.6 L -13.8 5.0 M -11.8 10.4 Q -7.2 12.2, -3.2 12.4 M 15.6 6.8 L 13.2 6.4 M 1.4 -14.8 L 1.5 -11.4',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),

      // Subtle flat dusty-rose cheek blush ovals (analog cel paint, soft opacity)
      svgEl('ellipse', {
        cx: -10.8,
        cy: 3.8,
        rx: 3.0,
        ry: 1.7,
        fill: c.dustyRose,
        opacity: 0.36,
      }),
      svgEl('ellipse', {
        cx: 13.8,
        cy: 3.8,
        rx: 2.6,
        ry: 1.6,
        fill: c.dustyRose,
        opacity: 0.36,
      }),

      // Expressive classic Disney almond eyes
      eyesMarkup,

      // Sculpted feline nose (flat matte dusty coral-pink + crisp Xerox outline)
      celPath(
        'M 2.2 1.4 Q 4.4 0.5, 6.8 1.4 Q 5.8 3.6, 4.4 4.1 Q 3.0 3.6, 2.2 1.4 Z',
        c.mochiNose,
        { strokeWidth: s.xeroxFine }
      ),
      // Tiny nose-bridge graphite accent tick
      xeroxSketchStroke('M 3.6 0.2 Q 4.4 -0.4, 5.2 0.2', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        opacity: 0.72,
      }),

      // 4-phase speaking mouth or classic Disney kitty smile
      mouthMarkup,

      // Lively hand-inked Xerox whisker flicks with 12 FPS wobble & follow-through
      xeroxSketchStroke(
        [
          `M -14.2 1.6 Q ${round2(-20.0 * wScale)} ${round2(0.2 + whiskerSway * 0.4)}, ${round2(-25.6 * wScale)} ${round2(-0.5 + whiskerSway)}`,
          `M -14.6 4.2 Q ${round2(-20.6 * wScale)} ${round2(4.2 + whiskerSway * 0.3)}, ${round2(-26.4 * wScale)} ${round2(4.7 + whiskerSway * 0.65)}`,
          `M -13.6 6.8 Q ${round2(-19.2 * wScale)} ${round2(8.0 - whiskerSway * 0.3)}, ${round2(-24.2 * wScale)} ${round2(9.2 - whiskerSway * 0.6)}`,
          `M 15.8 1.6 Q ${round2(21.6 * wScale)} ${round2(0.2 - whiskerSway * 0.4)}, ${round2(27.4 * wScale)} ${round2(-0.5 - whiskerSway)}`,
          `M 16.2 4.2 Q ${round2(22.0 * wScale)} ${round2(4.2 - whiskerSway * 0.3)}, ${round2(28.0 * wScale)} ${round2(4.7 - whiskerSway * 0.65)}`,
          `M 15.2 6.8 Q ${round2(20.6 * wScale)} ${round2(8.0 + whiskerSway * 0.3)}, ${round2(26.0 * wScale)} ${round2(9.2 + whiskerSway * 0.6)}`,
        ].join(' '),
        {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
          opacity: 0.88,
        }
      ),
    ]
  );
}

/**
 * Renders Mochi (`'moonlit_cat'`) in Authentic 1970s–1980s Classic Disney Hand-Drawn Cel Style:
 * - Inspired by *The Aristocats*, *Robin Hood* (1973), and *Mickey's Christmas Carol* (1983)
 * - 100% FLAT OPAQUE PHYSICAL CEL PAINT (zero `<linearGradient>`, zero `<radialGradient>`,
 *   zero glossy rim-light bands) + raw electrostatic Xerox graphite outlines (`#xerox-ink`)
 *   and feathery internal `xeroxSketchStroke` pencil construction lines & fur tufts
 * - Fluid 1970s Disney kitten anatomy: tapering 3/4 feline muzzle, shaggy cheek/chest tufts,
 *   sinuous S-spine & arched neck, slender articulated feline legs with hock bend & dainty paws
 * - Smooth 12 FPS ("on twos") motion with squash-and-stretch, overlapping ear/tail follow-through,
 *   and subtle frame-by-frame pencil wobble
 * - Exact origin `(0, 0)` at ground contact, bounds `~x: -44..38, y: -84..4`, waving paw reaching
 *   `~(29.5, -56.5)`, canonical `+X` forward facing, 4-phase 12 FPS cel lip-sync mouths
 */
export function renderClassicMoonlitCat(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const drawStep = Math.floor(frameIndex / 2);

  // 1. Curled-up Sleeping Kitten (`'sleeping'` / `'sleepy'`)
  if (state === 'sleeping' || state === 'sleepy') {
    const breath = round2(steppedOscillate(frameIndex, 24, 1.3));
    const breathScaleX = round2(1 + steppedOscillate(frameIndex, 24, 0.018));
    const breathScaleY = round2(1 - steppedOscillate(frameIndex, 24, 0.022));
    const earLag = round2(steppedOscillate(frameIndex, 24, 0.75, -3));
    const zFloat = round2(steppedOscillate(frameIndex, 20, 2.8));
    const zDriftX = round2(steppedOscillate(frameIndex, 28, 2.0));
    const charmGlint = drawStep % 6 === 0;
    const tuftJit = round2(deterministicJitter(drawStep, 41, 0.45));

    const sleepBodyD = [
      'M -31.0 -2.4',
      'C -33.8 -14.5, -28.0 -26.5, -16.0 -31.2',
      'C -6.0 -34.6, 5.5 -31.5, 13.5 -25.4',
      'C 23.2 -19.6, 24.6 -5.2, 17.6 0.8',
      'C 6.0 2.6, -24.0 2.6, -31.0 -2.4 Z',
    ].join(' ');
    const sleepTailD =
      'M -29.2 -5.0 C -36.4 -1.2, -33.4 3.6, -18.0 3.6 C -4.0 3.6, 8.2 2.8, 14.2 -1.2 C 16.0 -3.2, 13.0 -6.8, 8.0 -4.8 C 2.0 -2.0, -12.0 -1.2, -24.0 -4.0 Z';
    const sleepHeadD = [
      'M 0.2 -15.8',
      'C 0.4 -26.4, 12.4 -30.4, 21.8 -24.0',
      `C 27.6 -18.4, 27.2 -6.0, 16.8 -4.0`,
      `L ${round2(13.0 + tuftJit * 0.4)} -3.4 L 10.6 -4.6`,
      'C 4.4 -4.6, 0.0 -9.0, 0.2 -15.8 Z',
    ].join(' ');

    return svgEl(
      'g',
      {
        'data-character': 'moonlit_cat',
        'data-art-style': 'classic_cel',
        'data-state': state,
      },
      [
        // Grounded soft contact shadow
        celContactShadow(-3, 0.6, 30.5, 3.4, 0.32),

        // Cozy curled-up sleeping body (100% flat cel paint + raw Xerox fur strokes)
        svgEl(
          'g',
          {
            'data-part': 'sleeping-body',
            transform: svgTransform({
              y: round2(-breath * 0.45),
              scaleX: breathScaleX,
              scaleY: breathScaleY,
            }),
          },
          [
            celPath(sleepBodyD, c.mochiFurBase, { strokeWidth: s.xeroxHeavy }),
            // Flat matte navy tabby dorsal stripes (`data-part="tabby-markings"`)
            svgEl('g', { 'data-part': 'tabby-markings' }, [
              svgEl('path', {
                d: 'M -20.5 -25.8 C -15.5 -29.2, -10.0 -29.4, -10.5 -21.2 C -13.6 -19.4, -18.5 -21.0, -20.5 -25.8 Z',
                fill: c.mochiStripe,
              }),
              svgEl('path', {
                d: 'M -6.8 -29.4 C -1.4 -29.8, 3.2 -27.2, 1.8 -20.4 C -1.8 -19.2, -5.6 -22.2, -6.8 -29.4 Z',
                fill: c.mochiStripe,
              }),
              xeroxSketchStroke('M -24.5 -16.5 Q -19.0 -14.8, -14.8 -17.4', {
                stroke: c.mochiStripe,
                strokeWidth: 2.0,
              }),
            ]),
            // Internal Xerox pencil spine & haunch fur ticks
            xeroxSketchStroke(
              'M -25.0 -9.0 Q -17.5 -12.5, -10.0 -10.5 M -15.0 -24.0 L -13.2 -21.0 M -3.0 -25.2 L -1.8 -22.0',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
            ),
            // Soft flat cream tummy tuft peeking beneath chin
            celPath(
              'M -10 -12 C -2 -14, 6 -12, 8 -4 C 4 1, -8 1, -10 -12 Z',
              c.mochiCream,
              { strokeWidth: s.xeroxFine }
            ),
          ]
        ),

        // Snug curled tail wrapped around front paws
        celPath(sleepTailD, c.mochiFurBase, { strokeWidth: s.xeroxMedium }),
        svgEl('path', {
          d: 'M 2.4 -4.2 L 6.0 -4.8 L 7.4 0.8 L 3.8 1.4 Z',
          fill: c.mochiStripe,
        }),
        celPath(
          'M 8.2 -4.8 C 11.4 -6.0, 15.2 -4.2, 14.2 -1.2 C 12.2 0.8, 9.6 0.8, 8.2 -4.8 Z',
          c.mochiCream,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke('M -24.0 -1.2 Q -12.0 0.8, -1.0 -0.8 M 11.5 -3.6 L 13.8 -2.8', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }),

        // Crimson ribbon collar peek & flat antique-gold crescent charm
        celPath(
          'M -3 -11.2 Q 3 -8.2, 9.4 -11.2 L 8.8 -8.2 Q 3 -5.4, -3.4 -8.2 Z',
          c.mochiCollar,
          { strokeWidth: s.xeroxFine }
        ),
        renderClassicMoonCharm(2.5, -7.5, 0.85, charmGlint, 0),

        // Peaceful resting kitten head (`data-part="head"`)
        svgEl(
          'g',
          {
            'data-part': 'head',
            transform: svgTransform({ y: round2(-breath * 0.35) }),
          },
          [
            celPath(
              `M 3.2 -25.0 L ${round2(6.0 + earLag * 0.4)} -36.0 L 13.0 -28.0 Z`,
              c.mochiFurBase,
              { strokeWidth: s.xeroxMedium }
            ),
            svgEl('polygon', {
              points: `5.5,-26.5 ${round2(7.0 + earLag * 0.35)},-33.0 11.2,-28.0`,
              fill: c.mochiEarPink,
            }),
            celPath(
              `M 16.0 -27.0 L ${round2(23.0 + earLag * 0.4)} -35.0 L 24.0 -22.0 Z`,
              c.mochiFurBase,
              { strokeWidth: s.xeroxMedium }
            ),
            svgEl('polygon', {
              points: `17.8,-26.2 ${round2(21.6 + earLag * 0.35)},-32.0 22.3,-23.4`,
              fill: c.mochiEarPink,
            }),
            xeroxSketchStroke(
              'M 6.4 -27.4 L 7.6 -30.0 M 18.6 -26.0 L 20.4 -29.0',
              { strokeWidth: s.sketchLine, opacity: 0.8 }
            ),
            // Resting flat cel head
            celPath(sleepHeadD, c.mochiFurBase, { strokeWidth: s.xeroxHeavy }),
            svgEl('path', {
              d: 'M 11.4 -26.8 L 13.4 -26.6 L 12.6 -22.6 Z M 15.0 -27.0 L 17.2 -26.2 L 15.6 -22.4 Z',
              fill: c.mochiStripe,
            }),
            // Flat matte cream muzzle puff
            celPath(
              'M 8.2 -11.0 C 9.2 -15.0, 20.2 -15.0, 21.2 -10.0 C 21.2 -6.0, 11.0 -5.0, 8.2 -11.0 Z',
              c.mochiCream,
              { strokeWidth: s.xeroxFine }
            ),
            svgEl('ellipse', {
              cx: 6.8,
              cy: -11.4,
              rx: 2.5,
              ry: 1.5,
              fill: c.dustyRose,
              opacity: 0.38,
            }),
            svgEl('ellipse', {
              cx: 22.0,
              cy: -11.4,
              rx: 2.3,
              ry: 1.4,
              fill: c.dustyRose,
              opacity: 0.38,
            }),
            // Peaceful closed sleeping eyes (`data-part="eyes"`) with sketchy lashes
            svgEl('g', { 'data-part': 'eyes' }, [
              svgEl('path', {
                d: 'M 7.5 -16.4 Q 10.5 -13.2, 13.5 -16.4 M 16.5 -16.4 Q 19.5 -13.2, 22.5 -16.4',
                fill: 'none',
                ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
              }),
              xeroxSketchStroke(
                'M 7.5 -16.4 L 6.0 -15.4 M 22.5 -16.4 L 24.0 -15.4',
                { strokeWidth: s.sketchLine }
              ),
            ]),
            // Tiny pink nose & contented sleeping smile
            svgEl('ellipse', {
              cx: 15.2,
              cy: -12.4,
              rx: 1.6,
              ry: 1.2,
              fill: c.mochiNose,
              ...celStrokeAttrs({ strokeWidth: 0.9, useXeroxFilter: true }),
            }),
            svgEl('path', {
              d: 'M 12.6 -9.8 Q 15.2 -8.2, 17.8 -9.8',
              fill: 'none',
              ...celStrokeAttrs({ strokeWidth: 1.25, useXeroxFilter: true }),
            }),
            // Relaxed sketchy whiskers
            xeroxSketchStroke(
              'M 3.2 -12.4 L -3.8 -12.0 M 3.6 -10.0 L -2.8 -8.5 M 23.8 -12.4 L 30.8 -12.0 M 23.4 -10.0 L 29.8 -8.5',
              { strokeWidth: s.sketchLine, opacity: 0.85 }
            ),
          ]
        ),

        // Floating hand-lettered serif 'z Z' drifting softly at 12 FPS
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
            fill: c.parchmentCream,
            stroke: c.xeroxInk,
            'stroke-width': 2.0,
            'paint-order': 'stroke',
          },
          'z Z'
        ),
      ]
    );
  }

  // 2. Authentic 1970s Disney 3/4 Side-Profile Walking Kitten Facing RIGHT (+X when flipX: false)
  if (state === 'walking') {
    // Fluid 12 FPS 8-frame feline walk cycle with subtle squash-and-stretch + overlapping follow-through
    const strideAngle = steppedOscillate(frameIndex, 8, 19);
    const backStrideAngle = steppedOscillate(frameIndex, 8, 18, -1);
    const strideBob = round2(Math.abs(steppedOscillate(frameIndex, 8, 2.2)));
    const squashPulse = steppedOscillate(frameIndex, 4, 1); // 2 pulses per walk cycle!
    const walkScaleX = round2(1 + squashPulse * 0.028);
    const walkScaleY = round2(1 - squashPulse * 0.028);
    const tailBaseSway = steppedOscillate(frameIndex, 12, 4.8);
    const tailTipWobble = round2(deterministicJitter(drawStep, 53, 0.9));
    const tailTipSway = round2(steppedOscillate(frameIndex, 12, 7.2, -2) + tailTipWobble);
    const headBob = steppedOscillate(frameIndex, 8, 2.4, -1);
    const earLag = steppedOscillate(frameIndex, 8, 1.4, -2);
    const charmSwing = steppedOscillate(frameIndex, 8, 8, -2);
    const blink = isSteppedBlinkFrame(frameIndex, 36, 2);
    const charmGlint = drawStep % 4 === 0;
    const shadowRx = round2(28.5 - strideBob * 0.7);

    // Plumed S-curved feline tail with shaggy mid-tuft
    const walkTailD = [
      'M -22.2 -32.8',
      `C -33.2 -38.8, ${round2(-41.2 + tailBaseSway * 0.45)} -54.8, ${round2(-35.6 + tailTipSway * 0.6)} -67.8`,
      `C ${round2(-32.0 + tailTipSway * 0.6)} -73.0, ${round2(-24.4 + tailTipSway * 0.45)} -68.2, ${round2(-27.2 + tailTipSway * 0.35)} -60.0`,
      `C ${round2(-30.0 + tailBaseSway * 0.25)} -51.2, -25.8 -41.4, -17.6 -35.8 Z`,
    ].join(' ');

    // Fluid sinuous S-curved feline torso & tapered arched neck (NO boxy bean!)
    const walkBodyD = [
      'M -23.8 -27.2',
      'C -26.2 -37.2, -21.0 -44.2, -12.0 -44.0',
      'C -4.6 -43.8, -0.4 -41.6, 5.0 -43.4',
      'C 9.6 -45.0, 14.8 -44.6, 17.4 -39.6',
      'C 19.6 -35.2, 19.0 -28.0, 15.6 -23.6',
      'C 11.4 -18.8, 3.0 -19.8, -4.6 -20.2',
      'C -12.6 -20.6, -20.8 -19.8, -23.8 -27.2 Z',
    ].join(' ');

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
        // Grounded soft contact shadow
        celContactShadow(-2.5, 0.5, shadowRx, 3.4, 0.32),

        // Animated flat-cel rig with gentle hand-drawn squash-and-stretch
        svgEl(
          'g',
          {
            transform: svgTransform({
              y: round2(-strideBob),
              scaleX: walkScaleX,
              scaleY: walkScaleY,
            }),
          },
          [
            // Graceful plumed feline tail (flat matte cel paint + raw Xerox fur strokes)
            celPath(walkTailD, c.mochiFurBase, { strokeWidth: s.xeroxMedium }),
            svgEl('path', {
              d: `M ${round2(-35.4 + tailBaseSway * 0.42)} -53.2 L ${round2(-28.6 + tailBaseSway * 0.32)} -54.8 L ${round2(-28.2 + tailBaseSway * 0.32)} -51.2 L ${round2(-34.6 + tailBaseSway * 0.42)} -49.6 Z`,
              fill: c.mochiStripe,
            }),
            celPath(
              `M ${round2(-36.2 + tailTipSway * 0.56)} -64.2 C ${round2(-33.2 + tailTipSway * 0.58)} -71.5, ${round2(-25.8 + tailTipSway * 0.44)} -70.4, ${round2(-27.2 + tailTipSway * 0.38)} -62.8 Z`,
              c.mochiCream,
              { strokeWidth: s.xeroxFine }
            ),
            xeroxSketchStroke(
              `M ${round2(-37.8 + tailBaseSway * 0.44)} -49.0 L ${round2(-39.6 + tailBaseSway * 0.46)} -51.4 M ${round2(-34.2 + tailTipSway * 0.5)} -61.0 L ${round2(-31.8 + tailTipSway * 0.44)} -58.0`,
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true }
            ),

            // Back-far hind leg with feline hock/ankle bend (flat muted shadow cel fill for depth)
            svgEl(
              'g',
              {
                'data-part': 'back-far-leg',
                transform: svgTransform({
                  rotate: -backStrideAngle,
                  pivotX: -14,
                  pivotY: -24,
                }),
              },
              [
                celPath(
                  'M -18.8 -25.0 C -19.8 -19.0, -21.0 -14.2, -19.0 -10.8 C -17.6 -8.4, -17.0 -6.2, -16.8 -4.0 L -11.4 -4.0 C -11.4 -7.4, -12.4 -10.4, -13.6 -13.0 C -12.0 -16.8, -11.4 -21.0, -11.8 -25.0 Z',
                  c.mochiFurShadow,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M -17.4 -5.4 L -11.2 -5.4 C -8.0 -5.4, -7.8 0, -11.0 0 L -16.6 0 C -18.4 0, -18.4 -3.6, -17.4 -5.4 Z',
                  c.mochiCreamShadow,
                  { strokeWidth: s.xeroxFine }
                ),
              ]
            ),

            // Front-far slender foreleg striding forward toward +X
            svgEl(
              'g',
              {
                'data-part': 'front-far-leg',
                transform: svgTransform({
                  rotate: strideAngle,
                  pivotX: 11,
                  pivotY: -24,
                }),
              },
              [
                celPath(
                  'M 7.6 -25.0 C 7.2 -18.5, 8.2 -11.5, 8.8 -4.0 L 14.0 -4.0 C 14.2 -10.5, 14.4 -17.5, 13.8 -25.0 Z',
                  c.mochiFurShadow,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M 8.2 -5.4 L 14.4 -5.4 C 17.6 -5.4, 17.8 0, 14.6 0 L 9.0 0 C 7.2 0, 7.2 -3.6, 8.2 -5.4 Z',
                  c.mochiCreamShadow,
                  { strokeWidth: s.xeroxFine }
                ),
              ]
            ),

            // Sinuous flat-cel feline torso & arched neck
            celPath(walkBodyD, c.mochiFurBase, { strokeWidth: s.xeroxHeavy }),

            // Shaggy flat cream chest & front-belly ruff
            celPath(
              'M -5.2 -20.4 C 2.4 -19.6, 13.8 -23.6, 16.4 -35.8 C 12.6 -38.4, 7.2 -35.4, 4.8 -28.8 L 2.2 -26.2 L 1.4 -23.6 C -0.6 -21.8, -2.8 -21.2, -5.2 -20.4 Z',
              c.mochiCream,
              { strokeWidth: s.xeroxFine }
            ),

            // Navy tabby saddle markings (`data-part="tabby-markings"`)
            svgEl('g', { 'data-part': 'tabby-markings' }, [
              svgEl('path', {
                d: 'M -16.8 -42.4 C -12.0 -44.6, -6.8 -43.8, -7.4 -36.2 C -11.0 -34.8, -15.4 -36.8, -16.8 -42.4 Z',
                fill: c.mochiStripe,
              }),
              svgEl('path', {
                d: 'M -3.6 -43.2 C 1.2 -43.4, 5.2 -41.4, 3.8 -34.8 C 0.2 -34.0, -3.0 -36.8, -3.6 -43.2 Z',
                fill: c.mochiStripe,
              }),
            ]),

            // Raw Xerox internal anatomical shoulder, rib & rump sketch strokes
            xeroxSketchStroke(
              'M -19.8 -33.2 Q -14.6 -31.2, -10.4 -34.2 M 6.4 -33.6 Q 10.6 -30.2, 13.4 -25.4 M -9.2 -22.2 Q -3.0 -21.6, 2.2 -22.8',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
            ),

            // Back-near slender hind leg with curved thigh, feline hock bend & dainty paw
            svgEl(
              'g',
              {
                'data-part': 'back-near-leg',
                transform: svgTransform({
                  rotate: backStrideAngle,
                  pivotX: -18,
                  pivotY: -24,
                }),
              },
              [
                celPath(
                  'M -23.4 -26.0 C -24.8 -19.6, -25.6 -14.4, -23.4 -10.8 C -21.8 -8.2, -21.2 -6.2, -20.8 -4.0 L -15.2 -4.0 C -15.2 -7.4, -16.2 -10.6, -17.6 -13.2 C -15.6 -17.2, -14.8 -21.6, -15.4 -26.0 Z',
                  c.mochiFurBase,
                  { strokeWidth: s.xeroxMedium }
                ),
                // Subtle thigh-muscle pencil crease
                xeroxSketchStroke('M -22.0 -18.5 Q -19.6 -16.4, -17.6 -18.2', {
                  stroke: c.xeroxInkSoft,
                  strokeWidth: s.sketchLine,
                  broken: true,
                }),
                celPath(
                  'M -21.6 -5.4 L -15.0 -5.4 C -11.6 -5.4, -11.4 0, -14.8 0 L -20.8 0 C -22.6 0, -22.6 -3.6, -21.6 -5.4 Z',
                  c.mochiCream,
                  { strokeWidth: s.xeroxFine }
                ),
                xeroxSketchStroke('M -16.6 -2.2 L -16.6 0 M -14.2 -2.2 L -14.2 0', {
                  strokeWidth: s.sketchLine,
                }),
              ]
            ),

            // Front-near slender articulated foreleg & dainty mitten paw
            svgEl(
              'g',
              {
                'data-part': 'front-near-leg',
                transform: svgTransform({
                  rotate: -strideAngle,
                  pivotX: 7,
                  pivotY: -24,
                }),
              },
              [
                celPath(
                  'M 3.2 -25.6 C 2.8 -18.8, 3.8 -11.4, 4.4 -4.0 L 10.0 -4.0 C 10.2 -10.8, 10.6 -17.8, 9.8 -25.6 Z',
                  c.mochiFurBase,
                  { strokeWidth: s.xeroxMedium }
                ),
                xeroxSketchStroke('M 4.4 -16.0 Q 6.4 -15.2, 8.0 -16.2', {
                  stroke: c.xeroxInkSoft,
                  strokeWidth: s.sketchLine,
                  broken: true,
                }),
                celPath(
                  'M 3.8 -5.4 L 10.4 -5.4 C 13.8 -5.4, 14.0 0, 10.6 0 L 4.6 0 C 2.8 0, 2.8 -3.6, 3.8 -5.4 Z',
                  c.mochiCream,
                  { strokeWidth: s.xeroxFine }
                ),
                xeroxSketchStroke('M 9.0 -2.2 L 9.0 0 M 11.4 -2.2 L 11.4 0', {
                  strokeWidth: s.sketchLine,
                }),
              ]
            ),

            // Crimson flat-cel ribbon collar with sketchy fold tick & swinging gold charm
            celPath(
              'M 1.4 -43.4 Q 11.0 -39.2, 18.2 -42.2 L 17.2 -37.0 Q 10.0 -34.0, 0.2 -38.0 Z',
              c.mochiCollar,
              { strokeWidth: s.xeroxFine }
            ),
            xeroxSketchStroke('M 3.4 -39.4 Q 10.2 -36.8, 15.8 -39.0', {
              stroke: c.mochiCollarShadow,
              strokeWidth: 1.1,
              broken: true,
            }),
            renderClassicMoonCharm(13.0, -33.5, 0.95, charmGlint, charmSwing),

            // Expressive 3/4 right-facing classic Disney kitten head
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

  // Smooth 12 FPS ("on twos") timing with gentle squash-and-stretch & overlapping follow-through
  const autoBlink = !isCurious && isSteppedBlinkFrame(frameIndex, 36, 2);
  const breatheBob = round2(
    speakingActive
      ? Math.abs(steppedOscillate(frameIndex, 10, 1.5))
      : steppedOscillate(frameIndex, 24, 0.85)
  );
  const poseStretch = isWaving
    ? steppedOscillate(frameIndex, 8, 0.026)
    : speakingActive
    ? steppedOscillate(frameIndex, 10, 0.022)
    : steppedOscillate(frameIndex, 24, 0.012);
  const bodyScaleX = round2(1 - poseStretch);
  const bodyScaleY = round2(1 + poseStretch);

  const tailTipWobble = round2(deterministicJitter(drawStep, 67, 0.8));
  const tailBaseSway = isCurious
    ? steppedOscillate(frameIndex, 8, 4.2)
    : steppedOscillate(frameIndex, 18, 3.0);
  const tailTipSway = round2(
    (isCurious
      ? steppedOscillate(frameIndex, 8, 6.4, -2)
      : steppedOscillate(frameIndex, 18, 4.8, -3)) + tailTipWobble
  );
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
  const charmGlint = isWaving || speakingActive || drawStep % 5 === 0;

  // Plumed expressive feline tail silhouette
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

  // Graceful *Aristocats* seated kitten silhouette (arched spine, tucked haunch, slender neck)
  const seatedBodyD = [
    'M -19.2 -2.0',
    'C -24.2 -12.0, -22.2 -24.5, -16.8 -33.2',
    'C -13.6 -38.4, -10.4 -42.2, -7.8 -44.0',
    'L 10.0 -44.0',
    'C 15.8 -36.8, 18.6 -17.2, 15.0 -1.2',
    'C 10.2 1.6, -14.2 1.6, -19.2 -2.0 Z',
  ].join(' ');

  return svgEl(
    'g',
    {
      'data-character': 'moonlit_cat',
      'data-art-style': 'classic_cel',
      'data-state': state,
    },
    [
      // Grounded soft contact shadow
      celContactShadow(-1.5, 0.5, 25.5, 3.4, 0.32),

      // Animated flat-cel rig with gentle squash-and-stretch
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-breatheBob),
            scaleX: bodyScaleX,
            scaleY: bodyScaleY,
          }),
        },
        [
          // Expressive curled tail on -X (flat cel paint + sketchy fur ticks)
          celPath(tailPath, c.mochiFurBase, { strokeWidth: s.xeroxMedium }),
          svgEl('path', { d: tailStripePath, fill: c.mochiStripe }),
          celPath(tailTipPath, c.mochiCream, { strokeWidth: s.xeroxFine }),
          xeroxSketchStroke(
            isCurious || isWaving
              ? `M ${round2(-36.8 + tailBaseSway * 0.42)} -24.0 L ${round2(-38.8 + tailBaseSway * 0.44)} -26.2`
              : `M ${round2(-38.2 + tailBaseSway * 0.36)} -14.5 L ${round2(-40.2 + tailBaseSway * 0.38)} -16.8`,
            { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true }
          ),

          // Seated 3/4 feline torso (flat matte cel paint)
          celPath(seatedBodyD, c.mochiFurBase, { strokeWidth: s.xeroxHeavy }),

          // Navy tabby flank markings (`data-part="tabby-markings"`)
          svgEl('g', { 'data-part': 'tabby-markings' }, [
            svgEl('path', {
              d: 'M -19.6 -19.2 C -14.0 -22.2, -9.2 -18.2, -11.8 -12.6 C -15.6 -11.6, -19.8 -13.6, -19.6 -19.2 Z',
              fill: c.mochiStripe,
            }),
            svgEl('path', {
              d: 'M -18.0 -27.2 Q -13.2 -28.2, -10.2 -25.2 M -19.2 -9.0 Q -14.4 -10.0, -11.4 -7.2',
              fill: 'none',
              ...celStrokeAttrs({
                stroke: c.mochiStripe,
                strokeWidth: 2.0,
                useXeroxFilter: true,
              }),
            }),
          ]),

          // Hand-drawn Disney tucked haunch knee curve & shoulder fur ticks!
          xeroxSketchStroke(
            'M -17.6 -4.0 C -17.2 -13.8, -11.2 -17.4, -7.8 -13.6 M -14.6 -32.2 Q -12.0 -30.2, -10.4 -27.6',
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine, feather: true, opacity: 0.85 }
          ),

          // Shaggy tufted flat cream chest ruff
          celPath(
            'M -5.0 -41.0 C 1.2 -42.8, 9.2 -41.8, 12.2 -35.8 C 13.8 -26.8, 11.2 -15.8, 6.2 -12.6 L 4.4 -14.8 L 2.2 -11.8 L 0.2 -14.2 C -4.6 -15.4, -7.6 -24.2, -5.0 -41.0 Z',
            c.mochiCream,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M 0.4 -28.0 L 1.2 -23.6 M 4.8 -27.0 L 4.2 -22.4', {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            broken: true,
            opacity: 0.72,
          }),

          // Left slender front leg & dainty cream mitten paw grounded at y = 0
          celPath(
            'M -5.8 -23.2 C -6.4 -16.4, -5.8 -10.2, -5.4 -4.0 C -5.4 0.8, 1.8 0.8, 1.8 -4.0 C 2.0 -10.2, 2.2 -16.4, 1.6 -23.2 Z',
            c.mochiFurBase,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M -6.4 -5.6 C -6.6 0.8, 3.8 0.8, 2.8 -5.6 Z',
            c.mochiCream,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M -3.0 -2.4 L -3.0 0 M 0.0 -2.4 L 0.0 0', {
            strokeWidth: s.sketchLine,
          }),

          // Right front paw: raised slender reaching paw toward ~(29.5, -56.5) when waving/reaching, or seated at y = 0
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
                  // Graceful slender raised foreleg reaching toward (+X, -Y)
                  celPath(
                    'M 9.2 -36.0 C 16.8 -41.2, 22.8 -49.2, 26.8 -57.8 L 31.8 -53.2 C 27.6 -43.4, 20.8 -34.2, 12.2 -29.2 Z',
                    c.mochiFurBase,
                    { strokeWidth: s.xeroxMedium }
                  ),
                  // Dainty cream batting paw mitten with flat dusty-rose pad & toe ticks
                  celPath(
                    'M 24.5 -56.5 C 24.5 -60.2, 27.2 -61.2, 30.0 -61.0 C 33.4 -60.8, 34.8 -58.2, 34.5 -55.8 C 34.1 -53.0, 31.4 -51.8, 28.6 -52.2 C 25.8 -52.6, 24.5 -54.2, 24.5 -56.5 Z',
                    c.mochiCream,
                    { strokeWidth: s.xeroxFine }
                  ),
                  svgEl('circle', {
                    cx: 29.5,
                    cy: -56.2,
                    r: 1.75,
                    fill: c.mochiEarPink,
                  }),
                  svgEl('circle', { cx: 27.6, cy: -58.5, r: 0.72, fill: c.mochiEarPink }),
                  svgEl('circle', { cx: 29.7, cy: -59.0, r: 0.72, fill: c.mochiEarPink }),
                  svgEl('circle', { cx: 31.7, cy: -58.2, r: 0.72, fill: c.mochiEarPink }),
                  // Hand-inked classic Disney kinetic motion arcs & chime-tap ticks (zero neon!)
                  xeroxSketchStroke(
                    'M 34.0 -63.6 L 36.4 -67.4 M 36.2 -57.8 L 39.2 -59.6 M 26.2 -63.6 L 25.2 -67.2',
                    {
                      stroke: c.parchmentCream,
                      strokeWidth: 1.35,
                      opacity: 0.9,
                    }
                  ),
                ]
              )
            : svgEl('g', { 'data-part': 'front-right-paw' }, [
                celPath(
                  'M 5.0 -23.2 C 4.8 -16.4, 5.2 -10.2, 5.4 -4.0 C 5.4 0.8, 12.6 0.8, 12.6 -4.0 C 12.8 -10.2, 13.0 -16.4, 12.4 -23.2 Z',
                  c.mochiFurBase,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M 4.4 -5.6 C 4.2 0.8, 15.6 0.8, 14.6 -5.6 Z',
                  c.mochiCream,
                  { strokeWidth: s.xeroxFine }
                ),
                xeroxSketchStroke('M 8.2 -2.4 L 8.2 0 M 11.4 -2.4 L 11.4 0', {
                  strokeWidth: s.sketchLine,
                }),
              ]),

          // Crimson flat-cel ribbon collar + sketchy fold crease + perky neck bow
          celPath(
            'M -10.0 -44.0 Q 2.8 -39.0, 14.0 -44.0 L 13.2 -38.8 Q 2.8 -33.8, -10.8 -38.8 Z',
            c.mochiCollar,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M -8.2 -40.4 Q 2.8 -36.2, 11.8 -40.2', {
            stroke: c.mochiCollarShadow,
            strokeWidth: 1.15,
            broken: true,
          }),
          celPath(
            'M -10.6 -41.4 C -15.2 -44.4, -16.8 -39.8, -11.2 -39.4 C -15.4 -37.2, -14.2 -33.8, -9.8 -38.0 Z',
            c.mochiCollar,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M -11.6 -40.6 L -14.0 -41.4 M -11.4 -38.4 L -13.4 -36.8', {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.85,
          }),

          // Flat matte antique-gold crescent-moon charm hanging at chest
          renderClassicMoonCharm(6.5, -34.5, 1.0, charmGlint, charmSwing),

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

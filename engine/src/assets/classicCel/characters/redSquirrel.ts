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

type SquirrelEyeMode = 'open' | 'curious' | 'sparkle' | 'blink';

interface SquirrelHeadConfig {
  pfx: string;
  cx: number;
  cy: number;
  headTilt: number;
  eyeMode: SquirrelEyeMode;
  speaking: boolean;
  earLag: number;
  frameIndex: number;
}

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-squirrel';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-squirrel-${clean}` : 'cc-squirrel';
}

/**
 * Renders Pippin's cozy wrapped Christmas mince pie & holly wreath carried in his mittens
 * when `options.holdingSheep` or `options.holdingPizza` is active (`data-part="christmas-pie-wreath"`).
 */
function renderChristmasPieAndHolly(cx: number, cy: number, frameIndex: number): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const steamBob = round2(steppedOscillate(frameIndex, 14, 1.8));

  return svgEl(
    'g',
    {
      'data-part': 'christmas-pie-wreath',
      transform: svgTransform({ x: cx, y: cy }),
    },
    [
      // Warm hand-baked golden crust pie dish wrapped in rustic cloth
      celPath(
        'M -12.0 0.0 L 12.0 0.0 L 9.4 7.6 C 4.0 9.4, -4.0 9.4, -9.4 7.6 Z',
        c.cottagePlaster,
        { strokeWidth: s.xeroxFine }
      ),
      // Fluted golden pie crust dome
      celPath(
        'M -13.2 0.2 C -12.0 -6.4, 12.0 -6.4, 13.2 0.2 C 9.2 2.4, -9.2 2.4, -13.2 0.2 Z',
        c.ochreEarth,
        { strokeWidth: s.xeroxFine }
      ),
      // Tiny festive holly leaves & crimson berries perched on pie crust
      celPath(
        'M -2.0 -4.8 C -6.8 -8.4, -10.4 -4.6, -5.8 -2.2 Z M 2.0 -4.8 C 6.8 -8.4, 10.4 -4.6, 5.8 -2.2 Z',
        c.foliageLit,
        { strokeWidth: 1.0 }
      ),
      svgEl('circle', { cx: -1.4, cy: -4.4, r: 1.5, fill: c.mochiCollar, ...celStrokeAttrs({ strokeWidth: 0.75 }) }),
      svgEl('circle', { cx: 1.6, cy: -4.6, r: 1.5, fill: c.mochiCollar, ...celStrokeAttrs({ strokeWidth: 0.75 }) }),
      svgEl('circle', { cx: 0.1, cy: -6.2, r: 1.4, fill: c.mochiCollar, ...celStrokeAttrs({ strokeWidth: 0.75 }) }),
      // Delicate rising hand-inked steam wisps
      xeroxSketchStroke(
        `M -4.2 ${round2(-8.6 + steamBob * 0.4)} Q -6.0 ${round2(-12.2 + steamBob * 0.6)}, -3.8 ${round2(-15.6 + steamBob * 0.8)} M 4.4 ${round2(-8.4 - steamBob * 0.4)} Q 6.2 ${round2(-12.0 - steamBob * 0.6)}, 4.0 ${round2(-15.4 - steamBob * 0.8)}`,
        { stroke: c.parchmentCream, strokeWidth: 0.9, broken: true, opacity: 0.82 }
      ),
    ]
  );
}

/**
 * Renders Pippin's youthful 1970s Disney Red Squirrel head (canonical +X forward):
 * - Upright tufted russet-red squirrel ears with raw Xerox ear-tuft hair
 * - Cream muzzle & puffy squirrel cheeks with cute button nose & occasional bucktooth grin
 * - Bright expressive almond Disney eyes with feathery lashes & arched brows
 * - 4-phase 12 FPS cel lip-sync mouths when singing or speaking
 */
function renderSquirrelHead(cfg: SquirrelHeadConfig): string {
  const { pfx, cx, cy, headTilt, eyeMode, speaking, earLag, frameIndex } = cfg;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const drawStep = Math.floor(frameIndex / 2);
  const earWobble = round2(deterministicJitter(drawStep, 19, 0.55));
  const whiskerJit = round2(deterministicJitter(drawStep, 37, 0.55));

  const isCurious = eyeMode === 'curious';
  const isSparkle = eyeMode === 'sparkle';
  const isBlink = eyeMode === 'blink';

  // Sculpted youthful 3/4 red squirrel head with puffy cheek tufts & projecting little snout
  const headD = [
    'M -14.8 -4.0',
    'C -15.4 -12.6, -7.8 -16.8, 1.2 -16.2',
    'C 9.6 -15.6, 15.2 -11.4, 16.0 -4.8',
    'C 18.4 -3.2, 20.6 -0.6, 19.6 2.6',
    'C 18.8 5.4, 16.4 8.2, 12.6 10.6',
    'C 9.4 12.8, 5.2 13.8, 0.4 13.6',
    'C -5.6 13.4, -11.2 11.2, -14.4 6.6',
    `L ${round2(-18.6 - whiskerJit * 0.4)} 5.2 L -16.2 2.4`,
    `L ${round2(-19.2 - whiskerJit * 0.45)} -0.2 L -15.6 -2.2 Z`,
  ].join(' ');

  // Expressive Disney almond squirrel eyes (`data-part="eyes"`)
  let eyesMarkup: string;
  if (isBlink) {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: 'M -6.8 -2.2 Q -3.0 -5.6, 0.8 -2.2 M 5.8 -2.2 Q 9.2 -5.6, 12.6 -2.2',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        'M -6.8 -2.2 L -8.6 -3.4 M 12.6 -2.2 L 14.4 -3.4',
        { strokeWidth: s.xeroxFine }
      ),
    ]);
  } else {
    const pupilDx = isCurious ? 1.0 : 0.7;
    const pupilDy = isCurious ? -1.1 : isSparkle ? -0.4 : 0.1;
    const eyeClipL = `${pfx}-eye-l`;
    const eyeClipR = `${pfx}-eye-r`;

    const eyeLeftD =
      'M -7.6 -2.0 C -7.4 -7.0, -3.4 -8.2, 0.2 -5.8 C 1.2 -4.0, 0.8 1.2, -2.8 2.0 C -6.2 2.4, -7.8 0.4, -7.6 -2.0 Z';
    const eyeRightD =
      'M 5.4 -5.6 C 8.6 -8.0, 12.4 -6.6, 12.6 -1.8 C 12.6 0.4, 11.2 2.4, 8.2 2.0 C 5.2 1.2, 4.6 -3.4, 5.4 -5.6 Z';

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('clipPath', { id: eyeClipL }, svgEl('path', { d: eyeLeftD })),
      svgEl('clipPath', { id: eyeClipR }, svgEl('path', { d: eyeRightD })),

      // Left eye
      svgEl('path', { d: eyeLeftD, fill: c.celCream }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipL) }, [
        svgEl('ellipse', {
          cx: round2(-3.2 + pupilDx),
          cy: round2(-2.2 + pupilDy),
          rx: 2.5,
          ry: 3.1,
          fill: c.mochiEyeIris,
        }),
        svgEl('ellipse', {
          cx: round2(-3.2 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 1.75,
          ry: 2.45,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(-4.1 + pupilDx),
          cy: round2(-3.8 + pupilDy),
          r: isSparkle ? 1.1 : 0.9,
          fill: c.celCream,
        }),
      ]),
      celPath(eyeLeftD, 'none', { strokeWidth: s.xeroxFine }),
      svgEl('path', {
        d: 'M -8.4 -3.2 C -7.4 -7.6, -3.4 -8.8, 0.4 -6.0',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M -7.6 -4.6 L -9.6 -5.8', { strokeWidth: s.xeroxFine }),

      // Right eye
      svgEl('path', { d: eyeRightD, fill: c.celCream }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipR) }, [
        svgEl('ellipse', {
          cx: round2(9.0 + pupilDx),
          cy: round2(-2.2 + pupilDy),
          rx: 2.35,
          ry: 3.1,
          fill: c.mochiEyeIris,
        }),
        svgEl('ellipse', {
          cx: round2(9.0 + pupilDx),
          cy: round2(-2.4 + pupilDy),
          rx: 1.65,
          ry: 2.45,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(8.1 + pupilDx),
          cy: round2(-3.8 + pupilDy),
          r: isSparkle ? 1.1 : 0.9,
          fill: c.celCream,
        }),
      ]),
      celPath(eyeRightD, 'none', { strokeWidth: s.xeroxFine }),
      svgEl('path', {
        d: 'M 5.2 -5.8 C 8.6 -8.6, 12.4 -7.2, 13.4 -3.0',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 12.6 -4.4 L 14.6 -5.6', { strokeWidth: s.xeroxFine }),

      // Plucky floating Disney eyebrows
      xeroxSketchStroke(
        isCurious
          ? 'M -7.0 -9.8 Q -3.6 -12.4, -0.4 -10.2 M 6.2 -10.2 Q 9.0 -12.4, 11.8 -9.6'
          : 'M -6.6 -9.0 Q -3.4 -10.6, -0.6 -9.2 M 6.4 -9.2 Q 9.0 -10.8, 11.6 -8.8',
        { strokeWidth: 1.3, feather: true, opacity: 0.9 }
      ),
    ]);
  }

  // Expressive 4-phase 12 FPS squirrel mouth (or plucky smile with tiny bucktooth!)
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let shape: string;
    if (mouthPhase === 0) {
      shape = svgEl('path', {
        d: 'M 1.4 5.8 Q 6.4 8.6, 11.4 5.2',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
      });
    } else if (mouthPhase === 1) {
      shape = [
        svgEl('ellipse', {
          cx: 7.0,
          cy: 7.4,
          rx: 2.3,
          ry: 2.7,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: 'M 5.4 8.6 Q 7.0 7.4, 8.6 8.6 C 8.0 9.6, 6.0 9.6, 5.4 8.6 Z',
          fill: c.mochiTongue,
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      shape = [
        celPath(
          'M 1.6 5.2 Q 6.8 6.4, 12.2 4.8 C 11.6 11.2, 2.4 11.4, 1.6 5.2 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.4 }
        ),
        // Cute tiny squirrel upper tooth + tongue
        svgEl('rect', {
          x: 6.2,
          y: 5.5,
          width: 2.2,
          height: 1.8,
          rx: 0.4,
          fill: c.celCream,
          ...celStrokeAttrs({ strokeWidth: 0.7 }),
        }),
        celPath(
          'M 3.6 9.0 Q 7.0 7.2, 10.2 9.0 C 9.0 10.6, 4.8 10.6, 3.6 9.0 Z',
          c.mochiTongue,
          { strokeWidth: 0.9 }
        ),
      ].join('');
    } else {
      shape = [
        celPath(
          'M 2.0 5.4 Q 6.8 6.8, 11.6 5.0 C 10.8 9.2, 3.0 9.4, 2.0 5.4 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.4 }
        ),
        svgEl('rect', {
          x: 6.2,
          y: 5.6,
          width: 2.0,
          height: 1.6,
          rx: 0.4,
          fill: c.celCream,
          ...celStrokeAttrs({ strokeWidth: 0.7 }),
        }),
      ].join('');
    }

    mouthMarkup = svgEl(
      'g',
      {
        'data-speaking-mouth': 'true',
        'data-mouth-phase': String(mouthPhase),
      },
      shape
    );
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 1.4 5.4 Q 6.6 8.8, 12.0 4.8',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
      }),
      // Tiny endearing squirrel tooth peek
      svgEl('rect', {
        x: 6.6,
        y: 6.5,
        width: 2.1,
        height: 1.9,
        rx: 0.4,
        fill: c.celCream,
        ...celStrokeAttrs({ strokeWidth: 0.75, useXeroxFilter: true }),
      }),
    ]);
  }

  return svgEl(
    'g',
    {
      'data-part': 'head',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: headTilt,
        pivotX: 0,
        pivotY: 13,
      }),
    },
    [
      // Upright tufted red squirrel ears with spiky ear-tip tufts!
      celPath(
        `M -13.5 -9.5 C -16.0 -16.8, ${round2(-16.2 + earLag * 0.5 + earWobble)} -24.2, ${round2(-12.2 + earLag * 0.6 + earWobble)} -25.4 L ${round2(-11.4 + earLag * 0.6)} -28.6 L ${round2(-9.6 + earLag * 0.5)} -24.6 C -6.8 -21.2, -5.8 -16.6, -5.6 -14.2 Z`,
        c.russetEarth,
        { strokeWidth: s.xeroxMedium }
      ),
      svgEl('path', {
        d: `M -12.0 -11.4 C -13.4 -16.2, ${round2(-13.2 + earLag * 0.45)} -21.0, ${round2(-10.8 + earLag * 0.45)} -21.6 C -8.8 -19.2, -7.8 -16.0, -7.6 -13.8 Z`,
        fill: c.mochiEarPink,
      }),
      celPath(
        `M 4.6 -14.4 C 6.2 -19.6, ${round2(8.6 + earLag * 0.5 + earWobble)} -24.4, ${round2(12.2 + earLag * 0.6 + earWobble)} -25.0 L ${round2(13.8 + earLag * 0.6)} -28.2 L ${round2(14.0 + earLag * 0.5)} -23.8 C 15.2 -19.4, 14.6 -13.2, 13.0 -9.4 Z`,
        c.russetEarth,
        { strokeWidth: s.xeroxMedium }
      ),
      svgEl('path', {
        d: `M 6.8 -13.6 C 8.4 -17.6, ${round2(10.0 + earLag * 0.45)} -21.0, ${round2(11.8 + earLag * 0.45)} -21.4 C 12.8 -18.4, 12.6 -14.6, 11.4 -11.4 Z`,
        fill: c.mochiEarPink,
      }),
      xeroxSketchStroke(
        'M -11.4 -13.0 L -10.2 -16.4 M 9.0 -13.4 L 10.6 -16.6',
        { strokeWidth: s.sketchLine, opacity: 0.82 }
      ),

      // Main russet-red squirrel head (100% flat cel paint)
      celPath(headD, c.russetEarth, { strokeWidth: s.xeroxHeavy }),

      // Warm cream puffy cheeks & muzzle patch
      celPath(
        'M -2.2 4.6 C -2.8 0.4, 4.4 -0.4, 9.2 0.2 C 15.6 0.4, 19.6 1.4, 19.0 4.6 C 18.2 9.4, 11.2 13.2, 3.8 13.2 C -1.4 13.2, -2.6 9.0, -2.2 4.6 Z',
        c.mochiCream,
        { strokeWidth: s.xeroxFine }
      ),
      // Warm dusty-rose squirrel cheek blush
      svgEl('ellipse', { cx: -7.8, cy: 3.6, rx: 2.8, ry: 1.7, fill: c.dustyRose, opacity: 0.42 }),
      svgEl('ellipse', { cx: 13.6, cy: 3.6, rx: 2.4, ry: 1.5, fill: c.dustyRose, opacity: 0.42 }),

      // Raw Xerox fur-tuft strokes on cheeks & forehead
      xeroxSketchStroke('M -15.4 1.6 L -12.2 2.2 M -14.8 4.8 L -11.8 4.8 M -1.2 -14.2 L 1.4 -11.4', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }),

      // Expressive Disney squirrel eyes
      eyesMarkup,

      // Cute dark squirrel button nose
      celPath(
        'M 14.4 0.0 C 17.0 -0.6, 19.2 1.0, 18.2 2.8 C 17.2 4.0, 14.6 3.6, 13.8 2.2 C 13.4 1.2, 13.6 0.4, 14.4 0.0 Z',
        c.xeroxInk,
        { strokeWidth: s.xeroxFine }
      ),

      // Mouth / 4-phase speaking lip-sync
      mouthMarkup,

      // Delicate squirrel whiskers
      xeroxSketchStroke(
        [
          `M 15.8 3.2 Q 21.0 ${round2(2.6 + whiskerJit * 0.4)}, 25.6 ${round2(2.8 + whiskerJit)}`,
          `M 15.2 5.4 Q 20.4 ${round2(6.0 - whiskerJit * 0.3)}, 24.8 ${round2(6.8 - whiskerJit * 0.6)}`,
          `M -11.2 3.8 Q -16.8 ${round2(3.6 + whiskerJit * 0.4)}, -21.8 ${round2(4.2 + whiskerJit)}`,
          `M -10.8 6.2 Q -16.2 ${round2(7.0 - whiskerJit * 0.3)}, -20.8 ${round2(8.0 - whiskerJit * 0.6)}`,
        ].join(' '),
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine, opacity: 0.85 }
      ),
    ]
  );
}

/**
 * Renders **Pippin** (`'red_squirrel'`), plucky warm-hearted young Red Squirrel apprentice:
 * - Authentic 1970s–80s Disney Xerox flat-cel aesthetic (zero gradients, zero neon halos)
 * - Standing height `~86px` (charmingly smaller than Barnaby's `108px`), ground contact `(0, 0)`,
 *   bounds `~x: -46..36, y: -90..4`, canonical `+X` facing
 * - Fluffy curved russet-red squirrel tail with sketchy fur notches, tufted ears, cream belly & muzzle,
 *   cozy crimson-and-cream knitted winter scarf trailing behind, earthy forest-green patched jacket & mittens
 * - Optional Christmas pie & holly wreath carried in mittens when `options.holdingSheep` (or `holdingPizza`) is true
 * - Full state support: `idle`, `walking` (`data-facing="right"`, `data-walk-profile="true"`, bouncy 12 FPS
 *   squirrel trot with tail bob), `waving` (cheerful raised mitten), `curious`, `singing` / `isSpeaking`
 *   (4-phase 12 FPS cel lip-sync mouth)
 */
export function renderClassicRedSquirrel(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    isSpeaking = false,
    holdingSheep = false,
    holdingPizza = false,
    id,
  } = options;

  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'reaching';
  const isCurious = state === 'curious' || state === 'looking_up';
  const isSinging = state === 'singing';
  const isBlinking = state === 'blinking' || state === 'sleeping' || state === 'sleepy';
  const speakingActive = isSinging || isSpeaking;
  const carryingPie = Boolean(holdingSheep || holdingPizza);

  const drawStep = Math.floor(frameIndex / 2);
  const autoBlink = !isCurious && isSteppedBlinkFrame(frameIndex, 34, 2, 11);

  const eyeMode: SquirrelEyeMode =
    isBlinking || autoBlink
      ? 'blink'
      : isCurious
      ? 'curious'
      : isWaving || isSinging
      ? 'sparkle'
      : 'open';

  // Bouncy 12 FPS squirrel motion, tail bob & scarf follow-through
  const strideAngle = isWalking ? steppedOscillate(frameIndex, 8, 25) : 0;
  const trotBob = isWalking ? round2(Math.abs(steppedOscillate(frameIndex, 8, 3.2))) : 0;
  const breathBob = isWalking
    ? 0
    : round2(
        speakingActive
          ? Math.abs(steppedOscillate(frameIndex, 10, 1.4))
          : steppedOscillate(frameIndex, 20, 0.9)
      );
  const squashPulse = isWalking
    ? steppedOscillate(frameIndex, 4, 0.032)
    : isWaving
    ? steppedOscillate(frameIndex, 8, 0.025)
    : 0;
  const scaleX = round2(1 + squashPulse);
  const scaleY = round2(1 - squashPulse);

  const tailSwing = isWalking
    ? steppedOscillate(frameIndex, 8, 7.5, -2)
    : isWaving || isCurious
    ? steppedOscillate(frameIndex, 10, 6.0, -2)
    : steppedOscillate(frameIndex, 20, 3.8, -2);
  const tailJit = round2(deterministicJitter(drawStep, 47, 0.75));
  const scarfFlutter = isWalking
    ? steppedOscillate(frameIndex, 8, 5.5, -2)
    : steppedOscillate(frameIndex, 16, 2.4, -2);
  const headTilt = isCurious
    ? round2(-10.0 + steppedOscillate(frameIndex, 16, 1.8))
    : isWaving
    ? round2(4.0 + steppedOscillate(frameIndex, 8, 2.6))
    : speakingActive
    ? steppedOscillate(frameIndex, 10, 3.4)
    : isWalking
    ? steppedOscillate(frameIndex, 8, 2.8, -1)
    : steppedOscillate(frameIndex, 24, 1.6);
  const earLag = round2(steppedOscillate(frameIndex, 10, 1.4, -2));
  const waveAngle = isWaving ? round2(-12 + steppedOscillate(frameIndex, 8, 16)) : 0;

  const shadowRx = round2(isWalking ? 22 - trotBob * 0.6 : 21);

  // Fluffy plumed question-mark S-curved russet-red squirrel tail (`data-part="squirrel-tail"`)
  const tailD = [
    'M -12.0 -18.0',
    'C -26.0 -18.5, -36.5 -27.5, -39.5 -40.5',
    `L ${round2(-43.8 + tailJit * 0.4)} -44.2 L -40.2 -48.0`,
    `C -42.4 -58.5, -37.2 -72.0, -26.5 -74.0`,
    `L -23.4 -76.2 L -21.2 -72.6`,
    'C -15.4 -70.6, -13.2 -62.5, -18.2 -55.8',
    'C -22.2 -50.6, -26.4 -46.8, -24.8 -39.2',
    'C -23.4 -32.8, -18.0 -26.5, -10.5 -24.0 Z',
  ].join(' ');

  // Trailing winter scarf tail behind neck with 12 FPS flutter
  const scarfTailD = [
    'M -9.2 -48.0',
    `C -18.0 -45.5, ${round2(-26.0 + scarfFlutter * 0.35)} ${round2(-40.0 + scarfFlutter * 0.45)}, ${round2(-30.5 + scarfFlutter * 0.55)} ${round2(-32.5 + scarfFlutter * 0.6)}`,
    `L ${round2(-24.2 + scarfFlutter * 0.55)} ${round2(-29.2 + scarfFlutter * 0.6)}`,
    `C ${round2(-20.4 + scarfFlutter * 0.35)} ${round2(-35.6 + scarfFlutter * 0.4)}, -14.2 -40.8, -6.4 -43.0 Z`,
  ].join(' ');

  // Far-side arm
  const farArm = carryingPie
    ? svgEl('g', { 'data-part': 'far-arm' }, [
        celPath(
          'M 7.0 -45.5 C 14.5 -42.5, 20.5 -38.5, 25.0 -35.5 L 22.0 -30.5 C 17.0 -33.5, 11.5 -36.5, 5.5 -39.5 Z',
          c.foliageShadow,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M 21.6 -35.6 C 24.4 -36.8, 28.0 -34.2, 26.8 -31.2 C 25.4 -28.8, 22.0 -29.4, 21.0 -31.8 Z',
          c.mochiCollarShadow,
          { strokeWidth: s.xeroxFine }
        ),
      ])
    : svgEl(
        'g',
        {
          'data-part': 'far-arm',
          transform: svgTransform({
            rotate: isWalking ? -strideAngle * 0.8 : 0,
            pivotX: 8,
            pivotY: -45,
          }),
        },
        [
          celPath(
            'M 7.2 -46.0 C 12.8 -42.0, 15.8 -34.5, 15.0 -26.5 L 9.5 -26.0 C 9.8 -32.8, 8.0 -38.2, 4.8 -41.5 Z',
            c.foliageShadow,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M 9.6 -27.2 L 15.0 -27.8 L 15.6 -25.0 L 9.8 -24.4 Z',
            c.mochiCreamShadow,
            { strokeWidth: s.xeroxFine }
          ),
          celPath(
            'M 10.0 -24.6 C 10.0 -20.8, 15.4 -20.8, 15.4 -24.8 Z',
            c.mochiCollarShadow,
            { strokeWidth: s.xeroxFine }
          ),
        ]
      );

  // Near-side arm: carrying pie, waving mitten, or swinging in trot
  let nearArm: string;
  if (carryingPie) {
    nearArm = svgEl('g', { 'data-part': 'near-arm' }, [
      celPath(
        'M -9.0 -45.5 C -9.5 -36.5, -2.5 -32.0, 8.0 -32.0 L 14.5 -32.5 L 14.0 -26.8 L 6.5 -26.2 C -6.0 -26.2, -14.8 -32.0, -14.5 -44.0 Z',
        c.foliageMid,
        { strokeWidth: s.xeroxMedium }
      ),
      // Stitched ochre elbow patch
      celPath('M -11.5 -34.0 L -6.0 -34.5 L -5.5 -29.8 L -11.0 -29.4 Z', c.ochreEarth, {
        strokeWidth: 0.95,
      }),
      celPath('M 12.8 -32.8 L 15.6 -32.8 L 15.4 -26.4 L 12.4 -26.4 Z', c.parchmentCream, {
        strokeWidth: s.xeroxFine,
      }),
      celPath(
        'M 15.0 -33.2 C 18.8 -34.2, 22.0 -31.2, 20.6 -27.6 C 19.2 -25.0, 15.6 -25.4, 14.8 -27.6 Z',
        c.mochiCollar,
        { strokeWidth: s.xeroxFine }
      ),
    ]);
  } else if (isWaving) {
    nearArm = svgEl(
      'g',
      {
        'data-part': 'waving-paw',
        transform: svgTransform({
          rotate: waveAngle,
          pivotX: -6,
          pivotY: -45,
        }),
      },
      [
        celPath(
          'M -9.5 -46.0 C -7.0 -40.0, 4.0 -41.5, 16.5 -54.5 L 21.0 -50.2 C 8.5 -36.0, -5.5 -32.5, -13.5 -42.5 Z',
          c.foliageMid,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath('M 16.0 -54.2 L 20.8 -49.8 L 22.8 -51.8 L 18.0 -56.2 Z', c.parchmentCream, {
          strokeWidth: s.xeroxFine,
        }),
        // Cozy knitted crimson winter mitten with thumb
        celPath(
          'M 18.2 -55.8 C 17.8 -60.2, 21.8 -63.0, 25.4 -61.0 C 28.4 -59.2, 28.2 -54.4, 24.4 -52.2 L 21.8 -51.6 Z',
          c.mochiCollar,
          { strokeWidth: s.xeroxFine }
        ),
        // Cheerful hand-inked wave ticks
        xeroxSketchStroke('M 27.6 -63.6 L 30.6 -66.0 M 29.4 -58.8 L 32.6 -59.6', {
          stroke: c.parchmentCream,
          strokeWidth: 1.15,
        }),
      ]
    );
  } else {
    nearArm = svgEl(
      'g',
      {
        'data-part': 'near-arm',
        transform: svgTransform({
          rotate: isWalking ? strideAngle * 0.85 : isCurious ? -10 : 0,
          pivotX: -7,
          pivotY: -45,
        }),
      },
      [
        celPath(
          'M -10.5 -46.0 C -13.8 -39.0, -13.6 -31.0, -10.2 -24.5 L -4.6 -26.0 C -7.0 -31.8, -7.2 -38.0, -5.2 -43.5 Z',
          c.foliageMid,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath('M -11.4 -36.4 L -6.8 -37.2 L -6.2 -33.2 L -10.8 -32.4 Z', c.ochreEarth, {
          strokeWidth: 0.9,
        }),
        celPath('M -10.4 -25.4 L -4.8 -26.8 L -4.0 -23.8 L -9.6 -22.4 Z', c.parchmentCream, {
          strokeWidth: s.xeroxFine,
        }),
        celPath(
          'M -9.6 -22.8 C -9.2 -18.8, -3.6 -18.8, -4.0 -23.8 Z',
          c.mochiCollar,
          { strokeWidth: s.xeroxFine }
        ),
      ]
    );
  }

  return svgEl(
    'g',
    {
      'data-character': 'red_squirrel',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': isWalking ? 'right' : undefined,
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      // Grounded soft contact shadow
      celContactShadow(-1, 0.5, shadowRx, 3.2, 0.32),

      // Animated flat-cel Red Squirrel rig
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-(trotBob + breathBob)),
            scaleX,
            scaleY,
          }),
        },
        [
          // Lush plumed russet-red squirrel tail with overlapping swing (`data-part="squirrel-tail"`)
          svgEl(
            'g',
            {
              'data-part': 'squirrel-tail',
              transform: svgTransform({
                rotate: tailSwing,
                pivotX: -12,
                pivotY: -20,
              }),
            },
            [
              celPath(tailD, c.russetEarth, { strokeWidth: s.xeroxMedium }),
              // Warm ochre inner plume stripe (flat matte cel paint)
              svgEl('path', {
                d: 'M -15.5 -22.5 C -26.0 -25.0, -34.0 -34.0, -34.6 -46.5 C -35.2 -56.5, -31.4 -65.5, -24.5 -68.0 C -26.5 -60.0, -29.2 -50.0, -27.4 -40.5 C -25.8 -33.0, -21.0 -26.8, -15.5 -22.5 Z',
                fill: c.ochreEarth,
              }),
              // Feathery Xerox fur ticks along squirrel tail plume
              xeroxSketchStroke(
                'M -37.5 -39.5 L -33.0 -41.0 M -37.2 -55.0 L -32.2 -54.0 M -29.0 -68.5 L -26.0 -64.2 M -20.5 -58.0 L -23.8 -56.2',
                { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
              ),
            ]
          ),

          // Far-side nimble leg & cozy winter boot
          svgEl(
            'g',
            {
              'data-part': 'far-leg',
              transform: svgTransform({
                rotate: isWalking ? -strideAngle : 0,
                pivotX: 4,
                pivotY: -20,
              }),
            },
            [
              celPath(
                'M 0.5 -21.0 L 7.8 -21.0 L 8.4 -6.0 L 1.8 -6.0 Z',
                c.warmAmberDeep,
                { strokeWidth: s.xeroxMedium }
              ),
              celPath(
                'M 1.2 -6.5 L 8.8 -6.5 C 13.4 -6.5, 15.2 -3.4, 14.8 -0.6 C 14.4 0.5, 8.0 0.5, 1.2 0.4 Z',
                c.woodDark,
                { strokeWidth: s.xeroxFine }
              ),
            ]
          ),

          // Near-side nimble leg & cozy winter boot
          svgEl(
            'g',
            {
              'data-part': 'near-leg',
              transform: svgTransform({
                rotate: isWalking ? strideAngle : 0,
                pivotX: -5,
                pivotY: -20,
              }),
            },
            [
              celPath(
                'M -9.2 -21.0 L -1.6 -21.0 L -1.2 -6.0 L -8.2 -6.0 Z',
                c.russetEarth,
                { strokeWidth: s.xeroxMedium }
              ),
              celPath(
                'M -8.8 -6.5 L -0.8 -6.5 C 3.8 -6.5, 5.6 -3.4, 5.2 -0.6 C 4.8 0.5, -1.6 0.5, -8.8 0.4 Z',
                c.woodDark,
                { strokeWidth: s.xeroxFine }
              ),
            ]
          ),

          // Far arm behind torso
          farArm,

          // Trailing crimson-and-cream winter scarf tail behind jacket (`data-part="winter-scarf"`)
          svgEl('g', { 'data-part': 'winter-scarf' }, [
            celPath(scarfTailD, c.mochiCollar, { strokeWidth: s.xeroxFine }),
            svgEl('path', {
              d: `M ${round2(-21.2 + scarfFlutter * 0.38)} ${round2(-39.5 + scarfFlutter * 0.42)} L ${round2(-16.2 + scarfFlutter * 0.3)} ${round2(-35.2 + scarfFlutter * 0.36)} M ${round2(-27.2 + scarfFlutter * 0.5)} ${round2(-34.6 + scarfFlutter * 0.55)} L ${round2(-22.2 + scarfFlutter * 0.48)} ${round2(-30.8 + scarfFlutter * 0.52)}`,
              fill: 'none',
              ...celStrokeAttrs({ stroke: c.parchmentCream, strokeWidth: 2.2 }),
            }),
            // Knitted scarf fringe ticks
            xeroxSketchStroke(
              `M ${round2(-29.8 + scarfFlutter * 0.55)} ${round2(-32.2 + scarfFlutter * 0.6)} L ${round2(-32.2 + scarfFlutter * 0.6)} ${round2(-29.2 + scarfFlutter * 0.62)} M ${round2(-26.8 + scarfFlutter * 0.55)} ${round2(-30.4 + scarfFlutter * 0.6)} L ${round2(-28.8 + scarfFlutter * 0.6)} ${round2(-27.2 + scarfFlutter * 0.62)}`,
              { stroke: c.mochiCollarShadow, strokeWidth: 1.1 }
            ),
          ]),

          // Earthy forest-green patched winter apprentice jacket + warm cream belly peek
          celPath(
            'M -11.8 -48.0 C -14.8 -37.0, -14.8 -25.0, -11.5 -17.5 C -4.0 -15.5, 6.5 -15.5, 12.0 -18.5 C 14.5 -27.5, 13.8 -38.5, 10.2 -48.0 Z',
            c.foliageMid,
            { strokeWidth: s.xeroxHeavy }
          ),
          // Warm cream squirrel tummy peeking down jacket front
          celPath(
            'M 1.0 -45.5 C 5.8 -45.5, 10.4 -42.5, 11.4 -35.0 C 12.0 -28.0, 10.2 -20.5, 5.2 -18.0 C 1.2 -18.5, -0.4 -26.5, 1.0 -45.5 Z',
            c.mochiCream,
            { strokeWidth: s.xeroxFine }
          ),
          // Jacket pocket patch & wooden buttons + sketchy stitch lines
          celPath('M -9.2 -28.5 L -2.6 -28.5 L -2.8 -22.2 L -9.4 -22.2 Z', c.ochreEarth, {
            strokeWidth: 0.95,
          }),
          xeroxSketchStroke('M -8.6 -27.4 L -3.4 -27.4 M -11.0 -36.0 Q -7.2 -34.2, -3.5 -35.6', {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            broken: true,
          }),
          svgEl('circle', { cx: -0.6, cy: -38.0, r: 1.35, fill: c.woodLit, ...celStrokeAttrs({ strokeWidth: 0.75 }) }),
          svgEl('circle', { cx: -0.8, cy: -31.5, r: 1.35, fill: c.woodLit, ...celStrokeAttrs({ strokeWidth: 0.75 }) }),

          // Snug crimson-and-cream winter scarf wrapped around neck
          celPath(
            'M -12.0 -49.5 Q 0.0 -44.2, 12.2 -49.2 L 11.4 -43.2 Q 0.0 -38.0, -12.4 -43.5 Z',
            c.mochiCollar,
            { strokeWidth: s.xeroxFine }
          ),
          svgEl('path', {
            d: 'M -6.2 -47.2 L -5.6 -41.4 M 1.4 -45.8 L 1.8 -40.2 M 7.8 -47.0 L 7.4 -41.4',
            fill: 'none',
            ...celStrokeAttrs({ stroke: c.parchmentCream, strokeWidth: 1.9 }),
          }),
          xeroxSketchStroke('M -9.6 -45.8 Q 0.0 -41.4, 9.8 -45.6', {
            stroke: c.mochiCollarShadow,
            strokeWidth: 0.95,
            broken: true,
          }),

          // Plucky red squirrel head
          renderSquirrelHead({
            pfx,
            cx: 1.2,
            cy: -60.5,
            headTilt,
            eyeMode,
            speaking: speakingActive,
            earLag,
            frameIndex,
          }),

          // Optional carried Christmas mince pie & holly sprig
          carryingPie ? renderChristmasPieAndHolly(24.5, -34.5, frameIndex) : '',

          // Near arm drawn in front of jacket
          nearArm,
        ]
      ),
    ]
  );
}

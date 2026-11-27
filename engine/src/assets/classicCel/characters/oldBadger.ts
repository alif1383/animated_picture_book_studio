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

type BadgerMood = 'grumpy' | 'curious' | 'warm' | 'blink' | 'neutral';

interface BadgerHeadConfig {
  pfx: string;
  cx: number;
  cy: number;
  headTilt: number;
  mood: BadgerMood;
  speaking: boolean;
  frameIndex: number;
}

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-badger';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-badger-${clean}` : 'cc-badger';
}

/**
 * Renders Barnaby Grumble's expressive 1970s Disney Victorian Badger head (canonical +X forward):
 * - Iconic black-and-cream European badger face stripes (cream blaze + dark eye mask)
 * - Shaggy grey-white badger cheek tufts & mutton-chop whiskers with raw Xerox graphite ticks
 * - Perched antique-brass wire pince-nez spectacles with delicate nose-bridge & lens glint
 * - Bushy expressive eyebrows (furrowed in grumpy, arched above spectacles in curious, warm in waving)
 * - 4-phase 12 FPS cel lip-sync mouths when singing or speaking (`data-speaking-mouth="true"`)
 */
function renderBadgerHead(cfg: BadgerHeadConfig): string {
  const { pfx, cx, cy, headTilt, mood, speaking, frameIndex } = cfg;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const drawStep = Math.floor(frameIndex / 2);
  const whiskerJit = round2(deterministicJitter(drawStep, 13, 0.55));
  const browJit = round2(deterministicJitter(drawStep, 29, 0.35));

  const isGrumpy = mood === 'grumpy';
  const isCurious = mood === 'curious';
  const isWarm = mood === 'warm';
  const isBlink = mood === 'blink';

  // Sculpted 3/4 right-facing badger skull & projecting tapered snout
  const headD = [
    'M -17.5 -7.5',
    'C -18.5 -17.5, -8.5 -22.0, 2.5 -20.8',
    'C 11.8 -19.8, 17.5 -14.8, 18.4 -8.4',
    'C 22.8 -6.4, 27.2 -3.4, 27.6 0.6',
    'C 27.8 4.4, 24.4 7.8, 19.6 8.8',
    'C 16.4 12.8, 10.2 15.2, 1.8 15.2',
    'C -6.2 15.2, -13.2 12.8, -16.8 8.0',
    `L ${round2(-22.2 - whiskerJit * 0.4)} 6.8 L -18.8 3.2`,
    `L ${round2(-23.0 - whiskerJit * 0.45)} 0.2 L -18.8 -2.4`,
    `L ${round2(-21.2 - whiskerJit * 0.3)} -5.2 Z`,
  ].join(' ');

  const headClipId = `${pfx}-head-clip`;

  // Classic Disney badger eyes (`data-part="eyes"`)
  let eyesMarkup: string;
  if (isBlink) {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: 'M -5.4 -6.0 Q -1.8 -3.6, 1.8 -6.0 M 9.2 -6.0 Q 12.6 -3.6, 16.0 -6.0',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        'M -5.8 -6.0 L -7.4 -5.4 M 16.2 -6.0 L 17.6 -5.4',
        { strokeWidth: s.sketchLine }
      ),
    ]);
  } else {
    const pupilDx = isCurious ? 0.9 : isGrumpy ? 0.6 : 0.75;
    const pupilDy = isCurious ? -0.9 : isGrumpy ? 0.4 : 0.0;
    const eyeClipL = `${pfx}-eye-l`;
    const eyeClipR = `${pfx}-eye-r`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('clipPath', { id: eyeClipL }, svgEl('ellipse', { cx: -1.8, cy: -6.2, rx: 3.7, ry: 4.1 })),
      svgEl('clipPath', { id: eyeClipR }, svgEl('ellipse', { cx: 12.2, cy: -6.2, rx: 3.4, ry: 4.1 })),

      // Left (back-side) eye
      svgEl('ellipse', { cx: -1.8, cy: -6.2, rx: 3.7, ry: 4.1, fill: c.celCream }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipL) }, [
        svgEl('ellipse', {
          cx: round2(-1.8 + pupilDx),
          cy: round2(-6.1 + pupilDy),
          rx: 1.85,
          ry: 2.3,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(-2.6 + pupilDx),
          cy: round2(-7.2 + pupilDy),
          r: 0.78,
          fill: c.celCream,
        }),
        // Heavy cantankerous upper eyelid droop in grumpy / idle
        isGrumpy
          ? celPath('M -6.5 -11.5 L 3.0 -11.5 L 3.0 -6.6 L -6.5 -8.8 Z', c.ironDark, {
              strokeWidth: s.xeroxFine,
            })
          : !isCurious
          ? celPath('M -6.5 -11.5 L 3.0 -11.5 L 3.0 -8.4 Q -1.8 -7.8, -6.5 -8.4 Z', c.ironDark, {
              strokeWidth: s.xeroxFine,
            })
          : '',
      ]),
      svgEl('ellipse', {
        cx: -1.8,
        cy: -6.2,
        rx: 3.7,
        ry: 4.1,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),

      // Right (front-side) eye
      svgEl('ellipse', { cx: 12.2, cy: -6.2, rx: 3.4, ry: 4.1, fill: c.celCream }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipR) }, [
        svgEl('ellipse', {
          cx: round2(12.2 + pupilDx),
          cy: round2(-6.1 + pupilDy),
          rx: 1.75,
          ry: 2.3,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(11.4 + pupilDx),
          cy: round2(-7.2 + pupilDy),
          r: 0.78,
          fill: c.celCream,
        }),
        isGrumpy
          ? celPath('M 7.8 -11.5 L 16.8 -11.5 L 16.8 -8.8 L 7.8 -6.6 Z', c.ironDark, {
              strokeWidth: s.xeroxFine,
            })
          : !isCurious
          ? celPath('M 7.8 -11.5 L 16.8 -11.5 L 16.8 -8.4 Q 12.2 -7.8, 7.8 -8.4 Z', c.ironDark, {
              strokeWidth: s.xeroxFine,
            })
          : '',
      ]),
      svgEl('ellipse', {
        cx: 12.2,
        cy: -6.2,
        rx: 3.4,
        ry: 4.1,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      // Gentle crow's-feet wrinkles beside eyes
      xeroxSketchStroke('M -6.4 -5.4 L -8.4 -5.8 M -6.2 -3.8 L -8.0 -3.4', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        opacity: 0.78,
      }),
    ]);
  }

  // Shaggy bushy badger eyebrows (`stoneLight` / `parchmentCream` with jagged Xerox fur tufts)
  const browYOffset = isCurious ? -3.4 : isWarm ? -1.4 : isGrumpy ? 1.2 : 0;
  const leftBrowD = isGrumpy
    ? `M -8.6 ${round2(-12.2 + browJit)} C -5.4 -14.0, -0.4 -12.6, 3.4 -9.4 L 2.2 -7.2 C -1.4 -9.4, -5.6 -10.2, -9.2 -9.4 Z`
    : `M -8.6 ${round2(-11.2 + browYOffset + browJit)} C -5.4 ${round2(-14.2 + browYOffset)}, -0.4 ${round2(-14.2 + browYOffset)}, 3.0 ${round2(-11.4 + browYOffset)} L 2.0 ${round2(-9.2 + browYOffset)} C -1.2 ${round2(-11.2 + browYOffset)}, -5.4 ${round2(-11.4 + browYOffset)}, -8.8 ${round2(-9.0 + browYOffset)} Z`;
  const rightBrowD = isGrumpy
    ? `M 7.4 -9.4 C 10.6 -12.4, 15.0 -13.8, 17.8 ${round2(-11.8 + browJit)} L 17.6 -9.0 C 14.4 -10.0, 10.8 -9.2, 8.2 -7.2 Z`
    : `M 7.8 ${round2(-11.4 + browYOffset)} C 10.8 ${round2(-14.2 + browYOffset)}, 14.8 ${round2(-14.0 + browYOffset)}, 17.4 ${round2(-11.2 + browYOffset + browJit)} L 16.8 ${round2(-9.0 + browYOffset)} C 14.0 ${round2(-11.2 + browYOffset)}, 10.6 ${round2(-11.2 + browYOffset)}, 8.4 ${round2(-9.2 + browYOffset)} Z`;

  // Perched Victorian antique-brass wire spectacles (`data-part="spectacles"`)
  const specY = isCurious ? 0.6 : 0;
  const spectacles = svgEl(
    'g',
    {
      'data-part': 'spectacles',
      transform: specY !== 0 ? svgTransform({ y: specY }) : undefined,
    },
    [
      // Left & right brass oval rims perched slightly down the badger nose
      svgEl('ellipse', {
        cx: -0.8,
        cy: -4.2,
        rx: 4.5,
        ry: 3.6,
        fill: c.celCream,
        'fill-opacity': 0.14,
        ...celStrokeAttrs({ stroke: c.antiqueGold, strokeWidth: 1.45, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: 13.0,
        cy: -4.2,
        rx: 4.2,
        ry: 3.6,
        fill: c.celCream,
        'fill-opacity': 0.14,
        ...celStrokeAttrs({ stroke: c.antiqueGold, strokeWidth: 1.45, useXeroxFilter: true }),
      }),
      // Nose bridge arch & side wire arm hooking toward ear
      svgEl('path', {
        d: 'M 3.7 -4.6 Q 6.2 -6.4, 8.8 -4.6 M -5.3 -4.6 L -14.2 -7.8',
        fill: 'none',
        ...celStrokeAttrs({ stroke: c.antiqueGold, strokeWidth: 1.25, useXeroxFilter: true }),
      }),
      // Crisp tiny hand-drawn spectacle glint tick
      xeroxSketchStroke('M -3.2 -5.8 L -1.8 -4.6 M 10.8 -5.8 L 12.0 -4.6', {
        stroke: c.parchmentCream,
        strokeWidth: 0.85,
        opacity: 0.72,
      }),
    ]
  );

  // Expressive Victorian Badger mouth (4-phase 12 FPS lip-sync or expressive scowl/smile)
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let shape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed expressive mouth (firm in grumpy, warm otherwise)
      shape = svgEl('path', {
        d: isGrumpy
          ? 'M 6.8 6.8 Q 13.4 4.2, 20.0 6.2'
          : 'M 6.6 5.4 Q 13.6 8.6, 20.6 5.0',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      });
    } else if (mouthPhase === 1) {
      // Phase 1: Soft rounded 'o' syllable
      shape = [
        svgEl('ellipse', {
          cx: 14.4,
          cy: 7.4,
          rx: 3.1,
          ry: 3.3,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: 'M 12.2 8.8 Q 14.4 7.4, 16.6 8.8 C 15.8 10.2, 13.0 10.2, 12.2 8.8 Z',
          fill: c.mochiTongue,
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Open emphatic Dickensian talking/singing jaw with tongue
      shape = [
        celPath(
          'M 7.2 5.0 Q 14.4 6.2, 21.4 4.8 C 20.6 12.4, 8.6 12.8, 7.2 5.0 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.55 }
        ),
        celPath(
          'M 10.2 9.4 Q 14.4 7.2, 18.6 9.4 C 17.2 11.4, 11.6 11.4, 10.2 9.4 Z',
          c.mochiTongue,
          { strokeWidth: 1.0 }
        ),
      ].join('');
    } else {
      // Phase 3: Half-open expressive talk / hearty grin
      shape = [
        celPath(
          'M 7.6 5.2 Q 14.4 7.0, 21.0 5.0 C 20.0 9.8, 9.2 10.0, 7.6 5.2 Z',
          c.mochiMouthInner,
          { strokeWidth: 1.5 }
        ),
        svgEl('path', {
          d: 'M 11.0 8.2 Q 14.4 7.0, 17.8 8.2 C 16.4 9.2, 12.4 9.2, 11.0 8.2 Z',
          fill: c.mochiTongue,
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
  } else if (isGrumpy) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 6.4 7.6 Q 13.6 3.6, 20.6 6.4',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      // Cantankerous lower-lip grumble crease
      xeroxSketchStroke('M 10.6 9.6 Q 14.2 8.4, 17.6 9.6', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
      }),
    ]);
  } else if (isWarm) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 6.0 4.8 Q 13.6 9.6, 21.6 4.4',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 5.4 4.2 Q 6.4 5.8, 7.6 6.4 M 11.4 9.6 Q 14.2 10.6, 17.0 9.6', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
      }),
    ]);
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: 'M 7.0 5.6 Q 13.8 7.8, 20.4 5.2',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 11.4 9.2 Q 14.2 9.8, 16.8 9.0', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
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
        pivotY: 14,
      }),
    },
    [
      // Rounded European badger ears (dark iron with parchment-cream upper tips!)
      celPath(
        'M -15.5 -12.8 C -19.2 -19.6, -13.0 -25.4, -7.0 -20.2 L -8.6 -14.2 Z',
        c.ironDark,
        { strokeWidth: s.xeroxMedium }
      ),
      svgEl('path', {
        d: 'M -15.6 -18.8 C -14.0 -22.2, -10.2 -22.8, -8.2 -20.2 C -10.4 -19.6, -13.2 -18.8, -15.6 -18.8 Z',
        fill: c.parchmentCream,
      }),
      celPath(
        'M 7.8 -19.6 C 11.6 -24.6, 17.4 -20.2, 15.6 -13.2 L 10.6 -14.8 Z',
        c.ironDark,
        { strokeWidth: s.xeroxMedium }
      ),
      svgEl('path', {
        d: 'M 9.2 -20.2 C 11.4 -22.6, 14.8 -21.2, 15.2 -18.0 C 13.0 -18.8, 11.0 -19.6, 9.2 -20.2 Z',
        fill: c.parchmentCream,
      }),

      // Main badger head base in flat parchment cream + clipped iconic dark badger face bands
      svgEl('clipPath', { id: headClipId }, svgEl('path', { d: headD })),
      svgEl('path', { d: headD, fill: c.parchmentCream, stroke: 'none' }),
      svgEl('g', { 'clip-path': svgUrl(headClipId) }, [
        // Back-left iconic dark badger mask stripe sweeping from ear across left eye to cheek
        svgEl('path', {
          d: 'M -20 -18 C -12 -19, -2 -16, 2.2 -10.5 C 4.2 -6.8, 3.0 0.8, -3.0 3.0 C -9.6 5.2, -18.2 2.4, -22.5 -2.0 Z',
          fill: c.ironDark,
        }),
        // Front-right dark badger mask stripe sweeping from right ear across right eye
        svgEl('path', {
          d: 'M 8.6 -19.5 C 14.6 -17.8, 19.6 -12.6, 19.4 -5.8 C 19.2 -1.0, 15.6 1.8, 10.6 0.6 C 6.8 -0.6, 6.2 -7.4, 7.6 -13.6 Z',
          fill: c.ironDark,
        }),
        // Subtle shaggy silver-grey cheek mutton-chop shading along lower-left jaw
        svgEl('path', {
          d: 'M -23 2.6 C -16 6.2, -6 9.8, 4 11.4 L 3 17 L -24 17 Z',
          fill: c.stoneLight,
        }),
      ]),
      // Raw Xerox graphite contour on head
      celPath(headD, 'none', { strokeWidth: s.xeroxHeavy }),

      // Internal Xerox fur-tuft strokes across shaggy badger sideburns & muzzle
      xeroxSketchStroke(
        'M -17.6 1.6 L -13.0 2.6 M -16.8 5.2 L -11.4 5.8 M -11.6 9.8 L -6.8 10.6 M 2.0 -17.6 L 3.4 -12.4',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
      ),

      // Expressive eyes, shaggy eyebrows & perched brass spectacles
      eyesMarkup,
      celPath(leftBrowD, c.stoneLight, { strokeWidth: s.xeroxFine }),
      celPath(rightBrowD, c.stoneLight, { strokeWidth: s.xeroxFine }),
      xeroxSketchStroke(
        `M -6.4 ${round2(-11.0 + browYOffset)} L -3.2 ${round2(-11.6 + browYOffset)} M 10.6 ${round2(-11.2 + browYOffset)} L 14.4 ${round2(-10.8 + browYOffset)}`,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.8, opacity: 0.8 }
      ),
      spectacles,

      // Rounded charcoal badger snout nose
      celPath(
        'M 23.0 -3.2 C 26.8 -3.6, 29.2 -1.0, 28.4 1.6 C 27.6 3.6, 24.4 3.4, 22.4 1.6 C 21.4 0.2, 21.6 -2.4, 23.0 -3.2 Z',
        c.xeroxInk,
        { strokeWidth: s.xeroxFine }
      ),
      svgEl('ellipse', {
        cx: 24.8,
        cy: -1.4,
        rx: 1.2,
        ry: 0.6,
        fill: c.stoneLight,
        opacity: 0.65,
      }),

      // Expressive badger mouth (scowl / warm smile / 4-phase lip-sync)
      mouthMarkup,

      // Tufted shaggy grey-white Victorian whiskers
      xeroxSketchStroke(
        [
          `M 19.6 2.2 Q 25.2 ${round2(1.4 + whiskerJit * 0.4)}, 30.8 ${round2(1.8 + whiskerJit)}`,
          `M 19.0 4.4 Q 24.6 ${round2(4.8 - whiskerJit * 0.3)}, 30.0 ${round2(5.8 - whiskerJit * 0.6)}`,
          `M -12.6 4.8 Q -19.2 ${round2(5.2 + whiskerJit * 0.4)}, -25.6 ${round2(6.4 + whiskerJit)}`,
          `M -11.4 7.6 Q -17.8 ${round2(8.8 - whiskerJit * 0.3)}, -23.8 ${round2(10.6 - whiskerJit * 0.6)}`,
        ].join(' '),
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine, opacity: 0.86 }
      ),
    ]
  );
}

/**
 * Renders **Barnaby Grumble** (`'old_badger'`), cantankerous yet lovable Victorian Badger clockmaker:
 * - Authentic 1970s–80s Disney *Mickey's Christmas Carol* / *Wind in the Willows* Xerox flat-cel look
 * - 100% FLAT OPAQUE MATTE ANALOG CEL PAINT (zero gradients, zero neon halos) + raw `#xerox-ink` outlines
 *   and sketchy internal `xeroxSketchStroke` fur/cloth creases
 * - Standing height `~108px`, ground contact `(0, 0)`, bounds `~x: -42..42, y: -112..4`, canonical `+X` facing
 * - Full state support: `idle`, `grumpy` (hunched, scowling, wagging lecturing finger!), `walking`
 *   (`data-facing="right"`, `data-walk-profile="true"`, brisk 12 FPS Victorian stride), `curious`
 *   (brows lifted over brass spectacles), `waving` (hearty warm Victorian wave), `singing` / `isSpeaking`
 *   (4-phase 12 FPS cel lip-sync mouth)
 */
export function renderClassicOldBadger(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const isWalking = state === 'walking';
  const isGrumpy = state === 'grumpy';
  const isCurious = state === 'curious' || state === 'looking_up';
  const isWaving = state === 'waving' || state === 'reaching';
  const isSinging = state === 'singing';
  const isBlinking = state === 'blinking' || state === 'sleeping' || state === 'sleepy';
  const speakingActive = isSinging || isSpeaking;

  const autoBlink =
    !isCurious && !isGrumpy && isSteppedBlinkFrame(frameIndex, 40, 2, 5);

  const mood: BadgerMood =
    isBlinking || autoBlink
      ? 'blink'
      : isGrumpy
      ? 'grumpy'
      : isCurious
      ? 'curious'
      : isWaving || isSinging
      ? 'warm'
      : 'neutral';

  // 12 FPS ("on twos") Victorian motion, posture & subtle squash-and-stretch
  const strideAngle = isWalking ? steppedOscillate(frameIndex, 8, 22) : 0;
  const armSwing = isWalking ? steppedOscillate(frameIndex, 8, 18) : 0;
  const walkBob = isWalking ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.4))) : 0;
  const breathBob = isWalking
    ? 0
    : round2(
        speakingActive
          ? Math.abs(steppedOscillate(frameIndex, 10, 1.3))
          : steppedOscillate(frameIndex, 24, 0.8)
      );
  const squash = isWalking
    ? steppedOscillate(frameIndex, 4, 0.022)
    : isWaving
    ? steppedOscillate(frameIndex, 8, 0.02)
    : 0;
  const scaleX = round2(1 + squash);
  const scaleY = round2(1 - squash);

  const hunchY = isGrumpy ? 3.5 : 0;
  const torsoTilt = isGrumpy
    ? 6.5
    : isCurious
    ? 4.0
    : isWalking
    ? round2(2.5 + steppedOscillate(frameIndex, 8, 1.8))
    : isWaving
    ? -2.0
    : 0;

  const headTilt = isGrumpy
    ? round2(7.0 + steppedOscillate(frameIndex, 8, 2.2))
    : isCurious
    ? round2(-5.5 + steppedOscillate(frameIndex, 18, 1.5))
    : isWaving
    ? round2(-4.0 + steppedOscillate(frameIndex, 10, 2.4))
    : speakingActive
    ? steppedOscillate(frameIndex, 12, 3.0)
    : isWalking
    ? steppedOscillate(frameIndex, 8, 2.2, -1)
    : steppedOscillate(frameIndex, 28, 1.4);

  const fingerWag = isGrumpy ? steppedOscillate(frameIndex, 6, 14) : 0;
  const waveAngle = isWaving ? round2(-10 + steppedOscillate(frameIndex, 8, 15)) : 0;
  const coatTailFlutter = isWalking
    ? steppedOscillate(frameIndex, 8, 3.4, -2)
    : steppedOscillate(frameIndex, 24, 0.8, -2);

  const shadowRx = round2(isWalking ? 26 - walkBob * 0.6 : 25);

  // Far-side arm (back arm swinging during walk, or gesturing warmly)
  const farArm = svgEl(
    'g',
    {
      'data-part': 'far-arm',
      transform: svgTransform({
        rotate: isWalking ? -armSwing : isGrumpy ? -8 : isWaving ? -10 : 0,
        pivotX: 11,
        pivotY: -66,
      }),
    },
    [
      celPath(
        'M 9.0 -68.0 C 16.5 -64.0, 21.0 -52.0, 20.5 -40.0 L 13.0 -39.0 C 13.0 -49.0, 10.5 -57.0, 6.0 -62.0 Z',
        c.cottageRoofShadow,
        { strokeWidth: s.xeroxMedium }
      ),
      celPath(
        'M 13.4 -40.6 L 20.2 -41.4 L 20.8 -37.2 L 13.6 -36.6 Z',
        c.mochiCreamShadow,
        { strokeWidth: s.xeroxFine }
      ),
      celPath(
        'M 14.0 -36.8 C 14.0 -32.2, 20.4 -31.8, 20.8 -36.8 Z',
        c.stoneShadow,
        { strokeWidth: s.xeroxFine }
      ),
    ]
  );

  // Near-side arm: wagging stern finger in grumpy, hearty raised wave in waving, swinging in walking, or resting on waistcoat
  let nearArm: string;
  if (isGrumpy) {
    nearArm = svgEl(
      'g',
      {
        'data-part': 'wagging-finger',
        transform: svgTransform({
          rotate: fingerWag,
          pivotX: -6,
          pivotY: -62,
        }),
      },
      [
        // Bent frock-coat sleeve raising forearm forward toward +X
        celPath(
          'M -12.0 -66.0 C -13.0 -55.0, -6.0 -47.0, 4.0 -48.5 C 12.0 -50.0, 19.5 -54.0, 25.0 -59.5 L 21.0 -65.5 C 15.5 -61.0, 9.5 -57.5, 3.0 -56.5 C -2.0 -56.0, -4.5 -60.0, -4.5 -66.5 Z',
          c.cottageRoof,
          { strokeWidth: s.xeroxMedium }
        ),
        xeroxSketchStroke('M -7.4 -54.0 Q -2.2 -51.6, 3.6 -52.8 M 11.4 -55.8 L 15.6 -58.2', {
          stroke: c.cottageRoofShadow,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
        // Starched cuff
        celPath(
          'M 20.8 -65.2 L 24.8 -59.6 L 27.6 -61.6 L 23.6 -67.2 Z',
          c.celCream,
          { strokeWidth: s.xeroxFine }
        ),
        // Stern wagging badger paw with pointing index finger!
        celPath(
          'M 24.4 -66.2 C 26.8 -69.2, 31.0 -69.2, 31.8 -66.2 L 36.2 -71.0 C 37.8 -72.2, 39.6 -70.4, 38.0 -68.6 L 32.8 -63.0 C 33.4 -60.2, 29.8 -58.0, 26.6 -60.0 Z',
          c.ironDark,
          { strokeWidth: s.xeroxFine }
        ),
        // Hand-inked wag motion ticks
        xeroxSketchStroke('M 37.2 -74.5 L 40.4 -76.5 M 39.8 -69.8 L 42.2 -69.2', {
          stroke: c.xeroxInkSoft,
          strokeWidth: 1.0,
        }),
      ]
    );
  } else if (isWaving) {
    nearArm = svgEl(
      'g',
      {
        'data-part': 'waving-arm',
        transform: svgTransform({
          rotate: waveAngle,
          pivotX: -8,
          pivotY: -66,
        }),
      },
      [
        // Heartily raised Victorian frock-coat sleeve waving high
        celPath(
          'M -12.5 -66.0 C -14.0 -56.0, -4.0 -53.0, 7.0 -60.0 C 15.0 -65.5, 22.0 -73.0, 27.0 -82.0 L 21.0 -85.5 C 16.5 -77.5, 10.5 -71.0, 3.5 -67.0 C -1.5 -64.0, -4.5 -64.5, -5.0 -68.0 Z',
          c.cottageRoof,
          { strokeWidth: s.xeroxMedium }
        ),
        xeroxSketchStroke('M 4.5 -63.8 Q 10.6 -67.4, 15.8 -72.8', {
          stroke: c.cottageRoofShadow,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
        // Crisp starched cuff
        celPath(
          'M 20.6 -85.2 L 26.8 -81.8 L 28.6 -84.6 L 22.4 -88.0 Z',
          c.celCream,
          { strokeWidth: s.xeroxFine }
        ),
        // Friendly open waving badger paw
        celPath(
          'M 23.2 -87.4 C 22.4 -92.4, 26.4 -96.6, 30.8 -95.0 C 34.4 -93.6, 35.0 -88.2, 31.2 -85.0 L 28.2 -84.2 Z',
          c.ironDark,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke('M 26.8 -93.4 L 27.4 -90.4 M 30.0 -93.0 L 29.8 -89.8 M 34.8 -95.4 L 37.8 -97.8 M 36.2 -90.8 L 39.2 -91.8', {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.95,
        }),
      ]
    );
  } else {
    nearArm = svgEl(
      'g',
      {
        'data-part': 'near-arm',
        transform: svgTransform({
          rotate: isWalking ? armSwing : isCurious ? -12 : 0,
          pivotX: -9,
          pivotY: -66,
        }),
      },
      [
        celPath(
          'M -13.5 -67.0 C -17.5 -58.0, -17.0 -47.0, -13.5 -38.0 L -5.5 -39.5 C -8.0 -47.0, -8.5 -55.0, -6.0 -63.5 Z',
          c.cottageRoof,
          { strokeWidth: s.xeroxMedium }
        ),
        xeroxSketchStroke('M -12.6 -54.0 Q -10.8 -48.6, -9.8 -44.2', {
          stroke: c.cottageRoofShadow,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
        celPath(
          'M -13.6 -39.0 L -5.8 -40.4 L -5.0 -36.4 L -12.8 -35.0 Z',
          c.celCream,
          { strokeWidth: s.xeroxFine }
        ),
        celPath(
          'M -12.4 -35.4 C -12.0 -30.4, -5.2 -30.2, -5.2 -36.2 Z',
          c.ironDark,
          { strokeWidth: s.xeroxFine }
        ),
      ]
    );
  }

  return svgEl(
    'g',
    {
      'data-character': 'old_badger',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': isWalking ? 'right' : undefined,
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      // Grounded soft contact shadow
      celContactShadow(0, 0.6, shadowRx, 3.4, 0.34),

      // Animated flat-cel Victorian Badger rig
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-(walkBob + breathBob)),
            scaleX,
            scaleY,
          }),
        },
        [
          // Far-side trouser leg & buckled Victorian leather shoe
          svgEl(
            'g',
            {
              'data-part': 'far-leg',
              transform: svgTransform({
                rotate: isWalking ? -strideAngle : 0,
                pivotX: 5,
                pivotY: -28,
              }),
            },
            [
              celPath(
                'M 0.5 -29.0 L 11.0 -29.0 L 12.2 -7.0 L 2.2 -7.0 Z',
                c.stoneShadow,
                { strokeWidth: s.xeroxMedium }
              ),
              celPath(
                'M 1.4 -7.5 L 12.6 -7.5 C 18.4 -7.5, 21.0 -4.0, 20.6 -0.8 C 20.2 0.6, 12.0 0.6, 1.4 0.4 Z',
                c.xeroxGraphite,
                { strokeWidth: s.xeroxFine }
              ),
              // Tiny antique brass shoe buckle
              celPath('M 11.4 -6.4 L 15.0 -6.4 L 15.0 -3.2 L 11.4 -3.2 Z', c.antiqueGold, {
                strokeWidth: 0.9,
              }),
            ]
          ),

          // Near-side trouser leg & buckled Victorian leather shoe
          svgEl(
            'g',
            {
              'data-part': 'near-leg',
              transform: svgTransform({
                rotate: isWalking ? strideAngle : 0,
                pivotX: -6,
                pivotY: -28,
              }),
            },
            [
              celPath(
                'M -12.0 -29.0 L -1.0 -29.0 L -0.4 -7.0 L -11.0 -7.0 Z',
                c.ironDark,
                { strokeWidth: s.xeroxMedium }
              ),
              xeroxSketchStroke('M -6.8 -22.0 L -6.4 -11.0', {
                stroke: c.xeroxInkSoft,
                strokeWidth: s.sketchLine,
                broken: true,
              }),
              celPath(
                'M -11.6 -7.5 L -0.2 -7.5 C 5.8 -7.5, 8.4 -4.0, 8.0 -0.8 C 7.6 0.6, -1.0 0.6, -11.6 0.4 Z',
                c.xeroxGraphite,
                { strokeWidth: s.xeroxFine }
              ),
              celPath('M -1.4 -6.4 L 2.2 -6.4 L 2.2 -3.2 L -1.4 -3.2 Z', c.antiqueGold, {
                strokeWidth: 0.9,
              }),
            ]
          ),

          // Upper torso, Victorian frock coat, olive waistcoat, arms & head
          svgEl(
            'g',
            {
              transform: svgTransform({
                y: hunchY,
                rotate: torsoTilt,
                pivotX: 0,
                pivotY: -28,
              }),
            },
            [
              farArm,

              // Flared burgundy-russet Victorian frock coat back & coattails
              celPath(
                [
                  'M -15.5 -70.0',
                  'C -20.0 -56.0, -21.5 -38.0, ' + round2(-24.0 - coatTailFlutter * 0.4) + ' -20.0',
                  'C -17.0 -16.5, -5.0 -16.5, 5.0 -18.5',
                  'C 15.0 -20.5, 19.5 -24.5, 18.5 -36.0',
                  'C 18.0 -48.0, 16.0 -62.0, 12.0 -70.0 Z',
                ].join(' '),
                c.cottageRoof,
                { strokeWidth: s.xeroxHeavy }
              ),

              // Warm olive Victorian waistcoat peeking down the front chest
              celPath(
                'M -2.0 -68.5 L 13.5 -68.5 C 16.5 -56.0, 17.0 -41.0, 13.5 -29.0 L 6.5 -25.0 L -2.5 -29.5 C -4.0 -43.0, -4.0 -56.0, -2.0 -68.5 Z',
                c.oliveCanopy,
                { strokeWidth: s.xeroxFine }
              ),
              // Waistcoat brass buttons & dangling antique pocket-watch chain!
              svgEl('circle', { cx: 6.4, cy: -56.0, r: 1.5, fill: c.antiqueGold, ...celStrokeAttrs({ strokeWidth: 0.8 }) }),
              svgEl('circle', { cx: 6.8, cy: -47.5, r: 1.5, fill: c.antiqueGold, ...celStrokeAttrs({ strokeWidth: 0.8 }) }),
              svgEl('circle', { cx: 6.6, cy: -39.0, r: 1.5, fill: c.antiqueGold, ...celStrokeAttrs({ strokeWidth: 0.8 }) }),
              svgEl('path', {
                d: 'M 6.8 -42.5 Q 11.4 -36.5, 15.2 -39.8',
                fill: 'none',
                ...celStrokeAttrs({ stroke: c.antiqueGold, strokeWidth: 1.25, useXeroxFilter: true }),
              }),

              // Frock-coat broad burgundy lapels & sketchy wool creases
              celPath(
                'M -12.0 -70.0 L -1.0 -69.0 L 2.2 -46.0 L -6.0 -49.0 L -3.5 -54.0 L -12.5 -60.0 Z',
                c.cottageRoofShadow,
                { strokeWidth: s.xeroxFine }
              ),
              celPath(
                'M 12.0 -70.0 L 14.5 -58.0 L 10.6 -53.5 L 13.5 -49.5 L 10.8 -45.5 L 9.5 -68.5 Z',
                c.cottageRoofShadow,
                { strokeWidth: s.xeroxFine }
              ),
              // Brass coat buttons & raw Xerox fabric folds
              svgEl('circle', { cx: -5.2, cy: -42.0, r: 1.7, fill: c.antiqueGold, ...celStrokeAttrs({ strokeWidth: 0.85 }) }),
              svgEl('circle', { cx: -5.8, cy: -33.5, r: 1.7, fill: c.antiqueGold, ...celStrokeAttrs({ strokeWidth: 0.85 }) }),
              xeroxSketchStroke(
                'M -16.5 -45.0 Q -14.5 -34.0, -15.5 -22.5 M -9.5 -29.0 L -10.2 -20.5 M 14.5 -35.0 L 15.2 -24.0',
                { stroke: c.cottageRoofShadow, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
              ),

              // High starched cream Victorian wing-collar & tucked crimson cravat
              celPath(
                'M -10.5 -74.5 L -2.5 -65.5 L 3.0 -70.0 L 10.5 -65.5 L 14.5 -74.0 L 10.0 -76.5 L -6.0 -76.5 Z',
                c.celCream,
                { strokeWidth: s.xeroxFine }
              ),
              celPath(
                'M 0.2 -70.0 L 7.4 -70.0 L 8.2 -61.5 L 3.6 -58.0 L -0.6 -61.5 Z',
                c.mochiCollar,
                { strokeWidth: s.xeroxFine }
              ),
              xeroxSketchStroke('M 3.6 -68.0 L 3.6 -61.5', {
                stroke: c.mochiCollarShadow,
                strokeWidth: 0.9,
              }),

              // Expressive Barnaby Grumble badger head
              renderBadgerHead({
                pfx,
                cx: 2.5,
                cy: -88.0,
                headTilt,
                mood,
                speaking: speakingActive,
                frameIndex,
              }),

              // Near arm drawn over torso lapel
              nearArm,
            ]
          ),
        ]
      ),
    ]
  );
}

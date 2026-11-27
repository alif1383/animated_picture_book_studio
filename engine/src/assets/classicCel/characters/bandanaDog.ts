import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';

type DogEyeMode = 'open' | 'blink' | 'curious' | 'looking_up' | 'grumpy' | 'happy';

interface ClassicDogHeadConfig {
  pfx: string;
  cx: number;
  cy: number;
  headTilt: number;
  earBounce: number;
  earLag: number;
  eyeMode: DogEyeMode;
  speaking: boolean;
  isSinging: boolean;
  isWaving: boolean;
  isCurious: boolean;
  isGrumpy: boolean;
  frameIndex: number;
}

interface ClassicPuppyLegOptions {
  partName: string;
  pivotX: number;
  pivotY: number;
  rotate?: number;
  length: number;
  width?: number;
  isFar?: boolean;
  isHind?: boolean;
}

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-biscuit';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-biscuit-${clean}` : 'cc-biscuit';
}

/**
 * Renders Biscuit's 4-stage 12 FPS on-twos cel lip-sync mouth when `speaking` is true,
 * or an expressive classic Disney resting puppy mouth when silent.
 */
function renderClassicDogMouth(opts: {
  cx: number;
  cy: number;
  speaking: boolean;
  isSinging: boolean;
  isWaving: boolean;
  isCurious: boolean;
  isGrumpy: boolean;
  frameIndex: number;
}): string {
  const {
    cx,
    cy,
    speaking,
    isSinging,
    isWaving,
    isCurious,
    isGrumpy,
    frameIndex,
  } = opts;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;

    if (mouthPhase === 0) {
      // Phase 0: Warm closed happy puppy W-smile
      phaseShape = [
        svgEl('path', {
          d: `M ${round2(cx - 4.6)} ${round2(cy - 0.1)} Q ${round2(cx - 2.0)} ${round2(cy + 2.6)}, ${round2(cx + 0.4)} ${round2(cy - 0.4)} Q ${round2(cx + 2.9)} ${round2(cy + 2.6)}, ${round2(cx + 5.4)} ${round2(cy - 0.3)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          `M ${round2(cx - 1.4)} ${round2(cy + 3.0)} Q ${round2(cx + 0.4)} ${round2(cy + 4.0)}, ${round2(cx + 2.2)} ${round2(cy + 3.0)}`,
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
        ),
      ].join('');
    } else if (mouthPhase === 1) {
      // Phase 1: Small soft 'o' vowel oval (flat dark inner mouth + subtle tongue hint)
      phaseShape = [
        svgEl('ellipse', {
          cx: round2(cx + 0.5),
          cy: round2(cy + 2.1),
          rx: 2.55,
          ry: 2.85,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: `M ${round2(cx - 1.2)} ${round2(cy + 3.4)} Q ${round2(cx + 0.5)} ${round2(cy + 2.1)}, ${round2(cx + 2.2)} ${round2(cy + 3.4)} C ${round2(cx + 1.5)} ${round2(cy + 4.5)}, ${round2(cx - 0.5)} ${round2(cy + 4.5)}, ${round2(cx - 1.2)} ${round2(cy + 3.4)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Wide cheerful open bark/jaw with flat matte pink tongue
      phaseShape = [
        celPath(
          `M ${round2(cx - 5.2)} ${round2(cy - 0.7)} Q ${round2(cx - 1.8)} ${round2(cy + 0.8)}, ${round2(cx + 0.4)} ${round2(cy - 0.7)} Q ${round2(cx + 2.8)} ${round2(cy + 0.8)}, ${round2(cx + 6.0)} ${round2(cy - 0.9)} C ${round2(cx + 5.6)} ${round2(cy + 6.6)}, ${round2(cx - 4.4)} ${round2(cy + 6.6)}, ${round2(cx - 5.2)} ${round2(cy - 0.7)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.45 }
        ),
        celPath(
          `M ${round2(cx - 2.6)} ${round2(cy + 2.4)} Q ${round2(cx + 0.6)} ${round2(cy + 0.6)}, ${round2(cx + 3.8)} ${round2(cy + 2.4)} C ${round2(cx + 3.6)} ${round2(cy + 7.6)}, ${round2(cx - 2.4)} ${round2(cy + 7.6)}, ${round2(cx - 2.6)} ${round2(cy + 2.4)} Z`,
          c.mochiTongue,
          { strokeWidth: 1.05 }
        ),
        xeroxSketchStroke(
          `M ${round2(cx + 0.6)} ${round2(cy + 2.6)} L ${round2(cx + 0.6)} ${round2(cy + 5.6)}`,
          { stroke: c.mochiMouthInner, strokeWidth: 0.9, opacity: 0.65 }
        ),
        isSinging
          ? xeroxSketchStroke(
              `M ${round2(cx + 12.2)} ${round2(cy - 5.6)} L ${round2(cx + 15.8)} ${round2(cy - 7.8)} M ${round2(cx + 13.0)} ${round2(cy - 0.4)} L ${round2(cx + 16.8)} ${round2(cy - 0.4)} M ${round2(cx + 11.8)} ${round2(cy + 4.2)} L ${round2(cx + 15.2)} ${round2(cy + 6.0)}`,
              { stroke: c.parchmentCream, strokeWidth: 1.45, opacity: 0.9 }
            )
          : '',
      ].join('');
    } else {
      // Phase 3: Half-open expressive grin with tongue peek
      phaseShape = [
        celPath(
          `M ${round2(cx - 4.0)} ${round2(cy - 0.3)} Q ${round2(cx - 1.4)} ${round2(cy + 1.0)}, ${round2(cx + 0.4)} ${round2(cy - 0.4)} Q ${round2(cx + 2.6)} ${round2(cy + 1.0)}, ${round2(cx + 5.0)} ${round2(cy - 0.5)} C ${round2(cx + 4.4)} ${round2(cy + 4.4)}, ${round2(cx - 3.4)} ${round2(cy + 4.4)}, ${round2(cx - 4.0)} ${round2(cy - 0.3)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.4 }
        ),
        svgEl('path', {
          d: `M ${round2(cx - 1.9)} ${round2(cy + 2.7)} Q ${round2(cx + 0.5)} ${round2(cy + 1.3)}, ${round2(cx + 2.9)} ${round2(cy + 2.7)} C ${round2(cx + 2.1)} ${round2(cy + 4.0)}, ${round2(cx - 1.1)} ${round2(cy + 4.0)}, ${round2(cx - 1.9)} ${round2(cy + 2.7)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    }

    return svgEl(
      'g',
      {
        'data-part': 'mouth',
        'data-speaking-mouth': 'true',
        'data-mouth-phase': String(mouthPhase),
      },
      [
        svgEl('path', {
          d: `M ${round2(cx + 0.4)} ${round2(cy - 3.0)} L ${round2(cx + 0.4)} ${round2(cy - 0.7)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
        }),
        phaseShape,
      ]
    );
  }

  // Silent resting mouths (no data-speaking-mouth attribute)
  if (isGrumpy) {
    return svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: `M ${round2(cx + 0.4)} ${round2(cy - 2.9)} L ${round2(cx + 0.4)} ${round2(cy - 0.8)} M ${round2(cx - 3.8)} ${round2(cy + 2.2)} Q ${round2(cx + 0.4)} ${round2(cy - 0.5)}, ${round2(cx + 4.6)} ${round2(cy + 2.0)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
      }),
    ]);
  }

  if (isWaving) {
    // Happy excited puppy smile with cute flat pink tongue peek
    return svgEl('g', { 'data-part': 'mouth' }, [
      celPath(
        `M ${round2(cx - 2.0)} ${round2(cy + 0.7)} C ${round2(cx - 2.1)} ${round2(cy + 5.4)}, ${round2(cx + 3.0)} ${round2(cy + 5.4)}, ${round2(cx + 2.9)} ${round2(cy + 0.6)} Z`,
        c.mochiTongue,
        { strokeWidth: 1.1 }
      ),
      svgEl('path', {
        d: `M ${round2(cx + 0.4)} ${round2(cy - 3.0)} L ${round2(cx + 0.4)} ${round2(cy - 0.4)} M ${round2(cx - 4.7)} ${round2(cy - 0.2)} Q ${round2(cx - 2.0)} ${round2(cy + 2.6)}, ${round2(cx + 0.4)} ${round2(cy - 0.4)} Q ${round2(cx + 3.0)} ${round2(cy + 2.6)}, ${round2(cx + 5.6)} ${round2(cy - 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
      }),
    ]);
  }

  if (isCurious) {
    return svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: `M ${round2(cx + 0.4)} ${round2(cy - 3.0)} L ${round2(cx + 0.4)} ${round2(cy - 0.8)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(cx + 0.5),
        cy: round2(cy + 1.3),
        rx: 1.85,
        ry: 1.9,
        fill: c.mochiMouthInner,
        ...celStrokeAttrs({ strokeWidth: 1.3, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(cx + 0.5),
        cy: round2(cy + 2.2),
        rx: 1.1,
        ry: 0.65,
        fill: c.mochiTongue,
      }),
    ]);
  }

  // Calm closed warm Disney puppy W-smile
  return svgEl('g', { 'data-part': 'mouth' }, [
    svgEl('path', {
      d: `M ${round2(cx + 0.4)} ${round2(cy - 3.0)} L ${round2(cx + 0.4)} ${round2(cy - 0.5)} M ${round2(cx - 4.4)} ${round2(cy - 0.2)} Q ${round2(cx - 1.9)} ${round2(cy + 2.3)}, ${round2(cx + 0.4)} ${round2(cy - 0.5)} Q ${round2(cx + 2.9)} ${round2(cy + 2.3)}, ${round2(cx + 5.4)} ${round2(cy - 0.4)}`,
      fill: 'none',
      ...celStrokeAttrs({ strokeWidth: 1.5, useXeroxFilter: true }),
    }),
    xeroxSketchStroke(
      `M ${round2(cx - 1.2)} ${round2(cy + 2.8)} Q ${round2(cx + 0.4)} ${round2(cy + 3.6)}, ${round2(cx + 2.0)} ${round2(cy + 2.8)}`,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.76 }
    ),
  ]);
}

/**
 * Renders Biscuit's signature 1970s–80s Disney Xerox Goldendoodle head (3/4 right-facing `+X`):
 * - Flat matte golden-apricot cel paint (`biscuitFurBase`) with shaggy crown & cheek tufts
 * - Warmer russet-apricot feathered floppy ears (`biscuitEarRusset`) with overlapping 12 FPS bounce
 * - Fluffy lighter-golden teddy-bear muzzle (`biscuitFurLight`)
 * - Classic expressive Disney eyes (`celCream` sclera, warm amber iris, dark charcoal pupil, catchlight,
 *   bold upper lash arc & floating sketchy Xerox eyebrows)
 * - Dark charcoal button nose (`xeroxInk`) with soft `celCream` gleam & 4-stage cel lip-sync mouth
 */
function renderClassicDogHead(cfg: ClassicDogHeadConfig): string {
  const {
    pfx,
    cx,
    cy,
    headTilt,
    earBounce,
    earLag,
    eyeMode,
    speaking,
    isSinging,
    isWaving,
    isCurious,
    isGrumpy,
    frameIndex,
  } = cfg;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // On-twos (12 FPS) subtle hand-drawn graphite wobble
  const drawStep = Math.floor(frameIndex / 2);
  const crownJitX = round2(deterministicJitter(drawStep, 13, 0.65));
  const crownJitY = round2(deterministicJitter(drawStep, 19, 0.55));
  const earJitL = round2(deterministicJitter(drawStep, 29, 0.8));
  const earJitR = round2(deterministicJitter(drawStep, 37, 0.7));
  const cheekJit = round2(deterministicJitter(drawStep, 43, 0.5));

  // Expressive classic Disney eyes (`data-part="eyes"`)
  let eyesMarkup: string;
  if (eyeMode === 'blink' || eyeMode === 'happy') {
    const isHappy = eyeMode === 'happy';
    const arcY = isHappy ? -9.2 : -7.6;
    const baseY = isHappy ? -5.0 : -5.6;
    eyesMarkup = svgEl('g', { 'data-part': 'eyes', 'data-eyes': 'closed' }, [
      svgEl('path', {
        d: `M -4.8 ${baseY} Q -1.2 ${arcY}, 2.4 ${baseY}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: `M 8.2 ${baseY} Q 11.4 ${arcY}, 14.6 ${baseY}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        `M -4.8 ${baseY} L -6.6 ${round2(baseY - 1.2)} M 14.6 ${baseY} L 16.4 ${round2(baseY - 1.2)}`,
        { strokeWidth: s.xeroxFine, opacity: 0.88 }
      ),
    ]);
  } else {
    const wideEye = eyeMode === 'curious';
    const lookUp = eyeMode === 'looking_up';
    const grumpyEye = eyeMode === 'grumpy';

    const eyeLeftD = wideEye
      ? 'M -4.9 -5.8 C -4.9 -9.8, -1.5 -10.8, 1.5 -9.0 C 2.8 -7.4, 2.4 -2.8, -0.8 -2.2 C -3.8 -1.8, -4.9 -3.4, -4.9 -5.8 Z'
      : 'M -4.7 -5.6 C -4.7 -9.2, -1.5 -10.2, 1.4 -8.6 C 2.6 -7.2, 2.2 -3.0, -0.8 -2.5 C -3.6 -2.2, -4.7 -3.6, -4.7 -5.6 Z';
    const eyeRightD = wideEye
      ? 'M 8.4 -8.8 C 11.0 -10.6, 14.4 -9.6, 14.6 -5.6 C 14.6 -3.2, 13.4 -1.8, 10.8 -2.2 C 8.0 -2.8, 7.6 -7.2, 8.4 -8.8 Z'
      : 'M 8.5 -8.4 C 11.0 -10.0, 14.2 -9.0, 14.4 -5.5 C 14.4 -3.4, 13.2 -2.2, 10.8 -2.5 C 8.2 -3.0, 7.8 -7.0, 8.5 -8.4 Z';

    const pupilDx = wideEye ? 0.8 : 0.55;
    const pupilDy = lookUp ? -1.3 : wideEye ? -0.65 : 0.1;
    const eyeClipL = `${pfx}-eye-l`;
    const eyeClipR = `${pfx}-eye-r`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes', 'data-eyes': 'open' }, [
      svgEl('clipPath', { id: eyeClipL }, svgEl('path', { d: eyeLeftD })),
      svgEl('clipPath', { id: eyeClipR }, svgEl('path', { d: eyeRightD })),

      // Left (near-side) flat cel eye
      svgEl('path', { d: eyeLeftD, fill: c.celCream, stroke: 'none' }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipL) }, [
        svgEl('ellipse', {
          cx: round2(-1.2 + pupilDx),
          cy: round2(-5.8 + pupilDy),
          rx: 2.35,
          ry: 2.9,
          fill: c.mochiEyeIris,
        }),
        svgEl('ellipse', {
          cx: round2(-1.2 + pupilDx),
          cy: round2(-6.0 + pupilDy),
          rx: 1.65,
          ry: 2.15,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(-2.0 + pupilDx),
          cy: round2(-7.1 + pupilDy),
          r: wideEye ? 0.95 : 0.8,
          fill: c.celCream,
        }),
        grumpyEye
          ? svgEl('path', {
              d: 'M -6 -11.5 L 4 -11.5 L 4 -6.0 L -6 -8.0 Z',
              fill: c.biscuitFurBase,
              ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
            })
          : !wideEye && !lookUp
          ? svgEl('path', {
              d: 'M -6 -11.5 L 4 -11.5 L 4 -8.6 Q -1.2 -7.6, -6 -8.6 Z',
              fill: c.biscuitFurBase,
              ...celStrokeAttrs({ strokeWidth: 1.05, useXeroxFilter: true }),
            })
          : '',
      ]),
      svgEl('path', {
        d: eyeLeftD,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: grumpyEye
          ? 'M -5.4 -7.8 L 2.2 -5.8'
          : 'M -5.4 -6.6 C -4.6 -9.8, -1.4 -10.8, 1.8 -8.8',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M -4.8 -7.4 L -6.5 -8.5', {
        strokeWidth: s.xeroxFine,
        opacity: 0.86,
      }),

      // Right (far-side) flat cel eye
      svgEl('path', { d: eyeRightD, fill: c.celCream, stroke: 'none' }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipR) }, [
        svgEl('ellipse', {
          cx: round2(11.3 + pupilDx),
          cy: round2(-5.8 + pupilDy),
          rx: 2.15,
          ry: 2.85,
          fill: c.mochiEyeIris,
        }),
        svgEl('ellipse', {
          cx: round2(11.3 + pupilDx),
          cy: round2(-6.0 + pupilDy),
          rx: 1.55,
          ry: 2.1,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: round2(10.6 + pupilDx),
          cy: round2(-7.1 + pupilDy),
          r: wideEye ? 0.9 : 0.78,
          fill: c.celCream,
        }),
        grumpyEye
          ? svgEl('path', {
              d: 'M 7 -11.5 L 16 -11.5 L 16 -8.0 L 7 -6.0 Z',
              fill: c.biscuitFurBase,
              ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
            })
          : !wideEye && !lookUp
          ? svgEl('path', {
              d: 'M 7 -11.5 L 16 -11.5 L 16 -8.6 Q 11.4 -7.6, 7 -8.6 Z',
              fill: c.biscuitFurBase,
              ...celStrokeAttrs({ strokeWidth: 1.05, useXeroxFilter: true }),
            })
          : '',
      ]),
      svgEl('path', {
        d: eyeRightD,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      svgEl('path', {
        d: grumpyEye
          ? 'M 8.0 -5.8 L 15.0 -7.8'
          : 'M 8.2 -8.6 C 11.0 -10.6, 14.2 -9.4, 15.0 -6.4',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 14.4 -7.2 L 16.0 -8.3', {
        strokeWidth: s.xeroxFine,
        opacity: 0.86,
      }),
    ]);
  }

  // Expressive floating sketchy Xerox eyebrows
  const browMarkup = isGrumpy
    ? xeroxSketchStroke('M -5.4 -11.2 L 1.6 -9.0 M 14.8 -11.2 L 8.2 -9.0', {
        stroke: c.xeroxInk,
        strokeWidth: 1.65,
        feather: true,
        opacity: 0.94,
      })
    : xeroxSketchStroke(
        isCurious || eyeMode === 'looking_up'
          ? 'M -5.2 -12.4 Q -1.6 -14.8, 1.6 -12.2 M 8.6 -12.4 Q 11.4 -14.6, 14.4 -11.8'
          : speaking || isWaving
          ? 'M -5.0 -11.6 Q -1.6 -13.6, 1.4 -11.6 M 8.8 -11.6 Q 11.4 -13.4, 14.0 -11.2'
          : 'M -4.8 -11.0 Q -1.6 -12.6, 1.2 -11.0 M 9.0 -11.0 Q 11.4 -12.6, 13.8 -10.8',
        { stroke: c.xeroxInk, strokeWidth: 1.4, feather: true, opacity: 0.9 }
      );

  // Shaggy Goldendoodle head silhouette with organic crown curls & tufted cheeks
  const headOutlineD = [
    'M -14.2 -7.8',
    'C -16.8 -13.8, -11.8 -18.0, -7.2 -16.4',
    `L ${round2(-4.2 + crownJitX * 0.5)} ${round2(-20.4 + crownJitY)} L -0.4 -17.2`,
    `L ${round2(3.8 + crownJitX * 0.65)} ${round2(-20.8 - crownJitY * 0.6)} L 7.2 -16.6`,
    'C 12.2 -18.0, 17.0 -13.0, 16.0 -6.8',
    `C 19.2 -2.8, ${round2(19.4 + cheekJit * 0.4)} 4.0, 15.2 9.2`,
    'C 12.0 13.0, 4.4 13.8, -2.0 13.0',
    `L ${round2(-5.4 - cheekJit * 0.35)} 13.6 L -8.2 11.8`,
    `C -12.8 11.6, -15.8 8.0, -16.4 3.6`,
    `L ${round2(-18.6 - cheekJit * 0.45)} 0.8 L -16.4 -2.2`,
    'C -17.6 -4.6, -16.4 -6.6, -14.2 -7.8 Z',
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
        pivotY: 12,
      }),
    },
    [
      // Far right feathered russet floppy ear (behind muzzle side, `+X`)
      svgEl(
        'g',
        {
          'data-part': 'right-ear',
          transform: svgTransform({
            rotate: round2(-earBounce * 0.72 + earLag * 0.6 + earJitR * 1.4),
            pivotX: 11,
            pivotY: -10,
          }),
        },
        [
          celPath(
            'M 9.2 -13.0 C 15.0 -14.2, 20.8 -8.0, 21.8 -1.0 C 22.8 4.2, 20.8 9.2, 16.8 11.2 L 15.0 9.6 L 13.2 11.4 C 11.4 10.6, 10.6 8.4, 10.2 5.4 C 9.4 1.0, 9.2 -5.0, 9.2 -13.0 Z',
            c.biscuitEarRusset,
            { strokeWidth: s.xeroxMedium }
          ),
          xeroxSketchStroke(
            'M 14.8 -6.4 Q 17.6 -1.2, 16.6 4.4 M 18.2 -3.4 Q 19.8 1.6, 18.4 7.0',
            { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.84 }
          ),
        ]
      ),

      // Main flat matte cel shaggy Goldendoodle head
      celPath(headOutlineD, c.biscuitFurBase, { strokeWidth: s.xeroxHeavy }),

      // Raw Xerox pencil fur-tuft construction strokes on forehead, crown & cheeks
      xeroxSketchStroke(
        'M -8.4 -13.4 Q -5.0 -16.2, -1.8 -13.2 M 2.6 -14.0 Q 5.8 -16.6, 9.0 -13.4 M -12.6 4.4 Q -10.0 7.2, -7.2 5.4 M -14.8 -0.8 L -11.6 0.2',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
      ),

      // Near left feathered russet floppy ear (prominent on `-X` side)
      svgEl(
        'g',
        {
          'data-part': 'left-ear',
          transform: svgTransform({
            rotate: round2(earBounce + earLag + earJitL * 1.6),
            pivotX: -12,
            pivotY: -10,
          }),
        },
        [
          celPath(
            'M -10.0 -12.2 C -17.2 -13.2, -23.2 -6.0, -24.2 2.2 C -25.0 7.2, -22.2 12.2, -18.2 14.2 L -16.2 12.0 L -14.2 13.8 C -12.6 12.6, -11.6 10.6, -10.8 8.0 C -9.2 3.2, -8.4 -4.6, -10.0 -12.2 Z',
            c.biscuitEarRusset,
            { strokeWidth: s.xeroxMedium }
          ),
          // Feathered shaggy graphite fur strokes on near ear
          xeroxSketchStroke(
            'M -17.2 -6.4 Q -20.2 0.2, -18.6 7.4 M -14.0 -3.2 Q -16.2 3.0, -14.4 9.2 M -20.4 4.2 Q -21.4 8.2, -19.6 11.4',
            { stroke: c.xeroxInk, strokeWidth: s.sketchLine, feather: true, opacity: 0.84 }
          ),
        ]
      ),

      // Fluffy lighter golden-apricot teddy-bear muzzle shifted 3/4 right (`+X`)
      celPath(
        'M -2.2 -1.8 C 0.0 -7.0, 13.2 -7.0, 16.2 -1.8 C 19.2 1.2, 18.2 7.2, 13.2 9.4 L 11.0 10.6 L 9.2 9.6 C 5.8 11.4, 1.4 10.6, -1.2 8.2 C -4.2 5.8, -4.2 1.0, -2.2 -1.8 Z',
        c.biscuitFurLight,
        { strokeWidth: s.xeroxFine }
      ),
      // Shaggy muzzle beard & cheek graphite ticks
      xeroxSketchStroke(
        'M 0.8 9.2 Q 3.0 11.4, 5.2 9.8 M 9.4 9.6 Q 11.6 11.0, 13.2 9.0 M -1.0 2.0 L 1.2 1.6',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),

      // Soft flat dusty-rose cheek blush (matte analog cel paint)
      svgEl('ellipse', {
        cx: -5.4,
        cy: 2.0,
        rx: 3.1,
        ry: 1.9,
        fill: c.dustyRose,
        opacity: 0.4,
      }),
      svgEl('ellipse', {
        cx: 15.2,
        cy: 1.6,
        rx: 2.3,
        ry: 1.6,
        fill: c.dustyRose,
        opacity: 0.36,
      }),

      // Expressive classic Disney eyes & floating eyebrows
      eyesMarkup,
      browMarkup,

      // Dark charcoal button nose with crisp flat parchment gleam
      svgEl('g', { 'data-part': 'nose' }, [
        celPath(
          'M 4.4 -3.2 C 6.2 -4.4, 9.8 -4.4, 11.4 -3.1 C 12.4 -2.2, 11.4 0.4, 8.0 0.8 C 4.8 0.5, 3.6 -2.0, 4.4 -3.2 Z',
          c.xeroxInk,
          { strokeWidth: s.xeroxFine }
        ),
        svgEl('ellipse', {
          cx: 7.2,
          cy: -2.5,
          rx: 1.35,
          ry: 0.72,
          fill: c.celCream,
          opacity: 0.82,
        }),
        xeroxSketchStroke('M 6.8 -4.8 Q 8.0 -5.4, 9.2 -4.8', {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.8,
          opacity: 0.7,
        }),
      ]),

      // 4-stage 12 FPS cel lip-sync mouth or resting puppy smile
      renderClassicDogMouth({
        cx: 7.6,
        cy: 4.1,
        speaking,
        isSinging,
        isWaving,
        isCurious,
        isGrumpy,
        frameIndex,
      }),
    ]
  );
}

/**
 * Renders Biscuit's signature crimson-red triangular bandana (`bandanaRed`) with crisp
 * flat matte fold shadow (`bandanaRedShadow`), knotted tie tail fluttering behind-left
 * of neck, and sketchy Xerox cloth crease ticks.
 */
function renderClassicRedBandana(opts: {
  pfx: string;
  tx: number;
  ty: number;
  scaleX: number;
  tieFlutter: number;
}): string {
  const { pfx, tx, ty, scaleX, tieFlutter } = opts;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const mainTriangleD =
    'M -11.2 -4.0 C -2.0 -1.0, 8.2 -2.0, 15.2 -6.0 C 17.2 -2.0, 15.0 7.2, 8.0 16.2 C 2.8 13.0, -6.2 7.0, -11.2 -4.0 Z';
  const tieTailD = `M -11.0 -4.0 C -17.0 ${round2(-8.2 + tieFlutter)}, -23.2 ${round2(-6.2 + tieFlutter)}, -25.0 ${round2(-2.0 + tieFlutter)} C -20.0 ${round2(-1.0 + tieFlutter * 0.5)}, -15.0 0.0, -10.0 1.2 Z`;

  return svgEl(
    'g',
    {
      'data-part': 'red-bandana',
      transform: svgTransform({ x: tx, y: ty, scaleX, scaleY: 1 }),
    },
    [
      // Fluttering crimson tie tail behind-left of neck
      celPath(tieTailD, c.bandanaRed, { strokeWidth: s.xeroxFine }),
      xeroxSketchStroke(
        `M -13.2 -2.2 Q -18.0 ${round2(-3.8 + tieFlutter * 0.65)}, -22.2 ${round2(-2.6 + tieFlutter * 0.8)}`,
        { stroke: c.bandanaRedShadow, strokeWidth: 1.05, broken: true, opacity: 0.85 }
      ),
      // Bandana knot bun
      celPath(
        'M -12.2 -5.0 C -9.0 -6.0, -7.0 -2.0, -9.0 1.0 C -12.0 2.0, -14.0 -2.0, -12.2 -5.0 Z',
        c.bandanaRed,
        { strokeWidth: s.xeroxFine }
      ),
      // Main draped crimson triangular bandana with crisp 2-tone matte cel fold shadow
      celShadedShape({
        d: mainTriangleD,
        baseFill: c.bandanaRed,
        shadowFill: c.bandanaRedShadow,
        shadowPaths: [
          'M -12.0 -1.0 C -3.0 3.0, 6.0 3.2, 16.2 -1.2 L 17.0 18.0 L -13.0 18.0 Z',
        ],
        shadowOpacity: 0.42,
        clipId: `${pfx}-bandana`,
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
      }),
      // Hand-inked crimson cloth fold creases
      xeroxSketchStroke('M -8.0 -1.8 Q 3.0 3.2, 13.0 -2.8 M -3.8 3.2 Q 4.2 8.2, 11.2 4.2', {
        stroke: c.bandanaRedShadow,
        strokeWidth: 1.45,
        feather: true,
        opacity: 0.9,
      }),
    ]
  );
}

/**
 * Renders a shaggy Goldendoodle puppy leg in flat matte cel paint with right-pointing (`+X`)
 * paw, parchment-cream toe tips (`celCream` / `mochiCreamShadow`), and Xerox fur/toe ticks.
 */
function renderClassicPuppyLeg(opts: ClassicPuppyLegOptions): string {
  const {
    partName,
    pivotX,
    pivotY,
    rotate = 0,
    length,
    width = 9.4,
    isFar = false,
    isHind = false,
  } = opts;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const legFill = isFar ? c.biscuitFurShadow : c.biscuitFurBase;
  const pawFill = isFar ? c.mochiCreamShadow : c.celCream;
  const halfW = round2(width / 2);
  const footY = round2(pivotY + length);

  // Slight organic hock curve on hind legs (classic *Fox and the Hound* canine anatomy)
  const legD = isHind
    ? `M ${round2(pivotX - halfW)} ${round2(pivotY)} L ${round2(pivotX + halfW)} ${round2(pivotY)} C ${round2(pivotX + halfW + 1.0)} ${round2(pivotY + length * 0.42)}, ${round2(pivotX + halfW - 0.6)} ${round2(footY - 6.0)}, ${round2(pivotX + halfW + 3.6)} ${round2(footY - 3.4)} C ${round2(pivotX + halfW + 5.2)} ${round2(footY - 1.2)}, ${round2(pivotX + halfW + 4.2)} ${round2(footY)}, ${round2(pivotX + halfW + 1.8)} ${round2(footY)} L ${round2(pivotX - halfW + 0.4)} ${round2(footY)} C ${round2(pivotX - halfW - 1.6)} ${round2(footY)}, ${round2(pivotX - halfW - 1.6)} ${round2(footY - 4.2)}, ${round2(pivotX - halfW - 2.2)} ${round2(pivotY + length * 0.52)} C ${round2(pivotX - halfW - 2.4)} ${round2(pivotY + length * 0.28)}, ${round2(pivotX - halfW - 0.8)} ${round2(pivotY + length * 0.14)}, ${round2(pivotX - halfW)} ${round2(pivotY)} Z`
    : `M ${round2(pivotX - halfW)} ${round2(pivotY)} L ${round2(pivotX + halfW)} ${round2(pivotY)} C ${round2(pivotX + halfW + 1.4)} ${round2(pivotY + length * 0.45)}, ${round2(pivotX + halfW + 0.5)} ${round2(footY - 5.0)}, ${round2(pivotX + halfW + 3.8)} ${round2(footY - 3.2)} C ${round2(pivotX + halfW + 5.2)} ${round2(footY - 1.2)}, ${round2(pivotX + halfW + 4.2)} ${round2(footY)}, ${round2(pivotX + halfW + 1.8)} ${round2(footY)} L ${round2(pivotX - halfW + 0.5)} ${round2(footY)} C ${round2(pivotX - halfW - 1.4)} ${round2(footY)}, ${round2(pivotX - halfW - 1.4)} ${round2(footY - 4.0)}, ${round2(pivotX - halfW - 0.8)} ${round2(pivotY + length * 0.5)} Z`;

  const pawToeD = `M ${round2(pivotX + halfW - 0.6)} ${round2(footY - 3.6)} C ${round2(pivotX + halfW + 3.8)} ${round2(footY - 3.6)}, ${round2(pivotX + halfW + 5.0)} ${round2(footY - 1.4)}, ${round2(pivotX + halfW + 2.6)} ${round2(footY)} L ${round2(pivotX + halfW - 1.0)} ${round2(footY)} Z`;

  return svgEl(
    'g',
    {
      'data-part': partName,
      transform: svgTransform({ rotate, pivotX, pivotY }),
    },
    [
      celPath(legD, legFill, { strokeWidth: s.xeroxMedium }),
      // Shaggy leg fur-tuft construction stroke
      xeroxSketchStroke(
        `M ${round2(pivotX - halfW * 0.35)} ${round2(pivotY + length * 0.44)} Q ${round2(pivotX + halfW * 0.25)} ${round2(pivotY + length * 0.54)}, ${round2(pivotX - halfW * 0.15)} ${round2(pivotY + length * 0.66)}`,
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),
      // Cream-white paw toe tips pointing right (`+X`)
      celPath(pawToeD, pawFill, { strokeWidth: s.xeroxFine }),
      // Sketchy toe divider ticks
      xeroxSketchStroke(
        `M ${round2(pivotX + halfW + 1.5)} ${round2(footY - 2.3)} L ${round2(pivotX + halfW + 1.8)} ${round2(footY - 0.2)} M ${round2(pivotX + halfW + 3.1)} ${round2(footY - 1.9)} L ${round2(pivotX + halfW + 3.3)} ${round2(footY - 0.3)}`,
        { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
      ),
    ]
  );
}

/**
 * Renders Biscuit's wagging shaggy golden-apricot tail (`-X`) with russet feathered tip
 * and organic overlapping pencil wobble.
 */
function renderClassicWaggingTail(opts: {
  pivotX: number;
  pivotY: number;
  basePath: string;
  tipPath: string;
  sketchPath: string;
  rotate: number;
}): string {
  const { pivotX, pivotY, basePath, tipPath, sketchPath, rotate } = opts;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  return svgEl(
    'g',
    {
      'data-part': 'tail',
      transform: svgTransform({ rotate, pivotX, pivotY }),
    },
    [
      celPath(basePath, c.biscuitFurBase, { strokeWidth: s.xeroxMedium }),
      celPath(tipPath, c.biscuitEarRusset, { strokeWidth: s.xeroxFine }),
      xeroxSketchStroke(sketchPath, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.82,
      }),
    ]
  );
}

/**
 * Renders Biscuit (`'bandana_dog'`) in Authentic 1970s–1980s Classic Disney Hand-Drawn Cel Style:
 * - Inspired by *Robin Hood* (1973) and *The Fox and the Hound* (1981)
 * - 100% FLAT OPAQUE MATTE ANALOG CEL PAINT (zero digital gradients, zero crayon patterns,
 *   zero neon glow) + raw electrostatic `#xerox-ink` outlines and broken `xeroxSketchStroke`
 *   pencil construction ticks on shaggy Goldendoodle fur, floppy ears, bandana folds, and paws
 * - Photo-modeled visual signature: shaggy golden-apricot fur (`biscuitFurBase`/`biscuitFurShadow`),
 *   lighter teddy-bear muzzle (`biscuitFurLight`), russet feathered floppy ears & tail tip
 *   (`biscuitEarRusset`), crimson triangular bandana (`bandanaRed`/`bandanaRedShadow`) with
 *   fluttering knotted tie, fluffy parchment-cream chest blaze (`celCream`), and cream toe tips
 * - Smooth 12 FPS ("on twos") motion with squash-and-stretch, overlapping ear/tail/tie bounce,
 *   and mandatory 4-stage cel lip-sync active across ALL poses
 *
 * Local coordinate system: ground feet at `y = 0`, centered horizontally at `x = 0`.
 * Local SVG bounds: `x: -48..48`, `y: -86..2` (`width: 96`, `height: 88`).
 */
export function renderClassicBandanaDog(options: CharacterRenderOptions): string {
  const { state = 'idle', frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const drawStep = Math.floor(frameIndex / 2);
  const speakingActive = state === 'singing' || Boolean(isSpeaking);

  const tailJitX = round2(deterministicJitter(drawStep, 51, 0.9));
  const tailJitY = round2(deterministicJitter(drawStep, 59, 0.8));
  const bodyJitY = round2(deterministicJitter(drawStep, 67, 0.45));

  // ---------------------------------------------------------------------------
  // 1. SLEEPING / SLEEPY: Cozy Curled Nap Pose
  // ---------------------------------------------------------------------------
  if (state === 'sleeping' || state === 'sleepy') {
    const breath = round2(steppedOscillate(frameIndex, 24, 1.1));
    const breathScaleX = round2(1 + steppedOscillate(frameIndex, 24, 0.018));
    const breathScaleY = round2(1 - steppedOscillate(frameIndex, 24, 0.022));
    const earLag = round2(steppedOscillate(frameIndex, 24, 0.9, -3));
    const zFloat = round2(steppedOscillate(frameIndex, 20, 2.4));
    const zDriftX = round2(steppedOscillate(frameIndex, 28, 1.8));

    const sleepBodyD = `M -30.0 -3.8 C -34.0 -21.8, -16.0 ${round2(-34.6 - breath)}, 4.0 ${round2(-32.8 - breath)} C 20.0 ${round2(-30.8 - breath)}, 27.6 -17.8, 23.6 -3.8 C 20.6 0.8, -24.0 1.4, -30.0 -3.8 Z`;

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-art-style': 'classic_cel',
        'data-state': state,
        'data-facing': 'right',
      },
      [
        // Grounded soft contact shadow
        celContactShadow(-2.0, 0.3, 31.0, 1.7, 0.3),

        // Curled breathing body
        svgEl(
          'g',
          {
            'data-part': 'sleeping-body',
            transform: svgTransform({
              y: round2(-breath * 0.35),
              scaleX: breathScaleX,
              scaleY: breathScaleY,
            }),
          },
          [
            celShadedShape({
              d: sleepBodyD,
              baseFill: c.biscuitFurBase,
              shadowFill: c.biscuitFurShadow,
              shadowPaths: [
                'M -32.0 -10.0 C -14.0 -5.0, 10.0 -6.0, 26.0 -11.0 L 26.0 3.0 L -32.0 3.0 Z',
              ],
              shadowOpacity: 0.45,
              clipId: `${pfx}-sleep-body`,
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxHeavy,
            }),
            // Shaggy back fur curl ticks
            xeroxSketchStroke(
              'M -20.0 -20.2 Q -14.0 -24.8, -8.2 -20.0 M -4.2 -23.0 Q 1.8 -26.8, 7.8 -21.8 M -16.0 -10.4 Q -10.0 -14.0, -4.2 -10.2',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
            ),
            // Fluffy parchment-cream chest tuft tucked near neck
            celPath(
              'M 4.0 -14.0 C 9.0 -18.0, 16.0 -14.0, 15.0 -4.2 C 11.0 -2.0, 5.2 -4.2, 4.0 -14.0 Z',
              c.celCream,
              { strokeWidth: s.xeroxFine }
            ),
            // Crimson bandana draped snugly around sleeping neck
            celShadedShape({
              d: 'M -2.0 -22.0 C 6.0 -20.0, 14.0 -21.0, 18.0 -24.0 C 18.0 -16.0, 13.0 -10.0, 6.0 -8.0 C 2.0 -12.0, -2.0 -16.0, -2.0 -22.0 Z',
              baseFill: c.bandanaRed,
              shadowFill: c.bandanaRedShadow,
              shadowPaths: ['M -2.0 -16.5 Q 8.0 -12.0, 19.0 -17.0 L 19.0 -6.0 L -2.0 -6.0 Z'],
              shadowOpacity: 0.4,
              clipId: `${pfx}-sleep-bandana`,
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxMedium,
            }),
            xeroxSketchStroke('M 1.0 -18.0 Q 8.0 -14.2, 15.0 -18.0', {
              stroke: c.bandanaRedShadow,
              strokeWidth: 1.35,
              opacity: 0.88,
            }),
          ]
        ),

        // Curled shaggy russet-tipped tail wrapped on left
        celPath(
          `M -28.0 -5.0 C -37.0 -8.0, -40.0 -19.0, ${round2(-31.0 + tailJitX * 0.4)} -20.0 C -26.0 -20.0, -24.0 -12.0, -14.0 -6.0 C -10.0 -3.0, -18.0 0.8, -28.0 -5.0 Z`,
          c.biscuitEarRusset,
          { strokeWidth: s.xeroxMedium }
        ),
        xeroxSketchStroke('M -32.2 -13.0 Q -28.0 -10.0, -22.0 -8.0', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }),

        // Front paws tucked underneath chin with cream toe tips pointing `+X`
        celPath(
          'M 10.0 -6.0 L 28.0 -6.0 C 33.8 -6.0, 34.8 0, 29.0 0 L 10.0 0 Z',
          c.biscuitFurBase,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M 25.0 -5.6 C 31.0 -5.6, 34.0 -2.4, 31.0 0 L 24.0 0 Z',
          c.celCream,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke('M 27.6 -2.6 L 27.8 -0.2 M 30.0 -2.2 L 30.2 -0.2', {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),

        // Peaceful resting Goldendoodle head (`data-part="head"`)
        svgEl(
          'g',
          {
            'data-part': 'head',
            transform: svgTransform({ y: round2(-breath * 0.3) }),
          },
          [
            celPath(
              'M 3.0 -20.0 C 3.0 -31.0, 14.0 -34.0, 24.0 -30.0 C 32.0 -27.0, 35.6 -17.0, 31.8 -9.0 C 28.0 -4.0, 12.0 -4.0, 6.0 -9.0 C 2.0 -13.0, 2.0 -17.0, 3.0 -20.0 Z',
              c.biscuitFurBase,
              { strokeWidth: s.xeroxHeavy }
            ),
            // Lighter golden sleeping muzzle
            celPath(
              'M 18.0 -17.0 C 24.0 -20.0, 33.8 -18.0, 33.8 -12.0 C 33.8 -7.0, 24.0 -6.0, 18.0 -9.0 Z',
              c.biscuitFurLight,
              { strokeWidth: s.xeroxFine }
            ),
            // Feathered floppy russet ear draped softly along sleeping cheek
            svgEl(
              'g',
              {
                'data-part': 'left-ear',
                transform: svgTransform({ rotate: earLag, pivotX: 10, pivotY: -26 }),
              },
              [
                celPath(
                  'M 10.0 -28.0 C 3.0 -26.0, -1.0 -16.0, 2.0 -8.0 C 6.0 -6.0, 12.0 -9.0, 13.0 -16.0 C 14.0 -22.0, 13.0 -26.0, 10.0 -28.0 Z',
                  c.biscuitEarRusset,
                  { strokeWidth: s.xeroxMedium }
                ),
                xeroxSketchStroke('M 6.8 -22.0 Q 5.2 -16.0, 6.4 -10.5 M 9.6 -20.0 Q 8.6 -15.0, 9.5 -10.5', {
                  stroke: c.xeroxInkSoft,
                  strokeWidth: s.sketchLine,
                  broken: true,
                }),
              ]
            ),
            // Closed peaceful sleeping eye arcs (`data-part="eyes"`)
            svgEl('g', { 'data-part': 'eyes', 'data-eyes': 'closed' }, [
              svgEl('path', {
                d: 'M 15.0 -20.0 Q 18.4 -17.4, 21.8 -20.0 M 25.0 -19.5 Q 27.8 -17.4, 30.2 -19.5',
                fill: 'none',
                ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
              }),
              xeroxSketchStroke('M 15.0 -20.0 L 13.4 -19.0 M 30.2 -19.5 L 31.6 -18.6', {
                strokeWidth: s.sketchLine,
              }),
            ]),
            // Dark charcoal sleeping button nose with soft cream gleam
            svgEl('g', { 'data-part': 'nose' }, [
              svgEl('ellipse', {
                cx: 28.4,
                cy: -14.6,
                rx: 3.0,
                ry: 2.1,
                fill: c.xeroxInk,
              }),
              svgEl('ellipse', {
                cx: 27.8,
                cy: -15.2,
                rx: 1.0,
                ry: 0.55,
                fill: c.celCream,
                opacity: 0.78,
              }),
            ]),
            // Mouth: supports 4-stage cel lip-sync even if sleep-talking, otherwise peaceful smile
            speakingActive
              ? renderClassicDogMouth({
                  cx: 25.5,
                  cy: -10.8,
                  speaking: true,
                  isSinging: false,
                  isWaving: false,
                  isCurious: false,
                  isGrumpy: false,
                  frameIndex,
                })
              : svgEl('g', { 'data-part': 'mouth' }, [
                  svgEl('path', {
                    d: 'M 22.0 -11.0 Q 25.8 -9.0, 29.8 -11.4',
                    fill: 'none',
                    ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
                  }),
                ]),
          ]
        ),

        // Floating hand-lettered serif 'z Z' nap marks
        svgEl(
          'text',
          {
            'data-part': 'sleep-zzz',
            x: round2(22 + zDriftX),
            y: round2(-36 + zFloat),
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

  // ---------------------------------------------------------------------------
  // 2. SITTING: Iconic 3/4 Photo Pose Facing RIGHT (`+X`)
  // ---------------------------------------------------------------------------
  if (state === 'sitting') {
    const tailWag = steppedOscillate(frameIndex, 10, 12);
    const tailLag = steppedOscillate(frameIndex, 10, 3.2, -2);
    const breatheBob = round2(
      speakingActive
        ? Math.abs(steppedOscillate(frameIndex, 10, 1.4))
        : steppedOscillate(frameIndex, 22, 0.85)
    );
    const poseStretch = speakingActive
      ? steppedOscillate(frameIndex, 10, 0.022)
      : steppedOscillate(frameIndex, 22, 0.012);
    const sitScaleX = round2(1 - poseStretch);
    const sitScaleY = round2(1 + poseStretch);
    const headBob = speakingActive
      ? steppedOscillate(frameIndex, 10, 3.2)
      : steppedOscillate(frameIndex, 20, 2.0);
    const earBounce = steppedOscillate(frameIndex, 12, 3.2);
    const earLag = steppedOscillate(frameIndex, 12, 1.8, -2);
    const tieFlutter = steppedOscillate(frameIndex, 12, 1.6, -2);
    const blink = isSteppedBlinkFrame(frameIndex, 36, 2);

    const sitTorsoD =
      'M -18.0 -24.0 C -20.0 -39.0, -8.0 -51.0, 8.0 -50.0 C 20.0 -49.0, 25.0 -36.0, 22.0 -20.0 C 19.0 -8.0, 12.0 -5.0, -6.0 -5.0 C -16.0 -5.0, -18.0 -14.0, -18.0 -24.0 Z';

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-art-style': 'classic_cel',
        'data-state': 'sitting',
        'data-facing': 'right',
      },
      [
        // Grounded soft contact shadow
        celContactShadow(0.5, 0.3, 27.5, 1.7, 0.32),

        // Animated flat-cel rig with gentle breathing squash-and-stretch
        svgEl(
          'g',
          {
            transform: svgTransform({
              y: round2(-breatheBob + bodyJitY * 0.4),
              scaleX: sitScaleX,
              scaleY: sitScaleY,
            }),
          },
          [
            // Shaggy wagging tail curling out behind on left (`-X`)
            renderClassicWaggingTail({
              pivotX: -22,
              pivotY: -10,
              rotate: tailWag,
              basePath: `M -21.0 -12.0 C -31.0 -11.0, -39.5 -17.0, ${round2(-44.6 + tailJitX + tailLag * 0.4)} ${round2(-25.8 + tailJitY)} C ${round2(-41.6 + tailJitX + tailLag * 0.4)} ${round2(-29.8 + tailJitY)}, -34.0 -24.0, -29.0 -19.0 C -26.0 -16.0, -21.0 -16.0, -19.0 -13.0 Z`,
              tipPath: `M -36.0 -18.0 C -40.8 -21.0, ${round2(-44.6 + tailJitX + tailLag * 0.4)} ${round2(-25.8 + tailJitY)}, ${round2(-41.6 + tailJitX + tailLag * 0.4)} ${round2(-28.8 + tailJitY)} C -37.8 -26.8, -35.0 -23.0, -33.0 -19.0 Z`,
              sketchPath: `M -34.0 -17.5 L -37.2 -19.8 M -28.0 -15.2 Q -25.0 -14.0, -22.4 -14.8`,
            }),

            // Tucked hind haunch on left (`-X`) with hind cream-tipped paw peeking forward
            celShadedShape({
              d: 'M -25.0 -14.0 C -28.0 -27.0, -18.0 -38.0, -6.0 -36.0 C -2.0 -26.0, -4.0 -10.0, -10.0 -3.0 C -18.0 -1.0, -24.0 -5.0, -25.0 -14.0 Z',
              baseFill: c.biscuitFurBase,
              shadowFill: c.biscuitFurShadow,
              shadowPaths: ['M -28.0 -14.0 C -22.0 -8.0, -12.0 -6.0, -2.0 -10.0 L -2.0 2.0 L -28.0 2.0 Z'],
              shadowOpacity: 0.45,
              clipId: `${pfx}-sit-haunch`,
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxMedium,
            }),
            celPath(
              'M -16.0 -6.0 L -4.0 -6.0 C 1.0 -6.0, 2.0 0, -3.0 0 L -15.0 0 C -18.0 0, -18.0 -6.0, -16.0 -6.0 Z',
              c.biscuitFurBase,
              { strokeWidth: s.xeroxMedium }
            ),
            celPath(
              'M -6.0 -5.5 C 0.0 -5.5, 2.0 -2.2, -1.5 0 L -6.0 0 Z',
              c.celCream,
              { strokeWidth: s.xeroxFine }
            ),
            xeroxSketchStroke('M -3.4 -2.4 L -3.2 -0.2 M -20.8 -18.2 Q -17.4 -21.4, -14.2 -18.4', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),

            // Proud seated shaggy torso
            celShadedShape({
              d: sitTorsoD,
              baseFill: c.biscuitFurBase,
              shadowFill: c.biscuitFurShadow,
              shadowPaths: [
                'M -20.0 -14.0 C -10.0 -11.0, 6.0 -11.0, 23.0 -16.0 L 24.0 0.0 L -20.0 0.0 Z',
              ],
              shadowOpacity: 0.4,
              clipId: `${pfx}-sit-torso`,
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxHeavy,
            }),
            // Shaggy fur-tuft construction strokes along flank
            xeroxSketchStroke(
              'M -14.2 -24.0 Q -10.0 -29.0, -6.0 -24.0 M -12.0 -15.0 Q -7.0 -19.0, -3.0 -15.0 M -6.0 -34.0 Q -2.0 -38.0, 2.0 -34.0',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
            ),

            // Prominent fluffy parchment-cream chest blaze peeking underneath red bandana
            celPath(
              'M 5.0 -39.0 C 13.0 -41.0, 21.0 -35.0, 21.0 -25.0 C 20.0 -18.0, 16.0 -13.0, 12.0 -11.0 L 9.4 -13.6 L 7.6 -16.8 C 5.2 -21.6, 3.0 -29.0, 5.0 -39.0 Z',
              c.celCream,
              { strokeWidth: s.xeroxFine }
            ),
            xeroxSketchStroke('M 9.2 -31.8 Q 12.6 -27.4, 11.0 -21.8 M 14.0 -29.6 Q 16.8 -24.8, 15.0 -19.0', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
              opacity: 0.68,
            }),

            // Far right front leg planted neatly at y = 0
            renderClassicPuppyLeg({
              partName: 'front-far-leg',
              pivotX: 18.5,
              pivotY: -26,
              rotate: -3,
              length: 26,
              width: 8.8,
              isFar: true,
            }),

            // Near front leg planted cleanly at y = 0
            renderClassicPuppyLeg({
              partName: 'front-near-leg',
              pivotX: 6.5,
              pivotY: -27,
              rotate: 2,
              length: 27,
              width: 9.4,
            }),

            // Signature crimson red bandana + fluttering knotted tie
            renderClassicRedBandana({
              pfx: `${pfx}-sit`,
              tx: 9,
              ty: -43,
              scaleX: 1.04,
              tieFlutter,
            }),

            // Shaggy Goldendoodle head
            renderClassicDogHead({
              pfx: `${pfx}-sit`,
              cx: 9,
              cy: -62,
              headTilt: headBob,
              earBounce,
              earLag,
              eyeMode: blink ? 'blink' : 'open',
              speaking: speakingActive,
              isSinging: false,
              isWaving: false,
              isCurious: false,
              isGrumpy: false,
              frameIndex,
            }),
          ]
        ),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // 3. WALKING: Lively 3/4 Bounding Puppy Trot/Gallop Facing RIGHT (`+X`)
  // ---------------------------------------------------------------------------
  if (state === 'walking') {
    // Fluid 12 FPS 8-frame bounding puppy stride with squash-and-stretch + overlapping follow-through
    const frontStride = steppedOscillate(frameIndex, 8, 23);
    const backStride = steppedOscillate(frameIndex, 8, 21, -1);
    const strideBob = round2(Math.abs(steppedOscillate(frameIndex, 8, 2.6)));
    const squashPulse = steppedOscillate(frameIndex, 4, 1);
    const walkScaleX = round2(1 + squashPulse * 0.032);
    const walkScaleY = round2(1 - squashPulse * 0.03);
    const earBounce = steppedOscillate(frameIndex, 8, 9.5);
    const earLag = steppedOscillate(frameIndex, 8, 3.8, -2);
    const tailWag = steppedOscillate(frameIndex, 8, 16);
    const tailTipLag = steppedOscillate(frameIndex, 8, 3.4, -2);
    const tieFlutter = steppedOscillate(frameIndex, 8, 2.8, -2);
    const headBob = round2(steppedOscillate(frameIndex, 8, 3.5, -1) + 2.8);
    const blink = isSteppedBlinkFrame(frameIndex, 36, 2);
    const shadowRx = round2(28.5 - strideBob * 0.65);

    const walkTorsoD =
      'M -26.8 -30.0 C -28.8 -44.0, -14.0 -49.0, 4.0 -48.0 C 18.0 -47.0, 25.8 -39.6, 23.8 -26.8 C 21.8 -17.8, 12.0 -16.2, -6.0 -17.0 C -19.0 -17.2, -25.8 -21.0, -26.8 -30.0 Z';

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-art-style': 'classic_cel',
        'data-state': 'walking',
        'data-facing': 'right',
        'data-walk-profile': 'true',
      },
      [
        // Grounded soft contact shadow shrinking subtly on bounding apex
        celContactShadow(-1.0, 0.3, shadowRx, 1.7, 0.32),

        // Animated flat-cel walking rig with squash-and-stretch
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
            // Streaming wagging shaggy tail behind on left (`-X`)
            renderClassicWaggingTail({
              pivotX: -25,
              pivotY: -34,
              rotate: tailWag,
              basePath: `M -24.0 -34.0 C -33.0 -37.0, -40.5 -43.5, ${round2(-45.4 + tailJitX + tailTipLag * 0.35)} ${round2(-48.6 + tailJitY)} C ${round2(-41.6 + tailJitX + tailTipLag * 0.35)} ${round2(-52.6 + tailJitY)}, -34.0 -45.8, -28.0 -40.8 C -25.0 -38.0, -22.0 -37.0, -21.0 -33.0 Z`,
              tipPath: `M -36.8 -41.8 C -41.6 -44.8, ${round2(-45.4 + tailJitX + tailTipLag * 0.35)} ${round2(-48.6 + tailJitY)}, ${round2(-41.6 + tailJitX + tailTipLag * 0.35)} ${round2(-51.6 + tailJitY)} C -37.8 -48.8, -35.0 -45.8, -34.0 -41.8 Z`,
              sketchPath: 'M -35.2 -41.4 L -38.4 -44.2 M -30.0 -38.2 Q -27.2 -37.2, -24.6 -37.8',
            }),

            // Back-far & front-far legs behind body (flat shadow fill for depth, paws pointing `+X`)
            renderClassicPuppyLeg({
              partName: 'back-far-leg',
              pivotX: -15,
              pivotY: -23,
              rotate: backStride,
              length: 23,
              width: 8.6,
              isFar: true,
              isHind: true,
            }),
            renderClassicPuppyLeg({
              partName: 'front-far-leg',
              pivotX: 16,
              pivotY: -24,
              rotate: -frontStride,
              length: 24,
              width: 8.6,
              isFar: true,
            }),

            // Energetic bounding 3/4 golden-apricot puppy torso with crisp underbelly shadow
            celShadedShape({
              d: walkTorsoD,
              baseFill: c.biscuitFurBase,
              shadowFill: c.biscuitFurShadow,
              shadowPaths: [
                'M -28.0 -25.0 C -14.0 -21.0, 8.0 -20.5, 25.0 -25.5 L 25.0 -14.0 L -28.0 -14.0 Z',
              ],
              shadowOpacity: 0.44,
              clipId: `${pfx}-walk-torso`,
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxHeavy,
            }),
            // Shaggy fur-tuft construction lines along bounding torso
            xeroxSketchStroke(
              'M -18.0 -36.0 Q -13.0 -40.8, -8.0 -36.0 M -4.0 -38.0 Q 1.0 -42.0, 6.0 -37.0 M -14.0 -26.0 Q -9.0 -29.6, -4.0 -26.0',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
            ),

            // Fluffy parchment-cream chest blaze peeking underneath bandana
            celPath(
              'M 10.0 -39.0 C 17.0 -39.0, 24.0 -34.0, 23.0 -25.0 C 21.0 -19.0, 15.0 -18.0, 11.0 -22.0 C 9.0 -27.0, 9.0 -34.0, 10.0 -39.0 Z',
              c.celCream,
              { strokeWidth: s.xeroxFine }
            ),
            xeroxSketchStroke('M 14.0 -32.0 Q 16.5 -28.0, 15.0 -23.5', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
              opacity: 0.65,
            }),

            // Back-near & front-near legs in foreground (opposition stride, paws pointing `+X`)
            renderClassicPuppyLeg({
              partName: 'back-near-leg',
              pivotX: -20,
              pivotY: -22,
              rotate: -backStride,
              length: 22,
              width: 9.2,
              isHind: true,
            }),
            renderClassicPuppyLeg({
              partName: 'front-near-leg',
              pivotX: 11,
              pivotY: -23,
              rotate: frontStride,
              length: 23,
              width: 9.2,
            }),

            // Crimson bandana & fluttering knotted tie tail
            renderClassicRedBandana({
              pfx: `${pfx}-walk`,
              tx: 14,
              ty: -41,
              scaleX: 0.98,
              tieFlutter,
            }),

            // Joyful 3/4 right-facing head leaning slightly forward into the trot
            renderClassicDogHead({
              pfx: `${pfx}-walk`,
              cx: 17.5,
              cy: -58.5,
              headTilt: headBob,
              earBounce,
              earLag,
              eyeMode: blink ? 'blink' : 'open',
              speaking: speakingActive,
              isSinging: false,
              isWaving: false,
              isCurious: false,
              isGrumpy: false,
              frameIndex,
            }),
          ]
        ),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // 4. STANDING FAMILY: idle, curious/awake, looking_up, waving/reaching/climbing,
  //    singing, blinking, grumpy, and any other standing state
  // ---------------------------------------------------------------------------
  const isWaving =
    state === 'waving' || state === 'reaching' || state === 'climbing';
  const isSinging = state === 'singing';
  const isCurious = state === 'curious' || state === 'awake';
  const isLookingUp = state === 'looking_up';
  const isGrumpy = state === 'grumpy';
  const isBlinking =
    state === 'blinking' || (!isCurious && !isLookingUp && isSteppedBlinkFrame(frameIndex, 36, 2));

  const tailPeriod = isWaving || isSinging ? 6 : isGrumpy ? 24 : 12;
  const tailAmp = isWaving || isSinging ? 17 : isGrumpy ? 3.5 : 11;
  const tailWag = steppedOscillate(frameIndex, tailPeriod, tailAmp);
  const tailTipLag = steppedOscillate(frameIndex, tailPeriod, isWaving || isSinging ? 3.5 : 1.8, -2);

  const hopY = isWaving
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.4)) + 0.8)
    : isSinging
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 1.8)))
    : round2(steppedOscillate(frameIndex, 20, 0.85) + bodyJitY * 0.4);

  const poseStretch = isWaving
    ? steppedOscillate(frameIndex, 8, 0.028)
    : isSinging || speakingActive
    ? steppedOscillate(frameIndex, 10, 0.022)
    : steppedOscillate(frameIndex, 20, 0.012);
  const standScaleX = round2(1 - poseStretch);
  const standScaleY = round2(1 + poseStretch);

  const headTilt = isCurious
    ? round2(-5.5 + steppedOscillate(frameIndex, 16, 4.5))
    : isLookingUp
    ? -8.5
    : isSinging
    ? round2(steppedOscillate(frameIndex, 8, 4.5) - 2.5)
    : isWaving
    ? round2(steppedOscillate(frameIndex, 8, 4.2) + 1.5)
    : isGrumpy
    ? round2(3.0 + steppedOscillate(frameIndex, 20, 1.0))
    : round2(steppedOscillate(frameIndex, 22, 2.0));

  const earBounce = isWaving || isSinging
    ? steppedOscillate(frameIndex, 8, 6.5)
    : isCurious
    ? -6.5
    : isGrumpy
    ? 4.0
    : steppedOscillate(frameIndex, 16, 2.4);
  const earLag = steppedOscillate(frameIndex, isWaving || isSinging ? 8 : 16, 2.0, -2);

  const tieFlutter = steppedOscillate(frameIndex, 12, isWaving || isSinging ? 2.4 : 1.2, -2);
  const wavePawAngle = round2(-66 + steppedOscillate(frameIndex, 8, 14));

  const eyeMode: DogEyeMode = isBlinking
    ? 'blink'
    : isGrumpy
    ? 'grumpy'
    : isLookingUp
    ? 'looking_up'
    : isCurious
    ? 'curious'
    : 'open';

  const standTorsoD =
    'M -26.0 -29.0 C -28.0 -44.0, -13.0 -49.0, 4.0 -49.0 C 18.0 -49.0, 25.0 -40.0, 24.0 -26.0 C 22.0 -17.0, 12.0 -16.0, -6.0 -17.0 C -19.0 -17.0, -25.0 -20.0, -26.0 -29.0 Z';

  return svgEl(
    'g',
    {
      'data-character': 'bandana_dog',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': 'right',
    },
    [
      // Grounded soft contact shadow
      celContactShadow(-1.0, 0.3, 28.5, 1.7, 0.32),

      // Animated flat-cel standing rig with gentle squash-and-stretch
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-hopY),
            scaleX: standScaleX,
            scaleY: standScaleY,
          }),
        },
        [
          // Happy wagging shaggy tail on left (`-X`)
          renderClassicWaggingTail({
            pivotX: -24,
            pivotY: -32,
            rotate: isGrumpy ? -14 + tailWag : tailWag,
            basePath: `M -23.0 -32.0 C -32.0 -34.0, -39.6 -39.8, ${round2(-44.6 + tailJitX + tailTipLag * 0.35)} ${round2(-47.8 + tailJitY)} C ${round2(-40.8 + tailJitX + tailTipLag * 0.35)} ${round2(-51.8 + tailJitY)}, -33.0 -44.8, -27.0 -39.0 C -24.0 -36.0, -21.0 -35.0, -20.0 -31.0 Z`,
            tipPath: `M -36.0 -41.0 C -40.8 -44.0, ${round2(-44.6 + tailJitX + tailTipLag * 0.35)} ${round2(-47.8 + tailJitY)}, ${round2(-40.8 + tailJitX + tailTipLag * 0.35)} ${round2(-50.8 + tailJitY)} C -37.0 -47.8, -34.0 -44.8, -33.0 -41.0 Z`,
            sketchPath: 'M -34.6 -40.4 L -37.8 -43.2 M -29.0 -36.8 Q -26.2 -35.8, -23.6 -36.2',
          }),

          // Back-far & front-far legs behind body (shadow fill for depth, toes pointing `+X`)
          renderClassicPuppyLeg({
            partName: 'back-far-leg',
            pivotX: -14,
            pivotY: -24,
            rotate: isWaving ? 6 : 2,
            length: 24,
            width: 8.6,
            isFar: true,
            isHind: true,
          }),
          renderClassicPuppyLeg({
            partName: 'front-far-leg',
            pivotX: 16,
            pivotY: -25,
            rotate: isWaving ? -4 : -2,
            length: 25,
            width: 8.8,
            isFar: true,
          }),

          // Shaggy standing golden-apricot puppy torso with crisp flat cel underbelly shadow
          celShadedShape({
            d: standTorsoD,
            baseFill: c.biscuitFurBase,
            shadowFill: c.biscuitFurShadow,
            shadowPaths: [
              'M -27.0 -25.0 C -13.0 -20.5, 8.0 -20.5, 25.0 -25.5 L 25.0 -14.0 L -27.0 -14.0 Z',
            ],
            shadowOpacity: 0.42,
            clipId: `${pfx}-stand-torso`,
            stroke: c.xeroxInk,
            strokeWidth: s.xeroxHeavy,
          }),
          // Shaggy internal Xerox pencil fur-tuft strokes across body
          xeroxSketchStroke(
            'M -18.0 -36.0 Q -13.0 -40.8, -8.0 -36.0 M -5.0 -38.0 Q 0.0 -42.0, 5.0 -37.0 M -14.0 -25.0 Q -9.0 -29.0, -4.0 -25.0 M -2.0 -26.0 Q 2.0 -29.0, 6.0 -25.0',
            { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
          ),

          // Prominent fluffy parchment-cream chest blaze peeking underneath red bandana
          celPath(
            'M 9.0 -40.0 C 17.0 -41.0, 24.0 -34.0, 23.0 -24.0 C 21.0 -18.0, 15.0 -16.0, 10.0 -20.0 C 7.0 -25.0, 7.0 -34.0, 9.0 -40.0 Z',
            c.celCream,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke(
            'M 13.0 -33.0 Q 16.0 -29.0, 14.0 -23.0 M 17.0 -31.0 Q 19.5 -27.0, 18.0 -22.0',
            { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.68 }
          ),

          // Back-near hind leg in foreground
          renderClassicPuppyLeg({
            partName: 'back-near-leg',
            pivotX: -19,
            pivotY: -23,
            rotate: isWaving ? -4 : -2,
            length: 23,
            width: 9.2,
            isHind: true,
          }),

          // Front-near leg: joyfully raised & waving when `isWaving`, otherwise planted neatly at y = 0
          isWaving
            ? svgEl('g', { 'data-part': 'waving-paw' }, [
                renderClassicPuppyLeg({
                  partName: 'front-near-leg',
                  pivotX: 12,
                  pivotY: -28,
                  rotate: wavePawAngle,
                  length: 24,
                  width: 9.2,
                }),
                // Classic Disney hand-inked kinetic motion ticks around raised waving paw
                xeroxSketchStroke(
                  'M 35.6 -39.4 L 39.0 -41.8 M 37.2 -34.2 L 40.8 -34.6 M 33.4 -43.2 L 35.6 -46.4',
                  { stroke: c.parchmentCream, strokeWidth: 1.35, opacity: 0.88 }
                ),
              ])
            : renderClassicPuppyLeg({
                partName: 'front-near-leg',
                pivotX: 10,
                pivotY: -24,
                rotate: 2,
                length: 24,
                width: 9.4,
              }),

          // Signature crimson-red bandana + fluttering knotted tie tail
          renderClassicRedBandana({
            pfx: `${pfx}-stand`,
            tx: 12,
            ty: -42,
            scaleX: 1.0,
            tieFlutter,
          }),

          // Expressive shaggy Goldendoodle head
          renderClassicDogHead({
            pfx: `${pfx}-stand`,
            cx: 13.5,
            cy: -60.5,
            headTilt,
            earBounce,
            earLag,
            eyeMode,
            speaking: speakingActive,
            isSinging,
            isWaving,
            isCurious,
            isGrumpy,
            frameIndex,
          }),
        ]
      ),
    ]
  );
}

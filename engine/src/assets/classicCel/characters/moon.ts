import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  celStrokeAttrs,
  deterministicJitter,
  gouacheDabWash,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderStarShape } from '../../props/shared';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-moon';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-moon-${clean}` : 'cc-moon';
}

/**
 * Renders the Authentic 1970s–1980s Storybook Painted Watercolor/Gouache & Sketchy Xerox Moon (`'moon'`):
 * - Center-origin `(0, 0)`, bounds `~x: -108..79, y: -146..108`
 * - ZERO digital `<radialGradient>` / `<linearGradient>` or glowing neon halo blobs!
 * - Mottled parchment-to-amber watercolor/gouache crescent body (`gouacheDabWash`) + organic
 *   painted craters (`data-part="moon-spots"`) + sketchy sepia/graphite Xerox ink contour (`xeroxSketchStroke`)
 * - Gentle 1970s Disney storybook eyes with hand-drawn eyelids & feathery lashes (`idle`, `awake`,
 *   `curious`, `sleepy`, `sleeping`, `blinking`, `grumpy`) + optional 4-phase gentle cel speaking mouth
 * - Delicate flat-cel companion & dangling stars with hand-inked sparkle ticks (`data-part="moon-stars"`)
 * - Optional flat-cel velvet nightcap with sketchy fabric fold creases (`wearingNightcap: true`,
 *   `data-part="moon-nightcap"`)
 */
export function renderClassicMoon(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    wearingNightcap = false,
    isSpeaking = false,
    id,
  } = options;

  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // Serene 12 FPS ("on twos") lullaby sway & companion star bob
  const drawStep = Math.floor(frameIndex / 2);
  const gentleRock = steppedOscillate(frameIndex, 36, 2.2);
  const starBob = round2(steppedOscillate(frameIndex, 16, 3.0));
  const starJit = round2(deterministicJitter(drawStep, 19, 0.45));
  const autoBlink =
    state !== 'sleeping' &&
    state !== 'sleepy' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 48, 2, 8));

  const speakingActive = state === 'singing' || isSpeaking;

  const crescentD = [
    'M 36 -88',
    'C -36 -108, -98 -58, -98 0',
    'C -98 58, -36 108, 38 88',
    'C 6 70, -14 38, -14 0',
    'C -14 -38, 6 -70, 36 -88',
    'Z',
  ].join(' ');

  const bodyClipId = `${pfx}-body-clip`;
  const localDefs = svgEl(
    'defs',
    {},
    svgEl('clipPath', { id: bodyClipId }, svgEl('path', { d: crescentD }))
  );

  // 1. Hand-Painted Watercolor/Gouache Crescent Moon Body + Mottled Craters + Sketchy Xerox Contour
  const crescentBody = svgEl('g', { 'data-part': 'moon-body' }, [
    // Warm parchment-cream matte illustration base
    svgEl('path', {
      d: crescentD,
      fill: c.moonCream,
      stroke: 'none',
    }),
    // Clipped mottled gouache brushwork washes & craters
    svgEl('g', { 'clip-path': svgUrl(bodyClipId) }, [
      // Outer-left & lower crescent mottled warm amber-ochre watercolor wash
      gouacheDabWash(
        [
          { cx: -84, cy: -36, rx: 32, ry: 34, rotate: -14, fill: c.moonAmber, opacity: 0.56 },
          { cx: -86, cy: 12, rx: 34, ry: 38, rotate: 10, fill: c.moonAmber, opacity: 0.62 },
          { cx: -64, cy: 56, rx: 38, ry: 30, rotate: -18, fill: c.moonShadow, opacity: 0.52 },
          { cx: -20, cy: 84, rx: 36, ry: 22, rotate: -8, fill: c.moonAmber, opacity: 0.54 },
          { cx: -46, cy: -74, rx: 34, ry: 24, rotate: 16, fill: c.moonAmber, opacity: 0.48 },
        ],
        {
          fill: c.moonAmber,
          wetEdgeColor: c.moonShadow,
          wetEdgeOpacity: 0.22,
          highlightFill: c.parchmentCream,
          highlightOpacity: 0.16,
          opacity: 0.88,
          seed: 3,
        }
      ),
      // Soft pale parchment gouache brush dabs along the inner starlit crescent edge
      gouacheDabWash(
        [
          { cx: 10, cy: -66, rx: 22, ry: 20, rotate: 24, opacity: 0.48 },
          { cx: -14, cy: -22, rx: 20, ry: 26, rotate: 6, opacity: 0.44 },
          { cx: -12, cy: 26, rx: 20, ry: 26, rotate: -10, opacity: 0.44 },
          { cx: 12, cy: 68, rx: 22, ry: 18, rotate: -22, opacity: 0.46 },
        ],
        {
          fill: c.starGlow,
          wetEdgeOpacity: 0,
          opacity: 0.72,
          seed: 7,
        }
      ),
      // Organic painted gouache craters & warm storybook cheek blushes (`data-part="moon-spots"`)
      svgEl('g', { 'data-part': 'moon-spots' }, [
        gouacheDabWash(
          [
            { cx: -35, cy: -58, rx: 12.5, ry: 9.2, rotate: -16, fill: c.moonCrater, opacity: 0.42 },
            { cx: -78, cy: -24, rx: 9.5, ry: 11.4, rotate: 12, fill: c.moonCrater, opacity: 0.38 },
            { cx: -72, cy: 28, rx: 12.8, ry: 10.2, rotate: -20, fill: c.moonCrater, opacity: 0.44 },
            { cx: -34, cy: 60, rx: 13.4, ry: 9.8, rotate: 14, fill: c.moonCrater, opacity: 0.46 },
            { cx: -52, cy: -42, rx: 4.8, ry: 4.4, rotate: -8, fill: c.moonCrater, opacity: 0.34 },
            { cx: -56, cy: 46, rx: 5.4, ry: 4.8, rotate: 10, fill: c.moonCrater, opacity: 0.36 },
            { cx: -12, cy: 76, rx: 4.6, ry: 3.8, rotate: -12, fill: c.moonCrater, opacity: 0.34 },
          ],
          {
            fill: c.moonCrater,
            wetEdgeColor: c.goldTitleShadow,
            wetEdgeOpacity: 0.24,
            opacity: 0.86,
            seed: 11,
          }
        ),
        // Delicate broken sepia/graphite ink crater rim ticks (classic storybook pen-and-wash)
        xeroxSketchStroke(
          'M -44 -56 C -40 -64, -29 -66, -24 -60 M -82 27 C -78 19, -66 18, -61 24 M -44 58 C -38 51, -26 52, -22 59',
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            broken: true,
            opacity: 0.56,
          }
        ),
        // Soft painterly warm storybook cheek blushes flanking the smile
        gouacheDabWash(
          [
            { cx: -73, cy: 12, rx: 10.0, ry: 6.2, rotate: -6, fill: c.warmAmberWash, opacity: 0.36 },
            { cx: -23, cy: 12, rx: 9.0, ry: 5.8, rotate: 6, fill: c.warmAmberWash, opacity: 0.34 },
          ],
          {
            fill: c.warmAmberWash,
            wetEdgeOpacity: 0,
            opacity: 0.72,
            seed: 13,
          }
        ),
      ]),
      // Subtle broken hand-inked pen hatching along the outer crescent curve
      xeroxSketchStroke(
        'M -88 -26 Q -92 -4, -88 22 M -80 42 Q -68 62, -48 76 M -62 -68 Q -44 -80, -24 -86',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          feather: true,
          opacity: 0.45,
        }
      ),
    ]),
    // Raw electrostatic Xerox graphite contour around the crescent silhouette
    celPath(crescentD, 'none', { strokeWidth: s.xeroxHeavy }),
  ]);

  // Helper for classic storybook mouth (supports 4-phase cel speaking mouth if Moon speaks/sings!)
  function renderMoonMouth(mode: 'smile' | 'sleepy' | 'grumpy'): string {
    if (speakingActive) {
      const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
      let shape: string;
      if (mouthPhase === 0) {
        shape = svgEl('path', {
          d: 'M -56 19 Q -46 27, -36 19',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        });
      } else if (mouthPhase === 1) {
        shape = svgEl('ellipse', {
          cx: -46,
          cy: 22,
          rx: 5.0,
          ry: 5.4,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        });
      } else if (mouthPhase === 2) {
        shape = [
          celPath(
            'M -56 18 Q -46 20, -36 18 C -36 30, -56 30, -56 18 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M -52 26 Q -46 22, -40 26 C -42 29, -50 29, -52 26 Z',
            c.mochiTongue,
            { strokeWidth: s.xeroxFine }
          ),
        ].join('');
      } else {
        shape = celPath(
          'M -55 18 Q -46 22, -37 18 C -38 26, -54 26, -55 18 Z',
          c.mochiMouthInner,
          { strokeWidth: s.xeroxMedium }
        );
      }
      return svgEl(
        'g',
        {
          'data-speaking-mouth': 'true',
          'data-mouth-phase': String(mouthPhase),
        },
        shape
      );
    }

    if (mode === 'grumpy') {
      return svgEl('path', {
        d: 'M -55 21 Q -46 18, -37 23',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      });
    }
    if (mode === 'sleepy') {
      return svgEl('path', {
        d: 'M -54 18 Q -46 25, -36 18',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      });
    }
    return svgEl('g', {}, [
      svgEl('path', {
        d: 'M -56 17 Q -46 26.5, -36 17',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      // Delicate storybook cheek dimple & lower lip crease ticks
      xeroxSketchStroke(
        'M -57.5 16.0 Q -55.8 18.0, -54.5 18.8 M -34.5 16.0 Q -36.2 18.0, -37.5 18.8 M -49.5 26.8 Q -46.0 28.4, -42.5 26.8',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }
      ),
    ]);
  }

  // 2. Classic 1970s Disney Storybook Eyes & Facial Expression (flat matte paint + raw Xerox ink)
  let faceMarkup = '';
  if (state === 'sleeping' || autoBlink) {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Peaceful curved sleeping eyelids with feathery hand-inked lashes
        svgEl('path', {
          d: 'M -75 -6 Q -63 6.5, -51 -6 M -43 -6 Q -31 6.5, -19 -6',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M -75 -6 L -79 -3.6 M -71 -2 L -74 1.2 M -55 -2 L -52 1.2 M -19 -6 L -15 -3.6 M -39 -2 L -42 1.2 M -23 -2 L -20 1.2',
          { strokeWidth: s.xeroxFine, opacity: 0.88 }
        ),
        // Gentle hand-sketched arched brows & lid creases
        xeroxSketchStroke(
          'M -73 -18 Q -63 -23, -53 -18 M -41 -18 Q -31 -23, -21 -18',
          { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine, feather: true, opacity: 0.82 }
        ),
      ]),
      renderMoonMouth('sleepy'),
    ]);
  } else if (state === 'sleepy') {
    // Classic heavy half-closed droopy Disney storybook eyelids
    const sleepyClipL = `${pfx}-sleepy-eye-l`;
    const sleepyClipR = `${pfx}-sleepy-eye-r`;
    const sleepyEyeL = 'M -74.5 -5.5 C -74.5 -14.5, -51.5 -14.5, -51.5 -5.5 C -51.5 3.5, -74.5 3.5, -74.5 -5.5 Z';
    const sleepyEyeR = 'M -42.5 -5.5 C -42.5 -14.5, -19.5 -14.5, -19.5 -5.5 C -19.5 3.5, -42.5 3.5, -42.5 -5.5 Z';
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('clipPath', { id: sleepyClipL }, svgEl('path', { d: sleepyEyeL })),
        svgEl('clipPath', { id: sleepyClipR }, svgEl('path', { d: sleepyEyeR })),
        // Left droopy eye
        svgEl('path', { d: sleepyEyeL, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipL) }, [
          svgEl('ellipse', { cx: -63, cy: -1.6, rx: 4.8, ry: 5.0, fill: c.xeroxInk }),
          svgEl('circle', { cx: -64.8, cy: -3.0, r: 1.5, fill: c.celCream }),
          celPath('M -77 -18 L -49 -18 L -49 -4.5 Q -63 -1.2, -77 -4.5 Z', c.moonAmber, {
            strokeWidth: s.xeroxMedium,
          }),
        ]),
        celPath(sleepyEyeL, 'none', { strokeWidth: s.xeroxFine }),
        xeroxSketchStroke('M -75.5 -4.6 L -79.2 -6.8 M -72.0 -2.6 L -75.2 -1.2', {
          strokeWidth: s.xeroxFine,
        }),
        // Right droopy eye
        svgEl('path', { d: sleepyEyeR, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipR) }, [
          svgEl('ellipse', { cx: -31, cy: -1.6, rx: 4.8, ry: 5.0, fill: c.xeroxInk }),
          svgEl('circle', { cx: -32.8, cy: -3.0, r: 1.5, fill: c.celCream }),
          celPath('M -45 -18 L -17 -18 L -17 -4.5 Q -31 -1.2, -45 -4.5 Z', c.moonAmber, {
            strokeWidth: s.xeroxMedium,
          }),
        ]),
        celPath(sleepyEyeR, 'none', { strokeWidth: s.xeroxFine }),
        xeroxSketchStroke('M -18.5 -4.6 L -14.8 -6.8 M -22.0 -2.6 L -18.8 -1.2', {
          strokeWidth: s.xeroxFine,
        }),
        xeroxSketchStroke('M -73 -19 Q -63 -22, -53 -18 M -41 -18 Q -31 -22, -21 -19', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.xeroxFine,
          feather: true,
        }),
      ]),
      renderMoonMouth('sleepy'),
    ]);
  } else if (state === 'grumpy') {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-grumpy' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Left grumpy half-lidded eye (flat cel paint + heavy furrowed brow)
        celPath(
          'M -75.5 -10.5 L -50.5 -10.5 C -48.5 6.5, -77.5 6.5, -75.5 -10.5 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('ellipse', { cx: -63.5, cy: -2.4, rx: 4.8, ry: 5.2, fill: c.xeroxInk }),
        svgEl('circle', { cx: -65.4, cy: -4.4, r: 1.65, fill: c.celCream }),
        svgEl('path', {
          d: 'M -78 -13.5 L -48 -9.8',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        // Right grumpy half-lidded eye
        celPath(
          'M -43.5 -10.5 L -18.5 -10.5 C -16.5 6.5, -45.5 6.5, -43.5 -10.5 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('ellipse', { cx: -31.5, cy: -2.4, rx: 4.8, ry: 5.2, fill: c.xeroxInk }),
        svgEl('circle', { cx: -33.4, cy: -4.4, r: 1.65, fill: c.celCream }),
        svgEl('path', {
          d: 'M -46 -9.8 L -16 -13.5',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
      ]),
      renderMoonMouth('grumpy'),
    ]);
  } else {
    // Gentle 1970s Disney storybook awake / curious eyes (almond lids, dark pupils, sketchy lashes)
    const isCurious = state === 'curious' || state === 'looking_up';
    const pupilShiftX = isCurious ? -2.6 : -0.4;
    const pupilShiftY = isCurious ? 1.6 : 0.2;
    const awakeClipL = `${pfx}-awake-eye-l`;
    const awakeClipR = `${pfx}-awake-eye-r`;

    const eyeLeftD =
      'M -74.0 -5.0 C -73.6 -15.4, -53.2 -16.4, -52.2 -5.8 C -51.6 2.8, -60.2 5.4, -65.4 4.8 C -71.2 4.2, -74.4 0.6, -74.0 -5.0 Z';
    const eyeRightD =
      'M -41.8 -5.8 C -40.8 -16.4, -20.4 -15.4, -20.0 -5.0 C -19.6 0.6, -22.8 4.2, -28.6 4.8 C -33.8 5.4, -42.4 2.8, -41.8 -5.8 Z';

    faceMarkup = svgEl('g', { 'data-part': 'moon-face-awake' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('clipPath', { id: awakeClipL }, svgEl('path', { d: eyeLeftD })),
        svgEl('clipPath', { id: awakeClipR }, svgEl('path', { d: eyeRightD })),

        // --- Left storybook eye ---
        svgEl('path', { d: eyeLeftD, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipL) }, [
          // Soft flat upper eyelid fold peeking naturally at top of eye
          svgEl('path', {
            d: 'M -76 -18 L -50 -18 L -50 -11.4 Q -63 -9.4, -76 -11.4 Z',
            fill: c.moonAmber,
            ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
          }),
          // Classic flat charcoal pupil with subtle warm hazel lower crescent & crisp catchlight
          svgEl('ellipse', {
            cx: round2(-63 + pupilShiftX),
            cy: round2(-4.4 + pupilShiftY),
            rx: 5.0,
            ry: 6.0,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(-65.0 + pupilShiftX),
            cy: round2(-7.0 + pupilShiftY),
            r: 1.95,
            fill: c.celCream,
          }),
        ]),
        celPath(eyeLeftD, 'none', { strokeWidth: s.xeroxFine }),
        // Bold Xerox upper lash curve & feathery lashes
        svgEl('path', {
          d: 'M -75.4 -7.6 C -72.8 -16.6, -54.0 -17.2, -51.6 -7.8',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M -74.6 -9.6 L -79.0 -12.4 M -71.8 -13.4 L -75.0 -16.6 M -68.0 -15.4 L -70.0 -18.4',
          { strokeWidth: s.xeroxFine, opacity: 0.9 }
        ),

        // --- Right storybook eye ---
        svgEl('path', { d: eyeRightD, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipR) }, [
          svgEl('path', {
            d: 'M -44 -18 L -18 -18 L -18 -11.4 Q -31 -9.4, -44 -11.4 Z',
            fill: c.moonAmber,
            ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
          }),
          svgEl('ellipse', {
            cx: round2(-31 + pupilShiftX),
            cy: round2(-4.4 + pupilShiftY),
            rx: 5.0,
            ry: 6.0,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(-33.0 + pupilShiftX),
            cy: round2(-7.0 + pupilShiftY),
            r: 1.95,
            fill: c.celCream,
          }),
        ]),
        celPath(eyeRightD, 'none', { strokeWidth: s.xeroxFine }),
        svgEl('path', {
          d: 'M -42.4 -7.8 C -40.0 -17.2, -21.2 -16.6, -18.6 -7.6',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M -19.4 -9.6 L -15.0 -12.4 M -22.2 -13.4 L -19.0 -16.6 M -26.0 -15.4 L -24.0 -18.4',
          { strokeWidth: s.xeroxFine, opacity: 0.9 }
        ),

        // Expressive hand-sketched storybook eyebrows
        xeroxSketchStroke(
          isCurious
            ? 'M -73 -22 Q -63 -28, -53 -23 M -41 -23 Q -31 -28, -21 -22'
            : 'M -72 -21 Q -63 -25, -54 -21 M -40 -21 Q -31 -25, -22 -21',
          { strokeWidth: s.xeroxMedium, feather: true, opacity: 0.9 }
        ),
      ]),
      renderMoonMouth('smile'),
    ]);
  }

  // 3. Delicate Flat-Cel Companion & Dangling Stars + Hand-Inked Sparkle Motes (`data-part="moon-stars"`)
  // (ZERO modern glowing halo blobs!)
  const starSpecs = [
    { cx: round2(28 + starJit * 0.4), cy: round2(-16 + starBob), r: 12.2, rot: round2(gentleRock * 3), fill: c.warmAmberGlow, phase: 0 },
    { cx: 46, cy: round2(34 - starBob * 0.7), r: 8.8, rot: -12, fill: c.parchmentCream, phase: 4 },
    { cx: 68, cy: round2(-68 - starBob * 0.6), r: 10.2, rot: 15, fill: c.moonCream, phase: 8 },
    { cx: -98, cy: round2(-72 + starBob * 0.5), r: 9.4, rot: -18, fill: c.warmAmberGlow, phase: 12 },
    { cx: -88, cy: round2(68 - starBob * 0.5), r: 7.8, rot: 10, fill: c.parchmentCream, phase: 6 },
  ];

  const companionStars = svgEl('g', { 'data-part': 'moon-stars' }, [
    // Delicate broken gold-sepia thread suspending the dangling star from upper crescent horn
    xeroxSketchStroke(
      `M 32 -84 Q ${round2(30.5 + starJit * 0.3)} -55, ${round2(28 + starJit * 0.4)} ${round2(-26 + starBob)}`,
      {
        stroke: c.goldTitle,
        strokeWidth: 1.25,
        dasharray: '3.5 3',
        opacity: 0.88,
      }
    ),
    // Flat-cel hand-inked companion stars with tiny parchment 4-point cross sparkle ticks
    ...starSpecs.map((st, idx) => {
      const twinkle = round2(0.76 + Math.abs(steppedOscillate(frameIndex, 20, 0.24, st.phase)));
      const d = renderStarShape(st.cx, st.cy, st.r, st.rot);
      const tickX = round2(st.cx + st.r * 0.95);
      const tickY = round2(st.cy - st.r * 0.85);
      return svgEl('g', { opacity: twinkle }, [
        celPath(d, st.fill, { strokeWidth: s.xeroxFine }),
        svgEl('circle', {
          cx: st.cx,
          cy: st.cy,
          r: round2(st.r * 0.2),
          fill: c.starGlow,
        }),
        idx % 2 === 0
          ? xeroxSketchStroke(
              `M ${tickX} ${round2(tickY - 3)} L ${tickX} ${round2(tickY + 3)} M ${round2(tickX - 3)} ${tickY} L ${round2(tickX + 3)} ${tickY}`,
              {
                stroke: c.starGlow,
                strokeWidth: 0.9,
                opacity: 0.82,
              }
            )
          : '',
      ]);
    }),
  ]);

  // 4. Flat Matte Cel Velvet Nightcap with Sketchy Fold Creases (`data-part="moon-nightcap"`)
  const capBodyD =
    'M -88 -26 C -70 -94, -22 -128, 18 -134 C 24 -112, 32 -98, 38 -86 Z';
  const capCuffD =
    'M -94 -18 C -64 -72, -16 -102, 40 -90 L 34 -72 C -8 -78, -54 -50, -82 -4 Z';
  const capPomD =
    'M 18 -130 C 12 -140, 26 -146, 32 -136 C 40 -132, 34 -120, 24 -122 C 14 -120, 12 -126, 18 -130 Z';
  const capClipId = `${pfx}-cap-clip`;

  const nightcap = wearingNightcap
    ? svgEl('g', { 'data-part': 'moon-nightcap' }, [
        svgEl('clipPath', { id: capClipId }, svgEl('path', { d: capBodyD })),
        // Flat velvet slate-blue nightcap base
        svgEl('path', { d: capBodyD, fill: c.nightcapBlue, stroke: 'none' }),
        svgEl('g', { 'clip-path': svgUrl(capClipId) }, [
          // Single flat matte cloth-fold shadow band along lower tuck
          svgEl('path', {
            d: 'M -92 -24 C -70 -62, -24 -86, 38 -88 L 42 -76 L -90 -18 Z',
            fill: c.nightcapShadow,
          }),
          // Classic muted storybook cap stripes
          svgEl('path', {
            d: 'M -74 -55 C -44 -68, -6 -76, 32 -78 M -52 -88 C -24 -99, 4 -105, 26 -105',
            fill: 'none',
            ...celStrokeAttrs({
              stroke: c.nightcapStripe,
              strokeWidth: 4.0,
              opacity: 0.56,
            }),
          }),
          // Raw sketchy Xerox fabric fold creases
          xeroxSketchStroke(
            'M -56 -68 Q -30 -86, -4 -94 M -30 -106 Q -6 -116, 14 -118 M -76 -38 Q -58 -52, -40 -60',
            {
              stroke: c.xeroxInk,
              strokeWidth: s.sketchLine,
              broken: true,
              feather: true,
              opacity: 0.78,
            }
          ),
        ]),
        // Raw Xerox graphite cap outline on top
        celPath(capBodyD, 'none', { strokeWidth: s.xeroxHeavy }),
        // Plush flat parchment-cream upturned cuff with sketchy crease ticks
        celPath(capCuffD, c.celCream, { strokeWidth: s.xeroxMedium }),
        xeroxSketchStroke(
          'M -72 -26 Q -54 -44, -36 -54 M -18 -72 Q 2 -78, 22 -78',
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            broken: true,
            opacity: 0.72,
          }
        ),
        // Fluffy hand-inked flat cream pom-pom with tiny feathery tuft strokes
        celPath(capPomD, c.celCream, { strokeWidth: s.xeroxMedium }),
        xeroxSketchStroke(
          'M 18 -134 L 16 -138 M 29 -138 L 32 -141 M 33 -128 L 36 -127',
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.85,
            opacity: 0.78,
          }
        ),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-character': 'moon',
      'data-art-style': 'classic_cel',
      'data-state': state,
      transform: svgTransform({ rotate: gentleRock }),
    },
    [localDefs, crescentBody, faceMarkup, companionStars, nightcap]
  );
}

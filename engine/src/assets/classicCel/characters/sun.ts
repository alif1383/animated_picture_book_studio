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
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-sun';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-sun-${clean}` : 'cc-sun';
}

/**
 * Renders the Authentic 1970s-1980s Classic Storybook Hand-Painted Cel/Gouache Sun (`'sun'`):
 * - Center-origin `(0, 0)`, bounds `x: -128..128, y: -128..128`
 * - Zero digital SVG gradients, zero pure black/white, zero wax-crayon patterns or neon glows
 * - Warm painted ochre-gold disk (`r = 74`) with clipped watercolor/gouache dappled sunlight
 *   mottling (`cc-sun-disk-clip`), `#xerox-ink` outline, and sketchy inner warmth rings
 * - 12 hand-drawn alternating long/short flat-cel sunbeams gently rotating & pulsing on twos
 * - Expressive vintage Disney storybook sun face supporting `awake`, `sleepy`, `grumpy`,
 *   `sleeping`, `blinking`, `curious`/`looking_up`, plus 4-phase cel lip-sync mouth (`isSpeaking`)
 */
export function renderClassicSun(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;

  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // Classic 12 FPS ("on twos") timing for ray rotation, pulse, gentle rock, and blinking
  const drawStep = Math.floor(frameIndex / 2);
  const gentleRock = round2(steppedOscillate(frameIndex, 32, 2.0));
  const raySpin = round2((drawStep * 1.25) % 360);

  const isSunsetOrSleeping =
    state === 'sleepy' || state === 'sleeping' || state === 'grumpy';
  const autoBlink =
    state !== 'sleeping' &&
    state !== 'sleepy' &&
    state !== 'grumpy' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 46, 2, 6));
  const speakingActive = state === 'singing' || isSpeaking;

  // 1. 12 Hand-Drawn Alternating Long/Short Sunbeams (flat cel fills + #xerox-ink outlines)
  const rayElements: string[] = [];
  for (let i = 0; i < 12; i++) {
    const isLong = i % 2 === 0;
    const baseDeg = i * 30;
    const pulseWave = Math.sin(drawStep * 0.48 + i * 1.15);

    const rIn = isLong ? 78 : 79.5;
    const baseOut = isSunsetOrSleeping
      ? isLong
        ? 111
        : 99
      : isLong
        ? 119
        : 105;
    const pulseAmp = isSunsetOrSleeping
      ? isLong
        ? 2.2
        : 1.6
      : isLong
        ? 3.4
        : 2.4;
    const rOut = round2(baseOut + pulseWave * pulseAmp);

    const halfSpread = isLong ? 8.6 : 7.0;
    const organicBend =
      deterministicJitter(i * 13 + 5, 7, 1.6) + (isLong ? 1.5 : -1.2);

    const radLeft = ((baseDeg - halfSpread - 90) * Math.PI) / 180;
    const radRight = ((baseDeg + halfSpread - 90) * Math.PI) / 180;
    const radMid = ((baseDeg - 90) * Math.PI) / 180;
    const radTip = ((baseDeg + organicBend * 0.55 - 90) * Math.PI) / 180;
    const radCtrlL =
      ((baseDeg - halfSpread * 0.45 + organicBend - 90) * Math.PI) / 180;
    const radCtrlR =
      ((baseDeg + halfSpread * 0.45 + organicBend - 90) * Math.PI) / 180;

    const rCtrl = rIn + (rOut - rIn) * 0.5;
    const rBaseArc = rIn - 2.2;

    const x1 = round2(Math.cos(radLeft) * rIn);
    const y1 = round2(Math.sin(radLeft) * rIn);
    const x2 = round2(Math.cos(radRight) * rIn);
    const y2 = round2(Math.sin(radRight) * rIn);
    const tipX = round2(Math.cos(radTip) * rOut);
    const tipY = round2(Math.sin(radTip) * rOut);
    const c1x = round2(Math.cos(radCtrlL) * rCtrl);
    const c1y = round2(Math.sin(radCtrlL) * rCtrl);
    const c2x = round2(Math.cos(radCtrlR) * rCtrl);
    const c2y = round2(Math.sin(radCtrlR) * rCtrl);
    const baseMidX = round2(Math.cos(radMid) * rBaseArc);
    const baseMidY = round2(Math.sin(radMid) * rBaseArc);

    const rayD = `M ${x1} ${y1} Q ${c1x} ${c1y} ${tipX} ${tipY} Q ${c2x} ${c2y} ${x2} ${y2} Q ${baseMidX} ${baseMidY} ${x1} ${y1} Z`;
    const rayFill = isLong ? c.sunGoldMid : c.sunRayAmber;

    rayElements.push(
      celPath(rayD, rayFill, {
        strokeWidth: s.xeroxMedium,
      })
    );

    // Subtle hand-inked internal warmth spine tick on long rays
    if (isLong) {
      const rSpineStart = rIn + 7;
      const rSpineEnd = rOut - 13;
      const sx1 = round2(Math.cos(radMid) * rSpineStart);
      const sy1 = round2(Math.sin(radMid) * rSpineStart);
      const sx2 = round2(Math.cos(radTip) * rSpineEnd);
      const sy2 = round2(Math.sin(radTip) * rSpineEnd);
      rayElements.push(
        xeroxSketchStroke(`M ${sx1} ${sy1} L ${sx2} ${sy2}`, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.56,
        })
      );
    }
  }

  const sunRays = svgEl(
    'g',
    {
      'data-part': 'sun-rays',
      transform: svgTransform({ rotate: raySpin }),
    },
    rayElements
  );

  // 2. Warm Painted Ochre-Gold Disk (r = 74) + Clipped Gouache/Watercolor Mottling + Xerox Ink
  const diskD = [
    'M 0 -74',
    'C 40.87 -74, 74 -40.87, 74 0',
    'C 74 40.87, 40.87 74, 0 74',
    'C -40.87 74, -74 40.87, -74 0',
    'C -74 -40.87, -40.87 -74, 0 -74',
    'Z',
  ].join(' ');

  const diskClipId = `${pfx}-disk-clip`;
  const localDefs = svgEl(
    'defs',
    {},
    svgEl('clipPath', { id: diskClipId }, svgEl('path', { d: diskD }))
  );

  const sunDisk = svgEl('g', { 'data-part': 'sun-disk' }, [
    // Warm painted ochre-gold matte base
    svgEl('path', {
      d: diskD,
      fill: c.sunGoldMid,
      stroke: 'none',
    }),
    // Clipped wet-on-wet watercolor & gouache dappled sunlight mottling
    svgEl('g', { 'clip-path': svgUrl(diskClipId) }, [
      // Soft wet-on-wet amber warmth washes along the rim & lower crescent
      watercolorWashBlotches(
        [
          {
            cx: 46,
            cy: 34,
            rx: 38,
            ry: 34,
            fill: isSunsetOrSleeping ? c.sunRayAmber : c.warmAmberWash,
            opacity: isSunsetOrSleeping ? 0.52 : 0.34,
            rotate: -18,
          },
          {
            cx: -44,
            cy: 42,
            rx: 40,
            ry: 30,
            fill: isSunsetOrSleeping ? c.sunRayAmber : c.warmAmberGlow,
            opacity: isSunsetOrSleeping ? 0.48 : 0.38,
            rotate: 14,
          },
          {
            cx: 2,
            cy: 56,
            rx: 46,
            ry: 26,
            fill: isSunsetOrSleeping ? c.warmAmberWash : c.warmAmberGlow,
            opacity: isSunsetOrSleeping ? 0.52 : 0.42,
            rotate: -4,
          },
          {
            cx: -50,
            cy: -30,
            rx: 32,
            ry: 34,
            fill: c.warmAmberGlow,
            opacity: 0.36,
            rotate: 22,
          },
          {
            cx: 48,
            cy: -34,
            rx: 30,
            ry: 32,
            fill: c.warmAmberGlow,
            opacity: 0.34,
            rotate: -24,
          },
        ],
        {
          seed: 9,
          opacity: 0.9,
          wetEdge: false,
        }
      ),
      // Dappled sunlit ochre-cream gouache brush dabs across crown and center
      gouacheDabWash(
        [
          { cx: -18, cy: -42, rx: 32, ry: 22, rotate: -14, fill: c.sunGoldLight, opacity: 0.68 },
          { cx: 22, cy: -38, rx: 30, ry: 22, rotate: 16, fill: c.sunGoldLight, opacity: 0.62 },
          { cx: -6, cy: -14, rx: 36, ry: 26, rotate: -6, fill: c.warmAmberCore, opacity: 0.46 },
          { cx: 18, cy: 6, rx: 28, ry: 24, rotate: 12, fill: c.sunGoldLight, opacity: 0.44 },
          { cx: -32, cy: 4, rx: 24, ry: 22, rotate: -10, fill: c.sunGoldLight, opacity: 0.42 },
          { cx: 0, cy: 36, rx: 32, ry: 18, rotate: 4, fill: c.warmAmberGlow, opacity: 0.45 },
        ],
        {
          fill: c.sunGoldLight,
          wetEdgeColor: c.warmAmberGlow,
          wetEdgeOpacity: 0.18,
          highlightFill: c.warmAmberCore,
          highlightOpacity: 0.22,
          opacity: 0.9,
          seed: 5,
        }
      ),
      // Painterly rosy terracotta cheeks (`data-part="sun-cheeks"`)
      svgEl('g', { 'data-part': 'sun-cheeks' }, [
        gouacheDabWash(
          [
            {
              cx: -41,
              cy: 13,
              rx: 12.2,
              ry: 8.0,
              rotate: -8,
              fill: c.sunCheekWarm,
              opacity: isSunsetOrSleeping ? 0.62 : 0.56,
            },
            {
              cx: 41,
              cy: 13,
              rx: 12.2,
              ry: 8.0,
              rotate: 8,
              fill: c.sunCheekWarm,
              opacity: isSunsetOrSleeping ? 0.62 : 0.56,
            },
          ],
          {
            fill: c.sunCheekWarm,
            wetEdgeColor: c.warmAmberWash,
            wetEdgeOpacity: 0.16,
            opacity: 0.88,
            seed: 17,
          }
        ),
      ]),
      // Sketchy broken inner warmth rings & pen hatching inside the golden disk
      svgEl('g', { 'data-part': 'sun-warmth-rings' }, [
        xeroxSketchStroke(
          'M -52 -42 C -34 -64, 34 -64, 52 -42 M 62 -16 C 68 10, 58 42, 34 56 M -34 56 C -58 42, -68 10, -62 -16',
          {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            broken: true,
            feather: true,
            opacity: 0.52,
          }
        ),
        xeroxSketchStroke(
          'M -38 -52 Q 0 -64, 38 -52 M -44 48 Q 0 64, 44 48',
          {
            stroke: c.sunRayAmber,
            strokeWidth: 1.15,
            broken: true,
            opacity: 0.45,
          }
        ),
      ]),
    ]),
    // Raw electrostatic Xerox graphite contour around the sun disk
    celPath(diskD, 'none', { strokeWidth: s.xeroxHeavy }),
  ]);

  // 3. Helper for Vintage Storybook Sun Mouth (including 4-phase cel lip-sync when speaking)
  function renderSunMouth(mode: 'smile' | 'sleepy' | 'sleeping' | 'grumpy'): string {
    if (speakingActive) {
      const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
      let shape: string;
      if (mouthPhase === 0) {
        // Phase 0: Closed warm smile / gentle lip press
        shape = svgEl('path', {
          d: 'M -15 20 Q 0 30, 15 20',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        });
      } else if (mouthPhase === 1) {
        // Phase 1: Soft small 'o' vowel oval
        shape = svgEl('ellipse', {
          cx: 0,
          cy: 23,
          rx: 5.8,
          ry: 6.4,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        });
      } else if (mouthPhase === 2) {
        // Phase 2: Open animated 'ah' jaw with dark inner mouth & flat matte pink tongue
        shape = [
          celPath(
            'M -15 18 Q 0 21, 15 18 C 14 34, -14 34, -15 18 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M -9 29 Q 0 24, 9 29 C 6 33, -6 33, -9 29 Z',
            c.mochiTongue,
            { strokeWidth: s.xeroxFine }
          ),
        ].join('');
      } else {
        // Phase 3: Half-open expressive 'eh' grin
        shape = celPath(
          'M -14 19 Q 0 23, 14 19 C 12 29, -12 29, -14 19 Z',
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
      return svgEl('g', {}, [
        svgEl('path', {
          d: 'M -14 25 Q 0 18, 14 26',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        }),
        xeroxSketchStroke('M -5 29 Q 0 27.5, 5 29', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.72,
        }),
      ]);
    }

    if (mode === 'sleepy') {
      // Gentle cozy sleepy yawn/sigh mouth
      return svgEl('g', {}, [
        celPath(
          'M -7 23 C -7 16, 7 16, 7 23 C 7 31, -7 31, -7 23 Z',
          c.mochiMouthInner,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M -4.2 27.2 Q 0 24.5, 4.2 27.2 C 2.8 29.8, -2.8 29.8, -4.2 27.2 Z',
          c.mochiTongue,
          { strokeWidth: s.xeroxFine }
        ),
      ]);
    }

    if (mode === 'sleeping') {
      return svgEl('path', {
        d: 'M -13 21 Q 0 28.5, 13 21',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      });
    }

    // Gentle warm vintage storybook smile with delicate cheek dimple & lower lip crease ticks
    return svgEl('g', {}, [
      svgEl('path', {
        d: 'M -17 18.5 Q 0 31.5, 17 18.5',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        'M -19.2 17.2 Q -17.0 19.6, -15.4 20.4 M 19.2 17.2 Q 17.0 19.6, 15.4 20.4 M -4.8 31.2 Q 0 33.0, 4.8 31.2',
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
          opacity: 0.78,
        }
      ),
    ]);
  }

  // 4. Expressive Vintage Disney Storybook Sun Face
  let faceMarkup = '';

  if (state === 'sleeping' || autoBlink) {
    const facePart = state === 'sleeping' ? 'sun-face-sleeping' : 'sun-face-blinking';
    faceMarkup = svgEl('g', { 'data-part': facePart }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Peaceful curved closed eyelids with feathery hand-inked lashes
        svgEl('path', {
          d: 'M -36 -6 Q -23 6.5, -10 -6 M 10 -6 Q 23 6.5, 36 -6',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M -36 -6 L -40.5 -3.4 M -31.5 -1.8 L -34.5 1.8 M -14.5 -1.8 L -11.5 1.8 M 36 -6 L 40.5 -3.4 M 31.5 -1.8 L 34.5 1.8 M 14.5 -1.8 L 11.5 1.8',
          { strokeWidth: s.xeroxFine, opacity: 0.88 }
        ),
        // Soft hand-sketched arched brows
        xeroxSketchStroke(
          'M -34 -20 Q -23 -25.5, -12 -20 M 12 -20 Q 23 -25.5, 34 -20',
          { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine, feather: true, opacity: 0.84 }
        ),
      ]),
      renderSunMouth(state === 'sleeping' ? 'sleeping' : 'smile'),
    ]);
  } else if (state === 'sleepy') {
    const sleepyClipL = `${pfx}-sleepy-eye-l`;
    const sleepyClipR = `${pfx}-sleepy-eye-r`;
    const sleepyEyeL =
      'M -35 -6.5 C -35 -16.5, -11 -16.5, -11 -6.5 C -11 3.5, -35 3.5, -35 -6.5 Z';
    const sleepyEyeR =
      'M 11 -6.5 C 11 -16.5, 35 -16.5, 35 -6.5 C 35 3.5, 11 3.5, 11 -6.5 Z';

    faceMarkup = svgEl('g', { 'data-part': 'sun-face-sleepy' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('clipPath', { id: sleepyClipL }, svgEl('path', { d: sleepyEyeL })),
        svgEl('clipPath', { id: sleepyClipR }, svgEl('path', { d: sleepyEyeR })),
        // Left droopy storybook eye
        svgEl('path', { d: sleepyEyeL, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipL) }, [
          svgEl('ellipse', { cx: -23, cy: -2.2, rx: 5.2, ry: 5.4, fill: c.xeroxInk }),
          svgEl('circle', { cx: -24.8, cy: -3.8, r: 1.65, fill: c.celCream }),
          celPath('M -38 -19 L -8 -19 L -8 -5.2 Q -23 -1.6, -38 -5.2 Z', c.warmAmberGlow, {
            strokeWidth: s.xeroxMedium,
          }),
        ]),
        celPath(sleepyEyeL, 'none', { strokeWidth: s.xeroxFine }),
        xeroxSketchStroke('M -36 -5.2 L -40.2 -7.4 M -32.2 -3.0 L -35.6 -1.4', {
          strokeWidth: s.xeroxFine,
        }),
        // Right droopy storybook eye
        svgEl('path', { d: sleepyEyeR, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipR) }, [
          svgEl('ellipse', { cx: 23, cy: -2.2, rx: 5.2, ry: 5.4, fill: c.xeroxInk }),
          svgEl('circle', { cx: 21.2, cy: -3.8, r: 1.65, fill: c.celCream }),
          celPath('M 8 -19 L 38 -19 L 38 -5.2 Q 23 -1.6, 8 -5.2 Z', c.warmAmberGlow, {
            strokeWidth: s.xeroxMedium,
          }),
        ]),
        celPath(sleepyEyeR, 'none', { strokeWidth: s.xeroxFine }),
        xeroxSketchStroke('M 36 -5.2 L 40.2 -7.4 M 32.2 -3.0 L 35.6 -1.4', {
          strokeWidth: s.xeroxFine,
        }),
        // Relaxed drowsy brows
        xeroxSketchStroke(
          'M -34 -20.5 Q -23 -23.5, -12 -19.5 M 12 -19.5 Q 23 -23.5, 34 -20.5',
          { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine, feather: true }
        ),
      ]),
      renderSunMouth('sleepy'),
    ]);
  } else if (state === 'grumpy') {
    faceMarkup = svgEl('g', { 'data-part': 'sun-face-grumpy' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Left grumpy half-lidded eye
        celPath(
          'M -36 -11.5 L -10 -11.5 C -8 6.5, -38 6.5, -36 -11.5 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('ellipse', { cx: -23.2, cy: -2.8, rx: 5.2, ry: 5.6, fill: c.xeroxInk }),
        svgEl('circle', { cx: -25.2, cy: -5.0, r: 1.8, fill: c.celCream }),
        svgEl('path', {
          d: 'M -39 -15.5 L -8 -10.5',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        // Right grumpy half-lidded eye
        celPath(
          'M 10 -11.5 L 36 -11.5 C 38 6.5, 8 6.5, 10 -11.5 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('ellipse', { cx: 23.2, cy: -2.8, rx: 5.2, ry: 5.6, fill: c.xeroxInk }),
        svgEl('circle', { cx: 21.2, cy: -5.0, r: 1.8, fill: c.celCream }),
        svgEl('path', {
          d: 'M 8 -10.5 L 39 -15.5',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
      ]),
      renderSunMouth('grumpy'),
    ]);
  } else {
    // Cheerful wide-awake vintage Disney storybook eyes (almond lids, charcoal irises, crisp catchlights)
    const isCurious = state === 'curious' || state === 'looking_up';
    const pupilShiftX = isCurious ? 2.2 : 0.4;
    const pupilShiftY = isCurious ? -1.4 : 0.2;
    const awakeClipL = `${pfx}-awake-eye-l`;
    const awakeClipR = `${pfx}-awake-eye-r`;

    const eyeLeftD =
      'M -35.2 -6.4 C -34.6 -18.2, -12.6 -19.0, -11.4 -7.0 C -10.8 2.4, -19.8 5.4, -25.6 4.8 C -31.8 4.0, -35.6 0.2, -35.2 -6.4 Z';
    const eyeRightD =
      'M 11.4 -7.0 C 12.6 -19.0, 34.6 -18.2, 35.2 -6.4 C 35.6 0.2, 31.8 4.0, 25.6 4.8 C 19.8 5.4, 10.8 2.4, 11.4 -7.0 Z';

    faceMarkup = svgEl('g', { 'data-part': 'sun-face-awake' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('clipPath', { id: awakeClipL }, svgEl('path', { d: eyeLeftD })),
        svgEl('clipPath', { id: awakeClipR }, svgEl('path', { d: eyeRightD })),

        // --- Left vintage storybook eye ---
        svgEl('path', { d: eyeLeftD, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipL) }, [
          // Soft flat upper eyelid fold peeking gently at top of eye
          svgEl('path', {
            d: 'M -38 -21 L -9 -21 L -9 -13.4 Q -23 -11.0, -38 -13.4 Z',
            fill: c.warmAmberGlow,
            ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
          }),
          // Classic flat charcoal iris/pupil with crisp warm cream catchlights
          svgEl('ellipse', {
            cx: round2(-23 + pupilShiftX),
            cy: round2(-5.4 + pupilShiftY),
            rx: 5.6,
            ry: 6.6,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(-25.2 + pupilShiftX),
            cy: round2(-8.2 + pupilShiftY),
            r: 2.1,
            fill: c.celCream,
          }),
          svgEl('circle', {
            cx: round2(-20.6 + pupilShiftX),
            cy: round2(-2.8 + pupilShiftY),
            r: 1.0,
            fill: c.celCream,
          }),
        ]),
        celPath(eyeLeftD, 'none', { strokeWidth: s.xeroxFine }),
        // Bold Xerox upper lash curve & feathery lashes
        svgEl('path', {
          d: 'M -36.6 -9.0 C -33.6 -19.2, -13.2 -19.8, -10.8 -9.2',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M -35.8 -11.2 L -40.4 -14.2 M -32.8 -15.4 L -36.0 -18.8 M -28.6 -17.6 L -30.6 -20.8',
          { strokeWidth: s.xeroxFine, opacity: 0.9 }
        ),

        // --- Right vintage storybook eye ---
        svgEl('path', { d: eyeRightD, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipR) }, [
          svgEl('path', {
            d: 'M 9 -21 L 38 -21 L 38 -13.4 Q 23 -11.0, 9 -13.4 Z',
            fill: c.warmAmberGlow,
            ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
          }),
          svgEl('ellipse', {
            cx: round2(23 + pupilShiftX),
            cy: round2(-5.4 + pupilShiftY),
            rx: 5.6,
            ry: 6.6,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(20.8 + pupilShiftX),
            cy: round2(-8.2 + pupilShiftY),
            r: 2.1,
            fill: c.celCream,
          }),
          svgEl('circle', {
            cx: round2(25.4 + pupilShiftX),
            cy: round2(-2.8 + pupilShiftY),
            r: 1.0,
            fill: c.celCream,
          }),
        ]),
        celPath(eyeRightD, 'none', { strokeWidth: s.xeroxFine }),
        svgEl('path', {
          d: 'M 10.8 -9.2 C 13.2 -19.8, 33.6 -19.2, 36.6 -9.0',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          'M 35.8 -11.2 L 40.4 -14.2 M 32.8 -15.4 L 36.0 -18.8 M 28.6 -17.6 L 30.6 -20.8',
          { strokeWidth: s.xeroxFine, opacity: 0.9 }
        ),

        // Expressive hand-sketched storybook eyebrows
        xeroxSketchStroke(
          isCurious
            ? 'M -34 -24.5 Q -23 -30.5, -12 -25.0 M 12 -25.0 Q 23 -30.5, 34 -24.5'
            : 'M -33 -23.0 Q -23 -27.5, -13 -23.0 M 13 -23.0 Q 23 -27.5, 33 -23.0',
          { strokeWidth: s.xeroxMedium, feather: true, opacity: 0.9 }
        ),
      ]),
      renderSunMouth('smile'),
    ]);
  }

  return svgEl(
    'g',
    {
      'data-character': 'sun',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': 'right',
      transform: svgTransform({ rotate: gentleRock }),
    },
    [localDefs, sunRays, sunDisk, faceMarkup]
  );
}

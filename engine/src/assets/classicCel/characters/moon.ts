import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  celShadedShape,
  celStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';
import { renderStarShape } from '../../props/shared';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-moon';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-moon-${clean}` : 'cc-moon';
}

/**
 * Renders the Classic 1970s–1980s Hand-Drawn Cel & Gouache Crescent Moon (`'moon'`):
 * - Center-origin `(0, 0)`, bounds `~x: -108..79, y: -146..108`
 * - Soft optical radial glow halo (`#cel-soft-glow`)
 * - Luminous cream-to-amber painted gouache crescent body with crisp cel shadow & moonlit inner rim
 * - Painterly gouache moon craters with rim depth (`data-part="moon-spots"`)
 * - Warm classic Disney storybook eyes with expressive eyelids & lashes (`idle`, `curious`, `sleepy`,
 *   `sleeping`, `blinking`, `grumpy`), plus optional 4-phase gentle cel speaking mouth
 * - Softly glowing companion & dangling 5-point stars (`data-part="moon-stars"`)
 * - Optional 2-tone cel-shaded velvet nightcap (`wearingNightcap: true`, `data-part="moon-nightcap"`)
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
  const softGlowUrl = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);
  const xeroxUrl = svgUrl(TOKENS.classicCel.filters.ids.xeroxInk);

  // Serene 12 FPS ("on twos") lullaby sway & companion star bob
  const gentleRock = steppedOscillate(frameIndex, 36, 2.2);
  const starBob = round2(steppedOscillate(frameIndex, 16, 3.2));
  const autoBlink =
    state !== 'sleeping' &&
    state !== 'sleepy' &&
    (state === 'blinking' || isSteppedBlinkFrame(frameIndex, 48, 2, 8));

  const speakingActive = state === 'singing' || isSpeaking;

  // Deterministic radial gradients & crescent clip path
  const crescentD = [
    'M 36 -88',
    'C -36 -108, -98 -58, -98 0',
    'C -98 58, -36 108, 38 88',
    'C 6 70, -14 38, -14 0',
    'C -14 -38, 6 -70, 36 -88',
    'Z',
  ].join(' ');

  const haloGradId = `${pfx}-halo-grad`;
  const bodyGradId = `${pfx}-body-grad`;
  const bodyClipId = `${pfx}-body-clip`;

  const localDefs = svgEl('defs', {}, [
    // Luminous radial glow halo behind crescent moon
    svgEl(
      'radialGradient',
      { id: haloGradId, cx: '46%', cy: '50%', r: '54%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.starGlow, 'stop-opacity': 0.56 }),
        svgEl('stop', { offset: '48%', 'stop-color': c.moonCream, 'stop-opacity': 0.28 }),
        svgEl('stop', { offset: '82%', 'stop-color': c.warmAmberGlow, 'stop-opacity': 0.08 }),
        svgEl('stop', { offset: '100%', 'stop-color': c.moonAmber, 'stop-opacity': 0 }),
      ]
    ),
    // Painterly cream-to-amber gouache wash across the crescent moon belly
    svgEl(
      'radialGradient',
      { id: bodyGradId, cx: '62%', cy: '38%', r: '78%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.starGlow }),
        svgEl('stop', { offset: '34%', 'stop-color': c.moonCream }),
        svgEl('stop', { offset: '76%', 'stop-color': c.moonAmber }),
        svgEl('stop', { offset: '100%', 'stop-color': c.moonShadow }),
      ]
    ),
    svgEl('clipPath', { id: bodyClipId }, svgEl('path', { d: crescentD })),
  ]);

  // 1. Soft Optical Glow Halo (`#cel-soft-glow`) kept comfortably within moon bounds
  const glowHalo = svgEl('ellipse', {
    'data-part': 'moon-glow-halo',
    cx: -26,
    cy: -2,
    rx: 78,
    ry: 94,
    fill: svgUrl(haloGradId),
    filter: softGlowUrl,
  });

  // 2. Luminous Painted Gouache Crescent Moon Body with 2-Tone Shadow & Inner Rim Highlight
  const crescentBody = svgEl('g', { 'data-part': 'moon-body' }, [
    svgEl('path', {
      d: crescentD,
      fill: svgUrl(bodyGradId),
      stroke: 'none',
    }),
    svgEl('g', { 'clip-path': svgUrl(bodyClipId) }, [
      // Soft painterly gouache outer-left & lower shadow plane
      svgEl('path', {
        d: 'M -104 -90 C -84 -54, -76 28, -44 68 C -18 94, 16 98, 46 92 L 46 112 L -108 112 Z',
        fill: c.moonShadow,
        opacity: 0.44,
      }),
      // Luminous inner crescent rim glow facing the starlit hollow
      svgEl('path', {
        d: 'M 36 -88 C 6 -70, -14 -38, -14 0 C -14 38, 6 70, 38 88 L 28 88 C -4 68, -23 36, -23 0 C -23 -36, -4 -68, 26 -88 Z',
        fill: c.starGlow,
        opacity: 0.46,
      }),
      // Painterly gouache moon craters & gentle warm cheek blushes (`data-part="moon-spots"`)
      svgEl('g', { 'data-part': 'moon-spots' }, [
        // Upper crater
        svgEl('ellipse', {
          cx: -34,
          cy: -58,
          rx: 12.5,
          ry: 9.5,
          transform: 'rotate(-16, -34, -58)',
          fill: c.moonCrater,
          opacity: 0.34,
        }),
        svgEl('path', {
          d: 'M -44 -56 C -41 -64, -29 -67, -23 -61',
          fill: 'none',
          stroke: c.goldTitleShadow,
          'stroke-width': 1.4,
          'stroke-linecap': 'round',
          opacity: 0.28,
        }),
        // Far-left upper crater
        svgEl('ellipse', {
          cx: -78,
          cy: -24,
          rx: 9.2,
          ry: 11.2,
          transform: 'rotate(12, -78, -24)',
          fill: c.moonCrater,
          opacity: 0.32,
        }),
        // Lower-left deep gouache crater
        svgEl('ellipse', {
          cx: -72,
          cy: 26,
          rx: 12.5,
          ry: 10.5,
          transform: 'rotate(-20, -72, 26)',
          fill: c.moonCrater,
          opacity: 0.36,
        }),
        svgEl('path', {
          d: 'M -82 26 C -78 17, -65 16, -61 23',
          fill: 'none',
          stroke: c.goldTitleShadow,
          'stroke-width': 1.4,
          'stroke-linecap': 'round',
          opacity: 0.28,
        }),
        // Lower belly crater
        svgEl('ellipse', {
          cx: -34,
          cy: 60,
          rx: 13.2,
          ry: 10.0,
          transform: 'rotate(14, -34, 60)',
          fill: c.moonCrater,
          opacity: 0.38,
        }),
        svgEl('ellipse', {
          cx: -31,
          cy: 62,
          rx: 9.0,
          ry: 5.5,
          transform: 'rotate(14, -31, 62)',
          fill: c.moonCream,
          opacity: 0.24,
        }),
        // Small speckle craters near tips
        svgEl('circle', { cx: -52, cy: -42, r: 4.5, fill: c.moonCrater, opacity: 0.28 }),
        svgEl('circle', { cx: -56, cy: 46, r: 5.2, fill: c.moonCrater, opacity: 0.3 }),
        svgEl('circle', { cx: -12, cy: 76, r: 4.2, fill: c.moonCrater, opacity: 0.26 }),
        // Warm classic storybook cheek blushes flanking the moon's smile
        svgEl('ellipse', {
          cx: -73,
          cy: 12,
          rx: 10.5,
          ry: 6.4,
          fill: c.warmAmberWash,
          opacity: 0.34,
        }),
        svgEl('ellipse', {
          cx: -23,
          cy: 12,
          rx: 9.5,
          ry: 6.0,
          fill: c.warmAmberWash,
          opacity: 0.32,
        }),
      ]),
    ]),
    // Crisp warm-charcoal Xerox outline around crescent silhouette
    svgEl('path', {
      d: crescentD,
      fill: 'none',
      ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
    }),
  ]);

  // Helper for gentle cel mouth (supports 4-phase speaking lip-sync when moon speaks/sings!)
  function renderMoonMouth(mode: 'smile' | 'sleepy' | 'grumpy'): string {
    if (speakingActive) {
      const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
      let shape: string;
      if (mouthPhase === 0) {
        shape = svgEl('path', {
          d: 'M -56 19 Q -46 27, -36 19',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        });
      } else if (mouthPhase === 1) {
        shape = svgEl('ellipse', {
          cx: -46,
          cy: 22,
          rx: 5.0,
          ry: 5.6,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
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
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
      });
    }
    if (mode === 'sleepy') {
      return svgEl('path', {
        d: 'M -54 18 Q -46 25, -36 18',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
      });
    }
    return svgEl('g', {}, [
      svgEl('path', {
        d: 'M -56 17 Q -46 27, -36 17',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
      }),
      // Soft corner dimple ticks
      svgEl('path', {
        d: 'M -57.5 16.0 Q -55.8 18.0, -54.5 18.8 M -34.5 16.0 Q -36.2 18.0, -37.5 18.8',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        }),
      }),
    ]);
  }

  // 3. Expressive Classic Disney Storybook Face & Eyes
  let faceMarkup = '';
  if (state === 'sleeping' || autoBlink) {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Peaceful closed curved eyelids with delicate storybook lashes
        svgEl('path', {
          d: 'M -75 -6 Q -63 7, -51 -6 M -75 -6 L -79 -4 M -71 -2 L -74 1 M -55 -2 L -52 1',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        svgEl('path', {
          d: 'M -43 -6 Q -31 7, -19 -6 M -19 -6 L -15 -4 M -39 -2 L -42 1 M -23 -2 L -20 1',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        // Serene arched eyebrows
        svgEl('path', {
          d: 'M -73 -18 Q -63 -23, -53 -18 M -41 -18 Q -31 -23, -21 -18',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.xeroxFine,
          }),
        }),
      ]),
      renderMoonMouth('sleepy'),
    ]);
  } else if (state === 'sleepy') {
    // Classic heavy half-closed droopy Disney eyelids peeking softly
    const sleepyClipL = `${pfx}-sleepy-eye-l`;
    const sleepyClipR = `${pfx}-sleepy-eye-r`;
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-sleeping' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl(
          'clipPath',
          { id: sleepyClipL },
          svgEl('ellipse', { cx: -63, cy: -5, rx: 12.2, ry: 11.2 })
        ),
        svgEl(
          'clipPath',
          { id: sleepyClipR },
          svgEl('ellipse', { cx: -31, cy: -5, rx: 12.2, ry: 11.2 })
        ),
        // Left droopy eye
        svgEl('ellipse', { cx: -63, cy: -5, rx: 12.2, ry: 11.2, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipL) }, [
          svgEl('circle', { cx: -63, cy: -1, r: 5.2, fill: c.xeroxInk }),
          svgEl('circle', { cx: -65, cy: -2.5, r: 1.8, fill: c.celCream }),
          // Heavy sleepy golden upper eyelid
          svgEl('path', {
            d: 'M -77 -18 L -49 -18 L -49 -4 Q -63 -1, -77 -4 Z',
            fill: c.moonAmber,
            ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
          }),
        ]),
        svgEl('ellipse', {
          cx: -63,
          cy: -5,
          rx: 12.2,
          ry: 11.2,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        svgEl('path', {
          d: 'M -76 -4 L -79 -6 M -72 -2 L -75 -1',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine }),
        }),
        // Right droopy eye
        svgEl('ellipse', { cx: -31, cy: -5, rx: 12.2, ry: 11.2, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(sleepyClipR) }, [
          svgEl('circle', { cx: -31, cy: -1, r: 5.2, fill: c.xeroxInk }),
          svgEl('circle', { cx: -33, cy: -2.5, r: 1.8, fill: c.celCream }),
          svgEl('path', {
            d: 'M -45 -18 L -17 -18 L -17 -4 Q -31 -1, -45 -4 Z',
            fill: c.moonAmber,
            ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
          }),
        ]),
        svgEl('ellipse', {
          cx: -31,
          cy: -5,
          rx: 12.2,
          ry: 11.2,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        svgEl('path', {
          d: 'M -18 -4 L -15 -6 M -22 -2 L -19 -1',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine }),
        }),
        // Gentle drowsy brows
        svgEl('path', {
          d: 'M -73 -19 Q -63 -22, -53 -18 M -41 -18 Q -31 -22, -21 -19',
          fill: 'none',
          ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }),
        }),
      ]),
      renderMoonMouth('sleepy'),
    ]);
  } else if (state === 'grumpy') {
    faceMarkup = svgEl('g', { 'data-part': 'moon-face-grumpy' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        // Left grumpy half-lidded eye
        celPath(
          'M -75.5 -11 L -50.5 -11 C -48.5 7, -77.5 7, -75.5 -11 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('circle', { cx: -63.5, cy: -2.5, r: 6.4, fill: c.nightcapShadow }),
        svgEl('circle', { cx: -63.5, cy: -2.5, r: 4.1, fill: c.xeroxInk }),
        svgEl('circle', { cx: -65.5, cy: -4.8, r: 2.0, fill: c.celCream }),
        // Heavy flat angry brow line
        svgEl('path', {
          d: 'M -78 -13.5 L -48 -10.0',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
        }),
        // Right grumpy half-lidded eye
        celPath(
          'M -43.5 -11 L -18.5 -11 C -16.5 7, -45.5 7, -43.5 -11 Z',
          c.celCream,
          { strokeWidth: s.xeroxMedium }
        ),
        svgEl('circle', { cx: -31.5, cy: -2.5, r: 6.4, fill: c.nightcapShadow }),
        svgEl('circle', { cx: -31.5, cy: -2.5, r: 4.1, fill: c.xeroxInk }),
        svgEl('circle', { cx: -33.5, cy: -4.8, r: 2.0, fill: c.celCream }),
        svgEl('path', {
          d: 'M -46 -10.0 L -16 -13.5',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
        }),
      ]),
      renderMoonMouth('grumpy'),
    ]);
  } else {
    // Warm awake / curious / looking_up classic Disney storybook eyes
    const isCurious = state === 'curious' || state === 'looking_up';
    const pupilShiftX = isCurious ? -2.6 : 0;
    const pupilShiftY = isCurious ? 1.4 : 0;
    const awakeClipL = `${pfx}-awake-eye-l`;
    const awakeClipR = `${pfx}-awake-eye-r`;

    faceMarkup = svgEl('g', { 'data-part': 'moon-face-awake' }, [
      svgEl('g', { 'data-part': 'eyes' }, [
        svgEl(
          'clipPath',
          { id: awakeClipL },
          svgEl('ellipse', { cx: -63, cy: -6, rx: 11.8, ry: 12.8 })
        ),
        svgEl(
          'clipPath',
          { id: awakeClipR },
          svgEl('ellipse', { cx: -31, cy: -6, rx: 11.8, ry: 12.8 })
        ),

        // --- Left warm storybook eye ---
        svgEl('ellipse', { cx: -63, cy: -6, rx: 11.8, ry: 12.8, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipL) }, [
          // Subtle upper-lid shadow arc
          svgEl('path', {
            d: 'M -76 -20 L -50 -20 L -50 -13.5 Q -63 -10.8, -76 -13.5 Z',
            fill: c.mochiCreamShadow,
            opacity: 0.45,
          }),
          // Deep twilight-blue iris with warm golden lower reflection
          svgEl('ellipse', {
            cx: round2(-63 + pupilShiftX),
            cy: round2(-4.8 + pupilShiftY),
            rx: 6.6,
            ry: 7.4,
            fill: c.nightcapShadow,
          }),
          svgEl('ellipse', {
            cx: round2(-62.5 + pupilShiftX),
            cy: round2(-1.4 + pupilShiftY),
            rx: 4.2,
            ry: 2.6,
            fill: c.mochiEyeIris,
            opacity: 0.65,
          }),
          // Warm charcoal pupil
          svgEl('ellipse', {
            cx: round2(-63 + pupilShiftX),
            cy: round2(-5.0 + pupilShiftY),
            rx: 4.2,
            ry: 5.0,
            fill: c.xeroxInk,
          }),
          // Dual classic Disney catchlights
          svgEl('circle', {
            cx: round2(-65.4 + pupilShiftX),
            cy: round2(-8.2 + pupilShiftY),
            r: 2.35,
            fill: c.celCream,
          }),
          svgEl('circle', {
            cx: round2(-60.6 + pupilShiftX),
            cy: round2(-2.2 + pupilShiftY),
            r: 1.05,
            fill: c.starGlow,
          }),
        ]),
        svgEl('ellipse', {
          cx: -63,
          cy: -6,
          rx: 11.8,
          ry: 12.8,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        // Expressive upper eyelid curve & outer lashes
        svgEl('path', {
          d: 'M -76.5 -9.5 Q -63 -21.5, -51.0 -10.5 M -75.0 -11.5 L -79.2 -14.2 M -72.2 -15.2 L -75.2 -18.2',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
        }),

        // --- Right warm storybook eye ---
        svgEl('ellipse', { cx: -31, cy: -6, rx: 11.8, ry: 12.8, fill: c.celCream }),
        svgEl('g', { 'clip-path': svgUrl(awakeClipR) }, [
          svgEl('path', {
            d: 'M -44 -20 L -18 -20 L -18 -13.5 Q -31 -10.8, -44 -13.5 Z',
            fill: c.mochiCreamShadow,
            opacity: 0.45,
          }),
          svgEl('ellipse', {
            cx: round2(-31 + pupilShiftX),
            cy: round2(-4.8 + pupilShiftY),
            rx: 6.6,
            ry: 7.4,
            fill: c.nightcapShadow,
          }),
          svgEl('ellipse', {
            cx: round2(-30.5 + pupilShiftX),
            cy: round2(-1.4 + pupilShiftY),
            rx: 4.2,
            ry: 2.6,
            fill: c.mochiEyeIris,
            opacity: 0.65,
          }),
          svgEl('ellipse', {
            cx: round2(-31 + pupilShiftX),
            cy: round2(-5.0 + pupilShiftY),
            rx: 4.2,
            ry: 5.0,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(-33.4 + pupilShiftX),
            cy: round2(-8.2 + pupilShiftY),
            r: 2.35,
            fill: c.celCream,
          }),
          svgEl('circle', {
            cx: round2(-28.6 + pupilShiftX),
            cy: round2(-2.2 + pupilShiftY),
            r: 1.05,
            fill: c.starGlow,
          }),
        ]),
        svgEl('ellipse', {
          cx: -31,
          cy: -6,
          rx: 11.8,
          ry: 12.8,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
        svgEl('path', {
          d: 'M -43.0 -10.5 Q -31 -21.5, -17.5 -9.5 M -19.0 -11.5 L -14.8 -14.2 M -21.8 -15.2 L -18.8 -18.2',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
        }),

        // Expressive storybook eyebrows
        svgEl('path', {
          d: isCurious
            ? 'M -73 -23 Q -63 -29, -53 -24 M -41 -24 Q -31 -29, -21 -23'
            : 'M -72 -22 Q -63 -26, -54 -22 M -40 -22 Q -31 -26, -22 -22',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium }),
        }),
      ]),
      renderMoonMouth('smile'),
    ]);
  }

  // 4. Softly Glowing Companion & Dangling Stars (`data-part="moon-stars"`)
  const starSpecs = [
    { cx: 28, cy: round2(-16 + starBob), r: 12.5, rot: round2(gentleRock * 3), fill: c.warmAmberGlow, phase: 0 },
    { cx: 46, cy: round2(34 - starBob * 0.7), r: 9.2, rot: -12, fill: c.starGlow, phase: 4 },
    { cx: 68, cy: round2(-68 - starBob * 0.6), r: 10.6, rot: 15, fill: c.moonCream, phase: 8 },
    { cx: -98, cy: round2(-72 + starBob * 0.5), r: 9.8, rot: -18, fill: c.warmAmberGlow, phase: 12 },
    { cx: -88, cy: round2(68 - starBob * 0.5), r: 8.2, rot: 10, fill: c.starGlow, phase: 6 },
  ];

  const companionStars = svgEl('g', { 'data-part': 'moon-stars' }, [
    // Delicate golden thread suspending dangling star from upper crescent horn
    svgEl('line', {
      x1: 32,
      y1: -84,
      x2: 28,
      y2: round2(-26 + starBob),
      stroke: c.goldTitle,
      'stroke-width': 1.35,
      'stroke-dasharray': '3 3',
      opacity: 0.85,
    }),
    // Render each companion star with soft optical glow halo + crisp cel star & highlight core
    ...starSpecs.map((st) => {
      const twinkle = round2(0.72 + Math.abs(steppedOscillate(frameIndex, 20, 0.28, st.phase)));
      const d = renderStarShape(st.cx, st.cy, st.r, st.rot);
      return svgEl('g', { opacity: twinkle }, [
        svgEl('circle', {
          cx: st.cx,
          cy: st.cy,
          r: round2(st.r * 0.95),
          fill: c.starGlow,
          opacity: 0.35,
          filter: softGlowUrl,
        }),
        celPath(d, st.fill, { strokeWidth: s.xeroxFine }),
        svgEl('circle', {
          cx: st.cx,
          cy: st.cy,
          r: round2(st.r * 0.24),
          fill: c.celCream,
          opacity: 0.85,
        }),
      ]);
    }),
  ]);

  // 5. Optional 2-Tone Cel-Shaded Velvet Nightcap (`data-part="moon-nightcap"`)
  const capBodyD =
    'M -88 -26 C -70 -94, -22 -128, 18 -134 C 24 -112, 32 -98, 38 -86 Z';
  const capCuffD =
    'M -94 -18 C -64 -72, -16 -102, 40 -90 L 34 -72 C -8 -78, -54 -50, -82 -4 Z';
  const capPomD =
    'M 18 -130 C 12 -140, 26 -146, 32 -136 C 40 -132, 34 -120, 24 -122 C 14 -120, 12 -126, 18 -130 Z';

  const nightcap = wearingNightcap
    ? svgEl('g', { 'data-part': 'moon-nightcap' }, [
        // Velvet nightcap crown with 2-tone cel folded shadow & soft moonlight highlight
        celShadedShape({
          clipId: `${pfx}-cap-body`,
          d: capBodyD,
          baseFill: c.nightcapBlue,
          shadowPaths: [
            // Deep velvet fold shadow along left-lower tuck
            'M -92 -24 C -72 -62, -26 -86, 38 -88 L 42 -78 L -90 -18 Z',
            'M -56 -72 C -34 -94, -6 -112, 18 -122 C 2 -106, -24 -86, -48 -66 Z',
          ],
          shadowFill: c.nightcapShadow,
          highlightPaths: [
            // Soft velvet moonlit rim along upper arch
            'M -72 -62 C -50 -100, -14 -124, 18 -133 L 19 -126 C -12 -116, -46 -94, -66 -58 Z',
          ],
          highlightFill: c.mochiFurRim,
          highlightOpacity: 0.45,
          strokeWidth: s.xeroxHeavy,
        }),
        // Clipped classic storybook soft stripes inside velvet cap
        svgEl('g', { 'clip-path': svgUrl(`${pfx}-cap-body`) }, [
          svgEl('path', {
            d: 'M -74 -55 C -44 -68, -6 -76, 32 -78 M -52 -88 C -24 -99, 4 -105, 26 -105',
            fill: 'none',
            ...celStrokeAttrs({
              stroke: c.nightcapStripe,
              strokeWidth: 4.0,
              opacity: 0.55,
            }),
          }),
          // Fold crease Xerox accent lines
          svgEl('path', {
            d: 'M -52 -66 Q -28 -84, -4 -92',
            fill: 'none',
            ...celStrokeAttrs({
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              opacity: 0.72,
            }),
          }),
        ]),
        // Re-stroke cap outline cleanly on top of clipped stripes
        svgEl('path', {
          d: capBodyD,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy }),
        }),
        // Plush upturned cream cuff with 2-tone shadow fold
        celShadedShape({
          clipId: `${pfx}-cap-cuff`,
          d: capCuffD,
          baseFill: c.celCream,
          shadowPaths: [
            'M -88 -14 C -58 -58, -10 -84, 38 -80 L 36 -68 L -84 2 Z',
          ],
          shadowFill: c.mochiCreamShadow,
          strokeWidth: s.xeroxMedium,
        }),
        // Fluffy 2-tone cel pom-pom at nightcap tip
        celShadedShape({
          clipId: `${pfx}-cap-pom`,
          d: capPomD,
          baseFill: c.celCream,
          shadowPaths: [
            'M 12 -128 C 18 -124, 28 -124, 36 -130 L 38 -118 L 12 -118 Z',
          ],
          shadowFill: c.mochiCreamShadow,
          highlightPaths: [
            'M 18 -134 C 22 -141, 28 -141, 30 -136 C 26 -136, 22 -135, 18 -134 Z',
          ],
          highlightFill: c.starGlow,
          highlightOpacity: 0.9,
          strokeWidth: s.xeroxMedium,
        }),
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
    [
      localDefs,
      glowHalo,
      svgEl('g', { filter: xeroxUrl }, [
        crescentBody,
        faceMarkup,
        companionStars,
        nightcap,
      ]),
    ]
  );
}

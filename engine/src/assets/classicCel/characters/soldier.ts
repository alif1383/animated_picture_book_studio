import { TOKENS } from '../../../theme/tokens';
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
import { renderStarShape } from '../../props/shared';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-soldier';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-soldier-${clean}` : 'cc-soldier';
}

interface SoldierHeadConfig {
  pfx: string;
  cx: number;
  cy: number;
  frameIndex: number;
  blink: boolean;
  speaking: boolean;
  alert?: boolean;
  cheerful?: boolean;
  sleeping?: boolean;
  headTilt?: number;
}

/**
 * Renders the loyal Royal Soldier's 1970s–80s Disney classic cel head & wide-brimmed steel
 * kettle helmet (*Robin Hood* 1973 / *The Sword in the Stone* guard aesthetic):
 * - 100% flat matte analog cel paint + raw `#xerox-ink` outlines + feathery graphite ticks
 * - Fully visible expressive 3/4 right-facing face below kettle-helm brim: warm Disney eyes,
 *   expressive brows, rustic nose, hair sideburns & chinstrap, and 4-phase 12 FPS cel lip-sync mouth
 * - Local origin `(0, 0)` at head center; helmet crown at `y: -18.5`, brim width `-15.8..+15.8`.
 */
function renderClassicSoldierHead(cfg: SoldierHeadConfig): string {
  const {
    pfx,
    cx,
    cy,
    frameIndex,
    blink,
    speaking,
    alert = false,
    cheerful = false,
    sleeping = false,
    headTilt = 0,
  } = cfg;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const eyeY = -1.6;
  const browY = -5.0;
  const noseY = 0.8;
  const mouthY = 4.4;

  // Classic Disney eyes (`data-part="eyes"`)
  let eyesMarkup: string;
  if (blink || sleeping) {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: `M -0.4 ${round2(eyeY + 0.5)} Q 2.0 ${round2(eyeY + 2.3)}, 4.2 ${round2(eyeY + 0.5)} M 6.4 ${round2(eyeY + 0.5)} Q 8.2 ${round2(eyeY + 2.2)}, 10.0 ${round2(eyeY + 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        `M -0.8 ${round2(browY + 0.6)} Q 1.8 ${round2(browY - 0.5)}, 4.4 ${round2(browY + 0.5)} M 6.4 ${round2(browY + 0.5)} Q 8.4 ${round2(browY - 0.5)}, 10.2 ${round2(browY + 0.5)}`,
        { stroke: c.woodDark, strokeWidth: 1.25, feather: true, opacity: 0.9 }
      ),
    ]);
  } else {
    const pupilDx = alert ? 0.75 : 0.45;
    const pupilDy = alert ? -0.25 : 0;

    const browPath = alert
      ? `M -0.8 ${round2(browY - 0.3)} Q 2.0 ${round2(browY + 0.8)}, 4.6 ${round2(browY + 1.4)} M 6.2 ${round2(browY + 1.3)} Q 8.2 ${round2(browY + 0.4)}, 10.4 ${round2(browY - 0.6)}`
      : cheerful || speaking
      ? `M -0.6 ${round2(browY + 0.2)} Q 2.0 ${round2(browY - 1.9)}, 4.4 ${round2(browY - 0.2)} M 6.4 ${round2(browY - 0.3)} Q 8.4 ${round2(browY - 1.9)}, 10.2 ${round2(browY + 0.1)}`
      : `M -0.6 ${round2(browY + 0.5)} Q 2.0 ${round2(browY - 0.9)}, 4.4 ${round2(browY + 0.3)} M 6.4 ${round2(browY + 0.3)} Q 8.4 ${round2(browY - 0.9)}, 10.2 ${round2(browY + 0.4)}`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Back-side (left) warm Disney eye
      svgEl('ellipse', {
        cx: 2.0,
        cy: eyeY,
        rx: 2.15,
        ry: 2.4,
        fill: c.celCream,
        ...celStrokeAttrs({ strokeWidth: 0.95, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(2.2 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 1.15,
        ry: 1.5,
        fill: c.woodMid,
      }),
      svgEl('ellipse', {
        cx: round2(2.3 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 0.8,
        ry: 1.1,
        fill: c.xeroxInk,
      }),
      svgEl('circle', {
        cx: round2(1.7 + pupilDx),
        cy: round2(eyeY - 0.75 + pupilDy),
        r: 0.5,
        fill: c.celCream,
      }),
      svgEl('path', {
        d: `M -0.4 ${round2(eyeY - 0.5)} Q 2.0 ${round2(eyeY - 3.0)}, 4.4 ${round2(eyeY - 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
      }),

      // Front-side (right) warm Disney eye
      svgEl('ellipse', {
        cx: 8.1,
        cy: eyeY,
        rx: 1.85,
        ry: 2.35,
        fill: c.celCream,
        ...celStrokeAttrs({ strokeWidth: 0.95, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(8.3 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 1.05,
        ry: 1.45,
        fill: c.woodMid,
      }),
      svgEl('ellipse', {
        cx: round2(8.4 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 0.72,
        ry: 1.05,
        fill: c.xeroxInk,
      }),
      svgEl('circle', {
        cx: round2(7.8 + pupilDx),
        cy: round2(eyeY - 0.75 + pupilDy),
        r: 0.48,
        fill: c.celCream,
      }),
      svgEl('path', {
        d: `M 6.0 ${round2(eyeY - 0.4)} Q 8.1 ${round2(eyeY - 3.0)}, 10.2 ${round2(eyeY - 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
      }),

      // Expressive feathery Xerox eyebrows
      xeroxSketchStroke(browPath, {
        stroke: c.woodDark,
        strokeWidth: 1.35,
        feather: true,
        opacity: 0.94,
      }),
    ]);
  }

  // 4-phase 12 FPS cel lip-sync mouth (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`)
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed friendly smile
      phaseShape = [
        svgEl('path', {
          d: `M 2.2 ${mouthY} Q 5.4 ${round2(mouthY + 1.9)}, 8.6 ${round2(mouthY - 0.3)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          `M 4.2 ${round2(mouthY + 2.0)} Q 5.6 ${round2(mouthY + 2.6)}, 6.8 ${round2(mouthY + 1.9)}`,
          { stroke: c.xeroxInkSoft, strokeWidth: 0.72, broken: true, opacity: 0.72 }
        ),
      ].join('');
    } else if (mouthPhase === 1) {
      // Phase 1: Soft rounded 'o' vowel
      phaseShape = [
        svgEl('ellipse', {
          cx: 5.7,
          cy: round2(mouthY + 0.8),
          rx: 1.9,
          ry: 2.1,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.2, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: `M 4.4 ${round2(mouthY + 1.9)} Q 5.7 ${round2(mouthY + 1.0)}, 7.0 ${round2(mouthY + 1.9)} C 6.5 ${round2(mouthY + 2.6)}, 4.9 ${round2(mouthY + 2.6)}, 4.4 ${round2(mouthY + 1.9)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Open animated guard shout / story mouth
      phaseShape = [
        celPath(
          `M 2.0 ${round2(mouthY - 0.4)} Q 5.5 ${round2(mouthY + 0.4)}, 9.0 ${round2(mouthY - 0.4)} C 8.4 ${round2(mouthY + 4.1)}, 2.6 ${round2(mouthY + 4.1)}, 2.0 ${round2(mouthY - 0.4)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.2 }
        ),
        svgEl('path', {
          d: `M 3.0 ${round2(mouthY - 0.1)} L 8.0 ${round2(mouthY - 0.2)} L 7.6 ${round2(mouthY + 0.8)} L 3.4 ${round2(mouthY + 0.8)} Z`,
          fill: c.celCream,
          stroke: 'none',
        }),
        svgEl('path', {
          d: `M 3.4 ${round2(mouthY + 2.3)} Q 5.5 ${round2(mouthY + 1.1)}, 7.6 ${round2(mouthY + 2.3)} C 6.8 ${round2(mouthY + 3.4)}, 4.2 ${round2(mouthY + 3.4)}, 3.4 ${round2(mouthY + 2.3)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else {
      // Phase 3: Half-open expressive mid-syllable grin
      phaseShape = [
        celPath(
          `M 2.3 ${round2(mouthY - 0.2)} Q 5.5 ${round2(mouthY + 0.6)}, 8.7 ${round2(mouthY - 0.3)} C 8.0 ${round2(mouthY + 2.6)}, 3.0 ${round2(mouthY + 2.6)}, 2.3 ${round2(mouthY - 0.2)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.2 }
        ),
        svgEl('path', {
          d: `M 3.7 ${round2(mouthY + 1.6)} Q 5.5 ${round2(mouthY + 0.8)}, 7.3 ${round2(mouthY + 1.6)} C 6.6 ${round2(mouthY + 2.3)}, 4.4 ${round2(mouthY + 2.3)}, 3.7 ${round2(mouthY + 1.6)} Z`,
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
      [phaseShape]
    );
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: alert
          ? `M 2.6 ${round2(mouthY + 0.3)} Q 5.5 ${round2(mouthY - 0.5)}, 8.4 ${round2(mouthY + 0.2)}`
          : cheerful
          ? `M 2.0 ${round2(mouthY - 0.2)} Q 5.5 ${round2(mouthY + 2.5)}, 8.8 ${round2(mouthY - 0.4)}`
          : `M 2.6 ${mouthY} Q 5.5 ${round2(mouthY + 1.8)}, 8.4 ${round2(mouthY - 0.2)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.35, useXeroxFilter: true }),
      }),
    ]);
  }

  // Sculpted 3/4 rounded guard face with sturdy chin
  const headD =
    'M -9.8 -5.5 C -10.6 -10.5, 9.8 -10.5, 10.6 -4.5 C 12.0 0.8, 10.8 7.5, 6.2 9.8 C 2.0 11.4, -5.8 10.2, -9.2 5.4 C -10.8 2.4, -10.4 -2.2, -9.8 -5.5 Z';
  // Classic medieval wide-brimmed steel kettle helmet sitting neatly above the brow
  const kettleHelmD =
    'M -12.6 -6.2 C -12.2 -18.5, 12.2 -18.5, 12.6 -6.2 L 15.8 -3.8 L -15.8 -3.8 Z';

  return svgEl(
    'g',
    {
      'data-part': 'soldier-helmet',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: headTilt,
        pivotX: 0,
        pivotY: 10,
      }),
    },
    [
      // Expressive guard face (`data-part="head"`)
      svgEl('g', { 'data-part': 'head' }, [
        celShadedShape({
          d: headD,
          baseFill: c.skinWarm,
          shadowFill: c.skinShadow,
          shadowPaths: [
            'M -11 -11 L -3.6 -11 L -3.6 12 L -11 12 Z',
            'M -9 7.2 L 11 7.2 L 11 12 L -9 12 Z',
          ],
          clipId: `${pfx}-face`,
          strokeWidth: s.xeroxMedium,
        }),
        // Rustic brown sideburn hair tuft & ear peeking under kettle helmet
        celPath(
          'M -9.8 -4.4 C -7.0 -4.8, -5.6 -2.2, -6.2 1.8 L -9.6 2.6 Z',
          c.woodDark,
          { strokeWidth: 0.95 }
        ),
        svgEl('ellipse', {
          cx: -9.4,
          cy: 1.0,
          rx: 2.1,
          ry: 2.8,
          fill: c.skinWarm,
          ...celStrokeAttrs({ strokeWidth: 1.1, useXeroxFilter: true }),
        }),
        // Leather helmet chinstrap
        xeroxSketchStroke('M -8.4 -3.6 Q -6.8 4.8, -1.6 9.8', {
          stroke: c.woodDark,
          strokeWidth: 1.5,
          opacity: 0.9,
        }),
        // Warm dusty-rose cheek tint (flat cel paint)
        svgEl('ellipse', {
          cx: 0.8,
          cy: 2.2,
          rx: 2.3,
          ry: 1.4,
          fill: c.dustyRose,
          opacity: 0.42,
        }),
        // Friendly sculpted guard nose
        svgEl('path', {
          d: `M 5.4 ${round2(eyeY + 0.5)} L 7.4 ${noseY} Q 6.4 ${round2(noseY + 1.6)}, 4.8 ${round2(noseY + 1.1)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.2, useXeroxFilter: true }),
        }),
        eyesMarkup,
        mouthMarkup,
      ]),

      // 2-tone matte cel-shaded medieval steel kettle helmet
      celShadedShape({
        d: kettleHelmD,
        baseFill: c.armorSteelMid,
        shadowFill: c.armorSteelShadow,
        shadowPaths: [
          'M -16 -19 L -4.5 -19 L -4.5 -3 L -16 -3 Z',
          'M -16 -5.4 L 16 -5.4 L 16 -3.2 L -16 -3.2 Z',
        ],
        highlightFill: c.armorSteelLight,
        highlightPaths: [
          'M -4.2 -16.8 C 1.2 -18.0, 7.6 -16.4, 10.0 -9.4 C 5.8 -11.4, 0.2 -12.0, -4.2 -11.2 Z',
        ],
        highlightOpacity: 0.94,
        clipId: `${pfx}-khelm`,
        strokeWidth: s.xeroxHeavy,
      }),
      // Antique-gold helmet rim band & rivets
      celPath('M -12.6 -7.2 L 12.6 -7.2 L 13.0 -5.2 L -13.0 -5.2 Z', c.antiqueGold, {
        strokeWidth: 0.95,
      }),
      svgEl('circle', { cx: -6.5, cy: -6.2, r: 0.9, fill: c.xeroxInk }),
      svgEl('circle', { cx: 0.5, cy: -6.2, r: 0.9, fill: c.xeroxInk }),
      svgEl('circle', { cx: 7.2, cy: -6.2, r: 0.9, fill: c.xeroxInk }),
      xeroxSketchStroke('M -1.0 -17.6 L -1.0 -7.6', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.72,
      }),
    ]
  );
}

/**
 * Renders the Soldier's wood-and-steel heater shield (`data-part="soldier-shield"`).
 */
function renderClassicSoldierShield(
  pfx: string,
  cx: number,
  cy: number,
  width = 20,
  height = 24
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const hw = width / 2;
  const topY = round2(cy - height * 0.48);
  const midY = round2(cy + height * 0.04);
  const botY = round2(cy + height * 0.52);

  const outerD = `M ${round2(cx - hw)} ${topY} L ${round2(cx + hw)} ${topY} L ${round2(cx + hw)} ${midY} C ${round2(cx + hw)} ${round2(botY - 4)}, ${cx} ${botY}, ${cx} ${botY} C ${cx} ${botY}, ${round2(cx - hw)} ${round2(botY - 4)}, ${round2(cx - hw)} ${midY} Z`;
  const innerHw = hw - 2.2;
  const innerD = `M ${round2(cx - innerHw)} ${round2(topY + 2.2)} L ${round2(cx + innerHw)} ${round2(topY + 2.2)} L ${round2(cx + innerHw)} ${midY} C ${round2(cx + innerHw)} ${round2(botY - 5.5)}, ${cx} ${round2(botY - 2.2)}, ${cx} ${round2(botY - 2.2)} C ${cx} ${round2(botY - 2.2)}, ${round2(cx - innerHw)} ${round2(botY - 5.5)}, ${round2(cx - innerHw)} ${midY} Z`;

  return svgEl('g', { 'data-part': 'soldier-shield' }, [
    // Steel rim
    celPath(outerD, c.armorSteelMid, { strokeWidth: s.xeroxMedium }),
    // Planking timber interior with vertical flat shadow band
    celShadedShape({
      d: innerD,
      baseFill: c.woodMid,
      shadowFill: c.woodDark,
      shadowPaths: [
        `M ${round2(cx - hw)} ${topY} L ${round2(cx - 1.5)} ${topY} L ${round2(cx - 1.5)} ${round2(botY + 2)} L ${round2(cx - hw)} ${round2(botY + 2)} Z`,
      ],
      clipId: `${pfx}-sshield`,
      strokeWidth: s.xeroxFine,
    }),
    // Hand-drawn plank seams
    xeroxSketchStroke(
      `M ${round2(cx - 3.6)} ${round2(topY + 3)} L ${round2(cx - 3.6)} ${round2(botY - 5)} M ${round2(cx + 3.6)} ${round2(topY + 3)} L ${round2(cx + 3.6)} ${round2(botY - 5)}`,
      { stroke: c.xeroxInkSoft, strokeWidth: 0.85, broken: true, opacity: 0.78 }
    ),
    // Antique-gold heraldic star boss
    celPath(renderStarShape(cx, round2(cy - 0.8), round2(width * 0.27), 0), c.antiqueGold, {
      strokeWidth: 0.95,
    }),
  ]);
}

/**
 * Renders the Royal Soldier (`'soldier'`) in Authentic 1970s–80s Classic Hand-Drawn Cel Style
 * (*Robin Hood* 1973 / *The Sword in the Stone* aesthetic) both **On Horseback (`mounted !== false`)**
 * and **On Foot (`mounted === false`)**:
 * - 100% FLAT OPAQUE MATTE ANALOG CEL PAINT + raw electrostatic `#xerox-ink` outlines +
 *   feathery internal graphite `xeroxSketchStroke` ticks + `celContactShadow`.
 * - Pure flat analog paint fills (no SVG gradients, no crayon patterns, no pure black/white).
 * - Loyal kettle-helmed guard in earthy Tudor crimson tunic (`soldierCrimson`/`soldierCrimsonShadow`),
 *   leather belt & gold buckle, wood-and-steel heater shield, and halberd/spear with fluttering pennant.
 * - Strictly faces RIGHT (`+X`) when `flipX: false`, with dedicated 3/4 walking profile
 *   (`data-walk-profile="true"`), 12 FPS squash-and-stretch, natural 12 FPS blinking
 *   (`isSteppedBlinkFrame(frameIndex, 42)`), and 4-phase 12 FPS cel lip-sync mouths
 *   (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`).
 * - Preserves exact ground-contact origin `(0, 0)` and exact bounds:
 *   - On-foot stand/walk/wave/reach: `x: -16..+43, y: -94..0` (helmet top ~`-80`, halberd tip ~`-94`)
 *   - On-foot resting (`sitting`/`sleeping`/`sleepy`): `x: -26..+24, y: -82..0` (`data-part="camp-log"`)
 *   - Mounted (`mounted: true` default) & `climbing`: chestnut cel horse (`horseChestnut`/`horseMane`)
 */
export function renderClassicSoldier(options: CharacterRenderOptions): string {
  const {
    state,
    frameIndex = 0,
    mounted = true,
    isSpeaking = false,
    id,
  } = options;

  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const drawStep = Math.floor(frameIndex / 2);

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'singing';
  const isResting =
    state === 'sitting' || state === 'sleeping' || state === 'sleepy';
  const isSleeping = state === 'sleeping';
  const isClimbing = state === 'climbing';
  const isReaching = state === 'reaching';
  const speakingActive = isSpeaking || state === 'singing';

  const blink =
    isSleeping ||
    state === 'blinking' ||
    isSteppedBlinkFrame(frameIndex, 42, 2, 9);

  const pennantWave = round2(
    steppedOscillate(frameIndex, 8, 2.8, -2) +
      deterministicJitter(drawStep, 29, 0.5)
  );

  // ─── ON-FOOT RIG (`mounted === false` and not mid-mount `'climbing'`) ───
  if (!mounted && !isClimbing) {
    // 1. Seated on Campfire Log (`sitting` / `sleeping` / `sleepy`)
    // Exact bounds: x: -26..+24, y: -82..0 with `data-part="camp-log"`
    if (isResting) {
      const restBreath = round2(steppedOscillate(frameIndex, 24, 0.85, 3));
      const zFloat = round2(steppedOscillate(frameIndex, 20, 2.2, 2));
      const zDrift = round2(steppedOscillate(frameIndex, 28, 1.5, 2));

      return svgEl(
        'g',
        {
          'data-art-style': 'classic_cel',
          'data-character': 'soldier',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
        },
        [
          celContactShadow(-1.5, 0.5, 22, 3.0, 0.32),

          // Warm wooden camp log seat underneath soldier (`data-part="camp-log"`)
          svgEl('g', { 'data-part': 'camp-log' }, [
            celShadedShape({
              d: 'M -22 -15 L 15.5 -15 C 21 -15, 21 -1.5, 15.5 -1.5 L -22 -1.5 C -25.5 -1.5, -25.5 -15, -22 -15 Z',
              baseFill: c.woodMid,
              shadowFill: c.woodDark,
              shadowPaths: ['M -26 -7 L 22 -7 L 22 0 L -26 0 Z'],
              highlightFill: c.woodLit,
              highlightPaths: ['M -22 -15 L 15.5 -15 L 15.5 -11.8 L -22 -11.8 Z'],
              clipId: `${pfx}-camp-log`,
              strokeWidth: s.xeroxHeavy,
            }),
            svgEl('ellipse', {
              cx: 15.5,
              cy: -8.2,
              rx: 3.8,
              ry: 6.5,
              fill: c.horseCream,
              ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
            }),
            svgEl('ellipse', {
              cx: 15.5,
              cy: -8.2,
              rx: 1.9,
              ry: 3.3,
              fill: 'none',
              ...celStrokeAttrs({
                stroke: c.woodMid,
                strokeWidth: 0.9,
                useXeroxFilter: true,
              }),
            }),
            xeroxSketchStroke(
              'M -19 -11.2 L -6 -11.2 M -14 -8.2 L 4 -8.2 M -20 -5.0 L -5 -5.0',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
            ),
          ]),

          // Upright halberd/spear resting beside log (`data-part="soldier-spear"`, tip at y = -82)
          svgEl('g', { 'data-part': 'soldier-spear' }, [
            svgEl('line', {
              x1: -14,
              y1: 0,
              x2: -20,
              y2: -72,
              stroke: c.woodDark,
              'stroke-width': 4.0,
              'stroke-linecap': 'round',
            }),
            svgEl('line', {
              x1: -14,
              y1: 0,
              x2: -20,
              y2: -72,
              stroke: c.woodMid,
              'stroke-width': 2.1,
              'stroke-linecap': 'round',
            }),
            celPath('M -23.2 -70 L -20 -82 L -16.2 -70 Z', c.armorSteelLight, {
              strokeWidth: s.xeroxFine,
            }),
            celPath(
              `M -19 -68 L ${round2(-5 + pennantWave * 0.3)} ${round2(-63 + pennantWave * 0.25)} L -18 -58 Z`,
              c.antiqueGold,
              { strokeWidth: s.xeroxFine }
            ),
          ]),

          // Seated bent hose legs & leather boots planted at y = 0 (`data-part="soldier-legs"`)
          svgEl('g', { 'data-part': 'soldier-legs' }, [
            celShadedShape({
              d: 'M -5 -20 L 12 -20 L 16 -5 L 7 -5 L 5 -13 L -5 -13 Z',
              baseFill: c.horseCream,
              shadowFill: c.boardToothWarm,
              shadowPaths: ['M -5 -15 L 16 -15 L 16 -5 L -5 -5 Z'],
              clipId: `${pfx}-rest-slegs`,
              strokeWidth: s.xeroxMedium,
            }),
            celPath(
              'M 7 -5.5 L 20 -5.5 C 22 -5.5, 22.4 -2.2, 21.8 0 L 7 0 Z',
              c.woodDark,
              { strokeWidth: s.xeroxFine }
            ),
          ]),

          // Seated Tudor crimson tunic, gesturing warming hand & heater shield (`data-part="soldier-torso"`)
          svgEl(
            'g',
            {
              'data-part': 'soldier-torso',
              transform: svgTransform({ y: round2(-restBreath * 0.4) }),
            },
            [
              celShadedShape({
                d: 'M -11 -48 L 10 -48 L 12 -18 L -11 -18 Z',
                baseFill: c.soldierCrimson,
                shadowFill: c.soldierCrimsonShadow,
                shadowPaths: ['M -12 -48 L -2 -48 L -2 -17 L -12 -17 Z'],
                clipId: `${pfx}-rest-storso`,
                strokeWidth: s.xeroxHeavy,
              }),
              // Leather belt & gold buckle
              celPath('M -11 -25 L 11.4 -25 L 11.6 -21.2 L -11 -21.2 Z', c.woodDark, {
                strokeWidth: s.xeroxFine,
              }),
              celPath('M 0.5 -25.4 L 5 -25.4 L 5 -20.8 L 0.5 -20.8 Z', c.antiqueGold, {
                strokeWidth: 0.95,
              }),
              // Arm gesturing / warming hand toward campfire (+X)
              celPath(
                'M 4 -38 L 19.8 -33 L 18 -27.2 L 4 -31.2 Z',
                c.soldierCrimson,
                { strokeWidth: s.xeroxMedium }
              ),
              svgEl('circle', {
                cx: 20.8,
                cy: -30.0,
                r: 3.1,
                fill: c.skinWarm,
                ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
              }),
              renderClassicSoldierShield(`${pfx}-rest`, -5, -26, 18, 22),
            ]
          ),

          // Seated Head & Steel Kettle Helmet (`data-part="soldier-helmet"`)
          renderClassicSoldierHead({
            pfx: `${pfx}-rest`,
            cx: 0,
            cy: round2(-57.5 - restBreath * 0.45),
            frameIndex,
            blink,
            speaking: speakingActive,
            cheerful: !isSleeping,
            sleeping: isSleeping,
            headTilt: isSleeping ? 6 : round2(steppedOscillate(frameIndex, 24, 1.8, 3)),
          }),

          // Floating hand-lettered serif 'z Z' when sleeping
          isSleeping
            ? svgEl(
                'text',
                {
                  'data-part': 'sleep-zzz',
                  x: round2(12 + zDrift),
                  y: round2(-75 + zFloat),
                  'font-family': TOKENS.classicCel.typography.fontFamilySerif,
                  'font-size': 12.5,
                  'font-style': 'italic',
                  'font-weight': 'bold',
                  fill: c.parchmentCream,
                  stroke: c.xeroxInk,
                  'stroke-width': 2.0,
                  'paint-order': 'stroke',
                },
                'z Z'
              )
            : '',
        ]
      );
    }

    // 2. Standing / Walking / Waving / Reaching on Foot (`idle`, `walking`, `waving`, `singing`, `reaching`)
    // Exact bounds: x: -16..+43, y: -94..0 (helmet top ~-80, halberd/spear tip ~-94)
    const walkSwing = isWalking ? steppedOscillate(frameIndex, 8, 19, 2) : 0;
    const footBob = isWalking
      ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.3, 1)))
      : isReaching
      ? 0
      : steppedOscillate(frameIndex, 18, 0.85, 2);
    const squashPulse = isWalking
      ? steppedOscillate(frameIndex, 4, 1, 1)
      : speakingActive
      ? steppedOscillate(frameIndex, 10, 0.55)
      : 0;
    const rigScaleX = round2(1 + squashPulse * 0.025);
    const rigScaleY = round2(1 - squashPulse * 0.025);
    const spearTilt = isWaving
      ? round2(steppedOscillate(frameIndex, 8, 10) - 14)
      : isWalking
      ? round2(14 + steppedOscillate(frameIndex, 8, 3.5, -1))
      : isReaching
      ? 28
      : 0;
    const headTilt = speakingActive
      ? steppedOscillate(frameIndex, 12, 2.8, 1)
      : isWalking
      ? steppedOscillate(frameIndex, 8, 2.0, -1)
      : steppedOscillate(frameIndex, 24, 1.1, 2);
    const shadowRx = round2(15.5 - footBob * 0.45);

    const onFootLegs = svgEl('g', { 'data-part': 'soldier-legs' }, [
      // Back far leg (muted cream shadow + dark leather boot)
      svgEl(
        'g',
        {
          'data-part': 'back-leg',
          transform: svgTransform({ x: -3, y: -22, rotate: -walkSwing }),
        },
        [
          celPath('M -3.6 0 L -3.6 16.5 L 3.4 16.5 L 3.4 0 Z', c.boardToothWarm, {
            strokeWidth: s.xeroxMedium,
          }),
          celPath(
            'M -3.8 16.0 L 7.6 16.0 C 9.4 16.0, 9.6 19.6, 8.8 22.0 L -3.8 22.0 Z',
            c.woodDark,
            { strokeWidth: s.xeroxFine }
          ),
        ]
      ),
      // Front near leg (warm ochre-cream hose + cuffed leather boot grounded at y = 0)
      svgEl(
        'g',
        {
          'data-part': 'front-leg',
          transform: svgTransform({ x: 3, y: -22, rotate: walkSwing }),
        },
        [
          celShadedShape({
            d: 'M -3.6 0 L -3.6 16.5 L 4.0 16.5 L 4.0 0 Z',
            baseFill: c.horseCream,
            shadowFill: c.boardToothWarm,
            shadowPaths: ['M -4 0 L -0.4 0 L -0.4 17 L -4 17 Z'],
            clipId: `${pfx}-foot-sfleg`,
            strokeWidth: s.xeroxMedium,
          }),
          celPath(
            'M -3.8 16.0 L 8.6 16.0 C 10.4 16.0, 10.8 19.6, 10.0 22.0 L -3.8 22.0 Z',
            c.woodMid,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M -2.2 18.8 L 6.6 18.8', {
            stroke: c.woodDark,
            strokeWidth: s.sketchLine,
          }),
        ]
      ),
    ]);

    // Wooden halberd/spear with steel leaf-blade & fluttering crimson/gold pennant (`data-part="soldier-spear"`)
    // Global tip: (11 + 16, -38 - 56) = (+27, -94); pennant tip: (11 + 32, -38 - 37) = (+43, -75)
    const onFootSpear = svgEl(
      'g',
      {
        'data-part': 'soldier-spear',
        transform: svgTransform({
          x: 11,
          y: -38,
          rotate: spearTilt,
        }),
      },
      [
        svgEl('line', {
          x1: -2,
          y1: 22,
          x2: 14,
          y2: -45,
          stroke: c.woodDark,
          'stroke-width': 4.2,
          'stroke-linecap': 'round',
        }),
        svgEl('line', {
          x1: -2,
          y1: 22,
          x2: 14,
          y2: -45,
          stroke: c.woodMid,
          'stroke-width': 2.2,
          'stroke-linecap': 'round',
        }),
        // Steel halberd side fluke & leaf-blade spear tip (y = -56 local -> -94 global!)
        celPath('M 11.2 -41.5 C 6.5 -43.5, 5.5 -37.5, 10.2 -36.0 Z', c.armorSteelMid, {
          strokeWidth: 1.0,
        }),
        celShadedShape({
          d: 'M 10.2 -44.0 L 16.0 -56.0 L 18.2 -42.5 Z',
          baseFill: c.armorSteelLight,
          shadowFill: c.armorSteelMid,
          shadowPaths: ['M 14.2 -46.0 L 16.0 -56.0 L 18.8 -42.0 Z'],
          clipId: `${pfx}-foot-spear`,
          strokeWidth: s.xeroxFine,
        }),
        // Fluttering crimson & antique-gold pennant (max x = 32 local -> +43 global!)
        celPath(
          `M 14.0 -42.0 L 31.8 ${round2(-37.0 + pennantWave * 0.45)} L 12.2 -32.2 Z`,
          c.soldierCrimson,
          { strokeWidth: s.xeroxFine }
        ),
        svgEl('path', {
          d: `M 14.0 -39.0 L 25.0 ${round2(-37.0 + pennantWave * 0.3)} L 13.4 -35.0 Z`,
          fill: c.antiqueGold,
          stroke: 'none',
        }),
      ]
    );

    // Earthy Tudor crimson tunic, steel shoulder caps, belt & wood-and-steel heater shield (`data-part="soldier-torso"`)
    const onFootTorso = svgEl('g', { 'data-part': 'soldier-torso' }, [
      celShadedShape({
        d: 'M -12.0 -52.0 L 10.4 -52.0 L 12.0 -22.0 L -12.0 -22.0 Z',
        baseFill: c.soldierCrimson,
        shadowFill: c.soldierCrimsonShadow,
        shadowPaths: ['M -13 -52 L -2.8 -52 L -2.8 -21 L -13 -21 Z'],
        clipId: `${pfx}-foot-storso`,
        strokeWidth: s.xeroxHeavy,
      }),
      // Steel shoulder cap & collar band
      celPath(
        'M -13.4 -50.8 C -13.6 -54.5, -5.2 -54.5, -4.6 -49.8 L -6.0 -43.5 L -12.8 -44.2 Z',
        c.armorSteelMid,
        { strokeWidth: s.xeroxFine }
      ),
      // Antique-gold tunic hem & leather belt with brass buckle
      celPath('M -12.0 -25.2 L 12.0 -25.2 L 12.0 -22.0 L -12.0 -22.0 Z', c.antiqueGold, {
        strokeWidth: 0.95,
      }),
      celPath('M -11.8 -31.0 L 11.4 -31.0 L 11.6 -26.8 L -11.8 -26.8 Z', c.woodDark, {
        strokeWidth: s.xeroxFine,
      }),
      celPath('M 0.5 -31.5 L 5.2 -31.5 L 5.2 -26.3 L 0.5 -26.3 Z', c.antiqueGold, {
        strokeWidth: 0.95,
      }),
      xeroxSketchStroke('M -8.2 -42.5 L -7.4 -34.0 M -8.8 -25.2 L -8.4 -22.5', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.78,
      }),
      // Guarding hand gripping spear shaft
      svgEl('circle', {
        cx: 11.5,
        cy: -37.5,
        r: 2.9,
        fill: c.skinWarm,
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      renderClassicSoldierShield(`${pfx}-foot`, isReaching ? 5 : 2.5, -35.5, 20, 24),
    ]);

    // Expressive face & wide-brimmed steel kettle helmet (crown strictly at y = -80!)
    const onFootHead = renderClassicSoldierHead({
      pfx: `${pfx}-foot`,
      cx: 0,
      cy: -61.5,
      frameIndex,
      blink,
      speaking: speakingActive,
      alert: isReaching,
      cheerful: isWaving || speakingActive,
      headTilt,
    });

    return svgEl(
      'g',
      {
        'data-art-style': 'classic_cel',
        'data-character': 'soldier',
        'data-state': state,
        'data-mounted': 'false',
        'data-facing': 'right',
        'data-walk-profile': isWalking ? 'true' : undefined,
      },
      [
        celContactShadow(1, 0.5, shadowRx, 2.8, 0.34),
        svgEl(
          'g',
          {
            transform: svgTransform({
              y: round2(-footBob),
              scaleX: rigScaleX,
              scaleY: rigScaleY,
            }),
          },
          [onFootLegs, onFootSpear, onFootTorso, onFootHead]
        ),
      ]
    );
  }

  // ─── HORSEBACK & MOUNTING/DISMOUNTING RIG (`mounted === true` or `state === 'climbing'`) ───
  const trotSwing = isWalking ? steppedOscillate(frameIndex, 8, 17, 2) : 0;
  const trotBackSwing = isWalking ? steppedOscillate(frameIndex, 8, 16, 1) : 0;
  const trotBob = isWalking
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.8, 1)))
    : isResting
    ? 0
    : steppedOscillate(frameIndex, 18, 1.0, 2);
  const trotSquash = isWalking ? steppedOscillate(frameIndex, 4, 0.02, 1) : 0;
  const horseScaleX = round2(1 + trotSquash);
  const horseScaleY = round2(1 - trotSquash);
  const spearTilt = isWaving
    ? round2(steppedOscillate(frameIndex, 8, 10) - 10)
    : isWalking
    ? round2(10 + steppedOscillate(frameIndex, 8, 3, -1))
    : 0;
  const riderMountOffsetY = isClimbing ? 15 : 0;
  const horseBlink =
    isSleeping || isSteppedBlinkFrame(frameIndex, 42, 2, 19);
  const horseTailSway = round2(steppedOscillate(frameIndex, 10, 5.2, -2));

  // 1. Articulated 1970s Disney Chestnut Horse Legs (`data-part="horse-legs"`)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        celPath(
          'M -32 -28 C -40 -14, -32 0, -16 0 L -12 -22 Z',
          c.horseChestnut,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M 8 -28 C 4 -14, 12 0, 26 0 L 22 -22 Z',
          c.horseChestnut,
          { strokeWidth: s.xeroxMedium }
        ),
      ])
    : svgEl('g', { 'data-part': 'horse-legs' }, [
        // Back-far hind leg (muted chestnut shadow)
        svgEl(
          'g',
          { transform: svgTransform({ x: -26, y: -28, rotate: -trotBackSwing * 0.8 }) },
          [
            celPath(
              'M -4.2 0 C -5.4 8, -5.8 16, -4.8 23.5 L 2.8 23.5 C 3.4 16, 4.0 8, 3.8 0 Z',
              c.horseChestnutShadow,
              { strokeWidth: s.xeroxMedium }
            ),
            celPath('M -5.0 23.0 L 5.8 23.0 L 6.8 28.0 L -5.0 28.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Front-far foreleg
        svgEl(
          'g',
          { transform: svgTransform({ x: 18, y: -28, rotate: trotSwing * 0.8 }) },
          [
            celPath(
              'M -4.0 0 C -3.8 8, -3.6 16, -3.0 23.5 L 4.0 23.5 C 4.2 16, 4.2 8, 3.8 0 Z',
              c.horseChestnutShadow,
              { strokeWidth: s.xeroxMedium }
            ),
            celPath('M -3.2 23.0 L 7.4 23.0 L 8.4 28.0 L -3.2 28.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Back-near hind leg
        svgEl(
          'g',
          { transform: svgTransform({ x: -16, y: -28, rotate: trotBackSwing }) },
          [
            celPath(
              'M -5.0 0 C -6.2 8, -6.6 16, -5.0 23.5 L 3.8 23.5 C 4.2 16, 4.8 8, 4.4 0 Z',
              c.horseChestnut,
              { strokeWidth: s.xeroxMedium }
            ),
            xeroxSketchStroke('M -3.6 12.2 Q -0.8 11.2, 1.8 12.2', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
            celPath('M -5.2 23.0 L 6.6 23.0 L 7.8 28.0 L -5.2 28.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Front-near foreleg
        svgEl(
          'g',
          { transform: svgTransform({ x: 25, y: -28, rotate: -trotSwing }) },
          [
            celPath(
              'M -4.2 0 C -4.0 8, -3.8 16, -3.2 23.5 L 4.8 23.5 C 5.0 16, 5.0 8, 4.2 0 Z',
              c.horseChestnut,
              { strokeWidth: s.xeroxMedium }
            ),
            xeroxSketchStroke('M -2.2 12.0 Q 0.4 11.2, 2.8 12.2', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
            celPath('M -3.6 23.0 L 7.8 23.0 L 9.0 28.0 L -3.6 28.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
      ]);

  // 2. Chestnut Cel Horse Tail, Barrel, Saddle Cloth & Expressive Head (`data-part="horse-body"`)
  const horseBody = svgEl('g', { 'data-part': 'horse-body' }, [
    // Flowing dark horse tail
    svgEl(
      'g',
      {
        'data-part': 'horse-tail',
        transform: svgTransform({ x: -39, y: -46, rotate: horseTailSway }),
      },
      [
        celPath(
          'M 0 0 C -16 -3, -24 10, -18 24 C -9 20, -4 12, 2 5 Z',
          c.horseMane,
          { strokeWidth: s.xeroxMedium }
        ),
      ]
    ),
    // Chestnut barrel with flat underside shadow
    celShadedShape({
      d: 'M -40 -42 C -42 -58, 28 -60, 34 -42 C 38 -26, -36 -24, -40 -42 Z',
      baseFill: c.horseChestnut,
      shadowFill: c.horseChestnutShadow,
      shadowPaths: ['M -42 -35 C -16 -30, 14 -30, 38 -37 L 38 -20 L -42 -20 Z'],
      clipId: `${pfx}-shorse-body`,
      strokeWidth: s.xeroxHeavy,
    }),
    xeroxSketchStroke(
      'M -30 -50 Q -24 -44, -24 -34 M 20 -48 Q 26 -41, 24 -32',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
    // Tudor crimson & antique-gold saddle blanket + leather saddle
    celShadedShape({
      d: 'M -20 -54 L 12 -54 L 15 -34 L -23 -34 Z',
      baseFill: c.soldierCrimson,
      shadowFill: c.soldierCrimsonShadow,
      shadowPaths: ['M -24 -40 L 16 -40 L 16 -33 L -24 -33 Z'],
      clipId: `${pfx}-ssaddle`,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M -21 -38 L 13 -38',
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 2.0,
      'stroke-dasharray': '4 2.5',
    }),
    celPath('M -15 -56 C -11 -51, 3 -51, 7 -56 L 8 -51 L -16 -51 Z', c.woodDark, {
      strokeWidth: s.xeroxFine,
    }),
    // Arched chestnut neck & Disney horse head facing RIGHT (+X)
    celShadedShape({
      d: 'M 18 -48 C 24 -70, 32 -84, 42 -86 C 48 -86, 60 -74, 58 -64 C 56 -58, 44 -58, 36 -52 C 32 -44, 26 -38, 18 -48 Z',
      baseFill: c.horseChestnut,
      shadowFill: c.horseChestnutShadow,
      shadowPaths: ['M 18 -52 C 28 -54, 40 -59, 60 -62 L 60 -48 L 18 -38 Z'],
      clipId: `${pfx}-shorse-neck`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Dark horse mane
    celPath(
      'M 15 -52 C 19 -66, 25 -79, 35 -86 C 30 -75, 26 -63, 22 -50 Z',
      c.horseMane,
      { strokeWidth: s.xeroxMedium }
    ),
    // Cream muzzle blaze & perked ear
    svgEl('path', {
      d: 'M 52 -74 C 56 -72, 59 -68, 57 -64 C 54 -63, 51 -66, 52 -74 Z',
      fill: c.horseCream,
      opacity: 0.78,
    }),
    celPath('M 34 -84 L 38 -95 L 44 -84 Z', c.horseChestnut, {
      strokeWidth: s.xeroxMedium,
    }),
    // Soulful blinking horse eye
    horseBlink
      ? svgEl('path', {
          d: 'M 42 -75 Q 45 -72, 48 -75',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
        })
      : svgEl('g', {}, [
          svgEl('ellipse', {
            cx: 45.2,
            cy: -75.2,
            rx: 2.5,
            ry: 2.8,
            fill: c.celCream,
            ...celStrokeAttrs({ strokeWidth: 0.95, useXeroxFilter: true }),
          }),
          svgEl('circle', { cx: 45.8, cy: -75.0, r: 1.5, fill: c.xeroxInk }),
          svgEl('circle', { cx: 45.0, cy: -76.0, r: 0.58, fill: c.celCream }),
        ]),
    // Leather bridle & reins
    svgEl('path', {
      d: 'M 38 -81 L 52 -68 M 50 -68 C 35 -63, 18 -63, 4 -68',
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 2.0,
      'stroke-linecap': 'round',
    }),
    svgEl('circle', {
      cx: 50,
      cy: -68,
      r: 1.8,
      fill: c.antiqueGold,
      ...celStrokeAttrs({ strokeWidth: 0.8, useXeroxFilter: true }),
    }),
  ]);

  // 3. Mounted Upright Spear with Pennant (`data-part="soldier-spear"`)
  const soldierSpear = svgEl(
    'g',
    {
      'data-part': 'soldier-spear',
      transform: svgTransform({
        x: 12,
        y: -68 + riderMountOffsetY,
        rotate: spearTilt,
      }),
    },
    [
      svgEl('line', {
        x1: 0,
        y1: 16,
        x2: 14,
        y2: -46,
        stroke: c.woodDark,
        'stroke-width': 4.2,
        'stroke-linecap': 'round',
      }),
      svgEl('line', {
        x1: 0,
        y1: 16,
        x2: 14,
        y2: -46,
        stroke: c.woodMid,
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
      }),
      celPath('M 10 -44 L 16 -56 L 18 -42 Z', c.armorSteelLight, {
        strokeWidth: s.xeroxFine,
      }),
      celPath(
        `M 14 -42 L 32 ${round2(-37 + pennantWave * 0.45)} L 12 -32 Z`,
        c.soldierCrimson,
        { strokeWidth: s.xeroxFine }
      ),
      svgEl('path', {
        d: `M 14 -39 L 25 ${round2(-37 + pennantWave * 0.3)} L 13.4 -35 Z`,
        fill: c.antiqueGold,
        stroke: 'none',
      }),
    ]
  );

  // 4. Mounted Soldier Crimson Tunic & Heater Shield (`data-part="soldier-torso"` / `"mounting-pose"`)
  const soldierTorso = svgEl(
    'g',
    {
      'data-part': isClimbing ? 'mounting-pose' : 'soldier-torso',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
      // Stirrup leg
      celPath('M -5 -54 L 4 -36 L 12 -34 L 5 -54 Z', c.horseCream, {
        strokeWidth: s.xeroxMedium,
      }),
      celPath('M 4 -37 L 13 -35 L 13 -31 L 4 -33 Z', c.woodDark, {
        strokeWidth: s.xeroxFine,
      }),
      // Trailing leg pushing off ground when climbing/dismounting
      isClimbing
        ? celPath('M -10 -50 L -14 -20 L -6 -20 L -4 -50 Z', c.boardToothWarm, {
            strokeWidth: s.xeroxMedium,
          })
        : '',
      celShadedShape({
        d: 'M -12 -82 L 10 -82 L 12 -52 L -12 -52 Z',
        baseFill: c.soldierCrimson,
        shadowFill: c.soldierCrimsonShadow,
        shadowPaths: ['M -13 -82 L -2.5 -82 L -2.5 -51 L -13 -51 Z'],
        clipId: `${pfx}-m-storso`,
        strokeWidth: s.xeroxHeavy,
      }),
      celPath('M -12 -58 L 11.5 -58 L 11.8 -54.5 L -12 -54.5 Z', c.antiqueGold, {
        strokeWidth: 0.95,
      }),
      renderClassicSoldierShield(`${pfx}-mounted`, 2, -64, 21, 25),
    ]
  );

  // 5. Mounted Soldier Head & Steel Kettle Helmet (`data-part="soldier-helmet"`)
  const soldierHead = renderClassicSoldierHead({
    pfx: `${pfx}-mounted`,
    cx: 0,
    cy: -91.5 + riderMountOffsetY,
    frameIndex,
    blink,
    speaking: speakingActive,
    cheerful: isWaving || speakingActive,
    sleeping: isSleeping,
    headTilt: speakingActive ? steppedOscillate(frameIndex, 12, 2.6, 1) : 0,
  });

  const sleepZzz = isSleeping
    ? svgEl(
        'text',
        {
          'data-part': 'sleep-zzz',
          x: 15,
          y: -112,
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
      )
    : '';

  return svgEl(
    'g',
    {
      'data-art-style': 'classic_cel',
      'data-character': 'soldier',
      'data-state': state,
      'data-mounted': isClimbing ? 'climbing' : 'true',
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      celContactShadow(-3, 0.8, 39, 4.2, 0.34),
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-trotBob),
            scaleX: horseScaleX,
            scaleY: horseScaleY,
          }),
        },
        [horseLegs, horseBody, soldierSpear, soldierTorso, soldierHead, sleepZzz]
      ),
    ]
  );
}

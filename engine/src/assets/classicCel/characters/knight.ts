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
  if (!raw) return 'cc-knight';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-knight-${clean}` : 'cc-knight';
}

interface KnightFaceConfig {
  pfx: string;
  cx: number;
  cy: number;
  frameIndex: number;
  blink: boolean;
  speaking: boolean;
  determined?: boolean;
  cheerful?: boolean;
  sleeping?: boolean;
  plumeSway: number;
  headTilt?: number;
}

/**
 * Renders Sir Rowan's 1970s–80s Disney classic cel plumed open-visored helmet & expressive
 * 3/4 right-facing face (*The Sword in the Stone* / *Robin Hood* aesthetic):
 * - 100% flat matte analog cel paint + raw `#xerox-ink` outlines + feathery graphite ticks
 * - Generous open face visor revealing warm expressive Disney eyes, feathery Xerox eyebrows,
 *   sculpted nose, hair lock under brow, and 4-phase 12 FPS cel lip-sync mouth
 * - Sweeping russet-crimson & antique-gold plume with overlapping follow-through sway
 * - Local origin `(0, 0)` at neck/collar junction; helmet crown at `y: -36` (`-30` for compact),
 *   plume crest at `y: -40`.
 */
function renderClassicKnightHelmetAndFace(
  cfg: KnightFaceConfig,
  compactCrouch = false
): string {
  const {
    pfx,
    cx,
    cy,
    frameIndex,
    blink,
    speaking,
    determined = false,
    cheerful = false,
    sleeping = false,
    plumeSway,
    headTilt = 0,
  } = cfg;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const drawStep = Math.floor(frameIndex / 2);
  const plumeWobble = round2(deterministicJitter(drawStep, 13, 0.75));
  const sway = round2(plumeSway + plumeWobble);

  // Compact vertical scale for crouch-spear pose keeps crown strictly at y = -70 & plume at y = -80
  const domeTopY = compactCrouch ? -24 : -34;
  const plumePeakY = compactCrouch ? -34 : -42;
  const faceTopY = compactCrouch ? -16 : -22;
  const faceBotY = compactCrouch ? -2 : -3;
  const eyeY = compactCrouch ? -10.4 : -13.6;
  const browY = compactCrouch ? -14.2 : -17.8;
  const noseY = compactCrouch ? -8.2 : -10.6;
  const mouthY = compactCrouch ? -5.0 : -6.6;

  // Sweeping russet-crimson & antique-gold horsehair plume (`data-part="knight-plume"`)
  const plumeBaseD = [
    `M -2.5 ${round2(domeTopY + 1.5)}`,
    `C -11.5 ${round2(plumePeakY + sway * 0.25)}, -25.5 ${round2(plumePeakY + 3.5 + sway * 0.45)}, -24.0 ${round2(domeTopY + 10.5 + sway * 0.55)}`,
    `C -17.5 ${round2(domeTopY + 7.5 + sway * 0.35)}, -10.0 ${round2(domeTopY + 6.5 + sway * 0.2)}, -1.0 ${round2(domeTopY + 7.2)} Z`,
  ].join(' ');
  const plumeGoldStreakD = [
    `M -4.5 ${round2(domeTopY + 2.8)}`,
    `C -12.0 ${round2(plumePeakY + 3.8 + sway * 0.25)}, -21.0 ${round2(plumePeakY + 6.2 + sway * 0.4)}, -21.2 ${round2(domeTopY + 8.6 + sway * 0.48)}`,
    `C -15.5 ${round2(domeTopY + 5.6 + sway * 0.3)}, -9.5 ${round2(domeTopY + 5.0 + sway * 0.18)}, -3.0 ${round2(domeTopY + 5.2)} Z`,
  ].join(' ');

  // Classic curved open-visor armet/sallet helmet bowl
  const helmetBowlD = compactCrouch
    ? 'M -13.0 -12.5 C -13.2 -24.0, 12.8 -24.0, 13.4 -13.0 L 13.8 -11.0 L -1.8 -14.8 L -4.2 -1.2 L 10.8 -1.2 L 10.4 0.5 L -12.8 0.5 Z'
    : 'M -14.2 -17.5 C -14.4 -34.0, 13.6 -34.0, 14.4 -18.5 L 15.0 -16.2 L -1.8 -20.5 L -4.8 -1.6 L 11.4 -1.6 L 11.0 0.6 L -14.0 0.6 Z';

  // Open visor face silhouette projecting subtly toward +X
  const faceD = compactCrouch
    ? `M -3.5 ${faceTopY} L 12.6 ${faceTopY} C 14.8 -11.5, 14.2 -4.5, 10.2 ${faceBotY} L -3.5 ${faceBotY} Z`
    : `M -4.2 ${faceTopY} L 13.4 ${faceTopY} C 15.8 -15.8, 15.0 -6.4, 10.8 ${faceBotY} L -4.2 ${faceBotY} Z`;

  // Classic Disney eyes (`data-part="eyes"`) — flat cel paint + Xerox lashes & feathery brows
  let eyesMarkup: string;
  if (blink || sleeping) {
    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: `M 0.8 ${round2(eyeY + 0.5)} Q 3.4 ${round2(eyeY + 2.4)}, 5.8 ${round2(eyeY + 0.5)} M 8.4 ${round2(eyeY + 0.5)} Q 10.4 ${round2(eyeY + 2.3)}, 12.4 ${round2(eyeY + 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        `M 0.4 ${round2(browY + 0.6)} Q 3.4 ${round2(browY - 0.6)}, 6.0 ${round2(browY + 0.4)} M 8.4 ${round2(browY + 0.4)} Q 10.6 ${round2(browY - 0.6)}, 12.6 ${round2(browY + 0.5)}`,
        { stroke: c.woodDark, strokeWidth: 1.25, feather: true, opacity: 0.9 }
      ),
    ]);
  } else {
    const pupilDx = determined ? 0.85 : 0.55;
    const pupilDy = determined ? -0.45 : 0;
    const eyeRxL = compactCrouch ? 2.15 : 2.45;
    const eyeRy = compactCrouch ? 2.25 : 2.75;
    const eyeRxR = compactCrouch ? 1.85 : 2.1;

    // Expressive Disney eyebrows (furrowed brave focus, raised cheerful/speaking, or warm neutral)
    const browPath = determined
      ? `M 0.2 ${round2(browY - 0.4)} Q 3.4 ${round2(browY + 0.8)}, 6.2 ${round2(browY + 1.5)} M 8.0 ${round2(browY + 1.4)} Q 10.2 ${round2(browY + 0.4)}, 12.8 ${round2(browY - 0.8)}`
      : cheerful || speaking
      ? `M 0.4 ${round2(browY + 0.2)} Q 3.2 ${round2(browY - 2.1)}, 6.0 ${round2(browY - 0.3)} M 8.2 ${round2(browY - 0.4)} Q 10.4 ${round2(browY - 2.1)}, 12.6 ${round2(browY + 0.1)}`
      : `M 0.5 ${round2(browY + 0.5)} Q 3.3 ${round2(browY - 1.1)}, 5.9 ${round2(browY + 0.2)} M 8.3 ${round2(browY + 0.2)} Q 10.5 ${round2(browY - 1.1)}, 12.5 ${round2(browY + 0.4)}`;

    eyesMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      // Back-side (left) almond eye
      svgEl('ellipse', {
        cx: 3.3,
        cy: eyeY,
        rx: eyeRxL,
        ry: eyeRy,
        fill: c.celCream,
        ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(3.5 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 1.35,
        ry: 1.75,
        fill: c.royalBlueTunic,
      }),
      svgEl('ellipse', {
        cx: round2(3.6 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 0.9,
        ry: 1.25,
        fill: c.xeroxInk,
      }),
      svgEl('circle', {
        cx: round2(2.9 + pupilDx),
        cy: round2(eyeY - 0.9 + pupilDy),
        r: 0.55,
        fill: c.celCream,
      }),
      // Bold Disney upper lash curve (left)
      svgEl('path', {
        d: `M ${round2(3.3 - eyeRxL - 0.3)} ${round2(eyeY - 0.5)} Q 3.3 ${round2(eyeY - eyeRy - 0.8)}, ${round2(3.3 + eyeRxL + 0.2)} ${round2(eyeY - 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.55, useXeroxFilter: true }),
      }),

      // Front-side (right) almond eye
      svgEl('ellipse', {
        cx: 10.3,
        cy: eyeY,
        rx: eyeRxR,
        ry: eyeRy,
        fill: c.celCream,
        ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: round2(10.5 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 1.2,
        ry: 1.7,
        fill: c.royalBlueTunic,
      }),
      svgEl('ellipse', {
        cx: round2(10.6 + pupilDx),
        cy: round2(eyeY + pupilDy),
        rx: 0.82,
        ry: 1.2,
        fill: c.xeroxInk,
      }),
      svgEl('circle', {
        cx: round2(10.0 + pupilDx),
        cy: round2(eyeY - 0.9 + pupilDy),
        r: 0.52,
        fill: c.celCream,
      }),
      // Bold Disney upper lash curve (right)
      svgEl('path', {
        d: `M ${round2(10.3 - eyeRxR - 0.2)} ${round2(eyeY - 0.4)} Q 10.3 ${round2(eyeY - eyeRy - 0.8)}, ${round2(10.3 + eyeRxR + 0.3)} ${round2(eyeY - 0.4)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.55, useXeroxFilter: true }),
      }),

      // Feathery Xerox graphite eyebrows
      xeroxSketchStroke(browPath, {
        stroke: c.woodDark,
        strokeWidth: 1.35,
        feather: true,
        opacity: 0.94,
      }),
    ]);
  }

  // 4-phase 12 FPS cel lip-sync mouth when speaking/singing, or expressive heroic grin
  let mouthMarkup: string;
  if (speaking) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed confident smile
      phaseShape = [
        svgEl('path', {
          d: `M 3.6 ${mouthY} Q 7.2 ${round2(mouthY + 2.2)}, 10.6 ${round2(mouthY - 0.3)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          `M 5.6 ${round2(mouthY + 2.2)} Q 7.2 ${round2(mouthY + 2.9)}, 8.6 ${round2(mouthY + 2.1)}`,
          { stroke: c.xeroxInkSoft, strokeWidth: 0.75, broken: true, opacity: 0.72 }
        ),
      ].join('');
    } else if (mouthPhase === 1) {
      // Phase 1: Rounded 'o' vowel mouth
      phaseShape = [
        svgEl('ellipse', {
          cx: 7.4,
          cy: round2(mouthY + 0.9),
          rx: 2.1,
          ry: 2.3,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: 1.25, useXeroxFilter: true }),
        }),
        svgEl('path', {
          d: `M 6.0 ${round2(mouthY + 2.1)} Q 7.4 ${round2(mouthY + 1.1)}, 8.8 ${round2(mouthY + 2.1)} C 8.3 ${round2(mouthY + 2.9)}, 6.5 ${round2(mouthY + 2.9)}, 6.0 ${round2(mouthY + 2.1)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Wide open animated speaking/shouting jaw with cream tooth edge & pink tongue
      phaseShape = [
        celPath(
          `M 3.2 ${round2(mouthY - 0.4)} Q 7.2 ${round2(mouthY + 0.4)}, 11.2 ${round2(mouthY - 0.5)} C 10.6 ${round2(mouthY + 4.4)}, 4.0 ${round2(mouthY + 4.4)}, 3.2 ${round2(mouthY - 0.4)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.25 }
        ),
        svgEl('path', {
          d: `M 4.4 ${round2(mouthY - 0.1)} L 10.0 ${round2(mouthY - 0.2)} L 9.6 ${round2(mouthY + 0.9)} L 4.8 ${round2(mouthY + 0.9)} Z`,
          fill: c.celCream,
          stroke: 'none',
        }),
        svgEl('path', {
          d: `M 4.8 ${round2(mouthY + 2.6)} Q 7.2 ${round2(mouthY + 1.3)}, 9.6 ${round2(mouthY + 2.6)} C 8.8 ${round2(mouthY + 3.8)}, 5.6 ${round2(mouthY + 3.8)}, 4.8 ${round2(mouthY + 2.6)} Z`,
          fill: c.mochiTongue,
          stroke: 'none',
        }),
      ].join('');
    } else {
      // Phase 3: Half-open expressive mid-syllable grin
      phaseShape = [
        celPath(
          `M 3.6 ${round2(mouthY - 0.2)} Q 7.2 ${round2(mouthY + 0.7)}, 10.8 ${round2(mouthY - 0.3)} C 10.0 ${round2(mouthY + 2.9)}, 4.4 ${round2(mouthY + 2.9)}, 3.6 ${round2(mouthY - 0.2)} Z`,
          c.mochiMouthInner,
          { strokeWidth: 1.25 }
        ),
        svgEl('path', {
          d: `M 5.2 ${round2(mouthY + 1.8)} Q 7.2 ${round2(mouthY + 1.0)}, 9.2 ${round2(mouthY + 1.8)} C 8.4 ${round2(mouthY + 2.6)}, 6.0 ${round2(mouthY + 2.6)}, 5.2 ${round2(mouthY + 1.8)} Z`,
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
  } else if (determined) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: `M 4.0 ${round2(mouthY + 0.4)} Q 7.2 ${round2(mouthY - 0.6)}, 10.6 ${round2(mouthY + 0.2)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
      }),
    ]);
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: cheerful
          ? `M 3.4 ${round2(mouthY - 0.2)} Q 7.2 ${round2(mouthY + 2.8)}, 11.0 ${round2(mouthY - 0.5)}`
          : `M 4.0 ${mouthY} Q 7.2 ${round2(mouthY + 2.0)}, 10.4 ${round2(mouthY - 0.3)}`,
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.4, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        `M 5.8 ${round2(mouthY + 2.1)} Q 7.2 ${round2(mouthY + 2.7)}, 8.4 ${round2(mouthY + 2.0)}`,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.72, broken: true, opacity: 0.7 }
      ),
    ]);
  }

  return svgEl(
    'g',
    {
      'data-part': 'knight-helmet',
      transform: svgTransform({
        x: cx,
        y: cy,
        rotate: headTilt,
        pivotX: 0,
        pivotY: 0,
      }),
    },
    [
      // Sweeping russet-crimson & antique-gold plume behind helmet crest
      svgEl('g', { 'data-part': 'knight-plume' }, [
        celPath(plumeBaseD, c.soldierCrimson, { strokeWidth: s.xeroxMedium }),
        svgEl('path', { d: plumeGoldStreakD, fill: c.antiqueGold, stroke: 'none' }),
        xeroxSketchStroke(
          `M -8.0 ${round2(domeTopY + 3.5)} Q -15.5 ${round2(plumePeakY + 5.5 + sway * 0.35)}, -21.8 ${round2(domeTopY + 7.5 + sway * 0.48)} M -10.5 ${round2(domeTopY + 5.4)} Q -16.5 ${round2(domeTopY + 5.5 + sway * 0.3)}, -21.0 ${round2(domeTopY + 10.0 + sway * 0.45)}`,
          { stroke: c.xeroxInk, strokeWidth: s.sketchLine, broken: true, opacity: 0.85 }
        ),
        // Antique-gold plume crest clasp
        celPath(
          `M -4.2 ${round2(domeTopY + 0.8)} L 2.2 ${round2(domeTopY + 0.4)} L 2.8 ${round2(domeTopY + 4.8)} L -4.6 ${round2(domeTopY + 5.2)} Z`,
          c.antiqueGold,
          { strokeWidth: s.xeroxFine }
        ),
      ]),

      // Open face base inside visor (`data-part="head"`)
      svgEl('g', { 'data-part': 'head' }, [
        celShadedShape({
          d: faceD,
          baseFill: c.skinWarm,
          shadowFill: c.skinShadow,
          shadowPaths: [
            `M -4.5 ${faceTopY} L 1.2 ${faceTopY} L 0.5 ${faceBotY} L -4.5 ${faceBotY} Z`,
            `M -3.5 ${round2(faceBotY - 2.6)} L 12.0 ${round2(faceBotY - 2.6)} L 12.0 ${round2(faceBotY + 1)} L -3.5 ${round2(faceBotY + 1)} Z`,
          ],
          clipId: `${pfx}-face`,
          strokeWidth: s.xeroxFine,
        }),
        // Warm brown hair lock peeking under visor brow
        celPath(
          `M -3.6 ${faceTopY} C -0.4 ${round2(faceTopY + 3.8)}, 3.4 ${round2(faceTopY + 2.6)}, 5.8 ${faceTopY} Z`,
          c.woodMid,
          { strokeWidth: 0.95 }
        ),
        // Soft dusty-rose cheek warmth (flat matte analog cel paint)
        svgEl('ellipse', {
          cx: 2.2,
          cy: round2(noseY + 1.8),
          rx: 2.4,
          ry: 1.4,
          fill: c.dustyRose,
          opacity: 0.42,
        }),
        // Classic Disney 3/4 nose bridge & tip
        svgEl('path', {
          d: `M 7.2 ${round2(eyeY + 0.6)} L 8.9 ${noseY} Q 8.0 ${round2(noseY + 1.5)}, 6.6 ${round2(noseY + 1.0)}`,
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.2, useXeroxFilter: true }),
        }),
        eyesMarkup,
        mouthMarkup,
      ]),

      // 2-tone matte cel-shaded polished steel helmet shell with visor ridge & chin guard
      celShadedShape({
        d: helmetBowlD,
        baseFill: c.armorSteelMid,
        shadowFill: c.armorSteelShadow,
        shadowPaths: [
          `M -15.5 -24 L -5.5 -24 L -5.5 2 L -15.5 2 Z`,
          `M -14.5 -4.5 L 12.0 -4.5 L 12.0 2.0 L -14.5 2.0 Z`,
        ],
        highlightFill: c.armorSteelLight,
        highlightPaths: [
          compactCrouch
            ? 'M -5.2 -22.2 C 0.5 -23.4, 7.6 -22.2, 10.8 -16.8 C 6.2 -18.2, 0.2 -18.8, -5.2 -17.6 Z'
            : 'M -6.0 -31.8 C 0.4 -33.2, 8.2 -31.4, 11.6 -22.8 C 6.8 -25.0, 0.2 -25.8, -6.0 -24.2 Z',
        ],
        highlightOpacity: 0.95,
        clipId: `${pfx}-helm`,
        strokeWidth: s.xeroxHeavy,
      }),

      // Raised antique-gold visor brow trim & side pivot rivet
      celPath(
        compactCrouch
          ? 'M -4.2 -16.0 Q 5.2 -18.5, 14.2 -14.2 L 13.6 -11.8 Q 5.0 -15.8, -3.6 -13.6 Z'
          : 'M -5.0 -22.0 Q 5.4 -25.2, 15.0 -19.2 L 14.4 -16.4 Q 5.2 -22.0, -4.4 -19.2 Z',
        c.antiqueGold,
        { strokeWidth: s.xeroxFine }
      ),
      svgEl('circle', {
        cx: -5.8,
        cy: compactCrouch ? -9.6 : -13.0,
        r: 2.0,
        fill: c.antiqueGold,
        ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
      }),
      // Feathery Xerox graphite helmet seam & cheek-plate sketch lines
      xeroxSketchStroke(
        compactCrouch
          ? 'M -9.2 -19.0 Q -7.2 -12.0, -8.4 -3.2 M -3.6 -11.0 L -3.6 -3.5'
          : 'M -9.8 -27.5 Q -7.8 -17.5, -9.0 -4.5 M -4.2 -16.5 L -4.2 -5.0',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),
    ]
  );
}

/**
 * Renders Sir Rowan's royal blue heater shield with polished steel rim & antique gold star crest.
 */
function renderClassicKnightShield(
  pfx: string,
  cx: number,
  cy: number,
  width = 22,
  height = 34
): string {
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const hw = width / 2;
  const topY = round2(cy - height * 0.48);
  const midY = round2(cy + height * 0.04);
  const botY = round2(cy + height * 0.52);

  const outerD = `M ${round2(cx - hw)} ${topY} L ${round2(cx + hw)} ${topY} L ${round2(cx + hw)} ${midY} C ${round2(cx + hw)} ${round2(botY - 5)}, ${cx} ${botY}, ${cx} ${botY} C ${cx} ${botY}, ${round2(cx - hw)} ${round2(botY - 5)}, ${round2(cx - hw)} ${midY} Z`;
  const innerHw = hw - 2.4;
  const innerD = `M ${round2(cx - innerHw)} ${round2(topY + 2.4)} L ${round2(cx + innerHw)} ${round2(topY + 2.4)} L ${round2(cx + innerHw)} ${midY} C ${round2(cx + innerHw)} ${round2(botY - 7)}, ${cx} ${round2(botY - 2.6)}, ${cx} ${round2(botY - 2.6)} C ${cx} ${round2(botY - 2.6)}, ${round2(cx - innerHw)} ${round2(botY - 7)}, ${round2(cx - innerHw)} ${midY} Z`;

  return svgEl('g', { 'data-part': 'knight-shield' }, [
    celPath(outerD, c.armorSteelLight, { strokeWidth: s.xeroxMedium }),
    celShadedShape({
      d: innerD,
      baseFill: c.royalBlueTunic,
      shadowFill: c.royalBlueShadow,
      shadowPaths: [
        `M ${round2(cx - hw)} ${topY} L ${round2(cx - 1)} ${topY} L ${round2(cx - 1)} ${round2(botY + 2)} L ${round2(cx - hw)} ${round2(botY + 2)} Z`,
      ],
      clipId: `${pfx}-shield`,
      strokeWidth: s.xeroxFine,
    }),
    // Antique gold heraldic star crest
    celPath(renderStarShape(cx, round2(cy - 1.5), round2(width * 0.31), 0), c.antiqueGold, {
      strokeWidth: 1.0,
    }),
    // Flat cel highlight notch on crest & steel rivets
    svgEl('circle', { cx: round2(cx - hw + 2.2), cy: round2(topY + 2.2), r: 0.9, fill: c.xeroxInk }),
    svgEl('circle', { cx: round2(cx + hw - 2.2), cy: round2(topY + 2.2), r: 0.9, fill: c.xeroxInk }),
    xeroxSketchStroke(
      `M ${round2(cx + 3)} ${round2(topY + 5)} L ${round2(cx + innerHw - 2)} ${round2(topY + 9)}`,
      { stroke: c.celCream, strokeWidth: 0.85, opacity: 0.65 }
    ),
  ]);
}

/**
 * Renders Sir Rowan's 1970s–80s Classic Hand-Drawn Cel Knight (`'knight'`, *Robin Hood* 1973 /
 * *The Sword in the Stone* aesthetic) both **On Horseback (`mounted !== false`)** and
 * **On Foot (`mounted === false`)**:
 * - 100% FLAT OPAQUE MATTE ANALOG CEL PAINT + raw electrostatic `#xerox-ink` outlines +
 *   feathery internal graphite `xeroxSketchStroke` ticks + `celContactShadow`.
 * - Pure flat analog paint fills (no SVG gradients, no crayon patterns, no pure black/white).
 * - Strictly faces RIGHT (`+X`) when `flipX: false`, with dedicated 3/4 walking profile
 *   (`data-walk-profile="true"`), 12 FPS organic squash-and-stretch, overlapping cape/plume sway,
 *   natural 12 FPS blinking (`isSteppedBlinkFrame(frameIndex, 42)`), and 4-phase 12 FPS cel lip-sync
 *   mouths (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`).
 * - Preserves exact ground-contact origin `(0, 0)` and exact bounds:
 *   - On-foot stand/walk/wave: `x: -36..+35, y: -110..0` (helmet top ~`-100`, lance tip ~`-110`)
 *   - On-foot resting (`sitting`/`sleeping`/`sleepy`): `x: -28..+27, y: -90..0` (`data-part="camp-log"`)
 *   - On-foot `reaching`: `data-part="crouch-spear-reach"`, helmet crown `-70`, plume `-80`,
 *     spear tip thrusting up-right to `(+106, -112)`
 *   - Mounted (`mounted: true` default) & `climbing` (`data-mounted="climbing"`): cream cel warhorse
 */
export function renderClassicKnight(options: CharacterRenderOptions): string {
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
    isSteppedBlinkFrame(frameIndex, 42, 2);

  // Overlapping 12 FPS cape & plume sway
  const capeFlutter = round2(
    steppedOscillate(frameIndex, 10, 5.5, -2) +
      deterministicJitter(drawStep, 19, 0.7)
  );
  const plumeSway = round2(steppedOscillate(frameIndex, 10, 4.2, -3));
  const pennantWave = round2(steppedOscillate(frameIndex, 8, 3.4, -2));

  // ─── ON-FOOT RIG (`mounted === false` and not mid-mount `'climbing'`) ───
  if (!mounted && !isClimbing) {
    // 1. Low Crouching / Ducking Upward Spear-Reach Pose (`state === 'reaching'`)
    // CRITICAL for Act III thorn pull: helmet crown y = -70, plume y = -80, spear tip (+106, -112)
    if (isReaching) {
      const spearJiggle = round2(steppedOscillate(frameIndex, 6, 1.6));
      const crouchPulse = steppedOscillate(frameIndex, 8, 0.014);
      const crouchScaleX = round2(1 + crouchPulse);
      const crouchScaleY = round2(1 - crouchPulse);

      return svgEl(
        'g',
        {
          'data-art-style': 'classic_cel',
          'data-character': 'knight',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
          'data-part': 'crouch-spear-reach',
        },
        [
          celContactShadow(4, 0.5, 26, 3.4, 0.34),

          svgEl(
            'g',
            {
              transform: svgTransform({
                scaleX: crouchScaleX,
                scaleY: crouchScaleY,
              }),
            },
            [
              // Fluttering crimson cape tucked low behind crouched back (`data-part="knight-cape"`)
              svgEl(
                'g',
                {
                  'data-part': 'knight-cape',
                  transform: svgTransform({
                    x: -10,
                    y: -42,
                    rotate: round2(capeFlutter * 0.9),
                  }),
                },
                [
                  celShadedShape({
                    d: 'M 0 0 C -17 4, -28 16, -24 30 C -13 28, -4 20, 4 8 Z',
                    baseFill: c.soldierCrimson,
                    shadowFill: c.soldierCrimsonShadow,
                    shadowPaths: [
                      'M -6 14 C -14 20, -22 24, -26 32 L 4 32 L 6 10 Z',
                    ],
                    clipId: `${pfx}-crouch-cape`,
                    strokeWidth: s.xeroxMedium,
                  }),
                  xeroxSketchStroke(
                    'M -6 8 Q -14 16, -20 24 M -2 12 Q -9 19, -15 26',
                    { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true }
                  ),
                ]
              ),

              // Kneeling / lunging armored legs & leather boots grounded at y = 0 (`data-part="knight-legs"`)
              svgEl('g', { 'data-part': 'knight-legs' }, [
                // Back kneeling armored leg (muted shadow steel for depth)
                celPath(
                  'M -18 -16 L -6 -2 L 4 -2 L -6 -18 Z',
                  c.armorSteelShadow,
                  { strokeWidth: s.xeroxMedium }
                ),
                celPath(
                  'M -20 -6.5 L -8 -6.5 L -7 0 L -22 0 C -22.5 -2.5, -21.5 -5.5, -20 -6.5 Z',
                  c.woodDark,
                  { strokeWidth: s.xeroxFine }
                ),
                // Front lunging leg with knee cop & planted leather boot
                celShadedShape({
                  d: 'M 1 -18.5 L 18 -18.5 L 22 -4.5 L 10 -4.5 L 8 -12 L 1 -12 Z',
                  baseFill: c.armorSteelMid,
                  shadowFill: c.armorSteelShadow,
                  shadowPaths: ['M 0 -13 L 19 -13 L 22 -4 L 0 -4 Z'],
                  highlightFill: c.armorSteelLight,
                  highlightPaths: ['M 4 -18 L 16 -18 L 18 -14 L 4 -14 Z'],
                  clipId: `${pfx}-crouch-fleg`,
                  strokeWidth: s.xeroxMedium,
                }),
                svgEl('circle', {
                  cx: 15.5,
                  cy: -14.5,
                  r: 3.0,
                  fill: c.armorSteelLight,
                  ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
                }),
                celPath(
                  'M 10 -5.5 L 24.5 -5.5 C 26.8 -5.5, 27.2 -2.2, 26.5 0 L 10 0 Z',
                  c.woodMid,
                  { strokeWidth: s.xeroxFine }
                ),
                xeroxSketchStroke('M 14 -3.2 L 22 -3.2', {
                  stroke: c.woodDark,
                  strokeWidth: s.sketchLine,
                }),
              ]),

              // Crouched torso, royal blue surcoat & heater shield (`data-part="knight-armor"`)
              svgEl('g', { 'data-part': 'knight-armor' }, [
                celShadedShape({
                  d: 'M -12 -46 L 14 -46 L 16 -16 L -12 -16 Z',
                  baseFill: c.royalBlueTunic,
                  shadowFill: c.royalBlueShadow,
                  shadowPaths: ['M -13 -47 L -3 -47 L -3 -15 L -13 -15 Z'],
                  clipId: `${pfx}-crouch-torso`,
                  strokeWidth: s.xeroxHeavy,
                }),
                // Steel shoulder pauldron & gold belt
                celPath(
                  'M -13.5 -45.5 C -13.5 -50.2, -3.5 -50.2, -2.5 -44.5 L -4.5 -38.0 L -13.0 -38.5 Z',
                  c.armorSteelLight,
                  { strokeWidth: s.xeroxFine }
                ),
                celPath('M -12 -22 L 15 -22 L 15.4 -18 L -12 -18 Z', c.woodDark, {
                  strokeWidth: s.xeroxFine,
                }),
                celPath('M 1 -22.6 L 6 -22.6 L 6 -17.4 L 1 -17.4 Z', c.antiqueGold, {
                  strokeWidth: 1.0,
                }),
                xeroxSketchStroke(
                  'M -8 -36 Q -1 -33, 6 -36 M -6 -28 Q 1 -26, 8 -28',
                  { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true }
                ),
                renderClassicKnightShield(`${pfx}-crouch`, 2, -28, 20, 28),
              ]),

              // Upward-Angled Long Spear reaching into Dragon's open mouth at (+106, -112) (`data-part="knight-lance"`)
              svgEl(
                'g',
                {
                  'data-part': 'knight-lance',
                  transform: svgTransform({
                    x: 8,
                    y: round2(-32 + spearJiggle),
                  }),
                },
                [
                  // Back gauntleted hand supporting lower shaft
                  celPath(
                    'M -10 2 C -12 -1, -7 -4, -4 -1 L -2 4 C -5 6, -9 5, -10 2 Z',
                    c.armorSteelLight,
                    { strokeWidth: s.xeroxFine }
                  ),
                  // Sturdy hand-drawn wooden ash shaft
                  svgEl('line', {
                    x1: -12,
                    y1: 10,
                    x2: 88,
                    y2: -72,
                    stroke: c.woodDark,
                    'stroke-width': 5.4,
                    'stroke-linecap': 'round',
                  }),
                  svgEl('line', {
                    x1: -12,
                    y1: 10,
                    x2: 88,
                    y2: -72,
                    stroke: c.woodMid,
                    'stroke-width': 3.1,
                    'stroke-linecap': 'round',
                  }),
                  xeroxSketchStroke(
                    'M 4 -3 L 18 -14 M 34 -28 L 48 -39 M 62 -51 L 74 -61',
                    { stroke: c.woodLit, strokeWidth: 0.85, broken: true, opacity: 0.72 }
                  ),
                  // Forward armored gauntlet gripping shaft
                  celPath(
                    'M 8 -14 L 18 -20 L 21 -14 L 11 -8 Z',
                    c.armorSteelMid,
                    { strokeWidth: s.xeroxFine }
                  ),
                  // Gleaming 2-tone matte cel steel spearhead tipping at (98, -80) -> global (+106, -112)!
                  celShadedShape({
                    d: 'M 79 -67 L 98 -80 L 89 -59 L 83 -64 Z',
                    baseFill: c.armorSteelLight,
                    shadowFill: c.armorSteelMid,
                    shadowPaths: ['M 84 -65 L 98 -80 L 90 -58 Z'],
                    clipId: `${pfx}-crouch-tip`,
                    strokeWidth: s.xeroxFine,
                  }),
                  // Crisp analog parchment & antique-gold starburst glint at tip (zero neon!)
                  celPath(
                    renderStarShape(98, -80, 6.8, (drawStep % 6) * 18),
                    c.antiqueGold,
                    { strokeWidth: 0.95 }
                  ),
                  svgEl('circle', {
                    cx: 98,
                    cy: -80,
                    r: 2.0,
                    fill: c.celCream,
                  }),
                ]
              ),

              // Low tucked plumed helmet (crown strictly y = -70, plume y = -80!)
              renderClassicKnightHelmetAndFace(
                {
                  pfx: `${pfx}-crouch`,
                  cx: 0.5,
                  cy: -46,
                  frameIndex,
                  blink,
                  speaking: speakingActive,
                  determined: true,
                  plumeSway: round2(plumeSway * 0.7),
                  headTilt: -4,
                },
                true
              ),
            ]
          ),
        ]
      );
    }

    // 2. Seated on Campfire Log (`sitting` / `sleeping` / `sleepy`)
    // Exact bounds: x: -28..+27, y: -90..0 with `data-part="camp-log"`
    if (isResting) {
      const restBreath = round2(steppedOscillate(frameIndex, 24, 0.9));
      const zFloat = round2(steppedOscillate(frameIndex, 20, 2.4));
      const zDrift = round2(steppedOscillate(frameIndex, 28, 1.6));

      return svgEl(
        'g',
        {
          'data-art-style': 'classic_cel',
          'data-character': 'knight',
          'data-state': state,
          'data-mounted': 'false',
          'data-facing': 'right',
        },
        [
          celContactShadow(-2, 0.5, 24, 3.2, 0.32),

          // Warm wooden camp log seat underneath Sir Rowan (`data-part="camp-log"`)
          svgEl('g', { 'data-part': 'camp-log' }, [
            celShadedShape({
              d: 'M -24 -16 L 17 -16 C 22.5 -16, 22.5 -1.5, 17 -1.5 L -24 -1.5 C -27.5 -1.5, -27.5 -16, -24 -16 Z',
              baseFill: c.woodMid,
              shadowFill: c.woodDark,
              shadowPaths: ['M -28 -7.5 L 23 -7.5 L 23 0 L -28 0 Z'],
              highlightFill: c.woodLit,
              highlightPaths: ['M -24 -16 L 17 -16 L 17 -12.5 L -24 -12.5 Z'],
              clipId: `${pfx}-camp-log`,
              strokeWidth: s.xeroxHeavy,
            }),
            // Cut timber end rings
            svgEl('ellipse', {
              cx: 17,
              cy: -8.8,
              rx: 4.2,
              ry: 7.0,
              fill: c.horseCream,
              ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
            }),
            svgEl('ellipse', {
              cx: 17,
              cy: -8.8,
              rx: 2.1,
              ry: 3.6,
              fill: 'none',
              ...celStrokeAttrs({
                stroke: c.woodMid,
                strokeWidth: 0.95,
                useXeroxFilter: true,
              }),
            }),
            xeroxSketchStroke(
              'M -21 -12 L -8 -12 M -16 -9 L 4 -9 M -22 -5.5 L -6 -5.5 M 2 -5.5 L 11 -5.5',
              { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.82 }
            ),
          ]),

          // Resting crimson cape draped behind log (`data-part="knight-cape"`)
          svgEl('g', { 'data-part': 'knight-cape' }, [
            celShadedShape({
              d: 'M -8 -48 C -21 -38, -27 -18, -21 -4 C -13 -6, -8 -18, -4 -36 Z',
              baseFill: c.soldierCrimson,
              shadowFill: c.soldierCrimsonShadow,
              shadowPaths: ['M -28 -26 L -12 -26 L -12 -2 L -28 -2 Z'],
              clipId: `${pfx}-rest-cape`,
              strokeWidth: s.xeroxMedium,
            }),
            xeroxSketchStroke('M -15 -34 Q -19 -22, -18 -9', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
          ]),

          // Upright lance resting beside log (`data-part="knight-lance"`, tip at y = -90)
          svgEl('g', { 'data-part': 'knight-lance' }, [
            svgEl('line', {
              x1: -16,
              y1: 0,
              x2: -22,
              y2: -78,
              stroke: c.woodDark,
              'stroke-width': 4.4,
              'stroke-linecap': 'round',
            }),
            svgEl('line', {
              x1: -16,
              y1: 0,
              x2: -22,
              y2: -78,
              stroke: c.woodMid,
              'stroke-width': 2.4,
              'stroke-linecap': 'round',
            }),
            celPath('M -25.2 -76 L -22 -90 L -18.2 -76 Z', c.armorSteelLight, {
              strokeWidth: s.xeroxFine,
            }),
          ]),

          // Seated bent armored legs & leather boots planted at y = 0 (`data-part="knight-legs"`)
          svgEl('g', { 'data-part': 'knight-legs' }, [
            celShadedShape({
              d: 'M -6 -22 L 14 -22 L 18 -5 L 8 -5 L 6 -14 L -6 -14 Z',
              baseFill: c.armorSteelMid,
              shadowFill: c.armorSteelShadow,
              shadowPaths: ['M -6 -16 L 18 -16 L 18 -5 L -6 -5 Z'],
              highlightFill: c.armorSteelLight,
              highlightPaths: ['M -4 -22 L 13 -22 L 14 -18.5 L -4 -18.5 Z'],
              clipId: `${pfx}-rest-legs`,
              strokeWidth: s.xeroxMedium,
            }),
            svgEl('circle', {
              cx: 12.5,
              cy: -18,
              r: 2.6,
              fill: c.armorSteelLight,
              ...celStrokeAttrs({ strokeWidth: 0.95, useXeroxFilter: true }),
            }),
            celPath(
              'M 8 -5.5 L 22 -5.5 C 24.2 -5.5, 24.5 -2.2, 23.8 0 L 8 0 Z',
              c.woodDark,
              { strokeWidth: s.xeroxFine }
            ),
          ]),

          // Seated torso, royal blue surcoat, warming hand & shield (`data-part="knight-armor"`)
          svgEl(
            'g',
            {
              'data-part': 'knight-armor',
              transform: svgTransform({ y: round2(-restBreath * 0.4) }),
            },
            [
              celShadedShape({
                d: 'M -12 -52 L 12 -52 L 13 -20 L -12 -20 Z',
                baseFill: c.royalBlueTunic,
                shadowFill: c.royalBlueShadow,
                shadowPaths: ['M -13 -52 L -2 -52 L -2 -19 L -13 -19 Z'],
                clipId: `${pfx}-rest-torso`,
                strokeWidth: s.xeroxHeavy,
              }),
              celPath('M -12 -26 L 13 -26 L 13 -22 L -12 -22 Z', c.woodDark, {
                strokeWidth: s.xeroxFine,
              }),
              // Outstretched arm warming hand by campfire
              celPath(
                'M 4 -42 L 21.5 -36 L 20 -30.5 L 4 -34.5 Z',
                c.armorSteelMid,
                { strokeWidth: s.xeroxMedium }
              ),
              svgEl('circle', {
                cx: 22.8,
                cy: -33,
                r: 3.4,
                fill: c.skinWarm,
                ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
              }),
              renderClassicKnightShield(`${pfx}-rest`, -5, -28, 18, 28),
            ]
          ),

          // Seated Plumed Helmet & Expressive Face (`data-part="knight-helmet"`)
          renderClassicKnightHelmetAndFace({
            pfx: `${pfx}-rest`,
            cx: 0,
            cy: round2(-48 - restBreath * 0.45),
            frameIndex,
            blink,
            speaking: speakingActive,
            cheerful: !isSleeping,
            sleeping: isSleeping,
            plumeSway: round2(plumeSway * 0.45),
            headTilt: isSleeping ? 6 : round2(steppedOscillate(frameIndex, 24, 1.8)),
          }),

          // Floating hand-lettered serif 'z Z' when sleeping
          isSleeping
            ? svgEl(
                'text',
                {
                  'data-part': 'sleep-zzz',
                  x: round2(13 + zDrift),
                  y: round2(-82 + zFloat),
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
            : '',
        ]
      );
    }

    // 3. Standing / Walking / Waving / Singing on Foot (`idle`, `walking`, `waving`, `singing`)
    // Exact bounds: x: -36..+35, y: -110..0 (helmet top ~-100, upright lance tip ~-110)
    const walkSwing = isWalking ? steppedOscillate(frameIndex, 8, 21) : 0;
    const footBob = isWalking
      ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.5)))
      : steppedOscillate(frameIndex, 18, 0.9);
    const squashPulse = isWalking
      ? steppedOscillate(frameIndex, 4, 1)
      : speakingActive
      ? steppedOscillate(frameIndex, 10, 0.6)
      : 0;
    const rigScaleX = round2(1 + squashPulse * 0.026);
    const rigScaleY = round2(1 - squashPulse * 0.026);
    const lanceWave = isWaving
      ? round2(steppedOscillate(frameIndex, 8, 12) - 16)
      : isWalking
      ? round2(14 + steppedOscillate(frameIndex, 8, 4, -1))
      : 0;
    const headTilt = speakingActive
      ? steppedOscillate(frameIndex, 12, 3.0)
      : isWalking
      ? steppedOscillate(frameIndex, 8, 2.2, -1)
      : isWaving
      ? round2(2.5 + steppedOscillate(frameIndex, 10, 2.2))
      : steppedOscillate(frameIndex, 24, 1.2);
    const shadowRx = round2(19.5 - footBob * 0.5);

    const onFootCape = svgEl(
      'g',
      {
        'data-part': 'knight-cape',
        transform: svgTransform({
          x: -8,
          y: -58,
          rotate: round2(capeFlutter * (isWalking ? 1.15 : 0.8)),
        }),
      },
      [
        celShadedShape({
          d: 'M 0 0 C -17 6, -26 22, -21 41 C -11 39, -3 26, 4 10 Z',
          baseFill: c.soldierCrimson,
          shadowFill: c.soldierCrimsonShadow,
          shadowPaths: ['M -28 16 C -16 20, -6 18, 6 12 L 6 44 L -28 44 Z'],
          clipId: `${pfx}-foot-cape`,
          strokeWidth: s.xeroxMedium,
        }),
        xeroxSketchStroke(
          'M -6 10 Q -14 22, -17 35 M -1 14 Q -8 24, -11 34',
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.8 }
        ),
      ]
    );

    const onFootLegs = svgEl('g', { 'data-part': 'knight-legs' }, [
      // Far leg pivoting from hip center (-3, -24) — muted shadow steel for 3/4 depth
      svgEl(
        'g',
        {
          'data-part': 'back-leg',
          transform: svgTransform({ x: -3, y: -24, rotate: -walkSwing }),
        },
        [
          celPath(
            'M -4.2 0 L -4.4 18.2 L 4.0 18.2 L 4.2 0 Z',
            c.armorSteelShadow,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M -4.4 17.6 L 8.2 17.6 C 10.2 17.6, 10.6 21.5, 9.8 24.0 L -4.4 24.0 Z',
            c.woodDark,
            { strokeWidth: s.xeroxFine }
          ),
        ]
      ),
      // Near leg pivoting from hip center (+3, -24) — lit 2-tone cel steel greave + knee cop + boot
      svgEl(
        'g',
        {
          'data-part': 'front-leg',
          transform: svgTransform({ x: 3, y: -24, rotate: walkSwing }),
        },
        [
          celShadedShape({
            d: 'M -4.2 0 L -4.4 18.2 L 4.8 18.2 L 5.0 0 Z',
            baseFill: c.armorSteelMid,
            shadowFill: c.armorSteelShadow,
            shadowPaths: ['M -5 0 L -0.5 0 L -0.5 19 L -5 19 Z'],
            highlightFill: c.armorSteelLight,
            highlightPaths: ['M 1.2 0 L 4.8 0 L 4.8 18 L 1.2 18 Z'],
            clipId: `${pfx}-foot-fleg`,
            strokeWidth: s.xeroxMedium,
          }),
          // Steel poleyn knee cop
          svgEl('ellipse', {
            cx: 0.6,
            cy: 9.0,
            rx: 3.4,
            ry: 2.6,
            fill: c.armorSteelLight,
            ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
          }),
          // Cuffed medieval leather boot grounded at y = 24 (local) -> 0 (global)
          celPath(
            'M -4.5 17.6 L 9.4 17.6 C 11.4 17.6, 11.8 21.5, 11.0 24.0 L -4.5 24.0 Z',
            c.woodMid,
            { strokeWidth: s.xeroxFine }
          ),
          xeroxSketchStroke('M -2.5 20.5 L 7.5 20.5', {
            stroke: c.woodDark,
            strokeWidth: s.sketchLine,
          }),
        ]
      ),
    ]);

    // Upright medieval lance (`data-part="knight-lance"`, tip at ~(+33, -110))
    const onFootLance = svgEl(
      'g',
      {
        'data-part': 'knight-lance',
        transform: svgTransform({
          x: 10,
          y: -44,
          rotate: lanceWave,
        }),
      },
      [
        svgEl('line', {
          x1: -4,
          y1: 24,
          x2: 19,
          y2: -52,
          stroke: c.woodDark,
          'stroke-width': 4.8,
          'stroke-linecap': 'round',
        }),
        svgEl('line', {
          x1: -4,
          y1: 24,
          x2: 19,
          y2: -52,
          stroke: c.woodMid,
          'stroke-width': 2.6,
          'stroke-linecap': 'round',
        }),
        // Polished steel lance tip (global y = -44 - 66 = -110)
        celShadedShape({
          d: 'M 14.5 -48 L 23.0 -66.0 L 24.4 -46.5 Z',
          baseFill: c.armorSteelLight,
          shadowFill: c.armorSteelMid,
          shadowPaths: ['M 19.5 -52 L 23.0 -66.0 L 25.0 -46.0 Z'],
          clipId: `${pfx}-foot-lance`,
          strokeWidth: s.xeroxFine,
        }),
        // Swallowtail antique-gold & royal-blue heraldic pennant fluttering at 12 FPS
        celPath(
          `M 15.8 -46.0 L ${round2(-1.5 + pennantWave * 0.5)} ${round2(-51.5 + pennantWave * 0.4)} L ${round2(5.2 + pennantWave * 0.3)} ${round2(-40.5 + pennantWave * 0.2)} L ${round2(-3.0 + pennantWave * 0.5)} ${round2(-34.2 + pennantWave * 0.35)} L 13.8 -37.8 Z`,
          c.antiqueGold,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke(
          `M 12.0 -42.4 Q 5.0 ${round2(-43.5 + pennantWave * 0.3)}, 1.0 ${round2(-47.0 + pennantWave * 0.4)}`,
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true }
        ),
      ]
    );

    // Armored torso with royal blue heraldic surcoat, gold crest & steel pauldrons
    const onFootArmor = svgEl('g', { 'data-part': 'knight-armor' }, [
      celShadedShape({
        d: 'M -12.8 -60.0 L 12.8 -60.0 L 14.2 -23.5 L -13.2 -23.5 Z',
        baseFill: c.royalBlueTunic,
        shadowFill: c.royalBlueShadow,
        shadowPaths: ['M -14 -60 L -3.5 -60 L -3.5 -23 L -14 -23 Z'],
        clipId: `${pfx}-foot-torso`,
        strokeWidth: s.xeroxHeavy,
      }),
      // Polished steel gorget & shoulder pauldron
      celPath(
        'M -12.5 -60.0 Q 0.5 -55.0, 12.5 -60.0 L 11.5 -53.5 Q 0.5 -49.5, -11.5 -53.5 Z',
        c.armorSteelLight,
        { strokeWidth: s.xeroxFine }
      ),
      celPath(
        'M -14.8 -58.5 C -15.2 -63.0, -5.2 -63.0, -4.5 -57.2 L -6.0 -48.5 L -14.0 -49.5 Z',
        c.armorSteelMid,
        { strokeWidth: s.xeroxFine }
      ),
      // Antique gold surcoat hem trim & leather sword belt
      celPath('M -13.2 -27.2 L 14.2 -27.2 L 14.2 -23.5 L -13.2 -23.5 Z', c.antiqueGold, {
        strokeWidth: 1.0,
      }),
      celPath('M -12.8 -33.2 L 13.6 -33.2 L 13.8 -28.6 L -13.0 -28.6 Z', c.woodDark, {
        strokeWidth: s.xeroxFine,
      }),
      celPath('M 0.5 -33.8 L 5.8 -33.8 L 5.8 -28.0 L 0.5 -28.0 Z', c.antiqueGold, {
        strokeWidth: 1.0,
      }),
      // Feathery Xerox surcoat cloth creases
      xeroxSketchStroke(
        'M -9.0 -48.0 L -7.8 -36.5 M -10.0 -27.0 L -9.5 -24.0',
        { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
      ),
      renderClassicKnightShield(`${pfx}-foot`, 5, -38, 22, 34),
    ]);

    const onFootHead = renderClassicKnightHelmetAndFace({
      pfx: `${pfx}-foot`,
      cx: 0,
      cy: -60,
      frameIndex,
      blink,
      speaking: speakingActive,
      cheerful: isWaving || speakingActive,
      plumeSway,
      headTilt,
    });

    return svgEl(
      'g',
      {
        'data-art-style': 'classic_cel',
        'data-character': 'knight',
        'data-state': state,
        'data-mounted': 'false',
        'data-facing': 'right',
        'data-walk-profile': isWalking ? 'true' : undefined,
      },
      [
        celContactShadow(0, 0.5, shadowRx, 3.2, 0.34),
        svgEl(
          'g',
          {
            transform: svgTransform({
              y: round2(-footBob),
              scaleX: rigScaleX,
              scaleY: rigScaleY,
            }),
          },
          [onFootCape, onFootLegs, onFootLance, onFootArmor, onFootHead]
        ),
      ]
    );
  }

  // ─── HORSEBACK & MOUNTING/DISMOUNTING RIG (`mounted === true` or `state === 'climbing'`) ───
  const trotSwing = isWalking ? steppedOscillate(frameIndex, 8, 19) : 0;
  const trotBackSwing = isWalking ? steppedOscillate(frameIndex, 8, 18, -1) : 0;
  const trotBob = isWalking
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 3.2)))
    : isResting
    ? 0
    : steppedOscillate(frameIndex, 18, 1.2);
  const trotSquash = isWalking ? steppedOscillate(frameIndex, 4, 0.022) : 0;
  const horseScaleX = round2(1 + trotSquash);
  const horseScaleY = round2(1 - trotSquash);
  const lanceWave = isWaving
    ? round2(steppedOscillate(frameIndex, 8, 12) - 14)
    : isWalking
    ? round2(16 + steppedOscillate(frameIndex, 8, 3.5, -1))
    : 0;
  const riderMountOffsetY = isClimbing ? 16 : 0;
  const horseBlink =
    isSleeping || isSteppedBlinkFrame(frameIndex, 42, 2, 13);
  const horseTailSway = round2(steppedOscillate(frameIndex, 10, 6.0, -2));

  // 1. Articulated 1970s Disney Cream Warhorse Legs (`data-part="horse-legs"`)
  const horseLegs = isResting
    ? svgEl('g', { 'data-part': 'horse-legs' }, [
        celPath(
          'M -36 -30 C -45 -16, -37 0, -18 0 L -12 -24 Z',
          c.horseCream,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M 8 -30 C 2 -16, 12 0, 30 0 L 26 -24 Z',
          c.horseCream,
          { strokeWidth: s.xeroxMedium }
        ),
      ])
    : svgEl('g', { 'data-part': 'horse-legs' }, [
        // Back-far hind leg (muted warm shadow cream)
        svgEl(
          'g',
          { transform: svgTransform({ x: -30, y: -32, rotate: -trotBackSwing * 0.85 }) },
          [
            celPath(
              'M -5.2 0 C -6.8 9, -7.8 17, -6.5 26.2 L 2.2 26.2 C 3.2 17, 4.2 9, 4.0 0 Z',
              c.cottagePlaster,
              { strokeWidth: s.xeroxMedium }
            ),
            celPath('M -6.8 25.8 L 5.8 25.8 L 7.0 32.0 L -6.8 32.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Front-far foreleg
        svgEl(
          'g',
          { transform: svgTransform({ x: 20, y: -32, rotate: trotSwing * 0.85 }) },
          [
            celPath(
              'M -4.8 0 C -4.6 9, -4.4 18, -3.8 26.2 L 4.5 26.2 C 4.8 18, 4.8 9, 4.2 0 Z',
              c.cottagePlaster,
              { strokeWidth: s.xeroxMedium }
            ),
            celPath('M -4.2 25.8 L 8.2 25.8 L 9.4 32.0 L -4.2 32.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Back-near hind leg with hock & fetlock feathering
        svgEl(
          'g',
          { transform: svgTransform({ x: -20, y: -32, rotate: trotBackSwing }) },
          [
            celPath(
              'M -5.8 0 C -7.4 9, -8.2 17, -6.2 26.2 L 3.4 26.2 C 4.2 17, 5.2 9, 4.8 0 Z',
              c.horseCream,
              { strokeWidth: s.xeroxMedium }
            ),
            xeroxSketchStroke('M -4.4 13.5 Q -1.2 12.2, 1.8 13.5', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
            celPath('M -6.6 25.8 L 6.8 25.8 L 8.2 32.0 L -6.6 32.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
        // Front-near foreleg (raises heroically when cheering/waving!)
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: 28,
              y: -32,
              rotate: isWaving ? -24 : -trotSwing,
            }),
          },
          [
            celPath(
              'M -5.0 0 C -4.8 9, -4.4 18, -3.8 26.2 L 5.4 26.2 C 5.6 18, 5.6 9, 4.8 0 Z',
              c.horseCream,
              { strokeWidth: s.xeroxMedium }
            ),
            xeroxSketchStroke('M -2.8 13.0 Q 0.4 12.0, 3.2 13.2', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
            celPath('M -4.2 25.8 L 9.0 25.8 L 10.4 32.0 L -4.2 32.0 Z', c.horseMane, {
              strokeWidth: s.xeroxFine,
            }),
          ]
        ),
      ]);

  // 2. Flowing Dark Chestnut Horse Tail (`data-part="horse-tail"`)
  const horseTail = svgEl(
    'g',
    {
      'data-part': 'horse-tail',
      transform: svgTransform({ x: -45, y: -52, rotate: horseTailSway }),
    },
    [
      celPath(
        'M 0 0 C -18 -5, -31 10, -24 29 C -14 25, -6 14, 2 6 Z',
        c.horseMane,
        { strokeWidth: s.xeroxMedium }
      ),
      xeroxSketchStroke(
        'M -5 5 Q -15 11, -20 22 M -9 2 Q -19 7, -23 17',
        { stroke: c.woodMid, strokeWidth: 0.95, broken: true, opacity: 0.7 }
      ),
    ]
  );

  // 3. Noble Cream Steed Body, Heraldic Caparison, Arched Neck & Expressive Disney Horse Head (`data-part="horse-body"`)
  const horseBodyAndHead = svgEl('g', { 'data-part': 'horse-body' }, [
    // Steed barrel with soft flat belly shadow
    celShadedShape({
      d: 'M -46 -46 C -48 -64, 30 -66, 38 -46 C 42 -28, -42 -26, -46 -46 Z',
      baseFill: c.horseCream,
      shadowFill: c.boardToothWarm,
      shadowPaths: ['M -48 -38 C -20 -32, 16 -32, 42 -40 L 42 -22 L -48 -22 Z'],
      clipId: `${pfx}-horse-body`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Subtle dapple spots & anatomical hip/shoulder Xerox pencil ticks
    svgEl('circle', { cx: -28, cy: -49, r: 5.5, fill: c.boardToothWarm, opacity: 0.85 }),
    svgEl('circle', { cx: -17, cy: -44, r: 3.6, fill: c.boardToothWarm, opacity: 0.85 }),
    xeroxSketchStroke(
      'M -35 -55 Q -28 -48, -28 -36 M 24 -52 Q 30 -44, 28 -34',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),

    // Royal blue & antique-gold saddle blanket + leather saddle
    celShadedShape({
      d: 'M -25 -60 L 14 -60 L 18 -37 L -29 -37 Z',
      baseFill: c.royalBlueTunic,
      shadowFill: c.royalBlueShadow,
      shadowPaths: ['M -30 -44 L 20 -44 L 20 -36 L -30 -36 Z'],
      clipId: `${pfx}-saddle-cloth`,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M -26 -41.5 L 15 -41.5',
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 2.4,
      'stroke-dasharray': '5 2.5',
    }),
    // Leather saddle cantle & pommel
    celPath(
      'M -19 -62 C -14 -56, 4 -56, 9 -62 L 10 -56 L -20 -56 Z',
      c.woodDark,
      { strokeWidth: s.xeroxFine }
    ),

    // Arched equine neck & expressive Disney horse head facing RIGHT (+X)
    celShadedShape({
      d: 'M 20 -52 C 26 -76, 35 -92, 46 -94 C 53 -94, 67 -80, 65 -70 C 63 -62, 50 -64, 42 -58 C 38 -48, 31 -40, 20 -52 Z',
      baseFill: c.horseCream,
      shadowFill: c.boardToothWarm,
      shadowPaths: ['M 20 -56 C 32 -58, 44 -64, 66 -68 L 66 -54 L 20 -40 Z'],
      clipId: `${pfx}-horse-neck`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Flowing dark chestnut mane locks
    celPath(
      'M 17 -56 C 21 -72, 28 -86, 39 -94 C 33 -82, 29 -68, 24 -54 Z',
      c.horseMane,
      { strokeWidth: s.xeroxMedium }
    ),
    xeroxSketchStroke('M 23 -64 L 28 -74 M 27 -74 L 33 -84', {
      stroke: c.woodMid,
      strokeWidth: 0.95,
      broken: true,
    }),
    // Perked equine ears
    celPath('M 37 -92 L 41 -104 L 47 -92 Z', c.horseCream, {
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('polygon', { points: '39.5,-93 41.5,-100.5 44.5,-93', fill: c.dustyRose }),
    // Expressive almond Disney horse eye
    horseBlink
      ? svgEl('path', {
          d: 'M 46 -82 Q 49.5 -79, 53 -82',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
        })
      : svgEl('g', {}, [
          svgEl('ellipse', {
            cx: 49.5,
            cy: -82.2,
            rx: 2.8,
            ry: 3.1,
            fill: c.celCream,
            ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
          }),
          svgEl('circle', { cx: 50.2, cy: -82.0, r: 1.7, fill: c.xeroxInk }),
          svgEl('circle', { cx: 49.3, cy: -83.1, r: 0.65, fill: c.celCream }),
        ]),
    // Soft muzzle nostril & gentle smile tick
    svgEl('ellipse', { cx: 61.5, cy: -73.0, rx: 1.3, ry: 0.9, fill: c.xeroxInk }),
    xeroxSketchStroke('M 56.5 -68.0 Q 60.0 -66.5, 62.8 -68.2', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 1.0,
    }),
    // Crimson & gold bridle + leather reins
    svgEl('path', {
      d: 'M 42 -89 L 58 -74 M 56 -74 C 38 -68, 18 -68, 4 -74',
      fill: 'none',
      stroke: c.soldierCrimson,
      'stroke-width': 2.2,
      'stroke-linecap': 'round',
    }),
    svgEl('circle', {
      cx: 56,
      cy: -74,
      r: 2.1,
      fill: c.antiqueGold,
      ...celStrokeAttrs({ strokeWidth: 0.85, useXeroxFilter: true }),
    }),
  ]);

  // 4. Knight's Fluttering Crimson Cape (`data-part="knight-cape"`)
  const knightCape = svgEl(
    'g',
    {
      'data-part': 'knight-cape',
      transform: svgTransform({
        x: -10,
        y: -86 + riderMountOffsetY,
        rotate: round2(capeFlutter * 0.85),
      }),
    },
    [
      celShadedShape({
        d: 'M 0 0 C -22 4, -36 18, -32 34 C -18 32, -6 22, 4 10 Z',
        baseFill: c.soldierCrimson,
        shadowFill: c.soldierCrimsonShadow,
        shadowPaths: ['M -36 14 C -20 18, -8 18, 4 12 L 4 36 L -36 36 Z'],
        clipId: `${pfx}-m-cape`,
        strokeWidth: s.xeroxMedium,
      }),
      xeroxSketchStroke('M -10 8 Q -20 17, -26 28', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
      }),
    ]
  );

  // 5. Knight's Mounted Lance with Heraldic Pennant (`data-part="knight-lance"`)
  const knightLance = svgEl(
    'g',
    {
      'data-part': 'knight-lance',
      transform: svgTransform({
        x: 10,
        y: -76 + riderMountOffsetY,
        rotate: lanceWave,
      }),
    },
    [
      svgEl('line', {
        x1: -6,
        y1: 14,
        x2: 44,
        y2: -54,
        stroke: c.woodDark,
        'stroke-width': 4.8,
        'stroke-linecap': 'round',
      }),
      svgEl('line', {
        x1: -6,
        y1: 14,
        x2: 44,
        y2: -54,
        stroke: c.woodMid,
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
      }),
      celPath('M 38 -46 L 50 -62 L 44 -42 Z', c.armorSteelLight, {
        strokeWidth: s.xeroxFine,
      }),
      celPath(
        `M 36 -44 L ${round2(16 + pennantWave * 0.4)} ${round2(-52 + pennantWave * 0.35)} L ${round2(24 + pennantWave * 0.3)} ${round2(-38 + pennantWave * 0.25)} L ${round2(12 + pennantWave * 0.4)} ${round2(-32 + pennantWave * 0.35)} L 32 -36 Z`,
        c.antiqueGold,
        { strokeWidth: s.xeroxFine }
      ),
    ]
  );

  // 6. Sir Rowan's Armored Torso, Leg in Stirrup & Heater Shield
  const knightTorsoAndShield = svgEl(
    'g',
    {
      'data-part': isClimbing ? 'mounting-pose' : 'knight-armor',
      transform: svgTransform({ y: riderMountOffsetY }),
    },
    [
      // Armored leg in stirrup pointing right (+X)
      celPath('M -6 -58 L 4 -38 L 14 -36 L 6 -58 Z', c.armorSteelMid, {
        strokeWidth: s.xeroxMedium,
      }),
      celPath('M 4 -39 L 15 -37 L 15 -33 L 4 -35 Z', c.woodDark, {
        strokeWidth: s.xeroxFine,
      }),
      // Second trailing leg pushing off ground when mounting/dismounting (`climbing`)
      isClimbing
        ? celPath(
            'M -12 -54 L -16 -22 L -6 -22 L -4 -54 Z',
            c.armorSteelShadow,
            { strokeWidth: s.xeroxMedium }
          )
        : '',
      // Royal blue heraldic surcoat torso
      celShadedShape({
        d: 'M -14 -88 L 12 -88 L 14 -56 L -14 -56 Z',
        baseFill: c.royalBlueTunic,
        shadowFill: c.royalBlueShadow,
        shadowPaths: ['M -15 -88 L -3 -88 L -3 -55 L -15 -55 Z'],
        clipId: `${pfx}-m-torso`,
        strokeWidth: s.xeroxHeavy,
      }),
      celPath('M -14 -62 L 13.5 -62 L 13.8 -57.5 L -14 -57.5 Z', c.antiqueGold, {
        strokeWidth: 1.0,
      }),
      renderClassicKnightShield(`${pfx}-mounted`, 4, -65, 22, 34),
    ]
  );

  // 7. Sir Rowan's Plumed Helmet & Expressive Face (`data-part="knight-helmet"`)
  const knightHead = renderClassicKnightHelmetAndFace({
    pfx: `${pfx}-mounted`,
    cx: 0,
    cy: -88 + riderMountOffsetY,
    frameIndex,
    blink,
    speaking: speakingActive,
    cheerful: isWaving || speakingActive,
    sleeping: isSleeping,
    plumeSway,
    headTilt: speakingActive ? steppedOscillate(frameIndex, 12, 2.8) : 0,
  });

  const sleepZzz = isSleeping
    ? svgEl(
        'text',
        {
          'data-part': 'sleep-zzz',
          x: 18,
          y: -120,
          'font-family': TOKENS.classicCel.typography.fontFamilySerif,
          'font-size': 14,
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
      'data-character': 'knight',
      'data-state': state,
      'data-mounted': isClimbing ? 'climbing' : 'true',
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      celContactShadow(-4, 0.8, 44, 4.5, 0.34),
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-trotBob),
            scaleX: horseScaleX,
            scaleY: horseScaleY,
          }),
        },
        [
          horseTail,
          horseLegs,
          horseBodyAndHead,
          knightCape,
          knightLance,
          knightTorsoAndShield,
          knightHead,
          sleepZzz,
        ]
      ),
    ]
  );
}

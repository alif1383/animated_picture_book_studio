import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Generates a classic 1970s hand-inked 4-point cel sparkle star centered at `(cx, cy)`.
 */
function renderCelSparkStar(
  cx: number,
  cy: number,
  r: number,
  rotDeg = 0
): string {
  const inner = r * 0.3;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = ((i * 45 + rotDeg - 90) * Math.PI) / 180;
    const px = round2(cx + Math.cos(angle) * rad);
    const py = round2(cy + Math.sin(angle) * rad);
    pts.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

/**
 * Renders the 1970s–80s Classic Hand-Drawn Cel Dragon Fire Breath & Leaping Embers
 * (`'dragon_fire'`).
 *
 * - Hero Layer 1B multi-layered matte analog cel flame tongues (`flameCrimson` outer →
 *   `flameOrange` mid → `flameCore` inner) inked with raw `#xerox-ink` (`celPath`) and
 *   animated with energetic 12 FPS stepped flicker via `steppedOscillate`.
 * - ZERO gradients, ZERO neon bloom halos!
 * - Origin `(0, 0)` with right nozzle at `(+56, -4)`, arching upward-left across
 *   `x: -114..+56, y: -64..+2` so crouching Sir Rowan ducks safely underneath!
 * - Honors `lit` (default `true`): when `false`, returns an empty
 *   `<g data-prop="dragon_fire" data-art-style="classic_cel" data-lit="false" />`.
 */
export function renderClassicDragonFire(
  options: PropRenderOptions = { kind: 'dragon_fire' }
): string {
  const { frameIndex = 0, lit = true } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  if (!lit) {
    return svgEl('g', {
      'data-prop': 'dragon_fire',
      'data-art-style': 'classic_cel',
      'data-lit': 'false',
    });
  }

  // Energetic 12 FPS multi-harmonic wave flicker (classic hand-drawn FX animation on twos)
  const lickA = steppedOscillate(frameIndex, 6, 4.2, 0);
  const lickB = steppedOscillate(frameIndex, 4, 3.6, 1);
  const lickC = steppedOscillate(frameIndex, 8, 3.2, 3);
  const tipReach = steppedOscillate(frameIndex, 6, 4.0, 2);
  const corePulse = steppedOscillate(frameIndex, 4, 2.4, 2);

  // 1. Multi-layered Hand-Drawn Matte Cel Fire Tongues (`data-part="flame-plume"`)
  // Locked firmly to right nozzle (+56, -4) and billows UPWARD-LEFT strictly within
  // x: -114..+56, y: -64..+2 so crouching Sir Rowan has clear headroom underneath!
  const outerCrimsonD = [
    'M 56 -6',
    `C 34 ${round2(-26 + lickB * 0.45)}, 6 ${round2(-48 - lickA * 0.55)}, -22 ${round2(-55 + lickC * 0.6)}`,
    `C -42 ${round2(-60 + lickB * 0.5)}, -64 ${round2(-61 - lickA * 0.45)}, ${round2(-88 + tipReach)} ${round2(-56 + lickB * 0.5)}`,
    `C ${round2(-76 + tipReach * 0.5)} ${round2(-44 + lickC * 0.4)}, ${round2(-108 + tipReach * 0.7)} ${round2(-35 - lickB * 0.5)}, ${round2(-106 + tipReach * 0.6)} ${round2(-23 + lickA * 0.4)}`,
    `C ${round2(-92 + tipReach * 0.4)} ${round2(-15 - lickC * 0.35)}, -74 ${round2(-12 + lickB * 0.3)}, -56 ${round2(-8 + lickA * 0.25)}`,
    `C -24 ${round2(-4 + lickC * 0.2)}, 18 ${round2(-1 + lickB * 0.15)}, 56 1`,
    'Z',
  ].join(' ');

  // Secondary curling upper flame tongue lapping upward within y >= -63
  const upperTongueD = [
    `M ${round2(-8 + lickC * 0.4)} ${round2(-44 + lickA * 0.3)}`,
    `C ${round2(-20 + lickB * 0.6)} ${round2(-58 + lickA * 0.35)}, ${round2(-36 + lickC * 0.5)} ${round2(-61 - lickB * 0.3)}, ${round2(-48 + lickA * 0.5)} ${round2(-59 + lickC * 0.3)}`,
    `C ${round2(-36 + lickB * 0.4)} ${round2(-52 + lickA * 0.25)}, ${round2(-28 + lickC * 0.3)} ${round2(-46 + lickB * 0.2)}, ${round2(-18 + lickA * 0.3)} ${round2(-42 + lickC * 0.2)}`,
    'Z',
  ].join(' ');

  // Middle energetic orange flame sheet
  const midOrangeD = [
    'M 52 -5',
    `C 30 ${round2(-21 + lickA * 0.4)}, 2 ${round2(-40 - lickB * 0.45)}, -26 ${round2(-45 + lickC * 0.5)}`,
    `C -44 ${round2(-48 + lickA * 0.45)}, -62 ${round2(-47 - lickC * 0.4)}, ${round2(-80 + tipReach * 0.7)} ${round2(-40 + lickB * 0.5)}`,
    `C ${round2(-64 + tipReach * 0.4)} ${round2(-30 - lickA * 0.35)}, ${round2(-86 + tipReach * 0.5)} ${round2(-21 + lickC * 0.4)}, ${round2(-66 + tipReach * 0.3)} ${round2(-13 - lickB * 0.3)}`,
    `C -34 ${round2(-7 + lickA * 0.2)}, 12 ${round2(-2 + lickC * 0.15)}, 52 0`,
    'Z',
  ].join(' ');

  // Inner hot incandescent matte cel flame core
  const innerCoreD = [
    'M 48 -4',
    `C 26 ${round2(-15 + corePulse * 0.4)}, -2 ${round2(-29 - lickA * 0.35)}, -26 ${round2(-32 + lickB * 0.4)}`,
    `C -40 ${round2(-34 + corePulse * 0.4)}, -52 ${round2(-28 - lickC * 0.35)}, ${round2(-56 + tipReach * 0.4)} ${round2(-22 + lickA * 0.35)}`,
    `C -38 ${round2(-16 - corePulse * 0.3)}, -16 ${round2(-8 + lickB * 0.2)}, 48 -1`,
    'Z',
  ].join(' ');

  const flamePlume = svgEl('g', { 'data-part': 'flame-plume' }, [
    celPath(upperTongueD, c.flameCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath(outerCrimsonD, c.flameCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath(midOrangeD, c.flameOrange, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath(innerCoreD, c.flameCore, {
      stroke: c.flameOrange,
      strokeWidth: s.sketchLine,
    }),
    // Hand-drawn 1970s FX speed & curl-lick strokes inside the fire jet
    xeroxSketchStroke(
      [
        `M 36 -5 C 14 ${round2(-14 + lickB * 0.3)}, -12 ${round2(-22 - lickA * 0.3)}, -34 ${round2(-23 + lickC * 0.3)}`,
        `M 12 ${round2(-28 + lickA * 0.35)} C -12 ${round2(-40 - lickB * 0.3)}, -38 ${round2(-44 + lickC * 0.3)}, -60 ${round2(-41 + lickA * 0.3)}`,
        `M -32 ${round2(-14 + lickB * 0.25)} Q -54 ${round2(-18 - lickA * 0.25)}, -74 ${round2(-26 + lickC * 0.3)}`,
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '9 3 5 2.5',
        opacity: 0.72,
      }
    ),
  ]);

  // 2. Leaping Hand-Inked Matte Cel Embers & Classic Star Sparks (`data-part="clash-sparks"`)
  const sparkA_Y = round2(-48 + steppedOscillate(frameIndex, 6, 4.0, 0));
  const sparkB_Y = round2(-15 - steppedOscillate(frameIndex, 6, 3.8, 2));
  const sparkC_Y = round2(-26 + steppedOscillate(frameIndex, 4, 3.2, 1));
  const ember1_X = round2(-98 + steppedOscillate(frameIndex, 8, 4.0, 1));
  const ember1_Y = round2(-42 + steppedOscillate(frameIndex, 6, 3.5, 3));
  const ember2_X = round2(-72 + steppedOscillate(frameIndex, 6, 3.8, 4));
  const ember2_Y = round2(-54 + steppedOscillate(frameIndex, 8, 3.0, 2));
  const ember3_X = round2(18 + steppedOscillate(frameIndex, 6, 3.0, 2));
  const ember3_Y = round2(-38 + steppedOscillate(frameIndex, 6, 3.5, 0));

  const clashSparks = svgEl('g', { 'data-part': 'clash-sparks' }, [
    // Crisp 4-point classic cel sparkle bursts
    celPath(
      renderCelSparkStar(-94, sparkA_Y, 9.5, frameIndex * 18),
      c.flameCore,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath(
      renderCelSparkStar(-58, sparkB_Y, 7.8, -frameIndex * 15),
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath(
      renderCelSparkStar(38, sparkC_Y, 6.8, 12 + frameIndex * 12),
      c.parchmentCream,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Teardrop leaping embers flying off the curling fire stream
    celPath(
      `M ${ember1_X} ${ember1_Y} C ${round2(ember1_X - 4)} ${round2(ember1_Y - 4)}, ${round2(ember1_X - 8)} ${round2(ember1_Y - 1)}, ${round2(ember1_X - 5.5)} ${round2(ember1_Y + 3)} C ${round2(ember1_X - 3)} ${round2(ember1_Y + 5)}, ${round2(ember1_X + 2)} ${round2(ember1_Y + 2)}, ${ember1_X} ${ember1_Y} Z`,
      c.flameOrange,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      `M ${ember2_X} ${ember2_Y} C ${round2(ember2_X - 3)} ${round2(ember2_Y - 3)}, ${round2(ember2_X - 7)} ${round2(ember2_Y)}, ${round2(ember2_X - 4)} ${round2(ember2_Y + 3)} C ${round2(ember2_X - 1)} ${round2(ember2_Y + 4)}, ${round2(ember2_X + 2)} ${round2(ember2_Y + 1)}, ${ember2_X} ${ember2_Y} Z`,
      c.flameCrimson,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    celPath(
      `M ${ember3_X} ${ember3_Y} C ${round2(ember3_X - 2.5)} ${round2(ember3_Y - 3.5)}, ${round2(ember3_X - 6)} ${round2(ember3_Y - 1)}, ${round2(ember3_X - 3.5)} ${round2(ember3_Y + 2)} C ${round2(ember3_X - 1)} ${round2(ember3_Y + 3)}, ${round2(ember3_X + 1.5)} ${round2(ember3_Y + 1)}, ${ember3_X} ${ember3_Y} Z`,
      c.flameCore,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Kinetic Xerox ink ember-trail flick dashes
    xeroxSketchStroke(
      [
        `M ${round2(-84 + tipReach * 0.4)} ${round2(-55 + lickB * 0.4)} L ${round2(-92 + tipReach * 0.4)} ${round2(-58 + lickB * 0.4)}`,
        `M ${round2(-96 + tipReach * 0.5)} ${round2(-14 + lickA * 0.3)} L ${round2(-104 + tipReach * 0.5)} ${round2(-11 + lickA * 0.3)}`,
        `M 28 ${round2(-32 + lickC * 0.3)} L 18 ${round2(-37 + lickC * 0.3)}`,
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        opacity: 0.84,
      }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dragon_fire',
      'data-art-style': 'classic_cel',
      'data-lit': 'true',
    },
    [flamePlume, clashSparks]
  );
}

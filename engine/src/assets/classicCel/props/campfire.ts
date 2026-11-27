import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973)
 * expanded woodland medieval knight campsite diorama (`'campfire'`).
 *
 * - Tethered chestnut & cream steeds resting beside a timber hitching post
 *   (`data-part="tethered-horses"` at `x: -248..-136`) for companion permanence.
 * - Royal blue & cream knight pavilion tent (`data-part="knight-tent"`) and
 *   crimson & cream soldier tent (`data-part="soldier-tent"`).
 * - Camp gear (`data-part="camp-gear"`), hewn sitting logs (`data-part="sitting-logs"`),
 *   stone fire ring & crossed logs (`data-part="campfire-logs"`), 12 FPS matte cel
 *   flames (`data-part="campfire-flames"` when `lit`), and wooden roasting spit with
 *   sizzling meat haunch & rising steam (`data-part="roasting-spit"`, `roasting-meat`, `meat-steam`).
 *
 * Origin: `(0, 0)` fire ring center.
 * Bounds: `x: -248..+159, y: -142..+28`.
 */
export function renderClassicCampfire(
  options: PropRenderOptions = { kind: 'campfire' }
): string {
  const { frameIndex = 0, lit = true, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const isLit = lit !== false;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // 12 FPS organic flame, spit sizzle, pennant breeze & horse breathing
  const flameFlickerX = steppedOscillate(frameIndex, 10, 4.4, variant * 2);
  const flameFlickerY = steppedOscillate(frameIndex, 12, 5.0, 2);
  const emberRiseA = steppedOscillate(frameIndex, 14, 5.5, 1);
  const emberRiseB = steppedOscillate(frameIndex, 16, 4.8, 5);
  const sizzleBob = steppedOscillate(frameIndex, 10, 1.1, 1);
  const steamSway = steppedOscillate(frameIndex, 12, 3.8, 2);
  const steamRise = steppedOscillate(frameIndex, 10, 2.4, 3);
  const pennantWave = steppedOscillate(frameIndex, 14, 2.4, 4);
  const horseBreath = steppedOscillate(frameIndex, 22, 0.7, 3);

  // 1A. Tethered Resting Horses by the Timber Hitching Post (`x: -248..-136`)
  const tetheredHorses = svgEl('g', { 'data-part': 'tethered-horses' }, [
    celContactShadow(-206, 4, 40, 5, 0.25),
    // Wooden hitching posts & rail (-240..-172)
    celPath('M -236 2 L -236 -44 L -230 -44 L -230 2 Z', c.woodMid, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath('M -182 2 L -182 -44 L -176 -44 L -176 2 Z', c.woodMid, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath('M -240 -38 L -172 -38 L -172 -32 L -240 -32 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke('M -234 -35 L -178 -35 M -233 -30 L -233 -4 M -179 -30 L -179 -4', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.8,
      broken: true,
      opacity: 0.65,
    }),

    // Back chestnut steed resting peacefully (-246..-162)
    celPath(
      'M -242 -16 C -247 -6, -240 2, -224 2 L -218 -14 Z',
      c.horseChestnutShadow,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celShadedShape({
      d: `M -244 ${round2(-26 + horseBreath)} C -246 ${round2(-42 + horseBreath)}, -194 ${round2(-44 + horseBreath)}, -190 -26 C -186 -12, -240 -10, -244 ${round2(-26 + horseBreath)} Z`,
      baseFill: c.horseChestnut,
      shadowPaths: ['M -245 -22 C -232 -14, -200 -14, -189 -22 L -189 -10 L -245 -10 Z'],
      shadowFill: c.horseChestnutShadow,
      clipId: `cc-camp-horse1-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Chestnut steed saddle blanket & mane
    celPath('M -226 -39 L -206 -39 L -204 -25 L -228 -25 Z', c.soldierCrimson, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath(
      'M -198 -32 C -192 -52, -184 -64, -176 -66 C -170 -66, -162 -56, -164 -48 C -166 -42, -176 -42, -182 -36 Z',
      c.horseChestnut,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    celPath('M -197 -35 C -194 -48, -188 -60, -180 -64 L -184 -64 C -193 -56, -199 -46, -200 -34 Z', c.horseMane, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    xeroxSketchStroke('M -175 -56 Q -171 -53, -168 -55.5', {
      stroke: c.xeroxInk,
      strokeWidth: 1.0,
    }),

    // Front cream steed resting peacefully (-222..-137)
    celPath(
      'M -218 -14 C -225 -4, -218 4, -200 4 L -194 -12 Z',
      c.boardToothWarm,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celShadedShape({
      d: `M -220 ${round2(-24 - horseBreath * 0.7)} C -222 ${round2(-40 - horseBreath * 0.7)}, -168 ${round2(-42 - horseBreath * 0.7)}, -164 -24 C -160 -10, -216 -8, -220 ${round2(-24 - horseBreath * 0.7)} Z`,
      baseFill: c.horseCream,
      shadowPaths: ['M -221 -20 C -204 -12, -176 -12, -163 -20 L -163 -8 L -221 -8 Z'],
      shadowFill: c.boardToothWarm,
      clipId: `cc-camp-horse2-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Royal blue saddle cloth on cream steed
    celPath('M -204 -37 L -182 -37 L -180 -22 L -206 -22 Z', c.royalBlueTunic, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke('M -204 -24.5 L -182 -24.5', {
      stroke: c.antiqueGold,
      strokeWidth: 1.3,
    }),
    celPath(
      'M -174 -30 C -168 -50, -160 -62, -150 -64 C -144 -64, -136 -54, -138 -46 C -140 -40, -150 -40, -158 -34 Z',
      c.horseCream,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    // Dark mane crest & peaceful closed eye
    celPath('M -173 -33 C -170 -47, -163 -58, -154 -63 L -159 -62 C -168 -55, -175 -45, -176 -32 Z', c.horseMane, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    xeroxSketchStroke('M -150 -54 Q -146 -51, -142 -54', {
      stroke: c.xeroxInk,
      strokeWidth: 1.15,
    }),
    // Crimson tether rope to wooden hitching rail
    svgEl('path', {
      d: 'M -144 -48 Q -162 -36, -178 -35',
      fill: 'none',
      stroke: c.soldierCrimson,
      'stroke-width': 2.1,
      'stroke-linecap': 'round',
    }),
    xeroxSketchStroke('M -144 -48 Q -162 -36, -178 -35', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.7,
      opacity: 0.6,
    }),
  ]);

  // 1B. Main Royal Blue & Cream Knight Pavilion Tent (`x: -165..-25`, peak `y = -142`)
  const knightTent = svgEl('g', { 'data-part': 'knight-tent' }, [
    celContactShadow(-95, -1, 70, 5.5, 0.24),
    // Base cream pavilion cone
    celShadedShape({
      d: 'M -165 -2 L -95 -122 L -25 -2 Z',
      baseFill: c.celCream,
      shadowPaths: ['M -95 -122 L -25 -2 L -60 -2 Z'],
      shadowFill: c.boardToothWarm,
      clipId: `cc-camp-ktent-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),
    // Royal blue heraldic stripes
    celPath('M -142 -2 L -95 -122 L -118 -2 Z', c.royalBlueTunic, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -72 -2 L -95 -122 L -48 -2 Z', c.royalBlueShadow, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Gold scalloped pavilion valance band
    svgEl('path', {
      d: 'M -134 -56 Q -120 -48, -108 -56 Q -95 -48, -82 -56 Q -70 -48, -56 -56',
      fill: 'none',
      stroke: c.antiqueGold,
      'stroke-width': 2.4,
      'stroke-linecap': 'round',
    }),
    // Shadowed pavilion doorway
    celPath('M -112 -2 L -95 -64 L -78 -2 Z', c.nightSkyZenith, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Canvas crease ticks
    xeroxSketchStroke('M -146 -22 L -112 -96 M -44 -22 L -78 -96', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.85,
      broken: true,
      opacity: 0.56,
    }),
    // Fluttering antique-gold top pennant (top edge at y = -142)
    celPath(
      `M -95 -122 L -95 -142 L ${round2(-66 + pennantWave)} ${round2(-132 + pennantWave * 0.4)} L -95 -124 Z`,
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
  ]);

  // 1C. Secondary Crimson & Cream Soldier Tent (`x: +35..+155`, peak `y = -118`)
  const soldierTent = svgEl('g', { 'data-part': 'soldier-tent' }, [
    celContactShadow(95, -3, 60, 4.8, 0.24),
    celShadedShape({
      d: 'M 35 -4 L 95 -102 L 155 -4 Z',
      baseFill: c.soldierCrimson,
      shadowPaths: ['M 95 -102 L 155 -4 L 122 -4 Z'],
      shadowFill: c.soldierCrimsonShadow,
      clipId: `cc-camp-stent-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),
    // Cream contrast stripes
    celPath('M 55 -4 L 95 -102 L 73 -4 Z', c.celCream, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 117 -4 L 95 -102 L 135 -4 Z', c.boardToothWarm, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Tent doorway
    celPath('M 82 -4 L 95 -54 L 108 -4 Z', c.nightSkyZenith, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Fluttering top crimson pennant
    celPath(
      `M 95 -102 L 95 -118 L ${round2(118 - pennantWave * 0.8)} ${round2(-110 + pennantWave * 0.35)} L 95 -104 Z`,
      c.antiqueGold,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
  ]);

  // 1D. Camp Gear: Bedroll, Leaning Knight Lance & Heater Shield, Soldier Spear & Buckler
  const campGear = svgEl('g', { 'data-part': 'camp-gear' }, [
    // Rolled travel bedroll in sage & cream with leather straps
    celPath(
      'M -116 0 C -116 -10, -78 -10, -78 0 C -78 4, -116 4, -116 0 Z',
      c.villagerSage,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    celPath(
      'M -114 -2 C -114 -8, -102 -8, -102 -2 C -102 2, -114 2, -114 -2 Z',
      c.celCream,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    xeroxSketchStroke('M -96 -7.5 L -96 2.5 M -86 -7.5 L -86 2.5', {
      stroke: c.woodDark,
      strokeWidth: 1.8,
    }),
    // Leaning knight wooden lance + steel spearhead
    svgEl('line', {
      x1: -30,
      y1: 0,
      x2: -20,
      y2: -94,
      stroke: c.xeroxInk,
      'stroke-width': 4.4,
      'stroke-linecap': 'round',
    }),
    svgEl('line', {
      x1: -30,
      y1: 0,
      x2: -20,
      y2: -94,
      stroke: c.woodMid,
      'stroke-width': 2.2,
      'stroke-linecap': 'round',
    }),
    celPath('M -23 -92 L -18 -106 L -16 -90 Z', c.armorSteelLight, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Royal blue heater shield with gold heraldic cross
    celPath(
      'M -34 -32 L -16 -32 L -16 -16 C -16 -6, -25 -2, -25 -2 C -25 -2, -34 -6, -34 -16 Z',
      c.royalBlueTunic,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    xeroxSketchStroke('M -25 -30 L -25 -6 M -31 -22 L -19 -22', {
      stroke: c.antiqueGold,
      strokeWidth: 1.8,
    }),
    // Right-side soldier spear & wooden round buckler (`x <= +159`)
    svgEl('line', {
      x1: 146,
      y1: -2,
      x2: 158,
      y2: -86,
      stroke: c.xeroxInk,
      'stroke-width': 4.0,
      'stroke-linecap': 'round',
    }),
    svgEl('line', {
      x1: 146,
      y1: -2,
      x2: 158,
      y2: -86,
      stroke: c.woodMid,
      'stroke-width': 2.0,
      'stroke-linecap': 'round',
    }),
    celPath(
      'M 137 -18 A 11 11 0 1 0 159 -18 A 11 11 0 1 0 137 -18 Z',
      c.woodMid,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    svgEl('circle', {
      cx: 148,
      cy: -18,
      r: 3.4,
      fill: c.armorSteelMid,
      stroke: c.xeroxInk,
      'stroke-width': 1.1,
    }),
  ]);

  // 2. Hewn Woodland Sitting Logs Flanking the Fire Ring
  const sittingLogs = svgEl('g', { 'data-part': 'sitting-logs' }, [
    celContactShadow(-71, 17, 34, 4.5, 0.25),
    celContactShadow(71, 17, 34, 4.5, 0.25),
    // Left sitting log
    celShadedShape({
      d: 'M -104 2 L -40 -4 L -38 12 L -102 18 Z',
      baseFill: c.woodMid,
      shadowPaths: ['M -104 10 L -38 4 L -38 12 L -102 18 Z'],
      shadowFill: c.woodDark,
      clipId: `cc-camp-log-l-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),
    xeroxSketchStroke('M -94 6 L -48 1 M -86 12 L -52 9', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.9,
      broken: true,
      opacity: 0.68,
    }),
    svgEl('ellipse', {
      cx: -103,
      cy: 10,
      rx: 5,
      ry: 8,
      fill: c.boardToothWarm,
      stroke: c.xeroxInk,
      'stroke-width': s.xeroxMedium,
    }),
    svgEl('ellipse', {
      cx: -103,
      cy: 10,
      rx: 2.3,
      ry: 4.2,
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 0.8,
    }),
    // Right sitting log
    celShadedShape({
      d: 'M 40 -4 L 104 2 L 102 18 L 38 12 Z',
      baseFill: c.woodMid,
      shadowPaths: ['M 38 4 L 104 10 L 102 18 L 38 12 Z'],
      shadowFill: c.woodDark,
      clipId: `cc-camp-log-r-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),
    xeroxSketchStroke('M 48 1 L 94 6 M 52 9 L 86 12', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.9,
      broken: true,
      opacity: 0.68,
    }),
    svgEl('ellipse', {
      cx: 103,
      cy: 10,
      rx: 5,
      ry: 8,
      fill: c.boardToothWarm,
      stroke: c.xeroxInk,
      'stroke-width': s.xeroxMedium,
    }),
    svgEl('ellipse', {
      cx: 103,
      cy: 10,
      rx: 2.3,
      ry: 4.2,
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 0.8,
    }),
  ]);

  // 3. Stone Campfire Ring & Crossed Firewood Logs (`(0, 0)` fire ring center)
  const logs = svgEl('g', { 'data-part': 'campfire-logs' }, [
    // Subtle ash & dirt hearth ring (keeps max y <= +24)
    svgEl('ellipse', {
      cx: 0,
      cy: 5,
      rx: 34,
      ry: 9,
      fill: c.sootChar,
      opacity: 0.52,
    }),
    // Back ring stones
    celPath('M -28 4 C -30 -6, -14 -6, -14 4 Z', c.stoneBase, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath('M 14 4 C 14 -6, 30 -6, 28 4 Z', c.stoneBase, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Crossed firewood logs
    celPath('M -26 2 L 22 -14 L 26 -6 L -22 8 Z', c.woodMid, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath('M 26 2 L -22 -14 L -26 -6 L 22 8 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    xeroxSketchStroke('M -18 2 L 16 -9 M 18 2 L -16 -9', {
      stroke: c.sootChar,
      strokeWidth: 1.0,
      broken: true,
      opacity: 0.72,
    }),
    // Front hearth stones
    celPath('M -12 7 C -14 -3, 14 -3, 12 7 Z', c.stoneLight, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath('M -24 9 C -26 2, -13 2, -14 9 Z', c.stoneShadow, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 14 9 C 13 2, 26 2, 24 9 Z', c.stoneShadow, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
  ]);

  // 4. 12 FPS Matte Analog Cel Flames & Subtle Painted Ground Bounce (`lit`)
  const flames = isLit
    ? svgEl('g', { 'data-part': 'campfire-flames' }, [
        // Subtle painted warm watercolor bounce on hearth ground (no gradient, no neon halo)
        watercolorWashBlotches(
          [
            { cx: 0, cy: 5, rx: 38, ry: 11, fill: c.warmAmberWash, opacity: 0.24, rotate: -2 },
            { cx: 0, cy: -16, rx: 28, ry: 18, fill: c.warmAmberGlow, opacity: 0.16, rotate: 3 },
          ],
          { seed: variant * 7 + 3, opacity: 0.9 }
        ),
        // Outer crimson matte cel flame
        celPath(
          `M -18 -5 C -26 -24, ${round2(-10 + flameFlickerX)} -42, ${flameFlickerX} ${round2(-50 + flameFlickerY * 0.6)} C ${round2(12 + flameFlickerX)} -40, 26 -24, 18 -5 Z`,
          c.flameCrimson,
          { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
        ),
        // Mid orange matte cel flame
        celPath(
          `M -12 -5 C -16 -18, ${round2(-6 - flameFlickerX * 0.6)} -34, ${round2(-flameFlickerX * 0.5)} ${round2(-40 + flameFlickerY * 0.5)} C ${round2(8 - flameFlickerX * 0.5)} -32, 16 -18, 12 -5 Z`,
          c.flameOrange,
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
        ),
        // Inner golden-yellow cel core
        celPath(
          `M -6 -5 C -8 -14, -3 -24, ${round2(flameFlickerX * 0.4)} -28 C 4 -22, 8 -14, 6 -5 Z`,
          c.flameCore,
          { stroke: 'none', useXeroxFilter: false }
        ),
        // Tiny rising hand-drawn cel ember sparks
        svgEl('circle', {
          cx: round2(-9 + flameFlickerX * 0.5),
          cy: round2(-48 - emberRiseA),
          r: 1.6,
          fill: c.flameCore,
          stroke: c.flameCrimson,
          'stroke-width': 0.6,
        }),
        svgEl('circle', {
          cx: round2(11 - flameFlickerX * 0.4),
          cy: round2(-44 - emberRiseB),
          r: 1.4,
          fill: c.flameOrange,
        }),
      ])
    : '';

  // 5. Wooden Roasting Spit, Sizzling Haunch & 12 FPS Rising Steam
  const roastingSpit = svgEl('g', { 'data-part': 'roasting-spit' }, [
    // Left forked timber Y-stake
    celPath(
      'M -38 6 L -38 -40 L -44 -52 L -40 -54 L -36 -43 L -32 -54 L -28 -52 L -34 -40 L -34 6 Z',
      c.woodMid,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    // Right forked timber Y-stake
    celPath(
      'M 34 6 L 34 -40 L 28 -52 L 32 -54 L 36 -43 L 40 -54 L 44 -52 L 38 -40 L 38 6 Z',
      c.woodMid,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }
    ),
    // Forged-iron horizontal spit rod (`y = -46`) & crank handle
    svgEl('line', {
      x1: -48,
      y1: -46,
      x2: 46,
      y2: -46,
      stroke: c.ironDark,
      'stroke-width': 3.2,
      'stroke-linecap': 'round',
    }),
    svgEl('line', {
      x1: -46,
      y1: -46.8,
      x2: 44,
      y2: -46.8,
      stroke: c.ironHighlight,
      'stroke-width': 0.9,
      'stroke-linecap': 'round',
    }),
    celPath('M -48 -46 L -48 -38 L -42 -38', 'none', {
      stroke: c.ironDark,
      strokeWidth: s.xeroxMedium,
    }),

    // Sizzling Roasted Meat Haunch on the Bone
    svgEl(
      'g',
      {
        'data-part': 'roasting-meat',
        transform: svgTransform({ y: sizzleBob }),
      },
      [
        celPath('M -24 -48 L -13 -48 L -13 -44 L -24 -44 Z', c.celCream, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        svgEl('circle', {
          cx: -25,
          cy: -49,
          r: 3.1,
          fill: c.celCream,
          stroke: c.xeroxInk,
          'stroke-width': s.sketchLine,
        }),
        svgEl('circle', {
          cx: -25,
          cy: -43,
          r: 3.1,
          fill: c.boardToothWarm,
          stroke: c.xeroxInk,
          'stroke-width': s.sketchLine,
        }),
        celPath('M 13 -48 L 22 -48 L 22 -44 L 13 -44 Z', c.celCream, {
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
        // Plump matte cel roasted haunch body
        celShadedShape({
          d: 'M -15 -46 C -15 -62, 6 -64, 16 -54 C 22 -48, 20 -38, 12 -34 C 2 -30, -15 -32, -15 -46 Z',
          baseFill: c.cottageRoof,
          shadowPaths: ['M -15 -42 C -2 -37, 12 -38, 20 -44 L 20 -30 L -15 -30 Z'],
          shadowFill: c.cottageRoofShadow,
          highlightPaths: ['M -11 -50 C -8 -58, 6 -59, 13 -51 C 8 -47, -4 -46, -11 -50 Z'],
          highlightFill: c.ochreEarth,
          highlightOpacity: 0.78,
          clipId: `cc-camp-meat-${uid}`,
          stroke: c.xeroxInk,
          strokeWidth: s.xeroxHeavy,
        }),
        // Crisp sear stripes
        xeroxSketchStroke(
          'M -6 -55 Q -2 -46, -4 -37 M 2 -56 Q 6 -46, 4 -37 M 9 -53 Q 12 -46, 10 -39',
          {
            stroke: c.xeroxInk,
            strokeWidth: 1.15,
            opacity: 0.8,
          }
        ),
      ]
    ),

    // Rising hand-drawn aroma steam curls (when lit)
    isLit
      ? svgEl('g', { 'data-part': 'meat-steam' }, [
          xeroxSketchStroke(
            `M -10 ${round2(-64 + steamRise)} Q ${round2(-15 + steamSway)} -75, -8 -84 Q ${round2(-2 - steamSway)} -92, -10 ${round2(-98 + steamRise)}`,
            {
              stroke: c.parchmentCream,
              strokeWidth: 1.9,
              broken: true,
              dasharray: '8 3 5 2',
              opacity: 0.76,
            }
          ),
          xeroxSketchStroke(
            `M 0 ${round2(-66 - steamRise * 0.6)} Q ${round2(6 - steamSway)} -78, 0 -88 Q ${round2(-6 + steamSway)} -96, 2 ${round2(-103 - steamRise * 0.6)}`,
            {
              stroke: c.celCream,
              strokeWidth: 2.1,
              broken: true,
              dasharray: '9 3 6 2',
              opacity: 0.82,
            }
          ),
          xeroxSketchStroke(
            `M 10 ${round2(-64 + steamRise)} Q ${round2(15 + steamSway)} -75, 9 -84 Q ${round2(3 - steamSway)} -92, 11 ${round2(-98 + steamRise)}`,
            {
              stroke: c.parchmentCream,
              strokeWidth: 1.9,
              broken: true,
              dasharray: '7 3 5 2',
              opacity: 0.76,
            }
          ),
        ])
      : '',
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'campfire',
      'data-art-style': 'classic_cel',
      'data-lit': String(isLit),
    },
    [
      tetheredHorses,
      knightTent,
      soldierTent,
      campGear,
      sittingLogs,
      logs,
      flames,
      roastingSpit,
    ]
  );
}

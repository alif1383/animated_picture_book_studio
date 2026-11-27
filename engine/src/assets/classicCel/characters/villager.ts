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

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-villager';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-villager-${clean}` : 'cc-villager';
}

/**
 * Renders the Classic 1973 *Robin Hood* Medieval Villager / Castle Herald (`'villager'`).
 * - 100% flat matte analog cel paint + raw electrostatic `#xerox-ink` charcoal outlines (`celPath`)
 *   + feathery internal graphite `xeroxSketchStroke` cloth creases + grounded `celContactShadow`
 *   (ZERO gradients, ZERO crayon patterns, ZERO pure `#000000`/`#FFFFFF`, ZERO neon bloom).
 * - Homespun olive-sage tunic (`villagerSage`), ochre apron & belt (`villagerOchre`), feathered
 *   medieval herald cap (`data-part="villager-cap"`), and rolled parchment scroll (`data-part="villager-scroll"`).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` (`data-facing="right"`), with dedicated 12 FPS
 *   3/4 walking profile (`data-walk-profile="true"` when `state === 'walking'`).
 * - Ground origin `(0, 0)` at boots, bounds `x: -22..+29, y: -98..0`.
 * - Expressive Disney face with 4-stage 12 FPS lip-sync mouths when `isSpeaking` or `state === 'singing'`
 *   (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`).
 */
export function renderClassicVillager(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const isWalking = state === 'walking';
  const isWaving = state === 'waving' || state === 'singing';
  const isWorried = state === 'grumpy' || state === 'looking_up';
  const isSleeping = state === 'sleeping' || state === 'sleepy';
  const speakingActive = isSpeaking || state === 'singing';

  // 12 FPS ("on twos") timing + subtle hand-drawn pencil boil & squash-and-stretch
  const drawStep = Math.floor(frameIndex / 2);
  const featherBoil = round2(deterministicJitter(drawStep, 19, 0.55));

  const walkSwing = isWalking ? steppedOscillate(frameIndex, 8, 19) : 0;
  const strideBob = isWalking
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 2.4)))
    : 0;
  const bodyBob = isWalking
    ? round2(-strideBob)
    : isWaving
    ? round2(-Math.abs(steppedOscillate(frameIndex, 8, 1.8)))
    : round2(steppedOscillate(frameIndex, 18, 0.9));

  const squashPulse = isWalking
    ? steppedOscillate(frameIndex, 4, 0.025)
    : isWaving
    ? steppedOscillate(frameIndex, 8, 0.022)
    : steppedOscillate(frameIndex, 20, 0.01);
  const bodyScaleX = round2(1 - squashPulse);
  const bodyScaleY = round2(1 + squashPulse);

  const armWave = isWaving
    ? round2(steppedOscillate(frameIndex, 6, 18) - 34)
    : isWorried
    ? round2(-26 + steppedOscillate(frameIndex, 10, 4))
    : round2(10 + steppedOscillate(frameIndex, 20, 2));

  const headTilt = isWorried
    ? round2(-4 + steppedOscillate(frameIndex, 12, 2))
    : isWaving
    ? round2(steppedOscillate(frameIndex, 8, 3.2))
    : isWalking
    ? round2(2 + steppedOscillate(frameIndex, 8, 2.2, -1))
    : round2(steppedOscillate(frameIndex, 22, 1.5));

  const blink =
    isSleeping ||
    state === 'blinking' ||
    (!isWorried && isSteppedBlinkFrame(frameIndex, 34, 2, 5));

  const shadowRx = isWalking ? round2(14.5 - strideBob * 0.4) : 14.5;

  // 1. Articulated Medieval Hose & Cuffed Leather Boots Pointing RIGHT (+X), grounded at y = 0
  const legs = svgEl('g', { 'data-part': 'villager-legs' }, [
    // Far leg (darker shadow hose & boot)
    svgEl(
      'g',
      {
        'data-part': 'back-leg',
        transform: svgTransform({ x: -3.5, y: -24, rotate: -walkSwing }),
      },
      [
        celPath('M -3.5 0 L -3.5 17 L 2.8 17 L 2.8 0 Z', c.horseCream, {
          strokeWidth: s.xeroxFine,
        }),
        // Turned-down boot cuff & pointed medieval shoe facing +X
        celPath(
          'M -4.5 15 L 3.8 15 L 4.0 18.5 L -4.5 18.5 Z',
          c.woodDark,
          { strokeWidth: s.xeroxFine }
        ),
        celPath(
          'M -4.5 18 L 6.2 18 C 10.5 18.2, 11.4 24, 5.8 24 L -4.5 24 Z',
          c.woodDark,
          { strokeWidth: s.xeroxMedium }
        ),
      ]
    ),
    // Near leg (lighter cream hose & mid-brown leather boot)
    svgEl(
      'g',
      {
        'data-part': 'front-leg',
        transform: svgTransform({ x: 3.2, y: -24, rotate: walkSwing }),
      },
      [
        celPath('M -3.5 0 L -3.5 17 L 2.8 17 L 2.8 0 Z', c.parchmentCream, {
          strokeWidth: s.xeroxFine,
        }),
        celPath(
          'M -4.5 15 L 3.8 15 L 4.0 18.5 L -4.5 18.5 Z',
          c.woodMid,
          { strokeWidth: s.xeroxFine }
        ),
        celPath(
          'M -4.5 18 L 6.4 18 C 10.8 18.2, 11.6 24, 6.0 24 L -4.5 24 Z',
          c.woodMid,
          { strokeWidth: s.xeroxMedium }
        ),
        xeroxSketchStroke('M -2.2 21.5 L 5.0 21.5', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
      ]
    ),
  ]);

  // 2. Back Arm (homespun sage sleeve + warm hand)
  const backArm = svgEl(
    'g',
    {
      'data-part': 'back-arm',
      transform: svgTransform({
        x: -2.5,
        y: -52,
        rotate: isWalking ? walkSwing * 0.75 : isWorried ? -20 : -14,
      }),
    },
    [
      celPath(
        'M -3.2 0 C -5.5 6, -7.2 12, -7.8 18 L -1.2 19.5 C 0.8 13, 2.5 7, 3.8 1 Z',
        c.meadowSunShadow,
        { strokeWidth: s.xeroxMedium }
      ),
      svgEl('circle', {
        cx: -4.8,
        cy: 19.8,
        r: 3.3,
        fill: c.skinShadow,
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
    ]
  );

  // 3. Homespun Olive-Sage Medieval Tunic, Ochre Apron & Leather Belt (`data-part="villager-tunic"`)
  const tunicD =
    'M -11.5 -58 C -6 -59.5, 6 -59.5, 11.5 -58 L 15.2 -22 C 6 -20.5, -6 -20.5, -14.8 -22 Z';
  const apronD =
    'M -7.5 -34 L 11.5 -34 L 13.6 -21.5 C 6 -20, -3 -20.2, -9.2 -21.6 Z';

  const torso = svgEl('g', { 'data-part': 'villager-tunic' }, [
    // Main homespun olive-sage tunic with crisp flat cel fold shadow
    celShadedShape({
      d: tunicD,
      baseFill: c.villagerSage,
      shadowFill: c.meadowSunShadow,
      shadowPaths: [
        'M -16 -58 L -3 -58 L -5 -20 L -16 -20 Z',
      ],
      clipId: `${pfx}-tunic-clip`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Soft homespun parchment-cream collar neckline V-tuck
    celPath(
      'M -5.5 -58.5 Q 1.5 -53.0, 7.5 -58.2 L 4.5 -51.5 Q 1.0 -49.5, -3.5 -52.5 Z',
      c.parchmentCream,
      { strokeWidth: s.xeroxFine }
    ),
    // Ochre homespun apron panel draped beneath the belt
    celShadedShape({
      d: apronD,
      baseFill: c.villagerOchre,
      shadowFill: c.warmAmberWash,
      shadowPaths: ['M -10 -34 L -1 -34 L -2.5 -20 L -10 -20 Z'],
      clipId: `${pfx}-apron-clip`,
      strokeWidth: s.xeroxFine,
    }),
    // Feathery Xerox cloth creases across tunic & apron
    xeroxSketchStroke(
      'M -7.5 -49 Q -3 -46, 3.5 -47.5 M -9.0 -42 Q -2 -40, 6.5 -41.5 M -3.5 -28 L -4.5 -23 M 4.8 -28 L 5.8 -23',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
    ),
    // Leather waist belt & antique-gold buckle
    celPath('M -13.6 -36.5 L 13.8 -36.5 L 14.0 -31.5 L -13.8 -31.5 Z', c.woodDark, {
      strokeWidth: s.xeroxFine,
    }),
    svgEl('rect', {
      x: 2.2,
      y: -37.2,
      width: 5.8,
      height: 6.4,
      rx: 1,
      fill: c.antiqueGold,
      ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
    }),
    svgEl('rect', {
      x: 3.8,
      y: -35.6,
      width: 2.6,
      height: 3.2,
      fill: c.woodDark,
    }),
  ]);

  // 4. Front Arm Holding Rolled Parchment Herald Scroll (`data-part="villager-scroll"`)
  const frontArm = svgEl(
    'g',
    {
      'data-part': 'front-arm',
      transform: svgTransform({
        x: 3.5,
        y: -52,
        rotate: isWalking ? -walkSwing * 0.85 : armWave,
      }),
    },
    [
      // Homespun olive-sage sleeve with rolled ochre cuff
      celPath(
        'M -3.0 0 C 0.5 6, 4.5 11.5, 8.0 16.0 L 13.6 12.2 C 9.6 7.0, 6.2 2.2, 3.0 -2.0 Z',
        c.villagerSage,
        { strokeWidth: s.xeroxMedium }
      ),
      celPath('M 6.5 14.0 L 12.4 10.2 L 13.8 12.4 L 8.0 16.2 Z', c.villagerOchre, {
        strokeWidth: s.sketchLine,
      }),
      xeroxSketchStroke('M 1.2 4.5 Q 4.5 6.8, 7.6 9.8', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
      }),
      // Hand grasping scroll
      svgEl('circle', {
        cx: 11.8,
        cy: 13.8,
        r: 3.4,
        fill: c.skinWarm,
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      // Rolled parchment herald scroll with crimson tie & wax seal (`data-part="villager-scroll"`)
      svgEl('g', { 'data-part': 'villager-scroll' }, [
        celPath(
          'M 9.6 6.2 L 21.8 0.2 C 23.8 -0.2, 25.2 2.2, 24.4 5.8 L 12.6 11.8 C 10.6 11.4, 9.2 9.0, 9.6 6.2 Z',
          c.parchmentCream,
          { strokeWidth: s.xeroxFine }
        ),
        // Scroll end spiral
        svgEl('ellipse', {
          cx: 22.8,
          cy: 3.0,
          rx: 1.8,
          ry: 2.8,
          transform: 'rotate(-26 22.8 3.0)',
          fill: c.horseCream,
          ...celStrokeAttrs({ strokeWidth: 0.9, useXeroxFilter: true }),
        }),
        // Crimson ribbon band & wax seal
        celPath('M 14.8 3.6 L 17.0 2.5 L 19.6 8.2 L 17.4 9.3 Z', c.soldierCrimson, {
          strokeWidth: 0.85,
        }),
        svgEl('circle', {
          cx: 17.2,
          cy: 6.0,
          r: 1.6,
          fill: c.soldierCrimson,
          ...celStrokeAttrs({ strokeWidth: 0.75 }),
        }),
        xeroxSketchStroke('M 12.2 7.5 L 15.0 6.2 M 19.4 4.2 L 21.4 3.2', {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.75,
        }),
      ]),
    ]
  );

  // 5. Expressive 1973 *Robin Hood* Face & Feathered Herald Cap Facing RIGHT (+X)
  const headFaceD =
    'M -12.0 -73.0 C -12.2 -82.5, -4.5 -86.2, 3.2 -85.2 C 9.8 -84.2, 12.6 -79.2, 13.0 -74.0 L 15.0 -71.2 L 12.8 -69.5 C 12.4 -63.0, 7.6 -59.0, 0.5 -59.2 C -6.8 -59.4, -11.8 -64.8, -12.0 -73.0 Z';

  // 4-stage 12 FPS lip-sync mouth (or worried/cheerful default expression)
  let mouthMarkup: string;
  if (speakingActive) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let phaseShape: string;
    if (mouthPhase === 0) {
      phaseShape = svgEl('path', {
        d: isWorried ? 'M 3.0 -64.5 Q 6.4 -66.5, 9.6 -64.5' : 'M 2.5 -65.5 Q 6.4 -62.2, 10.2 -65.5',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      });
    } else if (mouthPhase === 1) {
      phaseShape = [
        svgEl('ellipse', {
          cx: 6.6,
          cy: -64.5,
          rx: 2.3,
          ry: 2.6,
          fill: c.mochiMouthInner,
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
        }),
        svgEl('ellipse', {
          cx: 6.6,
          cy: -63.0,
          rx: 1.3,
          ry: 0.9,
          fill: c.mochiTongue,
        }),
      ].join('');
    } else if (mouthPhase === 2) {
      phaseShape = [
        celPath(
          'M 2.2 -66.0 Q 6.4 -65.2, 10.4 -66.0 C 9.8 -60.2, 2.8 -60.2, 2.2 -66.0 Z',
          c.mochiMouthInner,
          { strokeWidth: s.xeroxFine }
        ),
        svgEl('path', {
          d: 'M 4.0 -62.4 Q 6.4 -64.0, 8.8 -62.4 C 8.0 -60.8, 4.8 -60.8, 4.0 -62.4 Z',
          fill: c.mochiTongue,
        }),
      ].join('');
    } else {
      phaseShape = [
        celPath(
          'M 2.6 -65.6 Q 6.4 -64.6, 10.0 -65.6 C 9.2 -61.8, 3.4 -61.8, 2.6 -65.6 Z',
          c.mochiMouthInner,
          { strokeWidth: s.xeroxFine }
        ),
        svgEl('path', {
          d: 'M 4.4 -63.2 Q 6.4 -64.2, 8.4 -63.2 C 7.6 -62.2, 5.2 -62.2, 4.4 -63.2 Z',
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
      phaseShape
    );
  } else if (isWorried) {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('ellipse', {
        cx: 6.8,
        cy: -64.6,
        rx: 3.0,
        ry: 2.3,
        fill: c.mochiMouthInner,
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      svgEl('ellipse', {
        cx: 6.8,
        cy: -63.3,
        rx: 1.7,
        ry: 0.9,
        fill: c.mochiTongue,
      }),
    ]);
  } else {
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: isWaving ? 'M 2.2 -66.0 Q 6.5 -61.2, 10.6 -66.2' : 'M 2.6 -65.6 Q 6.4 -62.2, 10.0 -65.6',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
      }),
      xeroxSketchStroke('M 1.8 -66.4 L 3.0 -65.0', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.75,
      }),
    ]);
  }

  // Expressive Disney eye & eyebrow
  const eyeMarkup = blink
    ? svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('path', {
          d: 'M 2.8 -74.0 Q 6.0 -71.0, 9.2 -74.0',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
        }),
        xeroxSketchStroke('M 2.6 -77.6 Q 6.0 -79.4, 9.4 -77.6', {
          stroke: c.xeroxInk,
          strokeWidth: 1.15,
        }),
      ])
    : svgEl('g', { 'data-part': 'eyes' }, [
        svgEl('ellipse', {
          cx: 6.2,
          cy: -74.2,
          rx: 2.9,
          ry: 3.4,
          fill: c.celCream,
          ...celStrokeAttrs({ strokeWidth: 1.05, useXeroxFilter: true }),
        }),
        svgEl('ellipse', {
          cx: 6.9,
          cy: isWorried ? -74.5 : -74.0,
          rx: 1.65,
          ry: 2.1,
          fill: c.xeroxInk,
        }),
        svgEl('circle', {
          cx: 6.2,
          cy: -75.2,
          r: 0.72,
          fill: c.celCream,
        }),
        // Bold upper lash + expressive brow (worried slant vs cheerful lift)
        svgEl('path', {
          d: 'M 3.0 -75.2 Q 6.2 -78.2, 9.2 -75.2',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: 1.55, useXeroxFilter: true }),
        }),
        xeroxSketchStroke(
          isWorried
            ? 'M 2.4 -78.0 Q 5.8 -79.6, 9.6 -81.0'
            : isWaving
            ? 'M 2.6 -79.2 Q 6.2 -81.6, 9.6 -79.2'
            : 'M 2.8 -78.4 Q 6.2 -80.2, 9.4 -78.4',
          { stroke: c.xeroxInk, strokeWidth: 1.35, feather: true }
        ),
      ]);

  const head = svgEl(
    'g',
    {
      'data-part': 'villager-head',
      transform: svgTransform({
        rotate: headTilt,
        pivotX: 0,
        pivotY: -60,
      }),
    },
    [
      // Warm sculpted 3/4 head with flat cel shadow plane on back-left
      celShadedShape({
        d: headFaceD,
        baseFill: c.skinWarm,
        shadowFill: c.skinShadow,
        shadowPaths: [
          'M -13 -84 L -4 -84 C -6 -74, -5 -65, 2 -60 L -13 -60 Z',
        ],
        clipId: `${pfx}-face-clip`,
        strokeWidth: s.xeroxHeavy,
      }),
      // Tousled medieval brown hair at back-left & ear peek
      celPath(
        'M -11.5 -78.5 C -15.2 -71.0, -13.4 -61.5, -6.5 -62.5 C -8.6 -67.5, -8.5 -74.0, -3.5 -78.5 Z',
        c.woodMid,
        { strokeWidth: s.xeroxFine }
      ),
      xeroxSketchStroke('M -12.0 -72.0 L -9.2 -69.5 M -11.2 -66.5 L -8.6 -65.2', {
        stroke: c.woodDark,
        strokeWidth: s.sketchLine,
      }),
      svgEl('circle', {
        cx: -5.8,
        cy: -70.8,
        r: 2.6,
        fill: c.skinWarm,
        ...celStrokeAttrs({ strokeWidth: 1.0, useXeroxFilter: true }),
      }),
      // Subtle flat dusty-rose cheek blush
      svgEl('ellipse', {
        cx: 4.0,
        cy: -69.0,
        rx: 3.4,
        ry: 2.1,
        fill: c.dustyRose,
        opacity: 0.48,
      }),
      // Expressive Disney eye & brow
      eyeMarkup,
      // 4-stage speaking mouth or default expression
      mouthMarkup,
      // Slouchy medieval herald cap with cloth creases & antique-gold plume feather (`data-part="villager-cap"`)
      svgEl('g', { 'data-part': 'villager-cap' }, [
        // Jaunty antique-gold feather plume tucked into cap band (x >= -21, y >= -97)
        celPath(
          `M -6.5 -87.5 C -14.0 -97.0, ${round2(-21.2 + featherBoil * 0.5)} ${round2(-95.8 + featherBoil * 0.4)}, -16.2 -85.8 C -12.6 -85.2, -9.2 -85.8, -6.5 -87.5 Z`,
          c.sunGoldCore,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke(
          `M -8.5 -87.2 Q -14.2 -91.8, ${round2(-18.2 + featherBoil * 0.4)} -93.0 M -13.0 -91.8 L -14.6 -94.2 M -15.2 -90.0 L -17.4 -90.8`,
          { stroke: c.xeroxInkSoft, strokeWidth: 0.85 }
        ),
        // Slouchy cloth herald cap with crisp flat shadow fold & ochre band
        celShadedShape({
          d: 'M -14.8 -80.2 C -16.2 -92.5, 13.8 -94.2, 16.0 -80.2 Z',
          baseFill: c.cottageShutter,
          shadowFill: c.cottageShutterShadow,
          shadowPaths: ['M -17 -93 L -3 -93 L -5 -79 L -17 -79 Z'],
          clipId: `${pfx}-cap-clip`,
          strokeWidth: s.xeroxMedium,
        }),
        // Ochre cap brim cuff
        celPath(
          'M -14.5 -81.8 Q 1.0 -84.2, 15.8 -81.8 L 15.4 -78.8 Q 1.0 -81.2, -14.2 -78.8 Z',
          c.villagerOchre,
          { strokeWidth: s.xeroxFine }
        ),
        // Sketchy Xerox cloth fold creases on cap crown
        xeroxSketchStroke(
          'M -9.2 -85.5 Q -2.0 -89.5, 6.2 -87.2 M -4.0 -83.8 Q 3.5 -86.2, 10.8 -84.0',
          { stroke: c.xeroxInk, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
        ),
      ]),
    ]
  );

  return svgEl(
    'g',
    {
      'data-character': 'villager',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      celContactShadow(0, 0.4, shadowRx, 3.0, 0.32),
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: bodyBob,
            scaleX: bodyScaleX,
            scaleY: bodyScaleY,
          }),
        },
        [legs, backArm, torso, frontArm, head]
      ),
    ]
  );
}

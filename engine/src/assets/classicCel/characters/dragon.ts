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
import { renderStarShape } from '../../props/shared';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-dragon';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-dragon-${clean}` : 'cc-dragon';
}

/**
 * Renders Barnaby the Classic 1970s–1980s Hand-Drawn Cel Storybook Dragon (`'dragon'`).
 * - Inspired by Disney's *Pete's Dragon* (1977) & *Robin Hood* (1973): expressive pear-shaped
 *   emerald dragon with 100% flat matte analog cel paint, raw electrostatic `#xerox-ink`
 *   charcoal outlines (`celPath`), feathery internal `xeroxSketchStroke` graphite ticks,
 *   and grounded `celContactShadow` (ZERO gradients, ZERO crayon patterns, ZERO neon bloom).
 * - Strictly faces RIGHT (`+X`) when `flipX: false` (`data-facing="right"`).
 * - Ground origin `(0, 0)` at claws (`y = -2`), bounds `x: -104..+62, y: -144..-2`
 *   (and up to `x: +108` during `'waving'` upward-forward flame puff).
 * - Expressive story states:
 *   - `'awake'` / `'grumpy'`: Roaring/aching wide jaw with visible crooked aching tooth &
 *     lodged bramble thorn (`data-part="dragon-tooth"` around `x: 36..44, y: -88..-80`),
 *     worried watery Disney eyes/brows, flapping wings.
 *   - `'waving'`: Hiccup jolt! Wide jaw + aching tooth (`data-part="dragon-tooth"`) +
 *     upward-forward 3-tone flat-cel flame puff (`data-part="dragon-breath"`, `y: -92..-128`).
 *   - `'sitting'` / `'sleepy'` / `'sleeping'`: Blissfully relieved/tamed (`bodyBob = +12`),
 *     happy closed curving Disney eyes, warm tooth-free smile, circling antique-gold dizzy
 *     relief stars (`data-part="dizzy-stars"`).
 *   - `'walking'`: Joyful bouncy 12 FPS stomp walk (`data-walk-profile="true"`), NO sore tooth,
 *     NO fire breath, happy beaming smile.
 *   - `'idle'` / `'singing'`: Beaming healed friendly dragon, NO sore tooth, NO fire breath.
 * - 4-stage 12 FPS lip-sync mouth when `isSpeaking` or `state === 'singing'`
 *   (`data-speaking-mouth="true"`, `data-mouth-phase="0..3"`), preserving the crooked aching
 *   tooth during `awake`/`grumpy`/`waving` and cleanly tooth-free otherwise.
 */
export function renderClassicDragon(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const isRoaring = state === 'awake' || state === 'grumpy' || state === 'waving';
  const isTamed = state === 'sitting' || state === 'sleepy' || state === 'sleeping';
  const isWalking = state === 'walking';
  const isWaving = state === 'waving';
  const speakingActive = isSpeaking || state === 'singing';

  // 12 FPS ("on twos") hand-drawn animation timing & organic pencil boil
  const drawStep = Math.floor(frameIndex / 2);
  const boilA = round2(deterministicJitter(drawStep, 13, 0.65));
  const boilB = round2(deterministicJitter(drawStep, 29, 0.55));
  const flameBoil = round2(deterministicJitter(drawStep, 43, 1.3));

  const wingFlap = isWaving
    ? round2(steppedOscillate(frameIndex, 6, 17) - 5)
    : isRoaring
    ? round2(steppedOscillate(frameIndex, 6, 14))
    : isWalking
    ? round2(steppedOscillate(frameIndex, 8, 9))
    : isTamed
    ? round2(steppedOscillate(frameIndex, 20, 3) + 6)
    : round2(steppedOscillate(frameIndex, 16, 6));

  const farWingFlap = round2(wingFlap * 0.8 - 4);

  const strideBob = isWalking
    ? round2(Math.abs(steppedOscillate(frameIndex, 8, 3.6)))
    : 0;
  const bodyBob = isTamed
    ? 12
    : isWalking
    ? round2(-strideBob)
    : isWaving
    ? round2(steppedOscillate(frameIndex, 6, 2.8) - 1.5)
    : round2(steppedOscillate(frameIndex, 14, 1.8));

  // Classic 12 FPS squash-and-stretch on torso/head
  const stretchPulse = isWaving
    ? steppedOscillate(frameIndex, 6, 0.032)
    : isWalking
    ? steppedOscillate(frameIndex, 4, 0.026)
    : isRoaring
    ? steppedOscillate(frameIndex, 8, 0.022)
    : steppedOscillate(frameIndex, 20, 0.014);
  const bodyScaleX = round2(1 - stretchPulse);
  const bodyScaleY = round2(1 + stretchPulse);

  const stepSwing = isWalking ? steppedOscillate(frameIndex, 8, 16) : 0;
  const tailSway = isWalking
    ? steppedOscillate(frameIndex, 8, 5.5, -2)
    : isRoaring
    ? steppedOscillate(frameIndex, 8, 4.2, -1)
    : steppedOscillate(frameIndex, 20, 3.2, -2);
  const headRock = isWaving
    ? round2(-3.5 + steppedOscillate(frameIndex, 6, 3.2))
    : isRoaring
    ? round2(steppedOscillate(frameIndex, 8, 2.4))
    : isWalking
    ? round2(steppedOscillate(frameIndex, 8, 2.8, -1))
    : isTamed
    ? round2(steppedOscillate(frameIndex, 24, 1.6))
    : round2(steppedOscillate(frameIndex, 18, 1.8));

  const blink =
    state === 'sleeping' ||
    state === 'blinking' ||
    (!isRoaring && !isTamed && isSteppedBlinkFrame(frameIndex, 36, 2, 4));

  const shadowRx = isTamed ? 44 : round2(39 - strideBob * 0.6);

  // 1. Sinuous Storybook Dragon Tail on -X (`data-part="dragon-tail"`, reaches x ≈ -103)
  const tailTipX = round2(-91 + tailSway * 0.35);
  const tailTipY = round2(-65 + tailSway * 0.45 + boilA * 0.5);
  const tailD = [
    'M -38 -25',
    `C -68 -20, -94 -38, ${tailTipX} ${tailTipY}`,
    `C -80 -54, -64 -41, -34 -42 Z`,
  ].join(' ');
  const tailSpadeD = [
    `M ${tailTipX} ${tailTipY}`,
    `L ${round2(Math.max(-103.5, tailTipX - 11.5))} ${round2(tailTipY - 7.5)}`,
    `L ${round2(tailTipX - 2.5)} ${round2(tailTipY - 15.5)}`,
    `L ${round2(tailTipX + 7.5)} ${round2(tailTipY - 4.5)} Z`,
  ].join(' ');

  const tail = svgEl('g', { 'data-part': 'dragon-tail' }, [
    celShadedShape({
      d: tailD,
      baseFill: c.dragonEmerald,
      shadowFill: c.dragonEmeraldShadow,
      shadowPaths: [
        `M -36 -23 C -66 -18, -90 -33, ${round2(tailTipX + 2)} ${round2(tailTipY + 5)} L -94 -20 L -32 -16 Z`,
      ],
      clipId: `${pfx}-tail-clip`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Small dorsal tail-ridge scales
    celPath(
      'M -56 -41 L -63 -49 L -50 -44 M -72 -49 L -79 -58 L -67 -52',
      c.sunGoldCore,
      { strokeWidth: s.xeroxFine }
    ),
    // Spade tail tip in warm russet cel paint
    celPath(tailSpadeD, c.cottageRoof, { strokeWidth: s.xeroxMedium }),
    xeroxSketchStroke(
      `M ${round2(tailTipX - 3)} ${round2(tailTipY - 5)} L ${round2(tailTipX - 8)} ${round2(tailTipY - 9)} M -58 -33 Q -68 -36, -77 -44`,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.78 }
    ),
  ]);

  // 2. Articulated Scalloped Bat-Like Dragon Wings (`data-part="dragon-wings"`)
  const nearWingD = [
    'M 0 0',
    `C -16 -36, -48 -47, ${round2(-62 + boilA * 0.4)} ${round2(-19 + boilB * 0.4)}`,
    'C -45 -18, -35 -10, -29 4',
    'C -20 -4, -10 -2, 0 6 Z',
  ].join(' ');
  const farWingD =
    'M 4 -4 C -8 -36, -34 -46, -48 -24 C -34 -20, -24 -12, -18 0 C -10 -5, -2 -3, 4 2 Z';

  const wings = svgEl(
    'g',
    {
      'data-part': 'dragon-wings',
      transform: svgTransform({ x: -16, y: -86 }),
    },
    [
      // Back far wing (darker shadow tone for depth)
      svgEl(
        'g',
        { transform: svgTransform({ rotate: farWingFlap }) },
        [
          celPath(farWingD, c.cottageRoofShadow, { strokeWidth: s.xeroxMedium }),
          xeroxSketchStroke('M 1 -5 L -28 -25 M 0 -3 L -18 -11', {
            stroke: c.xeroxInk,
            strokeWidth: s.sketchLine,
            opacity: 0.76,
          }),
        ]
      ),
      // Near scalloped russet bat-wing with emerald wing-arm rib & sketchy membrane folds
      svgEl(
        'g',
        { transform: svgTransform({ rotate: wingFlap }) },
        [
          celShadedShape({
            d: nearWingD,
            baseFill: c.cottageRoof,
            shadowFill: c.cottageRoofShadow,
            shadowPaths: [
              'M -6 -2 C -20 -12, -38 -14, -56 -16 L -32 8 L 2 10 Z',
            ],
            clipId: `${pfx}-wing-clip`,
            strokeWidth: s.xeroxHeavy,
          }),
          // Sculpted emerald wing-arm top strut + tiny thumb claw
          celPath(
            'M 1 0 C -14 -30, -40 -42, -59 -22 C -42 -36, -18 -26, -3 2 Z',
            c.dragonEmeraldLit,
            { strokeWidth: s.xeroxFine }
          ),
          celPath('M -32 -34 L -37 -41 L -28 -36 Z', c.celCream, {
            strokeWidth: s.sketchLine,
          }),
          // Wing finger struts & sketchy membrane creases
          xeroxSketchStroke(
            'M -4 -4 L -40 -24 M -4 -4 L -29 -6 M -18 -17 Q -26 -14, -34 -16 M -26 -24 Q -36 -25, -45 -22',
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine, feather: true, opacity: 0.84 }
          ),
        ]
      ),
    ]
  );

  // 3. Plump *Pete's Dragon* Pear-Shaped Body, Dorsal Crest & Ridged Belly (`data-part="dragon-body"`)
  const torsoD = [
    'M -42 -35',
    'C -48 -78, -22 -106, 13 -96',
    'C 39 -88, 45 -48, 34 -20',
    'C 22 -6, -34 -8, -42 -35 Z',
  ].join(' ');
  const bellyD = [
    'M 2 -84',
    'C 26 -78, 36 -48, 26 -20',
    'C 12 -14, -3 -20, -6 -46',
    'C -8 -66, -3 -78, 2 -84 Z',
  ].join(' ');

  const armAngle = isWaving
    ? round2(-26 + steppedOscillate(frameIndex, 6, 10))
    : isRoaring
    ? round2(-18 + steppedOscillate(frameIndex, 8, 8))
    : isWalking
    ? round2(steppedOscillate(frameIndex, 8, 12))
    : isTamed
    ? 14
    : round2(-6 + steppedOscillate(frameIndex, 16, 5));

  const body = svgEl('g', { 'data-part': 'dragon-body' }, [
    // Dorsal crest spikes curving down the spine
    celPath(
      'M -24 -97 L -35 -106 L -20 -101 M -33 -86 L -45 -94 L -31 -91 M -39 -72 L -50 -78 L -37 -76 M -42 -56 L -52 -60 L -41 -60',
      c.sunGoldCore,
      { strokeWidth: s.xeroxFine }
    ),
    // Pear-shaped emerald dragon torso with crisp 2-tone flat cel shadow plane
    celShadedShape({
      d: torsoD,
      baseFill: c.dragonEmerald,
      shadowFill: c.dragonEmeraldShadow,
      shadowPaths: [
        'M -46 -40 C -36 -18, -8 -14, 34 -22 L 42 -4 L -48 -4 Z',
        'M -48 -84 C -40 -72, -32 -54, -26 -30 L -48 -28 Z',
      ],
      highlightFill: c.dragonEmeraldLit,
      highlightPaths: [
        'M -18 -98 C 0 -102, 16 -96, 22 -86 C 8 -90, -10 -90, -24 -86 Z',
      ],
      highlightOpacity: 0.78,
      clipId: `${pfx}-torso-clip`,
      strokeWidth: s.xeroxHeavy,
    }),
    // Warm ochre-gold ridged pear belly plates
    celShadedShape({
      d: bellyD,
      baseFill: c.dragonBelly,
      shadowFill: c.dragonBellyShadow,
      shadowPaths: [
        'M -8 -48 C 4 -24, 18 -20, 30 -24 L 26 -10 L -10 -12 Z',
      ],
      clipId: `${pfx}-belly-clip`,
      strokeWidth: s.xeroxMedium,
    }),
    // Classic storybook horizontal belly plate crease lines & internal graphite hatching
    xeroxSketchStroke(
      'M -2 -70 Q 12 -67, 24 -68 M -5 -55 Q 11 -52, 28 -53 M -4 -40 Q 11 -37, 27 -38 M -1 -27 Q 10 -24, 23 -25',
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine, opacity: 0.78 }
    ),
    xeroxSketchStroke(
      'M -30 -56 Q -22 -48, -16 -52 M -26 -36 Q -18 -32, -12 -36',
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),
    // Expressive little dragon forearm/paw on +X chest
    svgEl(
      'g',
      {
        'data-part': 'dragon-forearm',
        transform: svgTransform({ x: 20, y: -64, rotate: armAngle }),
      },
      [
        celPath(
          'M -3 -4 C 6 -2, 14 2, 18 8 C 19 12, 14 15, 9 12 C 4 9, -2 6, -5 3 Z',
          c.dragonEmerald,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath(
          'M 16 7 L 21 6 L 18 10 M 15 11 L 20 12 L 16 13',
          c.celCream,
          { strokeWidth: s.sketchLine }
        ),
      ]
    ),
  ]);

  // 4. Sturdy Articulated Dragon Legs & Cream Claws Facing RIGHT (+X), grounded at y = -2
  const legs = isTamed
    ? svgEl('g', { 'data-part': 'dragon-legs' }, [
        // Seated tucked far foot resting flat at y = -14 (shifted +12 by bodyBob -> y = -2!)
        celPath(
          'M -26 -24 C -28 -16, -24 -14, -8 -14 C -2 -14, 0 -20, -8 -24 Z',
          c.dragonEmeraldShadow,
          { strokeWidth: s.xeroxMedium }
        ),
        celPath('M -4 -14 L 2 -14 L -2 -19 Z', c.celCream, {
          strokeWidth: s.sketchLine,
        }),
        // Seated plump near haunch & splayed friendly foot resting at y = -14 (+12 = -2)
        celPath(
          'M 6 -34 C -2 -26, -2 -14, 14 -14 L 30 -14 C 34 -14, 34 -22, 24 -24 C 18 -26, 16 -32, 6 -34 Z',
          c.dragonEmerald,
          { strokeWidth: s.xeroxHeavy }
        ),
        celPath(
          'M 28 -14 L 36 -14 L 31 -20 M 24 -14 L 30 -14 L 26 -19',
          c.celCream,
          { strokeWidth: s.xeroxFine }
        ),
        xeroxSketchStroke('M 6 -25 Q 12 -22, 18 -24', {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          broken: true,
        }),
      ])
    : svgEl('g', { 'data-part': 'dragon-legs' }, [
        // Far-side hind leg (darker flat cel shadow tone)
        svgEl(
          'g',
          { transform: svgTransform({ x: -16, y: -22, rotate: -stepSwing }) },
          [
            celPath(
              'M -10 -2 C -12 6, -12 14, -10 20 L 12 20 C 13 15, 10 8, 8 -2 Z',
              c.dragonEmeraldShadow,
              { strokeWidth: s.xeroxHeavy }
            ),
            celPath('M 10 20 L 18 20 L 13 13 Z', c.celCream, {
              strokeWidth: s.xeroxFine,
            }),
            celPath('M 5 20 L 12 20 L 8 14 Z', c.celCream, {
              strokeWidth: s.sketchLine,
            }),
          ]
        ),
        // Near-side sturdy front/hind leg with curved thigh & claws at y = -2
        svgEl(
          'g',
          { transform: svgTransform({ x: 14, y: -22, rotate: stepSwing }) },
          [
            celPath(
              'M -11 -2 C -12 7, -11 14, -9 20 L 14 20 C 15 14, 13 6, 10 -2 Z',
              c.dragonEmerald,
              { strokeWidth: s.xeroxHeavy }
            ),
            xeroxSketchStroke('M -6 8 Q 0 10, 6 8', {
              stroke: c.xeroxInkSoft,
              strokeWidth: s.sketchLine,
              broken: true,
            }),
            celPath('M 12 20 L 20 20 L 15 13 Z', c.celCream, {
              strokeWidth: s.xeroxFine,
            }),
            celPath('M 6 20 L 13 20 L 9 14 Z', c.celCream, {
              strokeWidth: s.sketchLine,
            }),
          ]
        ),
      ]);

  // 5. Expressive *Pete's Dragon* Head Facing RIGHT (+X) (`data-part="dragon-head"`)
  const headClipId = `${pfx}-head-clip`;
  const eyeClipId = `${pfx}-eye-clip`;
  const snoutHeadD = [
    'M -20 -106',
    'C -22 -127, 14 -130, 31 -118',
    'C 50 -116, 61 -106, 57 -92',
    'C 52 -83, 20 -81, -16 -87 Z',
  ].join(' ');

  // Crooked aching cream tooth + lodged wooden bramble thorn stub (strictly around x: 36..44, y: -88..-80)
  function renderSoreToothAndThorn(): string {
    return svgEl('g', { 'data-part': 'dragon-tooth-thorn' }, [
      // Crooked aching cream fang projecting down from upper jaw
      celPath(
        'M 34.5 -93.5 L 38.2 -82.5 L 42.4 -93.2 Z',
        c.celCream,
        { strokeWidth: s.xeroxFine }
      ),
      // Subtle ache-throb graphite tick on tooth root
      xeroxSketchStroke('M 37.5 -91.5 L 38.4 -87.5', {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.85,
        opacity: 0.72,
      }),
      // Lodged dark wooden bramble thorn stub stuck into the crooked tooth (x: 36..44, y: -88..-80)
      svgEl('path', {
        d: 'M 36.2 -87.5 L 44.0 -83.8 M 38.2 -89.8 L 43.2 -81.0 M 40.4 -85.5 L 44.2 -86.6',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.woodDark,
          strokeWidth: 2.1,
          useXeroxFilter: true,
        }),
      }),
      svgEl('path', {
        d: 'M 37.0 -86.8 L 42.8 -84.2',
        fill: 'none',
        stroke: c.woodMid,
        'stroke-width': 0.9,
        'stroke-linecap': 'round',
      }),
    ]);
  }

  // Mouth: supports 4-stage 12 FPS lip-sync when speaking/singing,
  // preserving `data-part="dragon-tooth"` during roaring/aching states and cleanly tooth-free otherwise!
  let mouthMarkup: string;
  if (speakingActive) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;

    if (isRoaring) {
      // Speaking while aching/roaring: keep crooked sore tooth + thorn clearly visible!
      let jawShape: string;
      if (mouthPhase === 0) {
        // Phase 0: Narrow pained grimace jaw with sore tooth peeking over lower lip
        jawShape = [
          celPath(
            'M 22 -93.5 L 53 -93.5 L 49 -86.5 L 23 -87.5 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxFine }
          ),
          renderSoreToothAndThorn(),
        ].join('');
      } else if (mouthPhase === 1) {
        // Phase 1: Rounded aching 'o' roar with sore tooth visible
        jawShape = [
          celPath(
            'M 24 -94 C 36 -95, 52 -94, 52 -88 C 52 -81, 34 -80, 24 -84 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          svgEl('path', {
            d: 'M 30 -83 Q 38 -86, 46 -83 C 44 -81, 32 -81, 30 -83 Z',
            fill: c.mochiTongue,
          }),
          renderSoreToothAndThorn(),
        ].join('');
      } else if (mouthPhase === 2) {
        // Phase 2: Wide open aching bellow with pink tongue + sore tooth & thorn
        jawShape = [
          celPath(
            'M 20 -94.5 L 55 -94.5 C 53 -80, 44 -78, 22 -81.5 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M 27 -82 Q 37 -86.5, 47 -82 C 44 -79, 30 -79, 27 -82 Z',
            c.mochiTongue,
            { strokeWidth: s.sketchLine }
          ),
          renderSoreToothAndThorn(),
        ].join('');
      } else {
        // Phase 3: Half-open sore grimace jaw
        jawShape = [
          celPath(
            'M 21 -94 L 54 -94 L 48 -82.5 L 22 -84 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          svgEl('path', {
            d: 'M 29 -84 Q 38 -86.5, 45 -84 C 42 -82, 31 -82, 29 -84 Z',
            fill: c.mochiTongue,
          }),
          renderSoreToothAndThorn(),
        ].join('');
      }

      mouthMarkup = svgEl(
        'g',
        {
          'data-part': 'dragon-tooth',
          'data-speaking-mouth': 'true',
          'data-mouth-phase': String(mouthPhase),
        },
        jawShape
      );
    } else {
      // Speaking/singing when healed/happy/tamed: cleanly tooth-free!
      let happyJaw: string;
      if (mouthPhase === 0) {
        happyJaw = svgEl('path', {
          d: 'M 21 -92 Q 36 -83, 50 -92',
          fill: 'none',
          ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
        });
      } else if (mouthPhase === 1) {
        happyJaw = [
          svgEl('ellipse', {
            cx: 38,
            cy: -88,
            rx: 7.5,
            ry: 4.5,
            fill: c.mochiMouthInner,
            ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
          }),
          svgEl('ellipse', {
            cx: 38,
            cy: -85.5,
            rx: 4.5,
            ry: 1.8,
            fill: c.mochiTongue,
          }),
        ].join('');
      } else if (mouthPhase === 2) {
        happyJaw = [
          celPath(
            'M 22 -93 Q 37 -90, 51 -93 C 49 -80, 26 -80, 22 -93 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          celPath(
            'M 29 -84 Q 37 -88, 45 -84 C 43 -81, 31 -81, 29 -84 Z',
            c.mochiTongue,
            { strokeWidth: s.sketchLine }
          ),
        ].join('');
      } else {
        happyJaw = [
          celPath(
            'M 23 -92.5 Q 37 -89.5, 50 -92.5 C 47 -83, 27 -83, 23 -92.5 Z',
            c.mochiMouthInner,
            { strokeWidth: s.xeroxMedium }
          ),
          svgEl('path', {
            d: 'M 30 -85.5 Q 37 -88, 44 -85.5 C 41 -83.5, 33 -83.5, 30 -85.5 Z',
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
        happyJaw
      );
    }
  } else if (isRoaring) {
    // Classic roaring/aching wide jaw with visible crooked aching tooth + lodged thorn (`data-part="dragon-tooth"`)
    mouthMarkup = svgEl('g', { 'data-part': 'dragon-tooth' }, [
      celPath(
        'M 21 -94.5 L 55 -94.5 C 52 -81, 46 -80, 22 -83 Z',
        c.mochiMouthInner,
        { strokeWidth: s.xeroxMedium }
      ),
      celPath(
        'M 27 -84 Q 36 -87.5, 45 -84 C 42 -81.5, 30 -81.5, 27 -84 Z',
        c.mochiTongue,
        { strokeWidth: s.sketchLine }
      ),
      renderSoreToothAndThorn(),
    ]);
  } else {
    // Beaming friendly tooth-free storybook smile (idle, walking, sitting, sleepy, sleeping)
    mouthMarkup = svgEl('g', { 'data-part': 'mouth' }, [
      svgEl('path', {
        d: isTamed
          ? 'M 22 -91 Q 36 -83.5, 49 -92'
          : 'M 21 -92 Q 36 -82, 51 -92.5',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
      }),
      // Cute cheerful Disney cheek-corner dimple tick
      xeroxSketchStroke('M 20.5 -93.2 Q 22 -91.5, 23 -90.2', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
    ]);
  }

  // Expressive Disney Dragon Eye (worried & watery when aching, blissful upward arcs when tamed, bright friendly almond eye when healed!)
  let eyeMarkup: string;
  if (isTamed || blink) {
    const isSleepingClosed = state === 'sleeping' || blink;
    eyeMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('path', {
        d: isSleepingClosed
          ? 'M 7 -112 Q 14 -105.5, 21 -112'
          : 'M 7 -110 Q 14 -117.5, 21 -110',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      xeroxSketchStroke(
        isSleepingClosed
          ? 'M 7 -112 L 4.5 -110.2 M 21 -112 L 23.5 -110.2'
          : 'M 7 -110 L 4.8 -112.2 M 21 -110 L 23.2 -112.2',
        { strokeWidth: s.xeroxFine, opacity: 0.85 }
      ),
      // Soft relaxed relieved eyebrow
      xeroxSketchStroke('M 6.5 -119.5 Q 14 -123.5, 21.5 -119.5', {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        feather: true,
        opacity: 0.82,
      }),
    ]);
  } else {
    const eyeD =
      'M 6.5 -111.5 C 6.5 -118.8, 19.8 -119.2, 21.4 -111.8 C 22.2 -106.5, 17.5 -103.8, 12.6 -104.2 C 8.4 -104.6, 6.4 -107.6, 6.5 -111.5 Z';
    eyeMarkup = svgEl('g', { 'data-part': 'eyes' }, [
      svgEl('clipPath', { id: eyeClipId }, svgEl('path', { d: eyeD })),
      svgEl('path', { d: eyeD, fill: c.celCream }),
      svgEl('g', { 'clip-path': svgUrl(eyeClipId) }, [
        // Warm amber-gold iris ring (flat matte cel paint)
        svgEl('ellipse', {
          cx: 15.6,
          cy: isRoaring ? -110.4 : -111.0,
          rx: 4.1,
          ry: 4.8,
          fill: c.mochiEyeIris,
        }),
        // Classic charcoal pupil
        svgEl('ellipse', {
          cx: 16.0,
          cy: isRoaring ? -110.4 : -111.2,
          rx: 2.7,
          ry: 3.4,
          fill: c.xeroxInk,
        }),
        // Crisp parchment catchlight fleck
        svgEl('circle', {
          cx: 14.2,
          cy: -113.2,
          r: 1.35,
          fill: c.celCream,
        }),
        // Watery lower-lid ache shimmer when roaring/tooth hurts (flat cel paint!)
        isRoaring
          ? svgEl('path', {
              d: 'M 7.0 -106.2 Q 14.0 -108.0, 21.0 -106.0 L 21.5 -103.5 L 6.5 -103.5 Z',
              fill: c.waterHighlight,
              opacity: 0.78,
            })
          : '',
      ]),
      celPath(eyeD, 'none', { strokeWidth: s.xeroxFine }),
      // Bold Disney upper lash curve
      svgEl('path', {
        d: 'M 5.6 -112.8 C 7.4 -119.4, 19.6 -119.8, 22.0 -112.6',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: s.xeroxHeavy, useXeroxFilter: true }),
      }),
      // Expressive Disney eyebrow (worried upward-inner slant when tooth aches vs joyful arch when healed)
      xeroxSketchStroke(
        isRoaring
          ? 'M 5.2 -119.0 Q 13.0 -121.0, 20.5 -124.8'
          : 'M 6.0 -121.2 Q 14.0 -125.6, 22.0 -121.0',
        { stroke: c.xeroxInk, strokeWidth: 2.0, feather: true, opacity: 0.92 }
      ),
      // Tiny worried sweat/tear drop on lower cheek edge during toothache
      isRoaring
        ? celPath(
            'M 6.2 -106.0 C 4.2 -103.8, 4.6 -101.0, 6.4 -101.2 C 8.0 -101.4, 8.2 -103.8, 6.2 -106.0 Z',
            c.waterHighlight,
            { strokeWidth: 0.9 }
          )
        : '',
    ]);
  }

  const head = svgEl(
    'g',
    {
      'data-part': 'dragon-head',
      transform: svgTransform({
        rotate: headRock,
        pivotX: 4,
        pivotY: -96,
      }),
    },
    [
      // Curved golden storybook horns (topmost y ≈ -142)
      celPath(
        'M -12 -118 C -24 -134, -17 -143, -5 -134 L 0 -118 Z',
        c.sunGoldRim,
        { strokeWidth: s.xeroxMedium }
      ),
      celPath(
        'M 2 -120 C -6 -136, 3 -143, 11 -133 L 12 -118 Z',
        c.sunGoldCore,
        { strokeWidth: s.xeroxMedium }
      ),
      xeroxSketchStroke('M -12 -126 L -7 -124 M 4 -128 L 9 -126', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      // Cute expressive dragon ear frill on -X side of head
      celPath(
        'M -17 -112 C -26 -116, -28 -106, -18 -101 Z',
        c.dragonEmeraldLit,
        { strokeWidth: s.xeroxFine }
      ),
      // Main sculpted dragon snout & head facing RIGHT (+X) with flat 2-tone cel planes
      celShadedShape({
        d: snoutHeadD,
        baseFill: c.dragonEmerald,
        shadowFill: c.dragonEmeraldShadow,
        shadowPaths: [
          'M -20 -95 C 4 -90, 32 -90, 58 -94 L 58 -78 L -20 -80 Z',
        ],
        highlightFill: c.dragonEmeraldLit,
        highlightPaths: [
          'M -12 -124 C 8 -128, 30 -122, 50 -112 C 34 -116, 12 -118, -14 -114 Z',
        ],
        highlightOpacity: 0.72,
        clipId: headClipId,
        strokeWidth: s.xeroxHeavy,
      }),
      // Nostril & little classic Disney snout bridge crease
      svgEl('ellipse', {
        cx: 48.5,
        cy: -104.5,
        rx: 2.8,
        ry: 2.1,
        transform: 'rotate(-16 48.5 -104.5)',
        fill: c.xeroxInk,
      }),
      xeroxSketchStroke('M 33 -113 Q 42 -113, 50 -110', {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
      }),
      // Soft flat matte rosy storybook cheek
      svgEl('ellipse', {
        cx: 15,
        cy: -98.5,
        rx: 5.8,
        ry: 3.6,
        fill: c.dustyRose,
        opacity: 0.56,
      }),
      // Expressive Disney eye & brow
      eyeMarkup,
      // Mouth (roaring + sore tooth, healed grin, or 4-stage speaking lip-sync)
      mouthMarkup,
    ]
  );

  // 6. Upward-Forward 3-Tone Flat-Cel Flame Puff when `'waving'` (`data-part="dragon-breath"`, x: 54..108, y: -92..-128)
  const fireBreath = isWaving
    ? svgEl('g', { 'data-part': 'dragon-breath' }, [
        // Outer crimson flat cel flame tongue
        celPath(
          `M 54 -96 C 68 -116, 92 -128, ${round2(106.5 + flameBoil * 0.6)} ${round2(-117 + flameBoil * 0.5)} C 102 -101, 79 -94, 54 -92 Z`,
          c.flameCrimson,
          { strokeWidth: s.xeroxMedium }
        ),
        // Mid orange flat cel flame tongue
        celPath(
          `M 58 -96 C 70 -112, 89 -122, ${round2(101 + flameBoil * 0.5)} ${round2(-114 + flameBoil * 0.4)} C 96 -102, 77 -96, 58 -93 Z`,
          c.flameOrange,
          { strokeWidth: s.xeroxFine }
        ),
        // Inner pale-gold cel flame core (flat opaque paint, ZERO gradients!)
        svgEl('path', {
          d: `M 62 -95.5 C 72 -107, 86 -115, ${round2(94.5 + flameBoil * 0.4)} ${round2(-110.5 + flameBoil * 0.3)} C 89 -102, 76 -96.5, 62 -94 Z`,
          fill: c.flameCore,
          stroke: 'none',
        }),
        // Hand-inked kinetic flame curls & tiny cel ember flecks
        xeroxSketchStroke(
          `M 88 -124 Q 96 -127, 102 -124 M 76 -118 Q 82 -121, 88 -120`,
          { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.8 }
        ),
        celPath(
          'M 98 -125 L 101 -127 L 103 -124 Z M 104 -108 L 107 -109 L 106 -105 Z',
          c.flameCore,
          { strokeWidth: 0.8 }
        ),
      ])
    : '';

  // 7. Circling Antique-Gold Dizzy Relief Stars when Tamed (`data-part="dizzy-stars"`)
  const starOrbitPhase = steppedOscillate(frameIndex, 12, 4);
  const dizzyStars = isTamed
    ? svgEl('g', { 'data-part': 'dizzy-stars' }, [
        svgEl('ellipse', {
          cx: 12,
          cy: -136,
          rx: 25,
          ry: 6.5,
          fill: 'none',
          stroke: c.antiqueGold,
          'stroke-width': 1.6,
          'stroke-dasharray': '4 3.5',
          opacity: 0.9,
        }),
        celPath(
          renderStarShape(round2(-12 + starOrbitPhase * 0.6), -136, 6.8, drawStep * 18),
          c.sunGoldCore,
          { strokeWidth: s.xeroxFine }
        ),
        celPath(
          renderStarShape(round2(14 - starOrbitPhase * 0.5), -141.5, 7.6, -drawStep * 18),
          c.antiqueGold,
          { strokeWidth: s.xeroxFine }
        ),
        celPath(
          renderStarShape(round2(36 + starOrbitPhase * 0.4), -135, 6.2, drawStep * 14),
          c.parchmentCream,
          { strokeWidth: s.xeroxFine }
        ),
        // Tiny hand-inked cross sparkle ticks
        xeroxSketchStroke(
          'M 2 -142 L 2 -138 M 0 -140 L 4 -140 M 26 -140 L 26 -136 M 24 -138 L 28 -138',
          { stroke: c.starGlow, strokeWidth: 0.9, opacity: 0.88 }
        ),
      ])
    : '';

  return svgEl(
    'g',
    {
      'data-character': 'dragon',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': 'right',
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      // Grounded soft contact shadow at y = 0
      celContactShadow(0, 0.5, shadowRx, 4.2, 0.34),
      // Animated flat-cel dragon rig with 12 FPS squash-and-stretch
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: bodyBob,
            scaleX: bodyScaleX,
            scaleY: bodyScaleY,
          }),
        },
        [tail, wings, legs, body, head, fireBreath, dizzyStars]
      ),
    ]
  );
}

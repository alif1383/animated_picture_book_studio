import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import { isSteppedBlinkFrame, steppedOscillate } from '../../engine/clock';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { CharacterRenderOptions } from './types';

type BandanaDogRenderOptions = CharacterRenderOptions & {
  isSpeaking?: boolean;
};

interface HeadOptions {
  x: number;
  y: number;
  tilt: number;
  earBounce: number;
  frameIndex: number;
  isSpeaking: boolean;
  isSinging: boolean;
  isWaving: boolean;
  isCurious: boolean;
  isLookingUp: boolean;
  isGrumpy: boolean;
  isBlinking: boolean;
  fillMask?: string;
}

/**
 * Renders Biscuit's stepped 6 FPS animated mouth (or calm puppy smile when silent).
 * Driven by `frameIndex % 3` whenever `isSpeaking` is true so voiceover playback
 * produces lively, organic stop-motion lip-sync across every pose.
 */
function renderDogMouth(
  cx: number,
  cy: number,
  isSpeaking: boolean,
  isSinging: boolean,
  isWaving: boolean,
  isGrumpy: boolean,
  frameIndex: number
): string {
  const { charcoalOutline, cherryRose, watermelonPink, warmMoon } =
    TOKENS.colors;
  const { outlineThin } = TOKENS.strokes;

  if (isSpeaking) {
    const mouthStep = ((frameIndex % 3) + 3) % 3;

    // Frame 0: Wide joyful open bark/laugh mouth with rosy tongue & optional bark sparkles
    if (mouthStep === 0) {
      return svgEl('g', { 'data-part': 'mouth', 'data-mouth-step': 'open' }, [
        // Philtrum tick from nose
        svgEl('line', {
          x1: round2(cx + 0.5),
          y1: round2(cy - 3.2),
          x2: round2(cx + 0.5),
          y2: round2(cy - 0.8),
          ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
        }),
        // Open dark mouth interior
        crayonPath(
          `M ${round2(cx - 5.2)} ${round2(cy - 0.8)} Q ${round2(cx + 0.6)} ${round2(cy + 0.6)}, ${round2(cx + 6.2)} ${round2(cy - 1.1)} C ${round2(cx + 5.8)} ${round2(cy + 7.4)}, ${round2(cx - 4.4)} ${round2(cy + 7.4)}, ${round2(cx - 5.2)} ${round2(cy - 0.8)} Z`,
          charcoalOutline,
          { strokeWidth: outlineThin }
        ),
        // Joyful rosy-pink tongue poking out
        crayonPath(
          `M ${round2(cx - 2.6)} ${round2(cy + 2.4)} C ${round2(cx - 2.8)} ${round2(cy + 9.2)}, ${round2(cx + 4.2)} ${round2(cy + 9.2)}, ${round2(cx + 4.0)} ${round2(cy + 2.2)} Q ${round2(cx + 0.7)} ${round2(cy + 3.6)}, ${round2(cx - 2.6)} ${round2(cy + 2.4)} Z`,
          cherryRose,
          { strokeWidth: 1.4 }
        ),
        // Tongue center crease
        svgEl('path', {
          d: `M ${round2(cx + 0.7)} ${round2(cy + 3.4)} L ${round2(cx + 0.7)} ${round2(cy + 7.1)}`,
          fill: 'none',
          stroke: watermelonPink,
          'stroke-width': 1.3,
          'stroke-linecap': 'round',
        }),
        // Subtle happy bark energy ticks when singing
        isSinging
          ? svgEl('path', {
              d: `M ${round2(cx + 13.5)} ${round2(cy - 6)} L ${round2(cx + 17.5)} ${round2(cy - 8.5)} M ${round2(cx + 14.5)} ${round2(cy - 0.5)} L ${round2(cx + 18.8)} ${round2(cy - 0.5)} M ${round2(cx + 13.2)} ${round2(cy + 4.5)} L ${round2(cx + 16.8)} ${round2(cy + 6.5)}`,
              fill: 'none',
              stroke: warmMoon,
              'stroke-width': 2.0,
              'stroke-linecap': 'round',
            })
          : '',
      ]);
    }

    // Frame 1: Half-open oval chatting mouth with cute tongue peek
    if (mouthStep === 1) {
      return svgEl(
        'g',
        { 'data-part': 'mouth', 'data-mouth-step': 'half-open' },
        [
          svgEl('line', {
            x1: round2(cx + 0.5),
            y1: round2(cy - 3.2),
            x2: round2(cx + 0.5),
            y2: round2(cy - 0.6),
            ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
          }),
          crayonPath(
            `M ${round2(cx - 3.6)} ${round2(cy - 0.2)} C ${round2(cx - 3.4)} ${round2(cy + 5.1)}, ${round2(cx + 4.6)} ${round2(cy + 5.1)}, ${round2(cx + 4.8)} ${round2(cy - 0.4)} Q ${round2(cx + 0.6)} ${round2(cy + 1.0)}, ${round2(cx - 3.6)} ${round2(cy - 0.2)} Z`,
            charcoalOutline,
            { strokeWidth: outlineThin }
          ),
          svgEl('ellipse', {
            cx: round2(cx + 0.7),
            cy: round2(cy + 3.2),
            rx: 2.3,
            ry: 1.7,
            fill: cherryRose,
          }),
        ]
      );
    }

    // Frame 2: Closed curved happy puppy smile
    return svgEl('g', { 'data-part': 'mouth', 'data-mouth-step': 'closed' }, [
      svgEl('path', {
        d: `M ${round2(cx + 0.5)} ${round2(cy - 3.2)} L ${round2(cx + 0.5)} ${round2(cy - 0.4)} M ${round2(cx - 4.6)} ${round2(cy - 0.2)} Q ${round2(cx - 2)} ${round2(cy + 2.6)}, ${round2(cx + 0.5)} ${round2(cy - 0.4)} Q ${round2(cx + 3.2)} ${round2(cy + 2.6)}, ${round2(cx + 5.8)} ${round2(cy - 0.4)}`,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  }

  // Non-speaking mouths
  if (isGrumpy) {
    return svgEl('g', { 'data-part': 'mouth', 'data-mouth-step': 'grumpy' }, [
      svgEl('path', {
        d: `M ${round2(cx + 0.5)} ${round2(cy - 3.0)} L ${round2(cx + 0.5)} ${round2(cy - 0.8)} M ${round2(cx - 3.8)} ${round2(cy + 2.2)} Q ${round2(cx + 0.5)} ${round2(cy - 0.4)}, ${round2(cx + 4.8)} ${round2(cy + 2.0)}`,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  }

  if (isWaving) {
    // Excited happy puppy smile with cute small pink tongue peek
    return svgEl('g', { 'data-part': 'mouth', 'data-mouth-step': 'pant' }, [
      crayonPath(
        `M ${round2(cx - 2.1)} ${round2(cy + 0.6)} C ${round2(cx - 2.2)} ${round2(cy + 5.8)}, ${round2(cx + 3.2)} ${round2(cy + 5.8)}, ${round2(cx + 3.1)} ${round2(cy + 0.5)} Z`,
        cherryRose,
        { strokeWidth: 1.4 }
      ),
      svgEl('path', {
        d: `M ${round2(cx + 0.5)} ${round2(cy - 3.2)} L ${round2(cx + 0.5)} ${round2(cy - 0.4)} M ${round2(cx - 4.8)} ${round2(cy - 0.4)} Q ${round2(cx - 2)} ${round2(cy + 2.6)}, ${round2(cx + 0.5)} ${round2(cy - 0.4)} Q ${round2(cx + 3.2)} ${round2(cy + 2.6)}, ${round2(cx + 5.8)} ${round2(cy - 0.6)}`,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
      }),
    ]);
  }

  // Calm closed happy puppy W-smile
  return svgEl('g', { 'data-part': 'mouth', 'data-mouth-step': 'calm' }, [
    svgEl('path', {
      d: `M ${round2(cx + 0.5)} ${round2(cy - 3.2)} L ${round2(cx + 0.5)} ${round2(cy - 0.5)} M ${round2(cx - 4.4)} ${round2(cy - 0.3)} Q ${round2(cx - 1.9)} ${round2(cy + 2.3)}, ${round2(cx + 0.5)} ${round2(cy - 0.5)} Q ${round2(cx + 3.0)} ${round2(cy + 2.3)}, ${round2(cx + 5.5)} ${round2(cy - 0.5)}`,
      fill: 'none',
      ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
    }),
  ]);
}

/**
 * Renders Biscuit's signature shaggy Goldendoodle head (3/4 right-facing `+X`)
 * with tufted crown, two warm floppy ears, fluffy golden muzzle, bright charcoal eyes,
 * rosy cheeks, and stepped 6 FPS animated mouth.
 */
function renderDogHead(opts: HeadOptions): string {
  const {
    x,
    y,
    tilt,
    earBounce,
    frameIndex,
    isSpeaking,
    isSinging,
    isWaving,
    isCurious,
    isLookingUp,
    isGrumpy,
    isBlinking,
    fillMask,
  } = opts;

  const { charcoalOutline, paperWarm, ochreLight, cherryRose } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const furFill = getPatternFill('crayonOchre');
  const earFill = getPatternFill('crayonSunsetOrange');

  // Subtle hand-drawn line-boil jitter on crown tufts and ear ends
  const jCrownX = round2(deterministicJitter(1, frameIndex, 0.8));
  const jCrownY = round2(deterministicJitter(2, frameIndex, 0.7));
  const jEarL = round2(deterministicJitter(3, frameIndex, 1.0));
  const jEarR = round2(deterministicJitter(4, frameIndex, 0.9));

  const eyeShiftY = isLookingUp ? -1.2 : 0;
  const eyeRy = isCurious ? 3.1 : 2.7;

  return svgEl(
    'g',
    {
      'data-part': 'head',
      transform: svgTransform({
        x,
        y,
        rotate: tilt,
        pivotX: 0,
        pivotY: 12,
      }),
    },
    [
      // Far right floppy ear (behind muzzle side, `+X`)
      svgEl(
        'g',
        {
          'data-part': 'right-ear',
          transform: svgTransform({
            rotate: round2(-earBounce * 0.75 + jEarR * 2),
            pivotX: 11,
            pivotY: -10,
          }),
        },
        [
          crayonPath(
            'M 9 -13 C 15 -14, 21 -8, 22 -1 C 23 4, 21 9, 17 11 C 15 12, 13 9, 11 10 C 9 7, 9 -4, 9 -13 Z',
            earFill,
            { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
          ),
          // Charcoal fur-tuft lines on far ear
          svgEl('path', {
            d: 'M 15 -6 Q 17.5 -1, 16.5 4 M 18.5 -3 Q 20 2, 18.5 7',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.3 }),
          }),
        ]
      ),

      // Main shaggy Goldendoodle head with tufted crown & fluffy cheeks
      crayonPath(
        `M -14 -8 C -17 -14, -12 -18, -7 -16 L ${round2(-4 + jCrownX * 0.5)} ${round2(-19.8 + jCrownY)} L 0 -17 L ${round2(4 + jCrownX)} ${round2(-20.2 - jCrownY * 0.6)} L 7 -16.5 C 12 -18, 17 -13, 16 -7 C 19 -3, 19 4, 15 9 C 12 13, 4 14, -2 13 C -9 14, -15 10, -16 4 C -19 0, -17 -5, -14 -8 Z`,
        furFill,
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),

      // Soft warm tuft squiggles on forehead & cheeks
      svgEl('path', {
        d: 'M -8 -12 Q -5 -15, -2 -12 M 3 -13 Q 6 -15.5, 9 -12.5 M -12 4 Q -10 7, -7 5',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
      }),

      // Near left floppy shaggy ear (prominent on `-X` side)
      svgEl(
        'g',
        {
          'data-part': 'left-ear',
          transform: svgTransform({
            rotate: round2(earBounce + jEarL * 2.5),
            pivotX: -12,
            pivotY: -10,
          }),
        },
        [
          crayonPath(
            'M -10 -12 C -17 -13, -23 -6, -24 2 C -25 7, -22 12, -18 14 C -16 12, -14 14, -12 11 C -9 7, -8 -4, -10 -12 Z',
            earFill,
            { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
          ),
          // Feathered shaggy fur strokes on near ear
          svgEl('path', {
            d: 'M -17 -6 Q -20 0, -18.5 7 M -14 -3 Q -16 3, -14.5 9 M -20 4 Q -21 8, -19.5 11',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.35 }),
          }),
        ]
      ),

      // Fluffy lighter-golden teddy-bear muzzle shifted 3/4 right (`+X`)
      crayonPath(
        'M -2 -2 C 0 -7, 13 -7, 16 -2 C 19 1, 18 7, 13 9 C 9 12, 2 11, -1 8 C -4 6, -4 1, -2 -2 Z',
        ochreLight,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      // Shaggy muzzle beard ticks
      svgEl('path', {
        d: 'M 1 9.5 Q 3 11.5, 5 10 M 9.5 10 Q 11.5 11.2, 13 9.2',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.3 }),
      }),

      // Warm rosy cheek blush
      svgEl('ellipse', {
        cx: -5.2,
        cy: 1.8,
        rx: 3.5,
        ry: 2.3,
        fill: cherryRose,
        opacity: 0.42,
      }),
      svgEl('ellipse', {
        cx: 15.2,
        cy: 1.4,
        rx: 2.5,
        ry: 1.9,
        fill: cherryRose,
        opacity: 0.36,
      }),

      // Expressive eyebrow tufts (angled if grumpy, perked if curious)
      isGrumpy
        ? svgEl('path', {
            d: 'M -5 -10.5 L 1.5 -8.8 M 14.5 -10.5 L 8.5 -8.8',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.8 }),
          })
        : svgEl('path', {
            d: isCurious
              ? 'M -4.8 -11.5 Q -1.5 -13.8, 1.5 -11.2 M 8.8 -11.5 Q 11.5 -13.8, 14.2 -11.0'
              : 'M -4.5 -10.2 Q -1.5 -12.0, 1.2 -10.2 M 9.0 -10.2 Q 11.4 -12.0, 13.8 -10.0',
            fill: 'none',
            ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
          }),

      // Expressive Eyes: happy closed smile arcs when blinking, or glossy dark charcoal eyes with warm cream rims & sparkles
      isBlinking
        ? svgEl('g', { 'data-part': 'eyes', 'data-eyes': 'closed' }, [
            svgEl('path', {
              d: 'M -4.2 -5.8 Q -1.2 -9.0, 1.8 -5.8 M 8.6 -5.8 Q 11.4 -9.0, 14.2 -5.8',
              fill: 'none',
              ...crayonStrokeAttrs({ strokeWidth: outlineMedium }),
            }),
          ])
        : svgEl('g', { 'data-part': 'eyes', 'data-eyes': 'open' }, [
            // Soft warm paper-cream eye rim rings
            svgEl('ellipse', {
              cx: -1.2,
              cy: round2(-6.2 + eyeShiftY),
              rx: 3.2,
              ry: round2(eyeRy + 0.6),
              fill: paperWarm,
              ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
            }),
            svgEl('ellipse', {
              cx: 11.4,
              cy: round2(-6.2 + eyeShiftY),
              rx: 2.9,
              ry: round2(eyeRy + 0.5),
              fill: paperWarm,
              ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
            }),
            // Shiny dark charcoal puppy irises
            svgEl('ellipse', {
              cx: -0.6,
              cy: round2(-6.1 + eyeShiftY),
              rx: 2.3,
              ry: eyeRy,
              fill: charcoalOutline,
            }),
            svgEl('ellipse', {
              cx: 11.9,
              cy: round2(-6.1 + eyeShiftY),
              rx: 2.1,
              ry: round2(eyeRy - 0.1),
              fill: charcoalOutline,
            }),
            // Warm catchlight sparkles
            svgEl('circle', {
              cx: 0.2,
              cy: round2(-7.2 + eyeShiftY),
              r: 0.95,
              fill: paperWarm,
            }),
            svgEl('circle', {
              cx: 12.6,
              cy: round2(-7.2 + eyeShiftY),
              r: 0.9,
              fill: paperWarm,
            }),
          ]),

      // Cute rounded dark button nose with tiny shine highlight
      svgEl('g', { 'data-part': 'nose' }, [
        crayonPath(
          'M 4.4 -3.2 C 6.2 -4.4, 9.8 -4.4, 11.4 -3.1 C 12.4 -2.2, 11.4 0.4, 8.0 0.8 C 4.8 0.5, 3.6 -2.0, 4.4 -3.2 Z',
          charcoalOutline,
          { strokeWidth: 1.4 }
        ),
        svgEl('ellipse', {
          cx: 7.2,
          cy: -2.6,
          rx: 1.4,
          ry: 0.75,
          fill: paperWarm,
          opacity: 0.85,
        }),
      ]),

      // Stepped 6 FPS Animated Mouth
      renderDogMouth(
        7.5,
        4.1,
        isSpeaking,
        isSinging,
        isWaving,
        isGrumpy,
        frameIndex
      ),
    ]
  );
}

/**
 * Renders Biscuit's signature crimson-red triangular bandana with subtle fold lines
 * and cute knotted red tie tail fluttering to the side.
 */
function renderRedBandana(
  tx: number,
  ty: number,
  scaleX: number,
  tieFlutter: number,
  fillMask?: string
): string {
  const { terracottaDark } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const redFill = getPatternFill('crayonRadishRed');

  return svgEl(
    'g',
    {
      'data-part': 'red-bandana',
      transform: svgTransform({ x: tx, y: ty, scaleX, scaleY: 1 }),
    },
    [
      // Knotted red tie tail sticking out behind-left of neck (matching photo!)
      crayonPath(
        `M -11 -4 C -17 ${round2(-8 + tieFlutter)}, -23 ${round2(-6 + tieFlutter)}, -25 ${round2(-2 + tieFlutter)} C -20 ${round2(-1 + tieFlutter * 0.5)}, -15 0, -10 1 Z`,
        redFill,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      // Small bandana knot bun
      crayonPath(
        'M -12 -5 C -9 -6, -7 -2, -9 1 C -12 2, -14 -2, -12 -5 Z',
        redFill,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      // Main folded triangular crimson bandana draped across neck & upper chest
      crayonPath(
        'M -11 -4 C -2 -1, 8 -2, 15 -6 C 17 -2, 15 7, 8 16 C 3 13, -6 7, -11 -4 Z',
        redFill,
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Darker crimson fabric fold creases
      svgEl('path', {
        d: 'M -8 -2 Q 3 3, 13 -3 M -4 3 Q 4 8, 11 4',
        fill: 'none',
        stroke: terracottaDark,
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
      }),
    ]
  );
}

/**
 * Renders a single shaggy golden-apricot puppy leg with a rounded right-pointing (`+X`) paw
 * and signature cream-white toe tips (`TOKENS.colors.cloudWhite`).
 */
function renderPuppyLeg(opts: {
  partName: string;
  pivotX: number;
  pivotY: number;
  rotate?: number;
  length: number;
  width?: number;
  fillMask?: string;
}): string {
  const {
    partName,
    pivotX,
    pivotY,
    rotate = 0,
    length,
    width = 9.5,
    fillMask,
  } = opts;
  const { cloudWhite } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;
  const furFill = getPatternFill('crayonOchre');
  const halfW = round2(width / 2);
  const footY = round2(pivotY + length);

  return svgEl(
    'g',
    {
      'data-part': partName,
      transform: svgTransform({ rotate, pivotX, pivotY }),
    },
    [
      // Shaggy fur leg column curving smoothly into right-pointing (+X) paw
      crayonPath(
        `M ${round2(pivotX - halfW)} ${round2(pivotY)} L ${round2(pivotX + halfW)} ${round2(pivotY)} C ${round2(pivotX + halfW + 1.4)} ${round2(pivotY + length * 0.45)}, ${round2(pivotX + halfW + 0.5)} ${round2(footY - 5)}, ${round2(pivotX + halfW + 3.8)} ${round2(footY - 3.2)} C ${round2(pivotX + halfW + 5.2)} ${round2(footY - 1.2)}, ${round2(pivotX + halfW + 4.2)} ${round2(footY)}, ${round2(pivotX + halfW + 1.8)} ${round2(footY)} L ${round2(pivotX - halfW + 0.5)} ${round2(footY)} C ${round2(pivotX - halfW - 1.4)} ${round2(footY)}, ${round2(pivotX - halfW - 1.4)} ${round2(footY - 4)}, ${round2(pivotX - halfW - 0.8)} ${round2(pivotY + length * 0.5)} Z`,
        furFill,
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Shaggy leg fur-tuft tick
      svgEl('path', {
        d: `M ${round2(pivotX - halfW * 0.3)} ${round2(pivotY + length * 0.45)} Q ${round2(pivotX + halfW * 0.25)} ${round2(pivotY + length * 0.54)}, ${round2(pivotX - halfW * 0.15)} ${round2(pivotY + length * 0.65)}`,
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.25 }),
      }),
      // White paw toe tips pointing right (+X)
      crayonPath(
        `M ${round2(pivotX + halfW - 0.5)} ${round2(footY - 3.6)} C ${round2(pivotX + halfW + 3.8)} ${round2(footY - 3.6)}, ${round2(pivotX + halfW + 5.0)} ${round2(footY - 1.4)}, ${round2(pivotX + halfW + 2.6)} ${round2(footY)} L ${round2(pivotX + halfW - 1.0)} ${round2(footY)} Z`,
        cloudWhite,
        { strokeWidth: outlineThin }
      ),
      // Little toe divider tick
      svgEl('line', {
        x1: round2(pivotX + halfW + 1.8),
        y1: round2(footY - 2.4),
        x2: round2(pivotX + halfW + 2.1),
        y2: round2(footY - 0.2),
        ...crayonStrokeAttrs({ strokeWidth: 1.2 }),
      }),
    ]
  );
}

/**
 * Renders the photo-modeled Golden-Apricot Goldendoodle Puppy (`'bandana_dog'` — Biscuit)
 * in the Picture-Book Studio hand-drawn wax-crayon aesthetic:
 * - Shaggy golden-apricot Goldendoodle silhouette (`crayonOchre`) with warmer feathered ears
 *   & wagging tail tip (`crayonSunsetOrange`) and charcoal fur-tuft squiggles
 * - Signature crimson-red triangular bandana (`crayonRadishRed`) with `terracottaDark` folds
 *   and knotted red tie tail
 * - Fluffy white chest patch (`paperWarm` / `cloudWhite`) peeking out below the bandana
 * - Cream-white paw tips (`cloudWhite`), glossy dark eyes, cute nose, rosy cheeks, & pink tongue
 * - Canonical `+X` forward facing (`flipX: false` = facing RIGHT) with dedicated 3/4 walking profile
 * - Stepped 6 FPS animated speaking mouth across ALL states when `state === 'singing'` or `isSpeaking`
 *
 * Local coordinate system: ground feet at `y = 0`, centered horizontally at `x = 0`.
 * Local SVG bounds: `x: -48..48`, `y: -86..2` (`width: 96`, `height: 88`).
 */
export function renderBandanaDog(options: CharacterRenderOptions): string {
  const opts = options as BandanaDogRenderOptions;
  const { state = 'idle', frameIndex = 0, fillMask } = opts;

  const isSpeaking = state === 'singing' || Boolean(opts.isSpeaking);
  const {
    charcoalOutline,
    paperWarm,
    cloudWhite,
    ochreLight,
    terracottaDark,
  } = TOKENS.colors;
  const { outlineMedium, outlineThin } = TOKENS.strokes;

  const furFill = getPatternFill('crayonOchre');
  const warmAccentFill = getPatternFill('crayonSunsetOrange');
  const redBandanaFill = getPatternFill('crayonRadishRed');

  const jTailX = round2(deterministicJitter(10, frameIndex, 1.2));
  const jTailY = round2(deterministicJitter(11, frameIndex, 1.0));
  const jBodyY = round2(deterministicJitter(12, frameIndex, 0.6));

  // ---------------------------------------------------------------------------
  // 1. SLEEPING / SLEEPY: Cozy Curled Nap Pose
  // ---------------------------------------------------------------------------
  if (state === 'sleeping' || state === 'sleepy') {
    const zFloat = round2(steppedOscillate(frameIndex, 8, 2.2));
    const breathe = round2(steppedOscillate(frameIndex, 10, 0.9));

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-state': state,
        'data-facing': 'right',
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Curled shaggy golden-apricot puppy body
        crayonPath(
          `M -30 -4 C -34 -22, -16 ${round2(-35 - breathe)}, 4 ${round2(-33 - breathe)} C 20 ${round2(-31 - breathe)}, 28 -18, 24 -4 C 21 1, -24 2, -30 -4 Z`,
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Fur curl squiggles along sleeping back
        svgEl('path', {
          d: 'M -20 -20 Q -14 -25, -8 -20 M -4 -23 Q 2 -27, 8 -22 M -16 -10 Q -10 -14, -4 -10',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
        }),
        // Fluffy white chest tuft tucked near neck
        crayonPath(
          'M 4 -14 C 9 -18, 16 -14, 15 -4 C 11 -2, 5 -4, 4 -14 Z',
          paperWarm,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Crimson red bandana draped neatly around sleeping neck
        crayonPath(
          'M -2 -22 C 6 -20, 14 -21, 18 -24 C 18 -16, 13 -10, 6 -8 C 2 -12, -2 -16, -2 -22 Z',
          redBandanaFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        svgEl('path', {
          d: 'M 1 -18 Q 8 -14, 15 -18',
          fill: 'none',
          stroke: terracottaDark,
          'stroke-width': 1.6,
          'stroke-linecap': 'round',
        }),
        // Shaggy tail curled cozily around left/front with warmer tip
        crayonPath(
          `M -28 -5 C -37 -8, -40 -19, ${round2(-31 + jTailX * 0.4)} -20 C -26 -20, -24 -12, -14 -6 C -10 -3, -18 1, -28 -5 Z`,
          warmAccentFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Front paws tucked underneath chin with white toe tips
        crayonPath(
          'M 10 -6 L 28 -6 C 34 -6, 35 0, 29 0 L 10 0 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        crayonPath(
          'M 25 -5.5 C 31 -5.5, 34 -2.5, 31 0 L 24 0 Z',
          cloudWhite,
          { strokeWidth: outlineThin }
        ),
        // Sleeping shaggy head resting peacefully on front paws
        crayonPath(
          'M 3 -20 C 3 -31, 14 -34, 24 -30 C 32 -27, 36 -17, 32 -9 C 28 -4, 12 -4, 6 -9 C 2 -13, 2 -17, 3 -20 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Lighter golden sleeping muzzle
        crayonPath(
          'M 18 -17 C 24 -20, 34 -18, 34 -12 C 34 -7, 24 -6, 18 -9 Z',
          ochreLight,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        // Floppy warm shaggy ear draped softly along sleeping cheek
        crayonPath(
          'M 10 -28 C 3 -26, -1 -16, 2 -8 C 6 -6, 12 -9, 13 -16 C 14 -22, 13 -26, 10 -28 Z',
          warmAccentFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Closed peaceful sleeping eye arcs
        svgEl('path', {
          d: 'M 15 -20 Q 18.5 -17.5, 22 -20 M 25 -19.5 Q 27.8 -17.5, 30.2 -19.5',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: outlineThin }),
        }),
        // Cute sleeping button nose & gentle smile
        svgEl('ellipse', {
          cx: 28.5,
          cy: -14.5,
          rx: 3.1,
          ry: 2.2,
          fill: charcoalOutline,
        }),
        svgEl('path', {
          d: 'M 22 -11 Q 26 -9, 30 -11.5',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.5 }),
        }),
        // Floating hand-lettered 'z Z' nap marks
        svgEl(
          'text',
          {
            x: 24,
            y: round2(-34 + zFloat),
            'font-family': TOKENS.typography.fontFamilyHand,
            'font-size': 12,
            'font-weight': 'bold',
            fill: charcoalOutline,
          },
          'z Z'
        ),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SITTING: Faithful Iconic Photo Pose (3/4 right-facing `+X`)
  // ---------------------------------------------------------------------------
  if (state === 'sitting') {
    const tailWag = steppedOscillate(frameIndex, 6, 11);
    const headBob = steppedOscillate(frameIndex, 10, 2.2);
    const earBounce = steppedOscillate(frameIndex, 6, 3.5);
    const tieFlutter = steppedOscillate(frameIndex, 6, 1.5);
    const blink = isSteppedBlinkFrame(frameIndex, 16, 1);

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-state': 'sitting',
        'data-facing': 'right',
        transform: svgTransform({ y: jBodyY }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Shaggy wagging tail curling out behind on the left (`-X`), just like the photo!
        svgEl(
          'g',
          {
            'data-part': 'tail',
            transform: svgTransform({
              rotate: tailWag,
              pivotX: -22,
              pivotY: -10,
            }),
          },
          [
            crayonPath(
              `M -21 -12 C -31 -11, -40 -17, ${round2(-45 + jTailX)} ${round2(-26 + jTailY)} C ${round2(-42 + jTailX)} ${round2(-30 + jTailY)}, -34 -24, -29 -19 C -26 -16, -21 -16, -19 -13 Z`,
              furFill,
              { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
            ),
            // Warmer feathered tail tip
            crayonPath(
              `M -36 -18 C -41 -21, ${round2(-45 + jTailX)} ${round2(-26 + jTailY)}, ${round2(-42 + jTailX)} ${round2(-29 + jTailY)} C -38 -27, -35 -23, -33 -19 Z`,
              warmAccentFill,
              { strokeWidth: outlineThin, mask: fillMask }
            ),
          ]
        ),

        // Tucked hind haunch on the left (`-X`) with hind white-tipped paw peeking forward
        crayonPath(
          'M -25 -14 C -28 -27, -18 -38, -6 -36 C -2 -26, -4 -10, -10 -3 C -18 -1, -24 -5, -25 -14 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        crayonPath(
          'M -16 -6 L -4 -6 C 1 -6, 2 0, -3 0 L -15 0 C -18 0, -18 -6, -16 -6 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        crayonPath(
          'M -6 -5.5 C 0 -5.5, 2 -2.2, -1.5 0 L -6 0 Z',
          cloudWhite,
          { strokeWidth: outlineThin }
        ),

        // Proud seated shaggy torso
        crayonPath(
          'M -18 -24 C -20 -39, -8 -51, 8 -50 C 20 -49, 25 -36, 22 -20 C 19 -8, 12 -5, -6 -5 C -16 -5, -18 -14, -18 -24 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Shaggy fur-tuft squiggles along side & flank
        svgEl('path', {
          d: 'M -14 -24 Q -10 -29, -6 -24 M -12 -15 Q -7 -19, -3 -15 M -6 -34 Q -2 -38, 2 -34',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
        }),

        // Prominent Fluffy White Chest Blaze peeking right underneath the red bandana!
        crayonPath(
          'M 5 -39 C 13 -41, 21 -35, 21 -25 C 20 -18, 16 -13, 12 -11 C 9 -14, 7 -19, 5 -24 C 3 -29, 3 -35, 5 -39 Z',
          paperWarm,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),
        svgEl('path', {
          d: 'M 9 -32 Q 13 -28, 11 -22 M 14 -30 Q 17 -25, 15 -19',
          fill: 'none',
          stroke: cloudWhite,
          'stroke-width': 2.0,
          'stroke-linecap': 'round',
        }),

        // Far right straight front leg planted neatly at y = 0
        renderPuppyLeg({
          partName: 'front-far-leg',
          pivotX: 19,
          pivotY: -26,
          rotate: -3,
          length: 26,
          width: 8.8,
          fillMask,
        }),

        // Near front leg planted cleanly at y = 0 (photo foreground leg)
        renderPuppyLeg({
          partName: 'front-near-leg',
          pivotX: 6,
          pivotY: -27,
          rotate: 2,
          length: 27,
          width: 9.5,
          fillMask,
        }),

        // Signature Crimson Red Bandana draped prominently across upper chest + knotted tie!
        renderRedBandana(9, -43, 1.05, tieFlutter, fillMask),

        // Shaggy Goldendoodle Head
        renderDogHead({
          x: 9,
          y: -63,
          tilt: headBob,
          earBounce,
          frameIndex,
          isSpeaking,
          isSinging: false,
          isWaving: false,
          isCurious: false,
          isLookingUp: false,
          isGrumpy: false,
          isBlinking: blink,
          fillMask,
        }),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // 3. WALKING: Dedicated 3/4 Joyful Puppy Trot/Bound Facing RIGHT (`+X`)
  // ---------------------------------------------------------------------------
  if (state === 'walking') {
    const legStride = steppedOscillate(frameIndex, 4, 24);
    const bodyBob = round2(Math.abs(steppedOscillate(frameIndex, 4, 3.0)));
    const earBounce = steppedOscillate(frameIndex, 4, 11);
    const tailWag = steppedOscillate(frameIndex, 4, 16);
    const tieFlutter = steppedOscillate(frameIndex, 4, 2.8);
    const blink = isSteppedBlinkFrame(frameIndex, 16, 1);

    return svgEl(
      'g',
      {
        'data-character': 'bandana_dog',
        'data-state': 'walking',
        'data-facing': 'right',
        'data-walk-profile': 'true',
        transform: svgTransform({ y: -bodyBob }),
        filter: svgUrl(TOKENS.filters.ids.crayonStroke),
      },
      [
        // Streaming wagging shaggy tail behind on the left (`-X`)
        svgEl(
          'g',
          {
            'data-part': 'tail',
            transform: svgTransform({
              rotate: tailWag,
              pivotX: -25,
              pivotY: -34,
            }),
          },
          [
            crayonPath(
              `M -24 -34 C -33 -37, -41 -44, ${round2(-46 + jTailX)} ${round2(-49 + jTailY)} C ${round2(-42 + jTailX)} ${round2(-53 + jTailY)}, -34 -46, -28 -41 C -25 -38, -22 -37, -21 -33 Z`,
              furFill,
              { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
            ),
            crayonPath(
              `M -37 -42 C -42 -45, ${round2(-46 + jTailX)} ${round2(-49 + jTailY)}, ${round2(-42 + jTailX)} ${round2(-52 + jTailY)} C -38 -49, -35 -46, -34 -42 Z`,
              warmAccentFill,
              { strokeWidth: outlineThin, mask: fillMask }
            ),
          ]
        ),

        // Back-far & front-far legs behind body (all paws pointing RIGHT `+X`)
        renderPuppyLeg({
          partName: 'back-far-leg',
          pivotX: -15,
          pivotY: -23,
          rotate: legStride,
          length: 23,
          width: 8.6,
          fillMask,
        }),
        renderPuppyLeg({
          partName: 'front-far-leg',
          pivotX: 16,
          pivotY: -24,
          rotate: -legStride,
          length: 24,
          width: 8.6,
          fillMask,
        }),

        // Energetic bounding 3/4 golden-apricot puppy torso
        crayonPath(
          'M -27 -30 C -29 -44, -14 -49, 4 -48 C 18 -47, 26 -40, 24 -27 C 22 -18, 12 -16, -6 -17 C -19 -17, -26 -21, -27 -30 Z',
          furFill,
          { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
        ),
        // Shaggy fur-tuft squiggles along bounding torso
        svgEl('path', {
          d: 'M -18 -36 Q -13 -41, -8 -36 M -4 -38 Q 1 -42, 6 -37 M -14 -26 Q -9 -30, -4 -26',
          fill: 'none',
          ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
        }),

        // Fluffy white chest blaze peeking underneath bandana on forward chest
        crayonPath(
          'M 10 -39 C 17 -39, 24 -34, 23 -25 C 21 -19, 15 -18, 11 -22 C 9 -27, 9 -34, 10 -39 Z',
          paperWarm,
          { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
        ),

        // Back-near & front-near legs in foreground (striding in opposition, toes pointing `+X`)
        renderPuppyLeg({
          partName: 'back-near-leg',
          pivotX: -20,
          pivotY: -22,
          rotate: -legStride,
          length: 22,
          width: 9.2,
          fillMask,
        }),
        renderPuppyLeg({
          partName: 'front-near-leg',
          pivotX: 11,
          pivotY: -23,
          rotate: legStride,
          length: 23,
          width: 9.2,
          fillMask,
        }),

        // Crimson red bandana & bouncing knotted tie tail
        renderRedBandana(14, -41, 0.98, tieFlutter, fillMask),

        // Joyful 3/4 right-facing head leaning slightly forward into the trot
        renderDogHead({
          x: 18,
          y: -59,
          tilt: round2(steppedOscillate(frameIndex, 4, 4) + 3),
          earBounce,
          frameIndex,
          isSpeaking,
          isSinging: false,
          isWaving: false,
          isCurious: false,
          isLookingUp: false,
          isGrumpy: false,
          isBlinking: blink,
          fillMask,
        }),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // 4. STANDING / IDLE / WAVING / SINGING / CURIOUS / BLINKING / OTHER STATES
  // ---------------------------------------------------------------------------
  const isWaving =
    state === 'waving' || state === 'reaching' || state === 'climbing';
  const isSinging = state === 'singing';
  const isCurious = state === 'curious' || state === 'awake';
  const isLookingUp = state === 'looking_up';
  const isGrumpy = state === 'grumpy';
  const isBlinking =
    state === 'blinking' || isSteppedBlinkFrame(frameIndex, 16, 1);

  const tailPeriod = isWaving || isSinging ? 3 : 6;
  const tailAmp = isWaving || isSinging ? 18 : 11;
  const tailWag = steppedOscillate(frameIndex, tailPeriod, tailAmp);

  const hopY = isWaving
    ? round2(Math.abs(steppedOscillate(frameIndex, 4, 2.5)) + 1.0)
    : isSinging
    ? round2(Math.abs(steppedOscillate(frameIndex, 4, 1.8)))
    : round2(steppedOscillate(frameIndex, 10, 0.9) + jBodyY);

  const headTilt = isCurious
    ? steppedOscillate(frameIndex, 8, 8)
    : isLookingUp
    ? -9
    : isSinging
    ? steppedOscillate(frameIndex, 4, 5) - 3
    : isWaving
    ? steppedOscillate(frameIndex, 4, 5)
    : steppedOscillate(frameIndex, 10, 2.2);

  const earBounce = isWaving || isSinging
    ? steppedOscillate(frameIndex, 4, 7)
    : isCurious
    ? -7
    : steppedOscillate(frameIndex, 8, 2.5);

  const tieFlutter = steppedOscillate(frameIndex, 6, isWaving ? 2.4 : 1.2);
  const wavePawAngle = -68 + steppedOscillate(frameIndex, 4, 15);

  return svgEl(
    'g',
    {
      'data-character': 'bandana_dog',
      'data-state': state,
      'data-facing': 'right',
      transform: svgTransform({ y: -hopY }),
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      // Happy wagging shaggy tail on the left (`-X`)
      svgEl(
        'g',
        {
          'data-part': 'tail',
          transform: svgTransform({
            rotate: tailWag,
            pivotX: -24,
            pivotY: -32,
          }),
        },
        [
          crayonPath(
            `M -23 -32 C -32 -34, -40 -40, ${round2(-45 + jTailX)} ${round2(-48 + jTailY)} C ${round2(-41 + jTailX)} ${round2(-52 + jTailY)}, -33 -45, -27 -39 C -24 -36, -21 -35, -20 -31 Z`,
            furFill,
            { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
          ),
          // Warmer apricot feathered tail tip
          crayonPath(
            `M -36 -41 C -41 -44, ${round2(-45 + jTailX)} ${round2(-48 + jTailY)}, ${round2(-41 + jTailX)} ${round2(-51 + jTailY)} C -37 -48, -34 -45, -33 -41 Z`,
            warmAccentFill,
            { strokeWidth: outlineThin, mask: fillMask }
          ),
        ]
      ),

      // Back-far & front-far legs behind body (toes pointing `+X`)
      renderPuppyLeg({
        partName: 'back-far-leg',
        pivotX: -14,
        pivotY: -24,
        rotate: isWaving ? 6 : 2,
        length: 24,
        width: 8.6,
        fillMask,
      }),
      renderPuppyLeg({
        partName: 'front-far-leg',
        pivotX: 16,
        pivotY: -25,
        rotate: isWaving ? -4 : -2,
        length: 25,
        width: 8.8,
        fillMask,
      }),

      // Shaggy standing golden-apricot puppy body (3/4 right-facing)
      crayonPath(
        'M -26 -29 C -28 -44, -13 -49, 4 -49 C 18 -49, 25 -40, 24 -26 C 22 -17, 12 -16, -6 -17 C -19 -17, -25 -20, -26 -29 Z',
        furFill,
        { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
      ),
      // Shaggy charcoal fur-tuft squiggles across body
      svgEl('path', {
        d: 'M -18 -36 Q -13 -41, -8 -36 M -5 -38 Q 0 -42, 5 -37 M -14 -25 Q -9 -29, -4 -25 M -2 -26 Q 2 -29, 6 -25',
        fill: 'none',
        ...crayonStrokeAttrs({ strokeWidth: 1.4 }),
      }),

      // Fluffy White Chest Blaze peeking out right underneath the red bandana!
      crayonPath(
        'M 9 -40 C 17 -41, 24 -34, 23 -24 C 21 -18, 15 -16, 10 -20 C 7 -25, 7 -34, 9 -40 Z',
        paperWarm,
        { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
      ),
      svgEl('path', {
        d: 'M 13 -33 Q 16 -29, 14 -23 M 17 -31 Q 19.5 -27, 18 -22',
        fill: 'none',
        stroke: cloudWhite,
        'stroke-width': 1.9,
        'stroke-linecap': 'round',
      }),

      // Back-near leg in foreground
      renderPuppyLeg({
        partName: 'back-near-leg',
        pivotX: -19,
        pivotY: -23,
        rotate: isWaving ? -4 : -2,
        length: 23,
        width: 9.2,
        fillMask,
      }),

      // Front-near leg: joyfully raised & waving when `isWaving`, otherwise planted neatly at y = 0!
      isWaving
        ? renderPuppyLeg({
            partName: 'front-near-leg',
            pivotX: 12,
            pivotY: -28,
            rotate: wavePawAngle,
            length: 24,
            width: 9.2,
            fillMask,
          })
        : renderPuppyLeg({
            partName: 'front-near-leg',
            pivotX: 10,
            pivotY: -24,
            rotate: 2,
            length: 24,
            width: 9.4,
            fillMask,
          }),

      // Signature Crimson Red Bandana + knotted tie tail
      renderRedBandana(12, -42, 1.0, tieFlutter, fillMask),

      // Expressive Shaggy Goldendoodle Head
      renderDogHead({
        x: 14,
        y: -61,
        tilt: headTilt,
        earBounce,
        frameIndex,
        isSpeaking,
        isSinging,
        isWaving,
        isCurious,
        isLookingUp,
        isGrumpy,
        isBlinking,
        fillMask,
      }),
    ]
  );
}

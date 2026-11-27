import { TOKENS, svgUrl } from '../../../theme/tokens';
import { isSteppedBlinkFrame, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { CharacterRenderOptions } from '../../characters/types';

function sanitizeIdPart(raw?: string): string {
  if (!raw) return 'cc-robin';
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean ? `cc-robin-${clean}` : 'cc-robin';
}

/**
 * Renders **Bramble** (`'snow_robin'`), plump adorable winter Snow Robin:
 * - Authentic 1970s–80s Disney Xerox flat-cel look (zero gradients, zero neon halos)
 * - Height `~42px`, feet contact `(0, 0)`, bounds `~x: -24..24, y: -44..4`, canonical `+X` facing
 * - Warm russet-red breast, earthy slate-brown back & fanned tail feathers, tiny knitted dusty-blue
 *   winter cap with cream cuff & pom-pom (`data-part="winter-cap"`), expressive Disney eyes & chirping beak
 * - Full state support: `idle`, `walking` (12 FPS joyful hop & flutter, `data-facing="right"`,
 *   `data-walk-profile="true"`), `curious` (head cocked!), `waving` (cheerily flapping wings!),
 *   `singing` / `isSpeaking` (4-phase 12 FPS animated chirping beak with `data-speaking-mouth="true"`)
 */
export function renderClassicSnowRobin(options: CharacterRenderOptions): string {
  const { state, frameIndex = 0, isSpeaking = false, id } = options;
  const pfx = sanitizeIdPart(id);
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const isWalking = state === 'walking';
  const isCurious = state === 'curious' || state === 'looking_up';
  const isWaving = state === 'waving' || state === 'reaching';
  const isSinging = state === 'singing';
  const isBlinking = state === 'blinking' || state === 'sleeping' || state === 'sleepy';
  const speakingActive = isSinging || isSpeaking;

  const drawStep = Math.floor(frameIndex / 2);
  const autoBlink = !isCurious && isSteppedBlinkFrame(frameIndex, 32, 2, 7);
  const featherJit = round2(deterministicJitter(drawStep, 27, 0.45));

  // Joyful 12 FPS hop/flutter, wing flap & chest puff
  const hopY = isWalking ? round2(Math.abs(steppedOscillate(frameIndex, 6, 7.2))) : 0;
  const chestBob = isWalking
    ? 0
    : round2(
        isWaving
          ? Math.abs(steppedOscillate(frameIndex, 6, 2.2))
          : speakingActive
          ? Math.abs(steppedOscillate(frameIndex, 8, 1.4))
          : steppedOscillate(frameIndex, 18, 0.65)
      );
  const squash = isWalking
    ? steppedOscillate(frameIndex, 6, 0.045)
    : isWaving
    ? steppedOscillate(frameIndex, 6, 0.03)
    : 0;
  const scaleX = round2(1 + squash);
  const scaleY = round2(1 - squash);

  const headTilt = isCurious
    ? round2(-14.0 + steppedOscillate(frameIndex, 14, 2.2))
    : speakingActive
    ? round2(-6.5 + steppedOscillate(frameIndex, 8, 3.2))
    : isWaving
    ? steppedOscillate(frameIndex, 6, 4.0)
    : isWalking
    ? steppedOscillate(frameIndex, 6, 3.5)
    : steppedOscillate(frameIndex, 22, 1.6);

  const tailFlick = isWalking
    ? steppedOscillate(frameIndex, 6, 10, -1)
    : isWaving
    ? steppedOscillate(frameIndex, 6, 8)
    : steppedOscillate(frameIndex, 18, 4);

  const wingFlapAngle = isWaving
    ? round2(-26 + steppedOscillate(frameIndex, 4, 28))
    : isWalking
    ? round2(-14 + steppedOscillate(frameIndex, 6, 22))
    : 0;

  const shadowRx = round2(Math.max(8, 13.5 - hopY * 0.55));
  const shadowOpacity = round2(Math.max(0.16, 0.3 - hopY * 0.015));

  // Delicate bird feet planted at y = 0 (tucked slightly during hop!)
  const feetTuckY = isWalking ? round2(-hopY * 0.65) : 0;
  const feetMarkup = svgEl(
    'g',
    {
      'data-part': 'feet',
      transform: feetTuckY !== 0 ? svgTransform({ y: feetTuckY }) : undefined,
    },
    [
      svgEl('path', {
        d: 'M -3.4 -7.5 L -4.2 -0.6 M -4.2 -0.6 L -0.4 -0.4 M -4.2 -0.6 L -6.8 -0.4 M 3.2 -7.5 L 3.8 -0.6 M 3.8 -0.6 L 7.6 -0.4 M 3.8 -0.6 L 1.2 -0.4',
        fill: 'none',
        ...celStrokeAttrs({ strokeWidth: 1.45, useXeroxFilter: true }),
      }),
    ]
  );

  // Expressive Disney songbird beak (`data-part="beak"`) with 4-phase chirping when singing/speaking
  let beakMarkup: string;
  if (speakingActive) {
    const mouthPhase = ((Math.floor(frameIndex / 2) % 4) + 4) % 4;
    let beakShape: string;
    if (mouthPhase === 0) {
      // Phase 0: Closed crisp beak
      beakShape = celPath(
        'M 11.4 -24.2 L 19.8 -22.2 L 11.4 -19.8 Z',
        c.antiqueGold,
        { strokeWidth: s.xeroxFine }
      );
    } else if (mouthPhase === 1) {
      // Phase 1: Slightly parted tweet
      beakShape = [
        celPath('M 11.4 -24.6 L 19.6 -23.6 L 11.4 -21.8 Z', c.antiqueGold, { strokeWidth: s.xeroxFine }),
        celPath('M 11.4 -21.6 L 18.2 -19.6 L 11.4 -19.6 Z', c.ochreEarth, { strokeWidth: s.xeroxFine }),
      ].join('');
    } else if (mouthPhase === 2) {
      // Phase 2: Wide open joyful chirp with dark inner mouth & tiny tongue!
      beakShape = [
        svgEl('path', {
          d: 'M 11.2 -24.0 L 18.2 -22.2 L 11.2 -19.6 Z',
          fill: c.mochiMouthInner,
        }),
        svgEl('ellipse', { cx: 13.4, cy: -21.0, rx: 1.5, ry: 0.9, fill: c.mochiTongue }),
        celPath('M 11.2 -24.8 L 20.2 -25.8 L 11.6 -22.4 Z', c.antiqueGold, { strokeWidth: s.xeroxFine }),
        celPath('M 11.2 -21.2 L 18.8 -18.0 L 11.2 -19.4 Z', c.ochreEarth, { strokeWidth: s.xeroxFine }),
        // Tiny hand-inked chirp sound ticks!
        xeroxSketchStroke('M 21.4 -26.8 L 23.8 -28.4 M 22.0 -22.2 L 24.4 -22.4', {
          stroke: c.parchmentCream,
          strokeWidth: 1.0,
        }),
      ].join('');
    } else {
      // Phase 3: Medium happy trill
      beakShape = [
        svgEl('path', { d: 'M 11.2 -23.6 L 17.2 -21.8 L 11.2 -20.0 Z', fill: c.mochiMouthInner }),
        celPath('M 11.2 -24.6 L 19.8 -24.6 L 11.4 -22.2 Z', c.antiqueGold, { strokeWidth: s.xeroxFine }),
        celPath('M 11.2 -21.4 L 18.4 -19.0 L 11.2 -19.6 Z', c.ochreEarth, { strokeWidth: s.xeroxFine }),
      ].join('');
    }
    beakMarkup = svgEl(
      'g',
      {
        'data-part': 'beak',
        'data-speaking-mouth': 'true',
        'data-mouth-phase': String(mouthPhase),
      },
      beakShape
    );
  } else {
    beakMarkup = svgEl('g', { 'data-part': 'beak' }, [
      celPath('M 11.4 -24.4 L 19.8 -22.2 L 11.4 -19.8 Z', c.antiqueGold, {
        strokeWidth: s.xeroxFine,
      }),
      xeroxSketchStroke('M 11.6 -22.1 L 18.8 -22.2', {
        stroke: c.xeroxInk,
        strokeWidth: 0.9,
      }),
    ]);
  }

  // Expressive classic Disney robin eye (`data-part="eyes"`)
  const eyeMarkup =
    isBlinking || autoBlink
      ? svgEl('g', { 'data-part': 'eyes' }, [
          svgEl('path', {
            d: 'M 4.4 -24.6 Q 7.4 -27.2, 10.4 -24.6',
            fill: 'none',
            ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
          }),
        ])
      : svgEl('g', { 'data-part': 'eyes' }, [
          svgEl('ellipse', {
            cx: 7.4,
            cy: -24.8,
            rx: 3.1,
            ry: 3.4,
            fill: c.celCream,
            ...celStrokeAttrs({ strokeWidth: s.xeroxFine, useXeroxFilter: true }),
          }),
          svgEl('ellipse', {
            cx: round2(8.0 + (isCurious ? 0.4 : 0)),
            cy: round2(-24.8 + (isCurious ? -0.5 : 0)),
            rx: 1.85,
            ry: 2.25,
            fill: c.xeroxInk,
          }),
          svgEl('circle', {
            cx: round2(7.3 + (isCurious ? 0.4 : 0)),
            cy: round2(-26.0 + (isCurious ? -0.5 : 0)),
            r: 0.85,
            fill: c.celCream,
          }),
          // Feathery upper eyelid & delicate lash tick
          svgEl('path', {
            d: 'M 4.0 -26.2 Q 7.4 -29.2, 10.8 -26.2',
            fill: 'none',
            ...celStrokeAttrs({ strokeWidth: s.xeroxMedium, useXeroxFilter: true }),
          }),
          xeroxSketchStroke('M 4.4 -26.4 L 3.0 -27.6', { strokeWidth: 0.85 }),
        ]);

  // Plump robin body silhouette + clipped warm russet-red breast & cream belly
  const bodyD =
    'M -12.0 -14.0 C -13.6 -22.2, -7.2 -29.2, 1.5 -29.8 C 10.2 -30.2, 14.4 -23.6, 14.2 -16.4 C 13.8 -9.2, 7.6 -5.2, -0.8 -5.4 C -7.8 -5.6, -11.2 -9.0, -12.0 -14.0 Z';
  const bodyClipId = `${pfx}-body-clip`;

  // Wings (`data-part="wings"`): flapping cheerily in waving/walking, or neatly folded at side
  const wingsMarkup =
    isWaving || isWalking
      ? svgEl('g', { 'data-part': 'wings' }, [
          // Far wing peeking up behind chest
          svgEl(
            'g',
            {
              transform: svgTransform({
                rotate: -wingFlapAngle * 0.7,
                pivotX: 4,
                pivotY: -18,
              }),
            },
            celPath(
              'M 2.0 -20.5 C 8.0 -29.5, 16.5 -30.5, 18.8 -25.0 C 16.0 -20.5, 10.0 -18.0, 3.0 -17.0 Z',
              c.woodDark,
              { strokeWidth: s.xeroxFine }
            )
          ),
          // Near feathered wing flapping cheerily out to -X
          svgEl(
            'g',
            {
              transform: svgTransform({
                rotate: wingFlapAngle,
                pivotX: -4,
                pivotY: -18,
              }),
            },
            [
              celPath(
                'M -2.5 -19.5 C -9.5 -28.0, -19.5 -28.5, -21.8 -22.0 L -18.5 -20.2 L -20.5 -17.5 C -14.5 -14.8, -7.5 -14.8, -2.0 -16.2 Z',
                c.woodMid,
                { strokeWidth: s.xeroxMedium }
              ),
              xeroxSketchStroke(
                'M -16.8 -22.4 L -10.4 -20.6 M -16.4 -18.8 L -9.6 -18.0',
                { stroke: c.xeroxInkSoft, strokeWidth: 0.85 }
              ),
            ]
          ),
        ])
      : svgEl('g', { 'data-part': 'wings' }, [
          celPath(
            'M -10.8 -19.0 C -5.5 -22.2, 2.2 -20.2, 2.6 -14.8 C 2.8 -10.2, -3.5 -8.8, -11.5 -11.2 L -14.2 -13.4 Z',
            c.woodMid,
            { strokeWidth: s.xeroxMedium }
          ),
          xeroxSketchStroke(
            'M -9.2 -15.4 Q -4.2 -15.4, -0.6 -13.8 M -10.4 -12.6 Q -5.6 -12.0, -1.8 -11.2',
            { stroke: c.xeroxInkSoft, strokeWidth: 0.85, broken: true }
          ),
        ]);

  return svgEl(
    'g',
    {
      'data-character': 'snow_robin',
      'data-art-style': 'classic_cel',
      'data-state': state,
      'data-facing': isWalking ? 'right' : undefined,
      'data-walk-profile': isWalking ? 'true' : undefined,
    },
    [
      // Grounded soft contact shadow
      celContactShadow(0, 0.5, shadowRx, 2.6, shadowOpacity),

      // Delicate dark bird feet
      feetMarkup,

      // Animated plump Snow Robin cel rig
      svgEl(
        'g',
        {
          transform: svgTransform({
            y: round2(-(hopY + chestBob)),
            scaleX,
            scaleY,
          }),
        },
        [
          // Fanned slate-brown tail feathers extending to -X with 12 FPS flick
          svgEl(
            'g',
            {
              'data-part': 'tail-feathers',
              transform: svgTransform({
                rotate: tailFlick,
                pivotX: -10,
                pivotY: -13,
              }),
            },
            [
              celPath(
                `M -9.8 -15.2 L ${round2(-22.2 + featherJit * 0.4)} -19.8 L -20.4 -15.6 L ${round2(-23.0 + featherJit * 0.4)} -12.6 L -10.2 -10.4 Z`,
                c.pathEarthDark,
                { strokeWidth: s.xeroxMedium }
              ),
              xeroxSketchStroke('M -19.0 -16.4 L -12.0 -13.8 M -19.4 -13.6 L -12.2 -12.2', {
                stroke: c.xeroxInkSoft,
                strokeWidth: 0.85,
              }),
            ]
          ),

          // Plump robin body (earthy slate-brown back + warm russet-red breast + cream belly)
          svgEl('clipPath', { id: bodyClipId }, svgEl('path', { d: bodyD })),
          svgEl('path', { d: bodyD, fill: c.pathEarthDark, stroke: 'none' }),
          svgEl('g', { 'clip-path': svgUrl(bodyClipId) }, [
            // Warm russet-red winter robin breast
            svgEl('path', {
              d: 'M -1.5 -24.5 C 4.8 -25.8, 12.6 -23.4, 15.2 -17.0 C 15.8 -10.2, 9.8 -5.2, 1.5 -6.2 C -3.8 -7.2, -4.8 -15.8, -1.5 -24.5 Z',
              fill: c.mochiCollar,
            }),
            // Soft parchment-cream belly fluff along bottom curve
            svgEl('path', {
              d: 'M -9.5 -9.0 C -4.0 -7.6, 3.2 -7.4, 9.2 -9.4 L 9.5 -3.0 L -10.5 -3.0 Z',
              fill: c.mochiCream,
            }),
          ]),
          celPath(bodyD, 'none', { strokeWidth: s.xeroxHeavy }),

          // Sketchy chest fluff & breast separation ticks
          xeroxSketchStroke('M -1.6 -18.5 Q -0.6 -14.2, 1.2 -10.8 M 4.4 -10.4 Q 7.4 -10.0, 9.8 -11.4', {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.85,
            broken: true,
            opacity: 0.78,
          }),

          // Head-cocked group (eyes, beak & jaunty knitted winter cap)
          svgEl(
            'g',
            {
              'data-part': 'head',
              transform: svgTransform({
                rotate: headTilt,
                pivotX: 4,
                pivotY: -22,
              }),
            },
            [
              // Cheek blush fluff
              svgEl('ellipse', {
                cx: 9.8,
                cy: -20.2,
                rx: 2.2,
                ry: 1.3,
                fill: c.dustyRose,
                opacity: 0.45,
              }),

              // Expressive chirping beak & Disney songbird eye
              beakMarkup,
              eyeMarkup,

              // Tiny knitted dusty-blue winter cap with cream cuff & pom-pom (`data-part="winter-cap"`)
              svgEl('g', { 'data-part': 'winter-cap' }, [
                // Knitted dusty-blue crown
                celPath(
                  'M -7.6 -28.4 C -7.4 -37.2, 2.0 -41.4, 9.2 -36.0 C 11.4 -34.2, 12.2 -31.2, 11.8 -28.8 Z',
                  c.nightcapBlue,
                  { strokeWidth: s.xeroxMedium }
                ),
                // Soft cream stripe & sketchy knit ribs
                svgEl('path', {
                  d: 'M -6.4 -32.4 Q 2.4 -35.8, 11.0 -32.2',
                  fill: 'none',
                  ...celStrokeAttrs({ stroke: c.nightcapStripe, strokeWidth: 2.0, opacity: 0.72 }),
                }),
                xeroxSketchStroke('M -2.2 -35.2 L -1.2 -30.2 M 3.2 -36.4 L 3.4 -30.4 M 7.6 -34.8 L 7.4 -30.0', {
                  stroke: c.nightcapShadow,
                  strokeWidth: 0.85,
                  broken: true,
                }),
                // Cozy parchment-cream upturned cuff
                celPath(
                  'M -9.0 -28.8 C -3.0 -31.6, 6.2 -31.8, 13.0 -29.0 L 12.4 -26.2 C 6.0 -28.4, -2.6 -28.4, -8.6 -26.0 Z',
                  c.celCream,
                  { strokeWidth: s.xeroxFine }
                ),
                // Fluffy cream pom-pom perched on top!
                celPath(
                  `M 0.2 -39.4 C -1.4 -42.4, 2.2 -44.2, 4.8 -42.6 C 7.4 -41.2, 6.4 -37.8, 3.2 -37.8 C 1.2 -37.8, 0.4 -38.4, 0.2 -39.4 Z`,
                  c.celCream,
                  { strokeWidth: s.xeroxFine }
                ),
                xeroxSketchStroke('M 1.4 -42.4 L 0.6 -43.6 M 5.2 -42.2 L 6.4 -43.2', {
                  stroke: c.xeroxInkSoft,
                  strokeWidth: 0.8,
                }),
              ]),
            ]
          ),

          // Feathered wings (folded or flapping!)
          wingsMarkup,
        ]
      ),
    ]
  );
}

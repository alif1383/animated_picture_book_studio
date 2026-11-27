import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celShadedShape,
  celStrokeAttrs,
  deterministicJitter,
  gouachePath,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders a classic 1970s–80s Disney painted gouache woodland tree (`'tree'`)
 * inspired by *Robin Hood* (1973): gnarled dark-bark trunk with root toes and sketchy
 * sepia ink strokes, multi-layered gouache foliage masses (midnight-teal under-canopy
 * shadow, forest-sage main puffs, cool silver-sage moonlight top rims, subtle ink
 * leaf scallops), and gentle 12 FPS wind sway seeded by `variant`.
 *
 * Origin: `(0, 0)` at trunk base.
 * Footprint: `~x: -66..66, y: -140..0`.
 */
export function renderClassicTree(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Deterministic gentle 12 FPS woodland breeze sway seeded by variant
  const crownSway = steppedOscillate(frameIndex, 36, 1.35, variant * 7);
  const upperBoughSway = steppedOscillate(frameIndex, 36, 0.75, variant * 7 + 4);
  const trunkFlex = round2(crownSway * 0.25);

  // Subtle variant-driven organic asymmetry so neighboring trees feel hand-painted
  const mirrorSign = variant % 2 === 0 ? -1 : 1;
  const jx = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // Gnarled trunk path with flared root toes gripping ground at y = 0
  const trunkD =
    'M -20 0 C -14 -4, -12 -14, -10 -32 C -9 -48, -11 -62, -16 -76 L -8 -82 C -5 -68, -2 -68, 1 -80 L 14 -76 C 9 -62, 8 -46, 10 -28 C 11 -14, 14 -4, 21 0 C 12 -1, 7 -3, 2 -1 C -3 1, -8 -2, -20 0 Z';

  // Moonlit bark shadow & rim inside clipped trunk
  const trunkShadowPaths = [
    'M -22 2 L -22 -84 L -2 -84 C -4 -58, -4 -30, -1 2 Z',
    'M -20 0 C -10 -7, -2 -6, 6 -4 L 6 4 L -22 4 Z',
  ];
  const trunkHighlightPaths = [
    'M 6 -78 C 8 -58, 9 -36, 13 -12 C 15 -6, 18 -2, 22 0 L 22 -82 Z',
  ];

  // Sketchy sepia/charcoal ink bark grain & knot strokes (*Robin Hood* style)
  const barkInkLines = svgEl(
    'g',
    { 'data-part': 'trunk-ink-detail', opacity: 0.68 },
    [
      svgEl('path', {
        d: 'M -6 -6 C -5 -22, -6 -40, -5 -58 M 3 -8 C 2 -28, 3 -46, 5 -66',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInk,
          strokeWidth: s.sketchLine,
        }),
      }),
      // Small bark knot & root crease
      svgEl('path', {
        d: 'M -3 -35 C 0 -39, 3 -36, 1 -31 C -1 -28, -4 -31, -3 -35 M -13 -3 Q -8 -7, -5 -12 M 13 -3 Q 8 -8, 6 -15',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        }),
      }),
      // Upper forked limbs vanishing into foliage shadow
      svgEl('path', {
        d: 'M -9 -68 Q -18 -78, -25 -82 M 7 -66 Q 17 -76, 24 -79',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.woodDark,
          strokeWidth: 3.2,
        }),
      }),
    ]
  );

  // Foliage gradient defs for rich painterly gouache depth
  const gradMainId = `cc-tree-foliage-mid-${uid}`;
  const gradLitId = `cc-tree-foliage-lit-${uid}`;
  const gradDefs = svgEl('defs', {}, [
    svgEl(
      'linearGradient',
      { id: gradMainId, x1: '15%', y1: '0%', x2: '85%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.foliageLit }),
        svgEl('stop', { offset: '48%', 'stop-color': c.foliageMid }),
        svgEl('stop', { offset: '100%', 'stop-color': c.foliageShadow }),
      ]
    ),
    svgEl(
      'linearGradient',
      { id: gradLitId, x1: '75%', y1: '0%', x2: '15%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.foliageRim }),
        svgEl('stop', { offset: '55%', 'stop-color': c.foliageLit }),
        svgEl('stop', { offset: '100%', 'stop-color': c.foliageMid }),
      ]
    ),
  ]);

  // Multi-layered gouache foliage canopy (origin-relative within x: -64..64, y: -138..-44)
  const canopyLayer = svgEl(
    'g',
    {
      'data-part': 'foliage-canopy',
      transform: svgTransform({
        rotate: crownSway,
        pivotX: 0,
        pivotY: -66,
        scaleX: mirrorSign,
        scaleY: 1,
      }),
    },
    [
      // Layer 1: Deep midnight-teal under-canopy shadow mass
      gouachePath(
        `M ${round2(-50 + jx(1, 2))} -68 C ${round2(-65 + jx(2, 1.5))} -86, -58 -114, -34 -120 C -22 -136, 16 -140, 32 -124 C 56 -122, 66 -94, 54 -72 C 60 -54, 34 -44, 6 -48 C -14 -42, -56 -48, ${round2(-50 + jx(1, 2))} -68 Z`,
        c.foliageShadow,
        { softEdge: true, opacity: 0.96 }
      ),

      // Layer 2: Mid forest-sage painted bough puffs
      gouachePath(
        `M -52 -78 C -60 -98, -42 -118, -20 -114 C -10 -122, 4 -112, -2 -96 C 4 -78, -24 -64, -44 -70 C -50 -72, -52 -74, -52 -78 Z`,
        svgUrl(gradMainId),
        { softEdge: true, opacity: 0.92 }
      ),
      gouachePath(
        `M -22 -96 C -26 -124, 6 -138, 28 -124 C 46 -116, 46 -90, 26 -78 C 8 -70, -18 -76, -22 -96 Z`,
        svgUrl(gradMainId),
        { softEdge: true, opacity: 0.95 }
      ),
      gouachePath(
        `M 10 -78 C 12 -98, 36 -110, 52 -96 C 63 -84, 56 -64, 36 -60 C 18 -58, 8 -68, 10 -78 Z`,
        svgUrl(gradMainId),
        { softEdge: true, opacity: 0.9 }
      ),

      // Layer 3: Upper moonlit sage-green leaf clusters (slight secondary phase sway)
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: upperBoughSway,
            pivotX: 0,
            pivotY: -96,
          }),
        },
        [
          gouachePath(
            'M -14 -112 C -12 -130, 14 -137, 29 -124 C 38 -116, 32 -102, 16 -100 C -2 -98, -16 -102, -14 -112 Z',
            svgUrl(gradLitId),
            { softEdge: true, opacity: 0.88 }
          ),
          gouachePath(
            'M 22 -98 C 30 -108, 48 -105, 53 -92 C 56 -82, 44 -76, 32 -80 C 20 -84, 18 -92, 22 -98 Z',
            svgUrl(gradLitId),
            { softEdge: true, opacity: 0.82 }
          ),
          gouachePath(
            'M -44 -94 C -42 -108, -24 -115, -12 -106 C -6 -100, -14 -90, -28 -88 C -39 -87, -46 -88, -44 -94 Z',
            c.foliageLit,
            { softEdge: true, opacity: 0.72 }
          ),

          // Layer 4: Cool silver-sage moonlight rim crests along top-right edges
          gouachePath(
            'M -6 -127 C 8 -136, 26 -131, 33 -118 C 24 -125, 8 -128, -6 -123 Z',
            c.foliageRim,
            { softEdge: false, opacity: 0.78 }
          ),
          gouachePath(
            'M 30 -106 C 43 -108, 55 -98, 56 -86 C 49 -96, 39 -102, 28 -102 Z',
            c.foliageRim,
            { softEdge: false, opacity: 0.72 }
          ),
          gouachePath(
            'M -39 -108 C -30 -116, -18 -116, -11 -110 C -20 -112, -31 -111, -39 -105 Z',
            c.foliageRim,
            { softEdge: false, opacity: 0.56 }
          ),
        ]
      ),

      // Layer 5: Subtle sketchy sepia/charcoal ink leaf scallops & bough definition
      svgEl('g', { 'data-part': 'foliage-ink-scallops', opacity: 0.54 }, [
        svgEl('path', {
          d: 'M -49 -76 C -57 -88, -51 -104, -38 -110 M -22 -118 C -10 -133, 14 -136, 28 -126 M 38 -114 C 54 -108, 61 -92, 54 -76',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.xeroxFine,
          }),
        }),
        svgEl('path', {
          d: 'M -34 -72 Q -22 -64, -8 -69 Q 6 -60, 22 -66 Q 38 -59, 48 -67',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInk,
            strokeWidth: s.sketchLine,
          }),
        }),
        svgEl('path', {
          d: 'M -18 -98 Q -6 -106, 6 -99 Q 18 -104, 28 -96',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
          }),
        }),
      ]),
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'tree',
      'data-art-style': 'classic_cel',
    },
    [
      gradDefs,
      // Grounded woodland shadow wash beneath roots
      celContactShadow(0, 1, 25, 5.5, 0.3),
      // Gnarled trunk with very subtle flex
      svgEl(
        'g',
        {
          'data-part': 'tree-trunk',
          transform: svgTransform({
            rotate: trunkFlex,
            pivotX: 0,
            pivotY: 0,
          }),
        },
        [
          celShadedShape({
            d: trunkD,
            baseFill: c.woodMid,
            shadowPaths: trunkShadowPaths,
            shadowFill: c.woodDark,
            highlightPaths: trunkHighlightPaths,
            highlightFill: c.woodLit,
            highlightOpacity: 0.72,
            clipId: `cc-tree-trunk-clip-${uid}`,
            stroke: c.xeroxInk,
            strokeWidth: s.xeroxFine,
          }),
          barkInkLines,
        ]
      ),
      canopyLayer,
    ]
  );
}

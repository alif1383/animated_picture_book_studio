import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  deterministicJitter,
  gouacheDabWash,
  gouachePath,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { GouacheDab } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1973 *Robin Hood*-style dappled watercolor/gouache woodland
 * tree (`'tree'`) on illustration board: overlapping translucent irregular sage/olive/
 * deep-teal foliage brush daubs with soft wet-edges (`gouacheDabWash`, NO hard black
 * outline around the canopy!), subtle pale sky/moonlight peeking through foliage gaps,
 * a gnarled painted bark trunk with broken sepia Xerox ink bark lines (`xeroxSketchStroke`),
 * sparse loose hand-inked branch & leaf-cluster flicks inside the foliage, and gentle
 * 12 FPS wind sway seeded by `variant`.
 *
 * Origin: `(0, 0)` at trunk base.
 * Footprint: `~x: -66..66, y: -140..0`.
 */
export function renderClassicTree(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // Gentle 12 FPS woodland breeze sway seeded by variant
  const crownSway = steppedOscillate(frameIndex, 36, 1.25, variant * 7);
  const upperSway = steppedOscillate(frameIndex, 36, 0.7, variant * 7 + 4);
  const trunkFlex = round2(crownSway * 0.2);

  // Subtle variant-driven organic asymmetry so neighboring trees feel individually painted
  const mirrorSign = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // Grounded dappled watercolor shadow wash beneath the roots
  const groundWashDabs: GouacheDab[] = [
    { cx: -12, cy: 1.5, rx: 16, ry: 4.2, rotate: -3, opacity: 0.34 },
    { cx: 5, cy: 2, rx: 19, ry: 4.6, rotate: 2, opacity: 0.38 },
    { cx: 16, cy: 0.5, rx: 11, ry: 3.4, rotate: 5, opacity: 0.28 },
  ];
  const groundWash = gouacheDabWash(groundWashDabs, {
    fill: c.foliageShadow,
    wetEdgeColor: c.contactShadow,
    wetEdgeOpacity: 0.16,
    opacity: 0.78,
    seed: variant * 7 + 1,
  });

  // Gnarled painted gouache trunk & reaching boughs (no glossy digital gradients!)
  const trunkBaseD =
    'M -19 0 C -13 -5, -11 -16, -9.5 -34 C -8.5 -50, -10.5 -64, -17 -79 L -9 -84 C -6 -72, -3 -72, 0.5 -84 L 12.5 -78 C 8 -63, 7.5 -47, 9 -29 C 10.5 -15, 13.5 -5, 20 0 C 12 -1, 6 -3, 1.5 -1 C -3.5 1, -9 -2, -19 0 Z';
  const trunkShadowD =
    'M -19 0 C -13 -5, -11 -16, -9.5 -34 C -8.5 -50, -10.5 -64, -17 -79 L -10 -82 C -5 -60, -4 -30, -2 -1 C -7 -2, -13 -1, -19 0 Z';
  const trunkLitD =
    'M 5 -76 C 7.5 -56, 8 -34, 11.5 -12 C 13 -6, 15.5 -2, 18.5 0 L 14 -1 C 9.5 -12, 8 -36, 7 -58 Z';

  // Reaching limbs peeking dimly inside the dappled canopy gaps
  const innerBoughs = svgEl('g', { 'data-part': 'inner-boughs', opacity: 0.72 }, [
    gouachePath(
      'M -10 -72 Q -22 -86, -32 -95 L -28 -97 Q -17 -87, -6 -74 Z',
      c.woodDark,
      { softEdge: true }
    ),
    gouachePath(
      'M 5 -74 Q 18 -89, 28 -98 L 31 -95 Q 20 -85, 9 -72 Z',
      c.woodDark,
      { softEdge: true }
    ),
    gouachePath(
      'M -1 -78 Q 2 -95, 0 -106 L 4 -105 Q 6 -94, 3 -77 Z',
      c.woodDark,
      { softEdge: true, opacity: 0.65 }
    ),
  ]);

  // Broken sketchy sepia/graphite Xerox ink bark contour & grain strokes
  const trunkInk = svgEl('g', { 'data-part': 'trunk-ink-detail' }, [
    // Broken outer left & right bark edges (selective pen inking, not a heavy uniform box)
    xeroxSketchStroke(
      'M -18 -1 C -12 -7, -10.5 -19, -9.5 -35 C -8.5 -51, -10.5 -65, -16 -77',
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        broken: true,
        dasharray: '14 3 9 2.5 16 4',
        feather: true,
        opacity: 0.8,
      }
    ),
    xeroxSketchStroke(
      'M 19 -1 C 13 -7, 10.5 -18, 9 -34 C 8 -49, 8.5 -63, 12.5 -77',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '11 4 8 3 12 4',
        opacity: 0.72,
      }
    ),
    // Vertical bark grooves, gnarl knot, and root toes
    xeroxSketchStroke(
      'M -5.5 -6 C -4.5 -22, -5.5 -39, -4.5 -58 M 2.5 -9 C 1.8 -27, 2.8 -46, 4.5 -66',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '8 3 5 3',
        opacity: 0.68,
      }
    ),
    xeroxSketchStroke(
      'M -3 -35 C -0.5 -39, 2.5 -36.5, 0.8 -31.5 C -1 -28.5, -3.5 -31, -3 -35 M -12 -3 Q -7 -7, -4.5 -13 M 12 -3 Q 7.5 -8, 5.5 -15',
      {
        stroke: c.xeroxInk,
        strokeWidth: 0.85,
        opacity: 0.65,
      }
    ),
    // Sparse limb ink ticks inside lower canopy
    xeroxSketchStroke(
      'M -12 -74 Q -21 -83, -29 -91 M 8 -74 Q 17 -84, 25 -92',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.9,
        broken: true,
        opacity: 0.62,
      }
    ),
  ]);

  // ── Layer 1: Deep back-canopy shadow watercolor daubs ──
  const shadowDabs: GouacheDab[] = [
    { cx: round2(-38 + j(1, 3)), cy: -74, rx: 22, ry: 17, rotate: -14, opacity: 0.82 },
    { cx: round2(-20 + j(2, 3)), cy: -98, rx: 25, ry: 20, rotate: 8, opacity: 0.84 },
    { cx: round2(4 + j(3, 3)), cy: -112, rx: 27, ry: 21, rotate: -6, opacity: 0.82 },
    { cx: round2(31 + j(4, 3)), cy: -96, rx: 24, ry: 19, rotate: 16, opacity: 0.82 },
    { cx: round2(38 + j(5, 3)), cy: -72, rx: 22, ry: 16, rotate: -9, opacity: 0.8 },
    { cx: round2(2 + j(6, 3)), cy: -68, rx: 28, ry: 17, rotate: 4, opacity: 0.84 },
    { cx: round2(-16 + j(7, 2)), cy: -62, rx: 20, ry: 14, rotate: -10, opacity: 0.78 },
  ];

  // ── Layer 2: Mid-tone dappled olive & forest-sage brush blotches ──
  const midDabs: GouacheDab[] = [
    { cx: round2(-44 + j(8, 3)), cy: -84, rx: 17, ry: 13, rotate: -18, fill: c.foliageMid, opacity: 0.78 },
    { cx: round2(-26 + j(9, 3)), cy: -108, rx: 19, ry: 15, rotate: 12, fill: c.oliveCanopy, opacity: 0.76 },
    { cx: round2(-6 + j(10, 3)), cy: -120, rx: 21, ry: 16, rotate: -10, fill: c.foliageLit, opacity: 0.78 },
    { cx: round2(20 + j(11, 3)), cy: -114, rx: 20, ry: 15, rotate: 14, fill: c.oliveCanopy, opacity: 0.76 },
    { cx: round2(41 + j(12, 3)), cy: -90, rx: 18, ry: 14, rotate: -12, fill: c.foliageMid, opacity: 0.78 },
    { cx: round2(26 + j(13, 3)), cy: -76, rx: 19, ry: 13, rotate: 9, fill: c.oliveCanopy, opacity: 0.74 },
    { cx: round2(-10 + j(14, 3)), cy: -84, rx: 22, ry: 16, rotate: -7, fill: c.foliageMid, opacity: 0.76 },
    { cx: round2(-32 + j(15, 2)), cy: -68, rx: 16, ry: 12, rotate: 15, fill: c.oliveCanopy, opacity: 0.72 },
    { cx: round2(8 + j(16, 2)), cy: -96, rx: 18, ry: 14, rotate: -15, fill: c.foliageLit, opacity: 0.72 },
    { cx: round2(46 + j(17, 2)), cy: -74, rx: 14, ry: 11, rotate: 18, fill: c.foliageLit, opacity: 0.68 },
  ];

  // ── Layer 3: Upper dappled moonlit sage washes & subtle sky-peek holes ──
  const litDabs: GouacheDab[] = [
    { cx: round2(-14 + j(18, 2)), cy: -124, rx: 14, ry: 10, rotate: -14, fill: c.sageFoliage, opacity: 0.62 },
    { cx: round2(12 + j(19, 2)), cy: -126, rx: 15, ry: 10, rotate: 10, fill: c.foliageRim, opacity: 0.56 },
    { cx: round2(34 + j(20, 2)), cy: -104, rx: 13, ry: 10, rotate: 18, fill: c.sageFoliage, opacity: 0.58 },
    { cx: round2(-38 + j(21, 2)), cy: -96, rx: 12, ry: 9, rotate: -20, fill: c.sageFoliage, opacity: 0.52 },
    { cx: round2(2 + j(22, 2)), cy: -104, rx: 13, ry: 9, rotate: 6, fill: c.foliageRim, opacity: 0.44 },
    { cx: round2(44 + j(23, 2)), cy: -82, rx: 11, ry: 8, rotate: -8, fill: c.foliageRim, opacity: 0.48 },
  ];

  // Tiny pale sky/moonlight breathing holes peeking through loose foliage gaps (like Robin Hood!)
  const skyPeekDabs: GouacheDab[] = [
    { cx: round2(-26 + j(24, 2)), cy: -86, rx: 5.2, ry: 3.8, rotate: 12, fill: c.nightSkyHorizon, opacity: 0.34 },
    { cx: round2(24 + j(25, 2)), cy: -96, rx: 5.5, ry: 3.6, rotate: -18, fill: c.nightMistTeal, opacity: 0.32 },
    { cx: round2(6 + j(26, 2)), cy: -78, rx: 4.5, ry: 3.2, rotate: 8, fill: c.nightSkyHorizon, opacity: 0.28 },
  ];

  // ── Layer 4: Sparse, loose hand-inked foliage & twig flicks (Robin Hood penwork!) ──
  const foliageFlicks = svgEl(
    'g',
    { 'data-part': 'foliage-ink-flicks', opacity: 0.64 },
    [
      // Loose broken leaf-cluster ticks & short curved zig-zags scattered inside canopy pockets
      xeroxSketchStroke(
        'M -48 -80 q 3 -4 6 -1 m 2 -3 q 4 -3 7 1 M -34 -108 q 4 -4 8 -1 m 3 -2 q 4 -2 6 2',
        { stroke: c.xeroxInkSoft, strokeWidth: 1.05, opacity: 0.72 }
      ),
      xeroxSketchStroke(
        'M -14 -126 q 5 -3 9 0 m 5 -1 q 5 -3 9 1 M 24 -116 q 5 -2 8 2 m 4 1 q 4 -2 7 3',
        { stroke: c.xeroxInkSoft, strokeWidth: 1.0, opacity: 0.68 }
      ),
      xeroxSketchStroke(
        'M 38 -88 q 5 -2 8 2 m -2 6 q 5 0 7 4 M -38 -65 q 5 2 9 -1 m 7 2 q 6 3 11 0 M 14 -64 q 6 2 10 -1 m 6 -1 q 5 2 9 -2',
        { stroke: c.xeroxInk, strokeWidth: 1.1, opacity: 0.7 }
      ),
      xeroxSketchStroke(
        'M -20 -88 q 4 -3 8 0 m -6 5 q 5 -2 9 1 M 6 -96 q 5 -3 9 0 m -4 6 q 4 -2 8 1',
        { stroke: c.xeroxInk, strokeWidth: 0.95, opacity: 0.62 }
      ),
      // Tiny dark painterly leaf stipple flecks scattered organically (authentic 1973 brushwork)
      ...[
        [-52, -88, 1.3], [-42, -104, 1.1], [-22, -122, 1.2], [-2, -133, 1.4],
        [18, -128, 1.1], [38, -112, 1.3], [54, -92, 1.2], [52, -72, 1.1],
        [28, -62, 1.3], [-8, -62, 1.2], [-46, -68, 1.2], [-12, -102, 1.4],
        [16, -86, 1.3], [32, -82, 1.1], [-28, -76, 1.2],
      ].map(([fx, fy, fr], idx) =>
        svgEl('circle', {
          cx: round2(fx + j(30 + idx, 2)),
          cy: round2(fy + j(50 + idx, 2)),
          r: fr,
          fill: idx % 3 === 0 ? c.xeroxInk : c.foliageShadow,
          opacity: 0.62,
        })
      ),
    ]
  );

  // Dappled woodland canopy assembled with gentle secondary phase sway
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
      gouacheDabWash(shadowDabs, {
        fill: c.foliageShadow,
        wetEdgeColor: c.nightDeepGlade,
        wetEdgeOpacity: 0.26,
        opacity: 0.9,
        seed: variant * 11 + 1,
      }),
      innerBoughs,
      gouacheDabWash(midDabs, {
        fill: c.foliageMid,
        wetEdgeColor: c.foliageShadow,
        wetEdgeOpacity: 0.22,
        highlightFill: c.sageFoliage,
        highlightOpacity: 0.2,
        opacity: 0.88,
        seed: variant * 17 + 3,
      }),
      svgEl(
        'g',
        {
          transform: svgTransform({
            rotate: upperSway,
            pivotX: 0,
            pivotY: -100,
          }),
        },
        [
          gouacheDabWash(litDabs, {
            fill: c.sageFoliage,
            wetEdgeColor: c.oliveCanopy,
            wetEdgeOpacity: 0.16,
            opacity: 0.84,
            seed: variant * 23 + 5,
          }),
          gouacheDabWash(skyPeekDabs, {
            fill: c.nightSkyHorizon,
            wetEdgeOpacity: 0,
            opacity: 0.65,
            seed: variant * 29 + 2,
          }),
        ]
      ),
      foliageFlicks,
    ]
  );

  return svgEl(
    'g',
    {
      'data-prop': 'tree',
      'data-art-style': 'classic_cel',
    },
    [
      groundWash,
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
          gouachePath(trunkBaseD, c.woodMid, { softEdge: true }),
          gouachePath(trunkShadowD, c.woodDark, { softEdge: true, opacity: 0.78 }),
          gouachePath(trunkLitD, c.woodLit, { softEdge: true, opacity: 0.48 }),
          trunkInk,
        ]
      ),
      canopyLayer,
    ]
  );
}

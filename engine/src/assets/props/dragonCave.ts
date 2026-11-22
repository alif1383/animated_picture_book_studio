import { TOKENS, svgUrl } from '../../theme/tokens';
import { getPatternFill } from '../../engine/filters';
import {
  crayonPath,
  crayonStrokeAttrs,
  deterministicJitter,
  round2,
  svgEl,
} from '../../engine/svgUtils';
import type { PropRenderOptions } from './types';

/**
 * Renders the Rugged Picture-Book Rocky Hillside Dragon Cave (`'dragon_cave'`).
 * - Origin `(0, 0)` sits at bottom-center ground contact.
 * - Local SVG bounds: `x: -175..+175, y: -255..+6` (`350 x 261`).
 * - Layered hand-drawn crayon rock dome (`crayonWoodBrown`, `crayonOchre`),
 *   mossy forest-clearing ledges (`crayonGrassGreen`), and flanking stone boulders
 *   (`tabbyGreyBrown`, `paperDeep`) with charcoal fracture lines.
 * - Deep shadowed arched cave entrance (`x: -78..+78, y: -158..0`) filled with
 *   `markerIndigoNight`, subtle inner stone rim, and feathery soot marks above the arch
 *   from the dragon's fiery hiccups.
 * - Tangled thorny bramble bush (`crayonTreeGreen` + `woodBrown` vines & sharp thorns)
 *   nestled at the right base as a storytelling clue for the dragon's toothache.
 */
export function renderDragonCave(options: PropRenderOptions): string {
  const { frameIndex = 0, fillMask } = options;

  const {
    tabbyGreyBrown,
    paperDeep,
    charcoalOutline,
    faintPencil,
    indigoNightDark,
    woodBrown,
    hairBrown,
    grassGreen,
  } = TOKENS.colors;
  const {
    outlineHeavy,
    outlineMedium,
    outlineThin,
    annotationPencil,
  } = TOKENS.strokes;

  // Subtle stepped 6 FPS hand-drawn line-boil jitter anchored firmly at ground level
  const peakJx = round2(deterministicJitter(1, frameIndex, 1.1));
  const peakJy = round2(deterministicJitter(2, frameIndex, 0.9));
  const leftCragJx = round2(deterministicJitter(3, frameIndex, 1.0));
  const rightCragJx = round2(deterministicJitter(4, frameIndex, 1.0));
  const sootJx = round2(deterministicJitter(5, frameIndex, 1.2));
  const sootJy = round2(deterministicJitter(6, frameIndex, 0.8));
  const brambleJx = round2(deterministicJitter(7, frameIndex, 0.9));
  const brambleJy = round2(deterministicJitter(8, frameIndex, 0.7));

  // 1. Main Craggy Rocky Hillside Dome (`crayonWoodBrown`)
  const rockDome = svgEl('g', { 'data-part': 'cave-rock-dome' }, [
    crayonPath(
      [
        'M -172 3',
        `C -170 -36, ${round2(-164 + leftCragJx)} -78, ${round2(-148 + leftCragJx)} -118`,
        `L ${round2(-132 + leftCragJx)} -152`,
        `C ${round2(-118 + leftCragJx)} -178, -96 -202, -72 -222`,
        `L ${round2(-48 + peakJx)} ${round2(-242 + peakJy)}`,
        `C ${round2(-28 + peakJx)} ${round2(-254 + peakJy)}, ${round2(10 + peakJx)} ${round2(-254 + peakJy)}, ${round2(34 + peakJx)} ${round2(-244 + peakJy)}`,
        `L ${round2(74 + rightCragJx)} -226`,
        `C ${round2(104 + rightCragJx)} -202, ${round2(128 + rightCragJx)} -168, ${round2(146 + rightCragJx)} -126`,
        `C ${round2(160 + rightCragJx)} -84, 168 -40, 170 3`,
        'L 78 3 L -78 3 Z',
      ].join(' '),
      getPatternFill('crayonWoodBrown'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
  ]);

  // 2. Layered Sunlit Sandstone / Ochre Crag Strata (`crayonOchre`)
  const ochreStrata = svgEl('g', { 'data-part': 'cave-ochre-strata' }, [
    // Upper craggy sunlit crown ridge
    crayonPath(
      [
        `M ${round2(-104 + leftCragJx * 0.5)} -172`,
        `L ${round2(-74 + peakJx * 0.6)} -214`,
        `L ${round2(-46 + peakJx)} ${round2(-238 + peakJy)}`,
        `C ${round2(-22 + peakJx)} ${round2(-249 + peakJy)}, ${round2(12 + peakJx)} ${round2(-249 + peakJy)}, ${round2(36 + peakJx)} ${round2(-238 + peakJy)}`,
        `L ${round2(72 + rightCragJx * 0.6)} -218`,
        `L ${round2(98 + rightCragJx * 0.5)} -186`,
        'L 66 -178 L 28 -198 L -18 -202 L -64 -188 Z',
      ].join(' '),
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium, mask: fillMask }
    ),
    // Left stepped hillside shoulder slab
    crayonPath(
      [
        'M -154 -78',
        `L ${round2(-138 + leftCragJx * 0.6)} -126`,
        'L -104 -146 L -88 -114 L -116 -92 L -144 -70 Z',
      ].join(' '),
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium, mask: fillMask }
    ),
    // Right stepped hillside shoulder slab
    crayonPath(
      [
        'M 90 -132',
        `L ${round2(126 + rightCragJx * 0.6)} -144`,
        `L ${round2(148 + rightCragJx * 0.5)} -98`,
        'L 132 -66 L 100 -78 L 86 -108 Z',
      ].join(' '),
      getPatternFill('crayonOchre'),
      { strokeWidth: outlineMedium, mask: fillMask }
    ),
  ]);

  // 3. Forest-Clearing Moss & Grass Tufts Perched on High Rock Ledges
  const mossTufts = svgEl('g', { 'data-part': 'cave-moss-tufts' }, [
    crayonPath(
      `M -112 -184 C -106 -198, -90 -202, -78 -194 C -68 -204, -52 -198, -50 -186 C -66 -180, -94 -178, -112 -184 Z`,
      getPatternFill('crayonGrassGreen'),
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      `M 48 -216 C 56 -228, 74 -230, 84 -218 C 94 -222, 106 -212, 102 -202 C 86 -198, 62 -204, 48 -216 Z`,
      getPatternFill('crayonGrassGreen'),
      { strokeWidth: outlineThin, mask: fillMask }
    ),
  ]);

  // 4. Hand-Drawn Rock Fracture Lines & Facet Creases
  const rockFractures = svgEl('g', { 'data-part': 'cave-rock-fractures' }, [
    svgEl('path', {
      d: [
        'M -126 -144 L -108 -126 L -114 -102',
        'M -92 -166 L -74 -154 L -82 -136',
        'M -42 -232 L -32 -210 L -14 -204',
        'M 26 -234 L 18 -212 L 34 -198',
        'M 78 -174 L 94 -156 L 86 -136',
        'M 122 -128 L 110 -106 L 120 -88',
        'M -146 -62 L -126 -54 L -116 -66',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        opacity: 0.72,
      }),
    }),
    svgEl('path', {
      d: [
        'M -134 -96 L -120 -90',
        'M -56 -208 L -38 -200',
        'M 48 -204 L 64 -196',
        'M 116 -76 L 132 -70',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.75,
      }),
    }),
  ]);

  // 5. Tiny Dragon Hiccup Soot Marks Above the Cave Arch (`faintPencil`)
  const sootMarks = svgEl('g', { 'data-part': 'cave-soot-marks' }, [
    // Soft dry-pencil soot smudges drifting upward from the arch crown
    svgEl('path', {
      d: `M -28 -164 C ${round2(-34 + sootJx)} -176, ${round2(-22 + sootJx)} -188, ${round2(-14 + sootJx)} ${round2(-194 + sootJy)} C ${round2(-8 + sootJx)} -182, -16 -170, -18 -162 Z`,
      fill: faintPencil,
      mask: fillMask,
      opacity: 0.32,
      stroke: 'none',
    }),
    svgEl('path', {
      d: `M -6 -165 C ${round2(-10 - sootJx * 0.7)} -180, ${round2(4 + sootJx)} -194, ${round2(8 + sootJx)} ${round2(-202 + sootJy)} C ${round2(16 + sootJx * 0.5)} -188, 10 -174, 6 -164 Z`,
      fill: faintPencil,
      mask: fillMask,
      opacity: 0.38,
      stroke: 'none',
    }),
    svgEl('path', {
      d: `M 20 -161 C ${round2(24 + sootJx)} -172, ${round2(34 + sootJx)} -180, ${round2(36 + sootJx)} ${round2(-188 + sootJy)} C ${round2(26 + sootJx)} -178, 16 -170, 12 -162 Z`,
      fill: faintPencil,
      mask: fillMask,
      opacity: 0.28,
      stroke: 'none',
    }),
    // Delicate hand-sketched soot wisps & scorch ticks
    svgEl('path', {
      d: [
        `M -22 -164 Q ${round2(-26 + sootJx)} -178, ${round2(-18 + sootJx)} ${round2(-190 + sootJy)}`,
        `M 0 -166 Q ${round2(-4 - sootJx * 0.6)} -182, ${round2(5 + sootJx)} ${round2(-198 + sootJy)}`,
        `M 16 -163 Q ${round2(24 + sootJx)} -174, ${round2(30 + sootJx)} ${round2(-184 + sootJy)}`,
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.68,
      }),
    }),
  ]);

  // 6. Deep Shadowed Arched Cave Entrance (`x: -78..+78, y: -158..0`)
  const caveEntrance = svgEl('g', { 'data-part': 'cave-entrance' }, [
    // Rocky brow arch stones hugging the top of the cave mouth
    crayonPath(
      [
        'M -84 2',
        'C -86 -58, -76 -118, -46 -148',
        'C -22 -168, 22 -168, 46 -148',
        'C 76 -118, 86 -58, 84 2',
        'L 76 2',
        'C 76 -54, 68 -110, 40 -140',
        'C 18 -158, -18 -158, -40 -140',
        'C -68 -110, -76 -54, -76 2 Z',
      ].join(' '),
      tabbyGreyBrown,
      { strokeWidth: outlineMedium, mask: fillMask }
    ),
    // Main cavern opening filled with deep indigo marker wash (`x: -78..+78, y: -158..0`)
    crayonPath(
      'M -78 2 C -78 -56, -70 -112, -42 -144 C -18 -163, 18 -163, 42 -144 C 70 -112, 78 -56, 78 2 Z',
      getPatternFill('markerIndigoNight'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Deeper inner cave hollow layer for rich flat picture-book depth (no gradients)
    crayonPath(
      'M -62 2 C -62 -46, -54 -96, -32 -124 C -14 -140, 14 -140, 32 -124 C 54 -96, 62 -46, 62 2 Z',
      indigoNightDark,
      { stroke: 'none', mask: fillMask, opacity: 0.62 }
    ),
    // Subtle inner stone rim & carved arch seam lines (`faintPencil`)
    svgEl('path', {
      d: 'M -71 -2 C -71 -52, -63 -106, -38 -136 C -16 -153, 16 -153, 38 -136 C 63 -106, 71 -52, 71 -2',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: outlineThin,
        opacity: 0.82,
      }),
    }),
    // Stone arch keystone / rim notches around the rocky brow
    svgEl('path', {
      d: [
        'M -82 -44 L -75 -42',
        'M -74 -96 L -66 -92',
        'M -48 -144 L -41 -137',
        'M -14 -162 L -12 -154',
        'M 14 -162 L 12 -154',
        'M 48 -144 L 41 -137',
        'M 74 -96 L 66 -92',
        'M 82 -44 L 75 -42',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.75,
      }),
    }),
    // Warm grounding threshold pebbles at the cave mouth (`y: -4..+4`)
    crayonPath(
      'M -52 3 C -52 -4, -30 -5, -28 3 Z',
      paperDeep,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      'M 22 4 C 22 -3, 44 -4, 46 4 Z',
      paperDeep,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      'M -12 4 C -12 -2, 8 -2, 10 4 Z',
      tabbyGreyBrown,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
  ]);

  // 7. Flanking Rocky Boulder Accents (`tabbyGreyBrown` & `paperDeep`)
  const boulders = svgEl('g', { 'data-part': 'cave-boulders' }, [
    // Large craggy boulder at far-left base (`x: -173..-106`)
    crayonPath(
      'M -173 3 C -173 -24, -162 -52, -140 -62 C -122 -66, -108 -46, -106 -16 L -108 4 Z',
      tabbyGreyBrown,
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Boulder facet crack on large left boulder
    svgEl('path', {
      d: 'M -154 -38 L -136 -28 L -142 -12 M -126 -46 L -118 -26',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        opacity: 0.75,
      }),
    }),
    // Warm-stone secondary boulder nestled beside left cave mouth (`x: -124..-76`)
    crayonPath(
      'M -124 4 C -124 -16, -110 -32, -94 -30 C -80 -28, -74 -12, -76 4 Z',
      paperDeep,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    svgEl('path', {
      d: 'M -108 -16 L -96 -12 L -92 -4',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: faintPencil,
        strokeWidth: annotationPencil,
        opacity: 0.72,
      }),
    }),
    // Right flank craggy boulder partially tucked behind the thorny bramble (`x: 76..126`)
    crayonPath(
      'M 76 4 C 76 -20, 86 -44, 104 -46 C 120 -46, 128 -26, 126 4 Z',
      tabbyGreyBrown,
      { strokeWidth: outlineMedium, mask: fillMask, paperUnderlay: true }
    ),
    svgEl('path', {
      d: 'M 94 -32 L 104 -18 L 96 -8',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        opacity: 0.72,
      }),
    }),
    // Small warm-stone accent rock right at cave mouth corner (`x: 64..92`)
    crayonPath(
      'M 64 5 C 64 -10, 74 -18, 84 -16 C 92 -14, 94 -4, 92 5 Z',
      paperDeep,
      { strokeWidth: outlineThin, mask: fillMask, paperUnderlay: true }
    ),
  ]);

  // 8. Charming Tangled Thorny Bramble Bush at Right Base (`x: 94..173, y: -62..+5`)
  // Visual storytelling clue showing where the dragon got a thorn in his tooth!
  const brambleBush = svgEl('g', { 'data-part': 'cave-bramble-bush' }, [
    // Main scalloped leafy bramble clump (`crayonTreeGreen`)
    crayonPath(
      [
        'M 98 4',
        `C 92 -14, ${round2(98 + brambleJx * 0.5)} -34, 114 -40`,
        `C ${round2(118 + brambleJx)} ${round2(-58 + brambleJy)}, ${round2(142 + brambleJx)} ${round2(-62 + brambleJy)}, 152 -46`,
        `C ${round2(168 + brambleJx * 0.5)} -42, 173 -18, 166 4`,
        'Z',
      ].join(' '),
      getPatternFill('crayonTreeGreen'),
      { strokeWidth: outlineHeavy, mask: fillMask, paperUnderlay: true }
    ),
    // Inner warm leaf puff for storybook depth
    crayonPath(
      `M 112 2 C 110 -14, 122 -30, 138 -30 C 152 -30, 158 -14, 154 2 Z`,
      grassGreen,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    // Tangled woody bramble vines weaving across the bush (`woodBrown`)
    svgEl('path', {
      d: [
        `M 96 -6 C 112 -22, 128 -10, 144 -26 C 154 -36, ${round2(164 + brambleJx)} -28, ${round2(170 + brambleJx)} -36`,
        `M 106 -32 C 122 -46, 138 -34, 156 -48 C 162 -52, ${round2(168 + brambleJx)} ${round2(-50 + brambleJy)}, ${round2(172 + brambleJx)} ${round2(-54 + brambleJy)}`,
        `M 108 2 C 124 -12, 140 -4, 162 -14`,
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: woodBrown,
        strokeWidth: outlineMedium,
      }),
    }),
    // Fine charcoal outline accent along the looping bramble vines
    svgEl('path', {
      d: [
        'M 98 -8 C 114 -24, 128 -12, 144 -28',
        'M 110 -34 C 124 -46, 138 -36, 154 -48',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: annotationPencil,
        opacity: 0.85,
      }),
    }),
    // Little sharp woody thorns poking out along the bramble vines (`woodBrown` + charcoal outline)
    crayonPath('M 104 -18 L 96 -26 L 109 -23 Z', woodBrown, {
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    crayonPath(
      `M 118 -38 L ${round2(114 + brambleJx)} ${round2(-50 + brambleJy)} L 125 -42 Z`,
      woodBrown,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      `M 134 -46 L ${round2(138 + brambleJx)} ${round2(-59 + brambleJy)} L 142 -46 Z`,
      woodBrown,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      `M 152 -46 L ${round2(163 + brambleJx)} ${round2(-56 + brambleJy)} L 158 -40 Z`,
      woodBrown,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath(
      `M 162 -28 L ${round2(173 + brambleJx * 0.5)} -32 L 164 -20 Z`,
      woodBrown,
      { strokeWidth: outlineThin, mask: fillMask }
    ),
    crayonPath('M 128 -18 L 126 -28 L 135 -20 Z', woodBrown, {
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    crayonPath('M 148 -14 L 158 -18 L 152 -8 Z', woodBrown, {
      strokeWidth: outlineThin,
      mask: fillMask,
    }),
    // Tiny fallen woody thorn twig on the ground near the cave path
    svgEl('path', {
      d: 'M 86 3 L 98 1 M 91 2 L 94 -3',
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: hairBrown,
        strokeWidth: outlineThin,
      }),
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dragon_cave',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [
      rockDome,
      ochreStrata,
      mossTufts,
      rockFractures,
      sootMarks,
      caveEntrance,
      boulders,
      brambleBush,
    ]
  );
}

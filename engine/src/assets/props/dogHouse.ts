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
 * Renders a cozy storybook wooden doghouse (`'dog_house'`) sized proportionally
 * for Biscuit (`x: -64..64`, `y: -112..0`, ground at `y = 0`), featuring ochre wood
 * plank walls, a pitched scalloped terracotta crayon roof, a roomy arched charcoal
 * doorway (`50×58px`), and a cream bone-shaped nameplate above the arch.
 */
export function renderDogHouse(options?: PropRenderOptions): string {
  const frameIndex = options?.frameIndex ?? 0;
  const fillMask = options?.fillMask;

  const {
    charcoalOutline,
    faintPencil,
    paperWarm,
    ochreLight,
    terracottaDark,
    woodBrown,
  } = TOKENS.colors;
  const { outlineHeavy, outlineMedium, outlineThin } = TOKENS.strokes;

  // Subtle stop-motion line-boil offsets for hand-drawn warmth
  const boilX = round2(deterministicJitter(3, frameIndex, 0.55));
  const boilY = round2(deterministicJitter(4, frameIndex, 0.45));

  // 1. Cozy Wooden Plank Walls, Corner Trim Posts & Ground Porch Sill
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main gabled front ochre wall body
    crayonPath(
      'M -52 0 L -52 -62 L 0 -104 L 52 -62 L 52 0 Z',
      getPatternFill('crayonOchre'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Subtle sunlit upper plank highlight bands
    svgEl('path', {
      d: 'M -50 -48 L 50 -48 M -50 -32 L 50 -32 M -50 -16 L 50 -16',
      fill: 'none',
      stroke: ochreLight,
      'stroke-width': 2.2,
      'stroke-linecap': 'round',
      opacity: 0.55,
    }),
    // Horizontal hand-drawn clapboard wood plank seams
    svgEl('path', {
      d: [
        'M -35 -75 L 35 -75',
        'M -51 -60 L 51 -60',
        'M -51 -45 L -28 -45 M 28 -45 L 51 -45',
        'M -51 -30 L -28 -30 M 28 -30 L 51 -30',
        'M -51 -15 L -28 -15 M 28 -15 L 51 -15',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        opacity: 0.62,
      }),
    }),
    // Left & right warm wood corner posts
    crayonPath(
      'M -54 0 L -54 -60 L -45 -60 L -45 0 Z',
      getPatternFill('crayonWoodBrown'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    crayonPath(
      'M 45 0 L 45 -60 L 54 -60 L 54 0 Z',
      getPatternFill('crayonWoodBrown'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Sturdy wooden porch base sill resting cleanly at y = 0
    crayonPath(
      'M -58 0 L 58 0 L 56 -6 L -56 -6 Z',
      getPatternFill('crayonWoodBrown'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Tiny wood nail dots on the corner trim posts
    svgEl('circle', { cx: -49.5, cy: -52, r: 1.5, fill: charcoalOutline }),
    svgEl('circle', { cx: -49.5, cy: -12, r: 1.5, fill: charcoalOutline }),
    svgEl('circle', { cx: 49.5, cy: -52, r: 1.5, fill: charcoalOutline }),
    svgEl('circle', { cx: 49.5, cy: -12, r: 1.5, fill: charcoalOutline }),
  ]);

  // 2. Roomy Arched Dark Charcoal Doorway (~50px wide x 58px tall — big enough for Biscuit!)
  const doorway = svgEl('g', { 'data-part': 'doorway' }, [
    // Outer curved wood doorframe trim
    crayonPath(
      'M -29 0 L -29 -33 A 29 29 0 0 1 29 -33 L 29 0 Z',
      getPatternFill('crayonWoodBrown'),
      {
        strokeWidth: outlineMedium,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Deep cozy arched doorway interior (50px wide: -25..25, 58px tall: -58..0)
    crayonPath(
      'M -25 0 L -25 -33 A 25 25 0 0 1 25 -33 L 25 0 Z',
      charcoalOutline,
      {
        strokeWidth: outlineMedium,
      }
    ),
    // Subtle cozy interior wooden floorboards glimpsed at the threshold
    svgEl('path', {
      d: 'M -21 -2 L 21 -2 M -16 -5 L 16 -5',
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': 1.5,
      'stroke-linecap': 'round',
      opacity: 0.75,
    }),
  ]);

  // 3. Cute Cream Bone-Shaped Nameplate mounted above the doorway arch (centered at (0, -76))
  const bx = round2(boilX * 0.35);
  const by = round2(-76 + boilY * 0.35);
  const boneNameplate = svgEl('g', { 'data-part': 'bone-nameplate' }, [
    // Subtle drop shadow line under the mounted wooden bone plaque
    svgEl('path', {
      d: `M ${bx - 12} ${by + 5} L ${bx + 12} ${by + 5}`,
      fill: 'none',
      stroke: woodBrown,
      'stroke-width': 2.4,
      'stroke-linecap': 'round',
      opacity: 0.45,
    }),
    // Plump classic dog-bone plaque silhouette in warm cream
    crayonPath(
      [
        `M ${bx - 11} ${by - 3.5}`,
        `C ${bx - 13} ${by - 7.5}, ${bx - 19} ${by - 6.5}, ${bx - 18.5} ${by - 2}`,
        `C ${bx - 19.5} ${by + 0.2}, ${bx - 19.5} ${by + 0.8}, ${bx - 18.5} ${by + 2}`,
        `C ${bx - 19} ${by + 6.5}, ${bx - 13} ${by + 7.5}, ${bx - 11} ${by + 3.5}`,
        `L ${bx + 11} ${by + 3.5}`,
        `C ${bx + 13} ${by + 7.5}, ${bx + 19} ${by + 6.5}, ${bx + 18.5} ${by + 2}`,
        `C ${bx + 19.5} ${by + 0.8}, ${bx + 19.5} ${by + 0.2}, ${bx + 18.5} ${by - 2}`,
        `C ${bx + 19} ${by - 6.5}, ${bx + 13} ${by - 7.5}, ${bx + 11} ${by - 3.5}`,
        'Z',
      ].join(' '),
      paperWarm,
      {
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
      }
    ),
    // Two tiny mounting tacks + cute hand-drawn squiggly name scribble
    svgEl('circle', { cx: bx - 12.5, cy: by, r: 1.2, fill: charcoalOutline }),
    svgEl('circle', { cx: bx + 12.5, cy: by, r: 1.2, fill: charcoalOutline }),
    svgEl('path', {
      d: `M ${bx - 7} ${by + 0.5} Q ${bx - 3.5} ${by - 1.8}, ${bx} ${by + 0.5} T ${bx + 7} ${by + 0.2}`,
      fill: 'none',
      stroke: faintPencil,
      'stroke-width': 1.4,
      'stroke-linecap': 'round',
    }),
  ]);

  // 4. Pitched Terracotta Crayon Roof with Scalloped Shingles (peak at y = -112, eaves at x = -64..64)
  const roof = svgEl('g', { 'data-part': 'roof' }, [
    // Deep terracotta underside overhang shadow behind the eaves
    crayonPath(
      'M -61 -57 L 0 -106 L 61 -57 L 54 -53 L 0 -95 L -54 -53 Z',
      terracottaDark,
      {
        strokeWidth: outlineThin,
        mask: fillMask,
      }
    ),
    // Main pitched terracotta crayon roof with scalloped eave overhang
    crayonPath(
      [
        'M 0 -112',
        'L 64 -61',
        'Q 59 -53, 52 -57',
        'Q 47 -52, 42 -58',
        'L 0 -94',
        'L -42 -58',
        'Q -47 -52, -52 -57',
        'Q -59 -53, -64 -61',
        'Z',
      ].join(' '),
      getPatternFill('crayonTerracotta'),
      {
        strokeWidth: outlineHeavy,
        mask: fillMask,
        paperUnderlay: true,
      }
    ),
    // Hand-drawn scalloped shingle courses along left & right roof slopes
    svgEl('path', {
      d: [
        'M -56 -64 Q -48 -58, -42 -66 Q -34 -61, -28 -69 Q -20 -64, -14 -72 Q -6 -68, 0 -76',
        'M 56 -64 Q 48 -58, 42 -66 Q 34 -61, 28 -69 Q 20 -64, 14 -72 Q 6 -68, 0 -76',
        'M -42 -77 Q -34 -72, -26 -80 Q -18 -76, -10 -84 Q -4 -81, 0 -87',
        'M 42 -77 Q 34 -72, 26 -80 Q 18 -76, 10 -84 Q 4 -81, 0 -87',
      ].join(' '),
      fill: 'none',
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
        opacity: 0.72,
      }),
    }),
    // Cozy cream dashed bargeboard trim tracing the inner gable slope
    svgEl('path', {
      d: `M -48 -58 L ${round2(boilX * 0.25)} -98 L 48 -58`,
      fill: 'none',
      stroke: paperWarm,
      'stroke-width': 2.2,
      'stroke-dasharray': '5 4',
      'stroke-linecap': 'round',
      opacity: 0.88,
    }),
    // Decorative round roof-ridge finial cap at the apex
    svgEl('circle', {
      cx: 0,
      cy: -108.5,
      r: 3.2,
      fill: terracottaDark,
      ...crayonStrokeAttrs({
        stroke: charcoalOutline,
        strokeWidth: outlineThin,
      }),
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dog_house',
      filter: svgUrl(TOKENS.filters.ids.crayonStroke),
    },
    [walls, doorway, boneNameplate, roof]
  );
}
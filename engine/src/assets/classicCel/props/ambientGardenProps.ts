import { TOKENS } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  deterministicJitter,
  gouacheDabWash,
  pencilFoliageScribbles,
  pencilGrassStrokes,
  round2,
  svgEl,
  svgTransform,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type {
  GouacheDab,
  PencilFoliageCluster,
  PencilGrassTuft,
  WatercolorBlotch,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders soft, cloudy wet-on-wet watercolor sky cloud wisps (`'fluffy_cloud'`)
 * using `watercolorWashBlotches` (organic uneven translucent watercolor clouds,
 * ZERO vector ovals, ZERO digital gradients, ZERO heavy outlines).
 *
 * Footprint: `~x: -82..82, y: -44..14`.
 */
export function renderClassicFluffyCloud(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, lit } = options;
  const isSunlit = lit === true;
  const c = TOKENS.classicCel.colors;

  // Smooth 12 FPS breeze drift
  const drift = steppedOscillate(frameIndex, 48, 4.5, variant * 7);
  const mirror = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  if (isSunlit) {
    // Sunlit wet-on-wet watercolor daylight clouds (parchment-cream puffs + warm board-tooth shadow undersides)
    const sunlitCloudBlotches: WatercolorBlotch[] = [
      // Gentle cool-warm cloud belly washes (ZERO night indigo/teal)
      { cx: round2(-50 + j(1, 4)), cy: 4, rx: 28, ry: 9, fill: c.dayCloudShadow, opacity: 0.56, rotate: -5 },
      { cx: round2(-8 + j(2, 4)), cy: 3, rx: 34, ry: 11, fill: c.boardToothWarm, opacity: 0.54, rotate: 3 },
      { cx: round2(34 + j(3, 4)), cy: 4, rx: 30, ry: 9.5, fill: c.dayCloudShadow, opacity: 0.52, rotate: -4 },
      // Airy mid-cloud sunlit parchment watercolor puffs
      { cx: round2(-42 + j(4, 3)), cy: -8, rx: 24, ry: 13, fill: c.dayCloudLight, opacity: 0.74, rotate: -10 },
      { cx: round2(-14 + j(5, 3)), cy: -22, rx: 28, ry: 17, fill: c.dayCloudLight, opacity: 0.8, rotate: 7 },
      { cx: round2(20 + j(6, 3)), cy: -17, rx: 27, ry: 15, fill: c.dayCloudLight, opacity: 0.78, rotate: -8 },
      { cx: round2(52 + j(7, 3)), cy: -3, rx: 22, ry: 10, fill: c.boardToothWarm, opacity: 0.58, rotate: 8 },
      // Bright sunlit parchment-cream crown highlights
      { cx: round2(-18 + j(8, 3)), cy: -28, rx: 19, ry: 9.5, fill: c.parchmentCream, opacity: 0.76, rotate: -6 },
      { cx: round2(18 + j(9, 3)), cy: -24, rx: 18, ry: 9, fill: c.parchmentCream, opacity: 0.72, rotate: 9 },
      { cx: round2(40 + j(10, 2)), cy: -10, rx: 14, ry: 6.5, fill: c.parchmentCream, opacity: 0.64, rotate: -5 },
    ];

    // Delicate hand-drawn pencil contour wisps suggesting storybook watercolor cloud puffs
    const contourWisps = svgEl('g', { 'data-part': 'cloud-contour-wisps' }, [
      xeroxSketchStroke(
        `M ${round2(-62 + j(11, 2))} -2 Q ${round2(-48 + j(12, 2))} -20, ${round2(-32 + j(13, 2))} -19 Q ${round2(-16 + j(14, 2))} -39, ${round2(4 + j(15, 2))} -31 Q ${round2(24 + j(16, 2))} -36, ${round2(38 + j(17, 2))} -18 Q ${round2(56 + j(18, 2))} -16, ${round2(66 + j(19, 2))} -2`,
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.85,
          broken: true,
          dasharray: '14 6 9 7 12 8',
          feather: true,
          opacity: 0.28,
        }
      ),
      xeroxSketchStroke(
        `M ${round2(-56 + j(20, 2))} 9 Q ${round2(-14 + j(21, 2))} 12, ${round2(24 + j(22, 2))} 10 Q ${round2(46 + j(23, 2))} 11, ${round2(62 + j(24, 2))} 6`,
        {
          stroke: c.dayCloudShadow,
          strokeWidth: 0.9,
          broken: true,
          dasharray: '16 8 10 6',
          opacity: 0.42,
        }
      ),
    ]);

    return svgEl(
      'g',
      {
        'data-prop': 'fluffy_cloud',
        'data-art-style': 'classic_cel',
        transform: svgTransform({ x: drift, scaleX: mirror, scaleY: 1 }),
      },
      [
        watercolorWashBlotches(sunlitCloudBlotches, {
          seed: variant * 17 + 3,
          opacity: 0.94,
          softWash: true,
        }),
        contourWisps,
      ]
    );
  }

  // Uneven, cloudy wet-on-wet watercolor puddles bleeding from indigo underside to pale moonlit silver tops
  const cloudBlotches: WatercolorBlotch[] = [
    // Muted indigo-slate underside washes
    { cx: round2(-50 + j(1, 4)), cy: 4, rx: 28, ry: 9, fill: c.nightSkyMid, opacity: 0.44, rotate: -5 },
    { cx: round2(-8 + j(2, 4)), cy: 2, rx: 34, ry: 11, fill: c.nightSkyHorizon, opacity: 0.42, rotate: 3 },
    { cx: round2(34 + j(3, 4)), cy: 4, rx: 30, ry: 9.5, fill: c.nightSkyMid, opacity: 0.42, rotate: -4 },
    // Mid-cloud wispy twilight teal & slate-blue puddles
    { cx: round2(-42 + j(4, 3)), cy: -8, rx: 24, ry: 13, fill: c.nightMistTeal, opacity: 0.4, rotate: -10 },
    { cx: round2(-14 + j(5, 3)), cy: -22, rx: 28, ry: 17, fill: c.slateBlue, opacity: 0.45, rotate: 7 },
    { cx: round2(20 + j(6, 3)), cy: -17, rx: 27, ry: 15, fill: c.nightMistTeal, opacity: 0.42, rotate: -8 },
    { cx: round2(52 + j(7, 3)), cy: -3, rx: 22, ry: 10, fill: c.slateBlue, opacity: 0.34, rotate: 8 },
    // Soft upper moonlit silver-parchment watercolor dabs
    { cx: round2(-18 + j(8, 3)), cy: -28, rx: 19, ry: 9.5, fill: c.mochiFurRim, opacity: 0.38, rotate: -6 },
    { cx: round2(18 + j(9, 3)), cy: -24, rx: 18, ry: 9, fill: c.nightcapStripe, opacity: 0.34, rotate: 9 },
    { cx: round2(40 + j(10, 2)), cy: -10, rx: 14, ry: 6.5, fill: c.parchmentCream, opacity: 0.22, rotate: -5 },
  ];

  return svgEl(
    'g',
    {
      'data-prop': 'fluffy_cloud',
      'data-art-style': 'classic_cel',
      transform: svgTransform({ x: drift, scaleX: mirror, scaleY: 1 }),
    },
    [
      watercolorWashBlotches(cloudBlotches, {
        seed: variant * 17 + 3,
        opacity: 0.92,
      }),
    ]
  );
}

/**
 * Renders delicate painted parchment pinprick dots and tiny hand-drawn 4-point cross
 * glints (`'star_cluster'`) with gentle 12 FPS twinkle (NO digital neon blur halos!).
 *
 * Footprint: `~1200×310`, respects `count` & `variant`.
 */
export function renderClassicStarCluster(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;

  const starCount = Math.max(0, count ?? 24);
  const starElements: string[] = [];

  for (let i = 0; i < starCount; i++) {
    const sx = round2(
      ((i * 137 + variant * 53) % 1200) + deterministicJitter(i, variant, 14)
    );
    const sy = round2(
      ((i * 89 + variant * 29) % 310) + deterministicJitter(i + 19, variant, 10)
    );

    const period = 20 + (i % 4) * 8;
    const wave = steppedOscillate(frameIndex, period, 1, i * 5 + variant * 3);
    const twinkleScale = round2(0.84 + (wave + 1) * 0.15);
    const twinkleAlpha = round2(0.5 + (wave + 1) * 0.22);

    if (i % 4 === 0) {
      const armV = round2((i % 8 === 0 ? 6.8 : 4.8) * twinkleScale);
      const armH = round2(armV * 0.88);
      const tilt = round2(deterministicJitter(i + 7, variant, 4));
      starElements.push(
        svgEl(
          'g',
          {
            transform: svgTransform({ x: sx, y: sy, rotate: tilt }),
            opacity: twinkleAlpha,
          },
          [
            svgEl('circle', {
              cx: 0,
              cy: 0,
              r: round2(armV * 0.28),
              fill: c.antiqueGold,
              opacity: 0.38,
            }),
            svgEl('path', {
              d: `M 0 ${round2(-armV)} L 0 ${armV} M ${round2(-armH)} 0 L ${armH} 0`,
              fill: 'none',
              stroke: c.starGlow,
              'stroke-width': 1.05,
              'stroke-linecap': 'round',
            }),
            svgEl('circle', {
              cx: 0,
              cy: 0,
              r: round2(1.25 * twinkleScale),
              fill: c.parchmentCream,
            }),
          ]
        )
      );
    } else if (i % 4 === 2) {
      const r = round2(1.85 * twinkleScale);
      starElements.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r,
          fill: i % 3 === 0 ? c.parchmentCream : c.starGlow,
          opacity: twinkleAlpha,
        })
      );
    } else {
      const r = round2((0.95 + (i % 3) * 0.28) * twinkleScale);
      starElements.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r,
          fill: i % 5 === 1 ? c.mochiFurRim : c.parchmentCream,
          opacity: round2(twinkleAlpha * 0.84),
        })
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'star_cluster',
      'data-art-style': 'classic_cel',
    },
    [svgEl('g', { 'data-part': 'star-cores' }, starElements)]
  );
}

/**
 * Renders soft `watercolorWashBlotches` leafy clumps + crisp `pencilFoliageScribbles`
 * tiny bush ticks + loose `pencilGrassStrokes` & hand-inked stems + painterly wildflower
 * dabs (`'meadow_flowers'`).
 *
 * Footprint: `~x: -585..590, y: 3..175`.
 */
export function renderClassicMeadowFlowers(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, lit } = options;
  const isSunlit = lit === true;
  const c = TOKENS.classicCel.colors;

  const foliageTufts: ReadonlyArray<readonly [number, number]> = [
    [-580, 55], [-515, 115], [-465, 165], [-420, 40], [-360, 15],
    [-310, 85], [-260, 130], [-220, 50], [-180, 165], [-140, 120],
    [-90, 175], [-20, 150], [45, 160], [120, 170], [210, 165],
    [275, 115], [340, 155], [395, 95], [435, 150], [-390, 155],
    [-320, 170], [85, 120], [320, 60], [485, 110], [535, 160], [585, 75],
  ];

  const blossoms: ReadonlyArray<
    readonly [number, number, 'moon' | 'blue' | 'rose']
  > = [
    [-540, 95, 'moon'], [-455, 76, 'blue'], [-115, 78, 'rose'],
    [-82, 118, 'moon'], [52, 68, 'blue'], [68, 108, 'moon'],
    [155, 86, 'rose'], [198, 62, 'moon'], [230, 96, 'blue'],
    [335, 112, 'moon'], [380, 74, 'rose'], [412, 122, 'blue'],
    [495, 88, 'moon'], [560, 132, 'rose'],
  ];

  // Soft wet-on-wet watercolor leafy clumps beneath tufts & wildflowers
  const leafyClumpBlotches: WatercolorBlotch[] = isSunlit
    ? [
        ...foliageTufts
          .filter((_, i) => i % 2 === 0)
          .map(([tx, ty], i): WatercolorBlotch => ({
            cx: tx,
            cy: ty + 1,
            rx: round2(18 + (i % 3) * 5),
            ry: 6.5,
            fill:
              i % 3 === 0
                ? c.dayFoliageMid
                : i % 3 === 1
                  ? c.dayMeadowMid
                  : c.dayFoliageLit,
            opacity: 0.54,
            rotate: round2(deterministicJitter(i, variant, 10)),
          })),
        ...blossoms.map(([dx, dy], i): WatercolorBlotch => ({
          cx: dx,
          cy: dy + 11,
          rx: 15,
          ry: 6.5,
          fill: i % 2 === 0 ? c.dayFoliageMid : c.dayMeadowMid,
          opacity: 0.56,
          rotate: round2(deterministicJitter(i + 20, variant, 12)),
        })),
      ]
    : [
        ...foliageTufts
          .filter((_, i) => i % 2 === 0)
          .map(([tx, ty], i): WatercolorBlotch => ({
            cx: tx,
            cy: ty + 1,
            rx: round2(18 + (i % 3) * 5),
            ry: 6.5,
            fill: i % 3 === 0 ? c.foliageShadow : i % 3 === 1 ? c.oliveCanopy : c.grassNightDeep,
            opacity: 0.42,
            rotate: round2(deterministicJitter(i, variant, 10)),
          })),
        ...blossoms.map(([dx, dy], i): WatercolorBlotch => ({
          cx: dx,
          cy: dy + 11,
          rx: 15,
          ry: 6.5,
          fill: i % 2 === 0 ? c.foliageShadow : c.oliveCanopy,
          opacity: 0.48,
          rotate: round2(deterministicJitter(i + 20, variant, 12)),
        })),
      ];

  // Expressive slanted hand-drawn pencil grass strokes scattered across foliage tufts
  const meadowGrassTufts: PencilGrassTuft[] = foliageTufts.map(([tx, ty], i) => {
    const breeze = steppedOscillate(frameIndex, 36, 0.08, i * 3 + variant * 2);
    const leanDir = i % 3 === 0 ? -0.35 : 0.4;
    return {
      x: tx,
      y: ty,
      width: round2(18 + (i % 3) * 5),
      height: round2(8 + (i % 3) * 2.5),
      blades: 3 + (i % 3),
      lean: round2(leanDir + breeze),
      groundDash: i % 2 === 0,
      pebbles: i % 3 === 0,
      stroke: isSunlit
        ? i % 2 === 0
          ? c.xeroxInkSoft
          : c.pencilOliveCharcoal
        : i % 2 === 0
          ? c.xeroxInk
          : c.pencilOliveCharcoal,
      opacity: 0.78,
      seed: variant * 17 + i * 5,
    };
  });

  // Tiny bush pencil scribbles nestled around flower clumps
  const bushTickClusters: PencilFoliageCluster[] = blossoms
    .filter((_, i) => i % 2 === 0)
    .map(([dx, dy], i) => ({
      cx: dx,
      cy: dy + 11,
      rx: 13,
      ry: 5.5,
      density: 0.75,
      stroke: c.pencilOliveCharcoal,
      opacity: 0.72,
      seed: variant * 23 + i * 7,
    }));

  const stemParts: string[] = [];
  const flowerPetalDabs: GouacheDab[] = [];
  const flowerCenters: string[] = [];

  for (let i = 0; i < blossoms.length; i++) {
    const [dx, dy, kind] = blossoms[i];
    const sway = round2(
      steppedOscillate(frameIndex, 32, 1.4, i * 4 + variant * 5)
    );
    const jx = round2(deterministicJitter(i * 3 + 1, variant, 1.5));

    const petalColor =
      kind === 'moon'
        ? c.flowerCream
        : kind === 'blue'
          ? c.flowerBlue
          : c.dustyRose;
    const petalAccent =
      kind === 'moon'
        ? c.parchmentCream
        : kind === 'blue'
          ? c.slateBlue
          : c.flowerRose;

    const fx = round2(dx + sway * 0.45);
    flowerPetalDabs.push(
      { cx: round2(fx - 3.2), cy: round2(dy - 1.4), rx: 4.2, ry: 3.4, rotate: -18, fill: petalColor, opacity: 0.85 },
      { cx: round2(fx + 3.0), cy: round2(dy - 1.1), rx: 4.0, ry: 3.2, rotate: 16, fill: petalAccent, opacity: 0.82 },
      { cx: round2(fx + jx * 0.4), cy: round2(dy + 2.2), rx: 3.8, ry: 3.0, rotate: 4, fill: petalColor, opacity: 0.8 }
    );

    stemParts.push(
      xeroxSketchStroke(
        `M ${dx} ${dy + 12} Q ${round2(dx + sway * 0.35)} ${dy + 6}, ${fx} ${dy + 1} M ${dx - 1} ${dy + 11} Q ${dx - 6} ${dy + 7}, ${dx - 9} ${dy + 8} M ${dx + 1} ${dy + 11} Q ${dx + 6} ${dy + 7}, ${dx + 8} ${dy + 9}`,
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.95,
          opacity: 0.72,
        }
      ),
      xeroxSketchStroke(
        `M ${round2(fx - 4.4)} ${round2(dy + 2.5)} Q ${fx} ${round2(dy + 5.1)}, ${round2(fx + 4.4)} ${round2(dy + 2)}`,
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.8,
          opacity: 0.6,
        }
      )
    );

    flowerCenters.push(
      svgEl('circle', {
        cx: round2(fx + 0.3),
        cy: round2(dy - 0.2),
        r: kind === 'rose' ? 1.3 : 1.7,
        fill: kind === 'moon' ? c.antiqueGold : c.starGlow,
        opacity: 0.86,
      })
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'meadow_flowers',
      'data-art-style': 'classic_cel',
    },
    [
      watercolorWashBlotches(leafyClumpBlotches, {
        seed: variant * 13 + 2,
        opacity: 0.86,
      }),
      pencilFoliageScribbles(bushTickClusters, {
        stroke: c.pencilOliveCharcoal,
        strokeWidth: 1.0,
        opacity: 0.72,
        seed: variant * 29 + 3,
        includeTwigs: false,
        includeDots: true,
      }),
      pencilGrassStrokes(meadowGrassTufts, {
        stroke: c.xeroxInkSoft,
        strokeWidth: 1.05,
        opacity: 0.76,
        seed: variant * 31 + 1,
      }),
      svgEl('g', { 'data-part': 'flower-stems-ink' }, stemParts),
      gouacheDabWash(flowerPetalDabs, {
        fill: c.flowerCream,
        wetEdgeColor: c.xeroxInkSoft,
        wetEdgeOpacity: 0.16,
        opacity: 0.92,
        seed: variant * 19 + 7,
      }),
      svgEl('g', { 'data-part': 'flower-centers' }, flowerCenters),
    ]
  );
}

/**
 * Renders unmistakably *Robin Hood* (1973)-style **hand-drawn pencil grass over blotchy
 * wet-on-wet watercolor ground washes** (`'grass_patch'`):
 * - 6 soft overlapping `watercolorWashBlotches` (pale warm moonlit ochre-sage highlights
 *   + darker olive/teal shadow streaks so ground tone shifts organically).
 * - Generous, expressive `pencilGrassStrokes` clusters across the footprint (slanted
 *   diagonal graphite pencil hatch ticks, varied lengths & angles, crooked blades,
 *   horizontal ground-shadow dashes, and scattered tiny dark pebble dots, seeded by `variant`).
 *
 * Footprint: `~x: -180..190, y: -26..56`, respects `variant`.
 */
export function renderClassicGrassPatch(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, lit } = options;
  const isSunlit = lit === true;
  const c = TOKENS.classicCel.colors;

  const mirror = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // 6 soft overlapping wet-on-wet watercolor ground washes
  const groundBlotches: WatercolorBlotch[] = isSunlit
    ? [
        { cx: round2((-128 + j(1, 12)) * mirror), cy: 20, rx: 46, ry: 13, fill: c.dayMeadowShadow, opacity: 0.42, rotate: -4 },
        { cx: round2((-54 + j(2, 12)) * mirror), cy: 12, rx: 44, ry: 12, fill: c.ochreEarth, opacity: 0.34, rotate: 3 },
        { cx: round2((12 + j(3, 12)) * mirror), cy: 32, rx: 52, ry: 13, fill: c.dayMeadowMid, opacity: 0.46, rotate: -2 },
        { cx: round2((78 + j(4, 12)) * mirror), cy: 16, rx: 44, ry: 12, fill: c.dayMeadowLight, opacity: 0.48, rotate: 4 },
        { cx: round2((136 + j(5, 10)) * mirror), cy: 30, rx: 40, ry: 11, fill: c.dayMeadowShadow, opacity: 0.4, rotate: -5 },
        { cx: round2((-16 + j(6, 14)) * mirror), cy: 22, rx: 38, ry: 10, fill: c.dayMeadowLight, opacity: 0.42, rotate: 2 },
      ]
    : [
        { cx: round2((-128 + j(1, 12)) * mirror), cy: 20, rx: 46, ry: 13, fill: c.foliageShadow, opacity: 0.36, rotate: -4 },
        { cx: round2((-54 + j(2, 12)) * mirror), cy: 12, rx: 44, ry: 12, fill: c.ochreEarth, opacity: 0.24, rotate: 3 },
        { cx: round2((12 + j(3, 12)) * mirror), cy: 32, rx: 52, ry: 13, fill: c.oliveCanopy, opacity: 0.34, rotate: -2 },
        { cx: round2((78 + j(4, 12)) * mirror), cy: 16, rx: 44, ry: 12, fill: c.sageFoliage, opacity: 0.28, rotate: 4 },
        { cx: round2((136 + j(5, 10)) * mirror), cy: 30, rx: 40, ry: 11, fill: c.grassNightDeep, opacity: 0.36, rotate: -5 },
        { cx: round2((-16 + j(6, 14)) * mirror), cy: 22, rx: 38, ry: 10, fill: c.foliageRim, opacity: 0.22, rotate: 2 },
      ];

  // 9 expressive, irregularly spaced Robin Hood pencil grass tuft clusters across the footprint
  const basePositions: ReadonlyArray<readonly [number, number, number, number]> = [
    [-154, 18, 28, 12],
    [-112, 38, 32, 14],
    [-76, 6, 26, 11],
    [-34, 28, 34, 15],
    [8, 12, 28, 12],
    [48, 42, 32, 14],
    [92, 16, 30, 13],
    [132, 34, 30, 13],
    [164, 10, 24, 11],
  ];

  const primaryTufts: PencilGrassTuft[] = basePositions.map(
    ([bx, by, w, h], idx) => {
      const x = round2(
        Math.max(-170, Math.min(176, (bx + j(10 + idx * 3, 12)) * mirror))
      );
      const y = round2(
        Math.max(0, Math.min(48, by + j(11 + idx * 3, 7)))
      );
      const breeze = steppedOscillate(
        frameIndex,
        34,
        0.09,
        variant * 5 + idx * 4
      );
      const baseLean = (idx % 3 === 0 ? -0.36 : 0.44) * mirror;
      return {
        x,
        y,
        width: round2(w + j(12 + idx * 3, 5)),
        height: round2(Math.min(22, h + Math.abs(j(40 + idx, 5)))),
        blades: 5 + ((idx + variant) % 3),
        lean: round2(baseLean + breeze),
        groundDash: true,
        pebbles: true,
        stroke: isSunlit
          ? idx % 3 === 0
            ? c.xeroxInkSoft
            : c.pencilOliveCharcoal
          : idx % 3 === 0
            ? c.xeroxInk
            : c.pencilOliveCharcoal,
        opacity: isSunlit
          ? round2(0.78 + (idx % 2) * 0.08)
          : round2(0.84 + (idx % 2) * 0.08),
        seed: variant * 19 + idx * 7,
      };
    }
  );

  // Secondary sparse dark graphite accent ticks & horizontal ground-shadow dashes for rich depth
  const accentTufts: PencilGrassTuft[] = [
    {
      x: round2((-94 + j(61, 10)) * mirror),
      y: 26,
      width: 24,
      height: 9,
      blades: 3,
      lean: round2(0.5 * mirror),
      groundDash: true,
      pebbles: true,
      stroke: isSunlit ? c.pencilOliveCharcoal : c.xeroxInk,
      opacity: isSunlit ? 0.74 : 0.78,
      seed: variant * 29 + 3,
    },
    {
      x: round2((26 + j(62, 10)) * mirror),
      y: 24,
      width: 26,
      height: 10,
      blades: 4,
      lean: round2(-0.42 * mirror),
      groundDash: true,
      pebbles: true,
      stroke: isSunlit ? c.xeroxInkSoft : c.xeroxInk,
      opacity: isSunlit ? 0.76 : 0.8,
      seed: variant * 29 + 7,
    },
    {
      x: round2((114 + j(63, 10)) * mirror),
      y: 44,
      width: 22,
      height: 8,
      blades: 3,
      lean: round2(0.38 * mirror),
      groundDash: true,
      pebbles: true,
      stroke: c.xeroxInkSoft,
      opacity: isSunlit ? 0.7 : 0.74,
      seed: variant * 29 + 11,
    },
  ];

  return svgEl(
    'g',
    {
      'data-prop': 'grass_patch',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('g', { 'data-part': 'grass-ground-washes' }, [
        watercolorWashBlotches(groundBlotches, {
          seed: variant * 17 + 4,
          opacity: isSunlit ? 0.9 : 0.86,
          softWash: true,
        }),
      ]),
      svgEl('g', { 'data-part': 'grass-blades' }, [
        pencilGrassStrokes(primaryTufts, {
          stroke: isSunlit ? c.pencilOliveCharcoal : c.xeroxInk,
          strokeWidth: 1.3,
          opacity: isSunlit ? 0.84 : 0.88,
          seed: variant * 23 + 1,
        }),
        pencilGrassStrokes(accentTufts, {
          stroke: isSunlit ? c.xeroxInkSoft : c.pencilOliveCharcoal,
          strokeWidth: 1.1,
          opacity: isSunlit ? 0.76 : 0.8,
          seed: variant * 31 + 5,
        }),
      ]),
    ]
  );
}

/**
 * Renders hand-inked flat antique-gold cel musical eighth and beamed notes
 * (`'music_notes'`) using `celPath` with raw `#xerox-ink` outlines (NO digital neon glow!),
 * drifting smoothly upward at 12 FPS with tiny hand-sketched sparkle ticks.
 *
 * Respects `count` & `variant`.
 */
export function renderClassicMusicNotes(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const activeCount = Math.max(0, count ?? 3);
  const inkedNotes: string[] = [];

  for (let i = 0; i < activeCount; i++) {
    const drift = steppedLoopProgress(frameIndex, 24, i * 6);
    const nx = round2(
      i * 18 +
        drift * 14 +
        steppedOscillate(frameIndex, 24, 3.2, i * 5) +
        deterministicJitter(i, variant, 4)
    );
    const ny = round2(-i * 34 - drift * 24);
    const tilt = steppedOscillate(frameIndex, 18, 7.5, i * 4);
    const noteTransform = svgTransform({ x: nx, y: ny, rotate: tilt });

    if (i % 2 === 0) {
      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          celPath(
            'M 3.6 -1 L 3.6 -22 C 9.5 -20, 14.5 -14.5, 13.2 -8.5 C 12 -12.5, 8.8 -15.5, 5.8 -16.8 L 5.8 -1 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          celPath(
            'M -5.4 1.6 C -6.4 -1.4, -3.2 -4.4, 0.8 -4.2 C 4.8 -4.0, 6.2 -1.2, 5.0 1.4 C 3.8 4.0, -0.8 5.0, -3.6 3.6 C -4.6 3.1, -5.1 2.4, -5.4 1.6 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          svgEl('circle', {
            cx: -1.5,
            cy: -1.0,
            r: 1.35,
            fill: c.mochiGoldHighlight,
          }),
          xeroxSketchStroke('M -10 2.5 L -10 7.5 M -12.5 5 L -7.5 5', {
            stroke: c.parchmentCream,
            strokeWidth: 0.9,
            opacity: 0.78,
          }),
        ])
      );
    } else {
      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          xeroxSketchStroke(
            'M -1.4 1 L -1.4 -20.5 M 13.6 -2 L 13.6 -23.5',
            {
              stroke: c.xeroxInk,
              strokeWidth: 2.2,
              opacity: 0.96,
            }
          ),
          celPath(
            'M -2.2 -21.2 L 14.4 -24.2 L 14.4 -19.8 L -2.2 -16.8 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
          ),
          celPath(
            'M -2.0 -14.8 L 14.2 -17.8 L 14.2 -15.4 L -2.0 -12.4 Z',
            c.mochiGoldHighlight,
            { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
          ),
          celPath(
            'M -11.0 3.4 C -11.9 0.6, -8.9 -2.2, -5.1 -2.0 C -1.4 -1.8, -0.1 0.8, -1.2 3.3 C -2.3 5.8, -6.6 6.7, -9.3 5.3 C -10.3 4.8, -10.7 4.1, -11.0 3.4 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          celPath(
            'M 4.0 0.4 C 3.1 -2.4, 6.1 -5.2, 9.9 -5.0 C 13.6 -4.8, 14.9 -2.2, 13.8 0.3 C 12.7 2.8, 8.4 3.7, 5.7 2.3 C 4.7 1.8, 4.3 1.1, 4.0 0.4 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          svgEl('circle', { cx: -7.2, cy: 0.9, r: 1.25, fill: c.mochiGoldHighlight }),
          svgEl('circle', { cx: 7.8, cy: -2.1, r: 1.25, fill: c.mochiGoldHighlight }),
          xeroxSketchStroke('M 17 -14.5 L 17 -9.5 M 14.5 -12 L 19.5 -12', {
            stroke: c.parchmentCream,
            strokeWidth: 0.9,
            opacity: 0.78,
          }),
        ])
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'music_notes',
      'data-art-style': 'classic_cel',
    },
    [svgEl('g', { 'data-part': 'music-notes-ink' }, inkedNotes)]
  );
}

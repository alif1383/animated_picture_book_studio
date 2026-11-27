import { TOKENS } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  deterministicJitter,
  gouacheDabWash,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { GouacheDab } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders soft, loose, translucent painted watercolor sky cloud wisps (`'fluffy_cloud'`)
 * using `gouacheDabWash` (NO crisp oval cloud cutouts, NO digital gradients, NO heavy outlines).
 *
 * Footprint: `~x: -82..82, y: -44..14`.
 */
export function renderClassicFluffyCloud(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;

  // Smooth 12 FPS nocturnal breeze drift
  const drift = steppedOscillate(frameIndex, 48, 4.5, variant * 7);
  const mirror = variant % 2 === 0 ? -1 : 1;
  const j = (idx: number, amp: number): number =>
    round2(deterministicJitter(idx, variant, amp));

  // Translucent slate-indigo underside watercolor wash
  const underDabs: GouacheDab[] = [
    { cx: round2(-52 + j(1, 4)), cy: 4, rx: 26, ry: 8.5, rotate: -4, fill: c.nightSkyMid, opacity: 0.48 },
    { cx: round2(-14 + j(2, 4)), cy: 2, rx: 32, ry: 10.5, rotate: 2, fill: c.nightSkyHorizon, opacity: 0.44 },
    { cx: round2(28 + j(3, 4)), cy: 3.5, rx: 28, ry: 9, rotate: -3, fill: c.nightSkyMid, opacity: 0.46 },
    { cx: round2(58 + j(4, 3)), cy: 6, rx: 20, ry: 6.5, rotate: 4, fill: c.nightSkyHorizon, opacity: 0.34 },
  ];

  // Mid-layer loose silver-slate watercolor cloud brush-dabs
  const midDabs: GouacheDab[] = [
    { cx: round2(-44 + j(5, 3)), cy: -7, rx: 22, ry: 12, rotate: -10, fill: c.nightMistTeal, opacity: 0.42 },
    { cx: round2(-16 + j(6, 3)), cy: -22, rx: 26, ry: 16, rotate: 6, fill: c.slateBlue, opacity: 0.48 },
    { cx: round2(18 + j(7, 3)), cy: -18, rx: 25, ry: 15, rotate: -8, fill: c.nightMistTeal, opacity: 0.45 },
    { cx: round2(46 + j(8, 3)), cy: -4, rx: 21, ry: 11, rotate: 9, fill: c.slateBlue, opacity: 0.4 },
    { cx: round2(-66 + j(9, 2)), cy: 1, rx: 14, ry: 6, rotate: -6, fill: c.nightMistTeal, opacity: 0.28 },
  ];

  // Delicate moonlit silver-parchment top wisp dabs
  const topDabs: GouacheDab[] = [
    { cx: round2(-20 + j(10, 3)), cy: -28, rx: 17, ry: 9, rotate: -7, fill: c.mochiFurRim, opacity: 0.38 },
    { cx: round2(16 + j(11, 3)), cy: -24, rx: 16, ry: 8.5, rotate: 8, fill: c.nightcapStripe, opacity: 0.34 },
    { cx: round2(-42 + j(12, 2)), cy: -13, rx: 12, ry: 6.5, rotate: -12, fill: c.mochiFurRim, opacity: 0.3 },
    { cx: round2(40 + j(13, 2)), cy: -11, rx: 12, ry: 6, rotate: 11, fill: c.parchmentCream, opacity: 0.24 },
  ];

  return svgEl(
    'g',
    {
      'data-prop': 'fluffy_cloud',
      'data-art-style': 'classic_cel',
      transform: svgTransform({ x: drift, scaleX: mirror, scaleY: 1 }),
    },
    [
      gouacheDabWash(underDabs, {
        fill: c.nightSkyHorizon,
        wetEdgeColor: c.nightSkyMid,
        wetEdgeOpacity: 0.16,
        opacity: 0.85,
        seed: variant * 11 + 1,
      }),
      gouacheDabWash(midDabs, {
        fill: c.nightMistTeal,
        wetEdgeColor: c.slateBlue,
        wetEdgeOpacity: 0.14,
        opacity: 0.88,
        seed: variant * 17 + 3,
      }),
      gouacheDabWash(topDabs, {
        fill: c.mochiFurRim,
        wetEdgeOpacity: 0,
        opacity: 0.78,
        seed: variant * 23 + 5,
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

    // Smooth 12 FPS twinkle wave unique per star
    const period = 20 + (i % 4) * 8;
    const wave = steppedOscillate(frameIndex, period, 1, i * 5 + variant * 3);
    const twinkleScale = round2(0.84 + (wave + 1) * 0.15);
    const twinkleAlpha = round2(0.5 + (wave + 1) * 0.22);

    if (i % 4 === 0) {
      // Tiny hand-drawn 4-point parchment cross glint (slight organic asymmetry, NO Gaussian neon blur!)
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
            // Very subtle tiny painted parchment-gold speck right at core
            svgEl('circle', {
              cx: 0,
              cy: 0,
              r: round2(armV * 0.28),
              fill: c.antiqueGold,
              opacity: 0.38,
            }),
            // Hand-drawn 4-point cross strokes
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
      // Soft painted parchment star dot
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
      // Delicate painted pinprick star
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
 * Renders loose painterly wildflower dabs (`'meadow_flowers'`) using `gouacheDabWash`
 * (dusty cream, dusty rose, and slate-blue nocturnal petals over soft olive foliage
 * washes) with sketchy hand-inked stems and leaf ticks (`xeroxSketchStroke`).
 *
 * Footprint: `~x: -585..590, y: 3..175`.
 */
export function renderClassicMeadowFlowers(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
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

  // Collect soft foliage ground washes into one gouacheDabWash for painterly cohesion
  const tuftWashes: GouacheDab[] = foliageTufts.map(([tx, ty], i) => ({
    cx: tx,
    cy: ty + 1,
    rx: round2(8 + (i % 3) * 2.5),
    ry: 3.4,
    rotate: round2(deterministicJitter(i, variant, 8)),
    fill: i % 2 === 0 ? c.foliageShadow : c.oliveCanopy,
    opacity: 0.42,
  }));

  const stemAndFlickParts: string[] = [];

  // Sparse sketchy hand-inked grass & leaf flicks at each tuft (Robin Hood meadow style)
  for (let i = 0; i < foliageTufts.length; i++) {
    const [tx, ty] = foliageTufts[i];
    const lean = round2(
      steppedOscillate(frameIndex, 36, 1.1, i * 3 + variant * 2) +
        deterministicJitter(i, variant, 1.8)
    );
    const h1 = round2(8 + (i % 3) * 2.5);
    const h2 = round2(6 + ((i + 1) % 3) * 2);
    stemAndFlickParts.push(
      xeroxSketchStroke(
        `M ${round2(tx - 3)} ${ty} Q ${round2(tx - 5 + lean)} ${round2(ty - h2 * 0.6)}, ${round2(tx - 7 + lean)} ${round2(ty - h2)} M ${tx} ${ty} Q ${round2(tx + lean * 0.6)} ${round2(ty - h1 * 0.6)}, ${round2(tx + 1 + lean)} ${round2(ty - h1)} M ${round2(tx + 3)} ${ty} Q ${round2(tx + 6 + lean)} ${round2(ty - h2 * 0.5)}, ${round2(tx + 8 + lean)} ${round2(ty - h2 + 1)}`,
        {
          stroke: i % 3 === 0 ? c.xeroxInk : c.xeroxInkSoft,
          strokeWidth: 0.95,
          opacity: 0.66,
        }
      )
    );
  }

  // Loose painterly wildflower petal dabs + dark leaf washes + hand-inked stems
  const flowerLeafWashes: GouacheDab[] = [];
  const flowerPetalDabs: GouacheDab[] = [];
  const flowerCenters: string[] = [];

  for (let i = 0; i < blossoms.length; i++) {
    const [dx, dy, kind] = blossoms[i];
    const sway = round2(
      steppedOscillate(frameIndex, 32, 1.5, i * 4 + variant * 5)
    );
    const jx = round2(deterministicJitter(i * 3 + 1, variant, 1.6));

    // Soft dark foliage dab beneath blossom
    flowerLeafWashes.push({
      cx: dx,
      cy: dy + 11,
      rx: 10.5,
      ry: 4.5,
      rotate: round2(deterministicJitter(i, variant, 10)),
      fill: i % 2 === 0 ? c.foliageShadow : c.oliveCanopy,
      opacity: 0.56,
    });

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

    // 3 loose overlapping watercolor petal dabs (organic painterly wildflower cluster, NOT stiff daisies!)
    const fx = round2(dx + sway * 0.45);
    flowerPetalDabs.push(
      { cx: round2(fx - 3.2), cy: round2(dy - 1.5), rx: 4.2, ry: 3.4, rotate: -18, fill: petalColor, opacity: 0.84 },
      { cx: round2(fx + 3.0), cy: round2(dy - 1.2), rx: 4.0, ry: 3.3, rotate: 16, fill: petalAccent, opacity: 0.8 },
      { cx: round2(fx + jx * 0.4), cy: round2(dy + 2.2), rx: 3.8, ry: 3.0, rotate: 4, fill: petalColor, opacity: 0.78 }
    );

    // Sketchy hand-inked stem, tiny sepal, and leaf ticks
    stemAndFlickParts.push(
      xeroxSketchStroke(
        `M ${dx} ${dy + 12} Q ${round2(dx + sway * 0.35)} ${dy + 6}, ${fx} ${dy + 1} M ${dx - 1} ${dy + 11} Q ${dx - 6} ${dy + 7}, ${dx - 9} ${dy + 8} M ${dx + 1} ${dy + 11} Q ${dx + 6} ${dy + 7}, ${dx + 8} ${dy + 9}`,
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.95,
          opacity: 0.7,
        }
      ),
      // Delicate broken ink accent around blossom underside
      xeroxSketchStroke(
        `M ${round2(fx - 4.5)} ${round2(dy + 2.5)} Q ${fx} ${round2(dy + 5.2)}, ${round2(fx + 4.5)} ${round2(dy + 2)}`,
        {
          stroke: c.xeroxInkSoft,
          strokeWidth: 0.8,
          opacity: 0.58,
        }
      )
    );

    // Tiny warm antique-gold pollen fleck
    flowerCenters.push(
      svgEl('circle', {
        cx: round2(fx + 0.3),
        cy: round2(dy - 0.2),
        r: kind === 'rose' ? 1.3 : 1.7,
        fill: kind === 'moon' ? c.antiqueGold : c.starGlow,
        opacity: 0.85,
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
      gouacheDabWash([...tuftWashes, ...flowerLeafWashes], {
        fill: c.foliageShadow,
        wetEdgeColor: c.grassNightDeep,
        wetEdgeOpacity: 0.14,
        opacity: 0.8,
        seed: variant * 13 + 2,
      }),
      svgEl('g', { 'data-part': 'flower-stems-ink' }, stemAndFlickParts),
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
 * Renders *Robin Hood* (1973)-style sparse, lively, irregular hand-inked charcoal/sepia
 * grass tuft flicks (`xeroxSketchStroke`, 2–4 crooked short pen strokes per tuft with
 * varied angles and lengths) over very faint dappled watercolor ground washes and tiny
 * sketched pebbles (`'grass_patch'`).
 *
 * Footprint: `~x: -180..190, y: -26..56`, respects `variant`.
 */
export function renderClassicGrassPatch(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;

  const mirror = variant % 2 === 0 ? -1 : 1;

  // Faint dappled ground washes scattered irregularly across the patch footprint
  const groundWashDabs: GouacheDab[] = [
    { cx: round2(-132 * mirror), cy: 24, rx: 36, ry: 9, rotate: -3, fill: c.foliageShadow, opacity: 0.28 },
    { cx: round2(-58 * mirror), cy: 10, rx: 32, ry: 8, rotate: 4, fill: c.oliveCanopy, opacity: 0.26 },
    { cx: round2(18 * mirror), cy: 34, rx: 40, ry: 9.5, rotate: -2, fill: c.grassNightDeep, opacity: 0.28 },
    { cx: round2(96 * mirror), cy: 16, rx: 34, ry: 8.5, rotate: 3, fill: c.oliveCanopy, opacity: 0.24 },
    { cx: round2(150 * mirror), cy: 32, rx: 28, ry: 7.5, rotate: -4, fill: c.foliageShadow, opacity: 0.26 },
  ];

  // 10 irregularly scattered lively tuft coordinates (varied spacing, NOT a uniform grid!)
  const tuftSeeds: ReadonlyArray<readonly [number, number, number]> = [
    [-162, 18, 0.95],
    [-124, 38, 1.08],
    [-92, 6, 0.86],
    [-54, 28, 1.02],
    [-14, 14, 0.92],
    [22, 42, 1.1],
    [58, 9, 0.96],
    [98, 32, 1.05],
    [136, 12, 0.88],
    [168, 36, 0.98],
  ];

  const inkTufts: string[] = [];
  const pebbles: string[] = [];

  for (let idx = 0; idx < tuftSeeds.length; idx++) {
    const [bx, by, sc] = tuftSeeds[idx];
    const cx = round2(
      Math.max(
        -172,
        Math.min(
          182,
          (bx + deterministicJitter(idx * 5 + 1, variant, 12)) * mirror
        )
      )
    );
    const cy = round2(
      Math.max(2, Math.min(48, by + deterministicJitter(idx * 5 + 2, variant, 7)))
    );
    const sway = steppedOscillate(frameIndex, 34, 1.4, variant * 5 + idx * 4);

    // 2–4 crooked short calligraphic pen flicks per tuft (just like Robin Hood meadow!)
    const strokeCount = 2 + ((idx + variant) % 3); // 2, 3, or 4 strokes
    const flickPaths: string[] = [];

    for (let k = 0; k < strokeCount; k++) {
      const spread = (k - (strokeCount - 1) / 2) * 5.8 * sc;
      const x0 = round2(cx + spread * 0.55);
      const y0 = round2(cy + deterministicJitter(idx * 11 + k, variant, 1.8));
      const len = round2(
        (8.5 + Math.abs(deterministicJitter(idx * 13 + k, variant, 9.5))) * sc
      );
      const angleBias =
        spread * 1.15 + deterministicJitter(idx * 17 + k, variant, 5.5) + sway;
      const tipX = round2(x0 + angleBias);
      const tipY = round2(Math.max(-24, y0 - len));
      const midX = round2((x0 + tipX) * 0.5 + deterministicJitter(idx + k * 7, variant, 2.2));
      const midY = round2((y0 + tipY) * 0.52);

      flickPaths.push(`M ${x0} ${y0} Q ${midX} ${midY}, ${tipX} ${tipY}`);
    }

    // Subtle painterly olive-sage highlight flick accompanying select tufts
    if (idx % 2 === 0) {
      inkTufts.push(
        xeroxSketchStroke(
          `M ${round2(cx + 1.5)} ${cy} Q ${round2(cx + 3 + sway)} ${round2(cy - 8 * sc)}, ${round2(cx + 5 + sway)} ${round2(Math.max(-24, cy - 14 * sc))}`,
          {
            stroke: c.sageFoliage,
            strokeWidth: 1.5,
            opacity: 0.52,
          }
        )
      );
    }

    inkTufts.push(
      xeroxSketchStroke(flickPaths.join(' '), {
        stroke: idx % 3 === 0 ? c.xeroxInk : c.xeroxInkSoft,
        strokeWidth: round2(1.0 + (idx % 2) * 0.25),
        opacity: 0.78,
      })
    );

    // Sparse tiny ink pebbles & meadow soil specks (authentic 1973 ground texture!)
    if (idx % 3 === variant % 3) {
      const px = round2(cx + (idx % 2 === 0 ? 15 : -14));
      const py = round2(Math.min(52, cy + 4));
      const rx = round2(3.4 + (idx % 2) * 1.1);
      const ry = round2(1.8 + (idx % 2) * 0.45);
      pebbles.push(
        svgEl('g', { 'data-part': 'garden-pebble' }, [
          svgEl('ellipse', {
            cx: px,
            cy: py,
            rx,
            ry,
            fill: c.stoneShadow,
            opacity: 0.78,
          }),
          xeroxSketchStroke(
            `M ${round2(px - rx)} ${round2(py + 0.3)} Q ${px} ${round2(py + ry + 0.8)}, ${round2(px + rx)} ${round2(py + 0.2)}`,
            {
              stroke: c.xeroxInk,
              strokeWidth: 0.85,
              opacity: 0.76,
            }
          ),
        ])
      );
    } else if (idx % 2 === 1) {
      // Tiny dark sepia ink ground speck
      pebbles.push(
        svgEl('circle', {
          cx: round2(cx + deterministicJitter(idx * 23, variant, 14)),
          cy: round2(Math.min(52, cy + 3)),
          r: 1.15,
          fill: c.xeroxInkSoft,
          opacity: 0.62,
        })
      );
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'grass_patch',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('g', { 'data-part': 'grass-ground-washes' }, [
        gouacheDabWash(groundWashDabs, {
          fill: c.foliageShadow,
          wetEdgeColor: c.grassNightDeep,
          wetEdgeOpacity: 0.12,
          opacity: 0.72,
          seed: variant * 17 + 4,
        }),
      ]),
      svgEl('g', { 'data-part': 'grass-blades' }, inkTufts),
      svgEl('g', { 'data-part': 'grass-pebbles' }, pebbles),
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
    // 24-frame loop at 12 FPS = 2.0s smooth upward drift on twos
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
      // Single eighth note (♪) — flat matte antique-gold cel paint + raw Xerox ink
      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          // Tapered hand-inked stem & curving flag
          celPath(
            'M 3.6 -1 L 3.6 -22 C 9.5 -20, 14.5 -14.5, 13.2 -8.5 C 12 -12.5, 8.8 -15.5, 5.8 -16.8 L 5.8 -1 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          // Flat cel notehead
          celPath(
            'M -5.4 1.6 C -6.4 -1.4, -3.2 -4.4, 0.8 -4.2 C 4.8 -4.0, 6.2 -1.2, 5.0 1.4 C 3.8 4.0, -0.8 5.0, -3.6 3.6 C -4.6 3.1, -5.1 2.4, -5.4 1.6 Z',
            c.antiqueGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          // Flat cel parchment catch-dot (no blur!)
          svgEl('circle', {
            cx: -1.5,
            cy: -1.0,
            r: 1.35,
            fill: c.mochiGoldHighlight,
          }),
          // Tiny hand-drawn sparkle cross tick
          xeroxSketchStroke('M -10 2.5 L -10 7.5 M -12.5 5 L -7.5 5', {
            stroke: c.parchmentCream,
            strokeWidth: 0.9,
            opacity: 0.78,
          }),
        ])
      );
    } else {
      // Beamed double eighth note (♫) — flat antique-gold cel paint + raw Xerox ink
      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          // Hand-inked stems
          xeroxSketchStroke(
            'M -1.4 1 L -1.4 -20.5 M 13.6 -2 L 13.6 -23.5',
            {
              stroke: c.xeroxInk,
              strokeWidth: 2.2,
              opacity: 0.96,
            }
          ),
          // Flat cel antique-gold double crossbar beams
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
          // Left & right flat cel noteheads
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
          // Flat cel parchment catch-dots
          svgEl('circle', { cx: -7.2, cy: 0.9, r: 1.25, fill: c.mochiGoldHighlight }),
          svgEl('circle', { cx: 7.8, cy: -2.1, r: 1.25, fill: c.mochiGoldHighlight }),
          // Tiny hand-drawn sparkle cross tick
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

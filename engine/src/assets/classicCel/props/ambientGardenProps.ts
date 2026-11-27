import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  celStrokeAttrs,
  deterministicJitter,
  gouachePath,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

function makeUid(options: PropRenderOptions, fallbackPrefix: string): string {
  const raw =
    options.id ??
    `${fallbackPrefix}-v${options.variant ?? 1}-${Math.round(options.x ?? 0)}-${Math.round(options.y ?? 0)}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Renders soft translucent painted gouache moonlit cloud wisps (`'fluffy_cloud'`)
 * with layered silver-blue moonlight crests and muted indigo undersides (`#gouache-wash`,
 * NO heavy outline).
 *
 * Footprint: `~x: -82..82, y: -44..14`.
 */
export function renderClassicFluffyCloud(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;
  const uid = makeUid(options, 'cloud');

  // Smooth 12 FPS nocturnal breeze drift
  const drift = steppedOscillate(frameIndex, 48, 4.5, variant * 7);
  const mirror = variant % 2 === 0 ? -1 : 1;

  const topGradId = `cc-cloud-top-${uid}`;
  const underGradId = `cc-cloud-under-${uid}`;

  const defs = svgEl('defs', {}, [
    svgEl(
      'linearGradient',
      { id: topGradId, x1: '50%', y1: '0%', x2: '50%', y2: '100%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.nightcapStripe,
          'stop-opacity': 0.85,
        }),
        svgEl('stop', {
          offset: '52%',
          'stop-color': c.mochiFurRim,
          'stop-opacity': 0.62,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.nightMistTeal,
          'stop-opacity': 0.2,
        }),
      ]
    ),
    svgEl(
      'linearGradient',
      { id: underGradId, x1: '50%', y1: '0%', x2: '50%', y2: '100%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.nightSkyHorizon,
          'stop-opacity': 0.65,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.nightSkyMid,
          'stop-opacity': 0.82,
        }),
      ]
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
      defs,
      // Trailing translucent gouache wisp veil across full -80..80 span
      gouachePath(
        'M -80 8 C -68 2, -56 -12, -38 -12 C -26 -30, 4 -34, 20 -20 C 38 -26, 58 -14, 66 -2 C 74 2, 82 6, 78 11 C 54 14, -52 14, -80 8 Z',
        svgUrl(underGradId),
        { softEdge: true, opacity: 0.72 }
      ),
      // Main painted moonlit cloud body
      gouachePath(
        'M -62 10 C -74 8, -74 -10, -52 -16 C -44 -36, -14 -42, 4 -28 C 22 -40, 50 -30, 54 -12 C 72 -10, 72 10, 50 10 Z',
        svgUrl(topGradId),
        { softEdge: true, opacity: 0.9 }
      ),
      // Muted indigo gouache underside shadow wash
      gouachePath(
        'M -60 10 C -40 2, -16 4, 8 1 C 32 -2, 54 2, 66 8 C 52 13, -44 13, -60 10 Z',
        c.nightSkyMid,
        { softEdge: true, opacity: 0.56 }
      ),
      // Delicate silver-blue moonlit top crest highlights
      gouachePath(
        'M -44 -20 C -34 -37, -10 -39, 4 -28 C -8 -31, -28 -30, -40 -17 Z',
        c.nightcapStripe,
        { softEdge: false, opacity: 0.58 }
      ),
      gouachePath(
        'M 12 -30 C 26 -37, 46 -29, 51 -15 C 42 -24, 26 -29, 12 -26 Z',
        c.nightcapStripe,
        { softEdge: false, opacity: 0.52 }
      ),
    ]
  );
}

/**
 * Renders delicate twinkling pinprick stars and 4-point cross glints (`'star_cluster'`)
 * with soft golden-cream optical halos (`#cel-soft-glow`) and gentle 12 FPS twinkle.
 *
 * Footprint: `~1200×310`, respects `count` & `variant`.
 */
export function renderClassicStarCluster(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;

  const starCount = Math.max(0, count ?? 24);
  const glowLayer: string[] = [];
  const coreLayer: string[] = [];

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
    const twinkleScale = round2(0.84 + (wave + 1) * 0.16);
    const twinkleAlpha = round2(0.55 + (wave + 1) * 0.22);

    if (i % 4 === 0) {
      // Hero 4-point classic Disney cross glint with warm golden-cream halo
      const arm = round2((i % 8 === 0 ? 9.5 : 7.0) * twinkleScale);
      const glintD = `M ${sx} ${round2(sy - arm)} Q ${sx} ${sy} ${round2(sx + arm)} ${sy} Q ${sx} ${sy} ${sx} ${round2(sy + arm)} Q ${sx} ${sy} ${round2(sx - arm)} ${sy} Q ${sx} ${sy} ${sx} ${round2(sy - arm)} Z`;

      glowLayer.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r: round2(arm * 0.65),
          fill: c.warmAmberGlow,
          opacity: round2(0.45 * twinkleAlpha),
        })
      );
      coreLayer.push(
        svgEl('path', {
          d: glintD,
          fill: c.starGlow,
          opacity: twinkleAlpha,
        }),
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r: round2(1.6 * twinkleScale),
          fill: c.celCream,
          opacity: round2(Math.min(1, twinkleAlpha + 0.12)),
        })
      );
    } else if (i % 4 === 2) {
      // Soft mid-brightness warm star with gentle halo
      const r = round2(2.3 * twinkleScale);
      glowLayer.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r: round2(r * 1.9),
          fill: c.starGlow,
          opacity: round2(0.32 * twinkleAlpha),
        })
      );
      coreLayer.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r,
          fill: i % 3 === 0 ? c.celCream : c.starGlow,
          opacity: twinkleAlpha,
        })
      );
    } else {
      // Delicate pinprick star
      const r = round2((1.1 + (i % 3) * 0.35) * twinkleScale);
      coreLayer.push(
        svgEl('circle', {
          cx: sx,
          cy: sy,
          r,
          fill: i % 5 === 1 ? c.mochiFurRim : c.starGlow,
          opacity: round2(twinkleAlpha * 0.88),
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
    [
      glowLayer.length > 0
        ? svgEl(
            'g',
            {
              'data-part': 'star-halos',
              filter: svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow),
            },
            glowLayer
          )
        : '',
      svgEl('g', { 'data-part': 'star-cores' }, coreLayer),
    ]
  );
}

/**
 * Renders painted nocturnal garden blossoms (`'meadow_flowers'`): cream moonflowers,
 * soft dusty-blue and rose garden buds, and dark emerald foliage clusters with fine
 * sepia ink stems.
 *
 * Footprint: `~x: -585..590, y: 3..175`.
 */
export function renderClassicMeadowFlowers(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const foliageTufts: ReadonlyArray<readonly [number, number]> = [
    [-580, 55], [-515, 115], [-465, 165], [-420, 40], [-360, 15],
    [-310, 85], [-260, 130], [-220, 50], [-180, 165], [-140, 120],
    [-90, 175], [-20, 150], [45, 160], [120, 170], [210, 165],
    [275, 115], [340, 155], [395, 95], [435, 150], [-390, 155],
    [-320, 170], [85, 120], [320, 60], [485, 110], [535, 160], [585, 75],
  ];

  const blossoms: ReadonlyArray<readonly [number, number, 'moon' | 'blue' | 'rose']> = [
    [-540, 95, 'moon'], [-455, 76, 'blue'], [-115, 78, 'rose'],
    [-82, 118, 'moon'], [52, 68, 'blue'], [68, 108, 'moon'],
    [155, 86, 'rose'], [198, 62, 'moon'], [230, 96, 'blue'],
    [335, 112, 'moon'], [380, 74, 'rose'], [412, 122, 'blue'],
    [495, 88, 'moon'], [560, 132, 'rose'],
  ];

  const parts: string[] = [];

  // Dark nocturnal foliage clusters with fine ink grass blades
  for (let i = 0; i < foliageTufts.length; i++) {
    const [tx, ty] = foliageTufts[i];
    const lean = round2(
      steppedOscillate(frameIndex, 36, 1.2, i * 3 + variant * 2) +
        deterministicJitter(i, variant, 1.5)
    );
    parts.push(
      svgEl('g', { transform: `translate(${tx}, ${ty})` }, [
        // Soft dark ground wash under tuft
        svgEl('ellipse', {
          cx: 0,
          cy: 1.5,
          rx: 9,
          ry: 3,
          fill: c.foliageShadow,
          opacity: 0.48,
        }),
        // Painted arching leaf blades
        svgEl('path', {
          d: `M -2 0 Q ${round2(-6 + lean)} -7, ${round2(-9 + lean)} -11 Q -3 -8, 0 0 Z`,
          fill: c.foliageMid,
        }),
        svgEl('path', {
          d: `M 0 0 Q ${round2(1 + lean * 0.7)} -9, ${round2(lean)} -14 Q 4 -8, 2 0 Z`,
          fill: c.foliageLit,
        }),
        svgEl('path', {
          d: `M 1 0 Q ${round2(6 + lean)} -6, ${round2(9 + lean)} -10 Q 5 -5, 3 0 Z`,
          fill: c.foliageMid,
        }),
        // Fine ink accent spine
        svgEl('path', {
          d: `M 0 0 Q ${round2(lean * 0.7)} -8, ${round2(lean)} -13`,
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.75,
            opacity: 0.55,
          }),
        }),
      ])
    );
  }

  // Nocturnal blossoms (cream moonflowers, dusty-blue blossoms, and rose buds)
  for (let i = 0; i < blossoms.length; i++) {
    const [dx, dy, kind] = blossoms[i];
    const sway = steppedOscillate(frameIndex, 32, 2.2, i * 4 + variant * 5);

    const petalColor =
      kind === 'moon'
        ? c.flowerCream
        : kind === 'blue'
          ? c.flowerBlue
          : c.flowerRose;

    const flowerHead =
      kind === 'rose'
        ? // Cupped dusty-rose garden bud
          svgEl('g', {}, [
            svgEl('path', {
              d: 'M -5.5 -1 C -7 -6.5, -2.5 -9.5, 0 -7.5 C 2.5 -9.5, 7 -6.5, 5.5 -1 C 4.5 3.5, -4.5 3.5, -5.5 -1 Z',
              fill: petalColor,
              ...celStrokeAttrs({
                stroke: c.xeroxInkSoft,
                strokeWidth: s.sketchLine,
              }),
            }),
            svgEl('path', {
              d: 'M -3 -4 C -1 -6.5, 2 -6.5, 3 -3.5 C 1 -4.5, -1 -4.5, -3 -4 Z',
              fill: c.flowerCream,
              opacity: 0.52,
            }),
            svgEl('path', {
              d: 'M -4.5 1 Q 0 5, 4.5 1 L 0 4.5 Z',
              fill: c.foliageLit,
            }),
          ])
        : // 5-petal painted moonflower / dusty-blue nocturnal blossom
          svgEl('g', {}, [
            svgEl('path', {
              d: 'M 0 -7.5 C 3.8 -9.5, 7.2 -5.2, 5.2 -1.2 C 9.2 0.8, 7.2 6.2, 3.2 5.2 C 2.2 9.0, -2.2 9.0, -3.2 5.2 C -7.2 6.2, -9.2 0.8, -5.2 -1.2 C -7.2 -5.2, -3.8 -9.5, 0 -7.5 Z',
              fill: petalColor,
              ...celStrokeAttrs({
                stroke: c.xeroxInkSoft,
                strokeWidth: 0.85,
              }),
            }),
            // Subtle shadow cup around center
            svgEl('circle', {
              cx: 0,
              cy: 0.5,
              r: 3.1,
              fill: kind === 'moon' ? c.mochiCreamShadow : c.nightMistTeal,
              opacity: 0.45,
            }),
            // Luminous pollen center
            svgEl('circle', {
              cx: 0,
              cy: 0,
              r: 2.1,
              fill: kind === 'moon' ? c.warmAmberGlow : c.starGlow,
            }),
          ]);

    parts.push(
      svgEl('g', { transform: `translate(${dx}, ${dy})` }, [
        // Dark foliage base cluster
        svgEl('path', {
          d: 'M -10 12 Q -5 6, 0 11 Q 6 6, 11 12 Q 4 15, -10 12 Z',
          fill: c.foliageShadow,
          opacity: 0.72,
        }),
        svgEl('path', {
          d: 'M -8 12 Q -3 5, 0 10 M 8 12 Q 3 5, 0 10',
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.foliageLit,
            strokeWidth: 1.6,
          }),
        }),
        // Fine ink stem curving gently from base up to blossom
        svgEl('path', {
          d: `M 0 12 Q ${round2(sway * 0.5)} 6, 0 0`,
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: 1.1,
          }),
        }),
        svgEl(
          'g',
          { transform: svgTransform({ rotate: sway, pivotX: 0, pivotY: 12 }) },
          flowerHead
        ),
      ])
    );
  }

  return svgEl(
    'g',
    {
      'data-prop': 'meadow_flowers',
      'data-art-style': 'classic_cel',
    },
    parts
  );
}

/**
 * Renders *Robin Hood*-style loose organic clusters of hand-inked tapered grass blades,
 * soft dark-green ground shadow washes, and tiny moonlit garden pebbles (`'grass_patch'`).
 * Completely replaces the boxy crayon rectangle while respecting `variant` and staying
 * inside `~x: -180..190, y: -26..56`.
 */
export function renderClassicGrassPatch(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1 } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  // Deterministic cluster centers varied by `variant` within x: -165..175, y: 2..46
  const baseClusters: ReadonlyArray<readonly [number, number, number]> = [
    [-142, 24, 1.05],
    [-86, 8, 0.92],
    [-22, 34, 1.12],
    [48, 12, 0.98],
    [114, 30, 1.08],
    [156, 16, 0.88],
  ];

  const mirror = variant % 2 === 0 ? -1 : 1;
  const groundWashes: string[] = [];
  const grassClusters: string[] = [];
  const pebbles: string[] = [];

  for (let idx = 0; idx < baseClusters.length; idx++) {
    const [bx, by, sc] = baseClusters[idx];
    const cx = round2(
      (bx + deterministicJitter(idx * 3 + 1, variant, 14)) * mirror
    );
    const cy = round2(
      Math.max(
        4,
        Math.min(46, by + deterministicJitter(idx * 3 + 2, variant, 8))
      )
    );
    const sway = steppedOscillate(frameIndex, 34, 1.8, variant * 5 + idx * 4);

    // Soft dark-green gouache ground shadow wash under each tuft
    groundWashes.push(
      gouachePath(
        `M ${round2(cx - 28 * sc)} ${round2(cy + 3)} C ${round2(cx - 20 * sc)} ${round2(cy - 6)}, ${round2(cx + 20 * sc)} ${round2(cy - 6)}, ${round2(cx + 28 * sc)} ${round2(cy + 3)} C ${round2(cx + 18 * sc)} ${round2(cy + 10)}, ${round2(cx - 18 * sc)} ${round2(cy + 10)}, ${round2(cx - 28 * sc)} ${round2(cy + 3)} Z`,
        idx % 2 === 0 ? c.foliageShadow : c.grassNightDeep,
        { softEdge: true, opacity: 0.44 }
      )
    );

    // Loose bundle of 5 hand-inked tapered grass blades arching cleanly above base
    const blades: string[] = [];
    const bladeSpecs: ReadonlyArray<
      readonly [number, number, number, string, number]
    > = [
      [-14, -22, -24, c.grassNightDeep, 1.0],
      [-7, -28, -11, c.grassNightMid, 1.05],
      [0, -32, 3, c.grassNightLit, 1.1],
      [7, -26, 15, c.grassNightMid, 1.0],
      [13, -19, 23, c.foliageRim, 0.85],
    ];

    for (let b = 0; b < bladeSpecs.length; b++) {
      const [ox, h, tipX, fill, bOpacity] = bladeSpecs[b];
      const jitterH = deterministicJitter(idx * 7 + b, variant, 3.5);
      const x0 = round2(cx + ox * sc);
      const topY = round2(Math.max(-25, cy + (h + jitterH) * sc));
      const tx = round2(cx + (tipX + sway) * sc);
      const ctrlX = round2((x0 + tx) * 0.5 + (tipX > 0 ? -2 : 2));
      const ctrlY = round2((cy + topY) * 0.5);
      const halfW = round2((b === 2 ? 2.6 : 2.1) * sc);

      blades.push(
        svgEl('path', {
          d: `M ${round2(x0 - halfW)} ${round2(cy + 2)} Q ${ctrlX} ${ctrlY}, ${tx} ${topY} Q ${round2(ctrlX + halfW)} ${ctrlY}, ${round2(x0 + halfW)} ${round2(cy + 2)} Z`,
          fill,
          opacity: bOpacity,
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.8,
            opacity: 0.62,
          }),
        })
      );
    }

    // Extra fine sketchy ink grass wisps
    blades.push(
      svgEl('path', {
        d: `M ${round2(cx - 4 * sc)} ${round2(cy + 1)} Q ${round2(cx - 10 * sc)} ${round2(cy - 10 * sc)}, ${round2(cx - 16 * sc + sway)} ${round2(Math.max(-24, cy - 17 * sc))} M ${round2(cx + 5 * sc)} ${round2(cy + 1)} Q ${round2(cx + 11 * sc)} ${round2(cy - 9 * sc)}, ${round2(cx + 18 * sc + sway)} ${round2(Math.max(-24, cy - 14 * sc))}`,
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
          opacity: 0.58,
        }),
      })
    );

    grassClusters.push(svgEl('g', { 'data-part': 'grass-tuft' }, blades));

    // Tiny moonlit garden pebble beside alternating tufts
    if (idx % 2 === variant % 2) {
      const px = round2(cx + (idx % 3 === 0 ? 19 : -20) * sc);
      const py = round2(Math.min(52, cy + 5));
      const rx = round2(4.2 + (idx % 2) * 1.4);
      const ry = round2(2.3 + (idx % 2) * 0.6);
      pebbles.push(
        svgEl('g', { 'data-part': 'garden-pebble' }, [
          svgEl('ellipse', {
            cx: px,
            cy: py,
            rx,
            ry,
            fill: c.stoneShadow,
            ...celStrokeAttrs({
              stroke: c.xeroxInkSoft,
              strokeWidth: 0.75,
            }),
          }),
          svgEl('ellipse', {
            cx: round2(px + 0.6),
            cy: round2(py - 0.7),
            rx: round2(rx * 0.62),
            ry: round2(ry * 0.48),
            fill: c.stoneLight,
            opacity: 0.65,
          }),
        ])
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
      svgEl('g', { 'data-part': 'grass-ground-washes' }, groundWashes),
      svgEl('g', { 'data-part': 'grass-blades' }, grassClusters),
      svgEl('g', { 'data-part': 'grass-pebbles' }, pebbles),
    ]
  );
}

/**
 * Renders gleaming warm-gold hand-inked musical eighth and beamed notes (`'music_notes'`)
 * with soft luminous halos (`#cel-soft-glow`), drifting smoothly upward at 12 FPS.
 *
 * Respects `count` & `variant`.
 */
export function renderClassicMusicNotes(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const activeCount = Math.max(0, count ?? 3);
  const glowNotes: string[] = [];
  const inkedNotes: string[] = [];

  for (let i = 0; i < activeCount; i++) {
    // 24-frame loop at 12 FPS = 2.0s smooth upward drift
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
      // Single eighth note (♪)
      glowNotes.push(
        svgEl('g', { transform: noteTransform }, [
          svgEl('circle', {
            cx: 2,
            cy: -8,
            r: 12,
            fill: c.warmAmberGlow,
            opacity: 0.42,
          }),
        ])
      );

      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          // Tapered hand-inked stem & curving flag
          celPath(
            'M 3.6 -1 L 3.6 -22 C 9.5 -20, 14.5 -14.5, 13.2 -8.5 C 12 -12.5, 8.8 -15.5, 5.8 -16.8 L 5.8 -1 Z',
            c.mochiGold,
            { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
          ),
          // Notehead
          svgEl('ellipse', {
            cx: 0,
            cy: 0,
            rx: 5.8,
            ry: 4.3,
            fill: c.mochiGold,
            transform: 'rotate(-20)',
            ...celStrokeAttrs({
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxFine,
            }),
          }),
          // Luminous specular highlight dot on notehead
          svgEl('ellipse', {
            cx: -1.4,
            cy: -1.2,
            rx: 2.1,
            ry: 1.2,
            fill: c.warmAmberCore,
            transform: 'rotate(-20 -1.4 -1.2)',
            opacity: 0.9,
          }),
          // Tiny trailing fairy-gold sparkle
          svgEl('circle', {
            cx: -9,
            cy: 5,
            r: 1.4,
            fill: c.starGlow,
            opacity: 0.78,
          }),
        ])
      );
    } else {
      // Beamed double eighth note (♫)
      glowNotes.push(
        svgEl('g', { transform: noteTransform }, [
          svgEl('ellipse', {
            cx: 3,
            cy: -9,
            rx: 16,
            ry: 13,
            fill: c.warmAmberGlow,
            opacity: 0.4,
          }),
        ])
      );

      inkedNotes.push(
        svgEl('g', { transform: noteTransform }, [
          // Stems
          svgEl('path', {
            d: 'M -1.4 1 L -1.4 -20.5 M 13.6 -2 L 13.6 -23.5',
            fill: 'none',
            ...celStrokeAttrs({
              stroke: c.xeroxInk,
              strokeWidth: 2.2,
            }),
          }),
          // Gleaming gold double crossbar beam
          celPath(
            'M -2.2 -21.2 L 14.4 -24.2 L 14.4 -19.8 L -2.2 -16.8 Z',
            c.mochiGold,
            { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
          ),
          celPath(
            'M -2.0 -14.8 L 14.2 -17.8 L 14.2 -15.4 L -2.0 -12.4 Z',
            c.warmAmberGlow,
            { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
          ),
          // Left & right noteheads
          svgEl('ellipse', {
            cx: -6,
            cy: 2,
            rx: 5.4,
            ry: 4.1,
            fill: c.mochiGold,
            transform: 'rotate(-18 -6 2)',
            ...celStrokeAttrs({
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxFine,
            }),
          }),
          svgEl('ellipse', {
            cx: 9,
            cy: -1,
            rx: 5.4,
            ry: 4.1,
            fill: c.mochiGold,
            transform: 'rotate(-18 9 -1)',
            ...celStrokeAttrs({
              stroke: c.xeroxInk,
              strokeWidth: s.xeroxFine,
            }),
          }),
          // Specular highlights on both noteheads
          svgEl('ellipse', {
            cx: -7.2,
            cy: 0.9,
            rx: 1.9,
            ry: 1.1,
            fill: c.warmAmberCore,
            transform: 'rotate(-18 -7.2 0.9)',
            opacity: 0.9,
          }),
          svgEl('ellipse', {
            cx: 7.8,
            cy: -2.1,
            rx: 1.9,
            ry: 1.1,
            fill: c.warmAmberCore,
            transform: 'rotate(-18 7.8 -2.1)',
            opacity: 0.9,
          }),
          // Tiny golden sparkle mote
          svgEl('circle', {
            cx: 17,
            cy: -12,
            r: 1.5,
            fill: c.starGlow,
            opacity: 0.8,
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
    [
      glowNotes.length > 0
        ? svgEl(
            'g',
            {
              'data-part': 'music-notes-glow',
              filter: svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow),
            },
            glowNotes
          )
        : '',
      svgEl('g', { 'data-part': 'music-notes-ink' }, inkedNotes),
    ]
  );
}

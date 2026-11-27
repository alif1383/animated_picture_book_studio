import {
  TOKENS,
  CrayonMaterialId,
  PatternIdValue,
  svgUrl,
} from '../theme/tokens';
import { svgEl, round2 } from './svgUtils';
import type { AnimationStyleId } from './schema';

export interface FilterRenderOptions {
  /** Quantized line-boil seed (1..6, updated at scene FPS via clock.ts) */
  seed: number;
  /** Toggle Layer 2 (#crayon-stroke / #crayon-outline or #xerox-ink) for pipeline inspector */
  enableCrayonFilter?: boolean;
  /** Toggle Layer 3 (cold-press paper grain or 35mm film grain composite) for pipeline inspector */
  enablePaperTexture?: boolean;
  /** Enable Vibrant Crayon Mode (boosted saturation, contrast, and luminous paper tooth) */
  vibrant?: boolean;
  /** Animation rendering style ('crayon' default, or 'classic_cel') */
  artStyle?: AnimationStyleId;
  /** Additional dynamic <mask> / <gradient> definitions */
  extraDefs?: string[];
}

interface DryCrayonSpec {
  id: PatternIdValue;
  baseColor: string;
  accentColor: string;
  angle: number;
  baseOpacity?: number;
}

const DRY_CRAYON_SPECS: readonly DryCrayonSpec[] = [
  {
    id: TOKENS.patterns.crayonTerracotta,
    baseColor: TOKENS.colors.terracottaRoof,
    accentColor: TOKENS.colors.terracottaDark,
    angle: -28,
    baseOpacity: 0.76,
  },
  {
    id: TOKENS.patterns.crayonOchre,
    baseColor: TOKENS.colors.ochreWall,
    accentColor: TOKENS.colors.ochreLight,
    angle: -22,
    baseOpacity: 0.82,
  },
  {
    id: TOKENS.patterns.crayonWarmMoon,
    baseColor: TOKENS.colors.warmMoon,
    accentColor: TOKENS.colors.moonCheek,
    angle: 28,
    baseOpacity: 0.84,
  },
  {
    id: TOKENS.patterns.crayonSunsetOrange,
    baseColor: TOKENS.colors.sunsetOrange,
    accentColor: TOKENS.colors.sunsetGold,
    angle: -16,
    baseOpacity: 0.82,
  },
  {
    id: TOKENS.patterns.crayonGrassGreen,
    baseColor: TOKENS.colors.grassGreen,
    accentColor: TOKENS.colors.treeGreen,
    angle: -32,
    baseOpacity: 0.72,
  },
  {
    id: TOKENS.patterns.crayonTreeGreen,
    baseColor: TOKENS.colors.treeGreen,
    accentColor: TOKENS.colors.grassGreen,
    angle: 35,
    baseOpacity: 0.78,
  },
  {
    id: TOKENS.patterns.crayonStoreTeal,
    baseColor: TOKENS.colors.storeTeal,
    accentColor: TOKENS.colors.indigoNightLight,
    angle: -20,
    baseOpacity: 0.8,
  },
  {
    id: TOKENS.patterns.crayonAwningRed,
    baseColor: TOKENS.colors.storeAwningRed,
    accentColor: TOKENS.colors.terracottaDark,
    angle: 38,
    baseOpacity: 0.82,
  },
  {
    id: TOKENS.patterns.crayonDressPink,
    baseColor: TOKENS.colors.dressPink,
    accentColor: TOKENS.colors.curtainPink,
    angle: -25,
    baseOpacity: 0.82,
  },
  {
    id: TOKENS.patterns.crayonNightcapBlue,
    baseColor: TOKENS.colors.nightcapBlue,
    accentColor: TOKENS.colors.nightcapWhite,
    angle: -30,
    baseOpacity: 0.78,
  },
  {
    id: TOKENS.patterns.crayonWoodBrown,
    baseColor: TOKENS.colors.woodBrown,
    accentColor: TOKENS.colors.hairBrown,
    angle: 14,
    baseOpacity: 0.84,
  },
  {
    id: TOKENS.patterns.crayonWindowGlow,
    baseColor: TOKENS.colors.windowGlow,
    accentColor: TOKENS.colors.ochreLight,
    angle: -18,
    baseOpacity: 0.88,
  },
  {
    id: TOKENS.patterns.crayonSkyBlue,
    baseColor: TOKENS.colors.skyPastelBlue,
    accentColor: TOKENS.colors.skyPastelLight,
    angle: -18,
    baseOpacity: 0.9,
  },
  {
    id: TOKENS.patterns.crayonMeadowGreen,
    baseColor: TOKENS.colors.meadowGreen,
    accentColor: TOKENS.colors.grassGreen,
    angle: -14,
    baseOpacity: 0.88,
  },
  {
    id: TOKENS.patterns.crayonRadishRed,
    baseColor: TOKENS.colors.radishRed,
    accentColor: TOKENS.colors.terracottaRoof,
    angle: -65,
    baseOpacity: 0.86,
  },
  {
    id: TOKENS.patterns.crayonEmeraldFrond,
    baseColor: TOKENS.colors.emeraldFrond,
    accentColor: TOKENS.colors.treeGreen,
    angle: -35,
    baseOpacity: 0.88,
  },
  {
    id: TOKENS.patterns.crayonBananaYellow,
    baseColor: TOKENS.colors.bananaYellow,
    accentColor: TOKENS.colors.sunsetGold,
    angle: -15,
    baseOpacity: 0.9,
  },
  {
    id: TOKENS.patterns.crayonRoyalBlue,
    baseColor: TOKENS.colors.royalCrayonBlue,
    accentColor: TOKENS.colors.indigoNight,
    angle: -40,
    baseOpacity: 0.88,
  },
  {
    id: TOKENS.patterns.crayonCatBlue,
    baseColor: TOKENS.colors.catLightBlue,
    accentColor: TOKENS.colors.nightcapBlue,
    angle: -25,
    baseOpacity: 0.86,
  },
  {
    id: TOKENS.patterns.crayonWatermelonPink,
    baseColor: TOKENS.colors.watermelonPink,
    accentColor: TOKENS.colors.cherryRose,
    angle: -30,
    baseOpacity: 0.88,
  },
  {
    id: TOKENS.patterns.crayonCherryRose,
    baseColor: TOKENS.colors.cherryRose,
    accentColor: TOKENS.colors.dressPink,
    angle: 22,
    baseOpacity: 0.86,
  },
  {
    id: TOKENS.patterns.crayonSweaterPurple,
    baseColor: TOKENS.colors.sweaterPurple,
    accentColor: TOKENS.colors.sweaterPurpleDark,
    angle: -24,
    baseOpacity: 0.86,
  },
];

/**
 * Returns `url(#pat-...)` for a centralized CrayonMaterialId token key.
 */
export function getPatternFill(material: CrayonMaterialId): string {
  return svgUrl(TOKENS.patterns[material]);
}

/**
 * Builds a single dry crayon / oil pastel SVG `<pattern>` where diagonal waxy strokes
 * leave warm cold-press watercolor paper tooth (`#F4EFE6`) peeking through.
 */
function renderDryCrayonPattern(spec: DryCrayonSpec, vibrant = false): string {
  const { id, baseColor, accentColor, angle, baseOpacity = 0.78 } = spec;
  const paper = TOKENS.colors.paperWarm;
  const paperShadow = TOKENS.colors.paperShadow;
  const fillOpacity = vibrant ? Math.min(0.96, round2(baseOpacity + 0.12)) : baseOpacity;
  const toothOpacity = vibrant ? 0.45 : 0.78;
  const fleckScale = vibrant ? 0.52 : 1.0;

  return svgEl(
    'pattern',
    {
      id,
      width: 28,
      height: 28,
      patternUnits: 'userSpaceOnUse',
      patternTransform: `rotate(${angle})`,
    },
    [
      // Warm cold-press paper base showing through gaps
      svgEl('rect', { width: 28, height: 28, fill: paper }),
      // Semi-translucent pastel pigment base
      svgEl('rect', {
        width: 28,
        height: 28,
        fill: baseColor,
        'fill-opacity': fillOpacity,
      }),
      // Heavy waxy crayon strokes
      svgEl('path', {
        d: 'M -2 4 Q 8 2, 18 5 T 30 4 M -2 12 Q 10 14, 20 11 T 30 13 M -2 21 Q 7 19, 17 22 T 30 20',
        stroke: baseColor,
        'stroke-width': 3.6,
        'stroke-dasharray': '11 2 6 3',
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: 0.96,
      }),
      // Secondary pigment richness streaks
      svgEl('path', {
        d: 'M -2 8 L 30 7 M -2 17 L 30 18 M -2 25 L 30 24',
        stroke: accentColor,
        'stroke-width': 2.0,
        'stroke-dasharray': '5 5 8 4',
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: 0.62,
      }),
      // Uncolored cold-press paper tooth valleys (white/warm paper streaks like Ref Image 2 & 4 roof/grass)
      svgEl('path', {
        d: 'M 1 2 L 10 2 M 16 9 L 25 9 M 3 15 L 14 15 M 18 23 L 27 23',
        stroke: paper,
        'stroke-width': 1.7,
        'stroke-dasharray': '3 4 2 5',
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: toothOpacity,
      }),
      // Paper tooth stipple flecks
      svgEl('circle', { cx: 6, cy: 6, r: 1.2, fill: paper, opacity: round2(0.75 * fleckScale) }),
      svgEl('circle', { cx: 19, cy: 4, r: 1.0, fill: paperShadow, opacity: round2(0.7 * fleckScale) }),
      svgEl('circle', { cx: 12, cy: 14, r: 1.3, fill: paper, opacity: round2(0.8 * fleckScale) }),
      svgEl('circle', { cx: 24, cy: 16, r: 1.1, fill: paper, opacity: round2(0.72 * fleckScale) }),
      svgEl('circle', { cx: 5, cy: 24, r: 1.4, fill: paperShadow, opacity: round2(0.75 * fleckScale) }),
      svgEl('circle', { cx: 16, cy: 26, r: 1.0, fill: paper, opacity: round2(0.78 * fleckScale) }),
    ]
  );
}

/**
 * Builds the directional horizontal felt-tip marker wash `<pattern>` (`#pat-marker-indigo-night`)
 * with wet-edge overlap darkening (`#222C56`) and subtle paper-tooth streaks (`#F4EFE6`).
 */
function renderMarkerIndigoPattern(): string {
  const { indigoNight, indigoNightDark, indigoNightLight, paperWarm } = TOKENS.colors;

  return svgEl(
    'pattern',
    {
      id: TOKENS.patterns.markerIndigoNight,
      width: 140,
      height: 42,
      patternUnits: 'userSpaceOnUse',
      patternTransform: 'rotate(-0.8)',
    },
    [
      // Base marker fill
      svgEl('rect', { width: 140, height: 42, fill: indigoNight }),
      // 3 broad horizontal felt-tip bands
      svgEl('path', {
        d: 'M 0 6 Q 35 5, 70 6.5 T 140 6',
        stroke: indigoNightLight,
        'stroke-width': 11,
        fill: 'none',
        opacity: 0.45,
      }),
      svgEl('path', {
        d: 'M 0 20 Q 45 21, 90 19.5 T 140 20.5',
        stroke: indigoNight,
        'stroke-width': 12,
        fill: 'none',
        opacity: 0.92,
      }),
      svgEl('path', {
        d: 'M 0 34 Q 35 33, 85 34.5 T 140 34',
        stroke: indigoNightLight,
        'stroke-width': 11,
        fill: 'none',
        opacity: 0.35,
      }),
      // Marker stroke overlap darkening seams (signature horizontal stripes in Ref Image 1 & 2)
      svgEl('path', {
        d: 'M 0 12.5 Q 50 11.8, 100 13 T 140 12.4',
        stroke: indigoNightDark,
        'stroke-width': 2.8,
        fill: 'none',
        opacity: 0.78,
      }),
      svgEl('path', {
        d: 'M 0 26.5 Q 40 27.2, 95 26 T 140 26.8',
        stroke: indigoNightDark,
        'stroke-width': 2.6,
        fill: 'none',
        opacity: 0.72,
      }),
      svgEl('path', {
        d: 'M 0 40.5 Q 60 39.8, 110 41 T 140 40.2',
        stroke: indigoNightDark,
        'stroke-width': 2.4,
        fill: 'none',
        opacity: 0.68,
      }),
      // Dry marker fiber streaks & tiny cold-press paper pinholes
      svgEl('path', {
        d: 'M 12 8 L 38 8 M 78 22 L 106 22 M 28 36 L 54 36',
        stroke: paperWarm,
        'stroke-width': 0.9,
        'stroke-dasharray': '2 6 1 8',
        fill: 'none',
        opacity: 0.28,
      }),
      svgEl('circle', { cx: 24, cy: 15, r: 0.9, fill: paperWarm, opacity: 0.32 }),
      svgEl('circle', { cx: 88, cy: 9, r: 1.1, fill: paperWarm, opacity: 0.28 }),
      svgEl('circle', { cx: 118, cy: 29, r: 0.95, fill: paperWarm, opacity: 0.3 }),
    ]
  );
}

/**
 * Repeating dry-brush raw paper fleck pattern for Layer 3 composite.
 */
function renderPaperFleckPattern(): string {
  const { paperWarm, paperShadow, paperDeep } = TOKENS.colors;
  const flecks = [
    { cx: 11, cy: 9, r: 1.1, fill: paperWarm },
    { cx: 29, cy: 17, r: 0.9, fill: paperShadow },
    { cx: 47, cy: 7, r: 1.3, fill: paperWarm },
    { cx: 68, cy: 14, r: 1.0, fill: paperDeep },
    { cx: 18, cy: 33, r: 1.2, fill: paperWarm },
    { cx: 39, cy: 28, r: 0.85, fill: paperWarm },
    { cx: 59, cy: 36, r: 1.15, fill: paperShadow },
    { cx: 74, cy: 42, r: 0.95, fill: paperWarm },
    { cx: 8, cy: 56, r: 1.25, fill: paperShadow },
    { cx: 26, cy: 63, r: 1.0, fill: paperWarm },
    { cx: 51, cy: 54, r: 1.3, fill: paperWarm },
    { cx: 66, cy: 69, r: 1.1, fill: paperDeep },
    { cx: 35, cy: 74, r: 0.9, fill: paperWarm },
  ];

  return svgEl(
    'pattern',
    {
      id: TOKENS.patterns.paperFlecks,
      width: 80,
      height: 80,
      patternUnits: 'userSpaceOnUse',
    },
    flecks.map((f) =>
      svgEl('circle', {
        cx: f.cx,
        cy: f.cy,
        r: f.r,
        fill: f.fill,
        opacity: 0.42,
      })
    )
  );
}

/**
 * Generates the `<defs>` inner SVG markup containing Layer 2 `#crayon-stroke` line-boil filters,
 * all textured dry-crayon and marker-wash `<pattern>` fills, Layer 3 paper grain filter,
 * and any dynamic progressive fill `<mask>` definitions.
 */
export function renderEngineDefs(options: FilterRenderOptions): string {
  const seed = Math.max(1, Math.floor(options.seed));
  const enableCrayon = options.enableCrayonFilter ?? true;
  const turb = TOKENS.filters.crayonTurbulence;

  const mainScale = enableCrayon ? turb.displacementScale : 0;
  const grainScale = enableCrayon ? turb.grainScale : 0;
  const outlineScale = enableCrayon ? turb.outlineScale : 0;

  // 1. Primary Layer 2 Crayon & Line-Boil Filter (#crayon-stroke)
  const crayonStrokeFilter = svgEl(
    'filter',
    {
      id: TOKENS.filters.ids.crayonStroke,
      x: '-8%',
      y: '-8%',
      width: '116%',
      height: '116%',
      'color-interpolation-filters': 'sRGB',
    },
    [
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: turb.baseFrequency,
        numOctaves: turb.numOctaves,
        seed,
        result: 'wobbleNoise',
      }),
      svgEl('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'wobbleNoise',
        scale: round2(mainScale),
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result: 'displaced',
      }),
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: turb.grainFrequency,
        numOctaves: turb.grainOctaves,
        seed: seed + 10,
        result: 'grainNoise',
      }),
      svgEl('feDisplacementMap', {
        in: 'displaced',
        in2: 'grainNoise',
        scale: round2(grainScale),
        xChannelSelector: 'G',
        yChannelSelector: 'B',
        result: 'crayonEdge',
      }),
    ]
  );

  // 2. Subtle Charcoal Pencil Outline Filter (#crayon-outline)
  const crayonOutlineFilter = svgEl(
    'filter',
    {
      id: TOKENS.filters.ids.crayonOutline,
      x: '-6%',
      y: '-6%',
      width: '112%',
      height: '112%',
      'color-interpolation-filters': 'sRGB',
    },
    [
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: turb.outlineFrequency,
        numOctaves: turb.outlineOctaves,
        seed,
        result: 'pencilNoise',
      }),
      svgEl('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'pencilNoise',
        scale: round2(outlineScale),
        xChannelSelector: 'R',
        yChannelSelector: 'G',
      }),
    ]
  );

  // 3. Layer 3 Cold-Press Watercolor Paper Grain Filter (#paper-texture)
  const paperGrain = TOKENS.filters.paperGrain;
  const paperTextureFilter = svgEl(
    'filter',
    {
      id: TOKENS.filters.ids.paperTexture,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      'color-interpolation-filters': 'sRGB',
    },
    [
      svgEl('feTurbulence', {
        type: 'fractalNoise',
        baseFrequency: paperGrain.baseFrequency,
        numOctaves: paperGrain.numOctaves,
        seed: paperGrain.seed,
        result: 'paperFibers',
      }),
      svgEl('feColorMatrix', {
        in: 'paperFibers',
        type: 'matrix',
        values: '0 0 0 0 0.92  0 0 0 0 0.89  0 0 0 0 0.83  0 0 0 0.22 0',
      }),
    ]
  );

  // 4. Vibrant Crayon Color-Boost Filter (#vibrant-grade)
  const vg = TOKENS.filters.vibrantGrade;
  const vibrantGradeFilter = svgEl(
    'filter',
    {
      id: TOKENS.filters.ids.vibrantGrade,
      x: '0%',
      y: '0%',
      width: '100%',
      height: '100%',
      'color-interpolation-filters': 'sRGB',
    },
    [
      svgEl('feColorMatrix', {
        in: 'SourceGraphic',
        type: 'saturate',
        values: String(vg.saturation),
        result: 'saturated',
      }),
      svgEl(
        'feComponentTransfer',
        {
          in: 'saturated',
          result: 'vibrantOut',
        },
        [
          svgEl('feFuncR', {
            type: 'linear',
            slope: vg.contrastSlope,
            intercept: vg.contrastIntercept,
          }),
          svgEl('feFuncG', {
            type: 'linear',
            slope: vg.contrastSlope,
            intercept: vg.contrastIntercept,
          }),
          svgEl('feFuncB', {
            type: 'linear',
            slope: vg.contrastSlope,
            intercept: vg.contrastIntercept,
          }),
        ]
      ),
    ]
  );

  const vibrant = options.vibrant ?? false;
  const artStyle: AnimationStyleId = options.artStyle ?? 'crayon';
  const extra = options.extraDefs ?? [];

  if (artStyle === 'classic_cel') {
    const celF = TOKENS.classicCel.filters;
    const celIds = celF.ids;
    const celColors = TOKENS.classicCel.colors;
    const xeroxScale = enableCrayon ? celF.xerox.displacementScale : 0;
    const gouacheScale = enableCrayon ? celF.gouache.displacementScale : 0;
    const xeroxSeed = Math.max(1, Math.floor((seed - 1) / 2) + 1);

    // Subtle organic 1970s–80s Xerox graphite ink texture (#xerox-ink)
    const xeroxInkFilter = svgEl(
      'filter',
      {
        id: celIds.xeroxInk,
        x: '-4%',
        y: '-4%',
        width: '108%',
        height: '108%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feTurbulence', {
          type: 'fractalNoise',
          baseFrequency: celF.xerox.baseFrequency,
          numOctaves: celF.xerox.numOctaves,
          seed: xeroxSeed,
          result: 'xeroxNoise',
        }),
        svgEl('feDisplacementMap', {
          in: 'SourceGraphic',
          in2: 'xeroxNoise',
          scale: round2(xeroxScale),
          xChannelSelector: 'R',
          yChannelSelector: 'G',
        }),
      ]
    );

    // Painterly watercolor / gouache edge & pigment wash (#gouache-wash)
    const gouacheWashFilter = svgEl(
      'filter',
      {
        id: celIds.gouacheWash,
        x: '-4%',
        y: '-4%',
        width: '108%',
        height: '108%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feTurbulence', {
          type: 'fractalNoise',
          baseFrequency: celF.gouache.baseFrequency,
          numOctaves: celF.gouache.numOctaves,
          seed: 7,
          result: 'washNoise',
        }),
        svgEl('feDisplacementMap', {
          in: 'SourceGraphic',
          in2: 'washNoise',
          scale: round2(gouacheScale),
          xChannelSelector: 'R',
          yChannelSelector: 'G',
        }),
      ]
    );

    // Subtle multiplane acetate cel separation shadow (#cel-drop-shadow)
    const celDropShadowFilter = svgEl(
      'filter',
      {
        id: celIds.celDropShadow,
        x: '-12%',
        y: '-12%',
        width: '124%',
        height: '124%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feDropShadow', {
          dx: 1.5,
          dy: 2.2,
          stdDeviation: 1.8,
          'flood-color': celColors.contactShadow,
          'flood-opacity': 0.28,
        }),
      ]
    );

    // Soft optical halation glow for practical lights, fireflies, moon & sparkles (#cel-soft-glow)
    const celSoftGlowFilter = svgEl(
      'filter',
      {
        id: celIds.celSoftGlow,
        x: '-35%',
        y: '-35%',
        width: '170%',
        height: '170%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feGaussianBlur', {
          in: 'SourceGraphic',
          stdDeviation: 4.5,
          result: 'blurred',
        }),
        svgEl('feMerge', {}, [
          svgEl('feMergeNode', { in: 'blurred' }),
          svgEl('feMergeNode', { in: 'SourceGraphic' }),
        ]),
      ]
    );

    // Warm 1970s–80s Eastmancolor / Technicolor theatrical print grade (#cel-grade)
    const celGradeFilter = svgEl(
      'filter',
      {
        id: celIds.celGrade,
        x: '0%',
        y: '0%',
        width: '100%',
        height: '100%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feColorMatrix', {
          in: 'SourceGraphic',
          type: 'saturate',
          values: '1.12',
          result: 'celSat',
        }),
        svgEl(
          'feComponentTransfer',
          {
            in: 'celSat',
            result: 'celOut',
          },
          [
            svgEl('feFuncR', { type: 'linear', slope: 1.03, intercept: 0.008 }),
            svgEl('feFuncG', { type: 'linear', slope: 1.01, intercept: 0.004 }),
            svgEl('feFuncB', { type: 'linear', slope: 0.99, intercept: 0.006 }),
          ]
        ),
      ]
    );

    // Fine 35mm celluloid film grain (#film-grain)
    const filmGrainFilter = svgEl(
      'filter',
      {
        id: celIds.filmGrain,
        x: '0%',
        y: '0%',
        width: '100%',
        height: '100%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feTurbulence', {
          type: 'fractalNoise',
          baseFrequency: celF.filmGrain.baseFrequency,
          numOctaves: celF.filmGrain.numOctaves,
          seed: seed + 30,
          result: 'grain',
        }),
        svgEl('feColorMatrix', {
          in: 'grain',
          type: 'saturate',
          values: '0',
        }),
      ]
    );

    // Warm theatrical optical vignette (#film-vignette)
    const filmVignetteGrad = svgEl(
      'radialGradient',
      {
        id: celIds.filmVignette,
        cx: '50%',
        cy: '50%',
        r: '68%',
        fx: '50%',
        fy: '50%',
      },
      [
        svgEl('stop', { offset: '52%', 'stop-color': celColors.backdropDark, 'stop-opacity': 0 }),
        svgEl('stop', { offset: '84%', 'stop-color': celColors.backdropDark, 'stop-opacity': 0.16 }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': celColors.backdropDark,
          'stop-opacity': celF.filmGrain.vignetteEdgeOpacity,
        }),
      ]
    );

    // Fallback opaque flat cel patterns for any legacy crayon material referenced in a classic_cel scene
    const fallbackCelPatterns = [
      svgEl(
        'pattern',
        { id: TOKENS.patterns.markerIndigoNight, width: 16, height: 16, patternUnits: 'userSpaceOnUse' },
        svgEl('rect', { width: 16, height: 16, fill: celColors.nightSkyMid })
      ),
      ...DRY_CRAYON_SPECS.map((spec) =>
        svgEl(
          'pattern',
          { id: spec.id, width: 16, height: 16, patternUnits: 'userSpaceOnUse' },
          svgEl('rect', { width: 16, height: 16, fill: spec.baseColor })
        )
      ),
      renderPaperFleckPattern(),
    ];

    // Alias #crayon-stroke and #crayon-outline cleanly to subtle Xerox scale so fallback assets look harmonious
    const fallbackCrayonStroke = svgEl(
      'filter',
      {
        id: TOKENS.filters.ids.crayonStroke,
        x: '-4%',
        y: '-4%',
        width: '108%',
        height: '108%',
        'color-interpolation-filters': 'sRGB',
      },
      [
        svgEl('feTurbulence', {
          type: 'fractalNoise',
          baseFrequency: celF.xerox.baseFrequency,
          numOctaves: celF.xerox.numOctaves,
          seed: xeroxSeed,
          result: 'xNoise',
        }),
        svgEl('feDisplacementMap', {
          in: 'SourceGraphic',
          in2: 'xNoise',
          scale: round2(xeroxScale),
          xChannelSelector: 'R',
          yChannelSelector: 'G',
        }),
      ]
    );

    return svgEl('defs', {}, [
      xeroxInkFilter,
      gouacheWashFilter,
      celDropShadowFilter,
      celSoftGlowFilter,
      celGradeFilter,
      filmGrainFilter,
      filmVignetteGrad,
      fallbackCrayonStroke,
      crayonOutlineFilter,
      paperTextureFilter,
      vibrantGradeFilter,
      ...fallbackCelPatterns,
      ...extra,
    ]);
  }

  const patterns = [
    renderMarkerIndigoPattern(),
    ...DRY_CRAYON_SPECS.map((spec) => renderDryCrayonPattern(spec, vibrant)),
    renderPaperFleckPattern(),
  ];

  return svgEl('defs', {}, [
    crayonStrokeFilter,
    crayonOutlineFilter,
    paperTextureFilter,
    vibrantGradeFilter,
    ...patterns,
    ...extra,
  ]);
}

/**
 * Generates Layer 3 of the Mandatory 3-Layer Stack:
 * Full-frame physical cold-press watercolor paper texture overlay (`mix-blend-mode: multiply`)
 * plus dry-brush grain flecks that punch warm paper tooth (`#F4EFE6`) across solid fills.
 */
export function renderPaperCompositeLayer(
  width: number = TOKENS.canvas.width,
  height: number = TOKENS.canvas.height,
  enablePaperTexture = true,
  vibrant = false
): string {
  if (!enablePaperTexture) {
    return svgEl('g', { id: 'layer-3-paper-composite', 'data-enabled': 'false' });
  }

  const fleckOpacity = vibrant
    ? TOKENS.filters.vibrantGrade.paperFleckOpacity
    : TOKENS.filters.paperGrain.fleckOpacity;
  const overlayOpacity = vibrant
    ? TOKENS.filters.vibrantGrade.paperOverlayOpacity
    : TOKENS.filters.paperGrain.overlayOpacity;

  return svgEl(
    'g',
    {
      id: 'layer-3-paper-composite',
      'data-enabled': 'true',
      'data-vibrant': vibrant ? 'true' : 'false',
      style: 'pointer-events: none; isolation: isolate;',
    },
    [
      // 1. Dry-brush paper fleck scatter punching tiny #F4EFE6 flecks across crayon fills
      svgEl('rect', {
        x: 0,
        y: 0,
        width,
        height,
        fill: svgUrl(TOKENS.patterns.paperFlecks),
        opacity: fleckOpacity,
      }),
      // 2. Cold-press watercolor paper tooth multiply composite
      svgEl('rect', {
        x: 0,
        y: 0,
        width,
        height,
        filter: svgUrl(TOKENS.filters.ids.paperTexture),
        style: 'mix-blend-mode: multiply;',
        opacity: overlayOpacity,
      }),
      // 3. Subtle warm watercolor paper deckle edge frame
      svgEl('rect', {
        x: 4,
        y: 4,
        width: width - 8,
        height: height - 8,
        rx: 18,
        ry: 18,
        fill: 'none',
        stroke: TOKENS.colors.paperDeep,
        'stroke-width': 6,
        filter: svgUrl(TOKENS.filters.ids.crayonOutline),
        opacity: 0.65,
      }),
    ]
  );
}

/**
 * Generates Layer 3 for `classic_cel` mode:
 * Subtle 35mm celluloid film grain + soft optical cinema gate vignette.
 * Replaces cold-press paper multiply and deckle borders with theatrical animation film finish.
 */
export function renderFilmCompositeLayer(
  width: number = TOKENS.canvas.width,
  height: number = TOKENS.canvas.height,
  enableFilmGrain = true
): string {
  const celIds = TOKENS.classicCel.filters.ids;
  const grainOpacity = TOKENS.classicCel.filters.filmGrain.overlayOpacity;

  return svgEl(
    'g',
    {
      id: 'layer-3-film-composite',
      'data-enabled': enableFilmGrain ? 'true' : 'false',
      style: 'pointer-events: none; isolation: isolate;',
    },
    [
      // 1. Subtle 35mm optical vignette framing the painted cel canvas
      svgEl('rect', {
        x: 0,
        y: 0,
        width,
        height,
        fill: svgUrl(celIds.filmVignette),
      }),
      // 2. Fine celluloid film grain (optional toggle)
      enableFilmGrain
        ? svgEl('rect', {
            x: 0,
            y: 0,
            width,
            height,
            filter: svgUrl(celIds.filmGrain),
            style: 'mix-blend-mode: overlay;',
            opacity: grainOpacity,
          })
        : '',
    ]
  );
}

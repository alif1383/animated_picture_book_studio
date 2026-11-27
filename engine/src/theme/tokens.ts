/**
 * Centralized Design Tokens for the Picture-Book Crayon Video Engine.
 * Single source of truth for all colors, paper textures, crayon filter parameters,
 * stroke widths, typography scales, frame rates, and standard object dimensions.
 */
export const TOKENS = {
  colors: {
    // Paper Base (Cold-press watercolor paper — never pure #FFFFFF)
    paperWarm: '#F4EFE6',
    paperShadow: '#EDE6D6',
    paperDeep: '#E2D9C5',

    // Outlines & Pencil (Charcoal/sepia pencil — never pure #000000)
    charcoalOutline: '#2B231D',
    faintPencil: '#4A4238',

    // Marker Wash Fills
    indigoNight: '#2E3B6E',
    indigoNightDark: '#222C56',
    indigoNightLight: '#3D4D87',

    // Dry Crayon & Oil Pastel Fills
    terracottaRoof: '#C84B31',
    terracottaDark: '#A63822',
    ochreWall: '#E3B464',
    ochreLight: '#EED08A',
    warmMoon: '#F0C243',
    moonCheek: '#E58B3A',
    sunsetOrange: '#E87A3E',
    sunsetGold: '#F29F4B',
    nightcapBlue: '#6A9EC0',
    nightcapWhite: '#F2EDE2',
    grassGreen: '#6B9E58',
    treeGreen: '#588A47',
    curtainPink: '#E5989B',
    windowGlow: '#F4CA44',
    dressPink: '#E8A5B8',
    hairBrown: '#6D4C3D',
    sweaterPurple: '#8B5A8C',
    sweaterPurpleDark: '#6A3F6B',
    pantsCream: '#F2E5C6',
    skinPeach: '#F6DFC9',
    tabbyGreyBrown: '#5C4D43',
    storeTeal: '#5B8E8D',
    storeAwningRed: '#D15B47',
    woodBrown: '#8A5A3B',
    starWhite: '#F6F2E9',

    // Vibrant Daylight & Cutout Meadow Palette (Ref Image 5)
    skyPastelBlue: '#9CCEF4',
    skyPastelLight: '#B6DDF9',
    meadowGreen: '#93C969',
    meadowHorizonRose: '#C86D78',
    radishRed: '#EE4B2B',
    emeraldFrond: '#149658',
    bananaYellow: '#FFCE34',
    royalCrayonBlue: '#2541B2',
    catLightBlue: '#79C2F2',
    watermelonPink: '#F25268',
    cherryRose: '#F26B8A',
    cloudWhite: '#FAF8F4',
    cutoutHaloWhite: '#FAF8F2',
    cobaltStarBlue: '#1D63DC',
  },

  strokes: {
    outlineHeavy: 3.5,
    outlineMedium: 2.6,
    outlineThin: 1.8,
    annotationPencil: 1.4,
    dasharrayDashed: '6 5',
    dasharrayDotted: '2 5',
    linecap: 'round',
    linejoin: 'round',
  },

  timing: {
    fps: 6,
    frameDurationMs: 1000 / 6, // ~166.67ms per stepped tick
    lineBoilSeedCount: 6,
    lineBoilSeeds: [1, 2, 3, 4, 5, 6],
    defaultFillSteps: 10,
    sampleSceneDurationSec: 28,
  },

  filters: {
    ids: {
      crayonStroke: 'crayon-stroke',
      crayonOutline: 'crayon-outline',
      paperTexture: 'paper-texture',
      dryBrushMask: 'dry-brush-mask',
      vibrantGrade: 'vibrant-grade',
    },
    crayonTurbulence: {
      baseFrequency: '0.045 0.055',
      numOctaves: 3,
      displacementScale: 4.2,
      grainFrequency: 0.35,
      grainOctaves: 2,
      grainScale: 1.6,
      outlineFrequency: 0.065,
      outlineOctaves: 2,
      outlineScale: 2.0,
    },
    paperGrain: {
      baseFrequency: 0.09,
      numOctaves: 4,
      seed: 11,
      overlayOpacity: 0.72,
      fleckOpacity: 0.85,
    },
    vibrantGrade: {
      saturation: 1.42,
      contrastSlope: 1.09,
      contrastIntercept: -0.02,
      paperOverlayOpacity: 0.35,
      paperFleckOpacity: 0.48,
    },
  },

  patterns: {
    markerIndigoNight: 'pat-marker-indigo-night',
    crayonTerracotta: 'pat-crayon-terracotta',
    crayonOchre: 'pat-crayon-ochre',
    crayonWarmMoon: 'pat-crayon-warm-moon',
    crayonSunsetOrange: 'pat-crayon-sunset-orange',
    crayonGrassGreen: 'pat-crayon-grass-green',
    crayonTreeGreen: 'pat-crayon-tree-green',
    crayonStoreTeal: 'pat-crayon-store-teal',
    crayonAwningRed: 'pat-crayon-awning-red',
    crayonDressPink: 'pat-crayon-dress-pink',
    crayonNightcapBlue: 'pat-crayon-nightcap-blue',
    crayonWoodBrown: 'pat-crayon-wood-brown',
    crayonWindowGlow: 'pat-crayon-window-glow',
    crayonSkyBlue: 'pat-crayon-sky-blue',
    crayonMeadowGreen: 'pat-crayon-meadow-green',
    crayonRadishRed: 'pat-crayon-radish-red',
    crayonEmeraldFrond: 'pat-crayon-emerald-frond',
    crayonBananaYellow: 'pat-crayon-banana-yellow',
    crayonRoyalBlue: 'pat-crayon-royal-blue',
    crayonCatBlue: 'pat-crayon-cat-blue',
    crayonWatermelonPink: 'pat-crayon-watermelon-pink',
    crayonCherryRose: 'pat-crayon-cherry-rose',
    crayonSweaterPurple: 'pat-crayon-sweater-purple',
    paperFlecks: 'pat-paper-flecks',
  },

  canvas: {
    width: 1280,
    height: 720,
    viewBox: '0 0 1280 720',
    aspectRatio: '16 / 9',
  },

  typography: {
    fontFamilyHand: '"Comic Sans MS", "Bradley Hand", "Chalkboard SE", cursive',
    fontFamilyMono: '"Courier New", monospace',
    sizeAnnotation: 19,
    sizeSoundEffect: 22,
    sizeCaption: 24,
  },

  /**
   * Classic 1970s–1980s Hand-Drawn Cel Animation Design Tokens
   * Inspired by theatrical Xerox ink-and-paint & painted watercolor/gouache backgrounds
   * (e.g., Disney's Robin Hood 1973 & Mickey's Christmas Carol 1983).
   */
  classicCel: {
    colors: {
      // Theatre screen & Xerox pencil-ink outlines (warm dark charcoal, never pure #000000)
      backdropDark: '#121014',
      xeroxInk: '#1D1815',
      xeroxInkSoft: '#3A312A',
      celCream: '#FAF6EC',
      celBubbleFill: '#FBF7EE',
      goldTitle: '#F2CC6B',
      goldTitleShadow: '#4A3418',
      contactShadow: '#121824',

      // Painted Gouache Night Sky & Atmospheric Horizon
      nightSkyZenith: '#111A36',
      nightSkyMid: '#1C2E54',
      nightSkyHorizon: '#2D4B68',
      nightMistTeal: '#43697D',
      nightDeepGlade: '#0E1C2E',
      nightGladeMid: '#183047',
      nightGladeHorizon: '#284A5E',

      // Painted Woodland & Garden Foliage (Robin Hood / Christmas Carol earthy gouache)
      foliageShadow: '#162A2C',
      foliageMid: '#24453E',
      foliageLit: '#3D6A54',
      foliageRim: '#6A9477',
      grassNightDeep: '#1E3A32',
      grassNightMid: '#2C5141',
      grassNightLit: '#4A7557',
      gladeGlow: '#3F6E61',

      // Painted Earthen Lane & Stonework
      pathEarthDark: '#4D4037',
      pathEarthMid: '#766352',
      pathMoonlit: '#A6937A',
      stoneBase: '#8E919C',
      stoneLight: '#C8CBD0',
      stoneShadow: '#515666',
      waterDeep: '#193257',
      waterMid: '#2E5882',
      waterHighlight: '#96C9DF',

      // Warm Practical Lighting (Lantern, Cottage Windows, Fireflies)
      warmAmberCore: '#FFF1B8',
      warmAmberGlow: '#F7C95C',
      warmAmberWash: '#E69B3A',
      warmAmberDeep: '#B86A24',

      // Painted Timber & Cottage Gouache
      woodDark: '#3E271C',
      woodMid: '#68442E',
      woodLit: '#8E6242',
      cottagePlaster: '#C9A878',
      cottagePlasterShadow: '#7E6A58',
      cottageRoof: '#8C3A2B',
      cottageRoofShadow: '#54221B',
      cottageShutter: '#3B666B',
      cottageShutterShadow: '#264549',
      ironDark: '#23262E',
      ironHighlight: '#5A6475',

      // Mochi Classic Cel Paint Ramp (base + shadow + moonlight rim)
      mochiFurBase: '#5A78A8',
      mochiFurShadow: '#354970',
      mochiFurRim: '#A5C1E3',
      mochiStripe: '#263454',
      mochiCream: '#EFE6D5',
      mochiCreamShadow: '#C7BDAE',
      mochiEarPink: '#D98E8E',
      mochiNose: '#C8646E',
      mochiTongue: '#D96A73',
      mochiMouthInner: '#5C2229',
      mochiCollar: '#B8342A',
      mochiCollarShadow: '#7A1E18',
      mochiGold: '#E8B838',
      mochiGoldHighlight: '#FBE592',
      mochiEyeIris: '#D99B38',

      // Classic Painted Moon & Velvet Nightcap
      moonCream: '#F7E098',
      moonAmber: '#E3B04B',
      moonShadow: '#C48E35',
      moonCrater: '#B87F2C',
      nightcapBlue: '#48749E',
      nightcapShadow: '#2B4B6B',
      nightcapStripe: '#DCE6EE',
      starGlow: '#FFF4C4',
      flowerCream: '#F2E8D0',
      flowerBlue: '#8EB8D9',
      flowerRose: '#D68B96',
    },

    strokes: {
      xeroxHeavy: 2.4,
      xeroxMedium: 1.85,
      xeroxFine: 1.2,
      sketchLine: 0.95,
    },

    timing: {
      fps: 12, // Classic Disney "animated on twos" (12 drawings/sec inside 24fps film)
      frameDurationMs: 1000 / 12,
      containerFps: 24,
    },

    filters: {
      ids: {
        xeroxInk: 'xerox-ink',
        gouacheWash: 'gouache-wash',
        celDropShadow: 'cel-drop-shadow',
        celSoftGlow: 'cel-soft-glow',
        celGrade: 'cel-grade',
        filmGrain: 'film-grain',
        filmVignette: 'film-vignette',
      },
      xerox: {
        baseFrequency: '0.075 0.085',
        numOctaves: 2,
        displacementScale: 0.55,
      },
      gouache: {
        baseFrequency: '0.032 0.042',
        numOctaves: 3,
        displacementScale: 1.2,
      },
      filmGrain: {
        baseFrequency: 0.68,
        numOctaves: 2,
        overlayOpacity: 0.075,
        vignetteEdgeOpacity: 0.34,
      },
    },

    typography: {
      fontFamilySerif: '"Georgia", "Palatino Linotype", "Book Antiqua", serif',
      fontFamilyDialogue: '"Trebuchet MS", "Georgia", serif',
    },
  },
} as const;

export type ThemeTokens = typeof TOKENS;
export type ColorTokenKey = keyof ThemeTokens['colors'];
export type ColorToken = ThemeTokens['colors'][ColorTokenKey];
export type CrayonMaterialId = keyof ThemeTokens['patterns'];
export type PatternIdValue = ThemeTokens['patterns'][CrayonMaterialId];
export type FilterIdKey = keyof ThemeTokens['filters']['ids'];
export type FilterId = ThemeTokens['filters']['ids'][FilterIdKey];

/** Helper to format an SVG url(#id) reference from a pattern, filter, or mask ID */
export function svgUrl(id: PatternIdValue | FilterId | string): string {
  return `url(#${id})`;
}

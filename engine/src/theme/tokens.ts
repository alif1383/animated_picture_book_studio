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
   * Inspired by theatrical electrostatic Xerox graphite ink-and-paint cels over
   * dappled watercolor/gouache illustration-board backgrounds photographed on 35mm
   * Eastmancolor film (e.g., Disney's Robin Hood 1973 & Mickey's Christmas Carol 1983).
   */
  classicCel: {
    colors: {
      // Theatre gate & electrostatic Xerox graphite toner outlines (never pure #000000/#FFFFFF)
      backdropDark: '#171416',
      xeroxInk: '#221D1A',
      xeroxInkSoft: '#463C34',
      xeroxGraphite: '#2C2520',
      pencilOliveCharcoal: '#2E3628',
      pencilSlateCharcoal: '#2B3238',
      celCream: '#EAE0CA',
      parchmentCream: '#EAE0CA',
      celBubbleFill: '#EFE7D4',
      goldTitle: '#C9A44C',
      antiqueGold: '#C9A44C',
      goldTitleShadow: '#3A2814',
      contactShadow: '#1A1C22',

      // Painted Gouache Twilight Sky & Analog Slate-Blue Atmosphere
      nightSkyZenith: '#1B2438',
      nightSkyMid: '#293954',
      nightSkyHorizon: '#425A6E',
      nightMistTeal: '#5B747E',
      nightDeepGlade: '#172530',
      nightGladeMid: '#243A46',
      nightGladeHorizon: '#3B5661',
      slateBlue: '#516984',

      // Painted Woodland & Garden Gouache (Earthy Robin Hood sage/olive pigments)
      foliageShadow: '#23332A',
      foliageMid: '#374E3B',
      foliageLit: '#546E4C',
      foliageRim: '#7D9268',
      sageFoliage: '#6D825D',
      oliveCanopy: '#4B5E3E',
      grassNightDeep: '#2A3D2F',
      grassNightMid: '#3C543E',
      grassNightLit: '#5B724E',
      gladeGlow: '#526B55',

      // Painted Earthen Lane, Russet/Ochre Earth & Weathered Stonework
      pathEarthDark: '#5A4A3C',
      pathEarthMid: '#826C54',
      pathMoonlit: '#AF997B',
      russetEarth: '#8B5438',
      ochreEarth: '#B3884D',
      stoneBase: '#8E8D88',
      stoneLight: '#C6C1B5',
      stoneShadow: '#585753',
      waterDeep: '#243C54',
      waterMid: '#3D5E78',
      waterHighlight: '#9AB8C2',

      // Warm Incandescent Practical Lighting (35mm optical halation, no neon RGB)
      warmAmberCore: '#EFE0AE',
      warmAmberGlow: '#DFB664',
      warmAmberWash: '#C78A42',
      warmAmberDeep: '#945B29',

      // Painted Timber, Illustration Board Tooth & Cottage Gouache
      woodDark: '#473124',
      woodMid: '#6E4C36',
      woodLit: '#946D4E',
      cottagePlaster: '#C8B28E',
      cottagePlasterShadow: '#85745E',
      cottageRoof: '#8D4936',
      cottageRoofShadow: '#5A2D22',
      cottageShutter: '#486864',
      cottageShutterShadow: '#304947',
      ironDark: '#2C2D30',
      ironHighlight: '#62676E',
      boardToothLight: '#E6DEC9',
      boardToothWarm: '#D6C9AF',

      // Mochi Flat Matte Analog Cel Paint Ramp (physical paint-jar pigments)
      mochiFurBase: '#5D7496',
      mochiFurShadow: '#3E506D',
      mochiFurRim: '#99AFC7',
      mochiStripe: '#2E3B52',
      mochiCream: '#E8DFCA',
      mochiCreamShadow: '#C2B7A3',
      mochiEarPink: '#C98A86',
      dustyRose: '#CFA0A4',
      mochiNose: '#B5666A',
      mochiTongue: '#C46F73',
      mochiMouthInner: '#5E2B2F',
      mochiCollar: '#A84234',
      mochiCollarShadow: '#732920',
      mochiGold: '#CDA149',
      mochiGoldHighlight: '#E6CD88',
      mochiEyeIris: '#C89242',

      // Classic Painted Moon & Velvet Nightcap
      moonCream: '#ECE0B6',
      moonAmber: '#D4A858',
      moonShadow: '#B3873E',
      moonCrater: '#A17534',
      nightcapBlue: '#4F6E8C',
      nightcapShadow: '#354D66',
      nightcapStripe: '#D8DDD8',
      starGlow: '#EFE4BE',
      flowerCream: '#E8DEC6',
      flowerBlue: '#8AA7BD',
      flowerRose: '#C78990',
    },

    strokes: {
      xeroxHeavy: 2.5,
      xeroxMedium: 1.9,
      xeroxFine: 1.25,
      sketchLine: 0.9,
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
      boardTexture: {
        id: 'bg-board-texture',
        baseFrequency: '0.012 0.018',
        numOctaves: 4,
        seed: 19,
        overlayOpacity: 0.22,
      },
      watercolorSoft: {
        id: 'watercolor-wash-soft',
        baseFrequency: '0.018 0.024',
        numOctaves: 3,
        displacementScale: 14,
        blurStdDev: 4.5,
      },
      pencilBgSketch: {
        id: 'pencil-bg-sketch',
        baseFrequency: 0.09,
        numOctaves: 2,
        displacementScale: 1.15,
      },
      xerox: {
        baseFrequency: '0.055 0.065',
        numOctaves: 3,
        displacementScale: 1.55,
        gritFrequency: 0.42,
        gritOctaves: 2,
        gritScale: 0.75,
      },
      gouache: {
        baseFrequency: '0.028 0.036',
        numOctaves: 3,
        displacementScale: 3.2,
        softBlurStdDev: 0.55,
      },
      celDropShadow: {
        dx: 1.2,
        dy: 1.8,
        stdDeviation: 1.1,
        floodOpacity: 0.22,
      },
      celGrade: {
        saturation: 1.05,
        lensBlurStdDev: 0,
      },
      filmGrain: {
        baseFrequency: 0.72,
        numOctaves: 2,
        overlayOpacity: 0.025,
        vignetteEdgeOpacity: 0.22,
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

import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

const STRAWBERRY_BEACH_ACTS: StoryAct[] = [
  {
    id: 'beach-party',
    title: 'Act I · Sunny Beach Birthday Party',
    startTime: 0,
    endTime: 10,
    caption:
      'On the warm golden beach beside the sparkling ocean, Singing Radish, Onion, and friends sing Happy Birthday and Strawberry blows out her candles!',
  },
  {
    id: 'scared-of-water',
    title: 'Act II · Scared of the Waves & Friends Bring Floaties',
    startTime: 10,
    endTime: 19,
    caption:
      'A big splashy wave startles Strawberry at the shoreline — so Onion and friends hurry right over with colorful floaties to comfort her!',
  },
  {
    id: 'floatie-water-play',
    title: 'Act III · Floaties On & Splashing in the Ocean!',
    startTime: 19,
    endTime: 32,
    caption:
      'Wearing her golden rubber-ducky floatie alongside Onion and friends in bright swim rings, Strawberry splashes in the waves and tosses the beach ball!',
  },
  {
    id: 'sunset-shore',
    title: 'Act IV · Sunset Glow & Hopping Out Onto the Sand',
    startTime: 32,
    endTime: 39,
    caption:
      'As warm orange sunset colors the sky and the sleepy Sun sinks, everyone hops out of the water and stacks their floaties neatly on the sand.',
  },
  {
    id: 'moonlight-goodbye',
    title: 'Act V · Moonrise Over the Ocean & Waving Bye-Bye',
    startTime: 39,
    endTime: 46,
    caption:
      'Twinkling stars and the smiling Crayon Moon rise over the night ocean while Strawberry, Onion, and all their friends wave goodbye!',
  },
];

const STRAWBERRY_BEACH_NODES: SceneNode[] = [
  // === SKY VIGNETTE PATCHES (zIndex 1–2) ===
  {
    id: 'sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 0.4,
    bounds: { x: 16, y: 12, width: 1248, height: 410 },
    d: 'M 16 14 Q 640 10, 1264 16 L 1264 415 Q 940 424, 620 412 Q 310 422, 16 410 Z',
  },
  {
    id: 'sunset-patch',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'crayonSunsetOrange',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 0,
    visible: false,
    bounds: { x: 16, y: 12, width: 1248, height: 420 },
    d: 'M 16 14 Q 640 10, 1264 16 L 1264 420 Q 940 430, 620 416 Q 310 426, 16 414 Z',
  },
  {
    id: 'night-sky-patch',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'markerIndigoNight',
    fillStyle: 'top-down-bands',
    fillSteps: 12,
    fillProgress: 0,
    wrapRightNegativeSpace: true,
    visible: false,
    bounds: { x: 16, y: 12, width: 1248, height: 430 },
    d: 'M 16 14 Q 640 10, 1264 16 L 1264 426 Q 940 434, 620 420 Q 310 428, 16 418 Z',
  },

  // === OCEAN WATER & GOLDEN SANDY BEACH (zIndex 3–6) ===
  {
    id: 'ocean-water-patch',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonCatBlue',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 510, y: 382, width: 758, height: 328 },
    d: 'M 520 392 Q 890 382, 1266 392 L 1266 708 L 664 708 C 618 612, 568 500, 520 392 Z',
  },
  {
    id: 'ocean-shallows-patch',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 8,
    fillProgress: 1.0,
    opacity: 0.72,
    bounds: { x: 520, y: 386, width: 746, height: 85 },
    d: 'M 520 392 Q 890 382, 1266 392 L 1266 462 Q 910 472, 554 458 Z',
  },
  {
    id: 'ocean-night-patch',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonRoyalBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 1.0,
    opacity: 0,
    visible: false,
    bounds: { x: 510, y: 382, width: 758, height: 328 },
    d: 'M 520 392 Q 890 382, 1266 392 L 1266 708 L 664 708 C 618 612, 568 500, 520 392 Z',
  },
  {
    id: 'moon-ocean-shimmer',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonWarmMoon',
    fillStyle: 'top-down-bands',
    fillSteps: 8,
    fillProgress: 0,
    opacity: 0,
    visible: false,
    bounds: { x: 930, y: 405, width: 165, height: 145 },
    d: 'M 968 408 Q 1012 404, 1056 408 C 1082 448, 1072 508, 1038 542 Q 1010 550, 982 540 C 948 506, 942 448, 968 408 Z',
  },
  {
    id: 'beach-sand-patch',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    outlined: true,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 14, y: 388, width: 676, height: 322 },
    d: 'M 16 406 Q 290 390, 548 392 C 588 486, 634 596, 682 708 L 16 708 Z',
  },

  // === SKY CELESTIALS, CLOUDS & OCEAN WAVE PROPS (zIndex 6–9) ===
  {
    id: 'ocean-shore-foam',
    type: 'prop',
    kind: 'ocean_waves',
    variant: 0,
    zIndex: 6,
    x: 586,
    y: 554,
  },
  {
    id: 'ocean-waves-mid',
    type: 'prop',
    kind: 'ocean_waves',
    variant: 1,
    count: 3,
    zIndex: 6,
    x: 845,
    y: 448,
  },
  {
    id: 'ocean-waves-far',
    type: 'prop',
    kind: 'ocean_waves',
    variant: 2,
    count: 3,
    zIndex: 6,
    x: 1095,
    y: 505,
  },
  {
    id: 'cloud-left',
    type: 'prop',
    kind: 'fluffy_cloud',
    variant: 1,
    zIndex: 6,
    x: 420,
    y: 95,
    scale: 1.05,
  },
  {
    id: 'cloud-right',
    type: 'prop',
    kind: 'fluffy_cloud',
    variant: 2,
    zIndex: 6,
    x: 890,
    y: 108,
    scale: 0.96,
  },
  {
    id: 'star-cluster',
    type: 'prop',
    kind: 'star_cluster',
    variant: 2,
    count: 0,
    zIndex: 7,
    x: 42,
    y: 26,
    visible: false,
  },
  {
    id: 'sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 7,
    x: 142,
    y: 96,
    scale: 0.68,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'awake',
    wearingNightcap: false,
    zIndex: 8,
    x: 1012,
    y: 255,
    scale: 0.8,
    opacity: 0,
    visible: false,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // === BEACH UMBRELLA & STANDALONE FLOATIE PROPS (zIndex 14–22) ===
  {
    id: 'beach-umbrella',
    type: 'prop',
    kind: 'beach_umbrella',
    variant: 1,
    zIndex: 14,
    x: 235,
    y: 548,
    scale: 1.08,
  },
  {
    id: 'floatie-prop-ducky',
    type: 'prop',
    kind: 'swim_floatie',
    variant: 0,
    zIndex: 22,
    x: 468,
    y: 615,
    scale: 0.95,
    visible: false,
  },
  {
    id: 'floatie-prop-red',
    type: 'prop',
    kind: 'swim_floatie',
    variant: 1,
    zIndex: 21,
    x: 525,
    y: 605,
    scale: 0.92,
    visible: false,
  },
  {
    id: 'floatie-prop-blue',
    type: 'prop',
    kind: 'swim_floatie',
    variant: 2,
    zIndex: 20,
    x: 388,
    y: 612,
    scale: 0.92,
    visible: false,
  },
  {
    id: 'floatie-prop-pink',
    type: 'prop',
    kind: 'swim_floatie',
    variant: 3,
    zIndex: 19,
    x: 552,
    y: 635,
    scale: 0.9,
    visible: false,
  },

  // === 8 PARTY & SWIMMING CUTOUT CHARACTERS (zIndex 18–27) ===
  {
    id: 'watermelon-slice',
    type: 'character',
    kind: 'watermelon_slice',
    state: 'waving',
    floatieVariant: 3,
    zIndex: 18,
    x: 165,
    y: 522,
  },
  {
    id: 'cherry-twins',
    type: 'character',
    kind: 'cherry_twins',
    state: 'waving',
    floatieVariant: 4,
    zIndex: 19,
    x: 492,
    y: 504,
  },
  {
    id: 'blue-party-cat',
    type: 'character',
    kind: 'blue_party_cat',
    state: 'sitting',
    zIndex: 23,
    x: 132,
    y: 642,
  },
  {
    id: 'olive-sprout',
    type: 'character',
    kind: 'olive_sprout',
    state: 'waving',
    zIndex: 23,
    x: 618,
    y: 658,
  },
  {
    id: 'crying-onion',
    type: 'character',
    kind: 'crying_onion',
    state: 'waving',
    floatieVariant: 1,
    zIndex: 24,
    x: 538,
    y: 566,
  },
  {
    id: 'singing-radish',
    type: 'character',
    kind: 'singing_radish',
    state: 'singing',
    floatieVariant: 2,
    zIndex: 25,
    x: 292,
    y: 612,
  },
  {
    id: 'birthday-cake',
    type: 'prop',
    kind: 'birthday_cake',
    lit: true,
    zIndex: 25,
    x: 378,
    y: 620,
    scale: 0.96,
  },
  {
    id: 'birthday-strawberry',
    type: 'character',
    kind: 'birthday_strawberry',
    state: 'waving',
    floatieVariant: 0,
    zIndex: 26,
    x: 462,
    y: 616,
    scale: 1.06,
  },
  {
    id: 'party-banana',
    type: 'character',
    kind: 'party_banana',
    state: 'waving',
    floatieVariant: 3,
    zIndex: 27,
    x: 568,
    y: 646,
  },

  // === SPLASHES, BEACH BALL, MUSIC NOTES & CONFETTI (zIndex 28–34) ===
  {
    id: 'shore-scare-splash',
    type: 'prop',
    kind: 'water_splash',
    variant: 1,
    count: 8,
    zIndex: 28,
    x: 618,
    y: 568,
    scale: 1.28,
    visible: false,
  },
  {
    id: 'ocean-play-splash-1',
    type: 'prop',
    kind: 'water_splash',
    variant: 2,
    count: 7,
    zIndex: 28,
    x: 805,
    y: 592,
    scale: 1.05,
    visible: false,
  },
  {
    id: 'ocean-play-splash-2',
    type: 'prop',
    kind: 'water_splash',
    variant: 3,
    count: 6,
    zIndex: 28,
    x: 985,
    y: 552,
    scale: 0.98,
    visible: false,
  },
  {
    id: 'beach-ball',
    type: 'prop',
    kind: 'beach_ball',
    variant: 1,
    zIndex: 31,
    x: 192,
    y: 588,
    scale: 0.95,
  },
  {
    id: 'radish-music-notes',
    type: 'prop',
    kind: 'music_notes',
    variant: 1,
    count: 4,
    zIndex: 33,
    x: 345,
    y: 448,
    visible: false,
  },
  {
    id: 'party-confetti',
    type: 'prop',
    kind: 'party_confetti',
    variant: 1,
    count: 24,
    zIndex: 34,
    x: 425,
    y: 235,
    visible: false,
  },

  // === HAND-LETTERED PICTURE-BOOK ANNOTATIONS (zIndex 37–39) ===
  {
    id: 'banner-happy-birthday',
    type: 'annotation',
    zIndex: 38,
    x: 185,
    y: 92,
    text: 'Happy Birthday, Strawberry! ★',
    color: TOKENS.colors.terracottaRoof,
    fontSize: 32,
    visible: false,
  },
  {
    id: 'annot-scared-waves',
    type: 'annotation',
    zIndex: 38,
    x: 388,
    y: 458,
    text: 'Eep! Big waves!',
    color: TOKENS.colors.charcoalOutline,
    fontSize: 25,
    visible: false,
  },
  {
    id: 'annot-floaties-comfort',
    type: 'annotation',
    zIndex: 38,
    x: 368,
    y: 448,
    text: 'We got floaties! ★',
    color: TOKENS.colors.cobaltStarBlue,
    fontSize: 26,
    visible: false,
  },
  {
    id: 'annot-splash-play',
    type: 'annotation',
    zIndex: 38,
    x: 718,
    y: 318,
    text: 'Splash! Toss! Wheee! ♪',
    color: TOKENS.colors.cobaltStarBlue,
    fontSize: 27,
    visible: false,
  },
  {
    id: 'banner-goodnight-bye',
    type: 'annotation',
    zIndex: 39,
    x: 245,
    y: 106,
    text: 'Bye-bye, Friends! Goodnight! ★',
    color: TOKENS.colors.starWhite,
    fontSize: 32,
    visible: false,
  },
];

const STRAWBERRY_BEACH_TIMELINE: TimelineTrack[] = [
  // === SKY, SUN, MOON & OCEAN LIGHTING TRANSITIONS ===
  {
    nodeId: 'sky-patch',
    keyframes: [
      { time: 0.0, visible: true, fillProgress: 0.4, opacity: 1.0 },
      { time: 2.0, visible: true, fillProgress: 1.0, opacity: 1.0 },
      { time: 32.0, visible: true, fillProgress: 1.0, opacity: 1.0 },
      { time: 36.2, visible: true, fillProgress: 1.0, opacity: 0.0 },
      { time: 36.5, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'sunset-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
      { time: 32.0, visible: true, fillProgress: 0.15, opacity: 0.92 },
      { time: 35.5, visible: true, fillProgress: 0.95, opacity: 0.95 },
      { time: 36.5, visible: true, fillProgress: 1.0, opacity: 0.88 },
      { time: 39.2, visible: true, fillProgress: 1.0, opacity: 0.0 },
      { time: 39.5, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'night-sky-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, opacity: 1.0, hold: true },
      { time: 35.8, visible: true, fillProgress: 0.18, opacity: 1.0 },
      { time: 39.2, visible: true, fillProgress: 0.78, opacity: 1.0 },
      { time: 42.0, visible: true, fillProgress: 1.0, opacity: 1.0, hold: true },
    ],
  },
  {
    nodeId: 'ocean-night-patch',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 35.8, visible: true, opacity: 0.08 },
      { time: 39.8, visible: true, opacity: 0.56, hold: true },
    ],
  },
  {
    nodeId: 'moon-ocean-shimmer',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
      { time: 39.4, visible: true, fillProgress: 0.25, opacity: 0.35 },
      { time: 41.4, visible: true, fillProgress: 1.0, opacity: 0.85, hold: true },
    ],
  },
  {
    nodeId: 'sun',
    keyframes: [
      { time: 0.0, visible: true, x: 142, y: 96, scale: 0.68, opacity: 1.0, state: 'awake', hold: true },
      { time: 32.0, visible: true, x: 150, y: 112, scale: 0.68, opacity: 1.0, state: 'sleepy' },
      { time: 35.2, visible: true, x: 205, y: 215, scale: 0.65, opacity: 0.95, state: 'sleepy' },
      { time: 35.5, visible: true, x: 212, y: 228, scale: 0.64, opacity: 0.9, state: 'sleeping' },
      { time: 38.4, visible: true, x: 262, y: 355, scale: 0.56, opacity: 0.0, state: 'sleeping' },
      { time: 38.6, visible: false, x: 262, y: 355, scale: 0.56, opacity: 0.0, state: 'sleeping', hold: true },
    ],
  },
  {
    nodeId: 'moon',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, x: 1035, y: 265, scale: 0.78, state: 'awake', hold: true },
      { time: 38.8, visible: true, opacity: 0.25, x: 1030, y: 248, scale: 0.78, state: 'curious' },
      { time: 40.8, visible: true, opacity: 1.0, x: 1010, y: 148, scale: 0.82, state: 'awake', hold: true },
      { time: 44.0, visible: true, opacity: 1.0, x: 1010, y: 145, scale: 0.82, state: 'blinking', hold: true },
      { time: 44.5, visible: true, opacity: 1.0, x: 1010, y: 145, scale: 0.82, state: 'awake', hold: true },
    ],
  },
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 36.8, visible: true, count: 8 },
      { time: 39.6, visible: true, count: 18 },
      { time: 42.0, visible: true, count: 26, hold: true },
    ],
  },
  {
    nodeId: 'cloud-left',
    keyframes: [
      { time: 0.0, visible: true, x: 420, y: 95, opacity: 1.0 },
      { time: 32.0, visible: true, x: 472, y: 95, opacity: 0.95 },
      { time: 36.5, visible: true, x: 486, y: 95, opacity: 0.0 },
      { time: 36.8, visible: false, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'cloud-right',
    keyframes: [
      { time: 0.0, visible: true, x: 890, y: 108, opacity: 1.0 },
      { time: 32.0, visible: true, x: 942, y: 108, opacity: 0.95 },
      { time: 36.5, visible: true, x: 955, y: 108, opacity: 0.0 },
      { time: 36.8, visible: false, opacity: 0.0, hold: true },
    ],
  },

  // === CAKE, CONFETTI, MUSIC NOTES, FLOATIE PROPS, SPLASHES & BEACH BALL ===
  {
    nodeId: 'birthday-cake',
    keyframes: [
      { time: 0.0, x: 378, y: 620, scale: 0.96, lit: true, hold: true },
      { time: 6.2, x: 382, y: 620, scale: 1.04, lit: true },
      { time: 7.2, x: 382, y: 620, scale: 1.04, lit: false, hold: true },
      { time: 10.2, x: 382, y: 620, scale: 1.0, lit: false },
      { time: 11.4, x: 278, y: 628, scale: 0.88, lit: false, hold: true },
    ],
  },
  {
    nodeId: 'party-confetti',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 7.4, visible: true, count: 26 },
      { time: 9.8, visible: true, count: 16 },
      { time: 10.2, visible: false, count: 0, hold: true },
    ],
  },
  {
    nodeId: 'radish-music-notes',
    keyframes: [
      { time: 0.0, visible: false, x: 345, y: 448, count: 0, hold: true },
      { time: 0.8, visible: true, x: 345, y: 448, count: 4, hold: true },
      { time: 7.1, visible: false, x: 345, y: 448, count: 0, hold: true },
      { time: 21.0, visible: true, x: 1075, y: 418, count: 4, hold: true },
      { time: 31.2, visible: false, x: 1075, y: 418, count: 0, hold: true },
    ],
  },
  {
    nodeId: 'shore-scare-splash',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 11.8, visible: true, x: 618, y: 568, scale: 1.32, count: 9 },
      { time: 13.5, visible: true, x: 608, y: 572, scale: 1.05, count: 6 },
      { time: 13.7, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'ocean-play-splash-1',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 19.6, visible: true, x: 785, y: 592, count: 7, hold: true },
      { time: 23.5, visible: true, x: 885, y: 635, count: 8, hold: true },
      { time: 27.5, visible: true, x: 775, y: 590, count: 7, hold: true },
      { time: 33.4, visible: true, x: 655, y: 595, count: 6, hold: true },
      { time: 35.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'ocean-play-splash-2',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 20.4, visible: true, x: 965, y: 552, count: 6, hold: true },
      { time: 25.0, visible: true, x: 1048, y: 575, count: 7, hold: true },
      { time: 29.0, visible: true, x: 915, y: 548, count: 7, hold: true },
      { time: 32.2, visible: false, hold: true },
    ],
  },

  // Standalone floatie props: brought in by friends in Act II (14..18.8s), hidden in Act III while worn, stacked on sand in Acts IV–V (35.4..46s)!
  {
    nodeId: 'floatie-prop-ducky',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 14.0, visible: true, x: 565, y: 588, scale: 0.92 },
      { time: 15.6, visible: true, x: 492, y: 604, scale: 0.98 },
      { time: 17.6, visible: true, x: 458, y: 604, scale: 1.0 },
      { time: 19.0, visible: false, hold: true },
      { time: 35.4, visible: true, x: 485, y: 615, scale: 0.95 },
      { time: 37.4, visible: true, x: 162, y: 608, scale: 0.92, hold: true },
    ],
  },
  {
    nodeId: 'floatie-prop-red',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 14.2, visible: true, x: 598, y: 572, scale: 0.9 },
      { time: 15.8, visible: true, x: 532, y: 595, scale: 0.94, hold: true },
      { time: 19.0, visible: false, hold: true },
      { time: 35.4, visible: true, x: 538, y: 605, scale: 0.92 },
      { time: 37.6, visible: true, x: 166, y: 622, scale: 0.92, hold: true },
    ],
  },
  {
    nodeId: 'floatie-prop-blue',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 14.3, visible: true, x: 540, y: 608, scale: 0.9 },
      { time: 15.8, visible: true, x: 392, y: 608, scale: 0.94, hold: true },
      { time: 19.0, visible: false, hold: true },
      { time: 35.5, visible: true, x: 395, y: 618, scale: 0.92 },
      { time: 37.8, visible: true, x: 170, y: 636, scale: 0.92, hold: true },
    ],
  },
  {
    nodeId: 'floatie-prop-pink',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 14.4, visible: true, x: 590, y: 632, scale: 0.88 },
      { time: 16.0, visible: true, x: 552, y: 634, scale: 0.92, hold: true },
      { time: 19.0, visible: false, hold: true },
      { time: 35.6, visible: true, x: 575, y: 638, scale: 0.9 },
      { time: 38.0, visible: true, x: 224, y: 634, scale: 0.9, hold: true },
    ],
  },

  // Beach ball: rests by umbrella in Acts I–II, arcs playfully between Strawberry, Onion, Radish & Banana in Act III, rests on sand in Acts IV–V!
  {
    nodeId: 'beach-ball',
    keyframes: [
      { time: 0.0, x: 192, y: 588, scale: 0.95, hold: true },
      { time: 19.6, x: 765, y: 530, scale: 0.98 },
      // Toss 1: Strawberry -> Onion
      { time: 20.6, x: 838, y: 382, scale: 1.04 },
      { time: 21.6, x: 905, y: 492, scale: 0.98 },
      // Toss 2: Onion -> Singing Radish
      { time: 22.8, x: 978, y: 372, scale: 1.04 },
      { time: 23.8, x: 1042, y: 495, scale: 0.96 },
      // Toss 3: Radish -> Party Banana
      { time: 25.0, x: 965, y: 392, scale: 1.05 },
      { time: 26.2, x: 885, y: 578, scale: 1.0 },
      // Toss 4: Banana -> Strawberry
      { time: 27.4, x: 822, y: 395, scale: 1.05 },
      { time: 28.6, x: 768, y: 525, scale: 0.98 },
      // Toss 5: Strawberry -> Onion -> back to Strawberry
      { time: 29.8, x: 842, y: 385, scale: 1.04 },
      { time: 30.8, x: 905, y: 492, scale: 0.98 },
      { time: 31.8, x: 785, y: 535, scale: 0.96 },
      // Carried out onto beach in Act IV
      { time: 35.2, x: 515, y: 595, scale: 0.95 },
      { time: 37.8, x: 222, y: 654, scale: 0.94, hold: true },
    ],
  },

  // === 8 CHARACTER TRACKS ACROSS ALL 5 ACTS ===
  {
    nodeId: 'birthday-strawberry',
    keyframes: [
      // Act I: Birthday party & blowing out candles at t=7.2s
      { time: 0.0, x: 462, y: 616, scale: 1.06, state: 'waving', wearingFloatie: false },
      { time: 6.4, x: 452, y: 616, scale: 1.08, state: 'waving', wearingFloatie: false },
      { time: 6.9, x: 432, y: 618, scale: 1.12, state: 'singing', wearingFloatie: false },
      { time: 7.5, x: 458, y: 616, scale: 1.08, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 458, y: 616, scale: 1.06, state: 'waving', wearingFloatie: false },
      // Act II: Walks toward water's edge, gets startled by wave at 12.0s, hops back scared, comforted by friends!
      { time: 10.3, x: 472, y: 612, scale: 1.06, state: 'walking', wearingFloatie: false },
      { time: 11.8, x: 586, y: 592, scale: 1.06, state: 'walking', wearingFloatie: false },
      { time: 12.1, x: 548, y: 572, scale: 1.08, state: 'idle', wearingFloatie: false },
      { time: 12.8, x: 454, y: 602, scale: 1.05, state: 'idle', wearingFloatie: false },
      { time: 13.4, x: 448, y: 596, scale: 1.05, state: 'idle', wearingFloatie: false },
      { time: 15.8, x: 452, y: 602, scale: 1.06, state: 'idle', wearingFloatie: false },
      { time: 16.2, x: 456, y: 600, scale: 1.08, state: 'waving', wearingFloatie: false },
      { time: 18.6, x: 595, y: 592, scale: 1.06, state: 'walking', wearingFloatie: false },
      // Act III: Floatie ON! Wades/hops into sparkling ocean water for 13s of splash & beach-ball play!
      { time: 19.0, x: 695, y: 588, scale: 1.04, state: 'waving', wearingFloatie: true, floatieVariant: 0 },
      { time: 20.2, x: 768, y: 585, scale: 1.04, state: 'waving', wearingFloatie: true, floatieVariant: 0 },
      { time: 23.5, x: 785, y: 578, scale: 1.04, state: 'singing', wearingFloatie: true, floatieVariant: 0 },
      { time: 27.5, x: 765, y: 586, scale: 1.04, state: 'waving', wearingFloatie: true, floatieVariant: 0 },
      { time: 31.8, x: 758, y: 588, scale: 1.04, state: 'waving', wearingFloatie: true, floatieVariant: 0 },
      // Act IV: Sunset! Hops back toward shore & takes off floatie onto dry sand
      { time: 33.2, x: 682, y: 596, scale: 1.04, state: 'walking', wearingFloatie: true, floatieVariant: 0 },
      { time: 35.0, x: 512, y: 610, scale: 1.06, state: 'walking', wearingFloatie: false },
      { time: 37.5, x: 465, y: 618, scale: 1.06, state: 'waving', wearingFloatie: false },
      // Act V: Moonrise! Waving bye-bye at night
      { time: 39.2, x: 465, y: 618, scale: 1.08, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'crying-onion',
    keyframes: [
      // Act I: Happy birthday cheering
      { time: 0.0, x: 538, y: 566, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 538, y: 566, state: 'waving', wearingFloatie: false },
      // Act II: Trots toward water, sees Strawberry scared (empathetic 'idle'), hurries back with floaties!
      { time: 11.5, x: 642, y: 552, state: 'waving', wearingFloatie: false },
      { time: 12.2, x: 625, y: 556, state: 'idle', wearingFloatie: false },
      { time: 13.8, x: 598, y: 566, state: 'idle', wearingFloatie: false },
      { time: 15.4, x: 518, y: 592, state: 'waving', wearingFloatie: false },
      { time: 18.6, x: 632, y: 575, state: 'waving', wearingFloatie: false },
      // Act III: Floatie ON in ocean!
      { time: 19.0, x: 780, y: 558, state: 'waving', wearingFloatie: true, floatieVariant: 1 },
      { time: 20.5, x: 905, y: 548, state: 'waving', wearingFloatie: true, floatieVariant: 1 },
      { time: 24.0, x: 918, y: 544, state: 'singing', wearingFloatie: true, floatieVariant: 1 },
      { time: 28.0, x: 902, y: 550, state: 'waving', wearingFloatie: true, floatieVariant: 1 },
      { time: 31.8, x: 888, y: 554, state: 'waving', wearingFloatie: true, floatieVariant: 1 },
      // Act IV: Exits ocean & takes off floatie
      { time: 33.4, x: 745, y: 574, state: 'waving', wearingFloatie: true, floatieVariant: 1 },
      { time: 35.0, x: 556, y: 598, state: 'waving', wearingFloatie: false },
      { time: 37.8, x: 552, y: 610, state: 'waving', wearingFloatie: false },
      // Act V: Waving goodbye on moonlit sand
      { time: 39.2, x: 552, y: 610, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'singing-radish',
    keyframes: [
      // Act I: Sings Happy Birthday
      { time: 0.0, x: 292, y: 612, scale: 1.0, state: 'singing', wearingFloatie: false },
      { time: 7.3, x: 292, y: 612, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 292, y: 612, scale: 1.0, state: 'waving', wearingFloatie: false },
      // Act II: Trots toward shore, then hurries back with blue star floatie to cheer Strawberry!
      { time: 11.6, x: 555, y: 595, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 14.0, x: 520, y: 598, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 15.6, x: 386, y: 604, scale: 1.0, state: 'singing', wearingFloatie: false },
      { time: 18.6, x: 585, y: 590, scale: 0.98, state: 'waving', wearingFloatie: false },
      // Act III: Floatie ON in ocean!
      { time: 19.0, x: 845, y: 575, scale: 0.96, state: 'waving', wearingFloatie: true, floatieVariant: 2 },
      { time: 20.8, x: 1045, y: 572, scale: 0.96, state: 'singing', wearingFloatie: true, floatieVariant: 2 },
      { time: 31.8, x: 1025, y: 574, scale: 0.96, state: 'singing', wearingFloatie: true, floatieVariant: 2 },
      // Act IV: Exits ocean onto beach
      { time: 33.5, x: 795, y: 592, scale: 0.98, state: 'waving', wearingFloatie: true, floatieVariant: 2 },
      { time: 35.2, x: 412, y: 612, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 37.8, x: 362, y: 614, scale: 1.0, state: 'waving', wearingFloatie: false },
      // Act V: Waving goodbye
      { time: 39.2, x: 362, y: 614, scale: 1.0, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'watermelon-slice',
    keyframes: [
      { time: 0.0, x: 165, y: 522, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 165, y: 522, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 11.6, x: 515, y: 515, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 15.6, x: 398, y: 534, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 18.6, x: 575, y: 505, scale: 0.95, state: 'waving', wearingFloatie: false },
      { time: 19.0, x: 720, y: 496, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 20.8, x: 825, y: 492, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 31.8, x: 815, y: 494, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 33.4, x: 675, y: 515, scale: 0.95, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 35.0, x: 345, y: 548, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 38.0, x: 278, y: 558, scale: 1.0, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'party-banana',
    keyframes: [
      { time: 0.0, x: 568, y: 646, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 568, y: 646, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 11.6, x: 645, y: 638, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 15.6, x: 548, y: 638, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 18.6, x: 655, y: 638, scale: 0.98, state: 'waving', wearingFloatie: false },
      { time: 19.0, x: 765, y: 642, scale: 0.96, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 20.8, x: 885, y: 642, scale: 0.96, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 31.8, x: 878, y: 642, scale: 0.96, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 33.5, x: 735, y: 642, scale: 0.98, state: 'waving', wearingFloatie: true, floatieVariant: 3 },
      { time: 35.2, x: 625, y: 638, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 38.0, x: 648, y: 636, scale: 1.0, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'cherry-twins',
    keyframes: [
      { time: 0.0, x: 492, y: 504, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 10.0, x: 492, y: 504, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 11.6, x: 562, y: 492, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 15.6, x: 498, y: 512, scale: 1.0, state: 'waving', wearingFloatie: false },
      { time: 18.6, x: 590, y: 500, scale: 0.95, state: 'waving', wearingFloatie: false },
      { time: 19.0, x: 840, y: 506, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 4 },
      { time: 21.0, x: 1125, y: 508, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 4 },
      { time: 31.8, x: 1105, y: 510, scale: 0.92, state: 'waving', wearingFloatie: true, floatieVariant: 4 },
      { time: 33.5, x: 785, y: 518, scale: 0.95, state: 'waving', wearingFloatie: true, floatieVariant: 4 },
      { time: 35.0, x: 525, y: 532, scale: 1.0, state: 'waving', wearingFloatie: false, hold: true },
    ],
  },
  {
    nodeId: 'blue-party-cat',
    keyframes: [
      { time: 0.0, x: 132, y: 642, state: 'sitting' },
      { time: 11.5, x: 315, y: 648, state: 'sitting' },
      { time: 19.5, x: 488, y: 652, state: 'sitting' },
      { time: 34.5, x: 268, y: 652, state: 'sitting' },
      { time: 39.2, x: 268, y: 652, state: 'waving', hold: true },
    ],
  },
  {
    nodeId: 'olive-sprout',
    keyframes: [
      { time: 0.0, x: 618, y: 658, state: 'waving' },
      { time: 19.5, x: 582, y: 662, state: 'waving' },
      { time: 35.0, x: 722, y: 654, state: 'waving' },
      { time: 39.2, x: 722, y: 654, state: 'waving', hold: true },
    ],
  },

  // === HAND-LETTERED ANNOTATIONS ===
  {
    nodeId: 'banner-happy-birthday',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 7.4, visible: true, hold: true },
      { time: 10.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'annot-scared-waves',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 12.0, visible: true, hold: true },
      { time: 14.4, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'annot-floaties-comfort',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 14.6, visible: true, hold: true },
      { time: 18.8, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'annot-splash-play',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 20.8, visible: true, hold: true },
      { time: 31.2, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'banner-goodnight-bye',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 40.0, visible: true, hold: true },
    ],
  },
];

const STRAWBERRY_BEACH_CAMERA: CameraKeyframe[] = [
  // Act I: Wide beach birthday -> gentle zoom on candle blow -> wide
  { time: 0.0, x: 0, y: 0, zoom: 1.0 },
  { time: 5.8, x: 0, y: 0, zoom: 1.0 },
  { time: 6.8, x: -110, y: 68, zoom: 1.14 },
  { time: 8.6, x: -110, y: 68, zoom: 1.14 },
  { time: 9.8, x: 0, y: 0, zoom: 1.0 },
  // Act II: Shoreline scare -> warm zoom in as Onion & friends bring floaties!
  { time: 11.8, x: 25, y: 28, zoom: 1.06 },
  { time: 14.8, x: -92, y: 64, zoom: 1.16 },
  { time: 18.0, x: -92, y: 64, zoom: 1.16 },
  // Act III: Open cove view for floatie splash & beach-ball toss
  { time: 19.6, x: 52, y: 16, zoom: 1.04 },
  { time: 26.0, x: 64, y: 18, zoom: 1.04 },
  { time: 31.8, x: 20, y: 8, zoom: 1.02 },
  // Acts IV–V: Full sunset & moonrise panorama
  { time: 33.5, x: 0, y: 0, zoom: 1.0, hold: true },
];

const STRAWBERRY_BEACH_AUDIO: AudioNoteCue[] = [
  // === Act I (0s – 10s): Sunny surf + Happy Birthday Song + Candle Blow + Confetti Cheer ===
  { time: 0.2, freq: 220.0, duration: 1.4, kind: 'ocean_wave' },
  { time: 0.5, freq: 720.0, duration: 0.25, kind: 'crayon_scribble' },
  // "Happy Birthday to You" sung by Singing Radish
  { time: 0.9, freq: 392.0, duration: 0.3, kind: 'birthday_song' }, // Hap-
  { time: 1.3, freq: 392.0, duration: 0.26, kind: 'birthday_song' }, // -py
  { time: 1.7, freq: 440.0, duration: 0.48, kind: 'birthday_song' }, // Birth-
  { time: 2.3, freq: 392.0, duration: 0.48, kind: 'birthday_song' }, // -day
  { time: 2.9, freq: 523.25, duration: 0.48, kind: 'birthday_song' }, // to
  { time: 3.5, freq: 493.88, duration: 0.75, kind: 'birthday_song' }, // You!
  { time: 4.4, freq: 392.0, duration: 0.3, kind: 'birthday_song' }, // Hap-
  { time: 4.8, freq: 392.0, duration: 0.26, kind: 'birthday_song' }, // -py
  { time: 5.2, freq: 440.0, duration: 0.48, kind: 'birthday_song' }, // Birth-
  { time: 5.7, freq: 392.0, duration: 0.45, kind: 'birthday_song' }, // -day
  { time: 6.2, freq: 587.33, duration: 0.45, kind: 'birthday_song' }, // dear Straw-
  { time: 6.7, freq: 523.25, duration: 0.65, kind: 'birthday_song' }, // -berry!
  // Strawberry blows out candles at t = 7.2s!
  { time: 7.1, freq: 480.0, duration: 0.72, kind: 'candle_blow' },
  { time: 7.5, freq: 523.25, duration: 0.52, kind: 'confetti_pop' },
  { time: 7.9, freq: 440.0, duration: 0.45, kind: 'party_horn' },
  { time: 8.4, freq: 523.25, duration: 0.85, kind: 'cheer_applause' },
  { time: 9.3, freq: 659.25, duration: 0.32, kind: 'giggle' },

  // === Act II (10s – 19s): Big Wave Splash -> Startled Hop -> Onion & Friends Bring Floaties ===
  { time: 10.3, freq: 240.0, duration: 1.3, kind: 'ocean_wave' },
  { time: 11.8, freq: 420.0, duration: 0.55, kind: 'water_splash' }, // Big shoreline splash!
  { time: 12.3, freq: 587.33, duration: 0.28, kind: 'giggle' }, // Startled hop
  { time: 13.0, freq: 330.0, duration: 0.5, kind: 'lullaby' }, // Gentle empathetic note
  { time: 14.1, freq: 523.25, duration: 0.42, kind: 'chime' }, // Onion & friends hurry over!
  { time: 14.8, freq: 720.0, duration: 0.34, kind: 'floatie_squeak' }, // Floatie squeak!
  { time: 15.6, freq: 780.0, duration: 0.34, kind: 'floatie_squeak' }, // Rubber-ducky floatie squeak!
  { time: 16.4, freq: 659.25, duration: 0.32, kind: 'giggle' },
  { time: 17.1, freq: 523.25, duration: 0.8, kind: 'cheer_applause' },
  { time: 18.2, freq: 820.0, duration: 0.32, kind: 'floatie_squeak' },

  // === Act III (19s – 32s): 13s of Floatie Ocean Play, Splashes & Beach-Ball Tosses ===
  { time: 19.1, freq: 460.0, duration: 0.5, kind: 'water_splash' }, // Wading & splashing in!
  { time: 19.8, freq: 760.0, duration: 0.32, kind: 'floatie_squeak' },
  { time: 20.5, freq: 523.25, duration: 0.42, kind: 'birthday_song' }, // Toss 1!
  { time: 21.2, freq: 659.25, duration: 0.3, kind: 'giggle' },
  { time: 21.8, freq: 480.0, duration: 0.46, kind: 'water_splash' },
  { time: 22.6, freq: 587.33, duration: 0.42, kind: 'birthday_song' }, // Toss 2!
  { time: 23.3, freq: 230.0, duration: 1.4, kind: 'ocean_wave' },
  { time: 24.2, freq: 800.0, duration: 0.32, kind: 'floatie_squeak' },
  { time: 25.0, freq: 659.25, duration: 0.42, kind: 'birthday_song' }, // Toss 3!
  { time: 25.8, freq: 520.0, duration: 0.48, kind: 'water_splash' },
  { time: 26.6, freq: 720.0, duration: 0.3, kind: 'giggle' },
  { time: 27.4, freq: 783.99, duration: 0.45, kind: 'birthday_song' }, // Toss 4!
  { time: 28.3, freq: 740.0, duration: 0.34, kind: 'floatie_squeak' },
  { time: 29.1, freq: 490.0, duration: 0.48, kind: 'water_splash' },
  { time: 30.0, freq: 659.25, duration: 0.45, kind: 'birthday_song' }, // Toss 5!
  { time: 30.9, freq: 523.25, duration: 0.75, kind: 'cheer_applause' },

  // === Act IV (32s – 39s): Sunset Crayon Wash, Hopping Out of Water & Stacking Floaties ===
  { time: 32.1, freq: 880.0, duration: 0.34, kind: 'crayon_scribble' }, // Sunset bands coloring in
  { time: 32.8, freq: 210.0, duration: 1.4, kind: 'ocean_wave' },
  { time: 33.8, freq: 440.0, duration: 0.45, kind: 'water_splash' }, // Hopping out of water!
  { time: 34.8, freq: 392.0, duration: 0.55, kind: 'lullaby' },
  { time: 35.6, freq: 690.0, duration: 0.3, kind: 'floatie_squeak' }, // Taking off & stacking floaties
  { time: 36.2, freq: 960.0, duration: 0.32, kind: 'crayon_scribble' }, // Twilight indigo wash
  { time: 37.2, freq: 329.63, duration: 0.6, kind: 'lullaby' },
  { time: 38.2, freq: 392.0, duration: 0.6, kind: 'lullaby' },

  // === Act V (39s – 46s): Moonrise Chimes, Night Surf & Waving Goodbye Lullaby ===
  { time: 39.1, freq: 783.99, duration: 0.55, kind: 'chime' }, // Moon rising!
  { time: 39.8, freq: 1046.5, duration: 0.65, kind: 'chime' }, // Twinkling stars!
  { time: 40.6, freq: 523.25, duration: 0.6, kind: 'lullaby' },
  { time: 41.4, freq: 659.25, duration: 0.3, kind: 'giggle' }, // "Bye-bye!"
  { time: 42.1, freq: 440.0, duration: 0.6, kind: 'lullaby' },
  { time: 42.9, freq: 195.0, duration: 1.6, kind: 'ocean_wave' }, // Soft moonlit surf
  { time: 43.8, freq: 392.0, duration: 0.65, kind: 'lullaby' },
  { time: 44.6, freq: 523.25, duration: 1.1, kind: 'chime' },
];

export const STRAWBERRY_BEACH_BIRTHDAY_SCENE: SceneDefinition = {
  id: 'strawberry-beach-birthday',
  title: "Strawberry's Beach Birthday Splash",
  subtitle:
    'A 46s Vibrant Wax-Crayon Storybook · Beach Cake, Scary Waves, Floatie Ocean Splash & Moonlit Goodbye',
  durationSec: 46,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  vibrantMode: true,
  acts: STRAWBERRY_BEACH_ACTS,
  nodes: STRAWBERRY_BEACH_NODES,
  timeline: STRAWBERRY_BEACH_TIMELINE,
  camera: STRAWBERRY_BEACH_CAMERA,
  audioCues: STRAWBERRY_BEACH_AUDIO,
};

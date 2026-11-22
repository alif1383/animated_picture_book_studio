import { TOKENS } from '../theme/tokens';
import type {
  AudioClipCue,
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

export const STARTER_BANDANA_DOG_ACTS: StoryAct[] = [
  {
    id: 'act-1-backyard-morning',
    title: 'Act I · Sunny Backyard Morning',
    startTime: 0,
    endTime: 15.8,
    caption:
      'In a bright crayon backyard, Biscuit greets his friend outside his cozy doghouse before spotting a bouncing tennis ball and dashing off to chase it!',
  },
  {
    id: 'act-2-park-fetch',
    title: 'Act II · Sunny Park Meadow Fetch',
    startTime: 15.8,
    endTime: 27.0,
    caption:
      'Across a flower-dotted midday park meadow, Biscuit bounds after the soaring tennis ball, makes a joyful catch as a friendly cat watches, and trots proudly home!',
  },
  {
    id: 'act-3-golden-home',
    title: 'Act III · Golden Afternoon Home',
    startTime: 27.0,
    endTime: 38.0,
    caption:
      'Under a warm golden-afternoon sky, Biscuit nudges his tennis ball home beside his cottage and waves a happy paw goodbye as the storybook closes.',
  },
];

export const STARTER_BANDANA_DOG_CAMERA: CameraKeyframe[] = [
  // Act I: Full view for book opening & color-in, subtle cozy push-in on Biscuit's greeting, pull back for sprint
  { time: 0.0, x: 0, y: 0, zoom: 1.0 },
  { time: 4.0, x: 0, y: 0, zoom: 1.0 },
  { time: 5.5, x: -18, y: 36, zoom: 1.08 },
  { time: 13.0, x: -18, y: 36, zoom: 1.08 },
  { time: 13.8, x: 0, y: 0, zoom: 1.0, hold: true },

  // Act II: Wide park establishing view, lively slight pan/zoom on Biscuit's triumphant catch, pull back for trot home
  { time: 15.8, x: 0, y: 0, zoom: 1.0 },
  { time: 19.2, x: 0, y: 0, zoom: 1.0 },
  { time: 20.0, x: 45, y: 32, zoom: 1.06 },
  { time: 23.4, x: 45, y: 32, zoom: 1.06 },
  { time: 24.2, x: 0, y: 0, zoom: 1.0, hold: true },

  // Act III: Calm full view for golden-afternoon homecoming & storybook close
  { time: 27.0, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 38.0, x: 0, y: 0, zoom: 1.0 },
];

const OVERBLEED_BOUNDS = {
  x: -60,
  y: -40,
  width: 1400,
  height: 800,
} as const;

export const STARTER_BANDANA_DOG_NODES: SceneNode[] = [
  // =========================================================================
  // TIER 1: Full-Zone Textured Background Patches (Outer Overbleed -60..1340, -40..760)
  // =========================================================================

  // Morning & Midday Sky (Acts I & II)
  {
    id: 'sky-morning',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 -40 L 1340 -40 L 1340 422 C 1020 412, 740 426, 420 414 C 190 406, 40 420, -60 416 Z',
    visible: true,
  },

  // Warm Golden-Afternoon Sky Upper Wash (Act III)
  {
    id: 'sky-golden',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonWarmMoon',
    fillStyle: 'top-down-bands',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 -40 L 1340 -40 L 1340 424 C 980 412, 680 426, 360 414 C 160 406, 20 418, -60 416 Z',
    visible: false,
  },

  // Warm Golden-Afternoon Sunset Horizon Glow (Act III)
  {
    id: 'sky-golden-glow',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'crayonSunsetOrange',
    fillStyle: 'top-down-bands',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    opacity: 0.78,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 248 C 240 230, 560 252, 880 226 C 1080 212, 1220 228, 1340 220 L 1340 428 L -60 424 Z',
    visible: false,
  },

  // Act II Far Rolling Park Meadow Hills
  {
    id: 'park-hill-far',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 404 C 140 356, 350 350, 560 388 C 790 426, 980 352, 1210 374 C 1270 380, 1310 392, 1340 398 L 1340 490 L -60 490 Z',
    visible: false,
  },

  // Act I & III Backyard Lawn Ground (natural 0-20px organic horizon contour)
  {
    id: 'ground-backyard',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 416 C 180 405, 430 420, 680 410 C 930 402, 1140 418, 1340 412 L 1340 760 L -60 760 Z',
    visible: true,
  },

  // Act II Lush Park Meadow Ground
  {
    id: 'ground-park',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonGrassGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 432 C 210 420, 480 436, 760 424 C 1000 416, 1180 434, 1340 426 L 1340 760 L -60 760 Z',
    visible: false,
  },

  // Act I & III Subtle Warm Garden Footpath Near Cottage
  {
    id: 'garden-path',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    fillStyle: 'diagonal-strokes',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    opacity: 0.88,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M 215 512 C 295 524, 395 556, 515 572 C 625 586, 705 604, 748 634 C 670 650, 520 648, 392 618 C 290 594, 215 560, 178 526 Z',
    visible: true,
  },

  // Act II Curved Sunny Dirt Park Trail
  {
    id: 'park-trail',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    fillStyle: 'diagonal-strokes',
    fillSteps: TOKENS.timing.defaultFillSteps,
    fillProgress: 1.0,
    opacity: 0.88,
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 582 C 220 562, 510 554, 790 572 C 1010 586, 1180 578, 1340 566 L 1340 642 C 1170 656, 980 654, 760 638 C 490 618, 210 628, -60 648 Z',
    visible: false,
  },

  // =========================================================================
  // CELESTIAL & DRIFTING CLOUDS (Chronological Sun Arc Across Acts)
  // =========================================================================

  {
    id: 'sunny-sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 6,
    x: 1080,
    y: 120,
    scale: 0.46,
  },
  {
    id: 'cloud-left',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 240,
    y: 112,
    scale: 1.05,
    variant: 1,
  },
  {
    id: 'cloud-right',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 790,
    y: 146,
    scale: 0.9,
    variant: 2,
  },

  // =========================================================================
  // TIER 2: ACT II PARK SET DRESSING (Visible in Act II only)
  // =========================================================================

  {
    id: 'park-meadow-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 8,
    x: 640,
    y: 500,
    scale: 1.0,
    visible: false,
  },
  {
    id: 'park-tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 190,
    y: 455,
    scale: 1.55,
    variant: 2,
    visible: false,
  },
  {
    id: 'park-tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 1090,
    y: 465,
    scale: 1.45,
    variant: 1,
    visible: false,
  },
  {
    id: 'park-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 12,
    x: 375,
    y: 475,
    scale: 1.25,
    lit: false,
    visible: false,
  },
  {
    id: 'park-bicycle',
    type: 'prop',
    kind: 'bicycle',
    zIndex: 14,
    x: 295,
    y: 495,
    scale: 1.2,
    visible: false,
  },
  {
    id: 'park-cat',
    type: 'character',
    kind: 'cat',
    state: 'curious',
    zIndex: 19,
    x: 215,
    y: 595,
    scale: 1.35,
    flipX: false,
    visible: false,
  },

  // =========================================================================
  // TIER 2: ACT I & III BACKYARD SET DRESSING (Hidden in Act II)
  // =========================================================================

  {
    id: 'backyard-tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 85,
    y: 470,
    scale: 1.35,
    variant: 1,
    visible: true,
  },
  {
    id: 'backyard-tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 1150,
    y: 490,
    scale: 1.5,
    variant: 2,
    visible: true,
  },
  {
    id: 'backyard-cottage',
    type: 'building',
    kind: 'ochre_cottage',
    zIndex: 12,
    x: 245,
    y: 485,
    scale: 0.92,
    showLadder: false,
    windowLit: false,
    visible: true,
  },
  {
    id: 'backyard-dog-house',
    type: 'prop',
    kind: 'dog_house',
    zIndex: 14,
    x: 845,
    y: 555,
    scale: 1.38,
    visible: true,
  },
  {
    id: 'backyard-dog-bowl',
    type: 'prop',
    kind: 'dog_bowl',
    zIndex: 18,
    x: 700,
    y: 590,
    scale: 1.3,
    visible: true,
  },

  // =========================================================================
  // HERO CHARACTER & FETCH PROP
  // =========================================================================

  {
    id: 'biscuit',
    type: 'character',
    kind: 'bandana_dog',
    state: 'sitting',
    zIndex: 24,
    x: 560,
    y: 595,
    scale: 1.45,
    flipX: false,
  },
  {
    id: 'tennis-ball',
    type: 'prop',
    kind: 'dog_tennis_ball',
    zIndex: 25,
    x: -40,
    y: 350,
    scale: 1.25,
    rotate: 0,
    visible: false,
  },

  // =========================================================================
  // FOREGROUND GRASS TUFTS & JOYFUL SPARKLE NOTES
  // =========================================================================

  {
    id: 'grass-fg-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 28,
    x: 125,
    y: 672,
    scale: 1.15,
    variant: 1,
  },
  {
    id: 'grass-fg-mid',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 28,
    x: 415,
    y: 690,
    scale: 1.0,
    variant: 3,
  },
  {
    id: 'grass-fg-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 28,
    x: 1135,
    y: 678,
    scale: 1.2,
    variant: 2,
  },
  {
    id: 'happy-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 31,
    x: 865,
    y: 460,
    count: 3,
    visible: false,
  },
];

export const STARTER_BANDANA_DOG_TIMELINE: TimelineTrack[] = [
  // =========================================================================
  // SKY & LOCATION TRANSITIONS (Chronological Morning -> Midday -> Golden Afternoon)
  // =========================================================================

  {
    nodeId: 'sky-morning',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'sky-golden',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'sky-golden-glow',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'sunny-sun',
    keyframes: [
      // Act I: Morning sun upper-right
      { time: 0.0, x: 1080, y: 120, scale: 0.46, state: 'awake', hold: true },
      // Act II: Bright midday sun high center
      { time: 15.8, x: 640, y: 98, scale: 0.48, state: 'awake', hold: true },
      // Act III: Warm golden-afternoon sun lowering toward horizon
      { time: 27.0, x: 1110, y: 215, scale: 0.5, state: 'awake', hold: true },
    ],
  },
  {
    nodeId: 'cloud-left',
    keyframes: [
      { time: 0.0, x: 240, y: 112 },
      { time: 15.7, x: 325, y: 112, hold: true },
      { time: 15.8, x: 195, y: 126 },
      { time: 26.9, x: 285, y: 126, hold: true },
      { time: 27.0, x: 265, y: 108 },
      { time: 38.0, x: 340, y: 108 },
    ],
  },
  {
    nodeId: 'cloud-right',
    keyframes: [
      { time: 0.0, x: 790, y: 146 },
      { time: 15.7, x: 870, y: 146, hold: true },
      { time: 15.8, x: 960, y: 114 },
      { time: 26.9, x: 1045, y: 114, hold: true },
      { time: 27.0, x: 760, y: 142 },
      { time: 38.0, x: 835, y: 142 },
    ],
  },

  // Backyard Tier 1 & Tier 2 visibility (Acts I & III visible; hidden during Act II)
  {
    nodeId: 'ground-backyard',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'garden-path',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'backyard-cottage',
    keyframes: [
      { time: 0.0, visible: true, windowLit: false, hold: true },
      { time: 15.8, visible: false, windowLit: false, hold: true },
      // Golden afternoon cozy glow in cottage window
      { time: 27.0, visible: true, windowLit: true, hold: true },
    ],
  },
  {
    nodeId: 'backyard-dog-house',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'backyard-dog-bowl',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'backyard-tree-left',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },
  {
    nodeId: 'backyard-tree-right',
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: 15.8, visible: false, hold: true },
      { time: 27.0, visible: true, hold: true },
    ],
  },

  // Park Tier 1 & Tier 2 visibility (Visible in Act II only)
  {
    nodeId: 'park-hill-far',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'ground-park',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-trail',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-meadow-flowers',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-tree-left',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-tree-right',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-lantern',
    keyframes: [
      { time: 0.0, visible: false, lit: false, hold: true },
      { time: 15.8, visible: true, lit: false, hold: true },
      { time: 27.0, visible: false, lit: false, hold: true },
    ],
  },
  {
    nodeId: 'park-bicycle',
    keyframes: [
      { time: 0.0, visible: false, hold: true },
      { time: 15.8, visible: true, hold: true },
      { time: 27.0, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'park-cat',
    keyframes: [
      { time: 0.0, visible: false, state: 'curious', flipX: false, hold: true },
      { time: 15.8, visible: true, state: 'curious', flipX: false, hold: true },
      { time: 19.8, visible: true, state: 'waving', flipX: false, hold: true },
      { time: 23.0, visible: true, state: 'blinking', flipX: false, hold: true },
      { time: 23.8, visible: true, state: 'curious', flipX: false, hold: true },
      { time: 27.0, visible: false, state: 'curious', flipX: false, hold: true },
    ],
  },

  // =========================================================================
  // BISCUIT (Hero Bandana Dog — Canonical +X Walking & 6 FPS Speaking Mouth)
  // =========================================================================

  {
    nodeId: 'biscuit',
    keyframes: [
      // Act I (0.0 - 3.5s): Book opens & colors in on Biscuit sitting happily
      {
        time: 0.0,
        x: 560,
        y: 595,
        scale: 1.45,
        flipX: false,
        state: 'sitting',
        speechText: '',
        hold: true,
      },
      // Act I (3.60 - 9.44s): Narrator introduces Biscuit; happy blink & curious head-tilt beats
      { time: 5.6, x: 560, y: 595, state: 'blinking', hold: true },
      { time: 6.2, x: 560, y: 595, state: 'sitting', hold: true },
      { time: 7.5, x: 560, y: 595, state: 'curious', hold: true },
      { time: 8.7, x: 560, y: 595, state: 'sitting', hold: true },
      // Eager little pre-greeting hop on playful bark
      { time: 9.55, x: 560, y: 583, state: 'waving', hold: true },
      // Act I (9.85 - 13.61s): Voice #2 (3.76s) — Biscuit greets & speaks with 6 FPS animated mouth
      {
        time: 9.85,
        x: 560,
        y: 595,
        flipX: false,
        state: 'singing',
        speechText: 'Hi friend! Wanna play fetch?',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
        hold: true,
      },
      { time: 11.4, x: 560, y: 583, state: 'singing', hold: true },
      { time: 11.8, x: 560, y: 595, state: 'singing', hold: true },
      // Clear speech bubble cleanly at 13.65s; perk up curiously at the bouncing ball
      {
        time: 13.65,
        x: 560,
        y: 595,
        flipX: false,
        state: 'curious',
        speechText: '',
        hold: true,
      },
      // Act I (14.05 - 15.4s): Sprint joyfully right (+X, flipX: false) off-screen
      { time: 14.05, x: 560, y: 595, flipX: false, state: 'walking' },
      { time: 15.4, x: 1430, y: 595, flipX: false, state: 'walking', hold: true },

      // Act II (15.8 - 27.0s): Brisk cut to Park Meadow; Biscuit bounds in from left
      {
        time: 15.8,
        x: -130,
        y: 595,
        flipX: false,
        state: 'walking',
        speechText: '',
        hold: true,
      },
      { time: 16.3, x: -130, y: 595, flipX: false, state: 'walking' },
      // Reaches the ball at 19.6s & leaps in triumph!
      { time: 19.6, x: 865, y: 580, flipX: false, state: 'waving', hold: true },
      // Act II (19.85 - 23.69s): Voice #3 (3.84s) — Biscuit cheers his catch with 6 FPS animated mouth
      {
        time: 19.85,
        x: 865,
        y: 595,
        flipX: false,
        state: 'singing',
        speechText: 'I got it! Best catch ever! ★',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
        hold: true,
      },
      { time: 21.5, x: 865, y: 583, state: 'singing', hold: true },
      { time: 21.9, x: 865, y: 595, state: 'singing', hold: true },
      // Clear speech bubble cleanly at 23.75s before turning home
      {
        time: 23.75,
        x: 865,
        y: 595,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
      // Act II (24.1 - 26.5s): Turn left (-X, flipX: true) and trot proudly home with ball
      { time: 24.1, x: 865, y: 595, flipX: true, state: 'walking' },
      { time: 26.5, x: -135, y: 595, flipX: true, state: 'walking', hold: true },

      // Act III (27.0 - 28.2s): Golden Afternoon — trot back into backyard from right
      {
        time: 27.0,
        x: 1360,
        y: 595,
        flipX: true,
        state: 'walking',
        speechText: '',
      },
      // Turn to face right/camera beside doghouse & tennis ball
      {
        time: 28.2,
        x: 575,
        y: 595,
        flipX: false,
        state: 'sitting',
        speechText: '',
        hold: true,
      },
      // Act III (28.40 - 34.20s): Voice #4 (5.80s) — Warm goodbye with 6 FPS animated mouth
      {
        time: 28.4,
        x: 575,
        y: 595,
        flipX: false,
        state: 'singing',
        speechText: 'What a sunny day! Bye buddy!',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
        hold: true,
      },
      { time: 31.2, x: 575, y: 587, state: 'singing', hold: true },
      { time: 31.6, x: 575, y: 595, state: 'singing', hold: true },
      // Clear speech bubble cleanly at 34.25s before closing book frame (34.5s)
      {
        time: 34.25,
        x: 575,
        y: 595,
        flipX: false,
        state: 'sitting',
        speechText: '',
        hold: true,
      },
      // Act III (34.4 - 38.0s): Raise happy farewell paw during bookFrame zoom-out & close
      {
        time: 34.4,
        x: 575,
        y: 595,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
      {
        time: 38.0,
        x: 575,
        y: 595,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
    ],
  },

  // =========================================================================
  // TENNIS BALL (In-Scene Object Permanence Across Bounce, Catch & Homecoming)
  // =========================================================================

  {
    nodeId: 'tennis-ball',
    keyframes: [
      // Hidden until bounce-in at 13.5s
      { time: 0.0, visible: false, x: -40, y: 350, rotate: 0, hold: true },
      // Act I (13.5 - 15.0s): Bounces across backyard from left to off-right
      { time: 13.5, visible: true, x: -40, y: 350, rotate: 0 },
      { time: 13.9, visible: true, x: 440, y: 595, rotate: 140 },
      { time: 14.25, visible: true, x: 640, y: 430, rotate: 240 },
      { time: 14.6, visible: true, x: 820, y: 595, rotate: 340 },
      { time: 15.0, visible: true, x: 1360, y: 490, rotate: 460, hold: true },

      // Act II (15.9 - 19.0s): Joyful bouncy arc across the park meadow
      { time: 15.8, visible: false, x: -30, y: 310, rotate: 0, hold: true },
      { time: 15.9, visible: true, x: -30, y: 310, rotate: 0 },
      { time: 16.55, visible: true, x: 250, y: 245, rotate: 120 },
      { time: 17.2, visible: true, x: 460, y: 595, rotate: 240 },
      { time: 17.75, visible: true, x: 640, y: 415, rotate: 340 },
      { time: 18.25, visible: true, x: 790, y: 595, rotate: 440 },
      { time: 18.6, visible: true, x: 870, y: 525, rotate: 500 },
      // Lands cleanly at (935, 595) and stays visible while Biscuit celebrates!
      { time: 19.0, visible: true, x: 935, y: 595, rotate: 540, hold: true },
      // Biscuit turns left and nudges/carries his ball home right beside his snout
      { time: 24.0, visible: true, x: 925, y: 595, rotate: 540 },
      { time: 24.25, visible: true, x: 805, y: 595, rotate: 480 },
      { time: 26.5, visible: true, x: -195, y: 595, rotate: 120, hold: true },

      // Act III (27.0 - 38.0s): Nudged back into backyard & stays permanently beside Biscuit!
      { time: 27.0, visible: true, x: 1295, y: 595, rotate: 360 },
      { time: 28.2, visible: true, x: 505, y: 595, rotate: 60, hold: true },
      { time: 38.0, visible: true, x: 505, y: 595, rotate: 60, hold: true },
    ],
  },

  // =========================================================================
  // JOYFUL SPARKLE MUSIC NOTES (Act II Catch Triumph & Act III Warm Farewell)
  // =========================================================================

  {
    nodeId: 'happy-notes',
    keyframes: [
      { time: 0.0, visible: false, x: 865, y: 460, count: 3, hold: true },
      { time: 19.7, visible: true, x: 865, y: 460, count: 3, hold: true },
      { time: 23.8, visible: false, x: 865, y: 460, count: 3, hold: true },
      { time: 34.4, visible: true, x: 575, y: 468, count: 2, hold: true },
      { time: 38.0, visible: true, x: 575, y: 468, count: 2, hold: true },
    ],
  },
];

export const STARTER_BANDANA_DOG_AUDIO_CLIPS: AudioClipCue[] = [
  {
    id: 'bandana-dog-bgm',
    src: '/audio/bandana-dog-bgm.wav',
    startTime: 0,
    duration: 38.0,
    volume: 0.26,
    label: "Biscuit's Sunny Day BGM (3-Section Dynamic Score)",
  },
  {
    id: 'bandana-dog-playful-bark',
    src: '/audio/bandana-dog-playful-bark.wav',
    startTime: 16.0,
    duration: 1.4,
    volume: 0.85,
    label: 'Playful Bark & Ball Bounce (Park Entry)',
  },
  {
    id: 'voice-01',
    src: '/audio/bandana-dog-voice-01.wav',
    startTime: 3.6,
    duration: 5.84,
    volume: 0.98,
    label: 'Narrator: Meet Biscuit',
  },
  {
    id: 'voice-02',
    src: '/audio/bandana-dog-voice-02.wav',
    startTime: 9.85,
    duration: 3.76,
    volume: 0.98,
    label: 'Biscuit: Hi friend! Wanna play fetch?',
  },
  {
    id: 'voice-03',
    src: '/audio/bandana-dog-voice-03.wav',
    startTime: 19.85,
    duration: 3.84,
    volume: 0.98,
    label: 'Biscuit: I got it! Best catch ever!',
  },
  {
    id: 'voice-04',
    src: '/audio/bandana-dog-voice-04.wav',
    startTime: 28.4,
    duration: 5.8,
    volume: 0.98,
    label: 'Biscuit: What a sunny day! Bye buddy!',
  },
];

export const STARTER_BANDANA_DOG_AUDIO_CUES: AudioNoteCue[] = [
  // Opening book color-in crayon scribble & sparkle chime
  { time: 0.8, freq: 620, duration: 0.25, kind: 'crayon_scribble' },
  { time: 2.0, freq: 720, duration: 0.25, kind: 'crayon_scribble' },
  { time: 3.4, freq: 880, duration: 0.45, kind: 'chime' },

  // Act I playful barks (pre-greeting excitement & spotting the bouncing ball)
  { time: 9.5, freq: 355, duration: 0.42, kind: 'playful_bark' },
  { time: 13.9, freq: 375, duration: 0.42, kind: 'playful_bark' },

  // Act II triumphant catch bark & joyful giggle
  { time: 19.5, freq: 385, duration: 0.42, kind: 'playful_bark' },
  { time: 19.75, freq: 659.25, duration: 0.3, kind: 'giggle' },

  // Act III happy farewell bark & cozy storybook closing lullaby notes
  { time: 34.3, freq: 360, duration: 0.42, kind: 'playful_bark' },
  { time: 35.1, freq: 523.25, duration: 0.65, kind: 'lullaby' },
  { time: 35.9, freq: 440.0, duration: 0.65, kind: 'lullaby' },
  { time: 36.7, freq: 392.0, duration: 0.85, kind: 'lullaby' },
];

export const STARTER_BANDANA_DOG_SCENE: SceneDefinition = {
  id: 'starter-bandana-dog',
  title: "Biscuit's Sunny Day",
  subtitle: 'A Crayon Storybook Adventure',
  durationSec: 38.0,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  vibrantMode: true,
  bookFrame: {
    enabled: true,
    coverTitle: "Biscuit's Sunny Day",
    coverSubtitle: 'A Crayon Storybook Adventure',
    creditText: 'Illustrated from Photo in Wax Crayon & Pastel',
    endingTitle: 'Good Boy, Biscuit! ★',
    endingCredit: "Biscuit's Sunny Day · The End",
    coverMaterial: 'crayonRadishRed',
    accentMaterial: 'crayonOchre',
    openDurationSec: 3.5,
    closeDurationSec: 3.5,
  },
  acts: STARTER_BANDANA_DOG_ACTS,
  nodes: STARTER_BANDANA_DOG_NODES,
  timeline: STARTER_BANDANA_DOG_TIMELINE,
  camera: STARTER_BANDANA_DOG_CAMERA,
  audioCues: STARTER_BANDANA_DOG_AUDIO_CUES,
  audioClips: STARTER_BANDANA_DOG_AUDIO_CLIPS,
};

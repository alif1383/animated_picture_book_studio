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

/**
 * "Mochi's Moonlit Garden" — 30-second 4-Act Storybook Scene (`id: 'starter-moonlit-cat'`)
 *
 * Chronological Night Progression:
 * - Act I (0–11.2s): Early Moonrise along the Moonlit Lantern Path — Mochi pads past the warm
 *   lantern and distant ochre cottage, spotting the wooden Wind-Chime Arbor ahead.
 * - Act II (11.2–18.2s): Starry Midnight at the Singing Wind Chimes — Mochi taps the hanging chimes
 *   with a gentle paw, lighting up the arbor and sending silver musical notes floating skyward.
 * - Act III (18.2–24.8s): Deep Midnight in the Secret Firefly Fountain Clearing — crisp location cut
 *   into a teal-hedged glade where Mochi gazes at the rippling moon reflection & whispers goodnight.
 * - Act IV (24.8–30.0s): Bedtime Lullaby — the Moon dons its striped nightcap as Mochi curls up
 *   beside the fountain and the hardcover storybook gently closes.
 */

const ZONE_CUT_TIME = 18.2;

/** Builds a crisp stepped visibility toggle track at the Zone A → Zone B location cut. */
function zoneToggleTrack(
  nodeId: string,
  cutTime: number,
  showInZoneA: boolean
): TimelineTrack {
  return {
    nodeId,
    keyframes: [
      { time: 0, visible: showInZoneA, hold: true },
      { time: cutTime, visible: !showInZoneA, hold: true },
    ],
  };
}

// ---------------------------------------------------------------------------
// Acts — 4 Cohesive Acts (0–30s)
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_ACTS: StoryAct[] = [
  {
    id: 'act-1-lantern-path',
    title: 'Act I · The Moonlit Lantern Path',
    startTime: 0,
    endTime: 12.4,
    caption:
      'Under the early moonrise, curious Mochi trots past the warm garden lantern and spots shimmering wind chimes ahead.',
  },
  {
    id: 'act-2-wind-chimes',
    title: 'Act II · The Singing Wind Chimes',
    startTime: 12.4,
    endTime: 18.2,
    caption:
      'With a gentle paw tap, the wooden arbor chimes sparkle to life, floating silver notes up toward the smiling Moon.',
  },
  {
    id: 'act-3-moon-fountain',
    title: 'Act III · The Firefly Fountain',
    startTime: 18.2,
    endTime: 27.0,
    caption:
      'Slipping through the hedge into a secret clearing, Mochi discovers a glowing moonlit fountain alive with fireflies and bids the Moon goodnight.',
  },
  {
    id: 'act-4-cozy-lullaby',
    title: 'Act IV · Sweet Dreams Under the Moon',
    startTime: 27.0,
    endTime: 30.0,
    caption:
      'The Moon wears its striped nightcap as Mochi curls up beside the fountain and drifts off to sweet dreams.',
  },
];

// ---------------------------------------------------------------------------
// Scene Nodes — Two-Tier Terrain with Outer Overbleed (-60..1340, -40..760)
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_NODES: SceneNode[] = [
  // ─── ZONE A (0 .. 18.2s): THE LANTERN PATH & WIND-CHIME ARBOR ───
  {
    id: 'zone-a-sky',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'markerIndigoNight',
    fillStyle: 'top-down-bands',
    wrapRightNegativeSpace: false,
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: -40, width: 1540, height: 500 },
    d: 'M -60 -40 L 1480 -40 L 1480 448 Q 980 434, 640 446 Q 280 458, -60 442 Z',
    visible: true,
  },
  {
    id: 'zone-a-hedge',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    outlined: true,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: 370, width: 1540, height: 105 },
    d: 'M -60 404 Q 15 372, 100 398 Q 195 368, 290 396 Q 390 374, 485 398 Q 580 370, 685 396 Q 785 376, 885 400 Q 985 372, 1085 396 Q 1190 370, 1280 396 Q 1380 374, 1480 394 L 1480 468 L -60 468 Z',
    visible: true,
  },
  {
    id: 'zone-a-lawn',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonGrassGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: 424, width: 1540, height: 340 },
    d: 'M -60 440 Q 260 426, 620 442 Q 980 454, 1480 434 L 1480 760 L -60 760 Z',
    visible: true,
  },
  {
    id: 'zone-a-path',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    outlined: true,
    opacity: 0.72,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: 556, width: 1540, height: 132 },
    d: 'M -60 562 Q 140 578, 320 594 Q 560 612, 810 598 Q 1040 584, 1480 600 L 1480 666 Q 1040 652, 800 666 Q 550 680, 290 654 Q 110 634, -60 618 Z',
    visible: true,
  },

  // Zone A Tier 2 Props & Distant Cottage
  {
    id: 'zone-a-stars',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 6,
    x: 40,
    y: 24,
    count: 22,
    variant: 1,
    opacity: 0.92,
    visible: true,
  },
  {
    id: 'zone-a-cloud-left',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 310,
    y: 122,
    scale: 0.95,
    variant: 1,
    opacity: 0.28,
    visible: true,
  },
  {
    id: 'zone-a-cloud-mid',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 745,
    y: 158,
    scale: 0.82,
    variant: 2,
    opacity: 0.24,
    visible: true,
  },
  {
    id: 'zone-a-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 8,
    x: 560,
    y: 465,
    scale: 0.95,
    visible: true,
  },
  {
    id: 'zone-a-cottage',
    type: 'building',
    kind: 'ochre_cottage',
    zIndex: 10,
    x: 145,
    y: 455,
    scale: 0.5,
    windowLit: true,
    showLadder: false,
    visible: true,
  },
  {
    id: 'zone-a-tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 12,
    x: 42,
    y: 468,
    scale: 1.15,
    variant: 1,
    visible: true,
  },
  {
    id: 'zone-a-tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 12,
    x: 1175,
    y: 465,
    scale: 1.2,
    variant: 2,
    visible: true,
  },
  {
    id: 'zone-a-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 14,
    x: 240,
    y: 565,
    scale: 1.55,
    lit: true,
    visible: true,
  },
  {
    id: 'zone-a-grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 15,
    x: 155,
    y: 650,
    scale: 0.48,
    variant: 1,
    visible: true,
  },
  {
    id: 'zone-a-grass-mid',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 15,
    x: 540,
    y: 668,
    scale: 0.44,
    variant: 2,
    visible: true,
  },
  {
    id: 'zone-a-grass-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 15,
    x: 1095,
    y: 658,
    scale: 0.5,
    variant: 3,
    visible: true,
  },
  {
    id: 'zone-a-wind-chimes',
    type: 'prop',
    kind: 'wind_chime_arbor',
    zIndex: 18,
    x: 945,
    y: 615,
    scale: 1.12,
    lit: false,
    bounds: { x: -108, y: -234, width: 216, height: 246 },
    visible: true,
  },

  // ─── ZONE B (18.2 .. 30.0s): THE SECRET MOON-FOUNTAIN CLEARING ───
  {
    id: 'zone-b-sky',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonRoyalBlue',
    fillStyle: 'top-down-bands',
    wrapRightNegativeSpace: false,
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: -40, width: 1400, height: 500 },
    d: 'M -60 -40 L 1340 -40 L 1340 448 Q 940 436, 640 444 Q 300 454, -60 440 Z',
    visible: false,
  },
  {
    id: 'zone-b-sky-canopy',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'markerIndigoNight',
    opacity: 0.58,
    fillStyle: 'top-down-bands',
    wrapRightNegativeSpace: false,
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: -40, width: 1400, height: 390 },
    d: 'M -60 -40 L 1340 -40 L 1340 315 Q 1000 342, 640 318 Q 280 296, -60 330 Z',
    visible: false,
  },
  {
    id: 'zone-b-hedge-ring',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonStoreTeal',
    outlined: true,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: 345, width: 1400, height: 135 },
    d: 'M -60 356 Q 40 346, 130 374 Q 230 352, 330 386 Q 430 376, 535 398 Q 640 384, 745 398 Q 855 376, 955 386 Q 1060 352, 1160 374 Q 1255 346, 1340 358 L 1340 472 L -60 472 Z',
    visible: false,
  },
  {
    id: 'zone-b-lawn',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -60, y: 424, width: 1400, height: 340 },
    d: 'M -60 436 Q 320 426, 640 438 Q 980 448, 1340 432 L 1340 760 L -60 760 Z',
    visible: false,
  },
  {
    id: 'zone-b-glade-pool',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    opacity: 0.55,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 280, y: 520, width: 780, height: 210 },
    d: 'M 330 622 C 345 552, 520 526, 695 534 C 875 542, 1025 574, 1018 632 C 1010 694, 840 718, 665 714 C 485 710, 315 688, 330 622 Z',
    visible: false,
  },

  // Zone B Tier 2 Clearing Props
  {
    id: 'zone-b-stars',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 6,
    x: 35,
    y: 20,
    count: 32,
    variant: 3,
    opacity: 0.98,
    visible: false,
  },
  {
    id: 'zone-b-cloud',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 460,
    y: 118,
    scale: 0.9,
    variant: 3,
    opacity: 0.22,
    visible: false,
  },
  {
    id: 'zone-b-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 8,
    x: 640,
    y: 472,
    scale: 0.92,
    visible: false,
  },
  {
    id: 'zone-b-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 11,
    x: 305,
    y: 510,
    scale: 1.1,
    lit: true,
    visible: false,
  },
  {
    id: 'zone-b-tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 13,
    x: 165,
    y: 485,
    scale: 1.35,
    variant: 2,
    visible: false,
  },
  {
    id: 'zone-b-tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 13,
    x: 1120,
    y: 475,
    scale: 1.3,
    variant: 1,
    visible: false,
  },
  {
    id: 'zone-b-grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 15,
    x: 425,
    y: 658,
    scale: 0.44,
    variant: 2,
    visible: false,
  },
  {
    id: 'zone-b-grass-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 15,
    x: 965,
    y: 662,
    scale: 0.46,
    variant: 1,
    visible: false,
  },
  {
    id: 'zone-b-fountain',
    type: 'prop',
    kind: 'garden_fountain',
    zIndex: 18,
    x: 785,
    y: 618,
    scale: 1.18,
    lit: true,
    bounds: { x: -92, y: -144, width: 184, height: 158 },
    visible: false,
  },

  // ─── PERSISTENT CHARACTERS & FOREGROUND EFFECTS ───
  {
    id: 'smiling-moon',
    type: 'character',
    kind: 'moon',
    state: 'idle',
    wearingNightcap: false,
    zIndex: 10,
    x: 1060,
    y: 155,
    scale: 0.92,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
    visible: true,
  },
  {
    id: 'mochi-cat',
    type: 'character',
    kind: 'moonlit_cat',
    state: 'idle',
    zIndex: 22,
    x: 245,
    y: 618,
    scale: 1.28,
    flipX: false,
    speechText: '',
    speechStyle: 'speech',
    visible: true,
  },
  {
    id: 'chime-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 31,
    x: 945,
    y: 455,
    scale: 1.05,
    count: 5,
    opacity: 0,
    visible: false,
  },
];

// ---------------------------------------------------------------------------
// Timeline — Stepped 6 FPS Keyframe Animation Tracks
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_TIMELINE: TimelineTrack[] = [
  // Zone A static visibility toggles (hide cleanly at t = 18.2s)
  zoneToggleTrack('zone-a-sky', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-hedge', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-lawn', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-path', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-stars', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-flowers', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-cottage', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-tree-left', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-tree-right', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-lantern', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-grass-left', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-grass-mid', ZONE_CUT_TIME, true),
  zoneToggleTrack('zone-a-grass-right', ZONE_CUT_TIME, true),

  // Zone A drifting night clouds
  {
    nodeId: 'zone-a-cloud-left',
    keyframes: [
      { time: 0.0, x: 310, y: 122, visible: true },
      { time: 18.0, x: 395, y: 120, visible: true, hold: true },
      { time: ZONE_CUT_TIME, x: 395, y: 120, visible: false, hold: true },
    ],
  },
  {
    nodeId: 'zone-a-cloud-mid',
    keyframes: [
      { time: 0.0, x: 745, y: 158, visible: true },
      { time: 18.0, x: 815, y: 155, visible: true, hold: true },
      { time: ZONE_CUT_TIME, x: 815, y: 155, visible: false, hold: true },
    ],
  },

  // Wind-Chime Arbor lights up when Mochi taps it at t = 12.6s
  {
    nodeId: 'zone-a-wind-chimes',
    keyframes: [
      { time: 0.0, visible: true, lit: false, hold: true },
      { time: 12.6, visible: true, lit: true, hold: true },
      { time: ZONE_CUT_TIME, visible: false, lit: true, hold: true },
    ],
  },

  // Zone B static visibility toggles (appear cleanly at t = 18.2s)
  zoneToggleTrack('zone-b-sky', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-sky-canopy', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-hedge-ring', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-lawn', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-glade-pool', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-stars', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-flowers', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-lantern', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-tree-left', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-tree-right', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-grass-left', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-grass-right', ZONE_CUT_TIME, false),
  zoneToggleTrack('zone-b-fountain', ZONE_CUT_TIME, false),

  // Zone B drifting midnight cloud
  {
    nodeId: 'zone-b-cloud',
    keyframes: [
      { time: 0.0, x: 460, y: 118, visible: false, hold: true },
      { time: ZONE_CUT_TIME, x: 460, y: 118, visible: true },
      { time: 30.0, x: 530, y: 114, visible: true, hold: true },
    ],
  },

  // Smiling Moon: idle -> curious watching chimes -> Zone B clearing -> sleepy with nightcap
  {
    nodeId: 'smiling-moon',
    keyframes: [
      {
        time: 0.0,
        x: 1060,
        y: 155,
        scale: 0.92,
        state: 'idle',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: 12.4,
        x: 1060,
        y: 155,
        scale: 0.92,
        state: 'curious',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: ZONE_CUT_TIME,
        x: 960,
        y: 148,
        scale: 0.98,
        state: 'curious',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: 25.5,
        x: 960,
        y: 148,
        scale: 0.98,
        state: 'sleepy',
        wearingNightcap: true,
        hold: true,
      },
      {
        time: 30.0,
        x: 960,
        y: 148,
        scale: 0.98,
        state: 'sleepy',
        wearingNightcap: true,
        hold: true,
      },
    ],
  },

  // Mochi the Moonlit Cat: canonical +X walking, 6 FPS animated mouth while speaking, cozy sleep
  {
    nodeId: 'mochi-cat',
    keyframes: [
      // Act I: Standing curiously by lantern during book opening, then trotting along the path
      {
        time: 0.0,
        x: 245,
        y: 618,
        state: 'idle',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 3.0,
        x: 245,
        y: 618,
        state: 'idle',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 3.3,
        x: 245,
        y: 618,
        state: 'walking',
        flipX: false,
        speechText: '',
      },
      {
        time: 8.2,
        x: 825,
        y: 616,
        state: 'looking_up',
        flipX: false,
        speechText: '',
        hold: true,
      },
      // Cat Line 1 (8.75..12.27s = 3.52s exact WAV duration) — 6 FPS speaking mouth active!
      {
        time: 8.75,
        x: 825,
        y: 616,
        state: 'singing',
        flipX: false,
        speechText: 'Oooh, shiny chimes!',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
        hold: true,
      },
      {
        time: 12.28,
        x: 825,
        y: 616,
        state: 'looking_up',
        flipX: false,
        speechText: '',
        hold: true,
      },

      // Act II: Steps right beside the dangling chime catcher (x=885), taps chimes, then walks through arbor
      {
        time: 12.4,
        x: 825,
        y: 616,
        state: 'walking',
        flipX: false,
        speechText: '',
      },
      {
        time: 12.6,
        x: 885,
        y: 616,
        state: 'waving',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 16.0,
        x: 885,
        y: 616,
        state: 'looking_up',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 16.2,
        x: 885,
        y: 616,
        state: 'walking',
        flipX: false,
        speechText: '',
      },
      {
        time: 18.0,
        x: 1255,
        y: 616,
        state: 'walking',
        flipX: false,
        speechText: '',
        hold: true,
      },

      // Act III: Enters Zone B clearing from left, marvels at fountain & bids the Moon goodnight
      {
        time: ZONE_CUT_TIME,
        x: 140,
        y: 622,
        state: 'walking',
        flipX: false,
        speechText: '',
      },
      {
        time: 20.6,
        x: 585,
        y: 622,
        state: 'curious',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 22.4,
        x: 585,
        y: 622,
        state: 'looking_up',
        flipX: false,
        speechText: '',
        hold: true,
      },
      // Cat Line 2 (23.45..26.97s = 3.52s exact WAV duration) — 6 FPS speaking mouth active!
      {
        time: 23.45,
        x: 585,
        y: 622,
        state: 'singing',
        flipX: false,
        speechText: 'Goodnight, Moon! ★',
        speechStyle: 'speech',
        speechTail: 'bottom-center',
        hold: true,
      },

      // Act IV: Curls up cozily beside the moonlit fountain for sweet dreams (zero voice bleed!)
      {
        time: 27.0,
        x: 610,
        y: 628,
        state: 'sleeping',
        flipX: false,
        speechText: '',
        hold: true,
      },
      {
        time: 30.0,
        x: 610,
        y: 628,
        state: 'sleeping',
        flipX: false,
        speechText: '',
        hold: true,
      },
    ],
  },

  // Musical chime notes floating upward from arbor (Act II) & lullaby notes over fountain (Act IV)
  {
    nodeId: 'chime-notes',
    keyframes: [
      {
        time: 0.0,
        visible: false,
        opacity: 0,
        x: 945,
        y: 455,
        count: 5,
        hold: true,
      },
      {
        time: 12.6,
        visible: true,
        opacity: 0,
        x: 945,
        y: 455,
        count: 5,
      },
      {
        time: 13.4,
        visible: true,
        opacity: 0.95,
        x: 945,
        y: 430,
        count: 5,
      },
      {
        time: 16.6,
        visible: true,
        opacity: 0.95,
        x: 945,
        y: 356,
        count: 5,
      },
      {
        time: 17.8,
        visible: false,
        opacity: 0,
        x: 945,
        y: 335,
        count: 5,
        hold: true,
      },
      {
        time: 25.4,
        visible: true,
        opacity: 0,
        x: 675,
        y: 505,
        count: 4,
      },
      {
        time: 26.2,
        visible: true,
        opacity: 0.88,
        x: 675,
        y: 478,
        count: 4,
      },
      {
        time: 28.0,
        visible: true,
        opacity: 0.82,
        x: 675,
        y: 418,
        count: 4,
      },
      {
        time: 29.0,
        visible: false,
        opacity: 0,
        x: 675,
        y: 392,
        count: 4,
        hold: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Camera Choreography — Expressive Stepped Pan & Zoom
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_CAMERA: CameraKeyframe[] = [
  { time: 0.0, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 11.8, x: 0, y: 0, zoom: 1.0 },
  { time: 12.4, x: 155, y: 58, zoom: 1.2, hold: true },
  { time: 16.0, x: 155, y: 58, zoom: 1.2 },
  { time: 16.4, x: 155, y: 58, zoom: 1.2 },
  { time: 18.0, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: ZONE_CUT_TIME, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 20.6, x: 0, y: 0, zoom: 1.0 },
  { time: 21.6, x: 95, y: 38, zoom: 1.14, hold: true },
  { time: 26.4, x: 95, y: 38, zoom: 1.14 },
  { time: 27.0, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 30.0, x: 0, y: 0, zoom: 1.0, hold: true },
];

// ---------------------------------------------------------------------------
// Procedural Audio Cues — Crayon Scribbles, Wind Chimes & Bedtime Lullaby
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_AUDIO_CUES: AudioNoteCue[] = [
  // Opening hardcover color-in scribbles & soft welcome chime
  { time: 0.4, freq: 720.0, duration: 0.35, kind: 'crayon_scribble' },
  { time: 1.3, freq: 810.0, duration: 0.35, kind: 'crayon_scribble' },
  { time: 2.2, freq: 760.0, duration: 0.35, kind: 'crayon_scribble' },
  { time: 2.8, freq: 523.25, duration: 0.65, kind: 'chime' },

  // Arbor discovery sparkle
  { time: 8.4, freq: 659.25, duration: 0.45, kind: 'chime' },

  // Magical wind-chime bursts & high chime sparkles when Mochi taps the arbor
  { time: 12.6, freq: 587.33, duration: 0.95, kind: 'garden_wind_chime' },
  { time: 13.0, freq: 1046.5, duration: 0.45, kind: 'chime' },
  { time: 13.9, freq: 659.25, duration: 0.95, kind: 'garden_wind_chime' },
  { time: 14.6, freq: 1174.66, duration: 0.45, kind: 'chime' },
  { time: 15.5, freq: 783.99, duration: 0.95, kind: 'garden_wind_chime' },
  { time: 16.3, freq: 1318.51, duration: 0.45, kind: 'chime' },

  // Secret clearing reveal & dancing firefly sparkles
  { time: 18.3, freq: 523.25, duration: 0.95, kind: 'garden_wind_chime' },
  { time: 20.8, freq: 987.77, duration: 0.5, kind: 'chime' },
  { time: 22.0, freq: 1174.66, duration: 0.5, kind: 'chime' },

  // Bedtime lullaby resolution, soft parting wind chimes & storybook closing scribble
  { time: 25.8, freq: 523.25, duration: 0.9, kind: 'garden_wind_chime' },
  { time: 27.1, freq: 392.0, duration: 0.75, kind: 'lullaby' },
  { time: 27.8, freq: 440.0, duration: 0.95, kind: 'garden_wind_chime' },
  { time: 28.4, freq: 329.63, duration: 0.85, kind: 'lullaby' },
  { time: 28.9, freq: 680.0, duration: 0.4, kind: 'crayon_scribble' },
];

// ---------------------------------------------------------------------------
// Pre-Rendered BGM & Gemini TTS Voiceover Audio Clips (Exact Measured Durations)
// ---------------------------------------------------------------------------
const STARTER_MOONLIT_CAT_AUDIO_CLIPS: AudioClipCue[] = [
  {
    id: 'bgm-lullaby',
    src: '/audio/moonlit-cat-lullaby-bgm.wav',
    startTime: 0.0,
    duration: 30.0,
    volume: 0.28,
    label: 'Moonlit Garden Dynamic Lullaby BGM',
  },
  {
    id: 'narrator-01',
    src: '/audio/moonlit-cat-narrator-01.wav',
    startTime: 3.0,
    duration: 5.48,
    volume: 0.96,
    label: 'Act I Narration — Under a silver moon, Mochi explored the garden.',
  },
  {
    id: 'cat-meow-01',
    src: '/audio/moonlit-cat-meow-01.wav',
    startTime: 8.75,
    duration: 3.52,
    volume: 0.95,
    label: 'Mochi Line 1 — Oooh, shiny chimes!',
  },
  {
    id: 'narrator-02',
    src: '/audio/moonlit-cat-narrator-02.wav',
    startTime: 12.5,
    duration: 5.44,
    volume: 0.96,
    label: 'Act II Narration — One soft tap woke a sparkling lullaby.',
  },
  {
    id: 'narrator-03',
    src: '/audio/moonlit-cat-narrator-03.wav',
    startTime: 18.4,
    duration: 4.8,
    volume: 0.96,
    label: 'Act III Narration — Fireflies danced over the moonlit fountain.',
  },
  {
    id: 'cat-meow-02',
    src: '/audio/moonlit-cat-meow-02.wav',
    startTime: 23.45,
    duration: 3.52,
    volume: 0.95,
    label: 'Mochi Line 2 — Goodnight, Moon!',
  },
];

// ---------------------------------------------------------------------------
// Scene Definition Export
// ---------------------------------------------------------------------------
export const STARTER_MOONLIT_CAT_SCENE: SceneDefinition = {
  id: 'starter-moonlit-cat',
  title: "Mochi's Moonlit Garden",
  subtitle: 'A Curious Cat, Sparkling Wind Chimes & a Lullaby Fountain',
  durationSec: 30,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  vibrantMode: true,
  bookFrame: {
    enabled: true,
    coverTitle: "Mochi's Moonlit Garden",
    coverSubtitle: 'A Moonlit Lullaby Adventure',
    creditText: 'Illustrated in Crayon & Pastel',
    endingTitle: 'The End ★',
    endingCredit: "Mochi's Moonlit Garden · Sweet Dreams",
    coverMaterial: 'markerIndigoNight',
    accentMaterial: 'crayonWarmMoon',
    openDurationSec: 3.0,
    closeDurationSec: 3.0,
  },
  acts: STARTER_MOONLIT_CAT_ACTS,
  nodes: STARTER_MOONLIT_CAT_NODES,
  timeline: STARTER_MOONLIT_CAT_TIMELINE,
  camera: STARTER_MOONLIT_CAT_CAMERA,
  audioCues: STARTER_MOONLIT_CAT_AUDIO_CUES,
  audioClips: STARTER_MOONLIT_CAT_AUDIO_CLIPS,
};

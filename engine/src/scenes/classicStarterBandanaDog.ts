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
 * "Biscuit's Sunny Day" — 44-second 3-Act Classic Hand-Drawn Cel Backyard Short
 * (`id: 'classic-starter-bandana-dog'`)
 *
 * Crafted in the 1970s–1980s Disney Xerox flat-cel & wet-on-wet watercolor tradition
 * (inspired by *Robin Hood* 1973 Eastmancolor daylight meadows):
 * - Act I (0.0–20.4s): Sunny Backyard Morning — Biscuit greets his friend outside his
 *   cottage and doghouse before spotting a bouncing tennis ball and sprinting off to chase it.
 * - Act II (20.4–32.6s): Sunlit Park Meadow Fetch — Across a dappled midday woodland meadow,
 *   Biscuit bounds after the soaring ball, makes a triumphant catch as a red squirrel cheers,
 *   and trots proudly home nudging his prize.
 * - Act III (32.6–44.0s): Golden Afternoon Home — Beneath a warm peach-and-amber afternoon sky
 *   with cozy lit cottage windows, Biscuit returns home with his ball and waves a happy goodbye
 *   as the classic circular theatrical iris closes on "The End".
 */

const ACT_1_2_CUT = 20.4;
const ACT_2_3_CUT = 32.6;
const C = TOKENS.classicCel.colors;

const OVERBLEED_BOUNDS = {
  x: -60,
  y: -40,
  width: 1400,
  height: 800,
} as const;

/** Builds a crisp stepped visibility track for a node active only during [startTime, endTime). */
function zoneWindowTrack(
  nodeId: string,
  startTime: number,
  endTime?: number
): TimelineTrack {
  const keyframes: TimelineTrack['keyframes'] = [];
  if (startTime > 0) {
    keyframes.push({ time: 0, visible: false, hold: true });
    keyframes.push({ time: startTime, visible: true, hold: true });
  } else {
    keyframes.push({ time: 0, visible: true, hold: true });
  }
  if (endTime !== undefined) {
    keyframes.push({ time: endTime, visible: false, hold: true });
  }
  return { nodeId, keyframes };
}

/** Builds a crisp stepped visibility track for backyard nodes visible in Acts I & III only. */
function backyardWindowTrack(nodeId: string): TimelineTrack {
  return {
    nodeId,
    keyframes: [
      { time: 0.0, visible: true, hold: true },
      { time: ACT_1_2_CUT, visible: false, hold: true },
      { time: ACT_2_3_CUT, visible: true, hold: true },
    ],
  };
}

// ---------------------------------------------------------------------------
// Acts — 3 Chronological Daylight Acts (Morning -> Midday -> Golden Afternoon)
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_ACTS: StoryAct[] = [
  {
    id: 'act-1-backyard-morning',
    title: 'Act I · Sunny Backyard Morning',
    startTime: 0.0,
    endTime: ACT_1_2_CUT,
    caption:
      'In a sunlit watercolor backyard, cheerful Biscuit greets his friend outside his cozy doghouse before spotting a bouncing tennis ball and dashing off to chase it!',
  },
  {
    id: 'act-2-park-fetch',
    title: 'Act II · Sunlit Park Meadow Fetch',
    startTime: ACT_1_2_CUT,
    endTime: ACT_2_3_CUT,
    caption:
      'Across a flower-dotted midday park meadow, Biscuit bounds after the soaring tennis ball, makes a joyful catch while a friendly red squirrel cheers, and trots proudly home!',
  },
  {
    id: 'act-3-golden-home',
    title: 'Act III · Golden Afternoon Home',
    startTime: ACT_2_3_CUT,
    endTime: 44.0,
    caption:
      'Beneath a warm golden-afternoon sky and glowing cottage windows, Biscuit nudges his tennis ball home and waves a happy paw goodbye as the theatrical iris closes.',
  },
];

// ---------------------------------------------------------------------------
// Camera Choreography — Gentle Multiplane Framing & Clean Cut Transitions
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_CAMERA: CameraKeyframe[] = [
  // Act I: Wide establishing view for iris opening, gentle warm push-in on Biscuit, wide runway for sprint
  { time: 0.0, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 5.2, x: 0, y: 0, zoom: 1.0 },
  { time: 7.2, x: -16, y: 28, zoom: 1.07, hold: true },
  { time: 17.2, x: -16, y: 28, zoom: 1.07 },
  { time: 17.9, x: 0, y: 0, zoom: 1.0, hold: true },

  // Act II: Wide park establishing frame, lively push-in on Biscuit's catch celebration, pull wide for trot home
  { time: ACT_1_2_CUT, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 23.7, x: 0, y: 0, zoom: 1.0 },
  { time: 24.5, x: 42, y: 28, zoom: 1.06, hold: true },
  { time: 28.9, x: 42, y: 28, zoom: 1.06 },
  { time: 29.6, x: 0, y: 0, zoom: 1.0, hold: true },

  // Act III: Full golden-afternoon arrival, cozy subtle push-in during farewell, clean 1.0x frame for iris-out
  { time: ACT_2_3_CUT, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 34.4, x: 0, y: 0, zoom: 1.0 },
  { time: 36.2, x: -8, y: 18, zoom: 1.04, hold: true },
  { time: 39.8, x: -8, y: 18, zoom: 1.04 },
  { time: 40.7, x: 0, y: 0, zoom: 1.0, hold: true },
  { time: 44.0, x: 0, y: 0, zoom: 1.0, hold: true },
];

// ---------------------------------------------------------------------------
// Scene Nodes — Multiplane Wet-on-Wet Watercolor Board (Layer 1A) + Flat Cels (Layer 1B)
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_NODES: SceneNode[] = [
  // =========================================================================
  // LAYER 1A: MORNING & MIDDAY SKY WATERCOLOR WASHES (Acts I & II)
  // =========================================================================
  {
    id: 'sky-day-base',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    softEdge: false,
    outlined: false,
    gradient: {
      id: 'cc-dog-sky-day-base',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.daySkyZenith },
        { offset: '52%', color: C.daySkyMid },
        { offset: '100%', color: C.daySkyHorizon },
      ],
    },
    bounds: { x: -60, y: -40, width: 1400, height: 492 },
    d: 'M -60 -40 L 1340 -40 L 1340 448 L -60 448 Z',
    visible: true,
  },
  {
    id: 'sky-day-mottle-a',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    softEdge: true,
    outlined: false,
    opacity: 0.44,
    gradient: {
      id: 'cc-dog-sky-day-mottle-a',
      type: 'radial',
      cx: '30%',
      cy: '36%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.dayCloudLight, opacity: 0.68 },
        { offset: '56%', color: C.daySkyMid, opacity: 0.32 },
        { offset: '100%', color: C.daySkyZenith, opacity: 0 },
      ],
    },
    bounds: { x: -60, y: -24, width: 840, height: 340 },
    d: 'M -52 24 C 130 -24, 415 -14, 650 56 C 752 88, 792 178, 738 252 C 674 328, 395 334, 168 304 C 36 286, -38 240, -52 178 Z',
    visible: true,
  },
  {
    id: 'sky-day-mottle-b',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    softEdge: true,
    outlined: false,
    opacity: 0.4,
    gradient: {
      id: 'cc-dog-sky-day-mottle-b',
      type: 'radial',
      cx: '68%',
      cy: '60%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.daySkyHorizon, opacity: 0.72 },
        { offset: '52%', color: C.dayCloudLight, opacity: 0.36 },
        { offset: '100%', color: C.daySkyMid, opacity: 0 },
      ],
    },
    bounds: { x: 420, y: 60, width: 920, height: 360 },
    d: 'M 448 256 C 510 128, 745 72, 995 86 C 1175 96, 1305 168, 1340 264 L 1340 426 L 456 426 Z',
    visible: true,
  },

  // =========================================================================
  // LAYER 1A: GOLDEN AFTERNOON SKY & WARM SUNLIGHT GLAZE (Act III only)
  // =========================================================================
  {
    id: 'sky-afternoon-base',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonWarmMoon',
    softEdge: false,
    outlined: false,
    gradient: {
      id: 'cc-dog-sky-afternoon-base',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.afternoonSkyTop },
        { offset: '54%', color: C.afternoonSkyMid },
        { offset: '100%', color: C.afternoonSkyHorizon },
      ],
    },
    bounds: { x: -60, y: -40, width: 1400, height: 492 },
    d: 'M -60 -40 L 1340 -40 L 1340 448 L -60 448 Z',
    visible: false,
  },
  {
    id: 'sky-afternoon-glow',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    material: 'crayonSunsetOrange',
    softEdge: true,
    outlined: false,
    opacity: 0.56,
    gradient: {
      id: 'cc-dog-sky-afternoon-glow',
      type: 'radial',
      cx: '76%',
      cy: '56%',
      r: '58%',
      stops: [
        { offset: '0%', color: C.warmAmberCore, opacity: 0.66 },
        { offset: '40%', color: C.afternoonGlowWash, opacity: 0.54 },
        { offset: '76%', color: C.afternoonSkyHorizon, opacity: 0.28 },
        { offset: '100%', color: C.afternoonSkyMid, opacity: 0 },
      ],
    },
    bounds: { x: 180, y: 60, width: 1160, height: 390 },
    d: 'M 210 292 C 350 148, 660 74, 980 86 C 1160 92, 1295 160, 1340 250 L 1340 446 L 200 446 Z',
    visible: false,
  },

  // =========================================================================
  // LAYER 1A: BACKYARD WATERCOLOR TERRAIN (Acts I & III)
  // =========================================================================
  {
    id: 'backyard-distant-woods',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.86,
    gradient: {
      id: 'cc-dog-backyard-woods',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.dayHillFar },
        { offset: '58%', color: C.dayHillMid },
        { offset: '100%', color: C.dayFoliageMid },
      ],
    },
    bounds: { x: -60, y: 324, width: 1400, height: 146 },
    d: 'M -60 398 C 65 344, 195 332, 345 362 C 495 392, 645 336, 815 348 C 985 360, 1145 328, 1340 364 L 1340 468 L -60 468 Z',
    visible: true,
  },
  {
    id: 'ground-backyard-base',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    softEdge: false,
    outlined: false,
    gradient: {
      id: 'cc-dog-ground-backyard-base',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.dayMeadowLight },
        { offset: '48%', color: C.dayMeadowMid },
        { offset: '100%', color: C.dayMeadowShadow },
      ],
    },
    bounds: { x: -60, y: 404, width: 1400, height: 356 },
    d: 'M -60 418 C 180 406, 430 422, 680 412 C 930 402, 1140 418, 1340 412 L 1340 760 L -60 760 Z',
    visible: true,
  },
  {
    id: 'ground-backyard-dapple-a',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.48,
    gradient: {
      id: 'cc-dog-ground-backyard-dapple-a',
      type: 'radial',
      cx: '52%',
      cy: '50%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.sunGoldLight, opacity: 0.52 },
        { offset: '52%', color: C.dayMeadowLight, opacity: 0.36 },
        { offset: '100%', color: C.dayMeadowMid, opacity: 0 },
      ],
    },
    bounds: { x: 310, y: 446, width: 760, height: 240 },
    d: 'M 340 554 C 386 472, 570 448, 755 462 C 920 474, 1062 522, 1044 596 C 1026 668, 822 690, 622 678 C 446 666, 304 618, 340 554 Z',
    visible: true,
  },
  {
    id: 'ground-backyard-dapple-b',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.44,
    gradient: {
      id: 'cc-dog-ground-backyard-dapple-b',
      type: 'radial',
      cx: '46%',
      cy: '52%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.dayFoliageShadow, opacity: 0.56 },
        { offset: '56%', color: C.dayMeadowShadow, opacity: 0.34 },
        { offset: '100%', color: C.dayMeadowMid, opacity: 0 },
      ],
    },
    bounds: { x: -60, y: 458, width: 620, height: 245 },
    d: 'M -46 568 C 12 486, 178 462, 344 476 C 478 488, 566 538, 542 612 C 516 686, 314 708, 128 696 C 16 688, -74 636, -46 568 Z',
    visible: true,
  },
  {
    id: 'garden-path',
    type: 'background_patch',
    zIndex: 6,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    softEdge: true,
    outlined: false,
    opacity: 0.86,
    gradient: {
      id: 'cc-dog-garden-path',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.pathMoonlit },
        { offset: '52%', color: C.ochreEarth },
        { offset: '100%', color: C.pathEarthMid },
      ],
    },
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M 215 512 C 295 524, 395 556, 515 572 C 625 586, 705 604, 748 634 C 670 650, 520 648, 392 618 C 290 594, 215 560, 178 526 Z',
    visible: true,
  },
  // Warm amber sunlight glaze over the backyard lawn during Act III golden afternoon
  {
    id: 'ground-afternoon-wash',
    type: 'background_patch',
    zIndex: 7,
    x: 0,
    y: 0,
    material: 'crayonWindowGlow',
    softEdge: true,
    outlined: false,
    opacity: 0.36,
    gradient: {
      id: 'cc-dog-ground-afternoon-wash',
      type: 'radial',
      cx: '64%',
      cy: '36%',
      r: '64%',
      stops: [
        { offset: '0%', color: C.warmAmberGlow, opacity: 0.68 },
        { offset: '54%', color: C.afternoonGlowWash, opacity: 0.38 },
        { offset: '100%', color: C.ochreEarth, opacity: 0 },
      ],
    },
    bounds: { x: -60, y: 404, width: 1400, height: 356 },
    d: 'M -60 422 C 210 408, 560 416, 920 408 C 1120 404, 1260 414, 1340 418 L 1340 760 L -60 760 Z',
    visible: false,
  },

  // =========================================================================
  // LAYER 1A: PARK MEADOW WATERCOLOR TERRAIN (Act II only)
  // =========================================================================
  {
    id: 'park-hill-far',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.88,
    gradient: {
      id: 'cc-dog-park-hill-far',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.dayHillFar },
        { offset: '66%', color: C.dayHillMid },
        { offset: '100%', color: C.dayFoliageMid },
      ],
    },
    bounds: { x: -60, y: 332, width: 1400, height: 158 },
    d: 'M -60 396 C 140 342, 360 336, 575 376 C 795 416, 995 340, 1220 364 C 1275 370, 1310 382, 1340 390 L 1340 488 L -60 488 Z',
    visible: false,
  },
  {
    id: 'park-hill-mid',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.92,
    gradient: {
      id: 'cc-dog-park-hill-mid',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.dayHillMid },
        { offset: '55%', color: C.dayFoliageLit },
        { offset: '100%', color: C.dayMeadowMid },
      ],
    },
    bounds: { x: -60, y: 368, width: 1400, height: 128 },
    d: 'M -60 416 C 165 374, 395 408, 645 384 C 885 362, 1110 404, 1340 382 L 1340 494 L -60 494 Z',
    visible: false,
  },
  {
    id: 'ground-park-base',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonGrassGreen',
    softEdge: false,
    outlined: false,
    gradient: {
      id: 'cc-dog-ground-park-base',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.dayMeadowLight },
        { offset: '52%', color: C.dayMeadowMid },
        { offset: '100%', color: C.dayFoliageMid },
      ],
    },
    bounds: { x: -60, y: 416, width: 1400, height: 344 },
    d: 'M -60 432 C 210 420, 480 436, 760 424 C 1000 416, 1180 434, 1340 426 L 1340 760 L -60 760 Z',
    visible: false,
  },
  {
    id: 'ground-park-dapple-a',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.5,
    gradient: {
      id: 'cc-dog-ground-park-dapple-a',
      type: 'radial',
      cx: '54%',
      cy: '48%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.sunGoldLight, opacity: 0.58 },
        { offset: '54%', color: C.dayMeadowLight, opacity: 0.36 },
        { offset: '100%', color: C.dayMeadowMid, opacity: 0 },
      ],
    },
    bounds: { x: 340, y: 450, width: 780, height: 235 },
    d: 'M 370 558 C 415 478, 608 454, 795 466 C 958 476, 1104 522, 1086 594 C 1068 666, 862 686, 658 674 C 482 664, 336 620, 370 558 Z',
    visible: false,
  },
  {
    id: 'ground-park-dapple-b',
    type: 'background_patch',
    zIndex: 5,
    x: 0,
    y: 0,
    material: 'crayonTreeGreen',
    softEdge: true,
    outlined: false,
    opacity: 0.44,
    gradient: {
      id: 'cc-dog-ground-park-dapple-b',
      type: 'radial',
      cx: '44%',
      cy: '52%',
      r: '56%',
      stops: [
        { offset: '0%', color: C.dayFoliageShadow, opacity: 0.54 },
        { offset: '55%', color: C.dayMeadowShadow, opacity: 0.32 },
        { offset: '100%', color: C.dayFoliageMid, opacity: 0 },
      ],
    },
    bounds: { x: -60, y: 460, width: 580, height: 240 },
    d: 'M -42 572 C 18 488, 174 464, 330 478 C 454 490, 534 540, 512 612 C 488 684, 294 704, 116 694 C 10 688, -72 638, -42 572 Z',
    visible: false,
  },
  {
    id: 'park-trail',
    type: 'background_patch',
    zIndex: 6,
    x: 0,
    y: 0,
    material: 'crayonOchre',
    softEdge: true,
    outlined: false,
    opacity: 0.86,
    gradient: {
      id: 'cc-dog-park-trail',
      type: 'linear',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      stops: [
        { offset: '0%', color: C.pathMoonlit },
        { offset: '48%', color: C.ochreEarth },
        { offset: '100%', color: C.pathEarthMid },
      ],
    },
    bounds: { ...OVERBLEED_BOUNDS },
    d: 'M -60 582 C 220 562, 510 554, 790 572 C 1010 586, 1180 578, 1340 566 L 1340 642 C 1170 656, 980 654, 760 638 C 490 618, 210 628, -60 648 Z',
    visible: false,
  },

  // =========================================================================
  // CELESTIAL & DRIFTING WATERCOLOR CLOUDS (Chronological Sun Arc)
  // =========================================================================
  {
    id: 'sunny-sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 8,
    x: 1080,
    y: 118,
    scale: 0.46,
    speaking: false,
    visible: true,
  },
  {
    id: 'cloud-left',
    type: 'prop',
    kind: 'fluffy_cloud',
    lit: true,
    zIndex: 8,
    x: 240,
    y: 110,
    scale: 1.05,
    variant: 1,
    opacity: 0.88,
    visible: true,
  },
  {
    id: 'cloud-right',
    type: 'prop',
    kind: 'fluffy_cloud',
    lit: true,
    zIndex: 8,
    x: 790,
    y: 142,
    scale: 0.9,
    variant: 2,
    opacity: 0.84,
    visible: true,
  },

  // =========================================================================
  // BACKYARD SET (Acts I & III — 100% Native Classic Cel)
  // =========================================================================
  {
    id: 'backyard-tree-left',
    type: 'prop',
    kind: 'tree',
    lit: true,
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
    lit: true,
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
  // PARK SET (Act II only — 100% Native Classic Cel)
  // =========================================================================
  {
    id: 'park-meadow-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    lit: true,
    zIndex: 8,
    x: 640,
    y: 500,
    scale: 1.0,
    visible: false,
  },
  {
    id: 'park-tree-mid',
    type: 'prop',
    kind: 'tree',
    lit: true,
    zIndex: 9,
    x: 560,
    y: 438,
    scale: 0.92,
    variant: 1,
    visible: false,
  },
  {
    id: 'park-tree-left',
    type: 'prop',
    kind: 'tree',
    lit: true,
    zIndex: 10,
    x: 175,
    y: 460,
    scale: 1.55,
    variant: 2,
    visible: false,
  },
  {
    id: 'park-tree-right',
    type: 'prop',
    kind: 'tree',
    lit: true,
    zIndex: 10,
    x: 1105,
    y: 470,
    scale: 1.48,
    variant: 1,
    visible: false,
  },
  {
    id: 'park-lantern',
    type: 'prop',
    kind: 'street_lantern',
    lit: false,
    zIndex: 12,
    x: 365,
    y: 478,
    scale: 1.25,
    visible: false,
  },
  {
    id: 'park-squirrel',
    type: 'character',
    kind: 'red_squirrel',
    state: 'curious',
    zIndex: 19,
    x: 225,
    y: 595,
    scale: 1.15,
    flipX: false,
    speaking: false,
    visible: false,
  },

  // =========================================================================
  // HERO CHARACTER, FETCH PROP & FOREGROUND ACCENTS
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
    speaking: false,
    visible: true,
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
  {
    id: 'grass-fg-left',
    type: 'prop',
    kind: 'grass_patch',
    lit: true,
    zIndex: 28,
    x: 125,
    y: 672,
    scale: 1.15,
    variant: 1,
    visible: true,
  },
  {
    id: 'grass-fg-mid',
    type: 'prop',
    kind: 'grass_patch',
    lit: true,
    zIndex: 28,
    x: 415,
    y: 690,
    scale: 1.0,
    variant: 3,
    visible: true,
  },
  {
    id: 'grass-fg-right',
    type: 'prop',
    kind: 'grass_patch',
    lit: true,
    zIndex: 28,
    x: 1135,
    y: 678,
    scale: 1.2,
    variant: 2,
    visible: true,
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

// ---------------------------------------------------------------------------
// Timeline — Chronological Lighting, Bubble-Free Lip-Sync & Smooth Fetch Blocking
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_TIMELINE: TimelineTrack[] = [
  // ─── SKY & LIGHTING TRANSITIONS (Morning -> Midday -> Golden Afternoon) ───
  zoneWindowTrack('sky-day-base', 0.0, ACT_2_3_CUT),
  zoneWindowTrack('sky-day-mottle-a', 0.0, ACT_2_3_CUT),
  zoneWindowTrack('sky-day-mottle-b', 0.0, ACT_2_3_CUT),
  zoneWindowTrack('sky-afternoon-base', ACT_2_3_CUT),
  zoneWindowTrack('sky-afternoon-glow', ACT_2_3_CUT),
  zoneWindowTrack('ground-afternoon-wash', ACT_2_3_CUT),

  {
    nodeId: 'sunny-sun',
    keyframes: [
      // Act I: Morning sun upper-right
      { time: 0.0, x: 1080, y: 118, scale: 0.46, state: 'awake', speaking: false, hold: true },
      // Act II: Bright midday sun high center
      { time: ACT_1_2_CUT, x: 640, y: 96, scale: 0.48, state: 'awake', speaking: false, hold: true },
      // Act III: Golden-afternoon sun lowering warmly toward right horizon
      { time: ACT_2_3_CUT, x: 1100, y: 215, scale: 0.5, state: 'awake', speaking: false, hold: true },
    ],
  },
  {
    nodeId: 'cloud-left',
    keyframes: [
      { time: 0.0, x: 240, y: 110 },
      { time: 20.3, x: 332, y: 110, hold: true },
      { time: ACT_1_2_CUT, x: 190, y: 124 },
      { time: 32.5, x: 286, y: 124, hold: true },
      { time: ACT_2_3_CUT, x: 265, y: 106 },
      { time: 44.0, x: 345, y: 106 },
    ],
  },
  {
    nodeId: 'cloud-right',
    keyframes: [
      { time: 0.0, x: 790, y: 142 },
      { time: 20.3, x: 878, y: 142, hold: true },
      { time: ACT_1_2_CUT, x: 960, y: 112 },
      { time: 32.5, x: 1048, y: 112, hold: true },
      { time: ACT_2_3_CUT, x: 760, y: 138 },
      { time: 44.0, x: 838, y: 138 },
    ],
  },

  // ─── BACKYARD TERRAIN & PROPS (Visible in Acts I & III; hidden in Act II) ───
  backyardWindowTrack('backyard-distant-woods'),
  backyardWindowTrack('ground-backyard-base'),
  backyardWindowTrack('ground-backyard-dapple-a'),
  backyardWindowTrack('ground-backyard-dapple-b'),
  backyardWindowTrack('garden-path'),
  backyardWindowTrack('backyard-tree-left'),
  backyardWindowTrack('backyard-tree-right'),
  backyardWindowTrack('backyard-dog-house'),
  backyardWindowTrack('backyard-dog-bowl'),
  {
    nodeId: 'backyard-cottage',
    keyframes: [
      { time: 0.0, visible: true, windowLit: false, hold: true },
      { time: ACT_1_2_CUT, visible: false, windowLit: false, hold: true },
      // Warm glowing cottage window welcoming Biscuit home in Act III
      { time: ACT_2_3_CUT, visible: true, windowLit: true, hold: true },
    ],
  },

  // ─── PARK TERRAIN & PROPS (Visible in Act II only: 20.4 -> 32.6s) ───
  zoneWindowTrack('park-hill-far', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-hill-mid', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('ground-park-base', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('ground-park-dapple-a', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('ground-park-dapple-b', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-trail', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-meadow-flowers', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-tree-mid', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-tree-left', ACT_1_2_CUT, ACT_2_3_CUT),
  zoneWindowTrack('park-tree-right', ACT_1_2_CUT, ACT_2_3_CUT),
  {
    nodeId: 'park-lantern',
    keyframes: [
      { time: 0.0, visible: false, lit: false, hold: true },
      { time: ACT_1_2_CUT, visible: true, lit: false, hold: true },
      { time: ACT_2_3_CUT, visible: false, lit: false, hold: true },
    ],
  },
  {
    nodeId: 'park-squirrel',
    keyframes: [
      { time: 0.0, visible: false, state: 'curious', flipX: false, speaking: false, hold: true },
      // Watches curiously as Biscuit chases the bouncing tennis ball across the meadow
      { time: ACT_1_2_CUT, visible: true, state: 'curious', flipX: false, speaking: false, hold: true },
      // Cheers & waves joyfully when Biscuit makes his big catch!
      { time: 24.3, visible: true, state: 'waving', flipX: false, speaking: false, hold: true },
      { time: 29.45, visible: true, state: 'blinking', flipX: false, speaking: false, hold: true },
      { time: 30.15, visible: true, state: 'curious', flipX: false, speaking: false, hold: true },
      { time: ACT_2_3_CUT, visible: false, state: 'curious', flipX: false, speaking: false, hold: true },
    ],
  },

  // ─── BISCUIT (Hero Bandana Dog — Strictly Bubble-Free `speaking: true` Lip-Sync) ───
  {
    nodeId: 'biscuit',
    keyframes: [
      // Act I (0.00 - 3.00s): Theatrical iris opens on Biscuit sitting happily in the backyard
      {
        time: 0.0,
        x: 560,
        y: 595,
        scale: 1.45,
        flipX: false,
        state: 'sitting',
        speaking: false,
        hold: true,
      },
      // Act I (3.15 - 12.75s): Voice 1 (Narrator, off-screen) — lively silent reactions (`speaking: false`)
      { time: 5.4, x: 560, y: 595, state: 'blinking', speaking: false, hold: true },
      { time: 6.0, x: 560, y: 595, state: 'sitting', speaking: false, hold: true },
      { time: 7.6, x: 560, y: 595, state: 'curious', speaking: false, hold: true },
      { time: 9.2, x: 560, y: 595, state: 'sitting', speaking: false, hold: true },
      { time: 10.8, x: 560, y: 595, state: 'blinking', speaking: false, hold: true },
      { time: 11.4, x: 560, y: 595, state: 'curious', speaking: false, hold: true },
      { time: 12.5, x: 560, y: 595, state: 'sitting', speaking: false, hold: true },

      // Pre-greeting playful bark (13.05s) + eager little hop!
      { time: 13.05, x: 560, y: 583, flipX: false, state: 'waving', speaking: false, hold: true },

      // Act I (13.35 - 17.80s): Voice 2 (4.45s) — Biscuit greets & invites his friend to play fetch
      { time: 13.35, x: 560, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 15.1, x: 560, y: 583, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 15.5, x: 560, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      // Clean mouth stop immediately after Voice 2 finishes (17.80s)
      { time: 17.82, x: 560, y: 595, flipX: false, state: 'sitting', speaking: false, hold: true },

      // Perks up curiously as the tennis ball bounces into the yard (17.95s)
      { time: 17.95, x: 560, y: 595, flipX: false, state: 'curious', speaking: false, hold: true },
      // Sprints joyfully right (+X, flipX: false) off-screen (18.40 -> 19.90s), brisk 0.50s cut at 20.40s
      { time: 18.4, x: 560, y: 595, flipX: false, state: 'walking', speaking: false },
      { time: 19.9, x: 1430, y: 595, flipX: false, state: 'walking', speaking: false, hold: true },

      // Act II (20.40 - 32.60s): Brisk cut to Sunlit Park Meadow; Biscuit bounds in from left
      { time: ACT_1_2_CUT, x: -130, y: 595, flipX: false, state: 'walking', speaking: false, hold: true },
      { time: 20.8, x: -130, y: 595, flipX: false, state: 'walking', speaking: false },
      // Reaches the tennis ball at 24.30s & leaps triumphantly!
      { time: 24.3, x: 865, y: 580, flipX: false, state: 'waving', speaking: false, hold: true },

      // Act II (24.60 - 29.33s): Voice 3 (4.73s) — Biscuit celebrates his catch (`speaking: true`)
      { time: 24.6, x: 865, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 26.4, x: 865, y: 583, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 26.8, x: 865, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      // Clean mouth stop immediately after Voice 3 finishes (29.33s)
      { time: 29.35, x: 865, y: 595, flipX: false, state: 'waving', speaking: false, hold: true },

      // Turns left (-X, flipX: true) nudging his ball home (29.70 -> 32.10s), brisk 0.50s cut at 32.60s
      { time: 29.7, x: 865, y: 595, flipX: true, state: 'walking', speaking: false },
      { time: 32.1, x: -135, y: 595, flipX: true, state: 'walking', speaking: false, hold: true },

      // Act III (32.60 - 33.90s): Trots back into golden-afternoon backyard nudging his ball
      { time: ACT_2_3_CUT, x: 1360, y: 595, flipX: true, state: 'walking', speaking: false },
      { time: 33.9, x: 575, y: 595, flipX: false, state: 'sitting', speaking: false, hold: true },

      // Act III (34.10 - 40.39s): Voice 4 (6.29s) — Biscuit's warm golden-afternoon goodbye (`speaking: true`)
      { time: 34.1, x: 575, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 37.1, x: 575, y: 587, flipX: false, state: 'singing', speaking: true, hold: true },
      { time: 37.5, x: 575, y: 595, flipX: false, state: 'singing', speaking: true, hold: true },
      // Clean mouth stop immediately after Voice 4 finishes (40.39s), before closing iris (41.00s)
      { time: 40.42, x: 575, y: 595, flipX: false, state: 'sitting', speaking: false, hold: true },

      // Happy farewell bark (40.65s) + cheerful goodbye wave through the closing theatrical iris (41.00 -> 44.00s)
      { time: 40.65, x: 575, y: 595, flipX: false, state: 'waving', speaking: false, hold: true },
      { time: 44.0, x: 575, y: 595, flipX: false, state: 'waving', speaking: false, hold: true },
    ],
  },

  // ─── TENNIS BALL (In-Scene Object Permanence Across Bounce, Catch & Homecoming) ───
  {
    nodeId: 'tennis-ball',
    keyframes: [
      // Hidden until bounce-in at 17.95s
      { time: 0.0, visible: false, x: -40, y: 350, rotate: 0, hold: true },
      // Act I (17.95 - 19.45s): Bounces across the sunny backyard from left to off-right
      { time: 17.95, visible: true, x: -40, y: 350, rotate: 0 },
      { time: 18.35, visible: true, x: 440, y: 595, rotate: 140 },
      { time: 18.7, visible: true, x: 640, y: 430, rotate: 240 },
      { time: 19.05, visible: true, x: 820, y: 595, rotate: 340 },
      { time: 19.45, visible: true, x: 1360, y: 490, rotate: 460, hold: true },

      // Act II (20.50 - 23.80s): Joyful bouncy arc across the sunlit park meadow
      { time: ACT_1_2_CUT, visible: false, x: -30, y: 310, rotate: 0, hold: true },
      { time: 20.5, visible: true, x: -30, y: 310, rotate: 0 },
      { time: 21.15, visible: true, x: 250, y: 245, rotate: 120 },
      { time: 21.85, visible: true, x: 460, y: 595, rotate: 240 },
      { time: 22.45, visible: true, x: 640, y: 415, rotate: 340 },
      { time: 23.0, visible: true, x: 790, y: 595, rotate: 440 },
      { time: 23.4, visible: true, x: 870, y: 525, rotate: 500 },
      // Lands cleanly at (935, 595) and stays permanently visible while Biscuit celebrates!
      { time: 23.8, visible: true, x: 935, y: 595, rotate: 540, hold: true },
      // Biscuit turns left and nudges his ball home right beside his snout
      { time: 29.6, visible: true, x: 925, y: 595, rotate: 540 },
      { time: 29.85, visible: true, x: 805, y: 595, rotate: 480 },
      { time: 32.1, visible: true, x: -195, y: 595, rotate: 120, hold: true },

      // Act III (32.60 - 44.00s): Nudged back into backyard & rests permanently at (505, 595)
      { time: ACT_2_3_CUT, visible: true, x: 1295, y: 595, rotate: 360 },
      { time: 33.9, visible: true, x: 505, y: 595, rotate: 60, hold: true },
      { time: 44.0, visible: true, x: 505, y: 595, rotate: 60, hold: true },
    ],
  },

  // ─── JOYFUL SPARKLE MUSIC NOTES (Act II Catch Celebration & Act III Farewell Wave) ───
  {
    nodeId: 'happy-notes',
    keyframes: [
      { time: 0.0, visible: false, x: 865, y: 460, count: 3, hold: true },
      { time: 24.35, visible: true, x: 865, y: 460, count: 3, hold: true },
      { time: 29.45, visible: false, x: 865, y: 460, count: 3, hold: true },
      { time: 40.65, visible: true, x: 575, y: 468, count: 2, hold: true },
      { time: 44.0, visible: true, x: 575, y: 468, count: 2, hold: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pre-Rendered BGM, Park Bark SFX & Gemini TTS Voiceover Clips (Zero Bleed)
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_AUDIO_CLIPS: AudioClipCue[] = [
  {
    id: 'classic-starter-dog-bgm',
    src: '/audio/classic-starter-dog-bgm.wav',
    startTime: 0,
    duration: 44.0,
    volume: 0.25,
    label: "Biscuit's Sunny Day — Classic Cel 44s Dynamic Score",
  },
  {
    id: 'bandana-dog-playful-bark',
    src: '/audio/bandana-dog-playful-bark.wav',
    startTime: 20.6,
    duration: 1.4,
    volume: 0.85,
    label: 'Playful Bark & Ball Bounce (Park Entry)',
  },
  {
    id: 'classic-starter-dog-voice-01',
    src: '/audio/classic-starter-dog-voice-01.wav',
    startTime: 3.15,
    duration: 9.6,
    volume: 0.96,
    label: 'Act I Narrator — Meet Biscuit in his sunny backyard',
  },
  {
    id: 'classic-starter-dog-voice-02',
    src: '/audio/classic-starter-dog-voice-02.wav',
    startTime: 13.35,
    duration: 4.45,
    volume: 0.98,
    label: 'Act I Biscuit — Greeting & invitation to play fetch',
  },
  {
    id: 'classic-starter-dog-voice-03',
    src: '/audio/classic-starter-dog-voice-03.wav',
    startTime: 24.6,
    duration: 4.73,
    volume: 0.98,
    label: 'Act II Biscuit — Joyful catch celebration in the park',
  },
  {
    id: 'classic-starter-dog-voice-04',
    src: '/audio/classic-starter-dog-voice-04.wav',
    startTime: 34.1,
    duration: 6.29,
    volume: 0.98,
    label: 'Act III Biscuit — Warm golden-afternoon goodbye',
  },
];

// ---------------------------------------------------------------------------
// Procedural Audio Cues — Clean Classic Cel Foley (ZERO crayon_scribble!)
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_AUDIO_CUES: AudioNoteCue[] = [
  // Gentle theatrical opening shimmer as iris opens
  { time: 2.8, freq: 880.0, duration: 0.55, kind: 'chime' },

  // Act I playful barks (pre-greeting hop & spotting the bouncing ball)
  { time: 13.05, freq: 355.0, duration: 0.42, kind: 'playful_bark' },
  { time: 18.25, freq: 375.0, duration: 0.42, kind: 'playful_bark' },

  // Act II triumphant catch bark & cheerful park giggle
  { time: 24.25, freq: 385.0, duration: 0.42, kind: 'playful_bark' },
  { time: 24.45, freq: 659.25, duration: 0.3, kind: 'giggle' },

  // Act III happy farewell bark & cozy resolving lullaby notes during closing iris
  { time: 40.65, freq: 360.0, duration: 0.42, kind: 'playful_bark' },
  { time: 41.2, freq: 523.25, duration: 0.65, kind: 'lullaby' },
  { time: 42.0, freq: 440.0, duration: 0.65, kind: 'lullaby' },
  { time: 42.8, freq: 392.0, duration: 0.85, kind: 'lullaby' },
];

// ---------------------------------------------------------------------------
// Scene Definition Export
// ---------------------------------------------------------------------------
export const CLASSIC_STARTER_BANDANA_DOG_SCENE: SceneDefinition = {
  id: 'classic-starter-bandana-dog',
  title: "Biscuit's Sunny Day",
  subtitle: 'A Hand-Drawn Backyard Adventure',
  durationSec: 44.0,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.classicCel.timing.fps,
  artStyle: 'classic_cel',
  bookFrame: false,
  theatricalFrame: {
    enabled: true,
    mode: 'iris',
    title: "Biscuit's Sunny Day",
    subtitle: 'A Hand-Drawn Backyard Adventure',
    creditText: 'Classic Hand-Drawn Cel Animation',
    endingTitle: 'The End',
    endingCredit: "Biscuit's Sunny Day · Good Boy, Biscuit!",
    openDurationSec: 3.0,
    closeDurationSec: 3.0,
    irisFocus: { x: 575, y: 550 },
    showTitleCard: true,
  },
  acts: CLASSIC_STARTER_BANDANA_DOG_ACTS,
  nodes: CLASSIC_STARTER_BANDANA_DOG_NODES,
  timeline: CLASSIC_STARTER_BANDANA_DOG_TIMELINE,
  camera: CLASSIC_STARTER_BANDANA_DOG_CAMERA,
  audioCues: CLASSIC_STARTER_BANDANA_DOG_AUDIO_CUES,
  audioClips: CLASSIC_STARTER_BANDANA_DOG_AUDIO_CLIPS,
};

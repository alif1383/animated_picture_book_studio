import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

// ---------------------------------------------------------------------------
// Acts — 4 acts, 30 seconds total
// ---------------------------------------------------------------------------
const MOONLIT_GARDEN_ACTS: StoryAct[] = [
  {
    id: 'moonlit-garden-act1',
    title: 'Act I · The Moonlit Garden',
    startTime: 0,
    endTime: 8,
    caption: 'Under the glow of the moon, the garden came alive.',
  },
  {
    id: 'moonlit-garden-act2',
    title: 'Act II · The Curious Cat',
    startTime: 8,
    endTime: 17,
    caption: 'A little cat appeared, eyes wide with wonder.',
  },
  {
    id: 'moonlit-garden-act3',
    title: 'Act III · Dancing in Moonlight',
    startTime: 17,
    endTime: 25,
    caption: 'They danced among the flowers in the silver light.',
  },
  {
    id: 'moonlit-garden-act4',
    title: 'Act IV · Goodnight Garden',
    startTime: 25,
    endTime: 30,
    caption: 'And as the moon smiled softly, they drifted off to dreams.',
  },
];

// ---------------------------------------------------------------------------
// Scene Nodes
// ---------------------------------------------------------------------------
const MOONLIT_GARDEN_NODES: SceneNode[] = [
  // 1. Night sky background patch — indigo marker wash, full 1280×720
  {
    id: 'night-sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'markerIndigoNight',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 0, y: 0, width: 1280, height: 450 },
    d: 'M 0 0 L 1280 0 L 1280 450 L 0 450 Z',
  },

  // 2. Garden/ground patch — crayon grass green, bottom 0–720 area
  {
    id: 'garden-ground-patch',
    type: 'background_patch',
    zIndex: 3,
    x: 0,
    y: 390,
    material: 'crayonGrassGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 0, y: 390, width: 1280, height: 330 },
    d: 'M 0 390 Q 320 370, 640 390 Q 960 410, 1280 390 L 1280 720 L 0 720 Z',
  },

  // 3. Moon character — upper right, starts without nightcap
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'idle',
    zIndex: 6,
    x: 1050,
    y: 90,
    scale: 1.2,
    wearingNightcap: false,
  },

  // 4. Star cluster prop — upper area
  {
    id: 'star-cluster',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 7,
    x: 400,
    y: 80,
    count: 12,
    opacity: 0,
  },

  // 5. Left tree
  {
    id: 'tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 110,
    y: 340,
    scale: 1.1,
    variant: 1,
  },

  // 6. Right tree
  {
    id: 'tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 1150,
    y: 320,
    scale: 1.0,
    variant: 2,
  },

  // 7. Meadow flowers — bottom, zIndex 8
  {
    id: 'meadow-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 8,
    x: 640,
    y: 640,
    scale: 1.1,
  },

  // 8. Street lantern — right mid area, lit, zIndex 9
  {
    id: 'street-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 9,
    x: 980,
    y: 420,
    lit: true,
  },

  // 9. Little girl — center-left, holding sheep
  {
    id: 'little-girl',
    type: 'character',
    kind: 'little_girl',
    state: 'idle',
    zIndex: 20,
    x: 380,
    y: 500,
    scale: 1.0,
    holdingSheep: true,
  },

  // 10. Cat — starts off-screen right
  {
    id: 'cat',
    type: 'character',
    kind: 'cat',
    state: 'idle',
    zIndex: 20,
    x: 1400,
    y: 510,
    scale: 0.95,
    visible: true,
  },

  // 11. Music notes prop — floating, hidden until act 3
  {
    id: 'music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 32,
    x: 500,
    y: 400,
    count: 5,
    visible: false,
  },

  // 12. Title annotation — "Moonlit Garden ✦" visible in act 1
  {
    id: 'title-annotation',
    type: 'annotation',
    zIndex: 38,
    x: 180,
    y: 60,
    text: 'Moonlit Garden ✦',
    color: TOKENS.colors.starWhite,
    fontSize: 28,
    visible: true,
  },
];

// ---------------------------------------------------------------------------
// Timeline — keyframed animation tracks
// ---------------------------------------------------------------------------
const MOONLIT_GARDEN_TIMELINE: TimelineTrack[] = [
  // Stars fade in over first 3 seconds
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0, opacity: 0 },
      { time: 3, opacity: 1 },
    ],
  },

  // Moon: wearingNightcap becomes true at t=25
  {
    nodeId: 'moon',
    keyframes: [
      { time: 0, wearingNightcap: false, state: 'idle' },
      { time: 25, wearingNightcap: true, state: 'sleepy', hold: true },
    ],
  },

  // Little girl: idle → walking → waving → singing → sitting
  {
    nodeId: 'little-girl',
    keyframes: [
      { time: 0, state: 'idle', x: 380, y: 500 },
      { time: 2, state: 'walking', x: 380, y: 500 },
      { time: 5, state: 'walking', x: 480, y: 500 },
      { time: 7, state: 'idle', x: 480, y: 500, hold: true },
      // Act 2: meet the cat
      { time: 10, state: 'waving', x: 480, y: 500 },
      { time: 14, state: 'waving', x: 480, y: 500, hold: true },
      // Act 3: dancing / singing
      { time: 17, state: 'singing', x: 480, y: 500 },
      { time: 21, state: 'waving', x: 480, y: 500 },
      { time: 24, state: 'singing', x: 480, y: 500, hold: true },
      // Act 4: settle down
      { time: 25, state: 'sitting', x: 480, y: 520 },
      { time: 30, state: 'sitting', x: 480, y: 520, hold: true },
    ],
  },

  // Cat: idle off-screen → walks in from right in act 2 → curious → circles → sleeping
  {
    nodeId: 'cat',
    keyframes: [
      { time: 0, state: 'idle', x: 1400, y: 510 },
      { time: 7.5, state: 'walking', x: 1400, y: 510 },
      // Walk in
      { time: 11, state: 'walking', x: 680, y: 510 },
      { time: 13, state: 'curious', x: 630, y: 510 },
      // Act 3: cat walks in circles (animate back and forth)
      { time: 17, state: 'walking', x: 630, y: 510 },
      { time: 19, state: 'walking', x: 580, y: 510 },
      { time: 21, state: 'walking', x: 650, y: 510 },
      { time: 23, state: 'walking', x: 590, y: 510 },
      { time: 24.5, state: 'idle', x: 600, y: 510, hold: true },
      // Act 4: sleeping
      { time: 25, state: 'sleeping', x: 600, y: 520 },
      { time: 30, state: 'sleeping', x: 600, y: 520, hold: true },
    ],
  },

  // Music notes: hidden until act 3 (t=17), then visible
  {
    nodeId: 'music-notes',
    keyframes: [
      { time: 0, visible: false },
      { time: 17, visible: true },
      { time: 25, visible: false },
    ],
  },

  // Title annotation: visible in act 1 only
  {
    nodeId: 'title-annotation',
    keyframes: [
      { time: 0, visible: true, opacity: 1 },
      { time: 7, opacity: 1 },
      { time: 8.5, visible: false, opacity: 0 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Camera — slight pan/zoom in act 2, back to 1.0 at t=20
// ---------------------------------------------------------------------------
const MOONLIT_GARDEN_CAMERA: CameraKeyframe[] = [
  { time: 0, x: 0, y: 0, zoom: 1.0 },
  { time: 8, x: 0, y: 0, zoom: 1.0 },
  { time: 10, x: 60, y: 30, zoom: 1.15 },
  { time: 16, x: 60, y: 30, zoom: 1.15, hold: true },
  { time: 17, x: 0, y: 0, zoom: 1.0 },
  { time: 30, x: 0, y: 0, zoom: 1.0 },
];

// ---------------------------------------------------------------------------
// Audio cues — lullaby melody + chimes, all procedural, boosted signal
// ---------------------------------------------------------------------------
// Lullaby melody: E4 → G4 → A4 → G4 → E4 → D4 → C4
// E4=329.63, G4=392.00, A4=440.00, D4=293.66, C4=261.63
// Three full passes across 30 seconds (~every 3–4 seconds).

const MOONLIT_GARDEN_AUDIO: AudioNoteCue[] = [
  // --- Opening chime at scene transition ---
  { time: 0.3,  freq: 523.25, duration: 0.6, kind: 'chime' },   // C5 chime

  // --- Lullaby pass 1 (t=1–5) ---
  { time: 1.0,  freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 1.6,  freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 2.2,  freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 2.8,  freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 3.4,  freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 4.0,  freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 4.6,  freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Lullaby pass 2 (t=5.5–9) ---
  { time: 5.5,  freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 6.1,  freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 6.7,  freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 7.3,  freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 7.9,  freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 8.5,  freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 9.1,  freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Act 2 chime (cat entry) ---
  { time: 8.0,  freq: 659.25, duration: 0.5,  kind: 'chime' },  // E5 chime

  // --- Lullaby pass 3 (t=10–14) ---
  { time: 10.0, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 10.6, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 11.2, freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 11.8, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 12.4, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 13.0, freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 13.6, freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Lullaby pass 4 (t=14.5–18) ---
  { time: 14.5, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 15.1, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 15.7, freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 16.3, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 16.9, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 17.5, freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 18.1, freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Act 3 chime (moonlit dance) ---
  { time: 17.0, freq: 587.33, duration: 0.6,  kind: 'chime' },  // D5 chime

  // --- Lullaby pass 5 (t=19–23) ---
  { time: 19.0, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 19.6, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 20.2, freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 20.8, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 21.4, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 22.0, freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 22.6, freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Lullaby pass 6 (t=23.5–27) ---
  { time: 23.5, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 24.1, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 24.7, freq: 440.00, duration: 0.55, kind: 'lullaby' }, // A4
  { time: 25.3, freq: 392.00, duration: 0.55, kind: 'lullaby' }, // G4
  { time: 25.9, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 26.5, freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 27.1, freq: 261.63, duration: 0.7,  kind: 'lullaby' }, // C4

  // --- Act 4 chime (goodnight) ---
  { time: 25.0, freq: 523.25, duration: 0.8,  kind: 'chime' },  // C5 chime
  { time: 25.8, freq: 392.00, duration: 0.6,  kind: 'chime' },  // G4 chime (gentle outro)

  // --- Final lullaby wind-down (t=27.5–30) ---
  { time: 27.5, freq: 329.63, duration: 0.55, kind: 'lullaby' }, // E4
  { time: 28.1, freq: 293.66, duration: 0.55, kind: 'lullaby' }, // D4
  { time: 28.7, freq: 261.63, duration: 0.9,  kind: 'lullaby' }, // C4 — final long note
];

// ---------------------------------------------------------------------------
// Scene Definition
// ---------------------------------------------------------------------------
export const MOONLIT_GARDEN_SCENE: SceneDefinition = {
  id: 'moonlit-garden',
  title: 'Moonlit Garden',
  subtitle: 'A little girl and a cat explore the moonlit garden at night',
  durationSec: 30,
  width: TOKENS.canvas.width,   // 1280
  height: TOKENS.canvas.height, // 720
  fps: TOKENS.timing.fps,       // 6
  vibrantMode: true,
  acts: MOONLIT_GARDEN_ACTS,
  nodes: MOONLIT_GARDEN_NODES,
  timeline: MOONLIT_GARDEN_TIMELINE,
  camera: MOONLIT_GARDEN_CAMERA,
  audioCues: MOONLIT_GARDEN_AUDIO,
};

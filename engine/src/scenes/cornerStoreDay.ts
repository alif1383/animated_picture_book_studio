import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

/**
 * "A Day at the Little Corner Store" — 25-second scene
 *
 * The scene opens on blank watercolor paper and the Corner Store ("LUNE STORE")
 * progressively fills in stroke-by-stroke in wax-crayon stop-motion style.
 * Various characters arrive — the shopkeeper waves, the little girl comes
 * to buy apples, a cat naps, fruit friends visit — and day turns to dusk.
 */

export const CORNER_STORE_ACTS: StoryAct[] = [
  {
    id: 'act-1-drawing-the-store',
    title: 'Act I · Drawing the Store',
    startTime: 0,
    endTime: 7,
    caption:
      'On warm watercolor paper, wax crayons color in the Little Corner Store stroke-by-stroke, with its teal walls, stripy awning, and a crate of fresh apples.',
  },
  {
    id: 'act-2-shopkeeper-opens',
    title: 'Act II · The Shopkeeper Opens Up',
    startTime: 7,
    endTime: 13,
    caption:
      'The friendly Shopkeeper steps out, waves good morning, and lights the street lantern. A village cat stretches curiously in the doorway.',
  },
  {
    id: 'act-3-customers-arrive',
    title: 'Act III · Customers Arrive!',
    startTime: 13,
    endTime: 19,
    caption:
      'The little girl walks up with her fluffy sheep to buy apples. Cherry Twins and Olive Sprout pop in to say hello!',
  },
  {
    id: 'act-4-evening-glow',
    title: 'Act IV · Evening Glow & Goodnight',
    startTime: 19,
    endTime: 25,
    caption:
      'As indigo dusk fills the sky, the store windows glow warm yellow, the Moon peeks in with a sleepy smile, and the village settles in for the night.',
  },
];

export const CORNER_STORE_CAMERA: CameraKeyframe[] = [
  // Act 1 (0–7s): Wide shot — watch the store get drawn on paper
  { time: 0, x: 0, y: 0, zoom: 1.0 },
  { time: 6.5, x: 0, y: 0, zoom: 1.0 },

  // Act 2 (7–13s): Zoom in slightly on the store front & shopkeeper
  { time: 8.0, x: -80, y: 60, zoom: 1.25 },
  { time: 12.5, x: -80, y: 60, zoom: 1.25 },

  // Act 3 (13–19s): Pull back to see the full street with arriving characters
  { time: 14.0, x: 0, y: 0, zoom: 1.0 },
  { time: 18.5, x: 0, y: 0, zoom: 1.0 },

  // Act 4 (19–25s): Pan up slightly to catch the Moon rising above the store
  { time: 20.0, x: 40, y: -40, zoom: 1.08 },
  { time: 25.0, x: 40, y: -40, zoom: 1.08 },
];

export const CORNER_STORE_NODES: SceneNode[] = [
  // ─── 1. BACKGROUND: Indigo Night Sky Patch (fills in during Act IV) ───
  {
    id: 'sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    d: 'M 18 16 Q 640 12, 1262 18 L 1262 520 Q 990 532, 720 515 Q 400 525, 18 510 Z',
    bounds: { x: 16, y: 12, width: 1248, height: 525 },
    material: 'markerIndigoNight',
    fillStyle: 'top-down-bands',
    fillSteps: 12,
    fillProgress: 0,
    wrapRightNegativeSpace: false,
    visible: false,
  },

  // ─── 2. GROUND: Green Crayon Grass Patches ───
  {
    id: 'grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 260,
    y: 638,
    scale: 1.5,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },
  {
    id: 'grass-center',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 640,
    y: 640,
    scale: 1.7,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },
  {
    id: 'grass-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 6,
    x: 1020,
    y: 638,
    scale: 1.8,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },

  // ─── 3. SCENERY: Trees ───
  {
    id: 'tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 56,
    y: 640,
    scale: 1.1,
    variant: 1,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 0,
  },
  {
    id: 'tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 1220,
    y: 640,
    scale: 1.0,
    variant: 3,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 0,
  },

  // ─── 4. FLUFFY CLOUDS (Daytime) ───
  {
    id: 'cloud-1',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 3,
    x: 200,
    y: 120,
    scale: 0.9,
  },
  {
    id: 'cloud-2',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 3,
    x: 750,
    y: 85,
    scale: 1.1,
  },
  {
    id: 'cloud-3',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 3,
    x: 1100,
    y: 140,
    scale: 0.7,
  },

  // ─── 5. THE CORNER STORE (Hero Building) ───
  {
    id: 'corner-store',
    type: 'building',
    kind: 'corner_store',
    zIndex: 20,
    x: 640,
    y: 640,
    windowLit: false,
    signText: 'LUNE STORE',
    fillStyle: 'diagonal-strokes',
    fillSteps: 12,
    fillProgress: 0,
    bounds: { x: -155, y: -215, width: 330, height: 225 },
  },

  // ─── 6. STREET PROPS ───
  {
    id: 'apple-crate',
    type: 'prop',
    kind: 'apple_crate',
    zIndex: 22,
    x: 478,
    y: 642,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 0,
  },
  {
    id: 'street-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 23,
    x: 400,
    y: 640,
    lit: false,
  },
  {
    id: 'bicycle',
    type: 'prop',
    kind: 'bicycle',
    zIndex: 24,
    x: 870,
    y: 642,
  },
  {
    id: 'meadow-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 7,
    x: 1100,
    y: 648,
    scale: 0.9,
  },

  // ─── 7. CHARACTERS ───

  // Shopkeeper — starts offscreen, enters in Act 2
  {
    id: 'shopkeeper',
    type: 'character',
    kind: 'shopkeeper',
    state: 'idle',
    zIndex: 28,
    x: 760,
    y: 642,
    opacity: 0,
    visible: false,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // Village Cat — sleeping then curious
  {
    id: 'village-cat',
    type: 'character',
    kind: 'cat',
    state: 'sleeping',
    zIndex: 29,
    x: 530,
    y: 646,
    opacity: 0,
    visible: false,
  },

  // Little Girl with Sheep — arrives in Act 3
  {
    id: 'little-girl',
    type: 'character',
    kind: 'little_girl',
    state: 'walking',
    holdingSheep: true,
    zIndex: 35,
    x: -60,
    y: 642,
    opacity: 0,
    visible: false,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // Cherry Twins — pop in Act 3
  {
    id: 'cherry-twins',
    type: 'character',
    kind: 'cherry_twins',
    state: 'idle',
    zIndex: 30,
    x: 950,
    y: 644,
    scale: 0.9,
    opacity: 0,
    visible: false,
  },

  // Olive Sprout — arrives in Act 3
  {
    id: 'olive-sprout',
    type: 'character',
    kind: 'olive_sprout',
    state: 'idle',
    zIndex: 31,
    x: 1050,
    y: 644,
    scale: 0.85,
    opacity: 0,
    visible: false,
  },

  // Expressive Moon — rises in Act 4
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'awake',
    wearingNightcap: false,
    zIndex: 8,
    x: 1020,
    y: 350,
    opacity: 0,
    visible: false,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // ─── 8. SKY PROPS ───
  {
    id: 'star-cluster',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 4,
    x: 36,
    y: 30,
    variant: 2,
    count: 0,
    visible: false,
  },

  // ─── 9. ANNOTATIONS ───
  {
    id: 'open-sign',
    type: 'annotation',
    zIndex: 40,
    x: 640,
    y: 380,
    text: '✿ OPEN ✿',
    fontSize: TOKENS.typography.sizeCaption,
    color: TOKENS.colors.storeTeal,
    opacity: 0,
    visible: false,
  },
  {
    id: 'goodnight-caption',
    type: 'annotation',
    zIndex: 45,
    x: 100,
    y: 80,
    text: 'Goodnight, Little Store ★',
    fontSize: TOKENS.typography.sizeCaption,
    color: TOKENS.colors.starWhite,
    opacity: 0,
    visible: false,
  },

  // Music Notes for the evening lullaby
  {
    id: 'music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 38,
    x: 640,
    y: 350,
    count: 0,
    visible: false,
  },
];

export const CORNER_STORE_TIMELINE: TimelineTrack[] = [
  // ═══════════════════════════════════════════════════════════════
  // ACT 1 (0–7s): "Drawing the Store" — everything fills in from blank paper
  // ═══════════════════════════════════════════════════════════════

  // Corner Store: fills in stroke-by-stroke
  {
    nodeId: 'corner-store',
    keyframes: [
      { time: 0.0, fillProgress: 0.0, windowLit: false },
      { time: 1.2, fillProgress: 0.15 },
      { time: 2.5, fillProgress: 0.35 },
      { time: 3.8, fillProgress: 0.55 },
      { time: 5.0, fillProgress: 0.78 },
      { time: 6.5, fillProgress: 1.0, windowLit: false },
      // Act 4: windows glow warm for the evening
      { time: 20.0, windowLit: true, hold: true },
    ],
  },

  // Grass patches fill in with the store
  {
    nodeId: 'grass-left',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 2.0, fillProgress: 0.4 },
      { time: 4.5, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'grass-center',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 2.5, fillProgress: 0.35 },
      { time: 5.0, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'grass-right',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 3.0, fillProgress: 0.3 },
      { time: 5.5, fillProgress: 1.0 },
    ],
  },

  // Trees fill in
  {
    nodeId: 'tree-left',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 3.5, fillProgress: 0.5 },
      { time: 6.0, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'tree-right',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 4.0, fillProgress: 0.45 },
      { time: 6.5, fillProgress: 1.0 },
    ],
  },

  // Apple crate fills in
  {
    nodeId: 'apple-crate',
    keyframes: [
      { time: 0.0, fillProgress: 0.0 },
      { time: 3.0, fillProgress: 0.4 },
      { time: 5.5, fillProgress: 1.0 },
    ],
  },

  // Clouds drift slowly right through the whole scene
  {
    nodeId: 'cloud-1',
    keyframes: [
      { time: 0.0, x: 200, opacity: 1.0 },
      { time: 19.0, x: 300, opacity: 1.0 },
      { time: 22.0, x: 340, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'cloud-2',
    keyframes: [
      { time: 0.0, x: 750, opacity: 1.0 },
      { time: 19.0, x: 830, opacity: 1.0 },
      { time: 22.5, x: 860, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'cloud-3',
    keyframes: [
      { time: 0.0, x: 1100, opacity: 1.0 },
      { time: 19.0, x: 1160, opacity: 1.0 },
      { time: 21.5, x: 1180, opacity: 0.0, hold: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 2 (7–13s): "The Shopkeeper Opens Up"
  // ═══════════════════════════════════════════════════════════════

  // Shopkeeper enters from the store door and waves!
  {
    nodeId: 'shopkeeper',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 7.0, visible: true, opacity: 0.0, state: 'idle' },
      { time: 7.8, visible: true, opacity: 1.0, state: 'waving' },
      { time: 12.0, state: 'waving', hold: true },
      // Act 3+: goes back to idle / looking up
      { time: 13.0, state: 'looking_up', hold: true },
      { time: 19.5, state: 'waving', hold: true },
      { time: 23.0, state: 'idle', hold: true },
    ],
  },

  // Cat appears and stretches
  {
    nodeId: 'village-cat',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 8.5, visible: true, opacity: 0.0, state: 'sleeping' },
      { time: 9.2, visible: true, opacity: 1.0, state: 'sleeping' },
      { time: 13.0, state: 'curious', hold: true },
      { time: 20.0, state: 'sleeping', hold: true },
    ],
  },

  // Street lantern lights up
  {
    nodeId: 'street-lantern',
    keyframes: [
      { time: 0.0, lit: false, hold: true },
      { time: 9.5, lit: true, hold: true },
    ],
  },

  // "OPEN" sign fades in
  {
    nodeId: 'open-sign',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 8.0, visible: true, opacity: 0.0 },
      { time: 9.0, visible: true, opacity: 0.85 },
      { time: 12.5, visible: true, opacity: 0.85 },
      { time: 13.5, visible: false, opacity: 0.0, hold: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 3 (13–19s): "Customers Arrive!"
  // ═══════════════════════════════════════════════════════════════

  // Little Girl walks in from the left
  {
    nodeId: 'little-girl',
    keyframes: [
      { time: 0.0, x: -60, visible: false, opacity: 0.0, hold: true },
      { time: 13.0, x: -60, visible: true, opacity: 1.0, state: 'walking', holdingSheep: true },
      { time: 15.5, x: 340, state: 'walking', holdingSheep: true },
      { time: 16.0, x: 340, state: 'looking_up', holdingSheep: true, hold: true },
      // She waves at the shopkeeper
      { time: 17.0, x: 380, state: 'waving', holdingSheep: true, hold: true },
      // In the evening she's still there, looking up at the moon
      { time: 19.5, x: 380, state: 'looking_up', holdingSheep: true, hold: true },
    ],
  },

  // Cherry Twins pop in from the right
  {
    nodeId: 'cherry-twins',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 14.5, visible: true, opacity: 0.0, state: 'idle' },
      { time: 15.2, visible: true, opacity: 1.0, state: 'waving' },
      { time: 19.0, state: 'waving', hold: true },
      { time: 22.0, state: 'idle', hold: true },
    ],
  },

  // Olive Sprout appears near the flowers
  {
    nodeId: 'olive-sprout',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 15.5, visible: true, opacity: 0.0, state: 'idle' },
      { time: 16.2, visible: true, opacity: 1.0, state: 'waving' },
      { time: 19.0, state: 'waving', hold: true },
      { time: 21.0, state: 'idle', hold: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 4 (19–25s): "Evening Glow & Goodnight"
  // ═══════════════════════════════════════════════════════════════

  // Indigo night sky fills in stroke-by-stroke
  {
    nodeId: 'sky-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, hold: true },
      { time: 19.0, visible: true, fillProgress: 0.1 },
      { time: 21.0, visible: true, fillProgress: 0.5 },
      { time: 23.0, visible: true, fillProgress: 0.82 },
      { time: 24.5, visible: true, fillProgress: 1.0, hold: true },
    ],
  },

  // Stars twinkle in
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 20.0, visible: true, count: 5 },
      { time: 22.0, visible: true, count: 14 },
      { time: 24.0, visible: true, count: 24, hold: true },
    ],
  },

  // Moon rises into the sky
  {
    nodeId: 'moon',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, y: 350, hold: true },
      { time: 19.5, visible: true, opacity: 0.0, y: 330, state: 'awake', wearingNightcap: false },
      { time: 21.0, visible: true, opacity: 0.8, y: 260, state: 'curious', wearingNightcap: false },
      { time: 22.5, visible: true, opacity: 1.0, y: 215, state: 'awake', wearingNightcap: false },
      { time: 24.0, visible: true, opacity: 1.0, y: 205, state: 'sleepy', wearingNightcap: true, hold: true },
    ],
  },

  // Evening music notes float gently
  {
    nodeId: 'music-notes',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 21.5, visible: true, count: 1 },
      { time: 22.5, visible: true, count: 2 },
      { time: 23.5, visible: true, count: 3, hold: true },
    ],
  },

  // "Goodnight, Little Store ★" caption
  {
    nodeId: 'goodnight-caption',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 23.0, visible: true, opacity: 0.0 },
      { time: 24.0, visible: true, opacity: 0.92, hold: true },
    ],
  },
];

export const CORNER_STORE_AUDIO_CUES: AudioNoteCue[] = [
  // ─── Act 1 (0–7s): Crayon scribble sounds as the store draws itself ───
  { time: 0.5, freq: 920, duration: 0.32, kind: 'crayon_scribble' },
  { time: 1.5, freq: 1050, duration: 0.32, kind: 'crayon_scribble' },
  { time: 2.5, freq: 980, duration: 0.32, kind: 'crayon_scribble' },
  { time: 3.5, freq: 1120, duration: 0.28, kind: 'crayon_scribble' },
  { time: 4.5, freq: 960, duration: 0.32, kind: 'crayon_scribble' },
  { time: 5.5, freq: 1080, duration: 0.32, kind: 'crayon_scribble' },
  { time: 6.2, freq: 1000, duration: 0.25, kind: 'crayon_scribble' },

  // ─── Act 2 (7–13s): Cheerful morning chimes as shopkeeper opens ───
  { time: 7.2, freq: 523.25, duration: 0.4, kind: 'chime' },   // C5
  { time: 8.0, freq: 659.25, duration: 0.4, kind: 'chime' },   // E5
  { time: 8.8, freq: 783.99, duration: 0.45, kind: 'chime' },  // G5
  { time: 9.8, freq: 880.0, duration: 0.5, kind: 'chime' },    // A5 — lantern lights!
  { time: 10.8, freq: 783.99, duration: 0.4, kind: 'lullaby' }, // G5
  { time: 11.6, freq: 659.25, duration: 0.4, kind: 'lullaby' }, // E5
  { time: 12.4, freq: 523.25, duration: 0.55, kind: 'lullaby' }, // C5

  // ─── Act 3 (13–19s): Walking notes, and a bright giggle ───
  { time: 13.2, freq: 440.0, duration: 0.3, kind: 'lullaby' },  // A4
  { time: 13.8, freq: 493.88, duration: 0.3, kind: 'lullaby' }, // B4
  { time: 14.4, freq: 523.25, duration: 0.35, kind: 'lullaby' }, // C5
  { time: 15.0, freq: 587.33, duration: 0.35, kind: 'lullaby' }, // D5
  { time: 15.6, freq: 659.25, duration: 0.45, kind: 'chime' },  // E5
  { time: 16.4, freq: 659.25, duration: 0.35, kind: 'giggle' }, // Giggle when girl waves
  { time: 17.2, freq: 783.99, duration: 0.4, kind: 'chime' },   // G5
  { time: 18.0, freq: 880.0, duration: 0.5, kind: 'chime' },    // A5

  // ─── Act 4 (19–25s): Gentle evening lullaby as night fills in ───
  { time: 19.2, freq: 920, duration: 0.3, kind: 'crayon_scribble' }, // Sky fills in
  { time: 19.8, freq: 783.99, duration: 0.55, kind: 'lullaby' }, // G5
  { time: 20.6, freq: 698.46, duration: 0.55, kind: 'lullaby' }, // F5
  { time: 21.4, freq: 659.25, duration: 0.55, kind: 'lullaby' }, // E5
  { time: 22.2, freq: 587.33, duration: 0.55, kind: 'lullaby' }, // D5
  { time: 23.0, freq: 523.25, duration: 0.55, kind: 'chime' },  // C5
  { time: 23.8, freq: 440.0, duration: 0.6, kind: 'lullaby' },  // A4
  { time: 24.5, freq: 392.0, duration: 1.0, kind: 'lullaby' },  // G4 — final goodnight note
];

export const CORNER_STORE_DAY_SCENE: SceneDefinition = {
  id: 'corner-store-day',
  title: 'A Day at the Little Corner Store',
  subtitle:
    'Drawing the Store → Shopkeeper Opens → Customers Arrive → Evening Glow & Sleepy Moon',
  durationSec: 25,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  acts: CORNER_STORE_ACTS,
  nodes: CORNER_STORE_NODES,
  timeline: CORNER_STORE_TIMELINE,
  camera: CORNER_STORE_CAMERA,
  audioCues: CORNER_STORE_AUDIO_CUES,
};

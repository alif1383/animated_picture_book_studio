import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

export const SHORT_SAMPLE_1_ACTS: StoryAct[] = [
  {
    id: 'morning',
    title: 'Act I · Morning Sun & Playful Garden',
    startTime: 0,
    endTime: 6,
    caption:
      'In the morning on warm watercolor paper, the bright Crayon Sun shines out while the little girl plays on the green grass with her sheep.',
  },
  {
    id: 'sunset',
    title: 'Act II · Orange Sunset, Sleepy Sun & Walking Into the House',
    startTime: 6,
    endTime: 13,
    caption:
      'Warm orange sunset colors the sky and the Sun starts getting sleepy and yawning as the little girl walks into the cozy house.',
  },
  {
    id: 'nightfall',
    title: 'Act III · Night Fills In: Sun Goes to Sleep & Moon Comes In',
    startTime: 13,
    endTime: 20,
    caption:
      'As the indigo night starts filling in, the sleepy Sun closes its eyes and slowly moves out of the way for the Moon to come in while a lullaby plays.',
  },
  {
    id: 'lullaby',
    title: 'Act IV · Rooftop Lullaby & Stop-Motion Starry Sky',
    startTime: 20,
    endTime: 25,
    caption:
      'Sitting on the terracotta roof, she sings to the Moon as the night sky fills in like stop-motion coloring and pencil numbers count 1, 2, 3, 4, 5.',
  },
  {
    id: 'goodnight',
    title: 'Act V · Goodnight, Sleepy Moon',
    startTime: 25,
    endTime: 30,
    caption:
      'Tucked under its blue-and-white crayon nightcap, the Moon closes its eyes as the lullaby whispers goodnight ★',
  },
];

export const SHORT_SAMPLE_1_CAMERA: CameraKeyframe[] = [
  // Acts I–IV (0–25s): Classic wide picture-book framing showing the cottage, lawn, sky washes, and Sun-to-Moon handoff
  { time: 0.0, x: 0, y: 0, zoom: 1.0 },
  { time: 25.0, x: 0, y: 0, zoom: 1.0 },

  // Act V (25–30s): Gentle close-up on the sleeping Moon in its nightcap & stars (Photo 1 composition)
  { time: 26.8, x: 275, y: -155, zoom: 1.82 },
  { time: 30.0, x: 275, y: -155, zoom: 1.82 },
];

export const SHORT_SAMPLE_1_NODES: SceneNode[] = [
  // 1. Warm Orange Sunset Crayon Wash Patch (Act II stop-motion sunset fill)
  {
    id: 'sunset-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    d: 'M 18 16 Q 640 12, 1262 18 L 1262 490 Q 980 508, 680 492 Q 360 504, 18 486 Z',
    bounds: { x: 16, y: 12, width: 1248, height: 500 },
    material: 'crayonSunsetOrange',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 0,
    wrapRightNegativeSpace: false,
    visible: false,
  },

  // 2. Deep Indigo Night Marker-Wash Patch (Act III–V stop-motion night fill)
  {
    id: 'sky-patch',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    d: 'M 18 16 Q 640 12, 1262 18 L 1262 520 Q 990 532, 720 515 Q 400 525, 18 510 Z',
    bounds: { x: 16, y: 12, width: 1248, height: 525 },
    material: 'markerIndigoNight',
    fillStyle: 'top-down-bands',
    fillSteps: 12,
    fillProgress: 0,
    wrapRightNegativeSpace: true,
    visible: false,
  },

  // 3. Foreground Green Crayon Grass Patches (matching the reference photos)
  {
    id: 'grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 420,
    y: 642,
    scale: 1.55,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },
  {
    id: 'grass-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 6,
    x: 920,
    y: 642,
    scale: 1.95,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },

  // 4. Twinkling White Crayon Stars & Faint Pencil Numbers 1 2 3 4 5
  {
    id: 'star-cluster',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 8,
    x: 36,
    y: 30,
    variant: 2,
    count: 0,
    visible: false,
  },
  {
    id: 'pencil-numbers',
    type: 'prop',
    kind: 'pencil_numbers',
    zIndex: 9,
    x: 565,
    y: 175,
    count: 0,
    visible: false,
  },

  // 5. Left-Edge Leafy Green Crayon Tree (matching Reference Photo 3)
  {
    id: 'tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 12,
    x: 24,
    y: 642,
    scale: 1.15,
    variant: 1,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },

  // 6. Chimney Smoke Puffs above Ochre Cottage
  {
    id: 'chimney-puffs',
    type: 'prop',
    kind: 'chimney_puffs',
    zIndex: 15,
    x: 169,
    y: 374,
    count: 2,
  },

  // 7. Cozy Ochre Cottage (Lower-Left, matching Reference Photos 2, 3, 4)
  {
    id: 'ochre-cottage',
    type: 'building',
    kind: 'ochre_cottage',
    zIndex: 20,
    x: 260,
    y: 640,
    windowLit: false,
    showLadder: true,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // 8. Expressive Crayon Sun (Morning awake -> Sunset sleepy/orange -> Nightfall sleeping & moving aside)
  {
    id: 'sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 25,
    x: 920,
    y: 210,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // 9. Expressive Crayon Moon (Rises in Act III as the Sun moves out of the way)
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'awake',
    wearingNightcap: false,
    zIndex: 30,
    x: 1120,
    y: 335,
    opacity: 0,
    visible: false,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // 10. Little Girl with Fluffy Sheep Plushie
  {
    id: 'little-girl',
    type: 'character',
    kind: 'little_girl',
    state: 'walking',
    holdingSheep: true,
    zIndex: 35,
    x: 680,
    y: 642,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // 11. Floating Rooftop Music Notes (♪ ♫) & Motion Arc
  {
    id: 'music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 38,
    x: 228,
    y: 394,
    count: 0,
    visible: false,
  },
  {
    id: 'lullaby-motion-line',
    type: 'annotation',
    zIndex: 39,
    x: 242,
    y: 390,
    dashedPath: 'M 0 0 Q 220 -85, 520 -130',
    color: TOKENS.colors.charcoalOutline,
    opacity: 0,
    visible: false,
  },
];

export const SHORT_SAMPLE_1_TIMELINE: TimelineTrack[] = [
  // 1. Orange Sunset Wash (Act II: fills top-down; Act III: fades out as Indigo Night fills over it)
  {
    nodeId: 'sunset-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, opacity: 1.0, hold: true },
      { time: 6.0, visible: true, fillProgress: 0.2, opacity: 0.92 },
      { time: 11.5, visible: true, fillProgress: 0.85, opacity: 0.92 },
      { time: 13.0, visible: true, fillProgress: 0.85, opacity: 0.88 },
      { time: 18.8, visible: true, fillProgress: 0.85, opacity: 0.0 },
      { time: 19.2, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
    ],
  },

  // 2. Deep Indigo Night Sky (Act III: starts filling in; Act IV: 0.75 partial-bleed wrap; Act V: 1.0 full starry sky)
  {
    nodeId: 'sky-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, hold: true },
      { time: 13.0, visible: true, fillProgress: 0.15 },
      { time: 19.8, visible: true, fillProgress: 0.75 },
      { time: 20.0, visible: true, fillProgress: 0.75, hold: true },
      { time: 25.0, visible: true, fillProgress: 0.75 },
      { time: 27.2, visible: true, fillProgress: 1.0, hold: true },
    ],
  },

  // 3. Crayon Sun (Act I: bright awake; Act II: sleepy orange; Act III: goes to sleep & slowly drifts out of the way)
  {
    nodeId: 'sun',
    keyframes: [
      {
        time: 0.0,
        x: 920,
        y: 210,
        scale: 1.0,
        opacity: 1.0,
        visible: true,
        state: 'awake',
        hold: true,
      },
      {
        time: 6.0,
        x: 920,
        y: 215,
        scale: 1.0,
        opacity: 1.0,
        visible: true,
        state: 'sleepy',
      },
      {
        time: 12.8,
        x: 900,
        y: 235,
        scale: 0.98,
        opacity: 1.0,
        visible: true,
        state: 'sleepy',
      },
      // Act III (13–19.2s): Sun closes its eyes ('sleeping') and slowly moves down/left-right out of the way for the Moon
      {
        time: 13.0,
        x: 900,
        y: 235,
        scale: 0.96,
        opacity: 1.0,
        visible: true,
        state: 'sleeping',
      },
      {
        time: 18.8,
        x: 680,
        y: 445,
        scale: 0.82,
        opacity: 0.0,
        visible: true,
        state: 'sleeping',
      },
      {
        time: 19.2,
        x: 680,
        y: 445,
        scale: 0.82,
        opacity: 0.0,
        visible: false,
        state: 'sleeping',
        hold: true,
      },
    ],
  },

  // 4. Expressive Crayon Moon (Act III: glides in as the Sun moves out of the way; Act IV: grumpy/listening; Act V: nightcap & sleeping)
  {
    nodeId: 'moon',
    keyframes: [
      {
        time: 0.0,
        x: 1140,
        y: 330,
        opacity: 0.0,
        visible: false,
        state: 'awake',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: 13.2,
        x: 1125,
        y: 320,
        opacity: 0.25,
        visible: true,
        state: 'awake',
        wearingNightcap: false,
      },
      {
        time: 16.5,
        x: 1030,
        y: 265,
        opacity: 0.92,
        visible: true,
        state: 'curious',
        wearingNightcap: false,
      },
      {
        time: 19.5,
        x: 955,
        y: 230,
        opacity: 1.0,
        visible: true,
        state: 'awake',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: 20.0,
        x: 955,
        y: 230,
        opacity: 1.0,
        visible: true,
        state: 'grumpy',
        wearingNightcap: false,
        hold: true,
      },
      {
        time: 25.0,
        x: 955,
        y: 230,
        opacity: 1.0,
        visible: true,
        state: 'blinking',
        wearingNightcap: true,
        hold: true,
      },
      {
        time: 26.0,
        x: 955,
        y: 230,
        opacity: 1.0,
        visible: true,
        state: 'sleeping',
        wearingNightcap: true,
        hold: true,
      },
    ],
  },

  // 5. Ochre Cottage (Warm bedroom window lights up as soon as the little girl walks into the house!)
  {
    nodeId: 'ochre-cottage',
    keyframes: [
      { time: 0.0, windowLit: false, hold: true },
      { time: 11.2, windowLit: true, hold: true },
    ],
  },

  // 6. Little Girl with Fluffy Sheep Plushie
  {
    nodeId: 'little-girl',
    keyframes: [
      // Act I (0–6s): Plays & walks on the green grass in the morning sun
      {
        time: 0.0,
        x: 680,
        y: 642,
        opacity: 1.0,
        visible: true,
        flipX: true,
        state: 'walking',
        holdingSheep: true,
      },
      {
        time: 2.4,
        x: 560,
        y: 642,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'waving',
        holdingSheep: true,
        hold: true,
      },
      {
        time: 3.6,
        x: 560,
        y: 642,
        opacity: 1.0,
        visible: true,
        flipX: true,
        state: 'walking',
        holdingSheep: true,
      },
      {
        time: 5.8,
        x: 460,
        y: 642,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'looking_up',
        holdingSheep: true,
        hold: true,
      },

      // Act II (6–13s): Walks across grass to the cottage front door (x = 154, y = 640) and steps inside the house!
      {
        time: 6.0,
        x: 460,
        y: 642,
        opacity: 1.0,
        visible: true,
        flipX: true,
        state: 'walking',
        holdingSheep: true,
      },
      {
        time: 9.6,
        x: 154,
        y: 640,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'waving',
        holdingSheep: true,
        hold: true,
      },
      {
        time: 10.5,
        x: 154,
        y: 640,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'walking',
        holdingSheep: true,
      },
      {
        time: 11.4,
        x: 154,
        y: 636,
        opacity: 0.0,
        visible: false,
        flipX: false,
        state: 'walking',
        holdingSheep: true,
        hold: true,
      },

      // Act III (13–20s): Climbs up the cottage right-side ladder (x = 389, y = 625 -> 510)
      {
        time: 13.4,
        x: 389,
        y: 625,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'climbing',
        holdingSheep: true,
      },
      {
        time: 19.5,
        x: 389,
        y: 510,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'climbing',
        holdingSheep: true,
        hold: true,
      },

      // Act IV–V (20–30s): Sits on the terracotta roof singing to the Moon
      {
        time: 20.0,
        x: 212,
        y: 458,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'singing',
        holdingSheep: true,
        hold: true,
      },
      {
        time: 25.2,
        x: 212,
        y: 458,
        opacity: 1.0,
        visible: true,
        flipX: false,
        state: 'sitting',
        holdingSheep: true,
        hold: true,
      },
    ],
  },

  // 7. Rooftop Music Notes (♪ ♫) & Motion Line
  {
    nodeId: 'music-notes',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 20.2, visible: true, count: 1, hold: true },
      { time: 21.2, visible: true, count: 2, hold: true },
      { time: 22.2, visible: true, count: 3, hold: true },
      { time: 23.4, visible: true, count: 4, hold: true },
      { time: 25.2, visible: false, count: 0, hold: true },
    ],
  },
  {
    nodeId: 'lullaby-motion-line',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 20.4, visible: true, opacity: 0.45, hold: true },
      { time: 25.0, visible: false, opacity: 0.0, hold: true },
    ],
  },

  // 8. Stars & Hand-Drawn Pencil Numbers 1 2 3 4 5
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 15.5, visible: true, count: 8 },
      { time: 20.2, visible: true, count: 18 },
      { time: 25.0, visible: true, count: 28, hold: true },
    ],
  },
  {
    nodeId: 'pencil-numbers',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 20.4, visible: true, count: 1, hold: true },
      { time: 21.2, visible: true, count: 2, hold: true },
      { time: 22.0, visible: true, count: 3, hold: true },
      { time: 22.8, visible: true, count: 4, hold: true },
      { time: 23.6, visible: true, count: 5, hold: true },
    ],
  },
];

export const SHORT_SAMPLE_1_AUDIO_CUES: AudioNoteCue[] = [
  // Act I (0–6s): Cheerful morning tune as the Sun shines out
  { time: 0.4, freq: 523.25, duration: 0.35, kind: 'chime' },
  { time: 1.2, freq: 587.33, duration: 0.35, kind: 'lullaby' },
  { time: 2.0, freq: 659.25, duration: 0.4, kind: 'chime' },
  { time: 2.8, freq: 783.99, duration: 0.45, kind: 'chime' },
  { time: 3.6, freq: 880.0, duration: 0.4, kind: 'lullaby' },
  { time: 4.4, freq: 783.99, duration: 0.5, kind: 'chime' },
  { time: 5.2, freq: 659.25, duration: 0.5, kind: 'lullaby' },

  // Act II (6–13s): Warm sunset crayon wash + sleepy descending notes as kid walks into the house
  { time: 6.2, freq: 920, duration: 0.35, kind: 'crayon_scribble' },
  { time: 7.0, freq: 659.25, duration: 0.55, kind: 'lullaby' },
  { time: 8.0, freq: 587.33, duration: 0.55, kind: 'lullaby' },
  { time: 9.0, freq: 523.25, duration: 0.55, kind: 'lullaby' },
  { time: 10.0, freq: 493.88, duration: 0.55, kind: 'lullaby' },
  { time: 11.2, freq: 659.25, duration: 0.7, kind: 'chime' }, // Cottage window lights up!
  { time: 12.2, freq: 392.0, duration: 0.7, kind: 'lullaby' },

  // Acts III–V (13–30s): Continuous soothing music-box Lullaby playing in the background as night comes in!
  { time: 13.1, freq: 1020, duration: 0.32, kind: 'crayon_scribble' },
  // Phrase 1 (13.4s – 19.2s: Night fills in, Sun goes to sleep & Moon comes in)
  { time: 13.4, freq: 523.25, duration: 0.55, kind: 'lullaby' }, // C5
  { time: 14.2, freq: 523.25, duration: 0.55, kind: 'lullaby' }, // C5
  { time: 15.0, freq: 783.99, duration: 0.55, kind: 'lullaby' }, // G5
  { time: 15.8, freq: 783.99, duration: 0.55, kind: 'lullaby' }, // G5
  { time: 16.6, freq: 880.0, duration: 0.55, kind: 'chime' },    // A5
  { time: 17.4, freq: 880.0, duration: 0.55, kind: 'chime' },    // A5
  { time: 18.2, freq: 783.99, duration: 0.9, kind: 'lullaby' },  // G5
  // Phrase 2 (19.6s – 24.8s: Rooftop lullaby & counting stars 1 2 3 4 5)
  { time: 19.6, freq: 698.46, duration: 0.55, kind: 'lullaby' }, // F5
  { time: 20.4, freq: 698.46, duration: 0.55, kind: 'lullaby' }, // F5
  { time: 21.2, freq: 659.25, duration: 0.55, kind: 'chime' },   // E5
  { time: 22.0, freq: 659.25, duration: 0.55, kind: 'lullaby' }, // E5
  { time: 22.8, freq: 587.33, duration: 0.55, kind: 'lullaby' }, // D5
  { time: 23.6, freq: 587.33, duration: 0.55, kind: 'lullaby' }, // D5
  { time: 24.4, freq: 523.25, duration: 0.95, kind: 'lullaby' }, // C5
  // Phrase 3 (25.4s – 29.5s: Moon puts on its nightcap & sleeps peacefully)
  { time: 25.4, freq: 783.99, duration: 0.6, kind: 'chime' },    // G5
  { time: 26.2, freq: 698.46, duration: 0.6, kind: 'lullaby' },  // F5
  { time: 27.0, freq: 659.25, duration: 0.6, kind: 'chime' },    // E5
  { time: 27.8, freq: 587.33, duration: 0.65, kind: 'lullaby' }, // D5
  { time: 28.6, freq: 523.25, duration: 1.25, kind: 'lullaby' }, // C5
];

export const SHORT_SAMPLE_1_SCENE: SceneDefinition = {
  id: 'short_sample_1',
  title: 'When the Sun Goes to Sleep (short_sample=1)',
  subtitle:
    'Morning Sun → Sleepy Orange Sunset → Walking Into the House → Night Fills In & Moon Lullaby',
  durationSec: 30,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  acts: SHORT_SAMPLE_1_ACTS,
  nodes: SHORT_SAMPLE_1_NODES,
  timeline: SHORT_SAMPLE_1_TIMELINE,
  camera: SHORT_SAMPLE_1_CAMERA,
  audioCues: SHORT_SAMPLE_1_AUDIO_CUES,
};

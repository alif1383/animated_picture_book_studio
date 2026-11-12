import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

export const STORY_ACTS: StoryAct[] = [
  {
    id: 'act-1-crayon-village',
    title: 'Act I · Coloring the Paper Village & Corner Store',
    startTime: 0,
    endTime: 6,
    caption:
      'On warm watercolor paper, wax crayons color the Ochre Cottage, the Little Corner Store, and the wide-eyed Moon.',
  },
  {
    id: 'act-2-ladder-climb',
    title: 'Act II · Climbing Up the Cottage Ladder',
    startTime: 6,
    endTime: 12,
    caption:
      'With her fluffy sheep tucked on her back, the little girl climbs step-by-step past the glowing bedroom window.',
  },
  {
    id: 'act-3-rooftop-lullaby',
    title: 'Act III · Rooftop Lullaby & Stop-Motion Night Sky',
    startTime: 12,
    endTime: 19,
    caption:
      'She sings on the terracotta roof as indigo marker bands fill in like stop-motion coloring and pencil numbers count 1, 2, 3, 4, 5.',
  },
  {
    id: 'act-4-moon-nightcap',
    title: 'Act IV · A Nightcap for the Sleepy Moon',
    startTime: 19,
    endTime: 24,
    caption:
      'Tucked in a cozy blue-and-white crayon nightcap, the grumpy Moon softens and closes its eyes among twinkling stars.',
  },
  {
    id: 'act-5-goodnight-tableau',
    title: 'Act V · Goodnight, Little Moon',
    startTime: 24,
    endTime: 28,
    caption:
      'The quiet crayon village and corner store glow softly beneath the starry indigo sky. Goodnight, Little Moon ★',
  },
];

export const STORY_CAMERA: CameraKeyframe[] = [
  // Act 1 (0–6s): Full storybook village wide shot on raw paper (Ref Image 3 + Corner Store)
  { time: 0, x: 0, y: 0, zoom: 1.0 },
  { time: 5.5, x: 0, y: 0, zoom: 1.0 },

  // Act 2 (6–12s): Zoom in on Ochre Cottage bedroom window & right-side ladder (Ref Image 4)
  { time: 6.8, x: -325, y: 155, zoom: 1.62 },
  { time: 11.4, x: -325, y: 120, zoom: 1.62 },

  // Act 3 (12–19s): Pull back to wide rooftop & partial-bleed stop-motion sky view (Ref Image 2)
  { time: 12.4, x: 0, y: 0, zoom: 1.0 },
  { time: 18.6, x: 0, y: 0, zoom: 1.0 },

  // Act 4 (19–24s): Zoom in on the Moon in its nightcap & counting numbers 3 4 5 (Ref Image 1)
  { time: 19.8, x: 275, y: -155, zoom: 1.85 },
  { time: 23.6, x: 275, y: -155, zoom: 1.85 },

  // Act 5 (24–28s): Pull back to complete evening village tableau
  { time: 24.8, x: 0, y: 0, zoom: 1.0 },
  { time: 28.0, x: 0, y: 0, zoom: 1.0 },
];

export const STORY_NODES: SceneNode[] = [
  // 1. Background Partial-Bleed Indigo Night Sky Patch (Ref Images 1 & 2!)
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
    wrapRightNegativeSpace: true,
    visible: false,
  },

  // 2. Foreground Green Crayon Grass Patches (Ref Images 3 & 4)
  {
    id: 'grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 310,
    y: 638,
    scale: 1.65,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0.2,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },
  {
    id: 'grass-right',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 6,
    x: 860,
    y: 638,
    scale: 1.9,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0.2,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },

  // 3. Sky Stars & Hand-Drawn Pencil Numbers 1 2 3 4 5 (Ref Images 1 & 2)
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

  // 4. Leafy Green Crayon Trees (Ref Image 3)
  {
    id: 'tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 12,
    x: 56,
    y: 638,
    scale: 1.12,
    variant: 1,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 0.25,
  },
  {
    id: 'tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 13,
    x: 1180,
    y: 638,
    scale: 1.05,
    variant: 3,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 0.2,
  },

  // 5. Chimney Smoke Puffs above Ochre Cottage
  {
    id: 'chimney-puffs',
    type: 'prop',
    kind: 'chimney_puffs',
    zIndex: 15,
    x: 154,
    y: 372,
    count: 2,
  },

  // 6. Hero Architecture: Ochre Cottage & Little Corner Store ("LUNE STORE")
  {
    id: 'ochre-cottage',
    type: 'building',
    kind: 'ochre_cottage',
    zIndex: 20,
    x: 245,
    y: 638,
    windowLit: false,
    showLadder: true,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0.2,
  },
  {
    id: 'corner-store',
    type: 'building',
    kind: 'corner_store',
    zIndex: 21,
    x: 750,
    y: 638,
    windowLit: false,
    signText: 'LUNE STORE',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 0.2,
  },

  // 7. Village Street Props (Lantern, Apple Crate, Bicycle)
  {
    id: 'street-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 24,
    x: 465,
    y: 638,
    lit: false,
  },
  {
    id: 'apple-crate',
    type: 'prop',
    kind: 'apple_crate',
    zIndex: 25,
    x: 515,
    y: 640,
    fillStyle: 'diagonal-strokes',
    fillProgress: 0.3,
  },
  {
    id: 'bicycle',
    type: 'prop',
    kind: 'bicycle',
    zIndex: 26,
    x: 1010,
    y: 640,
  },

  // 8. Characters: Shopkeeper, Village Cat, Expressive Moon, and Little Girl
  {
    id: 'shopkeeper',
    type: 'character',
    kind: 'shopkeeper',
    state: 'waving',
    zIndex: 28,
    x: 910,
    y: 640,
    fillStyle: 'diagonal-strokes',
    fillProgress: 0.3,
  },
  {
    id: 'village-cat',
    type: 'character',
    kind: 'cat',
    state: 'curious',
    zIndex: 29,
    x: 605,
    y: 644,
    fillStyle: 'diagonal-strokes',
    fillProgress: 0.4,
  },
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'awake',
    wearingNightcap: false,
    zIndex: 30,
    x: 955,
    y: 235,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 0.3,
  },
  {
    id: 'little-girl',
    type: 'character',
    kind: 'little_girl',
    state: 'waving',
    holdingSheep: true,
    zIndex: 35,
    x: 330,
    y: 642,
    fillStyle: 'diagonal-strokes',
    fillProgress: 0.4,
  },

  // 9. Floating Rooftop Music Notes & Hand-Drawn Annotations
  {
    id: 'music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 38,
    x: 222,
    y: 392,
    count: 0,
    visible: false,
  },
  {
    id: 'lullaby-motion-line',
    type: 'annotation',
    zIndex: 39,
    x: 238,
    y: 388,
    dashedPath: 'M 0 0 Q 220 -85, 520 -130',
    color: TOKENS.colors.charcoalOutline,
    opacity: 0,
    visible: false,
  },
  {
    id: 'goodnight-caption',
    type: 'annotation',
    zIndex: 45,
    x: 68,
    y: 88,
    text: 'Goodnight, Little Moon ★',
    fontSize: TOKENS.typography.sizeCaption,
    color: TOKENS.colors.starWhite,
    opacity: 0,
    visible: false,
  },
];

export const STORY_TIMELINE: TimelineTrack[] = [
  {
    nodeId: 'ochre-cottage',
    keyframes: [
      { time: 0, fillProgress: 0.2, windowLit: false },
      { time: 2.5, fillProgress: 0.65, windowLit: false },
      { time: 4.8, fillProgress: 1.0, windowLit: true },
    ],
  },
  {
    nodeId: 'corner-store',
    keyframes: [
      { time: 0, fillProgress: 0.2, windowLit: false },
      { time: 3.0, fillProgress: 0.7, windowLit: false },
      { time: 5.2, fillProgress: 1.0, windowLit: true },
    ],
  },
  {
    nodeId: 'grass-left',
    keyframes: [
      { time: 0, fillProgress: 0.2 },
      { time: 4.5, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'grass-right',
    keyframes: [
      { time: 0, fillProgress: 0.2 },
      { time: 5.0, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'tree-left',
    keyframes: [
      { time: 0, fillProgress: 0.25 },
      { time: 4.2, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'tree-right',
    keyframes: [
      { time: 0, fillProgress: 0.2 },
      { time: 4.8, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'apple-crate',
    keyframes: [
      { time: 0, fillProgress: 0.3 },
      { time: 4.0, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'street-lantern',
    keyframes: [
      { time: 0, lit: false },
      { time: 5.5, lit: true },
    ],
  },
  {
    nodeId: 'shopkeeper',
    keyframes: [
      { time: 0, fillProgress: 0.3, state: 'waving' },
      { time: 4.2, fillProgress: 1.0, state: 'waving' },
      { time: 12.0, state: 'looking_up' },
      { time: 24.0, state: 'waving' },
    ],
  },
  {
    nodeId: 'village-cat',
    keyframes: [
      { time: 0, fillProgress: 0.4, state: 'curious' },
      { time: 4.0, fillProgress: 1.0, state: 'curious' },
      { time: 19.5, state: 'sleeping' },
    ],
  },
  {
    nodeId: 'little-girl',
    keyframes: [
      {
        time: 0,
        x: 330,
        y: 642,
        state: 'waving',
        holdingSheep: true,
        fillProgress: 0.4,
      },
      { time: 3.5, x: 330, y: 642, state: 'looking_up', fillProgress: 1.0 },
      { time: 5.6, x: 374, y: 632, state: 'walking', hold: true },
      // Act 2 (6–12s): Rear-view climbing up the right ladder (Ref Image 4!)
      { time: 6.0, x: 374, y: 626, state: 'climbing', holdingSheep: true },
      { time: 11.6, x: 374, y: 512, state: 'climbing', holdingSheep: true },
      // Act 3–5 (12–28s): Seated on the terracotta roof singing to the Moon (Ref Image 2!)
      {
        time: 12.0,
        x: 202,
        y: 458,
        state: 'singing',
        holdingSheep: true,
        hold: true,
      },
      {
        time: 19.5,
        x: 202,
        y: 458,
        state: 'sitting',
        holdingSheep: true,
        hold: true,
      },
      {
        time: 24.5,
        x: 202,
        y: 458,
        state: 'singing',
        holdingSheep: true,
        hold: true,
      },
    ],
  },
  {
    nodeId: 'music-notes',
    keyframes: [
      { time: 0, visible: false, count: 0 },
      { time: 12.2, visible: true, count: 1 },
      { time: 13.8, visible: true, count: 2 },
      { time: 15.2, visible: true, count: 3 },
      { time: 17.0, visible: true, count: 4 },
      { time: 19.5, visible: false, count: 0 },
      { time: 24.5, visible: true, count: 3 },
    ],
  },
  {
    nodeId: 'lullaby-motion-line',
    keyframes: [
      { time: 0, visible: false, opacity: 0 },
      { time: 12.5, visible: true, opacity: 0.45 },
      { time: 19.0, visible: false, opacity: 0 },
    ],
  },
  {
    nodeId: 'sky-patch',
    keyframes: [
      { time: 0, visible: false, fillProgress: 0 },
      { time: 12.0, visible: true, fillProgress: 0.18 },
      { time: 16.5, visible: true, fillProgress: 0.75, hold: true },
      { time: 19.0, visible: true, fillProgress: 0.75 },
      { time: 20.5, visible: true, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0, visible: false, count: 0 },
      { time: 12.6, visible: true, count: 8 },
      { time: 15.5, visible: true, count: 18 },
      { time: 19.2, visible: true, count: 28 },
    ],
  },
  {
    nodeId: 'pencil-numbers',
    keyframes: [
      { time: 0, visible: false, count: 0 },
      { time: 13.2, visible: true, count: 1 },
      { time: 14.2, visible: true, count: 2 },
      { time: 15.2, visible: true, count: 3 },
      { time: 16.2, visible: true, count: 4 },
      { time: 17.2, visible: true, count: 5 },
    ],
  },
  {
    nodeId: 'moon',
    keyframes: [
      { time: 0, fillProgress: 0.35, state: 'awake', wearingNightcap: false },
      { time: 3.8, fillProgress: 1.0, state: 'awake', wearingNightcap: false },
      { time: 6.5, state: 'curious', wearingNightcap: false },
      { time: 12.0, state: 'grumpy', wearingNightcap: false },
      { time: 19.2, state: 'grumpy', wearingNightcap: true },
      { time: 20.2, state: 'blinking', wearingNightcap: true },
      { time: 21.0, state: 'sleeping', wearingNightcap: true },
    ],
  },
  {
    nodeId: 'goodnight-caption',
    keyframes: [
      { time: 0, visible: false, opacity: 0 },
      { time: 24.5, visible: true, opacity: 0.95 },
    ],
  },
];

export const STORY_AUDIO_CUES: AudioNoteCue[] = [
  // Act 1: Soft dry-crayon paper scribble cues during stop-motion coloring
  { time: 0.5, freq: 920, duration: 0.32, kind: 'crayon_scribble' },
  { time: 1.5, freq: 1050, duration: 0.32, kind: 'crayon_scribble' },
  { time: 2.5, freq: 980, duration: 0.32, kind: 'crayon_scribble' },
  { time: 3.5, freq: 1120, duration: 0.32, kind: 'crayon_scribble' },
  // Act 2: Gentle climbing steps
  { time: 6.5, freq: 392.0, duration: 0.25, kind: 'lullaby' },
  { time: 8.0, freq: 440.0, duration: 0.25, kind: 'lullaby' },
  { time: 9.5, freq: 493.88, duration: 0.25, kind: 'lullaby' },
  { time: 11.0, freq: 523.25, duration: 0.35, kind: 'lullaby' },
  // Act 3: Rooftop Lullaby ("Twinkle, Twinkle, Little Star" motif)
  { time: 12.5, freq: 523.25, duration: 0.45, kind: 'lullaby' },
  { time: 13.5, freq: 523.25, duration: 0.45, kind: 'lullaby' },
  { time: 14.5, freq: 783.99, duration: 0.45, kind: 'lullaby' },
  { time: 15.5, freq: 783.99, duration: 0.45, kind: 'lullaby' },
  { time: 16.5, freq: 880.0, duration: 0.45, kind: 'lullaby' },
  { time: 17.5, freq: 880.0, duration: 0.45, kind: 'lullaby' },
  { time: 18.5, freq: 783.99, duration: 0.75, kind: 'lullaby' },
  // Act 4–5: Moon Nightcap Chime & Goodnight Resolution
  { time: 19.5, freq: 698.46, duration: 0.5, kind: 'chime' },
  { time: 21.0, freq: 659.25, duration: 0.6, kind: 'chime' },
  { time: 22.8, freq: 587.33, duration: 0.6, kind: 'lullaby' },
  { time: 25.0, freq: 523.25, duration: 1.1, kind: 'lullaby' },
];

export const MOONLIGHT_STORY_SCENE: SceneDefinition = {
  id: 'moonlight-lullaby-story',
  title: 'Goodnight, Little Moon',
  subtitle:
    'A 28-Second Stop-Motion Crayon Picture-Book Story with the Little Corner Store & Cottage',
  durationSec: TOKENS.timing.sampleSceneDurationSec,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  acts: STORY_ACTS,
  nodes: STORY_NODES,
  timeline: STORY_TIMELINE,
  camera: STORY_CAMERA,
  audioCues: STORY_AUDIO_CUES,
};

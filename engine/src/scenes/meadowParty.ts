import { TOKENS } from '../theme/tokens';
import type {
  AudioNoteCue,
  CameraKeyframe,
  SceneDefinition,
  SceneNode,
  StoryAct,
  TimelineTrack,
} from '../engine/schema';

export const MEADOW_PARTY_ACTS: StoryAct[] = [
  {
    id: 'arrival',
    title: 'Act I · Meadow Friends Gather for Strawberry',
    startTime: 0,
    endTime: 6,
    caption:
      'Under a sunny crayon sky, all the paper-cutout meadow friends gather in party hats with party horns and giggles for Birthday Strawberry!',
  },
  {
    id: 'song',
    title: 'Act II · Singing "Happy Birthday" to Strawberry',
    startTime: 6,
    endTime: 13,
    caption:
      'Singing Radish belts "Happy Birthday to You!" into her blue crayon microphone while music notes dance and Crying Onion sheds happy tears ♪ ♫',
  },
  {
    id: 'cake',
    title: 'Act III · Make a Wish & Blow Out the Candles!',
    startTime: 13,
    endTime: 18,
    caption:
      'A two-tier strawberry birthday cake with three flickering candles appears! Birthday Strawberry leans in and blows them out with a big whoosh!',
  },
  {
    id: 'celebration',
    title: 'Act IV · Confetti Pop, Party Horns & Cheers!',
    startTime: 18,
    endTime: 24,
    caption:
      'POP! Colorful crayon confetti and streamers burst across the sky as party horns toot and everyone cheers "Happy Birthday, Strawberry!"',
  },
];

export const MEADOW_PARTY_CAMERA: CameraKeyframe[] = [
  { time: 0.0, x: 0, y: 0, zoom: 1.0 },
  { time: 12.5, x: 0, y: 0, zoom: 1.0 },
  { time: 14.0, x: 24, y: 115, zoom: 1.24 },
  { time: 17.2, x: 24, y: 115, zoom: 1.24 },
  { time: 18.5, x: 0, y: 0, zoom: 1.0 },
];

export const MEADOW_PARTY_NODES: SceneNode[] = [
  // 1. Vibrant Pastel-Blue Crayon Sky Background Patch (16:9 Widescreen 1280x720)
  {
    id: 'meadow-sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 0, y: 0, width: 1280, height: 520 },
    d: 'M 0 0 L 1280 0 L 1280 490 L 0 490 Z',
  },

  // 2. Rolling Vibrant Meadow Green Hill Patch
  {
    id: 'meadow-hill-patch',
    type: 'background_patch',
    zIndex: 4,
    x: 0,
    y: 0,
    material: 'crayonMeadowGreen',
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: 0, y: 340, width: 1280, height: 380 },
    d: 'M -10 412 C 210 398, 370 348, 650 362 C 880 374, 1050 344, 1290 408 L 1290 730 L -10 730 Z',
  },

  // 3. Rosy Crayon Horizon Contour Line Along the Hill Crest (Ref Image 5 detail)
  {
    id: 'hill-horizon-line',
    type: 'annotation',
    zIndex: 5,
    x: 0,
    y: 0,
    color: TOKENS.colors.meadowHorizonRose,
    dashedPath:
      'M -10 412 C 210 398, 370 348, 650 362 C 880 374, 1050 344, 1290 408',
  },

  // 4. Upper-Left Sunny Yellow Crayon Sun
  {
    id: 'meadow-sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 6,
    x: 106,
    y: 56,
    scale: 0.62,
  },

  // 5. Two Fluffy White Cutout Clouds
  {
    id: 'cloud-center',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 705,
    y: 78,
    scale: 1.15,
    variant: 1,
  },
  {
    id: 'cloud-right',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 7,
    x: 1065,
    y: 138,
    scale: 0.95,
    variant: 2,
  },

  // 6. Meadow Daisies & V-Grass Tufts Across the Hill
  {
    id: 'meadow-daisies',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 8,
    x: 640,
    y: 485,
  },

  // 7. Back-Row Cutout Party Characters
  {
    id: 'acorn-twins',
    type: 'character',
    kind: 'acorn_twins',
    state: 'waving',
    zIndex: 14,
    x: 470,
    y: 458,
  },
  {
    id: 'watermelon-slice',
    type: 'character',
    kind: 'watermelon_slice',
    state: 'waving',
    zIndex: 16,
    x: 360,
    y: 482,
  },
  {
    id: 'crying-onion',
    type: 'character',
    kind: 'crying_onion',
    state: 'idle',
    zIndex: 15,
    x: 842,
    y: 476,
  },
  {
    id: 'cherry-twins',
    type: 'character',
    kind: 'cherry_twins',
    state: 'waving',
    zIndex: 16,
    x: 956,
    y: 476,
  },

  // 8. Center Stage: Singing Radish & Birthday Guest of Honor Strawberry!
  {
    id: 'singing-radish',
    type: 'character',
    kind: 'singing_radish',
    state: 'singing',
    zIndex: 25,
    x: 584,
    y: 612,
  },
  {
    id: 'birthday-strawberry',
    type: 'character',
    kind: 'birthday_strawberry',
    state: 'waving',
    zIndex: 26,
    x: 742,
    y: 616,
  },

  // 9. Two-Tier Strawberry Birthday Cake with Flickering Candles (between Radish & Strawberry)
  {
    id: 'birthday-cake',
    type: 'prop',
    kind: 'birthday_cake',
    zIndex: 27,
    x: 666,
    y: 646,
    lit: true,
    visible: true,
  },

  // 10. Front-Row Cutout Party Characters
  {
    id: 'hello-bug',
    type: 'character',
    kind: 'hello_bug',
    state: 'waving',
    zIndex: 28,
    x: 284,
    y: 658,
  },
  {
    id: 'blue-party-cat',
    type: 'character',
    kind: 'blue_party_cat',
    state: 'sitting',
    zIndex: 29,
    x: 424,
    y: 664,
  },
  {
    id: 'party-banana',
    type: 'character',
    kind: 'party_banana',
    state: 'waving',
    zIndex: 28,
    x: 868,
    y: 636,
  },
  {
    id: 'olive-sprout',
    type: 'character',
    kind: 'olive_sprout',
    state: 'waving',
    zIndex: 29,
    x: 1014,
    y: 642,
  },

  // 11. Floating Music Notes from Singing Radish's Microphone
  {
    id: 'party-music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 32,
    x: 652,
    y: 448,
    count: 3,
    visible: true,
  },

  // 12. Festive Crayon Party Confetti & Streamers
  {
    id: 'party-confetti',
    type: 'prop',
    kind: 'party_confetti',
    zIndex: 34,
    x: 640,
    y: 230,
    count: 28,
    visible: false,
  },

  // 13. Hand-Lettered Birthday Celebration Banner in the Sky
  {
    id: 'birthday-banner',
    type: 'annotation',
    zIndex: 35,
    x: 446,
    y: 215,
    text: 'Happy Birthday, Strawberry! ★',
    color: TOKENS.colors.radishRed,
    fontSize: 30,
    visible: false,
  },
];

export const MEADOW_PARTY_TIMELINE: TimelineTrack[] = [
  {
    nodeId: 'meadow-sky-patch',
    keyframes: [
      { time: 0.0, fillProgress: 0.35 },
      { time: 2.2, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'meadow-hill-patch',
    keyframes: [
      { time: 0.0, fillProgress: 0.3 },
      { time: 2.8, fillProgress: 1.0 },
    ],
  },
  {
    nodeId: 'singing-radish',
    keyframes: [
      { time: 0.0, state: 'waving', x: 584, y: 612 },
      { time: 6.0, state: 'singing', x: 584, y: 612, hold: true },
      { time: 13.5, state: 'waving', x: 584, y: 612, hold: true },
      { time: 18.0, state: 'singing', x: 584, y: 612, hold: true },
    ],
  },
  {
    nodeId: 'birthday-strawberry',
    keyframes: [
      { time: 0.0, state: 'waving', x: 742, y: 616, scale: 1.0 },
      { time: 6.0, state: 'singing', x: 742, y: 616, scale: 1.05 },
      { time: 13.0, state: 'waving', x: 726, y: 616, scale: 1.08 },
      // Leans in toward the birthday cake candles at t = 15.8s and blows them out at t = 16.0s!
      { time: 15.8, state: 'singing', x: 708, y: 614, scale: 1.12 },
      { time: 17.5, state: 'waving', x: 742, y: 616, scale: 1.08 },
      { time: 24.0, state: 'waving', x: 742, y: 616, scale: 1.08 },
    ],
  },
  {
    nodeId: 'birthday-cake',
    keyframes: [
      { time: 0.0, visible: true, lit: true, scale: 0.92 },
      { time: 13.0, visible: true, lit: true, scale: 1.08 },
      // Candles blown out at t = 16.0s -> smoke curls rise!
      { time: 16.0, visible: true, lit: false, scale: 1.08, hold: true },
      { time: 24.0, visible: true, lit: false, scale: 1.0 },
    ],
  },
  {
    nodeId: 'party-music-notes',
    keyframes: [
      { time: 0.0, visible: false, count: 2 },
      { time: 6.0, visible: true, count: 3, hold: true },
      { time: 13.2, visible: false, count: 2, hold: true },
      { time: 18.2, visible: true, count: 4, hold: true },
    ],
  },
  {
    nodeId: 'party-confetti',
    keyframes: [
      { time: 0.0, visible: false, count: 16 },
      { time: 3.0, visible: true, count: 14, hold: true },
      { time: 5.5, visible: false, count: 14, hold: true },
      { time: 18.0, visible: true, count: 32, hold: true },
      { time: 24.0, visible: true, count: 32 },
    ],
  },
  {
    nodeId: 'birthday-banner',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0 },
      { time: 18.0, visible: true, opacity: 1 },
      { time: 24.0, visible: true, opacity: 1 },
    ],
  },
];

export const MEADOW_PARTY_AUDIO_CUES: AudioNoteCue[] = [
  // Act I (0s - 6s): Crayon coloring scribble, party horns, and excited giggles as friends arrive
  { time: 0.3, freq: 620, duration: 0.25, kind: 'crayon_scribble' },
  { time: 1.0, freq: 720, duration: 0.25, kind: 'crayon_scribble' },
  { time: 1.8, freq: 440, duration: 0.42, kind: 'party_horn' },
  { time: 2.6, freq: 587.33, duration: 0.28, kind: 'giggle' },
  { time: 3.1, freq: 523.25, duration: 0.4, kind: 'confetti_pop' },
  { time: 4.0, freq: 659.25, duration: 0.3, kind: 'giggle' },
  { time: 4.9, freq: 493.88, duration: 0.45, kind: 'party_horn' },

  // Act II (6s - 13s): Singing Radish sings "Happy Birthday to You" (in C major: G4 G4 A4 G4 C5 B4 | G4 G4 A4 G4 D5 C5)
  { time: 6.2, freq: 392.0, duration: 0.32, kind: 'birthday_song' }, // Hap-
  { time: 6.6, freq: 392.0, duration: 0.28, kind: 'birthday_song' }, // py
  { time: 7.0, freq: 440.0, duration: 0.52, kind: 'birthday_song' }, // Birth-
  { time: 7.6, freq: 392.0, duration: 0.52, kind: 'birthday_song' }, // day
  { time: 8.2, freq: 523.25, duration: 0.52, kind: 'birthday_song' }, // to
  { time: 8.8, freq: 493.88, duration: 0.85, kind: 'birthday_song' }, // You!

  { time: 9.8, freq: 392.0, duration: 0.32, kind: 'birthday_song' }, // Hap-
  { time: 10.2, freq: 392.0, duration: 0.28, kind: 'birthday_song' }, // py
  { time: 10.6, freq: 440.0, duration: 0.52, kind: 'birthday_song' }, // Birth-
  { time: 11.2, freq: 392.0, duration: 0.52, kind: 'birthday_song' }, // day,
  { time: 11.8, freq: 587.33, duration: 0.52, kind: 'birthday_song' }, // dear Straw-ber-
  { time: 12.4, freq: 523.25, duration: 0.85, kind: 'birthday_song' }, // ry!

  // Act III (13s - 18s): Cake presentation chime, Strawberry's wish giggle, and blowing out the candles!
  { time: 13.3, freq: 1046.5, duration: 0.55, kind: 'chime' },
  { time: 14.3, freq: 659.25, duration: 0.3, kind: 'giggle' },
  { time: 15.8, freq: 480.0, duration: 0.75, kind: 'candle_blow' },
  { time: 16.8, freq: 1046.5, duration: 0.5, kind: 'chime' },

  // Act IV (18s - 24s): Confetti pop, cheering applause, party horns, and triumphant finale!
  { time: 18.0, freq: 523.25, duration: 0.55, kind: 'confetti_pop' },
  { time: 18.5, freq: 523.25, duration: 0.85, kind: 'cheer_applause' },
  { time: 19.5, freq: 440.0, duration: 0.45, kind: 'party_horn' },
  { time: 20.2, freq: 587.33, duration: 0.48, kind: 'party_horn' },
  { time: 21.0, freq: 659.25, duration: 0.32, kind: 'giggle' },
  { time: 21.8, freq: 523.25, duration: 0.5, kind: 'confetti_pop' },
  { time: 22.4, freq: 659.25, duration: 0.9, kind: 'cheer_applause' },
];

export const MEADOW_PARTY_SCENE: SceneDefinition = {
  id: 'meadow_party_3',
  title: "Strawberry's Meadow Birthday Party (short_sample=3)",
  subtitle:
    'Vibrant Crayon Mode · Paper-Cutout Birthday Strawberry, Singing Radish, Birthday Cake, Confetti & Party SFX',
  durationSec: 24,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  vibrantMode: true,
  acts: MEADOW_PARTY_ACTS,
  nodes: MEADOW_PARTY_NODES,
  timeline: MEADOW_PARTY_TIMELINE,
  camera: MEADOW_PARTY_CAMERA,
  audioCues: MEADOW_PARTY_AUDIO_CUES,
};

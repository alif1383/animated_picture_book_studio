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
 * "The Corner Store Pizza Run" — 32-second 5-Act Storybook Scene (`?scene=corner-store-day` / `?short_sample=4`)
 *
 * Framed inside the physical hardcover Storybook (`bookFrame`):
 * - Act I (0–7s): The closed storybook opens and colors in from 0% to 100%. Outside her cute cozy house on the far left,
 *   the Little Girl (in her purple star sweater) and her tabby-patched white Cat set off along the village path toward the distant Corner Store on the right.
 * - Act II (7–14s): Arriving at "LUNE STORE", the Girl and Shopkeeper exchange speech-bubble dialogue to order a hot cheesy slice of pizza.
 * - Act III (14–21s): Holding her warm pizza slice, a fluffy thought bubble ("Yum!! So cheesy! ★") pops above the Girl's head as she and her Cat happily enjoy the treat.
 * - Act IV (21–27s): Waving goodbye to the Shopkeeper, the Girl and Cat walk all the way back from the Corner Store on the right to their cozy house on the left as indigo dusk, twinkling stars, and the Crescent Moon with stars rise overhead.
 * - Act V (27–32s): Back home outside her glowing cottage, the Girl and Cat wave goodnight under the Crescent Moon before the scene zooms out into the open book, un-colors to a charcoal sketch, and closes the hardcover book with "The End ★".
 */

export const CORNER_STORE_ACTS: StoryAct[] = [
  {
    id: 'act-1-leaving-home',
    title: 'Act I · Opening the Book & Leaving the Cozy Cottage',
    startTime: 0,
    endTime: 7,
    caption:
      'The hardcover storybook opens and colors in with wax crayon as the Little Girl and her patched kitten step out of their cozy cottage on the left and walk toward the distant Corner Store.',
  },
  {
    id: 'act-2-dialogue-at-store',
    title: 'Act II · Ordering Pizza at the Corner Store',
    startTime: 7,
    endTime: 14,
    caption:
      'At LUNE STORE on the right side of the village, the friendly Shopkeeper greets the Little Girl and her Cat with fresh hot pepperoni pizza!',
  },
  {
    id: 'act-3-eating-pizza-yum',
    title: 'Act III · Thinking "Yum!" & Eating Pizza Together',
    startTime: 14,
    endTime: 21,
    caption:
      'Holding a warm cheesy slice, a fluffy thought bubble pops up—"Yum!! So cheesy! ★"—as the Little Girl eats her pizza and her Cat purrs happily.',
  },
  {
    id: 'act-4-walking-home-moonrise',
    title: 'Act IV · Walking Back Home Under the Crescent Moon',
    startTime: 21,
    endTime: 27,
    caption:
      'After thanking the Shopkeeper, the Girl and her Cat walk all the way back from the store to their cozy cottage as the Crescent Moon and twinkling stars rise in the indigo sky.',
  },
  {
    id: 'act-5-home-sweet-home-closing',
    title: 'Act V · Home Sweet Home & Closing the Storybook',
    startTime: 27,
    endTime: 33,
    caption:
      'Back at her glowing cottage door, the Little Girl and her Cat wave goodnight under the Crescent Moon as the storybook un-colors to sketch and closes.',
  },
];

export const CORNER_STORE_CAMERA: CameraKeyframe[] = [
  // Act I (0–7s): Wide village view so the book opening & walk from left house to right store are clear
  { time: 0.0, x: 0, y: 0, zoom: 1.0 },
  { time: 6.8, x: 0, y: 0, zoom: 1.0 },

  // Act II & III (7–20.5s): Gentle focus toward the Corner Store on the right for dialogue & eating pizza
  { time: 7.8, x: 140, y: 42, zoom: 1.18 },
  { time: 20.2, x: 140, y: 42, zoom: 1.18 },

  // Act IV & V (21–33s): Wide full-village view as Girl & Cat walk back left to their cottage under the Crescent Moon
  { time: 21.5, x: 0, y: 0, zoom: 1.0 },
  { time: 33.0, x: 0, y: 0, zoom: 1.0 },
];

export const CORNER_STORE_NODES: SceneNode[] = [
  // ─── 1. BACKGROUND SKY PATCHES: Daytime Blue → Warm Sunset Orange → Indigo Night ───
  {
    id: 'day-sky-patch',
    type: 'background_patch',
    zIndex: 1,
    x: 0,
    y: 0,
    d: 'M 18 16 Q 640 12, 1262 18 L 1262 500 Q 980 515, 680 500 Q 360 512, 18 495 Z',
    bounds: { x: 16, y: 12, width: 1248, height: 505 },
    material: 'crayonSkyBlue',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 1.0,
    opacity: 0.72,
    visible: true,
  },
  {
    id: 'sunset-patch',
    type: 'background_patch',
    zIndex: 2,
    x: 0,
    y: 0,
    d: 'M 18 16 Q 640 12, 1262 18 L 1262 505 Q 980 520, 680 505 Q 360 518, 18 500 Z',
    bounds: { x: 16, y: 12, width: 1248, height: 510 },
    material: 'crayonSunsetOrange',
    fillStyle: 'top-down-bands',
    fillSteps: 10,
    fillProgress: 0,
    opacity: 0.9,
    visible: false,
  },
  {
    id: 'sky-patch',
    type: 'background_patch',
    zIndex: 3,
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

  // ─── 2. GROUND: Green Crayon Grass Patches Linking Left House & Right Store ───
  {
    id: 'grass-left',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 230,
    y: 640,
    scale: 1.65,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },
  {
    id: 'grass-center',
    type: 'prop',
    kind: 'grass_patch',
    zIndex: 5,
    x: 640,
    y: 642,
    scale: 1.75,
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
    x: 1035,
    y: 640,
    scale: 1.75,
    fillStyle: 'diagonal-strokes',
    fillSteps: 10,
    fillProgress: 1.0,
    bounds: { x: -190, y: -35, width: 390, height: 95 },
  },

  // ─── 3. SCENERY: Trees & Meadow Flowers Along the Village Path ───
  {
    id: 'tree-left',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 42,
    y: 640,
    scale: 0.95,
    variant: 1,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },
  {
    id: 'tree-mid',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 485,
    y: 638,
    scale: 1.02,
    variant: 2,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },
  {
    id: 'tree-right',
    type: 'prop',
    kind: 'tree',
    zIndex: 10,
    x: 1232,
    y: 640,
    scale: 0.95,
    variant: 3,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },
  {
    id: 'meadow-flowers-left',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 7,
    x: 410,
    y: 648,
    scale: 0.85,
  },
  {
    id: 'meadow-flowers',
    type: 'prop',
    kind: 'meadow_flowers',
    zIndex: 7,
    x: 705,
    y: 648,
    scale: 0.85,
  },

  // ─── 4. FLUFFY CLOUDS (Daytime) ───
  {
    id: 'cloud-1',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 4,
    x: 210,
    y: 110,
    scale: 0.9,
  },
  {
    id: 'cloud-2',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 4,
    x: 680,
    y: 85,
    scale: 1.05,
  },
  {
    id: 'cloud-3',
    type: 'prop',
    kind: 'fluffy_cloud',
    zIndex: 4,
    x: 1080,
    y: 125,
    scale: 0.78,
  },

  // ─── 5. BUILDINGS: Cute Cozy House on Far Left & Corner Store on Far Right ───
  {
    id: 'ochre-cottage',
    type: 'building',
    kind: 'ochre_cottage',
    zIndex: 18,
    x: 195,
    y: 638,
    scale: 0.88,
    windowLit: false,
    showLadder: false,
    fillStyle: 'diagonal-strokes',
    fillSteps: 12,
    fillProgress: 1.0,
    bounds: { x: -180, y: -270, width: 360, height: 275 },
  },
  {
    id: 'corner-store',
    type: 'building',
    kind: 'corner_store',
    zIndex: 20,
    x: 1035,
    y: 638,
    scale: 0.92,
    windowLit: false,
    signText: 'LUNE STORE',
    fillStyle: 'diagonal-strokes',
    fillSteps: 12,
    fillProgress: 1.0,
    bounds: { x: -155, y: -215, width: 330, height: 225 },
  },

  // ─── 6. STREET & STOREFRONT PROPS ───
  {
    id: 'street-lantern',
    type: 'prop',
    kind: 'street_lantern',
    zIndex: 22,
    x: 590,
    y: 640,
    lit: false,
  },
  {
    id: 'apple-crate',
    type: 'prop',
    kind: 'apple_crate',
    zIndex: 22,
    x: 865,
    y: 642,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },
  {
    id: 'pizza-stand',
    type: 'prop',
    kind: 'pizza_slice',
    variant: 2,
    lit: true,
    zIndex: 23,
    x: 912,
    y: 642,
    scale: 0.88,
    fillStyle: 'diagonal-strokes',
    fillSteps: 8,
    fillProgress: 1.0,
  },
  {
    id: 'counter-pizza-slice',
    type: 'prop',
    kind: 'pizza_slice',
    variant: 1,
    lit: true,
    zIndex: 32,
    x: 880,
    y: 592,
    scale: 0.92,
    opacity: 0,
    visible: false,
  },
  {
    id: 'bicycle',
    type: 'prop',
    kind: 'bicycle',
    zIndex: 24,
    x: 1185,
    y: 642,
    scale: 0.9,
  },

  // ─── 7. CHARACTERS ───

  // Friendly Shopkeeper outside the Corner Store on the right
  {
    id: 'shopkeeper',
    type: 'character',
    kind: 'shopkeeper',
    state: 'idle',
    zIndex: 28,
    x: 958,
    y: 642,
    opacity: 1.0,
    visible: true,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // Little Girl in her purple star sweater — starts at her cozy cottage on the left
  {
    id: 'little-girl',
    type: 'character',
    kind: 'little_girl',
    state: 'idle',
    holdingSheep: false,
    holdingPizza: false,
    zIndex: 34,
    x: 265,
    y: 642,
    opacity: 1.0,
    visible: true,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // White & Tabby Patched Village Cat — accompanies the Little Girl everywhere!
  {
    id: 'village-cat',
    type: 'character',
    kind: 'cat',
    state: 'idle',
    zIndex: 35,
    x: 215,
    y: 646,
    opacity: 1.0,
    visible: true,
    fillStyle: 'diagonal-strokes',
    fillProgress: 1.0,
  },

  // Expressive Crayon Sun — shines in the daytime sky (Acts I–III) and sets at dusk (Act IV)
  {
    id: 'sun',
    type: 'character',
    kind: 'sun',
    state: 'awake',
    zIndex: 8,
    x: 540,
    y: 160,
    scale: 0.82,
    opacity: 1.0,
    visible: true,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // Crescent Moon with Twinkling Stars — rises in Act IV as the Sun sets
  {
    id: 'moon',
    type: 'character',
    kind: 'moon',
    state: 'awake',
    wearingNightcap: false,
    zIndex: 8,
    x: 640,
    y: 265,
    scale: 0.85,
    opacity: 0,
    visible: false,
    fillStyle: 'radial-scribble',
    fillSteps: 10,
    fillProgress: 1.0,
  },

  // ─── 8. SKY & ATMOSPHERE PROPS ───
  {
    id: 'star-cluster',
    type: 'prop',
    kind: 'star_cluster',
    zIndex: 4,
    x: 36,
    y: 28,
    variant: 2,
    count: 0,
    visible: false,
  },
  {
    id: 'chimney-puffs',
    type: 'prop',
    kind: 'chimney_puffs',
    zIndex: 17,
    x: 116,
    y: 412,
    count: 0,
    visible: false,
  },
  {
    id: 'music-notes',
    type: 'prop',
    kind: 'music_notes',
    zIndex: 38,
    x: 300,
    y: 540,
    count: 0,
    visible: false,
  },

  // ─── 9. STORY ANNOTATIONS (Character speech/thought bubbles attach directly via speechText/speechStyle) ───
  {
    id: 'goodnight-caption',
    type: 'annotation',
    zIndex: 45,
    x: 420,
    y: 78,
    text: 'Goodnight, Little Village ★',
    fontSize: TOKENS.typography.sizeCaption,
    color: TOKENS.colors.starWhite,
    opacity: 0,
    visible: false,
  },
];

export const CORNER_STORE_TIMELINE: TimelineTrack[] = [
  // ═══════════════════════════════════════════════════════════════
  // BUILDINGS & LANTERN: Daytime in Acts I–III, Warm Evening Glow in Acts IV–V
  // ═══════════════════════════════════════════════════════════════
  {
    nodeId: 'ochre-cottage',
    keyframes: [
      { time: 0.0, fillProgress: 1.0, windowLit: false, hold: true },
      { time: 21.5, fillProgress: 1.0, windowLit: true, hold: true },
    ],
  },
  {
    nodeId: 'corner-store',
    keyframes: [
      { time: 0.0, fillProgress: 1.0, windowLit: false, hold: true },
      { time: 21.5, fillProgress: 1.0, windowLit: true, hold: true },
    ],
  },
  {
    nodeId: 'street-lantern',
    keyframes: [
      { time: 0.0, lit: false, hold: true },
      { time: 21.0, lit: true, hold: true },
    ],
  },
  {
    nodeId: 'chimney-puffs',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 22.0, visible: true, count: 2 },
      { time: 25.0, visible: true, count: 4, hold: true },
    ],
  },

  // Daytime clouds drift gently and fade at dusk
  {
    nodeId: 'cloud-1',
    keyframes: [
      { time: 0.0, x: 210, opacity: 1.0 },
      { time: 20.0, x: 290, opacity: 1.0 },
      { time: 23.0, x: 320, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'cloud-2',
    keyframes: [
      { time: 0.0, x: 680, opacity: 1.0 },
      { time: 20.0, x: 760, opacity: 1.0 },
      { time: 23.5, x: 790, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'cloud-3',
    keyframes: [
      { time: 0.0, x: 1080, opacity: 1.0 },
      { time: 20.0, x: 1140, opacity: 1.0 },
      { time: 22.5, x: 1165, opacity: 0.0, hold: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LITTLE GIRL CHOREOGRAPHY & CHARACTER-ATTACHED BUBBLES ACROSS ALL 5 ACTS (0..32s)
  // ═══════════════════════════════════════════════════════════════
  {
    nodeId: 'little-girl',
    keyframes: [
      // Act I (0..3.5s): Standing outside her cozy cottage on the left as the book opens
      {
        time: 0.0,
        x: 265,
        y: 642,
        flipX: false,
        state: 'waving',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
        hold: true,
      },
      // Act I (3.5..7s): Walks rightward from her cottage (x=265) to the Corner Store (x=815) with attached speech bubble
      {
        time: 3.5,
        x: 265,
        y: 642,
        flipX: false,
        state: 'walking',
        holdingSheep: false,
        holdingPizza: false,
        speechText: "Let's get pizza, Kitty! ★",
        speechStyle: 'speech',
      },
      {
        time: 7.0,
        x: 815,
        y: 642,
        flipX: false,
        state: 'idle',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
        hold: true,
      },
      // Act II (7..14s): Chatting with the Shopkeeper & ordering pizza
      {
        time: 9.5,
        x: 815,
        y: 642,
        flipX: false,
        state: 'waving',
        holdingSheep: false,
        holdingPizza: false,
        speechText: 'One cheesy slice, please!',
        speechStyle: 'speech',
        hold: true,
      },
      {
        time: 11.8,
        x: 815,
        y: 642,
        flipX: false,
        state: 'looking_up',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
        hold: true,
      },
      // Receives her hot cheesy pizza slice!
      {
        time: 13.5,
        x: 815,
        y: 642,
        flipX: false,
        state: 'idle',
        holdingSheep: false,
        holdingPizza: true,
        speechText: '',
        hold: true,
      },
      // Act III (14..21s): Thinking "Yum!!" and happily eating her pizza slice
      {
        time: 14.2,
        x: 815,
        y: 642,
        flipX: false,
        state: 'waving',
        holdingSheep: false,
        holdingPizza: true,
        speechText: 'Yum!! So cheesy! ★',
        speechStyle: 'thought',
        hold: true,
      },
      {
        time: 16.5,
        x: 815,
        y: 642,
        flipX: false,
        state: 'singing',
        holdingSheep: false,
        holdingPizza: true,
        speechText: 'Yum!! So cheesy! ★',
        speechStyle: 'thought',
        hold: true,
      },
      {
        time: 19.5,
        x: 815,
        y: 642,
        flipX: false,
        state: 'idle',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
        hold: true,
      },
      // Act IV (21..27s): Waves goodbye, turns left (flipX: true), and walks back home to cottage!
      {
        time: 21.0,
        x: 815,
        y: 642,
        flipX: false,
        state: 'waving',
        holdingSheep: false,
        holdingPizza: false,
        speechText: 'Thank you! Bye-bye! ★',
        speechStyle: 'speech',
        hold: true,
      },
      {
        time: 22.2,
        x: 815,
        y: 642,
        flipX: true,
        state: 'walking',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
      },
      {
        time: 26.8,
        x: 265,
        y: 642,
        flipX: true,
        state: 'walking',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
      },
      // Act V (27..32s): Back home at her cottage door, waving goodnight under the Crescent Moon
      {
        time: 27.0,
        x: 265,
        y: 642,
        flipX: false,
        state: 'waving',
        holdingSheep: false,
        holdingPizza: false,
        speechText: 'Home sweet home! ★',
        speechStyle: 'speech',
        hold: true,
      },
      {
        time: 28.6,
        x: 265,
        y: 642,
        flipX: false,
        state: 'looking_up',
        holdingSheep: false,
        holdingPizza: false,
        speechText: '',
        hold: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // VILLAGE CAT CHOREOGRAPHY & THOUGHT BUBBLE ACROSS ALL 5 ACTS (0..32s)
  // ═══════════════════════════════════════════════════════════════
  {
    nodeId: 'village-cat',
    keyframes: [
      // Act I: Starts beside the Girl outside the cottage, then trots right to the store
      {
        time: 0.0,
        x: 215,
        y: 646,
        flipX: false,
        state: 'idle',
        speechText: '',
        hold: true,
      },
      {
        time: 3.5,
        x: 215,
        y: 646,
        flipX: false,
        state: 'walking',
        speechText: '',
      },
      {
        time: 7.0,
        x: 755,
        y: 646,
        flipX: false,
        state: 'sitting',
        speechText: '',
        hold: true,
      },
      // Act II: Curious at the pizza stand while Girl orders
      {
        time: 9.5,
        x: 755,
        y: 646,
        flipX: false,
        state: 'curious',
        speechText: '',
        hold: true,
      },
      // Act III: Happy purring & waving while sharing pizza time
      {
        time: 14.2,
        x: 755,
        y: 646,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
      {
        time: 16.0,
        x: 755,
        y: 646,
        flipX: false,
        state: 'curious',
        speechText: '',
        hold: true,
      },
      {
        time: 19.5,
        x: 755,
        y: 646,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
      // Act IV: Turns left (flipX: true) and walks all the way back home with the Girl
      {
        time: 22.2,
        x: 755,
        y: 646,
        flipX: true,
        state: 'walking',
        speechText: '',
      },
      {
        time: 26.8,
        x: 215,
        y: 646,
        flipX: true,
        state: 'walking',
        speechText: '',
      },
      // Act V: Curled up / waving happily outside the cozy cottage at night
      {
        time: 27.0,
        x: 215,
        y: 646,
        flipX: false,
        state: 'waving',
        speechText: '',
        hold: true,
      },
      {
        time: 28.8,
        x: 215,
        y: 646,
        flipX: false,
        state: 'sleeping',
        speechText: '',
        hold: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOPKEEPER & PIZZA COUNTER SLICE (With Character-Attached Dialogue)
  // ═══════════════════════════════════════════════════════════════
  {
    nodeId: 'shopkeeper',
    keyframes: [
      { time: 0.0, state: 'idle', speechText: '', hold: true },
      {
        time: 7.2,
        state: 'waving',
        speechText: 'Welcome! Fresh hot pizza?',
        speechStyle: 'speech',
        hold: true,
      },
      { time: 9.3, state: 'idle', speechText: '', hold: true },
      {
        time: 11.8,
        state: 'waving',
        speechText: 'Here you go! Enjoy! ★',
        speechStyle: 'speech',
        hold: true,
      },
      { time: 13.9, state: 'idle', speechText: '', hold: true },
      { time: 21.0, state: 'waving', speechText: '', hold: true },
      { time: 24.0, state: 'looking_up', speechText: '', hold: true },
    ],
  },
  {
    nodeId: 'counter-pizza-slice',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 11.6, visible: true, opacity: 1.0, x: 885, y: 592 },
      { time: 13.4, visible: true, opacity: 1.0, x: 842, y: 596 },
      { time: 13.5, visible: false, opacity: 0.0, hold: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SKY, SUNSET, SETTING SUN & RISING CRESCENT MOON (0..33s)
  // ═══════════════════════════════════════════════════════════════
  {
    nodeId: 'day-sky-patch',
    keyframes: [
      { time: 0.0, visible: true, fillProgress: 1.0, opacity: 0.72 },
      { time: 17.5, visible: true, fillProgress: 1.0, opacity: 0.72 },
      { time: 21.0, visible: true, fillProgress: 1.0, opacity: 0.0 },
      { time: 21.2, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'sunset-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, opacity: 0.9, hold: true },
      { time: 17.5, visible: true, fillProgress: 0.15, opacity: 0.9 },
      { time: 21.0, visible: true, fillProgress: 0.9, opacity: 0.9 },
      { time: 24.8, visible: true, fillProgress: 0.9, opacity: 0.0 },
      { time: 25.0, visible: false, fillProgress: 0.0, opacity: 0.0, hold: true },
    ],
  },
  {
    nodeId: 'sun',
    keyframes: [
      // Acts I–III (0..17.5s): Bright awake Sun shining over the village
      {
        time: 0.0,
        visible: true,
        opacity: 1.0,
        x: 540,
        y: 160,
        scale: 0.82,
        state: 'awake',
      },
      {
        time: 17.5,
        visible: true,
        opacity: 1.0,
        x: 510,
        y: 165,
        scale: 0.82,
        state: 'awake',
      },
      // Golden hour (17.5..21.0s): Sun grows sleepy and begins dipping lower
      {
        time: 21.0,
        visible: true,
        opacity: 1.0,
        x: 480,
        y: 200,
        scale: 0.8,
        state: 'sleepy',
      },
      // Act IV (21.0..25.2s): As the Girl & Cat walk back home, the Sun closes its eyes and sets below the horizon
      {
        time: 22.0,
        visible: true,
        opacity: 0.95,
        x: 460,
        y: 235,
        scale: 0.78,
        state: 'sleeping',
      },
      {
        time: 25.2,
        visible: true,
        opacity: 0.0,
        x: 410,
        y: 420,
        scale: 0.68,
        state: 'sleeping',
      },
      {
        time: 25.4,
        visible: false,
        opacity: 0.0,
        x: 410,
        y: 430,
        scale: 0.68,
        state: 'sleeping',
        hold: true,
      },
    ],
  },
  {
    nodeId: 'sky-patch',
    keyframes: [
      { time: 0.0, visible: false, fillProgress: 0.0, hold: true },
      { time: 21.0, visible: true, fillProgress: 0.15 },
      { time: 23.0, visible: true, fillProgress: 0.55 },
      { time: 25.0, visible: true, fillProgress: 0.88 },
      { time: 26.5, visible: true, fillProgress: 1.0, hold: true },
    ],
  },
  {
    nodeId: 'star-cluster',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 21.5, visible: true, count: 8 },
      { time: 24.0, visible: true, count: 18 },
      { time: 26.5, visible: true, count: 28, hold: true },
    ],
  },
  {
    nodeId: 'moon',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, y: 340, hold: true },
      {
        time: 21.5,
        visible: true,
        opacity: 0.0,
        y: 340,
        state: 'awake',
        wearingNightcap: false,
      },
      {
        time: 23.5,
        visible: true,
        opacity: 0.88,
        y: 265,
        state: 'curious',
        wearingNightcap: false,
      },
      {
        time: 25.8,
        visible: true,
        opacity: 1.0,
        y: 205,
        state: 'awake',
        wearingNightcap: false,
      },
      {
        time: 27.2,
        visible: true,
        opacity: 1.0,
        y: 205,
        state: 'sleepy',
        wearingNightcap: true,
        hold: true,
      },
    ],
  },
  {
    nodeId: 'music-notes',
    keyframes: [
      { time: 0.0, visible: false, count: 0, hold: true },
      { time: 26.5, visible: true, count: 2 },
      { time: 28.0, visible: true, count: 3, hold: true },
    ],
  },
  {
    nodeId: 'goodnight-caption',
    keyframes: [
      { time: 0.0, visible: false, opacity: 0.0, hold: true },
      { time: 26.8, visible: true, opacity: 0.0 },
      { time: 27.6, visible: true, opacity: 0.95, hold: true },
      { time: 29.2, visible: false, opacity: 0.0, hold: true },
    ],
  },
];

export const CORNER_STORE_AUDIO_CUES: AudioNoteCue[] = [
  // ─── Act I (0–7s): Storybook opening & cheerful walking steps from cottage to store ───
  { time: 0.5, freq: 920, duration: 0.32, kind: 'crayon_scribble' },
  { time: 1.4, freq: 1050, duration: 0.32, kind: 'crayon_scribble' },
  { time: 2.3, freq: 980, duration: 0.32, kind: 'crayon_scribble' },
  { time: 3.6, freq: 523.25, duration: 0.35, kind: 'chime' },
  { time: 4.4, freq: 587.33, duration: 0.3, kind: 'lullaby' },
  { time: 5.2, freq: 659.25, duration: 0.3, kind: 'lullaby' },
  { time: 6.0, freq: 783.99, duration: 0.35, kind: 'chime' },

  // ─── Act II (7–14s): Friendly dialogue chimes at the Corner Store ───
  { time: 7.3, freq: 659.25, duration: 0.4, kind: 'chime' },
  { time: 8.2, freq: 783.99, duration: 0.4, kind: 'chime' },
  { time: 9.6, freq: 659.25, duration: 0.35, kind: 'giggle' },
  { time: 10.5, freq: 523.25, duration: 0.35, kind: 'lullaby' },
  { time: 11.9, freq: 880.0, duration: 0.45, kind: 'chime' },
  { time: 13.0, freq: 1046.5, duration: 0.45, kind: 'chime' },

  // ─── Act III (14–21s): Thinking "Yum!" & happily eating hot cheesy pizza ───
  { time: 14.3, freq: 783.99, duration: 0.45, kind: 'chime' },
  { time: 15.1, freq: 659.25, duration: 0.38, kind: 'giggle' },
  { time: 16.3, freq: 587.33, duration: 0.35, kind: 'lullaby' },
  { time: 17.2, freq: 659.25, duration: 0.35, kind: 'lullaby' },
  { time: 18.2, freq: 783.99, duration: 0.4, kind: 'chime' },
  { time: 19.4, freq: 659.25, duration: 0.35, kind: 'giggle' },

  // ─── Act IV (21–27s): Waving goodbye & walking home under the Crescent Moon ───
  { time: 21.1, freq: 783.99, duration: 0.4, kind: 'chime' },
  { time: 22.0, freq: 920, duration: 0.3, kind: 'crayon_scribble' },
  { time: 23.0, freq: 659.25, duration: 0.5, kind: 'lullaby' },
  { time: 24.0, freq: 587.33, duration: 0.5, kind: 'lullaby' },
  { time: 25.0, freq: 523.25, duration: 0.5, kind: 'lullaby' },
  { time: 26.0, freq: 659.25, duration: 0.5, kind: 'chime' },

  // ─── Act V (27–33s): Home sweet home & closing the hardcover storybook ───
  { time: 27.1, freq: 783.99, duration: 0.55, kind: 'chime' },
  { time: 28.0, freq: 659.25, duration: 0.55, kind: 'lullaby' },
  { time: 29.0, freq: 523.25, duration: 0.55, kind: 'lullaby' },
  { time: 30.0, freq: 440.0, duration: 0.6, kind: 'lullaby' },
  { time: 31.0, freq: 392.0, duration: 0.7, kind: 'lullaby' },
  { time: 32.0, freq: 523.25, duration: 0.9, kind: 'lullaby' },
];

export const CORNER_STORE_DAY_SCENE: SceneDefinition = {
  id: 'corner-store-day',
  title: 'The Corner Store Pizza Run',
  subtitle:
    'Leaving the Cozy Cottage → Ordering Pizza at Lune Store → Thinking "Yum!" → Walking Home Under the Crescent Moon',
  durationSec: 33,
  width: TOKENS.canvas.width,
  height: TOKENS.canvas.height,
  fps: TOKENS.timing.fps,
  bookFrame: {
    enabled: true,
    coverTitle: 'The Corner Store Pizza Run',
    coverSubtitle: 'A Crayon Storybook Adventure with the Little Girl & Her Cat',
    creditText: 'Illustrated in Wax Crayon & Oil Pastel',
    endingTitle: 'The End ★',
    endingCredit: 'The Corner Store Pizza Run · Goodnight, Little Village',
    coverMaterial: 'crayonTerracotta',
    openDurationSec: 3.5,
    closeDurationSec: 4.5,
  },
  acts: CORNER_STORE_ACTS,
  nodes: CORNER_STORE_NODES,
  timeline: CORNER_STORE_TIMELINE,
  camera: CORNER_STORE_CAMERA,
  audioCues: CORNER_STORE_AUDIO_CUES,
};

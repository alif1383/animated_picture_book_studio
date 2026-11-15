import { TOKENS } from '../theme/tokens';
import { svgEl } from '../engine/svgUtils';
import { evaluateSteppedClock } from '../engine/clock';
import {
  evaluateAndRenderScene,
  RenderSceneOptions,
} from '../engine/renderer';
import type {
  AudioCueKind,
  CharacterState,
  SceneDefinition,
} from '../engine/schema';
import { renderBuilding } from '../assets/buildings';
import { renderCharacter } from '../assets/characters';
import { renderProp } from '../assets/objects';
import { PictureBookSoundEngine } from '../audio/soundEngine';
import {
  exportSceneTo16x9Video,
  VideoExportResolution,
} from '../engine/videoExporter';
import { MOONLIGHT_STORY_SCENE } from '../scenes/moonlightStory';
import { SHORT_SAMPLE_1_SCENE } from '../scenes/shortSample1';
import { MEADOW_PARTY_SCENE } from '../scenes/meadowParty';
import { CORNER_STORE_DAY_SCENE } from '../scenes/cornerStoreDay';
import { MOONLIT_GARDEN_SCENE } from '../scenes/moonlitGarden';
import { STRAWBERRY_BEACH_BIRTHDAY_SCENE } from '../scenes/strawberryBeachBirthday';
import { KNIGHT_DRAGON_QUEST_SCENE } from '../scenes/knightDragonQuest';

export type ShortSampleId = '1' | '2' | '3' | '4' | '5' | '6';

export const SCENE_REGISTRY: Record<string, SceneDefinition> = {
  '1': SHORT_SAMPLE_1_SCENE,
  '2': MOONLIGHT_STORY_SCENE,
  '3': MEADOW_PARTY_SCENE,
  '4': CORNER_STORE_DAY_SCENE,
  '5': STRAWBERRY_BEACH_BIRTHDAY_SCENE,
  '6': KNIGHT_DRAGON_QUEST_SCENE,
  [SHORT_SAMPLE_1_SCENE.id]: SHORT_SAMPLE_1_SCENE,
  [MOONLIGHT_STORY_SCENE.id]: MOONLIGHT_STORY_SCENE,
  [MEADOW_PARTY_SCENE.id]: MEADOW_PARTY_SCENE,
  [CORNER_STORE_DAY_SCENE.id]: CORNER_STORE_DAY_SCENE,
  [MOONLIT_GARDEN_SCENE.id]: MOONLIT_GARDEN_SCENE,
  'moonlit-garden': MOONLIT_GARDEN_SCENE,
  [STRAWBERRY_BEACH_BIRTHDAY_SCENE.id]: STRAWBERRY_BEACH_BIRTHDAY_SCENE,
  'beach-birthday': STRAWBERRY_BEACH_BIRTHDAY_SCENE,
  [KNIGHT_DRAGON_QUEST_SCENE.id]: KNIGHT_DRAGON_QUEST_SCENE,
  'dragon-quest': KNIGHT_DRAGON_QUEST_SCENE,
};

export interface ParsedStudioParams {
  shortSample: ShortSampleId;
  scene: SceneDefinition;
  footageId: string | null;
  loopBounds: { start: number; end: number } | null;
  initialTimeSec: number;
  autoplay: boolean;
  autoExport: boolean;
  autoExportResolution: VideoExportResolution;
  vibrant: boolean;
  bookFrame: boolean;
  canonicalQuery: string;
}

const FOOTAGE_ALIASES: Record<string, number> = {
  morning: 0,
  arrival: 0,
  '1': 0,
  'act-1': 0,
  sunset: 1,
  song: 1,
  '2': 1,
  'act-2': 1,
  nightfall: 2,
  cake: 2,
  '3': 2,
  'act-3': 2,
  lullaby: 3,
  celebration: 3,
  '4': 3,
  'act-4': 3,
  goodnight: 4,
  '5': 4,
  'act-5': 4,
};

/**
 * Parses URL query parameters into a deterministic studio playback configuration.
 *
 * Supported parameters:
 *   `?short_sample=1|2|3|birthday` — select built-in scene (legacy)
 *   `?scene=<id|key>` — select any scene from SCENE_REGISTRY by key or scene.id
 *   `?footage=<act-id|alias>` — loop a single act
 *   `?vibrant=1|0` — enable/disable Vibrant Crayon Mode
 *   `?book_frame=1|0` — enable/disable Storybook Cover Opening & Ending/Credits Book-Frame
 *   `?t=<seconds>` — seek to a specific time
 *   `?autoplay=1|0` — autoplay on mount
 *   `?auto_export=1` — automatically trigger video export on mount
 *   `?resolution=1080p|720p` — video export resolution (used with auto_export)
 */
export function parseStudioUrlParams(
  search: string,
  fallbackScene?: SceneDefinition
): ParsedStudioParams {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const rawSample = params.get('short_sample')?.toLowerCase().trim() ?? null;
  const rawScene = params.get('scene')?.trim() ?? null;
  let shortSample: ShortSampleId = '1';

  // ?scene=<id> takes priority over ?short_sample=
  let resolvedScene: SceneDefinition | null = null;
  if (rawScene) {
    const byKey = SCENE_REGISTRY[rawScene];
    if (byKey) {
      resolvedScene = byKey;
    } else {
      // Also search by scene.id across all registry values
      const all = Object.values(SCENE_REGISTRY);
      const unique = all.filter((s, i) => all.findIndex((x) => x.id === s.id) === i);
      resolvedScene = unique.find((s) => s.id === rawScene) ?? null;
    }
  }

  if (!resolvedScene) {
    if (
      rawSample === '6' ||
      rawSample === 'dragon-quest' ||
      rawSample === 'knight-dragon-quest'
    ) {
      shortSample = '6';
    } else if (
      rawSample === '5' ||
      rawSample === 'beach-birthday' ||
      rawSample === 'strawberry-beach-birthday'
    ) {
      shortSample = '5';
    } else if (rawSample === '4') {
      shortSample = '4';
    } else if (rawSample === '3' || rawSample === 'birthday') {
      shortSample = '3';
    } else if (rawSample === '2') {
      shortSample = '2';
    } else if (rawSample === '1') {
      shortSample = '1';
    } else if (fallbackScene?.id === KNIGHT_DRAGON_QUEST_SCENE.id) {
      shortSample = '6';
    } else if (fallbackScene?.id === STRAWBERRY_BEACH_BIRTHDAY_SCENE.id) {
      shortSample = '5';
    } else if (fallbackScene?.id === CORNER_STORE_DAY_SCENE.id) {
      shortSample = '4';
    } else if (fallbackScene?.id === MEADOW_PARTY_SCENE.id) {
      shortSample = '3';
    } else if (fallbackScene?.id === MOONLIGHT_STORY_SCENE.id) {
      shortSample = '2';
    }
    resolvedScene = SCENE_REGISTRY[shortSample];
  } else {
    // Map resolvedScene back to a shortSample id for canonical URL building
    if (resolvedScene.id === KNIGHT_DRAGON_QUEST_SCENE.id) shortSample = '6';
    else if (resolvedScene.id === STRAWBERRY_BEACH_BIRTHDAY_SCENE.id) shortSample = '5';
    else if (resolvedScene.id === CORNER_STORE_DAY_SCENE.id) shortSample = '4';
    else if (resolvedScene.id === MEADOW_PARTY_SCENE.id) shortSample = '3';
    else if (resolvedScene.id === MOONLIGHT_STORY_SCENE.id) shortSample = '2';
    else shortSample = '1';
  }

  const scene = resolvedScene;
  const rawFootage = params.get('footage')?.toLowerCase().trim() ?? null;

  let footageId: string | null = null;
  let loopBounds: { start: number; end: number } | null = null;
  let initialTimeSec = 0;

  if (rawFootage && scene.acts.length > 0) {
    const actIdx = FOOTAGE_ALIASES[rawFootage];
    const matchedAct =
      actIdx !== undefined
        ? scene.acts[actIdx]
        : scene.acts.find((a) => a.id.toLowerCase() === rawFootage);
    if (matchedAct) {
      footageId = matchedAct.id;
      loopBounds = { start: matchedAct.startTime, end: matchedAct.endTime };
      initialTimeSec = matchedAct.startTime + 0.4;
    }
  }

  const rawT = params.get('t');
  const hasExplicitT = rawT !== null && !Number.isNaN(parseFloat(rawT));
  if (hasExplicitT) {
    initialTimeSec = Math.max(
      0,
      Math.min(scene.durationSec, parseFloat(rawT!))
    );
  }

  const rawAutoplay = params.get('autoplay');
  let autoplay = false;
  if (rawAutoplay === '1' || rawAutoplay === 'true') {
    autoplay = true;
  } else if (rawAutoplay === '0' || rawAutoplay === 'false') {
    autoplay = false;
  } else if (!hasExplicitT && (rawSample !== null || rawScene !== null || rawFootage !== null)) {
    autoplay = true;
  }

  // ?auto_export=1 triggers automatic video export on mount
  const rawAutoExport = params.get('auto_export');
  const autoExport = rawAutoExport === '1' || rawAutoExport === 'true';

  // ?resolution=1080p|720p for auto_export
  const rawResolution = params.get('resolution')?.toLowerCase().trim();
  const autoExportResolution: VideoExportResolution =
    rawResolution === '720p' ? '720p' : '1080p';

  const rawVibrant = params.get('vibrant') ?? params.get('mode');
  let vibrant = Boolean(scene.vibrantMode);
  if (
    rawVibrant === '1' ||
    rawVibrant === 'true' ||
    rawVibrant === 'vibrant'
  ) {
    vibrant = true;
  } else if (
    rawVibrant === '0' ||
    rawVibrant === 'false' ||
    rawVibrant === 'classic'
  ) {
    vibrant = false;
  }

  const rawBookFrame = params.get('book_frame') ?? params.get('bookFrame');
  let bookFrame =
    scene.bookFrame === false
      ? false
      : typeof scene.bookFrame === 'object' && scene.bookFrame !== null
      ? scene.bookFrame.enabled ?? true
      : true;
  if (rawBookFrame === '1' || rawBookFrame === 'true') {
    bookFrame = true;
  } else if (rawBookFrame === '0' || rawBookFrame === 'false') {
    bookFrame = false;
  }

  const baseQuery = rawScene
    ? `?scene=${encodeURIComponent(rawScene)}`
    : footageId
    ? `?short_sample=${shortSample}&footage=${footageId}`
    : `?short_sample=${shortSample}`;
  const canonicalQuery =
    rawVibrant !== null && !scene.vibrantMode
      ? `${baseQuery}&vibrant=${vibrant ? '1' : '0'}`
      : baseQuery;

  return {
    shortSample,
    scene,
    footageId,
    loopBounds,
    initialTimeSec,
    autoplay,
    autoExport,
    autoExportResolution,
    vibrant,
    bookFrame,
    canonicalQuery,
  };
}

export interface AssetCatalogItem {
  id: string;
  title: string;
  category: 'Building' | 'Character' | 'Prop';
  caption: string;
  viewBox: string;
  jumpToTimeSec: number;
  states?: CharacterState[];
  defaultState?: CharacterState;
  renderInner: (frameIndex: number, state?: CharacterState) => string;
}

export const ASSET_CATALOG_ITEMS: readonly AssetCatalogItem[] = [
  {
    id: 'cat-sun',
    title: 'Expressive Crayon Sun',
    category: 'Character',
    caption: 'Bright yellow morning Sun that turns warm orange, yawns sleepily at sunset & sleeps.',
    viewBox: '-135 -135 270 270',
    jumpToTimeSec: 2.0,
    states: ['awake', 'sleepy', 'sleeping', 'blinking'],
    defaultState: 'awake',
    renderInner: (frameIndex, state = 'awake') =>
      renderCharacter({
        kind: 'sun',
        state,
        frameIndex,
      }),
  },
  {
    id: 'cat-moon',
    title: 'Crescent Moon with Stars & Nightcap',
    category: 'Character',
    caption: 'Warm yellow pastel Crescent Moon with dangling & twinkling stars, rosy cheeks & nightcap.',
    viewBox: '-115 -185 230 290',
    jumpToTimeSec: 27.5,
    states: ['sleeping', 'grumpy', 'awake', 'curious', 'blinking'],
    defaultState: 'sleeping',
    renderInner: (frameIndex, state = 'sleeping') =>
      renderCharacter({
        kind: 'moon',
        state,
        frameIndex,
        wearingNightcap: state === 'sleeping' || state === 'blinking',
      }),
  },
  {
    id: 'cat-little-girl',
    title: 'Little Girl in Star Sweater',
    category: 'Character',
    caption: 'Wavy brown hair with pink hairclip, purple star sweater, cream wide-leg trousers & sheep/pizza.',
    viewBox: '-36 -95 72 108',
    jumpToTimeSec: 22.0,
    states: ['singing', 'climbing', 'waving', 'walking', 'looking_up'],
    defaultState: 'singing',
    renderInner: (frameIndex, state = 'singing') =>
      renderCharacter({
        kind: 'little_girl',
        state,
        frameIndex,
        holdingSheep: true,
      }),
  },
  {
    id: 'cat-ochre-cottage',
    title: 'Cute & Cozy Ochre Cottage',
    category: 'Building',
    caption: 'Scalloped terracotta roof, welcome wreath door, overflowing flower boxes, shutters & ladder.',
    viewBox: '-190 -272 375 282',
    jumpToTimeSec: 8.5,
    renderInner: () =>
      renderBuilding({
        kind: 'ochre_cottage',
        windowLit: true,
        showLadder: true,
      }),
  },
  {
    id: 'cat-corner-store',
    title: 'Little Corner Store ("LUNE STORE")',
    category: 'Building',
    caption: 'Pastel teal storefront, red-and-cream striped crayon awning & bakery window.',
    viewBox: '-155 -215 330 225',
    jumpToTimeSec: 3.5,
    renderInner: () =>
      renderBuilding({
        kind: 'corner_store',
        windowLit: true,
        signText: 'LUNE STORE',
      }),
  },
  {
    id: 'cat-shopkeeper',
    title: 'Village Shopkeeper / Baker',
    category: 'Character',
    caption: 'Friendly baker in cream apron & cap outside the Little Corner Store.',
    viewBox: '-36 -108 72 115',
    jumpToTimeSec: 3.0,
    states: ['waving', 'idle', 'looking_up'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({
        kind: 'shopkeeper',
        state,
        frameIndex,
      }),
  },
  {
    id: 'cat-village-cat',
    title: 'Cozy Patched Kitten',
    category: 'Character',
    caption: 'Soft cream-white kitten with dark tabby patches, pink inner ears & golden collar bell.',
    viewBox: '-30 -38 60 46',
    jumpToTimeSec: 4.0,
    states: ['curious', 'sleeping', 'idle'],
    defaultState: 'curious',
    renderInner: (frameIndex, state = 'curious') =>
      renderCharacter({
        kind: 'cat',
        state,
        frameIndex,
      }),
  },
  {
    id: 'cat-music-notes',
    title: 'Stepped Music Notes (♪ ♫)',
    category: 'Prop',
    caption: 'Hand-drawn eighth notes hopping upward at 6 FPS from the rooftop.',
    viewBox: '-20 -115 95 130',
    jumpToTimeSec: 22.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'music_notes', frameIndex, count: 3 }),
  },
  {
    id: 'cat-pencil-numbers',
    title: 'Pencil Counting Numbers (1 2 3 4 5)',
    category: 'Prop',
    caption: 'Faint charcoal pencil numbers counting stars in the indigo night sky.',
    viewBox: '-15 -32 195 55',
    jumpToTimeSec: 23.8,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'pencil_numbers', frameIndex, count: 5 }),
  },
  {
    id: 'cat-tree',
    title: 'Leafy Crayon Tree',
    category: 'Prop',
    caption: 'Puffy green crayon foliage crown with warm paper-tooth streaks.',
    viewBox: '-65 -142 130 150',
    jumpToTimeSec: 2.5,
    renderInner: (frameIndex) => renderProp({ kind: 'tree', frameIndex }),
  },
  {
    id: 'cat-apple-crate',
    title: 'Storefront Apple Crate',
    category: 'Prop',
    caption: 'Wooden slatted crate overflowing with red & terracotta crayon apples.',
    viewBox: '-35 -45 70 52',
    jumpToTimeSec: 3.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'apple_crate', frameIndex }),
  },
  {
    id: 'cat-bicycle',
    title: 'Red Crayon Bicycle',
    category: 'Prop',
    caption: 'Storybook bicycle with wicker basket parked outside the store.',
    viewBox: '-46 -54 92 60',
    jumpToTimeSec: 3.5,
    renderInner: (frameIndex) => renderProp({ kind: 'bicycle', frameIndex }),
  },
  {
    id: 'cat-lantern',
    title: 'Glowing Street Lantern',
    category: 'Prop',
    caption: 'Wrought-iron street lantern with dashed warm yellow crayon halo.',
    viewBox: '-22 -136 74 144',
    jumpToTimeSec: 7.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'street_lantern', frameIndex, lit: true }),
  },
  {
    id: 'cat-singing-radish',
    title: 'Singing Radish Star (Cutout)',
    category: 'Character',
    caption: 'Red-orange crayon radish with emerald leaf ponytails, blue hair ties & microphone.',
    viewBox: '-130 -255 290 270',
    jumpToTimeSec: 8.0,
    states: ['singing', 'waving', 'idle'],
    defaultState: 'singing',
    renderInner: (frameIndex, state = 'singing') =>
      renderCharacter({ kind: 'singing_radish', state, frameIndex }),
  },
  {
    id: 'cat-watermelon-slice',
    title: 'Watermelon Slice Dancer (Cutout)',
    category: 'Character',
    caption: 'Red-pink watermelon slice with black seeds, emerald rind & red pom-pom party hat.',
    viewBox: '-55 -160 110 175',
    jumpToTimeSec: 4.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'watermelon_slice', state, frameIndex }),
  },
  {
    id: 'cat-blue-party-cat',
    title: 'Blue Party Cat (Cutout)',
    category: 'Character',
    caption: 'Seated sky-blue crayon cat with royal-blue whiskers & striped party hat.',
    viewBox: '-45 -150 110 165',
    jumpToTimeSec: 5.0,
    states: ['sitting', 'blinking', 'idle'],
    defaultState: 'sitting',
    renderInner: (frameIndex, state = 'sitting') =>
      renderCharacter({ kind: 'blue_party_cat', state, frameIndex }),
  },
  {
    id: 'cat-hello-bug',
    title: 'Friendly "Hi" Berry Bug (Cutout)',
    category: 'Character',
    caption: 'Dark-indigo berry bug with antennae, red head bar & hand-lettered "Hi".',
    viewBox: '-60 -138 125 150',
    jumpToTimeSec: 3.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'hello_bug', state, frameIndex }),
  },
  {
    id: 'cat-party-banana',
    title: 'Party Hat Banana (Cutout)',
    category: 'Character',
    caption: 'Curved bright yellow crayon banana wearing an orange cone party hat.',
    viewBox: '-78 -98 168 115',
    jumpToTimeSec: 9.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'party_banana', state, frameIndex }),
  },
  {
    id: 'cat-crying-onion',
    title: 'Crying Onion in Party Hat (Cutout)',
    category: 'Character',
    caption: 'Teardrop bulb in a blue patterned cone hat with worried brows & cyan teardrops.',
    viewBox: '-46 -118 92 132',
    jumpToTimeSec: 11.0,
    states: ['idle', 'waving'],
    defaultState: 'idle',
    renderInner: (frameIndex, state = 'idle') =>
      renderCharacter({ kind: 'crying_onion', state, frameIndex }),
  },
  {
    id: 'cat-cherry-twins',
    title: 'Cherry Twins in Party Hats (Cutout)',
    category: 'Character',
    caption: 'Two rosy-pink cherries joined by green V-stems wearing orange cone party hats.',
    viewBox: '-62 -100 126 112',
    jumpToTimeSec: 12.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'cherry_twins', state, frameIndex }),
  },
  {
    id: 'cat-acorn-twins',
    title: 'Acorn Twins (Cutout)',
    category: 'Character',
    caption: 'Golden-ochre acorn buddies holding hands with brown caps & green leaf sprouts.',
    viewBox: '-56 -96 112 110',
    jumpToTimeSec: 6.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'acorn_twins', state, frameIndex }),
  },
  {
    id: 'cat-olive-sprout',
    title: 'Little Olive Sprout (Cutout)',
    category: 'Character',
    caption: 'Small dark-green oval character with white tummy face & red-tipped topknot.',
    viewBox: '-42 -94 84 108',
    jumpToTimeSec: 14.0,
    states: ['waving', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'olive_sprout', state, frameIndex }),
  },
  {
    id: 'cat-birthday-strawberry',
    title: 'Birthday Strawberry Guest of Honor (Cutout)',
    category: 'Character',
    caption: 'Plump red strawberry with yellow seeds, leafy green calyx collar & golden birthday crown.',
    viewBox: '-64 -138 128 152',
    jumpToTimeSec: 8.5,
    states: ['waving', 'singing', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'birthday_strawberry', state, frameIndex }),
  },
  {
    id: 'cat-birthday-cake',
    title: 'Two-Tier Strawberry Birthday Cake',
    category: 'Prop',
    caption: 'Vanilla & strawberry-pink frosted cake with 3 flickering candles that blow out into smoke.',
    viewBox: '-76 -112 152 126',
    jumpToTimeSec: 14.5,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'birthday_cake', frameIndex, lit: true }),
  },
  {
    id: 'cat-party-confetti',
    title: 'Festive Party Confetti & Streamers',
    category: 'Prop',
    caption: 'Colorful crayon ribbons, stars & paper diamonds fluttering at 6 FPS.',
    viewBox: '-220 -95 440 220',
    jumpToTimeSec: 19.5,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'party_confetti', frameIndex, count: 18 }),
  },
  {
    id: 'cat-beach-umbrella',
    title: 'Striped Crayon Beach Umbrella',
    category: 'Prop',
    caption: 'Scalloped red, yellow & sky-blue crayon umbrella on an angled wooden beach pole.',
    viewBox: '-125 -192 230 210',
    jumpToTimeSec: 2.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'beach_umbrella', frameIndex, variant: 1 }),
  },
  {
    id: 'cat-ocean-waves',
    title: 'Scalloped Ocean Waves & Sea Foam',
    category: 'Prop',
    caption: 'Stepped 6 FPS rolling turquoise wave crests & frothy white shoreline foam.',
    viewBox: '-160 -32 320 140',
    jumpToTimeSec: 20.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'ocean_waves', frameIndex, variant: 1, count: 3 }),
  },
  {
    id: 'cat-water-splash',
    title: 'Bubbly Crayon Water Splash',
    category: 'Prop',
    caption: 'Stepped 6 FPS splash crown, flying water droplets & expanding ripple rings.',
    viewBox: '-80 -75 160 98',
    jumpToTimeSec: 12.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'water_splash', frameIndex, variant: 1, count: 7 }),
  },
  {
    id: 'cat-swim-floatie',
    title: 'Rubber-Ducky & Striped Swim Floatie',
    category: 'Prop',
    caption: 'Inflatable wax-crayon swim ring worn around characters in the ocean or stacked on sand.',
    viewBox: '-60 -52 120 76',
    jumpToTimeSec: 22.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'swim_floatie', frameIndex, variant: 0 }),
  },
  {
    id: 'cat-beach-ball',
    title: 'Colorful 6-Panel Crayon Beach Ball',
    category: 'Prop',
    caption: 'Spinning multi-panel wax-crayon beach ball tossed between friends in the waves.',
    viewBox: '-38 -38 76 76',
    jumpToTimeSec: 24.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'beach_ball', frameIndex, variant: 1 }),
  },
  {
    id: 'cat-pizza-slice',
    title: 'Hot Cheesy Pepperoni Pizza Slice',
    category: 'Prop',
    caption: 'Golden-crust pepperoni pizza slice with melted cheese, basil leaf & rising steam wisps.',
    viewBox: '-38 -70 76 78',
    jumpToTimeSec: 12.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'pizza_slice', frameIndex, variant: 1, lit: true }),
  },
  {
    id: 'cat-knight',
    title: 'Sir Leo the Crayon Knight on Horseback',
    category: 'Character',
    caption: 'Brave mounted knight in sky-blue armor, plumed helmet, star shield & lance on a cream steed.',
    viewBox: '-75 -132 150 142',
    jumpToTimeSec: 6.8,
    states: ['walking', 'waving', 'sitting', 'idle'],
    defaultState: 'walking',
    renderInner: (frameIndex, state = 'walking') =>
      renderCharacter({ kind: 'knight', state, frameIndex }),
  },
  {
    id: 'cat-soldier',
    title: 'Royal Mounted Soldier on Horseback',
    category: 'Character',
    caption: 'Loyal mounted soldier in royal-blue tunic, kettle helmet, round shield & pennant spear.',
    viewBox: '-70 -122 140 132',
    jumpToTimeSec: 9.0,
    states: ['walking', 'waving', 'sitting', 'idle'],
    defaultState: 'walking',
    renderInner: (frameIndex, state = 'walking') =>
      renderCharacter({ kind: 'soldier', state, frameIndex }),
  },
  {
    id: 'cat-dragon',
    title: 'Barnaby the Cute Forest Dragon',
    category: 'Character',
    caption: 'Emerald-green storybook dragon with ochre belly, scalloped wings, crooked tooth & dizzy stars.',
    viewBox: '-115 -152 230 165',
    jumpToTimeSec: 33.5,
    states: ['waving', 'awake', 'grumpy', 'sitting', 'walking'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'dragon', state, frameIndex }),
  },
  {
    id: 'cat-villager',
    title: 'Castle Herald & Medieval Villager',
    category: 'Character',
    caption: 'Medieval villager & herald in terracotta/sage tunic, feathered beret cap & parchment scroll.',
    viewBox: '-36 -105 72 115',
    jumpToTimeSec: 4.5,
    states: ['waving', 'walking', 'grumpy', 'singing', 'idle'],
    defaultState: 'waving',
    renderInner: (frameIndex, state = 'waving') =>
      renderCharacter({ kind: 'villager', state, frameIndex }),
  },
  {
    id: 'cat-royal-castle',
    title: 'Royal Crayon Stone Castle',
    category: 'Building',
    caption: 'Crenellated stone keep, twin turret towers with conical roofs, portcullis gate & festive banners.',
    viewBox: '-195 -338 390 348',
    jumpToTimeSec: 2.0,
    renderInner: () =>
      renderBuilding({ kind: 'royal_castle', windowLit: true }),
  },
  {
    id: 'cat-scorched-cottage',
    title: 'Scorched Village Cottage',
    category: 'Building',
    caption: 'Damaged village cottage with soot smudges, crooked roof tiles, tilted shutter & rising smoke wisps.',
    viewBox: '-160 -272 320 282',
    jumpToTimeSec: 25.0,
    renderInner: () =>
      renderBuilding({ kind: 'scorched_cottage', windowLit: false }),
  },
  {
    id: 'cat-campfire',
    title: "Woodland Campfire & Knight's Tent",
    category: 'Prop',
    caption: 'Striped ochre & terracotta medieval tent with crackling campfire logs & flickering crayon flames.',
    viewBox: '-165 -140 215 155',
    jumpToTimeSec: 16.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'campfire', frameIndex, lit: true }),
  },
  {
    id: 'cat-spooky-tree',
    title: 'Gnarled Whispering Woods Tree',
    category: 'Prop',
    caption: 'Twisted woodland tree with reaching branches, dark foliage & peeking golden firefly eyes.',
    viewBox: '-95 -205 190 215',
    jumpToTimeSec: 34.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'spooky_tree', frameIndex, variant: 1 }),
  },
  {
    id: 'cat-dragon-fire',
    title: 'Crayon Dragon Fire & Clash Sparks',
    category: 'Prop',
    caption: 'Swirling red, orange & yellow wax-crayon flame plume with golden star clash sparks.',
    viewBox: '-95 -58 160 105',
    jumpToTimeSec: 34.0,
    renderInner: (frameIndex) =>
      renderProp({ kind: 'dragon_fire', frameIndex, lit: true }),
  },
];

/**
 * Renders a standalone SVG preview card for an AssetCatalogItem.
 */
export function renderAssetPreviewSvg(
  item: AssetCatalogItem,
  frameIndex = 0,
  stateOverride?: CharacterState
): string {
  const [vx, vy, vw, vh] = item.viewBox.split(' ').map(Number);
  return svgEl(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: item.viewBox,
      width: '100%',
      height: '100%',
      class: 'asset-preview-svg',
    },
    [
      svgEl('rect', {
        x: vx,
        y: vy,
        width: vw,
        height: vh,
        fill: TOKENS.colors.paperWarm,
      }),
      item.renderInner(frameIndex, stateOverride ?? item.defaultState),
    ]
  );
}

export interface StorybookStudioController {
  play: () => void;
  pause: () => void;
  seek: (timeSec: number) => void;
  applyUrlQuery: (query: string) => void;
  setOptions: (opts: Partial<RenderSceneOptions>) => void;
  getState: () => {
    shortSample: ShortSampleId;
    footageId: string | null;
    currentTimeSec: number;
    isPlaying: boolean;
    fps: number;
    options: RenderSceneOptions;
  };
  destroy: () => void;
}

/**
 * Mounts the interactive Picture-Book Crayon Video Engine Studio into `container`.
 */
export function mountStorybookStudio(
  container: HTMLElement,
  initialScene: SceneDefinition = SHORT_SAMPLE_1_SCENE
): StorybookStudioController {
  const initialSearch =
    typeof window !== 'undefined' ? window.location.search : '';
  let studioConfig = parseStudioUrlParams(initialSearch, initialScene);

  let activeScene: SceneDefinition = studioConfig.scene;
  let currentTimeSec = studioConfig.initialTimeSec;
  let loopBounds = studioConfig.loopBounds;
  let isPlaying = false;
  let activeFps: number = activeScene.fps ?? TOKENS.timing.fps;
  let rafId: number | null = null;
  let lastPerfTime = 0;
  let lastRenderedKey = '';
  let prevQuantizedTime = -1;

  const renderOptions: RenderSceneOptions = {
    enableCrayonFilter: true,
    enablePaperTexture: true,
    enableProgressiveFill: true,
    vibrant: studioConfig.vibrant,
    enableBookFrame: studioConfig.bookFrame,
    overrideFillProgress: undefined,
  };

  const characterStateOverrides = new Map<string, CharacterState>();
  let activeCatalogFilter: 'ALL' | 'Building' | 'Character' | 'Prop' = 'ALL';

  const soundEngine = new PictureBookSoundEngine({ muted: false });

  container.innerHTML = `
    <div class="studio-shell">
      <header class="studio-header">
        <div class="studio-title-group">
          <h1 id="header-scene-title">🖍️ ${activeScene.title}</h1>
          <p id="header-scene-subtitle">${activeScene.subtitle ?? ''}</p>
        </div>
        <div class="telemetry-badges">
          <span class="badge badge-accent" id="badge-url">${studioConfig.canonicalQuery}</span>
          <span class="badge" id="badge-aspect">16:9 (${TOKENS.canvas.width}×${TOKENS.canvas.height})</span>
          <span class="badge" id="badge-act">Act I</span>
          <span class="badge" id="badge-frame">Frame #0</span>
          <span class="badge" id="badge-seed">Boil Seed #1</span>
          <span class="badge" id="badge-fps">6 FPS Stepped</span>
        </div>
      </header>

      <!-- Shareable URL Parameter & Footage Switcher Bar -->
      <nav class="panel-card" style="margin-bottom: 16px; padding: 10px 14px;" aria-label="Shareable URL Parameter Switcher">
        <div class="preset-row" id="url-switcher-row">
          <span class="preset-label">🔗 URL Footage Parameters:</span>
          <a href="?short_sample=1" class="btn btn-sm" data-url-query="?short_sample=1">🎬 ?short_sample=1 (Full 30s Sun→Moon Story)</a>
          <a href="?short_sample=1&footage=morning" class="btn btn-sm" data-url-query="?short_sample=1&footage=morning">☀️ ?short_sample=1&footage=morning</a>
          <a href="?short_sample=1&footage=sunset" class="btn btn-sm" data-url-query="?short_sample=1&footage=sunset">🌅 ?short_sample=1&footage=sunset</a>
          <a href="?short_sample=1&footage=nightfall" class="btn btn-sm" data-url-query="?short_sample=1&footage=nightfall">🌆 ?short_sample=1&footage=nightfall</a>
          <a href="?short_sample=1&footage=lullaby" class="btn btn-sm" data-url-query="?short_sample=1&footage=lullaby">🎵 ?short_sample=1&footage=lullaby</a>
          <a href="?short_sample=1&footage=goodnight" class="btn btn-sm" data-url-query="?short_sample=1&footage=goodnight">🌙 ?short_sample=1&footage=goodnight</a>
          <a href="?short_sample=1&vibrant=1" class="btn btn-sm" data-url-query="?short_sample=1&vibrant=1">🌈 ?short_sample=1&vibrant=1</a>
          <a href="?short_sample=2" class="btn btn-sm" data-url-query="?short_sample=2">🏪 ?short_sample=2 (Corner Store Scene)</a>
          <a href="?short_sample=3" class="btn btn-sm" data-url-query="?short_sample=3">🎂 ?short_sample=3 (Strawberry's Birthday Party)</a>
          <a href="?short_sample=3&footage=song" class="btn btn-sm" data-url-query="?short_sample=3&footage=song">🎵 ?short_sample=3&footage=song</a>
          <a href="?short_sample=3&footage=cake" class="btn btn-sm" data-url-query="?short_sample=3&footage=cake">🕯️ ?short_sample=3&footage=cake</a>
          <a href="?short_sample=3&footage=celebration" class="btn btn-sm" data-url-query="?short_sample=3&footage=celebration">🎊 ?short_sample=3&footage=celebration</a>
          <a href="?scene=corner-store-day" class="btn btn-sm" data-url-query="?scene=corner-store-day">🏪 ?scene=corner-store-day (Corner Store Day)</a>
          <a href="?scene=strawberry-beach-birthday" class="btn btn-sm" data-url-query="?scene=strawberry-beach-birthday">🏖️ ?scene=strawberry-beach-birthday</a>
          <a href="?scene=knight-dragon-quest" class="btn btn-sm" data-url-query="?scene=knight-dragon-quest">🐉 ?scene=knight-dragon-quest (Sir Leo &amp; Dragon Quest)</a>
        </div>
      </nav>

      <div class="studio-grid">
        <!-- Left Main Stage & Transport -->
        <section class="panel-card">
          <div class="storybook-stage" id="storybook-stage"></div>

          <div class="caption-banner">
            <div class="caption-act" id="caption-act-title"></div>
            <div class="caption-text" id="caption-act-text"></div>
          </div>

          <div class="transport-bar">
            <button class="btn btn-primary" id="btn-play-pause" type="button">▶ Play Story</button>
            <button class="btn" id="btn-restart" type="button">⏮ 0.0s</button>
            <div class="scrubber-wrap">
              <input
                type="range"
                id="timeline-scrubber"
                min="0"
                max="${activeScene.durationSec}"
                step="0.05"
                value="${currentTimeSec}"
                aria-label="Story timeline scrubber"
              />
              <span class="time-readout" id="time-readout">0.0s / ${activeScene.durationSec}.0s</span>
            </div>
            <button class="btn" id="btn-fps" type="button">6 FPS</button>
            <button class="btn" id="btn-mute" type="button">🔊 Sound On</button>
            <button class="btn" id="btn-fullscreen" type="button" title="Toggle 16:9 Fullscreen Stage">⛶ 16:9 Fullscreen</button>
          </div>

          <div class="export-bar" id="video-export-bar">
            <span class="preset-label">🎥 Full-Screen 16:9 Video Download:</span>
            <select id="select-video-res" class="btn btn-sm" aria-label="16:9 video export resolution">
              <option value="1080p" selected>1080p Full HD (1920×1080 16:9)</option>
              <option value="720p">720p HD (1280×720 16:9)</option>
            </select>
            <button class="btn btn-primary btn-sm" id="btn-download-video" type="button">⬇ Download 16:9 Video (with Sound)</button>
            <button class="btn btn-sm" id="btn-cancel-video" type="button" style="display: none;">✖ Cancel</button>
            <span class="badge" id="video-export-status" style="display: none;">Ready</span>
          </div>

          <div class="preset-group">
            <div class="preset-row" id="act-buttons-row"></div>
          </div>
        </section>

        <!-- Right Sidebar: 3-Layer Stack & Stop-Motion Fill Inspector -->
        <aside class="panel-card">
          <div class="inspector-section">
            <h2>🎨 Mandatory 3-Layer Stack & Vibrant Mode</h2>
            <div class="control-row">
              <label>
                <input type="checkbox" checked disabled />
                Layer 1: Base Cutouts & Warm Paper (#F4EFE6)
              </label>
            </div>
            <div class="control-row">
              <label>
                <input type="checkbox" id="chk-crayon-filter" checked />
                Layer 2: #crayon-stroke Line-Boil Filter
              </label>
            </div>
            <div class="control-row">
              <label>
                <input type="checkbox" id="chk-paper-texture" checked />
                Layer 3: Cold-Press Paper Multiply & Flecks
              </label>
            </div>
            <div class="control-row" style="margin-top: 6px; padding-top: 6px; border-top: 1.5px dashed var(--paper-deep);">
              <label style="font-weight: 700; color: var(--terracotta);">
                <input type="checkbox" id="chk-vibrant-mode" ${renderOptions.vibrant ? 'checked' : ''} />
                🌈 Vibrant Crayon Mode (#vibrant-grade)
              </label>
            </div>
            <div class="control-row">
              <label style="font-weight: 700; color: var(--charcoal);">
                <input type="checkbox" id="chk-book-frame" ${renderOptions.enableBookFrame !== false ? 'checked' : ''} />
                📖 Book Cover & Credits (Opening/Ending)
              </label>
            </div>
          </div>

          <div class="inspector-section">
            <h2>🖌️ Stop-Motion Coloring Fill</h2>
            <div class="control-row">
              <label>
                <input type="checkbox" id="chk-progressive-fill" checked />
                Enable Stepped Stop-Motion Fill Masks
              </label>
            </div>
            <div class="fill-scrub-box">
              <div class="control-row">
                <label>
                  <input type="checkbox" id="chk-manual-fill" />
                  Manual Coloring Scrub Override
                </label>
                <span class="badge" id="badge-fill-pct">Timeline Auto</span>
              </div>
              <input
                type="range"
                id="slider-manual-fill"
                min="0"
                max="1"
                step="0.1"
                value="0.6"
                disabled
                style="width: 100%; accent-color: var(--indigo-night);"
                aria-label="Manual stop-motion fill progress"
              />
              <p class="asset-desc" style="margin-top: 6px;">
                Drag in 10% stop-motion increments to watch the sunset, indigo night sky, and roofs color in stroke-by-stroke!
              </p>
            </div>
          </div>

          <div class="inspector-section">
            <h2>🔊 Birthday & Storybook SFX Audition</h2>
            <div class="preset-row" id="sfx-audition-row" style="gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-sm" data-sfx-kind="party_horn" data-sfx-freq="440" data-sfx-dur="0.45" type="button">🎉 Party Horn</button>
              <button class="btn btn-sm" data-sfx-kind="confetti_pop" data-sfx-freq="523.25" data-sfx-dur="0.5" type="button">🎊 Confetti Pop</button>
              <button class="btn btn-sm" data-sfx-kind="candle_blow" data-sfx-freq="480" data-sfx-dur="0.7" type="button">🕯️ Blow Candles</button>
              <button class="btn btn-sm" data-sfx-kind="cheer_applause" data-sfx-freq="523.25" data-sfx-dur="0.8" type="button">👏 Cheer & Clap</button>
              <button class="btn btn-sm" data-sfx-kind="giggle" data-sfx-freq="659.25" data-sfx-dur="0.32" type="button">😄 Giggle</button>
              <button class="btn btn-sm" data-sfx-kind="birthday_song" data-sfx-freq="523.25" data-sfx-dur="0.55" type="button">🎵 Birthday Note</button>
              <button class="btn btn-sm" data-sfx-kind="ocean_wave" data-sfx-freq="220" data-sfx-dur="1.2" type="button">🌊 Ocean Wave</button>
              <button class="btn btn-sm" data-sfx-kind="water_splash" data-sfx-freq="460" data-sfx-dur="0.48" type="button">💦 Water Splash</button>
              <button class="btn btn-sm" data-sfx-kind="floatie_squeak" data-sfx-freq="740" data-sfx-dur="0.34" type="button">🦆 Floatie Squeak</button>
            </div>
          </div>

          <div class="inspector-section">
            <h2>📋 Live Node Telemetry</h2>
            <div id="node-telemetry-list" style="font-family: var(--font-mono); font-size: 0.78rem;"></div>
          </div>
        </aside>
      </div>

      <!-- Bottom Reusable Asset Catalog -->
      <section class="panel-card catalog-section">
        <div class="catalog-header">
          <div>
            <h2 style="margin: 0;">🏠 Reusable Storybook Asset Library (Buildings, People, Sun, Moon & Objects)</h2>
            <p class="asset-desc">All assets share centralized tokens, dry-crayon/marker SVG patterns, and 6 FPS stepped line-boil.</p>
          </div>
          <div class="preset-row" id="catalog-filter-row">
            <button class="btn btn-sm btn-active" data-cat-filter="ALL" type="button">All (${ASSET_CATALOG_ITEMS.length})</button>
            <button class="btn btn-sm" data-cat-filter="Building" type="button">Buildings & Store</button>
            <button class="btn btn-sm" data-cat-filter="Character" type="button">People, Sun & Moon</button>
            <button class="btn btn-sm" data-cat-filter="Prop" type="button">Objects & Props</button>
          </div>
        </div>
        <div class="catalog-grid" id="catalog-grid"></div>
      </section>
    </div>
  `;

  const headerTitleEl =
    container.querySelector<HTMLElement>('#header-scene-title')!;
  const headerSubtitleEl = container.querySelector<HTMLElement>(
    '#header-scene-subtitle'
  )!;
  const badgeUrlEl = container.querySelector<HTMLElement>('#badge-url')!;
  const stageEl = container.querySelector<HTMLElement>('#storybook-stage')!;
  const badgeActEl = container.querySelector<HTMLElement>('#badge-act')!;
  const badgeFrameEl = container.querySelector<HTMLElement>('#badge-frame')!;
  const badgeSeedEl = container.querySelector<HTMLElement>('#badge-seed')!;
  const badgeFpsEl = container.querySelector<HTMLElement>('#badge-fps')!;
  const captionTitleEl =
    container.querySelector<HTMLElement>('#caption-act-title')!;
  const captionTextEl =
    container.querySelector<HTMLElement>('#caption-act-text')!;
  const btnPlayPause =
    container.querySelector<HTMLButtonElement>('#btn-play-pause')!;
  const btnRestart =
    container.querySelector<HTMLButtonElement>('#btn-restart')!;
  const scrubberEl =
    container.querySelector<HTMLInputElement>('#timeline-scrubber')!;
  const timeReadoutEl =
    container.querySelector<HTMLElement>('#time-readout')!;
  const btnFps = container.querySelector<HTMLButtonElement>('#btn-fps')!;
  const btnMute = container.querySelector<HTMLButtonElement>('#btn-mute')!;
  const btnFullscreen =
    container.querySelector<HTMLButtonElement>('#btn-fullscreen')!;
  const selectVideoRes =
    container.querySelector<HTMLSelectElement>('#select-video-res')!;
  const btnDownloadVideo =
    container.querySelector<HTMLButtonElement>('#btn-download-video')!;
  const btnCancelVideo =
    container.querySelector<HTMLButtonElement>('#btn-cancel-video')!;
  const videoExportStatusEl = container.querySelector<HTMLElement>(
    '#video-export-status'
  )!;
  let exportAbortController: AbortController | null = null;
  const actButtonsRowEl =
    container.querySelector<HTMLElement>('#act-buttons-row')!;
  const chkCrayonFilter =
    container.querySelector<HTMLInputElement>('#chk-crayon-filter')!;
  const chkPaperTexture =
    container.querySelector<HTMLInputElement>('#chk-paper-texture')!;
  const chkVibrantMode =
    container.querySelector<HTMLInputElement>('#chk-vibrant-mode')!;
  const chkBookFrame =
    container.querySelector<HTMLInputElement>('#chk-book-frame')!;
  const chkProgressiveFill = container.querySelector<HTMLInputElement>(
    '#chk-progressive-fill'
  )!;
  const chkManualFill =
    container.querySelector<HTMLInputElement>('#chk-manual-fill')!;
  const sliderManualFill = container.querySelector<HTMLInputElement>(
    '#slider-manual-fill'
  )!;
  const badgeFillPct =
    container.querySelector<HTMLElement>('#badge-fill-pct')!;
  const telemetryListEl = container.querySelector<HTMLElement>(
    '#node-telemetry-list'
  )!;
  const catalogGridEl =
    container.querySelector<HTMLElement>('#catalog-grid')!;

  function renderActButtons(): void {
    actButtonsRowEl.innerHTML = `
      <span class="preset-label">Story Beats (${activeScene.id}):</span>
      ${activeScene.acts
        .map(
          (act, idx) =>
            `<button class="btn btn-sm" data-seek="${act.startTime + 0.4}" data-act-id="${act.id}" type="button">Act ${idx + 1}: ${act.title.split('·')[1]?.trim() ?? act.title} (${act.startTime}s)</button>`
        )
        .join('')}
    `;
    actButtonsRowEl
      .querySelectorAll<HTMLButtonElement>('[data-seek]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          loopBounds = null;
          const target = parseFloat(btn.dataset.seek ?? '0');
          seek(target);
        });
      });
  }

  function updateUrlSwitcherHighlight(): void {
    container
      .querySelectorAll<HTMLAnchorElement>('[data-url-query]')
      .forEach((link) => {
        link.classList.toggle(
          'btn-active',
          link.dataset.urlQuery === studioConfig.canonicalQuery
        );
      });
  }

  function renderCatalogCards(frameIndex: number): void {
    const items = ASSET_CATALOG_ITEMS.filter(
      (item) =>
        activeCatalogFilter === 'ALL' || item.category === activeCatalogFilter
    );

    catalogGridEl.innerHTML = items
      .map((item) => {
        const activeState =
          characterStateOverrides.get(item.id) ?? item.defaultState;
        const pillsMarkup = item.states
          ? `<div class="state-pills">
              ${item.states
                .map(
                  (st) =>
                    `<button class="pill-btn ${
                      st === activeState ? 'active' : ''
                    }" data-asset-id="${item.id}" data-state="${st}" type="button">${st}</button>`
                )
                .join('')}
            </div>`
          : '';

        return `
          <div class="asset-card" data-card-id="${item.id}">
            <div class="asset-preview-box">
              ${renderAssetPreviewSvg(item, frameIndex, activeState)}
            </div>
            <div class="asset-meta">
              <span class="asset-title">${item.title}</span>
              <span class="asset-tag">${item.category}</span>
            </div>
            <p class="asset-desc">${item.caption}</p>
            ${pillsMarkup}
          </div>
        `;
      })
      .join('');
  }

  function updateStage(force = false): void {
    const clock = evaluateSteppedClock(
      currentTimeSec,
      activeFps,
      activeScene.durationSec
    );
    const renderKey = [
      activeScene.id,
      clock.frameIndex,
      activeFps,
      renderOptions.enableCrayonFilter,
      renderOptions.enablePaperTexture,
      renderOptions.enableProgressiveFill,
      renderOptions.vibrant ?? false,
      renderOptions.enableBookFrame ?? true,
      renderOptions.overrideFillProgress ?? 'auto',
    ].join('|');

    scrubberEl.max = String(activeScene.durationSec);
    scrubberEl.value = currentTimeSec.toFixed(2);
    timeReadoutEl.textContent = `${clock.quantizedTimeSec.toFixed(1)}s / ${activeScene.durationSec.toFixed(1)}s`;

    if (!force && renderKey === lastRenderedKey) {
      return;
    }
    lastRenderedKey = renderKey;

    const { svg, frame, bookFrame } = evaluateAndRenderScene(
      activeScene,
      currentTimeSec,
      renderOptions
    );
    stageEl.innerHTML = svg;

    if (isPlaying) {
      soundEngine.triggerCuesForFrame(
        activeScene.audioCues,
        prevQuantizedTime,
        frame.clock.quantizedTimeSec
      );
    }
    prevQuantizedTime = frame.clock.quantizedTimeSec;

    badgeUrlEl.textContent = studioConfig.canonicalQuery;
    badgeActEl.textContent =
      frame.activeAct?.title.split('·')[0].trim() ?? 'Act';
    badgeFrameEl.textContent = `Frame #${frame.clock.frameIndex}`;
    badgeSeedEl.textContent = `Boil Seed #${frame.clock.boilSeed}`;
    badgeFpsEl.textContent = `${activeFps} FPS Stepped`;

    captionTitleEl.textContent = frame.activeAct?.title ?? '';
    captionTextEl.textContent = frame.caption ?? '';

    container
      .querySelectorAll<HTMLButtonElement>('[data-act-id]')
      .forEach((btn) => {
        btn.classList.toggle(
          'btn-active',
          btn.dataset.actId === frame.activeAct?.id
        );
      });

    // Live node telemetry
    const sunsetState = frame.nodes['sunset-patch'];
    const skyState = frame.nodes['sky-patch'];
    const sunState = frame.nodes['sun'] ?? frame.nodes['meadow-sun'];
    const moonState = frame.nodes['moon'];
    const girlState = frame.nodes['little-girl'];
    const cottageState = frame.nodes['ochre-cottage'];
    const radishState = frame.nodes['singing-radish'];
    const strawberryState = frame.nodes['birthday-strawberry'];
    const cakeState = frame.nodes['birthday-cake'];

    const rows: string[] = [
      `<div>• <b>color-mode</b>: ${renderOptions.vibrant ? '🌈 vibrant (#vibrant-grade)' : 'classic watercolor paper'}</div>`,
      `<div>• <b>book-frame</b>: ${bookFrame.enabled ? `📖 ${bookFrame.phase} (scale=${bookFrame.bookScale}, color=${Math.round(bookFrame.colorFillMultiplier * 100)}%)` : 'disabled'}</div>`,
    ];
    if (strawberryState) {
      rows.push(
        `<div>• <b>birthday-strawberry</b>: state="${strawberryState.state}" | floatie=${strawberryState.wearingFloatie ? 'on 🦆' : 'off'} @ (${strawberryState.x}, ${strawberryState.y})</div>`
      );
    }
    if (cakeState) {
      rows.push(
        `<div>• <b>birthday-cake</b>: candles=${cakeState.lit !== false ? '🕯️ lit' : '💨 blown out'}</div>`
      );
    }
    if (radishState) {
      rows.push(
        `<div>• <b>singing-radish</b>: state="${radishState.state}" @ (${radishState.x}, ${radishState.y})</div>`
      );
    }
    if (sunState) {
      rows.push(
        `<div>• <b>sun</b>: visible=${sunState.visible} | state="${sunState.state}" @ (${sunState.x}, ${sunState.y})</div>`
      );
    }
    if (sunsetState) {
      rows.push(
        `<div>• <b>sunset-patch</b>: visible=${sunsetState.visible} | fill=${Math.round(sunsetState.fillProgress * 100)}%</div>`
      );
    }
    if (skyState) {
      rows.push(
        `<div>• <b>sky-patch</b>: visible=${skyState.visible} | fill=${Math.round(skyState.fillProgress * 100)}% (${skyState.fillActiveSteps}/${skyState.fillTotalSteps} bands)</div>`
      );
    }
    if (moonState) {
      rows.push(
        `<div>• <b>moon</b>: visible=${moonState.visible} | state="${moonState.state}" | nightcap=${moonState.wearingNightcap ? 'on' : 'off'}</div>`
      );
    }
    if (girlState) {
      rows.push(
        `<div>• <b>little-girl</b>: visible=${girlState.visible} | state="${girlState.state}" @ (${girlState.x}, ${girlState.y})</div>`
      );
    }
    if (cottageState) {
      rows.push(
        `<div>• <b>ochre-cottage</b>: windowLit=${cottageState.windowLit ? 'yes' : 'no'}</div>`
      );
    }
    telemetryListEl.innerHTML = rows.join('');

    renderCatalogCards(frame.clock.frameIndex);
  }

  function tick(now: number): void {
    if (!isPlaying) return;
    if (lastPerfTime === 0) lastPerfTime = now;
    const dt = (now - lastPerfTime) / 1000;
    lastPerfTime = now;

    currentTimeSec += dt;
    const endBound = loopBounds ? loopBounds.end : activeScene.durationSec;
    const startBound = loopBounds ? loopBounds.start : 0;

    if (currentTimeSec >= endBound) {
      currentTimeSec = startBound;
      prevQuantizedTime = startBound - 0.01;
    }

    updateStage(false);
    rafId = requestAnimationFrame(tick);
  }

  function play(): void {
    if (isPlaying) return;
    isPlaying = true;
    lastPerfTime = 0;
    btnPlayPause.textContent = '⏸ Pause';
    rafId = requestAnimationFrame(tick);
  }

  function pause(): void {
    isPlaying = false;
    btnPlayPause.textContent = '▶ Play Story';
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function seek(timeSec: number): void {
    currentTimeSec = Math.max(0, Math.min(activeScene.durationSec, timeSec));
    prevQuantizedTime = currentTimeSec - 0.01;
    updateStage(true);
  }

  function applyUrlQuery(query: string): void {
    studioConfig = parseStudioUrlParams(query, initialScene);
    activeScene = studioConfig.scene;
    loopBounds = studioConfig.loopBounds;
    currentTimeSec = studioConfig.initialTimeSec;
    prevQuantizedTime = currentTimeSec - 0.01;
    renderOptions.vibrant = studioConfig.vibrant;
    renderOptions.enableBookFrame = studioConfig.bookFrame;
    chkVibrantMode.checked = studioConfig.vibrant;
    chkBookFrame.checked = studioConfig.bookFrame;

    headerTitleEl.textContent = `🖍️ ${activeScene.title}`;
    headerSubtitleEl.textContent = activeScene.subtitle ?? '';
    renderActButtons();
    updateUrlSwitcherHighlight();

    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', query);
    }

    updateStage(true);
    if (studioConfig.autoplay) {
      play();
    }
    if (studioConfig.autoExport) {
      setTimeout(() => {
        void runVideoExport(studioConfig.autoExportResolution);
      }, 500);
    }
  }

  container
    .querySelectorAll<HTMLAnchorElement>('[data-url-query]')
    .forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const q = link.dataset.urlQuery ?? '?short_sample=1';
        applyUrlQuery(q);
      });
    });

  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
  });

  btnRestart.addEventListener('click', () => {
    const startBound = loopBounds ? loopBounds.start : 0;
    seek(startBound);
  });

  scrubberEl.addEventListener('input', () => {
    loopBounds = null;
    seek(parseFloat(scrubberEl.value));
  });

  btnFps.addEventListener('click', () => {
    activeFps = activeFps === 6 ? 8 : 6;
    btnFps.textContent = `${activeFps} FPS`;
    updateStage(true);
  });

  btnMute.addEventListener('click', () => {
    const muted = soundEngine.toggleMute();
    btnMute.textContent = muted ? '🔇 Muted' : '🔊 Sound On';
  });

  btnFullscreen.addEventListener('click', () => {
    const isNativeFs =
      typeof document !== 'undefined' && document.fullscreenElement === stageEl;
    const isFallbackFs = stageEl.classList.contains(
      'stage-fullscreen-fallback'
    );
    if (isNativeFs || isFallbackFs) {
      if (isNativeFs && document.exitFullscreen) {
        void document.exitFullscreen().catch(() => {});
      }
      stageEl.classList.remove('stage-fullscreen-fallback');
    } else if (stageEl.requestFullscreen) {
      stageEl
        .requestFullscreen()
        .catch(() => {
          stageEl.classList.add('stage-fullscreen-fallback');
        });
    } else {
      stageEl.classList.add('stage-fullscreen-fallback');
    }
  });

  /**
   * Runs video export and handles both browser autoDownload and dev-server save-export.
   * Sets document.body.dataset.exportState to 'exporting'/'done'/'error' and
   * document.body.dataset.exportFilename / exportSavedPath on completion.
   */
  async function runVideoExport(resolution: VideoExportResolution): Promise<void> {
    if (exportAbortController) return;
    pause();

    exportAbortController = new AbortController();
    btnDownloadVideo.disabled = true;
    btnCancelVideo.style.display = 'inline-block';
    videoExportStatusEl.style.display = 'inline-block';
    videoExportStatusEl.textContent = `Preparing ${resolution} 16:9 export...`;

    if (typeof document !== 'undefined') {
      document.body.dataset.exportState = 'exporting';
      document.body.dataset.exportFilename = '';
      document.body.dataset.exportSavedPath = '';
    }

    const startBound = loopBounds ? loopBounds.start : 0;
    const endBound = loopBounds ? loopBounds.end : activeScene.durationSec;

    try {
      const result = await exportSceneTo16x9Video({
        scene: activeScene,
        renderOptions: { ...renderOptions },
        resolution,
        fps: activeFps,
        startTimeSec: startBound,
        endTimeSec: endBound,
        footageId: studioConfig.footageId,
        soundEngine,
        signal: exportAbortController.signal,
        onProgress: (p) => {
          videoExportStatusEl.textContent = p.message;
          if (p.phase === 'recording') {
            currentTimeSec = p.currentTimeSec;
            updateStage(false);
          }
        },
      });

      // Attempt to save to dev server exports/ directory (best-effort, ignored in production)
      let savedPath: string | null = null;
      try {
        const saveResp = await fetch(
          `/__studio/save-export?filename=${encodeURIComponent(result.filename)}`,
          { method: 'POST', body: result.blob }
        );
        if (saveResp.ok) {
          const json = (await saveResp.json()) as { ok: boolean; savedPath?: string };
          if (json.ok && json.savedPath) {
            savedPath = json.savedPath;
          }
        }
      } catch {
        // Not on dev server or middleware unavailable — ignore silently
      }

      if (typeof document !== 'undefined') {
        document.body.dataset.exportState = 'done';
        document.body.dataset.exportFilename = result.filename;
        document.body.dataset.exportSavedPath = savedPath ?? '';
      }
      videoExportStatusEl.textContent = savedPath
        ? `Saved: ${savedPath}`
        : result.filename;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      videoExportStatusEl.textContent = msg;
      if (typeof document !== 'undefined') {
        document.body.dataset.exportState = 'error';
        document.body.dataset.exportError = msg;
      }
      try {
        await fetch('/__studio/export-error', { method: 'POST', body: msg });
      } catch {
        // Ignore if not on dev server
      }
    } finally {
      exportAbortController = null;
      btnDownloadVideo.disabled = false;
      btnCancelVideo.style.display = 'none';
    }
  }

  btnDownloadVideo.addEventListener('click', () => {
    if (exportAbortController) return;
    const resolution = (selectVideoRes.value || '1080p') as VideoExportResolution;
    void runVideoExport(resolution);
  });

  btnCancelVideo.addEventListener('click', () => {
    if (exportAbortController) {
      exportAbortController.abort();
      exportAbortController = null;
    }
  });

  container
    .querySelectorAll<HTMLButtonElement>('[data-sfx-kind]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = (btn.dataset.sfxKind ?? 'birthday_song') as AudioCueKind;
        const freq = parseFloat(btn.dataset.sfxFreq ?? '440');
        const duration = parseFloat(btn.dataset.sfxDur ?? '0.45');
        soundEngine.playCue({ time: 0, freq, duration, kind });
      });
    });

  chkCrayonFilter.addEventListener('change', () => {
    renderOptions.enableCrayonFilter = chkCrayonFilter.checked;
    updateStage(true);
  });

  chkPaperTexture.addEventListener('change', () => {
    renderOptions.enablePaperTexture = chkPaperTexture.checked;
    updateStage(true);
  });

  chkVibrantMode.addEventListener('change', () => {
    renderOptions.vibrant = chkVibrantMode.checked;
    updateStage(true);
  });

  chkBookFrame.addEventListener('change', () => {
    renderOptions.enableBookFrame = chkBookFrame.checked;
    updateStage(true);
  });

  chkProgressiveFill.addEventListener('change', () => {
    renderOptions.enableProgressiveFill = chkProgressiveFill.checked;
    updateStage(true);
  });

  chkManualFill.addEventListener('change', () => {
    sliderManualFill.disabled = !chkManualFill.checked;
    if (chkManualFill.checked) {
      const val = parseFloat(sliderManualFill.value);
      renderOptions.overrideFillProgress = val;
      badgeFillPct.textContent = `${Math.round(val * 100)}% Fill`;
    } else {
      renderOptions.overrideFillProgress = undefined;
      badgeFillPct.textContent = 'Timeline Auto';
    }
    updateStage(true);
  });

  sliderManualFill.addEventListener('input', () => {
    if (chkManualFill.checked) {
      const val = parseFloat(sliderManualFill.value);
      renderOptions.overrideFillProgress = val;
      badgeFillPct.textContent = `${Math.round(val * 100)}% Fill`;
      updateStage(true);
    }
  });

  container
    .querySelectorAll<HTMLButtonElement>('[data-cat-filter]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCatalogFilter = (btn.dataset.catFilter ??
          'ALL') as typeof activeCatalogFilter;
        container
          .querySelectorAll<HTMLButtonElement>('[data-cat-filter]')
          .forEach((b) => b.classList.toggle('btn-active', b === btn));
        const clock = evaluateSteppedClock(
          currentTimeSec,
          activeFps,
          activeScene.durationSec
        );
        renderCatalogCards(clock.frameIndex);
      });
    });

  catalogGridEl.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>(
      '.pill-btn'
    );
    if (!target) return;
    const assetId = target.dataset.assetId;
    const st = target.dataset.state as CharacterState | undefined;
    if (assetId && st) {
      characterStateOverrides.set(assetId, st);
      const clock = evaluateSteppedClock(
        currentTimeSec,
        activeFps,
        activeScene.durationSec
      );
      renderCatalogCards(clock.frameIndex);
    }
  });

  // Initialize Act buttons, URL switcher highlight, and initial render
  renderActButtons();
  updateUrlSwitcherHighlight();
  updateStage(true);

  if (studioConfig.autoplay) {
    play();
  }

  // ?auto_export=1 — trigger video export automatically on mount
  if (studioConfig.autoExport) {
    // Small delay to let the stage fully render first
    setTimeout(() => {
      void runVideoExport(studioConfig.autoExportResolution);
    }, 500);
  }

  return {
    play,
    pause,
    seek,
    applyUrlQuery,
    setOptions: (opts) => {
      Object.assign(renderOptions, opts);
      updateStage(true);
    },
    getState: () => ({
      shortSample: studioConfig.shortSample,
      footageId: studioConfig.footageId,
      currentTimeSec,
      isPlaying,
      fps: activeFps,
      options: { ...renderOptions },
    }),
    destroy: () => {
      pause();
      soundEngine.dispose();
    },
  };
}

import { steppedOscillate } from '../../engine/clock';
import { svgEl, svgTransform } from '../../engine/svgUtils';
import type { CharacterKind } from '../../engine/schema';
import { renderAnnotation } from '../annotations/pencilAnnotation';
import { renderSwimFloatieRing } from '../props/swimFloatie';
import type { CharacterRenderOptions } from './types';
import { renderLittleGirl } from './littleGirl';
import { renderMoon } from './moon';
import { renderSun } from './sun';
import { renderShopkeeper } from './shopkeeper';
import { renderCat } from './cat';
import { renderSingingRadish } from './singingRadish';
import { renderWatermelonSlice } from './watermelonSlice';
import { renderBluePartyCat } from './bluePartyCat';
import { renderHelloBug } from './helloBug';
import { renderPartyBanana } from './partyBanana';
import { renderCryingOnion } from './cryingOnion';
import { renderCherryTwins } from './cherryTwins';
import { renderAcornTwins } from './acornTwins';
import { renderOliveSprout } from './oliveSprout';
import { renderBirthdayStrawberry } from './birthdayStrawberry';
import { renderKnight } from './knight';
import { renderSoldier } from './soldier';
import { renderDragon } from './dragon';
import { renderVillager } from './villager';

export type { CharacterRenderOptions } from './types';
export { renderCutoutStickerHalo, renderSheepPlushie } from './shared';
export { renderLittleGirl } from './littleGirl';
export { renderMoon } from './moon';
export { renderSun } from './sun';
export { renderShopkeeper } from './shopkeeper';
export { renderCat } from './cat';
export { renderSingingRadish } from './singingRadish';
export { renderWatermelonSlice } from './watermelonSlice';
export { renderBluePartyCat } from './bluePartyCat';
export { renderHelloBug } from './helloBug';
export { renderPartyBanana } from './partyBanana';
export { renderCryingOnion } from './cryingOnion';
export { renderCherryTwins } from './cherryTwins';
export { renderAcornTwins } from './acornTwins';
export { renderOliveSprout } from './oliveSprout';
export { renderBirthdayStrawberry } from './birthdayStrawberry';
export { renderKnight } from './knight';
export { renderSoldier } from './soldier';
export { renderDragon } from './dragon';
export { renderVillager } from './villager';

interface CharacterFloatieFit {
  cx: number;
  waistY: number;
  rx: number;
  ry: number;
  tubeR: number;
  skirtBottomY: number;
  defaultVariant: number;
}

const CHARACTER_FLOATIE_FITS: Record<CharacterKind, CharacterFloatieFit> = {
  birthday_strawberry: {
    cx: 0,
    waistY: -26,
    rx: 46,
    ry: 10,
    tubeR: 8.5,
    skirtBottomY: 12,
    defaultVariant: 0, // Golden rubber-ducky floatie!
  },
  crying_onion: {
    cx: 0,
    waistY: -16,
    rx: 33,
    ry: 7,
    tubeR: 6,
    skirtBottomY: 13,
    defaultVariant: 1, // Candy red & white striped floatie
  },
  singing_radish: {
    cx: -2,
    waistY: -46,
    rx: 46,
    ry: 11,
    tubeR: 8.5,
    skirtBottomY: 10,
    defaultVariant: 2, // Sky-blue & golden star floatie
  },
  watermelon_slice: {
    cx: 1,
    waistY: -30,
    rx: 42,
    ry: 9,
    tubeR: 7.5,
    skirtBottomY: 10,
    defaultVariant: 2,
  },
  party_banana: {
    cx: 8,
    waistY: -11,
    rx: 76,
    ry: 9,
    tubeR: 6.5,
    skirtBottomY: 15,
    defaultVariant: 3,
  },
  cherry_twins: {
    cx: 1,
    waistY: -10,
    rx: 56,
    ry: 8,
    tubeR: 5.5,
    skirtBottomY: 10,
    defaultVariant: 4,
  },
  blue_party_cat: {
    cx: 2,
    waistY: -24,
    rx: 42,
    ry: 10,
    tubeR: 7.5,
    skirtBottomY: 11,
    defaultVariant: 1,
  },
  olive_sprout: {
    cx: 0,
    waistY: -13,
    rx: 28,
    ry: 6.5,
    tubeR: 5.5,
    skirtBottomY: 12,
    defaultVariant: 3,
  },
  hello_bug: {
    cx: 0,
    waistY: -28,
    rx: 42,
    ry: 10,
    tubeR: 7.5,
    skirtBottomY: 12,
    defaultVariant: 2,
  },
  acorn_twins: {
    cx: 0,
    waistY: -10,
    rx: 48,
    ry: 8,
    tubeR: 5.5,
    skirtBottomY: 10,
    defaultVariant: 4,
  },
  little_girl: {
    cx: 0,
    waistY: -18,
    rx: 28,
    ry: 8,
    tubeR: 6,
    skirtBottomY: 16,
    defaultVariant: 0,
  },
  shopkeeper: {
    cx: 0,
    waistY: -22,
    rx: 28,
    ry: 8,
    tubeR: 6,
    skirtBottomY: 10,
    defaultVariant: 1,
  },
  cat: {
    cx: 0,
    waistY: -3,
    rx: 22,
    ry: 6,
    tubeR: 4.5,
    skirtBottomY: 8,
    defaultVariant: 2,
  },
  moon: {
    cx: 0,
    waistY: 52,
    rx: 108,
    ry: 20,
    tubeR: 13,
    skirtBottomY: 104,
    defaultVariant: 2,
  },
  sun: {
    cx: 0,
    waistY: 48,
    rx: 124,
    ry: 20,
    tubeR: 13,
    skirtBottomY: 132,
    defaultVariant: 3,
  },
  knight: {
    cx: 0,
    waistY: -36,
    rx: 56,
    ry: 12,
    tubeR: 9,
    skirtBottomY: 6,
    defaultVariant: 2,
  },
  soldier: {
    cx: 0,
    waistY: -32,
    rx: 52,
    ry: 11,
    tubeR: 8,
    skirtBottomY: 6,
    defaultVariant: 2,
  },
  dragon: {
    cx: 0,
    waistY: -34,
    rx: 60,
    ry: 13,
    tubeR: 10,
    skirtBottomY: 8,
    defaultVariant: 4,
  },
  villager: {
    cx: 0,
    waistY: -28,
    rx: 28,
    ry: 7,
    tubeR: 6,
    skirtBottomY: 6,
    defaultVariant: 1,
  },
};

/**
 * Predefined local speech/thought bubble anchor coordinates `(x, y)` directly above
 * each character's head (relative to the character's ground-feet origin `(0, 0)`).
 */
export const CHARACTER_SPEECH_ANCHORS: Record<
  CharacterKind,
  { x: number; y: number }
> = {
  little_girl: { x: 0, y: -102 },
  shopkeeper: { x: 0, y: -105 },
  cat: { x: 10, y: -44 },
  moon: { x: 0, y: -152 },
  sun: { x: 0, y: -150 },
  singing_radish: { x: 0, y: -115 },
  watermelon_slice: { x: 0, y: -95 },
  blue_party_cat: { x: 0, y: -98 },
  hello_bug: { x: 0, y: -95 },
  party_banana: { x: 0, y: -105 },
  crying_onion: { x: 0, y: -90 },
  cherry_twins: { x: 0, y: -90 },
  acorn_twins: { x: 0, y: -88 },
  olive_sprout: { x: 0, y: -82 },
  birthday_strawberry: { x: 0, y: -108 },
  knight: { x: 0, y: -128 },
  soldier: { x: 0, y: -118 },
  dragon: { x: 10, y: -142 },
  villager: { x: 0, y: -104 },
};

/**
 * Renders any 2D cutout character rig quantized to the stepped stop-motion frame index.
 */
export function renderCharacter(options: CharacterRenderOptions): string {
  const {
    id,
    x,
    y,
    scale,
    rotate,
    flipX,
    opacity,
    kind,
    wearingFloatie,
    floatieVariant,
    speechText,
    speechStyle,
    speechTail,
    frameIndex = 0,
    fillMask,
  } = options;
  const transform = svgTransform({ x, y, scale, rotate, flipX });

  let inner = '';
  switch (kind) {
    case 'little_girl':
      inner = renderLittleGirl(options);
      break;
    case 'moon':
      inner = renderMoon(options);
      break;
    case 'sun':
      inner = renderSun(options);
      break;
    case 'shopkeeper':
      inner = renderShopkeeper(options);
      break;
    case 'cat':
      inner = renderCat(options);
      break;
    case 'singing_radish':
      inner = renderSingingRadish(options);
      break;
    case 'watermelon_slice':
      inner = renderWatermelonSlice(options);
      break;
    case 'blue_party_cat':
      inner = renderBluePartyCat(options);
      break;
    case 'hello_bug':
      inner = renderHelloBug(options);
      break;
    case 'party_banana':
      inner = renderPartyBanana(options);
      break;
    case 'crying_onion':
      inner = renderCryingOnion(options);
      break;
    case 'cherry_twins':
      inner = renderCherryTwins(options);
      break;
    case 'acorn_twins':
      inner = renderAcornTwins(options);
      break;
    case 'olive_sprout':
      inner = renderOliveSprout(options);
      break;
    case 'birthday_strawberry':
      inner = renderBirthdayStrawberry(options);
      break;
    case 'knight':
      inner = renderKnight(options);
      break;
    case 'soldier':
      inner = renderSoldier(options);
      break;
    case 'dragon':
      inner = renderDragon(options);
      break;
    case 'villager':
      inner = renderVillager(options);
      break;
  }

  if (wearingFloatie) {
    const fit = CHARACTER_FLOATIE_FITS[kind];
    const resolvedVariant = floatieVariant ?? fit.defaultVariant;
    const waveBob = steppedOscillate(frameIndex, 8, 2.8, resolvedVariant * 2);
    const waveTilt = steppedOscillate(frameIndex, 10, 2.2, resolvedVariant * 3);
    inner = svgEl(
      'g',
      {
        'data-part': 'character-floatie',
        'data-floatie-variant': String(resolvedVariant),
        transform: svgTransform({ y: waveBob, rotate: waveTilt }),
      },
      [
        renderSwimFloatieRing({
          cx: fit.cx,
          cy: fit.waistY,
          rx: fit.rx,
          ry: fit.ry,
          tubeR: fit.tubeR,
          skirtBottomY: fit.skirtBottomY,
          variant: resolvedVariant,
          frameIndex,
          layer: 'back',
          fillMask,
        }),
        inner,
        renderSwimFloatieRing({
          cx: fit.cx,
          cy: fit.waistY,
          rx: fit.rx,
          ry: fit.ry,
          tubeR: fit.tubeR,
          skirtBottomY: fit.skirtBottomY,
          variant: resolvedVariant,
          frameIndex,
          layer: 'front',
          showWaterSkirt: true,
          fillMask,
        }),
      ]
    );
  }

  if (speechText && speechText.trim().length > 0) {
    const anchor = CHARACTER_SPEECH_ANCHORS[kind];
    const bubbleMarkup = renderAnnotation({
      x: anchor.x,
      y: anchor.y,
      text: speechText.trim(),
      bubbleStyle: speechStyle ?? 'speech',
      tailDirection: speechTail ?? 'bottom-center',
      anchorAtTailTip: true,
    });
    inner += svgEl(
      'g',
      {
        'data-part': 'character-speech',
        transform: flipX ? 'scale(-1, 1)' : undefined,
      },
      bubbleMarkup
    );
  }

  if (!id && !transform && opacity === undefined) {
    return inner;
  }

  return svgEl('g', { id, transform: transform || undefined, opacity }, inner);
}

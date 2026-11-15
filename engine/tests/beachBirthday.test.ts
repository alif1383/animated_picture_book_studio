import { describe, expect, it } from 'vitest';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { STRAWBERRY_BEACH_BIRTHDAY_SCENE } from '../src/scenes/strawberryBeachBirthday';
import { renderCharacter } from '../src/assets/characters';
import { renderProp } from '../src/assets/objects';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import {
  ASSET_CATALOG_ITEMS,
  SCENE_REGISTRY,
  parseStudioUrlParams,
} from '../src/ui/app';

function createWebAudioMocks() {
  const scheduledGainTimes: number[] = [];
  const oscTypes: string[] = [];
  const filterTypes: string[] = [];
  let bufferSourcesStarted = 0;

  const createMockNode = (kind: 'gain' | 'osc' | 'filter' | 'bufferSource') => ({
    gain: {
      setValueAtTime: (_v: number, t: number) => scheduledGainTimes.push(t),
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    },
    frequency: {
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    },
    Q: { setValueAtTime: () => {} },
    set type(val: string) {
      if (kind === 'osc') oscTypes.push(val);
      if (kind === 'filter') filterTypes.push(val);
    },
    get type() {
      return 'sine';
    },
    buffer: null as unknown,
    onended: null as (() => void) | null,
    connect: () => {},
    disconnect: () => {},
    start: () => {
      if (kind === 'bufferSource') bufferSourcesStarted++;
    },
    stop: () => {},
  });

  class MockAudioContext {
    public state = 'running';
    public currentTime = 0;
    public sampleRate = 8000;
    public destination = { id: 'speaker-dest' };
    public createGain() {
      return createMockNode('gain');
    }
    public createOscillator() {
      return createMockNode('osc');
    }
    public createBiquadFilter() {
      return createMockNode('filter');
    }
    public createBufferSource() {
      return createMockNode('bufferSource');
    }
    public createBuffer(_channels: number, length: number) {
      return { getChannelData: () => new Float32Array(length) };
    }
    public resume() {
      return Promise.resolve();
    }
    public close() {
      return Promise.resolve();
    }
  }

  class MockOfflineAudioContext {
    public currentTime = 0;
    public sampleRate: number;
    public length: number;
    public destination = { id: 'offline-dest' };
    constructor(_channels: number, length: number, sampleRate: number) {
      this.length = length;
      this.sampleRate = sampleRate;
    }
    public createGain() {
      return createMockNode('gain');
    }
    public createOscillator() {
      return createMockNode('osc');
    }
    public createBiquadFilter() {
      return createMockNode('filter');
    }
    public createBufferSource() {
      return createMockNode('bufferSource');
    }
    public createBuffer(_channels: number, len: number) {
      return { getChannelData: () => new Float32Array(len) };
    }
    public async startRendering() {
      return {
        numberOfChannels: 2,
        length: this.length,
        sampleRate: this.sampleRate,
        getChannelData: () => new Float32Array(this.length),
      };
    }
  }

  return {
    MockAudioContext,
    MockOfflineAudioContext,
    scheduledGainTimes,
    oscTypes,
    filterTypes,
    getBufferSourcesStarted: () => bufferSourcesStarted,
  };
}

describe("Strawberry's Beach Birthday Splash (46s Vibrant 5-Act Scene)", () => {
  it('registers STRAWBERRY_BEACH_BIRTHDAY_SCENE in SCENE_REGISTRY and URL router cleanly', () => {
    expect(STRAWBERRY_BEACH_BIRTHDAY_SCENE.id).toBe('strawberry-beach-birthday');
    expect(STRAWBERRY_BEACH_BIRTHDAY_SCENE.durationSec).toBe(46);
    expect(STRAWBERRY_BEACH_BIRTHDAY_SCENE.vibrantMode).toBe(true);
    expect(STRAWBERRY_BEACH_BIRTHDAY_SCENE.acts).toHaveLength(5);

    expect(SCENE_REGISTRY['strawberry-beach-birthday']).toBe(
      STRAWBERRY_BEACH_BIRTHDAY_SCENE
    );
    expect(SCENE_REGISTRY['beach-birthday']).toBe(
      STRAWBERRY_BEACH_BIRTHDAY_SCENE
    );
    expect(SCENE_REGISTRY['5']).toBe(STRAWBERRY_BEACH_BIRTHDAY_SCENE);

    const parsedById = parseStudioUrlParams('?scene=strawberry-beach-birthday');
    expect(parsedById.scene).toBe(STRAWBERRY_BEACH_BIRTHDAY_SCENE);
    expect(parsedById.shortSample).toBe('5');
    expect(parsedById.vibrant).toBe(true);

    const parsedByAlias = parseStudioUrlParams('?scene=beach-birthday&footage=floatie-water-play');
    expect(parsedByAlias.scene).toBe(STRAWBERRY_BEACH_BIRTHDAY_SCENE);
    expect(parsedByAlias.footageId).toBe('floatie-water-play');
    expect(parsedByAlias.loopBounds).toEqual({ start: 19, end: 32 });

    expect(ASSET_CATALOG_ITEMS.length).toBeGreaterThanOrEqual(30);
  });

  it('renders the 5 modular beach props and 2.5D character floatie + happy onion expressions', () => {
    const beachProps = [
      'beach_umbrella',
      'ocean_waves',
      'water_splash',
      'swim_floatie',
      'beach_ball',
    ] as const;

    for (const kind of beachProps) {
      const svg = renderProp({ kind, frameIndex: 3, variant: 1, count: 5 });
      expect(svg).toContain(`data-prop="${kind}"`);
      expect(svg.toUpperCase()).not.toContain('#FFFFFF');
      expect(svg.toUpperCase()).not.toContain('#000000');
    }

    const strawberryInFloatie = renderCharacter({
      kind: 'birthday_strawberry',
      state: 'waving',
      frameIndex: 2,
      wearingFloatie: true,
    });
    expect(strawberryInFloatie).toContain('data-part="character-floatie"');
    expect(strawberryInFloatie).toContain('data-part="floatie-back"');
    expect(strawberryInFloatie).toContain('data-part="floatie-front"');
    expect(strawberryInFloatie).toContain('data-part="floatie-water-skirt"');
    expect(strawberryInFloatie).toContain('data-part="floatie-ducky-head"');

    const onionIdle = renderCharacter({ kind: 'crying_onion', state: 'idle' });
    const onionWaving = renderCharacter({ kind: 'crying_onion', state: 'waving' });
    expect(onionIdle).not.toContain('data-part="onion-happy-mouth"');
    expect(onionWaving).toContain('data-part="onion-happy-mouth"');
  });

  it('evaluates all 5 story acts cleanly across 0..46s in Vibrant Mode with mandatory 3-layer stack', () => {
    // Act I (0s – 10s): Sunny beach birthday -> candles lit at 4.0s, blown out at 8.0s + confetti & banner
    const act1Lit = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 4.0);
    expect(act1Lit.frame.activeAct?.id).toBe('beach-party');
    expect(act1Lit.svg).toContain('data-vibrant="true"');
    expect(act1Lit.svg).toContain('id="layer-1-base-scene"');
    expect(act1Lit.svg).toContain('id="layer-3-paper-composite"');
    expect(act1Lit.frame.nodes['birthday-cake'].lit).toBe(true);
    expect(act1Lit.svg).toContain('data-part="candle-flame"');

    const act1Blown = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 8.0);
    expect(act1Blown.frame.activeAct?.id).toBe('beach-party');
    expect(act1Blown.frame.nodes['birthday-cake'].lit).toBe(false);
    expect(act1Blown.svg).toContain('data-part="candle-smoke"');
    expect(act1Blown.svg).toContain('data-prop="party_confetti"');
    expect(act1Blown.svg).toContain('Happy Birthday, Strawberry!');

    // Act II (10s – 19s): Strawberry startled by shoreline wave -> backs away -> friends bring floatie props!
    const act2Shore = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 11.84);
    expect(act2Shore.frame.activeAct?.id).toBe('scared-of-water');
    expect(act2Shore.frame.nodes['shore-scare-splash'].visible).toBe(true);
    const shoreX = act2Shore.frame.nodes['birthday-strawberry'].x;

    const act2ScaredBack = evaluateAndRenderScene(
      STRAWBERRY_BEACH_BIRTHDAY_SCENE,
      13.0
    );
    expect(act2ScaredBack.frame.nodes['birthday-strawberry'].x).toBeLessThan(
      shoreX - 80
    );
    expect(act2ScaredBack.svg).toContain('Eep! Big waves!');

    const act2Floaties = evaluateAndRenderScene(
      STRAWBERRY_BEACH_BIRTHDAY_SCENE,
      16.5
    );
    expect(act2Floaties.frame.nodes['floatie-prop-ducky'].visible).toBe(true);
    expect(act2Floaties.frame.nodes['floatie-prop-red'].visible).toBe(true);
    expect(act2Floaties.svg).toContain('data-prop="swim_floatie"');
    expect(act2Floaties.svg).toContain('We got floaties!');

    // Act III (19s – 32s): Strawberry, Onion & friends in ocean wearing floaties + splashes + beach ball!
    const act3Swim = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 24.0);
    expect(act3Swim.frame.activeAct?.id).toBe('floatie-water-play');
    const swimmingIds = [
      'birthday-strawberry',
      'crying-onion',
      'singing-radish',
      'watermelon-slice',
      'party-banana',
      'cherry-twins',
    ];
    for (const id of swimmingIds) {
      expect(act3Swim.frame.nodes[id].wearingFloatie).toBe(true);
      expect(act3Swim.frame.nodes[id].x).toBeGreaterThan(740);
    }
    expect(act3Swim.svg).toContain('data-part="character-floatie"');
    expect(act3Swim.svg).toContain('data-prop="water_splash"');
    expect(act3Swim.svg).toContain('data-prop="beach_ball"');
    expect(act3Swim.frame.nodes['beach-ball'].x).toBeGreaterThan(750);

    // Act IV (32s – 39s): Sunset wash + twilight night-sky-patch + exiting water (wearingFloatie: false)
    const act4Sunset = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 34.0);
    expect(act4Sunset.frame.activeAct?.id).toBe('sunset-shore');
    expect(act4Sunset.frame.nodes['sunset-patch'].visible).toBe(true);
    expect(act4Sunset.frame.nodes['sunset-patch'].fillProgress).toBeGreaterThan(0.2);
    expect(act4Sunset.frame.nodes['sun'].state).toBe('sleepy');

    const act4DuskShore = evaluateAndRenderScene(
      STRAWBERRY_BEACH_BIRTHDAY_SCENE,
      37.5
    );
    expect(act4DuskShore.frame.nodes['night-sky-patch'].visible).toBe(true);
    for (const id of swimmingIds) {
      expect(act4DuskShore.frame.nodes[id].wearingFloatie).toBe(false);
    }
    expect(act4DuskShore.frame.nodes['birthday-strawberry'].x).toBeLessThan(540);
    expect(act4DuskShore.frame.nodes['floatie-prop-ducky'].visible).toBe(true);

    // Act V (39s – 46s): Moonrise, twinkling stars, waving goodbye & night banner!
    const act5Night = evaluateAndRenderScene(STRAWBERRY_BEACH_BIRTHDAY_SCENE, 43.0);
    expect(act5Night.frame.activeAct?.id).toBe('moonlight-goodbye');
    expect(act5Night.frame.nodes['moon'].visible).toBe(true);
    expect(act5Night.frame.nodes['moon'].opacity).toBe(1);
    expect(act5Night.frame.nodes['star-cluster'].visible).toBe(true);
    expect(act5Night.frame.nodes['star-cluster'].count).toBeGreaterThanOrEqual(20);
    expect(act5Night.frame.nodes['birthday-strawberry'].state).toBe('waving');
    expect(act5Night.frame.nodes['crying-onion'].state).toBe('waving');
    expect(act5Night.frame.nodes['singing-radish'].state).toBe('waving');
    expect(act5Night.svg).toContain('Bye-bye, Friends! Goodnight!');
    expect(act5Night.svg.toLowerCase()).not.toContain('lineargradient');
    expect(act5Night.svg.toLowerCase()).not.toContain('radialgradient');
  });

  it('synthesizes ocean_wave, water_splash, and floatie_squeak cleanly in both live AudioContext and OfflineAudioContext', async () => {
    const g = globalThis as unknown as Record<string, unknown>;
    const prevAudioCtx = g.AudioContext;
    const prevOfflineCtx = g.OfflineAudioContext;
    const mocks = createWebAudioMocks();

    g.AudioContext = mocks.MockAudioContext;
    g.OfflineAudioContext = mocks.MockOfflineAudioContext;

    try {
      const sound = new PictureBookSoundEngine({ muted: false });

      sound.playCue({ time: 0, freq: 220, duration: 1.2, kind: 'ocean_wave' });
      expect(mocks.getBufferSourcesStarted()).toBe(2);
      expect(mocks.filterTypes).toContain('lowpass');
      expect(mocks.filterTypes).toContain('bandpass');

      const oscBeforeSplash = mocks.oscTypes.length;
      sound.playCue({ time: 1, freq: 460, duration: 0.48, kind: 'water_splash' });
      expect(mocks.getBufferSourcesStarted()).toBe(3);
      expect(mocks.oscTypes.length - oscBeforeSplash).toBe(4);

      const oscBeforeSqueak = mocks.oscTypes.length;
      sound.playCue({ time: 2, freq: 740, duration: 0.34, kind: 'floatie_squeak' });
      expect(mocks.oscTypes.length - oscBeforeSqueak).toBe(2);

      // Verify full 46s offline export rendering of all scene audio cues
      const offlineBuffer = await sound.renderOfflineAudio(
        STRAWBERRY_BEACH_BIRTHDAY_SCENE.audioCues,
        0,
        STRAWBERRY_BEACH_BIRTHDAY_SCENE.durationSec,
        8000
      );
      expect(offlineBuffer).not.toBeNull();
      expect(offlineBuffer?.length).toBe(46 * 8000);
      expect(mocks.scheduledGainTimes.length).toBeGreaterThan(40);

      sound.dispose();
    } finally {
      g.AudioContext = prevAudioCtx;
      g.OfflineAudioContext = prevOfflineCtx;
    }
  });
});

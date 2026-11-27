import { describe, it, expect } from 'vitest';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import type { AudioClipCue } from '../src/engine/schema';
import { KNIGHT_DRAGON_QUEST_SCENE } from '../src/scenes/knightDragonQuest';
import { CORNER_STORE_DAY_SCENE } from '../src/scenes/cornerStoreDay';
import {
  getSwitcherScenes,
  getUniqueRegisteredScenes,
  mountStorybookStudio,
  parseStudioUrlParams,
  SCENE_REGISTRY,
} from '../src/ui/app';

interface StartedSourceRecord {
  when: number;
  offset: number;
  duration: number | undefined;
  stopped: boolean;
  volume: number;
}

function createAudioTestHarness(options?: {
  initialState?: 'running' | 'suspended';
  blockResumeUntilUnlocked?: boolean;
  bufferDuration?: number;
  fetchDelayMs?: number;
}) {
  const startedSources: StartedSourceRecord[] = [];
  const speakerGainValues: number[] = [];
  const fetchedUrls: string[] = [];
  let ctxState: 'running' | 'suspended' = options?.initialState ?? 'running';
  let resumeBlocked = options?.blockResumeUntilUnlocked ?? false;
  const bufferDuration = options?.bufferDuration ?? 64.0;
  let lastGainValue = 1.0;

  const createGainNode = () => {
    const node = {
      _isLiveMaster: false,
      gain: {
        setValueAtTime: (val: number) => {
          if (node._isLiveMaster) {
            speakerGainValues.push(val);
          } else {
            lastGainValue = val;
          }
        },
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: (target: unknown) => {
        if (target && (target as { id?: string }).id === 'speaker-dest') {
          node._isLiveMaster = true;
        }
      },
      disconnect: () => {},
    };
    return node;
  };

  class MockAudioContext {
    public currentTime = 0;
    public sampleRate = 48000;
    public destination = { id: 'speaker-dest' };
    public get state() {
      return ctxState;
    }
    public async resume() {
      if (!resumeBlocked) {
        ctxState = 'running';
      }
    }
    public createGain() {
      return createGainNode();
    }
    public createBufferSource() {
      const rec: StartedSourceRecord = {
        when: 0,
        offset: 0,
        duration: undefined,
        stopped: false,
        volume: lastGainValue,
      };
      return {
        buffer: null as AudioBuffer | null,
        onended: null as (() => void) | null,
        connect: () => {},
        start: (when = 0, offset = 0, duration?: number) => {
          rec.when = when;
          rec.offset = offset;
          rec.duration = duration;
          rec.volume = lastGainValue;
          startedSources.push(rec);
        },
        stop: () => {
          rec.stopped = true;
        },
      };
    }
    public async decodeAudioData(_ab: ArrayBuffer) {
      return {
        duration: bufferDuration,
        length: Math.floor(bufferDuration * 48000),
        numberOfChannels: 2,
        sampleRate: 48000,
      } as unknown as AudioBuffer;
    }
    public async close() {}
  }

  const mockFetch = async (url: string) => {
    fetchedUrls.push(url);
    if (options?.fetchDelayMs) {
      await new Promise((r) => setTimeout(r, options.fetchDelayMs));
    }
    return {
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(16),
    };
  };

  return {
    MockAudioContext,
    mockFetch,
    startedSources,
    speakerGainValues,
    fetchedUrls,
    setCtxState: (s: 'running' | 'suspended') => {
      ctxState = s;
    },
    unlockResume: () => {
      resumeBlocked = false;
    },
  };
}

function withMockAudioGlobals<T>(
  harness: ReturnType<typeof createAudioTestHarness>,
  fn: () => Promise<T> | T
): Promise<T> | T {
  const g = globalThis as unknown as {
    AudioContext?: unknown;
    fetch?: unknown;
  };
  const prevCtx = g.AudioContext;
  const prevFetch = g.fetch;
  g.AudioContext = harness.MockAudioContext;
  g.fetch = harness.mockFetch;

  const restore = () => {
    g.AudioContext = prevCtx;
    g.fetch = prevFetch;
  };

  try {
    const res = fn();
    if (res && typeof (res as Promise<T>).then === 'function') {
      return (res as Promise<T>).finally(restore);
    }
    restore();
    return res;
  } catch (err) {
    restore();
    throw err;
  }
}

describe('PictureBookSoundEngine live audioClips playback', () => {
  it('deduplicates concurrent fetches in preloadClips for repeated clip URLs', async () => {
    const harness = createAudioTestHarness({ fetchDelayMs: 10 });
    await withMockAudioGlobals(harness, async () => {
      const sound = new PictureBookSoundEngine();
      await sound.preloadClips(KNIGHT_DRAGON_QUEST_SCENE.audioClips);
      const uniqueSrcCount = new Set(
        KNIGHT_DRAGON_QUEST_SCENE.audioClips!.map((c) => c.src)
      ).size;
      expect(harness.fetchedUrls).toHaveLength(uniqueSrcCount);
      sound.dispose();
    });
  });

  it('starts BGM at t=0 and mid-clip voiceovers/BGM with exact offset, remaining duration, and export-parity volume', async () => {
    const harness = createAudioTestHarness({ bufferDuration: 64.0 });
    await withMockAudioGlobals(harness, async () => {
      const clips: AudioClipCue[] = [
        {
          id: 'bgm',
          src: '/audio/bgm.wav',
          startTime: 0.0,
          duration: 66.0,
          volume: 0.42,
        },
        {
          id: 'vo-past',
          src: '/audio/vo1.wav',
          startTime: 1.0,
          duration: 3.0,
          volume: 1.0,
        },
        {
          id: 'vo-active',
          src: '/audio/vo2.wav',
          startTime: 10.0,
          duration: 8.0,
          offsetSec: 1.5,
          volume: 0.95,
        },
        {
          id: 'vo-future',
          src: '/audio/vo3.wav',
          startTime: 25.0,
          duration: 4.0,
          volume: 1.0,
        },
      ];

      const sound = new PictureBookSoundEngine();
      await sound.preloadClips(clips);

      // Starting at t = 0 starts BGM at offset 0 with full volume parity (0.42, NOT 0.42 * 0.25)
      sound.syncClipsAtTime(clips, 0.0);
      expect(harness.startedSources).toHaveLength(1);
      expect(harness.startedSources[0].offset).toBe(0);
      expect(harness.startedSources[0].duration).toBe(66.0);
      expect(harness.startedSources[0].volume).toBeCloseTo(0.42, 4);

      // Seeking to t = 14.0 stops previous clip and starts both spanning BGM and active voiceover mid-clip
      sound.stopAllClips();
      expect(harness.startedSources[0].stopped).toBe(true);

      sound.syncClipsAtTime(clips, 14.0);
      expect(harness.startedSources).toHaveLength(3);
      // BGM at t=14: offset 14, remaining duration 52
      expect(harness.startedSources[1].offset).toBeCloseTo(14.0, 4);
      expect(harness.startedSources[1].duration).toBeCloseTo(52.0, 4);
      // Voiceover at t=14 (startTime 10, offsetSec 1.5, duration 8): playOffset = 5.5, remaining = 4.0
      expect(harness.startedSources[2].offset).toBeCloseTo(5.5, 4);
      expect(harness.startedSources[2].duration).toBeCloseTo(4.0, 4);
      expect(harness.startedSources[2].volume).toBeCloseTo(0.95, 4);

      // Seeking past actual buffer duration (64.5s >= 64.0s) safely skips instead of throwing
      sound.stopAllClips();
      sound.syncClipsAtTime(clips, 64.5);
      expect(harness.startedSources).toHaveLength(3);

      sound.dispose();
    });
  });

  it('prevents ghost audio when stopAllClips runs while an async clip decode is still in flight', async () => {
    const harness = createAudioTestHarness({ fetchDelayMs: 25 });
    await withMockAudioGlobals(harness, async () => {
      const clips: AudioClipCue[] = [
        { id: 'bgm', src: '/audio/slow-bgm.wav', startTime: 0, duration: 30 },
      ];
      const sound = new PictureBookSoundEngine();

      sound.syncClipsAtTime(clips, 0);
      // Pause/switch scene before the fetch finishes
      sound.stopAllClips();

      await new Promise((r) => setTimeout(r, 50));
      expect(harness.startedSources).toHaveLength(0);
      sound.dispose();
    });
  });

  it('defers clip playback while AudioContext is suspended and starts cleanly once resumed', async () => {
    const harness = createAudioTestHarness({
      initialState: 'suspended',
      blockResumeUntilUnlocked: true,
    });
    await withMockAudioGlobals(harness, async () => {
      const clips: AudioClipCue[] = [
        { id: 'bgm', src: '/audio/bgm.wav', startTime: 0, duration: 60 },
      ];
      const sound = new PictureBookSoundEngine();
      await sound.preloadClips(clips);

      expect(sound.isContextSuspended()).toBe(true);
      sound.syncClipsAtTime(clips, 2.0);
      expect(harness.startedSources).toHaveLength(0);

      // Simulate user gesture unlocking AudioContext resume
      harness.unlockResume();
      const resumed = await sound.resumeContext();
      expect(resumed).toBe(true);
      expect(sound.isContextSuspended()).toBe(false);

      sound.syncClipsAtTime(clips, 5.0);
      expect(harness.startedSources).toHaveLength(1);
      expect(harness.startedSources[0].offset).toBeCloseTo(5.0, 4);
      sound.dispose();
    });
  });

  it('updates live speaker output gain immediately on toggleMute/setMuted for playing clips', async () => {
    const harness = createAudioTestHarness();
    await withMockAudioGlobals(harness, async () => {
      const clips: AudioClipCue[] = [
        { id: 'bgm', src: '/audio/bgm.wav', startTime: 0, duration: 60 },
      ];
      const sound = new PictureBookSoundEngine({ muted: false });
      await sound.preloadClips(clips);
      sound.syncClipsAtTime(clips, 0);

      expect(sound.toggleMute()).toBe(true);
      expect(harness.speakerGainValues[harness.speakerGainValues.length - 1]).toBe(0);

      expect(sound.toggleMute()).toBe(false);
      expect(harness.speakerGainValues[harness.speakerGainValues.length - 1]).toBe(1);

      sound.dispose();
    });
  });
});

describe('Studio Scene Switcher & SFX Audition removal', () => {
  it('getSwitcherScenes supports style-scoped crayon & classic_cel switchers and preserves all registered scenes', () => {
    const allSwitcherIds = getSwitcherScenes().map((s) => s.id);
    expect(allSwitcherIds).toEqual([
      'starter-moonlit-cat',
      'classic-moonlit-cat',
      'classic-christmas-hearth',
      'starter-bandana-dog',
      'starter-knight-dragon-hiccups',
    ]);

    expect(getSwitcherScenes('crayon').map((s) => s.id)).toEqual([
      'starter-moonlit-cat',
      'starter-bandana-dog',
      'starter-knight-dragon-hiccups',
    ]);

    expect(getSwitcherScenes('classic_cel').map((s) => s.id)).toEqual([
      'classic-moonlit-cat',
      'classic-christmas-hearth',
    ]);

    expect(allSwitcherIds).not.toContain('short_sample_1');
    expect(allSwitcherIds).not.toContain('moonlight-lullaby-story');
    expect(allSwitcherIds).not.toContain('meadow_party_3');
    expect(allSwitcherIds).not.toContain('corner-store-day');
    expect(allSwitcherIds).not.toContain('moonlit-garden');
    expect(allSwitcherIds).not.toContain('strawberry-beach-birthday');
    expect(allSwitcherIds).not.toContain('knight-dragon-quest');

    // All scenes (including legacy) remain accessible via getUniqueRegisteredScenes & SCENE_REGISTRY
    expect(getUniqueRegisteredScenes().length).toBeGreaterThanOrEqual(12);
    expect(SCENE_REGISTRY['1']).toBeDefined();
    expect(SCENE_REGISTRY['classic-moonlit-cat']).toBeDefined();
    expect(SCENE_REGISTRY['classic-christmas-hearth']).toBeDefined();
  });

  it('parses / vs /classic, /classic/mochi, /classic/classic-moonlit-cat, and /classic/<sceneId> routes cleanly', () => {
    const parsed = parseStudioUrlParams('', CORNER_STORE_DAY_SCENE, '/');
    expect(parsed.scene.id).toBe('corner-store-day');
    expect(parsed.artStyle).toBe('crayon');
    expect(parsed.bookFrame).toBe(true);
    expect(parsed.isClassicRoute).toBe(false);
    expect(parsed.canonicalPath).toBe('/');
    expect(parsed.canonicalQuery).toBe('?scene=corner-store-day');

    // /classic and /classic/ and /classic/mochi -> classic-moonlit-cat in classic_cel mode
    for (const p of ['/classic', '/classic/', '/classic/mochi']) {
      const res = parseStudioUrlParams('', CORNER_STORE_DAY_SCENE, p);
      expect(res.scene.id).toBe('classic-moonlit-cat');
      expect(res.artStyle).toBe('classic_cel');
      expect(res.bookFrame).toBe(false);
      expect(res.isClassicRoute).toBe(true);
      expect(res.canonicalPath).toBe('/classic/mochi');
    }

    const resById = parseStudioUrlParams(
      '',
      CORNER_STORE_DAY_SCENE,
      '/classic/classic-moonlit-cat'
    );
    expect(resById.scene.id).toBe('classic-moonlit-cat');
    expect(resById.artStyle).toBe('classic_cel');
    expect(resById.bookFrame).toBe(false);
    expect(resById.isClassicRoute).toBe(true);
    expect(resById.canonicalPath).toBe('/classic/classic-moonlit-cat');

    // /classic/christmas-hearth alias & /classic/classic-christmas-hearth
    const resXmasAlias = parseStudioUrlParams(
      '',
      CORNER_STORE_DAY_SCENE,
      '/classic/christmas-hearth'
    );
    expect(resXmasAlias.scene.id).toBe('classic-christmas-hearth');
    expect(resXmasAlias.artStyle).toBe('classic_cel');
    expect(resXmasAlias.bookFrame).toBe(false);
    expect(resXmasAlias.isClassicRoute).toBe(true);
    expect(resXmasAlias.canonicalPath).toBe('/classic/christmas-hearth');

    const resXmasFull = parseStudioUrlParams(
      '',
      CORNER_STORE_DAY_SCENE,
      '/classic/classic-christmas-hearth'
    );
    expect(resXmasFull.scene.id).toBe('classic-christmas-hearth');
    expect(resXmasFull.canonicalPath).toBe('/classic/classic-christmas-hearth');

    // Any registered scene at /classic/<id> renders in classic_cel mode by default
    const resOtherClassic = parseStudioUrlParams(
      '',
      CORNER_STORE_DAY_SCENE,
      '/classic/starter-bandana-dog'
    );
    expect(resOtherClassic.scene.id).toBe('starter-bandana-dog');
    expect(resOtherClassic.artStyle).toBe('classic_cel');
    expect(resOtherClassic.bookFrame).toBe(false);
    expect(resOtherClassic.canonicalPath).toBe('/classic/starter-bandana-dog');

    // Query-based overrides still work at /
    const parsedClassic = parseStudioUrlParams('?scene=classic-moonlit-cat');
    expect(parsedClassic.scene.id).toBe('classic-moonlit-cat');
    expect(parsedClassic.artStyle).toBe('classic_cel');
    expect(parsedClassic.bookFrame).toBe(false);

    const parsedOverride = parseStudioUrlParams(
      '?scene=starter-moonlit-cat&style=classic_cel'
    );
    expect(parsedOverride.artStyle).toBe('classic_cel');
    expect(parsedOverride.bookFrame).toBe(false);
    expect(parsedOverride.canonicalQuery).toContain('&style=classic_cel');

    const parsedOverrideWithBook = parseStudioUrlParams(
      '?book_frame=1',
      CORNER_STORE_DAY_SCENE,
      '/classic/mochi'
    );
    expect(parsedOverrideWithBook.bookFrame).toBe(true);
  });

  it('studio-cli.mjs serves SPA HTML for / and /classic/* while keeping root asset paths untouched', async () => {
    const cliUrl = new URL('../scripts/studio-cli.mjs', import.meta.url).href;
    const cliMod = (await import(cliUrl)) as {
      isStudioSpaRoute: (pathname: string) => boolean;
    };
    expect(cliMod.isStudioSpaRoute('/')).toBe(true);
    expect(cliMod.isStudioSpaRoute('/index.html')).toBe(true);
    expect(cliMod.isStudioSpaRoute('/classic')).toBe(true);
    expect(cliMod.isStudioSpaRoute('/classic/')).toBe(true);
    expect(cliMod.isStudioSpaRoute('/classic/mochi')).toBe(true);
    expect(cliMod.isStudioSpaRoute('/classic/classic-moonlit-cat')).toBe(true);

    expect(cliMod.isStudioSpaRoute('/src/main.ts')).toBe(false);
    expect(cliMod.isStudioSpaRoute('/audio/moonlit-cat-lullaby-bgm.wav')).toBe(false);
    expect(cliMod.isStudioSpaRoute('/__vendor/mp4-muxer.mjs')).toBe(false);
    expect(cliMod.isStudioSpaRoute('/__studio/save-export')).toBe(false);
    expect(cliMod.isStudioSpaRoute('/favicon.svg')).toBe(false);
  });

  it('mounts Studio UI without SFX Audition or short_sample clutter and wires audioClips lifecycle', () => {
    let renderedHtml = '';
    const createStubEl = (initialDataset: Record<string, string> = {}) => ({
      innerHTML: '',
      textContent: '',
      value: '0',
      max: '66',
      checked: true,
      disabled: false,
      style: { display: '' },
      dataset: { ...initialDataset },
      classList: {
        toggle: () => {},
        contains: () => false,
        add: () => {},
        remove: () => {},
      },
      addEventListener: () => {},
      querySelectorAll: () => [],
    });

    const elements = new Map<string, ReturnType<typeof createStubEl>>();
    const getOrCreate = (sel: string) => {
      if (!elements.has(sel)) elements.set(sel, createStubEl());
      return elements.get(sel)!;
    };

    const fakeContainer = {
      get innerHTML() {
        return renderedHtml;
      },
      set innerHTML(val: string) {
        renderedHtml = val;
      },
      querySelector: (sel: string) => getOrCreate(sel),
      querySelectorAll: () => [],
    } as unknown as HTMLElement;

    const preloadCalls: unknown[][] = [];
    const syncCalls: unknown[][] = [];
    const stopCalls: unknown[][] = [];
    const origPreload = PictureBookSoundEngine.prototype.preloadClips;
    const origSync = PictureBookSoundEngine.prototype.syncClipsAtTime;
    const origStop = PictureBookSoundEngine.prototype.stopAllClips;

    PictureBookSoundEngine.prototype.preloadClips = async function (...args) {
      preloadCalls.push(args);
      return origPreload.apply(this, args);
    };
    PictureBookSoundEngine.prototype.syncClipsAtTime = function (...args) {
      syncCalls.push(args);
      return origSync.apply(this, args);
    };
    PictureBookSoundEngine.prototype.stopAllClips = function (...args) {
      stopCalls.push(args);
      return origStop.apply(this, args);
    };
    const g = globalThis as unknown as {
      requestAnimationFrame?: (cb: FrameRequestCallback) => number;
      cancelAnimationFrame?: (id: number) => void;
    };
    const prevRaf = g.requestAnimationFrame;
    const prevCancelRaf = g.cancelAnimationFrame;
    g.requestAnimationFrame = () => 1;
    g.cancelAnimationFrame = () => {};

    try {
      const controller = mountStorybookStudio(
        fakeContainer,
        KNIGHT_DRAGON_QUEST_SCENE
      );

      // 1. Clean Scene Switcher at /: contains ?scene= links for the 3 crayon starter scenes + Style Studio switcher (/ & /classic/mochi)
      expect(renderedHtml).toContain('?scene=starter-moonlit-cat');
      expect(renderedHtml).toContain('?scene=starter-bandana-dog');
      expect(renderedHtml).toContain('?scene=starter-knight-dragon-hiccups');
      expect(renderedHtml).toContain('data-route-href="/"');
      expect(renderedHtml).toContain('data-route-href="/classic/mochi"');
      expect(renderedHtml).not.toContain('?scene=corner-store-day');
      expect(renderedHtml).not.toContain('?scene=moonlit-garden');
      expect(renderedHtml).not.toContain('?scene=strawberry-beach-birthday');
      expect(renderedHtml).not.toContain('short_sample=');
      expect(renderedHtml).not.toContain('&footage=');
      expect(renderedHtml).not.toContain('URL Footage Parameters');

      // 2. SFX Audition section completely removed
      expect(renderedHtml).not.toContain('sfx-audition-row');
      expect(renderedHtml).not.toContain('data-sfx-kind');
      expect(renderedHtml).not.toContain('SFX Audition');

      // 3. audioClips lifecycle wired into mount, play, seek, pause, and route/scene switch
      expect(preloadCalls.length).toBeGreaterThanOrEqual(1);
      expect(preloadCalls[0][0]).toBe(KNIGHT_DRAGON_QUEST_SCENE.audioClips);

      controller.play();
      expect(syncCalls.length).toBeGreaterThanOrEqual(1);

      controller.seek(15.0);
      expect(stopCalls.length).toBeGreaterThanOrEqual(1);

      controller.pause();
      controller.applyRoute('/classic/mochi');
      expect(controller.getState().fps).toBe(12);
      expect(controller.getState().routePath).toBe('/classic/mochi');
      expect(controller.getState().options.artStyle).toBe('classic_cel');
      expect(controller.getState().options.enableBookFrame).toBe(false);
      expect(elements.get('#inspector-stack-title')?.textContent).toBe(
        '🎞️ 1970s–80s Cel & 35mm Film Stack'
      );
      expect(elements.get('#label-layer-1')?.textContent).toBe(
        'Layer 1A/1B: Painted Gouache Board & Flat Acetate Cels'
      );
      expect(elements.get('#label-layer-2')?.textContent).toBe(
        'Layer 2: #xerox-ink Electrostatic Graphite Filter'
      );
      expect(elements.get('#label-layer-3')?.textContent).toBe(
        'Layer 3: 35mm Celluloid Film Grain & Vignette'
      );

      controller.applyRoute('/');
      expect(controller.getState().routePath).toBe('/');
      expect(controller.getState().options.artStyle).toBe('crayon');
      expect(elements.get('#inspector-stack-title')?.textContent).toBe(
        '🎨 Mandatory 3-Layer Stack & Vibrant Mode'
      );

      controller.applyUrlQuery('?scene=knight-dragon-quest');
      expect(preloadCalls.length).toBeGreaterThanOrEqual(4);

      controller.destroy();
    } finally {
      PictureBookSoundEngine.prototype.preloadClips = origPreload;
      PictureBookSoundEngine.prototype.syncClipsAtTime = origSync;
      PictureBookSoundEngine.prototype.stopAllClips = origStop;
      g.requestAnimationFrame = prevRaf;
      g.cancelAnimationFrame = prevCancelRaf;
    }
  });
});

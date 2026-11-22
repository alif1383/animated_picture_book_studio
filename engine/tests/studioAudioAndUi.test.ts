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
  it('getSwitcherScenes returns only the 3 built-in starter scenes (hiding older legacy scenes) and includes new registry scenes', () => {
    const switcherScenes = getSwitcherScenes();
    const ids = switcherScenes.map((s) => s.id);

    expect(ids).toEqual([
      'starter-moonlit-cat',
      'starter-bandana-dog',
      'starter-knight-dragon-hiccups',
    ]);

    expect(ids).not.toContain('short_sample_1');
    expect(ids).not.toContain('moonlight-lullaby-story');
    expect(ids).not.toContain('meadow_party_3');
    expect(ids).not.toContain('corner-store-day');
    expect(ids).not.toContain('moonlit-garden');
    expect(ids).not.toContain('strawberry-beach-birthday');
    expect(ids).not.toContain('knight-dragon-quest');

    // All scenes (including legacy) remain accessible via getUniqueRegisteredScenes & SCENE_REGISTRY
    expect(getUniqueRegisteredScenes().length).toBeGreaterThanOrEqual(10);
    expect(SCENE_REGISTRY['1']).toBeDefined();
  });

  it('defaults canonicalQuery to ?scene=<id> when no legacy short_sample parameter is given', () => {
    const parsed = parseStudioUrlParams('', CORNER_STORE_DAY_SCENE);
    expect(parsed.scene.id).toBe('corner-store-day');
    expect(parsed.canonicalQuery).toBe('?scene=corner-store-day');
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

      // 1. Clean Scene Switcher: contains ?scene= links for the 3 starter scenes, zero legacy/short_sample or footage sub-parts
      expect(renderedHtml).toContain('?scene=starter-moonlit-cat');
      expect(renderedHtml).toContain('?scene=starter-bandana-dog');
      expect(renderedHtml).toContain('?scene=starter-knight-dragon-hiccups');
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

      // 3. audioClips lifecycle wired into mount, play, seek, pause, and scene switch
      expect(preloadCalls.length).toBeGreaterThanOrEqual(1);
      expect(preloadCalls[0][0]).toBe(KNIGHT_DRAGON_QUEST_SCENE.audioClips);

      controller.play();
      expect(syncCalls.length).toBeGreaterThanOrEqual(1);

      controller.seek(15.0);
      expect(stopCalls.length).toBeGreaterThanOrEqual(1);

      controller.pause();
      controller.applyUrlQuery('?scene=knight-dragon-quest');
      expect(preloadCalls.length).toBeGreaterThanOrEqual(2);

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

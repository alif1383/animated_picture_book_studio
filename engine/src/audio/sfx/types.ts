import type { AudioCueKind } from '../../engine/schema';

export type ProceduralSfxCategory =
  | 'musical_cue'
  | 'foley'
  | 'party'
  | 'nature'
  | 'fantasy'
  | 'character';

export interface FilteredNoiseOptions {
  duration: number;
  startTime: number;
  filterType: BiquadFilterType;
  startFreq: number;
  peakFreq?: { freq: number; atRatio: number };
  endFreq?: number;
  q: number;
  peakGain: number;
  attackSec: number;
  envelope?: (i: number, count: number, sampleRate: number) => number;
}

export interface ProceduralSfxHelpers {
  readonly masterVolume: number;
  connectOutput(ctx: BaseAudioContext, sourceNode: AudioNode): void;
  synthesizeMusicBoxNote(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    primaryWave: OscillatorType,
    overtoneMultiple: number,
    peakGain: number,
    startTime: number
  ): void;
  scheduleFilteredNoise(
    ctx: BaseAudioContext,
    options: FilteredNoiseOptions
  ): void;
  schedulePitchBlip(
    ctx: BaseAudioContext,
    wave: OscillatorType,
    startFreq: number,
    endFreq: number,
    duration: number,
    peakGain: number,
    startTime: number
  ): void;
  scheduleCrayonScribble(
    ctx: BaseAudioContext,
    centerFreq: number,
    duration: number,
    startTime: number
  ): void;
}

export interface ProceduralSfxModule {
  readonly kind: AudioCueKind;
  readonly title: string;
  readonly category: ProceduralSfxCategory;
  readonly description: string;
  readonly themes: readonly string[];
  readonly defaultFreqHz: number;
  readonly defaultDurationSec: number;
  synthesize(
    ctx: BaseAudioContext,
    freq: number,
    duration: number,
    startTime: number,
    helpers: ProceduralSfxHelpers
  ): void;
}

export interface AudioClipCatalogEntry {
  readonly id: string;
  readonly filename: string;
  readonly src: string;
  readonly title: string;
  readonly category: 'bgm' | 'ambient' | 'sfx' | 'foley';
  readonly durationSec: number;
  readonly defaultVolume: number;
  readonly description: string;
  readonly themes: readonly string[];
  readonly generatorModule: string;
}

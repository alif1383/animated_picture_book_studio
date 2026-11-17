/**
 * Unit & integration tests for Google AI Studio Generate Speech (Gemini TTS)
 * and the `picture-book-voiceover` skill (`scripts/generate_audio.mjs`).
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ENGINE_ROOT = path.resolve(process.cwd());
const PLUGIN_ROOT = path.resolve(ENGINE_ROOT, '..');

async function loadGenerateAudioModule() {
  const scriptPath = path.join(ENGINE_ROOT, 'scripts', 'generate_audio.mjs');
  return await import(pathToFileURL(scriptPath).href);
}

/**
 * Helper to create a tiny valid 24kHz 16-bit mono PCM buffer for mock Gemini responses.
 */
function makeMockPcmBytes(numSamples = 4800): Buffer {
  const buf = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.round(Math.sin((2 * Math.PI * 440 * i) / 24000) * 12000);
    buf.writeInt16LE(sample, i * 2);
  }
  return buf;
}

describe('Google AI Studio Generate Speech (Gemini TTS) & picture-book-voiceover skill', () => {
  it('exposes all 30 prebuilt Google AI Studio voices and 40 character presets with full vocal classifications', async () => {
    const mod = await loadGenerateAudioModule();
    expect(typeof mod.GEMINI_PREBUILT_VOICES).toBe('object');
    const voiceNames = Object.keys(mod.GEMINI_PREBUILT_VOICES);
    expect(voiceNames.length).toBe(30);
    expect(Array.isArray(mod.VOICE_CATALOG)).toBe(true);
    expect(mod.VOICE_CATALOG.length).toBe(30);

    for (const entry of mod.VOICE_CATALOG) {
      expect(['female', 'male']).toContain(entry.gender);
      expect(['child_youth', 'young_adult', 'adult', 'mature_elder']).toContain(entry.ageGroup);
      expect(['high', 'medium_high', 'medium', 'medium_low', 'low']).toContain(entry.pitch);
      expect([
        'crystalline',
        'smooth',
        'warm_clear',
        'breathy',
        'husky_textured',
        'gravelly',
      ]).toContain(entry.roughness);
      expect([
        'soothing_calm',
        'steady_measured',
        'breezy_natural',
        'upbeat_playful',
        'bold_theatrical',
      ]).toContain(entry.energy);
      expect(entry.accentAffinity.length).toBeGreaterThan(5);
      expect(entry.description.length).toBeGreaterThan(20);
      expect(entry.recommendedRoles.length).toBeGreaterThanOrEqual(2);
      expect(entry.themes.length).toBeGreaterThanOrEqual(3);
    }

    const presets = mod.CHARACTER_VOICE_PRESETS;
    expect(Object.keys(presets).length).toBe(40);
    expect(mod.CHARACTER_VOICE_PRESET_CATALOG.length).toBe(40);
    expect(presets.narrator.voice).toBe('Sulafat');
    expect(presets.little_girl.voice).toBe('Leda');
    expect(presets.shopkeeper.voice).toBe('Orus');
    expect(presets.knight.voice).toBe('Fenrir');
    expect(presets.dragon.voice).toBe('Algenib');
    expect(presets.dragon.roughness).toBe('gravelly');
    expect(presets.boy.voice).toBe('Puck');
    expect(presets.girl.voice).toBe('Leda');
    expect(presets.princess.voice).toBe('Zephyr');
    expect(presets.wizard.voice).toBe('Iapetus');
    expect(presets.wise_elder.voice).toBe('Gacrux');
    expect(presets.villain.voice).toBe('Enceladus');
  });

  it('filters voices and character presets by gender, age, roughness, energy, accent, and story theme', async () => {
    const mod = await loadGenerateAudioModule();

    // Filter by male + gravelly -> Algenib & dragon
    const gravellyMales = mod.filterVoiceCatalog({ gender: 'male', roughness: 'gravelly' });
    expect(gravellyMales.voices.map((v: any) => v.voiceName)).toEqual(['Algenib']);
    expect(gravellyMales.characterPresets.map((p: any) => p.character)).toContain('dragon');

    // Filter by female + child_youth -> Leda & little_girl / birthday_strawberry / hello_bug / girl
    const youngFemales = mod.filterVoiceCatalog({ gender: 'female', age: 'child_youth' });
    expect(youngFemales.voices.map((v: any) => v.voiceName)).toEqual(['Leda']);
    expect(youngFemales.characterPresets.map((p: any) => p.character)).toContain('little_girl');

    // Filter by theme: bedtime
    const bedtime = mod.filterVoiceCatalog({ theme: 'bedtime' });
    expect(bedtime.voices.some((v: any) => v.voiceName === 'Vindemiatrix')).toBe(true);
    expect(bedtime.voices.some((v: any) => v.voiceName === 'Sulafat')).toBe(true);
    expect(bedtime.characterPresets.some((p: any) => p.character === 'bedtime')).toBe(true);
    expect(bedtime.characterPresets.some((p: any) => p.character === 'moon')).toBe(true);

    // Filter by accent affinity: British
    const british = mod.filterVoiceCatalog({ accent: 'British' });
    expect(british.voices.some((v: any) => v.voiceName === 'Sadaltager')).toBe(true);
    expect(british.voices.some((v: any) => v.voiceName === 'Fenrir')).toBe(true);
  });

  it('persists and resolves the Google AI Studio API key via set-key and check-key', async () => {
    const mod = await loadGenerateAudioModule();
    const tmpConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-tts-cfg-'));
    const prevConfigDir = process.env.PICTURE_BOOK_CONFIG_DIR;
    const prevGeminiKey = process.env.GEMINI_API_KEY;
    const prevGoogleKey = process.env.GOOGLE_API_KEY;

    try {
      process.env.PICTURE_BOOK_CONFIG_DIR = tmpConfigDir;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      const emptyCheckCode = await mod.runCli(['check-key']);
      expect(emptyCheckCode).toBe(1);

      const testKey = 'AIzaSyTestKeyForAnimatedPictureBook12345';
      const setCode = await mod.runCli(['set-key', testKey]);
      expect(setCode).toBe(0);

      const cfgFile = mod.getPluginConfigFilePath(tmpConfigDir);
      expect(fs.existsSync(cfgFile)).toBe(true);

      const checkAfterCode = await mod.runCli(['check-key']);
      expect(checkAfterCode).toBe(0);

      const resolved = mod.resolveGeminiApiKey({ configDir: tmpConfigDir });
      expect(resolved.apiKey).toBe(testKey);
      expect(resolved.source).toContain('config:');
    } finally {
      if (prevConfigDir === undefined) delete process.env.PICTURE_BOOK_CONFIG_DIR;
      else process.env.PICTURE_BOOK_CONFIG_DIR = prevConfigDir;
      if (prevGeminiKey !== undefined) process.env.GEMINI_API_KEY = prevGeminiKey;
      if (prevGoogleKey !== undefined) process.env.GOOGLE_API_KEY = prevGoogleKey;
      fs.rmSync(tmpConfigDir, { recursive: true, force: true });
    }
  });

  it('builds Gemini 3.8 speech_metadata payloads and Gemini 2.5 legacy payloads accurately', async () => {
    const mod = await loadGenerateAudioModule();

    // 1. Single-speaker Gemini 3.8 Flash TTS with character preset + vocal tags
    const resolved38 = mod.resolveVoiceAndStyle({
      character: 'princess',
      style: 'Excited and breathless',
    });
    expect(resolved38.voice).toBe('Zephyr');

    const payload38 = mod.buildGeminiTtsRequest({
      model: 'gemini-3.8-flash-tts',
      voice: resolved38.voice,
      style: resolved38.style,
      text: '<gasp> Look at the floating lantern! <laugh>',
    });
    expect(payload38.contents[0].parts[0].text).toBe(
      '<gasp> Look at the floating lantern! <laugh>'
    );
    expect(payload38.contents[0].parts[0].speech_metadata).toEqual({
      style: 'Excited and breathless',
    });
    expect(
      payload38.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName
    ).toBe('Zephyr');

    // 2. Single-speaker Gemini 2.5 Flash Preview TTS (prepends style to text, no speech_metadata)
    const payload25 = mod.buildGeminiTtsRequest({
      model: 'gemini-2.5-flash-preview-tts',
      voice: 'Charon',
      style: 'Mysterious whisper',
      text: 'The secret door is behind the bookshelf.',
    });
    expect(payload25.contents[0].parts[0].speech_metadata).toBeUndefined();
    expect(payload25.contents[0].parts[0].text).toContain('Mysterious whisper');
    expect(payload25.contents[0].parts[0].text).toContain(
      'The secret door is behind the bookshelf.'
    );

    // 3. Multi-speaker Gemini 3.8 dialogue payload
    const payloadMulti = mod.buildGeminiTtsRequest({
      model: 'gemini-3.8-flash-tts',
      speakers: { Narrator: 'narrator', Leo: 'boy' },
      turns: [
        { speaker: 'Narrator', text: 'The lantern flickered.', style: 'Warm storyteller' },
        { speaker: 'Leo', text: '<gasp> It is glowing!', style: 'Amazed' },
      ],
    });
    expect(payloadMulti.contents[0].parts.length).toBe(2);
    expect(payloadMulti.contents[0].parts[1].speech_metadata).toEqual({
      speaker: 'Leo',
      style: 'Amazed',
    });
    const speakerConfigs =
      payloadMulti.generationConfig.speechConfig.multiSpeakerVoiceConfig.speakerVoiceConfigs;
    expect(speakerConfigs).toEqual([
      { speaker: 'Narrator', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Sulafat' } } },
      { speaker: 'Leo', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
    ]);
  });

  it('decodes both raw 24kHz PCM (Gemini 2.5) and RIFF WAV (Gemini 3.8) into valid WAV buffers', async () => {
    const mod = await loadGenerateAudioModule();
    const rawPcm = makeMockPcmBytes(2400); // 0.1s at 24kHz
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-wav-test-'));

    try {
      // Raw PCM -> wrapped with 44-byte RIFF header
      const wrappedWav = mod.decodeGeminiAudioToWavBuffer(
        rawPcm.toString('base64'),
        'audio/L16;codec=pcm;rate=24000'
      );
      expect(wrappedWav.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(wrappedWav.subarray(8, 12).toString('ascii')).toBe('WAVE');
      expect(wrappedWav.length).toBe(44 + rawPcm.length);

      const wavFile = path.join(tmpDir, 'test.wav');
      fs.writeFileSync(wavFile, wrappedWav);
      const info = mod.readWavInfo(wavFile);
      expect(info.sampleRate).toBe(24000);
      expect(info.durationSec).toBe(0.1);

      // Already a RIFF WAV -> preserved without double-wrapping
      const passthroughWav = mod.decodeGeminiAudioToWavBuffer(
        wrappedWav.toString('base64'),
        'audio/wav'
      );
      expect(passthroughWav.length).toBe(wrappedWav.length);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('synthesizes single-speaker tts, multi-speaker dialogue, and custom voice-design against a mock AI Studio endpoint', async () => {
    const mod = await loadGenerateAudioModule();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-tts-http-'));
    const rawPcm = makeMockPcmBytes(12000); // 0.5s at 24kHz
    const mockWav = mod.decodeGeminiAudioToWavBuffer(
      rawPcm.toString('base64'),
      'audio/L16;codec=pcm;rate=24000'
    );

    const capturedRequests: Array<{ url: string; body: any }> = [];
    const server = http.createServer((req: any, res: any) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        capturedRequests.push({ url: req.url, body });

        if (req.url.startsWith('/v1beta/voices')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              id: 'voice_clockwork_owl_01',
              name: 'voices/voice_clockwork_owl_01',
              sample_audio: {
                data: mockWav.toString('base64'),
                mime_type: 'audio/wav',
              },
            })
          );
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'audio/wav',
                        data: mockWav.toString('base64'),
                      },
                    },
                  ],
                },
              },
            ],
          })
        );
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as any).port;
    const apiBaseUrl = `http://127.0.0.1:${port}/v1beta`;
    const prevBase = process.env.GEMINI_API_BASE_URL;
    const prevConfigDir = process.env.PICTURE_BOOK_CONFIG_DIR;

    try {
      process.env.GEMINI_API_BASE_URL = apiBaseUrl;
      process.env.PICTURE_BOOK_CONFIG_DIR = tmpDir;

      // 1. Single-speaker TTS via CLI
      const singleOut = path.join(tmpDir, 'single_narration.wav');
      const singleCode = await mod.runCli([
        'tts',
        '--character',
        'narrator',
        '--style',
        'Warm bedtime story',
        '--text',
        'Once upon a starlit night <short pause> the moon smiled.',
        '--api-key',
        'AIzaSyMockKey123456',
        '--out',
        singleOut,
      ]);
      expect(singleCode).toBe(0);
      expect(fs.existsSync(singleOut)).toBe(true);
      expect(mod.readWavInfo(singleOut).durationSec).toBe(0.5);

      // 2. Multi-speaker dialogue via CLI
      const dialogueOut = path.join(tmpDir, 'dialogue_scene.wav');
      const dialogueCode = await mod.runCli([
        'dialogue',
        '--speakers',
        'Narrator:Sulafat,Knight:knight',
        '--style',
        'Storybook adventure',
        '--text',
        'Narrator: Sir Leo raised his lantern.\nKnight: <laugh> Fear not, little dragon!',
        '--api-key',
        'AIzaSyMockKey123456',
        '--out',
        dialogueOut,
      ]);
      expect(dialogueCode).toBe(0);
      expect(fs.existsSync(dialogueOut)).toBe(true);
      expect(mod.readWavInfo(dialogueOut).durationSec).toBe(0.5);

      // 3. Custom Voice Design via CLI
      const designSampleOut = path.join(tmpDir, 'owl_sample.wav');
      const designCode = await mod.runCli([
        'voice-design',
        '--prompt',
        'A tiny squeaky clockwork owl with a British accent',
        '--name',
        'clockwork_owl',
        '--api-key',
        'AIzaSyMockKey123456',
        '--out',
        designSampleOut,
      ]);
      expect(designCode).toBe(0);
      expect(fs.existsSync(designSampleOut)).toBe(true);
      const savedCfg = mod.readPluginConfig(tmpDir);
      expect(savedCfg.customVoices.clockwork_owl.voiceId).toBe('voice_clockwork_owl_01');
      expect(capturedRequests.length).toBe(3);
    } finally {
      if (prevBase === undefined) delete process.env.GEMINI_API_BASE_URL;
      else process.env.GEMINI_API_BASE_URL = prevBase;
      if (prevConfigDir === undefined) delete process.env.PICTURE_BOOK_CONFIG_DIR;
      else process.env.PICTURE_BOOK_CONFIG_DIR = prevConfigDir;
      server.close();
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('ships the picture-book-voiceover skill and keeps generate_audio.mjs synced across engine and skills', () => {
    const voiceoverSkillMd = path.join(
      PLUGIN_ROOT,
      'skills',
      'picture-book-voiceover',
      'SKILL.md'
    );
    const voiceCatalogMd = path.join(
      PLUGIN_ROOT,
      'skills',
      'picture-book-voiceover',
      'references',
      'voice-catalog.md'
    );
    const engineScript = path.join(ENGINE_ROOT, 'scripts', 'generate_audio.mjs');
    const voiceoverScript = path.join(
      PLUGIN_ROOT,
      'skills',
      'picture-book-voiceover',
      'scripts',
      'generate_audio.mjs'
    );
    const audioScript = path.join(
      PLUGIN_ROOT,
      'skills',
      'picture-book-audio',
      'scripts',
      'generate_audio.mjs'
    );

    expect(fs.existsSync(voiceoverSkillMd)).toBe(true);
    expect(fs.existsSync(voiceCatalogMd)).toBe(true);
    expect(fs.existsSync(voiceoverScript)).toBe(true);

    const skillContent = fs.readFileSync(voiceoverSkillMd, 'utf8');
    expect(skillContent).toContain('https://aistudio.google.com/apikey');
    expect(skillContent).toContain('set-key');
    expect(skillContent).toContain('check-key');
    expect(skillContent).toContain('gemini-3.8-flash-tts');

    // Verify all 3 copies of generate_audio.mjs are identical
    const engineBytes = fs.readFileSync(engineScript, 'utf8');
    expect(fs.readFileSync(voiceoverScript, 'utf8')).toBe(engineBytes);
    expect(fs.readFileSync(audioScript, 'utf8')).toBe(engineBytes);
  });

  it('does NOT fall back to the OS synthesizer by default when no API key is provided unless --os-fallback is explicitly passed', async () => {
    const mod = await loadGenerateAudioModule();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pb-tts-nokey-'));
    const prevConfigDir = process.env.PICTURE_BOOK_CONFIG_DIR;
    const prevGeminiKey = process.env.GEMINI_API_KEY;
    const prevGoogleKey = process.env.GOOGLE_API_KEY;
    const prevMock = process.env.GEMINI_TTS_MOCK;

    try {
      process.env.PICTURE_BOOK_CONFIG_DIR = tmpDir;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_API_KEY;
      delete process.env.GEMINI_TTS_MOCK;

      // 1. Default behavior with no API key: must return exit code 1 and NOT create a fallback WAV
      const blockedTtsOut = path.join(tmpDir, 'should_not_exist.wav');
      const blockedTtsCode = await mod.runCli([
        'tts',
        '--character',
        'narrator',
        '--text',
        'This should not fall back to the OS synthesizer.',
        '--out',
        blockedTtsOut,
      ]);
      expect(blockedTtsCode).toBe(1);
      expect(fs.existsSync(blockedTtsOut)).toBe(false);

      const blockedDialogueOut = path.join(tmpDir, 'should_not_exist_dialogue.wav');
      const blockedDialogueCode = await mod.runCli([
        'dialogue',
        '--speakers',
        'Narrator:Sulafat,Girl:little_girl',
        '--text',
        'Narrator: Hello there.\nGirl: Hi!',
        '--out',
        blockedDialogueOut,
      ]);
      expect(blockedDialogueCode).toBe(1);
      expect(fs.existsSync(blockedDialogueOut)).toBe(false);

      // 2. Explicit --os-fallback opt-in: creates the fallback WAV when explicitly requested
      const explicitFallbackOut = path.join(tmpDir, 'explicit_os_fallback.wav');
      const explicitFallbackCode = await mod.runCli([
        'tts',
        '--character',
        'narrator',
        '--text',
        'Explicit OS fallback requested.',
        '--os-fallback',
        '--out',
        explicitFallbackOut,
      ]);
      expect(explicitFallbackCode).toBe(0);
      expect(fs.existsSync(explicitFallbackOut)).toBe(true);
    } finally {
      if (prevConfigDir === undefined) delete process.env.PICTURE_BOOK_CONFIG_DIR;
      else process.env.PICTURE_BOOK_CONFIG_DIR = prevConfigDir;
      if (prevGeminiKey !== undefined) process.env.GEMINI_API_KEY = prevGeminiKey;
      if (prevGoogleKey !== undefined) process.env.GOOGLE_API_KEY = prevGoogleKey;
      if (prevMock !== undefined) process.env.GEMINI_TTS_MOCK = prevMock;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

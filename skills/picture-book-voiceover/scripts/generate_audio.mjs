#!/usr/bin/env node
/**
 * generate_audio.mjs — Zero-dependency Node/agy-node Audio & Google AI Studio
 * Gemini TTS Voiceover CLI for Animated Picture Book Studio.
 *
 * Works on any machine with only Antigravity (`agy-node`) installed — zero Python
 * or npm packages required!
 *
 * Subcommands:
 *   tts          "<text>" --name <clip-name> [--voice <voice>] [--character <kind>] [--style "<style>"] [--model <model>] [--start-time 0] [--output ...]
 *   dialogue     "<Speaker1: text | Speaker2: text>" --speakers "Speaker1:Leda,Speaker2:Orus" --name <clip-name> [--style "..."] [--model <model>]
 *   voice-design "<persona prompt>" --name <voice-alias> [--character <kind>] [--output <sample.wav>]
 *   voices       [--character <kind>] [--search <query>] [--json]
 *   set-key      <GEMINI_API_KEY>
 *   check-key    [--json]
 *   sfx          <preset> --name <clip-name> [--duration 0.5] [--freq 440] [--freq-end ...]
 *   tone         <preset> (alias for sfx)
 *   info         <file> [--name <id>] [--start-time 0]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const SAMPLE_RATE = 44100;
export const GEMINI_TTS_SAMPLE_RATE = 24000;
export const DEFAULT_GEMINI_TTS_MODEL = 'gemini-3.8-flash-tts';
export const FALLBACK_GEMINI_TTS_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-2.5-flash-preview-tts',
];

/**
 * All 30 official Google AI Studio Gemini TTS Prebuilt Voices and their vocal traits.
 */
export const GEMINI_PREBUILT_VOICES = {
  Zephyr: { gender: 'female', tone: 'Bright', bestFor: 'Playful characters, cats, cheerful narration' },
  Puck: { gender: 'male', tone: 'Upbeat', bestFor: 'Bouncy comedic characters, musical leaders, heralds' },
  Charon: { gender: 'male', tone: 'Informative', bestFor: 'Deep sleepy moon, gentle dragons, dramatic characters' },
  Kore: { gender: 'female', tone: 'Firm', bestFor: 'Clear storytellers, confident heroines, cherry twins' },
  Fenrir: { gender: 'male', tone: 'Excitable', bestFor: 'Brave knights, action scenes, enthusiastic heroes' },
  Leda: { gender: 'female', tone: 'Youthful', bestFor: 'Little girl, birthday strawberry, child characters' },
  Orus: { gender: 'male', tone: 'Firm', bestFor: 'Kindly shopkeeper, loyal soldier, warm baritone roles' },
  Aoede: { gender: 'female', tone: 'Breezy', bestFor: 'Warm picture-book narrator, morning sun, lyrical reading' },
  Callirrhoe: { gender: 'female', tone: 'Easy-going', bestFor: 'Relaxed summer beach stories, friendly companions' },
  Autonoe: { gender: 'female', tone: 'Bright', bestFor: 'Sparkling fairy-tale narration, upbeat dialogue' },
  Enceladus: { gender: 'male', tone: 'Breathy', bestFor: 'Soft bedtime whispers, wind spirits, mysterious woods' },
  Iapetus: { gender: 'male', tone: 'Clear', bestFor: 'Crisp narration, counting scenes, clear dialogue' },
  Umbriel: { gender: 'male', tone: 'Easy-going', bestFor: 'Mellow woodland characters, relaxed storytelling' },
  Algieba: { gender: 'male', tone: 'Smooth', bestFor: 'Smooth evening narration, calm elders' },
  Despina: { gender: 'female', tone: 'Smooth', bestFor: 'Soothing lullaby narration, gentle mothers' },
  Erinome: { gender: 'female', tone: 'Clear', bestFor: 'Articulate storybook reading, educational tales' },
  Algenib: { gender: 'male', tone: 'Gravelly', bestFor: 'Grumpy forest dragons, rough-voiced monsters, pirates' },
  Rasalgethi: { gender: 'male', tone: 'Informative', bestFor: 'Wise owls, royal chroniclers, lore narration' },
  Laomedeia: { gender: 'female', tone: 'Upbeat', bestFor: 'Party celebrations, cheering friends' },
  Achernar: { gender: 'female', tone: 'Soft', bestFor: 'Quiet nighttime scenes, shy sprouts, lullabies' },
  Alnilam: { gender: 'male', tone: 'Firm', bestFor: 'Royal castle guards, steady captains' },
  Schedar: { gender: 'male', tone: 'Even', bestFor: 'Balanced classic audiobook narration' },
  Gacrux: { gender: 'female', tone: 'Mature', bestFor: 'Grandmotherly storyteller, wise queen' },
  Pulcherrima: { gender: 'female', tone: 'Forward', bestFor: 'Theatrical stage announcements, bold characters' },
  Achird: { gender: 'male', tone: 'Friendly', bestFor: 'Warm neighborly dialogue, helpful villagers' },
  Zubenelgenubi: { gender: 'male', tone: 'Casual', bestFor: 'Laid-back beach buddies, conversational turns' },
  Vindemiatrix: { gender: 'female', tone: 'Gentle', bestFor: 'Tender bedtime goodnights, comforting narration' },
  Sadachbia: { gender: 'male', tone: 'Lively', bestFor: 'Animated adventure scenes, lively banter' },
  Sadaltager: { gender: 'male', tone: 'Knowledgeable', bestFor: 'Wizardly mentors, classic fables' },
  Sulafat: { gender: 'female', tone: 'Warm', bestFor: 'Cozy fireside picture-book narrator, heartfelt endings' },
};

/**
 * Curated mapping of all 19 Picture-Book Studio `CharacterKind` rigs (plus `narrator` & mood roles)
 * to Google AI Studio Gemini TTS prebuilt voices and default `speech_metadata.style` directions.
 */
export const CHARACTER_VOICE_PRESETS = {
  narrator: {
    voice: 'Sulafat',
    style: 'Warm, gentle, expressive children\'s picture-book narrator with unhurried storybook pacing and wonder',
  },
  storyteller: {
    voice: 'Aoede',
    style: 'Breezy, lyrical, enchanting picture-book storyteller reading aloud to children',
  },
  bedtime: {
    voice: 'Vindemiatrix',
    style: 'Soft, soothing, unhurried bedtime lullaby narrator, calm and dreamy',
  },
  little_girl: {
    voice: 'Leda',
    style: 'Bright, curious, sweet young girl voice, cheerful and full of childhood wonder',
  },
  shopkeeper: {
    voice: 'Orus',
    style: 'Warm, welcoming, kindly neighborhood corner-store shopkeeper with a friendly smile in his voice',
  },
  moon: {
    voice: 'Enceladus',
    style: 'Soft, sleepy bedtime whisper-croon, calm, dreamy, and comforting like starlight',
  },
  sun: {
    voice: 'Aoede',
    style: 'Warm, golden, cheerful morning voice radiating gentle encouragement and sunshine',
  },
  cat: {
    voice: 'Zephyr',
    style: 'Light, playful, soft kitten-like voice with tiny curious inflections',
  },
  singing_radish: {
    voice: 'Puck',
    style: 'Upbeat, musical, theatrical and bouncy voice, joyful and ready to burst into song',
  },
  birthday_strawberry: {
    voice: 'Leda',
    style: 'Sweet, high-spirited, endearing little berry voice, fluttery when shy and giggly when happy',
  },
  watermelon_slice: {
    voice: 'Zubenelgenubi',
    style: 'Relaxed, sunny, friendly and mellow summer beach buddy voice',
  },
  blue_party_cat: {
    voice: 'Zephyr',
    style: 'Playful, upbeat, rhythmic party cat voice with festive enthusiasm',
  },
  hello_bug: {
    voice: 'Leda',
    style: 'Tiny, polite, chipper and friendly little meadow bug voice',
  },
  party_banana: {
    voice: 'Puck',
    style: 'Bouncy, comedic, goofy and expressive cartoon party voice',
  },
  crying_onion: {
    voice: 'Charon',
    style: 'Comically sniffly and melodramatic when worried, turning into relieved happy cheering',
  },
  cherry_twins: {
    voice: 'Kore',
    style: 'Bubbly, rhythmic, sing-song twin voice brimming with cheerful energy',
  },
  acorn_twins: {
    voice: 'Puck',
    style: 'Crisp, woodland-sprite voice with playful staccato energy',
  },
  olive_sprout: {
    voice: 'Achernar',
    style: 'Gentle, soft-spoken, innocent tiny sprout voice',
  },
  knight: {
    voice: 'Fenrir',
    style: 'Heroic, warm, chivalrous storybook knight—bold in proclamation yet kind-hearted',
  },
  soldier: {
    voice: 'Orus',
    style: 'Sturdy, loyal, earnest royal guardsman, slightly nervous around spooky woods',
  },
  dragon: {
    voice: 'Algenib',
    style: 'Deep, gravelly, rumbling yet lovable storybook dragon—grumpy when his tooth hurts, sweet and grateful once helped',
  },
  villager: {
    voice: 'Puck',
    style: 'Lively, theatrical medieval town herald and expressive village storyteller',
  },
  boy: {
    voice: 'Puck',
    style: 'Youthful, curious, energetic young boy voice in an animated storybook',
  },
  girl: {
    voice: 'Leda',
    style: 'Bright, youthful, enthusiastic young girl voice full of wonder',
  },
  man: {
    voice: 'Orus',
    style: 'Warm, steady, friendly adult man voice',
  },
  woman: {
    voice: 'Aoede',
    style: 'Warm, articulate, expressive adult woman voice',
  },
  elder_man: {
    voice: 'Charon',
    style: 'Kind, weathered, grandfatherly elder voice with unhurried warmth',
  },
  elder_woman: {
    voice: 'Vindemiatrix',
    style: 'Gentle, calm, grandmotherly elder woman voice with soothing cadence',
  },
  wise_elder: {
    voice: 'Gacrux',
    style: 'Deep, wise, resonant sage voice speaking with calm authority and warmth',
  },
  king: {
    voice: 'Sadaltager',
    style: 'Noble, regal, authoritative yet warm royal king voice',
  },
  queen: {
    voice: 'Despina',
    style: 'Regal, poised, warm and majestic royal queen voice',
  },
  prince: {
    voice: 'Zephyr',
    style: 'Bright, earnest, spirited young prince voice',
  },
  princess: {
    voice: 'Zephyr',
    style: 'Bright, clear, warm and spirited princess voice',
  },
  wizard: {
    voice: 'Iapetus',
    style: 'Mysterious, theatrical, wise old wizard voice with magical resonance',
  },
  witch: {
    voice: 'Pulcherrima',
    style: 'Dramatic, intriguing, mischievous storybook witch voice',
  },
  fairy: {
    voice: 'Laomedeia',
    style: 'Light, sparkling, whimsical fairy voice with musical cadence',
  },
  angel: {
    voice: 'Achernar',
    style: 'Soft, serene, ethereal angelic voice with gentle reverb-like calm',
  },
  genie: {
    voice: 'Sadachbia',
    style: 'Lively, booming, exuberant magical genie voice with playful charm',
  },
  villain: {
    voice: 'Enceladus',
    style: 'Low, dramatic, scheming storybook villain voice, theatrical but family-friendly',
  },
  shadow_figure: {
    voice: 'Umbriel',
    style: 'Hushed, enigmatic, shadowy whispery voice with quiet suspense',
  },
};

/**
 * Legacy & shorthand voice aliases mapped to Gemini TTS prebuilt voice names.
 */
export const VOICE_SHORTCUT_ALIASES = {
  ana: 'Leda',
  aria: 'Aoede',
  guy: 'Puck',
  sonia: 'Sulafat',
  en_us_ananeural: 'Leda',
  'en-us-ananeural': 'Leda',
  'en-us-arianeural': 'Aoede',
  'en-us-guyneural': 'Puck',
  'en-gb-sonianeural': 'Sulafat',
};

// ---------------------------------------------------------------------------
// Config & API Key Management (`~/.gemini/config/animated_picture_book_studio/config.json`)
// ---------------------------------------------------------------------------

export function getPluginConfigDir(overrideDir = null) {
  if (overrideDir) return path.resolve(overrideDir);
  if (process.env.PICTURE_BOOK_CONFIG_DIR) {
    return path.resolve(process.env.PICTURE_BOOK_CONFIG_DIR);
  }
  return path.join(os.homedir(), '.gemini', 'config', 'animated_picture_book_studio');
}

export function getPluginConfigFilePath(overrideDir = null) {
  return path.join(getPluginConfigDir(overrideDir), 'config.json');
}

export function readPluginConfig(overrideDir = null) {
  const cfgPath = getPluginConfigFilePath(overrideDir);
  if (!fs.existsSync(cfgPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  } catch {
    return {};
  }
}

export function writePluginConfig(patch, overrideDir = null) {
  const cfgDir = getPluginConfigDir(overrideDir);
  const cfgPath = getPluginConfigFilePath(overrideDir);
  fs.mkdirSync(cfgDir, { recursive: true });
  const existing = readPluginConfig(overrideDir);
  const merged = {
    ...existing,
    ...patch,
    customVoices: {
      ...(existing.customVoices || {}),
      ...(patch.customVoices || {}),
    },
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(cfgPath, JSON.stringify(merged, null, 2) + '\n', {
    encoding: 'utf8',
    mode: 0o600,
  });
  return { configPath: cfgPath, config: merged };
}

function parseDotEnvFile(envFilePath) {
  if (!fs.existsSync(envFilePath)) return {};
  try {
    const raw = fs.readFileSync(envFilePath, 'utf8');
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  } catch {
    return {};
  }
}

export function maskApiKey(key) {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

/**
 * Resolves the Google AI Studio API key across CLI flags, environment variables,
 * persistent `~/.gemini/config/animated_picture_book_studio/config.json`, and `.env` files.
 */
export function resolveGeminiApiKey(opts = {}) {
  if (opts.apiKey && String(opts.apiKey).trim()) {
    const key = String(opts.apiKey).trim();
    return { apiKey: key, source: 'cli_flag', maskedKey: maskApiKey(key) };
  }

  const envVars = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENAI_API_KEY'];
  for (const envName of envVars) {
    const val = process.env[envName];
    if (val && val.trim()) {
      const key = val.trim();
      return { apiKey: key, source: `env:${envName}`, maskedKey: maskApiKey(key) };
    }
  }

  const cfgPath = getPluginConfigFilePath(opts.configDir);
  const cfg = readPluginConfig(opts.configDir);
  if (cfg.geminiApiKey && String(cfg.geminiApiKey).trim()) {
    const key = String(cfg.geminiApiKey).trim();
    return {
      apiKey: key,
      source: `config:${cfgPath}`,
      maskedKey: maskApiKey(key),
    };
  }

  // Check .env files in cwd, engine root, plugin root, or ~/.gemini/.env
  const envCandidates = [
    path.join(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '..', '.env'),
    path.join(os.homedir(), '.gemini', '.env'),
  ];
  for (const envFile of envCandidates) {
    const parsed = parseDotEnvFile(envFile);
    for (const envName of envVars) {
      if (parsed[envName] && parsed[envName].trim()) {
        const key = parsed[envName].trim();
        return {
          apiKey: key,
          source: `dotenv:${envFile}`,
          maskedKey: maskApiKey(key),
        };
      }
    }
  }

  return { apiKey: null, source: null, maskedKey: null };
}

export function resolveVoiceAndStyle({ voice, character, style, configDir = null } = {}) {
  const cfg = readPluginConfig(configDir);
  const customVoices = cfg.customVoices || {};

  let resolvedVoice = 'Sulafat';
  let resolvedStyle = '';

  if (character) {
    const charKey = String(character).trim().toLowerCase();
    const preset = CHARACTER_VOICE_PRESETS[charKey];
    if (preset) {
      resolvedVoice = preset.voice;
      resolvedStyle = preset.style;
    }
  }

  if (voice) {
    const rawVoice = String(voice).trim();
    const lowerVoice = rawVoice.toLowerCase();

    if (customVoices[rawVoice]?.voiceId) {
      resolvedVoice = customVoices[rawVoice].voiceId;
      if (!resolvedStyle && customVoices[rawVoice].style) {
        resolvedStyle = customVoices[rawVoice].style;
      }
    } else if (CHARACTER_VOICE_PRESETS[lowerVoice]) {
      resolvedVoice = CHARACTER_VOICE_PRESETS[lowerVoice].voice;
      if (!resolvedStyle) {
        resolvedStyle = CHARACTER_VOICE_PRESETS[lowerVoice].style;
      }
    } else if (VOICE_SHORTCUT_ALIASES[lowerVoice]) {
      resolvedVoice = VOICE_SHORTCUT_ALIASES[lowerVoice];
    } else {
      // Match case-insensitively against the 30 prebuilt voices
      const prebuiltMatch = Object.keys(GEMINI_PREBUILT_VOICES).find(
        (v) => v.toLowerCase() === lowerVoice
      );
      resolvedVoice = prebuiltMatch || rawVoice;
    }
  }

  if (style !== undefined && style !== null && String(style).trim() !== '') {
    resolvedStyle = String(style).trim();
  }

  return { voice: resolvedVoice, style: resolvedStyle };
}

// ---------------------------------------------------------------------------
// Google AI Studio Gemini TTS Payload Builders & WAV/PCM Decoders
// ---------------------------------------------------------------------------

export function isGemini38Model(model = DEFAULT_GEMINI_TTS_MODEL) {
  const m = String(model || '').toLowerCase();
  return m.includes('3.8') || m.includes('3-8');
}

export function isCustomVoiceIdentifier(voiceName = '') {
  const v = String(voiceName || '').trim();
  return v.startsWith('voice_') || v.startsWith('voicekey_');
}

/**
 * Builds the REST JSON request payload for `POST /v1beta/models/{model}:generateContent`
 * supporting both single-speaker and multi-speaker synthesis across Gemini 3.8 TTS
 * (`speech_metadata` + verbatim transcript + `<tags>`) and Gemini 2.5/3.1 Preview TTS.
 */
export function buildGeminiTtsRequest({
  text = '',
  voice = 'Sulafat',
  style = '',
  model = DEFAULT_GEMINI_TTS_MODEL,
  languageCode = '',
  turns = null,
  speakers = null,
} = {}) {
  const use38Schema = isGemini38Model(model);

  // Multi-speaker dialogue mode
  if (Array.isArray(turns) && turns.length > 0 && speakers && Object.keys(speakers).length > 0) {
    const speakerVoiceConfigs = Object.entries(speakers).map(([speakerName, rawVoice]) => {
      const resolved = resolveVoiceAndStyle({ voice: rawVoice }).voice;
      return {
        speaker: speakerName,
        voiceConfig: isCustomVoiceIdentifier(resolved)
          ? { voice: resolved }
          : { prebuiltVoiceConfig: { voiceName: resolved } },
      };
    });

    const speechConfig = {
      multiSpeakerVoiceConfig: { speakerVoiceConfigs },
      ...(languageCode ? { languageCode } : {}),
    };

    if (use38Schema) {
      const parts = turns.map((turn) => {
        const turnStyle = turn.style || style || '';
        return {
          text: String(turn.text || '').trim(),
          speech_metadata: {
            speaker: turn.speaker,
            ...(turnStyle ? { style: turnStyle } : {}),
          },
        };
      });
      return {
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig,
        },
      };
    }

    // Legacy 2.5 / 3.1 multi-speaker transcript format
    const transcriptLines = turns
      .map((t) => `${t.speaker}: ${String(t.text || '').trim()}`)
      .join('\n');
    const promptText = style
      ? `Read the following multi-speaker dialogue in a ${style} style:\n${transcriptLines}`
      : transcriptLines;

    return {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig,
      },
    };
  }

  // Single-speaker mode
  const voiceConfig = isCustomVoiceIdentifier(voice)
    ? { voice }
    : { prebuiltVoiceConfig: { voiceName: voice } };

  const speechConfig = {
    voiceConfig,
    ...(languageCode ? { languageCode } : {}),
  };

  if (use38Schema) {
    const part = {
      text: String(text || '').trim(),
      ...(style ? { speech_metadata: { style: String(style).trim() } } : {}),
    };
    return {
      contents: [{ parts: [part] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig,
      },
    };
  }

  // Legacy 2.5 / 3.1 single-speaker prompt format
  const styledText = style
    ? `Say in a ${String(style).trim()} tone: ${String(text || '').trim()}`
    : String(text || '').trim();

  return {
    contents: [{ parts: [{ text: styledText }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig,
    },
  };
}

/**
 * Wraps raw 16-bit signed little-endian PCM bytes in a 44-byte RIFF/WAVE header,
 * or returns the buffer untouched if it already begins with a `'RIFF'` WAV header
 * (as returned by unary `gemini-3.8-flash-tts` responses).
 */
export function decodeGeminiAudioToWavBuffer(
  base64OrBuffer,
  mimeType = 'audio/L16;codec=pcm;rate=24000'
) {
  const rawBuf = Buffer.isBuffer(base64OrBuffer)
    ? base64OrBuffer
    : Buffer.from(String(base64OrBuffer || ''), 'base64');

  if (
    rawBuf.length >= 44 &&
    rawBuf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    rawBuf.subarray(8, 12).toString('ascii') === 'WAVE'
  ) {
    return rawBuf;
  }

  let sampleRate = GEMINI_TTS_SAMPLE_RATE;
  const rateMatch = String(mimeType || '').match(/rate=(\d+)/i);
  if (rateMatch) {
    sampleRate = Number(rateMatch[1]) || GEMINI_TTS_SAMPLE_RATE;
  }

  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = rawBuf.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8, 4, 'ascii');
  header.write('fmt ', 12, 4, 'ascii');
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20);  // PCM format = 1
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 4, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, rawBuf]);
}

function generateMockGeminiPcmBase64(durationSec = 0.6, sampleRate = GEMINI_TTS_SAMPLE_RATE) {
  const n = Math.max(1, Math.floor(sampleRate * durationSec));
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 392.0 * t) * 0.5;
    pcm.writeInt16LE(Math.round(sample * 32767), i * 2);
  }
  return pcm.toString('base64');
}

/**
 * Calls Google AI Studio's Gemini TTS REST API (`POST /v1beta/models/{model}:generateContent`)
 * with automatic model fallback and returns `{ wavBuffer, modelUsed, mimeType }`.
 */
export async function synthesizeGeminiSpeech({
  apiKey,
  text = '',
  voice = 'Sulafat',
  style = '',
  model = DEFAULT_GEMINI_TTS_MODEL,
  languageCode = '',
  turns = null,
  speakers = null,
  baseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com',
} = {}) {
  if (process.env.GEMINI_TTS_MOCK === '1') {
    const mockB64 = process.env.GEMINI_TTS_MOCK_PCM_BASE64 || generateMockGeminiPcmBase64(0.8);
    const wavBuffer = decodeGeminiAudioToWavBuffer(mockB64, 'audio/L16;codec=pcm;rate=24000');
    return {
      wavBuffer,
      modelUsed: model || DEFAULT_GEMINI_TTS_MODEL,
      mimeType: 'audio/L16;codec=pcm;rate=24000',
    };
  }

  if (!apiKey) {
    throw new Error('Missing Google AI Studio API key (GEMINI_API_KEY).');
  }

  const candidateModels = model
    ? [model, ...FALLBACK_GEMINI_TTS_MODELS.filter((m) => m !== model)]
    : [...FALLBACK_GEMINI_TTS_MODELS];

  let lastError = null;
  const cleanBaseUrl = String(baseUrl)
    .replace(/\/+$/, '')
    .replace(/\/v1beta$/i, '');

  for (const candidateModel of candidateModels) {
    const payload = buildGeminiTtsRequest({
      text,
      voice,
      style,
      model: candidateModel,
      languageCode,
      turns,
      speakers,
    });

    const endpoint = `${cleanBaseUrl}/v1beta/models/${encodeURIComponent(candidateModel)}:generateContent`;
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        lastError = new Error(
          `Gemini TTS API HTTP ${resp.status} (${candidateModel}): ${errText.slice(0, 400)}`
        );
        // If 404 or model not supported, try next model in fallback chain
        if (resp.status === 404 || resp.status === 400) {
          continue;
        }
        throw lastError;
      }

      const json = await resp.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find(
        (p) => p?.inlineData?.data || p?.inline_data?.data
      );
      const inlineData = audioPart?.inlineData || audioPart?.inline_data;

      if (!inlineData?.data) {
        throw new Error(
          `Gemini TTS response from ${candidateModel} did not contain inline audio data.`
        );
      }

      const mimeType = inlineData.mimeType || inlineData.mime_type || 'audio/wav';
      const wavBuffer = decodeGeminiAudioToWavBuffer(inlineData.data, mimeType);
      return {
        wavBuffer,
        modelUsed: candidateModel,
        mimeType,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to synthesize speech via Google AI Studio Gemini TTS.');
}

/**
 * Calls Google AI Studio's Voice Design API (`POST /v1beta/voices`) to create a custom
 * prompted voice persona (`type: "prompted"`), returning `{ voiceId, displayName, sampleWavBuffer }`.
 */
export async function createGeminiDesignedVoice({
  apiKey,
  prompt,
  displayName = 'Custom Picture-Book Voice',
  languageCode = 'en-US',
  baseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com',
} = {}) {
  if (process.env.GEMINI_TTS_MOCK === '1') {
    const slug = String(displayName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const wavBuffer = decodeGeminiAudioToWavBuffer(
      generateMockGeminiPcmBase64(0.6),
      'audio/L16;codec=pcm;rate=24000'
    );
    return {
      voiceId: `voice_mock_${slug || 'custom'}`,
      displayName,
      prompt,
      sampleWavBuffer: wavBuffer,
    };
  }

  if (!apiKey) {
    throw new Error('Missing Google AI Studio API key (GEMINI_API_KEY).');
  }

  const cleanBaseUrl = String(baseUrl)
    .replace(/\/+$/, '')
    .replace(/\/v1beta$/i, '');
  const endpoint = `${cleanBaseUrl}/v1beta/voices`;
  const body = {
    type: 'prompted',
    prompt: String(prompt || '').trim(),
    display_name: displayName,
    language_code: languageCode,
    store: true,
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini Voices API HTTP ${resp.status}: ${errText.slice(0, 400)}`);
  }

  const data = await resp.json();
  const voiceId = data.id || data.name || data.key;
  const sampleB64 = data.sample_audio?.data || data.sampleAudio?.data || data.sample_audio;
  const sampleMime =
    data.sample_audio?.mime_type || data.sampleAudio?.mimeType || 'audio/wav';
  const sampleWavBuffer =
    typeof sampleB64 === 'string' && sampleB64.length > 0
      ? decodeGeminiAudioToWavBuffer(sampleB64, sampleMime)
      : null;

  return {
    voiceId,
    displayName: data.display_name || displayName,
    prompt,
    sampleWavBuffer,
  };
}

/**
 * Parses dialogue script strings (`"Speaker1: Hello! | Speaker2: Hi there!"` or multiline)
 * or a JSON array of `{ speaker, text, style? }` objects.
 */
export function parseDialogueTurns(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  const raw = String(input).trim();
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through to text parser
    }
  }

  const segments = raw.includes('|')
    ? raw.split('|')
    : raw.split(/\r?\n/);

  const turns = [];
  for (const seg of segments) {
    const line = seg.trim();
    if (!line) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const speaker = line.slice(0, colonIdx).trim();
    const text = line.slice(colonIdx + 1).trim();
    if (speaker && text) {
      turns.push({ speaker, text });
    }
  }
  return turns;
}

/**
 * Parses `--speakers "Narrator:Sulafat,LittleGirl:Leda"` or JSON object into `{ Speaker: Voice }`.
 */
export function parseSpeakerMap(input, turns = []) {
  const map = {};
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return { ...input };
  }
  if (typeof input === 'string' && input.trim()) {
    const raw = input.trim();
    if (raw.startsWith('{')) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fall through
      }
    }
    for (const pair of raw.split(',')) {
      const [spk, v] = pair.split(':').map((s) => s.trim());
      if (spk && v) {
        map[spk] = resolveVoiceAndStyle({ voice: v }).voice;
      }
    }
  }

  // Auto-assign voices for any speaker in `turns` not explicitly listed in `--speakers`
  const fallbackVoices = ['Sulafat', 'Leda', 'Orus', 'Puck', 'Aoede', 'Fenrir'];
  let idx = 0;
  for (const t of turns) {
    if (t.speaker && !map[t.speaker]) {
      const preset = CHARACTER_VOICE_PRESETS[t.speaker.toLowerCase()];
      map[t.speaker] = preset ? preset.voice : fallbackVoices[idx++ % fallbackVoices.length];
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Audio Directory & Procedural WAV SFX Helpers
// ---------------------------------------------------------------------------

export function resolveDefaultAudioDir(overrideOutputDir = null) {
  if (overrideOutputDir) {
    return path.resolve(overrideOutputDir);
  }
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'src', 'engine', 'schema.ts'))) {
    return path.join(cwd, 'public', 'audio');
  }
  const candidateEngine = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(candidateEngine, 'src', 'engine', 'schema.ts'))) {
    return path.join(candidateEngine, 'public', 'audio');
  }
  const pluginEngine = path.resolve(__dirname, '..', '..', '..', 'engine');
  return path.join(pluginEngine, 'public', 'audio');
}

export function writeWav(filePath, samples, sampleRate = SAMPLE_RATE) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  const scale = 32767 / Math.max(peak, 1e-6);
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0, 4, 'ascii');
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8, 4, 'ascii');
  buf.write('fmt ', 12, 4, 'ascii');
  buf.writeUInt32LE(16, 16); // PCM chunk size
  buf.writeUInt16LE(1, 20);  // PCM format = 1
  buf.writeUInt16LE(1, 22);  // Mono = 1 channel
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buf.writeUInt16LE(2, 32);  // Block align
  buf.writeUInt16LE(16, 34); // Bits per sample
  buf.write('data', 36, 4, 'ascii');
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-32768, Math.min(32767, Math.round(samples[i] * scale)));
    buf.writeInt16LE(clamped, 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
  return filePath;
}

function envelope(t, dur, attack = 0.01, release = 0.05) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1.0;
}

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

function noise() {
  return Math.random() * 2 - 1;
}

export const SFX_PRESETS = {
  page_turn({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, 0.005, dur * 0.4);
      const centre = 3000 - 2000 * (t / dur);
      const raw = noise();
      const lp = raw * Math.max(0, 1 - Math.abs((t * SAMPLE_RATE * 2 * Math.PI) / centre) * 0.00001);
      out[i] = lp * env * 0.7;
    }
    return out;
  },
  wind({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    let prev = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, dur * 0.25, dur * 0.25);
      const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.3 * t);
      const alpha = 0.05 + 0.1 * mod;
      prev = prev * (1 - alpha) + noise() * alpha;
      out[i] = prev * env * 4.0;
    }
    return out;
  },
  footsteps({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    let tTotal = 0;
    while (tTotal < dur) {
      const start = Math.floor(tTotal * SAMPLE_RATE);
      const tapSamples = Math.floor(0.06 * SAMPLE_RATE);
      for (let j = 0; j < Math.min(tapSamples, n - start); j++) {
        const t = j / SAMPLE_RATE;
        out[start + j] += noise() * Math.exp(-t * 60) * 0.6;
      }
      tTotal += 0.45 + (Math.random() * 0.06 - 0.03);
    }
    return out;
  },
  magic_sparkle({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const freqs = [1200, 1600, 2000, 2400, 2800, 3200];
    const spacing = dur / (freqs.length + 1);
    for (let idx = 0; idx < freqs.length; idx++) {
      const f = freqs[idx];
      const onset = spacing * (idx + 0.5);
      const noteDur = Math.min(0.3, dur - onset);
      if (noteDur <= 0) break;
      const count = Math.floor(noteDur * SAMPLE_RATE);
      for (let j = 0; j < count; j++) {
        const t = j / SAMPLE_RATE;
        const si = Math.floor((onset + t) * SAMPLE_RATE);
        if (si >= n) break;
        const val = sine(f, t) * 0.3 + sine(f * 2, t) * 0.15;
        out[si] += val * Math.exp(-t * 8) * 0.5;
      }
    }
    return out;
  },
  boing({ dur, freq = 300 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const f = freq * (1 + 3 * Math.exp(-t * 12));
      out[i] = sine(f, t) * Math.exp(-t * 5) * 0.7;
    }
    return out;
  },
  drum_roll({ dur }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const hits = Math.floor(dur * 16);
    let onset = 0;
    for (let h = 0; h < hits; h++) {
      if (onset >= dur) break;
      const hitSamples = Math.floor(0.04 * SAMPLE_RATE);
      for (let j = 0; j < hitSamples; j++) {
        const si = Math.floor(onset * SAMPLE_RATE) + j;
        if (si >= n) break;
        const t = j / SAMPLE_RATE;
        out[si] += noise() * Math.exp(-t * 80) * 0.5;
      }
      const frac = h / Math.max(1, hits - 1);
      onset += 0.12 * (1 - 0.7 * frac);
    }
    return out;
  },
  chord({ dur, freq = 261.63 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    const fThird = (freq * 5) / 4;
    const fFifth = (freq * 3) / 2;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, dur, 0.02, dur * 0.3);
      const val = (sine(freq, t) + sine(fThird, t) * 0.8 + sine(fFifth, t) * 0.7) / 2.5;
      out[i] = val * env * 0.6;
    }
    return out;
  },
  sweep({ dur, freq = 200, freqEnd = 1200 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const frac = t / dur;
      const f = freq * (1 - frac) + freqEnd * frac;
      out[i] = sine(f, t) * envelope(t, dur, 0.01, 0.05) * 0.6;
    }
    return out;
  },
  tone({ dur, freq = 440 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      out[i] = sine(freq, t) * envelope(t, dur, 0.01, 0.05) * 0.6;
    }
    return out;
  },
  // Extra aliases referenced in AUDIO_CATALOG.md
  chime({ dur = 0.55, freq = 880 }) {
    const n = Math.floor(SAMPLE_RATE * dur);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      out[i] = (sine(freq, t) * 0.7 + sine(freq * 3, t) * 0.25) * Math.exp(-t * 6);
    }
    return out;
  },
  sparkle(args) {
    return SFX_PRESETS.magic_sparkle(args);
  },
  pop({ dur = 0.3, freq = 520 }) {
    return SFX_PRESETS.sweep({ dur, freq, freqEnd: 90 });
  },
  footstep(args) {
    return SFX_PRESETS.footsteps(args);
  },
  giggle({ dur = 0.35, freq = 540 }) {
    return SFX_PRESETS.boing({ dur, freq });
  },
  whoosh({ dur = 0.45, freq = 600 }) {
    return SFX_PRESETS.sweep({ dur, freq, freqEnd: 180 });
  },
  fanfare({ dur = 0.8, freq = 392 }) {
    return SFX_PRESETS.chord({ dur, freq });
  },
};

export function readWavInfo(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 44 || buf.subarray(0, 4).toString('ascii') !== 'RIFF') {
    return null;
  }
  const channels = buf.readUInt16LE(22);
  const sampleRate = buf.readUInt32LE(24);
  const bitsPerSample = buf.readUInt16LE(34);
  let dataSize = buf.readUInt32LE(40);
  // Scan for 'data' chunk if non-standard chunks precede it
  if (buf.subarray(36, 40).toString('ascii') !== 'data') {
    let offset = 12;
    while (offset + 8 <= buf.length) {
      const id = buf.subarray(offset, offset + 4).toString('ascii');
      const sz = buf.readUInt32LE(offset + 4);
      if (id === 'data') {
        dataSize = sz;
        break;
      }
      offset += 8 + sz + (sz % 2);
    }
  }
  const bytesPerSample = Math.max(1, (bitsPerSample / 8) * channels);
  const frames = Math.floor(dataSize / bytesPerSample);
  const durationSec = sampleRate > 0 ? frames / sampleRate : 0;
  return { channels, sampleRate, bitsPerSample, frames, durationSec };
}

export function formatClipSnippet(filePath, name, startTime = 0, durationSec = null, label = null) {
  const fileName = path.basename(filePath);
  const src = `/audio/${fileName}`;
  const durLine =
    durationSec != null ? `  duration: ${durationSec.toFixed(2)},` : `  // duration: <auto from file>`;
  const cleanLabel = String(label || name).replace(/'/g, "\\'");
  return `{
  id: '${name}',
  src: '${src}',
  startTime: ${startTime},
${durLine}
  offsetSec: 0,
  volume: 1.0,
  label: '${cleanLabel}'
}`;
}

function printClipSnippet(filePath, name, startTime = 0, durationSec = null, label = null) {
  console.log(`\n// Ready-to-paste AudioClipCue:\n${formatClipSnippet(filePath, name, startTime, durationSec, label)}`);
}

function writeFallbackSpeechWav(outPath, text) {
  let synthesized = false;
  if (process.platform === 'win32') {
    const psScript = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('${outPath.replace(/'/g, "''")}'); $s.Speak('${text.replace(/'/g, "''")}'); $s.Dispose()`;
    const res = spawnSync('powershell.exe', ['-NoProfile', '-Command', psScript], {
      encoding: 'utf8',
    });
    if (res.status === 0 && fs.existsSync(outPath)) {
      synthesized = true;
      return { provider: 'windows-system-speech', outPath };
    }
  }

  if (!synthesized) {
    // Pure-JS melodic storybook voice cadence fallback so TTS never fails even without OS speech engines
    const words = String(text || 'Hello')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const dur = Math.max(1.2, words.length * 0.32);
    const n = Math.floor(SAMPLE_RATE * dur);
    const samples = new Float64Array(n);
    const notes = [293.66, 329.63, 392.0, 440.0, 392.0, 329.63];
    for (let w = 0; w < words.length; w++) {
      const f = notes[w % notes.length];
      const wStart = w * 0.32;
      const wDur = 0.24;
      for (let j = 0; j < Math.floor(wDur * SAMPLE_RATE); j++) {
        const idx = Math.floor(wStart * SAMPLE_RATE) + j;
        if (idx >= n) break;
        const t = j / SAMPLE_RATE;
        samples[idx] =
          (sine(f, t) * 0.6 + sine(f * 2, t) * 0.2) * envelope(t, wDur, 0.02, 0.06);
      }
    }
    writeWav(outPath, samples);
  }
  return { provider: 'melodic-storybook-fallback', outPath };
}

export function parseArgs(argv) {
  const opts = { positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--name' || a === '-n') opts.name = argv[++i];
    else if (a === '--duration' || a === '-d') opts.duration = Number(argv[++i]);
    else if (a === '--freq' || a === '-f') opts.freq = Number(argv[++i]);
    else if (a === '--freq-end') opts.freqEnd = Number(argv[++i]);
    else if (a === '--output' || a === '--out' || a === '-o') opts.output = argv[++i];
    else if (a === '--in' || a === '-i') opts.input = argv[++i];
    else if (a === '--preset') opts.preset = argv[++i];
    else if (a === '--output-dir') opts.outputDir = argv[++i];
    else if (a === '--start-time') opts.startTime = Number(argv[++i]);
    else if (a === '--voice' || a === '-v') opts.voice = argv[++i];
    else if (a === '--character' || a === '-c') opts.character = argv[++i];
    else if (a === '--style' || a === '--prompt' || a === '-s') opts.style = argv[++i];
    else if (a === '--styles') opts.styles = argv[++i];
    else if (a === '--sample-text') opts.sampleText = argv[++i];
    else if (a === '--model' || a === '-m') opts.model = argv[++i];
    else if (a === '--language' || a === '--lang') opts.language = argv[++i];
    else if (a === '--speakers') opts.speakers = argv[++i];
    else if (a === '--turns' || a === '--turns-json' || a === '--text') opts.turns = argv[++i];
    else if (a === '--api-key' || a === '--key' || a === '-k') opts.apiKey = argv[++i];
    else if (a === '--config-dir') opts.configDir = argv[++i];
    else if (a === '--search') opts.search = argv[++i];
    else if (a === '--rate') opts.rate = argv[++i];
    else if (a === '--pitch') opts.pitch = argv[++i];
    else if (a === '--offline' || a === '--fallback') opts.offline = true;
    else if (a === '--json') opts.json = true;
    else opts.positional.push(a);
  }
  return opts;
}

function printApiKeyInstructions() {
  console.error(
    [
      '[gemini-tts] No Google AI Studio API key found.',
      'To generate studio-grade AI character voices and narration with Google AI Studio (Gemini TTS):',
      '  1. Get an API key from: https://aistudio.google.com/apikey (or click "Get API key" in https://aistudio.google.com/generate-speech)',
      '  2. Save it once for all future Antigravity sessions by running:',
      '       agy-node scripts/generate_audio.mjs set-key "<YOUR_GEMINI_API_KEY>"',
      '     (Or set the GEMINI_API_KEY environment variable.)',
    ].join('\n')
  );
}

export async function runCli(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const cmd = opts.positional[0];
  const defaultAudioDir = resolveDefaultAudioDir(opts.outputDir);

  // 1. set-key
  if (cmd === 'set-key') {
    const rawKey = opts.positional[1] || opts.apiKey;
    if (!rawKey || !String(rawKey).trim()) {
      console.error('Usage: generate_audio.mjs set-key <GEMINI_API_KEY>');
      return 1;
    }
    const cleanKey = String(rawKey).trim();
    const { configPath } = writePluginConfig({ geminiApiKey: cleanKey }, opts.configDir);
    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            configured: true,
            maskedKey: maskApiKey(cleanKey),
            configPath,
          },
          null,
          2
        )
      );
    } else {
      console.log(`[gemini-tts] Saved Google AI Studio API key (${maskApiKey(cleanKey)}) to ${configPath}`);
    }
    return 0;
  }

  // 2. check-key
  if (cmd === 'check-key') {
    const resolved = resolveGeminiApiKey({ apiKey: opts.apiKey, configDir: opts.configDir });
    const configured = Boolean(resolved.apiKey);
    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            configured,
            source: resolved.source,
            maskedKey: resolved.maskedKey,
            getKeyUrl: 'https://aistudio.google.com/apikey',
            speechPlaygroundUrl: 'https://aistudio.google.com/generate-speech',
          },
          null,
          2
        )
      );
    } else if (configured) {
      console.log(
        `[gemini-tts] API key configured (${resolved.maskedKey}, source: ${resolved.source})`
      );
    } else {
      printApiKeyInstructions();
    }
    return configured ? 0 : 1;
  }

  // 3. voices
  if (cmd === 'voices') {
    const cfg = readPluginConfig(opts.configDir);
    const customVoices = cfg.customVoices || {};
    if (opts.character) {
      const charKey = String(opts.character).toLowerCase();
      const preset = CHARACTER_VOICE_PRESETS[charKey];
      if (!preset) {
        console.error(
          `Unknown character '${opts.character}'. Available: ${Object.keys(CHARACTER_VOICE_PRESETS).join(', ')}`
        );
        return 1;
      }
      console.log(JSON.stringify({ character: charKey, ...preset }, null, 2));
      return 0;
    }

    const search = opts.search ? String(opts.search).toLowerCase() : '';
    const prebuiltEntries = Object.entries(GEMINI_PREBUILT_VOICES).filter(
      ([name, meta]) =>
        !search ||
        name.toLowerCase().includes(search) ||
        meta.tone.toLowerCase().includes(search) ||
        meta.bestFor.toLowerCase().includes(search)
    );

    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            defaultModel: DEFAULT_GEMINI_TTS_MODEL,
            prebuiltVoices: Object.fromEntries(prebuiltEntries),
            characterPresets: CHARACTER_VOICE_PRESETS,
            customVoices,
          },
          null,
          2
        )
      );
      return 0;
    }

    console.log('=== Google AI Studio Gemini TTS — 30 Prebuilt Voices ===');
    for (const [name, meta] of prebuiltEntries) {
      console.log(`  ${name.padEnd(15)} | ${meta.tone.padEnd(12)} | ${meta.gender.padEnd(6)} | ${meta.bestFor}`);
    }
    console.log('\n=== Picture-Book Studio Character Voice Presets (--character <kind>) ===');
    for (const [charKind, preset] of Object.entries(CHARACTER_VOICE_PRESETS)) {
      console.log(`  ${charKind.padEnd(20)} -> ${preset.voice.padEnd(13)} (${preset.style})`);
    }
    if (Object.keys(customVoices).length > 0) {
      console.log('\n=== Saved Custom Designed Voices ===');
      for (const [alias, info] of Object.entries(customVoices)) {
        console.log(`  ${alias.padEnd(20)} -> ${info.voiceId} (${info.prompt || ''})`);
      }
    }
    return 0;
  }

  // 4. voice-design
  if (cmd === 'voice-design') {
    const prompt = opts.positional[1] || opts.style || '';
    const alias = opts.name || opts.character || 'custom-voice';
    const { apiKey } = resolveGeminiApiKey({ apiKey: opts.apiKey, configDir: opts.configDir });

    if (opts.character && !prompt) {
      const resolved = resolveVoiceAndStyle({
        character: opts.character,
        voice: opts.voice,
        style: opts.style,
        configDir: opts.configDir,
      });
      const out = {
        character: opts.character,
        voiceName: resolved.voice,
        stylePrompt: resolved.style,
        sampleCommand: `agy-node scripts/generate_audio.mjs tts "Hello from the picture book!" --character ${opts.character} --name ${alias}`,
      };
      console.log(JSON.stringify(out, null, 2));
      return 0;
    }

    if (!prompt) {
      console.error(
        'Usage: generate_audio.mjs voice-design "<natural language voice description>" --name <voice-alias> [--output <sample.wav>]'
      );
      return 1;
    }

    if ((apiKey || process.env.GEMINI_TTS_MOCK === '1') && !opts.offline) {
      try {
        const designed = await createGeminiDesignedVoice({
          apiKey,
          prompt,
          displayName: alias,
          languageCode: opts.language || 'en-US',
        });
        writePluginConfig(
          {
            customVoices: {
              [alias]: {
                voiceId: designed.voiceId,
                displayName: designed.displayName,
                prompt,
              },
            },
          },
          opts.configDir
        );

        let sampleSavedPath = null;
        if (designed.sampleWavBuffer) {
          sampleSavedPath = opts.output
            ? path.resolve(opts.output)
            : path.join(defaultAudioDir, `${alias}-sample.wav`);
          fs.mkdirSync(path.dirname(sampleSavedPath), { recursive: true });
          fs.writeFileSync(sampleSavedPath, designed.sampleWavBuffer);
        }

        if (opts.json) {
          console.log(
            JSON.stringify(
              {
                ok: true,
                alias,
                voiceId: designed.voiceId,
                displayName: designed.displayName,
                prompt,
                sampleSavedPath,
              },
              null,
              2
            )
          );
        } else {
          console.log(
            `[voice-design] Created custom voice '${alias}' -> ID: ${designed.voiceId}`
          );
          if (sampleSavedPath) {
            console.log(`[voice-design] Saved preview sample: ${sampleSavedPath}`);
          }
          console.log(
            `[voice-design] Use with: agy-node scripts/generate_audio.mjs tts "<text>" --voice ${designed.voiceId} --name <clip-name>`
          );
        }
        return 0;
      } catch (err) {
        console.error(
          `[voice-design] API call failed (${err instanceof Error ? err.message : String(err)}). Falling back to preset recommendation.`
        );
      }
    }

    const fallbackResolved = resolveVoiceAndStyle({
      character: opts.character || 'narrator',
      voice: opts.voice,
      style: prompt,
      configDir: opts.configDir,
    });
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: 'preset_recommendation',
          alias,
          voiceName: fallbackResolved.voice,
          stylePrompt: fallbackResolved.style,
        },
        null,
        2
      )
    );
    return 0;
  }

  // 5. sfx / tone
  if (cmd === 'sfx' || cmd === 'tone') {
    const preset = opts.positional[1] || 'tone';
    const fn = SFX_PRESETS[preset];
    if (!fn) {
      console.error(`Unknown SFX preset '${preset}'. Available: ${Object.keys(SFX_PRESETS).join(', ')}`);
      return 1;
    }
    const dur = opts.duration || 0.5;
    const freq = opts.freq || 440;
    const freqEnd = opts.freqEnd || freq * 4;
    const name = opts.name || preset;
    const outPath = opts.output
      ? path.resolve(opts.output)
      : path.join(defaultAudioDir, `${name}.wav`);

    const samples = fn({ dur, freq, freqEnd });
    writeWav(outPath, samples);
    console.log(`[sfx] Saved: ${outPath} (${dur.toFixed(2)}s, ${SAMPLE_RATE} Hz, 16-bit mono)`);
    printClipSnippet(outPath, name, opts.startTime || 0, dur);
    return 0;
  }

  // 6. tts (Single-Speaker Narration / Character Voice)
  if (cmd === 'tts') {
    const text = opts.positional[1] || opts.turns || 'Hello from Picture Book Studio';
    const name = opts.name || 'tts-output';
    const outPath = opts.output
      ? path.resolve(opts.output)
      : path.join(defaultAudioDir, `${name}.wav`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const { voice, style } = resolveVoiceAndStyle({
      voice: opts.voice,
      character: opts.character,
      style: opts.style,
      configDir: opts.configDir,
    });
    const model = opts.model || DEFAULT_GEMINI_TTS_MODEL;
    const { apiKey } = resolveGeminiApiKey({ apiKey: opts.apiKey, configDir: opts.configDir });

    let providerUsed = 'fallback';
    if (!opts.offline && (apiKey || process.env.GEMINI_TTS_MOCK === '1')) {
      try {
        const result = await synthesizeGeminiSpeech({
          apiKey,
          text,
          voice,
          style,
          model,
          languageCode: opts.language || '',
        });
        fs.writeFileSync(outPath, result.wavBuffer);
        providerUsed = `gemini-tts:${result.modelUsed}:${voice}`;
        console.log(
          `[tts:gemini] Synthesized with ${result.modelUsed} (voice: ${voice}${style ? `, style: "${style}"` : ''})`
        );
      } catch (err) {
        console.error(
          `[tts:gemini] Error calling Google AI Studio Gemini TTS (${err instanceof Error ? err.message : String(err)}). Falling back to local synthesis...`
        );
        const fb = writeFallbackSpeechWav(outPath, text);
        providerUsed = fb.provider;
      }
    } else {
      if (!opts.offline) {
        printApiKeyInstructions();
      }
      const fb = writeFallbackSpeechWav(outPath, text);
      providerUsed = fb.provider;
    }

    const info = readWavInfo(outPath);
    console.log(`[tts] Saved: ${outPath} (provider: ${providerUsed})`);
    printClipSnippet(
      outPath,
      name,
      opts.startTime || 0,
      info ? info.durationSec : null,
      opts.character ? `${opts.character}: ${text.slice(0, 40)}` : name
    );
    return 0;
  }

  // 7. dialogue (Multi-Speaker Character Conversation)
  if (cmd === 'dialogue') {
    const rawScript = opts.positional[1] || opts.turns || '';
    const turns = parseDialogueTurns(rawScript);
    if (turns.length === 0) {
      console.error(
        'Usage: generate_audio.mjs dialogue "Speaker1: Line 1 | Speaker2: Line 2" --speakers "Speaker1:Leda,Speaker2:Orus" --name <clip-name>'
      );
      return 1;
    }
    const speakers = parseSpeakerMap(opts.speakers, turns);
    const name = opts.name || 'dialogue-output';
    const outPath = opts.output
      ? path.resolve(opts.output)
      : path.join(defaultAudioDir, `${name}.wav`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const model = opts.model || DEFAULT_GEMINI_TTS_MODEL;
    const { apiKey } = resolveGeminiApiKey({ apiKey: opts.apiKey, configDir: opts.configDir });

    let providerUsed = 'fallback';
    if (!opts.offline && (apiKey || process.env.GEMINI_TTS_MOCK === '1')) {
      try {
        const result = await synthesizeGeminiSpeech({
          apiKey,
          turns,
          speakers,
          style: opts.style || '',
          model,
          languageCode: opts.language || '',
        });
        fs.writeFileSync(outPath, result.wavBuffer);
        providerUsed = `gemini-tts-dialogue:${result.modelUsed}`;
        console.log(
          `[dialogue:gemini] Synthesized ${turns.length} turns with ${result.modelUsed} (speakers: ${JSON.stringify(speakers)})`
        );
      } catch (err) {
        console.error(
          `[dialogue:gemini] Error calling Google AI Studio Gemini TTS (${err instanceof Error ? err.message : String(err)}). Falling back to local synthesis...`
        );
        const combinedText = turns.map((t) => t.text).join(' ');
        const fb = writeFallbackSpeechWav(outPath, combinedText);
        providerUsed = fb.provider;
      }
    } else {
      if (!opts.offline) {
        printApiKeyInstructions();
      }
      const combinedText = turns.map((t) => t.text).join(' ');
      const fb = writeFallbackSpeechWav(outPath, combinedText);
      providerUsed = fb.provider;
    }

    const info = readWavInfo(outPath);
    console.log(`[dialogue] Saved: ${outPath} (provider: ${providerUsed})`);
    printClipSnippet(outPath, name, opts.startTime || 0, info ? info.durationSec : null);
    return 0;
  }

  // 8. info
  if (cmd === 'info') {
    const file = opts.positional[1];
    if (!file || !fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      return 1;
    }
    const info = readWavInfo(file);
    if (info) {
      console.log(`Format   : WAV`);
      console.log(`Channels : ${info.channels}`);
      console.log(`SampleRate: ${info.sampleRate} Hz`);
      console.log(`Duration : ${info.durationSec.toFixed(3)}s`);
    } else {
      const size = fs.statSync(file).size;
      console.log(`FileSize : ${size} bytes`);
    }
    const name = opts.name || path.basename(file, path.extname(file));
    printClipSnippet(file, name, opts.startTime || 0, info ? info.durationSec : null);
    return 0;
  }

  console.error(
    'Usage: generate_audio.mjs <tts|dialogue|voice-design|voices|set-key|check-key|sfx|tone|info> ...'
  );
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli().then((code) => {
    if (code !== 0) process.exit(code);
  });
}

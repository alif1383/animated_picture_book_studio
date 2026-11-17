---
name: picture-book-voiceover
description: Generate expressive studio-grade voiceovers, character voices, multi-speaker dialogue, and custom voice designs using Google AI Studio's Generate Speech (Gemini TTS) API for animated picture books. Includes step-by-step instructions for checking, requesting, and persistently saving the user's Google AI Studio API key in Antigravity.
---

# Picture Book Voiceover Skill (Google AI Studio Generate Speech / Gemini TTS)

Use this skill whenever the user asks for **voiceover**, **story narration**, **character voices**, **spoken dialogue**, **read-aloud audio**, or **Google AI Studio Generate Speech** for their animated picture book.

This skill uses Google AI Studio's newly released **Generate Speech (Gemini TTS)** API (`gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`, and `gemini-2.5-flash-preview-tts`, plus the `/v1beta/voices` Voice Design endpoint) via the bundled zero-dependency script `scripts/generate_audio.mjs` (or `scripts/generate_audio.py`).

## Resolve `<plugin-root>` First

Find the plugin root directory using the first match:
1. Current workspace root if it contains `plugin.json` and `skills/picture-book-voiceover/SKILL.md`
2. `~/.gemini/extensions/animated-picture-book-studio`
3. `/opt/antigravity/plugins/animated_picture_book_studio` or `/opt/antigravity/plugins/animated-picture-book-studio`

Resolve `agy-node`:
- Prefer `/opt/antigravity/bin/node` if executable, otherwise `node` on `PATH`.

---

## Step 1: Check Whether the Google AI Studio API Key is Configured

Before generating any voiceover, check if a Google AI Studio API key is already saved or set in the environment:

```bash
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" check-key
```

The CLI checks keys in this priority order:
1. `--api-key <key>` CLI flag
2. `GEMINI_API_KEY` or `GOOGLE_API_KEY` in the shell environment
3. `GEMINI_API_KEY` or `GOOGLE_API_KEY` in `<cwd>/.env` or `<engine-root>/.env`
4. Persistent Antigravity user config: `~/.gemini/config/animated_picture_book_studio/config.json` (which persists across all Antigravity sessions and VM restarts!)

- If `check-key` prints `Configured: YES`, proceed directly to **Step 3** to generate the voiceovers!
- If `check-key` prints `Configured: NO`, follow **Step 2** below.

---

## Step 2: What to Do When No API Key is Provided (No Default OS Synthesizer Fallback)

> **CRITICAL DEFAULT RULE — Do NOT Fall Back to the OS Synthesizer by Default!**
> If `check-key` reports `Configured: NO` (no API key is provided), `generate_audio.mjs` will **stop and exit with an error (`exit code 1`)** rather than silently falling back to a robotic OS synthesizer.
>
> **What you MUST tell the user when no API key is configured:**
> 1. **Why we stopped**: Explain clearly that since no Google AI Studio API key is provided, we cannot use Google AI Studio Generate Speech and therefore **cannot generate good studio character voices**.
> 2. **All 30 Premade Voices Are 100% Free with a Free Key (\$0 Cost)**: Reassure the user that with a **free** Google AI Studio API key (no credit card or billing account required), they get full access to **all 30 prebuilt Google AI Studio voices** (`VOICE_CATALOG`) and **all 40 character presets** (`CHARACTER_VOICE_PRESET_CATALOG`) at **\$0 cost** — so it is not costly at all!
> 3. **OS Synthesizer is Optional & Not Recommended**: Mention that they *could* try using the local OS synthesizer (by asking you to pass `--os-fallback` / `--offline`), **but it is NOT recommended** because OS synthesizers sound flat/robotic and cannot perform expressive picture-book character voices.

### Why Antigravity Cannot Grab a Raw `AIza...` Key Automatically
Antigravity runs in a secure sandboxed VM where Google Workspace plugins (`gdrive`, `gdocs`, etc.) use OAuth tokens injected by `agy-plugin-proxy` only for Workspace hosts, not raw `AIzaSy...` developer keys for `generativelanguage.googleapis.com`.
**However**, `/home/antigravity/.gemini` (`~/.gemini`) is persistent storage across all Antigravity conversations! Once the user gives you their free key **one time** and you save it with `set-key`, every future conversation automatically has access to real Google AI Studio voices without asking again.

### How to Direct the User to Get Their Free Google AI Studio API Key
Give the user these exact steps:

> **How to get your FREE Google AI Studio API key (takes ~15 seconds, \$0 cost, no credit card needed):**
> 1. Open **Google AI Studio API Keys**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) *(or open the [Google AI Studio Speech Playground](https://aistudio.google.com/generate-speech) and click **"Get API key"** in the bottom-left sidebar)*.
> 2. Sign in with your Google account and click **"Create API key"**.
> 3. Copy the key (it starts with `AIzaSy...`) and paste it here in chat!
>
> *(Once you paste it, I will save it to your persistent `~/.gemini/config/animated_picture_book_studio/config.json` so you never have to enter it again. If you really want to skip the API key, you could ask me to try the local OS synthesizer with `--os-fallback`, though it is **not recommended** because it sounds robotic compared to the free Google AI Studio voices.)*

### How the Agent Saves the API Key Persistently
As soon as the user pastes their `AIza...` key in chat (or provides it in their prompt), immediately run:

```bash
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" set-key "<USER_API_KEY>"
```

Then verify it is saved:

```bash
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" check-key
```

> **Only if the user explicitly insists on using the OS synthesizer anyway:**
> Pass `--os-fallback` (or `--offline`) to `tts` or `dialogue`. Never pass `--os-fallback` unless the user explicitly asks to use the OS/offline synthesizer after being warned that it is not recommended.

---

### Free Tier vs. Paid Tier (What is Free vs. Locked Behind the Paywall)

| Capability | Free API Key (Unbilled / \$0 Free Tier) | Paid Quota Tier 1+ (Paywall — Cloud Billing Linked) |
|---|---|---|
| **All 30 Prebuilt Studio Voices (`VOICE_CATALOG`)** | **100% FREE** (`Sulafat`, `Aoede`, `Leda`, `Puck`, `Fenrir`, `Algenib`, `Charon`, etc.) | Included |
| **All 40 Character & Narrator Presets (`--character`)** | **100% FREE** (`narrator`, `little_girl`, `knight`, `dragon`, `birthday_strawberry`, etc.) | Included |
| **Models: `gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`, `gemini-2.5-flash-preview-tts`** | **100% FREE** (within free daily request quotas) | Higher RPM/RPD quotas + 50%-off Batch/Flex API |
| **Acting Style Prompts (`--style` / `speech_metadata.style`) & Accents (130 locales)** | **100% FREE** (whisper, grumpy dragon, British RP, Scottish brogue, bedtime croon, etc.) | Included |
| **Inline Expressive Vocal Tags (`<laugh>`, `<sigh>`, `<gasp>`, `<yawn>`, `<short pause>`)** | **100% FREE** | Included |
| **Multi-Speaker Dialogue (`dialogue` up to 2 prebuilt voices per call)** | **100% FREE** (great for conserving daily request quota!) | Included |
| **Custom Voice Creation (`POST /v1beta/voices` — "Create Speaker": Voice Design `type: "prompted"`, Voice Remixing, & Persistent Voice Cloning `type: "replicated"`)** | **LOCKED (Paywall — returns `403 PERMISSION_DENIED`)** | **Unlocked on Paid Tier 1+** (up to 200 stored custom `voice_...` IDs per project) |
| **Pro TTS Model (`gemini-2.5-pro-preview-tts`)** | **LOCKED (No Free Tier)** | **Paid-only** (note: Google recommends `gemini-3.8-flash-tts` instead) |
| **High-Volume Rate Limits (RPM / RPD)** | Capped at Free Tier limits (~3 RPM / ~10–15 RPD per model) | **Unlocked** (`150–300+ RPM`, thousands of RPD; ~\$0.81 per full hour of generated audio on `3.8-flash-tts`, ~\$0.54/hr on `3.8-flash-lite-tts`) |
| **Data Privacy / Model Training** | Google may review/use prompts & audio to improve products | **100% Private** — inputs and audio are **never** used to train Google models |

---

## Step 3: Consult the Voice & Character Casting Catalog (`references/voice-catalog.md` / `docs/VOICE_CATALOG.md`)

> **Mandatory Voice Casting Rule**: Just as you consult `docs/AUDIO_CATALOG.md` for sound effects and BGM, **always consult [`references/voice-catalog.md`](references/voice-catalog.md)** (mirrored at `<engine-root>/docs/VOICE_CATALOG.md` and exported from `<engine-root>/src/audio/voices.ts` as `VOICE_CATALOG` and `CHARACTER_VOICE_PRESET_CATALOG`) before casting voices for a scene!

Every one of the **30 Google AI Studio prebuilt voices** and **40 character/narrator presets** is classified by:
- **`gender`**: `'female'` (14 voices) | `'male'` (16 voices)
- **`ageGroup`**: `'child_youth'` (`Leda`, `Puck`) | `'young_adult'` (`Zephyr`, `Fenrir`, `Laomedeia`, `Achernar`, `Autonoe`, `Achird`) | `'adult'` (`Sulafat`, `Aoede`, `Orus`, `Enceladus`, `Iapetus`, `Umbriel`, `Kore`, `Callirrhoe`, `Despina`, `Erinome`, `Alnilam`, `Schedar`, `Pulcherrima`, `Zubenelgenubi`, `Sadachbia`) | `'mature_elder'` (`Charon`, `Vindemiatrix`, `Gacrux`, `Algenib`, `Sadaltager`, `Algieba`, `Rasalgethi`)
- **`roughness` (Vocal Texture)**:
  - `'crystalline'` (bell-clear, sparkling): `Zephyr`, `Leda`, `Laomedeia`, `Autonoe`, `Erinome` — young children, fairies, kittens, balloons.
  - `'smooth'` (velvety, liquid): `Aoede`, `Umbriel`, `Algieba`, `Despina`, `Vindemiatrix` — bedtime/daytime narrators, queens, grandmothers, shadow figures.
  - `'warm_clear'` (rich, natural, grounded): `Sulafat`, `Puck`, `Fenrir`, `Orus`, `Kore`, `Callirrhoe`, `Iapetus`, `Alnilam`, `Schedar`, `Rasalgethi`, `Achird`, `Sadaltager` — fireside narrator, knights, soldiers, shopkeepers, wizards, kings.
  - `'breathy'` (airy halo, whisper-croon): `Enceladus`, `Achernar` — sleepy bedtime moon, shy sprouts, angels, nocturnal whispers.
  - `'husky_textured'` (warm grain, chest resonance): `Charon`, `Gacrux`, `Pulcherrima`, `Zubenelgenubi`, `Sadachbia` — grandfathers, wise elders, witches, salty beach crabs, booming genies.
  - `'gravelly'` (deep raspy rumble): `Algenib` — grumpy/lovable dragons (`Barnaby`), monsters, trolls, pirates.
- **`pitch`**: `'high'` | `'medium_high'` | `'medium'` | `'medium_low'` | `'low'`
- **`energy`**: `'soothing_calm'` | `'steady_measured'` | `'breezy_natural'` | `'upbeat_playful'` | `'bold_theatrical'`
- **`accentAffinity`**: Natural delivery + best regional/storytelling accents (`Classic British RP`, `Scottish/Irish folksy`, `Coastal harbor`, `Theatrical carnival`) steerable via `--style`.
- **`themes`**: Story theme tags matching `AUDIO_CATALOG.md` (`bedtime`, `lullaby`, `birthday`, `party`, `beach`, `summer`, `medieval`, `fantasy`, `cozy_village`, `magic`, `mystery`, `comedy`, `adventure`, `royal`).

### Querying & Filtering the Voice Catalog via CLI (`voices`)
You can filter both the 30 prebuilt voices and 40 character presets directly from the command line:
```bash
# Filter by story theme (e.g., bedtime, medieval, birthday, beach, mystery, comedy)
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --theme bedtime

# Filter by gender, age group, or vocal roughness/texture
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --gender male --roughness gravelly
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --gender female --age child_youth
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --age mature_elder --roughness husky_textured

# Filter by accent affinity or free-text search
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --accent "British"
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --search "dragon"

# Inspect a specific character preset
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voices --character knight
```

---

## Step 4: Generate Single-Speaker Narration & Character Voiceovers (`tts`)

Use the `tts` subcommand to synthesize narration or single-character lines into `.wav` files inside `<engine-root>/public/audio/`.

### Automatic Character Archetype Mapping (`--character` — 40 Built-In Presets)
Every visual `CharacterKind` rig in the Picture Book Studio engine (`little_girl`, `shopkeeper`, `moon`, `sun`, `cat`, `singing_radish`, `birthday_strawberry`, `watermelon_slice`, `blue_party_cat`, `hello_bug`, `party_banana`, `crying_onion`, `cherry_twins`, `acorn_twins`, `olive_sprout`, `knight`, `soldier`, `dragon`, `villager`), 3 narrator moods (`narrator`, `storyteller`, `bedtime`), and 18 story archetypes (`boy`, `girl`, `man`, `woman`, `elder_man`, `elder_woman`, `wise_elder`, `king`, `queen`, `prince`, `princess`, `wizard`, `witch`, `fairy`, `angel`, `genie`, `villain`, `shadow_figure`) have a curated Google AI Studio voice and default `speech_metadata.style` acting prompt built in!

```bash
# Warm storybook narrator (defaults to Sulafat voice with warm bedtime storyteller style)
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" tts \
  --character narrator \
  --text "Once upon a time, beneath a blanket of silver stars, <short pause> a little lantern began to glow." \
  --out "<engine-root>/public/audio/act1_narration.wav"

# Playful young boy character with custom acting style override
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" tts \
  --character boy \
  --style "Excited, breathless, whispering in awe as if discovering a secret treasure" \
  --text "<gasp> Look at the river! The stepping stones are made of starlight! <laugh>" \
  --out "<engine-root>/public/audio/act1_leo.wav"

# Explicit prebuilt voice selection (30 studio voices available)
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" tts \
  --voice Algenib \
  --style "Deep, gravelly, rumbling yet lovable storybook dragon with a warm chuckle" \
  --text "Who dares cross my mossy bridge? <laugh> Oh, thank you for popping that thorny bramble from my tooth!" \
  --out "<engine-root>/public/audio/act2_dragon.wav"
```

### Supported Models (`--model`)
| Model ID | Best For | Features |
|---|---|---|
| `gemini-3.8-flash-tts` *(default)* | Highest studio quality, emotional storytelling, dynamic acting | Supports `speech_metadata.style` acting direction, inline vocal tags (`<laugh>`, `<sigh>`, `<gasp>`, `<yawn>`, `<short pause>`), 30 prebuilt voices + custom designed `voice_...` IDs, 70+ languages |
| `gemini-3.8-flash-lite-tts` | Fast, low-latency batch generation for many short lines | Same `speech_metadata.style` and inline vocal tags with lower latency and cost |
| `gemini-2.5-flash-preview-tts` | Legacy fallback compatibility | Prepends style prompt to text and wraps raw 24kHz 16-bit PCM into a RIFF WAV header |

### Inline Vocal Tags (Gemini 3.8 TTS)
In `gemini-3.8-flash-tts` and `gemini-3.8-flash-lite-tts`, the `text` field is treated strictly as the verbatim transcript, while angle-bracket vocal tags inside the text trigger realistic non-verbal vocalizations:
- `<laugh>` — natural chuckle or laugh
- `<sigh>` — gentle or dramatic sigh
- `<gasp>` — surprised intake of breath
- `<yawn>` — sleepy bedtime yawn
- `<short pause>` — natural dramatic beat between clauses

Always put acting directions (tone, emotion, pacing, accent, energy) in `--style "..."` rather than inside `--text`, so the model never reads stage directions aloud.

---

## Step 5: Generate Multi-Speaker Scene Dialogue (`dialogue`)

When two or more characters converse in an act (or a Narrator trades lines with characters), you can generate the entire multi-voice conversation in a single coherent audio file using `dialogue`:

```bash
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" dialogue \
  --speakers "Narrator:Sulafat,Princess:Zephyr,Wizard:Charon" \
  --styles "Narrator:Warm, gentle fairy-tale narrator|Princess:Bright, curious, slightly breathless|Wizard:Ancient, raspy, mysterious and wise" \
  --text "Narrator: At the top of the spiral tower, Mira found the old astronomer.
Princess: <gasp> Master Aldous! The North Star is falling!
Wizard: <sigh> Do not fear, little princess. <short pause> Stars only fall when they wish to become lanterns." \
  --out "<engine-root>/public/audio/act2_tower_dialogue.wav"
```

- `--speakers`: Comma-separated `SpeakerAlias:VoiceOrCharacterKind` pairs (you can pass either a Gemini voice name like `Zephyr` or any of the 40 character presets like `princess`, `knight`, `dragon`, or `wizard`).
- `--styles`: Pipe-separated (`|`) `SpeakerAlias:Style description` pairs mapped to each turn's `speech_metadata.style`.
- `--text`: Multi-line dialogue script where each line starts with `SpeakerAlias: ...` (or pass `--turns-json '[...]'` for structured JSON turns).

---

## Step 6: Design Custom Brand-New Character Voices (`voice-design` — Paid Tier 1+ Feature)

> **Paywall Note**: Creating and storing custom `voice_...` profiles via `POST /v1beta/voices` (`voice-design` / "Create Speaker") requires **Paid Quota Tier 1+** (a Google Cloud Billing account linked to the project). On a **Free Tier** API key, always use the **30 prebuilt voices** (`--voice <VoiceName>` or `--character <40 presets>`) combined with `--style "<acting direction>"`, which are **100% free**!

On Paid Tier 1+ keys, Google AI Studio's Speech API supports creating custom voices from a natural-language description via `POST /v1beta/voices` (`type: "prompted"`), returning a reusable `voice_...` ID:

```bash
# 1. Create a custom voice from a prompt and save a sample WAV
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" voice-design \
  --prompt "A tiny, squeaky, adorable clockwork owl with a British accent and whimsical musical cadence" \
  --sample-text "Tick-tock, hoo-hoo! All gears are polished and ready for midnight flight!" \
  --out "<engine-root>/public/audio/owl_voice_sample.wav"

# 2. Use the returned voice_... ID in any tts or dialogue call:
agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" tts \
  --voice "voice_abc123xyz" \
  --text "Follow my golden wings through the clouds!" \
  --out "<engine-root>/public/audio/act3_owl.wav"
```

---

## Step 7: Inspect Duration & Wire `audioClips[]` into `story.ts`

1. Every `tts` and `dialogue` run prints the exact duration in seconds (e.g., `(6.42s, gemini-3.8-flash-tts, voice=Sulafat)`). You can also inspect any existing `.wav` file at any time:
   ```bash
   agy-node "<plugin-root>/skills/picture-book-voiceover/scripts/generate_audio.mjs" info \
     --in "<engine-root>/public/audio/act1_narration.wav"
   ```

2. Reference the generated files in `story.ts` using root-relative `/audio/<filename>.wav` paths inside `scene.audioClips`:
   ```ts
   audioClips: [
     {
       id: 'act1-narration',
       src: '/audio/act1_narration.wav',
       startTime: 3.8,       // Wait ~3.5s on Scene 1 if bookFrame.enabled is true!
       duration: 6.42,       // Match or slightly exceed the WAV duration
       volume: 0.95,
     },
     {
       id: 'act1-leo-line',
       src: '/audio/act1_leo.wav',
       startTime: 10.6,      // Start right after narration finishes
       duration: 4.15,
       volume: 0.95,
     },
   ]
   ```

3. **Synchronize with `acts[]` and `bookFrame`**:
   - If `bookFrame.enabled` is `true` on the **first scene**, the 3D cover opening animation takes `openDurationSec` (default `3.5s`). Start your first narration clip at `startTime: 3.6`–`4.0` so the voice begins just as the page settles open.
   - If `bookFrame.enabled` is `true` on the **last scene**, leave `closeDurationSec` (default `3.5s`) after the final narration clip finishes so the book cover closes gracefully after the final word.
   - Ensure each act's `duration` in `scene.acts[]` is at least `clipEndTime - actStartTime + 0.8s` so the scene never cuts off a spoken sentence mid-word.
   - Align character `speechText` bubble acts and `speaking: true` / `expression: 'happy' | 'surprised'` flags with the exact time window when that character's voice clip plays!


# Google AI Studio Generate Speech (Gemini TTS) Voice Catalog

This reference documents all **30 prebuilt Google AI Studio voices** and the **20 built-in Picture Book Studio character presets** (`narrator` + all 19 `CharacterKind` archetypes) supported by `generate_audio.mjs` and `generate_audio.py`.

---

## 1. Picture Book Character Presets (`--character <kind>`)

When you pass `--character <kind>` to `generate_audio.mjs tts`, or use a character kind in `dialogue --speakers "Hero:boy,Elder:wise_elder"`, the tool automatically selects the matching prebuilt voice and populates `speech_metadata.style` (which you can override with `--style`).

| `--character` / `CharacterKind` | Default Voice | Default `speech_metadata.style` Acting Prompt |
|---|---|---|
| `narrator` | `Sulafat` | Warm, expressive children's picture-book narrator with gentle pacing and magical wonder |
| `boy` | `Puck` | Youthful, curious, energetic young boy voice in an animated storybook |
| `girl` | `Leda` | Bright, youthful, enthusiastic young girl voice full of wonder |
| `man` | `Orus` | Warm, steady, friendly adult man voice |
| `woman` | `Aoede` | Warm, articulate, expressive adult woman voice |
| `elder_man` | `Charon` | Kind, weathered, grandfatherly elder voice with unhurried warmth |
| `elder_woman` | `Vindemiatrix` | Gentle, calm, grandmotherly elder woman voice with soothing cadence |
| `wise_elder` | `Gacrux` | Deep, wise, resonant sage voice speaking with calm authority and warmth |
| `king` | `Sadaltager` | Noble, regal, authoritative yet warm royal king voice |
| `queen` | `Despina` | Regal, poised, warm and majestic royal queen voice |
| `prince` | `Zephyr` | Bright, earnest, spirited young prince voice |
| `princess` | `Zephyr` | Bright, clear, warm and spirited princess voice |
| `knight` | `Fenrir` | Brave, bold, heroic knight voice with energetic conviction |
| `wizard` | `Iapetus` | Mysterious, theatrical, wise old wizard voice with magical resonance |
| `witch` | `Pulcherrima` | Dramatic, intriguing, mischievousstorybook witch voice |
| `fairy` | `Laomedeia` | Light, sparkling, whimsical fairy voice with musical cadence |
| `angel` | `Achernar` | Soft, serene, ethereal angelic voice with gentle reverb-like calm |
| `genie` | `Sadachbia` | Lively, booming, exuberant magical genie voice with playful charm |
| `villain` | `Enceladus` | Low, dramatic, scheming storybook villain voice, theatrical but family-friendly |
| `shadow_figure` | `Umbriel` | Hushed, enigmatic, shadowy whispery voice with quiet suspense |

---

## 2. All 30 Prebuilt Google AI Studio Voices (`--voice <name>`)

| Voice Name | Tone / Quality | Recommended Picture Book Roles |
|---|---|---|
| `Sulafat` | Warm | Bedtime story narrator, caring parent, comforting guide |
| `Zephyr` | Bright | Princess, prince, optimistic hero, cheerful narrator |
| `Puck` | Upbeat | Playful boy, sidekick, trickster, adventurous animal |
| `Charon` | Informative | Grandfather, wise historian, owl, astronomer |
| `Kore` | Firm | Brave captain, determined heroine, guardian |
| `Fenrir` | Excitable | Heroic knight, friendly giant, enthusiastic explorer |
| `Leda` | Youthful | Young girl, curious child, pixie, little sister |
| `Orus` | Firm | Father, blacksmith, steadfast protector |
| `Aoede` | Breezy | Mother, woodland spirit, lively storyteller |
| `Callirrhoe` | Easy-going | Friendly villager, relaxed river spirit, companion |
| `Autonoe` | Bright | Spirited mentor, daytime narrator, cheerful baker |
| `Enceladus` | Breathy | Dramatic villain, mysterious wind, whispering forest |
| `Iapetus` | Clear | Wizard, alchemist, classic narrator |
| `Umbriel` | Easy-going | Shadow figure, calm night watchman, moon spirit |
| `Algieba` | Smooth | Court advisor, silky-voiced cat, diplomat |
| `Despina` | Smooth | Queen, empress, graceful swan |
| `Erinome` | Clear | Scholar, teacher, clear educational narration |
| `Algenib` | Gravelly | Old sea captain, grumpy dwarf, stone golem |
| `Rasalgethi` | Informative | Royal herald, inventor, clockmaker |
| `Laomedeia` | Upbeat | Fairy, songbird, magical sprite |
| `Achernar` | Soft | Angel, dreamweaver, lullaby narrator |
| `Alnilam` | Firm | Royal guard, commander, steadfast oak tree |
| `Schedar` | Even | Balanced documentary-style narrator, calm chronicler |
| `Gacrux` | Mature | Wise elder, ancient dragon, mountain king |
| `Pulcherrima` | Forward | Theatrical witch, stage performer, bold adventurer |
| `Achird` | Friendly | Best friend, helpful merchant, warm innkeeper |
| `Zubenelgenubi` | Casual | Conversational modern narrator, relatable teen |
| `Vindemiatrix` | Gentle | Grandmother, healer, gentle nature spirit |
| `Sadachbia` | Lively | Genie, carnival ringmaster, celebratory host |
| `Sadaltager` | Knowledgeable | King, grand librarian, master sage |

---

## 3. Expressive Vocal Tags & Acting Style Tips (`gemini-3.8-flash-tts`)

### Inline Vocal Tags (place directly inside `--text`)
- `<laugh>` — inserts a natural laugh or chuckle matching the current style
- `<sigh>` — inserts a gentle or dramatic sigh
- `<gasp>` — inserts a surprised intake of breath
- `<yawn>` — inserts a sleepy yawn (great for bedtime stories)
- `<short pause>` — inserts a measured beat before a reveal or punchline

### Writing Great `--style` Prompts (`speech_metadata.style`)
- Combine **persona + emotion + pacing + environment**:
  - `"Warm, soothing bedtime storyteller speaking softly as if tucking a child into bed"`
  - `"Whispering in hushed, breathless excitement inside a glowing crystal cave"`
  - `"Booming, joyful, theatrical royal announcement with a proud smile"`
- Never place spoken lines inside `--style`, and never place stage directions like `(whispering)` inside `--text` — keep directions in `--style` and only use the supported angle-bracket vocal tags in `--text`.

# Picture Book Studio — Voice & Character Casting Catalog (`VOICE_CATALOG.md`)

> **Mandatory Scene Voice Casting Rule**: Before generating any narration or character dialogue with `skills/picture-book-voiceover` (`scripts/generate_audio.mjs`), agents **must** consult this catalog (or query `agy-node scripts/generate_audio.mjs voices` with `--theme`, `--gender`, `--age`, `--roughness`, `--accent`, or `--character`) to cast voices that match each character's **gender**, **age group**, **vocal roughness/texture**, **pitch**, **accent/style affinity**, and the **story theme** of the scene.
>
> All 30 prebuilt Google AI Studio Gemini TTS voices (`VOICE_CATALOG`) and all 40 character/narrator presets (`CHARACTER_VOICE_PRESET_CATALOG`) are exported as typed constants from [`engine/src/audio/voices.ts`](../src/audio/voices.ts) and [`engine/src/audio/soundEngine.ts`](../src/audio/soundEngine.ts).

---

## 1. Scene Theme -> Voice Casting Quick Lookup Table

Use this table alongside Section 1 of [`AUDIO_CATALOG.md`](./AUDIO_CATALOG.md) when planning a picture book so your voiceover cast, ambient loops, and procedural SFX share a cohesive sonic world:

| Story Theme | Primary Narrator (`--character` / `--voice`) | Alternate Narrator | Recommended Character Voices (`--character <kind>` -> Voice) | Recommended `--style` & Expressive Tags (`gemini-3.8-flash-tts`) |
| :--- | :--- | :--- | :--- | :--- |
| **Bedtime / Starlight / Lullaby** (`shortSample1`, `moonlightStory`) | `--character bedtime` (`Vindemiatrix` — mature_elder, smooth, soothing_calm) | `--character narrator` (`Sulafat` — adult, warm_clear) or `Achernar` (breathy, soft) | `little_girl` -> `Leda` (child_youth, crystalline)<br>`shopkeeper` -> `Orus` (adult, warm_clear)<br>`moon` -> `Enceladus` (adult, breathy)<br>`cat` -> `Zephyr` (young_adult, crystalline)<br>`angel` -> `Achernar` (young_adult, breathy)<br>`elder_man` -> `Charon` (mature_elder, husky_textured) | `"Soft, unhurried bedtime lullaby whisper-croon"` with `[whisper]`, `<sigh>`, `<yawn>`, and `<short pause>` before lights-out |
| **Birthday / Party / Celebration** (`meadowParty`) | `--character storyteller` (`Aoede` — adult, smooth, breezy_natural) | `Callirrhoe` (easy-going, warm_clear) or `Autonoe` (bright, crystalline) | `birthday_strawberry` -> `Leda` (child_youth, crystalline)<br>`singing_radish` -> `Puck` (child_youth, warm_clear)<br>`blue_party_cat` -> `Zephyr` (young_adult, crystalline)<br>`party_banana` -> `Puck` (child_youth, warm_clear)<br>`cherry_twins` -> `Kore` (young_adult, warm_clear)<br>`crying_onion` -> `Charon` (mature_elder, husky_textured) | `"Joyful, bouncy birthday celebration voice"` with `<laugh>`, `<gasp>` on cake reveal |
| **Beach / Ocean / Summer Splash** (`strawberryBeachBirthday`) | `--character storyteller` (`Aoede` — adult, smooth, breezy_natural) | `Callirrhoe` (adult, warm_clear, breezy_natural) or `Zephyr` (bright) | `watermelon_slice` -> `Zubenelgenubi` (young_adult, husky_textured)<br>`birthday_strawberry` -> `Leda` (child_youth, crystalline)<br>`singing_radish` -> `Puck` (child_youth, warm_clear)<br>`sun` -> `Aoede` (adult, smooth)<br>`blue_party_cat` -> `Zephyr` (young_adult, crystalline) | `"Sunny, relaxed coastal storytelling voice"` or `"Laid-back sunny beach buddy"` for `watermelon_slice` |
| **Medieval / Fantasy / Knights & Dragons** (`knightDragonQuest`) | `--character narrator` (`Sulafat` — warm fireside storyteller) | `Sadaltager` (mature_elder, authoritative chronicle narrator) or `Gacrux` (mature sage) | `knight` -> `Fenrir` (young_adult, warm_clear, bold_theatrical)<br>`soldier` -> `Orus` (adult, warm_clear, steady_measured)<br>`dragon` -> `Algenib` (mature_elder, gravelly, low)<br>`villager` -> `Puck` (child_youth, bold_theatrical)<br>`king` -> `Sadaltager` (mature_elder, warm_clear)<br>`queen` -> `Despina` (adult, smooth)<br>`wizard` -> `Iapetus` (adult, warm_clear) | `"Heroic chivalrous knight with Classic British RP accent"` (`Fenrir`), `"Deep rumbling gravelly dragon"` (`Algenib`), `"Lively town crier"` (`Puck`) |
| **Cozy Village / Woodland / Nature** (`cornerStoreDay`) | `--character narrator` (`Sulafat` — warm_clear, soothing_calm) | `Achird` (male, young_adult, warm_clear, friendly) or `Vindemiatrix` (grandmotherly) | `hello_bug` -> `Leda` (child_youth, crystalline)<br>`acorn_twins` -> `Puck` (child_youth, upbeat_playful)<br>`olive_sprout` -> `Achernar` (young_adult, breathy)<br>`elder_man` -> `Charon` (mature_elder, husky_textured)<br>`elder_woman` -> `Vindemiatrix` (mature_elder, smooth) | `"Warm, folksy pastoral woodland storyteller"` with gentle Scottish/Irish/Country lilt via `--style` |
| **Mystery / Spooky Woods / Secret Garden** | `Enceladus` (male, adult, breathy, medium_low) | `Algieba` (mature_elder, smooth) or `Erinome` (female, adult, crystalline) | `shadow_figure` -> `Umbriel` (male, adult, smooth)<br>`witch` -> `Pulcherrima` (female, adult, warm_clear)<br>`villain` -> `Enceladus` (male, adult, breathy)<br>`wise_elder` -> `Gacrux` (female, mature_elder, husky_textured) | `"Hushed, tiptoeing suspenseful whisper"` with `<gasp>`, `<short pause>` |
| **Comedy / Slapstick / Quirky Capers** | `Puck` (male, child_youth, upbeat_playful) | `Sadachbia` (male, adult, warm_clear, bold_theatrical) | `genie` -> `Sadachbia` (male, adult, warm_clear)<br>`watermelon_slice` -> `Zubenelgenubi` (male, young_adult, husky_textured)<br>`party_banana` -> `Puck` (male, child_youth, warm_clear)<br>`crying_onion` -> `Charon` (male, mature_elder, husky_textured)<br>`dragon` -> `Algenib` (male, mature_elder, gravelly) | `"Playful, comedic, expressive cartoon timing"` with `<laugh>`, `<sigh>` |

---

## 2. Vocal Classification Matrix (By Gender, Age, Roughness, Pitch, Energy & Accent)

When casting a new character or narrator, use these classification dimensions to narrow down the right voice from the 30 prebuilt voices:

### 2A. By Gender & Age Group (`gender` x `ageGroup`)

| Age Group (`ageGroup`) | Female Voices (14) | Male Voices (16) |
| :--- | :--- | :--- |
| **`child_youth`** *(Kids, sprouts, tiny bugs, mischievous sidekicks)* | `Leda` (Youthful, high, crystalline) | `Puck` (Upbeat, medium_high, warm_clear) |
| **`young_adult`** *(Energetic heroes, fairies, princes/princesses, friendly neighbors)* | `Zephyr` (Bright, high, crystalline)<br>`Laomedeia` (Upbeat, high, crystalline)<br>`Achernar` (Soft, medium_high, breathy)<br>`Autonoe` (Bright, medium_high, crystalline) | `Fenrir` (Excitable, medium_high, warm_clear)<br>`Achird` (Friendly, medium_high, warm_clear)<br>`Zubenelgenubi` (Casual, medium_low, husky_textured) |
| **`adult`** *(Narrators, parents, knights, soldiers, shopkeepers, queens, wizards)* | `Aoede` (Breezy, medium_high, smooth)<br>`Callirrhoe` (Easy-going, medium, warm_clear)<br>`Kore` (Firm, medium, warm_clear)<br>`Despina` (Smooth, medium, smooth)<br>`Erinome` (Clear, medium, crystalline)<br>`Pulcherrima` (Forward, medium_high, warm_clear)<br>`Sulafat` (Warm, medium, warm_clear) | `Orus` (Firm, medium_low, warm_clear)<br>`Enceladus` (Breathy, medium_low, breathy)<br>`Iapetus` (Clear, medium_low, warm_clear)<br>`Umbriel` (Easy-going, medium_low, smooth)<br>`Alnilam` (Firm, medium_low, warm_clear)<br>`Schedar` (Even, medium, warm_clear)<br>`Sadachbia` (Lively, medium_high, warm_clear) |
| **`mature_elder`** *(Grandparents, kings, ancient sages, dragons, chroniclers)* | `Gacrux` (Mature, medium_low, husky_textured)<br>`Vindemiatrix` (Gentle, medium_low, smooth) | `Charon` (Informative, low, husky_textured)<br>`Algieba` (Smooth, medium_low, smooth)<br>`Algenib` (Gravelly, low, gravelly)<br>`Rasalgethi` (Informative, medium_low, warm_clear)<br>`Sadaltager` (Knowledgeable, medium_low, warm_clear) |

### 2B. By Vocal Roughness / Texture (`roughness`)

| Roughness (`roughness`) | Voices | Best Character & Scene Applications |
| :--- | :--- | :--- |
| **`crystalline`** *(Bell-clear, sparkling, zero rasp)* | `Zephyr`, `Leda`, `Laomedeia`, `Autonoe`, `Erinome` | Young children (`little_girl`, `girl`), fairies (`fairy`), kittens (`cat`, `blue_party_cat`), cute berries (`birthday_strawberry`), tiny bugs (`hello_bug`), and crisp educational narration. |
| **`smooth`** *(Velvety, liquid, seamless legatos)* | `Aoede`, `Umbriel`, `Algieba`, `Despina`, `Vindemiatrix` | Primary & bedtime narrators (`bedtime`, `storyteller`), royal queens (`queen`), glowing sun (`sun`), grandmotherly roles (`elder_woman`), and shadowy figures (`shadow_figure`). |
| **`warm_clear`** *(Rich, natural, resonant, grounded)* | `Puck`, `Kore`, `Fenrir`, `Orus`, `Callirrhoe`, `Iapetus`, `Alnilam`, `Schedar`, `Rasalgethi`, `Pulcherrima`, `Achird`, `Sadachbia`, `Sadaltager`, `Sulafat` | Fireside narration (`narrator`), knights (`knight`), soldiers (`soldier`), kings (`king`), wizards (`wizard`), witches (`witch`), genies (`genie`), shopkeepers (`shopkeeper`), and everyday parents (`man`). |
| **`breathy`** *(Airy halo, intimate whisper-croon)* | `Enceladus`, `Achernar` | Sleepy bedtime moon (`moon`), tiny shy sprouts (`olive_sprout`), guardian angels (`angel`), wind spirits, and hushed mystery scenes. |
| **`husky_textured`** *(Warm grain, chest resonance, characterful)* | `Charon`, `Gacrux`, `Zubenelgenubi` | Grandfatherly elders (`elder_man`, `crying_onion`), wise sages (`wise_elder`), and laid-back beach buddies (`watermelon_slice`). |
| **`gravelly`** *(Deep rumble, raspy, earthy)* | `Algenib` | Grumpy or lovable dragons (`dragon`), trolls, stone golems, pirates, and gruff blacksmiths. |

### 2C. By Pitch Register (`pitch`) & Delivery Energy (`energy`)

- **High Pitch (`high`)**: `Zephyr`, `Leda`, `Laomedeia` — tiny creatures, young children, fairies.
- **Medium-High Pitch (`medium_high`)**: `Puck`, `Fenrir`, `Aoede`, `Autonoe`, `Achernar`, `Pulcherrima`, `Sadachbia` — energetic youth, spirited knights, breezy narrators, theatrical witches & genies.
- **Medium Pitch (`medium`)**: `Kore`, `Callirrhoe`, `Despina`, `Erinome`, `Schedar`, `Achird`, `Sulafat` — balanced storytellers, mothers, queens, friendly neighbors.
- **Medium-Low Pitch (`medium_low`)**: `Orus`, `Enceladus`, `Iapetus`, `Umbriel`, `Algieba`, `Alnilam`, `Gacrux`, `Rasalgethi`, `Zubenelgenubi`, `Vindemiatrix`, `Sadaltager` — fathers, shopkeepers, soldiers, wizards, grandmothers, sages, kings.
- **Low Pitch (`low`)**: `Charon`, `Algenib` — dragons, grandfathers, melodramatic elders.

### 2D. Accent & Dialect Steering Guide (`accentAffinity` + `--style`)

All 30 voices speak with a neutral studio baseline by default and support **70+ languages** plus natural-language regional accent and dialect steering via the `--style` flag:
- **Classic British RP / Royal Court / Oxford Professor**: Best on `Sadaltager`, `Despina`, `Iapetus`, `Erinome`, `Kore`, `Fenrir`, `Algieba` (e.g., `--style "Regal British RP royal herald"`).
- **Warm Scottish / Irish / Country Folksy Storyteller**: Best on `Charon`, `Orus`, `Algenib`, `Vindemiatrix`, `Achird`, `Zubenelgenubi` (e.g., `--style "Warm Scottish highland blacksmith with a friendly rumble"`).
- **Coastal / Maritime / Surfer / Harbor Accent**: Best on `Zubenelgenubi`, `Callirrhoe`, `Fenrir`, `Aoede` (e.g., `--style "Laid-back coastal beach buddy"`).
- **Theatrical / Carnival / Fairy-Tale Stage Delivery**: Best on `Puck`, `Sadachbia`, `Pulcherrima`, `Laomedeia` (e.g., `--style "Exuberant carnival ringmaster"`).

---

## 3. Master Catalog of All 30 Prebuilt Voices (`VOICE_CATALOG`)

Every voice below can be passed via `--voice <VoiceName>` to `generate_audio.mjs tts` or `Speaker:VoiceName` in `generate_audio.mjs dialogue`:

| # | Voice Name | Gender | Age Group | Pitch | Tone | Roughness | Energy | Accent Affinity | Description (How & Where to Use) | Recommended Roles | Themes |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **`Zephyr`** | `female` | `young_adult` | `high` | Bright | `crystalline` | `upbeat_playful` | Neutral North American; steers well to light British RP or fairy-tale lilt | Crisp, airy, sparkling high-register voice with an effortless smile. Ideal for curious young protagonists, playful kittens, princesses, or cheerful daytime narration. | `blue_party_cat`, `cat`, `princess`, `prince`, `young_hero` | `birthday`, `party`, `magic`, `adventure`, `summer`, `cozy_village` |
| 2 | **`Puck`** | `male` | `child_youth` | `medium_high` | Upbeat | `warm_clear` | `bold_theatrical` | Neutral animated; excels at cheeky British, Irish sprite, or carnival announcer | Bouncy, mischievous, animated young voice full of theatrical energy. Perfect for comic-relief sidekicks, exuberant town criers, singing radishes, and playful woodland twins. | `singing_radish`, `party_banana`, `acorn_twins`, `villager`, `boy` | `birthday`, `party`, `comedy`, `adventure`, `medieval`, `summer`, `cozy_village` |
| 3 | **`Charon`** | `male` | `mature_elder` | `low` | Informative | `husky_textured` | `steady_measured` | Warm neutral; adapts naturally to old-world British, Scottish, or rustic elder accents | Deep, weathered, grandfatherly baritone with rich chest resonance and unhurried pacing. Ideal for wise elders, solemn lore introductions, or dry comedic contrast (`crying_onion`). | `elder_man`, `crying_onion`, `grandfather`, `old_owl`, `chronicle_narrator` | `bedtime`, `lullaby`, `cozy_village`, `comedy`, `mystery`, `fantasy` |
| 4 | **`Kore`** | `female` | `adult` | `medium` | Firm | `warm_clear` | `steady_measured` | Crisp General American or poised Transatlantic / British RP | Grounded, confident, articulate adult female voice with reassuring clarity. Suits decisive leaders, teachers, protective mothers, `cherry_twins`, and clear instructional narration. | `cherry_twins`, `mother`, `teacher`, `captain`, `narrator` | `adventure`, `royal`, `cozy_village`, `fantasy`, `birthday`, `party` |
| 5 | **`Fenrir`** | `male` | `young_adult` | `medium_high` | Excitable | `warm_clear` | `bold_theatrical` | Neutral heroic; steers easily into chivalrous British knight or surfer bro | Spirited, courageous, energetic male voice that projects enthusiasm and bravery. Made for quests, knights in shining armor (`knight`), and action-packed pages. | `knight`, `prince`, `hero`, `adventurer` | `medieval`, `fantasy`, `adventure`, `summer`, `beach`, `royal` |
| 6 | **`Leda`** | `female` | `child_youth` | `high` | Youthful | `crystalline` | `upbeat_playful` | Sweet neutral child-like cadence; supports gentle storybook accents | Pure, innocent, wide-eyed young girl voice brimming with wonder and sweetness. The go-to choice for child protagonists (`little_girl`), tiny garden bugs (`hello_bug`), and cute berry characters (`birthday_strawberry`). | `little_girl`, `birthday_strawberry`, `hello_bug`, `girl`, `child` | `birthday`, `party`, `cozy_village`, `bedtime`, `magic`, `summer` |
| 7 | **`Orus`** | `male` | `adult` | `medium_low` | Firm | `warm_clear` | `steady_measured` | Warm Heartland / General American; steers well to country shopkeeper or royal guardsman | Sturdy, dependable, warm-hearted baritone with a welcoming neighborhood presence. Perfect for friendly shopkeepers (`shopkeeper`), fathers, loyal royal soldiers (`soldier`), and grounded narrators. | `shopkeeper`, `soldier`, `man`, `father`, `blacksmith` | `cozy_village`, `bedtime`, `medieval`, `adventure`, `royal` |
| 8 | **`Aoede`** | `female` | `adult` | `medium_high` | Breezy | `smooth` | `breezy_natural` | Neutral lyrical; adapts to sunny coastal or classic storybook English | Flowing, musical, sunlit storyteller voice with effortless warmth and grace. One of the best all-around picture-book narrators (`storyteller`) and morning `sun` voices. | `storyteller`, `sun`, `woman`, `mother` | `fantasy`, `cozy_village`, `summer`, `beach`, `party`, `magic`, `bedtime`, `lullaby` |
| 9 | **`Callirrhoe`** | `female` | `adult` | `medium` | Easy-going | `warm_clear` | `breezy_natural` | Relaxed neutral; great for coastal/beach or friendly neighbor accents | Relaxed, conversational, smiling voice with a natural rhythm that puts listeners at ease. Great for musical characters, friendly neighbors, and sunny beach tales. | `neighbor`, `beach_narrator`, `big_sister`, `musician` | `summer`, `beach`, `party`, `birthday`, `cozy_village`, `comedy` |
| 10 | **`Autonoe`** | `female` | `young_adult` | `medium_high` | Bright | `crystalline` | `upbeat_playful` | Crisp, modern animated cadence | Shimmering, radiant, high-clarity voice that sparkles with excitement. Ideal for twinkling stars, fairies, and celebratory announcements. | `star_spirit`, `fairy`, `cheerful_guide` | `magic`, `party`, `birthday`, `fantasy`, `adventure` |
| 11 | **`Enceladus`** | `male` | `adult` | `medium_low` | Breathy | `breathy` | `soothing_calm` | Soft intimate studio delivery; great for hushed theatrical or nocturnal styles | Hushed, velvety, breathy baritone with a dreamy halo around every word. Tailored for the sleepy bedtime `moon`, nocturnal whispers, or theatrical scheming `villain` roles. | `moon`, `villain`, `wind_spirit`, `night_narrator` | `bedtime`, `lullaby`, `mystery`, `fantasy`, `magic` |
| 12 | **`Iapetus`** | `male` | `adult` | `medium_low` | Clear | `warm_clear` | `steady_measured` | Articulate neutral or classic scholarly British | Resonant, articulate, scholarly male voice with crystal-clear diction and quiet mystique. Ideal for `wizard` roles, inventors, astronomers, and classic fairy-tale narration. | `wizard`, `scholar`, `clockmaker`, `narrator` | `magic`, `fantasy`, `medieval`, `mystery`, `adventure` |
| 13 | **`Umbriel`** | `male` | `adult` | `medium_low` | Easy-going | `smooth` | `soothing_calm` | Mellow, unhurried neutral delivery | Smooth, unruffled, shadowy-velvet voice that stays calm under any circumstance. Fits mysterious `shadow_figure` roles or sleepy forest guardians. | `shadow_figure`, `forest_spirit`, `night_watchman` | `mystery`, `bedtime`, `fantasy`, `cozy_village`, `magic` |
| 14 | **`Algieba`** | `male` | `mature_elder` | `medium_low` | Smooth | `smooth` | `soothing_calm` | Refined, polished Mid-Atlantic or classic British storyteller | Silky, distinguished, unhurried baritone with old-world polish. Wonderful for classic velveteen-rabbit-style narration, royal chancellors, and tranquil evening scenes. | `chancellor`, `evening_narrator`, `owl`, `gentleman` | `royal`, `bedtime`, `mystery`, `cozy_village`, `fantasy` |
| 15 | **`Despina`** | `female` | `adult` | `medium` | Smooth | `smooth` | `soothing_calm` | Poised, regal neutral or soft British RP | Graceful, velvety, serene female voice with royal poise and comforting warmth. Ideal for benevolent `queen` roles, swan characters, and gentle bedtime storytelling. | `queen`, `swan`, `mother`, `lullaby_narrator` | `royal`, `bedtime`, `lullaby`, `fantasy`, `magic` |
| 16 | **`Erinome`** | `female` | `adult` | `medium` | Clear | `crystalline` | `steady_measured` | Precise, bell-like neutral or British RP | Pure, bell-clear, articulate female voice that cuts through busy soundscapes with poise. Suits clever detectives, crystal spirits, librarians, and mystery narrators. | `detective`, `librarian`, `crystal_fairy`, `narrator` | `mystery`, `magic`, `adventure`, `fantasy` |
| 17 | **`Algenib`** | `male` | `mature_elder` | `low` | Gravelly | `gravelly` | `bold_theatrical` | Deep raspy rumble; steers great into Scottish dwarf, pirate, or grumpy dragon | Deep, rumbling, gravelly bass-baritone packed with texture and lovable gruffness. The signature voice for `dragon` characters with toothaches, friendly monsters, trolls, and bears. | `dragon`, `bear`, `troll`, `pirate`, `giant` | `medieval`, `fantasy`, `adventure`, `comedy` |
| 18 | **`Rasalgethi`** | `male` | `mature_elder` | `medium_low` | Informative | `warm_clear` | `steady_measured` | Professorial neutral or Oxford academic | Thoughtful, professorial, articulate elder voice that makes lore and nature facts sound fascinating. Great for wise owls, museum curators, and storybook prologues. | `professor`, `owl`, `historian`, `elder_advisor` | `fantasy`, `mystery`, `adventure`, `cozy_village` |
| 19 | **`Laomedeia`** | `female` | `young_adult` | `high` | Upbeat | `crystalline` | `upbeat_playful` | Musical, bubbly animated delivery | Effervescent, floaty, musical high voice that sounds like it is dancing on air. Built for `fairy` characters, butterflies, and giggly magical creatures. | `fairy`, `butterfly`, `pixie` | `magic`, `party`, `birthday`, `fantasy`, `bedtime` |
| 20 | **`Achernar`** | `female` | `young_adult` | `medium_high` | Soft | `breathy` | `soothing_calm` | Whisper-soft, delicate neutral | Feather-soft, gentle, whispery female voice with tender vulnerability and calm. Ideal for tiny `olive_sprout` characters, guardian `angel` roles, shy woodland fawns, and lullabies. | `olive_sprout`, `angel`, `fawn`, `bedtime_whisper` | `bedtime`, `lullaby`, `magic`, `fantasy`, `cozy_village`, `party`, `summer` |
| 21 | **`Alnilam`** | `male` | `adult` | `medium_low` | Firm | `warm_clear` | `steady_measured` | Strong, heroic neutral | Resolute, steady, heroic baritone with clean projection. Great for sea captains, lighthouse keepers, steadfast guardians, and adventure narration. | `captain`, `guardian`, `lighthouse_keeper`, `soldier` | `adventure`, `beach`, `summer`, `medieval`, `royal` |
| 22 | **`Schedar`** | `male` | `adult` | `medium` | Even | `warm_clear` | `steady_measured` | Balanced, everyday neutral | Balanced, calm, relatable male voice with even pacing and zero harshness. Works seamlessly as an everyday narrator, caring dad, or calm village artisan. | `narrator`, `father`, `carpenter`, `baker` | `cozy_village`, `bedtime`, `adventure`, `summer` |
| 23 | **`Gacrux`** | `female` | `mature_elder` | `medium_low` | Mature | `husky_textured` | `steady_measured` | Rich, matriarchal neutral or ancient world-storyteller | Deep, resonant, matriarchal alto with soulful texture and timeless wisdom. Perfect for ancient `wise_elder` sages, grandmotherly storytellers, and oracle characters. | `wise_elder`, `grandmother`, `oracle`, `ancient_tree` | `fantasy`, `magic`, `royal`, `medieval`, `bedtime`, `mystery` |
| 24 | **`Pulcherrima`** | `female` | `adult` | `medium_high` | Forward | `warm_clear` | `bold_theatrical` | Expressive stage delivery; great for theatrical European or fairy-tale accents | Bold, expressive, stage-forward voice that commands attention. Ideal for mischievous `witch` roles, dramatic divas, sassy foxes, and theatrical antagonists. | `witch`, `fox`, `diva`, `enchantress` | `magic`, `fantasy`, `comedy`, `mystery`, `adventure` |
| 25 | **`Achird`** | `male` | `young_adult` | `medium` | Friendly | `warm_clear` | `breezy_natural` | Warm, approachable neighborly cadence | Warm, open, boy-next-door voice that immediately sounds like a trusted best friend. Great for friendly animal companions, older brothers, and cozy village helpers. | `best_friend`, `dog`, `older_brother`, `villager` | `cozy_village`, `adventure`, `summer`, `birthday`, `comedy` |
| 26 | **`Zubenelgenubi`** | `male` | `young_adult` | `medium_low` | Casual | `husky_textured` | `breezy_natural` | Laid-back coastal, boardwalk, or folksy humor accent | Laid-back, gravelly-warm, conversational voice with natural comedic charm. Tailored for laid-back beach buddies (`watermelon_slice`), sleepy turtles, frogs, and humorous sidekicks. | `watermelon_slice`, `turtle`, `frog`, `beach_buddy` | `beach`, `summer`, `comedy`, `adventure`, `cozy_village` |
| 27 | **`Vindemiatrix`** | `female` | `mature_elder` | `medium_low` | Gentle | `smooth` | `soothing_calm` | Soft, nurturing grandmotherly cadence | Tender, embracing, slow-paced alto that wraps the listener in a warm blanket. Our top pick for `bedtime` lullaby narration, `elder_woman` grandmothers, and gentle healers. | `bedtime`, `elder_woman`, `grandmother`, `lullaby_narrator` | `bedtime`, `lullaby`, `cozy_village`, `fantasy` |
| 28 | **`Sadachbia`** | `male` | `adult` | `medium_high` | Lively | `warm_clear` | `bold_theatrical` | Booming theatrical showman | Booming, charismatic, larger-than-life showman voice brimming with humor and flair. Made for magical `genie` characters, circus ringmasters, and jovial merchants. | `genie`, `ringmaster`, `merchant`, `jester` | `magic`, `fantasy`, `comedy`, `party`, `adventure` |
| 29 | **`Sadaltager`** | `male` | `mature_elder` | `medium_low` | Knowledgeable | `warm_clear` | `steady_measured` | Regal British RP or noble chronicle baritone | Noble, commanding, deep baritone with royal dignity and benevolent authority. Ideal for `king` roles, epic fantasy prologue narrators, and lion monarchs. | `king`, `lion`, `royal_chronicler`, `wise_elder` | `royal`, `medieval`, `fantasy`, `adventure` |
| 30 | **`Sulafat`** | `female` | `adult` | `medium` | Warm | `warm_clear` | `soothing_calm` | Classic warm picture-book narrator | Rich, glowing, golden-hour female voice with heartfelt warmth and crystal clarity. The default signature `narrator` for Animated Picture Book Studio. | `narrator`, `mother`, `kind_fairy`, `storyteller` | `bedtime`, `lullaby`, `cozy_village`, `fantasy`, `magic`, `birthday` |

---

## 4. Character & Narrator Preset Catalog (`CHARACTER_VOICE_PRESET_CATALOG`)

Pass `--character <preset>` to `generate_audio.mjs tts` (or use `Speaker:<preset>` in `generate_audio.mjs dialogue`) to automatically select both the prebuilt voice and a tailored natural-language `--style` prompt.

### 4A. Engine Visual `CharacterKind` Rigs (19 Rigs) & Narrator Moods (3 Presets)

Every visual rig in [`engine/src/engine/schema.ts`](../src/engine/schema.ts) (`CharacterKind`) has a dedicated 1:1 preset:

| `--character` Key | Mapped Voice | Gender / Age / Roughness | Default `--style` Direction | How & Where to Use | Themes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`narrator`** | `Sulafat` | `female` / `adult` / `warm_clear` | Warm, gentle, expressive children's picture-book narrator with unhurried storybook pacing and wonder | Primary narrator across all storybooks when no specialized narrator mood is requested. | `bedtime`, `lullaby`, `cozy_village`, `fantasy`, `magic`, `birthday` |
| **`storyteller`** | `Aoede` | `female` / `adult` / `smooth` | Breezy, lyrical, enchanting picture-book storyteller reading aloud to children | Daytime and fairy-tale narrator with a musical, breezy cadence for upbeat or whimsical adventures. | `fantasy`, `cozy_village`, `summer`, `magic`, `adventure` |
| **`bedtime`** | `Vindemiatrix` | `female` / `mature_elder` / `smooth` | Soft, soothing, unhurried bedtime lullaby narrator, calm and dreamy | Extra-gentle, slow-paced lullaby narrator for nighttime scenes and closing book-frame sequences. | `bedtime`, `lullaby`, `cozy_village` |
| **`little_girl`** | `Leda` | `female` / `child_youth` / `crystalline` | Bright, curious, sweet young girl voice, cheerful and full of childhood wonder | Matches the `little_girl` crayon cutout rig (`shortSample1`, `cornerStoreDay`); use for curious questions, counting stars, and joyful exclamations. | `cozy_village`, `bedtime`, `birthday`, `party`, `summer` |
| **`shopkeeper`** | `Orus` | `male` / `adult` / `warm_clear` | Warm, welcoming, kindly neighborhood corner-store shopkeeper with a friendly smile in his voice | Matches the `shopkeeper` rig at `"LUNE STORE"` (`cornerStoreDay`); ideal for friendly greetings and handing over hot pizza. | `cozy_village`, `comedy`, `bedtime` |
| **`moon`** | `Enceladus` | `male` / `adult` / `breathy` | Soft, sleepy bedtime whisper-croon, calm, dreamy, and comforting like starlight | Matches the `moon` rig (`shortSample1`, `moonlightStory`, `strawberryBeachBirthday`); use with `<yawn>` and `<sigh>` tags for sleepy goodnights. | `bedtime`, `lullaby`, `magic`, `cozy_village` |
| **`sun`** | `Aoede` | `female` / `adult` / `smooth` | Warm, golden, cheerful morning voice radiating gentle encouragement and sunshine | Matches the `sun` rig (`shortSample1`, `strawberryBeachBirthday`); ideal for morning wake-up greetings and sunny encouragement. | `summer`, `beach`, `cozy_village`, `party` |
| **`cat`** | `Zephyr` | `female` / `young_adult` / `crystalline` | Light, playful, soft kitten-like voice with tiny curious inflections | Matches the `cat` tabby kitten rig (`cornerStoreDay`, `moonlitGarden`); great for soft meows and curious commentary. | `cozy_village`, `bedtime`, `comedy`, `adventure` |
| **`singing_radish`** | `Puck` | `male` / `child_youth` / `warm_clear` | Upbeat, musical, theatrical and bouncy voice, joyful and ready to burst into song | Matches the `singing_radish` rig (`meadowParty`, `strawberryBeachBirthday`); ideal for leading party songs and enthusiastic cheers. | `birthday`, `party`, `beach`, `summer`, `comedy` |
| **`birthday_strawberry`** | `Leda` | `female` / `child_youth` / `crystalline` | Sweet, high-spirited, endearing little berry voice, fluttery when shy and giggly when happy | Matches the `birthday_strawberry` rig (`meadowParty`, `strawberryBeachBirthday`); pair with `<gasp>` when scared of waves and `<laugh>` when splashing in a floatie. | `birthday`, `party`, `beach`, `summer`, `comedy` |
| **`watermelon_slice`** | `Zubenelgenubi` | `male` / `young_adult` / `husky_textured` | Relaxed, sunny, friendly and mellow summer beach buddy voice | Matches the `watermelon_slice` rig (`meadowParty`, `strawberryBeachBirthday`); great for reassuring beach banter and chill party vibes. | `beach`, `summer`, `birthday`, `party`, `comedy` |
| **`blue_party_cat`** | `Zephyr` | `female` / `young_adult` / `crystalline` | Playful, upbeat, rhythmic party cat voice with festive enthusiasm | Matches the `blue_party_cat` rig (`meadowParty`, `strawberryBeachBirthday`); use for party countdowns and cheering. | `birthday`, `party`, `beach`, `summer`, `comedy` |
| **`hello_bug`** | `Leda` | `female` / `child_youth` / `crystalline` | Tiny, polite, chipper and friendly little meadow bug voice | Matches the `hello_bug` rig; suited for cute miniature greetings and garden observations. | `cozy_village`, `birthday`, `party`, `summer` |
| **`party_banana`** | `Puck` | `male` / `child_youth` / `warm_clear` | Bouncy, comedic, goofy and expressive cartoon party voice | Matches the `party_banana` rig; ideal for silly jokes, beach-ball tosses, and party horn fanfare. | `birthday`, `party`, `beach`, `summer`, `comedy` |
| **`crying_onion`** | `Charon` | `male` / `mature_elder` / `husky_textured` | Comically sniffly and melodramatic when worried, turning into relieved happy cheering | Matches the `crying_onion` rig; pair with `<sigh>` when worried in idle state and `<laugh>` when cheering in waving/singing states. | `comedy`, `birthday`, `party`, `beach` |
| **`cherry_twins`** | `Kore` | `female` / `young_adult` / `warm_clear` | Bubbly, rhythmic, sing-song twin voice brimming with cheerful energy | Matches the `cherry_twins` rig; great for rhyming couplets and synchronized party cheers. | `birthday`, `party`, `summer`, `comedy` |
| **`acorn_twins`** | `Puck` | `male` / `child_youth` / `warm_clear` | Crisp, woodland-sprite voice with playful staccato energy | Matches the `acorn_twins` rig; ideal for woodland chatter, forest games, and autumn/camping scenes. | `cozy_village`, `fantasy`, `adventure`, `comedy` |
| **`olive_sprout`** | `Achernar` | `female` / `young_adult` / `breathy` | Gentle, soft-spoken, innocent tiny sprout voice | Matches the `olive_sprout` rig; ideal for shy, sweet lines and quiet encouragement. | `cozy_village`, `bedtime`, `party`, `summer` |
| **`knight`** | `Fenrir` | `male` / `young_adult` / `warm_clear` | Heroic, warm, chivalrous storybook knight—bold in proclamation yet kind-hearted | Matches Sir Leo the `knight` rig (`knightDragonQuest`); use for quest proclamations, comforting scared soldiers, and helping the dragon. | `medieval`, `fantasy`, `adventure`, `royal`, `comedy` |
| **`soldier`** | `Orus` | `male` / `adult` / `warm_clear` | Sturdy, loyal, earnest royal guardsman, slightly nervous around spooky woods | Matches the `soldier` rig (`knightDragonQuest`); ideal for campfire ghost stories (`<gasp>`) and loyal marching dialogue. | `medieval`, `fantasy`, `adventure`, `royal` |
| **`dragon`** | `Algenib` | `male` / `mature_elder` / `gravelly` | Deep, gravelly, rumbling yet lovable storybook dragon—grumpy when his tooth hurts, sweet and grateful once helped | Matches Barnaby the `dragon` rig (`knightDragonQuest`); use gravelly groans before the bramble is popped from his tooth, then joyful `<laugh>` relief. | `medieval`, `fantasy`, `adventure`, `comedy` |
| **`villager`** | `Puck` | `male` / `child_youth` / `warm_clear` | Lively, theatrical medieval town herald and expressive village storyteller | Matches the `villager` castle herald rig (`knightDragonQuest`); ideal for "Hear ye! Hear ye!" royal scroll announcements and victory parades. | `medieval`, `royal`, `cozy_village`, `fantasy` |

### 4B. Story Archetype Presets (18 Presets for Custom / Procedural Characters)

When a story introduces custom characters or uses generic character archetypes, use these presets:

| `--character` Key | Mapped Voice | Gender / Age / Roughness | Default `--style` Direction | Best Role & Scene Usage | Themes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`boy`** | `Puck` | `male` / `child_youth` / `warm_clear` | Youthful, curious, energetic young boy voice in an animated storybook | General young boy protagonist or adventurous sidekick. | `adventure`, `cozy_village`, `birthday`, `party`, `comedy` |
| **`girl`** | `Leda` | `female` / `child_youth` / `crystalline` | Bright, youthful, enthusiastic young girl voice full of wonder | General young girl protagonist or curious companion. | `adventure`, `cozy_village`, `birthday`, `party`, `magic` |
| **`man`** | `Orus` | `male` / `adult` / `warm_clear` | Warm, steady, friendly adult man voice | General adult male character (father, neighbor, village artisan). | `cozy_village`, `adventure`, `royal` |
| **`woman`** | `Aoede` | `female` / `adult` / `smooth` | Warm, articulate, expressive adult woman voice | General adult female character (mother, teacher, kindly neighbor). | `cozy_village`, `bedtime`, `fantasy`, `summer` |
| **`elder_man`** | `Charon` | `male` / `mature_elder` / `husky_textured` | Kind, weathered, grandfatherly elder voice with unhurried warmth | Grandfather, old village storyteller, or retired craftsman. | `cozy_village`, `bedtime`, `fantasy`, `medieval` |
| **`elder_woman`** | `Vindemiatrix` | `female` / `mature_elder` / `smooth` | Gentle, calm, grandmotherly elder woman voice with soothing cadence | Grandmother, village healer, or kind bakery matron. | `cozy_village`, `bedtime`, `lullaby`, `fantasy` |
| **`wise_elder`** | `Gacrux` | `female` / `mature_elder` / `husky_textured` | Deep, wise, resonant sage voice speaking with calm authority and warmth | Ancient sage, oracle, or council elder guiding heroes on a quest. | `fantasy`, `magic`, `medieval`, `royal`, `mystery` |
| **`king`** | `Sadaltager` | `male` / `mature_elder` / `warm_clear` | Noble, regal, authoritative yet warm royal king voice | Benevolent monarch issuing royal quests or welcoming heroes home. | `royal`, `medieval`, `fantasy`, `adventure` |
| **`queen`** | `Despina` | `female` / `adult` / `smooth` | Regal, poised, warm and majestic royal queen voice | Graceful queen presiding over castle celebrations or fairy-tale courts. | `royal`, `medieval`, `fantasy`, `magic` |
| **`prince`** | `Zephyr` | `female` / `young_adult` / `crystalline` | Bright, earnest, spirited young prince voice | Young storybook prince on a whimsical fairy-tale adventure. | `royal`, `fantasy`, `adventure`, `magic` |
| **`princess`** | `Zephyr` | `female` / `young_adult` / `crystalline` | Bright, clear, warm and spirited princess voice | Adventurous, kind-hearted princess in castle or starlight stories. | `royal`, `fantasy`, `magic`, `adventure`, `party` |
| **`wizard`** | `Iapetus` | `male` / `adult` / `warm_clear` | Mysterious, theatrical, wise old wizard voice with magical resonance | Tower astronomer, friendly alchemist, or spellcasting mentor. | `magic`, `fantasy`, `medieval`, `mystery` |
| **`witch`** | `Pulcherrima` | `female` / `adult` / `husky_textured` | Dramatic, intriguing, mischievous storybook witch voice | Playful potion-brewing woodland witch (pair with `<laugh>` for a friendly cackle). | `magic`, `fantasy`, `comedy`, `mystery` |
| **`fairy`** | `Laomedeia` | `female` / `young_adult` / `crystalline` | Light, sparkling, whimsical fairy voice with musical cadence | Wishing-star fairy, garden sprite, or magical guide. | `magic`, `fantasy`, `bedtime`, `party` |
| **`angel`** | `Achernar` | `female` / `young_adult` / `breathy` | Soft, serene, ethereal angelic voice with gentle reverb-like calm | Starlight guardian angel or dream spirit in bedtime stories. | `bedtime`, `lullaby`, `magic`, `fantasy` |
| **`genie`** | `Sadachbia` | `male` / `adult` / `husky_textured` | Lively, booming, exuberant magical genie voice with playful charm | Larger-than-life wish-granting genie or magical ringmaster. | `magic`, `fantasy`, `comedy`, `adventure`, `party` |
| **`villain`** | `Enceladus` | `male` / `adult` / `breathy` | Low, dramatic, scheming storybook villain voice, theatrical but family-friendly | Comedic or theatrical fairy-tale antagonist (never overly scary for children). | `fantasy`, `mystery`, `adventure`, `comedy` |
| **`shadow_figure`** | `Umbriel` | `male` / `adult` / `smooth` | Hushed, enigmatic, shadowy whispery voice with quiet suspense | Mysterious silhouette in the Whispering Woods or secret garden. | `mystery`, `fantasy`, `bedtime`, `magic` |

---

## 5. Querying the Catalog via CLI & Adding New Character Presets

### 5A. Querying & Filtering Voices from the CLI

Use `generate_audio.mjs voices` to filter by any classification dimension before synthesizing lines:

```bash
# Filter voices & character presets by story theme
agy-node scripts/generate_audio.mjs voices --theme bedtime
agy-node scripts/generate_audio.mjs voices --theme medieval

# Filter by gender, age group, or vocal roughness/texture
agy-node scripts/generate_audio.mjs voices --gender male --roughness gravelly
agy-node scripts/generate_audio.mjs voices --gender female --age child_youth
agy-node scripts/generate_audio.mjs voices --age mature_elder --roughness husky_textured

# Filter by regional accent affinity or free-text search
agy-node scripts/generate_audio.mjs voices --accent "British"
agy-node scripts/generate_audio.mjs voices --search "grandmother"

# Inspect a single character preset in JSON
agy-node scripts/generate_audio.mjs voices --character dragon

# Dump the full filtered catalog as JSON for programmatic planning
agy-node scripts/generate_audio.mjs voices --theme fantasy --json
```

### 5B. How to Add New Character Voice Presets

When adding a new visual `CharacterKind` or story archetype to the engine:
1. **Engine TypeScript Catalog**: Add the new `CharacterVoicePresetCatalogEntry` to `CHARACTER_VOICE_PRESET_CATALOG` in [`engine/src/audio/voices.ts`](../src/audio/voices.ts).
2. **CLI Generator Preset Map**: Add the matching entry to `RAW_CHARACTER_VOICE_PRESETS` in [`engine/scripts/generate_audio.mjs`](../scripts/generate_audio.mjs) (and sync to `skills/picture-book-voiceover/scripts/generate_audio.mjs` and `skills/picture-book-audio/scripts/generate_audio.mjs`).
3. **Catalog Documentation**: Add a row to Section 4 of [`engine/docs/VOICE_CATALOG.md`](./VOICE_CATALOG.md) (which automatically syncs to `skills/picture-book-voiceover/references/voice-catalog.md` via `scripts/ensure_engine.mjs`).

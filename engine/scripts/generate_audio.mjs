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
 * All 30 official Google AI Studio Gemini TTS Prebuilt Voices and their full vocal classification
 * (gender, ageGroup, pitch, tone, roughness, energy, accentAffinity, description, bestFor, recommendedRoles, themes).
 */
export const GEMINI_PREBUILT_VOICES = {
  Zephyr: {
    gender: 'female',
    ageGroup: 'young_adult',
    pitch: 'medium_high',
    tone: 'Bright',
    roughness: 'crystalline',
    energy: 'upbeat_playful',
    accentAffinity:
      'Crisp neutral American; adapts effortlessly to light storybook British RP, whimsical woodland sprite, and lively musical-theater inflections.',
    description:
      'Bright, nimble, bell-clear voice with playful buoyancy and agile pitch inflections. Ideal for spirited young royalty, curious cats, and cheerful daytime narration.',
    bestFor: 'Playful characters, cats, princess/prince roles, cheerful narration',
    recommendedRoles: ['cat', 'blue_party_cat', 'prince', 'princess', 'optimistic_hero', 'cheerful_narrator'],
    themes: ['party', 'birthday', 'royal', 'fantasy', 'adventure', 'comedy'],
  },
  Puck: {
    gender: 'male',
    ageGroup: 'child_youth',
    pitch: 'medium_high',
    tone: 'Upbeat',
    roughness: 'warm_clear',
    energy: 'upbeat_playful',
    accentAffinity:
      'Energetic general American; excels at rustic medieval town herald, cheeky woodland sprite, and bouncy cartoon-vaudeville delivery.',
    description:
      'Bouncy, expressive, comic-theatrical voice brimming with kinetic mischief and musicality. Perfect for young boys, singing veggies, comedic sidekicks, and lively village heralds.',
    bestFor: 'Bouncy comedic characters, young boys, musical leaders, heralds',
    recommendedRoles: ['boy', 'singing_radish', 'party_banana', 'acorn_twins', 'villager', 'trickster'],
    themes: ['comedy', 'party', 'birthday', 'medieval', 'cozy_village', 'adventure'],
  },
  Charon: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'low',
    tone: 'Informative',
    roughness: 'husky_textured',
    energy: 'steady_measured',
    accentAffinity:
      'Resonant mid-Atlantic or classic storybook British; pairs well with grandfatherly fireside warmth, sleepy nocturnal drawls, or melodramatic comic gravitas.',
    description:
      'Deep, weathered, sonorous bass-baritone with natural gravitas and unhurried warmth. Equally suited to kind grandfathers, wise owls, sleepy moons, and comically sniffly characters.',
    bestFor: 'Grandfathers, wise elders, sleepy moon, comically dramatic characters',
    recommendedRoles: ['elder_man', 'crying_onion', 'grandfather', 'wise_owl', 'astronomer'],
    themes: ['bedtime', 'lullaby', 'cozy_village', 'comedy', 'mystery', 'fantasy'],
  },
  Kore: {
    gender: 'female',
    ageGroup: 'young_adult',
    pitch: 'medium',
    tone: 'Firm',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Clear modern American; responds well to crisp transatlantic narration, rhythmic sing-song twin cadences, and poised heroic British RP.',
    description:
      'Confident, articulate, well-grounded voice with crisp consonant definition and rhythmic drive. Great for determined heroines, synchronized twin voices, and clear storytellers.',
    bestFor: 'Clear storytellers, confident heroines, cherry twins',
    recommendedRoles: ['cherry_twins', 'confident_heroine', 'brave_captain', 'guardian'],
    themes: ['adventure', 'party', 'fantasy', 'royal', 'cozy_village'],
  },
  Fenrir: {
    gender: 'male',
    ageGroup: 'young_adult',
    pitch: 'medium',
    tone: 'Excitable',
    roughness: 'warm_clear',
    energy: 'bold_theatrical',
    accentAffinity:
      'Hearty heroic American or chivalrous storybook British; shines with theatrical knightly proclamations and boisterous adventure styles.',
    description:
      'Vigorous, enthusiastic, brassy baritone-tenor with earnest conviction and action-ready projection. Built for gallant knights, friendly giants, and spirited quest leaders.',
    bestFor: 'Brave knights, action scenes, friendly giants, enthusiastic heroes',
    recommendedRoles: ['knight', 'enthusiastic_hero', 'friendly_giant', 'adventurous_explorer'],
    themes: ['medieval', 'adventure', 'fantasy', 'royal', 'comedy'],
  },
  Leda: {
    gender: 'female',
    ageGroup: 'child_youth',
    pitch: 'high',
    tone: 'Youthful',
    roughness: 'crystalline',
    energy: 'upbeat_playful',
    accentAffinity:
      'Sweet youthful American; takes naturally to giggly childlike wonder, tiny meadow-bug piping, and delicate British storybook child accents.',
    description:
      'High, sweet, innocent childlike voice radiating curiosity, giggles, and wide-eyed wonder. The signature voice for little girls, cute berries, and tiny woodland insects.',
    bestFor: 'Little girl, birthday strawberry, hello bug, child characters',
    recommendedRoles: ['little_girl', 'girl', 'birthday_strawberry', 'hello_bug', 'pixie'],
    themes: ['birthday', 'party', 'cozy_village', 'bedtime', 'magic', 'summer'],
  },
  Orus: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium_low',
    tone: 'Firm',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Warm heartland American; pairs seamlessly with cozy neighborhood shopkeeper warmth, rustic blacksmith, or earnest medieval guardsman accents.',
    description:
      'Sturdy, dependable, welcoming baritone with a reassuring smile in the timbre. Ideal for kindly shopkeepers, fathers, loyal castle soldiers, and steadfast protectors.',
    bestFor: 'Kindly shopkeeper, loyal soldier, father, warm baritone roles',
    recommendedRoles: ['shopkeeper', 'soldier', 'man', 'father', 'blacksmith'],
    themes: ['cozy_village', 'medieval', 'adventure', 'royal'],
  },
  Aoede: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium_high',
    tone: 'Breezy',
    roughness: 'smooth',
    energy: 'breezy_natural',
    accentAffinity:
      'Lyrical neutral American or soft transatlantic; excels at enchanting read-aloud storytelling, golden morning warmth, and gentle Celtic/woodland lilt.',
    description:
      'Airy, musical, effortlessly expressive storyteller voice that floats through phrases with golden warmth. Perfect for enchanting picture-book narration, the morning sun, and caring mothers.',
    bestFor: 'Warm picture-book narrator, morning sun, caring mother, lyrical reading',
    recommendedRoles: ['storyteller', 'sun', 'woman', 'mother', 'woodland_spirit'],
    themes: ['fantasy', 'cozy_village', 'summer', 'magic', 'bedtime', 'lullaby'],
  },
  Callirrhoe: {
    gender: 'female',
    ageGroup: 'young_adult',
    pitch: 'medium',
    tone: 'Easy-going',
    roughness: 'smooth',
    energy: 'breezy_natural',
    accentAffinity:
      'Relaxed coastal American; blends naturally with sunny California beach vibes, gentle rustic villager warmth, and unhurried conversational styles.',
    description:
      'Mellow, unhurried, friendly voice with a relaxed conversational flow. Ideal for sunny summer stories, easy-going companions, river spirits, and friendly neighbors.',
    bestFor: 'Relaxed summer beach stories, friendly companions, river spirits',
    recommendedRoles: ['friendly_villager', 'river_spirit', 'beach_companion', 'relaxed_narrator'],
    themes: ['beach', 'summer', 'cozy_village', 'adventure'],
  },
  Autonoe: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium_high',
    tone: 'Bright',
    roughness: 'crystalline',
    energy: 'upbeat_playful',
    accentAffinity:
      'Crisp, polished American or sparkling British RP; ideal for classic fairy-tale narration, cheerful village baker, and spirited mentor roles.',
    description:
      'Sparkling, articulate, sunlit voice with buoyant energy and crystal-clear diction. Great for fairy-tale daytime narration, spirited mentors, and upbeat dialogue.',
    bestFor: 'Sparkling fairy-tale narration, spirited mentors, upbeat dialogue',
    recommendedRoles: ['daytime_narrator', 'spirited_mentor', 'cheerful_baker', 'fairy_tale_guide'],
    themes: ['fantasy', 'magic', 'cozy_village', 'party', 'birthday'],
  },
  Enceladus: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium_low',
    tone: 'Breathy',
    roughness: 'breathy',
    energy: 'soothing_calm',
    accentAffinity:
      'Whispered neutral/transatlantic; excels at both dreamy starlight whisper-croons (`moon`) and theatrical, silky classical villainy (`villain`).',
    description:
      'Intimate, airy, velvet-breathy baritone capable of floating as a sleepy nighttime moon whisper or coiling into a family-friendly dramatic storybook villain.',
    bestFor: 'Soft bedtime moon whispers, wind spirits, mysterious woods, theatrical villain',
    recommendedRoles: ['moon', 'villain', 'wind_spirit', 'whispering_forest'],
    themes: ['bedtime', 'lullaby', 'mystery', 'fantasy', 'magic'],
  },
  Iapetus: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'medium',
    tone: 'Clear',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Crisp classical transatlantic or theatrical British RP; shines with arcane wizardly resonance, alchemist precision, and counting/educational clarity.',
    description:
      'Precise, resonant, articulate voice with clean projection and subtle theatrical poise. Ideal for wise wizards, alchemists, and crystal-clear classic narration.',
    bestFor: 'Wizards, alchemists, crisp narration, counting scenes',
    recommendedRoles: ['wizard', 'alchemist', 'classic_narrator', 'counting_guide'],
    themes: ['magic', 'fantasy', 'mystery', 'medieval', 'adventure'],
  },
  Umbriel: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium_low',
    tone: 'Easy-going',
    roughness: 'smooth',
    energy: 'soothing_calm',
    accentAffinity:
      'Mellow neutral American or hushed nocturnal whisper; pairs well with rustic woodland calm and quiet suspenseful shadow-figure delivery.',
    description:
      'Low-key, velvety, unruffled voice that moves easily between mellow woodland creatures and hushed, enigmatic shadow figures in mystery scenes.',
    bestFor: 'Shadow figure, mellow woodland characters, calm night watchman',
    recommendedRoles: ['shadow_figure', 'woodland_creature', 'night_watchman', 'moon_spirit'],
    themes: ['mystery', 'bedtime', 'fantasy', 'cozy_village', 'magic'],
  },
  Algieba: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'medium_low',
    tone: 'Smooth',
    roughness: 'smooth',
    energy: 'soothing_calm',
    accentAffinity:
      'Cultured mid-Atlantic or suave British RP; ideal for aristocratic feline characters, royal diplomats, and fireside evening narration.',
    description:
      'Silky, polished, purringly smooth baritone with refined control and calm authority. Great for court advisors, sophisticated cats, and tranquil evening storytelling.',
    bestFor: 'Smooth evening narration, court advisors, calm elders',
    recommendedRoles: ['court_advisor', 'silky_cat', 'diplomat', 'calm_elder'],
    themes: ['royal', 'bedtime', 'mystery', 'cozy_village', 'fantasy'],
  },
  Despina: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium',
    tone: 'Smooth',
    roughness: 'smooth',
    energy: 'soothing_calm',
    accentAffinity:
      'Poised royal British RP or warm lyrical American; excels at majestic queenly decrees and velvet lullaby narration.',
    description:
      'Graceful, liquid-smooth mezzo voice combining regal poise with tender maternal warmth. The signature choice for queens, graceful swans, and soothing lullabies.',
    bestFor: 'Royal queen, soothing lullaby narration, gentle mothers',
    recommendedRoles: ['queen', 'gentle_mother', 'graceful_swan', 'lullaby_narrator'],
    themes: ['royal', 'bedtime', 'lullaby', 'fantasy', 'magic'],
  },
  Erinome: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium',
    tone: 'Clear',
    roughness: 'crystalline',
    energy: 'steady_measured',
    accentAffinity:
      'Articulate standard American or crisp British RP; tailored for clear educational storytelling, wise scholars, and governess/teacher roles.',
    description:
      'Pristine, poised, highly intelligible voice with balanced warmth and scholarly clarity. Ideal for educational tales, owls/scholars, and articulate storybook reading.',
    bestFor: 'Articulate storybook reading, educational tales, scholars',
    recommendedRoles: ['scholar', 'teacher', 'articulate_narrator', 'librarian'],
    themes: ['cozy_village', 'fantasy', 'mystery', 'adventure'],
  },
  Algenib: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'low',
    tone: 'Gravelly',
    roughness: 'gravelly',
    energy: 'bold_theatrical',
    accentAffinity:
      'Growly rustic West Country/pirate, Scottish dwarf, or rumbling cavernous dragon; thrives on heavy character textures.',
    description:
      'Deep, gravelly, rumbling bass-baritone loaded with lovable monster texture and gruff charm. Built for grumpy-yet-sweet dragons, pirates, dwarves, and stone golems.',
    bestFor: 'Grumpy forest dragons, rough-voiced monsters, pirates, dwarves',
    recommendedRoles: ['dragon', 'sea_captain', 'pirate', 'grumpy_dwarf', 'stone_golem'],
    themes: ['medieval', 'fantasy', 'adventure', 'comedy'],
  },
  Rasalgethi: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'medium',
    tone: 'Informative',
    roughness: 'husky_textured',
    energy: 'steady_measured',
    accentAffinity:
      'Professorial British RP or classical transatlantic; fits eccentric inventors, clockmakers, royal chroniclers, and wise woodland owls.',
    description:
      'Inquisitive, textured, scholarly voice with crisp pacing and lore-master authority. Great for wise owls, royal chroniclers, clockmakers, and world-building narration.',
    bestFor: 'Wise owls, royal chroniclers, clockmakers, lore narration',
    recommendedRoles: ['wise_owl', 'royal_chronicler', 'inventor', 'clockmaker'],
    themes: ['fantasy', 'medieval', 'mystery', 'magic', 'royal'],
  },
  Laomedeia: {
    gender: 'female',
    ageGroup: 'young_adult',
    pitch: 'high',
    tone: 'Upbeat',
    roughness: 'crystalline',
    energy: 'upbeat_playful',
    accentAffinity:
      'Sparkling high-pitched American or airy fairy-tale British; pairs wonderfully with musical-cadence fairy whispers and festive party cheering.',
    description:
      'Effervescent, bell-bright, musical voice that dances through syllables like confetti or pixie dust. The premier choice for fairies, songbirds, and party celebrations.',
    bestFor: 'Fairies, songbirds, party celebrations, cheering friends',
    recommendedRoles: ['fairy', 'songbird', 'magical_sprite', 'cheering_friend'],
    themes: ['magic', 'fantasy', 'party', 'birthday', 'summer'],
  },
  Achernar: {
    gender: 'female',
    ageGroup: 'young_adult',
    pitch: 'medium_high',
    tone: 'Soft',
    roughness: 'breathy',
    energy: 'soothing_calm',
    accentAffinity:
      'Hushed ethereal neutral/transatlantic; responds beautifully to angelic reverb-like serenity, shy little sprout whispers, and dreamy lullaby prompts.',
    description:
      'Feather-soft, serene, whisper-gentle voice with an angelic, starlit delicacy. Perfect for shy sprouts (`olive_sprout`), guardian angels, dreamweavers, and quiet nighttime scenes.',
    bestFor: 'Quiet nighttime scenes, shy olive sprout, angels, lullabies',
    recommendedRoles: ['olive_sprout', 'angel', 'dreamweaver', 'lullaby_narrator'],
    themes: ['bedtime', 'lullaby', 'magic', 'fantasy', 'cozy_village'],
  },
  Alnilam: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium_low',
    tone: 'Firm',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Sturdy standard American or crisp military British RP; suits formal castle guard announcements, steadfast commanders, and ancient oak trees.',
    description:
      'Solid, upright, resonant baritone with disciplined cadence and dependable strength. Ideal for royal castle guards, watch captains, and stoic woodland guardians.',
    bestFor: 'Royal castle guards, steady captains, woodland guardians',
    recommendedRoles: ['royal_guard', 'captain', 'commander', 'steadfast_oak_tree'],
    themes: ['medieval', 'royal', 'adventure', 'fantasy'],
  },
  Schedar: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium',
    tone: 'Even',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Neutral classic audiobook American or BBC documentary style; adaptable as a clean canvas for understated character work.',
    description:
      'Balanced, even-keeled, classic audiobook baritone with natural pacing and zero vocal strain. Best for timeless third-person narration and calm chroniclers.',
    bestFor: 'Balanced classic audiobook narration, calm chroniclers',
    recommendedRoles: ['classic_audiobook_narrator', 'calm_chronicler', 'documentary_guide'],
    themes: ['cozy_village', 'adventure', 'medieval', 'fantasy'],
  },
  Gacrux: {
    gender: 'female',
    ageGroup: 'mature_elder',
    pitch: 'medium_low',
    tone: 'Mature',
    roughness: 'husky_textured',
    energy: 'steady_measured',
    accentAffinity:
      'Rich theatrical British RP, highland elder, or warm grandmotherly American; lends gravitas to ancient sages and matriarchs.',
    description:
      'Deep, resonant, dignified alto with seasoned warmth and calm authority. The definitive voice for `wise_elder` sages, grandmotherly storytellers, and ancient queens.',
    bestFor: 'Wise elder sage, grandmotherly storyteller, ancient matriarch',
    recommendedRoles: ['wise_elder', 'grandmotherly_storyteller', 'wise_queen', 'ancient_matriarch'],
    themes: ['fantasy', 'magic', 'royal', 'medieval', 'bedtime'],
  },
  Pulcherrima: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium_high',
    tone: 'Forward',
    roughness: 'warm_clear',
    energy: 'bold_theatrical',
    accentAffinity:
      'Flamboyant theatrical transatlantic, mischievous cackling storybook witch, or grand carnival announcer.',
    description:
      'Projecting, stage-forward, delightfully dramatic voice with sharp comedic timing and flair. Tailor-made for mischievous storybook witches, stage performers, and bold dames.',
    bestFor: 'Storybook witches, theatrical stage announcements, bold characters',
    recommendedRoles: ['witch', 'stage_performer', 'theatrical_announcer', 'bold_adventurer'],
    themes: ['magic', 'fantasy', 'comedy', 'mystery', 'party'],
  },
  Achird: {
    gender: 'male',
    ageGroup: 'young_adult',
    pitch: 'medium',
    tone: 'Friendly',
    roughness: 'warm_clear',
    energy: 'breezy_natural',
    accentAffinity:
      'Warm neighborly American or cheerful rustic British villager; feels like an instant best friend in conversational scenes.',
    description:
      'Open, approachable, sunny-natured tenor-baritone with effortless warmth. Ideal for helpful villagers, friendly merchants, warm innkeepers, and loyal best friends.',
    bestFor: 'Warm neighborly dialogue, helpful villagers, best friends',
    recommendedRoles: ['helpful_villager', 'merchant', 'innkeeper', 'best_friend'],
    themes: ['cozy_village', 'adventure', 'summer', 'comedy'],
  },
  Zubenelgenubi: {
    gender: 'male',
    ageGroup: 'young_adult',
    pitch: 'medium_low',
    tone: 'Casual',
    roughness: 'husky_textured',
    energy: 'breezy_natural',
    accentAffinity:
      'Laid-back surfer/coastal American; excels at sunny beach-buddy drawls (`watermelon_slice`) and modern conversational sidekicks.',
    description:
      'Relaxed, easy-breezy, conversational voice with a sunny, laid-back groove. The go-to choice for `watermelon_slice`, beach buddies, and chill modern characters.',
    bestFor: 'Watermelon slice, laid-back beach buddies, conversational turns',
    recommendedRoles: ['watermelon_slice', 'beach_buddy', 'conversational_teen', 'chill_sidekick'],
    themes: ['beach', 'summer', 'party', 'comedy'],
  },
  Vindemiatrix: {
    gender: 'female',
    ageGroup: 'mature_elder',
    pitch: 'medium_low',
    tone: 'Gentle',
    roughness: 'smooth',
    energy: 'soothing_calm',
    accentAffinity:
      'Soft, comforting maternal American or gentle cottagecore British; crafted for slow, dreamy bedtime cadences and tender goodnights.',
    description:
      'Velvety, tender, deeply comforting voice with a slow, cradling rhythm. The signature choice for `bedtime` lullaby narration, `elder_woman` grandmothers, and gentle healers.',
    bestFor: 'Tender bedtime goodnights, grandmother, comforting narration',
    recommendedRoles: ['bedtime', 'elder_woman', 'grandmother', 'healer', 'nature_spirit'],
    themes: ['bedtime', 'lullaby', 'cozy_village', 'fantasy'],
  },
  Sadachbia: {
    gender: 'male',
    ageGroup: 'adult',
    pitch: 'medium_high',
    tone: 'Lively',
    roughness: 'warm_clear',
    energy: 'bold_theatrical',
    accentAffinity:
      'Booming Broadway/vaudeville American or grand Arabian-nights storyteller; thrives on exuberant, larger-than-life comedic flair.',
    description:
      'Exuberant, booming, high-spirited showman voice bursting with charisma and festive energy. Built for magical genies, carnival ringmasters, and celebratory hosts.',
    bestFor: 'Magical genie, animated adventure scenes, carnival ringmaster',
    recommendedRoles: ['genie', 'carnival_ringmaster', 'celebratory_host', 'adventurous_companion'],
    themes: ['magic', 'fantasy', 'party', 'birthday', 'comedy', 'adventure'],
  },
  Sadaltager: {
    gender: 'male',
    ageGroup: 'mature_elder',
    pitch: 'medium_low',
    tone: 'Knowledgeable',
    roughness: 'warm_clear',
    energy: 'steady_measured',
    accentAffinity:
      'Regal British RP or noble classical baritone; commands respect for royal decrees (`king`), grand librarians, and timeless Aesop-style fables.',
    description:
      'Noble, authoritative, warmly resonant baritone blending royal dignity with sage wisdom. The premier voice for benevolent kings, wizardly mentors, and classic fables.',
    bestFor: 'Royal king, wizardly mentors, grand librarian, classic fables',
    recommendedRoles: ['king', 'wizardly_mentor', 'grand_librarian', 'master_sage'],
    themes: ['royal', 'medieval', 'fantasy', 'magic', 'adventure'],
  },
  Sulafat: {
    gender: 'female',
    ageGroup: 'adult',
    pitch: 'medium',
    tone: 'Warm',
    roughness: 'warm_clear',
    energy: 'soothing_calm',
    accentAffinity:
      'Warm, expressive storybook American or gentle transatlantic; adapts seamlessly to fireside intimacy, magical wonder, and heartfelt endings.',
    description:
      "Rich, golden, embracing mezzo-soprano that feels like a cozy fireside blanket. Picture Book Studio's default `narrator` voice—ideal for heartfelt storytelling and comforting guides.",
    bestFor: 'Cozy fireside picture-book narrator, caring parent, heartfelt endings',
    recommendedRoles: ['narrator', 'caring_parent', 'comforting_guide', 'fireside_storyteller'],
    themes: ['bedtime', 'lullaby', 'cozy_village', 'fantasy', 'magic', 'birthday'],
  },
};

export const VOICE_CATALOG = Object.entries(GEMINI_PREBUILT_VOICES).map(([voiceName, meta]) => ({
  voiceName,
  ...meta,
}));

/**
 * Curated mapping of all 40 Picture-Book Studio `CharacterKind` rigs and story archetypes
 * to Google AI Studio Gemini TTS prebuilt voices, vocal classification, and default `speech_metadata.style` directions.
 */
const RAW_CHARACTER_VOICE_PRESETS = {
  narrator: {
    voice: 'Sulafat',
    style:
      "Warm, gentle, expressive children's picture-book narrator with unhurried storybook pacing and wonder",
    description:
      'Default master narrator for all picture-book scenes; balances cozy fireside warmth with magical wonder.',
    themes: ['bedtime', 'lullaby', 'cozy_village', 'fantasy', 'magic', 'birthday'],
  },
  storyteller: {
    voice: 'Aoede',
    style: 'Breezy, lyrical, enchanting picture-book storyteller reading aloud to children',
    description:
      'Daytime and fairy-tale narrator with a musical, breezy cadence for upbeat or whimsical adventures.',
    themes: ['fantasy', 'cozy_village', 'summer', 'magic', 'adventure'],
  },
  bedtime: {
    voice: 'Vindemiatrix',
    style: 'Soft, soothing, unhurried bedtime lullaby narrator, calm and dreamy',
    description:
      'Extra-gentle, slow-paced lullaby narrator for nighttime scenes and closing book-frame sequences.',
    themes: ['bedtime', 'lullaby', 'cozy_village'],
  },
  little_girl: {
    voice: 'Leda',
    style: 'Bright, curious, sweet young girl voice, cheerful and full of childhood wonder',
    description:
      'Matches the `little_girl` crayon cutout rig (`shortSample1`, `cornerStoreDay`); use for curious questions, counting stars, and joyful exclamations.',
    themes: ['cozy_village', 'bedtime', 'birthday', 'party', 'summer'],
  },
  shopkeeper: {
    voice: 'Orus',
    style:
      'Warm, welcoming, kindly neighborhood corner-store shopkeeper with a friendly smile in his voice',
    description:
      'Matches the `shopkeeper` rig at `"LUNE STORE"` (`cornerStoreDay`); ideal for friendly greetings and handing over hot pizza.',
    themes: ['cozy_village', 'comedy', 'bedtime'],
  },
  moon: {
    voice: 'Enceladus',
    style: 'Soft, sleepy bedtime whisper-croon, calm, dreamy, and comforting like starlight',
    description:
      'Matches the `moon` rig (`shortSample1`, `moonlightStory`, `strawberryBeachBirthday`); use with `<yawn>` and `<sigh>` tags for sleepy goodnights.',
    themes: ['bedtime', 'lullaby', 'magic', 'cozy_village'],
  },
  sun: {
    voice: 'Aoede',
    style: 'Warm, golden, cheerful morning voice radiating gentle encouragement and sunshine',
    description:
      'Matches the `sun` rig (`shortSample1`, `strawberryBeachBirthday`); ideal for morning wake-up greetings and sunny encouragement.',
    themes: ['summer', 'beach', 'cozy_village', 'party'],
  },
  cat: {
    voice: 'Zephyr',
    style: 'Light, playful, soft kitten-like voice with tiny curious inflections',
    description:
      'Matches the `cat` tabby kitten rig (`cornerStoreDay`, `moonlitGarden`); great for soft meows and curious commentary.',
    themes: ['cozy_village', 'bedtime', 'comedy', 'adventure'],
  },
  singing_radish: {
    voice: 'Puck',
    style: 'Upbeat, musical, theatrical and bouncy voice, joyful and ready to burst into song',
    description:
      'Matches the `singing_radish` rig (`meadowParty`, `strawberryBeachBirthday`); ideal for leading party songs and enthusiastic cheers.',
    themes: ['birthday', 'party', 'beach', 'summer', 'comedy'],
  },
  birthday_strawberry: {
    voice: 'Leda',
    style:
      'Sweet, high-spirited, endearing little berry voice, fluttery when shy and giggly when happy',
    description:
      'Matches the `birthday_strawberry` rig (`meadowParty`, `strawberryBeachBirthday`); pair with `<gasp>` when scared of waves and `<laugh>` when splashing in a floatie.',
    themes: ['birthday', 'party', 'beach', 'summer', 'comedy'],
  },
  watermelon_slice: {
    voice: 'Zubenelgenubi',
    style: 'Relaxed, sunny, friendly and mellow summer beach buddy voice',
    description:
      'Matches the `watermelon_slice` rig (`meadowParty`, `strawberryBeachBirthday`); great for reassuring beach banter and chill party vibes.',
    themes: ['beach', 'summer', 'birthday', 'party', 'comedy'],
  },
  blue_party_cat: {
    voice: 'Zephyr',
    style: 'Playful, upbeat, rhythmic party cat voice with festive enthusiasm',
    description:
      'Matches the `blue_party_cat` rig (`meadowParty`, `strawberryBeachBirthday`); use for party countdowns and cheering.',
    themes: ['birthday', 'party', 'beach', 'summer', 'comedy'],
  },
  hello_bug: {
    voice: 'Leda',
    style: 'Tiny, polite, chipper and friendly little meadow bug voice',
    description:
      'Matches the `hello_bug` rig; suited for cute miniature greetings and garden observations.',
    themes: ['cozy_village', 'birthday', 'party', 'summer'],
  },
  party_banana: {
    voice: 'Puck',
    style: 'Bouncy, comedic, goofy and expressive cartoon party voice',
    description:
      'Matches the `party_banana` rig; ideal for silly jokes, beach-ball tosses, and party horn fanfare.',
    themes: ['birthday', 'party', 'beach', 'summer', 'comedy'],
  },
  crying_onion: {
    voice: 'Charon',
    style:
      'Comically sniffly and melodramatic when worried, turning into relieved happy cheering',
    description:
      'Matches the `crying_onion` rig; pair with `<sigh>` when worried in idle state and `<laugh>` when cheering in waving/singing states.',
    themes: ['comedy', 'birthday', 'party', 'beach'],
  },
  cherry_twins: {
    voice: 'Kore',
    style: 'Bubbly, rhythmic, sing-song twin voice brimming with cheerful energy',
    description:
      'Matches the `cherry_twins` rig; great for rhyming couplets and synchronized party cheers.',
    themes: ['birthday', 'party', 'summer', 'comedy'],
  },
  acorn_twins: {
    voice: 'Puck',
    style: 'Crisp, woodland-sprite voice with playful staccato energy',
    description:
      'Matches the `acorn_twins` rig; ideal for woodland chatter, forest games, and autumn/camping scenes.',
    themes: ['cozy_village', 'fantasy', 'adventure', 'comedy'],
  },
  olive_sprout: {
    voice: 'Achernar',
    style: 'Gentle, soft-spoken, innocent tiny sprout voice',
    description:
      'Matches the `olive_sprout` rig; ideal for shy, sweet lines and quiet encouragement.',
    themes: ['cozy_village', 'bedtime', 'party', 'summer'],
  },
  knight: {
    voice: 'Fenrir',
    style: 'Heroic, warm, chivalrous storybook knight—bold in proclamation yet kind-hearted',
    description:
      'Matches Sir Leo the `knight` rig (`knightDragonQuest`); use for quest proclamations, comforting scared soldiers, and helping the dragon.',
    themes: ['medieval', 'fantasy', 'adventure', 'royal', 'comedy'],
  },
  soldier: {
    voice: 'Orus',
    style: 'Sturdy, loyal, earnest royal guardsman, slightly nervous around spooky woods',
    description:
      'Matches the `soldier` rig (`knightDragonQuest`); ideal for campfire ghost stories (`<gasp>`) and loyal marching dialogue.',
    themes: ['medieval', 'fantasy', 'adventure', 'royal'],
  },
  dragon: {
    voice: 'Algenib',
    style:
      'Deep, gravelly, rumbling yet lovable storybook dragon—grumpy when his tooth hurts, sweet and grateful once helped',
    description:
      'Matches Barnaby the `dragon` rig (`knightDragonQuest`); use gravelly groans before the bramble is popped from his tooth, then joyful `<laugh>` relief.',
    themes: ['medieval', 'fantasy', 'adventure', 'comedy'],
  },
  villager: {
    voice: 'Puck',
    style: 'Lively, theatrical medieval town herald and expressive village storyteller',
    description:
      'Matches the `villager` castle herald rig (`knightDragonQuest`); ideal for "Hear ye! Hear ye!" royal scroll announcements and victory parades.',
    themes: ['medieval', 'royal', 'cozy_village', 'fantasy'],
  },
  boy: {
    voice: 'Puck',
    style: 'Youthful, curious, energetic young boy voice in an animated storybook',
    description: 'General young boy protagonist or sidekick archetype.',
    themes: ['adventure', 'cozy_village', 'birthday', 'party', 'comedy'],
  },
  girl: {
    voice: 'Leda',
    style: 'Bright, youthful, enthusiastic young girl voice full of wonder',
    description: 'General young girl protagonist or companion archetype.',
    themes: ['adventure', 'cozy_village', 'birthday', 'party', 'magic'],
  },
  man: {
    voice: 'Orus',
    style: 'Warm, steady, friendly adult man voice',
    description: 'General adult male character (father, neighbor, artisan).',
    themes: ['cozy_village', 'adventure', 'royal'],
  },
  woman: {
    voice: 'Aoede',
    style: 'Warm, articulate, expressive adult woman voice',
    description: 'General adult female character (mother, teacher, neighbor).',
    themes: ['cozy_village', 'bedtime', 'fantasy', 'summer'],
  },
  elder_man: {
    voice: 'Charon',
    style: 'Kind, weathered, grandfatherly elder voice with unhurried warmth',
    description: 'Grandfather, old village storyteller, or retired craftsman.',
    themes: ['cozy_village', 'bedtime', 'fantasy', 'medieval'],
  },
  elder_woman: {
    voice: 'Vindemiatrix',
    style: 'Gentle, calm, grandmotherly elder woman voice with soothing cadence',
    description: 'Grandmother, village healer, or kind bakery matron.',
    themes: ['cozy_village', 'bedtime', 'lullaby', 'fantasy'],
  },
  wise_elder: {
    voice: 'Gacrux',
    style: 'Deep, wise, resonant sage voice speaking with calm authority and warmth',
    description: 'Ancient sage, oracle, or council elder guiding heroes on a quest.',
    themes: ['fantasy', 'magic', 'medieval', 'royal', 'mystery'],
  },
  king: {
    voice: 'Sadaltager',
    style: 'Noble, regal, authoritative yet warm royal king voice',
    description: 'Benevolent monarch issuing royal quests or welcoming heroes home.',
    themes: ['royal', 'medieval', 'fantasy', 'adventure'],
  },
  queen: {
    voice: 'Despina',
    style: 'Regal, poised, warm and majestic royal queen voice',
    description: 'Graceful queen presiding over castle celebrations or fairy-tale courts.',
    themes: ['royal', 'medieval', 'fantasy', 'magic'],
  },
  prince: {
    voice: 'Zephyr',
    style: 'Bright, earnest, spirited young prince voice',
    description: 'Young storybook prince on a whimsical fairy-tale adventure.',
    themes: ['royal', 'fantasy', 'adventure', 'magic'],
  },
  princess: {
    voice: 'Zephyr',
    style: 'Bright, clear, warm and spirited princess voice',
    description: 'Adventurous, kind-hearted princess in castle or starlight stories.',
    themes: ['royal', 'fantasy', 'magic', 'adventure', 'party'],
  },
  wizard: {
    voice: 'Iapetus',
    style: 'Mysterious, theatrical, wise old wizard voice with magical resonance',
    description: 'Tower astronomer, friendly alchemist, or spellcasting mentor.',
    themes: ['magic', 'fantasy', 'medieval', 'mystery'],
  },
  witch: {
    voice: 'Pulcherrima',
    style: 'Dramatic, intriguing, mischievous storybook witch voice',
    description: 'Playful potion-brewing woodland witch (pair with `<laugh>` for a friendly cackle).',
    themes: ['magic', 'fantasy', 'comedy', 'mystery'],
  },
  fairy: {
    voice: 'Laomedeia',
    style: 'Light, sparkling, whimsical fairy voice with musical cadence',
    description: 'Wishing-star fairy, garden sprite, or magical guide.',
    themes: ['magic', 'fantasy', 'bedtime', 'party'],
  },
  angel: {
    voice: 'Achernar',
    style: 'Soft, serene, ethereal angelic voice with gentle reverb-like calm',
    description: 'Starlight guardian angel or dream spirit in bedtime stories.',
    themes: ['bedtime', 'lullaby', 'magic', 'fantasy'],
  },
  genie: {
    voice: 'Sadachbia',
    style: 'Lively, booming, exuberant magical genie voice with playful charm',
    description: 'Larger-than-life wish-granting genie or magical ringmaster.',
    themes: ['magic', 'fantasy', 'comedy', 'adventure', 'party'],
  },
  villain: {
    voice: 'Enceladus',
    style: 'Low, dramatic, scheming storybook villain voice, theatrical but family-friendly',
    description: 'Comedic or theatrical fairy-tale antagonist (never overly scary for children).',
    themes: ['fantasy', 'mystery', 'adventure', 'comedy'],
  },
  shadow_figure: {
    voice: 'Umbriel',
    style: 'Hushed, enigmatic, shadowy whispery voice with quiet suspense',
    description: 'Mysterious silhouette in the Whispering Woods or secret garden.',
    themes: ['mystery', 'fantasy', 'bedtime', 'magic'],
  },
};

export const CHARACTER_VOICE_PRESETS = Object.fromEntries(
  Object.entries(RAW_CHARACTER_VOICE_PRESETS).map(([character, preset]) => {
    const baseVoice = GEMINI_PREBUILT_VOICES[preset.voice] || GEMINI_PREBUILT_VOICES.Sulafat;
    return [
      character,
      {
        character,
        voice: preset.voice,
        gender: baseVoice.gender,
        ageGroup: baseVoice.ageGroup,
        pitch: baseVoice.pitch,
        roughness: baseVoice.roughness,
        accentAffinity: baseVoice.accentAffinity,
        style: preset.style,
        description: preset.description,
        themes: preset.themes,
      },
    ];
  })
);

export const CHARACTER_VOICE_PRESET_CATALOG = Object.values(CHARACTER_VOICE_PRESETS);

/**
 * Filters `VOICE_CATALOG` and `CHARACTER_VOICE_PRESET_CATALOG` by any combination of
 * `gender`, `age`, `pitch`, `roughness`, `energy`, `accent`, `theme`, `character`, or `search`.
 */
export function filterVoiceCatalog(opts = {}) {
  const genderFilter = opts.gender ? String(opts.gender).trim().toLowerCase() : '';
  const ageFilter = opts.age ? String(opts.age).trim().toLowerCase() : '';
  const pitchFilter = opts.pitch ? String(opts.pitch).trim().toLowerCase() : '';
  const roughnessFilter = opts.roughness ? String(opts.roughness).trim().toLowerCase() : '';
  const energyFilter = opts.energy ? String(opts.energy).trim().toLowerCase() : '';
  const accentFilter = opts.accent ? String(opts.accent).trim().toLowerCase() : '';
  const themeFilter = opts.theme ? String(opts.theme).trim().toLowerCase() : '';
  const charFilter = opts.character ? String(opts.character).trim().toLowerCase() : '';
  const searchFilter = opts.search ? String(opts.search).trim().toLowerCase() : '';

  const voices = VOICE_CATALOG.filter((v) => {
    if (genderFilter && v.gender.toLowerCase() !== genderFilter) return false;
    if (ageFilter && !v.ageGroup.toLowerCase().includes(ageFilter)) return false;
    if (pitchFilter && !v.pitch.toLowerCase().includes(pitchFilter)) return false;
    if (roughnessFilter && !v.roughness.toLowerCase().includes(roughnessFilter)) return false;
    if (energyFilter && !v.energy.toLowerCase().includes(energyFilter)) return false;
    if (accentFilter && !v.accentAffinity.toLowerCase().includes(accentFilter)) return false;
    if (
      themeFilter &&
      !v.themes.some((t) => t.toLowerCase().includes(themeFilter))
    ) {
      return false;
    }
    if (
      charFilter &&
      !v.recommendedRoles.some((r) => r.toLowerCase().includes(charFilter)) &&
      CHARACTER_VOICE_PRESETS[charFilter]?.voice !== v.voiceName
    ) {
      return false;
    }
    if (searchFilter) {
      const haystack = [
        v.voiceName,
        v.gender,
        v.ageGroup,
        v.pitch,
        v.tone,
        v.roughness,
        v.energy,
        v.accentAffinity,
        v.description,
        v.bestFor,
        v.recommendedRoles.join(' '),
        v.themes.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchFilter)) return false;
    }
    return true;
  });

  const characterPresets = CHARACTER_VOICE_PRESET_CATALOG.filter((p) => {
    if (genderFilter && p.gender.toLowerCase() !== genderFilter) return false;
    if (ageFilter && !p.ageGroup.toLowerCase().includes(ageFilter)) return false;
    if (pitchFilter && !p.pitch.toLowerCase().includes(pitchFilter)) return false;
    if (roughnessFilter && !p.roughness.toLowerCase().includes(roughnessFilter)) return false;
    if (accentFilter && !p.accentAffinity.toLowerCase().includes(accentFilter)) return false;
    if (
      themeFilter &&
      !p.themes.some((t) => t.toLowerCase().includes(themeFilter))
    ) {
      return false;
    }
    if (charFilter && !p.character.toLowerCase().includes(charFilter)) return false;
    if (searchFilter) {
      const haystack = [
        p.character,
        p.voice,
        p.gender,
        p.ageGroup,
        p.roughness,
        p.accentAffinity,
        p.style,
        p.description,
        p.themes.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchFilter)) return false;
    }
    return true;
  });

  return { voices, characterPresets };
}

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
    else if (a === '--gender' || a === '-g') opts.gender = argv[++i];
    else if (a === '--age' || a === '--age-group') opts.age = argv[++i];
    else if (a === '--roughness' || a === '--texture') opts.roughness = argv[++i];
    else if (a === '--energy') opts.energy = argv[++i];
    else if (a === '--accent') opts.accent = argv[++i];
    else if (a === '--theme' || a === '-t') opts.theme = argv[++i];
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

    const { voices: filteredCatalog, characterPresets: filteredPresetList } = filterVoiceCatalog({
      gender: opts.gender,
      age: opts.age,
      pitch: opts.pitch,
      roughness: opts.roughness,
      energy: opts.energy,
      accent: opts.accent,
      theme: opts.theme,
      search: opts.search,
    });
    const prebuiltEntries = filteredCatalog.map((v) => [v.voiceName, v]);
    const filteredCharacterPresets = Object.fromEntries(
      filteredPresetList.map((p) => [p.character, p])
    );

    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            defaultModel: DEFAULT_GEMINI_TTS_MODEL,
            prebuiltVoices: Object.fromEntries(prebuiltEntries),
            voiceCatalog: filteredCatalog,
            characterPresets: filteredCharacterPresets,
            customVoices,
          },
          null,
          2
        )
      );
      return 0;
    }

    console.log(
      `=== Google AI Studio Gemini TTS — Voice Catalog (${prebuiltEntries.length} matching voices) ===`
    );
    console.log(
      '  Voice           | Gender | Age Group    | Pitch       | Tone         | Roughness       | Energy            | Best For & Themes'
    );
    console.log('  ' + '-'.repeat(130));
    for (const [name, meta] of prebuiltEntries) {
      console.log(
        `  ${name.padEnd(15)} | ${meta.gender.padEnd(6)} | ${meta.ageGroup.padEnd(12)} | ${meta.pitch.padEnd(11)} | ${meta.tone.padEnd(12)} | ${meta.roughness.padEnd(15)} | ${meta.energy.padEnd(17)} | ${meta.bestFor} [Themes: ${(meta.themes || []).join(', ')}]`
      );
    }
    console.log(
      `\n=== Picture-Book Studio Character Voice Presets (${Object.keys(filteredCharacterPresets).length} matching --character <kind>) ===`
    );
    for (const [charKind, preset] of Object.entries(filteredCharacterPresets)) {
      console.log(
        `  ${charKind.padEnd(20)} -> ${preset.voice.padEnd(13)} | ${preset.gender}/${preset.ageGroup}/${preset.roughness} | ${preset.style}`
      );
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

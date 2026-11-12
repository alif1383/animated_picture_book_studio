# Picture-Book Audio Assets

Place narration, music, and sound effect files here.

Files in this directory are served at `/audio/<filename>` by the Vite dev server
and included in the production build.

## Supported Formats

- **MP3** (`.mp3`) — Recommended. Best compatibility across all browsers.
- **OGG Vorbis** (`.ogg`) — Good open-source alternative.
- **WAV** (`.wav`) — Uncompressed; large file sizes.
- **WebM Audio** (`.webm`) — Chromium-only, good for Opus audio.

## Usage in SceneDefinition

Reference files via the `audioClips` field on your `SceneDefinition`:

```typescript
import type { AudioClipCue } from '../engine/schema';

const myAudioClips: AudioClipCue[] = [
  {
    id: 'act1-narration',
    src: '/audio/narration-act1.mp3',
    startTime: 0,       // scene seconds when clip starts
    duration: 8.5,      // optional: max seconds to play
    volume: 1.0,        // optional: gain multiplier (0.0–2.0)
    label: 'Act 1 narration',
  },
  {
    id: 'birthday-music',
    src: '/audio/happy-birthday.mp3',
    startTime: 10.0,
    offsetSec: 2.0,     // optional: start 2s into the audio file
    volume: 0.8,
    label: 'Birthday song background music',
  },
];
```

Add this to your `SceneDefinition`:

```typescript
export const MY_SCENE: SceneDefinition = {
  // ...
  audioClips: myAudioClips,
};
```

## Generating Narration with edge-tts

```bash
edge-tts --voice "en-US-AvaNeural" --text "Once upon a time..." --write-media public/audio/narration-act1.mp3
```

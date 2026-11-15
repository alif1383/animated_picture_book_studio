import type { ProceduralSfxModule } from './types';

export const CHEER_APPLAUSE_SFX: ProceduralSfxModule = {
  kind: 'cheer_applause',
  title: 'Joyful Crowd Cheer & Hand-Claps',
  category: 'party',
  description:
    'Five rhythmic paper hand-claps layered with a warm celebratory major triad chord ("Hooray!") for victories, parties, and happy endings.',
  themes: ['celebration', 'victory', 'party', 'birthday', 'happy_ending', 'friendship'],
  defaultFreqHz: 523.25,
  defaultDurationSec: 0.75,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const clapCount = 5;
    for (let i = 0; i < clapCount; i++) {
      const clapFreq = 850 + (i % 3) * 220;
      const clapOffset = now + i * 0.045;
      helpers.scheduleCrayonScribble(
        ctx,
        clapFreq,
        Math.min(0.09, duration * 0.25),
        clapOffset
      );
    }
    const root = Math.max(261.63, freq);
    helpers.synthesizeMusicBoxNote(ctx, root, duration, 'triangle', 2, 0.16, now);
    helpers.synthesizeMusicBoxNote(
      ctx,
      root * 1.25,
      duration,
      'triangle',
      2,
      0.14,
      now
    );
    helpers.synthesizeMusicBoxNote(
      ctx,
      root * 1.5,
      duration,
      'sine',
      2,
      0.14,
      now
    );
  },
};

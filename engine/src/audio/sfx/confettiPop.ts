import type { ProceduralSfxModule } from './types';

export const CONFETTI_POP_SFX: ProceduralSfxModule = {
  kind: 'confetti_pop',
  title: 'Confetti Popper & Sparkle Chime',
  category: 'party',
  description:
    'Crisp paper confetti popper ("POP!") combining a rapid pitch-drop triangle thump, a paper burst, and twin high sparkle chimes (C6 + E6).',
  themes: ['birthday', 'party', 'celebration', 'surprise', 'magic_pop'],
  defaultFreqHz: 520,
  defaultDurationSec: 0.45,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const popDur = Math.min(0.11, duration * 0.45);

    helpers.schedulePitchBlip(
      ctx,
      'triangle',
      Math.max(240, freq),
      68,
      popDur,
      0.28,
      now
    );

    helpers.scheduleCrayonScribble(ctx, 1350, popDur, now);
    helpers.synthesizeMusicBoxNote(
      ctx,
      1046.5,
      duration * 0.7,
      'sine',
      2,
      0.14,
      now
    );
    helpers.synthesizeMusicBoxNote(
      ctx,
      1318.5,
      duration * 0.85,
      'sine',
      2,
      0.12,
      now
    );
  },
};

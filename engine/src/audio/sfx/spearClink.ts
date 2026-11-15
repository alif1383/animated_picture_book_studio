import type { ProceduralSfxModule } from './types';

export const SPEAR_CLINK_SFX: ProceduralSfxModule = {
  kind: 'spear_clink',
  title: 'Spear Metallic Clink & Bramble Cork-Pop',
  category: 'fantasy',
  description:
    'Crisp twin metallic spear-tip clink harmonics followed by an upward sine cork-pop when the thorny bramble pops free.',
  themes: ['medieval', 'knight', 'dragon', 'quest', 'tooth_fix', 'action_pop'],
  defaultFreqHz: 660,
  defaultDurationSec: 0.38,
  synthesize(ctx, freq, duration, startTime, helpers) {
    const now = startTime;
    const dur = Math.max(0.18, duration);
    const base = Math.max(520, freq);
    helpers.synthesizeMusicBoxNote(
      ctx,
      base * 1.5,
      dur * 0.55,
      'sine',
      2.76,
      0.22,
      now
    );
    helpers.synthesizeMusicBoxNote(
      ctx,
      base * 2.1,
      dur * 0.4,
      'triangle',
      2,
      0.16,
      now + 0.02
    );
    helpers.schedulePitchBlip(
      ctx,
      'sine',
      260,
      780,
      Math.min(0.12, dur * 0.45),
      0.24,
      now + dur * 0.35
    );
  },
};

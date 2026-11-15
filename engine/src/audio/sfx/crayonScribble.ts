import type { ProceduralSfxModule } from './types';

export const CRAYON_SCRIBBLE_SFX: ProceduralSfxModule = {
  kind: 'crayon_scribble',
  title: 'Wax Crayon on Paper Scribble Foley',
  category: 'foley',
  description:
    'Textured bandpass-filtered noise modulated at 18 Hz to emulate wax crayon coloring on cold-press watercolor paper or soft page rustling.',
  themes: ['storybook_opening', 'drawing', 'coloring', 'page_turn', 'footsteps', 'paper_craft'],
  defaultFreqHz: 920,
  defaultDurationSec: 0.25,
  synthesize(ctx, freq, duration, startTime, helpers) {
    helpers.scheduleCrayonScribble(ctx, freq, duration, startTime);
  },
};

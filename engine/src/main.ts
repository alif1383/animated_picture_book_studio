import { mountStorybookStudio } from './ui/app';
import { SHORT_SAMPLE_1_SCENE } from './scenes/shortSample1';
import { MOONLIGHT_STORY_SCENE } from './scenes/moonlightStory';

if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  if (root) {
    mountStorybookStudio(root, SHORT_SAMPLE_1_SCENE);
  }
}

export {
  mountStorybookStudio,
  SHORT_SAMPLE_1_SCENE,
  MOONLIGHT_STORY_SCENE,
};

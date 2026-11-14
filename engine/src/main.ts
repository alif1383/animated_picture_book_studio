import { mountStorybookStudio } from './ui/app';
import { SHORT_SAMPLE_1_SCENE } from './scenes/shortSample1';
import { MOONLIGHT_STORY_SCENE } from './scenes/moonlightStory';
import { CORNER_STORE_DAY_SCENE } from './scenes/cornerStoreDay';
import { STRAWBERRY_BEACH_BIRTHDAY_SCENE } from './scenes/strawberryBeachBirthday';

if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  if (root) {
    mountStorybookStudio(root, CORNER_STORE_DAY_SCENE);
  }
}

export {
  mountStorybookStudio,
  SHORT_SAMPLE_1_SCENE,
  MOONLIGHT_STORY_SCENE,
  CORNER_STORE_DAY_SCENE,
  STRAWBERRY_BEACH_BIRTHDAY_SCENE,
};

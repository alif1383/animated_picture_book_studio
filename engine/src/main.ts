import { mountStorybookStudio } from './ui/app';
import { SHORT_SAMPLE_1_SCENE } from './scenes/shortSample1';
import { MOONLIGHT_STORY_SCENE } from './scenes/moonlightStory';
import { CORNER_STORE_DAY_SCENE } from './scenes/cornerStoreDay';
import { STRAWBERRY_BEACH_BIRTHDAY_SCENE } from './scenes/strawberryBeachBirthday';
import { STARTER_MOONLIT_CAT_SCENE } from './scenes/starterMoonlitCat';

if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  if (root) {
    mountStorybookStudio(root, STARTER_MOONLIT_CAT_SCENE);
  }
}

export {
  mountStorybookStudio,
  SHORT_SAMPLE_1_SCENE,
  MOONLIGHT_STORY_SCENE,
  CORNER_STORE_DAY_SCENE,
  STRAWBERRY_BEACH_BIRTHDAY_SCENE,
  STARTER_MOONLIT_CAT_SCENE,
};

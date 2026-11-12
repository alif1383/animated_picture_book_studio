import { describe, it, expect } from 'vitest';
import { MOONLIGHT_STORY_SCENE } from '../src/scenes/moonlightStory';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { PictureBookSoundEngine } from '../src/audio/soundEngine';
import {
  ASSET_CATALOG_ITEMS,
  renderAssetPreviewSvg,
} from '../src/ui/app';

describe('Phase 4: 28-Second Sample Story Scene, Audio Engine & Asset Catalog', () => {
  it('evaluates and renders all 5 acts and all 4 reference photo moments accurately', () => {
    expect(MOONLIGHT_STORY_SCENE.durationSec).toBe(28);
    expect(MOONLIGHT_STORY_SCENE.acts).toHaveLength(5);

    // Photo 3 Match (t = 2.2s): Raw paper village, progressive crayon coloring in progress
    const act1 = evaluateAndRenderScene(MOONLIGHT_STORY_SCENE, 2.2);
    expect(act1.frame.activeAct?.id).toBe('act-1-crayon-village');
    expect(act1.frame.nodes['sky-patch'].visible).toBe(false);
    expect(act1.frame.nodes['ochre-cottage'].fillProgress).toBeGreaterThan(0);
    expect(act1.frame.nodes['ochre-cottage'].fillProgress).toBeLessThan(1);
    expect(act1.frame.nodes['corner-store'].fillProgress).toBeLessThan(1);
    expect(act1.svg).toContain('LUNE STORE');

    // Photo 4 Match (t = 8.5s): Camera zoomed in on cottage ladder, little girl climbing
    const act2 = evaluateAndRenderScene(MOONLIGHT_STORY_SCENE, 8.5);
    expect(act2.frame.activeAct?.id).toBe('act-2-ladder-climb');
    expect(act2.frame.camera.zoom).toBeGreaterThan(1.5);
    expect(act2.frame.nodes['little-girl'].state).toBe('climbing');
    expect(act2.frame.nodes['ochre-cottage'].windowLit).toBe(true);

    // Photo 2 Match (t = 16.5s): Singing on rooftop, stop-motion partial-bleed indigo sky wash, 1 2 3 4 5 numbers
    const act3 = evaluateAndRenderScene(MOONLIGHT_STORY_SCENE, 16.5);
    expect(act3.frame.activeAct?.id).toBe('act-3-rooftop-lullaby');
    expect(act3.frame.nodes['little-girl'].state).toBe('singing');
    expect(act3.frame.nodes['music-notes'].visible).toBe(true);
    expect(act3.frame.nodes['sky-patch'].visible).toBe(true);
    expect(act3.frame.nodes['sky-patch'].fillProgress).toBeGreaterThan(0.5);
    expect(act3.frame.nodes['moon'].state).toBe('grumpy');
    expect(act3.svg).toContain('id="fill-mask-sky-patch"');

    // Photo 1 Match (t = 21.5s): Zoomed in on sleeping Moon wearing blue-and-white Nightcap
    const act4 = evaluateAndRenderScene(MOONLIGHT_STORY_SCENE, 21.5);
    expect(act4.frame.activeAct?.id).toBe('act-4-moon-nightcap');
    expect(act4.frame.nodes['moon'].state).toBe('sleeping');
    expect(act4.frame.nodes['moon'].wearingNightcap).toBe(true);
    expect(act4.svg).toContain('data-part="moon-nightcap"');

    // Act 5 Finale (t = 26.0s): Full village tableau with Goodnight caption
    const act5 = evaluateAndRenderScene(MOONLIGHT_STORY_SCENE, 26.0);
    expect(act5.frame.activeAct?.id).toBe('act-5-goodnight-tableau');
    expect(act5.frame.nodes['goodnight-caption'].visible).toBe(true);
    expect(act5.svg).toContain('Goodnight, Little Moon ★');
  });

  it('triggers stepped audio cues accurately in PictureBookSoundEngine', () => {
    const sound = new PictureBookSoundEngine({ muted: false });
    const triggeredAct1 = sound.triggerCuesForFrame(
      MOONLIGHT_STORY_SCENE.audioCues,
      0.0,
      1.6
    );
    expect(triggeredAct1.length).toBe(2);
    expect(triggeredAct1[0].kind).toBe('crayon_scribble');

    sound.toggleMute();
    expect(sound.isMuted()).toBe(true);
    sound.dispose();
  });

  it('renders all 25 reusable asset catalog preview SVGs cleanly', () => {
    expect(ASSET_CATALOG_ITEMS.length).toBe(25);
    for (const item of ASSET_CATALOG_ITEMS) {
      const svg = renderAssetPreviewSvg(item, 2);
      expect(svg).toContain('<svg');
      expect(svg).toContain(item.viewBox);
    }
  });
});

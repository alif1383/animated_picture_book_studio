import { describe, it, expect } from 'vitest';
import { SHORT_SAMPLE_1_SCENE } from '../src/scenes/shortSample1';
import { evaluateAndRenderScene } from '../src/engine/renderer';
import { renderCharacter } from '../src/assets/characters';
import { renderEngineDefs } from '../src/engine/filters';
import { parseStudioUrlParams, SCENE_REGISTRY } from '../src/ui/app';

describe('Phase 5: ?short_sample=1 Morning-to-Night Child Story, Expressive Sun Rig & URL Router', () => {
  it('renders Expressive Crayon Sun in awake, sleepy, and sleeping states with sunset orange pattern', () => {
    const defs = renderEngineDefs({ seed: 1 });
    expect(defs).toContain('id="pat-crayon-sunset-orange"');

    const sunAwake = renderCharacter({
      id: 'sun-test',
      kind: 'sun',
      x: 700,
      y: 230,
      state: 'awake',
      frameIndex: 6,
    });
    expect(sunAwake).toContain('data-character="sun"');
    expect(sunAwake).toContain('data-state="awake"');
    expect(sunAwake).toContain('data-part="sun-rays"');
    expect(sunAwake).toContain('data-part="sun-face-awake"');
    expect(sunAwake).toContain('url(#pat-crayon-warm-moon)');

    const sunSleepy = renderCharacter({
      id: 'sun-test',
      kind: 'sun',
      x: 700,
      y: 260,
      state: 'sleepy',
      frameIndex: 6,
    });
    expect(sunSleepy).toContain('data-state="sleepy"');
    expect(sunSleepy).toContain('data-part="sun-face-sleepy"');
    expect(sunSleepy).toContain('url(#pat-crayon-sunset-orange)');

    const sunSleeping = renderCharacter({
      id: 'sun-test',
      kind: 'sun',
      x: 560,
      y: 410,
      state: 'sleeping',
      frameIndex: 6,
    });
    expect(sunSleeping).toContain('data-state="sleeping"');
    expect(sunSleeping).toContain('data-part="sun-face-sleeping"');
  });

  it('evaluates SHORT_SAMPLE_1_SCENE across morning, orange sleepy sunset, house entry, sun-to-moon handoff, and lullaby', () => {
    expect(SHORT_SAMPLE_1_SCENE.durationSec).toBe(30);
    expect(SHORT_SAMPLE_1_SCENE.acts).toHaveLength(5);

    // 1. Morning (t = 2.0s): Bright sun is out, kid playing on grass with sheep plushie
    const morning = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 2.0);
    expect(morning.frame.activeAct?.id).toBe('morning');
    expect(morning.frame.nodes['sun'].visible).toBe(true);
    expect(morning.frame.nodes['sun'].state).toBe('awake');
    expect(morning.frame.nodes['sunset-patch'].visible).toBe(false);
    expect(morning.frame.nodes['sky-patch'].visible).toBe(false);
    expect(morning.frame.nodes['little-girl'].state).toBe('walking');
    expect(morning.frame.nodes['little-girl'].x).toBeGreaterThan(450);

    // 2. Orange Sunset & Sleepy Sun (t = 9.0s): Sky turns orange, sun gets sleepy, kid walks to cottage door
    const sunset = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 9.0);
    expect(sunset.frame.activeAct?.id).toBe('sunset');
    expect(sunset.frame.nodes['sunset-patch'].visible).toBe(true);
    expect(sunset.frame.nodes['sunset-patch'].fillProgress).toBeGreaterThanOrEqual(0.5);
    expect(sunset.frame.nodes['sun'].state).toBe('sleepy');
    expect(sunset.svg).toContain('data-part="sun-face-sleepy"');

    // 3. Kid walks inside the house (t = 11.8s): Girl opacity is 0 inside door, bedroom window lights up
    const insideHouse = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 11.8);
    expect(insideHouse.frame.nodes['little-girl'].opacity).toBe(0);
    expect(insideHouse.frame.nodes['ochre-cottage'].windowLit).toBe(true);

    // 4. Nightfall & Sun-to-Moon Handoff (t = 16.0s): Indigo night fills in, sleeping sun moves out of the way, moon rises, kid climbs ladder
    const nightfall = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 16.0);
    expect(nightfall.frame.activeAct?.id).toBe('nightfall');
    expect(nightfall.frame.nodes['sky-patch'].visible).toBe(true);
    expect(nightfall.frame.nodes['sky-patch'].fillProgress).toBeGreaterThan(0.3);
    expect(nightfall.frame.nodes['sun'].state).toBe('sleeping');
    expect(nightfall.frame.nodes['sun'].y).toBeGreaterThan(320); // Drifting down out of the way
    expect(nightfall.frame.nodes['moon'].visible).toBe(true);
    expect(nightfall.frame.nodes['moon'].opacity).toBeGreaterThan(0.5);
    expect(nightfall.frame.nodes['little-girl'].state).toBe('climbing');

    // 5. Rooftop Lullaby (t = 22.5s): Singing on the roof, music notes, 1 2 3 4 5 pencil numbers
    const lullaby = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 22.5);
    expect(lullaby.frame.activeAct?.id).toBe('lullaby');
    expect(lullaby.frame.nodes['little-girl'].state).toBe('singing');
    expect(lullaby.frame.nodes['music-notes'].visible).toBe(true);
    expect(lullaby.frame.nodes['pencil-numbers'].visible).toBe(true);
    expect(lullaby.svg).toContain('id="fill-mask-sky-patch"');

    // 6. Goodnight Moon in Nightcap (t = 28.0s): Zoomed in on sleeping Moon wearing blue-and-white Nightcap
    const goodnight = evaluateAndRenderScene(SHORT_SAMPLE_1_SCENE, 28.0);
    expect(goodnight.frame.activeAct?.id).toBe('goodnight');
    expect(goodnight.frame.camera.zoom).toBeGreaterThan(1.8);
    expect(goodnight.frame.nodes['moon'].state).toBe('sleeping');
    expect(goodnight.frame.nodes['moon'].wearingNightcap).toBe(true);
    expect(goodnight.svg).toContain('data-part="moon-nightcap"');
  });

  it('routes URL query parameters (?short_sample=1, ?footage=..., ?short_sample=2, ?t=...) accurately', () => {
    expect(Object.keys(SCENE_REGISTRY)).toContain('1');
    expect(Object.keys(SCENE_REGISTRY)).toContain('2');
    expect(Object.keys(SCENE_REGISTRY)).toContain('3');

    const defaultRoute = parseStudioUrlParams('');
    expect(defaultRoute.shortSample).toBe('1');
    expect(defaultRoute.initialTimeSec).toBe(0);

    const sample1Route = parseStudioUrlParams('?short_sample=1');
    expect(sample1Route.shortSample).toBe('1');
    expect(sample1Route.scene.id).toBe('short_sample_1');

    const sunsetFootage = parseStudioUrlParams('?short_sample=1&footage=sunset');
    expect(sunsetFootage.shortSample).toBe('1');
    expect(sunsetFootage.footageId).toBe('sunset');
    expect(sunsetFootage.initialTimeSec).toBeCloseTo(6.4, 1);

    const nightfallFootage = parseStudioUrlParams('?short_sample=1&footage=nightfall');
    expect(nightfallFootage.footageId).toBe('nightfall');
    expect(nightfallFootage.initialTimeSec).toBeCloseTo(13.4, 1);

    const sample2Route = parseStudioUrlParams('?short_sample=2&t=16.5&autoplay=0');
    expect(sample2Route.shortSample).toBe('2');
    expect(sample2Route.scene.id).toBe('moonlight-lullaby-story');
    expect(sample2Route.initialTimeSec).toBe(16.5);
    expect(sample2Route.autoplay).toBe(false);
  });
});

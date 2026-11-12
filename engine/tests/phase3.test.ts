import { describe, it, expect } from 'vitest';
import { renderBuilding } from '../src/assets/buildings';
import { renderCharacter } from '../src/assets/characters';
import { renderProp, renderAnnotation } from '../src/assets/objects';
import { renderSceneToSvg } from '../src/engine/renderer';
import type {
  CharacterKind,
  CharacterState,
  PropKind,
  SceneDefinition,
} from '../src/engine/schema';

describe('Phase 3: Reusable Picture-Book Assets & 3-Layer Scene Renderer', () => {
  it('renders ochre_cottage and corner_store buildings with progressive fill support', () => {
    const cottage = renderBuilding({
      kind: 'ochre_cottage',
      windowLit: true,
      showLadder: true,
      fillMask: 'url(#mask-cottage)',
    });
    expect(cottage).toContain('data-building="ochre_cottage"');
    expect(cottage).toContain('data-part="ladder"');
    expect(cottage).toContain('data-part="bedroom-window"');
    expect(cottage).toContain('mask="url(#mask-cottage)"');

    const store = renderBuilding({
      kind: 'corner_store',
      signText: 'LUNE BAKERY',
      windowLit: true,
    });
    expect(store).toContain('data-building="corner_store"');
    expect(store).toContain('LUNE BAKERY');
    expect(store).toContain('data-part="store-awning"');
  });

  it('renders all 2D cutout character rigs and state variations on stepped frames', () => {
    const girlClimbing = renderCharacter({
      kind: 'little_girl',
      state: 'climbing',
      frameIndex: 2,
      holdingSheep: true,
    });
    expect(girlClimbing).toContain('data-character="little_girl"');
    expect(girlClimbing).toContain('data-state="climbing"');
    expect(girlClimbing).toContain('data-part="sheep-plushie"');

    const girlSinging = renderCharacter({
      kind: 'little_girl',
      state: 'singing',
      frameIndex: 4,
      holdingSheep: true,
    });
    expect(girlSinging).toContain('data-state="singing"');

    const moonGrumpy = renderCharacter({
      kind: 'moon',
      state: 'grumpy',
      frameIndex: 1,
      wearingNightcap: false,
    });
    expect(moonGrumpy).toContain('data-part="moon-face-grumpy"');
    expect(moonGrumpy).not.toContain('data-part="moon-nightcap"');

    const moonSleeping = renderCharacter({
      kind: 'moon',
      state: 'sleeping',
      frameIndex: 5,
      wearingNightcap: true,
    });
    expect(moonSleeping).toContain('data-part="moon-face-sleeping"');
    expect(moonSleeping).toContain('data-part="moon-nightcap"');

    const otherChars: Array<{ kind: CharacterKind; state: CharacterState }> = [
      { kind: 'shopkeeper', state: 'waving' },
      { kind: 'cat', state: 'sleeping' },
      { kind: 'cat', state: 'curious' },
    ];
    for (const c of otherChars) {
      const svg = renderCharacter({ ...c, frameIndex: 3 });
      expect(svg).toContain(`data-character="${c.kind}"`);
    }
  });

  it('renders all 9 reusable prop kinds and hand-drawn annotations', () => {
    const allProps: PropKind[] = [
      'grass_patch',
      'tree',
      'music_notes',
      'star_cluster',
      'pencil_numbers',
      'apple_crate',
      'street_lantern',
      'chimney_puffs',
      'bicycle',
    ];
    for (const kind of allProps) {
      const markup = renderProp({ kind, frameIndex: 2, count: 4 });
      expect(markup).toContain(`data-prop="${kind}"`);
    }

    const ann = renderAnnotation({
      text: '1  2  3  4  5',
      dashedPath: 'M 0 0 L 50 -30',
    });
    expect(ann).toContain('1  2  3  4  5');
    expect(ann).toContain('stroke-dasharray');
  });

  it('renders a complete scene through the Mandatory 3-Layer Stack with progressive stop-motion fill masks', () => {
    const sampleScene: SceneDefinition = {
      id: 'render-test',
      title: 'Render Stack Test',
      durationSec: 6,
      acts: [
        {
          id: 'a1',
          title: 'Act 1',
          startTime: 0,
          endTime: 6,
          caption: 'Testing 3-Layer Stack',
        },
      ],
      nodes: [
        {
          id: 'sky',
          type: 'background_patch',
          zIndex: 1,
          x: 0,
          y: 0,
          d: 'M 0 0 L 960 0 L 960 360 L 0 360 Z',
          bounds: { x: 0, y: 0, width: 960, height: 360 },
          material: 'markerIndigoNight',
          fillStyle: 'top-down-bands',
          fillProgress: 0.5,
          wrapRightNegativeSpace: true,
        },
        {
          id: 'cottage',
          type: 'building',
          kind: 'ochre_cottage',
          zIndex: 5,
          x: 240,
          y: 660,
          fillProgress: 0.7,
        },
        {
          id: 'moon-rig',
          type: 'character',
          kind: 'moon',
          state: 'grumpy',
          zIndex: 8,
          x: 740,
          y: 220,
        },
      ],
      timeline: [],
    };

    const svg = renderSceneToSvg(sampleScene, 1.0);
    // Layer 1: Base paper + scene nodes
    expect(svg).toContain('id="layer-1-base-scene"');
    expect(svg).toContain('id="paper-base"');
    expect(svg).toContain('id="node-sky"');
    expect(svg).toContain('id="node-cottage"');
    expect(svg).toContain('id="node-moon-rig"');
    // Layer 2: Crayon filter + stop-motion progressive fill masks
    expect(svg).toContain('id="crayon-stroke"');
    expect(svg).toContain('id="fill-mask-sky"');
    expect(svg).toContain('id="fill-mask-cottage"');
    // Layer 3: Physical Paper Composite Layer
    expect(svg).toContain('id="layer-3-paper-composite"');
  });
});

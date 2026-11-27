import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders a classic 1980s Victorian wrought-iron garden lamp (`'street_lantern'`)
 * inspired by *Mickey's Christmas Carol* (1983): stepped base, slender iron post
 * with decorative scroll bracket, pitched finial cap, mullioned glass lantern box
 * with tiny flickering warm candle flame, multi-layered soft golden radial glow halo
 * (`#cel-soft-glow`), and ground amber light pool when `lit: true`.
 *
 * Origin: `(0, 0)` at lamp base.
 * Footprint: `~x: -16..52, y: -132..0`.
 */
export function renderClassicStreetLantern(options: PropRenderOptions): string {
  const { lit = true, frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Gentle 12 FPS candle flicker & lantern breath
  const flameTilt = steppedOscillate(frameIndex, 10, 5.5, variant * 3);
  const flamePulse = steppedOscillate(frameIndex, 14, 0.09, variant * 5);
  const haloBreath = steppedOscillate(frameIndex, 18, 1.8, variant * 2);

  const haloGradId = `cc-lantern-halo-${uid}`;
  const glassGradId = `cc-lantern-glass-${uid}`;
  const poolGradId = `cc-lantern-pool-${uid}`;

  const defs = svgEl('defs', {}, [
    svgEl(
      'radialGradient',
      { id: haloGradId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberCore,
          'stop-opacity': 0.72,
        }),
        svgEl('stop', {
          offset: '38%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.42,
        }),
        svgEl('stop', {
          offset: '72%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0.16,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberDeep,
          'stop-opacity': 0,
        }),
      ]
    ),
    svgEl(
      'linearGradient',
      { id: glassGradId, x1: '50%', y1: '0%', x2: '50%', y2: '100%' },
      lit
        ? [
            svgEl('stop', { offset: '0%', 'stop-color': c.warmAmberGlow }),
            svgEl('stop', { offset: '55%', 'stop-color': c.warmAmberCore }),
            svgEl('stop', { offset: '100%', 'stop-color': c.warmAmberWash }),
          ]
        : [
            svgEl('stop', { offset: '0%', 'stop-color': c.nightSkyHorizon }),
            svgEl('stop', { offset: '100%', 'stop-color': c.stoneShadow }),
          ]
    ),
    svgEl(
      'radialGradient',
      { id: poolGradId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.34,
        }),
        svgEl('stop', {
          offset: '55%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0.16,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberDeep,
          'stop-opacity': 0,
        }),
      ]
    ),
  ]);

  // Ground amber light pool cast onto the garden path when lit
  const groundAmberPool = lit
    ? svgEl('ellipse', {
        'data-part': 'lantern-ground-pool',
        cx: 18,
        cy: 1,
        rx: round2(32 + haloBreath * 0.6),
        ry: round2(8.5 + haloBreath * 0.15),
        fill: svgUrl(poolGradId),
        opacity: round2(0.85 + flamePulse * 0.5),
      })
    : '';

  // Multi-layered soft warm golden radial glow halo with optical halation (#cel-soft-glow)
  const warmHalo = lit
    ? svgEl(
        'g',
        {
          'data-part': 'lantern-halo',
          filter: svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow),
        },
        [
          svgEl('circle', {
            cx: 18,
            cy: -99,
            r: round2(33 + haloBreath),
            fill: svgUrl(haloGradId),
            opacity: round2(0.88 + flamePulse * 0.5),
          }),
          svgEl('circle', {
            cx: 18,
            cy: -99,
            r: round2(17 + haloBreath * 0.45),
            fill: c.warmAmberGlow,
            opacity: 0.34,
          }),
        ]
      )
    : '';

  // Stepped Victorian cast-iron pedestal base (y: 0..-16, x: -12..12)
  const plinthBase = celShadedShape({
    d: 'M -12 0 L 12 0 L 11 -4.5 L 8 -5.5 L 7 -11 L 4.5 -14 L -4.5 -14 L -7 -11 L -8 -5.5 L -11 -4.5 Z',
    baseFill: c.ironDark,
    highlightPaths: [
      'M 2 -14 L 12 -14 L 12 0 L 3 0 C 4 -5, 4 -10, 2 -14 Z',
    ],
    highlightFill: c.ironHighlight,
    highlightOpacity: 0.48,
    clipId: `cc-lantern-base-clip-${uid}`,
    stroke: c.xeroxInk,
    strokeWidth: s.xeroxFine,
  });

  // Slender tapered iron post + molded decorative collar rings
  const ironPost = svgEl('g', { 'data-part': 'lantern-post' }, [
    celPath(
      'M -3.4 -14 L -2.3 -116 L 2.3 -116 L 3.4 -14 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    // Subtle moonlit metallic edge along right face of post
    svgEl('path', {
      d: 'M 1.1 -16 L 0.8 -114',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.ironHighlight,
        strokeWidth: 0.9,
        opacity: 0.65,
      }),
    }),
    // Molded decorative iron collars
    celPath('M -5.2 -26 L 5.2 -26 L 4.5 -23 L -4.5 -23 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -4.4 -94 L 4.4 -94 L 3.8 -91.5 L -3.8 -91.5 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Top cap finial on post
    celPath(
      'M -4 -116 L 0 -124 L 4 -116 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
  ]);

  // Decorative Victorian wrought-iron scroll bracket supporting the lantern at x = 18
  const scrollBracket = svgEl('g', { 'data-part': 'lantern-bracket' }, [
    // Main arched gooseneck arm
    svgEl('path', {
      d: 'M 0 -115 C 0 -128, 12 -131, 18 -126 L 18 -122',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.ironDark,
        strokeWidth: 3.0,
      }),
    }),
    // Fine moonlight highlight on upper gooseneck curve
    svgEl('path', {
      d: 'M 1.5 -117 C 2.5 -126.5, 11.5 -129, 17 -125.5',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.ironHighlight,
        strokeWidth: 0.85,
        opacity: 0.6,
      }),
    }),
    // Ornamental S-scroll volute brace beneath bracket arm
    svgEl('path', {
      d: 'M 2 -100 C 11 -101, 14 -112, 8 -115 C 4 -117, 3 -111, 7 -110',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.ironDark,
        strokeWidth: 1.8,
      }),
    }),
    svgEl('path', {
      d: 'M 2 -108 C 8 -113, 14 -120, 17 -124',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInk,
        strokeWidth: 1.35,
      }),
    }),
  ]);

  // Tiny flickering candle & warm flame inside mullioned glass box
  const candleFlame = lit
    ? svgEl('g', { 'data-part': 'lantern-candle' }, [
        // Wax candle stub
        svgEl('rect', {
          x: 16.5,
          y: -92,
          width: 3,
          height: 5.5,
          rx: 0.6,
          fill: c.celCream,
          stroke: c.xeroxInkSoft,
          'stroke-width': 0.6,
        }),
        // Animated teardrop flame
        svgEl(
          'g',
          {
            transform: svgTransform({
              x: 18,
              y: -92.5,
              rotate: flameTilt,
              scaleX: round2(1 - flamePulse * 0.4),
              scaleY: round2(1 + flamePulse),
            }),
          },
          [
            svgEl('path', {
              d: 'M 0 0 C -2.8 -1.5, -2.5 -5.8, 0 -8.5 C 2.5 -5.8, 2.8 -1.5, 0 0 Z',
              fill: c.warmAmberGlow,
            }),
            svgEl('path', {
              d: 'M 0 -0.8 C -1.3 -1.8, -1.2 -4.2, 0 -6.1 C 1.2 -4.2, 1.3 -1.8, 0 -0.8 Z',
              fill: c.warmAmberCore,
            }),
          ]
        ),
      ])
    : '';

  // Hanging Victorian mullioned glass lantern box with pitched finial cap
  const lanternHousing = svgEl('g', { 'data-part': 'lantern-housing' }, [
    // Tapered glass panes
    svgEl('path', {
      d: 'M 9 -112 L 27 -112 L 24 -86 L 12 -86 Z',
      fill: svgUrl(glassGradId),
      opacity: lit ? 0.94 : 0.58,
      ...celStrokeAttrs({
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
    }),
    // Candle flame glowing inside glass
    candleFlame,
    // Crisp wrought-iron vertical & diagonal glass mullions
    svgEl('path', {
      d: 'M 18 -112 L 18 -86 M 13.5 -112 L 14.5 -86 M 22.5 -112 L 21.5 -86',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.ironDark,
        strokeWidth: 1.15,
      }),
    }),
    // Upper lantern eaves cornice & pitched pagoda roof cap with finial spire
    celShadedShape({
      d: 'M 6.5 -112 L 10 -116 L 18 -122.5 L 26 -116 L 29.5 -112 Z',
      baseFill: c.ironDark,
      highlightPaths: ['M 18 -123 L 30 -112 L 18 -112 Z'],
      highlightFill: c.ironHighlight,
      highlightOpacity: 0.42,
      clipId: `cc-lantern-cap-clip-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Top finial ring & spire
    celPath(
      'M 16.2 -122.5 L 18 -129.5 L 19.8 -122.5 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
    // Bottom iron cup & pendant drop finial
    celPath(
      'M 10.5 -86 L 25.5 -86 L 22 -82.5 L 18 -79.5 L 14 -82.5 Z',
      c.ironDark,
      { stroke: c.xeroxInk, strokeWidth: s.sketchLine }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'street_lantern',
      'data-art-style': 'classic_cel',
      'data-lit': lit ? 'true' : 'false',
    },
    [
      defs,
      celContactShadow(0, 1, 14, 3.8, 0.34),
      groundAmberPool,
      warmHalo,
      plinthBase,
      ironPost,
      scrollBracket,
      lanternHousing,
    ]
  );
}

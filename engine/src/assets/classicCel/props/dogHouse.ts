import { TOKENS } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  round2,
  svgEl,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1970s–80s Classic Hand-Drawn Cel wooden doghouse (`'dog_house'`)
 * sized identically to the crayon original (`x: -64..64`, `y: -112..0`, ground at `y = 0`).
 * Crafted with flat matte analog cel paint, crisp two-tone cast shadows, raw electrostatic
 * Xerox graphite outlines, and sketchy wood-grain & shingle ink ticks.
 */
export function renderClassicDogHouse(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  // Subtle stepped-on-twos (12 FPS) hand-drawn Xerox micro-boil
  const twosStep = Math.floor(frameIndex / 2);
  const boilX = round2(deterministicJitter(3, twosStep + variant * 7, 0.35));
  const boilY = round2(deterministicJitter(4, twosStep + variant * 7, 0.3));

  // 1. Weathered Clapboard Wooden Walls, Corner Trim Posts & Porch Sill
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main gabled front wall: flat matte ochreEarth base, cottagePlaster upper sunlit plane,
    // and hard-edged roof-eave cast shadow in cottagePlasterShadow
    celShadedShape({
      d: 'M -52 0 L -52 -62 L 0 -104 L 52 -62 L 52 0 Z',
      baseFill: c.ochreEarth,
      shadowPaths: [
        // Crisp diagonal under-eave cast shadow beneath the pitched roof overhang
        'M -53 -63 L 0 -105 L 53 -63 L 53 -48 L 0 -86 L -53 -48 Z',
        // Right-side weathered shadow plane for classic cel depth
        'M 29 -66 L 53 -62 L 53 1 L 29 1 Z',
      ],
      shadowFill: c.cottagePlasterShadow,
      shadowOpacity: 0.72,
      highlightPaths: [
        // Warm sunlit weathered clapboard wash on the left-facing wall
        'M -52 -50 L -28 -50 L -28 0 L -52 0 Z',
        'M -36 -74 L 0 -98 L 0 -60 L -48 -60 Z',
      ],
      highlightFill: c.cottagePlaster,
      highlightOpacity: 0.42,
      clipId: `cc-dog-house-wall-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),

    // Horizontal hand-drawn clapboard plank seams
    xeroxSketchStroke(
      [
        'M -35 -75 L 35 -75',
        'M -51 -60 L 51 -60',
        'M -51 -45 L -28 -45 M 28 -45 L 51 -45',
        'M -51 -30 L -28 -30 M 28 -30 L 51 -30',
        'M -51 -15 L -28 -15 M 28 -15 L 51 -15',
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        opacity: 0.78,
      }
    ),

    // Broken sketchy wood-grain scratches & plank weather ticks
    xeroxSketchStroke(
      [
        'M -44 -53 L -31 -52.5',
        'M -43 -37 L -30 -37.5',
        'M -45 -22 L -32 -21.5',
        'M 31 -52 L 43 -52.5',
        'M 32 -38 L 44 -37.5',
        'M 30 -23 L 43 -22',
        'M -24 -68 L -11 -67.5',
        'M 12 -67.5 L 25 -68',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        dasharray: '8 3 4 2.5',
        opacity: 0.65,
      }
    ),

    // Left warm timber corner post (lit on outer left edge)
    celShadedShape({
      d: 'M -54 0 L -54 -60 L -45 -60 L -45 0 Z',
      baseFill: c.woodMid,
      highlightPaths: ['M -54 -60 L -50 -60 L -50 0 L -54 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.85,
      shadowPaths: ['M -48 -60 L -45 -60 L -45 0 L -48 0 Z'],
      shadowFill: c.woodDark,
      shadowOpacity: 0.55,
      clipId: `cc-dog-house-post-l-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Right warm timber corner post (shaded on right flank)
    celShadedShape({
      d: 'M 45 0 L 45 -60 L 54 -60 L 54 0 Z',
      baseFill: c.woodMid,
      highlightPaths: ['M 45 -60 L 48.5 -60 L 48.5 0 L 45 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.65,
      shadowPaths: ['M 50.5 -60 L 54 -60 L 54 0 L 50.5 0 Z'],
      shadowFill: c.woodDark,
      shadowOpacity: 0.72,
      clipId: `cc-dog-house-post-r-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Vertical timber grain scratches on corner posts
    xeroxSketchStroke(
      'M -50 -54 L -50.4 -16 M -48 -40 L -47.8 -10 M 49 -53 L 49.3 -15 M 51.5 -38 L 51.2 -9',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.75,
        broken: true,
        opacity: 0.68,
      }
    ),

    // Sturdy wooden porch base sill resting cleanly at y = 0
    celShadedShape({
      d: 'M -58 0 L 58 0 L 56 -6 L -56 -6 Z',
      baseFill: c.woodMid,
      highlightPaths: ['M -57 -6 L 57 -6 L 57 -3.6 L -57 -3.6 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.7,
      shadowPaths: ['M -58 -2 L 58 -2 L 58 0 L -58 0 Z'],
      shadowFill: c.woodDark,
      shadowOpacity: 0.75,
      clipId: `cc-dog-house-sill-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Hand-inked iron nail heads on corner posts
    svgEl('circle', { cx: -49.5, cy: -52, r: 1.4, fill: c.xeroxInk }),
    svgEl('circle', { cx: -49.5, cy: -12, r: 1.4, fill: c.xeroxInk }),
    svgEl('circle', { cx: 49.5, cy: -52, r: 1.4, fill: c.xeroxInk }),
    svgEl('circle', { cx: 49.5, cy: -12, r: 1.4, fill: c.xeroxInk }),
  ]);

  // 2. Roomy Arched Timber Doorframe & Deep Shadowed Interior (50px wide x 58px tall)
  const doorway = svgEl('g', { 'data-part': 'doorway' }, [
    // Outer curved wooden doorframe trim
    celShadedShape({
      d: 'M -29 0 L -29 -33 A 29 29 0 0 1 29 -33 L 29 0 Z',
      baseFill: c.woodMid,
      highlightPaths: ['M -29 0 L -29 -33 A 29 29 0 0 1 4 -62 L 4 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.55,
      shadowPaths: ['M 12 -60 L 29 -40 L 29 0 L 18 0 Z'],
      shadowFill: c.woodDark,
      shadowOpacity: 0.6,
      clipId: `cc-dog-house-frame-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Sketchy miter & wood-grain ticks around the arched doorframe
    xeroxSketchStroke(
      'M -27 -24 L -27.2 -8 M 27 -26 L 27.2 -9 M -18 -51 Q -10 -57, -2 -58',
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.8,
        broken: true,
        opacity: 0.72,
      }
    ),

    // Deep cozy arched doorway interior (50px wide: -25..25, 58px tall: -58..0)
    celShadedShape({
      d: 'M -25 0 L -25 -33 A 25 25 0 0 1 25 -33 L 25 0 Z',
      baseFill: c.woodDark,
      shadowPaths: [
        // Deep cast darkness inside the upper & rear doghouse interior
        'M -25 -4 L -25 -33 A 25 25 0 0 1 25 -33 L 25 -8 Q 6 -16, -25 -4 Z',
      ],
      shadowFill: c.xeroxInk,
      shadowOpacity: 0.86,
      clipId: `cc-dog-house-interior-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Faint interior wooden floorboards glimpsed at the threshold
    xeroxSketchStroke('M -20 -2.2 L 20 -2.2 M -15 -5.4 L 15 -5.4', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 1.0,
      broken: true,
      opacity: 0.78,
    }),
  ]);

  // 3. Cream Bone-Shaped Nameplate centered at (0, -76)
  const bx = round2(boilX * 0.3);
  const by = round2(-76 + boilY * 0.3);
  const boneD = [
    `M ${bx - 11} ${by - 3.5}`,
    `C ${bx - 13} ${by - 7.5}, ${bx - 19} ${by - 6.5}, ${bx - 18.5} ${by - 2}`,
    `C ${bx - 19.5} ${by + 0.2}, ${bx - 19.5} ${by + 0.8}, ${bx - 18.5} ${by + 2}`,
    `C ${bx - 19} ${by + 6.5}, ${bx - 13} ${by + 7.5}, ${bx - 11} ${by + 3.5}`,
    `L ${bx + 11} ${by + 3.5}`,
    `C ${bx + 13} ${by + 7.5}, ${bx + 19} ${by + 6.5}, ${bx + 18.5} ${by + 2}`,
    `C ${bx + 19.5} ${by + 0.8}, ${bx + 19.5} ${by + 0.2}, ${bx + 18.5} ${by - 2}`,
    `C ${bx + 19} ${by - 6.5}, ${bx + 13} ${by - 7.5}, ${bx + 11} ${by - 3.5}`,
    'Z',
  ].join(' ');

  const boneNameplate = svgEl('g', { 'data-part': 'bone-nameplate' }, [
    // Crisp flat cast shadow beneath mounted bone plaque
    svgEl('path', {
      d: `M ${bx - 13} ${by + 4.8} L ${bx + 13} ${by + 4.8}`,
      fill: 'none',
      stroke: c.woodDark,
      'stroke-width': 2.3,
      'stroke-linecap': 'round',
      opacity: 0.52,
    }),
    // Flat matte celCream bone plaque with subtle bottom-edge cel shadow
    celShadedShape({
      d: boneD,
      baseFill: c.celCream,
      shadowPaths: [
        `M ${bx - 20} ${by + 1.8} L ${bx + 20} ${by + 1.8} L ${bx + 20} ${by + 8} L ${bx - 20} ${by + 8} Z`,
      ],
      shadowFill: c.boardToothWarm,
      shadowOpacity: 0.85,
      clipId: `cc-dog-house-bone-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Two tiny iron mounting tacks + sketchy cursive name scribble
    svgEl('circle', { cx: bx - 12.5, cy: by, r: 1.15, fill: c.xeroxInk }),
    svgEl('circle', { cx: bx + 12.5, cy: by, r: 1.15, fill: c.xeroxInk }),
    xeroxSketchStroke(
      `M ${bx - 7} ${by + 0.5} Q ${bx - 3.5} ${by - 1.7}, ${bx} ${by + 0.5} T ${bx + 7} ${by + 0.2}`,
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: 1.15,
        opacity: 0.82,
      }
    ),
  ]);

  // 4. Pitched Terracotta-Russet Shingled Roof with Scalloped Eaves (peak y = -112, eaves x = -64..64)
  const roofD = [
    'M 0 -112',
    'L 64 -61',
    'Q 59 -53, 52 -57',
    'Q 47 -52, 42 -58',
    'L 0 -94',
    'L -42 -58',
    'Q -47 -52, -52 -57',
    'Q -59 -53, -64 -61',
    'Z',
  ].join(' ');

  const roof = svgEl('g', { 'data-part': 'roof' }, [
    // Deep terracotta underside overhang shadow behind the scalloped eaves
    celPath(
      'M -61 -57 L 0 -106 L 61 -57 L 54 -53 L 0 -95 L -54 -53 Z',
      c.cottageRoofShadow,
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }
    ),

    // Main pitched terracotta-russet roof with flat two-tone cel plane separation
    celShadedShape({
      d: roofD,
      baseFill: c.cottageRoof,
      shadowPaths: [
        // Shaded right roof slope
        'M 0 -112 L 66 -60 L 66 -50 L 0 -92 Z',
        // Deeper shadow tucked along the lower scalloped edge
        'M -65 -60 L -42 -56 L 0 -90 L 42 -56 L 65 -60 L 65 -50 L -65 -50 Z',
      ],
      shadowFill: c.cottageRoofShadow,
      shadowOpacity: 0.72,
      highlightPaths: [
        // Sunlit warm russet upper-left roof ridge plane
        'M 0 -112 L -64 -61 L -54 -58 L 0 -100 Z',
      ],
      highlightFill: c.russetEarth,
      highlightOpacity: 0.5,
      clipId: `cc-dog-house-roof-${uid}`,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
    }),

    // Scalloped shingle courses along both roof slopes
    xeroxSketchStroke(
      [
        'M -56 -64 Q -48 -58, -42 -66 Q -34 -61, -28 -69 Q -20 -64, -14 -72 Q -6 -68, 0 -76',
        'M 56 -64 Q 48 -58, 42 -66 Q 34 -61, 28 -69 Q 20 -64, 14 -72 Q 6 -68, 0 -76',
        'M -42 -77 Q -34 -72, -26 -80 Q -18 -76, -10 -84 Q -4 -81, 0 -87',
        'M 42 -77 Q 34 -72, 26 -80 Q 18 -76, 10 -84 Q 4 -81, 0 -87',
      ].join(' '),
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        opacity: 0.78,
      }
    ),

    // Sketchy vertical shingle joint ticks & roof-ridge pencil strokes
    xeroxSketchStroke(
      [
        'M -46 -67 L -42 -71 M -33 -74 L -29 -78 M -19 -83 L -15 -87',
        'M 46 -67 L 42 -71 M 33 -74 L 29 -78 M 19 -83 L 15 -87',
        'M 0 -106 L 0 -95',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        opacity: 0.7,
      }
    ),

    // Warm parchment bargeboard accent trim tracing the inner gable edge
    xeroxSketchStroke(
      `M -48 -58 L ${round2(boilX * 0.25)} -98 L 48 -58`,
      {
        stroke: c.celCream,
        strokeWidth: 1.75,
        dasharray: '5 4',
        opacity: 0.82,
      }
    ),

    // Decorative roof-ridge finial cap at the apex
    celPath(
      'M -3.2 -108.5 A 3.2 3.2 0 1 0 3.2 -108.5 A 3.2 3.2 0 1 0 -3.2 -108.5 Z',
      c.cottageRoofShadow,
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }
    ),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'dog_house',
      'data-art-style': 'classic_cel',
    },
    [
      celContactShadow(0, 0, 58, 4.2, 0.28),
      walls,
      doorway,
      boneNameplate,
      roof,
    ]
  );
}

import { TOKENS, svgUrl } from '../../../theme/tokens';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  celStrokeAttrs,
  gouachePath,
  svgEl,
} from '../../../engine/svgUtils';
import type { BuildingRenderOptions } from '../../buildings/types';

/**
 * Renders the Classic 1970s–1980s Disney hand-painted storybook timber-and-plaster
 * Ochre Cottage (`'ochre_cottage'`) for `classic_cel` scenes.
 *
 * Visual language: *Robin Hood* (1973) & *Mickey's Christmas Carol* (1983) painted
 * gouache architectural background with cool moonlight shadow planes, loose sketchy
 * sepia Xerox ink contours, warm radial amber practical light spill from mullioned
 * windows (`windowLit: true`), half-timber framing, weathered stone chimney with soft
 * wispy evening smoke, arched oak door with glowing heart pane, teal louvered shutters,
 * ivy, flower box, and optional right-side climbing ladder (`showLadder: true`).
 *
 * Local origin `(0, 0)` at ground contact; bounds `~x: -176..168, y: -268..0`.
 */
export function renderClassicOchreCottage(
  options: BuildingRenderOptions
): string {
  const { windowLit = true, showLadder = true, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;
  const softGlowFilter = svgUrl(TOKENS.classicCel.filters.ids.celSoftGlow);

  const safeSuffix = id ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  const pid = (name: string): string => `cc-cottage-${name}${safeSuffix}`;

  const wallGradId = pid('wall-grad');
  const gableGradId = pid('gable-grad');
  const roofGradId = pid('roof-grad');
  const chimneyGradId = pid('chimney-grad');
  const windowGlowId = pid('window-glow');
  const lightSpillId = pid('light-spill');
  const smokeGradId = pid('smoke-grad');
  const doorClipId = pid('door-clip');
  const roofClipId = pid('roof-clip');
  const gableRoofClipId = pid('gable-roof-clip');

  // Local painterly gouache & practical lighting gradients
  const defs = svgEl('defs', {}, [
    // Main right/center plaster wall gouache wash (cool moonlight top to deep night base)
    svgEl(
      'linearGradient',
      { id: wallGradId, x1: '18%', y1: '0%', x2: '86%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.cottagePlaster }),
        svgEl('stop', { offset: '58%', 'stop-color': c.cottagePlaster }),
        svgEl('stop', { offset: '100%', 'stop-color': c.cottagePlasterShadow }),
      ]
    ),
    // Protruding left gable plaster wash catching slightly brighter moonlight on left
    svgEl(
      'linearGradient',
      { id: gableGradId, x1: '8%', y1: '12%', x2: '95%', y2: '94%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.mochiCream }),
        svgEl('stop', { offset: '22%', 'stop-color': c.cottagePlaster }),
        svgEl('stop', { offset: '78%', 'stop-color': c.cottagePlasterShadow }),
        svgEl('stop', { offset: '100%', 'stop-color': c.pathEarthDark }),
      ]
    ),
    // Layered terracotta-mahogany roof gouache wash
    svgEl(
      'linearGradient',
      { id: roofGradId, x1: '20%', y1: '0%', x2: '72%', y2: '100%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.cottageRoof }),
        svgEl('stop', { offset: '62%', 'stop-color': c.cottageRoof }),
        svgEl('stop', { offset: '100%', 'stop-color': c.cottageRoofShadow }),
      ]
    ),
    // Weathered stone chimney stack wash
    svgEl(
      'linearGradient',
      { id: chimneyGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.stoneLight }),
        svgEl('stop', { offset: '36%', 'stop-color': c.stoneBase }),
        svgEl('stop', { offset: '100%', 'stop-color': c.stoneShadow }),
      ]
    ),
    // Warm golden hearth interior radial glow for lit windows
    svgEl(
      'radialGradient',
      { id: windowGlowId, cx: '50%', cy: '54%', r: '62%' },
      [
        svgEl('stop', { offset: '0%', 'stop-color': c.warmAmberCore }),
        svgEl('stop', { offset: '42%', 'stop-color': c.warmAmberGlow }),
        svgEl('stop', { offset: '78%', 'stop-color': c.warmAmberWash }),
        svgEl('stop', { offset: '100%', 'stop-color': c.warmAmberDeep }),
      ]
    ),
    // Practical warm golden light spill cast onto plaster walls & garden sill
    svgEl(
      'radialGradient',
      { id: lightSpillId, cx: '50%', cy: '50%', r: '50%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.warmAmberCore,
          'stop-opacity': 0.44,
        }),
        svgEl('stop', {
          offset: '46%',
          'stop-color': c.warmAmberGlow,
          'stop-opacity': 0.24,
        }),
        svgEl('stop', {
          offset: '78%',
          'stop-color': c.warmAmberWash,
          'stop-opacity': 0.08,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.warmAmberDeep,
          'stop-opacity': 0,
        }),
      ]
    ),
    // Soft moonlit chimney smoke drift gradient
    svgEl(
      'linearGradient',
      { id: smokeGradId, x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
      [
        svgEl('stop', {
          offset: '0%',
          'stop-color': c.stoneLight,
          'stop-opacity': 0.34,
        }),
        svgEl('stop', {
          offset: '55%',
          'stop-color': c.celCream,
          'stop-opacity': 0.2,
        }),
        svgEl('stop', {
          offset: '100%',
          'stop-color': c.stoneLight,
          'stop-opacity': 0,
        }),
      ]
    ),
  ]);

  // Grounding night contact shadow under cottage foundation
  const groundShadow = celContactShadow(-8, 1.5, 168, 7.5, 0.36);

  // 1. Weathered Stone Chimney & Soft Wispy Smoke (top-left behind roof)
  const chimney = svgEl('g', { 'data-part': 'chimney' }, [
    // Soft wispy evening smoke drifting lazily right from chimney pot (within y: -268..0)
    gouachePath(
      'M -91 -266 C -94 -268, -80 -268, -68 -265 C -56 -262, -42 -267, -30 -264 C -24 -262, -26 -256, -36 -255 C -48 -254, -58 -257, -68 -256 C -77 -255, -85 -258, -87 -264 Z',
      svgUrl(smokeGradId),
      { softEdge: true, opacity: windowLit ? 0.9 : 0.45 }
    ),
    gouachePath(
      'M -88 -265 C -82 -267, -70 -265, -60 -262 C -50 -259, -46 -262, -40 -260 C -46 -257, -58 -258, -68 -259 C -77 -260, -84 -261, -88 -265 Z',
      c.celCream,
      { softEdge: true, opacity: windowLit ? 0.22 : 0.1 }
    ),
    // Stone chimney stack body
    gouachePath(
      'M -108 -190 L -108 -250 L -72 -250 L -72 -185 Z',
      svgUrl(chimneyGradId),
      {
        softEdge: false,
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxMedium,
      }
    ),
    // Cool right-side cast shadow plane on chimney stack
    svgEl('path', {
      d: 'M -86 -250 L -72 -250 L -72 -185 L -86 -188 Z',
      fill: c.nightSkyMid,
      opacity: 0.34,
    }),
    // Moonlit left bevel highlight on chimney
    svgEl('path', {
      d: 'M -107 -249 L -102 -249 L -102 -192 L -107 -192 Z',
      fill: c.celCream,
      opacity: 0.22,
    }),
    // Corbeled stone chimney cap
    celPath(
      'M -115 -250 L -65 -250 L -65 -259 L -115 -259 Z',
      c.stoneBase,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
    svgEl('path', {
      d: 'M -114 -258 L -66 -258 L -66 -255.5 L -114 -255.5 Z',
      fill: c.stoneLight,
      opacity: 0.55,
    }),
    svgEl('path', {
      d: 'M -114 -252 L -66 -252 L -66 -250 L -114 -250 Z',
      fill: c.stoneShadow,
      opacity: 0.72,
    }),
    // Terracotta chimney pot crown
    celPath(
      'M -98 -259 L -82 -259 L -84 -268 L -96 -268 Z',
      c.cottageRoof,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M -89 -268 L -84 -268 L -82 -259 L -89 -259 Z',
      fill: c.cottageRoofShadow,
      opacity: 0.65,
    }),
    // Sketchy sepia-ink masonry mortar courses
    svgEl('path', {
      d: [
        'M -107 -238 L -73 -238',
        'M -107 -225 L -73 -225',
        'M -107 -212 L -73 -212',
        'M -107 -199 L -73 -199',
        'M -94 -250 L -94 -238',
        'M -83 -238 L -83 -225',
        'M -96 -225 L -96 -212',
        'M -84 -212 L -84 -199',
      ].join(' '),
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.68,
      }),
    }),
  ]);

  // 2. Painted Gouache Plaster Walls, Timber Framing, Stone Baseboard & Ivy
  const walls = svgEl('g', { 'data-part': 'walls' }, [
    // Main right/center plaster wall body
    gouachePath(
      'M -55 -132 L 152 -132 L 154 0 L -55 0 Z',
      svgUrl(wallGradId),
      {
        softEdge: false,
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxHeavy,
      }
    ),
    // Cool moonlight night-wash tint across main plaster wall
    svgEl('path', {
      d: 'M -54 -131 L 151 -131 L 153 -1 L -54 -1 Z',
      fill: c.nightSkyMid,
      opacity: 0.16,
    }),
    // Deep cast shadow directly under main roof overhang
    svgEl('path', {
      d: 'M -54 -131 L 151 -131 L 152 -114 Q 60 -116, -54 -112 Z',
      fill: c.nightSkyZenith,
      opacity: 0.42,
    }),
    // Cast shadow thrown by the protruding left wing onto the right wall
    svgEl('path', {
      d: 'M -45 -126 L -31 -126 L -35 0 L -45 0 Z',
      fill: c.nightSkyZenith,
      opacity: 0.3,
    }),
    // Subtle plaster weathering gouache blotches on main wall
    gouachePath(
      'M 118 -108 Q 144 -96, 148 -66 Q 134 -42, 146 -18 L 152 -18 L 152 -112 Z',
      c.cottagePlasterShadow,
      { softEdge: false, opacity: 0.35 }
    ),

    // Protruding gabled left wing plaster wall
    gouachePath(
      'M -168 -118 L -106 -188 L -45 -118 L -45 0 L -168 0 Z',
      svgUrl(gableGradId),
      {
        softEdge: false,
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxHeavy,
      }
    ),
    // Cool night-blue cast shadow under gable eaves
    svgEl('path', {
      d: 'M -167 -117 L -106 -187 L -46 -117 L -46 -104 L -106 -170 L -167 -104 Z',
      fill: c.nightSkyZenith,
      opacity: 0.36,
    }),
    // Subtle cool shading on right half of left wing
    svgEl('path', {
      d: 'M -72 -148 L -46 -118 L -46 0 L -72 0 Z',
      fill: c.nightSkyMid,
      opacity: 0.2,
    }),

    // Storybook half-timber oak beams (Robin Hood / Christmas Carol architecture)
    svgEl('g', { 'data-part': 'timber-framing' }, [
      // Left wing horizontal tie beam & gable diagonal struts
      celPath('M -168 -118 L -45 -118 L -45 -111 L -168 -111 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -146 -118 L -126 -144 L -121 -141 L -140 -118 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      celPath('M -66 -118 L -86 -144 L -91 -141 L -72 -118 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
      }),
      // Left wing vertical corner posts
      celPath('M -168 -118 L -161 -118 L -161 -10 L -168 -10 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      celPath('M -52 -118 L -45 -118 L -45 -10 L -52 -10 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      // Main right wall corner timber post & mid-wall diagonal brace
      celPath('M 146 -132 L 153 -132 L 154 -10 L 147 -10 Z', c.woodDark, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxFine,
      }),
      // Sketchy timber wood grain lines
      svgEl('path', {
        d: 'M -164 -108 L -164 -20 M -48 -108 L -48 -20 M -158 -114.5 L -54 -114.5 M 150 -122 L 150 -20',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.woodLit,
          strokeWidth: s.sketchLine,
          opacity: 0.45,
        }),
      }),
    ]),

    // Weathered cut-stone baseboard foundation & dressed corner quoins
    celPath('M -168 0 L 154 0 L 154 -11 L -168 -11 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('path', {
      d: 'M -167 -5 L 153 -5 L 153 0 L -167 0 Z',
      fill: c.stoneShadow,
      opacity: 0.65,
    }),
    svgEl('path', {
      d: 'M -144 -11 L -144 0 M -72 -11 L -72 0 M -26 -11 L -26 0 M 18 -11 L 18 0 M 64 -11 L 64 0 M 112 -11 L 112 0',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.65,
      }),
    }),
    // Dressed stone corner quoins (left & right edges)
    celPath('M -168 -96 L -155 -96 L -155 -84 L -168 -84 Z', c.stoneLight, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M -168 -64 L -157 -64 L -157 -52 L -168 -52 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 141 -98 L 153 -98 L 153 -86 L 141 -86 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),

    // Lush climbing night ivy & blossoms (`data-part="cottage-vines"`)
    svgEl('g', { 'data-part': 'cottage-vines' }, [
      // Dark foliage backing shadow along wing seam
      gouachePath(
        'M -52 -12 C -58 -36, -42 -58, -54 -84 C -57 -98, -48 -112, -41 -116 C -35 -102, -37 -84, -40 -68 C -36 -48, -38 -26, -42 -12 Z',
        c.foliageShadow,
        { softEdge: false, opacity: 0.9 }
      ),
      svgEl('path', {
        d: 'M -45 -10 Q -53 -42, -43 -72 Q -50 -98, -44 -118',
        fill: 'none',
        ...celStrokeAttrs({
          stroke: c.woodDark,
          strokeWidth: 1.8,
        }),
      }),
      // Layered emerald ivy leaves with cool moonlit rim leaves
      svgEl('ellipse', {
        cx: -50,
        cy: -24,
        rx: 5.5,
        ry: 3,
        transform: 'rotate(-24, -50, -24)',
        fill: c.foliageMid,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('ellipse', {
        cx: -40,
        cy: -38,
        rx: 5.5,
        ry: 3.1,
        transform: 'rotate(22, -40, -38)',
        fill: c.foliageLit,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('ellipse', {
        cx: -51,
        cy: -54,
        rx: 5.8,
        ry: 3.2,
        transform: 'rotate(-28, -51, -54)',
        fill: c.foliageRim,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('ellipse', {
        cx: -41,
        cy: -74,
        rx: 5.4,
        ry: 3,
        transform: 'rotate(26, -41, -74)',
        fill: c.foliageMid,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('ellipse', {
        cx: -50,
        cy: -92,
        rx: 5.6,
        ry: 3,
        transform: 'rotate(-22, -50, -92)',
        fill: c.foliageRim,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('ellipse', {
        cx: -42,
        cy: -106,
        rx: 5,
        ry: 2.8,
        transform: 'rotate(18, -42, -106)',
        fill: c.foliageLit,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      // Tiny storybook rose & cream night blossoms on the ivy
      svgEl('circle', {
        cx: -43,
        cy: -62,
        r: 3.2,
        fill: c.flowerRose,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: 0.85 }),
      }),
      svgEl('circle', {
        cx: -48,
        cy: -84,
        r: 3.0,
        fill: c.flowerCream,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: 0.85 }),
      }),
      svgEl('circle', {
        cx: -47,
        cy: -34,
        r: 2.6,
        fill: c.flowerBlue,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: 0.85 }),
      }),
    ]),
  ]);

  // 3. Left Wing Round Attic Window, Arched Oak Door with Glowing Heart Pane & Cobblestone Stoop
  const leftWingDetails = svgEl('g', { 'data-part': 'left-wing-details' }, [
    // Warm amber halo spill around lit attic window
    windowLit
      ? svgEl('circle', {
          cx: -106,
          cy: -142,
          r: 28,
          fill: svgUrl(lightSpillId),
          filter: softGlowFilter,
          opacity: 0.85,
        })
      : '',
    // Round timber attic window surround
    svgEl('circle', {
      cx: -106,
      cy: -142,
      r: 19.5,
      fill: c.woodDark,
      ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }),
    }),
    // Round attic glass pane (warm golden radial glow when lit, moonlit indigo when dark)
    svgEl('circle', {
      cx: -106,
      cy: -142,
      r: 16.5,
      fill: windowLit ? svgUrl(windowGlowId) : c.nightSkyMid,
      ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: s.xeroxFine }),
    }),
    !windowLit
      ? svgEl('path', {
          d: 'M -116 -150 L -102 -136 M -111 -153 L -97 -139',
          fill: 'none',
          stroke: c.waterHighlight,
          'stroke-width': 1.4,
          'stroke-linecap': 'round',
          opacity: 0.42,
        })
      : '',
    // Mullion crossbars on round attic window
    svgEl('path', {
      d: 'M -122.5 -142 L -89.5 -142 M -106 -158.5 L -106 -125.5',
      fill: 'none',
      ...celStrokeAttrs({ stroke: c.woodDark, strokeWidth: 2.1 }),
    }),
    svgEl('path', {
      d: 'M -122.5 -142 L -89.5 -142 M -106 -158.5 L -106 -125.5',
      fill: 'none',
      ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: 0.9 }),
    }),

    // Recessed arched stone/timber doorway surround
    celPath(
      'M -135 0 L -135 -69 Q -106 -94, -77 -69 L -77 0 Z',
      c.woodDark,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxMedium }
    ),
    // Arched oak plank door with 2-tone cel wood shading
    celShadedShape({
      d: 'M -132 0 L -132 -68 Q -106 -90, -80 -68 L -80 0 Z',
      baseFill: c.woodMid,
      shadowPaths: [
        'M -132 -68 Q -106 -90, -80 -68 L -80 -62 Q -106 -83, -132 -62 Z',
        'M -92 -76 L -80 -68 L -80 0 L -92 0 Z',
      ],
      shadowFill: c.woodDark,
      shadowOpacity: 0.68,
      highlightPaths: ['M -130 -66 L -124 -70 L -124 0 L -130 0 Z'],
      highlightFill: c.woodLit,
      highlightOpacity: 0.55,
      clipId: doorClipId,
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    // Sketchy oak vertical plank joints & wrought-iron strap hinges
    svgEl('path', {
      d: 'M -118 -77 L -118 0 M -106 -80 L -106 0 M -94 -77 L -94 0',
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.72,
      }),
    }),
    celPath('M -132 -62 L -112 -62 L -110 -59 L -132 -59 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    celPath('M -132 -24 L -112 -24 L -110 -21 L -132 -21 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.85,
    }),
    svgEl('circle', { cx: -126, cy: -60.5, r: 1, fill: c.ironHighlight }),
    svgEl('circle', { cx: -126, cy: -22.5, r: 1, fill: c.ironHighlight }),

    // Warm glowing heart-shaped door pane + soft optical halo when lit
    windowLit
      ? svgEl('circle', {
          cx: -106,
          cy: -55,
          r: 17,
          fill: svgUrl(lightSpillId),
          filter: softGlowFilter,
          opacity: 0.9,
        })
      : '',
    celPath(
      'M -106 -58 C -109 -63, -116 -62, -115 -56 L -106 -47 L -97 -56 C -96 -62, -103 -63, -106 -58 Z',
      windowLit ? svgUrl(windowGlowId) : c.nightcapShadow,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    // Layered evergreen welcome wreath & crimson bow around heart pane
    svgEl('circle', {
      cx: -106,
      cy: -55,
      r: 12.2,
      fill: 'none',
      stroke: c.foliageShadow,
      'stroke-width': 4.4,
    }),
    svgEl('circle', {
      cx: -106,
      cy: -55,
      r: 12.2,
      fill: 'none',
      stroke: c.foliageLit,
      'stroke-width': 2.6,
      'stroke-dasharray': '5 3',
    }),
    svgEl('circle', {
      cx: -106,
      cy: -55,
      r: 12.2,
      fill: 'none',
      stroke: c.foliageRim,
      'stroke-width': 1.2,
      'stroke-dasharray': '2 7',
      opacity: 0.8,
    }),
    celPath(
      'M -106 -67 L -111 -70 L -109 -64 Z M -106 -67 L -101 -70 L -103 -64 Z',
      c.mochiCollar,
      { stroke: c.xeroxInk, strokeWidth: 0.8 }
    ),
    svgEl('circle', {
      cx: -106,
      cy: -67,
      r: 2.2,
      fill: c.flowerRose,
      ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: 0.8 }),
    }),
    // Gleaming brass doorknob
    svgEl('circle', {
      cx: -87,
      cy: -36,
      r: 3.3,
      fill: c.mochiGold,
      ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: s.sketchLine }),
    }),
    svgEl('circle', {
      cx: -88,
      cy: -37.1,
      r: 1.1,
      fill: c.mochiGoldHighlight,
    }),

    // Two-tier carved cobblestone doorstep
    celPath('M -142 0 L -70 0 L -74 -6 L -138 -6 Z', c.stoneShadow, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M -136 -6 L -76 -6 L -79 -11 L -133 -11 Z', c.stoneBase, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('path', {
      d: 'M -132 -10 L -80 -10',
      fill: 'none',
      stroke: windowLit ? c.warmAmberGlow : c.stoneLight,
      'stroke-width': 1.6,
      'stroke-linecap': 'round',
      opacity: windowLit ? 0.52 : 0.45,
    }),
  ]);

  // 4. Large Mullioned Bedroom Window, Teal Louvered Shutters, Warm Light Spill & Flower Box
  const bedroomWindow = svgEl('g', { 'data-part': 'bedroom-window' }, [
    // Warm golden radial light spill bathed across the wall & shutters when lit
    windowLit
      ? svgEl('ellipse', {
          cx: 47,
          cy: -64,
          rx: 92,
          ry: 64,
          fill: svgUrl(lightSpillId),
          filter: softGlowFilter,
          opacity: 0.95,
        })
      : '',

    // Left louvered teal shutter
    celPath('M -30 -104 L -13 -104 L -13 -28 L -30 -28 Z', c.cottageShutter, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M -30 -104 L -23 -104 L -23 -28 L -30 -28 Z',
      fill: c.cottageShutterShadow,
      opacity: 0.55,
    }),
    svgEl('path', {
      d: [
        'M -28 -95 L -15 -95',
        'M -28 -86 L -15 -86',
        'M -28 -77 L -15 -77',
        'M -28 -68 L -15 -68',
        'M -28 -59 L -15 -59',
        'M -28 -50 L -15 -50',
        'M -28 -41 L -15 -41',
      ].join(' '),
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.cottageShutterShadow,
        strokeWidth: 1.4,
        opacity: 0.85,
      }),
    }),
    // Right louvered teal shutter
    celPath('M 107 -104 L 124 -104 L 124 -28 L 107 -28 Z', c.cottageShutter, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxMedium,
    }),
    svgEl('path', {
      d: 'M 117 -104 L 124 -104 L 124 -28 L 117 -28 Z',
      fill: c.cottageShutterShadow,
      opacity: 0.65,
    }),
    svgEl('path', {
      d: [
        'M 109 -95 L 122 -95',
        'M 109 -86 L 122 -86',
        'M 109 -77 L 122 -77',
        'M 109 -68 L 122 -68',
        'M 109 -59 L 122 -59',
        'M 109 -50 L 122 -50',
        'M 109 -41 L 122 -41',
      ].join(' '),
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.cottageShutterShadow,
        strokeWidth: 1.4,
        opacity: 0.85,
      }),
    }),
    // Warm amber grazing rim on inner shutter edges when window is lit
    windowLit
      ? svgEl('path', {
          d: 'M -14 -102 L -14 -30 M 108 -102 L 108 -30',
          fill: 'none',
          stroke: c.warmAmberGlow,
          'stroke-width': 1.8,
          'stroke-linecap': 'round',
          opacity: 0.65,
        })
      : '',

    // Window interior pane backdrop
    svgEl('path', {
      d: 'M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z',
      fill: windowLit ? svgUrl(windowGlowId) : c.nightSkyZenith,
      stroke: 'none',
    }),
    // Cozy bedroom quilt / sill band inside bottom of window
    celPath(
      'M -10 -46 Q 47 -50, 104 -46 L 104 -26 L -10 -26 Z',
      windowLit ? c.nightcapBlue : c.nightSkyMid,
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }
    ),
    svgEl('path', {
      d: 'M -8 -31 L 102 -45 M -6 -44 L 54 -28',
      fill: 'none',
      stroke: windowLit ? c.nightcapStripe : c.nightcapShadow,
      'stroke-width': 2.6,
      'stroke-linecap': 'round',
      opacity: windowLit ? 0.55 : 0.35,
    }),
    // Softly draped storybook curtains framing left & right of window
    celPath(
      'M -12 -106 L 26 -106 Q 17 -74, 6 -46 L -12 -46 Z',
      windowLit ? c.flowerRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M -6 -105 Q 0 -76, -6 -48 M 8 -105 Q 11 -78, 1 -48',
      fill: 'none',
      stroke: c.cottageRoof,
      'stroke-width': 1.2,
      opacity: 0.55,
    }),
    celPath(
      'M 106 -106 L 68 -106 Q 77 -74, 88 -46 L 106 -46 Z',
      windowLit ? c.flowerRose : c.cottageRoofShadow,
      { stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
    ),
    svgEl('path', {
      d: 'M 100 -105 Q 94 -76, 100 -48 M 86 -105 Q 83 -78, 93 -48',
      fill: 'none',
      stroke: c.cottageRoof,
      'stroke-width': 1.2,
      opacity: 0.55,
    }),
    // Cool moonlit glass specular streaks when window is unlit
    !windowLit
      ? svgEl('path', {
          d: 'M 14 -98 L 42 -70 M 26 -98 L 46 -78 M 56 -64 L 82 -38',
          fill: 'none',
          stroke: c.waterHighlight,
          'stroke-width': 1.6,
          'stroke-linecap': 'round',
          opacity: 0.35,
        })
      : '',

    // Mullioned window crossbars (classic 3x2 timber panes)
    svgEl('path', {
      d: 'M 27 -106 L 27 -26 M 67 -106 L 67 -26 M -12 -68 L 106 -68',
      fill: 'none',
      ...celStrokeAttrs({ stroke: c.woodDark, strokeWidth: 2.6 }),
    }),
    svgEl('path', {
      d: 'M 27 -106 L 27 -26 M 67 -106 L 67 -26 M -12 -68 L 106 -68',
      fill: 'none',
      ...celStrokeAttrs({ stroke: c.xeroxInk, strokeWidth: 0.9 }),
    }),
    // Outer carved timber window frame
    celPath('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', 'none', {
      stroke: c.woodDark,
      strokeWidth: 4.4,
    }),
    celPath('M -12 -106 L 106 -106 L 106 -26 L -12 -26 Z', 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),

    // Overflowing Wooden Window Flower Box (`data-part="flower-boxes"`)
    svgEl('g', { 'data-part': 'flower-boxes' }, [
      // Soft cast shadow beneath flower box
      svgEl('path', {
        d: 'M -14 -13 L 108 -13 L 104 -8 L -10 -8 Z',
        fill: c.nightSkyZenith,
        opacity: 0.34,
      }),
      // Tapered painted walnut flower trough
      celPath('M -18 -26 L 112 -26 L 107 -13 L -13 -13 Z', c.woodMid, {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.xeroxMedium,
      }),
      svgEl('path', {
        d: 'M -15 -19 L 109 -19 L 107 -13 L -13 -13 Z',
        fill: c.woodDark,
        opacity: 0.62,
      }),
      // Layered emerald foliage tufts
      gouachePath(
        'M -14 -25 Q -2 -37, 10 -26 Q 24 -38, 38 -26 Q 52 -38, 66 -26 Q 80 -38, 94 -26 Q 104 -35, 110 -25 Z',
        c.foliageShadow,
        { softEdge: false, stroke: c.xeroxInkSoft, strokeWidth: s.xeroxFine }
      ),
      gouachePath(
        'M -10 -26 Q 0 -34, 12 -26 Q 26 -35, 40 -26 Q 54 -35, 68 -26 Q 82 -35, 96 -26 Q 104 -33, 108 -26 Z',
        c.foliageLit,
        { softEdge: false, opacity: 0.9 }
      ),
      // Painterly storybook blossoms warmed by window glow
      svgEl('circle', {
        cx: -2,
        cy: -29,
        r: 4.2,
        fill: c.flowerRose,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('circle', {
        cx: 18,
        cy: -31,
        r: 4.5,
        fill: windowLit ? c.warmAmberGlow : c.flowerCream,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('circle', {
        cx: 38,
        cy: -29,
        r: 4.2,
        fill: c.flowerBlue,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('circle', {
        cx: 58,
        cy: -31,
        r: 4.5,
        fill: c.flowerRose,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('circle', {
        cx: 78,
        cy: -29,
        r: 4.2,
        fill: windowLit ? c.warmAmberCore : c.flowerCream,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
      svgEl('circle', {
        cx: 96,
        cy: -30,
        r: 4.2,
        fill: c.flowerBlue,
        ...celStrokeAttrs({ stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine }),
      }),
    ]),
  ]);

  // 5. Right-Side Wooden Climbing Ladder (`data-part="ladder"`)
  const ladder = showLadder
    ? svgEl('g', { 'data-part': 'ladder' }, [
        // Subtle cast shadow behind ladder rails on wall
        svgEl('path', {
          d: 'M 129 0 L 129 -132 M 149 0 L 149 -132',
          fill: 'none',
          stroke: c.nightSkyZenith,
          'stroke-width': 3.2,
          'stroke-linecap': 'round',
          opacity: 0.28,
        }),
        // Two chamfered walnut rails
        svgEl('path', {
          d: 'M 126 0 L 126 -134 M 146 0 L 146 -134',
          fill: 'none',
          stroke: c.woodDark,
          'stroke-width': 4.2,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: 'M 125.5 0 L 125.5 -134 M 145.5 0 L 145.5 -134',
          fill: 'none',
          stroke: c.woodLit,
          'stroke-width': 1.5,
          'stroke-linecap': 'round',
          opacity: 0.72,
        }),
        // 6 horizontal wooden rungs
        svgEl('path', {
          d: [
            'M 126 -18 L 146 -18',
            'M 126 -38 L 146 -38',
            'M 126 -58 L 146 -58',
            'M 126 -78 L 146 -78',
            'M 126 -98 L 146 -98',
            'M 126 -118 L 146 -118',
          ].join(' '),
          fill: 'none',
          stroke: c.woodMid,
          'stroke-width': 3.0,
          'stroke-linecap': 'round',
        }),
        svgEl('path', {
          d: [
            'M 126 -18 L 146 -18',
            'M 126 -38 L 146 -38',
            'M 126 -58 L 146 -58',
            'M 126 -78 L 146 -78',
            'M 126 -98 L 146 -98',
            'M 126 -118 L 146 -118',
          ].join(' '),
          fill: 'none',
          ...celStrokeAttrs({
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
            opacity: 0.85,
          }),
        }),
      ])
    : '';

  // 6. Storybook Shingled Roof with Moonlit Ridge, Layered Gouache Planes & Carved Bargeboard
  const mainRoofD =
    'M -108 -208 L 136 -208 L 168 -126 Q 150 -116, 132 -126 Q 114 -116, 96 -126 Q 78 -116, 60 -126 Q 42 -116, 24 -126 Q 6 -116, -12 -126 Q -30 -116, -45 -126 L -106 -188 Z';
  const gableRoofD =
    'M -176 -114 L -106 -194 L -38 -114 L -46 -108 L -106 -178 L -168 -108 Z';

  const roof = svgEl('g', { 'data-part': 'roof' }, [
    // Main terracotta roof with 2-tone gouache shading & moonlit ridge highlight
    celShadedShape({
      d: mainRoofD,
      baseFill: svgUrl(roofGradId),
      shadowPaths: [
        'M -52 -148 L 164 -148 L 170 -114 L -50 -114 Z',
        'M 72 -208 L 140 -208 L 170 -124 L 94 -124 Z',
      ],
      shadowFill: c.cottageRoofShadow,
      shadowOpacity: 0.45,
      highlightPaths: [
        'M -108 -208 L 136 -208 L 142 -198 L -98 -198 Z',
      ],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.24,
      clipId: roofClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Hand-inked sketchy shingle courses & vertical shingle tabs
    svgEl('path', {
      d: [
        'M -84 -192 Q -62 -184, -40 -192 T 4 -192 T 48 -192 T 92 -192 T 134 -192',
        'M -68 -174 Q -46 -166, -24 -174 T 20 -174 T 64 -174 T 108 -174 T 146 -174',
        'M -52 -156 Q -30 -148, -8 -156 T 36 -156 T 80 -156 T 124 -156 T 156 -156',
        'M -38 -138 Q -16 -130, 6 -138 T 50 -138 T 94 -138 T 138 -138 T 164 -138',
      ].join(' '),
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        opacity: 0.72,
      }),
    }),
    // Sketchy individual shingle vertical breaks for hand-inked Disney texture
    svgEl('path', {
      d: [
        'M -54 -192 L -50 -174 M -12 -192 L -8 -174 M 32 -192 L 36 -174 M 76 -192 L 80 -174 M 114 -192 L 118 -174',
        'M -34 -174 L -30 -156 M 10 -174 L 14 -156 M 54 -174 L 58 -156 M 98 -174 L 102 -156',
        'M -18 -156 L -14 -138 M 26 -156 L 30 -138 M 70 -156 L 74 -138 M 114 -156 L 118 -138',
      ].join(' '),
      fill: 'none',
      ...celStrokeAttrs({
        stroke: c.xeroxInkSoft,
        strokeWidth: 0.85,
        opacity: 0.55,
      }),
    }),

    // Left gable roof overhang with moonlit left slope & carved cream bargeboard trim
    celShadedShape({
      d: gableRoofD,
      baseFill: c.cottageRoof,
      shadowPaths: ['M -106 -194 L -38 -114 L -46 -108 L -106 -178 Z'],
      shadowFill: c.cottageRoofShadow,
      shadowOpacity: 0.58,
      highlightPaths: ['M -176 -114 L -106 -194 L -106 -187 L -170 -112 Z'],
      highlightFill: c.stoneLight,
      highlightOpacity: 0.28,
      clipId: gableRoofClipId,
      stroke: c.xeroxInkSoft,
      strokeWidth: s.xeroxHeavy,
    }),
    // Carved cream timber bargeboard trim under gable overhang
    svgEl('path', {
      d: 'M -167 -109 L -106 -179 L -45 -109',
      fill: 'none',
      stroke: c.mochiCream,
      'stroke-width': 2.2,
      'stroke-dasharray': '5 3.5',
      'stroke-linecap': 'round',
      opacity: 0.85,
    }),
    // Tiny carved wooden finial peg at gable peak
    celPath('M -108 -193 L -104 -193 L -106 -202 Z', c.woodLit, {
      stroke: c.xeroxInkSoft,
      strokeWidth: s.sketchLine,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-building': 'ochre_cottage',
      'data-art-style': 'classic_cel',
    },
    [defs, groundShadow, chimney, walls, leftWingDetails, bedroomWindow, ladder, roof]
  );
}

import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedLoopProgress, steppedOscillate } from '../../../engine/clock';
import {
  celContactShadow,
  celPath,
  celShadedShape,
  deterministicJitter,
  gouachePath,
  pencilFoliageScribbles,
  round2,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders the Classic 1970s–1980s Disney Victorian brick-and-timber hearth fireplace
 * (`'hearth_fireplace'`) for *"Barnaby's Christmas Hearth"*.
 *
 * Crafted in authentic *Mickey's Christmas Carol* (1983) / *Robin Hood* (1973) style:
 * - Weathered terracotta/russet wet-on-wet watercolor brickwork (`watercolorWashBlotches`)
 *   with loose sketchy sepia mortar joints & carved oak mantel grain (`xeroxSketchStroke`)
 * - Dark cast-iron grate & brass-tipped andirons, wooden mantle clock, brass candlesticks,
 *   lush watercolor + pencil holly garland (`pencilFoliageScribbles`), and two knitted
 *   crimson stockings
 * - `lit: false`: cold ash, unlit charred logs, and a faint grey wisp
 * - `lit: true`: roaring 12 FPS flat-cel amber/orange/cream flames, rising ember sparks,
 *   flickering mantel candles, and soft warm ochre watercolor firelight wash spilling
 *   onto the brick hearth & flagstones (zero digital gradients or neon glow rings!)
 *
 * Local origin `(0, 0)` at floor center; bounds `~x: -102..102, y: -168..6`.
 */
export function renderClassicHearthFireplace(options: PropRenderOptions): string {
  const { frameIndex = 0, lit = true, variant = 1, id } = options;

  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const safeSuffix = id
    ? `-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
    : variant !== 1
    ? `-v${variant}`
    : '';
  const pid = (name: string): string => `cc-hearth-${name}${safeSuffix}`;

  const chimneyClipId = pid('chimney-clip');
  const surroundClipId = pid('surround-clip');
  const mantelClipId = pid('mantel-clip');
  const hearthApronClipId = pid('apron-clip');
  const fireboxClipId = pid('firebox-clip');

  const chimneyBreastD = 'M -66 -168 L 66 -168 L 66 -116 L -66 -116 Z';
  const brickSurroundD = 'M -86 -116 L 86 -116 L 86 -6 L -86 -6 Z';
  const mantelShelfD =
    'M -98 -123 L 98 -123 L 96 -112 L 88 -108 L -88 -108 L -96 -112 Z';
  const hearthApronD = 'M -96 -8 L 96 -8 L 100 4 L -100 4 Z';
  const fireboxD = 'M -44 -6 L -44 -66 Q -44 -86, 0 -86 Q 44 -86, 44 -66 L 44 -6 Z';

  const clipDefs = svgEl('defs', {}, [
    svgEl('clipPath', { id: chimneyClipId }, svgEl('path', { d: chimneyBreastD })),
    svgEl('clipPath', { id: surroundClipId }, svgEl('path', { d: brickSurroundD })),
    svgEl('clipPath', { id: mantelClipId }, svgEl('path', { d: mantelShelfD })),
    svgEl('clipPath', { id: hearthApronClipId }, svgEl('path', { d: hearthApronD })),
    svgEl('clipPath', { id: fireboxClipId }, svgEl('path', { d: fireboxD })),
  ]);

  // Subtle 12 FPS organic flicker amplitude for firelight washes & flames
  const firePulse = steppedOscillate(frameIndex, 10, 1, variant);
  const fireFlutter = steppedOscillate(frameIndex, 6, 1, variant + 2);

  // 1. Flagstone Hearth Floor Apron & Grounding Shadow (`data-part="hearth-floor"`)
  const hearthFloor = svgEl('g', { 'data-part': 'hearth-floor' }, [
    celContactShadow(0, 3.5, 98, 4.2, 0.34),
    gouachePath(hearthApronD, c.stoneBase, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(hearthApronClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -62, cy: -2, rx: 34, ry: 7, fill: c.stoneShadow, opacity: 0.65 },
          { cx: 0, cy: -2, rx: 42, ry: 8, fill: c.stoneLight, opacity: 0.42 },
          { cx: 64, cy: -1, rx: 36, ry: 7, fill: c.stoneShadow, opacity: 0.7 },
        ],
        { seed: 11 }
      ),
      lit
        ? watercolorWashBlotches(
            [
              {
                cx: 0,
                cy: -2,
                rx: round2(56 + firePulse * 4),
                ry: 9,
                fill: c.warmAmberGlow,
                opacity: round2(0.36 + fireFlutter * 0.05),
              },
              {
                cx: 0,
                cy: -3,
                rx: round2(34 + fireFlutter * 3),
                ry: 6.5,
                fill: c.warmAmberCore,
                opacity: 0.32,
              },
            ],
            { seed: 13 }
          )
        : '',
    ]),
    xeroxSketchStroke(
      `${hearthApronD} M -56 -8 L -59 4 M -18 -8 L -20 4 M 22 -8 L 24 4 M 60 -8 L 63 4`,
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
        broken: true,
        opacity: 0.88,
      }
    ),
  ]);

  // 2. Weathered Brick Chimney Breast & Fireplace Surround (`data-part="brick-surround"`)
  const brickSurround = svgEl('g', { 'data-part': 'brick-surround' }, [
    // Upper brick chimney breast behind mantel
    gouachePath(chimneyBreastD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(chimneyClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -40, cy: -146, rx: 32, ry: 24, fill: c.russetEarth, opacity: 0.58 },
          { cx: 28, cy: -144, rx: 36, ry: 26, fill: c.cottageRoofShadow, opacity: 0.68 },
          { cx: -6, cy: -160, rx: 46, ry: 14, fill: c.pathEarthDark, opacity: 0.42 },
        ],
        { seed: 19 }
      ),
    ]),
    xeroxSketchStroke(
      [
        chimneyBreastD,
        'M -65 -154 L 65 -154 M -65 -140 L 65 -140 M -65 -127 L 65 -127',
        'M -42 -168 L -42 -154 M 12 -168 L 12 -154 M -18 -154 L -18 -140 M 36 -154 L 36 -140 M -44 -140 L -44 -127 M 14 -140 L 14 -127',
      ].join(' '),
      { stroke: c.xeroxInkSoft, strokeWidth: s.sketchLine, broken: true, opacity: 0.72 }
    ),

    // Main brick fireplace surround & piers
    gouachePath(brickSurroundD, c.cottageRoof, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(surroundClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -66, cy: -64, rx: 26, ry: 52, fill: c.russetEarth, opacity: 0.62 },
          { cx: 66, cy: -60, rx: 28, ry: 54, fill: c.cottageRoofShadow, opacity: 0.72 },
          { cx: 0, cy: -98, rx: 52, ry: 18, fill: c.cottageRoofShadow, opacity: 0.52 },
          { cx: -54, cy: -24, rx: 24, ry: 24, fill: c.ochreEarth, opacity: 0.34 },
          { cx: 58, cy: -22, rx: 24, ry: 24, fill: c.pathEarthDark, opacity: 0.45 },
          // Subtle hearth soot darkening directly above firebox arch
          { cx: 0, cy: -86, rx: 38, ry: 11, fill: c.backdropDark, opacity: 0.44 },
        ],
        { seed: 23 }
      ),
      // Soft warm watercolor firelight glow bouncing onto brick piers when lit
      lit
        ? watercolorWashBlotches(
            [
              {
                cx: -46,
                cy: -48,
                rx: 24,
                ry: 38,
                fill: c.warmAmberWash,
                opacity: round2(0.32 + firePulse * 0.05),
              },
              {
                cx: 46,
                cy: -48,
                rx: 24,
                ry: 38,
                fill: c.warmAmberWash,
                opacity: round2(0.32 - firePulse * 0.04),
              },
              {
                cx: 0,
                cy: -92,
                rx: 46,
                ry: 16,
                fill: c.warmAmberGlow,
                opacity: round2(0.24 + fireFlutter * 0.04),
              },
            ],
            { seed: 29 }
          )
        : '',
    ]),
    // Loose sketchy sepia brick courses & vertical joints
    xeroxSketchStroke(
      [
        brickSurroundD,
        'M -85 -98 L 85 -98',
        'M -85 -84 L -42 -84 M 42 -84 L 85 -84',
        'M -85 -68 L -44 -68 M 44 -68 L 85 -68',
        'M -85 -52 L -44 -52 M 44 -52 L 85 -52',
        'M -85 -36 L -44 -36 M 44 -36 L 85 -36',
        'M -85 -20 L -44 -20 M 44 -20 L 85 -20',
        'M -66 -98 L -66 -84 M -58 -68 L -58 -52 M -72 -52 L -72 -36 M -60 -36 L -60 -20',
        'M 64 -98 L 64 -84 M 58 -68 L 58 -52 M 70 -52 L 70 -36 M 60 -36 L 60 -20',
        'M -24 -108 L -24 -98 M 24 -108 L 24 -98',
      ].join(' '),
      {
        stroke: c.xeroxInkSoft,
        strokeWidth: s.sketchLine,
        broken: true,
        feather: true,
        opacity: 0.78,
      }
    ),
  ]);

  // 3. Recessed Arched Firebox, Cast-Iron Grate, Andirons, Logs & Cold Ash / Roaring 12 FPS Fire
  const renderLitFlames = (): string => {
    const j1 = deterministicJitter(frameIndex * 3 + 1, variant, 3.2);
    const j2 = deterministicJitter(frameIndex * 5 + 2, variant, 3.8);
    const j3 = deterministicJitter(frameIndex * 7 + 3, variant, 2.8);
    const tipY1 = round2(-68 - firePulse * 4.5 + j1 * 0.6);
    const tipY2 = round2(-74 + fireFlutter * 5.2 + j2 * 0.5);
    const tipY3 = round2(-63 + firePulse * 4.0 + j3 * 0.6);

    // 3 overlapping hand-drawn flat-cel flame layers (outer burnt-amber, mid golden, inner cream core)
    const outerFlameD = `M -28 -22 C -34 -38, -26 -54, ${round2(-18 + j1)} ${tipY1} C -13 -54, -9 -46, -6 -52 C -4 -62, ${round2(2 + j2)} ${tipY2}, ${round2(6 + j2 * 0.5)} ${tipY2} C 11 -56, 13 -48, 17 -54 C 22 -60, ${round2(24 + j3)} ${tipY3}, 28 -44 C 33 -34, 30 -24, 24 -20 Z`;
    const midFlameD = `M -21 -21 C -25 -34, -18 -46, ${round2(-12 + j1 * 0.7)} ${round2(tipY1 + 9)} C -8 -44, -4 -40, -2 -46 C 0 -54, ${round2(3 + j2 * 0.7)} ${round2(tipY2 + 10)}, 8 -46 C 12 -42, 16 -48, ${round2(19 + j3 * 0.6)} ${round2(tipY3 + 8)} C 23 -36, 22 -24, 18 -20 Z`;
    const coreFlameD = `M -12 -21 C -14 -30, -8 -38, ${round2(-2 + j2 * 0.5)} ${round2(tipY2 + 24)} C 4 -38, 10 -34, ${round2(11 + j3 * 0.4)} -26 C 13 -22, 10 -20, 6 -20 Z`;

    // 4 rising 12 FPS golden ember sparks dancing up into the firebox
    const embers = [0, 1, 2, 3].map((i) => {
      const t = steppedLoopProgress(frameIndex, 14, i * 4 + variant);
      const ex = round2(
        (-16 + i * 11) + steppedOscillate(frameIndex, 10, 4.5, i * 3 + variant)
      );
      const ey = round2(-38 - t * 40);
      const er = round2(1.7 * (1 - t * 0.55));
      return svgEl('circle', {
        cx: ex,
        cy: ey,
        r: er,
        fill: i % 2 === 0 ? c.warmAmberCore : c.warmAmberGlow,
        opacity: round2(0.92 * (1 - t * 0.75)),
      });
    });

    return svgEl('g', { 'data-part': 'hearth-flames' }, [
      // Soft wet-on-wet warm firelight puddle behind dancing cel flames (NO neon blur!)
      watercolorWashBlotches(
        [
          {
            cx: 0,
            cy: -44,
            rx: round2(34 + firePulse * 3),
            ry: round2(28 + fireFlutter * 2),
            fill: c.warmAmberWash,
            opacity: 0.42,
          },
          {
            cx: 0,
            cy: -38,
            rx: 22,
            ry: 20,
            fill: c.warmAmberGlow,
            opacity: 0.36,
          },
        ],
        { seed: 31 }
      ),
      celPath(outerFlameD, c.warmAmberWash, {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      celPath(midFlameD, c.warmAmberGlow, {
        stroke: c.cottageRoof,
        strokeWidth: 0.9,
      }),
      svgEl('path', { d: coreFlameD, fill: c.warmAmberCore }),
      ...embers,
    ]);
  };

  const renderColdAsh = (): string => {
    const wispShift = steppedOscillate(frameIndex, 36, 2.2, variant);
    return svgEl('g', { 'data-part': 'cold-ash' }, [
      // Cold ash mound under unlit logs
      gouachePath(
        'M -28 -10 Q -14 -18, 0 -15 Q 16 -19, 28 -10 Z',
        c.stoneBase,
        { softEdge: false }
      ),
      // Faint cold grey wisp drifting lazily upward
      watercolorWashBlotches(
        [
          {
            cx: round2(-4 + wispShift * 0.5),
            cy: -42,
            rx: 10,
            ry: 8,
            fill: c.stoneLight,
            opacity: 0.16,
          },
          {
            cx: round2(3 - wispShift * 0.7),
            cy: -58,
            rx: 12,
            ry: 9,
            fill: c.stoneLight,
            opacity: 0.12,
          },
        ],
        { seed: 37 }
      ),
      xeroxSketchStroke(
        `M -2 -28 Q ${round2(-8 + wispShift)} -44, ${round2(3 - wispShift * 0.5)} -62`,
        {
          stroke: c.stoneLight,
          strokeWidth: 1.0,
          broken: true,
          opacity: 0.34,
        }
      ),
    ]);
  };

  const firebox = svgEl('g', { 'data-part': 'firebox' }, [
    // Deep recessed firebox arch
    gouachePath(fireboxD, c.backdropDark, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(fireboxClipId) }, [
      watercolorWashBlotches(
        lit
          ? [
              { cx: 0, cy: -42, rx: 42, ry: 34, fill: c.cottageRoofShadow, opacity: 0.65 },
              { cx: 0, cy: -36, rx: 32, ry: 26, fill: c.warmAmberDeep, opacity: 0.55 },
            ]
          : [
              { cx: -14, cy: -46, rx: 28, ry: 28, fill: c.ironDark, opacity: 0.65 },
              { cx: 16, cy: -36, rx: 26, ry: 24, fill: c.nightSkyZenith, opacity: 0.48 },
            ],
        { seed: 41 }
      ),
    ]),
    // Stone arch voussoir trim framing firebox opening
    xeroxSketchStroke(fireboxD, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxHeavy,
      opacity: 0.94,
    }),

    // Charred firewood logs resting in grate
    celPath(
      'M -30 -20 L 24 -26 Q 29 -23, 26 -17 L -28 -12 Q -33 -16, -30 -20 Z',
      c.woodDark,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    celPath(
      'M -24 -13 L 30 -18 Q 34 -15, 31 -10 L -22 -7 Q -27 -10, -24 -13 Z',
      c.woodMid,
      { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
    ),
    xeroxSketchStroke('M -22 -17 L 18 -21 M -14 -11 L 22 -14', {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
      broken: true,
      opacity: 0.7,
    }),

    // Flames when lit, cold ash & wisp when unlit
    lit ? renderLitFlames() : renderColdAsh(),

    // Dark cast-iron front grate bars & brass-topped Victorian andirons
    celPath('M -32 -14 L 32 -14 L 30 -10 L -30 -10 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke(
      'M -22 -18 L -22 -7 M -11 -18 L -11 -7 M 0 -18 L 0 -7 M 11 -18 L 11 -7 M 22 -18 L 22 -7',
      { stroke: c.ironDark, strokeWidth: 2.2, opacity: 0.96 }
    ),
    // Left & right andiron posts with antique brass ball finials
    celPath('M -35 -6 L -31 -6 L -32 -28 L -34 -28 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.9,
    }),
    svgEl('circle', {
      cx: -33,
      cy: -30,
      r: 3.4,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 1.0,
    }),
    celPath('M 31 -6 L 35 -6 L 34 -28 L 32 -28 Z', c.ironDark, {
      stroke: c.xeroxInk,
      strokeWidth: 0.9,
    }),
    svgEl('circle', {
      cx: 33,
      cy: -30,
      r: 3.4,
      fill: c.antiqueGold,
      stroke: c.xeroxInk,
      'stroke-width': 1.0,
    }),
  ]);

  // 4. Carved Oak Mantel Shelf, Clock, Candlesticks, Holly Garland & Knitted Stockings
  const renderMantelCandle = (cx: number, phaseOffset: number): string => {
    const flameTip = round2(-148 - steppedOscillate(frameIndex, 8, 1.8, phaseOffset));
    const flameSway = steppedOscillate(frameIndex, 10, 1.1, phaseOffset + 2);
    return svgEl('g', {}, [
      // Brass candlestick holder
      celPath(
        `M ${cx - 7} -123 L ${cx + 7} -123 L ${cx + 4} -127 L ${cx - 4} -127 Z`,
        c.antiqueGold,
        { stroke: c.xeroxInk, strokeWidth: 0.9 }
      ),
      celPath(
        `M ${cx - 2} -127 L ${cx + 2} -127 L ${cx + 2} -135 L ${cx - 2} -135 Z`,
        c.antiqueGold,
        { stroke: c.xeroxInk, strokeWidth: 0.85 }
      ),
      // Cream wax candle body
      celPath(
        `M ${cx - 2.6} -135 L ${cx + 2.6} -135 L ${cx + 2.4} -144 L ${cx - 2.4} -144 Z`,
        c.parchmentCream,
        { stroke: c.xeroxInkSoft, strokeWidth: 0.85 }
      ),
      // 12 FPS hand-drawn flame & tiny warm ochre wash when lit
      lit
        ? svgEl('g', {}, [
            watercolorWashBlotches(
              [{ cx, cy: -148, rx: 8.5, ry: 7.5, fill: c.warmAmberGlow, opacity: 0.3 }],
              { seed: Math.abs(cx) + 5 }
            ),
            celPath(
              `M ${cx} -144 C ${cx - 2.8} -145, ${cx - 2.4} -149, ${round2(cx + flameSway)} ${flameTip} C ${cx + 2.4} -149, ${cx + 2.8} -145, ${cx} -144 Z`,
              c.warmAmberGlow,
              { stroke: c.xeroxInkSoft, strokeWidth: 0.7 }
            ),
            svgEl('circle', { cx, cy: -146.2, r: 1.2, fill: c.warmAmberCore }),
          ])
        : xeroxSketchStroke(`M ${cx} -144 L ${cx} -146.5`, {
            stroke: c.xeroxInk,
            strokeWidth: 0.9,
          }),
    ]);
  };

  const renderStocking = (cx: number, tilt: number): string => {
    const dir = tilt >= 0 ? 1 : -1;
    const sockD = `M ${cx - 8} -106 L ${cx + 8} -106 L ${cx + 8} -78 C ${cx + 8} -70, ${cx + dir * 16} -70, ${cx + dir * 16} -63 C ${cx + dir * 16} -56, ${cx + dir * 4} -55, ${cx - dir * 7} -60 C ${cx - dir * 10} -62, ${cx - 9} -68, ${cx - 8} -78 Z`;
    return svgEl('g', {}, [
      celShadedShape({
        d: sockD,
        baseFill: c.mochiCollar,
        shadowPaths: [
          `M ${cx + 1} -106 L ${cx + 18} -106 L ${cx + 18} -54 L ${cx + 1} -54 Z`,
        ],
        shadowFill: c.mochiCollarShadow,
        shadowOpacity: 0.45,
        clipId: pid(`stocking-${cx < 0 ? 'l' : 'r'}-clip`),
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxFine,
      }),
      // Fluffy parchment cuff
      celPath(
        `M ${cx - 10} -109 Q ${cx} -111, ${cx + 10} -109 L ${cx + 9.5} -101 Q ${cx} -99.5, ${cx - 9.5} -101 Z`,
        c.parchmentCream,
        { stroke: c.xeroxInk, strokeWidth: s.xeroxFine }
      ),
      // Sketchy knitted zigzag & heel stitches
      xeroxSketchStroke(
        `M ${cx - 6} -94 L ${cx + 6} -94 M ${cx - 6} -84 L ${cx + 6} -84 M ${cx - 4} -72 L ${cx + 5} -72`,
        {
          stroke: c.parchmentCream,
          strokeWidth: 1.0,
          dasharray: '2.5 2.5',
          opacity: 0.72,
        }
      ),
    ]);
  };

  const mantel = svgEl('g', { 'data-part': 'mantel' }, [
    // Carved wooden brackets under mantel ends
    celPath('M -88 -108 L -76 -108 L -78 -96 Q -84 -98, -88 -108 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    celPath('M 76 -108 L 88 -108 Q 84 -98, 78 -96 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Sturdy carved walnut mantel shelf with wet-on-wet wood mottling
    gouachePath(mantelShelfD, c.woodMid, { softEdge: false }),
    svgEl('g', { 'clip-path': svgUrl(mantelClipId) }, [
      watercolorWashBlotches(
        [
          { cx: -48, cy: -118, rx: 44, ry: 8, fill: c.woodLit, opacity: 0.55 },
          { cx: 46, cy: -114, rx: 48, ry: 9, fill: c.woodDark, opacity: 0.65 },
          { cx: 0, cy: -110, rx: 92, ry: 5, fill: c.woodDark, opacity: 0.58 },
        ],
        { seed: 47 }
      ),
    ]),
    xeroxSketchStroke(
      `${mantelShelfD} M -92 -117 L 92 -117 M -76 -112 L 76 -112`,
      {
        stroke: c.xeroxInk,
        strokeWidth: s.xeroxMedium,
        broken: false,
        feather: true,
        opacity: 0.92,
      }
    ),

    // Victorian domed wooden clockmaker's mantle clock centered at (0, -142)
    celShadedShape({
      d: 'M -21 -123 L -19 -148 C -19 -160, -10 -164, 0 -164 C 10 -164, 19 -160, 19 -148 L 21 -123 Z',
      baseFill: c.woodMid,
      shadowPaths: ['M 4 -165 L 23 -165 L 23 -122 L 2 -122 Z'],
      shadowFill: c.woodDark,
      shadowOpacity: 0.62,
      clipId: pid('clock-clip'),
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    svgEl('circle', {
      cx: 0,
      cy: -144,
      r: 11.2,
      fill: c.parchmentCream,
      stroke: c.antiqueGold,
      'stroke-width': 2.0,
    }),
    svgEl('circle', {
      cx: 0,
      cy: -144,
      r: 11.8,
      fill: 'none',
      stroke: c.xeroxInk,
      'stroke-width': 0.9,
    }),
    // Tiny inked clock ticks & hands near midnight (Christmas Eve!)
    xeroxSketchStroke(
      'M 0 -153 L 0 -151 M 9 -144 L 7 -144 M 0 -135 L 0 -137 M -9 -144 L -7 -144 M 0 -144 L -2.5 -150.5 M 0 -144 L 1.5 -151.5',
      { stroke: c.xeroxInk, strokeWidth: 1.05, opacity: 0.9 }
    ),

    // Flanking brass candlesticks on mantel
    renderMantelCandle(-68, 0),
    renderMantelCandle(68, 4),

    // Two knitted crimson stockings hanging from mantel ends
    renderStocking(-66, -1),
    renderStocking(66, 1),

    // Lush wet-on-wet watercolor + pencil holly garland draped along mantel edge
    svgEl('g', { 'data-part': 'mantel-garland' }, [
      watercolorWashBlotches(
        [
          { cx: -70, cy: -112, rx: 18, ry: 7.5, fill: c.foliageShadow, opacity: 0.85 },
          { cx: -36, cy: -107, rx: 22, ry: 7.5, fill: c.foliageMid, opacity: 0.84 },
          { cx: 0, cy: -104, rx: 24, ry: 8.0, fill: c.oliveCanopy, opacity: 0.84 },
          { cx: 36, cy: -107, rx: 22, ry: 7.5, fill: c.foliageMid, opacity: 0.84 },
          { cx: 70, cy: -112, rx: 18, ry: 7.5, fill: c.foliageShadow, opacity: 0.85 },
          { cx: -14, cy: -106, rx: 14, ry: 5.0, fill: c.sageFoliage, opacity: 0.65 },
          { cx: 22, cy: -108, rx: 14, ry: 5.0, fill: c.foliageRim, opacity: 0.55 },
        ],
        { seed: 53 }
      ),
      pencilFoliageScribbles(
        [
          { cx: -64, cy: -111, rx: 16, ry: 6, density: 0.9 },
          { cx: -22, cy: -106, rx: 20, ry: 6, density: 0.95 },
          { cx: 22, cy: -106, rx: 20, ry: 6, density: 0.95 },
          { cx: 64, cy: -111, rx: 16, ry: 6, density: 0.9 },
        ],
        {
          stroke: c.pencilOliveCharcoal,
          strokeWidth: 1.0,
          opacity: 0.82,
          includeTwigs: false,
          seed: 59,
        }
      ),
      // Flat crimson holly berry triads
      ...[-68, -36, 0, 36, 68].flatMap((bx) => {
        const by = Math.abs(bx) === 68 ? -112 : Math.abs(bx) === 36 ? -107 : -104;
        return [
          svgEl('circle', { cx: bx - 2.2, cy: by, r: 2.1, fill: c.mochiCollar }),
          svgEl('circle', { cx: bx + 2.2, cy: by + 0.5, r: 2.1, fill: c.mochiCollar }),
          svgEl('circle', { cx: bx, cy: by - 2.2, r: 1.9, fill: c.flowerRose }),
        ];
      }),
    ]),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'hearth_fireplace',
      'data-art-style': 'classic_cel',
      'data-lit': String(lit),
    },
    [clipDefs, hearthFloor, brickSurround, firebox, mantel]
  );
}

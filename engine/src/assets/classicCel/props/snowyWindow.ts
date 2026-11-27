import { TOKENS, svgUrl } from '../../../theme/tokens';
import { steppedLoopProgress } from '../../../engine/clock';
import {
  celPath,
  deterministicJitter,
  round2,
  svgEl,
  watercolorWashBlotches,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import type { WatercolorBlotch } from '../../../engine/svgUtils';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders an authentic 1983 *Mickey's Christmas Carol* frosted 12-pane Victorian shop
 * window (`'snowy_window'`):
 * - Deep slate-blue twilight winter sky seen through 12 wooden mullioned panes
 *   (`watercolorWashBlotches` cool frosty blue-grey glass + soft curved parchment
 *   snowdrifts piled in every lower pane corner!).
 * - Chunky dark-sage/wood weathered timber frame with sketchy `xeroxSketchStroke`
 *   wood grain & frost ticks, plus a sturdy wooden interior sill with brackets.
 *
 * Origin: `(0, 0)` at bottom-sill center.
 * Footprint: `~x: -88..88, y: -142..14`.
 */
export function renderClassicSnowyWindow(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, id, x, y } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const uid = (
    id ?? `v${variant}-${Math.round(x ?? 0)}-${Math.round(y ?? 0)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '');

  const glassClipId = `cc-win-glass-clip-${uid}`;
  const frameClipId = `cc-win-frame-clip-${uid}`;
  const sillClipId = `cc-win-sill-clip-${uid}`;

  // Glass opening bounds: x: -68..68 (width 136 = 4 panes x 34), y: -130..-4 (height 126 = 3 panes x 42)
  const glassRectD = 'M -68 -130 L 68 -130 L 68 -4 L -68 -4 Z';
  const outerFrameD =
    'M -78 -138 L 78 -138 L 78 -2 L -78 -2 Z M -68 -130 L -68 -4 L 68 -4 L 68 -130 Z';
  const sillD = 'M -86 -4 L 86 -4 L 84 6 L -84 6 Z';

  // Cool winter twilight sky & frosty blue-grey glass watercolor washes inside panes
  const skyBlotches: WatercolorBlotch[] = [
    { cx: -38, cy: -108, rx: 46, ry: 34, fill: c.nightSkyZenith, opacity: 0.76, rotate: -6 },
    { cx: 34, cy: -102, rx: 48, ry: 34, fill: c.nightSkyMid, opacity: 0.72, rotate: 5 },
    { cx: -12, cy: -66, rx: 54, ry: 36, fill: c.slateBlue, opacity: 0.56, rotate: -4 },
    { cx: 36, cy: -52, rx: 44, ry: 30, fill: c.nightSkyHorizon, opacity: 0.58, rotate: 7 },
    { cx: -42, cy: -34, rx: 42, ry: 28, fill: c.nightMistTeal, opacity: 0.46, rotate: -5 },
    // Frosty cool silver-blue winter breath around upper corners
    { cx: -54, cy: -118, rx: 24, ry: 18, fill: c.mochiFurRim, opacity: 0.34, rotate: 12 },
    { cx: 52, cy: -116, rx: 24, ry: 18, fill: c.nightcapStripe, opacity: 0.3, rotate: -10 },
    { cx: 6, cy: -22, rx: 52, ry: 18, fill: c.mochiFurRim, opacity: 0.34, rotate: 2 },
  ];

  // Faint distant snowy street roof silhouettes & gently falling outside snow specks
  const outsideFlakes: string[] = [];
  for (let i = 0; i < 12; i++) {
    const prog = steppedLoopProgress(frameIndex, 60 + (i % 3) * 18, i * 9);
    const fx = round2(
      -62 + ((i * 23 + variant * 17 + prog * 18) % 124)
    );
    const fy = round2(-126 + ((i * 19 + prog * 116) % 118));
    outsideFlakes.push(
      svgEl('circle', {
        cx: fx,
        cy: fy,
        r: round2(1.0 + (i % 3) * 0.45),
        fill: i % 2 === 0 ? c.parchmentCream : c.nightcapStripe,
        opacity: 0.68,
      })
    );
  }

  // 12 panes (4 columns x 3 rows) with soft curved parchment snowdrifts piled in every lower corner!
  const colEdges = [-68, -34, 0, 34, 68];
  const rowEdges = [-130, -88, -46, -4];
  const paneSnowElements: string[] = [];
  const paneFrostTicks: string[] = [];

  for (let r = 0; r < 3; r++) {
    const yTop = rowEdges[r];
    const yBot = rowEdges[r + 1];
    for (let col = 0; col < 4; col++) {
      const xL = colEdges[col];
      const xR = colEdges[col + 1];
      const idx = r * 4 + col;
      // Deeper snow on lower rows & varied organic pillow curves per pane
      const leftH = round2(
        (r === 2 ? 11.5 : r === 1 ? 8.5 : 6.8) +
          Math.abs(deterministicJitter(idx * 3 + 1, variant, 3.2))
      );
      const rightH = round2(
        (r === 2 ? 10.5 : r === 1 ? 7.8 : 6.2) +
          Math.abs(deterministicJitter(idx * 3 + 2, variant, 3.2))
      );
      const midDip = round2(
        Math.min(leftH, rightH) * 0.42 +
          Math.abs(deterministicJitter(idx * 3 + 3, variant, 1.5))
      );

      // Soft curved parchment-cream snowdrift hugging bottom edge & both lower corners of the pane
      const snowD = `M ${xL} ${yBot} L ${xL} ${round2(yBot - leftH)} Q ${round2(xL + 9)} ${round2(yBot - leftH + 1.8)}, ${round2(xL + 17)} ${round2(yBot - midDip)} Q ${round2(xR - 9)} ${round2(yBot - rightH + 1.5)}, ${xR} ${round2(yBot - rightH)} L ${xR} ${yBot} Z`;

      // Subtle cool blue-grey winter shadow band along lower snowdrift belly
      const snowShadowD = `M ${xL} ${yBot} L ${xL} ${round2(yBot - leftH * 0.45)} Q ${round2((xL + xR) * 0.5)} ${round2(yBot - midDip * 0.45)}, ${xR} ${round2(yBot - rightH * 0.45)} L ${xR} ${yBot} Z`;

      paneSnowElements.push(
        svgEl('path', {
          d: snowD,
          fill: c.parchmentCream,
          opacity: 0.92,
        }),
        svgEl('path', {
          d: snowShadowD,
          fill: c.mochiFurRim,
          opacity: 0.42,
        }),
        xeroxSketchStroke(
          `M ${round2(xL + 1.5)} ${round2(yBot - leftH + 0.5)} Q ${round2(xL + 10)} ${round2(yBot - leftH + 2.2)}, ${round2(xL + 17)} ${round2(yBot - midDip + 0.4)} Q ${round2(xR - 8)} ${round2(yBot - rightH + 2.0)}, ${round2(xR - 1.5)} ${round2(yBot - rightH + 0.5)}`,
          {
            stroke: c.slateBlue,
            strokeWidth: 0.75,
            broken: true,
            opacity: 0.56,
          }
        )
      );

      // Delicate diagonal frost / cold glass reflection ticks in upper-left of select panes
      if ((idx + variant) % 2 === 0) {
        paneFrostTicks.push(
          xeroxSketchStroke(
            `M ${round2(xL + 5)} ${round2(yTop + 12)} L ${round2(xL + 12)} ${round2(yTop + 5)} M ${round2(xL + 6)} ${round2(yTop + 18)} L ${round2(xL + 17)} ${round2(yTop + 7)}`,
            {
              stroke: c.nightcapStripe,
              strokeWidth: 0.85,
              broken: true,
              opacity: 0.44,
            }
          )
        );
      }
    }
  }

  // Clipped winter sky + frosted panes + 12 snowdrifts
  const glassInterior = svgEl(
    'g',
    { 'data-part': 'window-glass', 'clip-path': svgUrl(glassClipId) },
    [
      svgEl('path', { d: glassRectD, fill: c.nightSkyMid, stroke: 'none' }),
      watercolorWashBlotches(skyBlotches, {
        seed: variant * 17 + 3,
        opacity: 0.95,
      }),
      // Distant dark Dickensian snowy rooftop silhouettes low outside the glass
      svgEl('path', {
        d: 'M -70 -26 L -48 -40 L -24 -28 L -6 -36 L 16 -24 L 42 -38 L 70 -26 L 70 -2 L -70 -2 Z',
        fill: c.nightSkyZenith,
        opacity: 0.52,
      }),
      svgEl('g', { 'data-part': 'window-outside-snow' }, outsideFlakes),
      svgEl('g', { 'data-part': 'window-pane-snowdrifts' }, paneSnowElements),
      svgEl('g', { 'data-part': 'window-frost-ticks' }, paneFrostTicks),
    ]
  );

  // 12-pane wooden mullions (3 vertical + 2 horizontal weathered timber bars)
  const mullions = svgEl('g', { 'data-part': 'window-mullions' }, [
    // Vertical mullions at x = -34, 0, 34
    ...[-34, 0, 34].map((mx) =>
      celPath(
        `M ${round2(mx - 2.3)} -131 L ${round2(mx + 2.3)} -131 L ${round2(mx + 2.3)} -3 L ${round2(mx - 2.3)} -3 Z`,
        c.cottageShutterShadow,
        { stroke: c.xeroxInk, strokeWidth: 1.0 }
      )
    ),
    // Horizontal mullions at y = -88, -46
    ...[-88, -46].map((my) =>
      celPath(
        `M -69 ${round2(my - 2.4)} L 69 ${round2(my - 2.4)} L 69 ${round2(my + 2.4)} L -69 ${round2(my + 2.4)} Z`,
        c.cottageShutterShadow,
        { stroke: c.xeroxInk, strokeWidth: 1.0 }
      )
    ),
    // Subtle sketchy wood grain & frost flecks on mullions
    xeroxSketchStroke(
      'M -34 -126 L -34 -10 M 0 -126 L 0 -10 M 34 -126 L 34 -10 M -64 -88 L 64 -88 M -64 -46 L 64 -46',
      {
        stroke: c.woodMid,
        strokeWidth: 0.85,
        broken: true,
        dasharray: '10 6 7 5',
        opacity: 0.52,
      }
    ),
  ]);

  // Chunky dark-sage / weathered wood outer frame with watercolor mottling & molded lintel
  const frameBlotches: WatercolorBlotch[] = [
    { cx: -72, cy: -70, rx: 14, ry: 58, fill: c.woodDark, opacity: 0.55, rotate: -2 },
    { cx: 72, cy: -70, rx: 14, ry: 58, fill: c.cottageShutter, opacity: 0.45, rotate: 2 },
    { cx: 0, cy: -134, rx: 68, ry: 10, fill: c.woodDark, opacity: 0.52, rotate: 1 },
  ];

  const outerTimberFrame = svgEl('g', { 'data-part': 'window-frame' }, [
    // Frame surround with cutout opening (fill-rule evenodd)
    svgEl('path', {
      d: outerFrameD,
      fill: c.cottageShutterShadow,
      'fill-rule': 'evenodd',
      stroke: 'none',
    }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(frameClipId) },
      watercolorWashBlotches(frameBlotches, {
        seed: variant * 23 + 4,
        opacity: 0.88,
      })
    ),
    // Crisp Xerox outer & inner frame outlines
    celPath('M -78 -138 L 78 -138 L 78 -2 L -78 -2 Z', 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxMedium,
    }),
    celPath(glassRectD, 'none', {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Molded top wooden header cornice
    celPath('M -84 -141.5 L 84 -141.5 L 81 -134.5 L -81 -134.5 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.xeroxFine,
    }),
    // Sketchy miter seams, wood-grain scratches & corner frost ticks
    xeroxSketchStroke(
      'M -78 -138 L -68 -130 M 78 -138 L 68 -130 M -74 -120 L -73.5 -16 M 73.5 -122 L 74 -14 M -76 -138 L 76 -138',
      {
        stroke: c.xeroxInk,
        strokeWidth: 0.9,
        broken: true,
        dasharray: '14 4 9 3',
        opacity: 0.72,
      }
    ),
    xeroxSketchStroke(
      'M -71 -125 L -71 -22 M 71 -124 L 71 -20',
      {
        stroke: c.woodLit,
        strokeWidth: 0.8,
        broken: true,
        dasharray: '12 7 6 5',
        opacity: 0.42,
      }
    ),
  ]);

  // Sturdy wooden interior window sill & carved under-corbels (origin y=0 at sill center)
  const sillBlotches: WatercolorBlotch[] = [
    { cx: -40, cy: 1, rx: 38, ry: 7, fill: c.woodDark, opacity: 0.48, rotate: -2 },
    { cx: 18, cy: 0, rx: 44, ry: 7, fill: c.woodLit, opacity: 0.42, rotate: 2 },
    { cx: 60, cy: 2, rx: 24, ry: 6, fill: c.russetEarth, opacity: 0.34, rotate: -3 },
  ];

  const windowSill = svgEl('g', { 'data-part': 'window-sill' }, [
    // Carved wooden under-sill support brackets
    celPath('M -73 6 L -61 6 L -64 13 L -73 11 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    celPath('M 61 6 L 73 6 L 73 11 L 64 13 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    // Main sturdy sill plank
    svgEl('path', { d: sillD, fill: c.woodMid, stroke: 'none' }),
    svgEl(
      'g',
      { 'clip-path': svgUrl(sillClipId) },
      watercolorWashBlotches(sillBlotches, {
        seed: variant * 19 + 6,
        opacity: 0.9,
      })
    ),
    celPath(sillD, 'none', { stroke: c.xeroxInk, strokeWidth: s.xeroxMedium }),
    // Bevel shadow ledge & wood-grain strokes
    celPath('M -83 3 L 83 3 L 82 6.5 L -82 6.5 Z', c.woodDark, {
      stroke: c.xeroxInk,
      strokeWidth: s.sketchLine,
    }),
    xeroxSketchStroke('M -76 -1 L -12 -0.6 M 8 -1.2 L 72 -0.8 M -66 1.5 L 54 1.8', {
      stroke: c.xeroxInkSoft,
      strokeWidth: 0.85,
      broken: true,
      dasharray: '14 4 8 3',
      opacity: 0.66,
    }),
  ]);

  return svgEl(
    'g',
    {
      'data-prop': 'snowy_window',
      'data-art-style': 'classic_cel',
    },
    [
      svgEl('defs', {}, [
        svgEl('clipPath', { id: glassClipId }, svgEl('path', { d: glassRectD })),
        svgEl(
          'clipPath',
          { id: frameClipId },
          svgEl('path', { d: outerFrameD, 'clip-rule': 'evenodd' })
        ),
        svgEl('clipPath', { id: sillClipId }, svgEl('path', { d: sillD })),
      ]),
      glassInterior,
      mullions,
      outerTimberFrame,
      windowSill,
    ]
  );
}

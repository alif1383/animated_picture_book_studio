import { TOKENS } from '../../../theme/tokens';
import { steppedOscillate } from '../../../engine/clock';
import {
  celPath,
  deterministicJitter,
  round2,
  svgEl,
  svgTransform,
  xeroxSketchStroke,
} from '../../../engine/svgUtils';
import { renderStarShape } from '../../props/shared';
import type { PropRenderOptions } from '../../props/types';

/**
 * Renders 1970s–80s Classic Hand-Drawn Cel (*Robin Hood* 1973) falling celebration
 * ribbons, heraldic stars, and diamond confetti (`'party_confetti'`) in muted
 * Eastmancolor pigments inked with crisp `xeroxInkSoft` outlines at 12 FPS.
 *
 * Origin: `(0, 0)` wide top/center emitter.
 * Bounds: `x: -602..+602, y: -118..+400`.
 */
export function renderClassicPartyConfetti(options: PropRenderOptions): string {
  const { frameIndex = 0, variant = 1, count } = options;
  const c = TOKENS.classicCel.colors;
  const s = TOKENS.classicCel.strokes;

  const pieceCount = Math.max(6, Math.min(48, Math.round(count ?? 22)));
  const palette = [
    c.antiqueGold,
    c.soldierCrimson,
    c.royalBlueTunic,
    c.dustyRose,
    c.dragonEmeraldLit,
    c.warmAmberGlow,
    c.celCream,
  ];

  const pieces: string[] = [];

  for (let i = 0; i < pieceCount; i++) {
    const baseX =
      ((i * 131 + variant * 43) % 1140) -
      570 +
      deterministicJitter(i, variant, 12);
    // 12 FPS gentle horizontal paper-flutter sway
    const flutterX = steppedOscillate(frameIndex, 12, 8.5, i * 3 + variant);
    const px = round2(Math.max(-586, Math.min(586, baseX + flutterX)));

    // 12 FPS falling cycle (keeps all confetti + 30px ribbons strictly inside y: -118..+400)
    const fallOffset = ((frameIndex * 7 + i * 23) % 260) - 108;
    const py = round2(((i * 73 + variant * 19) % 210) + fallOffset);

    // 12 FPS stepped tumble rotation
    const rot = ((frameIndex * 14 + i * 47) % 360) - 180;
    const color = palette[(i + variant) % palette.length];

    if (i % 3 === 0) {
      // Hand-inked curled celebration ribbon streamer
      const ribbonD =
        `M ${round2(px - 2)} ${py} ` +
        `Q ${round2(px + 9)} ${round2(py + 7)}, ${round2(px - 3)} ${round2(py + 15)} ` +
        `Q ${round2(px - 11)} ${round2(py + 23)}, ${round2(px + 5)} ${round2(py + 29)} ` +
        `L ${round2(px + 2)} ${round2(py + 31)} ` +
        `Q ${round2(px - 15)} ${round2(py + 23)}, ${round2(px - 6)} ${round2(py + 15)} ` +
        `Q ${round2(px + 5)} ${round2(py + 8)}, ${round2(px - 5)} ${round2(py + 1.5)} Z`;
      pieces.push(
        celPath(ribbonD, color, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        })
      );
    } else if (i % 3 === 1) {
      // 5-point hand-drawn heraldic star confetti
      pieces.push(
        celPath(renderStarShape(px, py, 7.6, rot), color, {
          stroke: c.xeroxInkSoft,
          strokeWidth: s.sketchLine,
        })
      );
    } else {
      // Fluttering paper diamond confetti with subtle fold crease
      const diamondGroup = svgEl(
        'g',
        { transform: svgTransform({ x: px, y: py, rotate: rot }) },
        [
          celPath('M 0 -6.2 L 5.4 0 L 0 6.2 L -5.4 0 Z', color, {
            stroke: c.xeroxInkSoft,
            strokeWidth: s.sketchLine,
          }),
          xeroxSketchStroke('M -3.5 0 L 3.5 0', {
            stroke: c.xeroxInkSoft,
            strokeWidth: 0.65,
            opacity: 0.45,
          }),
        ]
      );
      pieces.push(diamondGroup);
    }
  }

  return svgEl(
    'g',
    {
      'data-prop': 'party_confetti',
      'data-art-style': 'classic_cel',
    },
    pieces
  );
}

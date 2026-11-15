import { TOKENS, svgUrl } from '../../theme/tokens';
import {
  crayonPath,
  crayonStrokeAttrs,
  round2,
  svgEl,
  svgTransform,
} from '../../engine/svgUtils';
import type { AnnotationNode } from '../../engine/schema';

/**
 * Renders hand-drawn picture-book annotations:
 * - dashed pencil motion paths (`dashedPath`)
 * - plain hand-lettered text (`bubbleStyle: 'none'`)
 * - rounded hand-drawn speech bubbles with directional tail (`bubbleStyle: 'speech'`)
 * - scalloped cloud thought bubbles with trailing thought puffs (`bubbleStyle: 'thought'`)
 */
export function renderAnnotation(node: Partial<AnnotationNode>): string {
  const color = node.color ?? TOKENS.colors.charcoalOutline;
  const fontSize = node.fontSize ?? TOKENS.typography.sizeAnnotation;
  const bubbleStyle = node.bubbleStyle ?? 'none';
  const tailDirection = node.tailDirection ?? 'bottom-left';
  const bubbleFill = node.bubbleFill ?? TOKENS.colors.paperWarm;
  const anchorAtTailTip = node.anchorAtTailTip ?? false;
  const parts: string[] = [];

  if (node.dashedPath) {
    parts.push(
      svgEl('path', {
        d: node.dashedPath,
        fill: 'none',
        stroke: color,
        'stroke-width': TOKENS.strokes.annotationPencil,
        'stroke-dasharray': TOKENS.strokes.dasharrayDashed,
        'stroke-linecap': 'round',
        filter: svgUrl(TOKENS.filters.ids.crayonOutline),
      })
    );
  }

  if (node.text) {
    const lines = node.text.split('\n');
    const maxChars = Math.max(
      1,
      ...lines.map((line) => Array.from(line).length)
    );

    if (bubbleStyle === 'speech' || bubbleStyle === 'thought') {
      const charWidth = fontSize * 0.58;
      const lineHeight = round2(fontSize * 1.28);
      const padX = Math.max(20, round2(fontSize * 1.05));
      const padY = Math.max(14, round2(fontSize * 0.72));
      const boxW = round2(Math.max(88, maxChars * charWidth + padX * 2));
      const boxH = round2(Math.max(44, lines.length * lineHeight + padY * 1.6));
      const halfW = round2(boxW / 2);
      const halfH = round2(boxH / 2);
      const tailH = anchorAtTailTip ? 18 : 20;
      const x0 = -halfW;
      const x1 = halfW;
      const y0 = anchorAtTailTip ? round2(-(boxH + tailH)) : -halfH;
      const y1 = anchorAtTailTip ? -tailH : halfH;
      const centerY = round2((y0 + y1) / 2);

      if (bubbleStyle === 'speech') {
        const r = Math.min(20, round2(boxH * 0.38));

        let speechPath = '';
        if (tailDirection === 'bottom-center') {
          speechPath = [
            `M ${x0 + r} ${y0}`,
            `L ${x1 - r} ${y0}`,
            `Q ${x1} ${y0}, ${x1} ${y0 + r}`,
            `L ${x1} ${y1 - r}`,
            `Q ${x1} ${y1}, ${x1 - r} ${y1}`,
            `L 10 ${y1}`,
            `L 0 ${round2(y1 + tailH)}`,
            `L -10 ${y1}`,
            `L ${x0 + r} ${y1}`,
            `Q ${x0} ${y1}, ${x0} ${y1 - r}`,
            `L ${x0} ${y0 + r}`,
            `Q ${x0} ${y0}, ${x0 + r} ${y0}`,
            'Z',
          ].join(' ');
        } else if (tailDirection === 'bottom-left') {
          const tx = anchorAtTailTip
            ? 4
            : round2(x0 + Math.min(36, boxW * 0.26));
          speechPath = [
            `M ${x0 + r} ${y0}`,
            `L ${x1 - r} ${y0}`,
            `Q ${x1} ${y0}, ${x1} ${y0 + r}`,
            `L ${x1} ${y1 - r}`,
            `Q ${x1} ${y1}, ${x1 - r} ${y1}`,
            `L ${tx + 14} ${y1}`,
            `L ${tx - 10} ${round2(y1 + tailH)}`,
            `L ${tx - 2} ${y1}`,
            `L ${x0 + r} ${y1}`,
            `Q ${x0} ${y1}, ${x0} ${y1 - r}`,
            `L ${x0} ${y0 + r}`,
            `Q ${x0} ${y0}, ${x0 + r} ${y0}`,
            'Z',
          ].join(' ');
        } else if (tailDirection === 'bottom-right') {
          const tx = anchorAtTailTip
            ? -4
            : round2(x1 - Math.min(36, boxW * 0.26));
          speechPath = [
            `M ${x0 + r} ${y0}`,
            `L ${x1 - r} ${y0}`,
            `Q ${x1} ${y0}, ${x1} ${y0 + r}`,
            `L ${x1} ${y1 - r}`,
            `Q ${x1} ${y1}, ${x1 - r} ${y1}`,
            `L ${tx + 2} ${y1}`,
            `L ${tx + 10} ${round2(y1 + tailH)}`,
            `L ${tx - 14} ${y1}`,
            `L ${x0 + r} ${y1}`,
            `Q ${x0} ${y1}, ${x0} ${y1 - r}`,
            `L ${x0} ${y0 + r}`,
            `Q ${x0} ${y0}, ${x0 + r} ${y0}`,
            'Z',
          ].join(' ');
        } else if (tailDirection === 'left') {
          speechPath = [
            `M ${x0 + r} ${y0}`,
            `L ${x1 - r} ${y0}`,
            `Q ${x1} ${y0}, ${x1} ${y0 + r}`,
            `L ${x1} ${y1 - r}`,
            `Q ${x1} ${y1}, ${x1 - r} ${y1}`,
            `L ${x0 + r} ${y1}`,
            `Q ${x0} ${y1}, ${x0} ${y1 - r}`,
            `L ${x0} ${round2(centerY + 8)}`,
            `L ${x0 - 20} ${round2(centerY + 14)}`,
            `L ${x0} ${round2(centerY - 6)}`,
            `L ${x0} ${y0 + r}`,
            `Q ${x0} ${y0}, ${x0 + r} ${y0}`,
            'Z',
          ].join(' ');
        } else {
          speechPath = [
            `M ${x0 + r} ${y0}`,
            `L ${x1 - r} ${y0}`,
            `Q ${x1} ${y0}, ${x1} ${y0 + r}`,
            `L ${x1} ${round2(centerY - 6)}`,
            `L ${x1 + 20} ${round2(centerY + 14)}`,
            `L ${x1} ${round2(centerY + 8)}`,
            `L ${x1} ${y1 - r}`,
            `Q ${x1} ${y1}, ${x1 - r} ${y1}`,
            `L ${x0 + r} ${y1}`,
            `Q ${x0} ${y1}, ${x0} ${y1 - r}`,
            `L ${x0} ${y0 + r}`,
            `Q ${x0} ${y0}, ${x0 + r} ${y0}`,
            'Z',
          ].join(' ');
        }

        parts.push(
          svgEl(
            'g',
            {
              'data-bubble': 'speech',
              'data-tail-direction': tailDirection,
              'data-anchor-tail-tip': anchorAtTailTip ? 'true' : undefined,
            },
            [
              crayonPath(speechPath, bubbleFill, {
                stroke: TOKENS.colors.charcoalOutline,
                strokeWidth: TOKENS.strokes.outlineMedium,
                useCrayonFilter: true,
                paperUnderlay: true,
              }),
            ]
          )
        );
      } else {
        // Scalloped cloud thought bubble + trailing thought puffs
        const xm = 0;
        const xl = round2(x0 * 0.48);
        const xr = round2(x1 * 0.48);

        const cloudPath = [
          `M ${x0 + 12} ${y0 + 8}`,
          `C ${x0 + 6} ${y0 - 12}, ${xl - 8} ${y0 - 16}, ${xl} ${y0 - 4}`,
          `C ${xl + 10} ${y0 - 18}, ${xr - 10} ${y0 - 18}, ${xr} ${y0 - 4}`,
          `C ${xr + 8} ${y0 - 16}, ${x1 - 6} ${y0 - 12}, ${x1 - 12} ${y0 + 8}`,
          `C ${x1 + 14} ${y0 + 10}, ${x1 + 16} ${y1 - 10}, ${x1 - 10} ${y1 - 6}`,
          `C ${x1 - 4} ${y1 + 12}, ${xr + 8} ${y1 + 14}, ${xr} ${y1 + 4}`,
          `C ${xm + 12} ${y1 + 18}, ${xm - 12} ${y1 + 18}, ${xl} ${y1 + 4}`,
          `C ${xl - 8} ${y1 + 14}, ${x0 + 4} ${y1 + 12}, ${x0 + 10} ${y1 - 6}`,
          `C ${x0 - 16} ${y1 - 10}, ${x0 - 14} ${y0 + 10}, ${x0 + 12} ${y0 + 8}`,
          'Z',
        ].join(' ');

        const puffSignX =
          tailDirection === 'bottom-right' || tailDirection === 'right'
            ? 1
            : tailDirection === 'bottom-center'
            ? 0
            : -1;
        const puffBaseX =
          tailDirection === 'left' || tailDirection === 'right'
            ? round2(puffSignX * (halfW + 10))
            : anchorAtTailTip
            ? round2(-puffSignX * 8)
            : round2(puffSignX * Math.min(28, halfW * 0.45));
        const puffBaseY =
          tailDirection === 'left' || tailDirection === 'right'
            ? round2(centerY + 4)
            : round2(y1 + (anchorAtTailTip ? 5 : 12));

        const puffs = anchorAtTailTip
          ? [
              svgEl('circle', {
                cx: puffBaseX,
                cy: puffBaseY,
                r: 5.5,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
              svgEl('circle', {
                cx: round2(puffBaseX * 0.5),
                cy: round2(y1 + 12),
                r: 3.8,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
              svgEl('circle', {
                cx: 0,
                cy: round2(y1 + 17),
                r: 2.5,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
            ]
          : [
              svgEl('circle', {
                cx: puffBaseX,
                cy: puffBaseY,
                r: 6.5,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
              svgEl('circle', {
                cx: round2(puffBaseX + (puffSignX || -0.3) * 10),
                cy: round2(puffBaseY + 12),
                r: 4.5,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
              svgEl('circle', {
                cx: round2(puffBaseX + (puffSignX || 0.2) * 17),
                cy: round2(puffBaseY + 21),
                r: 2.8,
                fill: bubbleFill,
                ...crayonStrokeAttrs({
                  strokeWidth: TOKENS.strokes.outlineThin,
                }),
              }),
            ];

        parts.push(
          svgEl(
            'g',
            {
              'data-bubble': 'thought',
              'data-tail-direction': tailDirection,
              'data-anchor-tail-tip': anchorAtTailTip ? 'true' : undefined,
              filter: svgUrl(TOKENS.filters.ids.crayonStroke),
            },
            [
              crayonPath(cloudPath, bubbleFill, {
                stroke: TOKENS.colors.charcoalOutline,
                strokeWidth: TOKENS.strokes.outlineMedium,
                paperUnderlay: true,
              }),
              ...puffs,
            ]
          )
        );
      }

      const startY = round2(
        centerY - ((lines.length - 1) * lineHeight) / 2 + fontSize * 0.34
      );
      for (let i = 0; i < lines.length; i++) {
        parts.push(
          svgEl(
            'text',
            {
              x: 0,
              y: round2(startY + i * lineHeight),
              'text-anchor': 'middle',
              'font-family': TOKENS.typography.fontFamilyHand,
              'font-size': fontSize,
              'font-weight': 'bold',
              fill: color,
              filter: svgUrl(TOKENS.filters.ids.crayonOutline),
            },
            lines[i]
          )
        );
      }
    } else {
      const lineHeight = round2(fontSize * 1.25);
      for (let i = 0; i < lines.length; i++) {
        parts.push(
          svgEl(
            'text',
            {
              x: 0,
              y: round2(i * lineHeight),
              'font-family': TOKENS.typography.fontFamilyHand,
              'font-size': fontSize,
              'font-weight': 'bold',
              fill: color,
              filter: svgUrl(TOKENS.filters.ids.crayonOutline),
            },
            lines[i]
          )
        );
      }
    }
  }

  const transform = svgTransform({
    x: node.x,
    y: node.y,
    rotate: node.rotate,
    scale: node.scale,
  });

  return svgEl(
    'g',
    {
      id: node.id,
      'data-annotation': 'true',
      transform: transform || undefined,
      opacity: node.opacity,
    },
    parts
  );
}

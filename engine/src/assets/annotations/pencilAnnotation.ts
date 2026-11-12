import { TOKENS, svgUrl } from '../../theme/tokens';
import { svgEl, svgTransform } from '../../engine/svgUtils';
import type { AnnotationNode } from '../../engine/schema';

/**
 * Renders hand-drawn picture-book annotations (dashed pencil motion paths & hand-lettered text).
 */
export function renderAnnotation(node: Partial<AnnotationNode>): string {
  const color = node.color ?? TOKENS.colors.charcoalOutline;
  const fontSize = node.fontSize ?? TOKENS.typography.sizeAnnotation;
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
    parts.push(
      svgEl(
        'text',
        {
          x: 0,
          y: 0,
          'font-family': TOKENS.typography.fontFamilyHand,
          'font-size': fontSize,
          'font-weight': 'bold',
          fill: color,
          filter: svgUrl(TOKENS.filters.ids.crayonOutline),
        },
        node.text
      )
    );
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

import type { RenderContext, ContourData } from '../types';

export function drawContourLines(rc: RenderContext): void {
  const { ctx, width, height, contourData, gridWidth, gridHeight, palette, config } = rc;

  const scaleX = width / gridWidth;
  const scaleY = height / gridHeight;
  const mode = config.contourColorMode;
  const glow = config.contourGlow ?? 0;
  const total = contourData.length;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Apply glow as a layer on top of any color mode
  if (glow > 0) {
    ctx.shadowColor = palette.accent;
  }

  for (let i = 0; i < total; i++) {
    const contour = contourData[i];
    const isIndex = i % 5 === 0;
    const t = total > 1 ? i / (total - 1) : 0; // normalized 0..1

    if (mode === 'elevation') {
      // Tint from cool (base contour color) at low elevations to warm (accent) at high
      ctx.strokeStyle = lerpColor(palette.contourLine, palette.accent, t);
      ctx.lineWidth = isIndex ? 1.4 : 0.6;
      ctx.globalAlpha = 1;
    } else if (mode === 'fade') {
      ctx.strokeStyle = isIndex ? palette.contourIndex : palette.contourLine;
      ctx.lineWidth = isIndex ? 1.4 : 0.6;
      ctx.globalAlpha = 0.15 + 0.85 * t;
    } else {
      // mono (default)
      ctx.strokeStyle = isIndex ? palette.contourIndex : palette.contourLine;
      ctx.lineWidth = isIndex ? 1.4 : 0.6;
      ctx.globalAlpha = 1;
    }

    // Glow: shadowBlur scales with intensity, index contours glow stronger
    if (glow > 0) {
      ctx.shadowBlur = glow * (isIndex ? 12 : 6);
    }

    drawContourPath(ctx, contour, scaleX, scaleY);
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function lerpColor(a: string, b: string, t: number): string {
  const ra = parseInt(a.slice(1, 3), 16);
  const ga = parseInt(a.slice(3, 5), 16);
  const ba = parseInt(a.slice(5, 7), 16);
  const rb = parseInt(b.slice(1, 3), 16);
  const gb = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

function drawContourPath(
  ctx: CanvasRenderingContext2D,
  contour: ContourData,
  scaleX: number,
  scaleY: number,
): void {
  ctx.beginPath();

  for (const polygon of contour.coordinates) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length; i++) {
        const px = ring[i][0] * scaleX;
        const py = ring[i][1] * scaleY;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    }
  }

  ctx.stroke();
}

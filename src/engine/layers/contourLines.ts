import type { RenderContext, ContourData } from '../types';

export function drawContourLines(rc: RenderContext): void {
  const { ctx, width, height, contourData, gridWidth, gridHeight, palette } = rc;

  const scaleX = width / gridWidth;
  const scaleY = height / gridHeight;

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (let i = 0; i < contourData.length; i++) {
    const contour = contourData[i];
    const isIndex = i % 5 === 0;

    ctx.strokeStyle = isIndex ? palette.contourIndex : palette.contourLine;
    ctx.lineWidth = isIndex ? 1.4 : 0.6;

    drawContourPath(ctx, contour, scaleX, scaleY);
  }
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

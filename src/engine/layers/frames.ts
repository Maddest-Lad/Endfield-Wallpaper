import type { RenderContext } from '../types';

export function drawFrames(rc: RenderContext): void {
  const { ctx, width, height, palette } = rc;

  const inset = Math.round(width * 0.015);
  const armLength = Math.round(width * 0.025);

  ctx.strokeStyle = palette.frameLine;
  ctx.lineWidth = 1;

  // Inner border rectangle
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  // Corner brackets (outside the border)
  const outerInset = Math.round(inset * 0.5);
  drawCornerBracket(ctx, outerInset, outerInset, armLength, 'tl');
  drawCornerBracket(ctx, width - outerInset, outerInset, armLength, 'tr');
  drawCornerBracket(ctx, outerInset, height - outerInset, armLength, 'bl');
  drawCornerBracket(ctx, width - outerInset, height - outerInset, armLength, 'br');

  // Crosshair at center
  const cx = width / 2;
  const cy = height / 2;
  const crossSize = Math.round(width * 0.012);

  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(cx - crossSize, cy);
  ctx.lineTo(cx + crossSize, cy);
  ctx.moveTo(cx, cy - crossSize);
  ctx.lineTo(cx, cy + crossSize);
  ctx.stroke();

  // Small circle at center
  ctx.beginPath();
  ctx.arc(cx, cy, crossSize * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Edge midpoint ticks
  const tickLen = Math.round(width * 0.008);
  ctx.globalAlpha = 0.2;
  ctx.beginPath();

  // Top mid
  ctx.moveTo(cx, inset);
  ctx.lineTo(cx, inset + tickLen);
  // Bottom mid
  ctx.moveTo(cx, height - inset);
  ctx.lineTo(cx, height - inset - tickLen);
  // Left mid
  ctx.moveTo(inset, cy);
  ctx.lineTo(inset + tickLen, cy);
  // Right mid
  ctx.moveTo(width - inset, cy);
  ctx.lineTo(width - inset - tickLen, cy);

  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawCornerBracket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  arm: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
): void {
  const dx = corner.includes('l') ? 1 : -1;
  const dy = corner.includes('t') ? 1 : -1;

  ctx.beginPath();
  ctx.moveTo(x + dx * arm, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * arm);
  ctx.stroke();
}

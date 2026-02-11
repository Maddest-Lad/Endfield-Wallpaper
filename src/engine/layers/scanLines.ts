import type { RenderContext } from '../types';
import { randomInRange, randomInt } from '../../utils/random';

export function drawScanLines(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  ctx.save();

  // Horizontal scan lines — thin, evenly spaced, very low opacity
  const hCount = randomInt(rng, 3, 6);
  ctx.strokeStyle = palette.frameLine;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.12;

  for (let i = 0; i < hCount; i++) {
    const y = randomInRange(rng, height * 0.08, height * 0.92);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Small tick mark + label at the edge
    ctx.globalAlpha = 0.08;
    ctx.font = `${Math.max(6, Math.round(width / 280))}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = palette.textSecondary;
    ctx.fillText(`${Math.round(y)}`, 4, y - 6);
    ctx.globalAlpha = 0.12;
  }

  // Vertical scan lines — fewer, slightly bolder
  const vCount = randomInt(rng, 2, 4);
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.1;

  for (let i = 0; i < vCount; i++) {
    const x = randomInRange(rng, width * 0.1, width * 0.9);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // One prominent dashed accent line
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.15;
  ctx.setLineDash([8, 12]);

  const dashY = randomInRange(rng, height * 0.25, height * 0.75);
  ctx.beginPath();
  ctx.moveTo(0, dashY);
  ctx.lineTo(width, dashY);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.restore();
}

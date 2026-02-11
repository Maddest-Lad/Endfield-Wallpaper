import type { RenderContext } from '../types';
import { randomInRange, randomInt } from '../../utils/random';

export function drawReticles(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  ctx.save();

  const count = randomInt(rng, 2, 4);

  for (let i = 0; i < count; i++) {
    // Bias placement toward corners and edges
    const quadrant = i % 4;
    let cx: number, cy: number;

    switch (quadrant) {
      case 0:
        cx = randomInRange(rng, width * 0.06, width * 0.25);
        cy = randomInRange(rng, height * 0.06, height * 0.3);
        break;
      case 1:
        cx = randomInRange(rng, width * 0.75, width * 0.94);
        cy = randomInRange(rng, height * 0.06, height * 0.3);
        break;
      case 2:
        cx = randomInRange(rng, width * 0.06, width * 0.25);
        cy = randomInRange(rng, height * 0.7, height * 0.94);
        break;
      default:
        cx = randomInRange(rng, width * 0.75, width * 0.94);
        cy = randomInRange(rng, height * 0.7, height * 0.94);
        break;
    }

    const size = Math.round(width * randomInRange(rng, 0.02, 0.04));
    const style = randomInt(rng, 0, 2);

    if (style === 0) {
      drawCircleReticle(ctx, cx, cy, size, palette.frameLine, palette.accent);
    } else if (style === 1) {
      drawDiamondReticle(ctx, cx, cy, size, palette.frameLine, palette.accent);
    } else {
      drawSquareReticle(ctx, cx, cy, size, palette.frameLine, palette.accent);
    }
  }

  ctx.restore();
}

function drawCircleReticle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  accent: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.3;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair lines (with gap in center)
  const gap = r * 0.2;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // Accent dot at center
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawDiamondReticle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  accent: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.25;

  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.stroke();

  // Inner diamond
  const ir = r * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ir);
  ctx.lineTo(cx + ir, cy);
  ctx.lineTo(cx, cy + ir);
  ctx.lineTo(cx - ir, cy);
  ctx.closePath();
  ctx.stroke();

  // Corner ticks extending outward
  const ext = r * 1.3;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy - ext);
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx, cy + ext);
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx - ext, cy);
  ctx.moveTo(cx + r, cy);
  ctx.lineTo(cx + ext, cy);
  ctx.stroke();

  // Accent center
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSquareReticle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  accent: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.25;

  // Outer square
  ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);

  // Inner rotated square (45deg)
  const ir = r * 0.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - ir);
  ctx.lineTo(cx + ir, cy);
  ctx.lineTo(cx, cy + ir);
  ctx.lineTo(cx - ir, cy);
  ctx.closePath();
  ctx.stroke();

  // Crosshair
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.4, cy);
  ctx.lineTo(cx + r * 1.4, cy);
  ctx.moveTo(cx, cy - r * 1.4);
  ctx.lineTo(cx, cy + r * 1.4);
  ctx.stroke();

  // Corner accent marks
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1.2;
  const arm = r * 0.3;

  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const ex = cx + dx * r;
    const ey = cy + dy * r;
    ctx.beginPath();
    ctx.moveTo(ex + dx * arm, ey);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex, ey + dy * arm);
    ctx.stroke();
  }
}

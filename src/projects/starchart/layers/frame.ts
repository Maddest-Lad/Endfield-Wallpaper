import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { detailScale, safeBounds } from '../layout';

/** Registration mark: a ring bisected by a cross, as on a printer's plate. */
function registration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.moveTo(x - r * 1.8, y);
  ctx.lineTo(x + r * 1.8, y);
  ctx.moveTo(x, y - r * 1.8);
  ctx.lineTo(x, y + r * 1.8);
  ctx.stroke();
}

/**
 * Plate furniture: the border rule, an inner hairline, edge ticks, corner
 * brackets and registration marks. This is what turns the image from a wallpaper
 * into a document.
 */
export function drawFrame(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette } = data;

  const s = detailScale(width, height);
  const b = safeBounds(width, height, config.margin);
  const w = b.right - b.left;
  const h = b.bottom - b.top;
  if (w <= 0 || h <= 0) return;

  ctx.save();
  ctx.lineCap = 'butt';

  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.7 : 0.45);
  ctx.lineWidth = 1.2 * s;
  ctx.strokeRect(b.left, b.top, w, h);

  ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.5 : 0.25);
  ctx.lineWidth = 0.7 * s;
  const g = 5 * s;
  ctx.strokeRect(b.left + g, b.top + g, w - g * 2, h - g * 2);

  // Graduated ticks along the outer rule, every 1/40 of each edge.
  ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.6 : 0.32);
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  const divs = 40;
  for (let i = 1; i < divs; i++) {
    const major = i % 5 === 0;
    const t = (major ? 6 : 3) * s;
    const x = b.left + (w * i) / divs;
    const y = b.top + (h * i) / divs;
    ctx.moveTo(x, b.top);
    ctx.lineTo(x, b.top + t);
    ctx.moveTo(x, b.bottom);
    ctx.lineTo(x, b.bottom - t);
    ctx.moveTo(b.left, y);
    ctx.lineTo(b.left + t, y);
    ctx.moveTo(b.right, y);
    ctx.lineTo(b.right - t, y);
  }
  ctx.stroke();

  // Corner brackets, sitting outside the rule.
  const arm = Math.min(w, h) * 0.06;
  const o = 9 * s;
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.85 : 0.65);
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  const corners: [number, number, number, number][] = [
    [b.left - o, b.top - o, 1, 1],
    [b.right + o, b.top - o, -1, 1],
    [b.left - o, b.bottom + o, 1, -1],
    [b.right + o, b.bottom + o, -1, -1],
  ];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.moveTo(cx + sx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * arm);
  }
  ctx.stroke();

  // Registration marks at the midpoint of each edge, in the outer margin.
  const inset = Math.min(o * 0.55, Math.min(b.left, b.top) * 0.6);
  if (inset > 2 * s) {
    ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.6 : 0.4);
    ctx.lineWidth = 0.9 * s;
    const r = Math.min(4 * s, inset * 0.8);
    registration(ctx, (b.left + b.right) / 2, b.top - inset, r);
    registration(ctx, (b.left + b.right) / 2, b.bottom + inset, r);
    registration(ctx, b.left - inset, (b.top + b.bottom) / 2, r);
    registration(ctx, b.right + inset, (b.top + b.bottom) / 2, r);
  }

  ctx.restore();
}

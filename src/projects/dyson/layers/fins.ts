import type { RenderContext } from '@core/project/types';
import { randomInRange, randomInt } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { rgba } from '../palette';
import { TAU } from '../geometry';

/**
 * Radiator fins standing off the shell limb: long tapered spars, ribbed, with
 * the root edge catching the core so they read as attached rather than floating.
 */
export function drawFins(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  const count = Math.max(0, Math.round(config.finCount));
  if (count === 0) return;

  const hair = Math.max(0.5, R * 0.004);
  const slice = TAU / count;

  ctx.save();
  ctx.lineJoin = 'miter';

  for (let i = 0; i < count; i++) {
    const ang = i * slice + randomInRange(rng, -slice * 0.3, slice * 0.3);
    const len = randomInRange(rng, 0.22, 0.62);
    const halfBase = randomInRange(rng, 0.035, 0.085);
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const px = -dy;
    const py = dx;

    const r0 = 0.96 * R;
    const r1 = (0.96 + len) * R;
    const w0 = halfBase * R;
    const w1 = w0 * 0.32;

    const ax = cx + dx * r0;
    const ay = cy + dy * r0;
    const bx = cx + dx * r1;
    const by = cy + dy * r1;

    const quad = () => {
      ctx.beginPath();
      ctx.moveTo(ax + px * w0, ay + py * w0);
      ctx.lineTo(bx + px * w1, by + py * w1);
      ctx.lineTo(bx - px * w1, by - py * w1);
      ctx.lineTo(ax - px * w0, ay - py * w0);
      ctx.closePath();
    };

    quad();
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = palette.structureDark;
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = palette.structure;
    ctx.lineWidth = hair;
    ctx.stroke();

    // Ribs.
    const ribs = randomInt(rng, 5, 13);
    ctx.globalAlpha = 0.32;
    ctx.beginPath();
    for (let k = 1; k < ribs; k++) {
      const f = k / ribs;
      const rr = r0 + (r1 - r0) * f;
      const ww = w0 + (w1 - w0) * f;
      ctx.moveTo(cx + dx * rr + px * ww, cy + dy * rr + py * ww);
      ctx.lineTo(cx + dx * rr - px * ww, cy + dy * rr - py * ww);
    }
    ctx.stroke();

    // Root edge, lit by the star it is radiating away from.
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = palette.structureLit;
    ctx.lineWidth = hair * 1.8;
    ctx.beginPath();
    ctx.moveTo(ax + px * w0, ay + py * w0);
    ctx.lineTo(ax - px * w0, ay - py * w0);
    ctx.stroke();

    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    const glow = w0 * 3.4;
    const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, glow);
    g.addColorStop(0, rgba(palette.coreRgb, 0.34));
    g.addColorStop(1, rgba(palette.coreRgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(ax - glow, ay - glow, glow * 2, glow * 2);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
}

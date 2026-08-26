import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { detailScale } from '../layout';

/**
 * Line figures over the bright stars, from a minimum spanning tree per cluster.
 *
 * Each segment stops short of both endpoints. That gap is the whole trick: a line
 * that touches the dot reads as plotted data, a line that stops just shy of it
 * reads as drawn by a cartographer.
 */
export function drawConstellations(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, data } = rc;
  const { palette, constellations } = data;
  if (constellations.length === 0) return;

  const s = detailScale(width, height);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.9 * s;
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.45 : 0.34);

  ctx.beginPath();
  for (const fig of constellations) {
    for (const [ai, bi] of fig.edges) {
      const a = fig.stars[ai];
      const b = fig.stars[bi];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) continue;
      const ux = dx / len;
      const uy = dy / len;
      const gapA = a.r + 3.2 * s;
      const gapB = b.r + 3.2 * s;
      if (gapA + gapB >= len) continue;
      ctx.moveTo(a.x + ux * gapA, a.y + uy * gapA);
      ctx.lineTo(b.x - ux * gapB, b.y - uy * gapB);
    }
  }
  ctx.stroke();

  // A hairline ring on each figure's first star marks it as the named member.
  ctx.lineWidth = 0.7 * s;
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.34 : 0.22);
  ctx.beginPath();
  for (const fig of constellations) {
    const a = fig.stars[0];
    const r = a.r + 4.5 * s;
    ctx.moveTo(a.x + r, a.y);
    ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
  }
  ctx.stroke();

  ctx.restore();
}

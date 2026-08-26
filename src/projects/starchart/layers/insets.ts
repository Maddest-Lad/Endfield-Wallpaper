import type { RenderContext } from '@core/project/types';
import { randomInRange, randomInt } from '@core/utils/random';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import {
  MONO,
  cornerTicks,
  detailScale,
  drawLabel,
  plateRegions,
  rectsOverlap,
  type Rect,
} from '../layout';
import { insetLabel } from '../textContent';

/**
 * Empty framed rectangles with corner ticks, suggesting regions called out for a
 * zoomed detail plate. They are placed by rejection sampling against each other
 * and against the title block and legend, which draw on top of them.
 */
export function drawInsets(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette } = data;

  const s = detailScale(width, height);
  const { bounds, title, legend } = plateRegions(width, height, config.margin);
  const short = Math.min(width, height);

  // The title block and legend draw on top of this layer, so keep clear of them
  // — but only when they are actually enabled, or their corners read as bald.
  const placed: Rect[] = config.showTitleBlock ? [title, legend] : [];
  const insets: Rect[] = [];
  const wanted = randomInt(rng, 2, 4);

  for (let attempt = 0; attempt < 140 && insets.length < wanted; attempt++) {
    const w = randomInRange(rng, short * 0.1, short * 0.21);
    const h = w * randomInRange(rng, 0.55, 1.05);
    // Leave headroom above for the label; skip the candidate outright if the
    // plate is too small to hold one at this size.
    const top = bounds.top + 22 * s;
    if (bounds.right - bounds.left < w || bounds.bottom - top < h) continue;
    const x = randomInRange(rng, bounds.left, bounds.right - w);
    const y = randomInRange(rng, top, bounds.bottom - h);
    const cand: Rect = { x, y, w, h };
    if (placed.some((p) => rectsOverlap(cand, p, 12 * s))) continue;
    placed.push(cand);
    insets.push(cand);
  }

  if (insets.length === 0) return;

  ctx.save();
  ctx.font = `${Math.round(9 * s)}px ${MONO}`;

  for (const r of insets) {
    ctx.setLineDash([2.5 * s, 3.5 * s]);
    ctx.lineWidth = 0.8 * s;
    ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.55 : 0.34);
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    // Neutral ink, not the accent: the accent is reserved for the trade lanes,
    // so that network reads as the only inhabited thing on the plate.
    ctx.setLineDash([]);
    ctx.lineWidth = 1.1 * s;
    ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.7 : 0.5);
    cornerTicks(ctx, r.x, r.y, r.w, r.h, Math.min(r.w, r.h) * 0.16);

    ctx.fillStyle = rgba(palette.dim, palette.invert ? 0.85 : 0.6);
    drawLabel(ctx, insetLabel(rng), r.x, r.y - 7 * s, 'left', bounds, 9 * s);
  }

  ctx.restore();
}

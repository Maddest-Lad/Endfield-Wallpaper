import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import type { SkyView } from '../sky';
import { rgba } from '../palette';
import { detailScale, safeBounds } from '../layout';

interface Graduation {
  x: number;
  y: number;
  major: boolean;
}

/**
 * Where a plate edge crosses a whole hour of RA or a whole degree of Dec.
 *
 * Walked in PLATE space and inverted to sky, rather than the reverse (project
 * gridlines out from sky space, as the graticule layer does) — the border is a
 * fixed rectangle regardless of pointing, so it is cheaper to ask "what is the
 * sky at this edge point" at a few hundred evenly spaced points than to hunt
 * for exactly where a curved meridian happens to intersect a straight edge.
 *
 * Every edge is checked for BOTH kinds of crossing, not just "top/bottom get
 * RA, left/right get Dec": with `roll` free to rotate the plate, any edge can
 * end up running mostly along either coordinate.
 */
function walkEdge(
  view: SkyView,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  steps: number,
): Graduation[] {
  const out: Graduation[] = [];
  let prevRa: number | null = null;
  let prevDec: number | null = null;
  let prevHour = NaN;
  let prevDeg = NaN;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const sky = view.invert(x, y);

    if (!sky) {
      prevRa = prevDec = null;
      prevHour = prevDeg = NaN;
      continue;
    }
    const [ra, dec] = sky;
    const hour = Math.floor((((ra % 360) + 360) % 360) / 15);
    const deg = Math.floor(dec);

    // Exactly one boundary crossed (with 23<->0 treated as adjacent) — not
    // zero, and not several, which only happens a few pixels from a pole,
    // where every meridian passes through and a "crossing" stops meaning
    // anything. The crossed VALUE is the higher of the two bucket indices
    // (the boundary between floor-buckets k and k+1 sits at k+1) regardless of
    // which direction the walk is moving — a decreasing step through the same
    // boundary crosses the identical value.
    if (prevRa !== null && Number.isFinite(prevHour)) {
      const dh = Math.abs(hour - prevHour);
      if (dh === 1 || dh === 23) {
        const crossingHour = dh === 23 ? 0 : Math.max(hour, prevHour);
        out.push({ x, y, major: crossingHour % 6 === 0 });
      }
    }
    if (prevDec !== null && Number.isFinite(prevDeg) && Math.abs(deg - prevDeg) === 1) {
      out.push({ x, y, major: Math.max(deg, prevDeg) % 5 === 0 });
    }

    prevRa = ra;
    prevDec = dec;
    prevHour = hour;
    prevDeg = deg;
  }

  return out;
}

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
  const { palette, view } = data;

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

  // Graduated ticks along the outer rule: real coordinate crossings, not an
  // arbitrary even spacing. Every edge is checked for both RA-hour and
  // Dec-degree crossings rather than assuming top/bottom means RA and
  // left/right means Dec — `roll` can turn the plate to any angle, and a
  // rolled edge can end up running mostly along either coordinate.
  ctx.strokeStyle = rgba(palette.dim, palette.invert ? 0.6 : 0.32);
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  const steps = 500;
  const edges: [number, number, number, number, 'x' | 'y', 1 | -1][] = [
    [b.left, b.top, b.right, b.top, 'y', 1], // top: ticks point down
    [b.left, b.bottom, b.right, b.bottom, 'y', -1], // bottom: ticks point up
    [b.left, b.top, b.left, b.bottom, 'x', 1], // left: ticks point right
    [b.right, b.top, b.right, b.bottom, 'x', -1], // right: ticks point left
  ];
  for (const [x0, y0, x1, y1, axis, dir] of edges) {
    for (const tick of walkEdge(view, x0, y0, x1, y1, steps)) {
      const t = (tick.major ? 6 : 3) * s;
      ctx.moveTo(tick.x, tick.y);
      if (axis === 'y') ctx.lineTo(tick.x, tick.y + t * dir);
      else ctx.lineTo(tick.x + t * dir, tick.y);
    }
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

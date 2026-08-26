import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, detailScale, plateRegions } from '../layout';
import { galacticToEquatorial, formatRaShort, formatDecShort, type SkyView } from '../sky';

/**
 * The real coordinate grid: equatorial meridians and parallels, optionally
 * overprinted with the galactic grid.
 *
 * Every curve is walked in sky coordinates and projected point by point, then
 * broken wherever the projection drops a vertex. A meridian is a straight line
 * on the sphere and almost never one on the plate, so sampling is the only way
 * to get it right — and the break is what stops a line that leaves the far side
 * of the sphere from reappearing as a chord across the plate.
 */

type SkyToEq = (a: number, b: number) => [number, number];

const EQUATORIAL: SkyToEq = (ra, dec) => [ra, dec];

interface GridStyle {
  color: string;
  alpha: number;
  lineWidth: number;
  dash: number[];
  /** Degrees between meridians and between parallels. */
  meridianStep: number;
  parallelStep: number;
  /** Every nth line is drawn heavier. */
  majorEvery: number;
}

/**
 * Walk one curve, projecting as it goes, and stroke the runs that survive.
 *
 * `maxJump` throws away a segment whose endpoints landed implausibly far apart:
 * near the clip boundary a projection can return two valid-looking points either
 * side of the horizon, and without this the plate gets a stray chord.
 */
function strokeCurve(
  ctx: CanvasRenderingContext2D,
  view: SkyView,
  toEq: SkyToEq,
  fixed: number,
  varyFrom: number,
  varyTo: number,
  steps: number,
  meridian: boolean,
  width: number,
  height: number,
): [number, number][] {
  const pad = Math.max(width, height) * 0.5;
  const maxJump = Math.max(width, height) * 0.35;
  const visible: [number, number][] = [];

  let prev: [number, number] | null = null;
  let open = false;

  for (let i = 0; i <= steps; i++) {
    const t = varyFrom + ((varyTo - varyFrom) * i) / steps;
    const [ra, dec] = meridian ? toEq(fixed, t) : toEq(t, fixed);
    const q = view.project(ra, dec);

    const ok =
      q !== null && q[0] > -pad && q[0] < width + pad && q[1] > -pad && q[1] < height + pad;

    if (!ok) {
      prev = null;
      open = false;
      continue;
    }
    const p = q as [number, number];
    if (p[0] >= 0 && p[0] <= width && p[1] >= 0 && p[1] <= height) visible.push(p);

    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > maxJump) {
      open = false;
    }
    if (!open) {
      ctx.moveTo(p[0], p[1]);
      open = true;
    } else {
      ctx.lineTo(p[0], p[1]);
    }
    prev = p;
  }

  return visible;
}

interface Tick {
  x: number;
  y: number;
  text: string;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  view: SkyView,
  toEq: SkyToEq,
  style: GridStyle,
  width: number,
  height: number,
  ticks: Tick[] | null,
): void {
  ctx.setLineDash(style.dash);

  // Sampling density follows the field: a 20-degree plate needs far finer steps
  // per degree than a 120-degree one to keep a curve smooth.
  const fine = Math.max(60, Math.round(2600 / Math.max(view.fov, 8)));

  for (const major of [false, true]) {
    ctx.strokeStyle = rgba(style.color, style.alpha * (major ? 1.7 : 1));
    ctx.lineWidth = style.lineWidth * (major ? 1.6 : 1);
    ctx.beginPath();

    for (let lon = 0; lon < 360; lon += style.meridianStep) {
      const isMajor = Math.round(lon / style.meridianStep) % style.majorEvery === 0;
      if (isMajor !== major) continue;
      const pts = strokeCurve(ctx, view, toEq, lon, -88, 88, fine, true, width, height);
      if (ticks && isMajor && pts.length > 0) {
        ticks.push({ ...pickTick(pts, width, height), text: formatRaShort(lon) });
      }
    }

    for (let lat = -80; lat <= 80; lat += style.parallelStep) {
      const isMajor = lat === 0 || Math.round(lat / style.parallelStep) % style.majorEvery === 0;
      if (isMajor !== major) continue;
      // A parallel is a full circle; walking it edge to edge in one pass keeps
      // the run continuous across 0h instead of breaking at the seam.
      const pts = strokeCurve(ctx, view, toEq, lat, 0, 360, fine * 2, false, width, height);
      if (ticks && isMajor && lat !== 0 && pts.length > 0) {
        ticks.push({ ...pickTick(pts, width, height), text: formatDecShort(lat) });
      }
    }

    ctx.stroke();
  }

  ctx.setLineDash([]);
}

/** The visible point closest to a plate edge — where a chart puts its tick. */
function pickTick(pts: [number, number][], width: number, height: number): { x: number; y: number } {
  let best = pts[0];
  let bestD = Infinity;
  for (const p of pts) {
    const d = Math.min(p[0], width - p[0], p[1], height - p[1]);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return { x: best[0], y: best[1] };
}

export function drawGraticule(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette, view } = data;

  const s = detailScale(width, height);
  const base = config.graticuleOpacity * (palette.invert ? 0.3 : 0.2);
  const { bounds } = plateRegions(width, height, config.margin);

  ctx.save();
  ctx.lineCap = 'butt';

  // Grid spacing tracks the field: 15 degrees of RA is one hour, which is the
  // right step for a wide plate and far too coarse for a narrow one.
  const wide = view.fov > 70;
  const narrow = view.fov < 30;
  const ticks: Tick[] = [];

  drawGrid(
    ctx,
    view,
    EQUATORIAL,
    {
      color: palette.dim,
      alpha: base,
      lineWidth: 0.8 * s,
      dash: [],
      meridianStep: wide ? 15 : narrow ? 3.75 : 7.5,
      parallelStep: wide ? 10 : narrow ? 2.5 : 5,
      majorEvery: 4,
    },
    width,
    height,
    ticks,
  );

  if (config.galacticGrid) {
    drawGrid(
      ctx,
      view,
      galacticToEquatorial,
      {
        color: palette.dim,
        alpha: base * 0.5,
        lineWidth: 0.7 * s,
        dash: [3 * s, 5 * s],
        meridianStep: wide ? 15 : 10,
        parallelStep: wide ? 15 : 10,
        majorEvery: 3,
      },
      width,
      height,
      null,
    );
  }

  // Coordinate ticks along the plate edge. Faint enough to read as part of the
  // grid rather than as annotation, which draws later and in ink.
  ctx.font = `${Math.round(9 * s)}px ${MONO}`;
  ctx.fillStyle = rgba(palette.dim, Math.min(0.75, config.graticuleOpacity * 0.9));
  ctx.textBaseline = 'middle';
  const seen: [number, number][] = [];

  for (const t of ticks) {
    // Only label a tick that actually reached the margin.
    const edgeDist = Math.min(t.x, width - t.x, t.y, height - t.y);
    if (edgeDist > bounds.left * 1.6) continue;
    if (seen.some(([x, y]) => Math.hypot(x - t.x, y - t.y) < 46 * s)) continue;
    seen.push([t.x, t.y]);

    const left = t.x < width * 0.5;
    ctx.textAlign = left ? 'left' : 'right';
    const x = Math.min(Math.max(t.x + (left ? 5 * s : -5 * s), bounds.left), bounds.right);
    const y = Math.min(Math.max(t.y, bounds.top), bounds.bottom);
    ctx.fillText(t.text, x, y);
  }

  ctx.restore();
}

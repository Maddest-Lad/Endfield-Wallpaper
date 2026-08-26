import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { detailScale } from '../layout';

interface Pole {
  x: number;
  y: number;
  maxR: number;
}

/**
 * Pick a projection pole outside (or barely inside) the plate. A pole in the
 * middle of the canvas gives concentric bullseyes; a pole off the edge is what
 * makes the arcs read as curvature.
 */
function choosePole(rng: () => number, width: number, height: number): Pole {
  const px =
    rng() < 0.5 ? randomInRange(rng, -0.5, 0.08) : randomInRange(rng, 0.92, 1.5);
  const py = randomInRange(rng, -0.4, 1.4);
  const x = px * width;
  const y = py * height;
  const maxR = Math.max(
    Math.hypot(x, y),
    Math.hypot(width - x, y),
    Math.hypot(x, height - y),
    Math.hypot(width - x, height - y),
  );
  return { x, y, maxR };
}

function drawProjection(
  ctx: CanvasRenderingContext2D,
  pole: Pole,
  rings: number,
  meridians: number,
  color: string,
  alpha: number,
  lineWidth: number,
  meridianPhase: number,
): void {
  const step = pole.maxR / rings;

  for (let i = 1; i <= rings; i++) {
    // Every fourth parallel is a "major" line, as on a printed graticule.
    const major = i % 4 === 0;
    ctx.strokeStyle = rgba(color, alpha * (major ? 1.6 : 1));
    ctx.lineWidth = lineWidth * (major ? 1.5 : 1);
    ctx.beginPath();
    ctx.arc(pole.x, pole.y, i * step, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let m = 0; m < meridians; m++) {
    const a = meridianPhase + (m / meridians) * Math.PI * 2;
    const major = m % 3 === 0;
    ctx.strokeStyle = rgba(color, alpha * (major ? 1.5 : 0.85));
    ctx.lineWidth = lineWidth * (major ? 1.4 : 1);
    ctx.beginPath();
    ctx.moveTo(pole.x + Math.cos(a) * step * 0.6, pole.y + Math.sin(a) * step * 0.6);
    ctx.lineTo(pole.x + Math.cos(a) * pole.maxR, pole.y + Math.sin(a) * pole.maxR);
    ctx.stroke();
  }
}

/** Polar coordinate grid, optionally overprinted with a second projection. */
export function drawGraticule(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette } = data;

  const s = detailScale(width, height);
  const base = config.graticuleOpacity * (palette.invert ? 0.24 : 0.16);

  ctx.save();
  ctx.lineCap = 'butt';

  const primary = choosePole(rng, width, height);
  drawProjection(ctx, primary, 22, 24, palette.dim, base, 0.8 * s, rng() * Math.PI);

  if (config.secondaryProjection) {
    const secondary = choosePole(rng, width, height);
    ctx.setLineDash([3 * s, 5 * s]);
    drawProjection(
      ctx,
      secondary,
      13,
      15,
      palette.dim,
      base * 0.55,
      0.7 * s,
      rng() * Math.PI,
    );
    ctx.setLineDash([]);
  }

  ctx.restore();
}

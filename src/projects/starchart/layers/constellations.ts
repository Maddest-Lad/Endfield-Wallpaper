import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, detailScale, drawLabel, plateRegions } from '../layout';

/**
 * The real IAU constellation figures.
 *
 * Each segment stops short of the star at either end. That gap is the whole
 * trick: a line that touches the dot reads as plotted data, a line that stops
 * just shy of it reads as drawn by a cartographer. The endpoints here are real
 * stars, so the hold-off is looked up from the star actually at that point
 * rather than guessed — a first-magnitude vertex needs a wider berth than a
 * fourth-magnitude one.
 */
export function drawConstellations(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette, figures, starAt } = data;
  if (figures.length === 0) return;

  const s = detailScale(width, height);
  const { bounds } = plateRegions(width, height, config.margin);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.9 * s;
  ctx.strokeStyle = rgba(palette.ink, palette.invert ? 0.45 : 0.34);

  const holdOff = (x: number, y: number): number => {
    const st = starAt(x, y, 7 * s);
    return (st ? st.r : 1.2 * s) + 3.2 * s;
  };

  ctx.beginPath();
  for (const fig of figures) {
    for (const path of fig.paths) {
      for (let i = 0; i + 1 < path.length; i++) {
        const [ax, ay] = path[i];
        const [bx, by] = path[i + 1];
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        const ux = dx / len;
        const uy = dy / len;
        const gapA = holdOff(ax, ay);
        const gapB = holdOff(bx, by);
        if (gapA + gapB >= len) continue;
        ctx.moveTo(ax + ux * gapA, ay + uy * gapA);
        ctx.lineTo(bx - ux * gapB, by - uy * gapB);
      }
    }
  }
  ctx.stroke();

  if (!config.constellationLabels) {
    ctx.restore();
    return;
  }

  // Name only the figures substantially on the plate. A constellation clipped to
  // one corner gets its line-work but not its name, the same way a printed chart
  // handles it.
  ctx.font = `${Math.round(12 * s)}px ${MONO}`;
  ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.55 : 0.4);
  for (const fig of figures) {
    if (!fig.label || fig.coverage < 0.6) continue;
    const spaced = fig.name.split('').join(' ');
    drawLabel(ctx, spaced, fig.label[0], fig.label[1], 'center', bounds, 14 * s);
  }

  ctx.restore();
}

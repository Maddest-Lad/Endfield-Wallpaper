import type { RenderContext } from '@core/project/types';
import { randomInRange, randomInt, shuffle } from '@core/utils/random';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { MONO, arrowHead, detailScale, placeLabel, plateRegions } from '../layout';
import { angularSeparation, formatAngle } from '../sky';

/**
 * Engineering-drawing dimension callouts between real stars: extension lines, an
 * offset dimension line with arrowheads at both ends, and the measurement
 * knocked out of the middle.
 *
 * The measurement is the real great-circle separation of the two stars, in
 * degrees or arcminutes. That is the one number on the plate that could be
 * checked against the sky and come out right, which is why it is worth the
 * haversine rather than reading the distance off the pixels.
 */
export function drawCallouts(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, beacons, routeNodes } = data;

  // Route nodes are already pinned to real stars, so either pool carries the sky
  // coordinates the measurement needs.
  const pool = routeNodes.length >= 4 ? routeNodes.map((n) => n.star) : beacons;
  if (pool.length < 4) return;

  const s = detailScale(width, height);
  const { bounds } = plateRegions(width, height, config.margin);
  const short = Math.min(width, height);
  const fontSize = Math.round(9.5 * s);

  const order = shuffle(
    rng,
    pool.map((_, i) => i),
  );
  const wanted = randomInt(rng, 2, 5);

  ctx.save();
  ctx.font = `${fontSize}px ${MONO}`;
  ctx.lineCap = 'butt';

  let made = 0;
  for (let i = 0; i + 1 < order.length && made < wanted; i += 2) {
    const a = pool[order[i]];
    const b = pool[order[i + 1]];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    // Too short and the arrowheads meet; too long and it spans the whole plate.
    if (len < short * 0.16 || len > short * 0.62) continue;

    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const off = randomInRange(rng, 10, 26) * s * (rng() < 0.5 ? -1 : 1);

    const a2 = { x: a.x + px * off, y: a.y + py * off };
    const b2 = { x: b.x + px * off, y: b.y + py * off };
    if (
      a2.x < bounds.left ||
      a2.x > bounds.right ||
      b2.x < bounds.left ||
      b2.x > bounds.right ||
      a2.y < bounds.top ||
      a2.y > bounds.bottom ||
      b2.y < bounds.top ||
      b2.y > bounds.bottom
    ) {
      continue;
    }

    const text = formatAngle(angularSeparation(a.ra, a.dec, b.ra, b.dec));
    const mid = { x: (a2.x + b2.x) / 2, y: (a2.y + b2.y) / 2 };
    const placed = placeLabel(ctx, text, mid.x, mid.y, 'center', bounds, fontSize * 1.4);
    if (!placed) continue;

    // Dimension callouts are draughting marks, not network: neutral ink.
    const stroke = rgba(palette.ink, palette.invert ? 0.7 : 0.5);
    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    ctx.lineWidth = 0.8 * s;

    // Extension lines, held off the point itself.
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(a.x + px * Math.sign(off) * 4 * s, a.y + py * Math.sign(off) * 4 * s);
    ctx.lineTo(a2.x + px * Math.sign(off) * 4 * s, a2.y + py * Math.sign(off) * 4 * s);
    ctx.moveTo(b.x + px * Math.sign(off) * 4 * s, b.y + py * Math.sign(off) * 4 * s);
    ctx.lineTo(b2.x + px * Math.sign(off) * 4 * s, b2.y + py * Math.sign(off) * 4 * s);
    ctx.stroke();

    // Dimension line, broken around the text.
    const half = ctx.measureText(text).width / 2 + 5 * s;
    ctx.lineWidth = 0.9 * s;
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(mid.x - ux * half, mid.y - uy * half);
    ctx.moveTo(mid.x + ux * half, mid.y + uy * half);
    ctx.lineTo(b2.x, b2.y);
    ctx.stroke();

    arrowHead(ctx, a2.x, a2.y, -ux, -uy, 6 * s);
    arrowHead(ctx, b2.x, b2.y, ux, uy, 6 * s);

    ctx.fillStyle = rgba(palette.ink, palette.invert ? 0.85 : 0.72);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, placed.x, placed.y);
    made++;
  }

  ctx.restore();
}

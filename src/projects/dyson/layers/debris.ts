import type { RenderContext } from '@core/project/types';
import { randomInRange, randomInt } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { rgba } from '../palette';
import { ringPoint, TAU } from '../geometry';

const MAX_SWARM = 1400;
const P: [number, number, number] = [0, 0, 0];

/** Two rng draws differenced: clusters toward zero, with occasional outliers. */
function jitter(rng: () => number): number {
  return rng() - rng();
}

/**
 * The construction swarm: tugs, tenders and hab-blocks working the trusses.
 *
 * Placement along a ring is clumped, not uniform — a fleet gathers at the work
 * face and leaves the finished arc empty. Even spacing here reads as a string
 * of fairy lights rather than a swarm, which is why the ring-attached majority
 * draws from a handful of seeded work sites and scatters off the ring path in
 * all three axes.
 */
export function drawDebris(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette, rings } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  // Scale with area, or a 4K plate ends up with the same swarm spread over four
  // times the canvas.
  const area = (width * height) / (1920 * 1080);
  const count = Math.round(MAX_SWARM * config.debrisDensity * Math.min(3, Math.max(0.6, area)));
  if (count === 0) return;

  const scale = Math.min(width, height) / 1080;

  // Work sites: a few per ring, each with its own spread and weight.
  const sites: { ring: number; t: number; spread: number }[] = [];
  for (let r = 0; r < rings.length; r++) {
    const n = randomInt(rng, 3, 7);
    for (let k = 0; k < n; k++) {
      sites.push({
        ring: r,
        t: randomInRange(rng, 0, TAU),
        spread: randomInRange(rng, 0.06, 0.5),
      });
    }
  }

  ctx.save();

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;
    let z: number;
    let atWork = false;

    const mode = rng();

    if (sites.length > 0 && mode < 0.55) {
      // Clumped at a work site.
      const site = sites[Math.floor(rng() * sites.length)];
      const ring = rings[site.ring];
      const t = site.t + jitter(rng) * site.spread;
      const r = ring.a + jitter(rng) * (ring.halfWidth * 6 + 0.09);
      ringPoint(ring, t, r, P);
      x = P[0] + jitter(rng) * 0.04;
      y = P[1] + jitter(rng) * 0.04;
      z = P[2] + jitter(rng) * 0.12;
      atWork = true;
    } else if (rings.length > 0 && mode < 0.72) {
      // Stragglers strung out along the whole truss, well off the rail.
      const ring = rings[Math.floor(rng() * rings.length)];
      const t = randomInRange(rng, 0, TAU);
      const r = ring.a + jitter(rng) * (ring.halfWidth * 10 + 0.22);
      ringPoint(ring, t, r, P);
      x = P[0] + jitter(rng) * 0.08;
      y = P[1] + jitter(rng) * 0.08;
      z = P[2] + jitter(rng) * 0.25;
    } else {
      // Free orbit, thinning outward.
      const ang = randomInRange(rng, 0, TAU);
      const rad = 1.06 + Math.pow(rng(), 1.7) * 1.84;
      x = Math.cos(ang) * rad;
      y = Math.sin(ang) * rad;
      z = randomInRange(rng, -1, 1) * rad;
    }

    if (z < 0 && Math.hypot(x, y) < 1) continue;

    const sx = cx + x * R;
    const sy = cy + y * R;
    if (sx < -20 || sy < -20 || sx > width + 20 || sy > height + 20) continue;

    const roll = rng();
    const depthFade = z < 0 ? 0.4 : 1;

    // Heavily weighted to specks. The few blocks only read as vehicles because
    // almost everything around them doesn't.
    if (roll < 0.89) {
      ctx.globalAlpha = randomInRange(rng, 0.14, 0.8) * depthFade;
      ctx.fillStyle = rng() < 0.12 ? palette.accentSoft : palette.structureLit;
      const s = Math.max(0.55, scale * randomInRange(rng, 0.5, 1.25));
      ctx.fillRect(sx, sy, s, s);
      continue;
    }

    const big = roll > 0.985;
    const w = Math.max(1.2, scale * randomInRange(rng, big ? 3.4 : 1.5, big ? 6.5 : 3.2));
    const h = Math.max(0.9, w * randomInRange(rng, 0.3, 0.75));
    const lit = atWork && rng() < 0.35;

    ctx.globalAlpha = randomInRange(rng, 0.55, 0.9) * depthFade;
    ctx.fillStyle = palette.structureDark;
    ctx.fillRect(sx - w / 2, sy - h / 2, w, h);
    ctx.globalAlpha = randomInRange(rng, 0.5, 0.9) * depthFade;
    ctx.fillStyle = lit ? palette.accent : palette.structureLit;
    ctx.fillRect(sx - w / 2, sy - h / 2, w, Math.max(0.6, h * 0.32));

    if (lit && big) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = depthFade;
      const glow = w * 3.2;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, glow);
      g.addColorStop(0, rgba(palette.accentRgb, 0.35));
      g.addColorStop(1, rgba(palette.accentRgb, 0));
      ctx.fillStyle = g;
      ctx.fillRect(sx - glow, sy - glow, glow * 2, glow * 2);
      ctx.restore();
    }
  }

  ctx.restore();
}

import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { rgba } from '../palette';

/** The star sits just inside the shell, so gaps in the construction show it through. */
const CORE_FRACTION = 0.9;

export function drawStarCore(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  const r = R * CORE_FRACTION;
  const power = 0.4 + config.coreIntensity * 0.6;

  ctx.save();

  // Photosphere. Opaque, so the shell above it is genuinely occluding something.
  const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  disc.addColorStop(0, palette.coreWhite);
  disc.addColorStop(0.35, palette.coreBright);
  disc.addColorStop(0.72, palette.coreMid);
  disc.addColorStop(1, palette.coreRim);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Granulation, clipped to the disc.
  ctx.save();
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const ang = randomInRange(rng, 0, Math.PI * 2);
    const rad = Math.sqrt(rng()) * r * 0.95;
    const bx = cx + Math.cos(ang) * rad;
    const by = cy + Math.sin(ang) * rad;
    const br = r * randomInRange(rng, 0.08, 0.3);
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, rgba(palette.coreRgb, randomInRange(rng, 0.06, 0.2)));
    g.addColorStop(1, rgba(palette.coreRgb, 0));
    ctx.fillStyle = g;
    ctx.fillRect(bx - br, by - br, br * 2, br * 2);
  }
  ctx.restore();

  // Limb brightening, then a hot rim line right at the edge.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const limb = ctx.createRadialGradient(cx, cy, r * 0.72, cx, cy, r);
  limb.addColorStop(0, rgba(palette.coreRgb, 0));
  limb.addColorStop(1, rgba(palette.coreRgb, 0.45 * power));
  ctx.fillStyle = limb;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.coreWhite;
  ctx.globalAlpha = 0.55 * power;
  ctx.lineWidth = Math.max(0.8, R * 0.006);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Bleed past the photosphere, so the star isn't a hard-edged circle.
  const bleed = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.35);
  bleed.addColorStop(0, rgba(palette.coreRgb, 0.5 * power));
  bleed.addColorStop(1, rgba(palette.coreRgb, 0));
  ctx.globalAlpha = 1;
  ctx.fillStyle = bleed;
  ctx.fillRect(cx - r * 1.4, cy - r * 1.4, r * 2.8, r * 2.8);
  ctx.restore();

  ctx.restore();
}

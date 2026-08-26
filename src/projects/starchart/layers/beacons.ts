import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';
import { detailScale } from '../layout';

/**
 * Magnitude-0 anchors: soft radial bloom, a subtle four-point diffraction cross,
 * and a hard core. This is the only place in the plate that gets to be bright, so
 * the count is deliberately tiny.
 */
export function drawBeacons(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette, beacons } = data;
  const bloom = config.starBloom;
  if (beacons.length === 0) return;

  const s = detailScale(width, height);
  const tints = [palette.star, palette.warm, palette.cool];

  ctx.save();
  if (!palette.invert) ctx.globalCompositeOperation = 'lighter';

  for (const st of beacons) {
    const tint = tints[st.tint];
    const spread = st.r * (3.2 + bloom * 16);

    if (bloom > 0.02) {
      const grad = ctx.createRadialGradient(st.x, st.y, 0, st.x, st.y, spread);
      const peak = bloom * (palette.invert ? 0.22 : 0.5);
      grad.addColorStop(0, rgba(tint, peak));
      grad.addColorStop(0.32, rgba(tint, peak * 0.3));
      grad.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(st.x, st.y, spread, 0, Math.PI * 2);
      ctx.fill();

      // Diffraction cross: two axes, each a symmetric gradient so the spikes
      // fade out instead of ending in a hard stop.
      const arm = spread * randomInRange(rng, 0.85, 1.5);
      const strength = bloom * (palette.invert ? 0.16 : 0.42);
      ctx.lineWidth = Math.max(0.6, 0.75 * s);
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const g = ctx.createLinearGradient(
          st.x - dx * arm,
          st.y - dy * arm,
          st.x + dx * arm,
          st.y + dy * arm,
        );
        g.addColorStop(0, rgba(tint, 0));
        g.addColorStop(0.5, rgba(tint, strength));
        g.addColorStop(1, rgba(tint, 0));
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(st.x - dx * arm, st.y - dy * arm);
        ctx.lineTo(st.x + dx * arm, st.y + dy * arm);
        ctx.stroke();
      }
    }

    ctx.fillStyle = rgba(tint, st.alpha);
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

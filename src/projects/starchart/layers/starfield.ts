import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba, starTint } from '../palette';

/**
 * Every catalogued star in the field except the beacons, which the layer above
 * draws with their bloom.
 *
 * Sub-pixel stars are filled as rects rather than arcs: an arc smaller than half
 * a pixel costs the same as a full circle and antialiases to the same smudge.
 * At magnitude 8 across a wide field that is most of them.
 */
export function drawStarfield(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, config, data } = rc;
  const { palette, stars, beacons } = data;
  const skip = new Set(beacons.map((b) => b.idx));

  ctx.save();
  for (const st of stars) {
    if (skip.has(st.idx)) continue;
    ctx.fillStyle = rgba(starTint(palette, st.temp, config.spectralTint), st.alpha);
    if (st.r < 0.75) {
      const d = st.r * 2;
      ctx.fillRect(st.x - st.r, st.y - st.r, d, d);
    } else {
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

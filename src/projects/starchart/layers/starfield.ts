import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgba } from '../palette';

/**
 * Every catalogue entry except the magnitude-0 anchors, which the `beacons`
 * layer draws with their bloom.
 *
 * Sub-pixel stars are filled as rects rather than arcs: an arc smaller than half
 * a pixel costs the same as a full circle and antialiases to the same smudge.
 */
export function drawStarfield(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, data } = rc;
  const { palette, stars } = data;
  const tints = [palette.star, palette.warm, palette.cool];

  ctx.save();
  for (const st of stars) {
    if (st.mag === 0) continue;
    ctx.fillStyle = rgba(tints[st.tint], st.alpha);
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

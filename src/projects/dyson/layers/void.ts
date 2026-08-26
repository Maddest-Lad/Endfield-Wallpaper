import type { RenderContext } from '@core/project/types';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';

/**
 * Opaque ground. The first layer must cover every pixel — the pipeline never
 * clears, which is what stops a flash between frames.
 */
export function drawVoid(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, data } = rc;
  const { palette } = data;

  ctx.save();
  ctx.fillStyle = palette.voidOuter;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const reach = Math.hypot(width, height) / 2;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
  g.addColorStop(0, palette.voidInner);
  g.addColorStop(0.55, palette.voidInner);
  g.addColorStop(1, palette.voidOuter);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

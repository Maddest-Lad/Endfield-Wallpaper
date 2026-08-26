import type { RenderContext } from '@core/project/types';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { drawRingHalf } from './ringDraw';

/** The z > 0 half of every truss — drawn over the shell, closing the illusion. */
export function drawRingsNear(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, data } = rc;
  const frame = frameOf(config, width, height);

  ctx.save();
  for (const ring of data.rings) {
    drawRingHalf(ctx, ring, frame, data.palette, true);
  }
  ctx.restore();
}

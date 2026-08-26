import type { RenderContext } from '@core/project/types';
import type { BlankConfig } from '../config';

/** Opaque fill. The first layer must cover every pixel — the pipeline never clears. */
export function drawBackground(rc: RenderContext<BlankConfig, void>): void {
  const { ctx, width, height, config } = rc;
  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, width, height);
}

import type { RenderContext } from '../types';

export function drawBackground(rc: RenderContext): void {
  const { ctx, width, height, palette } = rc;

  // Solid fill
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);
}

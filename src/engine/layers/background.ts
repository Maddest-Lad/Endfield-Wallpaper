import type { RenderContext } from '../types';

export function drawBackground(rc: RenderContext): void {
  const { ctx, width, height, palette, rng } = rc;

  // Solid fill
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain noise
  const grainOpacity = rc.config.paperGrain;
  const step = Math.max(4, Math.floor(width / 480));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const brightness = rng() * 255;
      ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${grainOpacity})`;
      ctx.fillRect(x, y, step, step);
    }
  }
}

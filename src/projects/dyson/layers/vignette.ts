import type { RenderContext } from '@core/project/types';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';

/**
 * Corner falloff plus a sparse grain. Drawn last, over everything, to pull the
 * eye back to the star and to stop the additive passes banding at 4K.
 */
export function drawVignette(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng } = rc;

  const cx = width / 2;
  const cy = height / 2;
  const reach = Math.hypot(width, height) / 2;
  const strength = config.vignette;

  ctx.save();

  const g = ctx.createRadialGradient(cx, cy, reach * 0.28, cx, cy, reach);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(0.62, `rgba(0, 0, 0, ${(strength * 0.28).toFixed(3)})`);
  g.addColorStop(1, `rgba(0, 0, 0, ${(strength * 0.85).toFixed(3)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // Sparse dithering. Per-pixel noise at 4K would cost 8M writes for an effect
  // nobody can see; scattered dots break the same gradient banding for ~1% of it.
  const dots = Math.round((width * height) / 26000);
  ctx.globalAlpha = 0.035;
  for (let i = 0; i < dots; i++) {
    ctx.fillStyle = rng() < 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(rng() * width, rng() * height, 1, 1);
  }

  ctx.restore();
}

import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { rgba } from '../palette';

/** Stars per megapixel at density 1. */
const STARS_PER_MP = 1900;

/**
 * Three magnitude classes. Most stars are a sub-pixel dot; a minority carry a
 * soft bloom; a handful get a cross-flare. Mixing the classes is what stops a
 * star field reading as noise.
 */
export function drawStarfield(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;

  const unit = Math.min(width, height);
  const scale = unit / 1080;
  const megapixels = (width * height) / 1_000_000;
  const count = Math.round(megapixels * STARS_PER_MP * config.starDensity);

  ctx.save();

  for (let i = 0; i < count; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const roll = rng();
    const warm = rng() < 0.3;
    const tint = warm ? palette.starDim : palette.starBright;

    if (roll < 0.84) {
      // Faint field. A sub-pixel rect beats an arc here: no path setup per star.
      ctx.globalAlpha = randomInRange(rng, 0.12, 0.5);
      ctx.fillStyle = tint;
      ctx.fillRect(x, y, Math.max(0.6, scale * 0.9), Math.max(0.6, scale * 0.9));
      continue;
    }

    const r = randomInRange(rng, 0.9, roll < 0.97 ? 1.8 : 3.1) * scale;

    if (roll >= 0.97) {
      const halo = r * 7;
      const g = ctx.createRadialGradient(x, y, 0, x, y, halo);
      g.addColorStop(0, rgba(palette.coreRgb, 0.5));
      g.addColorStop(0.3, rgba(palette.coreRgb, 0.12));
      g.addColorStop(1, rgba(palette.coreRgb, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(x - halo, y - halo, halo * 2, halo * 2);

      ctx.globalAlpha = randomInRange(rng, 0.3, 0.6);
      ctx.strokeStyle = palette.starBright;
      ctx.lineWidth = Math.max(0.6, scale * 0.7);
      const arm = r * randomInRange(rng, 3.5, 7);
      ctx.beginPath();
      ctx.moveTo(x - arm, y);
      ctx.lineTo(x + arm, y);
      ctx.moveTo(x, y - arm * 0.7);
      ctx.lineTo(x, y + arm * 0.7);
      ctx.stroke();
    } else {
      const halo = r * 3.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, halo);
      g.addColorStop(0, rgba(palette.coreRgb, 0.28));
      g.addColorStop(1, rgba(palette.coreRgb, 0));
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(x - halo, y - halo, halo * 2, halo * 2);
    }

    ctx.globalAlpha = randomInRange(rng, 0.7, 1);
    ctx.fillStyle = palette.starBright;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

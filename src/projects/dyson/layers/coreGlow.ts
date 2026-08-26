import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { frameOf } from '../frame';
import { rgba } from '../palette';

/**
 * The star's outer halo, laid down before any structure so the rings and shell
 * read as silhouetted against it. Everything here fades to zero alpha, so the
 * additive passes inside the layer composite honestly over the star field.
 */
export function drawCoreGlow(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;
  const { cx, cy, R } = frameOf(config, width, height);

  const reach = R * (1.7 + config.coreIntensity * 2.6);
  const power = 0.35 + config.coreIntensity * 0.65;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, reach);
  halo.addColorStop(0, rgba(palette.coreRgb, 0.55 * power));
  halo.addColorStop(0.22, rgba(palette.coreRgb, 0.2 * power));
  halo.addColorStop(0.6, rgba(palette.coreRgb, 0.05 * power));
  halo.addColorStop(1, rgba(palette.coreRgb, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);

  const inner = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.35);
  inner.addColorStop(0, rgba(palette.accentRgb, 0.18 * power));
  inner.addColorStop(1, rgba(palette.accentRgb, 0));
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, width, height);

  // A handful of long, faint god-rays. Seeded, so they hold across a reload.
  const rays = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < rays; i++) {
    const ang = randomInRange(rng, 0, Math.PI * 2);
    const len = reach * randomInRange(rng, 0.75, 1.25);
    const w = R * randomInRange(rng, 0.03, 0.11);
    const ex = cx + Math.cos(ang) * len;
    const ey = cy + Math.sin(ang) * len;
    const g = ctx.createLinearGradient(cx, cy, ex, ey);
    g.addColorStop(0, rgba(palette.coreRgb, 0.16 * power));
    g.addColorStop(1, rgba(palette.coreRgb, 0));
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  ctx.restore();
}

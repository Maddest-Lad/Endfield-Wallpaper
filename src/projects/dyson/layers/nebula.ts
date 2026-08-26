import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import type { RenderContext } from '@core/project/types';
import { randomInRange } from '@core/utils/random';
import type { DysonConfig } from '../config';
import type { DysonData } from '../derive';
import { rgba } from '../palette';

/** Long axis of the noise buffer. Upscaling is what makes the plumes soft. */
const BUFFER_LONG = 220;

/**
 * Three tinted plumes of layered simplex noise, added rather than blended.
 *
 * Evaluated into a small offscreen buffer and upscaled — a per-pixel fbm at 4K
 * would be ~8M noise calls per octave, and the result would be too sharp anyway.
 */
export function drawNebula(rc: RenderContext<DysonConfig, DysonData>): void {
  const { ctx, width, height, config, rng, data } = rc;
  const { palette } = data;

  const aspect = width / height;
  const bw = Math.max(8, aspect >= 1 ? BUFFER_LONG : Math.round(BUFFER_LONG * aspect));
  const bh = Math.max(8, aspect >= 1 ? Math.round(BUFFER_LONG / aspect) : BUFFER_LONG);

  const buffer = new OffscreenCanvas(bw, bh);
  const bctx = buffer.getContext('2d');
  if (!bctx) return;

  const img = bctx.createImageData(bw, bh);
  const px = img.data;

  const plumes = palette.nebulaRgb.map((tint, i) => ({
    tint,
    noise: createNoise2D(alea(config.seed + '_plume' + i)),
    // Each plume drifts to its own quadrant so they read as separate clouds.
    ox: randomInRange(rng, -0.5, 0.5),
    oy: randomInRange(rng, -0.5, 0.5),
    scale: randomInRange(rng, 1.5, 3.2),
    gain: randomInRange(rng, 0.6, 1),
  }));

  for (let y = 0; y < bh; y++) {
    const ny = y / bh - 0.5;
    for (let x = 0; x < bw; x++) {
      const nx = (x / bw - 0.5) * aspect;
      let r = 0;
      let g = 0;
      let b = 0;

      for (const p of plumes) {
        const sx = (nx - p.ox) * p.scale;
        const sy = (ny - p.oy) * p.scale;
        let v = 0;
        let amp = 1;
        let freq = 1;
        for (let o = 0; o < 4; o++) {
          v += amp * p.noise(sx * freq, sy * freq);
          amp *= 0.5;
          freq *= 2.1;
        }
        v = (v / 1.875 + 1) / 2;
        // Cubed: keeps the field mostly empty so the plumes have real edges.
        const m = Math.max(0, v - 0.42) / 0.58;
        const w = m * m * m * p.gain;
        r += p.tint[0] * w;
        g += p.tint[1] * w;
        b += p.tint[2] * w;
      }

      // Intensity rides in the alpha channel, not the colour. Each layer is
      // composited source-over by the pipeline, so an opaque buffer would paint
      // near-black over the void gradient instead of glowing on top of it.
      const i = (y * bw + x) * 4;
      const lum = Math.max(r, g, b);
      if (lum < 1) {
        px[i + 3] = 0;
        continue;
      }
      const norm = 255 / lum;
      px[i] = Math.min(255, r * norm);
      px[i + 1] = Math.min(255, g * norm);
      px[i + 2] = Math.min(255, b * norm);
      px[i + 3] = Math.min(255, lum * 1.35);
    }
  }

  bctx.putImageData(img, 0, 0);

  ctx.save();
  ctx.globalAlpha = config.nebulaStrength * 0.85;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(buffer, 0, 0, width, height);

  // Two broad haze washes, to give the plumes something to sit inside. These
  // fade to zero alpha, so adding them within this layer stays honest.
  ctx.globalCompositeOperation = 'lighter';
  const unit = Math.min(width, height);
  for (let i = 0; i < 2; i++) {
    const bx = width * randomInRange(rng, 0.2, 0.8);
    const by = height * randomInRange(rng, 0.2, 0.8);
    const br = unit * randomInRange(rng, 0.5, 1.1);
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    grad.addColorStop(0, rgba(palette.nebulaRgb[i % palette.nebulaRgb.length], 0.1));
    grad.addColorStop(1, rgba(palette.nebulaRgb[i % palette.nebulaRgb.length], 0));
    ctx.globalAlpha = config.nebulaStrength * 0.6;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
  buffer.width = 0;
  buffer.height = 0;
}

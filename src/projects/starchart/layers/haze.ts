import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgbTriplet } from '../palette';
import { detailScale } from '../layout';

/**
 * The milky way: the haze field painted at one twelfth resolution and scaled up
 * with smoothing. It is a low-frequency wash, so sampling it per pixel buys
 * nothing but time — and the browser's bilinear upscale is exactly the blur the
 * effect wants.
 */
export function drawHaze(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data } = rc;
  const { palette, haze } = data;

  const s = detailScale(width, height);
  const step = Math.max(2, Math.round(6 * s));
  const gw = Math.max(2, Math.ceil(width / step));
  const gh = Math.max(2, Math.ceil(height / step));

  const off = new OffscreenCanvas(gw, gh);
  const octx = off.getContext('2d');
  if (!octx) return;

  const img = octx.createImageData(gw, gh);
  const [r, g, b] = rgbTriplet(palette.haze);
  const gain = config.hazeStrength * (palette.invert ? 0.62 : 0.95);

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const f = haze.at((x + 0.5) * step, (y + 0.5) * step);
      const i = (y * gw + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = Math.round(Math.min(1, f * gain) * 255);
    }
  }
  octx.putImageData(img, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Additive on dark stock reads as light through gas; on cream it must stay a
  // plain wash, or the stain brightens the paper instead of staining it.
  ctx.globalCompositeOperation = palette.invert ? 'source-over' : 'lighter';
  ctx.drawImage(off, 0, 0, gw, gh, 0, 0, width, height);
  ctx.restore();
}

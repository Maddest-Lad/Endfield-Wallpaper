import type { RenderContext } from '@core/project/types';
import type { StarchartConfig } from '../config';
import type { StarchartData } from '../derive';
import { rgbTriplet } from '../palette';
import { detailScale } from '../layout';

const GRAIN_TILE = 128;

/**
 * The plate stock. Opaque and full-bleed — the first layer must cover every
 * pixel, because the pipeline never calls clearRect.
 *
 * Grain is a small seeded tile repeated as a pattern rather than a full-resolution
 * ImageData: at 4K the latter is eight million random draws for an effect nobody
 * can resolve.
 */
export function drawPlate(rc: RenderContext<StarchartConfig, StarchartData>): void {
  const { ctx, width, height, config, data, rng } = rc;
  const { palette } = data;

  ctx.save();
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, 0, width, height);

  if (config.grain > 0.01) {
    const tile = new OffscreenCanvas(GRAIN_TILE, GRAIN_TILE);
    const tctx = tile.getContext('2d');
    if (tctx) {
      const img = tctx.createImageData(GRAIN_TILE, GRAIN_TILE);
      const [r, g, b] = rgbTriplet(palette.ink);
      const peak = config.grain * (palette.invert ? 46 : 30);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = rng();
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        // Squared falloff: mostly clean stock with a sparse scatter of specks.
        img.data[i + 3] = Math.round(n * n * peak);
      }
      tctx.putImageData(img, 0, 0);
      const pattern = ctx.createPattern(tile, 'repeat');
      if (pattern) {
        const s = detailScale(width, height);
        // Grain scales with the plate so a 4K render is the same drawing enlarged.
        const m = new DOMMatrix();
        pattern.setTransform(m.scale(s, s));
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }
    }
  }

  ctx.restore();
}

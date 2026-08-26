import type { BaseConfig, Pipeline } from '../project/types';
import { createRng } from '../utils/random';
import { loadFonts } from '../canvas/fonts';
import type { LayerCache } from './layerCache';

/**
 * Draw a project's pipeline onto `canvas`.
 *
 * Pass a `cache` for the live preview, where the same dimensions recur and only
 * a few layers change between frames. Pass `null` for one-shot renders (export):
 * caching a 4K render buys nothing, evicts every preview-sized entry, and retains
 * hundreds of MB of canvases.
 */
export async function renderPipeline<C extends BaseConfig, D>(
  pipeline: Pipeline<C, D>,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: C,
  dpr: number,
  cache: LayerCache | null,
): Promise<void> {
  await loadFonts(pipeline.fonts ?? []);

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) throw new Error('Could not get 2D context');

  const width = Math.max(100, config.width);
  const height = Math.max(100, config.height);

  const bufW = Math.round(width * dpr);
  const bufH = Math.round(height * dpr);
  if (canvas.width !== bufW || canvas.height !== bufH) {
    canvas.width = bufW;
    canvas.height = bufH;
  }

  const data = await pipeline.derive(config, width, height);
  const base = `${width}|${height}|${pipeline.baseKey(config)}`;

  // Composite in order. No clearRect needed — the first layer is expected to be
  // an opaque background covering every pixel, which avoids a flash between frames.
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  for (const layer of pipeline.layers) {
    if (layer.enabled && !layer.enabled(config)) continue;

    const key = layer.cacheKey ? `${base}|${layer.cacheKey(config, data)}` : base;
    const paint = (lctx: CanvasRenderingContext2D) =>
      layer.draw({
        ctx: lctx,
        width,
        height,
        config,
        data,
        rng: createRng(config.seed + '_' + layer.name),
      });

    if (cache) {
      ctx.drawImage(await cache.resolve(layer.name, key, bufW, bufH, dpr, paint), 0, 0);
    } else {
      const oc = new OffscreenCanvas(bufW, bufH);
      const lctx = oc.getContext('2d') as unknown as CanvasRenderingContext2D;
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await paint(lctx);
      ctx.drawImage(oc, 0, 0);
      oc.width = 0;
      oc.height = 0;
    }
  }
}

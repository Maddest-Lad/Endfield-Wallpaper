import type { WallpaperConfig } from './types';
import { renderPipeline } from '@core/render/pipeline';
import { createLayerCache } from '@core/render/layerCache';
import { endfieldPipeline } from './pipeline';

/** Cache for the live preview. Export renders one-shot and shares nothing with it. */
const previewCache = createLayerCache();

export async function renderWallpaper(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: WallpaperConfig,
  dpr: number = 1,
): Promise<void> {
  await renderPipeline(endfieldPipeline, canvas, config, dpr, previewCache);
}

/**
 * Render at full resolution without touching the preview cache. Caching a 4K
 * render buys nothing (it happens once) and would evict every preview-sized
 * layer, forcing a full re-render on the next interaction.
 */
export async function renderWallpaperOnce(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: WallpaperConfig,
): Promise<void> {
  await renderPipeline(endfieldPipeline, canvas, config, 1, null);
}

export function disposeRenderCaches(): void {
  previewCache.dispose();
  endfieldPipeline.disposeDerived?.();
}

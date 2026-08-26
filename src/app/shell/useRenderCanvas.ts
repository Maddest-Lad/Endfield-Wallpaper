import { useEffect, useRef, useCallback, useState } from 'react';
import type { BaseConfig, Pipeline } from '@core/project/types';
import { renderPipeline } from '@core/render/pipeline';
import type { LayerCache } from '@core/render/layerCache';

/** Preview renders are capped on the longest axis for performance. */
const MAX_PREVIEW = 2048;

/**
 * Drive a canvas from a project's pipeline, fitted to its container.
 *
 * The preview shows exactly what the export produces, scaled down — layer layout
 * is resolution-relative by design, so it is rendered at preview dimensions
 * rather than rendered large and downscaled.
 *
 * Returns whether a render is currently in flight.
 */
export function useRenderCanvas<C extends BaseConfig, D>(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerSize: { w: number; h: number } | null,
  pipeline: Pipeline<C, D>,
  config: C,
  cache: LayerCache,
): boolean {
  const [rendering, setRendering] = useState(false);
  const setRenderingRef = useRef(setRendering);
  setRenderingRef.current = setRendering;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const renderingRef = useRef(false);
  const dirtyRef = useRef(false);
  const doRenderRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerSize) return;

    if (renderingRef.current) {
      dirtyRef.current = true;
      return;
    }

    renderingRef.current = true;
    try {
      const dpr = window.devicePixelRatio || 1;
      const aspect = config.width / config.height;
      let cssW: number, cssH: number;

      if (containerSize.w / containerSize.h > aspect) {
        // Container is wider than config — height-constrained
        cssH = Math.floor(containerSize.h);
        cssW = Math.floor(cssH * aspect);
      } else {
        // Container is taller than config — width-constrained
        cssW = Math.floor(containerSize.w);
        cssH = Math.floor(cssW / aspect);
      }

      const longest = Math.max(cssW, cssH);
      const renderScale = longest > MAX_PREVIEW ? MAX_PREVIEW / longest : 1;

      await renderPipeline(
        pipeline,
        canvas,
        { ...config, width: Math.floor(cssW * renderScale), height: Math.floor(cssH * renderScale) },
        dpr,
        cache,
      );

      // CSS size matches the fitted dimensions — no stretching
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    } finally {
      renderingRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setTimeout(() => doRenderRef.current?.(), 0);
      } else {
        setRenderingRef.current(false);
      }
    }
  }, [canvasRef, containerSize, pipeline, config, cache]);

  // Always point to the latest doRender so the dirty-flag retry uses current
  // config values instead of a stale closure.
  doRenderRef.current = doRender;

  useEffect(() => {
    setRendering(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Yield a frame so React can paint the loading indicator before the
      // synchronous render blocks the main thread.
      await new Promise((r) => requestAnimationFrame(r));
      await doRender();
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [doRender]);

  return rendering;
}

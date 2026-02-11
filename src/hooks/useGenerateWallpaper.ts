import { useEffect, useRef, useCallback, useState } from 'react';
import { useWallpaperConfig } from './useWallpaperConfig';
import { renderWallpaper } from '../engine/renderer';
import { updateUrlHash } from '../utils/permalink';
import type { WallpaperConfig } from '../engine/types';

export function useGenerateWallpaper(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerSize: { w: number; h: number } | null,
): boolean {
  const {
    width,
    height,
    preset,
    theme,
    accentColor,
    seed,
    noiseScale,
    octaves,
    persistence,
    lacunarity,
    contourLevels,

    contourColorMode,
    contourGlow,
    contourColor,
    showGrid,
    showAnnotations,
    showCjkText,
    showFrames,
    showAccents,
    showScanLines,
    showDataPanel,
    showReticles,
    showCornerData,
    showZones,
    showHeroText,
  } = useWallpaperConfig();

  const [rendering, setRendering] = useState(false);
  const setRenderingRef = useRef(setRendering);
  setRenderingRef.current = setRendering;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const renderingRef = useRef(false);
  const dirtyRef = useRef(false);
  const doRenderRef = useRef<() => Promise<void>>();

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !containerSize) return;

    if (renderingRef.current) {
      dirtyRef.current = true;
      return;
    }

    renderingRef.current = true;
    try {
      const config: WallpaperConfig = {
        width,
        height,
        preset,
        theme,
        accentColor,
        seed,
        noiseScale,
        octaves,
        persistence,
        lacunarity,
        contourLevels,

        contourColorMode,
        contourGlow,
        contourColor,
        showGrid,
        showAnnotations,
        showCjkText,
        showFrames,
        showAccents,
        showScanLines,
        showDataPanel,
        showReticles,
        showCornerData,
        showZones,
        showHeroText,
      };

      // Preview fills the container, decoupled from export aspect ratio.
      // Export still renders at the exact configured resolution.
      const dpr = window.devicePixelRatio || 1;

      // Render at a capped resolution for performance, but CSS-fill the container.
      const MAX_PREVIEW = 1200;
      const longest = Math.max(containerSize.w, containerSize.h);
      const renderScale = longest > MAX_PREVIEW ? MAX_PREVIEW / longest : 1;
      const renderW = Math.floor(containerSize.w * renderScale);
      const renderH = Math.floor(containerSize.h * renderScale);

      const previewConfig: WallpaperConfig = {
        ...config,
        width: renderW,
        height: renderH,
      };

      await renderWallpaper(canvas, previewConfig, dpr);

      // CSS fills the container; slight upscale on large displays is fine for a preview
      canvas.style.width = `${Math.floor(containerSize.w)}px`;
      canvas.style.height = `${Math.floor(containerSize.h)}px`;

      // Silently update URL hash for permalink sharing
      updateUrlHash(config);
    } finally {
      renderingRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setTimeout(() => doRenderRef.current?.(), 0);
      } else {
        setRenderingRef.current(false);
      }
    }
  }, [
    canvasRef,
    containerSize,
    width,
    height,
    preset,
    theme,
    accentColor,
    seed,
    noiseScale,
    octaves,
    persistence,
    lacunarity,
    contourLevels,

    contourColorMode,
    contourGlow,
    contourColor,
    showGrid,
    showAnnotations,
    showCjkText,
    showFrames,
    showAccents,
    showScanLines,
    showDataPanel,
    showReticles,
    showCornerData,
    showZones,
    showHeroText,
  ]);

  // Always point to the latest doRender so the dirty-flag retry
  // uses current config values instead of a stale closure.
  doRenderRef.current = doRender;

  useEffect(() => {
    setRendering(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // Yield a frame so React can paint the loading indicator
      // before the synchronous render blocks the main thread.
      await new Promise((r) => requestAnimationFrame(r));
      await doRender();
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [doRender]);

  return rendering;
}

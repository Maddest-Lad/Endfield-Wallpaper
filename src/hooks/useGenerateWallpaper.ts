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
    logoVariant,
    logoScale,
    logoOpacity,
    logoColor,
  } = useWallpaperConfig();

  const [rendering, setRendering] = useState(false);
  const setRenderingRef = useRef(setRendering);
  setRenderingRef.current = setRendering;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hiresRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const renderingRef = useRef(false);
  const dirtyRef = useRef(false);
  const doRenderRef = useRef<(maxPreview: number) => Promise<void>>();

  const MAX_FAST = 1200;
  const MAX_HIRES = 2048;

  const doRender = useCallback(async (maxPreview: number) => {
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
        logoVariant,
        logoScale,
        logoOpacity,
        logoColor,
      };

      // Preview shows exactly what the export will produce, scaled to fit
      // the container while preserving the configured aspect ratio.
      const dpr = window.devicePixelRatio || 1;
      const aspect = width / height;
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

      // Cap render resolution for performance (preview only)
      const longest = Math.max(cssW, cssH);
      const renderScale = longest > maxPreview ? maxPreview / longest : 1;
      const renderW = Math.floor(cssW * renderScale);
      const renderH = Math.floor(cssH * renderScale);

      const previewConfig: WallpaperConfig = {
        ...config,
        width: renderW,
        height: renderH,
      };

      await renderWallpaper(canvas, previewConfig, dpr);

      // CSS size matches the fitted dimensions — no stretching
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      // Silently update URL hash for permalink sharing
      updateUrlHash(config);
    } finally {
      renderingRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setTimeout(() => doRenderRef.current?.(maxPreview), 0);
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
    logoVariant,
    logoScale,
    logoOpacity,
    logoColor,
  ]);

  // Always point to the latest doRender so the dirty-flag retry
  // uses current config values instead of a stale closure.
  doRenderRef.current = doRender;

  useEffect(() => {
    setRendering(true);
    clearTimeout(debounceRef.current);
    clearTimeout(hiresRef.current);
    debounceRef.current = setTimeout(async () => {
      // Yield a frame so React can paint the loading indicator
      // before the synchronous render blocks the main thread.
      await new Promise((r) => requestAnimationFrame(r));
      await doRender(MAX_FAST);

      // Schedule a hi-res upgrade after 2s of idle
      clearTimeout(hiresRef.current);
      hiresRef.current = setTimeout(async () => {
        await new Promise((r) => requestAnimationFrame(r));
        await doRenderRef.current?.(MAX_HIRES);
      }, 2000);
    }, 150);
    return () => {
      clearTimeout(debounceRef.current);
      clearTimeout(hiresRef.current);
    };
  }, [doRender]);

  return rendering;
}

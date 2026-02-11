import { useEffect, useRef, useCallback } from 'react';
import { useWallpaperConfig } from './useWallpaperConfig';
import { renderWallpaper } from '../engine/renderer';
import { updateUrlHash } from '../utils/permalink';
import type { WallpaperConfig } from '../engine/types';

export function useGenerateWallpaper(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerSize: { w: number; h: number } | null,
) {
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

      // Fit the wallpaper aspect ratio into the available container space.
      // The container already accounts for padding via its content rect.
      const dpr = window.devicePixelRatio || 1;
      const aspect = width / height;
      let cssW: number, cssH: number;

      if (containerSize.w / containerSize.h > aspect) {
        // Container is wider than wallpaper — height-constrained
        cssH = Math.floor(containerSize.h);
        cssW = Math.floor(cssH * aspect);
      } else {
        // Container is taller than wallpaper — width-constrained
        cssW = Math.floor(containerSize.w);
        cssH = Math.floor(cssW / aspect);
      }

      // Never render larger than the actual wallpaper resolution
      if (cssW > width || cssH > height) {
        cssW = width;
        cssH = height;
      }

      const previewConfig: WallpaperConfig = {
        ...config,
        width: cssW,
        height: cssH,
      };

      await renderWallpaper(canvas, previewConfig, dpr);

      // Pin CSS size to exact logical dimensions — pixel-perfect, no stretching
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      // Silently update URL hash for permalink sharing
      updateUrlHash(config);
    } finally {
      renderingRef.current = false;
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setTimeout(() => doRenderRef.current?.(), 0);
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
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doRender, 150);
    return () => clearTimeout(debounceRef.current);
  }, [doRender]);
}

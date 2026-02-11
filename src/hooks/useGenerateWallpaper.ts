import { useEffect, useRef, useCallback } from 'react';
import { useWallpaperConfig } from './useWallpaperConfig';
import { renderWallpaper } from '../engine/renderer';
import { updateUrlHash } from '../utils/permalink';
import type { WallpaperConfig } from '../engine/types';

export function useGenerateWallpaper(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
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

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || renderingRef.current) return;

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

      // For preview, render at logical size that fits the viewport,
      // then scale the buffer by devicePixelRatio for sharp HiDPI output
      const dpr = window.devicePixelRatio || 1;
      const maxPreviewDim = 1200;
      const scale = Math.min(1, maxPreviewDim / Math.max(width, height));

      const previewConfig: WallpaperConfig = {
        ...config,
        width: Math.round(width * scale),
        height: Math.round(height * scale),
      };

      await renderWallpaper(canvas, previewConfig, dpr);

      // Pin the CSS size to logical dimensions so the buffer isn't stretched
      canvas.style.width = `${previewConfig.width}px`;
      canvas.style.height = `${previewConfig.height}px`;

      // Silently update URL hash for permalink sharing
      updateUrlHash(config);
    } finally {
      renderingRef.current = false;
    }
  }, [
    canvasRef,
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

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(doRender, 150);
    return () => clearTimeout(debounceRef.current);
  }, [doRender]);
}

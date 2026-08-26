import type { WallpaperConfig, ResolutionPreset } from './types';
import { randomSeed } from '@core/utils/random';

function getDefaultResolution(): { width: number; height: number; preset: ResolutionPreset } {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(screen.width * dpr);
  const h = Math.round(screen.height * dpr);
  if (w >= 100 && h >= 100) {
    return { width: w, height: h, preset: 'device' };
  }
  return { width: 1920, height: 1080, preset: '1080p' };
}

/**
 * Built lazily: reads screen/devicePixelRatio and rolls a fresh seed, neither of
 * which may happen at module-eval time.
 */
export function createDefaults(): WallpaperConfig {
  return {
    ...getDefaultResolution(),
    theme: 'dark',
    accentColor: '#FFE600',
    seed: randomSeed(),
    noiseScale: 0.006,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    contourLevels: 20,
    contourColorMode: 'mono',
    contourGlow: 0,
    contourColor: '#888888',
    edgePadding: 0,
    logoVariant: 'none',
    logoScale: 0.3,
    logoOpacity: 0.15,
    logoColor: '',
    showGrid: true,
    showAnnotations: true,
    showCjkText: true,
    showFrames: true,
    showAccents: true,
    showScanLines: true,
    showDataPanel: true,
    showReticles: true,
    showCornerData: true,
    showZones: true,
    showHeroText: false,
  };
}

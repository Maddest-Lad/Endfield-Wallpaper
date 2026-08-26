import type { WallpaperConfig, ContourColorMode } from './types';
import { randomSeed } from '@core/utils/random';
import { ACCENT_COLORS } from './colors';

const CONTOUR_MODES: ContourColorMode[] = ['mono', 'elevation', 'fade'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Re-roll the look. Uses Math.random deliberately: this produces a *config*, not
 * pixels — the render itself stays fully reproducible from the resulting seed.
 * Resolution is preserved.
 */
export function randomizeEndfield(): Partial<WallpaperConfig> {
  const color = pick(ACCENT_COLORS);
  return {
    seed: randomSeed(),
    noiseScale: 0.003 + Math.random() * 0.01,
    octaves: 3 + Math.floor(Math.random() * 3),
    persistence: 0.35 + Math.random() * 0.3,
    contourLevels: 14 + Math.floor(Math.random() * 16),
    theme: Math.random() > 0.5 ? ('dark' as const) : ('light' as const),
    accentColor: color,
    contourColor: color,
    contourColorMode: pick(CONTOUR_MODES),
    contourGlow: Math.random() > 0.6 ? Math.round(Math.random() * 100) / 100 : 0,
    showGrid: Math.random() > 0.3,
    showAnnotations: Math.random() > 0.3,
    showCjkText: Math.random() > 0.4,
    showFrames: Math.random() > 0.2,
    showAccents: Math.random() > 0.3,
    showScanLines: Math.random() > 0.5,
    showDataPanel: Math.random() > 0.4,
    showReticles: Math.random() > 0.4,
    showCornerData: Math.random() > 0.4,
    showZones: Math.random() > 0.4,
    showHeroText: Math.random() > 0.7,
    edgePadding: Math.random() > 0.6 ? Math.round(Math.random() * 30) / 200 : 0,
  };
}

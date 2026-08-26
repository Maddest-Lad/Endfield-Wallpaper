import type { RenderContext as CoreRenderContext } from '@core/project/types';
import type { EndfieldData } from './derive';
import type { ResolutionPreset } from '@core/output/resolutions';

export type ThemeMode = 'light' | 'dark';

export type { ResolutionPreset } from '@core/output/resolutions';

export type ContourColorMode = 'mono' | 'elevation' | 'fade';

export interface WallpaperConfig {
  // Resolution
  width: number;
  height: number;
  preset: ResolutionPreset;

  // Theme
  theme: ThemeMode;
  accentColor: string;

  // Noise parameters
  seed: string;
  noiseScale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  contourLevels: number;
  contourColorMode: ContourColorMode;
  contourGlow: number;
  contourColor: string;

  // Logo overlay
  logoVariant: string;
  logoScale: number;
  logoOpacity: number;
  logoColor: string;

  // Edge padding (0–0.15 fraction of width, pushes frames/accents inward)
  edgePadding: number;

  // Toggles
  showGrid: boolean;
  showAnnotations: boolean;
  showCjkText: boolean;
  showFrames: boolean;
  showAccents: boolean;
  showScanLines: boolean;
  showDataPanel: boolean;
  showReticles: boolean;
  showCornerData: boolean;
  showZones: boolean;
  showHeroText: boolean;
}

export interface ContourData {
  value: number;
  coordinates: number[][][][];
}

export interface ThemePalette {
  background: string;
  contourLine: string;
  contourIndex: string;
  gridMajor: string;
  gridMinor: string;
  gridLabel: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  frameLine: string;
}

/**
 * Endfield's instantiation of the core render context. Derived terrain data and
 * the palette live under `rc.data` (see EndfieldData in ./derive).
 */
export type RenderContext = CoreRenderContext<WallpaperConfig, EndfieldData>;

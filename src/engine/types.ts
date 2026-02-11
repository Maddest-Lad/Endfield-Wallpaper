export type ThemeMode = 'light' | 'dark';

export type ResolutionPreset = '1080p' | '1440p' | '4k' | 'ultrawide' | 'custom';

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

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  config: WallpaperConfig;
  contourData: ContourData[];
  heightmap: Float64Array;
  gridWidth: number;
  gridHeight: number;
  rng: () => number;
  palette: ThemePalette;
}

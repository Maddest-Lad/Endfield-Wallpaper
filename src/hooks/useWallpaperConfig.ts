import { create } from 'zustand';
import type { WallpaperConfig, ResolutionPreset } from '../engine/types';
import { randomSeed } from '../utils/random';

const RESOLUTION_PRESETS: Record<ResolutionPreset, { width: number; height: number } | null> = {
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
  phone: { width: 1170, height: 2532 },
  ultrawide: { width: 3440, height: 1440 },
  custom: null,
};

interface WallpaperStore extends WallpaperConfig {
  setConfig: (partial: Partial<WallpaperConfig>) => void;
  setPreset: (preset: ResolutionPreset) => void;
  randomize: () => void;
}

export const useWallpaperConfig = create<WallpaperStore>((set) => ({
  // Resolution
  width: 1920,
  height: 1080,
  preset: '1080p',

  // Theme
  theme: 'light',
  accentColor: '#FFE600',

  // Noise
  seed: randomSeed(),
  noiseScale: 0.006,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  contourLevels: 20,
  paperGrain: 0.03,

  // Toggles
  showGrid: true,
  showAnnotations: true,
  showCjkText: true,
  showFrames: true,
  showAccents: true,
  showScanLines: true,
  showDataPanel: true,
  showReticles: true,
  showCornerData: true,
  showHeroText: false,

  setConfig: (partial) => set(partial),

  setPreset: (preset) =>
    set(() => {
      const res = RESOLUTION_PRESETS[preset];
      if (res) {
        return { preset, width: res.width, height: res.height };
      }
      return { preset };
    }),

  randomize: () =>
    set({
      seed: randomSeed(),
      noiseScale: 0.003 + Math.random() * 0.01,
      octaves: 3 + Math.floor(Math.random() * 3),
      persistence: 0.35 + Math.random() * 0.3,
      contourLevels: 14 + Math.floor(Math.random() * 16),
    }),
}));

import { create } from 'zustand';
import type { WallpaperConfig, ResolutionPreset } from '../engine/types';
import { randomSeed } from '../utils/random';
import { PRESETS } from '../data/presets';
import { decodeConfig } from '../utils/permalink';

const RESOLUTION_PRESETS: Record<ResolutionPreset, { width: number; height: number } | null> = {
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
  phone: { width: 1170, height: 2532 },
  ultrawide: { width: 3440, height: 1440 },
  custom: null,
};

const DEFAULTS: WallpaperConfig = {
  width: 1920,
  height: 1080,
  preset: '1080p',
  theme: 'light',
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
};

function getInitialConfig(): WallpaperConfig {
  const fromHash = decodeConfig(window.location.hash);
  return fromHash ?? DEFAULTS;
}

interface WallpaperStore extends WallpaperConfig {
  setConfig: (partial: Partial<WallpaperConfig>) => void;
  setPreset: (preset: ResolutionPreset) => void;
  randomize: () => void;
  applyPreset: (name: string) => void;
}

const initialConfig = getInitialConfig();

export const useWallpaperConfig = create<WallpaperStore>((set) => ({
  ...initialConfig,

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

  applyPreset: (name) =>
    set(() => {
      const preset = PRESETS.find((p) => p.name === name);
      if (!preset) return {};
      return { ...preset.config, seed: randomSeed() };
    }),
}));
